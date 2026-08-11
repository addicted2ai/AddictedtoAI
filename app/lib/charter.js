import fs from "fs";
import path from "path";

// CHARTER.md is the boundary of the loop's autonomy, and the site's most
// important claim about itself is that the loop works inside it. Rendering
// the file itself — parsed at build time, the way build-log.js renders
// CHANGELOG.md for /log — is the only form that cannot drift from the
// document it describes. A second, hand-maintained copy would be a charter
// that disagrees with itself.
//
// The file is small and structurally stable: a title, a preamble, prose
// sections, the numbered rules (sections I–V), and the amendment history.
// The parser is asserted against the file in scripts/check-routes.sh: the
// number of rules this renders must equal the number of rule lines in the
// file, so a parser that silently drops a rule fails the build instead of
// quietly publishing a shorter charter.

const RULE_SECTION_RE = /^[IVX]+\.\s/;
const LIST_ITEM_RE = /^(\d+)\.\s+(.+)$/;
const HISTORY_RE = /^- \*\*(\d{4}-\d{2}-\d{2})\*\*\s*(.*)$/;
const SUB_HEADING_RE = /^###\s+(.+)$/;

// The file hard-wraps at about 76 columns. A wrapped line belongs to the
// paragraph above it, so unwrap before the inline-markdown tokeniser sees
// it — otherwise a **bold** span split across two lines parses as two
// paragraphs.
function unwrap(lines) {
  return lines
    .map((l) => l.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// A rule (or history entry) continues across indented lines — including
// blank lines, because rule 16 and the 2026-08-11 amendment both have an
// internal paragraph. Structure those continuation lines into paragraphs
// and `- ` sub-bullets (rule 16's two demo modes).
function structure(lines) {
  const paragraphs = [];
  const bullets = [];
  let para = [];
  let bullet = null;

  const flushPara = () => {
    if (para.length) {
      paragraphs.push(unwrap(para));
      para = [];
    }
  };

  for (const line of lines) {
    if (line === "") {
      if (bullet) bullet = null;
      else flushPara();
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      bullet = { parts: [line.slice(2)] };
      bullets.push(bullet);
      continue;
    }
    if (bullet) {
      bullet.parts.push(line.trim());
      continue;
    }
    para.push(line);
  }
  flushPara();
  return {
    paragraphs,
    bullets: bullets.map((b) => unwrap(b.parts)),
  };
}

// One section's body, turned into blocks. A numbered line inside a rule
// section (sections I–V) is a charter rule; the same shape anywhere else
// (the two tests in "The direction") is an ordinary ordered-list item, and
// the rule-count check deliberately counts only the first kind.
function parseBlocks(lines, ruleSection) {
  const blocks = [];
  let para = [];
  let block = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "paragraph", text: unwrap(para) });
      para = [];
    }
  };

  const closeBlock = () => {
    if (!block) return;
    const { paragraphs, bullets } = structure(block.lines);
    if (block.first) {
      if (paragraphs.length) paragraphs[0] = `${block.first} ${paragraphs[0]}`;
      else paragraphs.push(block.first);
    }
    delete block.first;
    delete block.lines;
    block.paragraphs = paragraphs;
    block.bullets = bullets;
    blocks.push(block);
    block = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    const trimmed = line.trim();

    if (trimmed === "") {
      if (block) block.lines.push("");
      else flushPara();
      continue;
    }
    if (trimmed === "---") {
      closeBlock();
      flushPara();
      blocks.push({ type: "hr" });
      continue;
    }
    const h3 = trimmed.match(SUB_HEADING_RE);
    if (h3) {
      closeBlock();
      flushPara();
      blocks.push({ type: "h3", text: h3[1] });
      continue;
    }
    const history = trimmed.match(HISTORY_RE);
    if (history) {
      closeBlock();
      flushPara();
      block = { type: "history", date: history[1], first: history[2], lines: [] };
      continue;
    }
    const item = trimmed.match(LIST_ITEM_RE);
    if (item) {
      closeBlock();
      flushPara();
      block = {
        type: ruleSection ? "rule" : "list-item",
        number: Number(item[1]),
        first: item[2],
        lines: [],
      };
      continue;
    }
    if (trimmed.startsWith("|")) {
      closeBlock();
      flushPara();
      const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
      blocks.push({ type: "table-row", cells });
      continue;
    }
    if (line.startsWith(" ") || line.startsWith("\t")) {
      if (block) block.lines.push(trimmed);
      else para.push(trimmed);
      continue;
    }
    // A top-level line ends any accumulating block. It is a paragraph line;
    // blank lines are what separate paragraphs, so hard-wrapped continuation
    // lines at column 0 keep accumulating into the same paragraph.
    closeBlock();
    para.push(trimmed);
  }
  closeBlock();
  flushPara();
  return blocks;
}

function parse(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let title = "";
  let preamble = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      if (current) sections.push(current);
      current = { heading: heading[1].trim(), lines: [] };
      continue;
    }
    if (current) {
      current.lines.push(line);
      continue;
    }
    const titleMatch = line.match(/^# (.+)$/);
    if (titleMatch) title = titleMatch[1].trim();
    else preamble.push(line);
  }
  if (current) sections.push(current);

  return {
    title,
    preamble: parseBlocks(preamble, false)
      .filter((b) => b.type === "paragraph")
      .map((b) => b.text),
    sections: sections.map((s) => ({
      heading: s.heading,
      ruleSection: RULE_SECTION_RE.test(s.heading),
      blocks: parseBlocks(s.lines, RULE_SECTION_RE.test(s.heading)),
    })),
  };
}

let cached;

export function getCharter() {
  if (!cached) {
    const file = path.join(process.cwd(), "CHARTER.md");
    cached = parse(fs.readFileSync(file, "utf8"));
  }
  return cached;
}
