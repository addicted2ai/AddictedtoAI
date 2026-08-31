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
