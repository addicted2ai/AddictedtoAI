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

/** The stamp this build produced, if the build stamp step has written one. */
export function localStamp(root) {
  for (const file of [`${root}/out/status.json`, `${paths(root).publicDir}/status.json`]) {
    const j = readJson(file, null);
    if (j) return j;
  }
  return null;
}

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
 */
export async function publishStep(root, { dryRun = false, assumePublish = false, log } = {}) {
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
    process.stdout.write(`pulse: publish   would expect the build stamp to advance to: ${stampId(localStamp(root)) ?? '(no local stamp yet — would require any change from the pre-push value)'}\n`);
    process.stdout.write(`pulse: publish   would write ${p.hold} if the stamp does not advance\n`);
    process.stdout.write('pulse: publish   DRY RUN — nothing was committed and nothing was pushed\n');
    return { published: false, reason: 'dry-run', commands, poll: statusUrl() };
  }

  // ---- real path. Reached only when data/config.json says publish: true. --
  const before = await fetchLiveStamp();
  const expected = stampId(localStamp(root));

  git(root, ['add', ...stagePaths]);
  const staged = git(root, ['diff', '--cached', '--name-only']);
  if (staged === '') {
    say('publish', 'nothing to commit — the working tree matches HEAD');
  } else {
    git(root, ['commit', '-m', message]);
  }
  git(root, ['push', 'origin', 'main']);
  say('publish', 'pushed origin main; polling the live build stamp');

  const deadline = Date.now() + POLL_BUDGET_MS;
  const baseline = before.ok ? stampId(before.stamp) : null;
  while (Date.now() < deadline) {
    const live = await fetchLiveStamp();
    if (live.ok) {
      const id = stampId(live.stamp);
      if (expected ? id === expected : id !== baseline) {
        say('publish', `live build stamp advanced to ${id}`);
        return { published: true, stamp: id };
      }
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  const file = writeHold(root, `The push succeeded but ${statusUrl()} did not advance its build stamp within 10 minutes (still ${baseline ?? 'unreadable'}).`);
  say('publish', `deploy did not land — wrote ${file}`);
  return { published: false, reason: 'stamp-did-not-advance', hold: file };
}
