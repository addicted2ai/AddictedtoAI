# CPU total, in tenths of a second, for a set of root Windows pids and
# everything beneath them.
#
# The liveness fallback for scripts/orchestrate.sh needs to see work wherever
# it actually happens. The root is the pid of the process serving
# ORCHESTRATE_SERVER: a round launched with `--attach` runs its tool shells
# and `node` work inside the server's tree (measured 14 August: a tool shell
# spawned by a --attach session descended from the server process, not from
# the CLI client), so a busy round would look flat if only the round CLI's own
# tree were counted. The supervisor passes one root, the server's; the
# comma-separated form is kept so a test can probe several trees at once.
#
# The walk is strictly downward, from the roots through ParentProcessId, so
# it can never reach anything above the roots -- the supervisor's own
# ancestry, or the OpenCode server's (when the server is the root, that is
# exactly the tree being measured). It never matches process names or
# command-line markers: a probe that greps command lines for a marker matches
# its own process (measured 14 August), which is how a naive kill finds the
# wrong thing, and name matching would count every opencode process on the
# machine, unrelated work included. Dead roots simply contribute nothing.
#
# Output: a single integer, tenths of a CPU second for the whole tree.
# Prints nothing else; the caller strips non-digits anyway.

param([string]$RootPids = "")

$ErrorActionPreference = "SilentlyContinue"

$all = @(Get-CimInstance Win32_Process)

$matched = @{}
foreach ($token in ($RootPids -split ",")) {
  # PID 0 is System Idle Process; its "CPU" is idle time and it anchors the
  # whole machine. A supervisor bug passing 0 must not measure the machine.
  if ($token -match "^[1-9]\d*$") {
    $matched[[int]$token] = $true
  }
}

# Close transitively over the live snapshot, then sum CPU time. The walk only
# ever adds a process whose parent is already in the set, so it descends from
# the roots and cannot climb anywhere.
$changed = $true
while ($changed) {
  $changed = $false
  foreach ($p in $all) {
    if ($matched.ContainsKey([int]$p.ParentProcessId) -and -not $matched.ContainsKey([int]$p.ProcessId)) {
      $matched[[int]$p.ProcessId] = $true
      $changed = $true
    }
  }
}

$total = 0
foreach ($p in $all) {
  if ($matched.ContainsKey([int]$p.ProcessId)) {
    $total += [double]$p.UserModeTime + [double]$p.KernelModeTime
  }
}

# Win32 process times are 100-nanosecond units. 1e6 of them are one tenth of a
# second, which is the caller's unit.
[math]::Round($total / 1000000.0)
