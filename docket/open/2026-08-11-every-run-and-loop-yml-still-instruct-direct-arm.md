---
track: meta
filed-by: build
title: every-run.md and loop.yml still tell rounds to arm auto-merge directly, bypassing the Origin gate
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 3
blocked-by: 2026-08-11-delegated-origin-definitions-disagree.md
---

## Why now

Round 86 (build) made `ship` arm auto-merge only when the round's declared
Origin permits it, and changed `scripts/build-prompt.mjs` so the prompt defers
to `ship`. But round 85 did not arm through `ship` at all: pull request #34 was
created 2026-08-12T01:29:46Z and auto-squash was armed at 01:29:48Z — two
seconds later, which is the round obeying the last line of its prompt, not
`ship` finishing. Two copies of the same direct-arm instruction remain, and
both are human-owned, so this round could not touch them:

- `prompts/shared/every-run.md` says "Then request auto-merge and stop:
  `gh pr merge --auto --squash`". A round that reads it will still arm its own
  merge regardless of its Origin, which is the opposite of the gate round 86
  built.
- `.github/workflows/loop.yml` never invokes `ship` at all. The scheduled
  round is driven entirely by the prompt, so until that prompt text is the
  fixed one, a scheduled round carries the direct-arm instruction.

`scripts/build-prompt.mjs` was the same instruction and is fixed in round 86
because it is in build's scope. `every-run.md` is under `prompts/` and
`loop.yml` under `.github/`, both `human-owned-paths` — only a meta round may
edit them, and the meta round's pull request will wait on a human by design.

## Evidence

- `scripts/build-prompt.mjs` (pre-round-86): "When you are done, open a pull
  request and run 'gh pr merge --auto --squash'." Round 86 changed this to
  "run 'node scripts/round.mjs ship' ... Do not run 'gh pr merge --auto
  --squash' yourself".
- `prompts/shared/every-run.md`: "Then request auto-merge and stop: `gh pr
  merge --auto --squash`". Unchanged; human-owned.
- `.github/workflows/loop.yml`: no `round.mjs ship` invocation; the round runs
  from the assembled prompt. Unchanged; human-owned.
- PR #34 timeline, fetched from the GitHub API by round 86: created 01:29:46Z,
  auto-merge armed 01:29:48Z.

## Done when

- [x] `prompts/shared/every-run.md` defers the auto-merge decision to
      `node scripts/round.mjs ship` and drops the instruction to run
      `gh pr merge --auto --squash` directly (or says to run it only after
      `ship` withholds and names the round's review as the gate) — done in
      round 88 (meta): the mechanical instruction was reduced to a pointer and
      `build-prompt.mjs` is the single source for the assembled prompt's ending.
      Convergence, not consolidation: `AGENTS.md` still carries its own
      agreeing copy; it is in meta's scope now (added round 88) for a later
      round to consolidate.
- [ ] `.github/workflows/loop.yml` invokes `ship` (or the prompt it builds is
      the fixed `build-prompt.mjs` text) so the scheduled path and the local
      path reach the same gate — the second half is true now: the workflow
      builds its prompt from `build-prompt.mjs`, which after round 86 says to
      run `ship`. Making the workflow itself invoke `ship` was evaluated in
      round 88 and left: wiring it correctly requires testing the scheduled
      loop end to end, which a round cannot do, and a broken scheduled loop is
      worse than an ungated one. This half stays open for a round that can test
      it.
- [x] The round that changes them records in its entry that the change to
      human-owned paths waits on a human by design, and the changelog preamble
      describing auto-merge does not contradict the gate round 86 built — done
      in round 88's entry.

## 2026-08-17 — the blocker is done and the remaining half is a dormant path

`2026-08-11-delegated-origin-definitions-disagree.md`, the `blocked-by` on this
item, is in `docket/done/`. Nothing holds it back.

The open box asks that `.github/workflows/loop.yml` invoke `ship`. Read today,
that workflow builds its prompt from `scripts/build-prompt.mjs` — which since
round 86 tells the round to run `ship` — and it invokes no merge command of its
own, so the direct-arm instruction this item was filed about is gone from that
path. What remains is that the workflow does not call `ship` itself.

It also does not run. `on.schedule` is commented out; the workflow fires only on
`workflow_dispatch`, and the loop that actually ships rounds is
`scripts/orchestrate.sh` on the maintainer's machine. Priority drops from 1 to 3
for that reason: the gap is real, but it is on a path nothing currently takes,
and round 88's reasoning still holds — wiring the scheduled loop correctly needs
an end-to-end test of the scheduled loop, which a round cannot do, and a broken
scheduled loop is worse than an ungated one.

If the schedule is ever uncommented, this is priority 1 again the same day.
