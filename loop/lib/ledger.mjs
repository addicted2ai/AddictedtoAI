/**
 * ledger.mjs — `data/ledger.jsonl`, append-only job state (design D5).
 *
 * One JSON object per line:
 *   { ts, id, type, runner, provider, tier, mm, outcome,
 *     note?, signal?, phases? }
 *
 * The first eight are LEDGER_FIELDS and are required. The rest are additive and
 * optional: a reader that does not know them is unaffected, and a line written
 * before they existed stays valid.
 *
 * `provider` is load-bearing: it is the lane key, and lane pause state is
 * COMPUTED from these lines plus clock arithmetic. There is no pause file.
 */

import { appendFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { OUTCOMES } from './config.mjs';

/** The keys every ledger line carries, in order. Printed by --dry-run. */
export const LEDGER_FIELDS = Object.freeze([
  'ts',
  'id',
  'type',
  'runner',
  'provider',
  'tier',
  'mm',
  'outcome',
]);

export function readLedger(ctx) {
  if (!existsSync(ctx.ledgerPath)) return [];
  const raw = readFileSync(ctx.ledgerPath, 'utf8');
  const out = [];
  raw.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    try {
      out.push(JSON.parse(t));
    } catch (e) {
      throw new Error(`${ctx.ledgerPath}:${i + 1} is not valid JSON: ${e.message}`);
    }
  });
  return out;
}

export function appendLedger(ctx, line) {
  for (const k of LEDGER_FIELDS) {
    if (line[k] === undefined || line[k] === null) {
      throw new Error(`ledger line is missing required field "${k}"`);
    }
  }
  if (!OUTCOMES.includes(line.outcome)) {
    throw new Error(
      `ledger line outcome "${line.outcome}" is not one of ${OUTCOMES.join(', ')}`,
    );
  }
  mkdirSync(dirname(ctx.ledgerPath), { recursive: true });
  appendFileSync(ctx.ledgerPath, JSON.stringify(line) + '\n', 'utf8');
  return line;
}

/**
 * `signal` is optional and additive: an outcome says what happened to the JOB,
 * a signal says something about the RUN that the outcome cannot carry. The one
 * in use is `no-output` — the run produced no RESULT.md, no output and no diff
 * (beads addictedtoai-h5k). It is a field rather than prose in `note` because
 * health.mjs counts it, and counting free text is how a check comes to mean
 * whatever the last note happened to say.
 *
 * `phases` is optional and additive in the same way, and for the same reason
 * (beads addictedtoai-59s): `mm` is the JOB total across the author, both
 * review passes and the revision, while the cap that produced those runs is PER
 * INVOCATION. A total cannot say where a per-invocation cap belongs, so each
 * invocation records its own `{role, runner, mm, killed, code, outcome}`.
 *
 * `mm` REMAINS THE TOTAL and is unchanged. `budget.mjs` sums it — shares, the
 * upkeep floor, the ceilings and the warm-up denominator are all that sum — and
 * nothing here alters what it means. A line with no `phases` (the 14-day
 * abandon sweep writes one: no process ran, so there is nothing to record) is
 * as valid as it ever was, and LEDGER_FIELDS is deliberately not extended.
 */
export function makeLedgerLine({ id, type, runner, provider, tier, mm, outcome, note, ts, signal, phases }) {
  const line = {
    ts: ts ?? new Date().toISOString(),
    id,
    type,
    runner,
    provider,
    tier,
    mm: Math.round(mm * 100) / 100,
    outcome,
  };
  if (note) line.note = note;
  if (signal) line.signal = signal;
  if (Array.isArray(phases) && phases.length) line.phases = phases;
  return line;
}

/** Lines inside a trailing window, newest last (file order preserved). */
export function withinWindow(lines, now, ms) {
  const cutoff = now.getTime() - ms;
  return lines.filter((l) => {
    const t = Date.parse(l.ts);
    return Number.isFinite(t) && t >= cutoff;
  });
}

/** The next `j-<yyyymmdd>-<seq>` for today, from the ledger plus any existing branches. */
export function nextJobId(ledger, now, existingIds = []) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const day = `${y}${m}${d}`;
  const prefix = `j-${day}-`;
  let max = 0;
  for (const id of [...ledger.map((l) => l.id), ...existingIds]) {
    if (typeof id === 'string' && id.startsWith(prefix)) {
      const n = Number.parseInt(id.slice(prefix.length), 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(2, '0')}`;
}
