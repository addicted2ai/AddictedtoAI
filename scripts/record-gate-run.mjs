#!/usr/bin/env node
/**
 * record-gate-run.mjs — run the six push gates once, in order, and keep the
 * receipt.
 *
 * WHY A RECEIPT, WHEN THE GATES ALREADY PRINT. The push rule names six gates
 * (`npm test`, `npm run build`, `verify-launch`, `verify-design`,
 * `verify-surfaces`, `verify-analytics`). A green terminal scroll proves the
 * tree was green at some point; it does not say which commit was green, it
 * does not survive the scroll, and it cannot be checked by a later step. This
 * script pins HEAD, runs the six, re-reads HEAD, and writes one directory:
 * `evidence/gate-run-<localdate>-<short>/` with `summary.txt` plus one log
 * per gate. `require-gate-record.mjs` then refuses a push with no matching
 * receipt. The two files agree on the summary shape by test, not by trust.
 *
 * WHY SERIALLY, NEVER OVERLAPPED. The gates share one `.next/` tree and one
 * machine-wide build lock (`scripts/build-lock.mjs`). Two builds at once fail
 * with ENOENT on `pages-manifest.json` after every page generated — a red
 * that reads as a content defect and is not. So this loop awaits each gate
 * before starting the next. There is deliberately no flag for overlap.
 *
 * WHY THE PIN IS RE-READ. A full gate run is minutes long and `main` moves
 * while it runs. Trusting the start value would certify a commit the tree no
 * longer holds. The end value is read fresh; a move is a red record, not a
 * green one for the wrong commit.
 *
 * PATHS. Every path here is absolute. Node gates run by absolute script path
 * (`node D:/AddictedtoAI/scripts/verify-launch.mjs`), npm gates run with an
 * absolute working tree, git runs as `git -C <repo>`. The evidence root
 * defaults to `<repo>/evidence` and can be pointed elsewhere with
 * `--evidence-dir`; pointing it at an older archive location is a runtime
 * flag, never a string in this file.
 *
 * DATES. Every date written is the machine-local date (`localDate` below:
 * `getFullYear`/`getMonth`/`getDate`). The repository rule is one convention
 * everywhere, and a UTC day is tomorrow six hours a day on this machine.
 *
 * TESTS. The units under test take an INJECTED runner: the test suite never
 * executes the real six. See `scripts/tests/record-gate-run.test.mjs`.
 *
 * Usage:
 *   node D:/AddictedtoAI/scripts/record-gate-run.mjs [--evidence-dir <path>] [--gates test,build,launch,design,surfaces,analytics] [--repo <path>]
 *
 * Exit 0 only when every executed gate exited 0 and the pin still matches
 * HEAD at the end. A partial `--gates` run still writes its receipt, but the
 * receipt only counts when all six exits are present and 0.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = resolve(HERE, '..');

/** The six gates, always in this order. */
export const GATE_ORDER = Object.freeze(['test', 'build', 'launch', 'design', 'surfaces', 'analytics']);

/** Log-file label per gate, matching the banked `1-test … 6-analytics` shape. */
export const GATE_LABEL = Object.freeze({
  test: '1-test',
  build: '2-build',
  launch: '3-launch',
  design: '4-design',
  surfaces: '5-surfaces',
  analytics: '6-analytics',
});

/**
 * The machine-local calendar day as `YYYY-MM-DD`.
 *
 * Local, never UTC: the freshness layer subtracts these dates from each
 * other, so two conventions in one tree miscount by a day.
 */
