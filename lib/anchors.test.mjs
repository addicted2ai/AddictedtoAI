/**
 * anchors.test.mjs — the anchor build check (change
 * `make-the-blog-worth-sending`, task 3.5).
 *
 * A guardrail is what it does when measured. Every assertion below observes
 * the check refusing a real fixture post, or clearing one, rather than
 * describing what the rule was meant to do.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { loadCorpus } from './corpus.mjs';
import { Diagnostics } from './errors.mjs';
import { fixtureRoot } from './test-helpers.mjs';
import { anchorProblems, anchorWindow, anchorCheckStep, changeLineIndex, ANCHOR_WINDOW_DAYS } from './anchors.mjs';

/** The two feed lines the `blog-anchors` fixture posts declare. */
const CHANGES = [
  { key: 'seed|llm-releases|00a6e024-dee9-47e9-9cc7-d74d1c52ffa4', date: '2026-08-26', kind: 'release' },
  { key: 'seed|llm-releases|02571b6b-b8d6-433c-8141-73d5e81c5ccf', date: '2026-08-22', kind: 'release' },
];

function posts(fixture) {
  return loadCorpus({
    contentRoot: fixtureRoot(fixture),
    diags: new Diagnostics(),
    checkReferences: false,
  }).then((c) => c.post);
}

const post = (data, file = 'content/blog/x.md') => ({ file, data: { covers: [], ...data } });

test('3.5 the window is seven days inclusive, ending on the post\'s own date', () => {
  assert.equal(ANCHOR_WINDOW_DAYS, 7);
  assert.deepEqual(anchorWindow('2026-09-20'), { from: '2026-09-14', to: '2026-09-20' });
  // across a month boundary, and across a leap day
  assert.deepEqual(anchorWindow('2026-03-03'), { from: '2026-02-25', to: '2026-03-03' });
  assert.deepEqual(anchorWindow('2024-03-02'), { from: '2024-02-25', to: '2024-03-02' });
});

test('3.5 the four compliant fixture posts pass', async () => {
  const found = anchorProblems(await posts('blog-anchors'), CHANGES);
  assert.deepEqual(found, [], `expected a clean corpus, got ${JSON.stringify(found, null, 2)}`);
});

test('3.5 an unresolved covers: reference fails, naming the post file and the reference', async () => {
  const all = await posts('blog-anchors');
  const found = anchorProblems(all, []); // nothing in the feed at all
  const hit = found.find((p) => p.rule === 'anchor-unresolved');
  assert.ok(hit, 'the check must refuse a reference with no line behind it');
  assert.match(hit.file, /blog[/\\](covered|both)-note\.md/, 'names the post file');
  assert.match(hit.message, /seed\|llm-releases\|00a6e024-dee9-47e9-9cc7-d74d1c52ffa4/, 'names the reference');
  assert.match(hit.message, /data\/changes\.jsonl/);
  // covered-note declares two references and both are unresolved: the check
  // reports every one, never only the first.
  const covered = found.filter((p) => /covered-note/.test(p.file) && p.rule === 'anchor-unresolved');
  assert.equal(covered.length, 2);
});

test('3.5 a right key with a wrong date resolves to nothing, and the message names both dates', () => {
  const found = anchorProblems(
    [post({ date: '2026-08-28', covers: [{ key: 'seed|llm-releases|00a6e024-dee9-47e9-9cc7-d74d1c52ffa4', date: '2026-08-27' }] })],
    CHANGES,
  );
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, 'anchor-unresolved');
  assert.match(found[0].message, /declared with date 2026-08-27/);
  assert.match(found[0].message, /is dated 2026-08-26/);
});

test('3.5 an annotation line is not an anchor — only what the Pulse observed resolves', () => {
  const annotated = [
    { key: 'ann-1', kind: 'annotation', annotates: 'k1', date: '2026-08-26', text: 'a model wrote this' },
  ];
  assert.equal(changeLineIndex(annotated).size, 0);
  const found = anchorProblems(
    [post({ date: '2026-08-28', covers: [{ key: 'ann-1', date: '2026-08-26' }] })],
    annotated,
  );
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, 'anchor-unresolved');
});

