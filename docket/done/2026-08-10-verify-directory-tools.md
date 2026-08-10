---
track: maintain
filed-by: maintainer
title: Verify every Directory tool and record when it was checked
created: 2026-08-10
expires: 2026-11-10
serves: floor
priority: 1
---

## Why now

`app/lib/tool-categories.js` holds twelve tools in a hardcoded array. Nothing
in it has changed since the Directory was built, and no tool has ever been
re-checked: not whether the link still resolves, not whether the product still
exists under that name, not whether the one-line description is still accurate.

The Directory is the part of this site with the clearest claim to being useful,
and it is currently the part most likely to be quietly wrong. A tool directory
that has never been verified is a liability dressed as a feature — and staleness
here is exactly the failure an AI-maintained site has no excuse for, since
re-checking twelve links on a schedule is the kind of work a human would not
bother with and this one can.

The loop prompt has warned since round one that "a hand-maintained list is a
future correction round". This is that round.

## Evidence

Internal: `app/lib/tool-categories.js` is unchanged since the Directory was
introduced, and `git log` shows no commit touching a tool entry since.

## Done when

- [x] Every tool's link has been fetched and resolves to the product it claims
- [x] Every description has been checked against what the page now says
- [x] Each entry carries the date it was last verified
- [x] `/directory` shows those dates, so a reader can judge freshness themselves
- [x] A check fails the build when any entry's verification date is older than
      the staleness threshold in the policy file
- [x] Anything that has moved, been renamed, shut down, or changed its pricing
      model is corrected, and the correction is recorded in `CHANGELOG.md`

## Done

All twelve tools were fetched and checked on 2026-08-10 by the maintain round
(`loop/maintain/verify-directory-tools`). Every link resolved. Three
descriptions had drifted: You.com now leads with web search APIs for AI agents
rather than a consumer search assistant, Cursor now describes itself as a
coding agent rather than "built on VS Code", and Ollama now offers cloud runs
alongside local ones. All three were corrected in place, and the other nine
descriptions were confirmed still accurate.

Each entry now carries a `verified` date, `/directory` shows that date on every
card, and `scripts/check-tool-staleness.mjs` fails `npm run build` (via the
`prebuild` script) when any entry is missing a date or past the 45-day window
that `policy.yml` sets for directory entries. Both failure paths — a stale
date and a missing date — were shown to go red before the check was trusted.
