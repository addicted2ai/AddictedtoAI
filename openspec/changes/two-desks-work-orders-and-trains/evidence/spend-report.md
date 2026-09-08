# Workspace spend vs. visible output — D:/AddictedtoAI, 2026-08-25 → 2026-09-08

Scope: **whole workspace** (interactive/orchestrator sessions + Desk jobs + subagents),
measured against `git log` output. A sibling agent covers per-Desk-job ledger data;
this report does not duplicate that. All dollar figures are Claude Code's own
API-equivalent cost figure (tokens × list price), not real invoiced spend. All
dates are Mountain local (UTC-6, per the account's stated current offset).
Read-only: no build/test/verify/sweep script was run.

Sources: 377 non-underscore JSON files + 10 `.history.tsv` files in
`C:/Users/BadBitch/.claude/usage/`, `_forks.json`, `_last_input.json`;
`git -C D:/AddictedtoAI log --since=2026-08-25 --numstat`; two direct transcript
reads (first line only) to date-bound the largest sessions.

---

## A. Day-by-day

**Table 1 — cost and commits.** "Day-attributable $" = Desk-job + conformance-check
+ pre-mirror-retroactive session cost, bucketed by each session's actual
`last_activity` day (safe: these are short, single-purpose runs). It **excludes**
long-running interactive orchestrator sessions — see the note below the table and
Section D.

| Day | Day-attrib. $ | Desk $ (sessions) | Conformance $ (n) | Commits (job-record) |
|---|---:|---:|---:|---:|
| 08-25 | $0.00 | $0.00 (0) | $0.00 (0) | 7 (0) |
| 08-26 | $0.00 | $0.00 (0) | $0.00 (0) | 0 (0) |
| 08-27 | $0.00 | $0.00 (0) | $0.00 (0) | 0 (0) |
| 08-28 | $10.85 | $10.24 (8) | $0.61 (4) | 99 (7) |
| 08-29 | $7.23 | $7.23 (3) | $0.00 (0) | 42 (11) |
| 08-30 | $2.31 | $0.00 (0) | $2.31 (4) | 70 (0) |
| 08-31 | $70.79 | $70.79 (25) | $0.00 (0) | 142 (70) |
| 09-01 | $35.52 | $35.52 (25) | $0.00 (0) | 154 (109) |
| 09-02 | $49.73 | $49.73 (28) | $0.00 (0) | 161 (117) |
| 09-03 | $73.49 | $73.49 (30) | $0.00 (0) | 159 (117) |
| 09-04 | $187.79 | $187.79 (83) | $0.00 (0) | 339 (272) |
| 09-05 | $248.56 | $248.56 (50) | $0.00 (0) | 251 (125) |
| 09-06 | $252.93 | $252.88 (42) | $0.00 (0)† | 286 (105) |
| 09-07 | $121.19 | $121.19 (28) | $0.00 (0) | 278 (141) |
| 09-08 | $0.00‡ | $0.00 (0) | $0.00 (0) | 82 (40) |
| **Sum (15d)** | **$1,060.38** | **$1,057.42 (322)** | **$2.92 (8)** | **2,070 (1,114)** |
| **Sum (last 7d, 09-02→09-08)** | **$933.69** | **$933.65 (261)** | **$0.00 (0)** | **1,556 (917)** |

† 09-06 also carries $0.05 from one pre-mirror-retroactive session, omitted from
the column above for space; included in the day-attrib. total.
‡ No Desk job had completed and been priced yet as of this reading (~08:00 local,
09-08); see Section D for why this is ambiguous (no jobs finished vs. a pricing lag).

**Table 2 — content output and other line-churn.**

| Day | Content +/− | New files | Edited files† | Machinery +/− | data/ +/− | docs +/− |
|---|---:|---:|---:|---:|---:|---:|
| 08-25 | 0 / 0 | 0 | 0 | 1,374 / 125 | 0 / 0 | 0 / 0 |
| 08-26 | 0 / 0 | 0 | 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 08-27 | 0 / 0 | 0 | 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 08-28 | 28,015 / 454 | 578 | 0 | 28,411 / 33,239 | 146,117 / 910 | 690 / 332 |
| 08-29 | 528 / 1,020 | 10 | 63 | 8,197 / 354 | 14,507 / 4,958 | 74 / 12 |
| 08-30 | 6,509 / 1,454 | 28 | 17 | 9,765 / 407 | 9,966 / 5,598 | 52 / 9 |
| 08-31 | 914 / 173 | 5 | 39 | 20,105 / 587 | 10,952 / 4,643 | 62 / 14 |
| 09-01 | 1,134 / 198 | 30 | 10 | 17 / 1 | 18,141 / 6,696 | 152 / 9 |
| 09-02 | 635 / 65 | 5 | 5 | 1,217 / 51 | 15,244 / 6,524 | 11 / 1 |
| 09-03 | 771 / 98 | 7 | 12 | 1,648 / 80 | 17,607 / 8,251 | 6 / 2 |
| 09-04 | 500 / 70 | 7 | 13 | 1,484 / 50 | 20,313 / 8,531 | 14 / 4 |
| 09-05 | 1,038 / 140 | 9 | 15 | 6,577 / 504 | 17,616 / 7,642 | 87 / 26 |
| 09-06 | 3,530 / 80 | 12 | 331 | 14,631 / 574 | 23,718 / 14,157 | 87 / 38 |
| 09-07 | 286 / 71 | 2 | 13 | 7,708 / 483 | 13,228 / 8,197 | 2,197 / 19 |
| 09-08 | 127 / 10 | 0 | 44 | 829 / 120 | 10,162 / 7,212 | 285 / 10 |
| **Sum (15d)** | **43,987 / 3,833** | **693** | **562†** | **101,963 / 36,575** | **317,571 / 83,319** | **3,717 / 476** |
| **Sum (7d)** | **6,887 / 534** | **42** | **433†** | **34,094 / 1,862** | **117,888 / 60,514** | **2,687 / 100** |

† "Edited files" per day counts distinct paths modified *on that day after their
creation day*; a file edited on 3 different days is counted 3 times, so the
15-day sum (562) is larger than the number of distinct files ever edited after
creation (454 of the 693 total files created in the window were touched again
at least once). Distinct content files touched at all in the window: 693 (15d),
368 (7d) — i.e. every content path touched in this window was also *created*
in this window (consistent with the 2026-08-28 corpus rebuild — nothing here
predates it).

No sessions or commits are recorded for 08-25/26/27; the corpus rebuild visibly
starts 08-28, matching CLAUDE.md's account of the 2026-08-28 wipe.

---

## B. Totals and ratios (7d / 14d*)

*The git `--since` flag used, per instructions, was `2026-08-25`, giving a
15-calendar-day window (08-25 through 09-08 inclusive), referred to as "14-day"
below per the task framing.

| Metric | 7-day (09-02→09-08) | 15-day (08-25→09-08) |
|---|---:|---:|
| Day-attributable $ | $933.69 | $1,060.38 |
| Content files created | 42 | 693 |
| Content lines added | 6,887 | 43,987 |
| Commits | 1,556 | 2,070 |
| **$ per content file created** | **$22.23** | **$1.53** |
| **$ per content line added** | **$0.1356** | **$0.0241** |
| **$ per commit** | **$0.600** | **$0.512** |

These are **conservative floors** — they use only the $ that can be safely
dated to a specific day (Section D explains why the true total is materially
higher and cannot be dated). Using the same denominators but adding the
$5,854.20 of currently-open/recently-active interactive-session cost that
Section D describes (attributing all of it, undated, to the window — an
upper bound, not a real day-by-day figure):

| Metric | 7-day upper bound | 15-day upper bound |
|---|---:|---:|
| Total $ (incl. undated interactive) | $6,787.89 | $6,914.58 |
| $ per content file created | $161.62 | $9.98 |
| $ per content line added | $0.986 | $0.157 |
| $ per commit | $4.36 | $3.34 |

The 7-day $/file figure (both bounds) is much higher than the 15-day figure
because content creation is front-loaded: 578 of the 693 new content files
(83%) were created on a single day, 08-28, the day of the corpus rebuild: the
last 7 days added only 42 new files while still running 261 Desk-job sessions.

**Fraction of all changed lines (added+removed) by bucket, 15-day window**
(1,152,011 total changed lines across the whole repo):

| Bucket | Changed lines | Share |
|---|---:|---:|
| `data/` (machine state: reviews, ledger, snapshots, derived) | 400,890 | 34.80% |
| **other** (mostly `.job/` job-scaffolding churn, `docket/` queue state, `loops/ui-loop`) | 515,784 | 44.77% |
| `loop/`+`pulse/`+`scripts/`+`lib/`+`app/`+`tools/` (machinery) | 138,538 | 12.03% |
| `openspec/` (specs) | 44,786 | 3.89% |
| **`content/` (visitor-facing corpus)** | **47,820** | **4.15%** |
| docs (AGENTS/CLAUDE/FULL-MEM-LOG/DIRECTIVES/STANDING-AUTHORITY/README) | 4,193 | 0.36% |

Within "other," `.job/brief.md` and `.job/source.json` alone account for
187,820 of the 515,784 changed lines — written and then deleted for essentially
every Desk job (416 and 398 touches respectively, added≈removed on both,
confirming pure per-job scaffolding churn, not retained content). `docket/`
(review/done/open/briefs/dropped queue-state) adds another ~11,000 lines of
churn; `loops/ui-loop` (the UI-improvement loop's iteration artifacts) adds
~25,900.

7-day bucket shares (595,310 total changed lines): data/ 29.97%, other 59.48%,
machinery 6.04%, openspec 2.80%, content 1.25%, docs 0.47% — the most recent
week skews even further from content and further toward `other` (job-scaffolding
+ docket churn) than the full window does.

---

## C. Interactive vs. Desk-job spend, and the top 10 sessions

**Split (fork-corrected, all sessions recorded for this workspace, all time):**

| Kind | $ | Share of $7,385.75 |
|---|---:|---:|
| Interactive orchestrator sessions (incl. all their subagents — subagent cost is folded into the parent session's own `session_cost`, not separately visible) | $6,325.42 | 85.6% |
| — of which: currently open / recently active (in-window) | $5,854.20 | 79.3% |
| — of which: pre-window (2026-08-09 → 08-14, before the 08-28 rebuild) | $471.17 | 6.4% |
| Desk-job sessions (`claude --print`, one per job/subagent worker) | $1,057.42 | 14.3% |
| Conformance-check probes (`loop/conformance.mjs`) | $2.92 | 0.04% |

This $7,385.75 (my independent sum, fork pairs resolved by dropping the
frozen/duplicate member of each pair — see Section D) matches the system's own
`workspace_total_cost` mirror, $7,385.50, to within 0.003% — the small gap is
the live session's cost growing between the two reads.

**Top 10 most expensive sessions recorded for this workspace:**

| Rank | $ | Kind | Day (last write / activity) | Session id (short) | Model | Name |
|---|---:|---|---|---|---|---|
| 1 | $5,542.41 | interactive, still open | 09-08 | `b0a0272b…` | Opus 5 (1M ctx) | not recorded — open continuously since **2026-08-13** (confirmed from its own transcript's first line) |
| 2 | $220.57 | interactive, pre-window | 08-12 | `b53d2536…` | claude-opus-5 | not recorded |
| 3 | $149.20 | interactive, still open | 09-08 | `5db14456…` | Opus 5 (1M ctx) | not recorded |
| 4 | $110.13 | interactive, pre-window | 08-10 | `f79c7bf5…` | claude-opus-5 | not recorded |
| 5 | $98.23 | interactive, still open | 09-08 | `b721efae…` | Opus 5 (1M ctx) | **"A2AI-mem-cond"** (per `_last_input.json`) |
| 6 | $71.37 | interactive, pre-window | 08-09 | `354a767f…` | claude-opus-5 | not recorded |
| 7 | $43.56 | interactive, pre-window | 08-09 | `2eec8ed5…` | claude-sonnet-5 | not recorded |
| 8 | $42.48 | interactive, still open | 09-08 | `47a211cc…` | Fable 5.1 | this measurement task's own session |
| 9 | $25.53 | interactive, pre-window | 08-10 | `db962634…` | claude-opus-5 | not recorded |
| 10 | $21.89 | interactive, still open | 09-08 | `d005b682…` | Opus 5 (1M ctx) | not recorded |

Every one of the top 10 is an interactive-orchestrator-class session; the most
expensive Desk job is `j-20260906-04` at $18.02, and no Desk job exceeds $20.
The usage mirror only records a human-readable name (`session_name`) for
whichever session most recently wrote `_last_input.json` — a single global
snapshot, not a per-session field — so names for the other 8 of the top 10
cannot be recovered from this data.

---

## D. Caveats — what this cannot see

1. **The single biggest number in this report cannot be dated by day, at all.**
   Session `b0a0272b…` ($5,542.41, 75% of all recorded workspace cost) has been
   continuously resumed since its transcript's first line, **2026-08-13T14:41 UTC**
   — 12 days before this report's window even starts — and is still open as this
   analysis runs. `.history.tsv` files (the only time-series data available)
   are trimmed to a rolling ~130-minute window (confirmed by the files' own
   `history_span_minutes: 130` field), far short of what would be needed to
   split 26 days of a resumed session's cost across days. Splitting this $5,542
   (or the $5,854.20 total across all 6 currently-open/recently-active
   interactive sessions) across specific days is **not computable from this
   data**, only bounded (Section B's "upper bound" treats it as if entirely
   inside the window, which overstates it; Section A's table treats it as
   entirely outside the window's day-buckets, which understates the true total).

2. **Desk-job pricing coverage has a confirmed tail gap.** Every
   `transcript-sweep` (Desk-job) usage file in this workspace has a `written_at`
   of either 2026-09-06 or 2026-09-07 — none later. Cross-checking distinct
   Desk-job ids named in commit subjects (240 in-window) against distinct
   job ids actually priced in the usage mirror (201) finds **40 job ids (16.7%)
   that produced a commit but have zero cost record** — 13 from 09-08 (all of
   today's jobs so far) and 21 from the back half of 09-07 (`j-20260907-28`
   onward), plus a scattered 6 from earlier days (08-31: 2, 09-02: 4, 09-03: 1,
   09-05: 1). The 201 already-priced job ids average $5.26 each (median $3.37),
   so the missing 40 could plausibly add on the rough order of $100–300 more
   Desk-job spend — **not a computed number**, just a magnitude check on how
   incomplete the $1,060.38 floor in Section A/B is. Whether the gap is "no
   job has finished yet today" or "the pricing hook is lagging" cannot be told
   apart from this data.

3. **Fork double-counting**, handled: `_forks.json` records 2 pairs for this
   workspace. Pair 1 (`067c2e51…`/`b0a0272b…`, shared base $3,992.19) is
   literally the example in the account's own usage-json rules doc — a
   background "review previous session" helper forked from the live session.
   Pair 2 (`ac437b52…`/`5db14456…`, base $58.81). In both pairs one member's
   `session_cost` equals the recorded base to the cent (a frozen/idle mirror
   contributing zero *new* spend); that member was dropped and only the live
   member's full cost kept. This reproduces the system's own
   `workspace_total_cost` almost exactly (Section C), which is the validation
   that the correction is right.

4. **Pre-window sessions**, excluded: 7 sessions dated 2026-08-09 to 08-14
   ($471.17 total) predate both the 15-day window and the 2026-08-28 corpus
   wipe — presumably leftover from the previous incarnation of the site.
   Excluded from every total in Sections A/B.

5. **Print-mode runs before the sweep tooling existed.** The one-time
   comprehensive sweep ran 2026-09-06T19:21 local, discovering 336 sessions
   account-wide; per-session sweeping since then depends on a `SessionEnd`
   hook. A job whose transcript was deleted/rotated before that sweep ran
   would be invisible to this analysis with no way to detect that it's
   missing — the 6 scattered pre-09-07 job-id gaps in point 2 are the only
   direct evidence of this happening, and only for jobs that also produced a
   git commit (a job that failed before committing anything would leave no
   trace in *either* source).

6. **Subagents are inside their parent's number, not separately visible.**
   `session_cost` documentation states subagent cost is folded into the
   parent session's cumulative total. So the "interactive $6,325.42" figure in
   Section C already includes every subagent any interactive session spawned
   via the Agent/Task tool; it is not possible to separate "orchestrator's own
   tokens" from "its subagents' tokens" from this data. Desk-job subagent
   workers, by contrast, get their own separate session_id/file (they show up
   as their own row under `desk-job`, sharing a `job_id` with the parent job).

7. **Git authorship is not a signal.** Every commit in the 15-day window shows
   author "Andrew" — human, Pulse, Desk and interactive-agent commits are
   indistinguishable by author. The `job j-YYYYMMDD-NN` commit-subject pattern
   (1,114 of 2,070 commits, 53.8%) is the only available proxy for
   "this commit came from a Desk job," and even that only identifies Desk
   bookkeeping commits, not authorship of ordinary content/code commits made
   during a job.

8. **Day-count column is a floor, not a census.** The "sessions active" figures
   folded into Table 1 (session counts per Desk/conformance/retroactive row)
   only count sessions with a single discrete `last_activity`. They do not,
   and cannot, count how many *days* each of the long-running interactive
   sessions was actually being used — only their single most-recent-write day
   is known.

---

## E. Verdict, as measured numbers

Over the 15 days measured (2026-08-25 through 2026-09-08), this workspace has
a **confirmed, day-dated floor of $1,060.38** in Desk-automation and
conformance-check spend (322 job-sessions across 201 distinct job ids,
averaging $5.26 each, undercounted by at least 40 unpriced job ids from the
final 36 hours of the window) that produced 693 newly-created and 454
further-edited content files (+43,987/−3,833 lines) across 2,070 commits — a
conservative $1.53 per new content file, $0.024 per content line, and $0.51
per commit over the full window (rising to $22.23/file and $0.60/commit in
just the last 7 days, since content creation was front-loaded onto 08-28's
corpus rebuild while Desk-job activity kept running afterward). Separately,
and **not** included in that floor, six interactive orchestrator sessions
currently open or recently active in this workspace carry $5,854.20 of
cumulative cost that cannot be dated to specific days from the data
available — three-quarters of it ($5,542.41) sits in a single session
continuously resumed since 2026-08-13 — and adding all of it as an upper
bound would put total measured spend for the window as high as roughly
$6,900 ($9.98/file, $3.34/commit). Across the whole 15-day window, only 4.15%
of all changed lines in the repository are under `content/` (the
visitor-facing corpus); 34.80% are under `data/` (machine/review/ledger
state), 12.03% are machinery code, and 44.77% — the single largest share —
is job-scaffolding and queue-bookkeeping churn (`.job/`, `docket/`,
`loops/ui-loop`) that is written and deleted again per Desk job rather than
retained. These are the measured figures; this report takes no position on
whether that ratio is the right one for what the site is trying to be.
