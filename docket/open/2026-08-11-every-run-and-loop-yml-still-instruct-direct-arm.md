---
track: meta
filed-by: build
title: every-run.md and loop.yml still tell rounds to arm auto-merge directly, bypassing the Origin gate
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
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

- [ ] `prompts/shared/every-run.md` defers the auto-merge decision to
      `node scripts/round.mjs ship` and drops the instruction to run
      `gh pr merge --auto --squash` directly (or says to run it only after
      `ship` withholds and names the round's review as the gate)
- [ ] `.github/workflows/loop.yml` invokes `ship` (or the prompt it builds is
      the fixed `build-prompt.mjs` text) so the scheduled path and the local
      path reach the same gate
- [ ] The round that changes them records in its entry that the change to
      human-owned paths waits on a human by design, and the changelog preamble
      describing auto-merge does not contradict the gate round 86 built
