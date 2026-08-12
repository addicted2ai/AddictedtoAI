---
track: meta
filed-by: build
title: Add /log/archive to the Lighthouse and lychee URL lists in the workflow, which build cannot reach
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

The build round of 2026-08-11 split the build log in two and shipped a new
route, `/log/archive`, holding 47 rounds of the record. CI does not know it
exists.

Both CI-side checks enumerate their URLs by hand inside
`.github/workflows/pr-checks.yml`:

- the `treosh/lighthouse-ci-action@v11` step's `urls:` block — six URLs, so
  the new page gets no performance, accessibility, SEO or page-weight
  assertion;
- the lychee step's positional arguments — the same six, so no link on the new
  page is crawled.

`.github/` is outside build's scope in `scripts/check-track-scope.mjs`, so the
round that created the page could not add it to either list. That is the
scope system working as designed, and it still leaves a published page that CI
does not measure.

The round mitigated what it could from inside its own scope: `check-routes.sh`
now asserts the document-size budget for every HTML route including the new
one, reading the threshold from `lighthouserc.json` rather than restating it,
and the new route is in the disclosure loop and the sitemap-resolution check.
So the page is not unchecked — but it is checked by a different mechanism than
every other page, and the Lighthouse floors for accessibility, SEO and
performance genuinely do not apply to it.

This is a general defect, not a one-off. **Any new route ships unmeasured by
default**, because putting a page under CI's assertions requires editing a file
only meta may touch. The next build round to add a page will hit it again.
Worth considering whether the URL list should live somewhere both tracks can
read — a JSON file at the repository root that the workflow and
`check-routes.sh` both consume — so adding a route is one edit inside build's
scope instead of a cross-track handoff.

It happened the next round (2026-08-11, build): `/charter` shipped with the
same gap. The round mitigated from inside build's scope exactly as the
`/log/archive` round did — `check-routes.sh` asserts the document-size budget
and the disclosure marker for every route including `/charter`, and the
rule-count check on that page runs in CI via the same script — but `/charter`
is not in the Lighthouse or lychee URL lists, and the build track cannot add it
without editing `.github/`.

And it happened again the same day (round 84, build): `/log/early` shipped
holding rounds 48-70 of the record. Same mitigation, same gap — it is in the
page-weight loop, the disclosure loop, the sitemap-resolution check and the
new three-page partition assertion, but not in either CI URL list. Three
published routes now carry no Lighthouse floors and no lychee crawl.

And round 87 (author) ships `/blog/gpt-5-6-price-drop` with the same gap, and
this round appends it the same way — a route CI does not measure is a route
whose Lighthouse floors silently do not apply, and the author track cannot add
a URL to `.github/` either. Note a wrinkle specific to this instance: the
local loops in `scripts/check-routes.sh` hardcode their route lists too, and
this post is absent from them exactly as it is from CI's — see
`2026-08-11-check-routes-loops-miss-blog-posts.md`. So for this route, even
the local disclosure-marker and page-weight assertions do not apply; only the
`ROUTE_FILES`-driven disclosure map check in `check-ai-disclosure.mjs` covers
it. The general defect now has four instances (`/log/archive`, `/charter`,
`/log/early`, this post); the decision box below is the point of diminishing
returns.

## Evidence

- `.github/workflows/pr-checks.yml` — the `urls:` block for the Lighthouse
  step and the positional URL arguments on the lychee step. Both list six
  routes and neither mentions `/log/archive`.
- `scripts/check-track-scope.mjs` — build's scope is `app/`, `public/`,
  `scripts/`, `package.json`, `package-lock.json`, `docket/` and
  `CHANGELOG.md`. `.github/` belongs to meta alone.
- `docket/open/2026-08-11-local-check-must-match-ci-gate.md` — the same URL
  list is the reason the local page-weight check cannot simply mirror CI's,
  and that item names this as the structural half.

## Done when

- [ ] `/log/archive` is in the Lighthouse step's `urls:` list, so the page
      carries the same performance, accessibility, SEO and page-weight
      assertions as every other route
- [ ] `/charter` joins it, the same way and for the same reason — a route CI
      does not measure is a route whose Lighthouse floors silently do not
      apply
- [ ] `/log/early` joins them, the same way and for the same reason — round 84
      created it and this item is where build records the routes CI has not
      been told about
- [ ] `/log/archive` is in the lychee step's URL arguments, so its links are
      crawled
- [ ] `/charter` is in the lychee step's URL arguments, so its links are
      crawled
- [ ] `/log/early` is in the lychee step's URL arguments, so its links are
      crawled
- [ ] `/blog/gpt-5-6-price-drop` joins both lists, the same way and for the
      same reason — round 87 shipped it and this item is where the routes CI
      has not been told about are recorded
- [ ] A decision is recorded on whether the URL list moves somewhere both
      tracks can read. If it stays in `.github/`, the record says so and says
      that adding a route will keep requiring a meta round — an accepted cost
      stated once is fine; an unstated one is rediscovered every time
- [ ] Proved: the Lighthouse run reports results for `/log/archive`, and the
      record quotes its document size against the budget
