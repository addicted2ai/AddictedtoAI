#!/usr/bin/env bash
# Supervisor for the orchestrator loop.
#
# Sessions hang. That is observed, not feared: four separate OpenCode sessions
# froze mid-round on 11 August, twice at the same step, and a long-lived session
# is therefore the wrong place to keep the loop's state. So this script keeps no
# state at all. Each iteration is a fresh orchestrator invocation that rebuilds
# what it needs from the repository: the changelog, the docket, and the open
# pull requests. A hang costs one iteration, not the loop.
#
# Run detached so it outlives the terminal that started it.

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO" || exit 1

MODEL="opencode-go/deepseek-v4-flash"

# Reasoning effort. This model exposes low/high/max and defaults to neither of
# them when the flag is omitted -- rounds launched without it ran at the default
# for a full day before anyone noticed. `max` is the maintainer's standing
# instruction and it costs a fraction of a cent more per round.
VARIANT="${ORCHESTRATE_VARIANT:-max}"
LOG_DIR="${ORCHESTRATE_LOG_DIR:-$HOME/.addictedtoai-loop-logs}"
GAP_SECONDS="${ORCHESTRATE_GAP:-90}"
MAX_CONSECUTIVE_FAILURES="${ORCHESTRATE_MAX_FAILURES:-3}"

# The OpenCode server whose shared session store carries the loop's liveness
# signal, and the repo path used to match its sessions. The round is launched
# with `--attach` against that server so it appears in the maintainer's web UI
# instead of running invisibly.
ORCHESTRATE_SERVER="${ORCHESTRATE_SERVER:-http://127.0.0.1:4097}"
ORCHESTRATE_REPO="${ORCHESTRATE_REPO:-$REPO}"
export ORCHESTRATE_SERVER ORCHESTRATE_REPO

# Where the orchestrator's constitution lives. Overridable so the supervisor can
# be run against a staged copy before that file is merged -- otherwise the loop
# that prevents lost sessions is itself blocked on a by-hand merge, which is the
# dependency it exists to survive.
PROMPT="${ORCHESTRATE_PROMPT:-prompts/orchestrator.md}"

# Overrides the entire launch line when set. Used to point the supervisor at a
# stub for testing (a script that sleeps, or burns CPU, or exits) so it is never
# run against a real round with a real prompt.
ORCHESTRATE_COMMAND="${ORCHESTRATE_COMMAND:-}"

# Liveness. A session can stop producing output while its process stays alive.
# That is the failure that cost 94 minutes on 13 August: the round hung at a
# tool call, the process never exited, and nothing was watching. The signals,
# in the order they are consulted, are:
#
#   1. The session API on ORCHESTRATE_SERVER. The shared store records
#      `time.updated` on every session while it works -- including sessions
#      started by a different process -- so the newest update across this
#      project's sessions is the authoritative heartbeat. Measured on
#      13 August: two concurrent rounds reported 30s/884s and then 25s/11s
#      since last update across a 45-second interval, tracking real activity.
#      A curl that fails or a server that answers garbage yields no signal,
#      never a kill on its own.
#
#   2. CPU in the round's process trees (scripts/orchestrate-cpu.ps1, via
#      scripts/orchestrate-liveness.sh). A hung process burns no CPU; a
#      working one does. The trees are rooted on Windows pids: the launched
#      child's (translated from its msys pid) and the server's, because a
#      round launched with `--attach` runs its tool shells and `node` work
#      inside the server's tree -- measured 14 August: a tool shell spawned by
#      a --attach session descended from the server process, not from the CLI
#      client -- so rooting on the child alone would show a flat total for a
#      busy round. The walk only descends, so it never counts the machine's
#      unrelated work as progress. This vote is load-bearing even when the
#      server is up: a session's time.updated is frozen for the whole duration
#      of a long silent tool call (measured 13 August: age grew 6s to 37s
#      across a 40-second busy tool), and the CPU tree carries that case.
#
#   3. Log mtime, and deliberately last. The orchestrator's own log is silent
#      for the entire duration of a nested round: when it dispatches
#      `opencode run` and waits, minutes pass with nothing written, so silence
#      is the normal state of a healthy loop. A supervisor keyed on its own
#      log alone (as PR #42's first version was) would decide a perfectly
#      healthy round had hung and kill it, every time, roughly STALL_SECONDS
#      in, destroying exactly the work it exists to protect. mtime stays only
#      as a cheap third vote.
#
# The kill path is Windows-primitive, not a process-tree walk. A previous
# session's hand-rolled walk climbed into its own ancestry and killed the
# maintainer's OpenCode server, so the supervisor now translates the child's
# msys pid to its Windows pid (/proc/<msys-pid>/winpid) and calls
# `taskkill //T //F //PID <winpid>`: /T kills the process and its descendants
# and can never climb to anything above the child. A guard refuses the kill
# if the target is the process serving ORCHESTRATE_SERVER, and a dry-run mode
# (ORCHESTRATE_DRY_KILL=1) logs what would be killed and kills nothing.
STALL_SECONDS="${ORCHESTRATE_STALL:-900}"
HARD_TIMEOUT="${ORCHESTRATE_TIMEOUT:-5400}"
TICK_SECONDS="${ORCHESTRATE_TICK:-30}"
# CPU progress vote: tenths of a second of CPU added to the tree since the
# previous sample. 15 tenths per sample window is far below any working round
# and far above sampling noise.
CPU_VOTE_TENTHS=15
# Dry-run the kill path: log what would be killed and kill nothing. Used to
# exercise the stall decision end to end without ever terminating a round.
DRY_KILL="${ORCHESTRATE_DRY_KILL:-0}"

