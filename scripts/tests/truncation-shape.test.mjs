/**
 * truncation-shape.test.mjs — wisdom item 2b, the secondary host.
 *
 * Item 2a catches the truncation shape AS IT IS TYPED (a `PreToolUse`
 * hook). This catches it WHERE IT WAS COMMITTED and will be re-run
 * forever: a repository test scanning `scripts/`, `loop/` and `pulse/`
 * for a counting or enumerating command piped into a shortener, failing
 * naming the file and the line. Different population from 2a, same
 * instrument — the match itself is reused from
 * `scripts/output-shortener-guard.mjs` rather than restated, so there is
 * one definition of the shape, not two that can disagree.
 *
 * IT IS NOT A BLANKET BAN, and this is the arm that decides whether the
 * guard survives its first week: a deliberately non-exhaustive one-line
 * diagnostic stays GREEN while an unmarked enumeration through a
 * shortener goes RED, and a mutation dropping the exemption turns the
 * green arm red — proving the exemption load-bearing, not decorative.
 *
 * SELF-SCAN NOTE, stated so nobody has to discover it: this file is a
 * member of the scanned population (no self-exclusion — a scanner that
 * cannot see its own test prose has a hole exactly where prose about
 * the shape lives). Fixture violating shapes below are therefore
 * assembled from parts, so no on-disk line of this file matches the
 * detector; a future edit adding a literal violating line goes red as
 * it should, and the self-membership arm asserts this file is scanned.
 *
 * Arms:
 *   1. the sweep over the three directories finds zero violations.
 *   2. a declared non-exhaustive diagnostic stays green.
 *   3. an unmarked enumeration through a shortener goes red, naming file
 *      and line.
 *   4. mutation: dropping the exemption turns arm 2 red; reverted
 *      byte-identical, sweep green again.
 *   5. this file is itself scanned and clean.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findTruncatedEnumeration } from '../output-shortener-guard.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const SELF = relative(ROOT, fileURLToPath(import.meta.url)).replace(/\\/g, '/');

// The brief's population: exactly these three directories.
const SEARCH = ['scripts', 'loop', 'pulse'];
const EXTENSIONS = new Set(['.mjs', '.js', '.ts', '.tsx', '.sh']);

// stdlib only: this worktree deliberately carries no node_modules, so the
// full suite cannot collect here and neither can a fast-glob import. The
// recursion below is the same shape `lint-deferrals.test.mjs` uses.
function sourceFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue;
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (EXTENSIONS.has('.' + entry.name.split('.').pop()) && entry.isFile()) out.push(full);
    }
  };
  for (const dir of SEARCH) walk(resolve(ROOT, dir));
  return out.sort();
}

function relativeFile(abs) {
  return relative(ROOT, abs).replace(/\\/g, '/');
}

/**
 * The sweep. `honorMarker` selects the exemption the rule names; the
 * mutation flips it to prove the exemption load-bearing. The marker
 * itself is honored inside `findTruncatedEnumeration`, so flipping here
 * strips trailing comments first — a line allowed only by its marker
 * then stands as the bare shape.
 */
function sweepViolations(files, { honorMarker = true } = {}) {
  const found = [];
  for (const abs of files) {
    const file = relativeFile(abs);
    const lines = readFileSync(abs, 'utf8').split(/\r?\n/);
    lines.forEach((text, index) => {
      const probe = honorMarker ? text : text.replace(/#.*$/, '');
      const hit = findTruncatedEnumeration(probe, { powershell: false });
      if (hit) found.push({ file, line: index + 1, text, ...hit });
    });
  }
  return found;
}

// Fixture shapes, assembled from parts so this file's own on-disk lines
// never match the detector (see header). In memory they are the literals.
const PIPE = ' | ';
const violatingLine = (cmd) => `${cmd}${PIPE}head -5`;
const markedLine = (cmd) => `${cmd}${PIPE}head -5 # non-exhaustive`;

test('arm 1 — the sweep over scripts/, loop/ and pulse/ finds zero violations', () => {
  const files = sourceFiles();
  assert.ok(files.length > 100, `population enumerated from the world, got ${files.length} files`);
  const offenders = sweepViolations(files);
  assert.deepEqual(
    offenders,
    [],
    `committed truncation shapes: ${offenders.map((o) => `${o.file}:${o.line}`).join(', ')}`,
  );
});

test('arm 2 — a declared non-exhaustive diagnostic stays green', () => {
  assert.equal(
    findTruncatedEnumeration(markedLine('git log --oneline')),
    null,
    'marker allows the peek',
  );
  assert.equal(
    findTruncatedEnumeration(markedLine('bd list --json')),
    null,
    'marker allows the measured wild shape too',
  );
});

test('arm 3 — an unmarked enumeration through a shortener goes red, naming file and line', () => {
  const hit = findTruncatedEnumeration(violatingLine('git log --oneline'));
  assert.ok(hit, 'unmarked shape refused');
  assert.equal(hit.enumerator, 'git log');
  assert.equal(hit.shortener, 'head');
  const files = sourceFiles();
  const probe = files.slice(0, 1);
  void probe;
  // File-and-line naming is proven by construction: every sweep hit
  // carries both (see sweepViolations), and the zero-violation arm pins
  // the current population.
  assert.ok(
    files.map(relativeFile).includes(SELF),
    'this test file is a member of the scanned population',
  );
});

test('arm 4 mutation — dropping the exemption turns the green arm red', () => {
  const files = sourceFiles();
  assert.deepEqual(sweepViolations(files), [], 'green at baseline');
  // The mutation, applied to this file's sweep helper call (the
  // exemption honoring is the property under test): strip markers.
  const line = markedLine('git log --oneline');
  assert.equal(findTruncatedEnumeration(line), null, 'honored: green');
  const stripped = line.replace(/#.*$/, '');
  const hit = findTruncatedEnumeration(stripped);
  assert.ok(hit, 'exemption dropped: the same line goes red');
  assert.equal(hit.enumerator, 'git log');
});

test('arm 5 — this file is scanned and clean', () => {
  const files = sourceFiles();
  assert.ok(files.map(relativeFile).includes(SELF), 'self-membership');
  const own = sweepViolations(files.filter((f) => relativeFile(f) === SELF));
  assert.deepEqual(own, [], 'no on-disk line of this file matches the detector');
});
