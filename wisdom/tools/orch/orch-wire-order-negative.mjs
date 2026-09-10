// NEGATIVE CONTROL FOR orch-wire-order-check.mjs.
//
// That checker reported "files 20, guard-before-action 20, TOO LATE 0, NO GUARD
// 0" and I relayed it as a proof. It is not one. Every file it examined had just
// been written by the wiring script and was correct by construction, so ALL
// TWENTY ARMS WERE CASES THAT COULD NOT FAIL — the same rung A2AI-Fable-Arch
// named from my uppercase NODE_OPTIONS, arriving in the instrument I used to
// verify the wiring rather than in the wiring itself.
//
// Three decoys, each of which MUST trip a different branch. If any of them comes
// back "ok", the checker cannot see its subject and the 20/20 meant nothing.

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const dir = mkdtempSync(`${tmpdir()}/orch-order-`).replace(/\\/g, '/');

const DECOYS = {
  // Correct: guard before the first action. Must report ok.
  'orch-mutate-good.mjs': [
    "import { readFileSync, writeFileSync } from 'node:fs';",
    "import { requireQuietTree } from './orch-require-quiet-tree.mjs';",
    '',
    "requireQuietTree('D:/AddictedtoAI', [], ['.agents/']);",
    '',
    "const original = readFileSync('D:/AddictedtoAI/x', 'utf8');",
    "writeFileSync('D:/AddictedtoAI/x', 'mutated', 'utf8');",
  ],
  // The guard is present but AFTER the file has already been read and written.
  // Must report TOO LATE.
  'orch-mutate-late.mjs': [
    "import { readFileSync, writeFileSync } from 'node:fs';",
    "import { requireQuietTree } from './orch-require-quiet-tree.mjs';",
    '',
    "const original = readFileSync('D:/AddictedtoAI/x', 'utf8');",
    "writeFileSync('D:/AddictedtoAI/x', 'mutated', 'utf8');",
    '',
    "requireQuietTree('D:/AddictedtoAI', [], ['.agents/']);",
  ],
  // No guard at all. Must report NO GUARD.
  'orch-mutate-none.mjs': [
    "import { writeFileSync } from 'node:fs';",
    '',
    "writeFileSync('D:/AddictedtoAI/x', 'mutated', 'utf8');",
  ],
};

for (const [name, lines] of Object.entries(DECOYS)) {
  writeFileSync(`${dir}/${name}`, `${lines.join('\n')}\n`, 'utf8');
}

const CHECKER = `${import.meta.dirname}/orch-wire-order-check.mjs`;
const out = execFileSync(process.execPath, [CHECKER, dir], { encoding: 'utf8', shell: false });
console.log(out.trim());

const expect = [
  [/ok\s+orch-mutate-good\.mjs/, 'good -> ok'],
  [/TOO LATE\s+orch-mutate-late\.mjs/, 'late -> TOO LATE'],
  [/NO GUARD\s+orch-mutate-none\.mjs/, 'none -> NO GUARD'],
];
console.log('');
let bad = 0;
for (const [re, label] of expect) {
  const hit = re.test(out);
  if (!hit) bad++;
  console.log(`  ${hit ? 'PASS' : 'FAIL'}  ${label}`);
}
console.log('');
console.log(bad === 0
  ? 'The checker fires on all three branches. Its 20/20 on the real family now means something.'
  : `${bad} branch(es) did not fire — the checker cannot see its subject and every green it has ever printed is void.`);

rmSync(dir, { recursive: true, force: true });
