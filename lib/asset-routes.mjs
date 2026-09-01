/**
 * asset-routes.mjs — the static files the build generates into `public/`.
 *
 * Deliberately import-free, and therefore importable from anywhere without a
 * cycle. It exists to solve one ordering problem: `scripts/prebuild.mjs`
 * writes these files, but the internal-link check (task 2.9) assembles its
 * route table from `app/`, `public/` and the corpus during the *content* step,
 * which runs first. On a clean checkout `public/` is empty at that moment, so
 * a page linking `/catalog.json` would fail the link check on the first build
 * and pass on the second — the worst kind of build.
 *
 * Declaring the paths here and passing them as `extraRoutes` makes the check
 * depend on what the build *will* write rather than on what happens to be on
 * disk. `site-assets.mjs` writes exactly this list and asserts it did.
 *
 * These files are build output: `.gitignore` excludes them from `public/`,
 * and the committed copies of the derived data they are made from live under
 * `data/` (design D1's commit policy).
 */

/** The build stamp (specs/site, task 4.13). */
export const STATUS_ROUTE = '/status.json';

/** The client-side name-search index (specs/site, task 4.12). */
export const SEARCH_INDEX_ROUTE = '/search-index.json';

/** JSON siblings of the three standing tables (specs/directory, task 4.2). */
export const TABLE_JSON_ROUTES = {
  catalog: '/catalog.json',
  deprecations: '/catalog/deprecations.json',
  changed: '/catalog/changed.json',
};

/** Citable feeds (specs/site, task 4.9). */
export const FEED_ROUTES = {
  blog: '/feeds/blog.xml',
  tutorials: '/feeds/tutorials.xml',
  changes: '/feeds/changes.xml',
};

/**
 * What this site tells a machine that arrives without a browser (beads
 * `addictedtoai-k1j`, `lib/crawlers.mjs`).
 *
 * `robots.txt` is written here rather than by `app/robots.ts` because the
 * crawler stance is a **commented** decision and Next's robots generator
 * cannot emit comments — see `lib/crawlers.mjs` for the argument. Moving it
 * changes nothing for `lib/routes.mjs`: the route used to come from the
 * `app/robots.*` special case and now comes from this list, so the internal
 * link check sees it either way.
 */
export const ROBOTS_ROUTE = '/robots.txt';
export const LLMS_ROUTE = '/llms.txt';

/**
 * The IndexNow key, and the file that proves we own this host.
 *
 * **This is not a secret and must not be treated as one.** The whole mechanism
 * is that the key is served publicly at a URL on the host it authorises: a
 * search engine fetches `https://<host>/<key>.txt` and, finding the key there,
 * concludes that whoever sent it controls the host. Hiding it would break it.
 * It authorises exactly one thing — *"please re-crawl these URLs on this
 * host"* — and nothing else, on any host but this one.
 *
 * Self-generated on 2026-08-31 from 16 random bytes: 32 hex characters, inside
 * the protocol's 8–128 range and its `a-zA-Z0-9-` alphabet. No account, no
 * registration and no credential from anyone was involved, which is what makes
 * IndexNow the one acquisition mechanism an agent can operate end to end.
 *
 * It lives HERE, in the import-free constants file, because two very distant
 * pieces of code must agree on it byte for byte: `lib/site-assets.mjs` writes
 * the file, and `pulse/lib/indexnow.mjs` sends the same string in every
 * submission. A second copy is the worst failure this feature has available —
 * every submission would be rejected for a key mismatch, silently, forever,
 * and nothing on this side would look wrong.
 */
export const INDEXNOW_KEY = '0f53367020cd11b3a49cebd8c5b4d382';
export const INDEXNOW_KEY_ROUTE = `/${INDEXNOW_KEY}.txt`;

/** The open dataset (specs/site, task 4.9). CC BY 4.0, stated in every file. */
export const DATASET_JSON_ROUTE = '/dataset/addictedtoai.json';
export const DATASET_CSV_ROUTES = {
  entries: '/dataset/entries.csv',
  facts: '/dataset/facts.csv',
  timelines: '/dataset/timelines.csv',
  catalog: '/dataset/catalog.csv',
  deprecations: '/dataset/deprecations.csv',
  deltas: '/dataset/deltas.csv',
};

/**
 * What each CSV holds, in one clause — the label `/data` prints beside the
 * link and the name the `Dataset` graph gives that `DataDownload`
 * (`lib/jsonld.mjs`, beads `addictedtoai-k1j`).
 *
 * Here rather than inline in `app/data/page.tsx` because two surfaces now
 * describe the same six files, and a download whose page label and whose
 * machine-readable name disagree is worse than one with neither: a reader
 * comparing them cannot tell which is stale. Keyed by route so a renamed file
 * takes its label with it.
 */
export const DATASET_CSV_LABELS = {
  [DATASET_CSV_ROUTES.entries]: 'Entries — identity, lifecycle, indexability',
  [DATASET_CSV_ROUTES.facts]: 'Facts — resolved values with their state and source',
  [DATASET_CSV_ROUTES.timelines]: 'Timelines — dated, sourced lifecycle events',
  [DATASET_CSV_ROUTES.catalog]: 'Model catalog — raw per-token prices',
  [DATASET_CSV_ROUTES.deprecations]: 'Deprecations and retirements',
  [DATASET_CSV_ROUTES.deltas]: 'Impossible → Routine — dated pairs with both sources',
};

/** Every path above, in one list — what `extraRoutes` is given. */
export const STATIC_ASSET_ROUTES = [
  STATUS_ROUTE,
  SEARCH_INDEX_ROUTE,
  ROBOTS_ROUTE,
  LLMS_ROUTE,
  INDEXNOW_KEY_ROUTE,
  ...Object.values(TABLE_JSON_ROUTES),
  ...Object.values(FEED_ROUTES),
  DATASET_JSON_ROUTE,
  ...Object.values(DATASET_CSV_ROUTES),
];

/** The license every dataset payload states, in the payload itself. */
export const DATASET_LICENSE = 'CC BY 4.0';
export const DATASET_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

/**
 * ---------------------------------------------------------------------------
 * THE PUBLISHED CONTRACT (beads `addictedtoai-k1j`)
 *
 * `/catalog.json` and its two siblings are the site's most linkable surface:
 * somebody else's side project reading them is the most durable inbound a site
 * like this gets, and it matches the architecture — the wiki is the substrate
 * every other surface references rather than restating.
 *
 * **A contract you publish is one you have to keep**, so the version is a
 * number in the payload rather than a promise on a page. The rule these
 * numbers encode, stated on `/data#contract` and nowhere else in prose:
 *
 *   - **Stable** — the URL, the licence, the top-level key names, every
 *     existing row field name and its meaning, `row_count === rows.length`,
 *     and `rows` being in the order `sort_criterion` names.
 *   - **Not stable, and never claimed to be** — which rows exist, their
 *     values, and how many there are. Those move; that is the point of the
 *     file.
 *   - **Additive without a bump** — a NEW key on a payload or a row. A reader
 *     that ignores unknown keys is unaffected, which is the whole reason the
 *     distinction is worth drawing.
 *   - **A rename or a removal bumps the number.** That is the only thing the
 *     number means, and it is the only thing a consumer can act on.
 *
 * Two versions rather than one, because they describe two different shapes and
 * a single number would report a dataset change as a catalog change.
 * ---------------------------------------------------------------------------
 */
export const TABLE_SCHEMA_VERSION = 1;
export const DATASET_SCHEMA_VERSION = 1;

/** Where the rule above is written for a human. Stated inside every payload. */
export const CONTRACT_ANCHOR = '/data#contract';
