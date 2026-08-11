---
track: meta
filed-by: maintainer
title: Make the local check run the same link check CI gates on, so a round cannot ship a pull request it has not already seen fail
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

PR #15 shipped a pull request that could not merge, and the round that shipped
it had no way to know. CI's gate runs lychee
(`.github/workflows/pr-checks.yml`, the "Check for broken links" step). The
local gate — `node scripts/round.mjs check` — runs `check-tool-links.mjs` from
`scripts/check-routes.sh`, which resolves Directory hrefs with Node's `fetch`.
The two disagree: lychee's requests from shared GitHub runners get a 403 from
Cloudflare bot protection on `chatgpt.com`, Node's do not. Local said green,
CI said red, and the round had already stopped.

Everything downstream followed from that gap. PR #15 sat unmergeable; PR #16
had to be a separate meta round to edit the workflow, since `.github/` is
outside author's scope; and starting PR #16 needed `--force` twice — once
because the in-flight guard refuses to start while a pull request is open, and
once because the dispatcher chose `author` again.

That episode produced two other items
(`2026-08-11-red-pull-request-is-a-preflight-condition.md` handles the
deadlock). This one is the cheaper half: a round that can see the gate it will
be judged by does not ship the unmergeable pull request in the first place.
Recovery machinery is the ambulance; this is the guardrail on the road.

The general form is the rule worth holding: **whatever CI blocks a merge on,
`round.mjs check` runs first.** Any check that exists only in the workflow is a
way for a round to fail after it has stopped being able to respond.

## Evidence

- `.github/workflows/pr-checks.yml` — the "Check for broken links" step invokes
  `lycheeverse/lychee-action@v2` with an `--exclude` list. Nothing local runs it.
- `scripts/check-routes.sh` — runs `node scripts/check-tool-links.mjs`, which is
  a different tool with different network behaviour, and is what `round.mjs
  check` reports as "all route checks passed".
- `CHANGELOG.md`, the entries for PR #15 and PR #16, which record the failure
  and the workaround as they happened.

## Done when

- [ ] `node scripts/round.mjs check` runs the same link check CI gates on, over
      the same URLs, and fails locally in the case that would fail in CI
- [ ] The exclude list is not restated in two places. Either the workflow and
      the local check read one file, or the local check invokes the workflow's
      configuration — a second copy drifts the first time somebody excludes a
      host and edits only one
- [ ] Proved able to fail before it is trusted: introduce a knowingly dead link,
      confirm the local check goes red, and record what it printed
- [ ] If lychee genuinely cannot run locally on the maintainer's machine — it is
      a Rust binary delivered as a GitHub Action, and this has not been tested —
      the item is closed by saying so in the record and filing the honest
      alternative. A check that is wired up but silently skipped is worse than a
      missing one, because `round.mjs check` treats SKIPPED as failure precisely
      to stop that
- [ ] The rule is written where a round will read it: whatever CI blocks a merge
      on, the local check runs first
