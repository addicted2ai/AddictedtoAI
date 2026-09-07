# Tasks

Twelve normative bullets are added across the two capabilities' worth of
requirement text in `specs/pulse` — six in the added requirement, six in the
modified corroboration requirement (14 SHALL/MUST clauses when counted clause by
clause, since several bullets state a rule and its exclusion together). The
modification to `The work queue is
derived, never accumulated` adds no new normative sentence: it extends the
enumeration inside the existing `SHALL recompute … from current state` so the
list stays a true statement of what the queue produces, and task 4's assertion on
the reason vocabulary is what keeps it true.

Each normative sentence has an implementing task and a testing task, and every
testing task names the mutation that proves it measures something.

## The review-mismatch producer

- [ ] 1. `pulse/lib/review-state.mjs` (new): an async exported function that
      loads the **build** corpus with `loadCorpus({ contentRoot, diags })` from
      `lib/corpus.mjs` — the same loader `scripts/verify-launch.mjs:823` and
      `lib/build-content.mjs:125` hand to `reviewJoin`, and the only shape
      `reviewablePieces` can read (`lib/reviews.mjs:298–307`; the Pulse's own
      `readCorpus` returns `{ entries, tutorials, listings, prose, unreadable }`
      and cannot be substituted) — and returns the pieces whose review state is
      `mismatched`, each with the record that binds it and that record's date. It
      SHALL obtain the state by calling `reviewJoin` from `lib/reviews.mjs` and
      SHALL contain no hashing, no record-to-piece resolution and no
      re-implementation of `reviewedSurface`. Implements: *reading that state
      from the single piece-to-record join … SHALL NOT compute a second
      resolution … SHALL NOT compute a second reviewed hash*. See design D3 for
      why loading the gate's own corpus is what makes this one join rather than
      two.
- [ ] 2. `pulse/run.mjs` and `pulse/lib/rederive.mjs`: `await` it beside
      `corroborationFindings` (`run.mjs:270`, `rederive.mjs:73`) — both call
      sites are already in async context — and pass the result into
      `computeQueue` as one more named option. `computeQueue` stays a synchronous
      function of its arguments so `pulse/tests/queue.test.mjs` can still run it
      on fixtures with no repository behind it, and so `rederive` reproduces the
      derived tree byte-identically. See design D3.
- [ ] 3. `pulse/lib/queue.mjs`: produce one item per mismatched piece — type
      `verify`, a new reason on the closed reason vocabulary, subject the piece,
      detail naming the piece, the binding record and its date. Implements: *the
      item SHALL propose a `verify` job … and SHALL name the piece, the record
      that binds it, and that record's date*.
- [ ] 4. `pulse/lib/queue.mjs`: rank it in `RANKS` at **69** — above
      `corroboration` (68), below `tutorial-demoted` (70) and `reference-drift`
      (72), because both of those are already visibly wrong on a rendered page
      and a stale approval is not, and below every dead-resource finding
      (`listing-could-not-verify` 75 and above). The rank is pinned rather than
      left to a band because 69–74 is not empty: `tutorial-demoted` and
      `reference-drift` sit in it, and the corroboration comment already states
      that it "sits under" them for exactly that reason, so a free choice of 73
      would silently invert an ordering the table declares. Carry that reason
      into the comment in the table's own idiom. Implements: *the item SHALL
      rank above the corroboration disagreement, below every finding that reports
      a page already rendering something wrong … and below every finding that
      reports a dead or unreachable resource*.
- [ ] 5. `pulse/lib/review-state.mjs`: return **only** `mismatched`. `unbound`,
      `missing` and `recorded` are dropped at the source, not filtered
      downstream, so no later edit can widen the producer by accident.
      Implements: *the states `unbound` and `missing` SHALL NOT produce this
      item*.
- [ ] 6. `pulse/tests/review-state.test.mjs` (new): a fixture corpus with one
      piece whose record hash matches, one whose record hash differs, one bound
      by no record, and one with a record carrying no hash for it — exactly one
      result, the mismatched piece, carrying the record name and date. Mutation:
      widen the filter to include `unbound` and confirm this test fails on the
      count; restore and verify the file byte-identical by hash. Tests tasks 1
      and 5.
- [ ] 7. `pulse/tests/queue.test.mjs`: the item is produced with type `verify`
      and the new reason; **its detail names the piece, the binding record's file
      name and that record's date**, asserted on the three values the fixture put
      there rather than on the presence of a field; and it sorts above a
      corroboration item and below both a `tutorial-demoted` item and a
      `listing-could-not-verify` item in the same queue — asserted on the
      produced order, not on the constant. The `tutorial-demoted` assertion is
      the one that catches a rank chosen anywhere in 69–74. Mutations:
      move the rank below `corroboration` and confirm only the ordering assertion
      fails; drop the record's date from the detail and confirm only the detail
      assertion fails. Tests tasks 3 and 4.
- [ ] 8. `pulse/tests/queue.test.mjs`: retirement. Recompute over a fixture where
      the piece has been re-reviewed and the newest record's hash matches — the
      item is absent, and no file anywhere records that it was done. Then the
      control that makes it mean something: recompute twice over the **unfixed**
      fixture and assert the two queues are identical, so the item neither
      duplicates nor accumulates. Mutation: introduce a durable store keyed by
      the piece and confirm the "no file records it" assertion fails while the
      retirement assertion still passes — the two are independent properties.
      Tests: *the item SHALL retire by recomputation alone … and no durable
      record of its own*.
- [ ] 9. `pulse/tests/review-state.test.mjs`: the zero-model and read-only
      assertions — the function performs no write anywhere under the fixture
      root, and the module imports nothing that can invoke a model. Tests:
      *nothing in this requirement SHALL invoke a model or edit a piece of
      content*.
