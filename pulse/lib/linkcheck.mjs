/**
 * linkcheck.mjs — the rolling link check (specs/pulse, task 3.4).
 *
 * "which links in the corpus are broken (rolling, every link at least every
 * 30 days)". The state lives in `data/linkcheck.json` at the **data root**,
 * not under `data/derived/`: thirty days of accumulated check dates are not
 * recomputable from anything else, so they are state, and `data/derived/`
 * holds only what every run recomputes (design D1).
 *
 * The check is rolling and capped per run so the Pulse stays cheap on a
 * schedule: only URLs never checked, or checked longer ago than the interval,
 * are candidates, oldest first, up to the per-run cap.
 *
 * Consecutive failures are counted because specs/directory marks a listing
 * "could not verify" after its URL "fails across two consecutive Pulse
 * checks" — one flaky timeout is not a dead tool.
 */

import { daysSince, paths, readJson, today, writeJson } from './core.mjs';
import { describeFetchError } from './sources.mjs';

export const LINK_INTERVAL_DAYS = 30;
export const LISTING_INTERVAL_DAYS = 45; // specs/directory
const DEFAULT_MAX_PER_RUN = 25;
const TIMEOUT_MS = 15000;
const USER_AGENT = 'AddictedtoAI-Pulse/0.1 (+https://www.addictedtoai.net)';

/**
 * ---------------------------------------------------------------------------
 * How many consecutive failures before a failure is a fact.
 *
 * `specs/directory` marks a listing "could not verify" once its URL "fails
 * across two consecutive Pulse checks" — one flaky timeout is not a dead tool.
 * That reasoning is about evidence, not about listings, so it holds identically
 * for any link: a 503 from an overloaded host, a slow response past the 15s
 * budget, a one-off DNS failure. One observation cannot distinguish those from
 * a dead resource; two consecutive ones, a rolling interval apart, can.
 *
 * Before this, a link filed a `broken-link` repair at rank 90 — the highest
 * rank in the queue — on its FIRST failure, while a listing on the same URL
 * waited for its second. The Desk would select the flake ahead of every real
 * item, and if the flake had healed by then no job could repair it: the same
 * unrepairable-top-of-queue shape as addictedtoai-5hn.
 *
 * Exported so the listing rule and the link rule are literally the same
 * number, not two numbers that happen to agree today.
 * ---------------------------------------------------------------------------
 */
export const CONFIRM_AFTER_FAILURES = 2;

/** Has this URL failed often enough for "broken" to be a claim about the URL? */
export function isConfirmedBroken(consecutiveFailures) {
  return (consecutiveFailures ?? 0) >= CONFIRM_AFTER_FAILURES;
}

/**
 * ---------------------------------------------------------------------------
 * Statuses that answer a different question than the one we asked.
 *
 * The check asks "is this resource still there?". A 401, 403, 407 or 429 does
 * not answer it. The host resolved, accepted the connection, routed the path
 * and replied — every one of which is evidence the resource exists — and then
 * declined *this requester*: an unknown crawler user-agent, an API endpoint
 * wanting a key, a rate limit, a proxy. A reader with a browser, or a reader
 * with credentials, gets the page.
 *
 * Treating that as "broken" states something the check did not observe, and
 * files a repair job with nothing to repair: the URL is right, the content is
 * right, and no edit to this site changes the answer. So these are recorded as
 * a non-verdict (`ok: null`) — neither confirmed alive nor counted as a
 * failure. `last_ok` is not advanced, because the resource was not verified;
 * `consecutive_failures` is carried through unchanged, because no evidence
 * about the resource arrived either way.
 *
 * 404, 410, every other 4xx, and all 5xx remain failures. A dead link is still
 * a dead link, and transience is handled by CONFIRM_AFTER_FAILURES above, not
 * by forgiving the status.
 * ---------------------------------------------------------------------------
 */
const DECLINED_STATUSES = new Set([401, 403, 407, 429]);

