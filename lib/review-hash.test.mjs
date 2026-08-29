/**
 * review-hash.test.mjs — the reviewed surface (specs/review, task 1.1,
 * beads addictedtoai-zlq).
 *
 * Every case here is a measurement of what the hash IGNORES or NOTICES, which
 * is the whole content of the design decision (D1): exclude too much and an
 * edited source_url reads as unchanged; exclude too little and the Pulse's own
 * timeline append marks every approved entry mismatched.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MECHANICAL_FRONT_MATTER_KEYS,
  reviewedHash,
  reviewedHashOfFile,
  reviewedSurface,
} from './review-hash.mjs';

const entry = ({ timeline = '[]', value = '"unstated"', url = 'https://example.org/a', body = 'The body.\n' } = {}) =>
  `---
id: concept/x
kind: concept
display_name: "X"
status: active
maintenance: stable
aliases:
  - name: "X"
    class: manual
facts:
  - field: license
    source: cited
    value: ${value}
    source_url: "${url}"
    accessed: "2026-08-27"
    volatility: static
timeline: ${timeline}
mentions: []
---

${body}`;

test('zlq (a) two documents differing only in `timeline` hash the same', () => {
  const before = entry({ timeline: '[]' });
  const after = entry({
    timeline: `
  - date: "2026-08-29"
    event: "status changed to deprecated"
    source_url: "https://example.org/status"`,
  });
  assert.notEqual(before, after, 'the fixture must actually differ, or this proves nothing');
  assert.equal(reviewedHash(before), reviewedHash(after));
});

test('zlq (a) `timeline` is the whole of the mechanical list, declared once', () => {
  assert.deepEqual([...MECHANICAL_FRONT_MATTER_KEYS], ['timeline']);
  assert.ok(Object.isFrozen(MECHANICAL_FRONT_MATTER_KEYS));
});

test('zlq (b) the body, a fact value and a source_url each change the hash', () => {
  const base = reviewedHash(entry());
  assert.notEqual(reviewedHash(entry({ body: 'The body, edited.\n' })), base, 'body');
  assert.notEqual(reviewedHash(entry({ value: '"MIT"' })), base, 'facts[].value');
  assert.notEqual(reviewedHash(entry({ url: 'https://example.org/b' })), base, 'facts[].source_url');
});

test('zlq (b) a whitespace-only body edit changes the hash', () => {
  // Deliberate: specs/review lets a mismatch REPORT and forbids it changing
  // indexability, precisely so a whitespace edit is visible without being
  // punished. Normalising whitespace away here would make the report unable to
  // see the case the spec argues about.
  assert.notEqual(reviewedHash(entry({ body: 'The  body.\n' })), reviewedHash(entry()));
});

test('zlq (c) reordering front-matter keys does not change the hash', () => {
  const a = '---\nid: concept/x\nkind: concept\ndisplay_name: "X"\n---\n\nBody.\n';
  const b = '---\ndisplay_name: "X"\nkind: concept\nid: concept/x\n---\n\nBody.\n';
  assert.notEqual(a, b);
  assert.equal(reviewedHash(a), reviewedHash(b));
});

test('zlq CRLF and LF checkouts of one file hash identically', () => {
  // A hash that differed per clone would be the defect design D4 refuses when
  // it forbids reading the filesystem's mtime.
  const lf = entry();
  assert.equal(reviewedHash(lf.replace(/\n/g, '\r\n')), reviewedHash(lf));
});

test('zlq the surface carries the body verbatim and no mechanical key', () => {
  const s = reviewedSurface(entry({ timeline: '[]', body: 'Verbatim body line.\n' }));
  assert.ok(s.endsWith('Verbatim body line.\n'), 'the body is appended as written');
  assert.ok(!s.includes('timeline'), 'no mechanically-maintained key reaches the surface');
  assert.ok(s.includes('"source_url":"https://example.org/a"'), 'front matter does');
});

test('zlq an unreadable path is null, never a hash of nothing', () => {
  // A hash of "" would silently equal every other unreadable file's, which is
  // an agreement the caller must never be handed.
  assert.equal(reviewedHashOfFile('D:/AddictedtoAI/no/such/file.md'), null);
});
