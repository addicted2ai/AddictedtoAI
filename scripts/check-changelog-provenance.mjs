#!/usr/bin/env node
// Three assertions about how a round was DISPATCHED and WHAT RAN IT, read
// from CHANGELOG.md and checked against policy.yml and scripts/runners.yml.
// Run from the repository root:
//
//   node scripts/check-changelog-provenance.mjs
//   node scripts/check-changelog-provenance.mjs <root>   # a sandbox copy
//
// WHY THIS EXISTS, AND WHY IT IS A MERGE-TIME CHECK.
//
// scripts/round.mjs:327 calls scripts/dispatch.mjs and takes the track from
// its output. That is the ONLY path in this repository that consults the
// dispatcher. A round briefed by hand -- track written into the brief, its
// own branch, running only `round.mjs check` -- never consults it at all,
// and that is how every round since the supervisor stopped on 2026-08-18
// was run. Nothing noticed, because the thing that would have noticed lived
// in the launcher that stopped being used.
//
// Measured on 2026-08-24 (`node scripts/dispatch.mjs`, against policy.yml's
// weights) over the last 20 shipped rounds: the two heaviest tracks, `scout`
// (weight 30) and `maintain` (25), had shipped ZERO; the lightest, `meta`
// (5), had shipped nine. `scout` is the loop's only input from outside this
// repository (policy.yml: `needs_docket_item: false` -- "its input is the
// world, not the queue") and it was off for the whole stretch.
//
// The per-track counts are deliberately NOT tabulated here. This file's own
// output prints them, live, on every run -- and the first version of this
// header did tabulate them, then went stale within the hour, because the
// round that wrote it shipped and moved the window. A number copied into a
// comment beside the code that computes it is the drift this repository
// keeps re-shipping. Round 185's changelog entry records the numbers as of
// the day, which is a record, not a live claim.
//
// The principle this file is built against: A GUARDRAIL ENFORCED AT LAUNCH
// IS ADVISORY; ONLY A MERGE-TIME CHECK BINDS. Everything that survived the
// harness change (`human-owned-paths`, `rule-13a-text`, `stop-mechanism`,
// `review-artifact`, `build-and-audit`) runs in CI. Everything in the launch
// path -- dispatch, weights, quotas -- vanished silently the moment the
// launch path changed. The check for "did this round come through the
// launcher" cannot live in the launcher. So it lives here, wired into
// scripts/check-routes.sh, which `build-and-audit` runs.
//
// WHAT THIS DOES NOT CLAIM. `enforce_admins` is `false` on `main`, and this
// repository has documented, merged-pull-request proof that the account the
// loop merges as can merge past a red required check
// (docket/open/2026-08-11-branch-protection-does-not-require-review.md).
// Moving these assertions into CI raises the floor from *invisible* to
// *visible and deliberate*. It does not make bypass impossible, and nothing
// here should be read as saying it does.
//
// WHAT THE PER-ENTRY ASSERTIONS JUDGE, AND WHY IT IS THE DIFF AND NOT THE
// ERA. This is the second version. The first asserted `Dispatch:` and
// `Agent:` over EVERY entry at or after ENFORCED_FROM, and review caught
// that this is an unrecoverable state reachable by a single mistake: one
// merged entry with a bad value would turn every future pull request red,
// and CHARTER.md rule 5 forbids the only remedy -- editing it. "Rule 5
// forbids the fix" is not a recovery path.
//
// So the two per-entry assertions judge only what the branch under test can
// still legally change: entries this branch ADDS, which are exactly the
// entries whose round number exceeds the round count on origin/main (the
// record is append-only, so a new entry can only appear on top and a merged
// entry's number never moves). A bad value fails the pull request that
// introduces it, while fixing it is still legal, and can never deadlock the
// repository afterwards.
//
// Entries already on origin/main are still READ and still REPORTED when they
// would not pass -- see the `note` lines below. Visibility without a trap:
// the check does not stop looking at merged history, it stops making merged
// history able to fail a build nobody can fix.
//
// When origin/main cannot be resolved -- a single-branch or shallow clone
// has no remote ref -- the scope falls back to the newest entry alone,
// announced rather than silently widened or silently skipped. That is the
// guard scripts/check-docket.mjs carries for its own filing gate, and for
// the same reason: a check that cannot read its baseline must not invent one
// or take the build down with it.
//
// Rounds before ENFORCED_FROM are never judged at all. Roughly 130 entries
// carry free-text `Agent:` values written before any registry existed, and
// none carries a `Dispatch:` field, because the field did not exist. That is
// stated rather than hidden: a check that quietly skipped 135 rounds while
// printing "ok" would be the defect class this round exists to reduce.

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { load as parseYaml } from "js-yaml";

