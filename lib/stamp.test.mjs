/**
 * stamp.test.mjs — the blocked-scout-streak witness in `/status.json`
 * (make-the-blog-worth-sending, task 2.7).
 *
 * The 4.13 stamp tests live in `assets.test.mjs` with the rest of the
 * published assets and are untouched; this file covers the field task 2.7
 * adds and, deliberately, re-asserts the four fields it must not disturb.
 *
 * The point of a witness is that it is measured, not asserted. A field
 * hardcoded to any constant would pass a test that only ever builds a blocked
 * streak, so every counting case here is paired with the case that must move
 * it back: a streak of three AND the filing run that resets it to zero.
 *
 * Fixture ledgers are written under the OS temp directory, never into this
 * repository's `data/`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

import {
  buildStamp,
  blockedScoutStreak,
  readLedgerLines,
  writeStatusFile,
  dirtyPaths,
  DIRTY_PATHS_CAP,
  LEDGER_FILE,
  SCOUT_TYPE,
  SCOUT_BLOCKED_OUTCOME,
  SCOUT_FILED_OUTCOME,
} from './stamp.mjs';

/** A ledger line in the shape `loop/lib/ledger.mjs` writes. */
function line(type, outcome, id = 'j-20260830-01') {
  return {
    ts: '2026-08-30T00:00:00.000Z',
    id,
    type,
    runner: 'claude-code-sonnet',
    provider: 'anthropic',
    tier: 'cheap',
    mm: 1.5,
    outcome,
  };
}

const scout = (outcome, id) => line(SCOUT_TYPE, outcome, id);

/**
 * A pinned clock and commit, so a stamp assertion measures the field under
 * test and not today's date. The ledger is pinned too: `buildStamp` otherwise
 * reads this repository's real `data/ledger.jsonl`, which changes with every
 * Desk run and would make these assertions drift.
 */
const FIXED = {
  now: new Date('2026-08-30T10:00:00.000Z'),
  commit: 'aaaaaaaaaaaa',
  ledger: [],
};

