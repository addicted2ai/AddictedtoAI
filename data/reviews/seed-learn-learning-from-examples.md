---
job: seed-learn-learning-from-examples
verdict: approve
reasons: []
would-cite: >-
  An engineer or analyst explaining to a stakeholder why a model that scored
  99% in testing collapses in the field — this page supplies the cow-standing-
  on-grass shortcut and the line that ends the argument, that a trained system
  learns what its examples have in common rather than what anyone meant them
  to have in common, so the failure is the loop working correctly on the wrong
  pile.
reviewer: rec-o — background review job, fresh context, no edit rights on content
date: 2026-08-30
---

Orientation rung, depth 1, 1,143 body words. Byte-identical to the version
`review-orientation.md` read — confirmed by `git diff 81da626 HEAD`, which
does not list this file. I read it fresh anyway and reached the same verdict
independently.

## The sendable sentence

> "A trained system learns what its examples have in common, not what you
> meant them to have in common."

The page sets it in bold itself. A second is close behind and is the one I
would actually quote in conversation: "As far as the software is concerned,
the pile is the world." Both are structural surprises, not summaries — which
is the test §3 sets and the one this page passes most comfortably on the rung.

## Checked

- Front matter: the five keys exactly; `outcome` verbatim from §4;
  `prerequisites: [what-ai-actually-is]` as §4 declares; `mentions` =
  `event/imagenet-2012`, which resolves and is linked in the body, so the
  backlink it creates is earned rather than decorative.
- All four must-cover beats present and each driven rather than listed: the
  loop in prose (guess, score, nudge, repeat); generalisation versus
  memorisation, argued through the filing-cabinet reductio rather than
  asserted; the examples set the ceiling, with the cow/grass shortcut as the
  mechanism; train-time versus use-time, closing on the seed for
  `what-a-model-is` exactly where §4 asks for it.
- Must-not held: no neural networks, no gradients by name (the word does not
  appear — grepped, not skimmed), nothing language-model-specific. The chatbot
  is named once, in the opening, as an instance of trained software, never as
  mechanism.
- Rung admission test: no notation, no code, no maths vocabulary. Every term
  of art is glossed where it lands — "training", "generalising", and "a model"
  in the closing section.
- The forward link to `/learn/what-a-model-is` sits outside the transitive
  closure, which is correct: it is an inline pointer ("it has a page of its
  own"), not a declared assumption, and the sentence stands unfollowed. §3
  permits exactly this.
- **Back-reference re-checked against a page that changed after the rung
  review.** `what-a-model-is` was rewritten wholesale at 19:18 (commit
  `3d61355`, 189 lines), *after* the reviews verified the links into it. This
  page's claim — "That frozen bundle of settings is called a model" — still
  matches the rewritten text, which opens its second section "What training
  leaves behind, once all the examples have been shown, is the model". The
  handoff survived the rewrite.
- ImageNet claims checked against `event/imagenet-2012`: the entry carries the
  15.315% winning number and the table's shape ("several submissions finished
  within 1.2 percentage points of each other — and then there is a gap of ten
  points before the winner"). The page's "so far in front that the scoreboard
  reads like two kinds of software sitting one exam" is a fair rendering of
  the entry's own "two different regimes printed on the same page". The
  held-back-labels description of the contest is accurate.

## Taken on trust

The wiki entry's own sources were not re-fetched — no external URL is cited
on this page, so its whole factual load is one linked event entry plus
arithmetic-free mechanism. I did not attempt to falsify the cow/grass example
as a literal published result; it is offered as an illustration ("Suppose the
photographs…"), not as a citation, and reads correctly as one.

## Finding

None. This is the cleanest page of the seven — no unrepaired reviewer finding
attaches to it, and my own sweep turned up nothing to name. The teaching does
what §4 asked in the register §3 asked for, and the closing paragraph
("What looks from outside like a machine being stupid is, from inside, a
machine being faithful to examples you never saw") converts the whole page
into a diagnostic the reader keeps.

Approve.
