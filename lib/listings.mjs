/**
 * listings.mjs — the state of a curated tool listing (task 4.3,
 * specs/directory).
 *
 * *"A listing whose URL fails or whose subject is known dead SHALL be visibly
 * marked ('could not verify since <date>' or 'discontinued <date>') — dead
 * listings are marked and kept as record, never silently dropped and never
 * left looking alive."*
 *
 * The decision is **not made here**. The Pulse already computes it into
 * `data/derived/freshness.json` (`listings[].state`, task 3.4) from the
 * rolling link check's accumulated history, which the build cannot see — a
 * "could not verify" mark requires two consecutive failed checks, and that is
 * 30 days of state, not a value derivable at build time. This module reads
 * that decision and turns it into display: the marker text, whether the
 * listing counts as alive, and the date to show. Two places deciding
 * independently is how a page and its queue item come to disagree.
 *
 * A listing the freshness file has never seen (a brand-new file, or a build
 * before the first Pulse run) is `unverified`: not marked dead, not claimed
 * fresh, and the `last_verified` date the author wrote is shown as-is.
 */

import { daysBetween, todayIso } from './facts.mjs';
import { TOOL_CATEGORIES } from './schema.mjs';

/** specs/directory: "every listing at least every 45 days". */
export const LISTING_INTERVAL_DAYS = 45;

/** States the Pulse can report, and what each means on the page. */
const MARKERS = {
  ok: { alive: true, tone: null },
  due: { alive: true, tone: 'due' },
  'failing-once': { alive: true, tone: 'due' },
  unverified: { alive: true, tone: 'due' },
  'could-not-verify': { alive: false, tone: 'dead' },
  discontinued: { alive: false, tone: 'dead' },
};

/**
 * @param {object} doc     a tool doc from `loadCorpus`
 * @param {object} ctx     { freshness, today }
 * @returns {{state: string, alive: boolean, tone: string|null,
 *           marker: string|null, last_verified: string, age_days: number|null}}
 */
export function listingState(doc, ctx = {}) {
  const today = ctx.today ?? todayIso();
  const record = (ctx.freshness?.listings ?? []).find((l) => l.slug === doc.slug) ?? null;
  const state = record?.state ?? 'unverified';
  const meta = MARKERS[state] ?? MARKERS.unverified;
  const lastVerified = doc.data.last_verified;
  const age = daysBetween(lastVerified, today);

  let marker = null;
  if (state === 'discontinued') {
    marker = `Discontinued ${doc.data.discontinued ?? record?.discontinued ?? 'on an unrecorded date'}.`;
  } else if (state === 'could-not-verify') {
    const since = record?.since ?? lastVerified;
    marker = `Could not verify since ${since}. The site stopped answering across two consecutive checks; the listing is kept as a record.`;
  } else if (state === 'failing-once') {
    marker = `The site did not answer the last check. One failure is not a dead tool — it is re-checked before it is marked.`;
  } else if (state === 'due') {
    marker = `Due for re-verification — last verified ${lastVerified}, ${age} days ago (interval ${LISTING_INTERVAL_DAYS} days).`;
  } else if (state === 'unverified') {
    marker = record ? null : `Not yet re-checked by the Pulse. Verified by hand on ${lastVerified}.`;
  }

  return {
    state,
    alive: meta.alive,
    tone: meta.tone,
    marker,
    last_verified: lastVerified,
    age_days: age,
    interval_days: LISTING_INTERVAL_DAYS,
  };
}

/**
 * Every listing with its state, sorted by name. The sort criterion is a
 * stated, objective one and the page prints it (specs/directory: "No
 * placement is ever sold ... its sort order is one of the stated objective
 * criteria and the page says which").
 */
export const LISTINGS_SORT = 'name, A to Z';

export function listingStates(corpus, ctx) {
  return corpus.tool
    .map((doc) => ({ doc, state: listingState(doc, ctx) }))
    .sort((a, b) => a.doc.data.title.localeCompare(b.doc.data.title));
}

/**
 * ---------------------------------------------------------------------------
 * GROUPING BY JOB (beads addictedtoai-0eg, specs/directory)
 *
 * Someone arriving here wants a tool that does a **job**. An A-to-Z list of 35
 * names does not help them find one; a list grouped by what each tool is *for*
 * does. So the default order is by category — and that immediately runs into
 * the promise the alphabetical order was protecting.
 *
 * specs/directory: *"No placement is ever sold ... Ordering is by objective,
 * stated criteria only"*. `name, A to Z` is self-evidently objective: nobody
 * can buy a different alphabet. **A category order is not**, unless it is made
 * so. Someone chooses which category leads, and that choice is precisely the
 * placement the spec promises is never for sale.
 *
 * Three mechanisms make it objective, rather than three sentences promising it:
 *
 *  1. **The order is a pure function of the category names.** Sorted here at
 *     render time by `localeCompare`, never taken from the declaration order of
 *     `TOOL_CATEGORIES`. Shuffling that array changes nothing on the page, and
 *     `listings.test.mjs` measures that by shuffling it.
 *  2. **Not by listing count**, which is the tempting alternative and is worse:
 *     it makes the order move whenever a listing is added, so a tool's
 *     placement would depend on how many neighbours it has — a thing an
 *     interested party can change by asking for more listings in its category.
 *  3. **The page states both criteria**, through the same `sortNote` every
 *     other ordered surface uses, with the same `data-sort-note` hook the DOM
 *     check reads.
 *
 * What remains, stated rather than hidden: **naming a category fixes where it
 * sits.** Renaming `inference` to `apis` would move it. That is a schema change
 * to a closed list in `lib/schema.mjs`, reviewed like any other, and it is the
 * honest residue — there is no ordering of named groups that is independent of
 * their names. It is disclosed here and in `specs/directory` rather than
 * papered over.
 * ---------------------------------------------------------------------------
 */

