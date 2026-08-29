/**
 * sources.mjs — fetch, refusal handling, snapshot rotation, row extraction.
 *
 * Per specs/pulse: every fetch is snapshotted, hashed and diffed; an
 * unchanged source costs one fetch and nothing else; **a source that refuses
 * (403, 429, terms) is recorded as refusing with the date — never routed
 * around, never retried aggressively, never scraped through a side door.**
 * Refusals are data. There is no fallback fetch, no alternate user agent, no
 * proxy, and no path in this file that reacts to a refusal by trying again
 * differently.
 *
 * Snapshot shape (`data/sources/<id>/latest.json`, `previous.json`):
 *
 *     { source, url, date, fetched_at, body_hash, row_count,
 *       rows: { "<row id>": { ...row... } } }
 *
 * Rows are keyed by row id and written through `stableStringify`, so an
 * unchanged world produces byte-identical snapshots.
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { getPath, now, readJson, sha256, sourcePaths, stableStringify, today, writeJson } from './core.mjs';

const USER_AGENT = 'AddictedtoAI-Pulse/0.1 (+https://www.addictedtoai.net)';
const TIMEOUT_MS = 30000;

/** HTTP statuses that mean "this source is refusing us". */
const REFUSAL_STATUSES = new Set([401, 403, 429, 451]);

export function loadState(root, id) {
  return (
    readJson(sourcePaths(root, id).state) ?? {
      source: id,
      last_fetch_at: null,
      last_fetch_date: null,
      last_status: null,
      last_change_date: null,
      last_error: null,
      consecutive_no_change_fetches: 0,
      seeded: false,
      refusing: null,
    }
  );
}

export function saveState(root, id, state) {
  writeJson(sourcePaths(root, id).state, state);
}

export function loadSnapshot(root, id, which = 'latest') {
  return readJson(sourcePaths(root, id)[which], null);
}

/** The hash the diff keys off: the snapshot's rows, not the raw body. */
export function rowsHash(snapshot) {
  if (!snapshot || !snapshot.rows) return 'none';
  return sha256(stableStringify(snapshot.rows)).slice(0, 16);
}

/**
 * Extract `{ rowId: row }` from a fetched body according to the source's
 * declared format. Rows with no id are skipped and counted, never guessed at.
 */
export function extractRows(source, body) {
  const rows = {};
  let skipped = 0;

  if (source.format === 'json') {
    const parsed = JSON.parse(body);
    const list = getPath(parsed, source.rows_path);
    if (!Array.isArray(list)) {
      throw new Error(`source "${source.id}": rows_path "${source.rows_path}" did not yield an array`);
    }
    for (const row of list) {
      const id = row?.[source.row_id_field];
      if (typeof id !== 'string' || id === '') {
        skipped++;
        continue;
      }
      rows[id] = row;
    }
  } else if (source.format === 'rss') {
    const $ = cheerio.load(body, { xml: true });
    $('item').each((_, el) => {
      const item = $(el);
      const sourceEl = item.find('source').first();
      const row = {
        title: item.find('title').first().text() || null,
        link: item.find('link').first().text() || null,
        guid: item.find('guid').first().text() || null,
        pubDate: item.find('pubDate').first().text() || null,
        description: item.find('description').first().text() || null,
        source_url: sourceEl.attr('url') ?? null,
        source_name: sourceEl.text() || null,
      };
      const id = row[source.row_id_field];
      if (typeof id !== 'string' || id === '') {
        skipped++;
        return;
      }
      rows[id] = row;
    });
  } else {
    throw new Error(`source "${source.id}": unsupported format "${source.format}"`);
  }

  return { rows, skipped };
}

/**
 * Is this source due to be fetched?
 *
 * A refusing source is retried at most once per day (specs/pulse: "retrying
 * at most daily"), regardless of its normal cadence.
 */
export function isDue(source, state, { force = false } = {}) {
  const day = today();
  if (state.refusing) {
    if (state.refusing.last_retry_date === day) return { due: false, why: 'refusing, already retried today' };
    return { due: true, why: 'refusing, daily retry' };
  }
  if (force) return { due: true, why: 'forced' };
  if (!state.last_fetch_date) return { due: true, why: 'never fetched' };
  const elapsed = Math.floor((new Date(`${day}T00:00:00Z`) - new Date(`${state.last_fetch_date}T00:00:00Z`)) / 86400000);
  if (elapsed >= source.fetch_every_days) return { due: true, why: `${elapsed}d since last fetch` };
  return { due: false, why: `fetched ${elapsed}d ago, cadence ${source.fetch_every_days}d` };
}

/**
 * Fetch one source. Returns a result describing what happened; it never
 * throws for a network condition, because a source being unreachable is a
 * fact about the world, not a failure of the engine.
 */
