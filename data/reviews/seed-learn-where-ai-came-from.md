---
job: seed-learn-where-ai-came-from
verdict: approve
reasons: []
would-cite: >-
  Someone arguing about whether the current boom is another bubble — this page
  gives them "AI winter" as a name for a specific mechanism, two dated
  collapses with their stated reasons (a committee costing out Russian
  translators, a survey finding no field between two other fields), and the
  discipline of asking of any milestone what it actually settled rather than
  how impressive it looked.
reviewer: rec-o — background review job, fresh context, no edit rights on content
date: 2026-08-30
---

Orientation rung, depth 1, 1,318 body words. Unchanged since the rung review
(`git diff 81da626 HEAD` does not list it) — which matters here, because the
rung review named a defect on this page and **the repair pass did not fix it**.
See the finding below.

## The sendable sentence

> "A winter is a verdict on the promises, not on the work."

Bolded by the page. Runner-up, and the sharper sentence of the two: "Superhuman
turned out not to be a number. It was a score against the opponents somebody
had thought to try."

## Checked

- Front matter: five keys exactly; `outcome` verbatim from §4;
  `prerequisites: [what-ai-actually-is]`; all ten `mentions` resolve to real
  entries and all ten are linked in the body — no decorative backlinks.
- All five turns present in order, each anchored to a linked, dated entry:
  the naming and rule-writing era, the two winters with stated reasons, the
  learning turn, the two games, the transformer and the chatbot moment. The
  through-line §4 asked for (hand-written rules losing to learned behaviour,
  twice) is carried explicitly and is what the closing paragraph spends.
- Must-not held: no mechanism, no attempt at a complete timeline, no
  forecasting. The closer ("ask what it settles and about what") is a
  heuristic, not a prediction.
- Facts spot-checked against the linked entries, which is where this page's
  architecture puts them:
  - `event/dartmouth-workshop` carries proposal date 1955-08-31 and the quoted
    span "can in principle be so precisely described that a machine can be
    made to simulate it" — the page's quotation marks sit exactly around the
    verbatim portion, with the lead-in paraphrasing "every aspect of learning
    or any other feature of intelligence". Correctly fenced.
  - `event/eliza` carries "assume the pose of knowing almost nothing of the
    real world" verbatim and the January 1966 CACM citation.
  - `event/alpac-report`: November 1966, and the entry's own framing of the
    economics-of-translation argument. `event/lighthill-report`: early 1973,
    and the A/B/C categories with B — "deliberately labelled a bridge" —
    unfunded between the other two. The page's "no subject between them to
    fund" is a faithful compression of the entry's own structure.
  - `concept/ai-winter`: the 1984 AAAI warning and the market rising through
    1986 then falling from 1987. The page's "kept growing for two more years
    before the money turned" matches.
  - `event/imagenet-2012`: the ten-point gap and the several non-neural
    submissions within 1.2 points. The page's description of the table's shape
    is the entry's own.
  - `event/deep-blue-kasparov`: the 1997 result, the 1996 result, and
    Kasparov's own line about facing "something that is not exhausted" —
    which is what the page's "he was tiring and his opponent was not" renders,
    correctly placed in the match he went on to win.
  - `event/alphago-lee-sedol`: AlphaGo Zero beating the Lee-version 100–0 on
    2017-10-18; adversarial policies published 2022-11 at ">97% against KataGo
    at superhuman settings"; and — the claim I most expected to fail — the
    entry quotes the paper directly, "one of our authors, a Go expert, was
    able to learn from our adversary's game records to implement this attack
    without any algorithmic assistance". The page's "a person can be taught to
    run it" is supported to the source's own words.
  - `event/attention-is-all-you-need`: 12 June 2017, eight authors, "a single
    eight-GPU box, run for under four days", and the conclusion planning
    "images, audio and video". All four of the page's claims about the paper
    hold, including the one that carries its argument — that nothing in it
    anticipates a chatbot.

## Finding: the antecedent the repair pass skipped — carried forward, not new

`review-orientation.md` finding 5 named this sentence:

> "A rebuttal appeared within a week of its publication in 2019, and its
> author has since put today's chatbots on the wrong side of his own
> distinction."

It is still there, word for word. The repair commit (`79466a8`, "repair
fifteen verified defects the reviews found") did not touch this file — measured
by diff, not inferred — so a reviewer-named defect has survived a pass that
was convened to clear reviewer-named defects. That process fact is worth more
than the defect.

I checked the underlying facts myself against `concept/the-bitter-lesson` and
they are all correct: Sutton published 13 March 2019; Brooks published
*A Better Lesson* on 19 March 2019, six days later; and Sutton, on the Dwarkesh
Podcast of 26 September 2025, "placed language models on the human-knowledge
side of his own dichotomy". So the sentence is **true under its controlling
reading** and I do not raise `false-or-unsupported-claim`.

Why it still deserves the ink: within one sentence, "its publication" and "its
author" most naturally keep one referent, and that referent is the bitter
lesson — giving Sutton, which is right. But the nearer noun is "a rebuttal",
and a reader who takes that antecedent gets Brooks, for whom the sentence is
false: Brooks' objection is an accounting one about where human ingenuity went,
not a claim that chatbots sit on the wrong side of *his* distinction. A page
whose entire discipline is attribution — "ask what it settles and about what" —
should not leave its one contested attribution resting on which noun the reader
reaches for. The fix is three words: "the lesson's author", or name Sutton.

Recorded, not blocking. Per the project's deferral rule this should exist as
its own beads issue rather than only inside this record and a sealed rung
review; filing it is not this reviewer's to do, but its evaporation is the
predictable failure and this sentence is here so it does not.

## Taken on trust

ChatGPT's 30 November 2022 opening (the page dates it without naming the
product), and the wiki entries' own `source_url`s, which I did not re-fetch —
auditing the wiki against its sources is the wiki's review. No external URL is
cited on this page; its whole factual load runs through ten linked entries, and
I checked the page against those entries rather than against the internet.

Approve. This is the strongest history writing on the surface, and the reason
is structural: every turn is scored by what it settled rather than by how it
looked, which is a discipline no standalone history of AI applies.
