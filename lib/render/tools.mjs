/**
 * render/tools.mjs — the curated tools directory (task 4.3, specs/directory).
 *
 * Each listing shows what it is, its canonical URL, its pricing model, its
 * `last_verified` date, and its wiki entry. A listing that stopped resolving
 * or whose subject is discontinued keeps its place with a visible marker:
 * *"dead listings are marked and kept as record, never silently dropped and
 * never left looking alive."*
 *
 * The marker text comes from `listings.mjs`, which reads the Pulse's
 * accumulated link-check history. Nothing here decides whether a tool is
 * alive — a page that made that call at build time would flip a tool to dead
 * on one flaky timeout.
 */

import { el, join, link, extLink, date, sortNote, escapeHtml, notice } from './common.mjs';
import { LISTINGS_SORT } from '../listings.mjs';

/** The marker, when there is one. Dead listings get the ended tone. */
function marker(state) {
  if (!state.marker) return '';
  return el(
    'p',
    { class: 'listing-marker', 'data-marker': state.state, 'data-tone': state.tone ?? 'info', role: 'note' },
    escapeHtml(state.marker),
  );
}

function facts(doc, state, byId) {
  const entry = byId.get(doc.data.entry);
  return el(
    'dl',
    { class: 'listing-facts' },
    el('dt', {}, 'Site'),
    el('dd', {}, extLink(doc.data.url, doc.data.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))),
    el('dt', {}, 'Pricing'),
    el('dd', {}, escapeHtml(doc.data.pricing)),
    el('dt', {}, 'Last verified'),
    el('dd', {}, date(state.last_verified)),
    entry ? join(el('dt', {}, 'Wiki entry'), el('dd', {}, link(entry.url, entry.data.display_name))) : '',
  );
}

/** One row of the listing index. */
export function renderListingRow({ doc, state }, byId) {
  const entry = byId.get(doc.data.entry);
  return el(
    'li',
    { class: 'listing', 'data-state': state.state, 'data-alive': state.alive ? 'yes' : 'no' },
    el(
      'h3',
      { class: 'listing-name' },
      link(doc.url, doc.data.title),
    ),
    el(
      'p',
      { class: 'listing-line' },
      el('span', { class: 'listing-pricing' }, escapeHtml(doc.data.pricing)),
      el('span', { class: 'sep' }, ' · '),
      el('span', { class: 'listing-verified' }, 'verified '),
      date(state.last_verified),
      entry ? join(el('span', { class: 'sep' }, ' · '), link(entry.url, entry.data.display_name, { class: 'listing-entry' })) : '',
    ),
    marker(state),
  );
}

export function renderToolsIndex(tools, byId) {
  if (tools.length === 0) {
    return join(
      sortNote(LISTINGS_SORT),
      notice(
        'No tools are listed yet. Listings are curated by hand, each with a live-verified URL ' +
          'and a link to its wiki entry.',
        'info',
        { name: 'empty-tools' },
      ),
    );
  }
  return join(
    sortNote(LISTINGS_SORT),
    el('ul', { class: 'listings' }, tools.map((t) => renderListingRow(t, byId)).join('')),
  );
}

/** One listing's own page. */
export function renderToolPage({ doc, state }, site) {
  return join(
    el(
      'header',
      { class: 'entry-head' },
      el('p', { class: 'eyebrow' }, 'tool listing'),
      el('h1', { class: 'entry-name' }, escapeHtml(doc.data.title)),
    ),
    marker(state),
    doc.html ? el('div', { class: 'prose' }, doc.html) : '',
    facts(doc, state, site.corpus.byId),
  );
}
