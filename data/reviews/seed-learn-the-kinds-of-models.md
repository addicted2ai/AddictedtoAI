---
job: seed-learn-the-kinds-of-models
verdict: approve
reasons: []
would-cite: >-
  Someone in an argument about whether the feed algorithm "counts as AI" — this
  page settles it by showing the recommender is the family whose examples cost
  nothing because every tap supplies one, which is why it arrived everywhere
  first and why the word slid off it.
reviewer: rec-f — foundations learn reviewer (fresh context, no edit rights, no authorship stake)
date: 2026-08-30
---

**Sendable sentence, verbatim, as the page sets it in bold:**

> **Pictures paired with descriptions, read in one direction, train a machine
> that names what it sees. Read in the other direction, the same pairs train a
> machine that paints what it is told.**

## Correcting my own brief's premise

My brief said every one of my seven pages had been edited since the rung
reviews. For this page that is **false**, and saying so matters more than
letting it stand. `git log` on the file shows one commit, `5e3761c`, and
`git diff 8a7731d HEAD -- content/learn/the-kinds-of-models.md` prints nothing.
The page is byte-identical to what the foundations rung review read. I therefore
did not re-litigate what that review already verified on it, and I say so here
rather than implying a fresh sourcing pass I did not perform.

What I *did* have to check fresh is the thing that review could not have
checked: two of this page's back-reference targets were rewritten afterwards.

## The joins into rewritten prerequisites — checked, both hold

`what-a-model-is` was rewritten at `83ee6af`, after the rung review.

- Page: "What you actually use is [a stack](/learn/what-a-model-is)". The
  rewritten page still says "The pile even has a name in the trade: the stack."
  **Holds.**
- Page: "An [earlier page](/learn/what-ai-actually-is) gave you a question that
  always has an answer: what did it learn, and from what?" `what-ai-actually-is`
  was touched at `3bbd945` and still ends "'What did it learn, and from what?'
  has an answer every time". **Holds, verbatim.**
- Page: "[the machine you have already met](/learn/what-a-neural-network-is):
  weighted sums stacked in layers, trained by computed blame." That page was not
  touched post-review. It never uses the compound phrase "weighted sums" — it
  teaches the mechanism in plain prose ("multiplies each by a number of its own,
  adds up the results") and stacks them ("Neurons are stacked in layers") — and
  it heads its training section "The blame is computed, not guessed". So both
  compressions are accurate to the mechanism rather than quotations of it. A
  reader holding the prerequisite has been given "weight" literally and
  explicitly, so the compound is transparent, not jargon. **Holds.**

## Mechanical checks

- Front matter is the five keys; `outcome` verbatim from §4; one prerequisite,
  same rung, nothing pointing up.
- No notation or equations: zero hits on a character-class sweep.
- No currency literals: zero model names, prices, versions or scores. The two
  dated events are wiki links ("their famous exam in 2012", "something anyone
  could download and run in 2022"), which is the dated-aside construction.
- All three mentions resolve: `concept/embeddings`, `event/imagenet-2012`,
  `event/stable-diffusion-release`. Two of them exceed §4's suggested list,
  which §4 calls suggestions and both are earned by prose that links them.
- One learn link outside the closure, `how-a-language-model-works` — a forward
  pointer ("a page of its own traces what reading that pile forward builds"),
  not a lean. The sentence stands without it.

## The finding that is still open

The rung review's finding 9 is **unfixed**, and the interesting part is what has
happened since. §4 requires the embedder to get "one sentence, deferring to
`how-machines-represent-meaning`". The page's sentence defers to
`/wiki/concept/embeddings` instead and never links the learn page. The review
offered two fixes — link the learn page, or amend the curriculum entry — and in
the commits that followed, `3ef172e` amended the curriculum substantially (the
true edge, embodiment, AGI, the title lever) and `79466a8` repaired fifteen
review-found defects across eleven pages. Neither touched this. That reads as
dropped rather than decided.

I am not rejecting on it, and the reasoning is worth stating so a later reader
can disagree with it deliberately. The spec's `spec-violation` scenario for the
curriculum requirement is a page appearing in *no* curriculum entry; this page
appears in one. The deviation is a single link target, the reader loses nothing
by it — the sentence gives the meaning in place ("coordinates, a position on a
learned map where similar things sit near each other") so there is no
jargon-before-meaning problem — and the review itself judged the shipped link
"arguably the better link" because the title sort now seats the meaning page
*before* this one, making the mandated deferral point backwards. The honest
resolution is amending §4, which is a file neither the page's author nor this
reviewer may touch. Failing the launch gate on a page whose prose is sound, over
a bookkeeping mismatch whose correct fix lives in a file the fix cannot be
applied to, would not serve the surface.

But it is silent drift, which the education-static requirement names as its
enemy, and it has now survived two chances to be closed. **It needs its own
beads issue** rather than a third mention inside a record; a note that exists
only inside a finished document is already lost.

## What I verified versus trusted

Verified locally by reading files: the three back-references above against the
current text of the pages they point at, the closure and ladder position by
script, front matter against §4, the mentions against `content/wiki`, and the
notation and currency sweeps.

Trusted without re-verification, and named: the external sourcing on this page
is thin by design — it cites no URLs, deferring both dated events to wiki
entries — so there was little to re-fetch. The rung review's checks of those two
wiki entries stand unre-examined here.

## Judgment

The organising frame does what §4 promised: a reader leaves able to classify a
product they have never seen, and the recommender section lands the hardest beat
on the entry — "The software that chooses what billions of people will look at
next is the software the word no longer points at." The reversal argument is
genuinely surprising and is argued rather than asserted, including why the
backward direction is harder. Approve, with finding 9 recorded as still open.
