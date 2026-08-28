/**
 * analytics.test.mjs — the parts of the GA4 wiring that can be decided without
 * a browser (task 5.1, specs/analytics).
 *
 * The boundary matters here more than usual. These tests prove the *shape* of
 * the tag: which origin, which ID, whether the automatic page_view is off,
 * whether a hit is recognised and its path read correctly. They prove nothing
 * whatever about delivery — the site's previous incarnation would have passed
 * every one of them while receiving no events for months. Delivery is
 * `scripts/verify-analytics.mjs`, which watches the network and nothing else.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ROOT } from './paths.mjs';

import {
  ENV_VAR,
  GA_LOADER_ORIGIN,
  NAV_PARAM,
  bootstrapSnippet,
  collectHits,
  cspAllowsGa,
  hitPath,
  isCollectUrl,
  loaderSrc,
  measurementIdFrom,
  parseCsp,
  sourceListAllows,
} from './analytics.mjs';
import { ALLOWED_ORIGINS, originOf, isAllowedOrigin } from './origins.mjs';

const GOOD = 'G-KJPHKYL3XL';

// ---- the configuration decision ------------------------------------------

test('an unset variable means silence, not a default', () => {
  assert.equal(measurementIdFrom({}), '');
  assert.equal(measurementIdFrom({ [ENV_VAR]: undefined }), '');
  assert.equal(measurementIdFrom({ [ENV_VAR]: '' }), '');
  assert.equal(measurementIdFrom({ [ENV_VAR]: '   ' }), '');
});

test('a set variable is returned trimmed', () => {
  assert.equal(measurementIdFrom({ [ENV_VAR]: GOOD }), GOOD);
  assert.equal(measurementIdFrom({ [ENV_VAR]: `  ${GOOD}\n` }), GOOD);
});

test('a malformed ID stops the build rather than shipping a tag that reports to nobody', () => {
  for (const bad of ['UA-12345-1', 'G-abc', 'GKJPHKYL3XL', 'G_KJPHKYL3XL', 'nope']) {
    assert.throws(
      () => measurementIdFrom({ [ENV_VAR]: bad }),
      (err) => err.message.includes(ENV_VAR) && err.message.includes('G-XXXXXXXXXX'),
      `expected ${bad} to be refused`,
    );
  }
});

test('the failure message never echoes the offending value', () => {
  // A measurement ID is public, but this same code path would print whatever
  // was pasted into the variable — including something that is not an ID.
  let message = '';
  try {
    measurementIdFrom({ [ENV_VAR]: 'sk-secret-looking-value' });
  } catch (err) {
    message = err.message;
  }
  assert.ok(message.length > 0);
  assert.ok(!message.includes('sk-secret-looking-value'), message);
});

// ---- the emitted tag ------------------------------------------------------

test('the loader points at googletagmanager.com and carries the id', () => {
  const src = loaderSrc(GOOD);
  assert.ok(src.startsWith(`${GA_LOADER_ORIGIN}/gtag/js?id=`), src);
  assert.ok(src.endsWith(GOOD), src);
});

test('the loader origin is on the task 4.10 allowlist, so the tag cannot break the build', () => {
  const host = originOf(loaderSrc(GOOD));
  assert.equal(host, 'www.googletagmanager.com');
  assert.ok(ALLOWED_ORIGINS.includes(host));
  assert.ok(isAllowedOrigin(host));
});

test("gtag's automatic page_view is disabled — the tracker is the single sender", () => {
  const snippet = bootstrapSnippet(GOOD);
  assert.match(snippet, /send_page_view:\s*false/);
  assert.match(snippet, /gtag\('config',"G-KJPHKYL3XL"/);
  assert.match(snippet, /window\.dataLayer=window\.dataLayer\|\|\[\]/);
});

test('the id is JSON-escaped into the inline script, never interpolated raw', () => {
  // Not a realistic ID — the point is that the snippet builder cannot be talked
  // into emitting a broken or injected inline script even if one got past the
  // pattern check.
  const snippet = bootstrapSnippet('G-\'"</script>');
  assert.ok(!snippet.includes("'G-'\""), snippet);
  assert.ok(snippet.includes('\\"'), snippet);
});

// ---- recognising a hit ----------------------------------------------------

test('measurement-protocol hits are recognised, including regional endpoints', () => {
  assert.ok(isCollectUrl('https://www.google-analytics.com/g/collect?v=2&tid=G-X'));
  assert.ok(isCollectUrl('https://region1.google-analytics.com/g/collect?v=2'));
  assert.ok(isCollectUrl('https://analytics.google.com/g/collect?v=2'));
});

test('everything that is not a hit is rejected, including the loader itself', () => {
  assert.ok(!isCollectUrl('https://www.googletagmanager.com/gtag/js?id=G-X'));
  assert.ok(!isCollectUrl('https://example.com/g/collect'));
  assert.ok(!isCollectUrl('https://google-analytics.com.evil.test/g/collect'));
  assert.ok(!isCollectUrl('http://localhost:3000/'));
  assert.ok(!isCollectUrl('not a url'));
});

test('a hit yields its tid, event name and reported location', () => {
  const [hit] = collectHits(
    'https://www.google-analytics.com/g/collect?v=2&tid=G-KJPHKYL3XL&en=page_view' +
      '&dl=http%3A%2F%2Flocalhost%3A3000%2Fwiki&dt=Wiki',
  );
  assert.equal(hit.tid, 'G-KJPHKYL3XL');
  assert.equal(hit.en, 'page_view');
  assert.equal(hit.dt, 'Wiki');
  assert.equal(hitPath(hit), '/wiki');
});

test("a hit records whether it came from this site's tracker or from somewhere else", () => {
  // The attribution the click-through assertion turns on. GA4 Enhanced
  // Measurement sends its own history-change page_view, from a property
  // setting no code here controls, and it carries no marker. Measured on
  // 2026-08-28: with the route tracker disabled, exactly such an unmarked hit
  // arrived for the clicked path — so an assertion that only asked "did a hit
  // arrive for the new path?" passed with the tracker deleted.
  const [ours] = collectHits(
    `https://www.google-analytics.com/g/collect?v=2&tid=G-X&en=page_view&ep.${NAV_PARAM}=route` +
      '&dl=http%3A%2F%2Flocalhost%3A3000%2Fwiki',
  );
  assert.equal(ours.nav, 'route');

  const [theirs] = collectHits(
    'https://www.google-analytics.com/g/collect?v=2&tid=G-X&en=page_view&_ss=1&_fv=1' +
      '&dl=http%3A%2F%2Flocalhost%3A3000%2Fwiki',
  );
  assert.equal(theirs.nav, null, 'an Enhanced Measurement hit carries no marker');
  assert.equal(hitPath(theirs), '/wiki', 'and is otherwise indistinguishable by path alone');
});

test('the nav marker survives a batched POST body', () => {
  const [hit] = collectHits(
    'https://www.google-analytics.com/g/collect?v=2&tid=G-X',
    `en=page_view&ep.${NAV_PARAM}=load&dl=http%3A%2F%2Flocalhost%3A3000%2F`,
  );
  assert.equal(hit.nav, 'load');
  assert.equal(hit.en, 'page_view');
});

test('a batched POST body yields one record per event, sharing the query parameters', () => {
  const hits = collectHits(
    'https://www.google-analytics.com/g/collect?v=2&tid=G-KJPHKYL3XL',
    'en=page_view&dl=http%3A%2F%2Flocalhost%3A3000%2F\nen=scroll&dl=http%3A%2F%2Flocalhost%3A3000%2F',
  );
  assert.equal(hits.length, 2);
  assert.deepEqual(
    hits.map((h) => h.en),
    ['page_view', 'scroll'],
  );
  assert.ok(hits.every((h) => h.tid === 'G-KJPHKYL3XL'));
  assert.equal(hitPath(hits[0]), '/');
});

test('an explicit dp override wins over dl, and a hit with neither reports no path', () => {
  assert.equal(hitPath({ dp: '/learn/basics?q=1', dl: 'http://localhost:3000/' }), '/learn/basics');
  assert.equal(hitPath({ dp: null, dl: null }), null);
  assert.equal(hitPath({ dp: null, dl: 'not a url' }), null);
});

// ---- the CSP guard --------------------------------------------------------
//
// The first root cause specs/analytics names: a policy that omits the GA
// origins renders the tag perfectly and silently refuses to run it. The site
// sets no CSP today, so `verify-analytics.mjs` normally exercises only the
// "absent" branch — which would leave the guard itself unproven. These do the
// proving.

test('a policy directive parses into its source list', () => {
  const d = parseCsp("default-src 'self'; script-src 'self' https://www.googletagmanager.com;");
  assert.deepEqual(d['default-src'], ["'self'"]);
  assert.deepEqual(d['script-src'], ["'self'", 'https://www.googletagmanager.com']);
  assert.deepEqual(parseCsp(''), {});
  assert.deepEqual(parseCsp(undefined), {});
});

test('a source list matches exactly, by wildcard subdomain, or by a blanket source', () => {
  assert.ok(sourceListAllows(['https://www.google-analytics.com'], 'www.google-analytics.com'));
  assert.ok(sourceListAllows(['*.google-analytics.com'], 'region1.google-analytics.com'));
  assert.ok(sourceListAllows(['*'], 'anything.example'));
  assert.ok(sourceListAllows(['https:'], 'anything.example'));
  assert.ok(sourceListAllows(undefined, 'anything.example'), 'an absent directive restricts nothing');
  assert.ok(!sourceListAllows(["'self'"], 'www.google-analytics.com'));
  assert.ok(!sourceListAllows(['https://www.google-analytics.com'], 'www.googletagmanager.com'));
});

test("the historically fatal policy — default-src 'self' — is caught", () => {
  const verdict = cspAllowsGa("default-src 'self'");
  assert.equal(verdict.ok, false);
  assert.equal(verdict.script, false);
  assert.equal(verdict.connect, false);
});

test('a policy that allowlists the script but forgets the collector is still caught', () => {
  // The subtle one, and the likeliest to be written by hand: someone unblocks
  // the tag they can see in the HTML and never thinks about where it POSTs.
  const verdict = cspAllowsGa(
    "default-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self'",
  );
  assert.equal(verdict.script, true);
  assert.equal(verdict.connect, false);
  assert.equal(verdict.ok, false);
});

test('a correct policy passes, and script-src-elem overrides script-src', () => {
  assert.equal(
    cspAllowsGa(
      "default-src 'self'; script-src 'self' https://www.googletagmanager.com; " +
        "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
    ).ok,
    true,
  );
  assert.equal(
    cspAllowsGa(
      "script-src 'none'; script-src-elem https://www.googletagmanager.com; " +
        'connect-src https://www.google-analytics.com https://analytics.google.com',
    ).script,
    true,
  );
});

test('a policy with no script or connect directive restricts neither', () => {
  assert.equal(cspAllowsGa("img-src 'self'").ok, true);
});

// ---- the two ends of the marker cannot drift apart ------------------------

test('the route tracker stamps the same parameter name the verification matches on', async () => {
  // RouteTracker is a client component and writes the parameter name as a
  // literal, so that importing this module does not pull the CSP evaluator and
  // everything else into the browser bundle. The cost of that choice is two
  // copies of one string, and the failure mode if they drift is silent and
  // severe: the click-through assertion would stop finding the tracker's own
  // hits and start passing on GA4 Enhanced Measurement's unmarked ones — which
  // is exactly the "verification that cannot fail" this whole check exists to
  // rule out. So the copies are compared here.
  const src = await readFile(join(ROOT, 'app', '_components', 'RouteTracker.tsx'), 'utf8');
  const sends = new RegExp(`^\\s*${NAV_PARAM}:\\s*kind,`, 'm');
  // assert.ok rather than assert.match: a failure here should print the reason,
  // not the whole component.
  assert.ok(
    sends.test(src),
    `RouteTracker.tsx must send the "${NAV_PARAM}" event parameter — it is what lets ` +
      "scripts/verify-analytics.mjs tell this site's page_view from GA4 Enhanced Measurement's.",
  );
});

test("the tracker sends page_view and does not re-enable gtag's automatic send", async () => {
  const src = await readFile(join(ROOT, 'app', '_components', 'RouteTracker.tsx'), 'utf8');
  assert.match(src, /gtag\('event',\s*'page_view'/);
  assert.ok(
    !/send_page_view:\s*true/.test(src) && !/send_page_view:\s*true/.test(bootstrapSnippet('G-ABCDEF')),
    'nothing may turn gtag\'s automatic page_view back on: with the tracker also firing, ' +
      'every landing would be counted twice',
  );
});
