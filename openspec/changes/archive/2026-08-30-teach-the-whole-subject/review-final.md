# Final review — the learn surface, before push

Final pre-push review, 2026-08-30, by a fresh-context reviewer with no edit
rights and no authorship stake. All 38 pages read in full, in the generated
reading order. All five rung/whole reviews read **after** my own view was
formed, per the house rule. Everything numeric below was measured by script
against the working tree at HEAD, not recalled.

## 1. Verdict

**Yes — after two named prose fixes.** This surface is up to my standard of
quality and excellence and is ready for a live public site **once the two
blocking items in §6 are committed** (both are one-clause edits; both are
already recorded in open issues). Until they are done, it is not ready.
After they are done, push without further review.

That is a real yes, not a hedge wearing one. I read all 62,000 words looking
for the thing that would embarrass the maintainer on day one, and I found
exactly two sentences — both already caught by this project's own review
machinery and both sitting unfixed in open issues because a repair pass
inherited an incomplete list. Everything else I found is either already
filed, repo-internal, or below the threshold a knowledgeable reader would
hold against the site. The maintainer asked for *"amazing and a shining
example"*, which is a different bar from *correct*, and my answer to his
actual sentence is in §8: this surface clears it.

## 2. What I measured rather than trusted

Method: scripts in the session scratchpad (`final-measure.mjs`,
`final-git-check.mjs`, `final-git-diffsize.mjs`, `final-fc8-sweep.mjs`,
`final-register.mjs`), all reading front matter through the repo's own
`gray-matter` and importing `ladder()` from `lib/learn.mjs` directly, so the
order measured is the order the build produces. Git plumbing via Node
`execFileSync` per the MSYS note. External spot-checks by live fetch.

- **38 pages** in `content/learn/` (plus README). Distribution:
  **orientation 8, foundations 12, mechanics 11, advanced 7.** First page in
  generated order `what-ai-actually-is`, last
  `how-to-think-about-what-comes-next`. Coverage set-equality against
  curriculum §4: exact, both directions, at 38.
- **Word counts** (whitespace tokens of the body, markdown syntax included,
  so ~8% above prose-only counts): 972–3,535 per page, median 1,366, total
  62,497. The capstone sits at **depth 9, alone in its band** —
  `measurements.md` says depth 8; the added
  `how-a-language-model-works ← how-machines-represent-meaning` edge
  deepened the graph. Conclusion unchanged, number stale.
- **Prerequisites**: every page's front matter matches its curriculum §4/§5
  record exactly. No page appears before one of its prerequisites; no edge
  points up the ladder (both properties re-derived, not taken from the
  build).
- **Git history of all ten pre-existing pages** (`git log --follow`, body
  diffed between first commit and HEAD). Four were rewritten and the
  curriculum says so, with the right dates: `what-a-model-is` (83ee6af),
  `why-models-are-confidently-wrong` (83ee6af),
  `how-a-language-model-works` (6583d8c), `how-models-are-trained`
  (3d61355). **The other six — every page the curriculum still marks
  `existing, untouched` — also have body changes** (19/15, 23/19, 13/18,
  6/3, 29/24, 53/44 insertions/deletions): term-of-art glosses,
  de-bulleting, and em-dash-to-period conversions from the 2026-08-30 gloss
  and repair commits (3d61355, 79466a8, 3bbd945). Details in §4.
- **The fc8 sweep** the issue asked for and nobody had run: every learn slug
  named in a §4 entry's prose, checked against that entry's transitive
  closure computed from actual front matter. **17 entries name at least one
  out-of-closure page.** I then classified each by hand: every one is a
  deferral, a seed, a must-not boundary ("X owns it"), or an explicit
  do-not-lean writer's note — none is an instruction to lean. The three
  instruction-shaped instances fc8 confirmed were reworded (7db206e,
  5c5914c) or written around (`ai-and-work`). No published page leans on an
  undeclared prerequisite that I could find.
- **Register** (em-dashes + semicolons per 1,000 body words, headings and
  link targets stripped): the `addictedtoai-kwj` picture has changed
  materially. `what-a-model-is` went 23.92 → **0.00** and
  `how-a-language-model-works` 12.64 → **0.00** (rewrites); the six glossed
  seed pages dropped to 5.41–8.67. **The new top outlier is the rewritten
  `how-models-are-trained` at 17.15/1k** — the most-cited page on the
  surface, four times the wave median, above everything it was rewritten to
  sit among. See §7.
