/**
 * post-merge-third-state.test.mjs — an UNVERIFIED merge is neither red nor
 * green (addictedtoai-ml25), now proved through the Stage-1 U1 tripwire.
 *
 * REWORKED Stage-1 task 32 (U1, bead avs5): the post-merge build block this
 * file pinned is deleted — verification-before-publish now comes from the
 * tripwire (same tip) or the merge-time rebuild (moved tip). What survives
 * unchanged is the property: an unverified merge never reaches the remote,
 * and the proof still reads off a real bare origin. What is GONE by the
 * rows' sequence, stated not to hide it: the red-post-merge-build breaker
 * feed (breaker 2 retarget is task 49, U6) and the job's-cap inheritance on
 * the post-merge call (no such call exists anymore).
 *
 * ## THE DEFECT, measured through a real runLoop fixture on 2026-09-07
 * (kept: it is why the publish half reads off a remote)
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
import { acquireMergeLock, releaseMergeLock } from '../lib/train.mjs';
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
async function repo(t, extraConfig = {}) {
  const files = {};
  for (const rel of sharedStepClosure()) files[rel] = readFileSync(join(REPO, rel), 'utf8');

  const ctx = makeRepo({
    // SPREAD, never replace: `makeRepo` does `o.config ?? DEFAULT_CONFIG`, so a
    // bare `{ publish: true }` drops job_caps_minutes and every other key.
    config: { ...DEFAULT_CONFIG, publish: true, ...extraConfig },
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
 * Answers every gate call in a run. Branch gates AND the tripwire both run
 * in the job worktree with the same two scripts, so the hook counts
 * worktree calls: the first is the branch gate run, the second is the
 * tripwire (single-pass fixture: the mock reviewer approves first try, so
 * no revision re-runs the branch gates — each test asserts the observed
 * sequence). Repo-root calls are the merge-time rebuild. `moveTip` advances
 * main DURING the tripwire call, so the merge sees a moved tip and takes
 * the rebuild path.
 */
function routingGates({ branch = GREEN, tripwire = GREEN, rebuild = GREEN, moveTip = false } = {}) {
  const calls = [];
  // The hook contract differs by call site: the branch-gate runner calls
  // `gates(ctx, worktree)` with no options (the default set runs), while the
  // tripwire and the merge-time rebuild pass explicit `{scripts}`.
  const fn = (ctx, dir, options) => {
    const atRoot = dir === ctx.repoRoot;
    calls.push({ where: atRoot ? 'root' : 'worktree', scripts: options ? options.scripts : null });
    if (!atRoot) {
      const wtCall = calls.filter((c) => c.where === 'worktree').length;
      if (wtCall === 2 && moveTip) {
        git(ctx.repoRoot, ['commit', '--allow-empty', '--quiet', '--no-verify', '-m', 'concurrent main advance']);
      }
      return wtCall === 1 ? branch : tripwire;
    }
    return rebuild;
  };
  fn.calls = calls;
  return fn;
}

const GREEN = { ok: true, results: [], output: '' };

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

function sequence(fn) {
  let wt = 0;
  return fn.calls.map((c) => {
    // Scripts are rendered, not just counted: the branch-gate runner calls
    // with no options (the default set runs), while the tripwire and the
    // merge-time rebuild pass explicit `{scripts}` — a rebuild running any
    // other set must read differently here AND fail the deep-equal below.
    if (c.where === 'root') return `root:${(c.scripts ?? []).join('+')}`;
    wt += 1;
    return `worktree#${wt}:${c.scripts ? c.scripts.join('+') : 'default'}`;
  }).join(' | ');
}

/** Exactly one merge-time build per job, and it is a build — never a set. */
function assertSingleBuild(fn, message) {
  const roots = fn.calls.filter((c) => c.where === 'root');
  assert.equal(roots.length, 1, `${message}: exactly one root call, saw ${roots.length}`);
  assert.deepEqual(roots[0].scripts, ['build'], `${message}: the merge-time rebuild is a build, not a gate set`);
}

