// A GUARD PLACED AFTER THE THING IT GUARDS IS DECORATION. The wiring script
// anchored each insert to the LAST `node:` import, which is only correct if no
// executable statement precedes that line. This checks the property directly
// instead of trusting the anchor: for every wired file, the guard call must come
// before the first line that can write, run a subprocess, or read the target.
//
// It also checks the guard is present at all — a wiring report saying "wired 20"
// is a claim about what the writer did, not about what the files now contain.

import { readFileSync, readdirSync } from 'node:fs';

// A CHECK THAT HAS ONLY EVER RETURNED "20/20 ok" HAS NEVER BEEN SHOWN TO FIRE,
// AND AN ALL-GREEN RESULT FROM SUCH A CHECK IS INDISTINGUISHABLE FROM A CHECK
// THAT CANNOT SEE ITS SUBJECT. That is the night's first rule, and this file had
// it: I ran it once against a family the wiring script had just written
// correctly, so every arm was a case that could not fail. Made directory-
// parameterised so `orch-wire-order-negative.mjs` can point it at decoys that
// MUST trip it — the negative control it shipped without.
const S = process.argv[2]
  || 'C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/b0a0272b-5058-41e7-ac66-431922257ff6/scratchpad';
const ACTS = /writeFileSync|appendFileSync|renameSync|unlinkSync|rmSync|copyFileSync|mkdirSync|execFileSync|execSync|readFileSync/;

let ok = 0, bad = 0, missing = 0;
for (const name of readdirSync(S).filter((n) => /^orch-mutate-.*\.mjs$/.test(n))) {
  const lines = readFileSync(`${S}/${name}`, 'utf8').split('\n');
  const guard = lines.findIndex((l) => /^requireQuietTree\(/.test(l));
  if (guard < 0) { console.log(`  NO GUARD  ${name}`); missing++; continue; }
  const act = lines.findIndex((l, i) =>
    i > 0 && ACTS.test(l) && !/^import /.test(l) && !/^\s*(\/\/|\*)/.test(l));
  if (act >= 0 && act < guard) {
    console.log(`  TOO LATE  ${name.padEnd(36)} guard line ${guard + 1}, first action line ${act + 1}`);
    console.log(`            ${lines[act].trim().slice(0, 90)}`);
    bad++;
  } else {
    console.log(`  ok        ${name.padEnd(36)} guard ${guard + 1}, first action ${act < 0 ? '(none)' : act + 1}`);
    ok++;
  }
}
console.log('');
console.log(`files ${ok + bad + missing}   guard-before-action ${ok}   TOO LATE ${bad}   NO GUARD ${missing}`);
