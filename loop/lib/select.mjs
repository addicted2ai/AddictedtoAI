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
import { categoryOf } from './config.mjs';
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
 * That last clause — 76% onto a file already carried — is now acted on rather
 * than only observed. `pulse/lib/queue.mjs`'s `carriedFindingItems` emits one
 * item per SUBJECT instead of one per file, so a subject holding four findings
 * is one job and not four. Re-measured 2026-09-03: 26 standing findings on 15
 * subjects. It does not change how fast findings are FILED, and it does not
 * touch this ordering; it changes how many jobs the same backlog costs to
 * drain, which is the half of the arithmetic a selector cannot fix.
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
 * @returns {{selected: object|null, topRanked: object|null, refusals: Array,
 *            warnings: string[], notes: string[], shares: object, shed: object,
 *            lane: object, conformanceEntries?: number}}
 */
/**
 * A runner's own clearance for the KIND of work, the exact counterpart of
 * `roles` for the kind of PASS. `roles` already decides that a given entry may
 * author but not review; this decides that it may author some job types and not
 * others, and it is declared in the same place for the same reason — the runner
 * registry is the only file permitted to describe a model, so a statement about
 * what a particular model should be trusted with belongs there and nowhere in
 * this directory.
 *
 * ABSENT MEANS EVERY TYPE. Every entry that predates this field keeps its
 * behaviour, and the restriction only exists where someone wrote one down.
 *
 * IT IS FIRST IN THE GATE LIST DELIBERATELY. A candidate this runner may never
 * take should be refused before the budget, the shed level or the upkeep floor
 * have an opinion about it, so the refusal line a person reads names the real
 * reason rather than whichever gate happened to fire first.
 *
 * @returns {{ok: true} | {ok: false, rule: string, reason: string}}
 */
export function runnerJobTypeGate(runner, candidate) {
  const cleared = runner?.job_types;
  if (!Array.isArray(cleared) || cleared.includes(candidate.type)) return { ok: true };
  return {
    ok: false,
    rule: 'runner:job-type',
    reason:
      `runner "${runner.id}" is cleared for ${cleared.join(', ')} jobs and this is a ` +
      `${candidate.type} job. That clearance is declared on the runner's own registry ` +
      `entry, so another runner can take this work; it is not a budget or a capacity refusal`,
  };
}

export function selectJob(ctx, { cfg, ledger, runner, dryRun = false }) {
  const now = ctx.now();
  const refusals = [];

  const lane = lanePause(ledger, runner.provider, now);
  const shares = tierShares(cfg, ledger, runner.tier, now);
  const shed = shedState(cfg, ledger, runner.tier, now);

  if (runner?.enabled === false) {
    const reason =
      `runner "${runner.id}" is disabled (enabled: false) and cannot be used for author or reviewer roles`;
    return {
      selected: null,
      topRanked: null,
      refusals: [{ candidate: null, rule: 'runner:disabled', reason }],
      warnings: [],
      notes: [],
      shares,
      shed,
      lane,
      blocked: reason,
    };
  }

  const conformance = conformanceGate(loadConformance(ctx), runner.id);
  if (!conformance.ok) {
    return {
      selected: null,
      topRanked: null,
      refusals: [{ candidate: null, rule: 'conformance:recorded-fail', reason: conformance.reason }],
      warnings: [],
      notes: [],
      shares,
      shed,
      lane,
      conformanceEntries: conformance.entries,
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
      topRanked: null,
      refusals: [{ candidate: null, rule: health.rule, reason: health.reason }],
      warnings: [],
      notes: [],
      shares,
      shed,
      lane,
      conformanceEntries: conformance.entries,
      blocked: health.reason,
    };
  }

  if (lane.paused) {
    return {
      selected: null,
      topRanked: null,
      refusals: [{ candidate: null, rule: 'capacity:lane-paused', reason: lane.reason }],
      warnings: [],
      notes: [],
      shares,
      shed,
      lane,
      conformanceEntries: conformance.entries,
      blocked: lane.reason,
    };
  }

  const { candidates, warnings, notes } = gatherCandidates(ctx, { dryRun });
  const topCandidate = candidates[0] ?? null;
  let topRanked = null;

  const gates = [
    (c) => runnerJobTypeGate(runner, c),
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
      if (c === topCandidate) topRanked = { candidate: c, rule: refused.rule };
    } else eligible.push(c);
  }

  const floor = applyUpkeepFloor(cfg, shares, eligible);
  refusals.push(...floor.refused);
  if (topRanked === null && topCandidate) {
    const floorRefusal = floor.refused.find((r) => r.candidate === topCandidate);
    if (floorRefusal) topRanked = { candidate: topCandidate, rule: floorRefusal.rule };
  }

  const selected = floor.candidates[0] ?? null;
  return {
    selected,
    topRanked,
    refusals,
    warnings,
    notes,
    shares,
    shed,
    lane,
    conformanceEntries: conformance.entries,
    considered: candidates.length,
  };
}

