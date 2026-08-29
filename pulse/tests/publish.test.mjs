/**
 * publish.test.mjs — task 3.9: the publish step.
 *
 * **No test in this file may push anywhere but a bare repository in the OS
 * temp directory.** The first half of the file drives the real `pulse/run.mjs`
 * through `--dry-run`, which executes nothing; the second half runs the true
 * path against a throwaway repository whose `origin` is a plain filesystem
 * path — or, where the point is that nothing is pushed at all, a repository
 * with no `origin` configured, so a push could only fail loudly. Nothing here
 * reaches `D:/AddictedtoAI`, GitHub, Vercel or the live domain, whatever
 * `data/config.json` says.
 *
 * The structural guarantee this file has always tested still stands:
 * `--assume-publish` cannot be combined with a real run, because
 * `data/config.json` is the only thing that can arm a push and it is a
 * reserved path.
 *
 * That contract is also why this file could not have caught
 * `addictedtoai-1ml`: the deploy *verification* only runs on the true path, so
 * nothing here ever executed it, and the suite stayed green for the whole life
 * of a mechanism that could not confirm a single one of its own deploys. That
 * path is covered in `publish-verify.test.mjs`.
 *
 * ## What the second half is for (addictedtoai-ps3)
 *
 * The step used to stage `data content public` wholesale, and on 2026-08-29 a
 * scheduled Pulse swept an uncommitted `data/launch.json` edit — an agent's
 * work in progress — into its own commit and pushed it to the live site. The
 * tests below construct exactly that situation, dirty file and all, and assert
 * on the resulting commit rather than on the step's intentions.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cleanup, makeRoot, runPulse } from './helpers.mjs';
import { classifyWorkingTree, isEngineWrite, publishStep } from '../lib/publish.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];

/**
 * Make a fixture root a git repository, with no `origin`.
 *
 * Needed since `addictedtoai-y7d` armed `pulse/run.mjs` with `owned`: the
 * declared branch asks git what is dirty before it can attribute anything, and
 * in a directory that is not a repository it answers "cannot tell" and stops
 * (`reason: 'tree-unreadable'`) — which is the right answer for a real run and
 * happens *before* the dry-run plan is printed. The real repository is always a
 * repository, so this only ever bit fixtures; measured 2026-08-29, the same
 * dry run in a git root prints the full plan and now names the exact paths it
 * would stage instead of `data content public`.
 *
 * No `origin` is configured on purpose: a push from one of these roots could
 * only fail loudly, never reach a real remote.
 */
function gitInit(root) {
  const run = (args) => execFileSync('git', ['-C', root, ...args], { stdio: 'ignore' });
  execFileSync('git', ['init', root], { stdio: 'ignore' });
  run(['symbolic-ref', 'HEAD', 'refs/heads/main']);
  run(['config', 'user.email', 'pulse@example.invalid']);
  run(['config', 'user.name', 'Pulse Test']);
  run(['config', 'commit.gpgsign', 'false']);
  return root;
}

/** Does this repository hold any commit at all? */
function hasCommits(root) {
  try {
    execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

test('with publish: false the step prints one line and does nothing else', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const publishLines = run.out.split('\n').filter((l) => l.includes('publish'));
  assert.equal(publishLines.length, 1, `expected exactly one publish line, got:\n${publishLines.join('\n')}`);
  assert.match(publishLines[0], /publish — disabled \(data\/config\.json has publish: false\) — nothing committed, nothing pushed/);
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});

test('--dry-run with publish assumed prints the exact commands and the poll target, and executes nothing', async (t) => {
  const root = gitInit(makeRoot([], { publish: false }));
  t.after(() => cleanup(root));

  const run = await runPulse(root, [...ARGS, '--dry-run', '--assume-publish'], { SITE_URL: 'https://www.addictedtoai.net' });
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /DRY RUN — publish would run/);
  assert.match(run.out, /would run: git -C .* add /);
  assert.match(run.out, /would run: git -C .* commit -m "pulse: \d{4}-\d{2}-\d{2} data and content update"/);
  assert.match(run.out, /would run: git -C .* push origin main/);
  assert.match(run.out, /would poll: https:\/\/www\.addictedtoai\.net\/status\.json every 20s for up to 10 minutes/);
  assert.match(run.out, /would write .*HOLD\.md if the stamp does not advance/);
  assert.match(run.out, /DRY RUN — nothing was committed and nothing was pushed/);
  // The direct form of "executes nothing", now that the root is a repository:
  // not "no repository was created" but "no commit exists in it".
  assert.equal(hasCommits(root), false, 'a dry run creates no commit');
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});

