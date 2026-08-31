/**
 * scout-queue.test.mjs — task 2.2: once per day, the Pulse queues the scout.
 *
 * specs/pulse (this change's delta): "On each run, the Pulse SHALL derive a
 * **scout item** into the work queue exactly when `data/ledger.jsonl` records
 * no `scout` job started on the current local date — at most one item, computed
 * from the ledger and the clock alone."
 *
 * ## Why a third of this file spawns children with `TZ` set
 *
 * "Once per day" is a claim about a *calendar date*, and every date in this
 * repository is the LOCAL date of the machine that wrote it (CLAUDE.md;
 * `pulse/lib/core.mjs` rule 2) — while a ledger line's `ts` is a UTC *instant*
 * (`loop/lib/ledger.mjs` writes `new Date().toISOString()`). Those two frames
 * disagree for part of every day, in opposite directions on either side of
 * Greenwich, and four bugs of exactly this shape have shipped here already
 * (addictedtoai-4ih and its neighbours). Each survived its own suite because
 * every fixture pinned the clock to a bare date string that the broken path
 * round-tripped exactly.
 *
 * So the assertions that decide "is this the same day" run in a **child
 * process with `TZ` set**, following `pulse/tests/dates.test.mjs`: `TZ` is read
 * by Node's ICU at startup, and on a UTC box the correct implementation and the
 * `ts.slice(0, 10) === today()` one are indistinguishable. Each such test says,
 * in its own assertion message, what the naive implementation would have done.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, makeRoot, paths, readJson, runPulse, writeEntry, writeJson } from './helpers.mjs';
import { RANKS, SCOUT_CONTEXT_DAYS } from '../lib/queue.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];
const NOW = { PULSE_NOW: '2026-08-28' };

/** `data/ledger.jsonl` in a fixture root — the loop's append-only job record. */
const ledgerPath = (root) => join(root, 'data', 'ledger.jsonl');

/** Write ledger lines in the real shape (`loop/lib/ledger.mjs`, LEDGER_FIELDS). */
function writeLedger(root, lines) {
  const file = ledgerPath(root);
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(file, lines.map((l) => JSON.stringify(l)).join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

function ledgerLine({ ts, type = 'scout', id = 'j-20260828-01', outcome = 'done', mm = 12.5 }) {
  return { ts, id, type, runner: 'a-runner', provider: 'a-provider', tier: 'cheap', mm, outcome };
}

function writeChanges(root, lines) {
  writeFileSync(paths.changes(root), lines.map((l) => JSON.stringify(l)).join('\n') + '\n', 'utf8');
}

const scoutItems = (root) => readJson(paths.queue(root)).items.filter((i) => i.type === 'scout');

// ---------------------------------------------------------------------------
// The derivation
// ---------------------------------------------------------------------------

test('with no scout in the ledger, exactly one scout item is derived, at rank 62', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const items = scoutItems(root);
  assert.equal(items.length, 1, 'at most one, and on a fresh ledger exactly one');

  const [i] = items;
  assert.equal(i.reason, 'scout-due');
  assert.equal(i.rank, 62);
  assert.equal(i.subject, '2026-08-28', 'the local date whose scout this is');
  assert.equal(i.target, null, 'the scout concerns no existing file in this repository');
  // The queue gives no item an identity or a history, and the scout is no
  // exception: the six ordinary keys, plus the one-line `title` the loop's
  // reader documents — the outcome the selection log and the brief heading
  // print, which a many-line detail cannot be.
  assert.deepEqual(Object.keys(i).sort(), ['detail', 'rank', 'reason', 'subject', 'target', 'title', 'type']);
  assert.match(i.title, /^The daily outward sweep — bring back work this site could not have thought of/);
  assert.equal(i.title.includes('\n'), false, 'one line, as the field means');
  assert.ok(i.title.length < 120, 'and short enough to survive the merge-commit slice at loop/run.mjs:734');
});

test('the rank sits below corroboration and above the routine timers', () => {
  // The normative relative position, asserted against the table itself so a
  // future re-tuning of a neighbour cannot silently invert it.
  assert.equal(RANKS['scout-due'], 62);
  assert.ok(RANKS['scout-due'] < RANKS.corroboration, 'the site’s claim to be true outranks discovery');
  assert.ok(RANKS['scout-due'] < RANKS['broken-link'], 'confirmed breakage outranks discovery');
  assert.ok(RANKS['scout-due'] > RANKS['listing-verification-due'], 'discovery outranks routine re-checking');
  assert.ok(RANKS['scout-due'] > RANKS['tutorial-stale']);
  assert.ok(RANKS['scout-due'] > RANKS['overdue-fact-slow']);
});

test('the scout item lands between a corroboration disagreement and a due listing', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  // A declared pair that disagrees (rank 68).
  const ROW = 'vendor/model-x';
  writeEntry(root, 'content/wiki/model/x.md', {
    id: 'model/x',
    kind: 'model',
    display_name: 'X',
    status: 'active',
    maintenance: 'living',
    aliases: [],
    feeds: { openrouter: ROW },
    facts: [
      { field: 'parameters', source: 'feed', feed: 'openrouter', path: 'parameters', volatility: 'slow' },
      {
        field: 'card_parameters',
        source: 'cited',
        value: '304B params',
        source_url: 'https://vendor.invalid/card',
        accessed: '2026-08-28',
        volatility: 'static',
        corroborates: 'parameters',
      },
    ],
    timeline: [],
    mentions: [],
  });
  writeJson(paths.latest(root, 'openrouter'), {
    source: 'openrouter',
    url: 'http://fixture.invalid/or',
    date: '2026-08-28',
    body_hash: 'x',
    row_count: 1,
    rows: { [ROW]: { id: ROW, parameters: '284B total' } },
  });
  // A listing past its verification interval (rank 60).
  writeEntry(root, 'content/directory/tools/t.md', { url: 'https://t.invalid/', pricing: 'free', last_verified: '2026-01-01', entry: 'tool/t', mentions: [] }, 'body');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const reasons = readJson(paths.queue(root)).items.map((i) => i.reason);
  assert.deepEqual(
    reasons,
    ['corroboration', 'scout-due', 'listing-verification-due'],
    'file order is the ranking the Desk reads (loop/lib/queue.mjs): the scout sits between them',
  );
});

