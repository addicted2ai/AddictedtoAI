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
import { existsSync, lstatSync, symlinkSync, unlinkSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
export function gateFailureNote(result = {}, { retried = false } = {}) {
  const failed = (result.results ?? []).filter((r) => !r.ok);
  const which = failed.length
    ? failed
        .map((r) => `npm run ${r.script} (${r.status === null ? 'could not run' : `exit ${r.status}`})`)
        .join(', ')
    : 'no per-gate result was recorded';
  // The marker no longer decides WHETHER the gates were retried — since beads
  // addictedtoai-xzdd every gate failure is retried once — so the note keeps the
  // two facts separate: what the output said, and whether a second run agreed.
  // A note that said only "transport-marked" would leave the ledger unable to
  // tell a first failure from a confirmed one, which is the exact readability
  // this function was written for.
  const marker = gatesHitTransportFailure(result)
    ? 'transport-marked'
    : 'no transport marker in the captured output';
  const kind = retried ? `${marker}, retried once and failed again` : marker;
  return `gates failed: ${which} — ${kind}`;
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

function npmRun(worktree, script, timeoutMs) {
  const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', script], {
    cwd: worktree,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 32 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
  return {
    script,
    ok: r.status === 0,
    status: r.status,
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
export function runGates(ctx, worktree, { scripts = ['test', 'build'], timeoutMs = 20 * 60 * 1000 } = {}) {
  linkNodeModules(worktree, ctx.repoRoot);
  const results = [];
  for (const s of scripts) {
    if (!hasScript(worktree, s)) {
      results.push({
        script: s,
        ok: false,
        status: null,
        output: `package.json in the worktree has no "${s}" script, so the gate could not run. ` +
          `A gate that cannot run is a gate failure, not a pass.`,
      });
      continue;
    }
    const r = npmRun(worktree, s, timeoutMs);
    results.push(r);
    if (!r.ok) break;
  }
  const ok = results.length > 0 && results.every((r) => r.ok);
  // BEFORE THE SLICE, and that ordering is the whole point of the flag.
  const transport = results.some((r) => isTransportFailure(r.output));
  return {
    ok,
    results,
    transport,
    output: results
      .map((r) => `--- npm run ${r.script} (${r.ok ? 'PASS' : `FAIL, exit ${r.status}`})\n${r.output.slice(-6000)}`)
      .join('\n'),
  };
}