export async function fetchSource(source) {
  try {
    const res = await fetch(source.url, {
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT, accept: source.format === 'json' ? 'application/json' : '*/*' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await res.text();
    if (REFUSAL_STATUSES.has(res.status)) {
      return { outcome: 'refused', status: res.status, body: null };
    }
    if (!res.ok) {
      return { outcome: 'error', status: res.status, error: `HTTP ${res.status} ${res.statusText}` };
    }
    return { outcome: 'ok', status: res.status, body, final_url: res.url };
  } catch (err) {
    return { outcome: 'error', status: null, error: describeFetchError(err) };
  }
}

/**
 * Name the errno behind a failed fetch.
 *
 * `fetch` collapses every connection-level failure into the identical
 * `TypeError: fetch failed`, and puts the only distinguishing detail on
 * `err.cause`. Discarding it made a source that is genuinely down
 * indistinguishable from a machine that has run out of ephemeral ports, and
 * `npm test` is a merge gate: whoever reads a failing gate sees this string
 * and nothing else.
 *
 * Measured 2026-08-29 (addictedtoai-ar0): with ~7,000 loopback ports held in
 * TIME_WAIT, 688 of 3,000 fetches to a freshly bound 127.0.0.1 server failed,
 * every one of them `connect EADDRINUSE` — the client could not obtain a
 * local port. The engine's behaviour is unchanged and nothing is retried;
 * only the recorded sentence gets longer, and only when there is a cause to
 * name.
 */
export function describeFetchError(err) {
  const base = `${err.name}: ${err.message}`;
  const cause = err?.cause;
  if (!cause) return base;
  const detail = cause.code ?? cause.message ?? null;
  return detail ? `${base} (${detail})` : base;
}

/**
 * Fetch (if due), rotate snapshots, and report what changed.
 *
 * Rotation rule: `previous` is only replaced when the fetched body's rows
 * differ from `latest`. An unchanged source therefore records its check time
 * and nothing else, and the standing diff between `previous` and `latest`
 * stays exactly where it was — which is what makes a re-run produce no new
 * change lines.
 */
export async function ingestSource(root, source, { force = false, offline = false } = {}) {
  const sp = sourcePaths(root, source.id);
  mkdirSync(sp.dir, { recursive: true });
  const state = loadState(root, source.id);
  const due = isDue(source, state, { force });

  if (offline || !due.due) {
    saveState(root, source.id, state);
    return { source: source.id, action: offline ? 'offline' : 'skipped', why: offline ? 'offline mode' : due.why, state };
  }

  const res = await fetchSource(source);
  const day = today();
  const at = now().toISOString();

  if (res.outcome === 'refused') {
    // Recorded, not routed around. No second attempt with different headers,
    // no alternate endpoint, no scraping. The last snapshot keeps serving.
    const since = state.refusing?.since ?? day;
    state.refusing = { since, status: res.status, last_retry_date: day, reason: `HTTP ${res.status}` };
    state.last_status = res.status;
    state.last_fetch_at = at;
    saveState(root, source.id, state);
    return { source: source.id, action: 'refused', status: res.status, since, state };
  }

  if (res.outcome === 'error') {
    state.last_error = { date: day, detail: res.error };
    state.last_status = res.status;
    state.last_fetch_at = at;
    if (state.refusing) state.refusing.last_retry_date = day;
    saveState(root, source.id, state);
    return { source: source.id, action: 'error', error: res.error, state };
  }

  // A source that answers is no longer refusing.
  const wasRefusing = Boolean(state.refusing);
  state.refusing = null;
  state.last_error = null;
  state.last_status = res.status;
  state.last_fetch_at = at;
  state.last_fetch_date = day;

  const { rows, skipped } = extractRows(source, res.body);
  const rowCount = Object.keys(rows).length;
  const snapshot = {
    source: source.id,
    url: source.url,
    date: day,
    fetched_at: at,
    body_hash: sha256(res.body),
    row_count: rowCount,
    rows,
  };

  const latest = loadSnapshot(root, source.id, 'latest');
  const unchanged = latest && rowsHash(latest) === rowsHash(snapshot);

  if (!latest) {
    // First ingestion: previous == latest, so the first diff is empty by
    // construction. Diff history begins here; specs/pulse seeds the feed
    // separately so launch day is not blank.
    writeJson(sp.latest, snapshot);
    writeJson(sp.previous, snapshot);
    state.last_change_date = day;
    state.consecutive_no_change_fetches = 0;
    saveState(root, source.id, state);
    return { source: source.id, action: 'first-ingest', rows: rowCount, skipped, was_refusing: wasRefusing, state };
  }

  if (unchanged) {
    state.consecutive_no_change_fetches = (state.consecutive_no_change_fetches ?? 0) + 1;
    saveState(root, source.id, state);
    return { source: source.id, action: 'unchanged', rows: rowCount, skipped, was_refusing: wasRefusing, state };
  }

  writeJson(sp.previous, latest);
  writeJson(sp.latest, snapshot);
  state.last_change_date = day;
  state.consecutive_no_change_fetches = 0;
  saveState(root, source.id, state);
  return { source: source.id, action: 'changed', rows: rowCount, skipped, was_refusing: wasRefusing, state };
}

/** Raw text of a snapshot file, for callers that need the exact bytes. */
export function snapshotBytes(root, id, which = 'latest') {
  const file = sourcePaths(root, id)[which];
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}
