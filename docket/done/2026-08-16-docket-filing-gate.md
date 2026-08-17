---
track: meta
filed-by: maintainer
title: Gate filing on the receiving track's capacity, so the queue cannot grow past its budget and no run can raise its own budget to get past the gate
created: 2026-08-16
expires: 2026-11-16
serves: more-checkable
priority: 1
---

## Why now

`2026-08-16-demand-weighted-dispatch.md` makes the dispatcher *respond* to a
full queue. It does not stop the queue filling. Scout files roughly seven
author items a day into a track that can spend 0.43 a day, and nothing in the
repository can fail because of it: `scripts/check-docket.mjs` validates the
shape of an item and never counts them.

The right gate is on the **receiving** track's state, not on the filer's
volume. A per-run filing cap ("scout may file at most three") caps the symptom:
three items into a track already holding thirty is still thirty-three. This is
the one place where the loop's own programme plan and the reviewing model
agreed with each other and with this correction, and both were right.

Two failure modes have to be designed for, because both have already happened
in this repository in some form:

1. **A naïve gate strands the current queue.** Author holds 30 open items
   against a budget of 6. A check that simply fails when a track is over budget
   turns every branch red until the queue is triaged, and a check that can only
   be satisfied by unrelated work is a check that gets disabled. The gate must
   tolerate the historical overage and forbid only *growth*.
2. **A branch-aware gate can be walked around in one commit.** If the check
   reads only the branch's own tree, a run can raise `queue_budget` in
   `policy.yml` and file against the new number in the same pull request. Round
   78 did exactly this with a scope grant, which is why
   `scripts/check-track-scope.mjs` reads its rules from `main`. The same trick
   works here unless it is closed explicitly.

There is also a third count problem the queue already has. Two open meta items
— `2026-08-11-make-codeowners-actually-block-a-merge.md` and
`2026-08-13-add-review-artifact-to-required-checks.md` — ask for changes in the
GitHub settings UI. No round can ever close them, and the maintainer's hard
lines forbid the orchestrator from touching repository settings too. They will
sit in the count forever, consuming budget the loop can never free. They are
not backlog; they are correspondence.

## Evidence

- `scripts/check-docket.mjs` (212 lines, read at `c492961`) validates
  frontmatter, sections, the `Done when` checklist, scout's external citation
  and `blocked-by` resolution. It counts open items per track only to *print*
  them at the end. There is no capacity rule of any kind.
- Open counts at `c492961`: author 30, meta 28, build 0, scout 0, maintain 0,
  audit 0. Against the budgets in the companion item (author 6, build 14,
  meta 14), author is 5× over and meta is 2× over on the day the gate lands.
- `scripts/check-track-scope.mjs` lines 22–25 record the precedent in the
  file's own words: "SCOPES from the branch it is judging, so a run can grant
  itself a path and spend it in the same pull request, and every check passes.
  Round 78 did exactly that."
- `check-docket.mjs` runs from `.github/workflows/pr-checks.yml` (line 179) and
  from `node scripts/round.mjs check`. It is **not** in `package.json`'s
  `prebuild`, so it does not run on Vercel — but the two outages of 15 August
  came from prebuild checks that shelled out to git for a ref the deployment
  clone did not have, and the cheap guard is the same either way.
- The two settings-UI items are open at `c492961` and were filed 2026-08-11 and
  2026-08-13. Neither has moved.

## The design

### `blocked-on`, first — because the gate counts what it defines

Add an optional frontmatter field `blocked-on`, whose only accepted value for
now is `maintainer`. It means: this item is real, and no round can close it.
Reject any other value, so the field cannot quietly become a free-text escape
hatch that empties the queue.

An item carrying `blocked-on: maintainer` is excluded from the budget counts in
this check and from `ready` in `scripts/dispatch.mjs`, and is reported on its
own line so it stays visible rather than merely uncounted. Set it on the two
settings-UI items named above.

### The filing gate

Read the base tree from `origin/main` — `git ls-tree`/`git show` against
`origin/main`, never the working copy. Guard it exactly the way
`scripts/count-changelog-rounds.mjs` does after PR #90: if `origin/main` cannot
be resolved, print a `WARN`, skip the gate, and **exit 0**. A check that cannot
read its baseline must not invent one, and must not take the build down.

With `base` and `head` open counts per track, for every track carrying a
`queue_budget`:

    FAIL if head > base AND head > budget

That is the whole rule. It tolerates the 30-item overage that exists on the day
it lands, it lets any branch reduce a queue freely, and it makes the 31st
author item impossible. A track under budget is unaffected.

### The budget-raise rule

Read `queue_budget` for each track from `policy.yml` on `origin/main` as well as
from the branch. If a track's budget is higher on the branch than on the base:

    FAIL if head open count for that track > base open count for that track

You may raise a budget. You may not raise it and spend it in the same pull
request. This is `CHARTER.md` rule 11 — "a run blocked by a guardrail may not be
the run that loosens it" — made mechanical for this gate rather than left as
prose, which is the standard everything load-bearing in this repository is
supposed to meet.

## Done when

- [x] `scripts/check-docket.mjs` accepts `blocked-on: maintainer`, rejects any
      other value, excludes those items from budget counts, and reports them on
      their own line
- [x] `scripts/dispatch.mjs` excludes `blocked-on` items from `ready`
- [x] `blocked-on: maintainer` is set on the two settings-UI items — named in
      this item as `2026-08-11-make-codeowners-actually-block-a-merge.md` and
      `2026-08-13-add-review-artifact-to-required-checks.md`; neither file
      exists, and the items the description points at are
      `2026-08-11-branch-protection-does-not-require-review.md` and
      `2026-08-13-promote-review-artifact-to-required-check.md`, which carry
      the field. The naming drift is recorded in round 152's changelog entry.
- [x] The filing gate fails a branch that increases the open count of an
      over-budget track, and passes one that decreases it — proved on
      `scratch/add-author-item` (red) and `scratch/delete-author-item` (green),
      outputs pasted in the entry
- [x] The budget-raise rule fails a branch that raises a `queue_budget` and adds
      an item to that track in the same diff — proved on
      `scratch/raise-budget-and-file` (red, both rules fire), output pasted
- [x] `origin/main` being unresolvable produces a `WARN` and exit 0, not a
      failure — proved by running the check in a clone made with
      `git clone --single-branch --branch main` and `git remote remove origin`,
      output pasted
- [x] **Prove each rule can fail.** Three scratch branches, each committed and
      run against, with the output recorded in the entry:
      (a) add one author item → red;
      (b) delete one author item → green;
      (c) raise `meta.queue_budget` and add a meta item in one diff → red
- [x] **Negative control:** a branch that raises a budget and adds *no* item is
      green (`scratch/raise-budget-only`), and a branch that adds an item to a
      track that is under budget is green (`scratch/file-under-budget`) — so
      the gate is proved to be about capacity, not about touching the docket
      at all

## Correction recorded

The two settings-UI items this item names in `Done when` do not exist under
those filenames. The items it describes — the two open meta items asking for
GitHub settings-UI changes that no round can close — are
`2026-08-11-branch-protection-does-not-require-review.md` and
`2026-08-13-promote-review-artifact-to-required-check.md`, and those carry
`blocked-on: maintainer` as of round 152. Round 152's changelog entry records
the same discrepancy.
