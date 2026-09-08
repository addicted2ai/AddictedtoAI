/**
 * indexnow.test.mjs — the submission, and the five guards that stop it
 * (beads `addictedtoai-k1j`).
 *
 * **Every test in this file runs with no network available to it.** That is not
 * an accident of how they are written; it is the property under test. A
 * submission is an outward-facing action, and this repository has twice
 * shipped an entry point whose NAME promised inspection and which reached the
 * live remote: `npm test` (`addictedtoai-wxq` / `-64y`) and
 * `pulse/verify-zero-model.mjs` (`addictedtoai-r8k`). Both happened because
 * something assumed a flag was false and nothing re-checked when it changed.
 *
 * So the arming decision is a **pure function** and each guard is measured on
 * its own, with the other four satisfied — a guard tested only in combination
 * is a guard that can be deleted without any test going red. The one test that
 * exercises the submitter end to end injects a fake `fetch` that RECORDS the
 * call, and the file's last test asserts that a fully-armed configuration
 * pointed at loopback still refuses, which is what makes every fixture in
 * `pulse/tests/` structurally inert rather than inert by remembering.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

import {
  armed,
  changedUrls,
  hostOf,
  submissionBody,
  submitIndexNow,
  INDEXNOW_ENDPOINT,
  MAX_URLS,
} from '../lib/indexnow.mjs';
import { INDEXNOW_KEY, INDEXNOW_KEY_ROUTE } from '../../lib/asset-routes.mjs';
import { SITE_URL, SITE_HOSTS } from '../../lib/site-config.mjs';

const PULSE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(PULSE, '..');

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>${SITE_URL}/</loc><lastmod>2026-08-31T12:00:00.000Z</lastmod></url>
  <url><loc>${SITE_URL}/wiki/concept/ai-winter</loc><lastmod>2026-08-31T12:00:00.000Z</lastmod></url>
  <url><loc>${SITE_URL}/wiki/model/old</loc><lastmod>2026-08-20T12:00:00.000Z</lastmod></url>
  <url><loc>${SITE_URL}/colophon</loc></url>
</urlset>`;

/** A repository root with a built export in it, under the OS temp dir. */
function fixtureRoot({ withKeyFile = true, sitemap = SITEMAP } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'atai-indexnow-'));
  mkdirSync(join(root, 'out'), { recursive: true });
  writeFileSync(join(root, 'out', 'sitemap.xml'), sitemap, 'utf8');
  if (withKeyFile) writeFileSync(join(root, 'out', INDEXNOW_KEY_ROUTE.replace(/^\//, '')), INDEXNOW_KEY, 'utf8');
  return root;
}

/** A fetch that records rather than requests. Calling the real one is the bug. */
function recordingFetch() {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    return { status: 200 };
  };
  impl.calls = calls;
  return impl;
}

const ARMED = {
  config: { publish: true },
  dryRun: false,
  siteUrl: SITE_URL,
  keyFileExists: true,
  urls: [`${SITE_URL}/`],
};

// ── the URL set ───────────────────────────────────────────────────────────

test('changedUrls selects only URLs newer than their last successful submission', () => {
  assert.deepEqual(changedUrls(SITEMAP, []), [
    `${SITE_URL}/`,
    `${SITE_URL}/wiki/concept/ai-winter`,
    `${SITE_URL}/wiki/model/old`,
  ]);
  assert.deepEqual(changedUrls(SITEMAP, [{ date: '2026-08-20', url: `${SITE_URL}/`, status: 'success' }]), [
    `${SITE_URL}/`,
    `${SITE_URL}/wiki/concept/ai-winter`,
    `${SITE_URL}/wiki/model/old`,
  ]);
  assert.deepEqual(changedUrls(SITEMAP, [{ date: '2026-08-31', url: `${SITE_URL}/`, status: 'success' }]), [
    `${SITE_URL}/wiki/concept/ai-winter`,
    `${SITE_URL}/wiki/model/old`,
  ]);
});

test('a URL with no lastmod is never submitted — absence is not a claim that it changed', () => {
  assert.ok(!changedUrls(SITEMAP, []).includes(`${SITE_URL}/colophon`), '/colophon carries no lastmod and must never be pinged');
});

test('changedUrls without a ledger treats it as empty, and malformed rows do not qualify as success', () => {
  assert.deepEqual(changedUrls(SITEMAP, undefined), [
    `${SITE_URL}/`,
    `${SITE_URL}/wiki/concept/ai-winter`,
    `${SITE_URL}/wiki/model/old`,
  ]);
  assert.deepEqual(changedUrls(SITEMAP, [{ date: '2026-08-31', url: `${SITE_URL}/`, status: 'failed' }]), [
    `${SITE_URL}/`,
    `${SITE_URL}/wiki/concept/ai-winter`,
    `${SITE_URL}/wiki/model/old`,
  ]);
});

test('changedUrls reads the midday stamp as a calendar date, which is why sitemap.ts writes T12:00:00Z', () => {
  const xml = `<urlset><url><loc>${SITE_URL}/x</loc><lastmod>2026-08-31T12:00:00.000Z</lastmod></url></urlset>`;
  assert.deepEqual(changedUrls(xml, []), [`${SITE_URL}/x`]);
});

// ── the five guards, each measured alone ──────────────────────────────────

test('ARMED is genuinely armed — otherwise every guard test below passes for the wrong reason', () => {
  assert.deepEqual(armed(ARMED), { ok: true, reason: 'armed' });
});

test('guard 1: publish: false refuses, and so does a missing or malformed config', () => {
  assert.equal(armed({ ...ARMED, config: { publish: false } }).reason, 'publish-disabled');
  assert.equal(armed({ ...ARMED, config: {} }).reason, 'publish-disabled');
  assert.equal(armed({ ...ARMED, config: null }).reason, 'publish-disabled');
  assert.equal(armed({ ...ARMED, config: undefined }).reason, 'publish-disabled');
  // Truthiness is not the test: only the literal `true` arms it.
  assert.equal(armed({ ...ARMED, config: { publish: 'yes' } }).reason, 'publish-disabled');
  assert.equal(armed({ ...ARMED, config: { publish: 1 } }).reason, 'publish-disabled');
});

test('guard 2: a dry run refuses even when the config says publish', () => {
  assert.equal(armed({ ...ARMED, dryRun: true }).reason, 'dry-run');
});

test('guard 3: a host that is not this site refuses — this is what makes fixtures inert', () => {
  for (const url of ['http://127.0.0.1:4173', 'http://localhost:3000', 'https://example.com', 'https://evil.test']) {
    assert.equal(armed({ ...ARMED, siteUrl: url }).reason, 'not-this-site', url);
  }
  assert.equal(armed({ ...ARMED, siteUrl: 'not a url' }).reason, 'not-this-site');
  assert.equal(armed({ ...ARMED, siteUrl: undefined }).reason, 'not-this-site');
  // Every host the site calls its own arms it, and only those.
  for (const host of SITE_HOSTS) {
    assert.equal(armed({ ...ARMED, siteUrl: `https://${host}` }).ok, true, host);
  }
});

test('guard 4: no key file served, no submission', () => {
  assert.equal(armed({ ...ARMED, keyFileExists: false }).reason, 'no-key-file');
});

test('guard 5: nothing changed today is a reason, not an empty request', () => {
  assert.equal(armed({ ...ARMED, urls: [] }).reason, 'nothing-changed');
});

// ── the request body ──────────────────────────────────────────────────────

test('the body carries the protocol fields, and keyLocation points at the file the build writes', () => {
  const body = submissionBody({ host: hostOf(SITE_URL), siteUrl: SITE_URL, urls: [`${SITE_URL}/a`] });
  assert.equal(body.host, 'www.addictedtoai.net');
  assert.equal(body.key, INDEXNOW_KEY);
  assert.equal(body.keyLocation, `${SITE_URL}${INDEXNOW_KEY_ROUTE}`);
  assert.deepEqual(body.urlList, [`${SITE_URL}/a`]);
});

test('the key is the shape the protocol requires: 8-128 chars from a-zA-Z0-9-', () => {
  assert.match(INDEXNOW_KEY, /^[A-Za-z0-9-]{8,128}$/);
  assert.equal(INDEXNOW_KEY_ROUTE, `/${INDEXNOW_KEY}.txt`);
});

test('the urlList is capped at the protocol ceiling rather than sent oversize', () => {
  const many = Array.from({ length: MAX_URLS + 25 }, (_, i) => `${SITE_URL}/p${i}`);
  assert.equal(submissionBody({ host: 'h', siteUrl: SITE_URL, urls: many }).urlList.length, MAX_URLS);
});

// ── the submitter ─────────────────────────────────────────────────────────

test('an armed run posts once, to the shared endpoint, with the changed URLs', async () => {
  const root = fixtureRoot();
  const fetchImpl = recordingFetch();
  const result = await submitIndexNow({
    root,
    day: '2026-08-31',
    siteUrl: SITE_URL,
    config: { publish: true },
    log: { step: () => {} },
    fetchImpl,
  });
  assert.equal(fetchImpl.calls.length, 1, 'exactly one request');
  assert.equal(fetchImpl.calls[0].url, INDEXNOW_ENDPOINT);
  assert.equal(fetchImpl.calls[0].init.method, 'POST');
  assert.match(fetchImpl.calls[0].init.headers['Content-Type'], /application\/json/);
  const sent = JSON.parse(fetchImpl.calls[0].init.body);
  assert.deepEqual(sent.urlList, [`${SITE_URL}/`, `${SITE_URL}/wiki/concept/ai-winter`, `${SITE_URL}/wiki/model/old`]);
  assert.equal(result.submitted, true);
  assert.equal(result.count, 3);
});

test('a delayed deploy is submitted once, and an unchanged rerun submits nothing', async () => {
  const root = fixtureRoot({
    sitemap: `<urlset><url><loc>${SITE_URL}/delayed</loc><lastmod>2026-08-31T12:00:00.000Z</lastmod></url></urlset>`,
  });
  const firstFetch = recordingFetch();
  const first = await submitIndexNow({ root, day: '2026-09-01', siteUrl: SITE_URL, config: { publish: true }, log: { step: () => {} }, fetchImpl: firstFetch });
  const secondFetch = recordingFetch();
  const second = await submitIndexNow({ root, day: '2026-09-02', siteUrl: SITE_URL, config: { publish: true }, log: { step: () => {} }, fetchImpl: secondFetch });
  assert.equal(first.submitted, true);
  assert.equal(firstFetch.calls.length, 1);
  assert.equal(second.reason, 'nothing-changed');
  assert.equal(secondFetch.calls.length, 0);
});

test('a failed submission remains retryable and does not suppress a later success', async () => {
  const root = fixtureRoot({
    sitemap: `<urlset><url><loc>${SITE_URL}/retry</loc><lastmod>2026-08-20T12:00:00.000Z</lastmod></url></urlset>`,
  });
  const failed = await submitIndexNow({ root, day: '2026-09-01', siteUrl: SITE_URL, config: { publish: true }, log: { step: () => {} }, fetchImpl: async () => ({ status: 500 }) });
  const retried = recordingFetch();
  const success = await submitIndexNow({ root, day: '2026-09-02', siteUrl: SITE_URL, config: { publish: true }, log: { step: () => {} }, fetchImpl: retried });
  assert.equal(failed.submitted, false);
  assert.equal(success.submitted, true);
  assert.equal(retried.calls.length, 1);
});

test('a URL unchanged since its successful submission is never submitted, however old the ledger is', async () => {
  const root = fixtureRoot({ sitemap: `<urlset><url><loc>${SITE_URL}/wiki/model/old</loc><lastmod>2026-08-20T12:00:00.000Z</lastmod></url></urlset>` });
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(join(root, 'data', 'indexnow.jsonl'), JSON.stringify({ date: '2026-08-20', status: 'success', url: `${SITE_URL}/wiki/model/old` }) + '\n');
  const fetchImpl = recordingFetch();
  const result = await submitIndexNow({ root, day: '2026-09-01', siteUrl: SITE_URL, config: { publish: true }, log: { step: () => {} }, fetchImpl });
  assert.equal(result.reason, 'nothing-changed');
  assert.equal(fetchImpl.calls.length, 0);
});

test('every unarmed configuration makes NO request at all, and says which guard stopped it', async () => {
  const cases = [
    ['publish-disabled', { config: { publish: false } }],
    ['dry-run', { dryRun: true }],
    ['not-this-site', { siteUrl: 'http://127.0.0.1:4173' }],
    ['nothing-changed', { day: '2001-01-01' }],
  ];
  for (const [reason, over] of cases) {
    const root = fixtureRoot({
      sitemap: reason === 'nothing-changed'
        ? `<urlset><url><loc>${SITE_URL}/unchanged</loc><lastmod>2026-08-31T12:00:00.000Z</lastmod></url></urlset>`
        : SITEMAP,
    });
    if (reason === 'nothing-changed') {
      mkdirSync(join(root, 'data'), { recursive: true });
      writeFileSync(join(root, 'data', 'indexnow.jsonl'), JSON.stringify({ date: '2026-08-31', status: 'success', url: `${SITE_URL}/unchanged` }) + '\n');
    }
    const fetchImpl = recordingFetch();
    const result = await submitIndexNow({
      root,
      day: '2026-08-31',
      siteUrl: SITE_URL,
      config: { publish: true },
      log: { step: () => {} },
      fetchImpl,
      ...over,
    });
    assert.equal(result.reason, reason);
    assert.equal(result.submitted, false);
    assert.equal(fetchImpl.calls.length, 0, `${reason} must make no request`);
  }
});

test('no key file in the export means no request, however armed everything else is', async () => {
  const fetchImpl = recordingFetch();
  const result = await submitIndexNow({
    root: fixtureRoot({ withKeyFile: false }),
    day: '2026-08-31',
    siteUrl: SITE_URL,
    config: { publish: true },
    log: { step: () => {} },
    fetchImpl,
  });
  assert.equal(result.reason, 'no-key-file');
  assert.equal(fetchImpl.calls.length, 0);
});

test('no built sitemap is "nothing changed", not a throw — a --no-build run must not fail here', async () => {
  const root = mkdtempSync(join(tmpdir(), 'atai-indexnow-empty-'));
  const fetchImpl = recordingFetch();
  const result = await submitIndexNow({
    root,
    day: '2026-08-31',
    siteUrl: SITE_URL,
    config: { publish: true },
    log: { step: () => {} },
    fetchImpl,
  });
  assert.equal(result.reason, 'no-key-file', 'an export with no key file stops before anything else');
  assert.equal(fetchImpl.calls.length, 0);
});

test('200 and 202 are successful receipts, while protocol failures stay distinct', async () => {
  const cases = [
    [200, true, 'received'],
    [202, true, 'validation pending'],
    [400, false, 'bad request'],
    [403, false, 'forbidden'],
    [422, false, 'unprocessable'],
    [429, false, 'too many requests'],
    [500, false, 'unknown response'],
  ];
  for (const [status, submitted, expectedMessage] of cases) {
    const messages = [];
    const fetchImpl = async () => ({ status });
    const result = await submitIndexNow({
      root: fixtureRoot(),
      day: '2026-08-31',
      siteUrl: SITE_URL,
      config: { publish: true },
      log: { step: (_name, detail) => messages.push(detail) },
      fetchImpl,
    });
    assert.equal(result.submitted, submitted, `HTTP ${status}`);
    assert.equal(result.reason, `http-${status}`);
    assert.equal(result.status, status);
    assert.match(messages[0], new RegExp(expectedMessage), `HTTP ${status} report`);
    if (status === 202) {
      assert.ok(messages[0].includes(INDEXNOW_KEY_ROUTE), '202 report names the configured key file');
      assert.doesNotMatch(messages[0], /not accepted/);
    }
  }
});

test('a thrown request is caught — a search engine outage never stops this site publishing', async () => {
  const fetchImpl = async () => {
    throw Object.assign(new Error('socket hang up'), { name: 'TypeError' });
  };
  const result = await submitIndexNow({
    root: fixtureRoot(),
    day: '2026-08-31',
    siteUrl: SITE_URL,
    config: { publish: true },
    log: { step: () => {} },
    fetchImpl,
  });
  assert.equal(result.reason, 'request-failed');
  assert.equal(result.submitted, false);
});

// ── the structural claims ─────────────────────────────────────────────────

test('nothing in indexnow.mjs writes HOLD.md or exits — a failed ping is not a breaker', () => {
  const src = readFileSync(join(PULSE, 'lib', 'indexnow.mjs'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
  assert.ok(!/HOLD\.md/.test(code), 'this module must never write the halt file');
  assert.ok(!/process\.exit/.test(code), 'and must never end the run');
  assert.ok(!/writeFileSync|appendFileSync/.test(code), 'and does not write state through raw filesystem calls');
  assert.match(code, /appendJsonl\(ledgerFile/, 'submission state uses the shared append-only JSONL writer');
});

test('the Pulse reaches outside pulse/ for exactly five modules, and all are import-free', () => {
  // The precedent this change sets, pinned so it cannot widen quietly. Every
  // target is a plain declaration file with no dependency of its own, which is
  // what keeps `pulse/tests/zero-model.test.mjs`'s property true: none can
  // pull anything into the Pulse's dependency graph. The import-free assertion
  // below is the load-bearing half — the list is only the audit trail.
  //
  // WIDENED from two to four by `separate-a-claim-from-a-fact`, and here is the
  // argument for each, which is what this assertion asks for:
  //
  //   `lib/change-kinds.mjs` — the closed list of kinds a `data/changes.jsonl`
  //   line may carry. The Pulse WRITES that file and the site READS it, so the
  //   declaration has to be reachable from both or there are two lists; two
  //   lists is exactly the defect this change removed (`MATERIAL_KINDS`, which
  //   read as authoritative, was imported nowhere, and disagreed with the data).
  //   Task 17 names `pulse/lib/indexnow.mjs`'s own cross-boundary import as the
  //   precedent for putting it in `lib/`.
  //
  //   `lib/frontier-metrics.mjs` — what the registry's `frontier` block
  //   declares. `pulse/lib/frontier.mjs` computes leaders from it and the site
  //   build asks it which metrics may be PRINTED; a second copy of "registered"
  //   and "cleared" is a rights answer that can drift, which is the one kind of
  //   drift K24 cannot tolerate. Its header records that it must stay
  //   import-free for this test's sake.
  //
  //   `lib/domains.mjs` — widened by the change `tag-the-corpus-by-domain`, and
  //   the argument belongs here rather than in a commit message. It is the ONE
  //   declared home of the closed domain vocabulary. The Pulse's seeding step
  //   writes domain ids into content front matter (`domains_seeded`), and the
  //   build gates those ids against that same list — so the engine either reads
  //   the list or keeps a second copy of it, and a second copy is the drift the
  //   single home exists to prevent: the moment the two disagreed, the Pulse
  //   would write files its own rebuild rejects. The file is frozen constants
  //   with no imports, so the boundary this test defends is unmoved.
  const files = fg.sync('**/*.mjs', { cwd: PULSE, absolute: true, ignore: ['tests/**'] });
  const outside = new Set();
  for (const file of files) {
    for (const m of readFileSync(file, 'utf8').matchAll(/from\s+'(\.\.\/\.\.\/[^']+)'/g)) outside.add(m[1]);
  }
  assert.deepEqual(
    [...outside].sort(),
    [
      '../../lib/asset-routes.mjs',
      '../../lib/change-kinds.mjs',
      '../../lib/domains.mjs',
      '../../lib/frontier-metrics.mjs',
      '../../lib/site-config.mjs',
    ],
    'a new cross-boundary import into pulse/ needs its own argument, in its own review',
  );
  for (const rel of outside) {
    const text = readFileSync(join(PULSE, 'lib', rel), 'utf8');
    const code = text.replace(/\/\*[\s\S]*?\*\//g, ' ');
    assert.ok(!/^\s*import\s/m.test(code), `${rel} must stay import-free`);
  }
});

test('the publish step calls the submitter only from inside its deploy-confirmed branch', () => {
  // Structural, like zero-model.test.mjs's own guard test and for the same
  // reason: the behavioural version of this claim would have to publish to
  // check it. What matters is that the one call site sits after
  // the containment check has already returned true. The check moved inside the
  // polling helper when the confirmation window landed, so the anchor is that
  // helper's landed branch rather than the old single-window `if`.
  const src = readFileSync(join(PULSE, 'lib', 'publish.mjs'), 'utf8');
  const calls = [...src.matchAll(/submitIndexNow\(/g)];
  assert.equal(calls.length, 1, 'exactly one call site');
  const guard = src.indexOf('if (carries(id, expected)) return id;');
  assert.ok(guard > 0 && calls[0].index > guard, 'the call must follow the deploy-landed check');
  // And nothing may reach it on the dry-run path, which returns earlier.
  const dryReturn = src.indexOf("return { published: false, reason: 'dry-run'");
  assert.ok(dryReturn > 0 && dryReturn < calls[0].index, 'the dry-run return comes first');
});

test('the .gitignore covers the key file, so a rotation cannot commit build output', () => {
  const ignore = readFileSync(join(REPO, '.gitignore'), 'utf8');
  assert.ok(
    ignore.includes(`/public${INDEXNOW_KEY_ROUTE}`),
    `rotating the key means updating .gitignore too — expected /public${INDEXNOW_KEY_ROUTE}`,
  );
});
