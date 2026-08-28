/**
 * proposals.mjs — work source 3, the only model-originated source.
 *
 * Two mechanisms, both deliberately dumb (specs/loop):
 *
 *  1. COOLING. A proposal cools for at least 3 days (file age) before it is
 *     selectable. Ideas that still look good after three days are a different
 *     population from ideas that look good the minute they occur.
 *
 *  2. DUPLICATE SUPPRESSION, exact and deterministic. A new proposal whose
 *     `slug` equals a rejected proposal's `slug` is auto-discarded with a
 *     pointer to the earlier reason, SPENDING NO INFERENCE. That is the whole
 *     automatic mechanism. Differently-worded resubmissions are caught by the
 *     reviewer — the rejection index travels in the review checklist — never
 *     by fuzzy matching, "because fuzzy matching is guessing".
 *
 * Cooling uses file mtime, which is what specs/loop says ("file age"), not the
 * front-matter date. The front-matter date is content, and content is written
 * by the same models that write proposals; a backdated `date:` would buy
 * instant selection. mtime cannot be set by writing the file's text. The known
 * cost, recorded rather than hidden: a fresh `git clone` resets every mtime, so
 * proposals re-cool for three days after a clone. That fails safe.
 */

import {
  readdirSync,
  readFileSync,
  statSync,
  existsSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
} from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import { JOB_TYPES, PROPOSAL_COOLING_DAYS } from './config.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

function readMarkdownDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
    .map((e) => {
      const path = join(dir, e.name);
      const raw = readFileSync(path, 'utf8');
      let fm = {};
      let body = raw;
      try {
        const parsed = matter(raw);
        fm = parsed.data ?? {};
        body = parsed.content ?? '';
      } catch {
        /* a proposal with unparseable front matter is reported below, not thrown */
      }
      return { path, file: e.name, fm, body, mtimeMs: statSync(path).mtimeMs };
    });
}

/** The rejection index: `data/proposals/rejected/`. */
export function rejectionIndex(ctx) {
  return readMarkdownDir(ctx.rejectedDir).map((p) => ({
    slug: p.fm.slug ?? basename(p.file, '.md'),
    reason: p.fm.rejection_reason ?? p.fm.reason ?? extractReason(p.body),
    file: p.file,
    path: p.path,
  }));
}

function extractReason(body) {
  const m = /(?:^|\n)#+\s*(?:rejection reason|rejected)[^\n]*\n+([^\n]+)/i.exec(body);
  if (m) return m[1].trim();
  const line = body.split('\n').find((l) => /reason\s*:/i.test(l));
  return line ? line.replace(/^.*reason\s*:\s*/i, '').trim() : '(no reason recorded)';
}

/**
 * Read the active proposals, classifying each as ripe / cooling / duplicate /
 * malformed. Nothing is invoked; this whole function is pre-inference.
 */
export function readProposals(ctx) {
  const now = ctx.now();
  const rejected = rejectionIndex(ctx);
  const rejectedBySlug = new Map(rejected.map((r) => [r.slug, r]));
  const ripe = [];
  const duplicates = [];
  const cooling = [];
  const malformed = [];

  for (const p of readMarkdownDir(ctx.proposalsDir)) {
    const slug = p.fm.slug;
    const type = p.fm.type ?? p.fm.job_type;
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      malformed.push({ path: p.path, why: 'missing or non-kebab-case `slug` in front matter' });
      continue;
    }
    if (!JOB_TYPES.includes(type)) {
      malformed.push({
        path: p.path,
        why: `\`type\` ${JSON.stringify(type ?? null)} is not in the closed job-type list`,
      });
      continue;
    }
    const dup = rejectedBySlug.get(slug);
    if (dup) {
      duplicates.push({
        path: p.path,
        slug,
        earlier: dup,
        why:
          `slug "${slug}" was rejected before (${dup.file}); auto-discarded with a pointer to ` +
          `the earlier reason: ${dup.reason}`,
      });
      continue;
    }
    const ageDays = (now.getTime() - p.mtimeMs) / DAY_MS;
    const candidate = {
      source: 'proposal',
      type,
      slug,
      path: p.path,
      ageDays,
      title: p.fm.title ?? p.fm.summary ?? slug,
      detail: `${p.fm.summary ?? ''}\n\n${p.body}`.trim(),
      evidence: p.fm.evidence ?? null,
    };
    if (ageDays < PROPOSAL_COOLING_DAYS) {
      cooling.push({
        ...candidate,
        why:
          `proposal "${slug}" is ${ageDays.toFixed(1)} days old; it cools for ` +
          `${PROPOSAL_COOLING_DAYS} days (file age) before it is selectable`,
      });
      continue;
    }
    ripe.push(candidate);
  }
  ripe.sort((a, b) => b.ageDays - a.ageDays); // oldest ripe first
  return { ripe, cooling, duplicates, malformed, rejected };
}

/**
 * Carry out the auto-discard of a duplicate: move it into the rejection index
 * with the pointer appended. Called before any model is invoked.
 */
export function discardDuplicate(ctx, dup, { dryRun = false } = {}) {
  const stamp = ctx.now().toISOString().replace(/[-:]/g, '').replace(/\..*/, '');
  const dest = join(ctx.rejectedDir, `${dup.slug}.duplicate-${stamp}.md`);
  if (dryRun) return { moved: false, dest, why: dup.why };
  mkdirSync(ctx.rejectedDir, { recursive: true });
  const original = readFileSync(dup.path, 'utf8');
  const note =
    `\n\n---\n\n## Auto-discarded as a duplicate\n\n` +
    `- date: ${ctx.now().toISOString().slice(0, 10)}\n` +
    `- duplicate of: \`${dup.earlier.file}\` (slug \`${dup.slug}\`)\n` +
    `- earlier rejection reason: ${dup.earlier.reason}\n\n` +
    `Exact slug match against the rejection index. No model was invoked; no ` +
    `inference was spent. A differently-worded resubmission is the reviewer's ` +
    `to catch, not this check's.\n`;
  writeFileSync(dest, original + note, 'utf8');
  unlinkSync(dup.path);
  return { moved: true, dest, why: dup.why };
}

/** The rejection index as review-brief text (specs/review). */
export function rejectionIndexText(ctx) {
  const idx = rejectionIndex(ctx);
  if (idx.length === 0) return '_The rejection index is empty._';
  return idx
    .map((r) => `- \`${r.slug}\` — ${r.reason}`)
    .join('\n');
}
