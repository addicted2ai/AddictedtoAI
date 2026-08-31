/**
 * search-category-fallback.test.mjs — addictedtoai-bju.
 *
 * `/tools` groups 35 listings under twelve closed categories and the
 * site-wide name search could not find any of those words. The decision
 * recorded in `SearchBox.tsx`'s own header is not to widen the name matcher
 * (specs/site's search requirement names four matched dimensions and
 * category is not one of them); instead the empty state offers a direct
 * jump to that category's section on `/tools`. This proves the pure
 * function the component calls, independent of React or a browser.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { categoryFallback } from './search-category-fallback.mjs';
import { TOOL_CATEGORIES } from './tool-categories.mjs';

test('a query that is not a category returns no fallback', () => {
  assert.deepEqual(categoryFallback('gemini'), []);
  assert.deepEqual(categoryFallback(''), []);
  assert.deepEqual(categoryFallback('   '), []);
  assert.deepEqual(categoryFallback(undefined), []);
});

test('a query that is exactly a category returns one result jumping to its /tools section', () => {
  const [hit] = categoryFallback('audio');
  assert.ok(hit, 'a hit is returned');
  assert.equal(hit.u, '/tools#tools-audio');
  assert.match(hit.t, /audio/);
  assert.equal(hit.k, 'category');
  assert.equal(hit.d, null);
  assert.equal(hit.s, null);
  assert.equal(hit.i, null);
  assert.deepEqual(hit.a, []);
  assert.equal(hit.b, false);
});

test('the "matched" sub-line is suppressed: why equals t exactly', () => {
  const [hit] = categoryFallback('coding');
  assert.equal(hit.why, hit.t);
});

test('matching is case- and whitespace-insensitive, like the rest of the search box', () => {
  assert.equal(categoryFallback('  Audio  ')[0]?.u, '/tools#tools-audio');
  assert.equal(categoryFallback('AGENTS')[0]?.u, '/tools#tools-agents');
});

test('every one of the twelve closed categories resolves to its own anchor, and only those twelve', () => {
  for (const category of TOOL_CATEGORIES) {
    const [hit] = categoryFallback(category);
    assert.equal(hit.u, `/tools#tools-${category}`, `${category} must resolve`);
  }
  // A near-miss (plural, prefix, substring) must not silently match a
  // category — this is an exact-token lookup, not a second name search.
  for (const nearMiss of ['audios', 'aud', 'coding tools', 'trainingx']) {
    assert.deepEqual(categoryFallback(nearMiss), [], `${nearMiss} must not match`);
  }
});
