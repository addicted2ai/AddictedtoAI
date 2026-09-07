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

- [x] 1. **N1's shape half** — `loop/lib/verdict.mjs`: parse a
      `reads-human-from` block into `readsHumanFrom: [{ subject, record, why }]`
      — a **list**, one entry per post answered for, each naming the post it
      answers for, the record it stands on and the reviewer's own-words
      statement. Shaped like `carry:` (`verdict.mjs:64-90`) and parsed by the
      same rules, for the same reason `carry:` is a list: one job's merged
      subjects may hold more than one blog post — 16 `content/blog/` posts exist
      today and a single `verify` job could land on all of them (see the
      proposal's re-measurement) — and one record-wide `{record, why}` could
      only ever answer for one of them. A single mapping given where a list is
      expected is read as a one-entry list, exactly as `parseCarry` does at
      `verdict.mjs:67`. An entry missing any of the three fields is **dropped
      with a warning**, again as `parseCarry` does, and is not an accepted
      answer: the post it meant to answer for is then unanswered and task 3's
      refusal fires on it, which is the fail-closed direction. Parsed
      independently of
      `readsHuman`, `wouldCite` and `carry:`, the way `parseVerdict` already
      reads the verdict and `carry:` independently, so a malformed
      carry-forward can never alter the verdict value itself. A record carrying
      neither `reads-human` nor `reads-human-from` parses exactly as it does
      today — every one of the 357 records in `data/reviews/` (358 `.md` files
      less the `README.md` both loaders skip, `lib/reviews.mjs:143` and
      `loop/lib/review.mjs:579`; re-counted 2026-09-06) is such a record and
      none of them may start parsing differently.
- [x] 2. `loop/lib/verdict.mjs` + `loop/lib/review.mjs`
      (`writeVerdictRecord`): write `reads-human-from` only when given, on the
      same terms as `readsHuman` at `review.mjs:947-961` — an empty list
      produces **no key**, never an empty one, because absent and empty are
      different findings and the gate below distinguishes them. Written as a
      YAML list of mappings, each with `subject`, `record` and `why`, so a
      record round-trips through the parser in task 1 unchanged.

## The gate, which is where sentences N1–N3 become mechanisms

- [x] 3. **N1** — `loop/lib/review.mjs`, the merge gate beside the existing
      `reads-human-empty` branch (`review.mjs:682-706`). **The choose-one-of-two
      gate keys on `subjects`, not on `type`.** `mergeGate` already receives the
      merged subject list (`review.mjs:611`, the same list it compares against
      `reviewed:` at `:709`, built by `joinableSubjects` in `run.mjs:553`).
      **The refusal resolves per post, not per record.** Take every
      `content/blog/*.md` path in `subjects`; a post is answered if the record
      carries a non-empty `reads-human` **or** a `reads-human-from` entry whose
      `subject` is that post; an `approve` leaving any of them unanswered is
      refused, and the message names the unanswered posts. Refusing on the
      record as a whole — one entry anywhere satisfies it — is the hole this
      wording closes: a job merging two posts would then approve with an entry
      for post A while post B stayed bound and unanswered, and task 9's
      per-post launch check would report B as voice-missing, which is the
      two-ends drift this change exists to stop. Also refuse an entry whose
      `subject` is not among the merged subjects, in task 4's code, so an entry
      cannot answer for a post this job did not touch. Keying on the job type
      instead is what leaves the bead's own
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
      **Correction (review round, 2026-09-07): this task's text named only the
      non-empty half of the fresh answer.** The delta itself (specs/review,
      "answer the question afresh, in a non-empty, non-duplicated
      `reads-human`, as above") asks for both. A fresh, non-empty
      `reads-human` on a job whose subjects include a post but whose type does
      not itself demand the field (`!needsReadsHuman(type)`) is now swept
      through `existingFieldValues` the same way the `post`-keyed branch
      already sweeps it, and refused as `reads-human-duplicate` on a
      collision — reusing the code the type-keyed branch already uses, so
      nothing new joins `REISSUE_CODES`.
- [x] 4. **N2** — the anchor refusal, new code `reads-human-from-unanchored`,
      applied **to every entry**, whenever a `reads-human-from` is present and
      not only inside task 3's branch, so the three refusals are three separable
      mechanisms and a record cannot dodge the anchor check by carrying the
      field on a job the branch does not reach. Per entry: its `subject` must be
      among the merged subjects, and the named record must exist in
      `data/reviews/`, must name **that entry's own subject** (through the join
      in `lib/reviews.mjs`, not a string compare on the
      subject line), must record `approve`, and must itself carry a non-empty
      `reads-human`. Any of the five failing is the refusal, and its message
      names which entry and which leg — "this same piece" is resolved from the
      entry, never from "the record's post", because a record may now carry
      entries for several posts and a message naming only the record would not
      say which one failed. **A carry-forward is one hop and never a chain: the anchor
      must itself answer.** An anchor whose own record carries only a
      `reads-human-from` is refused by the fifth leg — it "carries no non-empty
      `reads-human` of its own" — and the message says so, so the reviewer is
      sent to name the record that actually answered. Do not follow the anchor's
      own carry-forward; the spec's refusal is the whole rule, and a resolver
      that walked a chain here would accept records the merge refuses.
- [x] 5. **N3** — the statement refusal, new code
      `reads-human-from-duplicate`: each entry's `why` is held to the same two
      rules `reads-human` carries — non-empty after trimming, and not exactly
      identical after trimming to the `why` of any entry in any **other**
      record. **Two entries in the same record may share a `why`** and that is
      not a refusal: one job making the same trivial correction to two posts has
      one honest sentence to write about both, and forcing variation there is
      the manufactured-judgment failure the rule is meant to prevent, not catch.
      Reuse
      `normalizeField` and the `existingFieldValues` sweep at
      `review.mjs:568-600`; do not write a second normaliser. A reviewer that
      pastes the same "the diff did not move the voice" sentence into every
      repair is the exact failure the duplicate rule exists to catch, and it is
      the failure most likely here.
- [x] 6. Both new codes join `REISSUE_CODES` (`review.mjs:117-123`). They are
      the reviewer's clerical failure in a field about the record, not a defect
      in the work: sending the **author** into a revision pass to fix a
      reviewer's anchor is the exact waste that list was built for
      (`review.mjs:99-115`).

## The brief and the checklist, because a reviewer is told or it cannot know

- [x] 7. `loop/lib/review.mjs`, the reviewer brief template (`review.mjs:433`
      and the record skeleton at `:523`): document both branches — answer the
      voice question, or name the record you stand on and say why this diff did
      not move the voice — and say plainly that a diff which rewrites the post's
      prose is not a carry-forward. A mechanism a reviewer is not told about is
      a mechanism that does not run, which is the rule the `carry:` requirement
      already states in those words.
- [x] 8. `loop/lib/review.mjs`, `CHECKLISTS.post` and — the list a `repair` job
      actually gets — `CHECKLISTS.directory` (`review.mjs:172`), reached through
      `CHECKLIST_FOR_TYPE.repair` (`review.mjs:187`); there is no list named
      `repair`, and editing one that does not exist is the way this task gets
      done wrong. In both:
      the reviewer of a repair to an already-approved post is asked which branch
      it is taking. The named rejection reason when a reviewer carries a verdict
      forward across a genuine rewrite is `spec-violation` against this
      requirement — a model-run review step with a named reason, never a person.

## The launch check, sentences N4 and N7

- [x] 9. **N4** — `scripts/verify-launch.mjs:613-661`: the voice check follows
      the carry-forward, **resolving per post**. This loop already runs over
      pieces, so for the post in hand it must select the `reads-human-from`
      entry whose `subject` is **that post** and ignore the record's other
      entries entirely; a record carrying an entry for a different post answers
      nothing here. It must accept the **current** record when that record
      carries a valid entry for this post naming an approving record for this
      piece with a non-empty `reads-human` of its own, and report the piece
      exactly as it reports a bare missing `reads-human` when there is no such
      entry or the record it names is not one. Selecting the record's first
      entry regardless of its subject is the mistake this task exists to
      prevent, and task 13's two-post fixture is what catches it.
      **One hop, resolved by the same rule the merge applies in task 4** — an
      anchor that itself carries only a `reads-human-from` is not an answering
      record here either, because a check that followed a chain would pass a
      hand-written record the merge refuses, which is the two-ends drift this
      change exists to stop. Export the carry-forward resolver so it is testable
      without running a build — `hasProseBody` is already exported from this
      file for that reason.
- [x] 10. **N7** — the same function, the `hit.declaredBy` reach-back at
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

- [x] 11. **N5** — `lib/reviews.mjs:298-307`, `reviewablePieces`: entries enter
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
      not the same set. `corpus.entry.filter((d) => d.hasBody)` **stays exactly
      where it is** — first in the list, unmoved — and
      `...corpus.entry.filter((d) => !d.hasBody)` is **appended after
      `corpus.claim`**, the same position `corpus.claim` itself occupies and for
      the same reason: inserting the body-less entries anywhere earlier would
      move which piece claims an ambiguously-named record for content nobody
      touched.
- [x] 12. **N6** — `scripts/verify-launch.mjs:473-478`, the `pieces` list the
      check requires a record for, keeps `hasProseBody` and does not change.
      `entryReviewGate` (`reviews.mjs:555-562`) keeps its `hasBody` skip, so no
      body-less entry's indexability changes. The only thing that changes is the
      four-state report, and `missing` there fails nothing already
      (`mismatchProblems` reads `report.mismatched` alone).

## The tests that make each sentence a mechanism

- [x] 13. **N1–N3**, `loop/tests/review.test.mjs` and
      `loop/tests/review-blog-bar.test.mjs`, one refusal per test, each asserting
      the refusal **code** and that the message names the offending record or
      field: post `approve` with neither field; **a `repair` job whose
      `subjects` include a `content/blog/` post, approving with neither field —
      the bead's own shape, and the one case a type-keyed gate lets through**;
      carry-forward naming a record that does not exist; naming one that names a
      different piece; naming one that records `revise`; naming one carrying no
      `reads-human`; naming a record whose own answer is only a
      `reads-human-from`, refused as an anchor that carries no `reads-human` of
      its own; an entry whose `subject` is not among the merged subjects; a
      `why` that is blank; a `why` identical after trimming to
      another record's.
      **The two-post fixture, which is the per-post half of N1 and is asserted
      at both ends.** One job whose `subjects` hold two `content/blog/` posts,
      approving with a single valid `reads-human-from` entry for post A and no
      `reads-human`: the merge refuses, and the message names **post B**. Then
      the same record with an entry for each post merges. Then take that
      accepted two-entry record into the launch-check test of task 15 and assert
      that **both** posts resolve through their own entry and pass — the merge
      and the launch check agreeing post by post is the property the change
      exists for, and a per-record resolver passes the first half of this
      fixture while failing the second.
- [x] 14. The controls, without which task 13 proves nothing: a post `approve`
      with a normal non-empty `reads-human` and no carry-forward merges exactly
      as today; a valid carry-forward on a `repair` that touches a post merges;
      **a `repair` whose `subjects` contain no `content/blog/` path is asked for
      neither field and merges with both absent** — the boundary of the new
      branch, and the assertion that the gate keys on subjects rather than on
      "not a post job"; **a record carrying BOTH a fresh non-empty
      `reads-human` and a valid `reads-human-from` merges** — the requirement
      asks for one of the two answers, not for exactly one, so carrying both is
      not a refusal, and task 4's anchor check still runs on the carry-forward
      it carries (an invalid anchor is still refused even beside a valid fresh
      answer); **a two-entry record whose two entries carry the same `why`
      merges** — the within-record allowance in N3, and the boundary that keeps
      the duplicate rule from forcing invented variation on one job that made
      the same trivial fix to two posts; and — the control that pins the parser — every record in
      `data/reviews/` parses to the same verdict, reasons, `would-cite` and
      `reads-human` values before and after task 1, compared field by field.
- [x] 15. **N4 and N7**, `scripts/verify-launch-voice-carry.test.mjs` (new): a
      post whose current record carries only a valid carry-forward passes the
      voice check; one whose anchor is not an answering record — it does not
      exist, does not approve this piece, or carries only a `reads-human-from`
      of its own — fails it with the same message shape as a bare missing
      `reads-human`; **a post whose current approving record carries neither
      field and whose earlier approving record carries a `reads-human`
      passes** (N7); and a post whose ONLY approving record carries neither
      field fails, so the reach-back is a reach-back and not an unconditional
      pass.
      **Plus one assertion over the live corpus, written as an invariant and not
      as a named record.** For every post whose CURRENT approving record carries
      neither field, some approving record naming that post carries a non-empty
      `reads-human` — so the reach-back is what keeps `verify-launch` green on
      the corpus as it stands, measured rather than asserted from a fixture.
      Naming `data/reviews/j-20260902-23.md` in the assertion instead would rot
      the moment the next repair lands on the glm post and supersedes it, and a
      test that turns red for a reason unrelated to what it measures is the
      failure `lib/surfaces.test.mjs:320` avoids by loading the corpus and
      asserting invariants over it. That record is named in the proposal as the
      instance behind N7, which is where a date-stamped measurement belongs.
- [x] 16. **N5–N6**, `lib/reviews.test.mjs`: a fixture corpus with a body-less
      entry that carries a bound record and has since had a fact value changed
      reports **mismatched**, and `mismatchProblems` names it. A body-less entry
      with no record reports **missing** and produces no problem string. The
      counts move by exactly the number of body-less entries added, so the
      report's `total` is asserted, not just its `mismatched` list.
- [x] 17. **N6's boundary, on the real corpus and not a fixture**: assert that
      the entries in `verify-launch`'s required-record piece list are exactly
      `corpus.entry.filter(hasProseBody)` — computed in the same test from the
      same loaded corpus, with the `hasProseBody` that file already exports
      (`verify-launch.mjs:194`), which is a word-count threshold and **not**
      `corpus.entry`'s own `hasBody` flag, so the two lists must each be
      measured with their own predicate — and that no body-less entry is in it,
      so an implementer who wires the extended set into the wrong list gets a
      red test rather than one launch failure per body-less entry. Assert that
      `reviewablePieces` grows by
      exactly `corpus.entry.filter((d) => !d.hasBody).length`, computed the same
      way, and that **no `content/directory/tools/` path is in it**, so the
      "every wiki entry" boundary is measured rather than assumed.
      **Both assertions are computed, never literal.** The corpus was 95 bodied
      and 458 body-less on 2026-09-06 and those numbers are recorded in the
      proposal; a literal in the assertion turns red on the next entry the
      Pulse adds, which is the failure CLAUDE.md's test convention names — "the
      fixture corpora pin the clock so a passing test stays passing tomorrow" —
      and which the repository's own real-corpus tests avoid
      (`lib/surfaces.test.mjs:320, :409` load the corpus and assert invariants,
      never a count).
- [x] 18. Mutation proof, each mutation applied alone and restored afterwards
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
      **(d)** revert task 9 — only the launch carry-forward test fails;
      **(e)** make the reach-back an **unconditional pass** — a post whose
      current record carries neither field passes the voice check whether or not
      any earlier record answered — and only task 15's "ONLY approving record
      carries neither field" case fails. Written this way deliberately: merely
      dropping task 10's pre-existing-record condition leaves that case still
      finding no answering record and still failing, so the test would not bite
      and the mutation would prove nothing. The other half of N7 — that a record
      written **after** this requirement cannot enter that state — is mutation
      (a)'s to prove, since the merge is what refuses it;
      **(f)** revert task 11's append — the body-less mismatch test fails while
      the `total`-count control and every existing reviews test still pass.
      Six mutations failing six disjoint sets is the evidence these are six
      mechanisms and not one described six times.

## Gates

- [x] 19. `openspec validate say-what-a-review-record-covers --type change
      --strict --no-interactive`, and `node scripts/check-spec-deltas.mjs
      --strict`. Run at drafting time.
- [x] 20. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks of this change, recorded so they are not read as omissions

- The **git-history sweep** for edits that landed on `main` before any record
  existed stays `data/proposals/un-gated-main-edits-bind-wholesale.md`.
- **Backfilling records for the 445 body-less entries that report `missing`
  today** (of 458 total; 13 already join a record — 9 `recorded`, 4 `unbound`
  — and `mismatched` stays exactly 6 under the extension) is not proposed and
  not implied. Task 12 exists to keep it from happening by accident.
- **Binding `would-cite` to bytes** is a separate question and is not touched.
