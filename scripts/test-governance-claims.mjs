#!/usr/bin/env node
// Proof that scripts/check-governance-claims.mjs can actually go red.
// Run from the repository root:
//
//   node scripts/test-governance-claims.mjs
//
// WHY. `prompts/shared/every-run.md`: "If you add an assertion, prove it can
// fail before trusting it: feed it something wrong and confirm it complains.
// This project has shipped green checks that could not go red, and one that
// passed while measuring the wrong build entirely." A registry check is an
// especially easy one to ship broken -- a needle that matches nothing, a
// predicate that is true for the wrong reason, a sweep whose regex never
// fires -- and every one of those failures looks exactly like a pass.
//
// Each case below copies the files the checker reads into a sandbox under
// the OS temp directory, plants one defect, and asserts the checker exits
// non-zero AND says something recognisable about that specific defect. The
// second half matters: a check that fails for an unrelated reason on a
// mutated tree has not been shown to detect the mutation.
//
// The sandbox is a copy. Nothing here writes to the working tree.

import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

const root = process.cwd();
const checker = path.join(root, "scripts", "check-governance-claims.mjs");

// Everything scripts/check-governance-claims.mjs reads. FRAME.md, AGENTS.md
// and prompts/ joined the list when the checker's reach extended to the
// agent-facing documents; a file the checker reads and this list omits makes
// the control case crash on ENOENT rather than report anything useful.
const NEEDED = [
  "CHARTER.md",
  "CHANGELOG.md",
  "FRAME.md",
  "AGENTS.md",
  "prompts",
  "app",
  ".github",
];

function sandbox(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `gov-claims-${name}-`));
  for (const entry of NEEDED) {
    fs.cpSync(path.join(root, entry), path.join(dir, entry), {
      recursive: true,
    });
  }
  return dir;
}

function edit(dir, file, from, to) {
  const p = path.join(dir, file);
  const text = fs.readFileSync(p, "utf8");
  if (!text.includes(from)) {
    throw new Error(
      `test setup: ${file} in the sandbox does not contain ${JSON.stringify(
        from.slice(0, 60)
      )} -- this test's own premise about the tree is stale, which is a failure, not a skip`
    );
  }
  fs.writeFileSync(p, text.replace(from, to));
}

function run(dir) {
  try {
    const out = execFileSync(process.execPath, [checker, dir], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (error) {
    return {
      code: error.status ?? 1,
      out: `${error.stdout || ""}${error.stderr || ""}`,
    };
  }
}

const CASES = [
  {
    name: "canary",
    what: "rule 13's withdrawal sentence is removed from CHARTER.md",
    expect: /The prohibition is withdrawn here, not reinterpreted/,
    plant: (dir) =>
      edit(
        dir,
        "CHARTER.md",
        "The prohibition is withdrawn\n    here, not reinterpreted",
        "The prohibition stands"
      ),
  },
  {
    name: "gate-widened",
    what: "CHARTER.md goes back on the human-owned-paths gate",
    expect: /human-owned-paths filter is exactly|does not guard CHARTER\.md/,
    plant: (dir) =>
      edit(
        dir,
        ".github/workflows/pr-checks.yml",
        "grep -E '^(\\.github/|",
        "grep -E '^(CHARTER.md|\\.github/|"
      ),
  },
  {
    name: "tracking-returns",
    what: "the deprecation checker starts calling trackEvent again",
    expect: /makes no trackEvent\(\) call/,
    plant: (dir) =>
      edit(
        dir,
        "app/model-deprecation-checker/ModelDeprecationChecker.js",
        "  function clear() {",
        "  function spy() {\n    trackEvent(\"model_deprecation_checker_result\", {});\n  }\n\n  function clear() {"
      ),
  },
  {
    name: "claim-reworded",
    what: "the homepage's delegation sentence is rewritten without revisiting the registry",
    expect: /registered claim text is no longer present/,
    plant: (dir) =>
      edit(
        dir,
        "app/page.js",
        "The loop may\n        now amend that charter itself",
        "The loop may not touch that charter"
      ),
  },
  {
    name: "phrase-spreads",
    what: "a new page repeats the old origin story",
    expect: /unregistered "wrote the first commit"/,
    plant: (dir) => {
      const p = path.join(dir, "app", "some-new-page", "page.js");
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(
        p,
        "export default function New() {\n  return <p>A human wrote the first commit, as it happens.</p>;\n}\n"
      );
    },
  },
  {
    name: "rule-count-drifts",
    what: "FRAME.md fact 14's heading states a rule count CHARTER.md no longer has",
    expect: /types the live CHARTER\.md rule count/,
    plant: (dir) =>
      edit(
        dir,
        "FRAME.md",
        "## 14. `CHARTER.md` has 22 rules",
        "## 14. `CHARTER.md` has 21 rules"
      ),
  },
  {
    name: "agent-doc-reworded",
    what: "AGENTS.md's charter-ownership sentence is rewritten without revisiting the registry",
    expect: /registered claim text is no longer present/,
    plant: (dir) =>
      edit(
        dir,
        "AGENTS.md",
        "The loop's to edit under rule 13, apart from what rule 13a\n  reserves.",
        "Human-owned."
      ),
  },
  {
    name: "undisclosed-event",
    what: "a new tracked event is added and not disclosed",
    expect: /is not named on the disclosure page/,
    plant: (dir) => {
      const p = path.join(dir, "app", "demos", "ToolFinder.js");
      const text = fs.readFileSync(p, "utf8");
      fs.writeFileSync(
        p,
        text.replace(
          'trackEvent("tool_finder_restart");',
          'trackEvent("tool_finder_restart");\n      trackEvent("tool_finder_secret_thing", { who: "you" });'
        )
      );
    },
  },
];

// A control: the unmutated sandbox must pass. Without it, every case below
// could be "failing" because the sandbox itself is broken.
const control = sandbox("control");
const controlRun = run(control);
let failures = 0;
if (controlRun.code !== 0) {
  console.log(
    "FAIL  control: an unmutated copy of the tree does not pass -- every case below would be meaningless"
  );
  console.log(controlRun.out.split("\n").slice(-12).join("\n"));
  failures++;
} else {
  console.log("ok    control -- an unmutated copy of the tree passes");
}
fs.rmSync(control, { recursive: true, force: true });

for (const testCase of CASES) {
  let dir;
  try {
    dir = sandbox(testCase.name);
    testCase.plant(dir);
    const result = run(dir);
    if (result.code === 0) {
      console.log(`FAIL  ${testCase.name}: ${testCase.what} -- checker still passed`);
      failures++;
    } else if (!testCase.expect.test(result.out)) {
      console.log(
        `FAIL  ${testCase.name}: ${testCase.what} -- checker failed, but not about this: ` +
          `expected output matching ${testCase.expect}`
      );
      failures++;
    } else {
      console.log(`ok    ${testCase.name} -- ${testCase.what}: caught`);
    }
  } catch (error) {
    console.log(`FAIL  ${testCase.name}: ${error.message}`);
    failures++;
  } finally {
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log();
console.log(
  `governance-claim check proved able to fail on ${CASES.length - failures}/${
    CASES.length
  } planted defect(s)`
);
console.log(
  `honest limit: this proves the checker detects these ${CASES.length} planted defects. It says nothing about ` +
    `defects nobody thought to plant, and nothing at all about claims outside the registry -- ` +
    `see scripts/check-governance-claims.mjs's own header for that boundary.`
);

if (failures > 0) {
  console.log(`\n${failures} problem(s)`);
  process.exit(1);
}
process.exit(0);
