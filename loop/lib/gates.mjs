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
 * `pulse/tests/helpers.mjs`'s `assertNoTransportFailure` throws an error whose
 * text contains this sentence when a fixture's loopback fetch never connected —
 * on this machine, ephemeral-port exhaustion under concurrent load
 * (`connect EADDRINUSE`, beads addictedtoai-ar0). That helper is the code that
 * KNOWS what it saw: it reads the errno the Pulse recorded and it skips
 * anything reading `HTTP <status>`, which is a response a fixture chose to
 * serve. This constant is matched against captured gate output for exactly that
 * reason — a downstream match on `EADDRINUSE`, or on any other guessed error
 * string, would be a second opinion formed with less information than the first.
 *
 * `loop/tests/gate-transport-retry.test.mjs` runs the real emitter against a
 * real fixture and asserts the thrown text contains this string, so the two
 * cannot drift apart without a red test.
 */
export const TRANSPORT_FAILURE_MARKER = 'This is a TRANSPORT failure, not a logic failure';

/** Did this gate output come from the machine rather than from the diff? */
export function isTransportFailure(output) {
  return typeof output === 'string' && output.includes(TRANSPORT_FAILURE_MARKER);
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
  const kind = isTransportFailure(result.output)
    ? retried
      ? 'transport-marked, retried once and failed again'
      : 'transport-marked'
    : 'no transport marker in the captured output';
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
 * @returns {{ok: boolean, results: Array, output: string}}
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
  return {
    ok,
    results,
    output: results
      .map((r) => `--- npm run ${r.script} (${r.ok ? 'PASS' : `FAIL, exit ${r.status}`})\n${r.output.slice(-6000)}`)
      .join('\n'),
  };
}
