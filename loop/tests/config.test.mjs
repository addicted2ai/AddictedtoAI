/**
 * Task 2.1 (make-the-blog-worth-sending) — `scout` joins the closed job-type
 * list, and the two-step edit that lets it.
 *
 * `JOB_TYPES` and `data/config.json` are edited by two different actors:
 * the config is a reserved path (specs/loop, breaker 4) and only the maintainer
 * writes it, while `loop/lib/config.mjs` is ordinary code. `loadConfig` refuses
 * a config that has no `job_caps_minutes` entry for a listed type — so the
 * halves have an order, and landing the code half first breaks EVERY loop
 * invocation, not merely a scout one. These tests measure both halves: that the
 * refusal really fires and names the type, and that the working repository's own
 * config already satisfies it. The second is the one that matters, because it is
 * the only check here that would notice the reserved-path half being reverted.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';

import { JOB_TYPES, categoryOf, loadConfig } from '../lib/config.mjs';
import { DEFAULT_REPO_ROOT } from '../lib/paths.mjs';
import { degradationGate, budgetGate, shedState, tierShares } from '../lib/budget.mjs';
import { parseDirectives, readDirectives } from '../lib/directives.mjs';
import { readQueue } from '../lib/queue.mjs';
import { readProposals } from '../lib/proposals.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  makeRepo,
  writeLedger,
  writeQueue,
  ledgerLine,
  hoursAgo,
  daysAgo,
  DEFAULT_CONFIG,
} from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

/** loadConfig reads exactly one field off the context, so this is the whole context. */
const REAL_CONFIG_CTX = { configPath: join(DEFAULT_REPO_ROOT, 'data', 'config.json') };

test('`scout` is on the closed job-type list', () => {
  assert.ok(JOB_TYPES.includes('scout'), JOB_TYPES.join('/'));
  // The list is closed and frozen: nothing at run time may extend it.
  assert.throws(() => JOB_TYPES.push('newsletter'), TypeError);
});

test('a config with no cap for `scout` is refused, and the refusal names `scout`', () => {
  const config = structuredClone(DEFAULT_CONFIG);
  delete config.job_caps_minutes.scout;
  const ctx = makeRepo({ now: () => NOW, config });
  assert.throws(
    () => loadConfig(ctx),
    (e) => {
      assert.match(e.message, /job_caps_minutes is missing a cap for job type "scout"/);
      assert.match(e.message, /config\.json/, 'and names the file that has to change');
      return true;
    },
  );
  ctx.cleanup();
});

test('the ordering constraint is not scout-specific — any listed type without a cap refuses', () => {
  // Stated because the ordering argument in tasks.md rests on it: the failure is
  // not "no scout job runs", it is "no job runs at all", including the upkeep
  // work that has nothing to do with this change.
  const config = structuredClone(DEFAULT_CONFIG);
  delete config.job_caps_minutes.repair;
  const ctx = makeRepo({ now: () => NOW, config });
  assert.throws(() => loadConfig(ctx), /missing a cap for job type "repair"/);
  ctx.cleanup();
});

test('the working repository\'s own config satisfies every listed type — the reserved-path half, measured', () => {
  // Read-only, and the only context field loadConfig touches is `configPath`.
  // This is the check that fails if the maintainer's half of task 2.1 is ever
  // reverted while `JOB_TYPES` still lists `scout`.
  const cfg = loadConfig(REAL_CONFIG_CTX);
  for (const t of JOB_TYPES) {
    assert.equal(
      typeof cfg.job_caps_minutes[t],
      'number',
      `data/config.json has no job_caps_minutes cap for "${t}"`,
    );
  }
  assert.equal(cfg.job_caps_minutes.scout, 60, 'the deliberate 60, not the 30 first proposed');
  assert.equal(categoryOf(cfg, 'scout'), 'new_writing');
  // Shedding reads these literal arrays, not the budget categories
  // (`budget.mjs` degradationGate) — so membership is asserted level by level.
  for (const lv of cfg.degradation.shed_levels) {
    assert.ok(
      lv.exclude_types.includes('scout'),
      `shed level ${lv.capacity_events} does not exclude scout: ${lv.exclude_types.join(', ')}`,
    );
  }
});

test('`scout` spends from the new-writing share, and is refused at that ceiling', () => {
  // specs/loop: "New writing (`entry`, `tutorial`, `post`, `education`,
  // `scout`) | ceiling: <= 45%". A warm window, so the denominator is the
  // observed rolling total and the arithmetic is the spec's own.
  const ctx = makeRepo({ now: () => NOW });
  writeLedger(ctx, [
    ledgerLine({ id: 'a', type: 'entry', mm: 450, tier: 'frontier', ts: daysAgo(NOW, 2) }),
    ledgerLine({ id: 'b', type: 'verify', mm: 550, tier: 'frontier', ts: daysAgo(NOW, 3) }),
  ]);
  const cfg = loadConfig(ctx);
  assert.equal(categoryOf(cfg, 'scout'), 'new_writing');
  const shares = tierShares(cfg, readLedger(ctx), 'frontier', NOW);
  const g = budgetGate(cfg, shares, 'scout');
  assert.equal(g.ok, false);
  assert.equal(g.rule, 'budget:new_writing-ceiling');
  assert.match(g.reason, /no scout job is selectable/);
  ctx.cleanup();
});

