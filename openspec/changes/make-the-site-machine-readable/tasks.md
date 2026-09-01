# Tasks: make-the-site-machine-readable

Every task below is complete. Each names the normative sentence it implements
and the check that measures it, because a requirement nothing builds and
nothing measures is invisible twice over.

## 1. Structured data

- [x] 1.1 `lib/jsonld.mjs`: the graph builders, with `compact()` dropping every
      unsourced property on the way out. *(site: "a property that cannot be
      sourced SHALL be omitted")* — `lib/jsonld.test.mjs`, the omission cases.
- [x] 1.2 `DefinedTerm` for `concept` and `technique` entries; `DefinedTermSet`
      for `/wiki`; `Article` for posts and deltas; `SoftwareApplication` for
      tool listings; `Dataset` for `/data`. — `verify-surfaces`, the coverage
      assertion (32 / 1 / 32 / 35 / 1 in the export).
- [x] 1.3 `dateModified` passed in from the shared sitemap resolution, exposed
      once on the site model. *(site: "the same value the sitemap publishes …
      resolved by the same shared code")* — `verify-surfaces`, the
      graph-vs-`<lastmod>` assertion.
- [x] 1.4 No graph on a `noindex` page, read from the same value the page's own
      robots directive reads. *(site: "SHALL NOT be emitted on a page the site
      marks noindex")* — `verify-surfaces`, the contradiction assertion.
- [x] 1.5 Descriptions are quotations: the page's first paragraph, or the
      front-matter sentence written to be one. *(site: "SHALL be text the page
      itself contains")* — `verify-surfaces`, with `<script>` stripped from the
      page text first, without which the check is vacuous.
- [x] 1.6 `app/_components/JsonLd.tsx`, a server component so structured data
      costs the first-load JS budget nothing.
- [x] 1.7 Mutation-tested: five breakages in the export, each failing the right
      check alone, each restored byte-identical.

## 2. IndexNow

- [x] 2.1 `pulse/lib/indexnow.mjs`: `changedUrls()` reads the built
      `sitemap.xml`. *(site: "derived from the site's own published freshness
      signal, so that a page the sitemap omits can never be submitted")* —
      `pulse/tests/indexnow.test.mjs`, including the no-`lastmod` case.
- [x] 2.2 `armed()`, five guards, each tested alone with the other four
      satisfied. *(site: "gated on the same publish flag that gates
      deployment")*
- [x] 2.3 The self-generated key, written into the export on every build and
      served as its own bytes and nothing else. — `verify-surfaces`, asserted
      on the exported file; mutation-tested with a trailing newline.
- [x] 2.4 One call site, inside the deploy-confirmed branch of the publish
      step. *(site: "SHALL run only after the deploy is confirmed live")* —
      `pulse/tests/indexnow.test.mjs`, structurally.
- [x] 2.5 A failure is reported and nothing else: no halt, no throw, no change
      to the publish result. *(site: "SHALL NOT be treated as a failure of the
      deploy")* — the non-200 and thrown-request cases.
- [x] 2.6 Google's non-participation stated in the module, where the assumption
      is made.
- [x] 2.7 Proved inert under test conditions by running a real publish with a
      real push and a confirmed deploy, `fetch` instrumented: zero requests.
      Then proved reachable by changing only the site URL.

## 3. The crawler stance and llms.txt

- [x] 3.1 `lib/crawlers.mjs` renders `robots.txt` as text, with its reasoning
      as comments. *(site: "SHALL carry, in the served file, the reasoning for
      that position")* — `lib/crawlers.test.mjs` and `verify-surfaces`.
- [x] 3.2 The four AI crawlers named one rule each, with a note saying what
      each token governs. — both files.
- [x] 3.3 No `Disallow`, anywhere. *(site: "disallowing a crawler prevents it
      … reading that directive")* — asserted in both, mutation-tested.
- [x] 3.4 Reversal is one word in declared data. — `lib/crawlers.test.mjs`.
- [x] 3.5 `app/robots.ts` deleted; the route served from `public/` and declared
      in the asset-route list so the internal link check still sees it.
- [x] 3.6 `llms.txt`: the structured layer and its licence first, then the
      pages, then the live tables and feeds, then how to cite. Counts passed in
      from the dataset payload, never recounted; an unknown count renders as
      nothing rather than as zero; no date, so a rebuild with no world change
      produces identical bytes. — `lib/crawlers.test.mjs`; `verify-surfaces`
      resolves all 27 advertised URLs against the export and compares the
      counts to the dataset.

## 4. The published contract

- [x] 4.1 `schema_version` and `contract` on the three standing tables and the
      dataset, with independent version numbers. *(directory: "Payloads
      describing different shapes SHALL carry independent version numbers")*
- [x] 4.2 The written statement on `/data#contract`: what is stable, what is
      not, and what a version change means. *(directory: "SHALL say what is
      stable and what is not, in that order")* — `verify-surfaces` asserts the
      anchor resolves and that both halves are present.
- [x] 4.3 CORS derived from the set of assets the build writes. *(directory:
      "SHALL be derived from the set of assets the build writes, never
      maintained by hand")* — `lib/redirects.test.mjs` adds a route and
      measures that the block grows.
- [x] 4.4 The CORS check states what it does not claim: the declaration, not
      the served header, because no exported byte records a response header.
- [x] 4.5 Mutation-tested: five breakages, each failing the right check.

## 5. Deferred, filed rather than buried

- [x] 5.1 The index-route date computation lives inline in `app/sitemap.ts` and
      is pinned there by source-text assertions, so the two index-level graphs
      carry no `dateModified`. Filed as **`addictedtoai-nq36`** — its own issue
      with its own id, not a commit message, not a close reason, not a comment.
- [x] 5.2 A change deployed after local midnight carries yesterday's date and
      is never announced. Filed as **`addictedtoai-en3s`**, which also records
      the shape of the real fix. The failure degrades to the status quo and
      never produces a false claim, which is why the simple rule was kept.
