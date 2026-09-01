/**
 * Task 7.2 — the merge's publish step.
 *
 * specs/loop requires the loop to publish "through the same publish step the
 * Pulse uses". Same, not equivalent: a second implementation would drift, and
 * the drifted one would be the one that pushed. So this file checks the
 * handoff itself, against the real shared step — the cheap direct check,
 * rather than a fixture that would have passed even if the two had never been
 * wired together.
 *
 * ## The incident this file's shape comes from (addictedtoai-64y)
 *
 * The handoff used to be exercised by calling `publishStep` with a context
 * whose `repoRoot` was `DEFAULT_REPO_ROOT` — this repository — on the reasoning
 * that `publish` was false throughout the build phase, so the shared step would
 * read the flag, print one skip line and return.
 *
 * That assumption expired on 2026-08-29, when the maintainer set
 * `publish: true` once the site went live. Nothing re-checked it. `loop/lib/
 * publish.mjs` deliberately does not forward a config override — the design is
 * that the shared step is the single reader of the flag — so the call took the
 * true path against the real repository: `git push origin main` at the live
 * remote, a ten-minute poll, and `HOLD.md` written into the repository root.
 * Measured in an `npm test` run that took 607.9 seconds. Nothing was published
 * (the working tree matched HEAD under the staged paths, so no commit was made
 * and the push was a no-op), but `npm test` must not be a command that can
 * reach the remote at all.
 *
 * ## What replaced it, and why this is structural rather than careful
 *
 * The tests below never hand the real repository root to `publishStep`. The
 * handoff is asserted against a **throwaway repository** carrying a byte-for-
 * byte copy of the real `pulse/lib/publish.mjs` — and the closure of the
 * modules it imports — at the path `findSharedStep` looks in, with its own
 * `data/config.json` and no `origin` remote at all. So:
 *
 *   - the shared step under test is the shipped one, not a stub — a
 *     reimplementation in `loop/` would print different lines and return a
 *     different shape, and the last test below reads every source file under
 *     `loop/` and fails if any of them contains a push;
 *   - the flag stays the shared step's to read, and the fixture's copy of it
 *     is what gets read, so `publish: true` can be exercised in full;
 *   - the only reachable remote is one that does not exist, and the only
 *     reachable site is a loopback server this file starts. What the real
 *     `data/config.json` says cannot change any of that.
 *
 * The one thing a fixture root cannot assert — that the real repository
 * actually contains a shared step where the loop looks for it — is the first
 * test, and it is a read of the filesystem, not a call into anything.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { DEFAULT_REPO_ROOT } from '../lib/paths.mjs';
import { findSharedStep, publishStep, FALLBACK_SKIP_LINE } from '../lib/publish.mjs';
import { makeRepo, DEFAULT_CONFIG } from './helpers.mjs';

const REAL_STEP = join(DEFAULT_REPO_ROOT, 'pulse', 'lib', 'publish.mjs');

/**
 * Every file the fixture copies, repo-relative: the shared step and the whole
 * closure of its RELATIVE imports.
 *
 * It used to be two entries, with a comment saying `publish.mjs` imports only
 * `./core.mjs` and node builtins. That stopped being true when the step gained
 * its IndexNow phase (beads addictedtoai-k1j), and the way it stopped being
 * true is the reason this list is now checked rather than described: the
 * fixture's dynamic import failed with `Cannot find module … indexnow.mjs`,
 * surfacing as a mismatched assertion four tests away from the actual problem.
 *
 * `closedUnderRelativeImports` below asserts the set is complete, so the next
 * import added anywhere in this graph fails HERE, naming the missing file,
 * instead of somewhere unrelated.
 */
const FIXTURE_FILES = [
  'pulse/lib/publish.mjs',
  'pulse/lib/core.mjs',
  'pulse/lib/indexnow.mjs',
  'lib/asset-routes.mjs',
  'lib/site-config.mjs',
];

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

/** Relative specifiers in a source file, resolved to repo-relative paths. */
function relativeImportsOf(rel) {
  const dir = rel.split('/').slice(0, -1);
  const out = [];
  const text = readFileSync(join(DEFAULT_REPO_ROOT, rel), 'utf8');
  for (const m of text.matchAll(/from\s+'(\.[^']+)'/g)) {
    const parts = [...dir];
    for (const seg of m[1].split('/')) {
      if (seg === '.') continue;
      else if (seg === '..') parts.pop();
      else parts.push(seg);
    }
    out.push(parts.join('/'));
  }
  return out;
}

