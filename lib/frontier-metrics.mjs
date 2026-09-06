/**
 * frontier-metrics.mjs — what the registry's `frontier` block declares, read
 * from one place by everything that needs it (specs/pulse, "An index is
 * registered with its publisher and its rights"; `separate-a-claim-from-a-fact`
 * task 22).
 *
 * Three consumers, and they must not each carry their own idea of what
 * "registered" and "cleared" mean:
 *
 *   - `pulse/lib/frontier.mjs` computes leaders, ranked rows and counts, and
 *     appends `lead-change` lines, from what is declared here;
 *   - the site build asks which metrics are CLEARED, and hands that answer to
 *     the renderer, so a surface that would show an index value looks the
 *     registry up and then collapses (`lib/render/frontier.mjs`);
 *   - the build's report names any metric declared with no republication
 *     decision at all, because an unanswered question must not read as a
 *     cleared one.
 *
 * ## Why the rights answer is FOUR states and not a boolean
 *
 * `cleared`, `refused` and `unresolved` are what a decision may record;
 * `undeclared` is what a metric with no `rights` block at all is. The fourth
 * exists because a boolean would collapse "nobody has asked" into "no", and the
 * two behave the same at the surface but not on the ledger: `refused` is an
 * answer somebody paid for, `undeclared` is a question still owed. specs/pulse:
 * "An unanswered question SHALL be recorded as unanswered — a missing field and
 * a cleared right SHALL NOT look the same."
 *
 * ## Why the renderer is handed the registry's answer and not the derived file's
 *
 * `data/derived/frontier.json` is recomputed by the Pulse and carries values for
 * every registered metric, cleared or not — recording a value is not rendering
 * it, and `specs/pulse` already requires every material change entry to embed
 * its archived source excerpt. But rights change on the registry's clock, not
 * the Pulse's: flipping an outcome to `refused` must take effect at the next
 * BUILD, not at the next Pulse run. So the gate reads the registry, which is
 * also what specs/pulse says in as many words — "A surface that would show an
 * index value SHALL look up the registry, find no cleared metric, and collapse".
 */

import { ROOT } from './paths.mjs';

/** The block, with both collections present even when the registry declares none. */
export function frontierBlock(registry) {
  const block = registry?.frontier ?? {};
  return {
    metrics: Array.isArray(block.metrics) ? block.metrics : [],
    row_exclusions: Array.isArray(block.row_exclusions) ? block.row_exclusions : [],
  };
}

/** Every declared metric, in declaration order (the registry's own). */
export function frontierMetrics(registry) {
  return frontierBlock(registry).metrics;
}

/** `cleared` | `refused` | `unresolved` | `undeclared` — never a boolean. */
export function rightsState(metric) {
  const outcome = metric?.rights?.outcome;
  return outcome === undefined || outcome === null ? 'undeclared' : String(outcome);
}

/** May a surface print this metric's values? Only a recorded, cleared right says yes. */
export function isCleared(metric) {
  return rightsState(metric) === 'cleared';
}

/** The ids a surface may print a value for. Everything else orders but does not print. */
export function clearedMetricIds(registry) {
  return new Set(frontierMetrics(registry).filter(isCleared).map((m) => m.id));
}

/** Metrics declared with no republication decision at all — the build reports these. */
export function metricsAwaitingDecision(registry) {
  return frontierMetrics(registry).filter((m) => rightsState(m) === 'undeclared');
}

/**
 * Is this row id excluded from a metric's eligible rows by a DECLARED pattern?
 *
 * The two matcher forms are all there are (`pulse/lib/registry.mjs` refuses any
 * other), which is what keeps the list reviewable: a reader can tell what a
 * pattern excludes by reading it, and no entry can quietly become a regular
 * expression nobody can evaluate by eye.
 */
export function isRowExcluded(rowId, exclusions) {
  const id = String(rowId ?? '');
  for (const ex of exclusions ?? []) {
    if (typeof ex?.id_prefix === 'string' && ex.id_prefix !== '' && id.startsWith(ex.id_prefix)) return true;
    if (typeof ex?.id_contains === 'string' && ex.id_contains !== '' && id.includes(ex.id_contains)) return true;
  }
  return false;
}

/**
 * The build's report on metrics whose rights question is unanswered.
 *
 * REPORTS, NEVER FAILS. The registry load already refuses a MALFORMED decision;
 * an ABSENT one is a legal intermediate state — declaring the metric and
 * answering the rights question are two edits, often days apart — and the
 * requirement on it is that it "does not read as a cleared one", which is
 * satisfied by treating it as unregistered for rendering (which `isCleared`
 * does) and saying so out loud (which this does).
 *
 * It prints a line either way, so "every declared metric carries a decision" is
 * a stated measurement rather than the absence of an alarm.
 */
export async function frontierMetricsReportStep(opts = {}) {
  let registry = opts.registry;
  if (registry === undefined) {
    const { loadRegistry } = await import('../pulse/lib/registry.mjs');
    registry = loadRegistry(opts.root ?? ROOT);
  }
  const metrics = frontierMetrics(registry);
  const awaiting = metricsAwaitingDecision(registry);
  const cleared = metrics.filter(isCleared);
  const write = opts.write ?? ((s) => process.stdout.write(s));

  if (metrics.length === 0) {
    write('prebuild: frontier-metrics — no index metric is registered; no index value renders anywhere\n');
    return;
  }
  write(
    `prebuild: frontier-metrics — ${metrics.length} declared, ${cleared.length} with republication rights cleared` +
      (awaiting.length
        ? `; ${awaiting.length} carry NO republication decision and are therefore unregistered for rendering, ` +
          `not permitted by default (${awaiting.map((m) => m.id).join(', ')})`
        : '; every declared metric carries a decision') +
      '\n',
  );
}
