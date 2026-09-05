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

/**
 * RD-002 fix 1 (F-sys-2-7 + F-sys-2-3 + RT FM1/FM2; BRIEF R-B).
 *
 * The VENDOR CLAIM column previously took `firstCitedFact(modelDoc) ??
 * firstCitedFact(org)` — the first cited fact of ANY kind, on the model or,
 * failing that, on the ORGANISATION. Live that rendered NVIDIA's company
 * founding date ("5 April 1993, by Jensen Huang…") under "claimed ·
 * unverified" in a MODEL's own row: a fact about a company, stamped as a
 * claim about a model. The org fallback is GONE — no org document is read
 * for this column at all, so no founding date, founder or company fact can
 * reach /frontier by any path.
 *
 * What remains is TYPED at the source rather than positional: a cited fact
 * ON THE MODEL ENTRY whose `field` names a performance or capability claim.
 * `release_date`, `license`, `parameters`, `listed_date`, `api_sunset`,
 * `knowledge_cutoff`, price and provenance fields are record metadata, not
 * claims a vendor makes about what its model DOES, and are excluded. What is
 * left over renders as the labelled blank — which is the page's point
 * (F-sys-2-3: the hatch was correct in CSS and unreachable in data).
 */
const CLAIM_FIELD = /(score|bench|eval|index|throughput|latency|speed|performance|capabilit|claim|role|description|verified|accuracy|swe|agent)/;

/** The model's own cited performance/capability claim, or null. Never reads an org. */
function vendorClaimFact(modelDoc) {
  return (
    (modelDoc?.data?.facts ?? []).find(
      (f) => f.source === 'cited' && CLAIM_FIELD.test(String(f.field ?? '')),
    ) ?? null
  );
}

function hatch(text, opts = {}) {
  return el(
    'td',
    {
      class: `board-cell board-hatch${opts.class ? ` ${opts.class}` : ''}`,
      'data-derived': 'frontier-board',
    },
    el('span', { class: 'hatch-text' }, escapeHtml(text)),
  );
}

/* RD-002 fix 2 (F-hier-5 + F-struct-4 + F-hier-6 + F-struct-5 + F-sys-2-1b;
 * RULES R8's badge clause, R13). The two strings the VENDOR CLAIM cell has
 * always used, now named once: whichever of them more than 90% of the
 * board's rows would repeat is printed ONCE above the board as unboxed
 * `--muted` text (`renderPlayersBoard` below), and the per-row bordered chip
 * is gone from the table entirely — R8 boxes a badge only where its tone
 * differs from the collection default, and a mark on 16 of 16 rows IS the
 * default. No copy is authored here: both strings are the ones the cell
 * already rendered (CHARTER slot 1). */
const CLAIM_PRESENT = 'claimed · unverified';
const CLAIM_ABSENT = 'no vendor claim on file';

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
function resolveBoardRow(org, site, catalogRawRows) {
  const providers = matchProviders(org, catalogRawRows);
  const row = newestRow(providers, catalogRawRows);
  const modelDoc = row?.entry_id ? site.corpus.byId.get(row.entry_id) : null;
  return { org, row, modelDoc, claimFact: vendorClaimFact(modelDoc) };
}

