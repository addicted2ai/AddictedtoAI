/**
 * gates.mjs — the mechanical checks a job's branch must pass before review.
 *
 * These are the cheap direct checks: they run the build and the tests and read
 * what actually happened, rather than reading the diff and forming an opinion
 * about whether it would work.
 *
 * A gate that cannot RUN is a gate failure, not a pass. Silently skipping an
 * unrunnable check is how a green tick comes to mean nothing.
 */

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  symlinkSync,
  unlinkSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { freemem } from 'node:os';
import { performance } from 'node:perf_hooks';
import { join, resolve } from 'node:path';

import { ROOT } from '../../lib/paths.mjs';

/*
 * These are recorded calibrations, not guessed timeouts. Each figure rests on
 * one serial run on this machine on the local date below, preserved in the
 * evidence basenames named by each declaration. The npm values use the
 * corrected cmd.exe /c run; the earlier null-status, 0.0s rows were not
 * legitimate invocations. verify-analytics excludes server startup because
 * its calibration already had the server running.
 *
 * The 25% floor is deliberately generous while every calibration has only one
 * observation. It is pending a distribution, not justified by a variance that
 * has not been measured. The floor is a tripwire for a successful no-op, not a
 * performance budget. The build currently has no recorded warm-cache run, so
 * its floor uses the cold calibration until one exists.
 */
const REPOSITORY_FLOOR_FRACTION = 0.25;
export const MIN_GATE_FLOOR_MS = 1;
const CALIBRATION_DATE = '2026-09-08';
const CALIBRATION_RUN_COUNT = 1;

function calibratedFloor(calibrationSeconds, source, note, calibratedOn = CALIBRATION_DATE) {
  return Object.freeze({
    calibrationSeconds,
    floorMs: Math.round(calibrationSeconds * 1000 * REPOSITORY_FLOOR_FRACTION),
    floorFraction: REPOSITORY_FLOOR_FRACTION,
    calibratedOn,
    calibrationRuns: CALIBRATION_RUN_COUNT,
    calibrationMethod: 'one serial wall-clock invocation of the gate',
    source,
    ...(note ? { note } : {}),
  });
}

export const GATE_FLOORS = Object.freeze({
  test: calibratedFloor(314.8, 'gate-timings-final.txt'),
  build: calibratedFloor(
    29.2,
    'gate-timings-npm.txt',
    'cold calibration; no warm-cache run was recorded',
  ),
  'verify-surfaces': calibratedFloor(3.7, 'gate-timings-final.txt'),
  'verify-design': calibratedFloor(35.7, 'gate-timings-final.txt'),
  // RECALIBRATED 2026-09-12 (job j-20260912-02): the 39.6s figure in
  // gate-timings-final.txt measured verify-launch spawning its OWN build, but
  // as a train gate it reuses the train's build through hasCurrentBuild — the
  // task-32 reuse property — so the legitimate run returns in ~1s (1.07s one
  // serial run on this machine 2026-09-12: 0.34s reuse walk + ~0.7s of checks;
  // 0.365s reuse on 2026-09-08, tasks.md task 31). The old 9.9s floor would
  // have rejected that legitimate run, the exact duration-refusal failure the
  // floor principle forbids: each floor sits below the fastest legitimate run
  // observed. The 39.6s figure stays true of the spawn path, which clears this
  // floor by two orders of magnitude, so one floor admits both paths.
  'verify-launch': calibratedFloor(
    1.1,
    'j-20260912-02 RESULT.md reuse timing',
    'reuses the train build via hasCurrentBuild; spawns (~23-53s) clear the same floor',
    '2026-09-12',
  ),
  'verify-analytics': calibratedFloor(
    19.5,
    'gate-timings-final.txt',
    'calibration excludes server startup; port 3000 was already served',
  ),
});

/**
 * A throwaway tree's gates are deliberately trivial (for example,
 * `node --version`). Its floor is the millisecond tripwire, not a repository
 * runtime borrowed from the real tree. Production contexts default to
 * GATE_FLOORS; callers with another tree can pass an explicit floorSet.
 */
export const FIXTURE_FLOORS = Object.freeze(
  Object.fromEntries(
    Object.keys(GATE_FLOORS).map((name) => [
      name,
      Object.freeze({
        floorMs: MIN_GATE_FLOOR_MS,
        floorFraction: null,
        calibratedOn: CALIBRATION_DATE,
        calibrationRuns: 7,
        calibrationMethod: 'seven serial child-process startup measurements',
        source: 'node --version and npm startup measurements',
      }),
    ]),
  ),
);

function floorMs(floor) {
  return typeof floor === 'number' ? floor : floor?.floorMs;
}

