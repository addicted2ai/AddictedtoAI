// Refuse to mutate a tree that somebody else is already writing to.
//
// WHY THIS EXISTS. My `orch-mutate-*.mjs` family modifies a tracked file in the
// LIVE repository, runs a check, and restores it. That is safe exactly while
// nothing else is touching the tree, and nothing enforced it — the scripts open
// with a COMMENT saying "no job is running; the tree was verified clean first",
// which is a claim about the moment the script was written, not a check made at
// the moment it runs.
//
// A2AI-Fable-Arch built `requireQuietWorktree` for the same exposure after a
// worker went live in a worktree three of its scripts write to. I said my
// throwaway-command rule "has failed three times, so it is not working as a
// rule" and that I had no mechanism. This is the mechanism for the half of it
// that is mechanisable.
//
// A COMMENT ASSERTING A PRECONDITION IS A PRECONDITION NOBODY CHECKS. It also
// ages into a lie for free: the tree WAS clean when it was written.
//
// WHAT COUNTS AS QUIET, and the choice is deliberate:
//   - a MODIFIED TRACKED file refuses. That is somebody's work in progress, or
//     a previous run of one of these scripts that died before restoring.
//   - an UNTRACKED file does NOT refuse. Reports, scratch output and `.agents/`
//     leftovers are not mine to adjudicate, and refusing on them would make the
//     guard unusable in a tree that always has some — which is how a guard gets
//     switched off. Same reasoning A2AI-Fable-Arch gave, reached separately.
//   - the file the caller is ABOUT to mutate must itself be clean, checked by
//     name, because "the tree is quiet apart from the file I am about to
//     overwrite" is the exact state a half-finished earlier run leaves behind.

import { execFileSync } from 'node:child_process';

