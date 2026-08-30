# o1 PHASE-1 FINDINGS (sealed — written before design.md was opened)
Date: 2026-08-29 (local)

## RE-MEASURED CLAIMS — all four hold

Own script `o1-verify.mjs`, transcribing curriculum §4/§5 by hand and parsing
`content/learn/` front matter from disk:

- level counts orientation 8 / foundations 11 / mechanics 11 / advanced 7,
  total 37, new 27, edit 2, existing-untouched 8 — MATCHES the claim.
- 57 suggested mentions, 0 unresolved against 495 wiki files on disk.
- 0 cycles, 0 up-the-ladder edges, 0 dangling prerequisites.
- All 37 outcomes pass both learnSchema refinements; all 37 are "You can ".
- Replicating lib/learn.mjs ladder(): first = what-ai-actually-is,
  last = how-to-think-about-what-comes-next, 0 forward violations.
- Existing pages' levels and (untouched) prereqs match disk exactly.
- No test pins LEVEL_BLURBS (proposal's grep claim verified).
- `not-worth-reading` and `spec-violation` are real REASONS in loop/lib/verdict.mjs.
- Task-order "Needs" lines are a correct topological order; every
  "prerequisites already published" claim checks out against content/learn/.
- task 1.1's call site (beside checkPrerequisiteCycles in site.mjs:67) is
  immediately before `site.diags.throwIfErrors('surfaces')` — satisfies the
  scenario's "before any page renders".
- The monotonicity check + existing depth sort really do PROVE the in-order
  guarantee (cross-rung: earlier rung sorts wholly earlier; same-rung:
  depth(p) >= 1+depth(q) so strict). The proposal's reasoning is sound.

Verdict on §3-of-my-brief: the author's verification claims are accurate.

## FINDINGS

### F1 (BROKEN, high confidence) — 10 must-cover items instruct pages to lean
on undeclared prerequisites, which the change's OWN spec makes a rejection.

Spec delta line 90: pages "SHALL assume, among learn pages, only its
transitive prerequisites. A page that leans on a page it does not
(transitively) declare SHALL be rejected in review as `spec-violation`."
Curriculum §3 failure mode 6 repeats it. "Done means" requires every
must-cover item present. Both cannot be satisfied for:

  what-models-are-trained-on   -> why-models-are-confidently-wrong
  why-bigger-got-better        -> why-models-are-confidently-wrong
  why-bigger-got-better        -> "the benchmark page's smooth-loss/jagged-metric
                                  section" (l.583, unbackticked)
  what-a-reasoning-model-does  -> why-models-are-confidently-wrong
  how-a-model-uses-your-documents -> how-models-are-trained ("the argument X
                                  makes, applied") and why-models-are-confidently-wrong
  running-a-model-yourself     -> where-your-words-go ("pays off")
  ai-and-the-law               -> where-ai-fails-people
  what-it-costs-to-build-and-run-ai -> who-builds-ai
  how-to-think-about-what-comes-next -> ai-and-work ("'s lesson, generalised")

Five other backticked cross-refs ARE benign forward seeds/defers ("seeds",
"deferring to", "pre-seeds") and one ("ai-and-work -> connect to
what-models-are-trained-on") reads as the inline link §3 sanctions.

Cost if unfixed: the reviewer follows the spec and rejects; or the writer
follows §3 and drops a must-cover item; either way one of the two documents
is wrong and a run stalls. Repeated across 9 pages.

FIX IS CHEAP AND I VERIFIED IT: all 10 edges are down or same-rung, so
declaring them is legal. Adding all 10 keeps the graph acyclic, keeps 0
up-edges, keeps 0 forward violations, keeps first/last unchanged.
(`o1-repair.mjs`.)

### F2 (BROKEN, high confidence) — "the curriculum of record" is anchored to a
document that archiving moves.

Spec delta l.61: "The curriculum of record is `curriculum.md` in this change."
Requirement 2 is a permanent SHALL NOT ("A learn page SHALL NOT publish unless
it appears in the curriculum"). On archive the requirement merges into
`openspec/specs/education-static/spec.md` while curriculum.md moves to
`openspec/changes/archive/`. `openspec/specs/` is empty today, so nothing has
been archived yet and the pattern is unproven. The proposal notices archiving
order matters but only for the delta base, not for this pointer.
Cost: within one archive cycle the standing obligation points at an archived
path and quietly stops being followed.

### F3 (BROKEN, medium-high) — no length guidance, against 5-6 item must-cover lists.

Existing pages: 735-1192 words (mean ~970). The curriculum states a target
length exactly once, in passing, for one page ("in a thousand words",
l.238). Entries like the-safety-debates, what-it-costs-to-build-and-run-ai,
where-ai-came-from and ai-and-the-law carry 5-6 substantial must-cover items
plus a through-line. A weak model with no length target and an explicit
"every must-cover item must be present" checkbox writes 2500 words, which IS
failure mode 5 ("the pile"). One sentence in §3 fixes it.

### F4 (BROKEN, medium) — six entries require dated, sourced external facts
that neither the corpus nor the curriculum supplies.

where-ai-fails-people ("hiring, credit, face recognition ... as dated asides
with sources"), ai-and-work ("productivity effects, adoption patterns — as
dated asides with sources"; the teller/ATM story), what-models-are-trained-on
(annotator labour "as dated asides"), what-it-costs-to-build-and-run-ai
("energy and water as measured quantities with dates and sources"),
ai-and-the-law (case status), where-your-words-go (retention).
External anchors ARE permitted (existing pages carry arxiv/HF links; the
origin allowlist governs subresources, not <a href> — checked lib/origins.mjs
HREF_IS_SUBRESOURCE). So it is not a build blocker. It IS the place a Desk
job fabricates a citation, and these are socio-economic/environmental figures,
not ML papers. §3's "Traps" never says what to do when you cannot source a
dated aside. `false-or-unsupported-claim` is a real rejection reason.

### F5 (JUDGMENT / real gap) — "coherent, progressive, top to bottom" is not
what the generated order delivers, and 6.2(c) does not measure it.

Within a rung the order is depth, then TITLE ALPHABETICAL. Measured: 33 of 37
pages sit in a same-level-same-depth band of size > 1, i.e. their position is
decided alphabetically. Consequences a reader would feel:
  - foundations OPENS with `open-weights-and-closed-models` (release
    postures), before `what-a-neural-network-is`.
  - `where-your-words-go` (privacy) lands before `how-a-language-model-works`.
  - mechanics OPENS with `running-a-model-yourself`.
Task 6.2(c) checks only first page, last page, and no-page-before-its-prereq
— all of which pass while the middle is alphabetised. The maintainer's words
in proposal.md l.5-9 ask for progression; the artifact verifies ordering.
The design has also locked itself out of the obvious lever: §3 says
prerequisites are "true assumptions, not recommended reading", so they cannot
be used to force pedagogical order.

### F6 (COVERAGE HOLE, high confidence) — reinforcement learning is never taught.

`learning-from-examples` teaches supervised learning only ("show examples,
measure wrongness, nudge"). Zero occurrences of "reinforcement", "reward",
"self-play" in the 27 new entries except two mentions-list slugs.
But: `where-ai-came-from` must cover AlphaGo "and what each did and did not
prove" with no RL available; `how-models-are-trained` (existing, mechanics,
position 22) uses "reinforcement learning" and "reward model" as assumed
terms; `what-a-reasoning-model-does` must cover "verifiable rewards".
A reader who finishes all 37 pages has no concept of learning from reward.
The wiki also has no `concept/reinforcement-learning` entry.
(The how-models-are-trained instance pre-dates this change; the claim that
the surface now teaches the whole subject is what makes it a finding.)

### F7 (COVERAGE HOLE, medium confidence) — no embodiment anywhere.

Zero occurrences of robot / self-driving / autonomous / embodied in 940
lines. `the-kinds-of-models` enumerates classifiers, transcribers,
recommenders, embedders, generators, multimodal — no control/policy models.
`what-ai-is-used-for` lists ranking, fraud, translation, transcription,
photography, chat, code, images, voice, AlphaFold. Someone who "knows
nothing" finishes the surface unable to say what happened to self-driving.
Related, weaker: nothing on AI as companion/therapist/tutor, which is live
subject matter for a site whose stated reader is "addicted to AI".

### F8 (BROKEN, low cost) — foundations bans notation; one entry requires it.

§2 foundations admission test: "equations and notation are not [fine]".
Spec delta l.95: "pages below mechanics SHALL contain no equations or
notation." `how-machines-represent-meaning` (foundations) must cover "the
arithmetic folklore (king - man + woman)". A literal executor is in direct
conflict. Trivially fixed by writing it in words.

### F9 (MINOR) — one restated normative sentence has no §7 row.

Enumerated 15 normative sentences in the delta; 14 map to a §7 row. Unmapped:
"The ladder's index page SHALL be generated from these declarations, never
hand-maintained." It is carried over from the baseline and already implemented
by lib/learn.mjs, so cost is ~0 — but the delta's preamble claims "Every
normative sentence below names ... the task that implements it", so the claim
is very slightly false. Report as accuracy, not as risk.

### F10 (JUDGMENT) — "no learn page publishes outside the curriculum" is an
instruction where a mechanism was available.

CLAUDE.md: "Guardrails are mechanisms, not instructions." A prebuild STEP
comparing `content/learn/*.md` slugs against the curriculum's §4 headings is
~15 lines and would make requirement 2 self-enforcing. The change chose review
instead. Combined with F2 this is the requirement most likely to rot.

## NOT FINDINGS (risks the change already names)
- where-your-words-go may be too thin -> entry names the merge fallback.
- getting-good-answers may drift into tutorial territory -> entry says
  "hold this line or cut the page".
- the-safety-debates needs adversarial review from both sides -> entry says so.
- Area B has exactly one page -> entry explains the wiki's event entries are
  the record.
- Every entry carries a "Beats the alternative by" line, which wires each page
  to the baseline spec's third requirement and doubles as the page's thesis.
  This is the artifact's best feature and it materially mitigates F3.

## EXECUTABILITY SPOT-CHECKS
- what-ai-actually-is (orientation root): executable. Minor tension between
  the outcome ("place ... image generators on one map") and must-not ("model
  families (foundations)"), resolved by reading both.
- how-machines-represent-meaning (foundations): executable except F8.
- what-it-costs-to-build-and-run-ai (advanced): the weakest. Its energy/water
  item (F4) is the single must-cover item in the catalog I judge a weak model
  cannot satisfy honestly and offline.
- §0 step 2 tells every writer to read three voice samples, all of which are
  orientation/foundations pages. An advanced-page writer gets no advanced
  voice sample. Minor.
