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
 * The lock is nonetheless KEYED on the real path of `node_modules` rather than
 * on the build directory, and the choice is deliberate given that measurement.
 * Keying there is a superset of what is needed: two builds in one directory
 * necessarily resolve to the same key, which is the case that actually fails,
 * and a worktree resolves to the repository's key as well, which costs a wait
 * of about twenty seconds and covers the surface the measurement could not rule
 * out — a deeper write, a different Next version, a tool that does use
 * `.cache`. A tree with its own installed `node_modules` shares nothing and
 * gets its own lock. The cost of the wider key is a wait; the cost of a
 * narrower one would be a wrong answer.
 *
 * ---------------------------------------------------------------------------
 * WHERE THE LOCK FILE LIVES, AND WHY IT MOVED (beads addictedtoai-0ll).
 *
 * It used to live AT that key: `<realpath(node_modules)>/.atai-build.lock`. The
 * key was right and the location was wrong, because `node_modules` is exactly
 * the directory a CI provider caches. Vercel caches and restores `node_modules`
 * between deployments, so on 2026-08-29 a lock written on one build machine came
 * back from the cache on the next one, naming `pid 97` — a low, certainly-live
 * pid on a fresh Linux builder. Every deployment then waited the full 600s and
 * failed, silently, for hours (addictedtoai-272). Build state had crossed a
 * machine boundary and a deployment boundary, which it was never meant to do.
 *
 * So the key and the location are now separate things. The key is still the
 * real path of the shared `node_modules`; the FILE is
 * `<os.tmpdir()>/atai-build-locks[-u<uid>]/<sha256(key)>.atai-build.lock`.
 * A build cache cannot carry it because it is not in the tree being cached —
 * the lock is uncacheable BY CONSTRUCTION rather than by a check that has to
 * remember to fire. The foreign-host reclaim below is kept anyway, belt and
 * braces, because it is the thing that would catch the NEXT unexpected way a
 * lock crosses a boundary.
 *
 * HASHING REMOVES THE FILESYSTEM FROM THE COMPARISON, so the canonicalisation
 * the filesystem used to do for free has to be done explicitly here. Measured
 * on 2026-08-29, Windows, Node 20: `fs.realpathSync('d:/addictedtoai/NODE_MODULES')`
 * returns `d:\addictedtoai\NODE_MODULES` — it resolves links but does NOT fix
 * case — while `fs.realpathSync.native` returns `D:\AddictedtoAI\node_modules`.
 * Two spellings of one directory used to produce one lock file because NTFS
 * said so; hashed, they would have produced two, and two locks on one build
 * surface is the bug this module exists to prevent. `surfaceKey` therefore
 * prefers `realpathSync.native`, falls back to `realpathSync`, resolves the
 * result (normalising separators and trailing slashes), and lower-cases it on
 * win32 only — matching the case-insensitivity of the filesystem it is standing
 * in for, and never on POSIX, where two spellings really are two directories.
 *
 * THE uid IN THE DIRECTORY NAME IS A DELIBERATE NARROWING, and this is the one
 * property the move gives up. `os.tmpdir()` is per-user on Windows
 * (`AppData\Local\Temp`) and shared on POSIX (`/tmp`). Including the uid on
 * POSIX means two users on one machine that genuinely share one `node_modules`
 * get two locks and can race — where the old in-tree lock would have serialised
 * them. It is included anyway, for three reasons:
 *
 *   1. Windows cannot share the lock between users whatever this file does, so
 *      omitting the uid would make POSIX and Windows behave differently and
 *      leave one behaviour untested on the machine this repository is authored
 *      on. One behaviour to reason about beats two.
 *   2. `/tmp` carries the sticky bit on every real system, so a lock file
 *      created by user A cannot be unlinked by user B. Sharing the path
 *      WITHOUT sharing the ability to reclaim turns a stale lock into a
 *      permanent EPERM that no build can clear — every build failing, forever,
 *      until a human deletes a file with an opaque name. That is a worse
 *      failure than the race it would be preventing.
 *   3. The arrangement it protects does not exist here: this repository is
 *      built by one user on one Windows machine, and on Linux by CI containers
 *      that have exactly one user and one checkout each.
 *
 * If a genuinely multi-user shared checkout ever appears, this is the paragraph
 * to revisit — drop the uid segment and handle EPERM on reclaim as "held".
 * ---------------------------------------------------------------------------
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
  realpathSync,
  rmSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { hostname, tmpdir } from 'node:os';

