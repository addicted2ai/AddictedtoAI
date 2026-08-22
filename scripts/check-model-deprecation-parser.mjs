#!/usr/bin/env node
// Health check for the model deprecation checker's matching logic. Run from
// the repository root:
//
//   node scripts/check-model-deprecation-parser.mjs
//
// /model-deprecation-checker (app/model-deprecation-checker/) matches pasted
// text against app/lib/retirement-dates.js's RETIREMENT_DATES using
// app/lib/model-deprecation-checker.js's parseIdentifiers/findMatches. This
// is the check prompts/tracks/build.md demands of every demo: a future edit
// to RETIREMENT_DATES -- an alias written "(aka X)" instead of "(also X)", an
// identifier with a character the tokenizer treats as a delimiter -- must
// fail this check rather than silently stop matching. Wired into
// scripts/check-routes.sh (build's own file) and so runs in CI.
//
// Every row's primary identifier, and every one of its parenthetical
// aliases, is pasted into a sentence on its own and must resolve to that
// exact row. A decoy identifier that is nowhere in the data must resolve to
// nothing, and a short alias ("gpt-4") must not spuriously match inside an
// unrelated longer identifier that shares its prefix ("gpt-4o-mini") -- the
// token-boundary guarantee the matcher exists to provide, not merely "the
// parser ran".

import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const { RETIREMENT_DATES } = await import(
  pathToFileURL(path.join(root, "app", "lib", "retirement-dates.js")).href
);
const { parseIdentifiers, findMatches, TOKEN_CHARS } = await import(
  pathToFileURL(path.join(root, "app", "lib", "model-deprecation-checker.js")).href
);

let failures = 0;
let checks = 0;
const ok = (m) => {
  checks++;
  console.log(`ok    ${m}`);
};
const bad = (m) => {
  checks++;
  failures++;
  console.log(`FAIL  ${m}`);
};

console.log(`checking ${RETIREMENT_DATES.length} RETIREMENT_DATES row(s) against the parser\n`);

for (const row of RETIREMENT_DATES) {
  const { primary, aliases } = parseIdentifiers(row.what);

  if (!primary) {
    bad(`"${row.what}" parsed to an empty primary identifier`);
    continue;
  }

  const primaryHits = findMatches(
    `Our deployment still references ${primary} in the pipeline.`,
    RETIREMENT_DATES
  );
  if (primaryHits.some((m) => m.row === row)) {
    ok(`primary "${primary}" matches its own row`);
  } else {
    bad(`primary "${primary}" (from "${row.what}") does not match its own row when pasted`);
  }

  // The trailing-period case, at full scale across every identifier in the
  // data rather than a hand-picked few: an identifier as the very last word
  // of a sentence, with the period glued on and nothing after it to give a
  // token-based matcher a delimiter. Round 168's review found this misses
  // 86 of 92 matchable identifiers (93%) — the single most natural way to
  // reference a model in prose ("We are still on gpt-4-0613.") — and its
  // own health check never once placed an identifier there. This closes
  // that gap permanently, for every row, not just the ones review happened
  // to try.
  const primaryPeriodHits = findMatches(`${primary}.`, RETIREMENT_DATES);
  if (primaryPeriodHits.some((m) => m.row === row)) {
    ok(`primary "${primary}." (sentence-final, trailing period, nothing after) matches its own row`);
  } else {
    bad(`primary "${primary}." (sentence-final, trailing period) does not match its own row`);
  }

  for (const alias of aliases) {
    const aliasHits = findMatches(
      `Our deployment still references ${alias} in the pipeline.`,
      RETIREMENT_DATES
    );
    if (aliasHits.some((m) => m.row === row)) {
      ok(`alias "${alias}" (of "${primary}") matches its own row`);
    } else {
      bad(`alias "${alias}" (of "${primary}", from "${row.what}") does not match its own row when pasted`);
    }

    const aliasPeriodHits = findMatches(`${alias}.`, RETIREMENT_DATES);
    if (aliasPeriodHits.some((m) => m.row === row)) {
      ok(`alias "${alias}." (sentence-final, trailing period) matches its own row`);
    } else {
      bad(`alias "${alias}." (sentence-final, trailing period) does not match its own row`);
    }
  }
}