// An optional root, so scripts/test-changelog-provenance.mjs can run this
// same script against a sandbox copy with a defect planted in it. A check
// nobody has watched go red is a check nobody has tested.
const rootArg = process.argv[2];
const root =
  rootArg && !rootArg.startsWith("--") ? path.resolve(rootArg) : process.cwd();

const problems = [];
const fail = (message) => problems.push(message);
const ok = (message) => console.log(`ok    ${message}`);

// The first round that could declare a `Dispatch:` field -- the round that
// added it, whose own entry is the field's first honest user. A round's
// number is its position in CHANGELOG.md (app/lib/build-log.js:
// `number: sections.length - index`), and the record is append-only, so a
// past entry's number never moves and this seam is permanent.
const ENFORCED_FROM = 185;

// See the note in check-docket.mjs: CRLF makes every line-anchored pattern
// here match nothing.
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
}

// --- reading the record ------------------------------------------------------
//
// A SECOND READER OF CHANGELOG.md, AND WHY. app/lib/build-log.js is this
// project's parser and the site builds from it; `round.mjs ship` imports it
// rather than writing a second one, on the stated grounds that "a second
// parser for one field is the disagreement this project keeps shipping".
// This script cannot use it for the new field: `Dispatch` is not in that
// file's FIELDS list, so its parser folds a `- Dispatch:` bullet into note
// prose -- and `app/` is not in the `meta` track's scope
// (scripts/check-track-scope.mjs), so this round cannot add it there.
//
// The mitigation is not "be careful". It is `crossCheck()` below: this
// reader's section count, round numbers and `Track:` values are asserted
// EQUAL to app/lib/build-log.js's on every run. If the two ever disagree
// about what a round is or which track it shipped, this check goes red
// rather than quietly measuring a different record than the site publishes.
// Folding `Dispatch` into that file's FIELDS -- so /log can render it and
// this reader can be deleted -- is work for a track that owns `app/`.

function sections(markdown) {
  // Identical to app/lib/build-log.js's parse(): strip the trailing template
  // comment so its placeholder entry is not read as a real round, start at
  // the Log heading, split on `### `.
  const withoutComments = markdown.replace(/<!--[\s\S]*?-->/g, "");
  const logStart = withoutComments.indexOf("\n## Log");
  const log = logStart === -1 ? withoutComments : withoutComments.slice(logStart);
  return log.split(/\n### /).slice(1);
}

// One `- Field: value` bullet, with its hard-wrapped continuation lines
// folded back into one line. The changelog wraps at about 76 columns and
// every one of these fields regularly runs past it, so a check that read
// only the bullet's first line would judge half a sentence.
function bulletValue(body, field) {
  const lines = body.split("\n");
  const start = lines.findIndex((line) =>
    new RegExp(`^- ${field}:`).test(line)
  );
  if (start === -1) return null;
  const collected = [lines[start].replace(new RegExp(`^- ${field}:`), "")];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s+\S/.test(lines[i])) collected.push(lines[i]);
    else break;
  }
  return collected.join(" ").replace(/\s+/g, " ").trim();
}

const changelog = read("CHANGELOG.md");
const parsed = sections(changelog).map((section, index, all) => {
  const newline = section.indexOf("\n");
  const date = section.slice(0, newline).trim();
  const body = section.slice(newline + 1);
  return {
    number: all.length - index, // app/lib/build-log.js's own formula
    date,
    body,
    track: (bulletValue(body, "Track") || "").toLowerCase() || null,
    agent: bulletValue(body, "Agent"),
    dispatch: bulletValue(body, "Dispatch"),
  };
});

// --- 0. the two readers must agree -------------------------------------------

