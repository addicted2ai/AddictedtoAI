/**
 * lint-deferrals.test.mjs — the witness for Stage 0 tasks 16 and 17.
 *
 * Task 16 (`scripts/lint-deferrals.mjs`) reports every open issue in a
 * `bd list --json` export that names neither a subject path nor a
 * specification requirement. Task 17 is this file. Every property the brief
 * names gets an arm below, so a reviewer finds each by lookup:
 *
 *   arm 0  — a byte-order-marked export parses like a plain one.
 *   arm 1  — an issue naming a subject path is not reported.
 *   arm 1b — a requirement pointer, and a declared `metadata.subject`,
 *            each also keep an issue out of the report.
 *   arm 2  — an issue naming neither is reported, by id.
 *   arm 3  — a closed issue naming neither is not reported.
 *   arm 4  — exit 0 without `--strict`, non-zero with it, identical rows.
 *   arm 5  — a missing file, an unparseable file, a non-array top level,
 *            and a missing argument each refuse (non-zero, path named)
 *            rather than reporting zero rows.
 *   arm 5b — an unroutable issue with no id still fails `--strict`
 *            visibly (announced on stderr), never silently.
 *   mutation A — the reporter skips unroutable issues silently; the arm-2
 *            reporting assertion fails. Mutant observed through a
 *            same-directory copy (the tracked reporter is never written),
 *            copy removed with absence asserted.
 *   B1 baseline — the source check over `scripts/lint-deferrals.mjs` alone
 *            (no subprocess import, no tracker invocation) is GREEN.
 *   mutation B — the reporter spawns the tracker instead of reading the
 *            file; B1 goes RED. Copy-based likewise; tracked file untouched.
 *   B2 — the standing boundary assertion (nothing under `lib/`, and no step
 *            registered in the prebuild's `STEPS` array, imports or spawns
 *            the tracker) is GREEN at baseline and stays GREEN under
 *            mutation B. It is recorded here and named as NOT the witness:
 *            the task-16 module lives outside both, so the mutation cannot
 *            move it. B2 is about the tracker and NOT about subprocess use
 *            in general — `lib/stamp.mjs` spawns git, so a check written
 *            against child-process usage would be red at baseline.
 *
 * The fixture export is a file this test writes under the OS temporary
 * directory. Neither the reporter nor this test spawns the tracker; the only
 * subprocess here is node running the reporter itself.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const REPORTER = join(REPO, 'scripts', 'lint-deferrals.mjs');
const PREBUILD = join(REPO, 'scripts', 'prebuild.mjs');
const LIB_DIR = join(REPO, 'lib');

test('no mutant-copy residue: a killed run must be cleaned by hand', () => {
  const leftovers = readdirSync(join(REPO, 'scripts')).filter((n) => n.includes('.mut-'));
  assert.deepEqual(leftovers, [], `delete these inert copies, then re-run: ${leftovers.join(', ')}`);
});

// Copy-based mutation (P0-1 repair): the tracked reporter is NEVER
// written. The mutant is a same-directory `*.mut-*.mjs` copy (no imports
// to resolve beyond builtins, and a name no sweep or test glob matches),
// spawned or read, then removed with absence asserted.
let mutSeq = 0;
function writeMutantCopy(mutatedText) {
  mutSeq += 1;
  const copyPath = join(REPO, 'scripts', `lint-deferrals.mut-${process.pid}-${mutSeq}.mjs`);
  writeFileSync(copyPath, mutatedText, 'utf8');
  return copyPath;
}
function removeCopy(copyPath) {
  rmSync(copyPath, { force: true });
  assert.ok(!existsSync(copyPath), 'mutant copy removed — no residue in the tree');
}

/** The five-issue fixture: one per routing outcome the arms pin. */
function fixtureIssues() {
  return [
    {
      id: 'issue-path-1',
      status: 'open',
      title: 'Stamp reads dirty on clean trees',
      description: 'The repair touches lib/stamp.mjs directly.',
    },
    {
      id: 'issue-req-1',
      status: 'open',
      title: 'Intake question on closure',
      description: 'Blocked on the rule in specs/loop/spec.md before routing.',
    },
    {
      id: 'issue-meta-1',
      status: 'open',
      title: 'Declared routing field only',
      description: 'No location anywhere in this prose.',
      metadata: { subject: 'lib/stamp.mjs' },
    },
    {
      id: 'issue-vague-1',
      status: 'open',
      title: 'Could be tidier',
      description: 'This module could be tidier some day, no location named.',
    },
    {
      id: 'issue-closed-1',
      status: 'Closed',
      title: 'Old vague note',
      description: 'Names nothing and is already finished.',
    },
  ];
}

function freshDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-lint-deferrals-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function writeExport(t, issues, { bom = false } = {}) {
  const dir = freshDir(t);
  const file = join(dir, 'export.json');
  const body = JSON.stringify(issues, null, 2);
  writeFileSync(file, bom ? `﻿${body}` : body, 'utf8');
  return file;
}

function writeRaw(t, name, body) {
  const dir = freshDir(t);
  const file = join(dir, name);
  writeFileSync(file, body, 'utf8');
  return file;
}

function runReporter(...args) {
  return runReporterAt(REPORTER, ...args);
}

function runReporterAt(reporterPath, ...args) {
  return spawnSync(process.execPath, [reporterPath, ...args], {
    encoding: 'utf8',
  });
}

function stdoutIds(res) {
  return res.stdout.split('\n').map((l) => l.trim()).filter(Boolean);
}

/**
 * B1 — the witness check over the task-16 module alone. Red means the
 * reporter imports a subprocess facility or invokes the tracker; prose
 * mentions of the tracker in comments trip nothing here, because the
 * patterns require call-shaped context (a quoted binary name, a package
 * entrypoint, a spawn call) rather than bare words.
 */
function reporterSpawnReasons(source) {
  const reasons = [];
  if (source.includes('child_process')) {
    reasons.push('touches child_process (a subprocess facility)');
  }
  if (/execFileSync|execSync|spawnSync/.test(source)) {
    reasons.push('calls a process-spawning function');
  }
  if (/spawn\s*\(/.test(source)) {
    reasons.push('calls spawn(');
  }
  if (/['"]bd['"]/.test(source)) {
    reasons.push("names the 'bd' binary as a command string");
  }
  if (source.includes('@beads/bd')) {
    reasons.push('references the tracker package entrypoint');
  }
  if (/bd\.js/.test(source)) {
    reasons.push('references a bd.js entrypoint');
  }
  if (source.includes('BD_BIN')) {
    reasons.push('references a BD_BIN override');
  }
  return reasons;
}

/**
 * B2's probe: invocation of the TRACKER specifically — the binary by name,
 * the package entrypoint, or a variable naming it. Deliberately NOT
 * subprocess use in general: `lib/stamp.mjs` spawns git, so that wider
 * check would be red at baseline.
 */
function trackerInvocationReasons(source) {
  const reasons = [];
  if (/['"]bd['"]/.test(source)) {
    reasons.push("names the 'bd' binary as a command string");
  }
  if (source.includes('@beads/bd')) {
    reasons.push('references the tracker package entrypoint');
  }
  if (/bd\.js/.test(source)) {
    reasons.push('references a bd.js entrypoint');
  }
  if (source.includes('BD_BIN')) {
    reasons.push('references a BD_BIN override');
  }
  return reasons;
}

function mjsFilesRecursive(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...mjsFilesRecursive(full));
    else if (entry.isFile() && entry.name.endsWith('.mjs')) out.push(full);
  }
  return out;
}

/** Every module the prebuild imports, resolved to an absolute file path. */
function prebuildImportedFiles() {
  const src = readFileSync(PREBUILD, 'utf8');
  const files = [];
  for (const m of src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const rel = m[1].endsWith('.mjs') ? m[1] : `${m[1]}.mjs`;
    files.push(resolve(join(REPO, 'scripts'), rel));
  }
  return files;
}

/**
 * B2 — the standing boundary assertion the spec gives a reason for: nothing
 * under `lib/`, and no step registered in the prebuild's `STEPS` array,
 * imports or spawns the tracker. Returns violation strings, empty when held.
 */
function checkTrackerBoundary() {
  const violations = [];
  for (const file of mjsFilesRecursive(LIB_DIR)) {
    for (const r of trackerInvocationReasons(readFileSync(file, 'utf8'))) {
      violations.push(`${file}: ${r}`);
    }
  }
  const prebuildSrc = readFileSync(PREBUILD, 'utf8');
  const stepsAt = prebuildSrc.indexOf('const STEPS = [');
  const stepsBlock = stepsAt >= 0 ? prebuildSrc.slice(stepsAt) : prebuildSrc;
  if (stepsBlock.includes('verify-issue-links')) {
    violations.push('prebuild STEPS registers the issue-link verifier');
  }
  for (const r of trackerInvocationReasons(stepsBlock)) {
    violations.push(`prebuild STEPS block: ${r}`);
  }
  for (const file of prebuildImportedFiles()) {
    let src = null;
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const r of trackerInvocationReasons(src)) {
      violations.push(`${file}: ${r}`);
    }
  }
  return violations;
}

