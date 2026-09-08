// The 2026-08-31 cohort: 37 of the 100 open beads, the fat end of the barbell.
//
// THE QUESTION THIS ANSWERS IS NARROW AND I WANT IT STATED: which of these has
// anyone LOOKED AT since filing, and which has never been touched? That is a
// proxy for staleness, not a measurement of it. A bead re-triaged on 09-04 and
// confirmed STANDS is live; a bead never updated since 08-31 is UNKNOWN, not
// dead. Closing anything requires checking the tree, one at a time.
import { execFileSync } from 'node:child_process';

const BD = 'C:/Users/BadBitch/AppData/Roaming/npm/node_modules/@beads/bd/bin/bd.js';
const all = JSON.parse(execFileSync(process.execPath, [BD, 'list', '--all', '--json'], {
  cwd: 'D:/AddictedtoAI', encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: false,
}));

const cohort = all.filter((i) => i.status !== 'closed' && String(i.created_at).slice(0, 10) === '2026-08-31');
console.log(`open beads created 2026-08-31: ${cohort.length}`);
console.log('');

const touched = [];
const untouched = [];
for (const i of cohort) {
  const u = String(i.updated_at ?? '').slice(0, 10);
  (u && u !== '2026-08-31' ? touched : untouched).push(i);
}

console.log(`RE-TRIAGED SINCE FILING (updated_at moved): ${touched.length}`);
for (const i of touched.sort((a, b) => a.priority - b.priority)) {
  const hasStands = /TRIAGE[^]{0,80}STANDS|STANDS\b/i.test(String(i.notes ?? ''));
  console.log(`  ${i.id.replace('addictedtoai-', '').padEnd(6)} P${i.priority} upd ${String(i.updated_at).slice(0, 10)} ${hasStands ? '[confirmed STANDS]' : '[touched, no STANDS note]'}`);
  console.log(`      ${i.title.slice(0, 88)}`);
}
console.log('');
console.log(`NEVER TOUCHED SINCE FILING: ${untouched.length}  <-- the staleness candidates`);
for (const i of untouched.sort((a, b) => a.priority - b.priority)) {
  console.log(`  ${i.id.replace('addictedtoai-', '').padEnd(6)} P${i.priority}  ${i.title.slice(0, 92)}`);
}
