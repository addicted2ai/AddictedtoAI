/**
 * indexnow.mjs — tell the participating search engines which URLs just changed
 * (beads `addictedtoai-k1j`).
 *
 * The most literally autonomous acquisition mechanism available to this site:
 * a self-generated key served at a public URL, one POST per publish, and no
 * account, registration or credential from anybody. Nothing here is delegable
 * to the maintainer because there is nothing to delegate.
 *
 * ## GOOGLE DOES NOT PARTICIPATE. This is a partial win, not a search strategy.
 *
 * IndexNow reaches Bing, Yandex, Seznam and Naver — the participating engines
 * share submissions with each other. **Google is not among them**, and a reader
 * will assume otherwise because IndexNow is spoken about as though it were
 * universal. It is not, and the gap is not closable from here: Google's
 * Indexing API is officially limited to `JobPosting` and `BroadcastEvent`, so
 * planning around it would be building on a documented non-feature. Google
 * finds this site through `sitemap.xml`, whose `lastmod` this project went to
 * some trouble to make honest, and through nothing else.
 *
 * ## WHICH URLs, AND WHY THIS IS NOT A SECOND DEFINITION OF "CHANGED"
 *
 * The set is **every URL in the freshly-built `sitemap.xml` whose `<lastmod>`
 * is today's local date**. Nothing here decides what changed: `app/sitemap.ts`
 * already answers that from `lib/sitemap-dates.mjs`, which is the
 * material-change definition `addictedtoai-8ho` settled and which the JSON-LD
 * `dateModified` also reuses. Reading the built sitemap means IndexNow cannot
 * disagree with the sitemap, the front page or the structured data about what
 * moved, and a page the sitemap deliberately omits — a stub, a demoted
 * tutorial — is never submitted, without a second exclusion rule existing.
 *
 * **The known gap, stated rather than papered over.** A change whose deploy is
 * delayed past local midnight — publishing held down overnight, then re-armed —
 * carries yesterday's `lastmod` and is never pinged. The alternatives were
 * considered and are worse: a multi-day window resubmits the same URLs on every
 * one of the four daily runs, and a `data/` state file recording what was last
 * submitted would sit dirty in the working tree between runs, which is exactly
 * the condition the publish step refuses on. What makes the simple rule
 * defensible is the SHAPE of its failure: a missed ping degrades to the status
 * quo — the crawler finds the page from the sitemap on its own schedule — and
 * it never submits a URL that did not change. It is never wrong; it is
 * occasionally silent. **Filed as `addictedtoai-en3s`**, which also records the
 * shape of the real fix (an append-only submission ledger, and where it can
 * live without sitting dirty between runs).
 *
 * ## WHY THIS CANNOT FIRE FROM A TEST OR A VERIFIER
 *
 * This repository has been bitten twice by an entry point whose NAME promised
 * inspection and which published: `npm test` (`addictedtoai-wxq` / `-64y`) and
 * `pulse/verify-zero-model.mjs` (`addictedtoai-r8k`). A submission is an
 * outward-facing action, so the arming decision is a **pure function**,
 * `armed()`, with five independent guards, every one of which is unit-tested
 * without a network:
 *
 *   1. `data/config.json` says `publish: true` — the real flag, re-read here.
 *      `--assume-publish` cannot reach this code at all: it is refused without
 *      `--dry-run`, and guard 2 stops a dry run.
 *   2. not a dry run.
 *   3. the host is one of this site's own. Every fixture and every test points
 *      `SITE_URL` at loopback, so they are inert **structurally** rather than
 *      by remembering to disable something. It is also simply true: a key file
 *      only authorises the host that serves it.
 *   4. the key file exists in the export. No key served, no submission — the
 *      engine would reject it anyway.
 *   5. there is at least one URL. An empty `urlList` is a request that asks
 *      for nothing.
 *
 * And the call site adds a sixth by construction: `pulse/lib/publish.mjs`
 * invokes this only **after** the live build stamp confirms the deploy landed.
 * Pinging a URL before the new bytes are served is worse than not pinging —
 * the crawler arrives and re-reads the old page.
 *
 * ## A FAILED SUBMISSION IS NOT A DEPLOY FAILURE
 *
 * Nothing here writes `HOLD.md` and nothing here changes the publish result.
 * The deploy succeeded; a search engine did not answer 200. That is worth a
 * line in the log and nothing more, and treating it as a breaker would let a
 * third party's outage stop this site's publishing.
 *
 * ## The two imports from outside `pulse/`
 *
 * `lib/asset-routes.mjs` and `lib/site-config.mjs`, and no others. Both are
 * **import-free by construction** — plain constants, no dependency of their own
 * — so neither can pull anything into the Pulse's dependency graph, which is
 * the property `pulse/tests/zero-model.test.mjs` exists to protect.
 *
 * The direction matters and is the safe one. The key must be byte-identical in
 * the file the build writes and the payload this sends, and the host must be
 * the same host the rest of the site calls itself; duplicating either here
 * would produce a mismatch that is rejected silently, forever, with nothing on
 * this side looking wrong. The Pulse already depends on the site build (it runs
 * `npm run build`), so `pulse/` -> `lib/` is a dependency that already exists in
 * fact; `lib/` -> `pulse/` would be new and would make the site build need the
 * engine. `pulse/tests/indexnow.test.mjs` pins the list to these two files so
 * the precedent cannot widen quietly.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { INDEXNOW_KEY, INDEXNOW_KEY_ROUTE } from '../../lib/asset-routes.mjs';
import { SITE_HOSTS } from '../../lib/site-config.mjs';

/**
 * The shared endpoint. Submissions to it are forwarded to every participating
 * engine, so one POST is the whole protocol — there is deliberately no
 * per-engine list here to drift out of date.
 */
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/** The protocol's own ceiling for one submission. */
export const MAX_URLS = 10000;

