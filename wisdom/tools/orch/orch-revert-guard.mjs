// REVERT GUARD (addictedtoai-lvba). Refuse a change that restores a tracked file
// to a state `main` has since DELIBERATELY superseded.
//
// WHY THIS EXISTS AND WHY THE GATES CANNOT DO IT: a revert is internally
// consistent -- it is a state main really did hold -- so npm test, the build and
// all four verifiers pass BY CONSTRUCTION. They measure whether the tree is
// coherent, not whether it moved backwards. Only a comparison against main sees
// this, which is why it is a separate check run before the push.
//
// Measured instance: Desk job j-20260907-30 restored data/launch.json to the
// blob at 3ca0ad1, its brief's named baseline, wiping addictedtoai-91s's
// `precision` field which had landed on main in c003ce1 afterwards. Its six
// gates were green and its reviewer approved.
//
// THE THREE CASES, and only the middle one is a finding:
//   branch blob == main blob                     -> untouched or already agreed
//   branch blob == an OLDER main blob for that
//   path, while main's current blob differs      -> REVERT. Name the ancestor.
//   branch blob is content main has never held   -> forward edit, fine
//
// Usage:
//   node orch-revert-guard.mjs <branch-or-commit> [<main-ref>] [--limit N]
// Exit 0 = clean, 1 = revert found, 2 = usage/plumbing error.
//
// Git plumbing goes through execFileSync so git.exe is spawned directly and no
// MSYS runtime mangles a `rev:path` argument (memory windows-node-and-git-traps:
// `git show "rev:path"` in Git Bash silently returns ZERO BYTES with exit 0).

import { execFileSync } from 'node:child_process';

// The repository this guard interrogates. It defaults to the real one and is
// overridable ONLY so the guard can be tested against a throwaway repository
// built under the OS temp directory, which is how this project tests anything
// that touches git.
//
// WRITTEN AFTER A TEST THAT COULD NOT FAIL. The first behavioural test for the
// derived-path branch built a fixture repo in temp, ran the guard with `cwd`
// set to it, and reported "0 reverts, 0 recomputations" — which reads as a
// clean pass and was nothing of the kind: `-C R` is absolute, so the guard was
// answering about D:/AddictedtoAI and had never seen the fixture at all. A
// green result from a case that never reached the code proves the author's
// mental model and nothing else. The env var is what makes the red case
// reachable; without it the test is decorative.
const R = process.env.ORCH_REVERT_GUARD_REPO || 'D:/AddictedtoAI';

const git = (...args) =>
  execFileSync('git', ['-C', R, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: false,
  }).trim();

