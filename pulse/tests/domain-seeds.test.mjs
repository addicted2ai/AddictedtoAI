/**
 * domain-seeds.test.mjs — the Pulse's domain seeding (change
 * `tag-the-corpus-by-domain`, tasks 12 and 13).
 *
 * Every case here runs the real `pulse/run.mjs` against a throwaway root, so
 * what is measured is the shipped engine end to end. The properties under test
 * are the two the requirement is made of and one join:
 *
 *   - APPEND-ONLY. A signal that has left the snapshot removes nothing, and it
 *     appends no line to `data/changes.jsonl` either. Both halves are asserted,
 *     because the second is a decision the change made against a
 *     recommendation, and a decision nothing enforces is a sentence.
 *   - IDEMPOTENT. A second run over an unchanged snapshot rewrites no file and
 *     duplicates no value.
 *   - THE JOIN WITH REVIEW. A seeding run over an entry with a bound review
 *     record leaves that record reporting the entry as matching — verified by
 *     recomputing the hash through the real join, not by asserting that a key
 *     is on a list.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';

import {
  assertIngested,
  cleanup,
  jsonSource,
  makeRoot,
  paths,
  readLines,
  runPulse,
  serve,
  writeEntry,
} from './helpers.mjs';
import { MODALITY_DOMAIN, DOMAIN_SEEDS, signalsForRow } from '../lib/domain-seeds.mjs';
import { reviewedHashOfFile } from '../../lib/review-hash.mjs';
import { readReviewRecords, resolveReviews } from '../../lib/reviews.mjs';

const NO_BUILD = ['--no-build'];
/**
 * A later run in the same test must FETCH, or it measures nothing.
 *
 * `fetch_every_days: 1` means a second run on the same day skips the source and
 * leaves the snapshot exactly as it was — under which "the seeded value is
 * still there" is true of a run that never looked. Every follow-up run here is
 * forced, and each one also asserts what the new snapshot actually holds.
 */
const REFETCH = ['--no-build', '--force'];

/** What the committed snapshot says right now, so a skipped fetch cannot hide. */
function snapshotRow(root) {
  return JSON.parse(readFileSync(paths.latest(root, SOURCE), 'utf8')).rows['acme/one'];
}

/**
 * The source id is the REAL one, not a fixture name, because the seeding rules
 * are declared per source in `DOMAIN_SEEDS`. A fixture that invented its own
 * source id would exercise a mapping this repository does not ship.
 */
const SOURCE = 'openrouter-models';

const ENTRY_PATH = 'content/wiki/model/acme-one.md';

function serveRows(rows) {
  return JSON.stringify({ data: rows });
}

/** One snapshot row, with only the fields the seeding rules name. */
function row({ modalities = ['text'], outputs = ['text'], coding = null, agentic = null } = {}) {
  return {
    id: 'acme/one',
    name: 'Acme One',
    pricing: { prompt: '0.000001' },
    context_length: 100000,
    expiration_date: null,
    architecture: { input_modalities: modalities, output_modalities: outputs },
    benchmarks: { artificial_analysis: { coding_index: coding, agentic_index: agentic } },
  };
}

function writeJoinedEntry(root, body = '') {
  return writeEntry(
    root,
    ENTRY_PATH,
    {
      id: 'model/acme-one',
      kind: 'model',
      display_name: 'Acme One',
      status: 'active',
      maintenance: 'living',
      aliases: [{ name: 'Acme One', class: 'manual' }],
      feeds: { [SOURCE]: 'acme/one' },
      facts: [],
      timeline: [],
      mentions: [],
    },
    body,
  );
}

function frontMatterOf(root) {
  const text = readFileSync(join(root, ...ENTRY_PATH.split('/')), 'utf8');
  const end = text.indexOf('\n---', 3);
  return YAML.parse(text.slice(4, end + 1));
}

// ---------------------------------------------------------------------------
// The table itself, measured directly. These need no fixture repository.
// ---------------------------------------------------------------------------

