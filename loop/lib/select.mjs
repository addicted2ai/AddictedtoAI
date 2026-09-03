/**
 * select.mjs — job selection.
 *
 * Everything that can refuse work refuses it HERE, before a model is invoked,
 * and every refusal names its rule. That is the difference between a budget
 * and an intention: specs/loop says the machinery ceiling in particular "is
 * enforced by the selector, not by good intentions", because the previous
 * version of this site spent roughly seven lines of process per line of site.
 *
 * "No qualifying job — do nothing" is a normal, healthy outcome and is
 * reported as one. A run that finds nothing worth doing ends without
 * manufacturing work.
 */

import { applyUpkeepFloor, budgetGate, degradationGate, lanePause, shedState, tierShares } from './budget.mjs';
import { readDirectives } from './directives.mjs';
import { isTutorialVerify, readQueue } from './queue.mjs';
import { readProposals, discardDuplicate } from './proposals.mjs';
import { tutorialDemotionGate, tutorialPriorityGate } from './surfaces.mjs';
import { conformanceGate, loadConformance } from './runners.mjs';
import { runnerHealthGate } from './health.mjs';

/**
 * Gather every candidate, in the spec's priority order: directives, then any
 * ripe proposal carrying an EXPIRY, then the derived queue, then every other
 * ripe proposal.
 *
 * The expiring band sits above the queue because an expiry is a deadline the
 * site set itself and the derived queue has none: an item the queue does not
 * reach today it recomputes tomorrow, while expiring evidence that is not
 * written before its date is swept to `dropped/` and gone. Measured
 * 2026-09-02 (addictedtoai-mtnk): the blog published nothing on 2026-09-01
 * across twenty-three jobs, because reviewers file carried findings into the
 * queue about as fast as jobs retire them (37 filed, 35 retired in three days,
 * 76% of them onto a file already carried), so source 2 never empties and news
 * was only ever reached in the gaps.
 *
 * A proposal with NO expiry is deliberately left below the queue: with no
 * deadline there is nothing to preempt for, and "proposals first" would be a
 * much larger claim than the evidence supports.
 *
 * So is an expiring proposal whose last attempt was DISCARDED — the band is
 * `preempts`, which `readProposals` clears once `discarded_attempts` is
 * stamped on the file. The precedence exists because the evidence has a
 * deadline, not to buy unlimited retries: a discarded job does not consume its
 * proposal (correctly — the idea was not what was rejected), so without this
 * the same candidate returns to the front on every run, unchanged, at ~35
 * model-minutes an attempt until it expires or three consecutive discards trip
 * breaker 1. Observed 2026-09-03, addictedtoai-z5dj. Demoting it restores
 * exactly the spacing that made a refused proposal self-limiting before this
 * band existed.
 *
 * This reorders which work is reached, never how much of each kind may run.
 * The upkeep floor and the new-writing ceiling are applied downstream in
 * `selectJob` and still bind, so an expiring proposal over the ceiling is
 * still refused.
 */
export function gatherCandidates(ctx, { dryRun = false } = {}) {
  const warnings = [];
  const notes = [];

  const { directives, warnings: dw } = readDirectives(ctx);
  warnings.push(...dw);

  const q = readQueue(ctx);
  warnings.push(...q.warnings);

  const props = readProposals(ctx);
  for (const m of props.malformed) warnings.push(`proposal ${m.path}: ${m.why} — skipped`);
  for (const c of props.cooling) notes.push(c.why);
  // Duplicate suppression happens before any model is invoked, by construction:
  // this loop runs during gathering, and no executor has been touched yet.
  for (const d of props.duplicates) {
    const r = discardDuplicate(ctx, d, { dryRun });
    notes.push(
      `proposal auto-discarded${r.moved ? ` to ${r.dest}` : ' (dry run: not moved)'}: ${d.why}`,
    );
  }

  const candidates = [];
  let order = 0;
  for (const d of directives) candidates.push({ ...d, priority: 1, order: order++ });
  // `readProposals` already returns ripe proposals expiry-first, soonest
  // first, so the stable sort below preserves "closest deadline wins" inside
  // the expiring band.
  for (const p of props.ripe) {
    if (p.preempts) candidates.push({ ...p, priority: 2, order: order++ });
  }
  for (const it of q.items) {
    candidates.push({ ...it, priority: 3, order: order++, tutorialVerify: isTutorialVerify(it) });
  }
  for (const p of props.ripe) {
    if (!p.preempts) candidates.push({ ...p, priority: 4, order: order++ });
  }
  candidates.sort((a, b) => a.priority - b.priority || a.order - b.order);
  return { candidates, warnings, notes, rejectionIndexUsed: props.rejected };
}

