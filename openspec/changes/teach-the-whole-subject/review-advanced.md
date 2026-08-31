# Review — the advanced rung of the learn surface

Sealed review, 2026-08-30, by a fresh-context reviewer with no edit rights and
no authorship stake, covering the seven pages whose front matter says
`level: advanced`, read in the generated reading order (depth in the
prerequisite graph, then title): `how-inference-is-served`,
`what-safety-training-changes`, `looking-inside-a-model`,
`why-the-same-request-gives-different-answers`, `the-safety-debates`,
`what-it-costs-to-build-and-run-ai`, `how-to-think-about-what-comes-next`.

Verdict: **all seven pages pass, none rejected, with named fixes.** Every page
has a sendable sentence, quoted below. No false or misattributed claim was
found in roughly fifty literal-substring checks against fetched sources —
including every attribution of a position to a named person or organisation.
The findings that remain are metadata, vocabulary and one undeclared
dependency, all repairs measured in single lines. The rung is not of a piece —
two populations of pages are visible on the page before any history is
consulted — and that observation is recorded in full below, with the check
that confirmed it run only after the judgment was formed.

## Verdicts, in reading order

Each verdict names the sendable sentence verbatim, per
`specs/education-static`: *"A reviewer who cannot name that sentence SHALL
reject as `not-worth-reading`."* None of these is a courtesy nomination; where
a page had several candidates, the strongest is quoted and the runners-up
named.

**1. `how-inference-is-served` — pass, with two findings (F1, F2).**
Sendable: *"Input is cheap because it is parallel; output is expensive
because it is serial."* The single most quotable sentence on the rung, and
the page earns it: the whole pricing structure of the industry is derived
from one hardware asymmetry in under a thousand words. The findings against
it are real but small: its `mentions` metadata is wrong in both directions,
and it assumes vocabulary its prerequisite closure never taught.

**2. `what-safety-training-changes` — pass, with one finding (F3).**
Sendable: *"It installed something with a location, and a behaviour with a
location can be found and moved."* Runner-up: *"A refusal is not a gate."*
The page's three external citations were all verified verbatim against their
papers. Its closing three-way distinction — classifier blocked it / weights
make it unlikely / capability absent — is the sentence-level calibration this
rung exists for, and later pages correctly treat it as a load-bearing result.

**3. `looking-inside-a-model` — pass, no findings against the page itself.**
Sendable: *"A neuron that fires for three unrelated things is not a broken
neuron. It is what compression looks like from the inside."* Runner-up:
*"High probe accuracy, on its own, is a fact about the probe."* Thirteen
external citations, all verified, several to the granularity of body-text
quotes ("satisfying insight for about a quarter of the prompts we've tried";
"memorization, circuit formation, and cleanup"). The adversarial read is
below; the short version is that this page is the best calibration
performance on the surface.

**4. `why-the-same-request-gives-different-answers` — pass, with one minor
finding (F4).** Sendable: *"A numerically negligible difference becomes a
different answer by passing through one comparison."* Runner-up: the close —
reproducibility "is bought, not assumed." The four-cause structure is clean,
the one external citation (batch invariance) verified, and the evidence
section turns the mechanism into reader practice exactly as the rung's
purpose demands.

**5. `the-safety-debates` — pass, no findings against the page itself.**
Sendable: *"The question that sorts one of these arguments is not who is
right, but what would count as finding out."* Sixteen external citations
verified, including every quote attributed to a named person or camp — the
category where an error would have been worst. The adversarial read from
both directions is below.

**6. `what-it-costs-to-build-and-run-ai` — pass, with one minor finding
(F6a).** Sendable: *"Whether training or serving dominates a model's
lifetime cost is not a fact about the model but a fact about how many people
use it."* Runners-up, and this page has more genuine candidates than any
other on the rung: "the price is known in advance and the thing bought is
not"; "A product that meters you is telling you what its marginal cost is";
"A chokepoint made of a factory takes years to reproduce. A chokepoint made
of a minimum bet reproduces itself continuously." The boundary-drawing
section on energy numbers is the single best piece of numeracy teaching on
the site.

**7. `how-to-think-about-what-comes-next` — pass; separate capstone judgment
below.** Sendable: *"The alternative to a forecast is not silence; it is a
watchlist."* Runner-up, and arguably the sharpest four words on the rung:
*"A wall is a forecast too."*

