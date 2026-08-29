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
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONFIRM_AFTER_FAILURES,
  checkUrl,
  classifyRedirect,
  isCheckableUrl,
  isConfirmedBroken,
  metaRefreshTarget,
  referenceDrift,
  rollingLinkCheck,
} from '../lib/linkcheck.mjs';
import { corpusLinks, extractLinks, readCorpus } from '../lib/corpus.mjs';
import { REPO, cleanup, makeRoot, paths, readJson, runPulse, writeEntry, writeJson } from './helpers.mjs';

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

/* ===========================================================================
 * Code is not citation (addictedtoai-d5i, part 1)
 *
 * Host exclusion covered the loopback case. It does not cover a PUBLIC URL in
 * a code fence — a documented `curl https://api.openai.com/v1/...` answers 401
 * without a key, and a quoted transcript of dead URLs is evidence, not a
 * dependency. Both are the 5hn deadlock one content file away.
 *
 * Every test below is two-sided: the fenced URL produces nothing AND the same
 * URL in prose is still found.
 * ======================================================================== */

const body = (b) => extractLinks({ data: {}, body: b });

test('a URL in a fenced code block produces no link finding; the same URL in prose does', () => {
  const url = 'https://api.fixture-vendor.net/v1/chat';
  assert.deepEqual(body('```sh\ncurl ' + url + ' -H "authorization: Bearer $KEY"\n```\n'), [], 'a command is not a link');
  assert.deepEqual(body('The endpoint is ' + url + ' and it answers JSON.'), [url], 'prose citing it still counts');
  assert.deepEqual(
    body('Prose cites ' + url + '.\n\n```sh\ncurl ' + url + '\n```\n'),
    [url],
    'cited in prose and demonstrated in a fence: still checked, on the strength of the prose',
  );
});

test('inline code spans are code too, and a bare URL in prose is not', () => {
  const url = 'https://fixture-vendor.net/models';
  assert.deepEqual(body('Fetch `' + url + '` with curl.'), [], 'backticks render monospace text, not a clickable link');
  assert.deepEqual(body('Fetch ' + url + ' with curl.'), [url]);
  // The old regex did not exclude a backtick, so an inline span produced a URL
  // with a trailing "`" — a link guaranteed to 404, manufactured by the check
  // out of a correct citation. Two of these were live in the corpus.
  assert.deepEqual(body('See `' + url + '` here.').filter((u) => u.includes('`')), []);
});

test('fence syntax is read the way markdown reads it, and stays tolerant', () => {
  const u = 'https://fenced.fixture-vendor.net/x';
  const keep = 'https://prose.fixture-vendor.net/y';
  assert.deepEqual(body('~~~python\nrequests.get("' + u + '")\n~~~\n' + keep), [keep], 'tilde fences');
  assert.deepEqual(body('````\n```\n' + u + '\n```\n````\n' + keep), [keep], 'a longer fence encloses a shorter one');
  assert.deepEqual(body('   ```\n' + u + '\n   ```\n' + keep), [keep], 'up to three spaces of indent still opens a fence');
  assert.deepEqual(body('```\n' + u + '\n'), [], 'an unterminated fence never throws and never leaks');
  assert.deepEqual(body('```text\n' + u + '\n```\n\n' + keep), [keep], 'prose after the fence is read normally');
});

test('front-matter citations are never touched — that is where source_url lives', () => {
  const cited = 'https://www.anthropic.com/news/claude-opus-5';
  assert.deepEqual(
    extractLinks({
      data: { facts: [{ field: 'release_date', source: 'cited', source_url: cited, accessed: '2026-08-27' }] },
      body: '```\nhttps://fenced.fixture-vendor.net/ignored\n```\n',
    }),
    [cited],
    'specs/wiki puts a cited fact\'s source_url in front matter; stripping code must not reach it',
  );
});

