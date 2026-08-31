/**
 * price-attribution.test.mjs — the vendor-price attribution gate
 * (beads addictedtoai-l6j).
 *
 * The suite is deliberately weighted two ways, because a checker with no
 * passing control is theatre and a checker with no real-defect control is a
 * regex nobody measured:
 *
 *   CATCHING   the sentences sdh found BY HAND in the real corpus, quoted from
 *              `ba1a577~1`. Five of its seven hits used an attributing verb and
 *              every one of those must be caught; the other two are verbless
 *              cross-row comparisons and are out of scope by design (see the
 *              module header, which names the blind spot).
 *   PASSING    the six repaired sentences from `ba1a577`, the house "lists at"
 *              style, a bare price with no verb, code spans, non-price facts,
 *              and the two nouns that were measured as false positives must
 *              every one of them come through untouched.
 *
 * The historical sentences are quoted rather than read from git on purpose: a
 * test that shells out to `git show` fails in a worktree or a shallow clone,
 * and these strings are evidence, not a fixture — they are what the corpus
 * actually said on the day the defect was found.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';
import {
  findPriceAttribution,
  findCrossRowComparison,
  LISTING_VERB_RE,
  debtKeys,
} from './price-attribution.mjs';

const errorsOf = (site) => site.diags.errors.filter((e) => e.rule === 'price-attribution');
const warnsOf = (site, rule) => site.diags.warnings.filter((w) => w.rule === rule);

/** Debt keys are repo-relative, exactly as `doc.file` reports them. */
const FIX = 'lib/fixtures/price-attribution';
const debtFor = (name) => ({ file: `${FIX}/${name}`, id: 'model/priced-model', field: 'price_input' });

/**
 * The real hits, as written before the repair. Line numbers are those of the
 * historical files and are not asserted; the sentences are.
 */
const PRE_FIX_HITS = [
  // z-ai-glm-5-1.md — two transclusions in one sentence, the "roughly double"
  // ratio that does not survive at Z.ai's own rates (1.4x, not 2.1x).
  '`z-ai/glm-5`, listed 11 February 2026, charges {{fact:model/z-ai-glm-5#price_input}} for input; this row, eight weeks later, charges {{fact:model/z-ai-glm-5-1#price_input}} — roughly double, in the same snapshot.',
  // z-ai-glm-5-1.md — the severest: an inverted conclusion. Z.ai's own rate
  // for both rows is 0.0000014, identical.
  'Ten weeks after this row, `z-ai/glm-5.2` arrived at {{fact:model/z-ai-glm-5-2#price_input}} input, which in that same snapshot sits below what this row charges.',
  // thinking-machines-lab.md — "asks" with the lab as the actor.
  'The batch row asks {{fact:model/thinkingmachines-inkling-batch#price_input}} for input against {{fact:model/thinkingmachines-inkling#price_input}} on the standard row.',
  // tencent.md — "priced above", which a naive /priced at/ pattern misses.
  'It is also the only Tencent row priced above a dollar per million output tokens: {{fact:model/tencent-hy4-preview#price_output}} against {{fact:model/tencent-hy3#price_output}}.',
  // anthropic-claude-opus-4-8.md — "billed at" on a row with no Anthropic endpoint.
  '`anthropic/claude-opus-4.1` was billed at {{fact:model/anthropic-claude-opus-4-1#price_input}}; the next release cut two thirds off that.',
];

/** The repaired forms, quoted from ba1a577. Every one must be clean. */
const POST_FIX = [
  'Both are the top listed provider’s rate for their row rather than necessarily Tencent’s own, so this is a gap between two listings and not between two prices Tencent set: {{fact:model/tencent-hy3#price_input}}.',
  'The batch row heads at {{fact:model/thinkingmachines-inkling-batch#price_input}} for input against {{fact:model/thinkingmachines-inkling#price_input}} on the standard row — each the top listed provider’s rate for its row.',
  'The OpenRouter row for it lists at {{fact:model/deepseek-deepseek-v4-flash-0731#price_input}} input.',
  '`z-ai/glm-5`, listed 11 February 2026, heads at {{fact:model/z-ai-glm-5#price_input}} for input; the two rows are headed by different top providers.',
];

// ---------------------------------------------------------------------------
// CATCHING — the defect, as it really appeared
// ---------------------------------------------------------------------------

