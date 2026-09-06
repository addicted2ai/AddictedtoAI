/**
 * Append the three local runs — feed measurement, quote check, built-site scan
 * — to the fetch transcript, so one file carries the whole job's evidence.
 * Each section is the command's real stdout, captured here and not retyped.
 */
import { appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = 'D:/addictedtoai-worktrees/j-20260905-24';
const OUT = `${ROOT}/data/reviews/evidence/verify-design-arena-republication-terms.raw.txt`;

const RUNS = [
  ['node tools/measure-design-arena.mjs', `${ROOT}/tools/measure-design-arena.mjs`, []],
  ['node tools/measure-design-arena-history.mjs', `${ROOT}/tools/measure-design-arena-history.mjs`, []],
  ['node tools/check-quotes.mjs', `${ROOT}/tools/check-quotes.mjs`, []],
  ['node tools/scan-out-for-design-arena.mjs', `${ROOT}/tools/scan-out-for-design-arena.mjs`, []],
];

for (const [label, script, args] of RUNS) {
  const stdout = execFileSync(process.execPath, [script, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
  appendFileSync(OUT, `\n==== ${label}\n${stdout}`);
  console.log(`appended ${label} (${stdout.length} chars)`);
}