async function crossCheck() {
  let buildLog;
  try {
    const url = `file://${path
      .join(root, "app", "lib", "build-log.js")
      .replace(/\\/g, "/")}`;
    // getBuildLog() reads CHANGELOG.md from process.cwd(), not from `root`,
    // so the cross-check is only meaningful when they are the same tree. In
    // a sandbox run it is skipped and said so, never silently passed.
    if (path.resolve(root) !== path.resolve(process.cwd())) {
      console.log(
        "note  cross-check against app/lib/build-log.js skipped: running against a " +
          "sandbox root, which that module cannot be pointed at (it reads process.cwd())"
      );
      return;
    }
    ({ getBuildLog: buildLog } = await import(url));
  } catch (error) {
    fail(
      `app/lib/build-log.js could not be imported (${error.message}) -- this script's ` +
        "reading of CHANGELOG.md cannot be checked against the site's own parser, which " +
        "must not pass silently"
    );
    return;
  }
  let entries;
  try {
    entries = buildLog();
  } catch (error) {
    fail(
      `app/lib/build-log.js could not parse CHANGELOG.md (${error.message}) -- fix that ` +
        "first; this script's own reading means nothing while the site's parser rejects the file"
    );
    return;
  }
  if (entries.length !== parsed.length) {
    fail(
      `this script reads ${parsed.length} round(s) from CHANGELOG.md but ` +
        `app/lib/build-log.js reads ${entries.length} -- two readers of the same file ` +
        "disagree about what a round is"
    );
    return;
  }
  const mismatched = entries
    .map((entry, i) => ({ entry, mine: parsed[i] }))
    .filter(
      ({ entry, mine }) =>
        entry.number !== mine.number ||
        (entry.track || "").toLowerCase() !== (mine.track || "")
    );
  if (mismatched.length > 0) {
    const labels = mismatched
      .slice(0, 5)
      .map(
        ({ entry, mine }) =>
          `round ${mine.number}: this script says track "${mine.track}", ` +
          `build-log.js says round ${entry.number} track "${entry.track}"`
      );
    fail(
      `this script and app/lib/build-log.js disagree on ${mismatched.length} entr(ies): ` +
        labels.join("; ")
    );
    return;
  }
  ok(
    `this script and app/lib/build-log.js agree on all ${entries.length} round(s) ` +
      "(number and Track)"
  );
}

await crossCheck();

// --- 1. every round from ENFORCED_FROM forward declares how it was dispatched -
//
// Two legitimate shapes, and forcing is one of them:
//
//   - Dispatch: dispatcher — <the reason line dispatch.mjs printed>
//   - Dispatch: forced — <why a human or orchestrator overrode it>
//
// Forcing is legitimate. HIDING THAT YOU FORCED IS NOT. The field exists so
// that "was this round's track chosen by the dispatcher?" is answerable from
// the published record instead of from whoever remembers how it was started.

const DISPATCH_SHAPE = /^(dispatcher|forced)\b\s*(?:[—–-]{1,2})\s*(\S.*)$/;

// How many rounds the record already holds on origin/main. Everything above
// that number is an entry this branch adds -- the only entries it can still
// legally change, and therefore the only ones these assertions may fail on.
// See the header: judging merged entries makes a single mistake permanent.
// Returns a number, or null when there is genuinely no baseline to read.
// The two are distinguished on purpose. A missing origin/main is expected in
// a single-branch or shallow clone and narrows the scope. A ref that EXISTS
// but cannot be read is a broken tool, and must not quietly become "no
// baseline" -- the first version of this function caught every error alike
// and reported "origin/main is not in this checkout" on a tree where it
// plainly was, because CHANGELOG.md is over 1 MB and blew execFileSync's
// default maxBuffer. A check that reports the wrong reason for standing down
// is the defect class this file exists to reduce.
function baseRoundCount() {
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", "origin/main^{commit}"], {
      stdio: "ignore",
      cwd: root,
    });
  } catch {
    return null; // genuinely no remote ref here
  }
  try {
    const text = execFileSync("git", ["show", "origin/main:CHANGELOG.md"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      cwd: root,
      maxBuffer: 256 * 1024 * 1024,
    }).replace(/\r\n/g, "\n");
    return sections(text).length;
  } catch (error) {
    fail(
      `origin/main exists but its CHANGELOG.md could not be read (${error.message
        .split("\n")[0]
        .trim()}) -- the scope of every per-entry assertion below depends on it, and a ` +
        "baseline that cannot be read must not silently become no baseline"
    );
    return null;
  }
}

