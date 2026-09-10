// REFUSE TO MUTATE A WORKTREE SOMEBODY ELSE IS IN.
//
// Written 2026-09-10 after A2AI-Orch re-ran its own timestamp fixer by accident
// and it corrupted the header of the file about corrupted timestamps. The
// general form it drew from that is the reason this file exists:
//
//   A ONE-SHOT REPAIR SCRIPT IS A LOADED GUN THE MOMENT ITS JOB IS DONE.
//
// My scripts are not repairs, they are verifiers, and that makes them worse in
// one specific way: they are DESIGNED to be re-run, they WRITE to a tracked
// file in a live worktree, and they restore at the end. Re-run while a worker
// is in that worktree, one of them overwrites the worker's file mid-flight and
// then "restores" it to a state the worker never wrote. The worker's work is
// gone and nothing anywhere says so.
//
// I said this was "recorded, not fixed, and I am saying so rather than claiming
// I will be careful". Saying it is what a preference restated after each failure
// looks like, so here is the mechanism instead. It is deliberately not clever:
// a dirty tree means somebody else is working, and a verifier has no business
// there.
//
// ---------------------------------------------------------------------------
// THE DEFECT THIS FILE HAD UNTIL 04:47, FOUND BY A2AI-Orch IN ITS OWN COPY AND
// REPORTED TO ME BEFORE IT COULD BITE MINE.
//
// The original predicate refused on ANY modified tracked file. Pointed at a
// fresh worktree that is right. Pointed at D:/AddictedtoAI it refuses forever
// and unconditionally: the maintainer's twelve .agents/skills/** deletions have
// stood in that tree all night and are not going away. A guard that refuses its
// primary subject on permanent background state is not a strict guard, it is an
// unusable one — and the next person to meet it deletes it rather than obeys it.
// Orch's copy had to be repaired after exactly that.
//
// The repair is an allowlist the CALLER supplies, never a path list hidden
// inside the guard: an allowlist nobody can see is indistinguishable from a
// guard that does not work. Declared paths are counted and PRINTED as standing,
// separately from the unexplained ones, so a reader can tell which of the two
// happened.
//
// The caller declares because the caller is the one who knows which mess is
// background and which is a worker mid-write. My verifiers point at fresh
// worktrees and declare nothing, so this changes none of their behaviour — and
// that is the point. The defect was LATENT, and a latent defect in a guard is
// the kind you find by being told rather than by running it.
import { execFileSync } from 'node:child_process';

/**
 * Refuse unless `tree` is a quiet git worktree at the expected commit.
 *
 * @param {string} tree            worktree root
 * @param {string} [expectHead]    optional short sha the tree must be at
 * @param {object} [opts]
 * @param {string[]} [opts.expected]  path prefixes whose modification is KNOWN
 *   background state and must not refuse. Declared by the caller, printed in
 *   full on every call, and counted apart from the unexplained.
 */
