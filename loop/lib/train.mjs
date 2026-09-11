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
import { gitTry, mergeLocal } from './git.mjs';
import { gatesHitEnvironmentalFailure, runGates } from './gates.mjs';

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
 * an unverified merge must not land; the caller books `interrupted`.
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
    return { ok: false, baseTip: pm.baseTip, reason: `tripwire green but provisional cleanup failed: ${cleanup.reason}` };
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
export function mergeLockPath() {
  return join(buildLockDir(), 'merge.lock');
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
export async function acquireMergeLock({ waitMs, sleepMs = 1000, now = Date.now } = {}) {
  const dir = mergeLockPath();
  const limit = Number.isFinite(waitMs) ? waitMs : 0;
  const deadline = now() + limit;
  for (;;) {
    if (mkdirOk(dir)) {
      try {
        writeFileSync(join(dir, 'pid'), `${process.pid}\n${new Date().toISOString()}\n`, 'utf8');
      } catch {
        // The pid file is diagnostic; the directory IS the lock.
      }
      return { ok: true, dir };
    }
    const holder = readMergeHolder(dir);
    if (holder && !pidAlive(holder.pid)) {
      try {
        rmSync(dir, { recursive: true, force: true });
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
