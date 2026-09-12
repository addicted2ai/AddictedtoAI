/**
 * train-gate-resolution.test.mjs — every frozen gate name resolves
 * (job j-20260912-02, bead addictedtoai-s8nq).
 *
 * ## The defect
 *
 * `TRAIN_GATES` froze six hyphenated names as data while `runGates` resolves
 * each name two ways — a `NODE_GATES` entry run as `node scripts/<file>.mjs`,
 * otherwise an `npm` script of that name after checking the worktree
 * `package.json` — and a name resolving neither way is a fail-closed FAILURE.
 * `package.json` carries `verify:launch` and `verify:analytics` (colons) and
 * is a file this repository does not edit, and `NODE_GATES` covered only
 * `verify-surfaces` and `verify-design`. So the train set passed
 * test/build/surfaces/design and died at the fifth gate on every run, in
 * every worktree, on any commit — the set could not pass by construction —
 * and no test asserted the frozen names resolve, which is why nothing was red
 * before the night the train held.
 *
 * ## What these tests measure
 *
 * That every name in `TRAIN_GATES` (and `DEFAULT_GATES`) resolves through the
 * SAME resolution `runGates` uses — not a reimplementation of it: the arms
 * call `runGates` itself, with only the child process stubbed — so a future
 * rename of a gate on either side breaks this suite instead of the train.
 * The stubbed child is the gate script's effects, never the resolution: file
 * existence, `package.json` lookup, argv shape and the no-record restore all
 * execute for real. One arm runs the two new gates as REAL child processes,
 * the standard `job-gate-set.test.mjs` sets for the first two.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  runGates,
  DEFAULT_GATES,
  TRAIN_GATES,
  NODE_GATES,
  GATE_FLOORS,
  gateCommandForName,
} from '../lib/gates.mjs';
import { makeRepo } from './helpers.mjs';

/** A worktree-shaped directory with a package.json and whichever gate files are asked for. */
function gateTree(ctx, name, { scripts = {}, files = {} } = {}) {
  const dir = join(ctx.testRoot, name);
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'gate-fixture', private: true, scripts }, null, 2) + '\n',
    'utf8',
  );
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, p), c, 'utf8');
  }
  return dir;
}

const PASSES = 'process.exit(0);\n';
const NPM_OK = { test: 'node --version', build: 'node --version' };
const ALL_NODE_FILES = {
  'scripts/verify-surfaces.mjs': PASSES,
  'scripts/verify-design.mjs': PASSES,
  'scripts/verify-launch.mjs': PASSES,
  'scripts/verify-analytics.mjs': PASSES,
};

/** A fake clock: every read advances `step` ms, so every gate lasts exactly `step`. */
function tick(step) {
  let t = 0;
  return () => (t += step);
}

const SPAWN_OK = () => ({ status: 0, stdout: '', stderr: '' });

test('THE FROZEN SIX ALL RESOLVE THROUGH runGates, under the production floors', (t) => {
  // The step clears every production floor including test's 78.7s, so a green
  // run here proves three things at once: each of the six names resolves
  // through runGates' own branches, each carries a declared production floor
  // (a name without one fails closed in enforceGateFloor), and the frozen
  // order is the run order.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const dir = gateTree(ctx, 'gate-tree', { scripts: NPM_OK, files: ALL_NODE_FILES });

  const r = runGates(ctx, dir, {
    scripts: [...TRAIN_GATES],
    floorSet: GATE_FLOORS,
    spawn: SPAWN_OK,
    now: tick(100000),
  });

  assert.equal(r.ok, true, r.output);
  assert.deepEqual(r.results.map((x) => x.script), [...TRAIN_GATES]);
  assert.match(r.results[0].command, /^npm run test/);
  assert.match(r.results[1].command, /^npm run build/);
  for (const g of r.results.slice(2)) {
    assert.match(g.command, new RegExp(`^node scripts/${g.script}\\.mjs`), g.command);
  }

  const d = runGates(ctx, dir, {
    scripts: [...DEFAULT_GATES],
    floorSet: GATE_FLOORS,
    spawn: SPAWN_OK,
    now: tick(100000),
  });
  assert.equal(d.ok, true, d.output);
  assert.deepEqual(d.results.map((x) => x.script), [...DEFAULT_GATES]);
});

test('the two new gates run as REAL child processes with the production argv shape', (t) => {
  // Nothing stubbed at the runGates boundary: real files the fixture writes,
  // a real node runs them. This proves the argv each entry builds is an
  // invocation the script accepts — `out` positionally for analytics — not
  // merely a string that looks right.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const dir = gateTree(ctx, 'gate-tree', { scripts: NPM_OK, files: ALL_NODE_FILES });

  const r = runGates(ctx, dir, { scripts: ['verify-launch', 'verify-analytics'], timeoutMs: 120000 });

  assert.equal(r.ok, true, r.output);
  assert.deepEqual(r.results.map((x) => x.script), ['verify-launch', 'verify-analytics']);
  assert.equal(r.results[0].command, 'node scripts/verify-launch.mjs');
  const port = process.env.LOOP_VERIFY_ANALYTICS_PORT ?? '3212';
  assert.equal(r.results[1].command, `node scripts/verify-analytics.mjs out ${port}`);
});

