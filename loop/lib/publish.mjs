/**
 * publish.mjs — the loop's call into the SHARED publish step.
 *
 * specs/loop: "After a merge, when publishing is enabled, the loop SHALL
 * publish through the same publish step the Pulse uses". The emphasis is on
 * *same*: two implementations would drift, and the one that drifted would be
 * the one that pushed something unverified.
 *
 * So there is no publishing code in `loop/` and no second reading of the
 * publish flag. This module locates the Pulse's step and hands off to it,
 * whatever the flag says — the flag is the shared step's to read, and the one
 * skip line during the build phase is the shared step's to print.
 *
 * If the shared step is missing, this REFUSES rather than improvising. A loop
 * that improvised a push would be a loop that could publish a blank site over
 * the live domain. There is deliberately no code path in this file, or
 * anywhere under `loop/`, that runs a push.
 *
 * ## `owned` — the loop declares what it wrote, exactly as the Pulse does
 *
 * The shared step takes an `owned` list of repo-relative paths the calling run
 * wrote, and stages only those (`pulse/lib/publish.mjs`, `addictedtoai-ps3`).
 * A caller that passes nothing is "the undeclared caller" and gets the old
 * behaviour: `git add data content public` WHOLESALE.
 *
 * This module used to be that caller. Measured on `loop/lib/publish.mjs:72`
 * before this change, the handoff read `fn(ctx.repoRoot, { dryRun, log })` with
 * no `owned` key at all, so every Desk publish swept `data/`, `content/` and
 * `public/` into its commit — including files no job in that run produced. That
 * is `addictedtoai-ps3`'s attribution failure arriving through the Desk's door,
 * and it had a second, sharper cost: the wholesale staging commits a consumed
 * proposal's move BEFORE `loop/run.mjs` stages that same source path
 * deliberately, `git add` then answers "did not match any files" and exits 128,
 * and ONE unmatched pathspec is fatal for the WHOLE invocation — which
 * discarded three jobs' records in one afternoon (`addictedtoai-tqpq`).
 *
 * So `owned` is forwarded. The loop's caller declares its own records, and the
 * shared step's declared-caller path — unchanged here — does the rest.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Where the Pulse's step lives. Both spellings are checked so a move does not silently disable publishing. */
export const SHARED_STEP_CANDIDATES = ['pulse/lib/publish.mjs', 'pulse/publish.mjs'];

export const FALLBACK_SKIP_LINE =
  'publish: skipped — publishing is disabled in data/config.json (publish: false)';

export function findSharedStep(repoRoot) {
  for (const rel of SHARED_STEP_CANDIDATES) {
    const p = join(repoRoot, rel);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * @param {object} ctx
 * @param {object} [opts]
 * @param {object} [opts.cfg]      the already-loaded config, read ONLY on the no-shared-step path
 * @param {boolean} [opts.dryRun]
 * @param {string[]|null} [opts.owned] repo-relative paths THIS run wrote, forwarded
 *   verbatim to the shared step. `null` — the default — is the undeclared
 *   caller, which the shared step stages wholesale. `loop/run.mjs` always
 *   declares; the default is kept only so a future caller has to choose it.
 * @returns {Promise<{published: boolean, skipped: boolean, reason: string}>}
 */
export async function publishStep(ctx, { cfg, dryRun = false, owned = null } = {}) {
  const shared = findSharedStep(ctx.repoRoot);

  if (!shared) {
    // No shared step yet. Read the flag only to decide between "say the skip
    // line the build phase expects" and "refuse loudly" — never to publish.
    const config = cfg ?? JSON.parse(readFileSync(ctx.configPath, 'utf8'));
    if (!config.publish) {
      ctx.log(FALLBACK_SKIP_LINE);
      return { published: false, skipped: true, reason: 'publish flag is false; no shared step present' };
    }
    const reason =
      `publish is enabled but the shared publish step is not present (looked for ` +
      `${SHARED_STEP_CANDIDATES.join(', ')}). Refusing to improvise one: publishing is the ` +
      `Pulse's step, and a second implementation is how a loop ends up pushing something ` +
      `nothing verified.`;
    ctx.log(`publish: REFUSED — ${reason}`);
    return { published: false, skipped: true, reason };
  }

  const mod = await import(pathToFileURL(shared).href);
  const fn = mod.publishStep ?? mod.publish ?? mod.default;
  if (typeof fn !== 'function') {
    const reason = `${shared} exports no publish function (expected \`publishStep\`, \`publish\` or a default export)`;
    ctx.log(`publish: REFUSED — ${reason}`);
    return { published: false, skipped: true, reason };
  }

  // The shared step's signature is `publishStep(root, { dryRun, log, owned })`,
  // with `log` a logger object exposing `step(name, detail)`. Adapting to it
  // here, rather than asking it to adapt to the loop, is what keeps it one step.
  const log = { step: (name, detail) => ctx.log(`${name}${detail ? ' — ' + detail : ''}`) };
  const res = await fn(ctx.repoRoot, { dryRun, log, owned });
  return {
    published: Boolean(res?.published),
    skipped: !res?.published,
    reason: res?.reason ?? 'shared publish step ran',
    result: res,
  };
}