test('CONTROL: green-together merges and reaches the remote, so the checks below can fail', async (t) => {
  // Without this, "nothing reached the remote" passes on a fixture that could
  // never publish at all — which is precisely how the first version of this file
  // was wrong.
  const ctx = await repo(t);
  const gates = routingGates();
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(
    sequence(gates),
    'worktree#1:default | worktree#2:build+verify-surfaces',
    `single branch-gate run (default set), then the tripwire (explicit two-script set; no rebuild: the tip never moved):\n${ctx.output()}`,
  );
  assert.equal(
    gates.calls.filter((c) => c.where === 'root').length,
    0,
    'no merge-time build when the tip never moved',
  );
  assert.notEqual(
    ctx.remoteHead(), null,
    `a green-together merge must publish, or this file proves nothing:\n${ctx.output()}`,
  );
  ctx.cleanup();
});

test('red-together is an ordinary failure: nothing merges, nothing publishes', async (t) => {
  const ctx = await repo(t);
  const gates = routingGates({ tripwire: ORDINARY_RED });
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.equal(ctx.remoteHead(), null, 'a red-together pair must publish nothing');
  const merges = git(ctx.repoRoot, ['log', '--merges', '--oneline', 'main']);
  assert.equal(merges, '', `the refused branch must not be merged; main carries merges:\n${merges}`);
  ctx.cleanup();
});

test('tip moved and rebuild red: the merge is reverted immediately, nothing publishes', async (t) => {
  const ctx = await repo(t);
  const gates = routingGates({ rebuild: ORDINARY_RED, moveTip: true });
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.equal(
    sequence(gates),
    'worktree#1:default | worktree#2:build+verify-surfaces | root:build',
    `branch gates, tripwire, then the merge-time rebuild:\n${ctx.output()}`,
  );
  assertSingleBuild(gates, 'tip-moved rebuild');
  const log = git(ctx.repoRoot, ['log', '--oneline', 'main']);
  assert.match(log, /Revert /, `the just-made merge was reverted immediately:\n${ctx.output()}`);
  assert.equal(ctx.remoteHead(), null, 'a reverted merge must publish nothing');
  ctx.cleanup();
});

test('tip moved and rebuild environmental: the merge stands UNVERIFIED — no hold, nothing published', async (t) => {
  // The old third state, moved with the tripwire: the merge stays local
  // until something verifies it. What changed is what watches redness —
  // nothing Desk-side until task 49 retargets breaker 2, by the rows'
  // sequence — so this asserts the absence loudly rather than assuming it.
  const ctx = await repo(t);
  const gates = routingGates({ rebuild: LOCK_REFUSAL, moveTip: true });
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
  assert.equal(res.outcome, 'done', ctx.output());
  assertSingleBuild(gates, 'environmental rebuild');
  assert.equal(existsSync(ctx.holdPath), false, `no breaker feed exists in U1 to write HOLD.md:\n${ctx.output()}`);
  assert.match(ctx.output(), /UNVERIFIED/, 'the log says the merge stands unverified');
  assert.equal(ctx.remoteHead(), null, 'an unverified merge must publish nothing');
  ctx.cleanup();
});

test('merge lock held by a live run: expiry books interrupted, never failed', { timeout: 120000 }, async (t) => {
  // The machine refused the merge, not the work: a live-held lock with a
  // zero wait refuses environmentally, and the run books `interrupted`
  // (resumable, never a breaker input) — the ml25 lesson applied to the
  // merge path. The pre-hold uses the real lock dir (the merge path takes
  // no hermetic override by row-33 design); the zero wait bounds the test
  // even if the config key ever stops flowing (then this fails fast on the
  // outcome, not on a 20-minute hang — the wait would be the hang).
  const ctx = await repo(t, { train: { lock_wait_seconds: 0 } });
  const held = await acquireMergeLock({ waitMs: 0 });
  assert.equal(held.ok, true, 'the fixture pre-holds the real merge lock');
  try {
    const gates = routingGates();
    const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
    assert.equal(res.outcome, 'interrupted', `a machine-refused merge is resumable:\n${ctx.output()}`);
    assert.match(ctx.output(), /merge refused: merge lock held/, 'the log names the refusal');
    const merges = git(ctx.repoRoot, ['log', '--merges', '--oneline', 'main']);
    assert.equal(merges, '', `the refused branch must not be merged; main carries merges:\n${merges}`);
    assert.equal(ctx.remoteHead(), null, 'a refused merge must publish nothing');
    assert.equal(existsSync(ctx.holdPath), false, 'no breaker input, no hold');
  } finally {
    releaseMergeLock(held);
    ctx.cleanup();
  }
});
