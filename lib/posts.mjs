/**
 * posts.mjs — blog ordering and corrections (task 4.6, specs/blog).
 *
 * **There is no count ceiling here, and that is deliberate** (change
 * `make-the-blog-worth-sending`, task 1.3). This module used to carry
 * `POST_CEILING = 3` and a rolling-window build warning; the selector carried
 * a second copy of the same number. Both are gone. Publishing is gated on
 * whether a post is worth a stranger's time, judged at review — not on how
 * many posts a window already holds. Nothing in the build counts published
 * posts any more, so nothing has to be told that zero in a week is fine.
 */

/** Posts newest first — the only order a blog index is ever in. */
export function postsNewestFirst(posts) {
  return [...posts].sort(
    (a, b) => b.data.date.localeCompare(a.data.date) || a.slug.localeCompare(b.slug),
  );
}

/**
 * A post's corrections, oldest first. specs/blog: a correction is *appended*,
 * dated, and never replaces the original text — the template renders the body
 * unchanged and the corrections after it.
 */
export function corrections(doc) {
  return [...(doc.data.corrections ?? [])].sort((a, b) => a.date.localeCompare(b.date));
}
