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
#      never a stop on its own. `/session/status` carries no timestamps and
#      cannot tell a working round from a stuck zombie, which is why `/session`
#      was chosen over it (an earlier entry gave a different reason, which
#      measurement corrected -- see the round record).
#
#   2. CPU in the server's process tree (scripts/orchestrate-cpu.ps1, via
#      scripts/orchestrate-liveness.sh). A hung process burns no CPU; a
#      working one does. The tree is rooted on the server's Windows pid (the
#      process listening on ORCHESTRATE_SERVER's port), because a round
#      launched with `--attach` runs its tool shells and `node` work inside
#      the server's tree -- measured 14 August: a tool shell spawned by an
#      --attach session descended from the server process, not from the CLI
#      client. The walk only descends, so it never counts the machine's
#      unrelated work as progress. This vote is load-bearing even when the
#      server is up: a session's time.updated is frozen for the whole duration
#      of a long silent generation or tool call (measured 13 August: age grew
#      6s to 37s across a 40-second busy tool; measured 14 August: frozen
#      ~238s while 16,000 tokens were produced), and the CPU tree carries that
#      case.
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
# The stop path is a session abort, not a process kill. Killing the CLI client
# that launched the round does not stop the round: an attached round's work
# lives in the server's tree, not the client's -- measured 14 August, killing
# the client left the session either working to completion (16,210 output and
# 4,066 reasoning tokens produced after the kill, `time.updated` advancing
# ~238s past it) or a permanent busy zombie that only the session API could
# clear. The server owns the work, so the server must stop it:
# `POST /session/<id>/abort` cancels the session, and the attached client then
# exits on its own. The session id is found by matching the iteration's stamp
# against the sessions' titles in `GET /session` -- ids are strings from the
# API, never pids. A dry-run mode (ORCHESTRATE_DRY_KILL=1) logs what would be
# aborted and killed, and does neither.
STALL_SECONDS="${ORCHESTRATE_STALL:-900}"
HARD_TIMEOUT="${ORCHESTRATE_TIMEOUT:-5400}"
TICK_SECONDS="${ORCHESTRATE_TICK:-30}"
# CPU progress vote: tenths of a second of CPU added to the tree since the
# previous sample. 15 tenths per sample window is far below any working round
# and far above sampling noise.
CPU_VOTE_TENTHS=15
# Dry-run the stop path: log what would be aborted and killed and do neither.
# Used to exercise the stall decision end to end without ever stopping a round.
DRY_KILL="${ORCHESTRATE_DRY_KILL:-0}"
# How long, after a stop decision, to wait for two confirmations before the
# last-resort client kill: the round's own client exits, and the session stops
# advancing on the server.
ABORT_WAIT_SECONDS="${ORCHESTRATE_ABORT_WAIT:-90}"
# How many times the launch-time session-id poll runs (each attempt sleeps 5s
# between probes). The session appears a moment after `opencode run` starts;
# this is the bound on "it never appeared". A lost id means a lost abort, not
# a lost round -- the iteration runs either way.
SESSION_POLL_TICKS="${ORCHESTRATE_SESSION_POLL:-12}"

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