- **Live spot-checks of my own** (not inherited from prior reviews): both
  DeepSeek-R1 quotes on `what-a-reasoning-model-does` verified verbatim
  against the live arXiv abstract (v2, 2026-01-04 — the page's "later
  published in Nature" dating is right). The `who-builds-ai` 2026
  government-access asides verified as carried by dated, sourced wiki events
  (`org/openai` 2026-06-26 row and the June 2026 executive-order paragraph;
  `org/anthropic` "access restored… following US government approval") — the
  substrate carries what the prose asserts, which is the architecture
  working. The BLS teller figure I did not re-litigate: the verdict record
  `data/reviews/seed-learn-ai-and-work.md` documents the full saga (correct
  339,200/2025 → wrongly "corrected" from a stale snapshot → re-verified
  live at HTTP 200, `347` occurring zero times) and it is the most
  thoroughly verified number on the surface.
- **Banned-phrase sweep**: "inevitable", "delve", "let's dive", recap
  closers — zero across all 38.
- **tasks.md**: 33/33, zero unchecked.

## 3. Task 1 — do the pages honour their instructions?

**Yes, to a degree I have not seen on any comparable corpus.** I read every
page against its §4 entry; for the orientation and advanced rungs, and for
`machines-that-act-in-the-world`, line by line against every must-cover beat
and every must-not.

**Rung admission tests.** No page sits on the wrong rung by the
what-does-it-assume test. The two 2026-08-30 orientation rewrites cleared
the defects the orientation review named ("expected value", "calibrated",
programmer-vocabulary checker examples — all gone; sampling and rounding now
taught in plain words before use). The advanced review's vocabulary findings
(residual stream, activations, kernel, experts, accelerator) are all closed
by glosses I verified in the current text. The one page whose closure is
deliberately thin, `running-a-model-yourself`, re-derives tokens and context
for itself exactly as §5 records.

**Must-cover / must-not.** Sampling deeply: orientation 8/8 clean (one
recorded deviation, the hiring case — see §4); advanced 7/7 clean;
`machines-that-act-in-the-world` delivers all six beats and respects every
must-not, including the two one-sentence-only fences. Two soft overshoots
worth naming, neither a violation: `how-ai-systems-get-attacked` grew its
mandated "one paragraph" on poisoning into a short section (the 250-document
result earns it, but the entry was not amended), and
`running-a-model-yourself` adds MoE and KV-cache material beyond its entry
(earned, mentions resolve, no must-not touched).

**The sendable-sentence test.** I can name the sentence for all 38 pages,
and for the pages I read closest they are genuinely sendable, not
nominations of convenience: "AI did not arrive in your life on the day it
started talking to you"; "A winter is a verdict on the promises, not on the
work"; "An accuracy rate is a promise made to the people the examples had
most of"; "Volume does not bring wisdom; it kills coincidences"; "Every
other family's pile was lying somewhere, waiting to be collected. This
family's has to be performed"; "A quality filter does not measure quality";
"Opt-out is the name for a switch whose default position is on"; "A closed
model can be switched off. An open one can only be regretted"; "A sixth
finger is wrong in a few hundred pixels, and pixels are the only thing the
score has ever counted"; "The field can predict the loss of a model nobody
has built yet, and cannot explain the abilities of the models it already
has"; "Whether training or serving dominates a model's lifetime cost is not
a fact about the model but a fact about how many people use it"; "The
alternative to a forecast is not silence; it is a watchlist." Zero
`not-worth-reading` candidates. Roughly 30 of 38 pages set exactly one
sentence in bold — a house convention, consistent enough to notice,
functional enough to keep.

**The voice.** Flat declarative, mechanisms confident, uncertainty as dated
findings, no hedges, no recap closers — held across ~30 curriculum-wave
pages written by many hands, which is the hardest thing here and the
easiest to fail silently. And to the harder question — does it read as
though a person had something to say — yes, and I can point at the
evidence: pages keep doing things no instruction asked for.
`when-you-cannot-trust-your-eyes` refuses to print spot-the-fake tips and
makes the refusal its argument. `what-it-costs` invents the
open-weights-price-floor observable. `ai-and-work` notices the
occupational-classification lag and turns it into "every reading of the
totals is tilted a little toward loss." That is authorship, not discharge.

## 4. Task 2 — the record, and the shape

### The record

**measurements.md at 37 is a clerical lag whose numbers I re-ran, and one of
its claims is now false at HEAD.** Coverage set-equality: still exact at 38.
First/last page: unchanged. In-order guarantee: holds. Distribution: the
foundations row now reads 12, not 11. Capstone depth: 9, not 8 (still last,
still alone in its band, so the "consequence of the graph" argument
survives). Symptom or clerical? Both: the record is honest about its own
commit (5dcf76b) and re-runnable, but it belongs to the same class as the
next finding — the map trailing the territory with no mechanism forcing it
to catch up.

**The Status-line audit is the real Task-2 finding.** Four entries say
"rewritten 2026-08-30" and git confirms all four, with the right commits.
(The brief said three lines changed; it is four — `what-a-model-is`,
`why-models-are-confidently-wrong`, `how-a-language-model-works`,
`how-models-are-trained` all previously claimed untouched bodies.) But the
§4 preamble defines Status as exactly `new` / `existing` (untouched) /
`edit` (front matter only), and **all six pages still marked `existing,
untouched` have glossed bodies** — real edits, 9 to 97 diff lines each,
from the very commits that closed the reviews' findings. The
`how-inference-is-served` entry is internally contradictory: its own prose
records the accelerator-gloss decision ("six words on the page close this")
while its Status line still says untouched. Nothing here is deceptive — the
glosses are review-driven repairs, commit-logged — but the curriculum's own
vocabulary is now false in six places, in a document whose §0.5 exists
because "a map that misstates the territory gets believed." The right
answer: add a fourth Status value, `glossed <date>` (or amend the six lines
to say what happened), in one commit, and fold it into the c29 mechanism
discussion. Not a push blocker; a record-integrity debt.

**fc8** — the workaround was uniform and no page got it wrong (see §2, the
sweep). One count discrepancy for the record: measurements.md says "nine
pages reported the same curriculum defect"; the fc8 issue text confirms
three instances; §5 says nine *edges* exist because must-cover prose leans.
The reconciliation I believe: nine leaning-shaped entries got their edges
declared preemptively (3abf35c), three instruction-shaped cross-references
were caught by writers and reworded. The class survives as 17 entries of
harmless deferral-shaped name-drops; the mechanical check fc8 proposes (my
sweep script is 80% of it) is still worth building, because the curriculum
will keep being edited.

**c29** — all three deviations are still unamended, exactly as the issue
says: `where-ai-fails-people`'s entry still demands the hiring case
(f7l documents why it was correctly cut); `what-ai-is-used-for`'s entry
still lists recommendation as a separate must-cover (the page folds it into
ranking, defensibly, per 88x); `the-hardware-that-runs-ai`'s entry still
asks for "design concentrated in one company" (the page delivers
lithography-plus-packaging and hands industrial structure to
`who-builds-ai` — a better division, and the map does not know it). The
issue's diagnosis is right: the writers disclosed, the disclosures live in
finished documents, and no one holding the curriculum pen acted. The right
answer is c29's own suggestion — a deviation queue the pen-holder is
obliged to read — plus the three one-line amendments, which I have listed
in §7 so they can be made mechanically.

**Corrections marked in place — each verified true now.** The
`looking-inside-a-model` writer's-note correction: `what-a-neural-network-is`
*is* in that page's closure (via `how-a-language-model-works`) — true. The
measurements.md slug→title correction: `lib/learn.mjs:114` sorts
`d.get(a.slug) - d.get(b.slug) || a.data.title.localeCompare(b.data.title)`
— true. The §4 amendment's claimed reseating (meaning page to 13, language
model to 16; machines-that-act second in its band behind the language-model
page): all confirmed by my replication of the build's own `ladder()`. The
capstone's winters/Lighthill contradictions the whole-surface review found:
fixed in the current text (both pages now count the same two winters;
Lighthill is 1973 everywhere on the surface; the wiki-side convention issue
is filed as i9u).

