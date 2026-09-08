# Beads backlog inflow/outflow measurement — 2026-09-08

Read-only. No `bd create/update/close`, no repo edits, no gates run.

## Method and provenance

- Data source: `bd export --scrub -o beads-export.jsonl` (run from
  `D:/AddictedtoAI`), 311 lines = 311 issues, matching `bd stats` exactly
  (Total 311, Open 100, Closed 211; "Blocked: 10" in `bd stats` is a computed
  subset of Open via dependency state, not a fourth status bucket — `status`
  in the export only ever takes `open`/`closed`). `bd list --all --json
  --limit 0` was cross-checked and agrees on the count.
- Every issue record carries: `id, title, description, status, priority,
  issue_type, owner, created_at, created_by, updated_at, closed_at,
  close_reason, labels, notes, comments[], dependencies[], dependency_count,
  dependent_count`. No `parent` field exists as such; parent/child structure
  lives in `dependencies[].type` (`parent-child`, `blocks`, `discovered-from`).
- Dates: `created_at`/`closed_at`/`updated_at` are bd's own timestamps, ISO-8601
  UTC (`...Z`). These are NOT the site-content "local date" convention
  CLAUDE.md documents for wiki/review dates — that convention governs authored
  content, not the issue tracker's own audit timestamps. All day-bucketing
  below uses the UTC calendar date of the timestamp; say so because the
  maintainer/agents mostly work Mountain time (UTC-6), so a UTC day boundary
  can shift an evening MDT filing into the next UTC day. 2026-09-08's row is a
  partial day (export pulled ~07:56 MDT / 13:56 UTC).
- `bd search "front desk"` / `"back desk"` / `"two desks"` / `"desk split"`
  returned `[]` (bd's search index apparently doesn't reach comment bodies).
  The real find (Part F) came from grepping the raw JSONL export directly.
- `created_by` is **not a reliable attribution signal**: 305/311 issues show
  `created_by: "Andrew"` and 6 show `"ui-loop-graph"`. This is because every
  agent session in this repository runs bd under the maintainer's own git
  identity (`--actor` defaults to git `user.name`), a fact an open issue
  (`addictedtoai-81fm`) independently documents while diagnosing a different
  problem (an implementer closing its own bead). So "who filed this" cannot be
  read off `created_by`; classification in Part B is by text pattern instead,
  with the false-positive/negative risk that implies, stated in each number.
- **There is no automated bd-issue-filing code path.** `loop/lib/issues.mjs`
  only validates issue-id *shape* (regex format checks) and is read-only with
  respect to `bd` — its own header states it deliberately never invokes `bd`.
  `loop/lib/proposals.mjs` runs a wholly separate content-proposal mechanism
  (`data/proposals/*.md`, cooling/expiry/caps/dedup) that never touches beads
  either; its own comment says plainly "the maintainer's own filings have no
  proposing job, so this rule cannot reach them." So 100% of the 311 issues
  were filed by an agent or the maintainer literally typing `bd create` / `bd
  q`, not by machinery emitting bugs into the tracker on its own.

---

## A. Opened vs. closed per day, running open count

| day (UTC) | opened | closed | net | running open |
|---|---|---|---|---|
| 2026-08-28 | 11 | 3  | +8  | 8   |
| 2026-08-29 | 90 | 57 | +33 | 41  |
| 2026-08-30 | 15 | 9  | +6  | 47  |
| 2026-08-31 | 83 | 51 | +32 | 79  |
| 2026-09-01 | 11 | 5  | +6  | 85  |
| 2026-09-02 | 13 | 20 | -7  | 78  |
| 2026-09-03 | 10 | 2  | +8  | 86  |
| 2026-09-04 | 14 | 7  | +7  | 93  |
| 2026-09-05 | 12 | 2  | +10 | 103 |
| 2026-09-06 | 15 | 16 | -1  | 102 |
| 2026-09-07 | 21 | 32 | -11 | 91  |
| 2026-09-08* | 16 | 7  | +9  | 100 |

*partial day, through the export timestamp.

Totals: opened 311 / closed 211 over 12 calendar days since the 2026-08-28
greenfield reset (0 issues predate that date — verified: `Issues created
before 2026-08-28: 0`).