test('12 the modality table maps every token it knows, in both directions', () => {
  // Both halves written down: the tokens that seed nothing are as explicit as
  // the ones that seed something, so "text is not a domain" is a decision in
  // the code rather than an absence somebody later reads as an oversight.
  assert.equal(MODALITY_DOMAIN.text, null);
  assert.equal(MODALITY_DOMAIN.file, null);
  assert.equal(MODALITY_DOMAIN.image, 'image');
  assert.equal(MODALITY_DOMAIN.video, 'video');
  assert.equal(MODALITY_DOMAIN.audio, 'audio');
  // A token the table has never seen seeds nothing AND is reported, rather
  // than being silently dropped or guessed at from its spelling.
  const seen = signalsForRow(
    { architecture: { input_modalities: ['text', 'hologram'] } },
    DOMAIN_SEEDS[SOURCE],
  );
  assert.deepEqual([...seen.domains], []);
  assert.deepEqual([...seen.unmapped], ['hologram']);
});

test('12 presence is a NUMBER, not a key — a null index seeds nothing', () => {
  // OpenRouter writes the benchmark keys with `null` on rows it has not scored:
  // measured 2026-09-05, 243 of 431 rows carry the block and 181 carry a score.
  // Keying on `'coding_index' in row` would tag the 243.
  const rules = DOMAIN_SEEDS[SOURCE];
  const nulled = signalsForRow(row({ coding: null, agentic: null }), rules);
  assert.deepEqual([...nulled.domains], []);
  const scored = signalsForRow(row({ coding: 23, agentic: 0 }), rules);
  assert.deepEqual([...scored.domains].sort(), ['agents', 'coding'], '0 is a score; null is not');
});

test('12 the domain is read from the CONTENTS of a named field, never from a field name', () => {
  const rules = DOMAIN_SEEDS[SOURCE];
  // The modality tokens and the domain ids are spelled alike by coincidence, so
  // the rule is checked where the coincidence does not help it: a row whose
  // modality list is empty seeds nothing, whatever else it carries.
  assert.deepEqual([...signalsForRow(row({ modalities: [], outputs: [] }), rules).domains], []);
  assert.deepEqual(
    [...signalsForRow(row({ modalities: ['text', 'image'], outputs: ['audio'] }), rules).domains].sort(),
    ['audio', 'image'],
  );
});

test('12 a rule that produced a value outside the vocabulary stops the engine', () => {
  // The defensive check in `signalsForRow` cannot fire against the shipped
  // table — measured over both committed snapshots, every value it produces is
  // in DOMAINS and no modality token is unaccounted — so it is fired here
  // deliberately with a broken rule. A check nothing can make fire is
  // indistinguishable from a check that does nothing.
  assert.throws(
    () =>
      signalsForRow(row({ coding: 23 }), [
        { kind: 'present', path: 'benchmarks.artificial_analysis.coding_index', domain: 'legal' },
      ]),
    /not in the closed vocabulary/,
    'the engine must stop rather than write front matter its own rebuild rejects',
  );
});

// ---------------------------------------------------------------------------
// The engine, end to end.
// ---------------------------------------------------------------------------

