/**
 * stamp.mjs — the build stamp (task 4.13, specs/site).
 *
 * *"The stamp is how deploy success is verified from outside: a fetch of the
 * live site reveals whether a deploy landed, with no hosting-provider API
 * involved. The stamp changes on every build; two builds from different
 * commits MUST carry different stamps."*
 *
 * Two moving parts, and both are needed:
 *   `built_at`  the build's UTC instant — changes on every build, which is
 *               what catches a deploy that never ran.
 *   `commit`    the short hash — changes with the content, which is what
 *               catches a deploy that ran against a stale checkout. A
 *               timestamp alone would advance on a rebuild of the same code
 *               and call it success.
 *
 * `git rev-parse` is spawned with `execFileSync`, not through a shell:
 * `git.exe` gets the arguments verbatim and no MSYS runtime rewrites them
 * (the Windows note in CLAUDE.md — `git show "rev:path"` silently returns
 * zero bytes under Git Bash for exactly this reason).
 *
 * A tree with no git at all still builds: the commit reads `unknown` and the
 * stamp still advances by its timestamp. A build that refused to run outside
 * a repository would be a worse failure than an unknown hash.
 *
 * A third field rides along, and it is not part of the deploy check:
 *   `blocked_scout_streak`  how many scout runs in a row ended `blocked:`
 *                           (make-the-blog-worth-sending task 2.7). See
 *                           `blockedScoutStreak` below for why it exists.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, PUBLIC_DIR, DATA_DIR, writeJsonDeterministic, readJson } from './paths.mjs';

export const STATUS_FILE = join(PUBLIC_DIR, 'status.json');

/**
 * The Desk's append-only job ledger. Read here, never written here.
 *
 * `loop/lib/ledger.mjs` owns this file and takes its path from the loop's own
 * ctx; the site build has no ctx, so the location is repeated rather than
 * imported — importing `loop/` from `lib/` would make the site build depend on
 * the Desk, which is the boundary design D1 draws.
 */
export const LEDGER_FILE = join(DATA_DIR, 'ledger.jsonl');

/** The job type whose streak is witnessed, and the two outcomes that speak. */
export const SCOUT_TYPE = 'scout';
/** `RESULT.md` first line `blocked: nothing cleared the bar` lands here. */
export const SCOUT_BLOCKED_OUTCOME = 'blocked';
/** A scout run that merged filed at least one candidate (specs/loop). */
export const SCOUT_FILED_OUTCOME = 'done';