/**
 * The tail of every lock file name. The head is a hash, so this is what makes a
 * stray file in the temp directory identifiable as ours — by eye and by glob.
 */
export const LOCK_SUFFIX = '.atai-build.lock';

/**
 * The suffix for the TEST-SUITE lock (beads addictedtoai-ngz), kept as its own
 * file rather than sharing `LOCK_SUFFIX`.
 *
 * THE DEFECT THIS EXISTS FOR: a Desk gate's `npm test` was failed by
 * `pulse/tests/publish-verify.test.mjs` — a real assertion, tripped by a fake
 * cause. Three unrelated `npm test` callers (subagents) were running
 * concurrently with the gate; several `pulse` tests stand up HTTP fixtures on
 * loopback, and on this machine `fetch failed` from undici on 127.0.0.1 is
 * usually `EADDRINUSE` from machine-wide ephemeral-port exhaustion (range
 * 1025-14999, `TIME_WAIT` holds for minutes) — not a dead server. Re-run alone
 * minutes later, the same file passed 8/8. The ledger recorded `outcome:
 * failed, note: "gates failed"` — indistinguishable from a real content
 * defect, and a third of the way to Breaker 1 disabling that job type.
 *
 * `npm test` runs `scripts/run-tests.mjs`, so THAT is where the lock has to be
 * taken — not in `loop/lib/gates.mjs`, which only the Desk's own gate runs
 * through. The three colliding subagents in the incident above called
 * `npm test` directly and never touched `gates.mjs`; a lock placed there would
 * have been invisible to exactly the processes that caused the collision. A
 * lock only serialises the parties that take it, so it has to sit where every
 * caller — the Desk's gate, a subagent, the maintainer typing `npm test` —
 * converges, whatever invoked them. `run-tests.mjs` is that point.
 *
 * SHARING `LOCK_SUFFIX` WAS CONSIDERED AND REJECTED. It is one line and needs
 * no change here at all — but the build and the test suite do not actually
 * contend for the same resource. `next build` fights over `.next/` and `out/`;
 * the suite fights over loopback ports. `buildSurfaceKey`'s header makes the
 * opposite case for the BUILD lock — that a wider key is worth a wait rather
 * than a wrong answer — but that argument is about a surface the measurement
 * there could not rule out. Here the two surfaces are known and distinct, so
 * widening buys nothing and only costs wall time: a root `npm run build` and a
 * Desk gate's `npm test` would serialise against each other for no reason,
 * every time the two happen to overlap. A separate suffix costs one small
 * generalisation (`buildLockPath` and `acquireBuildLock` both take the suffix
 * as a parameter now, defaulting to `LOCK_SUFFIX` so every existing caller is
 * unaffected) and buys locks that only ever contend with their own kind.
 *
 * NOT REENTRANT, same as the build lock, and this is where it would bite if
 * ever ignored: `loop/lib/gates.mjs` runs `['test', 'build']` as two separate
 * `npm run` child processes, one after the other — `run-tests.mjs` acquires
 * this lock, runs the suite, and releases in a `finally` before the `build`
 * script's process even starts, so nothing here is ever held while the build
 * lock is requested, in either order, by one caller. That has to stay true.
 * The failure mode if it stops being true is not "slow" but "wedged": a future
 * change that nests a test run inside a build (or vice versa) inside one
 * process holding the other's lock would block for the full `waitMs` and then
 * fail a gate for a reason that has nothing to do with the code under test —
 * this exact issue, reintroduced by its own fix.
 */
export const TEST_LOCK_SUFFIX = '.atai-test.lock';

/** The temp-directory subdirectory holding every lock for this user. */
export const LOCK_DIR_PREFIX = 'atai-build-locks';

