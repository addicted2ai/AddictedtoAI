import fs from "fs";
import path from "path";

// What the `human-owned-paths` CI job actually guards, read at build time
// from the workflow file that defines it — never typed into a page.
//
// WHY THIS FILE EXISTS. On 2026-08-22 that job was narrowed from four
// blanket-guarded paths (`CHARTER.md`, `.github/`, `prompts/`,
// `scripts/check-track-scope.mjs`) to the enforcement mechanism only, so
// that ordinary charter and prompt edits — which rule 13's delegation had
// already made legitimate — would stop failing a gate by design. `/blog`
// went on saying the job fails "on any pull request that changes the
// charter, the workflow definitions, or the loop's own prompt" for the
// whole of the next day, under a heading reading "What is true now, and
// only this." Nothing connected the sentence to the file, so nothing
// noticed.
//
// This is the same pattern app/lib/guardrails.js already uses for the
// Lighthouse thresholds: read the file the CI job actually runs, rather
// than keep a hand-copied second copy one directory away. A page that
// renders this list cannot describe a gate the repository does not have.
//
// WHAT IT DOES NOT ESTABLISH. It reads the job's path filter, which is a
// claim about which pull requests turn the job red. It says nothing about
// whether the job is in branch protection's required list (it is, read
// 2026-08-22 — but that is a repository setting, not a fact in this tree,
// and CHARTER.md rule 13a reserves it), and nothing about whether an
// account with admin rights can merge past it anyway (it can; the pages
// that render this say so in their own words).

// The one line in the workflow that filters the changed-file list down to
// the guarded paths. Anchored on the `grep -E '^(...)'` form the job uses.
// Deliberately global: finding more than one is a failure, not a reason to
// take the first.
const FILTER_RE = /\|\s*grep -E '\^\(([^']+)\)'/g;

const WORKFLOW = path.join(".github", "workflows", "pr-checks.yml");

let cached;

export function getHumanOwnedPaths() {
  if (cached) return cached;

  const file = path.join(process.cwd(), WORKFLOW);
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(
      `getHumanOwnedPaths: cannot read ${WORKFLOW} (${error.message}) — ` +
        `the pages that describe the human-owned-paths gate render its ` +
        `guarded paths from that file rather than restating them, so a ` +
        `build without it must fail loudly instead of publishing an ` +
        `unchecked list`
    );
  }

  const matches = [...text.matchAll(FILTER_RE)];
  if (matches.length !== 1) {
    throw new Error(
      `getHumanOwnedPaths: expected exactly one "| grep -E '^(...)'" path ` +
        `filter in ${WORKFLOW}, found ${matches.length} — the job's shape ` +
        `changed, and guessing which one is the gate is how a page ends up ` +
        `describing a filter that is not the one running`
    );
  }

  // `\.` in the shell regex is a literal dot; nothing else in the current
  // alternation is escaped. Anything that still looks like regex syntax
  // after unescaping is a shape this reader was not written for, and is
  // rejected rather than rendered to a visitor as if it were a path.
  const paths = matches[0][1].split("|").map((raw) => {
    const p = raw.trim().replace(/\\\./g, ".");
    if (!p || /[\\^$*+?()[\]{}]/.test(p)) {
      throw new Error(
        `getHumanOwnedPaths: ${JSON.stringify(raw)} in ${WORKFLOW}'s path ` +
          `filter is not a plain path prefix — this reader renders these ` +
          `strings to visitors as paths and will not print a regex as one`
      );
    }
    return p;
  });

  cached = { paths, workflow: WORKFLOW.replace(/\\/g, "/"), job: "human-owned-paths" };
  return cached;
}

// True when the gate does not guard `name` — used by prose that says so
// out loud (CHARTER.md and prompts/ both came off this gate on
// 2026-08-22). A prefix match, matching the job's own `^(...)` semantics:
// `.github/` guards `.github/workflows/pr-checks.yml`.
export function isHumanOwnedPath(name) {
  return getHumanOwnedPaths().paths.some((prefix) => name.startsWith(prefix));
}
