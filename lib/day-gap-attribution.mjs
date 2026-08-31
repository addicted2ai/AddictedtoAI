/**
 * day-gap-attribution.mjs — the entity-pair day-gap build check
 * (beads addictedtoai-9sy, from the defect the addictedtoai-flh recheck wave
 * found: a reviewer who re-derives from the author's evidence transcript
 * reproduces the author's error, not the source).
 *
 * THE DEFECT, precisely. `content/blog/same-catalog-same-day.md` said
 * `openai/gpt-4` and `openai/gpt-4.1-nano` were "501 days apart". The
 * endpoint's own `created` fields put them 687 calendar days apart; 501 was
 * the AGE OF THE NEWER ROW on the post's own date — a true number about
 * something else. The evidence transcript backing the review,
 * `data/reviews/evidence/post-same-catalog-same-day.md`, was itself entirely
 * correct: the author's `days.mjs` printed five lines, every one true,
 * including `2025-04-14 -> 2026-08-28 : 501 days`. The post picked the wrong
 * line, and the round-one reviewer — who wrote "I fetched it myself today and
 * re-derived every table and number WITH MY OWN SCRIPT rather than reading
 * the author's" — computed the SAME five pairs from the author's transcript
 * and never computed gpt-4 -> gpt-4.1-nano at all. A reviewer asking "does
 * 501 appear in the evidence?" gets a hit and moves on, no matter how
 * independently the arithmetic around it was redone.
 *
 * WHY THIS IS A BUILD CHECK AND NOT A REVIEWER INSTRUCTION. The beads issue
 * that produced this module is explicit that a "re-derive from raw sources"
 * instruction already exists (memory `verify-from-raw-not-from-reports`) and
 * did not prevent the defect — the round-one reviewer believed it was
 * following exactly that instruction. Two weaker mechanisms were considered
 * and rejected rather than built:
 *
 *  1. Require the verdict record to name the raw source field a numeric claim
 *     was derived from (endpoint, path, entity id), and refuse a record that
 *     cites only the evidence file. Rejected: this checks that a CITATION
 *     FORMAT is present, never that the citation is CORRECT. A reviewer can
 *     write "derived from the `created` field of both rows" while still
 *     computing the wrong quantity from them — the round-one review's own
 *     prose already reads as exactly this kind of confident, wrong citation
 *     ("I fetched it myself... re-derived every table and number"). It is a
 *     stronger INSTRUCTION, not a mechanism, and this repository's own rule
 *     is that a guardrail is a mechanism or it is not a guardrail.
 *  2. Make the evidence file format record which line a claim used. Rejected
 *     for the identical reason: it formalises the mistake rather than
 *     catching it. Tagging "the post's 501 uses evidence line 3" does not
 *     stop line 3 from answering a different question than the sentence
 *     asks; it only makes the wrong tag look mechanical.
 *
 * What both share is that they still trust a MODEL's claim about what it
 * checked. This module trusts nothing a model wrote: it re-derives the one
 * quantity in question directly from the catalog feed's raw `created` field
 * for the two entities the sentence itself names, independent of any
 * evidence file, any transcript, and any reviewer's arithmetic. That is
 * option (3) from the issue — "a figure in prose is bound to something
 * recomputable" — applied the same way `price-attribution.mjs` and
 * `snapshot-census.mjs` already apply it: find the claim shape in prose by
 * pattern, recompute the true value from the data layer, fail on mismatch.
 *
 * SCOPE, STATED RATHER THAN IMPLIED. This catches exactly one claim shape:
 * two OpenRouter catalog row ids, each in inline code, named within roughly
 * one sentence of each other, followed shortly by "N days apart". It does
 * not generalise to every numeric claim in prose — ratios, percentages, a
 * single row's age relative to a snapshot date, or a day-count phrased any
 * other way ("N days after", "N days since", "a gap of N days") all fall
 * outside it, and so does the shape the ORIGINAL post also used at its own
 * opening ("1,161 days apart" following a fenced code block that names the
 * two rows in plain text, not inline code, several lines above the claim) —
 * catching that needs cross-paragraph antecedent tracking, which
 * `snapshot-census.mjs`'s own header already declines for the same reason.
 * Building a fully general "every number in prose is mechanically
 * recomputed" checker is unbounded — arbitrary arithmetic over an arbitrary
 * source — and this repository's own convention (see price-attribution.mjs's
 * `addictedtoai-58o` reservation) is to scope a check to a measured, real
 * claim shape and name what is left, not to approximate the general case.
 * The residue is filed as its own issue rather than left unstated — see the
 * beads id named at the end of this header.
 *
 * WHAT IT ENFORCES. A sentence naming two catalog row ids in inline code and
 * claiming they are "N days apart" is checked against BOTH rows' `created`
 * fields in `data/derived/feed-rows.json`'s `openrouter-models` source (the
 * one join the rest of the build already trusts for what a row's raw fields
 * are — see snapshot-census.mjs's header for why this is read from there and
 * not from `data/sources/*.json` directly). The day count is the CALENDAR
 * date difference, matching the convention the corpus's own recheck settled
 * on (`687`, not the raw-timestamp `687.72` rounded to `688`) and that every
 * other day count in the historical post used.
 *
 * THREE OUTCOMES, not two. Unlike price-attribution's hedge, there is no
 * legitimate way to write a WRONG day count — so a mismatch is always an
 * error, with no forgiving phrase to write instead. But a row named in the
 * sentence may legitimately not be one any wiki entry's `feeds:` maps to
 * `openrouter-models` (see data-layer.mjs's header: `feed-rows.json` holds
 * only rows SOME entry declares, not the full raw snapshot), and that is a
 * DIFFERENT finding from "wrong": the claim cannot be mechanically checked at
 * all, and is reported as such rather than silently passed or wrongly
 * failed.
 *
 * NO DEBT RATCHET, unlike the two precedents. `price-attribution.mjs` and
 * `snapshot-census.mjs` were both introduced onto a non-empty corpus with
 * measured pre-existing violations, so each needed a forgiveness list to
 * avoid breaking the build on day one. `content/blog/` is empty when this
 * module is introduced (the five prior posts were deleted in
 * `bde5a6e`), so there is no existing debt to forgive. If a future violation
 * is found pre-existing rather than newly authored, the ratchet pattern in
 * either sibling module is the one to copy — do not weaken this check to
 * avoid building one.
 *
 * Left named rather than silently absorbed: addictedtoai-tm4a (generalising
 * this check's scope: wiki entries, other day-count phrasings, non-adjacent
 * code spans, the fenced-code-antecedent shape) and addictedtoai-8gm6 (the
 * irreducible residue: verifying that an arbitrary number in prose answers
 * the question its sentence asks is not mechanizable in general and stays a
 * reviewer judgment call outside this claim shape).
 */

