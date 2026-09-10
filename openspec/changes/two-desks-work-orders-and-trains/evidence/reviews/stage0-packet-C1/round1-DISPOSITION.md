# Packet C1, round 1 — TWO SEALED REVIEWS, A SPLIT VERDICT, AND WHY IT MERGED

Local date: 2026-09-09. Authority commit `3025c58`, which is also the merge
base — `main` did not move between the freeze and the merge, so the branch diff
is the whole change.

**A `revise` became a merge. This file exists so that a later reader can find
that decision and its reasoning without asking anyone.**

## The round

| | Model, rung | Powers | Verdict | On the implementation |
|---|---|---|---|---|
| `round1-REVIEW-muse-xhigh.md` | Muse Spark 1.3, xhigh, OpenCode plan agent | read and run only — edits denied by the harness | **approve** | no must-fix |
| `round1-REVIEW-luna-max.md` | gpt-5.6-luna, max, codex | full, mutates and restores by hash | **revise** | **no must-fix** |

The two reviewers **do not disagree about the tree**. Luna's own sentence:

> The implementation itself has no remaining must-fix finding; the verdict is
> `revise` for the author brief defect.

Both counted the seven pre-existing red cases independently and both got seven,
which is the result the review brief says outranks everything else in the report.
Both found the pointer defect below. They differ only on where the verdict
attaches: Muse files it against the brief and approves the code; Luna makes it
the single must-fix, classed `broken-reference / spec-violation`.

**Two reviewers with DIFFERENT POWERS was deliberate.** The plan agent cannot
write, which is what makes it safe on a tree it must not touch, so asking it to
mutate would have bought a review claiming arms it never ran. Its brief required
it instead to tie every changed line to a QUOTED assertion and to declare every
line it could not tie. Two reviewers reaching one conclusion along different
evidence paths is worth more than two reaching it along one; two given the same
method would have been the shared instrument this change keeps being bitten by.

## THE FINDING, ACCEPTED

`round1-agent-brief.md:207` sends its reader to
`openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md` for the
requirement. The requirement is at `specs/review/spec.md:434`,
`### Requirement: A reviewer's non-blocking finding reaches work without editing
anything`. The loop delta returns **zero** hits for that title and prints
seventeen other requirements instead.

The blob existed, the command ran, and it printed something plausible. That is
why nothing caught it: **a correct answer to a question nobody asked.** The loop
delta is where this change puts most of its requirements, so "the loop delta"
was the plausible default, and a plausible default is exactly what nothing
verifies.

The first draft of the *review* brief carried the identical pointer. It was
caught before dispatch by the second-model brief review
(`round1-brief-review-muse-review-1-REFUSED.md`) and corrected; the author brief
had already been dispatched hours earlier and could not be.

**Luna's finding is accepted. It is not overturned and it is not downgraded.**

## THE PRESCRIBED REPAIR WAS DELIBERATELY NOT MADE

Luna prescribes: *"Replace the pointer with the review delta at the authority
commit."* That edit cannot be made where it is asked.

`.agent-brief.md` is **untracked**, lives in a **worktree that is discarded at
teardown**, and belongs to a **round that has completed**. A round 2 whose only
diff is a file nothing tracks produces a green that means nothing, costs an
author round and a review round, and teaches the fleet that a verdict can be
discharged by an unobservable edit — which is the precise class of defect this
change has spent its rounds removing.

## WHAT DISCHARGES IT INSTEAD — the cause, not the symptom and not the detector

1. **The template pointer is corrected**, so no future round of any packet
   inherits it.
2. **The brief linter gained a ninth check.** Every `git show <sha>:<path>` in a
   brief must resolve AND every italicised or backticked phrase of 20+ characters
   in the six lines before it must occur in that blob. The negative control was
   **found, not injected**: the check refuses both broken briefs and names the
   missing phrase in each. Editing one file would have repaired one instance;
   the check repairs the class.
3. **The risk the finding protects against was measured directly and found
   absent.** See below.

## THE DECISIVE EVIDENCE, AND IT IS NOT THE MECHANISM

Luna's real risk is that the author, pointed at the wrong delta, may never have
read the requirement — so the implementation might satisfy the *task text* and
not the *requirement*. The general form:

> **THE PACKET'S CORRECTNESS HAD BEEN ESTABLISHED AGAINST A DERIVED ARTIFACT
> (the task text) WHILE THE SOURCE IT DERIVES FROM HAD NEVER BEEN COMPARED TO
> THE CODE.**

`round1-requirement-check.md` is that comparison, made by the architect against
`3025c58..1aae621` clause by clause, ignoring tasks 13-15. Nine clauses: **eight
satisfied**, two of them satisfied precisely *by the diff not doing something*
(building a second merge would have satisfied the merge clause twice and been the
defect; "on the same terms" for a noted proposal means travelling as verdict-record
data, not carrying a subject). The ninth lands on `loop/run.mjs:678`, a file
correctly outside the packet's permitted list, and is filed as
**`addictedtoai-2rqa`, P1**.

**That check does not descend from the brief at all**, which makes it the only
evidence path in this round that a brief defect could not have contaminated.

## WHO DECIDED, AND WHY IT WAS NOT THE ARCHITECT

**The merge decision was `A2AI-Orch`'s.** The architect wrote the brief that
carries the defect and therefore could not convert a `revise` against its own
artifact — not because the reasoning would have been wrong, but because that
position is the conflict of interest the review gate exists for. The architect
proposed the disposition and declined to act on it; the orchestrator, who did not
write the brief and holds the merge, ruled. **The architect's refusal to decide it
is the reason the orchestrator was willing to.**