test('the committed corpus: quoted dead URLs are not repair jobs, and the post\'s own citations still are links', () => {
  const rel = 'content/blog/reference-urls-that-still-return-200.md';
  const raw = readFileSync(join(REPO, rel), 'utf8');

  // URLs the post quotes inside a fenced transcript and reports as DEAD. They
  // are the post's evidence. Checked as links they become permanent rank-90
  // repairs no job can close without deleting the proof.
  const quotedDead = ['https://chat.lmsys.org/', 'https://www.paperswithcode.com/', 'https://huggingface.co/imagenet-1k/datasets'];
  // URLs the same post cites in prose, as links a reader follows.
  const prose = ['https://aider.chat/docs/leaderboards/', 'https://huggingface.co/papers/1706.03762', 'https://huggingface.co/datasets/ILSVRC/imagenet-1k'];

  for (const url of [...quotedDead, ...prose]) {
    assert.ok(raw.includes(url), `${rel} no longer contains ${url} — re-anchor this test against the current post`);
  }

  const found = new Set(corpusLinks(readCorpus(REPO)).map((l) => l.url));
  for (const url of quotedDead) assert.equal(found.has(url), false, `${url} is quoted evidence in a code fence, not a link this site offers`);
  for (const url of prose) assert.equal(found.has(url), true, `${url} is cited in prose and must still be checked`);
});

/* ===========================================================================
 * One failure is not a fact (addictedtoai-d5i, part 2)
 * ======================================================================== */

test('the link rule and the listing rule use one threshold, not two that agree today', () => {
  assert.equal(CONFIRM_AFTER_FAILURES, 2);
  assert.equal(isConfirmedBroken(0), false);
  assert.equal(isConfirmedBroken(1), false, 'one flaky timeout is not a dead resource');
  assert.equal(isConfirmedBroken(2), true);
  assert.equal(isConfirmedBroken(3), true);
  assert.equal(isConfirmedBroken(undefined), false);
});

test('a first failure is recorded but files no repair; the second files one at rank 90', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  writeEntry(root, 'content/wiki/model/a.md', { id: 'model/a', kind: 'model', display_name: 'A', aliases: [], facts: [], mentions: [] },
    'The weights are at https://flaky.fixture-vendor.net/w.bin.\n');

  const record = (failures) => ({
    urls: {
      'https://flaky.fixture-vendor.net/w.bin': {
        last_checked: '2026-08-27', status: 503, ok: false, error: null, last_ok: '2026-08-01', consecutive_failures: failures,
      },
    },
  });

  writeJson(join(root, 'data', 'linkcheck.json'), record(1));
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);

  let fresh = readJson(paths.freshness(root));
  assert.equal(fresh.broken_links.length, 1, 'the failure is recorded — staleness cannot hide');
  assert.equal(fresh.broken_links[0].state, 'failing-once');
  assert.equal(readJson(paths.queue(root)).items.filter((i) => i.reason === 'broken-link').length, 0,
    'one 503 must not become the highest-ranked item in the queue');

  writeJson(join(root, 'data', 'linkcheck.json'), record(2));
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);

  fresh = readJson(paths.freshness(root));
  assert.equal(fresh.broken_links[0].state, 'broken');
  const repairs = readJson(paths.queue(root)).items.filter((i) => i.reason === 'broken-link');
  assert.deepEqual(repairs.map((i) => i.subject), ['https://flaky.fixture-vendor.net/w.bin'],
    'confirmed breakage is still reported — the threshold must not swallow a dead link');
  assert.equal(repairs[0].rank, 90);
});

/* ===========================================================================
 * "I will not serve you" is not "this is not here" (addictedtoai-d5i, part 3)
 * ======================================================================== */