test('arm 0 — a byte-order-marked export parses like a plain one', (t) => {
  const plain = writeExport(t, fixtureIssues());
  const marked = writeExport(t, fixtureIssues(), { bom: true });
  const a = runReporter(plain);
  const b = runReporter(marked);
  assert.equal(a.status, 0);
  assert.equal(b.status, 0);
  assert.deepEqual(stdoutIds(b), stdoutIds(a));
  assert.ok(stdoutIds(b).includes('issue-vague-1'));
});

test('arm 1 — an issue naming a subject path is not reported', (t) => {
  const file = writeExport(t, fixtureIssues());
  const res = runReporter(file);
  assert.equal(res.status, 0);
  assert.ok(!stdoutIds(res).includes('issue-path-1'));
});

test('arm 1b — a requirement pointer and a declared metadata.subject each keep an issue out', (t) => {
  const file = writeExport(t, fixtureIssues());
  const res = runReporter(file);
  assert.equal(res.status, 0);
  const ids = stdoutIds(res);
  assert.ok(!ids.includes('issue-req-1'));
  assert.ok(!ids.includes('issue-meta-1'));
});

test('arm 2 — an issue naming neither is reported by id', (t) => {
  const file = writeExport(t, fixtureIssues());
  const res = runReporter(file);
  assert.equal(res.status, 0);
  assert.ok(stdoutIds(res).includes('issue-vague-1'));
});

test('arm 3 — a closed issue naming neither is not reported', (t) => {
  const file = writeExport(t, fixtureIssues());
  const res = runReporter(file);
  assert.equal(res.status, 0);
  assert.ok(!stdoutIds(res).includes('issue-closed-1'));
});

test('arm 4 — --strict changes the exit code and nothing else', (t) => {
  const file = writeExport(t, fixtureIssues());
  const plain = runReporter(file);
  const strict = runReporter(file, '--strict');
  assert.equal(plain.status, 0);
  assert.notEqual(strict.status, 0);
  assert.deepEqual(stdoutIds(strict), stdoutIds(plain));
  assert.ok(stdoutIds(plain).includes('issue-vague-1'));
});

test('arm 5 — malformed inputs refuse with the path named, never as zero rows', (t) => {
  const dir = freshDir(t);
  const missing = join(dir, 'absent.json');
  let res = runReporter(missing);
  assert.notEqual(res.status, 0, 'missing file refuses');
  assert.ok(res.stderr.includes(missing), 'refusal names the path');
  assert.deepEqual(stdoutIds(res), []);

  const badJson = writeRaw(t, 'bad.json', 'not json {');
  res = runReporter(badJson);
  assert.notEqual(res.status, 0, 'unparseable file refuses');
  assert.ok(res.stderr.includes(badJson), 'refusal names the path');
  assert.deepEqual(stdoutIds(res), []);

  const notArray = writeRaw(t, 'object.json', '{"id":"x"}');
  res = runReporter(notArray);
  assert.notEqual(res.status, 0, 'non-array top level refuses');
  assert.ok(res.stderr.includes(notArray), 'refusal names the path');
  assert.deepEqual(stdoutIds(res), []);

  res = runReporter();
  assert.notEqual(res.status, 0, 'missing argument refuses');
  assert.match(res.stderr, /missing input file path/);
});