test('l6j catches every real pre-fix hit that made a party the payee', () => {
  for (const sentence of PRE_FIX_HITS) {
    const hits = findPriceAttribution(sentence, 1);
    assert.ok(hits.length > 0, `not caught: ${sentence.slice(0, 70)}…`);
  }
  // Reported per transclusion, not per sentence: three of these five carry two
  // prices each, and an author fixing one needs both named.
  const total = PRE_FIX_HITS.reduce((n, s) => n + findPriceAttribution(s, 1).length, 0);
  assert.equal(total, 8, 'every price transclusion in a bad sentence is named');
});

test('l6j the build FAILS on an unhedged attribution, naming file and line', async () => {
  let err;
  try {
    await buildFixture('price-attribution');
  } catch (e) {
    err = e;
  }
  assert.ok(err, 'the build must fail — a guardrail that does not fire is not a guardrail');
  assert.match(err.message, /price-attribution/);
  assert.match(err.message, /attributes\.md/);
});

test('l6j the error explains the rotation and offers both repairs', async () => {
  const site = await buildFixture('price-attribution', { diags: undefined }).catch((e) => e);
  const hits = findPriceAttribution(
    'Priced Model charges {{fact:model/priced-model#price_input}} for input.',
    1,
  );
  assert.equal(hits.length, 1);
  assert.equal(hits[0].id, 'model/priced-model');
  assert.equal(hits[0].field, 'price_input');
  assert.ok(site instanceof Error);
  assert.match(site.message, /TOP PROVIDER/);
  assert.match(site.message, /rotates/);
  assert.match(site.message, /lists at/);
  assert.match(site.message, /Never name the provider/);
});

test('l6j each attributing verb the corpus used is detected', () => {
  const shapes = [
    'It charges {{fact:model/m#price_input}} for input.',
    'It was billed at {{fact:model/m#price_input}} last month.',
    'The tier is priced at {{fact:model/m#price_input}} for input.',
    'The only row priced above a dollar: {{fact:model/m#price_output}}.',
    'The batch row asks {{fact:model/m#price_input}} for input.',
    'It costs more than {{fact:model/m#price_input}} per token.',
    'The lab sells it at {{fact:model/m#price_input}} a token.',
  ];
  for (const s of shapes) {
    assert.ok(findPriceAttribution(s, 1).length === 1, `missed: ${s}`);
  }
});

// ---------------------------------------------------------------------------
// PASSING — the controls. A check with no passing control is theatre.
// ---------------------------------------------------------------------------

test('l6j every repaired sentence from the real fix passes untouched', () => {
  for (const sentence of POST_FIX) {
    assert.deepEqual(findPriceAttribution(sentence, 1), [], `false positive: ${sentence.slice(0, 70)}…`);
  }
});

test('l6j the house "lists at" / "heads at" style is never flagged', () => {
  const safe = [
    'The row lists at {{fact:model/m#price_input}} input.',
    'It heads at {{fact:model/m#price_input}} for input.',
    'The row carries {{fact:model/m#price_input}} in the snapshot.',
    'It sits at {{fact:model/m#price_input}} on the same index.',
    'Its input figure is {{fact:model/m#price_input}}.',
  ];
  for (const s of safe) assert.deepEqual(findPriceAttribution(s, 1), [], `false positive: ${s}`);
});

test('l6j the two measured noun false positives stay clean', () => {
  // Both were real: a bare /costs?/ flagged them before the pattern was narrowed.
  const nouns = [
    'It beats the best result at just over a third of the cost, and lists at {{fact:model/m#price_input}} input.',
    'It lists at {{fact:model/m#price_input}} — on the tier whose whole name is a promise about cost.',
  ];
  for (const s of nouns) assert.deepEqual(findPriceAttribution(s, 1), [], `false positive: ${s}`);
});

test('l6j the hedge exempts, and it is the remedy rather than a suppression comment', () => {
  const bad = 'Priced Model charges {{fact:model/m#price_input}} for input.';
  assert.equal(findPriceAttribution(bad, 1).length, 1);
  const hedged = `${bad} That figure is the top listed provider's rate for that row rather than necessarily its own.`;
  assert.deepEqual(findPriceAttribution(hedged, 1), []);
});

