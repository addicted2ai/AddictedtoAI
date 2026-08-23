#!/usr/bin/env node
// Preflight capability check for one loop runner -- harness, provider,
// model and variant, as declared in scripts/runners.yml. Run from the repository
// root:
//
//   node scripts/runner-preflight.mjs [runner-id]        # human-readable
//   node scripts/runner-preflight.mjs [runner-id] --json
//
// runner-id defaults to $ORCHESTRATE_RUNNER, then scripts/runners.yml's own
// default_runner. scripts/orchestrate.sh calls this before every iteration
// and reads the final line of stdout -- see scripts/runners.yml's header for why
// the model, provider, harness and variant no longer live in
// scripts/orchestrate.sh as a hardcoded string.
//
// NEVER SILENTLY SUBSTITUTE. On any failure this prints which precondition
// failed, by name, and exits 1 -- it never falls back to a different
// runner, a different model, or a default variant. A caller that ignored
// the exit code and launched anyway would be the only way a substitution
// could happen; scripts/orchestrate.sh does not (see the comment at its
// call site). CHANGELOG.md's `Agent:` field is published provenance -- a
// record saying one model did work another model did is exactly the class
// of false claim docket/briefs/'s own convention (round 9, 2026-08-23)
// exists to keep out of the record.
//
// WHAT THIS CANNOT CHECK. "Remaining credit" has no local balance or usage
// endpoint on the OpenCode server -- the paths that look like one return
// the SPA shell (text/html), not JSON. Checked this round: GET /provider
// and GET /doc both return real application/json; GET /app does not. So
// this script only ever trusts a response whose content-type is actually
// application/json, and it checks CONFIGURATION, never a balance: is the
// harness present, is the provider connected, is the model in that
// provider's live catalogue, is the model excluded by standing instruction.
// A quota rejection at the harness's first real call is a different fact
// from any of those, and cannot be told apart from here before the call is
// made -- scripts/orchestrate.sh classifies that case separately, after a
// launch, never inside this script.
//
// Every check reports PASS, FAIL or UNVERIFIED -- never a silent pass for
// something this script could not actually evaluate, the same convention
// FRAME.md's own checks use and for the same reason (see that file's
// header). UNVERIFIED does not fail the overall verdict on its own -- it
// means "cannot tell from here", not "broken" -- but it is never printed as
// a PASS, and a harness whose needs_server check itself fails turns its
// downstream UNVERIFIEDs into the FAIL that actually blocks the runner
// (see the needs_server branch below).

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const args = process.argv.slice(2);
const json = args.includes("--json");
const requestedId =
  args.find((a) => !a.startsWith("--")) || process.env.ORCHESTRATE_RUNNER || "";

const checks = [];
function record(name, status, detail) {
  checks.push({ name, status, detail });
}

function readConfig() {
  return parseYaml(fs.readFileSync(path.join(root, "scripts", "runners.yml"), "utf8"));
}

