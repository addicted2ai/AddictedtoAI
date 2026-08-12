#!/usr/bin/env node
// Assemble the prompt for a run. One implementation, used by both the workflow
// and local runs, so a hand-started run and a scheduled one are given exactly
// the same instructions. Two copies of this text would drift, and the
// difference would show up as tracks behaving differently depending on who
// started them -- which is precisely the thing the record is supposed to make
// legible.
//
//   node scripts/build-prompt.mjs                      # dispatcher picks, supervised
//   node scripts/build-prompt.mjs --track scout        # force a track
//   node scripts/build-prompt.mjs --origin unsupervised
//
// Prints the prompt on stdout and a short summary on stderr, so the prompt can
// be piped without the summary getting in the way.

import { execFileSync } from "child_process";

const argv = process.argv.slice(2);
function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
}

const origin = arg("origin", "supervised");
const agent = arg("agent", "unknown");
if (!["supervised", "unsupervised", "maintainer"].includes(origin)) {
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
  origin === "unsupervised"
    ? "This run was scheduled and nobody read it first: Origin is 'unsupervised'."
    : `This run was started by hand: Origin is '${origin}'.`
}
Record these in your changelog entry:
  - Track: ${track}
  - Agent: ${agent}
The dispatcher reads Track to hold each track to its quota. Agent says which
model did the work -- rounds here have been produced by Claude Code, Codex and
the GitHub action, and "an AI" is less specific than the record can be.

When you are done, run 'node scripts/round.mjs ship'. It pushes, opens the pull
request, and decides whether to arm auto-merge from the round's own Origin. Do
not run 'gh pr merge --auto --squash' yourself: a round that arms its own merge
before the reading its Origin promises is the failure this gate exists to stop,
and the gate is the one place that decision is structural. Do not merge it
yourself and do not wait for the checks.`;

process.stdout.write(prompt + "\n");
process.stderr.write(`\n[track: ${track}] [origin: ${origin}] ${reason}\n`);
