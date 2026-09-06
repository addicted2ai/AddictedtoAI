import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { DOMAINS, FRONTIER_CRITERIA, FRONTIER_REASONS } from './domains.mjs';

test('the domain vocabulary is the eight values, in the order the specs state them', () => {
  assert.deepEqual([...DOMAINS], [
    'coding',
    'agents',
    'image',
    'video',
    'audio',
    'research',
    'science-math',
    'robotics',
  ]);
});

test('"general", "text" and "multimodal" are not values (K38)', () => {
  for (const absent of ['general', 'text', 'multimodal']) {
    assert.equal(
      DOMAINS.includes(absent),
      false,
      `${absent} must not be a domain value — general is unmarked, text was removed by K38`,
    );
  }
});

test('DOMAINS is frozen', () => {
  assert.equal(Object.isFrozen(DOMAINS), true);
  assert.throws(() => { DOMAINS.push('legal'); });
  assert.equal(DOMAINS.length, 8);
});

test('the frontier criteria are exactly the five ids F1-F5', () => {
  assert.deepEqual(FRONTIER_CRITERIA.map((c) => c.id), ['F1', 'F2', 'F3', 'F4', 'F5']);
  assert.equal(FRONTIER_CRITERIA.length, 5);
  assert.deepEqual([...FRONTIER_REASONS], ['F1', 'F2', 'F3', 'F4', 'F5']);
});

test('FRONTIER_CRITERIA is frozen, criterion objects included', () => {
  assert.equal(Object.isFrozen(FRONTIER_CRITERIA), true);
  assert.equal(Object.isFrozen(FRONTIER_REASONS), true);
  assert.throws(() => { FRONTIER_CRITERIA.push({ id: 'F6', text: 'x' }); });
  for (const criterion of FRONTIER_CRITERIA) {
    assert.equal(Object.isFrozen(criterion), true);
    assert.equal(typeof criterion.text, 'string');
    assert.ok(criterion.text.length > 0);
  }
});

// The point of a verbatim transcription is that it stays verbatim. This reads
// the criteria back out of the reviewed delta rather than trusting that the
// strings above were copied correctly once — a paraphrase that drifts from the
// keeper-signed order is exactly the silent-drift failure this file exists to
// prevent.
const normalise = (s) => s
  .replace(/[‘’]/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

test('each criterion text matches the blog delta verbatim', () => {
  const deltaPath = fileURLToPath(new URL(
    '../openspec/changes/flag-what-moved-the-frontier/specs/blog/spec.md',
    import.meta.url,
  ));
  const delta = readFileSync(deltaPath, 'utf8');
  const found = new Map();
  const pattern = /^- \*\*(F[1-5])\*\*\s+[—-]\s+([\s\S]*?)(?=\n- \*\*F[1-5]\*\*|\n\n)/gm;
  for (const m of delta.matchAll(pattern)) found.set(m[1], normalise(m[2]));
  assert.equal(found.size, 5, 'the delta should define five criteria');
  for (const criterion of FRONTIER_CRITERIA) {
    assert.equal(
      normalise(criterion.text),
      found.get(criterion.id),
      `${criterion.id} has drifted from the delta`,
    );
  }
});
