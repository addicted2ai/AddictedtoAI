/**
 * listings.test.mjs — grouping the tools directory by job (beads
 * addictedtoai-0eg, specs/directory).
 *
 * The interesting claim here is not "the page groups". It is that the grouped
 * order is **objective**: specs/directory promises *"No placement is ever sold
 * ... Ordering is by objective, stated criteria only"*, and `name, A to Z` was
 * self-evidently objective in a way a category order is not. So the assertions
 * below measure the mechanisms rather than the intent:
 *
 *  - the order is a pure function of the category NAMES — shuffling the closed
 *    list changes nothing on the page;
 *  - it is not the listing count, which would move when listings are added;
 *  - A-to-Z still holds inside each category, and is still on the page whole;
 *  - both criteria are printed, through the same `sortNote` hook the DOM check
 *    reads.
 *
 * Rendering is exercised through the real `surfaces` fixture corpus wherever it
 * can be, for the reason `surfaces.test.mjs` states: a hand-built doc object
 * proves nothing about the build. The pure grouping function is exercised with
 * synthetic listings as well, because the fixture corpus has three listings and
 * some of these claims need more than three.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture } from './test-helpers.mjs';
import { renderToolsIndex, renderToolPage } from './render/tools.mjs';
import {
  CATEGORY_NOTES,
  LISTINGS_GROUPED_SORT,
  LISTINGS_SORT,
  assertCategoriesDescribed,
  categoryProblems,
  listingGroups,
  listingStates,
} from './listings.mjs';
import { TOOL_CATEGORIES } from './schema.mjs';

/** One build of the surfaces fixture corpus, shared by everything below. */
let SITE;
async function site() {
  if (!SITE) SITE = await buildFixture('surfaces');
  return SITE;
}

/** The freshness states the Pulse would have computed for the tool fixtures. */
const FRESHNESS = {
  listings: [
    { slug: 'healthy-listing', state: 'ok', consecutive_failures: 0, since: '2026-08-27' },
    {
      slug: 'unverifiable-listing',
      state: 'could-not-verify',
      consecutive_failures: 2,
      since: '2026-07-14',
    },
    { slug: 'discontinued-listing', state: 'discontinued', discontinued: '2026-05-30' },
  ],
};

const states = async () => listingStates((await site()).corpus, { freshness: FRESHNESS, today: '2026-08-28' });

/** A listing in the shape `listingStates` returns, for the synthetic cases. */
const fake = (title, category) => ({
  doc: { slug: title.toLowerCase().replace(/\W+/g, '-'), url: '/tools/x', data: { title, category } },
  state: { state: 'ok', alive: true, tone: null, marker: null, last_verified: '2026-08-28' },
});

/** Sorted A to Z, the way `listingStates` hands them over. */
const azList = (...pairs) =>
  pairs.map(([t, c]) => fake(t, c)).sort((a, b) => a.doc.data.title.localeCompare(b.doc.data.title));

/** Run and return the throw. "The guardrail did not fire" is never a pass. */
function thrown(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('expected a throw, and nothing was thrown');
}

// ── the grouping itself ──────────────────────────────────────────────────

test('0eg listings are grouped by their declared category, empty categories dropped', () => {
  const groups = listingGroups(azList(['Alpha', 'coding'], ['Beta', 'agents'], ['Gamma', 'coding']));
  assert.deepEqual(
    groups.map((g) => [g.category, g.listings.map((l) => l.doc.data.title)]),
    [
      ['agents', ['Beta']],
      ['coding', ['Alpha', 'Gamma']],
    ],
  );
  assert.ok(
    groups.length < TOOL_CATEGORIES.length,
    'a category with no listings renders no heading at all',
  );
});

test('0eg every group carries the note that says what the one-word heading means', () => {
  const groups = listingGroups(azList(['Alpha', 'coding'], ['Beta', 'agents']));
  for (const g of groups) {
    assert.equal(g.note, CATEGORY_NOTES[g.category]);
    assert.ok(g.note.length > 4, `${g.category} states its job`);
  }
});