test('l6j the hedge reaches across sentences within a section, not across sections', () => {
  // nvidia.md states the comparison and hedges it five lines later, so a
  // sentence-local exemption would reject the repair that is already merged.
  const sameSection = [
    '## Pricing',
    '',
    'It charges {{fact:model/m#price_input}} for input.',
    '',
    'Each of those is the top listed provider’s rate for its row.',
  ].join('\n');
  assert.deepEqual(findPriceAttribution(sameSection, 1), []);

  const laterSection = [
    '## Pricing',
    '',
    'It charges {{fact:model/m#price_input}} for input.',
    '',
    '## Providers',
    '',
    'A provider is chosen on a rolling window.',
  ].join('\n');
  assert.equal(findPriceAttribution(laterSection, 1).length, 1, 'a later section must not exempt');
});

test('l6j code spans and fences are not prose', () => {
  const fenced = ['```text', 'It charges {{fact:model/m#price_input}} per token.', '```'].join('\n');
  assert.deepEqual(findPriceAttribution(fenced, 1), []);
  assert.deepEqual(findPriceAttribution('Inline: `charges {{fact:model/m#price_input}}`.', 1), []);
});

test('l6j a verb inside the marker itself is not an attribution', () => {
  // A real bug this suite caught: the fixture entry `model/priced-model` made
  // every sentence containing its marker match /\bpric(?:ed|es)\b/ on the id,
  // flagging four correctly-written sentences. An id is not an assertion.
  const s = 'The row lists at {{fact:model/priced-model#price_input}} input.';
  assert.deepEqual(findPriceAttribution(s, 1), []);
  const f = 'The row lists at {{fact:model/charges-model#price_output}} for output.';
  assert.deepEqual(findPriceAttribution(f, 1), []);
});

test('l6j masks are matched against the original, not cascaded', () => {
  // The other real bug this suite caught. A line that OPENS with an inline
  // code span — the single most common sentence shape in this corpus — was
  // blanked entirely: masking the span left twelve leading spaces, and the
  // indented-code pattern then read the rest of the line as a code block.
  // The check found nothing in it, which is the worst way for a guardrail
  // to fail: silently, and only on the sentences that matter most.
  const s = '`z-ai/glm-5`, listed 11 February 2026, charges {{fact:model/z-ai-glm-5#price_input}} for input.';
  assert.equal(findPriceAttribution(s, 1).length, 1, 'a leading code span must not blank the line');
});

