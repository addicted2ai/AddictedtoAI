/**
 * build-lock.mjs — one build at a time, per shared build surface.
 *
 * THE FAILURE THIS EXISTS FOR, written down so a future agent does not chase a
 * phantom (beads addictedtoai-6s7). Two concurrent builds fail like this:
 *
 *     ✓ Generating static pages (493/493)
 *     Error: ENOENT: no such file or directory, open '.next/server/pages-manifest.json'
 *
 * Note where it lands: AFTER every page generated successfully. It reads as a
 * real defect in the content or the export and it is neither — it is one build
 * deleting and rewriting a directory another build is reading. Re-running alone
 * passes, which makes it look intermittent and unrelated to what changed.
 *
 * It was observed during task 6.6, with `npm run build` and
 * `scripts/verify-launch.mjs` (which runs its own build unless given
 * `--no-build`) overlapping. The loop can reach the same state a second way: its
 * gates build inside a job worktree while the maintainer, or a second agent,
 * builds at the repository root.
 *
 * WHAT THE SHARED SURFACE ACTUALLY IS, measured rather than assumed. Two builds
 * in the same directory share `.next/` and `out/`, and that is the observed
 * failure: the loop's job worktrees each have their own `.next/`, so the two
 * processes that collided during task 6.6 were both at the repository root.
 *
 * The suspicion recorded in beads addictedtoai-6s7 was that the junctioned
 * `node_modules` — the loop links a job worktree's to the repository's rather
 * than installing a second copy (loop/lib/gates.mjs) — was a second shared
 * surface, via `node_modules/.cache`. It was checked: a full `npm run build`
 * of this repository was run and every entry under `node_modules` to a depth
 * of four was compared against the build's start time. Exactly one file was
 * touched, and it was this lock. There is no `node_modules/.cache` here at all.
 * So the suspicion is NOT confirmed for this toolchain, and it is recorded that
 * way.
 *
 * The lock is nonetheless keyed on the REAL path of `node_modules` rather than
 * on the build directory, and the choice is deliberate given that measurement.
 * Keying there is a superset of what is needed: two builds in one directory
 * necessarily resolve to the same lock, which is the case that actually fails,
 * and a worktree resolves to the repository's lock as well, which costs a wait
 * of about twenty seconds and covers the surface the measurement could not rule
 * out — a deeper write, a different Next version, a tool that does use
 * `.cache`. A tree with its own installed `node_modules` shares nothing and
 * gets its own lock. The cost of the wider key is a wait; the cost of a
 * narrower one would be a wrong answer.
 *
 * HOW THE LOCK IS HELD, given that it cannot be released. `npm run build` is
 * `node scripts/prebuild.mjs && next build`: the process that takes the lock
 * exits before the build it is protecting even starts. So the holder recorded is
 * not this process but its PARENT — the shell npm spawned to run the whole
 * script — which lives exactly as long as the build does. Ownership is then
 * decided by liveness rather than by a release call that nothing could make:
 * a lock whose holder pid is gone is reclaimed immediately, and one older than
 * `staleMs` is reclaimed regardless. A crashed build therefore never wedges the
 * next one, and there is no cleanup step to forget.
 *
 * The residual risk is pid reuse inside the staleness window, which would make
 * a finished build's lock look live. The cost of that is a wait, not a wrong
 * answer, and the wait ends at `waitMs`.
 */

