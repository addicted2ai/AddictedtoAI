/**
 * review-state.mjs — the review-state join as a named loop capability.
 *
 * Answers, for one declared page, exactly one of `missing` / `matched` /
 * `mismatched`, pinned at an explicit base commit. Task 62 reads this module
 * as its only source of truth for the reviewed precondition; no other caller
 * may answer that question a second way.
 *
 * WHAT EACH ANSWER MEANS, against that base:
 * - `missing` — no review record at the base carries a hash for this page, or
 *   the page itself cannot be read at the base, or several records name the
 *   page and none can be ordered by the recency inside them. Missing is
 *   unreviewed-or-unorderable, and it never satisfies the reviewed
 *   precondition. An unbound record (it names the page but carries no hash
 *   for it) reads as `missing` here: with no recorded bytes there is nothing
 *   a current hash could match, so for the three-state question it is the
 *   same finding as no record at all.
 * - `matched` — the current record at the base carries a hash for the page
 *   and it equals the hash of the page bytes at the base.
 * - `mismatched` — the current record at the base carries a hash for the
 *   page and it differs from the hash of the page bytes at the base. Only
 *   this state satisfies the reviewed precondition.
 *
 * PINNED AT THE BASE, and the base is an argument, never ambient state. Every
 * entry point takes an explicit base SHA and reads the page bytes and every
 * review record through that commit (`show <base>:<path>`), never through the
 * working tree and never through a file any gate rewrites. Two calls with two
 * bases are two answers; a base that moves between brief assembly and merge
 * moves the answers with it, which the test proves by committing a page edit
 * between the two reads.
 *
 * CONCURRENCY RULE, stated so a caller cannot miss it: re-read at merge.
 * An answer computed at brief assembly is stale the moment the base moves —
 * a new record landing, a page edited elsewhere, a re-review superseding an
 * older one. The merge path SHALL recompute the job merge base at merge time
 * (see `jobMergeBase`) and call again; it SHALL NOT cache the brief-time
 * answer, and it SHALL NOT consult any derived store written along the way
 * as a substitute. The only inputs are review records and the base tree.
 *
 * REUSE, not reimplementation:
 * - hashing is `reviewedHash` (`lib/review-hash.mjs`), the same function the
 *   merge step hashes through when it writes `reviewed:` — the base reader
 *   hashes the base bytes with it, so the two sides can only agree;
 * - merge-base plumbing is `mergeBase` (`loop/lib/git.mjs`);
 * - the committed declaration is read through `readCommittedJobSource`
 *   (`loop/lib/resume.mjs`) where a declaration is needed — never reparsed;
 * - record membership and recency are `recordNamesPath`, `reviewedOf`,
 *   `subjectsOf` and `recencyOf` (`lib/reviews.mjs`).
 *
 * The change analysis takes no part in any answer here. It corroborates
 * diffs elsewhere; it never names a review state, and no function below takes
 * it as an argument.
 */

import matter from 'gray-matter';

import { gitTry, mergeBase } from './git.mjs';
import { readCommittedJobSource } from './resume.mjs';
import { reviewedHash } from '../../lib/review-hash.mjs';
import { recordNamesPath, recencyOf, reviewedOf } from '../../lib/reviews.mjs';

/** The closed answer set. Exactly one applies per page per base. */
export const REVIEW_STATE_VALUES = Object.freeze(['missing', 'matched', 'mismatched']);

/** Repo-relative directory holding review records. */
export const REVIEW_RECORDS_DIR = 'data/reviews';

/** Normalise one declared page path for set joins: POSIX slashes, trimmed. */
export function normalizeReviewStatePath(p) {
  return String(p ?? '').replace(/\\/g, '/').trim();
}

function showAtBase(repo, rev, path) {
  const r = gitTry(repo, ['show', `${rev}:${path}`]);
  return r.ok ? r.stdout : null;
}

function listRecordPathsAtBase(repo, rev, reviewsDir) {
  const dir = normalizeReviewStatePath(reviewsDir) || REVIEW_RECORDS_DIR;
  const r = gitTry(repo, ['ls-tree', '-r', '--name-only', rev, '--', dir]);
  if (!r.ok) return [];
  return r.stdout
    .split('\n')
    .map((s) => s.trim().replace(/\\/g, '/'))
    .filter(Boolean)
    .filter((p) => p.endsWith('.md'))
    .filter((p) => p !== `${dir}/README.md` && !p.endsWith('/README.md'));
}

function recordAtBase(repo, rev, fullPath) {
  const text = showAtBase(repo, rev, fullPath);
  if (typeof text !== 'string') return null;
  let data = {};
  try {
    data = matter(text).data ?? {};
  } catch {
    data = {};
  }
  const slash = fullPath.lastIndexOf('/');
  return { name: slash === -1 ? fullPath : fullPath.slice(slash + 1), path: fullPath, data };
}

function orderNewestFirst(found) {
  const keyed = found.map((f) => ({ ...f, key: recencyOf(f.rec) }));
  if (keyed.some((k) => k.key === null)) return null;
  const sorted = keyed.sort((a, b) =>
    a.key.day === b.key.day ? b.key.seq - a.key.seq : a.key.day < b.key.day ? 1 : -1,
  );
  const [first, second] = sorted;
  if (second && first.key.day === second.key.day && first.key.seq === second.key.seq) return null;
  return sorted;
}

/**
 * One page at one base commit.
 *
 * Reads the page bytes and every review record at `baseSha` and returns the
 * state plus the evidence for it. Fail-closed throughout: anything that
 * cannot be established reads as `missing`, never as `matched`, and only an
 * observed hash difference reads as `mismatched`.
 *
 * @param {string} repo     repository root
 * @param {string} baseSha  the pinned base commit (the job merge base at read time)
 * @param {string} page     repo-relative declared page path
 * @param {{reviewsDir?: string}} [opts]
 * @returns {{state: string, base: string, page: string, record: string|null,
 *            recordedHash: string|null, currentHash: string|null, why: string}}
 */
