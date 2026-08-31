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
import { CURRICULUM_FILE, relPath } from './paths.mjs';

/**
 * The catalog heading in the curriculum of record, and the pattern one entry
 * makes. Entries look like ``#### `what-a-model-is` — "What a model is"``.
 */
const CATALOG_HEADING = /^## §4\b/m;
const SECTION_HEADING = /^## §/m;
const ENTRY = /^#### `([a-z0-9]+(?:-[a-z0-9]+)*)`/gm;

/**
 * Every page slug the curriculum's catalog enumerates, in document order.
 *
 * SCOPED TO §4 ON PURPOSE. Parsing the whole document for the entry pattern
 * returns the same 38 slugs today — measured — but it is right by luck: a
 * glossary item or an example written as ``#### `some-term` `` anywhere in a
 * 1,379-line document would silently become a phantom curriculum entry. A
 * phantom entry is worse than a missed one, because it is a permanent queue
 * item for a page that must never be written — the stuck-item failure the
 * Pulse's rank table works hard to avoid everywhere else.
 *
 * @returns {string[]|null} the slugs, or `null` when there is no catalog
 *   section at all. `null` and `[]` are different facts: "the map is
 *   unreadable" is a build failure naming the map, and "the map is empty" is a
 *   corpus in which every published page is undeclared.
 */
export function curriculumSlugs(text) {
  const src = String(text ?? '');
  const start = CATALOG_HEADING.exec(src);
  if (!start) return null;
  const after = src.slice(start.index + start[0].length);
  const end = SECTION_HEADING.exec(after);
  const section = end ? after.slice(0, end.index) : after;

  const seen = new Set();
  const out = [];
  for (const m of section.matchAll(ENTRY)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push(m[1]);
  }
  return out;
}

/**
 * Every published learn page must appear in the curriculum of record
 * (specs/education-static: *"A learn page SHALL NOT publish unless it appears
 * in the curriculum"*).
 *
 * That sentence has been in force since `teach-the-whole-subject` was archived
 * and has never had an implementation — not in the schema, not here, not in a
 * prebuild step, not in a test. The correspondence between map and corpus was
 * established once by a human reading both, and a page added since could have
 * validated, built, rendered and published with no entry at all. This is the
 * mechanism, in this repository's own preferred form: a violation stops the
 * build and names the file and the field, rather than warning.
 *
 * An unreadable curriculum is ONE error naming the curriculum, not one per
 * page. Thirty-eight identical "undeclared" errors would bury the only fact
 * that matters, which is that the map is gone.
 */
export function checkCurriculumCoverage(learnDocs, curriculumText, diags, { file = null } = {}) {
  const where = file ?? relPath(CURRICULUM_FILE);
  const declared = curriculumSlugs(curriculumText);

  if (declared === null) {
    diags.error({
      file: where,
      field: 'catalog',
      message:
        `the learn curriculum of record (${where}) is missing or has no "## §4" catalog ` +
        `section, so no page can be checked against it — every published learn page is ` +
        `undeclared until that file is readable again (specs/education-static)`,
      rule: 'learn-no-curriculum',
    });
    return;
  }

  const inMap = new Set(declared);
  for (const doc of [...learnDocs].sort((a, b) => a.slug.localeCompare(b.slug))) {
    if (inMap.has(doc.slug)) continue;
    diags.error({
      file: doc.file,
      field: 'slug',
      message:
        `"${doc.slug}" appears in no entry of the curriculum of record (${where}) — a learn ` +
        `page may not publish unless the curriculum declares it, with its area, rung, ` +
        `prerequisites, outcome and bounds. Add the entry in this same change ` +
        `(specs/education-static)`,
      rule: 'learn-undeclared',
    });
  }
}

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

/**
 * A prerequisite must sit on the same or an earlier rung of the ladder — a
 * page that assumes something taught later would send an in-order reader
 * forward for it. A violation is a build error naming the page, the field,
 * both slugs and both levels.
 */
export function checkPrerequisiteLevels(learnDocs, diags) {
  const bySlug = new Map(learnDocs.map((d) => [d.slug, d]));

  for (const doc of [...learnDocs].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const pageIndex = LEARN_LEVELS.indexOf(doc.data.level);
    for (const slug of doc.data.prerequisites ?? []) {
      const prereq = bySlug.get(slug);
      if (!prereq) continue;
      const prereqIndex = LEARN_LEVELS.indexOf(prereq.data.level);
      if (prereqIndex > pageIndex) {
        diags.error({
          file: doc.file,
          field: 'prerequisites',
          message: `prerequisite "${slug}" (${prereq.data.level}) sits above "${doc.slug}" (${doc.data.level}) on the ladder — a prerequisite must be on the same level or earlier`,
          rule: 'learn-level',
        });
      }
    }
  }
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
