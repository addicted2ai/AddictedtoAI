# Review — the foundations rung of `teach-the-whole-subject`

Review of the eleven published `level: foundations` pages, 2026-08-30, by a
fresh-context reviewer with no edit rights and no authorship stake, against
`openspec/curriculum/learn.md` (§2 foundations, §3, each page's §4 entry) and
the change's `specs/education-static/spec.md`. Verdict: **ten of eleven pages
pass; one page fails the rung's own admission test and is rejected
`spec-violation`.** Every page has a genuine sendable sentence — there are no
`not-worth-reading` rejections on this rung — and the sourcing survived
adversarial literal-substring verification at a rate this reviewer did not
expect: roughly forty decisive external facts were re-fetched and checked, and
the harvest was one rejection, two real accuracy defects, and a handful of
small ones. The findings below are sorted by severity and each carries its
measurement.

The eleven, in the generated reading order (level, then prerequisite depth,
then title — replicated from `lib/learn.mjs ladder()` by script, not assumed):

| # | slug | depth | words |
|---|---|---|---|
| 1 | `open-weights-and-closed-models` | 2 | 1,289 |
| 2 | `what-a-neural-network-is` | 2 | 1,157 |
| 3 | `ai-and-work` | 2 | 2,081 |
| 4 | `where-your-words-go` | 2 | 1,155 |
| 5 | `how-a-language-model-works` | 3 | 761 |
| 6 | `how-machines-represent-meaning` | 3 | 1,265 |
| 7 | `the-kinds-of-models` | 3 | 1,143 |
| 8 | `what-models-are-trained-on` | 3 | 1,357 |
| 9 | `when-you-cannot-trust-your-eyes` | 4 | 1,678 |
| 10 | `why-context-is-not-memory` | 4 | 940 |
| 11 | `getting-good-answers` | 5 | 1,462 |

## Verdict per page, with the sendable sentence

The spec: *"A reviewer who cannot name that sentence SHALL reject as
`not-worth-reading`."* Each sentence below is quoted verbatim from the page;
all but one are the sentence the page itself sets in bold, which is its own
small piece of evidence that the writers understood the test.

1. **`open-weights-and-closed-models` — pass.** "A closed model can be
   switched off. An open one can only be regretted." Every quoted licence
   span verified verbatim against the Llama 4 Community License text; OSI
   definition verified verbatim; the staged-release paraphrase is faithful to
   the report's own words as carried (and sourced) by the wiki entry.
2. **`what-a-neural-network-is` — pass.** "A neural network is unreadable for
   the same reason it works: everything it knows is stored across the same
   weights as everything else it knows." The strongest page on the rung. Its
   back-references are true: `what-a-model-is` really does call the numbers
   "weights" in passing, and the filing cabinet really is in
   `learning-from-examples`. Gradient descent is named and given its meaning
   in the same sentence, exactly as the entry ordered.
3. **`ai-and-work` — pass, with the rung's two worst accuracy findings**
   (2 and 3 below). "The cash machine never decided whether tellers kept
   their jobs. What decided was whether cheaper branches made banks want more
   branches, and that was never a question about the machine." At 2,081 words
   it is the longest page on the rung; judged by §3's two named failures
   rather than by count, it has one argument (jobs are task bundles;
   projections are not signals) and its examples are evidence, so the length
   is the answer, not the problem.
4. **`where-your-words-go` — pass.** "Of everything your message passes
   through, the model is the only part built to forget it." ("Opt-out is the
   name for a switch whose default position is on" is a second sentence
   people will repeat.) Mechanism-only on a topic that invites both alarm and
   reassurance; it delivers neither, as the entry demanded. The D8 worry that
   this page would prove too thin did not materialise.
5. **`how-a-language-model-works` — REJECT, `spec-violation` (jargon before
   meaning).** Its sendable sentence is real and is quoted by curriculum §3
   itself: "attention is the only operation in the stack that moves
   information between positions." The rejection is finding 1 below.
