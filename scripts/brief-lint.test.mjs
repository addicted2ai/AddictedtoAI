/**
 * brief-lint.test.mjs — the host proof.
 *
 * Every guard gets a two-sided control: a passing vehicle and a
 * minimally-different failing twin, asserting exit status and the
 * refusing guard name. A guard never seen refusing is not yet a guard.
 *
 * Vehicles are files under the OS temp area, one fresh area per trial,
 * removed after. Nothing here writes into the working tree.
 *
 * The ninth guard (pointer resolution) carries a wild control: the banked
 * round1 brief whose wrong pointer the guard was built to refuse. That
 * trial runs the linter over the banked file as found, with the sha taken
 * from its own authority line rather than retyped here. A second pointer
 * trial is plainly synthetic and labelled so.
 *
 * The two-letter directory token trial assembles its token at runtime so
 * this file never spells it. Its refusing name is matched on the tail
 * words that name no token.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const LINTER = join(REPO, 'scripts', 'brief-lint.mjs');
// THE CHANGE UNDER TEST IS DISCOVERED, NOT NAMED.
//
// A bare constant naming one in-flight change is invisible to
// `scripts/no-change-dir-refs.test.mjs` — a constant is not a path — and it
// rots the day that change is archived, which is a delayed failure this
// repository has already paid for three times. Deleting the visible path while
// keeping the constant would have removed the alarm and kept the defect.
//
// The anchor is what the fixtures actually NEED, not alphabetical order: the
// pointer trials below assert that a live phrase resolves inside the change's
// `tasks.md`, so the change is whichever unarchived one carries that phrase.
// Measured 2026-09-10: of the four unarchived changes, exactly one does, and
// none carries the deliberately-wrong twin. The trial directly below asserts
// that uniqueness, so an ambiguous anchor fails loudly and by name rather than
// silently selecting the wrong corpus.
const LIVE_PHRASE = 'Stage 0 ships first and alone';
const CHANGE_ROOT = resolve(REPO, 'openspec', 'changes');
const CHANGE_CANDIDATES = readdirSync(CHANGE_ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== 'archive')
  .map((e) => e.name)
  .filter((name) => {
    const tasks = join(CHANGE_ROOT, name, 'tasks.md');
    return existsSync(tasks) && readFileSync(tasks, 'utf8').replace(/\s+/g, ' ').includes(LIVE_PHRASE);
  })
  .sort();
const CHANGE = CHANGE_CANDIDATES[0];
// Computed from the discovered directory rather than written as a path literal,
// so no change is named in this file either.
const TASKS_REL = CHANGE
  ? relative(REPO, join(CHANGE_ROOT, CHANGE, 'tasks.md')).replace(/\\/g, '/')
  : null;

test('fixtures: exactly one unarchived change carries the live phrase', () => {
  assert.equal(
    CHANGE_CANDIDATES.length,
    1,
    `the pointer fixtures anchor on "${LIVE_PHRASE}"; ${CHANGE_CANDIDATES.length} unarchived change(s) carry it: ${CHANGE_CANDIDATES.join(', ') || 'none'}`,
  );
});

// Assembled at runtime so this file never spells the guarded two-letter token.
const DIR_TOKEN = String.fromCharCode(99, 100);
// Upper-case form assembled the same way, for the same reason.
const DIR_TOKEN_UPPER = String.fromCharCode(67, 68);

function headSha() {
  return execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

function writeBrief(text) {
  const dir = mkdtempSync(join(tmpdir(), 'brief-lint-'));
  const path = join(dir, 'brief.md');
  writeFileSync(path, text, 'utf8');
  return { dir, path };
}

function runLint(briefPath, sha, flags = []) {
  const res = spawnSync(process.execPath, [LINTER, briefPath, sha, ...flags], { encoding: 'utf8' });
  return { status: res.status, out: `${res.stdout || ''}${res.stderr || ''}` };
}

function baseBrief(sha) {
  return [
    '# Test brief — base passing vehicle',
    '',
    `authority: ${CHANGE}@${sha}`,
    '',
    'This brief directs a small scoped edit for testing.',
    '',
    'The property is enforced by `scripts/run-tests.mjs`.',
    '',
    '## Files',
    '',
    '- `scripts/run-tests.mjs` — the test runner',
    '',
    'Your report is `RESULT1.md`.',
    '',
  ].join('\n');
}

function withTemp(text, fn) {
  const { dir, path } = writeBrief(text);
  try {
    return fn(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function packetBrief(sha, { changed = 6, headerLines = 22 } = {}) {
  const header = [];
  header.push('# Test packet — passing vehicle');
  header.push('');
  header.push(`authority: ${CHANGE}@${sha}`);
  header.push('');
  header.push('This packet header states what was independently verified.');
  for (let i = header.length; i < headerLines; i += 1) {
    header.push(`Header line ${String(i).padStart(2, '0')}: testing the packet vehicle.`);
  }
  const lines = [...header];
  lines.push(`## THE AUTHOR'S REPORT`);
  lines.push('');
  lines.push('Author report line one.');
  lines.push('Author report line two.');
  lines.push('');
  lines.push(`## THE FULL DIFF FROM THE BASE`);
  lines.push('');
  for (let i = 0; i < changed; i += 1) {
    lines.push(`+added line ${i} for the packet diff`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

/* ── 1. authority ─────────────────────────────────────────────── */

