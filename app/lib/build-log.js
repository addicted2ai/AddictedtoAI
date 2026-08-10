import fs from "fs";
import path from "path";

// CHANGELOG.md is the loop's memory and the only record of why anything
// on this site exists. Parsing it at build time — rather than keeping a
// second, hand-maintained copy for the website — is the whole point:
// the page can't drift from the record, because it *is* the record.
//
// The format has drifted over 30 rounds (single-change entries early on,
// bundled `**N. Title**` entries later), so this parser handles both and
// is asserted against known counts in scripts/check-routes.sh. If a
// future entry is written in a shape this doesn't understand, the counts
// move and CI says so.

const FIELDS = [
  "Hypothesis",
  "Change",
  "Guardrails",
  "Result",
  "Origin",
  "Track",
];

// How much of a round a human saw before it landed. Three values, because
// two would not describe what actually happens here:
//
//   unsupervised — scheduled, merged itself, nobody read it first
//   supervised   — a human triggered the run and could veto before merge
//   maintainer   — a human decided what and why; an assistant did the typing
//
// Rounds 1-47 predate this field. They were all supervised: every one was
// hand-triggered locally. Rather than edit 47 past entries to say so --
// which is exactly the retroactive amendment CHARTER.md rule 5 forbids --
// an absent Origin means "supervised, and predates the field". A round
// written from here on must say. scripts/check-routes.sh asserts the number
// of entries without one never grows, so a future round that forgets fails
// the build instead of quietly claiming to be legacy.
const LEGACY_ORIGIN = "supervised";
const ORIGINS = ["unsupervised", "supervised", "maintainer"];

function fieldOf(text) {
  for (const name of FIELDS) {
    if (text.startsWith(`${name}:`) || text.startsWith(`${name} (`)) {
      const colon = text.indexOf(":");
      return { name, value: text.slice(colon + 1).trim() };
    }
  }
  return null;
}

// Collapse a bullet's hard-wrapped lines back into one paragraph. The
// trailing "(PR #N)" is stripped because the page renders those numbers
// as links in the entry header, where they're more useful.
function unwrap(lines) {
  return lines
    .map((l) => l.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s*\(PR #\d+\)/g, "")
    .trim();
}

function parseBody(body) {
  const lines = body.split("\n");
  const entry = {
    intro: "",
    changes: [],
    notes: [],
    guardrails: "",
    result: "",
    origin: "",
    // Which track produced this round. Read by scripts/dispatch.mjs to hold
    // tracks to their quotas -- notably meta's cap, which needs to know how
    // much recent *shipped* work was meta. Absent on rounds that predate the
    // tracks, and deliberately not rendered on /log yet: getBuildLog folds
    // origin into the text the search matches on, and a field counted at
    // build time but never rendered would split the homepage's figures from
    // the search box's. Rendering it is a docket item.
    track: "",
  };

  let current = null; // the numbered change block we're inside, if any
  let bullet = null; // { field, lines }
  let paragraph = [];

  const flushBullet = () => {
    if (!bullet) return;
    const text = unwrap(bullet.lines);
    const target = current || entry;
    if (bullet.field === "Guardrails") entry.guardrails = text;
    else if (bullet.field === "Origin") entry.origin = text;
    else if (bullet.field === "Track") entry.track = text;
    else if (bullet.field === "Result") entry.result = text;
    else if (bullet.field === "Hypothesis") target.hypothesis = text;
    else if (bullet.field === "Change") target.change = text;
    else (target.notes || (target.notes = [])).push(text);
    bullet = null;
  };

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = unwrap(paragraph);
    if (text) {
      if (!current && !entry.intro && entry.changes.length === 0) entry.intro = text;
      else (current ? current.notes : entry.notes).push(text);
    }
    paragraph = [];
  };

  for (const line of lines) {
    const heading = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*$/);
    if (heading) {
      flushBullet();
      flushParagraph();
      current = { title: heading[2].trim(), notes: [] };
      entry.changes.push(current);
      continue;
    }

    if (/^- /.test(line)) {
      flushBullet();
      flushParagraph();
      const text = line.slice(2);
      const field = fieldOf(text);
      bullet = {
        field: field ? field.name : null,
        lines: [field ? field.value : text],
      };
      continue;
    }

    if (bullet && /^\s+\S/.test(line)) {
      bullet.lines.push(line);
      continue;
    }

    if (line.trim() === "") {
      flushBullet();
      flushParagraph();
      continue;
    }

    flushBullet();
    paragraph.push(line);
  }
  flushBullet();
  flushParagraph();

  // Early entries have no `**N.**` blocks — their fields sit at entry
  // level. Normalise those into a single unnamed change.
  if (entry.changes.length === 0 && (entry.hypothesis || entry.change)) {
    entry.changes.push({
      title: null,
      hypothesis: entry.hypothesis,
      change: entry.change,
      notes: entry.notes,
    });
    entry.notes = [];
  }
  delete entry.hypothesis;
  delete entry.change;

  return entry;
}

