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
const imported = await import(
  pathToFileURL(path.join(root, "app", "lib", "model-deprecation-checker.js")).href
);
const { parseIdentifiers, findMatches, TOKEN_CHARS } = imported;

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

// Guarded the same way TOKEN_CHARS was guarded earlier: a missing export
// must fail this check loudly and let every other assertion in the file
// still run, not crash the whole script with an uncaught TypeError
// partway through and hide everything queued after it. Falls back to
// "nothing is sibling-risky," which exercises the pre-fix code's actual
// (unguarded) behavior rather than skipping those assertions.
let hasLongerDottedSibling = imported.hasLongerDottedSibling;
if (typeof hasLongerDottedSibling !== "function") {
  bad(
    "app/lib/model-deprecation-checker.js does not export a usable hasLongerDottedSibling " +
      "— cannot verify the dot-prefix sibling ambiguity guard; treating nothing as sibling-risky"
  );
  hasLongerDottedSibling = () => false;
}

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
  //
  // Three identifiers are a deliberate exception, found by a later
  // brute-force sweep: "gpt-4", "gpt-image-1" and "ft-gpt-4" are each a
  // real, complete row that is ALSO an exact dot-prefix of a different,
  // longer real row -- stripping the trailing period from "gpt-image-1."
  // is genuinely ambiguous with a one-character-dropped typo of
  // "gpt-image-1.5", a different row with a different shutdown date. For
  // these three, and only these three, the correct, safe behavior is NO
  // match once punctuation has been stripped -- asserted here as the
  // positive expectation, not silently skipped, so a future change that
  // accidentally makes them match again (reopening the wrong-date risk) is
  // caught rather than read as new coverage.
  const primaryHasSibling = hasLongerDottedSibling(primary, RETIREMENT_DATES);
  const primaryPeriodHits = findMatches(`${primary}.`, RETIREMENT_DATES);
  if (primaryHasSibling) {
    if (primaryPeriodHits.length === 0) {
      ok(`primary "${primary}." correctly matches NOTHING (ambiguous with a longer dotted sibling)`);
    } else {
      bad(`primary "${primary}." should be ambiguous (longer dotted sibling exists) and matched ${primaryPeriodHits.map((m) => m.row.what).join(", ")} instead`);
    }
  } else if (primaryPeriodHits.some((m) => m.row === row)) {
    ok(`primary "${primary}." (sentence-final, trailing period, nothing after) matches its own row`);
  } else {
    bad(`primary "${primary}." (sentence-final, trailing period) does not match its own row`);
  }

  // The run-on case, at the same full scale as the trailing-period sweep
  // above: a second round of review found that fix only reached a dot at
  // the literal end of an extracted run -- glue the next word straight
  // onto the period with no space ("gpt-4-0613.Then we switched vendors.")
  // and the dot becomes internal. Every identifier, not a sample, so this
  // specific regression cannot return silently for any row. Same three
  // sibling exceptions as above, for the same reason.
  const primaryGluedHits = findMatches(
    `We used ${primary}.Then we switched vendors.`,
    RETIREMENT_DATES
  );
  if (primaryHasSibling) {
    if (primaryGluedHits.length === 0) {
      ok(`primary "${primary}.Then..." correctly matches NOTHING (ambiguous with a longer dotted sibling)`);
    } else {
      bad(`primary "${primary}.Then..." should be ambiguous (longer dotted sibling exists) and matched ${primaryGluedHits.map((m) => m.row.what).join(", ")} instead`);
    }
  } else if (primaryGluedHits.some((m) => m.row === row)) {
    ok(`primary "${primary}.Then..." (period glued to the next word, no space) matches its own row`);
  } else {
    bad(`primary "${primary}.Then..." (period glued to the next word, no space) does not match its own row`);
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

    const aliasHasSibling = hasLongerDottedSibling(alias, RETIREMENT_DATES);
    const aliasPeriodHits = findMatches(`${alias}.`, RETIREMENT_DATES);
    if (aliasHasSibling) {
      if (aliasPeriodHits.length === 0) {
        ok(`alias "${alias}." correctly matches NOTHING (ambiguous with a longer dotted sibling)`);
      } else {
        bad(`alias "${alias}." should be ambiguous (longer dotted sibling exists) and matched ${aliasPeriodHits.map((m) => m.row.what).join(", ")} instead`);
      }
    } else if (aliasPeriodHits.some((m) => m.row === row)) {
      ok(`alias "${alias}." (sentence-final, trailing period) matches its own row`);
    } else {
      bad(`alias "${alias}." (sentence-final, trailing period) does not match its own row`);
    }

    const aliasGluedHits = findMatches(
      `We used ${alias}.Then we switched vendors.`,
      RETIREMENT_DATES
    );
    if (aliasHasSibling) {
      if (aliasGluedHits.length === 0) {
        ok(`alias "${alias}.Then..." correctly matches NOTHING (ambiguous with a longer dotted sibling)`);
      } else {
        bad(`alias "${alias}.Then..." should be ambiguous (longer dotted sibling exists) and matched ${aliasGluedHits.map((m) => m.row.what).join(", ")} instead`);
      }
    } else if (aliasGluedHits.some((m) => m.row === row)) {
      ok(`alias "${alias}.Then..." (period glued to the next word, no space) matches its own row`);
    } else {
      bad(`alias "${alias}.Then..." (period glued to the next word, no space) does not match its own row`);
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

// The token-boundary guarantee is actually two different guarantees, kept
// as two separate, isolated assertions rather than one combined sentence,
// after a third-party probe of this round's fix chased a bad expectation
// of its own and surfaced that app/lib/model-deprecation-checker.js's
// comment conflated them (fixed there this round; see this round's
// CHANGELOG entry).
//
// Guarantee A: "gpt-4" (an alias of the gpt-4-0613 row) must not match
// inside "gpt-4o-mini" -- a real, current OpenAI identifier that is absent
// from RETIREMENT_DATES entirely and just happens to share the "gpt-4"
// prefix. A naive `text.includes()` matcher gets this wrong.
const absentIdText = "We call gpt-4o-mini directly.";
const absentIdHits = findMatches(absentIdText, RETIREMENT_DATES);
if (absentIdHits.some((m) => m.row.what.startsWith("gpt-4-0613"))) {
  bad('"gpt-4" (alias of gpt-4-0613) incorrectly matched inside "gpt-4o-mini" — token boundary broken');
} else if (absentIdHits.length !== 0) {
  bad(`"We call gpt-4o-mini directly." should match nothing and matched ${absentIdHits.map((m) => m.row.what).join(", ")}`);
} else {
  ok('"gpt-4" does not spuriously match inside "gpt-4o-mini", and the sentence matches nothing else either');
}

// Guarantee B, isolated in its own sentence rather than sharing one with
// guarantee A: a LONGER identifier that happens to start with a SHORTER
// alias belonging to a DIFFERENT row must still resolve to its own row
// rather than being swallowed by the shorter one. "gpt-4-turbo-2024-04-09"
// is not an absent bystander the way "gpt-4o-mini" is above -- it is
// itself an alias of the gpt-4-turbo row (a row unrelated to
// gpt-4-0613/"gpt-4"), and must match THAT row, not be mistaken for the
// shorter "gpt-4" alias it happens to start with.
const swallowedIdText = "We pinned gpt-4-turbo-2024-04-09 in config.";
const swallowedIdHits = findMatches(swallowedIdText, RETIREMENT_DATES);
if (swallowedIdHits.some((m) => m.row.what.startsWith("gpt-4-0613"))) {
  bad('"gpt-4-turbo-2024-04-09" incorrectly matched the gpt-4-0613 row via its shorter "gpt-4" alias — a longer identifier was swallowed by a shorter one belonging to a different row');
} else if (swallowedIdHits.some((m) => m.row.what.startsWith("gpt-4-turbo (also"))) {
  ok('"gpt-4-turbo-2024-04-09" resolves to its own row (gpt-4-turbo), not the shorter "gpt-4" alias of the unrelated gpt-4-0613 row');
} else {
  bad(`"gpt-4-turbo-2024-04-09" should resolve to the gpt-4-turbo row and did not (got: ${swallowedIdHits.map((m) => m.row.what).join(", ") || "nothing"})`);
}
if (swallowedIdHits.length !== 1) {
  bad(`"${swallowedIdText}" should resolve to exactly 1 row, resolved to ${swallowedIdHits.length}: ${swallowedIdHits.map((m) => m.row.what).join(" | ")}`);
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

// Near-miss probes for the *glued* case specifically (a decoy, an
// off-by-digit, an off-by-letter identifier, each glued to a following
// word with no space) -- the same "the fix can only reveal, never
// manufacture" guarantee as PERIOD_FALSE_POSITIVE_PROBES above, checked
// again for the run-on shape rather than assumed to carry over.
const GLUED_FALSE_POSITIVE_PROBES = [
  "This is not-a-real-model-9000.Then something else happened.",
  "gpt-4-06133.Then something else happened.", // one digit off gpt-4-0613
  "gpt-4-0613x.Then something else happened.", // one letter off
];
for (const text of GLUED_FALSE_POSITIVE_PROBES) {
  const hits = findMatches(text, RETIREMENT_DATES);
  if (hits.length === 0) {
    ok(`gluing a word onto "${text.split(".")[0]}." does not turn it into a false match`);
  } else {
    bad(`"${text}" incorrectly matched ${hits.map((m) => m.row.what).join(", ")} — the glued-word fix is too loose`);
  }
}

// The dangerous direction, named explicitly rather than left to the sweep
// above to catch incidentally: `gpt-4.1-nano`'s own internal dot means its
// prefix "gpt-4" is *itself* a real alias -- of the unrelated,
// separately-dated gpt-4-0613 row. Getting this wrong would not be a miss,
// it would be a confident, specific, sourced wrong answer -- the exact
// failure mode this whole round exists to close. This specific case has
// stayed safe across two different implementations of the fix: a
// longest-match-first unbounded truncation (round 168's second attempt,
// which review found unsafe for a DIFFERENT input shape -- see the
// consecutive-dot-typo sweep below) and the bounded, sentence-boundary
// design that replaced it. Kept as its own named assertion, independent of
// which mechanism is behind it, so this exact case can never silently
// start failing again even if every more general sweep below it were
// deleted or the mechanism changes again.
const dangerousText = "We migrated off gpt-4.1-nano.Then we moved on.";
const dangerousHits = findMatches(dangerousText, RETIREMENT_DATES);
if (dangerousHits.some((m) => m.row.what.startsWith("gpt-4-0613"))) {
  bad(
    `"${dangerousText}" incorrectly degraded "gpt-4.1-nano" to the shorter "gpt-4" alias of the ` +
      "unrelated gpt-4-0613 row — a confident, specific, sourced wrong answer"
  );
} else if (dangerousHits.some((m) => m.row.what.startsWith("gpt-4.1-nano (also"))) {
  ok(`"gpt-4.1-nano", glued to a following word, resolves to its own row and never degrades to the shorter "gpt-4"`);
} else {
  bad(`"${dangerousText}" should resolve to the gpt-4.1-nano row and did not (got: ${dangerousHits.map((m) => m.row.what).join(", ") || "nothing"})`);
}

// The same guarantee, generalized: every identifier in the data that
// itself contains an internal dot (derived from the data, not hardcoded,
// so a future dotted identifier is covered automatically) must resolve to
// ITSELF when glued to a following word, never to a shorter real prefix
// belonging to a different row. This is the systematic version of the
// single named case above.
const dottedIdentifiers = [];
for (const row of RETIREMENT_DATES) {
  const { primary, aliases } = parseIdentifiers(row.what);
  for (const id of [primary, ...aliases]) {
    if (id && !id.includes(" ") && id.includes(".")) dottedIdentifiers.push({ id, row });
  }
}
if (dottedIdentifiers.length === 0) {
  bad("no dotted token-shaped identifiers found in RETIREMENT_DATES — the longest-match-first sweep is not exercising anything");
}
for (const { id, row } of dottedIdentifiers) {
  const text = `config references ${id}.Deprecated soon.`;
  const hits = findMatches(text, RETIREMENT_DATES);
  if (hits.length === 1 && hits[0].row === row) {
    ok(`dotted identifier "${id}", glued to a following word, resolves to its own row and only its own row`);
  } else {
    bad(
      `dotted identifier "${id}", glued to a following word, should resolve to exactly its own row and did not ` +
        `(got: ${hits.map((m) => m.row.what).join(", ") || "nothing"})`
    );
  }
}

// A THIRD round of review found a real defect in the shape of fix directly
// above: an earlier version of dotCandidatesOf truncated at every
// remaining internal dot in an unbounded loop, and a plain consecutive-dot
// typo -- "gpt-4..1-nano" instead of "gpt-4.1-nano", the single most
// ordinary double-keystroke slip, with NO glued word involved at all --
// made the full string and its first truncation both fail, and the loop
// kept peeling past them until it hit "gpt-4", a real alias of the
// unrelated, differently-dated gpt-4-0613 row. That unbounded design was
// specified by the orchestrator directing the round, not invented by this
// file's own implementation of it; the fix replaced it with the bounded,
// sentence-boundary rule documented in
// app/lib/model-deprecation-checker.js. Asserted here, permanently, for
// every one of the 17 dotted identifiers -- not just the one the typo
// happened to land on -- duplicating each one's first internal dot and
// requiring the result to resolve to NOTHING (a duplicated dot is not
// followed by an uppercase letter, so the bounded design never generates
// a second candidate for it at all).
for (const { id, row } of dottedIdentifiers) {
  const firstDot = id.indexOf(".");
  const typo = id.slice(0, firstDot) + "." + id.slice(firstDot); // duplicate the first dot
  const hits = findMatches(`I think ${typo} is what we use.`, RETIREMENT_DATES);
  if (hits.length === 0) {
    ok(`consecutive-dot typo of "${id}" ("${typo}") correctly matches nothing`);
  } else if (hits.some((m) => m.row === row)) {
    ok(`consecutive-dot typo of "${id}" ("${typo}") happens to still resolve to its own row (lucky, not required, not a failure)`);
  } else {
    bad(
      `consecutive-dot typo of "${id}" ("${typo}") incorrectly resolved to a DIFFERENT row: ` +
        `${hits.map((m) => m.row.what).join(", ")} (expected nothing, or its own row)`
    );
  }
}

// The mandatory brute-force sweep review's verdict asked for: generate
// realistic typo variants of every token-shaped identifier's primary AND
// every alias across all 77 rows -- a doubled character, a transposed
// adjacent pair, a dropped character, an inserted dot -- one variant per
// character position per generator, both bare and glued to a following
// capitalized word (the shape that exercises the risky candidate path at
// all). The pass condition is exact, not fuzzy: every single variant must
// resolve to NOTHING, or to the SAME row the un-typo'd identifier belongs
// to. A match to any OTHER row is a wrong answer and fails immediately,
// by name, not folded into a silent count. This is deliberately not a
// sampled check -- every row, every character position, every generator,
// every run.
function withDoubledChar(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) out.push(s.slice(0, i + 1) + s[i] + s.slice(i + 1));
  return out;
}
function withTransposedChars(s) {
  const out = [];
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] === s[i + 1]) continue;
    out.push(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2));
  }
  return out;
}
function withDroppedChar(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) out.push(s.slice(0, i) + s.slice(i + 1));
  return out;
}
function withInsertedDot(s) {
  const out = [];
  for (let i = 1; i < s.length; i++) out.push(s.slice(0, i) + "." + s.slice(i));
  return out;
}

