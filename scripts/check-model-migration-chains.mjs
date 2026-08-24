#!/usr/bin/env node
// Health check for the migration-chain walker behind /model-migration-chains
// (docket/open/2026-08-22-model-migration-chains.md). Run from the
// repository root:
//
//   node scripts/check-model-migration-chains.mjs
//
// app/lib/model-migration-chains.js follows RETIREMENT_DATES's `replacement`
// field hop by hop, branching where a row names several options
// ("gpt-image-2, gpt-image-1, or gpt-image-1-mini") and flagging every hop
// that dead-ends in another dated row rather than a live model. This is the
// same discipline scripts/check-model-deprecation-parser.mjs already applies
// to the matching logic behind /model-deprecation-checker, in the shape
// docket item requirement 5 asks for: walk every chain in the live data, and
// assert none infinite-loops and every hop resolves to a data row or an
// explicit "not in the data" leaf. Wired into scripts/check-routes.sh.
//
// Proved able to fail before being trusted, two ways:
//   1. A permanent adversarial section below (search "PROVING THE CHECK CAN
//      FAIL") mutates a cloned copy of RETIREMENT_DATES in memory to
//      introduce a real two-row cycle and a malformed "no options parse out"
//      replacement, and asserts the walker reports "cycle" and
//      "no-replacement-named" rather than silently mis-resolving either --
//      this runs on every CI build, so a future regression in cycle
//      detection itself would be caught here even if the real data never
//      cycles.
//   2. A one-time manual proof against the REAL file, done once this round
//      and reverted: app/lib/retirement-dates.js was temporarily edited to
//      make gpt-realtime-mini's replacement point back at
//      gpt-4o-mini-realtime-preview (closing a real two-row loop), this
//      script was run and printed "FAIL ... real-data chain ... entered a
//      cycle" and exited 1, then the edit was reverted and the script was
//      re-run green. See this round's CHANGELOG.md entry for the exact
//      commands; not repeatable here because it requires mutating the
//      checked-in file, which this script must not do as a side effect of
//      merely running.

