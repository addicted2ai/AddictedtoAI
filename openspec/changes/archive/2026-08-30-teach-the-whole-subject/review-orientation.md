# Review — the orientation rung, `teach-the-whole-subject`

Review of the eight published `level: orientation` pages, 2026-08-30, by a
fresh-context reviewer with no edit rights and no authorship stake. Verdict on
the rung: **fit, with named fixes on three pages and none of them structural.**
Every page passes the sendable-sentence test without charity. Every
load-bearing external claim checked was verified to the literal substring or
to a sourced wiki fact, and all of them held — on a project whose reviews have
caught fabricated citations, that is the headline, and it is stated as plainly
as the defects below.

The eight pages were found by front matter (`grep 'level: orientation'`,
8 files), not taken from a list, and read in the generated reading order,
which was computed by replicating `ladder()` in `lib/learn.mjs` — depth in
the prerequisite graph, then **title** (`localeCompare`), not slug — over the
eight pages' declared prerequisites:

1. `what-ai-actually-is` (depth 0)
2. `learning-from-examples` (1)
3. `what-a-model-is` (1)
4. `what-ai-is-used-for` (1)
5. `where-ai-came-from` (1)
6. `who-builds-ai` (1)
7. `where-ai-fails-people` (2)
8. `why-models-are-confidently-wrong` (2)

## How this review was run

- External sources were fetched as **raw HTML with curl and checked by
  literal substring** against the fetched bytes, never through a summarising
  extractor. All five fetches succeeded (NIST, ACLU, PMLR, NBER, arXiv).
- Claims whose stated home is the wiki substrate were checked against the
  wiki entry's text and its recorded sources, since the pages link entries
  rather than citing externally — that is the architecture working, and where
  it mattered it was noted below.
- The brief deliberately withheld which pages were written recently and which
  are older. The grouping judgment below was committed to **from the page
  text alone** and only then checked against the curriculum's Status lines
  and `git log --follow`. The grouping matched exactly.

## What was independently re-measured versus what was trusted

| Claim | How verified |
|---|---|
| Eight orientation pages, found by front matter | `grep -l 'level: orientation'`, 8 files, counted not sampled |
| Generated reading order | replicated `ladder()`: depth from the eight front matters, title tiebreak |
| Prerequisite closures per page | computed by hand from front matter; prose checked against each closure |
| NIST 2019: 189 algorithms / 99 developers, one-to-many false positives higher for African American women, "could include false accusations", most-equitable-also-most-accurate, Asia-developed one-to-one finding, training data named | raw HTML substrings, all present |
| ACLU account: front lawn, wife and two daughters, "nearly 30 hours", "computer must have gotten it wrong", held several more hours, charges dismissed, people identified this way "never told" | raw HTML substrings, all present |
| Gender Shades: 79.6% / 86.2% lighter-skinned benchmarks, 34.7% worst darker-female error, 0.8% lighter-male | raw HTML substrings, all present |
| NBER w25943: risk-equivalent minority borrowers pay 7.9/3.6 bps more, algorithmic lenders discriminate "40% less than face-to-face lenders", monopoly-rents/shopping interpretation, 2019, four authors | raw HTML substrings, all present |
| arXiv 2509.04664: binary grading rewards guessing; remedy is "modifying the scoring of existing benchmarks that are misaligned but dominate leaderboards, rather than introducing additional hallucination evaluations" | raw HTML substring, exact |
| Dartmouth: four signers, two months/ten people, 31 Aug 1955, "can in principle be so precisely described that a machine can be made to simulate it" | wiki `event/dartmouth-workshop`, quote present verbatim |
| ELIZA: Jan 1966 CACM, "assume the pose of knowing almost nothing of the real world" | wiki `event/eliza`, quote present verbatim |
| Kasparov "tiring" in 1996 | wiki `event/deep-blue-kasparov`: game-four quote "here I have something that is not exhausted", TWIC-sourced |
| ALPAC: economics not computers, learn Russian in ~200 hours | wiki `event/alpac-report` |
| Second winter: 1984 AAAI panel warning, money turns 1987 | wiki `concept/ai-winter` |
| ImageNet 2012 table shape: eight non-neural entries within 1.2 points, ten-point gap, 15.315% | wiki `event/imagenet-2012` |
| AlphaGo: Zero beats Lee-version 100–0 within two years; Nov 2022 adversarial policies >97% vs KataGo; a human can run the exploit | wiki `event/alphago-lee-sedol` |
| Transformer: 12 June 2017, eight authors, one eight-GPU machine under four days, closes planning images and audio | wiki `event/attention-is-all-you-need` |
| CASP: biennial since 1994; 30 Nov 2020; "recognised as a solution to this grand challenge **by the organisers**" — the learn page's attribution to organisers, not the lab, is correct | wiki `event/alphafold-casp14` |
| Stable Diffusion: weights published 22 Aug 2022, first-week explosion of unplanned builds | wiki `event/stable-diffusion-release` |
| `who-builds-ai` 2026 asides: government pre-release access (June 2026 frontier-model executive order); a top tier withdrawn and restored to a set of US organisations after government approval | wiki `org/openai` and `org/anthropic`, both sourced |
| Mistral flagship under Apache 2.0; NVIDIA releases weights, major corpora portions, end-to-end recipe | wiki `org/mistral-ai`, `org/nvidia` facts |
| Voice grouping (two pages vs six) | committed first, then confirmed: curriculum Status lines and `git log --follow` (2026-08-28 vs 2026-08-30) |
| Word counts | `wc -w`, whole files: 735–1603, all eight counted |