**Trend, last 7 days (2026-09-02 → 2026-09-08):** running open went **85 → 100,
net +15**, despite 86 closes against 101 opens. Three of the seven days
(09-02, 09-06, 09-07) were net-negative (real drain), but the other four more
than erased it. **Verdict: trending UP over the last 7 days**, not flat.

**Trend, entire 12-day history ("last 14 days" — the tracker is only 12 days
old, so this is all-time):** running open went **0 → 100**, net +100. That's
mechanically guaranteed to be "up" since the tracker started empty; the more
meaningful read is the last-7-days number above, which shows the up-trend
persisting well past the initial ramp-up.

**The maintainer's literal claim ("has not moved at all") is not quite what
the data shows — it has moved, net upward.** What the data *does* support is
the mechanism behind the claim: the open count keeps re-inflating after every
drain. Every dedicated "drain the backlog" push visible in the data (2026-09-06
objective-3 triage, continuing 2026-09-07) produced a big net-negative day
(-1, then -11) that was **immediately reversed** the next day (+9 on 09-08, 16
new opens in under 12 hours) — several of that day's new issues are
self-referential findings about the triage/Desk mechanism itself (see Part B),
i.e. the act of draining the backlog is what filed some of the backlog back
in. That loop, not a flat line, is the real shape of "ends up filing as fast
as it closes."

---

## B. Inflow by source (best-effort text classification)

No structural "origin" field exists (see provenance note on `created_by`), so
this is pattern-matching on title + description + notes + comment text.
Non-exclusive counts first (an issue can match more than one pattern):

| pattern | count | what it means |
|---|---|---|
| review finding (`reviewer`, `sealed review`, `must-fix`, `carried finding`) | 135 | mentions a review process surfacing it |
| Desk-job-observed (`j-2026MMDD-NN`, `desk job`, `desk chain`) | 116 | describes a defect a Desk job run hit or produced |
| deferral (`deferred`, `follow-up`, `filed as its own`, `its own bead/issue`) | 78 | explicitly the file-the-deferral-or-lose-it pattern |
| fleet/orchestrator (`fleet`, `orchestrator`, `wave N`, `swarm`) | 78 | filed during/about a multi-agent fleet session |
| ui-loop-graph (structural: `created_by`) | 6 | the ui-loop skill's own agent identity |
| maintainer-directed (`maintainer's instruction`, `keeper's mission`) | 3 | explicitly invokes a maintainer directive |
| matches none of the above | 83 | plain bug/task reports with no origin language |

Mutually-exclusive version (first match wins, in the priority order
ui-loop-graph → Desk-job-observed → review-finding → deferral →
fleet/orchestrator → maintainer-directed → uncategorized), which sums to 311:

| category | count |
|---|---|
| ui-loop-graph | 6 |
| Desk-job-observed | 111 |
| review finding | 66 |
| deferral | 39 |
| fleet/orchestrator | 6 |
| maintainer-directed | 0 |
| uncategorized | 83 |

**Reading this against Part A's provenance finding:** since no code path files
bd issues automatically, "Desk-job-observed" (111) does not mean "the Desk
filed these" — it means an agent (author, reviewer, or the orchestrator)
*wrote about* a Desk job run while filing the issue by hand. Combined with
"review finding" (66) and "deferral" (39), roughly **68%** (216/311) of all
issues explicitly reference the review process, a specific Desk job, or the
CLAUDE.md/AGENTS.md deferral rule ("file it as its own beads issue... or it
will get lost") as their occasion for being filed. That rule —
`file-the-deferral-or-lose-it` in `FULL-MEM-LOG.md`, and restated in
`AGENTS.md` line 336 — is corroborated as the dominant mechanical driver of
inflow: it converts *every* finding an agent would otherwise mention in
passing (in a commit body, a close-reason, a chat aside) into its own
permanent bd issue, by explicit repository policy, with no throttle.

---

## C. What kinds of issues are open (theme × priority)

100 open issues (`status != closed`), bucketed by keyword scan of
title+description+notes+comments (buckets are first-match, so the split
overstates "machinery" somewhat, since gate/test issues that also mention
`loop/`, `scripts/`, `desk`, `queue`, `runner` etc. sort into machinery before
reaching the verification bucket):

| theme | open count |
|---|---|
| machinery (loop/pulse/scripts/lib/desk/queue/runner/workflow) | 81 |
| content/corpus (wiki/blog/tutorials/learn/directory) | 14 |
| verification/tests (isolated from machinery) | 0 — subsumed into machinery above |
| site/design | 1 |
| memory/process (beads/directives/memory) | 2 |
| other | 2 |

**81 of 100 open issues are about the machinery itself** (loop, pulse,
scripts, Desk mechanics, runner/breaker/gate behavior), not the content
corpus. Only 14 are actual wiki/blog/learn content defects. This matches the
prior holistic-backlog review's finding (`addictedtoai-ihjo`, closed
2026-09-02 — see below) that the backlog's structure is dominated by
recurring *mechanism families*, not one-off content edits.

