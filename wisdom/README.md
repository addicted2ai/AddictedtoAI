# TURNING THE TIMELINE DISTILLATION INTO WORKING WISDOM — the unified report

**Date:** 2026-09-09 into 2026-09-10 (local).
**Authority:** `two-desks-work-orders-and-trains@a5e873b`.
**Sources:** three independent answers to one question, the eight distillation
notes read directly where the answers disagreed with them, and several findings
that arrived while this report was being written — including seven produced *by*
the writing of it.

---

## 0. THE ONE-PARAGRAPH ANSWER

The distillation must not become a better-written memory file, because memory is
the intervention that was already running during every failure it was supposed to
prevent. Of the load-bearing lessons relearned in the 2026-09-07..10 window,
**seven were recorded *and* in the session's context and still did not fire**;
three were recorded and never loaded; one was never recorded. So the conversion
rule is: **every finding either becomes something that RUNS AND REFUSES, or
becomes RECORDED JUDGEMENT WITH A NAMED OWNER AND AN EXPIRY, or is DELETED —
unowned prose is not a third option.** And the first item of work is not a
finding at all: it is a **host**, because two of the four places I proposed
routing findings to **do not exist in the repository**. That one is built and in
its second review round; the rest is ranked below.

**Read §8 before §3 if you only read one thing.** Phase 0's review found that
*six of its twenty-eight negative controls do not bind the check they name*, and
that my own verification of it had missed all six — which sharpens the standing
acceptance bar from *"a check that has never been seen refuse something is not
yet a check"* to **"a check that cannot be broken without its twin noticing."**

---

## 1. HOW THIS WAS ANSWERED, AND WHY THAT MATTERS MORE THAN USUAL

Three derivations, from the same eight distillation notes and the same six-point
proposal, dispatched in parallel at 23:24 with neither agent able to see the
other:

| | who | rung | how it read the tree |
|---|---|---|---|
| A | A2AI-Fable-Arch (me) | — | full repository access, `git` and file reads |
| B | Luna (GPT-5) | `max` | **`git` REFUSED by the dubious-ownership check** — filesystem reads only |
| C | Muse Spark 1.3 | `xhigh` | repository search at `HEAD 95bb03e` |

**The git refusal turned out to be the most useful accident in the exercise.**
This project's own standing rule is that *confirmation is not corroboration* —
two readers agreeing about something they were both told is not two derivations
meeting. Here the two agents did not share an instrument: B could not run `git`
at all and read the working tree directly; C searched the committed tree. When
they reach the same conclusion, that conclusion has been derived twice, by
different means. That is the strong form and it is rare.

**And the discount is theirs, not mine to apply for them.** Muse wrote it into
its own report unprompted:

> "One structural caveat from the notes I adopt: two derivations sharing an
> instrument are one. Where I agree with the unseen sibling agent, discount it;
> the disagreements above are the product."

A reviewer that discounts its own agreements before being asked is a reviewer
worth paying for. This report follows that instruction: **the agreements are
reported as weaker evidence than the refutations.**

**And there is a fourth reading, which is the one that earned the most: the
notes themselves.** Both agents flagged, first on their own cannot-determine
lists, that tool results were stripped from the distillation notes and every
number in them is taken **on prose authority**. So before ranking anything on
their summaries, I went back to the note. **It cost one command and it changed
§3.2**: where both agents wrote *"four truncated briefs"*, the source records
**five instances of the same loss, one of them with no truncation at all** — and
prescribes a second remedy for it that neither agent carried forward. A
unanimous summary of a source is still a summary.

---

## 2. THE VERDICTS ON MY SIX PROPOSITIONS

| | my proposition | Luna | Muse | outcome |
|---|---|---|---|---|
| **P1** | §6's 7/3/1 count governs everything | MODIFY | MODIFY | **modified — direction survives, ratio does not** |
| **P2** | runs-and-refuses or deleted; storage is not a third option | MODIFY | MODIFY | **replaced by Muse's three-way rule** |
| **P3** | four hosts already fire at the point of use | **REFUTE** | MODIFY→refute | **REFUTED, twice, independently** |
| **P4** | these five conversions first | MODIFY | MODIFY | **re-ranked; one host was wrong** |
| **P5** | a check never seen refusing is not yet a check | MODIFY | AGREE | **stands, with cost tiering** |
| **P6** | expect a large delete bin | MODIFY | AGREE | **stands, and it grew** |

**Not one of the six survived unchanged.** That is the result I wanted and it is
worth stating plainly rather than burying: the proposal I put in front of them
was wrong in one place outright, wrong in its host assignment in another, and
too strong in a third.

### P3 — the refutation, which is the load-bearing one

I claimed four hosts already fire at the point of use. **Two of them do not
exist.**

- `scripts/*.test.mjs`, auto-enrolled by the test runner — **EXISTS**, confirmed
  by both.
- `loop/lib/brief.mjs`'s `GROUND_RULES`, copied into every Desk brief —
  **EXISTS**, confirmed by both.
- **the brief linter — DID NOT EXIST.** No executable under `scripts/`, `loop/`,
  `pulse/` or `tools/`. Every repository hit was banked *evidence of a review
  that happened*, not a runnable thing.
- **the second-model brief review — DID NOT EXIST** as a gate. No `loop/` entry
  point runs it; it was manual dispatch plus banked verdicts.

Muse's sentence for this is the one to keep: **"a proposal naming a host that
does not exist fails its own read-before-proposing bar."** And the consequence is
a price change, not a wording change — *anything routed to a host that does not
exist is storage wearing a different costume.*

### P2 — replaced, because my version would have deleted the best records

I wrote: runs-and-refuses, or deleted. Both agents refused it and Muse named four
counter-instances from the notes rather than hypotheticals — the C1 split-verdict
disposition, the addendum-close of the six-line finding, the recorded refusal to
push on an inferred green, the four-criteria refusal to close `tbho`. **None can
run. Each is valuable precisely as owned judgement with its reasons stated.**
Luna added the class: *"Some judgments cannot honestly become deterministic
refusals... Mechanising them destroys what they are for."*

**The adopted rule is Muse's, and it is better than mine:**

> Every finding either becomes something that **runs and refuses**, or becomes
> **recorded judgement with a named owner and an expiry**, or is **deleted**.
> **Unowned prose is not a third option — it is deleted.**

### P1 — the direction survives; the ratio does not

Both modified it, and their reasons stack rather than repeat. Luna: the memory
dates are **upper bounds** (59 of 62 entries arrived with the corpus file), and
note 01 records a real state-2 counterexample — a first-half session with **zero**
memory-index loads. Muse went a level deeper and used the corpus's own preamble
against my count: the index preamble says a one-line rule *"is enough to make you
PAUSE; it is not enough to make you ACT"* and instructs the reader to open the
full entry first — so **an index-load count overstates "in context"**, and some
of my seven state-3 cases may be state 2 with the body never opened.

**That weakens the ratio and strengthens the conclusion**: if some of the seven
were never really loaded, then loading *more* lines is even less of a remedy.
Both readings demand point-of-use mechanism. What must not survive is using
7/3/1 to rank individual lessons — it cannot bear that weight.

### P4 — one of my five was in the wrong place, and the correction is decisive

I put the truncation defence in `scripts/` as a test. **Luna refuted the host:**
*"A repository test cannot see an agent's live `bd show` pipeline."*

Check that against the wild instances and it is not a matter of taste: **all four
recorded truncation failures were an agent holding the pipe interactively, not
committed code.** A repository test would have caught **zero of four**. The host
must be a **command guard at the tool boundary** — the same place the existing
shell-token guard already sits. Muse's test-file placement catches a different
population (truncation committed into `scripts/`, `loop/`, `pulse/`), and it is
worth having, but it is the *secondary* host, not the primary one.

Muse also **dropped one of my five outright**: the two-derivations corroboration
check does not belong in the linter, because *"a regex cannot tell whether two
derivations share an instrument"* and it would fire on legitimate shared
fixtures. Luna, independently, put the same concern somewhere else entirely —
structured **lineage on machine-produced measurements** in `loop/lib/ledger.mjs`.
**Both are right and the split is the resolution:** a machine measurement carries
its producer and input digest and can be checked; a prose claim of corroboration
is a reader's question and belongs in the second-model prompt plus a disposition
rule. See §7 for how tonight supplied its negative control.

### P5 and P6 — stand, with two amendments

**P5 SHARPENED BY PHASE 0's OWN REVIEW, and this is now the operative form:**

> **A check that has never been seen refuse something is not yet a check — AND A
> RED TWIN IS NOT ENOUGH. The bar is that the check cannot be broken without the
> twin noticing.**

Phase 0 shipped 28 tests with a red twin for every check and **six of those
twins still did not bind their check**: each exercised part of the check's
expression and left the rest free. A twin proves the check *can* fire; only a
mutation proves it *must*. Where the mutation is cheap — and for a linter it is
seconds — **the mutation is the control and the twin is only the fixture.**

P5's original form stands underneath that, with Muse's **cost tiering**: some refusals are expensive to
demonstrate (run-scoped lock contention needs live overlap; model-read checks
cost 45–115K tokens per outing). For those, *wild-found red preferred, else
fixture-injected red with the run recorded — **never a prose claim of
redness***, and re-demonstrate on host change. Luna added the sharper failure
mode: the notes contain **false reds and false greens** — a `printf` emitting the
wrong bytes while testing a parser; a missing-entry fixture testing an absent
check where no absent entry existed; a deleted call site leaving the suite green
because the test never reached that path. **A red observed for the wrong reason
is worse than no red**, because it is banked as proof.

P6 stands and the bin grew — see §6.

---

## 3. THE UNIFIED RANKED CONVERSION LIST

Ranked by (instances × cost avoided) ÷ build cost, reconciled across all three
lists. Each entry names the **host that exists or must be built**, what it
**refuses**, and its **negative control** — because a check that has never been
seen refuse something is not yet a check.

### 0. COMMIT THE HOST — `scripts/brief-lint.mjs` + its test — **BUILT, IN REVISION ROUND 2**

- **Why first:** it is not a finding, it is the precondition for three of the
  entries below. Refuted P3 is the whole argument.
- **Host:** `scripts/*.test.mjs`, self-enrolling into `npm test` and the gates.
- **Refuses:** authority drift, paraphrased quotes, enforcement claims naming a
  non-existent instrument, unscoped file lists, two-directional scope leaks,
  ambiguous "once", the guarded shell token, unnumbered report names, and
  `git show <sha>:<path>` pointers that resolve but do not hold what the
  sentence names.
- **Negative control:** every check has a passing fixture and a minimally
  different failing twin — 28 tests, 28 green, each red twin asserted. The ninth
  check's control was **found in the wild**: the banked `round1-agent-brief.md`,
  a brief that was actually dispatched pointing its reader at a delta file that
  did not contain the requirement it named.