import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const { RETIREMENT_DATES } = await import(
  pathToFileURL(path.join(root, "app", "lib", "retirement-dates.js")).href
);
const { parseReplacement, walkChain, flattenChain, resolveIdentifier } =
  await import(
    pathToFileURL(path.join(root, "app", "lib", "model-migration-chains.js"))
      .href
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

function findRow(what) {
  return RETIREMENT_DATES.find((row) => row.what === what);
}

// --- The two named parsing cases, by name -----------------------------
//
// docket/open/2026-08-22-model-migration-chains.md requires these two rows
// specifically, not a representative sample: a comma-separated multi-option
// replacement, and a replacement carrying a parenthetical qualifier. Both
// are asserted directly against parseReplacement's output shape, not against
// the walker's final classification -- because for both of these two rows
// specifically, a BROKEN parser and a correct one currently produce the same
// final "live" classification (neither "gpt-5.6-sol" nor the un-parsed
// string "gpt-5.6-sol (reasoning.mode: pro)" is itself a RETIREMENT_DATES
// row today), so testing only the end state would not actually exercise the
// parsing risk the item names. Testing parseReplacement's own return value
// does.

const dallERow = findRow("dall-e-2");
if (!dallERow) {
  bad('RETIREMENT_DATES has no "dall-e-2" row to test the multi-option parse against');
} else {
  const options = parseReplacement(dallERow.replacement);
  const identifiers = options.map((o) => o.identifier);
  if (
    options.length === 3 &&
    identifiers[0] === "gpt-image-2" &&
    identifiers[1] === "gpt-image-1" &&
    identifiers[2] === "gpt-image-1-mini" &&
    options.every((o) => o.qualifier === null)
  ) {
    ok(
      `dall-e-2's replacement ("${dallERow.replacement}") parses into exactly 3 options: ` +
        identifiers.join(", ")
    );
  } else {
    bad(
      `dall-e-2's replacement ("${dallERow.replacement}") should parse into ` +
        `[gpt-image-2, gpt-image-1, gpt-image-1-mini] and instead parsed into ${JSON.stringify(options)}`
    );
  }
}

const dallE3Row = findRow("dall-e-3");
if (!dallE3Row) {
  bad('RETIREMENT_DATES has no "dall-e-3" row (companion to dall-e-2, same multi-option replacement)');
} else if (dallE3Row.replacement !== dallERow?.replacement) {
  bad(
    `dall-e-3's replacement ("${dallE3Row.replacement}") no longer matches dall-e-2's -- ` +
      "the item's evidence treats them as the same multi-option string"
  );
} else {
  ok("dall-e-3 carries the same multi-option replacement string as dall-e-2");
}

const o1ProRow = findRow("o1-pro-2025-03-19 (also o1-pro)");
if (!o1ProRow) {
  bad('RETIREMENT_DATES has no "o1-pro-2025-03-19 (also o1-pro)" row to test the qualifier parse against');
} else {
  const options = parseReplacement(o1ProRow.replacement);
  if (
    options.length === 1 &&
    options[0].identifier === "gpt-5.6-sol" &&
    options[0].qualifier === "reasoning.mode: pro"
  ) {
    ok(
      `o1-pro-2025-03-19's replacement ("${o1ProRow.replacement}") parses into identifier ` +
        `"gpt-5.6-sol" with qualifier "reasoning.mode: pro", not one opaque string`
    );
  } else {
    bad(
      `o1-pro-2025-03-19's replacement ("${o1ProRow.replacement}") should parse into a single ` +
        `{identifier: "gpt-5.6-sol", qualifier: "reasoning.mode: pro"} and instead parsed into ${JSON.stringify(options)}`
    );
  }
}

// A second row shares the same "identifier (qualifier)" shape
// ("gpt-5-pro-2025-10-06" and "o3-pro-2025-06-10" both replace to
// "gpt-5.6-sol (reasoning.mode: pro)") -- checked too, since a fix that only
// special-cased o1-pro's literal string would not generalize.
for (const what of ["gpt-5-pro-2025-10-06", "o3-pro-2025-06-10"]) {
  const row = findRow(what);
  if (!row) {
    bad(`RETIREMENT_DATES has no "${what}" row (expected, shares o1-pro's qualifier shape)`);
    continue;
  }
  const options = parseReplacement(row.replacement);
  if (options.length === 1 && options[0].identifier === "gpt-5.6-sol" && options[0].qualifier === "reasoning.mode: pro") {
    ok(`"${what}"'s replacement parses the same qualifier shape as o1-pro-2025-03-19`);
  } else {
    bad(`"${what}"'s replacement ("${row.replacement}") did not parse to the expected qualifier shape: ${JSON.stringify(options)}`);
  }
}

// --- The documented multi-hop chains, resolved in code -----------------
//
// The docket item's own Evidence section names these exact chains, found by
// "resolving every row's replacement against every other row's what/aliases
// in code, not by eye" after a first hand-traced draft got one wrong. This
// re-derives them here, in code, rather than trusting the item's prose --
// the same discipline the item itself demands of the round that builds it.

function terminalIdentifiers(startId) {
  return flattenChain(walkChain(startId, RETIREMENT_DATES)).map(
    (branch) => branch.terminal
  );
}

function assertSingleChain(startId, expectedHops, expectedStatus) {
  const branches = flattenChain(walkChain(startId, RETIREMENT_DATES));
  if (branches.length !== 1) {
    bad(`"${startId}" should resolve to exactly one branch and resolved to ${branches.length}`);
    return;
  }
  const [{ path: hopPath, terminal }] = branches;
  const identifiers = hopPath.map((n) => n.identifier);
  const expected = [startId, ...expectedHops];
  const matches =
    identifiers.length === expected.length &&
    identifiers.every((id, i) => id === expected[i]);
  if (matches && terminal.status === expectedStatus) {
    ok(`"${startId}" resolves to ${identifiers.join(" -> ")} [${terminal.status}]`);
  } else {
    bad(
      `"${startId}" should resolve to ${expected.join(" -> ")} [${expectedStatus}] and instead resolved to ` +
        `${identifiers.join(" -> ")} [${terminal.status}]`
    );
  }
}

assertSingleChain(
  "gpt-4o-mini-realtime-preview",
  ["gpt-realtime-mini", "gpt-realtime-2.1-mini"],
  "live"
);
assertSingleChain(
  "gpt-4o-mini-audio-preview",
  ["gpt-audio-mini", "gpt-audio-1.5"],
  "live"
);

// The dall-e-2 three-branch chain: gpt-image-2 lands clean directly;
// gpt-image-1 and gpt-image-1-mini are each themselves a dated row that
// dead-ends into another retirement before landing on the same
// gpt-image-2 -- requirement 2 ("every hop whose landing point is itself a
// RETIREMENT_DATES row is flagged... showing that row's own shutdown date
// and replacement, not just the first hop").
{
  const branches = flattenChain(walkChain("dall-e-2", RETIREMENT_DATES));
  const byOption = new Map(
    branches.map((b) => [b.path[1]?.identifier, b])
  );
  const cleanBranch = byOption.get("gpt-image-2");
  const gptImage1Branch = byOption.get("gpt-image-1");
  const gptImage1MiniBranch = byOption.get("gpt-image-1-mini");

  if (branches.length === 3) {
    ok("dall-e-2 resolves to exactly 3 branches, one per parsed option");
  } else {
    bad(`dall-e-2 should resolve to 3 branches (one per option) and resolved to ${branches.length}`);
  }

  if (cleanBranch && cleanBranch.path.length === 2 && cleanBranch.terminal.status === "live") {
    ok("dall-e-2's gpt-image-2 option lands clean in one hop (absent from the data)");
  } else {
    bad(`dall-e-2's gpt-image-2 option should land clean in one hop and did not: ${JSON.stringify(cleanBranch)}`);
  }

  for (const [label, branch] of [
    ["gpt-image-1", gptImage1Branch],
    ["gpt-image-1-mini", gptImage1MiniBranch],
  ]) {
    if (!branch) {
      bad(`dall-e-2 should have a branch through "${label}" and did not`);
      continue;
    }
    const midNode = branch.path[1];
    if (
      branch.path.length === 3 &&
      midNode.status === "retiring" &&
      midNode.row?.what === (label === "gpt-image-1" ? "gpt-image-1" : "gpt-image-1-mini") &&
      typeof midNode.row?.shutdown === "string" &&
      branch.path[2].identifier === "gpt-image-2" &&
      branch.terminal.status === "live"
    ) {
      ok(
        `dall-e-2's ${label} option dead-ends in another retirement ` +
          `(shutdown ${midNode.row.shutdown}, replacement "${midNode.row.replacement}") before landing on gpt-image-2`
      );
    } else {
      bad(`dall-e-2's ${label} option should dead-end into its own dated row before landing on gpt-image-2: ${JSON.stringify(branch)}`);
    }
  }
}

// gpt-4-turbo's own bug, named in the item: a first hand-traced draft of
// this evidence mistook the alias in gpt-4-turbo's own `what` string for a
// second hop, when its actual `replacement` field names gpt-5.6-sol
// directly. Asserted here so that specific mistake cannot silently return.
assertSingleChain("gpt-4-turbo", ["gpt-5.6-sol"], "live");

// --- Every chain in the live data, walked and bounded -------------------
//
// Requirement 5: walk every chain in RETIREMENT_DATES and assert none
// infinite-loops and every hop resolves to a data row or an explicit "not
// in the data" leaf. Every row's primary identifier AND every one of its
// parenthetical aliases are walked (an alias is an equally valid thing a
// visitor might type in), not just the primary form.
let chainsWalked = 0;
let maxDepthSeen = 0;
const depthCeiling = RETIREMENT_DATES.length + 2;
let realDataCycles = 0;

for (const row of RETIREMENT_DATES) {
  const aliasMatch = row.what.match(/^(.*?)\s*\(also\s+([^)]+)\)\s*$/);
  const primary = aliasMatch ? aliasMatch[1].trim() : row.what;
  const aliases = aliasMatch
    ? aliasMatch[2].split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  for (const id of [primary, ...aliases]) {
    chainsWalked++;
    const branches = flattenChain(walkChain(id, RETIREMENT_DATES));
    for (const branch of branches) {
      maxDepthSeen = Math.max(maxDepthSeen, branch.path.length);
      if (branch.path.length > depthCeiling) {
        bad(
          `"${id}" produced a branch ${branch.path.length} hops deep, past the ` +
            `${depthCeiling}-hop ceiling (${RETIREMENT_DATES.length} rows + 2) -- ` +
            "walking is not terminating the way it should"
        );
      }
      if (branch.terminal.status === "cycle") {
        realDataCycles++;
        bad(
          `"${id}" -> ${branch.path.map((n) => n.identifier).join(" -> ")} entered a cycle in the ` +
            "REAL, live RETIREMENT_DATES data -- a reader following this chain would never reach a landing point"
        );
      }
      if (!["live", "no-replacement-named", "cycle"].includes(branch.terminal.status)) {
        bad(`"${id}" produced an unrecognized terminal status "${branch.terminal.status}"`);
      }
    }
  }
}
if (realDataCycles === 0) {
  ok(`walked ${chainsWalked} identifier(s) (every row's primary and every alias) across ${RETIREMENT_DATES.length} rows: zero cycles, max branch depth ${maxDepthSeen} hops (ceiling ${depthCeiling})`);
}

