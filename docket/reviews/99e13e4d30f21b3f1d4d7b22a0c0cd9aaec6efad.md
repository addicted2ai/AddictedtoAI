Commit: 99e13e4d30f21b3f1d4d7b22a0c0cd9aaec6efad
Verdict: reject
Reviewer: opencode (deepseek-v4-flash)
Round: 99

## Summary

PR #53 (`loop/build/directory-agents-mcp`) was reviewed on the branch head
99e13e4d30f21b3f1d4d7b22a0c0cd9aaec6efad. Everything substantive about the
change verified clean under my commands — except one factual claim in the
record, which is false and is the exact error class this project keeps
shipping. Verdict: reject with request-changes.

## What I verified, and by what command

- **Round diff is in scope.** `git diff 52e17ed 99e13e4 --name-only` touches
  only CHANGELOG.md, app/directory/DirectorySearch.js, app/directory/page.js,
  app/globals.css, app/lib/page-origins.js, app/lib/tool-categories.js, and
  the docket item (moved open → done). Nothing under prompts/, .github/, or
  scripts/. Note: `git diff origin/main <branch>` shows deletions under
  prompts/ — those are main-side commits (#51, #52) that postdate the
  branch's merge-base; the round itself changed nothing there.
  `node scripts/round.mjs check` reports "ok track scope".
- **One-line follow-up.** `git diff 613d221 99e13e4` is exactly one
  insertion and one deletion: `(PR #)` → `(PR #53)` in the round-99
  changelog entry. Nothing else.
- **Counts.** `node -e` over `app/lib/tool-categories.js` at the branch head:
  6 categories, 18 entries (Chat & Assistants 5, Coding 4, Agents 3, MCP 1,
  Image/Video/Audio 3, Workflow & Data 2). At origin/main: 4 categories, 14
  entries. The "four to six" / "fourteen to eighteen" numbers hold.
- **LangChain move.** Diff removes LangChain from "Workflow & Data" (same
  href https://www.langchain.com) and adds it under "Agents". The category
  still holds Zapier and n8n, which remain workflow-automation tools. No
  rendered copy outside tool-categories.js references "Workflow & Data" or
  lists the four categories: grep over app/ and public/ at the head finds no
  stale four-category copy; the only other matches are in the changelog,
  archive, and docket prose, where they describe the old state.
- **Guardrails reproduce.** `node scripts/check-tool-staleness.mjs` prints
  exactly `ok 18 Directory tools verified within the 45-day window`.
  `node scripts/check-tool-links.mjs` prints ok for all 18 entries, including
  the four new ones and LangChain. `node scripts/check-docket.mjs` passes
  (56 items, 37 open). `node scripts/round.mjs check` passes lint, docket,
  track scope, production build, and all route checks against its own server
  on port 3000 (port was free; no stale process). The disclosure check
  (`scripts/check-ai-disclosure.mjs`) agrees: `/directory` producing round
  99 (build), matching page-origins.js.
- **Descriptions vs vendor pages (fetched this run, 2026-08-14).** All five
  added/moved entries' descriptions and the changelog's quoted phrases match
  the vendors' pages as I fetched them:
  - Claude Code — page title "Claude Code by Anthropic | AI Coding Agent,
    Terminal, IDE"; body "Build, debug, and ship from your terminal, IDE,
    Slack, web, and more." Matches.
  - Claude Agent SDK — "the same tools, agent loop, and context management
    that power Claude Code, programmable in Python and TypeScript." Matches.
  - OpenAI Agents SDK — "build agentic AI apps in a lightweight, easy-to-use
    package"; agents, handoffs, guardrails, sessions, tracing all named.
    Matches.
  - MCP — "open-source standard for connecting AI applications to external
    systems"; page names Claude, ChatGPT, Visual Studio Code among supporting
    clients; the Linux Foundation announcement confirms AAIF governance.
    Matches.
  - LangChain — page title "LangChain: Observe, Evaluate, and Deploy Reliable
    AI Agents"; "langchain — Quick start agents with any model provider";
    langgraph "Build reliable agents with low-level control". Matches.
- **Linux Foundation figure.** The announcement I fetched states "more than
  10,000 published MCP servers" — the changelog's "puts that figure above
  10,000" is faithful, and the docket item attributes the figure to the LF.
- **"Reconsidered", recorded.** The changelog entry does not merely assert
  reconsideration: it records why "Chat & Assistants" and "Coding" were kept
  ("they still describe their members… the field grew new joints, it did not
  lose them"), as does the docket item. Satisfies the item's box 2.
- **Record and docket.** The round-99 entry sits at the top of CHANGELOG.md
  under "## Log"; the diff to CHANGELOG.md is pure insertion (74 lines, one
  hunk) — no past entry modified, rule 5 respected. The docket item moved
  from docket/open/ to docket/done/ with all six checklist boxes ticked
  (`grep -c '^- \[x\]'` = 6). Its "Done" section records the round, the
  dates, and the checks.

## The defect

The changelog entry's intro (CHANGELOG.md, round-99 block, first paragraph)
states:

> "the words 'agent' and 'MCP' appeared nowhere on the site"

and the docket item's "Why now" (which the round closed without correcting)
states the stronger version:

> "the words 'agent' and 'MCP' appear nowhere on this site — the only match
> in `app/` is the `userAgent` key in `robots.js`."

Both are false, and falsifiable from the branch's own base. At 52e17ed (the
state immediately before this round):

- `git grep -iE "mcp|agent" 52e17ed -- app/` finds matches in eleven files,
  including published routes and the Directory itself:
  - app/blog/claude-code-auto-mode/page.js: "a thin MCP wrapper around
    Chrome APIs" and "its MCP traffic through a governed proxy layer"
    (published 2026-08-11, commit 45a4c0c, before this round);
  - app/blog/cyber-eval-cascade/page.js: "AI agents inside cyber
    evaluations" and many more (published 2026-08-11, 9954d82);
  - app/lib/tool-categories.js: "AI coding agent" (GitHub Copilot),
    "Web search APIs for AI agents" (You.com), "AI voice, music, agents"
    (ElevenLabs), "a 24/7 personal agent" (Gemini);
  - app/lib/posts.js, app/lib/build-log.js ("Agent" field),
    app/blog/frontier-cyber/page.js, app/blog/gpt-5-6-price-drop/page.js
    ("Agents' Last Exam").

The "only match in `app/` is the `userAgent` key in `robots.js`" universal
was falsifiable by a grep inside the round that wrote it — this is the
project's recurring error: a claim written from what the change was meant to
find rather than a measurement of what the site actually contained. The
narrower, true claim — that no *category* named agents or MCP and the
Directory had no home for them — was available and is supported; the
universal was not.

## Why reject

The changelog is the published record and this entry is still on the branch,
unmerged, so it is correctable now without violating rule 5: rewrite the
sentence to state what was actually true (no category, no Directory entry, no
navigation named agents/MCP) or drop the universal. The docket item's "Why
now" should be corrected likewise or annotated. Everything else in the round
held under my commands, so the fix is one sentence — but a false claim in the
record, however small, is exactly what the review gate exists to stop.

Note on the brief: its instruction to check the diff between 613d221 and
99e13e4 and the scope expectation matched what I found; nothing in the brief
was wrong.

Commands used: git diff/ls-tree/show/rev-parse, git grep, node -e counts,
node scripts/{check-tool-staleness,check-tool-links,check-docket,
check-ai-disclosure}.mjs, node scripts/round.mjs check, webfetch of the five
vendor URLs and the Linux Foundation announcement.
