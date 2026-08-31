/**
 * indexability.mjs — derived `noindex` for wiki entries (task 2.9, specs/wiki).
 *
 * "The indexability decision SHALL be derived at build time from these rules,
 * never authored by hand." There is deliberately no front-matter field an
 * author can set to force indexing; the only input is what the entry is.
 *
 * An entry is indexed when **any** of:
 *   - it has a prose body that passed review,
 *   - it has 2 or more facts and at least one recorded timeline event,
 *   - its status is `deprecated`, `retired` or `dead` (the obituary rule —
 *     the vendor deletes theirs).
 *
 * Otherwise it is a stub: the page still renders and is still findable
 * through the client-side name search and the open dataset, but it carries
 * `noindex` and appears in no browse listing.
 *
 * **"Passed review", and what that clause can actually decide.** Verdict
 * records live in `data/reviews/`. `lib/reviews.mjs` holds the single join
 * from a piece to its record — the resolution `scripts/verify-launch.mjs`
 * settled in task 6.6, moved out so the build and the launch check cannot
 * drift — and `build-content.mjs` passes its predicate in here on every build.
 * An entry whose record says `revise`, `reject`, or nothing parseable loses
 * the `prose-body` reason and renders `noindex`; one whose record says
 * `approve` keeps it.
 *
 * An entry with NO record keeps it too, and that is a decision rather than an
 * oversight: from here, "nobody reviewed this" and "the record is filed under
 * a name this join does not recognise" are the same observation, and treating
 * absence as failure would silently de-index approved work over a naming
 * mismatch. Absence is reported instead — `verify-launch` fails the launch and
 * names every piece missing one, and the prebuild counts them every build. The
 * limit of that is stated in `lib/reviews.mjs`'s header, with the reason.
 *
 * `hasApprovedReview` stays an injection point: called with no `opts` — as a
 * unit test does — the rules read exactly as specs/wiki writes them, with the
 * review clause unconstrained.
 */

const OBITUARY_STATUSES = new Set(['deprecated', 'retired', 'dead']);

/**
 * @param {object} doc  an entry doc from `loadCorpus`
 * @param {object} [opts]
 * @param {(id: string) => boolean} [opts.hasApprovedReview]
 * @returns {{indexed: boolean, reasons: string[], stub: boolean}}
 */
export function indexability(doc, opts = {}) {
  const hasApprovedReview = opts.hasApprovedReview ?? (() => true);
  const entry = doc.data;
  const reasons = [];

  if (doc.hasBody && hasApprovedReview(entry.id)) reasons.push('prose-body');
  if ((entry.facts ?? []).length >= 2 && (entry.timeline ?? []).length >= 1) {
    reasons.push('facts-and-timeline');
  }
  // `doc.currentStatus` (addictedtoai-ij4h), when present, is the entry's
  // PRESENTED status — front matter as-authored for a reviewed prose entry,
  // else the resolved feed value for a stub, which is the one case this rule
  // exists to reach: "the vendor deletes theirs" only holds if a stub whose
  // feed already reports it dead gets force-indexed, and a stub's `status:`
  // is never hand-maintained so it is the value most likely to have drifted.
  // Falls back to raw front matter when unset (a fixture doc built without
  // going through `build-content.mjs`'s full pipeline), preserving today's
  // behaviour exactly for every caller that never sets it.
  if (OBITUARY_STATUSES.has(doc.currentStatus ?? entry.status)) reasons.push('lifecycle-status');

  return { indexed: reasons.length > 0, reasons, stub: !doc.hasBody };
}

/** The robots value a page template renders. */
export function robotsFor(doc, opts) {
  return indexability(doc, opts).indexed ? 'index,follow' : 'noindex,follow';
}

/**
 * Entries a browse listing may show. Stubs are excluded by rule, not by taste.
 *
 * A built doc carries `doc.index`, computed once in `build-content.mjs` with
 * the real review predicate, and that is preferred over recomputing here. The
 * two halves of the rule — "carries `noindex`" and "appears in no browse
 * listing" — are one decision in specs/wiki, and recomputing would have let
 * them disagree: `lib/site.mjs` calls this with no `opts`, so the listing
 * would have been built from the unconstrained default while the page's own
 * robots tag came from `doc.index`.
 */
export function browsableEntries(entries, opts) {
  return entries.filter((doc) => (doc.index ?? indexability(doc, opts)).indexed);
}
