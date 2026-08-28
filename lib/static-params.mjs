/**
 * static-params.mjs — the empty-collection guard for dynamic routes.
 *
 * **Measured, not assumed.** Under `output: 'export'`, Next 15.5 rejects a
 * dynamic route whose `generateStaticParams()` returns an empty array with
 * *"Page "/x/[slug]" is missing "generateStaticParams()" so it cannot be used
 * with "output: export" config"* — the same message it gives when the
 * function is genuinely absent. Observed on this tree: with zero learn pages
 * the build failed on `/learn/[slug]`; adding one learn page moved the same
 * failure to `/impossible-routine/[slug]`, which still had none.
 *
 * That makes "this surface has no content yet" a build-breaking state, which
 * it must not be. Every surface here is allowed to be empty — specs/blog is
 * explicit that "zero posts in a week is a normal, healthy outcome" — and a
 * site whose build fails when a collection empties has a floor nobody
 * declared.
 *
 * The guard: when a collection is empty, hand Next one placeholder param. The
 * page calls `notFound()` for it, so what lands in `out/` at that path is the
 * 404 page. It is never linked (the route table is built from the corpus,
 * which has nothing to link), it carries the 404's own metadata, and it
 * disappears the moment the collection has a single real member.
 */

/** A slug that cannot collide with a real one: real slugs are kebab-case. */
export const EMPTY_SENTINEL = '__none__';

/**
 * @param {object[]} params  the real params, possibly none
 * @param {string} [key]     the dynamic segment's name
 */
export function withEmptyGuard(params, key = 'slug') {
  return params.length > 0 ? params : [{ [key]: EMPTY_SENTINEL }];
}

export function isSentinel(value) {
  return value === EMPTY_SENTINEL;
}
