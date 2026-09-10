# THE PULSE LEASE — RESULT1

## 1. The guard, by line

Path definition — `pulse/lib/core.mjs:63`, with the writer note where the path
is defined (the gate harness lives outside this repository in a session
scratch area; the Pulse only reads):

- `lease: join(root, 'GATE_LEASE')` beside `stop` and `hold` in `paths()`.

Max age and reader — `pulse/lib/core.mjs:86` (`LEASE_MAX_AGE_MS`), `:100`
(`holderFromLeaseText`), `:147` (`checkLease`):

- `:86` holds the max age and the trade note.
- `:100` names the holder from advisory text for the log only and never
  throws: JSON `holder`/`job`/`by`/`owner` wins; otherwise the first non-empty
  plain-text line wins, truncated to 120; empty text, JSON with no usable
  holder field, and non-string input yield null (a lease with no name). A JSON
  object without a holder returns null rather than printing the whole blob as
  a name.
- `:147` reads the state with the mtime as the authority. `ENOENT` on the
  timing read means absent; any other timing failure, or a non-numeric mtime,
  means `stat-failed` (proceed loudly, never refuse). A read failure on
  contents means holder null with the mtime still deciding (this is also how a
  directory at the path behaves: its timing read works, its content read
  throws). Stale is strict: age past the max proceeds, age at or under it
  refuses.

Refusal and loud-proceed lines — `pulse/run.mjs:85-109` (import extended at
`:37` to bring in `checkLease, LEASE_MAX_AGE_MS`):

- `:85-93` comment: scheduler reads nothing, lease-not-lock, exit-0 reasoning,
  naming rule, order rule (after STOP), pre-network placement.
- `:94` `const lease = checkLease(root);`
- `:95-100` fresh means refuse with exit 0.
- `:101-105` stale means warn loudly (file, age, max, disregard) and proceed.
- `:106-108` timing-read failure means warn loudly and proceed.
- `:109` absent proceeds silently.

`STOP` handling is untouched and still first (`pulse/run.mjs:80-83`).

## 2. The maximum age I chose, and the trade I made

`LEASE_MAX_AGE_MS = 15 * 60 * 1000` — fifteen minutes (`pulse/lib/core.mjs:86`).

A gate run was measured near seven minutes, with the holder touching the file
while it runs. Fifteen minutes is near twice that run. Longer would turn a
dead holder into a longer outage before the Pulse starts ignoring it; shorter
would let a slow run with a delayed touch lose its own lease mid-flight. With
the four daily firings hours apart, a dead holder costs at most one skipped
firing either way — so the number is set by the gate-run length and its
refresh jitter, not by the firing grid. A holder that keeps touching the file
keeps it fresh, which is a live holder rather than a dead one.

## 3. THE STATE SWEEP — every state of the lease file I enumerated

Timing margins in live runs: fresh files were pinned to 60 s old, stale files
to max + 60 s, so spawn delay (well under a minute) cannot flip either side.
Exact-boundary proof is pinned-clock unit work (see rows 13-14).

