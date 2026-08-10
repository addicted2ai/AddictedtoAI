import fs from "fs";
import path from "path";

// Rounds 1-47 were built in a private predecessor repository. Its pull
// requests could not be migrated -- GitHub pull requests are server-side
// objects and their numbers cannot be reserved -- so `#22` in this
// repository will eventually be a real but completely unrelated pull
// request.
//
// That makes `${repoUrl}/pull/22` worse than a dead link: it is a link
// that resolves to the wrong thing, on the page whose entire purpose is
// citable evidence. So archived rounds link to their commit instead, which
// migrated intact and carries the actual diff.
//
// Which rounds are archived is *derived* from archive/prs.json rather than
// written down as a cutoff number, per the standing rule that a stated fact
// is either computed at build time or can't drift. See archive/README.md.

let cached;

function load() {
  if (cached) return cached;

  const file = path.join(process.cwd(), "archive", "prs.json");
  const entries = JSON.parse(fs.readFileSync(file, "utf8"));

  const byNumber = new Map();
  for (const entry of entries) {
    if (!entry.commit_sha) continue;
    byNumber.set(entry.number, entry);
  }
  cached = byNumber;
  return cached;
}

// The archived pull request for a number, or null if this round was built
// in the current repository and can link to a real pull request.
export function getArchivedPr(number) {
  return load().get(number) || null;
}

export function getArchiveSize() {
  return load().size;
}