## What was re-verified versus trusted

Method: every load-bearing source was fetched raw (50 URLs, all HTTP 200) and
checked by **literal substring** against a normalised copy — entities
decoded, tags stripped, whitespace collapsed — never through a summariser.
Four papers whose quotes live in body text were re-fetched as full-text HTML.
Where a first-pass substring came back absent, the surrounding bytes were
read before concluding anything; every initial absence resolved to
hyphenation ("pre-registered"), paraphrase-not-quotation, or body-vs-abstract
placement. **Zero fabricated or misquoted citations were found.**

| Claim | Status |
|---|---|
| Refusal direction: "13 popular open-source chat models", erase/add interventions, suffixes "suppress propagation" (2406.11717) | verified verbatim |
| Shallow alignment: "very first few output tokens" (2406.05946) | verified |
| Fine-tuning strips guardrails: "only 10 such examples at a cost of less than $0.20"; benign data "inadvertently degrade the safety alignment" (2310.03693) | verified verbatim |
| Probes 2016 (Alain & Bengio); control tasks, "word types with random outputs", selectivity (Hewitt & Liang) | verified, authors confirmed |
| Superposition sentence, quoted in full (transformer-circuits toy models) | verified verbatim |
| SAE features "more interpretable … than directions identified by alternative approaches" (2309.08600) | verified |
| Golden Gate feature "10× its maximum activation", self-identifies as the bridge; "knowing about lies, being capable of lying, and actually lying" caution | verified verbatim |
| SAEs not canonical (Einstein → scientist/Germany/famous person); shared author (Lee Sharkey) across 2309.08600 and 2502.04878 — the page's "neither critique comes from outside the programme" | verified on both author lists |
| Sparse probing baselines; "ground truth" absence claim (2502.16681) | verified |
| IOI: 26 heads, 7 classes, "faithfulness, completeness and minimality", "remaining gaps in our understanding" (2211.00593) | verified verbatim |
| ROME "middle-layer feed-forward"; rebuttal's two quotes incl. "may not always translate to insights about how to best change their behavior" (2202.05262, 2301.04213) | verified verbatim |
| Attribution graphs: "satisfying insight for about a quarter of the prompts we've tried", "small fraction of the mechanisms", dark matter, rhyme planning, "Published March 27, 2025" | verified verbatim |
| Zhang et al.: fit "a random labeling", unstructured noise (1611.03530) | verified |
| Grokking phases "memorization, circuit formation, and cleanup" (2301.05217) | verified verbatim |
| DAIR statement: authored by exactly the three people named; "real and present and follow from the acts of people and corporations"; "dangerous ideology called longtermism" | verified — see note below |
| CAIS statement sentence verbatim; Hinton and Bengio among signatories | verified |
| Salvi: "81.7% (p < 0.01; N=820 unique participants)"; "pre-registered"; without personalisation "statistically non-significant (p=0.31)" | verified verbatim |
| RAND: "no statistically significant difference in the viability of plans", "beyond the capability frontier", red-team study, published 2024-01-25 | verified |
| DeepMind specification-gaming definition verbatim; the boat/Coast Runners example | verified |
| Goal misgeneralization definition, quoted in full (2210.01790) | verified verbatim |
| Denison: all three quotes incl. "rewriting their own reward function" (2406.10162) | verified verbatim |
| Alignment-problem chain quotes incl. "difficult to align and may appear aligned even when they are not" (2209.00626) | verified verbatim |
| Power-seeking theorem quotes; same first author extended it (2206.13477), "neither fully observable, nor must trained agents…" | verified verbatim |
| Alignment faking: both halves of the abstract's own caveat, quoted in the page's order (2412.14093) | verified verbatim |
| Narayanan & Kapoor: all six quotes incl. both halves of the nonproliferation/open-source bind | verified verbatim |
| "Dangerous capability evaluations" / "alignment evaluations" (2305.15324); "capability thresholds called Critical Capability Levels" + CCL definition (DeepMind) | verified verbatim |
| Evaluation awareness: "clearly demonstrate above-random evaluation awareness", human baseline (2505.23836) | verified verbatim |
| AISI/US joint o1 evaluation: "limited period of pre-deployment access", findings "shared with OpenAI before the model was publicly released", December 2024 | verified |
| Llama 3 power-fluctuation quote, all three fragments (2407.21783, body) | verified verbatim |
| Cottier: "grown precipitously at a rate of 2.4x per year since 2016"; chips-and-staff sentence in full; 15-22%, 9-13%, "energy consumption (2-6%)" | verified verbatim |
| LLaMA inference-optimal quote in full (2302.13971, body) | verified verbatim |
| BLOOM: "433,195 kWh of electricity during training", 914 kWh, 230,768 requests, ~18 days, "without any batching", "idle in between user requests", 24.7/50.5 tonnes | verified verbatim — see note below |
| Gemini serving: 0.24 Wh, 0.26 mL, five drops, 33x, boundary list incl. "idle machine capacity" (2508.15734) | verified verbatim |
| Luccioni: text classification 0.002, image generation 2.907, "can vary by a factor of over 1450" (2311.16863, body table) | verified verbatim |
| Water: "can directly evaporate 700,000 liters of clean freshwater" + "kept a secret" in the same sentence (2304.03271) | verified verbatim |
| OWID data-centre series boundary, both quotes | verified verbatim |
| Epoch price series: title "Lowest inference prices at fixed performance", "ranging from 9x to 900x per year", 40x on PhD-level science, the persist caveat | verified verbatim |
| Epoch open/closed gap: average lag four months since January 2026 | verified |
| Epoch 2030 audit: "2e29 FLOP … feasible by the end of the decade", ~10,000-fold | verified verbatim |
| Sequoia: "Where is all the revenue?", railroads rebuttal, monopolistic pricing vs "commodity, metered per hour", September 2023 → nine months | verified |
| Steinhardt: $5000 prize pool per question, 6.9%, 12.7% predicted, 50.3% actual, "weren't aggressive enough" quote, "most humans would be below 50%", Samotsvety at 75th percentile, "paid them a high hourly rate", "progress still outpaced the forecast" | verified verbatim |
| Compute trends: 20 months pre-2010, ~6 months since, three eras (2202.05924) | verified verbatim |
| SuperGLUE: "surpassed the level of non-expert humans, suggesting limited headroom", "introduced a little over one year ago", GLUE author overlap (Wang/Singh/Bowman) | verified |
| Data wall v1: "will be exhausted soon; likely before 2026", submitted 26 Oct 2022; revision: "between 2026 and 2032, or slightly earlier if models are overtrained" | verified verbatim, both versions |
| Thinking Machines: batch invariance framing | verified |