/** Default: wait up to 10 minutes for another build, then fail rather than race. */
export const DEFAULT_WAIT_MS = 10 * 60 * 1000;
/** Default: a lock older than this is reclaimed whatever its pid says. */
export const DEFAULT_STALE_MS = 60 * 60 * 1000;

/**
 * `-u<uid>` on POSIX, empty on Windows. See the header: `/tmp` is shared and
 * `AppData\Local\Temp` is not, so the uid is only load-bearing on POSIX, and
 * Windows has no uid to put there in any case.
 */
function userSegment() {
  const uid = typeof process.getuid === 'function' ? process.getuid() : null;
  return typeof uid === 'number' ? `-u${uid}` : '';
}

/** Where every lock file for this user lives. Not inside any repository. */
export function buildLockDir() {
  return join(tmpdir(), `${LOCK_DIR_PREFIX}${userSegment()}`);
}

/** `realpathSync.native` where it works, plain `realpathSync` where it does not. */
function realpath(p) {
  try {
    return realpathSync.native(p);
  } catch {
    return realpathSync(p);
  }
}

/**
 * The identity of the build surface `dir` shares — the string that is hashed.
 *
 * Resolving `node_modules` is what makes a junctioned worktree land on the
 * repository's own surface: the resolution IS the shared-surface claim, made by
 * the filesystem rather than asserted. Exported so a test can assert that
 * claim directly, without having to invert a hash.
 */
export function buildSurfaceKey(dir) {
  const modules = join(dir, 'node_modules');
  let base = existsSync(modules) ? modules : dir;
  try {
    base = realpath(base);
  } catch {
    /* an unresolvable path is still a key; use it as given */
  }
  base = resolve(base);
  // NTFS is case-insensitive, so two spellings are one directory and must be
  // one lock. ext4 is not, so two spellings are two directories.
  return process.platform === 'win32' ? base.toLowerCase() : base;
}

/**
 * The lock file for the build surface `dir` shares.
 *
 * `suffix` picks which lock family the path belongs to — `LOCK_SUFFIX` (the
 * default, for `next build`) or `TEST_LOCK_SUFFIX` (for `npm test`, see its
 * doc comment above for why the two are separate files rather than one). Both
 * live in the same lock directory and hash the same `buildSurfaceKey`, so a
 * build and a test run over one surface get two independent files that never
 * contend with each other, only with their own kind.
 *
 * Pure: it creates nothing. `acquireBuildLock` makes the directory.
 */
export function buildLockPath(dir, suffix = LOCK_SUFFIX) {
  const digest = createHash('sha256').update(buildSurfaceKey(dir)).digest('hex').slice(0, 32);
  return join(buildLockDir(), `${digest}${suffix}`);
}

/**
 * Was this lock written by a different machine?
 *
 * If so its pid means nothing here, and `isAlive` is worse than useless: it
 * answers about a LOCAL process that happens to share the number. This is not
 * hypothetical. On 2026-08-29 every Vercel deployment began failing because the
 * lock lived under `node_modules`, Vercel caches and restores `node_modules`
 * between deployments, and the restored lock named `pid 97` on a previous build
 * machine. On Linux pid 97 is a low, almost certainly live system process — so
 * the inherited lock looked held, the build waited the full 600s, and the deploy
 * failed. It had been failing on every push, silently, for hours.
 *
 * Moving the file out of `node_modules` (addictedtoai-0ll) stops that
 * particular crossing at the source. This check is KEPT regardless, because it
 * is not about `node_modules`: it is about a lock whose pid cannot be verified
 * here, however it arrived. A foreign host is treated as unverifiable, and
 * unverifiable is reclaimable. That is safe in the direction that matters: two
 * builds racing on ONE machine is the failure this module exists to prevent,
 * and a lock from another machine cannot be one of those two. The residual risk
 * is a genuinely shared network filesystem, where this would let two builds in —
 * which is not this repository's arrangement, and would be a wait rather than a
 * wrong answer to re-tighten if it ever became one.
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
  const where = holder.dir ? ` for ${holder.dir}` : '';
  return `pid ${holder.pid} (${holder.label ?? 'a build'} on ${holder.host ?? 'this machine'}${where}, started ${age})`;
}

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

/**
 * Take the build lock, waiting for whoever holds it.
 *
 * @param {object} o
 * @param {string} o.dir          the tree about to be built
 * @param {number} [o.holderPid]  the pid that will live for the whole build
 * @param {string} [o.label]
 * @param {string} [o.suffix]     which lock family — `LOCK_SUFFIX` (default)
 *   or `TEST_LOCK_SUFFIX`. See `TEST_LOCK_SUFFIX`'s doc comment for why the
 *   build and the test suite get independent files rather than one lock.
 * @param {string} [o.activity]   the word used in "another ${activity} holds…"
 *   and "waiting for … to finish its ${activity}". Defaults to 'build'; a
 *   caller locking something other than a build (e.g. `run-tests.mjs` passes
 *   'test run') should override it so the message says what is actually
 *   contended.
 * @param {string} [o.contentionNote]  one sentence explaining what breaks
 *   when two of this activity overlap, folded into both the wait log and the
 *   refusal error. Defaults to the ENOENT/pages-manifest failure this module
 *   was built for; override it for a different lock family's own failure mode.
 * @param {number} [o.waitMs]     0 means "do not wait", fail on contention
 * @param {number} [o.staleMs]
 * @param {number} [o.pollMs]
 * @param {(s: string) => void} [o.log]
 * @returns {{path: string, holderPid: number, waitedMs: number, reclaimed: boolean}}
 * @throws if the lock is still held when `waitMs` elapses
 */
