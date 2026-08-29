/**
 * publish.mjs — the shared publish step (specs/pulse, task 3.9).
 *
 * "A local rebuild is not publication." This is the one place in the codebase
 * that pushes, and it is shared: `pulse/run.mjs` calls it at the end of its
 * pipeline and `loop/run.mjs` calls it after a merge (design D2), so there is
 * exactly one implementation of deploy and exactly one gate on it.
 *
 * ## The gate
 *
 * `data/config.json`'s `publish` flag decides, and nothing else does:
 *
 *   - `publish: false` — the whole build phase, and any time the maintainer
 *     wants local-only mode. The step prints **one** line and does nothing
 *     else. Nothing else in the pipeline changes.
 *   - `publish: true` — commit, push `main`, then poll the live
 *     `/status.json` build stamp for up to 10 minutes. A stamp that does not
 *     advance is a deploy failure, not a shrug: `HOLD.md` is written naming
 *     it (breaker 2 in specs/loop) and no further publish is attempted until
 *     the hold clears.
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
 */

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { paths, readJson, today } from './core.mjs';

const DEFAULT_SITE = 'https://www.addictedtoai.net';
const POLL_BUDGET_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 20000;

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

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
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
 * Run the publish step.
 *
 * @param {string} root repository root
 * @param {object} opts
 * @param {boolean} opts.dryRun   print the commands and the poll target, execute nothing
 * @param {boolean} opts.assumePublish  treat `publish` as true — refused unless dryRun
 * @param {object}  opts.log      logger from core.makeLogger
 * @param {number}  opts.pollBudgetMs    how long to wait for the deploy (tests only)
 * @param {number}  opts.pollIntervalMs  how often to re-fetch (tests only)
 */
export async function publishStep(
  root,
  {
    dryRun = false,
    assumePublish = false,
    log,
    // The poll window is a constant for every real run. It is injectable only
    // so a test can exercise the deploy-did-not-land path in milliseconds
    // instead of ten minutes; no caller in `pulse/` or `loop/` passes either.
    pollBudgetMs = POLL_BUDGET_MS,
    pollIntervalMs = POLL_INTERVAL_MS,
  } = {},
) {
  const p = paths(root);
  const say = log?.step ?? ((n, d) => process.stdout.write(`pulse: ${n}${d ? ' — ' + d : ''}\n`));

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

  if (!effective) {
    // Exactly one line, per specs/pulse.
    say('publish', 'disabled (data/config.json has publish: false) — nothing committed, nothing pushed');
    return { published: false, reason: 'disabled' };
  }

  if (existsSync(p.hold)) {
    say('publish', `HOLD.md present at ${p.hold} — publish suspended until the hold clears`);
    return { published: false, reason: 'hold' };
  }

  const stagePaths = ['data', 'content', 'public'].filter((d) => existsSync(`${root}/${d}`));
  const message = `pulse: ${today()} data and content update`;
  const commands = [
    `git -C ${root} add ${stagePaths.join(' ')}`,
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
    process.stdout.write('pulse: publish   DRY RUN — nothing was committed and nothing was pushed\n');
    return { published: false, reason: 'dry-run', commands, poll: statusUrl() };
  }

  // ---- real path. Reached only when data/config.json says publish: true. --
  const before = await fetchLiveStamp();
  const baseline = before.ok ? stampId(before.stamp) : null;

  git(root, ['add', ...stagePaths]);
  const staged = git(root, ['diff', '--cached', '--name-only']);
  if (staged === '') {
    say('publish', 'nothing to commit — the working tree matches HEAD');
  } else {
    git(root, ['commit', '-m', message]);
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
        return { published: true, stamp: id, commit: expected };
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
  return { published: false, reason: 'stamp-did-not-advance', hold: file, expected, last_seen: lastSeen ?? null };
}