/** Write fixture lines to a real `.jsonl` under the OS temp dir. */
function ledgerFile(t, lines) {
  const dir = mkdtempSync(join(tmpdir(), 'addicted-stamp-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'ledger.jsonl');
  writeFileSync(file, lines.map((l) => JSON.stringify(l)).join('\n') + '\n', 'utf8');
  return file;
}

// ── the streak itself ────────────────────────────────────────────────────

test('2.7 a run of blocked scouts is counted, and a filing run resets it to 0', () => {
  const blocked = [scout('blocked', 'a'), scout('blocked', 'b'), scout('blocked', 'c')];

  // MEASURED, not asserted: the streak case and the reset case, same code.
  assert.equal(blockedScoutStreak(blocked), 3);
  assert.equal(blockedScoutStreak([...blocked, scout('done', 'd')]), 0);

  // And it resumes from zero after the reset, rather than from three.
  assert.equal(blockedScoutStreak([...blocked, scout('done', 'd'), scout('blocked', 'e')]), 1);
});

test('2.7 only the TRAILING run counts — an older streak behind a filing run is not', () => {
  const ledger = [
    scout('blocked', 'a'),
    scout('blocked', 'b'),
    scout('blocked', 'c'),
    scout('blocked', 'd'),
    scout('done', 'e'), // the wall
    scout('blocked', 'f'),
    scout('blocked', 'g'),
  ];
  assert.equal(blockedScoutStreak(ledger), 2, 'the four before the filing run are history');
});

test('2.7 an empty ledger, and one with no scout history at all, read as 0', () => {
  assert.equal(blockedScoutStreak([]), 0);
  assert.equal(blockedScoutStreak(undefined), 0);
  assert.equal(
    blockedScoutStreak([line('entry', 'done'), line('post', 'blocked'), line('verify', 'failed')]),
    0,
    'a blocked job of another type is not a blocked scout',
  );
});

test('2.7 other job types never interrupt a scout streak', () => {
  const ledger = [
    scout('blocked', 'a'),
    line('entry', 'done', 'b'),
    line('post', 'done', 'c'),
    scout('blocked', 'd'),
    line('verify', 'failed', 'e'),
    scout('blocked', 'f'),
  ];
  assert.equal(blockedScoutStreak(ledger), 3);
});

test('2.7 a scout run that neither blocked nor filed neither counts nor resets', () => {
  // `interrupted`, `capacity`, `failed`, `discarded` and `abandoned` are
  // evidence a RUN broke, not a judgment about whether the bar was cleared.
  for (const outcome of ['interrupted', 'capacity', 'failed', 'discarded', 'abandoned']) {
    assert.equal(
      blockedScoutStreak([scout('blocked', 'a'), scout(outcome, 'b'), scout('blocked', 'c')]),
      2,
      `${outcome} does not count`,
    );
    assert.equal(
      blockedScoutStreak([scout('done', 'a'), scout(outcome, 'b')]),
      0,
      `${outcome} after a filing run does not start a streak`,
    );
    assert.equal(
      blockedScoutStreak([scout('blocked', 'a'), scout(outcome, 'b')]),
      1,
      `${outcome} does not reset a streak either`,
    );
  }
});

// ── reading the real file ────────────────────────────────────────────────

test('2.7 the streak is read from a ledger file on disk, both cases', (t) => {
  const blocked = ledgerFile(t, [
    line('entry', 'done', 'a'),
    scout('blocked', 'b'),
    scout('blocked', 'c'),
  ]);
  assert.equal(blockedScoutStreak(readLedgerLines(blocked)), 2);

  const reset = ledgerFile(t, [
    line('entry', 'done', 'a'),
    scout('blocked', 'b'),
    scout('blocked', 'c'),
    scout('done', 'd'),
  ]);
  assert.equal(blockedScoutStreak(readLedgerLines(reset)), 0);
});

test('2.7 an absent ledger file reads as no history, not as a build failure', () => {
  assert.deepEqual(readLedgerLines(join(tmpdir(), 'addicted-stamp-definitely-absent.jsonl')), []);
  assert.equal(
    blockedScoutStreak(readLedgerLines(join(tmpdir(), 'addicted-stamp-definitely-absent.jsonl'))),
    0,
  );
});

test('2.7 a torn ledger line is skipped rather than thrown — the site still builds', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'addicted-stamp-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'ledger.jsonl');
  writeFileSync(
    file,
    JSON.stringify(scout('blocked', 'a')) +
      '\n' +
      JSON.stringify(scout('blocked', 'b')) +
      '\n{"ts":"2026-08-30T00:00:00.000Z","id":"torn","typ\n',
    'utf8',
  );
  assert.equal(readLedgerLines(file).length, 2, 'two whole lines survive the torn third');
  assert.equal(blockedScoutStreak(readLedgerLines(file)), 2);
});

test("2.7 the repository's own ledger parses, and yields a number", () => {
  const lines = readLedgerLines(LEDGER_FILE);
  const n = blockedScoutStreak(lines);
  assert.equal(Number.isInteger(n), true);
  assert.equal(n >= 0, true);
});

// ── the stamp it rides in ────────────────────────────────────────────────

test('2.7 the field reaches the stamp, and moves with the ledger', (t) => {
  const streak = buildStamp({
    now: new Date('2026-08-30T10:00:00.000Z'),
    commit: 'aaaaaaaaaaaa',
    dirty: false,
    ledgerFile: ledgerFile(t, [scout('blocked', 'a'), scout('blocked', 'b'), scout('blocked', 'c')]),
  });
  assert.equal(streak.blocked_scout_streak, 3);

  const broken = buildStamp({
    now: new Date('2026-08-30T10:00:00.000Z'),
    commit: 'aaaaaaaaaaaa',
    dirty: false,
    ledgerFile: ledgerFile(t, [
      scout('blocked', 'a'),
      scout('blocked', 'b'),
      scout('blocked', 'c'),
      scout('done', 'd'),
    ]),
  });
  assert.equal(broken.blocked_scout_streak, 0);

  // The whole point of the pair: the same code produced both, so the number is
  // derived and not a constant.
  assert.notEqual(streak.blocked_scout_streak, broken.blocked_scout_streak);
});

test('2.7 the four deploy-check fields are unchanged by the new one', (t) => {
  const opts = {
    now: new Date('2026-08-28T10:00:00.000Z'),
    commit: 'aaaaaaaaaaaa',
    dirty: false,
    ledgerFile: ledgerFile(t, [scout('blocked', 'a'), scout('blocked', 'b')]),
  };
  const s = buildStamp(opts);

  // Exactly what `scripts/verify-surfaces.mjs` checkStamp() asserts.
  assert.match(s.built_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.equal(s.commit.length > 0, true);

  // Values, not just shapes — the 4.13 expectations, restated here because
  // this file is what would break them.
  assert.equal(s.built_at, '2026-08-28T10:00:00Z');
  assert.equal(s.commit, 'aaaaaaaaaaaa');
  assert.equal(s.dirty, false);
  assert.equal(s.stamp, '2026-08-28T10:00:00Z · aaaaaaaaaaaa');
  assert.match(buildStamp({ ...opts, dirty: true }).stamp, /\+dirty$/);

  // The streak never joins the footer string: `verify-surfaces` asserts the
  // footer equals `status.stamp` character for character.
  assert.equal(s.stamp.includes('2'), true); // the year, not the streak
  assert.equal(/streak|blocked/.test(s.stamp), false);

  // Field order: the four keep their positions, later ones are appended.
  assert.deepEqual(Object.keys(s), [
    'built_at',
    'commit',
    'dirty',
    'stamp',
    'blocked_scout_streak',
    'dirty_paths',
  ]);
});

test('2.7 a tree with no git still builds a stamp, streak and all', () => {
  const s = buildStamp({ cwd: 'C:/definitely/not/a/repo' });
  assert.equal(s.commit, 'unknown');
  assert.equal(Number.isInteger(s.blocked_scout_streak), true);
});

test('2.7 the field is a pure function of the ledger — the stamp gains no nondeterminism', (t) => {
  const file = ledgerFile(t, [scout('blocked', 'a'), scout('blocked', 'b')]);
  const fixed = { now: new Date('2026-08-30T10:00:00.000Z'), commit: 'aaaaaaaaaaaa', dirty: false };
  const a = buildStamp({ ...fixed, ledgerFile: file });
  const b = buildStamp({ ...fixed, ledgerFile: file });
  assert.equal(JSON.stringify(a), JSON.stringify(b), 'byte-identical with no world change');
});

test('2.7 the written status file carries the field alongside the stamp', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'addicted-stamp-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const out = join(dir, 'status.json');

  await writeStatusFile(
    buildStamp({
      now: new Date('2026-08-30T10:00:00.000Z'),
      commit: 'aaaaaaaaaaaa',
      dirty: false,
      ledger: [scout('blocked', 'a'), scout('blocked', 'b'), scout('blocked', 'c')],
    }),
    out,
  );

  const parsed = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(parsed.blocked_scout_streak, 3);
  assert.equal(parsed.stamp, '2026-08-30T10:00:00Z · aaaaaaaaaaaa');
  assert.match(parsed.built_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.equal(parsed.commit, 'aaaaaaaaaaaa');
  assert.equal(parsed.dirty, false);
});

test("2.7 the type and outcomes are the ledger's own, not strings invented here", async () => {
  // A test-only import: `lib/` must not depend on `loop/` at runtime (design
  // D1), but the test can measure that the three literals `stamp.mjs` repeats
  // are still members of the loop's closed lists, rather than restating them.
  const { JOB_TYPES, OUTCOMES } = await import('../loop/lib/config.mjs');
  assert.equal(JOB_TYPES.includes(SCOUT_TYPE), true, 'scout is still a job type');
  assert.equal(OUTCOMES.includes(SCOUT_BLOCKED_OUTCOME), true);
  assert.equal(OUTCOMES.includes(SCOUT_FILED_OUTCOME), true);
});

// ── 4w2: a dirty stamp says WHAT is dirty ────────────────────────────────
//
// `dirty: true` alone is one bit, and one bit cannot be diagnosed from
// outside the builder. The live production stamp read `+dirty` on a deploy
// built from a commit whose local tree was verified clean, the first
// diagnosis was fixed in `c916a3c`, and production went on reporting it — so
// the remaining cause is in the BUILDER's checkout and only the build can
// name it. These measure that it does.

/** A throwaway git repository under the OS temp dir. Never this one. */
function tempRepo(t) {
  const dir = mkdtempSync(join(tmpdir(), 'addicted-dirty-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'test');
  writeFileSync(join(dir, 'tracked.txt'), 'one\n', 'utf8');
  git('add', '.');
  git('commit', '-qm', 'base');
  return { dir, git };
}

test('4w2 a clean checkout publishes an empty list, and spends no git call to say so', (t) => {
  const { dir } = tempRepo(t);
  assert.deepEqual(dirtyPaths(dir), [], 'nothing dirty, nothing named');

  // The stamp short-circuits on `dirty: false` rather than asking git again:
  // a caller that measured the checkout at prebuild entry has already decided.
  const s = buildStamp({ ...FIXED, dirty: false, cwd: dir });
  assert.deepEqual(s.dirty_paths, []);
});

test('4w2 an untracked file and a modified file are told apart by their status codes', (t) => {
  const { dir } = tempRepo(t);
  writeFileSync(join(dir, 'tracked.txt'), 'two\n', 'utf8');
  writeFileSync(join(dir, 'dropped-by-the-platform.txt'), 'x\n', 'utf8');

  const paths = dirtyPaths(dir);
  assert.equal(paths.length, 2);

  // THE WHOLE DIAGNOSTIC VALUE IS THIS DISTINCTION. `??` means something put a
  // file in the checkout; ` M` means something rewrote a tracked file. They
  // point at completely different causes, so the porcelain XY code is kept
  // verbatim rather than reduced to a bare filename.
  const untracked = paths.find((p) => p.includes('dropped-by-the-platform'));
  const modified = paths.find((p) => p.includes('tracked.txt'));
  assert.match(untracked, /^\?\? /, 'an untracked file keeps its ?? code');
  assert.match(modified, /^ M /, 'a modified tracked file keeps its M code');
});

test('4w2 the list is capped, and says so rather than truncating silently', (t) => {
  const { dir } = tempRepo(t);
  const n = DIRTY_PATHS_CAP + 5;
  for (let i = 0; i < n; i++) writeFileSync(join(dir, `f${i}.txt`), 'x\n', 'utf8');

  const paths = dirtyPaths(dir);
  assert.equal(paths.length, DIRTY_PATHS_CAP + 1, 'the cap, plus one line accounting for the rest');
  assert.equal(paths.at(-1), `… and ${n - DIRTY_PATHS_CAP} more`);
});

test('4w2 the field reaches the stamp when the tree really is dirty', (t) => {
  const { dir } = tempRepo(t);
  writeFileSync(join(dir, 'tracked.txt'), 'changed\n', 'utf8');

  const s = buildStamp({ ...FIXED, cwd: dir, dirty: true });
  assert.equal(s.dirty, true);
  assert.equal(s.dirty_paths.length, 1);
  assert.match(s.dirty_paths[0], /tracked\.txt$/);
});

test('4w2 POSITIVE CONTROL — the caller may hand in paths measured earlier', (t) => {
  // This is the production path: `scripts/prebuild.mjs` measures both at
  // PREBUILD ENTRY and hands them down, because by the time the assets step
  // runs the build has already rewritten tracked files under `data/derived/`.
  // Measured here rather than argued: the passed-in value wins over the tree.
  const { dir } = tempRepo(t);
  writeFileSync(join(dir, 'tracked.txt'), 'changed after the measurement\n', 'utf8');

  const s = buildStamp({
    ...FIXED,
    cwd: dir,
    dirty: true,
    dirty_paths: [' M data/derived/queue.json'],
  });
  assert.deepEqual(s.dirty_paths, [' M data/derived/queue.json']);
  assert.equal(
    s.dirty_paths.some((p) => p.includes('tracked.txt')),
    false,
    'the tree as it stands now must not overwrite what the caller measured',
  );
});

test('4w2 a tree with no git degrades to an empty list and never throws', () => {
  assert.deepEqual(dirtyPaths('C:/definitely/not/a/repo'), []);
  const s = buildStamp({ ...FIXED, cwd: 'C:/definitely/not/a/repo', dirty: true });
  assert.deepEqual(s.dirty_paths, [], 'an unreadable git degrades one field, it does not fail');
});

test('4w2 the new field never joins the footer string', (t) => {
  const { dir } = tempRepo(t);
  writeFileSync(join(dir, 'tracked.txt'), 'changed\n', 'utf8');

  // `verify-surfaces` asserts the page footer equals `status.stamp` character
  // for character, so anything appended to the stamp object must stay out of
  // that one string.
  const s = buildStamp({ ...FIXED, cwd: dir, dirty: true });
  assert.equal(s.stamp, '2026-08-30T10:00:00Z · aaaaaaaaaaaa+dirty');
  assert.equal(s.stamp.includes('tracked.txt'), false);
});
