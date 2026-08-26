---
track: build
filed-by: maintain
title: Make round.mjs check reproducible, or state that a single red run is not a verdict — today an identical tree can pass and fail
created: 2026-08-24
expires: 2026-11-22
serves: more-checkable
priority: 2
---

## Why now

Two open items name individual timing-dependent tests:
`2026-08-23-orchestrate-runner-launch-test-is-timing-dependent.md` and
`2026-08-24-checkout-test-asserts-a-wall-clock-threshold.md`. Both are about a
specific assertion in a specific file.

This item is the general claim neither of them makes, and it is the one that
matters to anyone reading a result: **`node scripts/round.mjs check` — and
therefore `build-and-audit` — can return different verdicts for the same tree.**
Nothing anywhere says so. The gate is presented throughout this repository as
the thing that decides whether work is fit to merge, and every round's
`Guardrails:` line reports its verdict as a fact about the change.

The consequence is not "a round gets annoyed and retries". It is that a red
`build-and-audit` carries no information until it has been run twice, and a
round that hits one has no stated basis for telling a real regression from a
flake. The current practice — retry once, and if it passes, disclose and
proceed — is folklore passed between rounds in changelog prose. It is not
written in `AGENTS.md`, not in the round prompts, and not in the gate's own
output.

Either the gate becomes reproducible, or it says out loud that its verdict is
probabilistic and what a reader should do about that. Both are acceptable
outcomes; the present state, where it is probabilistic and silent about it, is
not.

## Evidence

- Round 188's own `CHANGELOG.md` entry records the gate failing on
  `scripts/test-orchestrate-runner-launch.mjs` ("checkout free -- no session
  from this supervisor is advancing") "on several runs of this round and
  passed on the retry every time, nothing edited between".
- Round 189's review observed the same thing independently: one failing run on
  `test-orchestrate-runner-launch.mjs` and a clean pass on an identical tree.
- **Round 189 then reproduced it directly while filing this item.** The gate
  failed with `ORCHESTRATE_COMMAND path was gated by the runner system:
  2026-08-25T01:43:24Z  checkout free -- no session from this supervisor is
  advancing` / `node scripts/test-orchestrate-runner-launch.mjs exited 1`, and
  passed clean on the immediately following run with **nothing edited between
  the two**. That round's diff contains no orchestrate, liveness or checkout
  code at all — it is `CHANGELOG.md`, three files under `app/`, and docket
  items — so there is no candidate cause in the change under test. Three
  independent observations across two rounds now, which is why "it passed for
  me" is not evidence against this.
- The specific test is already filed as
  `docket/open/2026-08-23-orchestrate-runner-launch-test-is-timing-dependent.md`,
  whose title concedes the position this item is about: "re-running it is the
  current fix".
- Round 189's brief anticipates the flake in advance and instructs the round
  to "retry once without editing, disclose it". A gate whose launch
  instructions budget for a retry is a gate that is known not to be
  reproducible.
- `scripts/check-routes.sh` wires both `test-orchestrate-runner-launch.mjs` and
  `test-orchestrate-checkout.mjs` into `build-and-audit`, so both reach the
  required check.

## Observed 2026-08-25 — two IDENTICAL consecutive failures, and a mechanism

Every observation above is *fail once, pass on immediate retry*. On 2026-08-25
the orchestrating session hit **two identical consecutive failures** on round
198's branch, against a diff of two prose lines touching no `scripts/` and
nothing the failing test exercises:

```
FAIL  ORCHESTRATE_COMMAND path was gated by the runner system:
      <timestamp>  checkout free -- no session from this supervisor is advancing
FAIL  node scripts/test-orchestrate-runner-launch.mjs exited 1
```

That shape is not what the retry-once convention was built for, and the
convention says nothing about what a round should do when the retry fails too.

**A mechanism, found by reading the test rather than guessing:** test 3 in
`scripts/test-orchestrate-runner-launch.mjs` (lines 227-263) does **not** use
the shared `run()` helper. It inlines its own spawn with a flat, unconditional
`setTimeout(..., 6000)` at line 245 — the shortest budget of the three tests,
with no load scaling, where tests 1 and 2 get 15000ms and 8000ms. The assertion
needs `iteration starting` in the captured output, and `checkout free ...` logs
*before* it in the real flow. A fixed 6s budget that expires before
`iteration starting` is logged would truncate the output at exactly that line —
**which is what both failures showed.** Heavy concurrent load (this machine ran
many agents through that session) is the plausible trigger for hitting that
budget now rather than before, but **it was not measured at the time of either
run** and is not established here.

A **third** run of the same command, on a tree with three further prose edits,
then passed clean. So the full observed sequence that day was **fail, fail,
pass** — which is why "retry once and disclose" is not a rule so much as a
coin-flip with a convention attached.

That is corroborating evidence for a timing bound rather than a logic
regression, and it names a specific number a fix can target.

The two existing items are the likely proximate causes and should be read with
this one; this item is not a duplicate of either, and closing both would not by
itself close this one. What this item asks for is a statement about the gate's
verdict, which neither of them makes.

## Done when

- [ ] Either: the timing-dependent assertions are replaced with deterministic
      ones (observe the decision, not the wall-clock around a spawned child),
      and the gate is demonstrated stable over a run of repeats on one
      unchanged tree — the number of repeats chosen and stated, not assumed
- [ ] Or: `round.mjs check` labels the tests it knows to be timing-dependent
      in its own output, so a red run says which failures are reproducible and
      which are not, rather than leaving a round to look it up in the docket
- [ ] Whichever way it goes, the retry-once-and-disclose convention stops being
      folklore: it is written where a round will actually read it, or it is
      made unnecessary
- [ ] Whatever check or label is added is proved able to fail before it is
      trusted
- [ ] `node scripts/round.mjs check` green
