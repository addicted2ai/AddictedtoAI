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
// stored identifier. Found by review: 86 of 92 matchable identifiers in
// RETIREMENT_DATES are token-shaped and were exposed by this whenever a
// paste ended the identifier's mention with a period and no trailing word
// -- the single most natural way to reference a model in prose.
//
// A second round of review found that fix only reached a dot at the
// literal end of an extracted run. Glue the next word straight onto the
// period with no space -- "gpt-4-0613.Then we switched vendors." -- and
// the dot becomes internal, so the same regex greedily extracts
// "gpt-4-0613.Then" as one continuous, unmatchable run.
//
// THE INVARIANT THIS CODE MUST HOLD, stated explicitly rather than left as
// an emergent property of how the loop happens to be shaped: the matcher
// must never return a row the input does not unambiguously name. Any
// transformation applied here -- stripping, truncating, de-gluing -- that
// could yield an identifier different from the one actually typed must
// produce NO match rather than a guess. A miss is an acceptable outcome; a
// confident wrong answer with a date and a vendor link is not.
//
// A third round of review found that an EARLIER version of this fix
// violated that invariant, because the orchestrator's own specified design
// for it did: `dotCandidatesOf` truncated at every remaining internal dot
// in an unbounded loop, with no check that the surviving candidate was
// related to what was typed. The single most ordinary double-keystroke
// typo -- "gpt-4..1-nano" instead of "gpt-4.1-nano" -- made the full string
// and its first truncation both fail, and the loop kept peeling past them
// until it hit "gpt-4", a real alias, but of the unrelated,
// differently-dated gpt-4-0613 row. 4 of the data's 17 dotted identifiers
// were exploitable this way; three of the four also misreported the
// replacement model, not only the date. That earlier design was specified
// by the orchestrator directing this round and reproduced faithfully by
// this file; the defect was in the specification, not introduced by
// departing from it.
//
// The fix actually adopted here is narrower than "truncate until
// something matches," on purpose, per the direction that a rule handling
// only the provably safe case is better than a clever one with a hole in
// it: dotCandidatesOf returns AT MOST TWO candidates, never a chain. The
// whole run (trailing dots stripped) is always tried first. A second,
// shorter candidate is generated ONLY when the run contains a dot (or run
// of dots) immediately followed by an uppercase letter -- the shape of an
// actual sentence boundary in ordinary English ("gpt-4-0613.Then") -- and
// the candidate is everything before that boundary. A dot followed by a
// digit or a lowercase letter is never treated as a boundary, because
// that is exactly the shape of an identifier's own internal structure (a
// version number, a continuation), not of prose -- checked directly
// against the data: no dotted identifier in RETIREMENT_DATES has an
// uppercase character immediately after its own internal dot.
// "gpt-4..1-nano" has no uppercase anywhere in it, so this generates no
// second candidate at all, and the whole malformed run fails to resolve --
// a safe miss, not a guess. "gpt-4.1-nano.Then..." generates exactly one
// second candidate, "gpt-4.1-nano" (cut before ".Then", never before
// ".1"), because that is the only dot in the run followed by an uppercase
// letter. There is no third candidate for either case: if the two
// candidates here both fail, the run resolves to nothing, on purpose.
function rawRunsOf(text) {
  return text.match(TOKEN_PATTERN) || [];
}

function dotCandidatesOf(run) {
  const candidates = [];
  const whole = run.replace(/\.+$/, "");
  if (whole) candidates.push(whole);

  const boundary = run.search(/\.+[A-Z]/);
  if (boundary !== -1) {
    const truncated = run.slice(0, boundary);
    if (truncated && truncated !== whole) candidates.push(truncated);
  }
  return candidates;
}

