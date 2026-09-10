# PACKET C1 — ENUMERATION, committed before the freeze

Drafted 2026-09-09 ~21:45. Every figure below is measured at the current tree,
and the command that produced it is named. Nothing here is inferred from the
task text.

## THE CHANGE, IN ONE SENTENCE

**`subject` becomes REQUIRED on a carried finding**, so a reviewer finding that
names no path is REFUSED and reported rather than transcribed into
`data/carried/`.

## WHAT IS ALREADY BUILT — and the likeliest wrong turn is to build it again

**THE MERGE ALREADY EXISTS, at queue-derivation time.**
`pulse/lib/queue.mjs`'s `carriedFindingItems()` (`:424`) reads `data/carried/`,
takes `data.subject`, and groups on

    const key = subject ?? `data/carried/${name}`;

So findings sharing a subject ALREADY become one item, and findings without one
ALREADY cannot group, because their key is unique by construction.

**C1 does not build a merge. It completes the one that ships, by removing the
fallback's reason to exist.** An author who builds a second grouping beside this
one would pass its own tests and be wrong. This is the single most likely
failure of this packet and the brief must say so.

**A TRAP REMOVED BEFORE BRIEFING.** `pulse/lib/queue.mjs:855` — the CALL SITE —
read *"One item per file under data/carried/"*, which was the behaviour before
grouping existed and false after. A reader checking whether the merge exists
reads that comment, concludes it does not, and builds the second grouping. Fixed
while scoping this packet, in its own commit, because leaving it would have
caused precisely the wrong turn above.

## WHY TRANSCRIPTION-TIME MERGE IS REFUSED — the mechanism, not a preference

`loop/lib/carry.mjs:29-42`, quoted from the source:

> Each entry becomes one file under `data/carried/` … the file's PRESENCE is
> the state … There is deliberately no separate "resolved" flag and no
> merge-step bookkeeping to retire one: the fixing job's own diff deletes the
> file it was dispatched against.

**ONE FILE PER FINDING IS THE RETIREMENT MECHANISM.** Merge at transcription
time and several findings share one file, so a job fixing one of them cannot
delete it — it either leaves a fixed finding in the queue or retires unfixed
ones alongside it. Parse-time merge keeps one file per finding and merges only
the VIEW. The shipped design is right and C1 must not disturb it.

## THE FILES — the closure over this packet

- `loop/lib/verdict.mjs` — parses the verdict; `:78` builds `subject` (empty
  string when absent), `:87` pushes the carry entry, `:58`'s comment states
  "`subject` is optional" and is the sentence this packet falsifies.
- `loop/lib/carry.mjs` — transcribes; `:98`'s `subjectMustExist` check is
  guarded by `entry.subject &&` (so a MISSING subject skips the existence check
  entirely today), and `:114` spreads the `subject:` front-matter key only when
  truthy.
- their tests.

NOT in this packet: `pulse/lib/queue.mjs` (the read side is already correct),
`data/carried/README.md` line 9 (A2AI-Orch fixes it inside C1's gated sha at
handover — it carries TWO errors: the optionality C1 changes, and "the one
content file", already narrower than `subjectMustExist`, which tests
`existsSync` against any tracked path).

## THE REFUSAL SHAPE ALREADY EXISTS IN THE FILE BEING EDITED

`verdict.mjs:193-208` already refuses the sibling `readsHumanFrom` structure on
exactly this ground:

    if (!subject) { …`no non-empty \`subject\` — skipped (an entry answers for ONE named post)` }

and drops the entry with a warning. **C1's refusal should follow this shape
rather than invent one** — same file, same author, same vocabulary. An entry
that names no subject is dropped with a warning naming the entry and why.

## THE BEHAVIOUR CHANGE, MEASURED — this belongs in the brief, not in discovery

Counted by `arch-count-carries2.mjs` over the ledger corpus:

    records scanned:                408
    records with >= 1 carry:        144
    carry ENTRIES in all:           223
    breakdown {1:87, 2:37, 3:18, 4:2}  ->  87 + 74 + 54 + 8 = 223
    entries with NO subject:        15 of 223  = 6.7%

