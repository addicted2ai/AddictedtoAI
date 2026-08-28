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
 * One URL. A HEAD that the server rejects as a method is retried as GET.
 *
 * Returns `ok: true` (resolves), `ok: false` (failed — see
 * CONFIRM_AFTER_FAILURES before acting on one), or `ok: null` (the host
 * declined this requester; no verdict — see DECLINED_STATUSES).
 *
 * Each request gets its OWN timeout. One shared `AbortSignal.timeout` made the
 * 15s budget cover the HEAD and the retried GET together, so a slow-but-alive
 * host that spent 14s on the HEAD had one second to answer the GET and was
 * recorded as a timeout — the check manufacturing the failure it then reports.
 */
export async function checkUrl(url) {
  const request = (method) =>
    fetch(url, {
      method,
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  try {
    let res = await request('HEAD');
    // Many hosts answer HEAD with a method error, or refuse it while serving
    // GET happily, so a refusal is retried once before it is believed.
    if (res.status === 405 || res.status === 501 || DECLINED_STATUSES.has(res.status)) {
      res = await request('GET');
    }
    if (DECLINED_STATUSES.has(res.status)) return { ok: null, status: res.status, error: null };
    return { ok: res.status < 400, status: res.status, error: null };
  } catch (err) {
    return { ok: false, status: null, error: `${err.name}: ${err.message}` };
  }
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

  return {
    total: links.length,
    excluded,
    declined,
    due: due.length,
    checked: checked.length,
    pruned,
    offline,
    broken,
    state,
  };
}