test('3.5 an anchor older than the window fails, naming the post, the anchor and the window', () => {
  // The spec's own scenario: a post dated 2026-09-20 declaring 2026-09-01 and
  // 2026-09-18 — the fresh one beside the stale one launders nothing.
  const found = anchorProblems(
    [
      post(
        {
          date: '2026-09-20',
          anchor: { url: 'https://example.org/stale', date: '2026-09-01' },
          covers: [{ key: 'k-fresh', date: '2026-09-18' }],
        },
        'content/blog/laundered.md',
      ),
    ],
    [{ key: 'k-fresh', date: '2026-09-18' }],
  );
  const hit = found.find((p) => p.rule === 'anchor-window');
  assert.ok(hit);
  assert.equal(hit.file, 'content/blog/laundered.md');
  assert.match(hit.message, /2026-09-01/, 'names the offending anchor date');
  assert.match(hit.message, /https:\/\/example\.org\/stale/, 'and which anchor it is');
  assert.match(hit.message, /2026-09-14 to 2026-09-20/, 'names the window, both bounds');
  assert.match(hit.message, /launders nothing/);
  assert.equal(found.filter((p) => p.rule === 'anchor-window').length, 1, 'the in-window anchor is fine');
});

test('3.5 an anchor AFTER the post\'s date fails too — the window is two-sided', () => {
  const found = anchorProblems(
    [post({ date: '2026-09-20', anchor: { url: 'https://example.org/tomorrow', date: '2026-09-21' } })],
    [],
  );
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, 'anchor-window');
  assert.match(found[0].message, /cannot postdate/);
});

test('3.5 the window boundaries are inclusive on both ends and exclusive one day out', () => {
  const at = (d) =>
    anchorProblems([post({ date: '2026-09-20', anchor: { url: 'https://example.org/x', date: d } })], []);
  assert.deepEqual(at('2026-09-20'), [], 'the post\'s own date is inside');
  assert.deepEqual(at('2026-09-14'), [], 'six days before is inside');
  assert.equal(at('2026-09-13').length, 1, 'seven days before is outside');
  assert.equal(at('2026-09-21').length, 1, 'one day after is outside');
});

test('3.5 every declared anchor is checked, not just the first', () => {
  const found = anchorProblems(
    [
      post({
        date: '2026-09-20',
        covers: [
          { key: 'a', date: '2026-09-19' },
          { key: 'b', date: '2026-08-01' },
          { key: 'c', date: '2026-07-01' },
        ],
      }),
    ],
    [
      { key: 'a', date: '2026-09-19' },
      { key: 'b', date: '2026-08-01' },
      { key: 'c', date: '2026-07-01' },
    ],
  );
  assert.equal(found.length, 2);
  assert.deepEqual(found.map((p) => p.field).sort(), ['covers[1].date', 'covers[2].date']);
});

test('3.5 the post-deletion corpus — zero posts — is trivially clean, and says so', async () => {
  const res = await anchorCheckStep({ out: { write: () => {} } });
  assert.equal(res.posts, 0, 'content/blog/ holds no posts today, by decision (task 1.1)');
  assert.equal(res.declared, 0);
  assert.equal(res.refs, 0);
  // The count is printed rather than inferred: a check that ran on nothing
  // prints the same clean result as a check that ran on everything, and that
  // indistinguishability is the defect the line exists to close.
  assert.match(res.line, /prebuild: anchors — 0 post\(s\)/);
  assert.match(res.line, /change line\(s\)/);
});

test('3.5 the step throws on a bad corpus, naming every offender at once', async () => {
  await assert.rejects(
    () => anchorCheckStep({ contentRoot: fixtureRoot('blog-anchors'), changes: [], out: { write: () => {} } }),
    (err) => {
      assert.match(err.message, /anchor error\(s\)/);
      assert.match(err.message, /covered-note\.md/);
      assert.match(err.message, /both-note\.md/);
      return true;
    },
  );
});

test('3.5 the step clears the same corpus once the feed carries the lines', async () => {
  const res = await anchorCheckStep({
    contentRoot: fixtureRoot('blog-anchors'),
    changes: CHANGES,
    out: { write: () => {} },
  });
  assert.equal(res.posts, 4);
  assert.equal(res.declared, 3, 'the synthesis declares nothing');
  assert.equal(res.refs, 5, 'three covers references and two external anchors');
});