Trusted without independent re-verification: ChatGPT's 30 Nov 2022 launch
date, the 1997 Deep Blue result, route-finding as 1960s AI research, and
phone chess engines exceeding Deep Blue (all universally attested); the wiki
entries' own `source_url`s (learn claims were verified against wiki text —
auditing the wiki against its sources is the wiki's review, not this one);
DeepSeek's hedge-fund origin and Hangzhou, Mistral's Paris; and the
build-level checks (schema, mention resolution, cycle/level), which the
passing suite already measures.

## Verdict per page

Every verdict names the sendable sentence verbatim, per the spec's
`not-worth-reading` clause. No page on this rung fails it — and none of the
sentences below was nominated to avoid a rejection; several pages carry two
or three candidates.

**1. `what-ai-actually-is` — fit to publish.**
> "AI did not arrive in your life on the day it started talking to you. That
> is just the day it stopped being easy to miss."
Runner-up: "AI is the name software carries while it still surprises us;
afterwards it is called a spam filter, a chess engine, or directions." Every
must-cover beat present; nothing from must-not crept in; the label-check
question ("what did this learn, and from what examples?") is the tool the
outcome promises.

**2. `learning-from-examples` — fit to publish.**
> "A trained system learns what its examples have in common, not what you
> meant them to have in common."
Runner-up: "As far as the software is concerned, the pile is the world." The
loop in prose with zero notation, generalisation via the filing-cabinet
argument, the cow-on-grass shortcut, and train-time/use-time — all four
must-covers, and the seed for `what-a-model-is` lands in the final section
exactly as §4 asks. The strongest teaching page on the rung.

**3. `what-a-model-is` — fit with named fixes** (findings 2 and 4).
> "What looks like memory is re-reading."
The page the curriculum itself quotes, and its core distinction is the rung's
most load-bearing idea. The fixes are glosses, not rewrites.

**4. `what-ai-is-used-for` — fit to publish.**
> "The AI you never notice is not the AI that stopped making mistakes. It is
> the AI whose mistakes stopped being yours."
Runner-up: "A demo is the software. A deployment is the software plus
everything built to survive it being wrong." The where-do-the-mistakes-go
frame is an organising idea §4 did not even demand, and it carries the whole
page. AlphaFold is never named in prose — the event link carries it, which is
the rot defence practiced rather than obeyed.

**5. `where-ai-came-from` — fit to publish**, one non-blocking prose fix
named (finding 5).
> "A winter is a verdict on the promises, not on the work."
Runner-up: "Superhuman turned out not to be a number. It was a score against
the opponents somebody had thought to try." All five turns present, each
event linking a sourced entry, and "what did it settle" applied consistently.
The strongest history writing on the surface.

**6. `who-builds-ai` — fit to publish.**
> "Most supply chains are pyramids: crowds of suppliers at the bottom holding
> up a few famous names. This one is standing on its point."
Runner-up: "Whoever holds a chokepoint wants the layer above it crowded."
Role-first throughout; no rankings, no funding figures; the cheque-or-a-decade
closer converts the role map into a durable analysis tool. Its 2026 asides
are carried, sourced, by the org entries the sentences link — the
wiki-as-substrate architecture doing exactly what it was designed to do.