| state | expected | observed | asserted where | or: dismissed, and why |
|---|---|---|---|---|
| 1. absent (no file) | proceed, no lease line | proceeded; pipeline ran to the queue; derived state written; no lease line | `pulse/tests/lease.test.mjs` — absent lease test, live run | — |
| 2. present file, fresh, valid JSON holder | refuse, naming the holder | refused, exit 0, named `gate-harness-probe-1`, nothing else ran, no derived state written, lease left standing | same file — fresh lease test, live run | — |
| 3. present file, aged past the max, valid JSON holder | proceed, loudly naming file, age and disregard | proceeded with `WARN stale GATE_LEASE … disregarding it and proceeding`, holder still named, queue written | same file — stale lease test, live run | — |
| 4. present file, fresh, empty | refuse with no name (malformed means no name, never absent) | refused, exit 0, `holder unnamed`, no queue write | same file — fresh empty test, live run | — |
| 5. present file, fresh, garbage non-JSON (`{{{not json{{{`) | refuse, no throw, never absent | refused, exit 0, no queue write | same file — fresh garbage test, live run | — |
| 6. present file, fresh, JSON with no holder field | refuse with no name | refused, exit 0, `holder unnamed` | same file — JSON-without-holder test, live run | — |
| 7. present file, fresh, plain text | refuse, first line names the holder | refused naming `nightly-gate-7` | same file — plain-text test, live run | — |
| 8. directory at the lease path, fresh timing | refuse with no name (content read throws, timing still decides) | refused, exit 0, `holder unnamed` | same file — fresh directory test, live run | — |
| 9. directory at the lease path, stale timing | proceed loudly | proceeded with stale warning and queue | same file — stale directory test, live run | — |
| 10. present file, stale, garbage contents | proceed loudly | proceeded with stale warning and queue write | same file — stale malformed test, live run | — |
| 11. present file, mtime ahead of wall time (future touch) | refuse as fresh; still ages out alone | refused, exit 0; direct read confirmed `fresh` | same file — future mtime test, live run | — |
| 12. STOP plus a fresh lease | STOP is the visible reason; no lease line | STOP line shown, no lease line, nothing else ran | same file — STOP-plus-lease test, live run | — |
| 13. exact boundary, pinned clock: age equal to max | fresh (strict `>` for stale) | `fresh` | same file — boundary arithmetic test, pinned `nowMs` | — |
| 14. exact boundary, pinned clock: age one millisecond past max | stale | `stale`, age above max | same file — boundary arithmetic test, pinned `nowMs` | — |
| 15. timing read throws non-ENOENT (denied) | proceed (`stat-failed`), never refuse | `stat-failed` | same file — timing-failure test, injected throw | live-run variant dismissed: Windows ACLs do not fail the timing read reliably, and the shipped path (timing throw means proceed) is identical |
| 16. timing read yields no numeric mtime | proceed (`stat-failed`) | `stat-failed` | same file — timing-failure test, injected shape | — |
| 17. timing read throws ENOENT | absent, proceed | `absent` | same file — timing-failure test, injected throw | — |
| 18. holder naming matrix (JSON holder/job, plain text, empty, blank, JSON without holder, numeric holder, null input) | holder string or null as designed | all matched | same file — holder naming test | — |
| 19. lease path placement | beside STOP and HOLD at tree root | `GATE_LEASE` beside `STOP`, `HOLD.md` | same file — path test | — |
| 20. shipped reader on a real fresh fixture | `fresh` with holder and age under max | matched | same file — shipped-guard test on fixture | — |
| 21. broken link at the lease path | dismissed, no case | — | — | or: dismissed. The timing read follows the link and raises ENOENT, which row 17 already proves means absent and proceed. Link setup needs privileges on some machines for a result identical to a row already covered. |
| 22. link to a live file at the lease path | dismissed, no case | — | — | or: dismissed. The timing read follows it to the target, so it behaves exactly as the target file in rows 2/3. No distinct state. |
| 23. unreadable contents via permission bits with good timing | dismissed as a live-run variant, no case | — | — | or: dismissed. Same shipped path as row 8 (content read throws, timing decides); row 8 proves it live with a directory, rows 15-16 prove the timing side. Permission bits do not fail reads reliably on this machine. |
| 24. very large garbage file | dismissed, no case | — | — | or: dismissed. Holder text is truncated to 120 for the log; the decision path is row 5 either way. Writing megabytes per run would buy nothing. |
| 25. file appearing or vanishing between the timing read and the content read | dismissed, no case | — | — | or: dismissed. A vanishing file makes the content read throw, which rows 4/8 already prove means holder null with the observed timing still deciding. No separate flake case. |
| 26. holder touching the file without pause (live renewal) | dismissed, no case | — | — | or: dismissed. This is holder conduct, not a file state: each observed state still ages out once touching halts (rows 3, 9, 10, 14). A holder that never halts is holding, not dead. Proving it would need waiting while touching, against the no-waiting rule for timing cases. |

Full suite: 17 tests, 17 pass, 0 fail (`node --test` on
`pulse/tests/lease.test.mjs`). Existing STOP and publish-disabled checks were
re-run and still pass.

