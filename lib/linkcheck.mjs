/**
 * linkcheck.mjs — the internal-link check (task 2.9, specs/site).
 *
 * "No published URL SHALL ever 404 ... The build SHALL verify every internal
 * link resolves; a broken internal link fails the build."
 *
 * Links are read from the rendered hast tree rather than by regexing HTML, so
 * a link written as Markdown, as raw HTML, or produced by the alias linker is
 * all one code path.
 *
 * Root-relative only: a relative link (`./foo`, `../bar`, `notes.md`) is an
 * error even when it would happen to resolve, because under static export the
 * same relative link resolves differently depending on whether the current
 * URL ended in a slash. External origins are not this check's business —
 * the third-party origin allowlist is task 4.10.
 */

export function collectLinks(tree) {
  const hrefs = [];
  const srcs = [];
  const walk = (node) => {
    if (node.type === 'element') {
      const p = node.properties ?? {};
      if (node.tagName === 'a' && typeof p.href === 'string') hrefs.push(p.href);
      if (typeof p.src === 'string') srcs.push(p.src);
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
  return { hrefs, srcs };
}

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** Strip the query and fragment; normalize a trailing slash away. */
export function pathOf(href) {
  const noHash = href.split('#')[0];
  const noQuery = noHash.split('?')[0];
  if (noQuery === '') return null; // pure fragment or query: same page
  const trimmed = noQuery.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * @param {object} args
 * @param {string} args.file
 * @param {string[]} args.hrefs
 * @param {Set<string>} args.routes    every path the site will serve
 * @param {Set<string>} [args.redirectSources]
 * @param {import('./errors.mjs').Diagnostics} args.diags
 */
export function checkInternalLinks({ file, hrefs, routes, redirectSources, diags }) {
  const redirects = redirectSources ?? new Set();
  const reported = new Set();
  for (const href of hrefs) {
    if (href.startsWith('#')) continue;
    if (EXTERNAL.test(href)) continue;

    if (!href.startsWith('/')) {
      if (reported.has(href)) continue;
      reported.add(href);
      diags.error({
        file,
        field: `link ${JSON.stringify(href)}`,
        message: 'relative internal links are not allowed — write it root-relative, starting with "/"',
        rule: 'internal-link',
      });
      continue;
    }

    const path = pathOf(href);
    if (path === null) continue;
    if (routes.has(path) || redirects.has(path)) continue;
    if (reported.has(path)) continue;
    reported.add(path);
    diags.error({
      file,
      field: `link ${JSON.stringify(href)}`,
      message: `internal link points at "${path}", which no page, public file or redirect serves`,
      rule: 'internal-link',
    });
  }
}
