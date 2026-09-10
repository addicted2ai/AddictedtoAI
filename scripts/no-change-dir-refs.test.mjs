/**
 * Repository-wide source check for references to change directories.
 *
 * Archiving moves the unarchived change directory under `archive/`, so a reference
 * to an unarchived name is a delayed failure. The small allow-list is limited
 * to code whose purpose is to discover or operate on in-flight changes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEARCH = ['lib', 'loop', 'pulse', 'scripts', 'app', 'tools'];
const CHANGE_DIR = ['openspec', 'changes', ''].join('/');
const BAD_REFERENCE = new RegExp(`${CHANGE_DIR}(?!archive/)[^\\s/'"\\x60]+/?`, 'g');

function sourceFiles() {
  return fg.sync(
    SEARCH.map((dir) => `${dir}/**/*.{mjs,ts,tsx,js}`),
    {
      cwd: ROOT,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.next/**', '**/out/**', '**/fixtures-out/**'],
    },
  ).sort();
}

/** Only these files operate on in-flight change directories. */
const ALLOWED = [
  {
    file: 'scripts/check-spec-deltas.mjs',
    match: /openspec\/changes\/\$\{e\.name\}\//,
    reason: 'builds paths for delta files while scanning every in-flight change before archive',
  },
  {
    file: 'scripts/check-spec-deltas.test.mjs',
    match: /openspec\/changes\/(?:\$\{name\}|live-one)\//,
    reason: 'creates and asserts temporary in-flight change trees to test the delta checker',
  },
  {
    file: 'scripts/brief-closure.test.mjs',
    match: /openspec\/changes\/two-desks-work-orders-and-trains\//,
    reason: 'reads banked round-1 evidence briefs as wild fixtures (B2/E catch, F pass); copies would desync from the banked record. If the change archives, these paths move and the arms fail loudly — update the paths and this entry then; the staleness arm below enforces the update',
  },
];

function relativeFile(abs) {
  return relative(ROOT, abs).replace(/\\/g, '/');
}

function violations() {
  const found = [];
  for (const abs of sourceFiles()) {
    const file = relativeFile(abs);
    const lines = readFileSync(abs, 'utf8').split(/\r?\n/);
    lines.forEach((text, index) => {
      for (const match of text.matchAll(BAD_REFERENCE)) {
        found.push({ file, line: index + 1, text, reference: match[0] });
      }
    });
  }
  return found;
}

function isAllowed(v) {
  return ALLOWED.some((entry) => entry.file === v.file && entry.match.test(v.reference));
}

test('no source references an unarchived change directory', () => {
  const offenders = violations().filter((v) => !isAllowed(v));
  assert.deepEqual(
    offenders,
    [],
    'Use openspec/specs/ for archived requirements, or add a narrowly justified operational allow-list entry.',
  );
});

test('the check matches a bad literal and ignores an archived literal', () => {
  assert.deepEqual(
    [...(CHANGE_DIR + 'foo').matchAll(BAD_REFERENCE)].map((m) => m[0]),
    [CHANGE_DIR + 'foo'],
  );
  assert.deepEqual(
    [...(CHANGE_DIR + 'foo/bar.md').matchAll(BAD_REFERENCE)].map((m) => m[0]),
    [CHANGE_DIR + 'foo/'],
  );
  assert.deepEqual([...(CHANGE_DIR + 'archive/2026-09-07-foo/bar.md').matchAll(BAD_REFERENCE)], []);
  // A bare prefix followed by a backtick designates no change, so archiving
  // never moves it and the detector deliberately ignores it.
  assert.deepEqual([...(CHANGE_DIR + '`').matchAll(BAD_REFERENCE)], []);
});

test('an allow-list entry applies only to its matched reference span', () => {
  const line = [
    'join(CHANGE_ROOT,',
    '`' + CHANGE_DIR + '${name}/specs/demo/spec.md`);',
    CHANGE_DIR + 'build-initial-site/specs/demo/spec.md',
  ].join(' ');
  assert.equal(
    isAllowed({
      file: 'scripts/check-spec-deltas.test.mjs',
      text: line,
      reference: CHANGE_DIR + '${name}/',
    }),
    true,
  );
  // MUTATION: testing the allow-list against the whole line would let the
  // named path inherit the generic template on the same line.
  assert.equal(
    isAllowed({
      file: 'scripts/check-spec-deltas.test.mjs',
      text: line,
      reference: CHANGE_DIR + 'build-initial-site/',
    }),
    false,
  );
});

test('every allow-list entry has a reason and is still live', () => {
  const found = violations();
  for (const entry of ALLOWED) {
    assert.ok(entry.reason, `${entry.file} needs a reason`);
    assert.ok(
      found.some((v) => v.file === entry.file && entry.match.test(v.reference)),
      `${entry.file}::${entry.match} is stale and must be removed`,
    );
  }
});
