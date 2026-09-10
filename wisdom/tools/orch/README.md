# The orchestrator's instruments

Everything here was written by **A2AI-Orch** between 2026-08-30 and 2026-09-10
and, until the moment this directory was created, **lived only in a session-
scoped temp directory that dies with the session that made it**. That is wisdom
item 7w — *the cleanup is where the evidence dies* — arriving as a handoff. The
gate harness in this directory is the thing that decides what reaches
`www.addictedtoai.net`; it had no home outside one process.

## THE HONEST CAVEAT, FIRST, BECAUSE IT COULD COST SOMEBODY A RUN

**`orch-gates-only.sh` AS COMMITTED HAS NOT BEEN RUN.** The copy that produced
every gate verdict in this repository's history had `R` and `S` hardcoded to one
machine and one temp directory. Committing it verbatim would have handed the
next reader a file with dead paths, so the three path lines were replaced with
`ORCH_REPO` / `ORCH_TOOLS` / `ORCH_RUNS` and the four `$S/gate-runs/` references
were repointed at `$RUNS`. `bash -n` passes. **Nothing else was touched, and no
gate run has executed this exact file.** Treat the first run of it as a run of
new code: read the summary, do not push on it alone.

## What each thing is

| file | what it does |
|---|---|
| `orch-gates-only.sh` | **THE SIX GATES.** Runs `npm test`, `npm run build`, `verify-launch`, `verify-design`, `verify-surfaces`, `verify-analytics`, capturing six exit codes SEPARATELY. Exit 0 green, 1 red, 2 not-pushable, 3 refused. It NEVER pushes. |
| `orch-gate-analytics.sh` | gate 6, split out because it needs a served build. |
| `orch-env-census.mjs` | the INVERTED env guard: enumerates the whole environment against a baseline rather than checking a hand-written pin list. Folds key case (Windows env names are case-insensitive and the invoker picks the spelling). Stamps its invoker: `MSYSTEM` first, `PSModulePath` second — `PSModulePath` is inherited by every descendant, so it answers "was an ANCESTOR PowerShell", not "is THIS shell PowerShell". |
| `orch-revert-guard.mjs` | **RUN THIS BEFORE GATING ANY HANDED BRANCH, UNCONDITIONALLY.** Classifies every changed path as forward edit / unchanged / derived recomputation / REVERT. Its empty-range refusal IS the zero-commits check. **NEW SHA FIRST**: `orch-revert-guard.mjs <branch-or-commit> [<main-ref>]`. Reversed arguments give a meaningless "0 paths" green — that has happened. |
| `orch-test-revert-guard.mjs` | its negative control. |
| `orch-require-quiet-tree.mjs` | refuses to proceed on a tree someone else is writing. `requireQuietTree(root, targets, expected)`. Matches by PATH SEMANTICS, not string prefix. **Refuses any `expected` entry that matches every path** — an allowlist entry matching everything is not an exception, it is an off switch, and it prints as a green. No override. |
| `orch-quiet-tree-decoy.mjs`, `orch-quiet-tree-case.mjs` | its 11-case proof, run in child processes with prefixes passed as JSON through argv. **Pass prefixes as JSON, never through a shell** — Git Bash rewrites a bare slash into `C:/Program Files/Git/` and the guard then behaves correctly on a string nobody sent it. |
| `orch-wire-quiet-tree.mjs`, `orch-wire-order-check.mjs`, `orch-wire-order-negative.mjs` | wires the guard into call sites, checks the guard is the FIRST action (a guard placed after the thing it guards is decoration), and the negative control that proves the checker can fail. |
| `orch-board-append.mjs` | appends to the coordination board. **Takes the time as an ARGUMENT so it cannot stamp itself, and checks that argument against the machine clock with zero tolerance.** Written after four invented timestamps. Call it with the shell substituting a real `date` read. |
| `orch-tz-window.mjs` | measures each zone's window of difference from the system date, then SELECTS a zone that differs *right now* and refuses if none does. Replaces a probe whose header wrote the defect down as the fix. |
| `orch-await-deploy.sh` | verifies a deploy in three consecutive fetches, **each decided from its own bytes** — not a wait-then-fetch pair (`addictedtoai-ocaj`). |
| `orch-port-watch.ps1` | 3s sampler: total / TIME_WAIT / established / node-owned. A row per sample, not a peak, because a maximum cannot tell a spike from a plateau. |
| `orch-tuple-capture.ps1` | one-shot TIME_WAIT **tuple distribution**. Fire it inside the ~120s TIME_WAIT window of a RED run. See `addictedtoai-ar0`: `connect EADDRINUSE` needs the four-tuple unavailable, not the pool exhausted, so the deciding quantity is shape, not count. **Healthy baseline: TIME_WAIT 2, one destination (443), loopback share 0.** Nobody has yet captured a red. |
| `orch-ratchet-selftest.sh`, `orch-test-ratchet.sh` | prove the ratchet's refusals fire. |
| `baselines/` | **SEED COPIES.** See below. |

