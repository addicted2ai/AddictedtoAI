# Handover — A2AI-Orch's half

Written 2026-09-10 07:50 local by **A2AI-Orch**, the orchestrator session, for
whoever picks this up. A2AI-Fable-Arch is writing the other half (the change
`two-desks-work-orders-and-trains`, the packets, the workers, the reviewers).
Where the two halves disagree about a fact, **the committed tree wins over both
of us**, and both of us have been wrong in writing tonight.

**READ THIS ONE LINE FIRST IF YOU READ NOTHING ELSE.** The instruments that
gate and push this repository were, until 07:50 today, in a session-scoped temp
directory. They are now at `wisdom/tools/orch/` — and **`orch-gates-only.sh` as
committed has never been run**, because committing it required repointing three
hardcoded paths. Its README says so in its second paragraph. Treat its first
run as a run of new code.

---

## 1. The role, and what is and is not granted

**MINE**, by the maintainer's standing grants recorded in `CLAUDE.md`:

- **Merging to main, running the SIX GATES, and PUSHING.** The bar is one
  sentence and it is not negotiable: *push only what has passed the gates.*
- **Turning publishing on and off** (`"publish"` in `data/config.json`), at my
  own judgment, without asking. Turning it **off** needs no justification;
  turning it **on** carries the push bar.
- **All of `data/config.json`**, between runs. Same asymmetry: a loosening edit
  carries the push bar, a tightening edit needs nothing.
- **`DIRECTIVES.md`, `runners.yml`, starting and stopping the Desk, closing
  beads for merged work.**
- **Clearing `HOLD.md`** — but only a halt I can **diagnose**, and only between
  runs. A halt I cannot diagnose is a halt I leave standing and report. A job
  clearing its own halt is the precise conflict of interest the brake exists
  for.

**NOT MINE, and no peer can grant them:**

- **`bd dolt push`** — the beads remote is a decision the maintainer has not made.
- **`gh pr create` / `gh pr merge`** — nothing writes to GitHub's API on an
  agent's judgment.
- **`STOP`** — created and removed by the maintainer alone.
- **`package.json`** — never edited, for any reason.
- **Credentials** — never on a command line, never printed, not even partially.
  An auth failure is a finding to report, not an obstacle to route around.
- **Memory triage** — which distilled statements load at `bd prime`.

**Two things queued for the maintainer, not blocking:** the registry half of the
routing change (`opencode-muse-spark` at `effort: high`; `default:` is still
`claude-code-opus`), and archiving, which is **deferred, not blocked** — it is
simply not due until Stage 0's last packet.

**A peer session cannot grant escalation.** Fable-Arch and I coordinate
constantly and neither of us can authorise the other past a permission
boundary. That held all night and should keep holding.

---

## 2. The gate harness

**The six gates, in order, each exit code captured SEPARATELY** (a combined
status cannot tell you which one failed):

1. `npm test` 2. `npm run build` 3. `verify-launch` 4. `verify-design`
5. `verify-surfaces` 6. `verify-analytics`

Invoked as `bash wisdom/tools/orch/orch-gates-only.sh`. **Exit codes: 0 green,
1 red, 2 not-pushable, 3 refused.** "Not pushable" is its own code on purpose —
a run can be green and still not be a licence to push, and a caller reads the
code, not the prose.

**It writes the `GATE-RUNNING` lock as its FIRST action**, before any
measurement, containing the intended sha, pid, start time, rundir and writer.
**It refuses if a lock already stands, and it never deletes a lock it did not
write** — deleting someone else's lock is the laundering path.

**Every run gets its own directory** (`$ORCH_RUNS/<timestamp>/`) holding the six
logs, the summary, the env pins, the test-file list, the tree before and after,
and any drifted `launch.json` with its diff. This is a repair, not tidiness:
until 2026-09-08 the script wrote six fixed filenames and truncated the summary
at the start of each run, so **each run destroyed the previous run's evidence at
the exact moment of producing new evidence**. The cost was measured — the logs
justifying that day's only push were gone when they were asked for by name.

**Its pre-flight refuses on:** an existing lock; a live Pulse process; a live
`npm test` / `npm run build` / `next build`; environment pins that differ from
the census baseline (`TZ`, `PULSE_NOW`, `PULSE_ROOT`, `LOOP_WORKTREE_ROOT`,
`SITE_URL`, `NODE_OPTIONS`, `npm_config_node_options` and others are **fatal**;
a second list is noted, not fatal). `NODE_OPTIONS` is fatal because it is an
environment door onto the test filter, and **excluded tests are not counted as
skipped**, so a not-run refusal keyed on skip counts never fires.