// ---------------------------------------------------------------------------
// Once per day
// ---------------------------------------------------------------------------

test('a scout recorded today derives nothing, and the re-run is byte-identical', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeLedger(root, [ledgerLine({ ts: '2026-08-28T15:00:00Z' })]);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.deepEqual(scoutItems(root), [], 'the day’s scout has run; nothing re-derives it');
  const first = readFileSync(paths.queue(root), 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(readFileSync(paths.queue(root), 'utf8'), first, 'recomputation on unchanged state, byte for byte');
});

test('the next local date derives one again', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeLedger(root, [ledgerLine({ ts: '2026-08-28T15:00:00Z' })]);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.deepEqual(scoutItems(root), []);

  assert.equal((await runPulse(root, ARGS, { PULSE_NOW: '2026-08-29' })).status, 0);
  const items = scoutItems(root);
  assert.equal(items.length, 1, 'the next local date is a new day and gets its own scout');
  assert.equal(items[0].subject, '2026-08-29');
});

test('any outcome counts as the day’s scout — blocked is a success, failed still started', async (t) => {
  for (const outcome of ['done', 'blocked', 'failed']) {
    const root = makeRoot([]);
    t.after(() => cleanup(root));
    writeLedger(root, [ledgerLine({ ts: '2026-08-28T15:00:00Z', outcome })]);
    assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
    assert.deepEqual(scoutItems(root), [], `outcome ${outcome} is still a scout that ran today`);
  }
});

test('another job type recorded today does not stand in for the scout', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeLedger(root, [
    ledgerLine({ ts: '2026-08-28T09:00:00Z', type: 'post', id: 'j-20260828-01' }),
    ledgerLine({ ts: '2026-08-28T11:00:00Z', type: 'repair', id: 'j-20260828-02' }),
    ledgerLine({ ts: '2026-08-27T15:00:00Z', type: 'scout', id: 'j-20260827-01' }),
  ]);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(scoutItems(root).length, 1, 'yesterday’s scout and today’s other work are both irrelevant');
});

test('an unreadable or empty ledger reads as "no scout today", never as an error', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(ledgerPath(root), '{"ts":"2026-08-28T15:00:00Z","type":"scout"\nnot json at all\n\n', 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0, 'a malformed ledger line must not stop the engine');
  assert.equal(scoutItems(root).length, 1);
});

// ---------------------------------------------------------------------------
// The context: a join, not a judgment
// ---------------------------------------------------------------------------