// STANDING STATE IS NOT ACTIVITY, AND THE FIRST VERSION OF THIS GUARD COULD NOT
// TELL THEM APART. Measured immediately after writing it: `D:/AddictedtoAI` has
// TWELVE modified tracked entries — the `.agents/skills/**` deletions, which are
// the maintainer's and have stood all night. So the guard refused the main tree
// unconditionally and forever, which would have made every mutation script
// unrunnable exactly where they are used. **A GUARD THAT REFUSES ITS PRIMARY
// SUBJECT ON PERMANENT BACKGROUND STATE GETS DELETED, NOT OBEYED** — the same
// over-broad arm I built at 02:08 tonight against any live `--test` process and
// had to narrow, rebuilt four hours later in a different file.
//
// The repair is NOT to ignore those paths silently. `expected` is supplied BY
// THE CALLER, printed, and counted separately, so the exception is visible at
// the call site instead of buried in the guard — an allowlist nobody can see is
// indistinguishable from a guard that does not work.
export function requireQuietTree(root, targets = [], expected = []) {
  let porcelain;
  try {
    porcelain = execFileSync('git', ['-C', root, 'status', '--porcelain'], {
      encoding: 'utf8', shell: false,
    });
  } catch (e) {
    console.error(`REFUSING: cannot read the tree state of ${root}.`);
    console.error(`  ${String(e.message).split('\n')[0]}`);
    console.error('  A guard that cannot see the tree must refuse, not assume it is quiet.');
    process.exit(3);
  }

  // THE ALLOWLIST WAS NEVER ITSELF THE SUBJECT, AND THAT IS THE WHOLE DEFECT.
  // A2AI-Fable-Arch found the identical over-broad arm in its own worktree guard
  // and could not have seen it, because it only ever pointed that guard at fresh
  // worktrees while I pointed mine at main: **a mechanism proved only against the
  // subjects it happens to be used on is proved against a sample drawn from the
  // same intuition that wrote the code.** So I pointed this one at its own
  // parameter. `expected: ['']` — one plausible caller typo — made a tree with a
  // worker MID-WRITE report `standing 1 / UNEXPLAINED 0` and ALLOW, printing
  // `standing (declared) 1 []`, which reads as *no prefixes declared* at the
  // exact moment one prefix is matching every path in the repository.
  //
  // Direction matters here. A prefix too NARROW (a typo like `.agent/`) matches
  // nothing and the guard stays strict — it fails safe, and is only reported. A
  // prefix too BROAD silently disarms the guard while still printing a green, so
  // it refuses. Universal prefixes are enumerated rather than inferred, because a
  // clever rule about "matches everything" would itself need proving.
  const UNIVERSAL = new Set(['', '.', './', '/', '*', '**']);
  const bad = expected.filter((p) => UNIVERSAL.has(String(p).trim()));
  if (bad.length > 0) {
    console.error(`REFUSING: ${bad.length} declared prefix(es) match EVERY path: ${bad.map((p) => JSON.stringify(p)).join(' ')}`);
    console.error('  An allowlist entry that matches everything is not an exception, it is an off switch,');
    console.error('  and it prints as a green. Name the paths that actually stand.');
    process.exit(3);
  }

  const lines = porcelain.split('\n').map((l) => l.trimEnd()).filter(Boolean);
  const allModified = lines.filter((l) => !l.startsWith('??'));
  const untracked = lines.length - allModified.length;
  // THESE ARE PATHS, NOT STRINGS, AND `startsWith` DOES NOT KNOW THAT.
  //
  // Found by applying A2AI-Fable-Arch's fifth rung — a proof chosen to be easy
  // without anyone choosing it, because the natural example is the canonical
  // spelling and the canonical spelling is the safe one. Every prefix this guard
  // had ever been proved with was `.agents/`, `standing.txt` or a whole test
  // filename: each either ends in a separator or IS a complete path, and neither
  // shape can exercise a prefix that stops mid-name.
  //
  // MEASURED on a decoy with three modified files under `scripts/`: declaring
  // `scripts/brief` counted TWO of them as standing — `scripts/brief.mjs`, which
  // the caller meant, and `scripts/briefing-unrelated.mjs`, WHICH IT NEVER NAMED.
  // A caller exempting one file silently exempted a sibling, and the only thing
  // in the output that would ever have revealed it was a `=2` where a reader
  // expected `=1`.
  //
  // The repair is path semantics, and it fails SAFE in the direction that
  // matters: a mid-name prefix now matches NOTHING, so the file it was meant to
  // cover lands in UNEXPLAINED and the guard refuses, while the printed
  // `(MATCHED NOTHING)` says why. The alternative — refusing any prefix that is
  // not a directory — would have been the over-broad arm a fourth time.
  const matches = (path, p) => path === p || path.startsWith(p.endsWith('/') ? p : `${p}/`);
  const isExpected = (l) => expected.some((p) => matches(l.slice(3), p));
  const standing = allModified.filter(isExpected);
  const modified = allModified.filter((l) => !isExpected(l));

  // PRINT THE DENOMINATOR. A guard that says only "clean" cannot be told apart
  // from one that looked at nothing — the night's first rule, applied here.
  console.log(`quiet-tree check on ${root}`);
  console.log(`  entries seen ....... ${lines.length}`);
  console.log(`  modified tracked ... ${allModified.length}`);
  // Each prefix printed QUOTED and with its own hit count. The unquoted joined
  // form is what let `['']` render as `[]`; and a prefix matching zero entries is
  // a declaration that did nothing, which the caller should see rather than
  // discover the next time the tree is genuinely dirty.
  const tally = expected.map((p) => {
    // SAME PREDICATE, ONE HOME. This tally used its own copy of `startsWith`,
    // so the path-semantics repair above would have left the printed hit count
    // reporting the OLD rule — a guard and its own report disagreeing about what
    // was counted, which is the shape that has bitten twice tonight already.
    const n = allModified.filter((l) => matches(l.slice(3), p)).length;
    return `${JSON.stringify(p)}=${n}${n === 0 ? ' (MATCHED NOTHING)' : ''}`;
  });
  console.log(`  standing (declared)  ${standing.length}${expected.length ? ` [${tally.join(' ')}]` : ' [none declared]'}`);
  console.log(`  UNEXPLAINED ........ ${modified.length}`);
  console.log(`  untracked (ignored)  ${untracked}`);

  if (modified.length > 0) {
    console.error('');
    console.error(`REFUSING: ${modified.length} modified tracked file(s) in ${root}.`);
    for (const m of modified.slice(0, 20)) console.error(`    ${m}`);
    console.error('');
    console.error('  Somebody is writing to this tree, or an earlier mutation script died');
    console.error('  before restoring. Either way a mutate-and-restore run would overwrite');
    console.error('  their work and then "restore" the tree to MY idea of the original.');
    console.error('  NO OVERRIDE: a knob here silences the one condition this exists for.');
    process.exit(3);
  }

  for (const t of targets) {
    const rel = t.startsWith(root) ? t.slice(root.length).replace(/^\//, '') : t;
    if (lines.some((l) => l.includes(rel))) {
      console.error(`REFUSING: the target ${rel} is not clean.`);
      process.exit(3);
    }
  }

  console.log('  quiet — proceeding.');
}
