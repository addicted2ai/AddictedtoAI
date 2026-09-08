# Run EXACTLY ONE codex session and block until it exits.
#
# The maintainer's instruction of 2026-09-07 replaced the parallel-wave model:
# one codex session alive at any moment. The guard below is a MECHANISM, not a
# reminder — this project's own principle, learned expensively from the `cd`
# token, where briefs naming the exact forbidden string did not stop violations
# and only a PreToolUse block did.
#
# Usage:
#   f4-run-one.ps1 -Worktree D:\addictedtoai-worktrees\fleet3-nq36 `
#                  -Brief <path> -Log <path> -Effort medium -Label "implementer nq36"
param(
  [Parameter(Mandatory = $true)][string]$Worktree,
  [Parameter(Mandatory = $true)][string]$Brief,
  [Parameter(Mandatory = $true)][string]$Log,
  [Parameter(Mandatory = $true)][ValidateSet('medium', 'max')][string]$Effort,
  [Parameter(Mandatory = $true)][string]$Label,
  # A task the MAINTAINER assigned directly that is not part of the backlog
  # loop's implementer->reviewer chain. The serial instruction governs that
  # chain; a one-off audit is not in it. This exemption is deliberately explicit
  # and noisy rather than a silent hole in the guard — and it still refuses to
  # start a SECOND out-of-loop session, so it cannot become a fan-out.
  [switch]$OutsideLoop
)

$ErrorActionPreference = 'Continue'
$CODEX = 'C:\Users\BadBitch\AppData\Roaming\npm\codex.cmd'

# Count only THIS LOOP's sessions. The serial instruction governs the backlog
# loop, not the machine: the Desk runs its own author/reviewer on the same lane
# by separate standing instruction. Measured 2026-09-07 — the Desk's jobs live
# in the SAME parent directory as the fleet worktrees
# (D:\addictedtoai-worktrees\j-20260907-25), so the parent path cannot tell them
# apart and the `fleet` prefix is what distinguishes them. Counting every codex
# process here would make this guard refuse my own launches whenever the Desk
# happened to be running, which is a false positive that stops real work.
$all  = @(Get-CimInstance Win32_Process -Filter "Name='codex.exe'" |
          Where-Object { $_.CommandLine -like '*exec*' })
$live = @($all | Where-Object { $_.CommandLine -like '*\fleet*' })
$audit = @($all | Where-Object { $_.CommandLine -like '*mem-audit*' })
$desk = $all.Count - $live.Count - $audit.Count

if ($OutsideLoop) {
  # Not in the chain, so a live fleet session is not a conflict — but two
  # out-of-loop sessions would be exactly the fan-out this guard exists to stop.
  if ($audit.Count -gt 0) {
    "REFUSING TO START ${Label}: an out-of-loop session is already alive (PIDs: $($audit.ProcessId -join ', '))."
    exit 1
  }
  "OUTSIDE-LOOP SESSION: ${Label} is a maintainer-assigned task, not part of the implementer->reviewer chain."
  if ($live.Count -gt 0) {
    "  It will run ALONGSIDE $($live.Count) backlog-loop session(s) (PIDs: $($live.ProcessId -join ', ')). Stated, not hidden."
  }
} elseif ($live.Count -gt 0) {
  "REFUSING TO START ${Label}: $($live.Count) backlog-loop codex session(s) already alive (PIDs: $($live.ProcessId -join ', '))."
  'Serial discipline means exactly one at a time.'
  exit 1
}
if ($desk -gt 0) { "note: $desk non-fleet codex session(s) running (the Desk) — not a serial conflict, proceeding." }
if (-not (Test-Path $Brief)) { "REFUSING TO START ${Label}: no brief at $Brief"; exit 1 }
if (-not (Test-Path $Worktree)) { "REFUSING TO START ${Label}: no worktree at $Worktree"; exit 1 }

$argline = @(
  'exec', '-m', 'gpt-5.6-luna',
  '-c', "model_reasoning_effort=`"$Effort`"",
  '-c', 'model_context_window=1000000',
  '-c', 'model_auto_compact_token_limit=900000',
  '-c', 'approval_policy="never"',
  '-s', 'danger-full-access',
  '-C', $Worktree
) -join ' '

# LEAVE THE AUTHOR'S BRIEF ON DISK. The brief goes in through stdin, so nothing
# records it in the worktree — and the round-1 reviewer generator embeds
# `<worktree>/.agent-brief.md` so the reviewer can audit THE BRIEF as well as the
# change. Measured 2026-09-08 on addictedtoai-oq5d: no brief was copied, and the
# reviewer wrote "The brief was absent, so there was no narrowing to credit or
# fault." The verdict was still sound, but the brief-audit signal — the one that
# has caught a too-narrow brief repeatedly in this loop — was simply unavailable.
# It also leaves an on-disk record of what each worker was actually told.
#
# REVIEWER runs are excluded: a reviewer's own brief overwriting the author's
# would corrupt that record AND feed the reviewer's brief back into the next
# generator. Revision rounds ARE author briefs and are copied.
if ($Label -notmatch 'review') {
  Copy-Item -LiteralPath $Brief -Destination (Join-Path $Worktree '.agent-brief.md') -Force
}

"=== $Label starting (effort=$Effort) ==="
$start = Get-Date
# codex writes its whole transcript to STDERR with stdout empty, so a live run
# looks dead. 2>&1 is what makes the log grow; judge progress by log size.
& cmd.exe /c "`"$CODEX`" $argline < `"$Brief`" > `"$Log`" 2>&1"
$code = $LASTEXITCODE
$min = [math]::Round(((Get-Date) - $start).TotalMinutes, 1)

$commits = (git -C $Worktree log --oneline main..HEAD | Measure-Object -Line).Lines
"$Label finished: exit=$code ${min}m commits=$commits"

foreach ($f in 'RESULT.md', 'REVIEW.md') {
  $p = Join-Path $Worktree $f
  if (Test-Path $p) {
    $first = (Get-Content $p -TotalCount 1)
    "  $f first line: $first"
    $v = Select-String -Path $p -Pattern 'VERDICT: (approve|revise)' | Select-Object -First 1
    if ($v) { "  VERDICT LINE: $($v.Line)" }
  }
}
if ($code -ne 0) { "  NOTE: non-zero exit — check the tail of $Log"; Get-Content $Log -Tail 5 }
