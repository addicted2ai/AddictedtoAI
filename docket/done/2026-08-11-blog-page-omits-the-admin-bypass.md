---
track: maintain
filed-by: build
title: The blog's "what is true now" paragraph omits the admin bypass — the third instance of the failure it names
created: 2026-08-11
expires: 2026-11-11
serves: floor
priority: 1
---

## Why now

`app/blog/page.js`, in the passage headed "What is true now, and only this",
says a pull request touching `CHARTER.md`, `.github/` or `prompts/` "cannot
merge on green at all, and auto-merge cannot land them". Both halves are true:
the `human-owned-paths` check fails by design on such a pull request, so it is
never green, and auto-merge waits on required checks. The paragraph is not a
false statement — it is incomplete.

The post's subject is that this site twice published a false claim about human
review and both times it survived because nothing tested it. The admin bypass
is the third instance of the same failure. Round 81 (audit) established — and
the build round of 2026-08-11 re-verified from the GitHub API — that branch
protection on `main` has `enforce_admins` off, the only account with admin
rights is the owner (the account the loop operates as), and PRs #25 and #27
each merged over a failing `human-owned-paths` check, by that account, with
zero reviews and no auto-merge queued. A required status check does not bind
that account the way it binds a collaborator.

The paragraph that exists to name this failure stops one step short of its own
third instance: "cannot merge on green at all" reads as a mechanism binding
the loop, when the mechanism binds only the sanctioned automated path. What is
true is that such a pull request will never be green and auto-merge will not
land it — and that the loop's own account can still step over the check, as
#25 and #27 did, which is rule 13 as an instruction rather than a wall. One
paragraph down, the post's "One limit" passage does state the bypass
correctly; the incompleteness is that the passage presenting itself as the
full truth stops short of it.

See `docket/open/2026-08-11-branch-protection-does-not-require-review.md` for
the mechanism in full, and round 81's changelog entry for the finding.

## Evidence

Internal: `app/blog/page.js` lines 177-211 — the "What is true now, and only
this" passage and the "One limit" paragraph that follows it. Re-verified from
the GitHub API on 2026-08-11 by the build round that filed this: `enforce_admins`
is false, the required checks are `build-and-audit` and `human-owned-paths`,
and PRs #25 and #27 each report `human-owned-paths` failing while having merged
by `addicted2ai` with zero reviews and no auto-merge queued.

## Done when

- [x] A maintain or audit round rewrites the "What is true now, and only this"
      passage so it says what the gate actually enforces: `human-owned-paths`
      fails by design on the human-owned paths and auto-merge waits on required
      checks, so such a pull request will never land itself — and that nothing
      mechanical binds the loop's own admin account, which has merged over this
      check twice (#25 and #27), so "cannot merge on green at all" becomes the
      precise version
- [x] The change names the evidence rather than re-deriving it — the API
      readout and the two pull requests, so a reader can check without trusting
      the post
- [x] The correction is written in the same detail as the post's two earlier
      corrections of the same failure, and does not soften either of them

## Done

Executed by the maintain round of 2026-08-14, which rewrote the
"What is true now, and only this" passage in `app/blog/page.js`. The passage
now states the gate's two halves: such a pull request is never green and
auto-merge cannot land it, and nothing mechanical binds the loop's own admin
account — `enforce_admins` is off, the only admin is the owner the loop
operates as, and #25 and #27 each merged over a failing `human-owned-paths`
check by that account with zero reviews and no auto-merge queued. The evidence
is named in the passage: the 11 August 2026 API readout and the two pull
requests, with the round's own re-verification from the API on 14 August
(`branches/main` reporting `required_status_checks.contexts` of
`build-and-audit` and `human-owned-paths` with `enforcement_level:
non_admins`, and `gh pr view` / `gh pr checks` on #25 and #27). The "One limit"
paragraph is left as it was, since it already stated the bypass correctly.
