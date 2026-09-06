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
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadConfig, JOB_TOTAL_CAP_MULTIPLIER } from '../lib/config.mjs';
import {
  applyUpkeepFloor,
  budgetGate,
  consecutiveFailures,
  degradationGate,
  jobTotalMinutes,
  lanePause,
  largestCapMinutes,
  shedState,
  tierShares,
  tightestCeilingPct,
  warmUpJobs,
  warmUpMm,
} from '../lib/budget.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { formatRefusals, gatherCandidates, selectJob } from '../lib/select.mjs';
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

  for (const t of ['entry', 'tutorial', 'post', 'education', 'scout']) {
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

test('the warm-up multiplier is read from the ceilings, not written next to them', () => {
  // It was the literal `10`, which is `100 / 10` for the 10% machinery ceiling.
  // Correct for today's config, and silently wrong the moment the maintainer
  // edits that percentage — the sibling `warmUpMm()` already reads the live
  // caps and scaled to 1200 by itself when the caps went to 120.
  const ctx = fixture([]);
  const cfg = loadConfig(ctx);
  assert.equal(tightestCeilingPct(cfg), 10, 'machinery, not new writing');
  assert.equal(warmUpJobs(cfg), 10);
  assert.equal(warmUpMm(cfg), 600, 'and the fixture config caps at 60 minutes');

  // What the multiplier IS, measured: the LARGEST value at which one
  // maximum-length job still binds the tightest ceiling. Move the ceiling and
  // the multiplier must move with it — a hard-coded 10 would leave a 20%
  // ceiling with a 600 MM window, where one 60-minute job is 10% and machinery
  // would get a second job before anything bound.
  const at20 = { ...cfg, budget: { ...cfg.budget, bounds: { ...cfg.budget.bounds, machinery_ceiling_pct: 20 } } };
  assert.equal(warmUpJobs(at20), 5);
  assert.equal(warmUpMm(at20), 300);

  // One maximum-length job, measured through the real arithmetic, at each
  // ceiling: it lands EXACTLY on the ceiling, and the gate is `>=`, so the
  // second machinery job is refused. The old comment claimed the opposite —
  // that one job "does not by itself reach" the ceiling — which is false, and
  // reaching it is precisely what refuses the second.
  const afterOneMaxJob = (config) =>
    tierShares(config, [ledgerLine({ type: 'machinery', mm: 60, tier: 'frontier', ts: daysAgo(NOW, 1) })], 'frontier', NOW);
  for (const c of [cfg, at20]) {
    const s = afterOneMaxJob(c);
    assert.equal(s.ceiling_denominator_mm, warmUpMm(c));
    assert.equal(s.ceiling_pct.machinery, tightestCeilingPct(c), 'exactly on the ceiling, not under it');
    assert.equal(budgetGate(c, s, 'machinery').ok, false, 'so the second machinery job is refused');
    // And the FIRST was allowed: machinery is at 0% when it is selected.
    assert.equal(budgetGate(c, tierShares(c, [ledgerLine({ type: 'verify', mm: 30, tier: 'frontier', ts: daysAgo(NOW, 1) })], 'frontier', NOW), 'machinery').ok, true);
    // Largest, not smallest: one more job's room in the window and that same
    // maximum job would sit UNDER the ceiling and bind nothing.
    assert.ok(100 / (warmUpJobs(c) + 1) < tightestCeilingPct(c));
    assert.ok(100 / warmUpJobs(c) >= tightestCeilingPct(c));
  }

  // No ceiling at all is not a crash and not a zero: nothing binds, so the
  // denominator is irrelevant and the documented fallback stands.
  assert.equal(tightestCeilingPct({ budget: { bounds: { upkeep_floor_pct: 40 } } }), 10);
  assert.equal(tightestCeilingPct(undefined), 10);
  ctx.cleanup();
});

test('dyw the warm-up denominator measures one invocation, not one job-total-bounded job, and that is unchanged', () => {
  // beads addictedtoai-dyw: `largestCapMinutes(cfg)` is one INVOCATION at the
  // largest per-type cap. `JOB_TOTAL_CAP_MULTIPLIER` (o5t) means a job's own
  // total can reach `largestCapMinutes(cfg) * JOB_TOTAL_CAP_MULTIPLIER` — more
  // than this function returns. The ruling was to correct the COMMENT, not the
  // arithmetic: this test pins the arithmetic so a future "fix" that makes
  // `warmUpMm()` track `jobTotalMinutes()` instead — doubling the warm-up
  // denominator and loosening three ceilings — cannot land silently.
  const ctx = fixture([]);
  const cfg = loadConfig(ctx);
  assert.ok(JOB_TOTAL_CAP_MULTIPLIER > 1, 'precondition: a job-total bound wider than one invocation exists at all');

  const oneInvocation = largestCapMinutes(cfg);
  const oneJobTotal = jobTotalMinutes(cfg, 'machinery'); // machinery sets the tightest ceiling
  assert.ok(oneJobTotal > oneInvocation, 'a job-total-bounded job really can spend more than one invocation');

  // The ruled value: warmUpMm is still `warmUpJobs(cfg) * largestCapMinutes(cfg)`
  // — the INVOCATION number — never the job-total number.
  assert.equal(warmUpMm(cfg), warmUpJobs(cfg) * oneInvocation);
  assert.equal(warmUpMm(cfg), 600, 'unchanged from before this ruling, at the fixture\'s 60-minute caps');
  assert.notEqual(
    warmUpMm(cfg),
    warmUpJobs(cfg) * oneJobTotal,
    'the denominator this ruling declined to adopt would be double the ruled one',
  );
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
  // make-the-blog-worth-sending, task 2.1: the scout sheds first, with the
  // other two new-writing types that cost the most and wait the best.
  assert.equal(degradationGate(cfg, l1, { type: 'scout' }).ok, false);
  assert.equal(degradationGate(cfg, l1, { type: 'entry' }).ok, true);

  const l2 = shedState(cfg, [cap(4), cap(8)], 'frontier', NOW);
  assert.equal(l2.level, 2);
  for (const t of ['post', 'education', 'scout', 'entry', 'tutorial']) {
    assert.equal(degradationGate(cfg, l2, { type: t }).ok, false, `${t} is shed at level 2`);
  }
  assert.equal(degradationGate(cfg, l2, { type: 'verify' }).ok, true);
  assert.equal(degradationGate(cfg, l2, { type: 'repair' }).ok, true);

  const l3 = shedState(cfg, [cap(4), cap(8), cap(12)], 'frontier', NOW);
  assert.equal(l3.level, 3);
  assert.equal(l3.interpret_material_only, true);
  assert.equal(degradationGate(cfg, l3, { type: 'scout' }).ok, false);
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

/* ---------------------------------------------------------------------------
 * A budget refusal states the arithmetic it refused on (specs/loop delta,
 * clauses C42 and C43; beads addictedtoai-tr8, settled half).
 *
 * A percentage hides its own denominator. `loop/lib/budget.mjs` measures
 * ceilings against `max(observed total, warm-up)` while specs/loop says a
 * category's share is its MM over the tier's rolling total — a defensible
 * reading that was invisible, because every refusal printed only a percentage.
 * WHICH denominator is right is D8 in design.md and is NOT decided here. That
 * the answer cannot hide is what these two tests measure.
 * ------------------------------------------------------------------------ */

test('C42 a ceiling refusal carries and prints its numerator, denominator and origin', () => {
  // A warm window: the denominator IS the observed rolling total, so nothing is
  // substituted and the refusal says so plainly.
  const ctx = fixture([
    ledgerLine({ id: 'a', type: 'entry', mm: 450, tier: 'frontier', ts: daysAgo(NOW, 2) }),
    ledgerLine({ id: 'b', type: 'verify', mm: 550, tier: 'frontier', ts: daysAgo(NOW, 3) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'frontier', NOW);
  const g = budgetGate(cfg, shares, 'post');
  assert.equal(g.ok, false);

  // RECORDED — the three values, as values, not as prose a caller must parse.
  assert.equal(g.category_mm, 450, 'the numerator: new_writing MM in this tier');
  assert.equal(g.denominator_mm, 1000, 'the denominator the percentage was computed against');
  assert.equal(g.denominator_substituted, false);
  assert.match(g.denominator_origin, /observed rolling 30-day total/);

  // PRINTED — `formatRefusals` prints `reason` and nothing else, so all three
  // have to survive into it or they are recorded and invisible.
  assert.match(g.reason, /450 model-minutes of new_writing/);
  assert.match(g.reason, /1000 model-minutes/);
  assert.match(g.reason, /denominator origin: .*observed rolling 30-day total/);
  assert.ok(!/SUBSTITUTED/.test(g.reason), 'nothing was substituted, so nothing announces a substitution');
  ctx.cleanup();
});

test('C43 a substituted denominator announces itself, names what it replaced, and says why', () => {
  // One maximum-length machinery job below the warm-up: the ceiling is measured
  // against 600 MM that were never spent. THAT is the divergence from the
  // specification's literal arithmetic, and it must be impossible to miss.
  const ctx = fixture([
    ledgerLine({ id: 'a', type: 'machinery', mm: 60, tier: 'frontier', ts: daysAgo(NOW, 1) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'frontier', NOW);
  const g = budgetGate(cfg, shares, 'machinery');
  assert.equal(g.ok, false);

  assert.equal(g.category_mm, 60);
  assert.equal(g.denominator_mm, 600, 'the warm-up window, not the 60 MM actually recorded');
  assert.equal(g.denominator_substituted, true);
  assert.notEqual(g.denominator_mm, shares.total_mm, 'the whole point: it is not the observed total');

  assert.match(g.reason, /SUBSTITUTED/, 'it announces itself');
  assert.match(g.reason, /observed rolling 30-day total of 60(\.0+)? model-minutes/, 'names the value it replaced');
  assert.match(g.reason, /warm-up window/, 'names the value used instead');
  assert.match(g.reason, /100 \/ 10% tightest ceiling/, 'and where that value comes from');
  assert.match(g.reason, /60-minute largest per-type cap/);
  ctx.cleanup();
});

test('C42 the upkeep floor refusal states its arithmetic too, and never claims a substitution', () => {
  // The floor is deliberately measured against the observed total alone
  // (design D8's sub-decision, unchanged here). Its refusal must say that, or a
  // reader has no way to tell the floor's denominator from a ceiling's.
  const ctx = fixture([
    ledgerLine({ id: 'a', type: 'entry', mm: 30, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ledgerLine({ id: 'b', type: 'verify', mm: 20, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ledgerLine({ id: 'c', type: 'machinery', mm: 50, tier: 'frontier', ts: daysAgo(NOW, 1) }),
  ]);
  const cfg = loadConfig(ctx);
  const shares = tierShares(cfg, readLedger(ctx), 'frontier', NOW);
  const r = applyUpkeepFloor(cfg, shares, [{ type: 'post', title: 'a post' }, { type: 'repair', title: 'a repair' }]);
  const refusal = r.refused[0];

  assert.equal(refusal.category_mm, 20, 'upkeep MM, the numerator');
  assert.equal(refusal.denominator_mm, 100, 'the observed rolling total — the floor never reads the warm-up');
  assert.equal(refusal.denominator_substituted, false);
  assert.match(refusal.denominator_origin, /observed rolling 30-day total/);
  assert.match(refusal.reason, /20 model-minutes of upkeep/);
  assert.match(refusal.reason, /100 model-minutes/);
  assert.ok(!/SUBSTITUTED/.test(refusal.reason));

  // And the warm-up genuinely does not reach the floor: below it, the floor
  // still reads the observed share, so this stays true at n=1.
  const thin = tierShares(
    cfg,
    [ledgerLine({ id: 'z', type: 'entry', mm: 12.19, tier: 'cheap', ts: daysAgo(NOW, 1) })],
    'cheap',
    NOW,
  );
  const thinRefusal = applyUpkeepFloor(cfg, thin, [{ type: 'post' }, { type: 'verify' }]).refused[0];
  assert.equal(thinRefusal.denominator_mm, 12.19, 'the observed total, thin as it is');
  assert.equal(thinRefusal.denominator_substituted, false);
  ctx.cleanup();
});

test('C42 the arithmetic survives the selector, which is where a refusal is actually read', () => {
  // budgetGate's return value is not what an operator sees. `selectJob` rebuilds
  // each refusal into its own object and `formatRefusals` prints it, and a field
  // dropped in between is recorded nowhere anyone looks.
  const ctx = fixture(
    [
      ledgerLine({ id: 'a', type: 'entry', mm: 500, tier: 'frontier', ts: daysAgo(NOW, 1) }),
      ledgerLine({ id: 'b', type: 'verify', mm: 500, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ],
    [{ type: 'post', title: 'a new post' }],
  );
  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: 'mock-frontier', role: 'author' });
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });
  const refusal = sel.refusals.find((r) => r.rule === 'budget:new_writing-ceiling');
  assert.ok(refusal, 'the ceiling refused, as this ledger requires');
  assert.equal(refusal.category_mm, 500);
  assert.equal(refusal.denominator_mm, 1000);
  assert.match(refusal.denominator_origin, /observed rolling 30-day total/);
  assert.match(formatRefusals([refusal]).join('\n'), /500 model-minutes of new_writing/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// THE FRONTIER FLAG BUYS NO BUDGET (flag-what-moved-the-frontier, specs/blog:
// "**The frontier exemption lifts a count, never a budget.** `post` and `scout`
// work over the new-writing ceiling is refused whether or not a candidate
// carries the flag", and its scenario "A frontier flag buys no budget").
//
// The clause holds today by construction — nothing in `select.mjs` or
// `budget.mjs` reads `frontier` — and that is precisely why it needed
// measuring: it holds because nobody wrote the coupling, not because anything
// refuses it. A guardrail is what it does when measured, and the paired risk
// the delta names in the same paragraph is real in the other direction: a bar
// with no budget behind it makes flagging everything the rational move.
// ---------------------------------------------------------------------------

test('a candidate reaching the selector carries NO flag: the queue reader builds from a closed field list', () => {
  // The mechanism, stated as what it is rather than as a coincidence. My first
  // draft of this test put `frontier: true` on a queue item and asserted the
  // refusal — and it passed with the seam deliberately opened (`(c) =>
  // c.frontier === true ? {ok: true} : budgetGate(...)` in select.mjs), because
  // `readQueue` never copied the key onto the candidate in the first place. A
  // test that cannot fail is worse than none: it reads as a measurement of the
  // ceiling and measures nothing.
  //
  // What is actually true, and worth pinning, is stronger than the delta's
  // clause: the flag cannot REACH the selector. `readQueue` and `readProposals`
  // each build their candidate object from an explicit field list, so a
  // declared flag is dropped at the boundary. That is the right place for it to
  // stop — the flag's whole effect is the candidate cap at proposal merge,
  // where `applyProposalMergeRules` reads the FILE's own front matter.
  const ctx = fixture(
    [
      ledgerLine({ id: 'a', type: 'entry', mm: 500, tier: 'frontier', ts: daysAgo(NOW, 1) }),
      ledgerLine({ id: 'b', type: 'verify', mm: 500, tier: 'frontier', ts: daysAgo(NOW, 1) }),
    ],
    [
      // A flag that HOLDS — a criterion from F1-F5 and a domain from the closed
      // vocabulary. Nothing weaker would prove the point: a broken flag is
      // refused for being broken.
      { type: 'post', title: 'a frontier post', frontier: true, frontier_reason: 'F2', domains: ['coding'] },
      { type: 'post', title: 'an ordinary post' },
      { type: 'scout', title: 'a frontier sweep', frontier: true, frontier_reason: 'F1' },
    ],
  );
  const { candidates } = gatherCandidates(ctx, { dryRun: true });
  assert.equal(candidates.length, 3);
  for (const c of candidates) {
    assert.equal(c.frontier, undefined, `${c.title}: the flag must not be copied onto a selector candidate`);
    assert.equal(c.frontier_reason, undefined, `${c.title}: nor the criterion`);
    assert.equal(c.domains, undefined, `${c.title}: nor the domains`);
  }

  // And the outcome the delta's scenario states, at the ceiling. This half is
  // weak on its own — it is the assertion that passed under the mutation — and
  // it is kept only as the end-to-end companion to the two above it.
  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: 'mock-frontier', role: 'author' });
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });
  assert.equal(sel.selected, null, 'the ceiling refuses all three — the flag is not a key to the budget');
  assert.deepEqual(
    sel.refusals.map((r) => r.rule),
    ['budget:new_writing-ceiling', 'budget:new_writing-ceiling', 'budget:new_writing-ceiling'],
    'both post candidates and the scout are refused, by the same rule',
  );
  const flagged = sel.refusals.find((r) => r.candidate.title === 'a frontier post');
  const plain = sel.refusals.find((r) => r.candidate.title === 'an ordinary post');
  assert.equal(flagged.reason, plain.reason, 'the refusal reads the TYPE and the tier; the flag is not in it');
  ctx.cleanup();
});

test('the selector and the budget do not read `frontier` at all — the exemption has no seam here', () => {
  // The structural half of the clause above, and the one that survives a
  // rewrite of the fixtures. `budgetGate(cfg, shares, c.type)` is handed a TYPE
  // and not a candidate, so there is nowhere for a flag to enter; this asserts
  // that no later edit gives it one. It is a source assertion on purpose — the
  // thing being measured is the ABSENCE of a coupling, which no fixture can
  // exhibit.
  const here = new URL('.', import.meta.url);
  for (const rel of ['../lib/select.mjs', '../lib/budget.mjs']) {
    const src = readFileSync(fileURLToPath(new URL(rel, here)), 'utf8');
    // Comments are prose about the module and may say the word; code may not.
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    // Targeted at how the flag is READ — `c.frontier`, a destructured
    // `{ frontier }`, `fm['frontier']`, `frontier_reason` — and deliberately
    // not at the bare word, because `frontier` is also the name of a TIER in
    // this file's own vocabulary and a quoted tier literal is not a flag.
    assert.ok(
      !/frontier_reason|\.frontier\b|\bfrontier\s*[,}]|\[\s*['"]frontier['"]\s*\]/.test(code),
      `${rel} reads \`frontier\`: specs/blog says the exemption "lifts a count, never a budget" — `
        + 'a `post` or `scout` candidate over the new-writing ceiling is refused whether or not it '
        + 'carries the flag, so the selector and the budget must not be able to see it',
    );
  }
  // The control: the word IS reachable in this repository, so the regexes above
  // are not vacuously true of every file.
  const proposals = readFileSync(fileURLToPath(new URL('../lib/proposals.mjs', here)), 'utf8');
  assert.match(proposals, /\.frontier\b/, 'the merge DOES read the flag — that is where the count is lifted');
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
