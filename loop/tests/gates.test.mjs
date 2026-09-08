import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { GATE_FLOORS, MIN_GATE_FLOOR_MS, runGates } from '../lib/gates.mjs';

function gateTree(t, { packageScripts = {}, gateSource = 'process.exit(0);\n' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-gate-floor-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: packageScripts }) + '\n', 'utf8');
  writeFileSync(join(dir, 'scripts', 'verify-surfaces.mjs'), gateSource, 'utf8');
  return dir;
}

test('a successful two millisecond gate below its floor fails with its observation', (t) => {
  const dir = gateTree(t);
  const ticks = [0, 2];
  const result = runGates({ repoRoot: dir }, dir, {
    scripts: ['verify-surfaces'],
    floorSet: GATE_FLOORS,
    spawn: () => ({ status: 0, stdout: '', stderr: '' }),
    now: () => ticks.shift(),
  });

  assert.equal(result.ok, false);
  assert.equal(result.results[0].status, 0, 'the child reported success');
  assert.equal(result.results[0].durationMs, 2);
  assert.match(result.output, /verify-surfaces/);
  assert.match(result.output, /below its declared floor/);
  assert.match(result.output, /observed 2\.0ms/);
  assert.match(result.output, /floor [0-9.]+ms/);
});

test('a real gate that runs longer than its calibrated floor passes', (t) => {
  const dir = gateTree(t, {
    gateSource:
      'const started = Date.now();\n' +
      'while (Date.now() - started < 20) {}\n' +
      'process.exit(0);\n',
  });
  const result = runGates({ repoRoot: dir }, dir, {
    scripts: ['verify-surfaces'],
    floorSet: { 'verify-surfaces': { floorMs: MIN_GATE_FLOOR_MS } },
  });

  assert.equal(result.ok, true, result.output);
  assert.equal(result.results[0].status, 0);
  assert.ok(result.results[0].durationMs >= MIN_GATE_FLOOR_MS);
});

test('a 400ms test gate fails under repository floors and passes only with fixture floors', (t) => {
  const dir = gateTree(t, { packageScripts: { test: 'node gate.mjs' } });
  const run = (floorSet) => {
    const ticks = [0, 400];
    return runGates({ repoRoot: dir }, dir, {
      scripts: ['test'],
      floorSet,
      spawn: () => ({ status: 0, stdout: '', stderr: '' }),
      now: () => ticks.shift(),
    });
  };

  const repository = run(GATE_FLOORS);
  assert.equal(repository.ok, false);
  assert.match(repository.output, /gate test returned below its declared floor/);
  assert.match(repository.output, /floor 78700\.0ms/);

  const fixture = run({ test: { floorMs: MIN_GATE_FLOOR_MS } });
  assert.equal(fixture.ok, true, fixture.output);
});

test('an override below the millisecond tripwire is refused', (t) => {
  const dir = gateTree(t, { packageScripts: { test: 'node gate.mjs' } });

  assert.throws(
    () => runGates({ repoRoot: dir }, dir, {
      scripts: ['test'],
      floorSet: { test: { floorMs: MIN_GATE_FLOOR_MS - 0.1 } },
    }),
    /tripwire minimum/,
  );
});

test('npm gates use cmd.exe /c on Windows without shell mode', (t) => {
  const dir = gateTree(t, { packageScripts: { test: 'node gate.mjs' } });
  const calls = [];
  const ticks = [0, GATE_FLOORS.test.floorMs + 1];
  const result = runGates({ repoRoot: dir }, dir, {
    scripts: ['test'],
    floorSet: GATE_FLOORS,
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0, stdout: '', stderr: '' };
    },
    now: () => ticks.shift(),
  });

  assert.equal(result.ok, true, result.output);
  assert.equal(calls.length, 1);
  if (process.platform === 'win32') {
    assert.equal(calls[0].command, 'cmd.exe');
    assert.ok(calls[0].args.includes('/c'));
  } else {
    assert.equal(calls[0].command, 'npm');
    assert.deepEqual(calls[0].args, ['run', 'test']);
  }
  assert.equal('shell' in calls[0].options, false);
});