### The shape — do I agree with it?

**I agree with it, and I mean "right", not "defensible."** The two design
decisions doing the most work are the assumption-not-difficulty rung test
(which is what lets law sit on mechanics and history on orientation without
the ladder lying) and areas-orthogonal-to-rungs (which is what made the
embodiment gap *visible* enough to be caught and filled). The distribution
is right: orientation at eight pages is a lot of rung-zero reading, and
every one of the eight earns its seat serving exactly the all-audiences
reader the founding instruction names.

Where I would differ, and why I am not acting on it: the within-band
alphabetical seating leaves two lurches the curriculum itself records as
open — foundations opening on `open-weights-and-closed-models` before the
reader meets a neural network, and mechanics running three long applied
pages before `how-models-are-trained`. I checked whether the title lever
can fix either without bending a title: it cannot (the mechanics hub sits
alone at depth 5, so no title moves it; the foundations fix would need a
title contorted to sort before "Open…", which §3 forbids). The remaining
honest fixes are false edges (forbidden, rightly) or acceptance. I accept
them, for the reason the reviews established: no page in those stretches
assumes anything unmet, `running-a-model-yourself` deliberately re-derives,
and the lurch is a channel change, not a hole. The map records both as
open, which is the correct state for a judgment call a future editor might
re-make.

