#!/usr/bin/env node
/**
 * pulse/run.mjs — the Pulse (specs/pulse, design D2).
 *
 * One ordinary command that performs, in order: stop-file check, source
 * fetching, snapshot/hash/diff, data-layer update (including mechanical stub
 * minting and lifecycle timeline appends), rolling link check, freshness
 * computation, derived-queue recomputation, site rebuild, and — only when
 * `data/config.json` has `publish: true` — the publish step.
 *
 * **It contains no model invocation on any path.** Nothing in this file's
 * dependency graph imports a model SDK, reads a model API key, or would
 * behave differently if every model credential on the machine vanished. That
 * is the property the whole economics of the site rests on: the front page
 * keeps changing on a day when no inference exists at all.
 *
 * Usage:
 *   node pulse/run.mjs                 the full run
 *   node pulse/run.mjs --force         ignore per-source fetch cadence
 *   node pulse/run.mjs --offline       no network: no fetches, no link checks
 *   node pulse/run.mjs --no-build      skip the site rebuild step
 *   node pulse/run.mjs --no-mint       skip mechanical stub minting
 *   node pulse/run.mjs --dry-run       publish step prints, executes nothing
 *   node pulse/run.mjs --assume-publish --dry-run
 *                                      print the publish: true path without
 *                                      touching data/config.json (a reserved
 *                                      path). Refused without --dry-run.
 *
 * Environment: `PULSE_ROOT` points the whole run at another tree (fixtures);
 * `PULSE_NOW` fixes the clock; `SITE_URL` overrides the deploy poll target.
 * No model-related variable is read anywhere.
 */

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { makeLogger, paths, readJsonl, repoRoot, today } from './lib/core.mjs';
import { loadRegistry, sortedSources } from './lib/registry.mjs';
import { ingestSource, loadSnapshot, loadState, saveState } from './lib/sources.mjs';
import { appendChanges, diffSnapshots, seedChanges } from './lib/diff.mjs';
import { readCorpus, corpusLinks } from './lib/corpus.mjs';
import { deriveDataLayer } from './lib/derive.mjs';
import { mintStubs, appendTimelineEvents } from './lib/mint.mjs';
import { rollingLinkCheck } from './lib/linkcheck.mjs';
import { computeFreshness } from './lib/freshness.mjs';
import { computeQueue, writeQueue } from './lib/queue.mjs';
import { corroborationFindings } from './lib/corroboration.mjs';
import { publishStep } from './lib/publish.mjs';

const argv = new Set(process.argv.slice(2));
const flag = (name, env) => argv.has(name) || process.env[env] === '1';

const options = {
  force: flag('--force', 'PULSE_FORCE'),
  offline: flag('--offline', 'PULSE_OFFLINE'),
  noBuild: flag('--no-build', 'PULSE_NO_BUILD'),
  noMint: flag('--no-mint', 'PULSE_NO_MINT'),
  dryRun: argv.has('--dry-run'),
  assumePublish: argv.has('--assume-publish'),
};

if (argv.has('--help') || argv.has('-h')) {
  process.stdout.write(
    'node pulse/run.mjs [--force] [--offline] [--no-build] [--no-mint] [--dry-run] [--assume-publish]\n',
  );
  process.exit(0);
}

const root = repoRoot();
const p = paths(root);
const log = makeLogger('pulse');

// ---- 1. stop-file check --------------------------------------------------
// The maintainer's brake. Exits immediately, does nothing, says so. Exit 0:
// a stopped Pulse is an instruction obeyed, not an error for a scheduler to
// alarm about.
if (existsSync(p.stop)) {
  process.stdout.write(`pulse: STOP file present at ${p.stop} — exiting immediately, nothing done.\n`);
  process.exit(0);
}

log.step('run', `root ${root}, date ${today()}${options.offline ? ', offline' : ''}${options.force ? ', forced' : ''}`);

const registry = loadRegistry(root);
log.step('registry', `${registry.sources.length} source(s): ${sortedSources(registry).map((s) => s.id).join(', ')}`);