/**
 * What job each category covers, in one clause. Declared here so the page can
 * say what a one-word heading means; every category in `TOOL_CATEGORIES` must
 * have one, and `categoryProblems` measures that rather than trusting it.
 */
export const CATEGORY_NOTES = Object.freeze({
  agents: 'let a model take actions on its own — drive a browser, run a crew of workers',
  audio: 'speech in and speech out',
  coding: 'write and edit code with a model in the loop',
  data: 'find, extract and label the weights and documents a model works from',
  evaluation: 'test what a model produces before you ship it, and constrain it while it runs',
  frameworks: 'compose model calls, tools and retrieval into a program',
  image: 'generate an image, or read what is in one',
  inference: 'call a model over an API, or serve one under load',
  local: 'run a model on hardware you already own',
  observability: 'see what your model calls cost and what they actually returned',
  retrieval: 'store embeddings and search your own documents so a model can answer from them',
  training: 'fine-tune a model on your own data, and keep the record of the runs',
});

/**
 * The second stated criterion. Both halves are named, because a reader who is
 * told only "by category" cannot predict where a given tool sits.
 */
export const LISTINGS_GROUPED_SORT =
  'category name, A to Z; then listing name, A to Z within each category';

/**
 * Two ways the category list and its glosses can silently stop agreeing, both
 * of which look exactly like agreement until someone reads both files: a
 * category with no gloss renders a bare one-word heading nobody can act on, and
 * a gloss for a category that no longer exists is documentation of a value the
 * schema now rejects. Pure — returns findings, like `classificationProblems`.
 */
export function categoryProblems({ categories = TOOL_CATEGORIES, notes = CATEGORY_NOTES } = {}) {
  const problems = [];
  for (const category of categories) {
    const note = notes[category];
    if (typeof note !== 'string' || note.trim().length < 4) {
      problems.push(
        `tool category ${JSON.stringify(category)} has no usable note in CATEGORY_NOTES ` +
          '(lib/listings.mjs) — the directory prints a one-clause note beside every category ' +
          'heading, and a category with none renders a bare word the reader cannot act on',
      );
    }
  }
  for (const named of Object.keys(notes)) {
    if (!categories.includes(named)) {
      problems.push(
        `CATEGORY_NOTES (lib/listings.mjs) describes ${JSON.stringify(named)}, which is not in ` +
          'TOOL_CATEGORIES (lib/schema.mjs) any more — remove it, or the note describes a value ' +
          'the schema rejects',
      );
    }
  }
  return problems;
}

/** The build gate. Throws naming every offending category, never only the first. */
export function assertCategoriesDescribed(opts = {}) {
  const problems = categoryProblems(opts);
  if (problems.length === 0) return true;
  throw new Error(
    `${problems.length} tool category problem(s):\n${problems.map((p) => `  - ${p}`).join('\n')}`,
  );
}

/**
 * Group listings by category, categories in name order.
 *
 * Takes the array `listingStates` returns — already A-to-Z — and keeps that
 * order inside each group, because `Array.prototype.filter` is stable. So the
 * within-category order is the *same* guarantee the flat page has always made,
 * not a second implementation of it that could drift.
 *
 * A category with no listings produces no group: an empty heading is a promise
 * the directory is not keeping.
 *
 * @param {{doc: object, state: object}[]} listings
 * @returns {{category: string, note: string, listings: object[]}[]}
 */
export function listingGroups(listings, opts = {}) {
  const categories = opts.categories ?? TOOL_CATEGORIES;
  const notes = opts.notes ?? CATEGORY_NOTES;
  assertCategoriesDescribed({ categories, notes });

  const known = new Set(categories);
  const unknown = listings
    .filter((l) => !known.has(l.doc.data.category))
    .map((l) => `${l.doc.slug} (${JSON.stringify(l.doc.data.category ?? null)})`);
  if (unknown.length > 0) {
    // The schema already refuses these, so reaching here means something built
    // a listing without going through it. Failing loudly beats dropping the
    // listing off a page whose whole point is that nothing is silently dropped.
    throw new Error(
      `${unknown.length} tool listing(s) carry a category outside the closed list: ` +
        `${unknown.join(', ')}. Allowed: ${[...categories].sort().join(', ')}`,
    );
  }

  return [...categories]
    .sort((a, b) => a.localeCompare(b))
    .map((category) => ({
      category,
      note: notes[category],
      listings: listings.filter((l) => l.doc.data.category === category),
    }))
    .filter((group) => group.listings.length > 0);
}