Trusted rather than re-verified: Steinhardt's Berkeley-statistician
affiliation and Cahn's Sequoia partnership (bylines); the Epoch 2030 report's
"August 2024" publication date and the open/closed insight's "May 2026"
publication date (neither page renders a date in extractable text; both are
consistent with their own content — see F6); resolution of `mentions` and
internal links (build-gated, and the change's prior review measured all 57);
the serving page's uncited engineering claims (standard results —
quadratic-prefill/linear-cache, distribution-preserving speculative
decoding — checked against reviewer knowledge only, which is exactly the
problem F2 names).

Two verifications deserve a sentence each. **The DAIR statement**: this
reviewer's prior recollection was that four Stochastic Parrots authors signed
it, which would have made the page's "three of the authors" a dropped
attribution — the worst class of error available here. The fetched page lists
exactly the three the page names; the page is right and the reviewer's memory
was wrong. **BLOOM's kWh figure**: the paper's own Table 1 says 433,196 kWh
while its §4.2 prose says 433,195; the page quotes the prose verbatim, which
is the only version that survives a quotation check.

## Findings, by severity

**F1 — `how-inference-is-served`: `mentions` wrong in both directions.**
Measured: `concept/scaling-laws` sits in the front matter while the word
"scaling" appears nowhere in the body (grep: 1 hit, line 13, front matter).
Meanwhile the page teaches the KV cache, quantisation and speculative
decoding in named sections, and `concept/kv-cache`,
`technique/quantization` and `technique/speculative-decoding` all exist in
the wiki — none is listed. The mentions list feeds backlinks; the surface's
central KV-cache page is invisible from the KV-cache entry. One-line fix,
but it is the substrate contract being broken.

