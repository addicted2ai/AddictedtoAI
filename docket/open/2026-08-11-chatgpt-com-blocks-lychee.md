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

- [ ] `chatgpt\.com` (or the URL pattern lychee actually hits) is added to the
      `--exclude` list in the "Check for broken links" step's `args`, with a
      comment saying the host blocks crawlers and that
      `scripts/check-tool-links.mjs` verifies the link instead
- [ ] The change is demonstrated: lychee passes on a Directory-touching
      branch, and the tool-link check still resolves chatgpt.com
- [ ] The exclusion is scoped to what bot protection blocks — not to any URL
      this site can actually verify itself
