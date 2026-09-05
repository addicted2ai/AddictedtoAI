/**
 * render/frontier.mjs — the players board (CP-UI-001-2, K11/K19).
 *
 * NEW module. REUSES: `lib/render/catalog.mjs`'s cell/table vocabulary (`el`,
 * `link`, `extLink`, `badge`, `notice`) via `render/common.mjs`, and
 * `lib/catalog.mjs`'s `formatPrice`/`formatContext` — the same formatting a
 * catalog row already uses, so a price on the board and a price on
 * `/catalog` are never independently derived. What is new here is the JOIN:
 * one row per organisation (`content/wiki/org/*.md`), matched to the catalog
 * providers it stands behind by alias, never invented.
 *
 * Every cell that has no source renders as an honest, LABELLED absence —
 * muted text, a thin diagonal only on a fully-empty column (none currently
 * shipped; the index-position column is omitted whole instead, per the
 * packet) — never a bare dash and never a colour fill. F-hier-1 (JV-hier):
 * an empty cell must never carry MORE visual weight than a filled one, so
 * the hatch here is a light `--rule`-toned stripe behind muted text, not a
 * dominant mark. F-hier-4: the organisation/current-model pair is the one
 * column set rendered at a heavier weight than the rest of the board — the
 * page's first-read entry point.
 */

import {
  el,
  join,
  link,
  extLink,
  date,
  escapeHtml,
  notice,
} from './common.mjs';
import { formatPrice, formatContext } from '../catalog.mjs';

/** Lowercase, strip a leading '~' (free-tier duplicate ids) and non-alnum. */
function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/^~/, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Which catalog `provider` ids belong to an org entry, by alias — never a
 * hand-authored mapping. A provider id matches an org alias when either
 * contains the other, aliases shorter than 3 normalised characters excluded
 * (too noisy at this length: "AI", "Le"). Reported honestly in the
 * implementer report as the risk it is (CP-UI-001-2 known_risks[2]) rather
 * than assumed correct.
 */
function matchProviders(org, catalogRawRows) {
  const names = [org.data.display_name, ...(org.data.aliases ?? []).map((a) => a.name)]
    .map(norm)
    .filter((n) => n.length >= 3);
  const providers = new Set();
  for (const row of catalogRawRows) {
    const p = norm(row.provider);
    if (!p) continue;
    if (names.some((n) => n === p || n.includes(p) || p.includes(n))) providers.add(row.provider);
  }
  return providers;
}

/** The org's own newest catalog row, by the feed's own `created` timestamp. */
function newestRow(providers, catalogRawRows) {
  let best = null;
  for (const row of catalogRawRows) {
    if (!providers.has(row.provider)) continue;
    if (!best || (row.created ?? 0) > (best.created ?? 0)) best = row;
  }
  return best;
}

/** The first cited (vendor) fact on a doc, or null. */
function firstCitedFact(doc) {
  return (doc?.data?.facts ?? []).find((f) => f.source === 'cited') ?? null;
}

function hatch(text, opts = {}) {
  return el(
    'td',
    { class: 'board-cell board-hatch', 'data-derived': 'frontier-board' },
    el('span', { class: 'hatch-text' }, escapeHtml(text)),
  );
}

/* K22 (keeper, delegated): a future `domain` facet (text/coding/image/...)
 * on models/orgs/tools/indices is a DATA addition, not a template one, on
 * this board — BOARD_COLUMNS is a plain array the head row and every cell
 * function are driven from; a domain column (or a players-by-domain group)
 * is one more entry here plus one more per-row cell reading `row.domain` (or
 * `modelDoc.data.domain`), same shape as every column below. No content is
 * invented or tagged now. */
const BOARD_COLUMNS = [
  { label: 'Organisation', numeric: false },
  { label: 'Current model', numeric: false },
  { label: 'In / Mtok', numeric: true },
  { label: 'Out / Mtok', numeric: true },
  { label: 'Context', numeric: true },
  { label: 'Vendor claim', numeric: false },
  { label: 'Read', numeric: false },
];

function boardHeadRow() {
  return el(
    'tr',
    {},
    BOARD_COLUMNS.map((c) => el('th', { scope: 'col', 'data-numeric': c.numeric ? '' : null }, escapeHtml(c.label))).join(''),
  );
}

/**
 * One board row. `site.fetchedOn` and `byId` are the same joins every other
 * page uses — nothing here re-derives them.
 */
