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
import { acquireBuildLock, DEFAULT_WAIT_MS } from './build-lock.mjs';
import { isDirty } from '../lib/stamp.mjs';

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

  // make-the-blog-worth-sending task 3.7 — the voice lint. **ADVISORY: it
  // warns and never fails the build**, by the spec's own emphasis and for a
  // measured reason (see the header of scripts/check-post-voice.mjs). It joins
  // the currency-literal warning as a deliberate warn-not-fail check. If this
  // step ever starts failing builds, that is a defect in it, not a strict
  // reading of it.
  { name: 'post-voice', run: checkPostVoiceStep },

  // tasks 4.2, 4.9, 4.12, 4.13 — the static files that are served alongside
  // the pages: the build stamp, the search index, the standing tables' JSON
  // siblings, the feeds and the open dataset. Second, because every one of
  // them is derived from the corpus the step above just validated.
  { name: 'assets', run: () => siteAssetsStep({ dirty: checkoutDirty }) },
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
