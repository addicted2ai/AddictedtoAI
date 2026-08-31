/**
 * publish.mjs — the shared commit-and-publish step (specs/pulse, task 3.9).
 *
 * "A local rebuild is not publication." This is the one place in the codebase
 * that pushes, and it is shared: `pulse/run.mjs` calls it at the end of its
 * pipeline and `loop/run.mjs` calls it after a merge (design D2), so there is
 * exactly one implementation of deploy and exactly one gate on it.
 *
 * ## COMMITTING IS NOT PUBLISHING — the two phases, and why they were one
 *
 * This step used to return on the first line of `publish: false`, printing
 * *"disabled … nothing committed, nothing pushed"*. But the Pulse **writes**
 * its state into the working tree before it gets here — `data/changes.jsonl`,
 * the snapshots under `data/sources/`, `data/linkcheck.json`, `data/derived/`,
 * and the front matter a lifecycle append touches — and this step is the only
 * thing that commits any of it. So with publishing held down, a whole run's
 * state stayed uncommitted.
 *
 * MEASURED, 2026-08-30. A Pulse run appended a 91st line to
 * `data/changes.jsonl` and left it there. The derived queue was computed from
 * that *working tree* and duly offered an `interpret` job for the new line. The
 * Desk branches jobs from committed `main` — 90 lines — so the executor could
 * not find the record it was told to annotate and correctly reported
 * `blocked: the change record this job annotates is not on this branch`. 15.47
 * model-minutes, no output. `git log -S … -- data/changes.jsonl` returned
 * nothing, proving the line had never been committed.
 *
 * The conflation is the defect. A run's state belongs in git the moment it is
 * computed; whether the *remote* hears about it is a separate decision, and it
 * is the only one `publish` governs. It bites exactly when someone follows
 * CLAUDE.md's own advice to hold publishing down while a larger change is in
 * flight.
 *
 * So the step is two phases:
 *
 *   1. **COMMIT** — stage and commit what this run can attribute to itself.
 *      Runs whatever `data/config.json` says, and whatever `HOLD.md` says.
 *      Only for a caller that declared `owned`: an undeclared caller cannot
 *      say what is its own, and a wholesale `git add data content public` on
 *      every run — publishing or not — would sweep up every dirty file in the
 *      tree (see "What gets staged" below). Undeclared callers therefore keep
 *      the old behaviour exactly: they commit only on a real publish.
 *   2. **PUBLISH** — push `main` and poll the live `/status.json` build stamp.
 *      Gated by `publish`, by `HOLD.md`, and by having something to say.
 *
 * `HOLD.md` still suspends phase 2 completely and nothing here removes it. It
 * does not suspend phase 1, which is what the hold file itself has always said:
 * *"The Pulse keeps running; only its deploy step is suspended."*
 *
 * The structural guard is unchanged and is load-bearing for both phases:
 * `pulse/run.mjs` runs this step **after** the site rebuild, so a run that
 * produced content the build rejects neither commits nor publishes it.
 *
 * ## The gate
 *
 * `data/config.json`'s `publish` flag decides whether anything reaches the
 * remote, and nothing else does:
 *
 *   - `publish: false` — the whole build phase, and any time the maintainer
 *     wants local-only mode. Phase 2 prints **one** line and does nothing else.
 *   - `publish: true` — push `main`, then poll the live `/status.json` build
 *     stamp for up to 10 minutes. A stamp that does not advance is a deploy
 *     failure, not a shrug: `HOLD.md` is written naming it (breaker 2 in
 *     specs/loop) and no further publish is attempted until the hold clears.
 *
 * Detection is a plain HTTPS fetch of the live page. No hosting-provider API,
 * no GitHub API (design D4).
 *
 * ## Why `--assume-publish` only works with `--dry-run`
 *
 * `data/config.json` is a reserved path (specs/loop breaker 4) — flipping the
 * real flag to exercise the true path is not something this program may do.
 * `--assume-publish` lets the true path be *printed* without being run. It is
 * refused outright unless `--dry-run` is also set, so no combination of flags
 * can reach `git push` while the config says `false`. That refusal is a hard
 * error, not a warning.
 *
 * ## What gets staged, and why `add data content public` was not good enough
 *
 * `addictedtoai-ps3`, observed 2026-08-29: the step staged `data content
 * public` wholesale, which it had to, because publishing data and content is
 * its job — but a wholesale `add` cannot tell *this run derived this* from
 * *somebody was halfway through editing this when the timer fired*. The
 * scheduled Pulse duly swept an uncommitted `data/launch.json` edit into its
 * own commit `998ee0a` and pushed it live. The bound on the harm is worth
 * keeping in mind: publish runs **after** the site rebuild, so work that does
 * not build cannot be published. The gate catches broken; it cannot catch
 * unfinished.
 *
 * The step therefore stages by **attribution** rather than by directory,
 * through the `owned` option — repo-relative paths the calling run says it
 * wrote (its mints, its timeline appends). Two things are owned without being
 * declared, because no other actor writes them (`isEngineWrite`): the Pulse's
 * own state and derived tree, and `public/`, which is entirely build output.
 * Everything else that is dirty is somebody else's, and:
 *
 *   - a foreign path is never staged, so it cannot be published; and
 *   - a foreign path under `content/` **refuses the publish outright** and
 *     says which files (option (b) in `addictedtoai-ps3`, kept as the belt to
 *     attribution's braces). Prose that builds but is unfinished is the case
 *     the build gate cannot catch, so the step errs toward not publishing.
 *
 * **When `owned` is not passed at all the step keeps the old wholesale
 * behaviour and says so on every run.** That is deliberate rather than
 * timid: attribution is only as good as the caller's declaration, and a
 * default that silently narrowed what an undeclared caller publishes would
 * quietly stop publishing the Pulse's own mints. The line names the issue so
 * the gap is visible in the log of every run that still has it.
 *
 * That distinction now decides phase 1 as well, and the asymmetry is the
 * point: an undeclared caller gets wholesale staging **only on a run that is
 * publishing anyway**, which is exactly the blast radius it has always had.
 * Extending an unattributable `git add data content public` to every
 * non-publishing run would be a new hazard invented while fixing an old one.
 * The Desk is the undeclared caller, and it loses nothing — `loop/run.mjs`
 * commits its own records by exact path before it ever calls this step.
 *
 * Nothing here removes `HOLD.md`. Clearing a hold is the maintainer's, and
 * removing the file is itself a reserved-path violation (specs/loop).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { paths, readJson, today } from './core.mjs';

const DEFAULT_SITE = 'https://www.addictedtoai.net';
const POLL_BUDGET_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 20000;

/** The three directories a publish has ever staged from. */
export const STAGE_DIRS = ['data', 'content', 'public'];

