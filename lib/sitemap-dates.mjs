/**
 * sitemap-dates.mjs — the `lastModified` decision shared by every prose
 * surface `app/sitemap.ts` lists (addictedtoai-dwo, addictedtoai-3u1).
 *
 * Pulled out of `app/sitemap.ts` for the same reason `lib/reviews.mjs`'s own
 * header gives for `reviewStateReport`: a decision buried inside a page
 * component is only provable by running `next build` and reading the export;
 * moved out where a test can call it directly, it is provable in
 * milliseconds. `app/sitemap.ts` imports these functions rather than
 * defining them, so there is exactly one implementation to test.
 *
 * THE DECISION (see `app/sitemap.ts` for the full argument): a page here is
 * exactly two things — **prose** and the **bound facts** rendered into it —
 * and `lastModified` is the later of the two dates the corpus already
 * records for them:
 *
 *   prose   the `date:` inside the review record that bound to this file
 *           (`lib/reviews.mjs`'s join). Any of the three states a bound
 *           record can carry — `recorded`, `mismatched`, `unbound` — still
 *           yields this date: a mismatch is a bookkeeping problem the review
 *           layer already refuses to let touch indexability, and an unbound
 *           record is exactly as informative as it was before this existed.
 *           Only `missing` (no record joins at all) yields nothing.
 *   facts   the newest line of the changed feed that joins to this page's own
 *           id, or to any id it transcluded a fact from.
 *
 * A page with neither date gets no `lastModified` at all — that is a
 * deliberate answer, not a gap: the sitemap spec treats the field as
 * optional, and an absent date is honest where a guessed one would not be.
 */

import { recencyOf } from './reviews.mjs';

/** The later of two `YYYY-MM-DD` strings; either may be absent. */
export function later(a, b) {
  if (a && b) return a > b ? a : b;
  return a ?? b ?? undefined;
}

/**
 * The newest of a list of `YYYY-MM-DD` strings, any of which may be absent
 * (addictedtoai-1r7). `later()` folded over the list, so a list with no
 * defined date at all — an index whose entire membership has no lastmod of
 * its own — resolves to `undefined`, the same conservative answer a single
 * missing date already gets, never a guess.
 */
export function newest(dates) {
  return (dates ?? []).reduce(later, undefined);
}

/**
 * Entry id -> the newest changed-feed line date that joins to it.
 *
 * Built from the feed the home page renders (`site.changes`), so materiality
 * is defined in exactly one place (addictedtoai-8ho) and the sitemap cannot
 * disagree with the front page about what counts as a change.
 */
export function buildChangedOnMap(changes) {
  const changedOn = new Map();
  for (const line of changes ?? []) {
    if (!line.entry?.id || !line.date) continue;
    const prev = changedOn.get(line.entry.id);
    if (!prev || line.date > prev) changedOn.set(line.entry.id, line.date);
  }
  return changedOn;
}

/**
 * The `date:` of the review record that bound to this file — the prose date.
 *
 * `reviewsByFile` is `site.reviews.byFile` (`lib/reviews.mjs`'s join):
 * present for `recorded`, `mismatched` and `unbound`; absent for `missing`.
 */
export function reviewedOn(doc, reviewsByFile) {
  const hit = reviewsByFile?.get(doc.file);
  const r = hit ? recencyOf(hit.record) : null;
  return r ? `${r.day.slice(0, 4)}-${r.day.slice(4, 6)}-${r.day.slice(6, 8)}` : undefined;
}

/**
 * The newest material change in anything this page renders — its own bound
 * facts, and any fact it transcluded from another entry.
 *
 * A delta has no `data.id` (it is not an entry) and, unless its body
 * transcludes a `{{fact:…}}`, `doc.transcluded` carries none either, so this
 * returns `undefined` for a delta today — `contentChangedOn` then rests on
 * `reviewedOn` alone. Nothing here special-cases that; the same function
 * that resolves it for a wiki entry or a learn page resolves it for a delta.
 */
export function factsMovedOn(doc, changedOn) {
  let best = doc.data?.id ? changedOn?.get(doc.data.id) : undefined;
  for (const ref of doc.transcluded?.facts ?? []) {
    best = later(best, changedOn?.get(String(ref).split('#')[0]));
  }
  return best;
}

/** A page's `lastModified`: the later of its prose date and its facts' date. */
export function contentChangedOn(doc, reviewsByFile, changedOn) {
  return later(reviewedOn(doc, reviewsByFile), factsMovedOn(doc, changedOn));
}

/**
 * A BLOG POST's `lastModified` — the later of `contentChangedOn` and the
 * post's own `date:`.
 *
 * ## Why a post needs its own function, found 2026-09-03 by a gate
 *
 * A post carried TWO definitions of one date and they disagreed the first
 * time a published post was ever edited. `app/sitemap.ts` sent
 * `doc.data.date`; `app/blog/[slug]/page.tsx` sent `contentChangedOn(doc)`.
 * Job `j-20260903-15` revised `glm-5-3-license-revenue-gate` and wrote a
 * review record dated 2026-09-03, so the graph moved and the sitemap did not,
 * and `verify-surfaces` failed with `graph 2026-09-03 vs sitemap 2026-09-02`.
 * `lib/site.mjs` asserted the two were "the same number by construction" and
 * `lib/jsonld.mjs`'s header states the invariant outright — both were written
 * from what the design meant to do, and the check is what measured it.
 *
 * Neither side was simply wrong, which is why this is `later` and not a
 * choice between them:
 *
 *  - The post's `date:` is its PUBLICATION date. It is already `datePublished`
 *    in the graph, and using it as `dateModified` would mean an edited post
 *    never reports being edited.
 *  - `contentChangedOn` alone would drop `lastModified` entirely from a post
 *    with no joined review record — absent rather than wrong, but a real loss
 *    of coverage on a surface where the date is the point.
 *
 * `later` of the two is ≥ `date:` always, so coverage cannot regress, and it
 * moves the moment the post is revised. Both callers use THIS function now,
 * which is the property the whole module exists for: one implementation, so
 * the sitemap and the structured data cannot drift again.
 *
 * The three other described kinds were checked at the same time and all
 * already agreed — deltas and wiki entries send `contentChangedOn` on both
 * sides, tools send `last_verified` on both.
 */
export function postChangedOn(doc, reviewsByFile, changedOn) {
  return later(contentChangedOn(doc, reviewsByFile, changedOn), doc?.data?.date);
}
