---
job: seed-learn-why-bigger-got-better
verdict: approve
reasons: []
would-cite: >-
  A journalist about to write "the scaling laws predict" over a capability
  forecast — this page settles that the laws predict loss, that no accepted
  theory connects loss to the abilities arriving with it, and that the 2020 fit
  was itself corrected by better measurement inside two years.
reviewer: rec-a — fresh-context seed reviewer, no edit rights, seven learn pages
date: 2026-08-30
---

Checklist: education page (mechanics), judged against `openspec/curriculum/learn.md`
§2, §3 and its §4 entry — the entry §4 loads most heavily of any on the rung —
plus the `teach-the-whole-subject` delta for `specs/education-static`. Sources
fetched raw and matched by literal substring on 2026-08-30.

**Sendable sentence**, verbatim:

> The field can predict the loss of a model nobody has built yet, and cannot
> explain the abilities of the models it already has.

It is bolded on the page, it is the entry's hardest requirement discharged in one
line, and it is the sentence the capstone later spends by name. Runner-up: "The
measurement never proved the thesis. It made the thesis cheap to act on."

## What I verified myself

All eight external quotations, by literal substring against the fetched sources:

- Kaplan `2001.08361`: "with some trends spanning more than seven orders of
  magnitude" and "We study empirical scaling laws" — both verbatim. The second
  is doing real work in the page's argument, since the whole "fitted curves are
  what these laws are" move rests on the authors' own word *empirical*.
- Chinchilla `2203.15556`: "current large language models are significantly
  undertrained" — verbatim.
- Sutton, *The Bitter Lesson*: the seventy-years sentence, verbatim, on
  incompleteideas.net. Page date 13 March 2019 on the source.
- Brooks, *A Better Lesson*: "is sleight of hand in moving the human
  intellectual work to somewhere else" — verbatim. Dated 19 March 2019 on the
  source, so the page's "arrived six days later" is exact, not approximate.
- `2206.07682`: the emergence definition, both halves, verbatim.
- `2304.15004`: the metrics sentence, verbatim, and the deflationary "may not be
  a fundamental property of scaling AI models" — the page quotes the rebuttal's
  own hedge rather than its headline, which is the calibration the entry asked
  for.

Front matter checked against §4 by string comparison: `outcome` verbatim,
`prerequisites` exact, and all four `mentions` (`scaling-laws`,
`the-bitter-lesson`, `emergence`, `grokking`) resolve to files on disk.

**The post-review repair landed and I verified it rather than trusting the
commit message.** `review-mechanics.md` finding 4 recorded that the §4 must-cover
item "the walls (data, power, money) as dated asides **pointing at the costs
page**" was unsatisfied — the aside existed, was dated "as of 2026", and ended
"their arithmetic is a subject of its own" with no link. The page now reads "a
subject of its own" as a link to `/learn/what-it-costs-to-build-and-run-ai`
(commit `79466a8`). The must-cover item is now met. This is one of only three of
my seven pages that was in fact edited after the rung reviews.

**Prerequisite closure computed from front matter.** One body link sits outside
it — the costs link just described — and it is a pure deferral ("a subject of
its own"), which the curriculum's §5 explicitly classes as an inline
cross-reference rather than an edge. Legal.

## What I took on trust

The claim that "the forensics of why the two fits disagreed took until 2024 to
finish" is carried by an internal link to `/wiki/concept/scaling-laws` and I did
not open that entry's own sources.

**Addendum, same day: the one attribution I had left open is now closed at
source.** This record originally flagged "Sutton himself has since argued that
language models sit on the human-knowledge side of his own dichotomy" as the
strongest claim on the page about a living person's current position, reached
through the wiki rather than a primary source, and said someone should close it.
I closed it. `/wiki/concept/the-bitter-lesson` sources it to the Dwarkesh
Podcast; I fetched that transcript (HTTP 200, 465,492 bytes) and matched the
passage literally:

> In some ways it's a classic case of the bitter lesson. The more human knowledge
> we put into the large language models, the better they can do. So it feels
> good. Yet, I expect there to be systems that can learn from experience.

The episode title ("Father of RL thinks LLMs are a dead end") and date (Sep 26,
2025) both match the wiki entry. Sutton is explicitly filing language models
under the human-knowledge side of his own dichotomy, and doing it by naming the
bitter lesson himself, so the page's sentence is exact rather than an
interpretation. **The page's strongest named-person claim is verified at source
and no attribution on this page is now taken on trust.**

The grokking sentence rests on `/wiki/concept/grokking`, not re-verified here; I
did verify the same underlying result independently while reviewing
`looking-inside-a-model`, where the three-phase quotation checks out.

## Judgment

Approve, and it clears the bar by more than the other mechanics page I read.

The entry demanded something unusual — an epistemic state, not a topic: scaling
laws as *measured regularities, not derived results*, with the emergence claim
and its metric-artifact rebuttal both named and sourced so the reader sees a
live dispute rather than a settled story. The page delivers that and then does
the harder thing, which is refusing to let the rebuttal win either: "The
rebuttal showed that the sharpness and the unpredictability... sit largely in the
choice of ruler. It did not show why the abilities exist at any size."

Two structural virtues worth naming because they are what the surface claims for
itself. First, the page keeps the scaling law and the bitter lesson apart under
its own instruction to do so, having just shown a decade of writing running them
together — and it lets Sutton's own later position be the thing that undercuts
the most-quoted licence for scaling, rather than importing a critic to do it.
Second, the steam-engine paragraph earns its place: prediction without
explanation is presented as a workable engineering condition and a poor
foundation for prophecy, which is precisely the handoff the capstone picks up.
No equations, no forecasting, no benchmark scores. 1,200-odd words carrying six
must-cover beats without reading as a list.
