// Follows RETIREMENT_DATES's `replacement` field hop by hop, from a dying
// identifier to wherever it actually lands, rather than stopping at the
// first hop the way /model-retirement-calendar's table (one opaque
// `replacement` cell per row) and /model-deprecation-checker's results table
// (same) both do today. Pure functions, no fetch, no model call: this reads
// the same static RETIREMENT_DATES array already shipped to the client for
// those two pages, matching rule 16's non-inference path the same way
// app/lib/model-deprecation-checker.js's own header argues and
// scripts/check-model-migration-chains.mjs re-proves for this file.
//
// Two things this file must get right that a naive implementation would not,
// both found by reading `replacement` in full rather than assuming it is
// always one bare identifier (docket/open/2026-08-22-model-migration-chains.md,
// "The named parsing risk"):
//
// 1. `replacement` is sometimes a comma-separated list of OPTIONS, not one
//    string: `dall-e-2`'s row reads "gpt-image-2, gpt-image-1, or
//    gpt-image-1-mini" -- three distinct identifiers a reader might migrate
//    to, not one. A chain-walker that treats this as a single opaque string
//    cannot tell a reader that two of those three options are themselves
//    dated and one is not.
// 2. `replacement` sometimes carries a parenthetical QUALIFIER attached to
//    one identifier: `o1-pro-2025-03-19`'s row reads "gpt-5.6-sol
//    (reasoning.mode: pro)" -- an identifier plus a mode flag, not a second
//    identifier and not part of the identifier's own name. Treating the
//    whole string as one identifier would fail to look it up as a
//    RETIREMENT_DATES row even where the bare identifier IS one, which
//    matters the moment a future round adds a dated row for "gpt-5.6-sol"
//    itself: bare comparison would silently stop the chain one hop early.
//
// parseReplacement() below is the small parser
// docket/open/2026-08-22-model-migration-chains.md asks for, tested against
// both rows by name in scripts/check-model-migration-chains.mjs.

import { buildIndex } from "./model-deprecation-checker.js";

// Normalizes a comma/"and"/"or" separated list of options to a single
// delimiter (a comma) before splitting, so both real shapes in the data
// parse the same way:
//   "gpt-image-2, gpt-image-1, or gpt-image-1-mini"  (Oxford-comma "or")
//   "Responses API and Conversations API"            (no comma at all)
// First pass folds a comma immediately followed by "and"/"or" down to a
// plain comma (so the Oxford-comma case above becomes an ordinary
// comma-separated list); second pass folds a bare " and "/" or " with no
// comma at all (the second case) the same way. Order matters: running the
// second pass first on the Oxford-comma case would leave the earlier plain
// commas untouched but is harmless either way here, since both passes are
// idempotent on input that already has no more matches -- kept in this
// order because the first pass is the narrower, more specific pattern.
function normalizeOptionList(text) {
  return text
    .replace(/,\s*(?:and|or)\s+/gi, ", ")
    .replace(/\s+(?:and|or)\s+/gi, ", ");
}

// Splits one option's text into its bare identifier and an optional
// parenthetical qualifier. Only a parenthetical that wraps the REST of the
// string counts as a qualifier (mirrors
// app/lib/model-deprecation-checker.js's parseIdentifiers, which applies the
// same "only a trailing paren is special" rule to `what`'s "(also ...)"
// aliases) -- a parenthetical anywhere else in the option text is left alone
// rather than guessed at, since nothing in the data currently needs that and
// a guess here is exactly the kind of silent mis-walk this file exists to
// avoid.
function splitQualifier(optionText) {
  const match = optionText.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { identifier: optionText, qualifier: null };
  return { identifier: match[1].trim(), qualifier: match[2].trim() };
}

// The parser docket/open/2026-08-22-model-migration-chains.md names by
// shape: given a RETIREMENT_DATES row's raw `replacement` string (or
// null/undefined for a row that names none), returns an array of
// `{ identifier, qualifier }` options -- never a single opaque string, and
// never a naive bare-string comparison. An empty or absent `replacement`
// returns an empty array, distinct from a replacement that fails to name
// anything parseable (which cannot currently happen given the data, but an
// all-whitespace or all-punctuation string would also correctly reduce to
// zero options rather than throw).
export function parseReplacement(replacement) {
  if (!replacement || !replacement.trim()) return [];
  return normalizeOptionList(replacement.trim())
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(splitQualifier)
    .filter((option) => option.identifier);
}