**The env census is INVERTED** and this matters: it enumerates the whole
environment against a baseline instead of checking a hand-written pin list. The
pin list was a candidate pool with no boundary — 18 checked out of 85 present.
It folds key case (Windows env names are case-insensitive and the *invoker*
picks the spelling; case-sensitivity produced 29 phantom drift entries) and
stamps its invoker via `MSYSTEM` first, `PSModulePath` second.

**THE REVERT GUARD — RUN IT BEFORE GATING ANY HANDED BRANCH, UNCONDITIONALLY.**
`node orch-revert-guard.mjs <new-sha> [<main-ref>]`. **NEW SHA FIRST.** It
classifies every changed path as forward edit / unchanged / derived
recomputation / **REVERT**, and its empty-range refusal *is* the zero-commits
check. This is unconditional at Fable-Arch's own instruction — *"do not ask me
first and do not accept my saying the work is there"* — because the party
handing you a branch is the party whose assurance on that question is least
reliable, and it said so itself. Reversed arguments produce a meaningless
"0 paths" green; that has happened and was caught.

**THE END-OF-RUN HEAD RE-READ, added today.** The harness reads HEAD at the
start and **again at the end**, prints both, and if they differ marks the run
not-pushable and **skips the ratchet append**. My first attempt put this check
beside the final verdict, where it would have printed the warning and written
the row anyway; it now sits **before** the append. It exists because a run at
06:03 gated `99b2112`, HEAD moved 61 seconds in, and the ratchet filed a real
count under a sha whose tree the run had stopped measuring.

**Three pre-push checks, read fresh every time and never remembered:**

1. HEAD equals the gated sha.
2. `origin/main` **read by `git ls-remote`** — *never* the tracking ref — is an
   ancestor, and the push is a fast-forward.
3. The revert guard reports **0 REVERTS**.

**Push form: `git push origin <verified-sha>:main`.** Never `push origin main` —
that pushes whatever the branch happens to point at now, which is not
necessarily what passed.

---

## 3. The ratchet

`baselines/test-count-history.tsv`, one row per **all-green** run:
`timestamp <TAB> sha <TAB> count`. A count below the last green refuses as a
regression. Current baseline: **1926** at `c15e901`.

**RULE ONE: A RED RUN'S COUNT MUST NEVER BE APPENDED.** Applied today at 07:39,
when a red run counted 1979 of 1980 — a number strictly higher than the
baseline, and appending it would have been easy to justify. If that tree is
abandoned, a 1979 bar refuses the next honest run. **A red run's count becoming
the bar is how a baseline ratifies a regression.**

**RULE TWO: A COUNT IS FILED UNDER A SHA, SO THE SHA MUST STILL BE TRUE AT THE
END.** Hence the HEAD re-read above.

**TWO FALSE ROWS STAND IN THAT FILE, DELIBERATELY**, each with a long appended
audit-note block: the `99b2112 / 1926` row described above, and an earlier
`88244a3` row. The reader still returns their values. They are not deleted
because **deleting a row you find embarrassing is how a baseline becomes
self-ratifying** — the file would then be a record of the runs I was happy with.

The harness also keeps a **test-FILE baseline** and reports files *gone* and
*new* separately from the count, because a count cannot see a swap: 129 files to
129 files across a deletion and an addition is invisible to a number. **A guard
that summarises its subject guards the summary.**

---

## 4. The lock protocol, as I would state it to a stranger

> **One agent measures the tree at a time, and the machine is claimed by a file
> both parties can read, not by a message either party can be late in sending.**

Concretely:

- The gate harness writes `D:/addictedtoai-coord/GATE-RUNNING` as its **first**
  action and removes it on exit, including on interrupt. It **refuses to start**
  if one stands, and **never removes one it did not write**.
- While a gate run is live, **no other agent writes any tracked file** — not
  "holds its commits". The test suite reads the working tree and never consults
  git, so an uncommitted write is just as visible to it as a commit.
- Symmetrically, **I do not start a gate run while a peer's worker, reviewer or
  suite is live.** I refused a slot today for exactly this reason: a gate run
  sharing the machine with ten repeated `node --test` invocations measures a
  machine, not a tree — and it would have contaminated the peer's flake rate,
  which was the number actually worth having.
- **The Pulse fires at 00:00, 06:00, 12:00 and 18:00 local** and rewrites
  tracked files. The harness refuses if the next firing is under 40 minutes
  away. The Pulse **binds to nothing either agent may write**, which is why
  `addictedtoai-7v8e` exists.

