/**
 * origins.mjs — the third-party origin allowlist (task 4.10, specs/site).
 *
 * *"Third-party requests from a visitor's browser SHALL be limited to an
 * explicit allowlist containing only Google Analytics ... The build SHALL fail
 * if a page's output references a network origin outside the allowlist."*
 *
 * **What counts as a reference, and what deliberately does not.** A link is
 * not a request: `<a href="https://arxiv.org/...">` costs the visitor nothing
 * until they choose to follow it, and every fact on this site is *required*
 * to link its source (specs/wiki). Failing the build on outbound links would
 * make the two rules contradict each other. What this checks is
 * **subresources** — the things a browser fetches without being asked:
 * `src`, `srcset`, `<link href>`, `poster`, `data`, `@import`, and
 * `url(...)` inside inline styles.
 *
 * Two entry points, because the rule has to hold in two places:
 *   - `checkDocOrigins` runs inside the content build over each rendered
 *     body, so a stray CDN script in prose fails `npm run build` at the
 *     prebuild step, naming the file and the origin.
 *   - `findHtmlOrigins` runs over the exported HTML in `out/`, which is the
 *     only place that sees the page chrome, the framework's own tags and
 *     anything a template added. Content passing is not the site passing.
 */

/** Google Analytics, and nothing else. specs/analytics names these origins. */
export const ALLOWED_ORIGINS = [
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
];

/** Attributes whose value the browser fetches on its own. */
const SUBRESOURCE_ATTRS = ['src', 'srcset', 'poster', 'data', 'formaction'];

/**
 * `<link href>` is a subresource; `<a href>` is not. Anything else with an
 * `href` (`<base>`, `<area>`) is treated as navigation, i.e. not fetched.
 */
const HREF_IS_SUBRESOURCE = new Set(['link']);

const ABSOLUTE_URL = /^(?:https?:)?\/\/([^/?#\s"')]+)/i;

/** The host of an absolute URL, or null for anything root-relative or inert. */
export function originOf(value) {
  const m = ABSOLUTE_URL.exec(String(value ?? '').trim());
  return m ? m[1].toLowerCase().replace(/:\d+$/, '') : null;
}

export function isAllowedOrigin(host, siteHosts = []) {
  if (!host) return true;
  const h = host.toLowerCase();
  return ALLOWED_ORIGINS.includes(h) || siteHosts.map((s) => s.toLowerCase()).includes(h);
}

/** Every origin a value references — `srcset` carries several. */
function originsIn(value) {
  return String(value ?? '')
    .split(',')
    .map((part) => originOf(part.trim().split(/\s+/)[0]))
    .filter(Boolean);
}

function cssUrlOrigins(style) {
  const out = [];
  for (const m of String(style ?? '').matchAll(/url\(\s*['"]?([^'")]+)/gi)) {
    const o = originOf(m[1]);
    if (o) out.push(o);
  }
  for (const m of String(style ?? '').matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)/gi)) {
    const o = originOf(m[1]);
    if (o) out.push(o);
  }
  return out;
}

/**
 * Walk a rendered hast tree for subresource origins.
 * @returns {{origin: string, where: string}[]}
 */
export function findTreeOrigins(tree) {
  const found = [];
  const walk = (node) => {
    if (node.type === 'element') {
      const p = node.properties ?? {};
      for (const attr of SUBRESOURCE_ATTRS) {
        for (const o of originsIn(p[attr])) found.push({ origin: o, where: `<${node.tagName} ${attr}>` });
      }
      if (HREF_IS_SUBRESOURCE.has(node.tagName)) {
        for (const o of originsIn(p.href)) found.push({ origin: o, where: `<${node.tagName} href>` });
      }
      for (const o of cssUrlOrigins(p.style)) found.push({ origin: o, where: `<${node.tagName} style>` });
      if (node.tagName === 'style') {
        const text = (node.children ?? []).map((c) => c.value ?? '').join('');
        for (const o of cssUrlOrigins(text)) found.push({ origin: o, where: '<style>' });
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
  return found;
}

/**
 * The same rule applied to a string of HTML — used on the exported pages in
 * `out/`, where there is no hast tree to walk. Regex over markup is normally
 * a mistake; here the input is machine-generated HTML from our own build and
 * the failure mode is a false positive, which is a loud, correctable stop.
 */
export function findHtmlOrigins(html) {
  const found = [];
  const push = (origin, where) => {
    if (origin) found.push({ origin, where });
  };
  for (const m of String(html).matchAll(/<(\w+)\b([^>]*)>/g)) {
    const [, tag, attrs] = m;
    const name = tag.toLowerCase();
    for (const attr of SUBRESOURCE_ATTRS) {
      const a = new RegExp(`\\b${attr}\\s*=\\s*"([^"]*)"`, 'i').exec(attrs);
      if (a) for (const o of originsIn(a[1])) push(o, `<${name} ${attr}>`);
    }
    if (HREF_IS_SUBRESOURCE.has(name)) {
      const a = /\bhref\s*=\s*"([^"]*)"/i.exec(attrs);
      if (a) for (const o of originsIn(a[1])) push(o, `<${name} href>`);
    }
    const s = /\bstyle\s*=\s*"([^"]*)"/i.exec(attrs);
    if (s) for (const o of cssUrlOrigins(s[1])) push(o, `<${name} style>`);
  }
  for (const m of String(html).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const o of cssUrlOrigins(m[1])) push(o, '<style>');
  }
  return found;
}

/**
 * Report every disallowed origin in one document's rendered body.
 *
 * Two inputs, because neither alone is complete: `doc.srcs` is what the
 * link collector pulled off the hast tree (task 2.9), and `doc.html` is the
 * serialised output, which still carries tags the markdown pipeline may have
 * passed through as raw HTML rather than as elements — `<script>` among them.
 * A check that saw only the tree could be walked past by a tag the tree does
 * not model.
 */
export function checkDocOrigins(doc, diags, siteHosts = []) {
  const found = [];
  for (const src of doc.srcs ?? []) {
    for (const o of originsIn(src)) found.push({ origin: o, where: `src ${JSON.stringify(src)}` });
  }
  found.push(...findHtmlOrigins(doc.html ?? ''));

  const seen = new Set();
  for (const { origin, where } of found) {
    if (isAllowedOrigin(origin, siteHosts) || seen.has(origin)) continue;
    seen.add(origin);
    diags.error({
      file: doc.file,
      field: where,
      message:
        `references the third-party origin "${origin}" — a visitor's browser may fetch only from this site ` +
        `and Google Analytics (${ALLOWED_ORIGINS.join(', ')}). Remove it or inline the asset.`,
      rule: 'third-party-origin',
    });
  }
}

/**
 * Scan exported pages. `pages` is `[{ path, html }]`.
 * @returns {{page: string, origin: string, where: string}[]}
 */
export function scanExportedPages(pages, siteHosts = []) {
  const violations = [];
  for (const { path, html } of pages) {
    const seen = new Set();
    for (const { origin, where } of findHtmlOrigins(html)) {
      if (isAllowedOrigin(origin, siteHosts) || seen.has(origin)) continue;
      seen.add(origin);
      violations.push({ page: path, origin, where });
    }
  }
  return violations;
}
