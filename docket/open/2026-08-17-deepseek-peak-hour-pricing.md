---
track: meta
filed-by: maintainer
title: Teach the supervisor and the orchestrator role that DeepSeek now costs double in two daily windows, and stop starting iterations inside them without authorisation
created: 2026-08-17
expires: 2026-11-15
serves: more-checkable
priority: 1
---

## Why now

DeepSeek moved `deepseek-v4-flash` to peak and off-peak pricing this week. The
loop runs `opencode-go/deepseek-v4-flash` on a schedule that pays no attention
to the clock, so a third of its running time is now billed at double rate and
nothing in the repository knows it.

The rate card, read from OpenCode's own Go documentation on 2026-08-17 — this
is the provider the loop actually uses, not DeepSeek's direct API:

| | input / 1M | output / 1M |
|---|---|---|
| **peak** — 01:00–04:00 and 06:00–10:00 UTC | $0.44 | $1.32 |
| **off-peak** — every other hour | $0.22 | $0.66 |

`deepseek-v4-flash` is the only model in that catalogue whose rate card shows a
peak split. The windows are 09:00–12:00 and 14:00–18:00 Beijing time, which is
where they come from.

**Go meters dollars, not tokens**, against three ceilings: **$12 per 5 hours,
$30 per week, $60 per month**. That is what makes this operational rather than
financial. Peak does not produce a surprise invoice; it drains the 5-hour
ceiling twice as fast, and a loop that hits a ceiling stops mid-round. The
maintainer's fallback when a limit is hit is Zen credits — so the effect
compounds: peak running makes the fallback more likely, and the fallback is
real spend rather than an allowance already paid for.

### How much of the loop is inside those windows: 33.9%, measured

Parsed from `~/.addictedtoai-loop-logs/supervisor.log`, pairing each
`iteration starting` with its `iteration completed`:

```
iterations paired:   63
log spans:           2026-08-13T22:45:11Z .. 2026-08-17T22:07:49Z
running minutes:     4168
  inside peak:       1415  (33.9%)
  off-peak:          2753
```

Peak is 7 of 24 hours, or 29.2% of the clock, so the loop is running slightly
*more* than uniformly inside it. Holding the work constant and moving all of it
off-peak would cut the bill by about a quarter: `0.661 + 0.339 × 2 = 1.339`
times the all-off-peak cost, so 25.3% of what is currently spent is the peak
premium.

**That figure is time-weighted, not token-weighted, and the two are not the
same thing.** Minutes are what the supervisor log records; tokens are what
DeepSeek bills. A round that spends forty minutes reading files and two minutes
generating costs less than its wall-clock share suggests. The honest reading of
33.9% is "about a third of the loop's *running time*", and anyone who wants the
spend figure has to measure tokens per window, which this log cannot answer.

## The decision, already made

Asked on 2026-08-17 what the supervisor should do at a peak boundary, the
maintainer chose: **pause unless explicitly authorised.** An iteration that
would start inside a peak window does not start; an explicit authorisation
(an environment variable, or a file in the same spirit as `docket/HOLD.md`)
lets it. A round *requested* during peak — by the maintainer or by the
orchestrating model — is confirmed with the maintainer before it runs.

Two things that decision does not mean, stated here so a later round does not
"fix" them:

- **An iteration already running when a window opens finishes.** The guard is
  at iteration start. Killing a live round to save a few cents destroys the
  round's work and its record, which costs more than it saves.
- **Pausing is not stopping.** The supervisor waits out the window and resumes;
  it does not exit the way `docket/HOLD.md` makes it exit. Seven hours a day of
  no iterations is the accepted cost, and it should be visible in the log as a
  wait with a reason, not as silence.

## Evidence

External, all retrieved 2026-08-17:

- OpenCode, "Go" documentation — https://opencode.ai/docs/go/ — the
  subscription ($5 first month, then $10/month), the dollar-metered allowances
  ($12 / 5 hours, $30 / week, $60 / month), and the `deepseek-v4-flash` peak
  and off-peak rate card and windows quoted above.
- TechNode, "DeepSeek to introduce peak and off-peak pricing for its API",
  2026-08-14 —
  https://technode.com/2026/08/14/deepseek-to-introduce-peak-and-off-peak-pricing-for-its-api/
  — the announcement, the Beijing-time windows (09:00–12:00 and 14:00–18:00),
  the RMB rate card (v4-flash peak ¥0.10 cache-hit / ¥3 cache-miss / ¥9 output;
  off-peak ¥0.05 / ¥1.5 / ¥4.5), and "off-peak prices will be set at half the
  peak rates".
