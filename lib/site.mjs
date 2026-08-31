/**
 * site.mjs — one site model, built once per process, shared by every page.
 *
 * Wave 2's `buildSite()` returns the fully processed corpus: every doc already
 * carries `url`, `html`, `hrefs` and `wikiLinks`, every entry additionally
 * `factsHtml` and `index`. Page templates render *from that* rather than
 * re-deriving anything, so what the content gates ran against is what the
 * visitor sees. Re-parsing the corpus in a page component would create a
 * second, unchecked pipeline — the exact failure the gates exist to prevent.
 *
 * The memo is per process, and `next build` renders routes in worker
 * processes, so this runs once per worker (~0.3s over 388 entries, measured).
 * That is cheap enough that no serialised intermediate is worth its
 * staleness risk.
 *
 * Everything below the memo is a *view*: an ordering, a join, or a state
 * decision. No view reads a file the corpus did not already read, except the
 * three the Pulse owns (`catalog.json`, `status-tables.json`, `changes.jsonl`),
 * which are data, not content.
 */

import { buildSite } from './build-content.mjs';
import { readJson } from './paths.mjs';
import { join } from 'node:path';
import { DERIVED_DIR } from './paths.mjs';
import { STATIC_ASSET_ROUTES } from './asset-routes.mjs';
import { SITE_HOSTS } from './site-config.mjs';
import { browsableEntries } from './indexability.mjs';
import { loadCatalog, catalogRows, deprecationRows } from './catalog.mjs';
import { readChanges, changedFeed } from './changes.mjs';
import { tutorialStates } from './tutorials.mjs';
import { listingStates } from './listings.mjs';
import { ladder, checkPrerequisiteCycles, checkPrerequisiteLevels } from './learn.mjs';
import { postsNewestFirst } from './posts.mjs';
import { deltasNewestFirst } from './deltas.mjs';
import { buildSearchIndex } from './search-index.mjs';
import { buildStamp, readStatusFile } from './stamp.mjs';

const FRESHNESS_FILE = join(DERIVED_DIR, 'freshness.json');

/** @type {Promise<object>|null} */
let memo = null;

/** Force a rebuild — tests only; nothing in the build calls this. */
export function resetSiteCache() {
  memo = null;
}

async function assemble(opts = {}) {
  const site = await buildSite({
    write: false,
    extraRoutes: STATIC_ASSET_ROUTES,
    siteHosts: SITE_HOSTS,
    ...opts,
  });

  const corpus = site.corpus;
  const today = site.today;
  const freshness = await readJson(FRESHNESS_FILE, { listings: [], sources: [], tutorials: [] });
  const { catalog, tables } = await loadCatalog();
  const changeLines = await readChanges();

  // Gates that need a whole-surface view and therefore could not run in the
  // per-document pass: the learn ladder's prerequisite graph (a cycle makes
  // the generated index arbitrary; an up-pointing prerequisite breaks the
  // in-order reading guarantee). The blog's rolling-window count warning used
  // to run here too; it was removed with the ceiling it reported
  // (make-the-blog-worth-sending, task 1.3) — nothing counts published posts.
  checkPrerequisiteCycles(corpus.learn, site.diags);
  checkPrerequisiteLevels(corpus.learn, site.diags);
  site.diags.throwIfErrors('surfaces');

  const sourceById = new Map((freshness.sources ?? []).map((s) => [s.id, s]));
  const fetchedOn = (id) =>
    sourceById.get(id)?.display_date ?? sourceById.get(id)?.last_fetch_date ?? null;

  const views = {
    entries: [...corpus.entry].sort((a, b) =>
      a.data.display_name.localeCompare(b.data.display_name),
    ),
    browsable: browsableEntries(corpus.entry).sort((a, b) =>
      a.data.display_name.localeCompare(b.data.display_name),
    ),
    learnLadder: ladder(corpus.learn),
    tutorials: tutorialStates(corpus, { dataLayer: site.dataLayer, today }),
    tools: listingStates(corpus, { freshness, today }),
    posts: postsNewestFirst(corpus.post),
    deltas: deltasNewestFirst(corpus.delta),
    catalog: catalogRows(catalog, corpus.byId, fetchedOn),
    deprecations: deprecationRows(tables, corpus.byId, fetchedOn),
    changes: changedFeed(changeLines, { entries: corpus.entry }),
  };

  return {
    ...site,
    freshness,
    catalogFile: catalog,
    tables,
    changeLines,
    // The footer reads the stamp the prebuild step wrote, so every page and
    // /status.json carry the same one. Only a build that skipped the prebuild
    // step (a bare `next build`, or a test) falls back to computing one.
    stamp: (await readStatusFile()) ?? buildStamp(),
    searchIndex: buildSearchIndex(corpus),
    // The source URL lives in `data/derived/sources.json`, not in
    // freshness.json; the data layer is the module that already merges the
    // two (see data-layer.mjs), so ask it rather than reading either file
    // again here.
    sourceUrl: (id) => site.dataLayer.source(id)?.url ?? null,
    fetchedOn,
    ...views,
  };
}

/** The site model. Awaited by every page; built once per process. */
export function getSite(opts) {
  if (!memo) memo = assemble(opts);
  return memo;
}
