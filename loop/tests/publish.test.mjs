/**
 * Task 7.2 — the merge's publish step.
 *
 * specs/loop requires the loop to publish "through the same publish step the
 * Pulse uses". Same, not equivalent: a second implementation would drift, and
 * the drifted one would be the one that pushed. So this file checks the
 * handoff itself, against the real shared step in this repository — the cheap
 * direct check, rather than a fixture that would have passed even if the two
 * had never been wired together.
 *
 * `publish` was false throughout the build phase, so exercising the real step
 * here could not push anything: the flag is the shared step's to read, and it
 * printed one skip line and returned.
 *
 * ## That assumption expired on 2026-08-29
 *
 * The maintainer set `publish: true` in `data/config.json` when the site went
 * live. The second test below calls the real shared step with the **real**
 * repository root, and the shared step reads the flag itself — deliberately, so
 * that there is only ever one reading of it (`loop/lib/publish.mjs` does not
 * forward `cfg` to it). With the flag true, that call takes the true path:
 * `git push origin main` against the live remote, a ten-minute poll, and a
 * `HOLD.md` written into this repository. It did exactly that on 2026-08-29,
 * observed in a `npm test` run.
 *
 * Nothing was published — no commit was created, because the step stages only
 * `data content public` and the working tree matched HEAD there, so the push
 * was a no-op — but `npm test` is not allowed to be a command that can push at
 * all. The repository's hard rule is that nothing reaches the remote until the
 * maintainer lifts it personally.
 *
 * So that test is **guarded, not deleted**: it runs when the flag is false, and
 * refuses to run the real path when it is true, naming why. Restoring the
 * coverage under `publish: true` needs a decision this file cannot make on its
 * own — the shared step owns the flag by design, and the honest options
 * (forward an override, or point the handoff at a throwaway root that has no
 * shared step to find) each trade away part of what the test is for. Filed as
 * `addictedtoai-64y`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { DEFAULT_REPO_ROOT, makeContext } from '../lib/paths.mjs';
import { findSharedStep, publishStep, FALLBACK_SKIP_LINE } from '../lib/publish.mjs';
import { makeRepo } from './helpers.mjs';

/** Is the real repository armed to publish? Read at run time, never cached. */
function realRepoPublishes() {
  try {
    return JSON.parse(readFileSync(join(DEFAULT_REPO_ROOT, 'data', 'config.json'), 'utf8')).publish === true;
  } catch {
    // No readable config is not a licence to push.
    return true;
  }
}

test('the loop finds the Pulse\'s shared publish step where it actually lives', () => {
  const found = findSharedStep(DEFAULT_REPO_ROOT);
  assert.ok(found, 'no shared publish step found — the loop would refuse to publish rather than improvise');
  assert.ok(existsSync(found));
  assert.match(found.replace(/\\/g, '/'), /pulse\/(lib\/)?publish\.mjs$/);
});

test('the loop hands off to the real shared step, which prints its own skip line', async (t) => {
  if (realRepoPublishes()) {
    t.skip(
      'data/config.json has publish: true, so calling the real shared step against the real ' +
        'repository root would run `git push origin main` against the live remote and write ' +
        'HOLD.md. Observed on 2026-08-29. See this file’s header and addictedtoai-64y.',
    );
    return;
  }
  const lines = [];
  const ctx = makeContext({ log: (s) => lines.push(s) });
  const res = await publishStep(ctx, {});
  assert.equal(res.published, false);
  const text = lines.join('\n');
  assert.match(text, /publish/);
  assert.match(text, /disabled|publish: false/i, text);
  // and it is the shared step's line, not the loop's own fallback
  assert.ok(!text.includes(FALLBACK_SKIP_LINE), 'the loop must not print its own skip line when the shared step exists');
});

test('with no shared step present, the loop prints the skip line and never improvises a push', async () => {
  const ctx = makeRepo({});
  assert.equal(findSharedStep(ctx.repoRoot), null);
  const skipped = await publishStep(ctx, { cfg: { publish: false } });
  assert.equal(skipped.skipped, true);
  assert.match(ctx.output(), /publishing is disabled/);

  const refused = await publishStep(ctx, { cfg: { publish: true } });
  assert.equal(refused.published, false);
  assert.match(ctx.output(), /publish: REFUSED/);
  assert.match(ctx.output(), /Refusing to improvise one/);
  ctx.cleanup();
});
