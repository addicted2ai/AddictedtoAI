/**
 * brief-reconcile.test.mjs — wisdom item 2b: no requirement left the brief.
 *
 * The wild control is `addictedtoai-x2jl`, whose description carries three
 * numbered requirements and a fourth imperative written as prose, appended
 * to item 3 with no blank line. A reconciler that reads only the enumerated
 * list loses the fourth without clipping, summarizing or arguing anything
 * away — it never looked like an item. HALF WILD (the x2jl requirement
 * structure, transcribed from the bead nobody wrote for this purpose) AND
 * HALF CONSTRUCTED (the fixture brief, which does not exist anywhere).
 *
 * Arms, each with its baseline colour recorded before any mutation:
 *   arm 1  — wild: brief carrying the three numbered requirements but not
 *            the prose fourth is REFUSED, naming the missing imperative.
 *   arm 1b — the refusal fires inside `assembleBrief` before the return
 *            (hence before `run.mjs` writes `.job/brief.md`): proven live
 *            by dropping the detail embed, which must make assembly throw.
 *   arm 2  — the same brief with the fourth accounted for PASSES.
 *   arm 3  — a reworded imperative still counts as carried (not substring
 *            equality).
 *   arm 4  — a source with no imperatives PASSES by documented choice.
 *   mutation A — reconcile against the enumerated list only: arm 1 goes
 *            GREEN, and that green is the defect. Shown, not fixed.
 *   mutation B — the reconcile call moved after the return (dead code):
 *            the harness mirroring production order (assemble, write to a
 *            temp file only on success) writes the file, so the arm goes
 *            RED. Mutant observed through a same-directory copy, copy
 *            removed with absence asserted.
 *
 * Every property above is enforced by an arm in this file, so a reviewer
 * finds each by lookup. Counts are read from the runner's own summary.
 * Copy-based mutation (P0-1 repair): no block below writes the tracked
 * `loop/lib/brief.mjs` — the mutant is a same-directory copy (so the
 * module's relative imports still resolve) under a `*.mjs.mut-*` name no
 * sweep or test glob matches, observed through a cache-busting fresh
 * import, and removed afterwards with its absence asserted. A kill
 * mid-window can only leave an inert, visibly-named copy behind — the
 * tracked file is never inconsistent for a moment.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  assembleBrief,
  briefCarries,
  briefSourceText,
  extractImperatives,
  reconcileBriefImperatives,
} from '../lib/brief.mjs';
import { makeRepo } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const BRIEF_LIB = resolve(HERE, '..', 'lib', 'brief.mjs');

test('no mutant-copy residue: a killed run must be cleaned by hand', () => {
  const leftovers = readdirSync(resolve(HERE, '..', 'lib')).filter((n) => n.includes('.mut-'));
  assert.deepEqual(leftovers, [], `delete these inert copies, then re-run: ${leftovers.join(', ')}`);
});

// The x2jl requirement structure, transcribed (not paraphrased) from
// `bd show addictedtoai-x2jl`: three numbered requirements, then the prose
// fourth glued to item 3 with no blank line — the layout the classifier
// must survive.
const X2JL_SOURCE = [
  'WHAT HAPPENED: job j-20260907-11 lost its gates to the machine.',
  '1. classify it as such on the ledger line with a named cause, do not consume the retry, do not count it toward the breaker.',
  '2. the records step should wait and retry the git add a few seconds a few times before declaring RECORDS NOT COMMITTED.',
  '3. a job that loses its gates this way should be re-gated on the next run without re-authoring.',
  'Cause of the process-creation failures themselves is OPEN; record the next instance with the free-memory figure at the moment it happens (the loop could print os.freemem() beside any spawn failure for exactly this).',
].join('\n');

const FOURTH =
  'record the next instance with the free-memory figure at the moment it happens (the loop could print os.freemem() beside any spawn failure for exactly this)';

function briefCarryingThree() {
  return [
    '# Fixture brief',
    '',
    '1. classify it as such on the ledger line with a named cause, do not consume the retry, do not count it toward the breaker.',
    '2. the records step should wait and retry the git add a few seconds a few times before declaring RECORDS NOT COMMITTED.',
    '3. a job that loses its gates this way should be re-gated on the next run without re-authoring.',
    '',
    'The cause of the failures is still unknown.',
  ].join('\n');
}

function stubExcerpts() {
  return () => ({ text: '', truncated: false });
}

function assembleFor(t, job, assemble = assembleBrief) {
  const ctx = makeRepo();
  t.after(() => rmSync(ctx.repoRoot, { recursive: true, force: true }));
  return assemble(ctx, {
    jobId: 'j-20260910-2b',
    job,
    branch: 'job/j-20260910-2b',
    capMinutes: 30,
  }, stubExcerpts());
}

let freshSeq = 0;
/**
 * Node caches modules, so importing the tracked path always measures the
 * shipped code. Mutants are observed through same-directory COPIES:
 * `writeMutantCopy` writes the mutant text beside the tracked file (never
 * into it) under a name nothing collects or sweeps; `freshCopy` imports
 * the copy under a cache-busting query; `removeCopy` deletes it and
 * asserts its absence, so residue is loud, not silent.
 */
