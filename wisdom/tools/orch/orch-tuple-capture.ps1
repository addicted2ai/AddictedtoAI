# One-shot capture of the TIME_WAIT TUPLE DISTRIBUTION, to be fired within the
# TIME_WAIT window (~120s on Windows) of a failure.
#
# WHY A COUNT IS NOT ENOUGH, AND THIS IS THE GAP MY SAMPLER LEAVES. `connect
# EADDRINUSE` on Windows does not require the port POOL to be exhausted. It
# requires the specific four-tuple (srcIP, srcPort, dstIP, dstPort) to be
# unavailable — so the quantity that matters is not how many ports are in
# TIME_WAIT, it is how those entries are DISTRIBUTED across destination ports.
# Many entries spread over many destinations is a healthy pool; the same number
# piled onto one or two destinations is a small tuple space, and a small tuple
# space can refuse a connection while 13,000 ports sit idle.
#
# THAT IS WHY 139 TIME_WAIT AGAINST A 13,976-PORT RANGE IS NOT YET AN ANSWER
# EITHER WAY. addictedtoai-ar0 measured a global count (~8,800 real ports) and
# concluded exhaustion; my measurement of 139 refutes exhaustion at that scale
# and says nothing about the tuple space, because I never measured it. A SUMMARY
# STATISTIC CANNOT ANSWER A QUESTION ABOUT SHAPE — the same sentence that made me
# print a row per sample instead of a peak, one level further down.
#
# This script CHANGES NOTHING. It reads the table and prints distributions.
param([string]$Out = "$env:TEMP\orch-tuples.txt")
$c = Get-NetTCPConnection -ErrorAction SilentlyContinue
$tw = @($c | Where-Object { $_.State -eq 'TimeWait' })
$lines = @()
$lines += "captured $(Get-Date -Format 'HH:mm:ss')"
$lines += "TIME_WAIT total: $($tw.Count)"
$lines += "distinct remote ports among TIME_WAIT: $(@($tw | Select-Object -ExpandProperty RemotePort -Unique).Count)"
$lines += "distinct local  ports among TIME_WAIT: $(@($tw | Select-Object -ExpandProperty LocalPort -Unique).Count)"
$lines += ""
$lines += "top remote ports (destination concentration -- this is the tuple-space question):"
$tw | Group-Object RemotePort | Sort-Object Count -Descending | Select-Object -First 15 | ForEach-Object {
  $lines += ("  dst {0,-6} {1,5} entries" -f $_.Name, $_.Count)
}
$lines += ""
$lines += "loopback share: $(@($tw | Where-Object { $_.RemoteAddress -eq '127.0.0.1' }).Count) of $($tw.Count)"
$lines += ""
$lines += "listeners inside the dynamic range 1025-15000:"
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -ge 1025 -and $_.LocalPort -le 15000 } |
  Sort-Object LocalPort -Unique | ForEach-Object { $lines += ("  {0}" -f $_.LocalPort) }
$lines | Tee-Object -FilePath $Out
