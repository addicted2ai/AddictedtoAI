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
import { LISTINGS_SORT, LISTINGS_GROUPED_SORT, listingGroups } from '../listings.mjs';

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
    el('dt', {}, 'Category'),
    el('dd', {}, link(`/tools#tools-${doc.data.category}`, doc.data.category)),
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

/** The heading anchor for one category. One definition; the jump links use it. */
const categoryId = (category) => `tools-${category}`;

/**
 * Jump links to each category, with how many listings it holds.
 *
 * The count is displayed and never sorted on — see the note in
 * `lib/listings.mjs` on why ordering by count would be the wrong criterion.
 */
function categoryIndex(groups) {
  return el(
    'nav',
    { class: 'category-index', 'aria-label': 'Tool categories' },
    el(
      'ul',
      { class: 'browse' },
      groups
        .map((g) =>
          el(
            'li',
            { class: 'browse-row', 'data-category': g.category },
            link(`#${categoryId(g.category)}`, g.category, { class: 'browse-name' }),
            el('span', { class: 'browse-kind' }, `${g.listings.length}`),
          ),
        )
        .join(''),
    ),
  );
}

/**
 * The alphabetical order, still available (beads addictedtoai-0eg).
 *
 * A `<details>` rather than a tab, a second route or a filter: it needs no
 * JavaScript, no CSS and no second URL, it is keyboard-operable and
 * screen-reader-announced by the browser itself, and it degrades to "everything
 * visible" when either is missing. Category is the default because it is what
 * is open; A-to-Z is one keystroke away.
 *
 * It lists names rather than repeating all 35 rows, because the reader who
 * wants alphabetical order is the reader who already knows the name and wants
 * to reach it. Repeating every row would double the page to serve that.
 */
function alphabeticalIndex(tools) {
  return el(
    'details',
    { class: 'listings-az' },
    el('summary', {}, `All ${tools.length} listings, A to Z`),
    sortNote(LISTINGS_SORT),
    el(
      'ul',
      { class: 'browse' },
      tools
        .map((t) =>
          el(
            'li',
            { class: 'browse-row', 'data-category': t.doc.data.category },
            link(t.doc.url, t.doc.data.title, { class: 'browse-name' }),
            el('span', { class: 'browse-kind' }, escapeHtml(t.doc.data.category)),
          ),
        )
        .join(''),
    ),
  );
}

function categorySection(group, byId) {
  return el(
    'section',
    { class: 'section', 'data-category': group.category },
    el('h2', { class: 'section-title', id: categoryId(group.category) }, escapeHtml(group.category)),
    el('p', { class: 'category-note' }, escapeHtml(group.note)),
    el('ul', { class: 'listings' }, group.listings.map((t) => renderListingRow(t, byId)).join('')),
  );
}

/**
 * The directory, grouped by the job each tool does (beads addictedtoai-0eg).
 *
 * Both orderings state their criterion through `sortNote`, and the grouped one
 * comes first because it is the page's own order — the DOM check reads the
 * first `[data-sort-note]` and must find the order the page is actually in.
 */
export function renderToolsIndex(tools, byId) {
  if (tools.length === 0) {
    return join(
      sortNote(LISTINGS_GROUPED_SORT),
      notice(
        'No tools are listed yet. Listings are curated by hand, each with a live-verified URL ' +
          'and a link to its wiki entry.',
        'info',
        { name: 'empty-tools' },
      ),
    );
  }
  const groups = listingGroups(tools);
  return join(
    sortNote(LISTINGS_GROUPED_SORT),
    categoryIndex(groups),
    alphabeticalIndex(tools),
    groups.map((g) => categorySection(g, byId)).join(''),
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
