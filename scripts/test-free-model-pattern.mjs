#!/usr/bin/env node
// Regression guard for the exact gap adversarial review found in round
// loop/meta/runner-config: scripts/runners.yml's excluded_model_patterns
// used to be `-free$`, which missed `:free` and `/free`-suffixed models
// entirely (17 of 23 reachable "free"-named models on the live catalogue at
// the time, including the reviewer's own live reproduction,
// `openai/gpt-oss-20b:free`). This tests the REAL pattern data in the
// committed scripts/runners.yml -- not a synthetic fixture -- against a
// fixed table of known conventions plus a false-positive guard, so a future
// narrowing of the pattern (accidental or "simplifying") fails here without
// needing a live OpenCode server. scripts/check-free-model-exclusion.mjs is
// the live counterpart: it re-derives the exclusion set from the actual
// catalogue every time one is reachable, rather than trusting this fixed
// table to stay exhaustive.
//
//   node scripts/test-free-model-pattern.mjs

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

const root = process.cwd();
const runners = parseYaml(fs.readFileSync(path.join(root, "scripts", "runners.yml"), "utf8"));
const patterns = runners.excluded_model_patterns || [];

function isExcluded(modelId) {
  return patterns.some((rule) => new RegExp(rule.pattern, rule.flags || "").test(modelId));
}

if (patterns.length === 0) {
  bad("scripts/runners.yml declares no excluded_model_patterns to test");
} else {
  ok(`scripts/runners.yml declares ${patterns.length} excluded_model_patterns rule(s)`);
}

// Every real convention found live this round, plus the reviewer's own
// reproduction by name.
const MUST_EXCLUDE = [
  "deepseek-v4-flash-free", // the original -free$ case -- must still work
  "nvidia/nemotron-3-super-120b-a12b:free", // colon suffix, openrouter
  "openai/gpt-oss-20b:free", // the reviewer's own live reproduction
  "openrouter/free", // bare slash-suffixed id
  "free", // the word alone, as an id
  "FREE-tier-model", // case-insensitivity
];
for (const id of MUST_EXCLUDE) {
  if (isExcluded(id)) {
    ok(`'${id}' is excluded`);
  } else {
    bad(`'${id}' is NOT excluded -- this is the exact class of gap adversarial review found`);
  }
}

// Word-boundary, not substring: a model whose name merely contains "free"
// glued to other letters is a different word and must not be excluded by
// accident -- an exclusion this broad would be its own kind of false claim.
const MUST_NOT_EXCLUDE = [
  "deepseek-v4-flash",
  "freeform-assistant",
  "wildfreedom-7b",
];
for (const id of MUST_NOT_EXCLUDE) {
  if (!isExcluded(id)) {
    ok(`'${id}' is not excluded (word-boundary correctly ignores it)`);
  } else {
    bad(`'${id}' was wrongly excluded -- the pattern is matching a substring, not the word "free"`);
  }
}

console.log(failures === 0 ? "all free-model-pattern checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