export function acquireBuildLock({
  dir,
  holderPid = process.pid,
  label = 'build',
  suffix = LOCK_SUFFIX,
  activity = 'build',
  contentionNote = 'Two builds sharing one output directory fail with ENOENT on ' +
    '.next/server/pages-manifest.json AFTER the pages generate, which looks like a content defect and is not',
  waitMs = DEFAULT_WAIT_MS,
  staleMs = DEFAULT_STALE_MS,
  pollMs = 500,
  unreadableGraceMs = 5000,
  log = () => {},
} = {}) {
  const path = buildLockPath(dir, suffix);
  const surface = buildSurfaceKey(dir);
  // 0o700 matters only on POSIX, where the parent (/tmp) is world-writable.
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const started = Date.now();
  let announced = false;
  let reclaimed = false;
  let unreadableSince = null;
  // The lock now lives in a directory the OS may reap. Recreating it is cheap
  // and bounded; looping on it forever would not be.
  let recreated = 0;

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
          // The file name is a hash, so the only way a human can tell what a
          // stray lock is for is to read it. Both halves are recorded: the tree
          // that asked, and the surface the key resolved to.
          surface,
          started: new Date().toISOString(),
        }) + '\n',
      );
      return { path, holderPid, waitedMs: Date.now() - started, reclaimed };
    } catch (err) {
      if (err?.code === 'ENOENT' && recreated < 3) {
        // The temp directory went away underneath us (a tmp reaper, a manual
        // clean). Rebuild it and try again rather than failing a build for it.
        recreated += 1;
        mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
        continue;
      }
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
        `another ${activity} holds ${path}: ${describe(holder)}. Waited ${(waited / 1000).toFixed(0)}s.\n` +
          `That file is the lock for the build surface ${surface}.\n` +
          `${contentionNote} — so this refuses rather than racing. Wait for the other ${activity}, ` +
          `or delete the lock file if you know its process is gone.`,
      );
    }
    if (!announced) {
      announced = true;
      log(
        `build-lock: waiting for ${describe(holder)} to finish its ${activity}. ` +
          `${contentionNote}; this waits instead.`,
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

/**
 * Acquire, run, release — for a caller that lives for the whole locked
 * activity (a build, or since addictedtoai-ngz, a test run — see `suffix` on
 * `acquireBuildLock`). Unlike `prebuild.mjs`, which exits before the build it
 * protects even starts and so must record its parent's pid as the holder,
 * this releases honestly in the `finally` because the caller is still here
 * when the work finishes.
 */
export function withBuildLock(opts, fn) {
  const lock = acquireBuildLock(opts);
  try {
    return fn(lock);
  } finally {
    releaseBuildLock(lock.path, lock.holderPid);
  }
}
