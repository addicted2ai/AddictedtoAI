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

console.log("--- closedGenerativeCount: counts only the configured serves value, on a visitor-facing track ---");
{
  // All on `build` (visitor-facing) here on purpose, to isolate this test's
  // point (filtering by `serves`) from the track filter, which has its own
  // dedicated regression test below (docket/reviews/8d0098e...).
  const doneItems = [
    { track: "build", serves: "worth-a-visit" },
    { track: "build", serves: "more-checkable" },
    { track: "build", serves: "worth-a-visit" },
    { track: "build", serves: "floor" },
    { track: "build" }, // an item with no serves field at all must not throw or miscount
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

// --- regression: a non-visitor-facing track's worth-a-visit item must move nothing ---
//
// docket/reviews/8d0098e624837a93b15fdb743b32dfcd161e2ff1.md: the version of
// generativeShare/closedGenerativeCount that only filtered by `track ===
// track` (not by VISITOR_FACING) let a hand-placed `track: meta, serves:
// worth-a-visit` item -- filed straight into docket/open/, bypassing
// scripts/check-docket.mjs entirely -- move meta's share to 0.05 and its
// applied multiplier to 1.09 against the real repository's queue. The claim
// that check-docket.mjs alone made meta's exposure "structurally 0" was
// false: the filing gate is a required CI check, but this repository has
// documented (docket/open/2026-08-11-branch-protection-does-not-require-review.md)
// that `enforce_admins` is false on `main` and the account this loop merges
// as can merge past a red required check, so a gate-only guarantee is not
// unconditional. This test reproduces the exact shape of the counter-example
// with crafted data (no live docket file needed) and must hold regardless of
// what filed the item or how it got past the gate -- track alone decides,
// nothing else.

console.log("\n--- regression: a worth-a-visit item under a non-visitor-facing track moves nothing (docket/reviews/8d0098e...) ---");
{
  // Mirrors the reviewer's live counter-example: a meta item sitting among
  // other ready meta work, most of which is ordinary (non-generative) meta
  // work, the way a real bypassed item would arrive in a real queue.
  const readyWithBypass = [
    { track: "meta", serves: "worth-a-visit" }, // the bypass item itself
    { track: "meta", serves: "more-checkable" },
    { track: "meta", serves: "more-checkable" },
    { track: "build", serves: "worth-a-visit" }, // a legitimate item on a different track must be unaffected
  ];

  const metaShare = generativeShare(PUSH, readyWithBypass, "meta");
  if (metaShare === 0) {
    ok(`a meta item carrying worth-a-visit contributes 0 to meta's own share (got ${metaShare}), not the 1-of-3 = 0.33 the unfiltered arithmetic would compute`);
  } else {
    bad(`meta's share moved to ${metaShare} -- the non-visitor-facing filter regressed`);
  }

  const metaApplied = pushApplied(3.0, metaShare);
  if (metaApplied === 1) {
    ok(`meta's applied multiplier stays 1 (got ${metaApplied}) even with a bypassed worth-a-visit item present`);
  } else {
    bad(`meta's applied multiplier moved to ${metaApplied} -- expected 1`);
  }

  const buildShare = generativeShare(PUSH, readyWithBypass, "build");
  if (buildShare === 1) {
    ok(`build's own legitimate worth-a-visit item is unaffected by meta's bypass item -> share ${buildShare}`);
  } else {
    bad(`build's share was ${buildShare}, expected 1 -- the filter over-blocked a legitimate track`);
  }

  // The same shape, for closedGenerativeCount: a bypassed meta item in
  // docket/done/ must not decay the multiplier meta itself can never earn.
  const doneWithBypass = [
    { track: "meta", serves: "worth-a-visit" }, // the bypass item, now closed
    { track: "build", serves: "worth-a-visit" }, // a legitimate closed item
    { track: "build", serves: "more-true" },
  ];
  const closedCount = closedGenerativeCount(PUSH, doneWithBypass);
  if (closedCount === 1) {
    ok(`closedGenerativeCount counts only the build item (1), not the bypassed meta one too (got ${closedCount})`);
  } else {
    bad(`closedGenerativeCount was ${closedCount}, expected 1 -- a non-visitor-facing closed item was counted`);
  }
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
