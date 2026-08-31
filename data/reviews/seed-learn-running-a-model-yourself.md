---
job: seed-learn-running-a-model-yourself
verdict: approve
reasons: []
would-cite: >-
  Someone about to buy a machine for running models locally and comparing
  processors — this page redirects the purchase onto the two figures that
  actually decide it, how much memory the chip can reach and how fast it can
  read that memory, and explains why a thin laptop with one shared pool runs
  models that a far more expensive desktop with a plug-in card simply refuses.
reviewer: independent record reviewer, seven-page set (fresh context, no edit rights)
date: 2026-08-30
---

Checklist: education page (mechanics, Area D), against `openspec/curriculum/learn.md`
§2, §3 and the §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Sources fetched to disk 2026-08-30 and probed by
literal substring.

**Sendable sentence, verbatim** — the page's bolded pair:

> A model on your own machine does not run at the speed of your processor. It
> runs at the speed your machine can read it.

It passes the real test rather than the formal one: it is the sentence that
changes what a reader does next, because it invalidates the comparison almost
everyone makes first.

## The thinnest closure on the rung, and it holds

This page's transitive prerequisites are only `what-a-model-is`,
`open-weights-and-closed-models`, `where-your-words-go` and
`what-ai-actually-is`. Neither `how-a-language-model-works` nor
`why-context-is-not-memory` is available to it — so every piece of language-model
vocabulary has to be re-earned on the page or it is an unearned assumption and a
`spec-violation`. I audited this term by term rather than trusting the earlier
review's summary judgment, and it holds:

- **token** — "A piece is a word, or a fragment of a word, or a punctuation
  mark, and the pieces are called tokens." Defined at first use.
- **context** — "Everything the model is reading arrives as one block of
  text … and the field calls that block the context." Defined at first use, and
  the re-sending premise it leans on is genuinely in `what-a-model-is`, which
  says "Every turn, the whole visible conversation is fed to the model from the
  beginning" — I checked the prerequisite's own bytes for this rather than
  assuming the link earned itself.
- **KV cache**, **quantisation**, **offloading**, **runtime**, **mixture of
  experts**, **inference** — each glossed in the sentence that lands it.
  "Inference is the field's name for running a finished model rather than
  training one" is the model of how to do this.
- **zero-shot** is *avoided* rather than glossed: the page writes "scoring each
  on tasks it had been shown no worked examples of". That is a deliberate
  choice by a writer who knew the closure could not carry the term.

Outbound links to `the-hardware-that-runs-ai`, `open-weights-and-closed-models`
and `where-your-words-go` are deferrals or declared prerequisites, never leans
on undeclared material. Front matter matches §4 exactly: level, all three
prerequisites in order, outcome verbatim. All six mentions and all internal
links resolve on disk.

## What I verified at source

- arXiv 2401.04088 — "each token has access to 47B parameters, but only uses 13B
  active parameters during inference" is present verbatim in the abstract. The
  page attributes it to "the 2024 paper that popularised the design in open
  weights" and names no model, which is the right rot posture: the quote is a
  dated historical fact, not a spec sheet.
- arXiv 2212.09720 — all three quoted spans present verbatim: "3 to 8-bit
  precision", "19M to 176B parameters", and "almost universally optimal for
  total model bits and zero-shot accuracy". The page's gloss of what that means
  for a reader with fixed memory (a larger model compressed harder beats a
  smaller model kept precise) is a fair reading, and it is immediately hedged —
  "Methods have moved since, and how far a particular model can be pushed …
  is a question about that model."
- Arithmetic: one billion parameters at two bytes is two gigabytes. Correct.

## A defect the earlier review found, now confirmed repaired

The mechanics review's finding 3 recorded a garbled clause: "That program is
called a runtime, and **most of many of** the friendly desktop applications are
windows built around a small number of runtimes". I did not take the repair on
report. The page as it stands on disk reads "and many of the friendly desktop
applications", and `git show 79466a8` shows the edit that produced it. Fixed.
Finding 6's missing href for the 47B/13B quote is likewise landed — the quote
now carries `https://arxiv.org/abs/2401.04088`, which is the paper I checked it
against.

## Coverage and bounds

Every §4 must-cover is present, and the size ladder is delivered as the entry
demanded it — as *bands* keyed to machine shape ("A phone… A laptop's answer
depends entirely on which of the two shapes above it has… A desktop with a
plug-in card is capped by the card"), with no current model names anywhere. The
three reasons for local are all there and correctly ordered by how much they
depend on possession rather than promise, and the permanence argument is the
one the entry singled out.

The must-nots are respected conspicuously rather than accidentally: "This page
has no commands in it", with steps handed to `/tutorials` and tool choice to
`/tools`. No hardware shopping advice — the closest it comes is a structural
statement about the two machine shapes, which is physics, not a recommendation.

Rot check: no model names, no prices, no context-window figures, no benchmark
scores, no version numbers. The two numeric passages are both quotations from
dated papers. The page's own framing sentence — "local-LLM content is tool-first
and rots monthly, this page is physics-first" — is a claim the page actually
earns.

## Taken on trust

I did not open the six wiki entries this page mentions to confirm they carry
what the prose says they carry — specifically that `technique/quantization`
holds "measurements from one machine" and the reason the advertised width is a
floor. I confirmed the entries exist; I did not audit their contents. Every
sentence pointing at them stands without the link, so nothing here is
load-bearing on that.

Approve. The best thing about this page is invisible unless you compute its
closure: it is the page on the rung with the least available to assume, and
instead of leaning on a neighbour it re-derives the token loop from scratch and
tells you it is doing so. The final reframe — which of your requirements would
survive somebody else's decision — converts a benchmark argument nobody can win
into a procurement question anyone can answer.
