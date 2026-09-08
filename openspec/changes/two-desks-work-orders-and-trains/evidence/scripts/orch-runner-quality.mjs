// Outcome and first-review quality by RUNNER and by JOB TYPE, from
// data/ledger.jsonl. Written to test one specific proposal: that
// codex-gpt-luna-medium is a good default author for routine types.
//
// WHAT "QUALITY" MEANS HERE, stated so it is not over-read:
//   FIRST-PASS REVISE RATE = of jobs whose review1 phase recorded a verdict,
//   the share where review1 said `revise` rather than `approve`. That is the
//   cheapest available proxy for "did the author get it right first time". It
//   is NOT a defect rate: a revise can be a nitpick, and an approve can miss a
//   real defect. It measures agreement with a reviewer, nothing more.
//
// AND THE LIMIT THAT MATTERS MOST: sample sizes per (runner, type) here are
// TINY. Every cell below prints its n. A rate over n<5 is an anecdote with a
// percent sign attached, and a policy should not be set from one.
import { readFileSync } from 'node:fs';

const ledger = readFileSync('D:/AddictedtoAI/data/ledger.jsonl', 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean).map((l) => JSON.parse(l));

const authorRunner = (j) => {
  const a = (j.phases ?? []).find((p) => p.role === 'author');
  return a?.runner ?? j.runner ?? 'unknown';
};
const review1 = (j) => (j.phases ?? []).find((p) => p.role === 'review1');

// ---- by runner --------------------------------------------------------------
const runners = {};
for (const j of ledger) {
  const r = authorRunner(j);
  const b = (runners[r] ??= { n: 0, done: 0, failed: 0, discarded: 0, blocked: 0, interrupted: 0, mm: 0, rev: 0, revN: 0 });
  b.n++; b[j.outcome] = (b[j.outcome] ?? 0) + 1; b.mm += Number(j.mm) || 0;
  const r1 = review1(j);
  if (r1?.outcome === 'revise' || r1?.outcome === 'approve') { b.revN++; if (r1.outcome === 'revise') b.rev++; }
}
console.log('BY AUTHOR RUNNER');
console.log('runner                        n   done   disc   fail   mm/job   review1-revise');
for (const [r, b] of Object.entries(runners).sort((a, b2) => b2[1].n - a[1].n)) {
  const pct = (x, d) => (d ? ((x / d) * 100).toFixed(0) + '%' : '  -');
  console.log(
    `${r.padEnd(26)} ${String(b.n).padStart(3)}  ${pct(b.done ?? 0, b.n).padStart(5)}  ${pct(b.discarded ?? 0, b.n).padStart(5)}  ` +
    `${pct(b.failed ?? 0, b.n).padStart(5)}  ${(b.mm / b.n).toFixed(1).padStart(6)}   ${b.revN ? `${b.rev}/${b.revN} ${pct(b.rev, b.revN)}` : 'n=0'}`,
  );
}

// ---- luna-medium, by type ---------------------------------------------------
console.log('');
console.log('codex-gpt-luna-medium AS AUTHOR, BY JOB TYPE (n is small — read it)');
console.log('type          n   done  disc  fail  blk   review1-revise   mm/job');
const med = ledger.filter((j) => authorRunner(j) === 'codex-gpt-luna-medium');
const byType = {};
for (const j of med) {
  const t = (byType[j.type] ??= { n: 0, done: 0, discarded: 0, failed: 0, blocked: 0, interrupted: 0, rev: 0, revN: 0, mm: 0 });
  t.n++; t[j.outcome] = (t[j.outcome] ?? 0) + 1; t.mm += Number(j.mm) || 0;
  const r1 = review1(j);
  if (r1?.outcome === 'revise' || r1?.outcome === 'approve') { t.revN++; if (r1.outcome === 'revise') t.rev++; }
}
for (const [t, b] of Object.entries(byType).sort((a, b2) => b2[1].n - a[1].n)) {
  console.log(
    `${t.padEnd(12)} ${String(b.n).padStart(2)}  ${String(b.done ?? 0).padStart(5)} ${String(b.discarded ?? 0).padStart(5)} ` +
    `${String(b.failed ?? 0).padStart(5)} ${String(b.blocked ?? 0).padStart(4)}   ${`${b.rev}/${b.revN}`.padStart(6)}          ${(b.mm / b.n).toFixed(1).padStart(6)}`,
  );
}
console.log(`\ntotal luna-medium-authored jobs: ${med.length}`);

// ---- the comparison the policy rests on -------------------------------------
console.log('');
console.log('FIRST-PASS REVISE RATE, luna-medium vs every other author runner:');
const other = ledger.filter((j) => authorRunner(j) !== 'codex-gpt-luna-medium');
const rate = (arr) => {
  let rev = 0; let n = 0;
  for (const j of arr) { const r1 = review1(j); if (r1?.outcome === 'revise' || r1?.outcome === 'approve') { n++; if (r1.outcome === 'revise') rev++; } }
  return { rev, n, pct: n ? ((rev / n) * 100).toFixed(0) + '%' : 'n=0' };
};
const a = rate(med); const b = rate(other);
console.log(`  codex-gpt-luna-medium : ${a.rev}/${a.n} = ${a.pct}`);
console.log(`  all other runners     : ${b.rev}/${b.n} = ${b.pct}`);
