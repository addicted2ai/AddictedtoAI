/**
 * brief-closure.test.mjs — the witness for bead 7dmp (P1-9 plus P2-18).
 *
 * `scripts/brief-closure.mjs` judges a brief's Files list against a merge-base
 * diff. The bead wires its CANDIDATE verdict into the merge path, so every
 * property the wiring depends on gets an arm below, found by lookup:
 *
 *   arm 0  — isProductionFile classifies roots, tests, and scaffolding.
 *   arm 1  — a pin present at base and absent at tip in a LISTED file is a
 *            gutted candidate (cls `gutted:<family>`).
 *   arm 1b — a pin surviving to tip is not gutted.
 *   arm 1c — a vanished pin in an UNLISTED file is not gutted (scope matter).
 *   arm 1d — a vanished pin with its family untouched and its file untouched
 *            is not gutted (the impossible-case guard).
 *   arm 2  — test roots cover loop/tests, scripts, AND pulse/tests (live).
 *   arm 3  — --candidates-only exits 0 on scope-misses-alone (still printing
 *            SCOPE) where the default exits 1: scope never refuses the merge.
 *   arm 4  — end-to-end over a throwaway repo: a removed pin in a listed file
 *            exits 1 with a CANDIDATE gutted line in BOTH modes.
 *   arm 5  — the merge-path contract from the other side: review.mjs lists
 *            `closure-candidates` as a DIFF_REFUSAL_CODE.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

import {
  checkClosure,
  findGutted,
  isProductionFile,
  listTestFilesAtTip,
} from '../brief-closure.mjs';
import { DIFF_REFUSAL_CODES, isDiffRefusal } from '../../loop/lib/review.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const INSTRUMENT = resolve(HERE, '..', 'brief-closure.mjs');
const REPO = resolve(HERE, '..', '..');

function git(dir, args) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function throwawayRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'closure-'));
  git(dir, ['init']);
  git(dir, ['config', 'user.email', 't@t']);
  git(dir, ['config', 'user.name', 't']);
  return dir;
}

function commitAll(dir, message) {
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', message]);
  return git(dir, ['rev-parse', 'HEAD']);
}

function runCli(args) {
  const r = spawnSync(process.execPath, [INSTRUMENT, ...args], { encoding: 'utf8' });
  return { status: r.status, stdout: String(r.stdout || '') };
}

const pin = (file, cls = 'enum-set', identifier = 'REISSUE_CODES', touched = false) => ({
  file, start: 1, end: 1, cls, identifier, touched,
});

test('arm 0 — isProductionFile classifies roots, tests, and scaffolding', () => {
  assert.equal(isProductionFile('loop/run.mjs'), true);
  assert.equal(isProductionFile('loop/tests/brief.test.mjs'), false);
  assert.equal(isProductionFile('pulse/tests/derive.test.mjs'), false);
  assert.equal(isProductionFile('RESULT2.md'), false);
  assert.equal(isProductionFile('scripts/brief-closure.mjs'), false);
  assert.equal(isProductionFile('data/ledger.jsonl'), false);
  assert.equal(isProductionFile('scripts/verify-launch.mjs'), true);
});

test('arm 1 — listed pin vanishing at tip is a gutted candidate', () => {
  const gutted = findGutted({
    basePins: [pin('loop/tests/x.test.mjs')],
    tipPins: [],
    listed: new Set(['loop/tests/x.test.mjs']),
    touchedFiles: ['loop/tests/x.test.mjs'],
  });
  assert.equal(gutted.length, 1);
  assert.equal(gutted[0].cls, 'gutted:enum-set');
  assert.equal(gutted[0].touched, true);
});

test('arm 1b — surviving pin is not gutted', () => {
  const p = pin('loop/tests/x.test.mjs');
  assert.deepEqual(findGutted({
    basePins: [p],
    tipPins: [{ ...p }],
    listed: new Set(['loop/tests/x.test.mjs']),
    touchedFiles: ['loop/tests/x.test.mjs'],
  }), []);
});

test('arm 1c — vanished pin in an unlisted file is not gutted', () => {
  assert.deepEqual(findGutted({
    basePins: [pin('loop/tests/x.test.mjs')],
    tipPins: [],
    listed: new Set(['loop/run.mjs']),
    touchedFiles: ['loop/tests/x.test.mjs'],
  }), []);
});

test('arm 1d — vanished pin, family and file both untouched, is not gutted', () => {
  assert.deepEqual(findGutted({
    basePins: [pin('loop/tests/x.test.mjs', 'enum-set', 'REISSUE_CODES', false)],
    tipPins: [],
    listed: new Set(['loop/tests/x.test.mjs']),
    touchedFiles: ['loop/run.mjs'],
  }), []);
});

test('arm 2 — test roots cover loop/tests, scripts, and pulse/tests', () => {
  const files = listTestFilesAtTip(REPO, 'HEAD');
  assert.ok(files.length > 0);
  assert.ok(files.every((f) => f.endsWith('.test.mjs')));
  assert.ok(files.some((f) => f.startsWith('loop/tests/')), 'loop/tests covered');
  assert.ok(files.some((f) => f.startsWith('pulse/tests/')), 'pulse/tests covered');
});

test('arm 3 — scope-misses-alone refuses by default, passes under --candidates-only', () => {
  const dir = throwawayRepo();
  writeFileSync(join(dir, 'loop-tests-probe.txt'), 'x\n');
  const base = commitAll(dir, 'base');
  writeFileSync(join(dir, 'data-note.txt'), 'new\n');
  const tip = commitAll(dir, 'tip');
  const brief = join(dir, 'brief.md');
  writeFileSync(brief, '## Files\n\n- `loop-tests-probe.txt` work.\n');
  const common = ['--brief', brief, '--base', base, '--tip', tip, '--root', dir];
  const dflt = runCli(common);
  assert.equal(dflt.status, 1);
  assert.match(dflt.stdout, /^SCOPE data-note\.txt /m);
  const cand = runCli([...common, '--candidates-only']);
  assert.equal(cand.status, 0);
  assert.match(cand.stdout, /^SCOPE data-note\.txt /m);
  assert.match(cand.stdout, /CLOSURE OK/);
});

test('arm 4 — removed pin in a listed file is a CANDIDATE gutted in both modes', () => {
  const dir = throwawayRepo();
  const testRel = 'loop/tests/pinned.test.mjs';
  mkdirSync(join(dir, 'loop', 'tests'), { recursive: true });
  writeFileSync(join(dir, testRel),
    `import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { REISSUE_CODES } from '../../lib/review.mjs';\ntest('pins', () => {\n  assert.deepEqual([...REISSUE_CODES].sort(), ['a']);\n});\n`);
  const base = commitAll(dir, 'base');
  writeFileSync(join(dir, testRel),
    `import test from 'node:test';\ntest('pins', () => {});\n`);
  const tip = commitAll(dir, 'gut the pin');
  const brief = join(dir, 'brief.md');
  writeFileSync(brief, `## Files\n\n- \`${testRel}\` work.\n`);
  const common = ['--brief', brief, '--base', base, '--tip', tip, '--root', dir];
  for (const extra of [[], ['--candidates-only']]) {
    const r = runCli([...common, ...extra]);
    assert.equal(r.status, 1, `mode ${extra.join(' ') || 'default'}`);
    assert.match(r.stdout, /^CANDIDATE loop\/tests\/pinned\.test\.mjs:\d+ gutted:enum-set /m);
  }
  // And the library return carries the same verdict structurally.
  const result = checkClosure({ briefText: `## Files\n\n- \`${testRel}\` work.\n`, base, tip, root: dir });
  assert.equal(result.gutted.length, 1);
  assert.equal(result.gutted[0].cls, 'gutted:enum-set');
  assert.equal(result.candidates.length, 1);
});

test('arm 5 — closure-candidates is a diff refusal, so it joins revision findings', () => {
  assert.ok(DIFF_REFUSAL_CODES.includes('closure-candidates'));
  assert.equal(isDiffRefusal('closure-candidates'), true);
});