export function localDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** The machine-local wall time as `HH:MM:SS`, for the `gating HEAD` line. */
export function localTime(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** HEAD of `repo` as a full 40-char sha, or null when git cannot say. */
export function gitHead(repo) {
  try {
    const out = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return /^[0-9a-f]{40}$/i.test(out) ? out.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * The six gate invocations for `repoRoot`.
 *
 * Short display strings, absolute execution: npm gates run with an absolute
 * working tree, node gates by absolute script path. No shell: argv arrays
 * straight into the spawn call.
 */
export function gateCommands(repoRoot) {
  const root = resolve(repoRoot);
  const script = (name) => join(root, 'scripts', name);
  return [
    { name: 'test', label: GATE_LABEL.test, command: 'npm', args: ['test'], cwd: root },
    { name: 'build', label: GATE_LABEL.build, command: 'npm', args: ['run', 'build'], cwd: root },
    { name: 'launch', label: GATE_LABEL.launch, command: process.execPath, args: [script('verify-launch.mjs')], cwd: root },
    { name: 'design', label: GATE_LABEL.design, command: process.execPath, args: [script('verify-design.mjs')], cwd: root },
    { name: 'surfaces', label: GATE_LABEL.surfaces, command: process.execPath, args: [script('verify-surfaces.mjs')], cwd: root },
    { name: 'analytics', label: GATE_LABEL.analytics, command: process.execPath, args: [script('verify-analytics.mjs')], cwd: root },
  ];
}

/** Short human form of what was executed, for logs. */
export function displayForGate(gate) {
  if (gate?.command === 'npm' && Array.isArray(gate.args)) return `npm ${gate.args.join(' ')}`;
  if (Array.isArray(gate?.args)) return `node ${gate.args.join(' ')}`;
  return gate?.label ?? gate?.name ?? 'unknown gate';
}

/**
 * The real runner: one gate, serially, exit plus duration plus full output.
 * On win32 npm runs under `cmd.exe`, the same shape `loop/lib/gates.mjs`
 * uses — a bare `npm` spawn with no shell fails there.
 */
export function realRunner(gate) {
  const started = Date.now();
  let res;
  if (gate.command === 'npm' && process.platform === 'win32') {
    res = spawnSync('cmd.exe', ['/d', '/s', '/c', `npm ${gate.args.join(' ')}`], {
      cwd: gate.cwd,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: false,
    });
  } else {
    res = spawnSync(gate.command, gate.args, {
      cwd: gate.cwd,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: false,
    });
  }
  const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
  const exit = typeof res.status === 'number' ? res.status : 1;
  const withErr = res.error && !output.trim() ? `${output}\nspawn error: ${res.error.message}\n` : output;
  return { exit, durationMs: Math.max(0, Date.now() - started), output: withErr };
}

/**
 * Run gates one after another, in array order, awaiting each.
 *
 * `runner` is injected so tests pass a fake: `runner(gate)` returns (or
 * resolves to) `{ exit, durationMs?, output? }`. Never overlapped by
 * construction — a `for` loop with `await`, no fan-out primitive anywhere
 * in this file. Every gate runs even when an earlier one failed, so the
 * receipt shows the whole run, not just the first red.
 */
export async function runAllGatesSerially(gates, runner) {
  const results = [];
  for (const gate of gates) {
    const r = await runner(gate);
    results.push({
      name: gate.name,
      label: gate.label ?? GATE_LABEL[gate.name] ?? gate.name,
      command: displayForGate(gate),
      exit: Number.isFinite(Number(r?.exit)) ? Number(r.exit) : 1,
      durationMs: Number.isFinite(Number(r?.durationMs)) ? Number(r.durationMs) : 0,
      output: typeof r?.output === 'string' ? r.output : '',
    });
  }
  return results;
}

/** Pull the npm-test pass count out of captured output, or null. */
export function parseTestCount(output) {
  const src = String(output ?? '');
  const m1 = /(\d+)\s+passed/.exec(src);
  if (m1) return Number(m1[1]);
  const m2 = /pass\s+(\d+)/i.exec(src);
  if (m2) return Number(m2[1]);
  const m3 = /tests\s+(\d+)/i.exec(src);
  if (m3) return Number(m3[1]);
  return null;
}

/**
 * The pin check: the HEAD read at the end must equal the HEAD pinned at the
 * start. Both full shas, compared verbatim. Empty either side is a failure,
 * never a pass.
 */
export function checkPin(startPin, endHead) {
  const a = String(startPin ?? '').trim().toLowerCase();
  const b = String(endHead ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(a) || !/^[0-9a-f]{40}$/.test(b)) {
    return { ok: false, startPin: a || null, endHead: b || null, why: 'pin or HEAD unreadable' };
  }
  if (a !== b) return { ok: false, startPin: a, endHead: b, why: `HEAD moved during the run: ${a.slice(0, 7)} -> ${b.slice(0, 7)}` };
  return { ok: true, startPin: a, endHead: b, why: null };
}

/**
 * Build `summary.txt`. Pure: no fs, no clock reads — every input is passed
 * in, so tests assert on the string. The `pin` line and the six
 * `<label> EXIT=<code>` lines are the machine contract
 * `require-gate-record.mjs` reads; the rest is for humans.
 */
export function buildSummaryText({ pinFull, pinShort, localDateStr, repoRoot, evidenceDir, startedLocalTime, results, testCount, pinCheck }) {
  const lines = [];
  lines.push(`gate-run ${localDateStr} ${pinShort}`);
  lines.push(`pin ${pinFull}`);
  lines.push(`short ${pinShort}`);
  lines.push(`repo ${repoRoot}`);
  lines.push(`evidence ${evidenceDir}`);
  lines.push(`date ${localDateStr} (machine-local)`);
  lines.push(`gating HEAD ${pinShort} at ${startedLocalTime}`);
  lines.push('');
  for (const r of results) {
    const secs = (r.durationMs / 1000).toFixed(0);
    lines.push(`=== ${r.label} starting ===`);
    lines.push(`${r.label} EXIT=${r.exit} ${secs}s duration_ms=${r.durationMs}`);
    if (r.name === 'test') {
      lines.push(`${r.label} counts: ${testCount == null ? 'unknown' : `${testCount} passed`}`);
    }
  }
  lines.push('');
  const missing = GATE_ORDER.filter((n) => !results.some((r) => r.name === n));
  const red = results.filter((r) => r.exit !== 0);
  if (pinCheck?.ok && red.length === 0 && missing.length === 0) {
    lines.push(`ALL SIX GATES GREEN at ${pinShort}`);
  } else {
    const bits = [
      ...red.map((r) => `${r.label}(exit ${r.exit})`),
      ...missing.map((n) => `${GATE_LABEL[n]}(not run)`),
    ];
    lines.push(`GATES RED at ${pinShort}: ${bits.length ? bits.join(', ') : 'pin moved'}`);
  }
  if (pinCheck?.ok) {
    lines.push(`pin OK: pinned and HEAD agree at ${pinShort}`);
  } else {
    lines.push(`pin MISMATCH: ${pinCheck?.why ?? 'unknown'}`);
  }
  lines.push('THIS SCRIPT NEVER PUSHES. A green result is a report, not a deploy.');
  lines.push('');
  return lines.join('\n');
}

/**
 * Write one receipt directory. Returns `{ dir, summaryPath }`.
 * Pure fs: `summaryText` and per-gate `output` are passed in.
 */
export function writeGateRun({ evidenceDir, localDateStr, pinShort, summaryText, results }) {
  const dir = join(resolve(evidenceDir), `gate-run-${localDateStr}-${pinShort}`);
  mkdirSync(dir, { recursive: true });
  for (const r of results) {
    const head = `gate ${r.label}: ${r.command} exit=${r.exit} duration_ms=${r.durationMs}\n---\n`;
    writeFileSync(join(dir, `${r.label}.log`), `${head}${r.output}`, 'utf8');
  }
  const summaryPath = join(dir, 'summary.txt');
  writeFileSync(summaryPath, summaryText, 'utf8');
  return { dir, summaryPath };
}

function flagValue(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

function parseGates(raw) {
  if (raw == null || raw === '') return [...GATE_ORDER];
  const want = String(raw).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const bad = want.filter((n) => !GATE_ORDER.includes(n));
  if (bad.length) throw new Error(`unknown gate(s): ${bad.join(', ')} (pick from ${GATE_ORDER.join(',')})`);
  return GATE_ORDER.filter((n) => want.includes(n));
}

function main(argv) {
  let repo;
  let evidenceDir;
  let gates;
  try {
    repo = resolve(flagValue(argv, '--repo') ?? DEFAULT_REPO);
    evidenceDir = resolve(flagValue(argv, '--evidence-dir') ?? join(repo, 'evidence'));
    gates = parseGates(flagValue(argv, '--gates'));
  } catch (err) {
    console.error(`record-gate-run: ${err.message}`);
    return 2;
  }

  const startPin = gitHead(repo);
  if (!startPin) {
    console.error(`record-gate-run: cannot read HEAD in ${repo}`);
    return 2;
  }
  const pinShort = startPin.slice(0, 7);
  const localDateStr = localDate();
  const startedLocalTime = localTime();
  const all = gateCommands(repo).filter((g) => gates.includes(g.name));

  console.log(`record-gate-run: pin ${pinShort} at ${startedLocalTime}, ${all.length} gate(s) serially`);

  return runAllGatesSerially(all, realRunner).then((results) => {
    const endHead = gitHead(repo);
    const pinCheck = checkPin(startPin, endHead ?? '');
    const testOut = results.find((r) => r.name === 'test')?.output ?? '';
    const testCount = parseTestCount(testOut);
    const summaryText = buildSummaryText({
      pinFull: startPin,
      pinShort,
      localDateStr,
      repoRoot: repo,
      evidenceDir,
      startedLocalTime,
      results,
      testCount,
      pinCheck,
    });
    const { dir, summaryPath } = writeGateRun({ evidenceDir, localDateStr, pinShort, summaryText, results });
    console.log(`record-gate-run: wrote ${summaryPath}`);
    for (const r of results) console.log(`  ${r.label} EXIT=${r.exit} ${(r.durationMs / 1000).toFixed(0)}s`);
    const allGreen = results.length === GATE_ORDER.length && results.every((r) => r.exit === 0) && pinCheck.ok;
    if (!pinCheck.ok) console.log(`record-gate-run: ${pinCheck.why}`);
    console.log(allGreen ? `ALL SIX GATES GREEN at ${pinShort}` : `GATES RED at ${pinShort} (see ${dir})`);
    return allGreen ? 0 : 1;
  }).catch((err) => {
    console.error(`record-gate-run: ${err?.message ?? err}`);
    return 2;
  });
}

// Only run when invoked directly, so tests can import the units.
if (process.argv[1] && process.argv[1].endsWith('record-gate-run.mjs')) {
  const code = await main(process.argv.slice(2));
  process.exitCode = code;
}
