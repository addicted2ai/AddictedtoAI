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
 * **Known gap, recorded rather than papered over.** The first rule says
 * "passed review", and review verdicts live in `data/reviews/` keyed by job
 * id or seed slug — there is no declared mapping from an entry id to its
 * verdict file, so the build cannot currently join them. `hasApprovedReview`
 * is the injection point for that join; its default treats a prose body as
 * sufficient, which is the pre-review-flow behaviour. When task 6.5 or 7.4
 * settles the naming, pass a real predicate here and the rule tightens with
 * no other change.
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
  if (OBITUARY_STATUSES.has(entry.status)) reasons.push('lifecycle-status');

  return { indexed: reasons.length > 0, reasons, stub: !doc.hasBody };
}

/** The robots value a page template renders. */
export function robotsFor(doc, opts) {
  return indexability(doc, opts).indexed ? 'index,follow' : 'noindex,follow';
}

/** Entries a browse listing may show. Stubs are excluded by rule, not by taste. */
export function browsableEntries(entries, opts) {
  return entries.filter((doc) => indexability(doc, opts).indexed);
}
