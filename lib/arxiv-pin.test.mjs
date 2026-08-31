/**
 * arxiv-pin.test.mjs — the versioned-citation gate (beads addictedtoai-2xh).
 *
 * Weighted the same two ways as `price-attribution.test.mjs`, because a
 * checker with no passing control is theatre and a checker with no
 * real-defect control is a regex nobody measured:
 *
 *   CATCHING   the shape the corpus really carried — a verbatim quotation
 *              beside an unversioned `/abs/` URL — anchored on the Epoch
 *              data-wall sentence, which is a literal substring of
 *              `2211.04325`'s v1 abstract and ABSENT from its v2 (fetched
 *              2026-08-31 from export.arxiv.org and compared byte for byte).
 *   PASSING    a pinned quotation, a bare reference that quotes nothing, a
 *              quoted TERM below the word floor, a fenced code sample, a
 *              non-arXiv host, a paraphrasing fact citing the same paper as a
 *              quoting one, and a timeline event quoting a paper's title —
 *              every one must come through untouched, because a check that
 *              fires on a correct citation would make authors pin everything
 *              and destroy the half of the rule that says referring must not
 *              pin.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { fixtureRoot } from './test-helpers.mjs';
import {
  arxivPinStep,
  checkArxivPins,
  debtKeys,
  findUnpinnedQuotedCitations,
  findUnpinnedQuotedFacts,
  sentenceAround,
  quotedRuns,
  MIN_QUOTE_WORDS,
} from './arxiv-pin.mjs';
import { Diagnostics } from './errors.mjs';

const FIX = 'lib/fixtures/arxiv-pin';
const run = (opts = {}) =>
  arxivPinStep({
    contentRoot: fixtureRoot('arxiv-pin'),
    debt: { known: [] },
    out: { write: () => {} },
    ...opts,
  });

/** The real sentence, quoted from `content/learn/how-to-think-about-what-comes-next.md`. */
const EPOCH =
  'The data wall\'s serious version was published in October 2022, when [researchers at ' +
  'Epoch](https://arxiv.org/abs/2211.04325), a group that measures the inputs to AI progress, ' +
  'estimated the stock of text on the internet against the growth of training datasets and ' +
  'concluded that "the stock of high-quality language data will be exhausted soon; likely ' +
  'before 2026."';

// ---------------------------------------------------------------------------
// CATCHING
// ---------------------------------------------------------------------------

test('2xh catches a verbatim quotation cited to an unversioned abstract', () => {
  const hits = findUnpinnedQuotedCitations(EPOCH, 1);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].id, '2211.04325');
  assert.match(hits[0].quotes[0], /stock of high-quality language data/);
});

test('2xh the pinned form of the same sentence is clean', () => {
  const pinned = EPOCH.replace('abs/2211.04325', 'abs/2211.04325v1');
  assert.deepEqual(findUnpinnedQuotedCitations(pinned, 1), []);
});

test('2xh every quotation in the sentence is reported, not only the first', () => {
  // A version that carries one of two quoted runs would silence the check while
  // leaving the other unattributed.
  const s =
    'It reports both "the first claim stated at some length here" and "the second claim, also ' +
    'at length" in [one paper](https://arxiv.org/abs/1234.56789).';
  const hits = findUnpinnedQuotedCitations(s, 1);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].quotes.length, 2);
});

test('2xh a quoted fact value is caught and a paraphrasing one beside it is not', () => {
  const hits = findUnpinnedQuotedFacts({
    facts: [
      {
        field: 'quoted',
        value: '"a definition reproduced word for word from the abstract"',
        source_url: 'https://arxiv.org/abs/2206.07682',
      },
      {
        field: 'paraphrased',
        value: 'two metrics account for most of the claimed abilities',
        source_url: 'https://arxiv.org/abs/2206.07682',
      },
      {
        field: 'pinned',
        value: '"a quotation that already names its version and is fine"',
        source_url: 'https://arxiv.org/abs/2304.15004v4',
      },
    ],
  });
  assert.deepEqual(hits.map((h) => h.field), ['quoted']);
});

test('2xh a quotation EMBEDDED in a paraphrase is still a quotation', () => {
  // Measured on the real corpus rather than assumed: of the twelve
  // arXiv-sourced fact values carrying a quoted run, five embed the quotation
  // inside a summary instead of filling the field with it. An "entirely
  // quoted" test would leave four real verbatim quotations on a moving
  // document — `concept/grokking.md`, `concept/model-collapse.md`,
  // `concept/in-context-learning.md` and `concept/embeddings.md`.
  const hits = findUnpinnedQuotedFacts({
    facts: [
      {
        field: 'three_phases',
        value:
          'memorization, circuit formation, cleanup — "grokking, rather than being a sudden ' +
          'shift, arises from the gradual amplification of structured mechanisms encoded in ' +
          'the weights"',
        source_url: 'https://arxiv.org/abs/2301.05217',
      },
    ],
  });
  assert.equal(hits.length, 1);
  assert.match(hits[0].quote, /^grokking, rather than being a sudden shift/);
});

