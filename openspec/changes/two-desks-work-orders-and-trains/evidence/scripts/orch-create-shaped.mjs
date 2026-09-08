// Which open site beads are CREATE-SHAPED — i.e. fleet-safe?
//
// THE RULE THIS ENCODES, measured rather than assumed: a fleet edit to a piece
// that carries a review record turns verify-launch `mismatched`, and only the
// Desk writes the record that clears it. A NEW file carries no record, so it
// reports unbound/missing, and verify-launch.mjs:531 says in its own words that
// missing and unbound "fail nothing". So creates are the fleet's lane.
//
// THIS IS A TRIAGE FILTER, NOT A VERDICT. It ranks candidates by the words
// their titles use; every hit still has to be read. The known counter-example
// is already on the board: addictedtoai-jqs LOOKS create-shaped ("wiki lacks an
// entry for RLHF") and is NOT, because the aliases it needs are declared by a
// reviewed entry. THE CHEAP CHECK IS ONE GREP PER INTENDED ALIAS, never one for
// the filename.
import { execFileSync } from 'node:child_process';

const BD = 'C:/Users/BadBitch/AppData/Roaming/npm/node_modules/@beads/bd/bin/bd.js';
const all = JSON.parse(execFileSync(process.execPath, [BD, 'list', '--all', '--json'], {
  cwd: 'D:/AddictedtoAI', encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: false,
}));

const open = all.filter((i) => i.status !== 'closed');

// Words that suggest something does not exist yet and should.
const CREATE = /\b(no wiki entry|lacks an entry|has no entry|missing entry|no entry for|does not exist|unwritten|never written|should exist|wiki lacks|write the wiki|needs an entry|stub)\b/i;
// Words that suggest an existing, probably reviewed, page is being changed.
const EDIT = /\b(re-review|reword|rewrite|fix the|correct the|cut the|gloss|hedge|amend|update the (page|entry|sentence)|unlinked|inbound)\b/i;

const hits = open.filter((i) => CREATE.test(`${i.title} ${i.description ?? ''}`));

console.log(`open: ${open.length}    create-shaped by title/description: ${hits.length}`);
console.log('');
for (const i of hits.sort((a, b) => a.priority - b.priority)) {
  const t = `${i.title} ${i.description ?? ''}`;
  const alsoEdit = EDIT.test(t);
  console.log(
    `${i.id.replace('addictedtoai-', '').padEnd(6)} P${i.priority} ${i.created_at.slice(0, 10)} ` +
      `${alsoEdit ? 'MIXED — read before dispatching' : 'create-only candidate      '}  ${i.title.slice(0, 72)}`,
  );
}