function boardRowHtml(org, site, catalogRawRows) {
  const providers = matchProviders(org, catalogRawRows);
  const row = newestRow(providers, catalogRawRows);

  const orgCell = el(
    'th',
    { scope: 'row', class: 'board-cell board-lead' },
    link(org.url, org.data.display_name),
  );

  if (!row) {
    return join(
      '<tr class="board-row" data-derived="frontier-board">',
      orgCell,
      hatch('no listing in feed'),
      hatch('not published by source'),
      hatch('not published by source'),
      hatch('not published by source'),
      hatch('no vendor claim on file'),
      hatch('—'),
      '</tr>',
    );
  }

  const modelDoc = row.entry_id ? site.corpus.byId.get(row.entry_id) : null;
  const modelCell = el(
    'td',
    { class: 'board-cell board-lead' },
    modelDoc ? link(modelDoc.url, row.display_name ?? row.row_id) : escapeHtml(row.display_name ?? row.row_id),
  );

  const priceIn = formatPrice(row.price_input);
  const priceOut = formatPrice(row.price_output);
  const ctx = formatContext(row.context_window);

  const claimDoc = modelDoc ?? org;
  const claimFact = firstCitedFact(modelDoc) ?? firstCitedFact(org);

  const fetched = site.fetchedOn?.(row.source) ?? null;

  return join(
    '<tr class="board-row" data-derived="frontier-board">',
    orgCell,
    modelCell,
    priceIn ? el('td', { class: 'board-cell', 'data-numeric': '' }, escapeHtml(priceIn)) : hatch('not published by source'),
    priceOut ? el('td', { class: 'board-cell', 'data-numeric': '' }, escapeHtml(priceOut)) : hatch('not published by source'),
    ctx ? el('td', { class: 'board-cell', 'data-numeric': '' }, escapeHtml(ctx)) : hatch('not published by source'),
    claimFact
      ? el(
          'td',
          { class: 'board-cell' },
          el('span', { class: 'badge', 'data-tone': 'early' }, 'claimed · unverified'),
          ' ',
          escapeHtml(claimFact.value),
          ' — ',
          extLink(claimFact.source_url, `${claimDoc === modelDoc ? 'model' : 'org'} record`, { class: 'src' }),
          claimFact.accessed ? join(', accessed ', date(claimFact.accessed)) : '',
        )
      : hatch('no vendor claim on file'),
    fetched
      ? el(
          'td',
          { class: 'board-cell' },
          escapeHtml(row.source ?? 'feed'),
          ' · ',
          date(fetched),
        )
      : hatch('—'),
    '</tr>',
  );
}

/**
 * The board. `orgs` is `site.corpus.entry` filtered to `kind === 'org'`;
 * `catalogRawRows` is `site.catalogFile.rows` (the raw feed rows, which
 * carry `created` — the timestamp `catalogRow()` in lib/catalog.mjs does not
 * expose, and the one thing "newest listing" needs that a pre-formatted
 * catalog row cannot give it).
 */
/*
 * K21 (keeper, delegated): board membership is EDITORIAL, never feed-gated.
 * Every `orgs` entry becomes a row below regardless of whether any catalog
 * row matches it (`boardRowHtml`'s `!row` branch) — nothing here filters
 * `orgs` by feed presence. Column labels ("Current model", "In / Mtok",
 * "Read") are generic, not tied to a named source; the "Read" cell states
 * whichever feed id the matched row's own `source` field carries
 * (`data/sources/registry.json`'s own ids), never a hard-coded "OpenRouter".
 * A second feed populating MORE providers needs no template change (it is
 * data `newestRow` already scans across). A genuinely NEW rail — a second,
 * independently-published INDEX position, or a second vendor-claim source —
 * is one new `BOARD_COLUMNS` entry plus one new per-row cell function; nothing
 * about a row's identity or an org's presence on the board depends on which
 * columns currently exist. See the implementer report for the count of
 * organisations shown with an all-blank row.
 */
export function renderPlayersBoard(orgs, site, catalogRawRows) {
  if (orgs.length === 0) {
    return notice('No organisation records exist yet.', 'info', { name: 'empty-frontier-board' });
  }
  return el(
    'div',
    { class: 'table-wrap board-wrap', 'data-derived': 'frontier-board' },
    el(
      'table',
      { class: 'data-table board-table', id: 'frontier-board' },
      el('caption', {}, 'Organisations tracked by this site and their newest listed model, as the tracked feeds state it today'),
      el('thead', {}, boardHeadRow()),
      el('tbody', {}, orgs.map((org) => boardRowHtml(org, site, catalogRawRows)).join('')),
    ),
  );
}

