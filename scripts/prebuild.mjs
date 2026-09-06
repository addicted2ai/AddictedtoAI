#!/usr/bin/env node
/**
 * prebuild.mjs — everything that must happen before `next build`.
 *
 * `npm run build` is `node scripts/prebuild.mjs && next build`. This file
 * exists from task 1.1 so that later waves can add prebuild steps without
 * editing `package.json` (the manifest has a single owner — see
 * openspec/changes/build-initial-site/tasks.md).
 *
 * Steps that belong here as they are implemented:
 *   - task 4.13  write the build stamp (UTC timestamp + short commit hash)
 *                to `public/status.json` so it lands in `out/status.json`
 *   - task 2.9   generate `vercel.json` redirect rules from the checked-in
 *                `redirects.json`
 *
 * Register each one in STEPS below. A step is `{ name, run }` where `run`
 * is an async function; a step that throws fails the build, loudly, naming
 * itself. Do not swallow errors here: the build is the gate.
 */

import { contentBuildStep } from '../lib/build-content.mjs';
import { siteAssetsStep } from '../lib/site-assets.mjs';
import { anchorCheckStep } from '../lib/anchors.mjs';
import { checkPostVoiceStep } from './check-post-voice.mjs';
import { checkSpecDeltasStep } from './check-spec-deltas.mjs';
import { arxivPinStep } from '../lib/arxiv-pin.mjs';
import { declinedFieldsStep } from '../lib/declined-fields.mjs';
import { acquireBuildLock, DEFAULT_WAIT_MS } from './build-lock.mjs';
import { isDirty, dirtyPaths } from '../lib/stamp.mjs';

/**
 * One build at a time (beads addictedtoai-6s7). This is the right place for it
 * and the only one: every `npm run build` runs this file first — the loop's
 * gates inside a job worktree, the loop's post-merge build at the root,
 * `scripts/verify-launch.mjs`, and a person or an agent typing the command. A
 * lock taken in any single caller would leave the other callers racing.
 *
 * The holder is `process.ppid`, the shell npm spawned for
 * `node scripts/prebuild.mjs && next build`, because that process lives for the
 * whole build and this one does not. See scripts/build-lock.mjs for why the
 * lock is never released and how a crashed build is reclaimed.
 */
try {
  const waitMs = Number(process.env.ATAI_BUILD_LOCK_WAIT_MS ?? DEFAULT_WAIT_MS);
  const lock = acquireBuildLock({
    dir: process.cwd(),
    holderPid: process.ppid || process.pid,
    label: `npm run build (${process.cwd()})`,
    waitMs: Number.isFinite(waitMs) ? waitMs : DEFAULT_WAIT_MS,
    log: (s) => process.stdout.write(`${s}\n`),
  });
  if (lock.waitedMs > 1000) {
    process.stdout.write(`prebuild: waited ${(lock.waitedMs / 1000).toFixed(0)}s for the build lock\n`);
  }
} catch (err) {
  process.stderr.write(`prebuild: BUILD LOCK\n${err?.message ?? err}\n`);
  process.exit(1);
}

/**
 * THE CHECKOUT'S STATE, MEASURED BEFORE ANY STEP WRITES (beads addictedtoai-4w2).
 *
 * `dirty` in the build stamp means "this site was built from an uncommitted
 * tree". It was measuring something else. The `content` step below rewrites
 * eleven git-TRACKED files under `data/derived/` and regenerates
 * `vercel.json`; only afterwards did `assets` run `git status --porcelain`, so
 * the build dirtied the tree and then measured it. `data/derived/
 * freshness.json` carries a local date and per-listing `age_days`, which makes
 * that diff near-certain on any build that runs on a different calendar day
 * from the last committed Pulse run — so a production build from a perfectly
 * clean commit stamped itself `+dirty`.
 *
 * One line, here, before the loop: the answer is about the CHECKOUT, so it is
 * taken while the checkout is still what git last saw. `built_at` and `commit`
 * are untouched — `built_at` remains a wall-clock instant honestly carrying
 * `Z`, one of this repository's three deliberate exceptions to its local-date
 * rule, and `verify-surfaces`'s `checkStamp()` asserts all three unchanged.
 */
const checkoutDirty = isDirty();
// Taken at the same instant, and for the reason the ordering fix above did not
// settle: production went on stamping `+dirty` after it (addictedtoai-4w2), so
// the remaining cause lives in the BUILDER's checkout, which nothing in this
// repository can read. The stamp now names the files and the next deploy
// answers it. Empty whenever the checkout is clean.
const checkoutDirtyPaths = checkoutDirty ? dirtyPaths() : [];

