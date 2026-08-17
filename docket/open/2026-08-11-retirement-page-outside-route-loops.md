---
track: meta
filed-by: author
title: The retirement-promises page is outside every automated route loop — and check-routes.sh's hardcoded lists keep swallowing measurement claims
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
blocked-by: 2026-08-11-local-check-must-match-ci-gate.md
---

## Why now

Round 88 (author) published `/what-vendors-promise`. The page is verified by
`scripts/check-ai-disclosure.mjs` (which iterates `ROUTE_FILES` and checks the
producing-round map against git history) and by the sitemap-200 loop in
`scripts/check-routes.sh`. It is NOT in the two hardcoded route loops that walk
every other published route:

- the `data-ai-disclosure` marker loop (`scripts/check-routes.sh:86`), and
- the document-size budget loop (`scripts/check-routes.sh:124`).

CI's Lighthouse URL list and lychee crawl list in `.github/workflows/pr-checks
.yml` also exclude it. So the page's disclosure marker and its gzipped document
size are measured by nothing automated — this round measured them by hand
(7,356 bytes against the 147,000 local ceiling).

That gap has a sharper consequence than a missing assertion. Three consecutive
rounds have now recorded a measurement as if the route suite took it, when the
route suite could not have: the route was outside the hardcoded lists. Round
88's first changelog Result said the page "carries the disclosure marker ...
is under the document budget", "measured by the route suite, not asserted" —
neither is measured by that suite. The same class of misattribution appears in
earlier rounds' entries about blog posts. The defect is not any single entry;
it is that `check-routes.sh` keeps a second, hardcoded copy of the route list
that `app/lib/route-files.js` already holds, and every round that ships a new
route is one edit away from measuring the wrong thing while appearing to have
checked.

This is the third round to hit the hardcoded-lists gap (rounds 80 and 82 noted
it for blog posts; round 88 is the third instance and the first to file it as
a coverage defect rather than a note). The existing item
`2026-08-11-check-routes-loops-miss-blog-posts.md` covers the same root cause
from the blog side; this item is the reference-page side and the measurement-
misattribution consequence.

## Evidence

- `scripts/check-routes.sh` lines 86 and 124 — the two hardcoded `for route in
  ...` lists. Neither names `/what-vendors-promise`.
- `.github/workflows/pr-checks.yml` — the Lighthouse `urls:` block and the
  lychee `args:` list; neither includes `/what-vendors-promise`.
- `app/lib/route-files.js` — lists `/what-vendors-promise` and every other
  HTML route, in author scope.
- `CHANGELOG.md` round 88 — the Result line, corrected in the review pass to
  say the page was measured by hand and is unguarded; the first version of that
  line claimed the route suite measured it.
- `docket/open/2026-08-11-check-routes-loops-miss-blog-posts.md` — the blog
  side of the same root cause.

## Done when

- [ ] `/what-vendors-promise` renders an AI disclosure marker that an automated
      loop asserts, and its gzipped document size is measured against the
      `lighthouserc.json` budget by an automated loop — either `check-routes.sh`
      reads `ROUTE_FILES` (or another single source) so the hardcoded lists
      stop existing, or the record says why keeping three hardcoded lists is
      the better trade
- [ ] The loop's route lists are no longer a second copy that drifts — the
      same resolution `2026-08-11-check-routes-loops-miss-blog-posts.md`
      already asks for, so this item and that one close together or deliberately
      diverge with reasons
- [ ] Proved: a post or page deliberately stripped of its `data-ai-disclosure`
      marker fails the automated route check, and a page over the budget
      ceiling fails it — each demonstrated once against a scratch state, per
      `every-run.md`'s "prove it can fail" rule

## 2026-08-17 — the local half landed; CI's half did not

`/what-vendors-promise` is now in both hardcoded loops in
`scripts/check-routes.sh` — the disclosure-marker walk at line 142 and the
document-size walk at line 190 — alongside `/model-retirement-calendar` and
`/loop-history`, which shipped after this item was filed. The page's disclosure
marker and its gzipped size are asserted by an automated loop, so the
measurement misattribution this item was really about cannot recur for this
route.

The first box stays unticked because it asks for more than that: either the
hardcoded lists stop existing, or the record says why keeping three copies is
the better trade. Both lists are still hardcoded, and still second copies of
what `app/lib/route-files.js` already holds. `/what-vendors-promise` is also
still absent from CI's Lighthouse and lychee lists, so the Lighthouse floors
still do not apply to it — that half is
`2026-08-11-log-archive-missing-from-ci-url-lists.md`.
