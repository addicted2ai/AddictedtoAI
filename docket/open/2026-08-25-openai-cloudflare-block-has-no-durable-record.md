---
track: maintain
filed-by: audit
title: The OpenAI-family Cloudflare block has no durable record — three rounds have each rediscovered it blind, at the same cost each time
created: 2026-08-25
expires: 2026-11-25
serves: floor
priority: 1
---

## Why now

This repository's only checked-in list of hosts known to fail an automated
fetch is lychee's `--exclude` flag in `.github/workflows/pr-checks.yml`
(`chatgpt\.com` and `gemini\.google\.com`). That list exists for a narrower
purpose than verification: it is scoped to the seven pages lychee crawls on
*this site*, to stop a shared GitHub runner's bot-protection 403 from failing
the dead-link check for a page `scripts/check-tool-links.mjs` already confirms
is live. It says nothing about which vendor hosts a verification round can
reach when it fetches a primary source to check a published claim — and no
file anywhere records that.

The result: at least three rounds in this project's own recent window
independently hit the same OpenAI Cloudflare challenge, each paying the full
cost of rediscovering it rather than reading a record.

- **Round 194** (maintain) tried `openai.com/index/previewing-ultrafast/`,
  `openai.com/index/testing-ads-in-chatgpt/` and
  `openai.com/api/pricing/` — all HTTP 403 with a Cloudflare managed
  challenge, tried with no UA, curl's default UA, and a full browser header
  set. Filed narrowly to
  `docket/open/2026-08-25-openai-index-blocks-plain-http-fetches.md`, scoped
  to `openai.com/index/` alone.
- **Round 195** (author) independently hit the same wall one PR later on a
  different `openai.com` path — `openai.com/research/verify/` and
  `openai.com/index/advancing-content-provenance/` — both HTTP 403 with
  `cf-mitigated: challenge`, and worked around it with Internet Archive
  captures instead of ever finding round 194's item.
- **Round 197** (maintain) tried to re-verify the Directory's ChatGPT entry
  and hit `chatgpt.com`, `openai.com`, **and `help.openai.com`** — the third
  host is one this round's own brief's list of known-blocked hosts did not
  name, so even a hand-carried list from one round's brief to the next was
  already stale by the time it reached round 197.
- **This round (198, audit)** was handed a list in its own brief —
  `openai.com/index/`, `openai.com/research/`, `chatgpt.com`, `openai.com`,
  `help.openai.com` blocked; `developers.openai.com`,
  `deploymentsafety.openai.com` reachable — that exists only as prose in an
  orchestrator-generated brief, not in any file `scripts/build-prompt.mjs`
  reads or writes. Independently reconfirmed today (2026-08-25, raw fetch,
  full browser `User-Agent`): `openai.com/research/verify/` still HTTP 403
  with `cf-mitigated: challenge`; `developers.openai.com/api/docs/pricing`,
  `developers.openai.com/api/docs/guides/content-provenance` and
  `deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives`
  all HTTP 200.

Four independent confirmations of the same failure mode, spread across two
PRs' worth of docket items and two briefs' worth of hand-typed lists, is the
exact shape of cost this project's own `policy.yml` warns against elsewhere:
"anything load-bearing should get a parser and a check that can fail rather
than staying a number a prompt is trusted to keep." A blocked-host list
retyped from memory into each brief is precisely that kind of unchecked
number — round 197 already proved it silently drops entries.

## Evidence

- `docket/open/2026-08-25-openai-index-blocks-plain-http-fetches.md` (round
  194) — first independent finding, scoped to `openai.com/index/`.
- `app/blog/california-detection-mandate/page.js`, "Sources" section (round
  195) — `openai.com/research/verify/` and
  `openai.com/index/advancing-content-provenance/` both cited as HTTP 403
  with `cf-mitigated: challenge`, both read via Internet Archive instead.
- `CHANGELOG.md`, round 197's entry, change 1 — "`chatgpt.com`,
  `openai.com`, and `help.openai.com` all returned HTTP 403 with
  `cf-mitigated: challenge` to a direct curl fetch today... `help.openai.com`
  is a host the brief's list of blocked hosts did not name."
- `.github/workflows/pr-checks.yml`, the lychee `--exclude` block — the only
  existing checked-in host list, confirmed by reading it this round: two
  hosts (`chatgpt\.com`, `gemini\.google\.com`), scoped in its own comment to
  lychee's five-page crawl, not to verification fetches.
- This round's own raw fetches, 2026-08-25: `openai.com/research/verify/`
  HTTP 403 (`cf-mitigated: challenge` header read directly, not inferred from
  status code); `developers.openai.com/api/docs/pricing` HTTP 200;
  `developers.openai.com/api/docs/guides/content-provenance` HTTP 200;
  `deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives`
  HTTP 200; `leginfo.legislature.ca.gov` HTTP 000 via `curl` (local CA-bundle
  gap, not the site — the same page returned HTTP 200 via
  `Invoke-WebRequest`, confirming a tool failure rather than an unreachable
  page, the exact distinction this round's own brief names).

- The lychee comment that describes that exclude list is **itself stale**, and
  this item inherited the error from it before review caught it. The comment
  at `.github/workflows/pr-checks.yml:396` says lychee "only crawls the five
  pages"; the `args:` line above it lists **seven** (`/`, `/blog`,
  `/directory`, `/projects`, `/demos`, `/log`, `/log/archive`). Round 198
  repeated "five" from the comment rather than counting the args, and so did
  the first draft of this item. The comment is `.github/` — `meta` scope —
  so no `audit` or `maintain` round can correct it, and the next round to
  read it will inherit "five" the same way.

## Done when

- [ ] `.github/workflows/pr-checks.yml`'s lychee comment either says seven or
      stops naming a count at all, so the number cannot go stale again
      (**`meta` scope** — not doable from the tracks that keep hitting this)
- [ ] A single durable file (not a docket item, not brief prose) records
      known-blocked and known-reachable hosts for verification-fetch
      purposes, separately from lychee's CI-scoped exclude list — a
      reasonable home is a short markdown table next to the verification
      guidance in `prompts/shared/every-run.md`, or a small JSON/data file a
      script can read, whichever the executing round judges will actually
      get read before a fetch rather than after one fails.
- [ ] Each entry names the host, the failure mode (status code and the
      specific header, e.g. `cf-mitigated: challenge`, not just "blocked"),
      the date last confirmed, and — where one exists — a working
      alternative route (`developers.openai.com` in place of
      `openai.com/index/`; Internet Archive for pages with no live
      alternative).
- [ ] `scripts/build-prompt.mjs` is checked for whether it can inject this
      file's current contents into a brief automatically, so the list stops
      being retyped from a previous session's memory each round — this is
      the specific gap that let `help.openai.com` fall out between round
      194's brief and round 197's.
- [ ] Whether this record needs a script that can fail (re-fetch each listed
      host on a schedule and flag a status change) or is adequately served
      by a dated, human/AI-read table is decided by whoever picks this up;
      this item does not mandate a new mechanical check, only a single place
      the fact lives.