mkdir -p "$LOG_DIR"

note() { printf '%s  %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG_DIR/supervisor.log"; }

halt() {
  note "HALT: $1"
  exit "${2:-0}"
}

# An orphaned `next start` from a dead round holds port 3000 and makes the next
# round's checks validate a stale server -- green against code that is not the
# code under test. Clear them before every iteration, never during one.
# 8101 was the port of the leftover `overflow-server.mjs` scratch server the
# hung development session left running (the committed test binds an
# OS-assigned port, so a listener on 8101 is a leftover by definition). It
# earned its place here on 13 August: a round left one running, a later session
# deadlocked against it under spawnSync, and hung with its process alive for 94
# minutes. It returned the instant the stale server was killed. A supervisor that
# only restarts would have re-entered the same deadlock every iteration.
clear_orphans() {
  for port in 3000 3250 3260 8101; do
    pid=$(netstat -ano 2>/dev/null | grep -E "LISTENING" | grep -E ":$port\b" | awk '{print $NF}' | head -1)
    if [ -n "${pid:-}" ]; then
      note "killing orphaned listener on port $port (pid $pid)"
      taskkill //PID "$pid" //F >/dev/null 2>&1 || true
    fi
  done
}

# Kill the iteration's process tree, root first, descendants with it.
#
# The pid bash reports for a backgrounded job ($!) is an msys pid; PowerShell,
# CIM and taskkill all need the Windows pid, so it is translated through the
# msys /proc table first. The translation is stable for the process's whole
# lifetime (verified 14 August: the winpid of a launched native exe was alive
# and unchanged at 20/40/60/80/100 seconds), so it is read once at launch and
# re-read here in case the child is already gone.
#
# `taskkill //T //F //PID <winpid>` is the whole kill. It takes the process
# and its descendants and never climbs, so it cannot reach the OpenCode server
# or the supervisor's own ancestry -- a previous session killed the
# maintainer's server by walking a process tree into its own, and this is the
# primitive that makes that class of bug impossible. The doubled slashes are
# deliberate: git-bash would otherwise rewrite /T as a path. The one target
# the guard still refuses is the server itself: if the translated winpid is
# the process listening on ORCHESTRATE_SERVER's port, the translation is
# wrong (the round is a fresh launch, never the server), so nothing is killed
# and the refusal is logged. Dry-run mode logs the would-be target and kills
# nothing.
kill_iteration() {
  child="$1"
  winpid="$(cat "/proc/$child/winpid" 2>/dev/null)"
  if [ -z "$winpid" ]; then
    if [ "$DRY_KILL" -eq 1 ]; then
      note "stall: would kill msys pid $child (no winpid translation)"
      return
    fi
    note "no winpid for child $child -- falling back to kill -9"
    kill -9 "$child" 2>/dev/null
    return
  fi
  if [ "$winpid" = "$(server_winpid)" ]; then
    note "REFUSING to kill winpid $winpid: it is the server on $ORCHESTRATE_SERVER"
    return
  fi
  if [ "$DRY_KILL" -eq 1 ]; then
    note "stall: would kill winpid $winpid (child msys pid $child)"
    return
  fi
  note "killing iteration: taskkill //T //F //PID $winpid (child msys pid $child)"
  taskkill //T //F //PID "$winpid" >/dev/null 2>&1 || true
  # If the Windows kill missed (the process outlived it, or taskkill could
  # not see it), fall back to the msys kill.
  kill -0 "$child" 2>/dev/null && kill -9 "$child" 2>/dev/null
}

source "$REPO/scripts/orchestrate-liveness.sh"

failures=0

while true; do
  # The orchestrator writes HOLD.md when it hits something a human must answer.
  # Honour it unconditionally: an unattended loop that pushes past its own stop
  # signal is worse than one that stops.
  if [ -s docket/HOLD.md ]; then
    halt "docket/HOLD.md is present -- the loop stopped itself and is waiting on a decision"
  fi

  if [ "$failures" -ge "$MAX_CONSECUTIVE_FAILURES" ]; then
    halt "$failures consecutive failed iterations -- something is wrong that retrying will not fix" 1
  fi

  clear_orphans

  # Always start each iteration from current main. A stale checkout is how two
  # branches end up computing the same round number.
  git checkout main --quiet 2>/dev/null || note "warning: could not check out main"
  git pull --ff-only --quiet 2>/dev/null || note "warning: could not fast-forward main"

  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  marker="$stamp"
  log="$LOG_DIR/orchestrator-$stamp.log"
  note "iteration starting -> $log"

  if [ -n "$ORCHESTRATE_COMMAND" ]; then
    # Split on whitespace and run directly, never via eval: an eval'd
    # background job leaves $! pointing at a short-lived msys fork layer, so
    # the round would not be findable by pid. The command line must be a
    # plain command plus arguments -- no shell metacharacters.
    # shellcheck disable=SC2086
    $ORCHESTRATE_COMMAND > "$log" 2>&1 &
  else
    # The prompt argument must be "$(cat file)" alone. Appending anything after
    # it breaks OpenCode startup silently: no session, no error, a zero-byte
    # log. `--attach` makes the round appear in the maintainer's web UI and
    # `--title` carries the per-iteration marker into the session's title.
    opencode run --attach "$ORCHESTRATE_SERVER" --title "$marker" --model "$MODEL" --variant "$VARIANT" "$(cat "$PROMPT")" > "$log" 2>&1 &
  fi
  child=$!
  started=$(date +%s)
  last_progress=$started
  log_prev=""
  note "iteration child msys pid $child"

  # The child is found by pid, never by command-line marker: a PowerShell
  # probe that matches a marker in the command line matches its own process
  # (measured 14 August), which is how a naive "kill everything carrying my
  # marker" kills the wrong thing. Translate once -- the winpid is stable for
  # the process's whole lifetime -- and root the CPU walk on the child's tree
  # plus the server's, where a --attach round actually works.
  child_winpid="$(cat "/proc/$child/winpid" 2>/dev/null || true)"
  server_pid="$(server_winpid)"
  note "child winpid ${child_winpid:-untranslated}, server winpid ${server_pid:-not found}"
  tree_prev="$(cpu_tenths "${child_winpid},${server_pid}")"
  tree_prev="${tree_prev:-0}"

  # The log is not the heartbeat. A hung session keeps its process and the
  # orchestrator's log stays silent while a nested round works, so liveness is
  # "any of the three votes advanced recently", not "the pid exists" and not
  # "the log grew recently". Any one vote advancing keeps the iteration alive;
  # only a full three-signal silence for STALL_SECONDS kills it.
  while kill -0 "$child" 2>/dev/null; do
    sleep "$TICK_SECONDS"
    now=$(date +%s)
    progressed=0

    newest=$(api_newest)
    if [ -n "$newest" ] && [ "$newest" -gt "$last_progress" ]; then
      progressed=1
    fi

    tree_now=$(cpu_tenths "${child_winpid},${server_pid}")
    tree_now="${tree_now:-0}"
    tree_delta=$((tree_now - tree_prev))
    if [ "$tree_delta" -gt "$CPU_VOTE_TENTHS" ]; then
      progressed=1
    fi
    tree_prev=$tree_now

    log_now=$(stat -c %Y "$log" 2>/dev/null || echo "$started")
    if [ -n "$log_prev" ] && [ "$log_now" -gt "$log_prev" ]; then
      progressed=1
    fi
    log_prev=$log_now

    if [ "$progressed" -eq 1 ]; then
      last_progress=$now
    fi

    if [ $((now - last_progress)) -ge "$STALL_SECONDS" ]; then
      if [ -n "${newest:-}" ]; then
        note "iteration stalled: no session update for $ORCHESTRATE_REPO on $ORCHESTRATE_SERVER ($((now - newest))s old), no CPU in the child/server process trees (winpids ${child_winpid:-?},${server_pid:-?}; +$tree_delta tenths since last sample), no log write ($((now - log_now))s old) -- killing it"
      else
        note "iteration stalled: no session signal from $ORCHESTRATE_SERVER (unreachable or no session for $ORCHESTRATE_REPO), no CPU in the child/server process trees (winpids ${child_winpid:-?},${server_pid:-?}; +$tree_delta tenths since last sample), no log write ($((now - log_now))s old) -- killing it"
      fi
      kill_iteration "$child"
      break
    fi
    if [ $((now - started)) -ge "$HARD_TIMEOUT" ]; then
      note "iteration exceeded hard timeout of ${HARD_TIMEOUT}s -- killing it"
      kill_iteration "$child"
      break
    fi
  done

  wait "$child" 2>/dev/null
  status=$?

  size=$(wc -c < "$log" 2>/dev/null || echo 0)

  # A zero-byte log means the launch died before the model ever ran. That is a
  # different failure from a round that ran and went wrong, and it is the one
  # that has bitten most often.
  if [ "$size" -lt 200 ]; then
    failures=$((failures + 1))
    note "iteration produced ${size} bytes -- launch appears to have failed silently (failure $failures)"
  elif [ "$status" -ne 0 ]; then
    failures=$((failures + 1))
    note "iteration exited $status after ${size} bytes (failure $failures)"
  else
    failures=0
    note "iteration completed, ${size} bytes"
  fi

  sleep "$GAP_SECONDS"
done
