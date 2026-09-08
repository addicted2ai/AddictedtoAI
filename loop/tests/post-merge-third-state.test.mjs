/**
 * post-merge-third-state.test.mjs — a post-merge build that NEVER RAN is
 * neither red nor green (addictedtoai-ml25).
 *
 * ## THE DEFECT, measured through a real runLoop fixture on 2026-09-07
 *
 *   branch gate passed, review approved, the POST-MERGE gate returned a NAMED
 *   build-lock refusal  ->  {"outcome":"done","calls":2,"hold":true}
 *
 * `hold: true` is HOLD.md written, which stops the Desk until an orchestrator
 * clears it by hand. The pre-review path asks `gatesHitEnvironmentalFailure`;
 * after a merge the build result reached `checkBuildRed` as only `{ ok, output }`,
 * so the classification was discarded at the call site and a machine REFUSING TO
 * RUN A BUILD read as breaker 2, build red. It halts every SUBSEQUENT job over a
 * condition that has usually cleared by the time anyone reads the file.
 *
 * ## WHY THE PUBLISH HALF IS TESTED AGAINST A REAL REMOTE
 *
 * Suppressing the hold for the environmental case ALSO removes the publish gate,
 * because `HOLD.md` does double duty: breaker, and `pulse/lib/publish.mjs`
 * suspends publishing entirely while it exists. Suppress the halt alone and the
 * run reaches the shared publish step with NO VERIFIED BUILD.
 *
 * THE FIRST VERSION OF THIS FILE COULD NOT SEE THAT, and the reason is worth
 * keeping. It asserted that no log line matched `/^publish: /`. Every line with
 * that shape comes from the FALLBACK branch of `loop/lib/publish.mjs`, which is
 * the branch a fixture with no shared step always takes; the REAL path logs
 * through the adapter as `publish — …`, which the pattern cannot match. So the
 * detector verified the loop's own bookkeeping inside a fixture and could never
 * have seen a real publish — a check narrower than the property it names, which
 * is the exact class this batch keeps producing.
 *
 * It got that way honestly, which is the instructive part: the pattern was
 * anchored to `^publish: ` to stop an earlier version matching THE DIAGNOSTIC
 * THIS CHANGE ADDS ("…and NOT PUBLISHED: the merge stays on main…"). Right
 * problem, and the anchor happened to pin it to the fixture's fallback.
 * RE-TUNING A FALSE RED WITHOUT UNDERSTANDING IT GETS YOU THE RIGHT REGEX BY
 * LUCK.
 *
 * So the publication half now does what the bead asked for: a real bare origin
 * under the OS temp directory, the real shared step in the fixture, and the
 * answer read OFF THE REMOTE. Nothing can reach the live site — the remote is a
 * throwaway directory and `SITE_URL` is pinned to a loopback that 404s.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runLoop } from '../run.mjs';
import { makeRepo, runnersYaml, mockCommand, writeQueue, DEFAULT_CONFIG } from './helpers.mjs';

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const git = (dir, args) =>
  execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/**
 * Every file the shared publish step needs, computed by walking its relative
 * imports transitively rather than kept as a hand-maintained list. A list of
 * "what this module needs" is a second copy of the import graph, and the second
 * copy is the one that goes stale.
 */
function sharedStepClosure(entry = 'pulse/lib/publish.mjs') {
  const out = new Set();
  const queue = [entry];
  while (queue.length) {
    const rel = queue.shift();
    if (out.has(rel)) continue;
    out.add(rel);
    const src = readFileSync(join(REPO, rel), 'utf8');
    const dir = rel.split('/').slice(0, -1);
    for (const m of src.matchAll(/from\s+'(\.[^']+)'/g)) {
      const parts = [...dir];
      for (const seg of m[1].split('/')) {
        if (seg === '.') continue;
        else if (seg === '..') parts.pop();
        else parts.push(seg);
      }
      queue.push(parts.join('/'));
    }
  }
  return [...out];
}

