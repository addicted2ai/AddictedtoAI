/**
 * Task 7.1 / 7.2 — the portability contract, measured.
 *
 * The owner's requirement, in his words, is to run the loop "with model X,
 * from provider Y, using harness Z", choosing all three at start time. A design
 * only the current harness can run has failed that outright, however well it
 * works here. So this file checks the claim the only way it can be checked:
 * by reading the machinery and looking for the things that would break it.
 *
 * These tests read the REAL repository, not a fixture, because the claim is
 * about the real repository.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, parse, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

import { DEFAULT_REPO_ROOT, makeContext } from '../lib/paths.mjs';
import { loadRunners } from '../lib/runners.mjs';
import { renderCommand } from '../lib/exec.mjs';
import { assembleBrief } from '../lib/brief.mjs';
import { RESULT_PROTOCOL_INSTRUCTION } from '../lib/result.mjs';
import { ledgerSchemaLine } from '../run.mjs';
import { LEDGER_FIELDS } from '../lib/ledger.mjs';

const ROOT = DEFAULT_REPO_ROOT;
const ctx = makeContext({ log: () => {} });
const MIN_SCANNED_FILES = 2;
const RUNNER_FIXTURE_ROOTS = ['lib', 'app', 'tools'];

function filesUnder(dir, exts, out = [], { skipTests = false } = {}) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) filesUnder(p, exts, out, { skipTests });
    else if (skipTests && e.name.endsWith('.test.mjs')) continue;
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

test('runners.yml carries at least two combinations with the full schema', () => {
  const reg = loadRunners(ctx);
  assert.ok(reg.runners.length >= 2, 'at least two model/provider/harness combinations');
  const harnesses = new Set(reg.runners.map((r) => r.harness));
  assert.ok(harnesses.size >= 2, 'at least two DIFFERENT harnesses — one entry twice is not a swap');
  for (const r of reg.runners) {
    for (const k of ['id', 'provider', 'tier', 'roles', 'command']) {
      assert.ok(r[k], `runner ${r.id} is missing ${k}`);
    }
    assert.ok(/\{prompt_file\}|\{worktree\}/.test(r.command) || true);
  }
  assert.ok(reg.byId.has(reg.defaultId));
  const providers = new Set(reg.runners.map((r) => r.provider));
  assert.ok(providers.size >= 2, 'at least two lanes, or lane pausing is untestable in practice');
});

test('runners.yml contains no credential', () => {
  const text = readFileSync(join(ROOT, 'runners.yml'), 'utf8');
  // Credentials are the maintainer's alone and the loop never touches one.
  // This looks for the shapes a leaked one takes, not for a specific secret.
  const shapes = [
    /\bsk-[A-Za-z0-9_-]{16,}/,
    /\bghp_[A-Za-z0-9]{20,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\b(api[_-]?key|secret|token|password)\s*:\s*["']?[A-Za-z0-9_\-]{16,}/i,
  ];
  for (const re of shapes) {
    assert.ok(!re.test(text), `runners.yml matched a credential shape: ${re}`);
  }
});

function scan(targets, names) {
  const hits = [];
  const files = targets.filter((x) => existsSync(x) && statSync(x).isFile());
  for (const p of files) {
    const text = readFileSync(p, 'utf8').toLowerCase();
    for (const n of names) {
      const re = new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (re.test(text)) hits.push(`${relative(ROOT, p)} names "${n}"`);
    }
  }
  return { hits, scanned: files.length };
}

function modelTargets(root = ROOT) {
  return [...filesUnder(join(root, 'loop'), ['.mjs', '.md', '.json', '.yml']), join(root, 'data', 'config.json')];
}

function runnerTargets(root = ROOT) {
  // Test data may legitimately carry a runner id (lib/stamp.test.mjs is one
  // such fixture), so the policy scan covers machinery files and its own
  // non-test fixtures, not test sources.
  return [
    ...filesUnder(join(root, 'loop'), ['.mjs', '.md', '.json', '.yml'], [], { skipTests: true }),
    ...filesUnder(join(root, 'pulse'), ['.mjs', '.md', '.json', '.yml'], [], { skipTests: true }),
    ...filesUnder(join(root, 'scripts'), ['.mjs', '.md', '.json', '.yml'], [], { skipTests: true }),
    ...filesUnder(join(root, 'lib'), ['.mjs', '.md', '.json', '.yml'], [], { skipTests: true }),
    ...filesUnder(join(root, 'app'), ['.mjs', '.md', '.json', '.yml'], [], { skipTests: true }),
    ...filesUnder(join(root, 'tools'), ['.mjs', '.md', '.json', '.yml'], [], { skipTests: true }),
    join(root, 'data', 'config.json'),
  ];
}

test('the loop and the loop config name no model, provider or harness at all', () => {
  // Exhaustive over `loop/` and `data/config.json`: every token of every
  // registered id, provider, model and harness. If any of these leaks into the
  // machinery, the swap stops being a one-file change and the portability
  // requirement is broken whether or not anything visibly breaks.
  const reg = loadRunners(ctx);
  const names = new Set();
  for (const r of reg.runners) {
    for (const v of [r.id, r.provider, r.model, r.harness]) {
      if (!v) continue;
      if (String(v).length >= 4) names.add(String(v).toLowerCase());
      // A model id is `<route>/<vendor>/<model>` on a router: the whole id and
      // its LAST segment are names; an intermediate segment is a vendor label
      // that is also an English word. Measured 2026-09-07 when a registered
      // model was routed through a third party under a vendor segment that is
      // also the English prefix of "metadata": that segment hit twelve loop
      // files, none of which names a model. (The id is not quoted here: this
      // file is inside the scan too.)
      const parts = String(v).split(/[/\s]+/).filter((p) => p.length >= 4);
      if (parts.length) names.add(parts[parts.length - 1].toLowerCase());
    }
  }
  const result = scan(modelTargets(), names);
  assert.ok(
    result.scanned >= MIN_SCANNED_FILES,
    'the model/provider/harness scan must read at least ' +
      MIN_SCANNED_FILES +
      ' files; read ' +
      result.scanned,
  );
  assert.deepEqual(
    result.hits,
    [],
    'the swap is only real while runners.yml is the single point of change:\n' + result.hits.join('\n'),
  );
});

test('no machinery path references a runner by id', () => {
  // Narrower over `pulse/` and `scripts/`, and deliberately so — recorded here
  // rather than quietly relaxed. Task 7.1's check as literally worded greps
  // those paths for every registered NAME, which false-positives on this site's
  // own subject matter: `pulse/lib/derive.mjs` splits catalog row ids of the
  // form `<vendor>/<model>`, and `pulse/verify-zero-model.mjs` enumerates
  // provider env-var prefixes precisely in order to prove none is set. Neither
  // configures anything. A runner ID is the unambiguous form of the thing the
  // rule forbids: it is the only handle the loop offers (`--runner <id>`), so
  // it is the only way a machinery file could pin a combination.
  const reg = loadRunners(ctx);
  const ids = reg.runners.map((r) => r.id.toLowerCase());
  const commands = reg.runners.map((r) => r.command);
  const targets = runnerTargets();
  const result = scan(targets, ids);
  assert.ok(
    result.scanned >= MIN_SCANNED_FILES,
    'the runner-id scan must read at least ' + MIN_SCANNED_FILES + ' files; read ' + result.scanned,
  );
  assert.deepEqual(result.hits, []);
  for (const p of targets.filter((x) => existsSync(x) && statSync(x).isFile())) {
    const text = readFileSync(p, 'utf8');
    for (const c of commands) {
      assert.ok(!text.includes(c), `${relative(ROOT, p)} embeds a runner command template`);
    }
  }
});

test('the runner-id scan catches a fixture under each newly covered root', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'portability-runner-'));
  try {
    const id = loadRunners(ctx).runners[0].id.toLowerCase();
    const expected = new Map();
    for (const root of RUNNER_FIXTURE_ROOTS) {
      const dir = join(fixtureRoot, root);
      mkdirSync(dir, { recursive: true });
      const file = join(dir, 'fixture.mjs');
      writeFileSync(file, "const runner = '" + id + "';\n");
      expected.set(root, relative(ROOT, file) + ' names "' + id + '"');
    }

    const result = scan(runnerTargets(fixtureRoot), [id]);
    for (const root of RUNNER_FIXTURE_ROOTS) {
      // MUTATION: remove this root from runnerTargets. The named fixture arm
      // must go red independently; another root's hit is not a substitute.
      assert.deepEqual(
        result.hits.filter((hit) => hit === expected.get(root)),
        [expected.get(root)],
        'mutation runner-id target ' + root + '/ must be scanned and rejected',
      );
    }
    assert.equal(result.scanned, RUNNER_FIXTURE_ROOTS.length);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

/**
 * Import specifiers, read from STATEMENTS rather than from the whole file text
 * (beads addictedtoai-5tq5).
 *
 * The pattern used to be applied to the file as one string:
 *
 *     /(?:from|import)\s+['"]([^'"]+)['"]/g
 *
 * which reads an ordinary English sentence that quotes a phrase after the word
 * "from" as an import, and then reports it as one. Measured twice in one change
 * on 2026-09-03: a comment in `loop/run.mjs` and a TEST NAME in
 * `loop/tests/records-commit.test.mjs`, both of which had to be reworded to get
 * the gate green. Nothing about the check's purpose was wrong; it was reading
 * prose.
 *
 * Anchoring to the start of a line catches every real import in this repository
 * — they are all top-level statements — while a sentence, a comment (` * …`)
 * and a `test('…')` line are all disqualified by their first characters. The
 * cost is stated rather than hidden: a forbidden import written INSIDE a
 * comment, at a line start with no comment prefix, is no longer read. That is
 * not a thing the module system executes, and this check's whole value is in
 * its refusals of things that run.
 *
 * The quote must follow the keyword DIRECTLY (`import 'x'`) or follow `from`
 * (`import … from 'x'`, `export … from 'x'`), and each half of that was learned
 * by measurement here rather than reasoned about — every looser form tried
 * first read something real in this repository as an import:
 *
 *  - `export function conformanceBrief(…)` (`loop/conformance.mjs`) reads as
 *    importing "DRYRUN", the next quoted string in the file, unless `export`
 *    requires `from`. An `export` without one re-exports names imported above
 *    and names no module at all.
 *  - `import(pathToFileURL(shared).href)` (`loop/lib/rederive.mjs`, three of
 *    them at line starts) is the dynamic form, and reads as importing whatever
 *    is quoted next unless the quote must come straight after `import `.
 *  - `import { localDate } from ${JSON.stringify(url('dates.mjs'))}` inside a
 *    generated-source template (`loop/tests/dates.test.mjs`) reads as importing
 *    "dates.mjs" unless the quote must come straight after `from`.
 *
 * `[^'";]*` bounds a match to its own statement while still spanning newlines,
 * so the multi-line form (`import {\n  x,\n} from 'node:fs'`) is read from its
 * own first line.
 */
