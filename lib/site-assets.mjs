/**
 * site-assets.mjs — the prebuild step that writes every static file the
 * site serves alongside its pages (tasks 4.2, 4.9, 4.12, 4.13).
 *
 * These are written into `public/` rather than produced by route handlers,
 * for the reason design D1 gives for `/status.json`: under `output: 'export'`
 * a file in `public/` lands in `out/` with no framework involvement at all,
 * which is the least machinery that can possibly serve a JSON file. It also
 * means `lib/routes.mjs` sees them when it scans `public/`, so links to them
 * are checked like any other internal link.
 *
 * What it writes, and why each one exists:
 *
 *   /status.json                 the build stamp — how a deploy is verified
 *                                from outside with no hosting API (4.13)
 *   /search-index.json           names and titles for the in-browser search,
 *                                every page including stubs (4.12)
 *   /catalog.json                machine-readable siblings of the three
 *   /catalog/deprecations.json   standing tables (4.2)
 *   /catalog/changed.json
 *   /feeds/*.xml                 blog, tutorials, changed feed (4.9)
 *   /dataset/*                   the open structured layer, JSON + CSV,
 *                                CC BY 4.0 stated inside every file (4.9)
 *
 * The step ends by checking that every path in `STATIC_ASSET_ROUTES` actually
 * exists on disk. That list is what the link check was told to trust; if a
 * writer here is ever removed and the list is not, the build says so instead
 * of shipping a page linking a file that is not there.
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { PUBLIC_DIR, writeJsonDeterministic } from './paths.mjs';
import {
  STATIC_ASSET_ROUTES,
  STATUS_ROUTE,
  SEARCH_INDEX_ROUTE,
  TABLE_JSON_ROUTES,
  DATASET_JSON_ROUTE,
  DATASET_CSV_ROUTES,
  DATASET_LICENSE,
  DATASET_LICENSE_URL,
} from './asset-routes.mjs';
import { getSite } from './site.mjs';
import { writeSearchIndex } from './search-index.mjs';
import { buildStamp, writeStatusFile } from './stamp.mjs';
import { renderFeeds } from './feeds.mjs';
import {
  buildDataset,
  toCsv,
  entryRows,
  factRows,
  timelineRows,
  catalogExportRows,
  deprecationExportRows,
  deltaExportRows,
} from './dataset.mjs';
import { SORT_CRITERIA } from './catalog.mjs';
import { DELTAS_SORT } from './deltas.mjs';
import { LISTINGS_SORT } from './listings.mjs';

const publicPath = (route) => join(PUBLIC_DIR, route.replace(/^\//, ''));

async function writeText(route, text) {
  const file = publicPath(route);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, text.replace(/\r\n/g, '\n'), 'utf8');
  return file;
}

async function writeJsonRoute(route, value) {
  return writeJsonDeterministic(publicPath(route), value);
}

/** The JSON sibling of a standing table: the rows, the sort, the date. */
function tablePayload(name, rows, site) {
  return {
    license: DATASET_LICENSE,
    license_url: DATASET_LICENSE_URL,
    table: name,
    sort_criterion: SORT_CRITERIA[name],
    generated_on: site.today,
    row_count: rows.length,
    rows,
  };
}

/**
 * @param {object} site
 * @param {object} [opts]
 * @param {boolean} [opts.dirty]  whether the CHECKOUT was dirty when the build
 *   started, measured before any step wrote anything. Omitted, the stamp
 *   measures the tree as it stands right now — see `siteAssetsStep`.
 * @param {string[]} [opts.dirtyPaths]  the porcelain entries behind that bit,
 *   measured at the same instant. Travels with `dirty` for the same reason
 *   `dirty` is passed at all: measured later, it would describe a different
 *   tree (addictedtoai-4w2).
 */
export async function writeSiteAssets(site, opts = {}) {
  const written = [];

  // ---- 4.13 build stamp -------------------------------------------------
  // Computed here, once, and read back by every page (see stamp.mjs).
  const stamp = buildStamp({ dirty: opts.dirty, dirty_paths: opts.dirtyPaths });
  await writeStatusFile(stamp);
  written.push(STATUS_ROUTE);

  // ---- 4.12 search index ------------------------------------------------
  // Committed under data/derived/ (it is derived state) and served from
  // public/ (the browser needs it at a URL).
  await writeSearchIndex(site.searchIndex);
  await writeJsonRoute(SEARCH_INDEX_ROUTE, site.searchIndex);
  written.push(SEARCH_INDEX_ROUTE);

  // ---- 4.2 standing tables, machine-readable ----------------------------
  await writeJsonRoute(TABLE_JSON_ROUTES.catalog, tablePayload('catalog', site.catalog, site));
  await writeJsonRoute(
    TABLE_JSON_ROUTES.deprecations,
    tablePayload('deprecations', site.deprecations, site),
  );
  await writeJsonRoute(
    TABLE_JSON_ROUTES.changed,
    tablePayload('changed', site.tables.changed_30d ?? [], site),
  );
  written.push(...Object.values(TABLE_JSON_ROUTES));

  // ---- 4.9 feeds --------------------------------------------------------
  const feeds = renderFeeds({
    posts: site.posts,
    tutorialStates: site.tutorials,
    changes: site.changes,
  });
  for (const [route, xml] of Object.entries(feeds)) {
    await writeText(route, xml);
    written.push(route);
  }

  // ---- 4.9 open dataset -------------------------------------------------
  const ctx = {
    dataLayer: site.dataLayer,
    today: site.today,
    sourceUrl: site.sourceUrl,
    fetchedOn: site.fetchedOn,
  };
  const dataset = buildDataset({
    corpus: site.corpus,
    catalog: site.catalogFile,
    tables: site.tables,
    deltas: site.deltas,
    ...ctx,
  });
  await writeJsonRoute(DATASET_JSON_ROUTE, dataset);
  written.push(DATASET_JSON_ROUTE);

  const csvs = {
    [DATASET_CSV_ROUTES.entries]: entryRows(site.corpus),
    [DATASET_CSV_ROUTES.facts]: factRows(site.corpus, ctx),
    [DATASET_CSV_ROUTES.timelines]: timelineRows(site.corpus),
    [DATASET_CSV_ROUTES.catalog]: catalogExportRows(site.catalogFile),
    [DATASET_CSV_ROUTES.deprecations]: deprecationExportRows(site.tables),
    [DATASET_CSV_ROUTES.deltas]: deltaExportRows(site.deltas),
  };
  for (const [route, rows] of Object.entries(csvs)) {
    await writeText(route, toCsv(rows, CSV_COLUMNS[route]));
    written.push(route);
  }

  return { stamp, written, dataset };
}