// ---- 2/3. fetch, snapshot, hash, diff ------------------------------------
const freshChanges = [];
for (const source of sortedSources(registry)) {
  const result = await ingestSource(root, source, { force: options.force, offline: options.offline });
  const detail =
    result.action === 'refused'
      ? `REFUSING since ${result.since} (HTTP ${result.status}) — recorded, not routed around; last snapshot keeps serving`
      : result.action === 'error'
        ? `unreachable: ${result.error} — last snapshot keeps serving`
        : result.action === 'skipped' || result.action === 'offline'
          ? result.why
          : `${result.action}, ${result.rows} row(s)${result.skipped ? `, ${result.skipped} row(s) without an id skipped` : ''}`;
  log.step(`source ${source.id}`, detail);

  const latest = loadSnapshot(root, source.id, 'latest');
  const previous = loadSnapshot(root, source.id, 'previous');
  const candidates = diffSnapshots(source, previous, latest);

  // Launch-feed seeding: once per source, on the first ingestion of a source
  // whose rows carry their own dated historical records (specs/pulse).
  const state = loadState(root, source.id);
  if (source.seeds && latest && !state.seeded) {
    const seeds = seedChanges(source, latest);
    candidates.push(...seeds);
    state.seeded = true;
    state.seeded_on = today();
    saveState(root, source.id, state);
    log.step(`seed ${source.id}`, `${seeds.length} dated historical record(s) offered to the changed feed`);
  }

  const written = appendChanges(p.changes, candidates);
  if (candidates.length || written.length) {
    log.step(`diff ${source.id}`, `${candidates.length} change(s) computed, ${written.length} new line(s) appended`);
  }
  // Only newly recorded lines drive downstream effects — see appendChanges.
  freshChanges.push(...written.filter((c) => !c.seeded));
}

// ---- 4. data-layer update -----------------------------------------------
let corpus = readCorpus(root);
if (corpus.unreadable.length) log.warn(`${corpus.unreadable.length} content file(s) could not be parsed; skipped`);

// Hoisted out of the branch below because step 9 needs it: the paths minted
// here are half of what this run declares it wrote, and `--no-mint` must
// declare an empty list rather than an absent one. `[]` is the statement "I
// wrote no content"; `null` would mean "I am not saying", which puts the
// publish step back on wholesale staging (addictedtoai-ps3 / -y7d).
let mints = { minted: [] };
if (options.noMint) {
  log.step('mint', 'skipped (--no-mint)');
} else {
  mints = mintStubs(root, registry, corpus, { date: today() });
  log.step(
    'mint',
    `${mints.minted.length} stub(s) minted from ${mints.considered} undeclared row(s)` +
      (mints.collisions.length ? `, ${mints.collisions.length} slug collision(s) left untouched` : ''),
  );
  for (const c of mints.collisions) log.warn(`slug collision: row "${c.row_id}" would land on existing ${c.path} — not overwritten`);
  if (mints.minted.length) corpus = readCorpus(root);
}

const timeline = appendTimelineEvents(root, corpus, freshChanges);
log.step('timeline', `${timeline.appended.length} lifecycle event(s) appended to joined entries`);
if (timeline.appended.length) corpus = readCorpus(root);

const derived = deriveDataLayer(root, registry, corpus);
log.step(
  'data layer',
  `${derived.catalog_rows} catalog row(s), ${derived.deprecations} deprecation(s), ${derived.changed_30d} change(s) in 30d` +
    (derived.vanished.length ? `, ${derived.vanished.length} vanished feed row(s)` : ''),
);

