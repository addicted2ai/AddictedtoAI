# Review — `teach-the-whole-subject`

Sealed review, 2026-08-29, by a fresh-context reviewer with no edit rights and
no authorship stake. Verdict: **fit to execute with named fixes.** Nothing here
is a redesign; the structure — six areas crossed with four assumption-defined
rungs, one build check, a per-entry thesis line — held up under adversarial
measurement.

`review-o1-phase1-sealed.md` beside this file is the reviewer's phase-1
findings, written before it was allowed to open `design.md`.

## Why this review was run sealed, and what that bought

The reviewer read `proposal.md`, `curriculum.md`, `tasks.md` and the spec delta
and wrote its findings **before** opening `design.md`, which holds both the
author's reasoning and its own §D8 list of what it was least sure about.

The repository's own lesson: *"put the prior round's findings in a separate file
and instruct the reviewer to write its own findings BEFORE opening it.
Otherwise it verifies someone else's list and finds nothing new."*

There was a second reason the ordering was right rather than merely
disciplined. `curriculum.md` §0 tells the executing model *"the reasoning
behind the structure is in design.md; you do not need it to write a page."* So
a model executing this change reads exactly what the reviewer read in phase 1.
**Judging the artifact without `design.md` is the realistic test of whether it
is executable at all** — and two findings exist only because of it.

## What was re-measured rather than trusted

The change claimed four verifications. The reviewer re-ran all four with its
own scripts, and **all four hold**:

| Claim | Independently measured |
|---|---|
| orientation 8 / foundations 11 / mechanics 11 / advanced 7 | exact; 37 total, 27 new, 2 edited, 8 untouched |
| every suggested `mentions` resolves | 57 checked against 495 wiki files, **0 unresolved** |
| graph acyclic, no up-the-ladder edges | 0 cycles, 0 up-edges, 0 dangling |
| capstone sorts last | replicating `ladder()`: first `what-ai-actually-is`, last `how-to-think-about-what-comes-next` |

Also verified independently: all 37 `outcome` strings pass **both**
`learnSchema` refinements; every "Needs" line in `tasks.md` is a correct
topological order; task 1.1's call site sits immediately before
`site.diags.throwIfErrors('surfaces')` at `lib/site.mjs:67`, satisfying its
scenario's "before any page renders"; and task 1.1's *reasoning* is sound —
level-monotonicity plus the existing depth sort really do prove the in-order
guarantee.

**This is not a change that claimed verification it did not do.** That is worth
stating as plainly as the defects below.

## Land before task 2.1 — these change what every writer does

**1. Declare the leaning prerequisites (~8 edges).** ~~The spec delta says a
page *"SHALL assume, among learn pages, only its transitive prerequisites"* and
that leaning on an undeclared page is a `spec-violation`. Ten must-cover items
instruct exactly that — "the argument `how-models-are-trained` makes, applied",
"privacy (`where-your-words-go` pays off)", "`ai-and-work`'s lesson,
generalised". `design.md` D4 legitimately rescues two of them (a useful link is
not a load-bearing assumption), leaving ~8. The gap is that **the delta's
sentence is stricter than D4's rule, and the catalog lives between them.**
Verified: all remaining edges are down- or same-rung, so declaring them is
legal under the very check task 1.1 adds, and doing so keeps the graph acyclic
with 0 up-edges and leaves first/last unchanged.~~

