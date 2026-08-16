# Liveness probes for scripts/orchestrate.sh, defined here so the supervisor
# can source them and a test can source them directly.
#
# The probes return empty output on failure, never a crash and never a false
# "alive": the supervisor treats an empty probe as "no signal" and decides
# from whatever signals remain. A supervisor that dies because a probe failed
# is worse than one that is briefly less precise.

HELPER_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HELPER_SERVER="${ORCHESTRATE_SERVER:-http://127.0.0.1:4097}"
HELPER_REPO_WIN="$(cygpath -w "${ORCHESTRATE_REPO:-$HELPER_REPO}" 2>/dev/null || echo "${ORCHESTRATE_REPO:-$HELPER_REPO}")"

# Newest time.updated, epoch seconds, among the sessions whose directory is
# this project. The OpenCode server's shared store records time.updated on
# every session while it works -- including sessions started by a different
# process -- so an advance here is real activity. A session frozen mid-tool is
# not an advance; the CPU probe below is what carries that case.
api_newest() {
  curl -s --max-time 10 "$HELPER_SERVER/session" 2>/dev/null | ORCH_REPO_WIN="$HELPER_REPO_WIN" node -e '
    let d = "";
    process.stdin.on("data", c => { d += c; });
    process.stdin.on("end", () => {
      try {
        const want = (process.env.ORCH_REPO_WIN || "").toLowerCase().replace(/[\\/]+$/, "");
        const list = JSON.parse(d);
        let newest = 0;
        for (const s of (list || [])) {
          const dir = (s.directory || "").toLowerCase().replace(/[\\/]+$/, "");
          if (dir === want) {
            const u = Number(s.time && s.time.updated) || 0;
            if (u > 0 && u > newest) newest = u;
          }
        }
        if (newest > 0) console.log(Math.floor(newest / 1000));
      } catch (e) { /* not JSON, or no matching session: no signal */ }
    });
  '
}

# Newest time.updated, epoch seconds, among the sessions this supervisor can
# attribute to itself: directory is this project and time.created is at or
# after the launch floor ($1, epoch seconds). The shared store records
# time.created when a session starts and time.updated on every session while
# it works, so a session created after the floor is either this supervisor's
# own iteration session or a nested session its orchestrator dispatched --
# both of which work in the shared checkout this supervisor moves at each
# iteration start. Sessions created before the floor are somebody else's --
# the maintainer's, the supervising model's, an orchestrator session that
# outlived its iteration -- and are deliberately invisible to this probe: a
# session that predates the supervisor may never stop on its own, and letting
# it hold the checkout would halt the loop permanently on a session the
# supervisor did not start and cannot stop. The caller sets the floor from
# its own launch time; it is never derived from the API.
api_attributed_newest() {
  curl -s --max-time 10 "$HELPER_SERVER/session" 2>/dev/null | ORCH_REPO_WIN="$HELPER_REPO_WIN" ORCH_FLOOR="${1:-0}" node -e '
    let d = "";
    process.stdin.on("data", c => { d += c; });
    process.stdin.on("end", () => {
      try {
        const want = (process.env.ORCH_REPO_WIN || "").toLowerCase().replace(/[\\/]+$/, "");
        const floor = (Number(process.env.ORCH_FLOOR) || 0) * 1000;
        const list = JSON.parse(d);
        let newest = 0;
        for (const s of (list || [])) {
          const dir = (s.directory || "").toLowerCase().replace(/[\\/]+$/, "");
          if (dir === want) {
            const created = Number(s.time && s.time.created) || 0;
            if (created < floor) continue;
            const u = Number(s.time && s.time.updated) || 0;
            if (u > 0 && u > newest) newest = u;
          }
        }
        if (newest > 0) console.log(Math.floor(newest / 1000));
      } catch (e) { /* not JSON, or no matching session: no signal */ }
    });
  '
}

# Wait, bounded, for the shared checkout to be free of this supervisor's own
# unfinished work. An iteration's nested review sessions outlive the iteration
# that launched them -- the supervisor counts the iteration done when its own
# client exits, while the nested session keeps working, attached to the server
# (measured 16 August: two round-145 review sessions were killed by the next
# iteration's `git checkout main` switching the branch out from under them).
# So before the supervisor moves the checkout it asks whether any attributed
# session (see api_attributed_newest) has updated within CHECKOUT_IDLE_SECONDS
# and waits, bounded, for that to stop.
#
# The idle window is deliberately generous: time.updated freezes for the whole
# duration of a long silent generation or tool call (measured 13 August: age
# grew 6s to 37s across a 40-second busy tool; measured 14 August: frozen
# ~238s while 16,000 tokens were produced), and a checkout that lands during
# such a freeze is the failure this wait exists to prevent.
#
# The bound is the second half of the design and is not optional. A session
# that will never stop advancing must not be able to halt the loop
# permanently, so the wait gives up after CHECKOUT_WAIT_SECONDS and returns 1;
# the caller proceeds with the checkout anyway and records that it did. A
# bounded wrong tree is better than a permanent halt, and the caller's note is
# what makes an overrun visible rather than silent.
#
# Returns 0 when the checkout is free, 1 when the bound expired with an
# attributed session still advancing. A probe that fails (server down,
# garbage response) yields no signal and is read as free, matching the
# liveness philosophy of this file: the supervisor proceeds on no signal, it
# never halts on one.
wait_for_checkout_free() {
  local waited=0
  local newest now busy
  local wait_bound="${CHECKOUT_WAIT_SECONDS:-3600}"
  local idle="${CHECKOUT_IDLE_SECONDS:-600}"
  local tick="${TICK_SECONDS:-30}"
  while [ "$waited" -lt "$wait_bound" ]; do
    newest=$(api_attributed_newest "${CHECKOUT_FLOOR:-0}")
    now=$(date +%s)
    busy=""
    if [ -n "$newest" ] && [ "$((newest + idle))" -gt "$now" ]; then
      busy=1
    fi
    if [ -z "$busy" ]; then
      [ "$waited" -gt 0 ] && note "checkout free after ${waited}s -- no session from this supervisor has advanced in ${idle}s"
      return 0
    fi
    sleep "$tick"
    waited=$((waited + tick))
  done
  note "checkout still busy after ${wait_bound}s -- a session this supervisor dispatched is still advancing (newest update ${newest:-unknown}); proceeding anyway, bounded deferral"
  return 1
}

