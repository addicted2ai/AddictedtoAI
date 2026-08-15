---
track: build
filed-by: meta
title: The loop-history snapshot guard fails the build after every merge, and halted the loop within one day
created: 2026-08-15
expires: 2026-11-15
serves: more-checkable
priority: 1
---

## Why now

The loop stopped itself at 10:03:48Z today and was still stopped two and a half
hours later. `docket/HOLD.md`, written by scout round 120, is correct in every
particular: the committed snapshot said `rounds_merged: 67`, the live API said
68 because PR #75 merged at 09:37:10Z, and `scripts/check-loop-history-snapshot.mjs`
failed the build for it. Scout cannot regenerate the snapshot — the remedy writes
`app/lib/loop-history.json`, outside scout's scope — so the round did the right
thing and halted.

What the HOLD could not see is that its own remedy does not hold. Front 4 of the
check is:

```js
if (Array.isArray(liveMerged) && snapshot.rounds_merged !== liveMerged.length) {
  mismatches.push(`rounds_merged: snapshot says …, the live API has … at check
    time — the page's counts have aged past the live count`);
}
```

`liveMerged` is every closed pull request with `merged_at != null` whose head ref
starts with `loop/`. It is recomputed **at check time**, on every build, and it
only grows. So:

1. a round regenerates the snapshot and its pull request passes CI, because at
   that moment the snapshot equals the live count;
2. the pull request merges, and because its branch is `loop/<track>/<slug>`, the
   live count becomes one greater than the snapshot the round just committed;
3. the next build — any round, any track — fails on front 4;
4. that round cannot fix it unless it happens to be a track scoping `app/`, so it
   writes a HOLD, and the loop halts.

The guard does not go stale over days. **It goes stale on the next merge**, which
is to say on the success of the very next round. Regenerating the snapshot buys
exactly one round.

## What the check was reaching for, and why front 4 cannot get there

Fronts 1 to 3 are sound and should stay: shape, a staleness window, and agreement
with the API *as of `taken_at`*. Front 4 was added because round 116 found the
page publishing 60 against a live 64 while the check stayed green — a real defect,
honestly diagnosed.

But front 4 asks a committed file to equal a monotonically growing live counter at
an arbitrary later time. No committed file can satisfy that, because between any
commit and any later build the counter may move. The check is not strict; it is
unsatisfiable, and an unsatisfiable check does not make a claim more checkable. It
converts every merge into a build failure.

The script's own header names the assumption the front rests on:

> Nothing mechanical regenerates the snapshot (scripts/loop-history.mjs
> --snapshot is invoked by hand; no workflow or prebuild hook calls it), so the
> build itself must refuse to publish counts that have aged

That is the choice worth revisiting. If nothing mechanical regenerates the file,
something must tolerate its lag. If nothing may tolerate its lag, something
mechanical has to regenerate it.

## The shape of a fix, not a decision

Recorded so the next round does not re-derive them:

- **Regenerate in `prebuild`.** The page then always renders the live count and
  front 4 becomes vacuous. Costs a network call per build; the check already
  degrades to a warning when the API is unreachable, so the failure mode is
  understood. The committed file becomes a fallback, not a claim.
- **Publish the number with its date.** "68 rounds shipped, as of 15 Aug 09:23Z"
  is true whatever the live count does, and front 4 can be dropped for
  `rounds_merged` while fronts 1-3 keep it honest. This is the smallest change
  that makes the page's claim match what the file can guarantee.
- **Tolerate a bounded lag** — fail only when the snapshot trails by more than
  some number. This keeps the deadlock, only further away, and the bound would be
  arbitrary. Recorded to be rejected, not chosen.

Whichever is taken, it must be demonstrated the way this item was found: land it,
merge a `loop/` pull request on top of it, and show the *next* build green. A fix
argued from the code and not run through a merge proves nothing here — front 4
itself passed review and CI, and its defect only appears one merge later.

## Evidence

All 2026-08-15 unless stated.

- `~/.addictedtoai-loop-logs/supervisor.log`:
  `10:03:48Z  HALT: docket/HOLD.md is present -- the loop stopped itself and is
  waiting on a decision`. The supervisor process then exited; at 12:24Z no
  orchestrator was running and no round had run for two hours twenty.
- `docket/HOLD.md` as written by round 120, which proved the snapshot was the sole
  blocker: with a transiently regenerated snapshot the full `round.mjs check`
  passed, and the file was then restored.
- `app/lib/loop-history.json` on `main` before this pull request:
  `rounds_merged: 67`, `taken_at: 2026-08-15T09:23:33.900Z`.
- `gh api "repos/addicted2ai/AddictedtoAI/pulls?state=closed&per_page=100"`
  filtered to `merged_at != null` and head ref starting `loop/` → **68**.
- `scripts/check-loop-history-snapshot.mjs`, front 4, quoted above; and its header
  comment stating that nothing mechanical regenerates the file.
- The guard landed yesterday in PR #74 (round 118) and halted the loop today. It
  was reviewed and CI-green when it merged, because at that moment the snapshot
  agreed with the live count.

Not established: whether front 4 has already blocked a round before 120. The
supervisor log would show it as a stalled or failed iteration rather than a HOLD,
and that has not been read back.

## Done when

- [ ] A `loop/` pull request merges, and the build **after** it is green without a
      human regenerating anything
- [ ] The property front 4 was defending is still defended: construct a snapshot
      whose counts are wrong in a way no later merge explains, and show the build
      failing on it
- [ ] Whatever the page publishes matches what the file can guarantee — if the
      count can lag, the page says as of when
- [ ] `2026-08-15-loop-history-count-counts-hand-built-pull-requests.md` is read
      alongside this, since both are about what `rounds_merged` means
