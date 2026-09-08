// Beads inflow vs outflow per LOCAL day. Supersedes orch-beads-flow.mjs.
//
// WHY THIS EXISTS: the first version bucketed by `String(created_at).slice(0,10)`,
// which is the UTC day. Beads timestamps are UTC (they end in `Z`); this machine
// is UTC-6. EVERY DATE IN THIS CORPUS IS THE LOCAL DATE OF THE MACHINE THAT
// WROTE IT — that is CLAUDE.md's stated convention and the whole freshness layer
// depends on it. So a UTC bucket puts every bead filed between 18:00 and 24:00
// local on the FOLLOWING day, and the error is largest exactly where this
// project works: evenings and overnight runs.
//
// Measured cost of the bug: the 2026-08-31 cohort was 37 by UTC day and 26 by
// local day. A 42% overstatement of the single number the backlog diagnosis
// rested on.
import { execFileSync } from 'node:child_process';

const BD = 'C:/Users/BadBitch/AppData/Roaming/npm/node_modules/@beads/bd/bin/bd.js';
const all = JSON.parse(execFileSync(process.execPath, [BD, 'list', '--all', '--json'], {
  cwd: 'D:/AddictedtoAI', encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: false,
}));

const localDay = (t) => {
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

console.log(`local tz offset: ${new Date().getTimezoneOffset()} min (UTC${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(new Date().getTimezoneOffset()) / 60})`);
console.log(`beads total ${all.length}   open ${all.filter((i) => i.status !== 'closed').length}`);
console.log('');

const days = [...new Set(all.flatMap((i) => [localDay(i.created_at), localDay(i.closed_at)]).filter(Boolean))].sort();
console.log('LOCAL day     filed  closed   net   cum.open');
let open = 0; let tf = 0; let tc = 0;
for (const day of days) {
  const filed = all.filter((i) => localDay(i.created_at) === day).length;
  const closed = all.filter((i) => localDay(i.closed_at) === day).length;
  open += filed - closed; tf += filed; tc += closed;
  const net = filed - closed;
  console.log(`${day}   ${String(filed).padStart(5)}  ${String(closed).padStart(6)}  ${((net >= 0 ? '+' : '') + net).padStart(4)}   ${String(open).padStart(6)}`);
}
console.log('');
console.log(`TOTAL filed ${tf}, closed ${tc}, net +${tf - tc}`);

const last7 = days.slice(-7);
const f7 = last7.reduce((s, d) => s + all.filter((i) => localDay(i.created_at) === d).length, 0);
const c7 = last7.reduce((s, d) => s + all.filter((i) => localDay(i.closed_at) === d).length, 0);
console.log(`LAST ${last7.length} LOCAL DAYS: filed ${f7}, closed ${c7}, ratio ${(f7 / (c7 || 1)).toFixed(2)}`);
console.log('');

const openIssues = all.filter((i) => i.status !== 'closed');
const byAge = {};
for (const i of openIssues) byAge[localDay(i.created_at)] = (byAge[localDay(i.created_at)] ?? 0) + 1;
console.log('OPEN BY LOCAL DAY FILED (the barbell, re-measured):');
for (const [d, n] of Object.entries(byAge).sort()) console.log(`  ${d}  ${String(n).padStart(3)}`);
