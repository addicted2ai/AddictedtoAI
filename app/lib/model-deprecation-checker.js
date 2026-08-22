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
// parenthetical that begins "(also " is an alias list; a handful of rows use
// parentheses as plain description -- "Evals platform (dashboard and API)"
// -- and must not be split.
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
// `_`) is matched as a whole token, never a substring: "gpt-4" (an alias of
// the gpt-4-0613 row) must not match inside "gpt-4o-mini" or
// "gpt-4-turbo-2024-04-09" -- both different, current identifiers that
// happen to share the prefix. A naive `text.includes(identifier)` check
// gets this wrong on exactly the rows most likely to appear in a real
// paste. Identifiers that are not made only of token characters -- the
// handful of product/API names such as "Assistants API" or
// "OpenAI-Beta: realtime=v1" -- are names, not tokens a delimiter would
// isolate, and are matched as a literal substring instead.
//
// `/` is deliberately NOT a token character, even though no current
// identifier needs it drawn as a boundary: LiteLLM- and OpenRouter-style
// configs write a model as "openai/gpt-4-0613" or "anthropic/claude-sonnet-4-20250514",
// and treating `/` as ordinary text (splitting the token there, the same as
// whitespace or a quote) means the vendor-prefixed form tokenizes into
// "openai" and "gpt-4-0613" separately, so the bare identifier still
// resolves. Keeping `/` inside the token class would instead swallow the
// whole "vendor/model" string as one token that matches nothing -- silently
// missing one of the most common ways people actually paste a model ID.
const TOKEN_CHARS = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const TOKEN_PATTERN = /[A-Za-z0-9][A-Za-z0-9._-]*/g;

function tokensOf(text) {
  return text.match(TOKEN_PATTERN) || [];
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
      : haystack.includes(needle);
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
