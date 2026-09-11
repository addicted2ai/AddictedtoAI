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

import { mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildLockDir } from '../../scripts/build-lock.mjs';
import { addWorktree, branchExists, changedPathsWithStatus, gitTry, headSha, mergeLocal, removeWorktree } from './git.mjs';
import { gatesHitEnvironmentalFailure, runGates, TRAIN_GATES } from './gates.mjs';
import { joinableSubjects } from './review.mjs';
import { appendLedger, makeLedgerLine, readLedger } from './ledger.mjs';
import { localDate } from './dates.mjs';
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
  repo, branch, baseRef, message, tripwireBaseTip, gates, noGates, lockWaitMs, admission,
}) {
  const lock = await acquireMergeLock({ waitMs: lockWaitMs });
  if (!lock.ok) {
    return { ok: false, environmental: true, reason: `merge refused: ${lock.reason}` };
  }
  try {
    const fn = gateRunner(gates);
    // Stage-1 U3 (task 38): under a pre-existing hold the merge lock keeps
    // admitting merges up to the configured size (`train.merges`, threaded in
    // by the caller through `admission`) and refuses beyond it. The refusal
    // reason IS the telling: run.mjs logs it on the worker's own run
    // (`merge failed: ...`) and books the outcome, so a worker whose merge
    // is waiting reads it where it already reads everything. Without
    // `admission` (run.mjs until its owning unit threads it) the legacy
    // unbounded admission stands.
    let heldNote = '';
    if (admission && admission.held === true && Number.isFinite(admission.maxMerges)) {
      const waiting = pendingMerges(repo, admission.mainRef ?? 'main').length;
      if (waiting >= admission.maxMerges) {
        return { ok: false, reason: `train held (pre-existing red): ${waiting} merges already wait (limit ${admission.maxMerges}) — this merge is refused and waits for the hold to clear; nothing merged` };
      }
      heldNote = ` (train held: pre-existing red; ${waiting} merge(s) ahead, within the ${admission.maxMerges}-merge limit — this merge waits for the hold to clear)`;
    }
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
        return { ok: true, sha: m.sha, verified: true, ...(heldNote ? { note: `merged onto the held train${heldNote}` } : {}) };
      }
    }
    const m = mergeLocal(repo, branch, message);
    if (!m.ok) return { ok: false, reason: m.reason };
    return { ok: true, sha: m.sha, verified: true, ...(heldNote ? { note: `merged onto the held train${heldNote}` } : {}) };
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
export function appendTrainLine(ctx, { id, runner, provider, tier, mm, gateSeconds, train, outcome = 'done' }) {
  const line = makeLedgerLine({
    id, type: 'train', runner, provider, tier, mm, outcome,
    gate_seconds: gateSeconds, ts: ctx && typeof ctx.now === 'function' ? ctx.now().toISOString() : new Date().toISOString(),
  });
  line.train = train;
  return appendLedger(ctx, line);
}

/**
 * The train's finish (row 36 steps 4-7, shared): review over the whole diff
 * INCLUDING uncommitted rederive output → the train's own ledger line → the
 * path-restricted records commit → the post-records re-gate → the declared
 * SHA + publish handoff. Extracted verbatim from `runTrain` so the happy
 * path and the post-eviction continuation ride one tail instead of two:
 * `evictions` marks what was evicted to get here, `reviewRounds`/`mmPrior`
 * count the reviews actually run. Returns `{ok:true, sha, manifest, mm,
 * gateSeconds, reviewer}` or `{ok:false, reason}` — every refusal names
 * its step.
 */