test('2xh an embedded quoted TERM is below the floor and demands no version', () => {
  // `concept/reversal-curse.md`'s real value, which embeds `"A is B"` — three
  // words, a term of art rather than a reproduced sentence.
  const hits = findUnpinnedQuotedFacts({
    facts: [
      {
        field: 'finetuning_result',
        value:
          'after finetuning on "A is B", the likelihood of the correct answer to the reversed ' +
          'question is not higher than for a random name',
        source_url: 'https://arxiv.org/abs/2309.12288',
      },
    ],
  });
  assert.deepEqual(hits, []);
});

// ---------------------------------------------------------------------------
// PASSING — the half of the rule that says referring must NOT pin
// ---------------------------------------------------------------------------

test('2xh a citation that quotes nothing stays unversioned and passes', () => {
  const s = 'See [the Chinchilla paper](https://arxiv.org/abs/2203.15556) for the scaling fits.';
  assert.deepEqual(findUnpinnedQuotedCitations(s, 1), []);
});

test('2xh a quoted TERM is below the floor and is not a quotation', () => {
  const s = 'the ["scaling hypothesis"](https://arxiv.org/abs/2001.08361) as usually stated';
  assert.deepEqual(findUnpinnedQuotedCitations(s, 1), []);
  assert.equal(quotedRuns('"one two three four"').length, 0);
  assert.equal(quotedRuns('"one two three four five"').length, 1);
  assert.equal(MIN_QUOTE_WORDS, 5);
});

test('2xh a fenced code sample is not prose', () => {
  const s =
    'The command is:\n\n```text\nSee "a quoted sentence of quite sufficient length here" at\n' +
    'https://arxiv.org/abs/2211.04325 for it.\n```\n';
  assert.deepEqual(findUnpinnedQuotedCitations(s, 1), []);
});

test('2xh another host is out of scope entirely', () => {
  const s = 'It says ["something quoted at considerable length"](https://example.com/paper).';
  assert.deepEqual(findUnpinnedQuotedCitations(s, 1), []);
});

// ---------------------------------------------------------------------------
// THE QUOTE-AWARE SENTENCE BOUNDARY — measured, not assumed
// ---------------------------------------------------------------------------

