/**
 * FULL-MEM-LOG.md is the SOLE copy of the project's institutional memory.
 *
 * On 2026-09-07 the 58-memory beads corpus was distilled into one index memory
 * (`distilled-memory-index`) and the originals were `bd forget`-ten. They now
 * survive in exactly one place: FULL-MEM-LOG.md, one H2 heading per old memory
 * key, verbatim. Roughly 110 KB of measured facts — the ones that cost real
 * incidents to learn — with no second copy anywhere.
 *
 * Nothing asserted it stayed intact, so a truncation, a bad merge, a
 * heavy-handed sed, or a `git checkout` of the wrong revision would remove it
 * silently. Every gate would stay green, because no gate reads this file.
 * That is the same shape as the defect that produced most of its contents: a
 * property nothing measures is a property that will eventually be false.
 *
 * WHAT THIS ASSERTS, and why each clause is here rather than a rounder number:
 *
 *  - EVERY KEY IN data/mem-log-manifest.txt IS STILL PRESENT. The manifest is
 *    the list of headings as of the distillation. Losing any single memory
 *    fails BY NAME, which is the difference between "something shrank" and
 *    "you deleted `worktrees-and-junctions`".
 *  - ADDITIONS ARE ALLOWED, deletions are not. The manifest is a subset check,
 *    so appending a memory does not fail the build; it just has to be added to
 *    the manifest too, which is the deliberate friction.
 *  - THE MANIFEST ITSELF HAS A FLOOR. A guard whose expectation file can
 *    silently empty reports clean on an empty world: zero expected entries
 *    produce zero failures, and the check passes hardest exactly when it has
 *    lost its ability to check anything.
 *
 * THE DIRECTION OF STRICTNESS IS CHOSEN PER CLAUSE, and the two directions here
 * pull opposite ways on purpose. Inheriting "be strict" without the reason gets
 * one of them wrong:
 *
 *  - A FLOOR where additions are legitimate and only LOSS is fatal — the
 *    manifest subset check, and the size clause. An EXACT count here would fail
 *    on every new memory and be loosened within the week, which is how a guard
 *    dies.
 *  - An EXACT assertion where any deviation means THE PREMISE IS WRONG. A
 *    sibling script asserting "exactly 58 originals" caught itself being reused
 *    on a one-key pass it was not written for; a floor would have passed it
 *    silently.
 *
 * DO NOT "TIGHTEN" THE 50 KB SIZE FLOOR TO THE FILE'S CURRENT SIZE. It is
 * deliberately far below it (the file was ~117 KB when this was written and
 * grew three times the same night). Its only job is catastrophic truncation;
 * targeted deletion is caught by the per-key and per-body clauses above, which
 * are the exact ones. This is a LAYERED guard, not a loose one — the size
 * clause is not what stands between a shrinking file and a green run. Raising
 * it to track the file would make every legitimate append fail, which is
 * precisely the wrong-direction-of-strictness mistake.
 *  - NO DUPLICATE HEADINGS, because two sections under one key means a later
 *    reader gets whichever it finds first and never knows there was another.
 *  - SUBSTANCE, NOT JUST HEADINGS. A file of 58 empty headings would satisfy a
 *    naive presence check. Each section must carry real body text.
 *
 * `## Index` is excluded throughout: it is the file's table of contents, not a
 * memory. Counting it is how a naive check reports 59 memories where there are
 * 58 — measured while writing this test.
 *
 * VERIFIED IN BOTH DIRECTIONS, because a guard that can only fail correctly is
 * only half-verified. Each clause was shown to have a reachable red path
 * (delete a memory, truncate the file, duplicate a heading, empty a body — each
 * caught by its INTENDED clause, not incidentally). Then six LEGITIMATE edits
 * were shown to stay green: appending a new memory with and without a manifest
 * entry, rewording a body entirely, GROWING a section by appending a new
 * instance to it, moving a whole section to the end of the file, and editing
 * the Index. That second half matters more than it looks — a guard that fires
 * on ordinary edits gets deleted by the first person it obstructs, and the
 * "grow a section" case is the one this file sees most often.
 *
 * Related: addictedtoai-zuoo. This file reached origin/main inside another
 * session's publish step, having only ever been committed locally, because
 * pulse/lib/publish.mjs pushes `origin main` branch-wide and unconditionally.
 * It was harmless markdown that time.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(ROOT, 'FULL-MEM-LOG.md');
const MANIFEST = join(ROOT, 'data', 'mem-log-manifest.txt');

/** Heading text for every H2 except the table of contents. */
function memoryHeadings(text) {
  return text
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim())
    .filter((h) => h !== 'Index');
}

test('FULL-MEM-LOG.md exists and is not empty', () => {
  assert.ok(existsSync(LOG), 'FULL-MEM-LOG.md is the only copy of the memory corpus');
  const text = readFileSync(LOG, 'utf8');
  assert.ok(
    text.length > 50_000,
    `FULL-MEM-LOG.md is ${text.length} bytes; it held ~117KB at the distillation. `
    + 'A large shrink means memories were lost, not edited.',
  );
});

test('every memory named in the manifest is still in the log', () => {
  assert.ok(existsSync(MANIFEST), 'data/mem-log-manifest.txt names what must be present');
  const expected = readFileSync(MANIFEST, 'utf8')
    .split('\n').map((s) => s.trim()).filter(Boolean);
  assert.ok(expected.length >= 58, `the manifest itself lost entries: ${expected.length}`);

  const present = new Set(memoryHeadings(readFileSync(LOG, 'utf8')));
  const missing = expected.filter((k) => !present.has(k));

  assert.deepEqual(
    missing, [],
    `FULL-MEM-LOG.md no longer contains ${missing.length} memory/memories that the `
    + 'manifest says it must. This file is the ONLY copy: recover them from git '
    + '(8d8f798 recorded the corpus) rather than editing the manifest to match.',
  );
});

test('no memory key appears twice', () => {
  const headings = memoryHeadings(readFileSync(LOG, 'utf8'));
  const seen = new Set();
  const dupes = [];
  for (const h of headings) {
    if (seen.has(h)) dupes.push(h);
    seen.add(h);
  }
  assert.deepEqual(dupes, [], 'a duplicated key hides one of its two bodies from every reader');
});

test('every memory section carries a body, not just a heading', () => {
  const text = readFileSync(LOG, 'utf8');
  const lines = text.split('\n');
  const empty = [];

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('## ')) continue;
    const key = lines[i].slice(3).trim();
    if (key === 'Index') continue;

    let body = 0;
    for (let j = i + 1; j < lines.length && !lines[j].startsWith('## '); j++) {
      if (lines[j].trim()) body += lines[j].trim().length;
    }
    if (body < 80) empty.push(`${key} (${body} chars)`);
  }

  assert.deepEqual(
    empty, [],
    'these sections are headings with no substance behind them; a presence check '
    + 'alone would have passed on them',
  );
});