import {
  existsSync,
  mkdirSync,
  openSync,
  writeSync,
  closeSync,
  linkSync,
  unlinkSync,
  readFileSync,
  rmSync,
  realpathSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { hostname } from 'node:os';

export const LOCK_FILENAME = '.atai-build.lock';

/** Default: wait up to 10 minutes for another build, then fail rather than race. */
export const DEFAULT_WAIT_MS = 10 * 60 * 1000;
/** Default: a lock older than this is reclaimed whatever its pid says. */
export const DEFAULT_STALE_MS = 60 * 60 * 1000;

/**
 * The lock file for the build surface `dir` shares.
 *
 * `realpathSync` is what makes a junctioned worktree resolve to the repository's
 * own `node_modules` — the resolution IS the shared-surface claim, so it is done
 * by the filesystem rather than asserted.
 */
export function buildLockPath(dir) {
  const modules = join(dir, 'node_modules');
  let base = dir;
  if (existsSync(modules)) {
    try {
      base = realpathSync(modules);
    } catch {
      base = modules;
    }
  }
  return join(base, LOCK_FILENAME);
}

/**
 * Was this lock written by a different machine?
 *
 * If so its pid means nothing here, and `isAlive` is worse than useless: it
 * answers about a LOCAL process that happens to share the number. This is not
 * hypothetical. On 2026-08-29 every Vercel deployment began failing because the
 * lock lives under `node_modules`, Vercel caches and restores `node_modules`
 * between deployments, and the restored lock named `pid 97` on a previous build
 * machine. On Linux pid 97 is a low, almost certainly live system process — so
 * the inherited lock looked held, the build waited the full 600s, and the deploy
 * failed. It had been failing on every push, silently, for hours.
 *
 * A foreign host is therefore treated as unverifiable, and unverifiable is
 * reclaimable. That is safe in the direction that matters: two builds racing on
 * ONE machine is the failure this module exists to prevent, and a lock from
 * another machine cannot be one of those two. The residual risk is a genuinely
 * shared network filesystem, where this would let two builds in — which is not
 * this repository's arrangement, and would be a wait rather than a wrong answer
 * to re-tighten if it ever became one.
 */
export function isForeignHost(holder) {
  const recorded = holder?.host;
  if (typeof recorded !== 'string' || recorded === '') return false;
  return recorded !== hostname();
}

/** Does this pid exist? EPERM means it exists and is not ours, which is alive. */
export function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err?.code === 'EPERM';
  }
}