# Session id of the iteration's own session: the entry in GET /session whose
# title is exactly the per-iteration stamp and whose directory is this
# project. The session is created a moment after `opencode run --attach`
# starts, so the caller polls for it; empty means it has not appeared yet, or
# never will. This is the id the supervisor hands to
# POST /session/<id>/abort when an iteration stalls -- ids are strings from
# the API, never pids.
#
# The match is narrowed by time.created: a candidate whose record predates
# this iteration's launch ($2, epoch seconds) is rejected -- the supervisor
# knows when it launched, and a stale-but-active session sharing the stamp
# must never be abortable as this round. If more than one candidate survives
# the lookup fails closed: it prints no id, writes the ambiguity naming the
# ids to stderr (the caller appends that to the supervisor log), and the
# iteration falls through to its existing no-session-id handling. An abort of
# nothing plus a warning is correct; silently picking one is not.
api_session_id() {
  curl -s --max-time 10 "$HELPER_SERVER/session" 2>/dev/null | ORCH_REPO_WIN="$HELPER_REPO_WIN" ORCH_TITLE="$1" ORCH_LAUNCH="${2:-0}" node -e '
    let d = "";
    process.stdin.on("data", c => { d += c; });
    process.stdin.on("end", () => {
      try {
        const want = (process.env.ORCH_REPO_WIN || "").toLowerCase().replace(/[\\/]+$/, "");
        const title = process.env.ORCH_TITLE || "";
        const floor = (Number(process.env.ORCH_LAUNCH) || 0) * 1000;
        const list = JSON.parse(d);
        const match = [];
        for (const s of (list || [])) {
          const dir = (s.directory || "").toLowerCase().replace(/[\\/]+$/, "");
          if (dir === want && s.title === title && s.id) {
            if (!floor || (Number(s.time && s.time.created) || 0) >= floor) match.push(s);
          }
        }
        if (match.length === 1) {
          console.log(match[0].id);
        } else if (match.length > 1) {
          console.error(new Date().toISOString() + "  ambiguous session title " + title + ": " + match.map(s => s.id).join(" ") + " -- aborting nothing");
        }
      } catch (e) { /* not JSON, or no matching session: no signal */ }
    });
  '
}

# time.updated, epoch seconds, for one session id, or empty. Used after an
# abort to confirm the session has stopped advancing: a working session
# changes this on every poll, a stopped one returns the same value, and one
# the server has dropped returns empty -- which the caller reads as stopped.
api_session_updated() {
  curl -s --max-time 10 "$HELPER_SERVER/session" 2>/dev/null | ORCH_SESID="$1" node -e '
    let d = "";
    process.stdin.on("data", c => { d += c; });
    process.stdin.on("end", () => {
      try {
        const want = process.env.ORCH_SESID || "";
        const list = JSON.parse(d);
        for (const s of (list || [])) {
          if (s.id === want) {
            const u = Number(s.time && s.time.updated) || 0;
            if (u > 0) console.log(Math.floor(u / 1000));
            return;
          }
        }
      } catch (e) { /* not JSON, or session gone: no signal */ }
    });
  '
}

# Windows pid of the process listening on HELPER_SERVER's port, or empty when
# no listener is visible from this machine. This is the root of the CPU probe:
# a round launched with --attach runs its tool shells and `node` work inside
# the server's tree (measured 14 August), so the listening process's tree is
# where a busy round's CPU shows up. Found by port, never by name -- every
# opencode process carries the same name.
server_winpid() {
  port="${HELPER_SERVER##*:}"
  netstat -ano 2>/dev/null | grep -E "LISTENING" | grep -E ":${port}\b" | awk '{print $NF}' | head -1
}

# CPU consumed by the root Windows pid (the server's) and everything beneath
# it, tenths of a second, via scripts/orchestrate-cpu.ps1. A hung process
# burns no CPU; a working one does, and the walk sees the server's `node`
# processes and tool shells where the round's work actually happens. The
# caller compares successive samples: only an *advance* is a signal. The root
# is a pid, never a name and never a command-line marker: a probe that
# matches a marker string in the command line matches its own process
# (measured 14 August), which is how a naive kill finds the wrong thing.
cpu_tenths() {
  powershell -NoProfile -ExecutionPolicy Bypass -File "$HELPER_REPO/scripts/orchestrate-cpu.ps1" -RootPids "${1:-}" 2>/dev/null | tr -dc '0-9'
}