test('l6j the quoted sentence is the one the author wrote, markers intact', () => {
  const s = 'Priced Model charges {{fact:model/m#price_input}} for input.';
  const [hit] = findPriceAttribution(s, 1);
  assert.match(hit.sentence, /\{\{fact:model\/m#price_input\}\}/);
});

test('l6j only price_* facts are in scope', () => {
  const s = 'It charges nothing for its {{fact:model/m#context_window}} window.';
  assert.deepEqual(findPriceAttribution(s, 1), []);
});

test('l6j the fixture corpus flags exactly the one bad body', async () => {
  // Everything else in the fixture — the hedged body, the house style, the
  // noun cases, the code spans, the non-price fact — must be clean, or the
  // check would train authors to ignore it.
  const site = await buildFixture('price-attribution', {
    priceDebt: { known: [debtFor('blog/attributes.md')] },
  });
  assert.deepEqual(errorsOf(site), [], 'the recorded instance is forgiven');
  const debt = warnsOf(site, 'price-attribution-debt');
  assert.equal(debt.length, 1, 'exactly one body is flagged in the whole fixture');
  assert.match(debt[0].file, /attributes\.md$/);
});

// ---------------------------------------------------------------------------
// THE DEBT RATCHET — it may only shrink
// ---------------------------------------------------------------------------

test('l6j an absent debt list forgives nothing — the safe direction', async () => {
  let err;
  try {
    await buildFixture('price-attribution', { priceDebt: undefined });
  } catch (e) {
    err = e;
  }
  assert.ok(err, 'no debt list means every instance fails');
});

test('l6j a recorded instance warns instead of failing, and says it is debt', async () => {
  const site = await buildFixture('price-attribution', {
    priceDebt: { known: [debtFor('blog/attributes.md')] },
  });
  assert.equal(errorsOf(site).length, 0);
  const w = warnsOf(site, 'price-attribution-debt');
  assert.equal(w.length, 1);
  assert.match(w[0].message, /known price-attribution debt/);
  assert.match(w[0].message, /TOP PROVIDER/, 'the repair advice is not lost by forgiving it');
});

test('l6j a debt entry that no longer fires is reported as removable', async () => {
  const site = await buildFixture('price-attribution', {
    priceDebt: { known: [debtFor('blog/attributes.md'), debtFor('blog/listing.md')] },
  });
  const stale = warnsOf(site, 'price-attribution-debt-stale');
  assert.equal(stale.length, 1, 'the repaired entry is named');
  assert.match(stale[0].field, /listing\.md/);
  assert.match(stale[0].message, /keeps shrinking/);
  assert.deepEqual(site.priceAttribution.stale, [`${FIX}/blog/listing.md::model/priced-model#price_input`]);
});

test('l6j the build reports what the check actually ran on', async () => {
  const site = await buildFixture('price-attribution', {
    priceDebt: { known: [debtFor('blog/attributes.md')] },
  });
  const pa = site.priceAttribution;
  // A check that runs on nothing reports the same clean result as one that runs
  // on everything. These are the numbers that make a future vacuum visible.
  // Exact, not a lower bound: a coverage number that only has to be "at least
  // something" cannot detect the check quietly running on less than it did.
  assert.equal(pa.scanned, 9, 'price transclusions scanned across the fixture');
  assert.equal(pa.docs, 3, 'documents carrying a price (non-price.md has none)');
  assert.equal(pa.errors, 0);
  assert.equal(pa.known, 1);
});

test('l6j debtKeys tolerates a missing or empty list', () => {
  assert.equal(debtKeys(undefined).size, 0);
  assert.equal(debtKeys({}).size, 0);
  assert.equal(debtKeys({ known: [] }).size, 0);
  assert.ok(debtKeys({ known: [{ file: 'a.md', id: 'model/x', field: 'price_input' }] })
    .has('a.md::model/x#price_input'));
});

// ---------------------------------------------------------------------------
// THE CROSS-ROW COMPARISON GATE (beads addictedtoai-58o)
//
// Same two weights as the suite above. CATCHING is anchored on the real
// sentence sdh named that no verb pattern reaches, quoted from `ba1a577~1`;
// PASSING is anchored on all four house idioms and on the repaired form of
// that same sentence, so the check cannot be satisfied by reverting the fix.
// ---------------------------------------------------------------------------

/**
 * `content/wiki/org/nvidia.md` at `ba1a577~1` — one of the two hits the
 * attribution check's own header names as its blind spot. It makes nobody the
 * payee, so no attributing verb reaches it, and it was false: NVIDIA has no
 * endpoint on either nemotron row, so the gap is two unrelated hosts.
 */
const NVIDIA_PRE_FIX =
  'And `nvidia/nemotron-3-ultra-550b-a55b:batch` is the only batch row in the snapshot dearer ' +
  'than the row it batches on both input and output — ' +
  '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b-batch#price_input}} against ' +
  '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b#price_input}} in, and ' +
  '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b-batch#price_output}} against ' +
  '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b#price_output}} out.';

/** The same sentence as merged at `ba1a577` — a listing verb, and clean. */
const NVIDIA_POST_FIX =
  'And `nvidia/nemotron-3-ultra-550b-a55b:batch` heads higher than the row it batches on both ' +
  'input and output — {{fact:model/nvidia-nemotron-3-ultra-550b-a55b-batch#price_input}} against ' +
  '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b#price_input}} in, and ' +
  '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b-batch#price_output}} against ' +
  '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b#price_output}} out, where the convention is a ' +
  'discount.';

test('58o catches the real cross-row hit that no attributing verb reaches', () => {
  assert.deepEqual(
    findPriceAttribution(NVIDIA_PRE_FIX, 1),
    [],
    'precondition: the verb check genuinely cannot see this one',
  );
  const hits = findCrossRowComparison(NVIDIA_PRE_FIX, 1);
  assert.equal(hits.length, 1);
  assert.deepEqual(hits[0].ids, [
    'model/nvidia-nemotron-3-ultra-550b-a55b',
    'model/nvidia-nemotron-3-ultra-550b-a55b-batch',
  ]);
});

test('58o the merged repair clears it — the check cannot be satisfied by reverting', () => {
  assert.deepEqual(findCrossRowComparison(NVIDIA_POST_FIX, 1), []);
});

test('58o a hedge appended after the comparison does not repair it', () => {
  // The ruling's whole point: the repair is a change of SUBJECT, not a caveat.
  // This sentence carries the corpus's own provider hedge and is still flagged,
  // because "X is twice Y" remains a claim about X and Y.
  const s =
    'Priced Model is twice the price of Other Model on input, ' +
    '{{fact:model/a#price_input}} against {{fact:model/b#price_input}} — though both are the ' +
    "top provider's rate for their row rather than necessarily either company's own.";
  assert.equal(findCrossRowComparison(s, 1).length, 1);
});

test('58o every listing idiom the corpus uses is an exemption', () => {
  const idioms = [
    'this row lists {{fact:model/a#price_input}} against {{fact:model/b#price_input}}',
    'one heads at {{fact:model/a#price_input}} and the other at {{fact:model/b#price_input}}',
    'listed at {{fact:model/a#price_input}} against {{fact:model/b#price_input}}',
    'its input listing stayed at {{fact:model/a#price_input}} beside {{fact:model/b#price_input}}',
    'one carries {{fact:model/a#price_input}}, the other {{fact:model/b#price_input}}',
    'heading at {{fact:model/a#price_input}} against {{fact:model/b#price_input}}',
    'the row posts {{fact:model/a#price_input}} against {{fact:model/b#price_input}}',
  ];
  for (const s of idioms) {
    assert.deepEqual(findCrossRowComparison(s + '.', 1), [], `wrongly flagged: ${s}`);
    assert.ok(LISTING_VERB_RE.test(s), `the exemption vocabulary is missing: ${s}`);
  }
});

test('58o one row is never a comparison, however it is worded', () => {
  // The trigger is DISTINCT entry ids, not marker count: a page comparing a
  // row's input to its own output is talking about one listing.
  const s =
    'It is twice as dear on output as on input: {{fact:model/a#price_output}} against ' +
    '{{fact:model/a#price_input}}.';
  assert.deepEqual(findCrossRowComparison(s, 1), []);
});

test('58o a fenced code sample is not a comparison', () => {
  // This one is load-bearing rather than decorative. The two checks read the
  // mask in OPPOSITE directions — one asks whether a verb is present, this one
  // whether a listing verb is absent — so a blanked region reads as a bare
  // comparison unless the blanked markers are skipped explicitly.
  const s =
    'The sample below is not a claim:\n\n```text\nA is twice {{fact:model/a#price_input}} ' +
    'against {{fact:model/b#price_input}}.\n```\n';
  assert.deepEqual(findCrossRowComparison(s, 1), []);
  const inline =
    'Neither is `A is twice {{fact:model/a#price_input}} against ' +
    '{{fact:model/b#price_input}}` in a span.';
  assert.deepEqual(findCrossRowComparison(inline, 1), []);
});

test('58o the reported sentence is the one the author wrote, markers intact', () => {
  const hits = findCrossRowComparison(NVIDIA_PRE_FIX, 1);
  assert.match(hits[0].sentence, /\{\{fact:model\/nvidia-nemotron-3-ultra-550b-a55b#price_input\}\}/);
  assert.match(hits[0].sentence, /dearer than the row it batches/);
});

test('58o the build FAILS on a bare comparison and says what to do instead', async () => {
  const err = await buildFixtureExpectingFailure('cross-row-price');
  assert.match(err.message, /cross-row-price-comparison/);
  assert.match(err.message, /compares\.md/);
  assert.match(err.message, /service tiers/, 'the tier evidence is in the message');
  assert.match(err.message, /change of subject/, 'the remedy is stated, not just the fault');
  // Both bad sections, and only those two, in a fixture that also carries four
  // clean ones — a check that flagged the repaired forms would train authors to
  // ignore it.
  assert.equal((err.message.match(/cross-row-price-comparison/g) ?? []).length, 2);
});

test('58o the repaired fixture body passes on its own', () => {
  const site = buildFixture('cross-row-price');
  return site.then(
    () => assert.fail('the fixture must fail — it carries the defect on purpose'),
    (err) => {
      // Every reported line belongs to compares.md; repaired.md is untouched.
      assert.doesNotMatch(err.message, /repaired\.md/);
    },
  );
});
