/**
 * check-post-voice.test.mjs — the voice lint (change
 * `make-the-blog-worth-sending`, task 3.7).
 *
 * Three groups of assertion, and the middle one is the point of the check:
 *
 *  1. **Unit cases per marker** — one fixture post trips every marker on the
 *     closed list, one trips none, one reproduces the `&sect;` entity artifact,
 *     and one puts every mark inside the three uncounted regions.
 *  2. **Warn, never fail** — the post that trips all seven markers still
 *     leaves the step returning success. Measured, not asserted from intent:
 *     the step is called and its return value and the absence of a throw are
 *     both checked.
 *  3. **The pinned-corpora calibration tests** — the twelve predecessor posts'
 *     extracted prose, pinned under `lib/fixtures/blog-voice-negative/`, must
 *     reproduce `openspec/style/blog-voice-calibration.md`'s per-document table
 *     and its per-marker and union firing counts EXACTLY. A lint edit that
 *     silently moves any of them fails here.
 *
 * On the human half, read `lib/fixtures/README.md` before assuming this file
 * is weaker than it should be: the nine-piece sample was never committed, the
 * calibration record states its derivation did not keep the URLs, and the
 * record's own account of the single union fire is a chrome artifact of one
 * fetch that re-fetching would not reproduce. What is pinned is the record's
 * transcribed statistics, and what they support is a threshold regression —
 * labeled as that, not dressed up as an instrument test.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { loadCorpus } from '../lib/corpus.mjs';
import { Diagnostics } from '../lib/errors.mjs';
import { fixtureRoot } from '../lib/test-helpers.mjs';
import {
  MARKERS,
  CALIBRATED_MARKERS,
  decodeEntities,
  maskUncounted,
  measurePost,
  proseFor,
  warningLine,
  checkPostVoiceStep,
} from './check-post-voice.mjs';

function loadPosts(fixture) {
  return loadCorpus({
    contentRoot: fixtureRoot(fixture),
    diags: new Diagnostics(),
    checkReferences: false,
  }).then((c) => c.post);
}

const bySlug = async (fixture) =>
  Object.fromEntries((await loadPosts(fixture)).map((d) => [d.slug, d]));

const firedIds = (body) =>
  measurePost(body)
    .results.filter((r) => r.fired)
    .map((r) => r.id)
    .sort();

/** A sink that records what the step printed. */
function sink() {
  const lines = [];
  return { lines, write: (s) => lines.push(s) };
}

// ── 1. unit cases per marker ─────────────────────────────────────────────

test('3.7 the closed marker list is the seven documented in blog-voice.md §3', () => {
  assert.deepEqual(
    MARKERS.map((m) => m.id),
    [
      'semicolons',
      'em-dashes',
      'self-narration',
      'what-why-how-headers',
      'register-guards',
      'focal-family',
      'bold-lead-lists',
    ],
  );
  // The thresholds, from the voice document, asserted literally so an edit to
  // one is an edit to this test as well.
  const t = Object.fromEntries(MARKERS.map((m) => [m.id, [m.compare, m.threshold]]));
  assert.deepEqual(t.semicolons, ['>', 2.5]);
  assert.deepEqual(t['em-dashes'], ['>', 10]);
  assert.deepEqual(t['self-narration'], ['>=', 1]);
  assert.deepEqual(t['what-why-how-headers'], ['>=', 2]);
  assert.deepEqual(t['register-guards'], ['>=', 1]);
  assert.deepEqual(t['focal-family'], ['>', 3]);
  assert.deepEqual(t['bold-lead-lists'], ['>=', 1]);
});

test('3.7 a post written to trip every marker trips all seven', async () => {
  const posts = await bySlug('blog-voice-cases');
  assert.deepEqual(firedIds(posts['trips-every-marker'].body), [
    'bold-lead-lists',
    'em-dashes',
    'focal-family',
    'register-guards',
    'self-narration',
    'semicolons',
    'what-why-how-headers',
  ]);
});

test('3.7 a post written to trip nothing trips nothing', async () => {
  const posts = await bySlug('blog-voice-cases');
  const m = measurePost(posts['passes-every-marker'].body);
  assert.deepEqual(
    m.results.filter((r) => r.fired),
    [],
    'a clean post must produce no warning at all',
  );
  // Density, not presence: the passing post carries em-dashes and still clears
  // the line. A marker that fired on presence would be a different check.
  const em = m.results.find((r) => r.id === 'em-dashes');
  assert.ok(em.count > 0, 'it does contain em-dashes');
  assert.ok(em.value < 10, `${em.value.toFixed(2)}/1k is under the line`);
});

