/**
 * render/learn.mjs — static education (task 4.4, specs/education-static).
 *
 * *"Every page SHALL declare: its level, what the reader will understand or
 * be able to do after reading (stated at the top), and which pages it assumes
 * (rendered as prerequisite links). The ladder's index page SHALL be
 * generated from these declarations, never hand-maintained."*
 *
 * All three declarations render above the prose, in that order, because they
 * are what a reader needs to decide whether to read the page at all. The
 * outcome sentence is `outcome:` verbatim — the schema requires it to state
 * what the reader will understand, so the page prefixes it with "After this
 * page you will" and prints it.
 */

import { el, join, link, escapeHtml, eyebrow, notice } from './common.mjs';
import { prerequisiteLinks } from '../learn.mjs';

const LEVEL_BLURBS = {
  orientation: 'No code, no maths. What the thing is and why anyone cares.',
  foundations: 'The vocabulary and the shapes, with enough mechanism to reason.',
  mechanics: 'How it actually works, in detail, with the maths named.',
  advanced: 'Internals, training, adaptation, inference economics, interpretability.',
};

/** The generated ladder index. */
export function renderLadder(rungs) {
  if (rungs.length === 0) {
    return notice(
      'The ladder is empty. Pages appear here by declaring a level, an outcome and their ' +
        'prerequisites — this index is generated from those declarations and is never hand-maintained.',
      'info',
      { name: 'empty-ladder' },
    );
  }
  return el(
    'ol',
    { class: 'ladder' },
    rungs
      .map((rung) =>
        el(
          'li',
          { class: 'rung', 'data-level': rung.level },
          el(
            'div',
            { class: 'rung-head' },
            el('h2', { class: 'rung-name' }, escapeHtml(rung.level)),
            el('p', { class: 'rung-blurb' }, escapeHtml(LEVEL_BLURBS[rung.level] ?? '')),
          ),
          el(
            'ul',
            { class: 'rung-pages' },
            rung.pages
              .map((p) =>
                el(
                  'li',
                  { class: 'rung-page' },
                  link(p.url, p.data.title, { class: 'rung-title' }),
                  el('p', { class: 'rung-outcome' }, escapeHtml(p.data.outcome)),
                ),
              )
              .join(''),
          ),
        ),
      )
      .join(''),
  );
}

/** One learn page: level, outcome, prerequisites, then the prose. */
export function renderLearnPage(doc, site) {
  const prereqs = prerequisiteLinks(doc, site.corpus.learn);
  return join(
    el(
      'header',
      { class: 'entry-head' },
      eyebrow(`learn · ${doc.data.level}`),
      el('h1', { class: 'entry-name' }, escapeHtml(doc.data.title)),
      el(
        'p',
        { class: 'outcome', 'data-outcome': '' },
        el('span', { class: 'label' }, 'After this page you will '),
        escapeHtml(doc.data.outcome),
      ),
      prereqs.length
        ? el(
            'p',
            { class: 'prereqs', 'data-prerequisites': '' },
            el('span', { class: 'label' }, 'Assumes '),
            prereqs.map((p) => link(p.url, p.title)).join('<span class="sep">, </span>'),
          )
        : el('p', { class: 'prereqs', 'data-prerequisites': '' }, el('span', { class: 'label' }, 'Assumes nothing.')),
    ),
    doc.html ? el('div', { class: 'prose' }, doc.html) : '',
  );
}
