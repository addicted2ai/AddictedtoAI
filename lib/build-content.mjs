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
import { readFile } from 'node:fs/promises';

import { DERIVED_DIR, CONTENT_DIR, DATA_DIR, writeJsonDeterministic } from './paths.mjs';
import { Diagnostics } from './errors.mjs';
import { loadCorpus } from './corpus.mjs';
import { buildAliasRegistry, linkableAliases, ALIASES_FILE } from './aliases.mjs';
import { loadDataLayer } from './data-layer.mjs';
import { renderFact, resolveFact, todayIso } from './facts.mjs';
import { wantsRegistry } from './transclude.mjs';
import { buildBacklinks, BACKLINKS_FILE } from './mentions.mjs';
import { indexability } from './indexability.mjs';
import { entryReviewGate, reviewJoin, reviewStateLine, reviewStateReport } from './reviews.mjs';
import { renderMarkdown } from './markdown.mjs';
import { buildRouteTable } from './routes.mjs';
import { checkInternalLinks } from './linkcheck.mjs';
import { warnCurrencyLiterals } from './currency.mjs';
import { checkPriceAttribution, debtKeys } from './price-attribution.mjs';
import { PROSE_FIELDS, assertFieldsClassified } from './schema.mjs';
import { loadRedirects, writeVercelConfig } from './redirects.mjs';
import { checkDocOrigins } from './origins.mjs';
import { STATIC_ASSET_ROUTES } from './asset-routes.mjs';

export const WANTS_FILE = join(DERIVED_DIR, 'wants.json');
export const PRICE_DEBT_FILE = join(DATA_DIR, 'price-attribution-debt.json');

/**
 * The recorded price-attribution debt. Absent file means an empty list, which
 * is the correct reading: nothing is forgiven, so everything fails. It is the
 * safe direction, and it is the state the file is supposed to reach.
 */
async function loadPriceDebt() {
  try {
    return JSON.parse(await readFile(PRICE_DEBT_FILE, 'utf8'));
  } catch (err) {
    if (err?.code === 'ENOENT') return { known: [] };
    throw err;
  }
}

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

  // Before a single file is read: every string-valued schema field must be
  // classified author-prose or not (beads addictedtoai-48r). It runs here, not
  // beside the scan, because it is a claim about the SCHEMAS rather than about
  // any document — a corpus of zero files must still fail on an unclassified
  // field, or the rule only holds while there is content to notice it.
  assertFieldsClassified(opts.classification);

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

  // specs/wiki indexes an entry on "a prose body that PASSED REVIEW". The join
  // that makes the second half checkable is `lib/reviews.mjs` — the same
  // resolution `scripts/verify-launch.mjs` uses, so a page's robots tag and
  // its launch verdict are read from one map. A caller may still inject its
  // own predicate (fixture tests do); the default is the real one.
  const reviews = reviewJoin(corpus, { reviewsDir: opts.reviewsDir });
  const reviewGate = entryReviewGate(corpus, reviews);
  const indexOpts = { hasApprovedReview: reviewGate.hasApprovedReview, ...opts };

  // Every entry's own facts, rendered for its page (task 2.3).
  for (const doc of corpus.entry) {
    doc.factsHtml = (doc.data.facts ?? []).map((f) => ({
      field: f.field,
      state: resolveFact(f, factCtx(doc)).state,
      html: renderFact(f, factCtx(doc)),
    }));
    doc.index = indexability(doc, indexOpts);
    for (const f of doc.factsHtml) {
      if (f.state === 'no-data') {
        const key = doc.data.facts.find((x) => x.field === f.field)?.feed ?? '(unknown source)';
        missingFeedData.set(key, (missingFeedData.get(key) ?? 0) + 1);
      }
    }
  }

  // A body its own reviewer did not clear is `noindex`, and the build says so
  // rather than only doing it — a page quietly dropping out of every listing
  // with no line of output is indistinguishable from a broken join.
  for (const u of reviewGate.unapproved) {
    diags.warn({
      file: u.record ? `data/reviews/${u.record}` : 'data/reviews/',
      field: 'verdict',
      message: `${u.message} — its prose body is not indexed (specs/wiki indexes on "a prose body that passed review")`,
      rule: 'review-not-approved',
    });
  }
  // Two pieces naming one record: whoever came first got it, and the other was
  // left looking unreviewed. Reported because it is a naming defect, not a
  // review one, and the two need opposite fixes.
  for (const c of reviews.contended) {
    diags.warn({
      file: 'data/reviews/',
      field: 'name',
      message: `${c} — one record cannot review two pieces; rename one`,
      rule: 'review-record-contended',
    });
  }

  const renderFor = (entry, fact) => renderFact(fact, factCtx(entry), { inline: true });

  // Per-type coverage of the volatile-literal check (beads addictedtoai-48r).
  // A check that runs on nothing prints the same clean result as one that runs
  // on everything, and that indistinguishability let the check be vacuous on 23
  // of 29 deltas for a whole seed wave. These two numbers are what make the next
  // vacuum visible on the screen instead of in an audit.
  const proseCoverage = {};
  // The vendor-price attribution gate (beads addictedtoai-l6j). A `price_*`
  // transclusion is OpenRouter's TOP-PROVIDER rate for a row, not a company's
  // own, and the top provider rotates — so prose that makes a party the payee
  // of one is false unless it says a provider is involved. Errors, except for
  // the instances already recorded as debt, which warn. See the module header.
  const priceDebt = opts.priceDebt ?? (await loadPriceDebt());
  const priceKnown = debtKeys(priceDebt);
  const priceAttribution = { scanned: 0, docs: 0, errors: 0, known: 0, seen: new Set() };
  for (const doc of corpus.all) {
    const pa = checkPriceAttribution(doc, diags, priceKnown);
    if (pa.scanned > 0) {
      priceAttribution.scanned += pa.scanned;
      priceAttribution.docs += 1;
      priceAttribution.errors += pa.errors;
      priceAttribution.known += pa.known;
      for (const k of pa.keys) priceAttribution.seen.add(k);
    }
    const cov = warnCurrencyLiterals(doc, diags, PROSE_FIELDS[doc.type] ?? []);
    const c = (proseCoverage[doc.type] ??= { scanned: 0, none: 0 });
    if (cov.scanned > 0) c.scanned += 1;
    else c.none += 1;
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

  // A debt entry that no longer fires has been repaired. Reported so the file
  // cannot outlive the debt: a stale forgiveness silently widens the check's
  // blind spot, and this list is only allowed to shrink.
  priceAttribution.stale = [...priceKnown].filter((k) => !priceAttribution.seen.has(k)).sort();
  for (const k of priceAttribution.stale) {
    diags.warn({
      file: 'data/price-attribution-debt.json',
      field: k,
      message:
        'recorded price-attribution debt no longer fires — the prose was repaired; ' +
        'delete this entry so the list keeps shrinking',
      rule: 'price-attribution-debt-stale',
    });
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
    // task 4.10 — the third-party origin allowlist. Content is only half of
    // it; `scripts/verify-design.mjs` scans the exported pages for the other
    // half (chrome, templates, framework tags).
    checkDocOrigins(doc, diags, opts.siteHosts);
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
    reviews,
    reviewGate,
    proseCoverage,
    priceAttribution,
    today,
    diags,
  };
}