const typoIdentifiers = [];
for (const row of RETIREMENT_DATES) {
  const { primary, aliases } = parseIdentifiers(row.what);
  for (const id of [primary, ...aliases]) {
    if (id && TOKEN_CHARS.test(id)) typoIdentifiers.push({ id, row });
  }
}

let typoVariantsTested = 0;
let typoWrongRowFailures = 0;
for (const { id, row } of typoIdentifiers) {
  const variants = new Set([
    ...withDoubledChar(id),
    ...withTransposedChars(id),
    ...withDroppedChar(id),
    ...withInsertedDot(id),
  ]);
  variants.delete(id); // a no-op mutation is not a typo
  for (const variant of variants) {
    for (const text of [variant, `${variant}.Then we moved on.`]) {
      typoVariantsTested++;
      const hits = findMatches(text, RETIREMENT_DATES);
      const wrongRow = hits.filter((m) => m.row !== row);
      if (wrongRow.length > 0) {
        typoWrongRowFailures++;
        bad(
          `typo variant "${variant}" of "${id}" (row: ${row.what}) wrongly resolved to a DIFFERENT row: ` +
            `${wrongRow.map((m) => `${m.matchedAs} -> ${m.row.what}`).join(", ")} (text: ${JSON.stringify(text)})`
        );
      }
    }
  }
}
if (typoWrongRowFailures === 0) {
  ok(
    `brute-force typo sweep: ${typoVariantsTested} variants across ${typoIdentifiers.length} identifiers ` +
      `(doubled/transposed/dropped/dot-inserted characters, bare and glued to a capitalized word) — ` +
      `zero resolved to a different row than the one they were derived from`
  );
}

