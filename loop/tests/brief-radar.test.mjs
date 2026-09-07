/**
 * brief-radar.test.mjs — the scout's radar reaches its brief, and a refused URL
 * never does (beads addictedtoai-wg78; DESK-ORDER-001 §5; keeper ruling K30).
 *
 * TWO PROPERTIES, AND THE SECOND IS THE ONE WITH TEETH.
 *
 * The first is the bead's acceptance line — "the scout's sweep reads them".
 * Four radar rows were registered and validated in `data/sources/registry.json`
 * and then nothing under `loop/` called `radarFeeds` or `radarReadableUrls`, so
 * the scout's brief — its only channel — named not one of them.
 *
 * The second is why the wiring goes through `radarReadableUrls` rather than
 * through the JSON: six of the seventeen declared radar URLs are REFUSED, each
 * with the dated robots or terms finding that produced the refusal. A brief that
 * printed `row.feeds` would hand every one of them to the scout, and the whole
 * apparatus of recording a refusal would amount to writing it down and then
 * doing it anyway. So the live-tree test below asserts the property against the
 * real registry rather than against a fixture the author of the fixture also
 * wrote: every refused URL absent, every readable URL present, and a
 * precondition that there are refusals to be absent in the first place — a
 * test that passes because the registry refuses nothing is a test measuring
 * nothing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assembleBrief, radarInputs } from '../lib/brief.mjs';
import { loadRegistry, radarFeeds, radarReadableUrls } from '../../pulse/lib/registry.mjs';
import { makeRepo } from './helpers.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const scoutJob = { type: 'scout', source: 'queue', title: 'sweep the world', detail: 'the daily sweep' };

/** A fixture registry: one refused feed under a permitted row, one refused row. */
const FIXTURE = {
  sources: [],
  radar: [
    {
      id: 'alpha',
      title: 'Alpha listings',
      url: 'https://alpha.invalid/feed.xml',
      format: 'rss',
      robots: { checked_on: '2026-09-06', result: 'allowed' },
      terms: { read_on: '2026-09-06', result: 'permitted' },
      verified_on: '2026-09-06',
      feeds: [
        {
          url: 'https://alpha.invalid/feed.xml',
          format: 'rss',
          registered: true,
          robots: { checked_on: '2026-09-06', result: 'allowed' },
          terms: { read_on: '2026-09-06', result: 'permitted' },
          verified_on: '2026-09-06',
        },
        {
          url: 'https://alpha.invalid/forbidden.xml',
          format: 'rss',
          registered: false,
          not_registered_because: 'alpha.invalid/robots.txt disallows /forbidden.xml',
          robots: { checked_on: '2026-09-06', result: 'disallowed' },
          terms: { read_on: '2026-09-06', result: 'permitted' },
          verified_on: '2026-09-06',
        },
      ],
    },
    {
      id: 'beta',
      title: 'Beta listings',
      url: 'https://beta.invalid/refused.xml',
      format: 'rss',
      registered: false,
      not_registered_because: "Beta's terms of service prohibit automated access",
      robots: { checked_on: '2026-09-06', result: 'allowed' },
      terms: { read_on: '2026-09-06', result: 'prohibited' },
      verified_on: '2026-09-06',
      feeds: [
        {
          url: 'https://beta.invalid/permitted.xml',
          format: 'rss',
          registered: true,
          robots: { checked_on: '2026-09-06', result: 'allowed' },
          terms: { read_on: '2026-09-06', result: 'permitted' },
          verified_on: '2026-09-06',
        },
      ],
    },
  ],
};

function fixtureRepo(t) {
  const ctx = makeRepo({
    files: { 'data/sources/registry.json': JSON.stringify(FIXTURE, null, 2) + '\n' },
  });
  t.after(() => ctx.cleanup?.());
  return ctx;
}