export function siteUrl() {
  return (process.env.SITE_URL || DEFAULT_SITE).replace(/\/+$/, '');
}

export function statusUrl() {
  return `${siteUrl()}/status.json`;
}

/**
 * There is deliberately no reader of the *local* build stamp here.
 *
 * `pulse/run.mjs` rebuilds the site at step 8 and publishes at step 9, so
 * `out/status.json` is written **before** the commit exists and carries the
 * pre-commit HEAD. Reading `expected` from it made the step push commit N+1
 * and then wait for the live site to serve commit N — which, from the second
 * run onward, it already was, because that is what the previous run deployed.
 * The check passed on the first poll, before the deploy had even started, and
 * confirmed the previous run's deploy forever (`addictedtoai-1ml`).
 *
 * The commit that will be served is knowable at exactly one moment: after the
 * commit is made. That is where `expected` is now read from, and a local file
 * written earlier in the same process is not a substitute for it.
 */

function git(root, args, opts = {}) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', ...opts }).trim();
}

/**
 * Is this repo-relative path one an *engine* wrote, whoever is calling?
 *
 * Not a guess and not a convenience: each entry is a path with exactly one
 * writer in this repository, checked against the writers rather than against
 * intuition.
 *
 *   - `data/changes.jsonl`   — `pulse/lib/diff.mjs`, append-only
 *   - `data/linkcheck.json`  — `pulse/lib/linkcheck.mjs`
 *   - `data/derived/**`      — `pulse/lib/{derive,freshness,queue}.mjs`, and a
 *                              pure function of state, recomputed every run
 *   - `data/sources/<id>/*`  — `pulse/lib/{sources,mint}.mjs` (snapshots,
 *                              state, minted.json). Deliberately *not*
 *                              `data/sources/registry.json`, which sits one
 *                              level up and is authored by hand.
 *   - `public/**`            — build output: `lib/site-assets.mjs` writes the
 *                              catalog, dataset, feeds and search index, and
 *                              `lib/stamp.mjs` writes `status.json`. Verified
 *                              2026-08-29 by listing the directory: every file
 *                              in it is generated. A hand-authored asset
 *                              landing here would need excluding.
 *
 * Everything else under `data/` is somebody's state or judgment —
 * `launch.json` (the file `addictedtoai-ps3` caught being swept up),
 * `ledger.jsonl`, `reviews/`, `proposals/`, `conformance.json`, and the
 * reserved `config.json` — and no engine's to publish on another's behalf.
 */