test('a host that declines our user-agent returns no verdict; a dead one still fails', async (t) => {
  const realFetch = globalThis.fetch;
  t.after(() => (globalThis.fetch = realFetch));

  const cases = [
    [200, true], [204, true], [301, true],
    [401, null], [403, null], [407, null], [429, null],
    [404, false], [410, false], [400, false], [418, false], [451, false], [500, false], [503, false],
  ];
  for (const [status, expected] of cases) {
    globalThis.fetch = async () => new Response(null, { status });
    const res = await checkUrl('https://fixture-vendor.net/x');
    assert.equal(res.ok, expected, `HTTP ${status} must yield ok=${expected}`);
    assert.equal(res.status, status);
  }

  // A network error is still a failure — nothing here forgives an unreachable host.
  globalThis.fetch = async () => {
    throw new Error('getaddrinfo ENOTFOUND fixture-vendor.net');
  };
  const dead = await checkUrl('https://fixture-vendor.net/x');
  assert.equal(dead.ok, false);
  assert.equal(dead.status, null);
});

test('a 403 is retried as GET before it is believed, and each request gets its own timeout', async (t) => {
  const realFetch = globalThis.fetch;
  t.after(() => (globalThis.fetch = realFetch));

  // Hosts that refuse HEAD but serve GET are common; the retry must survive.
  const seen = [];
  globalThis.fetch = async (_url, opts) => {
    seen.push({ method: opts.method, signal: opts.signal });
    return new Response(null, { status: opts.method === 'HEAD' ? 403 : 200 });
  };
  const res = await checkUrl('https://fixture-vendor.net/x');
  assert.deepEqual(seen.map((s) => s.method), ['HEAD', 'GET']);
  assert.equal(res.ok, true, 'a host that refuses HEAD but serves GET is alive');

  // One shared AbortSignal made the 15s budget cover both requests, so a slow
  // HEAD left the GET no time and the check invented the timeout it reported.
  assert.notEqual(seen[0].signal, seen[1].signal, 'each request must carry its own timeout');
});

/* ===========================================================================
 * A 200 is not an answer to "is this still the thing I cited?" (addictedtoai-557)
 *
 * Every URL and every destination below was measured live on 2026-08-29 and is
 * quoted from `content/blog/reference-urls-that-still-return-200.md`, which
 * found nine of twelve reference URLs returning 200 with four of them landing
 * on unrelated content.
 *
 * The tests are two-sided throughout, and the second side is the load-bearing
 * one: a check that reported every redirect would file repair items for
 * http -> https and for two org renames the post explicitly calls correct.
 * Those are the unrepairable rank-90 items that halted the loop on
 * addictedtoai-5hn, one content file away.
 * ======================================================================== */

test('the redirect shapes the post calls legitimate are not drift, and the ones it calls rot are', () => {
  // Legitimate — measured, and none of these may ever produce a finding.
  const legitimate = [
    ['http://arxiv.org/abs/1706.03762', 'https://arxiv.org/abs/1706.03762', 'same'],
    ['https://www.addictedtoai.net/wiki', 'https://addictedtoai.net/wiki', 'same'],
    ['https://aider.chat/docs/leaderboards', 'https://aider.chat/docs/leaderboards/', 'same'],
    // Both org renames from the post: same host, same artifact, new owner.
    [
      'https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard',
      'https://huggingface.co/spaces/lmarena-ai/arena-leaderboard',
      'same-site-move',
    ],
    [
      'https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard',
      'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard',
      'same-site-move',
    ],
    // A domain that moved but kept the citation intact.
    ['https://old.example-vendor.net/docs/api', 'https://new-vendor.dev/docs/api', 'cross-site-preserved'],
    // The paper path the post singles out as done RIGHT: `paper` survives.
    [
      'https://paperswithcode.com/paper/attention-is-all-you-need',
      'https://huggingface.co/papers/1706.03762',
      'cross-site-related',
    ],
    // The plausible substitute. It IS rot, and it is deliberately not called
    // rot here: it shares `imagenet`, and any rule sharp enough to catch it
    // fires on every legitimate rename that keeps a word. See linkcheck.mjs.
    [
      'https://paperswithcode.com/dataset/imagenet',
      'https://huggingface.co/datasets/zh-plus/tiny-imagenet',
      'cross-site-related',
    ],
  ];
  for (const [from, to, kind] of legitimate) {
    assert.equal(classifyRedirect(from, to), kind, `${from} -> ${to}`);
    assert.notEqual(classifyRedirect(from, to), 'cross-site-repath', `${from} must file no repair`);
  }

  // Rot: a different site, and not one word of the path requested survives.
  for (const from of [
    'https://paperswithcode.com/sota/image-classification-on-imagenet',
    'https://paperswithcode.com/task/question-answering',
  ]) {
    assert.equal(classifyRedirect(from, 'https://huggingface.co/papers/trending'), 'cross-site-repath', from);
  }

  assert.equal(classifyRedirect('not a url', 'https://x.test/'), 'unknown', 'never throws on junk');
});

