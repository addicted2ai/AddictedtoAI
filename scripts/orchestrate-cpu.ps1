# CPU total for the opencode process tree, in tenths of a second.
#
# The liveness fallback for scripts/orchestrate.sh needs to see work wherever
# it actually happens. `Get-Process opencode | Measure-Object CPU -Sum` sees
# only the opencode processes themselves: a round's real work runs in child
# `node` processes and in tool shells under the server, so a busy round can
# show a flat opencode total while its descendants burn.
#
# The walk is rooted on three things:
#   - every opencode process (the round CLI, the --attach server, the TUI);
#   - every process whose command line contains the per-iteration Marker the
#     supervisor injects into the launch (as `--title` for the opencode run,
#     as a trailing argument for an ORCHESTRATE_COMMAND stub);
#   - the pids passed in RootPids (the pid bash reports for the job).
# then closed transitively over ParentProcessId.
#
# Parentage alone cannot do this. msys bash double-forks a backgrounded job:
# the pid bash reports ($!) is a fork layer that exits within seconds, and the
# real child tree hangs beneath dead pids whose WMI parent records never
# change, so a parent-chain walk from any bash ancestor stops at the first
# dead link. A command-line marker is the one fact that survives that
# structure. Walking from the marker and the opencode names rather than
# summing every `node` on the machine never counts unrelated work as progress.
#
# Output: a single integer, tenths of a CPU second for the whole tree.
# Prints nothing else; the caller strips non-digits anyway.

param(
  [string]$RootPids = "",
  [string]$Marker = "",
  [switch]$ListPids
)

$ErrorActionPreference = "SilentlyContinue"

$all = @(Get-CimInstance Win32_Process)

$matched = @{}
foreach ($p in $all) {
  if ($p.Name -like "*opencode*") {
    $matched[[int]$p.ProcessId] = $true
  }
  if ($Marker -and $p.CommandLine -and ($p.CommandLine -like "*$Marker*")) {
    $matched[[int]$p.ProcessId] = $true
  }
}
foreach ($token in ($RootPids -split ",")) {
  # PID 0 is System Idle Process; its "CPU" is idle time and it anchors the
  # whole machine. A supervisor bug passing 0 must not measure the machine.
  if ($token -match "^[1-9]\d*$") {
    $matched[[int]$token] = $true
  }
}

if ($ListPids) {
  ($matched.Keys | Sort-Object) -join ","
  exit
}

# Close transitively over the live snapshot, then sum CPU time. Dead
# intermediates are barriers by design: a process whose parent record names a
# dead pid is not added, which is exactly what keeps a stale child from a
# previous iteration out of the count.
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
