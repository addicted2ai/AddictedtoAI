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