export function isEngineWrite(rel) {
  if (rel === 'data/changes.jsonl' || rel === 'data/linkcheck.json') return true;
  if (rel.startsWith('data/derived/')) return true;
  if (/^data\/sources\/[^/]+\/[^/]+$/.test(rel)) return true;
  if (rel.startsWith('public/')) return true;
  return false;
}

/** Normalise a caller's `owned` list to repo-relative POSIX paths. `null` means "undeclared". */
export function normalizeOwned(owned, root) {
  if (owned == null) return null;
  const out = [];
  for (const raw of owned) {
    if (typeof raw !== 'string' || raw === '') continue;
    let p = raw.replace(/\\/g, '/').replace(/^\.\//, '');
    const rootPosix = String(root ?? '').replace(/\\/g, '/').replace(/\/+$/, '');
    if (rootPosix && p.toLowerCase().startsWith(rootPosix.toLowerCase() + '/')) p = p.slice(rootPosix.length + 1);
    out.push(p);
  }
  return out;
}

/** Is `root` a git repository at all? Answered without reading its state. */
function isRepository(root) {
  try {
    execFileSync('git', ['-C', root, 'rev-parse', '--git-dir'], { stdio: ['ignore', 'ignore', 'ignore'] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Every path git considers dirty under the staging directories.
 *
 * `--porcelain=v1 -z` because a path with a space, a quote or a non-ASCII byte
 * in it is a path like any other and the non-`-z` format quotes and escapes
 * them; `-uall` because a minted stub is an untracked *file*, and the default
 * `--untracked-files=normal` would report its directory instead. A rename
 * emits the new path followed by the original as a separate NUL field, and
 * both are returned: staging only the new one leaves the deletion behind.
 *
 * Returns `null` — "cannot tell" — rather than throwing when `root` is not a
 * git repository, which is the case in several fixture roots.
 *
 * ## Why a failed `git status` is retried once inside a real repository
 *
 * "Not a repository" is a permanent, correct answer; "the git invocation
 * failed" is not the same thing, and this function used to return the same
 * `null` for both. That conflation cost nothing while it only ran on a
 * publishing run — the run simply did not publish and the next one would. It
 * costs a whole run's state now that it decides whether the run COMMITS.
 * Observed 2026-08-31: one `npm test` under heavy parallel load left a fixture
 * uncommitted here, and the same file passed alone five times over. So a
 * failure inside a directory that IS a repository is treated as transient and
 * tried once more; a second failure still answers "cannot tell", and the caller
 * still errs toward doing nothing.
 */
export function dirtyPaths(root, dirs = STAGE_DIRS) {
  const present = dirs.filter((d) => existsSync(`${root}/${d}`));
  if (present.length === 0) return [];
  // NOT through `git()`: that helper trims, and porcelain's first status
  // column is a space for "modified in the worktree only", so trimming eats
  // one character off the first record's path. Caught by
  // `pulse/tests/publish.test.mjs` before it ever ran for real.
  const status = () =>
    execFileSync('git', ['-C', root, 'status', '--porcelain=v1', '-z', '-uall', '--', ...present], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  let out;
  try {
    out = status();
  } catch {
    if (!isRepository(root)) return null;
    try {
      out = status();
    } catch {
      return null;
    }
  }
  const fields = out.split('\0');
  const found = [];
  for (let i = 0; i < fields.length; i++) {
    const entry = fields[i];
    if (entry.length < 4) continue;
    const x = entry[0];
    const y = entry[1];
    if (x === 'R' || x === 'C' || y === 'R' || y === 'C') {
      const from = fields[++i];
      if (from) found.push(from);
    }
    found.push(entry.slice(3));
  }
  return found;
}

/**
 * Split the dirty working tree into what this run may publish and what it may not.
 *
 * @param {string} root
 * @param {string[]} declared repo-relative paths the run says it wrote
 * @returns {{known: boolean, own: string[], foreign: string[], foreignContent: string[]}}
 */
export function classifyWorkingTree(root, declared = []) {
  const dirty = dirtyPaths(root);
  if (dirty === null) return { known: false, own: [], foreign: [], foreignContent: [] };
  const claimed = new Set(declared);
  const own = [];
  const foreign = [];
  for (const rel of dirty) {
    const mine =
      isEngineWrite(rel) ||
      claimed.has(rel) ||
      declared.some((d) => d.endsWith('/') && rel.startsWith(d));
    (mine ? own : foreign).push(rel);
  }
  return { known: true, own, foreign, foreignContent: foreign.filter((p) => p.startsWith('content/')) };
}

/**
 * Does this checkout hold commits `origin/main` does not?
 *
 * Asked only so that a run with nothing of its own to stage does not push
 * anyway. A publish that follows a merge (the Desk's case) has nothing in the
 * working tree and everything in a commit, and refusing *that* push would
 * strand reviewed work; a Pulse run that derived nothing and is level with the
 * remote has nothing to say and should say so instead of pushing. An
 * unreadable or absent `origin/main` counts as "nothing to publish" — it is
 * not evidence of anything waiting, and the cheaper mistake is the one that
 * does not push.
 */
export function aheadOfOrigin(root) {
  try {
    return Number(git(root, ['rev-list', '--count', 'origin/main..HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] })) > 0;
  } catch {
    return false;
  }
}

async function fetchLiveStamp() {
  try {
    const res = await fetch(statusUrl(), { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    return { ok: true, stamp: await res.json() };
  } catch (err) {
    return { ok: false, detail: `${err.name}: ${err.message}` };
  }
}

function stampId(stamp) {
  if (!stamp) return null;
  return stamp.commit ?? stamp.sha ?? stamp.build ?? stamp.built_at ?? JSON.stringify(stamp);
}

/**
 * Does a live build stamp identify the commit this run pushed?
 *
 * The stamp carries `git rev-parse --short=12 HEAD` from the *host's* checkout
 * (`lib/stamp.mjs`), so it is an abbreviation of the SHA read here in full. It
 * is compared as a hex prefix of that exact SHA rather than by string equality
 * on two abbreviations, so a host that abbreviated to a different length still
 * matches the commit it actually built, and nothing else does.
 *
 * Everything that is not a hex abbreviation of that one commit fails: another
 * commit, `unknown` from a builder with no git, a bare timestamp, a serialised
 * blob. There is no "the stamp changed, so something must have deployed"
 * branch — a fallback that passes on any change is what let a wrong `expected`
 * value go unnoticed for the life of the mechanism.
 *
 * The `+dirty` suffix never reaches here: `stampId` reads the `commit` field,
 * not the rendered `stamp` string. That matters, because the host's build IS
 * dirty — prebuild regenerates date-dependent derived data — and that flag is
 * telling the truth and is not suppressed.
 */
export function stampMatchesCommit(id, sha) {
  if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) return false;
  if (typeof id !== 'string') return false;
  const seen = id.trim().toLowerCase();
  // Seven is git's own floor for an abbreviated hash; below it a "prefix" is
  // not evidence of identity.
  if (!/^[0-9a-f]{7,40}$/.test(seen)) return false;
  return sha.startsWith(seen);
}

function writeHold(root, reason) {
  const file = paths(root).hold;
  const text = [
    '# HOLD',
    '',
    `Written by the publish step on ${today()}.`,
    '',
    reason,
    '',
    'Breaker 2 (specs/loop): the published site failed to build or deploy.',
    'The Desk is stopped and no further publish is attempted until this file',
    'is removed by the maintainer. The Pulse keeps running; only its deploy',
    'step is suspended.',
    '',
  ].join('\n');
  writeFileSync(file, text, 'utf8');
  return file;
}

/**
 * PHASE 1 — commit exactly the paths this run attributed to itself.
 *
 * Separated from `publishStep` because it is separately governed: this runs
 * whether or not the run is publishing, and its failure is reported rather
 * than thrown. Before the split, `git commit` could only ever run on a
 * publishing run, so a `throw` here reached a caller that was already deep in
 * a push; now it can run on every scheduled Pulse, and a repository that
 * refuses a commit (an unconfigured identity, a hook) must leave the run's
 * state in the working tree rather than take the whole Pulse down with it.
 *
 * @returns {{attempted: boolean, committed: boolean, paths: string[], reason: string, sha?: string, error?: string}}
 */
function commitOwned(root, ownedPaths, message, say) {
  if (ownedPaths.length === 0) {
    say('commit', "nothing of this run's own to commit — no path this run wrote is dirty");
    return { attempted: true, committed: false, paths: [], reason: 'nothing-owned' };
  }
  // `--pathspec-from-file` rather than argv: an exact-path stage can be
  // hundreds of entries long, and NUL separation is the only encoding that
  // survives every filename git will hand back.
  const spec = ownedPaths.join('\0');
  try {
    // `add` first, because a minted stub is untracked and `commit -- <path>`
    // refuses a pathspec git has never seen.
    git(root, ['add', '--pathspec-from-file=-', '--pathspec-file-nul'], { input: spec });
    // Then commit with the SAME pathspec rather than committing the index.
    // Several agents share this working tree; something else may have left
    // changes staged, and a bare `git commit` would commit them. A pathspec
    // commit takes only these paths and leaves anyone else's index entries
    // exactly where they were.
    git(root, ['commit', '-m', message, '--pathspec-from-file=-', '--pathspec-file-nul'], { input: spec });
  } catch (err) {
    const first = String(err?.message ?? err).split('\n')[0];
    say('commit', `git refused this run's commit (${first}) — the state stays in the working tree, uncommitted`);
    return { attempted: true, committed: false, paths: ownedPaths, reason: 'commit-failed', error: first };
  }
  const sha = git(root, ['rev-parse', 'HEAD']).toLowerCase();
  say(
    'commit',
    `committed ${ownedPaths.length} path(s) this run wrote as ${sha.slice(0, 12)}: ` +
      `${ownedPaths.slice(0, 8).join(', ')}${ownedPaths.length > 8 ? ', …' : ''}`,
  );
  return { attempted: true, committed: true, paths: ownedPaths, reason: 'committed', sha };
}

/**
 * Run the commit-and-publish step.
 *
 * @param {string} root repository root
 * @param {object} opts
 * @param {boolean} opts.dryRun   print the commands and the poll target, execute nothing
 * @param {boolean} opts.assumePublish  treat `publish` as true — refused unless dryRun
 * @param {object}  opts.log      logger from core.makeLogger
 * @param {string[]|null} opts.owned  repo-relative paths THIS run wrote. Passing
 *   it switches the step from staging `data content public` wholesale to
 *   staging only what the run can attribute to itself, and arms the refusal on
 *   foreign uncommitted `content/` (addictedtoai-ps3). It also arms phase 1:
 *   a declaring caller has its state committed on every run, publishing or
 *   not. `null` — the default — means the caller declared nothing and gets the
 *   old wholesale behaviour, announced on every run, on publishing runs only.
 * @param {number}  opts.pollBudgetMs    how long to wait for the deploy (tests only)
 * @param {number}  opts.pollIntervalMs  how often to re-fetch (tests only)
 */
export async function publishStep(
  root,
  {
    dryRun = false,
    assumePublish = false,
    log,
    owned = null,
    // The poll window is a constant for every real run. It is injectable only
    // so a test can exercise the deploy-did-not-land path in milliseconds
    // instead of ten minutes; no caller in `pulse/` or `loop/` passes either.
    pollBudgetMs = POLL_BUDGET_MS,
    pollIntervalMs = POLL_INTERVAL_MS,
  } = {},
) {
  const p = paths(root);
  const say = log?.step ?? ((n, d) => process.stdout.write(`pulse: ${n}${d ? ' — ' + d : ''}\n`));
  // The loop's adapter supplies a logger with `step` and nothing else, so warn
  // falls back rather than assuming core.makeLogger's shape.
  const warn = log?.warn ?? ((m) => process.stdout.write(`pulse: WARN ${m}\n`));

  if (assumePublish && !dryRun) {
    throw new Error(
      '--assume-publish is only honored together with --dry-run. The publish flag lives in data/config.json (a reserved path); it is never overridden for a real run.',
    );
  }

  const config = readJson(p.config, null);
  if (!config) {
    say('publish', `no data/config.json at ${p.config} — nothing published`);
    return { published: false, reason: 'no-config' };
  }

  const configSaysPublish = config.publish === true;
  const effective = configSaysPublish || (assumePublish && dryRun);
  const held = existsSync(p.hold);
  const message = `pulse: ${today()} data and content update`;

  // =========================================================================
  // PHASE 1 — THE COMMIT. Governed by attribution, not by `publish` or a hold.
  //
  // Only a caller that declared `owned` reaches it: see the header. An
  // undeclared caller falls through with `ownedPaths === null` and stages
  // wholesale inside phase 2, exactly as it always has.
  // =========================================================================
  const declared = normalizeOwned(owned, root);
  /** Exact paths this run may stage; null while the caller has declared nothing. */
  let ownedPaths = null;
  /** The pathspecs handed to `git add`: whole directories, or exact paths. */
  let stagePaths;
  /** What phase 1 did. `attempted: false` for an undeclared caller. */
  let commit = { attempted: false, committed: false, paths: [], reason: 'undeclared' };
  /** Set when phase 1 could not do its job, so phase 2 must not push either. */
  let commitBlocked = null;

  if (declared === null) {
    stagePaths = STAGE_DIRS.filter((d) => existsSync(`${root}/${d}`));
  } else {
    const tree = classifyWorkingTree(root, declared);
    if (!tree.known) {
      say('commit', `cannot read the working tree at ${root} with git, so nothing can be attributed to this run — nothing committed`);
      commit = { attempted: true, committed: false, paths: [], reason: 'tree-unreadable' };
      commitBlocked = 'tree-unreadable';
      stagePaths = [];
    } else if (tree.foreignContent.length) {
      const shown = tree.foreignContent.slice(0, 10).join(', ');
      say(
        'commit',
        `refusing: ${tree.foreignContent.length} uncommitted file(s) under content/ that this run did not write ` +
          `(${shown}${tree.foreignContent.length > 10 ? ', …' : ''}). The build gate catches broken work; it cannot ` +
          'catch unfinished work, so this run stops rather than deciding for their author (addictedtoai-ps3).',
      );
      // NOT an early return, though it was one before phase 1 existed. Falling
      // through to phase 2 is what keeps the disabled/hold line printing on a
      // run that also has a foreign content file in the tree — specs/pulse
      // requires that line on every `publish: false` run, and returning here
      // would make a stray dirty file suppress it.
      commit = { attempted: true, committed: false, paths: [], reason: 'foreign-content', foreign: tree.foreignContent };
      commitBlocked = 'foreign-content';
      stagePaths = [];
    } else {
      for (const f of tree.foreign) {
        say('commit', `not staging ${f} — dirty, but not this run's to commit`);
      }
      ownedPaths = tree.own;
      stagePaths = tree.own;
      if (dryRun) {
        commit = { attempted: false, committed: false, paths: ownedPaths, reason: 'dry-run' };
      } else {
        commit = commitOwned(root, ownedPaths, message, say);
        if (commit.reason === 'commit-failed') commitBlocked = 'commit-failed';
      }
    }
  }

  // =========================================================================
  // PHASE 2 — THE PUBLISH. Everything below is gated on reaching the remote.
  // =========================================================================
  if (!effective) {
    // Exactly one line mentioning publishing, per specs/pulse. What phase 1
    // did is phase 1's to report, under its own step name.
    say('publish', 'disabled (data/config.json has publish: false) — nothing pushed; committing is separate and this flag does not gate it');
    return { published: false, reason: 'disabled', commit };
  }

  if (held) {
    say('publish', `HOLD.md present at ${p.hold} — publish suspended until the hold clears`);
    return { published: false, reason: 'hold', commit };
  }

  if (commitBlocked) {
    say('publish', `not pushing: the commit above stopped at \`${commitBlocked}\` — a run that could not commit its own state has nothing it can honestly publish`);
    return { published: false, reason: commitBlocked, commit, ...(commit.foreign ? { foreign: commit.foreign } : {}) };
  }

  if (declared === null) {
    say(
      'publish',
      'the caller declared no writes of its own — staging ' +
        stagePaths.map((d) => `${d}/`).join(', ') +
        ' wholesale, which cannot tell this run\'s work from an edit someone else left uncommitted (addictedtoai-ps3)',
    );
    // Not a refusal in this mode, but not silent either: the whole point of
    // ps3 is that this used to happen with nothing in the log to show for it.
    const seen = classifyWorkingTree(root, []);
    for (const f of seen.foreignContent) {
      warn(`publish will commit ${f}, which this run did not write — nothing here can tell whether it is finished`);
    }
  }

  const commands = [
    `git -C ${root} add ${stagePaths.length ? stagePaths.join(' ') : '(nothing — this run wrote nothing of its own)'}`,
    `git -C ${root} commit -m "${message}"`,
    `git -C ${root} push origin main`,
  ];

  if (dryRun) {
    say('publish', `DRY RUN — publish would run (config publish: ${config.publish}${assumePublish ? ', overridden to true for this dry run' : ''})`);
    for (const c of commands) process.stdout.write(`pulse: publish   would run: ${c}\n`);
    process.stdout.write(`pulse: publish   would poll: ${statusUrl()} every ${POLL_INTERVAL_MS / 1000}s for up to ${POLL_BUDGET_MS / 60000} minutes\n`);
    // Deliberately not a value: the commit a real run waits for is the one the
    // commit below would create, and its SHA does not exist until it does. The
    // line used to print the local build's stamp, which is the pre-commit HEAD
    // and is precisely the wrong commit (addictedtoai-1ml).
    process.stdout.write(
      'pulse: publish   would expect the live build stamp to carry the commit this run would create ' +
        '(read with git rev-parse HEAD after committing — it does not exist yet)\n',
    );
    process.stdout.write(`pulse: publish   would write ${p.hold} if the stamp does not advance\n`);
    if (declared !== null) {
      // The commit half is not conditional on any of the above. Saying so here
      // is what stops a reader of a dry run concluding that a `publish: false`
      // run leaves its state uncommitted, which is the belief this whole split
      // exists to correct.
      process.stdout.write(
        `pulse: publish   note: the first of those commands is phase 1 and a real run performs it whatever ` +
          `\`publish\` says — this dry run is what suppressed it\n`,
      );
    }
    process.stdout.write('pulse: publish   DRY RUN — nothing was committed and nothing was pushed\n');
    return { published: false, reason: 'dry-run', commands, poll: statusUrl(), commit };
  }

  // ---- real path. Reached only when data/config.json says publish: true. --

  // A run that attributed nothing to itself and holds nothing the remote does
  // not already have has nothing to publish. Saying so is the whole outcome:
  // the alternative is the no-op `git push origin main` that made `npm test`
  // a command capable of reaching the live remote (addictedtoai-64y).
  if (ownedPaths !== null && ownedPaths.length === 0 && !aheadOfOrigin(root)) {
    say('publish', 'nothing of this run\'s own to publish — no attributable change in the working tree and nothing here that origin/main lacks; not pushing');
    return { published: false, reason: 'nothing-owned', commit };
  }

  const before = await fetchLiveStamp();
  const baseline = before.ok ? stampId(before.stamp) : null;

  if (ownedPaths === null) {
    // Undeclared: exactly the staging this step has always done, and still
    // only on a publishing run. Phase 1 skipped this caller precisely because
    // `git add data content public` cannot attribute anything.
    git(root, ['add', ...stagePaths]);
    const staged = git(root, ['diff', '--cached', '--name-only']);
    if (staged === '') {
      say('publish', 'nothing to commit — the working tree matches HEAD');
    } else {
      git(root, ['commit', '-m', message]);
    }
  } else if (!commit.committed) {
    say('publish', 'nothing of this run\'s own was committed above — publishing what is already committed');
  }

  // Read AFTER the commit, never from a stamp written before it. This one line
  // is `addictedtoai-1ml`: the SHA that the host will check out and serve does
  // not exist until the commit does. When there was nothing to commit this is
  // the unchanged HEAD, which is still the right answer — it is the commit the
  // live site is required to be serving when this step returns.
  const expected = git(root, ['rev-parse', 'HEAD']).toLowerCase();

  git(root, ['push', 'origin', 'main']);
  say('publish', `pushed origin main at ${expected.slice(0, 12)}; polling the live build stamp for that commit`);

  const deadline = Date.now() + pollBudgetMs;
  let lastSeen = baseline;
  while (Date.now() < deadline) {
    const live = await fetchLiveStamp();
    if (live.ok) {
      const id = stampId(live.stamp);
      lastSeen = id;
      if (stampMatchesCommit(id, expected)) {
        say('publish', `live build stamp carries ${id} — the commit this run pushed`);
        // `commit` here is the SHA the site is serving, which is what every
        // caller of this result has always read. Phase 1's own report rides
        // alongside it under `committed`.
        return { published: true, stamp: id, commit: expected, committed: commit };
      }
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  const file = writeHold(
    root,
    `The push succeeded but ${statusUrl()} is not serving the commit this run pushed ` +
      `(${expected.slice(0, 12)}) within ${Math.round(pollBudgetMs / 60000)} minutes. ` +
      `The live build stamp last read ${lastSeen ?? 'unreadable'}` +
      (baseline && lastSeen === baseline ? ' — unchanged since before the push' : '') +
      '.',
  );
  say('publish', `deploy did not land — wrote ${file}`);
  return { published: false, reason: 'stamp-did-not-advance', hold: file, expected, last_seen: lastSeen ?? null, commit };
}
