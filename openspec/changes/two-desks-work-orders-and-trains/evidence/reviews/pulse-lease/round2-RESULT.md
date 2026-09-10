# THE PULSE LEASE — RESULT2

## 1. The correction owed to RESULT1 section 4

RESULT1 section 4 answered None to which states can make the Pulse refuse
forever, defending row 11 (mtime ahead of the wall time) with the claim that
a negative age still crosses the max on its own.

That claim is true and not a bound. Measured 2026-09-10 against the shipped
`checkLease`, the same state at other points refuses for the skew plus the
max: one minute ahead refuses about 16 minutes, one hour ahead about 1.3
hours, one day ahead about 24.3 hours, one year ahead about 365 days, ten
years ahead about 3650 days. Four scheduled firings a day fall inside every
window past a few hours. One file with a wrong timestamp — a restored virtual
machine, a corrected clock, a copy from a machine whose clock was wrong, a
timestamp set by hand — refuses the engine for as long as the skew lasts.

So section 4 was wrong for row 11: a future mtime is a state that refuses
past the maximum age, by the skew, and for large skew it is worse than any
outage this brake was built to prevent. The row named the state and the
control sat at the near end of its range. This round repairs the reader, puts
controls at the far end, and re-derives the section below.

## 2. THE RANGE SWEEP — every state with a range, and where its control sits

Standard, met already in round 1 for the age rows: max and max-plus-one
millisecond on a pinned clock. Every range below is held to the same bar —
a control at the end that threatens the property, or a stated reason the
range is bounded in effect.

| state | the range | control at the threatening end, or why the range is bounded |
|---|---|---|
| mtime behind now (how far behind; rows 2-10, 13-14, 20) | 0 to unbounded behind | Pinned: age equal to max is fresh, one millisecond past it is stale (existing). Pinned anew: a newly written lease (age 0) is fresh at once, still fresh at max, stale one millisecond later — so a past mtime refuses at most the max from now. Live: 60s fresh refuses, max-plus-60s stale proceeds, and ten years old proceeds as stale, never future (new live run). Far end covered. |
| mtime ahead of now (how far ahead; row 11) | a millisecond to a decade ahead (negative age) | Old control at one minute ahead sits at the near end and stays fresh under the repair (at tolerance). New controls at the threatening end, all live: 90s ahead proceeds as future, one hour ahead proceeds as future, one day ahead proceeds as future, ten years ahead proceeds as future. Pinned edge: at tolerance fresh, one millisecond beyond it future. The range no longer refuses past max plus tolerance. |
| within-tolerance future (how far ahead inside the allowed band) | 0 to 60s ahead | Live 30s ahead refuses as a live lease (new). Pinned: age equal to negative tolerance is fresh. This is the jitter band; its cost is stated in section 3. |
| holder string length (rows 2, 5-7, 18) | 0 to unbounded chars | Bounded in effect by truncation to 120 for the log; contents never enter the decision. Far-end controls anew: a 5000-char JSON holder is truncated to length 120 and still refuses on the mtime (live run plus unit length asserts); a 5000-char plain-text first line is likewise truncated to 120 (unit). |
| file size / garbage length (rows 5, 24) | empty to unbounded bytes | Bounded in effect: the timing read decides, the content read only names. Far-end control anew: one megabyte of garbage with a fresh timing still refuses (live run). |
| plain-text line count (rows 7, 18) | one line to unbounded lines | Bounded in effect: only the first non-empty line names, truncated to 120. Far-end control anew: a thousand trailing lines still name the first one (unit); long first line truncated as above. |
| exact-boundary distance (rows 13-14, plus new tolerance edge) | one millisecond on either side of each edge | Already at the threatening end by construction: max vs max-plus-one-millisecond pinned; tolerance vs tolerance-plus-one-millisecond pinned anew. No further end exists. |
| timing-read failure kinds (rows 15-17) | no range: enumerated shapes (denied, no numeric mtime, absent) | No range to bound; enumeration is the coverage. Live-run variant for denied timing remains dismissed as in round 1 (timing reads do not fail reliably under permission bits on this machine; the shipped path is identical and proved by injection). |
| link depth at the lease path (rows 21-22, dismissed) | chain depth zero to many | Bounded: the timing read follows the link to its target, so depth collapses to the target file state already covered (absent when the link dangles, target age when it lands). No distinct state; no new control buys anything. |
| appearing-or-vanishing between timing and content reads (row 25, dismissed) | window of one stat-plus-read sequence | Bounded: a vanishing file makes the content read throw, which rows 4 and 8 already prove means holder null with the observed timing still deciding. No separate flake case. |
| live renewal by touching (row 26, dismissed as conduct) | touch interval from continuous to halted | Not a file state but holder conduct. Once touching halts, the file is a fixed mtime and falls under the past/future rows above, which now bound every fixed mtime. Proving it would need waiting while touching, against the no-waiting rule for timing cases. |
| STOP plus a fresh lease (row 12) | no range | No range; order proved live (STOP line shown, no lease line). Untouched by this round. |

