import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, utimesSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { checkBuild, hasCurrentBuild } from './verify-launch.mjs';
import { git, makeRepo } from '../loop/tests/helpers.mjs';

const INPUT_TIME = new Date('2020-01-01T00:00:00.000Z');
const BUILD_TIME = new Date('2020-01-01T00:00:10.000Z');
const BEADS_TIME = new Date('2020-01-01T00:00:20.000Z');
const CONTENT_TIME = new Date('2020-01-01T00:00:30.000Z');

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function setMtime(file, time) {
  utimesSync(file, time, time);
}

function buildFixture(t) {
  const ctx = makeRepo({ files: { 'content/page.md': 'initial input\n' } });
  t.after(() => ctx.cleanup());

  const root = ctx.repoRoot;
  const content = join(root, 'content', 'page.md');
  const inputFiles = [
    '.gitignore',
    'data/config.json',
    'runners.yml',
    'DIRECTIVES.md',
    'README.md',
    'package.json',
  ].map((file) => join(root, file)).concat(content);
  for (const file of inputFiles) setMtime(file, INPUT_TIME);

  const out = join(root, 'out');
  mkdirSync(out, { recursive: true });
  const output = join(out, 'index.html');
  writeFileSync(output, '<html></html>\n', 'utf8');
  setMtime(output, BUILD_TIME);
  const commit = git(root, ['rev-parse', '--short=12', 'HEAD']).trim();
  writeJson(join(out, '.build-stamp.json'), {
    ok: true,
    local_time: '2020-01-01T00:00:11.000-07:00',
    status: {
      built_at: '2020-01-01T07:00:10Z',
      commit,
      dirty: false,
    },
  });

  return { root, content, out };
}

test('a later .beads write keeps a current build reusable without spawning', (t) => {
  const fixture = buildFixture(t);
  assert.equal(hasCurrentBuild(fixture.root), true);

  const beads = join(fixture.root, '.beads');
  mkdirSync(beads, { recursive: true });
  const journal = join(beads, 'journal');
  writeFileSync(journal, 'tracker write\n', 'utf8');
  setMtime(journal, BEADS_TIME);

  assert.equal(hasCurrentBuild(fixture.root), true);
  let spawned = 0;
  const reused = checkBuild(true, {
    root: fixture.root,
    write: () => {},
    report: (result) => result,
    spawn: () => {
      spawned += 1;
      throw new Error('a current build must be reused');
    },
  });
  assert.equal(reused.reused, true);
  assert.equal(spawned, 0);
});

test('a later write to a build-read content input defeats reuse', (t) => {
  const fixture = buildFixture(t);
  writeFileSync(fixture.content, 'later input\n', 'utf8');
  setMtime(fixture.content, CONTENT_TIME);

  assert.equal(hasCurrentBuild(fixture.root), false);
});
