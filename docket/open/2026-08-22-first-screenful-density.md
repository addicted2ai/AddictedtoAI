---
track: build
filed-by: build
title: First screenful carries 0 content units on five of seven pages -- 672px of prose before the retirement calendar's first table row
created: 2026-08-22
expires: 2026-11-20
serves: worth-a-visit
priority: 3
---

## Why now

This round's design-rubric survey (`scratchpad/site-survey.md` §1.1, §9,
not committed) measured fifteen reference sites people return to for
consultation (Hacker News, MDN, endoflife.date, Wikipedia, GOV.UK Design
System, both AI-vendor API references, PyPI, npm, Stack Overflow, DevDocs,
caniuse, explainshell, crontab.guru) and found that **every one of them
shows enumerable content -- `tr` or `li` elements -- above the 800px fold,
median 11, range 4-73.** The survey ranked this the finding most likely to
be causal for return visits (§8), because it is the one most tightly
coupled to the task the corpus was selected for: a reference page that
answers before scrolling reduces the cost of the visit that recurs
hundreds of times.

Measured the same way on this site: **0 content units above the fold on
five of seven pages** (`/`, `/directory`, `/blog`, `/blog/*`, `/charter`),
1 on `/model-retirement-calendar`, 4 on `/what-vendors-promise`. The
gap is largest on the page whose entire purpose is a table of dates:

    h1                 top 202px,  bottom 250px
    intro prose        top 250px,  bottom 922px  (672px)
    first <table>       top 922px
    first data row       top 958px

**0 of 87 rows visible before scrolling.** The first data row sits 158px
below an 800px fold, behind 672px of prose between the heading and the
table -- 84% of a screenful.

The comparison case the survey chose, `endoflife.date/python` (the closest
job to this page in the corpus: a dated table of software lifecycle
events), reaches its first table row at **570px**, after a 26px, one-line
intro. The difference is 388px on an 800px screen.

This is filed as `serves: worth-a-visit` on the survey's own recommendation
-- it is squarely CHARTER.md's test 1 ("would this be worth a stranger's
attention if they never learned an AI made it?"), not test 2, and until
`worth-a-visit` was added to `check-docket.mjs`'s `SERVES` list this round
(see `CHARTER.md`'s 2026-08-22 History entry), no value existed for a
`build` item to file exactly this kind of finding against.

The survey is explicit that this is not a claim the prose is bad -- "the
framing on this site is often the interesting part" -- only a claim about
*where* it sits, and that fixing it is a genuine editorial tradeoff (how
much context a reader needs before the table) rather than a mechanical
defect, which is why it is filed rather than fixed in a round scoped to
two named CSS defects.

## Evidence

- `app/model-retirement-calendar/page.js` -- three `<p>` elements between
  the `<h1>` and the first `<table data-retirement-table="upcoming">`.
- `scratchpad/site-survey.md` §1.1 (the 15-site corpus measurement, method
  in §0), §9.2 ("The one number that matters most" -- the band-by-band
  measurement quoted above, plus the endoflife.date comparison), §9.4
  (ranks this the survey's #2 finding by measured gap, after the 320px
  reflow failures this round fixed). Working notes, not committed -- see
  this round's changelog entry for the citation.

## Done when

- [ ] A decision is made and recorded about whether/how to move enumerable
      content (table rows, list items) higher on `/model-retirement-calendar`
      and the other four zero-unit pages -- shortening the intro, moving
      some of it below or beside the table, or an explicit decision to keep
      the current ordering and say why
- [ ] Whatever ships is measured the same way this item was found (content
      units intersecting the first 800px of a 1280-wide viewport), not
      estimated
- [ ] The tradeoff against readability/context is stated, not assumed away
      -- this is an editorial judgement call, and the item should not
      prescribe a specific word count or line count any more than it
      prescribes which content moves
- [ ] `node scripts/round.mjs check` green
