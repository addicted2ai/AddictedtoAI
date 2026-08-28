/**
 * search-index.mjs — client-side name search (task 4.12, specs/site).
 *
 * *"Search runs entirely in the visitor's browser (no server, no external
 * service, no inference) and is name/title search by design, not full-text.
 * Stubs are discoverable through it even though they are `noindex` for
 * crawlers."*
 *
 * The index covers **every page**, stubs included — that is the requirement
 * that makes a 388-entry corpus useful rather than a set of pages nobody can
 * reach. Entries contribute their id, display name and every alias
 * regardless of class: alias *classes* govern automatic linking (specs/wiki),
 * not findability, and a `manual` alias like "Claude" is exactly what someone
 * types into a search box.
 *
 * The matcher itself lives in `search-match.mjs`, which imports nothing, so
 * the browser and this module's test call the same function. See the note
 * there.
 */

import { join } from 'node:path';
import { DERIVED_DIR, writeJsonDeterministic } from './paths.mjs';
import { titleOf } from './corpus.mjs';
import { matchIndex, TYPE_LABELS } from './search-match.mjs';

export { matchIndex, TYPE_LABELS };

export const SEARCH_INDEX_FILE = join(DERIVED_DIR, 'search-index.json');

/**
 * @param {object} corpus  from `loadCorpus`
 * @returns {{generated_from: string, count: number, docs: object[]}}
 */
export function buildSearchIndex(corpus) {
  const docs = corpus.all
    .map((doc) => {
      const isEntry = doc.type === 'entry';
      const names = isEntry ? doc.data.aliases.map((a) => a.name) : [];
      return {
        u: doc.url,
        t: titleOf(doc.type, doc),
        k: doc.type,
        // The entry's kind and status are what a reader disambiguates by
        // ("which Gemini?"), so they travel with the row.
        d: isEntry ? doc.data.kind : null,
        s: isEntry ? doc.data.status : null,
        i: isEntry ? doc.data.id : null,
        a: [...new Set(names.filter((n) => n !== titleOf(doc.type, doc)))],
        // Stubs are `noindex` for crawlers and findable here. The flag is
        // carried so the results list can say so rather than hide them.
        b: isEntry ? Boolean(doc.index?.stub) : false,
      };
    })
    .sort((a, b) => a.u.localeCompare(b.u));

  return {
    generated_from: 'content/ at build time — names and titles only, never body text',
    count: docs.length,
    docs,
  };
}

export async function writeSearchIndex(index, file = SEARCH_INDEX_FILE) {
  return writeJsonDeterministic(file, index);
}

