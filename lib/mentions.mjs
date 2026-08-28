/**
 * mentions.mjs — the connection metadata layer (task 2.7, specs/wiki).
 *
 * Two directions of the same relation:
 *   - **"Referenced here"** — the page's own `mentions` list, rendered on the
 *     page.
 *   - **"Appears in"** — every page that mentions an entry, rendered on the
 *     entry, computed here into `data/derived/backlinks.json` and never hand
 *     maintained. "with no edit to the entry file" is the requirement; a
 *     derived file is how that is kept true.
 *
 * An unresolvable `mentions` id fails the build — that check lives in
 * `corpus.mjs` with the other cross-file reference checks.
 *
 * The two `render*` helpers return HTML fragments rather than components on
 * purpose: page templates are wave 3's (`app/`), and a fragment is the seam
 * that lets these rails be unit-tested now and dropped into whatever those
 * templates turn out to be.
 */

import { join } from 'node:path';
import { DERIVED_DIR, writeJsonDeterministic } from './paths.mjs';
import { escapeHtml } from './facts.mjs';
import { titleOf } from './corpus.mjs';

export const BACKLINKS_FILE = join(DERIVED_DIR, 'backlinks.json');

/** @returns {{backlinks: Record<string, {url,title,type,file}[]>}} */
export function buildBacklinks(corpus) {
  /** @type {Map<string, object[]>} */
  const map = new Map();
  for (const doc of corpus.all) {
    for (const id of doc.data.mentions ?? []) {
      if (!map.has(id)) map.set(id, []);
      map.get(id).push({
        url: doc.url,
        title: titleOf(doc.type, doc),
        type: doc.type,
        file: doc.file,
      });
    }
  }
  const backlinks = {};
  for (const id of [...map.keys()].sort()) {
    backlinks[id] = map
      .get(id)
      .sort((a, b) => a.type.localeCompare(b.type) || a.url.localeCompare(b.url));
  }
  return { backlinks };
}

export async function writeBacklinks(registry, file = BACKLINKS_FILE) {
  return writeJsonDeterministic(file, registry);
}

function list(items) {
  return items
    .map((i) => `<li><a href="${escapeHtml(i.url)}">${escapeHtml(i.title)}</a></li>`)
    .join('');
}

/** The page's own `mentions`, as a rail. Empty list renders nothing. */
export function renderReferencedHere(doc, byId) {
  const items = (doc.data.mentions ?? [])
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((e) => ({ url: e.url, title: e.data.display_name }));
  if (items.length === 0) return '';
  return `<aside class="rail rail-referenced" aria-label="Referenced here"><h2>Referenced here</h2><ul>${list(items)}</ul></aside>`;
}

/** Every page that mentions this entry, as a rail. Empty renders nothing. */
export function renderAppearsIn(entryId, backlinks) {
  const items = backlinks.backlinks?.[entryId] ?? [];
  if (items.length === 0) return '';
  return `<aside class="rail rail-appears-in" aria-label="Appears in"><h2>Appears in</h2><ul>${list(items)}</ul></aside>`;
}
