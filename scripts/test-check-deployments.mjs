#!/usr/bin/env node
// The deployment signal's verdict, fed records the GitHub API actually
// produced. The fixtures are real: every sha, timestamp and state below was
// retrieved from the deployments API this run, so the test is the mechanism
// pointed at the 15 August failure records — the proof the docket item asks
// for, without breaking a deployment on purpose. The live API direction is
// exercised by scripts/check-deployments.mjs itself; this test holds the
// verdict logic to both directions on records that cannot change.

import { verdict } from "./check-deployments.mjs";

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

const NOW = Math.floor(Date.now() / 1000);

const FROZEN_1 = { id: 5923762803, sha: "d709a7b97f3b3ff5a6abde959793ded14174f61c", created_at: "2026-08-15T19:14:03Z" };
const FROZEN_2 = { id: 5927115875, sha: "19cb78d7e515dca690e839b951ed63b30b7eb8d5", created_at: "2026-08-16T03:14:36Z" };
const OK_1 = { id: 5918079876, sha: "f6bbe6910cc192f20f2ae4d916840f68d214e9fd", created_at: "2026-08-15T06:54:51Z" };
const OK_2 = { id: 5923430852, sha: "6ec241d8489d0313a12fb8ff195081dfdc8befb1", created_at: "2026-08-15T18:33:35Z" };

// The failures the signal must see.
const red = verdict(FROZEN_1, { state: "failure", created_at: "2026-08-15T19:14:03Z" }, NOW);
if (!red.ok && red.state === "failure") {
  ok(`15 August window-2 failure detected (${red.state})`);
} else {
  bad(`15 August window-2 failure not detected: ${JSON.stringify(red)}`);
}

const current = verdict(FROZEN_2, { state: "failure", created_at: "2026-08-16T03:14:36Z" }, NOW);
if (!current.ok && current.state === "failure") {
  ok(`current failure detected (${current.state})`);
} else {
  bad(`current failure not detected: ${JSON.stringify(current)}`);
}

// The successes the signal must let through.
for (const [name, deployment] of [["window-1 success", OK_1], ["window-2 success", OK_2]]) {
  const v = verdict(deployment, { state: "success", created_at: deployment.created_at }, NOW);
  if (v.ok && v.state === "success") {
    ok(`${name} passes (state ${v.state})`);
  } else {
    bad(`${name} did not pass: ${JSON.stringify(v)}`);
  }
}

// An in-flight deploy is not a failure while young, and a hung one is.
const fresh = verdict(OK_2, { state: "in_progress", created_at: new Date((NOW - 60) * 1000).toISOString() }, NOW);
if (fresh.ok && fresh.state === "in_progress") {
  ok(`young in-flight deploy passes (grace window)`);
} else {
  bad(`young in-flight deploy failed: ${JSON.stringify(fresh)}`);
}

const stuck = verdict(OK_2, { state: "in_progress", created_at: new Date((NOW - 2 * 60 * 60) * 1000).toISOString() }, NOW);
if (!stuck.ok && stuck.state === "in_progress") {
  ok(`deploy hung 2h past the grace window fails`);
} else {
  bad(`deploy hung 2h did not fail: ${JSON.stringify(stuck)}`);
}

// Fail closed: nothing recorded, or a deployment with no status.
const none = verdict(null, null, NOW);
if (!none.ok && none.state === null) {
  ok(`no production deployment recorded fails closed`);
} else {
  bad(`no production deployment recorded did not fail: ${JSON.stringify(none)}`);
}

const noStatus = verdict(OK_2, null, NOW);
if (!noStatus.ok && noStatus.state === null) {
  ok(`deployment with no recorded status fails closed`);
} else {
  bad(`deployment with no recorded status did not fail: ${JSON.stringify(noStatus)}`);
}

console.log(failures === 0 ? "all deployment-verdict checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