/**
 * ---------------------------------------------------------------------------
 * What counts as a link this check can have an opinion about.
 *
 * **This is not a relaxation of the check. It is the check's domain.**
 *
 * A URL naming a loopback address, a private/link-local address, or a
 * reserved documentation TLD is not a resource this site depends on. It is
 * either an instruction to the reader ("open http://localhost:8080/ on your
 * own machine") or a stand-in used to illustrate a shape. From this machine
 * such a host resolves to nothing, or — worse — to whatever happens to be
 * listening on this machine, which is somebody else's computer's answer to a
 * question about the reader's computer. Either way the result is not evidence
 * about the link, so "broken" is a category error and no repair job can act
 * on it: there is nothing to fix and nothing to verify.
 *
 * Excluding these narrows the check to URLs it can actually be right or wrong
 * about. Every public URL, including one that is genuinely dead, still goes
 * through the check unchanged and is still reported.
 *
 * Do not "restore" these hosts to the check. A localhost finding once ranked
 * 90 in the queue, was selected first by the Desk, could not be repaired by
 * any job, and would have tripped the three-consecutive-failures breaker on
 * the loop's first work item (addictedtoai-5hn).
 * ---------------------------------------------------------------------------
 */

// RFC 6761 / RFC 2606 special-use and documentation names, plus RFC 8375.
const RESERVED_HOSTS = new Set(['localhost', 'example.com', 'example.net', 'example.org']);
const RESERVED_SUFFIXES = [
  '.localhost',
  '.local', // mDNS (RFC 6762)
  '.internal', // private-use TLD
  '.test',
  '.invalid',
  '.example',
  '.home.arpa', // RFC 8375
  '.example.com',
  '.example.net',
  '.example.org',
];

function isReservedName(host) {
  if (RESERVED_HOSTS.has(host)) return true;
  return RESERVED_SUFFIXES.some((s) => host.endsWith(s));
}

/** Loopback, "this host", RFC 1918 private, and RFC 3927 link-local. */
function isPrivateIPv4(host) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (m.slice(1).some((o) => Number(o) > 255)) return false;
  if (a === 0 || a === 127) return true; // 0.0.0.0/8 "this host", 127.0.0.0/8 loopback
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local
  return false;
}

/** ::1, ::, unique-local fc00::/7, link-local fe80::/10, and ::ffff:<v4>. */
function isPrivateIPv6(host) {
  if (host === '::1' || host === '::') return true;
  const mapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(host);
  if (mapped) {
    const hi = parseInt(mapped[1], 16);
    const lo = parseInt(mapped[2], 16);
    return isPrivateIPv4([hi >> 8, hi & 0xff, lo >> 8, lo & 0xff].join('.'));
  }
  const first = parseInt(host.split(':')[0] || '0', 16);
  if (!Number.isFinite(first)) return false;
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10
  return false;
}

/**
 * Can the rolling check say anything true about this URL?
 *
 * A URL that does not parse stays checkable on purpose: that is a real defect
 * in the content and the check reporting it is the point. Only hosts that are
 * unreachable *by definition* are excluded — see the block comment above.
 */
export function isCheckableUrl(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return true;
  }
  if (host === '') return true;
  if (host.startsWith('[') && host.endsWith(']')) return !isPrivateIPv6(host.slice(1, -1));
  if (isPrivateIPv4(host)) return false;
  return !isReservedName(host);
}

export function loadLinkState(root) {
  return readJson(paths(root).linkcheck, { urls: {} });
}

export function saveLinkState(root, state) {
  writeJson(paths(root).linkcheck, state);
}