6. **`how-machines-represent-meaning` — pass, one overclaim** (finding 4).
   "Nothing here was ever taught what a word means, because meaning was
   traded for position, and position is something arithmetic can measure."
   The §4 note asked for a sendable sentence about meaning becoming geometry
   that is true; this is it. "Uncanny at roughly, unreliable at exactly" is a
   bonus. The king−man+woman folklore is handled in words, no notation, and
   the exclusion-rule debunk is real — the wiki entry holds the Nissim
   measurements (0.74 → 0.21) exactly as promised.
7. **`the-kinds-of-models` — pass, one conformance note** (finding 9).
   "Pictures paired with descriptions, read in one direction, train a machine
   that names what it sees. Read in the other direction, the same pairs train
   a machine that paints what it is told." The recommender section — "the
   software the word no longer points at" — is the entry's hardest must-cover
   beat, landed.
8. **`what-models-are-trained-on` — pass, one minor imprecision** (finding
   5). "A quality filter does not measure quality. It measures resemblance to
   text that somebody already decided was good." Every number on this page
   checked out against the papers' own text: 51.3% US-hosted; 3.4%/0.06%/
   0.03%/0.1% for India/Pakistan/Nigeria/Philippines; 45TB → 570GB; the
   61-word sentence 60,000 times; 42/32 vs 6.2/7.2 blocklist removal; ~40
   contractors, Upwork/ScaleAI, 72.6 ± 1.5% agreement; lesbian/gay among the
   highest-PMI filtered identities. This page is what the sourcing rule was
   written to produce.
9. **`when-you-cannot-trust-your-eyes` — pass, one quote-framing note**
   (finding 6). "Any tell good enough to teach is good enough to train
   against." The blink paper, the Scientific American scoping, the GAN
   coin-flip solution, the liar's-dividend sentence, the regeneration-attack
   result and both C2PA quotes all verified verbatim — including the
   watermark-fallback answer in C2PA's own FAQ, which is exactly where the
   page says it is.
10. **`why-context-is-not-memory` — pass.** "appending is cheap; editing the
    beginning is not." The terms this page uses without defining them —
    system prompt, tools, retrieval — are all taught by `what-a-model-is`,
    which sits in its transitive closure; the term-of-art audit passes where
    its seed-wave sibling's fails. Lost in the Middle is represented
    accurately, including the long-context-models clause.
11. **`getting-good-answers` — pass.** "A trick that does nothing on average
    still changes plenty of single answers, and a single answer is all anyone
    ever checks." That sentence is also the correct summary of the paper it
    cites, which this reviewer confirmed against the abstract's own text. The
    politeness study, the threats/tips report (four researchers, August 2025,
    two benchmarks, the Brin endorsement) and both wiki deferrals
    (in-context-learning's two disagreeing experiments; chain-of-thought
    faithfulness) all check out. The page holds the D8 line: mechanism per
    tip, no steps, no cookbook.

## Findings, sorted by severity

**1. `how-a-language-model-works` — `spec-violation`: jargon before meaning,
naming "vector" and "embeddings".** The spec: *"On orientation and
foundations pages, a term of art SHALL be given its meaning in the sentence
that introduces it or the sentence before."* The page's third section is
headed "Embeddings: positions, not meanings yet" and opens: "Each token id is
looked up in a table, giving a vector." Neither term is given a meaning
anywhere on the page. Measured, not assumed: `vector` and `embedd*` occur
zero times in the page's entire transitive prerequisite closure
(`what-a-model-is`, `what-a-neural-network-is`, `learning-from-examples`,
`what-ai-actually-is` — grepped, no matches). The reader first receives the
meaning — "vector being the field's word for the list of numbers" — on
`how-machines-represent-meaning`, which sits one position *later* in the
generated reading order. The same audit also fails for "position-wise
feed-forward network", "normalisations" and "activations" ("The feed-forward
layers, the normalisations and the activations all act on one position at a
time" — three named parts, no meanings, no prerequisite teaches them), and
"the k best tokens … whose probabilities sum past p" uses k and p as bare
variables on a rung whose admission test says numbers in sentences, not
notation. This is a seed-wave page that §4 carried onto the rung with a
front-matter-only edit ("Body untouched"), so the defect is the curriculum's
as much as the page's — but the spec grants no body-untouched exemption, and
the rung is defined by what a page assumes. The fix is small and an author's:
a defining clause for vector ("a list of numbers" costs six words), a
plain-language sentence before the embeddings heading, and either define or
cut the three part-names. Until then the hinge page of the mechanism spine is
written one rung above the readers it is addressed to.