// stderr is piped rather than inherited: "path X does not exist in <rev>" is the
// EXPECTED answer when a path predates a commit, and letting git print it drowns
// the finding in noise that looks like breakage.
const gitTry = (...args) => {
  try {
    const out = execFileSync('git', ['-C', R, ...args], {
      encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return { ok: true, out };
  } catch (e) { return { ok: false, out: '', status: e.status }; }
};

const argv = process.argv.slice(2);
const limitIdx = argv.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : 400;
// NOTE: `limitIdx + 1` is only a value-of-a-flag index when the flag is PRESENT.
// With --limit absent, limitIdx is -1 and limitIdx + 1 is 0, which silently
// dropped the FIRST positional argument -- so the guard compared a commit to
// itself, found 0 changed paths, and reported "clean" on every input. Caught by
// running it against a known revert and getting green.
const skipValueAt = limitIdx >= 0 ? limitIdx + 1 : -1;
const positional = argv.filter((a, i) => !a.startsWith('--') && i !== skipValueAt);

const BRANCH = positional[0];
const MAIN = positional[1] ?? 'main';

if (!BRANCH) {
  console.error('usage: node orch-revert-guard.mjs <branch-or-commit> [<main-ref>] [--limit N]');
  process.exit(2);
}

// blob id of <ref>:<path>, or null when the path does not exist at that ref.
const blobAt = (ref, path) => {
  const r = gitTry('rev-parse', `${ref}:${path}`);
  return r.ok ? r.out : null;
};

let base;
try {
  base = git('merge-base', MAIN, BRANCH);
} catch {
  console.error(`cannot find a merge-base between ${MAIN} and ${BRANCH}`);
  process.exit(2);
}

const changed = git('diff', '--name-only', `${base}..${BRANCH}`)
  .split('\n').map((s) => s.trim()).filter(Boolean);

console.log(`revert guard: ${BRANCH} vs ${MAIN}`);
console.log(`  merge-base ....... ${base}`);
console.log(`  paths changed .... ${changed.length}`);
console.log('');

// REFUSE ON AN EMPTY DENOMINATOR. Added 2026-09-10 (clock NOT read; between 02:59 and 04:03) after the exact
// failure at 02:52: I ran `scripts/revert-guard.mjs 95bb03e 3c46e46` — the
// arguments REVERSED, older sha first. Both tools take (<ref>, <target>) in the
// same order, so that asked "does 95bb03e revert anything relative to 3c46e46",
// and 95bb03e is an ANCESTOR of 3c46e46, so the range was empty and it reported
// "paths changed 0 ... 0 REVERTS". A clean verdict from a check that walked
// nothing, byte-for-byte identical to the verdict I was hoping for, as the last
// instrument before the remote. The only thing that caught it was a plausibility
// judgement I made outside the tool (zero paths across eight commits is
// impossible on its face), and that will not fire the day the wrong answer
// happens to be plausible.
//
// NOTE THE NEAR-MISS INSIDE THE REPAIR: the first draft of this comment said the
// two tools take their arguments in OPPOSITE orders. They do not — `revert-guard
// .mjs:169-170` is `positional[0]` then `positional[1] ?? 'origin/main'`, the
// same shape as `:77-78` here. A wrong explanation bolted onto a correct fix
// survives because the fix works.
//
// A CHECK THAT CANNOT DISTINGUISH "I LOOKED AND FOUND NOTHING" FROM "I LOOKED
// AT NOTHING" IS NOT A CHECK. Printing the denominator was necessary and was
// already here; it was not sufficient, because a printed 0 still reads as green
// to a reader scanning for the REVERTS line. So the zero has to REFUSE.
//
// A genuinely empty range is not a thing worth pushing, so nothing legitimate
// is lost: if BRANCH is already merged into MAIN there is no push to guard.
if (changed.length === 0) {
  console.log('REFUSING: the diff range is EMPTY — 0 paths between the merge-base');
  console.log(`and ${BRANCH}. This guard examined nothing, so its silence about reverts`);
  console.log('is not evidence about reverts.');
  console.log('');
  console.log('MOST LIKELY CAUSE: the arguments are REVERSED. Usage is');
  console.log('  node orch-revert-guard.mjs <branch-or-commit> [<main-ref>]');
  console.log('— the NEW sha first, the one being pushed. Give the older sha first and');
  console.log('the range is empty, because the older sha is an ancestor. That is exactly');
  console.log('how this produced a meaningless green at 02:52 on 2026-09-10.');
  process.exit(3);
}

const findings = [];
let forward = 0;
// Reported separately from both forward edits and reverts: a derived path whose
// content matches an older blob because the Pulse recomputed it. Counted and
// NAMED rather than folded into "forward", so the summary can never hide that
// the comparison matched and a judgement was made about it.
const recomputed = [];
let agreed = 0;

for (const path of changed) {
  const bBranch = blobAt(BRANCH, path);
  const bMain = blobAt(MAIN, path);

  if (bBranch !== null && bBranch === bMain) { agreed++; continue; }

  // Commits on main that touched this path, newest first. If main never moved
  // the path since the merge-base there is nothing to revert PAST, but an older
  // state can still predate the base, so walk the whole path history.
  const hist = gitTry('rev-list', `--max-count=${LIMIT}`, MAIN, '--', path);
  if (!hist.ok || !hist.out) { forward++; continue; }

  const commits = hist.out.split('\n').map((s) => s.trim()).filter(Boolean);

  let hit = null;
  for (const c of commits) {
    if (c === base) continue;              // the state the branch started from
    const bOld = blobAt(c, path);
    if (bOld === null) continue;
    if (bOld === bBranch) { hit = c; break; }
  }

  if (!hit) { forward++; continue; }

  // It matches an older state of main. Confirm main DELIBERATELY moved past that
  // state -- i.e. there is at least one commit touching this path between the
  // matched ancestor and main. Without this a no-op would look like a revert.
  const since = gitTry('log', '--oneline', `${hit}..${MAIN}`, '--', path);
  const supersedingCommits = since.ok && since.out
    ? since.out.split('\n').filter(Boolean)
    : [];

  if (supersedingCommits.length === 0) { forward++; continue; }

  // A DERIVED PATH CAN LEGITIMATELY RETURN TO AN EARLIER VALUE, AND BLOB
  // EQUALITY CANNOT TELL THAT FROM A RESTORED BLOB.
  //
  // data/derived/ is documented as a PURE FUNCTION of state: "Every Pulse run
  // recomputes it from scratch, so a re-run with no world change is
  // byte-identical." So a counter that goes 1 -> 0 -> 1 is three correct
  // recomputations, not a revert -- and this check, which compares CONTENT,
  // sees the third as a restoration of the first.
  //
  // MEASURED 2026-09-08, which is why this exists: the guard refused a push over
  // data/derived/freshness.json where the ONLY difference was
  // link_check.checked 0 -> 1. The 12:00 Pulse computed 1, a Desk job's records
  // commit wrote 0 at 16:29, and the 18:01 Pulse computed 1 again. Nothing was
  // restored; the Pulse recomputed and got what it got.
  //
  // THE FIX IS NOT AN EXEMPTION. Exempting data/derived/ would blind the guard
  // to lvba's own shape -- a JOB restoring derived state to a stale baseline is
  // exactly the failure this file was written for, and it lives under this very
  // prefix. So the discriminator is the WRITER, which is mechanical: if the last
  // commit touching this path on the branch is a Pulse run, the content is a
  // recomputation; if it is anything else, it is a restoration and still
  // refuses.
  //
  // And the reason to bother rather than to keep refusing: a guard that fires on
  // every Pulse commit gets silenced within the week, and then it is not
  // protecting anything. Narrowing what the instrument CLAIMS is not the same as
  // widening what it PERMITS.
  if (path.startsWith('data/derived/')) {
    const lastWriter = gitTry('log', '-1', '--format=%h %s', BRANCH, '--', path);
    const subject = lastWriter.ok ? (lastWriter.out || '').trim() : '';
    if (/^\S+\s+pulse:/.test(subject)) {
      recomputed.push({ path, ancestor: hit, writer: subject, bBranch, bMain });
      continue;
    }
    findings.push({
      path, ancestor: hit, superseding: supersedingCommits, bBranch, bMain,
      note: `derived path, but its last writer on the branch is NOT a Pulse run: ${subject || 'unknown'}`,
    });
    continue;
  }

  findings.push({ path, ancestor: hit, superseding: supersedingCommits, bBranch, bMain });
}

console.log(`  unchanged vs main ......... ${agreed}`);
console.log(`  forward edits ............. ${forward}`);
console.log(`  derived recomputations .... ${recomputed.length}`);
console.log(`  REVERTS ................... ${findings.length}`);
console.log('');

for (const r of recomputed) {
  console.log(`derived recomputation (NOT a revert): ${r.path}`);
  console.log(`  content equals the blob at ${r.ancestor.slice(0, 7)}, but data/derived/ is a pure`);
  console.log(`  function of state, so a value may legitimately return to an earlier one.`);
  console.log(`  last writer on the branch is a Pulse run: ${r.writer}`);
  console.log('');
}

for (const f of findings) {
  console.log(`REVERT: ${f.path}`);
  if (f.note) console.log(`  ${f.note}`);
  console.log(`  the branch's content equals this path's blob at ${f.ancestor.slice(0, 7)}`);
  console.log(`  branch blob ${String(f.bBranch).slice(0, 12)}   main blob ${String(f.bMain).slice(0, 12)}`);
  console.log(`  main has deliberately moved this path ${f.superseding.length} time(s) since:`);
  for (const c of f.superseding.slice(0, 6)) console.log(`    ${c}`);
  console.log('');
}

if (findings.length) {
  console.log('REFUSE THE PUSH. A revert is internally consistent, so every gate passes;');
  console.log('that is why this check exists separately. If the revert is intended, say so');
  console.log('explicitly and re-run with the decision recorded -- do not silence the check.');
  process.exit(1);
}

console.log('clean: nothing restores a superseded state.');
process.exit(0);