export function requireQuietWorktree(tree, expectHead, opts = {}) {
  const expected = opts.expected ?? [];
  let status;
  try {
    status = execFileSync('git', ['-C', tree, 'status', '--porcelain'], { encoding: 'utf8' });
  } catch (err) {
    throw new Error(`REFUSED: cannot read the state of ${tree} — ${err?.message ?? err}`);
  }
  // Untracked files are somebody's report or scratch and are not mine to judge;
  // a MODIFIED TRACKED FILE is the signal that a worker is mid-edit.
  const modified = status.split('\n').filter((l) => l.trim() && !l.startsWith('??'));

  // A porcelain line is two status characters, a space, then the path; a rename
  // carries "old -> new" and the NEW path is the one that was written.
  const pathOf = (l) => {
    const p = l.slice(3);
    const i = p.indexOf(' -> ');
    return i < 0 ? p : p.slice(i + 4);
  };
  // A UNIVERSAL PREFIX TURNS THE GUARD OFF AND THE OUTPUT DOES NOT SAY SO.
  // Found by A2AI-Orch at 04:52, in the parameter it had added an hour earlier
  // and I had adopted verbatim minutes before: `''` and `'.'` match every path,
  // so one plausible caller typo makes every modification "standing" and the
  // guard reports quiet on a tree with a worker mid-write. Worse, `join(', ')`
  // renders `['']` as an EMPTY declared-list, so the line reads as NOTHING
  // DECLARED at the exact moment one prefix is matching everything.
  //
  // The two directions are deliberately NOT symmetric, which is the substance:
  //   too BROAD refuses — an enumerated token list, never a clever
  //     matches-everything predicate, because that predicate would itself need
  //     proving and nothing would prove it;
  //   too NARROW only reports — `.agent/` for `.agents/` matches nothing, the
  //     guard stays strict and fails SAFE, and refusing that direction too
  //     would be the over-broad arm a third time in one night.
  const UNIVERSAL = ['', '.', './', '/', '*', '**'];
  const universal = expected.filter((e) => UNIVERSAL.includes(e));
  if (universal.length > 0) {
    throw new Error(
      `REFUSED: ${tree} — the declared allowlist contains ${universal.map((e) => JSON.stringify(e)).join(', ')}, which matches every path in the tree.\n`
      + 'That does not declare background state, it turns this guard off, and the printed line would read as though nothing were declared.',
    );
  }

  // STARTSWITH IS A STRING PREDICATE AND THESE ARE PATHS. Found by A2AI-Orch at
  // 05:29 in its own copy, minutes after I named the rung that predicts it, and
  // present here verbatim — the third defect of Orch's that was also in mine.
  //
  // `scripts/brief` counted TWO files as standing: `scripts/brief.mjs`, which
  // the caller meant, and `scripts/briefing-unrelated.mjs`, WHICH IT NEVER
  // NAMED. A caller exempting one file silently exempted a sibling, and the only
  // thing in the output that would ever have revealed it was a `=2` where the
  // reader expected `=1`.
  //
  // THE PROOF POOL WAS SELECTED WITHOUT ANYBODY SELECTING IT, and that is the
  // rung this belongs to. Every prefix this guard had EVER been proved with was
  // `.agents/`, `standing.txt`, or a whole test filename — each either ends in a
  // separator or IS a complete path. NEITHER SHAPE CAN EXERCISE A PREFIX THAT
  // STOPS MID-NAME. Nobody chose to avoid that shape; it simply never occurs
  // when you write the natural example. §7n says a mechanism is proved against a
  // sample chosen by its author; this says the sample can be skewed with no
  // author choosing, because the examples that come to hand share a shape.
  //
  // Path semantics, and it fails SAFE in the same asymmetric way as the
  // universal-token refusal above: a mid-name prefix now matches NOTHING, so the
  // file it meant lands in UNEXPLAINED, the guard refuses, and (MATCHED NOTHING)
  // prints the reason. Refusing every non-directory prefix outright would have
  // been the over-broad arm a fourth time in one night.
  //
  // ONE predicate, used by both the classification and the tally line below.
  // Until now the tally had its OWN copy of the old rule, so repairing one and
  // not the other would have left a guard and its own report disagreeing about
  // what was counted — the two-homes shape twice in one file.
  const matches = (p, e) => {
    const base = e.endsWith('/') ? e.slice(0, -1) : e;
    return p === base || p.startsWith(`${base}/`);
  };
  const declared = (p) => expected.some((e) => matches(p, e));
  const standing = modified.filter((l) => declared(pathOf(l)));
  const unexplained = modified.filter((l) => !declared(pathOf(l)));

  // Printed on every call, refusal or not. The count that matters is the second
  // one, and a reader who cannot see the first cannot tell a working guard from
  // a guard whose allowlist has quietly swallowed the tree. Each prefix is
  // QUOTED and carries its own hit count, because an unquoted join cannot show
  // the difference between a prefix that is empty and no prefix at all.
  const decl = expected.length
    ? ` — declared: ${expected.map((e) => {
      const hits = modified.filter((l) => matches(pathOf(l), e)).length;
      return `${JSON.stringify(e)}=${hits}${hits === 0 ? ' (MATCHED NOTHING)' : ''}`;
    }).join(', ')}`
    : ' — nothing declared';
  console.error(`guard ${tree}: ${modified.length} modified tracked, ${standing.length} standing (declared), ${unexplained.length} UNEXPLAINED${decl}`);

  if (unexplained.length > 0) {
    throw new Error(
      `REFUSED: ${tree} has ${unexplained.length} modified tracked file(s) nobody declared, so somebody is working in it:\n`
      + unexplained.map((l) => `  ${l}`).join('\n')
      + (standing.length ? `\n(${standing.length} further modification(s) were declared as standing background state.)` : '')
      + '\nThis script writes to a tracked file and restores it afterwards. Running it now would'
      + '\noverwrite that work and then "restore" a state nobody wrote.',
    );
  }
  if (expectHead) {
    const head = execFileSync('git', ['-C', tree, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
    if (!head.startsWith(expectHead) && !expectHead.startsWith(head)) {
      throw new Error(`REFUSED: ${tree} is at ${head}, not ${expectHead} — the measurement would be about a different tree.`);
    }
  }
  return true;
}
