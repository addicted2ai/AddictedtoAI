/**
 * render/home.mjs — the home page (task 4.7, specs/site).
 *
 * *"The home page SHALL lead with what changed ... All of it renders from the
 * data layer, so in a week where no inference runs at all, the home page
 * still changes every day the world does. The home page serves someone
 * already following AI daily; education is a door they can take, not the
 * framing of the page."*
 *
 * Which settles the layout argument before it starts. There is no hero. The
 * first element under the header is the first dated line of the changed feed,
 * and at 1440×900 roughly a dozen of them are visible along with the
 * lifecycle strip beside them. A visitor who follows AI daily wants to know
 * what moved since yesterday; that is the entire top of the page.
 *
 * The date rail is the site's recurring shape: a column of dates with the
 * records hanging off it. It appears here, on entry timelines, on the blog
 * index and inside the showpiece, because *dated and sourced* is the one
 * thing every record on this site has in common and the layout should say so.
 *
 * An `interpret` annotation (specs/loop) renders as its own line under the
 * mechanical change it annotates — visibly separate, never merged into it.
 * The machine's observation and a model's judgment about it are different
 * kinds of claim and the page keeps them apart.
 */

import { el, join, link, extLink, date, escapeHtml, badge, statusTone, notice } from './common.mjs';
import { groupByDate } from '../changes.mjs';

/** One change, as a rail item. */
function changeLine(line) {
  return el(
    'li',
    { class: 'rail-item change', 'data-kind': line.kind, 'data-seeded': line.seeded ? 'yes' : 'no' },
    date(line.date, { class: 'rail-date' }),
    el(
      'div',
      { class: 'rail-body' },
      el(
        'p',
        { class: 'change-line' },
        line.entry
          ? link(line.entry.url, line.title, { class: 'change-name' })
          : el('span', { class: 'change-name' }, escapeHtml(line.title)),
        el('span', { class: 'change-detail' }, escapeHtml(line.detail)),
        line.source_url ? extLink(line.source_url, 'source', { class: 'src' }) : '',
      ),
      line.annotations
        .map((a) =>
          el(
            'p',
            { class: 'change-annotation', 'data-annotation': '' },
            el('span', { class: 'label' }, 'What it means '),
            escapeHtml(a.text),
          ),
        )
        .join(''),
    ),
  );
}

/** The changed feed — the page's lead, and the whole reason it moves daily. */
export function renderChangedFeed(feed, opts = {}) {
  const limit = opts.limit ?? 24;
  const shown = feed.slice(0, limit);
  if (shown.length === 0) {
    return notice(
      'The changed feed is empty. It fills from the Pulse the first time it observes a public source.',
      'info',
      { name: 'empty-changes' },
    );
  }
  return el(
    'ol',
    { class: 'rail rail-changes', 'data-changed-feed': String(shown.length) },
    groupByDate(shown)
      .flatMap((group) => group.lines.map(changeLine))
      .join(''),
  );
}

/** Recent deprecations and retirements — the record vendors delete. */
export function renderLifecycleStrip(rows, opts = {}) {
  const shown = rows.slice(0, opts.limit ?? 6);
  if (shown.length === 0) {
    return el(
      'p',
      { class: 'strip-empty' },
      'Nothing in the current snapshot is marked deprecated, retired or dead.',
    );
  }
  return el(
    'ul',
    { class: 'strip', 'data-lifecycle-strip': String(shown.length) },
    shown
      .map((r) =>
        el(
          'li',
          { class: 'strip-item' },
          r.entry ? link(r.entry.url, r.name) : el('span', {}, escapeHtml(r.name)),
          badge(r.status, statusTone(r.status)),
        ),
      )
      .join(''),
  );
}

/** Latest post and latest listed tutorial, side by side. */
export function renderLatest(site) {
  const post = site.posts[0] ?? null;
  const tutorial = site.tutorials.find((t) => t.state.listed) ?? null;
  const cards = [];
  if (post) {
    cards.push(
      el(
        'div',
        { class: 'latest-card', 'data-latest': 'post' },
        el('p', { class: 'eyebrow' }, 'latest post'),
        el('h3', {}, link(post.url, post.data.title)),
        date(post.data.date, { class: 'latest-date' }),
      ),
    );
  }
  if (tutorial) {
    cards.push(
      el(
        'div',
        { class: 'latest-card', 'data-latest': 'tutorial' },
        el('p', { class: 'eyebrow' }, 'latest tutorial'),
        el('h3', {}, link(tutorial.doc.url, tutorial.doc.data.title)),
        el(
          'p',
          { class: 'latest-date' },
          'verified ',
          date(tutorial.state.verified_on),
        ),
      ),
    );
  }
  if (cards.length === 0) {
    return el('p', { class: 'strip-empty' }, 'No post or tutorial is published yet.');
  }
  return el('div', { class: 'latest' }, cards.join(''));
}

/** The catalog's shape in one line: how many rows, read when, from where. */
export function renderCatalogGlance(site) {
  const source = (site.freshness?.sources ?? []).find((s) => s.id === 'openrouter-models')
    ?? (site.freshness?.sources ?? [])[0];
  return el(
    'p',
    { class: 'glance', 'data-catalog-glance': String(site.catalog.length) },
    el('span', { class: 'glance-number' }, String(site.catalog.length)),
    el('span', { class: 'glance-label' }, ' models you can call today'),
    source
      ? join(
          el('span', { class: 'sep' }, ' · '),
          el('span', { class: 'glance-date' }, `${source.display_date_label ?? 'fetched'} `),
          date(source.display_date ?? source.last_fetch_date ?? ''),
        )
      : '',
    el('span', { class: 'sep' }, ' · '),
    link('/catalog', 'the whole table'),
  );
}

/** The doors. Six surfaces plus the showpiece, each with what is behind it. */
const DOORS = [
  { url: '/wiki', name: 'Wiki', blurb: (s) => `${s.entries.length} typed records, each sourced and dated` },
  { url: '/catalog', name: 'Catalog', blurb: (s) => `${s.catalog.length} models, priced from public feeds` },
  { url: '/tools', name: 'Tools', blurb: (s) => `${s.tools.length} curated listings, each re-checked` },
  { url: '/learn', name: 'Learn', blurb: (s) => `${s.corpus.learn.length} pages built not to rot` },
  { url: '/tutorials', name: 'Tutorials', blurb: (s) => `${s.tutorials.length} tutorials, each with its verification date` },
  { url: '/blog', name: 'Blog', blurb: (s) => `${s.posts.length} dated posts` },
  {
    url: '/impossible-routine',
    name: 'Impossible → Routine',
    blurb: (s) => `${s.deltas.length} dated pairs: research result to commodity`,
    feature: true,
  },
  {
    // CP-UI-001-1: the Frontier door. K11 keeps /frontier off the merged
    // OpenSpec surface for now, so this door — not primary nav (R14's
    // header budget) — is the site's one path to it. The count is joined
    // from the same corpus the door pattern above already reads, not
    // authored copy.
    url: '/frontier',
    name: 'The Frontier',
    blurb: (s) => `${s.entries.filter((e) => e.data.kind === 'org').length} organisations, boarded by index and by claim`,
  },
];

export function renderDoors(site) {
  return el(
    'ul',
    { class: 'doors', 'data-doors': String(DOORS.length) },
    DOORS.map((d) =>
      el(
        'li',
        { class: 'door', 'data-feature': d.feature ? 'yes' : null },
        link(d.url, d.name, { class: 'door-name' }),
        el('span', { class: 'door-blurb' }, escapeHtml(d.blurb(site))),
      ),
    ).join(''),
  );
}
