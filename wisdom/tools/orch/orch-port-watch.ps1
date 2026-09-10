# Sample TCP state while a suite runs, so EADDRINUSE can be attributed to
# measured port pressure rather than to the phrase "under concurrent load".
#
# addictedtoai-ar0 established the shape and the numbers on 2026-08-29: client-
# side ephemeral-port exhaustion, 688 of 3,000 fetches failing with connect
# EADDRINUSE and listenFail=0, TIME_WAIT peaking around 17,700 netstat rows --
# roughly 8,800 real ports against a 13,976-port dynamic range, since loopback
# double-counts. That bead was closed by making the errno VISIBLE rather than by
# retrying, on the explicit reasoning that a retry around an unexplained failure
# hides the next one. So the errno is now in my gate log, and this is the
# instrument that turns it into a number.
#
# It samples; it changes nothing. The output is one row per sample so the peak
# and the shape are both readable, because a maximum alone cannot distinguish a
# brief spike from a sustained plateau -- and ar0's finding was specifically that
# failures appeared only once TIME_WAIT stayed high BETWEEN rounds.
param(
  [int]$Seconds = 420,
  [int]$IntervalMs = 3000,
  [string]$Out = "$env:TEMP\orch-portwatch.tsv"
)
$dyn = (netsh int ipv4 show dynamicport tcp | Select-String 'Number of Ports').ToString()
"# dynamic range: $dyn" | Out-File -FilePath $Out -Encoding utf8
"# columns: hhmmss  total  timewait  established  node_conns" | Out-File -FilePath $Out -Append -Encoding utf8
$end = (Get-Date).AddSeconds($Seconds)
while ((Get-Date) -lt $end) {
  $c = Get-NetTCPConnection -ErrorAction SilentlyContinue
  $tw = @($c | Where-Object { $_.State -eq 'TimeWait' }).Count
  $es = @($c | Where-Object { $_.State -eq 'Established' }).Count
  $nodePids = (Get-Process node -ErrorAction SilentlyContinue).Id
  $nc = if ($nodePids) { @($c | Where-Object { $nodePids -contains $_.OwningProcess }).Count } else { 0 }
  '{0}`t{1}`t{2}`t{3}`t{4}' -f (Get-Date -Format 'HH:mm:ss'), @($c).Count, $tw, $es, $nc |
    Out-File -FilePath $Out -Append -Encoding utf8
  Start-Sleep -Milliseconds $IntervalMs
}