/**
 * Explicit column orders. A CSV whose columns come from `Object.keys(rows[0])`
 * loses its header the moment the table is empty, and silently reorders when a
 * field is added — a downloaded file whose columns move between versions is
 * worse than no file.
 */
const CSV_COLUMNS = {
  [DATASET_CSV_ROUTES.entries]: [
    'id', 'kind', 'display_name', 'status', 'maintenance', 'aliases', 'themes',
    'has_prose_body', 'indexed', 'url', 'license',
  ],
  [DATASET_CSV_ROUTES.facts]: [
    'entry_id', 'field', 'value', 'state', 'binding', 'volatility',
    'source_url', 'accessed', 'license',
  ],
  [DATASET_CSV_ROUTES.timelines]: ['entry_id', 'date', 'event', 'source_url', 'license'],
  [DATASET_CSV_ROUTES.catalog]: [
    'row_id', 'display_name', 'provider', 'entry_id', 'price_input_per_token',
    'price_output_per_token', 'context_window', 'status', 'source', 'source_url', 'license',
  ],
  [DATASET_CSV_ROUTES.deprecations]: [
    'row_id', 'display_name', 'provider', 'entry_id', 'status', 'expiration_date',
    'source', 'source_url', 'license',
  ],
  [DATASET_CSV_ROUTES.deltas]: [
    'slug', 'title', 'capability',
    'impossible_date', 'impossible_what', 'impossible_metric', 'impossible_source_url',
    'routine_date', 'routine_what', 'routine_metric', 'routine_source_url',
    'span', 'url', 'license',
  ],
};

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * The prebuild step.
 *
 * `opts.dirty` is the checkout's state as measured at PREBUILD ENTRY, handed
 * down from `scripts/prebuild.mjs`. It has to come from there, because by the
 * time this step runs the answer has already been changed by the build itself:
 * the `content` step ahead of it rewrites git-tracked files under
 * `data/derived/` plus `vercel.json`, so a `git status --porcelain` taken here
 * describes the build's own output and not the commit it was built from (beads
 * addictedtoai-4w2).
 *
 * THAT FIX DID NOT SETTLE THE ISSUE, and saying so here is the point. With the
 * ordering corrected in `c916a3c`, the live production stamp still read
 * `+dirty` on 2026-08-31, on a deploy built from a commit whose local tree was
 * verified clean before and after the push. So a second cause remains, it lives
 * in the BUILDER's checkout, and nothing readable from this repository will
 * name it. `opts.dirtyPaths` travels beside `opts.dirty` so the next production
 * build names it itself.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.dirty]
 * @param {string[]} [opts.dirtyPaths]
 */
export async function siteAssetsStep(opts = {}) {
  const site = await getSite();
  const { stamp, written, dataset } = await writeSiteAssets(site, {
    dirty: opts.dirty,
    dirtyPaths: opts.dirtyPaths,
  });

  const missing = [];
  for (const route of STATIC_ASSET_ROUTES) {
    if (!(await exists(publicPath(route)))) missing.push(route);
  }
  if (missing.length > 0) {
    throw new Error(
      `site-assets: ${missing.length} declared asset route(s) were not written: ${missing.join(', ')}. ` +
        'The internal-link check was told these would exist (lib/asset-routes.mjs); ' +
        'either write them or remove them from STATIC_ASSET_ROUTES.',
    );
  }

  site.diags.printWarnings();
  process.stdout.write(
    `prebuild: assets — stamp ${stamp.stamp}; ${written.length} file(s); ` +
      `${site.searchIndex.count} searchable page(s); ${site.catalog.length} catalog row(s); ` +
      `${site.changes.length} change line(s); ${site.deltas.length} delta(s) [${DELTAS_SORT}]; ` +
      `${site.tools.length} listing(s) [${LISTINGS_SORT}]; dataset ${dataset.counts.entries} entries / ` +
      `${dataset.counts.facts} facts / ${dataset.counts.timelines} timeline events\n`,
  );
}
