/**
 * search-match.mjs — the name matcher, and nothing else.
 *
 * Split out of `search-index.mjs` for one concrete reason: **this file is
 * bundled into the browser.** `search-index.mjs` imports `node:path` and the
 * corpus loader to build the index at build time; a client component that
 * imported it would drag both into the page bundle, or more likely fail to
 * bundle at all. This module imports nothing.
 *
 * The consequence that matters is that the browser and the test run the same
 * function. A matcher re-implemented in the client component would be a
 * second, untested implementation of the one behaviour specs/site names:
 * *"a visitor types a stub entry's alias ... the stub's page appears in the
 * results and is reachable."*
 *
 * Scoring is deliberately crude — exact beats prefix beats word-boundary
 * beats mid-word, a title beats an alias beats an id, shorter beats longer.
 * Name search that tries to be clever is name search that surprises you.
 */

/** Human labels for the type badge in the results list. */
export const TYPE_LABELS = {
  entry: 'wiki',
  learn: 'learn',
  tutorial: 'tutorial',
  post: 'blog',
  tool: 'tool',
  delta: 'delta',
};

function score(haystack, needle) {
  const h = String(haystack ?? '').toLowerCase();
  if (h === needle) return 1000;
  if (h.startsWith(needle)) return 500 - Math.min(h.length, 200);
  const at = h.indexOf(needle);
  if (at === -1) return -1;
  const boundary = at > 0 && /[\s\-/.(]/.test(h[at - 1]);
  return (boundary ? 200 : 80) - Math.min(h.length, 60);
}

/**
 * Filter the index by name. Pure and synchronous — it runs on every keystroke.
 *
 * @param {{docs: object[]}} index
 * @param {string} query
 * @param {number} [limit]
 * @returns {(object & {why: string, score: number})[]}
 */
export function matchIndex(index, query, limit = 12) {
  const needle = String(query ?? '').trim().toLowerCase();
  if (needle.length === 0) return [];
  const hits = [];
  for (const doc of index?.docs ?? []) {
    let best = score(doc.t, needle);
    let why = doc.t;
    for (const alias of doc.a ?? []) {
      const s = score(alias, needle) - 20; // a title beats an alias, all else equal
      if (s > best) {
        best = s;
        why = alias;
      }
    }
    if (doc.i) {
      const s = score(doc.i, needle) - 40;
      if (s > best) {
        best = s;
        why = doc.i;
      }
    }
    if (best > 0) hits.push({ ...doc, score: best, why });
  }
  return hits
    .sort((a, b) => b.score - a.score || String(a.t).localeCompare(String(b.t)))
    .slice(0, limit);
}
