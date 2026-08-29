/**
 * helpers.mjs — throwaway repositories for the Desk's tests.
 *
 * Every test here builds its own git repository in a temp directory and runs
 * the real loop against it. Nothing under test ever touches the working
 * repository: no branch is created in it, nothing is merged into it, and — the
 * rule that matters most in this project — nothing anywhere in these tests can
 * push, because no code path in `loop/` can.
 *
 * The mock runners are ordinary shell commands running an ordinary script.
 * That is not a testing convenience; it is the executor contract itself
 * (specs/loop): one written prompt in, files out, exit or be killed. If a mock
 * built from a plain node script can drive the loop end to end, so can any
 * harness — which is the portability claim, measured.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { makeContext } from '../lib/paths.mjs';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const MOCK = join(HERE, 'mock-executor.mjs');

export function git(dir, args) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' }).toString();
}

export const DEFAULT_CONFIG = {
  publish: false,
  budget: {
    window_days: 30,
    categories: {
      upkeep: ['interpret', 'verify', 'repair', 'prune'],
      new_writing: ['entry', 'tutorial', 'post', 'education'],
      machinery: ['machinery'],
    },
    bounds: { upkeep_floor_pct: 40, new_writing_ceiling_pct: 45, machinery_ceiling_pct: 10 },
  },
  job_caps_minutes: {
    interpret: 30, verify: 30, repair: 30, prune: 30,
    entry: 60, tutorial: 60, post: 60, education: 60, machinery: 60,
  },
  degradation: {
    window_hours: 48,
    shed_levels: [
      { capacity_events: 1, exclude_types: ['post', 'education'], interpret_material_only: false },
      { capacity_events: 2, exclude_types: ['post', 'education', 'entry', 'tutorial'], interpret_material_only: false },
      { capacity_events: 3, exclude_types: ['post', 'education', 'entry', 'tutorial', 'prune', 'machinery'], interpret_material_only: true },
    ],
  },
};

/** Runner ids here are deliberately generic: `loop/` must never name a real one. */
export function runnersYaml({ command, reviewerCommand } = {}) {
  const c = command ?? `node "${MOCK.replace(/\\/g, '/')}" noop "{prompt_file}"`;
  const r = reviewerCommand ?? c;
  return `version: 1
default: mock-frontier
runners:
  - id: mock-frontier
    provider: provider-a
    tier: frontier
    roles: [author, reviewer]
    command: '${c.replace(/'/g, "''")}'
    capacity_stderr_pattern: 'MOCK-CAPACITY-LIMIT'
    startup_failure_stderr_pattern: 'MOCK-AUTH-FAILURE'
  - id: mock-cheap
    provider: provider-a
    tier: cheap
    roles: [author, reviewer]
    command: '${r.replace(/'/g, "''")}'
  - id: mock-other-lane
    provider: provider-b
    tier: cheap
    roles: [author, reviewer]
    command: '${r.replace(/'/g, "''")}'
  - id: mock-reviewer
    provider: provider-a
    tier: frontier
    roles: [reviewer]
    command: '${r.replace(/'/g, "''")}'
`;
}

/**
 * Build a throwaway repository and return a loop context pointed at it.
 *
 * @param {object} [o]
 * @param {Record<string,string>} [o.files]  extra files, path → contents
 * @param {Date} [o.now]
 */
