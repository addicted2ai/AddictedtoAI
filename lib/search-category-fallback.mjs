/**
 * search-category-fallback.mjs — the "browse this category instead" result
 * `SearchBox.tsx` offers when the name matcher finds nothing (addictedtoai-bju).
 *
 * Split into its own file for the same reason `search-match.mjs` is: **this
 * module is bundled into the browser**, so the component and this module's
 * own test must call the exact same function rather than the component
 * reimplementing it inline where nothing but a browser ever exercises it. It
 * imports only the closed category list (`tool-categories.mjs`, itself
 * dependency-free), never `schema.mjs` or anything Node-only.
 *
 * THE DECISION THIS EXISTS TO IMPLEMENT (see `SearchBox.tsx`'s own header for
 * the full argument): `/tools` groups 35 listings under twelve closed
 * categories, and typing one of those words into the site-wide name search
 * matches nothing — the index is names and titles only, and widening the
 * matcher to score against category would silently add a fifth dimension to
 * a closed enumeration `specs/site`'s search requirement states explicitly
 * (entry ids, display names, aliases, page titles). Rather than either
 * silently failing or quietly widening a normative spec, the empty state
 * offers the direct jump instead: a reader who types "audio" still reaches
 * the audio tools, just not through the name matcher.
 */

import { TOOL_CATEGORIES } from './tool-categories.mjs';

/**
 * @param {string} query
 * @returns {object[]} `[]` for anything that is not exactly one of the
 *   twelve category tokens (case/whitespace-insensitive); otherwise a single
 *   Doc-shaped result — the same shape `search-index.mjs` writes for a real
 *   entry — whose `u` jumps straight to that category's section on `/tools`.
 *   `k: 'category'` is deliberately not one of `search-match.mjs`'s
 *   `TYPE_LABELS` keys, so the results list falls back to printing it
 *   verbatim as the badge, distinguishing it from a real `tool` listing hit.
 */
export function categoryFallback(query) {
  const needle = String(query ?? '').trim().toLowerCase();
  if (!TOOL_CATEGORIES.includes(needle)) return [];
  const title = `Browse "${needle}" tools`;
  return [
    {
      u: `/tools#tools-${needle}`,
      t: title,
      k: 'category',
      d: null,
      s: null,
      i: null,
      a: [],
      b: false,
      // Equal to `t` on purpose: SearchBox only renders the "matched …"
      // sub-line when `why !== t`, and there is no name match to explain here.
      why: title,
    },
  ];
}
