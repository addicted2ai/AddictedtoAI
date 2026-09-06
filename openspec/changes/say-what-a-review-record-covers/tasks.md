# Tasks

Drafted 2026-09-06 (local) on branch `impl/spec-review`. Nothing here is
implemented; every box is open. Seven normative sentences enter the spec and
each one is named below by the task that builds it and the task that measures
it.

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
      `reads-human-empty` branch (`review.mjs:682-706`). **The choose-one-of-two
      gate keys on `subjects`, not on `type`.** `mergeGate` already receives the
      merged subject list (`review.mjs:611`, the same list it compares against
      `reviewed:` at `:709`, built by `joinableSubjects` in `run.mjs:553`): an
      `approve` whose `subjects` contain a `content/blog/*.md` path and that
      carries neither a non-empty `reads-human` nor a `reads-human-from` is
      refused. Keying on the job type instead is what leaves the bead's own
      instance uncaught: `needsReadsHuman` reads the type (`review.mjs:682`),
      `READS_HUMAN_TYPES` is `['post']` (`:80`), and `j-20260902-23` is type
      `repair` (`data/ledger.jsonl:68`) whose record approves
      `content/blog/glm-5-3-license-revenue-gate.md` with no `reads-human` — a
      type-keyed gate asks that reviewer for neither field, so the refusal never
      fires on the exact shape this change exists to stop. The existing
      `reads-human-empty` refusal is not deleted and not renamed: it keeps its
      `needsReadsHuman(type)` guard and keeps demanding a **fresh**
      `reads-human` of a `post` job, and the new branch is the second way for
      every other job that lands on a post. A call with no `subjects` measured
      is not gated here, exactly as the `reviewed:`/`subject:` equality check at
      `:709` is not.
- [ ] 4. **N2** — the anchor refusal, new code `reads-human-from-unanchored`,
      applied **whenever a `reads-human-from` is present** and not only inside
      task 3's branch, so the three refusals are three separable mechanisms and
      a record cannot dodge the anchor check by carrying the field on a job the
      branch does not reach:
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

## The launch check, sentences N4 and N7

- [ ] 9. **N4** — `scripts/verify-launch.mjs:613-661`: the voice check follows
      the carry-forward. It must accept the **current** record when that record
      carries a valid carry-forward chain reaching an approving record with a
      non-empty `reads-human`, and report the piece exactly as it reports a bare
      missing `reads-human` when the chain reaches none. Export the chain
      resolver so it is testable without running a build — `hasProseBody` is
      already exported from this file for that reason.
- [ ] 10. **N7** — the same function, the `hit.declaredBy` reach-back at
      `verify-launch.mjs:632-637`, which today accepts any approving record
      naming the piece that carries a non-empty `reads-human` and is how the
      verdict stopped being *lost*. It **stays**, and it stops being unstated:
      N7 sanctions it for records that predate this requirement and forbids the
      state to any record written after. Measured 2026-09-06, this is not
      hypothetical — `data/reviews/j-20260902-23.md` is the **current**
      approving record for `content/blog/glm-5-3-license-revenue-gate.md`,
      carries neither field, and is reached only by that fallback; N4 read
      without N7 turns `verify-launch` red on today's corpus on the day it
      lands. Gate the reach-back on the record being pre-existing rather than on
      nothing: the merge (task 3) refuses any newly-written record in that
      shape, so the two ends cannot drift — and the boundary the check reads
      SHALL be derivable from the record itself (its own absence of both fields
      plus a merge that now refuses to write one), never a hard-coded date.

## The reviewable set, sentences N5–N6