/** Where the freshly-built sitemap lands under a repository root. */
export const SITEMAP_FILE = (root) => join(root, 'out', 'sitemap.xml');

/**
 * Every `<loc>` whose `<lastmod>` falls on `day`.
 *
 * `app/sitemap.ts` writes each `lastmod` as `<date>T12:00:00Z`, midday
 * precisely so the date survives being read in any zone, so the first ten
 * characters are the local calendar date it was built from. A URL with no
 * `<lastmod>` — `/colophon` today — is never submitted: absence is the
 * sitemap's honest "no date", not a claim that it changed.
 */
export function changedUrls(sitemapXml, day) {
  if (!day) return [];
  const out = [];
  for (const block of String(sitemapXml ?? '').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block[1])?.[1]?.trim();
    const mod = /<lastmod>([^<]+)<\/lastmod>/.exec(block[1])?.[1]?.trim();
    if (loc && mod && mod.slice(0, 10) === day) out.push(loc);
  }
  return out;
}

/** The hostname of a site URL, lowercased, port stripped. */
export function hostOf(siteUrl) {
  try {
    return new URL(siteUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * The five guards, as one pure decision. See the header for why this is a
 * function and not a series of `if`s buried in the submitter.
 *
 * @returns {{ok: boolean, reason: string}}
 */
export function armed({ config, dryRun = false, siteUrl, hosts = SITE_HOSTS, keyFileExists = false, urls = [] } = {}) {
  if (config?.publish !== true) return { ok: false, reason: 'publish-disabled' };
  if (dryRun) return { ok: false, reason: 'dry-run' };
  const host = hostOf(siteUrl);
  if (!host || !hosts.map((h) => h.toLowerCase()).includes(host)) {
    return { ok: false, reason: 'not-this-site' };
  }
  if (!keyFileExists) return { ok: false, reason: 'no-key-file' };
  if (urls.length === 0) return { ok: false, reason: 'nothing-changed' };
  return { ok: true, reason: 'armed' };
}

/** The JSON body the protocol specifies. Pure, so a test can read it. */
export function submissionBody({ host, siteUrl, urls }) {
  return {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${String(siteUrl).replace(/\/+$/, '')}${INDEXNOW_KEY_ROUTE}`,
    urlList: urls.slice(0, MAX_URLS),
  };
}

/**
 * Submit today's changed URLs, if and only if every guard says so.
 *
 * @param {object} opts
 * @param {string} opts.root        repository root; the sitemap is read from `out/`
 * @param {string} opts.day         the run's LOCAL date, `YYYY-MM-DD`
 * @param {string} opts.siteUrl     the live origin, from `pulse/lib/publish.mjs`
 * @param {object} opts.config      the parsed `data/config.json`
 * @param {boolean} [opts.dryRun]
 * @param {object} [opts.log]       the run's logger
 * @param {Function} [opts.fetchImpl] injected only by tests, which never arm
 * @returns {Promise<{submitted: boolean, reason: string, count?: number, status?: number}>}
 */
export async function submitIndexNow({ root, day, siteUrl, config, dryRun = false, log, fetchImpl } = {}) {
  const say = log?.step ?? ((n, d) => process.stdout.write(`pulse: ${n}${d ? ' — ' + d : ''}\n`));

  const sitemap = SITEMAP_FILE(root);
  const keyFile = join(root, 'out', INDEXNOW_KEY_ROUTE.replace(/^\//, ''));
  const xml = existsSync(sitemap) ? readFileSync(sitemap, 'utf8') : '';
  const urls = changedUrls(xml, day);

  const decision = armed({
    config,
    dryRun,
    siteUrl,
    keyFileExists: existsSync(keyFile),
    urls,
  });

  if (!decision.ok) {
    // One line, naming the guard. A silent no-op here is indistinguishable
    // from a broken submitter, which is the state this whole feature would rot
    // into unnoticed.
    say('indexnow', `not submitting (${decision.reason}); ${urls.length} URL(s) changed on ${day ?? 'an unknown day'}`);
    return { submitted: false, reason: decision.reason, count: urls.length };
  }

  const body = submissionBody({ host: hostOf(siteUrl), siteUrl, urls });
  const doFetch = fetchImpl ?? fetch;
  try {
    const res = await doFetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    // 200 means RECEIVED, never "indexed" — the protocol says so explicitly and
    // it is worth not overstating in the log a person reads at 2am.
    say(
      'indexnow',
      `submitted ${body.urlList.length} changed URL(s) to ${INDEXNOW_ENDPOINT} — HTTP ${res.status}` +
        (res.status === 200
          ? ' (received; Bing, Yandex, Seznam and Naver — Google does not participate)'
          : ' (not accepted; nothing here retries and nothing here holds the deploy)'),
    );
    return { submitted: res.status === 200, reason: `http-${res.status}`, count: body.urlList.length, status: res.status };
  } catch (err) {
    // Deliberately not a throw and deliberately not a HOLD: the deploy landed,
    // a third party did not answer. See the header.
    say('indexnow', `submission failed (${err?.name}: ${err?.message}) — the deploy is unaffected`);
    return { submitted: false, reason: 'request-failed', count: body.urlList.length };
  }
}
