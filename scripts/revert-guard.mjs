#!/usr/bin/env node
/**
 * REVERT GUARD — refuse a change that restores a tracked file to a state the
 * target branch has since DELIBERATELY superseded.
 *
 * WHY THE SIX GATES CANNOT DO THIS, and it is not a gap to plug in them: a
 * revert is INTERNALLY CONSISTENT. It restores a state `main` really did hold,
 * so `npm test`, `npm run build`, verify-launch, verify-design, verify-surfaces
 * and verify-analytics all pass BY CONSTRUCTION. They measure whether the tree
 * is coherent, never whether it moved backwards. Only a comparison against the
 * target branch sees this, which is why this is a separate check.
 *
 * THE MEASURED INSTANCE (addictedtoai-lvba). Desk job j-20260907-30 was told by
 * its brief that commit 3ca0ad1 was "the required baseline" for
 * data/launch.json. addictedtoai-91s had since landed on main and legitimately
 * changed that same file, adding the `precision` field that records what
 * precision the payload numbers are good to. The job restored the file to the
 * named baseline, wiping it. Its six gates were green. Its reviewer ran a real
 * blob comparison, SAW that the file differed from main, and reasoned the
 * difference away because the brief named the baseline — a reviewer with one
 * authority reasoning soundly to a wrong answer. The revert was pushed and
 * reached the deployed site.
 *
 * A brief is written before a run; `main` moves while the run is in flight. So
 * a baseline commit named in a brief is A CLAIM WITH AN EXPIRY DATE. The sha is
 * not the perishable part — its RELATIONSHIP to `main` is.
 *
 * THE THREE CASES, and only the middle one is a finding:
 *
 *   branch blob === target blob                    untouched or already agreed
 *   branch blob === an OLDER blob of that path on
 *     the target, AND the target deliberately
 *     moved the path since that commit             REVERT — refuse, name it
 *   anything else                                  a forward edit, fine
 *
 * The second conjunct is load-bearing. Without "moved since", a change that
 * merely restores a state nothing has superseded — a no-op, or an undo of an
 * unmerged experiment — would read as a revert.
 *
 * THERE IS DELIBERATELY NO OVERRIDE.
 *
 * A revert is sometimes correct, so the obvious next feature is a bypass flag.
 * It is not offered, because the actor most likely to trip this guard is a Desk
 * job, and a flag a job can set is the guard deleting itself politely. That is
 * the same conflict of interest as a job clearing its own HOLD.md: the brake
 * exists precisely because the actor under it should not be the one releasing
 * it. A legitimate revert is performed by a human or by the orchestrator BETWEEN
 * RUNS, by hand, outside this path — a different actor in a different position.
 * If a bypass is ever added, it must not be reachable by the actor the guard
 * constrains.
 *
 * RUN IT IMMEDIATELY BEFORE THE PUSH, NOT AT MERGE TIME. The answer depends on
 * when it runs, because "the target deliberately moved this path since" is
 * evaluated against the target as it stands. A job that merges early and pushes
 * late can otherwise slip through the gap between the two.
 *
 * Usage:
 *   node scripts/revert-guard.mjs [<ref>] [<target>] [--repo <path>] [--limit N]
 *
 * Defaults: <ref> HEAD, <target> origin/main. Exit 0 clean, 1 revert found,
 * 2 usage or plumbing error.
 *
 * Git plumbing goes through execFileSync so git.exe is spawned directly and no
 * MSYS runtime touches a `rev:path` argument. In Git Bash, `git show
 * "rev:path"` silently returns ZERO BYTES with exit 0, which reads as "the file
 * was deleted" and is not.
 */

import { execFileSync } from 'node:child_process';

/** Spawn git in `repo`. stderr is piped, never inherited: "path X does not
 *  exist in <rev>" is the EXPECTED answer whenever a path predates a commit,
 *  and letting git print it buries the finding in noise that looks like
 *  breakage. */
export function gitTry(repo, args) {
  try {
    const out = execFileSync('git', ['-C', repo, ...args], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, out: out.trim() };
  } catch (err) {
    return { ok: false, out: '', status: err.status ?? null };
  }
}

/** The blob id of `<ref>:<path>`, or null when the path does not exist there. */
export function blobAt(repo, ref, path) {
  const r = gitTry(repo, ['rev-parse', `${ref}:${path}`]);
  return r.ok && r.out ? r.out : null;
}

/**
 * Find paths whose content in `ref` restores a state `target` has superseded.
 * Returns { base, changed, agreed, forward, findings }.
 */