// A FIFTH round of review found a defect older and broader than anything
// findings 3-5 touched: a non-token character landing INSIDE an
// identifier's own characters (not between words) silently splits it into
// two runs via the base tokenizer, and one half can be a real, wrong,
// differently-dated alias -- present unchanged since the tool's very
// first commit (`d45a8c9`), reproduced directly against it, so it
// predates every review pass in this chain rather than being introduced
// by any of the fixes findings 3-5 made.
//
// Swept every interior position of every token-shaped identifier's
// primary and every alias with 14 non-token characters: the seven the
// coordinator named (ZWSP, ZWJ, soft hyphen, NBSP, em dash, en dash,
// smart apostrophe) plus ZWNJ, BOM, the two directional marks (LRM, RLM),
// and curly double quotes -- broader than the reported set on purpose, to
// test that the fix's actual mechanism (strip the Unicode "format"
// category; glue-then-fallback for visible ambiguous separators) closes
// the class, not just the specific characters review happened to try.
const INTERIOR_SPLIT_CHARS = {
  "zero-width space (U+200B)": "​",
  "zero-width joiner (U+200D)": "‍",
  "zero-width non-joiner (U+200C)": "‌",
  "soft hyphen (U+00AD)": "­",
  "byte-order mark (U+FEFF)": "﻿",
  "left-to-right mark (U+200E)": "‎",
  "right-to-left mark (U+200F)": "‏",
  "non-breaking space (U+00A0)": " ",
  "em dash (U+2014)": "—",
  "en dash (U+2013)": "–",
  "left single quote (U+2018)": "‘",
  "right single quote / apostrophe (U+2019)": "’",
  "left double quote (U+201C)": "“",
  "right double quote (U+201D)": "”",
};

