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
export const APP_DIR = join(ROOT, 'app');
export const PUBLIC_DIR = join(ROOT, 'public');

/**
 * The five content types this change validates, and where each lives
 * relative to a content root. `deltas/` exists in the tree (design D1) but
 * its schema belongs to task 4.14 and is deliberately not defined here — see
 * the note in `schema.mjs`.
 */
export const CONTENT_TYPES = {
  entry: { dir: 'wiki', glob: 'wiki/**/*.md' },
  learn: { dir: 'learn', glob: 'learn/**/*.md' },
  tutorial: { dir: 'tutorials', glob: 'tutorials/**/*.md' },
  post: { dir: 'blog', glob: 'blog/**/*.md' },
  tool: { dir: 'directory/tools', glob: 'directory/tools/**/*.md' },
};

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
