/**
 * publish-verify.test.mjs — the publish step's deploy verification
 * (specs/pulse: *"confirming, within 10 minutes and with retries, that the
 * stamp advanced to the just-built value"*), regression cover for
 * `addictedtoai-1ml`.
 *
 * ## Why this file exists, and why `publish.test.mjs` could not hold it
 *
 * `publish.test.mjs` states that no test in it may cause a push, and exercises
 * the `publish: true` path only through `--dry-run`. That is the right contract
 * for that file, and it is also exactly why the whole suite stayed green while
 * the engine could not verify a single one of its own deploys: **nothing ever
 * ran the real path.** The verification logic had no test at all.
 *
 * ## What "real" means here, and what it cannot reach
 *
 * Every test below runs the true path — a real `git commit` and a real
 * `git push` — against a repository that exists only for the length of the
 * test:
 *
 *   - the working repository is `mkdtemp`'d under the OS temp directory,
 *   - its `origin` is a **bare repository in the OS temp directory**, a plain
 *     filesystem path, so `git push` performs no network operation of any kind
 *     and cannot reach GitHub, Vercel, or this repository,
 *   - the live site is a loopback HTTP server whose `/status.json` this test
 *     controls, reached because `publishStep` fetches `SITE_URL`, which every
 *     test sets to `http://127.0.0.1:<port>`.
 *
 * Nothing here touches `D:/AddictedtoAI`, the real remote, or the live domain.
 *
 * ## The defect these tests pin
 *
 * `pulse/run.mjs` rebuilds the site (step 8) *before* the publish step (step
 * 9), so the stamp in `out/status.json` carries the **pre-commit** HEAD. The
 * step used to read its `expected` value from that stamp, and therefore pushed
 * commit N+1 while waiting for the live site to serve commit N. From the second
 * run onward the site already served N, so the comparison was true on the first
 * poll — before the deploy had even started — and the step confirmed the
 * *previous* run's deploy forever, including when this run's deploy failed.
 *
 * The expected value is now read with `git rev-parse HEAD` **after** the commit
 * exists, which is the only moment at which the SHA that will be served is
 * knowable.
 *
 * ## Which staging branch each test runs (addictedtoai-7ri)
 *
 * `publishStep` has two staging branches, and after `addictedtoai-y7d` armed
 * `pulse/run.mjs` with `owned`, **both are production paths**:
 *
 *   - **declared** (`owned` passed) — what `pulse/run.mjs` now does on every
 *     scheduled run. Stages only what the run attributes to itself.
 *   - **undeclared** (`owned` omitted) — still what `loop/lib/publish.mjs`
 *     does when the Desk publishes after a merge. Stages wholesale.
 *
 * Every test in this file used to run the undeclared branch, which is why the
 * whole suite stayed green through the `ps3` fix — and would have left the
 * Pulse's own branch with no push-level cover at all the moment `y7d` landed.
 * Each test below now says which branch it is on. The deploy-verification
 * logic itself is shared: the branch decides *what gets staged*, and after the
 * commit exists the polling is identical. So the four verification tests run
 * on the declared branch (the scheduled engine's), and the wholesale branch
 * keeps its own staging-and-push test plus the no-op-push test, because the
 * Desk still reaches it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEPLOY_CLASSIFICATIONS, publishStep, stampMatchesCommit } from '../lib/publish.mjs';

// Milliseconds. Small enough that the deploy-never-lands path finishes in well
// under a second, which is the only reason the poll window is injectable.
// A run that never lands now costs FOUR times this, because the confirmation
// window is three times the first and both are polled before the hold.
const FAST = { pollBudgetMs: 150, pollIntervalMs: 20 };
/** For the slow-deploy test, whose whole subject is the boundary between the two windows. */
const SLOW = { pollBudgetMs: 500, pollIntervalMs: 25 };

