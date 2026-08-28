/**
 * surfaces.mjs — the selector rules the surface specs assert.
 *
 * These are not editorial advice living in a brief somewhere; they are
 * refusals with names, enforced before a model is invoked.
 *
 *  - The blog ceiling (specs/blog): "the loop's selector SHALL refuse a
 *    `post` job whenever 3 published posts carry dates within the trailing 7
 *    days, so a capacity glut converts to depth rather than volume."
 *  - The tutorial demotion gate (specs/education-dynamic): no new tutorial
 *    while one stands demoted for staleness — unless its subject is dead,
 *    where archival, not re-verification, is the correct end state.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { BLOG_CEILING_DAYS, BLOG_CEILING_POSTS } from './config.mjs';
import { demotedTutorials } from './queue.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

function walkMarkdown(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkMarkdown(p, out);
    else if (/\.mdx?$/.test(e.name) && e.name !== 'README.md') out.push(p);
  }
  return out;
}

/** Published posts whose `date` falls in the trailing 7 days. */
export function recentPosts(ctx) {
  const now = ctx.now();
  const cutoff = now.getTime() - BLOG_CEILING_DAYS * DAY_MS;
  const hits = [];
  for (const path of walkMarkdown(ctx.blogDir)) {
    let fm = {};
    try {
      fm = matter(readFileSync(path, 'utf8')).data ?? {};
    } catch {
      continue;
    }
    // "published" — a draft has not been published, so it does not spend the
    // ceiling. Anything not explicitly a draft counts.
    if (fm.draft === true || fm.published === false || fm.status === 'draft') continue;
    const raw = fm.date ?? fm.published_on ?? null;
    const t = raw ? Date.parse(raw instanceof Date ? raw.toISOString() : String(raw)) : NaN;
    if (!Number.isFinite(t)) continue;
    if (t >= cutoff && t <= now.getTime() + DAY_MS) {
      hits.push({ path, date: new Date(t).toISOString().slice(0, 10) });
    }
  }
  hits.sort((a, b) => a.date.localeCompare(b.date));
  return hits;
}

/**
 * @returns {{ok: true} | {ok: false, rule: string, reason: string}}
 */
export function blogCeilingGate(ctx, candidate) {
  if (candidate.type !== 'post') return { ok: true };
  const recent = recentPosts(ctx);
  if (recent.length < BLOG_CEILING_POSTS) return { ok: true };
  return {
    ok: false,
    rule: 'blog:rolling-ceiling',
    reason:
      `${recent.length} published posts carry dates within the trailing ${BLOG_CEILING_DAYS} ` +
      `days (${recent.map((r) => r.date).join(', ')}), at or over the ceiling of ` +
      `${BLOG_CEILING_POSTS} — no post job is selectable, so a capacity glut converts to ` +
      `depth rather than volume`,
  };
}

export function tutorialDemotionGate(ctx, candidate) {
  if (candidate.type !== 'tutorial') return { ok: true };
  const demoted = demotedTutorials(ctx);
  if (demoted.length === 0) return { ok: true };
  const names = demoted.map((d) => d.id ?? d.slug ?? d.path ?? d.file ?? '(unnamed)');
  return {
    ok: false,
    rule: 'education-dynamic:demotion-gate',
    reason:
      `${demoted.length} tutorial(s) stand demoted for staleness (${names.join(', ')}); no new ` +
      `tutorial is started while one does. Archived tutorials with dead subjects do not block — ` +
      `these are not archived`,
  };
}

/**
 * Tutorial upkeep priority (specs/education-dynamic): re-verification wins
 * whenever both compete in the same tier.
 */
export function tutorialPriorityGate(candidate, allCandidates) {
  if (candidate.type !== 'tutorial') return { ok: true };
  const competing = allCandidates.filter((c) => c.tutorialVerify);
  if (competing.length === 0) return { ok: true };
  return {
    ok: false,
    rule: 'education-dynamic:verify-outranks-tutorial',
    reason:
      `a tutorial re-verification is competing in this tier ` +
      `(${competing.map((c) => c.title).join('; ')}); re-verifying existing tutorials takes ` +
      `priority over writing new ones`,
  };
}

/** Only used for reporting; keeps mtime out of the surface rules themselves. */
export function fileAgeDays(path, now) {
  return (now.getTime() - statSync(path).mtimeMs) / DAY_MS;
}