// PATH lookup only -- this never executes the candidate. This round's own
// hard rule ("do not run the opencode CLI... not opencode on its own") rules
// out even a `--version` probe, so presence is answered by asking the
// filesystem whether an executable file is on PATH, not by running anything
// -- the same "resolve, don't execute" distinction scripts/round.mjs already
// relies on for its Windows Git Bash lookup.
function resolveOnPath(cmd) {
  const dirs = (process.env.PATH || process.env.Path || "")
    .split(path.delimiter)
    .filter(Boolean);
  const exts =
    process.platform === "win32"
      ? (process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD").split(";")
      : [""];
  for (const dir of dirs) {
    for (const ext of exts) {
      const name =
        ext && !cmd.toLowerCase().endsWith(ext.toLowerCase()) ? cmd + ext : cmd;
      try {
        if (fs.statSync(path.join(dir, name)).isFile()) return path.join(dir, name);
      } catch {
        /* not here, keep looking */
      }
    }
  }
  return null;
}

// GET serverUrl/provider -- read-only, no model call, no session created.
// Returns null on anything that is not a genuine JSON 200: unreachable,
// timeout, non-2xx, or a content-type that is not application/json (the SPA
// shell guard described in this file's header). Never throws.
async function queryOpenCodeProvider(serverUrl) {
  try {
    const res = await fetch(`${serverUrl}/provider`, {
      signal: AbortSignal.timeout(4000),
    });
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("application/json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

let config = null;
try {
  config = readConfig();
} catch (error) {
  record("scripts/runners.yml readable", "FAIL", `could not read or parse scripts/runners.yml: ${error.message}`);
}

let resolvedId = null;
let runner = null;

if (config) {
  resolvedId = requestedId || config.default_runner;
  runner = config.runners && config.runners[resolvedId];
  if (!runner) {
    record(
      "runner known",
      "FAIL",
      `'${resolvedId}' is not a key under runners: in scripts/runners.yml`
    );
  } else {
    record("runner known", "PASS", resolvedId);

    const harness = config.harnesses && config.harnesses[runner.harness];
    if (!harness) {
      record(
        "harness known",
        "FAIL",
        `runner '${resolvedId}' names harness '${runner.harness}', not a key under harnesses: in scripts/runners.yml`
      );
    } else {
      record("harness known", "PASS", runner.harness);

      const presenceCmd = harness.presence_check || runner.harness;
      const binPath = resolveOnPath(presenceCmd);
      if (binPath) {
        record("harness present", "PASS", `${presenceCmd} -> ${binPath}`);
      } else {
        record("harness present", "FAIL", `'${presenceCmd}' not found on PATH`);
      }

      const patterns = config.excluded_model_patterns || [];
      const excludedHit = patterns.find((rule) =>
        new RegExp(rule.pattern, rule.flags || "").test(runner.model)
      );
      if (excludedHit) {
        record(
          "model not excluded",
          "FAIL",
          `model '${runner.model}' matches excluded pattern '${excludedHit.pattern}' -- ${excludedHit.reason}`
        );
      } else {
        record("model not excluded", "PASS", runner.model);
      }

      if (harness.needs_server) {
        const data = await queryOpenCodeProvider(harness.server_url);
        if (!data) {
          record(
            "harness server reachable",
            "FAIL",
            `${harness.server_url}/provider did not answer JSON within timeout`
          );
          record("provider authenticated", "UNVERIFIED", "harness server unreachable, could not check");
          record("model in catalogue", "UNVERIFIED", "harness server unreachable, could not check");
        } else {
          record("harness server reachable", "PASS", harness.server_url);

          const connected = Array.isArray(data.connected) ? data.connected : [];
          if (connected.includes(runner.provider)) {
            record(
              "provider authenticated",
              "PASS",
              `'${runner.provider}' is in the server's own connected list`
            );
          } else {
            record(
              "provider authenticated",
              "FAIL",
              `'${runner.provider}' is not in the server's connected list (${connected.join(", ") || "none"})`
            );
          }

          const providerEntry = Array.isArray(data.all)
            ? data.all.find((p) => p && p.id === runner.provider)
            : null;
          const models =
            providerEntry && providerEntry.models && typeof providerEntry.models === "object"
              ? Object.keys(providerEntry.models)
              : null;
          if (!models) {
            record(
              "model in catalogue",
              "FAIL",
              `provider '${runner.provider}' was not found in the server's own provider list`
            );
          } else if (models.includes(runner.model)) {
            record(
              "model in catalogue",
              "PASS",
              `'${runner.model}' is one of ${models.length} models listed for '${runner.provider}'`
            );
          } else {
            record(
              "model in catalogue",
              "FAIL",
              `'${runner.model}' is not among the ${models.length} models '${runner.provider}' lists`
            );
          }
        }
      } else {
        // No local catalogue/auth endpoint exists for this harness (Claude
        // Code, Codex) -- the same "structurally cannot check from inside
        // this repository" case FRAME.md fact 16 already documents for
        // OpenCode's own websearch tooling. UNVERIFIED, never a guessed PASS.
        record(
          "provider authenticated",
          "UNVERIFIED",
          `harness '${runner.harness}' has no local catalogue/auth endpoint this script can query`
        );
        record(
          "model in catalogue",
          "UNVERIFIED",
          `harness '${runner.harness}' has no local catalogue/auth endpoint this script can query`
        );
      }
    }
  }
}

const failed = checks.filter((c) => c.status === "FAIL");
const evaluated = checks.length > 0;
const ok = evaluated && failed.length === 0;

if (json) {
  process.stdout.write(
    JSON.stringify({ runnerId: resolvedId, ok, checks }, null, 2) + "\n"
  );
} else {
  for (const c of checks) console.log(`${c.status.padEnd(11)} ${c.name}: ${c.detail}`);
}

if (ok) {
  console.log(
    `RUNNER_OK harness=${runner.harness} provider=${runner.provider} model=${runner.model} variant=${runner.variant ?? "none"}`
  );
  process.exit(0);
} else {
  console.log(
    `RUNNER_FAIL ${resolvedId ?? "(unresolved)"}: ${failed.map((c) => c.name).join("; ") || "could not evaluate any check"}`
  );
  process.exit(1);
}
