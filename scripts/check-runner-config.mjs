#!/usr/bin/env node
// Reconciles policy.yml's deepseek_peak_pricing block against runners.yml,
// the single source of truth round loop/meta/runner-config established for
// harness/provider/model/variant. Run from the repository root:
//
//   node scripts/check-runner-config.mjs
//
// Before that round, scripts/orchestrate.sh's MODEL="opencode-go/deepseek-v4-flash"
// and policy.yml's deepseek_peak_pricing.model were two independently typed
// copies of the same string, with nothing keeping them in sync. Removing
// policy.yml's copy outright was considered and rejected: nothing reads
// deepseek_peak_pricing.model programmatically (scripts/peak-window.mjs
// only ever reads .windows and .rate_per_1m_usd -- grep '\.model'
// scripts/peak-window.mjs matches nothing), so the field was documentation,
// not wiring, and deleting a human-readable label from a block a reader
// will actually open is a worse trade than checking it. So policy.yml now
// names a `runner:` key into runners.yml instead of restating a model
// string, and this script is what actually keeps the two in sync: it fails
// if the referenced runner does not exist, and it fails if that runner's
// harness is not the one this pricing block was written for (opencode) --
// a future round repointing runners.yml's default runner at a different
// harness without updating this reference now fails a build instead of
// silently mispricing.

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

let policy;
try {
  policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
} catch (error) {
  bad(`could not read or parse policy.yml: ${error.message}`);
  process.exit(1);
}

let runners;
try {
  runners = parseYaml(fs.readFileSync(path.join(root, "runners.yml"), "utf8"));
} catch (error) {
  bad(`could not read or parse runners.yml: ${error.message}`);
  process.exit(1);
}

const pricing = policy.deepseek_peak_pricing;
if (!pricing) {
  bad("policy.yml has no deepseek_peak_pricing block to reconcile");
} else if (typeof pricing.runner !== "string" || !pricing.runner) {
  bad(
    "policy.yml's deepseek_peak_pricing has no runner: field naming a runners.yml entry -- this is the field that replaced the old hardcoded model: string"
  );
} else {
  const runnerId = pricing.runner;
  const runner = runners.runners && runners.runners[runnerId];
  if (!runner) {
    bad(
      `policy.yml's deepseek_peak_pricing.runner ('${runnerId}') is not a key under runners: in runners.yml -- the pricing block now points nowhere`
    );
  } else if (runner.harness !== "opencode") {
    bad(
      `policy.yml's deepseek_peak_pricing.runner ('${runnerId}') now names a '${runner.harness}' harness runner, but this pricing block documents OpenCode Go's peak/off-peak windows -- either the reference is stale or the pricing prose needs to move`
    );
  } else {
    ok(
      `policy.yml's deepseek_peak_pricing applies to runners.yml's '${runnerId}' (${runner.provider}/${runner.model}, variant ${runner.variant})`
    );
  }
}

if (failures > 0) {
  console.log(`\n${failures} runner-config reconciliation problem(s)`);
  process.exit(1);
}
console.log("\nok    policy.yml and runners.yml agree on which runner the peak-pricing block prices");
