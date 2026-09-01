/**
 * jsonld.mjs — the schema.org graph each surface publishes (beads
 * `addictedtoai-k1j`).
 *
 * Measured twice on 2026-08-29 and again before this file existed: there was
 * **zero** JSON-LD anywhere in `lib/` or `app/`. This corpus is unusually well
 * shaped for structured data, and the reason is the same one the wiki spec
 * gives for its whole design — facts here are *typed, dated and sourced*
 * rather than buried in prose, so a machine-readable graph is a re-projection
 * of data the build already validated rather than a second, hand-maintained
 * description of the page that drifts away from it.
 *
 * ## THE ONE RULE: never assert what the page does not
 *
 * A JSON-LD graph is a claim made to a machine that no human reader ever
 * proof-reads. That makes it the single easiest place in this repository for
 * rot to hide, so every function below obeys one rule: **every property is
 * derived from data the page itself renders, and a property that cannot be
 * sourced is omitted rather than guessed.** `compact()` is the mechanism —
 * an absent, null or empty value never reaches the output — and it is the
 * same "absence is the honest answer" posture `lib/sitemap-dates.mjs` takes
 * for a missing `lastmod`.
 *
 * Four consequences worth naming, because each was a live temptation:
 *
 *  - **No `author`.** The site's own colophon says an AI writes it. Naming
 *    *which* AI would put a model name outside `runners.yml`, which this
 *    repository's conventions forbid, and naming a person would be a lie. So
 *    the graph carries a `publisher` — the site, which is true and checkable —
 *    and no `author` at all.
 *  - **No `offers` on a tool listing.** `pricing:` is an author sentence
 *    ("free, open source (Apache-2.0); you supply your own model API key"),
 *    not a currency amount. Parsing a price out of it would be exactly the
 *    heuristic-that-is-silently-wrong this project rejects everywhere else.
 *  - **No `datePublished` on a delta.** A delta's front matter dates the
 *    *subject* — when a capability went from research result to commodity —
 *    and `addictedtoai-3u1` already established that those are facts about the
 *    subject, not about the page. There is no publication date to state, so
 *    none is stated.
 *  - **No invented description.** A `description` is the page's own first
 *    paragraph, quoted, or the front-matter sentence written to be one
 *    (`delta.capability`). An entry with no prose body gets no description.
 *
 * ## `dateModified` REUSES THE MATERIAL-CHANGE DEFINITION. IT DOES NOT MAKE ONE.
 *
 * Nothing in this file decides what "changed" means. Callers pass the value
 * `lib/sitemap-dates.mjs` computes — `contentChangedOn(doc)`, the later of the
 * review record's date and the newest changed-feed line that joins to the page
 * — which is the definition `addictedtoai-8ho` settled and `app/sitemap.ts`
 * sends as `lastmod`. A second definition written here would let the sitemap
 * and the graph disagree about the same page on the same build, and a daily
 * price tick regenerating a fresh `dateModified` across 400 pages is precisely
 * the dishonesty crawlers already discount `lastmod` for.
 * `scripts/verify-surfaces.mjs` measures the agreement rather than trusting
 * it: every `dateModified` in the export must equal that page's `<lastmod>` in
 * `sitemap.xml`, to the day.
 *
 * **The two index-level graphs deliberately carry no `dateModified`.** The
 * only honest value for `/wiki` and `/data` is the member-max the sitemap
 * computes inline in `app/sitemap.ts` (`addictedtoai-1r7`), and that
 * computation is pinned there by `app/sitemap.test.mjs` at the level of its
 * source text. Copying those expressions here would create the second
 * definition the paragraph above exists to prevent, so absence is the answer
 * until they can be shared. **Filed as `addictedtoai-nq36`**, with the move and
 * the two test assertions it has to update written out — a note that existed
 * only here would be findable only by someone who already suspected it.
 *
 * ## Which kinds become which type
 *
 *   DefinedTerm         `concept` and `technique` entries (32 browsable today)
 *   DefinedTermSet      `/wiki`, the set those terms belong to
 *   Article             blog posts and deltas
 *   SoftwareApplication the curated tool listings
 *   Dataset             `/data` and the seven downloadable files
 *
 * `concept` **and** `technique`, not `concept` alone: a `DefinedTerm` is a
 * term with a definition, and both kinds are exactly that — each carries a
 * display name, an alias list and a body whose first paragraph defines it. The
 * other six kinds are not defined terms (`model`, `org`, `hardware` and
 * `event` name particular things in the world, not vocabulary), and rather
 * than reach for a plausible type for each, they get no graph. A type chosen
 * because it was the nearest available is an assertion nobody checked.
 *
 * Only **indexed** entries and **alive** listings get a graph, read from
 * `doc.index.indexed` and `state.alive` — the same values that decide the
 * page's own `robots` tag. Structured data on a page we ask crawlers not to
 * index is a contradiction shipped in two files.
 */

