---
track: meta
filed-by: meta
title: A lost session id silently disables the abort, and the supervisor logs it as if it were routine
created: 2026-08-14
expires: 2026-11-14
serves: more-checkable
priority: 1
---

## Why now

At 16:44:50Z the supervisor gave up looking for the session belonging to the
iteration it had just launched:

    2026-08-14T16:43:46Z  iteration child msys pid 47432
    2026-08-14T16:44:50Z  session not found for title 20260814T164341Z

The session existed the whole time. `GET /session` reports
`ses_ffed78f44ffePtyNvuLuZcxFmz`, title exactly `20260814T164341Z`,
`time.created` 16:43:42.651Z — 1.1 seconds *before* the first poll — and
`directory` `D:\AddictedtoAI`. Those are the three things `api_session_id`
matches on, and all three were satisfiable on every one of the ~13 attempts it
made over 64 seconds. There is no `ambiguous session title` line in the log, so
the fail-closed branch did not fire either: the lookup simply returned nothing,
about a dozen times, about a session that was sitting there.

The two iterations before it resolved in about six seconds
(`15:11:37 → 15:11:43`).

## Why it matters more than a missing log line

From `scripts/orchestrate.sh`, describing its own stop path:

    # When no session id was recorded, the abort half is skipped and the stop is
    # the last-resort kill alone -- a lost id means a lost abort, not a lost
    # round

And killing the client does not stop an attached round: its work lives in the
server's process tree, measured on 14 August at 16,210 output tokens produced
*after* the client died.

So an iteration whose session id is lost is not merely unloggable — it is
**unstoppable**. At `HARD_TIMEOUT` the supervisor kills a client that was never
where the work was, counts the iteration finished, waits `GAP_SECONDS`, and
launches the next one into the same checkout while the previous round is still
writing to it. That is precisely the two-sessions-one-tree collision that
`prompts/orchestrator.md` exists to prevent, arrived at from the other
direction — by the supervisor, believing it had cleaned up.

Today that would have happened at 18:13:41Z. It did not, because the round was
aborted by hand at 17:38Z using an id read straight out of `GET /session` — the
same call that had failed for the supervisor 55 minutes earlier and succeeded
immediately when asked again.

`session not found` is written in the same voice as every other line in that
log. It reads as bookkeeping. It is the moment the supervisor lost the ability
to do the one thing it exists for.

## Evidence

All 2026-08-14.

- `~/.addictedtoai-loop-logs/supervisor.log`, the two lines quoted above; the
  poll ran 16:43:46Z → 16:44:50Z, `SESSION_POLL_TICKS` at `sleep 5`.
- `GET http://127.0.0.1:4097/session` at 17:41Z lists
  `ses_ffed78f44ffePtyNvuLuZcxFmz | 20260814T164341Z | created 16:43:42.651Z | dir "D:\AddictedtoAI"`.
- `scripts/orchestrate-liveness.sh:56` `api_session_id()` matches on lowercased
  `directory`, exact `title`, and `time.created >= launch × 1000`, logs
  `ambiguous session title …` when more than one candidate survives, and
  swallows every other failure — `catch (e) { /* not JSON, or no matching
  session: no signal */ }`. A curl timeout, a non-JSON body and a genuine
  absence are indistinguishable in the log.
- `scripts/orchestrate.sh`, the stop path and the comment quoted above.
- The successful manual abort: `POST /session/ses_ffed78f44ffePtyNvuLuZcxFmz/abort`
  → HTTP 200 at ~17:38Z, `iteration completed, 56108 bytes` at 17:38:13Z.

Root cause is **not** established. The three match criteria were all satisfiable,
so the failure is upstream of the matching — a transient `curl --max-time 10`
against `/session`, a body that did not parse, or something in the store at that
moment. That is what makes the silence the first thing to fix: the log as
written cannot tell those apart, and the failure is intermittent, so the next
occurrence will be just as unexplainable as this one.

## Done when

- [ ] `api_session_id` distinguishes its failure modes in the log — request
      failed, body did not parse, no candidate matched — instead of returning
      empty for all three
- [ ] `session not found` is logged at the severity its consequence deserves,
      naming the consequence: this iteration cannot be aborted and its
      hard-timeout stop will not stop it
- [ ] The stop path does something better than a client kill when it has no id.
      Re-resolving at stop time is the obvious candidate and costs one request —
      the id was trivially available 55 minutes later
- [ ] A reproduction: an iteration launched with the lookup forced to fail,
      shown reaching `HARD_TIMEOUT` and leaving a live session behind. The
      claim in this item is derived from the code's own comment and has not
      been observed end to end
