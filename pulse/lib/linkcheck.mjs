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
export async function rollingLinkCheck(root, links, { offline = false, max = DEFAULT_MAX_PER_RUN } = {}) {
  const state = loadLinkState(root);
  state.urls ??= {};
  const day = today();
  const present = new Set(links.map((l) => l.url));

  // Prune URLs the corpus no longer cites, so the state stays bounded by the
  // size of the site rather than by time passing.
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
    due: due.length,
    checked: checked.length,
    pruned,
    offline,
    broken,
    state,
  };
}
