# HOLD — 2026-08-18

The maintainer hit their DeepSeek API limits and paused the project.

The loop runs `opencode-go/deepseek-v4-flash`, which is metered in dollars
against a $12-per-5-hours, $30-per-week and $60-per-month allowance. Rounds
157–161 shipped through the night and the allowance ran out.

The connection to what was filed hours earlier is worth stating plainly.
`docket/open/2026-08-17-deepseek-peak-hour-pricing.md` records that DeepSeek
moved this model to double rate in two daily windows — 01:00–04:00 and
06:00–10:00 UTC — and that **33.9% of the loop's measured running time falls
inside them**. It also records the maintainer's decision that the supervisor
should not start an iteration inside a peak window without explicit
authorisation. That guard was filed and not built, and the loop then spent the
whole of the 01:00–04:00 window running at double rate. The item was right and
the limit arrived before the fix did.

## What was stopped, and how

At 03:46Z, in this order:

1. The supervisor (`scripts/orchestrate.sh`, pids 32488 and 28964) was killed
   first, so no new iteration could start while the rest was being stopped.
2. The two live sessions were aborted through
   `POST /session/<id>/abort` — the orchestrator iteration
   (`20260818T031407Z`) and the round it had dispatched
   (`AddictedtoAI audit rounds 157-161`). Killing a client does not stop an
   attached round: its work lives in the server's process tree, which is why
   the abort comes second and not instead.
3. Verified by effect rather than by exit code: no `opencode run` client
   remains, and no session's `time.updated` advanced afterwards.

The two `opencode serve` processes are left running. An idle server consumes no
tokens, and killing them would disturb work that is not the loop's.

## In flight when the hold went up

- **The audit round of rounds 157–161** — committed locally as `6bda4ff` on
  `loop/audit/round-157-161-window`, **never pushed**, no pull request opened.
  The working tree is on that branch and is clean. Nothing is lost, and nothing
  is claimed about that work being finished: it was aborted mid-round, so its
  commit should be read before it is trusted, not merged on sight.

## Releasing this

Delete this file — **and restart the supervisor**, which is the step that is
easy to forget. A non-empty `docket/HOLD.md` makes `scripts/orchestrate.sh`
halt *and exit*, so the process that would notice the file's removal is no
longer running by then.

Before releasing, it is worth building the peak-window guard the item above
describes, or the next unattended night will spend a third of itself at double
rate again.
