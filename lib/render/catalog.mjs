/**
 * render/catalog.mjs — the model catalog and the standing tables
 * (task 4.2, specs/directory).
 *
 * The catalog is the densest thing on the site: ~400 rows, seven columns, and
 * every cell either a sourced value or a visible absence. Three rules it is
 * built around:
 *
 *  - **A missing value renders as missing.** `cell()` emits an em dash for
 *    null; there is no code path that substitutes an estimate.
 *  - **The fetch date is visible**, on the table, not in a footer — a price
 *    table without a date is a claim about today.
 *  - **The sort criterion is stated**, by the same function that sorts, so
 *    the page cannot claim an order it does not have.
 *
 * Filtering is done in the browser over `data-` attributes on the rows: the
 * numbers a filter compares (`data-price-in`, `data-context`) are on the row
 * already, so the client ships no copy of the table and parses no formatted
 * string back into a number. A visitor with JavaScript off gets the whole
 * table, which is the correct degradation for a reference page.
 */

import { el, join, link, extLink, cell, sortNote, escapeHtml, badge, statusTone, notice } from './common.mjs';
import { SORT_CRITERIA } from '../catalog.mjs';

const COLUMNS = [
  { key: 'name', label: 'Model' },
  { key: 'provider', label: 'Provider' },
  { key: 'price_input', label: 'In / Mtok', numeric: true },
  { key: 'price_output', label: 'Out / Mtok', numeric: true },
  { key: 'context_window', label: 'Context', numeric: true },
  { key: 'status', label: 'Status' },
  // The fetch date, per row, linked to the source it was read from — one
  // column doing both jobs specs/directory asks of it. Repeating the source
  // *name* on 400 consecutive rows says nothing the caption has not; the
  // date is what differs when a second source arrives on another cadence.
  { key: 'fetched', label: 'Read' },
];

function headRow() {
  return el(
    'tr',
    {},
    COLUMNS.map((c) =>
      el('th', { scope: 'col', 'data-numeric': c.numeric ? '' : null }, escapeHtml(c.label)),
    ).join(''),
  );
}

function nameCell(row) {
  return el(
    'th',
    { scope: 'row' },
    row.entry ? link(row.entry.url, row.name) : escapeHtml(row.name),
  );
}

export function catalogRowHtml(row) {
  return el(
    'tr',
    {
      'data-provider': row.provider ?? '',
      'data-status': row.status ?? '',
      'data-name': row.name.toLowerCase(),
      'data-price-in': row.raw.price_input ?? '',
      'data-context': row.raw.context_window ?? '',
    },
    nameCell(row),
    cell(row.provider),
    cell(row.price_input, { 'data-numeric': '' }),
    cell(row.price_output, { 'data-numeric': '' }),
    cell(row.context_window, { 'data-numeric': '' }),
    row.status ? el('td', {}, badge(row.status, statusTone(row.status))) : cell(null),
    row.fetched
      ? el(
          'td',
          { 'data-source': row.source ?? '' },
          row.source_url
            ? `<a href="${escapeHtml(row.source_url)}" rel="nofollow noopener" class="src" title="${escapeHtml(row.source ?? 'source')}"><time datetime="${escapeHtml(row.fetched)}">${escapeHtml(row.fetched)}</time></a>`
            : el('time', { datetime: row.fetched }, escapeHtml(row.fetched)),
        )
      : cell(null),
  );
}

/**
 * The whole table as one string — deliberately, so the hydration payload
 * carries a string rather than 400 serialised rows (see render/common.mjs).
 */
export function renderCatalogTable(rows, opts = {}) {
  return el(
    'div',
    { class: 'table-wrap' },
    el(
      'table',
      { class: 'data-table', id: opts.id ?? 'catalog-table' },
      opts.caption ? el('caption', {}, escapeHtml(opts.caption)) : '',
      el('thead', {}, headRow()),
      el('tbody', {}, rows.map(catalogRowHtml).join('')),
    ),
  );
}

