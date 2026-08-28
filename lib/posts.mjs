/**
 * posts.mjs — blog ordering and the publishing ceiling (task 4.6, specs/blog).
 *
 * *"There SHALL be a ceiling of 3 published posts in any rolling 7 days ...
 * the build SHALL warn when the published set already exceeds the ceiling (a
 * warning, not a failure, so historical rebuilds never break)."*
 *
 * "Any rolling 7 days", not "the last 7 days": the window slides over the
 * whole archive, so a burst from two years ago is still reported. That is the
 * point of the warning — it is a record of the ceiling having been breached,
 * and a failure here would mean the archive could never be rebuilt.
 *
 * The window is closed at both ends: dates `d` through `d + 6` inclusive are
 * seven days. Four posts inside that span trip it; four posts spanning eight
 * days do not.
 */

import { daysBetween } from './facts.mjs';

export const POST_CEILING = 3;
export const CEILING_WINDOW_DAYS = 7;

/** Posts newest first — the only order a blog index is ever in. */
export function postsNewestFirst(posts) {
  return [...posts].sort(
    (a, b) => b.data.date.localeCompare(a.data.date) || a.slug.localeCompare(b.slug),
  );
}

/**
 * Every rolling 7-day window that holds more than the ceiling.
 * @returns {{start: string, end: string, dates: string[], count: number}[]}
 */
export function ceilingBreaches(posts) {
  const sorted = [...posts].sort((a, b) => a.data.date.localeCompare(b.data.date));
  const breaches = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const start = sorted[i].data.date;
    const inWindow = [];
    for (let j = i; j < sorted.length; j += 1) {
      const span = daysBetween(start, sorted[j].data.date);
      if (span === null || span >= CEILING_WINDOW_DAYS) break;
      inWindow.push(sorted[j]);
    }
    if (inWindow.length > POST_CEILING) {
      breaches.push({
        start,
        end: inWindow[inWindow.length - 1].data.date,
        count: inWindow.length,
        dates: inWindow.map((p) => p.data.date),
        files: inWindow.map((p) => p.file),
      });
    }
  }
  // Only the widest breach per start date matters; a window fully contained in
  // an earlier reported one says nothing new.
  return breaches.filter(
    (b, i) => !breaches.some((o, j) => j < i && o.start <= b.start && o.end >= b.end),
  );
}

/** Warn (never fail) for the whole published set. */
export function warnPostCeiling(posts, diags) {
  for (const b of ceilingBreaches(posts)) {
    diags.warn({
      file: b.files[b.files.length - 1],
      field: `${b.start}..${b.end}`,
      message:
        `${b.count} published posts carry dates within 7 days (${b.dates.join(', ')}), over the ceiling of ` +
        `${POST_CEILING} in any rolling 7 days (specs/blog). A warning, not a failure: the ceiling is ` +
        `enforced when a post job is selected, and historical rebuilds must never break.`,
      rule: 'post-ceiling',
    });
  }
}

/**
 * A post's corrections, oldest first. specs/blog: a correction is *appended*,
 * dated, and never replaces the original text — the template renders the body
 * unchanged and the corrections after it.
 */
export function corrections(doc) {
  return [...(doc.data.corrections ?? [])].sort((a, b) => a.date.localeCompare(b.date));
}