/**
 * An OpenRouter-shaped catalog row id: optional `~` (the corpus's "canonical
 * alias, real id differs" prefix), a vendor segment, `/`, a model segment.
 * Deliberately permissive — dots, colons and hyphens all appear in real ids
 * (`gpt-4.1-nano`, `grok-4.20`, `deepseek-v4-flash-latest:free`) — because a
 * candidate that does not resolve against the data layer is simply reported
 * as unverifiable rather than mismatched; the regex's job is to find
 * CANDIDATES, and the data layer is what decides whether one is real.
 */
export const CATALOG_ID_SRC = String.raw`~?[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*`;

/**
 * `` `id1` ... `id2` ... N days apart ``. Both gaps are capped and
 * backtick-free so the pattern cannot walk across an unrelated code span
 * looking for the next id — the second id must be the very next
 * backtick-delimited span after the first, which is the real corpus's own
 * shape ("`openai/gpt-4`](...) and\n[`openai/gpt-4.1-nano`](...), 501 days").
 * Both gaps are lazy rather than digit-excluding: a model id itself contains
 * digits ("gpt-4.1-nano"), and the markdown link destination between a
 * closing backtick and the claimed number (`](https://openrouter.ai/...), `)
 * can run past a small fixed budget, so this leans on ordinary leftmost-first
 * backtracking to land on the digit run actually followed by "days apart"
 * rather than trying to exclude digits from the gap by character class —
 * measured wrong on the real corpus text first (see the test suite's
 * regression case): a `[^`\d]` gap could not cross the "4.1" inside
 * `gpt-4.1-nano`'s own URL, so it never reached "501" at all.
 */
