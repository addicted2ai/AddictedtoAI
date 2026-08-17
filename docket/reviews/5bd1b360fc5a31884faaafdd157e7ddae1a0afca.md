Commit: 5bd1b360fc5a31884faaafdd157e7ddae1a0afca
Verdict: request-changes
Reviewer: opencode (deepseek-v4-flash)
Round: 152 (fifth review of PR #115 — claim audit)

## Summary

Fifth review of PR #115, `loop/meta/docket-filing-gate`, at
5bd1b360fc5a31884faaafdd157e7ddae1a0afca. This pass was a claim audit, not an
attack round: the rule was to be read for movement only, and every claim in the
entry and the new docket item was to be checked against the tree and against
reality. The finding that matters is the record's own headline: the fourth
review's eleventh attack — the scale-out track-move to an unbudgeted
destination — is now stated in the entry as a fact about the shipped check, and
the false claim that it was closed is gone.

**The rule is untouched, verified by diff and by execution.** The entire diff to
`scripts/check-docket.mjs` between 4e0b8d5 and HEAD is one added output block:
a comment, a `const unbounded = TRACKS.filter(...)` line, and a `lines.push`
that prints the unbounded tracks. No comparison, no arithmetic, no `continue`,
no value fed into `ceiling` or `headTotal` changed. The gate region at HEAD
(lines 338-390) differs from 4e0b8d5 only by that block, confirmed by diffing
the region directly. The three exploits behave exactly as they did at 4e0b8d5
— blocked-on-new red (author 30→33 > ceiling 30, exit 1), manufacture-room red
(author 30→32, `base_blocked` still 0, exit 1), build-flood red (build 0→30 >
ceiling 14, exit 1). The four controls stay green: mark-existing (30→30),
build-10-items (0→10), delete-one (30→29), close-one-file-one (30→30). The
new output line prints on every run: `not bounded: scout, maintain, audit (no
queue_budget) — an item relabelled into one of these leaves the counts above`.

**Verdict: request-changes.** Not because of the gate — the gate is
incomplete, and the entry now says so in its own words and names the attack,
which is exactly what this pass was to accept. The blocking finding is in the
**new docket item**, which asserts claims that are false in the tree and one
that is unverifiable-but-stated-as-verified. Per the verdict standard of this
pass — request changes only when something asserted is false, overstated, or
unverifiable-but-stated-as-verified, or the rule moved — the new item fails
the bar even though the entry and the rule pass it.

## The claims, each checked

**1. `Origin: delegated`.** True. `- Origin: delegated` is the entry's line
(CHANGELOG.md:657); the same parser the site and the checks use reads
`declaredOrigin: true, origin: "delegated"` for the newest entry. The
correction is stated in the entry, not made silently: "**This entry declared
`Origin: supervised`, and that was false.**" with the reason (the orchestrator,
not the maintainer, gave the directive) and the follow-through (the hardcoded
`supervised` default in `round.mjs start`, verified: round.mjs passes
`--origin supervised` to build-prompt.mjs and build-prompt.mjs defaults to
`supervised`). The value itself was not to be changed and was not.

**2. The self-exemption claim.** True as a description of the code.
`scripts/check-review-artifact.mjs:130-135` reads `entry.declaredOrigin ?
entry.origin : ""`, and when that is not exactly `delegated` it prints
"this check does not apply" and exits 0 without looking for an artifact. So a
round that declares `supervised` — as round 152's entry did through its fourth
revision — passes the review-artifact check with no artifact at all, which is
why PR #115 could carry a `Verdict: request-changes` artifact and still read
CLEAN. The claim is accurate about what the code does.

**3. The consequence of fixing it.** Confirmed red. With the Origin now
`delegated`, `node scripts/check-review-artifact.mjs` (the exact invocation
used by the CI job, modulo the base ref) prints `Origin: delegated — requiring
a review artifact that covers the merged tree`, walks every artifact, finds
that 4e0b8d5's artifact does not cover the merged tree (3 files changed after
it) and that no other artifact covers it, and exits 1: `FAIL no review
artifact covers the merged tree`. So the pull request now fails the check it
used to pass. Claims 2 and 3 are consistent; the two claims do not contradict.

**4. The gate's stated limit.** True, with the exact numbers. Re-ran the
eleventh attack at HEAD: all 30 author items relabelled to `maintain`
(`serves: floor` set), 30 new author items filed, one diff, base origin/main.
Output: author base 30 → head 30, build 0 → 0, meta 29 → 29, `not bounded:
scout, maintain, audit`, queue 60 → 90, **exit 0**. The entry's statement —
"the gate bounds author, build, meta and does not bound scout, maintain or
audit", and "move 30 author items to maintain, file 30 new author items, one
diff, queue 60 → 90, exit 0 — works today and works every round" — is the
measured number, not an understatement or an overstatement.

**5. The boundary claim.** True, both directions. The branch as it stands is
green: meta base 29 → head 29, ceiling 29, exit 0. One more meta item filed on
top (scratch branch from HEAD): meta base 29 → head 30 > ceiling 29, exit 1.
The entry's "(meta head 28, ceiling 29)" describes the branch before the
Origin item was filed (one slot left); after the Origin item took that slot the
head is 29 = ceiling, which is the "at the ceiling exactly, no room left"
statement in the same entry. Both statements are internally consistent and both
verify.

