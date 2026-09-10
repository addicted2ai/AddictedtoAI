#!/usr/bin/env bash
# orch-await-deploy.sh <sha-prefix> [timeout-seconds]
#
# Wait until www.addictedtoai.net/status.json reports the given commit, then
# report it. Written 2026-09-10 (clock NOT read; between 02:59 and 04:03) to replace the one-liner that produced
# addictedtoai-ocaj.
#
# THE DEFECT IT EXISTS TO PREVENT. The previous waiter was:
#
#   until curl -s .../status.json | grep -q "$SHA"; do sleep 10; done
#   echo "DEPLOYED:"; curl -s .../status.json | head -c 260
#
# TWO CURLS. The first decided, the second reported, and on 2026-09-10 at 02:56
# they DISAGREED — it exited 0, printed the word DEPLOYED, and printed the
# PREVIOUS sha two lines underneath. The contradicting evidence was present,
# correct and adjacent, and the banner still won, because a word like DEPLOYED
# is a verdict and JSON underneath it is furniture.
#
# THE RULE, and it is the whole design of this script:
#   THE DECIDING OBSERVATION MUST BE THE REPORTED ONE.
# One fetch per iteration, captured into a variable, decided on the captured
# value, and the captured value is what gets printed. A waiter that re-fetches
# in order to display has re-opened the gap. "Read the JSON too" is not a fix,
# because it asks a human to be the conjunction between two checks.
#
# It also does NOT answer addictedtoai-ocaj — it makes the disagreement
# unobservable rather than explaining it. Every distinct response is logged
# with its timestamp precisely so the next occurrence leaves evidence instead
# of a lost transient. Do not close that bead on this script landing.

set -u

SHA="${1:-}"
TIMEOUT="${2:-600}"
URL="https://www.addictedtoai.net/status.json"

if [ -z "$SHA" ]; then
  echo "usage: orch-await-deploy.sh <sha-prefix> [timeout-seconds]" >&2
  exit 2
fi

# A prefix shorter than 7 is a coincidental-match risk against a 40-char JSON
# body that carries the sha twice (commit and stamp). Refuse rather than warn.
if [ "${#SHA}" -lt 7 ]; then
  echo "REFUSING: sha prefix '$SHA' is ${#SHA} chars; need at least 7." >&2
  exit 2
fi

LOG="$(dirname "$0")/deploy-waits/$(date '+%Y%m%d-%H%M%S')-${SHA}.log"
mkdir -p "$(dirname "$LOG")"

T0=$(date +%s)
LAST=""
N=0
LOGGED=0

# THE TRANSCRIPT NEEDS ITS OWN DENOMINATOR. It records only responses that
# DIFFER from the previous one — good for spotting a disagreement, useless for
# telling a reader whether there was ONE fetch or forty identical ones. That is
# the same "I looked and found nothing" vs "I looked at NOTHING" ambiguity this
# whole script exists to close, reappearing one level down in the script's own
# evidence. Proved on the timeout test run (clock not read): four fetches, one logged entry, and
# nothing in the file said so. So every transcript ends with both counts.
log_footer() {
  printf -- '--- END  verdict=%s  fetches=%s  distinct_responses_logged=%s  elapsed=%ss\n' \
    "$1" "$N" "$LOGGED" "$ELAPSED" >> "$LOG"
}

echo "awaiting deploy of $SHA at $URL (timeout ${TIMEOUT}s)"
echo "  transcript: $LOG"

while :; do
  N=$((N + 1))
  NOW=$(date +%s)
  ELAPSED=$((NOW - T0))

  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    log_footer TIMEOUT
    echo
    echo "TIMED OUT after ${ELAPSED}s and $N fetches. NOT DEPLOYED — or not observed."
    echo "The last response received was:"
    printf '%s\n' "$LAST"
    echo
    echo "A timeout is not evidence the push failed. Check the remote tip and the"
    echo "host's own deploy log before concluding anything about the push."
    exit 1
  fi

  # ONE fetch. This variable is the only observation this iteration makes, and
  # everything below — the decision AND the report — reads from it.
  BODY=$(curl -s --max-time 20 "$URL" 2>&1)
  RC=$?

  # Log every response that DIFFERS from the previous one, with its timing.
  # This is the evidence trail for addictedtoai-ocaj: if two consecutive fetches
  # ever disagree about the live sha again, both are on disk with timestamps.
  if [ "$BODY" != "$LAST" ]; then
    {
      printf -- '--- fetch %s  t+%ss  rc=%s  %s\n' "$N" "$ELAPSED" "$RC" "$(date '+%H:%M:%S')"
      printf '%s\n' "$BODY"
    } >> "$LOG"
    LAST="$BODY"
    LOGGED=$((${LOGGED:-0} + 1))
  fi

  if [ "$RC" -ne 0 ]; then
    sleep 5
    continue
  fi

  case "$BODY" in
    *"$SHA"*)
      log_footer DEPLOYED
      echo
      echo "DEPLOYED after ${ELAPSED}s and $N fetches. THIS IS THE RESPONSE THAT DECIDED IT:"
      printf '%s\n' "$BODY"
      echo
      echo "(One fetch. The body above is the same bytes the match was made against,"
      echo " not a re-fetch — see the header of this script for why that matters.)"
      exit 0
      ;;
  esac

  sleep 5
done