**So roughly one reviewer finding in fifteen changes outcome**: after C1 those
are refused and reported instead of carried. Live `data/carried/` is safe —
one file, and it has a subject — so there is no migration. The reviewer-facing
behaviour change is real and must be stated in the brief rather than found.

## COUNTING RULE, stated so the figures can be re-derived

Counting `^carry:` counts RECORDS, not ENTRIES — a record carrying three
subjects matches once. Every wrong carry figure this change has produced came
from that one substitution. The breakdown must total the entry count; if it does
not, the count is wrong.

## OPEN, TO RESOLVE BEFORE THE FREEZE

1. Does `subjectMustExist`'s `entry.subject &&` guard (`carry.mjs:98`) become
   dead once subject is required? If so it is removed in this packet, not left.
2. Does `carry.mjs:114`'s conditional spread become unconditional?
3. What does `verdict.mjs:78`'s empty-string default become — is the empty
   string still constructed and then refused, or is the refusal earlier?

These are implementation shape, not policy, and they are listed so the brief
resolves them rather than the author choosing silently.

---

# RESOLVED BEFORE THE FREEZE — the three open questions, settled by reading the code

## THE DATA PATH, established first because all three answers rest on it

`carry.mjs:47` imports `parseVerdict` from `./verdict.mjs`, and `:86` is
`const entries = v.carry ?? []`. **Entries reach the transcriber from that
parser and from nowhere else** — the exported function is
`transcribeCarriedFindings` (`carry.mjs:77`) and its only production caller is
`loop/run.mjs:76`. So a guard added in `verdict.mjs` is sufficient; nothing can
route around it.

## Q3 — WHERE THE REFUSAL GOES: `verdict.mjs`, as a third guard, shape copied

`verdict.mjs:70-88` already refuses in a fixed shape, once per required field:

    if (!title)  { carryWarnings.push(`${at}: no non-empty \`title\` — skipped (…)`); return; }
    if (!detail) { carryWarnings.push(`${at} …: no non-empty \`detail\` — skipped`); return; }

`subject` becomes the THIRD guard in that sequence, worded the same way and
saying what a subject is for — the path a repair job will target.

**`:78`'s empty-string default STAYS.** It is what makes `!subject` behave
identically to `!title` and `!detail`. Do not change the parse; add the guard.
An author "tidying" the default into `null` would break the uniformity that
makes the three guards readable as one rule.

## Q1 and Q2 — BOTH GUARDS IN `carry.mjs` BECOME DEAD, and are removed here

Given the data path above, every entry reaching the transcriber has a non-empty
subject once Q3 lands. So:

- `carry.mjs:98` — `if (subjectMustExist && entry.subject && !existsSync(...))`
  loses `entry.subject &&`. **Today that clause means a MISSING subject skips
  the orphan check entirely**, which is the hole this packet closes; leaving it
  would keep the hole open in a file that can no longer reach it.
- `carry.mjs:114` — `...(entry.subject ? [`subject: …`] : [])` becomes
  unconditional. A transcribed file with no `subject:` key is no longer
  reachable, and leaving the conditional implies it is.

Both are removed IN THIS PACKET rather than left as dead defensive code, because
dead defensive code around an invariant is indistinguishable from doubt about
the invariant.

## THE BLAST RADIUS — RUN, NOT COUNTED. Seven tests, one file.

**RETRACTED: my first figure here was "roughly thirty fixtures", from
`grep -c 'carry:'` over each test file (32 / 3 / 1). That count is real and the
inference from it is wrong.** Of `carry.test.mjs`'s 32 matches, most are
comment prose, test NAMES, and `parseCarry({ carry: [...] })` argument keys —
not fixtures. A2AI-Orch reproduced the same 32 by the same grep, so agreement
did not catch it: **two derivations sharing an instrument are one derivation.**
This is the counting rule two sections above, applied to itself one section
later.

**THE INSTRUMENT THAT ANSWERS THE QUESTION ASKED IS THE CHANGE ITSELF.** I
applied the third guard as a probe in `fleet6-stage0-C1`, ran the four candidate
files, and reverted it (tree verified clean afterwards):

    baseline   57 pass   0 fail   exit 0
    probe      50 pass   7 fail   exit 1