test('the run declares its own writes, so the step never falls back to wholesale staging', async (t) => {
  // Replaces 'an undeclared caller is told ... that it is staging wholesale',
  // which asserted the gap `addictedtoai-y7d` closed: `pulse/run.mjs` now
  // passes `owned`, so the undeclared notice must NOT appear. The property
  // that test was really protecting — that wholesale staging is never silent —
  // still holds and is covered by publish-verify.test.mjs, where the Desk's
  // undeclared branch asserts the warning it emits.
  //
  // Asserted from the outside, on the real program's output, rather than by
  // reading the call site: the whole failure mode of ps3 was a mechanism that
  // existed and was not wired up.
  const root = gitInit(makeRoot([], { publish: false }));
  t.after(() => cleanup(root));

  const run = await runPulse(root, [...ARGS, '--dry-run', '--assume-publish']);
  assert.equal(run.status, 0, run.out);
  assert.doesNotMatch(
    run.out,
    /declared no writes of its own/,
    'the Pulse declares what it wrote; seeing the undeclared-caller notice means the arming came undone',
  );

  const addLine = run.out.split('\n').find((l) => /would run: git -C .* add /.test(l));
  assert.ok(addLine, `no staging command was printed:\n${run.out}`);
  // The distinction ps3 is about: exact paths, not the three directories.
  assert.doesNotMatch(addLine, /add data content public\s*$/, 'wholesale staging is what the fix removed');
  assert.match(addLine, /data\/derived\/queue\.json/, 'the run stages the derived files it just recomputed');
  // Attribution by path covers the engine's own writes and stops there:
  // data/config.json is reserved and nobody's to publish on another's behalf.
  assert.match(run.out, /not staging data\/config\.json — dirty, but not this run's to publish/);
});

test('--dry-run alone respects publish: false — the config is the gate', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const run = await runPulse(root, [...ARGS, '--dry-run']);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /publish — disabled/);
  assert.doesNotMatch(run.out, /would run: git/);
});

test('--assume-publish without --dry-run is refused outright', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));

  const run = await runPulse(root, [...ARGS, '--assume-publish']);
  assert.notEqual(run.status, 0, 'the run fails rather than proceeding');
  assert.match(run.out, /--assume-publish is only honored together with --dry-run/);
  assert.doesNotMatch(run.out, /push origin main/, 'no push command is even printed');
});

test('publishing is suspended while HOLD.md stands', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const { writeFileSync: write } = await import('node:fs');
  write(join(root, 'HOLD.md'), '# HOLD\n\ndeploy failed earlier\n', 'utf8');

  const run = await runPulse(root, [...ARGS, '--dry-run', '--assume-publish']);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /HOLD\.md present .* publish suspended until the hold clears/);
  assert.doesNotMatch(run.out, /would run: git/);
});

// ---------------------------------------------------------------------------
// addictedtoai-ps3 — what the step is allowed to stage.
// ---------------------------------------------------------------------------

/** Milliseconds. The deploy never lands in these tests; the commit is the subject. */
const FAST = { pollBudgetMs: 300, pollIntervalMs: 25 };
const QUIET = { log: { step: () => {}, warn: () => {} } };

function git(dir, args, opts = {}) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], ...opts }).trim();
}

function write(root, rel, text) {
  const file = join(root, rel);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, text, 'utf8');
  return file;
}

/**
 * A throwaway repository shaped like this one: a `data/` tree the Pulse writes
 * into, a `data/launch.json` it does not, and a `content/` corpus.
 *
 * `remote: false` gives it no `origin` at all, which is how a test proves a
 * push did not happen rather than asserting that it did not: with nothing named
 * `origin`, `git push origin main` cannot succeed quietly.
 */