// Every chain that dead-ends in another retirement must expose that row's
// OWN shutdown date and replacement (not just the first hop), and every
// clean landing must be genuinely absent from the data -- resolveIdentifier
// used here as a second, independent way of checking "absent from the data"
// (via the exported single-identifier lookup) so this does not just retest
// walkChain against itself.
let deadEndsChecked = 0;
let cleanLandingsChecked = 0;
for (const row of RETIREMENT_DATES) {
  const branches = flattenChain(walkChain(row.what.replace(/\s*\(also.*\)$/, ""), RETIREMENT_DATES));
  for (const branch of branches) {
    for (const node of branch.path.slice(1, -1)) {
      // Every interior node the walk passed through (excluding the start and
      // the terminal) is itself a "retiring" node by construction -- it had
      // to resolve to a row to produce a further hop at all.
      deadEndsChecked++;
      if (!node.row?.shutdown || !("replacement" in node.row)) {
        bad(`interior hop "${node.identifier}" is missing its own shutdown/replacement fields`);
      }
    }
    if (branch.terminal.status === "live") {
      cleanLandingsChecked++;
      if (resolveIdentifier(branch.terminal.identifier, RETIREMENT_DATES)) {
        bad(`"${branch.terminal.identifier}" was classified "live" but resolveIdentifier found a row for it`);
      }
    }
  }
}
ok(`${deadEndsChecked} interior "dead-ends in another retirement" hop(s) all carry their own shutdown date and replacement`);
ok(`${cleanLandingsChecked} clean landing(s) independently confirmed absent from the data via resolveIdentifier`);

