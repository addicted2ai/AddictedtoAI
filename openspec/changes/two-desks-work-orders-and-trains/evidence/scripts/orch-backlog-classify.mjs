// Resolve a conflict between two numbers now both in circulation:
//   the draft's D3b: "81 of 100 open beads are machinery"
//   my own earlier note: "~81 of ~100 open issues touch the site"
// Both cannot be the headline. Both came from KEYWORD classification with
// overlap, which is the problem.
//
// THIS SCRIPT DOES NOT INVENT A BETTER CLASSIFIER. It reports the overlap
// honestly, so the argument can be made on a number that is defined rather than
// on whichever half was quoted first.
import { execFileSync } from 'node:child_process';

const BD = 'C:/Users/BadBitch/AppData/Roaming/npm/node_modules/@beads/bd/bin/bd.js';
const all = JSON.parse(execFileSync(process.execPath, [BD, 'list', '--all', '--json'], {
  cwd: 'D:/AddictedtoAI', encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: false,
}));
const open = all.filter((i) => i.status !== 'closed');

const MACH = /loop\/|pulse\/|scripts\/|\.test\.mjs|gate|breaker|ledger|worktree|runner|publish|lock|desk|bead|directive|conformance|budget/i;
const SITE = /content\/|wiki|blog|entry|tutorial|learn|catalog|directory|post|editorial|prose|page|surface|jsonld|sitemap/i;

let m = 0; let s = 0; let both = 0; let neither = 0;
const bothList = [];
for (const i of open) {
  const t = `${i.title} ${i.description ?? ''}`;
  const hm = MACH.test(t); const hs = SITE.test(t);
  if (hm && hs) { both++; bothList.push(i); } else if (hm) m++; else if (hs) s++; else neither++;
}
console.log(`OPEN: ${open.length}`);
console.log(`  machinery ONLY .... ${m}`);
console.log(`  site ONLY ......... ${s}`);
console.log(`  BOTH .............. ${both}   <-- the entire disagreement lives here`);
console.log(`  neither ........... ${neither}`);
console.log('');
console.log(`"machinery" counted as machinery-only + both = ${m + both}`);
console.log(`"site"      counted as site-only + both      = ${s + both}`);
console.log('BOTH FIGURES ARE ~80 AND THEY DOUBLE-COUNT THE SAME 60 ISSUES.');
console.log('');

// A SHARPER TEST THAN KEYWORDS: which lane could actually DO the work? An issue
// naming a path under content/ needs the Desk's review gate; one naming only
// code paths does not. Path mentions are a stronger signal than topic words.
const CODE_PATH = /\b(loop|pulse|scripts|lib|app|tools)\/[a-z0-9-]+\.mjs\b/i;
const CONTENT_PATH = /\bcontent\/[a-z0-9/-]+\.md\b/i;
let codeOnly = 0; let contentOnly = 0; let mixed = 0; let none = 0;
for (const i of open) {
  const t = `${i.title} ${i.description ?? ''}\n${i.notes ?? ''}`;
  const c = CODE_PATH.test(t); const p = CONTENT_PATH.test(t);
  if (c && p) mixed++; else if (c) codeOnly++; else if (p) contentOnly++; else none++;
}
console.log('BY NAMED FILE PATH (a stronger signal than topic words):');
console.log(`  names a CODE path only ......... ${codeOnly}`);
console.log(`  names a CONTENT path only ...... ${contentOnly}`);
console.log(`  names BOTH ..................... ${mixed}`);
console.log(`  names NEITHER .................. ${none}`);
console.log('');
console.log('The lane question is "does this edit a piece carrying a review record?",');
console.log('and only a content path can. So content-only + mixed is the floor on');
console.log('work that MUST pass the Desk review gate:', contentOnly + mixed);