function makeGitRoot({ publish = true, remote = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'pulse-ps3-'));
  const bare = remote ? mkdtempSync(join(tmpdir(), 'pulse-ps3-remote-')) : null;
  if (bare) execFileSync('git', ['init', '--bare', bare], { stdio: 'ignore' });
  execFileSync('git', ['init', root], { stdio: 'ignore' });
  git(root, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(root, ['config', 'user.email', 'pulse@example.invalid']);
  git(root, ['config', 'user.name', 'Pulse Test']);
  git(root, ['config', 'commit.gpgsign', 'false']);
  git(root, ['config', 'core.autocrlf', 'false']);
  if (bare) git(root, ['remote', 'add', 'origin', bare.replace(/\\/g, '/')]);

  write(root, 'data/config.json', JSON.stringify({ publish }, null, 2) + '\n');
  write(root, 'data/launch.json', JSON.stringify({ measurements: [] }, null, 2) + '\n');
  write(root, 'data/derived/queue.json', JSON.stringify({ items: [] }, null, 2) + '\n');
  write(root, 'data/sources/registry.json', JSON.stringify({ version: 1, sources: [] }, null, 2) + '\n');
  write(root, 'content/wiki/model/existing.md', '---\nid: existing\n---\n');
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'fixture: base']);
  if (bare) git(root, ['push', 'origin', 'main']);
  return { root, bare };
}

function dropRoot(...dirs) {
  for (const d of dirs) {
    if (!d) continue;
    try {
      rmSync(d, { recursive: true, force: true, maxRetries: 3 });
    } catch {
      /* a locked temp dir on Windows is not a test failure */
    }
  }
}