export const DAY_GAP_RE = new RegExp(
  '`(' +
    CATALOG_ID_SRC +
    ')`' +
    '[^`]{0,160}?' +
    '`(' +
    CATALOG_ID_SRC +
    ')`' +
    '[^`]{0,160}?' +
    '(\\d[\\d,]*)\\s+days?\\s+apart',
  'gi',
);

/**
 * Regions blanked before scanning, matched against the ORIGINAL text — the
 * two sibling modules both learned the hard way that cascading masks eat
 * whole sentences, so this follows their rule even though this module only
 * masks two of their six regions. Inline code and link destinations are
 * DELIBERATELY NOT masked: the ids this check needs to find live inside them.
 */
const MASKS = [
  /```[\s\S]*?```/g, // fenced code
  /~~~[\s\S]*?~~~/g,
  /^ {4,}\S.*$/gm, // indented code
  /<!--[\s\S]*?-->/g, // html comments
];

/** Blank everything that is not author prose, preserving offsets. */
export function maskForDayGap(text) {
  const chars = text.split('');
  for (const re of MASKS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i += 1) {
        if (chars[i] !== '\n') chars[i] = ' ';
      }
      if (m[0].length === 0) re.lastIndex += 1;
    }
  }
  return chars.join('');
}

function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i += 1) {
    if (text[i] === '\n') line += 1;
  }
  return line;
}

/**
 * The sentence containing an offset, copied from `price-attribution.mjs`
 * rather than imported — each check module in this family is self-contained
 * (see snapshot-census.mjs, which does the same for `sectionAround` instead
 * of importing price-attribution.mjs's), so neither can break the other by
 * changing its own masking. The corpus is hard-wrapped, so a single newline
 * is not a sentence break; a blank line is.
 */
export function sentenceAround(body, index) {
  let ps = body.lastIndexOf('\n\n', index);
  ps = ps === -1 ? 0 : ps + 2;
  let pe = body.indexOf('\n\n', index);
  pe = pe === -1 ? body.length : pe;
  const para = body.slice(ps, pe);
  const rel = index - ps;
  const BOUND = /[.!?](?=\s|$)/g;
  let s = 0;
  let e = para.length;
  BOUND.lastIndex = 0;
  let m;
  while ((m = BOUND.exec(para)) !== null) {
    if (m.index < rel) s = m.index + 1;
    else {
      e = m.index + 1;
      break;
    }
  }
  return { text: para.slice(s, e), start: ps + s };
}

/**
 * Calendar-date difference in whole days, UTC, truncating time-of-day before
 * differencing. This is the corpus's own established convention, confirmed
 * by the recheck that found the original defect: `openai/gpt-4` (created
 * 1685232000 = 2023-05-28T00:00:00Z) to `openai/gpt-4.1-nano` (created
 * 1744651369 = 2025-04-14T17:22:49Z) is **687** calendar days, not the 687.72
 * the raw timestamps differ by (which would round to 688) — and the recheck
 * verified the calendar convention against the post's other three day counts
 * before settling on it. `epochA`/`epochB` are Unix seconds, the feed's
 * native `created` unit.
 */
export function daysBetween(epochA, epochB) {
  const a = new Date(epochA * 1000);
  const b = new Date(epochB * 1000);
  const ua = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const ub = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round(Math.abs(ub - ua) / 86400000);
}

/**
 * The full scan, mirroring `scanSnapshotCensus`'s `{scanned, hits}` split:
 * `scanned` is every day-gap claim examined (the coverage denominator), and
 * `hits` is only what needs attention.
 *
 * @param {string} body               the prose body, as written
 * @param {number} bodyStartLine      1-based line of the body within its file
 * @param {(id: string) => object|null} lookupRow  resolves a catalog row id
 *   to its raw feed row (must carry a numeric `created`), or null if the data
 *   layer has no row for that id
 * @returns {{scanned: number, hits: {line: number, id1: string, id2: string,
 *   claimedDays: number, status: 'mismatched'|'unverifiable',
 *   actualDays?: number, missingId?: string, sentence: string}[]}}
 */