import { SITE_NAME, SITE_URL, SITE_LANGUAGE, absoluteUrl } from './site-config.mjs';
import {
  DATASET_LICENSE_URL,
  DATASET_JSON_ROUTE,
  DATASET_CSV_ROUTES,
  DATASET_CSV_LABELS,
} from './asset-routes.mjs';

export const SCHEMA_CONTEXT = 'https://schema.org';

/** The wiki kinds that are defined terms. See the header for why only these. */
export const TERM_KINDS = Object.freeze(['concept', 'technique']);

/** The `DefinedTermSet` every `DefinedTerm` below belongs to. */
export const DEFINED_TERM_SET_URL = absoluteUrl('/wiki');

/**
 * The dataset's name and one-sentence description, in one place.
 *
 * `app/data/page.tsx` uses this string for its `metadata.description` and the
 * `Dataset` graph uses it for `description`, so the page and its structured
 * data cannot describe the same download differently — and
 * `scripts/verify-surfaces.mjs` measures that they do not.
 */
export const DATASET_NAME = `${SITE_NAME} open dataset`;
export const DATASET_DESCRIPTION =
  'The whole structured layer — entries, facts, timelines, model catalog, deprecations, ' +
  'dated deltas — as JSON and CSV under CC BY 4.0.';

/**
 * `<` and `>` would let a value close the surrounding `<script>` element, and
 * `&` is escaped with them so no output of this function can be reinterpreted
 * by the HTML parser at all. U+2028/U+2029 are legal in JSON strings and
 * illegal in JavaScript string literals, which is a real hazard for anything
 * that later `eval`s a graph out of a page.
 */
const ESCAPES = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  // Written as escape sequences rather than as the characters themselves: a
  // literal line separator in this source is invisible in every diff and does
  // not survive a round trip through an editor that normalises line endings.
  ['\u2028']: '\\u2028',
  ['\u2029']: '\\u2029',
};

/** A graph as the body of a `<script type="application/ld+json">`. */
export function serializeJsonLd(graph) {
  return JSON.stringify(graph).replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c]);
}

/**
 * Drop every key whose value is absent — the mechanism behind "never assert
 * what the page does not". Recurses into nested nodes so a distribution entry
 * or a publisher is held to the same rule. `false` and `0` are values and are
 * kept; `undefined`, `null`, `''` and `[]` are not answers.
 */
export function compact(value) {
  if (Array.isArray(value)) {
    const out = value.map(compact).filter((v) => v !== undefined);
    return out.length > 0 ? out : undefined;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const c = compact(v);
      if (c !== undefined) out[k] = c;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? whole;
  });
}

/**
 * The text of a rendered body's first paragraph — the page's own definition of
 * its subject, quoted rather than summarised.
 *
 * Quoted verbatim on purpose: a summary is a new claim, and there is nothing
 * here that could check it. Because it is a quotation, `verify-surfaces` can
 * assert the string appears in the exported page's own text, which is a
 * mechanical guarantee that the graph says what the page says.
 *
 * Uncapped, deliberately. The longest first paragraph in the corpus today is
 * 785 characters, which is a fine `description`, and every truncation rule
 * available (a character count, a sentence split) either cuts mid-clause or
 * needs an abbreviation list that would be wrong on "e.g." the first week.
 *
 * Returns `undefined` when the body has no paragraph at all — a browsable
 * data-only entry such as `technique/mixture-of-experts`, which is indexed on
 * `facts-and-timeline` rather than on prose. That entry then carries a
 * `DefinedTerm` with no `description`, which is the honest shape.
 */
export function firstParagraphText(html) {
  const m = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(String(html ?? ''));
  if (!m) return undefined;
  const text = decodeEntities(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  return text === '' ? undefined : text;
}

/**
 * The publisher: the site. Not an author — see the header.
 *
 * `Organization` rather than `Person` for the obvious reason and one less
 * obvious one: `publisher` is the only actor claim in this whole file that is
 * checkable from outside, because the name and the URL are the site's own.
 */
export function publisherNode() {
  return { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
}

/** Alias names that add something to `display_name`, in declared order. */
function alternateNames(entry) {
  const seen = new Set([entry.display_name]);
  const out = [];
  for (const alias of entry.aliases ?? []) {
    if (seen.has(alias.name)) continue;
    seen.add(alias.name);
    out.push(alias.name);
  }
  return out;
}

/**
 * A wiki entry as a `DefinedTerm`.
 *
 * @param {object} doc a built entry doc (`doc.url`, `doc.html`, `doc.data`)
 * @param {object} [opts]
 * @param {string} [opts.dateModified] `contentChangedOn(doc)` — see the header
 */
export function definedTermGraph(doc, { dateModified } = {}) {
  if (!doc || !TERM_KINDS.includes(doc.data?.kind)) return undefined;
  const url = absoluteUrl(doc.url);
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'DefinedTerm',
    '@id': `${url}#term`,
    name: doc.data.display_name,
    alternateName: alternateNames(doc.data),
    description: firstParagraphText(doc.html),
    // The entry id, which is this thing's permanent identity — the URL is
    // derived from the id and never the other way round (specs/wiki).
    identifier: doc.data.id,
    url,
    inLanguage: SITE_LANGUAGE,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': DEFINED_TERM_SET_URL,
      name: `${SITE_NAME} wiki`,
      url: DEFINED_TERM_SET_URL,
    },
    dateModified,
  });
}