// A string nowhere in the data must never match, or the checker's "nothing
// found" state -- what a visitor sees for everything they paste that is not
// actually retiring -- cannot be trusted.
const decoy = "totally-not-a-real-model-9000";
const decoyHits = findMatches(`Testing ${decoy} for safety.`, RETIREMENT_DATES);
if (decoyHits.length === 0) {
  ok(`decoy identifier "${decoy}" matches nothing`);
} else {
  bad(`decoy identifier "${decoy}" incorrectly matched ${decoyHits.length} row(s)`);
}

// The token-boundary guarantee: "gpt-4" (an alias of the gpt-4-0613 row)
// must not match inside "gpt-4o-mini" or "gpt-4-turbo-2024-04-09" (itself an
// alias of the separate gpt-4-turbo row). A naive `text.includes()` matcher
// gets both of these wrong.
const boundaryText = "We call gpt-4o-mini and gpt-4-turbo-2024-04-09 directly.";
const boundaryHits = findMatches(boundaryText, RETIREMENT_DATES);
const boundaryWhat = boundaryHits.map((m) => m.row.what);
if (boundaryWhat.some((w) => w.startsWith("gpt-4-0613"))) {
  bad('"gpt-4" (alias of gpt-4-0613) incorrectly matched inside "gpt-4o-mini"/"gpt-4-turbo-2024-04-09" — token boundary broken');
} else {
  ok('"gpt-4" does not spuriously match inside "gpt-4o-mini" or "gpt-4-turbo-2024-04-09"');
}
if (boundaryWhat.some((w) => w.startsWith("gpt-4-turbo (also"))) {
  ok('"gpt-4-turbo-2024-04-09" correctly matches its own row (gpt-4-turbo)');
} else {
  bad('"gpt-4-turbo-2024-04-09" should match the gpt-4-turbo row and did not');
}
if (boundaryWhat.length !== 1) {
  bad(`the boundary sentence should resolve to exactly 1 row, resolved to ${boundaryWhat.length}: ${boundaryWhat.join(" | ")}`);
}

// Fixed pastes a real developer would actually type, checked against a
// hardcoded expectation rather than one derived from parseIdentifiers()
// itself. The sweep above is tautological in one respect: it feeds each
// row's *own extracted* primary/aliases back into findMatches, so it cannot
// catch a break in extraction that changes what a real alias parses into
// (e.g. a future row spelling its alias marker "(aka X)" instead of
// "(also X)" would silently make the whole parenthetical part of the
// primary, and every per-row assertion above would still pass because it is
// checking the parser's output against itself). These fixtures are
// independent of what the parser currently believes an alias is, so a
// regression in extraction itself shows up here.
const FIXTURES = [
  { text: "still on gpt-3.5-turbo in prod", want: "gpt-3.5-turbo-0125" },
  { text: "calling gpt-4 directly, not gpt-4o", want: "gpt-4-0613" },
  { text: "using o1 for reasoning", want: "o1-2024-12-17" },
  { text: "the o3-mini endpoint", want: "o3-mini-2025-01-31" },
  { text: "gpt-4-turbo-2024-04-09 pinned in config", want: "gpt-4-turbo" },
  { text: "hitting the Assistants API still", want: "Assistants API" },
  // LiteLLM/OpenRouter-style vendor-prefixed model strings are one of the
  // most common real paste shapes and a real regression risk: `/` must stay
  // out of the token-character class (see app/lib/model-deprecation-checker.js)
  // or "openai/gpt-4-0613" tokenizes as one opaque string that matches
  // nothing instead of splitting so the bare identifier still resolves.
  { text: 'model: "openai/gpt-4-0613"', want: "gpt-4-0613" },
  { text: "anthropic/claude-opus-4-1-20250805 in the client config", want: "claude-opus-4-1-20250805" },
];
for (const { text, want } of FIXTURES) {
  const hits = findMatches(text, RETIREMENT_DATES);
  if (hits.some((m) => m.row.what.startsWith(want))) {
    ok(`fixture "${text}" resolves to "${want}"`);
  } else {
    bad(
      `fixture "${text}" should resolve to "${want}" and did not ` +
        `(got: ${hits.map((m) => m.row.what).join(", ") || "nothing"})`
    );
  }
}

