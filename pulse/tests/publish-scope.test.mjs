/**
 * publish-scope.test.mjs — Stage-1 U5, tasks 45-48 (rows 45, 46, 47-as-REWORDED, 48).
 *
 * The shared step pushes a caller-declared verified SHA as `<sha>:main` and
 * refuses only a non-descendant (naming both SHAs); both callers construct
 * and pass their SHA; the train merges `main` before its gates and
 * re-merges + re-gates on a scope refusal (bounded); a declared SHA equal to
 * the remote tip reports "nothing to publish".
 *
 * ## Fixture discipline (row 48, binding)
 *
 * Every push below lands on a BARE `origin` in the OS temp directory — a
 * plain filesystem path, so `git push` performs no network operation and
 * cannot reach GitHub, Vercel, this repository, or the live domain. Every
 * push assertion reads the FIXTURE BARE ORIGIN (`git show --name-only` /
 * `rev-parse` off the remote), never the local tree. The live site is a
 * loopback server this file controls. Never a test whose red path is a live
 * push: there is no live remote anywhere in this file.
 *
 * ## Cross-boundary imports
 *
 * `pulse/tests/**` already imports from `loop/` (`publish.test.mjs` reads
 * the real breaker for the hold re-test), and the row-48 brief requires this
 * file to prove tasks 45-47 together — including the train's main-merge and
 * its SHA declaration through the loop shim. So this file imports the train
 * machinery and the loop shim directly, against throwaway repos only.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publishStep, readRemoteTip } from '../lib/publish.mjs';
import {
  assembleTrain,
  ensureTrainBranch,
  fastForwardMain,
  isMainMergeSubject,
  MAIN_MERGE_MARKER,
  mergeMainForGates,
  pendingMerges,
  publishTrain,
  resolveLockWaitMs,
  runTrain,
  TRAIN_BRANCH,
  TRAIN_PUBLISH_MAX_ATTEMPTS,
} from '../../loop/lib/train.mjs';
import { publishStep as loopShimPublishStep } from '../../loop/lib/publish.mjs';
import { TRAIN_GATES } from '../../loop/lib/gates.mjs';
import { JOB_TYPES } from '../../loop/lib/config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PULSE_LIB = resolve(HERE, '..', 'lib');
const WORKTREE_ROOT = resolve(HERE, '..', '..');

const FAST = { pollBudgetMs: 150, pollIntervalMs: 20 };
const QUIET = { step: () => {}, warn: () => {} };

function git(dir, args, env) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    ...(env ? { env: { ...process.env, ...env } } : {}),
  }).trim();
}

function cleanup(...dirs) {
  for (const d of dirs) {
    try {
      rmSync(d, { recursive: true, force: true, maxRetries: 3 });
    } catch {
      /* a locked temp dir on Windows is not a test failure */
    }
  }
}

/**
 * A throwaway repository with a bare `origin` beside it, one commit pushed,
 * and its own `data/config.json`. Mirrors `publish-verify.test.mjs`'s
 * fixture (same `.gitattributes` pin against `core.autocrlf` rewrites).
 */
function makeScopeRepo({ publish = true, remote = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'pulse-scope-'));
  const bare = remote ? mkdtempSync(join(tmpdir(), 'pulse-scope-remote-')) : null;
  if (bare) execFileSync('git', ['init', '--bare', bare], { stdio: 'ignore' });
  execFileSync('git', ['init', root], { stdio: 'ignore' });
  git(root, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(root, ['config', 'user.email', 'pulse@example.invalid']);
  git(root, ['config', 'user.name', 'Pulse Scope Test']);
  git(root, ['config', 'commit.gpgsign', 'false']);
  git(root, ['config', 'core.autocrlf', 'false']);
  if (bare) git(root, ['remote', 'add', 'origin', bare.replace(/\\/g, '/')]);

  writeFileSync(join(root, '.gitattributes'), '* -text\n', 'utf8');
  mkdirSync(join(root, 'data'), { recursive: true });
  mkdirSync(join(root, 'content'), { recursive: true });
  writeFileSync(join(root, 'data', 'config.json'), JSON.stringify({ publish }, null, 2) + '\n', 'utf8');
  writeFileSync(join(root, 'content', 'seed.md'), 'first\n', 'utf8');
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'base']);
  if (bare) git(root, ['push', 'origin', 'main']);
  return { root, bare };
}

/** Commit a file on the current branch. Returns the full SHA. */
function commitFile(root, rel, text, message) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text, 'utf8');
  git(root, ['add', '--', rel.replace(/\\/g, '/')]);
  git(root, ['commit', '--quiet', '--no-verify', '-m', message]);
  return git(root, ['rev-parse', 'HEAD']);
}

/** File names in the commit at the REMOTE's tip — read OFF THE REMOTE. */
function remoteFiles(bare, rev = 'main') {
  return execFileSync('git', ['-C', bare, 'show', '--name-only', '--pretty=format:', rev], { encoding: 'utf8' })
    .split('\n').map((s) => s.trim()).filter(Boolean).sort();
}