/** @type {{ name: string, run: () => Promise<void> | void }[]} */
const STEPS = [
  // task 2.1–2.10 — schema validation, ids, aliases, transclusion, wants,
  // backlinks, indexability, redirects (vercel.json) and the internal-link
  // check. Runs before `next build` so a violation stops the build rather
  // than failing only the pages that happened to import the checker.
  { name: 'content', run: contentBuildStep },

  // make-the-blog-worth-sending task 3.5 — the anchor check. A `covers:`
  // reference that resolves to no line in `data/changes.jsonl`, or any declared
  // anchor date outside the 7 days ending on the post's own `date`, FAILS the
  // build naming the post and the reference (specs/blog). It sits next to
  // `content` because it is the same kind of claim about the same front matter,
  // and so its failure prints beside the other content failures rather than
  // after a screen of asset output. (Ordering is presentation only: this loop
  // runs every step and exits 1 at the end, so a later step is not skipped by
  // an earlier failure.)
  { name: 'anchors', run: anchorCheckStep },

  // beads addictedtoai-2xh — the versioned-citation check. `arxiv.org/abs/<id>`
  // serves the LATEST version, so an unversioned URL beside a VERBATIM
  // quotation names a document that moves; this corpus already carries a
  // sentence that is in v1's abstract and gone from v2's. It FAILS on a
  // quotation cited to an unversioned abstract and WARNS on the recorded debt
  // in `data/arxiv-pin-debt.json`, which may only shrink. It deliberately does
  // NOT touch citations that merely refer to a paper without quoting it —
  // those must stay unversioned so they track the live document. See the
  // header of lib/arxiv-pin.mjs for the measurement behind both halves.
  //
  // A step of its own rather than a call inside `contentBuildStep` because it
  // reads the corpus and nothing else, and because this file's own header names
  // STEPS as the registration point for a new build step.
  { name: 'arxiv-pins', run: arxivPinStep },

  // The declined-field cross-check. `data/sources/registry.json` may record
  // that a field a source serves is deliberately NOT carried;
  // `pulse/lib/registry.mjs` enforces that against `material_fields` — the
  // catalog column and the changed-feed line — and cannot see the corpus, so a
  // path the registry declines could still be bound as an entry fact with
  // nothing anywhere noticing. It was: 48 bindings across 29 model entries
  // pointed at `benchmarks.artificial_analysis` while the registry declined it,
  // and the build was green. FAILS on a binding of a declined path, naming the
  // registry entry and every binding file; WARNS on the recorded debt in
  // `data/declined-binding-debt.json`, which may only shrink. It needs the
  // registry and the corpus at once and the prebuild is the only place that
  // holds both — see the header of lib/declined-fields.mjs.
  { name: 'declined-fields', run: declinedFieldsStep },

  // make-the-blog-worth-sending task 3.7 — the voice lint. **ADVISORY: it
  // warns and never fails the build**, by the spec's own emphasis and for a
  // measured reason (see the header of scripts/check-post-voice.mjs). It joins
  // the currency-literal warning as a deliberate warn-not-fail check. If this
  // step ever starts failing builds, that is a defect in it, not a strict
  // reading of it.
  { name: 'post-voice', run: checkPostVoiceStep },

  // beads addictedtoai-vl9 — the pre-archive check on spec deltas. `openspec
  // archive` merges a change's delta into `openspec/specs/`, the reserved
  // constitution, and reads neither the world the delta describes nor the other
  // changes waiting to be archived. It is a third-party CLI with no hook, so
  // the only mechanism available is this one: every merged change passes
  // `npm run build`, so a delta that would poison the constitution fails here
  // the day it is authored rather than at the one-way door days later. It
  // FAILS on a MODIFIED/REMOVED/RENAMED heading that resolves to nothing, and
  // WARNS on cross-change collisions, archive-order dependencies,
  // change-relative narration and stale identifiers — see the header of
  // scripts/check-spec-deltas.mjs for why each is where it is.
  //
  // It reads `openspec/` only, so it is independent of the content corpus and
  // is placed after the content steps for that reason: its output is about a
  // different tree and reads better on its own.
  { name: 'spec-deltas', run: checkSpecDeltasStep },

  // tasks 4.2, 4.9, 4.12, 4.13 — the static files that are served alongside
  // the pages: the build stamp, the search index, the standing tables' JSON
  // siblings, the feeds and the open dataset. Second, because every one of
  // them is derived from the corpus the step above just validated.
  {
    name: 'assets',
    run: () => siteAssetsStep({ dirty: checkoutDirty, dirtyPaths: checkoutDirtyPaths }),
  },
];

let failed = false;
for (const step of STEPS) {
  try {
    await step.run();
    process.stdout.write(`prebuild: ${step.name} ok\n`);
  } catch (err) {
    failed = true;
    process.stderr.write(`prebuild: ${step.name} FAILED\n${err?.stack ?? err}\n`);
  }
}

if (failed) process.exit(1);
if (STEPS.length === 0) {
  process.stdout.write('prebuild: no steps registered yet\n');
}
