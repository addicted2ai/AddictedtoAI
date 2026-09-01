import { serializeJsonLd } from '../../lib/jsonld.mjs';

/**
 * One `<script type="application/ld+json">`, rendered from a graph object
 * (beads `addictedtoai-k1j`).
 *
 * **A server component, and that is load-bearing.** There is no `'use client'`
 * here and there must never be one: specs/site caps first-load JavaScript at
 * 150 KB gzipped and `scripts/measure-payload.mjs` records the measurement, so
 * structured data — which no browser ever executes — must cost the bundle
 * nothing at all. It renders to markup at build time and stops there.
 *
 * A graph that is `undefined` renders nothing. That is the shape every builder
 * in `lib/jsonld.mjs` returns for a page it cannot honestly describe (a wiki
 * kind that is not a defined term, a listing with no doc), so "no graph" needs
 * no branch at the call site.
 *
 * `serializeJsonLd` escapes `<`, `>`, `&` and the two line separators, so no
 * value inside a graph can close this element or be reinterpreted by the HTML
 * parser. Serialising with a bare `JSON.stringify` here would put that
 * guarantee in the caller's hands, once per page type.
 */
export default function JsonLd({ graph }: { graph?: unknown }) {
  if (!graph) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
    />
  );
}
