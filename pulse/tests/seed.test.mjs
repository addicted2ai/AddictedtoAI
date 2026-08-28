/**
 * seed.test.mjs — task 3.8: launch-feed seeding, and task 3.6: the STOP file
 * and refusal handling.
 *
 * Seeding exists because diff history normally begins at first fetch, which
 * would leave the changed feed — the launch-day hero — nearly empty. Seeded
 * lines are real, sourced, dated history; the marker only keeps them
 * distinguishable in the data.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, jsonSource, makeRoot, paths, readJson, readLines, runPulse, serve } from './helpers.mjs';

const ARGS = ['--no-build', '--no-mint'];

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Releases</title>
<item><title>Acme One released</title><link>https://example.invalid/one</link>
<guid isPermaLink="false">g-1</guid><pubDate>Mon, 03 Aug 2026 00:00:00 GMT</pubDate>
<description>Acme shipped One.</description><source url="https://vendor.invalid/news/one">Acme</source></item>
<item><title>Acme Two released</title><link>https://example.invalid/two</link>
<guid isPermaLink="false">g-2</guid><pubDate>Fri, 14 Aug 2026 00:00:00 GMT</pubDate>
<description>Acme shipped Two.</description><source url="https://vendor.invalid/news/two">Acme</source></item>
</channel></rss>`;

function rssSource(id, url) {
  return {
    id,
    url,
    format: 'rss',
    row_id_field: 'guid',
    display_name_field: 'title',
    yields: ['title', 'link', 'guid', 'pubDate', 'description', 'source_url'],
    fetch_every_days: 1,
    expected_change_days: 3,
    emit_on_remove: false,
    rolling_window: true,
    material_fields: [],
    status_rule: null,
    mints: null,
    seeds: { date_field: 'pubDate', title_field: 'title', source_url_field: 'source_url' },
    robots: { checked_on: '2026-08-28', result: 'allowed' },
    verification: { date: '2026-08-28', result: 'live' },
  };
}

test('first ingestion seeds the changed feed with dated, sourced history; a second run appends no duplicates', async (t) => {
  const server = await serve(() => ({ status: 200, body: RSS, type: 'application/rss+xml' }));
  const root = makeRoot([rssSource('releases', `${server.url}/feed.xml`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const first = await runPulse(root, ARGS);
  assert.equal(first.status, 0, first.out);
  assert.match(first.out, /seed releases — 2 dated historical record\(s\)/);

  const lines = readLines(paths.changes(root));
  assert.equal(lines.length, 2);
  for (const l of lines) {
    assert.equal(l.seeded, true, 'seeded lines carry the marker');
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(l.date), 'with a real date');
    assert.ok(l.source_url.startsWith('https://vendor.invalid/'), "and the row's own source, not the feed's URL");
  }
  const dates = lines.map((l) => l.date).sort();
  assert.deepEqual(dates, ['2026-08-03', '2026-08-14'], 'the original dates, not the ingestion date');

  const second = await runPulse(root, [...ARGS, '--force']);
  assert.equal(second.status, 0, second.out);
  assert.equal(readLines(paths.changes(root)).length, 2, 'seeding runs once per source');
  assert.doesNotMatch(second.out, /seed releases/, 'and is not attempted again');

  const state = readJson(paths.state(root, 'releases'));
  assert.equal(state.seeded, true);
});

test('the STOP file halts the Pulse immediately', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  writeFileSync(join(root, 'STOP'), 'maintainer brake\n', 'utf8');
  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, 'a stopped Pulse is an instruction obeyed, not an error');
  assert.match(run.out, /STOP file present/);
  assert.doesNotMatch(run.out, /registry/, 'nothing else ran');
  assert.doesNotMatch(run.out, /queue/, 'nothing else ran');

  unlinkSync(join(root, 'STOP'));
  const after = await runPulse(root, ARGS);
  assert.equal(after.status, 0);
  assert.match(after.out, /queue/, 'and the pipeline resumes once the brake is released');
});

test('a source returning 403 is recorded as refusing, not routed around', async (t) => {
  let refuse = false;
  const server = await serve(() =>
    refuse
      ? { status: 403, body: 'Forbidden', type: 'text/plain' }
      : { status: 200, body: JSON.stringify({ data: [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 1000, expiration_date: null }] }) },
  );
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  const snapshotBefore = readJson(paths.latest(root, 'models'));

  refuse = true;
  const run = await runPulse(root, [...ARGS, '--force']);
  assert.equal(run.status, 0, 'a refusal is data, not a failure of the engine');
  assert.match(run.out, /REFUSING since \d{4}-\d{2}-\d{2} \(HTTP 403\)/);

  const state = readJson(paths.state(root, 'models'));
  assert.equal(state.refusing.status, 403);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(state.refusing.since), 'the refusal is dated');

  const snapshotAfter = readJson(paths.latest(root, 'models'));
  assert.deepEqual(snapshotAfter, snapshotBefore, 'the last snapshot keeps serving, unmodified');

  const sources = readJson(paths.sources(root));
  const record = sources.sources.find((s) => s.id === 'models');
  assert.ok(record.refusing, 'the refusal reaches the data layer so the surfaces can show it');
  assert.ok(record.snapshot_date, 'along with the snapshot date the site is serving');

  const queue = readJson(paths.queue(root));
  const item = queue.items.find((i) => i.reason === 'refusing-source');
  assert.ok(item, 'and a repair finding enters the derived queue');
  assert.equal(item.type, 'repair');
});

test('a refusing source is retried at most once a day', async (t) => {
  const server = await serve(() => ({ status: 429, body: 'Too Many Requests', type: 'text/plain' }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const first = await runPulse(root, ARGS);
  assert.match(first.out, /REFUSING since .* \(HTTP 429\)/);

  const second = await runPulse(root, [...ARGS, '--force']);
  assert.match(second.out, /refusing, already retried today/, 'no retry storm, even when forced');
});
