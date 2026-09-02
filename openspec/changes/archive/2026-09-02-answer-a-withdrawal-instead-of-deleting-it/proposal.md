# Answer a withdrawal instead of deleting it

## Why

`retire-a-withdrawn-feed-row`, archived hours earlier the same day, specified
retirement as **deleting** the record. That is wrong, and it fails in the exact
way the requirement it belongs to exists to prevent.

Found by running the Pulse, not by testing it. After the three Anthropic
"(Fast)" records were deleted by hand — their pages having already been
repaired, reviewed and approved — the very next run logged:

```
pulse: vanished rows — 3 newly recorded, 0 already awaiting repair
```

The rows are still absent from the latest snapshot, and they always will be, so
the recorder wrote all three straight back. Deletion retired nothing. The
finding was still immortal; it had merely acquired a file.

**The carried-finding analogy is what caused this, and it is the thing to state
plainly.** A carried finding can be retired by deleting its file because its
source is a **one-time** event: a reviewer wrote a verdict record, the loop
transcribed it once, and nothing ever recreates it. A withdrawn row's source is
a **standing** condition — the continuing absence of a row — which is re-derived
on every run. The two look alike and behave oppositely, and the first version of
this mechanism copied the shape without checking that the difference did not
matter.

The tests did not catch it, and the reason is worth recording: twelve tests and
four mutations all passed against a feature that could not retire anything.
Every one built its own throwaway root and asserted on `recordVanishedRows` and
`vanishedRowItems` in isolation. One of them even asserted the defect *as
intended behaviour*, under a comment calling re-recording "the deliberate
trade". A test that encodes the bug is worse than no test, because it defends
it.

## What changes

Retirement becomes **moving the record into an answered store**
(`data/vanished/answered/`), and a row named there is never recorded again.
This is not a new invention: `data/proposals/consumed/` already retires a
consumed proposal exactly this way, and for the same reason — the condition that
produced it would otherwise keep producing it.

- `answerVanishedRecord(root, name)` performs the move, so there is one
  implementation and one name rather than each job improvising a path.
- `recordVanishedRows` skips any row named in the answered store.
- The spec clause changes from "deletion" to "moving into an answered store",
  and gains a scenario asserting that **deleting** a record does NOT retire it —
  pinning the defect so it cannot return.

A second clause is added while the requirement is open: the Pulse SHALL commit
the records it writes. That was also missing and was also found by running
rather than testing — the recorder wrote three records and the run committed
only `data/derived/queue.json`, because a new state directory was not in the
publish step's declared `owned` paths. Queue state that lives on one machine is
not state.

## What this does not do

- It does not change the rank, the pinned evidence, the malformed-record rule,
  or the prohibition on removing a `feeds:` binding. Those clauses are carried
  through unchanged.
- It does not add a general "answered store" abstraction shared with proposals.
  Two instances of a shape is not yet a pattern worth extracting, and the
  proposals lifecycle has cooling and expiry rules this has no use for.