- [ ] 10. `pulse/tests/queue.test.mjs`: the gate-and-queue agreement. Over one
      fixture, assert that the set of paths `reviewStateReport(...).mismatched`
      names is exactly the set of subjects the new queue reason carries.
      Mutation: change the producer to compute its own hash with a different
      surface filter and confirm this test fails while tasks 6 and 7 still pass —
      which is the whole point of the one-join rule and the only test that can
      catch its violation. Tests task 1's second half.

## The adjudication record

- [ ] 11. `pulse/lib/corroboration.mjs`: a reader for adjudication records at
      `data/adjudications/` — one file per pair, named
      `<entry id>--<first field>--<second field>.md`, carrying the entry, both
      field names, the local date, the resolution text, and both pinned values.
      Malformed or unreadable records are skipped rather than treated as
      suppressions, on the same terms as every other reader of a record
      directory here. Implements: *it SHALL live at `data/adjudications/`, one
      file per adjudicated pair, named `<entry id>--<first field>--<second
      field>.md` … and it SHALL carry: the entry, both field names, the local
      date, the resolution … and both resolved values as they stood*.
- [ ] 12. `pulse/lib/corroboration.mjs`: mark a finding `adjudicated` exactly
      when a record names the pair **and** both of today's resolved values equal
      the pinned ones — equality with the pins and nothing else: not the
      record's existence, not its date, no tolerance. Where either differs, mark
      it superseding and carry the record's identity and its pinned values.
      Implements: *the Pulse SHALL suppress … exactly when …* and *if either
      resolved value differs … SHALL produce the item again … naming the
      adjudication it supersedes*.
- [ ] 13. `pulse/lib/queue.mjs`: skip adjudicated findings when minting items,
      and include the superseding ones with the superseded adjudication named in
      the item's detail. The detail of every corroboration item SHALL also carry
      the writing instruction, in the idiom `pulse/lib/vanished.mjs:195–198`
      already uses for its own fixing job: the directory `data/adjudications/`,
      the file name `<entry id>--<first field>--<second field>.md` computed for
      **this** pair, and the fields the record must carry — the entry, both field
      names, the local date, the resolution in the job's own words, and both
      resolved values as they stand in that item. A Desk job is one written
      prompt in; an instruction that is not in the item does not reach it.
      Implements the queue half of task 12's two sentences and *the queue item
      … SHALL state in its own detail how the record is written*.
- [ ] 14. `pulse/lib/corroboration.mjs` and `pulse/run.mjs`: an adjudicated pair
      stays in the returned findings and in the run's `corroboration` log line,
      marked, with both pinned and both current values. Implements: *an
      adjudicated pair SHALL remain visible in the run's computed corroboration
      output, marked adjudicated*.
- [ ] 15. `pulse/lib/corroboration.mjs`: the module writes nothing. Assert it at
      the module boundary — no import of a write-capable filesystem call in this
      file's adjudication path. Implements: *the Pulse SHALL NOT write, edit or
      delete an adjudication record*.
- [ ] 16. `pulse/tests/corroboration.test.mjs`: four fixtures over one
      disagreeing pair — no record (item produced); a record pinning today's two
      values (no item, and the finding still returned and marked adjudicated
      **carrying all four values — both pinned and both current** — asserted
      value by value, not on the mark alone); a record whose cited
      pin no longer matches (item produced, naming the record); a record whose
      **feed-bound** pin no longer matches (item produced, naming the record).
      The fourth is the one that matters and the one a front-matter note could
      not have caught — see design D4. Mutation: suppress on the record's
      existence rather than on value equality and confirm the third and fourth
      fail while the second passes. Tests tasks 11–13.
- [ ] 17. `pulse/tests/corroboration.test.mjs`: run the whole path twice against
      a read-only fixture directory and assert no adjudication record was
      created, altered or removed, and that the second run's findings are
      identical to the first's. Mutation: have the engine write a record when a
      disagreement persists and confirm only this test fails. Tests task 15.
- [ ] 18. `pulse/tests/queue.test.mjs`: an adjudicated pair mints no item while a
      second, unadjudicated pair in the same run still does — the control
      without which task 16's suppression proves only that nothing was produced
      at all. The surviving item's detail is asserted to name
      `data/adjudications/`, the exact file name computed for that pair, and each
      of the record's required fields. Mutation: drop the file name from the
      detail and confirm only that assertion fails — a job told the directory but
      not the name writes the record somewhere the reader will not look. Tests
      task 13.

## Gates

- [ ] 19. `openspec validate let-the-queue-see-a-judgment --type change --strict
      --no-interactive`, and `node scripts/check-spec-deltas.mjs --strict`. Run
      at drafting time.
- [ ] 20. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics` on merged `main`. The orchestrator's,
      not a job's. Note for whoever runs them: `verify-launch` is expected to
      report the same mismatched pieces the new queue reason names — 7 candidate
      paths as measured on 2026-09-06 — and if the two lists differ, task 10's
      assertion is the thing to read first.

## Not tasks of this change, recorded so they are not read as omissions

- **A producer for `missing`** is a separate decision and is not taken here.
- **Declaring a `corroborates` pair on any entry** is content work; the corpus
  declares none today (measured 2026-09-06, `grep -rl` over `content/` returns 0
  files) and this change declares none.
- **The catalog-row disclosure question** `addictedtoai-cct` inherited from
  `addictedtoai-473` needs an optional note on a **cited fact** — a schema
  decision this change declines. It stays open on `cct`.
- **Whether content edits outside the Desk should be possible at all** is
  `addictedtoai-ccky`'s closing note and belongs in its own issue.
