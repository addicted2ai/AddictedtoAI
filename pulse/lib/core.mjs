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
 *   2. **One notion of "now".** Dates are the **LOCAL** `YYYY-MM-DD` of the
 *      machine that wrote them, matching the rule CLAUDE.md and AGENTS.md
 *      state for the whole repository: "Every date in this repository is the
 *      LOCAL date of the machine that wrote it — `accessed:` on a fact,
 *      `date:` on a review record, `verified_on:` on a tutorial, a delta
 *      end's `date:`. Not UTC." The Pulse used to stamp UTC, so on a machine
 *      west of Greenwich its 18:00 scheduled run wrote tomorrow's date onto
 *      everything, every day (addictedtoai-4ih). The freshness layer measures
 *      *intervals* between these dates, and an interval computed across two
 *      conventions is off by a day for no reason a later reader can
 *      reconstruct — so the engine and the humans must share one frame.
 *
 *      A *wall-clock instant* is a different thing and stays UTC: a
 *      `last_fetch_at` or a source's own published timestamp is an instant,
 *      zone-independent and reproducible anywhere. Only *calendar dates the
 *      Pulse mints for the corpus* are local.
 *
 *      `PULSE_NOW` may override the clock so freshness fixtures can be
 *      written against a fixed day without sleeping or waiting for the
 *      calendar. A bare `YYYY-MM-DD` override therefore pins **local**
 *      midnight of that day: pinning UTC midnight would make `today()`
 *      return the day *before* the one the fixture named on any machine west
 *      of Greenwich.
 *
 * `PULSE_ROOT` overrides the repository root. Tests point it at a fixture
 * tree so the whole pipeline can run end-to-end without touching the real
 * corpus.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
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
    // The gate lease. Written ONLY by the gate harness, which lives outside
    // this repository in a session scratch area and touches this file while a
    // gate run is active. The Pulse only reads it, never writes it. A brake
    // whose writer is invisible reads as dead logic to the next reader, so
    // this note stays where the path is defined.
    lease: join(root, 'GATE_LEASE'),
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

/**
 * How long a gate lease stays live after its last touch.
 *
 * A gate run was measured near seven minutes, with the holder touching the
 * file while it runs. Fifteen minutes is near twice that run: long enough
 * that a slow run with a delayed touch still holds its own lease mid-flight,
 * short enough that a dead holder blocks at most one scheduled firing before
 * the Pulse starts ignoring the stale file loudly. Too long turns a crash
 * into a long outage; too short lets a slow run lose its own brake.
 */
export const LEASE_MAX_AGE_MS = 15 * 60 * 1000;

/**
 * How far ahead of now an mtime may be while still counting as live.
 *
 * A holder writing from a machine a few seconds ahead is doing nothing
 * wrong, and filesystem timestamp granularity plus scheduling jitter can
 * put a healthy lease seconds in the future. Sixty seconds covers that
 * with margin while staying small against the fifteen-minute max (at most
 * ~7% extra refuse at the near end) and tiny against the hours between
 * scheduled firings.
 *
 * Costs, stated at both ends as the brief requires:
 * - Near end (within tolerance): a lease up to 60s in the future still
 *   refuses, so the longest refuse from now is max plus tolerance (16
 *   minutes). That 60s past the max is the price of keeping jitter usable.
 * - Far end (beyond tolerance): a live holder more than 60s ahead has its
 *   lease disregarded at once, risking overlap with that holder. Such skew
 *   is itself a misconfiguration, and the distinct loud line makes it
 *   visible rather than silent.
 */
export const LEASE_FUTURE_TOLERANCE_MS = 60 * 1000;

/**
 * Name the holder from advisory lease text, for the log only. Never throws.
 *
 * The file is expected to carry JSON such as
 * `{"holder": "gate-1", "reason": "verify", "since": "2026-09-10"}`. When it
 * does, the holder field names the run. When it carries plain text instead,
 * the first non-empty line names it, truncated. Empty text, a JSON value
 * with no usable holder field, or anything unparseable as a name yields null
 * — a lease with no name — and the mtime alone still decides. This mirrors
 * how readJsonl skips one bad line in append-only history rather than
 * failing the run on it.
 */
export function holderFromLeaseText(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed === '') return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const key of ['holder', 'job', 'by', 'owner']) {
        const v = parsed[key];
        if (typeof v === 'string' && v.trim() !== '') return v.trim().slice(0, 120);
      }
      // JSON without a usable holder field: advisory only, so no name.
      // Plain-text handling below would print the whole JSON blob as if it
      // were a name; returning null keeps the log honest here.
      if (trimmed.startsWith('{')) return null;
    }
  } catch {
    // Not JSON — fall through to plain-text handling below.
  }
  const first = trimmed
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l !== '');
  if (!first) return null;
  return first.slice(0, 120);
}