// The punctuation matrix. The per-row sweep above proves the sentence-final
// period case across all 92 identifiers; this proves the *other* shapes a
// real paste surrounds an identifier with, each at least once, against a
// representative sample: a token primary (`gpt-4-0613`), a token alias
// (`gpt-3.5-turbo`), a short alias most exposed to accidental collision
// (`o1`), and the dotted-version-id control (`gpt-4.1-nano`) that has to
// keep working through every wrap, not just on its own. Comma, `!`, `?`,
// `:`, closing brackets/parens, a quoted-JSON close, and a bare newline
// were never broken by the tokenizer (none of those characters are in the
// token class to begin with) — included anyway so the matrix is asserted
// rather than assumed, and so a future change to the token class is caught
// here even if it never touches the period-specific fix.
const PUNCTUATION_SAMPLES = ["gpt-4-0613", "gpt-3.5-turbo", "o1", "gpt-4.1-nano"];
const PUNCTUATION_WRAPS = [
  { label: "trailing comma", wrap: (id) => `Using ${id}, for now.` },
  { label: "trailing exclamation mark", wrap: (id) => `We finally killed ${id}!` },
  { label: "trailing question mark", wrap: (id) => `Still on ${id}?` },
  { label: "trailing colon", wrap: (id) => `${id}: retiring soon` },
  { label: "closing paren", wrap: (id) => `(see ${id}) for details` },
  { label: "closing bracket", wrap: (id) => `models: [${id}]` },
  { label: "end of a quoted JSON string", wrap: (id) => `{"model": "${id}"}` },
  { label: "ellipsis", wrap: (id) => `still calling ${id}...` },
  { label: "possessive", wrap: (id) => `${id}'s replacement is named below` },
  { label: "end of line", wrap: (id) => `${id}\nnext line is unrelated` },
  { label: "sentence-final period", wrap: (id) => `We are still on ${id}.` },
];
for (const id of PUNCTUATION_SAMPLES) {
  for (const { label, wrap } of PUNCTUATION_WRAPS) {
    const text = wrap(id);
    const hits = findMatches(text, RETIREMENT_DATES);
    if (hits.some((m) => m.matchedAs === id)) {
      ok(`"${id}" (${label}: ${JSON.stringify(text)}) matches`);
    } else {
      bad(`"${id}" (${label}: ${JSON.stringify(text)}) should match and did not`);
    }
  }
}

// The other direction for finding 1: stripping a trailing period must only
// ever *reveal* a real identifier, never manufacture a false match out of a
// near-miss. A decoy with a period, and a genuinely different string that
// happens to become closer to a real identifier once its own trailing
// period is stripped, must both still match nothing.
const PERIOD_FALSE_POSITIVE_PROBES = [
  "This is not-a-real-model-9000.",
  "gpt-4-06133.", // one digit off gpt-4-0613, period-stripped it is still wrong
  "gpt-4-0613x.", // one letter off, period-stripped it is still wrong
];
for (const text of PERIOD_FALSE_POSITIVE_PROBES) {
  const hits = findMatches(text, RETIREMENT_DATES);
  if (hits.length === 0) {
    ok(`period-stripping does not turn "${text}" into a false match`);
  } else {
    bad(`"${text}" incorrectly matched ${hits.map((m) => m.row.what).join(", ")} — trailing-period fix is too loose`);
  }
}

// Phrase-boundary regressions, found by review: six identifiers in the data
// are not made of pure token characters ("Assistants API", "Agent Builder",
// "Videos API", among others) and were matched via a raw
// `haystack.includes()` with no boundary check at all — unlike the
// token-matched majority, which get the tokenSet protection specifically
// built to stop "gpt-4" matching inside "gpt-4o-mini". That let three
// confirmed false positives through on ordinary English describing an
// unrelated product. Hardcoded natural-language fixtures for the exact
// sentences review used, so this specific regression cannot return
// silently even if the generic structural sweep below is ever weakened.
const NEGATIVE_FIXTURES = [
  { text: "Our videos apis are all custom-built.", avoid: "Videos API" },
  { text: "The agent builder-pattern used here is different from OpenAI's.", avoid: "Agent Builder" },
  { text: "We split the cost of the assistants apiece, five bucks each.", avoid: "Assistants API" },
  { text: "OpenAI-Beta: realtime=v15 is a typo some clients send.", avoid: "OpenAI-Beta: realtime=v1" },
  {
    text: "The evals platform (dashboard and API)s summary looked fine.",
    avoid: "Evals platform (dashboard and API)",
  },
];
for (const { text, avoid } of NEGATIVE_FIXTURES) {
  const hits = findMatches(text, RETIREMENT_DATES);
  if (hits.some((m) => m.row.what === avoid)) {
    bad(`fixture "${text}" incorrectly matched "${avoid}" — phrase boundary broken`);
  } else {
    ok(`fixture "${text}" correctly does not match "${avoid}"`);
  }
}