function git(cwd, args) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/** A build stamp in the shape `lib/stamp.mjs` writes and the live site serves. */
function stamp(commit, { dirty = false } = {}) {
  return JSON.stringify({
    built_at: '2026-08-29T00:00:00Z',
    commit,
    dirty,
    stamp: `2026-08-29T00:00:00Z · ${commit}${dirty ? '+dirty' : ''}`,
  });
}

/**
 * A throwaway repository with a bare `origin` beside it, one commit already
 * pushed, and `publish: true` in its own `data/config.json`.
 */
function makeRepo() {
  const root = mkdtempSync(join(tmpdir(), 'pulse-publish-'));
  const remote = mkdtempSync(join(tmpdir(), 'pulse-remote-'));

  execFileSync('git', ['init', '--bare', remote], { stdio: 'ignore' });
  execFileSync('git', ['init', root], { stdio: 'ignore' });
  git(root, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(root, ['config', 'user.email', 'pulse@example.invalid']);
  git(root, ['config', 'user.name', 'Pulse Test']);
  git(root, ['config', 'commit.gpgsign', 'false']);
  git(root, ['remote', 'add', 'origin', remote.replace(/\\/g, '/')]);

  mkdirSync(join(root, 'data'), { recursive: true });
  mkdirSync(join(root, 'content'), { recursive: true });
  // `* -text` disables end-of-line conversion inside the fixture. Without it a
  // checkout on a machine with `core.autocrlf=true` rewrites these LF files to
  // CRLF and `git status` then reports them modified when no test touched
  // them — which the attribution tests read as a dirty foreign file and would
  // fail on intermittently. The real repository pins LF through
  // `.gitattributes` for the same reason; this is the fixture's version of it.
  writeFileSync(join(root, '.gitattributes'), '* -text\n', 'utf8');
  writeFileSync(join(root, 'data', 'config.json'), JSON.stringify({ publish: true }, null, 2) + '\n', 'utf8');
  writeFileSync(join(root, 'content', 'seed.md'), 'first\n', 'utf8');
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'base']);
  git(root, ['push', 'origin', 'main']);

  return { root, remote };
}

function cleanup(...dirs) {
  for (const d of dirs) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* a locked temp dir on Windows is not a test failure */
    }
  }
}

const short = (root, rev = 'HEAD') => git(root, ['rev-parse', '--short=12', rev]);

/** The pre-commit build stamp `pulse/run.mjs` step 8 leaves in `out/`. */
function writeLocalBuildStamp(root, commit) {
  mkdirSync(join(root, 'out'), { recursive: true });
  // `+dirty` is the truth here and stays: the build runs while the Pulse's own
  // content edits are still uncommitted (see addictedtoai-1ml's caution).
  writeFileSync(join(root, 'out', 'status.json'), stamp(commit, { dirty: true }), 'utf8');
}

/**
 * A loopback `/status.json` whose body each test moves when it chooses.
 *
 * `deadUntil` and `aliveUntil` are counted in REQUESTS, not milliseconds, which
 * is what makes the classification tests deterministic rather than racy: the
 * publish step's pre-push baseline read is always request 1, so `aliveUntil: 1`
 * is exactly "the baseline was readable and every reading after the push
 * failed" — the case the replaced free-text clause got wrong.
 */