## 3. The repair — what I chose, the tolerance, and what it costs at both ends

What I chose: a new `future` state in `pulse/lib/core.mjs:checkLease`, with a
new constant `LEASE_FUTURE_TOLERANCE_MS = 60 * 1000` beside
`LEASE_MAX_AGE_MS`, and a new loud-proceed arm for it in `pulse/run.mjs`
after STOP and after the stale arm. When the mtime is ahead of now by more
than the tolerance, the reader returns `future` and the guard proceeds
loudly on clock skew under a line distinct from the aged-out one. When the
mtime is ahead by at most the tolerance, it stays fresh and refuses. Past
mtimes are unchanged: past the max is stale, at or under it is fresh.

Tolerance: 60 seconds. A holder writing from a machine a few seconds ahead
is doing nothing wrong, and filesystem granularity plus scheduling jitter can
put a healthy lease seconds in the future. Sixty seconds covers that with
margin while staying small against the fifteen-minute max and tiny against
the hours between scheduled firings. The maximum age itself is untouched.

What it costs at both ends, as required:

- Near end (within tolerance): a lease up to 60s in the future still refuses,
  so the longest refuse from now is max plus tolerance — 16 minutes. That
  60s past the max is the price of keeping jitter usable. Without it a
  slightly fast writer would have its lease disregarded at once and the brake
  would stop functioning under ordinary skew.
- Far end (beyond tolerance): a live holder more than 60s ahead has its lease
  disregarded at once, risking overlap with that holder while it runs. Such
  skew is itself a misconfiguration, and the distinct loud line makes it
  visible rather than silent. The alternative — honoring it — refuses for the
  skew plus the max, which is the outage this repair closes.

The repair creates no new forever-refuse: `future` proceeds, as `stale` and
`stat-failed` already did. A timing read that fails still proceeds; absent
still proceeds silently. Only a holder that keeps touching the file keeps it
fresh, which is a live holder rather than a dead one.

## 4. SECTION 4 RE-DERIVED — every state held against the sentence again

Sentence, with the loophole closed: no state of this file may cause the Pulse
to refuse past the maximum age — under the repair, past the max plus the
stated 60s tolerance at the near end, and past the max at all elsewhere.

- Absent proceeds at once. Holds.
- Every past fresh variant (valid holder, empty, garbage, JSON without
  holder, plain text, directory with fresh timing, exact-boundary fresh, the
  shipped fresh fixture): refuses now, but each carries a fixed mtime at or
  behind now whose age grows until it passes the max. Pinned anew: a newly
  written lease is stale one millisecond past max-plus-write. So no past
  mtime refuses past the max from now. Holds.
- Every within-tolerance future variant (one minute ahead, 30s ahead, age at
  negative tolerance): refuses now for at most max plus tolerance (16
  minutes). This is the stated near-end cost, bounded and small against the
  firing grid. Holds under the stated bound.
- Every beyond-tolerance future variant (90s, one hour, one day, ten years
  ahead; pinned tolerance-plus-one-millisecond): proceeds at once as
  `future`, loudly, with derived state written. Refuse duration zero. Holds —
  this is the row that failed before and passes now.
- Every stale variant (aged past max, stale directory, stale malformed, ten
  years old): proceeds at once as `stale`, loudly. Holds; the ten-year-old
  control proves the far behind end never turns into `future`.
- Every timing-read failure (denied, non-numeric mtime): proceeds at once as
  `stat-failed`, loudly, by construction. A read that fails once will usually
  fail again, so refusing on it would refuse forever; the design still
  refuses never on it. Holds, and the repair adds no path that refuses on an
  unreadable read.
- Holder naming of every shape (long, many-lined, empty, numeric, JSON
  without holder): never enters the decision; the mtime alone decides, and
  the far-end size and length controls above refuse or proceed exactly as
  their timings require. Holds.
- STOP plus a fresh lease: STOP is the visible reason, lease check never
  reached. Holds; order untouched.

The only way the Pulse keeps refusing is a holder that keeps touching the
file within tolerance of now, which is a live holder by definition, not a
file state refusing past the bound. Once touching halts, the file ages out
(or, if left ahead beyond tolerance, is disregarded at once) with nobody
needed to clear it.

## 5. The mutations — one per branch added or changed

Suite: 28 tests, 28 pass, 0 fail (`node --test` on
`pulse/tests/lease.test.mjs`). Each mutation below was applied, the suite
run, the edit restored, the suite run again; hashes after the final restore
match the pre-mutation baseline, so the tree is identical to the repaired
state.

Pre-mutation baseline hashes (2026-09-10), post-restore identical:

- `pulse/lib/core.mjs` 1f25c8914295f50257c27290463f6d7a443c3a764ae8011d5ddb2a9ba3cbecc5
- `pulse/run.mjs` bbab7a4de688c348175ea285d68efe38c1ea56c421f964d30365fba98dba642a
- `pulse/tests/lease.test.mjs` 84d828972fa5dd35e4c6a1ffb9c6977fc60e8403000870451446634540d19db7