const interiorSplitIdentifiers = [];
for (const row of RETIREMENT_DATES) {
  const { primary, aliases } = parseIdentifiers(row.what);
  for (const id of [primary, ...aliases]) {
    if (id && TOKEN_CHARS.test(id)) interiorSplitIdentifiers.push({ id, row });
  }
}

let interiorSplitProbes = 0;
let interiorSplitWrongRow = 0;
let interiorSplitOwnRow = 0;
for (const [label, ch] of Object.entries(INTERIOR_SPLIT_CHARS)) {
  for (const { id, row } of interiorSplitIdentifiers) {
    for (let i = 1; i < id.length; i++) {
      const variant = id.slice(0, i) + ch + id.slice(i);
      interiorSplitProbes++;
      const hits = findMatches(`We reference ${variant} in the config.`, RETIREMENT_DATES);
      const wrongRow = hits.filter((m) => m.row !== row);
      if (wrongRow.length > 0) {
        interiorSplitWrongRow++;
        bad(
          `${label} inserted inside "${id}" at position ${i} wrongly resolved to a DIFFERENT row: ` +
            `${wrongRow.map((m) => `${m.matchedAs} -> ${m.row.what}`).join(", ")} (variant: ${JSON.stringify(variant)})`
        );
      } else if (hits.some((m) => m.row === row)) {
        interiorSplitOwnRow++;
      }
    }
  }
}
if (interiorSplitWrongRow === 0) {
  ok(
    `mid-identifier Unicode-split sweep: ${interiorSplitProbes} probes across ${interiorSplitIdentifiers.length} ` +
      `identifiers x ${Object.keys(INTERIOR_SPLIT_CHARS).length} non-token characters — zero resolved to a ` +
      `different row (${interiorSplitOwnRow} correctly recovered their own row via gluing, ` +
      `${interiorSplitProbes - interiorSplitOwnRow} safely missed)`
  );
}