// ---- 5. rolling link check ----------------------------------------------
const links = corpusLinks(corpus);
const linkResult = await rollingLinkCheck(root, links, { offline: options.offline });
// "broken" is reserved for a failure confirmed across two consecutive checks
// (CONFIRM_AFTER_FAILURES); a first failure is reported separately rather than
// summed into it, so the line never overstates what the check established.
const confirmedBroken = linkResult.broken.filter((b) => b.state === 'broken').length;
const failingOnce = linkResult.broken.length - confirmedBroken;
log.step(
  'link check',
  `${linkResult.total} link(s) known, ${linkResult.due} due, ${linkResult.checked} checked, ${confirmedBroken} broken` +
    (failingOnce ? `, ${failingOnce} failing once (not yet confirmed)` : '') +
    (linkResult.declined ? `, ${linkResult.declined} declined our user-agent (no verdict)` : '') +
    (linkResult.excluded ? `, ${linkResult.excluded} loopback/private/reserved host(s) not checkable` : ''),
);
// Where the citations land, printed separately from whether they resolve —
// nine of twelve URLs in the site's own reference-rot post returned 200, and a
// line that only counts failures says nothing about any of them.
const drifted = linkResult.drift?.length ?? 0;
const redirected = linkResult.redirected?.length ?? 0;
log.step(
  'destinations',
  `${redirected} link(s) land somewhere other than where they point` +
    (drifted
      ? `, ${drifted} of them on content this check can say is not what was cited (repair filed)`
      : ', none of which this check will call rot without reading the page (no repair filed)'),
);
for (const d of linkResult.drift ?? []) log.warn(`reference drift: ${d.url} -> ${d.final_url} (${d.kind})`);

// ---- 6. freshness --------------------------------------------------------
const freshness = computeFreshness(root, { registry, corpus, derived, linkResult });
log.step(
  'freshness',
  `${freshness.overdue_facts.length} overdue fact(s), ${freshness.tutorials.filter((t) => t.state === 'stale' || t.state === 'demoted').length} stale tutorial(s), ` +
    `${freshness.listings.filter((l) => l.state !== 'ok').length} listing(s) needing attention, ${freshness.sources.filter((s) => s.suspect).length} suspect source(s)`,
);

// ---- 7. derived queue ----------------------------------------------------
// One of the queue's inputs, computed here because it needs the corpus: where
// an entry declares that two of its facts measure the same quantity, compare
// them. Arithmetic, not judgment — nothing is edited, no source is marked
// authoritative, and a disagreement becomes a queue item rather than an error.
// A pair with an unresolvable side is not compared at all: absence is not
// disagreement. This is not a new pipeline step; it is part of recomputing the
// queue from current state.
const corroborations = corroborationFindings(root, corpus);
log.step(
  'corroboration',
  `${corroborations.length} declared pair(s) disagree` +
    (corroborations.length ? `: ${corroborations.map((c) => `${c.entry_id} ${c.a.field}/${c.b.field}`).join(', ')}` : ''),
);

const queue = computeQueue(root, { freshness, changesFile: p.changes, corroborations });
writeQueue(root, queue);
log.step('queue', `${queue.count} item(s) of ${queue.total_before_cap} (cap ${queue.cap}) — recomputed from state, never accumulated`);

// ---- 8. site rebuild -----------------------------------------------------
if (options.noBuild) {
  log.step('build', 'skipped (--no-build)');
} else if (!existsSync(`${root}/package.json`)) {
  log.step('build', 'skipped (no package.json at this root)');
} else {
  const res = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) {
    log.error(`site rebuild failed with exit code ${res.status}`);
    process.exit(res.status ?? 1);
  }
  log.step('build', 'ok');
}

// ---- 9. publish ----------------------------------------------------------
// What this run wrote under `content/`, declared to the publish step so it
// stages this run's work instead of sweeping up whatever anyone left dirty
// (addictedtoai-ps3). Both lists already carry repo-relative POSIX paths:
// `mints.minted[].path` from `relPosix` in mint.mjs writeStub(), and
// `timeline.appended[].path` from `relPosix` in corpus.mjs. Everything else
// this run touches — data/changes.jsonl, data/linkcheck.json, data/derived/**,
// data/sources/<id>/*, public/** — the step attributes by path on its own
// (`isEngineWrite`), so it is deliberately not repeated here.
const owned = [...mints.minted.map((m) => m.path), ...timeline.appended.map((a) => a.path)];
await publishStep(root, { dryRun: options.dryRun, assumePublish: options.assumePublish, log, owned });

const feedLines = readJsonl(p.changes).length;
log.step('done', `changed feed holds ${feedLines} line(s); queue holds ${queue.count} item(s)`);
process.exit(0);