export function shortCommit(cwd = ROOT) {
  try {
    return execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

export function isDirty(cwd = ROOT) {
  try {
    return (
      execFileSync('git', ['status', '--porcelain'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim().length > 0
    );
  } catch {
    return false;
  }
}

/** How many porcelain entries `dirtyPaths` will name before it stops. */
export const DIRTY_PATHS_CAP = 20;

/**
 * The porcelain entries behind `isDirty`, so a dirty stamp can say WHAT.
 *
 * `dirty: true` on its own is unfalsifiable from the outside: it is one bit,
 * and every explanation for it has to be guessed and then argued about. This
 * is what turns that bit into a measurement — `addictedtoai-4w2`, where the
 * live production stamp read `+dirty` on a deploy built from a clean pushed
 * commit, the first diagnosis (the build dirtying the tree before measuring
 * it) was fixed in `c916a3c`, and the live site went on reporting `dirty:
 * true` anyway. The local tree is verifiably clean at push time, so whatever
 * git sees belongs to the BUILDER's checkout and no amount of reading this
 * repository will reveal it. The next production build says so itself.
 *
 * Entries are returned exactly as `git status --porcelain` prints them, XY
 * status code included, because `?? foo` (the platform dropped a file) and
 * ` M foo` (something rewrote a tracked file) point at completely different
 * causes and the distinction is the whole diagnostic value.
 *
 * Capped, and the truncation is stated rather than silent: this lands in a
 * public file, an unbounded list would be a denial-of-sense rather than a
 * diagnostic, and `DIRTY_PATHS_CAP` entries is far more than the handful this
 * is expected to find. Returns `[]` on any git failure, matching `isDirty`'s
 * judgment that an unreadable git degrades one number and never stops a build.
 */
export function dirtyPaths(cwd = ROOT) {
  try {
    const lines = execFileSync('git', ['status', '--porcelain'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .map((l) => l.replace(/\r$/, ''))
      .filter((l) => l.trim().length > 0);
    if (lines.length <= DIRTY_PATHS_CAP) return lines;
    return [
      ...lines.slice(0, DIRTY_PATHS_CAP),
      `… and ${lines.length - DIRTY_PATHS_CAP} more`,
    ];
  } catch {
    return [];
  }
}

/**
 * Read `data/ledger.jsonl` into an array of lines, and never throw.
 *
 * `loop/lib/ledger.mjs` throws on a malformed line, correctly: the Desk is
 * about to write to that file and must not append to something it cannot
 * parse. This reader is in a different position — it is the *site* build, and
 * a torn last line in the Desk's ledger is not a reason to refuse to publish
 * the site. Same judgment as `shortCommit`'s `unknown`: an unreadable input
 * degrades one number, it does not stop the build.
 *
 * The cost is stated plainly rather than hidden: an unparseable line is
 * skipped, so a corrupt ledger under-reports the streak. `appendLedger`
 * validates every line it writes and the file is append-only, so the only
 * realistic corruption is a torn final write, which costs at most one line of
 * a count that obliges nothing.
 */
export function readLedgerLines(file = LEDGER_FILE) {
  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const out = [];
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      out.push(JSON.parse(t));
    } catch {
      // See above. Not a build failure.
    }
  }
  return out;
}

/**
 * Consecutive trailing `scout` runs that ended `blocked:` (task 2.7,
 * specs/loop "The blocked streak SHALL have a witness").
 *
 * WHAT THIS IS FOR. A `blocked:` scout outcome is a *success* everywhere it is
 * counted — breaker 1 counts only `failed` and `discarded`, and the runner
 * health streak ends on any run that produced output — because "nothing
 * cleared the bar today" is the bar working, not a fault. That is right, and
 * it leaves one condition invisible: if the scout returns nothing for weeks,
 * the blog stays empty while every component truthfully reports success at its
 * own contract and no detector anywhere in the loop notices. This number is
 * the witness for exactly that. It is a fact on a page, not an alarm.
 *
 * WHAT IT DELIBERATELY IS NOT. There is no threshold, no floor, no breaker, no
 * selector rule and no reader of the number back. Nothing in this repository
 * imports it. Observability without obligation, and the absence of a consumer
 * is the feature — a threshold here would reintroduce the cadence pressure the
 * no-floor rule exists to prevent, by making a quiet week look like a defect.
 *
 * THE THREE CASES, and why the third is not the second:
 *   `blocked`   counts. The scout ran, judged, and filed nothing.
 *   `done`      resets to 0. A scout run only merges having filed a candidate
 *               (specs/loop: filing nothing ends `blocked:`), so `done` IS
 *               "a scout run that files a candidate".
 *   anything else — `failed`, `discarded`, `interrupted`, `capacity`,
 *               `abandoned` — neither counts nor resets, and is skipped.
 *               Those lines are evidence that a *run* broke, not that the bar
 *               was or was not cleared, and this counts judgments about the
 *               world. The same treatment breaker 1 gives its non-failures
 *               ("they neither count nor reset", budget.mjs) and the runner
 *               health streak gives a sweep line (health.mjs).
 *
 * No scout history at all reads as 0 — an honest floor, since a loop that has
 * never scouted has no streak to report.
 *
 * @param {Array<{type?: string, outcome?: string}>} ledger
 * @returns {number}
 */
export function blockedScoutStreak(ledger) {
  const scouts = (ledger ?? []).filter((l) => l && l.type === SCOUT_TYPE);
  let n = 0;
  for (let i = scouts.length - 1; i >= 0; i--) {
    const outcome = scouts[i].outcome;
    if (outcome === SCOUT_BLOCKED_OUTCOME) n++;
    else if (outcome === SCOUT_FILED_OUTCOME) break;
    // else: neither counts nor resets — see above.
  }
  return n;
}

/**
 * @param {object} [opts]
 * @param {Array<object>} [opts.ledger]    parsed ledger lines, for tests
 * @param {string} [opts.ledgerFile]       a ledger path other than the default
 * @param {string[]} [opts.dirty_paths]   porcelain entries measured at the same
 *   moment as `opts.dirty`; omitted, they are read now, and only if dirty
 * @returns {{built_at: string, commit: string, dirty: boolean, stamp: string,
 *            blocked_scout_streak: number, dirty_paths: string[]}}
 */
export function buildStamp(opts = {}) {
  const now = opts.now ?? new Date();
  const commit = opts.commit ?? shortCommit(opts.cwd);
  const dirty = opts.dirty ?? isDirty(opts.cwd);
  // Only computed when it has something to explain. A clean build spends no
  // git call here and publishes an empty list, so the common case is unchanged
  // in both cost and content.
  const dirty_paths = dirty ? (opts.dirty_paths ?? dirtyPaths(opts.cwd)) : [];
  const built_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const ledger = opts.ledger ?? readLedgerLines(opts.ledgerFile);
  return {
    built_at,
    commit,
    dirty,
    // The one string a human reads in the footer and a script greps for.
    // `verify-surfaces` asserts the page footer equals this exact value, so
    // nothing below it may join this string.
    stamp: `${built_at} · ${commit}${dirty ? '+dirty' : ''}`,
    // Appended after the four deploy-check fields on purpose: it is not part
    // of the deploy check, nothing reads it, and the fields above keep their
    // names, shapes, values and order.
    blocked_scout_streak: opts.blocked_scout_streak ?? blockedScoutStreak(ledger),
    // Same rule, same reason, one field later: additive, last, and read by
    // nothing. `[]` whenever `dirty` is false, so this says something exactly
    // when `dirty` does (addictedtoai-4w2).
    dirty_paths,
  };
}

/**
 * Write `public/status.json` so it lands at `/status.json` in the export.
 * Not `writeJsonDeterministic`'s usual promise of byte-identity: this file is
 * *supposed* to differ between builds — it is the only file in the tree whose
 * whole job is to change.
 */
export async function writeStatusFile(stamp, file = STATUS_FILE) {
  return writeJsonDeterministic(file, stamp);
}

/**
 * The stamp the *page footer* renders.
 *
 * It reads the file the prebuild step wrote rather than calling `buildStamp()`
 * again, and that is load-bearing: `next build` renders routes in worker
 * processes, each of which would otherwise compute its own `built_at` a few
 * seconds apart. The footer and `/status.json` would then disagree, and the
 * one check that proves a deploy landed would be comparing two different
 * numbers. One file, read by everyone.
 */
export async function readStatusFile(file = STATUS_FILE) {
  return readJson(file, null) ?? null;
}
