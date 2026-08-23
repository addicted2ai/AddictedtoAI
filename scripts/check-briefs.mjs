#!/usr/bin/env node
// Validate briefs committed under docket/briefs/. Run from the repository root:
//
//   node scripts/check-briefs.mjs
//
// WHY THIS EXISTS. On 22 August 2026 three false premises entered this project
// through briefs -- the documents the orchestrator writes to instruct each
// round -- and each was built on before the maintainer caught it by accident,
// in conversation. Review could not catch any of them: review checks work
// *against* a brief, and the brief carried the error. FRAME.md (round 8,
// loop/meta/frame) gives premises something to be checked against; this script
// is the other half -- it makes a brief's failure to cite one detectable.
//
// WHAT THIS SCRIPT DOES NOT CLAIM. Read this before trusting a green run.
//
// A brief is written BEFORE its round runs. This script runs AFTER the round
// has already committed the brief -- there is no point at which it could stop
// a round from being briefed on an unsourced premise, only a point where it can
// make the absence of a source visible in the record. That is a real, useful
// property (nobody validated a brief before this; now the absence of a source
// is a red build instead of an accident someone happens to notice), but it is
// not prevention, and this script does not pretend otherwise.
//
// For a premise tagged [command: ...] or [attested: ...], this script checks
// that a non-empty source is DECLARED -- not that the command's output
// actually supports the claim, and not that the attestation actually
// happened. Verifying that would mean deciding whether a piece of freeform
// prose is true, which is exactly the problem FRAME.md's own checker
// (scripts/check-frame.mjs) spent three narrowing fixes and a fourth
// replacement discovering is not a bounded problem -- see that script's own
// header. This script does not attempt it. For a premise tagged [frame:N],
// it checks that fact N still exists as a heading in FRAME.md today -- not
// that the fact's wording still matches what the brief cited it for, and not
// that it existed with that meaning when the brief was written.
//
// So: this script verifies a premise is SOURCED, not that the source is
// correct. A brief with every premise laundered through a command that prints
// something irrelevant would still pass. The bound that makes this checkable
// at all is the same one FRAME.md's checker converged on after getting it
// wrong three times (see that file's header, points 1-4): stop trying to
// recognise a claim's shape in prose, and require a declared, enumerable list
// instead. A missing or malformed declaration fails loudly; a false command or
// a fabricated attestation does not, and cannot, by construction.
//
// docket/briefs/legacy/ is exempt from all of this. It holds briefs written
// before this convention existed (round 9, loop/meta/briefs-and-premises,
// 2026-08-23) and committed afterwards as historical record, annotated but not
// rewritten -- see docket/briefs/README.md. Retrofitting a premise
// declaration onto a brief whose round already ran and already shipped would
// not catch anything; the round it could have stopped is over.

import fs from "fs";
import path from "path";

const root = process.cwd();
const briefsDir = path.join(root, "docket", "briefs");
const framePath = path.join(root, "FRAME.md");

const TRACKS = ["scout", "author", "build", "maintain", "audit", "meta"];

const problems = [];
const fail = (file, message) => problems.push(`${file}: ${message}`);

function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

// Same shape as check-docket.mjs's sectionBody: a "## Heading" and everything
// up to the next "## " heading (or end of file).
function sectionBody(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) return null;
  const after = text.slice(start + heading.length + 3);
  const next = after.search(/\n## /);
  return next === -1 ? after : after.slice(0, next);
}

let frameText = null;
let frameReadError = null;
try {
  frameText = readText(framePath);
} catch (error) {
  frameReadError = error.message;
}

function frameFactExists(n) {
  if (frameText === null) return false;
  return new RegExp(`^## ${n}\\.\\s`, "m").test(frameText);
}

if (!fs.existsSync(briefsDir)) {
  console.log(`ok    docket/briefs/ does not exist yet -- nothing to check`);
  process.exit(0);
}

const entries = fs.readdirSync(briefsDir, { withFileTypes: true });
const legacyFiles = fs.existsSync(path.join(briefsDir, "legacy"))
  ? fs
      .readdirSync(path.join(briefsDir, "legacy"), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
  : [];

const briefFiles = entries.filter(
  (e) => e.isFile() && e.name.endsWith(".md") && e.name !== "README.md"
);

const FILENAME_RE = /^loop-([a-z0-9]+)-([a-z0-9-]+)\.md$/;
const DECLARED_RE = /This brief declares\s+\*{0,2}(\d+)\*{0,2}\s+premises?\s+below/i;
// Strict: column 0, "N. " then text -- a plain top-level markdown ordered
// list item. Anything indented or shaped differently is not recognised as a
// premise, the same "narrower recognised set than the true set" risk
// check-frame.mjs's header describes; the completeness check below exists
// precisely so that gap fails loudly instead of silently under-counting.
const STRICT_ITEM_RE = /^(\d+)\.\s+(.+)$/;
// Independent, more permissive scan: up to 3 leading spaces (still a valid
// CommonMark list item), so an accidentally-indented premise is at least
// visible as a mismatch between the two counts rather than invisible to both.
const LOOSE_ITEM_RE = /^\s{0,3}(\d+)\.\s/;
const TAG_RE = /\[(frame:\d+|command:[^\]]+|attested:[^\]]+)\]\s*$/;

let checkedBriefs = 0;
let checkedPremises = 0;
let frameCitations = 0;
let commandCitations = 0;
let attestedCitations = 0;