const baseRounds = baseRoundCount();
const eraEntries = parsed.filter((entry) => entry.number >= ENFORCED_FROM);

let enforced;
if (baseRounds === null) {
  enforced = parsed.slice(0, 1).filter((entry) => entry.number >= ENFORCED_FROM);
  console.log(
    "note  origin/main is not in this checkout, so the entries this branch adds cannot be " +
      "computed -- scope falls back to the newest entry alone. The check still runs; it is " +
      "narrower than it would be in CI, and says so rather than widening or skipping silently"
  );
} else {
  enforced = eraEntries.filter((entry) => entry.number > baseRounds);
  console.log(
    `note  scope: the ${enforced.length} entr(ies) this branch adds above origin/main's ` +
      `${baseRounds} round(s). Entries already merged are read and reported below, never ` +
      "failed on -- rule 5 forbids editing them, so failing on one would be a build nobody " +
      "could fix"
  );
}

// Merged entries in the enforced era that would not pass. Reported, never
// failed on. This is the half that keeps the check honest about what it can
// see without giving it a way to deadlock the repository.
const merged = eraEntries.filter((entry) => !enforced.includes(entry));

let dispatchProblems = 0;
for (const entry of enforced) {
  const label = `round ${entry.number} (${entry.date})`;
  if (entry.dispatch === null) {
    fail(
      `${label}: no '- Dispatch:' field. Every round from ${ENFORCED_FROM} forward must ` +
        "state how its track was chosen: '- Dispatch: dispatcher — <the reason line " +
        "dispatch.mjs printed>' or '- Dispatch: forced — <why it was overridden>'"
    );
    dispatchProblems++;
    continue;
  }
  if (!entry.dispatch) {
    fail(`${label}: '- Dispatch:' is present but empty`);
    dispatchProblems++;
    continue;
  }
  const shape = DISPATCH_SHAPE.exec(entry.dispatch);
  if (!shape) {
    fail(
      `${label}: '- Dispatch: ${entry.dispatch.slice(0, 60)}' is not one of the two ` +
        "legitimate shapes -- it must begin 'dispatcher' or 'forced', followed by a dash " +
        "and a reason. A bare verdict with no reason is the thing this field exists to stop"
    );
    dispatchProblems++;
  }
}
if (eraEntries.length === 0) {
  fail(
    `no entry in CHANGELOG.md has a round number >= ${ENFORCED_FROM} -- the record holds ` +
      "no round this check applies to at all, so it has nothing to assert, which must not " +
      "read as a pass"
  );
} else if (enforced.length === 0) {
  console.log(
    "note  this branch adds no changelog entry, so the Dispatch and Agent assertions have " +
      "nothing in scope. That is a legitimate state, not a pass over a defect -- `round.mjs " +
      "ship` fails closed on a round with no entry of its own, separately from this check"
  );
} else if (dispatchProblems === 0) {
  ok(
    `all ${enforced.length} round(s) from ${ENFORCED_FROM} forward declare a well-formed ` +
      `Dispatch (${enforced.filter((e) => /^forced/.test(e.dispatch)).length} forced, ` +
      `${enforced.filter((e) => /^dispatcher/.test(e.dispatch)).length} via the dispatcher)`
  );
}
console.log(
  `note  historical coverage is nil by design: rounds 1..${ENFORCED_FROM - 1} predate the ` +
    "Dispatch field and CHARTER.md rule 5 forbids rewriting them"
);
for (const entry of merged) {
  const shape = entry.dispatch && DISPATCH_SHAPE.test(entry.dispatch);
  if (!shape) {
    console.log(
      `note  merged round ${entry.number} (${entry.date}) carries ` +
        `${entry.dispatch === null ? "no Dispatch field" : `Dispatch '${entry.dispatch.slice(0, 50)}'`}` +
        ", which this check would reject on a branch. It is already on origin/main and rule 5 " +
        "forbids editing it, so it is reported and not failed on"
    );
  }
}