async function serveStatus(initialBody, { deadUntil = 0, aliveUntil = Infinity } = {}) {
  let body = initialBody;
  let hits = 0;
  const server = createServer((req, res) => {
    hits++;
    if (hits <= deadUntil || hits > aliveUntil) {
      res.writeHead(503);
      res.end('');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(body);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    set: (b) => {
      body = b;
    },
    get hits() {
      return hits;
    },
    close: () => new Promise((r) => server.close(r)),
  };
}

/** Give a test a repo, a live server and a restored `SITE_URL`. */
async function withFixture(t, serverOpts = {}) {
  const { root, remote } = makeRepo();
  const previousCommit = short(root);
  const live = await serveStatus(stamp(previousCommit, { dirty: true }), serverOpts);
  const prior = process.env.SITE_URL;
  process.env.SITE_URL = live.url;
  t.after(async () => {
    if (prior === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = prior;
    await live.close();
    cleanup(root, remote);
  });
  return { root, remote, live, previousCommit };
}

/** An uncommitted content edit, so the step has something to commit. */
function stageableChange(root, text) {
  writeFileSync(join(root, 'content', 'seed.md'), text, 'utf8');
}

/**
 * The declaration a run makes about `stageableChange`'s file.
 *
 * Spelling it once, here, is what keeps the four verification tests on the
 * branch `pulse/run.mjs` actually runs. A test that omits it is on the Desk's
 * wholesale branch, and the ones that mean to be say so out loud.
 */
const DECLARED = { owned: ['content/seed.md'] };

/** The file names in the commit at the remote's tip — read off the REMOTE, not the local tree. */
function remoteCommitFiles(remote) {
  return git(remote, ['show', '--name-only', '--pretty=format:', 'main'])
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
}

// ---------------------------------------------------------------------------

test('declared: a deploy that never lands is a HOLD, not a success — the pre-commit stamp must not satisfy the check', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  // Exactly the situation `pulse/run.mjs` creates: the build ran before the
  // commit, so the local stamp carries the PREVIOUS commit, and the live site
  // is still serving that same previous commit because that is what the last
  // run deployed.
  stageableChange(root, 'second\n');
  writeLocalBuildStamp(root, previousCommit);
  live.set(stamp(previousCommit, { dirty: true }));

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  const pushed = short(root);

  assert.notEqual(pushed, previousCommit, 'the step committed, so HEAD moved');
  assert.equal(
    res.published,
    false,
    `the live site never served ${pushed}, only the previous commit ${previousCommit}; ` +
      'reporting that deploy as published is addictedtoai-1ml',
  );
  assert.equal(res.reason, 'stamp-did-not-advance');
  assert.equal(existsSync(join(root, 'HOLD.md')), true, 'breaker 2 wrote HOLD.md');
});

test('declared: success is confirmed against the commit the push actually placed on the remote', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  stageableChange(root, 'third\n');
  writeLocalBuildStamp(root, previousCommit);
  live.set(stamp(previousCommit, { dirty: true }));

  // The deploy lands partway through the poll window.
  const step = publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  // The commit exists as soon as the step has made it; poll for it, then tell
  // the live server to serve it, which is what a real deploy landing looks
  // like.
  const landed = await new Promise((resolve) => {
    const timer = setInterval(() => {
      const head = short(root);
      if (head !== previousCommit) {
        clearInterval(timer);
        live.set(stamp(head, { dirty: true }));
        resolve(head);
      }
    }, 10);
  });

  const res = await step;
  assert.equal(res.published, true, 'the deploy landed and was confirmed');
  assert.equal(
    res.stamp,
    landed,
    'the confirmed stamp is the commit this run pushed, not the one the previous run deployed',
  );
  assert.equal(existsSync(join(root, 'HOLD.md')), false, 'a landed deploy writes no hold');
});

test('declared: a live stamp that merely changes is not a confirmation — there is no any-change fallback', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  stageableChange(root, 'fourth\n');
  // No local build stamp at all: under the old code this made `expected` null
  // and fell through to `id !== baseline`, which passes on ANY change.
  live.set(stamp(previousCommit, { dirty: true }));
  const unrelated = 'ffffffffffff';
  setTimeout(() => live.set(stamp(unrelated, { dirty: true })), 40);

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  const pushed = short(root);

  assert.notEqual(unrelated, pushed, 'the stamp the site moved to is not the commit that was pushed');
  assert.equal(res.published, false, 'a different commit is not this run’s deploy');
  assert.equal(res.reason, 'stamp-did-not-advance');
  assert.equal(existsSync(join(root, 'HOLD.md')), true);
});

