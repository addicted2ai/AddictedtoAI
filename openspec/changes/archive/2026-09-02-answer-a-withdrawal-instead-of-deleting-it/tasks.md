# Tasks — answer-a-withdrawal-instead-of-deleting-it

## 1. The answered store

- [x] **1.1** `ANSWERED_DIR` and `answerVanishedRecord(root, name)` in
      `pulse/lib/vanished.mjs` — one implementation of the move, returning
      false when there is nothing to move so a double call is harmless.
      Measured by `answering twice is harmless, and answering nothing reports
      false`.
- [x] **1.2** `recordVanishedRows` skips a row named in the answered store, so
      an answered withdrawal is never re-recorded however long the row stays
      absent. Measured by `THE POINT, corrected: ANSWERING a record retires it,
      permanently`, which asserts it across three further runs.
- [x] **1.3** The record body now instructs a job to MOVE the file rather than
      delete it, and says why deletion does not work.
- [x] **1.4** `data/vanished/README.md` updated to match.

## 2. Pin the defect

- [x] **2.1** `DELETING a record does NOT retire it — the next run writes it
      again` asserts the failure directly, so the deletion path cannot be
      reintroduced as an "obvious simplification".
- [x] **2.2** Two test names corrected. One claimed deletion "retires the item,
      with nothing else recording done"; it now claims only what it proves —
      that the queue reads the directory. Another claimed idempotency "cannot
      revive a deleted record", which was the false half. A test whose NAME
      asserts something untrue is how the next reader inherits the error.

## 3. Commit what is written

- [x] **3.1** `pulse/run.mjs` declares the vanished records in the publish
      step's `owned` paths — `written` AND `existing`, so a record that failed
      to commit once is not dropped from the declared set forever. Verified by
      running: the next run committed the three records the previous one had
      missed.

## 4. Verification

- [x] **4.1** `node --test pulse/tests/vanished-queue.test.mjs` — 16 tests.
- [x] **4.2** End-to-end on the real repository, which is what found the defect
      in the first place and is therefore the check that matters: answer the
      three pending records, run the Pulse, and confirm it reports them as
      answered rather than re-recording them.
- [x] **4.3** Full gates, serially.

## 5. Traceability

| Normative clause | Task | Check that measures it |
|---|---|---|
| retirement is by moving into an answered store, not deletion | 1.1, 1.2 | `ANSWERING a record retires it, permanently` |
| a row in the answered store is never recorded again | 1.2 | the same test, across three further runs |
| deletion is not a retirement path | 2.1 | `DELETING a record does NOT retire it` |
| the Pulse commits the records it writes | 3.1 | verified by running; the run log names the committed paths |
| pinned evidence, malformed-record skip, no binding removal | — | carried through unchanged; existing tests still cover them |

## 6. Deliberately not done

- [x] **6.1** No shared "answered store" abstraction with
      `data/proposals/consumed/`. Two instances of a shape is not a pattern
      worth extracting, and the proposals lifecycle carries cooling and expiry
      rules this has no use for.
- [x] **6.2** The three currently pending records are answered as part of this
      change rather than left for a job: their pages were repaired, reviewed and
      approved by j-20260902-01 and j-20260902-05, which ran before the
      mechanism existed and so had nothing to move.
