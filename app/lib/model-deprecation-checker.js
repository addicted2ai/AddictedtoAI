// Pure matching logic behind /model-deprecation-checker. No fetch, no model
// call: this is string matching over app/lib/retirement-dates.js's
// RETIREMENT_DATES, which is already static and shipped to the client for
// /model-retirement-calendar. Kept separate from the page and the client
// component so scripts/check-model-deprecation-parser.mjs (the health check
// wired into scripts/check-routes.sh) can import and exercise it the same
// way the browser does, rather than re-implementing the parsing to test it.
//
// The `what` field on a RETIREMENT_DATES row carries the vendor's own
// identifier, sometimes followed by a parenthetical alias list --
// "gpt-3.5-turbo-0125 (also gpt-3.5-turbo, gpt-3.5-turbo-completions)" --
// which is how OpenAI's own deprecations page writes a snapshot alongside
// the rolling alias that actually 404s for most callers. Only a
// parenthetical that begins "(also " is an alias list. Counted directly
// against the data (12 rows carry any paren in `what`; 11 are a real "(also
// "-anchored alias list): exactly one row uses parentheses as plain
// description instead -- "Evals platform (dashboard and API)" -- and must
// not be split.
export function parseIdentifiers(what) {
  const match = (what || "").match(/^(.*?)\s*\(also\s+([^)]+)\)\s*$/);
  if (!match) return { primary: (what || "").trim(), aliases: [] };
  const aliases = match[2]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { primary: match[1].trim(), aliases };
}

// Every literal string this checker can match, one entry per {identifier,
// row} -- the primary plus every alias, each pointing back at its
// RETIREMENT_DATES row so a match can report vendor/shutdown/replacement/
// href without a second lookup.
export function buildIndex(rows) {
  const index = [];
  for (const row of rows) {
    const { primary, aliases } = parseIdentifiers(row.what);
    for (const identifier of [primary, ...aliases]) {
      if (identifier) index.push({ identifier, row });
    }
  }
  return index;
}

// An identifier made only of token characters (letters, digits, `.`, `-`,
// `_`) is matched as a whole token, never a substring, which guarantees two
// different things at once, checked against the data rather than assumed:
//
// First: "gpt-4" (an alias of the gpt-4-0613 row) must not match inside
// "gpt-4o-mini" -- a real, current OpenAI identifier that is absent from
// RETIREMENT_DATES entirely and just happens to share the "gpt-4" prefix.
//
// Second, and easy to get backwards: a LONGER identifier that happens to
// start with a SHORTER alias belonging to a DIFFERENT row must still
// resolve to its own row rather than being swallowed by the shorter one.
// "gpt-4-turbo-2024-04-09" is not a bystander here the way "gpt-4o-mini"
// is -- it is itself an alias of the gpt-4-turbo row
// (`"gpt-4-turbo (also gpt-4-turbo-2024-04-09, gpt-4-turbo-completions)"`,
// a row unrelated to gpt-4-0613/"gpt-4"), and it must match THAT row, not
// be mistaken for the shorter "gpt-4" alias it happens to start with. An
// earlier version of this comment called both examples "different, current
// identifiers," which was false about the second one: found by a second
// independent review that re-derived the claim against the data rather
// than trusting the comment (round 168's CHANGELOG entry records both
// reviews). A naive `text.includes(identifier)` check gets both directions
// wrong on exactly the rows most likely to appear in a real paste.
// Identifiers that are not made only of token characters -- the handful of
// product/API names such as "Assistants API" or "OpenAI-Beta: realtime=v1"
// -- are names, not tokens a delimiter would isolate, and are matched as a
// literal substring instead.
//
// `/` is deliberately NOT a token character, even though no TOKEN-shaped
// identifier needs it drawn as a boundary (one PHRASE identifier,
// "v1/prompts API and reusable prompt objects", does contain a literal `/`,
// but phrase identifiers are matched by substring rather than tokenized, so
// this class of identifier is unaffected either way -- checked directly
// against RETIREMENT_DATES, not assumed): LiteLLM- and OpenRouter-style
// configs write a model as "openai/gpt-4-0613" or "anthropic/claude-sonnet-4-20250514",
// and treating `/` as ordinary text (splitting the token there, the same as
// whitespace or a quote) means the vendor-prefixed form tokenizes into
// "openai" and "gpt-4-0613" separately, so the bare identifier still
// resolves. Keeping `/` inside the token class would instead swallow the
// whole "vendor/model" string as one token that matches nothing -- silently
// missing one of the most common ways people actually paste a model ID.
// Exported (not just module-local) so scripts/check-model-deprecation-parser.mjs
// can classify an identifier as token- or phrase-shaped the same way
// findMatches does, rather than re-implementing the distinction to test it.
export const TOKEN_CHARS = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const TOKEN_PATTERN = /[A-Za-z0-9][A-Za-z0-9._-]*/g;

