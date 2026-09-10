#!/usr/bin/env bash
# THE SIX GATES ON A TREE SOMEONE ELSE MERGED. No merge, no reset, no push.
#
# WHY THIS EXISTS SEPARATELY FROM orch-window3.sh. The agreed separation for the
# Stage 0 packets is that A2AI-Fable-Arch AUTHORS and MERGES, and A2AI-Orch
# GATES — an author must not also be the verifier. orch-window3.sh merges AND
# gates, and it refuses to run at all without PAIRS, so using it here would
# either re-merge a branch Fable-Arch already merged or refuse outright. A
# tool that does more than the job is not safer than one that does the job.
#
# WHAT IT GUARANTEES:
#   - SIX EXIT CODES CAPTURED SEPARATELY. A task status line is not a pass.
#   - A gate returning in under a second DID NOT RUN, and is refused. The
#     5-surfaces exemption that used to sit here is gone: it rested on an
#     impression, and five measured runs put that gate at 3.54-5.87s.
#   - verify-launch must NAME which build path it took. Packet A lets it REUSE
#     the build gate 2 produced, which is 39 of its 39.6 measured seconds (one
#     recorded run, 2026-09-08, the build figure derived by difference), so a
#     legitimate run can return in about a second and a duration test alone
#     would refuse the improvement it exists to protect. Evidence of work, not
#     elapsed time.
#   - IT NEVER PUSHES. Publishing is a separate, deliberate act; this script
#     reports and stops. `data/config.json` is read, not remembered.
set -uo pipefail
# PATHS. THESE WERE HARDCODED TO ONE SESSION'S TEMP DIRECTORY UNTIL 2026-09-10
# 07:5x, WHICH IS WHY THIS FILE IS NOW IN THE REPOSITORY AT ALL. A harness that
# gates and pushes lived in a directory that dies with the session that made it.
#
#   R     the repository under test.
#   S     where THIS script's siblings live (orch-env-census.mjs,
#         orch-gate-analytics.sh). Defaults to this script's own directory, so a
#         checkout works with no configuration.
#   RUNS  where per-run evidence AND the three baselines live. DELIBERATELY NOT
#         UNDER $R AND DELIBERATELY NOT $S. This script APPENDS to the ratchet
#         and writes a rundir on every run; if that landed inside the repository
#         it would dirty the tree DURING the run it is measuring — the exact
#         defect the quiet-tree guard exists to catch, installed by the guard's
#         own author. The committed copies under baselines/ are SEEDS: copy them
#         to $RUNS once, then let the live ones diverge.
R="${ORCH_REPO:-D:/AddictedtoAI}"
S="${ORCH_TOOLS:-$(dirname "$0")}"
RUNS="${ORCH_RUNS:-${TMPDIR:-/tmp}/orch-gate-runs}"
mkdir -p "$RUNS"

# EVERY RUN GETS ITS OWN DIRECTORY, AND THIS IS A REPAIR, NOT A TIDINESS CHANGE.
# Until 2026-09-08 18:40 this script wrote six FIXED log names into $S and
# truncated one fixed summary with `: > "$SUM"` at the start of every run. So
# each run silently destroyed the previous run's evidence — and it did so at the
# exact moment of producing new evidence, which is the worst possible time to be
# quiet about it.
#
# MEASURED COST, the reason this is written down rather than just fixed: the six
# green gates at b8fa5c1 justified the ONLY push of 2026-09-08. When
# A2AI-Fable-Arch asked for those logs by name at 18:35 for the change's
# evidence/ directory, they were gone — overwritten in place at 17:55-17:58 by
# the d8522ac run. A search of the whole scratchpad for files written between
# 16:20 and 16:50 returned exactly one, and it predated the run. There was no
# backup and nothing was committed. The record for that push is now the board
# entries and the live-site check, which attest the DEPLOY and not the GATES.
#
# Nothing warned me. An evidence-producing tool that destroys evidence has no
# failure mode a reader can see: the summary looks complete, because it IS
# complete — for the wrong run. Hence a per-run directory and a refusal below if
# it somehow already exists.
RUNDIR="$RUNS/$(date '+%Y%m%d-%H%M%S')"
if [ -e "$RUNDIR" ]; then
  echo "REFUSING: $RUNDIR already exists. Two runs in the same second would overwrite each other, which is the defect this directory exists to fix."
  exit 3
fi
mkdir -p "$RUNDIR" || { echo "REFUSING: could not create $RUNDIR"; exit 3; }
SUM="$RUNDIR/summary.txt"
: > "$SUM"
say() { echo "$*" | tee -a "$SUM"; }

# ===========================================================================
# THE GATE-RUNNING LOCK, WRITTEN BEFORE ANY MEASUREMENT, AND THE REASON IS
# MEASURED RATHER THAN ARGUED.
#
# A2AI-Fable-Arch built a guard that refuses to commit to main while a gate run
# is live, and reasoned that the PROCESS TABLE was the real instrument because a
# lock only I set has its subject list written by the party it guards against.
# That principle is sound and it was the wrong tool here. From this morning's run
# log, timestamps as recorded:
#
#     06:03:06   harness starts
#     06:04:07   c15e901 commits to main
#     06:06:42   `run-tests.mjs` first exists in the process table
#
# THERE IS A 3 MINUTE 36 SECOND WINDOW AT THE FRONT OF EVERY RUN IN WHICH NO
# GATE PROCESS EXISTS, and the collision landed 61 seconds into it. A table-only
# guard would have read the table at 06:04:07, found nothing, and correctly
# reported quiet. **AN AUTOMATIC SIGNAL IS NOT AUTOMATICALLY THE STRONGER ONE —
# ASK WHERE ITS BLIND WINDOW IS. A DETECTOR THAT CAN ONLY SEE A PROCESS ONCE THE
# PROCESS EXISTS IS BLIND FOR EXACTLY AS LONG AS THE SETUP TAKES**, and setup is
# when a run looks idle to everybody else.
#
# So this is written FIRST — before the census, before the pins, before the
# `.next` measurement — because a lock taken after the setup would reproduce the
# hole it exists to cover.
#
# THE TRAP IS THE HALF THAT MATTERS AND IT IS PROVED, NOT ASSERTED. A LOCK THAT
# SURVIVES A CRASH IS WORSE THAN NO LOCK: it fails in the direction that gets it
# deleted, and a stale lock teaches the next reader to ignore the file. EXIT and
# INT/TERM both clear it.
LOCK="D:/addictedtoai-coord/GATE-RUNNING"
if [ -e "$LOCK" ]; then
  echo "REFUSING: $LOCK already stands —"
  sed 's/^/    /' "$LOCK"
  echo "  Either a gate run is live, or an earlier one died without its trap firing."
  echo "  Check the process table before removing it by hand."
  exit 3
fi
printf 'sha_intended\t%s\npid\t%s\nstarted\t%s\nrundir\t%s\nwriter\tA2AI-Orch\n' \
  "$(git -C "${R:-D:/AddictedtoAI}" rev-parse --short HEAD 2>/dev/null || echo unknown)" \
  "$$" "$(date '+%Y-%m-%d %H:%M:%S %Z')" "$RUNDIR" > "$LOCK"
cleanup_lock() { rm -f "$LOCK"; }
trap cleanup_lock EXIT
trap 'cleanup_lock; exit 130' INT TERM

say "run directory: $RUNDIR"
say "GATE-RUNNING lock written at $LOCK (pid $$); it clears on exit, including on abort."
say "  (per-run since 2026-09-08; earlier runs shared fixed names and overwrote each other)"

# --- refusals, before a single gate runs --------------------------------------
LOOPS=$(powershell -NoProfile -Command "@(Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -like '*loop*run.mjs*' }).Count" 2>/dev/null | tr -d '\r\n ')
[ "$LOOPS" != "0" ] && { say "REFUSING: $LOOPS loop process(es) alive. npm test takes the machine-wide build lock and a running job's gate would wait the full 600s and be booked failed."; exit 3; }

# A RUNNING PULSE, WHICH THE CLOCK GUARD BELOW STRUCTURALLY CANNOT SEE.
#
# The two checks answer different questions and only this one is about the
# machine: the clock guard asks "is a firing DUE", this asks "is one RUNNING".
# A Pulse started by hand, or one still going after its window closed, is
# invisible to a clock. A gate run that starts into a live Pulse gets the same
# corruption as one that straddles a firing, arriving from the other direction.
# Named by A2AI-Fable-Arch after I shipped the clock guard one-sided.
# A REFUSAL THAT NAMES A COUNT AND NOT ITS SUBJECT CANNOT BE DIAGNOSED, AND I
# JUST FAILED TO DIAGNOSE ONE. At 06:30:24 this check refused with "1 Pulse
# process(es) alive" and printed nothing else. By 06:31:14 the count was 0 and
# the process was gone, so THERE IS NO WAY TO KNOW WHAT IT MATCHED — a real
# Pulse, or a false positive on `pulse-lease` in some peer's watcher path. The
# contender check twenty lines below has printed pids and command lines since it
# was written; this one never did, and the asymmetry survived because this
# branch had never fired.
#
# `*pulse*run.mjs*` is a `-like` glob, so it matches ANY command line with
# "pulse" somewhere and "run.mjs" somewhere after it — a peer script named
# `*-run.mjs` operating on `D:/addictedtoai-worktrees/pulse-lease` satisfies it
# without being a Pulse at all. Narrowed to the actual entrypoint, and BOTH
# separators, because this repository is driven from Git Bash and PowerShell and
# the same path is written `pulse/run.mjs` and `pulse\run.mjs` depending on who
# spawned it.
#
# It still REFUSES rather than warning — a live Pulse rewriting the derived tree
# under a gate run is the one thing this cannot measure through — but the
# refusal now carries what a person needs to check it in the ten seconds before
# the evidence evaporates.
PULSE_PS="Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'pulse[/\\\\]run\.mjs' }"
PULSES=$(powershell -NoProfile -Command "@($PULSE_PS).Count" 2>/dev/null | tr -d '\r\n ')
if [ "$PULSES" != "0" ]; then
  say "REFUSING: $PULSES Pulse process(es) alive. It rewrites content/, data/changes.jsonl and the whole derived tree and COMMITS, so a gate run beside it measures a tree that is still moving."
  powershell -NoProfile -Command "$PULSE_PS | ForEach-Object { '    pid {0} started {1}: {2}' -f \$_.ProcessId, \$_.CreationDate, \$_.CommandLine.Substring(0,[Math]::Min(200,\$_.CommandLine.Length)) }" 2>/dev/null | tr -d '\r' | tee -a "$SUM"
  say "  (pattern: pulse[/\\]run.mjs — the entrypoint, not any command line mentioning a pulse worktree)"
  exit 3
