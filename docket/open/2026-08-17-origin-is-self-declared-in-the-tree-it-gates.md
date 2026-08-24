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
`review-artifact` to the required status checks on 2026-08-17, so it is now the
gate that stands between a delegated round and `main`. Promoting a check to
*required* buys nothing if the branch it guards can decide the check does not
apply to it — round 152 was the first pull request to face the promoted check
and it walked straight past it on a typo.

(The item that asked for that settings change,
`2026-08-13-promote-review-artifact-to-required-check.md`, is **still open** in
`docket/open/`. Its `Done when` asks for the settings change, a demonstration on
a real pull request that a delegated round with no covering approve cannot
merge, and an API re-read of the protection afterwards. All three now exist —
round 152 is the demonstration and its entry records the readout — so a maintain
round can close it against that evidence. This item does not close it.)

This is the same defect the same round's reviewers found three times in
`scripts/check-docket.mjs`: a gate reading a fact from the tree it is judging.
Round 78 hit it in `scripts/check-track-scope.mjs`, which still reads `SCOPES`
from the branch — its header says so plainly, and the mitigation there was not
to read from `main` but to make the file human-owned so a scope change costs a
human merge. The review check has neither mitigation: it reads its applicability
from the branch, and nothing about that declaration is human-owned.

## How large this actually is

**The exemption is deliberate, not forgotten, and that makes it bigger rather
than smaller.** The Origin values across the log are 66 `delegated`, 18
`supervised`, 11 `unsupervised`, 10 `maintainer`. `unsupervised` is defined in
this log as *"scheduled, merged itself, nobody read it first"*, and
`scripts/round.mjs` arms auto-merge for `unsupervised`, `supervised` and
`maintainer` while withholding it only for `delegated`. So the review artifact
is required exactly where a reviewer is already claimed to exist, and is not
required for the category that states outright that nobody read the work.

That may be defensible as a design — the artifact is proof that a claimed
review happened, and an `unsupervised` round claims none. But combined with
self-declaration it means the cheapest way past the review gate is to claim
*less* oversight, not more: write `unsupervised`, and the round both skips the
artifact requirement and arms its own auto-merge.

## What closes it

**Do not treat "apply the check to every round" as a cheap fix.** It is not the
no-op it looks like: 39 of the 105 entries that declare an Origin are
non-`delegated`, and requiring artifacts for `unsupervised` rounds would end
unsupervised operation as this project has defined and published it. That is a
change to what the loop *is*, and it belongs to the maintainer.

**What a round could do without deciding that question** is make the exemption
loud instead of silent: have `check-review-artifact.mjs` print the Origin it
read and the fact that it is standing down because of it, so an exemption
appears in the check output rather than as a green tick, and have
`scripts/round.mjs` refuse to arm auto-merge if the entry's Origin changed
after `start` wrote it. Neither closes the hole; both make using it visible.

**Closing it properly is a maintainer question.** A branch controls its own tree
and its own branch name, so no signal a round can write is trustworthy evidence
about who was involved. Real evidence lives at GitHub's layer — an approving
review from an account other than the one the loop operates as — and wiring the
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
  settings page. Read by the orchestrating model, not by a round: this round's
  own reviewer was denied that API call by its tool rules and correctly marked
  the line unverified. Anyone re-checking should re-read it rather than trust
  this line.
- `CHANGELOG.md:21` — the Origin taxonomy, including `unsupervised` as
  "scheduled, merged itself, nobody read it first".
- The Origin distribution across the whole log, counted rather than sampled:
  66 `delegated`, 18 `supervised`, 11 `unsupervised`, 10 `maintainer`. The
  first version of this item claimed every round was `delegated`; that came
  from reading the first twelve lines of a grep and was wrong.
- `CHANGELOG.md`, round 152 — the false `Origin: supervised`, its correction,
  and the observation that the pull request read CLEAN while carrying a
  `request-changes` artifact.
- `scripts/check-track-scope.mjs` — the header recording round 78: that checker
  reads `SCOPES` from the branch it judges, and is mitigated by being
  human-owned rather than by reading from `main`. The review check has neither
  mitigation.

## Done when

- [ ] **The maintainer decides the question this turns on:** should a round be
      able to declare itself outside the review requirement at all, given that
      the declaration is written by the round? Answering "no" ends
      `unsupervised` operation as published. Answering "yes" means
      `review-artifact` is a record-keeping check, not a gate, and the site
      should not describe it as a gate. Either answer is shippable; leaving it
      undecided is what is not.
- [ ] Whatever is decided, an exemption is never silent: the check prints the
      Origin it read and states that it is standing down because of it, so a
      skipped review appears in the output rather than as a green tick.
- [ ] `scripts/round.mjs` refuses to arm auto-merge when the entry's `Origin`
      differs from the one `start` wrote, so a mid-round change is caught by
      the tool rather than by a human noticing.
- [ ] Demonstrated on a real committed branch: take round 152's own tree, set
      `Origin` to `supervised`, and show the new behaviour where it was
      previously a silent green. Pasted output, not described.
