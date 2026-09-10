# C1 JUDGED AGAINST THE REQUIREMENT ITSELF, NOT AGAINST THE TASK TEXT

A2AI-Orch's question, 2026-09-09 22:55, and it is the right one:

> THE PACKET'S CORRECTNESS HAS BEEN ESTABLISHED AGAINST A DERIVED ARTIFACT (the
> task text) WHILE THE SOURCE IT DERIVES FROM HAS NEVER BEEN COMPARED TO THE
> CODE.

True, and the reason is recorded: both briefs — the author's and the first draft
of the review's — pointed their reader at `specs/loop/spec.md`, where the
requirement is not. Every reader of this packet so far was aimed somewhere it is
not. The two dispatched reviewers are the first pointed at the real text, and
this is my own independent pass, done while they run so that three answers exist
rather than two.

**Source:** `openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md`
at `3025c58`, `### Requirement: A reviewer's non-blocking finding reaches work
without editing anything`, line 434.
**Subject:** the diff `3025c58..1aae621`.
**Method:** every bullet of the requirement read in order and compared to the
tree, ignoring what tasks 13-15 say. Where the task text and the requirement
would give different answers, the requirement wins and I say so.

## Clause by clause

| Requirement clause | Verdict | Evidence |
|---|---|---|
| entries carry a `title`, a `detail`, and a `subject` naming the file | SATISFIED | `verdict.mjs:76-88`: three guards, all present, all dropping the ENTRY. Zero entries stays legal and warning-free. |
| a `subject` SHALL be **required** rather than optional | SATISFIED | `verdict.mjs:87-90`, the third guard. Absent, `null`, empty and whitespace-only all refuse — `String(...).trim()` at `:78` makes `!subject` behave exactly as `!title`. |
| where a subject already carries standing findings it SHALL merge | SATISFIED, AND CORRECTLY UNTOUCHED | The merge ships at queue-derivation time in `carriedFindingItems` (`pulse/lib/queue.mjs:424`). That file is absent from the diff. Building a second merge here would have satisfied the clause twice and been a defect. |
| **the number of entries a review carries SHALL be recorded on the job's ledger line** | **SATISFIED IN A DIFFERENT SENSE THAN BEFORE — see below** | `run.mjs:678` records `gate.verdict.carry.length`, the PARSER'S ACCEPTED list. |
| no numeric cap | SATISFIED | No cap anywhere in the diff; the author's mutation B introduced one solely to prove the arm goes red, and restored it by hash. |
| a reviewer-noted **proposal** MAY travel on the same terms | SATISFIED, NOT AFFECTED | "The same terms" is *travelling as data in the verdict record*, not *carrying a subject*. `notedProposal` reads its own `PROPOSAL_FIELDS`; nothing in this diff touches it, and nothing in the requirement asks it to. |
| neither `carry:` nor a noted proposal SHALL affect the verdict | SATISFIED | The merge gate is unchanged in both directions; its arm still asserts `ok === true` with a `carry:` block present and still refuses a blank `would-cite` for the same reason with one present. |
| the reviewer's brief SHALL document both fields and the required subject | SATISFIED | Three sites in `review.mjs`, including the front-matter skeleton a reviewer pastes. A skeleton copied verbatim now yields an accepted entry. |
| a carried finding SHALL NOT be a second route to publication | UNAFFECTED | Nothing in the diff changes selection, budget or the review gate. |

## THE ONE CLAUSE THAT LANDS SOMEWHERE THE TASK TEXT DOES NOT LOOK

> **The number of entries a review carries SHALL be recorded on the job's ledger
> line**, so that the volume of this channel is a series anyone can read rather
> than something that has to be re-derived from the record files each time the
> question is asked.

`loop/run.mjs:678`:

    if (gate.verdict) reviewPhase.carried = Array.isArray(gate.verdict.carry) ? gate.verdict.carry.length : 0;

`gate.verdict.carry` is the parser's ACCEPTED list. Before this packet a
subject-less entry with a title and a detail was accepted and counted. After it,
that entry is dropped by the third guard and is not counted. **No line in
`run.mjs` changes, and the meaning of the ledger field changes anyway.**

Three things follow, and the third is what makes this worth writing down:

1. The field now measures *entries accepted* where it measured *entries written
   with a title and a detail*. Both are defensible readings of "the number of
   entries a review carries"; they are not the same number.
2. The requirement's stated PURPOSE is a **series anyone can read**. The series
   now has a discontinuity at the merge commit, and nothing in the ledger names
   it. A reader comparing last week's counts to next week's is comparing two
   quantities, exactly the "re-derive it from the record files" the clause exists
   to prevent.
3. **THE REQUIREMENT ITSELF MEASURES THE SIZE OF THE DISCONTINUITY, in the
   paragraph arguing against a cap:** *"the required subject would have refused
   15 of 222, 6.8%."* So the break is not merely noted, it is quantified — about
   one entry in fifteen, on the corpus of 2026-09-08 — by the same requirement
   whose clause it breaks. That figure is the one a reader of the series needs
   and the ledger does not carry.

**This does not block C1.** `loop/run.mjs` is correctly outside the packet's
permitted files; the file list is right and widening it now would be the wrong
repair. It is `A2AI-Orch`'s decision, already in its lane as "the `run.mjs:678`
ledger-field decision", and this is the argument FOR deciding it rather than
carrying it: the clause it touches is in the requirement, not only in the design
note, and the number that prices it is in the requirement too.

## ONE PRE-EXISTING DEAD BRANCH, STATED SO NOBODY LATER READS IT AS C1 DAMAGE

`loop/lib/proposals.mjs:582` writes the subject conditionally:

    (f.subject ? `\n(The reviewer named \`${f.subject}\`, …)\n` : '')

and its JSDoc at `:556` types findings as `{title, detail, subject?}`. On the
production path those findings are `orphanedFindings` (`run.mjs:1902`, `:1914`),
which come from `transcribeCarriedFindings`'s `orphaned` array — and an entry
only becomes orphaned by failing `existsSync` on its subject, which needs a
subject. **So the conditional was already unreachable from production BEFORE
this packet**, under the old `subjectMustExist && entry.subject && …` guard.
This diff does not make it dead and does not make it deader. The `subject?` in
the JSDoc remains honest, because the tests call `recordDiscardedAttempt`
directly with findings of their own construction, and the function's contract is
wider than its one production caller.

## WHAT I DID NOT CHECK

- The two `#### Scenario:` blocks below the bullets, beyond the two whose
  substance the bullets restate. If a scenario states something the bullets do
  not, I have not compared it.
- Every OTHER requirement in the review delta. This pass read one requirement.
- Anything the reviewers are being asked to run. This is a reading, and a
  reading cannot tell you whether an assertion would fail on a reversal.
