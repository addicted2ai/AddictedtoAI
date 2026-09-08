import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { checkBuild } from '../verify-launch.mjs';

const SOURCE_TIME = new Date('2026-09-08T12:00:00.000Z');
const BUILD_TIME = new Date('2026-09-08T12:00:01.000Z');
const LATER_SOURCE_TIME = new Date('2026-09-08T12:00:02.000Z');

const STATUS = {
  built_at: '2026-09-08T18:00:00Z',
  commit: 'unknown',
  dirty: false,
  stamp: '2026-09-08T18:00:00Z · unknown',
};

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeMtime(file, date) {
  utimesSync(file, date, date);
}

function buildTree(t, { state = 'none' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-launch-build-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'package.json'), '{"private":true}\n', 'utf8');
  mkdirSync(join(dir, 'content'), { recursive: true });
  const source = join(dir, 'content', 'page.md');
  writeFileSync(source, 'a build input\n', 'utf8');
  const sourceTime = state === 'stale'
    ? LATER_SOURCE_TIME
    : state === 'equal'
      ? BUILD_TIME
      : SOURCE_TIME;
  writeMtime(source, sourceTime);
  writeMtime(join(dir, 'package.json'), sourceTime);

  if (state === 'empty') {
    mkdirSync(join(dir, 'out'), { recursive: true });
    return dir;
  }
  if (state === 'none') return dir;

  const out = join(dir, 'out');
  mkdirSync(out, { recursive: true });
  const status = { ...STATUS, commit: state === 'other-commit' ? 'another-head' : STATUS.commit };
  status.stamp = `${status.built_at} · ${status.commit}`;
  writeFileSync(join(out, 'index.html'), '<html></html>\n', 'utf8');
  writeJson(join(out, 'status.json'), status);
  writeMtime(join(out, 'index.html'), BUILD_TIME);
  writeMtime(join(out, 'status.json'), BUILD_TIME);

  if (state === 'current' || state === 'other-commit' || state === 'stale' || state === 'equal') {
    writeJson(join(out, '.build-stamp.json'), {
      ok: true,
      local_time: '2026-09-08T12:00:02.000-06:00',
      status,
    });
  }
  return dir;
}

function runBuildCheck(dir, { status = 0 } = {}) {
  const output = [];
  const reports = [];
  const calls = [];
  const result = checkBuild(true, {
    root: dir,
    write: (text) => output.push(text),
    report: (report) => {
      reports.push(report);
      return report;
    },
    now: (() => {
      const ticks = [0, 1];
      return () => ticks.shift() ?? 1;
    })(),
    localNow: () => new Date('2026-09-08T18:00:02.000'),
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status, stdout: '', stderr: status === 0 ? '' : 'failed' };
    },
  });
  return { calls, output: output.join(''), report: reports[0], result };
}

test('a present recorded current build is reused without spawning a build process', (t) => {
  const dir = buildTree(t, { state: 'current' });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 0, 'reuse is proved by the spawn count');
  assert.equal(checked.report.reused, true);
  assert.match(checked.report.actual, /reused existing build/);
  assert.match(checked.output, /no build process was spawned/);
});

test('without an output directory the launch check spawns the build process', (t) => {
  const dir = buildTree(t, { state: 'none' });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 1);
  assert.equal(checked.report.reused, undefined);
  assert.match(checked.report.actual, /exit 0/);
  assert.equal('shell' in checked.calls[0].options, false);
});

test('an export newer than every source without a success record builds', (t) => {
  const dir = buildTree(t, { state: 'fresh-no-record' });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 1, 'fresh output without a record is not reusable');
  assert.equal(checked.report.reused, undefined);
  const written = JSON.parse(readFileSync(join(dir, 'out', '.build-stamp.json'), 'utf8'));
  assert.equal(written.ok, true);
  assert.deepEqual(written.status, STATUS, 'the spawner copied status.json exactly');
});

test('an export whose success record names another commit builds', (t) => {
  const dir = buildTree(t, { state: 'other-commit' });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 1, 'a record from another HEAD is not reusable');
  assert.equal(checked.report.reused, undefined);
});

test('a stale export builds even when its success record is otherwise valid', (t) => {
  const dir = buildTree(t, { state: 'stale' });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 1, 'a source newer than output defeats reuse');
  assert.equal(checked.report.reused, undefined);
});

test('an export whose newest input equals newest output builds', (t) => {
  const dir = buildTree(t, { state: 'equal' });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 1, 'equal mtimes are not current');
  assert.equal(checked.report.reused, undefined);
});

test('an empty output directory builds', (t) => {
  const dir = buildTree(t, { state: 'empty' });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 1, 'a directory without build files is not reusable');
  assert.equal(checked.report.reused, undefined);
});

test('a failed spawned build removes an earlier success record', (t) => {
  const dir = buildTree(t, { state: 'current' });
  const record = join(dir, 'out', '.build-stamp.json');

  const checked = checkBuild(true, {
    root: dir,
    isCurrent: () => false,
    report: (report) => report,
    spawn: () => ({ status: 1, stdout: '', stderr: 'failed' }),
  });

  assert.equal(checked.ok, false);
  assert.equal(existsSync(record), false);
});

test('a spawned build uses cmd.exe /c on Windows without shell mode', (t) => {
  const dir = buildTree(t, { state: 'none' });

  const checked = runBuildCheck(dir);

  if (process.platform === 'win32') {
    assert.equal(checked.calls[0].command, 'cmd.exe');
    assert.ok(checked.calls[0].args.includes('/c'));
  } else {
    assert.equal(checked.calls[0].command, 'npm');
    assert.deepEqual(checked.calls[0].args, ['run', 'build']);
  }
});
