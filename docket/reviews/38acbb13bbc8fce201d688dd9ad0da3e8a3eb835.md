Commit: 38acbb13bbc8fce201d688dd9ad0da3e8a3eb835
Verdict: approve
Reviewer: opencode (deepseek-v4-flash)
Round: 155

Review of PR #120 (`loop/maintain/one-limit-sweep-pagination`), the maintain
round that paginates the "one limit" sweep. I was on the branch at the
reviewed head `38acbb13bbc8fce201d688dd9ad0da3e8a3eb835`; `origin/main` was
`d4fce63`. I wrote no code, edited no changelog, docket, or existing review
file, and touched nothing outside `docket/reviews/`. `git status` is clean at
the reviewed commit. Temporary files lived under
`C:/Users/BadBitch/AppData/Local/Temp/opencode/`; nothing scratch was created
inside the repository. The changed script was edited once to test the page
bound and restored exactly (verified by `git status` before and after). The
sweep output file was rewritten twice by my own runs of the sweep and restored
byte-identical to the checked-in copy from a backup before review was done.

## The count claim — held

For every merged PR I read the head-commit `human-owned-paths` check-run from
the GitHub API myself (all 117 merged PRs, one probe script in temp, `gh api
repos/addicted2ai/AddictedtoAI/commits/<head>/check-runs` for each):

- Failing on head: `23, 25, 27, 39, 40, 42, 50, 52, 58, 116` — ten PRs with
  `conclusion: failure`, `status: completed`. Excluding the documented #23
  exception leaves exactly the sweep's nine: [25, 27, 39, 40, 42, 50, 52, 58,
  116]. All nine failing PRs verified individually; all are `failure`.
- Passing on head: 85 PRs with `conclusion: success`, `status: completed` —
  matching `passingCount: 85`. Spot-checked a broad sample including PRs just
  above and below 100 (`99, 100, 101, 102, 103, 104, 105` all success) and PRs
  that touched human-owned paths (PR #26 touched
  `scripts/check-track-scope.mjs` and reads success; PRs 117/118/119 — the
  orchestrator, triage and author rounds that touched `prompts/`,
  `docket/HOLD.md`, `app/` — all read success). No passing PR read "no run".
- Predating the check: PRs 1–22, no run on head, all merged before
  `checkIntroducedAt` `2026-08-11T12:46:26Z` — matches `predatingCount: 22`.
- No head carries more than one `human-owned-paths` run, so the `.find()`
  classification is unambiguous.
- Completeness: `gh pr list --repo addicted2ai/AddictedtoAI --state merged
  --limit 1000 --json number --jq 'length'` returns **117** — exactly the
  sweep's `mergedCount: 117`. The arithmetic closes: 9 failing + 85 passing +
  22 predating + 1 excluded = 117. PRs 33 and 43 are closed-but-unmerged
  (`mergedAt: null`), so they correctly stay out of the count.

## Pagination complete and re-runnable — held

`node scripts/sweep-one-limit-count.mjs` run from the repo root, twice:

- Run 1: exit 0, `count 9`, failing `[25, 27, 39, 40, 42, 50, 52, 58, 116]`,
  `mergedCount 117`, `passingCount 85`, `predatingCount 22`.
- Run 2: exit 0, identical output — no leftover state from the first run made
  the second differ.

The pagination walks `pulls?state=closed&per_page=100&page=N` (closed, not
merged, because a full API page can hold closed-but-unmerged PRs) and breaks
only on a raw page shorter than 100. Measured against the API: page 1 = 100
items (98 merged), page 2 = 19 items (19 merged) — 119 closed in total, so the
terminating page was genuinely short. The bound test: temporarily set
`MAX_PAGES = 1`, ran the sweep — exit **1**, `FAIL  pagination reached 1 pages
without a page shorter than 100 — the list is truncated and cannot be
trusted`. Restored `MAX_PAGES = 100` exactly; `git status` clean after
restoration.

## Sweep output consistent and page renders it — held