// `.` is the one character in TOKEN_PATTERN that is genuinely ambiguous: it
// has to stay in the class for a dotted version number (`gpt-4.1-nano`), but
// it is also the single most common way a sentence actually ends, with no
// space before the next token starts ("...gpt-4-0613."). The regex above is
// greedy, so a sentence-final period -- or an ellipsis's several -- gets
// absorbed into the token, and the extracted string no longer equals the
// stored identifier. Found by review (round 168's own health check never
// placed an identifier before a bare period, so it never saw this): 86 of
// 92 matchable identifiers in RETIREMENT_DATES are token-shaped and were
// exposed by this whenever a paste ended the identifier's mention with a
// period and no trailing word -- the single most natural way to reference a
// model in prose.
//
// No identifier in RETIREMENT_DATES ends in ".", so trailing dots are
// stripped from every extracted token -- repeatedly, so an ellipsis strips
// clean too. Only a dot at the very end of a token is touched; a dot
// separating two digits in the middle of a token (the version-number case)
// is never adjacent to the end and is left alone. Stripping can only ever
// *reveal* an identifier that trailing punctuation was hiding -- it cannot
// merge two different tokens into a false one, so it cannot introduce a new
// false positive the way loosening a boundary check could.
function tokensOf(text) {
  const raw = text.match(TOKEN_PATTERN) || [];
  return raw.map((t) => t.replace(/\.+$/, "")).filter(Boolean);
}

// A phrase identifier ("Assistants API", "Agent Builder") gets none of the
// token-set protection above, because it is not made only of token
// characters -- it has a space. A bare `haystack.includes(needle)` matches
// inside a longer word or a different compound term: "Videos API" fires
// inside "our videos apis are custom-built" (needle is a prefix of "apis"),
// and "Agent Builder" fires inside "the agent builder-pattern used here"
// (found by review; neither is hypothetical, both are ordinary English a
// visitor might actually paste describing their own, unrelated product).
//
// The fix mirrors the token-set guarantee for phrases: a match only counts
// if the character immediately before and immediately after it, when one
// exists, is not a character that would make it part of a larger word or
// hyphenated compound. Sentence punctuation (".", ",", "!", "?", ":", ";",
// closing brackets/quotes) and a possessive apostrophe are NOT connectors,
// so "the Assistants API." and "the Assistants API's endpoint" still match
// -- only a letter, digit, underscore or hyphen immediately touching the
// phrase disqualifies it, which is exactly what "apis", "apiece" and
// "builder-pattern" have and a real, separate mention of the phrase does
// not. Every occurrence in the text is checked, not just the first, so an
// unrelated compound earlier in the paste cannot hide a real, validly
// bounded mention later in it.
const PHRASE_CONNECTOR = /[A-Za-z0-9_-]/;

function phraseMatches(haystack, needle) {
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    const before = idx > 0 ? haystack[idx - 1] : null;
    const after =
      idx + needle.length < haystack.length ? haystack[idx + needle.length] : null;
    const boundedBefore = !before || !PHRASE_CONNECTOR.test(before);
    const boundedAfter = !after || !PHRASE_CONNECTOR.test(after);
    if (boundedBefore && boundedAfter) return true;
    idx = haystack.indexOf(needle, idx + 1);
  }
  return false;
}

// Find every RETIREMENT_DATES row that appears in `text`, at most once per
// row even if several of its identifiers (primary and aliases) are present.
// `rows` is threaded through explicitly, rather than imported at module
// scope, so the health check can pass a deliberately mutated copy without a
// second implementation of this function.
export function findMatches(text, rows) {
  if (!text || !text.trim()) return [];
  const haystack = text.toLowerCase();
  const tokenSet = new Set(tokensOf(text).map((t) => t.toLowerCase()));
  const index = buildIndex(rows);

  const matches = [];
  const seen = new Set();
  for (const { identifier, row } of index) {
    if (seen.has(row)) continue;
    const needle = identifier.toLowerCase();
    const hit = TOKEN_CHARS.test(identifier)
      ? tokenSet.has(needle)
      : phraseMatches(haystack, needle);
    if (hit) {
      matches.push({ matchedAs: identifier, row });
      seen.add(row);
    }
  }
  return matches;
}

// Split and order matches the same way /model-retirement-calendar does:
// already-past shutdowns first (most urgent — this is already broken),
// upcoming ones soonest-first.
export function classifyMatches(matches, todayIso) {
  const retired = matches
    .filter((m) => m.row.shutdown < todayIso)
    .sort((a, b) => b.row.shutdown.localeCompare(a.row.shutdown));
  const retiring = matches
    .filter((m) => m.row.shutdown >= todayIso)
    .sort((a, b) => a.row.shutdown.localeCompare(b.row.shutdown));
  return { retired, retiring };
}
