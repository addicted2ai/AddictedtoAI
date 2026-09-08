/**
 * sitemap.test.mjs — the wiring in `app/sitemap.ts` (addictedtoai-3u1).
 *
 * `lib/sitemap-dates.test.mjs` proves `contentChangedOn` resolves correctly.
 * This file guards the other half: that `app/sitemap.ts` actually CALLS it
 * for deltas rather than the routine-end date it used to pass
 * (`view.routine.date`) — a regression that behavioural coverage of the
 * shared function alone would not catch, because it lives entirely in the
 * page component's own wiring. Same technique `lib/reviews.test.mjs`
 * ("the join reads no filesystem timestamp") uses to pin an argument down at
 * the source, for the same reason: some claims are about what a specific
 * line says, not about what a function returns.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(fileURLToPath(new URL('./sitemap.ts', import.meta.url)), 'utf8');
const DATES_SRC = readFileSync(fileURLToPath(new URL('../lib/sitemap-dates.mjs', import.meta.url)), 'utf8');

// Comments stripped before the negative check below: the file's own header
// now narrates the bug it fixed, including the literal phrase
// `view.routine.date` — an assertion that tripped on that prose would be
// measuring the explanation, not the code (`lib/reviews.test.mjs`'s "the
// join reads no filesystem timestamp" test establishes this same idiom).
const CODE_ONLY = SRC.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

test('3u1 the delta loop passes contentChangedOn(view.doc), never view.routine.date', () => {
  assert.match(
    SRC,
    /for \(const view of site\.deltas\) add\(view\.url, contentChangedOn\(view\.doc\)\);/,
    'the exact line addictedtoai-3u1 fixed',
  );
  assert.ok(
    !CODE_ONLY.includes('view.routine.date'),
    'the routine end\'s date must never be read as a page\'s lastModified again, outside prose explaining the old bug',
  );
});

test('3u1 the resolution logic is imported from lib/sitemap-dates.mjs, not reimplemented inline', () => {
  assert.match(SRC, /from ['"]\.\.\/lib\/sitemap-dates\.mjs['"]/);
  // Guards against a future edit quietly pasting the algorithm back in beside
  // the import, which would leave two implementations for one question.
  assert.ok(
    !/function\s+contentChangedOn/.test(SRC) && !/const\s+reviewedOn\s*=/.test(SRC),
    'contentChangedOn/reviewedOn must not be redefined locally',
  );
});

// ── addictedtoai-1r7: the twelve index routes each carry an honest lastModified ──

test('1r7 the old no-date loop over all twelve index routes is gone', () => {
  assert.ok(
    !/for \(const path of \[/.test(CODE_ONLY),
    'a loop that called add(path) with no second argument for every index route must not come back',
  );
});

test('1r7 newest and index-route folds live in lib/sitemap-dates.mjs', () => {
  assert.match(SRC, /\bindexRouteDates\b.*from ['"]\.\.\/lib\/sitemap-dates\.mjs['"]/);
  assert.match(DATES_SRC, /export function newest/);
  assert.match(DATES_SRC, /export function indexRouteDates/);
  // Catch the realistic local reimplementation shape: mapping a site member
  // collection into dates and then folding it with sort/reduce/at/max/min.
  // This is a source guard, not a parser; a substantially different rewrite
  // would require a different check.
  assert.ok(
    !/site\.[A-Za-z_$][\w$]*\s*\.\s*map\s*\([\s\S]*?\)\s*\.\s*(?:sort|reduce|at|max|min)\s*\(/.test(CODE_ONLY),
    'index-route member date folds must not be reimplemented inline',
  );
});

test('1r7 each index route passes its own member-max expression', () => {
  const expected = {
    '/': 'feedChangedOn',
    '/wiki': 'wikiChangedOn',
    '/catalog': 'catalogChangedOn',
    '/catalog/deprecations': 'deprecationsChangedOn',
    '/catalog/changed': 'feedChangedOn',
    '/tools': 'toolsChangedOn',
    '/learn': 'learnChangedOn',
    '/tutorials': 'tutorialsChangedOn',
    '/blog': 'blogChangedOn',
    '/impossible-routine': 'deltasChangedOn',
    '/data': 'dataChangedOn',
  };
  for (const [path, variable] of Object.entries(expected)) {
    const re = new RegExp(`add\\('${path.replace(/\//g, '\\/')}',\\s*${variable}\\)`);
    assert.match(SRC, re, `${path} must pass ${variable}`);
  }
});

test('1r7 / and /catalog/changed share the SAME feed-date variable, not two computations of "changed"', () => {
  assert.match(SRC, /add\('\/', feedChangedOn\)/);
  assert.match(SRC, /add\('\/catalog\/changed', feedChangedOn\)/);
});

test('1r7 /colophon deliberately gets no lastModified argument', () => {
  assert.match(SRC, /add\('\/colophon'\);/, 'colophon has no corpus doc and no review record to join to');
});

test('1r7 catalog and deprecations read the shared changedOn map by the row\'s joined entry id, not a new date source', () => {
  assert.match(
    DATES_SRC,
    /site\.catalog\.map\(\(row\) => \(row\.entry \? changedOn\.get\(row\.entry\.id\) : undefined\)\)/,
  );
  assert.match(
    DATES_SRC,
    /site\.deprecations\.map\(\(row\) => \(row\.entry \? changedOn\.get\(row\.entry\.id\) : undefined\)\)/,
  );
});