/**
 * ---------------------------------------------------------------------------
 * REFERENCE ROT — a status code answers a different question than a citation
 * asks.
 *
 * `content/blog/reference-urls-that-still-return-200.md` measured this site's
 * own blind spot on 2026-08-28: of twelve reference URLs, nine returned 200
 * and four of those landed on content with no relationship to the path
 * requested. Every `paperswithcode.com/sota/*` and `/task/*` path 302s to
 * `huggingface.co/papers/trending` and returns the identical page; one more,
 * `crfm.stanford.edu/helm/latest/`, is a 232-byte document whose only content
 * is a meta refresh, which no HTTP redirect follower sees. The site published
 * that argument while its own checker read a status code and stopped.
 *
 * Two rules govern what is done about it, and the SECOND OUTRANKS THE FIRST.
 *
 *  1. Record the destination. `final_url`, `bytes` and any meta-refresh hop go
 *     into the state file for every checked URL, so a reader can see where a
 *     citation actually lands. This is the blog's first recommendation made
 *     true of the checker.
 *
 *  2. **A legitimate redirect files no repair work.** http -> https, www ->
 *     apex, a trailing slash, an org rename — all of these resolve correctly
 *     and there is nothing for a job to fix. Filing one would produce exactly
 *     the item that halted the loop on `http://localhost:8080/`
 *     (addictedtoai-5hn): selected by the Desk, unrepairable, failing until a
 *     breaker trips. So the classification below is deliberately reluctant,
 *     and anything it cannot decide is RECORDED AND SURFACED WITHOUT A
 *     FINDING. An honest observation beats a false alarm.
 *
 * What is therefore treated as drift, and why each is decidable without
 * reading the page:
 *
 *  - `catch-all` — two or more distinct cited URLs resolve to ONE destination.
 *    A legitimate redirect maps one resource to one new location; a catch-all
 *    maps a whole path space onto a single page. This is the blog's own
 *    detectable signal ("two different citations resolving to the same page")
 *    and it needs no judgement about what the page is about.
 *  - `cross-site-repath` — the destination is on a different site AND shares
 *    no word with the path that was asked for. `/sota/image-classification-on-
 *    imagenet` -> `/papers/trending` shares nothing; `/paper/attention-is-all-
 *    you-need` -> `/papers/1706.03762` shares `paper`, so it is not a finding,
 *    which is correct — that redirect works.
 *
 * What is deliberately NOT treated as drift, and is left visible instead:
 *
 *  - **A landing this check could not judge.** A 401/403/407/429 is recorded
 *    with `ok: null` precisely because it answers a different question (see
 *    DECLINED_STATUSES); a request that was declined landed on a challenge or a
 *    login page, not on the resource. Filing rot from it would state something
 *    the check did not observe, which is rule 2 exactly. See referenceDrift.
 *  - A move within one site, however far the path travels. Both org renames in
 *    the post (`spaces/lmsys/...` -> `spaces/lmarena-ai/...`) are this shape.
 *  - A meta refresh. It is followed and recorded — `helm/latest` -> `helm/
 *    classic/latest` is now visible and its destination's status is the one
 *    reported — but "latest means classic" is a judgement about words, not a
 *    measurement, and no mechanical rule separates it from a legitimate stub.
 *  - **A plausible substitute.** `/dataset/imagenet` -> `/datasets/zh-plus/
 *    tiny-imagenet` is, per the post, the worst rot in the set: a different
 *    dataset an order of magnitude smaller. It shares the word `imagenet`, so
 *    the rule above does not fire, and that is a choice rather than an
 *    oversight — any rule sharp enough to catch it would also fire on every
 *    legitimate rename that keeps a word. Distinguishing "imagenet" from
 *    "tiny-imagenet" needs the page read and understood. It is recorded as a
 *    cross-site redirect with its destination named, and left for a human.
 * ---------------------------------------------------------------------------
 */

/** A body this small is a redirect stub or an error page, never an article. */
export const STUB_MAX_BYTES = 8192;

/**
 * Compare URLs the way a reader would: scheme, `www.`, a trailing slash and a
 * fragment are not the identity of a resource. The query is, so it is kept.
 * Returns `null` for anything unparseable — an unparseable URL is a content
 * defect the status check already reports, not a redirect question.
 */
export function normalizeUrlKey(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const path = u.pathname.replace(/\/+$/, '') || '/';
  return { host, path, key: `${host}${path}${u.search}` };
}

/**
 * The site a host belongs to, approximated as its last two labels.
 *
 * This is wrong for multi-label public suffixes — `a.co.uk` and `b.co.uk` both
 * reduce to `co.uk` and are read as one site. The error is deliberately in
 * that direction: it makes the check call a move "same-site", which files
 * NOTHING. Erring the other way would invent findings, and rule 2 above says
 * a false alarm is the more expensive mistake.
 */
