/**
 * learn.mjs — the static-education ladder (task 4.4, specs/education-static).
 *
 * *"The ladder's index page SHALL be generated from these declarations, never
 * hand-maintained."* So there is no ordering file: the index is a pure
 * function of every page's `level` and `prerequisites`, and adding a page to
 * the ladder is writing the page.
 *
 * Ordering, in this order:
 *   1. level, by the ladder's own order (`LEARN_LEVELS` in schema.mjs),
 *   2. within a level, prerequisites before dependants — a page that assumes
 *      another is listed after it, so reading top to bottom never sends you
 *      forward for something you needed already,
 *   3. ties broken by title, so the index is stable between builds.
 *
 * Step 2 is a topological sort over the `prerequisites` graph, restricted to
 * pages on the same rung. A prerequisite cycle would make the order
 * arbitrary, so it is a build error rather than a silently-chosen order.
 */

import { LEARN_LEVELS } from './schema.mjs';

/** Detect a cycle in the prerequisite graph and report it, naming the ring. */
export function checkPrerequisiteCycles(learnDocs, diags) {
  const bySlug = new Map(learnDocs.map((d) => [d.slug, d]));
  const state = new Map(); // slug -> 'open' | 'done'
  const stack = [];

  const visit = (slug) => {
    if (state.get(slug) === 'done') return;
    if (state.get(slug) === 'open') {
      const ring = stack.slice(stack.indexOf(slug)).concat(slug).join(' -> ');
      diags.error({
        file: bySlug.get(slug).file,
        field: 'prerequisites',
        message: `prerequisite cycle: ${ring} — a page cannot, directly or indirectly, be its own prerequisite`,
        rule: 'learn-cycle',
      });
      return;
    }
    state.set(slug, 'open');
    stack.push(slug);
    for (const p of bySlug.get(slug)?.data.prerequisites ?? []) {
      if (bySlug.has(p)) visit(p);
    }
    stack.pop();
    state.set(slug, 'done');
  };

  for (const doc of [...learnDocs].sort((a, b) => a.slug.localeCompare(b.slug))) visit(doc.slug);
}

/** Depth in the prerequisite graph — how many rungs of assumption deep. */
function depths(learnDocs) {
  const bySlug = new Map(learnDocs.map((d) => [d.slug, d]));
  const memo = new Map();
  const depth = (slug, seen = new Set()) => {
    if (memo.has(slug)) return memo.get(slug);
    if (seen.has(slug)) return 0; // cycle: already reported, do not hang
    seen.add(slug);
    const prereqs = (bySlug.get(slug)?.data.prerequisites ?? []).filter((p) => bySlug.has(p));
    const d = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map((p) => depth(p, seen)));
    memo.set(slug, d);
    return d;
  };
  const out = new Map();
  for (const doc of learnDocs) out.set(doc.slug, depth(doc.slug));
  return out;
}

/**
 * The generated ladder: levels in order, each with its pages in order.
 * @returns {{level: string, index: number, pages: object[]}[]}
 */
export function ladder(learnDocs) {
  const d = depths(learnDocs);
  const byLevel = new Map(LEARN_LEVELS.map((l) => [l, []]));
  for (const doc of learnDocs) byLevel.get(doc.data.level).push(doc);

  return LEARN_LEVELS.map((level, index) => ({
    level,
    index,
    pages: byLevel
      .get(level)
      .sort(
        (a, b) =>
          d.get(a.slug) - d.get(b.slug) || a.data.title.localeCompare(b.data.title),
      ),
  })).filter((rung) => rung.pages.length > 0);
}

/** The flat reading order — the ladder, unrolled. Used for prev/next. */
export function readingOrder(learnDocs) {
  return ladder(learnDocs).flatMap((rung) => rung.pages);
}

/** A page's prerequisites as links, in the order the author declared them. */
export function prerequisiteLinks(doc, learnDocs) {
  const bySlug = new Map(learnDocs.map((d) => [d.slug, d]));
  return doc.data.prerequisites
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .map((p) => ({ slug: p.slug, url: p.url, title: p.data.title, level: p.data.level }));
}
