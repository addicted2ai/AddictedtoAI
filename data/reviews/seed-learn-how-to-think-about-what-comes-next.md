---
job: seed-learn-how-to-think-about-what-comes-next
verdict: approve
reasons: []
would-cite: >-
  A reader handed a confident AI timeline across a dinner table — this page
  settles that the reply is not a counter-forecast but three questions (what is
  it extrapolating, which curve is it about, what would its author accept as a
  miss), and that a wall argument is a forecast too.
reviewer: rec-a — fresh-context seed reviewer, no edit rights, seven learn pages
date: 2026-08-30
---

Checklist: education page (advanced), the surface's capstone. Judged against
`openspec/curriculum/learn.md` §2, §3 and its §4 entry including the 2026-08-30
AGI amendment, plus the `teach-the-whole-subject` delta for
`specs/education-static`, plus the three extra capstone tests in my brief.
Sources fetched raw and matched by literal substring on 2026-08-30.

**Sendable sentence**, verbatim:

> The alternative to a forecast is not silence; it is a watchlist.

Runner-up, and sharper as a sentence: "A wall is a forecast too."

## The forecast ban — checked, not assumed

The entry's must-not is absolute: "a forecast of its own; timelines; the word
'inevitable'". `review-advanced.md` F5 recorded a forecast-shaped closer — "Next
year there will be a headline about a system that does not exist today, doing
something nobody can currently demonstrate."

**It is gone.** Commit `79466a8` recast it to "When the next headline arrives
about a system that does not exist today, doing something nobody can currently
demonstrate, you will not be able to tell whether it is true, and you do not need
to." The timeline is removed and the sentence is now a conditional frame rather
than a prediction.

