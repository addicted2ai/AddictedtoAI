# Design: write-the-constitution-in-timeless-voice

## D1 — Why a change and not an edit

`openspec/specs/` is a reserved path. No Desk job may edit it, and the rule is a
mechanism rather than an instruction: a job that tries writes `HOLD.md`. The
sanctioned way for text to enter the constitution is a delta that `openspec
archive` merges, and there is no second way. That is inconvenient for a
prose-only correction and it is correct anyway — the alternative is a path where
"it's only wording" is the argument that gets a direct edit through, and the
defect being fixed here entered through exactly the door that a "it's only
wording" exception would reopen.

The consequence is that this change is **not self-applying**. It ends as a
validated directory. Archiving it is a separate act by the orchestrator or the
maintainer.

## D2 — The unit is the requirement body, not the line

`addictedtoai-n2g` enumerated seven `grep` lines. A `MODIFIED` block does not
replace a line; it replaces **the whole requirement body**, from its
`### Requirement:` header to the next header or the next `## `. That is the
merge's own boundary, and it is the reason the original defect happened at all:
a paragraph at the top of a block is not "context for the reviewer", it is text
being written into the constitution.

Counted by that unit, the seven lines are six bodies:

- `loop/spec.md:426` and `loop/spec.md:452` are both inside *"A runner proven
  unable to run is refused, and refusal is not a halt"* (body starts at line
  417).
- `:452` — *"drafted in this change's `design.md`"* — trips both the
  `this-change` and the `bare-change-artifact` markers, which is why the marker
  count (8) exceeds the line count (7).

So the six blocks below cover all seven enumerated lines with nothing left over.

## D3 — Reproduce the whole body, and prove it

The failure mode of a `MODIFIED` block is silent: drop a bullet and the archive
deletes a requirement, reporting success. Every block here was produced by
copying the live body verbatim and editing only the narrating sentences, and
then checked mechanically — `n2g-verify.mjs` (run from a scratch directory, not
committed) parses each block out of this change's delta and the corresponding
body out of the live spec and prints a line-level diff. The accepted result is
that every differing line is one this design names.

That check is the reason to trust the blocks; reading them is not.

**A scenario heading is identity, and cannot be rewritten.** Found by running
the gate, not by reading the docs: the first draft renamed
`#### Scenario: Coverage is checkable when the spine completes` — a heading that
names the originating change's task spine — and `openspec validate --strict`
refused the change outright, reporting the block as *omitting a scenario the
current spec still has*. It is right to: the archive has no way to tell a
renamed scenario from a deleted one, and deleting a scenario silently is the
larger harm. So the heading stays and only its WHEN is restated. That is also
the correct division on the merits — the WHEN is the line a reader has to
evaluate, and it is the line the narration was actually in.

## D4 — What counts as narration, and what this change deliberately leaves alone

The instrument is `scripts/check-spec-deltas.mjs`'s `NARRATION_MARKERS`, a
closed list where every entry is a phrase measured in a body that either reached
`openspec/specs/` or was caught on the way there. Using the repository's own
detector rather than a fresh judgment keeps the fix and the guardrail describing
the same defect.

**In scope**: the eight marker hits, plus any sentence in the *same paragraph*
that removing them would leave incoherent or that the requirement itself makes
false. Two sentences qualify:

- In *"A runner proven unable to run is refused"*: **"this specification does not
  describe it"**. It sits in the same sentence chain as the flagged clause, and
  it is false the moment the requirement it introduces is merged — the
  specification does describe it, immediately below. Left standing, it would be
  the same defect in a new form.
- In *"A job's total spend is measured"*: **"Every brief prints 'wall clock cap:
  N minutes' … and reads like a budget for the job"**. The requirement's own
  second bullet forbids exactly that brief. Restated as the conditional it was
  always arguing — *a brief that printed only that line would read like a
  budget* — it states the hazard the rule prevents instead of asserting a
  present state the rule abolishes.