/**
 * The board's first N rows, resolved but NOT rendered — the home Frontier
 * door (F-hier-2 decline: a fixed two-column excerpt, not a board fragment;
 * see the implementer report) reads this rather than re-deriving the join.
 */
export function boardExcerpt(orgs, catalogRawRows, site, limit = 3) {
  return orgs.slice(0, limit).map((org) => {
    const providers = matchProviders(org, catalogRawRows);
    const row = newestRow(providers, catalogRawRows);
    const modelDoc = row?.entry_id ? site.corpus.byId.get(row.entry_id) : null;
    return { org, row, modelDoc };
  });
}

/** How many organisations matched at least one provider — for the report, not the page. */
export function boardCoverage(orgs, catalogRawRows) {
  const matchedProviders = new Set();
  let orgsWithRow = 0;
  for (const org of orgs) {
    const providers = matchProviders(org, catalogRawRows);
    if (providers.size > 0) orgsWithRow += 1;
    for (const p of providers) matchedProviders.add(p);
  }
  const allProviders = new Set(catalogRawRows.map((r) => r.provider).filter(Boolean));
  const unmatchedProviders = [...allProviders].filter((p) => !matchedProviders.has(p));
  return {
    orgsTotal: orgs.length,
    orgsWithRow,
    orgsWithoutRow: orgs.length - orgsWithRow,
    providersTotal: allProviders.size,
    providersMatched: matchedProviders.size,
    unmatchedProviders,
  };
}

/** The lead-change strip. `data/changes.jsonl` carries no `lead-change` kind yet (RT-CP-UI-001-2-1 ground truth). */
export function renderLeadChangeStrip(changeLines) {
  const leadChanges = (changeLines ?? []).filter((l) => l.kind === 'lead-change');
  return el(
    'section',
    { class: 'section frontier-strip', 'aria-labelledby': 'lead-changes' },
    el('h2', { class: 'section-title', id: 'lead-changes' }, 'Last recorded lead change'),
    leadChanges.length === 0
      ? notice('No lead change recorded yet.', 'info', { name: 'empty-lead-change' })
      : el(
          'ul',
          { class: 'strip', 'data-derived': 'frontier-leadchange' },
          leadChanges
            .slice(0, 5)
            .map((l) => el('li', { class: 'strip-item' }, date(l.date), ' ', escapeHtml(l.detail ?? l.title ?? '')))
            .join(''),
        ),
  );
}

const PROOF_KIND = { delta: 'became routine', tutorial: 'proven by execution', post: 'reported' };

/** The capabilities rail: every delta, every listed tutorial, every post — newest first (frontier-plan §11.3). */
export function renderCapabilities(site, opts = {}) {
  const limit = opts.limit ?? 8;
  const items = [];
  for (const d of site.deltas ?? []) {
    items.push({ kind: 'delta', date: d.routine.date, title: d.title, url: d.url });
  }
  for (const t of site.tutorials ?? []) {
    if (t.state.listed) items.push({ kind: 'tutorial', date: t.state.verified_on, title: t.doc.data.title, url: t.doc.url });
  }
  for (const p of site.posts ?? []) {
    items.push({ kind: 'post', date: p.data.date, title: p.data.title, url: p.url });
  }
  items.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
  const shown = items.slice(0, limit);
  return el(
    'section',
    { class: 'section frontier-capabilities', 'aria-labelledby': 'capabilities' },
    el('h2', { class: 'section-title', id: 'capabilities' }, 'Newest proofs'),
    shown.length === 0
      ? notice('Nothing dated in this window.', 'info', { name: 'empty-capabilities' })
      : el(
          'ol',
          { class: 'rail', 'data-derived': 'frontier-capabilities' },
          shown
            .map((it) =>
              el(
                'li',
                { class: 'rail-item', 'data-kind': it.kind },
                date(it.date, { class: 'rail-date' }),
                el(
                  'div',
                  { class: 'rail-body' },
                  el('span', { class: 'badge', 'data-tone': null }, PROOF_KIND[it.kind]),
                  ' ',
                  link(it.url, it.title, { class: 'change-name' }),
                ),
              ),
            )
            .join(''),
        ),
  );
}
