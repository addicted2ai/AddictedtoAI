// brief-closure.test.mjs — arms for the Files-list closure instrument.
// No shared lock held: file mutations touch only the new instrument file and tests in this file run one after another.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const WORKTREE = 'D:/addictedtoai-worktrees/item3-closure';
const INSTRUMENT = 'D:/addictedtoai-worktrees/item3-closure/scripts/brief-closure.mjs';
const MAIN = 'D:/AddictedtoAI';
const B2_BRIEF = `${MAIN}/openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-B2/round1-agent-brief.md`;
const E_BRIEF = `${MAIN}/openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-E/round1-agent-brief.md`;
const F_BRIEF = `${MAIN}/openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-F/round1-agent-brief.md`;
const B2_BASE = 'de400f7';
const B2_TIP = '5fb9b2b';
const E_BASE = '9c1d980';
const E_TIP = 'db10eac';
const F_BASE = 'ddbfd52';
const F_TIP = 'df448970490c7fe496317182417364a281c216ed';

function runCli({ brief, base, tip, verbose = false }) {
  const args = [INSTRUMENT, '--brief', brief, '--base', base, '--root', WORKTREE];
  if (tip) args.push('--tip', tip);
  if (verbose) args.push('--verbose');
  try {
    const out = execFileSync(process.execPath, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out: String(out) };
  } catch (e) {
    return { code: e.status != null ? e.status : 1, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function correctedBrief(originalPath, extraBullets) {
  const text = readFileSync(originalPath, 'utf8');
  const addition = `${extraBullets.join('\n')}\n`;
  let next;
  const m = /^## Properties.*$/m.exec(text);
  if (m && m.index != null) {
    next = text.slice(0, m.index) + addition + '\n' + text.slice(m.index);
  } else {
    next = `${text.trimEnd()}\n${addition}`;
  }
  const dir = mkdtempSync(join(tmpdir(), 'closure-'));
  const p = join(dir, 'corrected-brief.md');
  writeFileSync(p, next, 'utf8');
  return p;
}

function minusOneBrief(originalPath, removeSubstr) {
  const text = readFileSync(originalPath, 'utf8');
  const kept = text.split(/\r?\n/).filter((l) => !(l.trim().startsWith('- `') && l.includes(removeSubstr)));
  const dir = mkdtempSync(join(tmpdir(), 'closure-'));
  const p = join(dir, 'minus-one-brief.md');
  writeFileSync(p, kept.join('\n'), 'utf8');
  return p;
}

test('arm 1 — B2 shape refused via CLI, naming the review-blog-bar pin range and identifier', () => {
  const r = runCli({ brief: B2_BRIEF, base: B2_BASE, tip: B2_TIP });
  assert.equal(r.code, 1, `B2 must refuse (exit 1), got ${r.code}\n${r.out}`);
  assert.ok(r.out.includes('loop/tests/review-blog-bar.test.mjs'), `B2 output must name the pin file\n${r.out}`);
  assert.ok(r.out.includes('269') && r.out.includes('280'), `B2 output must carry the tip line range 269-280\n${r.out}`);
  assert.ok(r.out.includes('cites-unresolved'), `B2 output must name the changed identifier\n${r.out}`);
  assert.ok(r.out.includes('enum-set'), `B2 output must name the pin class\n${r.out}`);
});

test('arm 2 — E shape refused via CLI, naming both shape pins with forms and the three keys', () => {
  const r = runCli({ brief: E_BRIEF, base: E_BASE, tip: E_TIP });
  assert.equal(r.code, 1, `E must refuse (exit 1), got ${r.code}\n${r.out}`);
  assert.ok(r.out.includes('loop/tests/breakers.test.mjs'), `E output must name breakers\n${r.out}`);
  assert.ok(r.out.includes('172') && r.out.includes('178'), `E output must carry breakers lines 172-178\n${r.out}`);
  assert.ok(r.out.includes('comparative'), `E output must name the comparative form\n${r.out}`);
  assert.ok(r.out.includes('loop/tests/gate-transport-retry.test.mjs'), `E output must name gate-transport-retry\n${r.out}`);
  assert.ok(r.out.includes('876') && r.out.includes('880'), `E output must carry gate lines 876-880\n${r.out}`);
  assert.ok(r.out.includes('exact'), `E output must name the exact form\n${r.out}`);
  for (const k of ['brief_chars', 'gate_seconds', 'authority_sha']) {
    assert.ok(r.out.includes(k), `E output must name added key ${k}\n${r.out}`);
  }
});

test('arm 3 — F shape passes via CLI, and verbose names pins found inside listed files', () => {
  const plain = runCli({ brief: F_BRIEF, base: F_BASE, tip: F_TIP });
  assert.equal(plain.code, 0, `F must pass (exit 0), got ${plain.code}\n${plain.out}`);
  assert.ok(plain.out.includes('CLOSURE OK'), `F pass must print CLOSURE OK\n${plain.out}`);
  const r = runCli({ brief: F_BRIEF, base: F_BASE, tip: F_TIP, verbose: true });
  assert.equal(r.code, 0, `F verbose must still pass, got ${r.code}\n${r.out}`);
  assert.ok(r.out.includes('CLOSURE OK'), `F verbose must print CLOSURE OK\n${r.out}`);
  assert.ok(r.out.includes('FOUND-INSIDE'), `F verbose must print FOUND-INSIDE lines so the pass reason is measured\n${r.out}`);
  assert.ok(r.out.includes('loop/tests/conformance.test.mjs'), `F verbose must name a conformance pin found inside\n${r.out}`);
  assert.ok(r.out.includes('loop/tests/runner-policy.test.mjs'), `F verbose must name a runner-policy pin found inside\n${r.out}`);
});

test('arm 4 — corrected-list variants (constructed) pass, proving refusal follows the list', () => {
  const b2fixed = correctedBrief(B2_BRIEF, [
    '- `loop/tests/review-blog-bar.test.mjs` — constructed corrected-list variant: the unlisted true pin, added so the refusal follows the list rather than the diff (no wild corrected list exists in history).',
  ]);
  const rb2 = runCli({ brief: b2fixed, base: B2_BASE, tip: B2_TIP });
  assert.equal(rb2.code, 0, `B2 corrected list must pass, got ${rb2.code}\n${rb2.out}`);
  assert.ok(rb2.out.includes('CLOSURE OK'), `B2 corrected must print CLOSURE OK\n${rb2.out}`);
  const efixed = correctedBrief(E_BRIEF, [
    '- `loop/tests/breakers.test.mjs` — constructed corrected-list variant: one of two unlisted true pins, added so the refusal follows the list (no wild corrected list exists in history).',
    '- `loop/tests/gate-transport-retry.test.mjs` — constructed corrected-list variant: the other unlisted true pin, added for the same reason.',
  ]);
  const re = runCli({ brief: efixed, base: E_BASE, tip: E_TIP });
  assert.equal(re.code, 0, `E corrected list must pass, got ${re.code}\n${re.out}`);
  assert.ok(re.out.includes('CLOSURE OK'), `E corrected must print CLOSURE OK\n${re.out}`);
});

test('arm 5 — portability-style escape: a file pinning its own construction is never reported', () => {
  const r = runCli({ brief: E_BRIEF, base: E_BASE, tip: E_TIP });
  assert.equal(r.code, 1, `E baseline must refuse for this arm to mean anything\n${r.out}`);
  assert.ok(!r.out.includes('portability.test.mjs'), `escape file must never appear among candidates, whatever the diff changes\n${r.out}`);
});

test('arm 6 — mutation A: shape pattern neutered, E goes green (the defect), revert byte-identical', async () => {
  const original = readFileSync(INSTRUMENT, 'utf8');
  const before = sha256(original);
  const baseline = runCli({ brief: E_BRIEF, base: E_BASE, tip: E_TIP });
  assert.equal(baseline.code, 1, `E baseline before mutation A must refuse\n${baseline.out}`);
  const mutated = original.replaceAll('Object.keys', 'Object____keys');
  assert.notEqual(mutated, original, 'mutation A must change the file');
  writeFileSync(INSTRUMENT, mutated, 'utf8');
  try {
    // Node caches modules: re-import under a cache-busting query so the observation measures the mutated file.
    const stamp = Date.now();
    const fresh = await import(`./brief-closure.mjs?mutA=${stamp}`);
    const res = fresh.checkClosure({ briefPath: E_BRIEF, base: E_BASE, tip: E_TIP, root: WORKTREE });
    assert.equal(res.ok, true, `mutated E must go green (the defect being shown): ${JSON.stringify(res.candidates)}`);
    assert.equal(res.candidates.length, 0, 'neutering the shape pattern must hide both E shape pins');
  } finally {
    writeFileSync(INSTRUMENT, original, 'utf8');
  }
  const after = sha256(readFileSync(INSTRUMENT, 'utf8'));
  assert.equal(after, before, 'mutation A revert must be byte-identical (hash compare)');
  const restored = runCli({ brief: E_BRIEF, base: E_BASE, tip: E_TIP });
  assert.equal(restored.code, 1, `E after revert must refuse again\n${restored.out}`);
});

test('arm 7 — mutation B: Files-list parser weakened, F-minus-one goes green (the defect), revert byte-identical', () => {
  const original = readFileSync(INSTRUMENT, 'utf8');
  const before = sha256(original);
  const minus = minusOneBrief(F_BRIEF, 'loop/lib/select.mjs');
  const baseline = runCli({ brief: minus, base: F_BASE, tip: F_TIP });
  assert.equal(baseline.code, 1, `F-minus-one baseline before mutation B must refuse as scope\n${baseline.out}`);
  assert.ok(baseline.out.includes('SCOPE') && baseline.out.includes('loop/lib/select.mjs'), `baseline must name the missing file\n${baseline.out}`);
  const mutated = original.replace('!listed.has(f)', 'false && !listed.has(f)');
  assert.notEqual(mutated, original, 'mutation B must change the file');
  writeFileSync(INSTRUMENT, mutated, 'utf8');
  try {
    const r = runCli({ brief: minus, base: F_BASE, tip: F_TIP });
    assert.equal(r.code, 0, `mutated F-minus-one must go green (the defect being shown)\n${r.out}`);
    assert.ok(r.out.includes('CLOSURE OK'), `mutated scope finding passes instead of refusing\n${r.out}`);
  } finally {
    writeFileSync(INSTRUMENT, original, 'utf8');
  }
  const after = sha256(readFileSync(INSTRUMENT, 'utf8'));
  assert.equal(after, before, 'mutation B revert must be byte-identical (hash compare)');
  const restored = runCli({ brief: minus, base: F_BASE, tip: F_TIP });
  assert.equal(restored.code, 1, `F-minus-one after revert must refuse again\n${restored.out}`);
});

test('arm 8 — liveness: F-brief-minus-one refused as scope, so the scope half is live', () => {
  const minus = minusOneBrief(F_BRIEF, 'loop/lib/select.mjs');
  const r = runCli({ brief: minus, base: F_BASE, tip: F_TIP });
  assert.equal(r.code, 1, `F-minus-one must refuse (exit 1), got ${r.code}\n${r.out}`);
  assert.ok(r.out.includes('SCOPE'), `liveness refusal must be a scope finding\n${r.out}`);
  assert.ok(r.out.includes('loop/lib/select.mjs'), `liveness refusal must name the omitted touched file\n${r.out}`);
});
