/**
 * Task 7.8 — the surface and degradation rules the specs assert, each a real
 * selector behaviour with its own synthetic-state test.
 *
 * Every refusal below names its rule in the selector's output. A rule that
 * refuses silently is indistinguishable from a rule that is not there.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, mkdirSync, utimesSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig, JOB_TYPES } from '../lib/config.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { selectJob, formatRefusals, runnerJobTypeGate } from '../lib/select.mjs';
import { readProposals } from '../lib/proposals.mjs';
import {
  makeRepo,
  writeLedger,
  ledgerLine,
  writeQueue,
  writeFreshness,
  hoursAgo,
  daysAgo,
} from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

/** This file lives at <repo>/loop/tests/, so the repository root is two up. */
const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

function select(ctx, { runnerId = 'mock-frontier' } = {}) {
  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: runnerId, role: 'author' });
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });
  sel.text = formatRefusals(sel.refusals).join('\n');
  return sel;
}

function post(date, slug) {
  return [`content/blog/${slug}.md`, `---\ntitle: ${slug}\ndate: ${date}\n---\n\nBody.\n`];
}

// ---------------------------------------------------------------------------
// (a) no count controls the blog — specs/blog, "publishing is quality-gated,
// never quota-driven" (make-the-blog-worth-sending, task 1.3)
//
// Three tests stood here and asserted the rolling ceiling: three posts in the
// trailing seven days refused a fourth, two allowed a third, and older posts
// and drafts did not spend it. The ceiling is gone, so the assertion that
// replaces them is the one that would catch it coming back — the corpus that
// used to trip it selects the post job, and no refusal counts published posts.
// ---------------------------------------------------------------------------

test('(a) a week already holding three posts does not refuse a fourth post job', () => {
  const files = Object.fromEntries([
    post('2026-09-09', 'one'),
    post('2026-09-07', 'two'),
    post('2026-09-05', 'three'),
  ]);
  const ctx = makeRepo({ now: () => NOW, files });
  writeQueue(ctx, [{ type: 'post', title: 'a fourth post this week' }]);

  const sel = select(ctx);
  assert.equal(sel.selected?.type, 'post', sel.text);
  // Named narrowly on purpose: `budget:new_writing-ceiling` counts
  // model-minutes and is untouched. What must not exist is a rule that counts
  // *posts*, and every such rule lived under the `blog:` prefix.
  assert.ok(
    !sel.refusals.some((r) => String(r.rule ?? '').startsWith('blog:')),
    `no selector rule counts published posts, but one refused: ${sel.text}`,
  );
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// (b) tutorial upkeep priority and the demotion gate — specs/education-dynamic
// ---------------------------------------------------------------------------

test('(b) a tutorial re-verify wins over a new tutorial in the same tier', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [
    { type: 'tutorial', title: 'write a shiny new tutorial', rank: 1 },
    { type: 'verify', title: 're-verify the in-browser inference tutorial', rank: 2, subject_kind: 'tutorial' },
  ]);
  const sel = select(ctx);
  assert.equal(sel.selected.type, 'verify', sel.text);
  const refusal = sel.refusals.find((r) => r.candidate?.type === 'tutorial');
  assert.equal(refusal.rule, 'education-dynamic:verify-outranks-tutorial');
  assert.match(sel.text, /re-verifying existing tutorials takes\s+priority/);
  ctx.cleanup();
});

test('(b) a new tutorial is refused entirely while any tutorial stands demoted for staleness', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'tutorial', title: 'write a shiny new tutorial' }]);
  writeFreshness(ctx, {
    tutorials: [{ id: 'browser-inference', state: 'demoted', subject_status: 'active' }],
  });
  const sel = select(ctx);
  assert.equal(sel.selected, null);
  assert.equal(sel.refusals[0].rule, 'education-dynamic:demotion-gate');
  assert.match(sel.text, /browser-inference/);
  ctx.cleanup();
});