function parse(markdown) {
  // Drop the trailing template comment so its placeholder entry doesn't
  // parse as a real round.
  const withoutComments = markdown.replace(/<!--[\s\S]*?-->/g, "");
  const logStart = withoutComments.indexOf("\n## Log");
  const log = logStart === -1 ? withoutComments : withoutComments.slice(logStart);

  const sections = log.split(/\n### /).slice(1);

  return sections.map((section, index) => {
    const newline = section.indexOf("\n");
    const date = section.slice(0, newline).trim();
    const body = section.slice(newline + 1);
    const parsed = parseBody(body);
    const prs = [...body.matchAll(/\(PR #(\d+)\)/g)].map((m) => Number(m[1]));
    const declared = parsed.origin.trim().toLowerCase();
    return {
      // A positional round number changes whenever a new section is added
      // above it. PR numbers are permanent, so use one for the anchor when
      // available and keep the positional fallback only for old entries with
      // no PR reference.
      id: prs.length
        ? `round-pr-${prs[0]}`
        : `round-${sections.length - index}`,
      // Newest first in the file, so the last section is round 1.
      number: sections.length - index,
      date,
      unreleased: /unreleased/i.test(date),
      prs: [...new Set(prs)],
      ...parsed,
      // Kept separate from `origin` so the count of rounds that predate the
      // field stays checkable. Without it, a legacy round and a round that
      // forgot to say are indistinguishable.
      declaredOrigin: declared !== "",
      origin: declared || LEGACY_ORIGIN,
    };
  });
}

let cached;

function validateEntries(entries) {
  const incomplete = entries.filter(
    (entry) =>
      entry.changes.length === 0 ||
      entry.changes.some((change) => !change.hypothesis || !change.change) ||
      !entry.guardrails ||
      !entry.result
  );

  if (incomplete.length > 0) {
    const labels = incomplete.map((entry) =>
      entry.prs[0] ? `PR #${entry.prs[0]}` : `round ${entry.number}`
    );
    throw new Error(
      `CHANGELOG.md contains incomplete build-log entries: ${labels.join(", ")}`
    );
  }

  // A declared Origin has to be one of the three. A typo would otherwise
  // become a fourth category on the site, silently, and the counts the
  // homepage publishes would stop adding up.
  const badOrigin = entries.filter(
    (entry) => entry.declaredOrigin && !ORIGINS.includes(entry.origin)
  );
  if (badOrigin.length > 0) {
    const labels = badOrigin.map(
      (entry) => `round ${entry.number} ("${entry.origin}")`
    );
    throw new Error(
      `CHANGELOG.md declares unknown Origin values: ${labels.join(", ")}. ` +
        `Expected one of: ${ORIGINS.join(", ")}`
    );
  }
}

export function getBuildLog() {
  if (!cached) {
    const file = path.join(process.cwd(), "CHANGELOG.md");
    cached = parse(fs.readFileSync(file, "utf8"));
    validateEntries(cached);
  }
  return cached;
}

// Look a round up by pull request number rather than by round number:
// PR numbers are permanent, whereas anything positional would quietly
// point at a different round as entries are added.
export function getRoundByPr(pr) {
  return getBuildLog().find((entry) => entry.prs.includes(pr)) || null;
}

export function getBuildLogStats() {
  const entries = getBuildLog();
  const changes = entries.reduce((n, e) => n + e.changes.length, 0);
  const prs = new Set(entries.flatMap((e) => e.prs));

  const byOrigin = Object.fromEntries(ORIGINS.map((name) => [name, 0]));
  for (const entry of entries) byOrigin[entry.origin] += 1;

  return {
    rounds: entries.length,
    changes,
    prs: prs.size,
    byOrigin,
    // Rounds that state their own origin rather than inheriting the legacy
    // default. Published so the "N ran unattended" figure can be read
    // against how many rounds were in a position to say.
    declaredOrigins: entries.filter((entry) => entry.declaredOrigin).length,
  };
}

// The newest entry may be Unreleased while a PR is in flight. The first
// dated entry is therefore the newest date we can substantiate, and it is
// the value public freshness metadata should use rather than the current
// clock or a hand-maintained copy elsewhere.
export function getLatestBuildLogDate() {
  return (
    getBuildLog().find((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date))
      ?.date || null
  );
}

// The plain text of one entry, in the order the page renders it — the
// same string the client-side search on /log matches against. Kept here
// so a count computed at build time and a count produced by typing into
// the search box cannot disagree; scripts/check-routes.sh asserts they
// don't.
//
// Markdown tokens are stripped because `inlineMarkdown` turns them into
// elements: the DOM has `next build`, the raw changelog has backticks
// around it.
function entryText(entry) {
  const parts = [
    `Round ${entry.number}`,
    entry.unreleased ? "Unreleased" : entry.date,
    // Rendered as a visible badge on /log. It has to be in here too, or the
    // count the homepage computes at build time and the count the search box
    // computes from the DOM would disagree -- which check-routes.sh asserts
    // they don't.
    entry.origin,
    ...entry.prs.map((pr) => `#${pr}`),
  ];
  if (entry.intro) parts.push(entry.intro);
  for (const change of entry.changes) {
    if (change.title) parts.push(change.title);
    if (change.hypothesis) parts.push("Hypothesis", change.hypothesis);
    if (change.change) parts.push("Change", change.change);
    parts.push(...(change.notes || []));
  }
  parts.push(...entry.notes);
  if (entry.guardrails) parts.push("Guardrails", entry.guardrails);
  if (entry.result) parts.push("Result", entry.result);
  return parts.join(" ").replace(/[`*]/g, "").toLowerCase();
}

// RSS descriptions are plain text, not a second Markdown renderer. Strip
// the small inline syntax the changelog supports so feed readers do not show
// code ticks or emphasis markers as part of a round summary.
export function stripInlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g, "$1$2$3")
    .replace(/\s+/g, " ")
    .trim();
}

// How many rounds mention a word. Deliberately a text count and nothing
// more: it says "these entries contain this word", not "these rounds
// were mistakes". Classifying rounds would mean running a keyword
// heuristic over prose and publishing whatever it decided, which is the
// opposite of what this site asks a reader to do.
export function countMentioning(term) {
  const needle = term.toLowerCase();
  return getBuildLog().filter((entry) => entryText(entry).includes(needle))
    .length;
}