/** Refuse a custom floor that opens the same hole as a successful no-op. */
export function validateFloorSet(floors) {
  if (!floors || typeof floors !== 'object') {
    throw new TypeError('gate floor set must be an object');
  }
  for (const [name, floor] of Object.entries(floors)) {
    const value = floorMs(floor);
    if (!Number.isFinite(value)) {
      throw new TypeError(`gate floor for ${name} must have a finite floorMs`);
    }
    if (value < MIN_GATE_FLOOR_MS) {
      throw new RangeError(
        `gate floor for ${name} is ${value}ms, below the ${MIN_GATE_FLOOR_MS}ms tripwire minimum`,
      );
    }
  }
  return floors;
}

function localTime(date = new Date()) {
  const pad = (n, width = 2) => String(n).padStart(width, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
    `${pad(date.getMilliseconds(), 3)}${sign}${pad(Math.floor(absolute / 60))}:` +
    `${pad(absolute % 60)}`;
}

const BUILD_OUTPUT_DIR = 'out';
const BUILD_SUCCESS_RECORD = '.build-stamp.json';
const BUILD_STATUS_FILE = 'status.json';

function buildRecordPath(worktree) {
  return join(worktree, BUILD_OUTPUT_DIR, BUILD_SUCCESS_RECORD);
}

function removeBuildSuccessRecord(worktree) {
  rmSync(buildRecordPath(worktree), { force: true });
}

/** Copy the prebuild-produced stamp; do not call buildStamp() here. */
export function writeBuildSuccessRecord(worktree, result, date = new Date()) {
  if (result?.script !== 'build' || result.ok !== true) return false;
  const statusPath = join(worktree, BUILD_OUTPUT_DIR, BUILD_STATUS_FILE);
  let status;
  try {
    status = JSON.parse(readFileSync(statusPath, 'utf8'));
  } catch {
    return false;
  }
  if (!status || typeof status !== 'object' || Array.isArray(status) ||
      typeof status.commit !== 'string' || typeof status.dirty !== 'boolean') {
    return false;
  }
  try {
    writeFileSync(
      buildRecordPath(worktree),
      `${JSON.stringify({ ok: true, local_time: localTime(date), status }, null, 2)}\n`,
      'utf8',
    );
    return true;
  } catch {
    return false;
  }
}

const defaultClock = () => performance.now();

function formatDuration(durationMs) {
  return `${Number(durationMs).toFixed(1)}ms`;
}

function npmInvocation(script) {
  if (process.platform === 'win32') {
    return { command: 'cmd.exe', args: ['/d', '/s', '/c', `npm run ${script}`] };
  }
  return { command: 'npm', args: ['run', script] };
}

/**
 * THE MARKER A GATE FAILURE CARRIES WHEN THE MACHINE, NOT THE DIFF, FAILED.
 *
 * `pulse/tests/helpers.mjs` throws an error whose text contains this sentence
 * when a fixture's loopback fetch never connected — on this machine,
 * ephemeral-port exhaustion under concurrent load (`connect EADDRINUSE`, beads
 * addictedtoai-ar0). Those helpers are the code that KNOWS what it saw: they
 * read the errno the Pulse recorded and they say this only for a detail that is
 * NOT `HTTP <status>`, which is a response a fixture chose to serve. This
 * constant is matched against captured gate output for exactly that reason — a
 * downstream match on `EADDRINUSE`, or on any other guessed error string, would
 * be a second opinion formed with less information than the first.
 *
 * THIS DECLARATION IS THE ONLY PLACE THE WORDS EXIST, and that is the fix for
 * beads addictedtoai-brsp rather than a tidy-up. Until 2026-09-04 the same class
 * of machine failure was announced in two wordings — `assertNoTransportFailure`
 * said TRANSPORT and `assertIngested` said CONNECTION — and this constant
 * matched only the first, so half the emitting surface was invisible to the
 * retry. A wider regex covering both would have left the next fixture free to
 * invent a third wording, which is how the defect was born; so both emitters now
 * interpolate this constant, and `pulse/ carries no hard-coded wording of this
 * sentence` scans `pulse/` for a re-invention and fails on one.
 *
 * WHY IT LIVES HERE rather than in `pulse/`, in `lib/`, or in a new module: the
 * matcher below is production Desk code and must not import a test helper, so a
 * definition owned by the emitting side would have to be re-exported from
 * `pulse/tests/` into `loop/run.mjs`'s runtime path. The remaining candidates
 * were a sixth top-level directory — an architectural element added to hold one
 * sentence, which `loop/lib/dates.mjs` already rejected on the same grounds —
 * and `lib/`, the site build core, which has nothing to do with either side.
 * `pulse/tests/ -> loop/lib/` is not a new edge: `pulse/tests/curriculum-queue
 * .test.mjs:31` already imports `JOB_TYPES` from `loop/lib/config.mjs`. The
 * Pulse ENGINE (`pulse/lib/`, `pulse/run.mjs`) gains no dependency at all.
 *
 * `loop/tests/gate-transport-retry.test.mjs` runs both real emitters against
 * real fixtures and asserts the thrown text contains this string, so the two
 * cannot drift apart without a red test.
 *
 * WHAT THIS MARKER IS NO LONGER: the precondition for retrying. Since beads
 * addictedtoai-xzdd the Desk retries the gates once on ANY failure, because the
 * property that makes a retry safe — a real defect still fails twice — holds for
 * any retry-once policy and never came from the marker. Three unreproduced
 * intermittent failures in one day, in tests that emit no marker at all, each
 * cost a whole job's authored work. The marker is kept, unwidened, and it still
 * earns its place: it says WHY a retry happened, in the log and in the ledger
 * note, which is the difference between a machine that ran out of sockets and a
 * failure nobody has explained yet.
 */
export const TRANSPORT_FAILURE_MARKER = 'This is a TRANSPORT failure, not a logic failure';

/** Did this gate output come from the machine rather than from the diff? */
export function isTransportFailure(output) {
  return typeof output === 'string' && output.includes(TRANSPORT_FAILURE_MARKER);
}

/**
 * THE SAME QUESTION, ASKED OF A GATE RESULT RATHER THAN OF THE SUMMARY STRING.
 *
 * `runGates`' `output` is a HUMAN-READABLE LOG: each script's tail, truncated,
 * so a failure report stays readable. `npm test` runs 1201 tests and prints a
 * line per test, so a transport failure raised early is pushed out of that
 * window long before anything reads it — the retry then never fired, on an
 * output that had carried the marker all along (beads addictedtoai-kisa).
 *
 * The decision is therefore made at the point of CAPTURE, over each script's
 * full output, and carried as `transport` on the result. This reads that flag.
 * The fallback to scanning `output` is for a result that never went through
 * `runGates` — the `gates` hook the tests and `--no-gates` use — where the
 * summary IS the whole output and scanning it is exact.
 */
export function gatesHitTransportFailure(result = {}) {
  if (typeof result.transport === 'boolean') return result.transport;
  return isTransportFailure(result.output);
}

const TEST_LOCK_REFUSAL = /run-tests:\s*TEST LOCK|another test run holds/i;
const BUILD_LOCK_REFUSAL = /another build holds .*Waited \d+s\./i;
const SPAWN_FAILURE_STATUS = new Set([
  0xC0000142, 3221225794, -1073741502,
  0xC0000005, 3221225477, -1073741819,
]);
const SPAWN_FAILURE_CODES = new Set(['EAGAIN', 'ENOMEM']);

function environmentalCondition(result = {}) {
  const output = `${result.output ?? ''}\n${result.error ?? ''}`;
  if (TEST_LOCK_REFUSAL.test(output)) return 'test-lock refusal';
  if (BUILD_LOCK_REFUSAL.test(output)) return 'build-lock refusal';
  // A timeout means the child DID start. It is a real gate failure, even though
  // spawnSync also reports an error and status null; only creation refusal
  // before any output belongs to the environmental interruption path.
  const errorCode = result.errorCode ?? result.code;
  const timedOut = errorCode === 'ETIMEDOUT' || /\bETIMEDOUT\b/i.test(result.error ?? '');
  const noOutput = !String(result.output ?? '').trim();
  if (!timedOut && noOutput && (
    SPAWN_FAILURE_CODES.has(errorCode) ||
    (result.spawned === true && SPAWN_FAILURE_STATUS.has(result.status))
  )) {
    return 'child process did not start';
  }
  return null;
}

/**
 * Leave the child a derived grace period after its lock wait expires, so its
 * refusal can be raised, printed, and captured before the parent cap kills it.
 * The margin is one quarter of the process cap, with an 8-second floor for
 * small direct callers. Production caps are measured in minutes, while tests
 * and future callers may use smaller caps; the floor keeps poll/throw/output
 * capture from being squeezed by ordinary scheduler jitter.
 */
export function lockWaitBudget(timeoutMs) {
  const captureMarginMs = Math.min(
    Math.max(Math.ceil(timeoutMs / 4), 8000),
    Math.max(0, timeoutMs - 1),
  );
  return Math.max(0, Math.min(timeoutMs - 1, timeoutMs - captureMarginMs));
}

function freeMemoryOnSpawnRefusal(result) {
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const errorCode = result.error?.code;
  const timedOut = errorCode === 'ETIMEDOUT' || /\bETIMEDOUT\b/i.test(result.error?.message ?? '');
  const noOutput = !output.trim();
  const refused = !timedOut && noOutput && (
    SPAWN_FAILURE_CODES.has(errorCode) || SPAWN_FAILURE_STATUS.has(result.status)
  );
  return refused ? freemem() : undefined;
}

/** Did a gate fail because the machine refused the check, rather than the branch? */
export function gatesHitEnvironmentalFailure(result = {}) {
  return (result.results ?? [result])
    .filter((r) => !r.ok)
    .some((r) => Boolean(environmentalCondition(r)));
}

/**
 * What KIND of gate failure this was, in the one line the ledger keeps.
 *
 * The flat note `gates failed` was all a failed gate run ever recorded, so the
 * ledger could not tell a broken diff from a machine that ran out of sockets —
 * and on 2026-09-04 two runs in one chain were recorded `failed` on the latter
 * (job j-20260904-38 and the six-gate pass that followed it), each of which
 * counts toward breaker 1. Naming the failing script and the marker's presence
 * costs nothing and makes the ledger line answerable on its own.
 */
/**
 * How a gate result names the command it ran.
 *
 * Not every gate is an `npm` script any more (see `NODE_GATES`), and a log line
 * that said `npm run verify-design` would name a command that does not exist —
 * the exact thing a reader would paste to reproduce a failure. Older results,
 * and any produced by a `gates` hook, carry no `command`; they are all npm
 * scripts, so the fallback is the old wording exactly.
 */
export function gateCommand(result = {}) {
  return result.command ?? gateCommandForName(result.script);
}

/**
 * The same answer from a gate's NAME alone, for the one place that has only
 * names: the ledger's `phases[].gates.first_failed`, which the review brief
 * reads back. The arguments are omitted — a name is not a result and cannot
 * know which port the run used — so this is what to reproduce, not a
 * byte-exact replay.
 */
export function gateCommandForName(name) {
  const node = NODE_GATES[name];
  return node ? `node ${node.file}` : `npm run ${name}`;
}

export function enforceGateFloor(result, floors) {
  const floor = floors[result.script];
  if (!Number.isFinite(result.durationMs)) return result;

  if (!floor) {
    return {
      ...result,
      ok: false,
      floorFailure: true,
      output: `gate ${result.script} has no declared calibration floor, so it cannot pass.\n` +
        (result.output ?? ''),
    };
  }

  const withFloor = { ...result, floorMs: floorMs(floor) };
  if (!result.ok || result.durationMs >= floorMs(floor)) return withFloor;

  return {
    ...withFloor,
    ok: false,
    floorFailure: true,
    output: `gate ${result.script} returned below its declared floor: observed ` +
      `${formatDuration(result.durationMs)}, floor ${formatDuration(floorMs(floor))}.\n` +
      (result.output ?? ''),
  };
}

export function gateFailureNote(result = {}, { retried = false } = {}) {
  const failed = (result.results ?? []).filter((r) => !r.ok);
  const which = failed.length
    ? failed
        .map((r) => {
          const timedOut = r.errorCode === 'ETIMEDOUT' || /\bETIMEDOUT\b/i.test(r.error ?? '');
          const ending = r.floorFailure
            ? `below floor: observed ${formatDuration(r.durationMs)} < ${formatDuration(r.floorMs)}`
            : r.status === null ? (timedOut ? 'timed out' : 'could not run') : `exit ${r.status}`;
          return `${gateCommand(r)} (${ending})`;
        })
        .join(', ')
    : 'no per-gate result was recorded';
  // The marker no longer decides WHETHER the gates were retried — since beads
  // addictedtoai-xzdd every gate failure is retried once — so the note keeps the
  // two facts separate: what the output said, and whether a second run agreed.
  // A note that said only "transport-marked" would leave the ledger unable to
  // tell a first failure from a confirmed one, which is the exact readability
  // this function was written for.
  const condition = failed.map(environmentalCondition).find(Boolean);
  const memory = failed.find((r) => Number.isFinite(r.freeMemoryBytes))?.freeMemoryBytes;
  const memoryNote = Number.isFinite(memory) ? ` (free memory: ${memory} bytes)` : '';
  const marker = condition
    ? `environmental: ${condition}${condition === 'child process did not start' ? memoryNote : ''}`
    : gatesHitTransportFailure(result)
    ? 'transport-marked'
    : 'no transport marker in the captured output';
  const kind = retried ? `${marker}, retried once and failed again` : marker;
  return `gates failed: ${which} — ${kind}`;
}

/**
 * First failing script in a gate result — the only gate a retry re-runs.
 *
 * `train.mjs` `failingGateOf` answers the same question for the red path;
 * this is its gates-side twin, not an import, because `train.mjs` imports
 * THIS module and the reverse edge would be a cycle. The two are pinned to
 * each other by `gates-retry.test.mjs`'s structural arm rather than by a
 * shared definition: a stub that fails gate X must read as X on both.
 */
export function failingGateScript(gateResult) {
  const results = (gateResult && gateResult.results) || [];
  const hit = results.find((r) => r && !r.ok);
  return hit && hit.script ? hit.script : null;
}

/**
 * The train's single-attempt retry (Stage-1 task 51, row 51): re-run the
 * FAILING GATE, never the set — as a wrapper around the gates seam, so the
 * train's call sites gain it without a single edit to `train.mjs`.
 *
 * Row 51's three clauses, enforced structurally rather than by convention:
 *
 * - ONE re-run of the failing gate. The retry carries `retryOf`, and a call
 *   already carrying it is never retried again — double-wrapping degrades to
 *   one attempt, not two. The attempt count is observable on the seam (first
 *   call N scripts, second call exactly one), which is what the whole-set
 *   mutation fails against.
 * - Per gate STAGE, never per probe or measurement. A retry runs only for a
 *   multi-gate call in the train checkout (`scripts.length > 1` with
 *   `dir === onlyDir`): single-gate probes (leave-one-out trials, replay
 *   audits, merge-time rebuilds) and out-of-checkout measurements (the
 *   classification re-run in its detached scratch worktree) pass through
 *   untouched. The classification re-run is a measurement and consumes
 *   neither retry — it never reaches the second call, so there is nothing
 *   to count.
 * - Never a lock refusal (R1). A failing gate the environment refused —
 *   lock refusals, spawn failures — is returned as-is: a second wait on the
 *   same holder is how retries pile up, and the caller already books those
 *   `interrupted`. Timeouts are NOT refusals (see `environmentalCondition`):
 *   the child started, so they retry like any other failure. Transport
 *   marking says WHY a retry happened, never WHETHER — a real defect still
 *   fails twice, which is the only property that ever made this safe.
 *
 * The retry record names which kind it was (`kind: 'train-failing-gate'`,
 * alongside the gate, the pass/fail and the transport reading) and is
 * delivered twice: attached to the returned result under `retry` (additive —
 * every train call site reads only `ok`/`output`/`results`) and to the
 * caller's `onRetry` sink, which is how `run.mjs` observes retries that run
 * inside `runTrain`. No retry, no record: green runs, probes, measurements
 * and refusals return the seam's result untouched.
 *
 * @param {Function} gatesFn  the gates seam (`(ctx, dir, {scripts}) => result`); non-functions default to `runGates`
 * @param {object} [o]
 * @param {string|null} [o.onlyDir]  the train checkout; multi-gate calls anywhere else never retry
 * @param {Function|null} [o.onRetry]  `onRetry(record)` per retry that runs
 */
export function withFailingGateRetry(gatesFn, { onlyDir = null, onRetry = null } = {}) {
  const inner = typeof gatesFn === 'function' ? gatesFn : runGates;
  return (ctx, dir, options) => {
    const say = ctx && typeof ctx.log === 'function' ? (s) => ctx.log(s) : () => {};
    const first = inner(ctx, dir, options);
    if (!first || first.ok) return first;
    const scripts = options ? options.scripts : undefined;
    if (options && options.retryOf != null) return first;
    if (!Array.isArray(scripts) || scripts.length < 2) return first;
    if (onlyDir != null && dir !== onlyDir) {
      say(`train gates red (${scripts.join('+')}) out of the train checkout — a measurement, not a stage: no retry, none consumed`);
      return first;
    }
    const gate = failingGateScript(first);
    const failing = (first.results || []).find((r) => r && !r.ok);
    if (!gate || !failing) return first;
    if (gatesHitEnvironmentalFailure({ results: [failing] })) {
      say(`train gate ${gate} refused by the environment — recording no retry and waiting on nothing twice (R1 pileup guard)`);
      return first;
    }
    const marked = gatesHitTransportFailure(first);
    say(`train gate ${gate} red — retrying that gate once, not the set (kind train-failing-gate)`);
    const second = inner(ctx, dir, { ...(options || {}), scripts: [gate], retryOf: scripts });
    const record = {
      kind: 'train-failing-gate',
      gate,
      retried: true,
      passed: Boolean(second && second.ok),
      firstFailed: [gate],
      transport: marked,
    };
    say(`train gate retry (${gate}): ${record.passed ? 'PASS' : 'FAIL'}`);
    if (typeof onRetry === 'function') {
      try {
        onRetry(record);
      } catch {
        // Observation must not move the gate path.
      }
    }
    return { ...second, retry: record };
  };
}

/**
 * A worktree has no `node_modules` — it is gitignored, so `git worktree add`
 * does not bring it. Link the repository's, rather than installing a second
 * copy per job.
 *
 * Windows note: 'junction' needs no elevated rights, unlike 'dir' symlinks.
 */
export function linkNodeModules(worktree, repoRoot) {
  const target = join(repoRoot, 'node_modules');
  const link = join(worktree, 'node_modules');
  if (!existsSync(target)) return { linked: false, why: 'the repository has no node_modules' };
  if (existsSync(link)) return { linked: false, why: 'already present' };
  try {
    symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');
    return { linked: true, link };
  } catch (e) {
    return { linked: false, why: e.message };
  }
}

/** Remove the link before the worktree is torn down, so nothing recurses into the real tree. */
export function unlinkNodeModules(worktree) {
  const link = join(worktree, 'node_modules');
  try {
    if (!existsSync(link)) return false;
    const st = lstatSync(link);
    if (st.isSymbolicLink() || st.isDirectory()) {
      unlinkSync(link);
      return true;
    }
  } catch {
    /* a junction that will not unlink is left; the worktree removal reports it */
  }
  return false;
}

function hasScript(worktree, name) {
  try {
    const pkg = JSON.parse(readFileSync(join(worktree, 'package.json'), 'utf8'));
    return Boolean(pkg.scripts?.[name]);
  } catch {
    return false;
  }
}

function npmRun(worktree, script, timeoutMs, env, floors, spawn = spawnSync, now = defaultClock) {
  const invocation = npmInvocation(script);
  if (script === 'build') removeBuildSuccessRecord(worktree);
  const started = now();
  const r = spawn(invocation.command, invocation.args, {
    cwd: worktree,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ...env },
  });
  const result = {
    script,
    command: `npm run ${script}`,
    ok: r.status === 0,
    status: r.status,
    error: r.error?.message,
    errorCode: r.error?.code,
    freeMemoryBytes: freeMemoryOnSpawnRefusal(r),
    spawned: true,
    durationMs: Math.max(0, now() - started),
    floorMs: floorMs(floors[script]),
    output: `${r.stdout ?? ''}${r.stderr ?? ''}`,
  };
  return result;
}