fi

# ANYTHING THAT TAKES THE MACHINE-WIDE LOCK — NOT A LIST OF ENGINES I CAN NAME.
#
# THIS EXISTS BECAUSE I CAUSED THE FAILURE IT PREVENTS, at 01:59 on 2026-09-10.
# I started this script on the live tree while A2AI-Fable-Arch's lease worker was
# running its suite in D:/addictedtoai-worktrees/pulse-lease. `linkNodeModules`
# junctions every worktree to the MAIN `node_modules`, and the lock key is
# sha256(realpath(node_modules)) — so a worktree suite and a gate run contend for
# the SAME machine-wide lock. My run took it; a `node --test
# pulse/tests/lease.test.mjs` appeared two minutes later, when I killed mine and
# its dead pid was reclaimed. Had I not killed it, that worker could have waited
# the full timeout and been refused, and the refusal would have been diagnosed
# in a lease packet at two in the morning as a defect of the lease packet.
#
# THE TWO CHECKS ABOVE NAME THE TWO WRITERS I COULD THINK OF. This one names the
# PROPERTY: any node process that takes or waits on the test or build lock. A
# guard written as a list of the instances you can name is a guard that misses
# the next instance, and the next instance is always the one that bites — the
# same shape as counting one lock acquisition when the sequence makes three.
#
# AND IT MATCHES LOCK ACQUIRERS ONLY, WHICH IS A CORRECTION TO MY FIRST DRAFT.
# I first matched a bare `--test` as well. A2AI-Fable-Arch measured that its
# workers run their suites as bare `node --test <file>` — which takes NO lock,
# because `run-tests.mjs` is the only test-lock acquirer and nothing under
# `pulse/` imports build-lock at all — and that they run almost continuously. So
# that arm would have made this gate unstartable most of the night FOR A REASON
# THAT IS FALSE. A refusal whose stated reason is wrong half the time is how a
# guard gets switched off. If concurrent suites ever need refusing for CPU or
# flake reasons, that is a SECOND guard with its own justification, not a
# widened arm on this one.
#
# The acquirers, and nothing else: `run-tests.mjs` (TEST lock), `prebuild.mjs`
# (BUILD lock), and the callers that spawn them — `npm test`, `npm run build`,
# and verify-launch's own spawned build.
CONTENDERS=$(powershell -NoProfile -Command "@(Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'run-tests\.mjs|prebuild\.mjs|npm test|npm run build|next build' }).Count" 2>/dev/null | tr -d '\r\n ')
if [ "$CONTENDERS" != "0" ] && [ -n "$CONTENDERS" ]; then
  say "REFUSING: $CONTENDERS node process(es) are running a test suite or a build."
  say "  They contend for the SAME machine-wide lock as this run — every worktree is"
  say "  junctioned to the main node_modules and the lock is keyed on its realpath."
  say "  Starting here would make one of us wait the full timeout and be booked failed."
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'run-tests\.mjs|prebuild\.mjs|npm test|npm run build|next build' } | ForEach-Object { '    pid {0} started {1}: {2}' -f \$_.ProcessId, \$_.CreationDate, \$_.CommandLine.Substring(0,[Math]::Min(100,\$_.CommandLine.Length)) }" 2>/dev/null | tr -d '\r' | tee -a "$SUM"
  exit 3
fi
for f in "$R/HOLD.md" "$R/STOP"; do
  [ -f "$f" ] && { say "REFUSING: $(basename "$f") stands."; exit 3; }
done

