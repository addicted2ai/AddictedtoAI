#!/usr/bin/env node
// Assemble the prompt for a run. One implementation, used by both the workflow
// and local runs, so a hand-started run and a scheduled one are given exactly
// the same instructions. Two copies of this text would drift, and the
// difference would show up as tracks behaving differently depending on who
// started them -- which is precisely the thing the record is supposed to make
// legible.
//
//   node scripts/build-prompt.mjs                      # dispatcher picks, no Origin claim
//   node scripts/build-prompt.mjs --track scout        # force a track
//   node scripts/build-prompt.mjs --origin unsupervised
//
// `--origin` has no default. Until 2026-08-24 it defaulted to `supervised`,
// so any caller that omitted the flag -- which `scripts/round.mjs start` did,
// unconditionally -- was handed a printed claim ("Origin is 'supervised'")
// that nothing had verified: at the moment a round starts, nobody yet knows
// whether a human will actually read it before it merges, which is the part
// of `supervised`'s own published meaning that made the claim true or false.
// See docket/open/2026-08-17-origin-is-self-declared-in-the-tree-it-gates.md,
// the box folded in from 2026-08-11-unsupervised-origin-assumes-scheduled.md.
// A caller that already knows its Origin (the GitHub workflow computes one
// from real signal -- schedule vs. `workflow_dispatch` -- before calling this
// script) still passes `--origin` explicitly and gets the same claim as
// before; only the no-flag case changed, to a caller told what determines
// the value instead of being told the value.
//
// Prints the prompt on stdout and a short summary on stderr, so the prompt can
// be piped without the summary getting in the way.

import { execFileSync } from "child_process";

const argv = process.argv.slice(2);
function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
}

const origin = arg("origin", null);
// `--agent` has no default. Until round 185 it defaulted to the literal
// string `unknown`, which line 88's block then printed under "Record these
// in your changelog entry" -- so this script instructed every round started
// without the flag to write `- Agent: unknown`, a value that names nothing
// and answers the provenance question with a shrug.
// scripts/check-changelog-provenance.mjs rejects it, which made this the
// launcher telling a round to write a value a required check blocks the
// merge on. Same treatment as `--origin` above, and for the same reason: a
// caller that cannot know the value is told what determines it rather than
// handed one nothing verified. `.github/workflows/loop.yml` calls this
// script without `--agent` and runs the round through
// `anthropics/claude-code-action@v1`, so its rounds resolve their own agent
// from this instruction.
const agent = arg("agent", null);
if (origin !== null && !["supervised", "unsupervised", "maintainer", "delegated"].includes(origin)) {
  console.error(`unknown origin: ${origin}`);
  process.exit(1);
}

let track = arg("track", null);
// A caller that already ran the dispatcher passes its reason through, so a
// forced track and a dispatched one are not both reported as "forced".
let reason = arg("reason", "forced by hand");

if (!track) {
  const out = execFileSync("node", ["scripts/dispatch.mjs"], { encoding: "utf8" });
  track = (out.match(/^track:\s+(\S+)/m) || [])[1];
  reason = (out.match(/^reason:\s+(.+)$/m) || [])[1] || "dispatcher";
  if (!track || track === "(none") {
    console.error("dispatcher selected no track — nothing to run");
    process.exit(2);
  }
}

const prompt = `You are running the **${track}** track.

The dispatcher chose it: ${reason}

Read prompts/shared/every-run.md first, then prompts/tracks/${track}.md, and
follow them.

Your track was chosen for you. You may argue in the record that it was the
wrong choice; you may not switch tracks.

Branch as loop/${track}/<slug>. CI reads your track from that branch name and
rejects changes outside your track's paths.

${
  origin === null
    ? "This run was started by hand. Nothing at this point knows whether anyone will actually " +
      "read it before it merges -- that is exactly what 'Origin: supervised' would need to be " +
      "true, and this tool has no way to assert it yet " +
      "(docket/open/2026-08-17-origin-is-self-declared-in-the-tree-it-gates.md). Determine your " +
      "true Origin from what actually happens this round -- CHANGELOG.md's own definitions, not " +
      "this message -- and declare it honestly. 'supervised' was recorded as this session's " +
      "working default for 'ship' to compare your entry against later, not as a claim handed to " +
      "you: if your true Origin differs, 'ship' will not arm auto-merge on its own say-so; a " +
      "human arms it by hand after checking why."
    : origin === "unsupervised"
    ? "This run was scheduled and nobody read it first: Origin is 'unsupervised'."
    : `This run was started by hand: Origin is '${origin}'.`
}
Record these in your changelog entry:
  - Track: ${track}
  - Agent: ${agent ?? "<determine it -- see below>"}
The dispatcher reads Track to hold each track to its quota. Agent says what
actually ran the round -- rounds here have been produced by Claude Code,
Codex and the GitHub action, and "an AI" is less specific than the record can
be.${
  agent === null
    ? `
No --agent was passed, so nothing here knows what is running you and this
prompt will not invent a value. Name what actually ran this round. It must
resolve in scripts/runners.yml, which scripts/check-changelog-provenance.mjs
checks at merge: a harness (opencode, claude-code, codex,
claude-code-action), a model (claude-opus-5, claude-sonnet-5,
deepseek-v4-flash, gpt-5-codex), a runner key, or <provider>/<model>. A
qualifier in parentheses is free text and is not checked, so
'claude-opus-5 (Claude Code subagent)' is fine. Do not write 'unknown'.`
    : ""
}

When you are done, run 'node scripts/round.mjs ship'. It pushes, opens the pull
request, and decides whether to arm auto-merge from the round's own Origin. Do
not run 'gh pr merge --auto --squash' yourself: a round that arms its own merge
before the reading its Origin promises is the failure this gate exists to stop,
and the gate is the one place that decision is structural. Do not merge it
yourself and do not wait for the checks.`;

process.stdout.write(prompt + "\n");
process.stderr.write(`\n[track: ${track}] [origin: ${origin}] ${reason}\n`);