for (const entry of briefFiles) {
  const file = entry.name;
  const label = `docket/briefs/${file}`;
  const text = readText(path.join(briefsDir, file));

  const nameMatch = file.match(FILENAME_RE);
  if (!nameMatch) {
    fail(label, `filename must be loop-<track>-<slug>.md (branch loop/<track>/<slug> with "/" as "-")`);
    continue;
  }
  const [, trackFromName, slugFromName] = nameMatch;

  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const branchLine = lines[0] || "";
  const trackLine = lines[1] || "";
  const branchMatch = branchLine.match(/^Branch:\s*(\S+)/);
  const trackMatch = trackLine.match(/^Track:\s*(\S+)/);

  if (!branchMatch) {
    fail(label, `first non-blank line must be "Branch: loop/<track>/<slug>", found: ${JSON.stringify(branchLine)}`);
  }
  if (!trackMatch) {
    fail(label, `second non-blank line must be "Track: <track>", found: ${JSON.stringify(trackLine)}`);
  }
  if (branchMatch && trackMatch) {
    const branch = branchMatch[1];
    const track = trackMatch[1];
    const expectedBranch = `loop/${trackFromName}/${slugFromName}`;
    if (branch !== expectedBranch) {
      fail(label, `Branch "${branch}" does not match filename-derived "${expectedBranch}"`);
    }
    if (track !== trackFromName) {
      fail(label, `Track "${track}" does not match the track segment of the filename ("${trackFromName}")`);
    }
    if (!TRACKS.includes(track)) {
      fail(label, `Track "${track}" is not one of: ${TRACKS.join(", ")}`);
    }
  }

  checkedBriefs++;

  const body = sectionBody(text, "Premises");
  if (body === null) {
    fail(label, `missing section: ## Premises -- every factual claim in a brief must carry its source (a FRAME.md fact, a command, or a maintainer attestation)`);
    continue;
  }

  const declaredMatch = body.match(DECLARED_RE);
  if (!declaredMatch) {
    fail(label, `## Premises does not declare its count ("This brief declares N premise(s) below.") -- cannot verify nothing is missing`);
    continue;
  }
  const declaredTotal = Number(declaredMatch[1]);

  const bodyLines = body.split("\n");
  const strictItems = [];
  const looseHits = [];
  bodyLines.forEach((line) => {
    const strict = line.match(STRICT_ITEM_RE);
    if (strict) strictItems.push({ n: Number(strict[1]), text: strict[2] });
    if (LOOSE_ITEM_RE.test(line)) looseHits.push(line);
  });

  if (looseHits.length !== strictItems.length) {
    fail(
      label,
      `completeness: found ${looseHits.length} list-item-shaped line(s) but only recognised ${strictItems.length} as well-formed premises -- an indented or malformed item would be invisible otherwise`
    );
  }

  if (declaredTotal !== looseHits.length) {
    fail(
      label,
      `## Premises declares ${declaredTotal} premise(s), but ${looseHits.length} list item(s) were found`
    );
  }

  const seen = new Set();
  for (const item of strictItems) {
    if (seen.has(item.n)) fail(label, `premise number ${item.n} is used more than once`);
    seen.add(item.n);
  }
  const expected = new Set(Array.from({ length: Math.max(declaredTotal, 0) }, (_, i) => i + 1));
  const missing = [...expected].filter((n) => !seen.has(n));
  const unexpected = [...seen].filter((n) => !expected.has(n));
  if (missing.length > 0 || unexpected.length > 0) {
    fail(
      label,
      `premise numbers do not form {1..${declaredTotal}} -- missing ${JSON.stringify(missing)}, unexpected ${JSON.stringify(unexpected)}`
    );
  }

  for (const item of strictItems) {
    checkedPremises++;
    const tagMatch = item.text.match(TAG_RE);
    if (!tagMatch) {
      fail(label, `premise ${item.n} carries no recognised source tag ([frame:N], [command: ...] or [attested: ...]) at the end of the line`);
      continue;
    }
    const tag = tagMatch[1];
    if (tag.startsWith("frame:")) {
      frameCitations++;
      const n = Number(tag.slice("frame:".length));
      if (frameReadError) {
        fail(label, `premise ${item.n} cites frame:${n}, but FRAME.md could not be read: ${frameReadError}`);
      } else if (!frameFactExists(n)) {
        fail(label, `premise ${item.n} cites frame:${n}, which is not a fact heading ("## ${n}. ") in FRAME.md today`);
      }
    } else if (tag.startsWith("command:")) {
      commandCitations++;
      if (!tag.slice("command:".length).trim()) {
        fail(label, `premise ${item.n} has an empty [command: ] tag`);
      }
    } else if (tag.startsWith("attested:")) {
      attestedCitations++;
      if (!tag.slice("attested:".length).trim()) {
        fail(label, `premise ${item.n} has an empty [attested: ] tag`);
      }
    }
  }
}

console.log(
  `docket/briefs/ check -- ${checkedBriefs} current brief(s), ${legacyFiles.length} legacy brief(s) (exempt, see docket/briefs/README.md)`
);
console.log(
  `${checkedPremises} premise(s) checked: ${frameCitations} cite FRAME.md, ${commandCitations} cite a command, ${attestedCitations} cite an attestation`
);
console.log(
  `honest limit: this verifies each premise DECLARES a source and, for a frame citation, that the fact still exists -- it does not verify a cited command's output actually supports the claim, or that a cited attestation actually happened. See this script's own header.`
);

if (problems.length > 0) {
  console.log();
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} brief problem(s)`);
  process.exit(1);
}

console.log(`\nok    all current briefs declare their premises`);
