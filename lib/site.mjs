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
import { readFile } from 'node:fs/promises';
import { CURRICULUM_FILE, DERIVED_DIR } from './paths.mjs';
import { STATIC_ASSET_ROUTES } from './asset-routes.mjs';
import { SITE_HOSTS } from './site-config.mjs';
import { browsableEntries } from './indexability.mjs';
import { loadCatalog, catalogRows, deprecationRows } from './catalog.mjs';
import { readChanges, changedFeed } from './changes.mjs';
import { tutorialStates } from './tutorials.mjs';
import { listingStates } from './listings.mjs';
import {
  ladder,
  checkPrerequisiteCycles,
  checkPrerequisiteLevels,
  checkCurriculumCoverage,
} from './learn.mjs';
import { postsNewestFirst } from './posts.mjs';
import { deltasNewestFirst } from './deltas.mjs';
import { buildSearchIndex } from './search-index.mjs';
import { buildStamp, readStatusFile } from './stamp.mjs';
import { buildChangedOnMap, contentChangedOn, postChangedOn } from './sitemap-dates.mjs';
import { clearedMetricIds } from './frontier-metrics.mjs';
import { loadRegistry } from '../pulse/lib/registry.mjs';
import { ROOT } from './paths.mjs';

const FRESHNESS_FILE = join(DERIVED_DIR, 'freshness.json');
const FRONTIER_FILE = join(DERIVED_DIR, 'frontier.json');

/**
 * The learn curriculum of record, as text. An unreadable file becomes the empty
 * string, which `curriculumSlugs` reports as "no catalog section" — one build
 * error naming the curriculum, rather than one per published page.
 */
async function readCurriculum() {
  try {
    return await readFile(CURRICULUM_FILE, 'utf8');
  } catch {
    return '';
  }
}

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

  /*
   * The frontier data layer, and the rights gate that decides what of it may be
   * PRINTED (specs/pulse; `separate-a-claim-from-a-fact` task 26).
   *
   * Two reads, deliberately not one. `frontier.json` is what the snapshot says —
   * leaders, ranked rows and counts for every DECLARED metric, cleared or not,
   * because recording a value is not rendering it. Whether a value may be
   * rendered is a REGISTRY question and is read here, at build time, because
   * rights move on the registry's clock: flipping an outcome to `refused` must
   * take effect at the next build rather than at the next Pulse run.
   *
   * The fallback is the honest empty shape rather than an absent object, so a
   * renderer looks the metric up and finds nothing, instead of a caller having
   * to know the file might not be there. The Pulse writes the file on every run
   * even with zero metrics registered, which is today's state.
   */
  const frontier = await readJson(FRONTIER_FILE, { snapshot_date: null, metrics: [] });
  const clearedMetrics = clearedMetricIds(loadRegistry(ROOT));

  // Gates that need a whole-surface view and therefore could not run in the
  // per-document pass: the learn ladder's prerequisite graph (a cycle makes
  // the generated index arbitrary; an up-pointing prerequisite breaks the
  // in-order reading guarantee). The blog's rolling-window count warning used
  // to run here too; it was removed with the ceiling it reported
  // (make-the-blog-worth-sending, task 1.3) — nothing counts published posts.
  checkPrerequisiteCycles(corpus.learn, site.diags);
  checkPrerequisiteLevels(corpus.learn, site.diags);
  // specs/education-static: "A learn page SHALL NOT publish unless it appears in
  // the curriculum." Here rather than in the per-document pass because it is a
  // join against a file outside `content/`, and immediately before
  // `throwIfErrors` because that is what makes the spec's "before any page
  // renders" true rather than merely intended — the same reasoning
  // `teach-the-whole-subject` task 1.1 recorded for the check above it.
  checkCurriculumCoverage(corpus.learn, await readCurriculum(), site.diags);
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

  // Entry id -> the newest material change that joins to it, built once here
  // from the rendered changed feed. `app/sitemap.ts` builds its own from the
  // same array and by the same call, and that duplication is deliberate for
  // now: `app/sitemap.test.mjs` pins that file's source text line by line, so
  // rewiring it belongs to whoever next touches the sitemap (addictedtoai-nq36).
  // What matters is that both go through `lib/sitemap-dates.mjs`, so there is
  // one DEFINITION of "changed" (addictedtoai-8ho) even while there are two
  // callers of it.
  const changedOn = buildChangedOnMap(views.changes);

  return {
    ...site,
    freshness,
    catalogFile: catalog,
    tables,
    changeLines,
    frontier,
    clearedMetrics,
    changedOn,
    /**
     * A page's `lastModified`: the later of its prose date and its bound
     * facts' date. Handed to `lib/jsonld.mjs` as `dateModified` so a page's
     * structured data and its `<lastmod>` in the sitemap are the same number.
     *
     * "By construction" is what this comment used to claim, and it was not
     * true: a BLOG POST had a second definition in `app/sitemap.ts` and the
     * two disagreed the first time a published post was edited
     * (`postChangedOn`'s header has the measurement). What actually makes them
     * agree is that both callers reach the same function here — so a page kind
     * whose sitemap line computes its own date is the defect to look for, and
     * `scripts/verify-surfaces.mjs` is what catches it rather than what
     * documents it.
     */
    contentChangedOn: (doc) => contentChangedOn(doc, site.reviews.byFile, changedOn),
    /** A post's, which is `contentChangedOn` or its `date:`, whichever is later. */
    postChangedOn: (doc) => postChangedOn(doc, site.reviews.byFile, changedOn),
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
