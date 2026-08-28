/**
 * analytics.mjs — the GA4 wiring, as data (task 5.1, specs/analytics).
 *
 * **Why this file exists at all.** The previous version of this site rendered
 * a correct GA script tag, with a correct measurement ID, for months, and
 * received no events. Every check it had confirmed the tag was *present*.
 * Presence was never the problem. So the parts of the tag that can be reasoned
 * about — which origin it loads from, whether the automatic page_view is
 * disabled, whether the ID is even shaped like a measurement ID — live here as
 * plain functions with unit tests, and the part that cannot be reasoned about
 * (does an event actually arrive?) is left entirely to
 * `scripts/verify-analytics.mjs`, which watches the network.
 *
 * Nothing in here is evidence that analytics works. specs/analytics:
 * *"A rendered script tag SHALL never be accepted as evidence that analytics
 * works."*
 *
 * **The one design decision worth stating.** `gtag('config', …)` sends a
 * `page_view` by itself, and the route-change tracker sends one too. Both
 * firing on first load is the double-count failure specs/analytics names
 * ("disable one"). This disables gtag's: `send_page_view: false`. The tracker
 * is then the single sender for every page view, on first load and on every
 * client-side navigation alike, which also means there is exactly one code
 * path to get right rather than two that must agree.
 */

/** The script origin. On the task 4.10 allowlist (`lib/origins.mjs`). */
export const GA_LOADER_ORIGIN = 'https://www.googletagmanager.com';

/**
 * Hosts that serve the measurement protocol endpoint. The regional ones
 * (`region1.` … `region14.`) are what a browser is redirected to depending on
 * where the visitor is; the verification has to recognise all of them or it
 * would report a dead tag for a visitor in the wrong hemisphere.
 */
export const GA_COLLECT_HOST_PATTERN = /(^|\.)google-analytics\.com$|(^|\.)analytics\.google\.com$/i;

/** The path every measurement-protocol v2 hit carries. */
export const GA_COLLECT_PATH = '/g/collect';

/** GA4 measurement IDs are `G-` plus an uppercase alphanumeric token. */
export const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,}$/;

export const ENV_VAR = 'NEXT_PUBLIC_GA_MEASUREMENT_ID';

/**
 * The custom event parameter `RouteTracker` stamps on every `page_view` it
 * sends: `load` for the first view of a document, `route` for a client-side
 * navigation.
 *
 * **Why a marker exists at all.** GA4's Enhanced Measurement includes *"page
 * changes based on browser history events"*, which is configured in the GA4
 * property — not in this repository — and which sends its own `page_view` on
 * `pushState`. It is on by default. Measured here on 2026-08-28: with the
 * route tracker deliberately disabled and `send_page_view: false` in the
 * config, a direct load produced **zero** hits, and a soft navigation still
 * produced **one** `page_view` for the new path, carrying no marker. So the
 * click-through assertion passed with the tracker deleted. That is a
 * verification that cannot fail — the exact thing task 5.2 forbids. The marker
 * is what makes the hit attributable, so the check tests this site's code
 * rather than a Google property setting nobody here can see.
 */
export const NAV_PARAM = 'atai_nav';

/**
 * The configured measurement ID, or `''` when analytics is deliberately off.
 *
 * Absent means silent — specs/analytics requires local development to render
 * no analytics markup at all. Present-but-malformed does **not** mean silent:
 * it means a typo would ship a tag that renders perfectly and reports to
 * nobody, which is precisely the failure this capability exists to prevent, so
 * it stops the build instead.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {string}
 */
export function measurementIdFrom(env) {
  const raw = env?.[ENV_VAR];
  if (raw === undefined || raw === null) return '';
  const id = String(raw).trim();
  if (id === '') return '';
  if (!MEASUREMENT_ID_PATTERN.test(id)) {
    throw new Error(
      `${ENV_VAR} is set but is not a GA4 measurement ID (expected G-XXXXXXXXXX). ` +
        'A malformed ID renders a perfectly valid tag that reports to nobody — the exact ' +
        'silent failure specs/analytics exists to prevent — so the build stops here. ' +
        `Fix the value in .env.local or unset it to build with analytics off. (length ${id.length})`,
    );
  }
  return id;
}

/** The gtag.js loader URL for an ID. */
export function loaderSrc(id) {
  return `${GA_LOADER_ORIGIN}/gtag/js?id=${encodeURIComponent(id)}`;
}

/**
 * The inline bootstrap. Google's canonical snippet with one change:
 * `send_page_view: false`, so the only `page_view` on the site comes from the
 * route tracker. See the note at the top of the file.
 */