test('arm 5b — an unroutable issue with no id still fails --strict visibly, never silently', (t) => {
  const file = writeExport(t, [
    { status: 'open', title: 'vague', description: 'nothing here' },
  ]);
  const plain = runReporter(file);
  const strict = runReporter(file, '--strict');
  assert.deepEqual(stdoutIds(plain), [], 'no stdout rows without an id');
  assert.deepEqual(stdoutIds(strict), [], 'same rows under --strict');
  assert.equal(plain.status, 0, 'plain exits 0');
  assert.notEqual(strict.status, 0, '--strict exits non-zero');
  assert.match(strict.stderr, /missing id skipped/, 'skip announced on stderr');
});

test('B1 baseline — the source check over scripts/lint-deferrals.mjs alone is green', () => {
  const reasons = reporterSpawnReasons(readFileSync(REPORTER, 'utf8'));
  assert.deepEqual(reasons, []);
});

test('mutation A — skipping unroutable issues silently breaks the arm-2 assertion', (t) => {
  const file = writeExport(t, fixtureIssues());
  const original = readFileSync(REPORTER, 'utf8');
  const anchor = 'return issues.filter((issue) => isUnroutable(issue));';
  assert.ok(original.includes(anchor), 'mutation anchor present in the reporter');
  const mutated = original.replace(anchor, 'return issues.filter(() => false);');
  assert.notEqual(mutated, original);
  const copyPath = writeMutantCopy(mutated);
  try {
    const res = runReporterAt(copyPath, file);
    assert.equal(res.status, 0, 'the mutant still exits 0 — the silence is the defect');
    assert.ok(
      !stdoutIds(res).includes('issue-vague-1'),
      'arm 2 fails under the mutation: the vague issue is no longer reported',
    );
  } finally {
    removeCopy(copyPath);
  }
  assert.equal(readFileSync(REPORTER, 'utf8'), original, 'the tracked reporter was never written');
  const after = runReporter(file);
  assert.ok(stdoutIds(after).includes('issue-vague-1'), 'the shipped reporter still reports');
});

test('mutation B — a tracker-spawning reporter turns B1 red', (t) => {
  writeExport(t, fixtureIssues());
  const original = readFileSync(REPORTER, 'utf8');
  const anchor = 'const unroutable = findUnroutable(parsed);';
  assert.ok(original.includes(anchor), 'mutation anchor present in the reporter');
  const mutated =
    "import { execFileSync } from 'node:child_process';\n" +
    original.replace(
      anchor,
      "let trackerProbe = '';\n  try { trackerProbe = execFileSync('bd', ['list', '--json'], { encoding: 'utf8' }); } catch {} // eslint-disable-line\n  void trackerProbe;\n  const unroutable = findUnroutable(parsed);",
    );
  assert.notEqual(mutated, original);
  const copyPath = writeMutantCopy(mutated);
  try {
    const reasons = reporterSpawnReasons(readFileSync(copyPath, 'utf8'));
    assert.ok(
      reasons.length > 0,
      `B1 goes red under mutation B (reasons: ${reasons.join('; ') || 'none'})`,
    );
  } finally {
    removeCopy(copyPath);
  }
  assert.equal(readFileSync(REPORTER, 'utf8'), original, 'the tracked reporter was never written');
  assert.deepEqual(
    reporterSpawnReasons(readFileSync(REPORTER, 'utf8')),
    [],
    'B1 reads green on the shipped reporter',
  );
});

test('B2 — the lib/ and prebuild boundary holds at baseline and under mutation B, and is NOT the witness', () => {
  assert.deepEqual(checkTrackerBoundary(), [], 'B2 green at baseline');
  const original = readFileSync(REPORTER, 'utf8');
  const mutated =
    "import { execFileSync } from 'node:child_process';\n" +
    original.replace(
      'const unroutable = findUnroutable(parsed);',
      "let trackerProbe = '';\n  try { trackerProbe = execFileSync('bd', ['list', '--json'], { encoding: 'utf8' }); } catch {}\n  void trackerProbe;\n  const unroutable = findUnroutable(parsed);",
    );
  const copyPath = writeMutantCopy(mutated);
  try {
    assert.deepEqual(
      checkTrackerBoundary(),
      [],
      'B2 stays green under mutation B — the task-16 module lives outside both halves of the boundary',
    );
    void copyPath;
  } finally {
    removeCopy(copyPath);
  }
  assert.equal(readFileSync(REPORTER, 'utf8'), original, 'the tracked reporter was never written');
});
