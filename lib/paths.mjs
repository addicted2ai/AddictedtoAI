/**
 * paths.mjs — where things live, and the only place that knows.
 *
 * Every other module in `lib/` asks this module for a location rather than
 * building one, so the content root can be swapped for a fixture root in a
 * test without any module reaching for `process.cwd()` behind the test's
 * back. That swap is the whole reason this file exists: the fixture corpora
 * under `lib/fixtures/` are loaded by exactly the same code that loads
 * `content/`, so a fixture proves something about the real pipeline.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

/** Repository root — `lib/` lives directly under it. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const CONTENT_DIR = join(ROOT, 'content');
export const DATA_DIR = join(ROOT, 'data');
export const DERIVED_DIR = join(DATA_DIR, 'derived');
/** Review verdict records (specs/review). Read by the build's indexability join. */
export const REVIEWS_DIR = join(DATA_DIR, 'reviews');
export const APP_DIR = join(ROOT, 'app');
export const PUBLIC_DIR = join(ROOT, 'public');

/**
 * The learn surface's curriculum of record (specs/education-static).
 *
 * Outside `openspec/specs/` deliberately, and outside any one change's
 * directory: the requirement that names it obliges amending it, and archiving
 * moves a change's own files into `openspec/changes/archive/`, so a permanent
 * `SHALL NOT` anchored to one would quietly start pointing into an archive.
 */
export const CURRICULUM_FILE = join(ROOT, 'openspec', 'curriculum', 'learn.md');

/**
 * The seven content types this build validates, and where each lives relative
 * to a content root. `delta` joined the list in task 4.14 (the Impossible →
 * Routine showpiece); `claim` joined it in `separate-a-claim-from-a-fact`.
 * Every schema is in `schema.mjs`.
 *
 * `routed` SAYS WHETHER THE TYPE MINTS A PAGE, and it exists because `claim`
 * is the first type that does not. A vendor claim is not a document: *"A claim
 * record SHALL NOT mint a route of its own. Its rendered home is its subject's
 * entry page, at a stable fragment, and it SHALL NOT appear in the sitemap or
 * the search index as a document in its own right."* (specs/wiki).
 *
 * The flag rather than a hard-coded `type !== 'claim'` at each surface: there
 * were four surfaces to carve out (the sitemap, the search index, the route
 * table and `llms.txt`), and four literal comparisons are four places for the
 * NEXT route-less type to be forgotten. `corpus.documents` (lib/corpus.mjs) is
 * the list every route-minting surface walks; `corpus.all` still holds
 * everything, because validation, classification and the review join apply to
 * a claim exactly as they apply to a page.
 */
export const CONTENT_TYPES = {
  entry: { dir: 'wiki', glob: 'wiki/**/*.md', routed: true },
  learn: { dir: 'learn', glob: 'learn/**/*.md', routed: true },
  tutorial: { dir: 'tutorials', glob: 'tutorials/**/*.md', routed: true },
  post: { dir: 'blog', glob: 'blog/**/*.md', routed: true },
  tool: { dir: 'directory/tools', glob: 'directory/tools/**/*.md', routed: true },
  delta: { dir: 'deltas', glob: 'deltas/**/*.md', routed: true },
  claim: { dir: 'claims', glob: 'claims/**/*.md', routed: false },
};

/** The content types that mint a page of their own. */
export const ROUTED_CONTENT_TYPES = Object.freeze(
  Object.keys(CONTENT_TYPES).filter((t) => CONTENT_TYPES[t].routed),
);

/** Repo-relative POSIX path — the form every diagnostic and derived file uses. */
export function relPath(abs, from = ROOT) {
  return relative(from, abs).split(sep).join('/');
}

export function toPosix(p) {
  return p.split(sep).join('/');
}

export async function readJson(file, fallback = undefined) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (err) {
    if (fallback !== undefined && (err.code === 'ENOENT' || err instanceof SyntaxError)) {
      return fallback;
    }
    throw err;
  }
}

/**
 * Write JSON deterministically: 2-space indent, LF, one trailing newline, and
 * never a timestamp inside the payload. Byte-identity between a regenerated
 * derived file and its committed blob is a check this change makes more than
 * once (task 3.5), and `.gitattributes` normalizes to LF for the same reason.
 */
export async function writeJsonDeterministic(file, value) {
  await mkdir(dirname(file), { recursive: true });
  const text = JSON.stringify(value, null, 2).replace(/\r\n/g, '\n') + '\n';
  await writeFile(file, text, 'utf8');
  return text;
}