## 4. States I found that can make the Pulse refuse forever

None. Held against the sentence — no state of this file may make the Pulse
refuse forever — row by row:

- Absent proceeds at once.
- Every fresh variant (valid holder, empty, garbage, JSON without holder,
  plain text, directory, future touch, exact-boundary fresh) refuses now, but
  each carries a fixed mtime whose age grows with wall time until it passes
  the max and turns stale, which proceeds. The future touch starts negative
  and still crosses the max on its own. Nothing in contents can pin it fresh:
  contents never enter the decision.
- Every stale variant proceeds at once, loudly.
- Every timing-read failure proceeds at once, loudly, by construction — the
  dangerous door (a timing read that fails on each attempt) was shut on
  purpose: refusing on it would be the forever-refuse arriving through the one
  path the rest of the design left open.

The only way the Pulse keeps refusing is a holder that keeps touching the
file, which is a live holder by definition, not a file state refusing
forever. Once touching halts, the file ages out with nobody needed to clear
it.

## 5. What I did NOT do, and why

- Did not extend the lease to the Desk (`loop/run.mjs`). The brief scopes
  this to the Pulse only: the Desk starts from a session that can read a
  board and be told to wait. A Desk extension is a separate decision and a
  separate packet; flagging the idea here rather than building it.
- Did not touch `STOP` handling, refactor it, share logic with it, or move
  it — and placed the lease check strictly after it, so a run where both
  stand reports the maintainer brake (row 12 proves it).
- Did not write the harness side (creator/refresher). It lives outside this
  repository in session scratch; this packet builds the reader and its proof.
  Expected advisory shape for the writer: JSON such as
  `{"holder": "gate-1", "reason": "verify", "since": "2026-09-10"}` —
  plain text also names its first line, but JSON is the documented form.
- Did not edit `package.json`, `runners.yml`, anything under `data/`,
  `CLAUDE.md`, `AGENTS.md`, `pulse/lib/publish.mjs`, or anything under
  `openspec/`. Diff touches `pulse/run.mjs`, `pulse/lib/core.mjs`,
  `pulse/tests/lease.test.mjs`, plus this report.
- Did not run the Pulse against this repository, the full suite, any
  `verify-*`, the Desk, or any push/commit/issue-write path.

## 6. Where the refusal line differs from STOP's, verbatim, both quoted

STOP (`pulse/run.mjs:81`):

`pulse: STOP file present at ${p.stop} — exiting immediately, nothing done.`

Lease refusal (`pulse/run.mjs:98`):

`pulse: GATE_LEASE present at ${lease.path} (age ${ageS}s, holder ${who}) — a gate run holds the tree, refusing this run, nothing done.`

Observed live (fixture run, holder `probe-holder-9`, pinned 60 s old):

`pulse: GATE_LEASE present at C:\Users\BadBitch\AppData\Local\Temp\pulse-fixture-1Frr8c\GATE_LEASE (age 60s, holder probe-holder-9) — a gate run holds the tree, refusing this run, nothing done.`

Comparison: STOP names the maintainer file and says `exiting immediately`;
the lease names `GATE_LEASE` with measured age and holder and says `a gate
run holds the tree, refusing this run`. Shared tail (`nothing done.`) marks
both as obeyed instructions with exit 0; distinct heads keep a hurried reader
from clearing the wrong brake — one of them is the maintainer's. The two
proceed-loudly lines are WARN lines (`stale GATE_LEASE … disregarding it and
proceeding`; `cannot read mtime of GATE_LEASE … proceeding`) and cannot read
as either refusal.

## 7. Blocked or refused calls

None. No command was blocked or refused, and nothing was routed around.

Environment note (not a refusal): the first run of the new suite failed
because this worktree had no installed deps (`cheerio` missing for the live
Pulse imports) while the main tree does. I linked the ignored
`node_modules` path to the main tree's installed tree and re-ran: 17/17
pass. The link is ignored by git and leaves the diff exactly the four paths
named above.
CORRECTION 2026-09-10: section 4's answer of None is refuted for row 11; see RESULT2.md section 1.
