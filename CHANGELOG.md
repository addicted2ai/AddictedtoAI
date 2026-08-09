# Changelog & Loop Log

This file is the loop's memory. Every entry records a hypothesis, what
shipped, and — the following week — whether it actually moved the metric.
The weekly proposal step reads this file before deciding what to try next,
so keep entries short and honest, including the failures.

## North star
Returning-visitor rate (site-wide).

## Section metrics
- Blog: organic search traffic, avg. read time, scroll depth
- Directory: outbound clicks to tools, on-site search usage
- Projects: inquiry/contact clicks, outbound repo clicks, time on page
- Demos: completion rate, repeat-use rate, session length

## Guardrails (never regress these)
- Lighthouse: performance >= 0.80, accessibility / SEO >= 0.85 —
  each asserted against the median of 3 runs (see `lighthouserc.json`).
  Performance's floor was lowered from 0.85 and runs went from 1 to 3
  with median scoring on 2026-08-09 after single-run performance scores
  proved too noisy on shared CI hardware to gate on reliably (the same
  untouched homepage scored 0.83 then 0.74 back to back). Accessibility
  and SEO are static-analysis checks, not timing-based, so they weren't
  the noisy ones and stayed at 0.85.
- Zero net-new broken links
- No failed deploy / rollback

---

## Log

### Unreleased
- Hypothesis: Projects was the last remaining placeholder section.
  Its metrics (inquiry/contact clicks, outbound repo clicks, time on
  page) all need a real write-up with real actions to click, which a
  one-line placeholder can't produce. The only project this loop can
  write about truthfully, without inventing a portfolio, is
  AddictedtoAI.net itself — same reasoning as the blog post.
  Two details needed a human decision first (asked before building):
  the site's own repo is private, so there's nothing to link for
  "outbound repo clicks" without it 404ing for visitors; and there was
  no contact channel yet for "inquiry clicks." Given the answers (link
  the GitHub profile instead of the repo; use a dedicated
  AddictedtoAI@proton.me address rather than the personal email), a
  real write-up with working outbound actions should move time on
  page and give both click metrics something to register for the
  first time.
- Change: Replaced the Projects placeholder in `app/projects/page.js`
  with a write-up of the site itself — the idea, how the loop
  works (linking to the blog post rather than repeating it), and the
  stack — plus a `project-actions` row with two outbound
  actions: a `mailto:AddictedtoAI@proton.me` link and a link to
  github.com/addicted2ai. Reused the `article` typography added for
  the blog post; added `project-actions`/`project-action` styles to
  `app/globals.css` for the CTA row. (PR #TBD)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes.
  Confirmed via lychee's own docs that mail-address checking is
  opt-in via `--include-mail`, which `pr-checks.yml` doesn't pass, so
  the mailto link isn't validated by CI at all — also confirmed
  proton.me has valid MX records regardless. GitHub profile link
  verified 200.)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Blog is the last section still showing the placeholder
  note (Projects is too, but picking one at a time). Its metric,
  organic search traffic, needs something indexable and worth reading
  — a one-line placeholder gives search engines and visitors nothing.
  Rather than invent generic "AI news" commentary (stale fast, easy to
  get wrong, not something this loop can responsibly write without a
  human's editorial voice), the more honest and differentiated post is
  a first-person, fully accurate explanation of how this site itself
  gets built: the weekly propose-build-measure loop, the guardrails,
  and what's shipped so far. It's real content this loop can write
  truthfully (it's describing its own documented process), it's a
  genuinely unusual angle for search ("a site that builds itself"),
  and a substantive single post gives Blog's other metrics (avg. read
  time, scroll depth) something to actually measure.
- Change: Replaced the Blog placeholder in `app/blog/page.js` with a
  single real post, "How this site builds itself," covering the loop
  mechanics, the guardrails, and a recap of the three changes shipped
  so far (PR #1-#3). Added minimal typography styles (`post-meta`,
  `article h2/p/ul/li/code/a`) to `app/globals.css` — the site had no
  prose styling yet since every prior page was short fragments or
  cards. First draft linked out to the GitHub repo as "public"; caught
  in the local link check that the repo is actually private (404 for
  an unauthenticated visitor, not just the crawler), so that claim and
  link were removed before opening the PR. (PR #4)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes, including
  the one broken link caught and fixed pre-PR as above)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Demos is the last of the four sections still showing the
  placeholder note — the same dead-end problem that motivated last
  week's Directory change. Its documented metrics (completion rate,
  repeat-use rate, session length) all require something a visitor can
  actually finish and replay, which a static placeholder can never
  produce. Adding one small, fully client-side interactive demo — a
  "Tool Finder" that asks what you're trying to do and recommends real
  tools from the Directory — gives Demos a real completion event
  (reaching a recommendation), a natural replay loop ("try another
  category"), and a second real cross-section link (Demos to
  Directory) reinforcing the session-depth bet from two weeks ago. This
  should move Demos' completion rate and repeat-use rate, and modestly
  add to Directory's outbound-click numbers.