// --- 2. composition: a policy-heavy track may not sit at zero ----------------
//
// policy.yml's weights are a claim about what the loop's output should be
// made of. Nothing checked whether it ever was. This reads the last N
// shipped rounds' tracks -- the same list, from the same field, over the
// same window scripts/dispatch.mjs uses for its own quota arithmetic -- and
// fails when a track policy.yml weights at HEAVY_WEIGHT or above has shipped
// zero rounds across it.
//
// N IS NOT PICKED HERE. It is read out of scripts/dispatch.mjs's own
// `const WINDOW` so that CI and the dispatcher cannot come to disagree about
// what "recent" means; a hand-typed 20 here would be a second copy of the
// number the moment anyone retuned the first. The same reason
// check-governance-claims.mjs asserts its workflow-filter regex equals the
// site's rather than keeping a private copy.
//
// HEAVY_WEIGHT = 20 is this file's own constant and is stated as a judgement,
// not a derivation: it separates policy.yml's two structural tracks
// (scout 30, maintain 25) from the four that produce or check site content
// (author 15, build 15, audit 10, meta 5). Sanity-tested against the whole
// record before shipping -- see this round's changelog entry for the
// window-by-window numbers.
//
// ARMED FROM ENFORCED_FROM, for the same reason the two per-entry assertions
// are: this asserts a property of how rounds were DISPATCHED, and it cannot
// hold a round accountable for a dispatch decision taken before the field
// existed. So it evaluates only once the whole window sits at or above
// ENFORCED_FROM. Until then it PRINTS the real composition every run --
// loudly, with the true zero counts -- so the drought is never invisible; it
// is simply not yet a build failure. At the cadence measured on 2026-08-24
// (rounds 164..184 shipped across 2026-08-21..2026-08-24, about five a day)
// that arming window is a few days, and it is stated here rather than left
// for a reader to discover.

const HEAVY_WEIGHT = 20;

const policy = parseYaml(read("policy.yml"));
const tracks = policy.tracks || {};
const heavy = Object.entries(tracks)
  .filter(([, cfg]) => Number(cfg?.weight) >= HEAVY_WEIGHT)
  .map(([name, cfg]) => ({ name, weight: Number(cfg.weight) }));

// The dispatcher's own window, read from its source rather than restated.
function dispatchWindow() {
  const source = read("scripts/dispatch.mjs");
  // Tolerant of whitespace and of a formatter reflowing the declaration: a
  // cosmetic reformat of dispatch.mjs must not turn this build red.
  const match = source.match(/^\s*const WINDOW\s*=\s*(\d+)\s*;/m);
  return match ? Number(match[1]) : null;
}

const WINDOW = dispatchWindow();
const shipped = parsed.filter((entry) => entry.track);

if (WINDOW === null) {
  fail(
    "scripts/dispatch.mjs no longer declares `const WINDOW = <n>;` at top level -- the " +
      "composition assertion reads its window from there so the two cannot disagree, and " +
      "it has nothing to read"
  );
} else if (heavy.length === 0) {
  fail(
    `policy.yml weights no track at ${HEAVY_WEIGHT} or above -- the composition assertion ` +
      "has nothing to assert, which must not read as a pass"
  );
} else if (shipped.length < WINDOW) {
  console.log(
    `note  composition: only ${shipped.length} round(s) carry a Track: field, fewer than the ` +
      `window of ${WINDOW} -- nothing to assert yet`
  );
} else {
  const window = shipped.slice(0, WINDOW);
  const counts = Object.fromEntries(
    Object.keys(tracks).map((name) => [
      name,
      window.filter((entry) => entry.track === name).length,
    ])
  );
  console.log(
    `      composition over the last ${WINDOW} shipped round(s), ` +
      `rounds ${window[WINDOW - 1].number}..${window[0].number}:`
  );
  for (const [name, cfg] of Object.entries(tracks)) {
    console.log(
      `        ${name.padEnd(9)} policy weight ${String(cfg.weight).padStart(3)}  ` +
        `shipped ${String(counts[name] || 0).padStart(2)}`
    );
  }
  const starved = heavy.filter((track) => (counts[track.name] || 0) === 0);
  const armed = window[WINDOW - 1].number >= ENFORCED_FROM;
  if (starved.length === 0) {
    ok(
      `composition: every track policy.yml weights >= ${HEAVY_WEIGHT} ` +
        `(${heavy.map((t) => `${t.name} ${t.weight}`).join(", ")}) shipped at least once ` +
        `in the last ${WINDOW} round(s)`
    );
  } else {
    const detail = starved
      .map((t) => `${t.name} (policy weight ${t.weight}) shipped 0`)
      .join("; ");
    if (armed) {
      fail(
        `composition: ${detail} across the last ${WINDOW} shipped round(s) ` +
          `(rounds ${window[WINDOW - 1].number}..${window[0].number}). policy.yml asks for ` +
          "that share of the loop's output and the record shows none of it. Run the " +
          "dispatcher (`node scripts/dispatch.mjs`) and let it choose, or force a track and " +
          "say so in the Dispatch field"
      );
    } else {
      console.log(
        `WARN  composition: ${detail} across the last ${WINDOW} shipped round(s) ` +
          `(rounds ${window[WINDOW - 1].number}..${window[0].number}). This is REAL and it is ` +
          "the finding this check was built for. It is not yet a build failure: the window " +
          `still reaches back before round ${ENFORCED_FROM}, when no round declared how it ` +
          `was dispatched. It becomes a failure once the whole window is round ${ENFORCED_FROM} ` +
          "or later"
      );
    }
  }
}

