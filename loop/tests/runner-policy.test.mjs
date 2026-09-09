/**
 * Runner-policy escalation tests.
 *
 * These fixtures keep the policy in a throwaway registry and make the queue
 * order explicit. The selection helper and the runLoop call site are both
 * exercised, so a routing rule cannot pass while the selected job or runner
 * is lost at the boundary between them.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';

import { loadConfig } from '../lib/config.mjs';
import { NO_OUTPUT_SIGNAL } from '../lib/health.mjs';
import { loadRunners } from '../lib/runners.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { escalationTarget, selectJob } from '../lib/select.mjs';
import { runLoop } from '../run.mjs';
import {
  ledgerLine,
  makeRepo,
  mockCommand,
  hoursAgo,
  writeLedger,
  writeQueue,
} from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');
const CHEAP = 'mock-policy-cheap';
const FRONTIER = 'mock-policy-frontier';
const REVIEWER = 'mock-policy-reviewer';

function yamlCommand() {
  return mockCommand('noop').replace(/'/g, "''");
}

function policyRegistry({ cheapTypes = ['repair'], frontierTypes = null, escalatesTo = FRONTIER } = {}) {
  const command = yamlCommand();
  const cheapClearance = cheapTypes.join(', ');
  const frontierClearance = frontierTypes ? `    job_types: [${frontierTypes.join(', ')}]\n` : '';
  const escalation = escalatesTo === undefined ? '' : `    escalates_to: ${escalatesTo}\n`;
  return `version: 1
default: ${FRONTIER}
runners:
  - id: ${CHEAP}
    provider: provider-a
    tier: cheap
    roles: [author]
    command: '${command}'
    job_types: [${cheapClearance}]
${escalation}  - id: ${FRONTIER}
    provider: provider-b
    tier: frontier
    roles: [author, reviewer]
${frontierClearance}    command: '${command}'
  - id: ${REVIEWER}
    provider: provider-a
    tier: frontier
    roles: [reviewer]
    command: '${command}'
`;
}

function fixture({ queue, ledger = [], cheapTypes = ['repair'], frontierTypes = null } = {}) {
  const ctx = makeRepo({
    now: () => NOW,
    runners: policyRegistry({ cheapTypes, frontierTypes }),
  });
  writeQueue(ctx, queue);
  writeLedger(ctx, ledger);
  return ctx;
}

function loaded(ctx) {
  const registry = loadRunners({ runnersPath: ctx.runnersPath });
  const cfg = loadConfig(ctx);
  return { registry, cfg };
}

function selection(ctx, runnerId = CHEAP) {
  const { registry, cfg } = loaded(ctx);
  const runner = registry.byId.get(runnerId);
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });
  return { registry, cfg, runner, sel };
}

function malformedRegistry(escalationLine) {
  const command = yamlCommand();
  const ctx = makeRepo({
    now: () => NOW,
    runners: `version: 1
default: mock-source
runners:
  - id: mock-source
    provider: provider-a
    tier: cheap
    roles: [author]
    command: '${command}'
    escalates_to: ${escalationLine}
  - id: mock-target
    provider: provider-b
    tier: frontier
    roles: [author]
    command: '${command}'
`,
  });
  return ctx;
}

test('conformance refusal has no ranked candidate and no escalation target', () => {
  const ctx = fixture({
    queue: [{ type: 'scout', title: 'the queued scout', rank: 100 }],
  });
  writeFileSync(
    ctx.conformancePath,
    JSON.stringify({
      [CHEAP]: {
        date: NOW.toISOString(),
        checks: [{ name: 'trivial-edit', result: 'FAIL' }],
      },
    }),
    'utf8',
  );
  const { registry, runner, sel } = selection(ctx);
  assert.equal(sel.topRanked, null);
  assert.equal(sel.selected, null);
  assert.ok(sel.blocked);
  assert.equal(escalationTarget(registry, runner, sel), null);
  ctx.cleanup();
});

test('health refusal has no ranked candidate and no escalation target', () => {
  const ctx = fixture({
    queue: [{ type: 'scout', title: 'the queued scout', rank: 100 }],
    ledger: Array.from({ length: 3 }, (_, i) =>
      ledgerLine({
        id: `health-${i}`,
        runner: CHEAP,
        provider: 'provider-a',
        tier: 'cheap',
        outcome: 'interrupted',
        signal: NO_OUTPUT_SIGNAL,
        mm: 0,
        ts: new Date(NOW.getTime() - i * 1000).toISOString(),
      }),
    ),
  });
  const { registry, runner, sel } = selection(ctx);
  assert.equal(sel.topRanked, null);
  assert.equal(sel.selected, null);
  assert.ok(sel.blocked);
  assert.equal(escalationTarget(registry, runner, sel), null);
  ctx.cleanup();
});

test('paused lane has no ranked candidate and no escalation target', () => {
  const ctx = fixture({
    queue: [{ type: 'scout', title: 'the queued scout', rank: 100 }],
    ledger: [
      ledgerLine({
        runner: CHEAP,
        provider: 'provider-a',
        tier: 'cheap',
        outcome: 'capacity',
        ts: hoursAgo(NOW, 0.5),
      }),
    ],
  });
  const { registry, runner, sel } = selection(ctx);
  assert.equal(sel.topRanked, null);
  assert.equal(sel.selected, null);
  assert.ok(sel.blocked);
  assert.equal(escalationTarget(registry, runner, sel), null);
  ctx.cleanup();
});

test('a top-ranked clearance refusal escalates and selects the same scout', () => {
  const ctx = fixture({
    queue: [{ type: 'scout', title: 'the daily outward sweep', rank: 100 }],
  });
  const first = selection(ctx);
  assert.equal(first.sel.selected, null);
  assert.equal(first.sel.topRanked.candidate.type, 'scout');
  assert.equal(first.sel.topRanked.rule, 'runner:job-type');

  const target = escalationTarget(first.registry, first.runner, first.sel);
  assert.equal(target.id, FRONTIER);
  const rerun = selectJob(ctx, {
    cfg: first.cfg,
    ledger: readLedger(ctx),
    runner: target,
    dryRun: true,
  });
  assert.equal(rerun.topRanked, null);
  assert.equal(rerun.selected.type, 'scout');
  ctx.cleanup();
});

test('a budget-ceiling refusal does not escalate', () => {
  const ctx = fixture({
    queue: [{ type: 'post', title: 'a new post', rank: 100 }],
    ledger: [
      ledgerLine({ id: 'budget-cheap', type: 'post', tier: 'cheap', provider: 'provider-a', mm: 600, ts: NOW.toISOString() }),
      ledgerLine({ id: 'budget-frontier', type: 'post', tier: 'frontier', provider: 'provider-b', mm: 600, ts: NOW.toISOString() }),
    ],
    cheapTypes: ['post'],
  });
  const first = selection(ctx);
  assert.equal(first.sel.selected, null);
  assert.equal(first.sel.topRanked.rule, 'budget:new_writing-ceiling');
  assert.equal(escalationTarget(first.registry, first.runner, first.sel), null);
  ctx.cleanup();
});

test('a cleared lower-ranked repair cannot displace the top-ranked scout', async () => {
  const ctx = fixture({
    queue: [
      { type: 'scout', title: 'the daily outward sweep', rank: 100 },
      { type: 'repair', title: 'a repair below the scout', rank: 1 },
    ],
  });
  const first = selection(ctx);
  assert.equal(first.sel.selected.type, 'repair');
  assert.equal(first.sel.topRanked.candidate.type, 'scout');
  assert.equal(first.sel.topRanked.rule, 'runner:job-type');
  assert.equal(escalationTarget(first.registry, first.runner, first.sel).id, FRONTIER);

  const result = await runLoop(ctx, {
    runner: CHEAP,
    reviewer: REVIEWER,
    dryRun: true,
  });
  assert.equal(result.job.type, 'scout');
  assert.equal(result.runner.id, FRONTIER);
  assert.match(ctx.output(), /selected: scout from queue/);
  ctx.cleanup();
});

test('an escalation entry refusal keeps the lower-ranked repair on the original runner', async () => {
  const ctx = fixture({
    queue: [
      { type: 'scout', title: 'the daily outward sweep', rank: 100 },
      { type: 'repair', title: 'a repair below the scout', rank: 1 },
    ],
    ledger: [
      ledgerLine({ id: 'frontier-budget', type: 'post', tier: 'frontier', provider: 'provider-b', mm: 600, ts: NOW.toISOString() }),
    ],
  });
  const first = selection(ctx);
  assert.equal(first.sel.selected.type, 'repair');
  assert.equal(first.sel.topRanked.rule, 'runner:job-type');
  const target = escalationTarget(first.registry, first.runner, first.sel);
  const rerun = selectJob(ctx, {
    cfg: first.cfg,
    ledger: readLedger(ctx),
    runner: target,
    dryRun: true,
  });
  assert.equal(rerun.topRanked.candidate.type, 'scout');
  assert.equal(rerun.topRanked.rule, 'budget:new_writing-ceiling');
  assert.equal(rerun.selected.type, 'repair');

  const result = await runLoop(ctx, {
    runner: CHEAP,
    reviewer: REVIEWER,
    dryRun: true,
  });
  assert.equal(result.job.type, 'repair');
  assert.equal(result.runner.id, CHEAP);
  assert.match(ctx.output(), /top-ranked scout candidate refused \[runner:job-type\]/);
  assert.match(ctx.output(), /escalation refused: runner "mock-policy-frontier" refused \[budget:new_writing-ceiling\]/);
  ctx.cleanup();
});

test('registry escalation targets must be known, distinct, and author-capable', () => {
  const ctx = makeRepo({ now: () => NOW, runners: policyRegistry() });
  const command = yamlCommand();
  const registryText = ({ targetId, targetRoles, escalationLine }) => `version: 1
default: mock-source
runners:
  - id: mock-source
    provider: provider-a
    tier: cheap
    roles: [author]
    command: '${command}'
    escalates_to: ${escalationLine}
${targetId === 'mock-source' ? '' : `  - id: ${targetId}
    provider: provider-b
    tier: frontier
    roles: [${targetRoles}]
    command: '${command}'
`}`;

  writeFileSync(ctx.runnersPath, registryText({ targetId: 'mock-target', targetRoles: 'author', escalationLine: 'mock-missing' }));
  assert.throws(
    () => loadRunners({ runnersPath: ctx.runnersPath }),
    /"escalates_to" names unknown runner "mock-missing"/,
  );

  writeFileSync(ctx.runnersPath, registryText({ targetId: 'mock-source', targetRoles: 'author', escalationLine: 'mock-source' }));
  assert.throws(
    () => loadRunners({ runnersPath: ctx.runnersPath }),
    /"escalates_to" must name a different runner than itself/,
  );

  writeFileSync(ctx.runnersPath, registryText({ targetId: 'mock-review-only', targetRoles: 'reviewer', escalationLine: 'mock-review-only' }));
  assert.throws(
    () => loadRunners({ runnersPath: ctx.runnersPath }),
    /"escalates_to" target "mock-review-only" is not cleared for the author role/,
  );

  writeFileSync(ctx.runnersPath, `version: 1
default: mock-source
runners:
  - id: mock-source
    provider: provider-a
    tier: cheap
    roles: [author]
    command: '${command}'
  - id: mock-target
    provider: provider-b
    tier: frontier
    roles: [author]
    command: '${command}'
`);
  assert.equal(loadRunners({ runnersPath: ctx.runnersPath }).byId.get('mock-source').escalates_to, undefined);

  ctx.cleanup();
});

test('registry rejects an empty escalation string', () => {
  const ctx = malformedRegistry("''");
  assert.throws(
    () => loadRunners({ runnersPath: ctx.runnersPath }),
    /"escalates_to" must be a non-empty string when present/,
  );
  ctx.cleanup();
});

test('registry rejects a whitespace-only escalation string', () => {
  const ctx = malformedRegistry("'   '");
  assert.throws(
    () => loadRunners({ runnersPath: ctx.runnersPath }),
    /"escalates_to" must be a non-empty string when present/,
  );
  ctx.cleanup();
});

test('registry rejects a non-string escalation value', () => {
  const ctx = malformedRegistry('1');
  assert.throws(
    () => loadRunners({ runnersPath: ctx.runnersPath }),
    /"escalates_to" must be a non-empty string when present/,
  );
  ctx.cleanup();
});

test('registry rejects a bare escalation key', () => {
  const ctx = malformedRegistry('');
  assert.throws(
    () => loadRunners({ runnersPath: ctx.runnersPath }),
    /"escalates_to" must be a non-empty string when present/,
  );
  ctx.cleanup();
});

test('escalationTarget returns null for non-clearance refusals and missing fields', () => {
  const registry = { byId: new Map([[FRONTIER, { id: FRONTIER, roles: ['author'] }]]) };
  const runner = { id: CHEAP, escalates_to: FRONTIER };
  const candidate = { type: 'scout' };
  assert.equal(
    escalationTarget(registry, runner, { topRanked: { candidate, rule: 'budget:new_writing-ceiling' } }),
    null,
  );
  assert.equal(escalationTarget(registry, { id: CHEAP }, { topRanked: { candidate, rule: 'runner:job-type' } }), null);
  assert.equal(escalationTarget(registry, runner, { topRanked: null }), null);
});
