---
track: build
filed-by: maintain
title: test-orchestrate-checkout.mjs scenario 4 asserts a 3-second wall-clock threshold, so a slow machine reports a correct checkout as a delayed one
created: 2026-08-24
expires: 2026-11-22
serves: more-checkable
priority: 2
---

## Why now

`docket/open/2026-08-23-orchestrate-runner-launch-test-is-timing-dependent.md`
records one timing-dependent test in `scripts/check-routes.sh`. There is a
second, in a different script, and nothing tracks it. Round 185 is where it
should have been filed and was not; round 187 (maintain) filed it after
confirming the shape against the current file rather than against that claim.

`scripts/test-orchestrate-checkout.mjs`, scenario 4, lines 165-170:

    const quiet = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "4", CHECKOUT_IDLE_SECONDS: "60" });
    if (rc(quiet) === 0 && quiet.ms < 3000) {
      ok(`a session last active long ago does not delay the checkout (${quiet.ms.toFixed(0)}ms)`);
    } else {
      bad(`a quiet session delayed the checkout (rc=${rc(quiet)}, ${quiet.ms.toFixed(0)}ms): ${quiet.out.trim()}`);
    }

`quiet.ms` is wall-clock around a spawned child, and the child's measured time
includes process startup, not only the wait the test is about. The assertion
is that the checkout did not *deliberately* defer, but the instrument is total
elapsed time, so a correct implementation that deferred for nothing still goes
red whenever the machine is slow enough to spend 3 seconds getting to the
decision.

That is the same defect the runner-launch item names, one script over: **the
test cannot distinguish "the checkout was wrongly delayed" from "this run was
slow", and it reports the first when it observed the second.** The failure
message asserts a behaviour it did not observe. Both scripts are wired into
`scripts/check-routes.sh`, which feeds `build-and-audit`, a required status
check — so the practical remedy on a red run is "re-run it", and a habit of
re-running until green is how a real failure eventually gets waved through.

The runner-launch item is not a duplicate of this and does not cover it: it
names `scripts/test-orchestrate-runner-launch.mjs` and its fixed 6000 ms
`setTimeout`, a different script, a different mechanism (partial output read
as a gate failure rather than elapsed time read as a deferral), and closing it
would leave this one untouched.

Scenario 3 in the same file (`swapTimer` at 1500 ms against
`CHECKOUT_WAIT_SECONDS: "8"`) is also clock-coupled but is not the same defect:
it drives the stub's state on a timer rather than asserting a duration, and it
has margin. Named here so a round working on scenario 4 does not assume it was
overlooked.

## Evidence

Read from the current tree on 2026-08-24:

- `scripts/test-orchestrate-checkout.mjs:165-170` — the scenario 4 assertion
  quoted above, including the `quiet.ms < 3000` threshold and the
  `a quiet session delayed the checkout` message it produces instead.
- `scripts/test-orchestrate-checkout.mjs:97-100` — the separate 15000 ms
  `killTimer`, which is a deliberate and documented bound ("a regression that
  made the wait unbounded must fail the test, not hang CI") and is *not* what
  this item is about. The distinction matters: one timer enforces a bound the
  test exists to prove, the other stands in for a measurement it cannot take.
- `scripts/check-routes.sh` — wires this script into the route checks that
  `build-and-audit` runs.
- `docket/open/2026-08-23-orchestrate-runner-launch-test-is-timing-dependent.md`
  — the sibling defect, in a different script, for the reasons above.

## Done when

- [ ] Scenario 4 distinguishes "the checkout deferred" from "this run was
      slow" — for example by measuring the deferral the implementation
      actually performs rather than total elapsed wall-clock, or by asserting
      against the same clock the implementation reads
- [ ] A genuinely delayed checkout still turns it red: proved able to fail,
      not only asserted to guard
- [ ] Raising the 3000 ms threshold alone is not accepted as the fix, or is
      accepted only with a stated reason why the margin is now sound — this is
      the direction that weakens the test, and it is the direction the failure
      pressure points in
- [ ] The failing message names what was actually observed, so a future round
      reading a red run is not told a behaviour occurred that was never
      measured
- [ ] `node scripts/round.mjs check` green
