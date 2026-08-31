/**
 * proposals.mjs — work source 3, the only model-originated source.
 *
 * Four mechanisms, all deliberately dumb (specs/loop):
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
 *  3. EXPIRY. A proposal declaring `expires:` skips cooling and stops being
 *     selectable at its expiry, when it is swept to `data/proposals/dropped/`.
 *     Cooling filters IDEAS by whether they survive three days; expiry filters
 *     EVIDENCE by the date it stops being news. A candidate carries whichever
 *     fits it. The sweep is what stops the candidate directory becoming the
 *     ten-weeks-of-backlog queue the predecessor named as its own bottleneck.
 *
 *  4. THE MERGE CAPS. At a job's merge the loop keeps at most the number of
 *     added proposal files that job's rule allows (three for `scout`, one for
 *     everything else), stamps the proposing job's type onto each kept file,
 *     and auto-discards any proposal whose stamped type equals the type it
 *     proposes. Mechanisms, not requests of the model.
 *
 * Cooling uses file mtime, which is what specs/loop says ("file age"), not the
 * front-matter date. The front-matter date is content, and content is written
 * by the same models that write proposals; a backdated `date:` would buy
 * instant selection. mtime cannot be set by writing the file's text. The known
 * cost, recorded rather than hidden: a fresh `git clone` resets every mtime, so
 * proposals re-cool for three days after a clone. That fails safe.
 *
 * `expires:` is the deliberate exception, and the cost is recorded in the
 * change's design (D2.3): any job could dodge cooling by declaring one. That is
 * accepted because an expiring candidate self-destructs if it is not selected
 * promptly, and because cooling's purpose — ideas that still look good three
 * days later — has no meaning for evidence with a shelf life.
 *
 * EVERY DATE HERE IS A LOCAL DATE (CLAUDE.md). An expiry is compared against
 * the local date of the machine reading it, and the comparison is done on the
 * literal `YYYY-MM-DD` digits taken from the file's own bytes — never on a
 * `Date` object, because a bare YAML date parses to UTC midnight and a machine
 * west of Greenwich would then sweep a candidate a day early.
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
import { declaredIssueIds, ISSUE_PREFIX } from './issues.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How many proposal files one job's merged branch may add. The scout's outcome
 * IS filing candidates, so it gets three (specs/loop, "The scout looks
 * outward, takes the best three, and records the rest"); every other type may
 * file at most one as a side-output of whatever it noticed.
 */
export const PROPOSAL_CAP_BY_TYPE = Object.freeze({ scout: 3 });
export const DEFAULT_PROPOSAL_CAP = 1;

export function proposalCapFor(type) {
  return Object.prototype.hasOwnProperty.call(PROPOSAL_CAP_BY_TYPE, type)
    ? PROPOSAL_CAP_BY_TYPE[type]
    : DEFAULT_PROPOSAL_CAP;
}

/** `data/proposals/dropped/` — a RECORD, never a block. See `rejectionIndex`. */
export function droppedDir(ctx) {
  return ctx.droppedDir ?? join(ctx.proposalsDir, 'dropped');
}

/**
 * The LOCAL date of the machine that is writing, as `YYYY-MM-DD`.
 *
 * Not `toISOString().slice(0, 10)`, which is UTC: on 2026-08-28 a session that
 * ran past UTC midnight split one wave of work across two dates because half
 * of it used each convention (CLAUDE.md). Every date this module writes or
 * compares goes through here.
 */
export function localDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const FM_BLOCK = /^﻿?(---[ \t]*\r?\n)([\s\S]*?)(\r?\n---[ \t]*(?:\r?\n|$))/;

/**
 * The `expires:` value as the literal digits the file carries.
 *
 * Read from the RAW front-matter text first, not from the parsed value. A bare
 * `expires: 2026-09-10` is a YAML 1.1 timestamp, so js-yaml hands back a `Date`
 * at UTC midnight; formatting that back with local getters west of Greenwich
 * yields 2026-09-09 and the candidate dies a day early. The bytes cannot drift
 * like that. The parsed value is only the fallback, and it is read with UTC
 * getters because UTC midnight is exactly how js-yaml built it.
 *
 * @returns {{present: boolean, date?: string, invalid?: boolean, literal?: string}}
 */