test('(b) a demoted tutorial whose subject is dead does not block — archival is the right end state', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'tutorial', title: 'write a shiny new tutorial' }]);
  writeFreshness(ctx, {
    tutorials: [
      { id: 'dead-thing', state: 'demoted', subject_status: 'dead' },
      { id: 'archived-thing', state: 'archived', demoted: true },
    ],
  });
  const sel = select(ctx);
  assert.equal(sel.selected?.type, 'tutorial', sel.text);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// (c) proposal duplicate suppression and cooling — specs/loop
// ---------------------------------------------------------------------------

function plantProposal(ctx, dir, slug, ageDays, extra = {}) {
  mkdirSync(dir, { recursive: true });
  const p = join(dir, `${slug}.md`);
  const fm = Object.entries({ slug, type: 'entry', date: '2026-09-01', ...extra })
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  writeFileSync(p, `---\n${fm}\n---\n\nA proposal body.\n`, 'utf8');
  const t = new Date(NOW.getTime() - ageDays * 24 * 3600 * 1000);
  utimesSync(p, t, t);
  return p;
}

test('(c) a proposal whose slug matches a rejected one is auto-discarded before any model is invoked', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, []);
  plantProposal(ctx, ctx.rejectedDir, 'weekly-roundup', 30, {
    rejection_reason: 'a roundup nobody would cite; not-worth-reading',
  });
  plantProposal(ctx, ctx.proposalsDir, 'weekly-roundup', 10);

  const read = readProposals(ctx);
  assert.equal(read.ripe.length, 0);
  assert.equal(read.duplicates.length, 1);
  assert.match(read.duplicates[0].why, /a roundup nobody would cite/);

  const sel = select(ctx); // dryRun: the file is reported, not moved
  assert.equal(sel.selected, null);
  assert.match(sel.notes.join('\n'), /auto-discarded/);
  assert.match(sel.notes.join('\n'), /dry run: not moved/);

  // and for real, it moves into the rejection index with the pointer appended
  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: 'mock-frontier', role: 'author' });
  selectJob(ctx, { cfg, ledger: [], runner, dryRun: false });
  assert.ok(!existsSync(join(ctx.proposalsDir, 'weekly-roundup.md')), 'the duplicate left the active pool');
  const moved = readdirSync(ctx.rejectedDir).find((f) => f.includes('duplicate'));
  assert.ok(moved, readdirSync(ctx.rejectedDir).join(', '));
  const text = readFileSync(join(ctx.rejectedDir, moved), 'utf8');
  assert.match(text, /Auto-discarded as a duplicate/);
  assert.match(text, /a roundup nobody would cite/);
  assert.match(text, /No model was invoked; no\s+inference was spent/);
  ctx.cleanup();
});

test('(c) a proposal younger than 3 days is not selectable while a 4-day-old one is', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, []);
  plantProposal(ctx, ctx.proposalsDir, 'too-fresh', 1);
  plantProposal(ctx, ctx.proposalsDir, 'has-cooled', 4);

  const read = readProposals(ctx);
  assert.deepEqual(read.ripe.map((r) => r.slug), ['has-cooled']);
  assert.deepEqual(read.cooling.map((r) => r.slug), ['too-fresh']);
  assert.match(read.cooling[0].why, /cools for 3 days \(file age\)/);

  const sel = select(ctx);
  assert.equal(sel.selected.source, 'proposal', sel.text);
  assert.equal(sel.selected.slug, 'has-cooled');
  ctx.cleanup();
});

