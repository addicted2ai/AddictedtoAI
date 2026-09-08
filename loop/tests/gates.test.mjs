import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { GATE_FLOORS, runGates } from '../lib/gates.mjs';

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
  const result = runGates({ repoRoot: dir }, dir, { scripts: ['verify-surfaces'] });

  assert.equal(result.ok, true, result.output);
  assert.equal(result.results[0].status, 0);
  assert.ok(result.results[0].durationMs >= GATE_FLOORS['verify-surfaces'].floorMs);
});

test('npm gates use cmd.exe /c on Windows without shell mode', (t) => {
  const dir = gateTree(t, { packageScripts: { test: 'node gate.mjs' } });
  const calls = [];
  const ticks = [0, GATE_FLOORS.test.floorMs + 1];
  const result = runGates({ repoRoot: dir }, dir, {
    scripts: ['test'],
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