export function findReverts(repo, ref, target, { limit = 400 } = {}) {
  const baseR = gitTry(repo, ['merge-base', target, ref]);
  if (!baseR.ok) throw new Error(`no merge-base between ${target} and ${ref}`);
  const base = baseR.out;

  const changedR = gitTry(repo, ['diff', '--name-only', `${base}..${ref}`]);
  if (!changedR.ok) throw new Error(`cannot diff ${base}..${ref}`);
  const changed = changedR.out.split('\n').map((s) => s.trim()).filter(Boolean);

  const findings = [];
  let agreed = 0;
  let forward = 0;

  for (const path of changed) {
    const branchBlob = blobAt(repo, ref, path);
    const targetBlob = blobAt(repo, target, path);

    // The change agrees with the target, or the path is gone on both sides.
    if (branchBlob !== null && branchBlob === targetBlob) { agreed++; continue; }

    // A deletion is not this guard's business: it removes content rather than
    // restoring a superseded version of it, and the diff makes it obvious.
    if (branchBlob === null) { forward++; continue; }

    const histR = gitTry(repo, ['rev-list', `--max-count=${limit}`, target, '--', path]);
    if (!histR.ok || !histR.out) { forward++; continue; }
    const commits = histR.out.split('\n').map((s) => s.trim()).filter(Boolean);

    let ancestor = null;
    for (const c of commits) {
      if (c === base) continue; // the state the change started from
      const oldBlob = blobAt(repo, c, path);
      if (oldBlob !== null && oldBlob === branchBlob) { ancestor = c; break; }
    }
    if (!ancestor) { forward++; continue; }

    // Confirm the target DELIBERATELY moved past that state. Without this a
    // restoration of something nothing superseded would read as a revert.
    const sinceR = gitTry(repo, ['log', '--oneline', `${ancestor}..${target}`, '--', path]);
    const superseding = sinceR.ok && sinceR.out
      ? sinceR.out.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
    if (superseding.length === 0) { forward++; continue; }

    findings.push({ path, ancestor, branchBlob, targetBlob, superseding });
  }

  return { base, changed, agreed, forward, findings };
}

function main(argv) {
  const flag = (name) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const repo = flag('--repo') ?? process.cwd();
  const limitRaw = flag('--limit');
  const limit = limitRaw ? Number(limitRaw) : 400;

  // Drop every flag AND its value; only then take the positionals. Computing a
  // "skip this index" from a flag that is ABSENT is how the first draft of this
  // script silently dropped its own first argument and compared a commit to
  // itself, reporting "clean" for every input including a known revert.
  const flagged = new Set();
  for (const name of ['--repo', '--limit']) {
    const i = argv.indexOf(name);
    if (i >= 0) { flagged.add(i); flagged.add(i + 1); }
  }
  const positional = argv.filter((a, i) => !flagged.has(i) && !a.startsWith('--'));

  const ref = positional[0] ?? 'HEAD';
  const target = positional[1] ?? 'origin/main';

  let result;
  try {
    result = findReverts(repo, ref, target, { limit });
  } catch (err) {
    console.error(`revert-guard: ${err.message}`);
    return 2;
  }

  console.log(`revert-guard: ${ref} against ${target}`);
  console.log(`  merge-base ............. ${result.base}`);
  console.log(`  paths changed .......... ${result.changed.length}`);
  console.log(`  unchanged vs target .... ${result.agreed}`);
  console.log(`  forward edits .......... ${result.forward}`);
  console.log(`  REVERTS ................ ${result.findings.length}`);
  console.log('');

  for (const f of result.findings) {
    console.log(`REVERT: ${f.path}`);
    console.log(`  this change restores the blob this path had at ${f.ancestor.slice(0, 12)}`);
    console.log(`  restoring ${String(f.branchBlob).slice(0, 12)}  over  ${String(f.targetBlob).slice(0, 12)}`);
    console.log(`  ${target} moved this path deliberately ${f.superseding.length} time(s) since:`);
    for (const c of f.superseding.slice(0, 8)) console.log(`    ${c}`);
    console.log('');
  }

  if (result.findings.length) {
    console.log('REFUSE THE PUSH.');
    console.log('A revert is internally consistent, so every gate passes; that is why this');
    console.log('check is separate from them. Read the superseding commits above and decide');
    console.log('whether the change is working from a baseline that has expired. There is no');
    console.log('bypass flag, deliberately: a legitimate revert is made by hand, outside this');
    console.log('path, by an actor this guard does not constrain.');
    return 1;
  }

  console.log('clean: nothing restores a superseded state.');
  return 0;
}

// Only run when invoked directly, so the test can import the functions.
if (process.argv[1] && process.argv[1].endsWith('revert-guard.mjs')) {
  process.exitCode = main(process.argv.slice(2));
}