One coverage judgment the whole-surface review wanted and nobody recorded:
the "is it conscious / does it understand" question is answered only by
disciplined, scattered refusal (ELIZA's projection lesson; "which part is
actually mysterious"; "an argument about a word"). I judge the refusal
correct and the scatter acceptable — the three treatments are each in the
right place — but the *decision* to answer by refusal deserves a D7-style
line in the design doc so the next editor doesn't mistake it for an
oversight. Listed in §7.

## 5. Where I disagree with prior reviewers

The five reviews are the best part of this project's record — adversarial,
instrumented, and honest about their own blinds. My disagreements are few
and mostly about severity:

1. **The foundations reviewer rejected `how-a-language-model-works` — and
   was right; recorded here because the rejection worked.** The rewrite is
   now among the strongest pages on the surface. No disagreement; a
   verification that the gate produced the fix.
2. **The whole-surface reviewer flagged `who-builds-ai`'s 2026 aside as
   "no source of any kind" in prose.** I side with the orientation reviewer
   against this: both halves are carried by dated, sourced wiki events that
   the sentences link in-line. On this site, the entry link *is* the
   citation; demanding an inline external URL on an orientation page would
   cut against the substrate architecture. No fix needed.
3. **The foundations reviewer's F2 (BLS teller figure "almost certainly
   wrong year") was itself wrong** — understandably, from extractor
   readings it correctly labelled untrusted. The live page said 339,200 in
   2025 all along; the subsequent "repair" from a stale snapshot introduced
   the error, and the verdict-record reviewer caught it by refetching with
   a browser UA. I record this because it is the project's clearest lesson:
   the reviewer who wrote "stated at its honest strength: the figure could
   not be confirmed" did everything right *except* the second fetch method,
   and the error still propagated into an edit. The standing rule (never
   conclude unreachable from one method) earned its place here.
4. **The rung reviews recorded "every must-cover beat present" for
   `what-ai-is-used-for` without testing recommendation** — the 88x
   verdict-pass reviewer caught by grep what the rung review asserted by
   recollection. My sympathy is with 88x: a completeness claim that was not
   measured is the failure, not the page.
5. **The advanced reviewer judged the `machines-that-act` opening-examples
   defect non-blocking "for consistency" with a same-class precedent.** I
   disagree with the severity call, not the analysis: the
   `how-machines-represent-meaning` "every image generator" precedent was
   fixed in the repair pass, so consistency now argues for fixing this one
   too — and unlike that one, this one sits in the load-bearing opening of
   its page. I have promoted it to blocking (§6).
6. **kwj's register numbers are stale and its worst-offender list is now
   inverted** — the pages it named were rewritten to 0.00, and the new
   outlier (17.15/1k) is a page *from the curriculum wave*. The issue's
   thesis (seed pages carry the tells) no longer describes the tree; the
   remaining question is only whether the rewritten hub's register is worth
   a pass. See §7.

## 6. Blocking items — fix before push, in order

Two. Both one-clause prose edits; one commit; re-run gates; push.

1. **`content/learn/where-ai-came-from.md` — the "its author" sentence.**
   *"A rebuttal appeared within a week of its publication in 2019, and its
   author has since put today's chatbots on the wrong side of his own
   distinction."* The verified fact is Sutton's (wiki
   `concept/the-bitter-lesson`); the nearest antecedent is the rebuttal,
   whose author is Brooks. As written, the natural parse attributes
   Sutton's position to Brooks — a misattribution-by-ambiguity about two
   named, living researchers, on the surface's flagship history page, in
   the one sentence where attribution is the point. Found by the
   orientation review (F5), confirmed by 4wm, missed by the repair pass
   twice. Fix: *"…and the lesson's own author has since put today's
   chatbots on the wrong side of his own distinction."* Five words.
