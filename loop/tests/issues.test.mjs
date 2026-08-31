/**
 * issues.test.mjs — the beads join (`addictedtoai-occ0`).
 *
 * The requirement this measures: the machine's work SHALL be joinable to the
 * issue tracker, mechanically, at the point where a job records what it did.
 *
 * EVERY ASSERTION HERE IS A MEASUREMENT OF THE MECHANISM, NOT OF ITS INTENT.
 * The house rule is that a guardrail is not what it was built to do; it is what
 * it does when measured. So each half of this file runs the thing the mechanism
 * is supposed to prevent and watches it stop, and each carries a POSITIVE
 * CONTROL — a case that must survive — because a check that rejected everything
 * would pass a suite made only of rejections.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  ISSUE_ID_RE,
  ISSUE_PREFIX,
  declaredIssueIds,
  harvestIssueIds,
  isIssueId,
  mergeIssueIds,
} from '../lib/issues.mjs';
import { readProposals } from '../lib/proposals.mjs';
import { parseDirectives, readDirectives } from '../lib/directives.mjs';
import { makeLedgerLine, jobsForIssue, LEDGER_FIELDS } from '../lib/ledger.mjs';

const NOW = new Date(2026, 7, 31, 12, 0, 0); // 2026-08-31, local by construction

// ---------------------------------------------------------------------------
// 1. THE FORMAT — one definition, and it is the only one.
// ---------------------------------------------------------------------------

test('occ0 (1a) a well-formed id is accepted and a malformed one is not', () => {
  for (const good of ['addictedtoai-occ0', 'addictedtoai-3zf', 'addictedtoai-h5k', 'addictedtoai-wemx']) {
    assert.ok(isIssueId(good), `${good} is a real id observed in this repository`);
  }
  for (const bad of [
    'addictedtoai',            // no suffix
    'addictedtoai-',           // empty suffix
    'addictedtoai-A1B',        // upper case — beads mints lower
    'other-occ0',              // wrong prefix
    'see the tracker',         // prose
    'addictedtoai-occ0 extra', // trailing text: the anchor must reject it
    '',
    null,
    undefined,
    42,
  ]) {
    assert.ok(!isIssueId(bad), `${JSON.stringify(bad)} must not pass as an id`);
  }
});

test('occ0 (1b) the format check is anchored, so a substring cannot smuggle one in', () => {
  assert.ok(!ISSUE_ID_RE.test('xaddictedtoai-occ0'));
  assert.ok(!ISSUE_ID_RE.test('addictedtoai-occ0-and-more-than-thirty-two-characters-of-suffix'));
  assert.equal(ISSUE_PREFIX, 'addictedtoai');
});

// ---------------------------------------------------------------------------
// 2. A DECLARED FIELD IS STRICT; PROSE IS NOT. The asymmetry is the design.
// ---------------------------------------------------------------------------

test('occ0 (2a) a declared `issue:` accepts scalar, list and separated forms', () => {
  assert.deepEqual(declaredIssueIds('addictedtoai-occ0').ids, ['addictedtoai-occ0']);
  assert.deepEqual(declaredIssueIds(['addictedtoai-occ0', 'addictedtoai-3zf']).ids, [
    'addictedtoai-occ0',
    'addictedtoai-3zf',
  ]);
  assert.deepEqual(declaredIssueIds('addictedtoai-occ0, addictedtoai-3zf').ids, [
    'addictedtoai-occ0',
    'addictedtoai-3zf',
  ]);
  // Deduped, first mention wins, order stable.
  assert.deepEqual(declaredIssueIds('addictedtoai-occ0 addictedtoai-occ0').ids, ['addictedtoai-occ0']);
  // Absent is not malformed.
  assert.equal(declaredIssueIds(undefined).present, false);
  assert.deepEqual(declaredIssueIds(undefined).malformed, []);
});

test('occ0 (2b) a declared `issue:` that is not an id is MALFORMED, not ignored', () => {
  const r = declaredIssueIds('see the tracker');
  assert.equal(r.present, true);
  assert.deepEqual(r.ids, []);
  assert.deepEqual(r.malformed, ['see', 'the', 'tracker']);
  // The mixed case is the one that matters: a good id beside a bad token must
  // still report the bad one, or a typo rides in behind a correct neighbour.
  const mixed = declaredIssueIds('addictedtoai-occ0, addictedtoai-TYPO');
  assert.deepEqual(mixed.ids, ['addictedtoai-occ0']);
  assert.deepEqual(mixed.malformed, ['addictedtoai-TYPO']);
});

test('occ0 (2c) prose is harvested and CANNOT be malformed', () => {
  assert.deepEqual(harvestIssueIds('write up X (addictedtoai-occ0)'), ['addictedtoai-occ0']);
  assert.deepEqual(harvestIssueIds('two: addictedtoai-occ0 and addictedtoai-3zf.'), [
    'addictedtoai-occ0',
    'addictedtoai-3zf',
  ]);
  // A line mentioning nothing is a normal line, not a defect. This is the
  // positive control for the whole directives half.
  assert.deepEqual(harvestIssueIds('just do the thing'), []);
  assert.deepEqual(harvestIssueIds(''), []);
  assert.deepEqual(harvestIssueIds(undefined), []);
});

test('occ0 (2d) mergeIssueIds is order-stable, deduped, and drops non-ids', () => {
  assert.deepEqual(
    mergeIssueIds(['addictedtoai-occ0'], ['addictedtoai-3zf', 'addictedtoai-occ0'], ['nope'], undefined),
    ['addictedtoai-occ0', 'addictedtoai-3zf'],
  );
});

// ---------------------------------------------------------------------------
// 3. A PROPOSAL — the malformed id is REFUSED, and the run says so.
// ---------------------------------------------------------------------------

function proposalTree() {
  const root = mkdtempSync(join(tmpdir(), 'atai-occ0-'));
  const proposalsDir = join(root, 'data', 'proposals');
  mkdirSync(proposalsDir, { recursive: true });
  return { root, proposalsDir, rejectedDir: join(proposalsDir, 'rejected'), now: () => NOW };
}

const proposal = (fm) => `---\n${fm}\n---\n\nA candidate.\n`;

test('occ0 (3a) a proposal with a malformed `issue:` is malformed and is NOT selectable', () => {
  const ctx = proposalTree();
  writeFileSync(
    join(ctx.proposalsDir, 'bad.md'),
    proposal('slug: bad\ntype: post\nissue: see the tracker'),
    'utf8',
  );
  // The positive control: an identical proposal that omits `issue:` entirely
  // must remain ripe. Without it, a reader that had simply broken would pass.
  writeFileSync(join(ctx.proposalsDir, 'good.md'), proposal('slug: good\ntype: post'), 'utf8');
  // And one carrying a WELL-FORMED id must remain ripe AND carry it forward.
  writeFileSync(
    join(ctx.proposalsDir, 'linked.md'),
    proposal('slug: linked\ntype: post\nissue: addictedtoai-occ0'),
    'utf8',
  );
  // Cool everything past the 3-day gate so ripeness is not what is being tested.
  const old = new Date(NOW.getTime() - 10 * 86400000);
  for (const f of ['bad.md', 'good.md', 'linked.md']) {
    utimesSync(join(ctx.proposalsDir, f), old, old);
  }

  const r = readProposals(ctx);
  const ripeSlugs = r.ripe.map((p) => p.slug).sort();
  assert.deepEqual(ripeSlugs, ['good', 'linked'], 'the malformed one is not selectable');

  assert.equal(r.malformed.length, 1);
  assert.match(r.malformed[0].path, /bad\.md$/);
  assert.match(r.malformed[0].why, /issue/, 'the reason names the offending field');
  assert.match(r.malformed[0].why, /well-formed beads id/);

  const linked = r.ripe.find((p) => p.slug === 'linked');
  assert.deepEqual(linked.issues, ['addictedtoai-occ0'], 'a good id reaches the candidate');
  const good = r.ripe.find((p) => p.slug === 'good');
  assert.deepEqual(good.issues, [], 'no issue is an empty list, never undefined');
});

// ---------------------------------------------------------------------------
// 4. A DIRECTIVE — no new syntax, and the `[done …]` marker cannot break it.
// ---------------------------------------------------------------------------

test('occ0 (4a) an id in a directive line is harvested with no new syntax', () => {
  const [d] = parseDirectives('- post: write up the thing (addictedtoai-occ0)');
  assert.equal(d.type, 'post');
  assert.deepEqual(d.issues, ['addictedtoai-occ0']);
});

test('occ0 (4b) the id survives the `[done <date> <job-id>]` append', () => {
  // The exact shape `markDirectiveDone` produces. A job id is NOT an issue id
  // by shape, so the marker cannot contribute a false positive.
  const line = '- post: write up the thing (addictedtoai-occ0) [done 2026-08-31 j-20260831-04]';
  const [d] = parseDirectives(line);
  assert.equal(d.done, true);
  assert.deepEqual(d.issues, ['addictedtoai-occ0'], 'the issue is still readable after completion');
  assert.ok(!d.task.includes('[done'), 'the marker is still stripped from the task text');
});

test('occ0 (4c) a directive naming no issue is normal, and one is not invented', () => {
  const [d] = parseDirectives('- post: write up the thing');
  assert.deepEqual(d.issues, []);
});

test('occ0 (4d) readDirectives carries the ids onto the selectable candidate', () => {
  const root = mkdtempSync(join(tmpdir(), 'atai-occ0-d-'));
  const directivesPath = join(root, 'DIRECTIVES.md');
  writeFileSync(
    directivesPath,
    '# Directives\n\n- post: alpha (addictedtoai-occ0)\n- entry: beta\n',
    'utf8',
  );
  const { directives } = readDirectives({ directivesPath });
  assert.equal(directives.length, 2);
  assert.deepEqual(directives[0].issues, ['addictedtoai-occ0']);
  assert.deepEqual(directives[1].issues, []);
});

// ---------------------------------------------------------------------------
// 5. THE LEDGER — the join is a LIST, additive, and omitted when empty.
// ---------------------------------------------------------------------------

// Neutral placeholders, not real runner ids. `runners.yml` is the only file in
// `loop/`, `pulse/`, `scripts/` and `data/config.json` that may name a model, a
// provider or a harness, and `portability.test.mjs` enforces it — it caught this
// file naming one on the first full run of the suite.
const baseLine = {
  id: 'j-20260831-04',
  type: 'post',
  runner: 'runner-a',
  provider: 'provider-a',
  tier: 'premium',
  mm: 12.5,
  outcome: 'done',
};

test('occ0 (5a) `issues` is a LIST on the ledger line, and survives round-tripping', () => {
  const line = makeLedgerLine({ ...baseLine, issues: ['addictedtoai-occ0', 'addictedtoai-3zf'] });
  assert.deepEqual(line.issues, ['addictedtoai-occ0', 'addictedtoai-3zf']);
  assert.deepEqual(JSON.parse(JSON.stringify(line)).issues, line.issues);
});

test('occ0 (5b) a job serving no issue writes NO key at all', () => {
  // The requirement is scoped to where work would otherwise be lost. Routine
  // upkeep has nothing behind it, and an id per job would manufacture backlog
  // noise — so the absence of the key is the mechanism working, not a gap.
  for (const issues of [undefined, null, [], 'not-a-list']) {
    const line = makeLedgerLine({ ...baseLine, issues });
    assert.ok(!('issues' in line), `issues: ${JSON.stringify(issues)} must write no key`);
  }
});

test('occ0 (5c) `issues` is ADDITIVE — LEDGER_FIELDS is unchanged, so old lines stay valid', () => {
  assert.ok(!LEDGER_FIELDS.includes('issues'), 'requiring it would break every line already written');
  assert.deepEqual([...LEDGER_FIELDS], ['ts', 'id', 'type', 'runner', 'provider', 'tier', 'mm', 'outcome']);
});

test('occ0 (5d) the join answers the question that was unanswerable', () => {
  const ledger = [
    makeLedgerLine({ ...baseLine, id: 'j-1', issues: ['addictedtoai-occ0'] }),
    makeLedgerLine({ ...baseLine, id: 'j-2' }),
    makeLedgerLine({ ...baseLine, id: 'j-3', issues: ['addictedtoai-3zf', 'addictedtoai-occ0'] }),
  ];
  assert.deepEqual(jobsForIssue(ledger, 'addictedtoai-occ0').map((l) => l.id), ['j-1', 'j-3']);
  assert.deepEqual(jobsForIssue(ledger, 'addictedtoai-3zf').map((l) => l.id), ['j-3']);
  assert.deepEqual(jobsForIssue(ledger, 'addictedtoai-none'), []);
  assert.deepEqual(jobsForIssue([], 'addictedtoai-occ0'), []);
});
