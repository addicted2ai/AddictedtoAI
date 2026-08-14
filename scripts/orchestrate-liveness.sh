# Liveness probes for scripts/orchestrate.sh, defined here so the supervisor
# can source them and a test can source them directly.
#
# Both probes return empty output on failure, never a crash and never a false
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
            if (u > newest) newest = u;
          }
        }
        if (newest > 0) console.log(Math.floor(newest / 1000));
      } catch (e) { /* not JSON, or no matching session: no signal */ }
    });
  '
}

# CPU consumed by the opencode process tree plus the marker-matched and
# RootPids processes, tenths of a second, via scripts/orchestrate-cpu.ps1. A
# hung process burns no CPU; a working one does, and the walk sees the child
# `node` processes and tool shells where the work actually happens. The caller
# compares successive samples: only an *advance* is a signal.
cpu_tenths() {
  powershell -NoProfile -ExecutionPolicy Bypass -File "$HELPER_REPO/scripts/orchestrate-cpu.ps1" -RootPids "${1:-0}" -Marker "${2:-}" 2>/dev/null | tr -dc '0-9'
}

# Live pids whose command line carries the iteration marker (the round itself,
# or a stub launched with it). This is the only reliable way to find the child
# on this machine: bash double-forks background jobs, so the pid bash reports
# is a fork layer that dies within seconds while the real process tree hangs
# beneath it. Printed one per line, digits only.
marker_pids() {
  powershell -NoProfile -ExecutionPolicy Bypass -File "$HELPER_REPO/scripts/orchestrate-cpu.ps1" -ListPids -Marker "${1:-}" 2>/dev/null | tr -dc '0-9,'
}