export function makeRepo(o = {}) {
  const root = mkdtempSync(join(tmpdir(), 'atai-loop-'));
  const repo = join(root, 'repo');
  mkdirSync(repo, { recursive: true });
  git(repo, ['init', '--quiet']);
  git(repo, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(repo, ['config', 'user.email', 'desk@example.invalid']);
  git(repo, ['config', 'user.name', 'Desk Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  git(repo, ['config', 'core.autocrlf', 'false']);

  const files = {
    'data/config.json': JSON.stringify(o.config ?? DEFAULT_CONFIG, null, 2) + '\n',
    'runners.yml': o.runners ?? runnersYaml(o),
    'DIRECTIVES.md': o.directives ?? '# DIRECTIVES.md\n\n<!-- directives below this line -->\n',
    'README.md': '# throwaway test repository\n',
    'package.json': JSON.stringify({ name: 'fixture', private: true, scripts: {} }, null, 2) + '\n',
    ...(o.files ?? {}),
  };
  for (const [p, content] of Object.entries(files)) {
    const full = join(repo, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content, 'utf8');
  }
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'fixture: initial']);

  const logLines = [];
  const ctx = makeContext({
    repoRoot: repo,
    worktreeRoot: join(root, 'worktrees'),
    now: o.now ?? (() => new Date()),
    log: (s) => logLines.push(s),
  });
  ctx.testRoot = root;
  ctx.output = () => logLines.join('\n');
  ctx.cleanup = () => {
    try {
      rmSync(root, { recursive: true, force: true, maxRetries: 3 });
    } catch {
      /* Windows sometimes holds a handle briefly; a temp dir left behind is harmless */
    }
  };
  return ctx;
}

/** Write a synthetic ledger. Budget arithmetic is the one place synthetic state is right. */
export function writeLedger(ctx, lines) {
  mkdirSync(join(ctx.repoRoot, 'data'), { recursive: true });
  writeFileSync(
    ctx.ledgerPath,
    lines.map((l) => JSON.stringify(l)).join('\n') + (lines.length ? '\n' : ''),
    'utf8',
  );
}

export function ledgerLine(o) {
  const line = {
    ts: o.ts ?? new Date().toISOString(),
    id: o.id ?? 'j-20260101-01',
    type: o.type ?? 'entry',
    runner: o.runner ?? 'mock-frontier',
    provider: o.provider ?? 'provider-a',
    tier: o.tier ?? 'frontier',
    mm: o.mm ?? 10,
    outcome: o.outcome ?? 'done',
  };
  if (o.note) line.note = o.note;
  if (o.signal) line.signal = o.signal;
  return line;
}

export function hoursAgo(now, h) {
  return new Date(now.getTime() - h * 3600 * 1000).toISOString();
}

export function daysAgo(now, d) {
  return new Date(now.getTime() - d * 24 * 3600 * 1000).toISOString();
}

export function writeQueue(ctx, items) {
  mkdirSync(join(ctx.repoRoot, 'data', 'derived'), { recursive: true });
  writeFileSync(ctx.queuePath, JSON.stringify({ generated_at: new Date().toISOString(), items }, null, 2), 'utf8');
}

export function writeFreshness(ctx, doc) {
  mkdirSync(join(ctx.repoRoot, 'data', 'derived'), { recursive: true });
  writeFileSync(ctx.freshnessPath, JSON.stringify(doc, null, 2), 'utf8');
}

/**
 * Plant a real `job/<id>` branch carrying a committed `.job/brief.md`, the way
 * an interrupted run would leave one. A synthetic marker file would not do:
 * resumption reads the branch, so the branch has to be real.
 */
export function plantJobBranch(ctx, id, { brief = '# a planted brief\n', files = {} } = {}) {
  const branch = `job/${id}`;
  const dir = join(ctx.testRoot, `plant-${id}`);
  git(ctx.repoRoot, ['worktree', 'add', '-b', branch, dir, 'HEAD']);
  mkdirSync(join(dir, '.job'), { recursive: true });
  writeFileSync(join(dir, '.job', 'brief.md'), brief, 'utf8');
  for (const [p, c] of Object.entries(files)) {
    const full = join(dir, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, c, 'utf8');
  }
  git(dir, ['add', '-A']);
  git(dir, ['commit', '--quiet', '--no-verify', '-m', `job ${id}: brief`]);
  git(ctx.repoRoot, ['worktree', 'remove', '--force', dir]);
  return branch;
}

export function mockCommand(mode, extra = '') {
  return `node "${MOCK.replace(/\\/g, '/')}" ${mode} "{prompt_file}"${extra}`;
}
