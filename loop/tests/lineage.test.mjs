/**
 * lineage.test.mjs — wisdom item 5 arms (machine form and reader form).
 *
 * Fixtures are declared, never copied. The wild half is the banked `03e2207`
 * record (re-verified by re-running its commands in D:/AddictedtoAI on
 * 2026-09-10; outputs quoted in the arm below) and the cited note lines, which
 * are READ and never copied into fixtures. The constructed half — helper/input
 * pairs, full-length digests with short ids quoted only as aliases — is built
 * here and declared as such, because no wild pair of that exact shape exists
 * on record. Constructed digests are full-length 40-hex so no arm depends on
 * alias length; the wild arm is the only one that resolves short ids, through
 * the same resolver git itself provides.
 *
 * Runs under plain `node --test` by absolute path: every import here is
 * dependency-free (`lineage.mjs` uses only node:child_process for the
 * production resolver, `ledger.mjs` only node:fs/node:path plus its loop
 * siblings). The review-brief arm reads `review.mjs` as template text rather
 * than importing it, because that chain requires registry packages no
 * worktree carries; the brief's own words for the arm are "read the template,
 * assert the text".
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  CORROBORATION_DISPOSITION,
  CORROBORATION_QUESTION,
  LINEAGE_RESOLVER_GIT,
  classifyClaim,
  corroborationSection,
  createLineageStore,
  recordCorroboration,
  recordMeasurement,
  selectOutcomeLineage,
  validateDigestForm,
} from '../lib/lineage.mjs';
import { LEDGER_FIELDS, makeLedgerLine } from '../lib/ledger.mjs';

// ---------------------------------------------------------------------------
// Constructed fixtures (declared): one helper over one input, full digests.
// ---------------------------------------------------------------------------

const PRODUCER_COUNT = 'loop/lib/gates.mjs:measureGate';
const INPUT_ONE_FULL = 'a'.repeat(40); // quoted as alias `aaaaaaa` below
const INPUT_TWO_FULL = 'b'.repeat(40); // quoted as alias `bbbbbbb`
const INPUT_THREE_FULL = 'c'.repeat(40); // quoted as alias `ccccccc`
const METHOD_V1 = 'count-tokens-v1';
const METHOD_V2 = 'count-tokens-v2';
const WILD_FULL_9C =
  '9c272f425a1204a6da87aad34b5c85657adaf029';

// The banked resolver table: short ids resolve exactly as the re-run printed,
// constructed full digests (and their quoted short aliases) resolve to blobs,
// and anything else resolves to nothing, the way git answers unknown names.
function bankedResolve(digest) {
  const d = String(digest).toLowerCase();
  const table = {
    '03e2207': { ok: false, output: 'fatal: Not a valid object name 03e2207' },
    '9c272f4': { ok: true, kind: 'blob', full: WILD_FULL_9C },
    [WILD_FULL_9C]: { ok: true, kind: 'blob', full: WILD_FULL_9C },
    [INPUT_ONE_FULL]: { ok: true, kind: 'blob', full: INPUT_ONE_FULL },
    aaaaaaa: { ok: true, kind: 'blob', full: INPUT_ONE_FULL },
    [INPUT_TWO_FULL]: { ok: true, kind: 'blob', full: INPUT_TWO_FULL },
    bbbbbbb: { ok: true, kind: 'blob', full: INPUT_TWO_FULL },
    [INPUT_THREE_FULL]: { ok: true, kind: 'blob', full: INPUT_THREE_FULL },
    ccccccc: { ok: true, kind: 'blob', full: INPUT_THREE_FULL },
  };
  if (table[d]) return table[d];
  return { ok: false, output: `fatal: Not a valid object name ${digest}` };
}

const testStore = () =>
  createLineageStore({ resolve: bankedResolve, resolver: LINEAGE_RESOLVER_GIT });

// ---------------------------------------------------------------------------
// Arm 1 — the constructed two-method-names pair.
// ---------------------------------------------------------------------------

test('arm 1 (constructed): one helper over one input under two method names — the second claim is DEPENDENT', () => {
  const store = testStore();
  const first = recordMeasurement(store, {
    producer: PRODUCER_COUNT,
    digest: INPUT_ONE_FULL, // alias `aaaaaaa`
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
  });
  assert.equal(first.ok, true);
  const second = classifyClaim(store, {
    producer: PRODUCER_COUNT,
    digest: INPUT_ONE_FULL,
    method: METHOD_V2,
    resolver: LINEAGE_RESOLVER_GIT,
    claimedIndependent: true,
  });
  assert.equal(second.ok, true);
  assert.equal(second.independent, false, 'same producer AND same digest is consistency, whatever the methods say');
  assert.equal(second.consistencyOf, first.id, 'consistency-of points at the first measurement');
  assert.match(second.reason, /count-tokens-v1/, 'the arm names the first method name');
  assert.match(second.reason, /count-tokens-v2/, 'the arm names the second method name');
  assert.equal(store.records.length, 2, 'both records present — the downgrade records, never deletes');
});

// ---------------------------------------------------------------------------
// Arm 2 — the wild `03e2207` shape refused, the `9c272f4` shape accepted.
// ---------------------------------------------------------------------------

test('arm 2 (wild): `03e2207` refuses on unresolvability, `9c272f4` accepts as the resolvable alias', () => {
  // Re-run in D:/AddictedtoAI on 2026-09-10, outputs quoted verbatim:
  //   `git cat-file -t 9c272f4`  → `blob`
  //   `git cat-file -t 03e2207`  → `fatal: Not a valid object name 03e2207`
  // and `git rev-parse --verify`
  // `9c272f425a1204a6da87aad34b5c85657adaf029` → itself, `git cat-file -t` on
  // the full id → `blob`.
  const store = testStore();
  const refused = recordMeasurement(store, {
    producer: PRODUCER_COUNT,
    digest: '03e2207',
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
  });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'digest-unresolvable');
  assert.match(
    refused.reason,
    /fatal: Not a valid object name 03e2207/,
    'the refusal quotes the resolver output it was verified against',
  );
  const accepted = recordMeasurement(store, {
    producer: PRODUCER_COUNT,
    digest: '9c272f4',
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
  });
  assert.equal(accepted.ok, true, 'the resolvable alias is accepted as lineage');
  assert.equal(accepted.lineage.digest, WILD_FULL_9C, 'normalised to the full id, so no arm depends on alias length');
  const fullForm = recordMeasurement(store, {
    producer: PRODUCER_COUNT,
    digest: WILD_FULL_9C,
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
  });
  assert.equal(fullForm.ok, true, 'the full-length form is accepted too');
  assert.equal(store.records.length, 2, 'the refused shape left no record');
});

test('arm 2b: bytes without a stated resolver refuse, for the other reason', () => {
  const store = testStore();
  const refused = recordMeasurement(store, {
    producer: PRODUCER_COUNT,
    digest: INPUT_ONE_FULL,
    method: METHOD_V1,
    resolver: '',
  });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'lineage-resolver-missing');
  assert.notEqual(
    refused.code,
    'digest-unresolvable',
    'never one rule with two compliant readings: the missing-resolver defect and the unresolvable defect refuse under different codes',
  );
  assert.equal(validateDigestForm('03e2207').ok, true, 'form is well-formed hex — its defect is bytes, not form');
  assert.equal(validateDigestForm('not-a-digest!!').ok, false, 'malformed form refuses on its own terms');
});

// ---------------------------------------------------------------------------
// Arm 3 — matching lineage marked independent: refused AND recorded.
// ---------------------------------------------------------------------------

test('arm 3: a matching-lineage independent-marked claim is refused as independent and recorded as consistency', () => {
  const store = testStore();
  const first = recordMeasurement(store, {
    producer: PRODUCER_COUNT,
    digest: INPUT_TWO_FULL, // alias `bbbbbbb`
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
  });
  const before = { ...store.records[0] };
  const verdict = classifyClaim(store, {
    producer: PRODUCER_COUNT,
    digest: INPUT_TWO_FULL,
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
    claimedIndependent: true,
  });
  assert.equal(verdict.ok, true);
  assert.equal(verdict.independent, false, 'refused as independent');
  assert.equal(verdict.consistencyOf, first.id, 'the earlier id is returned');
  assert.equal(store.records.length, 2, 'both records present — nothing deleted');
  assert.deepEqual(store.records[0], before, 'the earlier record is untouched, not thrown away');
});

// ---------------------------------------------------------------------------
// Arm 4 — the Luna-47 mirror (constructed): same value, different digests.
// ---------------------------------------------------------------------------

test('arm 4 (constructed Luna-47 mirror): same value with different digests is INDEPENDENT', () => {
  // timeline-note-03: Luna's 47 measured a different quantity that coincided
  // numerically and was struck as corroboration. The check judges lineage,
  // never value — so two claims both reading 47 over different bytes classify
  // independent. Value-equality is not lineage-equality; getting this
  // backwards (same value, same claim) is the defect.
  const store = testStore();
  const first = recordMeasurement(store, {
    producer: 'loop/lib/budget.mjs:tallyWindow',
    digest: INPUT_TWO_FULL, // alias `bbbbbbb`
    method: 'tally-local-window',
    resolver: LINEAGE_RESOLVER_GIT,
    value: 47,
  });
  assert.equal(first.ok, true);
  const second = classifyClaim(store, {
    producer: 'loop/lib/budget.mjs:tallyCohort',
    digest: INPUT_THREE_FULL, // alias `ccccccc`
    method: 'tally-cohort-window',
    resolver: LINEAGE_RESOLVER_GIT,
    claimedIndependent: true,
    value: 47,
  });
  assert.equal(second.ok, true);
  assert.equal(second.independent, true, 'different producer and different digest: independent, though both read 47');
});

// ---------------------------------------------------------------------------
// Arm 5 — the 5b twin: agreement one way, corroboration the other.
// ---------------------------------------------------------------------------

test('arm 5 (5b twin): shared instrument records AGREEMENT, different instruments record CORROBORATION', () => {
  // Wild half: timeline-note-07 (3/112 vs 10/111 agreement-on-zero) and
  // timeline-note-08 (comparison corroboration-not-agreement) — read, never
  // copied. Constructed half: the detail strings below, declared.
  const shared = recordCorroboration({
    sharedInstrument: true,
    detail: 'constructed twin of 3/112 vs 10/111: same lint helper, same fixture set',
  });
  assert.equal(shared.record, 'agreement');
  assert.match(shared.reason, /never as corroboration/, 'a shared-instrument pair is never recorded as corroboration');
  const separate = recordCorroboration({
    sharedInstrument: false,
    detail: 'constructed twin of the comparison review: different evidence paths',
  });
  assert.equal(separate.record, 'corroboration');
  assert.throws(
    () => recordCorroboration({}),
    /sharedInstrument must be a boolean/,
    'an unjudged pair defaults to nothing, never to corroboration',
  );
});

// ---------------------------------------------------------------------------
// Arm 6 — the assembled review brief carries the question and the rule.
// ---------------------------------------------------------------------------

test('arm 6: the review-brief template carries the corroboration question and the disposition rule verbatim', () => {
  // The question sentence exists because shared-instrument detection needs
  // judgment about derivation paths: the one measured mechanisation
  // false-fired on legitimate shared fixtures (3/112 vs 10/111), so the
  // reviewer must be asked rather than the tree scanned.
  assert.equal(
    CORROBORATION_QUESTION,
    'do these two findings share an instrument — same helper, same fixture, same derivation path — and if so, what besides agreement do they add?',
  );
  // The disposition sentence exists because an answered question without a
  // recording rule still lets "yes, shared" be filed as corroboration; the
  // rule fixes the label — agreement, never corroboration.
  assert.equal(
    CORROBORATION_DISPOSITION,
    'shared instrument is recorded as agreement, never as corroboration; only different instruments corroborate.',
  );
  const section = corroborationSection();
  assert.ok(section.includes(CORROBORATION_QUESTION), 'the section carries the question verbatim');
  assert.ok(section.includes(CORROBORATION_DISPOSITION), 'the section carries the disposition verbatim');
  // The template: read `review.mjs` as text and assert the seam. The brief's
  // own words for this arm are "read the template, assert the text".
  const reviewPath = fileURLToPath(new URL('../lib/review.mjs', import.meta.url));
  const reviewSrc = readFileSync(reviewPath, 'utf8');
  assert.ok(
    reviewSrc.includes("import { corroborationSection } from './lineage.mjs';"),
    'the review module reads the prompt text from the lineage module rather than retyping it',
  );
  const seamAt = reviewSrc.indexOf('export function assembleReviewBrief(');
  assert.ok(seamAt >= 0, 'the assembly seam exists');
  const seam = reviewSrc.slice(seamAt);
  const needle = '${' + 'corroborationSection()}';
  assert.ok(
    seam.includes(needle),
    'the assembled brief interpolates the section — every sealed review carries it',
  );
});

// ---------------------------------------------------------------------------
// Arms 7 and 8 — mutations. Copy-based (P0-1 repair): the tracked
// `loop/lib/lineage.mjs` is NEVER written — mutants are same-directory
// `*.mut-*.mjs` copies observed through cache-busting re-imports, then
// removed with absence asserted.
// ---------------------------------------------------------------------------

const lineageFile = fileURLToPath(new URL('../lib/lineage.mjs', import.meta.url));
const freshLineage = (tag) =>
  import(`${pathToFileURL(lineageFile).href}?round1-mut=${tag}`);

// Both mutations below touch only this round's own new file
// (`loop/lib/lineage.mjs`), which no other file's tests rewrite. The
// mutant is a same-directory copy (the module imports only builtins, so
// no relative import can break), never the tracked file.

let linMutSeq = 0;
function writeLineageMutant(mutatedText) {
  linMutSeq += 1;
  const copyPath = join(
    dirname(lineageFile),
    `lineage.mut-${process.pid}-${linMutSeq}.mjs`,
  );
  writeFileSync(copyPath, mutatedText, 'utf8');
  return copyPath;
}
async function freshLineageCopy(copyPath, tag) {
  return import(`${pathToFileURL(copyPath).href}?round1-mut=${tag}`);
}
function removeLineageCopy(copyPath) {
  rmSync(copyPath, { force: true });
  assert.ok(!existsSync(copyPath), 'mutant copy removed — no residue in the tree');
}

test('no mutant-copy residue: a killed run must be cleaned by hand', () => {
  const leftovers = readdirSync(dirname(lineageFile)).filter((n) => n.includes('.mut-'));
  assert.deepEqual(leftovers, [], `delete these inert copies, then re-run: ${leftovers.join(', ')}`);
});

test('arm 7 (mutation A): lineage attach neutered — producer dropped from the record — and the defect goes green', async () => {
  const pristine = readFileSync(lineageFile, 'utf8');
  const anchor =
    '  if (!checked.ok) return checked;\n' +
    '  const id = `m-${store.seq + 1}`;\n' +
    '  store.seq += 1;\n' +
    '  store.records.push({\n' +
    '    id,\n' +
    '    producer: checked.producer,\n';
  assert.ok(pristine.includes(anchor), 'the mutation anchor is present exactly where recordMeasurement attaches');
  const copyPath = writeLineageMutant(pristine.replace(anchor, anchor.replace('    producer: checked.producer,\n', '    producer: undefined,\n')));
  try {
    const mutated = await freshLineageCopy(copyPath, 'a');
    const store = mutated.createLineageStore({ resolve: bankedResolve, resolver: LINEAGE_RESOLVER_GIT });
    mutated.recordMeasurement(store, {
      producer: PRODUCER_COUNT,
      digest: INPUT_ONE_FULL,
      method: METHOD_V1,
      resolver: LINEAGE_RESOLVER_GIT,
    });
    const verdict = mutated.classifyClaim(store, {
      producer: PRODUCER_COUNT,
      digest: INPUT_ONE_FULL,
      method: METHOD_V2,
      resolver: LINEAGE_RESOLVER_GIT,
      claimedIndependent: true,
    });
    assert.equal(
      verdict.independent,
      true,
      'UNDER MUTATION: the same-producer pair goes green as independent — and that green is the defect',
    );
  } finally {
    removeLineageCopy(copyPath);
  }
  assert.equal(readFileSync(lineageFile, 'utf8'), pristine, 'the tracked file was never written (bytes still pristine)');
  const revived = await freshLineage('a-reverted');
  const store = revived.createLineageStore({ resolve: bankedResolve, resolver: LINEAGE_RESOLVER_GIT });
  revived.recordMeasurement(store, {
    producer: PRODUCER_COUNT,
    digest: INPUT_ONE_FULL,
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
  });
  const verdict = revived.classifyClaim(store, {
    producer: PRODUCER_COUNT,
    digest: INPUT_ONE_FULL,
    method: METHOD_V2,
    resolver: LINEAGE_RESOLVER_GIT,
    claimedIndependent: true,
  });
  assert.equal(verdict.independent, false, 'after revert the pair classifies dependent again');
});

test('arm 8 (mutation B): disposition weakened — shared instrument allowed as corroboration — and the defect goes green', async () => {
  const pristine = readFileSync(lineageFile, 'utf8');
  const anchor = "      record: 'agreement',";
  assert.ok(pristine.includes(anchor), 'the mutation anchor is present in the disposition branch');
  const copyPath = writeLineageMutant(pristine.replace(anchor, "      record: 'corroboration',"));
  try {
    const mutated = await freshLineageCopy(copyPath, 'b');
    const verdict = mutated.recordCorroboration({ sharedInstrument: true, detail: 'twin agreement direction' });
    assert.equal(
      verdict.record,
      'corroboration',
      'UNDER MUTATION: the twin agreement direction goes green as corroboration — and that green is the defect',
    );
  } finally {
    removeLineageCopy(copyPath);
  }
  assert.equal(readFileSync(lineageFile, 'utf8'), pristine, 'the tracked file was never written (bytes still pristine)');
  const revived = await freshLineage('b-reverted');
  assert.equal(
    revived.recordCorroboration({ sharedInstrument: true }).record,
    'agreement',
    'after revert the shared-instrument pair records agreement again',
  );
});

// ---------------------------------------------------------------------------
// Arm 9 — liveness: the wire from writer to check is live.
// ---------------------------------------------------------------------------

test('arm 9 (liveness): a ledger line recorded without lineage refuses at classify time; with lineage it judges', () => {
  const base = {
    id: 'j-20260910-01',
    type: 'entry',
    runner: 'runner-a',
    provider: 'provider-a',
    tier: 'premium',
    mm: 1.5,
    outcome: 'done',
  };
  const bare = makeLedgerLine({ ...base });
  assert.deepEqual(Object.keys(bare), [...LEDGER_FIELDS], 'a line without lineage keeps the exact pinned shape (E-closure: no pin invalidated)');
  assert.ok(!LEDGER_FIELDS.includes('lineage'), 'LEDGER_FIELDS is not extended — old lines stay valid');
  const store = testStore();
  const refused = classifyClaim(store, bare);
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'lineage-missing', 'the wire ends at the check with the reason named');
  const lined = makeLedgerLine({
    ...base,
    lineage: {
      producer: PRODUCER_COUNT,
      digest: INPUT_ONE_FULL,
      method: METHOD_V1,
      resolver: LINEAGE_RESOLVER_GIT,
    },
  });
  assert.deepEqual(lined.lineage, {
    producer: PRODUCER_COUNT,
    digest: INPUT_ONE_FULL,
    method: METHOD_V1,
    resolver: LINEAGE_RESOLVER_GIT,
  });
  const judged = classifyClaim(store, lined);
  assert.equal(judged.ok, true);
  assert.equal(judged.independent, true, 'first claim over fresh bytes: independent — writer and check meet');
});

// ---------------------------------------------------------------------------
// Arms 10–10c — the first production producer (item 5 follow-up).
// ---------------------------------------------------------------------------

test('arm 10 (first producer): a resolvable merge-base yields the outcome triple', () => {
  const triple = selectOutcomeLineage(
    { mergeBaseSha: INPUT_ONE_FULL, jobType: 'entry' },
    bankedResolve,
  );
  assert.deepEqual(triple, {
    producer: 'loop/run.mjs:recordOutcome:entry',
    digest: INPUT_ONE_FULL.toLowerCase(),
    method: 'merge-base-outcome',
    resolver: LINEAGE_RESOLVER_GIT,
  });
});

test('arm 10b: an unresolvable or missing base yields no triple — the ledger path narrows nothing', () => {
  assert.equal(
    selectOutcomeLineage({ mergeBaseSha: '03e2207', jobType: 'entry' }, bankedResolve),
    undefined,
    'banked-unresolvable base selects nothing',
  );
  assert.equal(selectOutcomeLineage({ jobType: 'entry' }, bankedResolve), undefined, 'missing sha selects nothing');
  assert.equal(selectOutcomeLineage({ mergeBaseSha: INPUT_ONE_FULL }, bankedResolve), undefined, 'missing type selects nothing');
  assert.equal(selectOutcomeLineage({ mergeBaseSha: INPUT_ONE_FULL, jobType: 'entry' }), undefined, 'missing resolver selects nothing');
});

test('arm 10c (judgment): two outcomes over one base — the second is consistencyOf the first', () => {
  const store = testStore();
  const triple = selectOutcomeLineage({ mergeBaseSha: INPUT_ONE_FULL, jobType: 'entry' }, bankedResolve);
  const first = classifyClaim(store, { lineage: triple });
  assert.equal(first.ok, true);
  assert.equal(first.independent, true, 'first outcome over fresh base: independent');
  const second = classifyClaim(store, { lineage: triple });
  assert.equal(second.ok, true);
  assert.equal(second.independent, false, 'same producer AND same digest is consistency, whatever the jobs differ in');
  assert.equal(second.consistencyOf, first.id, 'consistency points at the first outcome');
  assert.equal(store.records.length, 2, 'both records present — the downgrade records, never deletes');
});
