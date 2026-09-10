// brief-closure.mjs — review-gate sweep: a brief Files list vs a merge-base diff.
//
// PIN CLASSES (exact-shape assertions over identifiers the diff changes, never prose mentions):
// - enum-set: an exported array/set literal gains or loses a member (REISSUE_CODES plus
//   cites-unresolved; runner-id scan targets; change-dir allow-list) pinned by exact membership
//   (deepEqual against a literal list, deepEqual(scan(...), []), floor counts). A prose mention
//   of the identifier is not a pin.
// - shape: a builder emitted object gains or loses keys (ledger line plus brief_chars,
//   gate_seconds, authority_sha; conformance record plus history, entries, passesToSupersede)
//   pinned by exact key-set (Object.keys filter against a literal key array, exact-shape deepEqual)
//   or comparative shape (Object.keys equality between two live lines plus per-field value equality).
//   Ledger comparative pins stay red through per-throwaway uniqueness (authority_sha), not a literal.
// - field: a named field or record shape the diff changes (LEDGER_FIELDS; runner registry enabled)
//   pinned exactly elsewhere (deepEqual against a literal array; includes; selection and refusal arms).
//   LEDGER_FIELDS unchanged means issues-style pins stay green: TRUE-BUT-UNTOUCHED, never candidates.
//
// WHAT COUNTS AS LISTED: a backticked file path in the brief own ## Files section (work-only bullets
// plus the read-only-with-reason paragraph: F carries both) and backticked file paths in ## Properties
// that the sweep must run (selector-rules, budget, expiring-proposal-precedence, runner-health,
// exit-code-refusal, issues, gate-transport-retry, helpers). A path named only in prose elsewhere is
// not listed: prose names many files without taking responsibility for closure, and counting those
// would let a brief claim a closure it never enumerates.
// WHY THE REPORT FILE NEVER COUNTS: RESULT<n>.md at the worktree root is always new and left untracked
// (this round leaves RESULT2.md uncommitted); the merge-base diff of committed work never names it, and
// even a committed one is the reviewer own record, not behaviour the brief scopes. Counting it as
// unlisted scope would refuse every brief for its own report.
// WHY REVIEWER-SIDE, NOT AUTOMATIC: the instrument reports candidates and the reviewer judges them,
// because the false-fire rate of an automatic refusal is unmeasured (round 1 detected-not-dispatched
// precedent). The sealed review running the instrument with a revise verdict naming unlisted true pins
// IS the gate refusing a file list that misses a pin (what the bead asks for). The automatic form (the
// merge step refusing on instrument output with nobody judging) is a recorded follow-up owned by the
// orchestrator, due when the false-fire rate has been measured over real reviews; that measurement is a
// later attempt under its own brief, not a promise this round makes.
// WHY NO FALSE-FIRE ON REWORDING: candidates are exact-shape assertions (deepEqual against a literal,
// Object.keys comparisons, includes against a literal, gate and history deepEqual) over identifiers the
// diff changes. Rewording prose or comments changes no asserted shape and matches no pattern, unlike a
// text search for the identifier which would fire on every mention.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..');

function looksLikeFile(s) {
  const t = String(s).trim();
  if (!t) return false;
  if (/\s/.test(t)) return false;
  if (t.includes('@')) return false;
  if (t.includes('*')) return false;
  if (t.includes('<') || t.includes('>')) return false;
  if (t.includes(':')) return false;
  if (!t.includes('.')) return false;
  if (!/^[\w./-]+\.[A-Za-z0-9]+$/.test(t)) return false;
  return true;
}