test('0eg A to Z still holds INSIDE each category', () => {
  const groups = listingGroups(
    azList(['Zeta', 'coding'], ['Alpha', 'coding'], ['Mu', 'coding'], ['Beta', 'agents']),
  );
  const coding = groups.find((g) => g.category === 'coding');
  assert.deepEqual(coding.listings.map((l) => l.doc.data.title), ['Alpha', 'Mu', 'Zeta']);
});

test('0eg the category order is a function of the NAMES, not of the declared list order', () => {
  const listings = azList(['Alpha', 'training'], ['Beta', 'agents'], ['Gamma', 'local']);
  const inOrder = listingGroups(listings).map((g) => g.category);

  // The closed list is kept alphabetical for reading, so a hand-ordered version
  // of it is the thing that must NOT matter. Reversed is the sharpest case.
  const reversed = [...TOOL_CATEGORIES].reverse();
  const shuffled = ['training', 'local', 'agents', ...TOOL_CATEGORIES.filter(
    (c) => !['training', 'local', 'agents'].includes(c),
  )];

  for (const categories of [reversed, shuffled]) {
    assert.deepEqual(
      listingGroups(listings, { categories, notes: CATEGORY_NOTES }).map((g) => g.category),
      inOrder,
      `${categories.slice(0, 3).join(',')}... produces the same page order`,
    );
  }
  assert.deepEqual(inOrder, ['agents', 'local', 'training'], 'which is A to Z by category name');
});

test('0eg the order is not by listing count — adding a listing never moves a category', () => {
  const before = listingGroups(azList(['Alpha', 'training'], ['Beta', 'agents'])).map((g) => g.category);
  const after = listingGroups(
    azList(['Alpha', 'training'], ['Beta', 'agents'], ['Gamma', 'training'], ['Delta', 'training']),
  ).map((g) => g.category);
  assert.deepEqual(before, after, 'a category that tripled in size stayed where it was');
  assert.deepEqual(after, ['agents', 'training']);
});

test('0eg a listing whose category is outside the closed list throws, naming both', () => {
  const err = thrown(() => listingGroups(azList(['Alpha', 'seo'], ['Beta', 'agents'])));
  assert.match(err.message, /alpha/, 'names the listing');
  assert.match(err.message, /"seo"/, 'names the offending value');
  for (const category of TOOL_CATEGORIES) {
    assert.ok(err.message.includes(category), `names ${category} as an alternative`);
  }
});

// ── the closed list and its notes cannot drift apart ─────────────────────

test('0eg the real category list and its notes agree', () => {
  assert.deepEqual(categoryProblems(), []);
  assert.equal(assertCategoriesDescribed(), true);
  // And the check is really looking at something, so a clean result is not the
  // result of an empty inventory.
  assert.ok(TOOL_CATEGORIES.length >= 5, `${TOOL_CATEGORIES.length} categories`);
});

test('0eg a category with no note fails, naming every offender rather than the first', () => {
  const err = thrown(() =>
    assertCategoriesDescribed({ categories: ['coding', 'newthing', 'another'], notes: { coding: 'write code' } }),
  );
  assert.match(err.message, /"newthing"/);
  assert.match(err.message, /"another"/);
  assert.match(err.message, /^2 tool category problem/);
});