/**
 * Read the lease state. The mtime is the authority; contents only name.
 *
 * Returns one of:
 *   - `{state: 'absent'}` — no file, the ordinary case, proceed.
 *   - `{state: 'fresh', ageMs, holder}` — live lease, the Pulse refuses.
 *   - `{state: 'stale', ageMs, holder}` — past the max age, proceed loudly.
 *   - `{state: 'future', ageMs, holder}` — mtime ahead of now beyond
 *     tolerance, proceed loudly on clock skew. A skew this large would
 *     otherwise refuse for the skew plus the max; disregarding it bounds
 *     every refuse to at most max plus tolerance from now.
 *   - `{state: 'stat-failed', error}` — the mtime itself could not be read,
 *     proceed loudly and never refuse. A timing read that fails once will
 *     usually fail again, so refusing on it would refuse forever.
 *
 * A past mtime always ages out on its own: for any fixed mtime at or behind
 * now, age grows with wall time until it passes the max. A future mtime
 * within tolerance is treated as live (it refuses, costing at most tolerance
 * past the max); a future mtime beyond tolerance is disregarded at once, so
 * no fixed future mtime can refuse past max plus tolerance, and no past
 * mtime can refuse past the max. Only a holder that keeps touching the file
 * keeps it fresh, which is a live holder rather than a dead one. Boundaries
 * are strict: age past the max is stale; age at or under the max and at or
 * above negative tolerance is fresh; age below negative tolerance is future.
 *
 * `opts` exists only so tests can pin the clock and fail the timing read on
 * purpose; no caller in `pulse/` passes it.
 */
export function checkLease(root, opts = {}) {
  const leasePath = paths(root).lease;
  const nowMs = typeof opts.nowMs === 'number' ? opts.nowMs : Date.now();
  const doStat = opts.statSyncImpl ?? statSync;
  const doRead = opts.readFileSyncImpl ?? readFileSync;
  let stat;
  try {
    stat = doStat(leasePath);
  } catch (err) {
    const code = err?.code;
    if (code === 'ENOENT') return { state: 'absent', path: leasePath };
    return { state: 'stat-failed', path: leasePath, error: err?.message ?? String(err) };
  }
  const mtimeMs = stat?.mtimeMs;
  if (typeof mtimeMs !== 'number' || !Number.isFinite(mtimeMs)) {
    return { state: 'stat-failed', path: leasePath, error: 'unreadable mtime' };
  }
  let holder = null;
  try {
    holder = holderFromLeaseText(doRead(leasePath, 'utf8'));
  } catch {
    holder = null;
  }
  const ageMs = nowMs - mtimeMs;
  if (ageMs < -LEASE_FUTURE_TOLERANCE_MS) return { state: 'future', path: leasePath, ageMs, holder };
  if (ageMs > LEASE_MAX_AGE_MS) return { state: 'stale', path: leasePath, ageMs, holder };
  return { state: 'fresh', path: leasePath, ageMs, holder };
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

/** A bare `YYYY-MM-DD`, or null. Anything else (a datetime) is not one. */
const BARE_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Days since the Unix epoch for a calendar date, as three numbers.
 *
 * `Date.UTC` is used purely as integer calendar arithmetic here — it never
 * means "this value is UTC". Going through it rather than subtracting two
 * instants is what makes the count DST-proof: a local day containing a
 * clock change is 23 or 25 hours long, and dividing elapsed milliseconds by
 * 86400000 would silently miscount it.
 */
function dayNumber(y, m, d) {
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

/** The day number of the local calendar date a Date instance falls on. */
function localDayNumber(d) {
  return dayNumber(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * The run's "now". `PULSE_NOW` (an ISO date or datetime) overrides the clock.
 *
 * A bare date pins **local** midnight of that day, so `today()` returns the
 * day the fixture named. A datetime is passed through to `Date` untouched and
 * keeps whatever zone it carries — it is an instant, not a calendar day.
 */
export function now() {
  const override = process.env.PULSE_NOW;
  if (override) {
    const bare = BARE_DATE.exec(override);
    const d = bare ? new Date(+bare[1], +bare[2] - 1, +bare[3]) : new Date(override);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * LOCAL `YYYY-MM-DD` for a Date (default: the run's now).
 *
 * Local, not UTC — see rule 2 at the top of this file. Every date the Pulse
 * writes into the corpus goes through here, so this one function is what puts
 * the engine in the same calendar frame as every human and agent that authors
 * the corpus by hand.
 */
export function today(d = now()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Whole calendar days from `iso` (a date or datetime string) until `to`.
 * Null if unparseable.
 *
 * A *calendar-day* difference, not a count of elapsed 24-hour periods, and
 * that distinction is the whole point: the values on both sides are local
 * calendar dates (`accessed:`, `verified_on:`, `last_checked`), so the answer
 * has to be "how many local days apart are these two days". Parsing a bare
 * date as UTC midnight and subtracting instants — what this did before —
 * returned 1 for a fact accessed *today* any time after 18:00 local on a
 * UTC-6 machine, which is how a same-day fact read as a day stale every
 * evening (addictedtoai-4ih).
 *
 * A datetime argument is resolved to the local calendar day it falls on,
 * which is the only reading that can be compared against a bare local date.
 */
export function daysSince(iso, to = now()) {
  if (!iso) return null;
  const text = String(iso);
  const bare = BARE_DATE.exec(text);
  let thenDay;
  if (bare) {
    thenDay = dayNumber(+bare[1], +bare[2], +bare[3]);
  } else {
    const then = new Date(text);
    if (Number.isNaN(then.getTime())) return null;
    thenDay = localDayNumber(then);
  }
  return localDayNumber(to) - thenDay;
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
