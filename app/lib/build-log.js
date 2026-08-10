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

const FIELDS = ["Hypothesis", "Change", "Guardrails", "Result"];

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
  const entry = { intro: "", changes: [], notes: [], guardrails: "", result: "" };

  let current = null; // the numbered change block we're inside, if any
  let bullet = null; // { field, lines }
  let paragraph = [];

  const flushBullet = () => {
    if (!bullet) return;
    const text = unwrap(bullet.lines);
    const target = current || entry;
    if (bullet.field === "Guardrails") entry.guardrails = text;
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
    return {
      id: `round-${sections.length - index}`,
      // Newest first in the file, so the last section is round 1.
      number: sections.length - index,
      date,
      unreleased: /unreleased/i.test(date),
      prs: [...new Set(prs)],
      ...parsed,
    };
  });
}

let cached;

export function getBuildLog() {
  if (!cached) {
    const file = path.join(process.cwd(), "CHANGELOG.md");
    cached = parse(fs.readFileSync(file, "utf8"));
  }
  return cached;
}

export function getBuildLogStats() {
  const entries = getBuildLog();
  const changes = entries.reduce((n, e) => n + e.changes.length, 0);
  const prs = new Set(entries.flatMap((e) => e.prs));
  const measured = entries.filter((e) =>
    /measured|verified/i.test(e.guardrails || "")
  ).length;
  return {
    rounds: entries.length,
    changes,
    prs: prs.size,
    measured,
  };
}
