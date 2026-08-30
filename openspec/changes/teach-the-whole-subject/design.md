# Design: teach-the-whole-subject

This document is the argument. The operative text an executing model works
from — rung definitions, tone tests, the page catalog — lives in
`openspec/curriculum/learn.md`, and `tasks.md` is the spine. A future model that disagrees
with a choice should find its reasons here and weigh them, rather than
silently reorganise.

## D1 — What "the whole subject" is: six areas, and why this division

"Everything about AI, top to bottom" needs a map before it needs an order,
because the order is only checkable against a claim about what the territory
contains. The division chosen:

| Area | The question it answers | Rungs it spans |
|---|---|---|
| **A. The thing itself** | What is this, physically and computationally? | orientation → advanced |
| **B. Where it came from** | How did seventy years of a field produce this decade? | orientation |
| **C. How it is made** | What goes into a model — data, training, hardware, money? | foundations → advanced |
| **D. How it runs and is used** | What happens between a request and an answer, and in what products? | orientation → advanced |
| **E. How to judge it** | When is it wrong, how would you know, and what fixes what? | orientation → advanced |
| **F. The world around it** | Who builds it, who pays, who is harmed, who decides, what next? | orientation → advanced |

The argument for this division over its rivals:

- **It is the reader's division, not the field's.** A textbook divides by
  technique (supervised / unsupervised / RL); a company divides by product;
  Wikipedia divides by subfield. All three assume the reader already cares
  about the divisions. A stranger's actual questions arrive in the shape
  above: what is it, where did it come from, how is it made, what does it do,
  can I trust it, what does it mean for me. Each area is a question someone
  really asks, so coverage of an area is legible as an answered question.
- **It separates the two halves the maintainer's sentence joins.** "Thorough
  understanding" needs A–E; "for all audiences" is mostly earned in B and F,
  the areas the current surface has zero pages in. Making them explicit areas
  — rather than paragraphs inside mechanism pages — is what keeps them from
  being quietly dropped again, because an empty column in the map is visible
  in a way a missing paragraph never is.
- **Areas are coverage, rungs are progression, and they must not be the same
  axis.** The tempting design is to make the areas the levels (first learn
  what it is, then how it is made, then the world around it). Rejected: the
  ladder's levels encode *assumed prior knowledge* — that is what the index
  sort and the prerequisite graph do with them — and every area contains both
  easy and hard pages. History assumes nothing; training economics assumes
  three mechanics pages. One axis for what a page is about, one for what it
  assumes. The map is a matrix, and the catalog fills both dimensions.

