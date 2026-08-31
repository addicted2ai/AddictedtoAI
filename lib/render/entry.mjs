/**
 * render/entry.mjs — the wiki entry page (task 4.1, specs/wiki).
 *
 * Six regions, and the order is the argument the page makes: **what this is**
 * (identity), **what is true about it and who says so** (facts), **what
 * happened to it** (timeline), **what we have to say about it** (prose),
 * **what it references**, **where it appears**. A reader who stops after the
 * first two regions has still had the sourced record, which is the thing the
 * site is for.
 *
 * Everything perishable on this page is injected by the build and never
 * authored: the overdue marker on a stale cited fact, the as-of date on a
 * vanished feed row, and the dormant stamp all come from `renderFact` and
 * `dormantAsOf` in `facts.mjs`. There is no front-matter field an author can
 * set to suppress any of them.
 *
 * A stub — an entry with no prose body — renders every region it has data
 * for and no apology. specs/wiki: stubs "render a page from their data
 * (identity, facts, timeline, backlinks)", carry `noindex`, and stay out of
 * browse listings. The page does not tell the reader it is thin; it shows
 * what it knows.
 */

import { renderReferencedHere, renderAppearsIn } from '../mentions.mjs';
import { dormantAsOf } from '../facts.mjs';
import { el, join, link, extLink, date, badge, statusTone, eyebrow, escapeHtml, notice } from './common.mjs';

const KIND_LABELS = {
  model: 'model',
  org: 'organisation',
  tool: 'tool',
  concept: 'concept',
  technique: 'technique',
  benchmark: 'benchmark',
  dataset: 'dataset',
  hardware: 'hardware',
  paper: 'paper',
  event: 'event',
};

/** Field names are snake_case in the data; readers are not. */
export function fieldLabel(field) {
  return field.replace(/_/g, ' ');
}

/** Identity: name, kind, status, maintenance, aliases. */
export function renderIdentity(doc) {
  const d = doc.data;
  // `doc.currentStatus` (addictedtoai-ij4h): a stub's resolved feed status
  // when one binds, else the authored (reviewed) front-matter value — see
  // `build-content.mjs` where it is computed, and its header for why a stub
  // and a prose entry are answered differently. Falls back to raw front
  // matter for a doc built outside that pipeline (fixtures).
  const status = doc.currentStatus ?? d.status;
  const aliases = d.aliases.filter((a) => a.name !== d.display_name);
  return el(
    'header',
    { class: 'entry-head' },
    eyebrow(`${KIND_LABELS[d.kind] ?? d.kind} · ${d.id}`),
    el('h1', { class: 'entry-name' }, escapeHtml(d.display_name)),
    el(
      'p',
      { class: 'entry-meta' },
      badge(status, statusTone(status)),
      badge(d.maintenance, d.maintenance === 'dormant' ? 'ended' : null),
      (d.themes ?? []).map((t) => badge(t, 'theme')).join(''),
    ),
    aliases.length
      ? el(
          'p',
          { class: 'entry-aliases' },
          el('span', { class: 'label' }, 'Also called '),
          aliases
            .map((a) => el('span', { class: 'alias', 'data-class': a.class }, escapeHtml(a.name)))
            .join('<span class="sep">, </span>'),
        )
      : '',
  );
}

/**
 * Facts. `factsHtml` was rendered in the content build by `renderFact`, which
 * guarantees each one carries its source — so this function only lays them
 * out and must never construct a fact fragment of its own.
 */
export function renderFacts(doc) {
  const facts = doc.factsHtml ?? [];
  if (facts.length === 0) return '';
  return el(
    'section',
    { class: 'section entry-facts', 'aria-labelledby': 'facts' },
    el('h2', { class: 'section-title', id: 'facts' }, 'Facts'),
    el(
      'dl',
      { class: 'facts' },
      facts
        .map((f) =>
          join(
            el('dt', { 'data-field': f.field }, escapeHtml(fieldLabel(f.field))),
            el('dd', { 'data-state': f.state }, f.html),
          ),
        )
        .join(''),
    ),
  );
}

/** Timeline: dated, sourced events, newest first. */
export function renderTimeline(doc) {
  const events = [...(doc.data.timeline ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  if (events.length === 0) return '';
  return el(
    'section',
    { class: 'section entry-timeline', 'aria-labelledby': 'timeline' },
    el('h2', { class: 'section-title', id: 'timeline' }, 'Timeline'),
    el(
      'ol',
      { class: 'rail' },
      events
        .map((ev) =>
          el(
            'li',
            { class: 'rail-item' },
            date(ev.date, { class: 'rail-date' }),
            el(
              'div',
              { class: 'rail-body' },
              el('span', { class: 'rail-text' }, escapeHtml(ev.event)),
              extLink(ev.source_url, 'source', { class: 'src' }),
            ),
          ),
        )
        .join(''),
    ),
  );
}

/** The dormant stamp — derived from the entry's own latest recorded date. */
export function renderDormantStamp(doc) {
  if (doc.data.maintenance !== 'dormant') return '';
  const asOf = dormantAsOf(doc.data);
  return notice(
    asOf
      ? `A record as of ${asOf}. No longer actively maintained.`
      : 'A record. No longer actively maintained.',
    'ended',
    { name: 'dormant' },
  );
}

/** The prose body, already rendered and alias-linked by the content build. */
export function renderBody(doc) {
  if (!doc.html) return '';
  return el('div', { class: 'prose' }, doc.html);
}

/**
 * The whole page body.
 * @param {object} doc   an entry doc from the site model
 * @param {object} site  { corpus, backlinks }
 */
export function renderEntryPage(doc, site) {
  return join(
    renderIdentity(doc),
    renderDormantStamp(doc),
    renderBody(doc),
    renderFacts(doc),
    renderTimeline(doc),
    el(
      'div',
      { class: 'rails' },
      renderReferencedHere(doc, site.corpus.byId),
      renderAppearsIn(doc.data.id, site.backlinks),
    ),
  );
}

/** The browse listing's row for one entry. Stubs never reach this. */
export function renderEntryRow(doc) {
  const d = doc.data;
  const status = doc.currentStatus ?? d.status; // see renderIdentity() above
  return el(
    'li',
    { class: 'browse-row', 'data-kind': d.kind, 'data-status': status },
    link(doc.url, d.display_name, { class: 'browse-name' }),
    el('span', { class: 'browse-kind' }, escapeHtml(d.kind)),
    badge(status, statusTone(status)),
  );
}
