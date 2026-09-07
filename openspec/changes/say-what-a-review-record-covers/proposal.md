# Say what a review record covers

## What was re-measured before designing anything

Both issues are claims about a tree as it stood on 2026-08-31 and 2026-09-03.
Everything below was re-measured against the working tree on **2026-09-06**,
at `impl/spec-review` (cut from `main` at `e76fb30`, containing `0a181ad`).
Three of the claims had moved, and one of them changes the design.

**`addictedtoai-37rb` — still true, and narrower than it was.** The bead says a
post's `reads-human` "continues to speak for the bytes the post reviewer read,
not the bytes now on the site." Re-measured:

- `loop/lib/review.mjs:80-84` — `READS_HUMAN_TYPES` is still `['post']` and
  `needsReadsHuman` still keys on the job type alone. Nothing records a
  carried-forward voice verdict; no reviewer of a `repair` job is asked the
  voice question, and no field exists for one to decline it in.
- **CHANGED SINCE THE BEAD, and it is half a fix already shipped.**
  `scripts/verify-launch.mjs:613-661` no longer reads only the current record.
  It asks whether **any** approving record naming the piece carries a non-empty
  `reads-human`, through `hit.declaredBy`, precisely because
  `j-20260902-23` — the repair — superseded `j-20260902-20.pass2.md` and the
  post "had been reviewed for voice and read as though it never had." The
  comment there names this bead's question as deliberately out of its scope:
  *"Whether a repair that rewrites a post's prose should re-take the voice
  verdict is a real and separate question ... carried by its own issue rather
  than decided here."*
- So the residue is exact, and it is what this change answers: the voice verdict
  is no longer **lost** when a repair supersedes the record, and it is still not
  **bound** to anything. `declaredBy` will happily return a verdict written
  against bytes three rewrites old, and nothing anywhere says which bytes it
  answered for.

**`addictedtoai-kpgn` — still true, with every number moved and one structural
claim in it now false.**

- `lib/reviews.mjs:298-307`, `reviewablePieces`, still filters entries on
  `hasBody`. Unchanged.
- The corpus is bigger. Measured by loading it (`lib/corpus.mjs`), not by
  counting files: **553 entries, 95 with a prose body, 458 without** —
  `concept` 19/19, `event` 11/11, `model` 446/29, `org` 24/22, `technique`
  15/14, `tool` **38/0**. The bead's headline finding holds exactly: zero of
  thirty-eight `tool` entries has a body, and the same rule that exempts them
  exempts 417 body-less `model` stubs.
- **The bead's "there is no binding mechanism for a body-less entry in the first
  place, now or later" is no longer true, and that is what makes this change
  small.** `lib/reviews.mjs:298-306` now appends `corpus.claim` to the
  reviewable set, and its own comment says why: *"A claim has no prose body and
  no indexability, so it appears here only for the hash binding."* A body-less
  piece in the reviewable set, bound by hash and touching no page's
  indexability, is a shape this file already carries.
- **And the write half already exists, and has already been exercised.**
  `loop/lib/review.mjs:840-851`, `joinableSubjects`, admits any `content/**.md`
  that is not a deletion — a body-less entry included — so the merge would
  write a `reviewed:` hash for one it merged. Re-measured 2026-09-06 with the
  repository's own loaders (`readReviewRecords` + `reviewedOf`, not a regex,
  against the corpus `reviewablePieces` actually returns today): **13**
  `reviewed:` entries across **12** records bind a path outside today's
  reviewable set — 11 are body-less `model` entries (`j-20260830-01`,
  `j-20260901-01`, `-02`, `-03`, `-04`, `-06`, `-10`, `-11`, `j-20260901-05.pass2`,
  and `j-20260906-16` twice, written **today**), plus two on
  `content/wiki/README.md` (`j-20260905-25`, `j-20260906-11`). **No record
  names a `content/wiki/tool/` file as a subject at all** — the bead's `tool`
  claim still holds exactly. But the broader claim that nothing has ever
  exercised the write half does not: simulating `reviewJoin` with the
  reviewable set extended to every entry (this change's own N5) shows nine of
  those eleven body-less entries resolve to state `recorded` — their hash
  matches — the moment the set is extended, which means the write half has
  already been exercised nine times over. That strengthens rather than
  weakens this change's design (the binding a fact-only edit needs is already
  being written; nothing currently reads it), but it is the opposite of what
  this proposal asserted before re-measurement. `addictedtoai-4nq` edited
  `content/wiki/tool/vllm.md` direct to `main` in `ba1a577`, which is still the
  bead's own point about `tool` entries specifically.
