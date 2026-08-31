---
job: seed-learn-what-models-are-trained-on
verdict: approve
reasons: []
would-cite: >-
  Someone asking why a model is fluent but unreliable in their own language, or
  weak on a trade a million people practise — this page gives them the six
  filters a thing must survive to be in the pile at all, none of which could
  tell rare from unimportant.
reviewer: rec-f — foundations learn reviewer (fresh context, no edit rights, no authorship stake)
date: 2026-08-30
---

**Sendable sentence, verbatim, as the page sets it in bold:**

> **A quality filter does not measure quality. It measures resemblance to text
> that somebody already decided was good.**

## The change since the last review, verified against the paper itself

One sentence changed, at `79466a8`, repairing the rung review's finding 5. The
page had said the GPT-3 paper "sampled the collections it judged higher quality
two or three times **each**, the crawl itself less than once", which is false for
Books2. It now reads:

> the GPT-3 paper sampled three of the collections it judged higher quality two
> or three times over, and the crawl — along with the larger of its two book
> collections — less than once.

I re-fetched `https://ar5iv.labs.arxiv.org/html/2005.14165` (1,196,457 bytes) and
checked this by literal substring rather than trusting the prior review's
numbers. The paper's own sentence is present verbatim:

> "...higher-quality are sampled more frequently, such that CommonCrawl and
> Books2 datasets are sampled less than once during training, but the other
> datasets are sampled 2-3 times."

So "three of the collections … two or three times over" maps exactly onto "the
other datasets are sampled 2-3 times" (WebText2, Books1, Wikipedia), and "the
crawl — along with … — less than once" maps exactly onto "CommonCrawl and Books2
datasets are sampled less than once".

The one clause the paper's sentence does not settle is whether Books2 is "the
larger of its two book collections", so I checked that separately against the
table quantities in the same fetched bytes: the distinct "N billion" figures in
the dataset table are 410, 19, 12, 55 and 3 billion — Common Crawl, WebText2,
Books1, Books2, Wikipedia. **Books2 at 55 billion is the larger; Books1 is 12
billion.** The repaired sentence is exactly right, including the clause that
required its own check.

## What else I checked

- **The back-reference into a rewritten prerequisite holds.**
  `why-models-are-confidently-wrong` was rewritten at `83ee6af`, after the rung
  review. This page's closing argument depends on it: "[Why a model is
  confidently wrong](/learn/why-models-are-confidently-wrong) describes the
  failure from outside: the error rate tracks how often something was written
  down, not how difficult it is." The rewritten page says "So a model's error
  rate tracks how often a thing was written down, not how hard it is."
  **Survives near-verbatim** — the rewrite preserved the phrase its dependents
  quote, which is what the curriculum says rewrites are supposed to do.
- **Front matter**: five keys, `outcome` verbatim from §4, both prerequisites
  orientation against a foundations page, so nothing points up.
- **Unearned assumptions: none.** Computed closure is
  `why-models-are-confidently-wrong`, `what-a-model-is`, `what-ai-actually-is`,
  `learning-from-examples`; there are no learn links outside it at all.
- **No notation, no equations, no currency literals.** The four "GPT-3"
  occurrences are each attached to a dated paper ("The 2020 paper describing
  GPT-3", "the 2022 paper describing how OpenAI turned GPT-3 into an
  instruction-follower"), which is the dated-aside construction, not a live
  model fact.
- **Mentions resolve**: `concept/model-collapse` and
  `event/gpt-2-staged-release`, both present in `content/wiki`. The second
  exceeds §4's suggestion and is earned — the WebText three-karma fact links it.
- **The must-not held.** The legal fight gets exactly the one acknowledging
  sentence §4 allowed ("is being fought over in courts in several countries and
  is settled nowhere") and no more.

## What I verified versus trusted

Re-fetched and matched by literal substring myself: the GPT-3 sampling sentence
and the dataset table quantities — the only claim on the page that changed, plus
the sub-claim the change introduced.

**Taken on trust and named plainly:** every other number on this page. The C4
geography study (51.3% US-hosted, the India/Pakistan/Nigeria/Philippines
percentages, Google Patents as most-represented site), the 45TB→570GB ratio, the
61-word sentence repeated 60,000 times, the 42/32 against 6.2/7.2 blocklist
removal rates, the ~40 Upwork and Scale AI contractors and the 73% labeller
agreement, and the AP–OpenAI July 2023 licensing quote. The foundations rung
review re-fetched all of these by literal substring against the sources' own
bytes and found them exact, and none of them was touched by the one-sentence
edit since. I did not duplicate that work, and this record should not be read as
a second independent confirmation of it.

One thing I noticed while not re-checking: the page says the labellers "agreed
with each other only about 73% of the time" where the rung review recorded the
paper's figure as 72.6 ± 1.5%. "About 73%" is a correct rounding, not a
discrepancy.

## Judgment

This is the page the sourcing rule was written to produce, and the repaired
sentence is a good sign about the repair process — it did not just delete the
word "each", it went back to the table and found the honest characterisation,
including which of the two book collections was the larger. The supply-side
argument connects to `why-models-are-confidently-wrong` from the other side and
yields checkable predictions rather than a shrug ("more reliable in English than
in the other languages it speaks fluently, because fluency and coverage are
different properties and only one of them is audible"). Approve.
