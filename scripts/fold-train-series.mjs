// scripts/fold-train-series.mjs — task 52 (U7) folding script.
//
// Reads ledger lines with `type: 'train'` (the task-36 shape U2 writes,
// filled by U3/U4) and folds the four train series the Stage-1 gate
// reads: per-gate seconds per train, evictions + how many were later
// recorded wrong, `pre-existing` holds, and train-review model-minutes
// including every re-review. Prints one JSON object to stdout; writes
// nothing. With no production trains yet every series is empty — that
// is a measurement (n=0), not an error: the gate reads the emptiness
// as "no data", never as "clean".
//
// Usage: node scripts/fold-train-series.mjs [--ledger <path>]

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(HERE);

function localDay(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function foldTrainSeries(ledgerText, measuredOn = localDay()) {
  const lines = String(ledgerText ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  const trains = lines.filter((l) => l && l.type === 'train');
  const perTrain = trains.map((l) => {
    const t = l.train && typeof l.train === 'object' ? l.train : {};
    const gateSeconds = t.gate_seconds && typeof t.gate_seconds === 'object' ? t.gate_seconds : {};
    const gateTotal = Object.values(gateSeconds).reduce(
      (s, v) => s + (typeof v === 'number' && Number.isFinite(v) ? v : 0),
      0,
    );
    const evictions = Array.isArray(t.evictions) ? t.evictions : [];
    return {
      id: l.id ?? null,
      gate_seconds: gateSeconds,
      gate_seconds_total: Math.round(gateTotal * 100) / 100,
      evictions: evictions.length,
      wrongly: evictions.filter((e) => e && e.wrongly === true).length,
      pre_existing_hold: t.pre_existing_hold === true,
      review_mm: typeof l.mm === 'number' ? l.mm : null,
      review_rounds: typeof t.review_rounds === 'number' ? t.review_rounds : null,
    };
  });
  const gateSaved = perTrain.reduce((s, t) => s + t.gate_seconds_total, 0);
  const reviewSpent = perTrain.reduce((s, t) => s + (t.review_mm ?? 0), 0);
  return {
    measured_on: measuredOn,
    method:
      'scripts/fold-train-series.mjs over data/ledger.jsonl lines with type train (task-36 shape)',
    trains: trains.length,
    per_train: perTrain,
    totals: {
      gate_seconds: Math.round(gateSaved * 100) / 100,
      evictions: perTrain.reduce((s, t) => s + t.evictions, 0),
      wrongly: perTrain.reduce((s, t) => s + t.wrongly, 0),
      pre_existing_holds: perTrain.filter((t) => t.pre_existing_hold).length,
      review_mm: Math.round(reviewSpent * 100) / 100,
    },
    // The go/no-go inputs, read literally: with n=0 trains the wrongly
    // clause is vacuously satisfied and the overhead clause is
    // unmeasurable — the gate below MUST NOT read emptiness as a pass.
    gate_inputs: {
      wrongly_in_last_20: perTrain.slice(-20).reduce((s, t) => s + t.wrongly, 0),
      trains_observed: trains.length,
    },
  };
}

const args = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('fold-train-series.mjs')) {
  const li = args.indexOf('--ledger');
  const ledgerPath = li >= 0 && args[li + 1] ? resolve(args[li + 1]) : join(REPO, 'data', 'ledger.jsonl');
  let text = '';
  try {
    text = readFileSync(ledgerPath, 'utf8');
  } catch {
    text = '';
  }
  process.stdout.write(`${JSON.stringify(foldTrainSeries(text), null, 2)}\n`);
}
