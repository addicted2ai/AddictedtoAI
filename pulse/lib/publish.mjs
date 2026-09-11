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
 * So the step is two phases, plus one that only exists once the first two have
 * both succeeded:
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
 *   3. **ANNOUNCE** — an IndexNow submission of the URLs whose `<lastmod>` is
 *      today (`pulse/lib/indexnow.mjs`, beads addictedtoai-k1j). Reached only
 *      from inside the success branch of phase 2, so it can only ever name URLs
 *      the live site is already serving; it re-checks its own five guards
 *      regardless, it never throws, and it never writes `HOLD.md`. A search
 *      engine's outage is not a deploy failure.
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
 *     stamp for up to 10 minutes and, if that elapses, for a confirmation
 *     window three times as long. A stamp that never comes to carry the pushed
 *     commit — or a commit containing it — is a deploy failure, not a shrug:
 *     `HOLD.md` is written naming which of three failures it is (breaker 2 in
 *     specs/loop) and no further publish is attempted until the hold clears.
 *     Every later invocation that finds that hold standing re-reads the live
 *     stamp once and appends one dated observation. It clears nothing.
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
 * Nothing here removes `HOLD.md`, and nothing here may. The rule this used to
 * state was the OLD one, and it misquoted the spec it cited: specs/loop reserves
 * "removal of `HOLD.md` BY THE LOOP ITSELF" and says "the loop MUST NOT remove
 * either" — a prohibition on THE ACTOR, not on the act. Clearing a diagnosed and
 * repaired halt is the ORCHESTRATOR'S, between runs, on standing authority
 * (CLAUDE.md; maintainer 2026-09-07: "The orchestrator can remove HOLD.md, not
 * STOP - that is mine unless I say otherwise"). `STOP` is his alone.
 *
 * The correction is worth its length because the stale form has cost real time
 * three times: three hours of Desk idle on a halt whose cause had already
 * cleared, because a written sentence was allowed to outrank what the maintainer
 * had said in session; then the same sentence in AGENTS.md; then here.
 *
 * `HOLD.md` DOES DOUBLE DUTY, AND THE SECOND JOB IS INVISIBLE FROM THE SITE THAT
 * WRITES IT. It is the Desk's breaker, and it is ALSO this module's publish gate
 * — phase 2 is suspended entirely while the file exists. Two consequences,
 * neither of them visible where the decision to write or clear it is made:
 *
 *   - REMOVING `HOLD.md` RE-ARMS PUBLISHING. Clearing a hold is a publishing act
 *     as well as a breaker reset, so the push bar applies to it: the gates pass.
 *     Diagnose, fix the cause, record it, THEN remove — and know that the next
 *     run may publish because you did.
 *   - A GUARDRAIL THAT ALSO GATES SOMETHING ELSE CANNOT BE RELAXED FOR ONE OF
 *     ITS TWO JOBS. Suppressing the halt for a case that does not deserve one —
 *     a build that never ran because it could not take the lock — also removes
 *     the publish gate, and the merged commit reaches the remote with no verified
 *     build. Measured on addictedtoai-gates round 4; carried by addictedtoai-ml25,
 *     which needs a THIRD state that does not exist today: not red, not green,
 *     but "the build did not run" — do not count it, do not halt, DO NOT PUBLISH.
 */

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { paths, readJson, today } from './core.mjs';
import { submitIndexNow } from './indexnow.mjs';

const DEFAULT_SITE = 'https://www.addictedtoai.net';
const POLL_BUDGET_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 20000;
/**
 * The confirmation window is at least three times the first budget
 * (specs/pulse). "Not live after ten minutes" and "never deployed" were the
 * same fact until this existed, and they have different recoveries:
 * `addictedtoai-k2y0` cost three hours of Desk idle time to that conflation.
 */
const CONFIRM_WINDOW_MULTIPLE = 3;

/** The three directories a publish has ever staged from. */
export const STAGE_DIRS = ['data', 'content', 'public'];

/**
 * Read the remote tip of `origin/main` WITHOUT touching local state.
 *
 * A fresh `ls-remote` rather than the local `origin/main` tracking ref: a
 * push decision on a stale tip is how a non-descendant push gets attempted
 * (and, on a forked local history, how it gets pushed). Returns
 * `{ok:false}` when the remote cannot be read at all and `{ok:true,
 * tip:null}` when it reads but carries no `main` yet (an empty remote —
 * anything is a descendant of nothing).
 */
export function readRemoteTip(root) {
  let out;
  try {
    out = execFileSync('git', ['-C', root, 'ls-remote', 'origin', 'main'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return { ok: false, tip: null };
  }
  const m = /^([0-9a-f]{40})\t/m.exec(out);
  return { ok: true, tip: m ? m[1].toLowerCase() : null };
}

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
  if (rel === 'data/changes.jsonl' || rel === 'data/linkcheck.json' || rel === 'data/indexnow.jsonl') return true;
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

/** Run git without throwing. `ok` is the exit status; `out` is trimmed stdout. */
function gitTry(root, args) {
  try {
    return {
      ok: true,
      out: execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(),
    };
  } catch {
    return { ok: false, out: '' };
  }
}

/**
 * Are the bytes this run pushed being served, according to a live build stamp?
 *
 * The stamp carries `git rev-parse --short=12 HEAD` from the *host's* checkout
 * (`lib/stamp.mjs`), so it is an abbreviation of a SHA. The question this asks
 * is the requirement's own purpose sentence — *is the live site serving what
 * this run pushed* — and the answer is yes for the pushed commit itself and for
 * any commit that CONTAINS it.
 *
 * ## Why containment rather than equality (design D1, `addictedtoai-k2y0`)
 *
 * Two publishers share this step: the Pulse and the Desk (`loop/run.mjs`
 * publishes through it after a merge). A merge that pushes on top of a Pulse
 * commit while the Pulse is still polling makes the Pulse's equality check fail
 * on a deploy that is serving the Pulse's own bytes — a false halt available on
 * ordinary concurrency, with no vendor fault required.
 *
 * The rule equality was protecting is untouched: *"a stamp that merely changed
 * SHALL NOT satisfy the check"*. A commit that does not contain the pushed one
 * still fails, and the previous run's commit is an ANCESTOR of the pushed one
 * rather than a descendant, so it fails in the correct direction — which is the
 * whole of `addictedtoai-1ml`.
 *
 * ## Fail closed, in three places
 *
 *   - the stamp must parse as a hex abbreviation of at least seven characters
 *     (git's own floor; below it a "prefix" is not evidence of identity), so
 *     `unknown` from a builder with no git, a bare timestamp and a serialised
 *     blob are all refused before any git runs;
 *   - it must resolve, through the local repository, to exactly one commit
 *     object — an ambiguous abbreviation makes `rev-parse --verify` exit
 *     non-zero and is therefore refused too;
 *   - the ancestry question is answered by `git merge-base --is-ancestor`, never
 *     inferred. "Newer" is a clock and a clock cannot tell a descendant from a
 *     fork.
 *
 * The live commit may have been pushed by another actor and be absent locally,
 * so an unresolvable stamp triggers ONE read-only `git fetch origin main` (the
 * git remote this step has just pushed to — not a hosting-provider call and not
 * a GitHub API call) and one retry. `state.fetched` is what makes it once per
 * run rather than once per poll. A stamp still unresolvable after that is not
 * landed.
 *
 * The `+dirty` suffix never reaches here: `stampId` reads the `commit` field,
 * not the rendered `stamp` string. That matters, because the host's build IS
 * dirty — prebuild regenerates date-dependent derived data — and that flag is
 * telling the truth and is not suppressed.
 *
 * @param {object} [opts]
 * @param {(root: string, args: string[]) => {ok: boolean, out: string}} [opts.runGit]
 *   injectable only so a test can fail one git invocation and watch the check
 *   fail closed; no caller passes it.
 * @param {{fetched: boolean}} [opts.state] the once-per-run fetch latch.
 */
export function stampMatchesCommit(root, id, sha, { runGit = gitTry, state = { fetched: false } } = {}) {
  if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) return false;
  if (typeof id !== 'string') return false;
  const seen = id.trim().toLowerCase();
  if (!/^[0-9a-f]{7,40}$/.test(seen)) return false;
  // The pushed commit itself. Answered without git, and it is the common case.
  if (sha.startsWith(seen)) return true;
  const resolve = () => {
    const r = runGit(root, ['rev-parse', '--verify', '--quiet', `${seen}^{commit}`]);
    return r.ok && /^[0-9a-f]{40}$/.test(r.out) ? r.out : null;
  };
  let live = resolve();
  if (live === null && !state.fetched) {
    state.fetched = true;
    runGit(root, ['fetch', 'origin', 'main']);
    live = resolve();
  }
  if (live === null) return false;
  return runGit(root, ['merge-base', '--is-ancestor', sha, live]).ok;
}

/** One containment test bound to a repository, sharing a single fetch latch. */
export function stampChecker(root, opts = {}) {
  const state = { fetched: false };
  return (id, sha) => stampMatchesCommit(root, id, sha, { ...opts, state });
}

/**
 * The closed, exhaustive set of deploy-failure classifications (specs/pulse).
 *
 * Closed, because an open string is what the old free-text clause effectively
 * was and nothing could assert on it. Exhaustive, because two of the three are
 * positive tests and the third is their complement.
 */
export const DEPLOY_CLASSIFICATIONS = Object.freeze({
  UNREADABLE: 'unreadable',
  NEVER_ADVANCED: 'never-advanced',
  ADVANCED_ELSEWHERE: 'advanced-elsewhere',
});

const CLASSIFICATION_MEANS = Object.freeze({
  [DEPLOY_CLASSIFICATIONS.UNREADABLE]:
    'no read of the live build stamp succeeded after the push, so this run observed nothing about its own deploy',
  [DEPLOY_CLASSIFICATIONS.NEVER_ADVANCED]:
    'every read that succeeded after the push returned the stamp that was live before it',
  [DEPLOY_CLASSIFICATIONS.ADVANCED_ELSEWHERE]:
    'the stamp was neither unchanged nor a commit containing the one this run pushed',
});

/**
 * Which of the three failures this was, computed from what the loop read.
 *
 * A *reading* is a poll taken AFTER the push. The pre-push baseline is not one:
 * it is the value the readings are compared against. That definition is what
 * removes the misleading sentence the old text could write — `lastSeen` was
 * initialised to the baseline and advanced only on a successful poll, so a run
 * whose baseline read succeeded and whose every post-push poll failed used to
 * assert "unchanged since before the push" about a run that read nothing after
 * the push at all.
 */
export function classifyDeployFailure({ readings, everyReadingWasBaseline }) {
  if (readings === 0) return DEPLOY_CLASSIFICATIONS.UNREADABLE;
  if (everyReadingWasBaseline) return DEPLOY_CLASSIFICATIONS.NEVER_ADVANCED;
  return DEPLOY_CLASSIFICATIONS.ADVANCED_ELSEWHERE;
}

/**
 * The exact prefix of the line that makes a deploy hold machine-identifiable.
 *
 * `HOLD.md` has five writers: this step, and the Desk's four breakers
 * (`loop/lib/breakers.mjs` — consecutive-failure, red-build, review-bypass,
 * reserved-path). NOT ONE OF THE FOUR NAMES A COMMIT, so "is the commit this
 * hold names now served" has no referent on four fifths of the holds that can
 * be standing. Keying the re-test on this line rather than on the file's
 * existence is the mechanism, not a convenience — and it also leaves a
 * `HOLD.md` a human wrote by hand untouched, which is correct.
 */
export const DEPLOY_HOLD_MARKER = 'deploy-hold:';

/** A window duration as a value a reader and a test can both hold on to. */
function durationText(ms) {
  return ms >= 60000 ? `${ms} ms (${Math.round(ms / 60000)} minutes)` : `${ms} ms`;
}

function writeHold(root, { expected, lastSeen, classification, firstWindowMs, confirmWindowMs }) {
  const file = paths(root).hold;
  const text = [
    '# HOLD',
    '',
    // FIRST BODY LINE, exact prefix, one line: everything below is prose and
    // this is not.
    `${DEPLOY_HOLD_MARKER} ${expected} ${classification}`,
    '',
    `Written by the publish step on ${today()}.`,
    '',
    `The push succeeded but ${statusUrl()} is not serving the commit this run`,
    `pushed (${expected.slice(0, 12)}) — through a first polling window and a`,
    'longer confirmation window, so this is a missed deploy and not a slow one.',
    '',
    `- pushed commit: ${expected}`,
    `- last live build stamp read: ${lastSeen ?? 'none — no reading succeeded after the push'}`,
    `- first window: ${durationText(firstWindowMs)}`,
    `- confirmation window: ${durationText(confirmWindowMs)}`,
    `- classification: ${classification} — ${CLASSIFICATION_MEANS[classification]}`,
    '',
    'Breaker 2 (specs/loop): the published site failed to build or deploy.',
    'The Desk is stopped and no further publish is attempted until this file',
    'is removed by the maintainer. The Pulse keeps running; only its deploy',
    'step is suspended.',
    '',
    'Each later invocation of the publish step appends one dated observation',
    'below, recording whether the commit named above is being served yet. The',
    'observations clear nothing: this file stays until the maintainer, or an',
    'orchestrator between runs, removes it on the record it now carries.',
    '',
  ].join('\n');
  writeFileSync(file, text, 'utf8');
  return file;
}

/**
 * The `deploy-hold:` marker in a standing hold, or `null` for every other hold.
 *
 * Forty hex characters, not an abbreviation: this step writes the full SHA, and
 * the containment test needs the full SHA to answer anything. A truncated or
 * hand-edited marker therefore reads as "no marker", which is the fail-closed
 * direction — the hold is left entirely alone.
 */
export function readDeployMarker(file) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return null;
  }
  for (const line of text.split('\n')) {
    const m = /^deploy-hold:[ \t]+([0-9a-f]{40})[ \t]+(\S+)$/.exec(line.trim());
    if (m) return { sha: m[1], classification: m[2] };
  }
  return null;
}

