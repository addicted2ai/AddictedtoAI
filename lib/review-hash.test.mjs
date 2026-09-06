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

test('zlq (a) the mechanical list is exactly `timeline` and `domains_seeded`, declared once', () => {
  // UPDATED by `tag-the-corpus-by-domain` task 5, which adds `domains_seeded`:
  // the Pulse's domain seeding writes it from named feed fields, append-only,
  // with no judgment in it, so a re-seed must not mark an approved entry
  // mismatched. The assertion is EXACT rather than a membership check because
  // the damage this list can do is done by what is silently ADDED to it: the
  // filter matches by key NAME across every content kind (see the
  // `domains`/`domains_excluded` block below), so the literal key `domains`
  // arriving here would un-review a post's editorial domains with no error
  // anywhere.
  assert.deepEqual([...MECHANICAL_FRONT_MATTER_KEYS], ['timeline', 'domains_seeded']);
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

// ---------------------------------------------------------------------------
// The domain facet's three keys (change `tag-the-corpus-by-domain`, tasks 6-7).
//
// The PAIR is the whole point. A test that only checks the exemption passes if
// EVERYTHING is exempt, which is the vacuous-gate shape this repository keeps
// catching — so every case below is stated twice, once for the machine key that
// must be invisible to the hash and once for an editorial key that must not be.
// ---------------------------------------------------------------------------

/** An entry carrying whatever domain keys a case needs, and nothing else new. */
const domainEntry = (extra = '') =>
  `---
id: concept/x
kind: concept
display_name: "X"
status: active
maintenance: stable
aliases:
  - name: "X"
    class: manual
facts: []
timeline: []
mentions: []
${extra}---

The body.
`;

test('tag-the-corpus-by-domain (6) `domains` and `domains_excluded` are NOT on the mechanical list', () => {
  // The one crossing that would silently delete a review requirement: the list
  // is matched by key name across every content kind with no per-kind scoping,
  // so the literal key `domains` here would exempt a POST's editorial domains
  // from review as well, with no change to specs/blog and no error anywhere.
  assert.ok(!MECHANICAL_FRONT_MATTER_KEYS.includes('domains'), '`domains` is editorial');
  assert.ok(!MECHANICAL_FRONT_MATTER_KEYS.includes('domains_excluded'), '`domains_excluded` is editorial');
});

test('tag-the-corpus-by-domain (7) an entry gaining `domains_seeded` hashes the same', () => {
  const before = domainEntry();
  const after = domainEntry('domains_seeded:\n  - image\n  - video\n');
  assert.notEqual(before, after, 'the fixture must actually differ, or this proves nothing');
  assert.equal(reviewedHash(before), reviewedHash(after));
  assert.ok(!reviewedSurface(after).includes('domains_seeded'), 'the machine key never reaches the surface');
});

test('tag-the-corpus-by-domain (7) an entry gaining `domains` changes its hash', () => {
  // Tagging an entry with what it is FOR is a judgment, and a judgment that
  // publishes unreviewed is what specs/review exists to stop. So this record
  // reports `mismatched` and is cleared by a fresh verdict, not an exemption.
  const base = reviewedHash(domainEntry());
  assert.notEqual(reviewedHash(domainEntry('domains:\n  - research\n')), base);
});

test('tag-the-corpus-by-domain (7) an entry gaining `domains_excluded` changes its hash', () => {
  const base = reviewedHash(domainEntry('domains_seeded:\n  - image\n'));
  assert.notEqual(reviewedHash(domainEntry('domains_seeded:\n  - image\ndomains_excluded:\n  - image\n')), base);
});

test('zlq an unreadable path is null, never a hash of nothing', () => {
  // A hash of "" would silently equal every other unreadable file's, which is
  // an agreement the caller must never be handed.
  assert.equal(reviewedHashOfFile('D:/AddictedtoAI/no/such/file.md'), null);
});