/** Four events in the window, one annotation, one outside the window. */
function seedFeed(root) {
  writeChanges(root, [
    { key: 'k-arrival', date: '2026-08-27', kind: 'arrival', source: 'models', row_id: 'acme/one', display_name: 'Acme One', field: null, item_url: 'https://acme.invalid/one' },
    { key: 'k-price', date: '2026-08-26', kind: 'field_change', source: 'models', row_id: 'acme/two', display_name: 'Acme Two', field: 'price_input', old: '1', new: '2' },
    { key: 'k-release', date: '2026-08-25', kind: 'release', seeded: true, source: 'releases', row_id: 'r-1', display_name: 'Beta 2 ships', field: null, source_url: 'https://beta.invalid/2' },
    { key: 'k-retire', date: '2026-08-22', kind: 'retirement', source: 'models', row_id: 'acme/old', display_name: 'Acme Old', field: null },
    { kind: 'annotation', annotates: 'k-price', date: '2026-08-27', job: 'j-20260827-01', text: 'Acme doubled its prompt price.' },
    { key: 'k-stale', date: '2026-08-18', kind: 'arrival', source: 'models', row_id: 'acme/ancient', display_name: 'Acme Ancient', field: null },
  ]);
}

test('the item carries the trailing-7-day lines a post’s covers: does not name', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  seedFeed(root);
  writeEntry(
    root,
    'content/blog/a-note.md',
    { title: 'A note', date: '2026-08-27', covers: [{ key: 'k-arrival', date: '2026-08-27' }], mentions: [] },
    'body',
  );

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const [scout] = scoutItems(root);
  assert.ok(scout, 'the item is derived');

  const keys = [...scout.detail.matchAll(/key: (\S+)/g)].map((m) => m[1]);
  assert.deepEqual(
    keys,
    ['k-price', 'k-release', 'k-retire'],
    'the covered line is out; the annotation carries no event; the 10-day-old line is outside the window — ' +
      'and what remains is in the feed’s own order, with no re-ranking',
  );
  assert.equal(SCOUT_CONTEXT_DAYS, 7);

  // Enough per line to look the event up and to cite it verbatim in `covers:`.
  assert.match(scout.detail, /2026-08-26 field_change — Acme Two \(models acme\/two\) price_input: 1 -> 2/);
  assert.match(scout.detail, /source-url: https:\/\/beta\.invalid\/2/, 'the feed’s URLs, each labelled for what it is');
  assert.match(scout.detail, /3 change-feed line\(s\)/, 'the count is stated, so a truncated read is visible');
  // No URL is ever bare: `item_url` is the row's own link and `source_url` is
  // the feed endpoint on a diffed line, so an unlabelled one would read as
  // evidence for the event when it is not.
  for (const line of scout.detail.split('\n').filter((l) => l.startsWith('- '))) {
    for (const url of line.match(/https?:\/\/\S+/g) ?? []) {
      assert.match(line, new RegExp(`(url|source-url): ${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), line);
    }
  }

  // It says what the lines are, and refuses to say which of them matters.
  assert.match(scout.detail, /no score, no shortlist/);
  assert.match(scout.detail, /does not bound|do not bound/, 'context is an input to the search, not its limit');
  assert.doesNotMatch(scout.detail, /\b(rank|score|priority|recommend\w*)\s*[:=]/i, 'no per-event judgment');
});

test('with no post covering anything, every line in the window is offered', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  seedFeed(root);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const keys = [...scoutItems(root)[0].detail.matchAll(/key: (\S+)/g)].map((m) => m[1]);
  assert.deepEqual(keys, ['k-arrival', 'k-price', 'k-release', 'k-retire']);
});

test('a covers: entry in a README, or a malformed post, changes nothing', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  seedFeed(root);
  // README.md is documentation, not a published post (pulse/lib/corpus.mjs
  // ignores it everywhere), and a post that will not parse is skipped rather
  // than fatal — the Pulse is tolerant where the build is strict.
  writeEntry(root, 'content/blog/README.md', { title: 'How to write here', date: '2026-08-01', covers: [{ key: 'k-price', date: '2026-08-26' }], mentions: [] }, 'body');
  writeFileSync(join(root, 'content', 'blog', 'broken.md'), '---\ntitle: "oops\ncovers: [\n---\nbody\n', 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const keys = [...scoutItems(root)[0].detail.matchAll(/key: (\S+)/g)].map((m) => m[1]);
  assert.deepEqual(keys, ['k-arrival', 'k-price', 'k-release', 'k-retire']);
});

test('an empty window is stated as a fact about the repository, not as breakage', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const [scout] = scoutItems(root);
  assert.ok(scout, 'a quiet feed still queues the scout — the charge is the world, not the feed');
  assert.match(scout.detail, /No change-feed line from the trailing 7 days is uncovered/);
  assert.match(scout.detail, /bounds nothing/);
});

test('the item is byte-identical across runs on unchanged state, context and all', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  seedFeed(root);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const first = readFileSync(paths.queue(root), 'utf8');
  assert.ok(first.includes('scout'), 'the file under comparison actually contains the item');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(readFileSync(paths.queue(root), 'utf8'), first, 'a pure function of state produces the same bytes');
});

// ---------------------------------------------------------------------------
// "The current LOCAL date" — measured in zones where local and UTC disagree
// ---------------------------------------------------------------------------

/**
 * Run the real Pulse in a fixture root under a forced `TZ`, with one scout
 * ledger line, and report whether a scout item was derived.
 *
 * `PULSE_NOW` is a *datetime* here on purpose: a bare date pins local midnight,
 * where local and UTC agree by construction and the bug cannot appear.
 */
async function derivesUnder(t, { tz, nowIso, scoutTs }) {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeLedger(root, [ledgerLine({ ts: scoutTs })]);
  const run = await runPulse(root, ARGS, { TZ: tz, PULSE_NOW: nowIso });
  assert.equal(run.status, 0, run.out);
  return scoutItems(root).length === 1;
}

// UTC-6, the maintainer's measured offset in addictedtoai-4ih; no DST, so the
// arithmetic below is stated once and does not depend on the month.
const WEST = 'Etc/GMT+6';
const EAST = 'Asia/Tokyo'; // UTC+9, where the failure is the mirror image

test('west of Greenwich: an evening scout suppresses the same local day, though its UTC stamp says tomorrow', async (t) => {
  // 2026-08-29 22:00 local is the run; the scout ran two hours earlier, at
  // 20:00 local — the same local day, stamped 2026-08-30 in UTC.
  const derived = await derivesUnder(t, { tz: WEST, nowIso: '2026-08-30T04:00:00Z', scoutTs: '2026-08-30T02:00:00Z' });
  assert.equal(
    derived,
    false,
    'ts.slice(0,10) would read "2026-08-30" against today "2026-08-29" and queue a second scout two hours after the first',
  );
});

test('west of Greenwich: last night’s scout does not consume today, though its UTC stamp says today', async (t) => {
  // The scout ran at 22:00 local on the 28th, stamped 2026-08-29T04:00Z. The
  // run is 22:00 local on the 29th — a new local day, which must get a scout.
  const derived = await derivesUnder(t, { tz: WEST, nowIso: '2026-08-30T04:00:00Z', scoutTs: '2026-08-29T04:00:00Z' });
  assert.equal(
    derived,
    true,
    'ts.slice(0,10) would read "2026-08-29", match today, and silently skip the day’s scout entirely',
  );
});

test('east of Greenwich: a morning scout suppresses the same local day, though its UTC stamp says yesterday', async (t) => {
  // 09:30 local on the 29th is the run; the scout ran at 07:00 local the same
  // morning, stamped 2026-08-28T22:00Z.
  const derived = await derivesUnder(t, { tz: EAST, nowIso: '2026-08-29T00:30:00Z', scoutTs: '2026-08-28T22:00:00Z' });
  assert.equal(
    derived,
    false,
    'ts.slice(0,10) would read "2026-08-28" against today "2026-08-29" and queue a second scout the same morning',
  );
});

test('east of Greenwich: yesterday’s scout leaves today’s intact', async (t) => {
  const derived = await derivesUnder(t, { tz: EAST, nowIso: '2026-08-29T00:30:00Z', scoutTs: '2026-08-27T22:00:00Z' });
  assert.equal(derived, true);
});

test('the fixture zones really do straddle UTC midnight, or the four tests above prove nothing', () => {
  // The guard `dates.test.mjs` also keeps: if local and UTC agreed at these
  // instants, every assertion above would hold under the broken implementation
  // too, and this file would be measuring nothing at all.
  const utcDate = (iso) => iso.slice(0, 10);
  assert.notEqual(utcDate('2026-08-30T02:00:00Z'), '2026-08-29', 'WEST: the evening scout’s UTC date is a day ahead');
  assert.equal(utcDate('2026-08-29T04:00:00Z'), '2026-08-29', 'WEST: last night’s scout carries today’s UTC date');
  assert.notEqual(utcDate('2026-08-28T22:00:00Z'), '2026-08-29', 'EAST: the morning scout’s UTC date is a day behind');
});
