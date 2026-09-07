/**
 * job-gate-set.test.mjs — what a Desk job's merge gate actually runs
 * (beads addictedtoai-one6).
 *
 * ## The defect
 *
 * `runGates` defaulted to `scripts: ['test', 'build']`, so a job branch was
 * gated by `npm test` and `npm run build` and by nothing else. With
 * `publish: true` the merge is followed by a push, so a job could merge and
 * PUBLISH content that fails a gate the push bar names.
 *
 * Measured, not hypothetical: on 2026-09-03 job `j-20260903-15` merged with
 * `gates: PASS`, published at `077ffcd5`, and the next human-initiated gate run
 * failed
 *
 *     FAIL  every dateModified equals that URL's <lastmod> in sitemap.xml
 *           /blog/glm-5-3-license-revenue-gate: graph 2026-09-03 vs sitemap 2026-09-02
 *
 * — a `verify-surfaces` check. The job did nothing wrong; the site was live
 * with a failing gate for as long as it took a person to look.
 *
 * ## What these tests measure
 *
 * That the two content-shaped verifications are in the per-job set, that they
 * run as REAL child processes in the worktree (not as npm scripts —
 * `package.json` has no `verify:design`/`verify:surfaces` entries and is a file
 * this repository does not edit), that a failing one FAILS the gate run, and
 * that a missing one is a failure rather than a silent skip.
 *
 * The gate scripts here are real files the fixture writes and a real `node`
 * runs. Nothing is stubbed at the `runGates` boundary: stubbing the gate result
 * would test the assertion against itself.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  runGates,
  DEFAULT_GATES,
  NODE_GATES,
  gateCommand,
  gateCommandForName,
  gateFailureNote,
} from '../lib/gates.mjs';
import { makeRepo } from './helpers.mjs';

/** A worktree-shaped directory with a package.json and whichever gate files are asked for. */
function gateTree(ctx, { scripts = {}, files = {} } = {}) {
  const dir = join(ctx.testRoot, 'gate-tree');
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'gate-fixture', private: true, scripts }, null, 2) + '\n',
    'utf8',
  );
  for (const [p, c] of Object.entries(files)) writeFileSync(join(dir, p), c, 'utf8');
  return dir;
}

const PASSES = 'process.exit(0);\n';
const FAILS = 'process.stdout.write("a content-shaped defect\\n"); process.exit(1);\n';
const BOTH_PASS = {
  'scripts/verify-surfaces.mjs': PASSES,
  'scripts/verify-design.mjs': PASSES,
};
const NPM_OK = { test: 'node --version', build: 'node --version' };

test('THE PER-JOB GATE SET NAMES verify-surfaces AND verify-design, AFTER the build', () => {
  // Order is load-bearing and not incidental: both check the exported site in
  // `out/`, which only exists once `build` has run.
  assert.deepEqual(DEFAULT_GATES, ['test', 'build', 'verify-surfaces', 'verify-design']);
});

test('both verify gates really run, as node scripts rather than npm scripts', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const dir = gateTree(ctx, { scripts: NPM_OK, files: BOTH_PASS });

  const r = runGates(ctx, dir, { timeoutMs: 120000 });

  assert.equal(r.ok, true, r.output);
  assert.deepEqual(
    r.results.map((x) => x.script),
    ['test', 'build', 'verify-surfaces', 'verify-design'],
    'all four gates ran, in order',
  );
  // `package.json` carries no `verify:design`/`verify:surfaces` script and never
  // will — this repository does not edit `package.json` — so the command a
  // reader would paste has to be the node invocation, not an npm one.
  const surfaces = r.results.find((x) => x.script === 'verify-surfaces');
  assert.match(gateCommand(surfaces), /^node scripts\/verify-surfaces\.mjs out$/);
  assert.match(r.output, /--- node scripts\/verify-design\.mjs out \d+ \(PASS\)/, r.output);
});

