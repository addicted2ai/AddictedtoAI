// PROVE THE PATH-SEMANTICS REPAIR, INCLUDING THE ARM WHERE THE OLD PREDICATE
// MADE THE GUARD RETURN QUIET ON A TREE WITH AN UNDECLARED MODIFIED FILE.
//
// Orch's decoy showed the count going 2 -> 0. That is the defect but it is the
// SOFT version of it: in Orch's arrangement the guard refused either way and
// only the printed number differed. The version that costs work is the one
// below, arm B — every modified file happens to be swallowed by the mid-name
// prefix, `unexplained` reaches ZERO, and requireQuietWorktree RETURNS TRUE on
// a tree somebody is working in. That is the whole reason the guard exists.
//
// A TWIN PROVES A CHECK CAN FIRE, ONLY A MUTATION PROVES IT MUST — so each arm
// runs the OLD predicate and the NEW one over the same real git status, and
// reports both. Reimplementing the old rule here is not duplication: it is the
// only way to show the repair changed the verdict rather than merely being
// present.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { requireQuietWorktree } from './worktree-guard.mjs';

const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });

function decoy(files, modify) {
  const root = mkdtempSync(join(tmpdir(), 'arch-guard-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 'proof@local');
  git(root, 'config', 'user.name', 'proof');
  for (const f of files) {
    const p = join(root, f);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, 'original\n', 'utf8');
  }
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'base');
  for (const f of modify) writeFileSync(join(root, f), 'MODIFIED BY A WORKER\n', 'utf8');
  return root;
}

// The rule as it stood until 05:33. Kept only to show what it decided.
const OLD = (p, e) => p === e || p.startsWith(e);

function oldVerdict(root, expected) {
  const status = git(root, 'status', '--porcelain');
  const modified = status.split('\n').filter((l) => l.trim() && !l.startsWith('??'));
  const pathOf = (l) => { const p = l.slice(3); const i = p.indexOf(' -> '); return i < 0 ? p : p.slice(i + 4); };
  const unexplained = modified.filter((l) => !expected.some((e) => OLD(pathOf(l), e)));
  return { modified: modified.length, standing: modified.length - unexplained.length, unexplained: unexplained.length };
}

function newVerdict(root, expected) {
  try {
    requireQuietWorktree(root, undefined, { expected });
    return 'RETURNED QUIET';
  } catch (err) {
    return `REFUSED — ${String(err.message).split('\n')[0]}`;
  }
}

const ARMS = [
  {
    name: 'A  boundary, mid-name prefix, one sibling undeclared beyond it',
    files: ['scripts/brief.mjs', 'scripts/briefing-unrelated.mjs', 'scripts/other.mjs'],
    modify: ['scripts/brief.mjs', 'scripts/briefing-unrelated.mjs', 'scripts/other.mjs'],
    expected: ['scripts/brief'],
    want: 'REFUSED',
  },
  {
    name: 'B  THE LIVE DEFECT — mid-name prefix swallows every modified file',
    files: ['scripts/brief.mjs', 'scripts/briefing-unrelated.mjs'],
    modify: ['scripts/brief.mjs', 'scripts/briefing-unrelated.mjs'],
    expected: ['scripts/brief'],
    want: 'REFUSED',
  },
  {
    name: 'C  directory prefix WITH separator still matches under it',
    files: ['.agents/skills/a.md', '.agents/skills/b.md'],
    modify: ['.agents/skills/a.md', '.agents/skills/b.md'],
    expected: ['.agents/'],
    want: 'RETURNED QUIET',
  },
  {
    name: 'D  directory prefix WITHOUT separator still matches under it',
    files: ['.agents/skills/a.md', '.agents/skills/b.md'],
    modify: ['.agents/skills/a.md', '.agents/skills/b.md'],
    expected: ['.agents'],
    want: 'RETURNED QUIET',
  },
  {
    name: 'E  exact whole-path declaration still matches itself',
    files: ['standing.txt', 'other.txt'],
    modify: ['standing.txt'],
    expected: ['standing.txt'],
    want: 'RETURNED QUIET',
  },
  {
    name: 'F  too-narrow prefix fails SAFE (matches nothing, refuses, says why)',
    files: ['.agents/skills/a.md'],
    modify: ['.agents/skills/a.md'],
    expected: ['.agent/'],
    want: 'REFUSED',
  },
  {
    name: 'G  universal token still refused before any matching happens',
    files: ['a.txt'],
    modify: ['a.txt'],
    expected: [''],
    want: 'REFUSED',
  },
  {
    name: 'H  quiet tree with nothing declared still returns quiet',
    files: ['a.txt'],
    modify: [],
    expected: [],
    want: 'RETURNED QUIET',
  },
];

let pass = 0;
let fail = 0;
for (const arm of ARMS) {
  const root = decoy(arm.files, arm.modify);
  const before = arm.expected.some((e) => e === '') ? null : oldVerdict(root, arm.expected);
  const got = newVerdict(root, arm.expected);
  const ok = got.startsWith(arm.want);
  if (ok) pass++; else fail++;
  const oldTxt = before
    ? `old: ${before.modified} mod / ${before.standing} standing / ${before.unexplained} unexplained -> ${before.unexplained === 0 ? 'WOULD HAVE RETURNED QUIET' : 'would have refused'}`
    : 'old: n/a (refused earlier, at the universal-token check)';
  console.log(`${ok ? 'ok  ' : 'NOT OK'} ${arm.name}`);
  console.log(`       ${oldTxt}`);
  console.log(`       new: ${got}`);
  rmSync(root, { recursive: true, force: true });
}
console.log(`\narms ${ARMS.length}  pass ${pass}  fail ${fail}`);
if (fail > 0) process.exit(1);