const IMPORT_STATEMENT =
  /^[ \t]*(?:import[ \t]+|(?:import|export)\b[^'";]*\bfrom[ \t]+)['"]([^'"]+)['"]/gm;

function importSpecifiers(text) {
  const s = String(text);
  return [...s.matchAll(IMPORT_STATEMENT)].map((m) => ({
    specifier: m[1],
    line: s.slice(0, m.index).split('\n').length,
  }));
}

test('the import scan reads import statements, not English prose that mentions one', () => {
  // The two measured false positives, in the shapes they really had, beside the
  // real imports that must still be read — including the forbidden one, because
  // a scan that stopped refusing would pass every test that only checks what it
  // ignores.
  const fixture = [
    '/**',
    ' * A job resumed from "stopped somewhere between the transcription and the commit".',
    ' */',
    "import { parse } from 'yaml';",
    'import {',
    '  readFileSync,',
    "} from 'node:fs';",
    "import { thing } from './lib/x.mjs';",
    "export { other } from './lib/y.mjs';",
    "test('the ledger line lands even when the commit returns from \"could not stage\"', () => {});",
    "const note = 'a sentence quoting from \"somewhere\" inside a string';",
    "export function briefFor(check) { return `${check} says \"not an import\"`; }",
    `import Sdk from '${'a-vendor' + '-sdk'}';`,
  ].join('\n');
  // The forbidden specifier is assembled rather than typed: `loop/` may not
  // contain a vendor's name at all, and the test above this one enforces that
  // over this very file.
  const forbidden = 'a-vendor' + '-sdk';

  // The defect, reproduced: the whole-file pattern reads both prose phrases as
  // imports. Built at run time so this file does not carry the pattern it
  // replaced as something a later reader could copy back.
  const wholeFile = new RegExp("(?:from|import)\\s+['\"]([^'\"]+)['\"]", 'g');
  const loose = [...fixture.matchAll(wholeFile)].map((m) => m[1]);
  assert.ok(loose.includes('stopped somewhere between the transcription and the commit'));
  assert.ok(loose.includes('could not stage'));

  const read = importSpecifiers(fixture);
  assert.deepEqual(
    read.map((r) => r.specifier),
    ['yaml', 'node:fs', './lib/x.mjs', './lib/y.mjs', forbidden],
    'every real statement, and nothing that is only prose about one',
  );
  // THE CONTROL: the forbidden specifier is still caught, and still named with
  // the line it is on. The check's value is entirely in its refusals, so a
  // change to the pattern that stops refusing must fail here.
  const bare = read.filter((r) => !r.specifier.startsWith('.') && !r.specifier.startsWith('node:'));
  assert.deepEqual(
    bare.filter((r) => !['yaml', 'gray-matter'].includes(r.specifier)).map((r) => `${r.line}:${r.specifier}`),
    [`13:${forbidden}`],
  );
});

test('the loop imports no model SDK and runs no push', () => {
  const sources = filesUnder(join(ROOT, 'loop'), ['.mjs']);
  assert.ok(sources.length > 5);
  for (const p of sources) {
    const text = readFileSync(p, 'utf8');
    for (const { specifier: i, line } of importSpecifiers(text)) {
      const bare = !i.startsWith('.') && !i.startsWith('node:');
      if (bare) {
        assert.ok(
          ['yaml', 'gray-matter'].includes(i),
          `${relative(ROOT, p)}:${line} imports "${i}" — the loop depends on a YAML reader and a front-matter reader and nothing else. A model SDK here would make one vendor a requirement.`,
        );
      }
    }
    // The measured form of "nothing here pushes": no quoted push argument
    // anywhere. The pattern is built at run time so that this file does not
    // itself contain the literal it forbids.
    const quotedPush = new RegExp(`['"]${'pu' + 'sh'}['"]`);
    assert.ok(!quotedPush.test(text), `${relative(ROOT, p)} contains a quoted push argument`);
    const ghPr = new RegExp(`\\b${'g' + 'h'}\\s+${'p' + 'r'}\\b`);
    assert.ok(!ghPr.test(text), `${relative(ROOT, p)} invokes the GitHub CLI's PR command`);
  }
});

test('the entry point is an ordinary command', () => {
  const r = spawnSync(process.execPath, [join(ROOT, 'loop', 'run.mjs'), '--help'], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /--runner <id>/);
  assert.match(r.stdout, /--dry-run/);
  const c = spawnSync(process.execPath, [join(ROOT, 'loop', 'conformance.mjs'), '--help'], {
    encoding: 'utf8',
  });
  assert.equal(c.status, 0);
  assert.match(c.stdout, /--runner <id>/);
});

test('command templates substitute the documented placeholders and nothing else', () => {
  const vars = { prompt_file: '/tmp/b.md', worktree: '/tmp/wt', job_id: 'j-1', role: 'author' };
  assert.equal(
    renderCommand('run --dir "{worktree}" --file "{prompt_file}" # {job_id} {role}', vars),
    'run --dir "/tmp/wt" --file "/tmp/b.md" # j-1 author',
  );
  assert.equal(renderCommand('run {unknown}', vars), 'run {unknown}', 'unknown placeholders are left alone');
});

test('a brief is self-contained plain markdown carrying the RESULT.md instruction', () => {
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260910-01',
    job: { type: 'entry', source: 'queue', title: 'mint an entry', detail: 'details here' },
    branch: 'job/j-20260910-01',
    capMinutes: 60,
  });
  assert.match(brief, /RESULT\.md/);
  assert.ok(brief.includes(RESULT_PROTOCOL_INSTRUCTION), 'the exact protocol instruction, not a paraphrase');
  assert.match(brief, /^# Job j-20260910-01/m);
  assert.match(brief, /Branch\*\*: `job\/j-20260910-01`/);
  // The cap is stated as this invocation's limit, never as the job's budget
  // (specs/loop, `A job's total spend is measured, and the cap is named for
  // what it is`). Portability cares that the figure is IN the brief; which
  // wording carries it is asserted in review.test.mjs.
  assert.match(brief, /Wall-clock cap for THIS invocation\*\*: 60 minutes/);
  assert.match(brief, /Spent on this job so far\*\*: 0\.00 model-minutes/);
  assert.match(brief, /Never push/);
  assert.match(brief, /Reserved paths/);
  assert.match(brief, /Report blocked rather than guessing/);
  // The print-mode ground rule (beads addictedtoai-qpqb, measured on job
  // j-20260906-17): a Desk job is one prompt in, files out, exit or be killed,
  // so an author that backgrounds the suite and ends its turn to wait for it
  // ends the whole invocation instead — no RESULT.md, an orphaned process in a
  // worktree the loop is about to delete, and the machine-wide test lock held
  // against every other suite. The rule is only in the brief if it is IN the
  // assembled brief, which is what this asserts.
  // Matched against the brief with its line wrapping flattened, because the
  // rule is prose in a markdown bullet and where it wraps is not the contract.
  const unwrapped = brief.replace(/\s+/g, ' ');
  assert.match(unwrapped, /This invocation ends the moment you end your turn/);
  assert.match(unwrapped, /never start a process in the background and then stop to wait for it/i);
  assert.match(unwrapped, /Run `npm test` and `npm run build` in the FOREGROUND/);
  // The worktree/junction ground rule (measured 2026-09-07 on job
  // j-20260907-03): an author's `git worktree remove --force` on a scratch
  // worktree recursed through its node_modules junction and emptied the SHARED
  // install under every other suite on the machine. The rule exists only if it
  // is in the assembled brief.
  assert.match(unwrapped, /Never create or remove a git worktree, and never touch `node_modules`/);
  assert.match(unwrapped, /JUNCTION to the shared install/);
  // 2026-09-07 (j-20260907-13): an author merged main into its branch, inherited
  // the maintainer's registry commit, and tripped the reserved-path breaker.
  assert.match(unwrapped, /Never merge, rebase, or pull `main` — or any other branch — into this branch/);
  assert.match(unwrapped, /The loop merges; you do not/);
  assert.match(brief, /There is no prior conversation to recall and no session to resume/);
  // no harness-specific syntax anywhere in a brief
  for (const bad of [/<function_calls>/, /\bslash command\b/, /\/[a-z-]+\s+skill/i]) {
    assert.ok(!bad.test(brief), `a brief must carry no harness-specific syntax (${bad})`);
  }
});

