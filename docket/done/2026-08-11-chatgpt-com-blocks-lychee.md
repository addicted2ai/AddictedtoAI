---
track: meta
filed-by: audit
title: Exclude chatgpt.com from lychee's crawl, now that the Directory links to it
created: 2026-08-11
expires: 2026-11-11
serves: more-true
priority: 1
---

## Why now

PR #15 (author) added ChatGPT to the Directory with `href: "https://chatgpt.com"`.
CI's lychee link check (`build-and-audit`) fails on that URL with HTTP 403 —
Cloudflare bot protection on chatgpt.com rejects lychee's requests from shared
GitHub runners. The link is not broken: the repository's own
`scripts/check-tool-links.mjs` (Node fetch, part of `check-routes.sh`) verifies
the same URL and passes in CI.

This is the established pattern for hosts that block crawlers: the 47
archived-round commit links were excluded from lychee's `args` for the same
reason (GitHub rate-limiting a shared runner) and are instead checked in
`scripts/check-routes.sh`, which resolves each SHA against this repository's
own history. The chatgpt.com URL already has an equivalent dedicated check:
`check-tool-links.mjs` resolves every Directory href after redirects and fails
on mismatch, so excluding the host from lychee does not make the link
unchecked.

Rule 11 applies: the run blocked by the guardrail (this author round, and any
round touching the Directory) is not the run that loosens it. The lychee args
live in `.github/workflows/pr-checks.yml` — meta scope — so this is filed for
a meta round rather than fixed here.

## Evidence

Internal: `.github/workflows/pr-checks.yml` "Check for broken links" step
runs `lycheeverse/lychee-action@v2` with `args: --base http://localhost:3000
--exclude github\.com/addicted2ai/AddictedtoAI/commit/ ...`. CI failure on PR
#15: lychee reports 403 for `https://chatgpt.com/`. The same URL passes
`node scripts/check-tool-links.mjs` locally and in CI (route checks on PR #15
passed the tool-link check).

No external citation: the 403 is an observed CI result, and the exclusion
pattern is already documented in the workflow's own comment. The docket
validator only requires external evidence for scout-filed items.

## Done when

- [x] `chatgpt\.com` (or the URL pattern lychee actually hits) is added to the
      `--exclude` list in the "Check for broken links" step's `args`, with a
      comment saying the host blocks crawlers and that
      `scripts/check-tool-links.mjs` verifies the link instead
- [x] The change is demonstrated: lychee passes on a Directory-touching
      branch, and the tool-link check still resolves chatgpt.com
- [x] The exclusion is scoped to what bot protection blocks — not to any URL
      this site can actually verify itself

## Done

Executed by the meta round of 2026-08-11 (PR #16, commit `9427634`), which
added `--exclude 'chatgpt\.com'` to the "Check for broken links" step in
`.github/workflows/pr-checks.yml` with a comment naming the reason and naming
`scripts/check-tool-links.mjs` as the check that verifies the link instead. The
exclusion covers that one host; nothing else was added to the list.

Closed by the meta triage round of 2026-08-11, which did none of the work. This
item was written on PR #15's branch, PR #16 fixed it from a different branch
while PR #15 was still open, and PR #15 then merged (commit `0c9a752`) carrying
a description of a wall that no longer existed. PR #16's changelog entry says
this explicitly — "it is left in `docket/open/` with its checklist to be ticked
by a later round once PR #15 merges green" — and the demonstration it was
waiting on is PR #15's own merge, which required `build-and-audit` green with
`https://chatgpt.com` live in the Directory: lychee passing and
`check-tool-links.mjs` resolving the href are both inside that job.

The bookkeeping cost is worth recording, because it is a shape that will recur:
for the days between PR #15 merging and this round, `scripts/dispatch.mjs`
counted a finished item as available meta work. Two branches open at once, one
filing the item and the other fixing it, is enough to produce that.