- OpenCode's own model data page —
  https://opencode.ai/data/deepseek/deepseek-v4-flash — lists a flat
  $0.14 / $0.28 per 1M with **no** peak split. See the open question below.

Internal:

- `scripts/orchestrate.sh` — the model the supervisor launches is
  `opencode-go/deepseek-v4-flash`, so the Go rate card is the one that applies.
- `~/.addictedtoai-loop-logs/supervisor.log` — the 63 paired iterations
  measured above. The parse is a dozen lines and should be committed with
  whatever executes this, so the number can be re-derived rather than trusted.

**Not verified, and the executing round should not pretend otherwise.**
DeepSeek's own pricing page could not be read this run: `deepseek.com/pricing`
returns 404 and the API documentation's pricing table did not render for the
fetch tool, so every figure above is from OpenCode's card and one news report
rather than from the vendor's page. The effective date is reported
inconsistently — TechNode says 17 August, other coverage says 16:00 UTC on
16 August — and nothing here turns on which. Coverage also claims the *new
off-peak* rate is above the *previous* flat rate, which would make peak roughly
four times the old price rather than twice; that claim was not checked against
a before-and-after card and is not relied on anywhere in this item.

## The open question worth answering first

OpenCode publishes two different cards for the same model: the Go documentation
shows the peak split, and the model data page shows a flat $0.14 / $0.28 with
none. The maintainer's read is that the data page may simply not have been
updated, since the change came from the model provider rather than from
OpenCode. Whoever executes this should establish which card actually bills the
loop **before** writing any number into the supervisor's output — a cost
warning quoting the wrong rate is worse than no warning, because it will be
believed.

## Done when

- [x] `scripts/orchestrate.sh` does not start an iteration whose start time
      falls inside 01:00–04:00 or 06:00–10:00 UTC, unless an explicit
      authorisation is present, and it logs the window, the reason and when it
      will resume rather than going quiet
- [x] The authorisation is explicit, visible and hard to leave on by accident:
      whatever form it takes, the log says on every skipped and every
      authorised iteration which one happened and why
- [x] An iteration already in flight when a window opens is allowed to finish,
      and the record says that is deliberate
- [x] `prompts/orchestrator.md` states the windows, the rate difference, and
      that a round requested during peak is confirmed with the maintainer
      first — a `prompts/` change, human-owned under rule 13, so it waits for
      the maintainer's merge by design
- [x] The windows and the rates are defined in exactly one place that both the
      supervisor and the prompt read. Two copies of a time window drift the
      first time a vendor moves one, and this repository has shipped that bug
      more than once
- [x] Proved able to act, not just to exist: demonstrate a skipped iteration at
      a peak boundary and an authorised one inside the same window, with the
      log output pasted rather than described
- [x] Which rate card actually bills `opencode-go/deepseek-v4-flash` is
      established from the provider, and the answer is recorded — including the
      case where it turns out peak pricing does not reach this account at all,
      which would make the pause unnecessary and is a perfectly good outcome
- [x] The record states that the 33.9% figure is time-weighted, and either
      measures the token-weighted share or says plainly that it did not

## Note, 2026-08-22

Built on `loop/meta/peak-window-guard`: `policy.yml`'s new
`deepseek_peak_pricing` block (the single source), `scripts/peak-window.mjs`
(timestamp -> peak/off-peak verdict), `scripts/orchestrate-peak.sh`
(`peak_guard()`, the decision `scripts/orchestrate.sh` now calls before every
iteration start), `scripts/test-peak-window.mjs` (boundary and guard proof,
wired into `scripts/check-routes.sh`), and the `prompts/orchestrator.md`
section. Every box above is checked against what was built and demonstrated
this round — see `CHANGELOG.md`'s 2026-08-22 entry for the pasted evidence and
what remains explicitly untested (a live `scripts/orchestrate.sh` supervisor
process was not run tonight; the guard is proved at the decision-function
level, sourced and called directly with a fixed clock, not observed end to
end). Left open rather than moved to `docket/done/`: this round does not ship,
push, or open a pull request, so there is no merge or PR to cite as the round
that closed it. Whoever merges this branch should move the item then.