export function registrableDomain(host) {
  const labels = String(host ?? '').toLowerCase().split('.').filter(Boolean);
  return labels.length <= 2 ? labels.join('.') : labels.slice(-2).join('.');
}

/** Words a path is made of, for "does the destination still mention what was asked for?". */
export function pathTokens(path) {
  const tokens = new Set();
  for (const raw of String(path ?? '').toLowerCase().split(/[^a-z0-9.]+/)) {
    const t = raw.replace(/^\.+|\.+$/g, '');
    if (t.length < 3) continue; // "v1", "en", "on" carry no meaning either way
    tokens.add(t.replace(/s$/, '')); // paper / papers, dataset / datasets
  }
  return tokens;
}

/**
 * What kind of move a redirect was. Only `cross-site-repath` is drift-worthy;
 * every other kind is an observation. See the block comment above.
 *
 * @returns {'same'|'same-site-move'|'cross-site-preserved'|'cross-site-related'|'cross-site-repath'|'unknown'}
 */
export function classifyRedirect(requested, final) {
  const a = normalizeUrlKey(requested);
  const b = normalizeUrlKey(final);
  if (!a || !b) return 'unknown';
  if (a.key === b.key) return 'same';
  if (registrableDomain(a.host) === registrableDomain(b.host)) return 'same-site-move';
  if (a.path === b.path) return 'cross-site-preserved';
  if (a.path === '/' || b.path === '/') return 'cross-site-related';
  const asked = pathTokens(a.path);
  for (const t of pathTokens(b.path)) if (asked.has(t)) return 'cross-site-related';
  return 'cross-site-repath';
}