test('declared: the live build being dirty does not defeat the match — Vercel rebuilds derived data every build', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  stageableChange(root, 'fifth\n');
  writeLocalBuildStamp(root, previousCommit);

  const step = publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  const landed = await new Promise((resolve) => {
    const timer = setInterval(() => {
      const head = short(root);
      if (head !== previousCommit) {
        clearInterval(timer);
        // The live build reports `+dirty` because prebuild regenerates
        // date-dependent derived data. That flag is telling the truth and the
        // check must see through it rather than suppress it.
        live.set(stamp(head, { dirty: true }));
        resolve(head);
      }
    }, 10);
  });

  const res = await step;
  assert.equal(res.published, true);
  assert.equal(res.stamp, landed);
});

test('undeclared: with nothing to commit, the run waits for the commit the site should already be serving', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  // No working-tree change: the step commits nothing and pushes a no-op. The
  // commit the site must serve is the current HEAD, and it does.
  //
  // Deliberately UNDECLARED, and not convertible: the no-op `git push` this
  // asserts is exactly what the declared branch refuses to perform (see the
  // next test). This documents the branch `loop/lib/publish.mjs` still takes,
  // and the pair of tests is the behavioural difference between them
  // (addictedtoai-7ri).
  live.set(stamp(previousCommit, { dirty: true }));

  const res = await publishStep(root, { ...FAST, log: { step: () => {} } });
  assert.equal(short(root), previousCommit, 'no commit was created');
  assert.equal(res.published, true);
  assert.equal(res.stamp, previousCommit);
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});

test('declared: with nothing of its own and nothing the remote lacks, the run does not push at all', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);
  live.set(stamp(previousCommit, { dirty: true }));

  // The same situation as the test above, declared. `owned: []` is a statement
  // ("I wrote nothing"), not an absence, and the step answers it by not
  // pushing — which is what stops `npm test` from being a command that can
  // reach a live remote (addictedtoai-64y). Asserted here rather than only in
  // publish.test.mjs because this file is the one that can actually push.
  const warnings = [];
  const res = await publishStep(root, { owned: [], ...FAST, log: { step: () => {}, warn: (m) => warnings.push(m) } });
  assert.equal(res.published, false);
  assert.equal(res.reason, 'nothing-owned');
  assert.equal(short(root), previousCommit, 'no commit was created');
  assert.equal(live.hits, 0, 'the deploy poll never started, so nothing was pushed to wait for');
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
  // The wholesale branch's "this run did not write it" warning belongs to the
  // other branch and must not appear here; asserting it is what tells the two
  // branches apart in the log as well as in the outcome.
  assert.deepEqual(warnings, [], 'the declared branch emits no undeclared-staging warning');
});

test('undeclared: the wholesale branch still stages and pushes for real — the Desk reaches it', async (t) => {
  const { root, remote, live, previousCommit } = await withFixture(t);

  // The Desk publishes through `loop/lib/publish.mjs`, which calls the shared
  // step with no `owned`. Arming `pulse/run.mjs` moved the Pulse to the other
  // branch; it did not retire this one, so it keeps a push-level test of its
  // own rather than being covered only by a no-op push (addictedtoai-7ri).
  stageableChange(root, 'sixth\n');
  writeFileSync(join(root, 'data', 'unattributable.json'), '{"someone":"else"}\n', 'utf8');

  const warnings = [];
  const step = publishStep(root, { ...FAST, log: { step: () => {}, warn: (m) => warnings.push(m) } });
  const landed = await new Promise((resolve) => {
    const timer = setInterval(() => {
      const head = short(root);
      if (head !== previousCommit) {
        clearInterval(timer);
        live.set(stamp(head, { dirty: true }));
        resolve(head);
      }
    }, 10);
  });

  const res = await step;
  assert.equal(res.published, true);
  assert.equal(res.stamp, landed);
  // Wholesale means wholesale: read off the REMOTE, the commit carries the
  // foreign file too. That is the behaviour `addictedtoai-ps3` describes, and
  // asserting it here is what makes the declared branch's contrast a
  // measurement rather than a claim.
  assert.deepEqual(
    remoteCommitFiles(remote),
    ['content/seed.md', 'data/unattributable.json'],
    'the undeclared branch commits everything dirty under the staging directories',
  );
  // And says so first. This is the announcement addictedtoai-ps3 asked for:
  // the wholesale branch is no longer allowed to be silent about it.
  assert.deepEqual(
    warnings.map((w) => w.replace(/ —.*/, '')),
    ['publish will commit content/seed.md, which this run did not write'],
    'the wholesale branch names the content file it cannot attribute',
  );
});