By priority (open issues):

| priority | count |
|---|---|
| P0 | 1 |
| P1 | 6 |
| P2 | 54 |
| P3 | 38 |
| P4 | 1 |

**P0/P1 open issues (7 total):**

- **P0** `addictedtoai-h0z0` — Mission 2026-09-06: finish the Frontier, drain
  the queue, restore every guardrail *(the mission epic itself; still open,
  used as a running log — see Part F)*
- **P1** `addictedtoai-vqbo` — A re-review directive whose honest answer is
  "no edit needed" is booked failed, never consumed, and cannot clear the
  mismatch it exists to clear
- **P1** `addictedtoai-lvba` — A repair job restored a file to a baseline
  commit that had since been superseded, reverting a merged change on main —
  and the reviewer saw the divergence and reasoned it away
- **P1** `addictedtoai-qqbi` — The Desk must terminate a runner invocation's
  orphaned process tree when the invocation returns (two halts on
  j-20260906-17)
- **P1** `addictedtoai-226f` — Resolve the 48 fact bindings of the declined
  path benchmarks.artificial_analysis
- **P1** `addictedtoai-zuoo` — A run's publish step pushes main, carrying an
  orchestrator's ungated local commits with it
- **P1** `addictedtoai-d5f6` — A second non-approval destroys the whole job's
  work, even when the reviewer says the fix is one clause

*(Full open lists by theme, all 100 ids with priority, are in the appendix
below.)*

Cross-cut on the old triage taxonomy labels (`systemic`/`decision`/`instance`
— criticized by ihjo, below, for hiding structure): `systemic` 52 total (26
open/26 closed), `decision` 32 total (7 open/25 closed), `instance` 19 total
(17 open/2 closed — i.e. one-off instance issues are the ones actually getting
closed and staying closed), `spec-debt` 6 (0 open/6 closed).

By `issue_type`: bug 157 (43 open/114 closed), task 123 (51 open/72 closed),
feature 16 (5 open/11 closed), chore 13 (0 open/13 closed — chores always get
finished), epic 2 (1 open/1 closed).

---

## D. Churn: closed issues that spawned new ones

Two measurements, one loose and one strict, because bd offers both a free-text
channel and a structured one and agents use both inconsistently.

**Strict — bd's own `discovered-from` dependency links** (the mechanically
correct signal: an agent explicitly ran `bd dep add <child> discovered-from
<parent>`):
- 58 `discovered-from` edges exist across the whole export.
- They come from only **35 distinct parent (closed) issues** — i.e. only
  35/211 = 16.6% of closed issues have any *explicitly linked* child.
- Fan-out among those 35 spawning parents: 19 spawned 1 child, 9 spawned 2, 7
  spawned 3 (nobody spawned more than 3). Average fan-out **1.66** per
  spawning parent.
- Averaged over *all* 211 closed issues: **0.275 discovered-from children per
  closed issue**.
- Of the 58 linked children, **16 are still open today** — the rest closed
  too (sometimes spawning further children in turn, e.g.
  `addictedtoai-9sy` → `8gm6`/`tm4a`, and `tm4a` is itself still open).
