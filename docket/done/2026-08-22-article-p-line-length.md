---
track: build
filed-by: build
title: article p prose runs 100-103 characters per line, up to 122 -- no number prescribed here
created: 2026-08-22
expires: 2026-11-20
serves: more-checkable
priority: 3
---

## Why now

This round's design-rubric survey (`scratchpad/site-survey.md` §7.1-7.2, not
committed) measured this site's running prose exactly -- walking each
paragraph character by character and assigning characters to rendered
lines by their client rects, not estimating from an assumed average glyph
width -- and found `article p` running **100-103 characters per line at
the median, up to 122 at the max**, across the five long-form pages
measured (`/model-retirement-calendar`, `/what-vendors-promise`, `/blog`,
`/blog/chatgpt-ads`, `/model-deprecation-checker`), all at a 732px content
box.

That is inside the range of successful reference sites the survey
measured for comparison (median 91, range 64-119 across 15 sites: OpenAI's
API reference at 64, Wikipedia at 103, explainshell at 119), but above
WCAG's AAA guidance (SC 1.4.8, 80 characters) and above the design
rubric's own proposed 90-character cap on five of the nine pages compared.

**This item deliberately does not prescribe a fix width**, because the
survey found the rubric's own proposed numbers were measured wrong in two
different ways when actually rendered rather than estimated from CSS:

- The rubric's fix (§6 item 4) said capping `article p` at `68ch` "takes
  the site's longest-form reading from ~90 characters to ~68." Measured by
  injecting the candidate `max-width` into the live page and re-measuring:
  `68ch` renders as **81 characters**, not 68, and the *baseline* it
  claimed to be reducing from was already 100, not ~90. Both numbers in
  the rubric's own sentence were wrong. The reason: `1ch` is the width of
  the `0` glyph (8.625px in this font stack), about 18% wider than this
  font's mean character advance (7.32px) -- so `Nch` renders as roughly
  `1.18 x N` characters, not `N`.
