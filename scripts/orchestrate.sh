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
MAX_CONSECUTIVE_FAILURES=3

# Where the orchestrator's constitution lives. Overridable so the supervisor can
# be run against a staged copy before that file is merged -- otherwise the loop
# that prevents lost sessions is itself blocked on a by-hand merge, which is the
# dependency it exists to survive.
PROMPT="${ORCHESTRATE_PROMPT:-prompts/orchestrator.md}"

# A session can stop producing output while its process stays alive. That is the
# failure that cost 94 minutes on 13 August: the round hung at a tool call, the
# process never exited, and nothing was watching. Kill an iteration whose log has
# gone quiet rather than waiting on a process that will never return.
STALL_SECONDS="${ORCHESTRATE_STALL:-900}"
HARD_TIMEOUT="${ORCHESTRATE_TIMEOUT:-5400}"

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
  log="$LOG_DIR/orchestrator-$stamp.log"
  note "iteration starting -> $log"

  # The prompt argument must be "$(cat file)" alone. Appending anything after it
  # breaks OpenCode startup silently: no session, no error, a zero-byte log.
  opencode run --model "$MODEL" --variant "$VARIANT" "$(cat "$PROMPT")" > "$log" 2>&1 &
  child=$!
  started=$(date +%s)

  # Watch the log rather than the process. A hung session keeps its process and
  # stops writing, so liveness is "the log grew recently", not "the pid exists".
  while kill -0 "$child" 2>/dev/null; do
    sleep 30
    now=$(date +%s)
    last=$(stat -c %Y "$log" 2>/dev/null || echo "$started")
    if [ $((now - last)) -ge "$STALL_SECONDS" ]; then
      note "iteration stalled: no log output for $((now - last))s -- killing it"
      kill -9 "$child" 2>/dev/null
      break
    fi
    if [ $((now - started)) -ge "$HARD_TIMEOUT" ]; then
      note "iteration exceeded hard timeout of ${HARD_TIMEOUT}s -- killing it"
      kill -9 "$child" 2>/dev/null
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