export function readExpiry(raw, fm = {}) {
  const block = FM_BLOCK.exec(String(raw ?? ''));
  let literal = null;
  if (block) {
    const m = /^[ \t]*expires[ \t]*:[ \t]*(.*)$/m.exec(block[2]);
    if (m) {
      literal = m[1]
        .replace(/\s+#.*$/, '')          // a trailing YAML comment
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .trim();
    }
  }
  if (literal === null) {
    const v = fm.expires ?? fm.expiry ?? null;
    if (v === null || v === undefined || v === '') return { present: false };
    if (v instanceof Date) {
      if (Number.isNaN(v.getTime())) return { present: true, invalid: true, literal: String(v) };
      const p = (n) => String(n).padStart(2, '0');
      return {
        present: true,
        date: `${v.getUTCFullYear()}-${p(v.getUTCMonth() + 1)}-${p(v.getUTCDate())}`,
      };
    }
    literal = String(v).trim();
  }
  if (literal === '') return { present: false };
  const iso = /^(\d{4}-\d{2}-\d{2})(?:[T ]|$)/.exec(literal);
  if (!iso) return { present: true, invalid: true, literal };
  return { present: true, date: iso[1], literal };
}

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
      return { path, file: e.name, fm, body, raw, mtimeMs: statSync(path).mtimeMs };
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
 * Read the active proposals, classifying each as ripe / cooling / expired /
 * duplicate / malformed. Nothing is invoked; this whole function is
 * pre-inference, and it is pure: the `expired` bucket is CLASSIFICATION, and
 * moving those files is `sweepExpired`'s job so that `--dry-run` can report the
 * sweep without performing it.
 */
export function readProposals(ctx) {
  const now = ctx.now();
  const today = localDate(now);
  const rejected = rejectionIndex(ctx);
  const rejectedBySlug = new Map(rejected.map((r) => [r.slug, r]));
  const ripe = [];
  const duplicates = [];
  const cooling = [];
  const expired = [];
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
    // The beads join, format-checked here beside `slug` and `type` and never
    // resolved against the store (`addictedtoai-occ0`). A DECLARED field is a
    // promise about its own shape, so a malformed one is reported and the
    // proposal is skipped — `issue: see the tracker` that parsed as "no issue"
    // would be a link that reads as present and joins nothing.
    const issues = declaredIssueIds(p.fm.issue ?? p.fm.issues);
    if (issues.present && issues.malformed.length) {
      malformed.push({
        path: p.path,
        why:
          `\`issue\` ${issues.malformed.map((t) => JSON.stringify(t)).join(', ')} is not a ` +
          `well-formed beads id (${ISSUE_PREFIX}-<id>); the format is checked here and the ` +
          `existence of the issue is not — that is scripts/verify-issue-links.mjs's, locally`,
      });
      continue;
    }
    const exp = readExpiry(p.raw, p.fm);
    if (exp.present && exp.invalid) {
      // Fail closed, and name the value. An `expires: soon` that parsed as
      // "no expiry" would silently buy the 3-day cooling exemption while
      // never being sweepable — the exact shape of a guardrail that reads as
      // present and does nothing.
      malformed.push({
        path: p.path,
        why:
          `\`expires\` ${JSON.stringify(exp.literal)} is not a YYYY-MM-DD local date; ` +
          `an unreadable expiry neither skips cooling nor sweeps`,
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
      expires: exp.present ? exp.date : null,
      title: p.fm.title ?? p.fm.summary ?? slug,
      detail: `${p.fm.summary ?? ''}\n\n${p.body}`.trim(),
      evidence: p.fm.evidence ?? null,
      // Carried to the ledger line the run appends, so "what did the machine
      // ever do about addictedtoai-X" is one grep of one file.
      issues: issues.ids,
    };
    if (exp.present) {
      // AT or PAST the expiry, never selectable. String comparison on two
      // `YYYY-MM-DD` local dates is exact and needs no clock arithmetic; a
      // `Date` difference here would reintroduce the timezone the literal
      // digits were read to avoid.
      if (today >= exp.date) {
        expired.push({
          ...candidate,
          file: p.file,
          why:
            `proposal "${slug}" expired on ${exp.date}; today is ${today} (local date), so it is ` +
            `not selectable and is swept to data/proposals/dropped/`,
        });
        continue;
      }
      // An expiring candidate skips cooling entirely: news that has to sit for
      // three days is not news by the time it is selectable.
      ripe.push(candidate);
      continue;
    }
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
  // Oldest ripe first — EXCEPT that expiring candidates go ahead of the
  // non-expiring ones, soonest expiry first.
  //
  // Not decoration. Cooling means a non-expiring proposal is at least 3 days
  // old by the time it is ripe, and an expiring candidate is filed fresh, so
  // "oldest first" alone puts every candidate behind every cooled proposal —
  // and a candidate that is never selected before its expiry is swept. The
  // sweep would then be the only thing expiry ever did, which is the
  // guardrail-that-does-nothing shape this repository keeps catching. The
  // predecessor's own diagnosis was "ten weeks of backlog for stories with a
  // one-week shelf life", and its fix — "take the freshest viable item, not
  // the oldest" — is this comparator plus the sweep, together.
  ripe.sort((a, b) => {
    if (a.expires && b.expires) return a.expires < b.expires ? -1 : a.expires > b.expires ? 1 : 0;
    if (a.expires) return -1;
    if (b.expires) return 1;
    return b.ageDays - a.ageDays;
  });
  return { ripe, cooling, expired, duplicates, malformed, rejected };
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
    // The LOCAL date, like every other date in this repository (CLAUDE.md).
    // This line read `toISOString().slice(0, 10)` — UTC — until 2026-08-30.
    `- date: ${localDate(ctx.now())}\n` +
    `- duplicate of: \`${dup.earlier.file}\` (slug \`${dup.slug}\`)\n` +
    `- earlier rejection reason: ${dup.earlier.reason}\n\n` +
    `Exact slug match against the rejection index. No model was invoked; no ` +
    `inference was spent. A differently-worded resubmission is the reviewer's ` +
    `to catch, not this check's.\n`;
  writeFileSync(dest, original + note, 'utf8');
  unlinkSync(dup.path);
  return { moved: true, dest, why: dup.why };
}

// ---------------------------------------------------------------------------
// The expiry sweep (specs/loop, task 2.5)
// ---------------------------------------------------------------------------

/**
 * Move one expired proposal into `data/proposals/dropped/` with a note naming
 * the expiry.
 *
 * `dropped/` is a RECORD, NEVER A BLOCK. `rejectionIndex` reads `rejectedDir`
 * and nothing else, so a slug that appears only here does not auto-discard a
 * later filing — which is the whole point: a story declined today may be
 * refiled when its stated refile condition arrives.
 */
export function sweepExpired(ctx, item, { dryRun = false } = {}) {
  const dir = droppedDir(ctx);
  const stamp = ctx.now().toISOString().replace(/[-:]/g, '').replace(/\..*/, '');
  const dest = join(dir, `${item.slug}.expired-${stamp}.md`);
  if (dryRun) return { moved: false, dest, why: item.why };
  mkdirSync(dir, { recursive: true });
  const original = readFileSync(item.path, 'utf8');
  // An id the proposal already declared is carried into the record, so a swept
  // idea names the issue it served rather than leaving the reader to grep for
  // it (`addictedtoai-occ0`). This PROPAGATES an id that exists; it does not
  // demand one that does not, which would require filing an issue per sweep and
  // manufacture exactly the backlog noise the requirement is scoped to avoid.
  const issueLine = item.issues?.length ? `- issue: ${item.issues.join(', ')}\n` : '';
  const note =
    `\n\n---\n\n## Swept: the expiry it declared has arrived\n\n` +
    `- date: ${localDate(ctx.now())}\n` +
    `- expires: ${item.expires}\n` +
    issueLine +
    `- swept on: ${localDate(ctx.now())} (the LOCAL date of the machine that swept it)\n` +
    `- was: \`${item.file ?? basename(item.path)}\` (slug \`${item.slug}\`)\n\n` +
    `An expiring proposal is selectable without cooling and stops being ` +
    `selectable at its expiry. This one was not selected in time, so it was ` +
    `swept here mechanically — no model was invoked and no inference was ` +
    `spent. Nothing anywhere treats this as a failure: it is what keeps the ` +
    `candidate directory from becoming a backlog of stories whose evidence has ` +
    `stopped being current.\n\n` +
    `\`data/proposals/dropped/\` is a record, never a block. This slug does not ` +
    `feed the rejection index, so the story may be refiled when its refile ` +
    `condition arrives.\n`;
  writeFileSync(dest, original + note, 'utf8');
  unlinkSync(item.path);
  return { moved: true, dest, why: item.why };
}

/**
 * Read the proposals and sweep every expired one. The loop calls this once per
 * run, before selection, so that no run can select what the clock has retired.
 *
 * @returns {{swept: Array, notes: string[]}}
 */
export function sweepExpiredProposals(ctx, { dryRun = false } = {}) {
  const swept = [];
  const notes = [];
  for (const item of readProposals(ctx).expired) {
    const r = sweepExpired(ctx, item, { dryRun });
    swept.push({ ...item, ...r });
    notes.push(
      `expired proposal swept${r.moved ? ` to ${r.dest}` : ' (dry run: not moved)'}: ${item.why}`,
    );
  }
  return { swept, notes };
}

// ---------------------------------------------------------------------------
// Retiring a CONSUMED proposal
// ---------------------------------------------------------------------------

/**
 * `data/proposals/consumed/` — a RECORD, never a block, on the same terms as
 * `dropped/`. `rejectionIndex` reads `rejectedDir` and nothing else, so a slug
 * that appears only here does not auto-discard a later filing. Being written
 * about once is not a reason a subject may never be written about again.
 */
export function consumedDir(ctx) {
  return ctx.consumedDir ?? join(ctx.proposalsDir, 'consumed');
}

/**
 * Retire the proposal a merged job was selected from.
 *
 * THE DEFECT, observed 2026-08-30. A proposal selected, written, reviewed and
 * merged into a published post stayed in `data/proposals/` and stayed
 * selectable. The next run selected THE SAME PROPOSAL again; its `expires:` was
 * a week out, so the loop would have rewritten that post on every run until
 * then. Three were retired by hand (commit `5e226a6`); this is the mechanism.
 *
 * `readProposals` reads `ctx.proposalsDir` top-level `.md` files only, so
 * moving the file into a subdirectory is what removes it from selection —
 * exactly how `discardDuplicate` and `sweepExpired` work, and this deliberately
 * matches their shape: same `dryRun` option, same appended note, same "record,
 * never a block" semantics.
 *
 * WHAT IS NOT HERE, and why. Consumption is not judgment: it says only that
 * this candidate produced merged work. So it does not touch the rejection
 * index, and it fires ONLY on a merged, done outcome — a discarded job's
 * proposal stays selectable, because the idea was not what was rejected.
 *
 * @param {object} ctx
 * @param {object} o
 * @param {string} o.path      absolute path to the proposal file
 * @param {string} o.slug
 * @param {string} o.jobId
 * @param {string} o.jobType
 * @param {string[]} [o.artifacts]  repo-relative paths the merge produced
 * @param {string} [o.mergedSha]
 * @returns {{moved: boolean, dest: string, why: string}}
 */
export function consumeProposal(ctx, { path, slug, jobId, jobType, artifacts = [], mergedSha = null, issues = [] }, { dryRun = false } = {}) {
  const dir = consumedDir(ctx);
  const name = basename(path);
  const stamp = ctx.now().toISOString().replace(/[-:]/g, '').replace(/\..*/, '');
  const dest = join(dir, `${slug}.consumed-${stamp}.md`);
  const made = artifacts.length ? artifacts.map((a) => `\`${a}\``).join(', ') : '(the merge produced no joinable artifact)';
  const why =
    `proposal "${slug}" was selected by job ${jobId} (${jobType}), which merged; it is retired to ` +
    `data/proposals/consumed/ so no later run can be dispatched at work that is already done`;
  if (dryRun) return { moved: false, dest, why };
  if (!existsSync(path)) {
    return { moved: false, dest, why: `${why} — except that ${path} no longer exists, so there was nothing to move` };
  }
  mkdirSync(dir, { recursive: true });
  const original = readFileSync(path, 'utf8');
  const note =
    `\n\n---\n\n## Consumed: this candidate produced merged work\n\n` +
    // The LOCAL date, like every other date in this repository (CLAUDE.md).
    `- date: ${localDate(ctx.now())}\n` +
    `- job: ${jobId} (${jobType})\n` +
    (issues?.length ? `- issue: ${issues.join(', ')}\n` : '') +
    `- merged as: ${mergedSha ? `\`${mergedSha}\`` : '(local merge commit not recorded)'}\n` +
    `- produced: ${made}\n` +
    `- was: \`${name}\` (slug \`${slug}\`)\n\n` +
    `A proposal that has been written, reviewed and merged is finished work. It ` +
    `was left selectable, and the run after the first post selected it again — ` +
    `which would have rewritten the same piece on every run until its \`expires:\` ` +
    `arrived. Retiring it is mechanical: no model was invoked and no inference ` +
    `was spent.\n\n` +
    `\`data/proposals/consumed/\` is a record, never a block. This slug does not ` +
    `feed the rejection index, so the subject may be proposed again — being ` +
    `written about once is not a reason it may never be written about again.\n`;
  writeFileSync(dest, original + note, 'utf8');
  unlinkSync(path);
  return { moved: true, dest, why };
}

// ---------------------------------------------------------------------------
// Merge mechanics for candidate files (specs/loop, task 2.4)
// ---------------------------------------------------------------------------

/**
 * Set front-matter keys on a markdown file's text, replacing any existing value
 * for those keys. Used to STAMP the proposing job onto a kept proposal, so the
 * value the executor wrote for the same key cannot survive.
 *
 * A file with no front matter gets one; the body is never touched. The regex
 * shape (and the reason it drops indented continuation lines under a replaced
 * key) is the same as `review.mjs`'s `writeRecordSubjects` — one convention for
 * editing a front-matter block in this repository, not two.
 */
export function setFrontMatterKeys(text, keys) {
  const entries = Object.entries(keys).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return text;
  const m = FM_BLOCK.exec(text);
  const render = (eol) => entries.map(([k, v]) => `${k}: ${v}`).join(eol);
  if (!m) {
    const eol = /\r\n/.test(text) ? '\r\n' : '\n';
    return `---${eol}${render(eol)}${eol}---${eol}${eol}${text}`;
  }
  const eol = /\r\n/.test(m[1]) ? '\r\n' : '\n';
  const names = entries.map(([k]) => k);
  const kept = [];
  let skipping = false;
  for (const line of m[2].split(/\r?\n/)) {
    if (/^[ \t]/.test(line) && skipping) continue; // an indented continuation of a dropped key
    const key = /^([A-Za-z0-9_-]+)[ \t]*:/.exec(line);
    skipping = Boolean(key && names.includes(key[1]));
    if (skipping) continue;
    kept.push(line);
  }
  while (kept.length && kept[kept.length - 1].trim() === '') kept.pop();
  const block = (kept.length ? kept.join(eol) + eol : '') + render(eol);
  return text.slice(0, m.index) + m[1] + block + m[3] + text.slice(m.index + m[0].length);
}

/** Every proposal file a branch ADDS, top-level only — `rejected/` and `dropped/` are not candidates. */
export function addedProposalPaths(changed) {
  return (changed ?? [])
    .filter((e) => (typeof e === 'string' ? true : e.status === 'A'))
    .map((e) => String(typeof e === 'string' ? e : e.path).replace(/\\/g, '/'))
    .filter((p) => /^data\/proposals\/[^/]+\.md$/.test(p) && basename(p) !== 'README.md')
    .sort();
}

/**
 * Apply the three merge mechanisms to the proposal files a job's branch adds,
 * IN THE BRANCH'S WORKTREE, before the merge — so that what merges is already
 * capped, stamped and de-amplified, and the drop records ride in with it.
 *
 * 1. THE CAP IS MECHANICAL, NOT BEHAVIORAL. Keep at most `proposalCapFor(type)`
 *    files — by the job's own stated ranking (`rank:` in front matter, lowest
 *    first) where one exists, else by filename — and move the excess to
 *    `data/proposals/dropped/` with a note naming them.
 * 2. STAMP the proposing job's type onto each kept file, overwriting whatever
 *    the executor wrote there. A job cannot launder its own origin.
 * 3. AUTO-DISCARD any kept proposal whose stamped origin type equals the type
 *    it proposes, to `rejected/`, with a pointer to the rule. No inference.
 *
 * Ordering is the task's: cap, then stamp, then discard. A self-amplifying
 * candidate therefore spends one of the job's slots before it is discarded,
 * which is the reading that cannot be gamed — the alternative lets a job file
 * four candidates and have one of them "not count".
 *
 * A proposal on a branch that is DISCARDED needs no mechanism here at all: it
 * lives only on the branch, the branch is never merged, and `data/proposals/`
 * in the working tree never sees it. Ideas do not outlive the rejection of the
 * work that produced them.
 */
export function applyProposalMergeRules(ctx, { worktree, jobId, jobType, changed }) {
  const cap = proposalCapFor(jobType);
  const rel = addedProposalPaths(changed);
  const notes = [];
  const entries = rel.map((p) => {
    const abs = join(worktree, p);
    const raw = existsSync(abs) ? readFileSync(abs, 'utf8') : '';
    let fm = {};
    try {
      fm = matter(raw).data ?? {};
    } catch {
      /* an unparseable candidate is still capped and stamped; readProposals reports it later */
    }
    const n = Number(fm.rank);
    return { rel: p, abs, name: basename(p), raw, fm, rank: Number.isFinite(n) ? n : null };
  });

  // The job's stated ranking where one exists, else filename. A file with no
  // `rank:` sorts after every ranked one, and ties break on filename, so the
  // order is total and reproducible from the files alone.
  entries.sort((a, b) => {
    if (a.rank !== null && b.rank !== null && a.rank !== b.rank) return a.rank - b.rank;
    if (a.rank !== null && b.rank === null) return -1;
    if (a.rank === null && b.rank !== null) return 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

  const kept = entries.slice(0, cap);
  const over = entries.slice(cap);
  const dropped = [];
  const rejected = [];
  const today = localDate(ctx.now());

  if (over.length) {
    const dir = join(worktree, 'data', 'proposals', 'dropped');
    mkdirSync(dir, { recursive: true });
    for (const e of over) {
      const dest = join(dir, e.name);
      const note =
        `\n\n---\n\n## Dropped: over this job's candidate cap\n\n` +
        `- date: ${today}\n` +
        `- job: ${jobId} (${jobType})\n` +
        `- rule: a merged \`${jobType}\` branch may add at most ${cap} proposal ` +
        `file${cap === 1 ? '' : 's'}; it added ${entries.length}\n` +
        `- ranked: ${e.rank === null ? 'no `rank:` declared; ordered by filename' : `rank ${e.rank}`}\n` +
        `- kept instead: ${kept.map((k) => `\`${k.name}\``).join(', ') || '(none)'}\n\n` +
        `The cap is a mechanism, not a request: the loop kept the allowed number ` +
        `by the job's own stated ranking, else by filename, and moved the rest ` +
        `here. No model was invoked and no inference was spent.\n\n` +
        `\`data/proposals/dropped/\` is a record, never a block — it does not feed ` +
        `slug suppression, so this may be refiled.\n`;
      writeFileSync(dest, e.raw + note, 'utf8');
      if (existsSync(e.abs)) unlinkSync(e.abs);
      dropped.push({ name: e.name, from: e.rel, to: `data/proposals/dropped/${e.name}`, rank: e.rank });
    }
    notes.push(
      `proposal cap: the ${jobType} job added ${entries.length} proposal files and may add ${cap}; ` +
        `kept ${kept.map((k) => k.name).join(', ')} and moved ${dropped.map((d) => d.name).join(', ')} ` +
        `to data/proposals/dropped/ with a note`,
    );
  }

  for (const e of kept) {
    // The stamp is written before the same-type check reads it back, so the
    // check is measuring the file's committed state and not an argument.
    const stamped = setFrontMatterKeys(e.raw, {
      proposed_by_job: jobId,
      proposed_by_type: jobType,
    });
    writeFileSync(e.abs, stamped, 'utf8');
    e.raw = stamped;
    const proposedType = e.fm.type ?? e.fm.job_type ?? null;
    if (proposedType !== jobType) continue;

    const dir = join(worktree, 'data', 'proposals', 'rejected');
    mkdirSync(dir, { recursive: true });
    const dest = join(dir, e.name);
    const reason =
      `a ${jobType} job may not propose another ${jobType} job (self-amplification, specs/loop)`;
    const note =
      `\n\n---\n\n## Auto-discarded: a job may not propose more of itself\n\n` +
      `- date: ${today}\n` +
      `- proposing job: ${jobId} (stamped \`proposed_by_type: ${jobType}\`)\n` +
      `- proposed type: ${proposedType}\n` +
      `- rule: specs/loop, "Work comes from three sources and cannot ` +
      `self-amplify" — a proposal whose stamped origin type equals the type it ` +
      `proposes is auto-discarded on the same terms as a rejected-slug duplicate\n\n` +
      `Exact equality between two strings. No model was invoked and no inference ` +
      `was spent. The guard closes the TIGHT loop only: a two-type cycle ` +
      `(\`post\` → \`interpret\` → \`post\`) remains possible, bounded by cooling at ` +
      `each hop and caught, where it is a re-tread, by the reviewer holding the ` +
      `rejection index. The maintainer's own filings have no proposing job, so ` +
      `this rule cannot reach them.\n`;
    writeFileSync(dest, setFrontMatterKeys(e.raw, { rejection_reason: reason }) + note, 'utf8');
    if (existsSync(e.abs)) unlinkSync(e.abs);
    rejected.push({ name: e.name, from: e.rel, to: `data/proposals/rejected/${e.name}`, reason });
    notes.push(
      `proposal auto-discarded to data/proposals/rejected/${e.name}: ${reason}; ` +
        `pointer to the rule appended, no inference spent`,
    );
  }

  const rejectedNames = new Set(rejected.map((r) => r.name));
  return {
    cap,
    added: entries.map((e) => e.name),
    kept: kept.filter((k) => !rejectedNames.has(k.name)).map((k) => k.name),
    dropped,
    rejected,
    notes,
  };
}

// ---------------------------------------------------------------------------
// Transcribing a reviewer-noted proposal (specs/loop, task 2.4)
// ---------------------------------------------------------------------------

const PROPOSAL_FIELDS = ['slug', 'type', 'summary', 'evidence', 'expires', 'why_now', 'why-now'];

/**
 * A proposal noted by a reviewer in its verdict record, or null.
 *
 * Two shapes are read, because the executor contract admits runners that cannot
 * emit structured YAML: a `proposal:` mapping in the record's front matter, and
 * a `## Proposal` section of `- key: value` lines in its body. Both must carry
 * a kebab-case `slug` and a `type` from the closed list; anything else is
 * reported and transcribed as nothing, because guessing what a half-written
 * note meant is exactly the inference this channel does not spend.
 *
 * The reviewer's own EDITS to the tree are discarded by the review step — this
 * record is the only channel by which a review's noticing becomes work.
 */
export function notedProposal(text) {
  let fm = {};
  let body = String(text ?? '');
  try {
    const p = matter(body);
    fm = p.data ?? {};
    body = p.content ?? '';
  } catch {
    fm = {};
  }
  let fields = null;
  const inFm = fm.proposal ?? fm.noted_proposal ?? fm['noted-proposal'] ?? null;
  if (inFm && typeof inFm === 'object' && !Array.isArray(inFm)) {
    fields = {};
    for (const k of PROPOSAL_FIELDS) if (inFm[k] !== undefined) fields[k] = inFm[k];
  }
  if (!fields) {
    const h = /^[ \t]*#{1,6}[ \t]*(?:noted[ \t]+)?proposal\b[^\n]*$/im.exec(body);
    if (h) {
      const after = body.slice(h.index + h[0].length);
      const stop = /^[ \t]*#{1,6}[ \t]/m.exec(after);
      const section = stop ? after.slice(0, stop.index) : after;
      const found = {};
      const re = /^[ \t]*[-*]?[ \t]*(?:\*\*)?([A-Za-z][A-Za-z0-9_-]*)(?:\*\*)?[ \t]*:[ \t]*(.+)$/gm;
      for (let m; (m = re.exec(section)); ) {
        const key = m[1].toLowerCase();
        if (PROPOSAL_FIELDS.includes(key)) {
          found[key] = m[2].trim().replace(/^[`'"]|[`'"]$/g, '').trim();
        }
      }
      if (Object.keys(found).length) fields = found;
    }
  }
  if (!fields) return null;

  const slug = String(fields.slug ?? '').trim();
  const type = String(fields.type ?? '').trim();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, why: `the noted proposal has no kebab-case \`slug\` (found ${JSON.stringify(slug)})` };
  }
  if (!JOB_TYPES.includes(type)) {
    return { ok: false, why: `the noted proposal's \`type\` ${JSON.stringify(type)} is not in the closed job-type list` };
  }
  const expires = readExpiry('', { expires: fields.expires });
  if (expires.present && expires.invalid) {
    return { ok: false, why: `the noted proposal's \`expires\` ${JSON.stringify(expires.literal)} is not a YYYY-MM-DD local date` };
  }
  return {
    ok: true,
    slug,
    type,
    summary: String(fields.summary ?? '').trim(),
    evidence: String(fields.evidence ?? '').trim(),
    whyNow: String(fields.why_now ?? fields['why-now'] ?? '').trim(),
    expires: expires.present ? expires.date : null,
  };
}

/**
 * Transcribe a reviewer-noted proposal into `data/proposals/`, naming the
 * reviewing job as its origin.
 *
 * The stamp and the self-amplification rule apply here on the same terms as at
 * a merge, and for the same reason: a reviewer noting a `post` while reviewing
 * a `post` job is the same tight loop reached through a side channel. Applying
 * the rule at one door and not the other would be the hole.
 */
export function transcribeNotedProposal(ctx, { jobId, jobType, verdictPath, reviewer, dryRun = false }) {
  if (!verdictPath || !existsSync(verdictPath)) return { transcribed: false, why: 'no verdict record' };
  const noted = notedProposal(readFileSync(verdictPath, 'utf8'));
  if (!noted) return { transcribed: false, why: 'the verdict record notes no proposal' };
  if (!noted.ok) return { transcribed: false, why: noted.why, malformed: true };

  const selfAmplifying = noted.type === jobType;
  const dir = selfAmplifying ? ctx.rejectedDir : ctx.proposalsDir;
  const dest = join(dir, `${noted.slug}.md`);
  if (existsSync(dest)) {
    return { transcribed: false, why: `a file already exists at ${dest}; the note was not transcribed over it` };
  }
  if (dryRun) return { transcribed: false, dest, dryRun: true, noted };

  const today = localDate(ctx.now());
  const reason = selfAmplifying
    ? `a ${jobType} job's review may not propose another ${jobType} job (self-amplification, specs/loop)`
    : null;
  const front = [
    '---',
    `slug: ${noted.slug}`,
    `type: ${noted.type}`,
    `date: ${today}`,
    ...(noted.expires ? [`expires: ${noted.expires}`] : []),
    `origin: review of job ${jobId}`,
    `noted_by: the reviewer of job ${jobId}${reviewer ? ` (${reviewer})` : ''}`,
    `proposed_by_job: ${jobId}`,
    `proposed_by_type: ${jobType}`,
    ...(reason ? [`rejection_reason: ${reason}`] : []),
    '---',
    '',
  ].join('\n');
  const body =
    `${noted.summary || '_The verdict record noted this proposal without a summary._'}\n\n` +
    (noted.whyNow ? `## Why now\n\n${noted.whyNow}\n\n` : '') +
    (noted.evidence ? `## Evidence\n\n${noted.evidence}\n\n` : '') +
    `## Origin\n\n` +
    `Transcribed by the loop from the verdict record for job ${jobId} ` +
    `(\`${basename(verdictPath)}\`), which is the one channel a review has: the ` +
    `reviewer's edits to the tree it reviewed are discarded, so a proposal it ` +
    `noticed reaches the work sources only by being written in its record and ` +
    `copied here. The reviewing job is named above as its origin.\n` +
    (selfAmplifying
      ? `\n## Auto-discarded: a job may not propose more of itself\n\n` +
        `- date: ${today}\n` +
        `- reviewing job: ${jobId} (${jobType})\n` +
        `- proposed type: ${noted.type}\n\n` +
        `The stamped origin type equals the proposed type, so this was written ` +
        `straight to the rejection index rather than to \`data/proposals/\`, on ` +
        `the same terms as a rejected-slug duplicate. No inference was spent.\n`
      : '');
  mkdirSync(dir, { recursive: true });
  writeFileSync(dest, front + body, 'utf8');
  return { transcribed: true, dest, selfAmplifying, noted, reason };
}

/** The rejection index as review-brief text (specs/review). */
export function rejectionIndexText(ctx) {
  const idx = rejectionIndex(ctx);
  if (idx.length === 0) return '_The rejection index is empty._';
  return idx
    .map((r) => `- \`${r.slug}\` — ${r.reason}`)
    .join('\n');
}
