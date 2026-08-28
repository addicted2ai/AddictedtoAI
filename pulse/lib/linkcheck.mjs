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

/** One URL. A HEAD that the server rejects as a method is retried as GET. */
export async function checkUrl(url) {
  const opts = {
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  };
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' });
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetch(url, { ...opts, method: 'GET' });
    }
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
      state.urls[link.url] = {
        last_checked: day,
        status: res.status,
        ok: res.ok,
        error: res.error,
        last_ok: res.ok ? day : (prev.last_ok ?? null),
        consecutive_failures: res.ok ? 0 : (prev.consecutive_failures ?? 0) + 1,
      };
      checked.push({ url: link.url, ...res });
    }
  }

  saveLinkState(root, state);

  const broken = links
    .map((l) => ({ ...l, record: state.urls[l.url] }))
    .filter((l) => l.record && l.record.ok === false)
    .map((l) => ({
      url: l.url,
      status: l.record.status,
      error: l.record.error,
      consecutive_failures: l.record.consecutive_failures ?? 1,
      last_checked: l.record.last_checked,
      last_ok: l.record.last_ok ?? null,
      cited_by: l.cited_by,
    }))
    .sort((a, b) => (a.url < b.url ? -1 : 1));

  return {
    total: links.length,
    excluded,
    due: due.length,
    checked: checked.length,
    pruned,
    offline,
    broken,
    state,
  };
}