test('authority: passing vehicle goes green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*authority line present, reachable, equals argument/);
  });
});

test('authority: unknown sha refuses', () => {
  const sha = headSha();
  const BAD = '0'.repeat(40);
  withTemp(baseBrief(BAD), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*authority line present, reachable, equals argument/);
  });
});

/* ── 2. quotes ────────────────────────────────────────────────── */

test('quotes: verbatim block goes green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\n> Stage 0 ships first and alone\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*quotes verbatim against/);
  });
});

test('quotes: one changed word refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\n> Stage 0 ships first and lonely\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*quotes verbatim against/);
    assert.match(r.out, /NOT VERBATIM/);
  });
});

/* ── 3. instruments ───────────────────────────────────────────── */

test('instruments: existing instrument goes green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
  });
});

test('instruments: missing instrument refuses', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'enforced by `scripts/run-tests.mjs`',
    'enforced by `scripts/does-not-exist-xyz.mjs`',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every enforcement claim names/);
    assert.match(r.out, /NO INSTRUMENT/);
  });
});

/* ── 4. files ─────────────────────────────────────────────────── */

test('files: scoped bullet with reason goes green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every permitted file carries/);
  });
});

test('files: bullet without reason refuses', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    '- `scripts/run-tests.mjs` — the test runner',
    '- `scripts/run-tests.mjs`',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every permitted file carries/);
    assert.match(r.out, /NO REASON/);
  });
});

/* ── 4b. scope is two-directional ─────────────────────────────── */

test('scope: no stray edit instruction goes green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*no instruction directs an edit/);
  });
});

test('scope: stray edit instruction refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nEdit \`loop/run.mjs\` to fix the bug.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*no instruction directs an edit/);
  });
});

/* ── 5. once ──────────────────────────────────────────────────── */

test('once: clean vehicle goes green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*"once" always says iteration or attempt/);
  });
});

test('once: bare once refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nRun it once.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*"once" always says iteration or attempt/);
  });
});

/* ── 6. prohibition-line token ────────────────────────────────── */

test('check 6: clean vehicle goes green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*outside a prohibition line/);
  });
});

test('check 6: stray token refuses (assembled at runtime)', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nRun ${DIR_TOKEN} /tmp to inspect.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*outside a prohibition line/);
  });
});

/* ── 7. revision ──────────────────────────────────────────────── */

test('revision: class plus sweep goes green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nThe CLASS is carried findings.\nDo a sweep of all files.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--revision']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*revision brief names a CLASS/);
  });
});

test('revision: missing sweep refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nThe CLASS is carried findings.\nDo a review of all files.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--revision']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*revision brief names a CLASS/);
  });
});

/* ── 8. result name ───────────────────────────────────────────── */

test('result name: numbered report goes green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*report file is a numbered/);
  });
});

test('result name: bare report refuses', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace('`RESULT1.md`', '`RESULT.md`');
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*report file is a numbered/);
  });
});

/* ── 8b. review name ──────────────────────────────────────────── */

test('review name: numbered review goes green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nYour review is \`REVIEW1.md\`.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*review output is a numbered/);
  });
});

test('review name: bare review refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nYour review is \`REVIEW.md\`.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*review output is a numbered/);
  });
});

/* ── 9. pointers ──────────────────────────────────────────────── */

