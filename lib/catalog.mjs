/**
 * catalog.mjs — the model catalog and the three standing tables (task 4.2,
 * specs/directory).
 *
 * Every row here is read from the Pulse's derived files
 * (`data/derived/catalog.json`, `status-tables.json`). Nothing is computed
 * from a name and nothing is filled in: *"A field the feed does not provide
 * renders as absent — never guessed, never filled by a model."* `absent()`
 * below is the only way a missing value ever reaches a page.
 *
 * Prices arrive as per-token decimals (`"0.0000008"`). They are shown
 * per **million** tokens, which is how every vendor quotes them and the only
 * scale at which the numbers are readable — a multiplication by 1e6, stated
 * in the column header, and applied to nothing else. That is a unit change,
 * not an interpretation: the raw value stays in the JSON sibling and in the
 * dataset, and a row whose price is absent stays absent.
 *
 * specs/directory requires each listing page to state its sort criterion.
 * The criteria live here beside the sort that implements them, so a page
 * cannot state one order and render another.
 */

import { join } from 'node:path';
import { DERIVED_DIR, readJson } from './paths.mjs';

export const CATALOG_FILE = join(DERIVED_DIR, 'catalog.json');
export const STATUS_TABLES_FILE = join(DERIVED_DIR, 'status-tables.json');

export const SORT_CRITERIA = {
  catalog: 'provider, then model name, A to Z',
  deprecations: 'the date the row was first seen, newest first',
  changed: 'date, newest first',
};

/** Lifecycle statuses the deprecations table collects. */
export const OBITUARY_STATUSES = ['deprecated', 'retired', 'dead'];

export async function loadCatalog() {
  const catalog = await readJson(CATALOG_FILE, { row_count: 0, rows: [] });
  const tables = await readJson(STATUS_TABLES_FILE, {
    changed_30d: [],
    deprecations: [],
    generated_on: null,
    sort_criterion: {},
  });
  return { catalog, tables };
}

/** A value the feed did not provide. There is exactly one way to say it. */
export function absent() {
  return null;
}

/**
 * Per-million-token price from a per-token decimal string.
 * Returns null for anything that is not a finite number — including `"0"`
 * for a free model, which is a real zero and returns 0, not null.
 */
export function perMillion(value) {
  if (value === null || value === undefined || value === '') return absent();
  const n = Number(value);
  if (!Number.isFinite(n)) return absent();
  return n * 1e6;
}

/**
 * Format a per-million price for display, or null when there is none.
 *
 * Two decimal places everywhere above a cent, four below it. Varying the
 * precision by magnitude (`$10` beside `$2.00`) makes a 400-row column
 * impossible to scan down, which is the only thing this column is for.
 */
export function formatPrice(value) {
  const n = perMillion(value);
  if (n === null) return null;
  if (n === 0) return 'free';
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
}

/** Context windows read better with thousands separators than in full. */
export function formatContext(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString('en-US');
}

/**
 * One catalog row, ready to render, with its wiki entry joined by declared id.
 *
 * `fetchedOn` supplies the row's own fetch date. specs/directory requires it
 * **per row** — "Each row SHALL show at minimum: ... and the date the row's
 * source was last fetched" — and stating it once in a caption would be a
 * claim about the whole table that stops being true the moment a second
 * source is added on a different cadence.
 *
 * @param {object} row   a row of data/derived/catalog.json
 * @param {Map} byId     corpus.byId
 * @param {(sourceId: string) => string|null} [fetchedOn]
 */
export function catalogRow(row, byId, fetchedOn) {
  const entry = row.entry_id ? byId.get(row.entry_id) : null;
  return {
    row_id: row.row_id,
    name: row.display_name ?? row.row_id,
    provider: row.provider ?? null,
    entry: entry ? { id: entry.data.id, url: entry.url } : null,
    price_input: formatPrice(row.price_input),
    price_output: formatPrice(row.price_output),
    context_window: formatContext(row.context_window),
    status: row.status ?? null,
    source: row.source ?? null,
    source_url: row.source_url ?? null,
    fetched: fetchedOn?.(row.source) ?? null,
    // Raw values kept for the JSON sibling and for filtering, so the client
    // never has to parse a formatted string back into a number.
    raw: {
      price_input: perMillion(row.price_input),
      price_output: perMillion(row.price_output),
      context_window: row.context_window == null ? null : Number(row.context_window),
    },
  };
}

/** The full catalog, sorted by the criterion the page states. */
export function catalogRows(catalog, byId, fetchedOn) {
  return (catalog.rows ?? [])
    .map((r) => catalogRow(r, byId, fetchedOn))
    .sort(
      (a, b) =>
        String(a.provider ?? '').localeCompare(String(b.provider ?? '')) ||
        a.name.localeCompare(b.name),
    );
}

/** Deprecations and retirements. The vendor deletes theirs; this keeps them. */
export function deprecationRows(tables, byId, fetchedOn) {
  return (tables.deprecations ?? [])
    .map((r) => catalogRow(r, byId, fetchedOn))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Distinct providers, for the catalog filter's select. */
export function providersOf(rows) {
  return [...new Set(rows.map((r) => r.provider).filter(Boolean))].sort();
}

/** Distinct statuses present, so the filter offers only real values. */
export function statusesOf(rows) {
  return [...new Set(rows.map((r) => r.status).filter(Boolean))].sort();
}