/** The remote tip SHA, or null when the remote has no `main` yet. */
function remoteTip(bare) {
  try {
    return execFileSync('git', ['-C', bare, 'rev-parse', 'main'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/** A build stamp body serving the given short commit. */
function stampBody(short) {
  return JSON.stringify({ built_at: '2026-09-11T00:00:00Z', commit: short, dirty: false, stamp: `x · ${short}` });
}

/**
 * A loopback `/status.json` with a request counter. `serve` sets the body;
 * `null` 404s. SITE_URL is pointed at it for the test's duration.
 */
async function loopbackSite(t, initialBody) {
  let body = initialBody;
  let hits = 0;
  const server = createServer((_req, res) => {
    hits++;
    if (body === null) {
      res.writeHead(404);
      res.end('');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(body);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const prior = process.env.SITE_URL;
  process.env.SITE_URL = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    if (prior === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = prior;
    await new Promise((r) => server.close(r));
  });
  return { get hits() { return hits; }, serve: (b) => { body = b; } };
}

// ---------------------------------------------------------------------------
// Row 48 arm 1: declared SHA + later local commit pushes ONLY the declared tree.
// ---------------------------------------------------------------------------

test('declared SHA plus a later local commit pushes only the declared tree (read off the remote)', async (t) => {
  const { root, bare } = makeScopeRepo();
  t.after(() => cleanup(root, bare));
  const base = remoteTip(bare);

  const declared = commitFile(root, 'content/one.md', '# one\n', 'first gated commit');
  commitFile(root, 'content/two.md', '# two — landed after the gates ran\n', 'later ungated commit');
  const site = await loopbackSite(t, stampBody(declared.slice(0, 12)));

  const res = await publishStep(root, { verifiedSha: declared, owned: [], ...FAST, log: { ...QUIET } });

  assert.equal(res.published, true, `the declared tree must publish; got ${JSON.stringify(res)}`);
  // THE assertion, off the remote: the pushed commit is the declared tree,
  // and the later commit is not on the remote at all.
  assert.equal(remoteTip(bare), declared, 'the remote tip is the declared SHA, not the later commit');
  assert.deepEqual(remoteFiles(bare), ['content/one.md'], 'the remote commit carries only the declared tree');
  assert.notEqual(git(root, ['rev-parse', 'HEAD']), declared, 'locally the later commit still stands — it was not pushed, not dropped');
});

// ---------------------------------------------------------------------------
// Row 48 arm 2: non-descendant SHA refused, naming both.
// ---------------------------------------------------------------------------

test('a declared SHA that is not a descendant of the remote tip is refused naming both', async (t) => {
  const { root, bare } = makeScopeRepo();
  t.after(() => cleanup(root, bare));

  // Advance the remote: the "Pulse" moved main while "the train" verified.
  const tip = commitFile(root, 'content/remote.md', '# remote\n', 'remote advance');
  git(root, ['push', 'origin', 'main']);
  assert.equal(remoteTip(bare), tip);

  // A fork off the base: shares history with the tip but descends from nothing new.
  git(root, ['checkout', '-q', '-b', 'fork', `${tip}^`]);
  const forked = commitFile(root, 'content/fork.md', '# fork\n', 'forked gated tree');
  git(root, ['checkout', '-q', 'main']);
  const site = await loopbackSite(t, stampBody(tip.slice(0, 12)));

  const rec = { lines: [] };
  const res = await publishStep(root, {
    verifiedSha: forked, owned: [], ...FAST,
    log: { step: (n, d) => rec.lines.push(`${n} — ${d}`), warn: () => {} },
  });

  assert.equal(res.published, false);
  assert.equal(res.reason, 'scope-refused');
  assert.equal(res.sha, forked);
  assert.equal(res.remoteTip, tip);
  // Both SHAs named, in full, in the result AND on the run's own line.
  assert.match(rec.lines.join('\n'), new RegExp(forked), 'the refusal names the declared SHA');
  assert.match(rec.lines.join('\n'), new RegExp(tip), 'the refusal names the remote tip');
  assert.match(rec.lines.join('\n'), /nothing pushed/, 'the run states it published nothing');
  assert.equal(remoteTip(bare), tip, 'the remote did not move');
  assert.equal(existsSync(join(root, 'HOLD.md')), false, 'a scope refusal writes no HOLD');
});

// ---------------------------------------------------------------------------
// Row 48 arm 3: caller-asserted flag vs file-false pushes nothing.
// ---------------------------------------------------------------------------

test("a caller asserting publish while data/config.json reads false pushes nothing", async (t) => {
  const { root, bare } = makeScopeRepo({ publish: false });
  t.after(() => cleanup(root, bare));
  const base = remoteTip(bare);
  const declared = commitFile(root, 'content/one.md', '# one\n', 'gated work');

  // `--assume-publish` without `--dry-run` is the caller asserting the flag.
  // The step refuses the combination outright: the file is the only gate.
  await assert.rejects(
    publishStep(root, { verifiedSha: declared, owned: [], assumePublish: true, ...FAST, log: { ...QUIET } }),
    /--assume-publish is only honored together with --dry-run/,
  );
  assert.equal(remoteTip(bare), base, 'nothing reached the remote on a caller assertion');
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});

test('disabled with a declared SHA still reads the file: the flag is the step\'s to read', async (t) => {
  const { root, bare } = makeScopeRepo({ publish: false });
  t.after(() => cleanup(root, bare));
  const base = remoteTip(bare);

  const rec = { lines: [] };
  const res = await publishStep(root, {
    verifiedSha: git(root, ['rev-parse', 'HEAD']), owned: [], ...FAST,
    log: { step: (n, d) => rec.lines.push(`${n} — ${d}`), warn: () => {} },
  });

  assert.equal(res.published, false);
  assert.equal(res.reason, 'disabled');
  assert.match(rec.lines.join('\n'), /publish — disabled \(data\/config\.json has publish: false\)/);
  assert.equal(remoteTip(bare), base);
});

// ---------------------------------------------------------------------------
// Row 48 arm 4: standing HOLD.md suppresses the push.
// ---------------------------------------------------------------------------

test('a standing HOLD.md suppresses the push of a declared SHA', async (t) => {
  const { root, bare } = makeScopeRepo();
  t.after(() => cleanup(root, bare));
  const base = remoteTip(bare);
  const declared = commitFile(root, 'content/one.md', '# one\n', 'gated work');
  writeFileSync(join(root, 'HOLD.md'), '# HOLD\n\nan earlier deploy failed\n', 'utf8');
  const site = await loopbackSite(t, stampBody(declared.slice(0, 12)));

  const res = await publishStep(root, { verifiedSha: declared, owned: [], ...FAST, log: { ...QUIET } });

  assert.equal(res.published, false);
  assert.equal(res.reason, 'hold');
  assert.equal(remoteTip(bare), base, 'a held run pushes nothing');
});

// ---------------------------------------------------------------------------
// Row 48 equal-SHA arm (Q-S11): "nothing to publish" — not a refusal, no HOLD.
// ---------------------------------------------------------------------------

test('a declared SHA equal to the remote tip reports nothing to publish (not a refusal, no HOLD)', async (t) => {
  const { root, bare } = makeScopeRepo();
  t.after(() => cleanup(root, bare));
  const tip = remoteTip(bare);
  const site = await loopbackSite(t, stampBody(tip.slice(0, 12)));

  const rec = { lines: [] };
  const res = await publishStep(root, {
    verifiedSha: tip, owned: [], ...FAST,
    log: { step: (n, d) => rec.lines.push(`${n} — ${d}`), warn: () => {} },
  });

  assert.equal(res.published, false);
  assert.equal(res.reason, 'nothing-to-publish');
  assert.notEqual(res.reason, 'scope-refused', 'equality is not a refusal');
  assert.match(rec.lines.join('\n'), /nothing to publish/, 'the run says so plainly');
  assert.equal(existsSync(join(root, 'HOLD.md')), false, 'no HOLD on an equal SHA');
  assert.equal(site.hits, 0, 'no deploy poll runs when there is nothing to publish');
});

// ---------------------------------------------------------------------------
// Contract arms: unresolvable declaration, unreadable remote.
// ---------------------------------------------------------------------------

test('an unresolvable declared SHA refuses without pushing (no-verified-sha)', async (t) => {
  const { root, bare } = makeScopeRepo();
  t.after(() => cleanup(root, bare));
  const base = remoteTip(bare);
  commitFile(root, 'content/one.md', '# one\n', 'work');

  for (const bad of ['not-a-sha', 'deadbeef', 'f'.repeat(40)]) {
    const res = await publishStep(root, { verifiedSha: bad, owned: [], ...FAST, log: { ...QUIET } });
    assert.equal(res.published, false, bad);
    assert.equal(res.reason, 'no-verified-sha', bad);
  }
  assert.equal(remoteTip(bare), base, 'no unresolvable scope is ever pushed');
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
});

test('a declared SHA against an unreadable remote refuses without pushing (remote-unreadable)', async (t) => {
  const { root } = makeScopeRepo({ remote: false });
  t.after(() => cleanup(root));
  const declared = git(root, ['rev-parse', 'HEAD']);

  const res = await publishStep(root, { verifiedSha: declared, owned: [], ...FAST, log: { ...QUIET } });

  assert.equal(res.published, false);
  assert.equal(res.reason, 'remote-unreadable');
  assert.equal(existsSync(join(root, 'HOLD.md')), false);
  // And the helper behind the check answers the same way off a missing remote.
  assert.deepEqual(readRemoteTip(root), { ok: false, tip: null });
});

// ---------------------------------------------------------------------------
// Item 5 (orchestrator-sanctioned): pre-existing red suppresses the OWN hold.
// ---------------------------------------------------------------------------

test('pre-existing red suppresses the step\'s own deploy-hold write — and the door stays open', async (t) => {
  const { root, bare } = makeScopeRepo();
  t.after(() => cleanup(root, bare));
  const declared = commitFile(root, 'content/one.md', '# one\n', 'gated work');
  const dead = await loopbackSite(t, null); // 503 on every request: the deploy never lands

  const suppressed = await publishStep(root, {
    verifiedSha: declared, owned: [], preExistingRed: true, ...FAST, log: { ...QUIET },
  });

  assert.equal(suppressed.published, false);
  assert.equal(suppressed.reason, 'stamp-did-not-advance');
  assert.equal(suppressed.suppressedHold, 'pre-existing', 'the suppression is on the record, not silent');
  assert.equal(existsSync(join(root, 'HOLD.md')), false, 'no deploy hold on a pre-existing-red tree');
  assert.equal(remoteTip(bare), declared, 'the push itself still happened — only the hold is suppressed');

  // The door stays open: with no HOLD standing, the next invocation is not
  // suspended. The remote already serves the declared tree, so it reports
  // nothing-to-publish rather than the hold line.
  dead.serve(stampBody(declared.slice(0, 12)));
  const rec = { lines: [] };
  const again = await publishStep(root, {
    verifiedSha: declared, owned: [], ...FAST,
    log: { step: (n, d) => rec.lines.push(`${n} — ${d}`), warn: () => {} },
  });
  assert.equal(again.reason, 'nothing-to-publish', `a hold would have suspended this run first:\n${rec.lines.join('\n')}`);
});

test('CONTROL — without the flag the same missed deploy writes the hold', async (t) => {
  const { root, bare } = makeScopeRepo();
  t.after(() => cleanup(root, bare));
  commitFile(root, 'content/one.md', '# one\n', 'gated work');
  await loopbackSite(t, null);

  const res = await publishStep(root, { owned: [], ...FAST, log: { ...QUIET } });

  assert.equal(res.reason, 'stamp-did-not-advance');
  assert.equal(res.suppressedHold, undefined, 'no suppression without the classification');
  assert.equal(existsSync(join(root, 'HOLD.md')), true, 'the deploy hold is written by default');
});

// ---------------------------------------------------------------------------
// Copy-mutant harness (U1-U4 pattern): same-dir copy, fresh import, hash
// restore proof, residue scan. Mutations A + B per row 48.
// ---------------------------------------------------------------------------

const TRACKED = resolve(PULSE_LIB, 'publish.mjs');

async function withMutant(tag, pairs, fn) {
  const before = readFileSync(TRACKED, 'utf8');
  let mutant = before;
  for (const [search, replacement] of pairs) {
    mutant = mutant.replace(search, replacement);
  }
  assert.notEqual(mutant, before, `the mutant must differ from the shipped file (${tag})`);
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  // Tagged path: Node ESM caches by URL within the process, so every mutant
  // needs its OWN copy path — reusing one URL silently re-imports the first
  // mutant's module.
  const copyPath = resolve(PULSE_LIB, `publish.mut-${process.pid}-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`../lib/publish.mut-${process.pid}-${tag}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(TRACKED, 'utf8'), 'utf8').digest('hex'),
      sha,
      `tracked publish.mjs hash-identical after the mutant run (sha256 ${sha.slice(0, 12)}…)`,
    );
    assert.equal(readFileSync(TRACKED, 'utf8'), before, 'tracked publish.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
  // Residue scan scoped to THIS file's tag family: the full suite runs test
  // files in parallel processes sharing one pid space, and sibling suites
  // keep same-directory copies of their own — an unscoped scan flakes on
  // their transients (measured in U2-U4).
  const residue = readdirSync(PULSE_LIB).filter((f) => f.startsWith(`publish.mut-${process.pid}-scope`));
  assert.deepEqual(residue, [], 'no mutant residue of this file in pulse/lib');
}

test('mutation A — push the branch instead of the SHA: the later-commit case fails (restored byte-identical)', async (t) => {
  await withMutant('scopeA', [
    ["git(root, ['push', 'origin', `${expected}:refs/heads/main`]);", "git(root, ['push', 'origin', 'main']);"],
  ], async (mutant) => {
    const { root, bare } = makeScopeRepo();
    t.after(() => cleanup(root, bare));

    const declared = commitFile(root, 'content/one.md', '# one\n', 'first gated commit');
    const later = commitFile(root, 'content/two.md', '# two — landed after the gates ran\n', 'later ungated commit');
    await loopbackSite(t, stampBody(declared.slice(0, 12)));

    const res = await mutant.publishStep(root, { verifiedSha: declared, owned: [], ...FAST, log: { ...QUIET } });
    assert.equal(res.published, true, 'the mutant still publishes — but the wrong tree');
    assert.equal(remoteTip(bare), later, 'MUTANT PROOF: the branch send moved the remote past the declared SHA');
    assert.deepEqual(
      remoteFiles(bare), ['content/two.md'],
      'MUTANT PROOF: pushing the branch carries the later ungated commit — the arm fails on the mutant',
    );
  });
});

test('mutation B — trust the caller\'s flag assertion: the flag case fails (restored byte-identical)', async (t) => {
  await withMutant('scopeB', [
    [`  if (assumePublish && !dryRun) {
    throw new Error(
      '--assume-publish is only honored together with --dry-run. The publish flag lives in data/config.json (a reserved path); it is never overridden for a real run.',
    );
  }`, `  if (false) {
    throw new Error('mutant B disabled the assume-publish guard');
  }`],
    ['const effective = configSaysPublish || (assumePublish && dryRun);', 'const effective = configSaysPublish || assumePublish; // MUTANT B: trusts the caller assertion'],
  ], async (mutant) => {
    const { root, bare } = makeScopeRepo({ publish: false });
    t.after(() => cleanup(root, bare));
    const base = remoteTip(bare);
    assert.notEqual(base, null);
    const declared = commitFile(root, 'content/one.md', '# one\n', 'gated work');
    await loopbackSite(t, null);

    // No throw on the mutant: the caller assertion arms the push.
    const res = await mutant.publishStep(root, { verifiedSha: declared, owned: [], assumePublish: true, ...FAST, log: { ...QUIET } });
    assert.equal(
      remoteTip(bare), declared,
      'MUTANT PROOF: trusting the caller assertion pushes while the file reads false — the arm fails on the mutant',
    );
    void res;
  });
});

// ---------------------------------------------------------------------------
// Item 6 (T27): zero bare-branch push paths + both callers construct scope.
// The shim stays exactly the delegation shim.
// ---------------------------------------------------------------------------

const ENGINE_FILES = [
  'pulse/lib/publish.mjs',
  'pulse/run.mjs',
  'loop/lib/publish.mjs',
  'loop/lib/train.mjs',
];

function engineText(rel) {
  return readFileSync(join(WORKTREE_ROOT, rel), 'utf8');
}

test('zuoo closure: zero bare-branch push paths remain in either engine', () => {
  const offenders = [];
  for (const rel of ENGINE_FILES) {
    const text = engineText(rel);
    // The exact array branch form, and the bare `push origin main` that is
    // not a `<sha>:main` refspec. Comments are NOT stripped: a branch push
    // hiding in a comment is still a branch push someone will copy.
    if (/['"]push['"]\s*,\s*['"]origin['"]\s*,\s*['"]main['"]/.test(text)) {
      offenders.push(`${rel}: array branch push`);
    }
    for (const [i, line] of text.split('\n').entries()) {
      if (/push\s+origin\s+main(?!\s*:)/.test(line) && !/push\s+origin\s+\S+:main/.test(line)) {
        offenders.push(`${rel}:${i + 1}: bare-branch push (${line.trim().slice(0, 80)})`);
      }
    }
  }
  assert.deepEqual(offenders, [], 'every send in either engine names the SHA (`<sha>:refs/heads/main`)');
  // And the SHA form exists where the sends live.
  assert.match(engineText('pulse/lib/publish.mjs'), /\$\{expected\}:refs\/heads\/main/, 'the shared step sends `<sha>:refs/heads/main`');
});

test('both callers construct scope: the Pulse declares its gated SHA, the train declares its verified SHA', () => {
  const pulseRun = engineText('pulse/run.mjs');
  assert.match(pulseRun, /verifiedSha/, 'pulse/run.mjs declares a verified SHA to the shared step');
  assert.match(pulseRun, /rev-parse.*HEAD/, 'the Pulse constructs it from its own HEAD (the pre-commit gated base)');
  const train = engineText('loop/lib/train.mjs');
  assert.match(train, /verifiedSha: sha/, 'the train declares its verified SHA');
  const shim = engineText('loop/lib/publish.mjs');
  assert.match(shim, /verifiedSha/, 'the shim forwards the declaration');
  assert.match(shim, /phase1Commit/, 'the shim forwards the phase-1 option');
  assert.match(shim, /preExistingRed/, 'the shim forwards the pre-existing option');
});

/**
 * Exercise the shim against a STUB shared step and return what it was
 * handed. The point is the handoff, not the send — the e2e below covers the
 * real step, and would pass even if the shim dropped every scope option
 * (same bytes on a clean tree), so only this capture pins the forwarding.
 */
async function exerciseShimForward(t, shim) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-scope-shim-'));
  t.after(() => cleanup(dir));
  const repo = join(dir, 'repo');
  mkdirSync(join(repo, 'pulse', 'lib'), { recursive: true });
  writeFileSync(join(repo, 'pulse', 'lib', 'publish.mjs'),
    `export async function publishStep(root, opts) {\n` +
    `  globalThis.__shim_seen = { root, opts };\n` +
    `  return { published: false, skipped: true, reason: 'stub', result: { published: false, reason: 'stub' } };\n` +
    `}\n`);
  const ctx = { repoRoot: repo, log: () => {}, configPath: join(repo, 'data', 'config.json') };
  const sha = 'a'.repeat(40);
  const res = await shim(ctx, { verifiedSha: sha, owned: [], phase1Commit: false, preExistingRed: true, dryRun: true });
  const seen = globalThis.__shim_seen;
  delete globalThis.__shim_seen;
  return { seen, res, sha };
}

test('the shim forwards scope options verbatim to the shared step (delegation, not a reading)', async (t) => {
  const { seen, res, sha } = await exerciseShimForward(t, loopShimPublishStep);
  assert.ok(seen, 'the shim reached the shared step');
  assert.equal(seen.opts.verifiedSha, sha);
  assert.deepEqual(seen.opts.owned, []);
  assert.equal(seen.opts.phase1Commit, false, 'the train\'s no-commit rides through');
  assert.equal(seen.opts.preExistingRed, true, 'the suppression flag rides through');
  assert.equal(seen.opts.dryRun, true);
  assert.equal(res.published, false);
});

test('resolveLockWaitMs: explicit wins, config supplies, unreadable falls back to try-once', (t) => {
  assert.equal(resolveLockWaitMs({}, 7000), 7000, 'an explicit wait is honoured');
  assert.equal(resolveLockWaitMs({}, undefined), 0, 'no config readable: try once');
  const dir = mkdtempSync(join(tmpdir(), 'atai-scope-cfg-'));
  t.after(() => cleanup(dir));
  mkdirSync(join(dir, 'data'), { recursive: true });
  const caps = {};
  for (const jt of JOB_TYPES) caps[jt] = 30;
  writeFileSync(join(dir, 'data', 'config.json'), JSON.stringify({
    publish: false,
    budget: { window_days: 30, categories: {}, bounds: { upkeep_floor_pct: 1, new_writing_ceiling_pct: 1, machinery_ceiling_pct: 1 } },
    job_caps_minutes: caps,
    degradation: { window_hours: 1, shed_levels: [] },
    train: { lock_wait_seconds: 45 },
  }, null, 2) + '\n', 'utf8');
  assert.equal(resolveLockWaitMs({ configPath: join(dir, 'data', 'config.json') }, undefined), 45000, 'the configured bound flows, never a literal');
});

/** Copy-mutant harness for the shim (same pattern as the shared step above). */
const SHIM_TRACKED = resolve(WORKTREE_ROOT, 'loop', 'lib', 'publish.mjs');

async function withShimMutant(tag, pairs, fn) {
  const before = readFileSync(SHIM_TRACKED, 'utf8');
  let mutant = before;
  for (const [search, replacement] of pairs) {
    mutant = mutant.replace(search, replacement);
  }
  assert.notEqual(mutant, before, `the mutant must differ from the shipped file (${tag})`);
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  const copyPath = resolve(WORKTREE_ROOT, 'loop', 'lib', `publish.mut-${process.pid}-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`../../loop/lib/publish.mut-${process.pid}-${tag}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(SHIM_TRACKED, 'utf8'), 'utf8').digest('hex'),
      sha,
      `tracked shim hash-identical after the mutant run (sha256 ${sha.slice(0, 12)}…)`,
    );
    assert.equal(readFileSync(SHIM_TRACKED, 'utf8'), before, 'tracked shim byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
  const residue = readdirSync(resolve(WORKTREE_ROOT, 'loop', 'lib')).filter((f) => f.startsWith(`publish.mut-${process.pid}-shim`));
  assert.deepEqual(residue, [], 'no mutant residue of this file in loop/lib');
}

test('mutation C — the shim drops scope forwarding: the forwarding arm fails (restored byte-identical)', async (t) => {
  await withShimMutant('shimC', [
    ['const res = await fn(ctx.repoRoot, { dryRun, log, owned, verifiedSha, phase1Commit, preExistingRed, ...budgets });', 'const res = await fn(ctx.repoRoot, { dryRun, log, owned, ...budgets });'],
  ], async (mutantShim) => {
    const { seen } = await exerciseShimForward(t, mutantShim.publishStep);
    assert.ok(seen, 'the mutant shim still reaches the shared step');
    assert.equal(
      seen.opts.verifiedSha, undefined,
      'MUTANT PROOF: a shim that defaults the scope instead of forwarding it declares nothing — the forwarding arm fails on the mutant',
    );
  });
});

test('the shim stays exactly the delegation shim: no second push implementation under loop/', () => {
  // Mirrors loop/tests/publish.test.mjs's guard, scoped to the shim file so
  // this suite pins it too: block comments and whole-line `//` comments go
  // first (the shim explains at length why it does not send), trailing
  // comments stay — the check errs toward failing.
  const offenders = [];
  for (const rel of ['loop/lib/publish.mjs', 'loop/lib/train.mjs']) {
    const full = join(WORKTREE_ROOT, rel);
    const code = readFileSync(full, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '');
    if (/(['"`])push\1/.test(code) || /push origin/.test(code)) offenders.push(`${rel}: sends (or names a send)`);
  }
  assert.deepEqual(offenders, [], 'sending is the shared step\'s job; a second implementation under loop/ is how a loop ends up sending something nothing verified');
});

// ---------------------------------------------------------------------------
// Task 47: the train merges `main` before its gates run.
// ---------------------------------------------------------------------------

const BOUNDS = { merges: 5, minutes: 90, maxReviewedBytes: 150000, maxSubjects: 12, lockWaitSeconds: 1200 };
const T0 = Date.parse('2026-09-11T12:00:00');

/** Throwaway repo on `main` (no remote needed for merge arms). */
function trainRepo() {
  const root = mkdtempSync(join(tmpdir(), 'atai-scope-train-'));
  const repo = join(root, 'repo');
  mkdirSync(repo, { recursive: true });
  git(repo, ['init', '--quiet']);
  git(repo, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(repo, ['config', 'user.email', 'scope@example.invalid']);
  git(repo, ['config', 'user.name', 'Scope Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  git(repo, ['config', 'core.autocrlf', 'false']);
  writeFileSync(join(repo, 'base.txt'), 'base\n', 'utf8');
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'base']);
  return { root, repo, cleanup: () => cleanup(root) };
}

function ctxFor(repo) {
  return { repoRoot: repo, ledgerPath: join(repo, 'data', 'ledger.jsonl'), now: () => new Date(T0), log: () => {} };
}

/** Admit one job onto `train` with a parseable merge message. */
function admitJob(repo, id, files) {
  ensureTrainBranch(repo, 'main');
  git(repo, ['checkout', '--quiet', 'main']);
  git(repo, ['checkout', '--quiet', '-b', `job/${id}`]);
  const paths = [];
  for (const [p, c] of Object.entries(files)) {
    const full = join(repo, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, c, 'utf8');
    paths.push(p.replace(/\\/g, '/'));
  }
  git(repo, ['add', '--', ...paths]);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', `work ${id}`]);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', `job ${id} (repair): ${id} work`, `job/${id}`]);
}

/** Commit straight onto `main` — the Pulse's own commit, on its schedule. */
function commitOnMain(repo, files, message) {
  git(repo, ['checkout', '--quiet', 'main']);
  const paths = [];
  for (const [p, c] of Object.entries(files)) {
    const full = join(repo, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, c, 'utf8');
    paths.push(p.replace(/\\/g, '/'));
  }
  git(repo, ['add', '--', ...paths]);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', message]);
  const sha = git(repo, ['rev-parse', 'HEAD']);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  return sha;
}

test('mergeMainForGates is a no-op when main is already contained (no lock, no new commit)', async (t) => {
  const { repo, cleanup } = trainRepo();
  t.after(cleanup);
  admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const before = git(repo, ['rev-parse', 'HEAD']);

  const m = await mergeMainForGates(repo, { trainId: 't-noop', lockWaitMs: 5000 });

  assert.equal(m.ok, true, m.reason ?? 'no-op merge refused');
  assert.equal(m.merged, false, 'nothing new on main: nothing merged');
  assert.equal(git(repo, ['rev-parse', 'HEAD']), before, 'the tip did not move');
});

test('mergeMainForGates merges an advanced main, marks it, and pendingMerges excludes it', async (t) => {
  const { repo, cleanup } = trainRepo();
  t.after(cleanup);
  admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const pendingBefore = pendingMerges(repo).length;
  assert.equal(pendingBefore, 1);

  const mainTip = commitOnMain(repo, { 'content/pulse.md': '# pulse freshness\n' }, "pulse: freshness layer's own commit");

  const m = await mergeMainForGates(repo, { trainId: 't-merge', lockWaitMs: 5000 });

  assert.equal(m.ok, true, m.reason ?? 'main merge refused');
  assert.equal(m.merged, true);
  assert.equal(m.mainTip, mainTip);
  assert.ok(existsSync(join(repo, 'content', 'pulse.md')), "the merged tip carries main's work");
  const subjects = git(repo, ['log', '-1', '--format=%s', 'HEAD']);
  assert.ok(isMainMergeSubject(subjects), `the merge commit carries the marker: ${subjects}`);
  assert.ok(subjects.includes(MAIN_MERGE_MARKER));
  // Still exactly one waiting merge: the absorption is not waiting work, and
  // its unparseable job id can never refuse an assembly.
  assert.equal(pendingMerges(repo).length, 1, 'the main-merge is excluded from waiting work');
});

test('mergeMainForGates refuses a conflicting main rather than forcing it', async (t) => {
  const { repo, cleanup } = trainRepo();
  t.after(cleanup);
  writeFileSync(join(repo, 'shared.txt'), 'base\n', 'utf8');
  git(repo, ['add', '--', 'shared.txt']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'shared base']);
  admitJob(repo, 'job-1', { 'shared.txt': 'train side\n' });
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  git(repo, ['checkout', '--quiet', 'main']);
  writeFileSync(join(repo, 'shared.txt'), 'main side\n', 'utf8');
  git(repo, ['add', '--', 'shared.txt']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'conflicting main advance']);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);

  const m = await mergeMainForGates(repo, { trainId: 't-conflict', lockWaitMs: 5000 });

  assert.equal(m.ok, false, 'a conflicting main refuses the train');
  assert.match(m.reason ?? '', /merges wait on train/);
});

function greenGates() {
  const calls = [];
  const fn = (ctx, dir, options) => {
    calls.push({ dir, scripts: options && options.scripts ? [...options.scripts] : null, head: git(dir, ['rev-parse', 'HEAD']) });
    return { ok: true, results: [], output: '' };
  };
  fn.calls = calls;
  return fn;
}

const approveReview = () => async () => ({ verdict: 'approve', runner: 'stub', provider: 'stub', tier: 'stub', findingsNotInAnyRecord: 0 });

function stubRederive() {
  return async (ctx, dir) => {
    mkdirSync(join(dir, 'data', 'derived'), { recursive: true });
    writeFileSync(join(dir, 'data', 'derived', 'queue.json'), '{"items":[]}\n', 'utf8');
    return { ok: true, reason: 'stub' };
  };
}

function stubPublish(behavior) {
  const seen = [];
  const fn = async (ctx, opts) => {
    seen.push({ ...opts });
    return behavior(seen.length, opts);
  };
  fn.seen = seen;
  return fn;
}

async function assembledTrain(repo, trainId = 't-scope') {
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const asm = assembleTrain(repo, { trainId, bounds: BOUNDS, now: () => T0 });
  assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
  return asm;
}

test('runTrain merges main before its gates: the gates examine the Pulse\'s work, the manifest re-freezes, the SHA declared is published', async (t) => {
  const { repo, cleanup } = trainRepo();
  t.after(cleanup);
  admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
  const asm = await assembledTrain(repo);
  // The Pulse advances main AFTER assembly, before the train's gates run.
  const pulseTip = commitOnMain(repo, { 'content/pulse.md': '# pulse freshness\n' }, "pulse: freshness layer's own commit");
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);

  const gates = greenGates();
  const publish = stubPublish(() => ({ published: true, skipped: false, reason: 'stub-published', result: { published: true } }));
  const tr = await runTrain(ctxFor(repo), {
    repo, trainId: asm.manifest.train, manifest: asm.manifest,
    gates, rederive: stubRederive(), review: approveReview(), now: () => T0,
    publish, lockWaitMs: 5000,
  });

  assert.equal(tr.ok, true, tr.reason ?? 'train refused');
  // The gates ran over the merged tip: the full set saw the Pulse's file.
  const full = gates.calls.filter((c) => c.scripts && c.scripts.length === TRAIN_GATES.length);
  assert.ok(full.length >= 1, 'the full gate set ran');
  assert.ok(existsSync(join(full[0].dir, 'content', 'pulse.md')), 'the gated checkout carries main\'s work');
  // The manifest re-froze over the merge: mainTip is the advanced main the
  // train absorbed (local main itself moves only on publish, below).
  assert.equal(asm.manifest.mainTip, pulseTip);
  // The train declared its post-records tip through the shim's contract:
  // exact SHA, nothing dirty declared, no phase-1 commit, no suppression.
  assert.equal(publish.seen.length, 1);
  assert.equal(publish.seen[0].verifiedSha, tr.sha, 'the declared SHA is the verified post-records tip');
  assert.deepEqual(publish.seen[0].owned, []);
  assert.equal(publish.seen[0].phase1Commit, false);
  assert.equal(publish.seen[0].preExistingRed, false);
  // Row 50 holds through the publish: recomputed data stays uncommitted.
  assert.notEqual(git(repo, ['status', '--porcelain', '--', 'data/derived/queue.json']).trim(), '', 'rederived data is still dirty — the publish committed nothing');
  // The local main followed the publish (fast-forward): the next assembly
  // will not re-admit what just published.
  assert.equal(git(repo, ['rev-parse', 'main']), tr.sha);
  assert.equal(tr.publish.published, true);
  assert.equal(tr.publish.attempts.length, 1);
});

test('publish refusal for staleness re-merges main and re-gates (bounded): the new SHA publishes', async (t) => {
  const { repo, cleanup } = trainRepo();
  t.after(cleanup);
  admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
  const asm = await assembledTrain(repo);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);

  const gates = greenGates();
  const publish = stubPublish((n) => {
    if (n === 1) {
      // The Pulse advances main while the train verifies: the first
      // declaration is stale by the time it would send.
      commitOnMain(repo, { 'content/pulse-late.md': '# late freshness\n' }, "pulse: late advance during the train's poll");
      return { published: false, skipped: true, reason: 'shared publish step ran', result: { published: false, reason: 'scope-refused' } };
    }
    return { published: true, skipped: false, reason: 'stub-published', result: { published: true } };
  });
  const tr = await runTrain(ctxFor(repo), {
    repo, trainId: asm.manifest.train, manifest: asm.manifest,
    gates, rederive: stubRederive(), review: approveReview(), now: () => T0,
    publish, lockWaitMs: 5000,
  });

  assert.equal(tr.ok, true, tr.reason ?? 'train refused after re-merge');
  assert.equal(tr.publish.published, true);
  assert.equal(tr.publish.attempts.length, 2, 'one initial attempt plus one bounded retry');
  assert.equal(tr.publish.remerges, 1);
  assert.notEqual(tr.publish.attempts[1].sha, tr.publish.attempts[0].sha, 'the retry declares the re-merged tip');
  const fullRuns = gates.calls.filter((c) => c.scripts && c.scripts.length === TRAIN_GATES.length).length;
  assert.equal(fullRuns, 2, 'the full gate set ran over the first tip and again over the re-merged tip');
  assert.ok(existsSync(join(repo, 'content', 'pulse-late.md')), 'the retried tree carries the late main');
  assert.equal(git(repo, ['rev-parse', 'main']), tr.publish.attempts[1].sha, 'local main followed the republished SHA');
});

test('the re-merge loop is bounded: chronic staleness stops after TRAIN_PUBLISH_MAX_ATTEMPTS', async (t) => {
  const { repo, cleanup } = trainRepo();
  t.after(cleanup);
  admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
  const asm = await assembledTrain(repo);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);

  const gates = greenGates();
  let late = 0;
  const publish = stubPublish(() => {
    // Every attempt finds a newly-advanced main: without a bound this loops
    // with the scheduled Pulse forever.
    late += 1;
    commitOnMain(repo, { 'content/pulse-late.md': `# late ${late}\n` }, `pulse: late advance ${late}`);
    return { published: false, skipped: true, reason: 'shared publish step ran', result: { published: false, reason: 'scope-refused' } };
  });
  const tr = await runTrain(ctxFor(repo), {
    repo, trainId: asm.manifest.train, manifest: asm.manifest,
    gates, rederive: stubRederive(), review: approveReview(), now: () => T0,
    publish, lockWaitMs: 5000,
  });

  assert.equal(tr.ok, true, 'the bound is a publish stop, not a verification failure');
  assert.equal(tr.publish.published, false);
  assert.equal(tr.publish.attempts.length, TRAIN_PUBLISH_MAX_ATTEMPTS, `exactly ${TRAIN_PUBLISH_MAX_ATTEMPTS} attempts, then stop`);
  assert.match(tr.publish.reason ?? '', /retry bound/, 'the bound is named in the verdict');
  assert.match(tr.publish.reason ?? '', /nothing widened/, 'no declaration was widened to get through');
  const fullRuns = gates.calls.filter((c) => c.scripts && c.scripts.length === TRAIN_GATES.length).length;
  assert.equal(fullRuns, TRAIN_PUBLISH_MAX_ATTEMPTS, 'one full gate set per attempt, no more');
});

// ---------------------------------------------------------------------------
// End to end: train -> loop shim -> shared step -> bare origin.
// ---------------------------------------------------------------------------

/** The shared step's import closure, copied so the shim finds the real thing. */
const SHIM_FIXTURE_FILES = [
  'pulse/lib/publish.mjs',
  'pulse/lib/core.mjs',
  'pulse/lib/indexnow.mjs',
  'lib/asset-routes.mjs',
  'lib/site-config.mjs',
];

test('end to end: the train declares its verified SHA through the shim and the bare origin serves it', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'atai-scope-e2e-'));
  const repo = join(dir, 'repo');
  const remote = join(dir, 'origin.git');
  t.after(() => cleanup(dir));
  mkdirSync(repo, { recursive: true });
  git(repo, ['init', '--quiet']);
  git(repo, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(repo, ['config', 'user.email', 'scope@example.invalid']);
  git(repo, ['config', 'user.name', 'Scope Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  git(repo, ['config', 'core.autocrlf', 'false']);
  execFileSync('git', ['init', '--quiet', '--bare', remote], { stdio: 'ignore' });
  git(repo, ['remote', 'add', 'origin', remote.replace(/\\/g, '/')]);
  // The real shared step and its whole closure, byte for byte.
  for (const rel of SHIM_FIXTURE_FILES) {
    const src = join(WORKTREE_ROOT, rel);
    const dest = join(repo, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(src, 'utf8'), 'utf8');
  }
  mkdirSync(join(repo, 'data'), { recursive: true });
  writeFileSync(join(repo, 'data', 'config.json'), JSON.stringify({ publish: true }, null, 2) + '\n', 'utf8');
  writeFileSync(join(repo, '.gitattributes'), '* -text\n', 'utf8');
  writeFileSync(join(repo, 'base.txt'), 'base\n', 'utf8');
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'base']);

  admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
  const asm = await assembledTrain(repo, 't-e2e');
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);

  // The deploy lands the instant the send reaches the remote: the server
  // reads the bare origin at request time, like loop's own harness.
  const server = createServer((_req, res) => {
    let head = null;
    try {
      head = execFileSync('git', ['-C', remote, 'rev-parse', '--short=12', 'main'], { encoding: 'utf8' }).trim();
    } catch {
      /* nothing has reached the remote yet — no live build to report */
    }
    if (!head) {
      res.writeHead(404);
      res.end('');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ built_at: '2026-09-11T00:00:00Z', commit: head, dirty: false }));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const prior = process.env.SITE_URL;
  process.env.SITE_URL = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    if (prior === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = prior;
    await new Promise((r) => server.close(r));
  });

  const ctx = { ...ctxFor(repo), pollBudgetMs: 100, confirmBudgetMs: 100, log: () => {} };
  const gates = greenGates();
  const tr = await runTrain(ctx, {
    repo, trainId: asm.manifest.train, manifest: asm.manifest,
    gates, rederive: async () => ({ ok: true, reason: 'e2e-clean' }), review: approveReview(), now: () => T0,
    lockWaitMs: 5000,
  });

  assert.equal(tr.ok, true, tr.reason ?? 'e2e train refused');
  assert.equal(tr.publish.published, true, `the train published through the shim: ${JSON.stringify(tr.publish)}`);
  const finalHead = git(repo, ['rev-parse', 'HEAD']);
  assert.equal(remoteTip(remote), finalHead, 'the bare origin serves the verified tip — read off the remote');
  assert.equal(git(repo, ['rev-parse', 'main']), finalHead, 'local main followed');
  assert.equal(existsSync(join(repo, 'HOLD.md')), false, 'a landed deploy writes no hold');
});