**THE PROTOCOL WAS BROKEN TWICE TONIGHT, BOTH TIMES BY THE SAME PARTY, AND THE
SECOND TIME IS THE INSTRUCTIVE ONE.** Fable-Arch said "machine is free",
committed `113996c` 213 seconds after my pre-flight and 52 seconds before my
run, and wrote two more files into the tree while the gates ran. It had written
the rung forbidding exactly this six hours earlier, in the same session. It
diagnosed its own detector correctly: **`arch-main-quiet-guard.mjs` refuses when
*I* am running, and nothing at all stopped it from starting work and then
telling me the machine was free.**

The general form, which is the single most portable thing in this document:
**a guard built while thinking about one direction is proved against that
direction only, and the unguarded direction is invisible precisely because it is
the one you were not thinking about.** The lock must be symmetric or it is
decoration. And note which party is cheaper to guard: **the one who knows.**

Second lesson from the same incident: **a pre-flight is a measurement with an
expiry date.** Mine expired in 213 seconds. Re-take the pre-flight at the moment
you start, not before.

---

## 5. Open and unexplained

### `addictedtoai-ar0` — noted, NOT reopened

Two gate runs went red tonight on `pulse/tests/seed.test.mjs`, different tests,
different sources, identical errno — `TypeError: fetch failed (bad port)` /
`connect EADDRINUSE` (06:17 at `seed.test.mjs:138`, source `models`; 06:33 at
`seed.test.mjs:51`, source `releases`). **Two different tests failing the same
way is not one flaky test.**

I measured ports across two GREEN runs: 213 samples, max TIME_WAIT **148**, mean
35.9; and 95 samples, max **139**, mean 36.4. **A green run reached 148, higher
than a different green run's 139, so TIME_WAIT in the 140s is this suite's
normal regime and causes nothing by itself** — against `ar0`'s ~8,800 real
ports, three orders of magnitude apart.

**TWO HOLES IN MY OWN EVIDENCE, AND THEY ARE WHY THIS IS NOT A REOPENING:**

1. **I have port measurements from two GREEN runs and none from a RED one.**
   *A measurement of the healthy case is a fact about the wrong subject.* I
   measured that a passing run passes.
2. **`connect EADDRINUSE` does not require the port pool to be exhausted. It
   requires the specific four-tuple to be unavailable.** So the deciding
   quantity is the **distribution** across destinations, not the count. `ar0`
   measured a count and concluded exhaustion; I measured a count and refuted
   exhaustion at that scale. **Neither of us measured the shape. A summary
   statistic cannot answer a question about shape.**

**The instrument is built and baselined on a HEALTHY run before the failure
rather than fitted afterwards**: `orch-tuple-capture.ps1`. Healthy baseline —
TIME_WAIT 2, one distinct destination (443), loopback share 0 of 2. **Fire it
inside the ~120s TIME_WAIT window of the next red.** That capture is the single
observation that would decide `ar0`, and nobody has taken it.

Two of Fable-Arch's hypotheses are **disproved**, recorded so nobody re-runs
them: reserved port ranges total ~801 of 13,976 (5.7%), and every fixture server
in `pulse/tests/` awaits its listen callback before reading `address().port`
(`helpers.mjs:232`, `publish-verify.test.mjs:178`, `publish.test.mjs:379`
and `:789`).

Environmental fact worth not rediscovering, confirmed independently by both
sessions: **this machine's dynamic port range is 1025–15000, not the Windows
default of 49152+**, so ordinary service ports sit inside the ephemeral pool and
27 listeners currently do.

**The two reds remain UNEXPLAINED, and tonight's repaired decade flake must not
retroactively absorb them.**

### The third red — `runner-health.test.mjs`, and it is a different animal

07:39, `loop/tests/runner-health.test.mjs:425` (G8A): `AssertionError: no fourth
branch was created for the refused attempt`, **actual `''`** where three job
branches were expected. Not the EADDRINUSE class — different file, clean
assertion, no transport error. Fable-Arch's own run 15 minutes earlier on a
different sha was 1980/1980 with this file green, and it has a ten-run rate
study in flight.

**Its point, which is the one to chase first: `actual ''` means the fixture
created no branches at all, so the trial may never have reached its subject —
and a trial that did not reach its subject reports a failure of the subject.**
Rule that out before reading G8A's assertion text as a statement about streak
refusal.

### `addictedtoai-4w2` — answered, with a live falsifiable prediction