// A fifth round of review found a defect older and broader than anything
// findings 3-5 touched, present unchanged since the very first commit: any
// character outside TOKEN_PATTERN's class -- not just a dot -- acts as a
// hard delimiter, so one landing INSIDE an identifier's own characters
// (not between words) silently splits it into two runs, and one of the
// halves can be a real, wrong, differently-dated alias.
// "gpt-4​o-realtime-preview" (a zero-width space glued between "gpt-4"
// and "o-realtime-preview" -- a real Slack/PDF/CJK-editor copy-paste
// artifact) tokenized as two runs, and the first, "gpt-4", matched the
// unrelated gpt-4-0613 row. Proved present on the tool's original commit,
// before any review or fix in this chain existed -- this is not something
// dotCandidatesOf or hasLongerDottedSibling introduced or can be reached
// through; it is the base tokenizer.
//
// Two different characters classes, two different treatments, per the
// same invariant as above (a fragment produced by a split the input did
// not clearly intend must not resolve):
//
// Unicode "format" characters (category Cf: zero-width space/joiner/
// non-joiner, soft hyphen, BOM, and the category generally) carry no
// textual meaning and are invisible to whoever typed or pasted them --
// nobody "intends" one as a separator, because nobody can see it. Text
// tools normally strip these before tokenizing rather than treat them as
// boundaries, so they are removed from the input entirely, unconditionally,
// before anything else in this file runs.
const FORMAT_CHARS = /\p{Cf}/gu;

function stripFormatChars(text) {
  return text.replace(FORMAT_CHARS, "");
}

// NBSP, en dash, em dash, and the curly single/double quote marks are
// different: they are visible, and a person may genuinely have typed one
// as punctuation ("gpt-4-0613—it's retiring soon"). They are NOT
// stripped unconditionally -- that would risk gluing two genuinely
// separate words together elsewhere in a paste. Instead: wherever one of
// these sits directly between two ordinary token characters, with nothing
// else around it, that whole stretch is tried FIRST as a single glued
// candidate (the character removed) before falling back to today's
// ordinary splitting. "gpt-4—o-realtime-preview" glues to
// "gpt-4o-realtime-preview", which IS the real, correct identifier, so it
// resolves correctly on the first try and the dangerous shorter split is
// never reached. "gpt-4-0613—retiring soon" glues to
// "gpt-4-0613retiring", which is not a real identifier, so gluing fails
// and the run falls back to ordinary splitting -- "gpt-4-0613" alone,
// which already resolves correctly today and is untouched by any of this.
const AMBIGUOUS_SEPARATOR = /[ –—‘’“”]/g;
const LOOSE_PATTERN =
  /[A-Za-z0-9](?:[A-Za-z0-9._-]|[ –—‘’“”])*/g;

function looseRunsOf(text) {
  return text.match(LOOSE_PATTERN) || [];
}

