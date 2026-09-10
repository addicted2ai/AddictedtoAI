# Ordering anchors for this packet — what each round's "written first, never edited" claim is actually worth

A report that states its conclusion first is complete exactly where a reader
acts, so **the finished file cannot distinguish a sentence written first from one
written last.** Unaided, "section 1 was never edited afterwards" is an
attestation.

The remedy costs one file copy: take a snapshot of the report **at first
sighting**, before the writer has finished, and the claim becomes checkable — the
text that existed at snapshot time either survived byte-identical or it did not.

From 2026-09-10 this is mechanised rather than done by eye. A watcher copies the
report once, at first sighting, and **refuses to arm if the file already exists**
— a copy of a file that predates the watch is the previous round's leftover
wearing the anchor's name.

**THE BOUND, and it is not a formality: an anchor rules out a LATE edit and says
nothing about an EARLY one.** Anything the writer changed before first sighting
is inside the anchor already.

## The rounds

| round | artifact | anchor | final | ordering claim |
|---|---|---|---|---|
| 3 | `round3-REVIEW.md` (sealed review) | 731 bytes, 05:16:47 | 34,065 bytes | **VERIFIED** |
| 4 | `round4-RESULT.md` (author) | 21,327 bytes, 05:45:16 | 21,327 bytes | **UNVERIFIED — no evidence exists** |

**Round 3.** The anchor held the verdict line and section 1 only. Against the
finished file the property sentence is **byte-identical**, and the single change
to text present at snapshot time is the verdict resolving from `revise — PENDING
SWEEP` to `revise` — a transition the reviewer's own annotation had disclosed in
advance. The reviewer also recorded, unprompted, that its baseline was red for a
cause outside the diff it had been given.

**Round 4, and this row is the reason the file exists.** First sighting was
21,327 bytes — **byte-identical to the finished report** — because this author
wrote its report in a single write at the end. Nothing was observed mid-write, so
there was nothing for the final file to be compared against.

**THAT IS NOT A PASS. "THE ANCHOR MATCHED" AND "THERE WAS NOTHING TO MATCH
AGAINST" ARE THE SAME GREEN FROM OUTSIDE**, and the second is what happened here.
Round 4's ordering claim is unverified — not contradicted, not confirmed, simply
unmeasured. It is recorded that way rather than left as a table cell a later
reader would score as agreement.

The instrument reports this condition explicitly (`NO ORDERING EVIDENCE: the
anchor is the same size as the final file`) instead of printing two equal numbers
and letting the equality read as confirmation. A check that cannot distinguish
*I looked and found nothing* from *I looked at nothing* is not a check, and that
applies to this check as much as to the ones the packet was built to examine.

**What would change it.** Nothing, retrospectively — the moment is gone. For a
future round, a report written incrementally is anchorable and one written in a
single final write is not, so the honest options are to brief authors to write
section 1 to disk before opening the subject (which the sealed-review briefs
already do, and round 3 shows it working), or to accept the claim as
unverifiable for that round and say so here.
