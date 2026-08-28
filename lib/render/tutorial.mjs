/**
 * render/tutorial.mjs — dynamic education (task 4.5,
 * specs/education-dynamic).
 *
 * *"A tutorial page SHALL be structurally unable to render without its
 * verification state."* `renderTutorialPage` emits the stamp before the body
 * on every path — there is no `if` around it and no front-matter field that
 * removes it. The banner above it varies with state; the stamp does not.
 *
 * The five treatments, each visibly different from the others:
 *
 *   fresh     stamp only.
 *   stale     stamp + banner naming the date and the interval.
 *   moved-on  stamp + banner naming the verified version, the current one,
 *             and a link to the subject's entry — "named, not implied".
 *   demoted   stamp + full-width notice; the page is `noindex` and delisted,
 *             and the URL still resolves.
 *   archived  stamp + notice naming the subject's fate.
 */

import { el, join, link, date, escapeHtml, eyebrow, notice } from './common.mjs';

/** "Verified against <subject> <version> on <date>." Always rendered. */
export function renderStamp(doc, state) {
  const parts = state.stamp.map((s) =>
    join(link(s.url, s.subject), ' ', el('span', { class: 'version' }, escapeHtml(s.version))),
  );
  return el(
    'p',
    { class: 'verification-stamp', 'data-verification-stamp': state.state },
    el('span', { class: 'label' }, 'Verified against '),
    parts.join('<span class="sep">, </span>'),
    el('span', { class: 'label' }, ' on '),
    date(state.verified_on),
    el('span', { class: 'label' }, `. Re-verify every ${state.reverify_days} days.`),
  );
}

const TONES = { stale: 'warn', 'moved-on': 'warn', demoted: 'ended', archived: 'ended' };

export function renderBanner(state) {
  if (!state.notice) return '';
  const extra =
    state.state === 'moved-on'
      ? el(
          'p',
          { class: 'notice-links' },
          state.moved.map((m) => link(m.url, `${m.subject} — current state`)).join('<span class="sep">, </span>'),
        )
      : state.state === 'archived'
        ? el(
            'p',
            { class: 'notice-links' },
            state.dead.map((m) => link(m.url, `${m.subject} — current state`)).join('<span class="sep">, </span>'),
          )
        : '';
  return notice(state.notice, TONES[state.state] ?? 'warn', {
    name: state.state,
    role: state.state === 'demoted' || state.state === 'archived' ? 'alert' : 'note',
    extra,
  });
}

export function renderTutorialPage(doc, state) {
  return join(
    el(
      'header',
      { class: 'entry-head', 'data-tutorial-state': state.state },
      eyebrow('tutorial'),
      el('h1', { class: 'entry-name' }, escapeHtml(doc.data.title)),
      renderStamp(doc, state),
    ),
    // Above the first instructional step, on every state that has one.
    renderBanner(state),
    doc.html ? el('div', { class: 'prose' }, doc.html) : '',
  );
}

/** The tutorials index. Demoted and archived tutorials are not listed. */
export function renderTutorialsIndex(states) {
  const listed = states.filter((s) => s.state.listed);
  const hidden = states.length - listed.length;
  if (listed.length === 0) {
    return notice(
      'No tutorial is currently listed. Tutorials appear here while their steps have been ' +
        're-run inside their declared interval.',
      'info',
      { name: 'empty-tutorials' },
    );
  }
  return join(
    el(
      'ul',
      { class: 'listings' },
      listed
        .map(({ doc, state }) =>
          el(
            'li',
            { class: 'listing', 'data-state': state.state },
            el('h3', { class: 'listing-name' }, link(doc.url, doc.data.title)),
            el(
              'p',
              { class: 'listing-line' },
              el('span', { class: 'listing-verified' }, 'verified '),
              date(state.verified_on),
              el('span', { class: 'sep' }, ' · '),
              escapeHtml(state.stamp.map((s) => `${s.subject} ${s.version}`).join(', ')),
            ),
            state.notice ? el('p', { class: 'listing-marker', 'data-tone': 'warn' }, escapeHtml(state.notice)) : '',
          ),
        )
        .join(''),
    ),
    hidden > 0
      ? el(
          'p',
          { class: 'delisted-note', 'data-delisted': String(hidden) },
          `${hidden} tutorial${hidden === 1 ? '' : 's'} `,
          `${hidden === 1 ? 'is' : 'are'} delisted — demoted for staleness or archived because the subject died. `,
          'Their URLs still resolve; no published URL on this site ever 404s.',
        )
      : '',
  );
}