test('2xh a full stop inside a closing quote mark ends the sentence', () => {
  // The real failure this caught: the Epoch paragraph ends one sentence
  // `...before 2026."` and begins another. A `[.!?](?=\s|$)` boundary does not
  // split there, so the NEXT citation inherited the PREVIOUS sentence's
  // quotation and was reported as a defect that does not exist.
  const s =
    'It concluded that "the stock will be exhausted soon, likely before 2026." Later [the same ' +
    'team re-measured](https://arxiv.org/abs/2211.04325) and said nothing quotable.';
  assert.deepEqual(
    findUnpinnedQuotedCitations(s, 1),
    [],
    'the second citation quotes nothing and must not inherit the first sentence',
  );
  const first = sentenceAround(s, 5);
  assert.match(first.text, /before 2026\."$/);
});

test('2xh a paragraph break still bounds a sentence', () => {
  const s =
    'It says "a quoted claim of ample length for the floor".\n\nElsewhere [a different ' +
    'paper](https://arxiv.org/abs/1234.56789) is merely cited.';
  assert.deepEqual(findUnpinnedQuotedCitations(s, 1), []);
});

// ---------------------------------------------------------------------------
// THE FIXTURE CORPUS, END TO END
// ---------------------------------------------------------------------------

test('2xh the build FAILS on the fixture and names file, quotation and remedy', async () => {
  const err = await run().then(
    () => null,
    (e) => e,
  );
  assert.ok(err, 'the guardrail must fire — a check that does not fail is not a gate');
  assert.match(err.message, /arxiv-pin/);
  assert.match(err.message, /quotes\.md/);
  assert.match(err.message, /quoted-fact\.md/, 'the front-matter shape is reported too');
  assert.match(err.message, /serves the LATEST version/, 'the reason is stated');
  assert.match(err.message, /leave it unversioned/, 'the other half of the rule is stated');
  assert.doesNotMatch(err.message, /clean\.md/, 'every correct citation passes untouched');
});

test('2xh the fixture flags exactly the citations it should', async () => {
  const err = await run().then(
    () => null,
    (e) => e,
  );
  // quotes.md: one at the 2211.04325 citation, two on the 2310.20216 citation
  // (both quotations named). quoted-fact.md: the wholly-quoted fact and the
  // embedded quotation. The bare reference, the pinned fact, the paraphrasing
  // fact, the embedded TERM and the timeline title are all clean.
  assert.equal((err.message.match(/\[arxiv-pin\]/g) ?? []).length, 5);
});

test('2xh a recorded instance warns instead of failing, and says it is debt', async () => {
  const r = await run({
    debt: {
      known: [
        {
          file: `${FIX}/blog/quotes.md`,
          id: '2211.04325',
          quote: 'the stock of high-quality language data will be exhausted soon; likely before 2026',
        },
      ],
    },
  }).then(
    (x) => x,
    (e) => e,
  );
  // Still fails on the other three, but this one is forgiven rather than fatal.
  assert.match(r.message, /arxiv-pin/);
  assert.equal((r.message.match(/\[arxiv-pin\]/g) ?? []).length, 4);
});

test('2xh the debt key survives a line number changing', () => {
  // Keyed by file, id and quotation — never by line, following
  // price-attribution's own debt file, which records "by file and fact rather
  // than by line number" for exactly this reason.
  const keys = debtKeys({
    known: [{ file: 'a.md', id: '2211.04325', quote: 'a  quoted   claim of ample length' }],
  });
  assert.ok(keys.has('a.md::2211.04325::a quoted claim of ample length'));
});

test('2xh debtKeys tolerates a missing or empty list', () => {
  assert.equal(debtKeys(undefined).size, 0);
  assert.equal(debtKeys({}).size, 0);
  assert.equal(debtKeys({ known: [] }).size, 0);
});

test('2xh a debt entry that no longer fires is reported as removable', async () => {
  const out = [];
  const r = await run({
    debt: {
      known: [
        { file: `${FIX}/blog/clean.md`, id: '2203.15556', quote: 'a quotation that is not there at all' },
        {
          file: `${FIX}/blog/quotes.md`,
          id: '2211.04325',
          quote: 'the stock of high-quality language data will be exhausted soon; likely before 2026',
        },
      ],
    },
    out: { write: (s) => out.push(s) },
  }).then(
    (x) => x,
    (e) => e,
  );
  assert.ok(
    out.some((s) => /no longer fires/.test(s) && /clean\.md/.test(s)),
    'the stale entry is named so the list cannot outlive the debt',
  );
  assert.ok(r);
});

test('2xh the step reports what it actually ran on', async () => {
  // A check that runs on nothing prints the same clean result as one that runs
  // on everything. Exact numbers, not a lower bound.
  const debt = {
    known: [
      { file: `${FIX}/blog/quotes.md`, id: '2211.04325', quote: 'the stock of high-quality language data will be exhausted soon; likely before 2026' },
      { file: `${FIX}/blog/quotes.md`, id: '2310.20216', quote: 'a headline number that changed between versions' },
      { file: `${FIX}/blog/quotes.md`, id: '2310.20216', quote: 'a second claim in the same sentence' },
      { file: `${FIX}/wiki/concept/quoted-fact.md`, id: '2206.07682', quote: 'a definition reproduced word for word from the abstract' },
      { file: `${FIX}/wiki/concept/quoted-fact.md`, id: '2301.05217', quote: "a full sentence lifted verbatim from the paper's own abstract" },
    ],
  };
  const r = await run({ debt });
  assert.equal(r.errors, 0, 'every instance is recorded, so nothing fails');
  assert.equal(r.known, 5);
  assert.equal(r.stale.length, 0);
  assert.equal(r.docs, 3, 'documents carrying an /abs/ citation');
  // 3 links in quotes.md + 4 in clean.md (the fenced one is masked, correctly)
  // + 5 fact source_urls in quoted-fact.md. The timeline's source_url is not a
  // fact and is not scanned.
  assert.equal(r.scanned, 12, '/abs/ citations examined, pinned and unpinned alike');
});

test('2xh a document with no arXiv citation reports zero rather than nothing', () => {
  const diags = new Diagnostics();
  const r = checkArxivPins(
    { file: 'x.md', hasBody: true, body: 'No papers here at all.', data: {} },
    diags,
  );
  assert.deepEqual(r, { scanned: 0, errors: 0, known: 0, keys: [] });
  assert.equal(diags.errors.length, 0);
});