export function scanDayGapClaims(body, bodyStartLine = 1, lookupRow = () => null) {
  const masked = maskForDayGap(body);
  const hits = [];
  let scanned = 0;
  const seen = new Set();
  DAY_GAP_RE.lastIndex = 0;
  let m;
  while ((m = DAY_GAP_RE.exec(masked)) !== null) {
    const [, id1, id2, numRaw] = m;
    const claimedDays = Number(numRaw.replace(/,/g, ''));
    const line = bodyStartLine - 1 + lineOf(body, m.index);
    const key = `${line}:${id1}:${id2}:${claimedDays}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scanned += 1;

    const sentence = sentenceAround(masked, m.index);
    const quoted = body
      .slice(sentence.start, sentence.start + sentence.text.length)
      .trim()
      .replace(/\s+/g, ' ');

    const row1 = lookupRow(id1);
    const row2 = lookupRow(id2);
    const created1 = typeof row1?.created === 'number' ? row1.created : null;
    const created2 = typeof row2?.created === 'number' ? row2.created : null;
    if (created1 == null || created2 == null) {
      hits.push({
        line,
        id1,
        id2,
        claimedDays,
        status: 'unverifiable',
        missingId: created1 == null ? id1 : id2,
        sentence: quoted,
      });
      continue;
    }
    const actualDays = daysBetween(created1, created2);
    if (actualDays !== claimedDays) {
      hits.push({ line, id1, id2, claimedDays, actualDays, status: 'mismatched', sentence: quoted });
    }
    // actualDays === claimedDays: nothing to flag, still counted in `scanned`.
  }
  return { scanned, hits: hits.sort((a, b) => a.line - b.line) };
}

/** The flagged subset only, mirroring `findSnapshotCensus`'s convenience form. */
export function findDayGapClaims(body, bodyStartLine = 1, lookupRow = () => null) {
  return scanDayGapClaims(body, bodyStartLine, lookupRow).hits;
}

/**
 * Check one document. Only `doc.type === 'post'` is in scope (see the module
 * header's SCOPE section) — every other type reports `scanned: 0` rather
 * than being silently skipped, so the coverage the build prints stays honest
 * about what ran, matching `checkSnapshotCensus`'s convention exactly.
 *
 * @returns {{scanned: number, errors: number, unverifiable: number, keys: string[]}}
 */
export function checkDayGapAttribution(doc, diags, lookupRow = () => null) {
  if (doc?.type !== 'post' || !doc?.hasBody || !doc.body) {
    return { scanned: 0, errors: 0, unverifiable: 0, keys: [] };
  }
  const { scanned, hits } = scanDayGapClaims(doc.body, doc.bodyStartLine ?? 1, lookupRow);
  if (scanned === 0) return { scanned: 0, errors: 0, unverifiable: 0, keys: [] };

  let errors = 0;
  let unverifiable = 0;
  const keys = [];
  for (const hit of hits) {
    const key = `${doc.file}::${hit.id1}:${hit.id2}@${hit.line}`;
    if (hit.status === 'unverifiable') {
      unverifiable += 1;
      keys.push(key);
      diags.warn({
        file: doc.file,
        field: `line ${hit.line}`,
        message:
          `day-gap claim "${hit.sentence}" names \`${hit.missingId}\`, which no wiki entry's ` +
          "feeds: maps to the openrouter-models source, so this check cannot recompute the claim " +
          `from the raw catalog and cannot confirm or refute it. ${hit.claimedDays} days is ` +
          'unverified, not confirmed.',
        rule: 'day-gap-unverifiable',
      });
      continue;
    }
    errors += 1;
    keys.push(key);
    diags.error({
      file: doc.file,
      field: `line ${hit.line}`,
      message:
        `day-gap claim "${hit.sentence}" says ${hit.claimedDays} days, but the catalog feed's own ` +
        `\`created\` field for \`${hit.id1}\` and \`${hit.id2}\` gives ${hit.actualDays} calendar ` +
        `days apart. Recompute from the raw \`created\` field of BOTH rows the sentence names — ` +
        'do not check whether the claimed number merely appears somewhere in an evidence ' +
        'transcript, which is precisely how this defect shipped (beads addictedtoai-9sy): a ' +
        'transcript line can be true of a different question than the one this sentence asks.',
      rule: 'day-gap-attribution',
    });
  }
  return { scanned, errors, unverifiable, keys };
}
