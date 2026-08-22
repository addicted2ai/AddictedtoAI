# DeepSeek peak-hour guard for scripts/orchestrate.sh, defined here so the
# supervisor can source it and a test can source it directly and call
# peak_guard() with a fixed clock -- see scripts/test-peak-window.mjs.
#
# docket/open/2026-08-17-deepseek-peak-hour-pricing.md: opencode-go/deepseek-v4-flash
# bills double in two daily UTC windows. The maintainer's decision, recorded
# in that item: pause unless explicitly authorised. This file is where that
# decision is enforced. The windows and rates themselves are not restated
# here -- they live once, in policy.yml's deepseek_peak_pricing block, and
# scripts/peak-window.mjs is the only code that turns a timestamp into a
# peak/off-peak verdict. This file only decides what the supervisor does with
# that verdict.
#
# peak_guard() is called at the top of every loop iteration in
# scripts/orchestrate.sh, before an iteration is started -- never against one
# already running. That ordering is deliberate and is the whole mechanism for
# the item's "an iteration already running when a window opens is allowed to
# finish" requirement: this guard has no code path that reaches a live
# child, a session, or an abort. It only ever decides whether to start the
# next one.
#
# Returns 0 to proceed with starting an iteration (off-peak, or peak with a
# matching authorisation) and 1 to skip this loop pass without starting one
# (peak with no matching authorisation, or the verdict could not be read).
# The caller is expected to note the reason either way and retry -- pausing,
# not stopping: the loop keeps polling and resumes on its own once the
# window ends or an authorisation is set, unlike docket/HOLD.md, which makes
# the loop halt and exit.
#
# Authorisation is ORCHESTRATE_PEAK_AUTH, an environment variable that must
# equal the *exact* windowStart timestamp peak-window.mjs reports for the
# window in progress (e.g. "2026-08-22T01:00:00.000Z"), not a bare on/off
# flag. That is deliberate: the item's own "hard to leave on by accident"
# requirement rules out a flag that, once set, silently authorises every
# future peak window for the rest of the supervisor's run -- which can be
# days. Binding the value to one window's exact start makes it self-expiring:
# the same env var left set past 04:00 UTC no longer matches anything, and
# the next night's 01:00 window needs a new value set on purpose.
# ORCHESTRATE_PEAK_REASON is optional free text logged alongside it, because
# an authorised skip-of-the-pause with no stated reason is exactly the kind
# of silent claim this project does not publish.
#
# ORCHESTRATE_PEAK_NOW overrides the clock peak-window.mjs is asked about,
# the same role ORCHESTRATE_LAUNCH plays for CHECKOUT_FLOOR above: empty
# means the real current time, and a test fixes it to land on a boundary
# second so the decision is provable without waiting for real UTC clock time
# to reach 01:00.
#
# Fail-closed, not fail-open -- the one deliberate difference from the
# liveness probes in scripts/orchestrate-liveness.sh, which treat a failed
# probe as "no signal, proceed" because their job is to avoid killing a
# healthy round on a noisy signal. This guard's job is the opposite: avoid
# starting an unauthorised double-rate round. A peak-window.mjs that cannot
# be read (a broken policy.yml, node missing, anything) is treated the same
# as an unauthorised peak window -- skip this pass and retry -- rather than
# silently falling back to the exact behaviour that produced the 2026-08-18
# hold. The retry means a transient failure costs one pass, not the loop.
peak_guard() {
  local verdict window window_start resumes_at peak_rate off_peak_rate
  verdict="$(node "$REPO/scripts/peak-window.mjs" "${ORCHESTRATE_PEAK_NOW:-}" 2>&1)"

  case "$verdict" in
    "OFFPEAK "*)
      return 0
      ;;
    "PEAK "*)
      window="$(printf '%s\n' "$verdict" | grep -o 'window=[^ ]*' | cut -d= -f2-)"
      window_start="$(printf '%s\n' "$verdict" | grep -o 'windowStart=[^ ]*' | cut -d= -f2-)"
      resumes_at="$(printf '%s\n' "$verdict" | grep -o 'resumesAt=[^ ]*' | cut -d= -f2-)"
      # Read from the verdict line, never hardcoded here: peak-window.mjs is
      # the only code that reads policy.yml's rate_per_1m_usd, and a literal
      # dollar figure in this file would be the second copy the item this
      # guard implements exists to prevent.
      peak_rate="$(printf '%s\n' "$verdict" | grep -o 'peakRate=[^ ]*' | cut -d= -f2-)"
      off_peak_rate="$(printf '%s\n' "$verdict" | grep -o 'offPeakRate=[^ ]*' | cut -d= -f2-)"
      if [ -n "${ORCHESTRATE_PEAK_AUTH:-}" ] && [ "$ORCHESTRATE_PEAK_AUTH" = "$window_start" ]; then
        note "PEAK WINDOW $window UTC -- authorised (ORCHESTRATE_PEAK_AUTH matches this window's start $window_start; reason: ${ORCHESTRATE_PEAK_REASON:-none given}) -- starting this iteration at double rate (deepseek-v4-flash \$${peak_rate:-?} per 1M vs \$${off_peak_rate:-?} off-peak, from policy.yml)"
        return 0
      else
        note "PEAK WINDOW $window UTC -- deepseek-v4-flash is double rate here (\$${peak_rate:-?} per 1M vs \$${off_peak_rate:-?} off-peak, from policy.yml) and no matching authorisation is set (ORCHESTRATE_PEAK_AUTH must equal $window_start to start a new iteration now). Not starting a new iteration; resuming automatically at $resumes_at UTC. This pauses the loop, it does not stop it, and does not touch an iteration already in flight."
        return 1
      fi
      ;;
    *)
      note "peak-window check did not return a verdict ($verdict) -- treating this as an unauthorised peak window rather than risking a double-rate start on an unreadable signal. Not starting a new iteration this pass; will retry."
      return 1
      ;;
  esac
}
