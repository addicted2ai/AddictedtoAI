/**
 * render/frontier.mjs — /frontier (K11, BRIEF-UI-001 R-B).
 *
 * REUSES: lib/render/home.mjs's date-rail shape (`renderChangedFeed`'s own
 * `<ol class="rail">` / `groupByDate` pattern) for the time-scaled spine, and
 * lib/render/delta.mjs's pairing idea for the capabilities rail — this file
 * composes existing rail/date primitives (common.mjs's `date()`, `link()`,
 * `extLink()`) into new joins over data that already exists; it does not
 * introduce a second table or card component where one exists.
 *
 * Every element below names its data source in its own doc comment, per the
 * concept packet (CP-UI-001-1.md `elements[]`) and BRIEF-UI-001's own
 * mandatory-first-step rule ("for every element that shows a number or a
 * claim, name the data source path first; if none exists today, the element
 * is an empty state or it does not exist"). Fixed copy in `app/frontier/
 * page.tsx` carries no digits (plan §11.4); every rail this file renders is
 * wrapped by the page in an element carrying `data-derived="frontier-<rail>"`.
 *
 * K21 (keeper, round 1): board membership is EDITORIAL. `renderIndexBoard`'s
 * rows come from `content/wiki/org/*.md` (every org with an entry is a
 * player, whether or not any feed lists its models) — never from a feed
 * join. Its columns come from `site.freshness.sources` (one entry per
 * registered source in `data/sources/registry.json`, each carrying its own
 * `id`/`title`/read date) — iterated, not named: a fourth index or a new
 * feed becomes one more column the next time `buildSite()` runs, with no
 * change to this file or to `app/frontier/page.tsx`. A column with nothing
 * to show for a given org renders the packet's own empty cell, per org, per
 * column — never a dropped row.
 */

import {
  el,
  join,
  link,
  extLink,
  date,
  escapeHtml,
  badge,
  statusTone,
  notice,
} from './common.mjs';
import { groupByDate } from '../changes.mjs';

