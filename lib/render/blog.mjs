/**
 * render/blog.mjs — posts (task 4.6, specs/blog).
 *
 * *"After publication, a post's body SHALL NOT be edited except to append a
 * dated correction block ... never a silent rewrite."*
 *
 * So the body renders exactly as written and the corrections render **after**
 * it, each with its own date, in their own block. The body is not patched,
 * struck through or annotated by this renderer: a correction that changed the
 * body would be the silent rewrite the rule forbids. The page also carries a
 * marker at the top when corrections exist, so a reader who stops at the
 * first paragraph knows there is one.
 */

import { el, join, link, date, escapeHtml, eyebrow, notice, extLink } from './common.mjs';
import { corrections } from '../posts.mjs';

/**
 * ---------------------------------------------------------------------------
 * THE ANCHOR (specs/blog, change `make-the-blog-worth-sending` task 3.6)
 *
 * *"The rendered post page SHALL show the anchor — the primary evidence, dated
 * and linked, visible to the reader — rather than leaving it as front matter
 * only. A note's finish line includes 'where the primary evidence is', and
 * evidence the reader cannot see does not count."*
 *
 * Two declared forms, rendered as one block because they answer one question:
 *
 *  - `covers:` — change-feed references. The event is in this site's own
 *    mechanical record, written by the model-free Pulse, so the *site* is the
 *    citable location and the link is internal. When the caller passes the
 *    feed lines (`opts.changes`), the line's own name and its source URL are
 *    rendered too; without them the block still stands on the declared date
 *    and the resolved-at-build key, which is the part the build guarantees.
 *  - `anchor:` — a primary-source URL and the event's date, for an event
 *    outside the Pulse's aperture.
 *
 * A post declaring neither is a synthesis and renders no block at all — not an
 * empty one. An empty evidence heading would say "this post has evidence" and
 * then show none, which is worse than saying nothing.
 * ---------------------------------------------------------------------------
 */

/** Where this site's own record of a feed-observed change is readable. */
const CHANGED_FEED_URL = '/catalog/changed';

/** `key` -> change line, from whatever shape the caller has to hand. */
function changeIndex(changes) {
  const index = new Map();
  const lines = changes instanceof Map ? [...changes.values()] : (changes ?? []);
  for (const line of lines) {
    if (line && line.key !== null && line.key !== undefined) index.set(String(line.key), line);
  }
  return index;
}