- `lib/review-hash.mjs:118-127`, `reviewedSurface`, takes raw file text and
  hashes canonical front matter plus body. A body-less file produces a
  well-defined surface — its front matter — with no special case needed.
- The sibling proposal the bead names,
  `data/proposals/un-gated-main-edits-bind-wholesale.md`, is still on disk and
  still unconsumed, and still scopes itself to prose edits.

**One thing measured that neither bead claims.** `MECHANICAL_FRONT_MATTER_KEYS`
is now two keys, `['timeline', 'domains_seeded']` (`lib/review-hash.mjs:94`),
not one. Both are Pulse-written. A body-less entry's reviewed surface is
therefore its front matter minus those two, which is where its sourced facts
live — so a fact-only edit moves it, which is the property this change depends
on.

**One number in this proposal was wrong and is corrected here.** `data/reviews/`
holds **357** review records, not 358: 358 `.md` files, of which `README.md` is
documentation and is skipped by both loaders (`lib/reviews.mjs:143`,
`loop/lib/review.mjs:579`). Re-counted 2026-09-06. As corrected above, 13
`reviewed:` entries across 12 of the 357 bind a path outside today's reviewable
set, and none names a `content/wiki/tool/` file — but the count itself now matches what the code
loads, since the parser control in `tasks.md` task 14 compares against exactly
that set.

**One measurement about the delta itself, because a `MODIFIED` block is
last-writer-wins on archive and `openspec validate` cannot see the collision.**
Every unarchived change in every worktree on this machine was scanned on
2026-09-06 for the headings it modifies: **no change other than this one carries
a `MODIFIED` block on either "The reviewer judges quality with full standing,
from a named reason list" or "A review record names the bytes it reviewed"**, and
no other change touches `specs/review` at all. Both bodies were extracted
programmatically from `openspec/specs/review/spec.md` and diffed against the
delta the same day: the live text is present verbatim and every difference is an
addition.

## The finding

Both issues are the same defect seen from two sides: **a review record is read
as covering more than it binds.**

`reviewed:` closed the case where the bytes moved and nobody re-reviewed. It
does not close the case where somebody did. A repair rewrites a post's prose,
its own reviewer approves the diff and correctly writes no voice verdict — a
three-sentence licence correction has no voice to answer about — the merge
writes a fresh hash, and the piece is bound, current and approved. The only
reviewer that ever answered the voice question read a version that is gone.

And on the other side, a whole class of piece is outside the binding entirely.
458 entries carry sourced facts in front matter with no prose body. Their facts
are inside the reviewed surface; they are not inside the reviewable set. A
fact-only edit to one is not missing, not unbound, not mismatched — it is absent
from the count. `specs/review`'s own mandatory-review requirement is explicit
that entry data changes beyond feed binding need review; nothing measures
whether they got one.

## The decision

**For the voice verdict: option (b) from the bead, and the bead's own reasoning
for it stands up under re-measurement.** An approving verdict on a job that
merges a change to a blog post must either answer the voice question afresh or
carry a named prior answer forward, saying in its own words why the diff did not
move the post's voice.

**The obligation follows the merged subjects, not the job type, and that is the
one place the first draft of this design was wrong.** `needsReadsHuman`
(`review.mjs:682`) keys the voice question on the **job type**, and
`READS_HUMAN_TYPES` is `['post']`. The bead's own instance is not a `post` job:
`j-20260902-23` is type `repair` (`data/ledger.jsonl:68`), and its record
approves `content/blog/glm-5-3-license-revenue-gate.md` carrying no
`reads-human` — saying so in its own prose. A type-keyed gate would ask that
reviewer for neither field, so the refusal would never fire on the exact case
the bead was filed about and the shape would recur unchanged. `mergeGate`
already receives the merged `subjects` (`review.mjs:611`, used at `:709`), so
the predicate is available where the gate stands: an approving verdict whose
subjects contain a `content/blog/*.md` path owes one of the two answers. The
fresh-answer demand on `post` **jobs** is untouched.

