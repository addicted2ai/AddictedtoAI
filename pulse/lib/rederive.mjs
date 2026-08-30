/**
 * rederive.mjs — recompute the whole derived tree from committed state.
 *
 * THE ONE DERIVATION. `data/derived/` is a pure function of state (CLAUDE.md:
 * "Every Pulse run recomputes it from scratch, so a re-run with no world
 * change is byte-identical"), and until now only `pulse/run.mjs` knew the
 * sequence that computes it. The Desk needed the same sequence after a merge,
 * and the choice was between a second implementation that could drift and one
 * shared function. This is the shared function.
 *
 * ---------------------------------------------------------------------------
 * WHY THE DESK NEEDS IT, which is two beads issues with one root cause.
 *
 * The Desk treated the derived tree as ordinary content — something a job
 * edits and a merge reconciles. It is not; it is an output. That produced a
 * defect at each end of a merge:
 *
 *   addictedtoai-dgj — BOTH SIDES regenerate it, so the merge conflicts. Worse
 *     when it does NOT conflict: a clean three-way merge of two derivations
 *     produces a tree corresponding to no actual state.
 *         branch  = derive(OLD snapshot + repaired entry)
 *         main    = derive(NEW snapshot + unrepaired entry)
 *         correct = derive(NEW snapshot + repaired entry)   <- neither has it
 *     Observed 2026-08-29: j-20260829-03 was authored, passed its gates, was
 *     APPROVED, and then lost all 18.77 model-minutes to a conflict in
 *     data/derived/freshness.json because the scheduled Pulse fired mid-job.
 *
 *   addictedtoai-942 — NEITHER SIDE regenerates it afterwards, so the queue
 *     keeps advertising work the job just finished. Observed on both
 *     j-20260830-01 and -02; the next run can be dispatched at completed work
 *     and spends an author AND a review invocation discovering there is
 *     nothing to do.
 *
 * Recomputing after the merge answers both: the merge carries only authored
 * files, and the derived tree is then computed once, from the merged state.
 *
 * ---------------------------------------------------------------------------
 * THE TRAP IN HERE, measured rather than reasoned.
 *
 * `computeFreshness` wants the object `rollingLinkCheck` RETURNS, not the
 * committed `data/linkcheck.json`. The two look interchangeable and are not:
 * passing the file type-checks, runs without error, and silently produces a
 * freshness.json with `link_check` zeroed and every listing's `since` null.
 * Caught 2026-08-29 only by reading the diff. So this function always calls
 * `rollingLinkCheck` — with `offline: true` by default, which returns the
 * correct shape while touching no network.
 */

import { paths } from './core.mjs';
import { deriveDataLayer } from './derive.mjs';
import { rollingLinkCheck } from './linkcheck.mjs';
import { computeFreshness } from './freshness.mjs';
import { corroborationFindings } from './corroboration.mjs';
import { computeQueue, writeQueue } from './queue.mjs';
import { corpusLinks } from './corpus.mjs';

/**
 * Recompute `data/derived/` and the work queue.
 *
 * @param {string}  root                  repository root
 * @param {object}  o
 * @param {object}  o.registry            loaded source registry
 * @param {object}  o.corpus              loaded corpus
 * @param {boolean} [o.offline=true]      skip the network in the link check
 * @returns {Promise<{derived,linkResult,freshness,corroborations,queue}>}
 */
export async function rederive(root, { registry, corpus, offline = true }) {
  const p = paths(root);

  const derived = deriveDataLayer(root, registry, corpus);
  const linkResult = await rollingLinkCheck(root, corpusLinks(corpus), { offline });
  const freshness = computeFreshness(root, { registry, corpus, derived, linkResult });
  const corroborations = corroborationFindings(root, corpus);

  // `registry` is passed so the queue applies the same `event: false` decision
  // the diff applies — a field the registry says is not an event stops
  // producing `interpret` jobs (addictedtoai-e31).
  const queue = computeQueue(root, { freshness, changesFile: p.changes, corroborations, registry });
  writeQueue(root, queue);

  return { derived, linkResult, freshness, corroborations, queue };
}

/** Repo-relative paths this function owns and may rewrite. */
export const DERIVED_PATHS = Object.freeze(['data/derived']);