function boardRowHtml({ org, row, modelDoc, claimFact }, site, opts = {}) {
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
      hatch(CLAIM_ABSENT, { class: 'board-claim' }),
      hatch('—', { class: 'board-read' }),
      '</tr>',
    );
  }

  const modelCell = el(
    'td',
    { class: 'board-cell board-lead' },
    modelDoc ? link(modelDoc.url, row.display_name ?? row.row_id) : escapeHtml(row.display_name ?? row.row_id),
  );

  const priceIn = formatPrice(row.price_input);
  const priceOut = formatPrice(row.price_output);
  const ctx = formatContext(row.context_window);

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
          { class: 'board-cell board-claim' },
          // RD-002 fix 2: no chip. One ellipsised line (see .board-claim in
          // globals.css) carrying the claim VERBATIM, its source and the date
          // it was accessed — the whole cell is the claim's provenance, and
          // the state the rest of the column repeats is stated once above the
          // board instead of sixteen times inside it.
          el(
            'span',
            { class: 'claim-line', title: String(claimFact.value ?? '') },
            escapeHtml(claimFact.value),
            ' — ',
            extLink(claimFact.source_url, 'model record', { class: 'src' }),
            claimFact.accessed ? join(', accessed ', date(claimFact.accessed)) : '',
          ),
        )
      : hatch(CLAIM_ABSENT, { class: 'board-claim' }),
    fetched
      ? el(
          'td',
          {
            class: 'board-cell board-read',
            // RD-002 fix 2 / RULES R8 (S17's 90% clause). Every row on the
            // board is read from the same feed on the same day, so READ was
            // one value repeated on 16 of 16 rows at the full ink weight of
            // the price and context columns a reader actually compares
            // across. `/catalog` solved this exact shape already
            // (`catalogRowHtml`'s `defaultFetched`): state the collection
            // constant ONCE above the table — `renderFetchLine`, reused
            // verbatim on this route — and render the unexceptional row at
            // --muted, keeping full weight for a row whose provenance
            // genuinely differs. Same mechanism, same rule, no second
            // implementation of it.
            'data-default': `${row.source ?? 'feed'}|${fetched}` === opts.defaultRead ? '' : null,
          },
          escapeHtml(row.source ?? 'feed'),
          ' · ',
          date(fetched),
        )
      : hatch('—', { class: 'board-read' }),
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
  const resolved = orgs.map((org) => resolveBoardRow(org, site, catalogRawRows));

  /* RD-002 fix 2 / RULES R8 (S17's 90% clause, now scoped to /frontier).
   * The vendor-claim state the MAJORITY of rows carry is stated once, here,
   * as unboxed --muted text; the per-row chip is gone. Which string that is
   * is computed from the rendered rows, not assumed — if the balance ever
   * tips the other way the line follows it, and if no state clears 90% no
   * line is printed at all and every row states its own. */
  const withClaim = resolved.filter((r) => r.claimFact).length;
  const share = withClaim / resolved.length;
  const dominant = share > 0.9 ? CLAIM_PRESENT : (1 - share) > 0.9 ? CLAIM_ABSENT : null;

  /* The same clause, applied to READ: the provenance value more than 90% of
   * rows repeat is the collection's default, stated once above the board by
   * `renderFetchLine` (app/frontier/page.tsx) exactly as /catalog states it
   * above its own table, and rendered at --muted per row here. Computed, not
   * assumed: a row read from a second feed, or on a different day, keeps its
   * full weight because it is then the value worth a reader's attention. */
  const readCounts = new Map();
  for (const r of resolved) {
    const fetched = r.row ? site.fetchedOn?.(r.row.source) ?? null : null;
    if (!fetched) continue;
    const key = `${r.row.source ?? 'feed'}|${fetched}`;
    readCounts.set(key, (readCounts.get(key) ?? 0) + 1);
  }
  let defaultRead = null;
  for (const [key, n] of readCounts) if (n / resolved.length > 0.9) defaultRead = key;

  return join(
    dominant ? el('p', { class: 'board-note', 'data-derived': 'frontier-board' }, escapeHtml(dominant)) : '',
    el(
      'div',
      { class: 'table-wrap board-wrap', 'data-derived': 'frontier-board' },
      el(
        'table',
        { class: 'data-table board-table', id: 'frontier-board' },
        el('caption', {}, 'Organisations tracked by this site and their newest listed model, as the tracked feeds state it today'),
        el('thead', {}, boardHeadRow()),
        el('tbody', {}, resolved.map((r) => boardRowHtml(r, site, { defaultRead })).join('')),
      ),
    ),
  );
}

/**
 * The board's first N rows, resolved but NOT rendered — the home Frontier
 * door (F-hier-2 decline: a fixed two-column excerpt, not a board fragment;
 * see the implementer report) reads this rather than re-deriving the join.
 */
/**
 * RD-002 fix 3 (F-hier-10 + F-sys-2-4 + RT FM3; K26). Newest dated change per
 * ENTRY id, from the same resolved changed feed the home page's own lead
 * renders (`site.changes`) — not re-derived, and not a second read of
 * `changes.jsonl`.
 */
function changeRecencyByEntryId(site) {
  const byId = new Map();
  for (const line of site.changes ?? []) {
    // `changedFeed()` resolves each line to a lightweight `{ id, url, name }`
    // reference, not to the whole entry doc — `id` here is the declared entry
    // id (`model/…`, `org/…`), the same key `site.corpus.byId` and a catalog
    // row's own `entry_id` use.
    const id = line.entry?.id;
    if (!id) continue;
    const d = String(line.date ?? '');
    if (!byId.has(id) || d > byId.get(id)) byId.set(id, d);
  }
  return byId;
}

/** The newest dated change touching an org's own entry or any model it stands behind. */
function orgRecency(org, providers, catalogRawRows, recencyById) {
  let newest = recencyById.get(org.data.id) ?? '';
  for (const row of catalogRawRows) {
    if (!providers.has(row.provider) || !row.entry_id) continue;
    const d = recencyById.get(row.entry_id);
    if (d && d > newest) newest = d;
  }
  return newest;
}

/**
 * The board's N rows for the home Frontier door (F-hier-2 decline: a fixed
 * two-column excerpt, not a board fragment), resolved but NOT rendered.
 *
 * RD-002 fix 3 / K26 (keeper, CONFIRMED): ordered by MOST RECENT CHANGE, not
 * by `display_name`. RT FM3 measured the defect this replaces: the door read
 * `orgs.slice(0, 3)` off a list sorted `display_name.localeCompare`, so it
 * showed Alibaba Cloud / Anthropic / Cohere today and would show the same
 * three every day the org list was unchanged, whatever the tracked feeds
 * actually moved on. Orgs with no dated change at all sort last, in their
 * existing A–Z order (`Array.prototype.sort` is stable) — an absence of
 * recency is not a claim of recency.
 */
export function boardExcerpt(orgs, catalogRawRows, site, limit = 3) {
  const recencyById = changeRecencyByEntryId(site);
  const ranked = orgs
    .map((org) => {
      const providers = matchProviders(org, catalogRawRows);
      return { org, providers, when: orgRecency(org, providers, catalogRawRows, recencyById) };
    })
    .sort((a, b) => (a.when === b.when ? 0 : a.when > b.when ? -1 : 1));

  return ranked.slice(0, limit).map(({ org, providers, when }) => {
    const row = newestRow(providers, catalogRawRows);
    const modelDoc = row?.entry_id ? site.corpus.byId.get(row.entry_id) : null;
    return { org, row, modelDoc, when };
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