Option (a) —
re-ask above a measured prose-diff threshold — was refused because the threshold
is invented at the point of use and a reviewer on either side of it is asked a
different question for no reason a later reader can reconstruct. Option (c) —
accept and document — was refused because `declaredBy` already reaches back
across superseding records, so accepting means accepting a mechanism that
actively returns an answer for bytes nobody checked, which is worse than the
gap the bead described.

**That refusal is about the mechanism's future, not about the 357 records
already on disk, and the delta now says so.** A record written before this
requirement could not have carried a carry-forward; `j-20260902-23` is one and
it is the **current** approving record for the glm post today. A requirement
read literally against it would turn `verify-launch` red on a corpus nobody may
now reproduce. So the reach-back is sanctioned in the delta — in the same words
the live requirement already uses for records that predate `reviewed:` — and
scoped to exactly those records: a record written after this requirement is
refused at merge rather than joining that state. Without that sentence the
implementer's only way to keep the check green is the unstated `declaredBy`
fallback at `verify-launch.mjs:632-637`, which the spec would nowhere sanction —
a mechanism outliving the reasoning for it, which is the defect this whole
change is about.

The refusals are mechanical and the pattern is the existing one: the anchor must
name a record that approves this piece and carries a non-empty `reads-human`,
and the carry-forward's own statement is held to the same non-empty,
non-duplicate rule `would-cite` and `reads-human` already carry. No step asks a
person anything. A reviewer that carries a verdict forward across a genuine
rewrite has committed a `spec-violation` — a named rejection reason, judged by
the next model-run review — and the delta says so rather than pretending the
mechanism catches it.

**For the body-less entries: extend the binding, not the obligation.** The
reviewable set becomes every content file a record can join. That is one line's
worth of behaviour and it is the line `corpus.claim` already occupies. The
obligation to *have* a record is untouched: `verify-launch`'s required-record
list keeps its own prose bar, and a body-less piece reporting `missing` fails
nothing — which matters, because on today's corpus this is not a clean slate.
Simulated by running `lib/reviews.mjs`'s own `reviewJoin` over the extended
set: **recorded 58, mismatched 6, unbound 129, missing 445 — total 638.**
Thirteen body-less entries already join a record rather than reporting
`missing` (nine of them `recorded`, four `unbound`), and `mismatched` stays
exactly **6**, unchanged by the extension — the landing-safety measurement
this change owes before extending a set that feeds a failing check, and which
it did not make before re-measurement. What changes going forward is that a
fact-only edit to a stub that *does* carry a record becomes `mismatched`,
which fails the launch check by the rule already written.

## What is out of scope

- **The git-history sweep for un-gated `main` edits.** The bead names
  `data/proposals/un-gated-main-edits-bind-wholesale.md` as the adjacent case
  for prose. It stays a proposal. This change gives a body-less entry a place in
  the four-state report; it does not go back through history to find edits that
  landed before any record existed, and it does not claim to.
- **Requiring a review record for body-less entries.** 458 pieces with no record
  is a corpus-wide backfill decision with a real inference cost, and nothing in
  either bead asks for it. The delta states the boundary explicitly so an
  implementer does not read the extended binding as an extended obligation and
  turn the launch check red.
- **Demanding a *fresh* voice verdict of non-`post` types.** `READS_HUMAN_TYPES`
  stays `['post']` and no reviewer of a `repair`, a `revision` or any other type
  is ever asked to write a `reads-human` of its own — that is the demand the
  requirement scopes to the blog's bar, and it is not widened here. What such a
  reviewer **is** asked, and only when its diff lands on a post, is the other
  branch: name the record the post's voice verdict already lives in and say why
  this diff did not move it. That is not the voice question; it is answerable
  from the diff the repair reviewer is already reading, and it is the whole
  point of the carry-forward, since the bead's own instance is a `repair`.
- **The `reads-human` duplicate sweep's own scope.** It already reads every
  distinct value across every record, not just the post ones, because the merge
  gate does. Unchanged.
- **Anything about `would-cite`.** It is bound to no bytes either, and that is a
  different question with a different answer — a `would-cite` describes who
  would link the piece, which survives a licence correction in a way a voice
  judgment does not. Not filed here; named so the omission is not read as an
  oversight.

## The beads this serves

- `addictedtoai-37rb` — a post's voice verdict speaks for the bytes its post
  reviewer read, not the bytes a later repair left.
- `addictedtoai-kpgn` — no review mechanism exists for a fact-only edit to a
  body-less (stub) entry, at any layer.