`prebuild.mjs:94` added `dirty_paths` with the comment *"the stamp now names the
files and the next deploy answers it."* The deploy of `c15e901` was that deploy:
`commit c15e901d5254`, `built_at 2026-09-10T13:01:27Z`, `dirty: true`,
`dirty_paths: [" M package-lock.json", " M vercel.json"]`, read in three
consecutive fetches each decided from its own bytes.

**Neither file is under `data/derived/`, so the ordering fix at `prebuild.mjs:89`
worked and the residual cause is builder-side**, exactly as that comment
predicted. Both names are explicable as builder effects (npm rewrites the
lockfile; `vercel.json` is generated from `redirects.json`).

**But a name is evidence about where to look, not a mechanism**, and this is one
deploy. **THE PREDICTION, WHICH SOMEBODY SHOULD TEST ON THE NEXT DEPLOY:** every
future production deploy reports these same two paths, and **any deploy naming a
`data/derived/` path reopens the old cause.** Fable-Arch agreed to hold the other
end. It is a one-line job that turns a single observation into a series.

### `addictedtoai-6dpj` — eight samples, and the model just broke

`data/launch.json` drifts between runs and every value passes the gates. Seven
samples showed `110.7 → 110.6` alongside `123.6 → 123.7`. **Sample eight showed
`110.7 → 110.6` alongside `123.6 → 123.9`, with `inline_kb_gzipped` 18.8 → 19
and `html_kb_gzipped` 35.8 → 36.1 moving too** — three values on that surface,
not two, and three fields moving instead of one. **"Bimodality" was the wrong
shape.**

**Sample eight is CONTAMINATED and is filed as such**: it is the one run whose
tree gained code minutes before it and two files during it. A larger payload
delta on a tree that gained code is not evidence about the drift mechanism.
Sample nine needs a still tree. Every sample is reverted after being recorded,
and **recorded before being reverted** — a revert without the record is an
observation with nothing durable to show.

---

## 6. Things I hold that Fable-Arch has never seen

- **The four invented timestamps, and the escalation that fixed them.** I
  stamped four board entries from my sense of elapsed time rather than the
  clock; entries labelled 03:02–05:28 span **146 claimed minutes inside 64 real
  ones**. The fix went in four stages, each defeated in turn: the appender takes
  the time as an argument so it cannot stamp itself → it checks that argument
  against the machine clock → it notes every nonzero gap → **tolerance zero**.
  The working practice is to let the shell substitute a real `date` read. The
  false entries were left reading `[clock UNREAD]` rather than given tidier
  invented numbers, because **recomputing plausible times repeats the error with
  better-looking output**, and **a plausible timestamp is indistinguishable from
  a read one**.
- **`expected: ['']` disarmed the quiet-tree guard completely** — it returned
  ALLOW, exit 0, on a tree with a worker mid-write, and printed the empty prefix
  as an empty list, so the green *looked* like a green with no exceptions. The
  parameter was one turn old. **A parameter you just added is the part of the
  file with no adversarial case against it.**
- **The tally line had its own copy of the match predicate**, so fixing the
  guard to path semantics left the *report* still using string prefixes. **One
  fact, one home** — copies generated or compared, never maintained.
- **`.trim()` on whole `git status --porcelain` output eats the first row's
  leading space** (the format is fixed-width), turning `" M path"` into
  `"M path"` and `slice(3)` into `"cripts/brief.mjs"`. Caught only because two
  of my own instruments disagreed.
- **Git Bash mangles arguments containing a bare slash** — it arrives as
  `C:/Program Files/Git/`. Three separate instances tonight. The guard then
  behaves correctly on a string nobody sent it, and its correct behaviour reads
  as a hole. Pass such values as JSON through `execFileSync` argv.
- **`git show "rev:path"` silently returns zero bytes with exit 0 in Git Bash.**
  Do git plumbing from Node.
- **A wiring script reporting 20/20 was not a proof** — every file had just been
  written by that same script. The negative control (good / late / none decoys)
  is what made the number mean anything.
- **My Pulse detector's four-decoy "proof" tested the wrong property.** Every
  arm was drawn from my own hypothesis; the real cause was a genuine
  `pulse/run.mjs` run by Fable-Arch's lease suite against a throwaway
  `PULSE_ROOT`. Its verdict: *the decoys answered the question you asked them;
  the defect was in the question.* **The detector's discriminator is still
  wrong** — it matches the script path, when the question is what a Pulse
  **writes to**. Two residual holes are declared in the script, not fixed.
