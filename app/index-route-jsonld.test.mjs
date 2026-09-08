/**
 * The page components must pass the exact shared index-route date into their
 * graph builders. This is a source guard because the page components are
 * server-rendered and their framework runtime is not part of these unit tests.
 * Whitespace is normalised so harmless wrapping does not invalidate the guard.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function source(name) {
  return readFileSync(fileURLToPath(new URL(`./${name}/page.tsx`, import.meta.url)), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/\s+/g, ' ');
}

test('/wiki passes the shared wiki date into DefinedTermSet JSON-LD', () => {
  const src = source('wiki');
  assert.match(src, /const \{ wiki: wikiChangedOn \} = indexRouteDates\s*\(/);
  assert.match(src, /definedTermSetGraph\(terms, \{ description: DESCRIPTION, dateModified: wikiChangedOn \}\)/);
});

test('/data passes the shared data date into Dataset JSON-LD', () => {
  const src = source('data');
  assert.match(src, /const \{ data: dataChangedOn \} = indexRouteDates\s*\(/);
  assert.match(src, /datasetGraph\(\{ dateModified: dataChangedOn \}\)/);
});
