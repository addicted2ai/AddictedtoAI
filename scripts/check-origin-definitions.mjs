#!/usr/bin/env node
// The four Origin values' meanings are each published on several surfaces:
// the /log badge tooltips, the per-page disclosure sentences, the
// /disclosure page's enumeration, the homepage's prose, the CHANGELOG.md
// preamble, and the shared parser's own comment. Round 85 introduced
// `delegated`; by round 111 three of its six published definitions had
// silently lost the word "briefed" — the verb that separates the value from
// `unsupervised` — while the other three kept it. A reader hovering the
// badge on /log and then reading /disclosure was given two definitions of
// the same word.
//
// The surfaces are deliberately kept as prose frames rather than one shared
// constant: the preamble is markdown and cannot import code, and the other
// surfaces are grammatically different frames (a badge tooltip, a page
// sentence, an enumeration) that one string would flatten. What they must
// share is the *distinguishing content* of each Origin, asserted here so a
// third drift is a build failure instead of a reader's confusion:
//
//   delegated    — "chose, briefed, reviewed and merged" (the full chain;
//                  dropping any verb is the drift this check exists for)
//   supervised   — "triggered" and "veto" (a human could stop it)
//   maintainer   — "decided what and why" (a human directed the typing)
//   unsupervised — "nobody read" (it merged without being read)
//
// The homepage defines only `delegated`; the other three values are asserted
// on the six surfaces that define them. Run from the repository root:
//
//   node scripts/check-origin-definitions.mjs

import fs from "fs";
import path from "path";

const root = process.cwd();
const problems = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

// Extract the region of `text` that holds the definitions: from `from`
// through the first `to` after it (inclusive, so an end marker that is part
// of the definition is not cut off). Returns null when either marker is
// missing, so a file that stopped defining an Origin at all is a loud
// failure rather than a silent pass over whatever else matches.
function region(text, from, to) {
  const start = from === "" ? 0 : text.indexOf(from);
  if (start === -1) return null;
  const end = text.indexOf(to, start + from.length);
  if (end === -1) return null;
  return text.slice(start, end + to.length);
}

// The comment block in app/lib/build-log.js is split across lines and
// prefixed with "//"; flatten it back to prose before asserting on it.
function flattenComment(text) {
  return text.replace(/\/\//g, " ").replace(/\s+/g, " ").trim();
}

const INVARIANTS = {
  unsupervised: [/nobody read/],
  supervised: [/triggered/, /veto/],
  maintainer: [/decided what and why/],
  delegated: [/chose, briefed, reviewed and merged/],
};

// Every surface that defines an Origin must carry its invariant. The
// homepage states only the delegated definition; the CHANGELOG.md preamble
// is included because it is the record a reader of the repository sees,
// even though the rendered /log page starts at ## Log.
const SURFACES = [
  {
    file: "CHANGELOG.md",
    label: "preamble",
    region: ["", "\n## Log"],
    origins: ["unsupervised", "supervised", "maintainer", "delegated"],
  },
  {
    file: "app/lib/page-origins.js",
    label: "ORIGIN_MEANINGS",
    region: ["const ORIGIN_MEANINGS = {", "};"],
    origins: ["unsupervised", "supervised", "maintainer", "delegated"],
  },
  {
    file: "app/log/LogEntry.js",
    label: "ORIGIN_LABELS",
    region: ["export const ORIGIN_LABELS = {", "};"],
    origins: ["unsupervised", "supervised", "maintainer", "delegated"],
  },
  {
    file: "app/components/AiDisclosure.js",
    label: "ORIGIN_SENTENCES",
    region: ["const ORIGIN_SENTENCES = {", "};"],
    origins: ["unsupervised", "supervised", "maintainer", "delegated"],
  },
  {
    file: "app/disclosure/page.js",
    label: "the record enumeration",
    region: ["Each round in the build log records an", "are recorded as supervised"],
    origins: ["unsupervised", "supervised", "maintainer", "delegated"],
  },
  {
    file: "app/page.js",
    label: "the delegated sentence",
    region: ["delegated to the orchestrating model", "before it landed"],
    origins: ["delegated"],
  },
  {
    file: "app/lib/build-log.js",
    label: "the ORIGINS comment",
    region: ["unsupervised — merged itself", "merged it; no human saw it before it landed"],
    origins: ["unsupervised", "supervised", "maintainer", "delegated"],
    flatten: true,
  },
];

for (const surface of SURFACES) {
  let text;
  try {
    text = read(surface.file);
  } catch (error) {
    problems.push(`${surface.file}: cannot read the file`);
    continue;
  }
  const [from, to] = surface.region;
  const raw = region(text, from, to);
  if (raw === null) {
    problems.push(
      `${surface.file} (${surface.label}): the definitions region could not be found — ` +
        `nothing to assert, which must not pass`
    );
    continue;
  }
  const body = surface.flatten ? flattenComment(raw) : raw;
  let bad = 0;
  for (const origin of surface.origins) {
    for (const pattern of INVARIANTS[origin]) {
      if (!pattern.test(body)) {
        problems.push(
          `${surface.file} (${surface.label}): the ${origin} definition is missing ` +
            `/${pattern.source}/`
        );
        bad++;
      }
    }
  }
  if (bad === 0) {
    console.log(
      `ok    ${surface.file} (${surface.label}) carries the ${surface.origins.join(", ")} definition(s)`
    );
  }
}

// The parser comment names the round that introduced `delegated`. That fact
// is permanent — the record is append-only, so round 85 can never shift —
// and a stale number here is the defect round 111 corrected. Asserted rather
// than trusted to stay right: the first `delegated` mention in the file is
// the comment block's, and the first "(round N)" after it is its number.
const comment = read("app/lib/build-log.js");
const named = comment.match(/delegated[\s\S]*?\(round (\d+)\)/);
if (!named) {
  problems.push(
    "app/lib/build-log.js (the ORIGINS comment): names no round for `delegated` — " +
      "expected (round 85), the round that introduced the value"
  );
} else if (named[1] !== "85") {
  problems.push(
    `app/lib/build-log.js (the ORIGINS comment): names round ${named[1]} for ` +
      "`delegated` — expected (round 85), the round that introduced the value"
  );
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} origin-definition problem(s)`);
  process.exit(1);
}
console.log("ok    all Origin definitions agree on their distinguishing content");
process.exit(0);