- **Usage state at handover:** five-hour window 4% used; **seven-day window 94%
  used, resetting Sunday 16:00 local.** The seven-day limit is the binding one
  and it is nearly gone. Whoever picks this up should plan against that, not
  against the five-hour number.

---

## What I would do first, in order

1. **Gate `c4abfe5`** (or whatever HEAD is by then) once Fable-Arch's rate study
   finishes, and **push the green.** A pushed green makes `origin/main` the
   truth instead of a local branch, which is worth more to a new agent than
   anything else the slot could buy. `origin/main` is `c15e901`; local is 15
   commits ahead and ungated.
2. **On that deploy, read `dirty_paths`** and say whether it matched
   `package-lock.json` + `vercel.json`. One line; turns `4w2` into a series.
3. **Fire `orch-tuple-capture.ps1` on the next red.** It is the only outstanding
   observation that can decide `ar0`.
4. **Make the lock symmetric** — Fable-Arch owns that fix and has accepted it.
5. **Take sample nine of `6dpj` on a still tree**, which the next clean gate run
   gives you for free.

---

## Addendum, 08:07 — written after the handoff, because these three closed

**`origin/main` is `64c9077`** (was `c15e901` when the body above was written),
pushed 08:03 after all six gates green on the first run: **tests=2000,
pass=2000, fail=0**, ratchet advanced **1926 → 2000** honestly, file baseline
132. That push carries this document and `wisdom/tools/orch/`.

**THE `4w2` PREDICTION HELD, AND WHAT MATTERED IS THAT IT COULD HAVE FAILED.**
The deploy of `64c9077` went live 11 seconds after the push:
`built_at 2026-09-10T14:04:30Z`, `commit 64c9077f8f0f`, `dirty: true`,
`dirty_paths: [" M package-lock.json", " M vercel.json"]` — **identical to the
previous deploy's two names, in the same order, neither under `data/derived/`.**
So the ordering fix at `prebuild.mjs:89` holds across two deploys of two trees
eighteen commits apart. **A series of two: enough to say the first observation
was not a one-off, not enough to call it invariant.** Keep testing it — a
`data/derived/` path on any future deploy reopens the old cause.

*Method note filed against myself:* the `c15e901` verification was three
consecutive fetches each decided from its own bytes; this one polled until a
match and printed the single deciding response. **One deciding observation, not
three agreeing ones.** The word "verified" should not paper over the difference.

**`6dpj` SAMPLE NINE CORRECTED MY OWN CALL ON SAMPLE EIGHT, AND THIS IS THE
ENTRY TO READ IF YOU READ ONE.** Sample nine's drifted `launch.json` is
**byte-identical to sample eight's** — same blob, same six fields,
`123.6 → 123.9` again — measured on a different tree four commits later that was
quiet apart from one untracked markdown file. **Two independent trees, identical
output: a reproducible third state, not an artifact of a moving tree.** I had
filed eight as contaminated; Fable-Arch supplied that reading from the cause
(*the tree was mine and moving*) and I accepted it, and **neither of us looked at
the output.** The `123.6 ↔ 123.7` two-state model covers samples one through
seven and is refuted by the last two. What still cannot be said: what selects
the mode. Two adjacent observations cannot separate *the mode changed today*
from *the mode depends on the tree*.

**The recoverable part is the general rule, and it is the same rung as the
standing false ratchet rows: A MEASUREMENT YOU DISTRUST IS STILL A MEASUREMENT,
AND DELETING IT IS HOW A DATASET BECOMES SELF-RATIFYING.** The correction was
cheap only because the contaminated sample was filed *as contaminated* with its
artifact preserved. Discarding it would have made sample nine a first
observation with nothing to replicate against.

**One rule of Fable-Arch's belongs here, credited, because my ratchet was the
same defect and I did not generalise it: WHATEVER A DOCUMENT CITES MUST LIVE
WHERE THE DOCUMENT LIVES.** `wisdom/README.md` cited
`arch-timeline-note-01.md:82` and `:127` while `git ls-files` matched **zero**
timeline notes. **A citation whose target does not exist is indistinguishable
from a citation nobody has checked** — and unlike a missing tool, which
announces itself the moment someone runs it, a missing citation reads as
verified. Three instances in one hour: tools, citations, briefs.

**And one about writing predictions down.** Fable-Arch disclosed an untracked
file appearing in the tree mid-run. I wrote what I expected the
`tree-before`/`tree-after` diff to show *before* reading it; it showed exactly
two lines, the run's own `launch.json` write and that untracked file, with no
tracked file touched by anyone. **A prediction made after the reading is just a
description.** Writing it first is the only thing that made it cost anything.