/**
 * THE GATES THAT ARE NOT `npm` SCRIPTS (beads addictedtoai-one6, job
 * j-20260912-02).
 *
 * `package.json` carries `verify:launch` and `verify:analytics` (colons) but
 * no `verify-launch` or `verify-analytics` (hyphens), and no `verify:design`
 * or `verify:surfaces` at all — and `package.json` is a file this repository
 * does not edit. So all four are run the way the push bar runs them —
 * `node scripts/<name>.mjs` — resolved against THIS worktree: the child is
 * spawned with the worktree as its cwd naming a relative script path, so the
 * script file it loads is the worktree's own copy and its ROOT-derived paths
 * (content, data, out) are the worktree's, against the export the `build`
 * gate has just produced in that same worktree.
 *
 * WHY THE FIRST TWO JOINED THE TRIPWIRE AND THE LAST TWO DID NOT (one6).
 * `verify-launch` runs its own build unless told not to, which would double
 * every job's build cost; `verify-analytics` needs Playwright driving a served
 * export to count GA4 `page_view` hits, which is not a thing a content diff
 * can plausibly break. The tripwire two are the ones that catch
 * CONTENT-shaped defects, which is the class a Desk job can actually
 * introduce — and one of them has already caught one in production, after the
 * fact: job `j-20260903-15` merged on `gates: PASS`, published at `077ffcd5`,
 * and the very next human-initiated run failed
 *     FAIL  every dateModified equals that URL's <lastmod> in sitemap.xml
 *           /blog/glm-5-3-license-revenue-gate: graph 2026-09-03 vs sitemap 2026-09-02
 * which is a `verify-surfaces` check. The site was live with a failing gate for
 * as long as it took a person to look.
 *
 * WHY THE LAST TWO ARE NODE GATES RATHER THAN NPM SCRIPTS (j-20260912-02).
 * The frozen TRAIN_GATES names are hyphenated while `package.json` carries
 * the colon forms, so `runGates` resolves them through neither branch and
 * fails them closed on every run, in every worktree, on any commit. Renaming
 * either side is forbidden — the frozen names are referenced by specs and
 * tasks, and `package.json` is reserved by design — so these entries run them
 * as node children, exactly as the push bar invokes them.
 *
 * `verify-launch` runs with NO arguments, which is the task-32 reuse
 * property: its build section finds the train build current through
 * `hasCurrentBuild` and reuses it (0.34s on 2026-09-12) instead of spawning a
 * second one. `--no-build` would be cheaper still and is WRONG here: it
 * records a SKIP whose own wording says the build was not verified by the
 * run, and the task-31 reuse-vs-spawn availability record needs the build
 * section to actually run and name which path it took.
 *
 * `verify-analytics` serves the worktree's own `out/` (its first argument is
 * an export directory OR a base URL; a relative `out` resolves under the
 * worktree cwd) on the script's default port, overridable exactly the way
 * `verify-design`'s is. Its no-record discipline is enforced from THIS side
 * (`noRecordPaths` below): unlike `verify-design` the script has no
 * no-record flag and nothing in scope may add one, so the runner snapshots
 * the measurement record and restores it after the child exits, pass or fail.
 * `data/` is never gitignored, so a written measurement would otherwise reach
 * the merged diff through the revision pass's `git add -A`.
 *
 * MEASURED COST, 2026-09-06, both run from a worktree against the already-built
 * export in `D:/AddictedtoAI/out` while a Desk job and four agents shared the
 * machine: `verify-surfaces` 4.7s, `verify-design` 40.2s — 45 seconds added to
 * a gate run whose `npm test` alone is minutes. The bead asked for that number
 * before committing to the change, because the Desk runs serially and a slower
 * gate is a smaller queue drained per night. 45s is not that.
 *
 * ONE CORRECTION TO THE BEAD'S OWN PREMISE, measured rather than assumed: it
 * calls both of these "static checks over out/". `verify-surfaces` is;
 * `verify-design` is not — it starts `scripts/serve-static.mjs` and drives
 * Chromium through Playwright, which is why it costs 40s rather than 5. It is
 * still worth its place at that price, but it is the same KIND of check as
 * `verify-analytics`, not a different one, and the reason to keep
 * `verify-analytics` out is its subject, not its machinery.
 *
 * The design port is deliberately NOT `verify-design`'s own default of 3111:
 * the maintainer or the orchestrator running the push gate by hand on `main`
 * binds that one, and two servers on one port is a gate failure that has
 * nothing to do with the diff. `LOOP_VERIFY_DESIGN_PORT` overrides, and
 * `LOOP_VERIFY_ANALYTICS_PORT` does the same for the analytics default 3212.
 */
