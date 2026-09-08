// Desk efficiency, measured from data/ledger.jsonl. For A2AI-Fable-Arch.
//
// WHAT THE LEDGER CAN AND CANNOT ANSWER, said first so nothing here is read as
// more than it is:
//   `mm` is MODEL-MINUTES — time a model was invoked. It is NOT wall-clock and
//   NOT tokens. Fixed overhead (worktree setup, npm test, next build, the three
//   verifiers, merge, rederive, records commit) burns WALL-CLOCK and CPU while
//   spending ZERO model-minutes. So mm UNDERSTATES a job's true cost, and the
//   gap between consecutive ledger timestamps is the only handle on it here.
//   That gap includes chain sleep and any operator pause, so it is an UPPER
//   bound on job wall-clock, not a measurement of it.
import { readFileSync } from 'node:fs';

const ledger = readFileSync('D:/AddictedtoAI/data/ledger.jsonl', 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean).map((l) => JSON.parse(l));

const day = (j) => String(j.ts).slice(0, 10);
const days = [...new Set(ledger.map(day))].sort();

console.log(`ledger lines: ${ledger.length}   days: ${days.length}   ${days[0]} .. ${days[days.length - 1]}`);
console.log('');

// ---- per day ----------------------------------------------------------------
console.log('day          jobs  done  fail  intr  blkd  disc   model-min   mm/job');
for (const d of days) {
  const js = ledger.filter((j) => day(j) === d);
  const c = (o) => js.filter((j) => j.outcome === o).length;
  const mm = js.reduce((s, j) => s + (Number(j.mm) || 0), 0);
  console.log(
    `${d}  ${String(js.length).padStart(4)}  ${String(c('done')).padStart(4)}  ${String(c('failed')).padStart(4)}  ` +
    `${String(c('interrupted')).padStart(4)}  ${String(c('blocked')).padStart(4)}  ${String(c('discarded')).padStart(4)}  ` +
    `${mm.toFixed(1).padStart(9)}  ${(mm / (js.length || 1)).toFixed(1).padStart(6)}`,
  );
}

// ---- where the model-minutes go, by phase role ------------------------------
console.log('');
const byRole = {};
let phasedJobs = 0;
for (const j of ledger) {
  if (!Array.isArray(j.phases) || !j.phases.length) continue;
  phasedJobs++;
  for (const p of j.phases) byRole[p.role] = (byRole[p.role] ?? 0) + (Number(p.mm) || 0);
}
const totalPhase = Object.values(byRole).reduce((a, b) => a + b, 0);
console.log(`MODEL-MINUTES BY ROLE (over ${phasedJobs} jobs carrying phase data, ${totalPhase.toFixed(0)} mm):`);
for (const [r, mm] of Object.entries(byRole).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${r.padEnd(10)} ${mm.toFixed(1).padStart(8)} mm   ${((mm / totalPhase) * 100).toFixed(1).padStart(5)}%`);
}
const authoring = (byRole.author ?? 0) + (byRole.revision ?? 0);
console.log(`  -> AUTHORING (author+revision) ${((authoring / totalPhase) * 100).toFixed(1)}%   REVIEW ${(((totalPhase - authoring) / totalPhase) * 100).toFixed(1)}%`);

// ---- how many invocations per job -------------------------------------------
console.log('');
const phaseCounts = ledger.filter((j) => Array.isArray(j.phases) && j.phases.length).map((j) => j.phases.length);
const hist = {};
for (const n of phaseCounts) hist[n] = (hist[n] ?? 0) + 1;
console.log('MODEL INVOCATIONS PER JOB (phases per ledger line):');
for (const [n, c] of Object.entries(hist).sort((a, b) => Number(a[0]) - Number(b[0]))) {
  console.log(`  ${n} invocation(s): ${c} job(s)`);
}
console.log(`  mean ${(phaseCounts.reduce((a, b) => a + b, 0) / phaseCounts.length).toFixed(2)} invocations per job`);

// ---- wall-clock proxy --------------------------------------------------------
console.log('');
console.log('WALL-CLOCK GAP BETWEEN CONSECUTIVE JOBS (UPPER bound on job duration —');
console.log('includes chain overhead and any operator pause; NOT a job measurement):');
const gaps = [];
for (let i = 1; i < ledger.length; i++) {
  const g = (Date.parse(ledger[i].ts) - Date.parse(ledger[i - 1].ts)) / 60000;
  if (g > 0 && g < 600) gaps.push({ g, mm: Number(ledger[i].mm) || 0, id: ledger[i].id });
}
gaps.sort((a, b) => a.g - b.g);
const med = gaps[Math.floor(gaps.length / 2)];
console.log(`  n=${gaps.length}  median gap ${med.g.toFixed(1)} min  (that job's mm: ${med.mm})`);
const withMm = gaps.filter((x) => x.mm > 0);
const ratio = withMm.map((x) => x.g / x.mm).sort((a, b) => a - b);
console.log(`  median (gap / model-minutes) ratio: ${ratio[Math.floor(ratio.length / 2)].toFixed(2)}x`);
console.log('  A ratio above 1 is time the machine spent NOT invoking a model:');
console.log('  worktree setup, npm test, next build, three verifiers, merge, rederive, records commit.');

// ---- outcome economics -------------------------------------------------------
console.log('');
const doneJobs = ledger.filter((j) => j.outcome === 'done');
const wasted = ledger.filter((j) => ['failed', 'discarded', 'interrupted'].includes(j.outcome));
const doneMm = doneJobs.reduce((s, j) => s + (Number(j.mm) || 0), 0);
const wastedMm = wasted.reduce((s, j) => s + (Number(j.mm) || 0), 0);
const allMm = ledger.reduce((s, j) => s + (Number(j.mm) || 0), 0);
console.log(`TOTAL model-minutes ever ....... ${allMm.toFixed(0)}`);
console.log(`  on jobs that ended done ...... ${doneMm.toFixed(0)}  (${((doneMm / allMm) * 100).toFixed(1)}%)`);
console.log(`  on failed/discarded/intr ..... ${wastedMm.toFixed(0)}  (${((wastedMm / allMm) * 100).toFixed(1)}%)`);
console.log(`jobs: ${ledger.length} total, ${doneJobs.length} done (${((doneJobs.length / ledger.length) * 100).toFixed(1)}%)`);