test('pointers: live pointer with named phrase goes green', () => {
  const sha = headSha();
  const text =
    `${baseBrief(sha)}\nThe baseline *Stage 0 ships first and alone* is recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every `git show sha:path` resolves/);
  });
});

test('pointers: synthetic paraphrase refuses (one word)', () => {
  const sha = headSha();
  const text =
    `${baseBrief(sha)}\nThe baseline *Stage 0 ships first and lonely* is recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every `git show sha:path` resolves/);
    assert.match(r.out, /does not contain/);
  });
});

test('pointers: wild banked brief refuses on the ninth check', () => {
  const wild = join(
    REPO,
    'openspec',
    'changes',
    CHANGE,
    'evidence',
    'reviews',
    'stage0-packet-C1',
    'round1-agent-brief.md',
  );
  const wildText = readFileSync(wild, 'utf8');
  const m = wildText.match(/authority:\s*[A-Za-z0-9_.\-]+@([0-9a-f]{7,40})/);
  assert.ok(m, 'banked brief carries an authority line');
  const sha = m[1];
  const r = runLint(wild, sha);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /FAIL.*every `git show sha:path` resolves/);
  assert.match(r.out, /does not contain/);
});

/* ── 0. packet structure ──────────────────────────────────────── */

test('packet: sealed vehicle with diff goes green', () => {
  const sha = headSha();
  withTemp(packetBrief(sha, { changed: 6, headerLines: 22 }), (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*packet carries the author report/);
    assert.match(r.out, /PASS.*packet header is substantive/);
  });
});

test('packet: thin diff refuses', () => {
  const sha = headSha();
  withTemp(packetBrief(sha, { changed: 2, headerLines: 22 }), (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*packet carries the author report/);
  });
});

test('packet: thin header refuses', () => {
  const sha = headSha();
  withTemp(packetBrief(sha, { changed: 6, headerLines: 5 }), (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*packet header is substantive/);
  });
});

/* ── missing task file ────────────────────────────────────────── */

test('tasks file: unknown change refuses with path named', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(`${CHANGE}@${sha}`, `no-such-change-xyz@${sha}`);
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*quotes verbatim against/);
    assert.match(r.out, /task file does not resolve/);
    assert.match(r.out, /no-such-change-xyz/);
  });
});

/* ── the move itself ──────────────────────────────────────────── */

test('move: no hard-coded root or task path remains', () => {
  const src = readFileSync(LINTER, 'utf8');
  assert.ok(!src.includes(`const REPO = 'D:/AddictedtoAI'`), 'hard-coded root is gone');
  // The prefix is assembled because this assertion IS the pattern it looks for,
  // and a checker that spells its own pattern matches itself. The repository's
  // change-directory guard assembles the same prefix for the same reason.
  // Stronger than the string equality this replaced: that one refused ONE exact
  // literal, so any other spelling of a named change passed it.
  const namedChanges = [
    ...src.matchAll(new RegExp(`${['openspec', 'changes', ''].join('/')}([^\\s/'"\\x60]+)/`, 'g')),
  ].map((m) => m[1]);
  assert.deepEqual(namedChanges, [], 'no change directory is named in the linter source');
  assert.ok(src.includes('CHANGE_ROOT'), 'the change root is a constant and the change name derives from the brief');
  assert.ok(src.includes('import.meta.url'), 'root derives from script location');
  assert.ok(src.includes('_changeName'), 'change name derives from authority line');
});

/* ── F1 scope verbs beyond Edit ─────────────────────────────── */

test('scope: Rewrite stray refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nRewrite \`loop/run.mjs\` to fix the bug.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*no instruction directs an edit/);
  });
});

test('scope: Modify stray refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nModify \`loop/run.mjs\` to fix the bug.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*no instruction directs an edit/);
  });
});

/* ── F2 upper-case form ─────────────────────────────────────── */

test('check 6: upper-case stray refuses (assembled at runtime)', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nRun ${DIR_TOKEN_UPPER} /tmp to inspect.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*outside a prohibition line/);
  });
});

/* ── F3 exemption vehicles ──────────────────────────────────── */

test('check 6: never prohibition stays green (assembled at runtime)', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nNever run ${DIR_TOKEN} /tmp; it is forbidden.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*outside a prohibition line/);
  });
});