export const NODE_GATES = Object.freeze({
  'verify-surfaces': Object.freeze({
    file: 'scripts/verify-surfaces.mjs',
    args: () => ['out'],
    floor: GATE_FLOORS['verify-surfaces'],
  }),
  'verify-design': Object.freeze({
    file: 'scripts/verify-design.mjs',
    args: () => ['out', process.env.LOOP_VERIFY_DESIGN_PORT ?? '3211'],
    floor: GATE_FLOORS['verify-design'],
    // A GATE IS A CHECK, NOT A MEASUREMENT OF RECORD. `verify-design` writes
    // its numbers into `data/launch.json`, which is the repository's dated
    // measurement file. Left to write it here, every job's gate would leave the
    // worktree dirty with a branch-local number — and a job that goes on to a
    // REVISION pass has its whole worktree committed with `git add -A`
    // (`run.mjs`, `commitAll`), so that number would merge, and reach the
    // reviewer as an unexplained diff hunk nobody wrote.
    env: { ATAI_VERIFY_DESIGN_NO_RECORD: '1' },
  }),
  'verify-launch': Object.freeze({
    file: 'scripts/verify-launch.mjs',
    // No `--no-build`: the build section must RUN so it can reuse the train
    // build through hasCurrentBuild and name the path it took (see above).
    // With `--no-build` the section reports SKIP — "THE BUILD WAS NOT
    // VERIFIED BY THIS RUN" — which is false of a train that gated `build`
    // two steps earlier, and it would leave the reuse-vs-spawn record with
    // nothing to record.
    args: () => [],
    floor: GATE_FLOORS['verify-launch'],
  }),
  'verify-analytics': Object.freeze({
    file: 'scripts/verify-analytics.mjs',
    args: () => ['out', process.env.LOOP_VERIFY_ANALYTICS_PORT ?? '3212'],
    floor: GATE_FLOORS['verify-analytics'],
    // The same CHECK-NOT-RECORD discipline as `verify-design`, enforced from
    // the runner because the script honours no flag for it: `nodeRun`
    // snapshots these worktree-relative paths before spawning and restores
    // them after the child exits, whatever the verdict, so a measurement the
    // gate wrote never reaches a diff.
    noRecordPaths: Object.freeze(['data/launch.json']),
  }),
});