## The ratchet, and the rules that govern it

`baselines/test-count-history.tsv` is one row per ALL-GREEN run:
`timestamp <TAB> sha <TAB> test count`. A run whose count is BELOW the last
green refuses as a regression. Two rules, both paid for:

- **A RED RUN'S COUNT MUST NEVER BE APPENDED.** If a red tree's higher count
  became the bar, abandoning that tree would leave a baseline that refuses the
  next honest run. Applied 2026-09-10 07:39: a red at 1979 of 1980 left the
  baseline at 1926.
- **A COUNT IS FILED UNDER A SHA, SO THE SHA MUST STILL BE TRUE AT THE END.**
  The harness re-reads HEAD at the end of a run and skips the append if it
  moved. Row `2026-09-10 06:13:52 / 99b2112 / 1926` is **FALSE** — it names a
  sha whose tree the run stopped measuring 61 seconds in. It is **left standing
  with an appended audit note** rather than deleted, and so is the earlier
  `88244a3` row. **Deleting a row you find embarrassing is how a baseline
  becomes self-ratifying.**

`baselines/` are SEEDS, not the live state. Copy them into `$ORCH_RUNS` once and
let the live ones diverge — the harness appends to them during a run, and a
tracked file written mid-run dirties the tree it is measuring.

## Rules these instruments were built out of

Each cost real work. They are stated as tests to apply, not as slogans.

- **A check whose true and false answers are the same observation is not a check.**
- **A check that cannot distinguish "I looked and found nothing" from "I looked
  at nothing" must print its denominator and refuse on zero.**
- **A guard that summarises its subject guards the summary.** Ask what two
  different subjects share the number, hash or string this guard holds.
- **The deciding observation must be the reported one.**
- **A mechanism proved only against the subjects it happens to be used on is
  proved against a sample drawn from the same intuition that wrote the code.**
  Name the subject class it has never been pointed at, then point it there.
- **A guard built while thinking about one direction is proved against that
  direction only**, and the unguarded direction is invisible precisely because
  it is the one you were not thinking about.
- **A remedy that can be performed WITHOUT KNOWING ANYTHING is a laundering
  path.** "Does it work" is not "is it safe".
- **A false red has to survive an angry human with commit rights at 2am. A false
  green only has to survive inattention.**
- **A defect that WRITES has already left its evidence on disk** — audit the
  data, not only the code. "Can this go wrong" and "has this gone wrong" are
  answered in different places.
- **A summary statistic cannot answer a question about shape.**
- **A measurement of the healthy case is a fact about the wrong subject.**
- **A point-in-time detector against an intermittent subject measures the
  instant and reports it as the interval.**
- **A trial that did not reach its subject reports a failure of the subject.**
- **A name is evidence about where to look, not a mechanism.**
- **A true number does not make a false attribution true.**
- **One fact, one home** — copies generated or compared, never maintained.
- **A pre-flight is a measurement with an expiry date.** Mine expired in 213
  seconds on 2026-09-10 and the gates measured a sha nobody had named.