/**
 * Select one job for `runner`, or report why nothing qualified.
 *
 * @returns {{selected: object|null, refusals: Array, warnings: string[],
 *            notes: string[], shares: object, shed: object, lane: object}}
 */
export function selectJob(ctx, { cfg, ledger, runner, dryRun = false }) {
  const now = ctx.now();
  const refusals = [];

  const lane = lanePause(ledger, runner.provider, now);
  const shares = tierShares(cfg, ledger, runner.tier, now);
  const shed = shedState(cfg, ledger, runner.tier, now);

  const conformance = conformanceGate(loadConformance(ctx), runner.id);
  if (!conformance.ok) {
    return {
      selected: null,
      refusals: [{ candidate: null, rule: 'conformance:recorded-fail', reason: conformance.reason }],
      warnings: [],
      notes: [],
      shares,
      shed,
      lane,
      blocked: conformance.reason,
    };
  }

  // Runtime evidence that the runner cannot run at all — a dead credential, a
  // command template that never delivers the prompt. Refused here for the same
  // reason a recorded conformance FAIL is, and before a model is invoked.
  const health = runnerHealthGate(ledger, runner.id);
  if (!health.ok) {
    return {
      selected: null,
      refusals: [{ candidate: null, rule: health.rule, reason: health.reason }],
      warnings: [],
      notes: [],
      shares,
      shed,
      lane,
      blocked: health.reason,
    };
  }

  if (lane.paused) {
    return {
      selected: null,
      refusals: [{ candidate: null, rule: 'capacity:lane-paused', reason: lane.reason }],
      warnings: [],
      notes: [],
      shares,
      shed,
      lane,
      blocked: lane.reason,
    };
  }

  const { candidates, warnings, notes } = gatherCandidates(ctx, { dryRun });

  const gates = [
    (c) => degradationGate(cfg, shed, c),
    (c) => budgetGate(cfg, shares, c.type),
    // `blogCeilingGate` stood here and was removed with the ceiling itself
    // (make-the-blog-worth-sending, task 1.3): no gate counts published posts.
    (c) => tutorialDemotionGate(ctx, c),
    (c) => tutorialPriorityGate(c, candidates),
  ];

  const eligible = [];
  for (const c of candidates) {
    let refused = null;
    for (const g of gates) {
      const r = g(c);
      if (!r.ok) {
        refused = r;
        break;
      }
    }
    // Spread rather than pick three fields: a budget refusal also carries
    // `category_mm`, `denominator_mm`, `denominator_substituted` and
    // `denominator_origin` (specs/loop, `A budget refusal states the arithmetic
    // it refused on`), and a hand-listed copy here is how a recorded value comes
    // to exist nowhere anyone reads it.
    if (refused) {
      const { ok, ...rest } = refused;
      refusals.push({ candidate: c, ...rest });
    } else eligible.push(c);
  }

  const floor = applyUpkeepFloor(cfg, shares, eligible);
  refusals.push(...floor.refused);

  const selected = floor.candidates[0] ?? null;
  return {
    selected,
    refusals,
    warnings,
    notes,
    shares,
    shed,
    lane,
    considered: candidates.length,
  };
}

/** One line per refusal, each naming its rule — what the selector prints. */
export function formatRefusals(refusals) {
  return refusals.map(
    (r) =>
      `  refused [${r.rule}] ${r.candidate ? `${r.candidate.type}: ${String(r.candidate.title).slice(0, 70)}` : '(all work)'}\n` +
      `      ${r.reason}`,
  );
}