async function finishTrainRun(ctx, {
  repo, trainId, manifest, gates, review = unreviewedTrain, now = Date.now,
  gateSeconds = {}, evictions = [], reviewRounds = 1, mmPrior = 0,
}) {
  const fn = gateRunner(gates);
  // 4. Review over the whole diff INCLUDING rederived data (uncommitted
  // rederive output rides along). Fail closed on anything but approve.
  const base = manifest.mainTip;
  const tip = headSha(repo);
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
  const roundMm = Math.round((((now() - reviewStart) / 60000) + Number.EPSILON) * 100) / 100;
  const mm = Math.round(((mmPrior + roundMm) + Number.EPSILON) * 100) / 100;
  if (!vr || !['approve', 'revise', 'reject'].includes(vr.verdict)) {
    return { ok: false, reason: 'train review record absent or malformed — fail closed: no fast-forward, no publish' };
  }
  if (vr.verdict !== 'approve') {
    return { ok: false, reason: `train review did not approve (${vr.verdict}): ${vr.reason || 'no reason given'}` };
  }
  const reviewer = { runner: vr.runner ?? 'unwired-reviewer', provider: vr.provider ?? 'unwired-provider', tier: vr.tier ?? 'unwired-tier' };
  // 5. Train's own line at the records commit, after the rederive (row
  // 36): review model-minutes summed over every review actually run, gate
  // seconds, the row-36 shape. U3 fills the landed fields: the eviction
  // entries (if any), the hold flag (false past this point — a held train
  // never reaches a review), the rounds run.
  const trainLine = appendTrainLine(ctx, {
    id: trainId,
    runner: reviewer.runner,
    provider: reviewer.provider,
    tier: reviewer.tier,
    mm,
    gateSeconds,
    train: {
      id: trainId,
      merges: manifest.merges.map((x) => x.sha),
      gate_seconds: gateSeconds,
      evictions,
      pre_existing_hold: false,
      findings_not_in_any_record: vr.findingsNotInAnyRecord ?? 0,
      review_rounds: reviewRounds,
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
    ok: true, sha, manifest, mm, gateSeconds, reviewer,
    note: `train ${trainId} verified at ${sha} — publish handoff (S2): no publish invocation; U5 owns the push`,
  };
}

// ---------------------------------------------------------------------------
// Red path (task 38): classification-first, pre-existing hold,
// leave-one-out with failing-gate search and full-gates+review after
// eviction, whole-train rejection, date floor. Plus the replay audit
// (task 40). The smallest unit where a red train is safe to meet.
// ---------------------------------------------------------------------------

/** First failing script in a gate result — the only gate the search re-runs. */
export function failingGateOf(gateResult) {
  const results = (gateResult && gateResult.results) || [];
  const hit = results.find((r) => r && !r.ok);
  return hit && hit.script ? hit.script : null;
}

/**
 * The date floor (row 38): the manifest records the local date the train
 * began under (`begunDate`, stamped at assembly with the existing
 * `localDate` helper — extended nothing). A search that would cross a
 * change in it is refused: a removal trialled under another date gates a
 * different tree than the bounds admitted. A manifest with no begunDate
 * (pre-U3 assembly) refuses the same way — a search that cannot prove it
 * stays under one date does not run.
 */
export function checkBegunDate(manifest, now) {
  const today = localDate(new Date(now()));
  const begun = manifest && manifest.begunDate;
  if (!begun) {
    return { ok: false, today, begun: null, reason: 'train manifest carries no begunDate — a search cannot prove it stays under one local date, so no removal is trialled' };
  }
  if (begun !== today) {
    return { ok: false, today, begun, reason: `train began under ${begun} but the search would run under ${today} — refusing a search across a date change` };
  }
  return { ok: true, today, begun };
}

/** Best-effort removal of a scratch classification/replay worktree. */
function dropWorktree(repo, dir, ctx) {
  try {
    removeWorktree(repo, dir);
  } catch (e) {
    if (ctx && typeof ctx.log === 'function') ctx.log(`scratch worktree removal failed: ${e.message ?? String(e)}`);
  }
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // Scratch in the OS temp dir; a later run never reuses the name.
  }
}

/**
 * Classification-first (row 38): re-run the FULL gate set on the pre-train
 * commit (`manifest.mainTip`) BEFORE anything is reverted. Green there →
 * the train did it; red there → `pre-existing`.
 *
 * The gates seam takes a directory, not a ref, so the pre-train commit is
 * gated in a DETACHED worktree at the exact sha. A worktree has its own
 * HEAD and index: checking the old commit out there cannot move the train
 * tip it classifies, and the worktree is removed before this returns.
 * Returns `{ok:true, verdict}` or `{ok:false, reason, environmental?}` —
 * an unclassifiable red (worktree/gates down, or an environmental gate
 * result) is UNKNOWN, never pre-existing: a hold or a revert on an
 * unknown verdict would blame the wrong party.
 */
export function classifyRedTrain(ctx, { repo, manifest, gates }) {
  const fn = gateRunner(gates);
  const mainTip = manifest && manifest.mainTip;
  if (!mainTip) {
    return { ok: false, reason: 'cannot classify a red train without the manifest mainTip — nothing reverted' };
  }
  let dir = null;
  try {
    dir = mkdtempSync(join(tmpdir(), 'atai-train-classify-'));
  } catch (e) {
    return { ok: false, environmental: true, reason: `classification scratch unavailable (${e.message ?? String(e)}) — verdict unknown; nothing reverted` };
  }
  try {
    addWorktree(repo, dir, mainTip, { detach: true });
  } catch (e) {
    dropWorktree(repo, dir, ctx);
    return { ok: false, environmental: true, reason: `classification worktree at ${String(mainTip).slice(0, 8)} failed (${e.message ?? String(e)}) — verdict unknown; nothing reverted` };
  }
  let g = null;
  try {
    g = fn(ctx, dir, { scripts: [...TRAIN_GATES] });
  } catch (e) {
    dropWorktree(repo, dir, ctx);
    return { ok: false, environmental: true, reason: `classification gates threw (${e.message ?? String(e)}) — verdict unknown; nothing reverted` };
  }
  dropWorktree(repo, dir, ctx);
  if (!g || !g.ok) {
    if (!g || gatesHitEnvironmentalFailure(g)) {
      return { ok: false, environmental: true, reason: 'classification gates could not run on the pre-train commit — verdict unknown; nothing reverted' };
    }
    const tail = g && g.output ? String(g.output).split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') : 'no gate result';
    return { ok: true, verdict: 'pre-existing', detail: tail };
  }
  return { ok: true, verdict: 'train-did-it' };
}

/**
 * Leave-one-out over the WHOLE train (row 38, Q-S8), oldest first — never
 * newest-first, which is "revert the newest" wearing a search costume
 * (mutation B proves what that costs). Each removal is trialled as an
 * UNCOMMITTED `revert -m 1 --no-commit` (the tripwire's provisional shape:
 * applied, gated, reset away) and re-runs ONLY the failing gate through
 * the same seam — no second gate path. A removal that clears it is
 * reported, never committed here: eviction is the caller's act.
 *
 * Returns `{ok:true, clearer, untried}` (clearer null when no single
 * removal clears it) or `{ok:false, reason}` when the search itself must
 * stop — date change, unrestorable tip, dirty tree. A conflicting revert
 * does not stop the search: that candidate is recorded untried and the
 * search moves on.
 */
export function leaveOneOutSearch(ctx, { repo, manifest, gates, failingGate, now = Date.now }) {
  const fn = gateRunner(gates);
  const merges = (manifest && manifest.merges) || [];
  const untried = [];
  for (const m of merges) {
    const short = String(m.sha).slice(0, 8);
    const day = checkBegunDate(manifest, now);
    if (!day.ok) return { ok: false, reason: day.reason, begun: day.begun, today: day.today };
    const trial = gitTry(repo, ['revert', '-m', '1', '--no-commit', m.sha]);
    if (!trial.ok) {
      gitTry(repo, ['revert', '--quit']);
      gitTry(repo, ['reset', '--hard', 'HEAD']);
      untried.push({ sha: m.sha, why: String(trial.stderr ?? trial.stdout ?? '').trim() || 'revert would not apply cleanly' });
      continue;
    }
    let g = null;
    try {
      g = fn(ctx, repo, { scripts: [failingGate] });
    } catch (e) {
      g = { ok: false, threw: e.message ?? String(e) };
    }
    const reset = gitTry(repo, ['reset', '--hard', 'HEAD']);
    if (!reset.ok) {
      return { ok: false, reason: `cannot restore the train tip after trialling ${short} (${String(reset.stderr ?? reset.stdout ?? '').trim() || 'reset failed'}) — the tree may be dirty; no removal is trialled further`, dirty: true };
    }
    const stray = gitTry(repo, ['diff', '--name-only']);
    if (stray.ok && String(stray.stdout ?? '').trim()) {
      return { ok: false, reason: `trial of ${short} left tracked changes behind — the tree may be dirty; no removal is trialled further`, dirty: true };
    }
    if (g && g.ok) return { ok: true, clearer: m, untried };
  }
  return { ok: true, clearer: null, untried };
}

/**
 * Is a pre-existing hold active? The newest `train`-type ledger line
 * decides: `pre_existing_hold: true` holds until a later train line
 * carries false. Never throws — an unreadable ledger reads as unheld
 * (the hold re-reports on the next train run that can read it).
 */
export function preExistingHold(ctx) {
  try {
    const lines = readLedger(ctx);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const l = lines[i];
      if (l && l.type === 'train' && l.train && typeof l.train === 'object') {
        return { held: l.train.pre_existing_hold === true, trainId: l.train.id ?? l.id ?? null };
      }
    }
    return { held: false, trainId: null };
  } catch (e) {
    return { held: false, trainId: null, error: e && e.message ? e.message : String(e) };
  }
}

