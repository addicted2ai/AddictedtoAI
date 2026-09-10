#!/usr/bin/env bash
# Gate 6: verify-analytics needs the exported site served. `next start` refuses
# under output:'export', so this uses scripts/serve-static.mjs, which is what
# every local-serve verification here uses.
set -u
LOG=C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/b0a0272b-5058-41e7-ac66-431922257ff6/scratchpad/orch-serve.log

node D:/AddictedtoAI/scripts/serve-static.mjs D:/AddictedtoAI/out 3000 > "$LOG" 2>&1 &
SERVER=$!
echo "serve-static pid $SERVER"

# Wait for the port to answer rather than sleeping a guessed interval.
# THE LOOP MUST PROVE IT SAW THE SERVER. Falling through after 40 failed
# attempts used to run verify-analytics against a dead port, which fails with a
# navigation error that reads like an analytics defect and is not — the same
# false-quiet shape as a waiter whose filter never matched. An unproved
# precondition is a refusal, not a warning.
UP=""
for i in $(seq 1 40); do
  if curl -s -o /dev/null -m 2 http://127.0.0.1:3000/ ; then
    echo "server answering after ${i} attempt(s)"
    UP=yes
    break
  fi
  sleep 1
done
if [ -z "$UP" ]; then
  echo "REFUSING: serve-static never answered on 127.0.0.1:3000 after 40 attempts."
  echo "verify-analytics was NOT run; this is an environment failure, not an analytics verdict."
  tail -20 "$LOG"
  kill $SERVER 2>/dev/null; wait $SERVER 2>/dev/null
  exit 3
fi

node D:/AddictedtoAI/scripts/verify-analytics.mjs http://127.0.0.1:3000
CODE=$?
echo "verify-analytics exit $CODE"

kill $SERVER 2>/dev/null
wait $SERVER 2>/dev/null
echo "server stopped"
exit $CODE
