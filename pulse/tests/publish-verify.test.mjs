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
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { publishStep } from '../lib/publish.mjs';

// Milliseconds. Small enough that the deploy-never-lands path finishes in well
// under a second, which is the only reason the poll window is injectable.
const FAST = { pollBudgetMs: 400, pollIntervalMs: 25 };

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

/** A loopback `/status.json` whose body each test moves when it chooses. */
async function serveStatus(initialBody) {
  let body = initialBody;
  let hits = 0;
  const server = createServer((req, res) => {
    hits++;
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
async function withFixture(t) {
  const { root, remote } = makeRepo();
  const previousCommit = short(root);
  const live = await serveStatus(stamp(previousCommit, { dirty: true }));
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

// ---------------------------------------------------------------------------

test('a deploy that never lands is a HOLD, not a success — the pre-commit stamp must not satisfy the check', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  // Exactly the situation `pulse/run.mjs` creates: the build ran before the
  // commit, so the local stamp carries the PREVIOUS commit, and the live site
  // is still serving that same previous commit because that is what the last
  // run deployed.
  stageableChange(root, 'second\n');
  writeLocalBuildStamp(root, previousCommit);
  live.set(stamp(previousCommit, { dirty: true }));

  const res = await publishStep(root, { ...FAST, log: { step: () => {} } });
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

test('success is confirmed against the commit the push actually placed on the remote', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  stageableChange(root, 'third\n');
  writeLocalBuildStamp(root, previousCommit);
  live.set(stamp(previousCommit, { dirty: true }));

  // The deploy lands partway through the poll window.
  const step = publishStep(root, { ...FAST, log: { step: () => {} } });
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

test('a live stamp that merely changes is not a confirmation — there is no any-change fallback', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  stageableChange(root, 'fourth\n');
  // No local build stamp at all: under the old code this made `expected` null
  // and fell through to `id !== baseline`, which passes on ANY change.
  live.set(stamp(previousCommit, { dirty: true }));
  const unrelated = 'ffffffffffff';
  setTimeout(() => live.set(stamp(unrelated, { dirty: true })), 40);

  const res = await publishStep(root, { ...FAST, log: { step: () => {} } });
  const pushed = short(root);

  assert.notEqual(unrelated, pushed, 'the stamp the site moved to is not the commit that was pushed');
  assert.equal(res.published, false, 'a different commit is not this run’s deploy');
  assert.equal(res.reason, 'stamp-did-not-advance');
  assert.equal(existsSync(join(root, 'HOLD.md')), true);
});

test('the live build being dirty does not defeat the match — Vercel rebuilds derived data every build', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  stageableChange(root, 'fifth\n');
  writeLocalBuildStamp(root, previousCommit);

  const step = publishStep(root, { ...FAST, log: { step: () => {} } });
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

test('with nothing to commit, the run waits for the commit the site should already be serving', async (t) => {
  const { root, live, previousCommit } = await withFixture(t);

  // No working-tree change: the step commits nothing and pushes a no-op. The
  // commit the site must serve is the current HEAD, and it does.
  live.set(stamp(previousCommit, { dirty: true }));

  const res = await publishStep(root, { ...FAST, log: { step: () => {} } });
  assert.equal(short(root), previousCommit, 'no commit was created');
  assert.equal(res.published, true);
  assert.equal(res.stamp, previousCommit);
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});