// ---------------------------------------------------------------------------
// Work-order bundler (Stage 2, task 53).
//
// Groups affordable candidates — the eligible list the caller filtered through
// the budget, shed and upkeep gates above, in priority order — by coherence
// key within the four work-order bounds, and splits an over-bound set into
// more work orders rather than truncating it. A candidate that alone exceeds
// the per-subject bound is refused at selection with a recorded reason.
//
// The four bounds are `work_order.max_items` (4), `work_order.max_subjects`
// (4), `work_order.max_reviewed_bytes` (60000) and
// `work_order.max_reviewed_bytes_per_subject` (30000), read from the passed
// config with those values as the default while the reserved-path block that
// carries them has not landed. Coherence is the spec's key: the same budget
// category plus a shared subject path — pathless candidates (new-writing
// types with no existing file to sum) cohere on category plus source cohort
// instead, and are measured by their declared-subject estimate.
//
// Per-candidate subjects come from DECLARED metadata only: an explicit
// `subjects` list, a `subject` string, a queue-style `target`/`path`, carried
// proposal front matter (`fm`/`frontmatter`), or the raw declared entry
// (`raw`, an object — the queue entry's own subject fields). The candidate's
// title, detail, task text and body are NEVER read for paths: a brief names
// paths in order to forbid them as readily as to assign them, so matching
// prose would read a prohibition as an authorisation.
//
// Measurement is per candidate: the sum of the measured bytes of its
// measurable declared subjects through the injected `measure` seam, else the
// size its declared metadata gives for the subject (`reviewedBytes`,
// `estimatedBytes` or `estimateBytes`, falling back to the raw entry's
// declared estimate), never zero and never a refusal for pathlessness —
// having no file to sum is an ordinary state for new writing, not a defect.
// An order's total is the sum of its candidates' sizes; each named subject
// additionally accumulates the full size of every candidate naming it, which
// is conservative (fail-closed) for multi-subject candidates. The bundler
// performs no graph query: the brief-side annex and the merge-side
// corroboration read the bundler's declared subjects later; this step only
// declares them.
// ---------------------------------------------------------------------------

/** Default work-order bounds, pending the reserved-path block that carries them. */
export const WORK_ORDER_DEFAULTS = Object.freeze({
  maxItems: 4,
  maxSubjects: 4,
  maxReviewedBytes: 60000,
  maxReviewedBytesPerSubject: 30000,
});

/**
 * Fallback size for a candidate whose declared metadata gives no estimate.
 * Positive by construction (a measured size is never zero) and small enough
 * that four estimated newcomers fit comfortably inside every bound.
 */
export const WORK_ORDER_PATHLESS_ESTIMATE_BYTES = 2000;

/**
 * The four work-order bounds from config, with task-53 defaults for keys the
 * reserved-path block has not added yet. A bound that IS present but is not
 * a positive number fails loudly: a bound that parses as unlimited is how a
 * ceiling stops bounding anything.
 */
export function workOrderBounds(cfg) {
  const w = cfg?.work_order ?? {};
  const pick = (key, dflt) => {
    const v = w[key];
    if (v === undefined || v === null) return dflt;
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) {
      throw new Error(
        `work_order.${key} must be a positive number, got ${JSON.stringify(v)}`,
      );
    }
    return v;
  };
  return {
    maxItems: pick('max_items', WORK_ORDER_DEFAULTS.maxItems),
    maxSubjects: pick('max_subjects', WORK_ORDER_DEFAULTS.maxSubjects),
    maxReviewedBytes: pick('max_reviewed_bytes', WORK_ORDER_DEFAULTS.maxReviewedBytes),
    maxReviewedBytesPerSubject: pick(
      'max_reviewed_bytes_per_subject',
      WORK_ORDER_DEFAULTS.maxReviewedBytesPerSubject,
    ),
  };
}