- Top spawning parents (3 children each): `addictedtoai-sdh` (OpenRouter
  headline-price-as-vendor-rate defect), `addictedtoai-aw6` / `addictedtoai-4ih`
  (UTC-vs-local-date stamping defects — one bug family, three follow-on
  fixes), `addictedtoai-ps3` (scheduled Pulse committing uncommitted work),
  `addictedtoai-3zf` (machinery-maintains-more-than-it-creates), `addictedtoai-58o`
  (cross-row price comparisons), `addictedtoai-7q8` (snapshot-anchored census
  rot).

**Loose — any other `addictedtoai-xxxx` id mentioned in a closed issue's
close_reason/description/notes/comments** (catches prose references that were
never turned into a formal dependency link, but also catches "see also"
mentions that are not really spawns):
- 174/211 closed issues (82%) mention at least one other issue id somewhere in
  their record; 430 total id-mentions.
- Filtered to mentions of an id that (a) exists in the export and (b) was
  created at/after the closer (a necessary, not sufficient, condition for
  "this closer plausibly caused that filing"): **123 plausible spawn edges**
  from **82 closers** (82/211 = 38.9% of closed issues plausibly caused at
  least one new filing this way).
- Average across all 211 closed issues: **0.58** plausible new issues per
  closed issue. Average across just the 82 that spawned anything: **1.50**.

