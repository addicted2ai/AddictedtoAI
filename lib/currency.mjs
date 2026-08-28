/**
 * currency.mjs — the currency-literal build warning (task 2.10).
 *
 * specs/wiki: *"the build additionally warns on currency-shaped literals (a
 * number adjacent to `tokens`, `context`, `$`, `/month`, or a version
 * pattern) in prose outside the wiki data layer."* A **warning**, never a
 * failure: enforcement of the no-hard-coding rule is the reviewer's named
 * checklist item, and a build that failed on this would break every
 * historical rebuild the moment a quoted price appeared in a legitimate
 * sentence.
 *
 * "Prose outside the wiki data layer" means every content body, entry bodies
 * included; an entry's front-matter facts *are* the data layer and are not
 * scanned.
 *
 * Regions masked out before scanning, because a literal in them is not a
 * claim the site is making: fenced and inline code, link destinations, HTML
 * comments, and the transclusion markers themselves (whose whole point is
 * that they are not literals). Masking replaces each region with spaces of
 * the same length so reported line numbers stay exact.
 */

const MASKS = [
  /```[\s\S]*?```/g, // fenced code
  /~~~[\s\S]*?~~~/g,
  /`[^`\n]*`/g, // inline code
  /^ {4,}\S.*$/gm, // indented code
  /\]\([^)\s]+(?:\s+"[^"]*")?\)/g, // link destinations
  /<!--[\s\S]*?-->/g, // html comments
  /\{\{[\s\S]*?\}\}/g, // transclusion / want markers
  /<[^>\n]+>/g, // raw html tags and autolinks
];

/** Each rule names itself in the warning, so the author knows what tripped. */
const RULES = [
  { name: 'price', re: /\$\s?\d[\d,]*(?:\.\d+)?/g },
  { name: 'tokens', re: /\b\d[\d,]*(?:\.\d+)?\s*[KkMmBb]?\s*tokens?\b/g },
  { name: 'context', re: /\b\d[\d,]*(?:\.\d+)?\s*[KkMmBb]?\s*context\b/gi },
  { name: 'context', re: /\bcontext(?:\s+window)?(?:\s+of)?\s+\d[\d,]*(?:\.\d+)?\s*[KkMmBb]?\b/gi },
  { name: 'per-month', re: /\b\d[\d,]*(?:\.\d+)?\s*\/\s*(?:month|mo|yr|year)\b/gi },
  { name: 'version', re: /\bv\d+\.\d+(?:\.\d+)?\b/g },
  { name: 'version', re: /\b\d+\.\d+\.\d+\b/g },
  { name: 'version', re: /\b[A-Z][A-Za-z0-9]*\s+v?\d+\.\d+(?:\.\d+)?\b/g },
];

export function maskNonProse(text) {
  let out = text;
  for (const re of MASKS) {
    out = out.replace(re, (m) => m.replace(/[^\n]/g, ' '));
  }
  return out;
}

function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i += 1) {
    if (text[i] === '\n') line += 1;
  }
  return line;
}

/**
 * @param {string} body           the prose body, as written
 * @param {number} bodyStartLine  1-based line of the body within its file
 * @returns {{line: number, rule: string, text: string}[]}
 */
export function findCurrencyLiterals(body, bodyStartLine = 1) {
  const masked = maskNonProse(body);
  const hits = [];
  const seen = new Set();
  for (const { name, re } of RULES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(masked)) !== null) {
      if (m[0].trim() === '') continue;
      const line = bodyStartLine - 1 + lineOf(masked, m.index);
      const key = `${line}:${m.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ line, rule: name, text: body.slice(m.index, m.index + m[0].length).trim() });
    }
  }
  return hits.sort((a, b) => a.line - b.line || a.text.localeCompare(b.text));
}

/** Warn (never fail) for one document. */
export function warnCurrencyLiterals(doc, diags) {
  for (const hit of findCurrencyLiterals(doc.body, doc.bodyStartLine)) {
    diags.warn({
      file: doc.file,
      field: `line ${hit.line}`,
      message: `hard-coded volatile literal ${JSON.stringify(hit.text)} (${hit.rule}) — state it with a transclusion, {{fact:<kind>/<slug>#<field>}}, so it stays current`,
      rule: 'currency-literal',
    });
  }
}