function deglue(looseRun) {
  return looseRun.replace(AMBIGUOUS_SEPARATOR, "");
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

// A second, narrower ambiguity, found by brute-forcing typo variants
// across the real data (not reported by any review -- surfaced by running
// the exact sweep the coordinator asked for, applied honestly rather than
// scoped down to only the reported mechanism): three identifiers --
// "gpt-4", "gpt-image-1", "ft-gpt-4" -- are themselves complete, real
// rows, AND are also an exact dot-prefix of a DIFFERENT, longer real row
// ("gpt-4.1-nano", "gpt-image-1.5", "ft-gpt-4.1-nano-2025-04-14"
// respectively). Dropping the single trailing character from
// "gpt-image-1.5" produces "gpt-image-1." -- and that string is
// genuinely, irreducibly ambiguous: it is simultaneously the exact,
// correct trailing-punctuation form of the *shorter* row (gpt-image-1,
// shutdown 2026-10-23) and a one-character-dropped typo of the *longer*
// row (gpt-image-1.5, shutdown 2026-12-01, six weeks later). The two
// interpretations are indistinguishable as text, so a plain
// `${primary}.` sentence produced a wrong shutdown date even with the
// bounded, two-candidate design above and no unbounded truncation
// involved at all.
//
// hasLongerDottedSibling answers this precisely: a candidate this file
// PRODUCES BY REMOVING CHARACTERS (trailing-punctuation stripped, or
// sentence-boundary truncated -- anything where candidate !== the raw run
// the visitor actually typed) is rejected outright if some OTHER real
// identifier in the data begins with that candidate plus a literal ".".
// A run typed bare, with nothing stripped to reach it, carries none of
// this risk and is never affected: "gpt-image-1 is retiring" still
// resolves normally, because nothing was removed to produce "gpt-image-1"
// -- the ambiguity exists only when this file's own transformations are
// what produced the shorter string.
//
// Exported (not just module-local) so scripts/check-model-deprecation-parser.mjs
// can determine which identifiers carry this risk and assert the correct
// (safe-miss) expectation for them specifically, rather than re-deriving
// the relationship with a second implementation.
export function hasLongerDottedSibling(identifier, rows) {
  const prefix = identifier.toLowerCase() + ".";
  for (const entry of buildIndex(rows)) {
    if (
      TOKEN_CHARS.test(entry.identifier) &&
      entry.identifier.toLowerCase().startsWith(prefix)
    ) {
      return true;
    }
  }
  return false;
}

// Find every RETIREMENT_DATES row that appears in `text`, at most once per
// row even if several of its identifiers (primary and aliases) are present.
// `rows` is threaded through explicitly, rather than imported at module
// scope, so the health check can pass a deliberately mutated copy without a
// second implementation of this function.
//
// Token-shaped identifiers are resolved per LOOSE run of the text (in the
// order the loose runs appear -- see looseRunsOf's comment for what that
// widened boundary buys). Within each loose run, the glued (ambiguous
// separators removed) reading is tried first; only if nothing in it
// resolves does this fall back to the loose run's ordinary, narrower
// sub-runs, processed exactly as before this round's fifth finding. Each
// run or sub-run's candidates come from dotCandidatesOf, tried in order,
// stopping at the first one present in the data that is not disqualified
// by hasLongerDottedSibling -- see each function's own comment for why the
// ordering and the sibling guard, not just the candidate set, are what
// keep this safe. If nothing for a loose run resolves at all, it produces
// no match, on purpose. Phrase-shaped identifiers are unaffected by any of
// this and are still checked by substring in a separate pass.
export function findMatches(text, rows) {
  if (!text || !text.trim()) return [];
  // Format characters (zero-width space/joiner/non-joiner, soft hyphen,
  // BOM, the Unicode Cf category generally) are removed unconditionally,
  // before anything else -- see stripFormatChars's comment. Everything
  // below operates on the stripped text; nothing in this function ever
  // sees the original invisible characters again.
  const stripped = stripFormatChars(text);
  const haystack = stripped.toLowerCase();
  const index = buildIndex(rows);

  const tokenLookup = new Map();
  for (const entry of index) {
    if (TOKEN_CHARS.test(entry.identifier)) {
      tokenLookup.set(entry.identifier.toLowerCase(), entry);
    }
  }

  const matches = [];
  const seen = new Set();

  // Try one candidate string against the data. `run` is the raw text this
  // candidate was derived from -- unchanged, that raw text is passed
  // straight through to tokenLookup; transformed (trailing dots stripped,
  // sentence-boundary truncated, or ambiguous separators removed to glue
  // a loose run into one candidate), it is subject to hasLongerDottedSibling
  // the same way regardless of which transformation produced it. Returns
  // true when this run is settled -- either a match was recorded (or one
  // for this row already was, from an earlier loose run), or the only
  // candidate that matched was disqualified as ambiguous -- so the caller
  // knows not to fall back to anything narrower.
  function tryCandidate(candidate, run) {
    const found = tokenLookup.get(candidate.toLowerCase());
    if (!found) return false;
    if (candidate !== run && hasLongerDottedSibling(found.identifier, rows)) {
      // This candidate only exists because something was removed from
      // what was actually typed, and the result is a real identifier that
      // a different, longer real identifier also begins with -- genuinely
      // ambiguous. Refuse it, and refuse the whole run rather than
      // falling through to anything shorter still.
      return true;
    }
    if (!seen.has(found.row)) {
      matches.push({ matchedAs: found.identifier, row: found.row });
      seen.add(found.row);
    }
    return true; // longest-match-first: a shorter candidate is never tried once one resolves
  }

  for (const looseRun of looseRunsOf(stripped)) {
    const glued = deglue(looseRun);
    let settled = false;
    if (glued !== looseRun) {
      for (const candidate of dotCandidatesOf(glued)) {
        if (tryCandidate(candidate, glued)) {
          settled = true;
          break;
        }
      }
    }
    if (settled) continue;
    // Gluing this loose run either found nothing or wasn't applicable
    // (no ambiguous separator inside it) -- fall back to the ordinary,
    // narrower runs within it, exactly as findMatches has always done.
    for (const run of rawRunsOf(looseRun)) {
      for (const candidate of dotCandidatesOf(run)) {
        if (tryCandidate(candidate, run)) break;
      }
    }
  }

  for (const entry of index) {
    if (TOKEN_CHARS.test(entry.identifier)) continue; // handled above
    if (seen.has(entry.row)) continue;
    if (phraseMatches(haystack, entry.identifier.toLowerCase())) {
      matches.push({ matchedAs: entry.identifier, row: entry.row });
      seen.add(entry.row);
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