test('declared: the commit that reaches the remote holds only what the run declared', async (t) => {
  const { root, remote, live, previousCommit } = await withFixture(t);

  // The contrast to the test above, on the same fixture, differing only in
  // whether `owned` is passed. This is `addictedtoai-ps3`/`-y7d` end to end at
  // push level: a file the run did not write is left dirty and never reaches
  // the remote.
  stageableChange(root, 'seventh\n');
  writeFileSync(join(root, 'data', 'unattributable.json'), '{"someone":"else"}\n', 'utf8');

  const step = publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  const landed = await new Promise((resolve) => {
    const timer = setInterval(() => {
      const head = short(root);
      if (head !== previousCommit) {
        clearInterval(timer);
        live.set(stamp(head, { dirty: true }));
        resolve(head);
      }
    }, 10);
  });

  const res = await step;
  assert.equal(res.published, true);
  assert.equal(res.stamp, landed);
  assert.deepEqual(remoteCommitFiles(remote), ['content/seed.md'], 'only the declared path was committed');
  assert.match(
    git(root, ['status', '--porcelain', '--', 'data/unattributable.json']),
    /unattributable\.json/,
    'the foreign file is still dirty in the working tree — untouched, not published',
  );
});

// ---------------------------------------------------------------------------
// addictedtoai-k2y0 — containment, the confirmation window, and the classified
// hold. A missed deploy and a slow one were the same fact until this block.
// ---------------------------------------------------------------------------

/**
 * Wait until the step's push has reached the fixture remote.
 *
 * The only sync point that is guaranteed to be AFTER the step read `expected`
 * with `git rev-parse HEAD`. Watching the local HEAD instead — which the older
 * tests do, correctly, for their purpose — races: a test that commits on top
 * the moment HEAD moves can land its commit BEFORE the step reads `expected`,
 * and then the step pushes and waits for that commit, which is equality again
 * and tests nothing.
 */
function afterPush(remote, before) {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      let tip;
      try {
        tip = git(remote, ['rev-parse', 'main']);
      } catch {
        return;
      }
      if (tip !== before) {
        clearInterval(timer);
        resolve(tip);
      }
    }, 10);
  });
}

/** Commit a new file on the current branch and return its short id. */
function commitOnTop(root, name, text) {
  writeFileSync(join(root, 'content', name), text, 'utf8');
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', `fixture: ${name}`]);
  return short(root);
}

const holdText = (root) => readFileSync(join(root, 'HOLD.md'), 'utf8');

/**
 * Every fact specs/pulse requires a deploy hold to carry.
 *
 * `first`/`confirm` are asserted as WRITTEN VALUES, not as a duration-shaped
 * field: a hold that names one window and shapes the other is exactly the hold
 * whose reader has to re-measure what the run already knew.
 */
function assertDeployHold(root, { pushed, classification, lastSeen, first, confirm }) {
  const text = holdText(root);
  assert.match(
    text,
    new RegExp(`^deploy-hold: ${pushed} ${classification}$`, 'm'),
    `the machine-readable marker line is missing or wrong:\n${text}`,
  );
  assert.match(text, new RegExp(`^- classification: ${classification} `, 'm'), text);
  assert.match(text, new RegExp(`^- last live build stamp read: ${lastSeen}`, 'm'), text);
  assert.match(text, new RegExp(`^- first window: ${first} ms`, 'm'), text);
  assert.match(text, new RegExp(`^- confirmation window: ${confirm} ms`, 'm'), text);
  return text;
}