test('a meta refresh is read the way a browser reads it, including a relative target', () => {
  // The exact tag `crfm.stanford.edu/helm/latest/` served, measured live.
  const helm =
    '<html><head><meta http-equiv="refresh" content="0; URL=https://crfm.stanford.edu/helm/classic/latest"></head></html>';
  assert.equal(
    metaRefreshTarget(helm, 'https://crfm.stanford.edu/helm/latest/'),
    'https://crfm.stanford.edu/helm/classic/latest',
  );
  assert.equal(
    metaRefreshTarget("<meta http-equiv='REFRESH' content='5;url=../elsewhere/'>", 'https://x.test/a/b/'),
    'https://x.test/a/elsewhere/',
    'relative targets resolve against the page, as a browser would',
  );
  assert.equal(metaRefreshTarget('<p>an ordinary page</p>', 'https://x.test/'), null);
  assert.equal(metaRefreshTarget('<meta charset="utf-8">', 'https://x.test/'), null, 'other meta tags are not refreshes');
});

test('checkUrl follows a meta refresh and reports the destination, and leaves a real page alone', async (t) => {
  const realFetch = globalThis.fetch;
  t.after(() => (globalThis.fetch = realFetch));

  const html = (body, extra = {}) =>
    new Response(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', ...extra } });

  // A 232-byte stub in front of a page that is GONE. Before this, the stub's
  // own 200 was the whole answer and the citation read green.
  const seen = [];
  globalThis.fetch = async (url, opts) => {
    seen.push(`${opts.method} ${url}`);
    if (String(url).includes('/classic/')) return new Response(null, { status: 404 });
    return html(
      '<html><head><meta http-equiv="refresh" content="0; URL=https://helm.fixture-vendor.net/classic/latest"></head></html>',
      { 'content-length': '232' },
    );
  };
  const stub = await checkUrl('https://helm.fixture-vendor.net/latest/');
  assert.equal(stub.metaRefresh, 'https://helm.fixture-vendor.net/classic/latest');
  assert.equal(stub.status, 404, "the destination's status is the one that answers the question");
  assert.equal(stub.ok, false);

  // A real page must not cost a second hop, and must record no refresh.
  seen.length = 0;
  globalThis.fetch = async (url, opts) => {
    seen.push(`${opts.method} ${url}`);
    return html('<html><body><h1>A real article</h1></body></html>', { 'content-length': '900000' });
  };
  const page = await checkUrl('https://fixture-vendor.net/article');
  assert.equal(page.ok, true);
  assert.equal(page.metaRefresh, null);
  assert.equal(page.bytes, 900000, 'the destination\'s byte length is recorded, as the post asks');
  assert.deepEqual(seen, ['HEAD https://fixture-vendor.net/article'], 'a page too big to be a stub is never re-fetched');
});

test('a response with no content-length records unknown bytes, not zero bytes', async (t) => {
  const realFetch = globalThis.fetch;
  t.after(() => (globalThis.fetch = realFetch));
  // Number(null) is 0, so reading the header straight through Number() writes
  // "0 bytes" — a measurement of nothing, stored as if it were one. Measured
  // live on www.anthropic.com/news, which sends no content-length.
  globalThis.fetch = async () => new Response(null, { status: 200, headers: { 'content-type': 'text/html' } });
  const res = await checkUrl('https://chunked.fixture-vendor.net/');
  assert.equal(res.bytes, null);
  assert.equal(res.ok, true);
});

test('distinct citations collapsing onto one page are drift; the same page cited once is not', () => {
  const cited = ['content/wiki/concept/x.md'];
  const rec = (final_url) => ({
    last_checked: '2026-08-29',
    status: 200,
    ok: true,
    error: null,
    last_ok: '2026-08-29',
    consecutive_failures: 0,
    final_url,
    bytes: 1504429,
    meta_refresh: null,
  });

  // The measured state of paperswithcode on 2026-08-29, plus every legitimate
  // redirect from the same post. Only the first three may produce findings.
  const state = {
    urls: {
      'https://paperswithcode.com/': rec('https://huggingface.co/papers/trending'),
      'https://paperswithcode.com/sota/image-classification-on-imagenet': rec('https://huggingface.co/papers/trending'),
      'https://paperswithcode.com/task/question-answering': rec('https://huggingface.co/papers/trending'),
      'https://paperswithcode.com/paper/attention-is-all-you-need': rec('https://huggingface.co/papers/1706.03762'),
      'https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard': rec(
        'https://huggingface.co/spaces/lmarena-ai/arena-leaderboard',
      ),
      'https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard': rec(
        'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard',
      ),
      'http://arxiv.org/abs/1706.03762': rec('https://arxiv.org/abs/1706.03762'),
      'https://aider.chat/docs/leaderboards/': rec('https://aider.chat/docs/leaderboards/'),
    },
  };
  const links = Object.keys(state.urls).map((url) => ({ url, cited_by: cited }));
  const { redirected, drift } = referenceDrift(links, state);

  assert.deepEqual(
    drift.map((d) => d.url).sort(),
    [
      'https://paperswithcode.com/',
      'https://paperswithcode.com/sota/image-classification-on-imagenet',
      'https://paperswithcode.com/task/question-answering',
    ],
    'the three that collapse onto one feed, and nothing else',
  );
  assert.ok(drift.every((d) => d.kind === 'catch-all'));
  assert.match(drift[0].detail, /3 distinct cited URL/);

  // The moves that file nothing are still RECORDED — an honest observation is
  // the point, and a destination nobody can see is what the post is about.
  const observed = redirected.map((m) => m.url);
  assert.ok(observed.includes('https://paperswithcode.com/paper/attention-is-all-you-need'));
  assert.ok(observed.includes('https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard'));
  assert.ok(!observed.includes('http://arxiv.org/abs/1706.03762'), 'http -> https is not a move a reader would notice');
  assert.ok(!observed.includes('https://aider.chat/docs/leaderboards/'), 'a URL that did not move is not reported');

  // One citation alone onto a catch-all page cannot be told from a rename.
  const single = referenceDrift(
    [{ url: 'https://paperswithcode.com/dataset/imagenet', cited_by: cited }],
    { urls: { 'https://paperswithcode.com/dataset/imagenet': rec('https://huggingface.co/datasets/zh-plus/tiny-imagenet') } },
  );
  assert.equal(single.drift.length, 0, 'a plausible substitute needs the page read; it is recorded, not filed');
  assert.equal(single.redirected.length, 1);
});

test('a broken link is not double-filed as drift — one URL, one finding', () => {
  const state = {
    urls: {
      'https://huggingface.co/datasets/imagenet-1k': {
        last_checked: '2026-08-29', status: 404, ok: false, error: null, last_ok: null,
        consecutive_failures: 2, final_url: 'https://huggingface.co/imagenet-1k/datasets', bytes: 52283, meta_refresh: null,
      },
    },
  };
  const { drift, redirected } = referenceDrift(
    [{ url: 'https://huggingface.co/datasets/imagenet-1k', cited_by: ['content/wiki/concept/x.md'] }],
    state,
  );
  assert.deepEqual(drift, [], 'a 404 is already a broken-link repair; drift must not stack a second item on it');
  assert.deepEqual(redirected, []);
});

test('end to end: a catch-all files one repair BELOW rank 90; an org rename files none', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  writeEntry(
    root,
    'content/wiki/concept/citations.md',
    { id: 'concept/citations', kind: 'concept', display_name: 'Citations', aliases: [], facts: [], mentions: [] },
    'The table was at https://pwc.fixture-vendor.net/sota/image-classification-on-imagenet and the task\n' +
      'page at https://pwc.fixture-vendor.net/task/question-answering. The arena moved to\n' +
      'https://hf.fixture-vendor.net/spaces/lmsys/chatbot-arena-leaderboard.\n',
  );

  const alive = (final_url) => ({
    last_checked: '2026-08-27', status: 200, ok: true, error: null, last_ok: '2026-08-27',
    consecutive_failures: 0, final_url, bytes: 1504429, meta_refresh: null,
  });
  writeJson(join(root, 'data', 'linkcheck.json'), {
    urls: {
      'https://pwc.fixture-vendor.net/sota/image-classification-on-imagenet': alive('https://feed.fixture-host.net/papers/trending'),
      'https://pwc.fixture-vendor.net/task/question-answering': alive('https://feed.fixture-host.net/papers/trending'),
      'https://hf.fixture-vendor.net/spaces/lmsys/chatbot-arena-leaderboard': alive(
        'https://hf.fixture-vendor.net/spaces/lmarena-ai/arena-leaderboard',
      ),
    },
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);

  const fresh = readJson(paths.freshness(root));
  assert.deepEqual(
    fresh.reference_drift.map((d) => d.url).sort(),
    [
      'https://pwc.fixture-vendor.net/sota/image-classification-on-imagenet',
      'https://pwc.fixture-vendor.net/task/question-answering',
    ],
    'only the pair that collapsed onto one destination',
  );
  assert.equal(fresh.link_check.drifted, 2);
  assert.equal(fresh.link_check.redirected, 3, 'the org rename is recorded even though it files nothing');

  const items = readJson(paths.queue(root)).items;
  const repairs = items.filter((i) => i.reason === 'reference-drift');
  assert.equal(repairs.length, 2);
  assert.equal(repairs[0].rank, 72);
  assert.ok(repairs[0].rank < 90, 'drift must never outrank a dead link, nor sit where 5hn sat');
  assert.match(repairs[0].detail, /Re-point the citation/, 'every finding names a fix that closes it');
  assert.equal(
    items.filter((i) => String(i.subject).includes('lmsys')).length,
    0,
    'an org rename is a legitimate redirect: recorded, never filed',
  );
});

test('a declined status neither counts as a failure nor claims the link was verified', async (t) => {
  const root = makeRoot([]);
  const realFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = realFetch;
    cleanup(root);
  });

  writeJson(join(root, 'data', 'linkcheck.json'), {
    urls: {
      'https://blocked.fixture-vendor.net/': { last_checked: '2026-01-01', status: 500, ok: false, error: null, last_ok: '2025-12-01', consecutive_failures: 1 },
    },
  });

  globalThis.fetch = async (url) => new Response(null, { status: String(url).includes('/blocked') || String(url).includes('blocked.') ? 429 : 404 });

  const result = await rollingLinkCheck(root, [
    { url: 'https://blocked.fixture-vendor.net/', cited_by: ['content/wiki/model/a.md'] },
    { url: 'https://dead.fixture-vendor.net/', cited_by: ['content/wiki/model/a.md'] },
  ], { offline: false });

  const rec = result.state.urls['https://blocked.fixture-vendor.net/'];
  assert.equal(rec.ok, null, 'a rate limit is not a verdict about the resource');
  assert.equal(rec.consecutive_failures, 1, 'the prior failure is carried through, not incremented by a non-verdict');
  assert.equal(rec.last_ok, '2025-12-01', 'and not advanced either — nothing was verified');
  assert.equal(rec.last_checked, result.state.urls['https://dead.fixture-vendor.net/'].last_checked,
    'last_checked does advance, so a rate-limiting host is not re-hit every run');

  assert.equal(result.declined, 1, 'counted, not hidden');
  assert.deepEqual(result.broken.map((b) => b.url), ['https://dead.fixture-vendor.net/'],
    'the 404 is still reported; only the declined one produces nothing');
});