**7. `where-ai-fails-people` — fit with named fixes** (finding 3).
> "An accuracy rate is a promise made to the people the examples had most of."
Runner-up: "An error no single person made is an error no single person can
be asked to undo." The best page on the rung and possibly the surface:
mechanism-first, primary-sourced (every external citation on it verified to
the substring), and the "what it costs to disagree" section teaches
automation bias as an incentive structure rather than a vocabulary word. The
one fix is procedural, not editorial.

**8. `why-models-are-confidently-wrong` — fit with named fixes** (finding 1).
> "Nothing in the process that produces an answer checks the answer."
Runner-up: "Getting all of that right is the failure. It is not a mitigating
detail." The argument is the surface's exemplar for a reason. The fixes are
vocabulary glosses; nothing about the structure should move.

## Findings, by severity

**1. `why-models-are-confidently-wrong` breaches the orientation admission
test in named places — `spec-violation` (jargon before meaning), medium.**
§2's admission test: "assumes nothing but everyday experience … No code, no
maths, no API vocabulary." The named reader "has used a chatbot and reads no
tech press." Measured against that reader:
- *"a guess has positive expected value and abstention has none"* — "expected
  value" is maths vocabulary given no meaning in its sentence or the one
  before; the paragraph's argument leans on it.
- *"A compiler, a test suite, a schema, a calculator, a search result with a
  URL you can open"* — three of five checker examples are programmer
  vocabulary with no gloss; the named reader gets meaning from at most two.
- *"A model can be well calibrated about which word comes next"* —
  "calibrated" is a term of art whose meaning is never given.
- *"a rarely used function in a popular library"* — a programmer's example
  where the sentence needs one anybody owns.
Each is a one-sentence repair. The page predates §2's admission tests
(first committed 2026-08-28; the curriculum landed after), which explains the
gap without licensing it — the spec is now normative over published pages.

**2. `what-a-model-is`, same class, medium-low — `spec-violation` (jargon
before meaning).**
- *"ask which layer it is about … the input, or the sampling step?"* — the
  closing paragraph introduces the term "sampling" for the first time, with
  no meaning in that sentence or the one before. The mechanism it names was
  described two sections earlier but never given this name, so the term-of-art
  audit fails on the letter of the rule.
- *"the order in which requests get grouped together on a server can perturb
  floating-point arithmetic"* — unglossed; the named reader has no
  "floating-point". The clause after the dash could carry a plain-words
  version ("the tiny rounding in computer arithmetic") at no cost.
Same cohort and same explanation as finding 1.

**3. `where-ai-fails-people` silently drops a named must-cover case —
medium-low.** §4: "canonical cases — hiring, credit, face recognition — as
dated asides with sources." The page covers face recognition (three primary
sources) and credit (one) and never touches hiring. The focus is arguably
correct — two domains driven deep beat three surveyed, per §3's failure
mode 5 — but §0.5 requires deviation to amend the curriculum "visibly, with a
sentence of reasoning," and no amendment exists. Fix either way: one dated
aside on the canonical hiring case, or a one-line §4 amendment recording the
cut and why. The page should not be held back over it.

**4. `what-a-model-is` declares a mention it does not teach — low.** Front
matter lists `event/attention-is-all-you-need`; the body never mentions
attention, transformers, or the paper (grep: the only hit is the front matter
itself). §3: mentions list "every concept and technique the page teaches."
The build only checks resolution, so this ships a false backlink — the
transformer entry's "mentioned by" will point a reader at a page that never
speaks of it. Delete the line.

**5. `where-ai-came-from`, one ambiguous antecedent in a page whose job is
attribution — low.** *"A rebuttal appeared within a week of its publication
in 2019, and its author has since put today's chatbots on the wrong side of
his own distinction."* The fact is Sutton's (wiki `concept/the-bitter-lesson`:
Dwarkesh Podcast, 26 September 2025, "LLMs are not what the lesson
recommends"); the nearest antecedent is the rebuttal, whose author is Brooks.
A reader who does not follow the link walks away unsure who disowned what —
in the one sentence on the page where that matters. Name Sutton, or say "the
lesson's author."