/**
 * Is the copied set closed under relative imports? Returns what is missing.
 *
 * The mechanism that keeps FIXTURE_FILES honest. A hand-maintained list of
 * "what this module needs" is a second copy of the import graph, and the
 * second copy is the one that goes stale.
 */
function closedUnderRelativeImports(files = FIXTURE_FILES) {
  const have = new Set(files);
  const missing = new Set();
  for (const rel of files) {
    for (const target of relativeImportsOf(rel)) {
      if (!have.has(target)) missing.add(`${rel} -> ${target}`);
    }
  }
  return [...missing].sort();
}

/**
 * A throwaway repository that really does contain the Pulse's publish step.
 *
 * The files are copied rather than imported so that `findSharedStep` has
 * something to find at the canonical relative path and `loop/lib/publish.mjs`
 * performs its real dynamic import.
 */
function repoWithSharedStep(config) {
  const files = {};
  for (const rel of FIXTURE_FILES) files[rel] = readFileSync(join(DEFAULT_REPO_ROOT, rel), 'utf8');
  const ctx = makeRepo({ config: { ...DEFAULT_CONFIG, ...config }, files });
  // The copy has to be the shipped step, not a paraphrase of it.
  assert.equal(
    sha(readFileSync(join(ctx.repoRoot, 'pulse', 'lib', 'publish.mjs'))),
    sha(readFileSync(REAL_STEP)),
    'the fixture must carry the real shared step byte for byte',
  );
  assert.notEqual(ctx.repoRoot, DEFAULT_REPO_ROOT);
  return ctx;
}

const git = (dir, args) =>
  execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** A loopback `/status.json` that 404s, so no test can reach the live domain. */