**Out of scope, deliberately**: four requirement bodies open with a
present-tense diagnosis of the world *before* the requirement landed — *"A
verdict record today names a piece; it does not name the text it judged"*,
*"today the check cannot tell it from the other two"*, and their relatives.
Those are a real and adjacent defect: they are not change-relative, so no
reader is left hunting for a directory, but they will read as false to anyone
who checks them against the system. They are a **different** defect with a
different fix, no detector catches them today, and sweeping them into this
change would mean rewriting five paragraphs of argument under cover of a
narration cleanup — and a reviewer diffing these blocks against the live bodies
could no longer tell the mechanical fixes from the editorial ones, which is the
one property that makes this change checkable. Filed separately as
`addictedtoai-sut`.

The line held here is: fix what the detector finds, plus what fixing it breaks.
Nothing else.

## D5 — A dead pointer is replaced, not deleted

Three narrations were doing real work: they told the reader that a question was
**open** and where the argument lived.

| body | pointer | question | replacement |
|---|---|---|---|
| A runner proven unable to run is refused | this change's `design.md` | should a Desk with no usable runner halt? | `addictedtoai-pfv` |
| A budget refusal states the arithmetic | D8 in `design.md` | which denominator does a share divide by? | `addictedtoai-tr8` |
| A job's total spend is measured | D9 in `design.md` | should a job's total spend be bounded? | `addictedtoai-o5t` |

Deleting the pointer would have been the cheap fix and would have lost
information the reader can use. Keeping it as written would have kept a
reference that stops resolving the day the change is archived.

A beads id resolves. `bd show addictedtoai-tr8` answers for as long as the
repository exists, it survives a harness switch by design — that is the stated
reason beads is the memory here — and it names a *live* issue rather than a
frozen argument. The constitution already does this once, in
`openspec/specs/pulse/spec.md`, which cites `addictedtoai-ps3` for a blast
radius left deliberately unchanged. Each of the three issues was confirmed open
on 2026-08-31 before being cited.

**This is a reference, never a rule.** No SHALL in any of the six bodies depends
on reading a beads issue; a reader who cannot run `bd` still has the complete
requirement.

## D6 — Collisions were measured, not assumed

Two unarchived changes modifying one heading is last-writer-wins and the loser
is silent, and `openspec validate` structurally cannot see it — it validates one
change at a time. This change touches `loop` and `review`, and so does
`make-the-blog-worth-sending`, so the question is live rather than theoretical.

Enumerated on 2026-08-31 from every unarchived change's parsed delta, not by
reading:

- `group-tool-listings-by-category` — `directory`: two ADDED, one MODIFIED
  (*"No placement is ever sold"*).
- `make-the-blog-worth-sending` — `blog`: five ADDED, one MODIFIED;
  `editorial`: one MODIFIED; `loop`: one ADDED, four MODIFIED (*"One job is one
  outcome with one merge or discard"*, *"Work comes from three sources and
  cannot self-amplify"*, *"Spending is budgeted in model-minutes with floors and
  ceilings"*, *"Capacity exhaustion is a pause, and degradation is ordered"*);
  `pulse`: one ADDED, one MODIFIED; `review`: two MODIFIED (*"The reviewer
  judges quality with full standing, from a named reason list"*, *"What is
  checked depends on what the work is"*).

The intersection with this change's six headings is **empty**. Shared
capabilities are not collisions; shared *requirements* are, and there are none.
Archive order among the three changes is therefore unconstrained, and
`check-spec-deltas.mjs` reports no `collision` and no `archive-order` finding
for the merged set.

## D7 — Why no test is added

The regression this change protects against is already mechanised. A delta that
writes narration into a requirement body warns in every `npm run build` and is
**refused** by `node scripts/check-spec-deltas.mjs --strict`, which is the check
to run immediately before `openspec archive`. That check has its own tests. What
was missing was never a detector; it was that the detector post-dates the text.
Adding a test that asserts "the constitution contains no narration" would be a
second copy of `narrationHits()` with a different failure message, and it would
be asserting a property of merged output rather than of anything this change
ships.

`addictedtoai-fh7` already records the remaining hole — that running `--strict`
before archiving is an instruction rather than a mechanism — and it is not this
change's to close.