// --- PROVING THE CHECK CAN FAIL -----------------------------------------
//
// docket item requirement 5: "proved able to fail before it is trusted".
// This section mutates a CLONED copy of RETIREMENT_DATES -- never the
// imported array itself -- to construct exactly the two failure shapes the
// item names (a cycle, an unresolvable/malformed hop) and asserts the
// walker reports them correctly. This is what makes the "zero cycles" claim
// above meaningful: it demonstrates the mechanism that claim depends on
// actually detects a cycle when one exists, rather than always reporting
// "live" by accident.

function cloneRows() {
  return RETIREMENT_DATES.map((row) => ({ ...row }));
}

// Shape 1: a real two-row cycle. Two synthetic rows, each naming the other
// as its sole replacement -- a reader following either one would loop
// forever without this check's cycle detection.
{
  const mutated = cloneRows();
  mutated.push(
    { vendor: "Test", what: "fixture-cycle-a", shutdown: "2099-01-01", replacement: "fixture-cycle-b", href: "https://example.invalid", verified: "2099-01-01" },
    { vendor: "Test", what: "fixture-cycle-b", shutdown: "2099-01-01", replacement: "fixture-cycle-a", href: "https://example.invalid", verified: "2099-01-01" }
  );
  const branches = flattenChain(walkChain("fixture-cycle-a", mutated));
  if (branches.length === 1 && branches[0].terminal.status === "cycle") {
    ok('planted a real cycle (fixture-cycle-a -> fixture-cycle-b -> fixture-cycle-a) and the walker correctly reported "cycle" -- the check CAN fail, and detects it when it does');
  } else {
    bad(`planted a cycle and the walker did NOT report "cycle" -- got ${JSON.stringify(branches)}. Cycle detection cannot be trusted.`);
  }
}

