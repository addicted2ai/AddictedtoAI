// Lint a brief AGAINST THE TREE THE JOB WILL RUN IN.
//
// brief-lint resolves the Files list against the current directory, so linting a
// branch packet's brief from main reports every branch-only path as MISSING. The
// refusal is correct about what it measured and wrong about what I meant: the
// lease suite exists in `D:/addictedtoai-worktrees/pulse-lease`, not on main.
//
// A CHECK RUN AGAINST THE WRONG TREE IS NOT A LOOSER CHECK, IT IS A CHECK OF A
// DIFFERENT SUBJECT — and the fix is to point it at the right subject, never to
// mark a real file "(new)" to quiet it. That would be repairing my prose to suit
// a check that was reading the wrong directory, which is the check shaping the
// artifact rather than guarding it.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const [, , brief, sha, tree, ...rest] = process.argv;
if (!brief || !sha || !tree) {
  console.error('usage: node arch-lint-brief.mjs <brief.md> <authority-sha> <tree> [--revision|--review]');
  process.exit(2);
}
if (!existsSync(tree)) throw new Error(`REFUSED: tree does not exist — ${tree}`);
const linter = `${tree}/scripts/brief-lint.mjs`;
if (!existsSync(linter)) throw new Error(`REFUSED: no linter in that tree — ${linter}. Linting with main's copy against another tree's files would mix two subjects.`);

console.log(`linting ${brief}\n  against tree ${tree}\n  with that tree's own linter`);
try {
  const out = execFileSync(process.execPath, [linter, brief, sha, ...rest], { cwd: tree, encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.log(`${e.stdout ?? ''}${e.stderr ?? ''}`);
  process.exit(e.status ?? 1);
}
