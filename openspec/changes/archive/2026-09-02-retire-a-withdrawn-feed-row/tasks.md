# Tasks — retire-a-withdrawn-feed-row

## 1. The writer

- [x] **1.1** `pulse/lib/vanished.mjs` — `recordVanishedRows` writes one record
      per withdrawn declared row under `data/vanished/`, keyed by a
      filesystem-safe `vanishedFileName(source, rowId)`. Measured by
      `row ids containing slashes, colons and tildes become one safe file name`.
- [x] **1.2** Idempotency by file presence, never by date comparison. Measured
      by `recording is idempotent`, and mutation B (removing the guard) fails
      exactly that test.
- [x] **1.3** Each record pins the row's last-known values. Measured by
      `the record pins the last-known values`, and mutation C (dropping them)
      fails exactly that test. Internal `$`-prefixed derived keys are excluded
      from the rendered table — asserted in the same test.
- [x] **1.4** `data/vanished/README.md` states that presence is the state,
      that deletion is the retirement, and what a job must not do.

## 2. The reader

- [x] **2.1** `pulse/lib/queue.mjs` gains `vanishedRowItems(root)`, mirroring
      `carriedFindingItems`. Measured by `a recorded vanished row produces
      exactly one item, at its documented rank`.
- [x] **2.2** The producer no longer reads `freshness.vanished_feed_rows`.
      Measured by the regression test `a vanished row in freshness alone no
      longer produces an item`, and by mutation A.
- [x] **2.3** A malformed record is skipped, not queued under a guessed name.
      Measured by `a record with no title is skipped`, and mutation D.
- [x] **2.4** `README.md` in the directory is not a finding; an absent
      directory is zero findings, not a crash. Both measured directly.

## 3. The wiring

- [x] **3.1** `pulse/run.mjs` calls `recordVanishedRows` after the derived tree
      is built and before the queue is computed, and logs how many were newly
      recorded versus already awaiting repair.

## 4. Verification

- [x] **4.1** `node --test pulse/tests/vanished-queue.test.mjs` — 12 tests.
- [x] **4.2** **Mutation-tested, four mutations, each caught by the test named
      for it**, with every source file restored byte-identical afterwards:
      (A) retirement removed → the regression and absent-directory tests fail;
      (B) idempotency guard removed → the idempotency test fails;
      (C) evidence no longer pinned → the pinning test fails;
      (D) malformed records queued under a guessed name → the skip test fails.
- [x] **4.3** Full gates, serially.

## 5. Traceability — every normative clause, its task and its check

| Normative clause | Task | Check that measures it |
|---|---|---|
| one durable record per absent declared row, written once | 1.1, 1.2 | `recording is idempotent`; mutation B |
| the queue produces from records, not from computed absence | 2.1, 2.2 | the regression test; mutation A |
| retirement is deletion by the fixing job's own diff | 2.1 | `THE POINT: deleting the record retires the item` |
| the record pins last-known values | 1.3 | `the record pins the last-known values`; mutation C |
| a malformed record is skipped, never renamed | 2.3 | `a record with no title is skipped`; mutation D |
| nothing removes an entry or its `feeds:` binding | — | nothing in this change writes to `content/`; the README states the prohibition for the jobs that act on a record |

## 6. Deliberately not done

- [x] **6.1** Rank unchanged at 85. It was not the defect, and the RANKS table
      already justifies it. Lowering it would have hidden the symptom while
      leaving an un-retirable item in place.
- [x] **6.2** No cohort batching. `data/proposals/batch-cohort-vanished-row-
      repairs.md` is a live proposal still inside its cooling window; deciding
      it by side effect here would pre-empt the mechanism that exists to weigh
      it.
- [x] **6.3** No timeline event on retirement. `appendTimelineEvents` fires only
      on status field changes, so a withdrawal records nothing — a real gap,
      filed separately. Fixing it inside this change would let the Pulse satisfy
      this finding mechanically, which is exactly what must not happen.
- [x] **6.4** No change to how a page renders once its row has rotated out of
      both snapshots. That is the open half of `addictedtoai-64fk`.
