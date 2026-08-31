---
job: seed-learn-open-weights-and-closed-models
verdict: approve
reasons: []
would-cite: >-
  Someone in a licensing thread calling a weights drop "open source" — this page
  hands them the binary comparison that settles it, that given the recipe you
  could produce the weights and given the weights you cannot get the recipe
  back, plus the acceptable-use policy folded into the grant by pointing at a
  web page the licensor controls.
reviewer: rec-f — foundations learn reviewer (fresh context, no edit rights, no authorship stake)
date: 2026-08-30
---

**Sendable sentence, verbatim, as the page sets it in bold:**

> **A closed model can be switched off. An open one can only be regretted.**

## The change since the last review, verified against the licence itself

One sentence changed, at `79466a8`, repairing the rung review's finding 7: the
page's paraphrase of the big-company carve-out read as an ongoing test when the
licence conditions it on a single date. It now reads:

> Any company whose products had, on the day that version of Llama was released,
> more than "700 million monthly active users in the preceding calendar month"
> must "request a license from Meta, which Meta may grant to you in its sole
> discretion" — a test taken once, at release, rather than a ceiling you can
> later grow into.

`ai.meta.com` is one of the origins recorded here as unfetchable, so I took the
route the prior review took and fetched Meta's own repository copy:
`https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama4/LICENSE`
(7,526 bytes, HTTP 200). Matched by literal substring, and I read the full clause
rather than a grep window, because a truncated match here would have been
indistinguishable from a complete one:

> "2. Additional Commercial Terms. If, on the Llama 4 version release date, the
> monthly active users of the products or services made available by or for
> Licensee, or Licensee's affiliates, is greater than 700 million monthly active
> users in the preceding calendar month, you must request a license from Meta,
> which Meta may grant to you in its sole discretion…"

Both quoted spans on the page are verbatim, and the added paraphrase — "on the
day that version of Llama was released" — maps exactly onto "on the Llama 4
version release date". **The repair is correct.**

While in the file I re-checked the page's other licence claims against the same
bytes rather than assuming them:

- "Llama 4 Version Effective Date: April 5, 2025" — the page's "effective in its
  own text on 5 April 2025" is exact.
- "non-exclusive, worldwide, non-transferable and royalty-free limited license"
  — verbatim.
- "prominently display 'Built with Llama'" and "you shall also include 'Llama'
  at the beginning of any such AI model name" — the page's "display 'Built with
  Llama' and put 'Llama' at the front of the name of anything trained from it"
  is exact.
- "which is hereby incorporated by reference into this Agreement" — verbatim,
  and it really does attach an acceptable-use policy at a URL, exactly as the
  page says.
- "Meta's proprietary Llama 4" — verbatim in the Llama Materials definition. The
  page's use of it as the closing turn of that section is fair, not a gotcha.

And the OSI definition, fetched separately from
`https://opensource.org/ai/open-source-ai-definition` (177,360 bytes): "a
skilled person can build a substantially equivalent system" and "complete source
code used to train and run the system" are both present as literal substrings.
The page's "A release that stops at the weights has supplied one of the three"
is arithmetic on the definition's own list.

## What else I checked

- **The back-reference into a rewritten page holds.**
  `what-safety-training-changes` was rewritten at `3d61355`, after the rung
  review. The page leans on it: "Refusal behaviour is part of the weights, so
  whoever holds them can train it back out, which is [what safety training
  installed](/learn/what-safety-training-changes) run backwards." The rewritten
  page says "It installed something with a location… That is why stripping
  refusals out of a released set of open weights is a small, cheap edit rather
  than a retraining run, and why open weights and guaranteed refusals are in
  tension." **The join is stronger than the page claims**, not weaker — the
  advanced page independently reaches the same conclusion.
- The second forward link, "[never leaves the
  machine](/learn/where-your-words-go)", is supported by that page's closing
  sentence. Both out-of-closure links are §4-sanctioned deferrals and neither is
  a lean; the sentences stand without them.
- **Front matter**: five keys, `outcome` verbatim from §4, one prerequisite at
  orientation under a foundations page, nothing pointing up.
- **No notation or equations**: zero on a character-class sweep.
- **All three mentions resolve**: `event/gpt-2-staged-release`, `org/deepseek`,
  `org/mistral-ai`. The last is earned by a transclusion rather than a link, and
  I confirmed the transclusion resolves — `{{fact:org/mistral-ai#flagship_license}}`
  is a declared field in that entry with value "Apache License 2.0" and a cited
  source URL, so the page will render a bound fact rather than a build error.
- **Currency discipline is the best on the surface for a page of this subject.**
  Every model or vendor name is either inside a dated licence discussion, a
  transclusion, or a wiki deferral. Notably the page never names GPT-2 in prose
  — "In 2019 OpenAI announced a language model" — and defers to the entry.

## A finding not previously named

**One phrase is exposed to rot: "the last frontier Llama release".** That is a
present-tense superlative about the world, and it stops being true the day
there is another one. It is mitigated in the same sentence by "effective in its
own text on 5 April 2025", so a reader can always date what is being described,
and the surrounding argument does not depend on the release being the latest —
only on its licence saying what it says. But the currency rule exists precisely
for claims of this shape, and "the frontier Llama release effective 5 April
2025" would be strictly better and cost nothing. Non-blocking; worth a line in
whatever issue collects the surface's rot exposure.

## What I verified versus trusted

Re-fetched and matched by literal substring myself: the entire Llama 4 licence
(all seven claims the page makes about it, not only the one that changed) and
the two OSI phrases. Checked locally: the `what-safety-training-changes` join
against its rewritten text, the transclusion field, the mentions, the closure,
the front matter, and the notation and currency sweeps.

Taken on trust and named: the GPT-2 staged-release account — "Its own report on
the decision conceded the objection critics had been making" and the nine-month
span. The page defers to the wiki entry for both, the rung review found the
entry's own quoting faithful, and it recorded that the report PDF itself defeats
text extraction through a custom font encoding, so absence there is unproven
either way. I did not attempt that fetch and am not claiming it.

## Judgment

The spectrum frame does what §4 asked and the binary/recipe contrast is the part
that makes it stick — including the honest place the analogy breaks, which most
writing on this topic omits. The closing move is the strongest thing here: the
same permanence is simultaneously the best argument for closed release and the
best argument for open release, which is why the fight does not resolve. That is
a genuine structural insight rather than a both-sides hedge. Approve.