/**
 * The per-job tripwire gate, in order: the export must exist before it is
 * checked. Shrunk to two by Stage-1 task 32 (U1): a job's own gates prove
 * its branch alone, and branch+base together is proved by the tripwire run
 * of exactly these two over the provisionally merged tip (`train.mjs`
 * `runTripwire`). The full six live on in `TRAIN_GATES` below.
 */
export const DEFAULT_GATES = Object.freeze(['build', 'verify-surfaces']);

/**
 * The full gate set, frozen, in Q-S15 order (Stage-1 task 32, U1). Every name
 * here resolves through the same two branches `runGates` uses — a
 * `NODE_GATES` entry naming a script file in the worktree, or an `npm`
 * script of that name — and `loop/tests/train-gate-resolution.test.mjs`
 * runs the whole set through `runGates` so a future rename breaks the suite
 * instead of the night. `verify-launch` reuses the train's build (its entry
 * carries no `--no-build`; see above); `verify-analytics` restores the
 * measurement record it writes (its `noRecordPaths`). The one reuse U1
 * asserts besides those is the tripwire's: `verify-surfaces` on the tripwire
 * path reads the tripwire's own export, exactly one build per job.
 */
export const TRAIN_GATES = Object.freeze(['test', 'build', 'verify-surfaces', 'verify-design', 'verify-launch', 'verify-analytics']);