# Stop the iteration: cancel its session on the server, then wait, bounded,
# for the round's own client to exit and for the session to stop advancing.
# Neither is assumed -- the abort returns the moment the server accepts it and
# the round can take a beat to wind down -- so both are confirmed by polling
# before the supervisor moves on.
#
# A client still alive when the wait ends is killed as a last resort: a plain
# `kill` (then `kill -9`) of the msys pid bash already holds ($!), the pid of
# the process this shell itself launched. That kill reaches the client process
# and its descendants only in the stub topology; in the deployment topology
# the round's work lives in the server's tree, which a client kill cannot
# reach -- aborting the session is what stops that, which is why the abort
# comes first. The last resort can also be wrong: if the client died and its
# pid was recycled between the liveness check and the kill, the signal lands
# on an unrelated process. It is a bounded cleanup, not a guarantee, and it is
# never claimed to be impossible to misdirect.
#
# When no session id was recorded, the abort half is skipped and the stop is
# the last-resort kill alone -- a lost id means a lost abort, not a lost
# round, and the supervisor says so in its log.
#
# Returns 0 when the client is confirmed gone, 1 when it is still running --
# the caller must not wait on a round that is still running (dry-run, a
# failed abort, or a client that survived the last resort), so the iteration
# is counted failed and the loop moves on.
stop_iteration() {
  if [ "$DRY_KILL" -eq 1 ]; then
    if [ -n "${sesid:-}" ]; then
      note "dry-run: would abort session $sesid"
    else
      note "dry-run: no session id recorded, would kill client msys pid $child"
    fi
    return 1
  fi

  if [ -n "${sesid:-}" ]; then
    updated_before=$(api_session_updated "$sesid")
    note "aborting session $sesid (last update seen: ${updated_before:-unknown})"
    code=$(curl -s --max-time 10 -o /dev/null -w "%{http_code}" -X POST "$ORCHESTRATE_SERVER/session/$sesid/abort")
    note "abort -> HTTP $code"
    if [ "$code" != "200" ]; then
      note "abort was not accepted -- the server could not be told to stop this round"
    fi
  else
    note "no session id recorded for this iteration -- the abort path is unavailable"
  fi

  # Bounded wait for the two confirmations. A stopped session either stops
  # changing time.updated or disappears from /session; both read as stopped.
  # A single post-abort bump of time.updated is tolerated: the check compares
  # against the last value seen, so a bumped-but-frozen session reads stopped
  # on the next poll, while a session that keeps working never matches.
  waited=0
  client_gone=0
  session_stopped=1
  while [ "$waited" -lt "$ABORT_WAIT_SECONDS" ]; do
    sleep 5
    waited=$((waited + 5))
    if ! kill -0 "$child" 2>/dev/null; then
      client_gone=1
    fi
    if [ -n "${sesid:-}" ]; then
      now_upd=$(api_session_updated "$sesid")
      if [ -n "$now_upd" ] && [ "$now_upd" != "$updated_before" ]; then
        session_stopped=0
      fi
    fi
    if [ "$client_gone" -eq 1 ] && [ "$session_stopped" -eq 1 ]; then
      break
    fi
  done

  if [ "$client_gone" -eq 1 ]; then
    note "client exited on its own (waited ${waited}s)"
  else
    note "client still alive after ${waited}s -- killing it as a last resort (msys pid $child)"
    kill "$child" 2>/dev/null || true
    sleep 2
    kill -9 "$child" 2>/dev/null || true
    sleep 2
    if kill -0 "$child" 2>/dev/null; then
      note "client survived even the last-resort kill -- leaving it running and counting the iteration failed"
      return 1
    fi
  fi
  if [ "$session_stopped" -eq 0 ]; then
    note "session ${sesid:-unknown} was still advancing when the wait ended -- the abort did not stop it"
  fi
  return 0
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
  killed=0
  note "iteration child msys pid $child"

  # The session is found by title and directory, never by pid: /session has no
  # pids, and the session id is how the server is told to stop the round. It is
  # not available at launch -- the session appears a moment after `opencode
  # run` starts -- so it is polled for a bounded window. The lookup narrows by
  # time.created against this iteration's launch and fails closed on
  # ambiguity: more than one same-title candidate means no id (an abort of
  # nothing plus a logged warning naming the ids, never a silent pick). An
  # iteration whose session never appears still runs (a lost id means a lost
  # abort, not a lost round): the stop path then skips the abort and goes
  # straight to the last-resort client kill.
  sesid=""
  for _ in $(seq 1 "$SESSION_POLL_TICKS"); do
    sesid=$(api_session_id "$marker" "$started" 2>>"$LOG_DIR/supervisor.log")
    [ -n "$sesid" ] && break
    if ! kill -0 "$child" 2>/dev/null; then
      break
    fi
    sleep 5
  done
  note "session ${sesid:-not found} for title $marker"

  # The CPU vote is rooted on the server's process tree alone, where an
  # --attach round actually works (measured 14 August). The root is the pid
  # listening on the server port -- never a name and never a command-line
  # marker: a probe that matches a marker string in the command line matches
  # its own process (measured 14 August), which is how a naive kill finds the
  # wrong thing.
  server_pid="$(server_winpid)"
  note "server winpid ${server_pid:-not found} -- CPU vote rooted on the server tree"
  tree_prev="$(cpu_tenths "$server_pid")"
  tree_prev="${tree_prev:-0}"

  # The log is not the heartbeat. A hung session keeps its process and the
  # orchestrator's log stays silent while a nested round works, so liveness is
  # "any of the three votes advanced recently", not "the pid exists" and not
  # "the log grew recently". Any one vote advancing keeps the iteration alive;
  # only a full three-signal silence for STALL_SECONDS stops it.
  while kill -0 "$child" 2>/dev/null; do
    sleep "$TICK_SECONDS"
    now=$(date +%s)
    progressed=0

    newest=$(api_newest)
    if [ -n "$newest" ] && [ "$newest" -gt "$last_progress" ]; then
      progressed=1
    fi

    tree_now=$(cpu_tenths "$server_pid")
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
        note "iteration stalled: no session update for $ORCHESTRATE_REPO on $ORCHESTRATE_SERVER ($((now - newest))s old), no CPU in the server tree (winpid ${server_pid:-?}; +$tree_delta tenths since last sample), no log write ($((now - log_now))s old) -- stopping it"
      else
        note "iteration stalled: no session signal from $ORCHESTRATE_SERVER (unreachable or no session for $ORCHESTRATE_REPO), no CPU in the server tree (winpid ${server_pid:-?}; +$tree_delta tenths since last sample), no log write ($((now - log_now))s old) -- stopping it"
      fi
      stop_iteration
      killed=$?
      break
    fi
    if [ $((now - started)) -ge "$HARD_TIMEOUT" ]; then
      note "iteration exceeded hard timeout of ${HARD_TIMEOUT}s -- stopping it"
      stop_iteration
      killed=$?
      break
    fi
  done

  if [ "${killed:-0}" -eq 1 ]; then
    # Dry-run, or an abort and last-resort kill that both failed to stop the
    # round. Waiting on it would block the supervisor until the round finishes
    # on its own, so the iteration is counted as failed and the loop moves on;
    # whoever ran the dry-run cleans the leftover round up.
    status=1
    note "iteration left running -- stop was dry-run or failed"
  else
    wait "$child" 2>/dev/null
    status=$?
  fi

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
