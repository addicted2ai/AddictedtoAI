# The codex harness adapter for scripts/orchestrate.sh. See
# scripts/harness-adapters/opencode.sh for the shared `launch` contract.
#
# UNEXERCISED THIS ROUND, ON PURPOSE -- same caveat as
# scripts/harness-adapters/claude-code.sh. Codex rounds have already
# happened on this project (CHANGELOG.md: `Agent: codex` x17), but always
# dispatched directly by an orchestrator session, never by this supervisor.
# The command below is written from Codex's documented non-interactive exec
# mode, not proven against a real invocation this round. Confirm against
# `codex exec --help` before the first real use.
launch() {
  local provider="$1" model="$2" variant="$3" marker="$4" prompt_file="$5" log="$6"
  codex exec --model "$model" "$(cat "$prompt_file")" > "$log" 2>&1 &
}