test('check 6: token-word prohibition stays green (assembled at runtime)', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nThe ${DIR_TOKEN} token is forbidden here.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*outside a prohibition line/);
  });
});

/* ── F4 packet diff boundary ────────────────────────────────── */

test('packet: five changed lines goes green', () => {
  const sha = headSha();
  withTemp(packetBrief(sha, { changed: 5, headerLines: 22 }), (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*packet carries the author report/);
  });
});

test('packet: four changed lines refuses', () => {
  const sha = headSha();
  withTemp(packetBrief(sha, { changed: 4, headerLines: 22 }), (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*packet carries the author report/);
  });
});

/* ── F5 packet header boundary ──────────────────────────────── */

test('packet: twenty header lines goes green', () => {
  const sha = headSha();
  withTemp(packetBrief(sha, { changed: 6, headerLines: 20 }), (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*packet header is substantive/);
  });
});

test('packet: nineteen header lines refuses', () => {
  const sha = headSha();
  withTemp(packetBrief(sha, { changed: 6, headerLines: 19 }), (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*packet header is substantive/);
  });
});

/* ── F6 revision second arm ─────────────────────────────────── */

test('revision: every-form without class word goes green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nEvery check in this file is covered.\nDo a sweep of all files.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--revision']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*revision brief names a CLASS/);
  });
});

/* ── F7 result conjunction ──────────────────────────────────── */

test('result name: numbered plus bare refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nSee \`RESULT.md\` for the protocol.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*report file is a numbered/);
  });
});

/* ── F8 shared-logic reds ───────────────────────────────────── */

test('packet: bare name in header refuses', () => {
  const sha = headSha();
  let text = packetBrief(sha, { changed: 6, headerLines: 22 });
  const parts = text.split('\n');
  const at = parts.findIndex((l) => /^##\s+THE AUTHOR'S REPORT/i.test(l));
  parts.splice(at, 0, 'The header mentions `RESULT.md` here.');
  text = parts.join('\n');
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*packet header names no bare/);
  });
});