test('3.7 ENTITIES ARE DECODED BEFORE COUNTING — the &sect; artifact does not fire', async () => {
  const posts = await bySlug('blog-voice-cases');
  const body = posts['statute-citations'].body;

  // Decoded — what the lint does — the post carries no semicolon at all.
  const semi = measurePost(body).results.find((r) => r.id === 'semicolons');
  assert.equal(semi.count, 0);
  assert.equal(semi.fired, false);

  // Undecoded, the same text reads as a heavy semicolon habit. This is the
  // measurement, not the claim: both previously published semicolon maxima in
  // the calibration record were this artifact.
  const masked = maskUncounted(body);
  const undecoded = (masked.match(/;/g) ?? []).length;
  const words = proseFor(body).words;
  assert.ok(undecoded >= 12, `${undecoded} raw semicolons from the citations`);
  assert.ok(
    (undecoded / words) * 1000 > 2.5,
    'and undecoded they would clear the 2.5/1k line several times over',
  );
  assert.equal(decodeEntities('&sect;22757.11'), '§22757.11');
});

test('3.7 code fences, blockquotes and dated correction blocks are outside the count', async () => {
  const posts = await bySlug('blog-voice-cases');
  assert.deepEqual(firedIds(posts['uncounted-regions'].body), []);
  // And the words in those regions leave the denominator too — a semicolon
  // inside a fence is not the author's, and neither are the words around it.
  const m = measurePost(posts['uncounted-regions'].body);
  assert.ok(m.words < 100, `${m.words} words counted, the masked regions excluded`);
});

test('3.7 a multi-word marker matches across a line break', () => {
  // Measured, not hypothetical: matching with a literal space missed six
  // occurrences across the twelve pinned documents and put four of their
  // per-document self-narration counts below the calibration record's.
  const oneLine = measurePost('Every number in this post is checked.');
  const wrapped = measurePost('Every number in this\npost is checked.');
  assert.equal(oneLine.results.find((r) => r.id === 'self-narration').count, 1);
  assert.equal(wrapped.results.find((r) => r.id === 'self-narration').count, 1);
});

test('3.7 a bold-lead list needs three items and every one bold', () => {
  const fires = (body) => firedIds(body).includes('bold-lead-lists');
  assert.equal(fires('- **One** a\n- **Two** b\n- **Three** c\n'), true);
  assert.equal(fires('- **One** a\n- **Two** b\n'), false, 'two items is not a list of three');
  assert.equal(fires('- **One** a\n- Two b\n- **Three** c\n'), false, 'one plain item clears it');
  assert.equal(fires('- one\n- two\n- three\n'), false, 'an ordinary list is not a marker');
});

test('3.7 a warning names the post, the marker, the measured value and the threshold', () => {
  const m = measurePost('This post is short; it is dense; it is glued together.');
  const semi = m.results.find((r) => r.id === 'semicolons');
  const line = warningLine('content/blog/x.md', m.words, semi);
  assert.match(line, /content\/blog\/x\.md/, 'the post');
  assert.match(line, /semicolons/, 'the marker');
  assert.match(line, new RegExp(semi.value.toFixed(2).replace('.', '\\.')), 'the measured value');
  assert.match(line, /threshold above 2\.5/, 'the threshold');
  assert.match(line, /\[blog-voice\]/);
});

// ── 2. warn, never fail ──────────────────────────────────────────────────

test('3.7 a post tripping EVERY marker still leaves the step successful', async () => {
  const posts = await loadPosts('blog-voice-cases');
  const out = sink();
  const res = await checkPostVoiceStep({ posts, out });

  assert.equal(res.ok, true, 'the step reports success');
  assert.equal(res.ran, true);
  assert.equal(res.tripped, 1, 'exactly one of the four case posts trips anything');
  assert.equal(res.warnings.length, 7, 'and it warns once per tripped marker');
  for (const w of res.warnings) assert.match(w, /^warning: /);
  assert.match(out.lines.join(''), /ADVISORY/);
});

