---
job: seed-learn-what-a-reasoning-model-does
verdict: approve
reasons: []
would-cite: >-
  An engineering manager deciding whether to pay for a reasoning tier on a task
  that has no automatic checker — this page settles that the gains were trained
  wherever a program could mark the answer, so the question to ask is whether
  your own task has a key, a test or a parser, not how long the model thinks.
reviewer: rec-a — fresh-context seed reviewer, no edit rights, seven learn pages
date: 2026-08-30
---

Checklist: education page (mechanics), judged against `openspec/curriculum/learn.md`
§2, §3 and its §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Sources fetched raw and matched by literal substring
on 2026-08-30.

**Sendable sentence**, verbatim, as `specs/education-static` requires a reviewer
to name or else reject `not-worth-reading`:

> The gains landed on the questions a program can mark, not the questions that
> are hard, and the gap between those two sets is most of what a reasoning model
> still cannot do for you.

It is the page's thesis, it is not available from any vendor's description of a
reasoning model, and it converts a purchasing question into a diagnostic one.
Runner-up: "A readout stops being a readout the moment it becomes a target."

## What I verified myself

Every quotation on the page, against the fetched source, entities decoded and
tags stripped. Twelve of the fifteen were in abstracts; three were body text and
initially came back absent, which resolved to abstract-versus-body placement
once the full text was fetched — not to fabrication.

- `2408.03314`: "how one should tradeoff inference-time and pre-training
  compute" and "the effectiveness of different approaches to scaling test-time
  compute critically varies depending on the difficulty of the prompt" — both
  verbatim.
- `2411.15124`: "a novel method we call Reinforcement Learning with Verifiable
  Rewards" — verbatim. The page's following sentence, "The technique is older
  than the name", is the correct hedge on a naming claim.
- `2501.12948`: "obviating the need for human-labeled reasoning trajectories"
  and "superior performance on verifiable tasks such as mathematics, coding
  competitions, and STEM fields" — both verbatim. The page's use of the second
  is the sharpest move on the page: it reads the paper's own summary of where
  the model came out ahead as evidence for the training-signal argument, rather
  than asserting the argument.
- `2305.04388`: "systematically fail to mention"; "frequently generate CoT
  explanations rationalizing those answers" — verbatim (the earlier mechanics
  review suspected this second one was a paraphrase; it is not).
- `2307.13702`: both long quotations verbatim, including "as models become
  larger and more capable, they produce less faithful reasoning on most tasks we
  study".
- `2505.05410`: "reveal rate is often below 20%"; "outcome-based reinforcement
  learning initially improves faithfulness but plateaus without saturating";
  "the propensity to verbalize them does not increase" — all verbatim.
- `2507.11473` (body): "On some tasks, models need to externalize their
  reasoning because they are unable to complete the task without CoT" —
  verbatim. "Direct supervision of CoT" is a section heading in the paper, and
  the page's framing of it as one of "the developments that could destroy the
  usefulness of the text" matches the section's content.
- `2412.16720` (body, PDF extracted): "large blocks of illegible numbers"; "far
  more legible by default and could allow us to monitor our models for far more
  complex behavior"; "(if they accurately reflect the model's thinking, an open
  research question" — all verbatim. Printing that parenthesis is the page's
  best evidential move and it is real.

Dates checked against submission dates: May 2023, "two months later" (July
2023), May 2025, November 2024, December 2024, January 2025 — all correct.

Front matter checked against §4 by string comparison: `outcome` verbatim,
`prerequisites` exact, all three `mentions` resolve to files on disk.

**Prerequisite closure computed from front matter**, not assumed. The closure is
`how-models-are-trained`, `getting-good-answers`,
`why-models-are-confidently-wrong`, `how-a-language-model-works`,
`how-machines-represent-meaning`, `what-a-neural-network-is`, `what-a-model-is`,
`learning-from-examples`, `why-context-is-not-memory`, `what-ai-actually-is`.
One body link falls outside it — `/learn/why-bigger-got-better`, at "Both were
spent". The two sentences before it teach the two quantities themselves, so the
sentence stands for a reader who never follows the link. Legal inline
cross-reference, not an undeclared assumption.

The rung's admission test is met on the term that mattered: this page defines
reinforcement learning in plain prose ("The model produces something, a score is
attached to what it produced, and the weights move to make higher-scoring
productions likelier next time... That is reinforcement learning") — a
definition its own declared prerequisite `how-models-are-trained` uses without
supplying, which is the mechanics rung's known vocabulary gap being repaired
from the wrong direction but repaired.

## What I took on trust

The `2501.19393` link (used only for "cut it off early") and the Nature
publication of `2501.12948` were not independently checked; neither carries a
quotation and the page's argument does not rest on either. I did not re-derive
the claim that the visible chain is causally load-bearing beyond the one quoted
position paper.

## The one defect, and it is small

The page says the system card "states the choice in six words: we surface CoT
summaries to users". The card's sentence, verified in its body, is "We surface
CoT summaries to users in ChatGPT." — eight words. The quoted span is exact and
the substance is right, but the count describes the page's own unmarked trim
rather than the source. On a page where fifteen other quotations are exact to
the parenthesis, this is the one place the standard slips. Raised as nitpick 7
in `review-mechanics.md` and unrepaired since — the page has had no commit after
the reviews, contrary to what my brief assumed. Filed as `addictedtoai-bc0`
rather than left here, because an approve record is not a place a fix gets
found.

Not rejection-grade: it misstates a word count, not a position, and no argument
turns on it.

## Judgment

Approve. The page does the thing its entry asked for and one thing it did not:
it refuses the metaphysics on both sides ("Whether the stretch deserves to be
called thinking is an argument about a word, and it is separable from every
question below") and then never returns to it, which is harder than taking a
side. The faithfulness section is calibrated the way this surface claims to be —
the text is causally involved *and* is not a report, with both halves sourced,
and the reason the two come apart traced to where the training signal was
attached rather than to anyone's bad faith. The closing test is usable by a
reader on the day they read it.
