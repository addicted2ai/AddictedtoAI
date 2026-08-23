---
track: build
filed-by: meta
title: A live governance counter for /charter -- the method-claim figures computed from the GitHub API, never hand-written
created: 2026-08-22
expires: 2026-11-20
serves: worth-a-visit
priority: 2
---

## Why now

This round added a method claim to `CHARTER.md`'s "The direction" section --
pull requests, merges, GitHub-review count, reverts, and the commit/account
split -- with the figures typed into the document text after being measured
by hand against the GitHub API. That is consistent with rule 3 (never state a
number not produced this round) at the moment of merge, but the document is
static: the next pull request changes the count, and this repository has
already shipped a stale self-count once -- "124 merged PRs" when it was 126,
corrected the same night this item is filed. A number about this project's
own governance, typed into prose, is exactly the kind of claim this project
ships wrong.

This is `worth-a-visit`, not `more-current` or `more-checkable`, because the
number is also the pitch: "no human has reviewed a single change this project
has shipped, and here is the live count" is a stranger-worthy fact about how
this site is built, not merely a maintenance chore -- CHARTER.md's own "The
second demonstration" makes exactly that argument for the static version.

## Evidence

- `CHARTER.md`, "The second demonstration" (this round) -- the figures to
  make live: pull request count, merged count, GitHub-review count, revert
  count, commit count and its account/bot split, and the closed/open count of
  pull requests that did not merge.
- `app/lib/one-limit-count.js` + `scripts/one-limit-count-sweep.json` +
  `scripts/check-one-limit-count.mjs` -- the pattern that already works for
  one governance figure on this site: a sweep script writes a checked-in JSON
  snapshot, the page reads the snapshot at build time, and a check asserts
  the rendered page still matches the file. Extend this pattern rather than
  inventing a second one; a `next build` does not have live network access to
  the GitHub API in this project's CI, so "computed at build time" means "the
  build reads a snapshot a sweep produced," the same way it already does for
  the one-limit count.
- `app/lib/loop-history.json` + `scripts/check-loop-history-snapshot.mjs` --
  the pattern for the staleness half: a `taken_at` field, a window in
  `policy.yml` (`staleness_days.process_claim`, 30 days), and a build-time
  check that fails if the snapshot is older than the window. This is the
  shape for "say the figures are as of the last successful measurement and
  when that was, never serve stale numbers as current" -- it does not need
  inventing, only reusing for a new snapshot.
- `scripts/staleness-report.mjs` -- reads `process_claim`'s window already;
  a new snapshot class registered there gets the preflight interrupt for
  free if a sweep goes stale, the same way every other process claim does.

## Done when

- [ ] A sweep script (modelled on `scripts/sweep-one-limit-count.mjs`) reads
      the GitHub API and writes a checked-in snapshot carrying: pull request
      count, merged count, count with any GitHub review, revert count on
      `main`, commit count and its split between the maintainer's own
      account and separate GitHub App identities, the closed-not-merged
      count, and a `measured_at` timestamp. NOT "the loop's account" --
      verified 2026-08-22 (`gh api user --jq '.login + .id'` against every
      commit author's email) that the account authoring all 278 non-bot
      commits is the maintainer's own personal GitHub account, not a
      separate machine identity; a dedicated machine account
      (`addicted2ai-loop`) exists and authenticates `git push`, but has
      authored zero commits on `main`. Whoever builds this must not
      reintroduce the framing this round shipped and then corrected -- see
      CHARTER.md's History and CHANGELOG.md, both 2026-08-22, for the full
      account and why it matters (account attribution cannot show a model
      did this work, only that the maintainer's own account did, by name --
      which is true whether the maintainer or the automated loop process
      committed under it).
- [ ] `/charter` (or the method-claim passage specifically) renders these
      figures from the snapshot, not from hand-typed prose in `CHARTER.md` or
      the page itself
- [ ] The caveats this round wrote into "The second demonstration" render on
      the same page as the figures, not linked from it -- re-read them from
      `CHARTER.md` at build time rather than re-typed here, since this item
      is filed before that text's final wording is settled and a copy here
      would drift from it
- [ ] If the sweep is stale past its window (`policy.yml`
      `staleness_days.process_claim` or a dedicated key), the page says the
      figures are as of the last successful measurement and states that date,
      rather than silently rendering old numbers as current
- [ ] A check (modelled on `scripts/check-one-limit-count.mjs` /
      `scripts/check-loop-history-snapshot.mjs`) fails the build if the
      rendered figures disagree with the snapshot, or if the snapshot is
      malformed
- [ ] Proved: the sweep run against the real API, its output pasted, and the
      page shown rendering exactly that output
