/**
 * markdown.mjs — the one markdown pipeline, in the one order that works.
 *
 *   parse → gfm → transclude (mdast) → rehype → raw → slug → link → collect
 *
 * The order is load-bearing at three points:
 *
 *  - **Transclusion runs on mdast**, before HTML exists, so `code` and
 *    `inlineCode` nodes are skipped structurally rather than by pattern.
 *  - **`rehype-raw` runs after `remark-rehype`** so the HTML that transclusion
 *    injected is parsed into real elements. Without it the fact markup would
 *    be a raw string and the alias linker would walk straight past it.
 *  - **The alias linker runs after `rehype-raw`**, on a tree where the
 *    injected fact spans are real elements carrying `data-nolink` — which is
 *    how a transcluded value avoids being alias-linked inside its own markup.
 *
 * The currency-literal scan (task 2.10) deliberately does **not** run in this
 * pipeline: it reads the body *as the author wrote it*, before transclusion
 * replaces markers with values, so a correctly transcluded price can never be
 * warned about as if it were hard-coded.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

import { transclude } from './transclude.mjs';
import { linkAliases } from './linker.mjs';
import { collectLinks } from './linkcheck.mjs';

function remarkTransclude(ctx) {
  return (tree) => {
    ctx.used = transclude(tree, ctx);
  };
}

function rehypeCollect(sink, opts) {
  return (tree) => {
    sink.links = linkAliases(tree, opts.aliases ?? [], {
      selfId: opts.selfId,
      href: opts.href,
    });
    Object.assign(sink, collectLinks(tree));
  };
}

/**
 * Render one document's body to HTML.
 *
 * @param {string} body
 * @param {object} ctx  { file, byId, renderFact, diags, wants, aliases, selfId }
 * @returns {{ html: string, links: object[], hrefs: string[], srcs: string[],
 *             used: {facts: string[], wants: string[]} }}
 */
export function renderMarkdown(body, ctx) {
  const sink = { links: [], hrefs: [], srcs: [] };
  const transcludeCtx = { ...ctx };

  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkTransclude, transcludeCtx)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeCollect, sink, {
      aliases: ctx.aliases ?? [],
      selfId: ctx.selfId,
      href: ctx.href,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(body);

  return {
    html: String(file),
    links: sink.links,
    hrefs: sink.hrefs,
    srcs: sink.srcs,
    used: transcludeCtx.used ?? { facts: [], wants: [] },
  };
}

/** The hast tree, for tests that assert on structure rather than on strings. */
export function toHast(body) {
  const proc = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw);
  return proc.runSync(proc.parse(body));
}

export function hastToHtml(tree) {
  return unified().use(rehypeStringify, { allowDangerousHtml: true }).stringify(tree);
}
