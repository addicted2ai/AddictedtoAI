---
track: meta
filed-by: meta
title: An orchestrator round watched its own session for 55 minutes and called it progress
created: 2026-08-14
expires: 2026-11-14
serves: more-checkable
priority: 1
---

## Why now

The iteration that started at 16:43Z today did no work. It spent 55 of its 90
minutes in a `sleep`-and-poll loop, reading the first row of `/session`,
concluding the round it was watching was alive, and sleeping again. The first
row of `/session` was **itself**.

Its own output counter rose — 8,939 to 9,225 tokens across two polls — because
polling is work. It read that rise as the monitored round making progress and
wrote:

> The round is alive and steadily consuming tokens (webfetch-heavy research,
> ~300 output tokens per 3-minute step). Continuing to monitor.

It was describing itself. Nothing else was running. The loop was in a closed
circuit: poll, observe your own tokens increase, conclude the work is
progressing, poll again.

This is the project's own defect class turned on the loop itself — a claim
written from what a measurement was meant to show rather than from what it
shows. The signal was real and the reading of it was wrong.

## Where the guidance sends it

`prompts/orchestrator.md`, "Before you dispatch a session":

    curl -s http://127.0.0.1:4097/session

    An entry whose `time.updated` is advancing is alive.

That is true, and in context it is about confirming a *previous* session is gone
before dispatching a new one. Three things it does not say, all of which this
round needed:

- **Your own session is in that list**, and while you poll it is almost always
  the freshest row. The signal that is easiest to reach is the one that is
  always about you.
- **`opencode run` is synchronous.** A round you dispatch returns to you when it
  ends. There is nothing to poll for and no reason to sleep.
- **If you dispatched nothing, there is nothing to watch.** A second `sleep` in
  one iteration means the round has stopped working and started waiting.

## The half of this the loop cannot fix

`prompts/` is a human-owned path. `.github/workflows/pr-checks.yml` fails any
pull request matching
`^(CHARTER\.md|\.github/|prompts/|scripts/check-track-scope\.mjs)`, so **no
delegated round can correct the prompt that misled it.** The loop can observe
this failure, file it, and reproduce it; it cannot repair it. That is the
maintainer's call and it is stated here so it can be made deliberately rather
than discovered when it recurs.

## Evidence

All 2026-08-14, this repository and the OpenCode server on 127.0.0.1:4097.

- Session `ses_ffed78f44ffePtyNvuLuZcxFmz`, title `20260814T164341Z`,
  `time.created` 16:43:42.651Z, `directory` `D:\AddictedtoAI`.
- Its last six assistant messages, 17:16:19Z through 17:33:20Z, are each a
  single `bash` call of the form
  `sleep 175; date -u …; curl -s http://127.0.0.1:4097/session | node -e "…s.slice(0,3)…"; … gh pr list --state open`,
  each followed by `step-finish`. The interval lengthened to `sleep 285`.
- `s.slice(0,3)` takes the store's order unfiltered. Row 0 of every one of those
  polls was `20260814T164341Z` — the session running the poll.
- Nothing else was working. The next most recently updated session was
  `PR #56 scout docket review`, last updated 16:44:09Z — four minutes in and
  quiet for the remaining 51. **No session was created between 16:43:42Z and
  17:39:47Z**, and the session store is shared across processes, so any round
  this iteration dispatched would appear there.
- It produced no commit and no branch. At 17:33Z the newest refs were
  `loop/audit/rounds-94-100` (80 minutes old) and `loop/meta/supervisor-liveness`
  (8 hours old). `git status --porcelain` was empty.
- Cost: ~9,200 output tokens and 55 of the iteration's 90 minutes, for nothing.
  Stopped by hand at 17:38Z with `POST /session/<id>/abort` → HTTP 200; the
  supervisor logged `iteration completed` at 17:38:13Z and started a fresh
  iteration at 17:39:45Z.
- Left alone it would have run to `HARD_TIMEOUT` at 18:13:41Z — and see
  `2026-08-14-a-lost-session-id-silently-disables-the-abort.md` for why the
  supervisor could not have stopped it cleanly when it got there.

## Done when

- [x] `prompts/orchestrator.md` says plainly that the session list contains the
      reading session, that `opencode run` is synchronous, and that an
      orchestrator round has no reason to sleep-poll. Landed in #58 the same
      hour, merged with `--admin`: the maintainer authorised the override of the
      human-owned-path guard, having been shown this item first. The guard was
      red at the moment of merge and that is recorded in the pull request rather
      than worked around
- [x] The remedy is stated as a property, not as a blocklist of exact commands.
      A hazard written as specific strings has already failed once in this
      repository: a brief warning against `/proc/<pid>/winpid` did not stop the
      next session running `ls /proc/`
- [ ] Some check or convention makes a self-referential wait visible while it is
      happening rather than after it has spent the iteration. A round that has
      run two `sleep`s and produced no commit is the observable shape

## 2026-08-17 — the remedy reads as a property; the observability box is open

`prompts/orchestrator.md` now says that the session list contains the reading
session, that `opencode run` is synchronous so a dispatched round returns rather
than needing to be watched, and that a second `sleep` in one iteration means the
round has stopped working and started waiting. That is stated as a property of
the situation rather than as a list of commands not to run, which is what the
second box asked for, so it is ticked.

The third box is untouched. Nothing makes a self-referential wait visible while
it is happening; a round that has run two sleeps and produced no commit is still
only findable by reading the session afterwards. The supervisor has since gained
a hard timeout and a working abort path, so such a round now ends within 90
minutes instead of consuming the whole iteration — a bound on the cost, not a
signal.
