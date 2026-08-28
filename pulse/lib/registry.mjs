/**
 * registry.mjs — load and validate `data/sources/registry.json` (specs/pulse).
 *
 * The registry is the only place a source may be declared. It records, per
 * source: URL, the fields it yields, which field is the row id (the join key
 * entries declare in their `feeds` map — see specs/wiki), `fetch_every_days`,
 * `expected_change_days`, the optional `mints` mapping, and the robots/terms
 * check with its date.
 *
 * Validation is strict and fails loudly: a malformed registry is a broken
 * engine, not something to work around. Adding or removing a source is an
 * ordinary data change, not an OpenSpec change.
 */

import { paths, readJson } from './core.mjs';

const FORMATS = new Set(['json', 'rss']);

export function loadRegistry(root) {
  const p = paths(root);
  const raw = readJson(p.registry);
  if (!raw) throw new Error(`source registry missing: ${p.registry}`);
  if (!Array.isArray(raw.sources)) throw new Error(`source registry has no "sources" array: ${p.registry}`);

  const seen = new Set();
  for (const s of raw.sources) {
    const where = `registry source "${s?.id ?? '(no id)'}"`;
    if (!s.id || typeof s.id !== 'string') throw new Error(`${where}: missing string "id"`);
    if (seen.has(s.id)) throw new Error(`${where}: duplicate source id`);
    seen.add(s.id);
    if (!s.url) throw new Error(`${where}: missing "url"`);
    if (!FORMATS.has(s.format)) throw new Error(`${where}: "format" must be one of ${[...FORMATS].join(', ')}`);
    if (!s.row_id_field) throw new Error(`${where}: missing "row_id_field" (the join key entries declare)`);
    if (!Number.isFinite(s.fetch_every_days)) throw new Error(`${where}: missing numeric "fetch_every_days"`);
    if (!Number.isFinite(s.expected_change_days)) {
      throw new Error(`${where}: missing numeric "expected_change_days" (the suspect-source input — not the fetch cadence)`);
    }
    if (!s.robots || !s.robots.checked_on || !s.robots.result) {
      throw new Error(`${where}: missing "robots" check with "checked_on" and "result"`);
    }
    if (!s.verification || !s.verification.date || !s.verification.result) {
      throw new Error(`${where}: missing "verification" with "date" and "result"`);
    }
    if (s.mints) {
      if (!s.mints.kind) throw new Error(`${where}: "mints" declared without a "kind"`);
      if (s.mints.slug_from !== 'row_id') {
        throw new Error(`${where}: "mints.slug_from" must be "row_id" — the slug is derived deterministically from the row id`);
      }
    }
    if (s.format === 'json' && !s.rows_path) throw new Error(`${where}: json format needs "rows_path"`);
  }
  return raw;
}

/** Sources in a stable order, so every derived file is order-independent. */
export function sortedSources(registry) {
  return [...registry.sources].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function findSource(registry, id) {
  return registry.sources.find((s) => s.id === id) ?? null;
}