test('the build gate removes an old record before the injected spawn', (t) => {
  const dir = gateTree(t, { packageScripts: { build: 'node build.mjs' } });
  const out = join(dir, 'out');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'status.json'), JSON.stringify({
    built_at: '2026-09-08T18:00:00Z',
    commit: 'fixture-head',
    dirty: false,
    stamp: '2026-09-08T18:00:00Z · fixture-head',
  }) + '\n', 'utf8');
  const record = join(out, '.build-stamp.json');
  writeFileSync(record, '{"ok":true}\n', 'utf8');

  let calls = 0;
  const result = runGates({ repoRoot: dir }, dir, {
    scripts: ['build'],
    floorSet: { build: { floorMs: MIN_GATE_FLOOR_MS } },
    now: (() => {
      const ticks = [0, 2];
      return () => ticks.shift();
    })(),
    spawn: () => {
      calls += 1;
      assert.equal(
        existsSync(record),
        false,
        'the old success record is absent when the build child starts',
      );
      return { status: 1, stdout: '', stderr: 'failed' };
    },
  });

  assert.equal(calls, 1);
  assert.equal(result.ok, false);
  assert.equal(existsSync(record), false, 'a failed build leaves no success record');
});

test('the build gate copies status only after exit 0', (t) => {
  const dir = gateTree(t, { packageScripts: { build: 'node build.mjs' } });
  const out = join(dir, 'out');
  mkdirSync(out, { recursive: true });
  const status = {
    built_at: '2026-09-08T18:00:00Z',
    commit: 'fixture-head',
    dirty: false,
    stamp: '2026-09-08T18:00:00Z · fixture-head',
  };
  writeFileSync(join(out, 'status.json'), `${JSON.stringify(status)}\n`, 'utf8');
  const record = join(out, '.build-stamp.json');
  writeFileSync(record, '{"ok":true}\n', 'utf8');

  const failed = runGates({ repoRoot: dir }, dir, {
    scripts: ['build'],
    floorSet: { build: { floorMs: MIN_GATE_FLOOR_MS } },
    now: () => 2,
    spawn: () => ({ status: 1, stdout: '', stderr: 'failed' }),
  });
  assert.equal(failed.ok, false);
  assert.equal(existsSync(record), false, 'a failed build leaves no success record');

  const passed = runGates({ repoRoot: dir }, dir, {
    scripts: ['build'],
    floorSet: { build: { floorMs: MIN_GATE_FLOOR_MS } },
    now: (() => {
      const ticks = [0, 2];
      return () => ticks.shift();
    })(),
    spawn: () => ({ status: 0, stdout: '', stderr: '' }),
  });
  assert.equal(passed.ok, true, passed.output);
  const written = JSON.parse(readFileSync(record, 'utf8'));
  assert.equal(written.ok, true);
  assert.match(written.local_time, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(written.status, status, 'the status stamp is copied exactly');
});

test('a below-floor build leaves no success record', (t) => {
  const dir = gateTree(t, { packageScripts: { build: 'node build.mjs' } });
  const out = join(dir, 'out');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'status.json'), JSON.stringify({
    built_at: '2026-09-08T18:00:00Z',
    commit: 'fixture-head',
    dirty: false,
    stamp: '2026-09-08T18:00:00Z · fixture-head',
  }) + '\n', 'utf8');
  const record = join(out, '.build-stamp.json');
  writeFileSync(record, '{"ok":true}\n', 'utf8');

  const result = runGates({ repoRoot: dir }, dir, {
    scripts: ['build'],
    floorSet: { build: { floorMs: 3 } },
    now: (() => {
      const ticks = [0, 2];
      return () => ticks.shift();
    })(),
    spawn: () => ({ status: 0, stdout: '', stderr: '' }),
  });

  assert.equal(result.ok, false, 'a 2 ms build below its floor fails the stage');
  assert.equal(result.results[0].floorFailure, true);
  assert.match(result.output, /build returned below its declared floor/);
  assert.equal(existsSync(record), false, 'a below-floor build is not a success record');
});