/**
 * What `spec.noRecordPaths` (worktree-relative) held before the gate child
 * ran — bytes, or null where nothing was there to keep.
 */
function snapshotNoRecordPaths(worktree, relPaths) {
  return (relPaths ?? []).map((rel) => {
    const abs = join(worktree, rel);
    let bytes = null;
    try {
      bytes = readFileSync(abs);
    } catch {
      bytes = null;
    }
    return { abs, bytes };
  });
}

/**
 * Put the snapshot back, whatever the gate verdict was. A path that held
 * nothing holds nothing again; a path that held bytes holds those exact
 * bytes. Best-effort by design: the gate's verdict already stands, and a
 * restore that threw must not take it down with it.
 */
function restoreNoRecordPaths(snapshots) {
  for (const { abs, bytes } of snapshots) {
    try {
      if (bytes === null) rmSync(abs, { force: true });
      else writeFileSync(abs, bytes);
    } catch {
      /* the verdict stands; the dirt is reported by the tree, not hidden */
    }
  }
}

function nodeRun(worktree, name, spec, timeoutMs, env, floors, spawn = spawnSync, now = defaultClock) {
  const args = [spec.file, ...spec.args()];
  const started = now();
  const preserved = snapshotNoRecordPaths(worktree, spec.noRecordPaths);
  let r;
  try {
    r = spawn(process.execPath, args, {
      cwd: worktree,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, ...env, ...(spec.env ?? {}) },
    });
  } finally {
    restoreNoRecordPaths(preserved);
  }
  return {
    script: name,
    command: `node ${args.join(' ')}`,
    ok: r.status === 0,
    status: r.status,
    error: r.error?.message,
    errorCode: r.error?.code,
    freeMemoryBytes: freeMemoryOnSpawnRefusal(r),
    spawned: true,
    durationMs: Math.max(0, now() - started),
    floorMs: floorMs(floors[name]),
    output: `${r.stdout ?? ''}${r.stderr ?? ''}`,
  };
}