test('(c) a proposal with a job type outside the closed list is skipped, not guessed at', () => {
  const ctx = makeRepo({ now: () => NOW });
  plantProposal(ctx, ctx.proposalsDir, 'invent-a-type', 10, { type: 'newsletter' });
  const read = readProposals(ctx);
  assert.equal(read.ripe.length, 0);
  assert.match(read.malformed[0].why, /not in the closed job-type list/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// (d) capacity degradation, through the selector — specs/loop
// ---------------------------------------------------------------------------

const CAPACITY_QUEUE = [
  { type: 'post', title: 'a post', rank: 1 },
  { type: 'education', title: 'an education page', rank: 2 },
  // `scout` sheds at level 1 alongside post and education
  // (make-the-blog-worth-sending, task 2.1): discovery is the first thing to
  // stop when the provider's allowance is running out.
  { type: 'scout', title: 'the daily outward sweep', rank: 2.5 },
  { type: 'entry', title: 'an entry', rank: 3 },
  { type: 'tutorial', title: 'a tutorial', rank: 4 },
  { type: 'interpret', title: 'an immaterial interpret', rank: 5, field: 'description' },
  { type: 'interpret', title: 'a material interpret', rank: 6, field: 'price' },
  { type: 'verify', title: 'a verify', rank: 7 },
  { type: 'repair', title: 'a repair', rank: 8 },
];

function withCapacityEvents(n) {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, CAPACITY_QUEUE);
  // The events are old enough that no lane pause is in force (>6h), and they
  // are upkeep-typed so the budget bounds are all satisfied — what is being
  // measured here is shedding and nothing else.
  writeLedger(
    ctx,
    Array.from({ length: n }, (_, i) =>
      ledgerLine({ id: `c-${i}`, type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 10 + i) }),
    ),
  );
  return ctx;
}

test('(d) shed level 1 refuses post, education and scout, naming the rule', () => {
  const ctx = withCapacityEvents(1);
  const sel = select(ctx);
  assert.equal(sel.shed.level, 1);
  assert.equal(sel.selected.type, 'entry', sel.text);
  const refused = sel.refusals.filter((r) => r.rule === 'degradation:shed').map((r) => r.candidate.type);
  assert.deepEqual(refused, ['post', 'education', 'scout']);
  assert.match(sel.text, /\[degradation:shed\].*excludes post jobs/s);
  // The scout refusal is asserted through the printed text as well: a rule that
  // refuses without naming what it refused is indistinguishable from silence,
  // and this is the whole observable behaviour of task 2.1's config half.
  assert.match(sel.text, /\[degradation:shed\] scout: the daily outward sweep/);
  assert.match(sel.text, /excludes scout jobs/);
  ctx.cleanup();
});

test('(d) shed level 2 also refuses entry and tutorial', () => {
  const ctx = withCapacityEvents(2);
  const sel = select(ctx);
  assert.equal(sel.shed.level, 2);
  assert.equal(sel.selected.type, 'interpret', sel.text);
  const refused = sel.refusals.filter((r) => r.rule === 'degradation:shed').map((r) => r.candidate.type);
  assert.deepEqual(refused, ['post', 'education', 'scout', 'entry', 'tutorial']);
  ctx.cleanup();
});

test('(d) shed level 3 leaves only verify, repair and material interpret', () => {
  const ctx = withCapacityEvents(3);
  const sel = select(ctx);
  assert.equal(sel.shed.level, 3);
  assert.equal(sel.selected.type, 'interpret', sel.text);
  assert.equal(sel.selected.material, true, 'the immaterial one was passed over');
  const immaterial = sel.refusals.find((r) => r.rule === 'degradation:interpret-material-only');
  assert.ok(immaterial, sel.text);
  assert.match(immaterial.reason, /price \/ licence \/ status/);
  ctx.cleanup();
});

test('(d) with nothing shed, the selector selects a scout item — the type is accepted end to end', () => {
  // The positive control for the two tests above. A closed-list addition that
  // only ever shows up in refusals would be indistinguishable from a type the
  // selector silently drops, which is exactly what an unknown type does.
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'scout', title: 'the daily outward sweep', rank: 62 }]);
  const sel = select(ctx);
  assert.equal(sel.shed.level, 0);
  assert.equal(sel.selected?.type, 'scout', sel.text);
  assert.equal(sel.selected.source, 'queue');
  assert.deepEqual(sel.warnings, [], 'and no reader warned about an unknown type');
  ctx.cleanup();
});

