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
import { blogCeilingGate, tutorialDemotionGate, tutorialPriorityGate } from './surfaces.mjs';
import { conformanceGate, loadConformance } from './runners.mjs';
import { runnerHealthGate } from './health.mjs';

/**
 * Gather every candidate, in the spec's priority order: directives, then the
 * derived queue, then ripe proposals.
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
  for (const it of q.items) {
    candidates.push({ ...it, priority: 2, order: order++, tutorialVerify: isTutorialVerify(it) });
  }
  for (const p of props.ripe) candidates.push({ ...p, priority: 3, order: order++ });
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
    (c) => blogCeilingGate(ctx, c),
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
    if (refused) refusals.push({ candidate: c, rule: refused.rule, reason: refused.reason });
    else eligible.push(c);
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