// The rest of the token-character family, enumerated rather than assumed
// safe: TOKEN_CHARS also includes `-` and `_`. Gluing a word onto either
// currently produces a MISS, not a wrong answer -- confirmed here, not
// merely believed -- because both characters are already meaningful *inside*
// most identifiers in this data (nearly every one contains a hyphen), so a
// hyphen- or underscore-glued word reads as part of a different, longer
// token rather than as punctuation abutting the real one; a fix that tried
// to peel off a hyphen-glued suffix the way the dot fix does would be far
// more dangerous, not less, given how load-bearing `-` already is inside
// real identifiers ("gpt-4-turbo" is not "gpt-4" plus a glued "-turbo").
// These assertions exist so a future change to TOKEN_CHARS or to this
// reasoning is caught rather than silently assumed to still hold, and so
// the record can say this family was actually enumerated rather than only
// the period being fixed and everything else left unexamined.
const OTHER_TOKEN_CHAR_GLUE_PROBES = [
  { label: "hyphen glued after", text: "we run gpt-4-0613-ish in staging" },
  { label: "hyphen glued before", text: "our pre-gpt-4-0613-migration branch" },
  { label: "underscore glued after", text: "the gpt-4-0613_legacy flag" },
  { label: "digit glued directly, no punctuation at all", text: "still using gpt-4-06132 somehow" },
  { label: "letter glued directly, no punctuation at all", text: "calling gpt-4-0613next in code" },
];
for (const { label, text } of OTHER_TOKEN_CHAR_GLUE_PROBES) {
  const hits = findMatches(text, RETIREMENT_DATES);
  if (hits.length === 0) {
    ok(`${label} ("${text}") remains a miss, not a wrong answer -- unchanged, not a new gap`);
  } else {
    bad(
      `${label} ("${text}") unexpectedly matched ${hits.map((m) => m.row.what).join(", ")} -- ` +
        "this family's behavior changed and the reasoning above needs re-checking"
    );
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