test('instruments: zero claims under review refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha).replace('The property is enforced by \`scripts/run-tests.mjs\`.', 'The property holds for this edit.')}\nYour review is \`REVIEW1.md\`.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*enforcement claims/);
  });
});

/* ── sweep: once exemption ──────────────────────────────────── */

test('once: with iteration stays green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nRun it once as an iteration before you start.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*"once" always says iteration or attempt/);
  });
});

test('once: with attempt stays green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nRun it once as an attempt before you start.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*"once" always says iteration or attempt/);
  });
});

/* ── sweep: files ───────────────────────────────────────────── */

test('files: missing path refuses', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    '- `scripts/run-tests.mjs` — the test runner',
    '- `scripts/does-not-exist-xyz.mjs` — the test runner',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every permitted file carries/);
    assert.match(r.out, /PATH MISSING/);
  });
});

test('files: missing path marked new stays green', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    '- `scripts/run-tests.mjs` — the test runner',
    '- `scripts/does-not-exist-xyz.mjs` — the test runner (new)',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every permitted file carries/);
  });
});

test('files: Work only in block goes green', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace('## Files', 'Work only in:');
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every permitted file carries/);
  });
});

/* ── sweep: instruments ─────────────────────────────────────── */

test('instruments: missing path with find stays green', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'enforced by `scripts/run-tests.mjs`',
    'enforced by `scripts/does-not-exist-xyz.mjs` and find them and run them',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
  });
});

test('instruments: enforces form goes green', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'The suite enforces the property in `scripts/run-tests.mjs`.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
  });
});

/* ── sweep: scope ───────────────────────────────────────────── */

test('scope: prohibition spares stray path', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nDo not edit \`loop/run.mjs\`.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*no instruction directs an edit/);
  });
});

test('scope: cited path without verb stays green', () => {
  // Pin: this path carries the word `changes` inside it, which is in EDIT_VERB.
  // Without cited-path removal the verb test would read it as an edit
  // instruction. Keep an example with such a word here; a path without one
  // (for instance loop/run.mjs) would stay green either way and prove nothing.
  // The ARCHIVED form is used deliberately: it carries the same word, and it is
  // the one shape archiving can never move, so this fixture cannot rot. It also
  // names no unarchived change, which `scripts/no-change-dir-refs.test.mjs`
  // refuses — including in fixtures, which is how this file failed the gate on
  // 2026-09-10.
  const sha = headSha();
  const text = `${baseBrief(sha)}\nSee \`openspec/changes/archive/2026-09-07-a-finished-change/tasks.md\` for context.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*no instruction directs an edit/);
  });
});

/* ── sweep: revision ────────────────────────────────────────── */

test('revision: sweep without class refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nDo a sweep of all files.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--revision']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*revision brief names a CLASS/);
  });
});

/* ── sweep: result and review names ─────────────────────────── */

test('result name: no name refuses', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace('`RESULT1.md`', 'the report');
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*report file is a numbered/);
  });
});

test('review name: no review name refuses', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*review output is a numbered/);
  });
});

test('review name: numbered plus bare refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nYour review is \`REVIEW1.md\` and \`REVIEW.md\`.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*review output is a numbered/);
  });
});

test('review name: bare result under review refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha).replace('`RESULT1.md`', '`RESULT.md`')}\nYour review is \`REVIEW1.md\`.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*review output is a numbered/);
  });
});

test('review name: suffixed numbered review goes green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nYour review is \`REVIEW1-muse.md\`.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*review output is a numbered/);
  });
});

/* ── sweep: packet order ────────────────────────────────────── */

test('packet: missing report marker refuses', () => {
  const sha = headSha();
  let text = packetBrief(sha, { changed: 6, headerLines: 22 });
  const parts = text.split('\n').filter((l) => !/^##\s+THE AUTHOR'S REPORT/i.test(l));
  text = parts.join('\n');
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*packet carries the author report/);
  });
});

test('packet: reversed markers refuses', () => {
  const sha = headSha();
  const header = [];
  header.push('# Test packet — passing vehicle');
  header.push('');
  header.push(`authority: ${CHANGE}@${sha}`);
  header.push('');
  header.push('This packet header states what was independently verified.');
  for (let i = header.length; i < 22; i += 1) {
    header.push(`Header line ${String(i).padStart(2, '0')}: testing the packet vehicle.`);
  }
  const lines = [...header];
  lines.push(`## THE FULL DIFF FROM THE BASE`);
  lines.push('');
  for (let i = 0; i < 6; i += 1) {
    lines.push(`+added line ${i} for the packet diff`);
  }
  lines.push('');
  lines.push(`## THE AUTHOR'S REPORT`);
  lines.push('');
  lines.push('Author report line one.');
  lines.push('');
  const text = `${lines.join('\n')}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha, ['--packet']);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*packet carries the author report/);
  });
});

/* ── sweep: quotes ──────────────────────────────────────────── */

test('quotes: ellipsis prefix stays green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\n> ... Stage 0 ships first and alone\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*quotes verbatim against/);
  });
});

/* ── sweep: authority ───────────────────────────────────────── */

test('authority: mismatched reachable sha refuses', () => {
  const sha = headSha();
  const parent = execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD~1'], { encoding: 'utf8' }).trim();
  assert.notEqual(parent.slice(0, 7), sha.slice(0, 7));
  withTemp(baseBrief(parent), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*authority line present, reachable, equals argument/);
  });
});

test('authority: same unreachable sha refuses', () => {
  const BAD = '0'.repeat(40);
  withTemp(baseBrief(BAD), (p) => {
    const r = runLint(p, BAD);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*authority line present, reachable, equals argument/);
  });
});

/* ── sweep: token boundaries ────────────────────────────────── */

test('check 6: embedded letters stay green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nThe anecdote about the test is noted.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*outside a prohibition line/);
  });
});

/* ── sweep: pointers ────────────────────────────────────────── */

test('pointers: live backticked phrase goes green', () => {
  const sha = headSha();
  const text =
    `${baseBrief(sha)}\nThe baseline \`Stage 0 ships first and alone\` is recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every `git show sha:path` resolves/);
  });
});

test('pointers: synthetic backticked paraphrase refuses', () => {
  const sha = headSha();
  const text =
    `${baseBrief(sha)}\nThe baseline \`Stage 0 ships first and lonely\` is recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every `git show sha:path` resolves/);
    assert.match(r.out, /does not contain/);
  });
});

test('pointers: second phrase still checked refuses', () => {
  const sha = headSha();
  const text =
    `${baseBrief(sha)}\nThe baseline *Stage 0 ships first and alone* and *Stage 0 ships first and lonely* are recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every `git show sha:path` resolves/);
    assert.match(r.out, /does not contain/);
  });
});