**6. The rung is not of a piece — observation, low, recorded because the
brief asked.** Committed to before checking history: `what-a-model-is` and
`why-models-are-confidently-wrong` differ from the other six in voice and
register — the rung's only bulleted lists, thesis-first openings where the
six stage a scene (a card reader, a meeting app, an arrest, a budget
request), roughly 700–1,000 whole-file words against 1,100–1,600, and the
vocabulary of findings 1–2. The check afterwards: those two are exactly the
seed-wave pages (first committed 2026-08-28); the six were written against
the curriculum on 2026-08-30. The six read as one writer on one surface; the
two read as a sharper, more compressed engineer addressing a reader half a
rung up. The right repair is the gloss-level fixes above, not a rewrite —
both pages' sendable sentences are quoted by the curriculum itself and are
load-bearing for the surface's voice.

Nits, recorded without verdict weight: "The first chatbot, ELIZA, was built
in 1966" — built 1964–66, described in the January 1966 CACM paper; "most of
the industry" renders NIST's "a majority of the industry" — fine, and noted
only because the sentence sits beside a direct quote.

## The rung as a whole

**Progression: real, and the strongest thing here.** Each page installs a
question the later pages pick up by name: the label question ("what did it
learn, and from what examples?") from page 1 does work on pages 2, 4 and 6;
page 4's "who catches it when it is wrong?" is explicitly escalated by
page 7 ("That earlier page left you asking… The question gets harder here");
page 2's "the pile is the world" is quoted, linked and applied by page 7;
page 3's re-reading model pays off in page 8's "completing a document in
which that claim is true." A reader meets no forward dependency: the two
forward links that exist (`learning-from-examples` → `what-a-model-is`,
page 8 → two higher-rung pages) sit in sentences that stand unfollowed.

**Repetition: checked, and each apparent repeat earns itself.** ELIZA appears
on pages 1 and 5 making different points (label generosity supplied by the
viewer; the choice of a domain where ignorance never shows). Deep Blue
appears on pages 1 and 5 making different points (the label does not stay
put; a win for the losing approach). Nothing restates a wiki entry's facts.

**Order: correct, by luck worth naming.** The title tiebreak (`ladder()`
sorts same-depth pages by title, which curriculum writers were never told —
review finding 4 of the main review) happens to produce the pedagogically
right sequence on this rung: the model lands before the pages that could
lean on it, history lands mid-rung where its references exist, and the two
depth-2 pages close. No action needed here; the standing fix belongs to the
main review's finding.

**§2's end-capability: delivered.** "After this rung the reader can look at
any AI headline or product and know what kind of thing is being talked
about." The rung ends with the reader holding four portable questions — what
did it learn and from what; which layer is the claim about; who catches it
when it is wrong, and what does disagreeing cost the person assigned to
check; what did the milestone actually settle — and every one is taught as a
tool with worked uses, not stated as advice. A stranger who reads these eight
in order can parse a product label, a "got worse overnight" complaint, a
launch video, a milestone headline, and a harms story, each with the right
first question. That is the outcome §2 names.

## What the rung gets right, stated as plainly as the defects

- **The citation hygiene is clean.** Five external sources fetched raw, every
  quoted phrase and figure present by literal substring — including the two
  hardest, the NIST "could include false accusations" and the arXiv remedy
  sentence. Roughly eighteen further claims traced to sourced wiki facts,
  including the ones that looked most like fabrication risks (Kasparov's
  fatigue line, the ALPAC 200-hours detail, the 2026 government
  arrangements). Zero failures.
- **The wiki-as-substrate architecture demonstrably works.** The single
  unsourced-looking current-events aside on the rung (`who-builds-ai`, 2026)
  is carried, sourced, by the org entries its sentences link.
- **The rot defence is practiced.** No model names, prices, context windows
  or vendor rankings anywhere on the rung; current facts are dated asides or
  live behind entry links; AlphaFold does real work in a page that never
  types its name.
- **Jargon discipline on the six curriculum pages is exemplary.** Training,
  generalising, model, weights, open, frontier, chokepoint, automation bias,
  false positives — every term of art on those six is given its meaning in
  the sentence that introduces it. The two seed pages are the only offenders,
  and by a margin small enough to close with glosses.
- **The sendable-sentence bar is passed with room to spare.** Eight pages,
  zero `not-worth-reading` candidates, and at least five sentences on this
  rung a reader plausibly *would* send. The maintainer asked for a shining
  example; on the evidence of this rung, the surface is one.