/**
 * One dated observation about the commit a standing deploy hold names.
 *
 * It fires on bad news and on an unreadable site as well as on good news: an
 * observation that only ever records success is a log line, not a record, and
 * the point of appending rather than rewriting is that the file shows how long
 * the condition persisted.
 */
export function observeHeldCommit(root, marker, seen, check = stampChecker(root)) {
  const day = today();
  const held = marker.sha.slice(0, 12);
  if (!seen.ok) {
    return `observation ${day}: the live build stamp could not be read (${seen.detail}) — whether ${held} is served is still unknown.`;
  }
  const id = stampId(seen.stamp);
  return check(id, marker.sha)
    ? `observation ${day}: the live build stamp ${id} carries ${held} — the commit this hold names is now served.`
    : `observation ${day}: the live build stamp ${id} does not carry ${held} — the commit this hold names is still not served.`;
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
 * @param {string|null} opts.verifiedSha  the commit SHA the caller's gates ran
 *   over (Stage-1 task 45). When declared, the step pushes exactly that tree —
 *   or the phase-1 commit on top of it when phase 1 committed this run's own
 *   attributed work — as `<sha>:main`, and refuses unless it descends from the
 *   remote tip (scope refusal: no push, no `HOLD.md`, both SHAs named). A
 *   declared SHA equal to the remote tip reports "nothing to publish" (not a
 *   refusal, no hold). `null` — the default — keeps the legacy tip scope: the
 *   post-commit HEAD is pushed and polled exactly as before, with no scope
 *   check. Both production callers declare; the default exists so older
 *   callers keep their behaviour while the row-48 arms pin the declared flow.
 *   A declared value that is not a resolvable 40-hex commit refuses outright
 *   (`no-verified-sha`): a scope the step cannot resolve is not one it pushes.
 * @param {boolean} opts.phase1Commit  whether phase 1 may commit (default
 *   true). The train passes false: its records are already committed by its
 *   own path-restricted records commit, and recomputed-but-uncommitted
 *   `data/derived/` must stay uncommitted (row 50: nothing commits
 *   `data/derived/` anymore) — so the step stages and commits nothing and
 *   pushes the declared SHA as is.
 * @param {boolean} opts.preExistingRed  whether the published tree was
 *   classified `pre-existing` red (default false). Suppresses the step's OWN
 *   deploy-hold write when the deploy poll fails: a hold there would re-halt
 *   what the classification left un-halted (task 49 Q-S13 excludes
 *   pre-existing red from breaker 2). The run still reports the missed
 *   deploy and publishes nothing further.
 * @param {number}  opts.pollBudgetMs    how long to wait for the deploy (tests only)
 * @param {number}  opts.confirmBudgetMs the confirmation window (tests only). Floored
 *   at three times `pollBudgetMs`, which is the spec's minimum ratio.
 * @param {number}  opts.pollIntervalMs  how often to re-fetch (tests only)
 */
export async function publishStep(
  root,
  {
    dryRun = false,
    assumePublish = false,
    log,
    owned = null,
    verifiedSha = null,
    phase1Commit = true,
    preExistingRed = false,
    // The poll window is a constant for every real run. It is injectable only
    // so a test can exercise the deploy-did-not-land path in milliseconds
    // instead of ten minutes; no caller in `pulse/` or `loop/` passes either.
    pollBudgetMs = POLL_BUDGET_MS,
    // Deliberately not `POLL_BUDGET_MS * CONFIRM_WINDOW_MULTIPLE`: the default
    // has to follow the budget this call was GIVEN, or a test that shortens the
    // first window to milliseconds still waits thirty real minutes for the
    // second. Measured 2026-09-07 — every hold-writing test timed out.
    confirmBudgetMs = null,
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

  if (!phase1Commit) {
    // The train path (task 46): the caller committed its own records before
    // calling, and recomputed-but-uncommitted data must stay uncommitted (row
    // 50). The step stages and commits nothing; the declared SHA below is
    // pushed as is. `owned` is still honoured for the phase-2 shape (a passed
    // list keeps the caller declared), but nothing is staged from it here.
    say('commit', 'skipped by caller option — the caller committed its own records; the step stages and commits nothing');
    ownedPaths = [];
    stagePaths = [];
    commit = { attempted: false, committed: false, paths: [], reason: 'skipped' };
  } else if (declared === null) {
    stagePaths = STAGE_DIRS.filter((d) => existsSync(`${root}/${d}`));
  } else {
    const tree = classifyWorkingTree(root, declared);
    if (!tree.known) {
      say(
        'commit',
        dryRun
          ? `cannot read the working tree at ${root} with git, so nothing can be attributed to this run — a real run would publish nothing`
          : `cannot read the working tree at ${root} with git, so nothing can be attributed to this run — nothing committed`,
      );
      commit = { attempted: true, committed: false, paths: [], reason: 'tree-unreadable' };
      // A preview still prints the plan. A real run remains blocked exactly as
      // before, because it cannot safely attribute anything to itself.
      commitBlocked = dryRun ? null : 'tree-unreadable';
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
    // ---- THE READ-ONLY RE-TEST OF A STANDING DEPLOY HOLD -------------------
    //
    // `addictedtoai-k2y0`: the halt outlived its cause by three hours because
    // the brake suspends the very publishing whose success would have shown the
    // cause had passed. This branch returned before ANY live read, so nothing in
    // the system could discover it.
    //
    // It reads, and does nothing else. No push, no remote write, no second
    // reading, no rewrite of an earlier observation, and — deliberately — no
    // clearing of the hold: a run that clears its own halt is precisely the
    // conflict of interest the brake exists for (design D2). The evidence here
    // is the same single reading whose absence wrote the hold; one reading was
    // not enough to conclude failure without a confirmation window, and it is
    // not enough to conclude success either. What changes is that the diagnosis
    // is already in the file when the maintainer gets there.
    //
    // A hold with no marker belongs to another brake and names no commit, so it
    // is passed over untouched — reading the live site to decide whether a
    // reserved-path halt has cleared is asking a question with no answer.
    const marker = readDeployMarker(p.hold);
    if (!marker) return { published: false, reason: 'hold', commit };

    const seen = await fetchLiveStamp();
    const observation = observeHeldCommit(root, marker, seen);
    if (dryRun) {
      // The hold branch is reached BEFORE the dry-run branch, so without this
      // the naive implementation would have `--dry-run` append to a guardrail
      // file three lines above its own "nothing was committed and nothing was
      // pushed".
      say('publish', `DRY RUN — would append to ${p.hold}: ${observation}`);
    } else {
      appendFileSync(p.hold, `${observation}\n`, 'utf8');
      say('publish', observation);
    }
    return { published: false, reason: 'hold', commit, retest: { ...marker, observation } };
  }

  if (commitBlocked) {
    say('publish', `not pushing: the commit above stopped at \`${commitBlocked}\` — a run that could not commit its own state has nothing it can honestly publish`);
    return { published: false, reason: commitBlocked, commit, ...(commit.foreign ? { foreign: commit.foreign } : {}) };
  }

  // ---- SHA scope (task 45): the SHA the caller's gates ran over. ----
  //
  // Declared (a string was passed): validated here — present, 40-hex, and
  // resolving to a commit in this repository — and governing below: the step
  // pushes exactly that tree (or the phase-1 commit on top of it) and checks
  // it against the remote tip. Anything unresolvable refuses outright
  // (`no-verified-sha`, no push, no hold): a scope the step cannot resolve is
  // not one it pushes. Undeclared (null): the legacy tip scope, validated by
  // nothing and checked by nothing — the post-commit HEAD is pushed and
  // polled exactly as before.
  let scopeSha = null;
  if (verifiedSha != null) {
    const v = String(verifiedSha).trim().toLowerCase();
    const resolves = /^[0-9a-f]{40}$/.test(v) && gitTry(root, ['cat-file', '-e', `${v}^{commit}`]).ok;
    if (!resolves) {
      say('publish', `no verified SHA was declared (${String(verifiedSha).slice(0, 32)}) — it is absent, malformed, or resolves to no commit here; nothing pushed and no HOLD written`);
      return { published: false, reason: 'no-verified-sha', commit };
    }
    scopeSha = v;
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

  // Task 45: the push is a SHA push in every flow — the branch form is gone.
  // No commit is made on a dry run, so the line shows the declared SHA; on
  // the legacy flow it shows the current tip (best effort, read-only), or a
  // placeholder where no commit exists yet. A real declared run pushes this
  // SHA — or the phase-1 commit on top of it when phase 1 commits — and only
  // when it descends from the remote tip (see the real path below).
  const dryTip = gitTry(root, ['rev-parse', 'HEAD']);
  const drySha =
    scopeSha ?? (dryTip.ok && /^[0-9a-f]{40}$/.test(dryTip.out) ? dryTip.out : '<post-commit-HEAD>');
  const commands = [
    `git -C ${root} add ${stagePaths.length ? stagePaths.join(' ') : '(nothing — this run wrote nothing of its own)'}`,
    `git -C ${root} commit -m "${message}"`,
    `git -C ${root} push origin ${drySha}:refs/heads/main`,
  ];

  if (dryRun) {
    say('publish', `DRY RUN — publish would run (config publish: ${config.publish}${assumePublish ? ', overridden to true for this dry run' : ''})`);
    for (const c of commands) process.stdout.write(`pulse: publish   would run: ${c}\n`);
    if (scopeSha) {
      process.stdout.write(
        `pulse: publish   declared verified SHA ${scopeSha} — a real run pushes it (or the phase-1 commit on top of it) ` +
          'only when it descends from the remote tip, and refuses naming both otherwise\n',
      );
    }
    process.stdout.write(`pulse: publish   would poll: ${statusUrl()} every ${POLL_INTERVAL_MS / 1000}s for up to ${POLL_BUDGET_MS / 60000} minutes\n`);
    process.stdout.write(
      `pulse: publish   would then poll a confirmation window of ${(POLL_BUDGET_MS * CONFIRM_WINDOW_MULTIPLE) / 60000} ` +
        'minutes before treating the deploy as missed rather than slow\n',
    );
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
  // the alternative is the no-op push that made `npm test`
  // a command capable of reaching the live remote (addictedtoai-64y).
  //
  // Legacy flow only: a caller that declared its scope is governed by the
  // scope checks below instead — a declared SHA equal to the remote tip
  // reports "nothing to publish" there, and a declared SHA behind it is a
  // scope refusal, not a heuristic shrug.
  if (scopeSha === null && ownedPaths !== null && ownedPaths.length === 0 && !aheadOfOrigin(root)) {
    say('publish', 'nothing of this run\'s own to publish — no attributable change in the working tree and nothing here that origin/main lacks; not pushing');
    return { published: false, reason: 'nothing-owned', commit };
  }

  // ---- Task 45: WHAT gets pushed + WHETHER it may be (declared flow). ----
  //
  // A caller that declared its verified SHA gets exactly that tree — unless
  // phase 1 committed this run's own attributed work just above, in which
  // case the pushed tree is the new tip whose content is exactly what the
  // rebuild examined (the declaration pins the gated base; the commit carries
  // only attributed paths, so nothing ungated rides).
  //
  // Resolved BEFORE the baseline read below, so refusals, equal-SHAs and
  // unreadable remotes cost no live read at all. Checked against a FRESH read
  // of the remote (`ls-remote`), never local tracking: a push decision on a
  // stale tip is how a non-descendant gets attempted, and the remote
  // re-checks the fast-forward atomically at push time regardless. The legacy
  // flow (no declaration) keeps its behaviour — a no-op push still pushes
  // and polls, which `publish-verify.test.mjs` pins — and resolves its tip
  // after its wholesale commit further below.
  let pushSha = null;
  if (scopeSha !== null) {
    pushSha = commit.committed && commit.sha ? String(commit.sha).toLowerCase() : scopeSha;
    const remote = readRemoteTip(root);
    if (!remote.ok) {
      say('publish', 'cannot read the remote tip of origin/main — the scope of a declared SHA cannot be verified against an unreadable remote; nothing pushed and no HOLD written');
      return { published: false, reason: 'remote-unreadable', sha: pushSha, declaredSha: scopeSha, commit };
    }
    if (remote.tip === null) {
      say('publish', `the remote has no main yet — pushing declared tree ${pushSha.slice(0, 12)} as the first commit`);
    } else {
      if (pushSha === remote.tip) {
        say('publish', `declared SHA ${pushSha} equals the remote tip ${remote.tip} — nothing to publish (not a scope refusal, no HOLD written)`);
        return { published: false, reason: 'nothing-to-publish', sha: pushSha, declaredSha: scopeSha, remoteTip: remote.tip, commit };
      }
      // The tip object may be absent locally (another actor pushed it), so
      // one read-only fetch before resolving — the same fetch the stamp
      // check already performs for the same reason. Still unresolvable
      // afterwards is fail-closed: the scope cannot be proven.
      if (!gitTry(root, ['cat-file', '-e', `${remote.tip}^{commit}`]).ok) {
        gitTry(root, ['fetch', 'origin', 'main']);
      }
      const tipKnown = gitTry(root, ['cat-file', '-e', `${remote.tip}^{commit}`]).ok;
      const descends = tipKnown && gitTry(root, ['merge-base', '--is-ancestor', remote.tip, pushSha]).ok;
      if (!descends) {
        say('publish', `scope refusal: declared tree ${pushSha} is not a descendant of the remote tip ${remote.tip} — nothing pushed and no HOLD written`);
        return { published: false, reason: 'scope-refused', sha: pushSha, declaredSha: scopeSha, remoteTip: remote.tip, commit };
      }
    }
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
  //
  // The legacy flow resolves its tip here, after its wholesale commit above.
  // The declared flow resolved its SHA before the baseline read (see above),
  // so refusals and equal-SHAs cost no live read at all.
  //
  // Either way the refspec below names the SHA — the branch form is gone in
  // every flow.
  if (scopeSha === null) {
    pushSha = git(root, ['rev-parse', 'HEAD']).toLowerCase();
  }

  // `expected` is the pushed SHA: what the host will serve is what left here.
  const expected = pushSha;

  let pushErr = null;
  try {
    // Fully-qualified destination: a bare `<sha>:main` refspec fails when
    // the remote has no `main` yet (git cannot guess the namespace for a raw
    // SHA source). The fast-forward is still enforced by the remote.
    git(root, ['push', 'origin', `${expected}:refs/heads/main`]);
  } catch (err) {
    pushErr = err;
  }
  if (pushErr) {
    // A push the pre-check cleared can still lose a race with the other
    // publisher between the check and the push. Re-read once: a tip that
    // moved past the pushed SHA reads as scope staleness (the train's
    // re-merge trigger); anything else re-throws exactly as before.
    const again = readRemoteTip(root);
    const first = String(pushErr?.message ?? pushErr).split('\n')[0];
    if (again.ok && again.tip !== null && again.tip !== expected) {
      const stillDescends =
        gitTry(root, ['cat-file', '-e', `${again.tip}^{commit}`]).ok &&
        gitTry(root, ['merge-base', '--is-ancestor', again.tip, expected]).ok;
      if (!stillDescends) {
        say('publish', `scope refusal: declared tree ${expected} is not a descendant of the remote tip ${again.tip} (the remote advanced during the push) — nothing published and no HOLD written`);
        return { published: false, reason: 'scope-refused', sha: expected, declaredSha: scopeSha, remoteTip: again.tip, raced: true, commit };
      }
    }
    throw pushErr;
  }
  say('publish', `pushed ${expected.slice(0, 12)} to origin main; polling the live build stamp for that commit`);

  // One checker for the whole run, so the read-only `git fetch` that resolves a
  // stamp another actor pushed happens at most once rather than once per poll.
  const carries = stampChecker(root);
  // A READING is a poll taken after the push, and nothing else. `lastSeen` used
  // to start at the baseline and advance only on a successful poll, which made
  // "no poll succeeded" and "every poll returned the baseline" the same state.
  const readings = { count: 0, everyOneWasBaseline: true, last: null };

  const pollWindow = async (budgetMs) => {
    const deadline = Date.now() + budgetMs;
    while (Date.now() < deadline) {
      const live = await fetchLiveStamp();
      if (live.ok) {
        const id = stampId(live.stamp);
        readings.count++;
        readings.last = id;
        // A null baseline never equals a stamp, so a run whose pre-push read
        // failed and whose later reads succeeded lands in `advanced-elsewhere`.
        if (id !== baseline) readings.everyOneWasBaseline = false;
        if (carries(id, expected)) return id;
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
    return null;
  };

  // The floor is the spec's — *at least three times the first* — so a caller
  // may lengthen the confirmation window but cannot shorten it below the ratio.
  const confirmMs = Math.max(Number(confirmBudgetMs) || 0, pollBudgetMs * CONFIRM_WINDOW_MULTIPLE);

  let window = 'first';
  let id = await pollWindow(pollBudgetMs);
  if (id === null) {
    window = 'confirmation';
    say(
      'publish',
      `the first window (${durationText(pollBudgetMs)}) elapsed with no stamp carrying ${expected.slice(0, 12)} — ` +
        `polling a confirmation window of ${durationText(confirmMs)} before treating the deploy as failed`,
    );
    id = await pollWindow(confirmMs);
  }

  if (id !== null) {
    say(
      'publish',
      `live build stamp carries ${id} — the commit this run pushed, or a commit containing it ` +
        `(landed in the ${window} window)`,
    );
    // ---- PHASE 3 — tell the search engines (beads addictedtoai-k1j) ----
    //
    // HERE, and nowhere earlier, because this is the first moment the new
    // bytes are known to be served. Pinging a URL before its deploy lands
    // is worse than not pinging it: the crawler arrives promptly and
    // re-reads the page that was already there. This line is also why the
    // Desk gets it for free — `loop/run.mjs` publishes through this same
    // step after a merge, so reviewed prose is announced the moment it is
    // live rather than waiting for the next Pulse.
    //
    // `submitIndexNow` re-checks every one of its own guards (it is not
    // trusted to be reachable only from here) and cannot throw: a search
    // engine's outage is not this deploy's problem, and nothing it does
    // touches the result below.
    const indexnow = await submitIndexNow({
      root,
      day: today(),
      siteUrl: siteUrl(),
      config,
      dryRun,
      log,
    });
    // `commit` here is the SHA the site is serving, which is what every
    // caller of this result has always read. Phase 1's own report rides
    // alongside it under `committed`.
    return { published: true, stamp: id, window, commit: expected, committed: commit, indexnow };
  }

  const classification = classifyDeployFailure({
    readings: readings.count,
    everyReadingWasBaseline: readings.everyOneWasBaseline,
  });
  // Task 48 item 5 (orchestrator-sanctioned): a tree classified
  // `pre-existing` red suppresses the step's OWN deploy-hold write. A hold
  // here would re-halt what that classification left un-halted (task 49 Q-S13
  // excludes pre-existing red from breaker 2) — and, since HOLD suspends the
  // whole publish phase, it would shut the Pulse's door on every later run.
  // The missed deploy is still reported, and nothing further is published.
  if (preExistingRed === true) {
    say('publish', `deploy did not land (${classification}) — NOT writing a deploy hold: the published tree was classified pre-existing red, so a hold here would re-halt what that classification left un-halted; nothing further published`);
    return {
      published: false,
      reason: 'stamp-did-not-advance',
      suppressedHold: 'pre-existing',
      expected,
      classification,
      last_seen: readings.last,
      windows: { first_ms: pollBudgetMs, confirmation_ms: confirmMs },
      commit,
    };
  }
  const file = writeHold(root, {
    expected,
    lastSeen: readings.last,
    classification,
    firstWindowMs: pollBudgetMs,
    confirmWindowMs: confirmMs,
  });
  say('publish', `deploy did not land (${classification}) — wrote ${file}`);
  return {
    published: false,
    reason: 'stamp-did-not-advance',
    hold: file,
    expected,
    classification,
    last_seen: readings.last,
    windows: { first_ms: pollBudgetMs, confirmation_ms: confirmMs },
    commit,
  };
}