test('A FAILING verify-surfaces FAILS THE GATE RUN — the escape this closes', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const dir = gateTree(ctx, {
    scripts: NPM_OK,
    files: { 'scripts/verify-surfaces.mjs': FAILS, 'scripts/verify-design.mjs': PASSES },
  });

  const r = runGates(ctx, dir, { timeoutMs: 120000 });

  assert.equal(r.ok, false, 'a branch that fails verify-surfaces must not reach the review gate');
  assert.equal(r.results.at(-1).script, 'verify-surfaces', 'and the run stops there');
  assert.equal(
    r.results.some((x) => x.script === 'verify-design'),
    false,
    'the gates break on the first failure, as they always have',
  );
  assert.match(gateFailureNote(r), /node scripts\/verify-surfaces\.mjs out \(exit 1\)/, gateFailureNote(r));
});

test('A MISSING gate script is a FAILURE, not a silent skip', (t) => {
  // The rule the module is built on — "a gate that cannot RUN is a gate
  // failure, not a pass" — has to hold for the node gates too, or adding them
  // would buy nothing: a repository that lost `scripts/verify-surfaces.mjs`
  // would quietly go back to test+build.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const dir = gateTree(ctx, { scripts: NPM_OK, files: { 'scripts/verify-design.mjs': PASSES } });

  const r = runGates(ctx, dir, { timeoutMs: 120000 });

  assert.equal(r.ok, false);
  const missing = r.results.find((x) => x.script === 'verify-surfaces');
  assert.equal(missing.status, null, 'it could not run');
  assert.match(missing.output, /has no scripts\/verify-surfaces\.mjs/);
  assert.match(missing.output, /gate failure, not a pass/);
  assert.equal(
    r.results.some((x) => x.script === 'verify-design'),
    true,
    'a gate that could not run does not stop the ones after it — only a gate that RAN and failed does',
  );
});

test('verify-design is run with the record suppressed, so a gate never writes data/launch.json', (t) => {
  // A gate is a CHECK; `data/launch.json` is the repository's dated measurement
  // RECORD. Left recording, every gated worktree would end dirty with a
  // branch-local number — and a job that goes on to a revision pass commits its
  // whole worktree with `git add -A`, so that number would MERGE.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  assert.equal(NODE_GATES['verify-design'].env.ATAI_VERIFY_DESIGN_NO_RECORD, '1');

  // Measured rather than asserted from the constant: the child process really
  // sees it.
  const dir = gateTree(ctx, {
    scripts: NPM_OK,
    files: {
      'scripts/verify-surfaces.mjs': PASSES,
      'scripts/verify-design.mjs':
        'import { writeFileSync, mkdirSync } from "node:fs";\n' +
        'mkdirSync("data", { recursive: true });\n' +
        'if (process.env.ATAI_VERIFY_DESIGN_NO_RECORD !== "1") writeFileSync("data/launch.json", "{}\\n");\n',
    },
  });
  rmSync(join(dir, 'data'), { recursive: true, force: true });

  const r = runGates(ctx, dir, { timeoutMs: 120000 });

  assert.equal(r.ok, true, r.output);
  assert.equal(
    existsSync(join(dir, 'data', 'launch.json')),
    false,
    'the gate wrote the measurement record into the job worktree',
  );
});

test('an explicit script list still overrides the default, and old npm-only results still read right', (t) => {
  // `run.mjs` runs `['build']` alone after the merge; that call must not grow
  // two browser gates by accident.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const dir = gateTree(ctx, { scripts: NPM_OK, files: BOTH_PASS });

  const r = runGates(ctx, dir, { scripts: ['build'], timeoutMs: 120000 });

  assert.deepEqual(r.results.map((x) => x.script), ['build']);
  assert.equal(gateCommand({ script: 'build' }), 'npm run build', 'a result with no command reads as it always did');
});

test('a gate NAME alone still resolves to the right command — the ledger only ever kept names', (t) => {
  // `phases[].gates.first_failed` in `data/ledger.jsonl` records gate names,
  // and every line already written carries names. The review brief reads them
  // back and has to render `verify-design` as something a reader can run.
  assert.equal(gateCommandForName('test'), 'npm run test');
  assert.equal(gateCommandForName('build'), 'npm run build');
  assert.equal(gateCommandForName('verify-surfaces'), 'node scripts/verify-surfaces.mjs');
  assert.equal(gateCommandForName('verify-design'), 'node scripts/verify-design.mjs');
});
