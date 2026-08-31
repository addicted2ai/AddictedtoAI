/**
 * blog.test.mjs — the anchor keys and the anchor block
 * (change `make-the-blog-worth-sending`, tasks 3.4 and 3.6).
 *
 * The schema half is asserted through `validateFrontMatter` — the same
 * function `lib/corpus.mjs` calls on every file — and the render half through
 * a real fixture corpus built by `buildSite`, so what these assertions see is
 * what the content gates saw. The clock is pinned at `TODAY` (2026-08-28) and
 * every fixture post is dated against it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture } from '../test-helpers.mjs';
import { validateFrontMatter, PROSE_FIELDS, NON_PROSE_FIELDS, SCHEMAS, stringFieldPaths, classificationProblems } from '../schema.mjs';
import { renderPostPage, renderAnchor, postAnchors } from './blog.mjs';

// ── 3.4 the anchor front-matter keys ─────────────────────────────────────

test('3.4 a post declaring covers: and anchor: validates', () => {
  const res = validateFrontMatter('post', {
    title: 'A note',
    date: '2026-08-28',
    covers: [{ key: 'seed|llm-releases|abc-123', date: '2026-08-26' }],
    anchor: { url: 'https://example.org/announcement', date: '2026-08-27' },
  });
  assert.equal(res.ok, true, res.ok ? '' : JSON.stringify(res.issues));
  assert.deepEqual(res.value.covers, [{ key: 'seed|llm-releases|abc-123', date: '2026-08-26' }]);
  assert.deepEqual(res.value.anchor, { url: 'https://example.org/announcement', date: '2026-08-27' });
});

test('3.4 a post declaring neither key still validates — a synthesis is a legal form', () => {
  const res = validateFrontMatter('post', { title: 'A synthesis', date: '2026-08-28' });
  assert.equal(res.ok, true);
  assert.deepEqual(res.value.covers, [], 'covers defaults to the empty list, never undefined');
  assert.equal(res.value.anchor, undefined);
});

/**
 * Every malformed shape, each asserted to name its own field. The failure a
 * reader gets at 2am is the product here, not the boolean.
 */
for (const [label, data, field, message] of [
  [
    'a covers entry with no date',
    { title: 't', date: '2026-08-28', covers: [{ key: 'k' }] },
    'covers[0].date',
    /required field is missing/,
  ],
  [
    'a covers date that is not an ISO date',
    { title: 't', date: '2026-08-28', covers: [{ key: 'k', date: '28-08-2026' }] },
    'covers[0].date',
    /must be an ISO date, YYYY-MM-DD \(got "28-08-2026"\)/,
  ],
  [
    'a covers date that is not a real day',
    { title: 't', date: '2026-08-28', covers: [{ key: 'k', date: '2026-02-31' }] },
    'covers[0].date',
    /is not a real calendar date/,
  ],
  [
    'an empty covers key',
    { title: 't', date: '2026-08-28', covers: [{ key: '', date: '2026-08-28' }] },
    'covers[0].key',
    /must be the `key` of a line in data\/changes\.jsonl/,
  ],
  [
    'an unknown key inside a covers entry',
    { title: 't', date: '2026-08-28', covers: [{ key: 'k', date: '2026-08-28', url: 'x' }] },
    'covers[0]',
    /unknown front-matter key\(s\): url/,
  ],
  [
    'covers given as a bare string',
    { title: 't', date: '2026-08-28', covers: 'seed|x|y' },
    'covers',
    /expected array/,
  ],
  [
    'an anchor url that is not http(s)',
    { title: 't', date: '2026-08-28', anchor: { url: 'ftp://example.org/x', date: '2026-08-28' } },
    'anchor.url',
    /must be an http\(s\) URL/,
  ],
  [
    'an anchor with no url',
    { title: 't', date: '2026-08-28', anchor: { date: '2026-08-28' } },
    'anchor.url',
    /required field is missing/,
  ],
  [
    'an anchor with no date',
    { title: 't', date: '2026-08-28', anchor: { url: 'https://example.org/x' } },
    'anchor.date',
    /required field is missing/,
  ],
  [
    'a misspelled anchor key',
    { title: 't', date: '2026-08-28', anchour: { url: 'https://example.org/x', date: '2026-08-28' } },
    '<root>',
    /unknown front-matter key\(s\): anchour/,
  ],
]) {
  test(`3.4 ${label} fails, naming the field`, () => {
    const res = validateFrontMatter('post', data);
    assert.equal(res.ok, false, 'the malformed value must not validate');
    const hit = res.issues.find((i) => i.field === field);
    assert.ok(hit, `an issue on ${field}; got ${JSON.stringify(res.issues)}`);
    assert.match(hit.message, message);
  });
}

