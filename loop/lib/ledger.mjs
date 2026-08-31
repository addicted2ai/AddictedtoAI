/**
 * ledger.mjs — `data/ledger.jsonl`, append-only job state (design D5).
 *
 * One JSON object per line:
 *   { ts, id, type, runner, provider, tier, mm, outcome,
 *     note?, signal?, phases?, issues? }
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
export function makeLedgerLine({ id, type, runner, provider, tier, mm, outcome, note, ts, signal, phases, issues }) {
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
  // `issues` is optional and additive on the same terms as `signal` and
  // `phases`, and it is A LIST rather than a scalar (design D2,
  // `addictedtoai-occ0`). One job can serve more than one issue — a directive
  // line naming two, a proposal filed against a pair — and a scalar that later
  // has to become a list is a migration across an append-only file that nobody
  // wants. The list costs nothing today: it is omitted entirely when empty, so
  // no line grows without cause and every line written before this existed
  // stays exactly as valid as it was.
  //
  // LEDGER_FIELDS is deliberately NOT extended. Requiring an id per job would
  // manufacture backlog noise — a `verify` job triggered by an overdue fact is
  // routine upkeep with nothing behind it, and the requirement belongs where
  // work would otherwise be lost, not everywhere.
  if (Array.isArray(issues) && issues.length) line.issues = issues;
  return line;
}

/**
 * Every job the ledger records against one issue id — the join this file exists
 * to make answerable. Before it, "what did the machine ever do about
 * `addictedtoai-X`" could not be asked of any artifact at all.
 */
export function jobsForIssue(ledger, issueId) {
  return (ledger ?? []).filter((l) => Array.isArray(l.issues) && l.issues.includes(issueId));
}

/**
 * What one job has already cost, read from the ledger (specs/loop delta: every
 * brief "SHALL state the job's total spend so far and how many invocations have
 * already run").
 *
 * A job that was interrupted and resumed has more than one line, each carrying
 * that RUN's total, so the job's total is their sum. The invocation count comes
 * from `phases` where a line has it. A line written before `phases` existed, or
 * one whose run made no invocation at all, cannot say how many invocations it
 * covered — so it contributes 1 when it recorded any minutes and 0 when it did
 * not, and never a guess. That is a floor on the count, and the brief says it is
 * what the ledger records rather than claiming it is exhaustive.
 */
export function jobSpendSoFar(ledger, jobId) {
  const mine = (ledger ?? []).filter((l) => l.id === jobId);
  let mm = 0;
  let invocations = 0;
  for (const l of mine) {
    const lineMm = Number(l.mm) || 0;
    mm += lineMm;
    if (Array.isArray(l.phases) && l.phases.length) invocations += l.phases.length;
    else if (lineMm > 0) invocations += 1;
  }
  return { mm: Math.round(mm * 100) / 100, invocations };
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