**FIXED 2026-08-30. Nine edges declared, not eight.** Every entry body in §4
was scanned by script for a slug-named learn page outside that entry's
transitive closure: 22 hits, of which **10** are must-cover items instructing
a lean — this review's ten, reproduced exactly — and 12 are `must not`
deferrals ("`ai-and-the-law` owns it"), forward seeds ("seeds
`what-a-model-is`") or D8 fallback notes. A second pass over pages referred
to in prose without their slug found an eleventh lean, described below. Two
of the 11 were left undeclared
under D4 as useful-but-not-load-bearing: `ai-and-work` → `what-models-are-trained-on`
("connect to") and `how-a-model-uses-your-documents` →
`why-models-are-confidently-wrong` ("connecting", with no specific argument
named — unlike the two pages that lean on *"the failure modes … persist at
every size"* and *"the asymmetry it ends on"*, which were declared). The
remaining nine are now in §4 and in the §5 edge block:
`what-models-are-trained-on` ← `why-models-are-confidently-wrong`;
`why-bigger-got-better` ← `what-a-benchmark-measures`,
`why-models-are-confidently-wrong`; `what-a-reasoning-model-does` ←
`why-models-are-confidently-wrong`; `how-a-model-uses-your-documents` ←
`how-models-are-trained`; `running-a-model-yourself` ← `where-your-words-go`;
`ai-and-the-law` ← `where-ai-fails-people`; `what-it-costs-to-build-and-run-ai`
← `who-builds-ai`; `how-to-think-about-what-comes-next` ← `ai-and-work`.

The ninth is the one this review's own scan missed, and it is worth naming:
`why-bigger-got-better` ← `what-a-benchmark-measures`. Its must-cover item
refers to the page in prose — *"connected to the benchmark page's
smooth-loss/jagged-metric section"* — rather than by slug, so a
backtick-slug scan does not see it, which is exactly how ten rather than
eleven were counted. It is a lean: the emergence dispute's "metric thresholds"
half is that section's argument.

Recomputed after the edits, by replicating `ladder()` over the amended
curriculum: **37 pages, 0 up-edges, 0 cycles, first `what-ai-actually-is`,
last `how-to-think-about-what-comes-next`** — the capstone now sits alone at
depth 8 rather than depth 7, so the sort argument is stronger, not weaker.
The rung distribution is unchanged (8 / 11 / 11 / 7). Four `Needs` lines in
`tasks.md` gained a within-change dependency and were updated (4.6 +3.8,
4.8 +2.7, 5.1 +2.6, 5.4 +3.10); the wave order was re-checked by script and
remains a valid topological order with no task reordering required.

**2. Move the word-count target into `curriculum.md` §3.** ~~It exists —
`design.md:100`, "~900 to 1,400 words" — in the one document §0 tells the
executor they do not need. Not missing: **actively steered away from.** Correct
it to the measured range while moving it; live pages run 735–1192 words, so
D3's floor excludes two of them and its ceiling is 17% above the real maximum.~~

**FIXED 2026-08-30.** Curriculum §3 now carries a "How long a page is" block
between the voice section and the six failure modes, so a writer meets it in
the document they are told to work from. The band was re-measured rather than
copied: stripping front matter, code fences, link targets and transclusions
from the ten live `content/learn/*.md` bodies gives **662 to 1,107 words,
median 938, mean 894**, and §3 states the band as **about 650 to 1,150
words**. (This review's 735–1192 was a different method — counting the whole
file, front matter included, gives 711–1167 here; the direction of the
finding is unaffected either way.) It is written as guidance, not a gate,
with the reason a draft lands outside the band named in each direction — a
paragraph mistaken for a page below it, two ideas or survey prose above it —
because nothing enforces the number and padding to it would be the worse
defect. `design.md` D3 was updated to the same range and now says in so many
words that curriculum §3 is the operative statement, so the two cannot drift
apart silently.

**3. Re-anchor "the curriculum of record."** ~~`spec.md:61` points at
`curriculum.md` *in this change*, while requirement 2 is a permanent
`SHALL NOT`. On archive the requirement merges into `openspec/specs/` and the
curriculum moves to `openspec/changes/archive/`, so within one cycle a standing
obligation points into an archive directory and quietly stops being followed.
`openspec/specs/` is empty today, so the pattern is untested.~~

**FIXED 2026-08-30.** The curriculum now lives at `openspec/curriculum/learn.md`
and the requirement anchors there. The path is outside `openspec/changes/`, so
archiving cannot move it, and outside `openspec/specs/`, because that path is
reserved and this requirement obliges *amending* the curriculum — a rule
demanding edits to a file no job may edit would be unfollowable in the other
direction.

The reviewer noted the pattern was untested because `openspec/specs/` was
empty. **It is not untested any more.** `build-initial-site` and
`harden-seed-wave-guardrails` were archived the same night, which populated
`openspec/specs/` with eleven capabilities and moved both changes into
`openspec/changes/archive/2026-08-30-*` — exactly the mechanism the finding
predicted, observed rather than reasoned about.

One trap ruled out while choosing the new home, worth recording because it is
the obvious place to put it: **not** under `content/`. `lib/corpus.mjs` excludes
non-content by `NOT_CONTENT = /^(readme|_.*)\.md$/i`, but `pulse/lib/corpus.mjs`
ignores only `**/README.md`. Two readers, two different exclusion rules — a
curriculum living there would be invisible to one and a parse failure to the
other.

## Land before the surface is called complete

**4. The narrated arc is not the generated one.** `design.md` D5 describes a
foundations arc the sort does not produce. Within a rung the order is depth,
then **title alphabetically**, and 33 of 37 pages sit in a same-depth band
larger than one — so titles decide position.

| D5's narrated foundations arc | Actual generated positions |
|---|---|
| networks, language models, meaning, training data, context, prompting, open weights, privacy, generated media, work | 10, 14, 15, 12, 18, 19, **9**, 13, 17, **11** |

Foundations actually **opens with `open-weights-and-closed-models`** — release
postures, before the reader has met a neural network — and privacy lands before
`how-a-language-model-works`. Mechanics opens with `running-a-model-yourself`.
The capstone claim *is* correct, which is the tell: **the author verified the
end and inferred the middle.**

Task 6.2(c) checks first page, last page, and no-page-before-its-prerequisite —
all of which pass while the middle is alphabetised. The maintainer asked for
*progression*; the artifact verifies *ordering*. Fix: rewrite D5 from the
computed order, widen 6.2(c) to read the whole order, and tell writers the
lever they have — **within a depth band, the working title decides reading
order**, which `curriculum.md` never says and which the titles were plainly not
chosen for.

**5. A sourcing rule for dated asides.** Six entries require dated, sourced
external facts — energy and water as measured quantities, productivity effects,
annotator labour, case status. Permitted by the build (`lib/origins.mjs` gates
subresources, not `<a href>`), but this is exactly where an offline Desk job
fabricates a citation, and these are socio-economic figures rather than ML
papers. §3 never says what to do when you cannot source one. Add: *if you
cannot source a dated aside, cut it.*

**6. Reinforcement learning is never taught.** `learning-from-examples` covers
supervised learning only. Yet `where-ai-came-from` must cover AlphaGo "and what
each did and did not prove" with no self-play or reward available;
`what-a-reasoning-model-does` must cover "verifiable rewards"; and the existing
`how-models-are-trained` uses "reward model" as an assumed term. D1 names RL
explicitly while rejecting it as an *organising axis*, then never revisits it as
*content*. One must-cover bullet on `learning-from-examples` closes it.

**7. Smaller:** `how-machines-represent-meaning` (foundations) must cover
"king − man + woman" while foundations bans notation — write it in words. And
one restated normative sentence has no §7 row, so the delta's claim that *every*
normative sentence names its task is very slightly false. The traceability
table is otherwise real and near-complete.

## Recorded decisions wanted, either way

- **Embodiment.** No robotics, self-driving or control models anywhere; `the-kinds-of-models` enumerates six families and none of them act in the world. D7 weighed audio/video and biography and rejected them; robotics never appears in any list of what was considered.
- **Curriculum membership as a mechanism.** Requirement 2 is an instruction where a prebuild `STEPS` entry comparing `content/learn/*.md` against §4 headings would be ~15 lines. `design.md` invokes "a mechanism rather than an instruction, per this repository's stated preference" for task 1.1 in the same document that leaves this one as an instruction.

## Not findings

`where-your-words-go` thinness, `getting-good-answers` drifting into tutorial
territory, `the-safety-debates` needing adversarial review, and Area B holding
one page are all risks the change already names with fallbacks recorded. All
four §D8 items were anticipated correctly.

Credited: every entry's **"Beats the alternative by"** line wires the page to
the baseline spec's third requirement *and* doubles as its thesis. The
reviewer calls it the artifact's best feature, and it materially mitigates the
length risk above.