- The rubric's A7 rule caps prose at `90ch`. Because `main { max-width:
  780px }` already caps the rendered content column at 732px = **84.9ch**,
  any `max-width` at or above ~85ch on `article p` is a no-op: it never
  binds, because the ancestor container is already narrower. `90ch`
  specifically would change nothing at all.

A future item that wants to narrow this column should measure the
candidate value the same way -- inject it into the live page and count
rendered characters -- rather than compute it from CSS, and should weigh
the cost the survey also measured: narrowing `/blog/chatgpt-ads` from 100
to 81 characters (`68ch`) made the page **13% longer** (2,740px ->
3,086px); narrowing further to `62ch` (73 characters) made it **24%
longer**. Wikimedia's own published reasoning for keeping its lines wider
than the "ideal" range (quoted in the survey, §5.3) is the tradeoff to
weigh against WCAG 1.4.8 and the rubric's stated preference, not a
settled answer either way.

## Evidence

- `app/globals.css` -- `main { max-width: 780px }`, the ancestor
  constraint that makes any `article p` cap at or above ~85ch a no-op.
- `scratchpad/site-survey.md` §7.1 (measured line lengths per page, method
  in §0) and §7.2 (the `max-width` experiment: `62ch` -> 73 chars/+24%
  length, `68ch` -> 81 chars/+13% length, `75ch` -> 89 chars/+7%, `80ch`
  -> 96 chars/+2%, `90ch` -> no change). Working notes, not committed --
  see this round's changelog entry for the citation.
- Corpus comparison, same survey, §6.4: median 91 cpl across 15 successful
  reference sites, range 64-119; this site's 100-103 sits above the
  median, below the range's own maximum.

## Done when

- [x] A specific `max-width` (or other reflow strategy) for `article p` is
      chosen and justified against a rendered, not estimated, character
      count -- following the method in `scratchpad/site-survey.md` §0 and
      §7.2, or an equivalent live measurement
- [x] The chosen value's page-length cost is measured and stated, not
      assumed away, the same way the survey measured it for four candidate
      widths
- [x] Whatever is shipped is checked against a real render, not against
      CSS source, given how far the rubric's own `ch`-based estimate
      diverged from the rendered result here
- [x] `node scripts/round.mjs check` green

## Round loop/build/nav-cue-and-line-length status

Closed by this round. `article p { max-width: 80ch; }` added to
`app/globals.css`. Chosen over `scratchpad/site-survey.md`'s own reasoning:
`90ch` is confirmed still a no-op against `main`'s 780px container; `68ch`
and `62ch` cost more (+13%/+10.88% independently re-measured, +24% not
re-measured, page length on `/blog/chatgpt-ads`) for a narrower column.
This rule makes no claim about how it relates to the site's other,
narrower `ch`-capped rules -- see the three corrections below for why.

**Three corrections, left visible rather than smoothed into a clean final
paragraph:**

1. The first version of this status note said the site's other
   `62ch`/`68ch` rules "cap secondary, supporting text" while `article p`
   is "the primary reading column." Found false by adversarial review:
   `.log-lead` is the entire freeform prose of `/log`, `/log/early` and
   `/log/archive` (`grep -rn "<article" app/log/`: no matches), the same
   role `article p` fills elsewhere.
2. The fix for #1 replaced it with an `<article>`-wrapper-vs-not
   distinction, claiming `.log-lead` was the one exception. Found false by
   adversarial review too, and backwards: none of `.hero-lead`,
   `.log-field`, `.log-note` or `.walkthrough-caption`'s own files
   (`app/page.js`, `app/log/LogEntry.js`, `app/demos/RoundWalkthrough.js`)
   has an `<article>` wrapper either, and `.log-lead` is the *only* one of
   the five named that ever appears on an `<article>` page
   (`app/model-retirement-calendar/page.js`, `app/charter/page.js`).
3. Both #1 and #2 were built on a count of "five" other `ch`-capped rules
   that neither this round nor either review invented: it traces to
   `docket/briefs/loop-build-nav-cue-and-line-length.md`, which states as
   fact "`app/globals.css` already caps several elements in `ch` -- `62ch`
   at lines 507, 813 and 1002, `68ch` at 745 and 774" -- five lines, from
   `grep -n "max-width" app/globals.css | head -6` read as complete when
   it was truncated. This round carried "five" forward across two drafts
   before running `grep -c "max-width: 6[28]ch" app/globals.css` itself,
   which gives **twelve**. Self-caught, not found by review, and the only
   one of the three not attributable to this round's own drafting.

`article p`'s `80ch` is justified above on its own measured terms only.
The site's other `ch` caps -- twelve of them, not five -- are left
uncharacterised on purpose: three attempts at describing what relates them
were each wrong in a different way, and this round stopped rather than
risk a fourth.

This round independently re-measured the baseline on a real render (not
carried over from the closed item's own figures) and reproduced it: 96-103
characters per full (wrapped) line at the median across the five pages this
item names, matching the 100-103 this item states once "full line" is read
as this item's own method reads it -- excluding each paragraph's shorter
final line, which pulled a naive per-line average down to the high 70s/80s
when this round measured it including those lines first (see
CHANGELOG.md's entry for both numbers and the command). `80ch` was then
independently re-derived (not assumed from this item's own §7.2 table): it
rendered to a 690px computed max-width, an 87-94 character median across
the same five pages, and a measured page-length cost of +0.5% to +4.3%
across them -- cheaper than every narrower candidate this item's own survey
measured.

`scripts/check-article-line-length.mjs`, wired into `scripts/check-
routes.sh`, guards the cap against silent removal or loosening on these
five routes; its own header states the ceiling's derivation and what it
does not claim. Proved able to fail: reverting `app/globals.css`'s
`max-width: 80ch` and rebuilding fails the check on all five routes
(max 108-124 chars/line, ceiling 107); restoring it and rebuilding passes
again. Full output in CHANGELOG.md's entry for this round.
