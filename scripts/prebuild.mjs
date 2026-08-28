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

/** @type {{ name: string, run: () => Promise<void> | void }[]} */
const STEPS = [
  // task 2.1–2.10 — schema validation, ids, aliases, transclusion, wants,
  // backlinks, indexability, redirects (vercel.json) and the internal-link
  // check. Runs before `next build` so a violation stops the build rather
  // than failing only the pages that happened to import the checker.
  { name: 'content', run: contentBuildStep },

  // tasks 4.2, 4.9, 4.12, 4.13 — the static files that are served alongside
  // the pages: the build stamp, the search index, the standing tables' JSON
  // siblings, the feeds and the open dataset. Second, because every one of
  // them is derived from the corpus the step above just validated.
  { name: 'assets', run: siteAssetsStep },
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