- [ ] 11. **N5** — `lib/reviews.mjs:298-307`, `reviewablePieces`: entries enter
      the set whether or not they have a prose body. **Order is part of the
      join** (`reviews.mjs:270-297`): a record is claimed by the first piece
      that names it, so the body-less entries must not be inserted anywhere that
      moves which piece claims an ambiguously-named record. Append them, for the
      reason `corpus.claim` is appended and stated in that comment. **What does
      NOT enter the set is `corpus.tool`** — the listings under
      `content/directory/tools/` (`lib/corpus.mjs:314`), which the set has
      excluded since it was written and whose comment says why ("data rows, not
      prose"); 35 of them, loaded and counted 2026-09-06, not counted from the
      directory listing. The requirement says "every wiki entry", not "every content file
      a record can be joined to", precisely because `joinableSubjects`
      (`review.mjs:840-851`) admits every `content/**.md` and the two sets are
      not the same set. The filter changes from `d.hasBody` to nothing, on
      `corpus.entry` alone.
- [ ] 12. **N6** — `scripts/verify-launch.mjs:473-478`, the `pieces` list the
      check requires a record for, keeps `hasProseBody` and does not change.
      `entryReviewGate` (`reviews.mjs:555-562`) keeps its `hasBody` skip, so no
      body-less entry's indexability changes. The only thing that changes is the
      four-state report, and `missing` there fails nothing already
      (`mismatchProblems` reads `report.mismatched` alone).

## The tests that make each sentence a mechanism

- [ ] 13. **N1–N3**, `loop/tests/review.test.mjs` and
      `loop/tests/review-blog-bar.test.mjs`, one refusal per test, each asserting
      the refusal **code** and that the message names the offending record or
      field: post `approve` with neither field; **a `repair` job whose
      `subjects` include a `content/blog/` post, approving with neither field —
      the bead's own shape, and the one case a type-keyed gate lets through**;
      carry-forward naming a record that does not exist; naming one that names a
      different piece; naming one that records `revise`; naming one carrying no
      `reads-human`; a chain that loops; a `why` that is blank; a `why`
      identical after trimming to another record's.
- [ ] 14. The controls, without which task 13 proves nothing: a post `approve`
      with a normal non-empty `reads-human` and no carry-forward merges exactly
      as today; a valid carry-forward on a `repair` that touches a post merges;
      **a `repair` whose `subjects` contain no `content/blog/` path is asked for
      neither field and merges with both absent** — the boundary of the new
      branch, and the assertion that the gate keys on subjects rather than on
      "not a post job"; and — the control that pins the parser — every record in
      `data/reviews/` parses to the same verdict, reasons, `would-cite` and
      `reads-human` values before and after task 1, compared field by field.
- [ ] 15. **N4 and N7**, `scripts/verify-launch-voice-chain.test.mjs` (new): a
      post whose current record carries only a valid carry-forward passes the
      voice check; one whose chain reaches no answering record fails it with the
      same message shape as a bare missing `reads-human`; **a post whose current
      approving record carries neither field and whose earlier approving record
      carries a `reads-human` passes** (N7 — the state
      `data/reviews/j-20260902-23.md` is in on this tree today, asserted against
      that record and not only against a fixture); and a post whose ONLY
      approving record carries neither field fails, so the reach-back is a
      reach-back and not an unconditional pass.
- [ ] 16. **N5–N6**, `lib/reviews.test.mjs`: a fixture corpus with a body-less
      entry that carries a bound record and has since had a fact value changed
      reports **mismatched**, and `mismatchProblems` names it. A body-less entry
      with no record reports **missing** and produces no problem string. The
      counts move by exactly the number of body-less entries added, so the
      report's `total` is asserted, not just its `mismatched` list.
- [ ] 17. **N6's boundary, on the real corpus and not a fixture**: assert that
      `verify-launch`'s required-record piece list is unchanged in length by
      task 11 — the same 95 entry bodies it holds today — so an implementer who
      wires the extended set into the wrong list gets a red test rather than 458
      launch failures. Assert `reviewablePieces` grows by exactly 458 and that
      **no `content/directory/tools/` path is in it**, so the "every wiki entry"
      boundary is measured rather than assumed.
- [ ] 18. Mutation proof, each mutation applied alone and restored afterwards
      with the file's hash compared before and after:
      **(a)** revert task 3's subjects-keyed branch — task 13's
      **repair-on-post neither-field** refusal must fail, and it must be the
      only failure: task 13's **post**-type neither-field test still passes
      (the surviving `reads-human-empty` branch catches that one), and task 14's
      controls still pass (nothing gates a repair once the branch is gone). That
      asymmetry is the whole evidence for keying the obligation on the merged
      subjects — a gate keyed on the job type would leave every other test
      green while the
      bead's own instance walked through, so this single test is the only
      witness that the obligation follows the subjects.
      **(b)** revert task 4's anchor check — only the anchor tests fail;
      **(c)** revert task 5's duplicate sweep — only the duplicate test fails;
      **(d)** revert task 9 — only the launch-chain test fails;
      **(e)** revert task 10's pre-existing-record gate so the reach-back is
      unconditional — only task 15's "ONLY approving record carries neither
      field" case fails;
      **(f)** revert task 11's append — the body-less mismatch test fails while
      the `total`-count control and every existing reviews test still pass.
      Six mutations failing six disjoint sets is the evidence these are six
      mechanisms and not one described six times.

## Gates

- [ ] 19. `openspec validate say-what-a-review-record-covers --type change
      --strict --no-interactive`, and `node scripts/check-spec-deltas.mjs
      --strict`. Run at drafting time.
- [ ] 20. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks of this change, recorded so they are not read as omissions

- The **git-history sweep** for edits that landed on `main` before any record
  existed stays `data/proposals/un-gated-main-edits-bind-wholesale.md`.
- **Backfilling records for the 458 body-less entries** is not proposed and not
  implied. Task 12 exists to keep it from happening by accident.
- **Binding `would-cite` to bytes** is a separate question and is not touched.