/**
 * The prebuild step. Prints what it did; throws (fails the build) on any gate.
 *
 * `extraRoutes` is the set of static files the *later* prebuild step writes
 * into `public/` (see `asset-routes.mjs`). Without it the link check would
 * pass or fail depending on whether a previous build had already left those
 * files on disk.
 */
export async function contentBuildStep() {
  const site = await buildSite({ write: true, extraRoutes: STATIC_ASSET_ROUTES });
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
  // The review clause, counted every build. `unrecorded` is the half the join
  // cannot decide (see lib/reviews.mjs); printing it is what keeps it from
  // being invisible, since those entries index on body presence alone.
  const g = site.reviewGate;
  process.stdout.write(
    `prebuild: reviews — ${site.reviews.records.size} record(s); of ${
      g.approved.size + g.unapproved.length + g.unrecorded.length
    } entry prose body/bodies: ${g.approved.size} approved, ${g.unapproved.length} not approved ` +
      `(noindex), ${g.unrecorded.length} with no record the join recognises (indexed on body ` +
      `presence — see verify-launch)\n`,
  );
  // The BINDING, counted every build beside the verdict (beads addictedtoai-zlq).
  // Four numbers, never three: `missing` is unreviewed and `mismatched` is
  // reviewed-then-changed, and a line that printed one number for both is the
  // check this replaces. `unbound` is the one to watch — it can only fall.
  const states = reviewStateReport(site.reviews);
  process.stdout.write(
    `prebuild: review binding — of ${states.total} reviewable piece(s): ${reviewStateLine(states)}` +
      ' (mismatched = reviewed then changed; it fails verify-launch and never changes' +
      ' indexability)\n',
  );
  // The volatile-literal check's own coverage, per type (beads addictedtoai-48r).
  // `none` is not a failure: for several types every author-prose field carries
  // a dated sibling and is exempt by construction. It is the number that made
  // the vacuum invisible, so it is printed rather than inferred.
  for (const [type, c] of Object.entries(site.proseCoverage).sort()) {
    process.stdout.write(
      `prebuild: volatile-literal coverage — ${type}: ${c.scanned} document(s) with an ` +
        `author-prose front-matter field scanned, ${c.none} with none\n`,
    );
  }
  // The price-attribution gate, counted every build (beads addictedtoai-l6j).
  // `known` is debt and has one legal direction — down. Printing it is what
  // stops it becoming a permanent exemption list nobody reads: an unprinted
  // allowlist is indistinguishable from no check at all.
  const pa = site.priceAttribution;
  process.stdout.write(
    `prebuild: price attribution — ${pa.scanned} price transclusion(s) in ${pa.docs} ` +
      `document(s); ${pa.errors} unhedged (build error), ${pa.known} recorded as debt ` +
      `(warning; this number may only fall)${
        pa.stale.length ? `, ${pa.stale.length} stale debt entry/entries to delete` : ''
      }\n`,
  );
}