2. **`content/learn/machines-that-act-in-the-world.md` — the opening
   overstatement.** *"Underneath is the machinery you know … and none of it
   changed on the way to the steering wheel"* — spent on the two examples
   (robot vacuum, lane-keep assist) least likely to be learned end-to-end;
   production lane-keeping is a learned detector feeding a hand-written
   controller, which the page's own later fence paragraph says, framed as
   guardrails rather than as the controller itself. A robotics-literate
   reader catches this on day one, in the page's second paragraph. The
   page's own approve record names it and the one-clause repair ("the
   learned part of it is the machinery you know" or equivalent). Fix it as
   the record prescribes; the argument survives untouched.

That is the whole list. I looked hard for a third — through every dated
claim, every quote, every rung boundary — and did not find one that a
knowledgeable reader would hold against the site rather than file as a nit.

## 7. Non-blocking items worth filing (or already filed — noted)

Already filed, needing only action, not new issues: **c29** (three
curriculum amendments: fold recommendation into ranking on
`what-ai-is-used-for`'s entry; drop or replace hiring in
`where-ai-fails-people`'s entry pending f7l's source hunt; rewrite
`the-hardware-that-runs-ai`'s chokepoint beat to "lithography and packaging;
industrial structure lives on `who-builds-ai`"), **bc0** items 1–3 (the
"six words" count on the reasoning page; an as-of clause on the costs
page's Epoch quote; re-date the capstone's "as of March 2025" to the
tracker's own Updated line), **f7l**, **fc8** (build the sweep — my
`final-fc8-sweep.mjs` in the scratchpad is most of it), **88x** item 2
(org/nvidia entry should carry the fabless/Taiwan fact), **i9u**, **jqs**,
**4i2**, **47w**, **bd1**, **ckn**, **0pf**.

New items, from this review — file each as its own issue:

1. **Six `existing, untouched` Status lines in curriculum §4 are false.**
   The six seed pages (`why-context-is-not-memory`,
   `what-a-benchmark-measures`, `what-an-agent-is`,
   `how-inference-is-served`, `what-safety-training-changes`,
   `why-the-same-request-gives-different-answers`) all have glossed bodies
   from commits 3d61355 / 79466a8 / 3bbd945 (diff sizes 9–97 lines).
   Fix: a `glossed 2026-08-30` Status value or six amended lines, and
   update the §4 preamble's three-value vocabulary. Include the
   `how-inference-is-served` internal contradiction (entry prose records
   the gloss; Status denies it).
2. **measurements.md is stale at 37 pages.** Re-run its script at HEAD and
   update: 38 entries/pages, foundations 12, capstone depth 9 (still last,
   still alone in band). Note in the record that the 2026-08-30 figures
   described commit 5dcf76b.
3. **`how-models-are-trained` is the surface's register outlier after its
   own rewrite: 17.15 em-dashes+semicolons/1k words**, four times the
   wave median, highest on the surface (kwj's old worst offenders now
   measure 0.00–8.67). The dashes are doing legitimate appositive work
   (in-line definitions), so this is a judgment pass, not a quota: decide
   whether the hub page gets one de-dashing edit, and update kwj's stale
   numbers either way.
4. **`ai-and-the-law` and `how-ai-systems-get-attacked` are still prose
   orphans** — no other page's body links them (measured: one inbound
   prose link exists to `how-a-model-uses-your-documents`; none to these
   two). The whole-surface review prescribed the fix: one sentence in
   `what-models-are-trained-on` ("the legal fight is its own page") and
   one in `what-an-agent-is` pointing at the attacks page. A
   link-navigating reader currently cannot discover two of the surface's
   best pages.
