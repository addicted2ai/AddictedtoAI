# Review — the learn surface as one work

Whole-surface review, 2026-08-30, by a fresh-context reviewer with no edit
rights and no authorship stake. All 37 pages were read in full, in the
generated reading order, in one pass — 57,531 words, computed and read as a
reader would meet them. The four rung reviews running in parallel were not
read, and this file does not depend on them.

The question this review exists to answer: **does someone who starts at
`what-ai-actually-is` and finishes at `how-to-think-about-what-comes-next`
end up with a thorough understanding of AI?**

## Verdict: yes, with named gaps

The reader who finishes this surface understands AI — not a list of facts
about it, but the causal machinery: why a model fails where it fails, what a
headline claim is actually a claim about, and how to weigh the people
arguing about what comes next. The maintainer asked for a coherent
progressive surface encompassing the subject top to bottom, approachable to
non-technical readers, such that a person who knows nothing ends with a
thorough understanding. Measured against that sentence, the surface
delivers. The through-lines are real and load-bearing: *learned from
examples, not written by hand* (page 1) → *the pile is the world* (2) → *a
model is a fixed array of numbers* (3) → *nothing in the process that
produces an answer checks the answer* (8) → *there is only one field* (18)
→ *the objective is a proxy* (22) → *prediction without explanation* (30) →
*what would count as finding out* (35, 37). Each is planted once, paid off
repeatedly, and the capstone spends all of them by name. The ending lands as
an ending.

The gaps are nameable, and they are listed below with everything else found.
None of them reverses the verdict.

## What was measured rather than trusted

| Claim | Independently measured |
|---|---|
| Generated reading order | Replicated `ladder()` from `lib/learn.mjs` over front matter: level, then prerequisite depth, then **title** (`localeCompare`) — note: title, not slug. 37 pages; first `what-ai-actually-is`, last `how-to-think-about-what-comes-next`; rungs 8/11/11/7 |
| In-order guarantee | 0 pages appear before any of their prerequisites; 0 missing prerequisites |
| Size | 57,531 words total (front matter, link targets, transclusions stripped). Rung subtotals: orientation 9,136 / foundations 14,288 / mechanics 21,804 / advanced 12,303. Spread 681–3,532 words/page. ~4 hours' reading |
| Register split | Ten pages carry 2–7 bullet-list lines, 3–13 bold spans, and 3.7–12.2 em-dashes per 1,000 words. The other 27 carry **zero** bullet lines, 0–1 bold spans, and 0–2 em-dashes per 1,000 — with a single exception, `where-your-words-go` (5 bullets, 5 bold, 1.7 em-dash/1k), which sits between the registers on two of three metrics. No other page is ambiguous |
| Link graph | 92 learn→learn prose links. 9 point forward in the reading order, every one framed as a deferral ("a subject of its own"), never as an assumption. 8 pages have zero inbound prose links: the capstone and costs page (terminal by design) but also `ai-and-the-law`, `how-ai-systems-get-attacked`, `what-a-reasoning-model-does`, `how-a-model-uses-your-documents`, `how-image-generation-works`, `running-a-model-yourself` — no other page ever routes a reader to them |
| Subject-term absences | Counted, not sampled: `AGI` / "artificial general intelligence" — 0 occurrences across all 37 pages. Robotics / self-driving / autonomous vehicles — 0. Consciousness / sentience — 0. "Superintelligence" appears only inside `the-safety-debates`, only inside quotations from sources, never defined |

## The grouping, formed before checking history

Per the review brief, a view on whether the surface is of a piece was
committed before any date was looked up. The view: **two registers, cleanly
split, and the essay register splits again by length and sourcing.**

- **Group A (10 pages)**: `what-a-model-is`, `why-models-are-confidently-wrong`,
  `how-a-language-model-works`, `why-context-is-not-memory`,
  `how-models-are-trained`, `what-a-benchmark-measures`, `what-an-agent-is`,
  `how-inference-is-served`, `what-safety-training-changes`,
  `why-the-same-request-gives-different-answers`. Compressed technical
  prose: bulleted lists, bolded key sentences, section headings that are
  claims, closers like "The mental model to keep". No scenes, almost no
  dates, almost no external sources.