test('pointers: short phrase ignored stays green', () => {
  const sha = headSha();
  const text =
    `${baseBrief(sha)}\nThe baseline *wrong words here* is recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every `git show sha:path` resolves/);
  });
});

/* ── round 3 floor binds ─────────────────────────────── */

test('authority: short argument stays green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha.slice(0, 7));
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*authority line present, reachable, equals argument/);
  });
});

test('authority: seven-char sha stays green', () => {
  const sha = headSha();
  withTemp(baseBrief(sha.slice(0, 7)), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*authority line present, reachable, equals argument/);
  });
});

test('files: empty scope block refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha).replace('- `scripts/run-tests.mjs` — the test runner\n', '')}\n## Next\n\nBody.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every permitted file carries/);
  });
});

test('result name: quoted-only bare stays green', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\n> **WITHDRAWN as above. Every Stage 0 packet's RESULT.md carries a MUTATION TABLE (from packet B1\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*report file is a numbered/);
    assert.match(r.out, /PASS.*quotes verbatim against/);
  });
});

test('scope: two paths one sentence second stray refuses', () => {
  const sha = headSha();
  const text = `${baseBrief(sha)}\nEdit \`scripts/run-tests.mjs\` and \`loop/run.mjs\` to fix the bug.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*no instruction directs an edit/);
    assert.match(r.out, /loop\/run\.mjs/);
  });
});

test('check 6: leading-adjacent stays green (assembled at runtime)', () => {
  // Letter on the left, boundary on the right: leading guard alone spares it.
  const sha = headSha();
  const text = `${baseBrief(sha)}\nThe a${DIR_TOKEN} /tmp note is here.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*outside a prohibition line/);
  });
});

test('check 6: trailing-adjacent stays green (assembled at runtime)', () => {
  // Boundary on the left, letter on the right: trailing guard alone spares it.
  const sha = headSha();
  const text = `${baseBrief(sha)}\nRun ${DIR_TOKEN}x to inspect here.\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*outside a prohibition line/);
  });
});

test('pointers: distant phrase at six refuses', () => {
  const sha = headSha();
  const wrong = '*Stage 0 ships first and lonely*';
  const fillers = [
    'Filler line one for window test.',
    'Filler line two for window test.',
    'Filler line three for window test.',
    'Filler line four for window test.',
    'Filler line five for window test.',
  ];
  const text = `${baseBrief(sha)}\nThe baseline ${wrong} is recorded.\n${fillers.join('\n')}\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every `git show sha:path` resolves/);
    assert.match(r.out, /does not contain/);
  });
});

test('pointers: distant phrase at seven stays green', () => {
  const sha = headSha();
  const wrong = '*Stage 0 ships first and lonely*';
  const fillers = [
    'Filler line one for window test.',
    'Filler line two for window test.',
    'Filler line three for window test.',
    'Filler line four for window test.',
    'Filler line five for window test.',
    'Filler line six for window test.',
  ];
  const text = `${baseBrief(sha)}\nThe baseline ${wrong} is recorded.\n${fillers.join('\n')}\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every `git show sha:path` resolves/);
  });
});

test('pointers: git-prefixed phrase ignored stays green', () => {
  const sha = headSha();
  const live = '*Stage 0 ships first and alone*';
  const gitPhrase = '`git status shows nothing here yet today`';
  const fillers = [
    'Filler one for isolation here.',
    'Filler two for isolation here.',
    'Filler three for isolation here.',
    'Filler four for isolation here.',
  ];
  const text = `${baseBrief(sha)}\n${fillers.join('\n')}\nThe baseline ${live} is recorded.\nThe extra ${gitPhrase} is noted.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every `git show sha:path` resolves/);
  });
});