test('declared: a stamp naming a DESCENDANT of the pushed commit is a landed deploy', async (t) => {
  // The false halt available today on ordinary concurrency, with no vendor
  // fault required: two publishers share this step, so a merge that pushes on
  // top of a Pulse commit while the Pulse is still polling makes the Pulse's
  // equality check fail on a deploy that is serving the Pulse's own bytes.
  const { root, remote, live } = await withFixture(t);
  const beforeTip = git(remote, ['rev-parse', 'main']);
  stageableChange(root, 'descendant\n');

  const step = publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  const pushed = await afterPush(remote, beforeTip);
  const descendant = commitOnTop(root, 'later.md', 'another publisher got there first\n');
  live.set(stamp(descendant, { dirty: true }));

  const res = await step;
  assert.notEqual(descendant, pushed.slice(0, 12), 'the live stamp is a different commit from the pushed one');
  assert.equal(res.published, true, `a commit containing the pushed one serves its bytes:\n${JSON.stringify(res)}`);
  assert.equal(res.stamp, descendant);
  assert.equal(existsSync(join(root, 'HOLD.md')), false, 'a landed deploy writes no hold');
});

test('declared: CONTROL — a stamp naming a SIBLING commit is not a landed deploy', async (t) => {
  // Without this the test above proves nothing: "resolves to some commit" would
  // pass it. A sibling shares the pushed commit's parent and contains none of
  // its bytes, and ancestry is the only test that can tell the two apart —
  // "newer" is a clock, and a clock cannot tell a descendant from a fork.
  const { root, remote, live } = await withFixture(t);
  const beforeTip = git(remote, ['rev-parse', 'main']);
  stageableChange(root, 'sibling\n');

  const step = publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  const pushed = await afterPush(remote, beforeTip);
  git(root, ['checkout', '-q', '-b', 'fork', `${pushed}^`]);
  const sibling = commitOnTop(root, 'fork.md', 'a fork of the same parent\n');
  live.set(stamp(sibling, { dirty: true }));

  const res = await step;
  assert.equal(res.published, false, 'a commit that does not contain the pushed one is not this deploy');
  assert.equal(res.reason, 'stamp-did-not-advance');
  assert.equal(res.classification, DEPLOY_CLASSIFICATIONS.ADVANCED_ELSEWHERE);
  assert.equal(existsSync(join(root, 'HOLD.md')), true);
});

