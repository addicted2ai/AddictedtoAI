/**
 * render/delta.mjs — Impossible → Routine (task 4.14, specs/site).
 *
 * The site's one showpiece, and the surface three reviewers made the
 * condition of the whole thing being worth a visitor's attention. Its job is
 * stated exactly: *"demonstrate the field's pace with receipts instead of
 * asserting it"*.
 *
 * So the design is one shape repeated: a **span**. Two dates, far apart, with
 * the elapsed time measured on the rule between them and a source under each
 * end. Nothing else on the site looks like this, and nothing about it can be
 * written by an author — the dates come from the front matter, the elapsed
 * figure is arithmetic, and the schema refuses to publish an end without a
 * source. A delta cannot exaggerate, because there is nowhere in the shape to
 * put an adjective.
 *
 * The voice rule is enforced by what the markup has room for: a title, one
 * capability sentence, and for each end a date, a clause saying what happened,
 * an optional metric, and a link. Everything a reader is meant to feel comes
 * from the distance between the two dates.
 */

import { el, join, link, extLink, date, escapeHtml, eyebrow, sortNote, notice } from './common.mjs';
import { DELTAS_SORT, deltaRange } from '../deltas.mjs';

const END_LABELS = { impossible: 'Impossible', routine: 'Routine' };

function endBlock(end, which) {
  return el(
    'div',
    { class: 'span-end', 'data-end': which },
    el('p', { class: 'span-label' }, escapeHtml(END_LABELS[which])),
    date(end.date, { class: 'span-date' }),
    el('p', { class: 'span-what' }, escapeHtml(end.what)),
    end.metric ? el('p', { class: 'span-metric' }, escapeHtml(end.metric)) : '',
    extLink(end.source_url, 'source', { class: 'span-source' }),
  );
}

/**
 * One delta. `headingLevel` differs between the index (h3, under the page's
 * h1/h2) and a delta's own page (the h1 is the title, so the article gets no
 * heading of its own).
 */
export function renderDelta(view, opts = {}) {
  const heading = opts.heading ?? 'h3';
  return el(
    'article',
    { class: 'delta', id: opts.anchor === false ? null : view.slug, 'data-delta': view.slug },
    heading
      ? el(
          heading,
          { class: 'delta-title' },
          opts.linked === false ? escapeHtml(view.title) : link(view.url, view.title),
        )
      : '',
    el('p', { class: 'delta-capability' }, escapeHtml(view.capability)),
    el(
      'div',
      { class: 'span' },
      endBlock(view.impossible, 'impossible'),
      el(
        'p',
        { class: 'span-elapsed', 'data-span': view.span.text },
        el('span', { class: 'span-rule' }, ''),
        el('span', { class: 'span-elapsed-text' }, escapeHtml(view.span.text)),
        el('span', { class: 'span-rule' }, ''),
      ),
      endBlock(view.routine, 'routine'),
    ),
  );
}

/** The standing surface: every delta, newest first. */
export function renderDeltasIndex(views) {
  if (views.length === 0) {
    return join(
      sortNote(DELTAS_SORT),
      notice(
        'No deltas are published yet. Each one is a capability with two dated, sourced ends — ' +
          'the date it was a research result, and the date it became something anyone could buy. ' +
          'An end without a source does not publish.',
        'info',
        { name: 'empty-deltas' },
      ),
    );
  }
  const range = deltaRange(views);
  return join(
    el(
      'p',
      { class: 'deltas-summary', 'data-delta-count': String(range.count) },
      `${range.count} dated pair${range.count === 1 ? '' : 's'}, spanning `,
      date(range.from),
      ' to ',
      date(range.to),
      '. Every end carries a source.',
    ),
    sortNote(DELTAS_SORT),
    el('div', { class: 'deltas' }, views.map((v) => renderDelta(v)).join('')),
  );
}

/** One delta's own page — a citable URL for a single dated pair. */
export function renderDeltaPage(view) {
  return join(
    el(
      'header',
      { class: 'entry-head' },
      eyebrow('impossible → routine'),
      el('h1', { class: 'entry-name' }, escapeHtml(view.title)),
    ),
    renderDelta(view, { heading: null, anchor: false }),
    view.doc.html ? el('div', { class: 'prose' }, view.doc.html) : '',
    el(
      'p',
      { class: 'delta-back' },
      link('/impossible-routine', 'All dated pairs'),
    ),
  );
}

/** The home page's strip: the most recent few, in the same shape. */
export function renderDeltaStrip(views, count = 3) {
  const shown = views.slice(0, count);
  if (shown.length === 0) return '';
  return el('div', { class: 'deltas deltas-strip' }, shown.map((v) => renderDelta(v)).join(''));
}