/** A URL as a reader reads it: no scheme noise, no trailing slash. */
function urlLabel(url) {
  return String(url).replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * The declared anchors of one post, in render order: feed references first
 * (the stronger evidence — unforgeable, and an unresolved one fails the
 * build), then the external anchor.
 *
 * @param {object} doc
 * @param {object} [opts]
 * @param {object[]|Map} [opts.changes]  `data/changes.jsonl` lines, if the
 *   caller has them; used only to name a covered change and cite its source.
 */
export function postAnchors(doc, opts = {}) {
  const index = changeIndex(opts.changes);
  const out = [];
  for (const ref of doc?.data?.covers ?? []) {
    const line = index.get(String(ref.key)) ?? null;
    out.push({
      kind: 'covers',
      key: ref.key,
      date: ref.date,
      title: line?.display_name ?? line?.excerpt?.title ?? null,
      href: CHANGED_FEED_URL,
      sourceUrl: line?.source_url ?? line?.item_url ?? null,
    });
  }
  const anchor = doc?.data?.anchor ?? null;
  if (anchor) {
    out.push({
      kind: 'external',
      key: null,
      date: anchor.date,
      title: null,
      href: anchor.url,
      sourceUrl: anchor.url,
    });
  }
  return out;
}

export function renderAnchor(doc, opts = {}) {
  const anchors = postAnchors(doc, opts);
  if (anchors.length === 0) return '';
  return el(
    'section',
    {
      class: 'section post-anchor',
      'data-anchor-count': String(anchors.length),
      'aria-labelledby': 'primary-evidence',
    },
    el('h2', { class: 'section-title', id: 'primary-evidence' }, 'Primary evidence'),
    el(
      'ol',
      { class: 'rail' },
      anchors
        .map((a) =>
          el(
            'li',
            {
              class: 'rail-item anchor-item',
              'data-anchor-kind': a.kind,
              'data-covers-key': a.key,
            },
            date(a.date, { class: 'rail-date' }),
            el(
              'div',
              { class: 'rail-body' },
              el(
                'p',
                { class: 'rail-text' },
                a.kind === 'covers'
                  ? join(
                      link(a.href, a.title ?? 'Recorded in this site’s change feed'),
                      a.sourceUrl
                        ? join(' · ', extLink(a.sourceUrl, urlLabel(a.sourceUrl), { class: 'src' }))
                        : '',
                    )
                  : extLink(a.href, urlLabel(a.href), { class: 'src' }),
              ),
            ),
          ),
        )
        .join(''),
    ),
  );
}

export function renderCorrections(doc) {
  const list = corrections(doc);
  if (list.length === 0) return '';
  return el(
    'section',
    { class: 'section corrections', 'data-corrections': String(list.length), 'aria-labelledby': 'corrections' },
    el('h2', { class: 'section-title', id: 'corrections' }, list.length === 1 ? 'Correction' : 'Corrections'),
    el(
      'ol',
      { class: 'rail' },
      list
        .map((c) =>
          el(
            'li',
            { class: 'rail-item correction' },
            date(c.date, { class: 'rail-date' }),
            el('div', { class: 'rail-body' }, el('p', { class: 'rail-text' }, escapeHtml(c.text))),
          ),
        )
        .join(''),
    ),
  );
}

export function renderPostPage(doc, opts = {}) {
  const list = corrections(doc);
  return join(
    el(
      'header',
      { class: 'entry-head' },
      eyebrow('blog'),
      el('h1', { class: 'entry-name' }, escapeHtml(doc.data.title)),
      el(
        'p',
        { class: 'post-date', 'data-post-date': doc.data.date },
        el('span', { class: 'label' }, 'Published '),
        date(doc.data.date),
        el('span', { class: 'label' }, '. True as of that date; aging is not a defect.'),
      ),
    ),
    list.length
      ? notice(
          `This post carries ${list.length} dated correction${list.length === 1 ? '' : 's'}, appended below the body. The body is unchanged.`,
          'warn',
          { name: 'has-corrections' },
        )
      : '',
    doc.html ? el('div', { class: 'prose' }, doc.html) : '',
    // Evidence before corrections, and both after the body: the corrections
    // rule is that they are *appended below the body* and never fold back into
    // it, which a section between them does not disturb.
    renderAnchor(doc, opts),
    renderCorrections(doc),
  );
}

export function renderBlogIndex(posts) {
  if (posts.length === 0) {
    // An empty index must read as a decision, not as a page that failed to
    // load (make-the-blog-worth-sending, task 1.4). It says what the blog is
    // for, where the rest of the site's writing lives, and — because the
    // earlier posts were withdrawn rather than moved, and their URLs now
    // redirect here (specs/site: no published URL ever 404s) — what happened
    // to anything a visitor arrived looking for.
    return notice(
      'Nothing here right now. Two kinds of thing get published on this page: a note, when ' +
        'something happens in AI that lands on somebody in particular, and a longer piece, ' +
        'when several things add up to something neither of them said alone. Both are dated ' +
        'and both are checkable. Nothing is published to fill the page, so an empty week is ' +
        'an ordinary week. The earlier posts were withdrawn and their links now lead here; ' +
        'the wiki, the tutorials and the learn track are where the standing material lives.',
      'info',
      { name: 'empty-blog' },
    );
  }
  return el(
    'ol',
    { class: 'rail rail-posts' },
    posts
      .map((doc) =>
        el(
          'li',
          { class: 'rail-item' },
          date(doc.data.date, { class: 'rail-date' }),
          el(
            'div',
            { class: 'rail-body' },
            el('h3', { class: 'rail-title' }, link(doc.url, doc.data.title)),
            (doc.data.corrections ?? []).length
              ? el('p', { class: 'rail-note' }, `${doc.data.corrections.length} correction(s) appended`)
              : '',
          ),
        ),
      )
      .join(''),
  );
}