| branch | mutation | before | mutated | restored | files identical |
|---|---|---|---|---|---|
| `checkLease` future arm in `pulse/lib/core.mjs` (new: `if (ageMs < -LEASE_FUTURE_TOLERANCE_MS) return future`) | Replace the condition with `if (false)` — the future arm can never fire. Reapply: in `checkLease`, change `if (ageMs < -LEASE_FUTURE_TOLERANCE_MS)` to `if (false)`, leaving the returned object untouched. | 28 pass, 0 fail | 23 pass, 5 fail: the 90s, one-hour, one-day, ten-year live runs refuse instead of proceeding as future, and the pinned tolerance-plus-one-millisecond case reads fresh instead of future | 28 pass, 0 fail | YES — hashes above match |
| tolerance value `LEASE_FUTURE_TOLERANCE_MS` in `pulse/lib/core.mjs` (new: `60 * 1000`) | Replace `60 * 1000` with `0` — no future mtime is tolerated. Reapply: change `export const LEASE_FUTURE_TOLERANCE_MS = 60 * 1000;` to `= 0;`. | 28 pass, 0 fail | 25 pass, 3 fail: the round-1 one-minute live run and the new 30s live run proceed as future instead of refusing, and the ten-year live run prints tolerance 0s instead of 60s | 28 pass, 0 fail | YES — hashes above match |
| guard arm for `future` in `pulse/run.mjs` (new: `else if (lease.state === 'future')` with its WARN line) | Replace the condition with `lease.state === 'future-never'` — the arm can never fire and a future state falls through silently. Reapply: change `} else if (lease.state === 'future') {` to `} else if (lease.state === 'future-never') {`. | 28 pass, 0 fail | 24 pass, 4 fail: the four beyond-tolerance live runs proceed to the queue but print no future WARN line, failing the loudness asserts; the pinned future case still reads future, isolating the failure to the guard line | 28 pass, 0 fail | YES — hashes above match |

A twin proves a branch can fire; only a mutation proves it must. The first
mutation proves the future arm must exist (without it, skew refuses). The
second proves the tolerance must be non-zero (without it, jitter is
unusable). The third proves the guard line must exist and be loud (without
it, skew is disregarded silently).

## 6. The new log line, quoted, and how it differs from the aged-out one

Aged-out line (`pulse/run.mjs`, stale arm), unchanged:

`pulse: WARN stale GATE_LEASE at ${lease.path} (age ${ageS}s exceeds max ${maxS}s) — disregarding it and proceeding; holder ${who} may have died without releasing.`

New clock-skew line (`pulse/run.mjs`, future arm):

`pulse: WARN future GATE_LEASE at ${lease.path} (mtime ${aheadS}s ahead of now, beyond tolerance ${tolS}s) — disregarding it and proceeding; holder ${who} looks skewed, check the writer clock.`

Observed live (fixture run, holder `gate-harness-probe-1`, mtime ten years
ahead, 2026-09-10):

`pulse: WARN future GATE_LEASE at C:\\Users\\BadBitch\\AppData\\Local\\Temp\\pulse-fixture-ISSVma\\GATE_LEASE (mtime 315360000s ahead of now, beyond tolerance 60s) — disregarding it and proceeding; holder gate-harness-probe-1 looks skewed, check the writer clock.`

How it differs: the aged-out line says `stale` with a measured `age`
exceeding `max` and attributes the disregard to a holder that may have died;
the new line says `future` with a measured `mtime ahead of now` exceeding
`tolerance` and attributes the disregard to a skewed writer clock. Shared
`WARN` plus `disregarding it and proceeding` marks both as loud proceeds;
distinct heads (`stale … age … max … may have died` vs `future … ahead …
tolerance … skewed`) keep a hurried reader from mistaking skew for age. The
refusal line (`GATE_LEASE present … refusing this run`) and the timing-failure
line (`cannot read mtime …`) are unchanged and match neither. Absent still
proceeds silently.

## 7. What I could not determine

- Whether 60s is the best tolerance for every future writer clock. It covers
  ordinary jitter with margin and keeps the worst refuse to 16 minutes, well
  under the firing grid; a deployment with routinely worse skew would need a
  larger band with eyes open about the longer worst refuse. That tuning is a
  finding for the maintainer, argued, not an edit made here.
- Whether the gate harness ever writes from a machine whose clock differs
  from the Pulse machine by more than the tolerance today. The repair makes
  such skew loud when it happens; until it fires, the size of that population
  is unknown.
- Link-creation privileges on some machines (round 1, rows 21-22): still
  dismissed for the same reason — setup needs privileges for a result
  identical to rows already covered. Nothing new learned.

## 8. Blocked or refused calls

None. No command was blocked or refused, and nothing was routed around.
