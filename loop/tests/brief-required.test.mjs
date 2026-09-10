/**
 * brief-required.test.mjs — wisdom item 3, round 1 of 2: the required
 * text, carried completely and uncontradicted.
 *
 * Item 2b refuses a brief that drops an imperative. This refuses the
 * three quieter deaths: MISSING (the block never arrives), TRUNCATED
 * (it arrives cut off mid-sentence), CONTRADICTED (it arrives negated).
 * Strictness here is every-content-word, deliberately NOT 2b's loose
 * token coverage: two properties, two instruments, one shared splitter
 * at most.
 *
 * CONTROL, CONSTRUCTED AND STATED: there is no wild generated-brief
 * instance of this class on record (B2/E/F round-1 briefs quoted their
 * tasks faithfully), so the authority fixture below is constructed: a
 * bead-shaped source with an ACCEPTANCE block after a marked boundary.
 * File-list closure (B2/E wild catch, F wild pass) follows in round 2
 * and is out of scope here beyond this sentence.
 *
 * Arms, each with its baseline colour recorded before any mutation:
 *   arm 1 — brief cut before the boundary: REFUSED as missing, naming
 *            the block.
 *   arm 2 — brief cut mid-sentence inside ACCEPTANCE: REFUSED as
 *            truncated; the complete brief PASSES.
 *   arm 3 — brief negating a required sentence: REFUSED as
 *            contradicted, naming the sentence.
 *   arm 4 — required text with no content sentences PASSES by
 *            documented choice.
 *   mutation A — completeness reduced to any-token presence: the
 *            truncated arm goes GREEN, and that green is the defect.
 *   mutation B — the reconcile call moved dead (whole block): the
 *            order harness (assemble, write to temp only on success,
 *            against a detail-dropped assembly) writes the file under
 *            the mutation and never under the correct order.
 *   liveness — dropping the detail embed makes assembly throw,
 *            proving the wire live rather than dead code.
 *
 * Isolation note: assembly-level arms use declarative required detail
 * (no list items, modals or verb-first sentences) so 2b's reconciler
 * stays silent and every refusal below is 3a's. Counts from the
 * runner's own summary. Node caches modules: mutation observations
 * re-import under a cache-busting query — measuring the old code and
 * calling it the mutation is the failure round 2b recorded.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assembleBrief, briefSourceText, reconcileRequiredCoverage } from '../lib/brief.mjs';
import { makeRepo } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const BRIEF_LIB = resolve(HERE, '..', 'lib', 'brief.mjs');

// Constructed authority fixture: three numbered requirements, then the
// ACCEPTANCE block after a marked truncation boundary.
const AUTHORITY = [
  'WHAT HAPPENED: the queue floor starves the scout.',
  '1. restore the queue floor before routing.',
  '2. record every auto-deferral with its reason.',
  '3. refuse unroutable candidates loudly rather than skipping them silently.',
  '--- ACCEPTANCE (everything below this line is the standard) ---',
  'ACCEPTANCE: the floor is restored, every auto-deferral carries a reason, and unroutable candidates are refused loudly.',
].join('\n');

const ACCEPTANCE =
  'ACCEPTANCE: the floor is restored, every auto-deferral carries a reason, and unroutable candidates are refused loudly.';

const BOUNDARY = '--- ACCEPTANCE (everything below this line is the standard) ---';

function beforeBoundary() {
  return AUTHORITY.slice(0, AUTHORITY.indexOf(BOUNDARY)).trim();
}

function stubExcerpts() {
  return () => ({ text: '', truncated: false });
}

function assembleFor(t, job, assemble = assembleBrief) {
  const ctx = makeRepo();
  t.after(() => rmSync(ctx.repoRoot, { recursive: true, force: true }));
  return assemble(ctx, {
    jobId: 'j-20260910-3a',
    job,
    branch: 'job/j-20260910-3a',
    capMinutes: 30,
  }, stubExcerpts());
}

function freshDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-3a-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

let freshSeq = 0;
async function freshBriefLib() {
  freshSeq += 1;
  return import(`../lib/brief.mjs?fresh=${freshSeq}`);
}

// Declarative required detail: content sentences with no list shape,
// no modal and no verb-first opening, so 2b stays silent and every
// refusal below is 3a's.
const DECLARATIVE_DETAIL =
  'The floor value is 62 kilobytes. The reason field is mandatory for every deferral.';

function declarativeJob() {
  return { type: 'repair', source: 'queue', title: 'Restore the queue floor', detail: DECLARATIVE_DETAIL };
}

test('arm 1 — a brief cut before the boundary is refused as missing, naming the block', () => {
  const r = reconcileRequiredCoverage(AUTHORITY, beforeBoundary());
  assert.ok(r.missing.length >= 1, `ACCEPTANCE missing, got: ${JSON.stringify(r)}`);
  assert.ok(
    r.missing.some((s) => s.includes('ACCEPTANCE')),
    `the refusal names the block: ${r.missing.map((s) => s.slice(0, 80)).join(' | ')}`,
  );
  assert.deepEqual(r.truncated, []);
  assert.deepEqual(r.contradicted, []);
});

test('arm 2 — a mid-sentence cut is refused as truncated; the complete block passes', () => {
  const cut = `${beforeBoundary()}\n\nACCEPTANCE: the floor is restored, every auto`;
  const r = reconcileRequiredCoverage(AUTHORITY, cut);
  assert.equal(r.missing.length, 0, `nothing wholly absent: ${JSON.stringify(r.missing)}`);
  // Two required lines arrive cut: the boundary marker (only its first
  // word survives) and the ACCEPTANCE sentence itself. Both refusals
  // are correct — the cut genuinely truncates both lines.
  assert.equal(r.truncated.length, 2, `marker line + acceptance sentence: ${JSON.stringify(r.truncated)}`);
  assert.ok(r.truncated.some((s) => s.startsWith('ACCEPTANCE:')), 'names the cut sentence');
  const whole = reconcileRequiredCoverage(AUTHORITY, AUTHORITY);
  assert.deepEqual(whole, { missing: [], truncated: [], contradicted: [] }, 'complete passes');
});

test('arm 3 — a brief negating a required sentence is refused as contradicted', () => {
  const negated = `${AUTHORITY}\n\nThe author will not restore the floor and no reason will be recorded.`;
  const r = reconcileRequiredCoverage(AUTHORITY, negated);
  assert.ok(r.contradicted.length >= 1, `contradiction found: ${JSON.stringify(r)}`);
  assert.deepEqual(r.missing, [], 'nothing missing — the words are there, the meaning reversed');
});

test('arm 3b — contracted negations are detected (no dead arms in the negation list)', () => {
  const negated = `${AUTHORITY}\n\nThe team wont record the reason and wont restore the floor.`;
  const r = reconcileRequiredCoverage(AUTHORITY, negated);
  assert.ok(r.contradicted.length >= 1, `contracted negation found: ${JSON.stringify(r)}`);
});

test('arm 4 — required text with no content sentences passes by documented choice', () => {
  const r = reconcileRequiredCoverage('   \n  ', 'anything at all');
  assert.deepEqual(r, { missing: [], truncated: [], contradicted: [] }, 'passes, asserted');
});

test('arm 5 — contradiction is detected but NOT wired to the dispatch refusal', (t) => {
  // The template's own scope sentence negates work vocabulary, so a
  // whole-brief contradiction throw false-fires on ordinary titles
  // (35 red on the existing suite, measured). The detector ships
  // tested; the dispatch wires missing+truncated only. This arm pins
  // the non-wiring: a title sharing vocabulary with a template
  // negation assembles fine.
  const job = {
    type: 'repair',
    source: 'queue',
    title: 'Fix the stated outcome handling',
    detail: 'The stated outcome needs handling.',
  };
  const text = assembleFor(t, job);
  assert.ok(text.includes('the stated outcome'), 'assembles despite template negations nearby');
  const r = reconcileRequiredCoverage(briefSourceText(job), text);
  assert.deepEqual(r.missing, [], 'nothing missing');
  assert.deepEqual(r.truncated, [], 'nothing truncated');
  // The detector still sees the template-overlap both the review and
  // this arm name: pin it non-empty so the non-wiring is a measured
  // decision about a live detector, never silence about a dead one.
  assert.ok(
    r.contradicted.length >= 1,
    `detector live at assembly level: ${JSON.stringify(r.contradicted.map((s) => s.slice(0, 60)))}`,
  );
  assert.ok(
    r.contradicted.some((s) => s.includes('stated outcome')),
    'the flagged sentences are the title-overlapping ones',
  );
});

test('mutation A — completeness reduced to any-token presence turns the truncated arm green', async () => {
  const cut = `${beforeBoundary()}\n\nACCEPTANCE: the floor is restored, every auto`;
  const original = readFileSync(BRIEF_LIB, 'utf8');
  const anchor = '    if (hits.length === sig.length) continue;';
  assert.ok(original.includes(anchor), 'mutation anchor present');
  // Any-token presence: one shared word carries the sentence. The cut
  // shares vocabulary with the items, so it passes — and that green is
  // the defect. A simulation would prove nothing about the wire; this
  // mutates the file, observes through a fresh import (Node caches
  // modules — the static binding would measure the old code), and
  // reverts byte-identical.
  const mutated = original.replace(anchor, '    if (hits.length > 0) continue;');
  assert.notEqual(mutated, original);
  writeFileSync(BRIEF_LIB, mutated, 'utf8');
  try {
    const fresh = await freshBriefLib();
    const r = fresh.reconcileRequiredCoverage(AUTHORITY, cut);
    assert.deepEqual(r.truncated, [], 'any-token presence passes the truncation — the defect, shown on the wire');
  } finally {
    writeFileSync(BRIEF_LIB, original, 'utf8');
  }
  assert.equal(readFileSync(BRIEF_LIB, 'utf8'), original, 'the revert is byte-identical');
  assert.equal(
    reconcileRequiredCoverage(AUTHORITY, cut).truncated.length,
    2,
    'the real check still refuses the same input (marker line + sentence)',
  );
});

test('mutation B — the reconcile call moved dead lets the incomplete brief through to a write', async (t) => {
  const original = readFileSync(BRIEF_LIB, 'utf8');
  const anchor = '  const coverage = reconcileRequiredCoverage(briefSourceText(job), text);';
  assert.ok(original.includes(anchor), 'mutation anchor present');
  const checkStart = original.indexOf('  // 3a refusal');
  const checkEnd = original.indexOf('  return text;\n}', original.indexOf(anchor));
  assert.ok(checkStart >= 0 && checkEnd > checkStart, 'check block bounds found');
  const deadCheck = original.slice(0, checkStart)
    + '  void reconcileRequiredCoverage; // mutation B: refusal dead\n'
    + original.slice(checkEnd);
  // The drop makes the refusal reachable; the declarative detail keeps
  // 2b silent so only 3a's wiring is observed.
  const dropped = deadCheck.replace(
    'job.detail && job.detail !== job.title ? `\\n${job.detail}\\n` : \'\'',
    'job.detail && job.detail !== job.title ? \'\' : \'\'',
  );
  assert.notEqual(dropped, deadCheck);
  writeFileSync(BRIEF_LIB, dropped, 'utf8');
  try {
    const fresh = await freshBriefLib();
    const dir = freshDir(t);
    const file = join(dir, 'brief.md');
    let text = null;
    try {
      text = assembleFor(t, declarativeJob(), fresh.assembleBrief);
    } catch {
      text = null;
    }
    if (text !== null) writeFileSync(file, text, 'utf8');
    assert.equal(existsSync(file), true, 'dead refusal lets the incomplete brief through — the defect, shown');
  } finally {
    writeFileSync(BRIEF_LIB, original, 'utf8');
  }
  assert.equal(readFileSync(BRIEF_LIB, 'utf8'), original, 'the revert is byte-identical');
  // Correct order on the IDENTICAL dropped-detail pair: live assembly
  // refuses first, so nothing is written. This calls the real
  // `assembleBrief`, not a hand-rolled mirror — the mirror alone could
  // pass while the wire it claims to model stays dead.
  const droppedOnly = original.replace(
    'job.detail && job.detail !== job.title ? `\\n${job.detail}\\n` : \'\'',
    'job.detail && job.detail !== job.title ? \'\' : \'\'',
  );
  assert.notEqual(droppedOnly, original);
  writeFileSync(BRIEF_LIB, droppedOnly, 'utf8');
  try {
    const live = await freshBriefLib();
    const dir2 = freshDir(t);
    const file2 = join(dir2, 'brief.md');
    let text2 = null;
    try {
      text2 = assembleFor(t, declarativeJob(), live.assembleBrief);
    } catch {
      text2 = null;
    }
    if (text2 !== null) writeFileSync(file2, text2, 'utf8');
    assert.equal(text2, null, 'live assembly refuses the same dropped-detail pair the dead check let through');
    assert.equal(existsSync(file2), false, 'correct order writes nothing on refusal');
  } finally {
    writeFileSync(BRIEF_LIB, original, 'utf8');
  }
  assert.equal(readFileSync(BRIEF_LIB, 'utf8'), original, 'the revert is byte-identical');
});

test('liveness — dropping the detail embed makes assembly throw', async (t) => {
  const job = declarativeJob();
  const faithful = assembleFor(t, job);
  assert.ok(faithful.length > 0, 'faithful assembly returns text');
  const original = readFileSync(BRIEF_LIB, 'utf8');
  const dropped = original.replace(
    'job.detail && job.detail !== job.title ? `\\n${job.detail}\\n` : \'\'',
    'job.detail && job.detail !== job.title ? \'\' : \'\'',
  );
  assert.notEqual(dropped, original);
  writeFileSync(BRIEF_LIB, dropped, 'utf8');
  try {
    const fresh = await freshBriefLib();
    assert.throws(
      () => assembleFor(t, job, fresh.assembleBrief),
      /brief refuses/,
      'dropping the detail embed makes assembly refuse — the wire is live',
    );
  } finally {
    writeFileSync(BRIEF_LIB, original, 'utf8');
  }
  assert.equal(readFileSync(BRIEF_LIB, 'utf8'), original, 'the revert is byte-identical');
});
