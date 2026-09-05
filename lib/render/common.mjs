/**
 * render/common.mjs — the small vocabulary every surface renderer shares.
 *
 * **Why the page bodies are HTML strings and not JSX.** Two reasons, both
 * measured rather than stylistic:
 *
 *  1. *They are testable this way.* Wave 2 already returns HTML fragments for
 *     facts and rails for exactly this reason ("a fragment is the seam that
 *     lets these rails be unit-tested now and dropped into whatever those
 *     templates turn out to be"). A fixture corpus can be built and its
 *     rendered surface asserted, in `node --test`, with no browser and no JSX
 *     toolchain. A page that only existed as a `.tsx` could be checked only
 *     against the exported site — which means only against real content,
 *     which wave 4 has not written yet.
 *  2. *They are cheaper on the wire.* Under the App Router every rendered
 *     tree is serialised into the page a second time as the hydration
 *     payload. A deep element tree serialises as a deep structure; one string
 *     serialises as one string. On the 388-row catalog that difference is the
 *     margin between meeting task 4.11's 150 KB budget and not.
 *
 * The React pages in `app/` own the chrome — nav, search, theme, footer,
 * metadata — and place these fragments. Nothing in here knows about React.
 */

import { escapeHtml, safeUrl } from '../facts.mjs';

export { escapeHtml, safeUrl };

/** Attribute list from a plain object; null/undefined/false values are dropped. */
export function attrs(map) {
  return Object.entries(map ?? {})
    .filter(([, v]) => v !== null && v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escapeHtml(v)}"`))
    .join('');
}

/** HTML void elements take no closing tag; emitting one is a parse error. */
const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr',
]);

export function el(tag, attrMap, ...children) {
  if (VOID.has(tag)) return `<${tag}${attrs(attrMap)}>`;
  const inner = children.flat(Infinity).filter(Boolean).join('');
  return `<${tag}${attrs(attrMap)}>${inner}</${tag}>`;
}

/** An internal link. Always root-relative — the link check enforces that. */
export function link(href, text, attrMap = {}) {
  return el('a', { href, ...attrMap }, escapeHtml(text));
}

/**
 * An external link. `rel="nofollow noopener"` on every one of them: this site
 * cites constantly and passes no ranking signal by citing.
 */
export function extLink(href, text, attrMap = {}) {
  return `<a href="${safeUrl(href)}" rel="nofollow noopener"${attrs(attrMap)}>${escapeHtml(text)}</a>`;
}

/** A machine-readable date. Every date on this site renders through here. */
export function date(iso, attrMap = {}) {
  if (!iso) return '';
  return el('time', { datetime: iso, ...attrMap }, escapeHtml(iso));
}

/** A short all-caps label. Structure, not decoration: it names what follows. */
export function eyebrow(text, attrMap = {}) {
  return el('p', { class: 'eyebrow', ...attrMap }, escapeHtml(text));
}

/** A status/kind pill. `tone` drives colour and is a data attribute, not a class soup. */
export function badge(text, tone = null) {
  return el('span', { class: 'badge', 'data-tone': tone }, escapeHtml(text));
}

/** Lifecycle statuses that get the end-of-life tone. */
const ENDED = new Set(['deprecated', 'retired', 'dead']);
export function statusTone(status) {
  if (ENDED.has(status)) return 'ended';
  if (status === 'preview' || status === 'announced') return 'early';
  return null;
}

/**
 * The stated sort criterion. specs/directory: "its sort order is one of the
 * stated objective criteria and the page says which". Rendered by every
 * listing page through this one function, with a stable hook
 * (`data-sort-note`) so the DOM check cannot be satisfied by prose that
 * happens to contain the word "sorted".
 */
export function sortNote(criterion) {
  return el(
    'p',
    { class: 'sort-note', 'data-sort-note': criterion },
    'Sorted by ',
    escapeHtml(criterion),
    '. Nothing on this site is ordered by payment.',
  );
}

/** A value the source did not provide. One rendering, everywhere. */
export const ABSENT = '<span class="absent" title="not published by the source">—</span>';

export function cell(value, attrMap = {}) {
  return el('td', attrMap, value === null || value === undefined || value === '' ? ABSENT : escapeHtml(value));
}

/** A page-level notice. `tone`: 'warn' | 'ended' | 'info'. */
export function notice(text, tone = 'warn', opts = {}) {
  return el(
    'div',
    { class: 'notice', 'data-tone': tone, role: opts.role ?? 'note', 'data-notice': opts.name ?? null },
    el('p', {}, escapeHtml(text)),
    opts.extra ?? '',
  );
}

/** A section with a heading that is a real heading. */
export function section(title, body, attrMap = {}) {
  return el(
    'section',
    { class: 'section', ...attrMap },
    title ? el('h2', { class: 'section-title' }, escapeHtml(title)) : '',
    body,
  );
}

/** Join fragments, dropping empties, without introducing whitespace text nodes. */
export function join(...parts) {
  return parts.flat(Infinity).filter(Boolean).join('');
}

/**
 * The value that appears on the most rows — ties broken by first-seen order.
 * Shared by every renderer that needs a collection's own dominant value
 * without hard-coding one (R8's iter-07 addendum badge clause: a repeated,
 * non-discriminating value is stated once and rendered at a lower weight
 * than the columns a reader compares — catalog's fetch date, iter-08's
 * /tools verification date).
 */
export function modeOf(values) {
  const counts = new Map();
  for (const v of values) {
    if (v == null) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}