**F2 — `how-inference-is-served`: an acknowledged dependency that was never
declared.** The page uses "accelerator" (3 uses, first at "The accelerator
is saturated with arithmetic") and "matrix multiplications" with no gloss.
Its transitive closure — `how-a-language-model-works`,
`how-models-are-trained`, `what-a-neural-network-is`, `what-a-model-is`,
`learning-from-examples`, `what-ai-actually-is` — contains neither term
(grep across all six: zero hits for "accelerator"). The page that teaches
both, `the-hardware-that-runs-ai` ("The chip doing this arithmetic is called
an accelerator"), is not a prerequisite — yet the curriculum's own entry for
the hardware page says it "deliberately pre-seeds the prefill/decode
asymmetry that `how-inference-is-served` builds its whole page on" and that
its two-numbers frame "makes the advanced serving page land." The dependency
is written down in the map and missing from the territory. The in-order
reader never notices (the hardware page sorts earlier); the
prerequisite-following reader — the reader the front matter is a contract
with — meets undefined hardware vocabulary. Fix: declare
`the-hardware-that-runs-ai` (mechanics → advanced is a legal edge) or gloss
the one word. Historical note: the serving page predates the hardware page,
so this is a wave-2 integration gap, not an authoring error.

**F3 — "residual stream" is jargon by osmosis, twice.** Used at
`what-safety-training-changes:41` and `looking-inside-a-model:107`. Taught
nowhere on the learn surface (corpus grep: the only other occurrence is
incidental, inside `wiki/technique/rotary-position-embedding`). Not
wiki-linked; no meaning in the sentence or the sentence before. The term
arrives inside renderings of the refusal paper's own vocabulary ("residual
stream activations"), and the surrounding clause ("erase that direction from
the activations") carries enough for the sentence to survive — which is why
this is a finding and not a rejection. Compounding it: "activations" itself
reaches the reader of `what-safety-training-changes` untaught — its only
prerequisite exposure is `how-a-language-model-works:67`, where "the
activations" names the nonlinearities, a different sense; the correct sense
("the values flowing through the network on one input") is defined one page
too late, in `looking-inside-a-model`, which lists this page as its own
prerequisite. Fix: a six-word apposition at first use on
`what-safety-training-changes`.

**F4 — `why-the-same-request-gives-different-answers`: two unglossed minor
terms.** "Kernel" (four uses; nearest to a gloss is "A kernel computing a
sum over thousands of terms splits that sum across many cores") and
"experts" in the MoE section, which never get a noun ("a sub-network" would
do). Both meanings are partly inferable from context; neither passes the
term-of-art audit cleanly. Minor.

**F5 — the capstone's closing device is a forecast-shaped sentence.** "Next
year there will be a headline about a system that does not exist today,
doing something nobody can currently demonstrate." The entry's must-not is
"a forecast of its own; timelines." This is a prediction about the media
environment, not about capability, and it is constructed to be true under
every branch — but it is the one sentence a hostile reader can quote against
the page's own rule, on the page whose entire argument is that such
sentences should name what would count as a miss. Recorded as an observation
for the next editor, not a rejection; the banned word "inevitable" appears
nowhere on the surface (grep: zero hits).

**F6 — two as-of dates that can no longer be checked against their live
sources.** (a) Capstone: "one measurement published in May 2026" — the Epoch
open/closed insight renders no publication date; its own text ("Since
January 2026… an average of four months") is consistent with May 2026, and
the four-months figure is verbatim. (b) Capstone: "as of March 2025" on the
inference-price insight — the live page now says "Updated Nov. 20, 2025" and
shows no March date; the 40x and 9x–900x figures still match the updated
page, so the substance holds either way. Both sentences are the right shape
(dated asides doing exactly what the rot rules ask); the dates themselves
are the unverifiable part. Minor. **F6a** applies the same lens to the costs
page: its Epoch price quote carries no as-of date at all, in a paragraph
whose whole argument is that this series is "the most reliably misquoted
number in the subject" — the one place on the page where its own
date-and-source discipline slackens.

**F7 — observations outside the pages' control, recorded so they are not
lost.** (a) The repo's wiki dates Lighthill two ways: `concept/ai-winter`
says "Lighthill, 1972" (the survey is dated July 1972) while
`event/lighthill-report` says "published early in 1973" (the symposium
volume). Both true with the right verb; the capstone's "a 1972 one" matches
the entry it links. The two entries should agree on the convention. (b) The
curriculum's writer's note for `looking-inside-a-model` — that
`what-a-neural-network-is` "is not a prerequisite here, so this page may not
lean on it" — is stale: after the `how-a-language-model-works` front-matter
edit, that page sits in the transitive closure. Harmless (the page
establishes the premise for itself anyway), but the map should not carry a
false sentence about its own graph.

## The two contested pages, read adversarially from both directions

**`looking-inside-a-model`, read as a booster:** does it let interpretability
claim more than was measured? No — and the mechanism is structural, not
tonal. Every positive result on the page arrives chained to its own control
or self-critique: probes to Hewitt–Liang's control task; sparse autoencoders
to two 2025 negative results *from inside the programme* (verified: Lee
Sharkey appears on both the original SAE paper and the canonical-units
rebuttal, exactly as the page claims); the Golden Gate feature to the
authors' own caution about over-reading lying features; ROME's localisation
to the editing rebuttal, quoted at its most deflationary. **Read as a
cynic:** does it let "black box, nobody knows" stand? Also no — causal
interventions get their full weight (the bidirectional refusal intervention
is explicitly used to close off the readable-but-not-causal failure mode; the
grokked network is presented as a complete answered case), and the page's
final move hands the reader the test that separates the two ("what got
intervened on, and what happened when it did"). The two-kinds-of-not-knowing
section — which questions are yielding, which are not yet well-posed — is
precisely the calibration the curriculum entry calls the page's hardest work,
and it is done. This page could be shown to a working interpretability
researcher and to a sceptic and both would call it fair. It models the
site's standard rather than merely obeying it.

**`the-safety-debates`, read from the risk-sceptic side:** the existential
chain gets four paragraphs of steelman — but the theorem in it is presented
at its actual strength ("proved about a class of systems that does not
obviously contain a trained network"), the alignment-faking result is quoted
with the authors' own weakening *first* and the page pauses on it ("Stop
there and the result evaporates") before completing the quote, and the
constructed-settings objection is stated before the response. Nothing is
smuggled. **Read from the risk-taking side:** the critics get the same
treatment — normal-technology is given its strongest form including its own
self-acknowledged counter, the uplift study that found nothing is reported
with its "currently" doing visible work, and the attention-economy objection
opens and nearly closes the page. **Can this reviewer tell which side the
author holds? No — and here is the evidence that supports "no" rather than
merely asserting it.** (1) Each camp's weakest popular argument is dismissed
in deliberately parallel constructions ("Nobody making the argument makes
that one" / "The serious critics do not make that one either"). (2) Each
camp's flagship empirical result carries its own strongest objection,
sourced to the result's authors rather than to the opposing camp. (3) The
two structural asymmetries run in opposite directions and roughly cancel:
the present-harms camp gets the first and last word of the framing, while
the specification-gap mechanism — the risk side's engine — gets a full
section as settled mechanics; both placements are mandated by the
curriculum's must-cover, so neither is authorial tilt. (4) The
remedies-conflict close is sourced to the sceptic side but deployed to deny
both camps an exit. One residual observation rather than a finding: the
fact/value sort itself quietly favours a third position — the analytic
stance — over both camps; the curriculum mandates the sort as the reader's
tool, and a page that must end somewhere ends on method. That is the site's
declared temperament, not a hidden author.

## The capstone, judged separately

The brief's three extra tests, plus §3's bans:

**Not a valedictory recap, and not a forecast** — with the one
forecast-shaped sentence recorded as F5. The page opens on material used
nowhere else (a graded forecasting contest with a prize pool), and every
reference back down the ladder is spent rather than summarised; the page
even states its own method for this: "That page banked a scepticism. This is
where it gets spent."

**Does it hand the reader something new that only the ladder makes
possible? Yes, twice.** The watchlist is the obvious one: each of its four
instruments is only usable with a caveat installed by a different
prerequisite (the benchmark-replacement cycle survives its three caveats
only for a reader who has `what-a-benchmark-measures`; the compute doubling
is read as a spending curve via the money wall; the open/frontier gap is
read through the debates page's irreversibility argument; prices through
`ai-and-work`'s diffusion lens). The less obvious one is better: turning
`why-bigger-got-better`'s extrapolation critique against the pessimists —
"A wall is a forecast too" — is a genuinely new move that no single
prerequisite contains, and the walls section then grades all three walls
against history (moved when re-measured / never yet bound, audit dated /
bound twice, settled nothing) rather than adjudicating them.

**Usable next year on a technology that does not exist yet? Yes.** The
three closing questions — what is it extrapolating, which curve is it
about, what has its author agreed to be wrong about, by when — contain no
AI-specific term. The watchlist items are AI-specific; the discipline is
not, and the page knows which of the two it is teaching.

**Is its sendable sentence the best on the surface?** The honest comparison:
as a single quotable, "Input is cheap because it is parallel; output is
expensive because it is serial" travels furthest, and "A wall is a forecast
too" is the sharpest four words on the rung. But the test the capstone must
pass is different — the closing line of a whole argument — and "The
alternative to a forecast is not silence; it is a watchlist" is the only
sendable sentence on the rung that hands the reader a practice rather than a
fact. Judged as what the last sentence of a curriculum should do, it is the
best on the surface, and this reviewer says so having tried to rank it
lower. The page passes the capstone test.

## Not of a piece — and the check that confirmed it

Formed before any history was consulted: the rung reads as two populations.
`how-inference-is-served`, `what-safety-training-changes` and
`why-the-same-request-gives-different-answers` are compressed, thesis-first,
assertion-driven — they open on the mechanism ("There are four independent
causes…") and cite almost nothing. `looking-inside-a-model`,
`the-safety-debates`, `what-it-costs-to-build-and-run-ai` and the capstone
are scene-first — a tensor name, a dated statement, a power grid flexing, a
paid forecasting contest — quote sources verbatim and constantly, and wire
themselves densely into the surface. Measured: 881–976 words with 0–3
external links and 0–1 internal links for the first group; 1,803–2,826 words
with 9–16 external and 3–12 internal links for the second.

Checked afterwards, as instructed: git dates split exactly on this grouping.
The lean three are seed-wave (2026-08-28, commits `c600e57`, `30cfd12`); the
dense four are curriculum-wave (2026-08-30, `7db206e`, `5c5914c`, `edd5a58`,
`5dcf76b`).

Is the difference a defect? The §3 voice — flat declaratives, uncertainty
stated as fact, no recap closers — holds across all seven, and part of the
register gap tracks subject matter: mechanism pages may assert textbook
serving facts; dispute pages must quote. But the rung's own definition is
the reader who "knows which quantities are measured versus inferred," and a
page with zero citations sits oddly under that banner:
`how-inference-is-served` asserts a dozen checkable engineering claims
(quadratic prefill, linear cache growth, distribution-preserving speculative
decoding — all correct, so far as this reviewer's own knowledge reaches,
which is precisely the problem) with nothing a reader could check. The
recommendation is not to rewrite the seed three — their compression is a
virtue the new four occasionally lack — but a citation pass on the serving
page and the F1–F4 line fixes would bring the older population up to the
standard the newer one set.

## What the rung gets right, stated as plainly as the defects

- **The citation record is clean.** Roughly fifty literal-substring checks,
  including every named-person attribution, and not one failed. On pages
  carrying this citation load — and in a repository whose own method notes
  warn that extractors fabricate plausible quotes — a zero-defect result is
  the single most important fact in this review.
- **Calibration is not performed, it is built.** The two contested pages
  survive adversarial reading from both directions because their structure —
  every result chained to its own strongest objection, sourced to the
  result's authors — does the calibrating. "Enthusiasm without evidence and
  cynicism without evidence are the same defect" is enforced here at the
  paragraph level.
- **The surface's connectedness does real work.** `looking-inside-a-model`
  re-reads the refusal direction the reader already owns as evidence of a
  different kind; the costs page pays off four declared prerequisites by
  name; the capstone's watchlist is unusable without the ladder. This is
  what the curriculum meant by pages leaning on each other, executed.
- **Quantities are handled the way the rung promises.** The costs page's
  boundary-drawing (BLOOM's own doubling under a wider boundary; two careful
  measurements an order of magnitude apart "and most of the distance…
  utilisation and accounting"; the OWID series' own custodians quoted on
  what it cannot separate) teaches the measured-versus-inferred distinction
  better than any definition of it could.
- **Every page has a sentence worth sending**, and three of them — the
  pricing asymmetry, the compression-from-the-inside line, and the
  watchlist — are as good as anything on the surface, including the
  exemplars the curriculum itself quotes.
