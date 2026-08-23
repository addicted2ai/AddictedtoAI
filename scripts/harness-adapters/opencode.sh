# The opencode harness adapter for scripts/orchestrate.sh -- the one
# function that differs when the harness is OpenCode. Everything else the
# loop does is already harness-agnostic text (see scripts/runners.yml's header); this
# file is the whole boundary for "how do you launch it". "How do you know
# it's alive" stays in scripts/orchestrate-liveness.sh, unmoved -- see
# scripts/runners.yml's own comment on why.
#
# CONTRACT every scripts/harness-adapters/*.sh file follows, so
# scripts/orchestrate.sh never needs a harness-specific branch to call one:
# define a shell function named `launch`, taking, in order,
#
#   $1 provider   $2 model   $3 variant   $4 marker   $5 prompt file   $6 log file
#
# and leaving the launched process backgrounded (trailing `&`) so `child=$!`
# in the caller's shell is the new process's pid. The adapter decides its own
# argv shape from those six values; scripts/orchestrate.sh does not know or
# care what they look like once assembled.
#
# This is exactly the inline code scripts/orchestrate.sh ran before this
# round (loop/meta/runner-config), moved here unchanged and parameterised on
# provider/model/variant instead of reading the module-level $MODEL/$VARIANT
# this round removed.
launch() {
  local provider="$1" model="$2" variant="$3" marker="$4" prompt_file="$5" log="$6"
  # The prompt argument must be "$(cat file)" alone. Appending anything after
  # it breaks OpenCode startup silently: no session, no error, a zero-byte
  # log (measured before this file existed; the failure predates the
  # adapter split, not caused by it). `--attach` makes the round appear in
  # the maintainer's web UI and `--title` carries the per-iteration marker
  # into the session's title, which is how scripts/orchestrate-liveness.sh's
  # api_session_id() finds it again.
  opencode run --attach "$ORCHESTRATE_SERVER" --title "$marker" --model "$provider/$model" --variant "$variant" "$(cat "$prompt_file")" > "$log" 2>&1 &
}