test('the containment check fails closed on everything it cannot answer', async (t) => {
  const { root } = await withFixture(t);
  const pushedSha = git(root, ['rev-parse', 'HEAD']);
  const descendant = commitOnTop(root, 'later.md', 'on top\n');

  // The positive control lives in the same test, so "everything fails" cannot
  // pass it.
  assert.equal(stampMatchesCommit(root, descendant, pushedSha), true, 'a descendant resolves and contains it');

  assert.equal(stampMatchesCommit(root, 'unknown', pushedSha), false, 'a builder with no git');
  assert.equal(stampMatchesCommit(root, '2026-08-29T00:00:00Z', pushedSha), false, 'a bare timestamp');
  assert.equal(stampMatchesCommit(root, 'deadbeefdead', pushedSha), false, 'well-formed, and no such commit here');

  // A git invocation that errors is "not landed", never "landed". Injected at
  // the ancestry call specifically: resolution has already succeeded, so this
  // is the branch that would otherwise be tempted to assume.
  const calls = [];
  const runGit = (r, args) => {
    calls.push(args[0]);
    if (args[0] === 'merge-base') return { ok: false, out: '' };
    try {
      return { ok: true, out: execFileSync('git', ['-C', r, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() };
    } catch {
      return { ok: false, out: '' };
    }
  };
  assert.equal(stampMatchesCommit(root, descendant, pushedSha, { runGit }), false, 'a failed ancestry test is not a pass');
  assert.ok(calls.includes('merge-base'), `the ancestry call was never reached: ${calls.join(', ')}`);
});

test('declared: a stamp that arrives only after the first budget is a SLOW deploy, not a missed one', async (t) => {
  const { root, remote, live } = await withFixture(t);
  const beforeTip = git(remote, ['rev-parse', 'main']);
  stageableChange(root, 'slow\n');

  let pushed;
  let announcedConfirmationWindow = false;
  const step = publishStep(root, {
    ...DECLARED,
    ...SLOW,
    log: {
      step: (n, d) => {
        // Flip the stamp from the step's own confirmation-window announcement
        // rather than from the clock: `pollWindow` always runs at least one
        // iteration before its deadline check, so this guarantees the flip is
        // observed once the confirmation window is polling, instead of racing
        // a fixed-delay timer against however long a poll iteration happens to
        // take on this machine right now. The flag records that the flip fired
        // FROM that announcement — the deterministic proof that the first
        // window was already exhausted, in place of a wall-clock comparison
        // between two loosely-synchronised timers (the test's `Date.now()` and
        // `publishStep`'s own), which is exactly the kind of race this whole
        // fix removes.
        if (pushed && /polling a confirmation window/.test(d)) {
          announcedConfirmationWindow = true;
          live.set(stamp(pushed.slice(0, 12), { dirty: true }));
        }
      },
    },
  });
  pushed = await afterPush(remote, beforeTip);

  const res = await step;
  assert.equal(res.published, true, 'a commit that is not live at ten minutes and is live at thirty is a slow deploy');
  assert.ok(announcedConfirmationWindow, 'the flip happened only after the step itself announced the first window had elapsed');
  assert.equal(res.window, 'confirmation', 'the run records WHICH window it landed in — the two are not the same fact');
  assert.equal(existsSync(join(root, 'HOLD.md')), false, 'a slow deploy is not a halt');
});

test('declared: CONTROL — a stamp that never carries it is polled through BOTH windows and then halts', async (t) => {
  const { root } = await withFixture(t);
  stageableChange(root, 'never\n');

  const started = Date.now();
  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  const elapsed = Date.now() - started;

  assert.equal(res.published, false);
  assert.equal(res.reason, 'stamp-did-not-advance');
  assert.equal(existsSync(join(root, 'HOLD.md')), true, 'a missed deploy is still a halt');
  // A floor, and honestly only a floor: MEASURED 2026-09-07 by deleting the
  // second window, this assertion still passed, because a poll that spawns git
  // twice per reading takes long enough at a 150 ms budget to reach 600 ms on
  // its own. The test that actually detects a deleted confirmation window is
  // the SLOW one above, which fails on that mutation. Kept because it is the
  // cheap direct check that both windows are at least budgeted for.
  assert.ok(
    elapsed >= FAST.pollBudgetMs * 4,
    `both windows must elapse before the halt; only ${elapsed} ms passed`,
  );
  assert.deepEqual(res.windows, { first_ms: FAST.pollBudgetMs, confirmation_ms: FAST.pollBudgetMs * 3 });
});

// --- the six holds: one per classification, plus the residual and boundary
// --- cases the first draft of the set did not cover.

test('hold: never-advanced — every reading returned the stamp that was live before the push', async (t) => {
  const { root, previousCommit } = await withFixture(t);
  stageableChange(root, 'never-advanced\n');

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  assert.equal(res.classification, DEPLOY_CLASSIFICATIONS.NEVER_ADVANCED);
  assertDeployHold(root, {
    pushed: git(root, ['rev-parse', 'HEAD']),
    classification: 'never-advanced',
    lastSeen: previousCommit,
    first: FAST.pollBudgetMs,
    confirm: FAST.pollBudgetMs * 3,
  });
});

test('hold: advanced-elsewhere — the stamp moved to a commit that is not this one', async (t) => {
  const { root, live } = await withFixture(t);
  stageableChange(root, 'elsewhere\n');
  setTimeout(() => live.set(stamp('ffffffffffff', { dirty: true })), 40);

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  assert.equal(res.classification, DEPLOY_CLASSIFICATIONS.ADVANCED_ELSEWHERE);
  assertDeployHold(root, {
    pushed: git(root, ['rev-parse', 'HEAD']),
    classification: 'advanced-elsewhere',
    lastSeen: 'ffffffffffff',
    first: FAST.pollBudgetMs,
    confirm: FAST.pollBudgetMs * 3,
  });
});

test('hold: unreadable — the live site could not be read at all', async (t) => {
  const { root } = await withFixture(t, { aliveUntil: 0 });
  stageableChange(root, 'unreadable\n');

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  assert.equal(res.classification, DEPLOY_CLASSIFICATIONS.UNREADABLE);
  assertDeployHold(root, {
    pushed: git(root, ['rev-parse', 'HEAD']),
    classification: 'unreadable',
    lastSeen: 'none — no reading succeeded after the push',
    first: FAST.pollBudgetMs,
    confirm: FAST.pollBudgetMs * 3,
  });
});

test('hold: a baseline that could not be read while later readings could is advanced-elsewhere', async (t) => {
  // The residual case. `never-advanced` is a positive test — at least one
  // reading succeeded and every one equalled the baseline — and a null baseline
  // equals nothing, so this falls to the complement rather than into a gap.
  const { root, previousCommit } = await withFixture(t, { deadUntil: 1 });
  stageableChange(root, 'no-baseline\n');

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  assert.equal(res.classification, DEPLOY_CLASSIFICATIONS.ADVANCED_ELSEWHERE);
  assertDeployHold(root, {
    pushed: git(root, ['rev-parse', 'HEAD']),
    classification: 'advanced-elsewhere',
    lastSeen: previousCommit,
    first: FAST.pollBudgetMs,
    confirm: FAST.pollBudgetMs * 3,
  });
});

test('hold: a reading that is not a commit at all is advanced-elsewhere', async (t) => {
  const { root, live } = await withFixture(t);
  stageableChange(root, 'unknown-stamp\n');
  setTimeout(() => live.set(stamp('unknown', { dirty: true })), 40);

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  assert.equal(res.classification, DEPLOY_CLASSIFICATIONS.ADVANCED_ELSEWHERE);
  assertDeployHold(root, {
    pushed: git(root, ['rev-parse', 'HEAD']),
    classification: 'advanced-elsewhere',
    lastSeen: 'unknown',
    first: FAST.pollBudgetMs,
    confirm: FAST.pollBudgetMs * 3,
  });
});

test('hold: a readable baseline followed by nothing readable is unreadable, and says nothing about the stamp', async (t) => {
  // THE DEFECT THIS REPLACES, measured rather than assumed. The old clause was
  // `(baseline && lastSeen === baseline ? ' — unchanged since before the push' : '')`,
  // and `lastSeen` started at the baseline and advanced only on a successful
  // poll. So a run whose baseline read succeeded and whose every post-push poll
  // failed reached the hold with a truthy baseline and `lastSeen === baseline`,
  // and the hold asserted "unchanged since before the push" about a run that had
  // read nothing after the push at all.
  const { root } = await withFixture(t, { aliveUntil: 1 });
  stageableChange(root, 'baseline-then-dark\n');

  const res = await publishStep(root, { ...DECLARED, ...FAST, log: { step: () => {} } });
  assert.equal(res.classification, DEPLOY_CLASSIFICATIONS.UNREADABLE);
  const text = assertDeployHold(root, {
    pushed: git(root, ['rev-parse', 'HEAD']),
    classification: 'unreadable',
    lastSeen: 'none — no reading succeeded after the push',
    first: FAST.pollBudgetMs,
    confirm: FAST.pollBudgetMs * 3,
  });
  assert.doesNotMatch(text, /unchanged since before the push/, text);
});