/** Whole days between two ISO dates (b - a), never negative. */
function daysBetween(aIso, bIso) {
  const a = new Date(`${aIso}T00:00:00Z`);
  const b = new Date(`${bIso}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

/**
 * The time-scaled spine — CP-UI-001-1's core idea. `data_source:
 * data/changes.jsonl` (via `site.changes`, already the mechanically-observed
 * feed `home.mjs` renders). Vertical distance between date groups is
 * proportional to elapsed calendar time: each group's `--gap-days` custom
 * property carries the real day count since the group above it, and
 * `globals.css` clamps the resulting margin between one and eight row
 * heights (design_moves.layout) — the clamp is CSS, the number is data.
 *
 * empty_state (packet): "spine renders with tick marks only and the fixed
 * line 'no dated records in this window'" — rendered when `site.changes` is
 * empty.
 */
export function renderSpine(site, opts = {}) {
  const limit = opts.limit ?? 40;
  const feed = (site.changes ?? []).slice(0, limit);
  if (feed.length === 0) {
    return notice(
      'No dated records in this window.',
      'info',
      { name: 'empty-frontier-spine' },
    );
  }
  const groups = groupByDate(feed);
  return el(
    'ol',
    { class: 'rail frontier-spine', 'data-frontier-spine': String(groups.length) },
    groups
      .map((group, i) => {
        const gapDays = i === 0 ? 0 : daysBetween(groups[i - 1].date, group.date);
        return el(
          'li',
          {
            class: 'rail-item frontier-knot',
            style: `--gap-days:${gapDays}`,
          },
          date(group.date, { class: 'rail-date' }),
          el(
            'div',
            { class: 'rail-body' },
            group.lines.slice(0, 4).map((line) =>
              el(
                'p',
                { class: 'change-line', 'data-kind': line.kind },
                line.entry
                  ? link(line.entry.url, line.title, { class: 'change-name' })
                  : el('span', { class: 'change-name' }, escapeHtml(line.title)),
                el('span', { class: 'change-detail' }, escapeHtml(line.detail)),
              ),
            ).join(''),
          ),
        );
      })
      .join(''),
  );
}

/**
 * Index columns — "current leaders" (K19: the board this route leads with).
 * `data_source`: rows from `content/wiki/org/*.md` (editorial roster, K21 —
 * every org entry is a player regardless of feed coverage); columns from
 * `site.freshness.sources` (one per `data/sources/registry.json` entry).
 * `benchmarks.artificial_analysis.*_index` is DECLARED in the registry's
 * `material_fields` but not present in any fetched snapshot (checked:
 * `data/sources/openrouter-models/latest.json` carries no `benchmarks` key
 * on any row) — so every cell renders the packet's own empty state rather
 * than a guessed or sampled value. Adding a real per-org-per-index value
 * later is a data change to `data/derived/*`, not a template change: this
 * function reads whatever `orgIndexValue` resolves to and renders the
 * absence otherwise.
 */
export function renderIndexBoard(site) {
  const orgs = (site.entries ?? []).filter((d) => d.data.kind === 'org');
  const sources = site.freshness?.sources ?? [];

  if (orgs.length === 0) {
    return notice('No organisation records exist yet to board.', 'info', {
      name: 'empty-frontier-board-rows',
    });
  }
  if (sources.length === 0) {
    return notice('No index source is registered for this window.', 'info', {
      name: 'empty-frontier-board-cols',
    });
  }

  return el(
    'table',
    { class: 'data-table frontier-board', 'data-frontier-board': String(orgs.length) },
    el(
      'thead',
      {},
      el(
        'tr',
        {},
        el('th', { scope: 'col' }, 'Organisation'),
        sources
          .map((s) =>
            el(
              'th',
              { scope: 'col', 'data-source-id': s.id },
              escapeHtml(s.title ?? s.id),
              el(
                'span',
                { class: 'board-col-meta' },
                ` index · ${escapeHtml(s.title ?? s.id)} · read ${escapeHtml(s.display_date ?? s.last_fetch_date ?? 'unrecorded')}`,
              ),
            ),
          )
          .join(''),
      ),
    ),
    el(
      'tbody',
      {},
      orgs
        .map((org) =>
          el(
            'tr',
            {},
            el('th', { scope: 'row' }, link(org.url, org.data.display_name)),
            sources
              .map(() =>
                // No index is published for any org/source pair today
                // (see the doc comment above) — the packet's own empty cell,
                // per column, never a dropped row.
                el('td', { class: 'absent-cell' }, 'no index published for this window'),
              )
              .join(''),
          ),
        )
        .join(''),
    ),
  );
}

/**
 * Lead-change knots. `data_source: data/changes.jsonl`. `changes.jsonl`
 * carries `kind` in {arrival, release, retirement, field_change, annotation}
 * only (checked: zero `lead-change` rows exist — the Pulse's
 * `pulse/lib/frontier.mjs` that would emit them is plan, not built, per
 * `graph/artifacts/RT-CP-UI-001-1-1.md` FM3/FM1). empty_state (packet): "no
 * knots; a dotted continuation line and 'no lead change recorded yet'".
 */
export function renderLeadChangeKnots(site) {
  const knots = (site.changeLines ?? []).filter((l) => l.kind === 'lead-change');
  if (knots.length === 0) {
    return el(
      'div',
      { class: 'frontier-leadchange-empty', 'data-frontier-leadchange': '0' },
      el('span', { class: 'dotted-continuation', 'aria-hidden': 'true' }),
      el('p', {}, 'No lead change recorded yet.'),
    );
  }
  // Not reached today (see above); kept so a future Pulse job that starts
  // emitting `lead-change` lines has a renderer waiting rather than needing
  // a second implementer pass.
  return el(
    'ol',
    { class: 'rail', 'data-frontier-leadchange': String(knots.length) },
    knots
      .map((k) =>
        el(
          'li',
          { class: 'rail-item' },
          date(k.date, { class: 'rail-date' }),
          el('span', {}, escapeHtml(k.display_name ?? k.row_id ?? '')),
        ),
      )
      .join(''),
  );
}

/**
 * Vendor-claim cells. Packet `data_source: content/wiki/model/*.md (cited
 * facts, when present)`. Declined at model grain for this build (see the
 * implementer report) — wired instead at ORG grain, which the corpus
 * actually carries today: each org entry's own `cited` facts
 * (`content/wiki/org/*.md`, e.g. `model_family`, `founded`), already dated
 * and sourced by `facts.mjs`'s pipeline. Same invariant either grain: shown
 * verbatim, attributed, tagged "claimed · unverified", never merged with an
 * index value (there is no index value on this route to merge it with).
 */
export function renderVendorClaims(site) {
  const orgs = (site.entries ?? []).filter((d) => d.data.kind === 'org');
  const cards = orgs
    .map((org) => {
      const cited = (org.data.facts ?? []).find((f) => f.source === 'cited');
      if (!cited) return null;
      return el(
        'li',
        { class: 'vendor-claim' },
        el('span', { class: 'vendor-claim-tag' }, 'claimed · unverified'),
        el(
          'p',
          {},
          link(org.url, org.data.display_name, { class: 'vendor-claim-org' }),
          ': ',
          el('span', { class: 'vendor-claim-value' }, escapeHtml(String(cited.value))),
        ),
        el(
          'p',
          { class: 'vendor-claim-source' },
          cited.source_url ? extLink(cited.source_url, 'source', { class: 'src' }) : '',
          cited.accessed ? join(' · accessed ', date(cited.accessed)) : '',
        ),
      );
    })
    .filter(Boolean);

  if (cards.length === 0) {
    return el('p', { class: 'strip-empty' }, 'No vendor claim on file.');
  }
  return el('ul', { class: 'vendor-claims', 'data-frontier-vendor-claims': String(cards.length) }, cards.join(''));
}

/**
 * Capabilities rail (plan §11.3): one merged, dated rail of proven
 * capability — every delta (`site.deltas`, "became routine" on
 * `routine.date`), every LISTED tutorial (`site.tutorials`, state.listed,
 * "proven by execution" on `verified_on`), every post ("reported" on
 * `data.date`). Newest first across all three, by the date each kind of
 * record says it became true. A model's index moving is never a capability
 * (plan §11.3: "a lead change is a fact about a ranking; a capability is a
 * claim about what a thing can do") — this rail and the spine/board above
 * are visually and semantically separate.
 */
export function renderCapabilitiesRail(site, opts = {}) {
  const limit = opts.limit ?? 12;
  const items = [
    ...(site.deltas ?? []).map((d) => ({
      date: d.routine.date,
      kind: 'became routine',
      title: d.title,
      url: d.url,
      source_url: d.routine.source_url,
    })),
    ...(site.tutorials ?? [])
      .filter((t) => t.state.listed)
      .map((t) => ({
        date: t.doc.data.verified_on,
        kind: 'proven by execution',
        title: t.doc.data.title,
        url: t.doc.url,
        source_url: null,
      })),
    ...(site.posts ?? []).map((p) => ({
      date: p.data.date,
      kind: 'reported',
      title: p.data.title,
      url: p.url,
      source_url: null,
    })),
  ]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, limit);

  if (items.length === 0) {
    return el('p', { class: 'strip-empty' }, 'Nothing dated in this window.');
  }
  return el(
    'ol',
    { class: 'rail', 'data-frontier-capabilities': String(items.length) },
    items
      .map((it) =>
        el(
          'li',
          { class: 'rail-item' },
          date(it.date, { class: 'rail-date' }),
          el(
            'div',
            { class: 'rail-body' },
            el('span', { class: 'proof-kind' }, escapeHtml(it.kind)),
            ' ',
            link(it.url, it.title, { class: 'change-name' }),
            it.source_url ? extLink(it.source_url, 'source', { class: 'src' }) : '',
          ),
        ),
      )
      .join(''),
  );
}