- **Group B (27 pages)**: long-form essays. Each opens on a concrete scene
  or dated event (a card reader, an arrest on a lawn, a 1955 budget
  request, a photograph of Oscar Wilde), quotes primary sources by literal
  substring with dates, and closes by handing the reader a question or a
  habit rather than a summary. Within B, the shorter pages (~1,000–1,550
  words) cite mostly wiki entries; the longer ones (1,678–3,532) quote
  external sources heavily.

Only after committing that grouping was git consulted. **The check lands
exactly.** Group A is the seed wave, committed 2026-08-28 (four pages at
14:47, six at 21:22). All 27 Group B pages were committed 2026-08-30,
between 14:48 and 17:57 — and the B-internal split tracks commit time too:
the fifteen pages committed before 16:50 have median length 1,265 words;
the twelve committed 17:09–17:57 have median 2,394. Three populations —
median 968, then 1,265, then 2,394 words — and the curriculum's own §3
"no ceiling" instruction is dated the same day the pages doubled. The
surface is not of a piece in register, and the seam corresponds precisely
to when the pages were written.

Two things follow, one reassuring and one not. Reassuring: Group B is
astonishingly uniform internally — 27 pages that read as one author, one
argument style, one cadence, despite being written across a single day by
(presumably) many executors. The curriculum's voice section worked. Not
reassuring: the ten seed pages now sound like a different book, and the
reading order interleaves the two books.

## Progression — where the ladder actually climbs and where it lurches

The prerequisite guarantee holds everywhere: the in-order reader is never
*assumed* to know something not yet taught. But the maintainer asked for
progression, and within a depth band the order is decided by title
alphabetics, which produces four real lurches:

1. **The vector/embedding inversion (positions 13–14) — the sharpest seam
   on the surface.** `how-a-language-model-works` (13) writes "Each token id
   is looked up in a table, giving a vector" — *vector* undefined at that
   point — and heads a section "Embeddings: positions, not meanings yet".
   One page later, `how-machines-represent-meaning` (14) is the page built
   to teach exactly that idea from zero, and it even supplies the
   definition page 13 needed: "vector being the field's word for the list
   of numbers". Neither page depends on the other; both sit at depth 3;
   only "How a language..." < "How machines..." puts the use before the
   teaching. Swapping them (a title tweak on either) would make the
   foundations rung read as designed.
2. **Foundations opens with licensing.** After orientation closes on the
   strongest page of its rung (`why-models-are-confidently-wrong`), the
   first foundations page is `open-weights-and-closed-models` — release
   postures and licence clauses before the reader has met a neural
   network. It violates nothing and it reads like a channel change. The
   8→9 rung boundary is the only one with no handoff at all.
3. **Mechanics opens with `running-a-model-yourself` (20), and
   `how-models-are-trained` lands at 22** — after the reader has already
   been taught to run a model and (21) how diffusion training works. The
   page titled "How models are trained" arriving behind two 2,000+-word
   applied pages is the reading order's oddest promise-inversion, and it
   is the surface's most-cited page (8 inbound links) sitting behind pages
   that cite it.
4. **`ai-and-the-law` (23) splits the mechanics run.** The longest page on
   the surface (3,532 words of courts and statutes) sits between
   `how-models-are-trained` and `how-a-model-uses-your-documents`,
   breaking a mechanism thread for the length of a short story and then
   resuming it. The page is excellent; its seat is not.

The prior review of this change (finding 4) predicted from the curriculum
that the middle would be alphabetised; this read-through confirms it in the
built surface and finds the concrete casualties. The lever is still
unnamed anywhere a writer would see it: **within a depth band, the title
decides reading order**, and none of these titles was chosen with that in
mind.

One structural tension, mostly well managed: because a page may lean only
on its declared prerequisites, pages re-teach. `running-a-model-yourself`
(20) re-teaches tokens from scratch ("the pieces are called tokens") seven
pages after `how-a-language-model-works` taught tokenisation — correct
under its own contract (it does not declare that page), and audibly
redundant to the in-order reader. This is the price of the
prerequisite-minimal design and it is usually worth paying; it is named
here so nobody mistakes the re-teachings for accidents.

## The reinforcement-learning thread — the one concept taught out of order