test('pointers: spaceless long phrase ignored stays green', () => {
  // Deliberate control for the space filter. Earlier vehicles bound it only
  // because the base brief carries long backticked paths with no space; a base
  // with short paths would silently unbind it. Here the base is pushed outside
  // the six-line window by fillers, so the only long spaceless phrase in range
  // is the one below. Without the space filter it would be collected and absent.
  const sha = headSha();
  const live = '*Stage 0 ships first and alone*';
  const spaceless = '`scripts/does-not-exist-xyz.mjs`';
  const fillers = [
    'Filler one for isolation here.',
    'Filler two for isolation here.',
    'Filler three for isolation here.',
    'Filler four for isolation here.',
  ];
  const text = `${baseBrief(sha)}\n${fillers.join('\n')}\nThe baseline ${live} is recorded.\nThe extra ${spaceless} is noted.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every `git show sha:path` resolves/);
  });
});

test('pointers: twenty-char absent refuses', () => {
  // Exactly 20 inner chars with a space, absent from the blob: collected.
  // Under a 21-char threshold it would be ignored and stay green.
  const sha = headSha();
  const p20 = 'aaaaaaaaaa bbbbbbbbb';
  const text = `${baseBrief(sha)}\nThe baseline *${p20}* is recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every `git show sha:path` resolves/);
    assert.match(r.out, /does not contain/);
  });
});

/* ── 3b. substantiation: addressed is not substantiated ──────────
 *
 * A claim is substantiated when a named, existing instrument shares
 * something with the claim (a backticked identifier, a double-quoted
 * string, a path) beyond the file name. Naming the file alone is
 * addressed, not substantiated. Delegation ("find ...") keeps passing,
 * and a claim carrying no distinctive content passes as addressed.
 */

function countFail(out) {
  return (out.match(/FAIL/g) || []).length;
}

test('instruments: shared token stays green (substantiation vehicle)', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'Stale source references are enforced by `scripts/no-change-dir-refs.test.mjs`, which scans the `SEARCH` directories.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
    assert.match(r.out, /1 claim\(s\): 1 substantiated, 0 addressed/);
  });
});

test('instruments: wild addressed-but-unsubstantiated twin refuses', () => {
  // The packet's live false claim: existing, correctly-named,
  // relevant-sounding instrument that cannot do what the claim says
  // (its glob collects code files and has never read a markdown file).
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'Stale references in markdown under `wisdom/` are enforced by `scripts/no-change-dir-refs.test.mjs`.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every enforcement claim names/);
    assert.match(r.out, /UNSUBSTANTIATED/);
    assert.match(r.out, /no-change-dir-refs\.test\.mjs/);
    assert.equal(countFail(r.out), 1, `twin must fail for its own reason only:\n${r.out}`);
  });
});

test('instruments: named-plus-delegation stays green (wild delegation vehicle)', () => {
  // The shape the review briefs actually use: the property stated, the
  // mapping handed to the reader. Refusing it would push briefs toward
  // naming a file confidently instead. Must stay green.
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'The three properties above hold; find what enforces each and run it before dispatch.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
  });
});

test('instruments: content-free claim stays green (addressed, not substantiated)', () => {
  // "The property is enforced by ..." carries nothing to look for. There
  // is nothing to refuse it FOR without refusing brevity itself, and
  // demanding content would push authors to invent some. Passes, and says
  // addressed in the detail so a reader sees how much of the PASS was which.
  const sha = headSha();
  withTemp(baseBrief(sha), (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
    assert.match(r.out, /1 claim\(s\): 0 substantiated, 1 addressed/);
  });
});

test('instruments: double-quoted present content stays green', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'Loopback port exhaustion is enforced by `scripts/run-tests.mjs` ("ephemeral loopback ports").',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
    assert.match(r.out, /1 claim\(s\): 1 substantiated, 0 addressed/);
  });
});

test('instruments: double-quoted absent content refuses', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'The coverage gap is enforced by `scripts/run-tests.mjs` ("markdown gap analysis").',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every enforcement claim names/);
    assert.match(r.out, /UNSUBSTANTIATED/);
    assert.equal(countFail(r.out), 1, `twin must fail for its own reason only:\n${r.out}`);
  });
});

test('instruments: one unshared instrument of two refuses', () => {
  // Each named instrument must earn its naming: the token lives in the
  // first file and nowhere in the second, so the claim over its second
  // half is addressed, not substantiated.
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'The `TEST_LOCK_SUFFIX` rule is enforced by `scripts/run-tests.mjs` and `scripts/brief-lint.mjs`.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every enforcement claim names/);
    assert.match(r.out, /UNSUBSTANTIATED/);
    assert.match(r.out, /scripts\/brief-lint\.mjs shares nothing/);
    assert.equal(countFail(r.out), 1, `twin must fail for its own reason only:\n${r.out}`);
  });
});