export function bootstrapSnippet(id) {
  return (
    'window.dataLayer=window.dataLayer||[];' +
    'function gtag(){dataLayer.push(arguments)}' +
    'window.gtag=gtag;' +
    "gtag('js',new Date());" +
    `gtag('config',${JSON.stringify(id)},{send_page_view:false});`
  );
}

/**
 * Is this URL a measurement-protocol hit? Used by the verification, and
 * exported from here so the browser-side matcher and the build-side constants
 * cannot drift apart.
 */
export function isCollectUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  return GA_COLLECT_HOST_PATTERN.test(u.hostname) && u.pathname.includes(GA_COLLECT_PATH);
}

/**
 * The parameters of a collect hit, from the query string and, when GA batches,
 * from the POST body. Returns `{ tid, en, dl, dp, dt }` — `dl` is the document
 * location the hit reports, which is the field that proves a route-change
 * `page_view` carried the *new* path rather than repeating the landing page.
 *
 * A batched body carries one event per line in the same `k=v&k=v` form, with
 * the shared parameters (tid among them) in the query string; each line is
 * returned as its own record so a batched page_view is still counted once.
 */
export function collectHits(url, postData = '') {
  let u;
  try {
    u = new URL(url);
  } catch {
    return [];
  }
  const shared = Object.fromEntries(u.searchParams);
  const lines = String(postData ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const build = (extra) => {
    const p = { ...shared, ...extra };
    return {
      tid: p.tid ?? null,
      en: p.en ?? null,
      dl: p.dl ?? null,
      dp: p.dp ?? null,
      dt: p.dt ?? null,
      // gtag encodes a custom string event parameter as `ep.<name>`. This is
      // how the verification tells our own tracker's page_view apart from the
      // one GA4 Enhanced Measurement sends on a history change.
      nav: p[`ep.${NAV_PARAM}`] ?? null,
      params: p,
    };
  };

  if (lines.length === 0) return [build({})];
  return lines.map((line) => build(Object.fromEntries(new URLSearchParams(line))));
}

// ---------------------------------------------------------------------------
// Content-Security-Policy
// ---------------------------------------------------------------------------

/**
 * The two origins a CSP has to permit for the tag to work at all: the script
 * it loads, and the endpoint it talks to. specs/analytics names both.
 */
export const GA_SCRIPT_HOST = 'www.googletagmanager.com';
export const GA_CONNECT_HOSTS = ['www.google-analytics.com', 'analytics.google.com'];

/** `default-src 'self'; script-src 'self' https://x` → `{ 'default-src': [...] }` */
export function parseCsp(value) {
  const out = {};
  for (const part of String(value ?? '').split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    out[tokens[0].toLowerCase()] = tokens.slice(1);
  }
  return out;
}

/**
 * Does a CSP source list permit this host?
 *
 * `undefined` means the directive is absent *and* has no fallback, i.e. the
 * policy does not restrict this kind of request at all — permitted.
 */
export function sourceListAllows(list, host) {
  if (!list) return true;
  return list.some((raw) => {
    const src = String(raw).replace(/^'|'$/g, '').toLowerCase();
    if (src === '*' || src === 'https:' || src === 'https://*') return true;
    const bare = src.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
    if (bare === host) return true;
    if (bare.startsWith('*.')) return host.endsWith(bare.slice(1));
    return false;
  });
}

/**
 * Whether a Content-Security-Policy would let GA4 run.
 *
 * This is the first of the two root causes specs/analytics tells the
 * verification to rule out, and it fits the historical symptom exactly: a CSP
 * that omits these origins leaves the tag rendering perfectly in the HTML — so
 * every presence check passes — while the browser silently refuses to execute
 * it. Zero events, no error, indefinitely.
 *
 * @returns {{ ok: boolean, script: boolean, connect: boolean }}
 */
export function cspAllowsGa(value) {
  const d = parseCsp(value);
  const script = d['script-src-elem'] ?? d['script-src'] ?? d['default-src'];
  const connect = d['connect-src'] ?? d['default-src'];
  const scriptOk = sourceListAllows(script, GA_SCRIPT_HOST);
  const connectOk = GA_CONNECT_HOSTS.every((h) => sourceListAllows(connect, h));
  return { ok: scriptOk && connectOk, script: scriptOk, connect: connectOk };
}

/** The pathname a hit reports, preferring the explicit `dp` override. */
export function hitPath(hit) {
  if (hit.dp) return hit.dp.split('?')[0];
  if (!hit.dl) return null;
  try {
    return new URL(hit.dl).pathname;
  } catch {
    return null;
  }
}
