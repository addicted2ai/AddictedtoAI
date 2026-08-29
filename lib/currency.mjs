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

/**
 * ---------------------------------------------------------------------------
 * FRONT MATTER IS PROSE TOO (specs/wiki, beads addictedtoai-48r).
 *
 * The body scan above was the whole check, and deltas are almost entirely front
 * matter: only 6 of 29 have a prose body over 40 characters, so the check was
 * VACUOUS ON 23 OF THEM. It is not that anything was rotting — measured, every
 * front-matter currency literal in the corpus sits inside a delta end, and
 * `lib/schema.mjs` REQUIRES an ISO `date` on a delta end, so each is a dated
 * historical claim and correct as written. The exposure was structural: nothing
 * forced a front-matter field to be scanned, or even to be classified.
 *
 * Which fields are author prose is decided in exactly one place —
 * `PROSE_FIELDS` in `lib/schema.mjs`, where a string-valued field in neither
 * list fails the build. This module only applies the same `RULES` to whatever
 * that classification hands it, at the same severity, so the two cannot drift.
 *
 * THE EXEMPTION IS MECHANICAL, NOT A LIST OF BLESSED FIELDS. A hit is dropped
 * when the object DIRECTLY containing the field carries a sibling key whose
 * value is an ISO date: a delta end carries `date`, a blog correction carries
 * `date`, a tool listing carries `last_verified`, and each is displayed with
 * that date, so the value is a record of that date rather than a claim about
 * now. A field with no dated sibling is an undated claim, and is scanned.
 * ---------------------------------------------------------------------------
 */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(v) {
  if (v instanceof Date) return !Number.isNaN(v.getTime());
  return typeof v === 'string' && ISO_DATE_RE.test(v.trim());
}

/** Does the object directly containing this field carry a dated sibling? */
function hasDatedSibling(container, key) {
  if (!container || typeof container !== 'object' || Array.isArray(container)) return false;
  return Object.entries(container).some(([k, v]) => k !== key && isIsoDate(v));
}

/**
 * Resolve one declared path (`capability`, `impossible.what`,
 * `corrections[].text`, `verified_against.*`) to the concrete places it lands.
 */
function resolvePath(root, path) {
  const out = [];
  const walk = (node, segs, prefix) => {
    if (node === null || typeof node !== 'object') return;
    const [seg, ...rest] = segs;
    if (seg === '*') {
      if (Array.isArray(node)) return;
      for (const k of Object.keys(node)) {
        const where = prefix ? `${prefix}.${k}` : k;
        if (rest.length === 0) out.push({ container: node, key: k, field: where });
        else walk(node[k], rest, where);
      }
      return;
    }
    const isArray = seg.endsWith('[]');
    const key = isArray ? seg.slice(0, -2) : seg;
    const at = prefix ? `${prefix}.${key}` : key;
    if (isArray) {
      const arr = node[key];
      if (!Array.isArray(arr)) return;
      arr.forEach((el, i) => {
        if (rest.length === 0) out.push({ container: arr, key: i, field: `${at}[${i}]` });
        else walk(el, rest, `${at}[${i}]`);
      });
      return;
    }
    if (rest.length === 0) out.push({ container: node, key, field: at });
    else walk(node[key], rest, at);
  };
  walk(root, path.split('.'), '');
  return out;
}

/**
 * Apply the body rules to the declared author-prose front-matter fields.
 *
 * `scanned` is returned as well as `hits` and is the half that fixes the actual
 * defect: a check that runs on nothing reports the same clean result as a check
 * that runs on everything, so the count of documents it really ran on is what
 * makes a future vacuum visible on the screen instead of in an audit.
 *
 * @param {object} data     one document's front matter
 * @param {string[]} paths  the author-prose field paths for its type
 * @returns {{hits: {field: string, rule: string, text: string}[], scanned: string[]}}
 */
export function findFrontMatterLiterals(data, paths) {
  const hits = [];
  const scanned = [];
  for (const path of paths ?? []) {
    for (const { container, key, field } of resolvePath(data ?? {}, path)) {
      const value = container[key];
      if (typeof value !== 'string' || value === '') continue;
      if (hasDatedSibling(container, key)) continue;
      scanned.push(field);
      for (const hit of findCurrencyLiterals(value)) hits.push({ field, rule: hit.rule, text: hit.text });
    }
  }
  return { hits, scanned };
}

/**
 * Warn (never fail) for one document — body and front matter alike.
 *
 * Severity matches the body scan deliberately: enforcement of the
 * no-hard-coding rule is the reviewer's named checklist item, and a build that
 * failed here would break every historical rebuild the moment a legitimate
 * quoted price appeared. If that is ever to change it is one severity argument,
 * and the coverage count below is already there to show what it would catch.
 *
 * @returns {{scanned: number}} author-prose fields actually scanned, for the
 *   per-type coverage counts the content build prints.
 */
export function warnCurrencyLiterals(doc, diags, proseFields = []) {
  const say = (field, hit) =>
    diags.warn({
      file: doc.file,
      field,
      message: `hard-coded volatile literal ${JSON.stringify(hit.text)} (${hit.rule}) — state it with a transclusion, {{fact:<kind>/<slug>#<field>}}, so it stays current`,
      rule: 'currency-literal',
    });

  for (const hit of findCurrencyLiterals(doc.body, doc.bodyStartLine)) say(`line ${hit.line}`, hit);
  const front = findFrontMatterLiterals(doc.data, proseFields);
  for (const hit of front.hits) say(hit.field, hit);
  return { scanned: front.scanned.length };
}