/** Normalise one declared-subject field to a sorted, de-duplicated name list. */
function normalizeSubjectList(value) {
  const arr = Array.isArray(value) ? value : [value];
  const out = [];
  for (const entry of arr) {
    if (typeof entry !== 'string') continue;
    const name = entry.replace(/\\/g, '/').trim();
    if (!name || out.includes(name)) continue;
    out.push(name);
  }
  return out.sort();
}

/**
 * A candidate's declared subjects, from structured metadata only. Never the
 * title, detail, task text or body (see the block comment above).
 */
export function candidateSubjects(candidate) {
  if (!candidate || typeof candidate !== 'object') return [];
  let out = normalizeSubjectList(candidate.subjects);
  if (out.length) return out;
  out = normalizeSubjectList(candidate.subject);
  if (out.length) return out;
  // A queue entry's declared path field — a declared slot, not prose.
  if (typeof candidate.target === 'string' && candidate.target.trim()) {
    out = normalizeSubjectList(candidate.target);
    if (out.length) return out;
  }
  if (typeof candidate.path === 'string' && candidate.path.trim()) {
    out = normalizeSubjectList(candidate.path);
    if (out.length) return out;
  }
  // Carried proposal front matter, when a reader preserved it structurally.
  for (const fm of [candidate.fm, candidate.frontmatter]) {
    if (!fm || typeof fm !== 'object') continue;
    out = normalizeSubjectList(fm.subjects);
    if (out.length) return out;
    out = normalizeSubjectList(fm.subject);
    if (out.length) return out;
  }
  // The raw declared entry (the queue entry's own subject fields).
  const raw = candidate.raw;
  if (raw && typeof raw === 'object') {
    for (const key of ['subjects', 'subject', 'target', 'path']) {
      out = normalizeSubjectList(raw[key]);
      if (out.length) return out;
    }
  }
  return [];
}

/**
 * A candidate's reviewed size in bytes: measured subjects summed through the
 * `measure` seam where any subject measures, else the declared-subject
 * estimate from the candidate's own metadata, else the positive fallback.
 * Never zero, and pathlessness alone never refuses — the refusal rules live
 * in `bundleWorkOrders` and none of them fires on "has no file".
 */
export function candidateReviewedBytes(candidate, { measure } = {}) {
  const subjects = candidateSubjects(candidate);
  if (subjects.length && typeof measure === 'function') {
    let sum = 0;
    for (const subject of subjects) {
      let n = null;
      try {
        n = measure(subject, candidate);
      } catch {
        n = null;
      }
      if (typeof n === 'number' && Number.isFinite(n) && n > 0) sum += Math.floor(n);
    }
    if (sum > 0) return sum;
  }
  const holders = [candidate];
  if (candidate?.raw && typeof candidate.raw === 'object') holders.push(candidate.raw);
  for (const holder of holders) {
    for (const key of ['reviewedBytes', 'estimatedBytes', 'estimateBytes', 'reviewed_bytes', 'estimated_bytes']) {
      const n = holder?.[key];
      if (typeof n === 'number' && Number.isFinite(n) && n > 0) {
        return Math.max(1, Math.floor(n));
      }
    }
  }
  return WORK_ORDER_PATHLESS_ESTIMATE_BYTES;
}

/**
 * The coherence key: budget category plus the primary (first-sorted)
 * declared subject, or — for candidates with no declared subject at all —
 * category plus source cohort. Two candidates may travel together only under
 * one key; count only bounds how many do.
 */
export function coherenceKey(candidate, { category } = {}) {
  const cat = typeof category === 'string' && category ? category : 'uncategorized';
  const subjects = candidateSubjects(candidate);
  if (subjects.length) return `${cat}\nsubject:${subjects[0]}`;
  const source =
    typeof candidate?.source === 'string' && candidate.source.trim()
      ? candidate.source.trim()
      : 'unknown';
  return `${cat}\ncohort:${source}`;
}

/** Whether `order` still fits `size` bytes on `subjects` under `bounds`. */
function orderFits(order, subjects, size, bounds) {
  if (order.items.length + 1 > bounds.maxItems) return false;
  let distinct = order.subjects.length;
  for (const s of subjects) if (!order.subjects.includes(s)) distinct += 1;
  if (distinct > bounds.maxSubjects) return false;
  if (order.totalBytes + size > bounds.maxReviewedBytes) return false;
  for (const s of subjects) {
    if ((order.perSubjectBytes[s] ?? 0) + size > bounds.maxReviewedBytesPerSubject) return false;
  }
  return true;
}

