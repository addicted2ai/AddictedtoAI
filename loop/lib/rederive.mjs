/**
 * rederive.mjs — the loop's call into the SHARED derive step.
 *
 * Same argument, and the same shape, as `loop/lib/publish.mjs`: the derived
 * tree is the Pulse's to compute, there is deliberately no derivation code
 * under `loop/`, and this module locates the Pulse's step rather than
 * reimplementing it. Two derivations would drift, and the drifted one would be
 * the one that wrote `data/derived/`.
 *
 * Discovery is dynamic for the same reason publishing's is: the executor
 * contract makes the two halves swappable, and a static cross-package import
 * would quietly couple them.
 *
 * ---------------------------------------------------------------------------
 * WHY THE LOOP CALLS THIS AT ALL — addictedtoai-dgj and addictedtoai-942.
 *
 * The Desk treated `data/derived/` as ordinary content: something a job edits
 * and a merge reconciles. It is an OUTPUT, and that mistake cost work at both
 * ends of a merge.
 *
 *   dgj — both sides regenerate it, so the merge conflicts, and a job that had
 *     already passed its gates and been APPROVED is discarded. Observed
 *     2026-08-29 on j-20260829-03: 18.77 model-minutes lost to a conflict in
 *     freshness.json because the scheduled Pulse fired mid-job. A clean merge
 *     would have been worse — a derived tree matching no actual state.
 *   942 — nothing regenerates it afterwards, so the queue advertises work the
 *     job just finished and the next run is dispatched at completed work.
 *
 * The repair is one idea at two points, both in `loop/run.mjs`:
 *   1. before merging, the branch drops its derived changes, so it contributes
 *      none and cannot conflict over them;
 *   2. after merging, the tree is recomputed ONCE from the merged state.
 *
 * If the shared step is missing this REPORTS and does nothing, leaving the
 * derived tree as the merge left it. It does not improvise a derivation: a
 * wrong `data/derived/` is worse than a stale one, because the stale one is
 * at least the output of some real state.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Where the Pulse's step lives. Both spellings are checked so a move does not silently disable this. */
export const SHARED_DERIVE_CANDIDATES = ['pulse/lib/rederive.mjs', 'pulse/rederive.mjs'];

/**
 * The repo-relative paths the derivation owns.
 *
 * Declared here rather than imported from `pulse/` so `loop/run.mjs` needs no
 * static cross-package import — the same reason the publish step is discovered
 * at runtime. `pulse/lib/rederive.mjs` exports the identical list; they are
 * asserted equal by test so the two cannot drift.
 */
export const DERIVED_PATHS = Object.freeze(['data/derived']);

/** Loader seams, so the corpus and registry readers are also the Pulse's. */
const REGISTRY_CANDIDATES = ['pulse/lib/registry.mjs'];
const CORPUS_CANDIDATES = ['pulse/lib/corpus.mjs'];

export function findSharedDerive(repoRoot) {
  for (const rel of SHARED_DERIVE_CANDIDATES) {
    const p = join(repoRoot, rel);
    if (existsSync(p)) return p;
  }
  return null;
}

const findOne = (repoRoot, candidates) => {
  for (const rel of candidates) {
    const p = join(repoRoot, rel);
    if (existsSync(p)) return p;
  }
  return null;
};

/**
 * Recompute `data/derived/` from the merged state.
 *
 * @returns {Promise<{ok: boolean, reason: string, queueCount: number|null}>}
 */
export async function rederiveStep(ctx) {
  const shared = findSharedDerive(ctx.repoRoot);
  if (!shared) {
    const reason =
      `the shared derive step is not present (looked for ${SHARED_DERIVE_CANDIDATES.join(', ')}). ` +
      `Leaving data/derived/ as the merge left it rather than improvising a derivation.`;
    ctx.log(`rederive: SKIPPED — ${reason}`);
    return { ok: false, reason, queueCount: null };
  }

  const regPath = findOne(ctx.repoRoot, REGISTRY_CANDIDATES);
  const corpPath = findOne(ctx.repoRoot, CORPUS_CANDIDATES);
  if (!regPath || !corpPath) {
    const reason = 'the registry or corpus reader is missing; not deriving from a partial view';
    ctx.log(`rederive: SKIPPED — ${reason}`);
    return { ok: false, reason, queueCount: null };
  }

  try {
    const [mod, reg, corp] = await Promise.all([
      import(pathToFileURL(shared).href),
      import(pathToFileURL(regPath).href),
      import(pathToFileURL(corpPath).href),
    ]);
    const fn = mod.rederive ?? mod.default;
    if (typeof fn !== 'function') {
      const reason = `${shared} exports no \`rederive\` function`;
      ctx.log(`rederive: SKIPPED — ${reason}`);
      return { ok: false, reason, queueCount: null };
    }

    const registry = reg.loadRegistry(ctx.repoRoot);
    const corpus = corp.readCorpus(ctx.repoRoot);
    // Offline: this runs inside a merge, and a Desk job must not depend on the
    // network to finish. The link check's own state is preserved; the next
    // scheduled Pulse does the real checking.
    const out = await fn(ctx.repoRoot, { registry, corpus, offline: true });
    const count = out?.queue?.count ?? null;
    ctx.log(
      `rederive — data/derived/ recomputed from the merged state; queue holds ${count ?? '?'} item(s) ` +
        `(addictedtoai-dgj, addictedtoai-942)`,
    );
    return { ok: true, reason: 'recomputed', queueCount: count };
  } catch (err) {
    const reason = `derivation failed: ${err?.message ?? err}`;
    ctx.log(`rederive: SKIPPED — ${reason}`);
    return { ok: false, reason, queueCount: null };
  }
}