/** A loopback `/status.json` that always 404s, so the poll is real but instant. */
async function deadSite(t) {
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

/** The paths a commit touched, POSIX, sorted. */
function commitPaths(root, rev = 'HEAD') {
  const out = git(root, ['show', '--pretty=format:', '--name-only', rev]);
  return out.split('\n').map((l) => l.trim()).filter(Boolean).sort();
}

test('a dirty file this run did not write is never staged, never committed, never pushed', async (t) => {
  const { root, bare } = makeGitRoot();
  t.after(() => dropRoot(root, bare));
  await deadSite(t);

  // The Pulse recomputed its derived queue. Someone else, in the same tree, was
  // midway through an edit to data/launch.json — the exact file swept into the
  // Pulse's commit 998ee0a on 2026-08-29.
  write(root, 'data/derived/queue.json', JSON.stringify({ items: [{ id: 'x' }] }, null, 2) + '\n');
  write(root, 'data/launch.json', JSON.stringify({ measurements: ['half-written'] }, null, 2) + '\n');

  const res = await publishStep(root, { owned: [], ...FAST, ...QUIET });

  // The deploy never lands against a 404, so breaker 2 fires — unchanged
  // behaviour, and it writes the hold into the FIXTURE, not this repository.
  assert.equal(res.published, false);
  assert.equal(res.reason, 'stamp-did-not-advance');
  assert.equal(existsSync(join(root, 'HOLD.md')), true);

  assert.deepEqual(
    commitPaths(root),
    ['data/derived/queue.json'],
    'the commit carries only what the run can attribute to itself',
  );
  // Porcelain's two status columns are index-then-worktree, and this helper
  // trims: `M path` is "modified in the worktree only". A staged edit would
  // read `M  path`, with the marker in the first column, and fail this match.
  assert.match(
    git(root, ['status', '--porcelain', '--', 'data/launch.json']),
    /^M data\/launch\.json$/,
    'the foreign edit is still sitting in the working tree, unstaged and uncommitted',
  );
  // And what reached the remote is the same thing, read back from the remote.
  assert.deepEqual(commitPaths(root, 'origin/main'), ['data/derived/queue.json']);
});

test('an uncommitted content file this run did not write refuses the publish outright', async (t) => {
  const { root, bare } = makeGitRoot();
  t.after(() => dropRoot(root, bare));
  await deadSite(t);

  const head = git(root, ['rev-parse', 'HEAD']);
  write(root, 'data/derived/queue.json', JSON.stringify({ items: [{ id: 'y' }] }, null, 2) + '\n');
  // An agent's half-written entry. It would build; that is precisely the case
  // the build gate cannot catch.
  write(root, 'content/wiki/model/half.md', '---\nid: half\n---\n');

  const res = await publishStep(root, { owned: [], ...FAST, ...QUIET });

  assert.equal(res.published, false);
  assert.equal(res.reason, 'foreign-content');
  assert.deepEqual(res.foreign, ['content/wiki/model/half.md']);
  assert.equal(git(root, ['rev-parse', 'HEAD']), head, 'nothing was committed');
  assert.equal(git(root, ['diff', '--cached', '--name-only']), '', 'nothing was even staged');
  assert.equal(git(root, ['rev-parse', 'origin/main']), head, 'the remote did not move');
  assert.equal(existsSync(join(root, 'HOLD.md')), false, 'a refusal is not a breaker');
});

test('content the run declares as its own — a minted stub — is staged and published', async (t) => {
  const { root, bare } = makeGitRoot();
  t.after(() => dropRoot(root, bare));
  await deadSite(t);

  write(root, 'content/wiki/model/minted.md', '---\nid: minted\n---\n');
  write(root, 'data/sources/openrouter/minted.json', '{}\n');

  const res = await publishStep(root, {
    owned: ['content/wiki/model/minted.md'],
    ...FAST,
    ...QUIET,
  });

  assert.equal(res.reason, 'stamp-did-not-advance', 'it got as far as the deploy poll, so it published');
  assert.deepEqual(commitPaths(root), [
    'content/wiki/model/minted.md',
    'data/sources/openrouter/minted.json',
  ]);
});

test('a run with nothing of its own to publish says so and does not push', async (t) => {
  // No `origin` at all: if this reached `git push origin main` it would throw,
  // so a clean return is proof the push never ran.
  const { root } = makeGitRoot({ remote: false });
  t.after(() => dropRoot(root));
  await deadSite(t);

  const head = git(root, ['rev-parse', 'HEAD']);
  const lines = [];
  const res = await publishStep(root, { owned: [], ...FAST, log: { step: (n, d) => lines.push(`${n} ${d}`) } });

  assert.equal(res.published, false);
  assert.equal(res.reason, 'nothing-owned');
  assert.match(lines.join('\n'), /nothing of this run's own to publish/);
  assert.equal(git(root, ['rev-parse', 'HEAD']), head);
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});

test('publish: false still means nothing committed and nothing pushed, declared writes or not', async (t) => {
  const { root } = makeGitRoot({ publish: false, remote: false });
  t.after(() => dropRoot(root));

  const head = git(root, ['rev-parse', 'HEAD']);
  write(root, 'content/wiki/model/minted.md', '---\nid: minted\n---\n');
  const res = await publishStep(root, { owned: ['content/wiki/model/minted.md'], ...FAST, ...QUIET });

  assert.equal(res.reason, 'disabled');
  assert.equal(git(root, ['rev-parse', 'HEAD']), head);
  assert.equal(git(root, ['diff', '--cached', '--name-only']), '');
});

test('HOLD.md still suspends the publish, and nothing here removes it', async (t) => {
  const { root, bare } = makeGitRoot();
  t.after(() => dropRoot(root, bare));

  const head = git(root, ['rev-parse', 'HEAD']);
  write(root, 'HOLD.md', '# HOLD\n\nan earlier deploy failed\n');
  write(root, 'data/derived/queue.json', JSON.stringify({ items: [{ id: 'z' }] }, null, 2) + '\n');

  const res = await publishStep(root, { owned: [], ...FAST, ...QUIET });

  assert.equal(res.reason, 'hold');
  assert.equal(existsSync(join(root, 'HOLD.md')), true, 'the hold is the maintainer\'s to clear');
  assert.equal(git(root, ['rev-parse', 'HEAD']), head);
});

test('attribution by path: the engine\'s own files, and nobody else\'s', () => {
  for (const own of [
    'data/changes.jsonl',
    'data/linkcheck.json',
    'data/derived/queue.json',
    'data/sources/openrouter/latest.json',
    'data/sources/openrouter/minted.json',
    'public/status.json',
    'public/dataset/models.json',
  ]) {
    assert.equal(isEngineWrite(own), true, own);
  }
  for (const notOurs of [
    'data/launch.json',
    'data/ledger.jsonl',
    'data/config.json',
    'data/conformance.json',
    'data/reviews/j-20260829-01.md',
    'data/proposals/idea.md',
    // one level above the per-source directories, and authored by hand
    'data/sources/registry.json',
    'content/wiki/model/anything.md',
  ]) {
    assert.equal(isEngineWrite(notOurs), false, notOurs);
  }
});

test('classifyWorkingTree reports "cannot tell" rather than guessing outside a repository', () => {
  const root = makeRoot([], { publish: false });
  try {
    const seen = classifyWorkingTree(root, []);
    assert.equal(seen.known, false);
    assert.deepEqual(seen.own, []);
  } finally {
    cleanup(root);
  }
});
