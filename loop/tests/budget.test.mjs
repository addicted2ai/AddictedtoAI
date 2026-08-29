/**
 * Task 7.3 — budget enforcement, lane pausing, capacity degradation.
 *
 * Synthetic ledgers are the RIGHT tool here and only here: budget arithmetic is
 * arithmetic over recorded lines, so recorded lines are the honest input.
 * Outcome classification, by contrast, is tested against a real filesystem in
 * result-protocol.test.mjs — a synthetic status value there would test nothing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { loadConfig } from '../lib/config.mjs';
import {
  applyUpkeepFloor,
  budgetGate,
  consecutiveFailures,
  degradationGate,
  lanePause,
  shedState,
  tierShares,
} from '../lib/budget.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { selectJob } from '../lib/select.mjs';
import { makeRepo, writeLedger, ledgerLine, hoursAgo, daysAgo, writeQueue } from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

function fixture(lines, queue = []) {
  const ctx = makeRepo({ now: () => NOW });
  writeLedger(ctx, lines);
  writeQueue(ctx, queue);
  return ctx;
}

test('new writing is refused at its 45% ceiling, within the tier', () => {
  // A warm window: 1000 MM in the tier, past the 600-minute warm-up, so the
  // ceiling is measured against the window's own total — the spec's arithmetic
  // exactly. (The low-n case, where it is not, is two tests below.)
  const ctx = fixture([
    ledgerLine({ id: 'a', type: 'entry', mm: 450, tier: 'frontier', ts: daysAgo(NOW, 2) }),
    ledgerLine({ id: 'b', type: 'verify', mm: 550, tier: 'frontier', ts: daysAgo(NOW, 3) }),
    // a different tier's spending must not affect the frontier shares at all
    ledgerLine({ id: 'c', type: 'entry', mm: 9000, tier: 'cheap', ts: daysAgo(NOW, 1) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'frontier', NOW);
  assert.equal(shares.total_mm, 1000);
  assert.equal(shares.share_pct.new_writing, 45);
  assert.equal(shares.warming_up, false);
  assert.equal(shares.ceiling_pct.new_writing, 45, 'past the warm-up the two are the same number');

  const refused = budgetGate(cfg, shares, 'post');
  assert.equal(refused.ok, false);
  assert.equal(refused.rule, 'budget:new_writing-ceiling');
  assert.match(refused.reason, /45\.0% of the frontier tier/);
  assert.match(refused.reason, /rolling 30-day model-minutes/);

  assert.equal(budgetGate(cfg, shares, 'repair').ok, true, 'upkeep is still selectable');
  ctx.cleanup();
});

test('machinery is refused at its 10% ceiling — the selector enforces it, not good intentions', () => {
  const ctx = fixture([
    ledgerLine({ id: 'a', type: 'machinery', mm: 100, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ledgerLine({ id: 'b', type: 'verify', mm: 900, tier: 'frontier', ts: daysAgo(NOW, 1) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'frontier', NOW);
  assert.equal(shares.share_pct.machinery, 10);
  const g = budgetGate(cfg, shares, 'machinery');
  assert.equal(g.ok, false);
  assert.match(g.reason, /10% ceiling/);
  ctx.cleanup();
});

test('one job does not saturate its category for a month — the n=1 defect, with the real numbers', () => {
  // Job j-20260828-01, exactly as it happened: one entry job, 12.19 cheap-tier
  // model-minutes, outcome `failed`. The observed share of new writing is
  // 100.0%, and before this fix that refused every subsequent entry, tutorial,
  // post and education job until the 30-day window rolled past it.
  const ctx = fixture([
    ledgerLine({ id: 'j-20260828-01', type: 'entry', mm: 12.19, tier: 'cheap', outcome: 'failed', ts: daysAgo(NOW, 1) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'cheap', NOW);

  assert.equal(shares.total_mm, 12.19);
  assert.equal(shares.share_pct.new_writing, 100, 'the observed share really is 100% — that is the input');
  assert.equal(shares.warming_up, true);
  assert.equal(shares.warm_up_mm, 600, 'ten times the largest per-type cap in data/config.json');

  for (const t of ['entry', 'tutorial', 'post', 'education']) {
    const g = budgetGate(cfg, shares, t);
    assert.equal(g.ok, true, `${t} must still be selectable after one job: ${g.reason ?? ''}`);
  }
  // The minutes are still counted. A transient failure spending 12 minutes
  // spent 12 minutes; nothing here excludes it.
  assert.equal(shares.mm.new_writing, 12.19);
  ctx.cleanup();
});

test('the warm-up is a smaller allowance than the steady state, never a larger one', () => {
  const ctx = fixture([]);
  const cfg = loadConfig(ctx);
  const at = (mm, type = 'entry') =>
    tierShares(
      cfg,
      [ledgerLine({ id: 'x', type, mm, tier: 'frontier', ts: daysAgo(NOW, 1) })],
      'frontier',
      NOW,
    );

  // 45% of the 600-minute warm-up is 270 MM of new writing before the ceiling
  // binds — about five full-length jobs, and far less than 45% of any plausible
  // month (a job a day at 30–60 minutes is 900–1800 MM).
  assert.equal(budgetGate(cfg, at(269), 'post').ok, true);
  assert.equal(budgetGate(cfg, at(270), 'post').ok, false);

  // And the tightest ceiling: one maximum-length machinery job is exactly 10%
  // of the warm-up window, so the first is allowed and the second is not. That
  // is the derivation of the number, measured rather than asserted.
  assert.equal(budgetGate(cfg, at(59, 'machinery'), 'machinery').ok, true);
  assert.equal(budgetGate(cfg, at(60, 'machinery'), 'machinery').ok, false);
  assert.match(budgetGate(cfg, at(60, 'machinery'), 'machinery').reason, /warm-up window of 600 model-minutes/);
  ctx.cleanup();
});

test('the warm-up never loosens a ceiling once the window is real', () => {
  // Above the warm-up the denominator IS the observed total, so the rule is the
  // spec's rule and nothing has been relaxed.
  const ctx = fixture([]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(
    cfg,
    [
      ledgerLine({ id: 'a', type: 'machinery', mm: 200, tier: 'frontier', ts: daysAgo(NOW, 1) }),
      ledgerLine({ id: 'b', type: 'verify', mm: 1800, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ],
    'frontier',
    NOW,
  );
  assert.equal(shares.warming_up, false);
  assert.equal(shares.ceiling_denominator_mm, shares.total_mm);
  assert.equal(shares.ceiling_pct.machinery, shares.share_pct.machinery);
  assert.equal(budgetGate(cfg, shares, 'machinery').ok, false);
  ctx.cleanup();
});

test('the upkeep floor is untouched by the warm-up and reads the observed share', () => {
  // Deliberate: a floor measured on a thin window errs toward doing upkeep,
  // which is the safe direction, and it already binds only when an upkeep job
  // is available. One upkeep job clears it.
  const ctx = fixture([
    ledgerLine({ id: 'a', type: 'entry', mm: 12.19, tier: 'cheap', ts: daysAgo(NOW, 1) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'cheap', NOW);
  assert.equal(shares.share_pct.upkeep, 0);
  const r = applyUpkeepFloor(cfg, shares, [{ type: 'post' }, { type: 'verify' }]);
  assert.deepEqual(r.candidates.map((c) => c.type), ['verify']);
  assert.match(r.refused[0].reason, /below its 40% floor/);
  ctx.cleanup();
});

test('the upkeep floor binds on its own: only upkeep is offered while it is unmet', () => {
  const ctx = fixture([
    ledgerLine({ id: 'a', type: 'entry', mm: 30, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ledgerLine({ id: 'b', type: 'verify', mm: 20, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ledgerLine({ id: 'c', type: 'machinery', mm: 50, tier: 'frontier', ts: daysAgo(NOW, 1) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'frontier', NOW);
  assert.equal(shares.share_pct.upkeep, 20); // below the 40% floor
  const candidates = [
    { type: 'post', title: 'a post' },
    { type: 'repair', title: 'a repair' },
  ];
  const r = applyUpkeepFloor(cfg, shares, candidates);
  assert.deepEqual(r.candidates.map((c) => c.type), ['repair']);
  assert.equal(r.refused[0].rule, 'budget:upkeep-floor');
  assert.match(r.refused[0].reason, /below its 40% floor/);

  // and the floor does not bind when no upkeep job is available
  const r2 = applyUpkeepFloor(cfg, shares, [{ type: 'post', title: 'a post' }]);
  assert.deepEqual(r2.candidates.map((c) => c.type), ['post']);
  assert.equal(r2.refused.length, 0);
  ctx.cleanup();
});

test('an empty tier binds nothing — 0/0 is undefined, not zero', () => {
  const ctx = fixture([]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, [], 'frontier', NOW);
  assert.equal(shares.total_mm, 0);
  assert.equal(budgetGate(cfg, shares, 'post').ok, true);
  assert.equal(applyUpkeepFloor(cfg, shares, [{ type: 'post' }]).candidates.length, 1);
  ctx.cleanup();
});

test('a lane pauses on capacity, doubles per consecutive event, caps at 6h, and a success resets it', () => {
  const one = [ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: hoursAgo(NOW, 0.5) })];
  const p1 = lanePause(one, 'provider-a', NOW);
  assert.equal(p1.paused, true);
  assert.equal(p1.consecutive, 1);
  assert.equal(p1.backoff_ms, 3600000);

  const elapsed = [ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: hoursAgo(NOW, 2) })];
  assert.equal(lanePause(elapsed, 'provider-a', NOW).paused, false, 'the backoff elapsed');

  const three = [
    ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: hoursAgo(NOW, 9) }),
    ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: hoursAgo(NOW, 6) }),
    ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: hoursAgo(NOW, 3) }),
  ];
  const p3 = lanePause(three, 'provider-a', NOW);
  assert.equal(p3.consecutive, 3);
  assert.equal(p3.backoff_ms, 4 * 3600000);
  assert.equal(p3.paused, true);

  const many = Array.from({ length: 6 }, (_, i) =>
    ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: hoursAgo(NOW, 6 - i) }),
  );
  assert.equal(lanePause(many, 'provider-a', NOW).backoff_ms, 6 * 3600000, 'capped at 6h');

  const reset = [
    ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: hoursAgo(NOW, 3) }),
    ledgerLine({ provider: 'provider-a', outcome: 'done', ts: hoursAgo(NOW, 2) }),
  ];
  assert.equal(lanePause(reset, 'provider-a', NOW).paused, false, 'a success resets the sequence');

  // and the pause is per lane, not global
  assert.equal(lanePause(one, 'provider-b', NOW).paused, false);
});

test('capacity degradation sheds in the specified order, read from the trailing 48h', () => {
  const ctx = fixture([]);
  const cfg = loadConfig(ctx);
  const cap = (h) => ledgerLine({ tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, h) });

  const l0 = shedState(cfg, [], 'frontier', NOW);
  assert.equal(l0.level, 0);

  const l1 = shedState(cfg, [cap(4)], 'frontier', NOW);
  assert.equal(l1.level, 1);
  assert.equal(degradationGate(cfg, l1, { type: 'post' }).ok, false);
  assert.equal(degradationGate(cfg, l1, { type: 'education' }).ok, false);
  assert.equal(degradationGate(cfg, l1, { type: 'entry' }).ok, true);

  const l2 = shedState(cfg, [cap(4), cap(8)], 'frontier', NOW);
  assert.equal(l2.level, 2);
  for (const t of ['post', 'education', 'entry', 'tutorial']) {
    assert.equal(degradationGate(cfg, l2, { type: t }).ok, false, `${t} is shed at level 2`);
  }
  assert.equal(degradationGate(cfg, l2, { type: 'verify' }).ok, true);
  assert.equal(degradationGate(cfg, l2, { type: 'repair' }).ok, true);

  const l3 = shedState(cfg, [cap(4), cap(8), cap(12)], 'frontier', NOW);
  assert.equal(l3.level, 3);
  assert.equal(l3.interpret_material_only, true);
  assert.equal(degradationGate(cfg, l3, { type: 'interpret', material: false }).ok, false);
  assert.equal(degradationGate(cfg, l3, { type: 'interpret', material: true }).ok, true);
  assert.equal(degradationGate(cfg, l3, { type: 'verify' }).ok, true);
  assert.equal(degradationGate(cfg, l3, { type: 'repair' }).ok, true);

  // 4 or more still uses the level-3 entry
  assert.equal(shedState(cfg, [cap(1), cap(2), cap(3), cap(4)], 'frontier', NOW).level, 3);
  // events older than the window do not count
  assert.equal(shedState(cfg, [cap(60)], 'frontier', NOW).level, 0);
  // events in the other tier do not count
  assert.equal(
    shedState(cfg, [ledgerLine({ tier: 'cheap', outcome: 'capacity', ts: hoursAgo(NOW, 1) })], 'frontier', NOW).level,
    0,
  );
  ctx.cleanup();
});

test('breaker-1 counting: only failed and discarded count, blocked never does', () => {
  const t = (outcome, i) => ledgerLine({ type: 'post', outcome, ts: daysAgo(NOW, 10 - i) });
  assert.equal(consecutiveFailures([t('failed', 1), t('failed', 2), t('blocked', 3)], 'post'), 2);
  assert.equal(consecutiveFailures([t('failed', 1), t('discarded', 2), t('failed', 3)], 'post'), 3);
  assert.equal(consecutiveFailures([t('failed', 1), t('done', 2), t('failed', 3)], 'post'), 1);
  assert.equal(
    consecutiveFailures([t('failed', 1), t('interrupted', 2), t('capacity', 3), t('failed', 4), t('discarded', 5)], 'post'),
    3,
    'interrupted and capacity are skipped, not counted and not resetting',
  );
});

test('the selector refuses at the ceiling and names the rule in its output', () => {
  const ctx = fixture(
    [
      ledgerLine({ id: 'a', type: 'entry', mm: 500, tier: 'frontier', ts: daysAgo(NOW, 1) }),
      ledgerLine({ id: 'b', type: 'verify', mm: 500, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ],
    [{ type: 'post', title: 'a new post' }],
  );
  const cfg = loadConfig(ctx);
  const registry = loadRunners(ctx);
  const runner = pickRunner(registry, { id: 'mock-frontier', role: 'author' });
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });
  assert.equal(sel.selected, null);
  assert.equal(sel.refusals[0].rule, 'budget:new_writing-ceiling');
  ctx.cleanup();
});