- **AND SIX OF THOSE CONTROLS DO NOT BIND THEIR CHECK** — found by a sealed
  reviewer that could mutate rather than only read, and being fixed in round 2.
  **The bar is not "has a red twin"; it is "the check cannot be broken without
  the twin noticing."** See §8, which is the most useful paragraph in this
  report.

### 1. Negative-control contract for machinery changes — **unanimous, top of all three lists**

- **Finding:** *check narrower than its property* (~20 instances, the dominant
  class) and *artifacts that cannot fail* (≥10 instances).
- **Host:** the committed linter (enforcement-claim interrogation) **plus**
  reviewer-side mutation of the **merge-base diff** in the review gate.
- **Refuses:** a change adding a test arm without naming its red run; an
  enforcement claim whose named instrument does not contain the property; a
  control that never reaches the changed path; a mutation made constant that
  stays green.
- **Negative control:** re-introduce the B1 mutation-table arm and the `:381`
  bare assertion — both must be refused as unproven; the merge-base mutation
  path must show red-then-green **by hash**, with identical restoration.
- **The structural point both agents reached from different directions, and it
  is the single most important design decision in this list:** the control must
  be **generated from the diff, not copied from an author-maintained table.**
  Luna: *"must be generated, not copied from a mutation table."* Muse: *"a
  self-list cannot contain an undefended-correct line (r5 0/3 vs diff-list
  3/3)."* Same conclusion, two derivations, different instruments.

### 2. "No requirement left the brief" — **the finding is unanimous; the remedy both agents named is narrower than the property, and the notes already say so**

Both agents, and my own P4, called this *truncation*. **Reading the primary
source rather than their summaries changed it**, and this is the one place where
verifying a third-hand claim earned something.

`arch-timeline-note-01.md:82` names the four instances and their mechanism —
*"nq36 brief inverted acceptance; gates brief dropped 2/3 x2jl requirements; ovrk
brief banned `run-tests.mjs` foreclosing the bead's solution 1; 5bgo substitution
unaudited... ACCEPTANCE at bottom, `bd show | head -N` deletes"*. All four were an
agent running that command **interactively**, so Luna's host correction holds
against the source: a repository test scanning committed code catches **zero of
four**.

**But line 127 of the same note records a FIFTH instance of the same loss with no
truncation at all:**

> "x2jl **fourth requirement missed with no truncation** (shape of reading —
> numbered list vs prose imperative). Fix: diff brief vs **every imperative**,
> not enumerated list; generator refuses brief omitting an issue."

The requirement was there, unclipped, and was skipped because it was **prose
rather than a numbered item**. Neither agent surfaced it; both wrote "four
truncated briefs." **So a truncation guard is itself a check narrower than its
property** — the dominant defect class, committed by the remedy for it — and this
item has two halves that must ship together:

- **2a — PRIMARY host, a command guard beside the existing shell-token
  `PreToolUse` hook.** Refuses a counting or enumerating command piped through an
  output shortener, *unless* the caller explicitly marks the read as
  non-exhaustive. Covers 4 of 5.
- **2b — the brief generator reconciles the brief against EVERY IMPERATIVE in the
  source issue, not against its enumerated list.** Covers the fifth, and it is
  the half that would otherwise be quietly dropped because the other half looks
  like the whole fix. The note wrote this remedy down at the time; it is being
  re-derived here, which is itself an instance of the thing this report is about.
- **SECONDARY host — `scripts/*.test.mjs`** scanning `scripts/`, `loop/`,
  `pulse/` for the truncation shape committed into code. Different population,
  still worth having, and cheap.
- **Negative controls:** for 2a, the exact shape of the 1.17-vs-1.43 script and
  the title-only store scan must go red, while a deliberately non-exhaustive
  one-line diagnostic stays green — **proving the detector is not a blanket ban**,
  which is the failure mode that gets a guard disabled within a week. **For 2b
  the wild control is x2jl itself**: the gates brief must be refused for the
  requirement it dropped without any truncation present.

### 3. Authority binding and closure over file lists — **both agents, arrived at separately**

- **Finding:** lossy brief copying, quantifier drift ("both" dropped, one word
  changed), stale authority, and file lists mistaken for closure (recurred
  across packets B2, E and F — *discipline without a pins search did not hold*).
- **Host:** `loop/lib/brief.mjs` and `loop/run.mjs`; reconciliation of the
  brief's file list against the merge-base diff in the review gate.
- **Refuses:** dispatch on a brief whose required source text is missing,
  truncated or contradicted by the repository; a file list that misses a pin the
  diff touches.
- **Negative control:** an authority fixture placing the acceptance paragraph
  *after* the truncation boundary — the truncated brief must be refused and the
  complete one must pass; the B2/E/F round-1 brief shapes must be refused and
  their corrected shapes pass.

### 4. ~~One floor-checked build-record writer, and immutable per-run gate evidence~~ — **STRUCK. The change already ships it.** (§5)

Luna's finding is real and its negative control is well designed. It is also
**already built and merged**. Cited by **task number**, not line, for the reason
§5 gives:

- **task 1 `[x]`** — every gate declares a floor duration.
- **task 3b `[x]`** — `scripts/verify-launch.mjs`'s `hasCurrentBuild` input walk.
- **task 15 `[x]`** — *"transcribing twice does not overwrite an existing file — a
  retry does not clobber a finding already written."*
- **task 21 `[x]`** — re-run overwrite semantics with the restore-the-overwrite
  mutation as its control; **merged at `f879ec9`, packet F, 2026-09-09.**

**Do not build this. It exists.**

### 5. Measurement lineage — the split resolution

- **5a — machine measurements carry lineage.** Host `loop/lib/ledger.mjs` and
  the structured evidence writer. A measurement carries producer, input digest,
  source snapshot and method. A claim marked *independent* is **refused** when
  its lineage matches an earlier measurement — and is still **recorded as
  consistency**, which is the honest downgrade rather than a deletion.
  **Negative control:** run the same helper twice over one input under two
  method names; the second must be classified dependent. **And a wild one
  arrived tonight — see §7.**
- **5b — prose corroboration is a reader's question**, not a regex's. It goes in
  the second-model review prompt plus a disposition rule. Muse's refutation of
  putting it in the linter is accepted.

### 6. Figure provenance — **the one genuine split verdict, resolved by narrowing**

Muse **kept** it with four named wild controls (56-over-55 prose; an invented
push label; a total read while three counters were incrementing; a removal count
whose repair regex missed 14 entries). Luna **dropped** it: *"It would encourage
fake provenance. Structured provenance belongs on machine-consumed measurements,
not every historical sentence."*

**Both are right about different scopes, and the resolution is to narrow rather
than to pick a winner.** My ruling: the check applies to a figure that **a later
decision reads** — a count that gates something, a measurement recorded as
authority — and **not** to every historical sentence in a log. Luna's objection
kills the broad form; Muse's wild controls all fall inside the narrow form.
**Tonight supplied the decisive instance for the narrow form (§7).**

### 7. ~~Top-ranked clearance and starvation~~ — **STRUCK, and this is the most instructive strike in the list.** (§5)

Luna proposed this as new work: escalation must fire when the top-ranked
candidate is refused, or the run records visible starvation rather than
presenting lower work as progress. Its negative control was *"candidates
`[scout, repair]`, the medium runner excludes `scout`, its declared escalation
accepts it..."*

**THE CHANGE HAD ALREADY SHIPPED IT — `[x]`, MERGED, THE SAME DAY LUNA WAS ASKED
THE QUESTION.** This is worse than "already specified", and I only found out it
was worse by pinning the citation to a **task number instead of a line**: the
line told me the text existed, the task number carried the **checkbox**.