test('12 a first run seeds from named feed fields and a second run appends nothing', async (t) => {
  let rows = [row({ modalities: ['text', 'image'], coding: 23 })];
  const server = await serve(() => ({ status: 200, body: serveRows(rows) }));
  const root = makeRoot([jsonSource(SOURCE, `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });
  writeJoinedEntry(root);

  const first = await runPulse(root, NO_BUILD);
  assert.equal(first.status, 0, first.out);
  assertIngested(root, SOURCE, 'first run');
  assert.match(first.out, /domains — 1 entr\(ies\) gained a seeded domain/);
  // Sorted by domain id — a pure function of the ids, never the order the feed
  // listed them or the order the vocabulary happens to be written in.
  assert.deepEqual(frontMatterOf(root).domains_seeded, ['coding', 'image']);

  const afterFirst = readFileSync(join(root, ...ENTRY_PATH.split('/')), 'utf8');
  const linesAfterFirst = readLines(paths.changes(root)).length;

  const second = await runPulse(root, REFETCH);
  assert.equal(second.status, 0, second.out);
  assertIngested(root, SOURCE, 'second run');
  assert.deepEqual(snapshotRow(root).architecture.input_modalities, ['text', 'image'], 'refetched, unchanged');
  assert.match(second.out, /domains — 0 entr\(ies\) gained a seeded domain/);
  assert.equal(
    readFileSync(join(root, ...ENTRY_PATH.split('/')), 'utf8'),
    afterFirst,
    'an unchanged snapshot rewrites the file byte for byte, not at all',
  );
  assert.equal(readLines(paths.changes(root)).length, linesAfterFirst, 'and appends no change line');
});

test('12 a signal that has LEFT the snapshot removes nothing and writes no change line', async (t) => {
  // The regression test for the measured 166 -> 99 `agentic_index` drop across
  // the 2026-09-04 and 2026-09-05 snapshots: under a recomputing rule one
  // publisher's rebase would have untagged 67 entries overnight, with no
  // editorial decision anywhere.
  let rows = [row({ modalities: ['text', 'image'], agentic: 41 })];
  const server = await serve(() => ({ status: 200, body: serveRows(rows) }));
  const root = makeRoot([jsonSource(SOURCE, `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });
  writeJoinedEntry(root);

  await runPulse(root, NO_BUILD);
  assertIngested(root, SOURCE, 'seeding run');
  assert.deepEqual(frontMatterOf(root).domains_seeded, ['agents', 'image']);
  const linesBefore = readLines(paths.changes(root));

  // The publisher rescores and the row stops carrying the index at all.
  rows = [row({ modalities: ['text', 'image'], agentic: null })];
  const after = await runPulse(root, REFETCH);
  assert.equal(after.status, 0, after.out);
  assertIngested(root, SOURCE, 'rebase run');
  assert.equal(
    snapshotRow(root).benchmarks.artificial_analysis.agentic_index,
    null,
    'the signal really is gone from the snapshot this run ingested',
  );

  assert.deepEqual(
    frontMatterOf(root).domains_seeded,
    ['agents', 'image'],
    'the seeded value stays — removal is editorial, spelled `domains_excluded`',
  );

  const linesAfter = readLines(paths.changes(root));
  assert.equal(
    linesAfter.length,
    linesBefore.length,
    'the disappearance appends NO line to data/changes.jsonl: the registry has already ruled ' +
      'benchmarks.artificial_analysis "not carried", and a second emitter here would re-admit one ' +
      "publisher's act to the changed feed through a path that never reads that decision",
  );
  for (const line of linesAfter) {
    assert.ok(
      !/domain/i.test(JSON.stringify(line)),
      `no changed-feed line mentions a domain: ${JSON.stringify(line)}`,
    );
  }
});

test('12 a snapshot that GAINS a signal appends exactly one value, and never a duplicate', async (t) => {
  let rows = [row({ modalities: ['text', 'image'], coding: 23 })];
  const server = await serve(() => ({ status: 200, body: serveRows(rows) }));
  const root = makeRoot([jsonSource(SOURCE, `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });
  writeJoinedEntry(root);

  await runPulse(root, NO_BUILD);
  assertIngested(root, SOURCE, 'first run');
  assert.deepEqual(frontMatterOf(root).domains_seeded, ['coding', 'image']);

  // The row gains video output while keeping everything it already signalled.
  rows = [row({ modalities: ['text', 'image'], outputs: ['text', 'video'], coding: 23 })];
  const grown = await runPulse(root, REFETCH);
  assert.equal(grown.status, 0, grown.out);
  assertIngested(root, SOURCE, 'second run');
  assert.deepEqual(snapshotRow(root).architecture.output_modalities, ['text', 'video'], 'the new signal landed');
  assert.match(grown.out, /domains — 1 entr\(ies\) gained a seeded domain/);

  const seeded = frontMatterOf(root).domains_seeded;
  assert.deepEqual(seeded, ['coding', 'image', 'video'], 'one value appended, the rest left in place');
  assert.equal(new Set(seeded).size, seeded.length, 'and no value written twice');
});

test('12 an undeclared row seeds nothing — the join is the feeds map, never a name', async (t) => {
  // The control for every case above: without it, "the entry gained a domain"
  // could be true of any entry the corpus holds.
  let rows = [row({ modalities: ['text', 'image'], coding: 23 })];
  const server = await serve(() => ({ status: 200, body: serveRows(rows) }));
  const root = makeRoot([jsonSource(SOURCE, `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });
  // Same display name, same slug — and no `feeds` map.
  writeEntry(root, ENTRY_PATH, {
    id: 'model/acme-one',
    kind: 'model',
    display_name: 'Acme One',
    status: 'active',
    maintenance: 'stable',
    aliases: [{ name: 'Acme One', class: 'manual' }],
    facts: [],
    timeline: [],
    mentions: [],
  });

  const run = await runPulse(root, NO_BUILD);
  assert.equal(run.status, 0, run.out);
  assertIngested(root, SOURCE, 'run');
  assert.match(run.out, /domains — 0 entr\(ies\) gained a seeded domain/);
  assert.equal(frontMatterOf(root).domains_seeded, undefined, 'no key invented on an unjoined entry');
});

// ---------------------------------------------------------------------------
// Task 13 — where the mechanical key and the review record are supposed to meet.
// ---------------------------------------------------------------------------

test('13 a seeding run leaves a bound review record reporting the entry as matched', async (t) => {
  let rows = [row({ modalities: ['text', 'image'], coding: 23 })];
  const server = await serve(() => ({ status: 200, body: serveRows(rows) }));
  const root = makeRoot([jsonSource(SOURCE, `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });
  const file = writeJoinedEntry(root, 'A body, so the entry is a reviewable piece.\n');

  // The record binds the hash of the reviewed surface as the merge step would.
  const recordedHash = reviewedHashOfFile(file);
  assert.ok(recordedHash, 'the fixture entry must be hashable');
  const reviewsDir = join(root, 'data', 'reviews');
  mkdirSync(reviewsDir, { recursive: true });
  writeFileSync(
    join(reviewsDir, 'seed-wiki-model-acme-one.md'),
    `---\nsubject: ${ENTRY_PATH}\ndate: "2026-09-06"\nreviewed:\n  ${ENTRY_PATH}: ${recordedHash}\n---\n\nverdict: approve\n`,
    'utf8',
  );

  const piece = {
    type: 'entry',
    file: ENTRY_PATH,
    abs: file,
    slug: 'acme-one',
    url: '/wiki/model/acme-one',
    data: { id: 'model/acme-one' },
    hasBody: true,
  };
  const stateOf = () =>
    resolveReviews([piece], readReviewRecords(reviewsDir)).states.get(ENTRY_PATH);

  assert.equal(stateOf(), 'recorded', 'the record binds before the run, or this proves nothing');
  const before = readFileSync(file, 'utf8');

  const run = await runPulse(root, NO_BUILD);
  assert.equal(run.status, 0, run.out);
  assertIngested(root, SOURCE, 'seeding run');

  // The run must actually have written to the file, or "still matched" is the
  // trivially true statement about a file nothing touched.
  const after = readFileSync(file, 'utf8');
  assert.notEqual(after, before, 'the seeding run rewrote the entry');
  assert.deepEqual(frontMatterOf(root).domains_seeded, ['coding', 'image']);

  // Recomputed through the real join, not asserted from the list membership:
  // that the key is on MECHANICAL_FRONT_MATTER_KEYS is the review-hash test's
  // claim; this is the claim that it works.
  assert.equal(stateOf(), 'recorded', 'the bound record still reports the entry as matching');
  assert.equal(reviewedHashOfFile(file), recordedHash, 'and the reviewed surface is unmoved');
});

test('13 an EDITORIAL domain on the same entry does move the reviewed surface', async () => {
  // The pair, without which the case above passes if everything is exempt.
  // Editorial tagging is a review event and the cost is the correct one.
  const root = makeRoot([]);
  try {
    const file = writeJoinedEntry(root, 'A body.\n');
    const before = reviewedHashOfFile(file);
    const text = readFileSync(file, 'utf8');
    writeFileSync(file, text.replace('mentions: []\n', 'mentions: []\ndomains:\n  - research\n'), 'utf8');
    assert.notEqual(reviewedHashOfFile(file), before, '`domains` is inside the reviewed surface');
  } finally {
    cleanup(root);
  }
});
