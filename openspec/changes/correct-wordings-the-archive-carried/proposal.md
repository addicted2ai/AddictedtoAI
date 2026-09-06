# correct-wordings-the-archive-carried

## Why this change exists at all

Four carried findings, each raised by the reviewer of a Desk job against a
change that was still in flight, name a sentence that is inaccurate. All four
sentences sat **inside a `### Requirement:` block**, and all three of their
parent changes were archived on 2026-09-06:

| finding, from | change, now archived as | live spec the archive wrote it into |
|---|---|---|
| `j-20260905-19-carry-1.md` | `archive/2026-09-06-flag-what-moved-the-frontier` | `openspec/specs/blog/spec.md` |
| `j-20260905-22-carry-1.md` | `archive/2026-09-06-separate-a-claim-from-a-fact` | `openspec/specs/pulse/spec.md` |
| `j-20260905-21-carry-1.md` | `archive/2026-09-06-tag-the-corpus-by-domain` | `openspec/specs/wiki/spec.md` |
| `j-20260905-16-carry-1.md` | `archive/2026-09-06-tag-the-corpus-by-domain` | `openspec/specs/directory/spec.md` |

`openspec archive` merges every requirement block of a change's deltas into the
live spec, so each of these four sentences is now in the constitution — and a
live spec is a reserved path that only the archive step writes. **A change is
therefore the only route left**, and this is that change: four `MODIFIED`
blocks, one per affected requirement, each the live requirement copied whole
with one sentence corrected.

The findings' own archived copies were corrected in the same diff as this
change. That is deliberate and is the smaller half of the work — the archived
copy is what a reader following a carry file's citation reaches, and the live
spec is what governs.

## Why this is a wording change and not a substantive one

No requirement changes. No gate changes. No field, vocabulary, threshold or
behaviour changes. Every `MODIFIED` block was extracted from the live spec
programmatically and re-verified programmatically: undoing the single
correction reproduces the live requirement **byte for byte**, which is the
check that a `MODIFIED` block clobbers nothing — it replaces the whole body, so
an incomplete copy silently deletes text.

    blog       6680 bytes   byte-faithful apart from the one sentence
    pulse      6050 bytes   byte-faithful apart from the one sentence
    wiki      10439 bytes   byte-faithful apart from the one sentence
    directory  3739 bytes   byte-faithful apart from the one sentence

## The four findings, re-measured

### 1. K46 was not a keeper ruling (`blog`)

`openspec/specs/blog/spec.md` says the `domains` bar "was withdrawn as **keeper
ruling** K46". The record does not support "keeper". `loops/ui-loop/state.md:59`
records it as "**K46** (BLIND-002)" with no keeper attribution, in a list that
marks keeper decisions explicitly — "K23 keeper, K24–K29 delegated", "**K43**
(keeper, 2026-09-05)", "**K45** (keeper via orchestrator)". BLIND-002's own
"Scope of the ruling" says the opposite in as many words: *"This is not
escalated: under K40 it is far short of 'insane catastrophic project
threatening'."* K46 was taken under the K40 blanket delegation while the keeper
was away.

It matters precisely because the passage exists to tell a later reader **who
decided this and on what authority** — the one thing the wrong attribution
destroys. Corrected to "ruling K46, taken under the K40 delegation".

### 2. One build hard-wired the empty state, not both (`pulse`)

`openspec/specs/pulse/spec.md` says the zero-metric file is "the state both
finalist builds were in **when each hard-wired** an empty element instead
(`implementer-ledger.md` row 6: …)". Re-measured: the ledger holds ten rows and
exactly one `fake-empty-state` row — row 6 — and it names only `CP-UI-001-1
Dated Ledger`. No second row records the Players Board build hard-wiring an
empty element. The directive itself kept the two apart: *"the exact day-one
state BOTH finalist builds hit"* / *"ledger row 6 is Dated Ledger
hard-wiring"*.

The day-one state was shared; the hard-wiring was one build's. Corrected to
"the state both finalist builds were in on day one, and the state in which one
of them hard-wired an empty element instead". The genuine two-builder
recurrence in this corpus is the founding-date mislabel (ledger rows 2 and 4),
which the same material cites correctly elsewhere.

### 3. 3 of the 71 transitions are vanished rows, not vanished fields (`wiki`)

`openspec/specs/wiki/spec.md` counts 71 number→absent transitions across the
2026-09-04 and 2026-09-05 snapshots. Both figures behind it reproduce exactly
from `previous.json` (427 rows) and `latest.json` (431 rows) — 69 on
`agentic_index` plus 2 on `coding_index`. But **3 of the 71 are rows that left
the snapshot entirely** rather than surviving rows that dropped the field:
`qwen/qwen3.8-max` (which carried both indices) and `ibm-granite/granite-4.1-8b`
(which carried `coding_index`).

Excluding those, 68 surviving rows lost `agentic_index` and **zero** surviving
rows lost `coding_index`. A vanished row is handled by the separate
last-known-value/repair rule in `wiki`, not by a seeding-signal disappearance,
so counting it here is row churn described as field churn. Corrected by one
clause: "3 of them rows that left the snapshot altogether". Both printed
totals — the 71 and the 182 — are unchanged and correct, and the conclusion the
requirement draws is untouched.

### 4. "At least two listings in three" overstates 23 of 35 (`directory`)

`openspec/specs/directory/spec.md` says a required `domains` field "would force
a wrong answer onto **at least two listings in three**". At the lower of the two
readings the same requirement prints, 23 of 35 is 0.6571, and two in three of
35 is 23.33 — the "at least" floor is breached by a third of a listing. It holds
at the 26 reading (0.7429).

Both exact counts are printed alongside, so nothing was hidden; the qualifier
was simply doing work it did not quite earn. Corrected to "onto 23 of the 35",
which is exact under either reading. The requirement's substance — `domains` is
optional on a tool listing, and the empty set is the common case — is untouched.

## What this change does not do

It does not touch `loops/ui-loop/state.md`, which finding 1 confirms is already
correct. It adds nothing, removes nothing and renames nothing — there is no
`## ADDED`, `## REMOVED` or `## RENAMED` block in any delta. It implements no
code, so every task box is ticked on authoring.
