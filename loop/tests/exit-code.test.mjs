/**
 * exit-code.test.mjs — addictedtoai-1yt.
 *
 * The Desk reaches `publishStep`, which fetches the live `/status.json`
 * build stamp (`pulse/lib/publish.mjs` `fetchLiveStamp`). On Windows,
 * `process.exit()` called by a process that has used `fetch` can die on
 *
 *   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c
 *
 * exiting 3221226505 (0xC0000409, STATUS_STACK_BUFFER_OVERRUN) instead of the
 * code it asked for — measured for the same defect in `pulse/run.mjs`
 * (addictedtoai-9bh). `loop/run.mjs` is worse: it passes a MEANINGFUL exit
 * code through (0 done, 1 refused/error, ...), so the assertion does not just
 * flip success to failure, it erases which outcome happened.
 *
 * Asserted STRUCTURALLY on purpose, matching the precedent in
 * `pulse/tests/zero-model.test.mjs` ("verify-zero-model.mjs cannot publish").
 * The obvious behavioural test — actually run the Desk and read its exit code
 * — has an unacceptable failure mode: a real run reaches `executeJob` and, on
 * an approved job, `publishStep`, which pushes to `origin main` and deploys
 * the live site. A check whose red path is a live deploy is the defect, not
 * the detector. This repository's own rule: do not write a behavioural test
 * whose failure mode is a deploy.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOOP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RUN_SRC = readFileSync(join(LOOP, 'run.mjs'), 'utf8');

/**
 * `RUN_SRC` with `//` line comments and `/* *\/` block comments blanked out
 * (replaced with spaces, so line/column positions and any surviving match
 * offsets are unaffected). This file's own explanatory comments — like
 * `pulse/run.mjs`'s before it — legitimately spell out `process.exit(` in
 * prose while explaining why the code must not call it; a blanket source
 * check has to look past that prose to the actual code, the same way a
 * reader does. Safe for this file specifically: it contains no `//` inside a
 * string or template literal (checked — the one place a URL could produce
 * one, the status endpoint, is written without a protocol prefix).
 */
function withoutComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));
}
const RUN_CODE = withoutComments(RUN_SRC);

test('loop/run.mjs does not call process.exit() on its top-level entry path', () => {
  // The pre-fix line, which must never come back: `process.exit()` after
  // `main()` resolves is exactly the crash this issue is about. Matched
  // loosely (any whitespace/argument) so a reformatted reintroduction still
  // trips it, not just the byte-identical old line.
  assert.doesNotMatch(
    RUN_CODE,
    /main\(\)\.then\(\s*\(?\s*code\s*\)?\s*=>\s*process\.exit\(/,
    'process.exit(code) must not be called after main() resolves — a process that has used fetch ' +
      'can die on Windows with 0xC0000409 instead of exiting with the code main() returned (addictedtoai-1yt)',
  );
  // Nowhere else in the file's CODE either (comments stripped, so this file's
  // own explanation of the bug does not trip its own guard) — the issue's own
  // line-number reference had already drifted once (762 -> 1053) by the time
  // this was fixed, so the guard checks the whole file rather than a fixed
  // location.
  assert.doesNotMatch(
    RUN_CODE,
    /process\.exit\(/,
    'loop/run.mjs must contain no process.exit() call at all — the top-level entry point is the only ' +
      'place this file ever exited from, and it must drain instead',
  );
});

test('loop/run.mjs ends by setting process.exitCode and letting the event loop drain', () => {
  assert.match(
    RUN_SRC,
    /main\(\)\.then\(\s*\(?\s*code\s*\)?\s*=>\s*\{\s*process\.exitCode\s*=\s*code;?\s*\}\s*\)/,
    'the fix, as applied to pulse/run.mjs for addictedtoai-9bh: set process.exitCode and return, ' +
      'rather than tearing the libuv loop down synchronously with process.exit()',
  );
});

test('the only process.exit() in loop/ that is reachable after a fetch is the one this file just proved absent', () => {
  // Confirms the enumeration this fix depended on, so a future fetch call
  // added to loop/run.mjs's own module (as opposed to pulse/lib/publish.mjs,
  // which loop/lib/publish.mjs calls into and which is covered by pulse's own
  // zero-model / publish tests) does not silently reintroduce the hazard.
  assert.doesNotMatch(RUN_SRC, /\bfetch\s*\(/, 'loop/run.mjs must not call fetch() directly — the only fetch reachable from a Desk run is pulse/lib/publish.mjs fetchLiveStamp, bounded by AbortSignal.timeout and awaited');
});
