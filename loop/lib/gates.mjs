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