test('a scout brief lists the radar feeds as inputs, with their terms', (t) => {
  const ctx = fixtureRepo(t);
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260906-01',
    job: scoutJob,
    branch: 'job/j-20260906-01',
    capMinutes: 60,
  });

  assert.match(brief, /## Radar inputs/, 'the section itself');
  assert.ok(brief.includes('https://alpha.invalid/feed.xml'), 'a permitted row url reaches the brief');
  assert.ok(brief.includes('https://beta.invalid/permitted.xml'), 'and a permitted feed under a refused row');
  // "with their terms": the dated robots and terms findings, not just the URLs.
  assert.ok(brief.includes('**Terms** (read 2026-09-06): permitted'), 'the terms finding and the date it was read');
  assert.ok(brief.includes('**Robots** (checked 2026-09-06): allowed'), 'the robots finding and the date it was checked');
  assert.ok(brief.includes('inputs to the'), 'and the never-displayed rule the ruling turns on');

  // The row/feed distinction, with teeth: `beta`'s OWN url is refused with a
  // terms result of 'prohibited', and its feed (`permitted.xml`) is offered
  // with a terms result of 'permitted' — the two disagree, on purpose. The
  // brief must carry the feed's own finding against the feed's own url, never
  // the refused row's finding hoisted over it. Asserting only on `alpha`
  // (whose row and feed findings happen to agree) would pass even if the
  // renderer still attributed the row's pair to every url beneath it.
  assert.ok(
    !brief.includes('prohibited'),
    "the refused row's own terms finding ('prohibited') must never appear in the brief — the only url beta contributes is its permitted feed, which carries its own distinct finding",
  );
});

test('a URL a radar row refuses never reaches an assembled brief', (t) => {
  const ctx = fixtureRepo(t);
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260906-02',
    job: scoutJob,
    branch: 'job/j-20260906-02',
    capMinutes: 60,
  });

  // Refused by a `registered: false` feed under a row that is otherwise read.
  assert.ok(
    !brief.includes('https://alpha.invalid/forbidden.xml'),
    'a refused feed url must not appear in a brief — a URL in a brief is a URL the job can read',
  );
  // Refused by the row itself, whose OTHER feed is still read: the refusal must
  // not be lost when the row survives.
  assert.ok(
    !brief.includes('https://beta.invalid/refused.xml'),
    'a refused row url must not appear either, even when the row contributes a permitted feed',
  );
  // Nor may the reason smuggle it back in: the refusal text is not printed at
  // all, so there is no second place for the URL to appear.
  assert.ok(!brief.includes('not_registered_because'), 'the refusal record is not printed into the brief');
});

test('only the scout is handed the radar', (t) => {
  const ctx = fixtureRepo(t);
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260906-03',
    job: { type: 'entry', source: 'queue', title: 'mint an entry', detail: 'details' },
    branch: 'job/j-20260906-03',
    capMinutes: 60,
  });
  assert.ok(!brief.includes('## Radar inputs'), 'no other job type sweeps, so no other job type is handed a reading list');
  assert.ok(!brief.includes('alpha.invalid'), 'and none of the urls');
});

test('against the live registry: every refused radar URL is absent from a scout brief, every readable one is present', () => {
  const registry = loadRegistry(ROOT);
  const refused = [];
  for (const row of radarFeeds(registry)) {
    if (row.registered === false) refused.push(row.url);
    for (const feed of row.feeds ?? []) if (feed?.registered === false) refused.push(feed.url);
  }
  const readable = radarReadableUrls(registry);

  // Preconditions. A test that passes because the registry declares no radar
  // rows, or refuses nothing, measures nothing at all.
  assert.ok(readable.length > 0, 'precondition: the live registry clears at least one radar URL');
  assert.ok(refused.length > 0, 'precondition: the live registry refuses at least one radar URL');

  const brief = assembleBrief({ repoRoot: ROOT }, {
    jobId: 'j-20260906-04',
    job: scoutJob,
    branch: 'job/j-20260906-04',
    capMinutes: 60,
  });

  for (const url of refused) {
    assert.ok(!brief.includes(url), `refused radar url reached an assembled scout brief: ${url}`);
  }
  for (const url of readable) {
    assert.ok(brief.includes(url), `readable radar url missing from an assembled scout brief: ${url}`);
  }
});

test('a worktree with no source registry says so rather than throwing', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup?.());
  const section = radarInputs(ctx.repoRoot);
  assert.match(section, /Radar inputs — unavailable/);
  assert.match(section, /RESULT\.md/, 'and tells the job to report it through the one channel it has');
  // The brief still assembles: a missing registry aborts no run.
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260906-05',
    job: scoutJob,
    branch: 'job/j-20260906-05',
    capMinutes: 60,
  });
  assert.match(brief, /Radar inputs — unavailable/);
});