test('a level-1 shed excludes a scout candidate, from the config\'s own arrays', () => {
  const ctx = makeRepo({ now: () => NOW });
  const cfg = loadConfig(ctx);
  const cap = (h) => ledgerLine({ tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, h) });

  const l1 = shedState(cfg, [cap(4)], 'frontier', NOW);
  assert.equal(l1.level, 1);
  // The exclusion is READ, not hard-coded here: this is the array the
  // maintainer edited, arriving through shedState into the gate.
  assert.deepEqual(l1.exclude_types, cfg.degradation.shed_levels[0].exclude_types);
  assert.ok(l1.exclude_types.includes('scout'));

  const refused = degradationGate(cfg, l1, { type: 'scout' });
  assert.equal(refused.ok, false);
  assert.equal(refused.rule, 'degradation:shed');
  assert.match(refused.reason, /excludes scout jobs/);

  // and shedding stays targeted: upkeep is untouched at level 1
  assert.equal(degradationGate(cfg, l1, { type: 'repair' }).ok, true);
  assert.equal(degradationGate(cfg, l1, { type: 'verify' }).ok, true);

  // Level 0 is the control. Without it, an `exclude_types` array that somehow
  // held every type would pass the assertion above and mean nothing.
  const l0 = shedState(cfg, [], 'frontier', NOW);
  assert.equal(l0.level, 0);
  assert.equal(degradationGate(cfg, l0, { type: 'scout' }).ok, true);
  ctx.cleanup();
});

/* ---------------------------------------------------------------------------
 * The four readers that key off `JOB_TYPES`. Adding a member changes what each
 * one ACCEPTS, and each refuses an unknown type in its own way — so each is
 * measured on `scout` directly rather than inferred from the list membership.
 * ------------------------------------------------------------------------ */

test('directives: `- scout: …` parses as a typed directive rather than an untyped line', () => {
  const parsed = parseDirectives('- scout: sweep the world for what we missed\n');
  assert.equal(parsed[0].type, 'scout');
  assert.equal(parsed[0].task, 'sweep the world for what we missed');

  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- scout: sweep the world for what we missed\n',
  });
  const { directives, warnings } = readDirectives(ctx);
  assert.deepEqual(warnings, [], 'a scout directive is not a line the loop refuses to guess about');
  assert.equal(directives.length, 1);
  assert.equal(directives[0].type, 'scout');
  assert.equal(directives[0].source, 'directive');
  ctx.cleanup();
});

test('directives: the warning for an untyped line offers `scout` among the types', () => {
  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- please have a look at the licence page\n',
  });
  const { warnings } = readDirectives(ctx);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /scout/, 'the closed list it prints is the live one');
  ctx.cleanup();
});

test('queue: a `scout` item is read, not skipped with a warning', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [
    { type: 'scout', title: 'the daily outward sweep', rank: 62, detail: 'uncovered lines' },
    { type: 'newsletter', title: 'not a job type', rank: 99 },
  ]);
  const q = readQueue(ctx);
  assert.deepEqual(q.items.map((i) => i.type), ['scout']);
  assert.equal(q.items[0].rank, 62);
  assert.equal(q.items[0].detail, 'uncovered lines');
  assert.equal(q.items[0].material, false, 'a scout item carries no material field');
  assert.equal(q.warnings.length, 1);
  assert.match(q.warnings[0], /"newsletter"/);
  ctx.cleanup();
});

test('proposals: a `scout` proposal is well-formed, and cools like any other', () => {
  const ctx = makeRepo({ now: () => NOW });
  const plant = (slug, ageDays) => {
    mkdirSync(ctx.proposalsDir, { recursive: true });
    const p = join(ctx.proposalsDir, `${slug}.md`);
    writeFileSync(
      p,
      `---\nslug: ${slug}\ntype: scout\ndate: 2026-09-01\n---\n\nA proposal body.\n`,
      'utf8',
    );
    const t = new Date(NOW.getTime() - ageDays * 24 * 3600 * 1000);
    utimesSync(p, t, t);
  };
  plant('sweep-the-licence-trackers', 10);
  plant('sweep-something-fresh', 1);

  const read = readProposals(ctx);
  assert.deepEqual(read.malformed, [], 'scout is in the closed list, so this is not malformed');
  assert.deepEqual(read.ripe.map((r) => r.slug), ['sweep-the-licence-trackers']);
  assert.equal(read.ripe[0].type, 'scout');
  assert.deepEqual(read.cooling.map((r) => r.slug), ['sweep-something-fresh']);
  ctx.cleanup();
});
