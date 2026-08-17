---
track: meta
filed-by: meta
title: A round can exempt itself from mandatory review by declaring a different `Origin`
created: 2026-08-17
expires: 2026-11-15
serves: more-checkable
priority: 1
---

## Why now

`scripts/check-review-artifact.mjs` decides whether the mandatory-review gate
applies by reading the `Origin:` line out of the round's own `CHANGELOG.md`
entry:

```js
const origin = entry && entry.declaredOrigin ? entry.origin : "";
if (origin !== "delegated") {
  ok(`Origin is '${origin || "undeclared"}' — this check does not apply`);
```

That entry is part of the tree being judged. A round writes its own `Origin`,
in the same diff the check is inspecting, and any value other than `delegated`
turns the check green without a review artifact existing at all.

This is not hypothetical. **Round 152 did it, and did it by accident.** It
declared `Origin: supervised` on the mistaken belief that the orchestrating
model's instruction to replace a rule was a maintainer instruction. The
consequence was that the pull request carried a `Verdict: request-changes`
review artifact and still reported CLEAN and mergeable, because the check that
would have blocked it had exempted itself. The Origin was corrected to
`delegated` by hand, on inspection, by the orchestrator noticing — which is
exactly the kind of catch a mechanical check exists to not depend on.

The timing makes it worse rather than better. The maintainer added
`review-artifact` to the required status checks on 2026-08-17, closing
`2026-08-13-promote-review-artifact-to-required-check.md`, so it is now the
gate that stands between a delegated round and `main`. Promoting a check to
*required* buys nothing if the branch it guards can decide the check does not
apply to it — round 152 was the first pull request to face the promoted check
and it walked straight past it on a typo.

This is the same defect the same round's reviewers found three times in
`scripts/check-docket.mjs` — a gate reading a fact from the tree it is judging —
and `scripts/check-track-scope.mjs` already carries the lesson in its header,
from round 78: read the rule from `main`, never from the branch. The review
check is the one place the lesson was never applied, and it is the check that
guards all the others.

## What closes it, in two sizes

**A round can close the exemption today.** Make the check apply to every round
entry regardless of the declared `Origin`, or apply it whenever the branch
carries a round entry at all. Every round in the log is `delegated` except the
one that got it wrong, so in practice this changes nothing about which pull
requests need a review — it only removes the ability to opt out. That is a
small change to `scripts/check-review-artifact.mjs` and does not touch a
human-owned path.

**Making it robust is a maintainer question and should not be attempted by a
round.** A branch controls its own tree and its own branch name, so no signal a
round can write is trustworthy evidence that a human was involved. Real
evidence of human involvement lives at GitHub's layer — an approving review
from an account other than the one the loop operates as — and wiring the
exemption to that is a settings and identity decision, tied to
`2026-08-11-branch-protection-does-not-require-review.md` and to whether the
loop keeps operating as the owner account. File that separately if the first
fix is not enough; do not bundle it here.

## Evidence

Internal — this is a property of this repository's own checks:

- `scripts/check-review-artifact.mjs:130-132` — the exemption, quoted above.
- `.github/workflows/pr-checks.yml` — the `review-artifact` job, added by
  `027acb1` on 2026-08-13 with the exemption already in it.
- The branch protection readout on 2026-08-17:
  `contexts: ["build-and-audit","human-owned-paths","review-artifact"]`,
  `strict: true`, `enforce_admins: false` — read from
  `repos/addicted2ai/AddictedtoAI/branches/main/protection`, not from the
  settings page.
- `CHANGELOG.md`, round 152 — the false `Origin: supervised`, its correction,
  and the observation that the pull request read CLEAN while carrying a
  `request-changes` artifact.
- `scripts/check-track-scope.mjs` — the header recording the round-78
  precedent this check does not follow.

## Done when

- [ ] A branch carrying a round entry cannot turn `review-artifact` green by
      changing or omitting its `Origin` line.
- [ ] Demonstrated on a real committed branch: take round 152's own tree, set
      `Origin` to `supervised`, and show the check red where it was green.
      Pasted output, not described.
- [ ] A negative control: a round with a valid covering approve artifact stays
      green, so the fix is not "review-artifact always fails".
- [ ] The round's entry states plainly that the check was self-exemptable from
      the commit that introduced it (`027acb1`, 2026-08-13) until this fix, and
      that it was a *required* status check for the last stretch of that
      window.