// --- 3. Agent: must resolve to a registered runner ---------------------------
//
// scripts/runners.yml is "the one place harness, provider, model and variant
// are named as independent fields for a loop run". CHANGELOG.md's `Agent:`
// field is the published claim about which of them actually ran a round --
// and it has always been free text, so "did this round come through a
// registered runner?" could not be answered from the record at all.
//
// WHAT THE RECORD'S CONVENTION ACTUALLY IS. The first version of this
// resolver accepted a runner key or a runner `model`, on a rationale that
// said "the record's own convention is to publish the MODEL". Review
// established that this was inverted. Counted across the whole file, the
// DOMINANT convention is harness first with the model in the parenthetical:
// `opencode (deepseek-v4-flash)` appears 70 times against 25 entries in
// model-first shape, plus bare harness names (`codex` 17, `claude-code` 13)
// and slash-joined pairs (`opencode/deepseek-v4-flash`). A resolver built on
// the inverted reading rejected the majority of this repository's own
// history AND, worse, rejected the values its own launcher tells a round to
// write -- inside a required check.
//
// So a value resolves when the part before any parenthetical names any of:
//
//   * a runner key            claude-code-opus-5, opencode-go-deepseek-max
//   * a runner's model        claude-opus-5, deepseek-v4-flash, gpt-5-codex
//   * a harness               opencode, claude-code, codex, claude-code-action
//   * <something>/<model>     opencode/deepseek-v4-flash,
//                             opencode-go/deepseek-v4-flash
//
// All four, because all four are shapes this repository actually produces:
// `prompts/shared/every-run.md` names harnesses, `scripts/runners.yml`'s
// `default_runner` produces a provider/model pair, and the launcher and the
// changelog between them produce the other two.
//
// `unknown` IS DELIBERATELY REJECTED, and the source was fixed in the same
// change rather than the accept-list widened to swallow it.
// `scripts/round.mjs start` and `scripts/build-prompt.mjs` both defaulted
// `--agent` to the literal string `unknown` and printed it under "Record
// these in your changelog entry", so the launcher instructed a round to
// write a value this check then blocks the merge on. Neither emits it now:
// given no `--agent`, they tell the round to determine and name what ran it,
// which is the same pattern build-prompt.mjs already adopted for `--origin`
// on 2026-08-24 -- a caller told what determines the value instead of being
// told a value nothing verified. A record that says "unknown" ran a round
// answers the question this field exists to answer with a shrug.

const runnersFile = "scripts/runners.yml";
let runners;
try {
  runners = parseYaml(read(runnersFile));
} catch (error) {
  fail(`${runnersFile} could not be read or parsed: ${error.message}`);
  runners = null;
}