**Reading:** the true rate is somewhere between the strict 0.275 and the loose
0.58 — the strict number almost certainly *undercounts* (the `discovered-from`
link is optional and clearly under-used relative to how often agents narrate
"filed as X" in prose instead of also creating the formal dependency), while
the loose number overcounts (catches "see X for context" references that
aren't really new filings caused by the closer). **Best estimate: roughly
0.3–0.6 new issues filed per issue closed**, i.e. closing 2 issues tends to
produce very roughly 1 new one on top of whatever else gets filed
independently — which is additive to, not the whole story of, the inflow in
Part A (most new filings are *not* linked to a specific closed parent at all;
they come from fresh review/audit passes, per Part B).

**A relevant governance finding surfaced while investigating this**
(`addictedtoai-81fm`, open, P2): a Desk implementer session closed its own bead
22 seconds after its own commit — before review, before merge — because
nothing in `bd` or the worker's brief prevents a worker from writing bead
status. It "came out fine only because the verdict was approve"; had review
found a problem, the bead would have shown **closed** over work that didn't
actually land. This means the raw closed-count in Part A can, in principle,
include premature/self-certified closures, not just orchestrator-verified
ones — one concretely measured instance, not a proven systemic rate, but worth
flagging as a reason the "closed" side of the ledger isn't perfectly clean
either.

---

## E. Age of open issues

- Median age: **6.24 days** (`addictedtoai-64fk`).
- P90 age: **8.49 days** (`addictedtoai-88x`).
- Oldest open issue: `addictedtoai-cct` — 9.90 days old (filed 2026-08-29,
  "corroborates: cannot be declared on a known disagreement — the queue has
  no way to retire a finding").
- Newest: `addictedtoai-xrsg`, filed 2026-09-08T13:33:18Z, ~24 minutes before
  the export (a meta-finding about the mechanism itself, filed essentially
  live during this investigation — see the note under Part A).
- Because the tracker is only 12 days old, no open issue can be older than 12
  days by construction; a median of 6.24 puts open issues roughly in the
  middle of the tracker's whole lifetime rather than concentrated at either
  end.
- **27 open issues have never been touched since creation** (`updated_at ===
  created_at` exactly). All 27 were filed 2026-09-06 through 2026-09-08 (the
  most recent 48 hours) — this is "freshly filed, not yet worked," not
  long-neglected rot.
- **33 open issues were created in the last 48 hours** (since
  2026-09-06T13:57Z) — a third of the whole open backlog is less than two
  days old.

---

## F. The FRONT DESK / BACK DESK issue

**There is no dedicated beads issue for this.** `bd search` for "front desk",
"back desk", "two desks", "desk split", "front-of-house" all returned `[]`
(bd's search index doesn't appear to reach comment text). Grepping the raw
export directly for `front.{0,30}desk`, `back.?desk`, "two desks",
"front-of-house"/"back-of-house"/"backstage" turns up exactly **one
occurrence**, inside a comment on the mission epic:

- **Issue:** `addictedtoai-h0z0`
- **Title:** "Mission 2026-09-06: finish the Frontier, drain the queue,
  restore every guardrail"
- **Status:** open, **Priority:** P0 (epic)
- **The relevant comment** (one of 18 on this issue), timestamped
  `2026-09-07T17:17:38Z`, the last comment in the thread — a checkpoint note
  before compaction. The front-desk/back-desk mention is its final clause:

  > "OBJECTIVE 3 (backlog): streams 3 (bind-a-price, ak9) and 4
  > (say-what-a-review-record-covers, 37rb+kpgn) landed, gated, archived,
  > pushed (5c7d72c, d63abd0). NON-DESK WORK PAUSED by the maintainer at
  > 10:30 ("After the workflow for the openspec change completes, lets pause
  > on non-desk work for now"). Remaining when it lifts:
  > let-the-queue-see-a-judgment (ccky, cct), bind-what-the-catalog-knows
  > (6nrk, l8x), keep-the-map-describing-the-territory (c29, kat1), the loop
  > draft on impl/spec-loop (31nk), 13 mechanical streams, sfcw (shed per
  > lane), 5hhm salvage, x2jl, 5bgo, **and the back-desk idea the maintainer
  > is musing on (front-desk = content jobs; back-desk = machinery, spec
  > changes, beads).**"

So as of this export, the front-desk/back-desk split is explicitly framed as
something **"the maintainer is musing on"** — a passing idea logged inside the
mission epic's running comment thread, not yet promoted to its own issue,
proposal, or OpenSpec change. The closest thing to a formal restructuring
proposal in the tracker is a different (related but distinct) issue,
`addictedtoai-7z07` — see Part G.

`sfcw` (open, P2, "Shed capacity degradation per lane, not per tier") uses the
phrase "Back-desk / spec-change work" once, as a work-category label on
itself, not as a discussion of the split; it is not a second discussion of the
idea.

---

## G. Open issues proposing batching/merging job types/reducing review
rounds/restructuring loop-desk-pulse

A broad keyword sweep (`batch`, `merge job`, `reduce review`, `restructur`,
`consolidat`, `unify`, `single queue`, `collapse`, `fewer job`, `combine job`,
`simplify the loop/desk`) across all 100 open issues returned many false
positives — "batch" mostly refers to the *triage effort's own batch-numbering*
(batch 1/2/3 of the beads audit), and "collapse" appears in unrelated prose.
After reading each candidate's actual text, the genuine restructuring
proposals among open issues are:

- **`addictedtoai-7z07`** (open, P3) — "Override the Desk budgets by
  authorisation, and unify the Desk queue with beads (TABLED 2026-09-06; draft
  on impl/spec)." This is the real, substantive restructuring proposal: an
  OpenSpec draft (branch `impl/spec`, change
  `give-every-job-a-bead-and-let-one-pass-the-bounds`) that would (A) let the
  maintainer mechanically override Desk budget ceilings and (B) make beads the
  one backlog to look at — every Desk job gets a loop-minted bead, closed by
  the loop at merge and verified; DIRECTIVES.md migrates into beads; the
  derived queue stays authoritative and gets *mirrored* into beads rather than
  replaced (explicitly rejecting "beads as sole source of truth", for reasons
  recorded in the issue: the derived queue is a pure, reproducible function of
  git state, beads is mutable Dolt state outside git that can drift). Tabled
  by the maintainer 2026-09-06 ("Capture all that in the change's bead, I want
  to table it for now"); nothing implemented. This is the mechanism-level
  answer to exactly the question this investigation was asked to test.
- **`addictedtoai-zrsg`** (open, P3) — "Batching per subject file silently
  cost review coverage until a cohort grew large enough to trip a gate." Not a
  forward-looking restructuring proposal so much as a **cautionary finding
  about a batching change already adopted**: a prior holistic review
  (`addictedtoai-ihjo`, see below) recommended batching several findings into
  one job per subject file (saved ~2/3 of cost), and this issue documents that
  the batching silently broke per-piece review-coverage tracking until a
  3-file batch tripped a gate. Both underlying bugs are fixed (commit
  `64d34da`); the issue stays open specifically to record the lesson ("when
  adopting a change to how much work a unit carries, check what else assumes
  the old unit size") for whoever changes unit size again.

No other open issue genuinely proposes merging job types or reducing review
rounds; the rest of the keyword hits were incidental uses of "batch"/"collapse"
in unrelated bug reports (verified by reading each match in context).

**Closed but highly relevant background** (not open, so outside the letter of
the ask, but this is the fleet's own prior attempt at exactly this question and
materially changes how the rest of this report should be read):

- **`addictedtoai-ihjo`** (closed, P2, filed 2026-09-02) — "Holistic read of
  the backlog: five mechanism families, and the burst-not-trend finding." A
  prior agent read all 85 then-open issues in full on 2026-09-01 and reported
  structurally. Its headline: **the backlog is a burst, not a trend** — 55 of
  85 open issues that day were filed on a single day (2026-08-31) when
  deliberate audits ran alongside 15 Desk jobs, that day alone filing 83 and
  closing 51; 68% of all closed issues (at that time) closed the same day they
  were filed. It identified five recurring "mechanism families" behind ~40% of
  the backlog (volatile numbers typed and hunted by per-shape regexes;
  judgments recorded where the next actor can't see them; the derived queue's
  inability to represent/retire some findings; the constitution lagging the
  code; one shared Windows box running the gates flaking) and a measured
  worst-case whack-a-mole example: one wiki page took 12 commits/48h from 8
  Desk jobs over a one-word timeline edit. Its notes (added 2026-09-04) say
  most of its sequencing was completed and recommend closing it once its
  conclusions are carried by descendant issues — which is consistent with the
  `discovered-from` fan-out measured in Part D (`itml`, `pxx1`, `7q8`, `3zf`
  and others in that chain trace back to this review's own predecessor issues,
  `addictedtoai-3zf` "the machinery maintains more than it creates" etc.).
  Its own finding that the backlog is a *burst* driven by concentrated audit
  activity, not a steady structural leak, is corroborated by this report's
  Part A: every big net-negative day in the table above was itself an audit
  day, and every audit day was followed by a filing spike.

---

## Appendix: all 100 open issues by theme bucket

### machinery (81)
```
P0 addictedtoai-h0z0  Mission 2026-09-06: finish the Frontier, drain the queue, restore every guardrail
P1 addictedtoai-vqbo  A re-review directive whose honest answer is "no edit needed" is booked failed...
P1 addictedtoai-lvba  A repair job restored a file to a baseline commit that had since been superseded...
P1 addictedtoai-qqbi  The Desk must terminate a runner invocation's orphaned process tree...
P1 addictedtoai-226f  Resolve the 48 fact bindings of the declined path benchmarks.artificial_analysis
P1 addictedtoai-zuoo  A run's publish step pushes main, carrying an orchestrator's ungated local commits
P1 addictedtoai-d5f6  A second non-approval destroys the whole job's work...
P2 addictedtoai-xrsg  THE ONLY LIST AVAILABLE BECOMES THE WORK LIST...
P2 addictedtoai-bfn0  The daily scout is unreachable whenever any directive is pending...
P2 addictedtoai-yjb5  The learn page never writes the name ChatGPT...
P2 addictedtoai-81fm  A backlog implementer closed its own bead 22 seconds after committing...
P2 addictedtoai-dn44  A verdict record is staged but the evidence it cites is not...
P2 addictedtoai-84s8  verify-surfaces compares two consumers of one shared date fold...
P2 addictedtoai-ckvd  Source guards assert the shape of code, not its behaviour...
P2 addictedtoai-mq8e  Desk records commit and re-gating: x2jl's two remaining halves...
P2 addictedtoai-fdsp  A Desk job blocked: npm test hung 20 minutes in loop/tests/publish.test.mjs...
P2 addictedtoai-ymbd  runners.yml: startup_failure_stderr_pattern matches bare 401/403 anywhere in stderr...
P2 addictedtoai-sfcw  Shed capacity degradation per lane, not per tier...
P2 addictedtoai-5hhm  Breaker 4 fired on j-20260907-13 for a runners.yml commit the job never made...
P2 addictedtoai-wl5f  Runner trial opencode-muse-spark...blocked on the maintainer's per-workspace data-collection opt-in
P2 addictedtoai-x2jl  Desk gates and records commit die with 0xC0000142...
P2 addictedtoai-3ov0  A Desk gate's 600 s lock wait loses to a concurrent suite...
P2 addictedtoai-e0s1  A Desk author's scratch worktree removal emptied the shared node_modules...
P2 addictedtoai-mhsf  build-lock: pid liveness is fooled by pid reuse...
P2 addictedtoai-31nk  Spec draft say-what-the-run-could-not-do waits on impl/spec-loop...
P2 addictedtoai-vd5y  A loop error after the runner returned left no ledger line and no stderr...
P2 addictedtoai-l010  A Desk build gate passed at 12:18 and failed at 20:00 on the same branch...
P2 addictedtoai-fa8a  A directive's precondition is prose the selector cannot evaluate...
P2 addictedtoai-2sx8  BRIEF_EXCERPT_MAX_CHARS grows linearly with in-flight changes...
P2 addictedtoai-2ok0  Board coverage: 34 catalog providers have no org entry...
P2 addictedtoai-eexr  openrouter-models: 23 more source paths are in the undecided state...
P2 addictedtoai-vqp7.1 The Desk's publish can now be refused by a file no job in the run touched...
P2 addictedtoai-s8gz  The Frontier: a surface for what is currently the best, newest and most capable...
P2 addictedtoai-4lrp  A retirement appends no timeline event...
P2 addictedtoai-64fk  An entry's bound facts silently stop rendering last-known values...
P2 addictedtoai-s58k  Two acquisition items need a credential the agent cannot hold...
P2 addictedtoai-6nrk  derived catalog-census fact type: close the census class instead of dating it
P2 addictedtoai-wemx  Proposals are structurally last and no decision records that they should be
P2 addictedtoai-p805  Nothing measures whether the reviewer-noticing channel produces machinery work at all
P2 addictedtoai-kat1  The tutorial surface has no producer...
P2 addictedtoai-8wm0  specs/loop: land the D7 fifth-breaker requirement text...
P2 addictedtoai-ccky  A mismatched review record fails verify-launch but can never enter the work queue
P2 addictedtoai-pfq0  A blocked/failed/discarded job's own proposal file dies with its branch...
P2 addictedtoai-bibj  org/z-ai: former_name and listing facts drop source qualifiers...
P2 addictedtoai-ucbv  Pulse HTTP test fixtures bind ephemeral loopback ports...
P2 addictedtoai-pfc   The price headline is one SERVICE TIER among several the same provider lists
P2 addictedtoai-0vh   No mechanical check catches a quote attributed to the wrong document/arXiv version
P2 addictedtoai-4w2   Live /status.json reports dirty:true on a production deploy built from a clean commit
P2 addictedtoai-c29   Three curriculum deviations today were each defensible and each left the map stale...
P2 addictedtoai-jqs   Wiki lacks an entry for RLHF...
P2 addictedtoai-fc8   Curriculum cross-references name learn pages that are not prerequisites...
P2 addictedtoai-cct   corroborates: cannot be declared on a known disagreement...
P3 addictedtoai-4vjb  IndexNow can duplicate URL submissions when Pulse and Desk overlap
P3 addictedtoai-d1ki  After addictedtoai-ovrk nothing asserts that a real npm test run announces a lock wait...
P3 addictedtoai-tdl7  Measure the payload noise floor across repeated BUILDS...
P3 addictedtoai-h7zt  Every Desk print-mode invocation starts the session's MCP servers...
P3 addictedtoai-z03i  specs/loop: a declined frontier candidate SHALL name the criterion it failed...
P3 addictedtoai-mpzy  A carried-file deletion escapes the jdt8 guard...
P3 addictedtoai-qkxh  The per-job gate set now needs a Playwright browser and a free port...
P3 addictedtoai-oq5d  loop/run.mjs: the rmSync before addWorktree is the unguarded tail of osru...
P3 addictedtoai-7z07  Override the Desk budgets by authorisation, and unify the Desk queue with beads (TABLED)
P3 addictedtoai-ce90  Nothing verifies an openspec archive AFTER it runs
P3 addictedtoai-zrsg  Batching per subject file silently cost review coverage...
P3 addictedtoai-yggm  Carry rate, first clean measurement...
P3 addictedtoai-ze5b  Record the first live scout-to-publish cycle end to end...
P3 addictedtoai-en3s  IndexNow never announces a change whose deploy lands after local midnight
P3 addictedtoai-3liq  snapshot-census: a date's own year can match CENSUS_RE as a row count
P3 addictedtoai-k7d   A vendor as the subject of 'lists' attributes a top-provider rate to that vendor...
P3 addictedtoai-vt2   Verify the 10 body-text quotations against full text and pin them...
P3 addictedtoai-r4m   The unbound cross-row price ratio...
P3 addictedtoai-tm4a  day-gap-attribution.mjs: generalize scope...
P3 addictedtoai-gd28  snapshot-census.mjs blind spots: cross-sentence anaphora...
P3 addictedtoai-pfy9  machines-that-act-in-the-world: three recorded non-blocking prose findings never actioned
P3 addictedtoai-d3mq  Two documented gaps left by addictedtoai-1ho4's cmd-wrapper fix...
P3 addictedtoai-obcr  Measure whether the approval classifier trips on the token inside a PowerShell comment...
P3 addictedtoai-9q5   The Desk brief for a spec-touching job never tells the job where rationale goes...
P3 addictedtoai-fh7   The strict pre-archive check is an instruction, not a mechanism...
P3 addictedtoai-6m3   Measure whether the approval classifier trips on the token in a comment or a heredoc body
P3 addictedtoai-mfm   Two more unamended curriculum deviations...
P3 addictedtoai-k6c   how-models-are-trained is now the surface's register outlier...
P3 addictedtoai-l8x   timeline rows cannot bind a date to a feed; only a cited URL is expressible
```

### content/corpus (14)
```
P2 addictedtoai-ixeq  Run the org source test on the four providers the 2ok0 ruling left undecided
P2 addictedtoai-ego8  Nobody has checked whether the site may republish Artificial Analysis benchmark indices...
P2 addictedtoai-4wm   The repair pass skipped two reviewer-named defects...
P2 addictedtoai-f7l   where-ai-fails-people ships without its hiring case...
P2 addictedtoai-47w   learn/wiki: org/deepseek#weights_license is not safely transcludable mid-sentence
P2 addictedtoai-ckn   Learn wave: collect the cross-links deferred because their target pages were unwritten
P3 addictedtoai-us7x  z-ai-glm-4-5v has no expiration_date fact...
P3 addictedtoai-451e  claude-session-theft-infostealers.md: 'only' overstates exclusivity...
P3 addictedtoai-ewj   Two paraphrase-precision notes living only in finished documents...
P3 addictedtoai-o9d   ai-and-the-law carries one unlinked, unverifiable claim...
P3 addictedtoai-h8i   how-ai-systems-get-attacked uses 'queries against keys' undefined...
P3 addictedtoai-88x   Two learn-page accuracy findings...
P3 addictedtoai-4i2   No wiki entry for the November 2022 chatbot launch...
P4 addictedtoai-9bu   the-bitter-lesson asserts unmeasured readership facts...
```

### site/design (1)
```
P2 addictedtoai-5xc   ai-and-the-law and how-ai-systems-get-attacked have zero inbound prose links
```

### memory/process (2)
```
P3 addictedtoai-9gj1  professional-level-go delta cites a nature.com URL that 303-redirects to a login wall...
P3 addictedtoai-cqv   Record the two standing texture decisions: seed-page register, and the consciousness refusal
```

### other (2)
```
P2 addictedtoai-rnqa  benchmarks.design_arena on openrouter-models is still the third state...
P2 addictedtoai-bc0   learn: four small citation-precision defects on approved mechanics/advanced pages
```
