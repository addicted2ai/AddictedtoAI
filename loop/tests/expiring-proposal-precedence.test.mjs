/**
 * expiring-proposal-precedence.test.mjs — dated news outranks the derived
 * queue (change `let-dated-news-outrank-the-queue`, beads addictedtoai-mtnk).
 *
 * The rule is narrow on purpose and the control below is the point of this
 * file: an EXPIRING proposal is reached before the queue; a proposal with no
 * expiry still is not. "Proposals first" would be a far larger claim than the
 * evidence supports, and the second test is what stops this fix drifting into
 * it.
 *
 * Why the rule exists at all: the derived queue has no deadline — an item it
 * does not reach today it recomputes tomorrow — while expiring evidence not
 * written before its date is swept to `dropped/` and gone. Measured
 * 2026-09-02: the blog published nothing on 2026-09-01 across twenty-three
 * jobs, with three dated `post` proposals selectable the whole time.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';

import { gatherCandidates, selectJob } from '../lib/select.mjs';
import { loadConfig } from '../lib/config.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { makeRepo, writeQueue, writeLedger, ledgerLine } from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

/** Plant a proposal. `expires` is written BARE, the shape a model writes. */
function plant(ctx, slug, { type = 'post', expires = null, ageDays = 30 } = {}) {
  const dir = join(ctx.repoRoot, 'data', 'proposals');
  mkdirSync(dir, { recursive: true });
  const p = join(dir, `${slug}.md`);
  const fm = [
    `slug: ${slug}`,
    `type: ${type}`,
    'date: 2026-09-01',
    ...(expires === null ? [] : [`expires: ${expires}`]),
  ].join('\n');
  writeFileSync(p, `---\n${fm}\n---\n\nA candidate body.\n`, 'utf8');
  const t = new Date(NOW.getTime() - ageDays * 86400000);
  utimesSync(p, t, t);
  return p;
}

const kinds = (c) => c.candidates.map((x) => `${x.priority}:${x.type ?? x.slug ?? '?'}`);

test('an expiring proposal is reached BEFORE the derived queue', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'repair', title: 'a routine repair' }]);
  plant(ctx, 'dated-news', { type: 'post', expires: '2026-09-14' });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(
    got.candidates[0]?.type,
    'post',
    `the dated post must come first, got ${kinds(got).join(' | ')}`,
  );
  assert.ok(
    got.candidates.some((c) => c.type === 'repair'),
    'and the queue item is still a candidate, merely later',
  );
  ctx.cleanup();
});

test('THE CONTROL: a proposal with NO expiry still ranks below the queue', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'repair', title: 'a routine repair' }]);
  plant(ctx, 'undated-idea', { type: 'post', expires: null });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(
    got.candidates[0]?.type,
    'repair',
    `with no deadline there is nothing to preempt for, got ${kinds(got).join(' | ')}`,
  );
  ctx.cleanup();
});

test('the soonest deadline wins inside the expiring band', () => {
  const ctx = makeRepo({ now: () => NOW });
  plant(ctx, 'expires-later', { type: 'post', expires: '2026-09-20' });
  plant(ctx, 'expires-sooner', { type: 'post', expires: '2026-09-12' });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(got.candidates[0]?.slug, 'expires-sooner', kinds(got).join(' | '));
  ctx.cleanup();
});

test("the maintainer's directives still outrank dated news", () => {
  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- repair: fix the thing he asked for\n',
  });
  plant(ctx, 'dated-news', { type: 'post', expires: '2026-09-14' });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(got.candidates[0]?.priority, 1, `a directive outranks everything: ${kinds(got).join(' | ')}`);
  ctx.cleanup();
});

test('the reordering does NOT buy a budget exemption — the ceiling still refuses', () => {
  // A ledger that is nothing but new writing puts the category far over its
  // 45% ceiling. Reaching a job sooner must not mean it may run.
  const lines = [];
  for (let i = 0; i < 8; i++) {
    lines.push(
      ledgerLine({
        id: `j-20260909-${String(i + 1).padStart(2, '0')}`,
        ts: new Date(NOW.getTime() - (i + 1) * 3600000).toISOString(),
        type: 'post',
        mm: 60,
      }),
    );
  }
  const ctx = makeRepo({ now: () => NOW });
  writeLedger(ctx, lines);
  plant(ctx, 'dated-news', { type: 'post', expires: '2026-09-14' });

  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: 'mock-frontier', role: 'author' });
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });

  assert.notEqual(
    sel.selected?.type,
    'post',
    'an expiring proposal over the new-writing ceiling must still be refused',
  );
  assert.ok(
    sel.refusals.some((r) => String(r.rule ?? '').includes('new_writing')),
    `and the refusal must name the ceiling, got: ${JSON.stringify(sel.refusals.map((r) => r.rule))}`,
  );
  ctx.cleanup();
});