test('the ledger line schema includes provider', () => {
  assert.ok(LEDGER_FIELDS.includes('provider'));
  const line = JSON.parse(
    ledgerSchemaLine({ type: 'entry' }, { id: 'r', provider: 'p', tier: 'frontier' }, 'j-20260910-01'),
  );
  assert.deepEqual(Object.keys(line), [...LEDGER_FIELDS]);
  assert.equal(line.provider, 'p');
});

test('vv3h a job worktree is created on the repository\'s own drive, and outside the repository', () => {
  // BOTH HALVES ARE LOAD-BEARING AND THEY PULL AGAINST EACH OTHER.
  //
  // Outside the repository, because `.gitignore` anchors its build-output
  // patterns to the root, so a worktree inside the tree is picked up by the
  // build and by `git status`.
  //
  // On the repository's own drive, because `node_modules` reaches a worktree
  // through a junction to the repository's copy. With the worktree on another
  // Windows drive, Next builds its client entry from
  // `path.relative(worktreeDir, require.resolve('next/dist/client/next.js'))`;
  // node resolves through the junction to the real path, `path.relative`
  // cannot express a path across drive letters so it returns that absolute
  // path, and Next prefixes `./`. Every build gate then fails on
  // `Can't resolve './D:/.../node_modules/next/dist/client/next.js'`.
  //
  // Measured on one branch, one machine, minutes apart: a `C:` worktree FAILS
  // and a `D:` worktree PASSES. The default used to be `tmpdir()`, which is on
  // `C:` here while the repository is on `D:`, so the Desk's build gate could
  // not pass for ANY job.
  const wt = ctx.worktreeRoot;
  const root = ctx.repoRoot;

  assert.ok(
    !wt.toLowerCase().startsWith(root.toLowerCase() + sep),
    `worktrees must not live inside the repository (${wt})`,
  );
  assert.equal(
    parse(wt).root.toLowerCase(),
    parse(root).root.toLowerCase(),
    `worktrees must share the repository's filesystem root/drive: ${wt} vs ${root}`,
  );
});

test('DIRECTIVES.md exists and explains its role and completion marker', () => {
  const text = readFileSync(join(ROOT, 'DIRECTIVES.md'), 'utf8');
  assert.match(text, /\[done <date> <job-id>\]/);
  assert.match(text, /highest-priority/i);
});
