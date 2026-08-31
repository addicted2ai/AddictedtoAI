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
import { gitTry } from './git.mjs';

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

/**
 * The repo-relative paths `data/derived/` is a pure function OF — addictedtoai-djd.
 *
 * Not every input the shared derive step happens to read (`data/sources/
 * registry.json` is hand-authored and rarely changes; the ledger and
 * `linkcheck.json` are read too), but the ones CLAUDE.md itself names as the
 * non-derivable state a re-derive is computed from: "the state that tree was
 * computed from (`data/changes.jsonl`, the source snapshots, the corpus)".
 * This is the same enumerable set the beads issue's own suggested fix names,
 * kept as a list rather than re-derived from `isEngineWrite` in
 * `pulse/lib/publish.mjs` — that function answers a different question ("did
 * an engine write this") and would happily call `data/derived/` itself an
 * input, which is exactly backwards here.
 */
export const DERIVED_INPUT_PATHS = Object.freeze(['data/changes.jsonl', 'data/sources', 'content']);

/**
 * Is any of `data/derived/`'s own inputs dirty in the MAIN working tree right
 * now — uncommitted, and therefore not something the committed history beside
 * a `data/derived/` commit could reproduce?
 *
 * MEASURED, 2026-08-31 (addictedtoai-djd). Commit `8f83b04` ("job
 * j-20260831-01: records (done)") committed a recomputed `data/derived/queue.json`
 * naming an `interpret` item over a change record that lived only in a still-
 * dirty `data/changes.jsonl` — 91 lines in the working tree, 90 committed. The
 * very next job's branch, cut from that commit, inherited the queue item
 * without the record it names: `pulse/lib/queue.mjs` derives those items from
 * `data/changes.jsonl`, and the branch's copy of that file had no such line.
 * `blocked: the change record this job annotates is not on this branch` was
 * the correct, honest outcome — 15.47 model-minutes spent finding that out.
 *
 * `-uall`, like `pulse/lib/publish.mjs`'s `dirtyPaths`: a newly-appended
 * source snapshot or a brand-new `content/` file is untracked, not modified,
 * and the default `--untracked-files=normal` would report its directory
 * rather than the file — which for `data/sources/<id>/` would report the
 * whole source as "dirty" on every run, forever.
 *
 * @returns {string[]|null} the dirty repo-relative paths, or `null` — "cannot
 *   tell" — when `git status` itself fails (not a repository, or a transient
 *   failure). The caller errs toward NOT committing on `null`, the same
 *   direction every guard in this codebase errs when it cannot read the tree.
 */
export function dirtyDerivedInputs(repoRoot) {
  const present = DERIVED_INPUT_PATHS.filter((p) => existsSync(join(repoRoot, p)));
  if (present.length === 0) return [];
  const r = gitTry(repoRoot, ['status', '--porcelain=v1', '-uall', '--', ...present]);
  if (!r.ok) return null;
  return r.stdout
    .split('\n')
    .map((l) => l.trimEnd())
    .filter(Boolean)
    // porcelain's first two columns are status codes; the path starts at
    // column 4. Not `-z`-decoded: this is a report for a log line, not a
    // pathspec fed back to `git add`, and every path in this repository's own
    // input set is plain ASCII.
    .map((l) => l.slice(3).replace(/^"|"$/g, ''));
}

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
