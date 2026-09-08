import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { checkBuild } from '../verify-launch.mjs';

function buildTree(t, { built }) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-launch-build-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'package.json'), '{"private":true}\n', 'utf8');
  mkdirSync(join(dir, 'content'), { recursive: true });
  const source = join(dir, 'content', 'page.md');
  writeFileSync(source, 'a build input\n', 'utf8');

  if (built) {
    mkdirSync(join(dir, 'out'), { recursive: true });
    writeFileSync(join(dir, 'out', 'index.html'), '<html></html>\n', 'utf8');
    const sourceTime = new Date('2026-09-08T12:00:00.000Z');
    const buildTime = new Date('2026-09-08T12:00:01.000Z');
    utimesSync(source, sourceTime, sourceTime);
    utimesSync(join(dir, 'package.json'), sourceTime, sourceTime);
    utimesSync(join(dir, 'out', 'index.html'), buildTime, buildTime);
  }
  return dir;
}

function runBuildCheck(dir) {
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
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0, stdout: '', stderr: '' };
    },
  });
  return { calls, output: output.join(''), report: reports[0], result };
}

test('a present current build is reused without spawning a build process', (t) => {
  const dir = buildTree(t, { built: true });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 0, 'reuse is proved by the spawn count');
  assert.equal(checked.report.reused, true);
  assert.match(checked.report.actual, /reused existing build/);
  assert.match(checked.output, /no build process was spawned/);
});

test('without a current build the launch check spawns the build process', (t) => {
  const dir = buildTree(t, { built: false });

  const checked = runBuildCheck(dir);

  assert.equal(checked.calls.length, 1);
  assert.equal(checked.report.reused, undefined);
  assert.match(checked.report.actual, /exit 0/);
  if (process.platform === 'win32') {
    assert.equal(checked.calls[0].command, 'cmd.exe');
    assert.ok(checked.calls[0].args.includes('/c'));
  } else {
    assert.equal(checked.calls[0].command, 'npm');
    assert.deepEqual(checked.calls[0].args, ['run', 'build']);
  }
  assert.equal('shell' in checked.calls[0].options, false);
});