/**
 * Group affordable candidates (priority order, most urgent first) into work
 * orders. Returns `{ orders, refusals }`: each order carries its coherence
 * `key`, `category`, `governingType` (its first item's type — one order, one
 * category, one type in charge), `items`, the union `subjects`, `totalBytes`
 * and `perSubjectBytes`. A candidate that alone exceeds a bound it can never
 * fit — more subjects than `max_subjects`, more bytes than the per-subject
 * limit, or more bytes than the total — is refused at selection with a
 * recorded reason naming the bound and the measured size, never silently
 * dropped: a bound that silently removes work has become the work list.
 */
export function bundleWorkOrders(candidates, { cfg = null, bounds = null, measure = null } = {}) {
  const b = bounds ?? workOrderBounds(cfg);
  const meas = typeof measure === 'function' ? measure : () => null;
  const orders = [];
  const lastByKey = new Map();
  const refusals = [];
  for (const c of candidates ?? []) {
    const subjects = candidateSubjects(c);
    const size = candidateReviewedBytes(c, { measure: meas });
    const category = (cfg ? categoryOf(cfg, c?.type) : null) ?? 'uncategorized';
    const key = coherenceKey(c, { category });
    const label = String(c?.title ?? c?.slug ?? c?.id ?? c?.type ?? 'candidate').slice(0, 80);
    if (subjects.length > b.maxSubjects) {
      refusals.push({
        candidate: c,
        rule: 'work-order:subject-count',
        reason:
          `candidate "${label}" declares ${subjects.length} subjects, exceeding ` +
          `work_order.max_subjects ${b.maxSubjects} on its own — refused at selection ` +
          `(recorded here, not silently dropped)`,
      });
      continue;
    }
    if (size > b.maxReviewedBytesPerSubject) {
      refusals.push({
        candidate: c,
        rule: 'work-order:per-subject-bound',
        reason:
          `candidate "${label}" measures ${size} reviewed bytes, exceeding ` +
          `work_order.max_reviewed_bytes_per_subject ${b.maxReviewedBytesPerSubject} on its ` +
          `own — refused at selection (recorded here, not silently dropped)`,
      });
      continue;
    }
    if (size > b.maxReviewedBytes) {
      refusals.push({
        candidate: c,
        rule: 'work-order:total-bound',
        reason:
          `candidate "${label}" measures ${size} reviewed bytes, exceeding ` +
          `work_order.max_reviewed_bytes ${b.maxReviewedBytes} on its own — refused at ` +
          `selection (recorded here, not silently dropped)`,
      });
      continue;
    }
    let order = lastByKey.get(key) ?? null;
    if (order && !orderFits(order, subjects, size, b)) order = null;
    if (!order) {
      order = {
        key,
        category,
        governingType: c?.type ?? null,
        items: [],
        subjects: [],
        totalBytes: 0,
        perSubjectBytes: {},
      };
      orders.push(order);
      lastByKey.set(key, order);
    }
    order.items.push(c);
    for (const s of subjects) {
      if (!order.subjects.includes(s)) order.subjects.push(s);
      order.perSubjectBytes[s] = (order.perSubjectBytes[s] ?? 0) + size;
    }
    order.totalBytes += size;
  }
  for (const order of orders) order.subjects.sort();
  return { orders, refusals };
}

/**
 * Resolve the one declared escalation step for a selection.
 *
 * The selector owns the refusal rule and the registry owns the destination.
 * Keeping this decision pure lets callers test the routing policy without
 * reading files, invoking an executor, or consulting a second policy source.
 */
export function escalationTarget(registry, runner, sel) {
  if (sel?.topRanked?.rule !== 'runner:job-type') return null;
  if (runner?.escalates_to === undefined) return null;
  const target = registry?.byId?.get(runner.escalates_to) ?? null;
  return target?.enabled === false ? null : target;
}

/** One line per refusal, each naming its rule — what the selector prints. */
export function formatRefusals(refusals) {
  return refusals.map(
    (r) =>
      `  refused [${r.rule}] ${r.candidate ? `${r.candidate.type}: ${String(r.candidate.title).slice(0, 70)}` : '(all work)'}\n` +
      `      ${r.reason}`,
  );
}