**2. `ai-and-work` — accuracy: the BLS teller figure is unverifiable as
stated and appears misdated.** The page: "The US Bureau of Labor Statistics
[puts the number of tellers at 339,200 in 2025]." Measured: the cited OOH
page returns 403 to every anonymous route this review could take (direct
fetch, two user agents, the Wayback Machine was down for the attempt); the
`blsmon1.bls.gov` mirror is frozen at the 2020-base edition; two independent
search extracts of the live page agree the current edition is 2024-based
("projected to decline 13 percent from 2024 to 2034") and one reads "Tellers
held about 347,400 jobs in 2024." No BLS source reachable to this review says
339,200, and no OOH edition states employment "in 2025" — the handbook
reports base-year (2024) employment. Extractor readings are exactly what this
project distrusts, so the finding is stated at its honest strength: the
figure could not be confirmed anywhere, the year is almost certainly wrong,
and the sentence needs re-verification against the live page by someone who
can reach it. The surrounding argument does not depend on the exact figure.

**3. `ai-and-work` — accuracy: the Canaries caveat paragraph mischaracterises
the study's primary exposure measure.** The page: "the exposure ranking is
built from what people were observed asking an assistant to do rather than
from anything the occupations themselves report." Measured against the PDF's
own text (November 13, 2025 version — the 16%, ages 22–25, ADP, six facts,
stable-experienced-employment and the "may in part be influenced by factors
other than generative AI" caveat all verified verbatim): the paper uses two
exposure measures, and the primary one — the one Figure 4's headline 16%
estimate is built on ("Exposure quintiles use Eloundou et al. (2024) GPT-4
measures") — is model-*rated* exposure of O*NET occupational task data, which
is precisely "what the occupations themselves report", rated by a model, not
observed usage. Observed Claude conversations are the *second* measure, which
the paper says "matches the findings … closely." Both halves of the page's
contrast are wrong for the measure that produced the number it quotes. The
irony is that the sentence sits in the paragraph whose whole job is epistemic
precision about that study. Fix: describe the primary measure honestly (tasks
rated for exposure by a model, validated against observed usage) — the
paragraph's conclusion survives.

**4. `how-machines-represent-meaning` — accuracy: "every" overclaims the
shared-map bridge.** The page: "That is the bridge under every image
generator that takes words." Measured: Imagen's own abstract — "generic large
language models (e.g. T5), pretrained on text-only corpora, are surprisingly
effective at encoding text for image synthesis" — is a frontier
counterexample: its prompt encoder never shared a map with images. The
weaker claim (the prompt becomes a position that steers generation) is
universal; the specific mechanism the paragraph teaches (captions and
photographs pushed onto one shared map) is common but not universal. "Every"
→ something honest like "the bridge under the image generators most people
met first", or teach the position-steers-generation form as the universal
one.

**5. `what-models-are-trained-on` — minor: "two or three times each" is
false for one of the four curated collections.** GPT-3's Table 2.2 sampling:
WebText2 2.9 epochs, Books1 1.9, Wikipedia 3.4 — but Books2 0.43, less than
once, indistinguishable from the crawl's 0.44. "The GPT-3 paper sampled the
collections it judged higher quality two or three times each, the crawl
itself less than once" is right in direction and wrong in the word "each".
The page's point (composition is a set of dials somebody set) is untouched.

**6. `when-you-cannot-trust-your-eyes` — minor: the blink quote drops a
qualifier outside the quotation marks.** Source sentence: "as **most**
training datasets do not contain faces with eyes closed." The page quotes the
verbatim contiguous span "training datasets do not contain faces with eyes
closed" — the quotation itself is honest — but introduces it as "the reason
in a line", absolutising what the authors qualified. One word ("most") would
make it exact.

**7. `open-weights-and-closed-models` — minor: the 700-million clause is
tested once, at release.** The licence conditions the big-company carve-out
on MAU "on the Llama 4 version release date"; the page's paraphrase ("Any
company whose products had more than …") reads as an ongoing test. The three
quoted spans in that sentence are all verbatim; the paraphrase around them
loosens the trigger.

**8. `ai-and-work` — minor: "using AI for any business purpose" broadens the
Census question.** The survey asked about use "in producing goods or
services" (verified in the working paper's own text; 3.7% → 5.4%,
September 2023 → February 2024, the substitution finding and the
few-employment-cuts finding all verified verbatim).

**9. `the-kinds-of-models` — curriculum conformance: the embedder sentence
defers to the wrong place.** §4: "one sentence, deferring to
`how-machines-represent-meaning`." The page's one sentence defers to
`/wiki/concept/embeddings` instead and never links the learn page. As
shipped this is arguably the better link — the title sort places the meaning
page *before* this one, so the mandated deferral now points backward — but
§0's rule is that a deviation amends the curriculum in the same commit, and
nothing was amended. Either link the learn page or amend the entry.

**10. Progression — the generated order opens the rung with governance, and
the mechanism spine is split.** Confirming, for this rung as shipped, what
`review.md` finding 4 already established about the sort: positions 1, 3 and
4 are Area-F pages (`open-weights-and-closed-models`, `ai-and-work`,
`where-your-words-go`), so the reader meets release postures before meeting a
neural network, and the network-to-language-model step is interrupted by a
two-page detour through work and privacy. Measured against the guarantee, no
harm: all three d2 Area-F pages assume only orientation pages, and every
prerequisite of every page appears earlier in the order (checked by script).
Measured against the maintainer's word — *progression* — the rung's first
half is a shuffle, and the lever review.md named (within a depth band, the
title decides) has still not been pulled by anyone choosing titles. The
back half (meaning → kinds → trained-on → eyes → context → answers) is
genuinely a staircase, and `getting-good-answers` is the right last page.

## Voice: the eleven are not of a piece, and the seam is measurable

Committed to before checking anything: `how-a-language-model-works` (5) and
`why-context-is-not-memory` (10) are a different hand from the other nine.
The nine open on a concrete scene (a bank window in 1985, a message being
sent, a downloaded file, a photo app finding a beach), define every term in
the sentence that lands it, bold exactly one sentence, and close on a
cadence. The two open on flat mechanism statements ("A language model does
exactly one thing…", "A model's input is one flat sequence of tokens…"), run
denser and shorter (761 and 940 words against a new-page median of ~1,265),
use bulleted enumerations and bold mid-prose, and close with "The mental
model to keep" / "The working model" headers. The two are also where the
rung's only term-of-art failures live — and only one of the two actually
fails, because the context page's undefined terms happen to be taught by its
transitive closure and the language-model page's are not.

The honesty caveat: this grouping was not fully blind, because curriculum §4
labels both pages "existing" and the reviewer read §4 before the pages, as
the brief required. The check after committing: git agrees precisely — both
were authored 2026-08-28 in the seed waves, all nine others on 2026-08-30
against this curriculum, and the only 08-30 touch to the language-model page
was the mandated front-matter edit. The seam is real, it is the seed-wave /
curriculum-wave boundary, and finding 1 is its cost. The context page shows
the two voices can coexist; the language-model page shows what happens when
an older page's assumptions are not re-audited for the rung an edit moves it
into contact with.

## What was re-verified versus trusted

Everything below marked *raw* was checked by literal substring against bytes
this review fetched itself (HTML, license text, or PDF text extracted by its
own script); *extractor* means a search-engine or summariser reading, which
this project treats as untrusted; *local* means checked against files in this
repository.

| Claim | How checked | Result |
|---|---|---|
| Generated reading order, depths, closures | local, script replicating `ladder()` | as tabled above |
| Front matter: outcomes and prerequisites vs §4, all 11 | local, read side by side | all verbatim / exact |
| Back-references ("weights in passing", filing cabinet, "what did it learn, and from what?", error-rate-tracks-writing) | local, grep of prerequisite pages | all present, near-verbatim |
| Llama 4 licence: date, definition, 700M, "Built with Llama", incorporation by reference, "Meta's proprietary Llama 4", grant wording | raw (Meta's GitHub copy of the licence) | all 7 verbatim; see finding 7 |
| OSI OSAID v1.0 three components | raw | verbatim |
| GPT-2 report concession, 3-karma WebText, nine months | local (wiki entry quotes the report; report PDF itself defeated text extraction — custom font encoding, absence unproven) | faithful |
| Mistral flagship licence fact, DeepSeek both licences | local (wiki facts) | resolve; Apache 2.0 / MIT + prior proprietary |
| GAN 2014: D = 1/2, maximise D's mistake | raw (abstract) | verbatim |
| Blink paper 2018, 3 authors, "training datasets do not contain faces with eyes closed" | raw (ar5iv body) | verbatim span; see finding 6 |
| SciAm 2020, Lyu, "lack of realistic eye-blinking in the early generations" | raw (across a mid-phrase line wrap) | verbatim |
| Liar's dividend "flows, perversely, in proportion to success in educating…" | raw (California Law Review) | verbatim |
| Watermark regeneration attack; semantic marks resist | raw (abstract) | accurate |
| C2PA "tamper-evident, cryptographically signed data structures"; nutrition label; watermark fallback for stripped credentials | raw (c2pa.org + FAQ) | all verbatim |
| C4 study: 51.3% US, country percentages, patents.google.com, machine-translated patents, 42/32/6.2/7.2, lesbian/gay PMI | raw (ar5iv body) | all exact |
| GPT-3: 45TB→570GB, WebText classifier method, mixing epochs | raw (ar5iv body) | exact; see finding 5 |
| Dedup: 61-word sentence, 60,000 times, C4 | raw (abstract) | exact |
| InstructGPT: ~40 contractors, Upwork/ScaleAI, screening, US/SE Asia, 72.6±1.5% | raw (ar5iv body) | all exact |
| AP–OpenAI July 2023, "licensing part of AP's text archive" | raw (AP press release) | verbatim |
| Model collapse: replacement demo vs accumulation result | local (wiki entry, quoted and sourced) | as the page states |
| Bessen: 20→13 tellers 1988–2004, 43% branches, 98% looms, weaving jobs up, wages "rose sharply compared with those of other workers", "cash handling became less important…", coordination across looms | raw (IMF eLibrary full text) | all exact |
| BLS tellers 339,200 in 2025 | cited page 403; mirror frozen at 2020 edition; two extractor reads say 2024 base, one says 347,400 | **unconfirmed — finding 2** |
| Frey–Osborne: Sept 2013, 702, 47%, "We make no attempt to estimate how many jobs will actually be automated", "unspecified number of years, perhaps a decade or two" | raw (PDF, own extractor) | all verbatim |
| Census: 3.7→5.4, dates, substitution, few employment cuts | raw (PDF, own extractor) | exact; see finding 8 |
| Copilot experiment: 55.8%, recruited, HTTP server in JavaScript | raw (abstract) | verbatim |
| Support agents: 5,172, 15%/hour, skill gradient | raw (abstract) | exact — including the count this reviewer misremembered as 5,179 |
| Canaries: Nov 13 2025, 3 authors, ADP, six facts, 22–25, 16%, caveat sentence, stable experienced employment | raw (PDF, own extractor; fi-ligatures stripped) | exact; see finding 3 for the measure characterisation |
| Lost in the Middle: U-shape, "even for explicitly long-context models" | raw (abstract) | accurate |
| Politeness study: 3 languages, findings | raw (abstract) | near-verbatim |
| Threats/tips report: Aug 2025, 4 authors, 2 benchmarks, no significant effect, per-question variance, Brin quote | raw (abstract) | all verbatim |
| Imagen text-only encoder (finding 4's counterexample) | raw (abstract) | verbatim |
| In-context learning "two experiments that disagree"; CoT faithfulness | local (wiki entries) | present, sourced |
| Nissim analogy-exclusion measurements | local (wiki entry) | present: 0.74→0.21 |
| Notation/equation sweep, all 11 pages | local, character-class grep | clean (k/p in finding 1 is the only borderline) |
| Currency-literal sweep, all 11 pages | local, name grep | clean: every model/vendor mention is dated or transcluded |

Trusted without independent re-verification: that the build's mention
resolution, cycle check and level check pass (the corpus is on `main`); the
figures inside wiki entries this review read for deferrals (the entries cite
their sources; re-verifying the whole wiki is not this review's scope); and
the two extractor readings quoted in finding 2, which are labelled as such
precisely because they are not trusted.

## The rung's progression and end-capability

§2's bar: after foundations the reader "reasons causally — predicts the
failure, explains the quirk, stops asking 'why did it do that?'" Judged page
by page, the rung delivers it. A reader who finishes the eleven can predict
letter-counting and rare-word failures (5), middle-of-context misses and
the futility of arguing (10, 11), the obscure-fact failure from the supply
side (8), opposite-meaning retrieval (6), why generated media stopped being
spottable and what a missing credential does not mean (9), what a "memory"
feature stores and where chats actually go (4, 10), what possessing weights
does and does not enable (1), and why the same employment headline keeps
being wrong (3). The causal chains connect across pages and the connections
were checked: the recaps are accurate to the pages they recap, which is the
thing that makes a ladder more than a pile.

Nothing on the rung repeats unearned. The one deliberate near-repeat —
arguing-appends, taught in `why-context-is-not-memory` and applied in
`getting-good-answers` — is the curriculum's own instruction ("imported from
the context page, applied"), and the second page re-derives rather than
restates.

Coverage: A holds four pages (2, 5, 6, 7), C one (8), D two (10, 11), E one
(9), F three (1, 3, 4). Area B is empty on this rung by design — history is
orientation's — and no §4 foundations entry is unwritten.

Two things hold the rung below "shining example" as it stands: the rejected
hinge page (finding 1) — the one page most readers will arrive at first from
the chatbot question is the one page written above the rung's reader — and
the first-half shuffle (finding 10), which is the sort's doing, not any
writer's. Both have small, already-identified fixes. The accuracy findings
(2, 3) are one page's and are repairable in two sentences.

## What the rung gets right, stated as plainly as the defects

- **Every page passes the sendable-sentence test, and most pass it in
  bold.** The writers did not nominate sentences for this review to find;
  they built the pages around them. Two of the eleven sentences are quoted
  in curriculum §3 as the surface's exemplars, and the other nine hold that
  bar.
- **The sourcing is real.** Around forty decisive external claims were
  re-fetched and checked by literal substring, most against the sources'
  own bytes, through HTML entities, a mid-phrase line wrap, fi-ligatures
  and one PDF that defeated extraction entirely. The failure rate was four
  findings, two of them one word wide. Pages 8 and 9 in particular are
  written the way the sourcing rule dreamed: the quote is where the page
  says it is, saying what the page says it says.
- **The currency discipline held.** Zero undated model facts, zero prices,
  zero benchmark scores; the one volatile value on the rung rides a
  transclusion (`org/mistral-ai#flagship_license`), and every named model is
  a dated historical event. These pages will not rot the way their subject
  matter wants them to.
- **The connective tissue is load-bearing and true.** Every "you already
  know" was checked against the page it points to and none was found
  wanting. The wiki deferrals land on entries that actually contain the
  measurements deferred to.
- **The voice, on the nine curriculum-wave pages, is what the editorial spec
  asked for** — plain, confident, uncertainty stated as fact, no hedges, no
  recaps — sustained for eleven thousand words across nine different
  subjects by what git says were nine separate executions. That is the
  hardest thing here to do and the easiest to fail quietly, and it did not
  fail.
