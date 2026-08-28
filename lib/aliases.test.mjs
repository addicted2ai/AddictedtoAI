/**
 * aliases.test.mjs — task 2.5.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';
import { ALIASES_FILE, writeAliasRegistry } from './aliases.mjs';
import { relPath } from './paths.mjs';

test('2.5 the registry carries all three link classes, derived from front matter', async () => {
  const site = await buildFixture('linker');
  const { byName } = site.aliases;

  assert.deepEqual(byName.get('ComfyUI').claimed_by, [{ id: 'tool/comfyui', class: 'exclusive' }]);
  assert.equal(byName.get('ComfyUI').linkable, true);

  assert.equal(byName.get('Opus 5').claimed_by[0].class, 'shared');
  assert.equal(byName.get('Opus 5').linkable, false);

  assert.equal(byName.get('Claude').claimed_by[0].class, 'manual');
  assert.equal(byName.get('Claude').linkable, false);
});

test('2.5 an exclusive collision fails the build naming both entries and the alias', async () => {
  const err = await buildFixtureExpectingFailure('bad/alias-collision');
  assert.match(err.message, /alias "Opus" is claimed as exclusive by more than one entry/);
  assert.match(err.message, /model\/claude-opus-5/);
  assert.match(err.message, /paper\/opus-architecture/);
  assert.match(err.message, /demote it to shared or manual on both/);
});

test('2.5 the registry is sorted and carries no timestamp, so it is byte-stable', async () => {
  const a = await buildFixture('linker');
  const b = await buildFixture('linker');
  assert.deepEqual(a.aliases.registry, b.aliases.registry);
  const names = a.aliases.registry.aliases.map((x) => x.name);
  assert.deepEqual(names, [...names].sort());
  assert.ok(!JSON.stringify(a.aliases.registry).includes('generated'));
});

test('2.5 the registry is written to data/derived/aliases.json as deterministic LF bytes', async () => {
  // The build's own regeneration is verified by running `npm run build`; what
  // is asserted here is the two properties that make that regeneration safe
  // to commit — a fixed destination, and bytes that do not churn.
  assert.match(relPath(ALIASES_FILE), /^data\/derived\/aliases\.json$/);

  const site = await buildFixture('linker');
  const tmp = join(tmpdir(), `aliases-${process.pid}.json`);
  const first = await writeAliasRegistry(site.aliases.registry, tmp);
  const second = await writeAliasRegistry(site.aliases.registry, tmp);
  const onDisk = await readFile(tmp, 'utf8');
  await rm(tmp, { force: true });

  assert.equal(first, second, 'two writes of the same state are byte-identical');
  assert.equal(onDisk, first);
  assert.ok(onDisk.endsWith('\n'));
  assert.ok(!onDisk.includes('\r'), 'written LF, per .gitattributes');
  assert.ok(Array.isArray(JSON.parse(onDisk).aliases));
});

test('2.5 linkable ordering is deterministic: longest alias first, then by name', async () => {
  const site = await buildFixture('linker');
  const names = site.aliases.linkable.map((a) => a.name);
  const sorted = [...names].sort((x, y) => y.length - x.length || x.localeCompare(y));
  assert.deepEqual(names, sorted);
});