test('3.4 both new keys are classified, so the build gate stays satisfied', () => {
  // `assertFieldsClassified` fails the build on a string-valued schema field in
  // neither list. This asserts the four new paths exist AND are classified,
  // rather than trusting that the gate elsewhere would have caught it.
  const paths = stringFieldPaths(SCHEMAS.post);
  for (const p of ['covers[].key', 'covers[].date', 'anchor.url', 'anchor.date']) {
    assert.ok(paths.includes(p), `${p} is a string-valued field of postSchema`);
    assert.ok(p in NON_PROSE_FIELDS.post, `${p} is classified non-prose with a stated reason`);
    assert.ok(!PROSE_FIELDS.post.includes(p), `${p} is not also classified as author prose`);
  }
  assert.deepEqual(classificationProblems(), []);
});

// ── 3.6 the anchor renders ───────────────────────────────────────────────

/** One build of the anchor fixture corpus, shared by everything below. */
let SITE;
async function site() {
  if (!SITE) SITE = await buildFixture('blog-anchors');
  return SITE;
}
const post = (s, slug) => s.corpus.post.find((d) => d.slug === slug);

/** The change lines a caller may pass so a covered line can be named. */
const CHANGES = [
  {
    key: 'seed|llm-releases|00a6e024-dee9-47e9-9cc7-d74d1c52ffa4',
    date: '2026-08-26',
    display_name: 'GPT-5.6 Terra reaches general availability',
    source_url: 'https://openai.example/index/gpt-5-6/',
  },
];

test('3.6 a note with covers: renders a dated, linked evidence line per reference', async () => {
  const html = renderPostPage(post(await site(), 'covered-note'));

  assert.match(html, /data-anchor-count="2"/, 'both references render, not just the first');
  assert.match(html, /id="primary-evidence"/);
  assert.match(html, /data-anchor-kind="covers"/);
  assert.match(
    html,
    /data-covers-key="seed\|llm-releases\|00a6e024-dee9-47e9-9cc7-d74d1c52ffa4"/,
    'the resolved key is in the page, not only in front matter',
  );
  assert.match(html, /<time datetime="2026-08-26" class="rail-date">/, 'dated');
  assert.match(html, /<time datetime="2026-08-22" class="rail-date">/);
  assert.match(html, /href="\/catalog\/changed"/, 'linked to the site’s own record');

  const bodyAt = html.indexOf('<div class="prose">');
  const evidenceAt = html.indexOf('class="section post-anchor"');
  assert.ok(bodyAt > 0 && evidenceAt > bodyAt, 'the evidence block follows the body');
});

test('3.6 a note with anchor: renders the primary source, dated and linked', async () => {
  const html = renderPostPage(post(await site(), 'external-note'));

  assert.match(html, /data-anchor-count="1"/);
  assert.match(html, /data-anchor-kind="external"/);
  assert.match(html, /<time datetime="2026-08-25" class="rail-date">/);
  assert.match(
    html,
    /href="https:\/\/example\.org\/newsroom\/the-announcement\/" rel="nofollow noopener"/,
    'an external anchor is an external link, nofollowed like every other citation',
  );
  assert.match(html, /example\.org\/newsroom\/the-announcement/, 'and readable as text');
});

test('3.6 a post declaring both renders both, feed reference first', async () => {
  const html = renderPostPage(post(await site(), 'both-note'));
  assert.match(html, /data-anchor-count="2"/);
  const coversAt = html.indexOf('data-anchor-kind="covers"');
  const externalAt = html.indexOf('data-anchor-kind="external"');
  assert.ok(coversAt > 0 && externalAt > coversAt, 'the unforgeable evidence leads');
});

test('3.6 a synthesis renders no evidence block at all — not an empty one', async () => {
  const html = renderPostPage(post(await site(), 'a-synthesis'));
  assert.ok(!html.includes('post-anchor'), 'no section');
  assert.ok(!html.includes('Primary evidence'), 'and no orphaned heading');
  assert.ok(!html.includes('data-anchor-count'), 'and nothing that says "zero anchors"');
  assert.equal(renderAnchor(post(await site(), 'a-synthesis')), '');
});

test('3.6 a supplied change line names the covered event and cites its source', async () => {
  const doc = post(await site(), 'covered-note');
  const html = renderAnchor(doc, { changes: CHANGES });
  assert.match(html, /GPT-5\.6 Terra reaches general availability/, 'the line names itself');
  assert.match(html, /openai\.example\/index\/gpt-5-6/, 'and cites the source it was read from');

  // Without the lines, the block still stands: the declared date and the key
  // the build resolved are the part the guarantee rests on.
  const bare = renderAnchor(doc);
  assert.ok(!bare.includes('GPT-5.6 Terra'));
  assert.match(bare, /Recorded in this site’s change feed/);
  assert.match(bare, /data-anchor-count="2"/);
});

test('3.6 postAnchors reports the declared anchors in render order', async () => {
  const s = await site();
  assert.deepEqual(
    postAnchors(post(s, 'both-note')).map((a) => [a.kind, a.date]),
    [
      ['covers', '2026-08-26'],
      ['external', '2026-08-27'],
    ],
  );
  assert.deepEqual(postAnchors(post(s, 'a-synthesis')), []);
});