/* ── 3c. non-claim text neither welds nor claims ───────────────────
 *
 * Headings, block quotes, fenced code, table rows and the authority line
 * never contribute a claim sentence and never weld to one. List bullets
 * stay claims. The physical-line model is not the remedy: the weld twins
 * below refuse as prose, which is what a line model would also do to the
 * wrapped-claim vehicles it would newly split.
 */

test('instruments: heading trigger with delegation beside it stays green (weld vehicle)', () => {
  // The 2026-09-10 incident shape: the heading carries the trigger word,
  // the paragraph beneath names no instrument, the delegation sits in the
  // next sentence. The heading is a label, not a claim: dropping it leaves
  // zero claim sentences, which passes with a warning outside review mode.
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    '## Three properties, and you locate what enforces each\n\nI am naming properties and deliberately not naming instruments here.\n\nFind the instruments for each property and run them before dispatch.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /WARN.*enforcement claims/);
  });
});

test('instruments: heading words as prose still refuse (weld twin)', () => {
  // Same words, no heading marker: a real claim naming no instrument and
  // delegating nothing. Must refuse, and for the missing-instrument reason.
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'Three properties, and you locate what enforces each. I am naming properties and deliberately not naming instruments here.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every enforcement claim names/);
    assert.match(r.out, /NO INSTRUMENT/);
    assert.equal(countFail(r.out), 1, `twin must fail for its own reason only:\n${r.out}`);
  });
});

test('instruments: quoted frozen standard carrying trigger words stays green', () => {
  // A verbatim quote of the frozen standard is not the brief's assertion
  // (check 8 reads the brief's OWN lines for the same reason). The quoted
  // span below is verbatim from the change tasks and carries "enforced by"
  // with no instrument and no delegation; as prose it would refuse.
  const sha = headSha();
  const text = `${baseBrief(sha)}\n> ... were "both enforced by tests" and named only\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
    assert.match(r.out, /PASS.*quotes verbatim against/);
  });
});

test('instruments: fenced trigger stays green', () => {
  // Fenced code is commands, not assertions.
  const sha = headSha();
  const text = `${baseBrief(sha)}\n\`\`\`\nenforced by \`scripts/does-not-exist-xyz.mjs\`\n\`\`\`\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
  });
});

test('instruments: fenced words as prose still refuse (fence twin)', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'enforced by `scripts/does-not-exist-xyz.mjs`.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every enforcement claim names/);
    assert.match(r.out, /NO INSTRUMENT/);
    assert.equal(countFail(r.out), 1, `twin must fail for its own reason only:\n${r.out}`);
  });
});

test('instruments: table row trigger stays green', () => {
  // A table row is structured data, not a sentence.
  const sha = headSha();
  const text = `${baseBrief(sha)}\n| property | enforced by nothing here |\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
  });
});

test('instruments: table words as prose still refuse (table twin)', () => {
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'The property is enforced by nothing here.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL.*every enforcement claim names/);
    assert.match(r.out, /NO INSTRUMENT/);
    assert.equal(countFail(r.out), 1, `twin must fail for its own reason only:\n${r.out}`);
  });
});

test('instruments: wrapped delegation across two lines stays green (sentence-model vehicle)', () => {
  // The C1 wrapping shape the sentence model exists for: the claim sits on
  // one physical line and its delegation on the next, split by wrapping
  // alone. A physical-line model reads the first line as a claim with no
  // delegation and refuses; the sentence model joins them first and passes.
  const sha = headSha();
  const text = baseBrief(sha).replace(
    'The property is enforced by `scripts/run-tests.mjs`.',
    'The property is enforced by `scripts/does-not-exist-xyz.mjs`\nfind them and run them before you start.',
  );
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every enforcement claim names/);
  });
});

test('pointers: nineteen-char absent stays green', () => {
  // Nineteen inner chars with a space, absent: ignored under a 20-char
  // threshold. Under a 19-char threshold it would be collected and refuse.
  // Together with the twenty-char red this pins the boundary at twenty.
  const sha = headSha();
  const p19 = 'aaaaaaaaa bbbbbbbbb';
  const text = `${baseBrief(sha)}\nThe baseline *${p19}* is recorded.\n\ngit -C D:/AddictedtoAI show ${sha}:${TASKS_REL}\n`;
  withTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS.*every `git show sha:path` resolves/);
  });
});