Reading in order, reinforcement learning is: **named at page 8**
(`why-models-are-confidently-wrong`, an orientation page: "Reinforcement
Learning with Verifiable Rewards is that idea applied to training" — the
sentence stands on its own, barely), **used at page 22**
(`how-models-are-trained`: "optimise the language model against that
reward with reinforcement learning" — term of art, undefined, unlinked),
and **finally taught at page 29** (`what-a-reasoning-model-does`, which
teaches it properly and beautifully: "The model produces something, a
score is attached to what it produced, and the weights move to make
higher-scoring productions likelier next time... That is reinforcement
learning"). The prior review's finding 6 asked for a must-cover bullet on
`learning-from-examples` to close this; `learning-from-examples` still
teaches supervised learning only. The concept does get taught — but
twenty-one pages after its first use, and the page 22 usage is the only
place on the surface where a mechanics page uses a term of art it neither
defines nor links. A one-clause gloss at `how-models-are-trained` would
close the thread.

## Coverage of the subject, not the curriculum

Every §1 area has published pages serving it. Judged against the *subject*
— what a thoughtful stranger would expect to understand about AI after
four hours — three absences are worth recording, two of them already
half-known:

1. **"AGI" is never defined, anywhere.** Measured: zero occurrences. The
   surface teaches the reader to weigh capability forecasts (capstone),
   steelmans the superintelligence argument (35), and never once tells the
   reader what the two most common words in AI headlines — "AGI",
   "superintelligence" — actually name. `the-safety-debates` uses
   "superintelligence" three times, always inside quotations from sources.
   A reader finishing this surface can evaluate the argument and still
   cannot parse the headline term for it. This is the one gap that
   directly contradicts an orientation-rung promise ("look at any AI
   headline... and know what kind of thing is being talked about"). One
   paragraph, probably on `the-safety-debates` or the capstone, closes it.
2. **Embodiment is absent, and the absence is still unrecorded.** Zero
   mentions of robotics, self-driving, drones, or any model that acts on
   the physical world. `the-kinds-of-models` enumerates six families; none
   of them moves anything. The prior review asked for a recorded decision
   either way; none has appeared. The surface can defensibly scope
   embodiment out — but the curriculum should say so, visibly, or a reader
   who asks "is a self-driving car AI?" has four hours of reading and no
   answer.
3. **"Is it conscious? Does it understand?" is answered only by disciplined
   refusal.** The surface's stance is real and consistent —
   `what-a-reasoning-model-does`: "Whether the stretch deserves to be
   called thinking is an argument about a word"; `what-a-neural-network-is`
   gives the honest split of what is and is not mysterious; ELIZA carries
   the projection lesson. But the refusal is scattered, never stated as a
   position, and it is the first question most strangers actually bring.
   This is a defensible editorial stance that deserves one honest sentence
   somewhere on the orientation rung, rather than silence.

Not gaps, checked and cleared: history (5 is superb), data labour (16 and
11 both, honestly bounded), energy and water (36, with boundaries drawn),
privacy (12), regulation and copyright (23), open vs closed (9),
benchmarks (26), attacks (28), interpretability (33), economics (36),
image and video generation (21), agents (27), local running (20).

## Contradictions — both passages quoted

One real inconsistency and one factual discrepancy, related:

1. **The two winters are two different pairs on two pages.**
   `where-ai-came-from` (5) narrates ALPAC (1966) and Lighthill as one
   reckoning — "the reckoning came as budgets rather than argument" — and
   then counts a second winter separately: "It happened again in the
   1980s. Researchers warned in 1984 that expectations had run ahead of
   the results". Its outcome promises the reader can "say what an AI
   winter was and why two happened." The capstone (37) counts differently:
   "the doubters have been paid out twice. Funding for machine translation
   collapsed after a 1966 government review, and a wider withdrawal
   followed a 1972 one. Both freezes lasted years" — ALPAC and Lighthill
   as the two payouts, the 1980s never mentioned. A reader who took page
   5's outcome seriously arrives at page 37 holding a different "twice"
   than the one being spent. The wiki entry (`concept/ai-winter`) supports
   page 5's framing — it carries the 1987–89 Lisp-market collapse with
   dated earnings as its second episode. Page 37's sentence is defensible
   in isolation and wrong as a continuation of page 5.
2. **Lighthill is dated 1972 on one page and 1973 everywhere else.** Page
   5: "Seven years later a British survey" (1966 + 7 = 1973). The corpus's
   own entry `event/lighthill-report`: "published early in 1973". Page 37:
   "a wider withdrawal followed a 1972 one". The report was commissioned
   in 1972 and published early 1973; the corpus's dating authority says
   1973, and the capstone disagrees with it by literal substring.

Everything else checked for contradiction holds up, including several
places where it easily could not have: `who-builds-ai` (6) and
`what-it-costs` (36) state the training-bet claim identically at 30 pages'
distance ("the bill is settled before anyone knows what came out" / "the
price is known in advance and the thing bought is not");
`what-a-model-is`'s determinism caveat (3) is elaborated, not
contradicted, by page 34; the demo/deployment, checker-asymmetry, and
proxy-objective claims are stated consistently by every page that touches
them.

## Redundancy — where two pages teach the same thing

Most repetition on this surface is deliberate spaced reinforcement and
works. Two instances cross into duplication:

1. **The attention-budget sentence appears twice, nearly verbatim, one
   page apart.** `why-context-is-not-memory` (18): "Attention weights are
   normalised to sum to one, so a longer input does not bring more
   attention with it; it divides a fixed budget among more candidates.
   Every position added competes with every position already there."
   `getting-good-answers` (19): "because attention weights are normalised
   to sum to one and each position added competes with every position
   already there, so a standing instruction at turn fifty is not the
   instruction it was at turn one." Adjacent pages, same clause structure.
2. **"Arguing appends" is taught three times.** `what-a-model-is` (3):
   "Telling a model it is wrong changes the text it is reading, and
   therefore its next output. It changes nothing about the model."
   `why-context-is-not-memory` (18): "A correction appends. The mistaken
   sentence stays exactly where it was... 'I already told you not to do
   that' is not a retraction." `getting-good-answers` (19): "A correction
   removes nothing. The wrong answer stays where it was, the objection
   lands underneath." The third telling adds the least; pages 18 and 19
   run back-to-back.

Counted but cleared as deliberate layering: the KV cache (four visits: 18,
20, 31, 34 — each a different angle), quantisation (20, 25, 31, 36 —
ditto), "the model does not remember / re-sent from the beginning" (3, 12,
18, 20 — this is the surface's central fact and every repetition is a
payoff), the refusal direction (32 teaches it, 33 rereads it as evidence —
explicitly the design, and it works), chain-of-thought (19 plants, 29
reprises with "None of the mechanism is new to you" — the best
prerequisite payoff on the surface).

## Voice

Group B — 73 per cent of the surface by word count — reads as one work,
and a good one: flat declaratives, scenes doing argumentative work,
uncertainty stated as findings ("The finding is about the models they
tested on the dates they tested them"), one bolded sendable sentence per
page, closers that hand the reader a tool. Nine pages by nine hands in one
afternoon are indistinguishable in register. That is rare and worth saying
plainly.

The whipsaw is at the A/B boundaries, and it is measurable, not an
impression: crossing from page 12 to 13 the bullet count goes 5→6, bold
spans 5→10, em-dashes per 1,000 words 1.7→7.9, and the scene-opening essay
gives way to "A language model does exactly one thing:" — a different
book. The worst three crossings in order: 12→13 (privacy essay into
tokeniser bullets), 21→22 (2,750-word diffusion essay into 812-word
training checklist), 34→35 (batch-invariance bullets into 2,831 words of
steelmanned policy). The A pages are not worse — several are the
tightest writing on the surface, and their bolded sentences are the ones
later pages quote — but they never speak forward into the wave that now
surrounds them, because they could not: they were written first. The
stitching is one-directional. B pages quote A sentences constantly
("appending is cheap; editing the beginning is not"; "the failure modes...
persist at every size"); no A page acknowledges a B page exists except by
generated prerequisite links.

Whether to re-voice the ten seed pages toward the essay register, or leave
two registers standing, is a real decision with cost either way — the seed
pages' compression is part of their quality. It should be a *recorded*
decision.

## Seams that work — the connectedness is real

Named because the brief asked for both kinds, and because these are the
evidence that the surface is a work and not a shelf:

- 2→3: `learning-from-examples` ends "That frozen bundle of settings is
  called a model, and it has a page of its own" — and the next page in the
  generated order is that page.
- 4→7: `where-ai-fails-people` opens its final section "That earlier page
  left you asking who catches a system when it is wrong. The question gets
  harder here" — a rung-internal handoff that reads as one argument.
- 15→17: `when-you-cannot-trust-your-eyes` opens on "The page that brought
  you here left you with a generator as a recogniser's pile read
  backwards" — picking up `the-kinds-of-models`' bolded sendable exactly.
- 19→29: `what-a-reasoning-model-does` opens its mechanism section "None
  of the mechanism is new to you" and re-derives chain-of-thought from
  `getting-good-answers` — the ladder's best demonstration that a
  prerequisite is an asset.
- 30→37: `why-bigger-got-better` ends on prediction-without-explanation;
  the capstone opens its second section "That page banked a scepticism.
  This is where it gets spent." Planted, banked, spent — across seven
  pages and two rungs.
- 32→33: `looking-inside-a-model` rereads the refusal direction as
  interpretability's proof of concept: "You already have the strongest
  result on this page."
- 25→31→36: hardware pre-seeds the prefill/decode asymmetry, serving
  builds its whole page on it, costs cashes both.

## The ending

`how-to-think-about-what-comes-next` is an ending, not a last page. It
names its own position ("You have the whole ladder behind you now, and
this page will not add a forecast to it"), spends four earlier pages by
name, refuses the two failure modes it diagnoses, and closes by handing
the reader the site's own method as a discipline — a date, a number, an
owner. The reader finishes equipped, not merely informed: they leave with
the sorting question ("what would count as finding out"), the two-curves
frame, and a four-item watchlist. As the last paragraph of a 57,000-word
work, "the craft is to be the person who wrote down, before the fact, what
to check" is earned.

## Smaller findings

- `who-builds-ai` (6) carries the surface's one substantial dated
  socio-political aside with no source of any kind: "In 2026 the American
  government saw one lab's newest models before the public did, and
  another lab's top tier left the market for weeks and returned to a
  limited set of organisations after a government approval." The org
  entries it links may carry the sourcing; the prose carries none, on an
  orientation page. This is exactly the class the prior review's finding 5
  flagged.
- Six of the eight pages nothing links to are late-order leaves, which is
  natural — but `ai-and-the-law` and `how-ai-systems-get-attacked` are
  never pointed at by any other page's prose. A reader navigating by links
  rather than by the ladder cannot discover them. One sentence each from
  `what-models-are-trained-on` ("the legal fight over this is its own
  page") and `what-an-agent-is` would fix it.
- All 9 forward prose links are correctly framed as deferrals; none
  assumes. The mechanism the spec guarantees is not merely satisfied — the
  writers used forward pointers the way the design intended.
- The reading-order brief circulating for this change describes the
  tiebreak as "slug"; `lib/learn.mjs` breaks ties on **title**. For every
  current page the orders happen to coincide closely, but the finding
  about the ordering lever (above) only makes sense against the real key.

## What the surface gets right, stated as plainly as the defects

A stranger with no technical background can read this surface end to end
with nothing assumed that was not first taught — measured, not asserted.
The hard ideas are all here at honest depth: attention, diffusion,
embeddings-as-geometry, RLVR, superposition, the fair-use factors, unit
economics, the alignment argument steelmanned both ways. The surface
refuses, everywhere and consistently, the two failure modes it names in
its own capstone — enthusiasm without evidence and cynicism without
evidence — and its uncertainty is always a dated finding, never a hedge.
The connectedness is not decoration: at least seven long-range
plant-and-payoff structures span rungs, and the capstone could not exist
without them. The claim "someone who knows nothing should have a thorough
understanding if they read the whole surface" survives this review.

## Recorded decisions wanted, either way

1. The two registers: re-voice the ten seed pages or declare the two-book
   texture accepted.
2. Embodiment: in scope eventually, or scoped out visibly in the
   curriculum (carried over from the prior review, still open).
3. The title-tiebreak ordering lever: name it in the curriculum and use it
   (the 13/14 inversion and the mechanics opening are one title edit each),
   or record that within-band order is accepted as arbitrary.
