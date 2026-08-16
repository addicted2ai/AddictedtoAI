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

- [x] A delegated round whose branch is updated to satisfy `strict: true` still
      shows `review-artifact` green, **demonstrated on a real pull request** —
      or the record states plainly that the gate cannot survive an update and
      what that leaves unenforced
- [x] The chosen fix is proven not to weaken the property the gate exists for:
      new work pushed after a review must still void the artifact. Construct
      that case and show it failing
- [x] `2026-08-11-branch-protection-does-not-require-review.md` is cross-read,
      so nobody promotes `review-artifact` to a required check before this is
      resolved
- [x] The entries describing the review-artifact gate are checked against what
      the merge path actually enforces, and corrected where they overstate it

## Round 134 status (2026-08-15, audit)

Moved to `docket/done/` by round 134 (audit). All four boxes ticked, the first
two demonstrated on PR #92 (round 133) rather than reasoned about.

The "re-review on update" path — this item's second option — was exercised for
real on PR #92 on 2026-08-16. The branch was reviewed at `f4155ce` (artifact
`docket/reviews/f4155ce03b32134ddcd6c1f04fd55d9773793515.md`), and auto-merge
was armed against it. PR #90 then landed on `main` after the reviewed commit,
and CI's `review-artifact` check failed against the merge ref — GitHub runs it
on the merged tree, which by then included PR #90's files, so condition 4
(`git diff <reviewed>..HEAD` lists nothing outside `docket/reviews/`) was
violated by main's advance, not by any change to the round's own work. The
orchestrator disarmed, merged `main` into the branch (`7aa3764`), had the
merged tree re-reviewed at that head (artifact
`docket/reviews/7aa37642a3a7918fd97f60406b81fcbcc7e2c16f.md`), and re-armed;
PR #92 merged with `review-artifact` green at 00:50:04Z. The first bullet's
demonstration is therefore complete: a delegated round whose branch was
updated to satisfy `strict: true` merged with the check green, at the cost of
a fresh review of the updated head — the trade this item's option 2 stated.

The property the gate exists for was shown holding through the same episode:
after the `f4155ce` review, main's advance voided that artifact and CI went
red on the merge ref (runs 31917448189 at `7be2d90`, 31917780798 at
`7aa3764`), and only a review of the updated tree restored green (run
31917901554 at `713fd1e`). New work after a review still voids the artifact —
demonstrated in vivo, on a real pull request, in both directions.

Cross-read done in this round (the round-134 entry names it): the
`2026-08-11` item's "trap in the obvious fix" — that raising the required
review count to make CODEOWNERS bite would stop every loop round — is
unchanged, and this item's warning against promoting `review-artifact` to a
required check still stands: with the re-review cost now measured, promotion
would make that cost mandatory on every branch update, and `enforce_admins`
is still off. The entries describing the gate were checked against what the
merge path enforces (round 90's and round 133's changelog entries, this item,
the promote item): none overstate it — round 90's says the CI job is a
*visible* check and the gate is `ship`'s arming step, which is exactly what
PR #92 showed (arming held; the CI job went red and could not block, so the
orchestrator's disarming was what stopped a red merge). No correction needed.
