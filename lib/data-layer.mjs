/**
 * data-layer.mjs — the read side of the Pulse's output.
 *
 * The Pulse (tasks 3.x) writes `data/derived/`; the build reads it. This
 * module is the whole of that read contract, in one file, so the two sides
 * have exactly one place to agree and the fact renderer can be unit tested
 * against a fake layer with no Pulse run and no files at all.
 *
 * **The files this reads, as the Pulse actually writes them** (verified
 * against a real `node pulse/run.mjs` output, not assumed from the spec):
 *
 *   data/derived/feed-rows.json — the join surface, and the only place a
 *     `feed` fact's value comes from. One entry per row id an entry's
 *     `feeds:` map declares:
 *       { "<source-id>": { "<row-id>": {
 *            ...the source row verbatim, so a fact's dotted `path`
 *               (e.g. `pricing.prompt`) resolves against the raw shape...
 *            "$status":   registry-derived lifecycle status,
 *            "$as_of":    date of the snapshot these values came from,
 *            "$vanished": true when the latest snapshot no longer has the
 *                         row — the values are then last-known, never
 *                         current (specs/wiki) } } }
 *
 *   data/derived/sources.json   — { sources: [ { id, url, ... } ] }
 *   data/derived/freshness.json — its `sources[]` carries the display
 *     decision already made: `suspect`, plus `display_date` and
 *     `display_date_label` ("last checked" or, for a suspect source, "last
 *     changed"). The build renders that label rather than re-deriving it,
 *     so the site and the queue can never disagree about a source's state.
 *
 * A missing file is a legitimate pre-first-Pulse state, never a crash: the
 * layer reports `present: false` and every feed fact renders as not-yet-
 * fetched rather than as a value.
 */

import { join } from 'node:path';
import { DERIVED_DIR, readJson } from './paths.mjs';

/** Read a dotted path out of a row. Returns `undefined` when absent. */
export function valueAtPath(row, path) {
  if (row == null) return undefined;
  let cur = row;
  for (const seg of String(path).split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[seg];
  }
  return cur;
}

function indexSources(sources, freshness) {
  const out = new Map();
  for (const s of sources?.sources ?? []) {
    if (s?.id) out.set(s.id, { ...s });
  }
  for (const s of freshness?.sources ?? []) {
    if (!s?.id) continue;
    out.set(s.id, { ...(out.get(s.id) ?? {}), ...s });
  }
  return out;
}

/**
 * @typedef {object} DataLayer
 * @property {boolean} present                    false before the first Pulse run
 * @property {(sourceId: string) => object|null} source
 * @property {(sourceId: string, rowId: string) => object|null} row
 */

/** @returns {DataLayer} */
export function makeDataLayer({ sources, feedRows, freshness, present } = {}) {
  const srcs = indexSources(sources, freshness);
  const rows = feedRows ?? {};
  return {
    present: present ?? Object.keys(rows).length > 0,
    source: (id) => srcs.get(id) ?? null,
    row: (id, rowId) => rows[id]?.[rowId] ?? null,
  };
}

/** The pre-first-Pulse state: no rows, no sources, nothing vanished. */
export function emptyDataLayer() {
  return makeDataLayer({ present: false });
}

export async function loadDataLayer(derivedDir = DERIVED_DIR) {
  const feedRows = await readJson(join(derivedDir, 'feed-rows.json'), null);
  const sources = await readJson(join(derivedDir, 'sources.json'), null);
  const freshness = await readJson(join(derivedDir, 'freshness.json'), null);
  return makeDataLayer({
    feedRows: feedRows ?? {},
    sources,
    freshness,
    present: feedRows != null && sources != null,
  });
}
