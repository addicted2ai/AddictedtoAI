/**
 * train.mjs — Stage-1 train machinery.
 *
 * U1 SKELETON (tasks 32, 33, 35b; authority a11175f): the merged-tip builder
 * plus immediate revert (33), the merge-lock discipline (33), and the
 * worker-slot mechanism (35b). Later tasks extend this file; nothing here
 * runs the ordered gate set yet — that is U2 (task 36).
 *
 * PLACEMENT NOTE (for the sealed reviewer): the 35b slot helpers live here
 * rather than in `run.mjs` for one reason — testability. No test imports
 * `run.mjs` (verified by grep: the exit-code precedent asserts on source
 * instead), and a new module for six functions would be scope outside the
 * brief's Files list. `run.mjs` binds the behavior (acquire at startup,
 * tripwire + merge at the merge); this file owns the mechanisms. The
 * `buildLockDir()` import from `scripts/build-lock.mjs` is the brief's
 * letter (task 35b names it as the locator); it is a read of a pure path
 * helper, and `build-lock.mjs` stays read-only this round.
 */

import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildLockDir } from '../../scripts/build-lock.mjs';
import { branchExists, changedPathsWithStatus, gitTry, headSha, mergeLocal } from './git.mjs';
import { gatesHitEnvironmentalFailure, runGates, TRAIN_GATES } from './gates.mjs';
import { joinableSubjects } from './review.mjs';
import { appendLedger, makeLedgerLine } from './ledger.mjs';
import { rederiveStep } from './rederive.mjs';

/** `rev-parse` a ref to a sha, or null when git cannot resolve it. */
function revParse(dir, rev) {
  try {
    const r = gitTry(dir, ['rev-parse', rev]);
    return r.ok ? String(r.stdout ?? '').trim() || null : null;
  } catch {
    return null;
  }
}