test('0eg a note for a category the schema no longer has fails too', () => {
  const problems = categoryProblems({
    categories: ['coding'],
    notes: { coding: 'write code', retired: 'a category that was removed' },
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /"retired"/);
  assert.match(problems[0], /not in TOOL_CATEGORIES/);
});

test('0eg grouping refuses to run at all while a category has no note', () => {
  const err = thrown(() =>
    listingGroups(azList(['Alpha', 'coding']), { categories: ['coding'], notes: {} }),
  );
  assert.match(err.message, /"coding"/);
  assert.match(err.message, /CATEGORY_NOTES/);
});

// ── the rendered page ────────────────────────────────────────────────────

test('0eg the page states BOTH criteria, the grouped one first', async () => {
  const s = await site();
  const html = renderToolsIndex(await states(), s.corpus.byId);

  const notes = [...html.matchAll(/data-sort-note="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(notes, [LISTINGS_GROUPED_SORT, LISTINGS_SORT], 'both, grouped first');

  // The DOM check in scripts/verify-surfaces.mjs reads the FIRST one, so the
  // first one has to be the order the page is actually in.
  assert.equal(notes[0], 'category name, A to Z; then listing name, A to Z within each category');
  assert.match(html, /Nothing on this site is ordered by payment\./);
});

test('0eg every category present gets a heading, a note and a working jump link', async () => {
  const s = await site();
  const html = renderToolsIndex(await states(), s.corpus.byId);

  // The surfaces fixture declares two categories across its three listings.
  const headings = [...html.matchAll(/<h2 class="section-title" id="tools-([a-z-]+)">([^<]+)<\/h2>/g)];
  assert.deepEqual(headings.map((m) => m[1]), ['agents', 'coding'], 'A to Z by category name');
  assert.deepEqual(headings.map((m) => m[2]), ['agents', 'coding'], 'the heading text is the name');

  for (const [, id] of headings) {
    assert.ok(html.includes(`href="#tools-${id}"`), `a jump link points at #tools-${id}`);
    assert.ok(html.includes(CATEGORY_NOTES[id]), `the ${id} heading is followed by its note`);
  }
  assert.match(html, /<nav class="category-index" aria-label="Tool categories">/);
});

test('0eg the A-to-Z order is still on the page, whole and alphabetical', async () => {
  const s = await site();
  const list = await states();
  const html = renderToolsIndex(list, s.corpus.byId);

  const details = html.slice(html.indexOf('<details'), html.indexOf('</details>'));
  assert.match(details, /<summary>All 3 listings, A to Z<\/summary>/);
  const names = [...details.matchAll(/class="browse-name">([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(names, ['Discontinued Listing', 'Healthy Listing', 'Unverifiable Listing']);
  assert.equal(names.length, list.length, 'every listing is in it — nothing is dropped');
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)), 'and it really is A to Z');
});

test('0eg every listing appears exactly once in the grouped body, dead ones included', async () => {
  const s = await site();
  const html = renderToolsIndex(await states(), s.corpus.byId);

  const rows = [...html.matchAll(/<li class="listing" data-state="([a-z-]+)"/g)].map((m) => m[1]);
  assert.equal(rows.length, 3, 'three listings, rendered once each');
  assert.deepEqual(rows.sort(), ['could-not-verify', 'discontinued', 'ok']);

  // specs/directory: dead listings are "marked and kept as record, never
  // silently dropped". Grouping must not have become a way to drop one.
  assert.equal((html.match(/data-alive="no"/g) ?? []).length, 2);
  assert.match(html, /data-marker="could-not-verify" data-tone="dead"/);
  assert.match(html, /data-marker="discontinued" data-tone="dead"/);
});

test('0eg an empty directory still states its criterion and says so', async () => {
  const s = await site();
  const html = renderToolsIndex([], s.corpus.byId);
  assert.match(html, new RegExp(`data-sort-note="${LISTINGS_GROUPED_SORT}"`));
  assert.match(html, /data-notice="empty-tools"/);
  assert.doesNotMatch(html, /<h2 class="section-title"/, 'and renders no empty category headings');
});

test('0eg a listing page shows its category and links back to that group', async () => {
  const s = await site();
  const listing = (await states()).find((l) => l.doc.slug === 'healthy-listing');
  const page = renderToolPage(listing, s);
  assert.match(page, /<dt>Category<\/dt>/);
  assert.match(page, /<dd><a href="\/tools#tools-coding">coding<\/a><\/dd>/);
});