test('(d) shedding is per tier: the other tier is untouched', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'post', title: 'a post' }]);
  writeLedger(ctx, [
    ledgerLine({ type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 10) }),
    ledgerLine({ type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 11) }),
    ledgerLine({ type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 12) }),
    ledgerLine({ type: 'repair', mm: 5, tier: 'cheap', outcome: 'done', ts: hoursAgo(NOW, 9) }),
  ]);
  assert.equal(select(ctx, { runnerId: 'mock-frontier' }).selected, null);
  assert.equal(select(ctx, { runnerId: 'mock-cheap' }).selected?.type, 'post');
  ctx.cleanup();
});

test('the queue is consumed in file order, in the Pulse\'s own item shape', () => {
  // The Pulse writes `{type, reason, rank, subject, detail, target}` already
  // sorted by rank DESCENDING (100 = refusing source, 30 = a wanted mint). A
  // reader that re-sorted ascending would pick the least urgent item every
  // single run and nothing would ever look wrong. File order is the ranking.
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [
    { type: 'repair', reason: 'refusing-source', rank: 100, subject: 'llm-releases', detail: 'source refusing since 2026-09-08', target: 'data/sources/registry.json' },
    { type: 'repair', reason: 'broken-link', rank: 90, subject: 'content/wiki/x.md', detail: 'link 404s', target: 'content/wiki/x.md' },
    { type: 'entry', reason: 'want-eligible-mint', rank: 30, subject: 'Some Tool', detail: 'wanted by 3 distinct pages', target: null },
  ]);
  const sel = select(ctx);
  assert.equal(sel.selected.title, 'source refusing since 2026-09-08', sel.text);
  assert.equal(sel.selected.rank, 100);
  ctx.cleanup();
});

test('directives outrank the queue, and the queue outranks proposals', () => {
  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- repair: the maintainer wants this first\n',
  });
  writeQueue(ctx, [{ type: 'repair', title: 'a queue item' }]);
  plantProposal(ctx, ctx.proposalsDir, 'a-ripe-idea', 10, { type: 'repair' });
  assert.equal(select(ctx).selected.source, 'directive');

  const ctx2 = makeRepo({ now: () => NOW });
  writeQueue(ctx2, [{ type: 'repair', title: 'a queue item' }]);
  plantProposal(ctx2, ctx2.proposalsDir, 'a-ripe-idea', 10, { type: 'repair' });
  assert.equal(select(ctx2).selected.source, 'queue');
  ctx.cleanup();
  ctx2.cleanup();
});

/**
 * A RUNNER'S CLEARANCE FOR THE KIND OF WORK, the counterpart of `roles` for the
 * kind of pass. The maintainer's decision, 2026-09-07, when a second entry was
 * added for the same model at a lower reasoning effort: that entry may do the
 * mechanical work and may not write a blog post.
 *
 * These are unit tests of the gate rather than whole-selector runs, because the
 * property being asserted is a pure function of the runner entry and one
 * candidate — and because the gate must be provable for a runner whose entry
 * does not exist in the registry fixture.
 */
test('a runner declaring job_types may not be given a job type it is not cleared for', () => {
  const restricted = {
    id: 'mock-medium',
    job_types: ['repair', 'machinery'],
  };
  const open = { id: 'mock-any' };

  const post = { type: 'post', title: 'a post' };
  const repair = { type: 'repair', title: 'a repair' };

  const refused = runnerJobTypeGate(restricted, post);
  assert.equal(refused.ok, false);
  assert.equal(refused.rule, 'runner:job-type');
  assert.match(refused.reason, /cleared for repair, machinery jobs and this is a post job/);
  assert.match(
    refused.reason,
    /not a budget or a capacity refusal/,
    'the refusal must not be mistakable for shedding or a ceiling — another runner can take this work',
  );

  assert.equal(runnerJobTypeGate(restricted, repair).ok, true, 'a cleared type passes');

  // ABSENT MEANS EVERY TYPE: every entry written before this field existed must
  // keep its behaviour exactly, which is the compatibility property.
  assert.equal(runnerJobTypeGate(open, post).ok, true);
  assert.equal(runnerJobTypeGate(open, repair).ok, true);
  // A malformed value is not a silent allow-all here either: loadRunners
  // refuses it at load time (see the registry test below), so by the time a
  // candidate reaches this gate the list is either absent or valid.
});

