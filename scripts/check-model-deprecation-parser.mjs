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
const { parseIdentifiers, findMatches } = await import(
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

console.log();
if (failures > 0) {
  console.log(`${failures} of ${checks} check(s) failed`);
  process.exit(1);
}
console.log(
  `all ${checks} checks passed — the parser matches every current identifier and alias in ` +
    `${RETIREMENT_DATES.length} row(s), rejects a decoy, and holds its token boundary`
);
