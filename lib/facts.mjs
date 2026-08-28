/**
 * facts.mjs — fact rendering (task 2.3).
 *
 * The rule this file exists to make impossible to break, from specs/wiki:
 * *"A fact MUST never render without its source being reachable from the
 * rendered page."* Every branch below emits a source element; there is no
 * path that emits a bare value.
 *
 * Four states a fact can be in, and the visible difference between them:
 *
 *   cited, in date   value — source link, accessed <date>
 *   cited, overdue   value — source link, accessed <date>, plus an overdue
 *                    marker injected by the build (never authored by hand)
 *   feed, live       value — source link, fetched <date>
 *   feed, vanished   last-known value, "as of <date>" — explicitly NOT
 *                    current, because the declared row is gone from the
 *                    latest snapshot (specs/wiki: "It never renders as
 *                    current.")
 *
 * Plus two absences that must not masquerade as values: a feed row present
 * but missing the field, and no data layer at all (before the first Pulse
 * run). Both render as absent — `specs/directory`: "never guessed, never
 * filled by a model."
 *
 * Values are rendered verbatim. No unit is appended, no currency symbol is
 * added, no number is reformatted: formatting a raw feed value is a claim
 * about what it means, and this layer does not make claims.
 */

import { VOLATILITY_DAYS } from './schema.mjs';
import { valueAtPath } from './data-layer.mjs';

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only http(s) survives; anything else becomes `#`, so no `javascript:` href. */
export function safeUrl(url) {
  return /^https?:\/\//i.test(String(url ?? '')) ? escapeHtml(url) : '#';
}

export function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function daysBetween(fromIso, toIso) {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

/**
 * Is a cited fact past its volatility interval?
 * `static` and `dated` are never re-checked, so they are never overdue.
 */
export function isOverdue(fact, today) {
  if (fact.source !== 'cited') return false;
  const interval = VOLATILITY_DAYS[fact.volatility];
  if (interval == null) return false;
  const age = daysBetween(fact.accessed, today);
  return age != null && age > interval;
}

const ABSENT = '<span class="fact-absent">not published</span>';

/**
 * Resolve a fact to its display state without rendering.
 * @returns {{state: 'cited'|'feed'|'vanished'|'absent'|'no-data', value?: any,
 *            asOf?: string, overdue?: boolean, suspect?: object|null}}
 */
export function resolveFact(fact, ctx) {
  const today = ctx.today ?? todayIso();
  if (fact.source === 'cited') {
    return { state: 'cited', value: fact.value, overdue: isOverdue(fact, today) };
  }

  const layer = ctx.dataLayer;
  const rowId = ctx.feeds?.[fact.feed];
  if (!rowId) {
    return { state: 'no-data', reason: `entry declares no feeds binding for source "${fact.feed}"` };
  }

  const row = layer.row(fact.feed, rowId);
  if (!row) {
    return layer.present
      ? { state: 'no-data', reason: `row "${rowId}" is not joined in data/derived/feed-rows.json` }
      : { state: 'no-data', reason: 'no data layer yet — the Pulse has not run' };
  }

  const value = valueAtPath(row, fact.path);
  const missing = value === undefined || value === null || value === '';

  // A declared row the latest snapshot no longer contains renders its
  // last-known value with a visible as-of date, and never as current.
  if (row.$vanished) {
    return { state: 'vanished', value: missing ? null : value, asOf: row.$as_of ?? null };
  }

  const suspect = layer.source(fact.feed)?.suspect ? layer.source(fact.feed) : null;
  if (missing) return { state: 'absent', suspect };
  return { state: 'feed', value, suspect };
}

/**
 * The source element for a feed fact. The date and its label come from the
 * Pulse's freshness computation (`display_date` / `display_date_label`), not
 * from a rule restated here: a suspect source already reads "last changed"
 * there, and two places deciding that independently is how a page and its
 * queue item come to disagree.
 */
function sourceLinkForFeed(fact, ctx, override) {
  const src = ctx.dataLayer.source(fact.feed) ?? {};
  const name = escapeHtml(fact.feed);
  const link = src.url
    ? `<a href="${safeUrl(src.url)}" rel="nofollow noopener">${name}</a>`
    : name;
  const label = override?.label ?? src.display_date_label ?? 'fetched';
  const date = override?.date ?? src.display_date ?? src.last_fetch_date ?? null;
  const dated = date ? `, ${escapeHtml(label)} ${escapeHtml(date)}` : '';
  return `<span class="fact-source">${link}${dated}</span>`;
}

/**
 * Render one fact as HTML.
 *
 * @param {object} fact  a validated fact from entry front matter
 * @param {object} ctx   { dataLayer, feeds, today, entryId }
 * @param {object} [opts] { inline } — inline form is what transclusion emits
 */
export function renderFact(fact, ctx, opts = {}) {
  const today = ctx.today ?? todayIso();
  const r = resolveFact(fact, { ...ctx, today });
  const cls = ['fact'];
  if (opts.inline) cls.push('fact-inline');

  const attrs =
    ` data-field="${escapeHtml(fact.field)}"` +
    ` data-source="${escapeHtml(fact.source)}"` +
    ` data-state="${escapeHtml(r.state)}"` +
    (ctx.entryId ? ` data-entry="${escapeHtml(ctx.entryId)}"` : '') +
    ' data-nolink=""';

  let inner;
  switch (r.state) {
    case 'cited': {
      const overdue = r.overdue
        ? `<span class="fact-overdue" role="note">overdue — last verified ${escapeHtml(fact.accessed)}</span>`
        : '';
      inner =
        `<span class="fact-value">${escapeHtml(r.value)}</span>` +
        `<span class="fact-source"><a href="${safeUrl(fact.source_url)}" rel="nofollow noopener">source</a>` +
        `, accessed ${escapeHtml(fact.accessed)}</span>` +
        overdue;
      break;
    }
    case 'feed': {
      // A suspect source has reported no change for 3x its expected interval,
      // so a recent "last checked" date would overstate freshness. The Pulse
      // has already switched the label to "last changed" (specs/pulse); the
      // build renders what it decided and adds the visible flag.
      inner =
        `<span class="fact-value">${escapeHtml(r.value)}</span>` +
        sourceLinkForFeed(fact, ctx) +
        (r.suspect ? '<span class="fact-suspect" role="note">source may be stale</span>' : '');
      break;
    }
    case 'vanished': {
      const value = r.value == null ? ABSENT : `<span class="fact-value">${escapeHtml(r.value)}</span>`;
      inner =
        value +
        `<span class="fact-as-of" role="note">last known value, as of ${escapeHtml(r.asOf ?? 'an unrecorded date')} — the source no longer lists this row</span>` +
        sourceLinkForFeed(fact, ctx);
      break;
    }
    case 'absent':
      inner = ABSENT + sourceLinkForFeed(fact, ctx);
      break;
    default:
      inner =
        `<span class="fact-absent">not yet fetched</span>` +
        sourceLinkForFeed(fact, ctx, { label: 'fetched', date: null });
      break;
  }

  return `<span class="${cls.join(' ')}"${attrs}>${inner}</span>`;
}

/**
 * The dormant stamp's date (specs/wiki: "A record as of <date>"). Derived,
 * never authored: the most recent thing the entry actually records — its
 * latest timeline event or its latest `accessed` date.
 */
export function dormantAsOf(entry) {
  const dates = [
    ...(entry.timeline ?? []).map((t) => t.date),
    ...(entry.facts ?? []).filter((f) => f.source === 'cited').map((f) => f.accessed),
  ].filter(Boolean);
  if (dates.length === 0) return null;
  return dates.sort()[dates.length - 1];
}