test('the registry refuses a job_types list that is empty or names something that is not a job type', () => {
  const ctx = makeRepo({ now: NOW });
  const runnersPath = join(ctx.repoRoot, 'runners.yml');
  const base = (extra) =>
    [
      'default: mock-a',
      'runners:',
      '  - id: mock-a',
      '    provider: p',
      '    tier: cheap',
      '    roles: [author]',
      ...extra,
      "    command: 'echo {worktree} {prompt_file}'",
    ].join('\n');

  writeFileSync(runnersPath, base(['    job_types: [repair, machinery]']), 'utf8');
  const okReg = loadRunners({ runnersPath });
  assert.deepEqual(okReg.byId.get('mock-a').job_types, ['repair', 'machinery']);

  writeFileSync(runnersPath, base(['    job_types: [repair, pots]']), 'utf8');
  assert.throws(
    () => loadRunners({ runnersPath }),
    /unknown job type "pots"/,
    'a typo must fail at load: an unknown string can never equal a candidate type, so it would silently refuse every job of that kind forever',
  );

  writeFileSync(runnersPath, base(['    job_types: []']), 'utf8');
  assert.throws(
    () => loadRunners({ runnersPath }),
    /non-empty list when present/,
    'an empty list is a runner cleared for nothing, which is never what anyone means',
  );

  writeFileSync(runnersPath, base([]), 'utf8');
  assert.equal(
    loadRunners({ runnersPath }).byId.get('mock-a').job_types,
    undefined,
    'omitting the field entirely is the unrestricted default',
  );
});

test('every clearance the shipped registry declares is actually enforced by the gate', () => {
  // Read the REAL registry rather than a fixture, so a clearance written in
  // runners.yml is proved to be in force and not merely documented.
  //
  // THIS TEST NAMES NO RUNNER, and that is not squeamishness — the portability
  // suite fails this directory for naming a model, provider, harness or runner
  // id, including in a test, because the swap is only real while runners.yml is
  // the single point of change. It caught an earlier draft of this very test.
  // So the POLICY (which entry may not write a post) lives in runners.yml, which
  // is the one file allowed to say it, and what belongs here is the MECHANISM:
  // whatever any entry declares, the gate enforces exactly that.
  const reg = loadRunners({ runnersPath: join(REPO_ROOT, 'runners.yml') });
  const restricted = reg.runners.filter((r) => Array.isArray(r.job_types));
  for (const r of restricted) {
    for (const cleared of r.job_types) {
      assert.equal(
        runnerJobTypeGate(r, { type: cleared }).ok,
        true,
        `an entry declaring ${cleared} must be offered ${cleared} work`,
      );
    }
    const withheld = JOB_TYPES.filter((t) => !r.job_types.includes(t));
    for (const t of withheld) {
      const refused = runnerJobTypeGate(r, { type: t });
      assert.equal(refused.ok, false, `a type the entry does not declare must be refused`);
      assert.equal(refused.rule, 'runner:job-type');
    }
  }
  // An entry with no clearance is offered everything — the compatibility half,
  // asserted against the real file so a future edit cannot quietly invert it.
  for (const r of reg.runners.filter((x) => !Array.isArray(x.job_types))) {
    for (const t of JOB_TYPES) assert.equal(runnerJobTypeGate(r, { type: t }).ok, true);
  }
});
