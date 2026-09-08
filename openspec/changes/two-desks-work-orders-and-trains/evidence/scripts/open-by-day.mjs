// Exactly which days did the CURRENTLY-OPEN beads get created on?
// A2AI-Orch reports "37 of the 100 open were filed on 08-31 (audit wave)".
// I measured "37 open created in the last 2 days". Both cannot be the headline.
import { readFileSync } from 'node:fs';
const all = JSON.parse(readFileSync(process.argv[2], 'utf8').replace(/^﻿/, ''));
const open = all.filter((i) => String(i.status).toLowerCase() !== 'closed');

const by = new Map();
for (const i of open) {
  const d = String(i.created_at ?? i.created ?? '').slice(0, 10);
  by.set(d, (by.get(d) ?? 0) + 1);
}
console.log(`OPEN total: ${open.length}\n`);
console.log('created-on   open-today   cumulative');
let cum = 0;
for (const d of [...by.keys()].sort()) {
  cum += by.get(d);
  console.log(`${d}   ${String(by.get(d)).padStart(10)}   ${String(cum).padStart(10)}`);
}

const last2 = [...by.entries()].filter(([d]) => d >= '2026-09-06').reduce((a, [, n]) => a + n, 0);
const on0831 = by.get('2026-08-31') ?? 0;
console.log(`\nopen created 2026-09-06 or later : ${last2}`);
console.log(`open created on 2026-08-31       : ${on0831}`);
console.log(`open created on or before 09-01  : ${[...by.entries()].filter(([d]) => d <= '2026-09-01').reduce((a, [, n]) => a + n, 0)}`);