I then checked that nothing else of that shape survives, rather than trusting the
one repair. Every occurrence of "will" on the page is one of three things: the
page disclaiming a forecast ("this page will not add a forecast to it"; "you will
not be able to tell"), or inside an attributed quotation of someone else's
forecast (the two data-wall quotes; the railroads rebuttal). There is no dated
claim about the future in the page's own voice. "Inevitable" occurs zero times
on this page and zero times across all thirty-nine learn pages.

**The AGI clause** (commit `3bbd945`) is one sentence, seated between "no
arriving fact could embarrass it" and the gradeable forecasting contest, which
puts the unfalsifiable exemplar immediately before the falsifiable one. It says
the term "fixes no threshold anyone has agreed on" — which is the opposite of
supplying one — and makes "what would you accept as arrival?" the first question
to put to its author. It defines nothing (the root page owns the definition) and
predicts nothing. The entry's amendment is satisfied exactly, and it is a clause
rather than a section as the amendment specified.

## What I verified myself

Nineteen literal-substring checks across nine sources.

- **Steinhardt** — 6.9%, 12.7%, 50.3%, "75th percentile", "high hourly rate",
  "progress still outpaced the forecast", and the self-grading quotation in full
  ("I clearly thought the forecasts on MATH were aggressive... whereas it turned
  out they weren't aggressive enough"), all verbatim.
- **Data wall, both versions** — "the stock of high-quality language data will be
  exhausted soon; likely before 2026" in the v1 abstract, and "available stock of
  public human text data between 2026 and 2032" plus "slightly earlier if models
  are overtrained" in the revision. Both verbatim, which is what makes the page's
  "the movement is the lesson" argument real rather than rhetorical.
- **Epoch 2030 audit** — "2e29 FLOP", "would be feasible by the end of the
  decade", and the 10,000-fold figure, all present.
- **Sequoia** — "Where is all the revenue?", $200B, $600B, and "is like building
  railroads", all present.
- **SuperGLUE** — "surpassed the level of non-expert humans, suggesting limited
  headroom for further research" and "introduced a little over one year ago",
  both verbatim.
- **Compute trends `2202.05924`** — "20 months" and "6 months" verbatim, and the
  paper does split the history into "three eras", supporting the page's phrasing.
- **Epoch open/closed gap** — "four months" and "January 2026" both present.
- **Epoch price trends** — "40x", "9x to 900x", and "PhD-level science" all
  present.

**One thing the earlier review got wrong in the page's favour, corrected here.**
`review-advanced.md` F6(a) records that the open/closed insight "renders no
publication date", leaving the page's "published in May 2026" unverifiable. The
live page now renders "Updated May 29, 2026". The page's date is **verified
correct**, not merely consistent.

**The winters, re-checked after the repair.** Commit `79466a8` reconciled the
Lighthill dating. The page now says "the British survey published early in 1973",
and `content/wiki/concept/ai-winter` now carries both dates with the distinction
stated ("dated July 1972 and published early in 1973"). Page and wiki agree. The
page's characterisations — ALPAC asking whether the demand existed, Lighthill
grading two of three categories respectable while failing the claim that
connected them, the 1984 warning preceding the collapse — all match the wiki
entry's own account.

Front matter checked against §4: `outcome` verbatim, all four `prerequisites`
exact, both `mentions` resolve.

**Prerequisite closure computed from front matter.** Every body link is inside
it. This is the deepest page on the surface and it has no undeclared assumption.

## What I took on trust

Steinhardt's Berkeley-statistician affiliation and Cahn's Sequoia partnership
(bylines, not re-checked). The Epoch 2030 report's August 2024 publication date.
The content of `/wiki/concept/ai-winter`'s own sources, beyond checking that page
and wiki agree.

## The three capstone tests

**1. Does it hand the reader something new that only the ladder makes possible?
Yes, twice.** The watchlist is the visible case: each of its four instruments is
unusable without a caveat a different prerequisite installed — the benchmark
replacement cycle survives only for a reader carrying
`what-a-benchmark-measures`' three warnings, the compute doubling is read as a
spending curve via the money wall, prices are read through `ai-and-work`'s
diffusion lens. The better case is "A wall is a forecast too", which turns
`why-bigger-got-better`'s extrapolation critique against the pessimists. No
single prerequisite contains that move, and the walls section then grades all
three walls against history rather than adjudicating them.

**2. Usable next year on a technology that does not exist yet? Yes.** The three
closing questions contain no AI-specific term at all. The watchlist items are
AI-specific and the discipline is not, and the page knows which of the two it is
teaching — it says so, in the sentence about grading being the method of the site
rather than a prediction.

**3. Is its sendable sentence the best on the surface? I say plainly: it is the
right closing sentence, and it is not the single best sentence on the surface.**
As the closing line of a whole argument it is exactly correct — it names a third
option the reader did not know existed, converts a refusal into a practice, and
travels outside this subject entirely. But asked which sentence on the surface I
would actually send someone, two beat it: `how-inference-is-served`'s "Input is
cheap because it is parallel; output is expensive because it is serial", which
derives an industry's whole pricing structure from one hardware asymmetry, and
this page's own "A wall is a forecast too", which reframes an entire class of
argument in five words. The watchlist line is the best *ending*; it is not the
best sentence. That is not a defect — a closing line has a different job, and the
page's job here is to leave the reader holding a practice — but the brief asked
me to say plainly if it was not, and it is not.

## Two findings, both minor, both filed

- **"as of March 2025" is not on the source.** The live price-trends page renders
  "Updated Nov. 20, 2025" and no March date; all three quoted figures still match
  it. Wayback's CDX index shows the page's earliest capture is 2025-03-13, which
  corroborates the claimed as-of date, but replay returned 503 on three attempts
  across two timestamps, so I could not verify the snapshot's contents. Recorded
  as corroborated, not verified.
- **The prize pool was per benchmark, not per question.** The page says "a $5,000
  prize pool per question". The post says both "Each forecasting question had a
  $5000 prize pool" and, clarifying, "The overall prize pool was only $5000 for
  each benchmark (which itself consists of four questions for 2022-2025)". The
  page followed the first and the second corrects it, so the per-question stake
  is overstated about fourfold. No earlier review caught this. The clause it
  supports — that accuracy cost something to get wrong — is unaffected.

Both are in `addictedtoai-bc0`. Neither is rejection-grade: one is a date the
source has since overwritten, the other a stake figure the argument does not rest
on.

## Judgment

Approve. It is a capstone rather than a recap — it opens on material used nowhere
else on the surface, spends each prerequisite by name rather than summarising it
("That page banked a scepticism. This is where it gets spent"), and ends on a
method instead of a conclusion. The symmetry is the achievement: it refuses the
optimist's extrapolation and the pessimist's wall with the same argument, having
first established that the field's record contains a precedent for every possible
next outcome. Last page of a four-hour surface, and it sends the reader away with
work to do rather than a summary of what they read.