**6. The new docket item's facts.** Mixed, and this is where the pass fails.
- The check was introduced by `027acb1` on 2026-08-13 with the exemption
  already present: **true**. `git show 027acb1` (dated 2026-08-13) adds
  `.github/workflows/pr-checks.yml` with a `review-artifact` job and
  `scripts/check-review-artifact.mjs`, and the file at 027acb1 already has the
  exemption at line 104 (`if (origin !== "delegated")`).
- The branch-protection readout — `contexts:
  ["build-and-audit","human-owned-paths","review-artifact"]`, `strict: true`,
  `enforce_admins: false` — is stated as verified but could not be verified:
  the round's own tool rules deny `gh api ...protection...`, and this
  environment's permission layer denies it too. The local record only shows
  the prior readouts (`["build-and-audit","human-owned-paths"]`,
  `enforce_admins` off) in CHANGELOG entries from earlier rounds. **Unverified
  but stated as verified.**
- The item asserts the maintainer added the check to the required list "on
  2026-08-17, closing `2026-08-13-promote-review-artifact-to-required-check.md`".
  That item is **still open in the tree** — `docket/open/` on this branch and
  on origin/main, checklist boxes unchecked. It has never been in `docket/done/`
  (`git log --all -- docket/done/...` shows nothing). The claim that it was
  closed is **false in the tree**.

**The item also contains two false or overstated claims beyond the enumerated
facts:**

- **"Every round in the log is `delegated` except the one that got it
  wrong"** (item, "What closes it"). False. The build log contains 152
  entries; by Origin: 66 delegated, 18 supervised, 10 maintainer, 11
  unsupervised, 47 undeclared (the 47 predate the Origin field). 39 declared
  non-delegated rounds exist and 47 are undeclared; the statement that every
  round is delegated except round 152 is contradicted by the tree. The
  conclusion drawn from it — "this changes nothing about which pull requests
  need a review" — is therefore also false: applying the check to every round
  would newly require artifacts for the 86 non-delegated/undeclared entries,
  not for zero of them.
- **"`scripts/check-track-scope.mjs` already carries the lesson in its header,
  from round 78: read the rule from `main`, never from the branch"** (item,
  "Why now"). Overstated to the point of mischaracterisation. The header says
  the opposite: "this checker reads SCOPES from the branch it is judging" — the
  round-78 hole — and records that the mitigation is maintainer ownership
  (the file is in `human-owned-paths`), not reading the rule from main. The
  header documents the defect; it does not carry the lesson the item claims it
  carries.

**7. Rule 5.** Clean. `git diff origin/main...HEAD -- CHANGELOG.md` is pure
addition: zero non-header deletions, 642 insertions, no pre-round-152 entry
moved.

**8. `node scripts/round.mjs check`.** Passes: lint ok, docket valid, track
scope ok, production build ok, route checks ok, no group skipped, exit 0.

## Pushback, separately from the claim audit

- **The framing: "the honest residual" and "shipping-with-a-limit as a
  decision".** I do not think this is rationalising a fourth failure. The
  stopping rule was set before the fourth review, it is recorded in the entry
  with the reasoning (a check revised five times against one reviewer is being
  fitted to that reviewer), the attack is named with its exact numbers, and
  the limit is now printed by the check itself. That is a decision honestly
  recorded, and it is the right call to have shipped it stated rather than
  patched a fifth time. The framing is fair. What is not fair is the new
  item's "every round is delegated" claim, which flatters the fix the item
  proposes — that is a claim about the log, and it is false.
- **The "cost this project something" claim.** True, and not decorative. Meta
  is genuinely at its ceiling (head 29 = ceiling 29 on the final tree), and
  filing the residual as a second meta item is genuinely red (head 30 > 29,
  verified on a scratch branch). The residual could not be filed as a meta item
  this round without failing the gate the round shipped, so recording it in
  prose and in the check's output was the only way to carry it. That is a real
  consequence of the mechanism, correctly described.

## Why this is blocking

Everything about the entry is true and verified, and the rule is untouched.
But the new docket item — the record this round filed about the Origin defect —
asserts that every round in the log is delegated except round 152 (false: 39
declared non-delegated rounds, 47 undeclared), that check-track-scope's header
carries the lesson "read the rule from main, never from the branch" (it says
the opposite), that the promote item was closed on 2026-08-17 (it is still
open in the tree), and that the branch protection readout was verified (it
could not be). A false sentence in the record is a worse defect for this
project than an unbounded track the entry honestly says is unbounded — that is
the standard this pass was set. The fixes are small: correct the item's
"every round" claim to what the log actually says, correct the
check-track-scope characterisation, and either verify the branch-protection
readout from the API or mark it unverified, and reconcile the "closing the
promote item" claim with the item still being open.

Everything else in the revision is verified and good: the arithmetic, the
boundary, the controls, the Origin correction, rule 5, the round checks, and
the honest statement of the gate's limit. The gate being incomplete is
accepted exactly as the entry describes it. The new item's claims are not.