/** Rewrite the train manifest in place (eviction marks, replay verdicts). */
function writeManifest(repo, manifest) {
  try {
    mkdirSync(join(repo, '.train'), { recursive: true });
    writeFileSync(join(repo, MANIFEST_PATH), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message ?? String(e) };
  }
}

/**
 * Commit allow-listed train records (ledger line, upkeep proposal) outside
 * the records commit. Same machine check as the records commit — every
 * staged path must be allow-listed — but a different commit with its own
 * message: the hold, the rejection, the replay verdict each land where a
 * post-mortem looks for them. Empty (nothing allow-listed to commit) is
 * success, not failure.
 */
function commitAllowListed(repo, message) {
  const dirty = dirtyPaths(repo);
  const staged = dirty.filter((p) => recordsPathAllowed(p));
  if (staged.length) {
    const add = gitTry(repo, ['add', '--', ...staged]);
    if (!add.ok) {
      return { ok: false, reason: `staging failed: ${String(add.stderr ?? add.stdout ?? '').trim() || 'git add failed'}` };
    }
  }
  const cached = gitTry(repo, ['diff', '--cached', '--name-only']);
  const willCommit = String(cached.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const check = checkRecordsPaths(willCommit);
  if (!check.ok) return { ok: false, reason: check.reason };
  if (!willCommit.length) return { ok: true, empty: true };
  const cm = gitTry(repo, ['commit', '--no-verify', '-m', message]);
  if (!cm.ok) {
    return { ok: false, reason: `commit failed: ${String(cm.stderr ?? cm.stdout ?? '').trim() || 'git commit failed'}` };
  }
  return { ok: true };
}

/**
 * The pre-existing hold (row 38, Q-S9): hold the train, report it through
 * the run report (the return reason, logged every run by the caller) and
 * the train's own ledger line (`pre_existing_hold: true`, outcome
 * `blocked` — the run is complete and honestly cannot proceed until the
 * base is fixed), write exactly one upkeep proposal under
 * `data/proposals/` named by the pre-train commit (a second run rewrites
 * the same path rather than duplicating), never touch `HOLD.md`. No `bd`
 * anywhere: the reopen is deferred to task 69 — the eviction is recorded
 * on the ledger and in the manifest, and `beads.mjs` reopens when it
 * exists. Returns `{ok:false, held:'pre-existing', reason}`.
 */
export function holdPreExistingTrain(ctx, { repo, trainId, manifest, now = Date.now, gateSeconds = {}, detail = '' }) {
  const mainTip = manifest.mainTip;
  const short = String(mainTip).slice(0, 8);
  const slug = `pre-train-${short}-red`;
  const today = localDate(new Date(now()));
  // `type: repair`, read against the tree: `upkeep` is a budget CATEGORY
  // (config `budget.categories`), not a job type, and proposals.mjs marks
  // any `type` outside the closed JOB_TYPES list malformed — skipped
  // loudly, never selectable. A literal `type: upkeep` would file an item
  // the intake channel refuses, which is the opposite of the ruling's own
  // rationale ("the intake channel that exists today"). `repair` is the
  // upkeep-category type matching the work: fix the red base.
  const proposalBody =
    `---\n` +
    `date: ${today}\n` +
    `slug: ${slug}\n` +
    `type: repair\n` +
    `summary: >\n` +
    `  The pre-train commit ${mainTip} is red under the full train gate set, so train ${trainId} ` +
    `holds: no admitted merge is at fault and nothing is reverted. Repair the red base; the held merges ` +
    `ride the next train once its tip is green.\n` +
    `evidence: >\n` +
    `  Train ${trainId} ran the full TRAIN_GATES set red at its tip and re-ran the same set red on the ` +
    `pre-train commit ${mainTip} (classification-first, task 38)${detail ? ` — last lines: ${detail}` : ''}.\n` +
    `---\n` +
    `\n` +
    `Why this is upkeep and not train work. The train cannot fix its own base: every removal it could ` +
    `try leaves the red in place, because the red predates every merge on the train. The fix belongs to ` +
    `a repair job against the base tip named above, after which the held train re-runs green.\n`;
  try {
    mkdirSync(join(repo, 'data', 'proposals'), { recursive: true });
    writeFileSync(join(repo, 'data', 'proposals', `${slug}.md`), proposalBody, 'utf8');
  } catch (e) {
    return { ok: false, held: 'pre-existing', reason: `train held: pre-existing red at ${short}, but the one upkeep proposal could not be written (${e.message ?? String(e)}) — merges wait on train, nothing publishes` };
  }
  const merges = (manifest.merges || []).map((x) => x.sha);
  try {
    appendTrainLine(ctx, {
      id: trainId, runner: 'unwired-reviewer', provider: 'unwired-provider', tier: 'unwired-tier',
      mm: 0, gateSeconds, outcome: 'blocked',
      train: {
        id: trainId, merges, gate_seconds: gateSeconds, evictions: [],
        pre_existing_hold: true, findings_not_in_any_record: 0, review_rounds: 0,
      },
      note: `held: pre-existing red at ${short} — the train did not cause it; one upkeep proposal ${slug}.md names the base to repair`,
    });
  } catch (e) {
    return { ok: false, held: 'pre-existing', reason: `train held: pre-existing red at ${short}, but the hold line could not be appended (${e.message ?? String(e)}) — merges wait on train, nothing publishes` };
  }
  const cm = commitAllowListed(repo, `train ${trainId}: hold (pre-existing red at ${short})`);
  if (!cm.ok) {
    return { ok: false, held: 'pre-existing', reason: `train held: pre-existing red at ${short} — the hold line and upkeep proposal stand uncommitted (${cm.reason}); merges wait on train, nothing publishes` };
  }
  return { ok: false, held: 'pre-existing', reason: `train held: pre-existing red at ${short} — full gates red on the train tip and on the pre-train commit; one upkeep proposal ${slug}.md; merges wait on train, nothing publishes` };
}

/**
 * Whole-train rejection (row 38): still red after eviction, or no single
 * removal clears it (or no search is possible at all). The ledger line
 * carries outcome `failed` — the gates rejected the work — with the
 * evictions accumulated so far (the eviction on a still-red train STANDS:
 * history is append-only honesty, and the replay audits exactly that
 * entry). The revert, if one was made, is never un-reverted; every other
 * merge stays where it is and waits on `train` for the next evaluation,
 * like any train failure. Returns `{ok:false, rejected:true, reason,
 * evictions}`.
 */
export function rejectTrain(ctx, { repo, trainId, manifest, gateSeconds = {}, evictions = [], reason, mm = 0, reviewRounds = 0, reviewer = {} }) {
  const merges = (manifest.merges || []).map((x) => x.sha);
  try {
    appendTrainLine(ctx, {
      id: trainId,
      runner: reviewer.runner ?? 'unwired-reviewer',
      provider: reviewer.provider ?? 'unwired-provider',
      tier: reviewer.tier ?? 'unwired-tier',
      mm, gateSeconds, outcome: 'failed',
      train: {
        id: trainId, merges, gate_seconds: gateSeconds, evictions,
        pre_existing_hold: false, findings_not_in_any_record: 0, review_rounds: reviewRounds,
      },
      note: `rejected: ${reason}`,
    });
  } catch (e) {
    return { ok: false, rejected: true, evictions, reason: `whole-train rejection: ${reason} (AND the rejection line could not be appended: ${e.message ?? String(e)}); un-reverted merges wait on train, nothing publishes` };
  }
  const cm = commitAllowListed(repo, `train ${trainId}: rejection`);
  if (!cm.ok) {
    return { ok: false, rejected: true, evictions, reason: `whole-train rejection: ${reason} (AND the rejection line stands uncommitted: ${cm.reason}); un-reverted merges wait on train, nothing publishes` };
  }
  return { ok: false, rejected: true, evictions, reason: `whole-train rejection: ${reason}; un-reverted merges wait on train, nothing publishes` };
}

/**
 * Evict the clearing removal: committed `revert -m 1` (row 35's eviction
 * rule — the single revert owner; there is no second one), marked
 * `evicted-at-train` on the ledger shape AND the manifest (rewritten and
 * recommitted here, mid-train). The ledger entry rides the train's line,
 * which is written later; the manifest mark lands now, in its own commit,
 * so a post-mortem never finds a revert without its mark.
 */
function evictMerge({ repo, trainId, manifest, clearer, failingGate }) {
  const short = String(clearer.sha).slice(0, 8);
  const rv = revertMerge(repo, clearer.sha);
  if (!rv.ok) {
    gitTry(repo, ['revert', '--quit']);
    return { ok: false, reason: `eviction revert of ${short} failed (${rv.reason}) — no removal stands` };
  }
  const eviction = {
    merge: clearer.sha,
    reason: `evicted-at-train: removing ${short} cleared ${failingGate}`,
    wrongly: null,
  };
  manifest.evictions = [...(manifest.evictions || []), eviction];
  const w = writeManifest(repo, manifest);
  if (!w.ok) {
    return { ok: false, reason: `evicted ${short} by revert but the manifest rewrite failed (${w.reason}) — the revert stands, recorded nowhere but history` };
  }
  const add = gitTry(repo, ['add', '--', MANIFEST_PATH]);
  if (!add.ok) {
    return { ok: false, reason: `evicted ${short} but the eviction commit could not be staged (${String(add.stderr ?? add.stdout ?? '').trim() || 'git add failed'}) — the revert stands` };
  }
  const cm = gitTry(repo, ['commit', '--no-verify', '-m', `train ${trainId}: evict ${short} (cleared ${failingGate})`]);
  if (!cm.ok) {
    return { ok: false, reason: `evicted ${short} but the eviction commit failed (${String(cm.stderr ?? cm.stdout ?? '').trim() || 'git commit failed'}) — the revert stands, the mark uncommitted` };
  }
  return { ok: true, eviction };
}

/**
 * The replay audit, mechanism half (row 40, Q-S10): a replay train from
 * `main` carrying ONLY the evicted merge — a DETACHED worktree at the
 * current `main` tip with the evicted merge's job tip (`<merge>^2`, the
 * branch as merged, even if the branch ref is gone) merged into it —
 * running ONLY the gate the eviction was made on. Returns `{ok:true,
 * wrongly}` (`wrongly: true` = the replay passes = the eviction was made
 * wrongly) or `{ok:false, reason}` when no verdict exists (conflict,
 * throw, environmental gate): an unaudited eviction keeps `wrongly:
 * null`, never a guess.
 *
 * "Nothing merges to `main`" holds structurally, not by assertion: the
 * replay never checks a branch out (detached worktree — git physically
 * cannot move a branch from it), the worktree is removed before this
 * returns, and no replay ref is ever created. The `main` tip is read
 * before and after as the tripwire that it stayed put.
 */
export function replayEviction(ctx, { repo, trainId, eviction, gate, mainRef = 'main', gates }) {
  const fn = gateRunner(gates);
  const short = String(eviction.merge).slice(0, 8);
  const baseR = gitTry(repo, ['rev-parse', mainRef]);
  const base = baseR.ok ? String(baseR.stdout ?? '').trim() : null;
  if (!base) {
    return { ok: false, reason: `replay of ${short} impossible: cannot resolve ${mainRef}` };
  }
  const jtR = gitTry(repo, ['rev-parse', `${eviction.merge}^2`]);
  const jobTip = jtR.ok ? String(jtR.stdout ?? '').trim() : null;
  if (!jobTip) {
    return { ok: false, reason: `replay of ${short} impossible: cannot resolve the evicted merge's job tip` };
  }
  let dir = null;
  try {
    dir = mkdtempSync(join(tmpdir(), 'atai-train-replay-'));
  } catch (e) {
    return { ok: false, reason: `replay of ${short} impossible: scratch unavailable (${e.message ?? String(e)}) — no verdict` };
  }
  try {
    addWorktree(repo, dir, base, { detach: true });
  } catch (e) {
    dropWorktree(repo, dir, ctx);
    return { ok: false, reason: `replay of ${short} impossible: worktree at ${mainRef} failed (${e.message ?? String(e)}) — no verdict` };
  }
  const mg = gitTry(dir, ['merge', '--no-ff', '--no-verify', '-m', `replay ${trainId}: ${short} alone on ${mainRef}`, jobTip]);
  if (!mg.ok) {
    dropWorktree(repo, dir, ctx);
    return { ok: false, reason: `replay of ${short} could not merge onto ${mainRef} (${String(mg.stderr ?? mg.stdout ?? '').trim() || 'merge failed'}) — no verdict` };
  }
  let g = null;
  try {
    g = fn(ctx, dir, { scripts: [gate] });
  } catch (e) {
    dropWorktree(repo, dir, ctx);
    return { ok: false, reason: `replay gate threw (${e.message ?? String(e)}) — no verdict` };
  }
  dropWorktree(repo, dir, ctx);
  const mainNow = gitTry(repo, ['rev-parse', mainRef]);
  if (!mainNow.ok || String(mainNow.stdout ?? '').trim() !== base) {
    return { ok: false, reason: `replay of ${short} ran but ${mainRef} moved under it — no verdict trusts a moved base` };
  }
  if (!g || !g.ok) {
    if (!g || gatesHitEnvironmentalFailure(g)) {
      return { ok: false, reason: `replay gate could not run on ${short} alone — no verdict` };
    }
    const tail = g && g.output ? String(g.output).split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') : 'no gate result';
    return { ok: true, wrongly: false, detail: tail };
  }
  return { ok: true, wrongly: true };
}

/**
 * The replay audit, record half (row 40 with the OQ1 disposition): the
 * ledger is append-only, so the verdict CANNOT be written onto the
 * originating train's line as the row's letter says. It is recorded as a
 * NEW task-36-shaped line for the replay — carrying the originating train
 * id (`train.replay_of`), the merge, and `wrongly` — and the manifest's
 * eviction entry is updated by the replay's OWN rewrite+recommit (the
 * verdict exists only after the train completes, so the in-train rewrite
 * cannot cover it). The replay line carries outcome `done`: the audit ran
 * to a verdict; the FINDING rides `wrongly`, and the frozen outcome
 * vocabulary gains nothing. Nothing merges to `main` from a replay train
 * (see `replayEviction`); the bead reopen stays deferred (task 38).
 */
export function recordReplayVerdict(ctx, { repo, trainId, manifest, eviction, gate, wrongly, gateSeconds = {}, reviewer = {} }) {
  const short = String(eviction.merge).slice(0, 8);
  const entry = (manifest.evictions || []).find((e) => e.merge === eviction.merge);
  if (entry) entry.wrongly = wrongly;
  const w = writeManifest(repo, manifest);
  if (!w.ok) {
    return { ok: false, reason: `replay verdict (${wrongly}) computed but the manifest rewrite failed (${w.reason})` };
  }
  const replayId = `${trainId}-replay-${short}`;
  appendTrainLine(ctx, {
    id: replayId,
    runner: reviewer.runner ?? 'unwired-reviewer',
    provider: reviewer.provider ?? 'unwired-provider',
    tier: reviewer.tier ?? 'unwired-tier',
    mm: 0, gateSeconds, outcome: 'done',
    train: {
      id: replayId, replay_of: trainId, merges: [eviction.merge], gate_seconds: gateSeconds,
      evictions: [{ merge: eviction.merge, reason: eviction.reason, wrongly }],
      pre_existing_hold: false, findings_not_in_any_record: 0, review_rounds: 0,
    },
    note: wrongly
      ? `replay: ${short} alone passes ${gate} — the eviction was made wrongly`
      : `replay: ${short} alone still fails ${gate} — the eviction stands`,
  });
  const add = gitTry(repo, ['add', '--', MANIFEST_PATH, 'data/ledger.jsonl']);
  if (!add.ok) {
    return { ok: false, reason: `replay verdict staged nowhere (${String(add.stderr ?? add.stdout ?? '').trim() || 'git add failed'})` };
  }
  const cm = gitTry(repo, ['commit', '--no-verify', '-m', `train ${trainId}: replay verdict (${short} wrongly=${wrongly})`]);
  if (!cm.ok) {
    return { ok: false, reason: `replay verdict commit failed (${String(cm.stderr ?? cm.stdout ?? '').trim() || 'git commit failed'})` };
  }
  return { ok: true, replayId, wrongly };
}

/** Run the replay audit for every eviction standing when a train finishes. */
function auditEvictions(ctx, { repo, trainId, manifest, evictions, gate, gates, reviewer = {} }) {
  const out = [];
  for (const eviction of evictions) {
    const rp = replayEviction(ctx, { repo, trainId, eviction, gate, gates });
    if (!rp.ok) {
      out.push({ merge: eviction.merge, wrongly: null, recorded: false, note: rp.reason });
      continue;
    }
    let rec = null;
    try {
      rec = recordReplayVerdict(ctx, { repo, trainId, manifest, eviction, gate, wrongly: rp.wrongly, reviewer });
    } catch (e) {
      out.push({ merge: eviction.merge, wrongly: rp.wrongly, recorded: false, note: `replay verdict append threw (${e.message ?? String(e)})` });
      continue;
    }
    out.push(rec.ok
      ? { merge: eviction.merge, wrongly: rp.wrongly, recorded: true, replayId: rec.replayId }
      : { merge: eviction.merge, wrongly: rp.wrongly, recorded: false, note: rec.reason });
  }
  return out;
}

/**
 * The red path (row 38): classification re-run on the pre-train commit
 * FIRST — nothing is reverted before the verdict — then the hold or the
 * leave-one-out search. Plugs into the unchanged run.mjs call path
 * through `{ok:false}` shapes it already logs (`train failed: ...`,
 * merges wait): `held: 'pre-existing'` or `rejected: true` only add
 * detail. No publish push on any arm; no `bd` on any arm.
 */
async function runRedPath(ctx, {
  repo, trainId, manifest, gates, review = unreviewedTrain, now = Date.now,
  gateResult, gateSeconds = {}, redDetail = 'no gate result',
}) {
  const fn = gateRunner(gates);
  // 1. Classification FIRST. An unavailable verdict fails closed with
  // merges waiting — it never holds and never reverts on a guess.
  const cls = classifyRedTrain(ctx, { repo, manifest, gates: fn });
  if (!cls.ok) {
    return { ok: false, reason: `train gates red: ${redDetail} (classification unavailable: ${cls.reason}; merges wait on train, nothing publishes)` };
  }
  if (cls.verdict === 'pre-existing') {
    return holdPreExistingTrain(ctx, { repo, trainId, manifest, now, gateSeconds, detail: cls.detail });
  }
  // 2. The train did it. Date floor, then the failing gate, then the
  // search — in that order, each a precondition of the next.
  const day = checkBegunDate(manifest, now);
  if (!day.ok) {
    return rejectTrain(ctx, { repo, trainId, manifest, gateSeconds, evictions: [], reason: day.reason });
  }
  const failingGate = failingGateOf(gateResult);
  if (!failingGate) {
    return rejectTrain(ctx, { repo, trainId, manifest, gateSeconds, evictions: [], reason: 'the full-gate result names no failing script, so the failing-gate-only search cannot run' });
  }
  const search = leaveOneOutSearch(ctx, { repo, manifest, gates: fn, failingGate, now });
  if (!search.ok) {
    return rejectTrain(ctx, { repo, trainId, manifest, gateSeconds, evictions: [], reason: search.reason });
  }
  if (!search.clearer) {
    const untried = (search.untried || []).length
      ? ` (${search.untried.length} removal(s) could not be trialled cleanly: ${search.untried.map((u) => String(u.sha).slice(0, 8)).join(', ')})`
      : '';
    return rejectTrain(ctx, { repo, trainId, manifest, gateSeconds, evictions: [], reason: `no single removal clears ${failingGate}${untried}` });
  }
  // 3. Evict the clearer, then the FULL TRAIN_GATES set AND the review —
  // a subset of a reviewed diff is neither reviewed nor gated.
  const ev = evictMerge({ repo, trainId, manifest, clearer: search.clearer, failingGate });
  if (!ev.ok) {
    return rejectTrain(ctx, { repo, trainId, manifest, gateSeconds, evictions: [], reason: ev.reason });
  }
  const evictions = [ev.eviction];
  let full = null;
  try {
    const t0 = now();
    full = fn(ctx, repo, { scripts: [...TRAIN_GATES] });
    gateSeconds = { ...gateSeconds, after_eviction: Math.round(((now() - t0) / 1000) * 100) / 100 };
  } catch (e) {
    const rej = rejectTrain(ctx, { repo, trainId, manifest, gateSeconds, evictions, reason: `post-eviction full gates threw (${e.message ?? String(e)})` });
    rej.replay = auditEvictions(ctx, { repo, trainId, manifest, evictions, gate: failingGate, gates: fn });
    return rej;
  }
  if (!full || !full.ok) {
    const tail = full && full.output ? String(full.output).split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') : 'no gate result';
    const rej = rejectTrain(ctx, { repo, trainId, manifest, gateSeconds, evictions, reason: `post-eviction full gates red: ${tail}` });
    rej.replay = auditEvictions(ctx, { repo, trainId, manifest, evictions, gate: failingGate, gates: fn });
    return rej;
  }
  // 4. The evicted train re-enters the shared finish: re-review, line,
  // records, re-gate. A non-approval or a later red here is still red
  // after eviction → whole-train rejection with the eviction standing,
  // recorded, and audited.
  const done = await finishTrainRun(ctx, {
    repo, trainId, manifest, gates: fn, review, now, gateSeconds, evictions, reviewRounds: 1,
  });
  if (!done.ok) {
    const rej = rejectTrain(ctx, {
      repo, trainId, manifest, gateSeconds, evictions,
      reason: `still red after evicting ${String(search.clearer.sha).slice(0, 8)}: ${done.reason}`,
      reviewer: done.reviewer ?? {},
    });
    rej.replay = auditEvictions(ctx, { repo, trainId, manifest, evictions, gate: failingGate, gates: fn, reviewer: done.reviewer ?? {} });
    return rej;
  }
  // 5. Verified with an eviction: the automatic solo replay audit runs
  // before this returns — after this train finishes, before any next
  // train is assembled.
  const replay = auditEvictions(ctx, { repo, trainId, manifest, evictions, gate: failingGate, gates: fn, reviewer: done.reviewer ?? {} });
  return { ...done, evicted: evictions.map((e) => e.merge), replay };
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
    const redDetail = g && g.output ? String(g.output).split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') : 'no gate result';
    if (!g || gatesHitEnvironmentalFailure(g)) {
      return { ok: false, reason: `train gates red: ${redDetail} (gates could not run — classification deferred; merges wait on train, nothing publishes)` };
    }
    // Stage-1 U3 (task 38): a red train is classified before anything is
    // reverted — the pre-train commit is gated first, then the hold or the
    // leave-one-out search (runRedPath). run.mjs already handles
    // `{ok:false}` (logs it, merges wait); held/rejected only add detail.
    return runRedPath(ctx, {
      repo, trainId, manifest, gates: fn, review, now, gateResult: g, gateSeconds, redDetail,
    });
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
  // 4-7. Shared finish: review → the train's own line → the
  // path-restricted records commit → the post-records re-gate → the
  // declared SHA. The red path re-enters the same tail after eviction.
  return finishTrainRun(ctx, { repo, trainId, manifest, gates: fn, review, now, gateSeconds });
}

/**
 * Assemble a train from pending merges: measure, cut the fitting prefix,
 * write + commit the manifest FIRST. Returns `{ok:true, manifest}` or
 * `{ok:false, reason}`. An unparseable merge message fails the assembly —
 * gating unknown content is the safe direction. The manifest freezes the
 * assembly baseline (tip + counted paths over mainTip...tip) that the
 * post-rederive assert re-checks.
 */
export function assembleTrain(repo, { trainId, bounds, mainRef = 'main', now = Date.now }) {
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
    // Stage-1 U3 (task 38): the local date the train began under — the
    // date floor the red-path search refuses to cross. Read from the
    // machine clock as its own command (`now` seam, default wall clock).
    begunDate: localDate(new Date(now())),
    baselinePaths: countedPaths(String(baseNames.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean)),
    merges: admitted.map((x) => ({ sha: x.sha, jobId: x.jobId, subjects: x.subjects })),
    // The manifest's eviction section (row-36-declared, filled by U3):
    // empty on the happy path, one entry per eviction thereafter.
    evictions: [],
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