# THE SCHEDULED PULSE, AND WHY NO HOLD ANYONE PLACES CAN STOP IT.
#
# `Get-ScheduledTask 'AddictedtoAI Pulse'` is ENABLED with four daily triggers,
# 00:00 / 06:00 / 12:00 / 18:00 local. It fired at 00:00:41 on 2026-09-10 and
# committed 59f2d8f — 16 files, 8,294 insertions across content/, changes.jsonl
# and the whole derived tree — into a working tree carrying four ungated
# commits. Nothing was pushed, and `publish: false` was the ONLY reason.
#
# A GATE RUN TAKES ABOUT SEVEN MINUTES. A run that straddles a firing has
# tracked files rewritten under it mid-flight, which is exactly what invalidated
# run 2 on 2026-09-09 (mem-cond wrote FULL-MEM-LOG.md inside the window and
# mem-log-integrity.test.mjs reads it) — except the Pulse cannot read the
# coordination board, cannot be told, and will not answer a message. Every hold
# placed this evening was an AGREEMENT BETWEEN SESSIONS, and agreements do not
# bind a scheduler.
#
# AND `HOLD.md` DOES NOT HELP, WHICH IS THE PART THAT SURPRISED ME. Checked in
# the source rather than assumed: pulse/run.mjs:80 exits immediately on `STOP`,
# so STOP is the one brake that binds this writer — and STOP is the maintainer's
# alone, created and removed only by him. `HOLD.md` is read by
# pulse/lib/publish.mjs and suspends PHASE 2 ONLY: the fetch, snapshot, diff,
# derive and COMMIT of phase 1 all still happen. So a hold protects the remote
# and does nothing whatever for the tree a gate run is measuring.
#
# THIS IS THEREFORE A SCHEDULING REFUSAL, NOT A LOCK, and it is interim. The
# real repair is a run-scoped fact the Pulse itself consults, which is
# production code in pulse/ and belongs in a reviewed packet. What this does is
# refuse to START a run that would still be going when the next firing lands.
# THE THRESHOLD IS DERIVED, NOT SAMPLED, AND THE FIRST VERSION OF IT WAS SAMPLED.
#
# I set this to 12 from ONE observation — the C1 run at 7m02s — and wrote "runs
# finish inside 12 minutes" as the premise. RUN LENGTH IS A RANGE, and a
# threshold picked from one convenient point inside a range is a conclusion
# drawn across the whole of it. A2AI-Fable-Arch named that class tonight from a
# lease packet whose future-mtime control sat one minute ahead while the same
# state at ten years ahead refuses for 3,650 days.
#
# THE REFUTING SAMPLE WAS ALREADY ON MY OWN DISK. Wall clock across all eleven
# complete runs in gate-runs/: min 6.6m, median 6.9m, MAX 20.0m. The maximum is
# the 2026-09-09 18:46 run, which waited the full build-lock timeout and came
# back RED environmentally. Ten of eleven sit between 6.6 and 8.0 minutes and
# the eleventh is nearly three times the median.
#
# SO THE CEILING IS NOT THE SUITE, IT IS THE LOCK WAIT — and my first derivation
# from that was ALSO wrong, one call site short, which A2AI-Fable-Arch caught by
# reading the derivation I had written into this file rather than the number I
# had reported. THAT IS THE ARGUMENT FOR PUTTING DERIVATIONS IN SCRIPTS.
#
# I wrote "8 + 10 = 18, so 22". It assumed ONE lock acquisition. THIS SCRIPT
# ACQUIRES THREE, and I can count them because I own the sequence:
#
#   gate 1  npm test        -> run-tests.mjs takes the TEST lock
#                              (TEST_LOCK_SUFFIX — a DIFFERENT file from the
#                              build lock, not shared)
#   gate 2  npm run build   -> prebuild.mjs takes the BUILD lock
#   gate 3  verify-launch   -> spawns `npm run build` of its own
#                              (verify-launch.mjs:298), so prebuild.mjs takes
#                              the BUILD lock A SECOND TIME
#   gates 4,5,6             -> no build, no lock. Checked, not assumed:
#                              verify-design has no build call at all, and the
#                              single "npm run build" string in each of
#                              verify-surfaces and verify-analytics is PROSE in
#                              a comment, not a spawn.
#
# A refused gate spends its WAIT instead of its WORK, so the worst case is
# roughly max(work, wait) per acquisition: 600 + 600 + (600 + verify-launch's
# own ~220) + ~60 for the last three = about 32 minutes, before overhead.
#
# EMPIRICAL ANCHOR, the 2026-09-09 18:46 run: 1-test 318s (ran), 2-build 601s
# (WAITED THE FULL TIMEOUT AND REFUSED), 3-launch 218s (acquired), rest normal —
# 19m59s wall. ONE acquisition waited. Two more could have.
#
# AND THE CONSTANT IS NOT THE OPERATIVE VALUE, WHICH IS THE PART I WOULD HAVE
# MISSED ENTIRELY. Both readers are `env ?? DEFAULT_WAIT_MS`:
#   scripts/run-tests.mjs:105   ATAI_TEST_LOCK_WAIT_MS  ?? DEFAULT_WAIT_MS
#   scripts/prebuild.mjs:53     ATAI_BUILD_LOCK_WAIT_MS ?? DEFAULT_WAIT_MS
# and something DOES set them: loop/lib/gates.mjs:598-599 sets both to
# `lockWaitBudget(timeoutMs)` for a DESK JOB's gates. So "the wait is ten
# minutes" is true of THIS caller and false of that one. Verified for this
# harness at derivation time: both variables are unset in the shell that runs
# this script, so the fallback is what applies here.
#
# 40 covers the derived ~32 with margin. It refuses 4 x 40 = 160 of 1,440
# minutes, 11% of the day, and that is the honest price of the interim measure.
# THE REAL FIX IS THE LEASE (addictedtoai-7v8e), which makes all of this moot by
# having the PULSE refuse rather than having this script predict its own length.
PULSE_GUARD_MIN=${PULSE_GUARD_MIN:-40}
# Every declared override lands here so the FINAL verdict can carry it. A stamp
# printed only where the override was taken sits hundreds of lines above the
# green, and the green is what gets read and relayed — the noisiest-part rule
# turned around: the LAST word is where a caveat has to be, not the honest place
# it was first noticed.
PIN_DECLARED=""
NOW_MIN=$(( 10#$(date '+%H') * 60 + 10#$(date '+%M') ))
NEXT_MIN=99999
for t in 0 360 720 1080 1440; do
  [ "$t" -ge "$NOW_MIN" ] && [ "$t" -lt "$NEXT_MIN" ] && NEXT_MIN=$t
done
MINS_TO_PULSE=$(( NEXT_MIN - NOW_MIN ))
if [ "$MINS_TO_PULSE" -lt "$PULSE_GUARD_MIN" ]; then
  say "REFUSING: the scheduled Pulse fires in ${MINS_TO_PULSE} minute(s) (00:00/06:00/12:00/18:00 local)."
  say "  A gate run takes ~7 minutes, so this one would still be running when it writes."
  say "  The Pulse rewrites content/, data/changes.jsonl and the whole derived tree and COMMITS."
  say "  It cannot be held: HOLD.md gates only its publish phase, and STOP is the maintainer's alone."
  # THE OVERRIDE USED TO BE FREE, AND THIS GUARD SITS ON THE UNSAFE BOUNDARY.
  # Corrected 2026-09-10 (clock NOT read; between 02:59 and 04:03) by applying A2AI-Fable-Arch's test — THE QUESTION
  # IS NOT WHETHER THE MESSAGE NAMES A REMEDY, IT IS WHETHER THE REMEDY CAN BE
  # PERFORMED WITHOUT KNOWING ANYTHING.
  #
  # This line used to read: "or set PULSE_GUARD_MIN=0 if you know why that is
  # safe." `PULSE_GUARD_MIN=0` costs nothing, silences the guard completely, and
  # the qualifier is pure honour system — the reader most likely to type it is
  # the one who wants the gate to start NOW, which is exactly the state the
  # guard exists for. It is the same laundering path as "raise the tolerance",
  # and I had already written the counter-example beside it: ORCH_ALLOW_ENV_PINS
  # proceeds but STAMPS THE RUN, so its remedy carries a cost.
  #
  # I checked all four of my remedies an hour ago and passed this one, because I
  # was asking "does the remedy work" and not "what does the remedy cost". A
  # WORKING REMEDY AND A SAFE REMEDY ARE DIFFERENT QUESTIONS AND I ANSWERED ONE
  # OF THEM TWICE.
  say "  Wait for the Pulse to finish and re-run — that costs you minutes and nothing else."
  say "  PULSE_GUARD_MIN=0 will proceed, but the run is then STAMPED NOT-PUSHABLE:"
  say "  the Pulse can rewrite tracked files mid-run, so its six exit codes would"
  say "  describe a tree that no longer exists. That is not a green you may push."
  if [ "${PULSE_GUARD_MIN}" != "0" ]; then exit 3; fi
  say "  PULSE_GUARD_MIN=0 — PROCEEDING INSIDE THE PULSE WINDOW. NOT PUSHABLE."
  PIN_DECLARED="$PIN_DECLARED pulse-window"
fi
say "next scheduled Pulse in ${MINS_TO_PULSE} minute(s); guard wants ${PULSE_GUARD_MIN}."
RUN_T0=$(date +%s)
PULSE_DEADLINE=$(( RUN_T0 + MINS_TO_PULSE * 60 ))

# THE PIN. Optional first argument: the sha the operator ANNOUNCED. If HEAD has
# moved since, this refuses and says what moved.
#
# WHY, measured 2026-09-08: I announced "gating 3f748af" and this script's own
# log then read "gating HEAD a2eec9f" — a2eec9f had landed between my read and
# the script's. Both reads were correct; the window sits BETWEEN two correct
# observations, so no amount of care at the announcement closes it. A sha is
# immutable and HEAD is not, and the bug is announcing the former while the run
# consults the latter (A2AI-Luna-Boss-2's statement of it).
#
# The refusal NAMES BOTH SHAS AND THE FILES BETWEEN THEM, so a stop is a
# diagnosis rather than a wall — otherwise the operator reconstructs it by hand,
# which is where the next error comes from.
HEAD_SHA=$(git -C "$R" rev-parse --short HEAD)
ANNOUNCED="${1:-}"
if [ -n "$ANNOUNCED" ]; then
  # `git rev-parse deadbeef` ECHOES THE ARGUMENT BACK when it looks like a sha
  # and cannot be resolved, so a plain rev-parse plus an emptiness test passes a
  # nonsense ref straight through to the diff, which then dies with a bare
  # `fatal: Needed a single revision`. Measured while proving this guard's third
  # arm. `--verify` with `^{commit}` refuses a non-commit properly.
  ANNOUNCED_FULL=$(git -C "$R" rev-parse --verify --quiet "${ANNOUNCED}^{commit}" 2>/dev/null || true)
  HEAD_FULL=$(git -C "$R" rev-parse HEAD)
  if [ -z "$ANNOUNCED_FULL" ]; then
    say "REFUSING: '$ANNOUNCED' does not resolve to a commit in this repository."
    exit 2
  fi
  if [ "$ANNOUNCED_FULL" != "$HEAD_FULL" ]; then
    say "REFUSING: the tree moved between the announcement and this run."
    say "  announced: $(git -C "$R" rev-parse --short "$ANNOUNCED_FULL")"
    say "  HEAD now:  $HEAD_SHA"
    say "  files that differ between them:"
    git -C "$R" diff --name-only "$ANNOUNCED_FULL" "$HEAD_FULL" | sed 's/^/    /' | tee -a "$SUM"
    say "  Re-announce against HEAD, or pass the sha you actually mean."
    exit 2
  fi
  say "pin OK: announced and HEAD agree at $HEAD_SHA"
fi
PUBLISH=$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$R/data/config.json','utf8')).publish))")
say "gating HEAD $HEAD_SHA at $(date '+%H:%M:%S'); publish=$PUBLISH; no loop running, no brake standing"
say "THIS SCRIPT NEVER PUSHES. A green result is a report, not a deploy."
say ""

# THE PRE-RUN TREE AND CACHE STATE, CAPTURED BEFORE ANY GATE RUNS.
#
# WHY: the gates WRITE to the tree. `data/launch.json`'s /catalog payload row is
# rewritten by the measurement step, and on 2 of 6 runs on 2026-09-09 it landed
# on a second, byte-identical-to-each-other value set (addictedtoai-6dpj). Every
# time, I reverted it by hand so the pushed tree would match the gated sha — and
# a revert DESTROYS THE OBSERVATION. Six samples of a real bimodality produced
# zero durable evidence, which is the same defect this script's per-run
# directories were created to fix, in a different file.
#
# The leading (untested) hypothesis is a warm vs cold `.next`, so the cache state
# is recorded HERE, before gate 2 can change it. A hypothesis whose variable is
# not sampled at the moment it matters cannot ever be tested afterwards.
# THE ENVIRONMENT IS AN UNRECORDED INPUT TO EVERY GATE. Added 2026-09-10 (clock NOT read; between 02:59 and 04:03),
# from A2AI-Fable-Arch's W3 review finding: `loop/lib/gates.mjs:467` and `:559`
# spawn children with `...process.env` and never clear it, so an outer value
# flows straight into `npm test` and into the checks. MY HARNESS DOES THE SAME
# THING — every gate below is a child of this shell and inherits whatever is set.
#
# The repo already reads several variables that change what a gate MEASURES, not
# merely how fast it runs. Measured 2026-09-10 by enumerating `process.env.X`
# across lib/, loop/, pulse/ and scripts/:
#   PULSE_NOW                     moves the clock
#   PULSE_ROOT, LOOP_WORKTREE_ROOT  redirect the tree being measured
#   SITE_URL                      25 call sites; feeds the surfaces and analytics gates
#   ATAI_VERIFY_DESIGN_NO_RECORD  stops verify-design recording
#   BRIEF_RECORDS_NOW             W3's clock pin, not yet on main
#
# A GREEN PRODUCED UNDER ANY OF THESE IS A GREEN ABOUT A DIFFERENT QUESTION, and
# nothing in the run said so. This is the environment-variable form of "a green
# measured in a tree nobody deliberately constructed is a green about that tree".
#
# AND I CANNOT AUDIT THE PAST FOR IT. No previous run recorded its environment,
# so the twenty runs on disk are silent about whether a pin was ever set. Reading
# them clean today is a statement about today. That is exactly the trace/no-trace
# distinction — a defect that writes nothing cannot be audited backwards — so the
# first thing this block does is START LEAVING THE TRACE.
# `TZ` ADDED after A2AI-Fable-Arch's W3 review found `TZ=Pacific/Niue` greening a
# live expiry wall, and it is the most dangerous entry on this line because
# NOBODY THINKS OF `TZ` AS A SETTING. My guard listed twelve named variables and
# this was not one of them — a guard narrower than its property, again.
#
# MEASURED, not reasoned, with the repository's OWN `lib/facts.mjs` todayIso at
# one instant (2026-09-10T10:27:04Z), each spawned with an explicit env object:
#   (TZ deleted) 2026-09-10   UTC 2026-09-10   Asia/Tokyo 2026-09-10
#   Pacific/Niue 2026-09-09   Pacific/Kiritimati 2026-09-11
# THREE DIFFERENT CALENDAR DATES FROM THE SAME MOMENT.
#
# WHY IT REACHES FURTHER THAN THIS HARNESS: CLAUDE.md's convention is that every
# date in the repository is "the LOCAL date of the machine that wrote it", and
# `TZ` redefines exactly that. Four non-test files derive one — `lib/facts.mjs`,
# `pulse/lib/core.mjs`, `loop/lib/dates.mjs`, `loop/lib/gates.mjs` — so a run
# under a foreign zone writes dates that are well-formed, indistinguishable from
# correct, and off by a day. That convention was paid for once already: nine
# agents split 104/24 across a UTC midnight on 2026-08-28.
#
# So ANY value of TZ is fatal here, not merely a suspicious one. The correct
# state for a gate run is the machine's own zone, which is what "unset" means.
# NODE_OPTIONS AND npm_config_node_options ARE FATAL, AND THIS ONE IS MEASURED,
# not added on suspicion. A2AI-Fable-Arch filed addictedtoai-m5ic after finding
# that `--test-name-pattern` greens by omission — a genuinely expired record gave
# 20 pass 5 fail unfiltered and 1 pass 0 fail filtered, exit 0 — and named the
# mitigation as "the gate must run the full file with no name filter."
#
# I checked whether MY harness is covered by that mitigation and it is not, for a
# reason the mitigation cannot reach: THE FILTER DOES NOT HAVE TO BE ON THE
# COMMAND LINE. Measured here at 04:5x on a two-test decoy:
#     baseline                                 tests 2  pass 2  fail 0  skipped 0
#     NODE_OPTIONS=--test-name-pattern=alpha   tests 1  pass 1  fail 0  skipped 0
#     --test-name-pattern=alpha on the CLI     tests 1  pass 1  fail 0  skipped 0
# The environment form is honoured and is INDISTINGUISHABLE from the CLI form.
#
# THE EXCLUDED TEST IS NOT COUNTED AS SKIPPED — cancelled/skipped/todo all stay
# ZERO — so my not-run refusal, which exists for exactly this shape, DOES NOT
# FIRE. The only thing between this harness and a silently narrowed suite is the
# 1,700 floor and the ratchet, both of which are counts, and A COUNT CANNOT SEE
# WHAT WAS NEVER COLLECTED. A run that filtered down to 1,701 passing tests would
# clear every check in this file.
#
# `npm test` shells through npm, so npm_config_node_options is the second door to
# the same room. Both fatal. Unset is the only correct state for a gate run, the
# same argument as TZ: any value is fatal here, not merely a suspicious one.
ENV_PINS_FATAL="TZ PULSE_NOW PULSE_ROOT LOOP_WORKTREE_ROOT SITE_URL ATAI_VERIFY_DESIGN_NO_RECORD BRIEF_RECORDS_NOW NODE_OPTIONS npm_config_node_options"
ENV_PINS_NOTED="ATAI_TEST_LOCK_WAIT_MS ATAI_BUILD_LOCK_WAIT_MS LOOP_VERIFY_DESIGN_PORT LOOP_DEBUG BD_BIN PULSE_GUARD_MIN NODE_TEST_CONTEXT"
# THE CENSUS RUNS FIRST AND REPORTS; THE PIN LIST BELOW REFUSES. Two different
# questions, and the split is the same asymmetry as the allowlist prefixes.
#
# The pin list is a CANDIDATE POOL NOBODY WROTE THE BOUNDARY OF — A2AI-Fable-Arch's
# generalisation of my zone finding, and its sharp edge is that a pool nobody
# wrote down leaves no trace of what it excluded. Every name on that list got
# there because something had already gone wrong with it, and NODE_OPTIONS only
# got there an hour ago because a peer's bead pointed at it. Nothing in this file
# would ever have proposed it.
#
# MEASURED: this process has 85 environment variables. The pin loop checks 18 and
# prints "18 checked", which is a numerator with no denominator — its silence
# about variable 19 is indistinguishable from variable 19 not existing.
#
# So the census enumerates what is ACTUALLY THERE and diffs it against a recorded
# baseline: a variable I never thought of surfaces because it is NEW, not because
# I predicted it. It does NOT refuse, deliberately — a machine's environment
# legitimately changes, and refusing on any drift is the over-broad arm that gets
# a guard switched off. Values of unknown variables are WITHHELD and compared by
# digest, because "never print a secret, including a partial token" is not
# negotiable and an unknown variable is precisely the one I cannot vouch for.
#
# Cost measured before wiring it in, per the apparatus rule: it spawns one node
# process, touches nothing in the repository, and its runtime is noise against a
# ~600s gate run. Timed here anyway so the number exists rather than being
# asserted.
CENSUS_T0=$(date +%s%3N 2>/dev/null || date +%s)
node "$S/orch-env-census.mjs" 2>&1 | tee -a "$SUM"
CENSUS_T1=$(date +%s%3N 2>/dev/null || date +%s)
say "environment census took $((CENSUS_T1 - CENSUS_T0))ms (apparatus cost, inside this run's wall clock)"

ENV_SET=""
: > "$RUNDIR/env-pins-before.txt"
for V in $ENV_PINS_FATAL $ENV_PINS_NOTED; do
  eval "pv=\${$V-__UNSET__}"
  if [ "$pv" = "__UNSET__" ]; then
    printf '%s\t(unset)\n' "$V" >> "$RUNDIR/env-pins-before.txt"
  else
    printf '%s\t%s\n' "$V" "$pv" >> "$RUNDIR/env-pins-before.txt"
    case " $ENV_PINS_FATAL " in *" $V "*) ENV_SET="$ENV_SET $V=$pv" ;; esac
    say "NOTE: $V is set to '$pv' for this run."
  fi
done
# PRINT THE DENOMINATOR: say how many were checked, not only which were found.
# RECORD THE ZONE THAT WAS ACTUALLY IN FORCE, not merely that TZ was unset.
# "TZ unset" says which knob was untouched; it does not say what date the run
# will write. A later reader auditing a dated artifact needs the ZONE, and this
# is the only moment it is cheap to capture.
printf 'MACHINE_ZONE\t%s\n' "$(date '+%Z %z')" >> "$RUNDIR/env-pins-before.txt"
printf 'UTC_AT_START\t%s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$RUNDIR/env-pins-before.txt"
say "machine zone: $(date '+%Z %z'), UTC $(date -u '+%Y-%m-%dT%H:%M:%SZ') — the dates this run writes derive from this"
say "environment pins: $(grep -c . "$RUNDIR/env-pins-before.txt") checked, recorded in env-pins-before.txt"
if [ -n "$ENV_SET" ]; then
  say "REFUSING: behaviour-altering environment pin(s) set —$ENV_SET"
  say "  These change what the gates MEASURE, not how fast they run, so a green"
  say "  under them is a green about a different question. Unset them and re-run."
  say "  If a pin is genuinely intended, set ORCH_ALLOW_ENV_PINS=1 and it will be"
  say "  recorded in the summary as a deliberate act rather than an invisible one."
  if [ "${ORCH_ALLOW_ENV_PINS:-0}" != "1" ]; then exit 3; fi
  say "  ORCH_ALLOW_ENV_PINS=1 — PROCEEDING UNDER A DECLARED PIN. This run's verdict"
  say "  is NOT comparable with the others and must not be pushed on."
  PIN_DECLARED="$PIN_DECLARED env-pins($(printf '%s' "$ENV_SET" | tr -s ' ' ',' | sed 's/^,//'))"
fi

git -C "$R" status --porcelain > "$RUNDIR/tree-before.txt" 2>&1
git -C "$R" hash-object "$R/data/launch.json" > "$RUNDIR/launch-json-blob-before.txt" 2>&1
if [ -d "$R/.next" ]; then
  printf 'present\tmtime=%s\tsize_kb=%s\n' \
    "$(date -r "$R/.next" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo unknown)" \
    "$(du -sk "$R/.next" 2>/dev/null | cut -f1)" > "$RUNDIR/next-cache-before.txt"
else
  echo "absent (COLD build)" > "$RUNDIR/next-cache-before.txt"
fi
say ".next before this run: $(cat "$RUNDIR/next-cache-before.txt")"
say ""

# ONE FACT, ONE HOME. Added 2026-09-10 (clock NOT read; between 02:59 and 04:03) during an audit of this harness for
# A2AI-Fable-Arch's addictedtoai-188p class: two readers of one structure, with
# no mechanism for noticing when they disagree.
#
# THE INSTANCE FOUND HERE. This test-lock predicate was written out VERBATIM in
# TWO places — once in gate() to classify a red as environmental, and once at the
# count/ratchet block to decide whether the missing count is a consequence of
# that refusal rather than an independent finding. Two copies of one predicate,
# which must agree, and nothing that notices when they stop agreeing.
#
# AND THE DIVERGENCE IS SILENT IN BOTH DIRECTIONS, differently:
#   - classifier matches, count-skip does not -> the run reports TWO problems
#     where there is ONE refusal, which is precisely the alarm-inflation the
#     count-skip comment exists to prevent;
#   - count-skip matches, classifier does not -> the gate is reported as a real
#     red AND the floor assertion is silently skipped, so a genuinely broken
#     collection passes unexamined under cover of a lock that was not there.
# The second is the dangerous one and it is the quieter one.
#
# NOT THE SAME DEFECT AS THE COPY FROM gates.mjs. These patterns are transcribed
# from the repo's own strings deliberately, and that copy CAN go stale — but it
# goes stale as ONE fact against its source, which is a different and visible
# failure. Two homes for one fact inside this file was the fixable half.
TEST_LOCK_RE="run-tests:[[:space:]]*TEST LOCK|another test run holds"

FAILED=""
gate() {
  local n="$1"; shift
  local log="$RUNDIR/$n.log"
  local t0=$(date +%s)
  say "=== $n starting $(date '+%H:%M:%S') ==="
  "$@" > "$log" 2>&1
  local code=$?
  local t1=$(date +%s)
  local secs=$((t1-t0))
  say "$n EXIT=$code ${secs}s"
  if [ "$secs" -lt 1 ]; then
    say "REFUSING: $n returned in under a second. It did not run, whatever it reported."
    FAILED="$FAILED $n(did-not-run)"
    return 1
  fi
  if [ "$code" -ne 0 ]; then
    # A LOCK REFUSAL IS THE MACHINE DECLINING TO RUN THE CHECK, NOT A VERDICT ON
    # THE TREE. loop/lib/gates.mjs:259-260 classifies exactly these two, and
    # books them `interrupted` — resumable, not counted against the breaker.
    # This harness cannot book anything, so it does the one thing that matters
    # for a PUSH decision: it says which kind of red this is.
    #
    # IT STILL FAILS. A refusal is a RE-RUN, never a pass — the classification
    # narrows what the operator should do, and must never widen what may be
    # pushed. Patterns copied verbatim from gates.mjs rather than paraphrased,
    # because a looser regex here would silently reclassify a real failure.
    if grep -qiE "$TEST_LOCK_RE" "$log" 2>/dev/null; then
      say "$n ENVIRONMENTAL: test-lock refusal — the machine declined to run this gate."
      say "  This is NOT a verdict on the tree and NOT a pass. RE-RUN it when the lock is free."
      FAILED="$FAILED $n(environmental: test-lock)"
      return 1
    fi
    if grep -qiE "another build holds .*Waited [0-9]+s\." "$log" 2>/dev/null; then
      say "$n ENVIRONMENTAL: build-lock refusal — the machine declined to run this gate."
      say "  This is NOT a verdict on the tree and NOT a pass. RE-RUN it when the lock is free."
      FAILED="$FAILED $n(environmental: build-lock)"
      return 1
    fi
    say "--- last 40 lines of $n ---"
    tail -40 "$log" | tee -a "$SUM"
    FAILED="$FAILED $n(exit $code)"
    return 1
  fi
  return 0
}

# Serial, never two builds at once: they share one .next/ and fail with ENOENT
# on pages-manifest.json AFTER the pages generate, which reads as a content
# defect and is not (addictedtoai-6s7). verify-launch runs its own build or
# reuses gate 2's; either way nothing else builds beside it.
gate 1-test      npm --prefix "$R" test          || true

# EXIT 0 CANNOT DISTINGUISH "ALL PASSED" FROM "ZERO TESTS RAN", and this is not
# hypothetical here: scripts/run-tests.mjs:78-83 prints "no *.test.mjs files
# found yet" and calls process.exit(0). A broken collection — a moved SEARCH
# directory, a bad cwd — is therefore GREEN, and gate 1 is the gate everything
# else leans on. (A2AI-Luna-Boss-2 hit the same class an hour ago in its own
# parser and handed it to me; its parser matched `# pass` while node prints
# `ℹ pass`, so it returned nothing and left a bare exit code as the evidence.)
#
# So parse the counts, and PROVE THE PARSER SEES THEM: the format below was
# captured from a real `node --test` run, not assumed. A count that cannot be
# read is a REFUSAL, never a pass — an unreadable record must not be
# indistinguishable from a permissive one.
#
# A FLOOR, NOT AN EXACT COUNT. Adding tests is legitimate and only LOSS is
# fatal; an exact assertion gets loosened the first week it is inconvenient,
# which is how a guard dies. 1,726 passing as of 2026-09-08.
TEST_FLOOR=1700
TLOG="$RUNDIR/1-test.log"
# ONE CAUSE, ONE FINDING. A lock-refused test gate produces no count, so the
# count assertion below would fire as well and the summary would report TWO
# problems where there is one refusal — a report inflated toward alarm, which
# is its own defect. The missing count is a CONSEQUENCE of the refusal, not an
# independent finding, so skip it when the refusal was already classified.
if [ -f "$TLOG" ] && ! grep -qiE "$TEST_LOCK_RE" "$TLOG" 2>/dev/null; then
  PASSED=$(grep -oE '^ℹ pass [0-9]+' "$TLOG" | grep -oE '[0-9]+' | tail -1)
  NFILES=$(grep -oE 'npm test: [0-9]+ test file' "$TLOG" | grep -oE '[0-9]+' | tail -1)
  if [ -z "$PASSED" ]; then
    say "REFUSING 1-test: no 'ℹ pass N' line found. The count is unreadable, so the exit code proves nothing."
    FAILED="$FAILED 1-test(unreadable-count)"
  elif [ "$PASSED" -lt "$TEST_FLOOR" ]; then
    say "REFUSING 1-test: only $PASSED test(s) passed, floor is $TEST_FLOOR. Collection is broken, not the suite."
    FAILED="$FAILED 1-test(only $PASSED)"
  else
    say "1-test counts: ${NFILES:-?} file(s), $PASSED passed (floor $TEST_FLOOR)"
  fi

  # THE FLOOR AND THE RATCHET ANSWER TWO DIFFERENT QUESTIONS, and conflating
  # them is how one of them ends up doing neither job.
  #
  # A2AI-Luna-Boss-2 pointed out on 2026-09-08 that 1,725 passing against a
  # 1,700 floor is a margin of 25, and said it would rather I heard the number
  # as thin than as green. It is right that the margin is thin. But the repair
  # is NOT a higher floor, and this is the interesting part: A FLOOR CANNOT
  # DETECT A REGRESSION, BY CONSTRUCTION. It permits every loss down to itself,
  # so whatever number I choose, a deletion just under it is invisible and a
  # legitimate addition eventually makes the margin thin again. Raising 1700 to
  # 1720 would buy five tests of sensitivity and a brittle number that the first
  # legitimate branch-level change breaks — B1's own branch changes constants,
  # so a tight floor would refuse honest work.
  #
  # SO THE FLOOR KEEPS THE JOB IT IS GOOD AT — collection integrity, catching
  # "zero tests ran" reported as exit 0 — and a SECOND instrument answers the
  # question the floor was being asked to answer by accident: DID THE COUNT GO
  # DOWN SINCE THE LAST RUN? That is a comparison against history, not against a
  # constant, and it is sensitive to a loss of ONE test.
  #
  # THE FAILING RUN MUST NOT MOVE THE BASELINE. A decrease refuses and appends
  # NOTHING, so the recorded count stays the last known-good one; otherwise the
  # first regression would quietly become the new normal and the second would
  # look clean. A legitimate decrease is recorded by hand, with a reason, which
  # is a deliberate act that leaves a trace — not a loosened guardrail.
  # A GUARD THAT SUMMARISES ITS SUBJECT GUARDS THE SUMMARY. Added 2026-09-10
  # (clock not read), sweeping my own harness for the class after finding it three times in
  # three unrelated mechanisms tonight (my count-vs-corpus, A2AI-Fable-Arch's
  # EXPECTED_COUNT = 24, and its 24 blind anchors).
  #
  # THE INSTANCE HERE: the runner emits SIX counters and I read exactly one.
  #   ℹ tests / pass / fail / cancelled / skipped / todo
  # `pass` alone cannot see a test being SILENTLY DISABLED. Convert one test to
  # `skip` and pass falls by one, which the ratchet catches — but ADD one test
  # and SKIP another and pass holds steady while coverage has dropped. That is
  # the swap again in a third noun: outcomes rather than files rather than
  # records. A skipped test does not fail, so the gate still exits 0.
  #
  # THE INVARIANT WORTH ASSERTING is not about the numbers moving, it is about
  # them agreeing: on a run where nothing failed, `pass` must equal `tests`, and
  # any gap is made of cancelled + skipped + todo — tests that were collected and
  # did not run. Currently all three are 0, so this is trivially satisfied today,
  # which is exactly when a guard is cheap to install and impossible to argue with.
  T_TESTS=$(grep -oE '^ℹ tests [0-9]+' "$TLOG" | grep -oE '[0-9]+' | tail -1)
  T_FAIL=$(grep -oE '^ℹ fail [0-9]+' "$TLOG" | grep -oE '[0-9]+' | tail -1)
  T_CANC=$(grep -oE '^ℹ cancelled [0-9]+' "$TLOG" | grep -oE '[0-9]+' | tail -1)
  T_SKIP=$(grep -oE '^ℹ skipped [0-9]+' "$TLOG" | grep -oE '[0-9]+' | tail -1)
  T_TODO=$(grep -oE '^ℹ todo [0-9]+' "$TLOG" | grep -oE '[0-9]+' | tail -1)
  say "1-test outcomes: tests=${T_TESTS:-?} pass=${PASSED:-?} fail=${T_FAIL:-?} cancelled=${T_CANC:-?} skipped=${T_SKIP:-?} todo=${T_TODO:-?}"
  NOTRUN=$(( ${T_CANC:-0} + ${T_SKIP:-0} + ${T_TODO:-0} ))
  if [ "$NOTRUN" -gt 0 ]; then
    say "REFUSING 1-test: $NOTRUN collected test(s) DID NOT RUN (cancelled ${T_CANC:-0}, skipped ${T_SKIP:-0}, todo ${T_TODO:-0})."
    say "  These do not fail, so the gate can still exit 0 and the pass count can hold"
    say "  steady while coverage drops — add one test, skip another, and nothing moves."
    # NO OVERRIDE, DELIBERATELY, AND THE FIRST DRAFT OF THIS LINE PRESCRIBED ONE
    # THAT DID NOT EVEN WORK. It said "say so in the history file and re-run" —
    # but this check reads the COUNTERS OUT OF THE LOG and never consults the
    # history, so the operator would write the note, re-run, and be refused
    # again, having been told by the guard itself to do something useless.
    # Found 2026-09-10 (clock NOT read; between 02:59 and 04:03) by applying A2AI-Fable-Arch's addictedtoai-k6ys to
    # my own messages: an error message that suggests a remedy is PRESCRIBING.
    # Its trap was a remedy that silences the guard by writing a falsehood; mine
    # was a remedy that silences nothing and wastes a run.
    #
    # And the right answer here is that there is NO in-band remedy. A knob for
    # "these skips are fine" is exactly the laundering path — it converts a
    # coverage decision into a flag, and the flag outlives the reason. Un-skip
    # the tests, or take the decision out of band and record it where decisions
    # live. A guard with no override says so rather than implying one exists.
    say "  THIS CHECK HAS NO OVERRIDE, on purpose: a knob for 'these skips are fine'"
    say "  turns a coverage decision into a flag, and the flag outlives its reason."
    say "  Either un-skip them, or decide it deliberately and record it on the board/bead."
    FAILED="$FAILED 1-test(not-run:$NOTRUN)"
  fi

  # PRINT THE THING, NOT ONLY THE COUNT OF THINGS. Added 2026-09-10 (clock NOT read; between 02:59 and 04:03), from
  # A2AI-Fable-Arch's W3 review finding F4: a pin that reports a NUMBER fails
  # without saying WHAT went missing, so the refusal is correct and useless.
  #
  # AND WRITING IT EXPOSED A HOLE THE COUNT RATCHET CANNOT SEE AT ALL: A SWAP.
  # Delete one test file and add another and the count is identical, so a ratchet
  # comparing 129 to 129 reports "steady" while the membership has changed. The
  # count was never a proxy for the corpus; it is a proxy for the SIZE of the
  # corpus, and those differ exactly where it matters. Same shape as the anchor
  # being a proxy for the arm — evidence about the number, none about the set.
  #
  # The list is REPORTED, and a removal refuses only where the count also falls
  # (which already refuses, and now names names). A swap is a loud NOTE, not a
  # refusal: it is new information I have never had, and inventing a refusal for
  # a state I have never observed is how a guard gets switched off by its first
  # false positive.
  FILES_NOW="$RUNDIR/test-files.txt"
  FILES_BASE="$RUNS/test-files-baseline.txt"
  # `tr '\134' '/'` not `tr '\\' '/'` — the latter makes GNU tr warn about an
  # unescaped trailing backslash, and a warning on stderr inside a gate run is
  # noise in exactly the output where a skipped check hides best. The log writes
  # Windows separators (`app\sitemap.test.mjs`), so they are normalised here to
  # keep the baseline comparable across however the paths arrive.
  grep -oE '[A-Za-z0-9_./\\-]+\.test\.mjs' "$TLOG" 2>/dev/null | tr '\134' '/' | sort -u > "$FILES_NOW"
  N_NOW=$(grep -c . "$FILES_NOW" || true)
  if [ ! -s "$FILES_BASE" ]; then
    say "1-test files: $N_NOW collected; no baseline list existed, establishing one."
    cp "$FILES_NOW" "$FILES_BASE" 2>/dev/null
  else
    GONE=$(comm -23 "$FILES_BASE" "$FILES_NOW" 2>/dev/null || true)
    NEW=$(comm -13 "$FILES_BASE" "$FILES_NOW" 2>/dev/null || true)
    N_GONE=$(printf '%s' "$GONE" | grep -c . || true)
    N_NEW=$(printf '%s' "$NEW" | grep -c . || true)
    say "1-test files: $N_NOW collected; $N_GONE gone, $N_NEW new vs the baseline list."
    if [ "$N_GONE" -gt 0 ]; then
      say "  TEST FILES NO LONGER COLLECTED — by name, because a number cannot be investigated:"
      printf '%s\n' "$GONE" | sed 's/^/    - /' | tee -a "$SUM"
    fi
    if [ "$N_NEW" -gt 0 ]; then
      say "  new test files:"
      printf '%s\n' "$NEW" | sed 's/^/    + /' | tee -a "$SUM"
    fi
    if [ "$N_GONE" -gt 0 ] && [ "$N_NEW" -gt 0 ] && [ "$N_GONE" -eq "$N_NEW" ]; then
      # A NOTE NOBODY HAS EVER SEEN FIRE AND A NOTE THAT FIRES WEEKLY NEED
      # DIFFERENT WORDS, or the first becomes furniture (A2AI-Fable-Arch,
      # 2026-09-10 (clock NOT read; between 02:59 and 04:03)). So the notice states its own observation history,
      # which is the honest thing a first firing can say about itself. Update
      # the count in this string when it fires; if that feels like a chore, the
      # note has started firing often enough to stop being a NEVER-SEEN one.
      say "  *** NOTE — A SWAP: equal numbers gone and new. THIS HAS NEVER FIRED BEFORE ***"
      say "  As of 2026-09-10 no run has ever produced this state, so treat it as an EVENT,"
      say "  not as a routine line. The count ratchet CANNOT see it: it compares sizes and"
      say "  the size did not move. Read the names above and decide deliberately."
    fi
  fi

  # EVERY SKIP ANNOUNCES ITSELF. Added 2026-09-10 (clock NOT read; between 02:59 and 04:03) on A2AI-Fable-Arch's
  # observation that THE NOISIEST PART OF AN OUTPUT IS WHERE A SKIPPED CHECK
  # HIDES BEST, because the reader's attention is already spent.
  #
  # THE INSTANCE. When PASSED is empty the block above prints a loud REFUSING
  # about the unreadable count — and then the ratchet below, guarded on
  # `-n "$PASSED"`, DID NOT RUN AND SAID NOTHING. The summary showed one shouted
  # refusal and simply had no ratchet line, and nothing distinguished "the
  # ratchet ran and was content" from "the ratchet never executed". The loud
  # half provided cover for the quiet half, inside the file where I had already
  # fixed this exact pattern once today.
  #
  # It does not reach a push — the run is already red — but "it cannot reach a
  # push" is a claim about TODAY's control flow, and a silent skip outlives the
  # arrangement that made it harmless. A skipped check states that it skipped.
  HIST="$RUNS/test-count-history.tsv"
  if [ -z "${PASSED:-}" ]; then
    say "1-test ratchet: NOT RUN — there is no count to compare, because the count above was unreadable."
    say "  This is a CONSEQUENCE of that refusal, not a second finding, and not a pass."
    say "  Nothing was appended, so the baseline is unchanged."
  fi
  if [ -n "${PASSED:-}" ]; then
    LAST=$(grep -oE '^[^	]*	[^	]*	[0-9]+' "$HIST" 2>/dev/null | grep -oE '[0-9]+$' | tail -1)
    if [ -z "$LAST" ]; then
      say "1-test ratchet: no prior count recorded; establishing baseline at $PASSED."
      printf '%s\t%s\t%s\tbaseline established\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$HEAD_SHA" "$PASSED" >> "$HIST"
    elif [ "$PASSED" -lt "$LAST" ]; then
      say "REFUSING 1-test: the test count FELL from $LAST to $PASSED ($((LAST-PASSED)) fewer)."
      say "  The floor ($TEST_FLOOR) did not catch this and cannot: a floor permits every loss above itself."
      say "  Nothing was appended to the history, so the baseline is still $LAST."
      # THE QUALIFIER MUST NOT BE THE THING DOING THE WORK. Revised 2026-09-10
      # (clock not read) on A2AI-Fable-Arch's observation that A QUALIFIER SELECTS AGAINST
      # THE READER IT IS ADDRESSED TO: "if the decrease is legitimate" is read by
      # someone who wants the gate green now, and that is the state this refusal
      # exists for. The word `legitimate` restrains only the reader who was never
      # going to type it anyway.
      #
      # THIS REMEDY SURVIVES THE TEST ON ITS COST, NOT ON ITS QUALIFIER, and the
      # message now says what the cost IS rather than leaving it implicit: the
      # line is permanent, it becomes the bar every future run is measured
      # against, and it is readable by whoever it refuses next. That is a
      # judgement about the world rather than a keystroke. Round 3's deliberate
      # deletions are exactly what it exists for.
      #
      # A DRAFT OF THIS COMMENT CLAIMED "three fields is the harness, four is a
      # person". THAT IS FALSE and I checked it before shipping it: `:644` writes
      # a FOUR-field `baseline established` line, and row 1 of the live history is
      # exactly that. The field count does not identify the author; only the
      # reason text does. Third time tonight a claim inside a repair was wrong —
      # and the first time the rule caught it rather than a coincidence, because
      # a sentence about provenance now gets checked at the moment it is written.
      # So the message below says nothing about field counts.
      say "  A legitimate decrease is recorded BY HAND: append a line to"
      say "    $HIST"
      say "  with a fourth tab-separated field naming the reason."
      say "  KNOW WHAT THAT COSTS BEFORE YOU TYPE IT: the line is PERMANENT and becomes"
      say "  the bar every future run is measured against. Somebody will be refused by"
      say "  your number and will read your reason to find out why. There is no way to"
      say "  lower this bar quietly — only a way to lower it in your own words."
      FAILED="$FAILED 1-test(count fell $LAST->$PASSED)"
    elif [ "$PASSED" -lt "$TEST_FLOOR" ]; then
      # A BELOW-FLOOR COUNT MUST NEVER BECOME THE BASELINE, even when it does not
      # fall against the previous one. Added 2026-09-10 (clock NOT read; between 02:59 and 04:03).
      #
      # Unreachable while LAST (1899) exceeds TEST_FLOOR (1700) — it needs
      # LAST <= PASSED < FLOOR, so the history would already have to be sitting
      # below the floor. THAT IS A FACT ABOUT TODAY'S TWO NUMBERS, NOT A PROPERTY
      # OF THE GUARD, and the arrangement that makes it unreachable is exactly
      # the kind that changes without anyone re-checking what it was protecting.
      # A hand-written recovery line, which is the documented escape, is one
      # plausible way to put a low number into the history deliberately.
      say "1-test ratchet: NOT APPENDED — $PASSED is at or above the previous count but BELOW the floor ($TEST_FLOOR)."
      say "  Collection is broken; recording it would make a broken collection the baseline."
      say "  The count refusal above is the finding. Baseline still $LAST."
    else
      [ "$PASSED" -gt "$LAST" ] && say "1-test ratchet: count rose $LAST -> $PASSED." || say "1-test ratchet: count steady at $PASSED."
      # DEFERRED, NOT APPENDED HERE. See RATCHET_PENDING at the end of this file:
      # the baseline may only come from a run whose SIX gates were all green, and
      # at this point only gate 1 has run.
      RATCHET_PENDING="$PASSED"
      RATCHET_PENDING_LAST="$LAST"
    fi
  fi
else
  # The other silent skip, and this one was DOCUMENTED but never PRINTED — the
  # comment above explains why a lock refusal must not also fire the count
  # assertion, and then the run said nothing at all about either instrument.
  # A justification living in a comment is invisible to the operator reading
  # the summary at three in the morning, which is the only audience that matters.
  if [ ! -f "$TLOG" ]; then
    say "1-test counts and ratchet: NOT RUN — no $TLOG exists. The gate produced no log to read."
  else
    say "1-test counts and ratchet: NOT RUN — the test gate was refused by the test lock."
    say "  A lock refusal produces no count, so both instruments are skipped DELIBERATELY."
    say "  This is one refusal, not three findings; and it is not a pass. Re-run when the lock is free."
  fi
  say "  Nothing was appended to the history, so the baseline is unchanged."
fi
gate 2-build     npm --prefix "$R" run build      || true
gate 3-launch    node "$R/scripts/verify-launch.mjs" || true
gate 4-design    node "$R/scripts/verify-design.mjs" || true
# verify-surfaces.mjs:672 resolves its default against the CALLER'S cwd, unlike
# verify-design.mjs:605 which uses join(ROOT,'out'). Pass the absolute path so
# this gate cannot measure a different tree, or none, and still report.
gate 5-surfaces  node "$R/scripts/verify-surfaces.mjs" "$R/out" || true
gate 6-analytics bash "$S/orch-gate-analytics.sh" || true

# The build-path assertion for verify-launch: it must say what it did.
LAUNCH_LOG="$RUNDIR/3-launch.log"
LAUNCH_PATH_RE='running .npm run build.|reusing the existing current build'

# THE DECIDING OBSERVATION MUST BE THE REPORTED ONE. Rewritten 2026-09-10 (clock NOT read; between 02:59 and 04:03).
#
# This block used to `grep -q` to decide and then `grep -oE ... | head -1` to
# report — two reads of one file, one deciding and one displaying. That is the
# exact shape of the deploy waiter that printed DEPLOYED above the PREVIOUS sha
# (addictedtoai-ocaj), arriving here in a quieter costume. Against a static file
# the two greps cannot disagree about PRESENCE, which is why this survived
# review: the dangerous property is not presence.
#
# WHAT `head -1` WAS ACTUALLY HIDING. The alternation has two arms, and a log
# containing BOTH — a run that reused a build and then spawned one, or vice
# versa — passes the `-q` and reports whichever appears first, with nothing
# saying the other was there. The operator reads a single confident build path
# for a run that took two. That is a real state (it is how the 18:46 lock-wait
# run would look) and the report erased it.
#
# So: read ONCE into a variable, decide on that value, report that value, and
# say how many DISTINCT arms it matched. A count of 2 is not a pass with a note,
# it is a refusal — the gate is supposed to name what it did, and naming two
# incompatible things is not naming what it did.
LAUNCH_PATHS=""
[ -f "$LAUNCH_LOG" ] && LAUNCH_PATHS=$(grep -oE "$LAUNCH_PATH_RE" "$LAUNCH_LOG" | sort -u)
LAUNCH_PATH_N=$(printf '%s' "$LAUNCH_PATHS" | grep -c . || true)

say ""
if [ "$LAUNCH_PATH_N" -eq 1 ]; then
  say "3-launch build path: $LAUNCH_PATHS"
elif [ "$LAUNCH_PATH_N" -eq 0 ]; then
  say "REFUSING 3-launch: it names neither a spawned build nor a reused one, so it cannot be trusted."
  FAILED="$FAILED 3-launch(no-build-path)"
else
  say "REFUSING 3-launch: it names $LAUNCH_PATH_N DIFFERENT build paths in one run —"
  printf '%s\n' "$LAUNCH_PATHS" | sed 's/^/    /' | tee -a "$SUM"
  say "  A gate that reports two incompatible accounts of what it did has not said what it did."
  FAILED="$FAILED 3-launch(ambiguous-build-path:$LAUNCH_PATH_N)"
fi

# DID THIS RUN COME CLOSE TO A PULSE FIRING?
#
# THE CLOCK GUARD ASSUMES A RUN FINISHES INSIDE PULSE_GUARD_MIN, AND WHEN THAT
# ASSUMPTION BREAKS IT BREAKS SILENTLY AND IN THE PERMISSIVE DIRECTION — a
# slower suite means a run allowed to start still straddles a firing, and
# nothing about the refusal says so, because the refusal never happened. So the
# assumption reports on itself at the end of every run instead of being trusted.
# Named by A2AI-Fable-Arch: a guard whose premise degrades needs to say when the
# premise is getting thin, not after it has failed.
RUN_ELAPSED=$(( $(date +%s) - RUN_T0 ))
MARGIN=$(( PULSE_DEADLINE - $(date +%s) ))
say ""
say "run length ${RUN_ELAPSED}s; next Pulse firing was $(( MINS_TO_PULSE * 60 ))s away at the start."
if [ "$MARGIN" -le 0 ]; then
  say "WARNING: A PULSE FIRING LANDED DURING THIS RUN, $(( -MARGIN ))s ago."
  say "  The clock guard let this start and the assumption behind it (runs finish inside"
  say "  ${PULSE_GUARD_MIN} minutes) is now FALSE. Treat the tree checks below as the authority on"
  say "  whether anything moved, and raise PULSE_GUARD_MIN before the next run."
elif [ "$MARGIN" -lt 180 ]; then
  say "NOTE: finished with only ${MARGIN}s to spare before a Pulse firing. The ${PULSE_GUARD_MIN}-minute"
  say "  guard is getting thin — raise it before it fails in the permissive direction."
fi

# WHAT THE RUN ITSELF WROTE TO THE TREE — recorded BEFORE anyone reverts it.
#
# This is the durable half of addictedtoai-6dpj. It does NOT revert anything and
# does NOT decide anything: reverting before a push is still a deliberate act by
# the operator, exactly as pushing is. What it removes is the operator's chance
# to destroy the only copy of a measurement while tidying up.
#
# ONE ROW PER RUN, INCLUDING THE CLEAN ONES. A drift history that records only
# the drifted runs cannot answer "how often" — which is the question that turned
# this from "noise" into "two states", and the question I got wrong by counting a
# streak of clean runs as a refutation instead of as four samples.
git -C "$R" status --porcelain > "$RUNDIR/tree-after.txt" 2>&1
git -C "$R" diff -- "$R/data/launch.json" > "$RUNDIR/launch-json-drift.diff" 2>&1
# THE BASELINE MAY ONLY COME FROM A RUN THAT WAS ENTIRELY GREEN. Added
# 2026-09-10 (clock NOT read; between 02:59 and 04:03), and it is a REAL defect found by auditing the history rather
# than the code — A2AI-Fable-Arch's point that the below-floor append was the
# worst thing fixed tonight BECAUSE IT WRITES, and a corrupted baseline is
# self-ratifying: the next run compares against the wrong number and passes,
# which looks exactly like health.
#
# THE DEFECT. The append used to happen immediately after gate 1, so it did not
# and COULD not consider the other five gates — and it did not even consider
# gate 1's own exit code. THE HISTORY PROVES IT FIRED: row `2026-09-10 02:26:18
# 88244a3 1897` was written by a run whose 1-test gate EXITED 1. That tree was
# never pushed.
#
# AND MY OWN COMMENT ABOVE ALREADY CLAIMED OTHERWISE — "the recorded count stays
# the last known-good one". The word known-good was doing work the code never
# did. That is the welded-claim shape again: a true-sounding sentence beside a
# mechanism that does not implement it, kept alive by how reasonable it reads.
#
# WHY IT MATTERS IN THE DIRECTION NOBODY WATCHES. A red run's count poisons the
# baseline UPWARD. Had 88244a3 been abandoned rather than repaired, the next run
# on 95bb03e (1819) would have refused with "count fell 1897 -> 1819" — A FALSE
# RED BLOCKING LEGITIMATE WORK, caused by recording a baseline from a failing
# tree that never landed. The ratchet's whole value is that its refusals are
# trustworthy, so a false refusal is not a lesser failure than a false pass; it
# is the failure that gets the guard switched off.
# THE HEAD RE-READ HAPPENS HERE, BEFORE THE APPEND, AND THE ORDER IS THE WHOLE
# POINT. My first attempt put it beside the final verdict — which would have
# printed the warning and STILL WRITTEN THE ROW, because the append runs first.
# A guard placed after the thing it guards is decoration, and I checked that
# property mechanically for the mutate family four hours ago and then failed it
# by hand here. The 06:13:52 row attributing 1926 to 99b2112 is exactly what this
# ordering prevents: a WRITE that outlives the run and becomes the baseline
# everything later agrees with.
HEAD_AT_END=$(git -C "$R" rev-parse --short HEAD 2>/dev/null || echo unknown)
if [ "$HEAD_AT_END" != "$HEAD_SHA" ]; then
  say ""
  say "HEAD MOVED DURING THIS RUN: started at $HEAD_SHA, ended at $HEAD_AT_END."
  say "  This run's six exit codes describe a tree that is neither sha in full,"
  say "  so they are a measurement of something but NOT of $HEAD_SHA."
  say "  NOT A PUSH AUTHORISATION, and NOTHING IS APPENDED to the ratchet history:"
  say "  a count row is a claim about a sha, and this run cannot make one."
  say "  NO OVERRIDE: the whole content of a gate is which tree it attests to."
  PIN_DECLARED="$PIN_DECLARED head-moved($HEAD_SHA->$HEAD_AT_END)"
  HEAD_MOVED=1
fi
say "HEAD at end of run: $HEAD_AT_END (started $HEAD_SHA)"

if [ -n "${RATCHET_PENDING:-}" ]; then
  if [ -n "${HEAD_MOVED:-}" ]; then
    say "1-test ratchet: NOT APPENDED — HEAD moved during the run ($HEAD_SHA -> $HEAD_AT_END)."
    say "  The count is real; the sha it would be filed under is not."
  elif [ -z "$FAILED" ]; then
    printf '%s\t%s\t%s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$HEAD_SHA" "$RATCHET_PENDING" >> "$HIST"
    say "1-test ratchet: baseline advanced to $RATCHET_PENDING (all six gates green)."
    # The FILE-LIST baseline advances on exactly the same condition and for
    # exactly the same reason. Advancing it on a red run would silently adopt
    # that run's membership as the reference, so the next run compares against a
    # corpus that never passed — the file-list form of the 1897 row.
    if [ -s "${FILES_NOW:-}" ]; then
      cp "$FILES_NOW" "$FILES_BASE" 2>/dev/null
      say "1-test files: baseline list advanced ($(grep -c . "$FILES_NOW") files, all six gates green)."
    fi
  else
    say "1-test ratchet: NOT APPENDED — the run was RED ($FAILED)."
    say "  The baseline is the last ALL-GREEN count and stays ${RATCHET_PENDING_LAST:-unchanged}."
    say "  A red run's count must not become the bar: if this tree is abandoned, a"
    say "  higher count recorded here would refuse the next honest run as a decrease."
  fi
fi

AFTER_BLOB=$(git -C "$R" hash-object "$R/data/launch.json" 2>/dev/null)
BEFORE_BLOB=$(cat "$RUNDIR/launch-json-blob-before.txt" 2>/dev/null)
NEXT_BEFORE=$(cat "$RUNDIR/next-cache-before.txt" 2>/dev/null | tr '\t' ' ')
DRIFT_HIST="$RUNS/launch-json-drift-history.tsv"
if [ "$AFTER_BLOB" != "$BEFORE_BLOB" ]; then
  say ""
  # THE WHOLE FILE, NOT ONLY THE DIFF. `git hash-object` WITHOUT `-w` computes a
  # sha and writes NOTHING, so the blob it names does not exist anywhere: on
  # 2026-09-09 I recorded 03e2207 in two board entries and a bead, and
  # `git cat-file -p 03e2207` answers "Not a valid object name". A sha that
  # resolves to nothing is a citation to a document nobody kept — it reads like
  # evidence and is not. Copying the file costs a few kilobytes and is the only
  # form that survives the revert.
  cp "$R/data/launch.json" "$RUNDIR/launch-json-DRIFTED.json" 2>/dev/null
  say "data/launch.json DRIFTED during this run: $BEFORE_BLOB -> $AFTER_BLOB"
  say "  the drifted FILE is preserved at $RUNDIR/launch-json-DRIFTED.json and the diff"
  say "  beside it at $RUNDIR/launch-json-drift.diff. These are the ONLY copies."
  say "  RECORD IT ON addictedtoai-6dpj BEFORE YOU REVERT. A revert without the record"
  say "  is the sixth observation of a real bimodality with nothing durable to show."
  grep -E '^[+-][^+-]' "$RUNDIR/launch-json-drift.diff" | sed 's/^/    /' | tee -a "$SUM"
  printf '%s\t%s\tDRIFTED\t%s -> %s\t%s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$HEAD_SHA" \
    "$BEFORE_BLOB" "$AFTER_BLOB" "$NEXT_BEFORE" >> "$DRIFT_HIST"
else
  say ""
  say "data/launch.json unchanged by this run (blob $AFTER_BLOB)."
  printf '%s\t%s\tclean\t%s\t%s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$HEAD_SHA" \
    "$AFTER_BLOB" "$NEXT_BEFORE" >> "$DRIFT_HIST"
fi
# ANY OTHER TRACKED FILE THE RUN TOUCHED IS A SEPARATE, UNNAMED FINDING. Naming
# only launch.json would make this instrument blind to exactly the class it was
# built for — a gate that writes to the tree without anyone noticing.
OTHER=$(diff "$RUNDIR/tree-before.txt" "$RUNDIR/tree-after.txt" 2>/dev/null | grep -E '^>' | grep -v 'data/launch.json' || true)
if [ -n "$OTHER" ]; then
  say ""
  say "THE RUN ALSO CHANGED TRACKED FILES THIS SCRIPT DOES NOT KNOW ABOUT:"
  echo "$OTHER" | sed 's/^> /    /' | tee -a "$SUM"
  say "  These were NOT here before the gates ran. Find out what wrote them before pushing."
fi

# ===========================================================================
# END-OF-RUN HEAD RE-READ. **A RUN THAT NAMES A SHA IT READ ONCE IS ASSERTING
# THAT A SUMMARY TAKEN AT THE START STILL DESCRIBES THE THING AT THE END.**
#
# Found live at 06:14 on 2026-09-10, not by reasoning. This harness captured
# HEAD_SHA once, before gate 1, and nothing re-read it; A2AI-Fable-Arch committed
# c15e901 to main sixty-one seconds into the run; the verdict printed
# "ALL SIX GATES GREEN at 99b2112" for a tree that had been c15e901 for nine of
# its ten minutes, AND THE RATCHET APPENDED A ROW ATTRIBUTING 1926 TO 99b2112.
# A defect that writes, which is the class weighted above every defect that
# merely reports.
#
# The pin check near the top compares an ANNOUNCED sha against HEAD at the
# START, so it catches me gating the wrong branch and cannot catch the branch
# moving underneath me. Same shape as the guard-that-summarises-its-subject: the
# sha stands for the tree, and two different trees can share it for a minute.
#
# It STAMPS rather than refuses, and the asymmetry is deliberate and the same one
# every other guard here settled on: the six exit codes are real measurements of
# SOMETHING and throwing them away helps nobody, but they are not attributable to
# a sha, so they are not a push authorisation. Exit 2, the not-pushable code,
# which a caller reads instead of the prose.
say ""
if [ -n "$FAILED" ]; then
  say "GATES RED at $HEAD_SHA:$FAILED"
  say "Nothing was pushed and nothing was reverted. The tree is exactly as it was handed to me."
  say "evidence for this run is at $RUNDIR and NOTHING overwrites it"
  exit 1
fi
if [ -n "$PIN_DECLARED" ]; then
  say "SIX GATES GREEN at $HEAD_SHA — BUT THIS RUN IS NOT PUSHABLE."
  say "  Declared override(s):$PIN_DECLARED"
  say "  A declared override means the run measured something other than the"
  say "  ordinary tree in the ordinary conditions, so its six exit codes are not"
  say "  comparable with the other runs and are NOT a push authorisation."
  say "  Re-run without the override before treating this as green."
  say "evidence for this run is at $RUNDIR and NOTHING overwrites it"
  exit 2
fi
say "ALL SIX GATES GREEN at $HEAD_SHA"
say "evidence for this run is at $RUNDIR and NOTHING overwrites it"
say "Publishing is $PUBLISH. Turning it on and pushing are separate deliberate acts and are NOT done here."
