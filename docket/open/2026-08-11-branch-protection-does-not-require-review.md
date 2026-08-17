---
track: meta
filed-by: maintain
title: Make CODEOWNERS actually block a merge, in the GitHub settings UI
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
blocked-on: maintainer
---

## Why now

`CHARTER.md` rule 13 says the charter, the workflow definitions and the loop's
own prompt are human-owned: the loop may propose changes to them and must not
merge them. `.github/CODEOWNERS` names exactly the right paths — `/CHARTER.md`,
`/.github/` and `/prompts/` — and its own header comment says that "with branch
protection requiring code-owner review on these paths, a pull request touching
any of them will not auto-merge however green its checks are."

Branch protection does not require that. Read from the GitHub API on
2026-08-11:

```
$ gh api repos/addicted2ai/AddictedtoAI/branches/main/protection --jq \
  '{code_owner:.required_pull_request_reviews.require_code_owner_reviews,
    count:.required_pull_request_reviews.required_approving_review_count,
    admins:.enforce_admins.enabled,
    required:[.required_status_checks.contexts[]]}'
{"admins":false,"code_owner":true,"count":0,"required":["build-and-audit"]}
```

`require_code_owner_reviews` is true, but `required_approving_review_count` is
0, so there is no approval for the code-owner rule to demand. `enforce_admins`
is false, which is a second, independent hole: the repository owner is also the
identity the loop pushes as, so even a working review requirement would be
bypassable by the account that runs the loop.

This is not theoretical. Of the nineteen pull requests this repository had
opened as of 2026-08-11, exactly one touched a CODEOWNERS-protected path:

```
$ gh pr view 16 --json number,mergedAt,reviews,files
{"n":16,"mergedAt":"2026-08-11T05:22:38Z","reviews":0,
 "files":[".github/workflows/pr-checks.yml","CHANGELOG.md"]}
```

PR #16 changed a CI workflow and merged with zero reviews. Rule 13 is currently
enforced by instruction and by `scripts/check-track-scope.mjs`, which keeps
five of the six tracks away from those paths entirely — but meta's scope
includes them, and nothing stops a meta round merging such a change.

Round 72 corrected the site's published claim about this (it had said those
paths "require human review"). Correcting the page does not close the hole, and
no track can close it: it is a repository settings change, not a file.

**The queue cannot say that.** The triage round of 2026-08-11 went through every
open item asking what blocked it, and found this one is the only item blocked on
something outside the repository entirely. `blocked-by` names other docket items
and `check-docket.mjs` rejects anything else, so there is no way to mark this
unready and the dispatcher keeps counting it as available meta work. That was
left as a finding rather than fixed: one instance does not justify a second
readiness mechanism, and a `blocked-by: maintainer` value that nothing ever
clears would be a permanent hole in the readiness filter rather than a use of
it. If a second item of this shape turns up, it is worth building.

## Round 81 added the evidence that the hole bites the required check, not just reviews

Round 75 built `human-owned-paths` as a required status check, round 79 added
`scripts/check-track-scope.mjs` to its pattern, and round 79's entry claimed a
scope change now "stops being something a round can decide and becomes
something it can only propose". The same `enforce_admins: false` hole applies
to a required *check* as to a review rule, and this round confirmed it
empirically: PR #25 (round 77) and PR #27 (round 79) both carry a failing
`human-owned-paths` check and both merged — by `addicted2ai`, zero reviews,
with no auto-merge queued (`auto_merge: null`, merged within ~7 minutes of
opening). A required status check is only as strong as the account that merges;
here that account is the admin the check does not bind. The gate blocks
`gh pr merge --auto`, and nothing else.

## Round 90 re-verified, on the way to building the review-artifact gate

The meta round of 2026-08-13 re-checked the same two claims while deciding
where to put the gate for `Origin: delegated` rounds, and both held. Verified
by the maintainer from the API this round: `enforce_admins` is false; the
required contexts are `["build-and-audit","human-owned-paths"]`;
`required_approving_review_count` is 0. Verified by the round from `gh pr
view` and `gh pr checks`: PR #25 merged 2026-08-11T13:15:56Z and PR #27 merged
2026-08-11T15:39:31Z, both by `addicted2ai`, both with `reviews: []` and
`autoMergeRequest: null`, both reporting `human-owned-paths` fail while
`build-and-audit` passed.

The claim round 79's entry made — that the guard makes a scope change "cost a
human merge instead of nothing" — is still not supported by the mechanism. The
gate blocks `gh pr merge --auto`, the path `round.mjs ship` uses, and nothing
else. A direct admin merge lands a guarded change with the check red. Whether
a human was at the keyboard for #25 and #27 is not visible from the API: both
merges show only `addicted2ai`. Recorded because it is the same shape as the
gate being built this round: this project keeps proposing checks that assume a
merge cannot happen past them, and the mechanism keeps not supporting the
assumption. This item's `enforce_admins` box is the fix that would.