export function readLock(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** A synchronous sleep, because the callers of this are synchronous. */
function sleepSync(ms) {
  if (ms <= 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function describe(holder) {
  if (!holder) return 'an unreadable lock file';
  const age = Number.isFinite(Date.parse(holder.started))
    ? `${((Date.now() - Date.parse(holder.started)) / 1000).toFixed(0)}s ago`
    : 'at an unknown time';
  return `pid ${holder.pid} (${holder.label ?? 'a build'} on ${holder.host ?? 'this machine'}, started ${age})`;
}

/**
 * Take the build lock, waiting for whoever holds it.
 *
 * @param {object} o
 * @param {string} o.dir          the tree about to be built
 * @param {number} [o.holderPid]  the pid that will live for the whole build
 * @param {string} [o.label]
 * @param {number} [o.waitMs]     0 means "do not wait", fail on contention
 * @param {number} [o.staleMs]
 * @param {number} [o.pollMs]
 * @param {(s: string) => void} [o.log]
 * @returns {{path: string, holderPid: number, waitedMs: number, reclaimed: boolean}}
 * @throws if the lock is still held when `waitMs` elapses
 */
/**
 * Create the lock file with its contents already in it, or fail because it
 * exists.
 *
 * The obvious `openSync(path, 'wx')` then `writeSync` leaves a window in which
 * the file exists and is empty, and a competitor that reads it in that window
 * sees an unreadable lock and reclaims it — which is two builds inside the lock
 * at once, i.e. the bug this module exists to prevent, reintroduced by the
 * module itself. The first version here had exactly that, and the concurrency
 * test caught it. So the content is written to a private file first and `link`
 * publishes it under the lock name in one atomic step that fails on EEXIST.
 *
 * `link` is not available on every filesystem; where it is not, the write is
 * ordered content-first anyway (open, write, close, then rename would clobber,
 * so the fallback keeps `wx` and pairs it with the unreadable grace period in
 * the caller).
 */
function createLockFile(path, body) {
  const staging = `${path}.${process.pid}.${Math.random().toString(36).slice(2, 8)}`;
  try {
    const fd = openSync(staging, 'wx');
    writeSync(fd, body);
    closeSync(fd);
  } catch {
    // Cannot stage; fall back to the plain exclusive create.
    const fd = openSync(path, 'wx');
    writeSync(fd, body);
    closeSync(fd);
    return;
  }
  try {
    linkSync(staging, path);
  } catch (err) {
    if (err?.code === 'EEXIST') throw err;
    // No hard links here. Fall back, and let the grace period cover the window.
    const fd = openSync(path, 'wx');
    writeSync(fd, body);
    closeSync(fd);
  } finally {
    try {
      unlinkSync(staging);
    } catch {
      /* nothing to clean up */
    }
  }
}

export function acquireBuildLock({
  dir,
  holderPid = process.pid,
  label = 'build',
  waitMs = DEFAULT_WAIT_MS,
  staleMs = DEFAULT_STALE_MS,
  pollMs = 500,
  unreadableGraceMs = 5000,
  log = () => {},
} = {}) {
  const path = buildLockPath(dir);
  mkdirSync(dirname(path), { recursive: true });
  const started = Date.now();
  let announced = false;
  let reclaimed = false;
  let unreadableSince = null;

  for (;;) {
    try {
      createLockFile(
        path,
        JSON.stringify({
          pid: holderPid,
          writer: process.pid,
          label,
          host: hostname(),
          dir,
          started: new Date().toISOString(),
        }) + '\n',
      );
      return { path, holderPid, waitedMs: Date.now() - started, reclaimed };
    } catch (err) {
      if (err?.code !== 'EEXIST') throw err;
    }

    const holder = readLock(path);
    // An unreadable lock is most likely one being written this instant, not an
    // abandoned one. It only becomes reclaimable after a grace period no writer
    // could plausibly need.
    if (!holder) {
      unreadableSince ??= Date.now();
    } else {
      unreadableSince = null;
    }
    const unreadableTooLong = unreadableSince !== null && Date.now() - unreadableSince > unreadableGraceMs;
    const age = holder && Number.isFinite(Date.parse(holder.started))
      ? Date.now() - Date.parse(holder.started)
      : 0;
    const foreign = holder ? isForeignHost(holder) : false;
    if (unreadableTooLong || (holder && (foreign || !isAlive(holder.pid) || age > staleMs))) {
      log(
        `build-lock: reclaiming ${path} from ${describe(holder)} — ` +
          (!holder
            ? 'the lock file has been unreadable too long'
            : foreign
              ? `it was written by ${holder.host}, not this machine (${hostname()}), so its pid cannot be checked here`
              : !isAlive(holder.pid)
                ? 'that process is gone'
                : `it is older than ${(staleMs / 60000).toFixed(0)} minutes`),
      );
      rmSync(path, { force: true });
      reclaimed = true;
      unreadableSince = null;
      continue;
    }

    const waited = Date.now() - started;
    if (waited >= waitMs) {
      throw new Error(
        `another build holds ${path}: ${describe(holder)}. Waited ${(waited / 1000).toFixed(0)}s.\n` +
          `Two builds sharing one output directory fail with ENOENT on .next/server/pages-manifest.json ` +
          `AFTER the pages generate, which looks like a content defect and is not — so this refuses ` +
          `rather than racing. Wait for the other build, or delete the lock file if you know its ` +
          `process is gone.`,
      );
    }
    if (!announced) {
      announced = true;
      log(
        `build-lock: waiting for ${describe(holder)} to finish its build. ` +
          `Two builds sharing one output directory fail spuriously; this waits instead.`,
      );
    }
    sleepSync(Math.min(pollMs, Math.max(0, waitMs - waited)));
  }
}

/** Release a lock this process holds. Ownership is checked, never assumed. */
export function releaseBuildLock(path, holderPid = process.pid) {
  const holder = readLock(path);
  if (holder && holder.pid !== holderPid && holder.writer !== holderPid) return false;
  rmSync(path, { force: true });
  return true;
}

/** Acquire, run, release — for a caller that lives for the whole build. */
export function withBuildLock(opts, fn) {
  const lock = acquireBuildLock(opts);
  try {
    return fn(lock);
  } finally {
    releaseBuildLock(lock.path, lock.holderPid);
  }
}
