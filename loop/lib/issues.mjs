/**
 * issues.mjs — the join between the machine's work and the beads issue tracker.
 *
 * THE ONE PLACE THE ID FORMAT IS DEFINED. Every other module asks this one,
 * so a change to the format is one edit and not a grep.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO: invoke `bd`, read the Dolt store,
 * or check that an id names an issue that exists. Validation splits in two, and
 * the split is load-bearing (`addictedtoai-occ0`):
 *
 *   FORMAT    — is this string shaped like an id? Pure, portable, no I/O. It
 *               runs anywhere, including inside `next build` on Vercel, where
 *               the `bd` binary does not exist and the store is unreachable.
 *   EXISTENCE — does that id name a real issue? Only a LOCAL gate can ask, and
 *               `scripts/verify-issue-links.mjs` is the one that does.
 *
 * Conflating them would make the site unbuildable the first time a Vercel build
 * touched a file carrying an `issue:`. Measured before designing around it: the
 * prebuild reads neither `data/proposals/` nor `data/ledger.jsonl`, so nothing
 * in the build path reaches this module today — the split keeps it that way by
 * construction rather than by luck.
 *
 * TWO READERS, AND WHY THEY DIFFER.
 *
 * `declaredIssueIds` reads a DECLARED FIELD — a proposal's `issue:`. A declared
 * field is a promise about its own shape, so anything that is not a well-formed
 * id is `malformed` and reported loudly, on exactly the terms a bad `type:`
 * already gets in `readProposals`. Silently ignoring `issue: see below` would be
 * a guardrail that reads as present and does nothing, which is the shape this
 * repository keeps catching.
 *
 * `harvestIssueIds` scans PROSE — a `DIRECTIVES.md` line the maintainer typed.
 * Prose cannot be malformed, because nothing in it claimed to be an id: a line
 * mentioning no id yields none, and that is a normal line, not a defect. This is
 * why `DIRECTIVES.md` needs no new syntax (design D1).
 */

/** The issue prefix for this repository. `bd` derives it from the directory name. */
export const ISSUE_PREFIX = 'addictedtoai';

/**
 * A well-formed id, anchored. The suffix bound is deliberately loose: observed
 * ids run 3 and 4 characters (`addictedtoai-3zf`, `addictedtoai-occ0`), and a
 * format check that rejected a real id would be worse than one that accepts a
 * string beads would never mint — the existence gate catches the latter, and
 * nothing catches the former.
 */
export const ISSUE_ID_RE = new RegExp(`^${ISSUE_PREFIX}-[a-z0-9]{2,32}$`);

/** The same shape, unanchored and global, for scanning prose. */
const SCAN_RE = new RegExp(`\\b${ISSUE_PREFIX}-[a-z0-9]{2,32}\\b`, 'g');

/** Is this string a well-formed issue id? Format only — see the header. */
export function isIssueId(value) {
  return typeof value === 'string' && ISSUE_ID_RE.test(value.trim());
}

/**
 * Read a DECLARED `issue:` field. Strict: every token must be a well-formed id.
 *
 * Four shapes are accepted, because the executor contract admits runners that
 * cannot all emit the same YAML, and because a maintainer typing by hand should
 * not have to remember which one this is:
 *
 *     issue: addictedtoai-occ0
 *     issue: [addictedtoai-occ0, addictedtoai-3zf]
 *     issue: addictedtoai-occ0, addictedtoai-3zf
 *     issues: addictedtoai-occ0            (the plural key, read by the caller)
 *
 * @param {unknown} value the raw front-matter value, or undefined
 * @returns {{present: boolean, ids: string[], malformed: string[]}}
 */
export function declaredIssueIds(value) {
  if (value === undefined || value === null || value === '') {
    return { present: false, ids: [], malformed: [] };
  }
  const tokens = [];
  const push = (v) => {
    // A scalar may carry several ids separated by commas or whitespace. Split
    // on both so `issue: a, b` and `issue: a b` mean the same thing.
    String(v)
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^[`'"[\]]+|[`'"[\]]+$/g, '').trim())
      .filter(Boolean)
      .forEach((t) => tokens.push(t));
  };
  if (Array.isArray(value)) value.forEach(push);
  else push(value);

  const ids = [];
  const malformed = [];
  for (const t of tokens) {
    if (isIssueId(t)) {
      if (!ids.includes(t)) ids.push(t); // dedupe, first mention wins
    } else if (!malformed.includes(t)) {
      malformed.push(t);
    }
  }
  return { present: true, ids, malformed };
}

/**
 * Scan free prose for issue ids. Permissive by design — see the header.
 *
 * Order is first-mention, duplicates removed, so the result is stable and a
 * line naming one id twice does not record it twice.
 *
 * @param {unknown} text
 * @returns {string[]}
 */
export function harvestIssueIds(text) {
  const out = [];
  for (const m of String(text ?? '').matchAll(SCAN_RE)) {
    if (!out.includes(m[0])) out.push(m[0]);
  }
  return out;
}

/**
 * Merge id lists from several sources into one, order-stable and deduped.
 * Used where a job knows ids from more than one place at once.
 */
export function mergeIssueIds(...lists) {
  const out = [];
  for (const list of lists) {
    for (const id of list ?? []) {
      if (isIssueId(id) && !out.includes(id)) out.push(id);
    }
  }
  return out;
}
