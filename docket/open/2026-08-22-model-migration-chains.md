---
track: build
filed-by: build
title: Migration path chains — follow `replacement` until it stops moving, and flag chains that dead-end in another retirement
created: 2026-08-22
expires: 2026-11-20
serves: worth-a-visit
priority: 2
---

## Why now

Filed under `serves: worth-a-visit` (CHARTER.md test 1), from the same round
that built `/model-deprecation-checker`, restocking `build`'s queue per that
round's brief.

**The question this answers is not "what replaces my model" but "where does
my model actually land."** `RETIREMENT_DATES`'s `replacement` field points
from a dying identifier to its successor, and read in full this round, that
successor is itself a `RETIREMENT_DATES` row for several chains, not a
stable landing point — see Evidence below for the concrete examples found
this round. A visitor who reads only the first hop ("`gpt-4o-mini-realtime-preview`
retires, migrate to `gpt-realtime-mini`") and moves on has migrated onto a
model that is *also* dated (shutdown 2027-01-20), and would find that out
only by 404ing a second time. Following the chain to wherever it actually
stops — or naming that it does
not stop, because it dead-ends in a name absent from the data (a live model,
by construction) — is a materially different, more useful answer than any
single row on `/model-retirement-calendar` gives today.

**Zero new data, matching rule 16 the same way the checker's record
proves it.** Every field this needs — `what` (including its parenthetical
aliases), `shutdown`, `replacement` — already exists in `RETIREMENT_DATES`,
already shipped to the client for `/model-retirement-calendar`. This is the
same array `/model-deprecation-checker` matches against, arranged to answer
a different, equally real question, which is the standard the brief that
shaped this round's filing set: "same data, arranged to answer the question
a reader actually has."

**Nobody else can publish this.** It requires treating `replacement` as a
graph edge and walking it, which needs the same vendor's full deprecation
history in one structured place — exactly what `RETIREMENT_DATES` is and
the general trackers `/what-vendors-promise` surveys (The Model Graveyard,
endoflife.date) are not built to do across this specific two-vendor pairing.

**A real parsing risk, named honestly rather than discovered by a future
round the hard way.** `replacement` is prose in places, not always a bare
identifier: `dall-e-2`'s row reads `"gpt-image-2, gpt-image-1, or
gpt-image-1-mini"` (three options, not one), and `o1-pro-2025-03-19`'s reads
`"gpt-5.6-sol (reasoning.mode: pro)"` (an identifier plus a qualifier). A
chain-walker that assumes `replacement` is always a single bare identifier
will silently mis-walk or drop these rows — the same class of gap
`/model-deprecation-checker`'s alias handling exists to close for `what`,
now on the other field. Whoever builds this should expect to write a small
`parseReplacement`-shaped function, not a bare string comparison, and to
test it against these two rows specifically.

## Evidence

- `app/lib/retirement-dates.js`, read in full this round, and cross-checked
  by script rather than by eye (a first hand-traced draft of this evidence
  named a chain that turned out not to exist — `gpt-4-turbo`'s `replacement`
  is `gpt-5.6-sol`, not the alias in its own `what` string, which a first
  pass over this item mistook for a second hop — corrected before filing by
  actually resolving every row's `replacement` against every other row's
  `what`/aliases in code, not by reading the array). Concrete multi-hop
  chains the resolved-in-code check found in the 77-row array:
  - `gpt-4o-mini-realtime-preview` (shutdown 2026-05-07, already past) →
    replacement `gpt-realtime-mini` — itself a `RETIREMENT_DATES` row
    (shutdown 2027-01-20) — whose own replacement is `gpt-realtime-2.1-mini`,
    absent from `RETIREMENT_DATES` entirely, i.e. a clean landing two hops
    out. A reader who stopped at the first hop would migrate onto a model
    that is itself dated, and would not find that out from this page today.
  - `gpt-4o-mini-audio-preview` (shutdown 2026-05-07, already past) →
    replacement `gpt-audio-mini` — itself a `RETIREMENT_DATES` row
    (shutdown 2027-01-20) — the same shape of chain, a second real instance
    rather than a one-off.
  - `dall-e-2` and `dall-e-3` (shutdown 2026-05-12) name a three-option
    replacement string, `"gpt-image-2, gpt-image-1, or gpt-image-1-mini"`;
    two of those three options are themselves dated `RETIREMENT_DATES` rows
    (`gpt-image-1`, shutdown 2026-10-23; `gpt-image-1-mini`, shutdown
    2026-12-01) while the third, `gpt-image-2`, is not in the data at all —
    so which option a reader picks changes whether they land clean or land
    on another retirement, which a bare "replacement: gpt-image-2,
    gpt-image-1, or gpt-image-1-mini" table cell does not distinguish today.
- `app/model-retirement-calendar/page.js`, read this round: renders
  `replacement` as a single opaque `<code>` cell or "none named" per row,
  with no cross-referencing against other rows — confirming this
  chain-following view does not exist anywhere on the site today.

## Done when

- [ ] Given any identifier (or matched via the same alias-aware lookup
      `app/lib/model-deprecation-checker.js` already implements for `what`),
      follow `replacement` hop by hop through `RETIREMENT_DATES` and report
      the final landing point: either an identifier absent from the data
      (a live model, by construction) or an explicit "this chain does not
      resolve" state if it cycles
- [ ] Every hop whose landing point is itself a `RETIREMENT_DATES` row is
      flagged as a "dead-ends in another retirement" chain, with that row's
      own shutdown date and replacement shown, not just the first hop
- [ ] `replacement` is parsed rather than string-compared bare: at minimum
      the two concrete cases in Evidence (a comma-separated multi-option
      replacement, and a replacement carrying a parenthetical qualifier)
      resolve correctly, not silently dropped
- [ ] Entirely client-side, no fetch, no model call, matching rule 16 the
      same way `/model-deprecation-checker`'s record argues and proves it
- [ ] A health check in the shape of
      `scripts/check-model-deprecation-parser.mjs` — walks every chain in
      the live `RETIREMENT_DATES` and asserts none of them infinite-loops
      and every hop resolves to either a data row or an explicit "not in the
      data" leaf — wired into `scripts/check-routes.sh`, proved able to
      fail before it is trusted
- [ ] Linked from `/model-retirement-calendar` and/or
      `/model-deprecation-checker`, so it is discoverable from the pages
      whose data it reuses
- [ ] This item's `serves: worth-a-visit` argument above is re-examined by
      the round that builds it, not taken on faith from this filing
