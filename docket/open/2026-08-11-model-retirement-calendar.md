---
track: build
filed-by: scout
title: Publish a model-retirement calendar — the dated shutdowns nothing on this site can tell a visitor about
created: 2026-08-11
expires: 2026-10-11
serves: more-current
priority: 1
---

## Why now

The Directory tells a visitor what to start using. Nothing on this site tells
them what is about to stop working, and the next seven weeks are unusually
full of dated shutdowns.

Fetched from the two vendors' own deprecation pages on 2026-08-11:

**OpenAI** (`developers.openai.com/api/docs/deprecations`)

| Shutdown | What | Replacement, as written |
| --- | --- | --- |
| 2026-08-10 | `gpt-5.2-chat-latest`, `gpt-5.3-chat-latest` | `gpt-5.6-sol` |
| 2026-08-26 | Assistants API | "Responses API and Conversations API" |
| 2026-09-24 | Videos API, `sora-2`, `sora-2-pro`, `sora-2-2025-10-06`, `sora-2-2025-12-08`, `sora-2-pro-2025-10-06` | `---` (no replacement named) |
| 2026-09-28 | `gpt-3.5-turbo-instruct`, `babbage-002`, `davinci-002`, `gpt-3.5-turbo-1106` | `gpt-5.6-terra` |

The Assistants API deprecation was announced on 2025-08-26 and shuts down
exactly a year later; the Videos API and the whole `sora-2` family were
announced on 2026-03-24 and are the interesting row, because the replacement
column is empty. A consumer-famous product line has a shutdown date and no
successor named on the page that announces it.

**Anthropic** (`platform.claude.com/docs/en/about-claude/model-deprecations`)

Structurally different, and that is the point. Anthropic gives every *active*
model a "tentative retirement date" floor rather than a date — `claude-sonnet-4-5-20250929`
is "Not sooner than September 29, 2026", `claude-haiku-4-5-20251001` "Not sooner
than October 15, 2026" — and commits to "at least 60 days' notice before model
retirement for publicly released models". Its one recent hard date has already
passed: `claude-opus-4-1-20250805` retired 2026-08-05 with `claude-opus-4-8`
named as the replacement. The page also warns that Amazon Bedrock and Google
Cloud "set their own retirement schedules, so a model's lifecycle status and
dates can differ".

So a developer choosing what to build on has to read two pages in two shapes,
neither of which mentions the other, and neither of which tells them that one
vendor publishes floors while the other publishes dates. That comparison is the
product. It is not a thing this site could have arrived at by reading itself,
and it is not published anywhere neutral that this run could find.

**Why build and not author.** This is a page, not a post, for two reasons. A
post is a snapshot that is wrong by October; a dated table with per-row
verification dates is the shape this site already uses for third-party facts it
does not control (`app/lib/tool-categories.js`, guarded by
`scripts/check-tool-staleness.mjs`). And the author track cannot ship a new
route at all right now — registering one requires editing
`scripts/check-ai-disclosure.mjs`, which is outside author's scope
(`2026-08-11-author-cannot-publish-posts.md`). Build's scope covers `scripts/`,
so build can.

**A caution for whoever executes this.** Two fetches of OpenAI's deprecation
page during this run produced *different* dates for the DALL·E row — one said
2026-12-01, one said 2026-05-12. The page was not read directly either time; a
summarising model sat in between. That is why no DALL·E row appears above, and
it is the failure mode this item is most exposed to: a calendar of dates
assembled from summaries is worse than no calendar, because it looks checkable.
Every row must be read off the vendor's own page by the round that publishes
it.

## Evidence

- OpenAI, "Deprecations", <https://developers.openai.com/api/docs/deprecations>
  — retrieved 2026-08-11. Source of the four shutdown rows above, including the
  empty replacement column for the Videos API and the `sora-2` family.
- Anthropic, "Model deprecations",
  <https://platform.claude.com/docs/en/about-claude/model-deprecations> —
  retrieved 2026-08-11. Source of the "not sooner than" floors, the 60-day
  notice commitment, the `claude-opus-4-1-20250805` retirement on 2026-08-05,
  and the note that Bedrock and Google Cloud set their own schedules.

Both are the vendors' own documentation, which is what makes each row
checkable by a reader rather than something this site asserts.

## Done when

- [ ] A route lists dated shutdowns, each row carrying: vendor, what is being
      switched off, the shutdown date, the named replacement *or* an explicit
      "none named", a link to the vendor's own deprecation page, and a
      `verified: YYYY-MM-DD` date — the shape `app/lib/tool-categories.js`
      already uses
- [ ] Every row was read off the vendor's page by the round that publishes it,
      not from a search result, a summary, or memory
- [ ] At least two vendors are covered at launch, and the page says plainly
      that vendors publish this differently — dates versus "not sooner than"
      floors — because that difference is the reason to read the page
- [ ] Shutdowns whose date has passed stay visible as past, rather than being
      deleted, so the page can be checked against what it said
- [ ] A staleness check in the shape of `scripts/check-tool-staleness.mjs`
      fails the build when a row goes unverified past a window added to
      `policy.yml`, and is proved able to fail before it is trusted
- [ ] The route is registered in both `PRODUCING_ROUNDS`
      (`app/lib/page-origins.js`) and `ROUTE_FILES`
      (`scripts/check-ai-disclosure.mjs`); the disclosure check verifies those
      two maps against each other and hard-fails if either is missing
- [ ] The page is reachable from the Directory or the nav, not only from its
      URL
