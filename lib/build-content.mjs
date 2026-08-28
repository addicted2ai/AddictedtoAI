/**
 * build-content.mjs — the content build core: one pass over the corpus that
 * runs every gate in tasks 2.1–2.10 and writes the derived files.
 *
 * It runs as a **prebuild step** (`scripts/prebuild.mjs`), which is what makes
 * "the build fails" mean what the specs say it means: `npm run build` is
 * `node scripts/prebuild.mjs && next build`, so a violation stops the build
 * before Next renders a single page. A check that ran inside a page component
 * would only fail the pages that happened to import it.
 *
 * Two phases, and the split matters for the quality of the error output:
 *
 *   Phase 1  schema, ids, kinds, duplicates, cross-file references, the alias
 *            registry, redirects. Stops here if anything failed — a corpus
 *            with a malformed entry would otherwise report that entry's
 *            absence a second time as a dozen unresolved references, burying
 *            the one error that matters.
 *   Phase 2  render every body (transclusion, wants, alias linking), then
 *            check internal links against the assembled route table.
 *
 * The same function serves page templates: `buildSite()` with `write: false`
 * returns the fully processed corpus, so wave 3 renders from exactly the
 * objects the gates were run against rather than re-deriving them.
 */

import { join } from 'node:path';

import { DERIVED_DIR, CONTENT_DIR, writeJsonDeterministic } from './paths.mjs';
import { Diagnostics } from './errors.mjs';
import { loadCorpus } from './corpus.mjs';
import { buildAliasRegistry, linkableAliases, ALIASES_FILE } from './aliases.mjs';
import { loadDataLayer } from './data-layer.mjs';
import { renderFact, resolveFact, todayIso } from './facts.mjs';
import { wantsRegistry } from './transclude.mjs';
import { buildBacklinks, BACKLINKS_FILE } from './mentions.mjs';
import { indexability } from './indexability.mjs';
import { renderMarkdown } from './markdown.mjs';
import { buildRouteTable } from './routes.mjs';
import { checkInternalLinks } from './linkcheck.mjs';
import { warnCurrencyLiterals } from './currency.mjs';
import { loadRedirects, writeVercelConfig } from './redirects.mjs';

export const WANTS_FILE = join(DERIVED_DIR, 'wants.json');

/**
 * @param {object} [opts]
 * @param {string}  [opts.contentRoot]  defaults to `content/`
 * @param {boolean} [opts.write]        write derived files + vercel.json
 * @param {object}  [opts.dataLayer]    inject a fake layer in tests
 * @param {string}  [opts.today]        pin the clock in tests
 * @param {boolean} [opts.redirects]    set false to skip redirects/vercel.json
 */
export async function buildSite(opts = {}) {
  const diags = opts.diags ?? new Diagnostics();
  const today = opts.today ?? todayIso();
  const contentRoot = opts.contentRoot ?? CONTENT_DIR;

  // ---- phase 1: identity and structure --------------------------------
  const corpus = await loadCorpus({ contentRoot, diags });
  const { registry: aliasRegistry, byName } = buildAliasRegistry(corpus.entry, diags);
  const redirects = opts.redirects === false ? [] : await loadRedirects(diags);
  diags.throwIfErrors('content');

  // ---- phase 2: rendering ---------------------------------------------
  const dataLayer = opts.dataLayer ?? (await loadDataLayer());
  const aliases = linkableAliases(byName);
  const byId = corpus.byId;
  /** @type {Map<string, Set<string>>} name -> distinct referring page paths */
  const wants = new Map();
  const missingFeedData = new Map();

  const factCtx = (entry) => ({
    dataLayer,
    feeds: entry.data.feeds ?? {},
    today,
    entryId: entry.data.id,
  });

  // Every entry's own facts, rendered for its page (task 2.3).
  for (const doc of corpus.entry) {
    doc.factsHtml = (doc.data.facts ?? []).map((f) => ({
      field: f.field,
      state: resolveFact(f, factCtx(doc)).state,
      html: renderFact(f, factCtx(doc)),
    }));
    doc.index = indexability(doc, opts);
    for (const f of doc.factsHtml) {
      if (f.state === 'no-data') {
        const key = doc.data.facts.find((x) => x.field === f.field)?.feed ?? '(unknown source)';
        missingFeedData.set(key, (missingFeedData.get(key) ?? 0) + 1);
      }
    }
  }

  const renderFor = (entry, fact) => renderFact(fact, factCtx(entry), { inline: true });

  for (const doc of corpus.all) {
    warnCurrencyLiterals(doc, diags);
    if (!doc.hasBody) {
      doc.html = '';
      doc.hrefs = [];
      doc.srcs = [];
      doc.wikiLinks = [];
      continue;
    }
    const out = renderMarkdown(doc.body, {
      file: doc.file,
      byId,
      diags,
      wants,
      renderFact: renderFor,
      aliases,
      selfId: doc.type === 'entry' ? doc.data.id : undefined,
    });
    doc.html = out.html;
    doc.hrefs = out.hrefs;
    doc.srcs = out.srcs;
    doc.wikiLinks = out.links;
    doc.transcluded = out.used;
  }

  // Feed-bound facts with nothing behind them yet are a warning, aggregated
  // per source: before the first Pulse run every model fact is in that state,
  // and hundreds of identical lines would hide the ones that matter.
  for (const [source, count] of [...missingFeedData.entries()].sort()) {
    diags.warn({
      file: 'data/derived/',
      field: source,
      message: `${count} feed-bound fact(s) have no value in the data layer yet — they render as absent until the Pulse ingests "${source}"`,
      rule: 'feed-no-data',
    });
  }

  const backlinks = buildBacklinks(corpus);
  const wantsOut = wantsRegistry(wants);

  const routes = await buildRouteTable(corpus, { extra: opts.extraRoutes });
  const redirectSources = new Set(redirects.map((r) => r.source));
  for (const doc of corpus.all) {
    checkInternalLinks({ file: doc.file, hrefs: doc.hrefs ?? [], routes, redirectSources, diags });
  }

  diags.throwIfErrors('content');

  if (opts.write) {
    await writeJsonDeterministic(ALIASES_FILE, aliasRegistry);
    await writeJsonDeterministic(BACKLINKS_FILE, backlinks);
    await writeJsonDeterministic(WANTS_FILE, wantsOut);
    if (opts.redirects !== false) await writeVercelConfig(redirects);
  }

  return {
    corpus,
    aliases: { registry: aliasRegistry, byName, linkable: aliases },
    backlinks,
    wants: wantsOut,
    dataLayer,
    redirects,
    routes,
    today,
    diags,
  };
}

/** The prebuild step. Prints what it did; throws (fails the build) on any gate. */
export async function contentBuildStep() {
  const site = await buildSite({ write: true });
  site.diags.printWarnings();
  const counts = Object.entries(site.corpus)
    .filter(([k, v]) => Array.isArray(v) && k !== 'all')
    .map(([k, v]) => `${v.length} ${k}`)
    .join(', ');
  process.stdout.write(
    `prebuild: content — ${counts}; ${site.aliases.linkable.length} linkable alias(es), ` +
      `${site.wants.wants.length} want(s), ${site.redirects.length} redirect(s), ` +
      `${site.diags.warnings.length} warning(s)\n`,
  );
}