// Shape 2: an "unresolvable" hop -- a replacement string that parses to zero
// options (all punctuation, no identifier text at all). Must land on the
// explicit "no-replacement-named" leaf, never silently report "live" (which
// would wrongly tell a reader this model has no successor to worry about
// when the truth is "the data names something this parser could not read").
{
  const mutated = cloneRows();
  mutated.push({
    vendor: "Test",
    what: "fixture-malformed-replacement",
    shutdown: "2099-01-01",
    replacement: " , , or ,  ",
    href: "https://example.invalid",
    verified: "2099-01-01",
  });
  const branches = flattenChain(walkChain("fixture-malformed-replacement", mutated));
  if (branches.length === 1 && branches[0].terminal.status === "no-replacement-named") {
    ok('planted a malformed, unparseable replacement string and the walker correctly reported "no-replacement-named", not "live"');
  } else {
    bad(`planted a malformed replacement and got ${JSON.stringify(branches)} -- should be a single "no-replacement-named" branch`);
  }
}

// Shape 3: a row's chain that dead-ends into a genuinely absent identifier
// must NOT be reported as a dead-end -- the inverse check, proving the "no
// cycles" and "dead-ends flagged" assertions above are not vacuously true
// because everything happens to report the same status regardless of input.
{
  const mutated = cloneRows();
  mutated.push({
    vendor: "Test",
    what: "fixture-clean-landing",
    shutdown: "2099-01-01",
    replacement: "fixture-nowhere-in-the-data",
    href: "https://example.invalid",
    verified: "2099-01-01",
  });
  const branches = flattenChain(walkChain("fixture-clean-landing", mutated));
  if (branches.length === 1 && branches[0].terminal.status === "live" && branches[0].path.length === 2) {
    ok('a fixture row replacing to an identifier absent from the (mutated) data correctly lands "live" in one hop -- the walker distinguishes this from the cycle and malformed cases above, not a blanket verdict');
  } else {
    bad(`fixture-clean-landing should land "live" in one hop and got ${JSON.stringify(branches)}`);
  }
}

console.log();
if (failures > 0) {
  console.log(`${failures} of ${checks} check(s) failed`);
  process.exit(1);
}
console.log(
  `all ${checks} checks passed -- the migration-chain walker resolves both named parsing cases correctly, ` +
    `reproduces the item's documented chains, terminates on every one of ${chainsWalked} identifiers walked ` +
    `across the live ${RETIREMENT_DATES.length}-row data with zero cycles, and was proved able to report a ` +
    "cycle, a malformed hop, and a clean landing correctly on planted fixtures"
);