/** The fetch date, stated where the numbers are. */
export function renderFetchLine(site) {
  const sources = site.freshness?.sources ?? [];
  if (sources.length === 0) return '';
  return el(
    'p',
    { class: 'fetch-line', 'data-fetched': sources[0]?.display_date ?? '' },
    'Rows read from ',
    sources
      .map((s) =>
        join(
          site.sourceUrl(s.id) ? extLink(site.sourceUrl(s.id), s.id) : escapeHtml(s.id),
          `, ${s.display_date_label ?? 'fetched'} ${escapeHtml(s.display_date ?? 'an unrecorded date')}`,
          s.suspect ? ' <span class="flag">source may be stale</span>' : '',
        ),
      )
      .join('; '),
    '.',
  );
}

/** The client-side filter controls. Plain form controls, no framework. */
export function renderCatalogFilters(providers, statuses) {
  return el(
    'form',
    { class: 'filters', id: 'catalog-filters', role: 'search', 'aria-label': 'Filter the catalog' },
    el(
      'p',
      { class: 'filter-field' },
      el('label', { for: 'f-name' }, 'Name contains'),
      el('input', { type: 'search', id: 'f-name', name: 'name', autocomplete: 'off', placeholder: 'opus, gemini, llama…' }),
    ),
    el(
      'p',
      { class: 'filter-field' },
      el('label', { for: 'f-provider' }, 'Provider'),
      el(
        'select',
        { id: 'f-provider', name: 'provider' },
        el('option', { value: '' }, 'any'),
        providers.map((p) => el('option', { value: p }, escapeHtml(p))).join(''),
      ),
    ),
    el(
      'p',
      { class: 'filter-field' },
      el('label', { for: 'f-status' }, 'Status'),
      el(
        'select',
        { id: 'f-status', name: 'status' },
        el('option', { value: '' }, 'any'),
        statuses.map((s) => el('option', { value: s }, escapeHtml(s))).join(''),
      ),
    ),
    el(
      'p',
      { class: 'filter-field' },
      el('label', { for: 'f-maxprice' }, 'Input price at most ($/Mtok)'),
      el('input', { type: 'number', id: 'f-maxprice', name: 'maxprice', min: '0', step: '0.01', inputmode: 'decimal' }),
    ),
    el(
      'p',
      { class: 'filter-actions' },
      el('button', { type: 'reset', class: 'btn' }, 'Clear'),
      el('span', { class: 'filter-count', id: 'catalog-count', role: 'status', 'aria-live': 'polite' }, ''),
    ),
  );
}

/** Deprecations and retirements — the record the vendor deletes. */
export function renderDeprecationsTable(rows) {
  if (rows.length === 0) {
    return notice(
      'No model in the current snapshot carries a deprecated, retired or dead status. ' +
        'When one does, it stays on this page permanently.',
      'info',
      { name: 'empty-deprecations' },
    );
  }
  return renderCatalogTable(rows, {
    id: 'deprecations-table',
    caption: 'Models the sources report as deprecated, retired or dead',
  });
}

/** What changed in the last 30 days, from the Pulse's diff history. */
export function renderChangedTable(lines) {
  if (lines.length === 0) {
    return notice('Nothing changed in the sources in the last 30 days.', 'info', {
      name: 'empty-changed',
    });
  }
  return el(
    'div',
    { class: 'table-wrap' },
    el(
      'table',
      { class: 'data-table', id: 'changed-table' },
      el('caption', {}, 'Price moves, status changes, releases and retirements in the last 30 days'),
      el(
        'thead',
        {},
        el(
          'tr',
          {},
          el('th', { scope: 'col' }, 'Date'),
          el('th', { scope: 'col' }, 'What'),
          el('th', { scope: 'col' }, 'Change'),
          el('th', { scope: 'col' }, 'Source'),
        ),
      ),
      el(
        'tbody',
        {},
        lines
          .map((l) =>
            el(
              'tr',
              { 'data-kind': l.kind },
              el('th', { scope: 'row' }, el('time', { datetime: l.date ?? '' }, escapeHtml(l.date ?? ''))),
              el('td', {}, l.entry ? link(l.entry.url, l.title) : escapeHtml(l.title)),
              el('td', {}, escapeHtml(l.detail)),
              el('td', {}, l.source_url ? extLink(l.source_url, l.source ?? 'source', { class: 'src' }) : ''),
            ),
          )
          .join(''),
      ),
    ),
  );
}

export { SORT_CRITERIA, sortNote };
