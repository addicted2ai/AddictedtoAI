// Every commit sha a durable document cites must RESOLVE and be REACHABLE from a ref.
// An amended commit still resolves as a dangling object, so `git cat-file -t` passing is
// not the check - it is the check that a reader following the citation will land on
// something git eventually garbage-collects. Read-only; takes any file path.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const REPO = 'D:/AddictedtoAI';
const FILE = process.argv[2];
const text = fs.readFileSync(FILE, 'utf8');

// A hex run is only a sha candidate if it mixes digits and a-f; this keeps out decimal
// numbers, `deadbeef`-style words and pure-letter tokens.
const shas = [...new Set([...text.matchAll(/\b[0-9a-f]{7,40}\b/g)].map((m) => m[0])
  .filter((s) => /\d/.test(s) && /[a-f]/.test(s)))];

const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8' }).trim();

console.log(`${FILE}\ncandidate shas: ${shas.length}\n`);
let bad = 0;
for (const s of shas) {
  let type = null;
  try { type = git('cat-file', '-t', s); } catch { console.log(`  ${s}  DOES NOT EXIST`); bad++; continue; }
  if (type !== 'commit') { console.log(`  ${s}  not a commit (${type})`); continue; }
  let reachable = '';
  try { reachable = git('branch', '-a', '--contains', s); } catch { reachable = ''; }
  if (!reachable) bad++;
  const subj = git('log', '-1', '--format=%s', s).slice(0, 58);
  const files = git('show', '--name-only', '--format=', s).split('\n').filter(Boolean);
  const touches = files.includes('FULL-MEM-LOG.md') ? ' [touches FULL-MEM-LOG.md]' : '';
  console.log(`  ${s}  ${reachable ? 'REACHABLE  ' : '*** UNREACHABLE ***  '}${subj}${touches}`);
}
console.log(`\n${bad} unreachable or missing.`);
