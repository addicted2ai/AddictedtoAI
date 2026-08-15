import fs from "fs";
import path from "path";

// The loop's run history, read at build time from a committed snapshot.
//
// scripts/loop-history.mjs is the only place that asks GitHub for the truth:
// it counts workflow runs of loop.yml (the changelog only contains rounds
// that finished, so counting entries would measure successes and call them
// the total). `--snapshot` writes that report, plus the date it was taken,
// to app/lib/loop-history.json, which this module reads. The build never
// touches the network — the snapshot is committed, and
// scripts/check-loop-history-snapshot.mjs fails the build when the snapshot
// goes stale or disagrees with the live API.
//
// rounds_merged is the one count that comes from the changelog rather than
// the API: a round is a changelog entry, counted as of taken_at from the
// repository's own history (scripts/count-changelog-rounds.mjs, the one
// definition shared with the producer and the check). How a pull request's
// branch was named is not part of the definition — the round-126 changelog
// entry records why.
//
// The shape is validated lightly here (the strict version is the check
// script's) so that a malformed snapshot fails `next build` even if the
// check were somehow skipped — the page must never publish numbers a reader
// cannot trace to GitHub.

const FIELDS = [
  "taken_at",
  "runs_attempted",
  "runs_succeeded",
  "runs_failed",
  "failure_rate",
  "rounds_merged",
  "failed_run_ids",
  "recent_failures",
];

let cached;

export function getLoopHistorySnapshot() {
  if (!cached) {
    const file = path.join(process.cwd(), "app", "lib", "loop-history.json");
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      throw new Error(`loop-history snapshot is unreadable: ${error.message}`);
    }
    for (const field of FIELDS) {
      if (!(field in parsed)) {
        throw new Error(
          `loop-history snapshot is missing "${field}" — re-run ` +
            `node scripts/loop-history.mjs --snapshot`
        );
      }
    }
    cached = parsed;
  }
  return cached;
}
