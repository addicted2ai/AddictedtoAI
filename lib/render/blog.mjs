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

import { el, join, link, date, escapeHtml, eyebrow, notice } from './common.mjs';
import { corrections } from '../posts.mjs';

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

export function renderPostPage(doc) {
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
    renderCorrections(doc),
  );
}

export function renderBlogIndex(posts) {
  if (posts.length === 0) {
    return notice(
      'No posts yet. There is no posting cadence here: zero posts in a week is a normal, ' +
        'healthy outcome, and the ceiling is three in any seven days.',
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