- Change: Extracted the tool data from `app/directory/page.js` into a
  shared `app/lib/tool-categories.js` module (single source of truth so
  Demos and Directory can never recommend different tools). Replaced
  the Demos placeholder with a client component (`"use client"`) quiz:
  pick a category, see two recommended tools plus a link to the full
  category in the Directory, with a "try another category" reset.
  Added matching `finder`/`finder-option`/`finder-result` styles to
  `app/globals.css`. No new external links: the tool-card recommendations
  only render after a click, so they never appear in the static HTML
  the guardrail crawls. (PR #3)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes — the
  Demos page's static HTML has zero new outbound links, only the
  page's own JS chunk, so this change carries none of the external-link
  risk the last two did)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Last week's change sends real clicks from `/` into
  `/directory`, but the Directory page was still a placeholder note —
  visitors who followed that new entry point landed on a dead end with
  nothing to click. The Directory page's own metric (outbound clicks to
  tools) can't move at all without real tools on the page, and a dead
  end right after the homepage funnel undercuts the session-depth gain
  that change was betting on. Replacing the placeholder with a real
  curated list of AI tools, grouped by category, with outbound links,
  should increase outbound clicks to tools and entries browsed per
  session, both leading indicators for returning-visitor rate.
- Change: Replaced the Directory placeholder with 12 real tools across
  4 categories (Chat & Assistants, Coding, Image/Video/Audio, Workflow
  & Data), each an outbound link opened in a new tab
  (`target="_blank"`) so browsing the directory doesn't cost the
  session. Added matching `tool-category`/`tool-grid`/`tool-card` styles
  to `app/globals.css`. (PR #2)
- Guardrails: pass after one round-trip through CI (local `next build`
  clean; all 12 outbound links plus every existing internal link
  verified 200 with a local link check against the production build
  before opening the PR — one candidate, Notion, was dropped locally
  after it came back 403 from bot protection and was swapped for
  Zapier). The actual CI Lychee run then failed on Gemini
  (`gemini.google.com`) with an HTTP/2 protocol error — a known lychee
  quirk on Google-fronted domains that a local link check couldn't
  reproduce (curl and Node-based checkers negotiate HTTP/2 differently
  and don't trip it). Swapped Gemini for You.com and re-pushed.
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The homepage was a placeholder with no real entry points
  into the four sections (nav links only). Visitors landing on `/` had
  no on-page reason to explore more than one section, and session depth
  (sections visited per session) is a leading indicator for the
  north-star metric, returning-visitor rate. Replacing the placeholder
  copy with four clickable section cards (title + one-line value prop)
  should increase clicks from `/` into `/blog`, `/directory`,
  `/projects`, and `/demos`, which should in turn lift returning-visitor
  rate.
- Change: Replaced the placeholder homepage body with a `section-grid`
  of four `section-card` links (one per section, matching the metrics
  already documented per-section), styled to match the existing dark
  theme. (PR #1)
- Guardrails: pass (local `next build` clean; no new links beyond the
  four existing section routes, all already covered by nav)
- Result (measured the following week): not yet measured

<!--
Entry template for future weeks:

### YYYY-MM-DD
- Hypothesis: <what we expected and why>
- Change: <what was actually shipped> (PR #N)
- Guardrails: pass/fail
- Result (measured the following week): <metric delta, or "not yet measured">
-->
