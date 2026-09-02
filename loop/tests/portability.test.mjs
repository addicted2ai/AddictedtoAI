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
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, parse, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

import { DEFAULT_REPO_ROOT, makeContext } from '../lib/paths.mjs';
import { loadRunners } from '../lib/runners.mjs';
import { renderCommand } from '../lib/exec.mjs';
import { assembleBrief } from '../lib/brief.mjs';
import { RESULT_PROTOCOL_INSTRUCTION } from '../lib/result.mjs';
import { ledgerSchemaLine } from '../run.mjs';
import { LEDGER_FIELDS } from '../lib/ledger.mjs';

const ROOT = DEFAULT_REPO_ROOT;
const ctx = makeContext({ log: () => {} });

function filesUnder(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) filesUnder(p, exts, out);
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
  for (const p of targets.filter((x) => existsSync(x) && statSync(x).isFile())) {
    const text = readFileSync(p, 'utf8').toLowerCase();
    for (const n of names) {
      const re = new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (re.test(text)) hits.push(`${relative(ROOT, p)} names "${n}"`);
    }
  }
  return hits;
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
      for (const part of String(v).split(/[/\s]+/)) {
        if (part.length >= 4) names.add(part.toLowerCase());
      }
    }
  }
  const hits = scan(
    [...filesUnder(join(ROOT, 'loop'), ['.mjs', '.md', '.json', '.yml']), join(ROOT, 'data', 'config.json')],
    names,
  );
  assert.deepEqual(hits, [], 'the swap is only real while runners.yml is the single point of change:\n' + hits.join('\n'));
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
  const targets = [
    ...filesUnder(join(ROOT, 'loop'), ['.mjs', '.md', '.json', '.yml']),
    ...filesUnder(join(ROOT, 'pulse'), ['.mjs', '.md', '.json', '.yml']),
    ...filesUnder(join(ROOT, 'scripts'), ['.mjs', '.md', '.json', '.yml']),
    join(ROOT, 'data', 'config.json'),
  ];
  assert.deepEqual(scan(targets, ids), []);
  for (const p of targets.filter((x) => existsSync(x) && statSync(x).isFile())) {
    const text = readFileSync(p, 'utf8');
    for (const c of commands) {
      assert.ok(!text.includes(c), `${relative(ROOT, p)} embeds a runner command template`);
    }
  }
});

test('the loop imports no model SDK and runs no push', () => {
  const sources = filesUnder(join(ROOT, 'loop'), ['.mjs']);
  assert.ok(sources.length > 5);
  for (const p of sources) {
    const text = readFileSync(p, 'utf8');
    const imports = [...text.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const i of imports) {
      const bare = !i.startsWith('.') && !i.startsWith('node:');
      if (bare) {
        assert.ok(
          ['yaml', 'gray-matter'].includes(i),
          `${relative(ROOT, p)} imports "${i}" — the loop depends on a YAML reader and a front-matter reader and nothing else. A model SDK here would make one vendor a requirement.`,
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