let mutSeq = 0;
function writeMutantCopy(mutatedText) {
  // Ends in .mjs (the loader requires a known extension) with a `.mut-`
  // infix no sweep collects: figure-provenance skips `.mut-` names, test
  // discovery matches `*.test.mjs` only.
  mutSeq += 1;
  const copyPath = join(dirname(BRIEF_LIB), `brief.mut-${process.pid}-${mutSeq}.mjs`);
  writeFileSync(copyPath, mutatedText, 'utf8');
  return copyPath;
}
async function freshCopy(copyPath) {
  freshSeq += 1;
  return import(`${pathToFileURL(copyPath).href}?fresh=${freshSeq}`);
}
function removeCopy(copyPath) {
  rmSync(copyPath, { force: true });
  assert.ok(!existsSync(copyPath), 'mutant copy removed — no residue in the tree');
}

function freshDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-2b-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/**
 * Production order, mirrored: assemble, and write the result to a file
 * only when assembly did not refuse. Returns true when a file was written.
 */
function guardedAssembleAndWrite(t, job, assemble = assembleBrief) {
  const dir = freshDir(t);
  const file = join(dir, 'brief.md');
  let text = null;
  try {
    text = assembleFor(t, job, assemble);
  } catch {
    text = null;
  }
  if (text !== null) writeFileSync(file, text, 'utf8');
  return existsSync(file);
}

test('arm 1 — wild: a brief carrying the three numbered requirements but not the prose fourth is refused, naming it', () => {
  const missing = reconcileBriefImperatives(X2JL_SOURCE, briefCarryingThree());
  assert.equal(missing.length, 1, `exactly the fourth is missing, got: ${JSON.stringify(missing)}`);
  assert.ok(
    missing[0].toLowerCase().includes('free-memory figure'),
    `the refusal names the fourth imperative, got: ${missing[0].slice(0, 120)}`,
  );
});

test('arm 1b — the refusal fires at assembly, before anything is written', async (t) => {
  const job = {
    type: 'repair',
    source: 'queue',
    title: 'Classify spawn failures and re-gate without re-authoring',
    detail: X2JL_SOURCE,
  };
  // Production embeds title+detail verbatim, so a faithful assembly
  // passes. The wiring (throw before return, hence before run.mjs writes
  // `.job/brief.md`) is proven live by dropping the detail embed: the
  // assembly must then refuse, naming the detail's imperatives.
  const faithful = assembleFor(t, job);
  assert.ok(faithful.length > 0, 'a faithful assembly returns text');
  assert.ok(faithful.includes('free-memory figure'), 'detail carried verbatim');
  {
    const original = readFileSync(BRIEF_LIB, 'utf8');
    const anchor = '${job.detail && job.detail !== job.title ? `\\n${job.detail}\\n` : \'\'}';
    assert.ok(original.includes('job.detail && job.detail !== job.title'), 'detail-embed anchor present');
    const dropped = original.replace(
      'job.detail && job.detail !== job.title ? `\\n${job.detail}\\n` : \'\'',
      'job.detail && job.detail !== job.title ? \'\' : \'\'',
    );
    assert.notEqual(dropped, original);
    const copyPath = writeMutantCopy(dropped);
    try {
      const fresh = await freshCopy(copyPath);
      assert.throws(
        () => assembleFor(t, job, fresh.assembleBrief),
        /brief refuses/,
        'dropping the detail embed makes assembly refuse — the throw is reachable, not dead code',
      );
    } finally {
      removeCopy(copyPath);
    }
    assert.equal(readFileSync(BRIEF_LIB, 'utf8'), original, 'the tracked file was never written');
  }
  assert.equal(guardedAssembleAndWrite(t, job), true, 'faithful pair writes');
});

test('arm 2 — the same brief with the fourth accounted for passes', () => {
  const missing = reconcileBriefImperatives(X2JL_SOURCE, `${briefCarryingThree()}\n\n${FOURTH}\n`);
  assert.deepEqual(missing, [], 'nothing missing once the fourth is carried');
});

