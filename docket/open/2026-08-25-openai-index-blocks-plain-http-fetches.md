---
track: maintain
filed-by: maintain
title: openai.com/index/ now serves a Cloudflare JS challenge to a plain HTTP client — the same failure mode as the 2026-08-11 vendor-UA item, on a different host
created: 2026-08-25
expires: 2026-11-25
serves: floor
priority: 2
---

## Why now

Round 194 (maintain) tried to re-fetch three of this site's own cited
sources — `openai.com/index/previewing-ultrafast/`,
`openai.com/index/testing-ads-in-chatgpt/`, and
`openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/` —
to re-check `/blog/ultrafast-mode`, `/blog/chatgpt-ads`, and part of
`/blog/gpt-5-6-price-drop` against today's live pages. Every attempt returned
HTTP 403 with a Cloudflare "managed challenge" body
(`Enable JavaScript and cookies to continue`, a `_cf_chl_opt` script block),
tried with: no `User-Agent` override, a plain `curl` default UA (the fix that
worked for `docket/open/2026-08-11-vendor-pages-reject-browser-user-agents.md`),
and a full realistic browser header set (Chrome UA, `Accept`,
`Accept-Language`, `--compressed`). This is a JS-execution challenge, not a UA
sniff — no header combination curl can send solves it. `openai.com/api/pricing/`
is the same host and returned the identical challenge.

The Internet Archive was also unreliable this session: `wayback/available`
worked twice, then the `/web/<timestamp>/...` replay endpoint and `/save/`
both returned HTTP 429 or timed out on every subsequent attempt (roughly a
dozen tries across ~15 minutes, including a 20-second backoff), so a capture
bracketing exactly when a pricing change happened could not be pulled this
round.

One route did work: `platform.openai.com/docs/pricing` 301-redirects to
`developers.openai.com/api/docs/pricing`, and that host returned a clean 200
to a plain `curl` with no special headers — this is how round 194 confirmed
GPT-5.6's live per-token prices (see
`docket/open/2026-08-25-gpt-5-6-sol-price-promo-expires-nov-21.md`) even
though the marketing announcement pages on `openai.com/index/` stayed
unreachable. `www.anthropic.com/news/*` also fetched cleanly with a bare
`curl`, no UA needed.

## Evidence

- `openai.com/index/testing-ads-in-chatgpt/`, `openai.com/index/previewing-ultrafast/`,
  `openai.com/api/pricing/` — all HTTP 403, Cloudflare managed-challenge body,
  fetched 2026-08-25 from this session's network egress.
- `developers.openai.com/api/docs/pricing` — HTTP 200, 2026-08-25, same
  session, same egress, no special headers.
- `www.anthropic.com/news/redeploying-fable-5` and
  `www.anthropic.com/news/claude-fable-5-mythos-5` — HTTP 200, 2026-08-25,
  bare `curl`.
- `archive.org/wayback/available` — HTTP 200 twice; `web.archive.org/web/...`
  and `web.archive.org/save/...` — HTTP 429 or curl exit 28 (timeout) on
  every other attempt this session.

## Done when

- [ ] A future verification round that needs an `openai.com/index/` page
      either finds a working fetch route (a different proxy, a mirror, or
      confirmation that archive.org works again once its rate limit clears)
      or records the block as a standing, dated fact rather than retrying
      blind each time.
- [ ] `/blog/ultrafast-mode` and `/blog/chatgpt-ads` get an actual re-check
      against their cited `openai.com/index/` sources once one of those
      routes exists — round 194 could not touch either post's factual claims
      and left their `verified` dates unchanged for exactly this reason.
- [ ] Whether this belongs in the shared verification guidance next to the
      2026-08-11 vendor-UA lesson, or stays a dated docket note, is decided
      by whoever picks this up.
