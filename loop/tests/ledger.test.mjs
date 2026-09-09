import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { appendLedger, makeLedgerLine, readLedger } from '../lib/ledger.mjs';
import { loadRunners } from '../lib/runners.mjs';
import { runLoop } from '../run.mjs';
import { makeRepo, mockCommand, runnersYaml, writeQueue } from './helpers.mjs';

test('ledger telemetry and per-phase effort round-trip without changing required fields', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const line = makeLedgerLine({
    ts: '2026-09-09T12:00:00.000Z',
    id: 'j-20260909-01',
    type: 'repair',
    runner: 'mock-frontier',
    provider: 'provider-a',
    tier: 'frontier',
    mm: 12.34,
    outcome: 'done',
    phases: [
      { role: 'author', runner: 'mock-frontier', effort: null, mm: 5, killed: false, code: 0, outcome: 'done' },
      { role: 'review1', runner: 'mock-reviewer', effort: 'registry-rung', carried: 2, mm: 3, killed: false, code: 0, outcome: 'approve' },
      { role: 'revision', runner: 'mock-frontier', effort: null, mm: 2, killed: false, code: 0, outcome: 'unclassified' },
      { role: 'review2', runner: 'mock-reviewer', effort: 'registry-rung', carried: 0, mm: 2.34, killed: false, code: 0, outcome: 'approve' },
    ],
    brief_chars: 1234,
    gate_seconds: { test: 1.2, 'verify-surfaces': 0.4 },
    authority_sha: 'a'.repeat(40),
  });

  appendLedger(ctx, line);
  const written = readLedger(ctx);
  assert.deepEqual(written, [line]);
  assert.equal(written[0].brief_chars, 1234);
  assert.deepEqual(written[0].gate_seconds, { test: 1.2, 'verify-surfaces': 0.4 });
  assert.equal(written[0].authority_sha, 'a'.repeat(40));

  for (const phase of written[0].phases) {
    assert.ok(phase.runner);
    assert.ok(Object.hasOwn(phase, 'effort'));
    if (phase.role.startsWith('review')) {
      assert.ok(Object.hasOwn(phase, 'carried'));
    } else {
      assert.equal(Object.hasOwn(phase, 'carried'), false);
    }
  }
});

test('a pre-existing eight-key ledger line still validates', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const oldLine = {
    ts: '2026-09-08T12:00:00.000Z',
    id: 'j-20260908-01',
    type: 'entry',
    runner: 'mock-frontier',
    provider: 'provider-a',
    tier: 'frontier',
    mm: 4,
    outcome: 'done',
  };

  appendLedger(ctx, oldLine);
  assert.deepEqual(readLedger(ctx), [oldLine]);
});

test('a registry effort is copied to each phase, while absent effort remains null', async (t) => {
  const authorEffort = ['fixture', 'author', 'rung'].join('-');
  const reviewerEffort = ['fixture', 'reviewer', 'rung'].join('-');
  const runners = runnersYaml({
    command: mockCommand('done-edit'),
    reviewerCommand: mockCommand('review-approve'),
  })
    .replace('  - id: mock-frontier\n', `  - id: mock-frontier\n    effort: ${authorEffort}\n`)
    .replace('  - id: mock-reviewer\n', `  - id: mock-reviewer\n    effort: ${reviewerEffort}\n`);
  const ctx = makeRepo({
    runners,
    gitignore: 'node_modules/\n*.log\n/HOLD.md\n/STOP\n/RESULT.md\n',
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'a repair for phase telemetry' }]);

  const result = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    noGates: true,
  });
  assert.equal(result.outcome, 'done', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.equal(line.phases.find((phase) => phase.role === 'author').effort, authorEffort);
  assert.equal(line.phases.find((phase) => phase.role === 'review1').effort, reviewerEffort);
  assert.equal(line.phases.find((phase) => phase.role === 'review1').carried, 0);
  assert.equal(line.phases.find((phase) => phase.role === 'author').carried, undefined);
  assert.equal(line.phases.every((phase) => Object.hasOwn(phase, 'effort')), true);
  assert.equal(line.brief_chars > 0, true);
  assert.equal(line.gate_seconds, undefined);
  assert.equal(line.authority_sha.length, 40);
});

test('a registry effort is optional but invalid empty values fail at load time', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const runnersPath = join(ctx.repoRoot, 'runners.yml');
  const original = runnersYaml({
    command: mockCommand('noop'),
    reviewerCommand: mockCommand('review-approve'),
  });
  assert.equal(loadRunners({ runnersPath }).byId.get('mock-frontier').effort, undefined);

  writeFileSync(
    runnersPath,
    original.replace('    provider: provider-a\n', '    effort: ""\n    provider: provider-a\n'),
    'utf8',
  );
  assert.throws(() => loadRunners({ runnersPath }), /effort.*non-empty string/);
});

test('the outcome line records the last run of each gate in seconds', async (t) => {
  const ctx = makeRepo({
    gitignore: 'node_modules/\n*.log\n/HOLD.md\n/STOP\n/RESULT.md\n',
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'a repair for gate telemetry' }]);

  const branchAnswers = [
    {
      ok: false,
      results: [{ script: 'test', ok: false, status: 1, durationMs: 1000, output: 'ordinary failure' }],
      output: 'ordinary failure',
    },
    {
      ok: true,
      results: [
        { script: 'test', ok: true, status: 0, durationMs: 2349, output: '' },
        { script: 'build', ok: true, status: 0, durationMs: 3451, output: '' },
      ],
      output: '',
    },
  ];
  let branchRuns = 0;
  const gates = (current, dir) => {
    if (dir === current.repoRoot) {
      return {
        ok: true,
        results: [{ script: 'build', ok: true, status: 0, durationMs: 9999, output: '' }],
        output: '',
      };
    }
    return branchAnswers[Math.min(branchRuns++, branchAnswers.length - 1)];
  };

  const result = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    gates,
  });
  assert.equal(result.outcome, 'done', ctx.output());
  assert.deepEqual(readLedger(ctx).at(-1).gate_seconds, { test: 2.3, build: 3.5 });
});