5. **Record the two standing texture decisions** the whole-surface review
   asked for and nobody wrote down: (a) the remaining six seed pages keep
   their compressed register (the glosses narrowed the seam; the two worst
   boundary crossings the review named no longer exist after the rewrites)
   — or schedule re-voicing; (b) the consciousness/understanding question
   is answered by deliberate, distributed refusal (ELIZA, "which part is
   actually mysterious", "an argument about a word") — one D7-style
   paragraph in design.md so the next editor knows it was chosen.
6. **Two paraphrase-precision notes living only in finished documents**,
   rescued here per the deferral rule: the weavers'-wages comparative
   ("against other workers'" is the page's addition to Bessen — source or
   soften; recorded only inside `seed-learn-ai-and-work.md`), and the fc8
   count discrepancy (measurements.md "nine pages" vs the issue's three
   confirmed instances vs §5's nine edges — one clarifying sentence in
   whichever document outlives the others).
7. **The `how-ai-systems-get-attacked` poisoning section outgrew its
   entry's "one paragraph"** and `running-a-model-yourself` teaches
   MoE/KV-cache beyond its beats — both improvements, both unamended.
   One-line §4 amendments each, same class as c29.

## 8. What the surface gets right, stated as plainly as the defects

Calibration requires this section to be believed, so: I came to this review
expecting to find the usual failure of ambitious explainer projects —
coverage bought with survey prose, confidence bought with hedged sourcing —
and I did not find it.

- **The sourcing discipline is the best I have seen on any public
  explainer, full stop.** Across the five prior reviews, roughly two
  hundred literal-substring probes against fetched bytes; across mine,
  every spot-check landed. The failures across all of it: one dropped
  "not" (fixed), a handful of one-word paraphrase loosenings (fixed), one
  prize-pool misreading (fixed). The pages quote accurately *at the awkward
  level* — the judge who ruled for the lab saying "the answer will likely
  be yes", the system card's self-undermining parenthesis, the mirage
  paper's own hedge. A corpus that italicises its own counter-evidence has
  earned the reader's trust it asks for.
- **The rot defence is practiced, not proclaimed.** Zero undated model
  facts, prices, or benchmark scores across 38 pages; volatile values ride
  transclusions or dated asides; the riskiest pages (who-builds, law, work,
  costs, what-comes-next) are built role-first and questions-first so they
  survive the news cycle that will arrive next week.
- **The connectedness is real and load-bearing.** Plant-and-payoff
  structures span rungs — "the pile is the world" planted at page 2 and
  spent at pages 7, 15, and 17; prediction-without-explanation banked at
  page 31 and spent by the capstone in those words; the refusal direction
  taught on one page and re-read as evidence on the next. The capstone
  could not exist without the ladder under it, which is the definition of
  a surface rather than a shelf.
- **The maintainer's own fascination — that nobody knows why the
  parameters organise into something that behaves like understanding — is
  covered extensively, cited, and reads as the most interesting thing on
  the surface**, which is what he believed it was. It is the spine, not a
  discharged obligation: "Written nowhere" and "Which part is actually
  mysterious" on `what-a-neural-network-is`; the must-covered epistemic
  state of `why-bigger-got-better`, cited to Kaplan, the emergence
  dispute, and grokking, compressed into the surface's best sentence; the
  two-kinds-of-not-knowing section of `looking-inside-a-model`, which
  distinguishes what interpretability has shrunk from what it has not
  touched and cites both. His over-simplified sentence came out true,
  rigorous, and sourced — the exact landing he asked for.
- **The review system itself worked.** Five sealed reviewers found ~40 real
  defects; the repair and rewrite commits closed all but the handful now
  sitting in open issues; a rejection produced the surface's best rewrite;
  a wrong "correction" was caught by a reviewer who refetched. The two
  blocking items in §6 are not evidence the machine failed — they are the
  residue of a repair list nobody checked for completeness, which 4wm has
  already diagnosed.
- **On the seed-wave discontinuity the brief asked about**: still
  detectable — six compressed pages against thirty-two essays, visible in
  length, openings, and register density — but materially narrowed (the
  two worst boundary crossings identified by the whole-surface review no
  longer exist; four seed pages were rewritten into the wave's register,
  six were glossed toward it). To a reader who does not know the history
  it now reads as reference-card-versus-essay texture, both registers
  good, and I would not spend further inference flattening it beyond the
  §7.3 judgment pass.

The founding instruction was four promises: coherent progressive; the
whole subject top to bottom; a stranger ends with thorough understanding;
approachable at every rung. Measured separately, as the framings demand:
the order climbs and never sends a reader forward (measured); the six
areas are all served and the one true gap found by review — machines that
act — was filled with one of the surface's best pages (measured); the
stranger who reads all 38 ends holding causal machinery and a watchlist,
not vocabulary (judged, page by page); and the tone constraint held hard
enough that the two pages that broke it were rewritten rather than
excused. Fix the two sentences in §6, run the gates, and push it.