async function loopbackSite(t) {
  const server = createServer((_req, res) => {
    res.writeHead(404);
    res.end('');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const prior = process.env.SITE_URL;
  process.env.SITE_URL = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    if (prior === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = prior;
    await new Promise((r) => server.close(r));
  });
}

test('the fixture copies the whole import closure of the shared step, not a remembered subset', () => {
  // beads addictedtoai-k1j. When the shared step gained an import that this
  // list did not know about, the fixture's dynamic import failed with
  // `Cannot find module`, and it surfaced as a mismatched assertion four tests
  // away — a failure that says nothing about its own cause. This test is the
  // one that should go red instead, and it names the missing file.
  assert.deepEqual(
    closedUnderRelativeImports(),
    [],
    'add the named file(s) to FIXTURE_FILES — the fixture repo cannot import what it does not carry',
  );
  for (const rel of FIXTURE_FILES) {
    assert.ok(existsSync(join(DEFAULT_REPO_ROOT, rel)), `${rel} must exist to be copied`);
  }
});

test('the loop finds the Pulse\'s shared publish step where it actually lives', () => {
  const found = findSharedStep(DEFAULT_REPO_ROOT);
  assert.ok(found, 'no shared publish step found — the loop would refuse to publish rather than improvise');
  assert.ok(existsSync(found));
  assert.match(found.replace(/\\/g, '/'), /pulse\/(lib\/)?publish\.mjs$/);
});

test('the loop hands off to the real shared step, which prints its own skip line', async (t) => {
  const ctx = repoWithSharedStep({ publish: false });
  t.after(() => ctx.cleanup());

  const res = await publishStep(ctx, {});
  assert.equal(res.published, false);
  assert.equal(res.result?.reason, 'disabled', 'the shared step read the flag and returned its own verdict');

  const text = ctx.output();
  assert.match(text, /publish/);
  assert.match(text, /disabled|publish: false/i, text);
  // and it is the shared step's line, not the loop's own fallback
  assert.ok(!text.includes(FALLBACK_SKIP_LINE), 'the loop must not print its own skip line when the shared step exists');
});

test('with publish: true the handoff reaches the true path — pointed at the fixture, not this repository', async (t) => {
  const ctx = repoWithSharedStep({ publish: true });
  t.after(() => ctx.cleanup());
  await loopbackSite(t);

  const head = git(ctx.repoRoot, ['rev-parse', 'HEAD']);
  const res = await publishStep(ctx, { dryRun: true });

  // `commands` is produced by the shared step's dry-run branch and by nothing
  // else, so its presence is the handoff, and its contents are the root the
  // handoff passed.
  const commands = res.result?.commands ?? [];
  assert.equal(res.result?.reason, 'dry-run');
  assert.ok(
    commands.includes(`git -C ${ctx.repoRoot} push origin main`),
    `the true path was printed against the fixture root; got:\n${commands.join('\n')}`,
  );
  for (const c of commands) {
    assert.ok(!c.includes(DEFAULT_REPO_ROOT), `a command named this repository: ${c}`);
  }
  assert.match(ctx.output(), /DRY RUN — publish would run/);
  assert.equal(git(ctx.repoRoot, ['rev-parse', 'HEAD']), head, 'a dry run commits nothing');
  assert.equal(existsSync(join(ctx.repoRoot, 'HOLD.md')), false);
});

test('armed and not dry — the push it attempts is the fixture\'s, and there is no remote to reach', async (t) => {
  // The strongest form of the guarantee: `publish: true`, no `--dry-run`, the
  // real shared step, the real handoff — and it still cannot leave the fixture,
  // because the fixture has no `origin` and the site is a loopback 404. What
  // this repository's own `data/config.json` says is not consulted anywhere.
  const ctx = repoWithSharedStep({ publish: true });
  t.after(() => ctx.cleanup());
  await loopbackSite(t);

  const head = git(ctx.repoRoot, ['rev-parse', 'HEAD']);
  await assert.rejects(
    () => publishStep(ctx, {}),
    (err) => {
      assert.match(err.message, /push origin main/, err.message);
      assert.ok(err.message.includes(ctx.repoRoot), `the push was aimed at the fixture: ${err.message}`);
      assert.ok(!err.message.includes(DEFAULT_REPO_ROOT), `the push named this repository: ${err.message}`);
      return true;
    },
  );
  assert.equal(git(ctx.repoRoot, ['rev-parse', 'HEAD']), head, 'nothing was committed either');
});

test('nothing under loop/ runs a push, so the handoff cannot be quietly reimplemented', () => {
  const offenders = [];
  // The shared step's own disabled line, kept in step with `pulse/lib/
  // publish.mjs` by hand. It changed on 2026-08-31 when committing stopped
  // being gated by the publish flag; if it changes again and this string does
  // not, this check goes quietly blind rather than failing, which is why the
  // assertion below names it.
  const skipLine = 'nothing pushed; committing is separate';
  assert.ok(
    readFileSync(join(DEFAULT_REPO_ROOT, 'pulse', 'lib', 'publish.mjs'), 'utf8').includes(skipLine),
    'the line this check looks for is no longer the shared step\'s — update it here',
  );
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'tests' || entry.name === 'node_modules') continue;
        walk(full);
      } else if (entry.name.endsWith('.mjs')) {
        const rel = relative(DEFAULT_REPO_ROOT, full).replace(/\\/g, '/');
        // Block comments and whole-line `//` comments go first; `loop/lib/
        // publish.mjs` explains at length why it does not push, and an
        // explanation is not an implementation. Trailing comments are left in
        // deliberately — this check errs toward failing.
        const code = readFileSync(full, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^[ \t]*\/\/.*$/gm, '');
        if (/(['"`])push\1/.test(code) || /push origin/.test(code)) offenders.push(`${rel}: runs a push`);
        if (code.includes(skipLine)) offenders.push(`${rel}: prints the shared step's own line`);
      }
    }
  };
  walk(join(DEFAULT_REPO_ROOT, 'loop'));
  assert.deepEqual(
    offenders,
    [],
    'publishing is the Pulse\'s step; a second implementation in loop/ is how a loop ends up pushing something nothing verified',
  );
});

test('no test in this file can be pointed at the real repository', () => {
  // `makeContext()` with no `repoRoot` resolves to `DEFAULT_REPO_ROOT`. That
  // one default is the whole of addictedtoai-64y: a context built without a
  // root, handed to a step whose job is to push. Every context here comes from
  // `makeRepo`, which always passes a temp root, so the way this regresses is
  // for a later edit to reach for `makeContext` again — and this fails if it
  // does. Comments are stripped so the file may keep explaining itself.
  const src = readFileSync(new URL(import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  assert.ok(
    !/\bmakeContext\s*\(/.test(src),
    'a context built without an explicit repoRoot is a context pointed at D:/AddictedtoAI',
  );
});

test('with no shared step present, the loop prints the skip line and never improvises a push', async () => {
  const ctx = makeRepo({});
  assert.equal(findSharedStep(ctx.repoRoot), null);
  const skipped = await publishStep(ctx, { cfg: { publish: false } });
  assert.equal(skipped.skipped, true);
  assert.match(ctx.output(), /publishing is disabled/);

  const refused = await publishStep(ctx, { cfg: { publish: true } });
  assert.equal(refused.published, false);
  assert.match(ctx.output(), /publish: REFUSED/);
  assert.match(ctx.output(), /Refusing to improvise one/);
  ctx.cleanup();
});
