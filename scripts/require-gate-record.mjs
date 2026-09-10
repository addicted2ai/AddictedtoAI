#!/usr/bin/env node
/**
 * require-gate-record.mjs — refuse a push with no green gate receipt.
 *
 * THE REVERT-GUARD PATTERN, applied to gates. `npm test`, `npm run build`
 * and the four verify scripts measure whether the tree is coherent; none of
 * them remembers which commit was green. `record-gate-run.mjs` writes that
 * memory as `evidence/gate-run-<localdate>-<sha>/summary.txt` carrying the
 * pinned sha plus the six exit codes. This script reads that memory and
 * nothing else: exit 0 only when a receipt exists whose recorded pin matches
 * the requested sha and whose six recorded exits are all 0. Anything else is
 * exit 1 naming what is missing.
 *
 * PURE FILE READER. It runs no gates, spawns nothing, touches no lock. The
 * check a malfunctioning gate cannot supply is exactly a check that does not
 * run the gates.
 *
 * SHAPE. A receipt counts when its `summary.txt` holds a `pin <sha>` line
 * (older banked receipts with `pin OK: … at <sha>` / `gating HEAD <sha>`
 * also read) and six `<n>-<gate> EXIT=<code>` lines, one per gate in
 * `GATE_ORDER`, every code 0. A short/full sha pair matches by prefix either
 * way, so the 7-char directory suffix and the 40-char pin line agree.
 *
 * Usage:
 *   node D:/AddictedtoAI/scripts/require-gate-record.mjs <sha> [--evidence-dir <path>] [--repo <path>]
 *
 * Exit 0 receipt green, 1 receipt missing or red, 2 usage or plumbing error.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = resolve(HERE, '..');

/** The six gates a receipt must record, in run order. */
export const GATE_ORDER = Object.freeze(['test', 'build', 'launch', 'design', 'surfaces', 'analytics']);

/** True when the recorded pin and the requested sha name one commit. */
export function pinsMatch(recorded, want) {
  const a = String(recorded ?? '').trim().toLowerCase();
  const b = String(want ?? '').trim().toLowerCase();
  if (!a || !b) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

/**
 * Read the machine contract out of a `summary.txt`.
 * Returns `{ pin, exits }` where `exits` maps gate name -> exit code.
 */
export function parseSummary(text) {
  const src = String(text ?? '');
  let pin = null;
  const direct = /^pin\s+([0-9a-f]{4,40})/mi.exec(src);
  if (direct) {
    pin = direct[1].toLowerCase();
  } else {
    const legacy = /pin OK:[^\n]*?([0-9a-f]{7,40})/i.exec(src) ?? /gating HEAD\s+([0-9a-f]{7,40})/i.exec(src);
    if (legacy) pin = legacy[1].toLowerCase();
  }
  const exits = {};
  const re = /(?:^|\n)\s*\d-(test|build|launch|design|surfaces|analytics)\s+EXIT=(\d+)/gi;
  let m;
  while ((m = re.exec(src)) !== null) exits[m[1].toLowerCase()] = Number(m[2]);
  return { pin, exits };
}

/** Every `gate-run-*` directory directly under `evidenceDir`, sorted. */
export function listRecordDirs(evidenceDir) {
  let entries;
  try {
    entries = readdirSync(evidenceDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory() && e.name.startsWith('gate-run-'))
    .map((e) => e.name)
    .sort();
}

/**
 * The verdict for `wantSha` against `evidenceDir`.
 * Returns `{ ok, path, pin, exits, reasons }`. `ok` only when a receipt
 * directory matches, its recorded pin matches, and all six exits are 0.
 */
export function checkGateRecord(evidenceDir, wantSha) {
  const want = String(wantSha ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{4,40}$/.test(want)) {
    return { ok: false, path: null, pin: null, exits: {}, reasons: [`want "${String(wantSha ?? '')}" is not a sha`] };
  }
  const dir = resolve(evidenceDir);
  const names = listRecordDirs(dir);
  if (names.length === 0) {
    return { ok: false, path: null, pin: null, exits: {}, reasons: [`no evidence/gate-run-*-${want}/summary.txt under ${dir}`] };
  }
  const pool = names.filter((n) => {
    const tail = n.slice('gate-run-'.length).split('-').pop() ?? '';
    const w = want.toLowerCase();
    const t = tail.toLowerCase();
    return t.length > 0 && (t.startsWith(w) || w.startsWith(t));
  });
  if (pool.length === 0) {
    return { ok: false, path: null, pin: null, exits: {}, reasons: [`no evidence/gate-run-*-${want}/summary.txt under ${dir}`] };
  }
  const aggregate = [];
  for (const name of pool) {
    const path = join(dir, name, 'summary.txt');
    let text;
    try {
      text = readFileSync(path, 'utf8');
    } catch {
      aggregate.push(`${path}: summary.txt unreadable`);
      continue;
    }
    const { pin, exits } = parseSummary(text);
    const reasons = [];
    if (!pin) reasons.push(`${path}: no recorded pin`);
    else if (!pinsMatch(pin, want)) reasons.push(`${path}: pin mismatch: recorded ${pin} != ${want}`);
    for (const gate of GATE_ORDER) {
      if (!Number.isFinite(exits[gate])) reasons.push(`${path}: missing exit for ${gate}`);
      else if (exits[gate] !== 0) reasons.push(`${path}: ${gate} exit ${exits[gate]}`);
    }
    if (reasons.length === 0) return { ok: true, path, pin, exits, reasons: [] };
    aggregate.push(...reasons);
  }
  return { ok: false, path: join(dir, pool[0], 'summary.txt'), pin: null, exits: {}, reasons: aggregate };
}

function main(argv) {
  const flagged = new Set();
  for (const name of ['--evidence-dir', '--repo']) {
    const i = argv.indexOf(name);
    if (i >= 0) { flagged.add(i); flagged.add(i + 1); }
  }
  const positional = argv.filter((a, i) => !flagged.has(i) && !a.startsWith('--'));
  const flag = (name) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };

  const want = positional[0];
  if (!want) {
    console.error('require-gate-record: usage: node D:/AddictedtoAI/scripts/require-gate-record.mjs <sha> [--evidence-dir <path>] [--repo <path>]');
    return 2;
  }
  const repo = resolve(flag('--repo') ?? DEFAULT_REPO);
  const evidenceDir = resolve(flag('--evidence-dir') ?? join(repo, 'evidence'));

  const verdict = checkGateRecord(evidenceDir, want);
  if (verdict.ok) {
    console.log(`require-gate-record: GREEN for ${String(want).toLowerCase()} at ${verdict.path}`);
    console.log('  pin matches and all six recorded exits are 0.');
    return 0;
  }
  console.log(`require-gate-record: REFUSE THE PUSH for ${String(want).toLowerCase()}.`);
  for (const r of verdict.reasons) console.log(`  missing: ${r}`);
  console.log('Run the six gates through record-gate-run.mjs first; this check runs no gates itself.');
  return 1;
}

// Only run when invoked directly, so tests can import the units.
if (process.argv[1] && process.argv[1].endsWith('require-gate-record.mjs')) {
  process.exitCode = main(process.argv.slice(2));
}