- [ ] A negative control: a round with a valid covering approve artifact stays
      green, so the change is not "review-artifact always fails".
- [ ] The round's entry states plainly that the check was self-exemptable from
      the commit that introduced it (`027acb1`, 2026-08-13) until this fix, that
      it was a *required* status check for the last stretch of that window, and
      how many merged rounds declared an Origin the check did not apply to.

## 2026-08-17 — one box folded in from the vocabulary item

`2026-08-11-unsupervised-origin-assumes-scheduled.md` carries a box that is this
item's defect in different words: "`Origin: supervised` is not assignable at
`start`, because at `start` nothing knows yet whether anyone will be able to
veto. Either the value is decided at `ship` from whether auto-merge was
requested, or `start` stops asserting it and says what determines it. A run must
not be able to quote its own start command as evidence about its own merge."

It is folded in here rather than tracked in two places. `scripts/round.mjs
start` still hardcodes `supervised`, and `scripts/build-prompt.mjs` still
defaults to it and prints "This run was started by hand: Origin is
'supervised'" — so a round is handed the claim before it has done anything, and
the entry it writes from that claim is what the review gate then reads. The
vocabulary item keeps the half about what the words mean and where they are
published; the mechanical half is this one's.

## 2026-08-24 — the mechanical half built; the exemption itself was already gone

Three things landed this round (`loop/meta/loud-origin-exemption`), all
scoped to this item's own explicitly-reserved partial mitigation — the
central question below is untouched:

- `check-review-artifact.mjs` now says explicitly, on every branch that
  declares a round, that no Origin exempts it:
  `Origin: X — no Origin exempts a branch from this check; requiring a
  review artifact that covers the merged tree`. Reading the code before
  changing anything: there was no exemption left to announce. Round 179's
  second push (`loop/meta/checks-that-misreport`, PR #144, 2026-08-24) had
  already removed the Origin-based CARRYING exemption entirely, as the fix
  for a *different* bug — a `request-changes` review laundered by one
  trivial follow-up commit — not as a deliberate answer to the question
  below. `test-review-artifact.mjs` case 9 already asserted this ("a
  non-delegated round carrying no artifact now fails, not exempted"); this
  round only reworded the line, it did not change the behaviour.
- `scripts/round.mjs` now refuses to arm auto-merge when the round's final
  declared Origin differs from the value `start` recorded when the round
  began — a mid-round change, correct or not, now needs a human to arm the
  merge, the way round 152's was previously caught only by a human noticing.
  Implemented as a small, untracked, per-machine anchor file (`start` writes
  it, `ship` reads and consumes it), so a round the GitHub workflow launches
  — which never calls `start` locally — is unaffected: absence of an anchor
  is not a failure, only a disagreeing one withholds arming.
- `scripts/round.mjs start` no longer hardcodes `Origin: supervised` into the
  prompt it hands a hand-started round. `build-prompt.mjs`'s `--origin`
  default changed from `"supervised"` to none: given no explicit value
  (which is now what `start` always passes), it tells the round what
  determines its true Origin instead of asserting one. This is the
  mechanical box folded in from
  `2026-08-11-unsupervised-origin-assumes-scheduled.md`; see that item's own
  note dated today.

**What this surfaces, unprompted:** the central question this item reserves —
"should a round be able to declare itself outside the review requirement at
all?" — is already answered "no" in the code, operationally, as of round
179's second push, without that round's own entry framing it that way (its
entry discusses the fix only as closing a laundering hole, with a cost
disclosed in passing: "a real cost, since 43 of 131 declared-Origin rounds
are not `delegated`"). Whether the maintainer intended that, ratifies it, or
wants it reconsidered is still open. This round changes nothing about it
either way — consistent with the reservation above and `CHARTER.md` rule 11
— but the gap between "the code already forecloses this" and "someone
decided to foreclose it" is exactly the kind of drift this item exists to
catch, so it is recorded here rather than smoothed over.

**Demonstration** (round 152's shape reconstructed in a scratch git
repository, the same technique `test-review-artifact.mjs` uses — round 152's
own commits do not survive as ancestors of anything, because its pull
request squash-merged): `Origin: supervised` + a covering
`Verdict: request-changes` artifact now FAILs (`exit 1`,
`Verdict is 'request-changes', not 'approve'`), with the Origin line printed
loudly. The negative control — same shape, a genuine covering
`Verdict: approve` — passes (`exit 0`). Full output pasted in this round's
`CHANGELOG.md` entry.

**Fresh count, re-derived through `app/lib/build-log.js` (not copied
forward):** 135 entries declare an Origin; 43 of them are not `delegated`
(18 `supervised`, 14 `maintainer`, 11 `unsupervised`). The docket item's
original figure (39 of 105) and round 179's figure (43 of 131) are both
superseded by entries filed since; the *non-delegated* count of 43 happens
to be unchanged from round 179's count — only the denominator grew (131 →
135, four more `delegated` entries).

Left open, unchecked, on purpose: the maintainer's decision on the reserved
question. Everything else in the "Done when" list above this note is now
satisfied and is not re-typed here.