Area B is deliberately small (one page) and orientation-only. History earns
its place by making the present legible — winters explain hype-wariness, the
learning turn explains why data matters — not by being a second timeline
surface. The wiki's event entries are the timeline; the learn page is the
spine that strings eleven of them into a story. That is the connectedness
that beats the obvious alternative (`education-static`: "Each page must beat
the obvious alternative"), and it is the pattern for every area-F page too:
the learn surface narrates; the wiki holds the record.

## D2 — The ladder: four rungs, kept, with meanings restated

`LEARN_LEVELS` stays exactly as it is. The case for a fifth rung (a "practice"
or "using it" tier) or for renames ("beginner/intermediate/expert") was
considered and priced: editing the array is a schema change, every existing
page carries a level, the index sort and its blurbs change, and the
alternative — stating what the four rungs mean and placing pages by an
admission test — costs one text edit to `LEVEL_BLURBS`. Four rungs also match
the real strata of readers: the person who has only used a chatbot; the
person who wants their daily tool to stop being magic; the person who reads
technical writing; the person who wants the load-bearing details and the live
arguments.

What was genuinely wrong with the rungs was not their number but their
descriptions: the current blurbs describe *topics* ("inference economics,
interpretability"), which breaks the moment coverage widens — where would
law, work, or history sit in a topic-defined ladder? The restated rungs
(curriculum §2, operative) are defined by **what the reader can do at the
end** and by an **admission test on what a page assumes**:

- **orientation** — reads any AI headline or product page and knows what kind
  of thing is being discussed. Admits a page only if it assumes nothing but
  everyday experience and earlier orientation pages.
- **foundations** — reasons causally about behaviour: predicts the failure,
  explains the quirk. Admits a page that teaches one mechanism in prose, no
  notation.
- **mechanics** — reads real technical writing (a model card, an engineering
  blog) and knows what the named parts do. Admits pages that name the actual
  parts and processes.
- **advanced** — weighs claims that experts dispute. Admits the load-bearing
  details and the arguments where the honest report is disagreement.

The test is *assumption, not difficulty*: `ai-and-the-law` is mechanics not
because law is technical but because its copyright half assumes the reader
knows what models are trained on; `where-ai-came-from` is orientation not
because history is easy but because it assumes nothing. This single rule is
what lets a lesser model place a future page without re-deriving this
document.

## D3 — The catalog's shape: 37 pages, one idea each

**Why 37 and not 15:** the maintainer's bar is a reader with "a thorough
understanding" of the subject from reading the whole surface. The existing
corpus establishes the unit: one page teaches one idea to completion, ~900 to
1,400 words, with a quotable structural sentence at its heart ("attention is
the only operation that moves information sideways"; "what looks like memory
is re-reading"). Covering six areas at that unit costs about this many pages.
The alternative shapes both fail: fewer, longer survey pages violate the
one-idea pattern and the editorial spec's cut list (survey prose is padding
by construction); many more, finer pages (one per wiki concept) would
duplicate the wiki, which the site's architecture explicitly forbids — the
wiki is the substrate, and a learn page that restates an entry is cut, not
published.

**Why the existing ten keep their levels:** every one of them passes the
restated admission tests where it sits. Re-levelling would churn the reading
order for no reader benefit and would put this change in the business of
rewriting pages it has no quarrel with. The only edits are two added
prerequisite lines, and both are additions the new pages create the need for.

**Rot is designed against page by page.** The riskiest pages are the area-F
ones — `who-builds-ai`, `ai-and-the-law`, `ai-and-work`,
`what-it-costs-to-build-and-run-ai`, `how-to-think-about-what-comes-next` —
and each catalog entry constrains them to the durable form: **roles, not
rankings; questions, not current standings; mechanisms, not this quarter's
numbers**; anything perishable is a transclusion or an explicitly dated aside,
per `education-static`'s no-rot requirement. A structural sentence ("a handful
of companies sit at every chokepoint") survives a lab renaming; "the top lab
is X" does not, so the catalog forbids the second form where it predicts the
temptation.

## D4 — The dependency graph, and the one mechanical addition

Prerequisites in this catalog follow one rule: **a prerequisite is a page the
prose actually leans on, not recommended reading.** Fewer edges mean more
orderings are valid, more tasks are independently completable, and the
"Assumes" line on the rendered page stays honest. Connections that are useful
but not load-bearing are inline links in the prose, which create no ordering
obligation.

The graph is acyclic by construction — every entry's prerequisites were
declared before any entry that depends on it — and `tasks.md` orders the page
tasks so that a page's prerequisites are always written first, because
`lib/corpus.mjs` fails the build on a prerequisite naming a page that does
not exist. That makes the wave order in `tasks.md` load-bearing, not
stylistic: executing tasks out of order does not produce a worse site, it
produces no site.

**The gap that becomes a check.** `lib/learn.mjs` topologically sorts
*within* a rung, and its header promises that reading top to bottom "never
sends you forward for something you needed already." Nothing enforces the
cross-rung half of that promise: a prerequisite pointing at a later rung
validates, builds, and quietly breaks the reading order. With ten pages
written mostly in one wave, convention held; with 37 written over months by
whoever picks up the next task, it will not. Task 1.1 adds
`checkPrerequisiteLevels` beside `checkPrerequisiteCycles`: an error naming
the page, the prerequisite, and both levels. It is a mechanism rather than an
instruction, per this repository's stated preference, and it is the entire
machinery footprint of this change.

## D5 — What the strictly in-order reader experiences

The generated reading order (rungs in ladder order; within a rung,
prerequisite depth then title) gives the end-to-end reader this arc:

1. **Orientation** hands them a map of the world: what AI is, how software
   can learn, what a model is and is not, where the field came from, what it
   is used for, who builds it, where it fails people, and why it lies
   fluently. Eight pages, no mechanism beyond metaphor, and at the end they
   can read the news without being had.
2. **Foundations** replaces the metaphors with causal models: networks,
   language models, meaning-as-geometry, training data, context, prompting,
   open weights, privacy, generated media, work. The reader stops asking
   "why did it do that?" and starts predicting it.
3. **Mechanics** names the parts: training pipeline, scaling, reasoning
   models, image generation, retrieval, agents, attacks, local running,
   hardware, benchmarks, law. The reader can now follow the field's own
   writing.
4. **Advanced** hands them the arguments: serving economics, nondeterminism,
   safety training, interpretability, costs, the safety debates — and ends,
   by prerequisite depth, on `how-to-think-about-what-comes-next`, which
   turns the site's own epistemics (dated claims, named indicators, measured
   not inferred) into the reader's takeaway. The surface ends by making the
   reader self-sufficient, which is the only honest ending for a subject that
   will keep moving after the last page.

The capstone landing last is not hoped for; it follows from the sort. Its
prerequisites give it the greatest depth on the advanced rung, and the
catalog records that as the intent so a future editor who adds a deeper
advanced page knows what they are displacing.

## D6 — Tone: why tests instead of adjectives

"Approachable for all audiences" fails silently because it is a property of
the reader's experience, not of the text — a model executing one page in
isolation cannot check "approachable", so it substitutes its default
register, which for this corpus is dense. The fix is the same one this
repository uses everywhere else: convert the property into named defects and
runnable tests (`editorial`'s would-cite, the cut list). Curriculum §3 defines
six named failure modes with before/after pairs, a named reader per rung, and
three tests a model applies to its own draft — the named-reader pass, the
term-of-art audit, and the sendable sentence. The last follows
`addictedtoai-18c`'s finding that "send to someone" and "cite in an argument"
select different prose; a learn page should survive both askings, and the
existing ten all do, which is why each test is illustrated with sentences
already live on the surface.

What tone guidance deliberately does **not** do: soften the house voice.
The corpus's register — flat declarative sentences, mechanisms stated
plainly, no hedging, no exclamation — is already the approachable one; the
danger was never that the site sounds academic but that a page assumes
vocabulary its rung has not earned. So the tests police *assumed knowledge
and unearned vocabulary*, not sentence length or enthusiasm.

## D7 — Considered and rejected

- **Making the areas the levels.** Rejected in D1; recorded again here
  because it is the reorganisation a future model is most likely to attempt.
  Levels encode assumed knowledge; areas encode topic; collapsing them makes
  either the sort or the coverage claim false.
- **A fifth rung for practice ("using AI well").** The practical pages
  (`getting-good-answers`, `running-a-model-yourself`, `where-your-words-go`)
  slot into existing rungs by their assumptions, like every other page. A
  practice *rung* would misfile them by topic — the exact axis confusion D1
  rejects — and costs a schema change.
- **A "current state of AI" page.** Maximally useful and rots by
  construction; it is the Pulse's and the blog's job. Every catalog entry
  that borders on currency (`who-builds-ai`, costs, law) is written
  structurally instead, with dated asides for examples.
- **Splitting `mentions`-style area tags into front matter.** An `area:` key
  would need a schema change and buys nothing at render time — the map lives
  in the curriculum, which review reads; the reader navigates by rung and
  prerequisites, not by area. No new front-matter key.
- **Editing more of the existing ten** (e.g. retrofitting
  `why-models-are-confidently-wrong` to cite the new orientation pages).
  Rejected: prerequisites are true assumptions, and that page genuinely
  assumes only `what-a-model-is`. Churn without a reader-visible gain.
- **Deep modality pages for audio and video.** One modality deep-dive
  (`how-image-generation-works`) teaches the generative pattern; audio and
  video reuse it and are covered structurally in `the-kinds-of-models`.
  Two more deep-dives would be textbook completism — the wiki can hold the
  detail, and a future change can add a page if reader demand shows up.
- **A person/biography page for the field's figures.** The wiki deliberately
  has no `person` kind (defamation-adjacent risk, alias collisions), and a
  learn page of people would recreate the problem in prose. People appear
  where events made them matter.

## D8 — Judgment calls a reviewer should weigh

Recorded per the brief, because a future model deserves the uncertainty as
well as the decision:

1. **`getting-good-answers` is the page most at risk of rotting into a tips
   listicle.** It is fenced to mechanisms (in-context learning,
   chain-of-thought, specificity-as-distribution-narrowing) and forbidden a
   cookbook, but reviewers should hold that line hard; if it cannot be held,
   the honest fallback is to cut the page and let the tutorials surface own
   the topic.
2. **`the-safety-debates` and `how-to-think-about-what-comes-next` ask an
   executing model to steelman positions it may have priors about.** The
   editorial spec's "enthusiasm without evidence and cynicism without
   evidence are the same defect" is the operative rule, and both entries name
   it; still, these two pages are where review should read most adversarially.
3. **`where-your-words-go` risks half-life through product-policy drift.**
   Everything perishable in it is confined to dated asides by its entry, but
   if in execution the page cannot say anything durable beyond its structure,
   merging it into `open-weights-and-closed-models` is the recorded fallback
   (their subjects — who controls the weights, who sees the data — are
   adjacent).
4. **Orientation holds eight pages, which is a lot of rungs-zero reading.**
   The alternative — pushing `who-builds-ai` or `ai-and-work` up a rung to
   thin it — was rejected because both pass orientation's admission test and
   both serve exactly the all-audiences reader the maintainer named. If the
   rung feels crowded once rendered, the fix is index presentation, not
   re-levelling.
