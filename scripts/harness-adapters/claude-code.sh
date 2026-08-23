# The claude-code harness adapter for scripts/orchestrate.sh. See
# scripts/harness-adapters/opencode.sh for the shared `launch` contract.
#
# UNEXERCISED THIS ROUND, ON PURPOSE. Claude Code rounds have already
# happened on this project (CHANGELOG.md: `Agent: claude-code` x13,
# `Agent: claude-sonnet-5 (Claude Code subagent)` x8), but every one of them
# was dispatched directly by an orchestrator session, never launched by
# scripts/orchestrate.sh's supervisor loop -- see runners.yml's
# harnesses.claude-code.supervisor comment. This file exists so the
# supervisor *could* launch a claude-code round the same way it launches an
# opencode one, but the command below is written from the CLI's documented
# non-interactive flags, not proven against a real invocation: actually
# running it would start a real, billed session, and this round's own
# working rules forbid spending that without being asked to. Confirm the
# flags below against `claude --help` before the first real use, and update
# this comment once they have actually been exercised.
launch() {
  local provider="$1" model="$2" variant="$3" marker="$4" prompt_file="$5" log="$6"
  # variant has no meaning for this harness (runners.yml's claude-code
  # entries carry variant: null) -- Claude Code's reasoning-effort knob, if
  # any, is not the OpenCode `low`/`high`/`max` vocabulary, so it is not
  # threaded through here rather than guessed at.
  claude -p "$(cat "$prompt_file")" --model "$model" > "$log" 2>&1 &
}
