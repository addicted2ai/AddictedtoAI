#!/usr/bin/env node
// scripts/generative-push.mjs -- the decaying weight boost for
// `serves: worth-a-visit` docket items (CHARTER.md test 1), which
// scripts/dispatch.mjs applies to a track's effective weight. Exercised as
// pure functions with crafted `policy.yml`-shaped objects and docket
// frontmatter, rather than by spawning `dispatch.mjs` itself: dispatch.mjs
// also shells out to scripts/preflight.mjs and dynamically imports
// app/lib/posts.js, both resolved against the real repository, so a
// sandboxed policy.yml the way scripts/test-peak-window.mjs uses for
// peak-window.mjs cannot isolate it. Importing the same module dispatch.mjs
// imports means this test and the running loop can never drift into two
// copies of the formula.
//
//   node scripts/test-dispatch-generative-push.mjs

import {
  closedGenerativeCount,
  pushMultiplier,
  generativeShare,
  pushApplied,
} from "./generative-push.mjs";

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

const PUSH = { serves: "worth-a-visit", start_multiplier: 3.0, floor_multiplier: 1.0, decay_per_shipped: 0.25 };

// --- closedGenerativeCount ---------------------------------------------------

console.log("--- closedGenerativeCount: counts only the configured serves value ---");
{
  const doneItems = [
    { serves: "worth-a-visit" },
    { serves: "more-checkable" },
    { serves: "worth-a-visit" },
    { serves: "floor" },
    {}, // an item with no serves field at all must not throw or miscount
  ];
  const n = closedGenerativeCount(PUSH, doneItems);
  if (n === 2) ok(`2 of 5 done items counted (worth-a-visit only), got ${n}`);
  else bad(`expected 2, got ${n}`);
}

console.log("\n--- closedGenerativeCount: no generative_push configured -> 0, not a throw ---");
{
  const n = closedGenerativeCount(undefined, [{ serves: "worth-a-visit" }]);
  if (n === 0) ok("undefined push config counts 0");
  else bad(`expected 0, got ${n}`);
}

// --- pushMultiplier boundaries ------------------------------------------------

console.log("\n--- pushMultiplier: zero shipped -> the start multiplier, unclamped ---");
{
  const m = pushMultiplier(PUSH, 0);
  if (m === 3.0) ok(`0 closed -> M = ${m} (== start_multiplier)`);
  else bad(`expected 3.0, got ${m}`);
}

console.log("\n--- pushMultiplier: mid-decay, an ordinary count between start and floor ---");
{
  // 3.0 - 0.25*4 = 2.0, still above the 1.0 floor -- the unclamped branch.
  const m = pushMultiplier(PUSH, 4);
  if (m === 2.0) ok(`4 closed -> M = ${m} (3.0 - 0.25*4)`);
  else bad(`expected 2.0, got ${m}`);
}

console.log("\n--- pushMultiplier: the exact count where decay lands precisely on the floor ---");
{
  // 3.0 - 0.25*8 = 1.0, exactly the floor -- boundary, not below it.
  const m = pushMultiplier(PUSH, 8);
  if (m === 1.0) ok(`8 closed -> M = ${m} (lands exactly on floor_multiplier)`);
  else bad(`expected 1.0, got ${m}`);
}

console.log("\n--- pushMultiplier: a count high enough that the unclamped value goes below the floor ---");
{
  // 3.0 - 0.25*20 = -2.0 unclamped; max(floor, raw) must still return 1.0,
  // not the negative value the raw formula would otherwise produce.
  const m = pushMultiplier(PUSH, 20);
  if (m === 1.0) ok(`20 closed -> M = ${m} (raw would be -2.0; clamped to floor_multiplier)`);
  else bad(`expected 1.0 (clamped), got ${m}`);
}

console.log("\n--- pushMultiplier: missing or malformed generative_push -> neutral (1), not a throw ---");
{
  const cases = [
    ["undefined config", undefined],
    ["null config", null],
    ["missing start_multiplier", { floor_multiplier: 1.0, decay_per_shipped: 0.25 }],
    ["non-numeric floor_multiplier", { start_multiplier: 3.0, floor_multiplier: "1.0", decay_per_shipped: 0.25 }],
  ];
  for (const [label, cfg] of cases) {
    const m = pushMultiplier(cfg, 5);
    if (m === 1) ok(`${label} -> M = 1 (neutral)`);
    else bad(`${label}: expected 1, got ${m}`);
  }
}