The halt order was applied rather than the outcome judged: what tripped, the
cause, the cause fixed, recorded, and only then cleared. The guardrail is
strictly **tighter** after this round than before it.

## CONFIRMATION, NOT CORROBORATION — and the difference matters

Both reviewers reported the pointer defect. **They did not find it
independently.** The architect had already found it, and put it in both briefs'
"Known state at dispatch" so that neither reviewer would waste a round
rediscovering it and so that both would be pointed at the real requirement.

**That is confirmation, not corroboration**, and this round makes no claim of the
stronger word. Two readers agreeing about something they were both told is not
two derivations meeting.

## THE EIGHTH UNDECLARED EDIT — recorded, judged benign, missed by both reviewers

The author gave subjects to both fixtures of
`a carry: block does not affect the merge gate` in `loop/tests/carry.test.mjs`.

- **That test was never among the seven.** It stayed green under the guard probe,
  because the merge gate does not read carry entries. The packet did not require
  the edit.
- **`round1-RESULT.md` does not declare it.** Its "The seven" section says all
  seven were handled, which is true, and says nothing about an eighth.
- **Both sealed reviewers missed it** — the read-only one, and the mutating one.
- **It is judged benign**: the fixtures now represent legal records, and the
  test's assertions are unchanged, so the property it pins still holds.

The architect knew of it before either review was dispatched and **deliberately
kept it out of both "Known state" sections**, recording the withholding on the
coordination board first so the result would be a measurement rather than a story
told afterwards. It is recorded here, on merge, as promised at the time.

### What the miss says about the check, which is the round's real product

Luna gives the cause in its own words: **"The changed test file was not
mutated."**

Check 6 asked that every changed **behavioural** line have an arm. The property
is that **every changed line is accounted for**. A test fixture is not a
behavioural line, so it fell through — **a check narrower than its property, in a
brief whose subject is checks narrower than their properties.** Two misses is a
result about the check, not about the reviewers.

Repaired for every packet after this one, and both repaired briefs are filed
beside the dispatched ones as `after-round1-review-brief-*-CHECK6-REPAIRED.md`:
the check now starts from the whole diff, requires every hunk accounted for
including fixtures, comments and documentation strings, makes an undeclared
changed line a finding **whether or not it changes behaviour**, and tells the
mutating reviewer to **enumerate first and mutate second** — because mutating
tells you nothing about the lines you did not mutate, and the fixture case is
precisely those.

## THE SEAL, AND HOW IT WAS ESTABLISHED

The architect copied Muse's finished review into the worktree at 23:01 while Luna
was still reviewing there, then removed it about twenty seconds later, and
recorded that on the coordination board **before any verdict existed**.

Luna's Sealing section:

> I opened neither an earlier round's report nor the parallel reviewer's output;
> I did not encounter a parallel output file.

That reading, from the other side, is the only instrument that could settle it.
**A window that was probably empty is not an empty window.** Recorded after the
verdict, the same sentence would have been unfalsifiable.

## LUNA'S STRONGEST INDEPENDENT CONTRIBUTION

A structural front-matter scan across the review, proposal and carried-data
directories — the migration question answered against the **real corpus** rather
than against fixtures:

- historical **subject-less carry entries exist** in old review records;
- the new parser correctly **refuses** them;
- already-materialised subject-less files under `data/carried/` **stay
  dispatchable** through the preserved queue fallback.

Neither the architect nor the other reviewer ran that check. Luna also reported a
**refused** `Remove-Item` on `.job` rather than routing around it, which is what
the ground rules ask for.

## WHAT NEITHER REVIEWER RAN, STATED PLAINLY

- The **full suite**. Both were forbidden it; the author's `1819 / 1819 / 0` on
  the committed tip is taken as a hypothesis with its wall time and cut-off
  checked. It reconciles as `1817 + 2` on the same ruler — the two new arms and
  nothing else moving. **The architect then ran the full suite on `main` after
  the merge, with all five commits in the tree: 1819 tests, 1819 pass, 0 fail,
  exit 0, 283.8 s.** That answers the orchestrator's stated prediction — if
  giving subjects to those two fixtures had moved anything outside the four
  files, this is where it would have appeared. It did not, so the eighth edit's
  blast radius really was the two fixtures. The orchestrator's gate run is still
  the first run of the *whole gate set* on this tip, and its ratchet floor rises
  to **1819**.
- **Muse ran no mutations at all** and said so; its arm claims are readings, not
  measurements, and it named the four value classes (`null`, `''`, absent,
  whitespace) it could reason about but not execute.
- The architect ran the four targeted suites (`59 / 59 / 0`) and the clause
  comparison, and did **not** run the full suite.

## ONE MORE INSTANCE, FROM THE MERGE ITSELF

While banking these artifacts the architect verified each banked copy against its
source with a shell loop that split `"src:dst"` pairs on `:`. On Windows that
splits `D:/AddictedtoAI/...` at the **drive letter**, so both operands were
malformed, both digests came back as the empty string, and all six pairs printed
`MATCH`.

**The check's false answer and its true answer were the same observation** — the
defect class this packet's own reviews were built to catch, appearing in the
verification of the packet's own record. Sampling harder would not have found it;
only changing what is observed does.

Replaced by `arch-c1-bank-verify.mjs`, which refuses an unreadable file, refuses
an empty digest, and **prints the digest** so a reader can see that something was
actually hashed. All thirteen banked artifacts verify, with thirteen distinct
digests.