test('EACH FROZEN NAME WITHOUT RESOLUTION FAILS CLOSED — a rename breaks here', (t) => {
  // One tree per name, each missing exactly that name's resolution: the npm
  // names lose their package.json script, the node names lose their file.
  // runGates must fail the run at that name with the could-not-run finding,
  // never a silent skip.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  for (const missing of TRAIN_GATES) {
    const scripts = { ...NPM_OK };
    const files = { ...ALL_NODE_FILES };
    if (missing === 'test' || missing === 'build') delete scripts[missing];
    else delete files[`scripts/${missing}.mjs`];
    const dir = gateTree(ctx, `gate-tree-${missing}`, { scripts, files });

    const r = runGates(ctx, dir, {
      scripts: [...TRAIN_GATES],
      floorSet: GATE_FLOORS,
      spawn: SPAWN_OK,
      now: tick(100000),
    });

    assert.equal(r.ok, false, `${missing}: a gate that cannot run must fail the run`);
    const hit = r.results.find((x) => x.script === missing);
    assert.ok(hit, `${missing}: the run names the unresolvable gate`);
    assert.equal(hit.status, null, `${missing}: it could not run`);
    assert.match(hit.output, /could not run/, `${missing}: the finding says so`);
    assert.match(hit.output, /gate failure, not a pass/, `${missing}: and fails closed`);
  }
});

test('verify-launch reuses the train build — no --no-build, and a floor that admits reuse', (t) => {
  // Default invocation: the build section RUNS and finds the train build
  // current through hasCurrentBuild (measured 0.34s reuse 2026-09-12 against
  // a 1.07s whole-gate run). `--no-build` would record a SKIP claiming the
  // build went unverified, and would leave the reuse-vs-spawn record nothing
  // to record. And the floor must sit below that ~1s legitimate run: the old
  // 9.9s floor, calibrated on a spawned 39.6s build, would have rejected the
  // reuse the entry exists to take.
  assert.deepEqual(NODE_GATES['verify-launch'].args(), []);
  assert.ok(
    !NODE_GATES['verify-launch'].args().includes('--no-build'),
    'the build section runs; a SKIP would claim the build unverified',
  );
  assert.ok(
    GATE_FLOORS['verify-launch'].floorMs <= 1000,
    `floor ${GATE_FLOORS['verify-launch'].floorMs}ms rejects the measured ~1s legitimate reuse run`,
  );
  assert.match(
    GATE_FLOORS['verify-launch'].note ?? '',
    /reuse/i,
    'the recalibration states which path the floor is set from',
  );
});

test('verify-analytics is a check, not a record — data/launch.json survives the gate', (t) => {
  // The script honours no no-record flag and nothing in scope may add one, so
  // the runner restores the measurement record around the child. The spawn
  // stub below IS the script's write: it overwrites the record and exits 0,
  // and the assertion is on the bytes afterwards.
  assert.deepEqual(NODE_GATES['verify-analytics'].noRecordPaths, ['data/launch.json']);

  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const kept = JSON.stringify({ untouched: true }) + '\n';
  const dir = gateTree(ctx, 'gate-tree', {
    scripts: NPM_OK,
    files: { 'scripts/verify-analytics.mjs': PASSES },
  });
  mkdirSync(join(dir, 'data'), { recursive: true });
  writeFileSync(join(dir, 'data', 'launch.json'), kept, 'utf8');

  const r = runGates(ctx, dir, {
    scripts: ['build', 'verify-analytics'],
    spawn: (command, args) => {
      if (args[0] === 'scripts/verify-analytics.mjs') {
        writeFileSync(join(dir, 'data', 'launch.json'), JSON.stringify({ measured: true }) + '\n', 'utf8');
      }
      return { status: 0, stdout: '', stderr: '' };
    },
    now: tick(5),
  });

  assert.equal(r.ok, true, r.output);
  assert.equal(readFileSync(join(dir, 'data', 'launch.json'), 'utf8'), kept);

  const fresh = gateTree(ctx, 'gate-tree-fresh', {
    scripts: NPM_OK,
    files: { 'scripts/verify-analytics.mjs': PASSES },
  });
  const r2 = runGates(ctx, fresh, {
    scripts: ['verify-analytics'],
    spawn: () => {
      mkdirSync(join(fresh, 'data'), { recursive: true });
      writeFileSync(join(fresh, 'data', 'launch.json'), JSON.stringify({ measured: true }) + '\n', 'utf8');
      return { status: 0, stdout: '', stderr: '' };
    },
    now: tick(5),
  });
  assert.equal(r2.ok, true, r2.output);
  assert.equal(existsSync(join(fresh, 'data', 'launch.json')), false);
});

test('a gate NAME alone still resolves to the right command for all six', () => {
  // `phases[].gates.first_failed` keeps names; the review brief renders them
  // back into something a reader can run.
  assert.equal(gateCommandForName('test'), 'npm run test');
  assert.equal(gateCommandForName('build'), 'npm run build');
  assert.equal(gateCommandForName('verify-surfaces'), 'node scripts/verify-surfaces.mjs');
  assert.equal(gateCommandForName('verify-design'), 'node scripts/verify-design.mjs');
  assert.equal(gateCommandForName('verify-launch'), 'node scripts/verify-launch.mjs');
  assert.equal(gateCommandForName('verify-analytics'), 'node scripts/verify-analytics.mjs');
});
