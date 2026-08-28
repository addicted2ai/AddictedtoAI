/**
 * publish.test.mjs — task 3.9: the publish step.
 *
 * **No test in this file may cause a push.** The true path is exercised only
 * through `--dry-run`, and the one structural guarantee tested here is that
 * `--assume-publish` cannot be combined with a real run: `data/config.json`
 * is the only thing that can arm a push, and it is a reserved path.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, makeRoot, runPulse } from './helpers.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];

test('with publish: false the step prints one line and does nothing else', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const publishLines = run.out.split('\n').filter((l) => l.includes('publish'));
  assert.equal(publishLines.length, 1, `expected exactly one publish line, got:\n${publishLines.join('\n')}`);
  assert.match(publishLines[0], /publish — disabled \(data\/config\.json has publish: false\) — nothing committed, nothing pushed/);
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});

test('--dry-run with publish assumed prints the exact commands and the poll target, and executes nothing', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));

  const run = await runPulse(root, [...ARGS, '--dry-run', '--assume-publish'], { SITE_URL: 'https://www.addictedtoai.net' });
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /DRY RUN — publish would run/);
  assert.match(run.out, /would run: git -C .* add /);
  assert.match(run.out, /would run: git -C .* commit -m "pulse: \d{4}-\d{2}-\d{2} data and content update"/);
  assert.match(run.out, /would run: git -C .* push origin main/);
  assert.match(run.out, /would poll: https:\/\/www\.addictedtoai\.net\/status\.json every 20s for up to 10 minutes/);
  assert.match(run.out, /would write .*HOLD\.md if the stamp does not advance/);
  assert.match(run.out, /DRY RUN — nothing was committed and nothing was pushed/);
  assert.equal(existsSync(join(root, '.git')), false, 'nothing created a repository, let alone a commit');
});

test('--dry-run alone respects publish: false — the config is the gate', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const run = await runPulse(root, [...ARGS, '--dry-run']);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /publish — disabled/);
  assert.doesNotMatch(run.out, /would run: git/);
});

test('--assume-publish without --dry-run is refused outright', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));

  const run = await runPulse(root, [...ARGS, '--assume-publish']);
  assert.notEqual(run.status, 0, 'the run fails rather than proceeding');
  assert.match(run.out, /--assume-publish is only honored together with --dry-run/);
  assert.doesNotMatch(run.out, /push origin main/, 'no push command is even printed');
});

test('publishing is suspended while HOLD.md stands', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const { writeFileSync } = await import('node:fs');
  writeFileSync(join(root, 'HOLD.md'), '# HOLD\n\ndeploy failed earlier\n', 'utf8');

  const run = await runPulse(root, [...ARGS, '--dry-run', '--assume-publish']);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /HOLD\.md present .* publish suspended until the hold clears/);
  assert.doesNotMatch(run.out, /would run: git/);
});