/** The `/wiki` index as the set those terms belong to. No `dateModified` — see the header. */
export function definedTermSetGraph(terms, { description } = {}) {
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'DefinedTermSet',
    '@id': DEFINED_TERM_SET_URL,
    name: `${SITE_NAME} wiki`,
    description,
    url: DEFINED_TERM_SET_URL,
    inLanguage: SITE_LANGUAGE,
    hasDefinedTerm: (terms ?? []).map((doc) => ({
      '@type': 'DefinedTerm',
      '@id': `${absoluteUrl(doc.url)}#term`,
      name: doc.data.display_name,
      url: absoluteUrl(doc.url),
    })),
  });
}

/**
 * A curated tool listing as a `SoftwareApplication`.
 *
 * `url` is the tool's **own** site and `mainEntityOfPage` is our listing,
 * which is the right way round: the thing being described is the application,
 * and our page is a page about it. `applicationCategory` is the listing's
 * declared `category` — one of the closed list in `lib/tool-categories.mjs`,
 * declared data and never inferred from a name.
 */
export function softwareApplicationGraph(listing, { dateModified } = {}) {
  const doc = listing?.doc;
  if (!doc) return undefined;
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'SoftwareApplication',
    '@id': `${absoluteUrl(doc.url)}#application`,
    name: doc.data.title,
    description: firstParagraphText(doc.html),
    url: doc.data.url,
    applicationCategory: doc.data.category,
    mainEntityOfPage: absoluteUrl(doc.url),
    dateModified,
  });
}

/** A blog post as an `Article`. */
export function postGraph(doc, { dateModified } = {}) {
  if (!doc) return undefined;
  const url = absoluteUrl(doc.url);
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: doc.data.title,
    description: firstParagraphText(doc.html),
    datePublished: doc.data.date,
    dateModified,
    url,
    mainEntityOfPage: url,
    inLanguage: SITE_LANGUAGE,
    publisher: publisherNode(),
  });
}

/**
 * A capability delta as an `Article`.
 *
 * `capability` is the description because the schema requires it to be exactly
 * that: *"must state the capability in one plain sentence"*. No
 * `datePublished` — see the header.
 */
export function deltaGraph(view, { dateModified } = {}) {
  if (!view) return undefined;
  const url = absoluteUrl(view.url);
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: view.title,
    description: view.capability,
    dateModified,
    url,
    mainEntityOfPage: url,
    inLanguage: SITE_LANGUAGE,
    publisher: publisherNode(),
  });
}

/**
 * The open dataset — the sleeper of the four, and the reason this file exists
 * at all: `Dataset` is the entry ticket to Google Dataset Search, a discovery
 * surface with almost no competition in this subject.
 *
 * Every `distribution` entry is read off `lib/asset-routes.mjs`, so a file
 * that stops being written stops being advertised in the same edit. No
 * `dateModified` — see the header.
 */
export function datasetGraph() {
  const download = (route, format) => ({
    '@type': 'DataDownload',
    name: DATASET_CSV_LABELS[route] ?? undefined,
    encodingFormat: format,
    contentUrl: absoluteUrl(route),
  });
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Dataset',
    '@id': `${absoluteUrl('/data')}#dataset`,
    name: DATASET_NAME,
    description: DATASET_DESCRIPTION,
    url: absoluteUrl('/data'),
    license: DATASET_LICENSE_URL,
    isAccessibleForFree: true,
    inLanguage: SITE_LANGUAGE,
    creator: publisherNode(),
    publisher: publisherNode(),
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Everything, as one JSON file',
        encodingFormat: 'application/json',
        contentUrl: absoluteUrl(DATASET_JSON_ROUTE),
      },
      ...Object.values(DATASET_CSV_ROUTES).map((route) => download(route, 'text/csv')),
    ],
  });
}