test('3.7 the step never throws, whatever it is handed', async () => {
  const out = sink();
  // Nothing at all, a post with no body, and a post that is nothing but marks.
  await assert.doesNotReject(() => checkPostVoiceStep({ posts: [], out }));
  await assert.doesNotReject(() =>
    checkPostVoiceStep({ posts: [{ file: 'a.md' }, { file: 'b.md', body: ';;;;;———' }], out }),
  );
  // And a content root that does not exist reports it without failing.
  const res = await checkPostVoiceStep({ contentRoot: fixtureRoot('no-such-corpus'), out });
  assert.equal(res.ok, true);
});

test('3.7 the prebuild registers it as a step, and nothing in it exits or throws on a marker', async () => {
  const prebuild = await readFile(join(fixtureRoot('..', '..'), 'scripts', 'prebuild.mjs'), 'utf8');
  assert.match(prebuild, /checkPostVoiceStep/, 'wired into the STEPS array');
  assert.match(prebuild, /name: 'post-voice'/);
  const lint = await readFile(join(fixtureRoot('..', '..'), 'scripts', 'check-post-voice.mjs'), 'utf8');
  assert.ok(!/process\.exit/.test(lint), 'the lint never exits the process');
  assert.ok(
    !/\bthrow\b/.test(lint.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')),
    'and never throws outside its comments',
  );
});

// ── 3. the pinned-corpora calibration tests ──────────────────────────────

/**
 * The calibration record's per-document table, transcribed. The lint must
 * reproduce every column on the pinned extraction.
 */
const NEGATIVE_CORPUS = {
  'ai-security-week': { words: 2299, semicolons: 7, 'em-dashes': 39, 'self-narration': 1, 'what-why-how-headers': 1 },
  'california-detection-mandate': { words: 2137, semicolons: 7, 'em-dashes': 36, 'self-narration': 26, 'what-why-how-headers': 3 },
  'chatgpt-ads': { words: 1084, semicolons: 2, 'em-dashes': 23, 'self-narration': 6, 'what-why-how-headers': 1 },
  'claude-code-auto-mode': { words: 1625, semicolons: 7, 'em-dashes': 22, 'self-narration': 0, 'what-why-how-headers': 2 },
  'copilot-consolidation': { words: 2423, semicolons: 8, 'em-dashes': 19, 'self-narration': 8, 'what-why-how-headers': 3 },
  'cyber-eval-cascade': { words: 2218, semicolons: 7, 'em-dashes': 11, 'self-narration': 4, 'what-why-how-headers': 1 },
  'fable-5-export-controls': { words: 1714, semicolons: 8, 'em-dashes': 32, 'self-narration': 1, 'what-why-how-headers': 1 },
  'frontier-cyber': { words: 895, semicolons: 2, 'em-dashes': 8, 'self-narration': 0, 'what-why-how-headers': 3 },
  'gemini-3-7-flash': { words: 790, semicolons: 2, 'em-dashes': 13, 'self-narration': 3, 'what-why-how-headers': 1 },
  'gpt-5-6-price-drop': { words: 1505, semicolons: 9, 'em-dashes': 16, 'self-narration': 8, 'what-why-how-headers': 4 },
  'manus-meta-split': { words: 919, semicolons: 4, 'em-dashes': 11, 'self-narration': 8, 'what-why-how-headers': 1 },
  'ultrafast-mode': { words: 991, semicolons: 3, 'em-dashes': 18, 'self-narration': 3, 'what-why-how-headers': 1 },
};

/** Its firing table, transcribed. */
const NEGATIVE_FIRING = {
  semicolons: 10,
  'em-dashes': 9,
  'self-narration': 10,
  'what-why-how-headers': 5,
  'register-guards': 0,
  'focal-family': 0,
  union: 12,
};

test('3.7 the pinned negative corpus is the twelve predecessor posts', async () => {
  const posts = await loadPosts('blog-voice-negative');
  assert.equal(posts.length, 12);
  assert.deepEqual(posts.map((d) => d.slug).sort(), Object.keys(NEGATIVE_CORPUS).sort());
});

test('3.7 the lint reproduces the calibration record\'s per-document table exactly', async () => {
  const posts = await bySlug('blog-voice-negative');
  let totalWords = 0;
  for (const [slug, expected] of Object.entries(NEGATIVE_CORPUS)) {
    const m = measurePost(posts[slug].body);
    const by = Object.fromEntries(m.results.map((r) => [r.id, r]));
    assert.equal(m.words, expected.words, `${slug}: words`);
    assert.equal(by.semicolons.count, expected.semicolons, `${slug}: semicolons`);
    assert.equal(by['em-dashes'].count, expected['em-dashes'], `${slug}: em-dashes`);
    assert.equal(by['self-narration'].count, expected['self-narration'], `${slug}: self-narration`);
    assert.equal(
      by['what-why-how-headers'].count,
      expected['what-why-how-headers'],
      `${slug}: What/Why/How headers`,
    );
    totalWords += m.words;
  }
  assert.equal(totalWords, 18600, 'the record\'s corpus total');
});

test('3.7 the negative corpus warns at exactly the record\'s counts — 12 of 12 at the union', async () => {
  const posts = await loadPosts('blog-voice-negative');
  const fires = Object.fromEntries(CALIBRATED_MARKERS.map((id) => [id, 0]));
  let union = 0;
  for (const doc of posts) {
    const hits = measurePost(doc.body).results.filter((r) => r.fired);
    if (hits.length > 0) union += 1;
    for (const h of hits) if (h.id in fires) fires[h.id] += 1;
  }
  for (const id of CALIBRATED_MARKERS) {
    assert.equal(fires[id], NEGATIVE_FIRING[id], `${id} fires on ${NEGATIVE_FIRING[id]} of 12`);
  }
  assert.equal(union, NEGATIVE_FIRING.union, 'the union is 12 of 12');
});

test('3.7 the union\'s single point of failure is still frontier-cyber', async () => {
  // The record says so in as many words, and it matters: no single marker
  // covers all twelve, and the earlier claim that semicolon density alone did
  // was an artifact of the &sect; miscount. If a later edit weakens the
  // What/Why/How marker, the 12/12 quietly becomes 11/12 — this names where.
  const posts = await bySlug('blog-voice-negative');
  const hits = measurePost(posts['frontier-cyber'].body).results.filter((r) => r.fired);
  assert.deepEqual(hits.map((r) => r.id), ['what-why-how-headers']);
});

test('3.7 running the step over the pinned negative corpus warns 34 times and still succeeds', async () => {
  const posts = await loadPosts('blog-voice-negative');
  const out = sink();
  const res = await checkPostVoiceStep({ posts, out });
  assert.equal(res.ok, true, 'twelve tell-dense posts do not fail the build');
  assert.equal(res.tripped, 12);
  assert.equal(
    res.warnings.length,
    NEGATIVE_FIRING.semicolons +
      NEGATIVE_FIRING['em-dashes'] +
      NEGATIVE_FIRING['self-narration'] +
      NEGATIVE_FIRING['what-why-how-headers'],
    'one warning per tripped marker per post',
  );
});

test('3.7 the human sample\'s recorded maxima sit under every coded threshold', async () => {
  const rec = JSON.parse(
    await readFile(join(fixtureRoot('blog-voice-human'), 'measurements.json'), 'utf8'),
  );
  assert.equal(rec.pieces.length, 9);
  assert.equal(
    rec.pieces.reduce((n, p) => n + p.words, 0),
    rec.total_words,
    'the transcribed word counts sum to the record\'s total',
  );

  const threshold = (id) => MARKERS.find((m) => m.id === id).threshold;
  // The threshold regression: if a later edit lowers a line past the sample's
  // measured maximum, a human piece starts firing and the record's 0-of-9
  // becomes wrong. Each of these is one such line.
  assert.ok(
    rec.per_piece_maxima.semicolons_per_1k < threshold('semicolons'),
    `human max ${rec.per_piece_maxima.semicolons_per_1k}/1k must stay under ${threshold('semicolons')}`,
  );
  assert.ok(
    rec.per_piece_maxima.em_dashes_per_1k < threshold('em-dashes'),
    `human max ${rec.per_piece_maxima.em_dashes_per_1k}/1k must stay under ${threshold('em-dashes')} — the record notes this is a margin of ONE dash`,
  );
  assert.ok(
    rec.per_piece_maxima.focal_family_per_1k < threshold('focal-family'),
    `human max ${rec.per_piece_maxima.focal_family_per_1k}/1k must stay under ${threshold('focal-family')}`,
  );

  // And the union the record reports: one piece, the documented chrome
  // artifact, on the register-guard marker alone.
  assert.equal(rec.firing_counts_of_9.union, 1);
  assert.equal(rec.firing_counts_of_9['register-guards'], 1);
  assert.equal(rec.pieces.filter((p) => p.chrome_artifact).length, 1);
  for (const id of CALIBRATED_MARKERS) {
    if (id === 'register-guards') continue;
    assert.equal(rec.firing_counts_of_9[id], 0, `${id} fires on no human piece`);
  }
});
