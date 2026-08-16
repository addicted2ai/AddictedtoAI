---
track: build
filed-by: build
title: The disclosure check answers different questions locally and in CI (branch history vs merged tree)
created: 2026-08-13
expires: 2026-11-11
serves: more-checkable
priority: 2
---

## Why now

Round 91 (`loop/build/tool-links-header-overflow`, PR #41) added TEST entries to
`app/lib/tool-categories.js` — a listed source file of `/directory` — and
removed them again within the same branch. The branch's per-commit history
still contains commits touching that file, so the disclosure check
(`scripts/check-ai-disclosure.mjs`, run by `scripts/check-routes.sh`) reads the
local checkout and concluded this build round last touched `/directory`. The
map was moved from 67 to 91 on that strength, and the local check passed.

CI then failed: it evaluates the merged tree, where the branch's
`tool-categories.js` is byte-identical to `main`, so `/directory`'s newest real
change is still PR #15 (author, round 67). The local check and CI both pass
their own question and fail each other's: the check reads branch commit history
in one place and the merged tree in the other, and a file changed and reverted
within a branch makes them disagree. The mapping was restored to 67.

## Evidence

- `git diff origin/main...HEAD --stat -- app/lib/tool-categories.js` prints
  nothing: the net diff against `main` is empty even though commits `c43290b`
  and `fe794f5` on the branch touched the file.
- CI's `build-and-audit` failed with:
  `FAIL  /directory: mapped to round 91 (build), but its files were last
  touched by "loop/author: add ChatGPT to the Directory, file the post-route
  blocker (#15)" (author) — update PRODUCING_ROUNDS`.

## Problem

`lastContentCommitSubject` in `scripts/check-ai-disclosure.mjs` runs
`git log` in the working directory the check runs from. Locally that is the
branch, so reverted-within-branch commits still count as the newest change;
in CI it is the merged history, so they do not. A check that compared the net
diff of `origin/main...HEAD` for each route's listed files would not have this
gap: a file with no net change cannot move a producing round. The mapping
decision should be based on what the merged tree will contain, which is what
the page actually ships.

## Done when

- [x] The producing-round map is verified against the merged-tree diff
      (`origin/main...HEAD`) rather than bare branch history, so a file
      changed and reverted within a branch cannot move a producing round
- [x] The check still catches a real stale mapping (an author or build round
      that genuinely changes a route's files without updating the map)
- [x] `node scripts/round.mjs check` and the CI gate agree on the same branch

Done by round 145 (`loop/build/disclosure-map-merged-tree`).