// --- generativeShare boundaries -----------------------------------------------

console.log("\n--- generativeShare: zero generative stock on the track -> 0, no boost can fire ---");
{
  const ready = [
    { track: "build", serves: "more-checkable" },
    { track: "build", serves: "more-true" },
    { track: "author", serves: "worth-a-visit" }, // a different track's generative item must not leak in
  ];
  const share = generativeShare(PUSH, ready, "build");
  if (share === 0) ok(`build track has 2 ready items, none worth-a-visit -> share ${share}`);
  else bad(`expected 0, got ${share}`);
}

console.log("\n--- generativeShare: a track with no ready items at all -> 0, not a divide-by-zero ---");
{
  const share = generativeShare(PUSH, [{ track: "author", serves: "worth-a-visit" }], "build");
  if (share === 0 && Number.isFinite(share)) ok(`empty track -> share ${share} (finite, not NaN)`);
  else bad(`expected finite 0, got ${share}`);
}

console.log("\n--- generativeShare: partial and full share ---");
{
  const half = generativeShare(
    PUSH,
    [
      { track: "build", serves: "worth-a-visit" },
      { track: "build", serves: "more-checkable" },
    ],
    "build"
  );
  if (half === 0.5) ok(`1 of 2 ready build items worth-a-visit -> share ${half}`);
  else bad(`expected 0.5, got ${half}`);

  const full = generativeShare(PUSH, [{ track: "build", serves: "worth-a-visit" }], "build");
  if (full === 1) ok(`1 of 1 ready build items worth-a-visit -> share ${full}`);
  else bad(`expected 1, got ${full}`);
}

// --- pushApplied: the composition, at the boundaries that matter -------------

console.log("\n--- pushApplied: share 0 means no boost regardless of how high M is ---");
{
  const applied = pushApplied(3.0, 0);
  if (applied === 1) ok(`M=3.0, share=0 -> applied ${applied} (the "boost cannot fire" guarantee)`);
  else bad(`expected 1, got ${applied}`);
}

console.log("\n--- pushApplied: share 1 means the full multiplier applies ---");
{
  const applied = pushApplied(3.0, 1);
  if (applied === 3.0) ok(`M=3.0, share=1 -> applied ${applied}`);
  else bad(`expected 3.0, got ${applied}`);
}

console.log("\n--- pushApplied: at the floor, applied is always 1 regardless of share ---");
{
  const applied = pushApplied(1.0, 0.5);
  if (applied === 1) ok(`M=1.0 (floor), share=0.5 -> applied ${applied} (floor means no push left)`);
  else bad(`expected 1, got ${applied}`);
}

console.log("\n--- pushApplied: partial share interpolates linearly between 1 and M ---");
{
  const applied = pushApplied(3.0, 0.5);
  if (applied === 2.0) ok(`M=3.0, share=0.5 -> applied ${applied} (1 + (3.0-1)*0.5)`);
  else bad(`expected 2.0, got ${applied}`);
}

// --- end-to-end: policy.yml's real numbers, read once for a sanity check -----
//
// Not a re-test of the arithmetic above -- confirms the real repository's
// policy.yml round-trips through these functions without needing separate
// hand-maintained expectations for its exact numbers, so a future retune of
// start_multiplier/floor_multiplier/decay_per_shipped cannot silently stop
// being exercised by anything.

console.log("\n--- the real policy.yml's generative_push block parses and computes ---");
{
  const fs = await import("fs");
  const { load: parseYaml } = await import("js-yaml");
  const policy = parseYaml(fs.readFileSync("policy.yml", "utf8"));
  const push = policy.generative_push;
  if (!push || push.serves !== "worth-a-visit") {
    bad(`policy.yml generative_push is missing or its serves value changed: ${JSON.stringify(push)}`);
  } else {
    const m = pushMultiplier(push, 0);
    const expected = push.start_multiplier;
    if (m === expected) {
      ok(`policy.yml: 0 shipped -> M = ${m} (start_multiplier), floor ${push.floor_multiplier}, decay ${push.decay_per_shipped}/shipped`);
    } else {
      bad(`policy.yml round-trip: expected M = ${expected} at 0 shipped, got ${m}`);
    }
  }
}

console.log();
console.log(failures === 0 ? "all generative-push checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