// The other direction for finding 2: a real, validly bounded phrase mention
// — including with trailing punctuation or a possessive, the same
// requirement as the token case — must still match. Tightening the
// boundary must not have quietly broken the ordinary case.
const PHRASE_POSITIVE_FIXTURES = [
  { text: "We rely on the Assistants API.", want: "Assistants API" },
  { text: "the Assistants API's endpoint changed", want: "Assistants API" },
  { text: "OpenAI's Agent Builder retires soon.", want: "Agent Builder" },
  { text: "We use the Agent Builder, but not much.", want: "Agent Builder" },
  { text: "OpenAI shut down the Videos API entirely.", want: "Videos API" },
];
for (const { text, want } of PHRASE_POSITIVE_FIXTURES) {
  const hits = findMatches(text, RETIREMENT_DATES);
  if (hits.some((m) => m.row.what.startsWith(want))) {
    ok(`phrase fixture "${text}" resolves to "${want}"`);
  } else {
    bad(`phrase fixture "${text}" should resolve to "${want}" and did not`);
  }
}

// A generic structural sweep over every phrase-shaped identifier currently
// in the data (classified with the matcher's own TOKEN_CHARS, not a second
// copy of the rule), so a phrase identifier added later is covered without
// anyone having to remember to hand-write a fixture for it. Two directions,
// same as the hand-written fixtures above but mechanical: a letter glued on
// with no space must break the match (generalizing "apis"/"apiece"/
// "builder-pattern"), and a trailing period must not.
//
// Guarded rather than a bare destructure-and-use: TOKEN_CHARS was not
// exported before this round's fix, and a missing export must fail this
// check loudly and let every other assertion in the file still run, not
// crash the whole script with an uncaught TypeError partway through and
// hide everything queued after it.
if (typeof TOKEN_CHARS?.test !== "function") {
  bad(
    "app/lib/model-deprecation-checker.js does not export a usable TOKEN_CHARS " +
      "— cannot run the phrase-boundary structural sweep"
  );
} else {
  const phraseIdentifiers = [];
  for (const row of RETIREMENT_DATES) {
    const { primary, aliases } = parseIdentifiers(row.what);
    for (const id of [primary, ...aliases]) {
      if (id && !TOKEN_CHARS.test(id)) phraseIdentifiers.push({ id, row });
    }
  }
  if (phraseIdentifiers.length === 0) {
    bad("no phrase-shaped identifiers found in RETIREMENT_DATES — the phrase-boundary sweep is not exercising anything");
  }
  for (const { id, row } of phraseIdentifiers) {
    const gluedHits = findMatches(`${id}s were discussed at length`, RETIREMENT_DATES);
    if (gluedHits.some((m) => m.row === row)) {
      bad(`"${id}s" (glued suffix, no boundary) incorrectly matched its own row — phrase boundary broken`);
    } else {
      ok(`"${id}s" (glued suffix, no boundary) does not match — phrase boundary holds`);
    }

    const periodHits = findMatches(`${id}.`, RETIREMENT_DATES);
    if (periodHits.some((m) => m.row === row)) {
      ok(`"${id}." (trailing period) still matches its own row`);
    } else {
      bad(`"${id}." (trailing period) does not match its own row — phrase match broken by punctuation`);
    }
  }
}

console.log();
if (failures > 0) {
  console.log(`${failures} of ${checks} check(s) failed`);
  process.exit(1);
}
console.log(
  `all ${checks} checks passed — the parser matches every current identifier and alias in ` +
    `${RETIREMENT_DATES.length} row(s), rejects a decoy, and holds its token boundary`
);
