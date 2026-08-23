#!/usr/bin/env node
// Verifies scripts/runners.yml's excluded_model_patterns against the LIVE
// catalogue, not against the naming conventions this repository already
// knows about. Run from the repository root:
//
//   node scripts/check-free-model-exclusion.mjs
//
// WHY THIS EXISTS. Adversarial review (round loop/meta/runner-config) found
// this pattern's first version, `-free$`, missed every `:free`-suffixed
// model on `openrouter` (16 of them, one reproduced live:
// `nvidia/nemotron-3-super-120b-a12b:free`) and one bare `openrouter/free`
// -- 17 of 23 reachable "free"-named models on this account's connected
// providers were never excluded, while scripts/runners.yml's own comment
// called the exclusion "absolute". The pattern is broadened
// (see scripts/runners.yml's own header for the full account and for the
// residue this cannot close: a free-tier model named without the word
// "free" at all would still pass). This script is what turns "we checked
// once" into an ongoing, re-derived guarantee: every reachable model on
// every connected provider is asked directly whether its own id contains
// "free" as a word, and the current exclusion pattern is checked against
// every one of them -- not against a list either was written to satisfy.
//
// Same PASS / FAIL / UNVERIFIED convention FRAME.md's own checks use, for
// the same reason: no local OpenCode server means this genuinely cannot be
// evaluated, and reporting a silent PASS in that case would be the exact
// "true attested fact beside a checkable one, collapsed into a false
// sentence" shape FRAME.md fact 12 exists to keep separate. Read-only GET
// http://127.0.0.1:4097/provider only -- no session, no model call, no
// spend.

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const SERVER = process.env.ORCHESTRATE_SERVER || "http://127.0.0.1:4097";
// Word-boundary "free", case-insensitive: what a reachable model's id is
// checked against to decide whether it OUGHT to be excluded. Deliberately
// the same shape as the fix in scripts/runners.yml -- not imported from
// there, because this script's whole job is asking independently whether
// the current exclusion pattern(s) in that file actually cover this, not
// assuming they do.
const OUGHT_TO_BE_EXCLUDED = /(^|[^a-z0-9])free([^a-z0-9]|$)/i;

let runners;
try {
  runners = parseYaml(fs.readFileSync(path.join(root, "scripts", "runners.yml"), "utf8"));
} catch (error) {
  console.log(`FAIL could not read or parse scripts/runners.yml: ${error.message}`);
  process.exit(1);
}

const patterns = runners.excluded_model_patterns || [];
if (patterns.length === 0) {
  console.log("FAIL scripts/runners.yml declares no excluded_model_patterns to check");
  process.exit(1);
}

function isCurrentlyExcluded(modelId) {
  return patterns.some((rule) => new RegExp(rule.pattern, rule.flags || "").test(modelId));
}

let data;
try {
  const res = await fetch(`${SERVER}/provider`, { signal: AbortSignal.timeout(4000) });
  const ctype = res.headers.get("content-type") || "";
  if (!res.ok || !ctype.includes("application/json")) throw new Error("non-JSON or non-2xx response");
  data = await res.json();
} catch {
  console.log(`UNVERIFIED ${SERVER}/provider unreachable -- cannot check the live catalogue`);
  process.exit(0);
}

const connected = new Set(Array.isArray(data.connected) ? data.connected : []);
const providers = Array.isArray(data.all) ? data.all : [];

let reachableCount = 0;
let namedFreeCount = 0;
const missed = [];
for (const p of providers) {
  if (!connected.has(p.id)) continue; // only providers this preflight could actually select
  for (const modelId of Object.keys(p.models || {})) {
    reachableCount++;
    if (!OUGHT_TO_BE_EXCLUDED.test(modelId)) continue;
    namedFreeCount++;
    if (!isCurrentlyExcluded(modelId)) missed.push(`${p.id}/${modelId}`);
  }
}

console.log(
  `checked ${reachableCount} reachable model(s) across ${connected.size} connected provider(s); ${namedFreeCount} carry "free" as a word in their id`
);

if (missed.length > 0) {
  console.log(`FAIL ${missed.length} "free"-named reachable model(s) are NOT excluded by scripts/runners.yml's current pattern(s):`);
  for (const m of missed) console.log(`  ${m}`);
  process.exit(1);
}

console.log("PASS every reachable, name-flagged-free model is excluded by the current pattern(s)");