// The same alias-aware lookup app/lib/model-deprecation-checker.js already
// builds for `what` (primary identifier plus every parenthetical "(also
// ...)" alias, each pointing back at its row) -- reused here rather than
// reimplemented, per docket item requirement 1. Keyed lowercase for a
// case-insensitive, exact-identifier lookup: chain-walking resolves a named
// identifier against the data, which is a different operation from
// app/lib/model-deprecation-checker.js's findMatches (free-text search over
// an arbitrary paste) and does not need that function's tokenizer.
function buildLookup(rows) {
  const map = new Map();
  for (const entry of buildIndex(rows)) {
    map.set(entry.identifier.toLowerCase(), entry.row);
  }
  return map;
}

// Given any identifier, finds its RETIREMENT_DATES row via the alias-aware
// lookup above, or null if the identifier is absent from the data entirely
// -- which, by construction (the data's own stated scope in
// app/lib/retirement-dates.js's header), means a live model or API, not a
// dated one. Exported so a caller (the health check, the page) can resolve
// one identifier without walking a whole chain.
export function resolveIdentifier(identifier, rows) {
  if (!identifier) return null;
  return buildLookup(rows).get(identifier.trim().toLowerCase()) || null;
}

// Walks `identifier`'s replacement chain to every landing point it reaches.
// Returns a tree, not a single path, because a `replacement` naming several
// options (the dall-e-2/dall-e-3 shape) branches: each option is followed
// independently, and where an option is itself a RETIREMENT_DATES row, THAT
// row's own replacement is followed in turn, and so on.
//
// Every node's `status` is exactly one of:
//   "live"                 -- identifier absent from the data: a live
//                              model/API by construction, chain ends here
//   "no-replacement-named" -- identifier IS a RETIREMENT_DATES row, but its
//                              `replacement` is null/empty: a dated shutdown
//                              with nothing named to move to, chain ends here
//   "cycle"                -- identifier already appears earlier in THIS
//                              branch's own ancestry: the chain does not
//                              resolve, walking stops rather than looping
//   "retiring"              -- identifier IS a RETIREMENT_DATES row with at
//                              least one parsed replacement option; `hops`
//                              holds one entry per option, each pairing the
//                              parsed `{identifier, qualifier}` with the
//                              node that option resolves to
//
// Cycle detection is exact-identifier-based ancestry per branch (a Set of
// lowercased identifiers already visited on the path from the root to this
// node), not a hop-count limit: a genuine chain in this data is always
// finite because only identifiers that are themselves RETIREMENT_DATES rows
// can produce another hop, and there are finitely many of those (one check
// per row per branch, at most), so termination does not depend on guessing
// a safe depth.
export function walkChain(identifier, rows) {
  const lookup = buildLookup(rows);
  const start = (identifier || "").trim();

  function resolve(id, ancestry) {
    const key = id.toLowerCase();
    if (ancestry.has(key)) {
      return { identifier: id, status: "cycle" };
    }
    const row = lookup.get(key);
    if (!row) {
      return { identifier: id, status: "live" };
    }
    const options = parseReplacement(row.replacement);
    if (options.length === 0) {
      return { identifier: id, status: "no-replacement-named", row };
    }
    const nextAncestry = new Set(ancestry);
    nextAncestry.add(key);
    const hops = options.map((option) => ({
      option,
      target: resolve(option.identifier, nextAncestry),
    }));
    return { identifier: id, status: "retiring", row, hops };
  }

  return resolve(start, new Set());
}

// Flattens a walkChain() tree into one entry per branch, each carrying the
// full sequence of "retiring" nodes it passed through (every one of them a
// dead-end into another retirement, requirement 2 of the docket item -- not
// just the first hop) and the terminal node it landed on (requirement 1's
// "final landing point": live, no-replacement-named, or cycle). A chain with
// no branching (the common case) yields exactly one entry.
export function flattenChain(node, path = []) {
  const nextPath = [...path, node];
  if (node.status === "retiring") {
    return node.hops.flatMap((hop) => flattenChain(hop.target, nextPath));
  }
  return [{ path: nextPath, terminal: node }];
}
