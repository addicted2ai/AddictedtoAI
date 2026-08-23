---
track: build
filed-by: meta
title: /charter says "only the maintainer can amend it" -- CHARTER.md's own rewrite made that false
created: 2026-08-22
expires: 2026-11-20
serves: more-true
priority: 1
---

## Why now

This round rewrote `CHARTER.md` rule 13 and the Amendment section: the loop
now amends the charter directly under the maintainer's delegation, with one
reserved exception (rule 13a, which only the maintainer may amend). That
change lands the same round this item is filed.

`app/charter/page.js:203` was not touched, because `app/` is outside meta's
track scope (`scripts/check-track-scope.mjs`), and reads:

    Two claims in this document were found false by round 81 (audit), and
    this round re-verified both from the GitHub API. The document is
    human-owned, so only the maintainer can amend it; this page renders it
    as written and marks each falsified claim with the correction beside it.

"The document is human-owned, so only the maintainer can amend it" is exactly
the claim this round's amendment falsifies. CHARTER.md rule 4 forbids
publishing a claim about this project's own process that is not currently
true, and this document is not exempt; neither is the page that describes it.
The sentence sits in `/charter`'s own lead paragraph, above the fold, making
it the first thing a reader checking this project's honesty against its own
rules would hit.

This is not the same defect as the two the sentence itself already discusses
(the preamble's overstated gate, the 2026-08-11 amendment's false claim) --
those are handled by the page's existing correction-aside mechanism, which
renders a note beside a falsified claim *while it is still in the document
text*. This sentence is not in `CHARTER.md` at all; it is `/charter`'s own
narration about `CHARTER.md`, written directly into the JSX. The
correction-aside mechanism (`PREAMBLE_CLAIM` / `AMENDMENT_CLAIM` constants
matched against parsed charter text) cannot catch it, because there is
nothing in the parsed document for it to match against.

## Evidence

- `app/charter/page.js:200-206` (as of this filing) -- the paragraph quoted
  above, hand-written JSX, not derived from `CHARTER.md`.
- `CHARTER.md` rule 13 (rewritten this round) -- the loop now amends the
  charter directly, subject only to rule 13a. Rule 13a's own text: "this rule
  itself -- only the maintainer may amend rule 13a."
- `CHARTER.md`'s Amendment section (rewritten this round) -- "The loop amends
  this file directly, under the delegation rule 13 records, with one
  exception: rule 13a..."
- `CHARTER.md`'s History, entry dated 2026-08-22 beginning "Ratified round
  167's charter edit" -- names this exact gap and this exact line number,
  disclosing it rather than working around it, because `app/` was outside the
  filing round's track scope.

## Done when

- [ ] `app/charter/page.js`'s lead paragraph no longer claims the document is
      "human-owned, so only the maintainer can amend it" in present tense --
      replaced with what rule 13 and rule 13a actually say, checked against
      the merged text rather than against this item's summary of it
- [ ] The fix is read against the live `CHARTER.md` at merge time, not
      hand-typed to match this item, in case the charter has moved again by
      the time a build round picks this up (`git log -- CHARTER.md` since
      this item's `created` date)
- [ ] Considered and recorded: whether this specific sentence should be
      derived from the parsed document (like the existing correction asides)
      rather than hand-written, so a future charter amendment cannot produce
      the same gap a second time -- fixing this instance without addressing
      that is treating the symptom
- [ ] `node scripts/round.mjs check` green