test('arm 3 — an imperative reworded rather than quoted still counts as carried', () => {
  const reworded = 'Record the free-memory figure with the next spawn failure instance so the open cause investigation gets its moment.';
  assert.equal(
    briefCarries(`${briefCarryingThree()}\n\n${reworded}\n`, FOURTH),
    true,
    'rewording that keeps the content words still carries',
  );
  assert.equal(
    briefCarries(briefCarryingThree(), FOURTH),
    false,
    'the three-only brief does not carry the fourth',
  );
});

test('arm 4 — a source with no imperatives passes by documented choice', () => {
  const source = 'Yesterday the suite was green. The todo list mentions cleanup some day.';
  assert.deepEqual(extractImperatives(source), [], 'no imperatives extracted');
  assert.deepEqual(reconcileBriefImperatives(source, 'anything'), [], 'passes rather than refusing the class');
});

test('mutation A — reconciling against the enumerated list only turns the wild arm green, and that green is the defect', () => {
  const listedOnly = (sourceText) =>
    sourceText.split(/\r?\n/).filter((line) => /^\s*(?:\d+[.)]|[-*])\s+/.test(line));
  const missing = listedOnly(X2JL_SOURCE).filter((imp) => !briefCarries(briefCarryingThree(), imp));
  assert.deepEqual(missing, [], 'list-only reconciliation reports nothing missing — the defect, shown');
  assert.equal(
    reconcileBriefImperatives(X2JL_SOURCE, briefCarryingThree()).length,
    1,
    'the real reconciler still sees the fourth on the same input',
  );
});

test('mutation B — the reconcile call moved after the return never fires, and the order-harness catches it', async (t) => {
  const job = {
    type: 'repair',
    source: 'queue',
    title: 'Classify spawn failures',
    detail: X2JL_SOURCE,
  };
  const original = await (async () => {
    const original = readFileSync(BRIEF_LIB, 'utf8');
    const anchor = '  const missing = reconcileBriefImperatives(briefSourceText(job), text);';
    assert.ok(original.includes(anchor), 'mutation anchor present');
    // Dead refusal: the whole check block becomes dead code, so nothing can
    // refuse. (Neutralizing only the `const` line would leave the `if`
    // below referencing it — a crash, not the silent pass this mutation
    // must demonstrate.)
    const checkStart = original.indexOf('  // 2b refusal');
    const checkEnd = original.indexOf('  return text;\n}', original.indexOf(anchor));
    assert.ok(checkStart >= 0 && checkEnd > checkStart, 'check block bounds found');
    const deadCheck = original.slice(0, checkStart)
      + '  void reconcileBriefImperatives; // mutation B: refusal dead\n'
      + original.slice(checkEnd);
    // The drop makes the refusal reachable (arm 1b); under the dead check
    // the same dropped tree assembles silently. Both mutations are observed
    // through the same copy, which is removed with absence asserted
    // afterwards.
    const dropped = deadCheck.replace(
      'job.detail && job.detail !== job.title ? `\\n${job.detail}\\n` : \'\'',
      'job.detail && job.detail !== job.title ? \'\' : \'\'',
    );
    assert.notEqual(dropped, deadCheck);
    const copyPath = writeMutantCopy(dropped);
    try {
      const fresh = await freshCopy(copyPath);
      const dir = freshDir(t);
      const file = join(dir, 'brief.md');
      // Mirrored production order: assemble, write only on success.
      let text = null;
      try {
        text = assembleFor(t, job, fresh.assembleBrief);
      } catch {
        text = null;
      }
      if (text !== null) writeFileSync(file, text, 'utf8');
      assert.equal(existsSync(file), true, 'dead refusal lets the incomplete brief through to a write — the defect, shown');
      assert.ok(!readFileSync(file, 'utf8').includes('free-memory figure'), 'the written brief lacks the fourth');
    } finally {
      removeCopy(copyPath);
    }
    assert.equal(readFileSync(BRIEF_LIB, 'utf8'), original, 'the tracked file was never written');
    return original;
  })();
  // Correct order on the same pair refuses first, so nothing is written.
  const missing = reconcileBriefImperatives(X2JL_SOURCE, briefCarryingThree());
  assert.ok(missing.length > 0);
  const dir = freshDir(t);
  const file = join(dir, 'brief.md');
  try {
    if (missing.length > 0) throw new Error(`brief refuses: ${missing[0].slice(0, 160)}`);
    writeFileSync(file, briefCarryingThree(), 'utf8');
  } catch {
    // refused before the write
  }
  assert.equal(existsSync(file), false, 'correct order writes nothing on refusal');
});