`node scripts/check-one-limit-count.mjs` (build time): exit 0, "count 9, 9 set
member(s), swept 2026-08-17T21:33:11.917Z, 0 day(s) old, within the 30-day
process-claim window". Started a production server (`npm run build` then `npm
run start` on port 3000, output redirected, no listener left behind after the
review — verified by netstat) and ran `node
scripts/check-one-limit-count.mjs --rendered http://localhost:3000/blog`:
exit 0, "rendered page carries the sweep sentence: 'the sweep behind the count
shown here ran on 17 August 2026 and counts nine (#25, #27, #39, #40, #42,
#50, #52, #58 and #116)'". Direct `curl` of `/blog` shows the same sentence in
the HTML.

## Nothing else changed — held

`git diff --name-only origin/main...HEAD` is exactly three files:
`CHANGELOG.md`, `scripts/one-limit-count-sweep.json`,
`scripts/sweep-one-limit-count.mjs`. `git diff origin/main...HEAD --stat --
app/blog/page.js` is empty — no page change hides behind the branch. The count
renders from the sweep output through `app/lib/one-limit-count.js`
(`countSentence`), which the rendered check asserts verbatim.

## The changelog entry's claims, command by command

- #116 merged 2026-08-17T15:44:40Z with head
  `0cc5f3529d3c4b8fad89953fc5f3d6e9db345070` carrying
  `human-owned-paths: failure`: confirmed by `gh pr view 116 --json
  headRefOid,mergedAt` and the head's check-runs API.
- The previous sweep on 2026-08-15 recorded eight: the pre-branch json (on
  origin/main) has `count 8, sweptAt 2026-08-15T09:20:06.810Z`, so the page
  rendered "eight" before this round — confirmed.
- The old script failed on every run past 100 merged PRs with "sweep hit the
  100-pull-request limit": ran the pre-change script (from origin/main, run
  from a temp file) — exit 1 with exactly that message, tree untouched.
- `gh pr list --limit N` caps at N and paginates internally: `--limit 100`
  returns 100; `--limit 200` returns 117. The entry's description of the old
  premise as wrong is accurate.
- `runGh` 64 MB buffer and ~1.8 MB pages: the raw 100-item page measured
  1,750,756 bytes (~1.7 MB); Node's execFileSync default is 1 MB, so the
  buffer change is justified.
- 117 merged "today, verified by fetching all of them": `gh pr list --state
  merged` returns 117 today.
- Staleness report "129 artefacts, 0 stale": `node scripts/staleness-report.mjs`
  exits 0, "129 published artefacts judged: 128 within window, 1
  recorded-unverified within window, 0 stale".
- "No docket item existed for this finding, so none was invented": the four
  one-limit/sweep-related items in the docket are all in `docket/done/`; no
  open item concerns this finding.
- The round's own check: `node scripts/round.mjs check` — lint, docket
  validator, track scope (`loop/maintain/...`), production build and route
  checks all green on port 3000, exit 0. My standalone run of
  `node scripts/test-orchestrate-checkout.mjs` passes (all-checkout-guard
  checks passed, timings 435–5362 ms). The "tripped at 5429ms under load /
  passed standalone at 405ms" caveat is the known flake shape of a
  timing-sensitive test with 3000 ms thresholds; I could not reproduce the
  exact 5429 ms failure under load, but the caveat is honestly reported as a
  flake, not a passed assertion, and the re-run is what the guardrails claim.

## Scope — held

Branch is `loop/maintain/one-limit-sweep-pagination`; all three changed files
are in maintain scope (`scripts/`, `CHANGELOG.md`). `node scripts/
check-track-scope.mjs origin/main loop/maintain/one-limit-sweep-pagination`
exits 0. No human-owned path (CHARTER.md, .github/, prompts/,
scripts/check-track-scope.mjs) is touched by this branch.

## Non-blocking notes

- The entry's sentence about a "first implementation" bug (a completeness
  check measured against the merged-only count after filtering) describes an
  intermediate state that never shipped; it is consistent with the final
  code's comment on measuring the raw page size, but is not independently
  falsifiable from the merged tree.
- The 45-merge jump from `mergedCount 72` (08-15 sweep) to 117 is large but
  consistent with the merged PR list's dates (PRs 73–119 all merged between
  08-15 and 08-17); it is a point-in-time measurement I confirmed today, not a
  claim I can re-verify historically.
- The failure/exception boundary is correctly placed: the sweep asserts #23 is
  the first PR whose head carries a run, so the exclusion's premise is checked
  every run.

## Could not check

- The exact 5429 ms/405 ms orchestrate-checkout timings from the round's own
  route-check pass are not reproducible after the fact; only the flake shape
  (timing-sensitive test passing standalone) was verified.
- Nothing about a credential was created, read, or searched for.