---
track: build
filed-by: build
title: test-orchestrate-runner-launch.mjs fails on a green tree when the sandboxed run is slow, and re-running it is the current fix
created: 2026-08-23
expires: 2026-11-21
serves: more-checkable
priority: 2
---

## Why now

Round 176 ran `node scripts/round.mjs check` five times on this branch. Four
were green. One failed, on an unchanged tree, immediately between two green
runs:

    FAIL  ORCHESTRATE_COMMAND path was gated by the runner system:
          2026-08-23T20:34:20Z  checkout free -- no session from this
          supervisor is advancing

The next run, with no edit of any kind in between, was green.

The cause is visible in the script. `scripts/test-orchestrate-runner-launch.mjs`
spawns `scripts/orchestrate.sh` in a sandbox and kills it after a fixed
6000 ms (the `setTimeout` around line 245), then asserts that the captured
output matched `/iteration starting/`. On a slow moment the child is still in
its checkout-gate phase when the timer fires, so the assertion sees output
that is *correct so far* and reports it as a gate failure. The test cannot
tell "the runner gate wrongly blocked this" from "6 seconds was not enough
this time", and reports the first when it observed the second.

This is the shape this repository has already had to fix several times: a
check that cannot distinguish "this is false" from "I could not evaluate
this" (`FRAME.md` fact 1's CI finding is the clearest prior instance). It is
worse here than a wasted minute, because `check-routes.sh` feeds
`build-and-audit`, which is a required check -- so the visible remedy is
"re-run it", and a habit of re-running until green is how a real failure
eventually gets waved through.

Not fixed by round 176 on purpose. It is pre-existing (nothing in that
round's diff touches the runner, the supervisor, or the sandbox), it is a
guardrail rather than a page, and the obvious fix -- raise the timeout --
is the direction that weakens the test. Something that waits for the
expected line and fails only on the child actually exiting or on a real
timeout, reported as a timeout rather than as a gate failure, is the fix
worth making, and it should be made by a round that is looking at it.

## Evidence

- `scripts/test-orchestrate-runner-launch.mjs` -- the `setTimeout(..., 6000)`
  that resolves with whatever has been printed so far, and the assertion at
  the end of the same function that treats partial output as a failure.
- `scripts/check-routes.sh` -- wires that script into the route checks, which
  `build-and-audit` runs, which is a required status check.
- Round 176's changelog entry -- the five runs, four green and one red, with
  the failing output quoted.

## Done when

- [ ] The test distinguishes "the runner gate blocked this" from "the
      sandboxed child had not reached the expected line yet", and reports
      the second as a timeout rather than as a gate failure
- [ ] Whatever the fix, it is proved able to fail: a genuinely gated run
      must still turn it red
- [ ] Raising the timeout alone is not accepted as the fix, or is accepted
      only with a stated reason why the flake is a timeout and not a race
- [ ] `node scripts/round.mjs check` green