/** A repository that merges, with publishing ENABLED, the real shared step, and a bare origin. */
async function repo(t) {
  const files = {};
  for (const rel of sharedStepClosure()) files[rel] = readFileSync(join(REPO, rel), 'utf8');

  const ctx = makeRepo({
    // SPREAD, never replace: `makeRepo` does `o.config ?? DEFAULT_CONFIG`, so a
    // bare `{ publish: true }` drops job_caps_minutes and every other key.
    config: { ...DEFAULT_CONFIG, publish: true },
    files,
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);

  const remote = mkdtempSync(join(tmpdir(), 'atai-ml25-remote-'));
  execFileSync('git', ['init', '--bare', remote], { stdio: 'ignore' });
  git(ctx.repoRoot, ['remote', 'add', 'origin', remote.replace(/\\/g, '/')]);
  ctx.remote = remote;
  /** What the REMOTE holds — the only trustworthy answer to "did this publish?". */
  ctx.remoteHead = () => { try { return git(remote, ['rev-parse', 'main']); } catch { return null; } };

  // The deploy poll never confirms here — SITE_URL 404s by design — so without a
  // short budget every publishing case would wait out the shared step's real
  // ten-minute window. No production caller sets these.
  ctx.pollBudgetMs = 50;
  ctx.confirmBudgetMs = 50;

  // Nothing may reach the live domain: the deploy check polls SITE_URL.
  const server = createServer((_req, res) => { res.writeHead(404); res.end(''); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const prior = process.env.SITE_URL;
  process.env.SITE_URL = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    if (prior === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = prior;
    await new Promise((r) => server.close(r));
  });
  return ctx;
}

/**
 * Answers the branch gates green and the POST-MERGE build (the call at the
 * repository root) from `postMerge`, recording the OPTIONS each call received so
 * the lock-wait budget is observable rather than inferred.
 */
function gatesWithPostMerge(postMerge) {
  const calls = [];
  const fn = (ctx, dir, options) => {
    calls.push({ dir, options });
    return dir === ctx.repoRoot ? postMerge : { ok: true, results: [], output: '' };
  };
  fn.calls = calls;
  fn.postMergeOptions = (ctx) => calls.find((c) => c.dir === ctx.repoRoot)?.options;
  return fn;
}

const LOCK_REFUSAL = {
  ok: false,
  results: [{
    script: 'build',
    ok: false,
    status: 1,
    output: 'build-lock: another build holds the lock. Waited 30s.',
  }],
  output: 'build-lock: another build holds the lock. Waited 30s.',
};

const ORDINARY_RED = {
  ok: false,
  results: [{ script: 'build', ok: false, status: 1, output: 'Error: build failed on /wiki/x' }],
  output: 'Error: build failed on /wiki/x',
};

test('a post-merge build that could not take the lock writes no HOLD.md', async (t) => {
  const ctx = await repo(t);
  const res = await runLoop(ctx, {
    runner: 'mock-frontier', reviewer: 'mock-reviewer', gates: gatesWithPostMerge(LOCK_REFUSAL),
  });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(existsSync(ctx.holdPath), false, `HOLD.md was written:\n${ctx.output()}`);
  assert.match(ctx.output(), /post-merge build DID NOT RUN/);
  ctx.cleanup();
});

test('and NOTHING REACHES THE REMOTE — read off the bare origin, with publish: true', async (t) => {
  const ctx = await repo(t);
  const before = ctx.remoteHead();
  await runLoop(ctx, {
    runner: 'mock-frontier', reviewer: 'mock-reviewer', gates: gatesWithPostMerge(LOCK_REFUSAL),
  });
  assert.equal(
    ctx.remoteHead(), before,
    'an unverified merge reached the remote: the publish gate was not applied',
  );
  assert.equal(ctx.remoteHead(), null, 'the fixture remote should still be empty');
  ctx.cleanup();
});

test('CONTROL: a GREEN post-merge build DOES reach the remote, so the check above can fail', async (t) => {
  // Without this, "nothing reached the remote" passes on a fixture that could
  // never publish at all — which is precisely how the first version of this file
  // was wrong.
  const ctx = await repo(t);
  await runLoop(ctx, {
    runner: 'mock-frontier', reviewer: 'mock-reviewer',
    gates: gatesWithPostMerge({ ok: true, results: [], output: '' }),
  });
  assert.notEqual(
    ctx.remoteHead(), null,
    `a green post-merge build must publish, or this file proves nothing:\n${ctx.output()}`,
  );
  ctx.cleanup();
});

test('CONTROL: a post-merge build that RAN and failed is still red — hold written, nothing published', async (t) => {
  // The third state must not swallow the second. An ordinary build failure has
  // no environmental marker and must keep tripping breaker 2.
  const ctx = await repo(t);
  await runLoop(ctx, {
    runner: 'mock-frontier', reviewer: 'mock-reviewer', gates: gatesWithPostMerge(ORDINARY_RED),
  });
  assert.equal(existsSync(ctx.holdPath), true, `a real red build must write HOLD.md:\n${ctx.output()}`);
  assert.match(ctx.output(), /BREAKER: the post-merge build is red/);
  assert.equal(ctx.remoteHead(), null, 'a red build must publish nothing');
  ctx.cleanup();
});

test('the post-merge build gets THIS JOB\'S cap, not runGates\'s 20-minute default', async (t) => {
  // Measured, not inferred: the hook records the options it was handed. Before
  // this, the call passed no timeout, so a 120-minute job waited 900,000 ms for
  // the build lock here and 5,400,000 ms in its branch gates — same job, two
  // budgets, no stated reason.
  // Driven with the REFUSAL rather than a green build on purpose: the hook
  // records the options either way, and a green build publishes, which costs a
  // 20-second poll interval this assertion has no use for. Only the control
  // above needs to pay that, because only the control is about publishing.
  const ctx = await repo(t);
  const gates = gatesWithPostMerge(LOCK_REFUSAL);
  await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });

  const options = gates.postMergeOptions(ctx);
  assert.ok(options, 'the post-merge gate call passed no options at all');
  const capMinutes = DEFAULT_CONFIG.job_caps_minutes.repair;
  assert.equal(
    options.timeoutMs, capMinutes * 60 * 1000,
    `the post-merge build must carry the repair cap (${capMinutes}m), not a default`,
  );
  assert.deepEqual(options.scripts, ['build']);
  ctx.cleanup();
});
