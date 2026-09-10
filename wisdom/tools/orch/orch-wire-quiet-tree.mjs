// Wire `requireQuietTree` into the orch-mutate-* family.
//
// WHY A SCRIPT AND NOT TWENTY EDITS. Twenty hand-edits is twenty chances to put
// the wrong root in a file, and no record of which files were touched. This
// derives each file's root FROM THAT FILE and prints a per-file line, so the
// wiring is checkable afterwards rather than asserted.
//
// WHAT IT REFUSES TO GUESS, and this is the whole safety of it:
//   - a file naming ZERO or MORE THAN ONE live root is SKIPPED, loudly. Picking
//     one for it would be exactly the "a fix aimed at the named instance leaves
//     the class open" inversion — a wrong root guards the wrong tree and reads
//     like a guard.
//   - a file already carrying the import is SKIPPED. Re-running this must not
//     stack guards. THIS SCRIPT IS RE-RUNNABLE BY DESIGN, unlike the one-shot
//     fixers that had to be nailed shut after they were spent.
//
// `targets` is deliberately left EMPTY. The target-is-clean check exists for the
// case where a tree is quiet APART FROM the file about to be overwritten — but
// with `expected` limited to `.agents/`, such a file lands in UNEXPLAINED and
// already refuses. Passing targets as well would be a second copy of one fact.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const S = 'C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/b0a0272b-5058-41e7-ac66-431922257ff6/scratchpad';
const ROOT_RE = /D:\/(?:AddictedtoAI|addictedtoai-worktrees\/[A-Za-z0-9._-]+|addictedtoai-coord)/g;

// The maintainer's `.agents/skills/**` deletions have stood all night in the
// main tree. They are declared HERE, at the call site, not inside the guard.
const EXPECTED = { 'D:/AddictedtoAI': ["'.agents/'"] };

// NAMING THE FAMILY BY ITS PREFIX WAS A GUARD SCOPED TO A NAMING CONVENTION,
// NOT TO A BEHAVIOUR. Re-measuring after the first run found five more scripts
// that mutate a live tree and are not called `orch-mutate-*`: the two `84s8`
// folders, the two `memlog` ones, and `orch-drop-zen-record.mjs` — which writes
// `data/conformance.json` AND NEVER RESTORES IT. So the caller names the files.
//
// Deliberately NOT wired, and the reason matters more than the list: the coarse
// inventory also flags `orch-fixer-slices.mjs`, `orch-rereview-slices.mjs` and
// `orch-repro-worktree.mjs`. The first two write only into the scratchpad; the
// third mutates a worktree it created itself. Arming a read-only tool with a
// refusal is the over-broad arm that gets a guard switched off.
const argv = process.argv.slice(2);
const names = argv.length ? argv : readdirSync(S).filter((n) => /^orch-mutate-.*\.mjs$/.test(n));
let wired = 0, skipped = 0;

for (const name of names) {
  const path = `${S}/${name}`;
  const src = readFileSync(path, 'utf8');

  if (src.includes('orch-require-quiet-tree.mjs')) {
    console.log(`  already   ${name}`);
    skipped++;
    continue;
  }

  const roots = [...new Set((src.match(ROOT_RE) || []))];
  if (roots.length !== 1) {
    console.log(`  SKIP      ${name} — ${roots.length} distinct roots: ${roots.join(' ') || '(none)'}`);
    skipped++;
    continue;
  }
  const root = roots[0];

  const lines = src.split('\n');
  let last = -1;
  lines.forEach((l, i) => { if (/^import .* from 'node:.*';$/.test(l)) last = i; });
  if (last < 0) {
    console.log(`  SKIP      ${name} — no top-level node: import to anchor the insert`);
    skipped++;
    continue;
  }

  const exp = EXPECTED[root] ? `[${EXPECTED[root].join(', ')}]` : '[]';
  lines.splice(last + 1, 0,
    "import { requireQuietTree } from './orch-require-quiet-tree.mjs';",
    '',
    '// Refuse to mutate a tree somebody else is writing to. A comment asserting',
    '// this precondition is a precondition nobody checks.',
    `requireQuietTree('${root}', [], ${exp});`);
  writeFileSync(path, lines.join('\n'), 'utf8');
  console.log(`  wired     ${name.padEnd(36)} root=${root} expected=${exp}`);
  wired++;
}

console.log('');
console.log(`candidates ${names.length}   wired ${wired}   skipped ${skipped}`);
if (wired + skipped !== names.length) console.log('COUNTS DO NOT ADD UP — read the lines above, not this summary.');
