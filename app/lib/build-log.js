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
  "Agent",
];

// How much of a round a human saw before it landed. Three values, because
// two would not describe what actually happens here:
//
//   unsupervised — merged itself, nobody read it first
//   supervised   — a human triggered the run and could veto before merge
//   maintainer   — a human decided what and why; an assistant did the typing
//
// The test is vetoability, not the trigger. prompts/shared/every-run.md and
// the preamble of CHANGELOG.md still gloss unsupervised as "scheduled",
// which round 72 -- the first round to record it -- was not. See
// docket/open/2026-08-11-unsupervised-origin-assumes-scheduled.md.
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
    else if (bullet.field === "Agent") entry.agent = text;
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
    // Code spans are stripped first. An entry that *quotes* a citation is
    // discussing one, not making one -- and the entry describing this very
    // collision quoted `(PR #1)` twice while explaining it, which handed that
    // entry pull request 1 as its own and duplicated the scout round's anchor.
    //
    // This is the second time the record's habit of writing about its own
    // markup has broken a parser that reads the whole body: check-routes.sh
    // carries the same note about round 30, whose write-up quotes "/pull/1"
    // while explaining that the URL 404s. Anything scanning entry prose for a
    // pattern the record also discusses needs to exclude quotation.
    const prs = [
      ...body.replace(/`[^`]*`/g, "").matchAll(/\(PR #(\d+)\)/g),
    ].map((m) => Number(m[1]));
    const declared = parsed.origin.trim().toLowerCase();
    // How many change headings the entry *starts*, regardless of whether they
    // parsed. The heading regex requires `**N. Title**` to close on one line,
    // and everything else in this file hard-wraps at about 76 columns -- so a
    // long title wraps, silently becomes note text, and the round quietly
    // ships with fewer changes than it describes. validateEntries cannot see
    // it, because it only checks that the changes which *did* parse are
    // complete. Counted here so the mismatch can be made loud.
    const headingsStarted = (body.match(/^\*\*\d+\./gm) || []).length;
    return {
      // A positional round number changes whenever a new section is added
      // above it, so a PR number is used for the anchor when there is one.
      //
      // But a bare PR number stopped being unique the moment this repository
      // restarted numbering at 1: archived round 1 and the first round shipped
      // here both cite `(PR #1)`, and both wanted the anchor `round-pr-1`. Two
      // rounds then share a permalink, and a citation silently resolves to
      // whichever the browser reaches first.
      //
      // Archived rounds are marked instead of the current ones, so that
      // `round-pr-N` goes on meaning "pull request N in this repository" --
      // which is what anyone constructing a link by hand would assume.
      id: prs.length
        ? `round-${declared ? "" : "archived-"}pr-${prs[0]}`
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
      headingsStarted,
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

  // A change heading that started but did not parse was absorbed as prose and
  // the round lost a change without anything saying so. PR #48 set out to make
  // "a quiet incomplete public record" an actionable failure; this is the same
  // defect one level up, and it survived that round because the validation
  // only inspected changes that had already parsed.
  // Compared against *named* changes, not all of them. A failed heading leaves
  // its Hypothesis and Change bullets at entry level, where the normalisation
  // for pre-heading entries folds them into a single unnamed change -- so the
  // total still matched and the first version of this check passed on exactly
  // the input it was written for.
  const lostChanges = entries.filter(
    (entry) =>
      entry.headingsStarted > 0 &&
      entry.headingsStarted !== entry.changes.filter((c) => c.title).length
  );
  if (lostChanges.length > 0) {
    const labels = lostChanges.map(
      (entry) =>
        `round ${entry.number} (${entry.headingsStarted} heading(s) written, ` +
        `${entry.changes.filter((c) => c.title).length} parsed)`
    );
    throw new Error(
      `CHANGELOG.md has change headings that did not parse: ${labels.join(", ")}. ` +
        `A '**N. Title**' heading must open and close on one line.`
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

// The log is rendered across three pages because one page cannot hold it.
// /log carried every round in full and crossed the 150,000-byte document
// budget in lighthouserc.json at 71 rounds — measured at 153,532 bytes
// gzipped, against a 3,976-byte homepage. Nothing was wasted: a previous
// round had already stopped the search from shipping the prose twice. The
// page was simply the whole record.
//
// Round 70 split it once, on `declaredOrigin`: the rounds predating the
// Origin field are exactly the 47 from the private predecessor repository,
// they are closed, and their count cannot grow. That era is /log/archive.
// It bought a quarter of the headroom it appeared to — measured in
// docket/open/2026-08-11-log-budget-returns-in-eight-rounds.md, /log was
// at 145,412 bytes by round 83 and one entry took it over the ceiling the
// next round. There is no second Origin seam: every round since 47 declares
// one.
//
// Round 84 freezes a second era instead: the first rounds built in this
// repository, numbers 48..EARLY_ERA_END, move to /log/early the same way
// the predecessor rounds moved to /log/archive — full entry there, stub on
// /log carrying the same anchor. The boundary is a round number so it is
// closed forever. A round's page is decided once at the boundary; rounds
// above it stay on /log as the log grows and their anchors never move
// again. Splitting on a count would be different — "the newest N per page"
// would move a round's anchor every time the log grew, so citations would
// rot continuously instead of once. Round numbers are positional, but they
// only shift if an entry is inserted *between* existing ones, which the
// append-only record (rule 5) never does.
//
// Every moved round keeps its anchor on /log as a stub linking to its full
// entry, so no published citation breaks. See app/log/page.js.
export const EARLY_ERA_END = 70;

export function getCurrentLog() {
  return getBuildLog().filter(
    (entry) => entry.declaredOrigin && entry.number > EARLY_ERA_END
  );
}

export function getEarlyEraLog() {
  return getBuildLog().filter(
    (entry) => entry.declaredOrigin && entry.number <= EARLY_ERA_END
  );
}

export function getArchivedLog() {
  return getBuildLog().filter((entry) => !entry.declaredOrigin);
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
//
// `scope` exists because the record is rendered across three pages and the
// count is published as a link. A figure counted over the whole record
// while pointing at one page is a number a reader disproves by clicking
// it — which is what the homepage did between round 70 (the split) and
// round 74 (the audit that measured it): "28 rounds say wrong" opened a
// page reporting 15. Count what the destination shows.
//
//   "all"     — the whole record, all three pages
//   "log"     — the rounds rendered on /log
//   "early"   — the rounds rendered on /log/early
//   "archive" — the rounds rendered on /log/archive
const SCOPES = {
  all: getBuildLog,
  log: getCurrentLog,
  early: getEarlyEraLog,
  archive: getArchivedLog,
};

export function countMentioning(term, scope = "all") {
  const select = SCOPES[scope];
  if (!select) {
    throw new Error(
      `countMentioning: unknown scope "${scope}". Expected one of: ${Object.keys(
        SCOPES
      ).join(", ")}`
    );
  }
  const needle = term.toLowerCase();
  return select().filter((entry) => entryText(entry).includes(needle)).length;
}
