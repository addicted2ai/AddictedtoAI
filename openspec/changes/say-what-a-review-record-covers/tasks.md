# Tasks

Drafted 2026-09-06 (local) on branch `impl/spec-review`. Nothing here is
implemented; every box is open. Six normative sentences enter the spec and each
one is named below by the task that builds it and the task that measures it.

The parser, the merge gate, the reviewer's brief and the launch check are four
separate surfaces and all four are load-bearing. A field the parser reads that
the brief never mentions is a field no reviewer writes; a refusal the gate makes
that no test attempts is a refusal that has never run.

## The carry-forward field, and the parser that reads it

- [ ] 1. `loop/lib/verdict.mjs`: parse a `reads-human-from` block into
      `readsHumanFrom: { record, why }` — the name of the record it stands on
      and the reviewer's own-words statement. Parsed independently of
      `readsHuman`, `wouldCite` and `carry:`, the way `parseVerdict` already
      reads the verdict and `carry:` independently, so a malformed
      carry-forward can never alter the verdict value itself. A record carrying
      neither `reads-human` nor `reads-human-from` parses exactly as it does
      today — every one of the 358 records in `data/reviews/` is such a record
      and none of them may start parsing differently.
- [ ] 2. `loop/lib/verdict.mjs` + `loop/lib/review.mjs`
      (`writeVerdictRecord`): write `reads-human-from` only when given, on the
      same terms as `readsHuman` at `review.mjs:947-961` — an empty value
      produces **no key**, never an empty one, because absent and empty are
      different findings and the gate below distinguishes them.

## The gate, which is where sentences N1–N3 become mechanisms

- [ ] 3. **N1** — `loop/lib/review.mjs`, the merge gate beside the existing
      `reads-human-empty` branch (`review.mjs:682-706`): an `approve` on a type
      in `READS_HUMAN_TYPES` that carries neither a non-empty `reads-human` nor
      a `reads-human-from` is refused. The existing `reads-human-empty` refusal
      is not deleted and not renamed — it becomes the case where both are
      absent, and its message gains the second way to satisfy it.
- [ ] 4. **N2** — the anchor refusal, new code `reads-human-from-unanchored`:
      the named record must exist in `data/reviews/`, must name this same piece
      (through the join in `lib/reviews.mjs`, not a string compare on the
      subject line), must record `approve`, and must itself carry a non-empty
      `reads-human`. Any of the four failing is the refusal, and its message
      names which. Chasing an anchor whose own answer is a carry-forward is a
      chain: follow it, and refuse a chain that reaches no answering record or
      that revisits a record it has already seen.
- [ ] 5. **N3** — the statement refusal, new code
      `reads-human-from-duplicate`: the `why` half is held to the same two
      rules `reads-human` carries — non-empty after trimming, and not exactly
      identical after trimming to the `why` of any other record. Reuse
      `normalizeField` and the `existingFieldValues` sweep at
      `review.mjs:568-600`; do not write a second normaliser. A reviewer that
      pastes the same "the diff did not move the voice" sentence into every
      repair is the exact failure the duplicate rule exists to catch, and it is
      the failure most likely here.
- [ ] 6. Both new codes join `REISSUE_CODES` (`review.mjs:117-123`). They are
      the reviewer's clerical failure in a field about the record, not a defect
      in the work: sending the **author** into a revision pass to fix a
      reviewer's anchor is the exact waste that list was built for
      (`review.mjs:99-115`).

## The brief and the checklist, because a reviewer is told or it cannot know

- [ ] 7. `loop/lib/review.mjs`, the reviewer brief template (`review.mjs:433`
      and the record skeleton at `:523`): document both branches — answer the
      voice question, or name the record you stand on and say why this diff did
      not move the voice — and say plainly that a diff which rewrites the post's
      prose is not a carry-forward. A mechanism a reviewer is not told about is
      a mechanism that does not run, which is the rule the `carry:` requirement
      already states in those words.
- [ ] 8. `loop/lib/review.mjs`, `CHECKLISTS.post` and the `repair` checklist:
      the reviewer of a repair to an already-approved post is asked which branch
      it is taking. The named rejection reason when a reviewer carries a verdict
      forward across a genuine rewrite is `spec-violation` against this
      requirement — a model-run review step with a named reason, never a person.

## The launch check, sentence N4