- **task 23 `[x]` — DONE, merged at `dc54da0`, packet D, 2026-09-09.** Escalation
  *"fires when the **top-ranked** candidate is refused solely on
  `runner:job-type`; no other refusal escalates"*, the quantifier *"the top-ranked
  candidate"* enumerated and resolved that morning, `topRanked: { candidate,
  rule }` exposed on the selector's result.
- **task 24 `[x]` — DONE, same merge.** The test: *"an overdue scout top-ranked
  and refused on clearance with one cleared `repair` below it."*
- **task 78 `[ ]`** — the one genuinely open piece, and it carries the starvation
  control as **Mutation A**: *"drop the queue floor and confirm the starvation
  case fails — **deleting the directives file does not delete the starvation**."*

**A capable agent, denied `git`, re-derived a mechanism this project had merged
hours earlier — including its negative control — and offered it as new work.**
The control is what makes this more than a near-miss: two independent
derivations of the same mechanism might coincide, but arriving at the *same
discriminating fixture* is a fingerprint. It was the same derivation, run twice,
because the first one was not reachable.

**That is the hypothesis executing itself inside the document written to stop
relying on storage.** The recorded work existed, was authoritative, was hours
old, and did not reach the reader.

**Do not build this. It exists.**

---

## 4. THE GAP NEITHER PLAN COVERS, AND NOBODY SHOULD PRETEND OTHERWISE

Luna's fourth attack is the sharpest paragraph in either report, and it survives
everything above:

> "Hand-authored board and transcript claims are outside all four hosts. The
> stale/future board timestamps, the invented 'as of' label, and the `A2AI-Orch`
> UTC-bucketing error were composed in coordination artifacts, not generated Desk
> briefs. No brief linter or second-model reviewer would see them."

Muse names the same class from the other end: the suite **judges after the defect
is written**; it does not refuse at **composition time**; and the ground-rules
copy reaches Desk jobs but **not fresh sessions or hand-spawned runners**.

**So the honest scope of this entire plan is: it covers generated briefs, code,
tests, ledger records and gate evidence. It does not cover a human-or-agent
writing prose into a coordination file.** Everything I have written on the board
tonight is outside every host on this list. That is not solved here, it should
not be papered over with a slogan, and the only two things that have ever caught
it are **a second reader** and **a check that reads the artifact after it is
written**. Both are expensive; neither is a refusal at the point of writing.

---

## 5. THE GATE ON THIS PLAN'S OWN ITEMS — run, and it struck two of seven

**Luna could not run `git`.** It therefore ranked, as new work, several
mechanisms that `two-desks-work-orders-and-trains` **already specifies**: the
escalation join, per-run gate evidence directories, the floor-checked build
record, and the starvation guard. A search of that change's `tasks.md` for those
terms returns **90 hits across a 2,507-line file with 67 unchecked and 29
checked tasks**.

Luna flagged its own exposure honestly — *"whether the current partial
implementations already contain later fixes"* is first on its cannot-determine
list — so this is a limit of its access, not a defect in its reasoning. But the
consequence is a hard rule for whoever executes this plan:

> **Before building any item, read the change's `tasks.md` and the live tree for
> it. An item this plan proposes and the change already ships is not a
> conversion; it is a duplicate, and duplicating a mechanism is how two
> mechanisms end up disagreeing.**

**THE GATE HAS NOW BEEN RUN, and it struck two of the seven items — both of
which turned out to be already MERGED, not merely specified.** Items 0–3 and 5–6
were verified absent from the change and remain.

**Five conversions, not seven, and both strikes were found by running one command
against a file both wisdom agents were unable to read.**

### How this document cites the change, and why it is not a line number

**Every citation above is a TASK NUMBER.** That is not a style choice and it
earned its keep inside this section: my first draft cited `tasks.md:1512`, which
told me the text existed. **The task number told me the box was ticked.** A line
citation would have left this report saying "already specified, go finish it"
about work that had been merged for hours.

Two things move under a line citation here and only one of them is obvious. The
file is edited constantly — and **`openspec archive` moves the entire directory**
to `openspec/changes/archive/<YYYY-MM-DD>-two-desks-work-orders-and-trains/`. A
task number survives both.

**AND NOTHING IN THIS REPOSITORY WILL TELL YOU WHEN THESE CITATIONS BREAK.** I
originally justified putting this document at the repository root partly on the
grounds that the guard against change-directory references does not reach it.
That reasoning was **vacuous, and a second reader caught it**:
`scripts/no-change-dir-refs.test.mjs:22` globs `**/*.{mjs,ts,tsx,js}` — **source
files only. No markdown is covered by that guard anywhere in this repository.**
So the location neither gained nor lost protection, because there was none for a
`.md` file to begin with.

The conclusion survived and its reason did not, **which is the same shape as the
10% figure in §7a** — and it is worth separating precisely because *a surviving
conclusion is what stops anyone re-checking the reason.*

The location still stands, on the one reason that is real: **the evidence tree
moves on archive and a live plan must not move with it.** The citation risk is
handled here, by hand, by pinning to task numbers — because nothing will refuse
the unarchived form on the day it breaks.

---

## 6. THE DELETE BIN — and its size is the success measure

Merged from all three lists, deduplicated:

1. Bare slogans with no paired instrument — *"be suspicious"*, *"verify before
   concluding"* unadorned.
2. **Second copies of records** — restated tables, restated scan paragraphs,
   duplicated mutation indexes. *Delete in favour of deferring to the quoted
   standard; the notes show patching a copy never holds and removal does.*
3. *"No green mutant"* as a bar — already withdrawn in the notes for the
   attainable-delta rule.
4. Optional citations with no adoption mechanism.
5. Unowned estimates presented as measurements.
6. Severity labels with no red run attached.
7. **File-list-as-closure assertions.**
8. Corroboration claims naming no instrument per derivation.
9. *"List-of-X read as list-of-Y"* as a standalone finding — **fold into scope
   errors** (Luna).
10. *"Reader-addressed rules cannot bind suffix filters"* as a standalone finding
    — **fold into structural control placement** (Luna).
11. The **broad** form of "every memory figure carries a command" — retain only
    the narrow form (§3.6).

**Item 2 is the one with teeth**, because it is the class that produced tonight's
new P1 bead (§7) and the class `CLAUDE.md` already diagnosed about itself four
times before writing *"a sentence that must be re-synchronised by hand will
not be."*

---

## 7. FINDINGS THAT ARRIVED WHILE THIS REPORT WAS BEING WRITTEN

Both are in the classes above, both are live, and neither was in the notes.

### 7a. `addictedtoai-mrld` (P1) — four restatements, one file contradicting itself, and a measured cost

Found by Luna as a side observation while refuting P3; **verified here by direct
read**, because Luna's `git` was refused and it took the rest of its material on
prose authority.

- `data/config.json:2` — `"publish": false` ← **the authority**
- `AGENTS.md:19-21` — *"`\"publish\": true` in `data/config.json`, which **stays
  `false`**"*
- `AGENTS.md:252-254` — *"**`publish` is `true`** as of 2026-08-29 ... The Pulse
  and the loop now commit and push their own work, unattended."*
- `CLAUDE.md` — restates the same value again, alongside the standing grant.

**The two arms of the contradiction are in the same file.** And the current value
makes it worse rather than better: `config.json` reads `false` right now because
A2AI-Orch is holding publishing down during this change — so `AGENTS.md:19` is
*accidentally right today for a reason it does not give*, which is the worst
condition a stale sentence can be in, because it reads as confirmed.

**And it lands on a host from §3.** `loop/lib/brief.mjs:53-57` — one of only two
hosts that provably fire — is copied into every Desk brief and says: *"Never
push... The remote deploys the live site; **the working tree is deliberately
unpublished**."* The **prohibition is still correct** (a job may not push). The
**justification is false** — that was the greenfield window of 2026-08-28, and
`CLAUDE.md` itself records *"The tree is no longer empty. The hazard the rule
existed to prevent is gone."*

> **ROUTING A RULE INTO A COPIED HOST MAKES IT DURABLE; IT DOES NOT MAKE IT
> SELF-CORRECTING. A RULE WHOSE PROHIBITION OUTLIVES ITS OWN REASON IS THE
> HARDEST KIND TO NOTICE, BECAUSE EVERY OUTCOME IT PRODUCES IS STILL RIGHT.**

That sentence is the amendment this report makes to its own §3: committing a host
is necessary and is not sufficient.

Reserved files, so filed rather than fixed, and A2AI-Orch is told.

**AND THE BEAD GOT BIGGER WITHIN THE HOUR, IN THE WAY THAT MATTERS MOST.** Orch
verified both arms against the tree before editing — *not from my report* — and
then found a **fourth restatement in the same paragraph** that neither wisdom
agent nor I had looked for:

> `AGENTS.md:262-264` gave the budget bounds as **"machinery ceiling 10%"**. The
> live file reads `machinery_ceiling_pct` **30**.

**That sentence is the provenance of a fabricated figure Orch recorded against
itself last night.** It had asserted a back-desk ceiling of 10%, computed a
correct threefold widening from it, diagnosed the number as an *invention* — a
discipline failure — and moved on. It was not an invention. It was a **citation
of a stale restatement sitting in a reserved document in the present tense**,
which is exactly where a reader adopts a number without noticing they adopted it.

And it is not inert prose: `loop/lib/budget.mjs:223-228` reads those bounds by
pattern and `:243` computes `100 / tightestCeilingPct(cfg)`, **so a wrong copy
produces confident, correct-looking arithmetic about a live denominator.**

> **AN INVENTION IS A DISCIPLINE FAILURE WITH ONE VICTIM. A STALE RESTATEMENT
> WILL DO IT AGAIN TO THE NEXT READER.**

That is the sentence that promotes delete-bin item 2 from hygiene to a ranked
conversion, and it is the strongest single argument in this report for *deleting
second copies rather than syncing them* — because the cost is now measured rather
than asserted.

**A caveat on the negative control, from Orch, that changes its shape and is
correct.** The check must **not** match **past-tense dated records**. A sweep
found four more literals of this flag, all inside evidence records, all class 4 —
correct, permanent, and making no claim about the current value. **A check that
refuses them would force a true record to be deleted to earn a green**, which is
a guardrail producing a false statement, and is the fix-the-detector move this
repository forbids everywhere. Telling a record from a claim is a **tense test**,
which a regex does badly. So the honest scope is **the two reserved operating
documents**, not all tracked markdown. Two live claims existed; both were in
`AGENTS.md`; both are now repaired to point at the JSON rather than to a corrected
copy.

**The third restatement was correctly declined.** `CLAUDE.md:84` is past tense —
*"`\"publish\": true` **was set** on 2026-08-29"* — a dated record of an act, and
repairing it would convert a correct historical sentence into a wrong one. That
is the same taxonomy the citation repairs used tonight, applied by a second party
without being handed it: **class 4 is stamped and left alone; only the sentence's
mood decides.**

### 7b. A sha that resolves to nothing reads exactly like evidence

A2AI-Orch, tonight, unprompted: it had recorded the drifted `data/launch.json`
blob as `03e2207` — in two board entries, in a message to me, and **in the body of
the bead arguing for better evidence** — and offered its byte-identity with an
earlier blob as the one observation separating *two states* from *noise*.

`git cat-file -t 03e2207` answers **"Not a valid object name."** `git hash-object`
**without `-w` computes a sha and writes nothing.** The object never existed. Six
observations of a real bimodal fault, **zero durable copies**, and the value pair
survives only because it happened to be typed out.

This is **the wild negative control for §3.5a and §3.6 at once** — an identifier
that reads as evidence and refers to nothing — and it was committed *inside the
record that argued for evidence*. Orch fixed it in the instrument rather than in
a note: the gate harness now samples state before the run and **copies the drifted
file into the run directory before anyone can revert it**, one row per run
including clean ones, *because a history of only the drifted runs cannot answer
how often* — which was the exact question it had got wrong. It also recorded a
datum **against its own hypothesis** while building the instrument to test it.

### 7c. Four more addresses for the same class, all found in the hour after this report was first published

**A BRIEF THAT TELLS A REVIEWER NOT TO CHECK SOMETHING HAS TAKEN OVER
RESPONSIBILITY FOR IT.** The round-2 review brief says the linter is
byte-identical to round 1, verified by digest, so do not spend time re-diffing
it. That sentence saves the reviewer real work — and the disposable copy it
reviews had been refreshed minutes after a mutation harness had been writing to
and restoring the source file. Had that refresh caught a mutated intermediate,
the reviewer would have mutated an already-mutated linter and **every line of its
report would have been wrong while reading exactly like a review.** Digesting all
four files across both trees before dispatch costs seconds. The general form
reaches every "already settled, don't re-verify" sentence anyone writes: each one
is a load-bearing assertion by its author, and the cheapest possible place to be
wrong.

**THE COLLAPSE BETWEEN THE INSTRUMENT AND THE SENTENCE.** Orch's probe of the
runner registry printed the correct predicate — `enabled !== false` — and its
report of that probe said the field's value *is* `true`. The field is **absent**.
The measurement was right; the sentence describing it was not; and **re-running
the probe would never have caught it**, because there was nothing wrong with the
probe. This is the one address in the whole class that verification cannot reach,
and its rule is a writing rule rather than a testing one: *say what the
instrument computed, not what you take it to mean.* It matters here because the
next step was a test written from the sentence — which would have asserted
`=== true` and gone red on every correctly-configured entry that omits the
field, then been "fixed" by stamping the field across the registry. **A check
narrower than its property, produced by the remedy for a check narrower than its
property.**

**A GUARD WHOSE ONLY SATISFACTION IS THE REVERSAL OF A DELIBERATE DECISION IS NOT
A GUARD, IT IS A VOTE.** A bead proposed binding the property *every registry
entry declaring an escalation is itself enabled*, wanting it red today. It would
be red — against a state the maintainer deliberately chose and the registry
already documents as correct. The only way to green it is to reverse that
routing call. The test would have looked exactly like every other guard in this
repository while functioning as a standing demand. **Before binding a property,
check whether its current violation is a defect or a decision** — and the place
to check is the comment beside the line, which in this instance said so
outright.

**A STATE THAT SPANS A RANGE, GIVEN A CONTROL AT ONE CONVENIENT POINT INSIDE IT,
AND A CONCLUSION DRAWN ACROSS THE WHOLE RANGE.** The Pulse lease packet — the
first item built under this plan's own rules — enumerated twenty-six states of
one file, gave twenty of them live controls, dismissed six in writing with
reasons, and answered **None** to *which of these can make the Pulse refuse
forever*. One row is *an mtime ahead of the wall clock*, defended with the
argument that a negative age *"still crosses the max on its own"*. Its control is
a touch **one minute** ahead. Measured against the same shipped reader: one hour
ahead refuses for 1.3 hours, one day for 24.3 hours, one year for 365 days,
**ten years for 3,650 days** — every one reported `fresh`.

The argument is true and **it is not a bound**. *Ages out on its own* says
nothing about when, and the when is the entire property. One file with a wrong
timestamp — a restored virtual machine, a corrected clock, a copy from a machine
whose clock was wrong — stops the engine for as long as the skew lasts. **The
forever-refuse the whole design existed to prevent, arriving through the row that
names the state.**

What makes it worth keeping rather than merely fixing: **the same report meets
the standard elsewhere.** Its age rows carry the maximum and the maximum plus one
millisecond, on a pinned clock. The author knew how to bound a range and did it
in the row where the range was obvious. So the rule is not *learn to test
ranges*; it is:

**A CONTROL AT A CONVENIENT POINT INSIDE A RANGE PROVES THE POINT, NOT THE
RANGE** — and the point that gets chosen is, reliably, the one where the property
survives.

And one half of it was the briefing, not the work: **that brief carried no
mutation contract.** The controls were verified by hand afterwards instead, which
is the coordinator absorbing an obligation that belongs in the document — and the
next brief written from that one inherits the gap rather than the habit. **A
standard enforced by the person who happens to be watching is not yet a
standard.**

**RIGOUR APPLIED TO THE VISIBLE RANGE READS EXACTLY LIKE RIGOUR APPLIED TO THE
PROPERTY — AND IT READS THAT WAY TO THE PERSON WHO DID IT.** This is the peer
session's own formulation, arrived at within the hour of reading the row-11
finding, and it is better than the one above. Its scheduling guard refuses to
start a gate run within N minutes of a Pulse firing. It has **two** range inputs:
*when* a firing lands, and *how long* a run takes. All 1,440 minutes of the first
were swept exhaustively, and that sweep was reported as the guard being proved.
It proved the arithmetic. N came from **one** observation of the second.

Across eleven complete runs on disk the median is 6.9 minutes and the **maximum
is 20.0**. Ten of the eleven agree with the threshold; the eleventh is the whole
answer — and it was sitting in the evidence directory while the number was being
typed. Hence the second formulation, which names a failure distinct from the
lease author's:

**A CONTROL AT THE MODE IS THE HARDEST BAD CONTROL TO DISLODGE, BECAUSE EVERY
ADDITIONAL SAMPLE IS EVIDENCE FOR IT.** The lease report sampled the *safe end of
a range*; this sampled the *mode of a distribution*. Only the second one grows
more confirmed the more you measure.

**And the repair is the transferable part: WHERE A CONSTANT EXISTS, READING IT
BEATS SAMPLING A DISTRIBUTION.** The ceiling was never the suite — it is the lock
wait, `scripts/build-lock.mjs:199`, a declared constant. A threshold derived from
a constant states its own basis and goes stale loudly when the constant moves;
one fitted to observations goes stale silently.

**Which is where I put the correction to the correction, because reading a
constant is not the end of the work either.** There are **two** locks — the test
lock in `run-tests.mjs` and the build lock in `prebuild.mjs`, separate suffixes,
acquired serially by one gate run — so the wait ceiling is twice the constant.
And neither call site uses the constant unconditionally: both read an environment
variable and fall back to it. So:

**A DEFAULT IS ONLY THE OPERATIVE VALUE IF NO CALLER OVERRIDES IT, AND A CEILING
DERIVED FROM ONE ACQUISITION IS WRONG BY THE NUMBER OF ACQUISITIONS.**

That correction was only possible because the derivation was sent rather than the
number. **A result can only be checked by someone who was given the reasoning; a
number can only be believed.** It is the argument for writing derivations into
the scripts that use them.

**"SAID OUT LOUD BECAUSE NO TEST CAN SHOW IT" IS THE PHRASE THAT MEANS NOBODY
TRIED.** It sits in that same registry comment, introducing an admirably honest
paragraph about a mechanism with no live path in production. It reads as candour
and functions as an exemption — and it is the most durable kind of exemption
available, because **it inoculates the reader against asking the question by
appearing to have already asked it.** The session that wrote that comment agrees,
and named the effect itself. The paragraph also contains the only sentence in
this whole area that names a real
future risk, and that sentence has no owner and no expiry, which is the third
option the disposition rule forbids.

### 7d. All twenty-four records went stale in under three hours, and no expiry date was involved

Every record in `phase-0-RESULT3.md` section 5 pins its arm by LINE NUMBER in
`scripts/brief-lint.mjs`. On 2026-09-10 at 02:47 I read all twenty-four pins out
of the committed report and compared what stood at each line when the report was
committed with what stands there now. (That time is anchored by the mtime of the
script that did the reading, `02:47:22`, rather than by anyone's memory — and
section 7j records why an mtime is a weaker anchor than a commit timestamp: any
later edit to that file would silently replace it, and nothing would say so.) **Zero of twenty-four still resolve.
Twenty-four of twenty-four moved**, most by twenty-three lines, and `B3` cannot
be located by its own text at all because the same edit rewrote that line.

The edit had nothing to do with any record: it removed a reference to an
unarchived change directory that a repository guard refused (`3c46e46`).

**THE EXPIRY WAS NEVER THE THING THAT WOULD BREAK FIRST.** A date fires a single
time, a month out. An ordinary edit invalidates a pointer constantly, and it
already has. A mechanism watching only dates would have sat green through that
morning and then gone red on 2026-10-10 over twenty-four records that stopped
describing anything on 2026-09-10 — **a check that is precisely on time about the
wrong event.** The record-expiry packet now carries this as its second enumerated
hole, and it is the measured one rather than the reasoned one.

It also prices a disposition, which is the number the design actually turns on.
Re-DECIDING one record is cheap: two to four sentences carrying their own
reasoning — the arm, why no twin exists, what removing it would do, why DELETE
was rejected. But FINDING the arm is now a search rather than a lookup. **The
cost of a disposition is inflated by exactly the defect that makes the pins
stale**, so the anchoring question and the interval question are one question.

**The digest in `phase-0-RESULT3.md` section 6 is superseded, and is not to be
edited.** It records `7F37BC11…F180E` for the linter as round 3 produced it,
which was true. After `3c46e46` the file hashes to
`6294C11533EE19E12283ED4F5AFCBCC75884ECC293F85D57D14418357EA15792`. A result
report is a dated measurement, not a description of the present; the pointer
belongs here, so that whoever re-runs `Get-FileHash` reads *superseded* rather
than *tampered with*.

### 7e. A check that passed on a third of the list it was checking

Filed as `addictedtoai-188p`. The linter's Files check terminates its scan at the
first blank line after a bullet — deliberate, and bound in round 3 by the D4 arm.
A paragraph added inside the first bullet's continuation, separated by a blank
line, made the parser stop after ONE bullet in a brief listing three. It reported:

    PASS  every permitted file carries "— reason" and exists or is (new) — 1 files

**PASS, because every bullet it FOUND was well-formed. Its verdict answers "was
everything I parsed well-formed?" when the property is "did I parse everything
the brief declares?"** Nothing distinguishes those in the output. It was caught
only because the same detail line had read `3 files` twenty minutes earlier and
the `1` looked wrong — a plausibility judgement about the magnitude of an answer,
made outside the tool, which is not a system property and will not fire when the
wrong answer happens to look reasonable.

The worse half: check 4b builds its permitted-path set from a **different** loop
that runs to the next heading and does not stop at a blank line. So one run held
two answers about one list — 1 file and 3 permitted paths — and reported neither
the disagreement nor the existence of two parses. **TWO PARSES OF ONE THING ARE
TWO CHANCES TO BE RIGHT AND NO MECHANISM FOR NOTICING YOU ARE NOT.**

This is the same family as 7b. A sha that resolves to nothing reads exactly like
evidence; a list that is exact against its instrument reads exactly like a list
of the problem; a check that parsed a third of its input reads exactly like a
check that passed. **The general form, and it is the one to carry forward: A
CHECK THAT CANNOT DISTINGUISH "I LOOKED AND FOUND NOTHING" FROM "I LOOKED AT
NOTHING" IS NOT A CHECK.** The repair is always the same shape — make it report
its denominator, and refuse on zero.

### 7f. RECORD was never a third outcome — this one corrects a rule in section 8

Section 8's Phase 0 closed on a disposition rule this report states: every arm is
**BIND**, **DELETE**, or **RECORD** — kept unbound with a named owner and a date
it expires. Twenty-four arms took the third option, and Phase 0 shipped.

A sealed review of the mechanism built to enforce those records refuted the rule
from the outside, and the evidence is a measurement rather than an argument. The
mechanism anchored each record to a **content substring** of the linter with an
expected occurrence count — chosen after 7d showed line numbers rot. The reviewer
took all 24, found the arm each reason describes, and constructed an edit that
**changes what the arm does while leaving the anchor present at its expected
count.** Applied, run, restored, re-run.

**Twenty-four of twenty-four stayed green. Zero sound.**

**The gap is structural and there is no better substring.** Behaviour lives in
flags, in `&&` versus `||`, in an added conjunct, in a dropped one, in an upstream
definition, in a sibling arm of one alternation, in a call site that bypasses a
definition. A substring pins none of those unless it spans them — and spanning
them is the whole linter quoted back, which then fails on any reformat. That is
an impossibility result, not a tuning failure, and those are rare enough to name
as one.

Which yields the correction, in the reviewer's words:

**A RECORD WITHOUT A TWIN BY ITS DATE IS DEBT, NOT A DISPOSITION.**

So **BIND / DELETE / RECORD was always two outcomes wearing three names, and the
third one's whole function was to let twenty-four arms read as dispositioned
while nothing bound them.** The expiry now means *by this date this arm has a
behaviour twin, or it is deleted, or someone writes down why neither happened* —
a deadline for WORK rather than for a decision, which removes the cheap way out,
because a date can be edited and a fixture either exists or does not.

**It is the same shape as every other finding in this section, and it reaches
furthest because it is a rule this report wrote and used to close a packet.** A
name doing work no mechanism ever did — `RECORD` alongside `known-good`,
`unmerged`, and `the worktree stands`. All four were true-sounding, all four
were re-read many times, and re-reading confirms the true half at no cost while
carrying the false half along with it.

One consequence belongs here because it is a scheduling property and not a
discipline problem: three of the twenty-four reasons are **recognisable but not
re-decidable** — they say what the arm is, not what deleting it would cost. The
shared expiry forces all twenty-three onto one morning. **The weakest records and
the highest-pressure moment are therefore the same event by construction**, which
no amount of intending to be careful will fix.

### 7g. The sealed review is blind in one direction, and it is the direction of whoever designed it

The sealed review is this project's strongest instrument. A reviewer gets the
tree, the author's reports and a list of questions, and never gets the brief the
author was working from. That seal is what makes the review's findings about the
work rather than about the instruction.

It is also the defect. **A SEALED REVIEW ATTRIBUTES EVERY DEFECT TO THE AUTHOR,
BECAUSE THE BRIEF IS OUTSIDE THE ENVELOPE — AND THE DEFECTS MOST WORTH FINDING
ARE THE ONES THE BRIEF CAUSED.** This report's own record says specification was
the bottleneck; briefs and task text caused most revision rounds. So the review
is systematically silent about the largest category of defect, and silent in
favour of the party who wrote the brief, designed the review, and reads the
verdict.

The instance that made it visible is the Pulse's gate lease. A reviewer ruled
that proceeding past a sixty-second clock-skew tolerance was indefensible: a
live holder with a fast clock has its lease disregarded at the instant it is
read, which is the exact overlap the lease exists to prevent, and the overlap is
silent — exit zero, work written, every later line ordinary. The review recorded
that choice as the author's, quoting the author's own concession that the live
skew population is unknown.

**The choice was not the author's. It was forced by a sentence in the brief**,
which set the property as *no state of this file may cause the engine to refuse
past the maximum age*. Given that property, the future arm must proceed, and the
author derived it correctly and said so.

The missing word is `dead`. **A BOUND WRITTEN ON THE SYMPTOM OF A FAILURE ALSO
BINDS THE MECHANISM WORKING CORRECTLY, UNLESS THE PROPERTY NAMES WHICH ONE IT
MEANS.** A live holder refusing the engine for as long as it holds the tree is
the brake, not the failure. One absent adjective converted a bound on a failure
mode into a bound on the mechanism.

What caught it was luck of a specific kind: the reviewer opened by stating the
property it had reconstructed from the surrounding system — *the engine never
rewrites tracked files while a live holder holds the lease* — and that sentence
disagrees with the brief's on exactly one state. **The divergence between the
reconstruction and the instruction is the only signal a sealed review can carry
about a defect in the instruction**, and it arrived unrequested.

So it is now required, and three things about how it is required are the whole
value, each of which was a hole in the first version of the requirement:

**The source.** Reconstruct the property from **the thing being guarded, never
from the guard**. A reviewer who reconstructs from the change under review
reconstructs the brief implemented faithfully and reports agreement — a
mechanism whose answer is *agrees* precisely when the work was done well, which
is precisely when a defect in the instruction is invisible. The guard is
downstream of the instruction under suspicion; the guarded thing is not.

**The adjudicator.** A divergence is **not** ruled on by the brief's author.
That is the party whose work is under examination judging the claim against it,
and the same rule already exists here for merge decisions on a packet whose
brief one wrote. Otherwise the strongest finding the mechanism can produce is
the one finding it is least able to accept, and it gets resolved as a reviewer's
misreading more often than it is true, without anyone deciding to do that.

**The ordering.** The reconstruction is written and saved **before** the diff,
the reports and the mechanism are opened, and never edited afterwards; a
reconstruction that turns out wrong gets a correction beside it rather than a
rewrite. **A SENTENCE THAT CAN STILL BE ADJUSTED AFTER THE CHANGE IS KNOWN IS
NOT A PRIOR, IT IS AN ECHO**, and an echo agrees every time. A required section
is otherwise the cheapest box on the form to tick, which is section 7f's problem
arriving in a new place.

### 7h. Two rules about numbers and about bundles, from the same review

**A CONSTANT THAT SEPARATES TWO SAFE OUTCOMES DOES NOT HAVE TO BE MEASURED; ONE
THAT SEPARATES A SAFE OUTCOME FROM AN UNSAFE ONE DOES.** In the lease, the same
sixty-second constant is either a safety boundary or a message selector
depending on what the arms on each side of it do. Under the shipped disposition
it separated a refusal from a proceed, so the number needed a distribution of
real-world clock skew that nobody can measure. Under the corrected disposition
both sides refuse and the number only decides which diagnostic line prints. The
repair was not a better number — it was removing the number's authority over
anything dangerous. **A number with a respectable provenance sitting on an
unsafe boundary is still an unmeasured number, and the provenance is exactly
what makes it feel settled.**

**THE OBVIOUSLY-RIGHT HALF IS THE ALIBI.** That packet bundled two changes: a
repair to the DIAGNOSIS — a distinct state for clock skew, said loudly, since
the old code printed *age 0s* for a file dated ten years in the future — and a
change to the DISPOSITION that no part of the diagnosis required. The first is
unarguable. The second rode in on it, through a review and two rounds. This is
section 7's true-half-carries-the-false-half promoted from a sentence to a
change, and it is worse there, because a bundled commit gets one review and the
unambiguous half sets its tone. The diagnosis half also turned out to be what
made the corrected disposition affordable: refusing was undiagnosable before,
precisely because skew read as a live lease.

### 7i. What a remedy costs, which is a different question from whether it works

Section 7 already says that an error message suggesting a remedy is prescribing,
and that a guard prescribing the edit which silences it is worse than one that
simply refuses. Three sharpenings arrived the same night, from two directions,
and each was found by someone auditing their own guards against the other's.

**A WORKING REMEDY AND A SAFE REMEDY ARE DIFFERENT QUESTIONS, AND A SWEEP THAT
ASKS THE FIRST ONE FEELS EXHAUSTIVE BECAUSE EVERY ITEM GETS AN ANSWER.** Four
override paths were audited and cleared, and the audit asked of each whether it
genuinely does what it says. One of them disables a safety window entirely, at
no cost, with the qualifier *if you know why that is safe* — pure honour system.
**The reader most likely to type it is the one who wants the run to start now,
which is the exact state the guard exists for.** The clearing was not careless;
it answered one question twice. This is the same shape as three separate passes
over a count pin all asking whether the number was right and none asking whether
the set was.

**A REMEDY THAT CAN BE PERFORMED WITHOUT KNOWING ANYTHING IS A LAUNDERING PATH;
A REMEDY THAT CARRIES A COST IS NOT.** The lease's refusal may tell a reader to
delete an abandoned advisory file when nothing holds the tree, because that
costs a judgement about the world. It may not tell them to widen the tolerance,
because that costs nothing and silences the guard permanently. The same
distinction repaired an override elsewhere: it now proceeds, and stamps the run
not-pushable. The remedy still works and it is no longer free.

**AND THE STAMP HAS TO REACH THE LAST LINE.** Section 7's rule that the noisiest
part of an output is where a skipped check hides best has a mirror image: a
caveat printed at the place the override was taken sits hundreds of lines above
the final verdict, and the final verdict is what gets read and relayed. The
repair was a closing line that names the override, refuses to read as either
green or red, and carries its own exit code. **THE PLACE A CAVEAT IS FIRST
NOTICED IS NOT THE PLACE IT HAS TO SURVIVE TO.**

Finally, the two failure modes of a prescribed remedy are worth holding as a
pair, because they fail in opposite directions. A remedy that is **false and
effective** — mark this existing file as new, and the check passes forever —
works every time, and every use makes the record slightly less true while the
check stays green. A remedy that is **true and inert** — write the note in the
history file and re-run, from a check that never reads the history file — wastes
one run and burns the trust of the one person who obeyed it. **The first
corrupts the corpus the instrument protects; the second destroys the
instrument.** The second is self-limiting. The first is not.

### 7j. The clock is the only measurement here with no visible failure mode

Section 3 of this report says every date in this repository is the local date
of the machine that wrote it, and explains what one night of mixed conventions
cost. This is the failure one level below that: not the wrong zone, but a time
nobody read.

Two sessions, working in parallel, corrupted their own records the same way on
the same night, and neither could catch the other. One stamped every log entry
from its sense of elapsed time after a single real reading — **one hundred and
forty-six claimed minutes inside sixty-four real ones**, the last entry wrong by
about eighty-six, across seven artifacts and fifty-three references, discovered
only because a piece of arithmetic disagreed with a header. The other did the
same thing on a smaller scale, seven entries out of the twelve it examined.

**HOW MUCH SMALLER IS NOT KNOWN, AND THE FIRST VERSION OF THIS SECTION CLAIMED
IT WAS.** It said each of the seven was wrong by one to three minutes. That
range came from the three entries that could be re-dated from a commit's own
timestamp — **which are the entries sitting next to commits, and therefore the
ones most likely to have been written close to a real event.** The four that
could not be anchored contribute nothing to the range, and unanchorable is
precisely where a large error would hide. **THE SUBSET THAT CAN BE CHECKED IS
THE SUBSET THAT WAS ALREADY MOST LIKELY TO BE RIGHT**, so a range measured over
it understates the whole by construction. The defensible statement is: one to
three minutes for the anchorable ones, unknown for the rest. **The selection
effect is not specific to timestamps** — the same session's sweep over thirteen
build runs drew its conclusion from the runs that had summaries, which are the
runs that completed, and the same shape sits under any audit whose evidence is
whatever survived.

The same correction applies to the population. Twelve entries were examined
because twelve is where that session's context began, not because anything
demonstrates the fabrication started there. **A boundary chosen where you
stopped looking is not a boundary; the entries before it are unexamined, not
clean.** The other session's boundary is real — a command printed `02:59:14`,
so everything after the last demonstrable read is suspect by construction.

**A PLAUSIBLE TIMESTAMP IS INDISTINGUISHABLE FROM A READ ONE.** That is the
whole finding. Every other measurement in this system has a shape that can fail:
a wrong commit hash does not resolve, a wrong count fails against a denominator,
a list that covers one of three fails against the list. A clock time has no
shape. It is the cheapest measurement available and the only one whose forgery
leaves no trace, so it survives every re-read, including by the person who
invented it.

**And it compounds, which is the mechanism.** Nine of the larger failure's
entries were later anchored against directories the repair had no reason to
touch, and the drift turned out to be monotonic and accelerating: about six
minutes early on, an hour by the middle, ninety-five minutes by the end. So the
session was not inventing a plausible time each turn. **It was estimating from
its previous estimate**, and every entry was consistent with the one above it.

**A SEQUENCE THAT IS SELF-CONSISTENT AND UNANCHORED DRIFTS WITHOUT EVER
CONTRADICTING ITSELF.** Local consistency is what a writer checks — does this
follow from the line above — and local consistency is exactly what a drifting
sequence preserves. The error is visible only from outside, and there was
nothing outside until an unrelated calculation needed the real time.

Both sessions **already had the rule** — read the clock as its own call, then
write. Both kept the write and stopped making the call. So the lesson is not
that a rule was missing:

**A RULE THAT REQUIRES AN EXTRA CALL DECAYS SILENTLY TO ITS CHEAPER HALF, AND
HALF-KEEPING IT IS INDISTINGUISHABLE FROM KEEPING IT.** This is the same family
as the re-read that confirms the true half at no cost: the degraded version
produces output identical to the good version, so nothing ever signals the
decay. One of the two files carried a legend defining a marker for exactly this
case — *not anchored* — and the marker went unused all night, three lines above
the entries that needed it.

Two things about the repair are worth as much as the finding.

**The corrupted values were not recomputed into better-looking ones.** They were
replaced with what is actually defensible: the interval, measured at both ends,
and the order, which position in the file already carries. **A fabricated number
rewritten as a plausible number repeats the error with tidier output.** Where an
independent record existed it was used instead — a commit's own timestamp, a
script's file mtime — because those were written by something that did read a
clock.

**And the sweep that fixed it missed thirty-seven cases**, because its pattern
required a date prefix and the bare form has none. That is section 7i's
exhaustiveness failure occurring inside the repair for a different one, within
the hour, and it was caught only by asking the denominator question of the fix
rather than of the code.

One more thing about that repair decides which errors stay recoverable, and
nobody decided it. Of the two sessions, one appended its correction beside the
wrong value and left the original standing; the other overwrote fifty-three
references in place, in a directory that is not under version control, so the
original values survive only in a transcript that dies at compaction. **A
CORRECTION APPENDED IS EVIDENCE; A CORRECTION APPLIED IN PLACE IS JUST A
DIFFERENT CLAIM** — and the same session had, two hours earlier, correctly
refused to delete a poisoned row from a ratchet history on exactly that
argument, then failed to apply it to a record of its own error.

**And the sorting was done by a tool, not by a judgement.** Of the two passes
that rewrote those references, one printed every distinct value it replaced and
the other printed a count. The evidence survives exactly where the instrument
named the thing instead of counting it. That is section 7's *print the thing,
not only the count of things* deciding what is recoverable, inside a repair
built to fix a different instance of the same rule, an hour after both sessions
had agreed it was the important one. Neither session chose which of its errors
would stay recoverable. **A rule both of them had articulated was operating on
them while they were discussing it**, and a print statement decided.

**The in-place correction cost more than that, and the extra cost is the reason
to prefer appending even when the claim is small.** Timestamps written by
something other than the writer turned out to be the only recovery available —
every run leaves files, and the filesystem stamps them while the author is
reading nothing. But the repair script had rewritten most of the scripts it
corrected, so their mtimes now date the repair rather than the work. The nine
anchors that survived did so only because they sat in directories the fixer had
no reason to touch. **A CORRECTION APPLIED IN PLACE DESTROYS MORE THAN THE CLAIM
IT REPLACES — IT DESTROYS THE ARTIFACT'S OWN TESTIMONY ABOUT WHEN IT WAS MADE.**

Which puts a limit on the recovery technique itself, and it is worth stating
because this report leans on it: **an mtime is a one-shot anchor that any later
edit silently destroys, and nothing records that the destruction happened.**
Unlike a commit timestamp it carries no history, so it is evidence only for a
file nobody has touched since — and whether anybody has touched it is exactly
what an mtime cannot say. Section 7d's own anchor is of this kind.

**And the recovered anchors are strong only for as long as the session that
recovered them.** Those nine mtimes are trustworthy because that session can say
nothing rewrote those directories, and it can say that only because it knows
what its own repair touched. That is session knowledge, not filesystem
knowledge. It does not survive compaction, and the anchors will not look any
weaker once it is gone. **AN ANCHOR WHOSE VALIDITY RESTS ON KNOWLEDGE HELD ONLY
IN A SESSION IS EXACTLY AS DURABLE AS THAT SESSION, AND NOTHING ABOUT IT CHANGES
APPEARANCE WHEN IT EXPIRES.** So write beside every anchor what would invalidate
it and how the writer knows it has not happened: a successor can check the first
clause and can never reconstruct the second.

That is the same shape as this project's oldest warning about itself — a session
holding a rule it loaded at start is holding a claim whose expiry date is
invisible from inside. Here the claim is a timestamp and the expiry is a
compaction, and what evaporates is not the number but the reason to believe it.

**One more property was nearly filed as luck and is worth stating as a rule.**
The evidence that survived the repair is exactly the evidence the repair had no
story about: nine decoy directories the fixer had no reason to open. So —
**everything a repair rewrites stops being able to testify about the thing it
repaired.** A repair should touch the narrowest set it can, not for scope
discipline but for that reason, and it should expect its own record of what
happened to survive only in the places it did not go.

One discipline held through the recovery and is worth copying. With nine
anchored times and a list of subjects in hand, the obvious next step is to
assign them to entries line by line. That was declined: **matching a recovered
timestamp to an entry by inference produces a reconstruction wearing the clothes
of a measurement**, which is the original error one level more sophisticated and
therefore harder to see. The table is the recovery; the assignment stays with
whoever reads it.

The last piece is the reason this section exists at all rather than being one
session's embarrassment. Neither session could have caught the other: one was
reading the numbers and the other was writing them. **AGREEMENT BETWEEN TWO
AGENTS IS NOT EVIDENCE.** Where a claim cannot be checked against something
neither of them wrote, it is not checked.

### 7k. The repair script outlives the defect, and the rule that keeps failing

Two more from the same night, both about what a fix leaves behind.

**A ONE-SHOT REPAIR SCRIPT IS A LOADED GUN THE MOMENT ITS JOB IS DONE.** The
script written to replace fabricated timestamps ran a second time, by accident,
inside a throwaway command whose author believed it had been skipped. It
rewrote the header of the file about corrupted timestamps — because its pattern
was written to match what was wrong then, and **the corrected text that replaces
a defect sits, by construction, in the same neighbourhood as the defect.** A
timestamp fixer's output is timestamps. A path fixer's output is paths. Nothing
about the second run looks any different from the first, and the second run is
always the one nobody reasoned about.

Two details of the response are the reusable part. The script was **not
deleted** — it is the only surviving record of the values it replaced, so
removing it would have been another in-place correction of exactly the kind this
section is about. It was made to **refuse unless an explicit variable is set**,
and the refusal was proved rather than assumed. And the damage was **bounded by
measurement rather than by argument**: one line, with the recovered anchors
re-read afterwards to confirm they were untouched — which they were, for the
reason already recorded here, because they were not part of the story being
corrected.

The second finding is harder and is recorded without a repair, which is the
honest state of it. The same session's standing rule is that composed throwaway
one-liners are not to be written at all. **That rule failed three times in one
night** — twice caught by a token guard, once not caught by anything, because
the command was perfectly legitimate shell.

**A RULE THAT HAS FAILED THREE TIMES IN ONE NIGHT IS NOT A RULE, IT IS A
PREFERENCE RESTATED AFTER EACH FAILURE.** The failure mode of a rule with no
mechanism is that it gets re-affirmed each time it is broken, and the
re-affirmation feels like a response. It is the same shape as section 7j's
decay: the version of the practice that is kept and the version that is
abandoned produce identical-looking output, so nothing signals which one is
running. Saying that no mechanism exists yet is worth more than a fourth
restatement of the preference.

### 7l. The strongest evidence is the most dangerous kind to get wrong

Two near-misses on the same night, in two lanes, both of which would have ended
an investigation early — and each was strong evidence about the wrong thing.

**The first was a mutation proof.** A brief named a class: *an environment
variable that greens every record at one stroke.* The named variable was closed,
and the repair was verified the expensive way — a record moved genuinely past its
date still refuses with the old override set to a rescuing day, and putting the
override back in the live path rescues it again. That is the strongest form of
evidence this project has, and it is evidence about **one member of the class.**
`TZ` greens the same wall, measured under three zone values. **A MUTATION PROOF
OF THE NAMED PATH IS THE STRONGEST POSSIBLE EVIDENCE ABOUT THE WRONG SUBJECT,
AND ITS STRENGTH IS WHAT STOPS ANYONE LOOKING FURTHER.** Author, verifier and
the previous round's reviewer all read the closed instance as the closed class.

**The second was a probe that answered nothing and looked like a negative
result** — and it carried two independent defects, either one fatal.

- The zone was set through a shell that mangles environment values containing a
  slash, so it never reached the process. The treatment was inert. This is the
  same family as the trap already recorded in this project's instructions, where
  a `rev:path` argument in that shell silently yields zero bytes with exit 0.
- It ran at an hour when every candidate zone shared a calendar day, so the
  comparison returns *identical* whether or not the zone matters. **A check
  whose true and false answers are the same observation** — the first class in
  this section, reappearing inside a probe written to investigate a different
  one, six hours after being written down twice.

**Together they are worse than either: an inert treatment plus a blind
measurement produces a confident negative with a real-looking number attached.**
The session was one keystroke from reporting that zones were harmless, with
evidence.

Two rules follow, and the second is the one that costs something. A probe must
**print what the subject actually received**, not what the caller intended to
send, so an inert treatment is visible rather than assumed. And a probe must be
run where its two answers differ — **a comparison taken at a point where the
hypothesis predicts no difference is not a negative result, it is not a
measurement at all.** The second is hard because such a point is usually the
convenient one, which is the control-at-a-convenient-point defect wearing new
clothes.

The other escape is worth naming honestly: the parallel probe in the other lane
avoided both defects, and avoided them **by accident** — it passed its values
through a call that no shell touches, and it happened to pick zones on the far
side of the date line. Neither was a precaution. **An escape you cannot explain
is not a practice, and it will not repeat.**

### 7m. THE REPORT THAT LOOKED FINISHED BECAUSE THE VERDICT IS WRITTEN FIRST

Measured at 04:33 on 2026-09-10, on my own coordination rather than on any
packet. The standing instruction I wrote for myself after an earlier loss was
**bank the review out of the disposable worktree the moment it lands** — the
worktree is torn down, so a report left inside it dies with the teardown. At
04:33 `REVIEW2.md` was present in `lease-review`, and I copied it: 18,309 bytes,
a verdict line, nine numbered sections, and a final section stating what could
not be determined. It read as a finished report in every respect a reader checks.

It was 71% of one. The worker was still appending; the file reached 23,080 bytes
and the process left the table at 04:35:18. Sections 6 through 9 did not exist
yet, and section 6 was a line reading `## 6. THE NEW CONSTANT (placeholder)`.

Three things make this worth writing down rather than filing as carelessness.

**The verdict is written first, so a partial report is complete exactly where a
reader acts.** A sealed review puts its verdict at the top, and its property
sentence immediately under it, because the ordering condition demands the
sentence be on disk before the diff is opened. Both were present and both were
final. Had I read the verdict and dispatched a round 4 from it, I would have been
acting on a *correct* verdict backed by evidence that had not finished arriving —
and nothing in the four sections I did read would have told me. **A document
whose conclusion is written first cannot be checked for completeness by reading
it, because the part that would reveal the truncation is the part a reader skips
when the conclusion is already in hand.**

**The rule decayed to its cheaper half, which is the defect §7j already names.**
"The moment it lands" has two readings — the file exists, and the job that writes
it has ended — and the cheap one requires no extra call. **A RULE THAT REQUIRES
AN EXTRA CALL DECAYS SILENTLY TO ITS CHEAPER HALF, AND HALF-KEEPING IT IS
INDISTINGUISHABLE FROM KEEPING IT.** The class was written down eleven commits
ago and did not fire, and the reason it did not is instructive: the rule named an
*event* rather than an *instrument*. The repaired form names the instrument —
**a report is finished when the process that writes it has left the process
table, and the file's own contents can never establish this**, because
completion is a fact about the writer, and every witness to it lives outside the
document.

**The accident produced the only external witness to an ordering claim, and that
is a mechanism worth building on purpose.** The sealed review's third condition
is that the property sentence goes on disk before the diff is opened and is never
edited afterwards. Until now that condition has been enforced by asking the
reviewer to attest to it — and a reviewer attesting to its own ordering is the
echo problem in §7g: an attestation cannot be wrong, which is why it is worthless.
My mistimed copy is an outside witness the reviewer did not know existed. Diffing
it against the finished file shows the property sentence byte-identical, and shows
exactly two changes to earlier text: a removed `Section 1 ends here.` marker and a
duplicate heading renumbered. Both were disclosed in the report's own section 9
**before** I ran the diff.

So: **take the snapshot deliberately.** A coordinator that copies the review file
once, early — the moment it first appears — holds a cheap, independent anchor
against which the never-edited claim becomes checkable rather than attested. It
converts testimony into a measurement, and it costs one file copy.

The bound has to be stated with it, because it is narrow and easy to overstate.
My snapshot was taken at 04:33 and the sentence is claimed to have been on disk
at 04:14. **It rules out a late edit. It says nothing whatever about an early
one** — the interval before the first snapshot is exactly as unwitnessed as it
was before, and a snapshot taken after the diff was opened cannot testify about
the order of the two. The mechanism is worth building because it closes the
window it covers, not because it closes the condition; claiming the latter would
be this section's own defect committed inside it.

### 7n. THE GUARD THAT PASSED USELESSLY, AND WHY THAT IS WORSE THAN ONE THAT FAILED

Two sessions built the same guard from the same lesson within an hour of each
other on 2026-09-10, and the pair is worth more than either half, because the two
copies failed in opposite ways and only one of the failures was visible.

The guard refuses to mutate a git worktree somebody else is working in: a
modified tracked file means a worker is mid-edit, and a verifier that writes to
a tracked file and restores it afterwards has no business there.

**The first defect: it refused its primary subject, permanently.** Pointed at the
repository root it refused unconditionally, because twelve `.agents/skills/**`
deletions are the maintainer's and have stood there all night. Orch found this
in its own copy immediately, because Orch's callers point at the repository root.
Mine has the identical predicate and **never showed it**, because my callers
point only at fresh worktrees.

The difference between the two copies was not care. It was **which subject each
of us happened to have**, and that generalises past guards:

**A MECHANISM PROVED ONLY AGAINST THE SUBJECTS IT HAPPENS TO BE USED ON IS
PROVED AGAINST A SAMPLE CHOSEN BY THE PERSON WHO WROTE IT** — drawn from the
same intuition that wrote the code, and therefore precisely the sample least
likely to contain the case that breaks it.

Orch's copy failed usefully. Mine passed uselessly. **Passing uselessly is the
one that ships**, and it ships with a clean record behind it, which is the whole
problem: nothing about a latent defect looks different from an absent one.

It also names the repair. The remedy for a guard that refuses standing
background state is **an allowlist the CALLER supplies**, never a path list
hidden inside the guard, because **an allowlist nobody can see is
indistinguishable from a guard that does not work**. Declared paths are counted
and printed as *standing* separately from the *unexplained*, on every call
including the allowing ones.

**The second defect is one level in, and it is the sharper of the two.** Orch
took the sample rule above, applied it to the guard it had just finished, and
asked which subject class it had never pointed the thing at. Answer: it had
proved the allowlist across three *trees* and never across a *prefix*. The
parameter it had added an hour earlier was the only thing in the file with no
adversarial case against it.

**A PARAMETER JUST ADDED IS, BY CONSTRUCTION, THE PART WITH THE LEAST EVIDENCE
AND THE MOST CONFIDENCE BEHIND IT.** It is new, so nothing has attacked it; it
was just written, so its author believes it; and it is the newest thing in the
file, so it is the first thing a reader assumes was thought about.

The measured case: one plausible caller typo — an empty-string prefix — matches
every path, so every modification counts as declared and the guard reports the
tree quiet while a worker is mid-write. And the printed line said `1 []`, because
an unquoted join renders an empty prefix as an empty list. **The output read as
NOTHING DECLARED at the exact moment one prefix was matching everything.** Both
copies had it; mine printed `declared: ` and was no better.

**The repair is asymmetric, and the asymmetry is the substance.** Too broad
refuses, from an enumerated token list rather than from a clever
matches-everything predicate — a predicate like that would itself need proving
and nothing would prove it. Too narrow does **not** refuse: a prefix that matches
nothing leaves the guard strict, so it fails safe and is only reported. Refusing
both directions would have been the over-broad arm a third time in one night,
which is the failure mode both copies had already committed once.

**The third, in the instrument rather than the guard.** Verifying a control by
mutation, I removed a line with a regex and got `pass 0 fail 1` with the failing
test named as the file — the strongest-looking red the runner can produce. It was
my substitution leaving `if (rec.id)` with no statement: a syntax error. **A FILE
THAT FAILS TO PARSE AND A CONTROL THAT FIRES ARE THE SAME COUNTS FROM OUTSIDE**,
and the counts were what I was reading. Removing the exact line gave the honest
result — a named test with a real assertion, expected and actual — and the
control does bite. Orch committed the same family of error in the same hour,
reading a test's exit code through a pipe and reporting the pipe's status.

The common shape under all three, and it is §7l's rule arriving from a new
direction: **the strongest-looking evidence is the most dangerous to get wrong,
because its strength is what stops anyone looking further.** A guard with a clean
record, a parameter nobody has attacked, and a total red are all of that kind.

---

## 8. THE PHASED PLAN

**Phase 0 — commit the host. IN ROUND 3. Round 1 authored and reviewed `revise`
(six unbound checks). Round 2 authored, verified independently, and reviewed
`revise` again — 46 mutations, 12 caught, 34 missed. Round 3 is a disposition
round and is the last one: it ends when every arm has a disposition, not when
every arm has a test.**

`scripts/brief-lint.mjs` and `scripts/brief-lint.test.mjs` exist and the suite is
28/28 green, implemented by Muse Spark xhigh under the maintainer's new routing.
What holds:

- **the move, by diff rather than by assertion:** exactly 8 lines gone and 13
  added, every one inside the two declared parameterisations. No check, message
  or comment altered. Re-diffed independently by the reviewer, same result.
- **the wild fixture is banked and not reconstructed** — the reviewer confirmed
  the test reads the committed file and takes the sha from its own authority
  line, and that nothing else in the file is labelled or implied as wild.
- **the host refused my own next brief, from the repository, at the point of
  use** — three times across two briefs, and each time I fixed my prose rather
  than the check.

**AND THE PART THAT DOES NOT HOLD, WHICH IS THE MOST USEFUL RESULT IN THIS
REPORT.** I verified round 1 by mutating the linter and watching the suite go
red: neutering `report()` turned **27 of 28** red, forcing the exit code to 0
turned **15 of 28** red, restored by hash, green again. I concluded the suite
binds.

**A sealed reviewer with edit rights on a disposable copy then found SIX
mutations the suite does not catch at all** — remove `rewrite|` from the
edit-verb list; drop the `i` flag from check 6; delete check 6's `never|token`
exemption; lower the packet threshold from 5 to 3; cut the revision check's
second arm; drop the `!bareResult` half of the result-name conjunction. **Every
one leaves the suite 28/28 green while the real shape slips through.**

> **MY MUTATIONS TESTED THE PLUMBING. ITS MUTATIONS TESTED THE CHECKS.**
> Neutering `report()` is the mutation *most* likely to be caught, and choosing
> it made my verification **a check narrower than the property it claimed** —
> the dominant defect class in this whole report, committed by the verification
> of the instrument built to mechanise it.

Two design decisions bought that finding and both should be reused:

1. **The reviewer got a disposable copy and edit rights on it.** A reviewer that
   can only *describe* a mutation is guessing whether the test would catch it;
   one that applies it and watches is not. All four files came back
   byte-identical by hash — it restored everything it broke.
2. **It was asked "what would this still pass on?" as its primary question**, not
   "is this correct?" It also refused round 1's argument that two unexercised
   branches were covered by shared logic elsewhere, calling it *"convenient, not
   sound"* — correctly: the branches share a sub-test, not their logic.

Round 2's acceptance criterion was therefore unusually clean, and it is the shape
every future round of this kind should take: **the review handed over six named
mutations that currently pass, and the job is done when every one of them turns
the suite red.**

**ROUND 2 LANDED AND WAS VERIFIED INDEPENDENTLY. The suite went from 28 tests to
66, the linter's digest never moved, and all eight mutations turn it red** —
applied by my own script against the author's file, restored by hash between
each, green again at the end.

The verification instrument itself needed one property worth recording:
**every mutation is an exact substring required to occur exactly once, and a
zero-match refuses.** Without that, a mutation whose pattern had drifted would
leave the file correct, the suite green, and the report would have said *"the
suite failed to catch this"* — a false finding, in the confident direction,
manufactured by the verification.

### And the part of round 2 nobody asked for is worth more than the part that was asked for

The revision brief did not list eight fixes. It named the **class** — *a negative
control that passes for a reason other than the property it names* — and required
a **sweep** of every twin for that class, saying outright that the eight were
what one reviewer found in one session and the enumeration was the author's to
complete.

It came back with **ten more that nobody had named**: the iteration/attempt
exemption never exercised green, the `(new)` exemption, the `Work only in:`
alternative header, the `enforces` alternative beside the proven `enforced by`,
scope's prohibition exemption, the `numbered` arm that the bare-only twin had
never isolated, three separate arms of the review-name conjunction, and the
packet's marker-**order** arms where only the count had ever been red.

> **A BRIEF THAT NAMES EIGHT FINDINGS GETS EIGHT FIXES. A BRIEF THAT NAMES THE
> CLASS AND REQUIRES A SWEEP GETS THE ENUMERATION.**

That is this project's oldest measured finding — *specification was the
bottleneck* — restated at the level of a revision brief, and **it is how items
1, 2 and 3 below should be briefed.** Not as lists of defects to repair; as a
named class with a sweep required and the enumeration owed back.

**And it refused to contrive, which is the harder half.** Its report names four
checks it could *not* bind and why, including a same-prefix-different-sha pair
that does not exist in this repository — declined on the grounds that *"inventing
a collision would manufacture the domain that would make the claim true."* Given
round 1's shared-logic argument was found *convenient, not sound*, those four
claims were not taken at face value; they became question 3 of the round-2
review rather than a conclusion. **That was worth doing: the four split three
ways.** One is a real limit of the tree. Two are honest deferrals with buildable
vehicles. And the fourth — the sha collision — is *"convenient, not sound as
applied"*: no collision needs inventing, because the linter accepts a 7-to-40
character sha and the authority argument is a free string, so **one existing
object against its own prefix is the vehicle, sitting in the tree the whole
time.** The principle was right and its application was not, which is a
distinction worth keeping: a good rule invoked where it does not apply is the
most persuasive kind of excuse.

### THE ROUND-2 REVIEW, AND THE REASON THIS SECTION NOW ENDS WITH A RULE ABOUT WHEN TO STOP

The second sealed review returned `revise` and it is the most useful artifact
this exercise produced. It attempted **46 mutations. Twelve were caught. Thirty-
four left the suite 66/66 green.**

**That is not a regression, and reading it as one would be the mistake.** Round
1's reviewer attempted about eight mutations and found six holes; this one
attempted forty-six. **The suite did not get worse between rounds — the search
got deeper.** And it will get deeper again: character classes, anchors, flags and
thresholds multiply faster than fixtures can be written, so a round that ends
when the reviewer runs out of ideas is a round that never ends.

Three of the misses are live escapes rather than tail, and one of them is this
whole report in miniature:

- **`:274`'s quote exclusion is unbound while the comment three lines above it
  states its purpose outright.** A comment that claims a reason, with no control
  behind the reason — inside the host built to mechanise exactly that class.
- **`:225` losing its global flag crash-binds rather than control-binds.** The
  suite goes red, so it looks covered; it goes red because the code throws. The
  property that matters — all stray paths in a sentence, or only the first — has
  no fixture at all, and a brief with two stray paths would have only its first
  caught today.
- **`:200`'s hole is one deleted line from an existing green vehicle**: a file
  list with a header and no bullets would pass, and closure would be gone.

**And the review refuted the author's own report**, which belongs beside §7c's
instrument-versus-sentence finding. `RESULT2` §4 claims a short spaced phrase
distinguishes the length requirement from the space requirement. It cannot — the
phrase is too short to survive the collection pattern and never reaches the space
filter. The space arm *is* bound, but incidentally, by long spaceless paths the
base brief happens to carry. **A twin that passes for a reason its author did not
intend is bound to the base fixture, not to the check** — and it will unbind
itself silently the day someone edits the fixture for an unrelated reason.

**THE RULING, WHICH IS THE PART THAT TRANSFERS.** Round 3 does not try to bind
all thirty-four. **The unit of work is not a test, it is a DISPOSITION, and there
are three:** BIND it (vehicle, twin, and a mutation proving the twin must fire),
**DELETE it**, or RECORD it with a named owner and an expiry.

**DELETE is the option nobody had considered, and it is live for several of
them.** An alternation arm that no real brief has ever exercised, that no test
binds, and that nobody can name a use for **is not coverage — it is decoration
that reads as coverage**, which is the artifact class this host exists to refuse.
Deleting it makes the linter smaller, the suite honest, and the next sweep
shorter.

That gives the exercise the terminating condition it did not have:

**THE SWEEP TERMINATES WHEN EVERY ARM HAS A DISPOSITION, NOT WHEN EVERY ARM HAS
A TEST.**

It is §3's disposition rule — *runs and refuses, or recorded judgement with an
owner and an expiry, or deleted; unowned prose is not a third option* — turned
inward and applied to a guard's own internals. Every item in this plan should
end this way, because every item in this plan can otherwise be extended forever
by a sufficiently determined reviewer.

**Phase 1 — items 1, 2 and 3, in that order.** All three are outside the change's
scope, all three have wild negative controls available, and item 2's primary host
is a command guard rather than a test.

**Phase 2 — items 5 and 6**, the lineage/provenance pair, narrowed as §3.6 says.
Tonight's `03e2207` is the wild control; do not write these until it is banked
somewhere durable.

**Phase 3 — there is no Phase 3.** It held items 4 and 7; the §5 gate struck
both. That work is **finishing the change**, not converting a finding, and
merging the two would have produced two mechanisms for one property that could
disagree.

**Then Stage 1 of `two-desks-work-orders-and-trains`** — per the maintainer's
instruction of 23:28, the wisdom conversion is a gating item ahead of Stage 1,
not a document filed after it.

**Not scheduled, and named rather than hidden:** §4's gap. Hand-composed
coordination prose is reached by no host on this list.

---

## 9. WHAT NONE OF US COULD DETERMINE

- **Tool results were stripped from the distillation notes**, so every "measured"
  number in them — file counts, pid start times, suite counts 1727→1817, token
  attributions — is taken on **prose authority**. Both agents said so
  independently. That is precisely the failure mode the notes warn about,
  operating on the notes themselves.
- **The 7/3/1 state counts rest on engagement data outside the notes**, and the
  memory dates are upper bounds only. The ratio cannot rank individual lessons.
- **The engineering cost of each mechanism, and the cost each avoids, are not
  measured.** Every score in §3 is a stated relative judgement, not a return.
- **Luna could not read the repository through `git`**, so its host claims were
  filesystem-derived and its rankings could not see what the change already
  ships (§5).
- **Whether reasoning that the transcripts do not keep actually happened.** Muse:
  *"'Decided without reasoning' is unsupported over 'reasoned where the
  transcript does not keep.'"*
- **Human judgements — voice, worth-reading, frontier qualification, source
  sufficiency, whether a correction is earned — cannot be reduced to a
  deterministic refusal without changing the property being judged.** They need a
  fresh recorded judgement at the point where they matter. That is the whole
  reason P2 became a three-way rule instead of a two-way one.

---

## 10. THE HYPOTHESIS DEMONSTRATED ITSELF SEVEN TIMES, EACH TIME DURING AN ATTEMPT TO FIX IT

This is the part I would want a later reader to notice, because it is the only
evidence here that did not have to be argued for.

1. **During the investigation.** `arch-timeline-analysis.md:193` records it: I
   first read the "47" chain as a *lost* lesson whose remedy was to write it down
   again — **precisely the reflex the hypothesis names as the failure**. Orch
   checked the corpus, found the lesson there since first commit, and I verified
   and withdrew.
2. **During the proposal.** I named four hosts. Two did not exist. Two readers
   who could not see each other both found it, and neither needed anything but a
   search of the tree I had not run.
3. **During the plan.** Item 7 was ranked as new work by a capable agent, and the
   change had **already merged it that same day**, down to the same negative
   control. One command against a file that agent could not read struck it.
4. **During the citation of the strike.** I first cited it by line number, which
   showed me the specification and hid the ticked box — so the report briefly
   said *"already specified, finish the change"* about work that was **already
   in `main`**. Pinning to a task number, which is my own rule from the citation
   repairs six hours earlier, is what corrected it.
5. **During the justification of where to file this report.** I gave a reason —
   a guard that does not reach root markdown — which is true and **protects
   nothing**, because that guard reaches no markdown anywhere. The conclusion
   was right; the reason was decoration; and a second reader had to run the glob
   to find out.
6. **During the verification of Phase 0 itself.** I mutated the linter twice,
   watched the suite go red, and certified it. A reviewer mutating one level
   down found **six checks the suite does not bind**. My negative control was
   narrower than the property it claimed — §8.
7. **During a peer's `runners.yml` entry, and it is the only one caught before
   it shipped.** A2AI-Orch stopped to source a stderr literal it had recorded as
   "re-derived from the architect's ledgers", could not find it there, and asked
   rather than committing. The literal turned out to be **real** — but the
   measurement that settled it also found that **the stderr is ANSI-coloured
   with an escape sequence sitting inside the phrase a person would naturally
   anchor on**. A pattern spanning that boundary never matches, and *a regex
   that never matches never errors*: it reads as coverage from the file while
   the ledger stays exactly as silent as it is today.

**Seven failures of the same kind, inside the exercise designed to reduce
reliance on them, over about seven hours.** And the part that settles the
argument: **every single one was caught by going to look — a diff, a glob, a
`cat-file`, a repin, a mutation, a second reader. Not one was caught by anyone
remembering a rule at the right moment**, which is exactly what the 7/3/1 count
said would happen and exactly what a better-written memory file would not have
changed.

That is why Phase 0 was *commit the host* rather than *write the lessons down
more clearly*, and why §3.1's control must be **generated from the diff** rather
than maintained by the author who wrote it.

**One more trap, found while choosing this file's home, and recorded because it
will catch someone:** `scripts/run-tests.mjs:54` walks exactly
`['app','lib','loop','pulse','scripts','tests']`, and `walk()` returns silently
on a directory that does not exist. **A `*.test.mjs` banked anywhere else is
never collected, and `npm test` exits 0 having never seen it** — not "all
passed", but "these particular ones never ran", hidden inside a suite that A2AI-
Orch measured at 1,819 passing on the 2026-09-09 gate run at `95bb03e` (its
figure, not a measurement of mine), where neither the floor nor the ratchet can
tell the two apart. Nothing executable goes under `wisdom/`; if it ever needs to,
it goes under `scripts/` or the SEARCH list gains a root, and that is a reviewed
packet either way.

---

## 11. THE SENTENCE TO KEEP IF EVERYTHING ELSE IS LOST

**Storage was the intervention already running during every failure it was meant
to prevent.** So a lesson is converted only when something *runs and refuses*, or
when a *named person owns it with an expiry*. And before routing a finding to a
host, **read whether the host exists** — because a proposal naming a host that
does not exist fails its own read-before-proposing bar, and this report's own
first draft did exactly that, twice, and was caught by two readers who could not
see each other.
