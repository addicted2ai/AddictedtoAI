---
track: meta
filed-by: meta
title: A strict-mode branch update voids the review artifact, and PR #49 merged with the gate red
created: 2026-08-14
expires: 2026-11-14
serves: more-checkable
priority: 1
---

## Why now

PR #49 merged today with `review-artifact` **failing**, and the failure was
correct: the artifact no longer covered the tree. Nothing was wrong with the
round, and nothing was wrong with the check. The two mechanisms are simply
incompatible, and the incompatibility fires on any delegated round that falls
behind `main`.

`main`'s protection has `strict: true`, so a branch must be up to date before it
can merge. `scripts/check-review-artifact.mjs` condition 4 requires that nothing
outside `docket/reviews/` changed after the reviewed commit:

```
const diff = tryGit(["diff", "--name-only", `${fields.Commit}..HEAD`]);
const outside = (...).filter((f) => !f.startsWith(REVIEWS_DIR));
if (outside.length > 0) {  ...  "does not cover the merged tree" ... }
```

Updating a branch to satisfy `strict` merges `main` into it, which by definition
changes files outside `docket/reviews/`. So **satisfying one requirement voids
the other.** The reviewed commit becomes non-covering the instant the branch is
brought up to date.

That is what happened here. PR #49 (round 98, `Origin: delegated`) was reviewed
and approved at `f76113c`. A CI fix (#50) landed on `main` underneath it. The
branch went `BEHIND`, was updated to `4535882`, and `review-artifact` went from
`SUCCESS` to `FAILURE` — with no change whatsoever to the round's own content.
Auto-merge, already armed, then completed on the two required checks.

The round's work really was reviewed. The gate that exists to prove that was red
at the moment of merge, and the merge happened anyway.

## Why this is worse than it looks

The open item `2026-08-11-branch-protection-does-not-require-review.md` proposes
tightening exactly this area, and the docket has repeatedly wanted
`review-artifact` promoted to a required check. **Promoting it while this
interaction exists would deadlock the loop**, not tighten it:

- the round falls behind `main` (which happens whenever anything else merges),
- `strict: true` requires an update before merging,
- the update voids the artifact,
- `review-artifact` — now required — fails,
- and the only way to restore coverage is a fresh review of the updated head,
  which is void again the moment anything else merges.

Under load, no delegated round would ever merge. This is the same shape as that
item's own "trap in the obvious fix" section: an enforcement change that reads as
strictly safer and in fact stops the loop dead. It is worth solving *before*
anyone promotes the check, not after.

## The shape of a fix, not a decision

Recorded so the next round does not have to re-derive the options:

- **Ignore merge commits from the base.** Condition 4 could compare the reviewed
  commit against the head *excluding* changes that came from `main` — i.e. ask
  whether the branch's own contribution changed, not whether the tree did. That
  is the property the gate actually wants: "nobody slipped new work in after the
  review."
- **Re-review on update**, accepting the cost. Honest and simple; expensive, and
  it scales badly with merge frequency.
- **Drop `strict: true`.** A repository settings change, outside the loop's
  reach, and it removes a genuine protection.
- **Leave it, and stop claiming the gate is load-bearing.** If `review-artifact`
  is permanently advisory, `CHARTER.md` and the entries that describe it should
  say so plainly rather than describe a guarantee the merge path does not
  enforce.

The first is the most likely to be right and the least likely to be simple; it
must be demonstrated on a real branch update, not reasoned about. This repository
has already shipped one enforcement mechanism that was believed to work and did
not.

## Evidence

All from 2026-08-14, this repository:

- `gh api repos/addicted2ai/AddictedtoAI/branches/main/protection/required_status_checks`
  → `{"contexts":["build-and-audit","human-owned-paths"],"strict":true}`.
  `review-artifact` is **not** required, which is the only reason #49 merged
  rather than jamming.
- PR #49 before the update: head `f76113c`, `review-artifact: SUCCESS`,
  `build-and-audit: FAILURE`, state `BEHIND` after #50 merged.
- `gh pr update-branch 49` → head `4535882`.
- PR #49 after the update: `build-and-audit: SUCCESS`,
  `human-owned-paths: SUCCESS`, `review-artifact: FAILURE`, `state: MERGED`.
- The reviewing artifact is `docket/reviews/63daf8f8dda3c43aedb2c4440f603079b1522804.md`
  at commit `f76113c`; the round's content is unchanged between `f76113c` and
  `4535882` apart from the merge of `main`.
- `scripts/check-review-artifact.mjs` condition 4, quoted above.

Filed by the supervising model after observing the merge; no human found this.
The CI fix that triggered it (#50) was the maintainer's decision, recorded in
`docket/HOLD.md` at the time and in that pull request.

## Done when

- [ ] A delegated round whose branch is updated to satisfy `strict: true` still
      shows `review-artifact` green, **demonstrated on a real pull request** —
      or the record states plainly that the gate cannot survive an update and
      what that leaves unenforced
- [ ] The chosen fix is proven not to weaken the property the gate exists for:
      new work pushed after a review must still void the artifact. Construct
      that case and show it failing
- [ ] `2026-08-11-branch-protection-does-not-require-review.md` is cross-read,
      so nobody promotes `review-artifact` to a required check before this is
      resolved
- [ ] The entries describing the review-artifact gate are checked against what
      the merge path actually enforces, and corrected where they overstate it
