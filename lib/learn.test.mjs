/**
 * learn.test.mjs — the curriculum parse (let-the-site-see-its-own-gaps,
 * tasks 1.1 and 4.2).
 *
 * The build and the Pulse each parse `openspec/curriculum/learn.md` with their
 * own code, deliberately: `pulse/lib/corpus.mjs` states the boundary in its own
 * header — *"The build owns schema validation and fails loudly on a malformed
 * file. The Pulse deliberately does not share that code and deliberately does
 * not throw"* — and the queue's `coveredKeys` already reads `content/blog/`
 * directly for the same reason.
 *
 * The price of that duplication is that two parsers can drift apart. It is paid
 * here, in measurement rather than in a comment: the last test reads the real
 * curriculum through both and asserts they agree, so a change to either regex
 * fails on the next `npm test`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { curriculumSlugs } from './learn.mjs';
import { CURRICULUM_FILE } from './paths.mjs';
import { readCurriculumSlugs } from '../pulse/lib/queue.mjs';

test('1.1 the catalog parse returns the enumerated slugs in document order', () => {
  const text = [
    '## §4 — The catalog',
    '',
    '#### `first-page` — "First"',
    '- **Status**: new',
    '',
    '#### `second-page` — "Second"',
    '',
    '## §5 — Next',
  ].join('\n');
  assert.deepEqual(curriculumSlugs(text), ['first-page', 'second-page']);
});

test('1.1 a heading outside §4 is not an entry, before or after the catalog', () => {
  const text = [
    '#### `before`',
    '## §4 — The catalog',
    '#### `inside`',
    '## §5 — The dependency graph',
    '#### `after`',
  ].join('\n');
  assert.deepEqual(curriculumSlugs(text), ['inside']);
});

test('1.1 a document with no catalog section is null, and an empty catalog is []', () => {
  assert.equal(curriculumSlugs('# Curriculum\n\nnothing here\n'), null, 'unreadable map');
  assert.deepEqual(curriculumSlugs('## §4 — The catalog\n\n## §5 — Next\n'), [], 'empty map');
  assert.equal(curriculumSlugs(''), null);
  assert.equal(curriculumSlugs(null), null);
});

test('1.1 a repeated entry is counted once', () => {
  const text = '## §4 — The catalog\n#### `dup`\n#### `dup`\n#### `other`\n';
  assert.deepEqual(curriculumSlugs(text), ['dup', 'other']);
});

test('1.1 the real curriculum enumerates every published learn page and no more', async () => {
  const { readdirSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { ROOT } = await import('./paths.mjs');

  const declared = curriculumSlugs(await readFile(CURRICULUM_FILE, 'utf8'));
  assert.ok(Array.isArray(declared) && declared.length > 0, 'the real catalog parses');

  const published = readdirSync(join(ROOT, 'content', 'learn'))
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => f.replace(/\.md$/, ''))
    .sort();

  assert.deepEqual(
    [...declared].sort(),
    published,
    'the map and the territory describe each other exactly — a difference either way is the ' +
      'defect this change exists to catch, in whichever direction it appears',
  );
});

test('4.2 the build and the Pulse parse the real curriculum identically', async () => {
  const { ROOT } = await import('./paths.mjs');
  const fromBuild = curriculumSlugs(await readFile(CURRICULUM_FILE, 'utf8'));
  const fromPulse = readCurriculumSlugs(ROOT);
  assert.deepEqual(
    fromPulse,
    fromBuild,
    'two deliberately separate parsers, one answer — if this fails, one of them changed alone',
  );
});