if (runners) {
  const registry = runners.runners || {};
  const names = Object.keys(registry);
  const models = names.map((name) => registry[name]?.model).filter(Boolean);
  const harnesses = Object.keys(runners.harnesses || {});
  const providers = names.map((name) => registry[name]?.provider).filter(Boolean);
  const resolvable = new Set([...names, ...models, ...harnesses]);
  // The left half of a slash-joined pair: anything that identifies where the
  // model ran. `opencode-go/deepseek-v4-flash` names a provider;
  // `opencode/deepseek-v4-flash` names a harness that is also a provider.
  const leftHalves = new Set([...names, ...harnesses, ...providers]);

  function resolves(named) {
    if (resolvable.has(named)) return true;
    const slash = named.indexOf("/");
    if (slash === -1) return false;
    return (
      leftHalves.has(named.slice(0, slash)) &&
      new Set(models).has(named.slice(slash + 1))
    );
  }

  if (resolvable.size === 0) {
    fail(
      `${runnersFile} registers no runners -- every Agent: value would fail to resolve, ` +
        "which is a broken registry rather than 130 bad entries"
    );
  } else {
    let agentProblems = 0;
    for (const entry of enforced) {
      const label = `round ${entry.number} (${entry.date})`;
      if (!entry.agent) {
        fail(
          `${label}: no '- Agent:' field. A round from ${ENFORCED_FROM} forward must name ` +
            `what ran it, and that name must resolve in ${runnersFile}`
        );
        agentProblems++;
        continue;
      }
      // Everything before the first parenthetical, which is where the record
      // puts the human-readable qualifier ("(orchestrating model)").
      const named = entry.agent.split("(")[0].trim().replace(/[.,;]+$/, "");
      if (named === "unknown") {
        fail(
          `${label}: Agent: 'unknown' names nothing. This was the literal default ` +
            "`scripts/round.mjs start` and `scripts/build-prompt.mjs` printed under \"Record " +
            "these in your changelog entry\" until round 185; neither emits it now. Name what " +
            `actually ran the round -- a harness, a model, or a runner from ${runnersFile}`
        );
        agentProblems++;
        continue;
      }
      if (!resolves(named)) {
        fail(
          `${label}: Agent: '${named}' does not resolve in ${runnersFile}. Accepted: a runner ` +
            `key (${names.join(", ")}), a runner model (${[...new Set(models)].join(", ")}), ` +
            `a harness (${harnesses.join(", ")}), or <provider-or-harness>/<model>. Either the ` +
            "round ran on something unregistered -- register it there -- or the field names " +
            "something that is not a runner at all"
        );
        agentProblems++;
      }
    }
    for (const entry of merged) {
      const named = (entry.agent || "").split("(")[0].trim().replace(/[.,;]+$/, "");
      if (named && named !== "unknown" && resolves(named)) continue;
      console.log(
        `note  merged round ${entry.number} (${entry.date}) carries Agent ` +
          `'${entry.agent || "(absent)"}', which this check would reject on a branch. Already ` +
          "on origin/main; rule 5 forbids editing it, so it is reported and not failed on"
      );
    }
    if (enforced.length > 0 && agentProblems === 0) {
      ok(
        `all ${enforced.length} round(s) from ${ENFORCED_FROM} forward name an Agent that ` +
          `resolves in ${runnersFile} (${names.length} runner(s) registered)`
      );
    }
    console.log(
      `note  the ${parsed.length - eraEntries.length} round(s) before ${ENFORCED_FROM} are not ` +
        "checked: their Agent: values are free text written before any registry existed " +
        "(`opencode`, `claude-code`, `codex`, `claude-sonnet-5 (Claude Code subagent)` and " +
        "more), and rule 5 forbids rewriting them. Historical coverage is nil"
    );
  }
}

// --- report ------------------------------------------------------------------

console.log();
console.log(
  `changelog provenance -- ${parsed.length} round(s) read, ${eraEntries.length} in the ` +
    `enforced era (round ${ENFORCED_FROM}+), of which ${enforced.length} added by this branch ` +
    `and therefore assertable; composition window ${WINDOW ?? "?"} ` +
    `(read from scripts/dispatch.mjs), heavy tracks ${
      heavy.map((t) => t.name).join(", ") || "none"
    }`
);
console.log(
  "honest limit: `enforce_admins` is false on `main` and this loop's account has documented, " +
    "merged-PR proof it can merge past a red required check " +
    "(docket/open/2026-08-11-branch-protection-does-not-require-review.md). These assertions " +
    "make a forced or starved round VISIBLE and DELIBERATE. They do not make it impossible."
);

if (problems.length > 0) {
  console.log();
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} changelog-provenance problem(s)`);
  process.exit(1);
}
console.log("\nok    every checked round says how it was dispatched and what ran it");
process.exit(0);
