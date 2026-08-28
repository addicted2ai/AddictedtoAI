/**
 * core.mjs — paths, deterministic JSON, hashing, dates, logging.
 *
 * Everything in `pulse/` is deterministic and model-free (specs/pulse). Two
 * rules this file exists to enforce:
 *
 *   1. **Deterministic bytes.** Every file the Pulse writes goes through
 *      `stableStringify`, which sorts object keys recursively, indents with
 *      two spaces, uses LF, and ends with a single newline. `.gitattributes`
 *      enforces LF in the repo; this makes the byte-identity property of
 *      `data/derived/queue.json` (task 3.5) mean something.
 *   2. **One notion of "now".** Dates are UTC `YYYY-MM-DD`. `PULSE_NOW` may
 *      override the clock so freshness fixtures can be written against a
 *      fixed day without sleeping or waiting for the calendar.
 *
 * `PULSE_ROOT` overrides the repository root. Tests point it at a fixture
 * tree so the whole pipeline can run end-to-end without touching the real
 * corpus.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repository root: `PULSE_ROOT` if set, else the directory above `pulse/`. */
export function repoRoot() {
  if (process.env.PULSE_ROOT) return resolve(process.env.PULSE_ROOT);
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
}

/** Every path the Pulse reads or writes, in one place. */
export function paths(root = repoRoot()) {
  return {
    root,
    stop: join(root, 'STOP'),
    hold: join(root, 'HOLD.md'),
    config: join(root, 'data', 'config.json'),
    registry: join(root, 'data', 'sources', 'registry.json'),
    sourcesDir: join(root, 'data', 'sources'),
    changes: join(root, 'data', 'changes.jsonl'),
    linkcheck: join(root, 'data', 'linkcheck.json'),
    derived: join(root, 'data', 'derived'),
    content: join(root, 'content'),
    wiki: join(root, 'content', 'wiki'),
    publicDir: join(root, 'public'),
  };
}

/** Per-source directory and its three files. */
export function sourcePaths(root, id) {
  const dir = join(root, 'data', 'sources', id);
  return {
    dir,
    latest: join(dir, 'latest.json'),
    previous: join(dir, 'previous.json'),
    state: join(dir, 'state.json'),
  };
}

/** Recursively sort object keys so two equal values always stringify alike. */
function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortValue(value[key]);
    return out;
  }
  return value;
}

/** Deterministic JSON text: sorted keys, 2-space indent, LF, trailing newline. */
export function stableStringify(value) {
  return JSON.stringify(sortValue(value), null, 2).replace(/\r\n/g, '\n') + '\n';
}

export function readJson(file, fallback = undefined) {
  if (!existsSync(file)) return fallback;
  const text = readFileSync(file, 'utf8');
  if (text.trim() === '') return fallback;
  return JSON.parse(text);
}

export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, stableStringify(value), 'utf8');
}

/** Read a JSONL file as an array of objects; blank and unparseable lines skipped. */
export function readJsonl(file) {
  if (!existsSync(file)) return [];
  const out = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    try {
      out.push(JSON.parse(trimmed));
    } catch {
      // A malformed line is skipped rather than fatal: changes.jsonl is
      // append-only history and one bad line must not stop the engine.
    }
  }
  return out;
}

/**
 * Append objects to a JSONL file. Each object is written with sorted keys on
 * one LF-terminated line, so the file is diffable and reproducible.
 */
export function appendJsonl(file, objects) {
  if (objects.length === 0) return 0;
  mkdirSync(dirname(file), { recursive: true });
  const text = objects.map((o) => JSON.stringify(sortValue(o))).join('\n') + '\n';
  const existing = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const needsNewline = existing.length > 0 && !existing.endsWith('\n');
  writeFileSync(file, existing + (needsNewline ? '\n' : '') + text, 'utf8');
  return objects.length;
}

export function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** The run's "now". `PULSE_NOW` (an ISO date or datetime) overrides the clock. */
export function now() {
  const override = process.env.PULSE_NOW;
  if (override) {
    const d = new Date(override.length === 10 ? `${override}T00:00:00Z` : override);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** UTC `YYYY-MM-DD` for a Date (default: the run's now). */
export function today(d = now()) {
  return d.toISOString().slice(0, 10);
}

/** Whole days from `iso` (a date or datetime string) until `to`. Null if unparseable. */
export function daysSince(iso, to = now()) {
  if (!iso) return null;
  const then = new Date(String(iso).length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(then.getTime())) return null;
  return Math.floor((to.getTime() - then.getTime()) / 86400000);
}

/** Repo-relative POSIX path — what goes into derived files, never an absolute path. */
export function relPosix(root, file) {
  return relative(root, file).split(sep).join('/');
}

/** Read `a.b.c` out of a nested object. Returns undefined on any missing hop. */
export function getPath(object, path) {
  if (!path) return undefined;
  let cur = object;
  for (const part of String(path).split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[part];
  }
  return cur;
}

/** The Pulse's one logger. Steps print a line each; nothing is interactive. */
export function makeLogger(prefix = 'pulse') {
  return {
    step: (name, detail = '') => process.stdout.write(`${prefix}: ${name}${detail ? ' — ' + detail : ''}\n`),
    warn: (msg) => process.stdout.write(`${prefix}: WARN ${msg}\n`),
    error: (msg) => process.stderr.write(`${prefix}: ERROR ${msg}\n`),
  };
}