/**
 * Run the schema/build checks in a job worktree.
 *
 * `transport` is computed HERE, over each script's FULL output, before anything
 * is sliced — see `gatesHitTransportFailure`. `output` is the truncated
 * human-readable log and nothing decides anything from it.
 *
 * @returns {{ok: boolean, results: Array, transport: boolean, output: string}}
 */
export function runGates(ctx, worktree, {
  scripts = DEFAULT_GATES,
  timeoutMs = 20 * 60 * 1000,
  lockWaitMs = lockWaitBudget(timeoutMs),
  spawn = spawnSync,
  now = defaultClock,
  floorSet,
  floors,
} = {}) {
  const defaultFloors = ctx && resolve(ctx.repoRoot) === resolve(ROOT) ? GATE_FLOORS : FIXTURE_FLOORS;
  const activeFloors = validateFloorSet(floors ?? floorSet ?? defaultFloors);
  linkNodeModules(worktree, ctx.repoRoot);
  const gateEnv = {
    ATAI_TEST_LOCK_WAIT_MS: String(lockWaitMs),
    ATAI_BUILD_LOCK_WAIT_MS: String(lockWaitMs),
  };
  const results = [];
  for (const s of scripts) {
    const node = NODE_GATES[s];
    if (node) {
      // Same rule as an absent npm script, and it must stay the same rule: a
      // gate whose script is not in the worktree is a FAILURE, never a silent
      // skip. Skipping is how the whole gap this gate closes was invisible.
      if (!existsSync(join(worktree, node.file))) {
        results.push({
          script: s,
          command: `node ${node.file}`,
          ok: false,
          status: null,
          output: `the worktree has no ${node.file}, so the gate could not run. ` +
            `A gate that cannot run is a gate failure, not a pass.`,
        });
        continue;
      }
      const r = enforceGateFloor(nodeRun(worktree, s, node, timeoutMs, gateEnv, activeFloors, spawn, now), activeFloors);
      results.push(r);
      if (!r.ok) break;
      continue;
    }
    if (!hasScript(worktree, s)) {
      results.push({
        script: s,
        command: `npm run ${s}`,
        ok: false,
        status: null,
        output: `package.json in the worktree has no "${s}" script, so the gate could not run. ` +
          `A gate that cannot run is a gate failure, not a pass.`,
      });
      continue;
    }
    const r = enforceGateFloor(npmRun(worktree, s, timeoutMs, gateEnv, activeFloors, spawn, now), activeFloors);
    if (s === 'build') {
      if (r.ok) writeBuildSuccessRecord(worktree, r);
      else removeBuildSuccessRecord(worktree);
    }
    results.push(r);
    if (!r.ok) break;
  }
  const ok = results.length > 0 && results.every((r) => r.ok);
  // BEFORE THE SLICE, and that ordering is the whole point of the flag.
  const transport = results.some((r) => isTransportFailure(r.output));
  const environmental = results
    .filter((r) => !r.ok)
    .some((r) => Boolean(environmentalCondition(r)));
  return {
    ok,
    results,
    transport,
    environmental,
    output: results
      .map((r) => `--- ${gateCommand(r)} (${r.ok ? 'PASS' : `FAIL, exit ${r.status}`})\n${r.output.slice(-6000)}`)
      .join('\n'),
  };
}