export function reviewStateForPageAtBase(repo, baseSha, page, { reviewsDir = REVIEW_RECORDS_DIR } = {}) {
  const normPage = normalizeReviewStatePath(page);
  if (!normPage) throw new Error('review-state: page path is required');
  const base = String(baseSha ?? '').trim();
  if (!base) throw new Error('review-state: base SHA is required');
  const fail = (why, extra = {}) => ({
    state: 'missing',
    base,
    page: normPage,
    record: null,
    recordedHash: null,
    currentHash: null,
    why,
    ...extra,
  });

  const raw = showAtBase(repo, base, normPage);
  if (typeof raw !== 'string') {
    return fail(`the page is not readable at the base ${base.slice(0, 12)}`);
  }
  let current = null;
  try {
    current = reviewedHash(raw);
  } catch {
    return fail('the page bytes at the base could not be hashed');
  }

  const found = [];
  for (const fullPath of listRecordPathsAtBase(repo, base, reviewsDir)) {
    const rec = recordAtBase(repo, base, fullPath);
    if (!rec) continue;
    if (recordNamesPath(rec, normPage)) found.push({ rec });
  }
  if (!found.length) {
    return {
      state: 'missing',
      base,
      page: normPage,
      record: null,
      recordedHash: null,
      currentHash: current,
      why: 'no review record at the base names this page',
    };
  }
  const ordered = orderNewestFirst(found);
  if (!ordered) {
    return {
      state: 'missing',
      base,
      page: normPage,
      record: null,
      recordedHash: null,
      currentHash: current,
      why: 'several records name this page and none can be ordered by the recency inside them — binding neither rather than guessing',
    };
  }
  const winner = ordered[0].rec;
  const recorded = reviewedOf(winner)[normPage] ?? null;
  if (!recorded) {
    return {
      state: 'missing',
      base,
      page: normPage,
      record: winner.name,
      recordedHash: null,
      currentHash: current,
      why: `record ${winner.name} names this page but carries no hash for it`,
    };
  }
  if (recorded === current) {
    return {
      state: 'matched',
      base,
      page: normPage,
      record: winner.name,
      recordedHash: recorded,
      currentHash: current,
      why: `record ${winner.name} binds the page bytes at the base`,
    };
  }
  return {
    state: 'mismatched',
    base,
    page: normPage,
    record: winner.name,
    recordedHash: recorded,
    currentHash: current,
    why: `record ${winner.name} records different bytes than the page carries at the base`,
  };
}

/**
 * Several pages at one base commit. One pass over the record list per page;
 * the base is still the single pinned input.
 *
 * @returns {Map<string, object>} page path -> `reviewStateForPageAtBase` result
 */
export function reviewStatesForPagesAtBase(repo, baseSha, pages, opts = {}) {
  const out = new Map();
  for (const p of Array.isArray(pages) ? pages : []) {
    const norm = normalizeReviewStatePath(p);
    if (!norm) continue;
    out.set(norm, reviewStateForPageAtBase(repo, baseSha, norm, opts));
  }
  return out;
}

/**
 * The job merge base, recomputed on every call through the shared plumbing.
 * No caching here and none at the caller: the merge path calls this at merge
 * time, not at brief time.
 */
export function jobMergeBase(repo, baseRef, branch) {
  return mergeBase(repo, baseRef, branch);
}

/**
 * One page pinned at the job merge base of `baseRef` and `branch`.
 * Computes the base fresh (see `jobMergeBase`) and answers there.
 */
export function reviewStateAtJobMergeBase(repo, baseRef, branch, page, opts = {}) {
  const base = jobMergeBase(repo, baseRef, branch);
  return reviewStateForPageAtBase(repo, base, page, opts);
}

/** Several pages pinned at the job merge base. */
export function reviewStatesAtJobMergeBase(repo, baseRef, branch, pages, opts = {}) {
  const base = jobMergeBase(repo, baseRef, branch);
  return { base, states: reviewStatesForPagesAtBase(repo, base, pages, opts) };
}

/**
 * The committed declaration answered at the job merge base.
 *
 * Reads the work order through `readCommittedJobSource` (the committed
 * `.job/source.json` on `branch`) and answers for its `declared_subjects`.
 * Carried-file resolution and content/code scoping belong to the merge path,
 * not here: this is the declaration as committed, answered page by page.
 *
 * @returns {{ok: boolean, base?: string, branch?: string, states?: Map,
 *            declared?: string[], why?: string}}
 */
export function declaredReviewStatesAtJobMergeBase(repo, baseRef, branch, opts = {}) {
  const source = readCommittedJobSource(repo, branch);
  const declared = Array.isArray(source?.declared_subjects)
    ? [...new Set(source.declared_subjects.map(normalizeReviewStatePath).filter(Boolean))].sort()
    : null;
  if (!declared) {
    return { ok: false, why: 'no committed declared subjects on the branch' };
  }
  const base = jobMergeBase(repo, baseRef, branch);
  return { ok: true, base, branch, declared, states: reviewStatesForPagesAtBase(repo, base, declared, opts) };
}

/**
 * Convenience for the reviewed precondition: true only where the state at
 * the job merge base is `mismatched`. Anything else — `missing`, `matched`,
 * or no declaration — is false, carrying the state for the refusal.
 */
export function isMismatchedAtJobMergeBase(repo, baseRef, branch, page, opts = {}) {
  const r = reviewStateAtJobMergeBase(repo, baseRef, branch, page, opts);
  return { mismatched: r.state === 'mismatched', ...r };
}
