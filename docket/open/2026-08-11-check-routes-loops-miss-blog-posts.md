---
track: meta
filed-by: author
title: check-routes.sh hardcodes its disclosure and page-weight route lists, so blog posts ship outside both loops
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 2
blocked-by: 2026-08-11-local-check-must-match-ci-gate.md
---

## Why now

`scripts/check-routes.sh` walks its route lists twice: the AI-disclosure loop
(around line 86) and the document-size budget loop (around line 124). Both are
hardcoded to the same eleven routes:

```
/ /blog /blog/frontier-cyber /directory /demos /log /log/early /log/archive /projects /disclosure /charter
```

Four published blog posts are absent from both: `/blog/claude-code-auto-mode`
(round 80), `/blog/cyber-eval-cascade` (round 82), and now
`/blog/gpt-5-6-price-drop` (round 86). Rounds 80 and 82 both hit this,
recorded in each round's entry as a residual gap "left for a later round or
the maintainer". Round 86 is the third instance, and it is the round that
files the item rather than noting it again.

The practical gap: a blog post carries no AI disclosure marker and no document
size can grow without the local gate noticing, because the post is in neither
loop. The disclosure *map* is still verified — `scripts/check-ai-disclosure.mjs`
iterates `ROUTE_FILES` and does check every route's disclosure and producing
round, and `check-routes.sh` calls it (line 93). So the missing pieces are the
hardcoded rendered-page walks: `data-ai-disclosure` presence on the post's
HTML, and its gzipped byte size against the 147,000-byte local ceiling. Both
are checks every other published route gets and posts silently do not.

Why it keeps happening: the lists live in `scripts/`, outside author scope
(author owns `app/`, `public/`, `docket/`, `CHANGELOG.md`), so the round that
creates a post cannot add it to the list, exactly as with the Lighthouse and
lychee URL lists in `.github/workflows/pr-checks.yml`. That structural half is
already argued in `2026-08-11-log-archive-missing-from-ci-url-lists.md` and
`2026-08-11-local-check-must-match-ci-gate.md`; this item is the local-loop
half, which neither covers.

The fix that would make all three items close: derive the route lists from one
source both tracks can read — `ROUTE_FILES` in `app/lib/route-files.js` is the
natural home, since it already lists every HTML route and lives in a path the
publishing tracks own. `check-routes.sh` walking `ROUTE_FILES` would put new
posts under the disclosure and budget loops the moment they register, with no
cross-track handoff. That decision belongs to the meta round that executes
this item (or to the maintainer); it is the same question the CI-list items
leave open.

## Evidence

- `scripts/check-routes.sh` lines 86 and 124 — the two hardcoded `for route
  in ...` lists. Neither mentions any `/blog/<slug>` route other than
  `/blog/frontier-cyber`.
- `app/lib/route-files.js` — lists `/blog/claude-code-auto-mode`,
  `/blog/cyber-eval-cascade`, and `/blog/gpt-5-6-price-drop`, so the routes
  exist in a machine-readable map in author scope and the loops simply do not
  read it.
- `CHANGELOG.md`, round 80's entry — "`scripts/check-routes.sh` hardcodes the
  route lists for its disclosure-marker and document-budget loops, so the new
  route is in neither... left for a later round or the maintainer." Round 82's
  entry notes the same gap and leaves it. Both said "a later round" without
  filing the work; this item is the filing.
- `docket/open/2026-08-11-log-archive-missing-from-ci-url-lists.md` — the CI
  URL-list half of the same structural gap, already open.
- `docket/open/2026-08-11-local-check-must-match-ci-gate.md` — the principle:
  whatever CI gates on, `round.mjs check` runs first. A post that CI's
  Lighthouse list does not measure and the local loops do not walk is measured
  by nothing.

## Done when

- [ ] `/blog/claude-code-auto-mode`, `/blog/cyber-eval-cascade`, and
      `/blog/gpt-5-6-price-drop` each render an AI disclosure that the local
      loop asserts, and each is measured against the document-size budget the
      local loop reads from `lighthouserc.json`
- [ ] The route lists are no longer a second copy that drifts. Either
      `check-routes.sh` reads `ROUTE_FILES` (or another single source), or the
      record says explicitly why keeping three hardcoded lists is the better
      trade, and how a future round is expected to remember to update them
- [ ] Proved: a post deliberately stripped of its `data-ai-disclosure` marker
      fails the local route check, and a post over the budget ceiling fails
      it — each demonstrated once against a scratch state, per `every-run.md`'s
      "prove it can fail" rule
- [ ] Linked from `2026-08-11-log-archive-missing-from-ci-url-lists.md` and
      `2026-08-11-local-check-must-match-ci-gate.md` so the three items read
      as one decision about who owns the URL list