/** The absolute target of a `<meta http-equiv="refresh">`, or null. */
export function metaRefreshTarget(html, base) {
  const tag = /<meta\b[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/i.exec(String(html ?? ''));
  if (!tag) return null;
  const content = /content\s*=\s*["']([^"']*)["']/i.exec(tag[0]);
  if (!content) return null;
  const target = /(?:^|;)\s*url\s*=\s*["']?([^"';]+)/i.exec(content[1]);
  if (!target) return null;
  try {
    return new URL(target[1].trim(), base).href;
  } catch {
    return null;
  }
}

/** Read at most `max` bytes of a response body, then let the rest go. */
async function readCapped(res, max = STUB_MAX_BYTES) {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let text = '';
  try {
    while (text.length < max) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
  } catch {
    /* a truncated read is not a failure of the link — the status already spoke */
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* already closed */
    }
  }
  return text.slice(0, max);
}

/**
 * The destination's byte length, or null when the server did not say.
 *
 * `Number(null)` is 0, so reading the header straight through Number() records
 * a chunked response as a zero-byte page — a measurement of nothing, printed
 * as if it were a measurement. Measured live on `www.anthropic.com/news`,
 * which sends no `content-length`.
 */
function contentLength(res) {
  const raw = res.headers?.get?.('content-length');
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Could this response be a redirect stub rather than a page? */
function couldBeStub(res) {
  if (res.status >= 400) return false;
  const type = res.headers?.get?.('content-type') ?? '';
  if (!/text\/html|application\/xhtml/i.test(type)) return false;
  const len = contentLength(res);
  // `null` means the server did not say. Unknown is exactly where a silent
  // miss hides, so it is read (capped) rather than assumed large.
  return len === null || len <= STUB_MAX_BYTES;
}

/**
 * One URL. A HEAD that the server rejects as a method is retried as GET.
 *
 * Returns `ok: true` (resolves), `ok: false` (failed — see
 * CONFIRM_AFTER_FAILURES before acting on one), or `ok: null` (the host
 * declined this requester; no verdict — see DECLINED_STATUSES), plus where the
 * request actually landed: `finalUrl`, `bytes`, and `metaRefresh` when the
 * destination was reached only through one.
 *
 * Each request gets its OWN timeout. One shared `AbortSignal.timeout` made the
 * 15s budget cover the HEAD and the retried GET together, so a slow-but-alive
 * host that spent 14s on the HEAD had one second to answer the GET and was
 * recorded as a timeout — the check manufacturing the failure it then reports.
 */
export async function checkUrl(url) {
  const request = (method, target = url) =>
    fetch(target, {
      method,
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  try {
    let res = await request('HEAD');
    let body = null;
    // Many hosts answer HEAD with a method error, or refuse it while serving
    // GET happily, so a refusal is retried once before it is believed.
    if (res.status === 405 || res.status === 501 || DECLINED_STATUSES.has(res.status)) {
      res = await request('GET');
      body = couldBeStub(res) ? await readCapped(res) : '';
    }
    if (DECLINED_STATUSES.has(res.status)) {
      return {
        ok: null,
        status: res.status,
        error: null,
        finalUrl: res.url || url,
        bytes: contentLength(res),
        metaRefresh: null,
      };
    }

    let finalUrl = res.url || url;
    let bytes = contentLength(res);
    let metaRefresh = null;

    // The hop no link checker follows. A HEAD has no body, so the candidate is
    // fetched once — only when it is small enough, or unmeasured, to be a stub.
    if (body === null && couldBeStub(res)) {
      try {
        const g = await request('GET', finalUrl);
        if (couldBeStub(g)) body = await readCapped(g);
      } catch {
        body = '';
      }
    }
    const target = body ? metaRefreshTarget(body, finalUrl) : null;
    if (target && normalizeUrlKey(target)?.key !== normalizeUrlKey(finalUrl)?.key) {
      metaRefresh = target;
      try {
        // The destination's status is the one that answers "is this resource
        // still there?" — a 200 stub in front of a 404 is not a live citation.
        const hop = await request('HEAD', target);
        res = hop;
        finalUrl = hop.url || target;
        bytes = contentLength(hop);
      } catch {
        /* the stub resolved; its target did not answer. Keep the stub's own
           status rather than inventing a failure the request did not observe. */
      }
    }

    if (DECLINED_STATUSES.has(res.status)) {
      return { ok: null, status: res.status, error: null, finalUrl, bytes, metaRefresh };
    }
    return { ok: res.status < 400, status: res.status, error: null, finalUrl, bytes, metaRefresh };
  } catch (err) {
    return {
      ok: false,
      status: null,
      // The errno, not just `TypeError: fetch failed` (beads addictedtoai-a6s).
      //
      // `fetch` collapses every connection-level failure into one sentence and
      // hangs the only distinguishing detail off `err.cause`. Recording name
      // and message alone made "this citation is dead" and "this machine has
      // run out of ephemeral ports" byte-identical — and this check is MORE
      // exposed to the second than source fetching is, because a rolling run
      // opens far more outbound connections. Measured 2026-08-29 on Windows
      // (addictedtoai-ar0): with ~7,000 loopback ports in TIME_WAIT, 688 of
      // 3,000 fetches failed, every one of them `connect EADDRINUSE`.
      //
      // It matters more here than in `sources.mjs`, because this string is not
      // just logged: it persists into `data/linkcheck.json` and is quoted
      // verbatim in the queue's repair reason (`pulse/lib/queue.mjs`). A
      // misdiagnosed reason costs a whole job. `describeFetchError` is imported
      // rather than reimplemented so the two records cannot drift apart.
      error: describeFetchError(err),
      finalUrl: null,
      bytes: null,
      metaRefresh: null,
    };
  }
}

/**
 * Where the corpus's citations actually land, and which of those landings this
 * check is willing to call rot. Derived from current state on every run —
 * never accumulated — so a repaired citation leaves both lists by itself.
 *
 * @returns {{redirected: object[], drift: object[]}} every recorded move, and
 *          the subset a repair job can act on.
 */
export function referenceDrift(links, state) {
  const urls = state?.urls ?? {};
  const moved = [];

  for (const link of links) {
    const rec = urls[link.url];
    if (!rec || rec.ok === false || !rec.final_url) continue;
    const from = normalizeUrlKey(link.url);
    const to = normalizeUrlKey(rec.final_url);
    if (!from || !to) continue;
    const kind = classifyRedirect(link.url, rec.final_url);
    if (kind === 'same' && !rec.meta_refresh) continue;
    moved.push({
      url: link.url,
      final_url: rec.final_url,
      kind,
      bytes: rec.bytes ?? null,
      meta_refresh: rec.meta_refresh ?? null,
      last_checked: rec.last_checked ?? null,
      cited_by: link.cited_by ?? [],
      // Did a verdict about the RESOURCE arrive at all? `ok: true` is the only
      // value that says one did: `ok: false` is filtered above (a dead link is
      // already a broken-link repair), and `ok: null` is the DECLINED
      // non-verdict — 401/403/407/429, which checkUrl itself records as
      // answering a different question than the one asked. See below for why
      // this is carried rather than filtered here. It is carried into the
      // output too: a reader of `redirected_links` can then see which recorded
      // landings the check was able to judge and which it was not.
      verdict_recorded: rec.ok === true,
      fromKey: from.key,
      toKey: to.key,
    });
  }

  // ---------------------------------------------------------------------------
  // A NON-VERDICT FILES NOTHING, AND COUNTS TOWARD NOTHING.
  //
  // Rule 2 above outranks rule 1: anything the check cannot decide is recorded
  // and surfaced WITHOUT a finding. A declined response is the purest case of
  // that — the host told us about our own request, not about the resource — and
  // a declined request lands on a challenge or login page, not on the resource.
  //
  // MEASURED before this: two 403 citations whose requests both landed on one
  // challenge URL filed two `catch-all` repair items. There is nothing there to
  // repair; the citations are fine and no edit to this site changes the answer.
  // That is the shape that halted the loop on addictedtoai-5hn.
  //
  // So a record with no verdict is excluded from the catch-all tally as well as
  // from `drift` — a destination two declined requests share is evidence about
  // the requester, and letting it push a real record over the two-citation
  // threshold would manufacture the finding through the side door. It stays in
  // `redirected`, because where a citation lands is an honest observation and
  // rule 1 asks for exactly that.
  // ---------------------------------------------------------------------------

  // The catch-all signal: distinct citations collapsing onto one destination.
  const byDestination = new Map();
  for (const m of moved) {
    if (!m.verdict_recorded) continue;
    if (m.fromKey === m.toKey) continue;
    if (!byDestination.has(m.toKey)) byDestination.set(m.toKey, new Set());
    byDestination.get(m.toKey).add(m.fromKey);
  }

  const drift = [];
  for (const m of moved) {
    if (!m.verdict_recorded) continue;
    const collapsed = byDestination.get(m.toKey)?.size ?? 0;
    const isCatchAll = m.fromKey !== m.toKey && collapsed >= 2;
    if (!isCatchAll && m.kind !== 'cross-site-repath') continue;
    drift.push({
      url: m.url,
      final_url: m.final_url,
      kind: isCatchAll ? 'catch-all' : 'cross-site-repath',
      bytes: m.bytes,
      meta_refresh: m.meta_refresh,
      last_checked: m.last_checked,
      cited_by: m.cited_by,
      detail: isCatchAll
        ? `${collapsed} distinct cited URL(s) now resolve to ${m.final_url} — a destination serving a whole path space is not the resource any of them cited`
        : `resolves to ${m.final_url}, on a different site and sharing no word with the path requested`,
    });
  }

  const strip = ({ fromKey, toKey, ...rest }) => rest;
  const order = (a, b) => (a.url < b.url ? -1 : 1);
  return { redirected: moved.map(strip).sort(order), drift: drift.sort(order) };
}

/**
 * Run the rolling check. `offline` skips every request and only prunes state,
 * which is what fixture tests and a no-network run use.
 */
export async function rollingLinkCheck(root, allLinks, { offline = false, max = DEFAULT_MAX_PER_RUN } = {}) {
  const state = loadLinkState(root);
  state.urls ??= {};
  const day = today();

  // Judged once, here, before anything else looks at a URL — never by
  // filtering findings afterwards, which would leave the state file
  // accumulating verdicts on hosts no check can reach.
  const links = allLinks.filter((l) => isCheckableUrl(l.url));
  const excluded = allLinks.length - links.length;

  const present = new Set(links.map((l) => l.url));

  // Prune URLs the corpus no longer cites — and, by the same pass, any
  // verdict recorded before a host was recognized as uncheckable, so the
  // exclusion heals stale state instead of only suppressing new findings.
  let pruned = 0;
  for (const url of Object.keys(state.urls)) {
    if (!present.has(url)) {
      delete state.urls[url];
      pruned++;
    }
  }

  const due = links
    .filter((l) => {
      const rec = state.urls[l.url];
      if (!rec || !rec.last_checked) return true;
      const age = daysSince(rec.last_checked);
      return age === null || age >= LINK_INTERVAL_DAYS;
    })
    .sort((a, b) => {
      const ra = state.urls[a.url]?.last_checked ?? '';
      const rb = state.urls[b.url]?.last_checked ?? '';
      if (ra === rb) return a.url < b.url ? -1 : 1;
      return ra < rb ? -1 : 1;
    });

  const checked = [];
  if (!offline) {
    for (const link of due.slice(0, max)) {
      const res = await checkUrl(link.url);
      const prev = state.urls[link.url] ?? {};
      // `ok: null` is a non-verdict, not a failure: it neither advances
      // `last_ok` nor increments the failure count. `last_checked` DOES
      // advance, so a host that rate-limits us is not re-hit every single run
      // — which would be both rude and no more informative.
      const declined = res.ok === null;
      state.urls[link.url] = {
        last_checked: day,
        status: res.status,
        ok: res.ok,
        error: res.error,
        last_ok: res.ok === true ? day : (prev.last_ok ?? null),
        consecutive_failures: declined ? (prev.consecutive_failures ?? 0) : res.ok ? 0 : (prev.consecutive_failures ?? 0) + 1,
        // Where the request actually landed. The status alone cannot say
        // whether the citation still points at what it cited, and the previous
        // fields are the whole of what this file used to know.
        final_url: res.finalUrl ?? null,
        bytes: res.bytes ?? null,
        meta_refresh: res.metaRefresh ?? null,
      };
      checked.push({ url: link.url, ...res });
    }
  }

  saveLinkState(root, state);

  // `ok === false` already excludes the declined non-verdicts (`ok === null`).
  // Both failure states are reported so staleness cannot hide; the queue files
  // work only for the confirmed ones, exactly as it does for listings.
  const broken = links
    .map((l) => ({ ...l, record: state.urls[l.url] }))
    .filter((l) => l.record && l.record.ok === false)
    .map((l) => {
      const failures = l.record.consecutive_failures ?? 1;
      return {
        url: l.url,
        status: l.record.status,
        error: l.record.error,
        consecutive_failures: failures,
        // Mirrors the listing states in freshness.mjs, from the same constant.
        state: isConfirmedBroken(failures) ? 'broken' : 'failing-once',
        last_checked: l.record.last_checked,
        last_ok: l.record.last_ok ?? null,
        cited_by: l.cited_by,
      };
    })
    .sort((a, b) => (a.url < b.url ? -1 : 1));

  // Counted, not hidden — the same discipline as `excluded`: a host declining
  // our user-agent should be visible in the derived data, never silently gone.
  const declined = links.filter((l) => state.urls[l.url]?.ok === null).length;

  // Where the live citations land. `redirected` is every recorded move and
  // files nothing; `drift` is the subset a repair job can act on. Computed
  // over the whole state, not just this run's slice, because the catch-all
  // signal is about the relationship BETWEEN citations and the rolling check
  // only ever sees a few of them per run.
  const { redirected, drift } = referenceDrift(links, state);

  return {
    total: links.length,
    excluded,
    declined,
    due: due.length,
    checked: checked.length,
    pruned,
    offline,
    broken,
    redirected,
    drift,
    state,
  };
}
