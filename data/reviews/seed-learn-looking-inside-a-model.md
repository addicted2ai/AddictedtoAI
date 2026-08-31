---
job: seed-learn-looking-inside-a-model
verdict: approve
reasons: []
would-cite: >-
  Anyone shown an interpretability demo whose feature dashboard reads beautifully
  — this page settles that the question is what got intervened on and what
  happened when it did, and that a high probe score on its own is a fact about
  the probe rather than about the model.
reviewer: rec-a — fresh-context seed reviewer, no edit rights, seven learn pages
date: 2026-08-30
---

Checklist: education page (advanced), judged against `openspec/curriculum/learn.md`
§2, §3 and its §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Sources fetched raw and matched by literal substring on
2026-08-30.

**Sendable sentence**, verbatim:

> A neuron that fires for three unrelated things is not a broken neuron. It is
> what compression looks like from the inside.

Runner-up, and the one I would actually send to a working engineer: "High probe
accuracy, on its own, is a fact about the probe."

## What I verified myself

Thirteen sources, roughly thirty literal-substring checks, zero failures.

- Alain & Bengio `1610.01644` — authors and 2016 date confirmed on the abstract
  page; the page's "named the method in 2016" is right.
- Hewitt & Liang `1909.03368` — authors, "control task", "selectivity", and the
  random-output construction all present. The page's rendering ("every word type
  assigned a random output") matches the paper's design.
- Toy models of superposition — "Linear representations can represent more
  features than dimensions, using a strategy we call superposition", verbatim in
  an 8.25 MB page.
- Cunningham `2309.08600` — "more interpretable" present.
- Scaling monosemanticity — Golden Gate Bridge present, and the caution quoted
  in full and verbatim: "there's a difference (for example) between knowing about
  lies, being capable of lying, and actually lying in the real world."
- `2502.04878` — "canonical units of analysis" and the Einstein decomposition
  present.
- `2502.16681` — "lack of a ground truth for the concepts used by an LLM",
  verbatim, and the page correctly attributes it to the paper's opening lines.
- IOI `2211.00593` — "26 attention heads", "7 main classes", "faithfulness,
  completeness and minimality", and "they also point to remaining gaps in our
  understanding" all verbatim in the abstract. The example sentence "When Mary
  and John went to the store, John gave a drink to" came back absent from the
  abstract and is verbatim in the body; abstract-versus-body placement, not
  fabrication.
- Refusal `2406.11717` — "13 popular open-source chat models", the single
  direction, and the suffix/propagation result all present.
- ROME `2202.05262` and its rebuttal `2301.04213` — "middle-layer feed-forward"
  present; both rebuttal quotations verbatim, including "better mechanistic
  understanding of how pretrained language models work may not always translate
  to insights about how to best change their behavior".
- Attribution graphs — "satisfying insight for about a quarter of the prompts
  we've tried", "small fraction of the mechanisms", and the publication date
  "March 27, 2025" all present, matching the page's "27 March 2025".
- Zhang `1611.03530` — random labelling and noise present.

**The named-person claim on this page, closed at source.** The page asserts that
"an author of the original sparse-autoencoder paper is also an author of the
canonical-units result" — the load-bearing sentence for its "neither critique
comes from outside the programme" argument. I pulled both full author lists.
`2309.08600`: Hoagy Cunningham, Aidan Ewart, Logan Riggs, Robert Huben, **Lee
Sharkey**. `2502.04878`: Patrick Leask, Bart Bussmann, Michael Pearce, Joseph
Bloom, Curt Tigges, Noura Al Moubayed, **Lee Sharkey**, Neel Nanda. The claim is
exactly true, and I checked the author lists rather than a substring match for
the surname, because a name in a bibliography would have satisfied the latter.

Front matter checked against §4: `outcome` verbatim, `prerequisites` exact,
`concept/grokking` resolves.

**Prerequisite closure computed from front matter.** Every body link
(`what-safety-training-changes`, `how-models-are-trained`) is inside it. Zero
out-of-closure links — the only one of my seven pages with a clean sheet on this
check. The curriculum's writer's note about `what-a-neural-network-is` not being
available to this page was already stale when written; the closure computation
confirms it arrives through `how-a-language-model-works`. The page establishes
the smearing premise for itself regardless, so nothing turns on it.

## What I took on trust

The grokking three-phase quotation ("memorization, circuit formation, and
cleanup") is reached through `/wiki/concept/grokking` rather than a direct
external link on this page; I did not fetch `2301.05217`. The
`review-advanced.md` table records it as verified verbatim and nothing on this
page depends on the exact wording. I also did not re-derive the superposition
geometry or check the IOI paper's full 26-head decomposition beyond the counts.

## One finding, minor

"Residual stream" (line 107) arrives unglossed and is not wiki-linked. Corpus
grep: it occurs twice on the whole learn surface, here and at
`what-safety-training-changes:41`, and is taught nowhere. This is F3 in
`review-advanced.md`, and it is unrepaired — this page has had no commit since
`2e3002f` at 17:17, before the reviews were written at 18:29, so my brief's
premise that every one of my pages was edited afterwards is not true here.

I record it and do not reject on it, for a reason I checked rather than assumed.
The rung is advanced, where §3's term-of-art audit permits a term whose sentence
still stands without it; the sentence is "one direction in the residual stream
such that erasing it stops the model refusing harmful instructions, while adding
it elicits refusal on harmless ones", which carries its whole meaning to a reader
who skips the phrase. And this page does define the neighbouring term the reader
actually needs, in its second paragraph: "the activations, the values flowing
through the network on one input". The gloss F3 asks for is owed by
`what-safety-training-changes`, not by this page.

## Judgment

Approve, and this is the best calibration performance among my seven.

The §4 entry called the true-and-shrinking distinction "this page's hardest
work" and it is done structurally rather than tonally. Every positive result
arrives chained to its own control or its own authors' self-critique: probes to
the control task, sparse autoencoders to two 2025 negative results from inside
the programme, the Golden Gate feature to its authors' caution about
over-reading, ROME's localisation to the editing rebuttal quoted at its most
deflationary. That is not a reviewer's charitable reading — it is the page's
repeated construction, and it means the calibration survives a hostile reader
from either direction.

The two-kinds-of-not-knowing section does what no popular treatment of this
subject does: it separates the questions that are yielding (what is this part
doing — with an intervention attached) from the one that is not yet well-posed
(why optimising next-token prediction yields this at all), and refuses to let
progress on the first imply progress on the second. The rhyme-planning result is
placed exactly where it hurts the page's own optimism most, which is the right
place for it. And the closing test — "what got intervened on, and what happened
when it did" — is a practice the reader can apply to the next paper they meet,
which is what the advanced rung is for.
