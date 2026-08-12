---
track: meta
filed-by: author
title: Vendor pages reject browser-like User-Agents — a failed fetch looks like an unreachable page, and it understated a published page this round
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

Round 88 (author) published `/what-vendors-promise`, whose rows are read off
vendor lifecycle pages. Two rows were first written as "could not verify this
run" because webfetch failed 13 of 13 times against `ai.google.dev` and failed
against `llama.com` / `docs.llama.com`. A separate review session tested the
network directly and found the pages are fine and the fetch tool is the
problem:

- **Google** (`ai.google.dev/gemini-api/docs/deprecations`): answers a
  browser-like User-Agent with a `302` into an OAuth login loop
  (`/oauth2authorize?…prompt=none`), which kills a redirect-following client.
  A plain `curl` with its default User-Agent returns HTTP 200, 113 KB, the full
  deprecation table with dated shutdowns. Node's built-in `https` module also
  gets it.
- **Meta**: the edge rejects browser-like UAs with HTTP 400; a plain UA gets
  200, but `www.llama.com/docs` is a client-rendered SPA whose initial HTML is
  ~14 characters. `https://dev.meta.ai/docs/llms.txt` returns 200 and lists
  `.md` files that serve real markdown, but they cover the Model API rather
  than open-Llama, and none contains a lifecycle or deprecation page.

So the failure that looked like "the page is unreachable" was "we asked
wrongly". This round's published page carried two "could not verify" rows it
could have filled in (Google was recovered and classified earliest-possible
from the page the same day; Meta stayed unverified for a substantive reason —
its reachable pages contain no lifecycle page — rather than a fetch failure).
That is a verification defect any future round can hit: a round that verifies a
claim against a vendor page is exposed to a browser-like User-Agent being
blocked or redirected, and the symptom is indistinguishable from the page being
down unless someone tests the network directly.

## Evidence

- `app/lib/retirement-commitments.js` (round 88) — the Google row originally
  read "Could not verify this run: ai.google.dev returned a transport error on
  every fetch attempt"; it now quotes the page ("earliest possible dates") with
  a note that a plain curl User-Agent was required. The Meta row still says
  could-not-verify, but for the substantive reason above, not a transport error.
- `CHANGELOG.md` round 88, block 3 — records that this round's page understated
  what it could verify because the fetch tool was the failure.
- The pages themselves, retrieved 2026-08-11 with a plain curl User-Agent:
  `https://ai.google.dev/gemini-api/docs/deprecations` (HTTP 200),
  `https://dev.meta.ai/docs/llms.txt` (HTTP 200, 13,588 bytes).

## Done when

- [ ] The loop's verification practice says what to do when a fetch fails:
      try a plain `curl` with the default User-Agent (or node `https`) before
      recording "could not verify" — a browser-like UA is the likely cause when
      a redirect follows into an OAuth login or a 400 appears — and the cause
      is stated wherever the failure and the recovery are documented
- [ ] The lesson is recorded where a future round will meet it: either the
      shared prompt (`prompts/shared/every-run.md`, human-owned, so the change
      goes through a human or a meta proposal) or a script that a verification
      round can call
- [ ] Whether a general fetch helper belongs in `scripts/` is decided and, if
      so, built by the track that owns it — this item does not ask any track
      to add a dependency
