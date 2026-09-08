// H4: how much of the last 7 days' filings are machinery-about-machinery?
// Classified by the PATHS a bead actually references, which is more objective
// than keywords — a bead about the site names content/, a bead about the
// machinery names loop/ pulse/ scripts/ lib/ data/.
import { readFileSync } from 'node:fs';
const all = JSON.parse(readFileSync(process.argv[2], 'utf8').replace(/^﻿/, ''));

const text = (i) =>
  [i.title, i.description, i.notes, i.design, i.acceptance, i.context].filter(Boolean).join('\n');

const since = '2026-09-01';
const recent = all.filter((i) => String(i.created_at ?? i.created ?? '').slice(0, 10) >= since);

const CONTENT = /content\/[a-z]/i;
const MACHINE = /\b(loop|pulse|scripts)\/[a-z]|\blib\/[a-z]/i;

const buckets = { machineryOnly: [], contentOnly: [], both: [], neither: [] };
for (const i of recent) {
  const t = text(i);
  const c = CONTENT.test(t);
  const m = MACHINE.test(t);
  if (c && m) buckets.both.push(i);
  else if (m) buckets.machineryOnly.push(i);
  else if (c) buckets.contentOnly.push(i);
  else buckets.neither.push(i);
}

console.log(`beads created since ${since}: ${recent.length}\n`);
for (const [k, v] of Object.entries(buckets)) {
  const pct = ((v.length / recent.length) * 100).toFixed(0);
  console.log(`${k.padEnd(14)} ${String(v.length).padStart(3)}  (${pct}%)`);
}

// Of the 'both', which are machinery whose SUBJECT is the machinery but which
// merely cite a content file as evidence? Heuristic: title has no content path.
const bothTitleMachine = buckets.both.filter((i) => !CONTENT.test(String(i.title)));
console.log(`\nof 'both', title does NOT name a content path: ${bothTitleMachine.length}`);
console.log('(these read as machinery beads citing content as evidence)\n');

console.log('MACHINERY-ONLY, most recent 15:');
for (const i of buckets.machineryOnly.slice(-15)) {
  console.log(`  [${i.status}] ${i.id} P${i.priority} ${String(i.title).slice(0, 78)}`);
}
console.log('\nCONTENT-ONLY, most recent 10:');
for (const i of buckets.contentOnly.slice(-10)) {
  console.log(`  [${i.status}] ${i.id} P${i.priority} ${String(i.title).slice(0, 78)}`);
}