export function parseListed(briefText) {
  const lines = String(briefText).split(/\r?\n/);
  const headings = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^##\s+(.*)\s*$/.exec(lines[i]);
    if (m) headings.push({ index: i, title: m[1].trim().toLowerCase() });
  }
  const sectionText = (name) => {
    const found = headings.find((h) => h.title.startsWith(name));
    if (!found) return '';
    const after = headings.filter((h) => h.index > found.index);
    const end = after.length ? after[0].index : lines.length;
    return lines.slice(found.index + 1, end).join('\n');
  };
  const filesText = sectionText('files');
  const propsText = sectionText('properties');
  const listed = new Set();
  for (const section of [filesText, propsText]) {
    if (!section) continue;
    const re = /`([^`\n]+)`/g;
    let m;
    while ((m = re.exec(section)) !== null) {
      const cand = m[1].trim();
      if (looksLikeFile(cand)) listed.add(cand);
    }
  }
  return listed;
}

function runGit(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export function getTouched(root, base, tip) {
  const tipEff = tip || 'HEAD';
  const out = runGit(root, ['diff', '--name-only', `${base}..${tipEff}`, '--']);
  const files = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  return files.filter((f) => {
    if (!f.includes('/') && /^RESULT\d*\.md$/.test(f)) return false;
    return true;
  });
}

function isProductionFile(f) {
  if (f.endsWith('.test.mjs')) return false;
  if (!f.includes('/') && /^RESULT\d*\.md$/.test(f)) return false;
  if (f === 'scripts/brief-closure.mjs') return false;
  if (f === 'scripts/brief-closure.test.mjs') return false;
  if (f.startsWith('loop/')) return true;
  if (f.startsWith('lib/')) return true;
  if (f.startsWith('pulse/')) return true;
  if (f.startsWith('app/')) return true;
  if (f.startsWith('tools/')) return true;
  if (f.startsWith('scripts/')) return true;
  return false;
}

export function getProductionDiff(root, base, tip, productionFiles) {
  if (!productionFiles || productionFiles.length === 0) return '';
  const tipEff = tip || 'HEAD';
  try {
    return runGit(root, ['diff', `${base}..${tipEff}`, '--', ...productionFiles]);
  } catch {
    return '';
  }
}

export function changedSignals(productionDiffText, productionFiles) {
  const text = String(productionDiffText || '');
  const addedLines = text.split(/\r?\n/).filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  const addedText = addedLines.join('\n');
  const touches = (substr) => (productionFiles || []).some((f) => f.includes(substr));
  let reissueAdded = [];
  if (addedText.includes('cites-unresolved')) reissueAdded = ['cites-unresolved'];
  else if (text.includes('REISSUE_CODES')) {
    const found = new Set();
    for (const l of addedLines) {
      const re = /'([^'\n]+)'/g;
      let m;
      while ((m = re.exec(l)) !== null) {
        if (/^[a-z][a-z0-9-]*$/.test(m[1])) found.add(m[1]);
      }
    }
    reissueAdded = [...found];
  }
  const ledgerAdded = [];
  const codeLines = addedLines.filter((l) => {
    const t = l.slice(1).trim();
    if (!t) return false;
    if (t.startsWith('*')) return false;
    if (t.startsWith('//')) return false;
    if (t.startsWith('#')) return false;
    return true;
  });
  const codeText = codeLines.join('\n');
  for (const k of ['brief_chars', 'gate_seconds', 'authority_sha']) {
    if (codeText.includes(k)) ledgerAdded.push(k);
  }
  const enabledTouched = addedText.includes('enabled')
    && (touches('runners.mjs') || touches('select.mjs') || touches('run.mjs'));
  const conformanceTouched = addedText.includes('conformanceHistory')
    || addedText.includes('passesToSupersede');
  const ledgerFieldsTouched = addedLines.some((l) => l.includes('LEDGER_FIELDS'));
  return { reissueAdded, ledgerAdded, enabledTouched, conformanceTouched, ledgerFieldsTouched };
}

export function listTestFilesAtTip(root, tip) {
  const tipEff = tip || 'HEAD';
  let out = '';
  try {
    out = runGit(root, ['ls-tree', '-r', '--name-only', tipEff, '--', 'loop/tests', 'scripts']);
  } catch {
    return [];
  }
  return out.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.endsWith('.test.mjs'));
}

export function readAtTip(root, tip, path) {
  const tipEff = tip || 'HEAD';
  try {
    return runGit(root, ['show', `${tipEff}:${path}`]);
  } catch {
    return null;
  }
}

function findClosing(lines, start, maxLook = 15) {
  for (let j = start; j < Math.min(lines.length, start + maxLook); j += 1) {
    if (/^\s*\]\s*\)\s*;\s*$/.test(lines[j]) || /^\s*\)\s*;\s*$/.test(lines[j])) return j;
  }
  return start;
}

export function collectPins(fileMap, signals) {
  const pins = [];
  const ledgerId = (signals.ledgerAdded && signals.ledgerAdded.length)
    ? signals.ledgerAdded.join(',')
    : 'ledger-keys';
  const reissueId = (signals.reissueAdded && signals.reissueAdded.length)
    ? signals.reissueAdded.join(',')
    : 'REISSUE_CODES';
  for (const [file, content] of fileMap.entries()) {
    if (content == null) continue;
    const lines = String(content).split(/\r?\n/);
    const escapedLedger = content.includes('ledgerSchemaLine');
    const hasDeep = content.includes('deepEqual');
    const hasAssertEq = content.includes('assert.equal') || hasDeep;
    // Enum-set: REISSUE_CODES exact membership.
    if (content.includes('REISSUE_CODES') && hasDeep) {
      for (let i = 0; i < lines.length; i += 1) {
        const ln = lines[i];
        if (!ln.includes('REISSUE_CODES')) continue;
        let nearDeep = ln.includes('deepEqual');
        if (!nearDeep) {
          for (let k = Math.max(0, i - 3); k <= Math.min(lines.length - 1, i + 3); k += 1) {
            if (lines[k].includes('deepEqual')) { nearDeep = true; break; }
          }
        }
        if (!nearDeep) continue;
        const end = findClosing(lines, i, 15);
        pins.push({
          file, start: i + 1, end: end + 1, cls: 'enum-set', identifier: reissueId,
          touched: (signals.reissueAdded || []).length > 0,
        });
        break;
      }
    }
    // Shape exact: Object.keys filter by LEDGER_FIELDS plus deepEqual.
    if (!escapedLedger && content.includes('Object.keys') && content.includes('LEDGER_FIELDS') && hasAssertEq) {
      for (let i = 0; i < lines.length; i += 1) {
        if (!lines[i].includes('deepEqual')) continue;
        let foundKeys = false;
        for (let k = i; k <= Math.min(lines.length - 1, i + 4); k += 1) {
          if (lines[k].includes('Object.keys') && lines[k].includes('LEDGER_FIELDS')) { foundKeys = true; break; }
        }
        if (!foundKeys) continue;
        const end = findClosing(lines, i, 10);
        pins.push({
          file, start: i + 1, end: end + 1, cls: 'shape:exact', identifier: ledgerId,
          touched: (signals.ledgerAdded || []).length > 0,
        });
      }
    }
    // Shape comparative: two live Object.keys equal plus per-field equality.
    if (!escapedLedger && content.includes('Object.keys') && hasDeep) {
      for (let i = 0; i < lines.length; i += 1) {
        const ln = lines[i];
        if (!ln.includes('deepEqual')) continue;
        const countKeys = (ln.match(/Object\.keys/g) || []).length;
        if (countKeys < 2) continue;
        if (!(content.includes('marked') || content.includes('readLedger') || content.includes('twiceFailedJob') || content.includes('phases'))) continue;
        let end = i;
        for (let k = i + 1; k <= Math.min(lines.length - 1, i + 12); k += 1) {
          if (lines[k].includes('marked[k]') && lines[k].includes('unmarked[k]')) { end = k; break; }
        }
        pins.push({
          file, start: i + 1, end: end + 1, cls: 'shape:comparative', identifier: ledgerId,
          touched: (signals.ledgerAdded || []).length > 0,
        });
      }
    }
    // Field: LEDGER_FIELDS literal pin (no nearby Object.keys, so not the shape above).
    if (!escapedLedger && content.includes('LEDGER_FIELDS') && hasDeep) {
      for (let i = 0; i < lines.length; i += 1) {
        const ln = lines[i];
        if (!(ln.includes('LEDGER_FIELDS') && ln.includes('deepEqual'))) continue;
        let nearKeys = false;
        for (let k = Math.max(0, i - 5); k <= Math.min(lines.length - 1, i + 5); k += 1) {
          if (lines[k].includes('Object.keys')) { nearKeys = true; break; }
        }
        if (nearKeys) continue;
        pins.push({
          file, start: i + 1, end: i + 1, cls: 'field', identifier: 'LEDGER_FIELDS',
          touched: Boolean(signals.ledgerFieldsTouched),
        });
      }
    }
    // Shape: conformance history and gate entries.
    if ((content.includes('conformanceHistory') || content.includes('conformanceGate') || content.includes('recordConformance'))
      && (hasDeep || hasAssertEq)) {
      for (let i = 0; i < lines.length; i += 1) {
        const ln = lines[i];
        const hasId = ln.includes('conformanceHistory') || ln.includes('conformanceGate') || ln.includes('recordConformance') || ln.includes('passesToSupersede');
        if (!hasId) continue;
        let nearAssert = /assert\.(deepEqual|equal|ok)|deepEqual/.test(ln);
        if (!nearAssert) {
          for (let k = Math.max(0, i - 2); k <= Math.min(lines.length - 1, i + 2); k += 1) {
            if (/assert\.(deepEqual|equal|ok)|deepEqual/.test(lines[k])) { nearAssert = true; break; }
          }
        }
        if (!nearAssert) continue;
        let ident = 'conformanceGate';
        if (ln.includes('conformanceHistory')) ident = 'conformanceHistory';
        else if (ln.includes('recordConformance')) ident = 'recordConformance';
        else if (ln.includes('passesToSupersede')) ident = 'passesToSupersede';
        pins.push({
          file, start: i + 1, end: i + 1, cls: 'shape', identifier: ident,
          touched: Boolean(signals.conformanceTouched),
        });
      }
    }
    // Field: runner registry enabled.
    if (content.includes('enabled')
      && (content.includes('runner:disabled') || content.includes('selectJob') || content.includes('pickRunner') || content.includes('loadRunners'))
      && lines.some((l) => l.includes('assert'))) {
      for (let i = 0; i < lines.length; i += 1) {
        const ln = lines[i];
        if (!ln.includes('enabled')) continue;
        let nearAssert = ln.includes('assert');
        if (!nearAssert) {
          for (let k = Math.max(0, i - 3); k <= Math.min(lines.length - 1, i + 3); k += 1) {
            if (lines[k].includes('assert')) { nearAssert = true; break; }
          }
        }
        if (!nearAssert) continue;
        if (ln.trim().startsWith('//') || ln.trim().startsWith('*')) continue;
        pins.push({
          file, start: i + 1, end: i + 1, cls: 'field', identifier: 'enabled',
          touched: Boolean(signals.enabledTouched),
        });
        if (pins.filter((p) => p.file === file && p.identifier === 'enabled').length >= 4) break;
      }
    }
  }
  return pins;
}

export function checkClosure({ briefText, briefPath, base, tip, root }) {
  const text = briefText != null ? String(briefText) : readFileSync(briefPath, 'utf8');
  const listed = parseListed(text);
  const repoRoot = root || DEFAULT_ROOT;
  const touched = getTouched(repoRoot, base, tip);
  const scopeMisses = touched.filter((f) => !listed.has(f));
  const productionFiles = touched.filter(isProductionFile);
  const productionDiffText = getProductionDiff(repoRoot, base, tip, productionFiles);
  const signals = changedSignals(productionDiffText, productionFiles);
  const testFiles = listTestFilesAtTip(repoRoot, tip);
  const fileMap = new Map();
  for (const f of testFiles) {
    const content = readAtTip(repoRoot, tip, f);
    if (content != null) fileMap.set(f, content);
  }
  const pins = collectPins(fileMap, signals);
  const candidates = pins.filter((p) => !listed.has(p.file) && p.touched);
  const foundInside = pins.filter((p) => listed.has(p.file) && p.touched);
  const ok = scopeMisses.length === 0 && candidates.length === 0;
  return { ok, listed: [...listed].sort(), touched: [...touched].sort(), scopeMisses, candidates, foundInside, pins, signals };
}

function printUsage() {
  console.log('usage: node scripts/brief-closure.mjs --brief <brief> --base <sha> [--tip <sha>] [--root <dir>] [--verbose]');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const get = (name) => {
    const i = args.indexOf(name);
    return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
  };
  const verbose = args.includes('--verbose');
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }
  const briefPath = get('--brief');
  const base = get('--base');
  const tip = get('--tip');
  const root = get('--root');
  if (!briefPath || !base) {
    printUsage();
    process.exit(2);
  }
  let result;
  try {
    result = checkClosure({ briefPath, base, tip, root });
  } catch (e) {
    console.log(`ERROR ${e && e.message ? e.message : String(e)}`);
    process.exit(2);
  }
  if (!result.ok) {
    for (const f of result.scopeMisses) {
      console.log(`SCOPE ${f} scope touched-but-unlisted`);
    }
    for (const c of result.candidates) {
      const range = c.end && c.end !== c.start ? `${c.start}-${c.end}` : `${c.start}`;
      console.log(`CANDIDATE ${c.file}:${range} ${c.cls} ${c.identifier}`);
    }
    process.exit(1);
  }
  console.log('CLOSURE OK');
  if (verbose) {
    for (const p of result.foundInside) {
      console.log(`FOUND-INSIDE ${p.file}:${p.start} ${p.cls} ${p.identifier}`);
    }
  }
  process.exit(0);
}