- [ ] 9. **N4** — `scripts/verify-launch.mjs:613-661`: the voice check follows
      the carry-forward. Today it accepts any approving record naming the piece
      that carries a non-empty `reads-human` (`hit.declaredBy`), which is how
      the verdict stopped being *lost*; it must now accept the **current**
      record when that record carries a valid carry-forward chain reaching such
      a record, and report the piece exactly as it reports a bare missing
      `reads-human` when the chain reaches none. Export the chain resolver so it
      is testable without running a build — `hasProseBody` is already exported
      from this file for that reason.

## The reviewable set, sentences N5–N6

- [ ] 10. **N5** — `lib/reviews.mjs:298-307`, `reviewablePieces`: entries enter
      the set whether or not they have a prose body. **Order is part of the
      join** (`reviews.mjs:270-297`): a record is claimed by the first piece
      that names it, so the body-less entries must not be inserted anywhere that
      moves which piece claims an ambiguously-named record. Append them, for the
      reason `corpus.claim` is appended and stated in that comment.
- [ ] 11. **N6** — `scripts/verify-launch.mjs:473-478`, the `pieces` list the
      check requires a record for, keeps `hasProseBody` and does not change.
      `entryReviewGate` (`reviews.mjs:555-562`) keeps its `hasBody` skip, so no
      body-less entry's indexability changes. The only thing that changes is the
      four-state report, and `missing` there fails nothing already
      (`mismatchProblems` reads `report.mismatched` alone).

## The tests that make each sentence a mechanism

- [ ] 12. **N1–N3**, `loop/tests/review.test.mjs` and
      `loop/tests/review-blog-bar.test.mjs`, one refusal per test, each asserting
      the refusal **code** and that the message names the offending record or
      field: post `approve` with neither field; carry-forward naming a record
      that does not exist; naming one that names a different piece; naming one
      that records `revise`; naming one carrying no `reads-human`; a chain that
      loops; a `why` that is blank; a `why` identical after trimming to another
      record's.
- [ ] 13. The controls, without which task 12 proves nothing: a post `approve`
      with a normal non-empty `reads-human` and no carry-forward merges exactly
      as today; a valid carry-forward merges; a non-`post` job type is asked for
      neither field; and — the control that pins the parser — every record in
      `data/reviews/` parses to the same verdict, reasons, `would-cite` and
      `reads-human` values before and after task 1, compared field by field.
- [ ] 14. **N4**, `scripts/verify-launch-voice-chain.test.mjs` (new): a post
      whose current record carries only a valid carry-forward passes the voice
      check; one whose chain reaches no answering record fails it with the same
      message shape as a bare missing `reads-human`; and the existing
      `declaredBy` behaviour still passes for a post reviewed before this change
      existed.
- [ ] 15. **N5–N6**, `lib/reviews.test.mjs`: a fixture corpus with a body-less
      entry that carries a bound record and has since had a fact value changed
      reports **mismatched**, and `mismatchProblems` names it. A body-less entry
      with no record reports **missing** and produces no problem string. The
      counts move by exactly the number of body-less entries added, so the
      report's `total` is asserted, not just its `mismatched` list.
- [ ] 16. **N6's boundary, on the real corpus and not a fixture**: assert that
      `verify-launch`'s required-record piece list is unchanged in length by
      task 10 — the same 95 entry bodies it holds today — so an implementer who
      wires the extended set into the wrong list gets a red test rather than 458
      launch failures.
- [ ] 17. Mutation proof, each half separately and each restored afterwards
      with the file's hash compared before and after. Revert task 4's anchor
      check and confirm only the anchor tests fail; revert task 5's duplicate
      sweep and confirm only the duplicate test fails; revert task 9 and confirm
      only the launch-chain test fails; revert task 10's append and confirm the
      body-less mismatch test fails while the `total`-count control and every
      existing reviews test still pass. Four mutations failing four disjoint
      sets is the evidence these are four mechanisms and not one described four
      times.

## Gates

- [ ] 18. `openspec validate say-what-a-review-record-covers --type change
      --strict --no-interactive`, and `node scripts/check-spec-deltas.mjs
      --strict`. Run at drafting time.
- [ ] 19. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks of this change, recorded so they are not read as omissions

- The **git-history sweep** for edits that landed on `main` before any record
  existed stays `data/proposals/un-gated-main-edits-bind-wholesale.md`.
- **Backfilling records for the 458 body-less entries** is not proposed and not
  implied. Task 11 exists to keep it from happening by accident.
- **Binding `would-cite` to bytes** is a separate question and is not touched.