function mkdirOk(dir) {
  try {
    mkdirSync(dir);
    return true;
  } catch {
    return false;
  }
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function gateRunner(gates) {
  return typeof gates === 'function' ? gates : runGates;
}

// ---------------------------------------------------------------------------
// Provisional merge + tripwire (task 33).
// ---------------------------------------------------------------------------

/**
 * Merge the base tip into the job worktree WITHOUT committing, so the
 * tripwire gates can run over branch+base together. The merge phase commits
 * everything before this runs, so the worktree holds exactly the branch tip
 * plus this uncommitted merge — `discardProvisional` below restores exactly
 * that by resetting to the recorded tip.
 */
export function provisionalMerge(worktree, baseRef) {
  const tip = revParse(worktree, 'HEAD');
  const baseTip = revParse(worktree, baseRef);
  if (tip == null || baseTip == null) {
    return { ok: false, tip, baseTip, reason: 'could not resolve HEAD or base tip' };
  }
  const m = gitTry(worktree, ['merge', '--no-commit', '--no-ff', baseRef]);
  if (!m.ok) {
    gitTry(worktree, ['merge', '--abort']);
    const detail = String(m.stderr ?? m.stdout ?? '').trim();
    return { ok: false, tip, baseTip, conflict: true, reason: detail || 'merge conflict' };
  }
  return { ok: true, tip, baseTip };
}

/** Reset the worktree to the recorded branch tip, dropping the provisional. */
export function discardProvisional(worktree, tip) {
  const r = gitTry(worktree, ['reset', '--hard', tip]);
  if (!r.ok) {
    return { ok: false, reason: String(r.stderr ?? r.stdout ?? '').trim() || 'reset failed' };
  }
  return { ok: true };
}

/**
 * The tripwire (task 33): provisional-merge base into the job worktree,
 * run the two tripwire gates over the merged tip, discard the provisional.
 *
 * Returns `{ok:true, baseTip}` on green-together. On red: `{ok:false,
 * reason}` — an ordinary gate failure, nothing landed anywhere (ruling a).
 * When the gates could not RUN (spawn/environmental failure, or the hook
 * threw): `{ok:false, environmental:true}` — togetherness is unverified and
 * an unverified merge must not land; the caller books `interrupted`. Green
 * gates with a failed provisional cleanup report the same shape: togetherness
 * was verified but the tree may be dirty, so the merge must not land either.
 */
export function runTripwire(ctx, { worktree, baseRef, gates }) {
  const pm = provisionalMerge(worktree, baseRef);
  if (!pm.ok) {
    return { ok: false, baseTip: pm.baseTip, reason: `provisional merge failed: ${pm.reason}` };
  }
  let g = null;
  let threw = null;
  try {
    g = gateRunner(gates)(ctx, worktree, { scripts: ['build', 'verify-surfaces'] });
  } catch (e) {
    threw = e;
  }
  const cleanup = discardProvisional(worktree, pm.tip);
  if (threw) {
    return {
      ok: false, baseTip: pm.baseTip, environmental: true,
      reason: `tripwire gates threw: ${threw.message ?? String(threw)}`,
    };
  }
  if (!g || !g.ok) {
    const environmental = !g || gatesHitEnvironmentalFailure(g);
    const detail = g && g.output ? String(g.output).split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') : 'no gate result';
    return {
      ok: false, baseTip: pm.baseTip, environmental,
      reason: `tripwire red together: ${detail}${cleanup.ok ? '' : ` (AND provisional cleanup failed: ${cleanup.reason})`}`,
      gateOutput: g ? g.output : '',
    };
  }
  if (!cleanup.ok) {
    // Green gates with a failed cleanup: togetherness WAS verified, but the
    // tree may be dirty — a machine condition, not an ordinary failure. The
    // merge must not land; the caller books `interrupted`.
    return { ok: false, baseTip: pm.baseTip, environmental: true, reason: `tripwire green but provisional cleanup failed: ${cleanup.reason}` };
  }
  return { ok: true, baseTip: pm.baseTip };
}

/** Revert a just-made `--no-ff` merge (ruling b): `git revert -m 1`. */
export function revertMerge(repo, sha) {
  // No `--no-verify`: unlike `commit` and `merge`, `revert` does not accept
  // it (usage error). Repos here carry no commit-msg hooks that automation
  // must dodge; a hook failure surfaces in `reason` like any revert failure.
  const r = gitTry(repo, ['revert', '-m', '1', '--no-edit', sha]);
  if (!r.ok) {
    return { ok: false, reason: String(r.stderr ?? r.stdout ?? '').trim() || 'revert failed' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Merge lock (task 33): taken once, at the merge.
// ---------------------------------------------------------------------------

/** The merge lock lives beside the build lock: same per-user directory. */
export function mergeLockPath(dir = buildLockDir()) {
  return join(dir, 'merge.lock');
}

function readMergeHolder(dir) {
  try {
    const [pidLine] = String(readFileSync(join(dir, 'pid'), 'utf8')).split(/\r?\n/);
    const pid = Number.parseInt(pidLine, 10);
    return Number.isInteger(pid) ? { pid } : null;
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * Take the merge lock, waiting up to `waitMs` (`train.lock_wait_seconds`
 * from config). A holder whose pid is dead is reclaimed, so a killed run
 * cannot wedge every later merge. On expiry the merge is refused — the
 * caller classifies environmental and books `interrupted`, never a breaker
 * input.
 */
export async function acquireMergeLock({ waitMs, sleepMs = 1000, now = Date.now, dir = buildLockDir() } = {}) {
  const lockDir = join(dir, 'merge.lock');
  const limit = Number.isFinite(waitMs) ? waitMs : 0;
  const deadline = now() + limit;
  for (;;) {
    if (mkdirOk(lockDir)) {
      try {
        writeFileSync(join(lockDir, 'pid'), `${process.pid}\n${new Date().toISOString()}\n`, 'utf8');
      } catch {
        // The pid file is diagnostic; the directory IS the lock.
      }
      return { ok: true, dir: lockDir };
    }
    const holder = readMergeHolder(lockDir);
    if (holder && !pidAlive(holder.pid)) {
      try {
        rmSync(lockDir, { recursive: true, force: true });
      } catch {
        // Lost a race with another reclaimer; loop around and re-read.
      }
      continue;
    }
    if (now() >= deadline) {
      return {
        ok: false,
        reason: holder
          ? `merge lock held by dead-or-live pid ${holder.pid}; waited ${limit}ms`
          : `merge lock held; waited ${limit}ms`,
      };
    }
    await sleep(Math.min(sleepMs, Math.max(0, deadline - now())));
  }
}

/** Release the merge lock. Best-effort: a failed release only logs. */
export function releaseMergeLock(handle) {
  const dir = handle && handle.dir ? handle.dir : mergeLockPath();
  try {
    rmSync(dir, { recursive: true, force: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e && e.message ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Merge with the tripwire verdict (tasks 32, 33).
// ---------------------------------------------------------------------------

/**
 * Merge the job branch under the merge lock, honoring the tripwire verdict:
 *
 * - Same tip the tripwire verified: merge directly (that exact content is
 *   green-together).
 * - Tip moved since the tripwire: merge first, then rebuild-verify the
 *   merged tip with a build (not a gate set). Red rebuild → `git revert
 *   -m 1` immediately, no search (ruling b). A rebuild that could not RUN
 *   (environmental) leaves the merge standing with `verified:false` — the
 *   old third-state honesty: an unverified merge stays local until
 *   something verifies it, and the publish flag (owned by the caller) stays
 *   down.
 * - `noGates` (operator override): merge directly, verified by override —
 *   the pre-train semantics, unchanged.
 *
 * Returns `{ok:true, sha, verified}` or `{ok:false, reason, environmental?}`.
 */
export async function mergeJobBranch(ctx, {
  repo, branch, baseRef, message, tripwireBaseTip, gates, noGates, lockWaitMs,
}) {
  const lock = await acquireMergeLock({ waitMs: lockWaitMs });
  if (!lock.ok) {
    return { ok: false, environmental: true, reason: `merge refused: ${lock.reason}` };
  }
  try {
    const fn = gateRunner(gates);
    if (!noGates && tripwireBaseTip != null) {
      const tipNow = revParse(repo, baseRef);
      if (tipNow != null && tipNow !== tripwireBaseTip) {
        const m = mergeLocal(repo, branch, message);
        if (!m.ok) return { ok: false, reason: m.reason };
        let rb = null;
        try {
          rb = fn(ctx, repo, { scripts: ['build'] });
        } catch (e) {
          return { ok: true, sha: m.sha, verified: false, note: `tip-moved rebuild threw (${e.message ?? String(e)}); merge stands unverified` };
        }
        if (!rb || !rb.ok) {
          if (!rb || gatesHitEnvironmentalFailure(rb)) {
            return { ok: true, sha: m.sha, verified: false, note: 'tip-moved rebuild could not run; merge stands unverified' };
          }
          const rv = revertMerge(repo, m.sha);
          return {
            ok: false, reverted: rv.ok,
            reason: `tip moved since the tripwire; merged-tip rebuild red — reverted ${String(m.sha).slice(0, 8)}${rv.ok ? '' : ` (REVERT FAILED: ${rv.reason} — stop and report)`}`,
          };
        }
        return { ok: true, sha: m.sha, verified: true };
      }
    }
    const m = mergeLocal(repo, branch, message);
    if (!m.ok) return { ok: false, reason: m.reason };
    return { ok: true, sha: m.sha, verified: true };
  } finally {
    const rel = releaseMergeLock(lock);
    if (!rel.ok && ctx && typeof ctx.log === 'function') {
      ctx.log(`merge lock release failed: ${rel.reason}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Worker slots (task 35b): one worker is a mechanism, not a discipline.
// ---------------------------------------------------------------------------

/** Slot `n` lives directly under the shared per-user lock directory. */
export function workerSlotPath(n, dir = buildLockDir()) {
  return join(dir, `worker-${n}`);
}

function readSlotRecord(path) {
  try {
    const [pidLine, sinceLine] = String(readFileSync(join(path, 'pid'), 'utf8')).split(/\r?\n/);
    const pid = Number.parseInt(pidLine, 10);
    if (!Number.isInteger(pid) || pid <= 0) return null;
    return { pid, since: (sinceLine ?? '').trim() || 'unknown time' };
  } catch {
    return null;
  }
}

function sweepStaleAttempts(n, dir = buildLockDir()) {
  // Best-effort litter control for reclaim races (see below): a reclaimer
  // that renamed a dead slot aside and then died before taking it leaves a
  // `worker-<n>.stale-*` directory. Only our own uid's temp dir is ever
  // listed, and only `worker-<n>.stale-*` names are removed.
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory() && e.name.startsWith(`worker-${n}.stale-`)) {
      try {
        rmSync(join(dir, e.name), { recursive: true, force: true });
      } catch {
        // Litter survives this pass; a later take sweeps it.
      }
    }
  }
}

/**
 * Take worker slot `n` in `1..workers` by atomic `mkdir`, holding a `pid`
 * file (`<pid>\n<started ISO>\n`). A slot whose recorded pid is dead (or
 * unreadable) is reclaimed by renaming it aside
 * (`worker-<n>.stale-<ts>-<pid>`) and taking the freed name — the rename is
 * the atomic step, so two reclaimers cannot both win: the loser finds its
 * rename failed and re-reads the winner as a live holder.
 */
export function acquireWorkerSlot({ workers, pid = process.pid, startedAt = new Date().toISOString(), dir = buildLockDir() } = {}) {
  const count = Number.isInteger(workers) && workers > 0 ? workers : 0;
  const holders = [];
  for (let n = 1; n <= count; n += 1) {
    const path = workerSlotPath(n, dir);
    if (mkdirOk(path)) {
      try {
        writeFileSync(join(path, 'pid'), `${pid}\n${startedAt}\n`, 'utf8');
      } catch {
        // The pid file is the holder record other runs read; without it the
        // slot is anonymous but still held (the directory IS the slot).
      }
      sweepStaleAttempts(n, dir);
      return { ok: true, slot: n, path };
    }
    const rec = readSlotRecord(path);
    if (rec && pidAlive(rec.pid)) {
      holders.push({ n, pid: rec.pid, since: rec.since, path });
      continue;
    }
    // Dead, anonymous, or unreadable holder: reclaim by rename-aside.
    const aside = `${path}.stale-${Date.now()}-${pid}`;
    try {
      renameSync(path, aside);
    } catch {
      const retry = readSlotRecord(path);
      holders.push(retry
        ? { n, pid: retry.pid, since: retry.since, path }
        : { n, pid: -1, since: 'unknown time', path });
      continue;
    }
    if (mkdirOk(path)) {
      try {
        writeFileSync(join(path, 'pid'), `${pid}\n${startedAt}\n`, 'utf8');
      } catch {
        // As above: the directory IS the slot.
      }
      try {
        rmSync(aside, { recursive: true, force: true });
      } catch {
        // Litter noted above; a later take sweeps it.
      }
      return { ok: true, slot: n, path };
    }
    const retry = readSlotRecord(path);
    holders.push(retry
      ? { n, pid: retry.pid, since: retry.since, path }
      : { n, pid: -1, since: 'unknown time', path });
  }
  const detail = holders.length
    ? holders.map((h) => `worker-${h.n} held by pid ${h.pid} since ${h.since} (${h.path})`).join('; ')
    : `no slots configured (workers=${count})`;
  return { ok: false, message: `worker slots exhausted: workers=${count}; ${detail}` };
}

/** Release a held slot. Best-effort; a failed release only reports. */
export function releaseWorkerSlot(handle) {
  const path = typeof handle === 'string' ? handle : handle && handle.path;
  if (!path) return { ok: false, reason: 'no slot path' };
  try {
    rmSync(path, { recursive: true, force: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e && e.message ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Train assembly + ordered run (tasks 35, 36; U2, bead 938e).
//
// Shape of the world this code assumes (stated, not hidden): the Desk's
// checkout sits ON the `train` branch from the first admission until a
// later unit fast-forwards `main` to a verified SHA (U5). Merges land on
// `train`; per-job records land on `train`; `main` is frozen between
// trains. The train runs in this same checkout (it IS the train's tree),
// never in a second worktree: gates, rederive, review seam, records
// commit and re-gate all read the tip they declare.
// ---------------------------------------------------------------------------

/** The integration branch merges land on. */
export const TRAIN_BRANCH = 'train';

/** The manifest's path inside the train checkout (machinery, row 35). */
export const MANIFEST_PATH = '.train/manifest.json';

/** Bounds keys, read from `data/config.json` — never literals (row 35). */
export function trainBounds(cfg) {
  const t = (cfg && cfg.train) || {};
  return {
    merges: t.merges,
    minutes: t.minutes,
    maxReviewedBytes: t.max_reviewed_bytes,
    maxSubjects: t.max_subjects,
    lockWaitSeconds: t.lock_wait_seconds,
  };
}

/**
 * Create the `train` branch from `baseRef` when missing. Never moves an
 * existing branch. Returns `{ok:true, created}` or `{ok:false, reason}`.
 */
export function ensureTrainBranch(repo, baseRef) {
  if (branchExists(repo, TRAIN_BRANCH)) return { ok: true, created: false };
  const r = gitTry(repo, ['branch', TRAIN_BRANCH, baseRef]);
  if (!r.ok) {
    return { ok: false, reason: String(r.stderr ?? r.stdout ?? '').trim() || 'could not create train branch' };
  }
  return { ok: true, created: true };
}

/**
 * Move the checkout onto the `train` branch. The merge phase calls this
 * before the tripwire so merges, per-job records and (later) the train's
 * own commits all land on `train`; `main` stays frozen between trains.
 * A checkout failure is environmental — the merge must not land.
 */
export function checkoutTrain(repo) {
  const r = gitTry(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  if (!r.ok) {
    return { ok: false, environmental: true, reason: `could not check out ${TRAIN_BRANCH}: ${String(r.stderr ?? r.stdout ?? '').trim() || 'checkout failed'}` };
  }
  return { ok: true };
}

/**
 * Merges on `train` that `main` does not have, oldest first. Each entry
 * carries the committer timestamp: the `T` trigger reads the oldest.
 */
export function pendingMerges(repo, mainRef = 'main') {
  const r = gitTry(repo, ['log', '--reverse', '--merges', '--format=%H %ct', `${mainRef}..${TRAIN_BRANCH}`]);
  if (!r.ok) return [];
  return String(r.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [sha, ts] = l.split(' ');
    return { sha, ts: Number(ts) || 0 };
  });
}

/** Parse `job <id> (<type>): ...` merge messages (mergeJobBranch's shape). */
export function mergeJobId(message) {
  const m = /^job (\S+) \(/.exec(String(message ?? '').split('\n')[0] ?? '');
  return m ? m[1] : null;
}

/**
 * Names changed by one merge: first-parent diff. (`git diff-tree` on a
 * merge sha alone prints nothing — combined diffs are suppressed without
 * `-m` — so a bare diff-tree silently measures zero bytes and every merge
 * fits every bound. Caught during authoring: seven 25KB merges admitted
 * seven.)
 */
export function mergeDiffNames(repo, sha) {
  const r = gitTry(repo, ['diff', '--name-only', `${sha}^`, sha]);
  if (!r.ok) return [];
  return String(r.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
}

/**
 * A merge's subjects: the content paths its diff touches, measured first
 * parent to merge (the merge's own content). The joinableSubjects seam is
 * the in-tree subject source (review.mjs); Stage 2 replaces the measure,
 * not the call sites (T13).
 */
export function mergeSubjects(repo, sha) {
  let changed = [];
  try {
    changed = changedPathsWithStatus(repo, `${sha}^`, sha);
  } catch {
    return [];
  }
  return joinableSubjects(changed);
}

/** Union of subjects over merges, preserving first-seen order. */
export function unionSubjects(lists) {
  const out = [];
  for (const list of lists) {
    for (const s of list || []) {
      if (!out.includes(s)) out.push(s);
    }
  }
  return out;
}

/**
 * The counted set (row 36, Q-S4): content and code — everything except
 * `data/derived/**` and `.train/**`. ONE helper backs BOTH the
 * `B_train`/`S_train` measurement and the post-rederive assertion, so the
 * two cannot drift; two implementations is a defect.
 */
export function countedPaths(paths) {
  return (paths || []).filter((p) => {
    const n = String(p).replace(/\\/g, '/');
    return !n.startsWith('data/derived/') && n !== 'data/derived' && !n.startsWith('.train/') && n !== '.train';
  });
}

/**
 * Blob bytes of a counted path at a tip. `B_train` counts BYTES (row 36:
 * `max_reviewed_bytes`), and the only byte measure that cannot drift from
 * what the reviewer reads is the blob the tip carries.
 */
export function blobBytes(repo, tip, path) {
  const r = gitTry(repo, ['cat-file', '-s', `${tip}:${String(path).replace(/\\/g, '/')}`]);
  const n = Number(String(r.stdout ?? '').trim());
  return r.ok && Number.isFinite(n) ? n : 0;
}

/**
 * Measure one pending merge for the bounds: bytes over its counted paths
 * at the measuring tip, subjects from its own diff. Returns
 * `{sha, jobId, subjects, bytes}`.
 */
export function measureMerge(repo, tip, sha) {
  const names = mergeDiffNames(repo, sha);
  const counted = countedPaths(names);
  let bytes = 0;
  for (const p of counted) bytes += blobBytes(repo, tip, p);
  let jobId = null;
  try {
    const m = gitTry(repo, ['log', '-1', '--format=%B', sha]);
    jobId = m.ok ? mergeJobId(m.stdout) : null;
  } catch {
    jobId = null;
  }
  return { sha, jobId, subjects: mergeSubjects(repo, sha), bytes };
}

/**
 * Prefix-that-fits (row 35): oldest pending first, accumulate bytes and
 * distinct subjects, cut at the first merge that would breach either
 * bound. Returns `{admitted, remainder}` — the remainder waits for the
 * next train, it is never force-fit.
 */
export function selectFittingPrefix(measured, bounds) {
  const admitted = [];
  let bytes = 0;
  let subjects = [];
  for (const m of measured) {
    const nextSubjects = unionSubjects([subjects, m.subjects]);
    if (bytes + m.bytes > bounds.maxReviewedBytes || nextSubjects.length > bounds.maxSubjects) {
      return { admitted, remainder: measured.slice(admitted.length) };
    }
    bytes += m.bytes;
    subjects = nextSubjects;
    admitted.push(m);
  }
  return { admitted, remainder: [] };
}

/**
 * Should a train run now? `K` (pending count), `T` (oldest pending age in
 * minutes), idle (pending work with nothing else queued and nothing
 * admitted this run — the loop would otherwise strand it). Returns
 * `{fire, reason}`; `{fire:false}` names nothing.
 */
export function evaluateTriggers({ pending, bounds, nowS, queueEmpty, admittedThisRun }) {
  if (!pending.length) return { fire: false };
  if (pending.length >= bounds.merges) {
    return { fire: true, reason: `K trigger: ${pending.length} pending merges >= ${bounds.merges}` };
  }
  const oldestAgeMin = (nowS - (pending[0].ts || nowS)) / 60;
  if (oldestAgeMin >= bounds.minutes) {
    return { fire: true, reason: `T trigger: oldest pending merge ${oldestAgeMin.toFixed(1)}min >= ${bounds.minutes}min` };
  }
  if (queueEmpty && !admittedThisRun) {
    return { fire: true, reason: 'idle trigger: merges pending with nothing else queued' };
  }
  return { fire: false };
}

/** Records-commit allow-list (row 36, Q-S5): prefixes, machine-checked. */
export const RECORDS_ALLOW = ['data/ledger.jsonl', 'data/reviews/', 'data/carried/', 'data/proposals/'];

/** True when a repo-relative path may ride the train's records commit. */
export function recordsPathAllowed(path) {
  const n = String(path).replace(/\\/g, '/');
  return RECORDS_ALLOW.some((a) => (a.endsWith('/') ? n.startsWith(a) : n === a));
}

/**
 * The machine check (row 36): EVERY dirty path must be allow-listed, or
 * the train fails — a records commit that touches a content path is the
 * defect, wherever the path came from.
 */
export function checkRecordsPaths(dirtyPaths) {
  const bad = (dirtyPaths || []).map((p) => String(p).replace(/\\/g, '/')).filter((p) => !recordsPathAllowed(p));
  if (bad.length) {
    return { ok: false, reason: `records commit refuses non-allow paths: ${bad.join(', ')}` };
  }
  return { ok: true };
}

/** Dirty (uncommitted) repo-relative paths in a checkout. */
export function dirtyPaths(repo) {
  const r = gitTry(repo, ['status', '--porcelain=v1', '-uall']);
  if (!r.ok) return [];
  return String(r.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.slice(3).trim().replace(/^"(.+)"$/, '$1'));
}

/**
 * Default train review (production until U4 wires the assembly): FAIL
 * CLOSED. There is no honest approval without the 41–42 assembly, and an
 * honest refusal beats a borrowed one — merges wait, nothing publishes.
 */
export async function unreviewedTrain() {
  return { verdict: 'reject', reason: 'train review assembly lands in U4 (tasks 41-42); no train is approved without it' };
}

/** Default rederive: the real single rederive over the train checkout. */
export async function trainRederive(ctx, dir) {
  return rederiveStep({ ...ctx, repoRoot: dir });
}

/**
 * Append the train's own ledger line: at the records commit, after the
 * rederive (row 36). `LEDGER_FIELDS` stays frozen — `train` is the ONE
 * row-declared additive key (E-closure holds: base set untouched, no
 * other writer touched). Figures that do not exist until the review ends
 * ride this line, never a per-job one.
 */
export function appendTrainLine(ctx, { id, runner, provider, tier, mm, gateSeconds, train }) {
  const line = makeLedgerLine({
    id, type: 'train', runner, provider, tier, mm, outcome: 'done',
    gate_seconds: gateSeconds, ts: ctx && typeof ctx.now === 'function' ? ctx.now().toISOString() : new Date().toISOString(),
  });
  line.train = train;
  return appendLedger(ctx, line);
}

/**
 * The ordered run (row 36): full set → one rederive → review over the
 * whole diff including rederived data → path-restricted records commit →
 * post-records re-gate (build lock, never merge lock) → declared SHA →
 * publish HANDOFF (no publish invocation — S2, U5 owns the push).
 *
 * Seams (tests inject; production defaults): `gates` (gateRunner shape),
 * `rederive` (single call), `review` (41–42 contract shape). Returns
 * `{ok:true, sha, manifest, ...}` or `{ok:false, reason}` — every refusal
 * names its step.
 */
export async function runTrain(ctx, {
  repo, trainId, manifest, gates, rederive = trainRederive, review = unreviewedTrain, now = Date.now,
}) {
  const fn = gateRunner(gates);
  const tip = headSha(repo);
  // 1. Manifest FIRST, before any gate runs (row 35): the reviewed tree
  // carries it. It is already written by the caller (assembleTrain);
  // here assert it is committed — an uncommitted manifest is a stop.
  const m = gitTry(repo, ['status', '--porcelain=v1', '-uall', '--', MANIFEST_PATH]);
  if (m.ok && String(m.stdout ?? '').trim()) {
    return { ok: false, reason: 'train manifest is dirty at run start — commit it first (task 35 commits it before any gate runs)' };
  }
  // 2. Full TRAIN_GATES set over the train tip.
  const gateSeconds = {};
  let g = null;
  try {
    const t0 = now();
    g = fn(ctx, repo, { scripts: [...TRAIN_GATES] });
    gateSeconds.full = Math.round(((now() - t0) / 1000) * 100) / 100;
  } catch (e) {
    return { ok: false, reason: `train gates threw (${e.message ?? String(e)}); merge stands, nothing publishes` };
  }
  if (!g || !g.ok) {
    return { ok: false, reason: `train gates red: ${g && g.output ? String(g.output).split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') : 'no gate result'}` };
  }
  // 3. ONE rederive. The counted baseline is frozen at assembly (the
  // manifest's baselinePaths over mainTip...assemblyTip); after the
  // rederive the tip must be unmoved and the baseline identical — a
  // mid-train merge would review a different set than the bounds
  // admitted. One helper backs both sides (Q-S4).
  let rd = null;
  try {
    rd = await rederive(ctx, repo);
  } catch (e) {
    return { ok: false, reason: `train rederive threw (${e.message ?? String(e)}); merge stands, nothing publishes` };
  }
  if (!rd || !rd.ok) {
    return { ok: false, reason: `train rederive failed: ${rd ? rd.reason : 'no result'}` };
  }
  const tipNow = headSha(repo);
  if (tipNow !== manifest.assemblyTip) {
    return { ok: false, reason: `train tip moved mid-run (${String(manifest.assemblyTip).slice(0, 8)} → ${String(tipNow).slice(0, 8)}) — the reviewed set is no longer what the bounds admitted` };
  }
  const nowNames = gitTry(repo, ['diff', '--name-only', `${manifest.mainTip}...HEAD`]);
  const nowPaths = countedPaths(String(nowNames.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean)).sort();
  const basePaths = [...(manifest.baselinePaths || [])].sort();
  const extra = nowPaths.filter((p) => !basePaths.includes(p));
  const missing = basePaths.filter((p) => !nowPaths.includes(p));
  if (extra.length || missing.length) {
    return { ok: false, reason: `counted paths changed since the bound was measured (+${extra.join(',') || 'none'} -${missing.join(',') || 'none'})` };
  }
  // 4. Review over the whole diff INCLUDING rederived data (uncommitted
  // rederive output rides along). Fail closed on anything but approve —
  // eviction is U3; on the happy path a non-approval fails the train.
  const base = manifest.mainTip;
  const committed = gitTry(repo, ['diff', '--name-only', `${base}...${tip}`]);
  // Uncommitted rederive output is UNTRACKED, which `git diff` never
  // lists — read the status instead, so regenerated data provably rides
  // the reviewed diff (mutation B fails here when it does not).
  const uncommitted = dirtyPaths(repo);
  const diffNames = [...new Set([
    ...String(committed.stdout ?? '').split('\n'),
    ...uncommitted,
  ].map((l) => String(l).trim()).filter(Boolean))].sort();
  const diffText = `--- reviewed diff for train ${trainId} ---\nfiles:\n${diffNames.join('\n')}\n`;
  const reviewStart = now();
  let vr = null;
  try {
    vr = await review({ diffText, manifest, repo });
  } catch (e) {
    return { ok: false, reason: `train review threw (${e.message ?? String(e)}); merge stands, nothing publishes` };
  }
  const mm = Math.round((((now() - reviewStart) / 60000) + Number.EPSILON) * 100) / 100;
  if (!vr || !['approve', 'revise', 'reject'].includes(vr.verdict)) {
    return { ok: false, reason: 'train review record absent or malformed — fail closed: no fast-forward, no publish' };
  }
  if (vr.verdict !== 'approve') {
    return { ok: false, reason: `train review did not approve (${vr.verdict}): ${vr.reason || 'no reason given'} — eviction is U3; the happy path stops here` };
  }
  // 5. Train's own line at the records commit, after the rederive (row
  // 36): review model-minutes summed over every re-review (one review on
  // the happy path), gate seconds, the row-36 shape.
  const trainLine = appendTrainLine(ctx, {
    id: trainId,
    runner: vr.runner ?? 'unwired-reviewer',
    provider: vr.provider ?? 'unwired-provider',
    tier: vr.tier ?? 'unwired-tier',
    mm,
    gateSeconds,
    train: {
      id: trainId,
      merges: manifest.merges.map((x) => x.sha),
      gate_seconds: gateSeconds,
      evictions: [],
      pre_existing_hold: false,
      findings_not_in_any_record: vr.findingsNotInAnyRecord ?? 0,
      review_rounds: 1,
    },
  });
  void trainLine;
  // 6. Records commit, path-restricted with the machine check (row 36):
  // stage the allow-listed dirt, then check WHAT THE COMMIT WILL
  // CONTAIN (`git diff --cached --name-only`) — rederive output and any
  // other working-tree dirt stays unstaged and uncommitted, which is
  // exactly what the allow-list governs. The manifest is NOT part of
  // this commit (task 35 committed it first).
  const dirty = dirtyPaths(repo);
  const staged = dirty.filter((p) => recordsPathAllowed(p));
  const add = gitTry(repo, ['add', '--', ...staged]);
  if (!add.ok) {
    return { ok: false, reason: `records staging failed: ${String(add.stderr ?? add.stdout ?? '').trim() || 'git add failed'}` };
  }
  const cached = gitTry(repo, ['diff', '--cached', '--name-only']);
  const willCommit = String(cached.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const check = checkRecordsPaths(willCommit);
  if (!check.ok) return { ok: false, reason: check.reason };
  const cm = gitTry(repo, ['commit', '--no-verify', '-m', `train ${trainId}: records`]);
  if (!cm.ok) {
    return { ok: false, reason: `records commit failed: ${String(cm.stderr ?? cm.stdout ?? '').trim() || 'git commit failed'}` };
  }
  // 7. Post-records re-gate: build + verify-launch (reusing that build) +
  // verify-surfaces on the post-records tip — build lock, NEVER merge lock
  // (the merge lock guards the branch's tip; this runs on the declared
  // tip). The tip this produces is the SHA the train declares verified.
  let rb = null;
  try {
    rb = fn(ctx, repo, { scripts: ['build', 'verify-launch', 'verify-surfaces'] });
  } catch (e) {
    return { ok: false, reason: `post-records re-gate threw (${e.message ?? String(e)}); records stand committed, nothing publishes` };
  }
  if (!rb || !rb.ok) {
    return { ok: false, reason: `post-records re-gate red: ${rb && rb.output ? String(rb.output).split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') : 'no gate result'}` };
  }
  const sha = headSha(repo);
  return {
    ok: true, sha, manifest, mm, gateSeconds,
    note: `train ${trainId} verified at ${sha} — publish handoff (S2): no publish invocation; U5 owns the push`,
  };
}

/**
 * Assemble a train from pending merges: measure, cut the fitting prefix,
 * write + commit the manifest FIRST. Returns `{ok:true, manifest}` or
 * `{ok:false, reason}`. An unparseable merge message fails the assembly —
 * gating unknown content is the safe direction. The manifest freezes the
 * assembly baseline (tip + counted paths over mainTip...tip) that the
 * post-rederive assert re-checks.
 */
export function assembleTrain(repo, { trainId, bounds, mainRef = 'main' }) {
  const pending = pendingMerges(repo, mainRef);
  if (!pending.length) return { ok: false, reason: 'no pending merges on train' };
  const tip = headSha(repo);
  const mainTipR = gitTry(repo, ['rev-parse', mainRef]);
  const mainTip = mainTipR.ok ? String(mainTipR.stdout ?? '').trim() : null;
  if (!mainTip) return { ok: false, reason: `cannot resolve ${mainRef}` };
  const measured = pending.map((p) => measureMerge(repo, tip, p.sha));
  const unknown = measured.filter((x) => !x.jobId);
  if (unknown.length) {
    return { ok: false, reason: `cannot admit merge(s) with unparseable job id: ${unknown.map((x) => String(x.sha).slice(0, 8)).join(', ')}` };
  }
  const { admitted, remainder } = selectFittingPrefix(measured, bounds);
  if (!admitted.length) {
    return { ok: false, reason: 'no pending merge fits the bounds — first merge alone breaches them' };
  }
  const baseNames = gitTry(repo, ['diff', '--name-only', `${mainTip}...${tip}`]);
  const manifest = {
    train: trainId,
    mainTip,
    baselinePaths: countedPaths(String(baseNames.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean)),
    merges: admitted.map((x) => ({ sha: x.sha, jobId: x.jobId, subjects: x.subjects })),
    measuredPaths: unionSubjects([countedPaths(admitted.flatMap((x) => mergeDiffNames(repo, x.sha)))]),
    bounds: { maxReviewedBytes: bounds.maxReviewedBytes, maxSubjects: bounds.maxSubjects },
    remainder: remainder.map((x) => String(x.sha).slice(0, 8)),
  };
  try {
    mkdirSync(join(repo, '.train'), { recursive: true });
    writeFileSync(join(repo, MANIFEST_PATH), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  } catch (e) {
    return { ok: false, reason: `could not write manifest: ${e.message ?? String(e)}` };
  }
  const add = gitTry(repo, ['add', '--', MANIFEST_PATH]);
  if (!add.ok) {
    return { ok: false, reason: `manifest staging failed: ${String(add.stderr ?? add.stdout ?? '').trim() || 'git add failed'}` };
  }
  const cm = gitTry(repo, ['commit', '--no-verify', '-m', `train ${trainId}: manifest (${admitted.length} merges)`]);
  if (!cm.ok) {
    return { ok: false, reason: `manifest commit failed: ${String(cm.stderr ?? cm.stdout ?? '').trim() || 'git commit failed'}` };
  }
  // The assembly tip is the MANIFEST COMMIT, not the pre-commit tip: the
  // reviewed tree carries the manifest, and the immobility assert must
  // span it. (Caught during authoring: pinning the pre-commit tip made
  // every green train refuse itself as moved.) It equals the manifest
  // commit's own sha, so a post-mortem re-derives it from the log
  // (`train <id>: manifest`) — it is deliberately not written back into
  // the committed file, which would dirty the tree the gates run over.
  manifest.assemblyTip = headSha(repo);
  return { ok: true, manifest };
}

/**
 * Admission disjointness (row 35): the incoming job's subjects against
 * the admitted set's. Overlap waits — resumable, never a failure. The
 * incoming subjects ride the run's existing measurement (run.mjs measures
 * the branch diff vs main); the admitted set is measured live from git,
 * so no pending-state file exists to go stale.
 */
export function admissionOverlap(repo, incomingSubjects) {
  const pending = pendingMerges(repo);
  if (!pending.length || !(incomingSubjects || []).length) return { overlap: false, with: [] };
  const admitted = unionSubjects(pending.map((p) => mergeSubjects(repo, p.sha)));
  const overlap = (incomingSubjects || []).filter((s) => admitted.includes(s));
  return { overlap: overlap.length > 0, with: overlap };
}