## The trap in the obvious fix

Setting `required_approving_review_count` to 1 would break every loop round.

- The count is a property of the branch protection rule, not of a path.
  GitHub's documentation describes requiring "a specific number of approving
  reviews before someone merges the pull request into a protected branch"
  (https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches,
  retrieved 2026-08-11); there is no path-scoped variant. Code-owner review is
  an *additional* requirement layered on that count, so raising the count to
  make CODEOWNERS bite raises it for every pull request, including the ordinary
  content rounds CODEOWNERS was never meant to touch.
- The loop cannot satisfy it by approving itself. Every loop pull request is
  opened by `addicted2ai`, which is also the sole code owner named in
  `.github/CODEOWNERS`, and GitHub states plainly that "Pull request authors
  cannot approve their own pull requests."
  (https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews,
  retrieved 2026-08-11.)

So the naive change converts "the loop merges everything, including things it
should not" into "the loop merges nothing at all". Whatever is chosen has to
either scope the requirement to the protected paths by some other mechanism, or
introduce a second identity that can approve, and it has to be demonstrated
rather than assumed — this repository has already shipped one enforcement
mechanism that was believed to work and did not.

## Evidence

Internal, all produced on 2026-08-11:

- `gh api repos/addicted2ai/AddictedtoAI/branches/main/protection` — the
  readout quoted above. The same call also shows `require_last_push_approval:
  false` and no repository rulesets (`gh api .../rulesets` returns `[]`), so
  branch protection is the only mechanism in play.
- `gh pr view 16` — merged 2026-08-11T05:22:38Z, 0 reviews, touched
  `.github/workflows/pr-checks.yml`.
- `gh pr view N --json reviews` over N = 1..19 — every merged pull request in
  this repository has 0 reviews; #16 is the only one that touched
  `/CHARTER.md`, `/.github/` or `/prompts/`.
- `.github/CODEOWNERS` — names the three paths, owner `@addicted2ai`.

External, retrieved 2026-08-11: the two GitHub documentation pages linked
above, for the branch-scoping of the review count and for the self-approval
prohibition.

## Done when

- [ ] **The maintainer has made the settings change by hand.** This step cannot
      be executed by any track: `required_approving_review_count` and
      `enforce_admins` are GitHub repository settings, not files in this
      repository, and `CHARTER.md` rule 14 confines the loop to this repository
      and its deployment. The executing step is a human in Settings → Branches
      → the `main` protection rule (or an equivalent API call made by the
      maintainer).
- [ ] A pull request that touches `/CHARTER.md`, `/.github/` or `/prompts/`
      cannot merge without a human approval — demonstrated on a real pull
      request, not inferred from the settings page
- [ ] A pull request that touches none of those paths still auto-merges on
      green, with no human approval — demonstrated the same way, because a fix
      that stops every loop round is not a fix
- [ ] `enforce_admins` is enabled, or the record says explicitly why it is not
      and what that leaves open
- [ ] `.github/CODEOWNERS`'s header comment and `CHARTER.md`'s claim that these
      paths "will not auto-merge" are either true or amended to match what is
      actually enforced
- [ ] The check is re-read from the API afterwards and the readout recorded, so
      the next round does not have to take the settings page's word for it

## 2026-08-17 — the queue can say this now; the settings have not moved

Two things have changed since this was filed, in opposite directions.

The paragraph above beginning "**The queue cannot say that.**" is out of date.
`blocked-on: maintainer` exists: `scripts/check-docket.mjs` accepts it and
rejects every other value, `scripts/dispatch.mjs` excludes items carrying it
from `ready`, and the filing gate counts them apart from each track's budget.
This item carries the field. The second instance it said would justify building
the mechanism arrived — `2026-08-13-promote-review-artifact-to-required-check.md`
— and it was built.

Nothing about the settings has moved. Read from the API on 2026-08-17:
`enforce_admins: false`, `required_approving_review_count: 0`,
`require_code_owner_reviews: true`, and required contexts
`["build-and-audit","human-owned-paths","review-artifact"]`. The third context
is new — the maintainer added it that day — and it does not touch this item. A
required check and a required review are different mechanisms, and with
`enforce_admins` off the account the loop operates as can merge past either. The
trap this item documents in the obvious fix is unchanged too: raising the
approval count to make CODEOWNERS bite would raise it for every pull request,
and the loop cannot approve its own.