**Seven test cases break, every one of them in `loop/tests/carry.test.mjs`.**
Named, because a list of seven is checkable and "about thirty" is not:

1. `parseCarry: a well-formed entry is read whole, with subject optional`
2. `parseCarry: a single mapping (not a list) is accepted the same way a list of one would be`
3. `parseCarry: one bad entry among good ones is skipped without discarding the rest`
4. `parseVerdict carries carry: and carryWarnings alongside the existing fields, unchanged`
5. `two carry entries become two files, each named for the job and numbered, with real titles`
6. `a malformed entry inside an otherwise-valid carry: list is skipped and reported, the rest still transcribe`
7. `transcribing twice does not overwrite an existing file — a retry does not clobber a finding already written`

(1) is not a fixture edit: **its NAME asserts the property this packet
reverses**, so it is rewritten, not repaired. (7) fails with an `ENOENT` rather
than an assertion — it writes a file the first transcription was supposed to
create — so an author reading the failures will meet one that does not look
like a missing subject at all.

### The files that need NOTHING, with the counts that disarm the grep

An author who greps `subject:` to find the work lands on these first. Each is
cleared by having been RUN under the probe, not by inspection:

| File | why it is out of scope |
|---|---|
| `loop/tests/review-blog-bar.test.mjs` | **0 carry blocks, 30 unrelated `subject:` lines** — thirty hits in the file that needs no change (A2AI-Orch's find) |
| `loop/tests/review.test.mjs` | 0 carry blocks, 9 unrelated `subject:` lines |
| `scripts/verify-launch-voice-carry.test.mjs` | 7 `carry:` hits, 29 `subject:` lines — all of them the `reads-human-from` CARRY-FORWARD (`{subject, record, why}`), a different feature that merely shares two words |
| `loop/tests/corrections.test.mjs` | its single `carry:` match is a COMMENT at `:99`. No fixture. Passes under the probe |
| `loop/tests/discarded-proposal-retry.test.mjs` | 3 carry fixtures, **all three already carry a subject**. Passes under the probe |
| `pulse/tests/carry-queue.test.mjs` | the read side. Passes under the probe — run it, do not edit it |
| `loop/tests/mock-executor.mjs` | its two carry entries both carry `subject: site-note.md` |
| `loop/tests/mock-proposal-executor.mjs` | entry 1 carries a subject; entry 2 is the deliberate no-title entry, and see the guard-order note below |

## WHAT THIS PACKET MUST NOT DO

1. Build a second grouping beside `carriedFindingItems()`. The merge ships.
2. Merge at transcription time. One file per finding is the retirement
   mechanism (`carry.mjs:29-42`).
3. Touch `pulse/lib/queue.mjs`. The read side is already correct.
4. Touch `data/carried/README.md`. A2AI-Orch fixes line 9 at handover.

---

# THE CLOSURE WAS WIDER THAN THE FIRST DRAFT SAID — tasks 13, 14 AND 15

The first draft of this document scoped C1 to `verdict.mjs` + `carry.mjs`.
**That was the task-13 closure, not the packet's.** Reading tasks 13-17 in
`tasks.md` shows C1 is tasks **13, 14 and 15** (C2 is 16 and 17), and task 14
names a third production file:

> 14. `loop/lib/review.mjs`: the reviewer's brief documents both fields and the
>     required subject.

## TASK 14 HAS THREE SITES IN `review.mjs`, AND THE THIRD IS THE ONE THAT BITES

1. `:685-686` — the prose: "`subject` is optional: the one content file the
   finding concerns, when there is one."
2. `:693-694` — the worked example: `subject: <optional — the content file this
   concerns, …>`.
3. **`:734-736` — the front-matter SKELETON, which does not mention `subject`
   at all**:

       # carry:                    # optional, zero or more — omit the key entirely
       #   - title: ...             # if you are carrying nothing forward
       #     detail: ...

   A reviewer copies the skeleton, not the prose. Fix only (1) and (2) and the
   template a reviewer actually pastes still produces an entry that is now
   REFUSED. **A brief that says "make the docs say required" gets sites 1 and 2
   and misses this one**, so the brief names all three by line.

`verdict.mjs`'s own JSDoc at `:58-59` says the same thing ("`subject` is
optional") and is in the closure already because the file is.

**A SECOND ERROR RIDES ALONG IN THE SAME SENTENCE, in two files.** Both
`review.mjs:686` and `data/carried/README.md:9` call the subject "**the one
content file** the finding concerns". `subjectMustExist` (`carry.mjs:98`) tests
`existsSync(join(repoRoot, entry.subject))` — **any tracked path**, not a
content file. The narrowing was never true. `review.mjs` is C1's to fix; the
README is A2AI-Orch's at handover, and it is the SAME sentence in both places.

## "REPORTED NAMING THE RECORD" CANNOT BE SATISFIED IN `parseCarry`

Task 13 requires the refusal be "reported naming the record". `parseCarry(data)`
receives parsed front matter and nothing else — it does not know which record it
came from, and every existing warning names only `carry[i]` and the title.

**It does not need a new parameter.** `carryWarnings` has exactly one consumer
in the whole tree — `carry.mjs:85` — and `transcribeCarriedFindings` already
holds `jobId` and `verdictPath`. The record is named where the record is known.
The parser stays context-free; the transcriber, which read the file, says which
file. Threading a label through `parseCarry` would be the plausible wrong turn.

Verified consumers: `grep -rn carryWarnings` over `loop/ pulse/ scripts/ lib/`
returns `carry.mjs:85` and `verdict.mjs` itself. `run.mjs:1921` logs each
warning as `the verdict record's carry: block ${w}` — the job's log, which never
names the record either.

## THE GUARD ORDER IS PINNED BY A FIXTURE, not by taste

`loop/tests/mock-proposal-executor.mjs:110-116` deliberately carries a
malformed entry with NO title and NO subject, and its comment says why: "so the
loop's warning path is exercised by a real run, not only by a unit test". With
the guards in order title → detail → subject, that entry still reports **no
title** and its warning text is unchanged. Put the subject guard first and the
fixture's warning changes without any test in that file being edited.

## TASK 15's MUTATION B SAYS "REINSTATE" AND THERE IS NOTHING TO REINSTATE

> **Mutation B**: reinstate a cap of two and confirm the five-entry test fails

**Measured at the authority commit: neither `verdict.mjs` nor `carry.mjs`
contains any bound on the entry count.** `grep -nE "slice|\.length *[<>]=?|max|
MAX|limit|LIMIT|cap\b"` over both files returns exactly one hit,
`verdict.mjs:250`'s `Object.keys(data).length > 0`, which is the front-matter
presence test. The word "reinstate" presupposes a removal I could not find in
either file's history.

The mutation is therefore **INTRODUCE**, and the brief says where: truncate to
two in `parseCarry`'s loop, because that is the site the "no numeric cap"
decision belongs to and it is reachable from every caller (see the data path).
The five-entry test asserts the count of TRANSCRIBED files, so the red is
end-to-end rather than a parser unit assertion.

## A NUMBER CHANGES MEANING WITH NO LINE IN ITS FILE CHANGING

`run.mjs:678`:

    if (gate.verdict) reviewPhase.carried = Array.isArray(gate.verdict.carry) ? gate.verdict.carry.length : 0;

`carry` is the parser's ACCEPTED list. After C1 a subject-less entry never
enters it, so the ledger's `carried` count silently becomes "findings accepted"
where it used to mean "findings the reviewer wrote". No line in `run.mjs`
changes; the definition moves underneath it. **This is stated, not fixed** —
`run.mjs` is outside C1's permitted files, and the honest record of it is a note
on the parent, not a silent drift.

## CORRECTION TO THIS DOCUMENT'S OWN DATA PATH SECTION

It said the only production caller is `loop/run.mjs:76`. **`:76` is the IMPORT;
the call is at `run.mjs:1904`** (A2AI-Orch, verified). The conclusion is
unchanged and is in fact stronger than stated: `transcribeCarriedFindings`
itself calls `parseVerdict(readFileSync(verdictPath))` at `carry.mjs:84`, so
even the tests that call it DIRECTLY (`carry.test.mjs:289` says so in as many
words) still go through the parser. There is no route to the two guards that
skips it.
