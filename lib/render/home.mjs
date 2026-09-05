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
import { boardExcerpt } from './frontier.mjs';

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

/**
 * The Frontier door (CP-UI-001-2, K11/R-E; F-hier-2 decline). The packet's
 * own design_moves reused the board itself ("Frontier door is the board's
 * first three rows"); JV-hier F-hier-2 found that a horizontally-scrolling,
 * six-plus-column board fragment as the door risks R6 (the changed feed
 * must stay the lead) and R2 (no route may gain a horizontal scroll at
 * 390px) on the one page the brief requires to lead with something else.
 * Declined with cause; built instead as a fixed two-column excerpt (player,
 * newest listing) — the same organisations, the same join, no board grid
 * and no overflow container on this page.
 *
 * RD-002 fix 3 (F-sys-2-4 + RT FM3; AR-001 D3, K25/K26). Two things change
 * and neither is the door's declined FORM: WHICH three organisations it shows
 * (`boardExcerpt` now ranks by most recent dated change, K26 — it was
 * `display_name` A–Z, which froze the door on the same three names whatever
 * the feeds did), and its CHARACTER — both cells carry `.board-lead`, the
 * board's own lead-pair treatment, over a row rule matching the board's own.
 * Per-row RULES on the cells themselves stay forbidden (R8, AR-001 D3:
 * "lead-pair weight yes, row rules no"). Reachability at 390 is the nav item
 * (K25); nothing here displaces the changed feed (R6).
 */
export function renderFrontierDoor(orgs, catalogRawRows, site, opts = {}) {
  const rows = boardExcerpt(orgs, catalogRawRows, site, opts.limit ?? 3);
  return el(
    'ul',
    { class: 'frontier-door', 'data-derived': 'frontier-door' },
    rows
      .map(({ org, row, modelDoc }) =>
        el(
          'li',
          { class: 'frontier-door-row' },
          link(org.url, org.data.display_name, { class: 'frontier-door-org board-lead' }),
          row
            ? (modelDoc ? link(modelDoc.url, row.display_name ?? row.row_id, { class: 'frontier-door-model board-lead' })
                : el('span', { class: 'frontier-door-model board-lead' }, escapeHtml(row.display_name ?? row.row_id)))
            : el('span', { class: 'frontier-door-model board-lead absent' }, 'no listing in feed'),
        ),
      )
      .join(''),
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
