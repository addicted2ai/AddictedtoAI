/**
 * linkcheck.test.mjs — what the rolling link check is allowed to have an
 * opinion about (task 3.4).
 *
 * The defect these tests exist to prevent (addictedtoai-5hn): a tutorial told
 * the reader to open `http://localhost:8080/` on their own machine, the
 * rolling check tried to fetch it from the build host, failed, and filed a
 * `broken-link` repair at rank 90 — the highest in the queue. The Desk would
 * have selected it first, no job could have repaired it, and three failures
 * of the same job type trip breaker 1 and halt the loop. The loop would have
 * deadlocked on its first work item, on a link that was never broken.
 *
 * The property under test is two-sided on purpose. An exclusion that also
 * swallowed real breakage would be a worse defect than the one it fixed, so
 * every test here asserts both halves: the loopback URL produces nothing, and
 * the genuinely broken public URL is still reported.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { isCheckableUrl, rollingLinkCheck } from '../lib/linkcheck.mjs';
import { cleanup, makeRoot, paths, readJson, runPulse, writeEntry, writeJson } from './helpers.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];
const NOW = { PULSE_NOW: '2026-08-28' };

// Hosts that are unreachable, or meaningless, by definition — never evidence
// about a link. Each is the shape the check must refuse to judge.
const NOT_CHECKABLE = [
  'http://localhost:8080/',
  'http://localhost/',
  'https://app.localhost/',
  'http://127.0.0.1:3000/health',
  'http://127.1/', // shorthand the URL parser normalizes to 127.0.0.1
  'http://[::1]:8080/',
  'http://0.0.0.0:8080/',
  'http://10.0.0.5/',
  'http://172.16.0.1/',
  'http://172.31.255.254/',
  'http://192.168.1.1/',
  'http://169.254.169.254/latest/meta-data/', // link-local: cloud metadata
  'http://[fd00::1]/',
  'http://[fe80::1]/',
  'http://printer.local/',
  'https://billing.internal/api',
  'https://fixture.test/',
  'https://vendor.invalid/price',
  'https://widgets.example/',
  'https://example.com/',
  'http://example.net/',
  'https://www.example.org/docs',
];

// Ordinary public URLs. Every one of these must still go through the check —
// including the near-misses, which is where a sloppy suffix match would leak.
const CHECKABLE = [
  'https://arxiv.org/abs/1706.03762',
  'http://www.incompleteideas.net/IncIdeas/BitterLesson.html',
  'https://www.addictedtoai.net/wiki/model/gpt-4',
  'https://8.8.8.8/',
  'https://11.0.0.1/', // just outside 10.0.0.0/8
  'https://172.15.0.1/', // just below 172.16.0.0/12
  'https://172.32.0.1/', // just above it
  'https://192.169.0.1/', // just outside 192.168.0.0/16
  'https://notexample.com/',
  'https://localhosting.net/',
  'https://protest.io/',
  'https://example.company/',
];

test('loopback, private and reserved hosts are not checkable; ordinary public URLs are', () => {
  for (const url of NOT_CHECKABLE) {
    assert.equal(isCheckableUrl(url), false, `${url} is not a link this site can verify or repair`);
  }
  for (const url of CHECKABLE) {
    assert.equal(isCheckableUrl(url), true, `${url} must still be checked — the exclusion must not swallow real links`);
  }
});

test('a URL that does not parse stays checkable — that is a real content defect, not a category error', () => {
  assert.equal(isCheckableUrl('http://'), true);
  assert.equal(isCheckableUrl('https://exa mple.com/'), true);
});

test('the check never requests a loopback host, and still reports a public URL that 404s', async (t) => {
  const root = makeRoot([]);
  const realFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = realFetch;
    cleanup(root);
  });

  // No network: a stub that records what was asked for, and refuses outright
  // if the check ever reaches for a host it has no business reaching for.
  const requested = [];
  globalThis.fetch = async (url) => {
    const u = String(url);
    requested.push(u);
    if (/localhost|127\.0\.0\.1|192\.168\./.test(u)) {
      throw new Error(`the rolling check requested ${u} — a loopback/private host it can say nothing true about`);
    }
    return new Response(null, { status: u.includes('/gone') ? 404 : 200 });
  };

  const result = await rollingLinkCheck(
    root,
    [
      { url: 'http://localhost:8080/', cited_by: ['content/tutorials/t.md'] },
      { url: 'http://192.168.1.10:11434/', cited_by: ['content/tutorials/t.md'] },
      { url: 'https://ok.fixture-vendor.net/', cited_by: ['content/wiki/model/a.md'] },
      { url: 'https://ok.fixture-vendor.net/gone', cited_by: ['content/wiki/model/a.md'] },
    ],
    { offline: false },
  );

  assert.deepEqual(
    requested.sort(),
    ['https://ok.fixture-vendor.net/', 'https://ok.fixture-vendor.net/gone'],
    'only the public URLs were ever requested',
  );
  assert.equal(result.total, 2, 'the uncheckable hosts are not counted as links the check knows');
  assert.equal(result.excluded, 2, 'and the exclusion is counted rather than hidden');

  assert.deepEqual(
    result.broken.map((b) => b.url),
    ['https://ok.fixture-vendor.net/gone'],
    'a genuinely broken public URL is still reported; the loopback ones produce nothing',
  );
  assert.equal(result.broken[0].status, 404);

  // Nothing about an uncheckable host is written into the state file either.
  const state = readJson(paths.linkcheck(root));
  assert.deepEqual(Object.keys(state.urls).sort(), ['https://ok.fixture-vendor.net/', 'https://ok.fixture-vendor.net/gone']);
});

test('end to end: a tutorial citing localhost files no repair, while a broken public link still does', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  // The real shape of the defect: the URL is an instruction to the reader.
  writeEntry(
    root,
    'content/tutorials/local-server.md',
    { subjects: [], verified_on: '2026-08-20', reverify_days: 30, mentions: [] },
    'Run the snippet, then open http://localhost:8080/ in your browser.\n' +
      'The weights come from https://dead.fixture-vendor.net/weights.bin.\n',
  );

  // Both URLs stand in state as having failed a prior check. Only one of them
  // is a link this site can be wrong about.
  writeJson(join(root, 'data', 'linkcheck.json'), {
    urls: {
      'http://localhost:8080/': { last_checked: '2026-08-27', status: null, ok: false, error: 'TypeError: fetch failed', last_ok: null, consecutive_failures: 1 },
      'https://dead.fixture-vendor.net/weights.bin': { last_checked: '2026-08-27', status: 404, ok: false, error: null, last_ok: '2026-06-01', consecutive_failures: 2 },
    },
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);

  const fresh = readJson(paths.freshness(root));
  assert.deepEqual(
    fresh.broken_links.map((b) => b.url),
    ['https://dead.fixture-vendor.net/weights.bin'],
    'freshness reports the public breakage and nothing about the reader\'s own machine',
  );
  assert.equal(fresh.link_check.excluded, 1);

  const queue = readJson(paths.queue(root));
  const repairs = queue.items.filter((i) => i.reason === 'broken-link');
  assert.deepEqual(repairs.map((i) => i.subject), ['https://dead.fixture-vendor.net/weights.bin']);
  assert.equal(
    queue.items.filter((i) => String(i.subject).includes('localhost')).length,
    0,
    'no unrepairable rank-90 item can be selected first by the Desk and trip breaker 1',
  );

  // The stale verdict is pruned, so the exclusion heals state rather than
  // only suppressing new findings.
  const state = readJson(paths.linkcheck(root));
  assert.equal('http://localhost:8080/' in state.urls, false);
  assert.equal('https://dead.fixture-vendor.net/weights.bin' in state.urls, true);
});
