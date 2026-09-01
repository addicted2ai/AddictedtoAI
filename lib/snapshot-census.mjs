/**
 * snapshot-census.mjs — the snapshot-anchored census build check
 * (beads addictedtoai-7q8, from the defect addictedtoai-sdh's review of
 * addictedtoai-7q8's own repair found: a census over an advancing feed typed
 * into prose).
 *
 * THE DEFECT, precisely. `data/sources/openrouter-models/latest.json` is the
 * corpus's one live catalog snapshot, and every `{{fact:...}}` transclusion
 * on a wiki page renders from it — always the CURRENT one, never the one
 * standing when a sentence was written. A census over that catalog — "the
 * 388 rows in that snapshot", "thirteen of its fifteen rows", "the only
 * batch row in the snapshot dearer than the row it batches" — is a fact
 * about a SPECIFIC day's fetch, typed into prose as English words rather than
 * bound to anything the build can re-check. Measured on this corpus: the
 * count of `:batch` rows priced above the row they batch on both input and
 * output was **1** in the 388-row snapshot of 2026-08-28 and **10** the very
 * next day, in a 396-row snapshot. A superlative that was true when written
 * became false in ONE DAY, and a Desk job merged a NEW instance of the same
 * shape on the day this check was written — the class is actively
 * reproducing, not merely historical.
 *
 * THE RULE, and why it has two parts rather than one. A census claim in this
 * corpus takes one of two shapes, and each rots a different way:
 *
 *   UNDATED   "ninety-one of the 388 rows carry the router's `is_moderated`
 *             flag" — no snapshot date anywhere near it. This is what
 *             addictedtoai-7q8's own triage called "already unfalsifiable":
 *             a reader has no way to tell whether it was ever true, let
 *             alone whether it still is. Always an error; there is no
 *             legitimate undated form, because nothing anchors it.
 *   DATED     "the snapshot of 28 August 2026" — anchored, and CAN be
 *             legitimate (this corpus already has an established, working
 *             convention for it: "as observed on 28 August 2026 ... the
 *             catalog is what it is, dated", see openai.md and
 *             openai-gpt-5-6-luna.md). What makes a dated claim legitimate
 *             or not is not decidable by a regex reading tone — but WHETHER
 *             THE NAMED DATE IS THE SNAPSHOT THE PAGE'S OWN TRANSCLUSIONS
 *             ACTUALLY RENDER FROM is. That is option (c) from the issue,
 *             chosen over (a) a new derived-fact shape and (b) forbidding
 *             the pattern outright, because it is the one buildable today
 *             with no OpenSpec change: `dataLayer.source('openrouter-models')
 *             .snapshot_date` is exactly "the snapshot the transclusions on
 *             this page render from", already computed by the freshness
 *             pipeline for the "last checked" label. A prose date that
 *             matches it is asserting something the build can verify
 *             instantly; one that does not is asserting something ALREADY
 *             false, because the transclusions two lines below it render
 *             from a different day's fetch.
 *
 * This means a dated claim that is accurate today WILL start failing the
 * day the snapshot advances past it — unless its author has explicitly said
 * the claim is allowed to age. That last clause is the HEDGE BRANCH, and it
 * is the repair this module promised for three days before it existed.
 *
 * THE HEDGE BRANCH (beads addictedtoai-jqif, urgent because of
 * addictedtoai-pxx1). The error message below has always told authors there
 * were two repairs — re-date the claim, "or use the corpus's established
 * hedge for a claim that is allowed to age ('as observed on DATE ...')" —
 * and the second one did not exist. `scanSnapshotCensus`'s whole verdict was
 * `undated` or `mismatched`; nothing inspected the wording around the date,
 * so an author who followed the advice literally got the same error back,
 * with the same advice, forever. Measured 2026-08-31: the bound snapshot
 * advances EVERY morning (four commits of
 * `data/sources/openrouter-models/latest.json`, four consecutive days,
 * rewritten whether or not a catalog row changed), so sixteen correctly
 * anchored census claims across nine wiki pages would have turned the build
 * red at the 06:00 Pulse and kept it red — and the publish step runs after
 * the rebuild, so a red build publishes nothing.
 *
 * WHAT THE BRANCH ACCEPTS, and why it is narrow. A `mismatched` census is
 * accepted only when ALL of the following hold:
 *
 *   1. it has an anchoring date at all — the branch sits AFTER the `undated`
 *      verdict, so an unanchored census can never reach it;
 *   2. that date is strictly EARLIER than the bound snapshot — a claim dated
 *      after the fetch it is supposed to describe is not an observation, and
 *      gets its own `future` verdict that no marker can clear;
 *   3. the PARAGRAPH containing the census carries the corpus's established
 *      past-observation marker, `as observed on DATE`, naming that same date,
 *      in prose (a marker inside a code span is a value, not authorship).
 *
 * WHERE THE LINE IS DRAWN, stated plainly because it is a judgment call. The
 * marker is `as observed on DATE` and nothing else. In particular "as of the
 * DATE snapshot" and "in the OpenRouter snapshot of DATE" — the phrasings
 * nine wiki pages used until this repair, and the exact shape of the three
 * historical defects this module's own tests pin — are NOT the marker. They
 * scope a claim to a dated fetch; they do not mark it as an observation the
 * author accepts will age, and every one of those sentences reads in the
 * present tense and asserts what the catalog holds. Widening the marker to
 * cover them would have turned the corpus green in one regex and switched
 * this check off everywhere — the same outcome as forgiving all sixteen
 * instances as debt, which addictedtoai-pxx1 forbids for the same reason.
 * The repair for those sixteen was therefore prose: bring the sentence into
 * the promised form, one paragraph at a time, and say `carried` where the
 * claim is about a day rather than about now.
 *
 * The scope is the PARAGRAPH, deliberately narrower than the section the
 * anchor search uses. Most entry bodies in this corpus carry no ATX heading
 * at all, so "section" is the whole page and one marker would license every
 * census on it. A paragraph is also the unit the corpus's own established
 * instance uses: openai.md carries the marker in one sentence and the "the
 * catalog is what it is, dated" coda two sentences later.
 *
 * The coda is rhetoric, not a token this code requires — `openai-gpt-5-5.md`
 * uses the marker without it. Both established instances are dated
 * 28 August 2026 against a 31 August snapshot and already age quietly today,
 * because neither carries a row count for this check to match; the branch
 * only extends to censuses what the corpus already does for comparisons.
 *
 * A hedged claim is COUNTED and reported (`hedged` in the scan result, and on
 * the build's own census line) rather than silently dropped. That is the same
 * vacuum this module's `scanned`/`hits` split exists to close: a branch that
 * quietly swallowed the corpus would make a green build indistinguishable
 * from a check that never ran.
 *
 * THE TWO HARD-WON LESSONS FROM `price-attribution.mjs`, both re-applied
 * rather than re-learned:
 *  - masks are matched against the ORIGINAL text, never cascaded — a leading
 *    inline code span (the single most common sentence shape in this corpus)
 *    must not blank the rest of the line;
 *  - a `{{...}}` marker's own text is a VALUE, not prose, and is blanked
 *    entirely (this check has no reason to keep digits, unlike
 *    price-attribution's price markers, so it follows currency.mjs's simpler
 *    full blank rather than price-attribution's digit-preserving one).
 *
 * SCOPE. Only `doc.type === 'entry'` (wiki pages) is scanned. Tutorials
 * already have their own, separate, working freshness mechanism for exactly
 * this shape of claim — `verified_against` / `verified_on` / `reverify_days`
 * — and `tutorials/openrouter-catalog-watch.md` uses it correctly: its row
 * counts are captured terminal output, explicitly framed "on the day this
 * was written", governed by that machinery rather than this one. Re-running
 * this check over tutorials would fight a mechanism that already works.
 * Blog posts were swept by hand and carry no instances of this shape.
 *
 * WHAT IT DOES NOT CATCH, named because a guardrail's blind spot is part of
 * its specification (see price-attribution.mjs's own such section). A census
 * whose number and its unit are more than three words apart ("Seventeen
 * carry no Hugging Face id", referring back to a count given a sentence
 * earlier) is invisible to a per-sentence scan; so is a superlative with no
 * number at all ("the only Tencent row listing above a dollar"). Both are
 * real shapes this corpus uses and both were checked by hand in the sweep
 * that produced this module; catching them mechanically would mean tracking
 * antecedents across sentences, which is a different and much larger check.
 * A cross-row price/context EQUALITY or RATIO claim ("list the same context
 * window", "three times the input") is also out of scope on purpose — that
 * is addictedtoai-58o's territory (verbless cross-row comparison), not a
 * census, and price-attribution.mjs's header already reserves it.
 */

// "one" and "two" are deliberately ABSENT, measured out rather than assumed
// safe. Every real census this corpus states is three or more; "one"/"two"
// instead reliably introduce something else entirely — "One more thing the
// rows record" (a discourse marker, spacexai.md), "two rows are not obliged
// to be headed by the same provider" and "a gap between two listings and not
// between two prices X set" (price-attribution.mjs's own established hedge
// idiom, reused verbatim across nvidia.md/thinking-machines-lab.md/
// z-ai-glm-5-1.md/anthropic-claude-opus-4-7.md/openai-gpt-5-5.md/
// openai-gpt-5-6-luna.md), "the two rows were added ... within fifteen
// minutes of each other" (anaphoric — referring back to two just-named
// rows, not a total). Run against the real corpus with "one"/"two" included,
// every one of these fired as a false positive; with them excluded, none did
// and every real hit this module's own tests assert still matched.
const ONES = 'three|four|five|six|seven|eight|nine';
const TEENS =
  'ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen';
const TENS = 'twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety';
const NUMBER_WORD_SRC = `(?:${TENS})(?:-(?:${ONES}))?|${TEENS}|${ONES}`;
const NUMBER_SRC = `(?:\\d[\\d,]*|${NUMBER_WORD_SRC})`;
const WORD_SRC = String.raw`[A-Za-z][\w'.-]*`;

/**
 * A row-count census: a number, up to three intervening words, then
 * `row(s)`/`listing(s)`. Three words reaches "ten of NVIDIA's rows" and
 * "fourteen of its sixteen rows" — both real corpus shapes — without
 * reaching across a sentence boundary in ordinary prose.
 *
 * `(?!['’])` after the unit: without it, `\brows?\b` matches the
 * "row" inside "row's" (a word boundary sits at the apostrophe too), so
 * "thirteen days before this row's own {{fact:...}}" — a possessive
 * singular naming ONE specific row, not a count — matched as a census.
 * Measured on the real corpus: openai-gpt-5-6-terra.md had exactly this.
 *
 * `(?<!factor of )` before the number: "a factor of 128 between two rows
 * from one company" (tencent.md) is a RATIO — the 128 counts the factor, not
 * the rows, and "rows" only appears because it is what the ratio is between.
 * Measured on the real corpus, this was the one shape "row(s)/listing(s)
 * immediately after a count" is not itself sufficient for.
 */
export const CENSUS_RE = new RegExp(
  String.raw`(?<!factor of )\b(${NUMBER_SRC})\b(?:\s+${WORD_SRC}){0,3}\s+(rows?|listings?)\b(?!['’])`,
  'gi',
);

/**
 * A number immediately followed by a DURATION noun ("ten weeks", "thirteen
 * days") is counting time, not rows — even when `row(s)`/`listing(s)`
 * legitimately appears a few words later because the sentence is ABOUT that
 * row. "Ten weeks after this row, `z-ai/glm-5.2` arrived" (z-ai-glm-5-1.md)
 * is the real corpus instance this was measured against: "Ten" is not a
 * count of rows at all.
 */
const DURATION_WORD_RE = /^(?:days?|weeks?|months?|years?|hours?|minutes?)$/i;

/** The scope gate: a census is only in-scope beside a mention of the catalog. */
const CATALOG_SCOPE_RE = /\bsnapshot\b|\bcatalog\b/i;
/** Same pattern, `g`-flagged, for locating every occurrence (anchor search). */
const CATALOG_SCOPE_RE_G = /\bsnapshot\b|\bcatalog\b/gi;

const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December';
const LONG_DATE_RE = new RegExp(String.raw`\b(\d{1,2})\s+(${MONTHS})\s+(\d{4})\b`, 'g');
const ISO_DATE_RE = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
const MONTH_INDEX = new Map(
  MONTHS.split('|').map((m, i) => [m, String(i + 1).padStart(2, '0')]),
);

/**
 * ISO back to the corpus's own long form, so the repair advice can print the
 * exact string an author should type rather than a placeholder they have to
 * translate. Both forms parse, but every hedge instance in the corpus is long.
 */
function isoToLongDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return iso;
  const month = MONTHS.split('|')[Number(m[2]) - 1];
  return `${Number(m[3])} ${month} ${m[1]}`;
}

/** Every date-shaped substring in `text`, normalised to ISO, original order. */
function findDates(text) {
  const out = [];
  for (const re of [LONG_DATE_RE, ISO_DATE_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const iso =
        re === LONG_DATE_RE
          ? `${m[3]}-${MONTH_INDEX.get(m[2])}-${m[1].padStart(2, '0')}`
          : `${m[1]}-${m[2]}-${m[3]}`;
      out.push({ index: m.index, iso });
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

/**
 * Regions blanked before scanning, matched against the ORIGINAL text (see
 * the module header — cascading masks silently ate whole sentences the last
 * two times a check in this codebase tried it).
 */
const MASKS = [
  /```[\s\S]*?```/g, // fenced code
  /~~~[\s\S]*?~~~/g,
  /`[^`\n]*`/g, // inline code — this is where row ids live
  /^ {4,}\S.*$/gm, // indented code
  /\]\([^)\s]+(?:\s+"[^"]*")?\)/g, // link destinations
  /<!--[\s\S]*?-->/g, // html comments
  /<[^>\n]+>/g, // raw html tags and autolinks
];

/**
 * Blank everything that is not author prose, preserving offsets. A `{{...}}`
 * marker is blanked entirely (not digit-preserved like price-attribution's):
 * this check has no verb pattern that needs to see a number after it, so
 * there is nothing a marker's digits would ever need to satisfy — and a
 * blanked marker cannot itself supply a false "row count" the way a model
 * id's parameter-count suffix (`nemotron-3-ultra-550b-a55b`) could.
 */
export function maskForCensus(text) {
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
  let out = chars.join('');
  out = out.replace(/\{\{[\s\S]*?\}\}/g, (m) => m.replace(/[^\n]/g, ' '));
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
 * The section containing an offset: from the nearest preceding ATX heading
 * to the next one. Section-wide, matching price-attribution.mjs's
 * `sectionAround` exactly and for the same reason: this corpus states a
 * snapshot's date once and refers back to it ("in that snapshot", "in the
 * same snapshot") several sentences later, so a sentence-local scope would
 * miss the very shape the repaired corpus now uses throughout
 * nvidia.md/z-ai.md/alibaba-cloud.md/mistral-ai.md.
 */
function sectionBounds(body, index) {
  const HEAD = /^#{1,6} .*$/gm;
  let start = 0;
  let end = body.length;
  HEAD.lastIndex = 0;
  let m;
  while ((m = HEAD.exec(body)) !== null) {
    if (m.index <= index) start = m.index;
    else {
      end = m.index;
      break;
    }
  }
  return { start, end };
}

export function sectionAround(body, index) {
  const { start, end } = sectionBounds(body, index);
  return body.slice(start, end);
}

/**
 * The paragraph containing an offset — a blank-line-delimited block. This is
 * the hedge marker's scope, and it is deliberately NOT `sectionBounds`: most
 * entry bodies here have no ATX heading, so a section is the whole page and
 * one marker would license every census on it (see the module header).
 */
function paragraphBounds(body, index) {
  const BREAK = /\r?\n[ \t]*\r?\n/g;
  let start = 0;
  let end = body.length;
  BREAK.lastIndex = 0;
  let m;
  while ((m = BREAK.exec(body)) !== null) {
    const after = m.index + m[0].length;
    if (after <= index) start = after;
    else {
      end = m.index;
      break;
    }
  }
  return { start, end };
}

/**
 * The corpus's established past-observation marker: `as observed on DATE`
 * (org/openai.md, model/openai-gpt-5-5.md). The date must sit IMMEDIATELY
 * after the marker — "as observed on the day the sweep ran, which was
 * 28 August 2026" is a coincidence of wording, not an author invoking the
 * convention, and treating it as the marker is how a pattern starts matching
 * prose nobody wrote deliberately.
 *
 * Call this with MASKED text: a marker quoted in backticks is documentation
 * of the convention, not an author using it.
 *
 * @returns {Set<string>} every ISO date this text marks as observed
 */
function observedDates(maskedText) {
  const MARKER = /\bas\s+observed\s+on\s+/gi;
  const out = new Set();
  MARKER.lastIndex = 0;
  let m;
  while ((m = MARKER.exec(maskedText)) !== null) {
    const after = m.index + m[0].length;
    // The window is locality only, and is deliberately wider than the longest
    // date this corpus writes ("5 September 2026", 16 characters). The RULE is
    // `index === 0` on the next line. Mutation-testing this module caught the
    // first draft doing it the other way round: a 20-character window happened
    // to truncate the year of "or about 28 August 2026" and so rejected it for
    // the wrong reason, which left the real guard untested.
    const found = findDates(maskedText.slice(after, after + 40));
    if (found.length > 0 && found[0].index === 0) out.add(found[0].iso);
  }
  return out;
}

/**
 * The full scan: every in-scope (catalog/snapshot-scoped) census claim, split
 * into `scanned` (the total examined — the coverage denominator, matching
 * price-attribution.mjs's `scanned = (doc.body.match(PRICE_FACT_RE) ??
 * []).length`) and `hits` (only the ones that need attention). Keeping these
 * separate is not cosmetic: an earlier draft of this module counted only
 * flagged hits as "scanned", which made a document with three census claims —
 * two correctly anchored, one not — report `scanned: 1`, indistinguishable
 * from a document that was never examined at all. That is precisely the
 * vacuum `warnCurrencyLiterals`'s own header describes catching on 23 of 29
 * deltas; it was caught here by this module's own test asserting an exact
 * document count rather than "at least one".
 *
 * @param {string} body               the prose body, as written
 * @param {number} bodyStartLine      1-based line of the body within its file
 * @param {string|null} snapshotDate  ISO date of the snapshot the page's own
 *   transclusions render from (`dataLayer.source('openrouter-models')
 *   .snapshot_date`), or null when unknown (pre-first-Pulse-run)
 * @returns {{scanned: number, hedged: number, hits: {line: number,
 *   match: string, kind: 'undated'|'mismatched'|'future',
 *   claimedDate: string|null, sentence: string}[]}}
 */
export function scanSnapshotCensus(body, bodyStartLine = 1, snapshotDate = null) {
  const masked = maskForCensus(body);
  const hits = [];
  let scanned = 0;
  let hedged = 0;
  const seen = new Set();
  CENSUS_RE.lastIndex = 0;
  let m;
  while ((m = CENSUS_RE.exec(masked)) !== null) {
    const matchText = body.slice(m.index, m.index + m[0].length).trim().replace(/\s+/g, ' ');
    // "Ten weeks after this row" (z-ai-glm-5-1.md): a number immediately
    // before a duration noun is counting TIME, and "row(s)" only shows up
    // later because the sentence is about that row. The whole matched span
    // (number through unit) is checked, not just the first word after the
    // number, so "fourteen busy weeks of eighteen rows shipped" — if this
    // corpus ever writes that shape — would still be excluded correctly.
    const betweenNumberAndUnit = matchText.replace(/^\S+\s*/, '').replace(/\s*\S+$/, '');
    if (betweenNumberAndUnit.split(/\s+/).some((w) => DURATION_WORD_RE.test(w))) continue;

    const { start: sectionStart, end: sectionEnd } = sectionBounds(body, m.index);
    const section = body.slice(sectionStart, sectionEnd);
    const maskedSection = maskForCensus(section);
    if (!CATALOG_SCOPE_RE.test(maskedSection)) continue; // out of scope entirely

    const line = bodyStartLine - 1 + lineOf(body, m.index);
    const key = `${line}:${matchText}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scanned += 1;

    // A section can carry several unrelated dates — a listing date, a launch
    // date — beside the one snapshot date it actually names, especially in a
    // long body with no ATX headings (this corpus writes most entry bodies
    // that way). Only a date sitting near an ACTUAL "snapshot"/"catalog"
    // mention is a candidate anchor; among those, the nearest to the census
    // match is what a reader reads as its anchor. "The nearest date anywhere
    // in the section" (with no such filter) measured wrong on the real
    // corpus twice: nvidia.md's free-listings census picked up "15 December
    // 2025" (an unrelated architecture-announcement date in the licensing
    // paragraph) over the real "31 August 2026" snapshot date two paragraphs
    // above it, and z-ai.md's four-current-rows census picked up "18 August
    // 2026" (a row's own listing date, four lines later) over the "31 August
    // 2026" snapshot date stated twice earlier in the same body.
    const scopeHits = [];
    CATALOG_SCOPE_RE_G.lastIndex = 0;
    let sm;
    while ((sm = CATALOG_SCOPE_RE_G.exec(maskedSection)) !== null) scopeHits.push(sm.index);
    const ANCHOR_RADIUS = 80;
    const anchored = findDates(maskedSection).filter((d) =>
      scopeHits.some((si) => Math.abs(d.index - si) <= ANCHOR_RADIUS),
    );
    if (anchored.length === 0) {
      hits.push({ line, match: matchText, kind: 'undated', claimedDate: null, sentence: matchText });
      continue;
    }
    const matchIndexInSection = m.index - sectionStart;
    const claimed = anchored.reduce((best, d) =>
      Math.abs(d.index - matchIndexInSection) < Math.abs(best.index - matchIndexInSection) ? d : best,
    ).iso;
    if (snapshotDate != null && claimed !== snapshotDate) {
      // A date AFTER the snapshot this page renders from is not a stale
      // observation, it is one that has not happened. No marker clears it,
      // so this is decided before the hedge is even looked for.
      if (claimed > snapshotDate) {
        hits.push({ line, match: matchText, kind: 'future', claimedDate: claimed, sentence: matchText });
        continue;
      }
      // The promised repair, finally implemented (beads addictedtoai-jqif):
      // a claim its author explicitly framed as an observation of a named
      // past day is allowed to age. Paragraph-scoped and marker-exact — see
      // the module header for why both, and for where the line is drawn.
      const { start: pStart, end: pEnd } = paragraphBounds(body, m.index);
      if (observedDates(masked.slice(pStart, pEnd)).has(claimed)) {
        hedged += 1;
        continue;
      }
      hits.push({ line, match: matchText, kind: 'mismatched', claimedDate: claimed, sentence: matchText });
    }
    // snapshotDate == null (no Pulse run yet) or claimed === snapshotDate:
    // nothing to flag — either unverifiable-and-not-our-problem-yet, or
    // genuinely anchored to today's real snapshot. Still counted in
    // `scanned`: the claim WAS examined, it just came back clean.
  }
  return { scanned, hedged, hits: hits.sort((a, b) => a.line - b.line) };
}

/**
 * The flagged subset only — the convenience form direct tests use, mirroring
 * `findPriceAttribution`'s contract (which also returns only what needs
 * attention, not every price transclusion it looked at).
 */
export function findSnapshotCensus(body, bodyStartLine = 1, snapshotDate = null) {
  return scanSnapshotCensus(body, bodyStartLine, snapshotDate).hits;
}

/**
 * ---------------------------------------------------------------------------
 * THE RECORDED DEBT — same ratchet as `price-attribution.mjs`: an entry here
 * is a dated record that an instance was already wrong (or already
 * unfalsifiable) when this check was written, not a licence granted to a
 * sentence. It warns on every build, fails the moment a NEW instance
 * appears, and has exactly one legal direction: down.
 * ---------------------------------------------------------------------------
 */

/** `data/snapshot-census-debt.json` -> the set of keys it forgives. */
export function debtKeys(debt) {
  const out = new Set();
  for (const e of debt?.known ?? []) out.add(`${e.file}::${e.match}`);
  return out;
}

/**
 * Check one document. Only `doc.type === 'entry'` is in scope (see the
 * module header); every other type reports `scanned: 0` rather than being
 * silently skipped, so the coverage the build prints stays honest about what
 * ran.
 *
 * @returns {{scanned: number, hedged: number, errors: number, known: number,
 *   keys: string[]}}
 */
export function checkSnapshotCensus(doc, diags, known = new Set(), snapshotDate = null) {
  if (doc?.type !== 'entry' || !doc?.hasBody || !doc.body) {
    return { scanned: 0, hedged: 0, errors: 0, known: 0, keys: [] };
  }
  const { scanned, hedged, hits } = scanSnapshotCensus(
    doc.body,
    doc.bodyStartLine ?? 1,
    snapshotDate,
  );
  if (scanned === 0) return { scanned: 0, hedged: 0, errors: 0, known: 0, keys: [] };

  let errors = 0;
  let forgiven = 0;
  const keys = [];
  for (const hit of hits) {
    const key = `${doc.file}::${hit.match}`;
    // Each verdict names the repair the CODE actually performs. That is not a
    // style note: until 2026-08-31 the mismatched advice recommended a hedge
    // this module had no branch for, so an author who followed it got the
    // same error back forever (beads addictedtoai-jqif).
    let advice;
    if (hit.kind === 'undated') {
      advice =
        `"${hit.sentence}" names no snapshot date at all, so nothing anchors it — it can never ` +
        "be confirmed true and will rot silently. Either date it against the snapshot the page's " +
        'own transclusions render from, or drop the exact figure for qualitative language ' +
        '("almost none do" survives; "eight of 388" does not). Dating it "as observed on DATE" ' +
        'will not help here: the hedge needs a date near a snapshot/catalog mention to anchor to.';
    } else if (hit.kind === 'future') {
      advice =
        `"${hit.sentence}" names ${hit.claimedDate}, which is AFTER the ${snapshotDate} snapshot ` +
        'this page renders from — that fetch has not happened, so the count cannot have been ' +
        'observed. Nothing hedges this one: correct the date to a snapshot that exists.';
    } else {
      advice =
        `"${hit.sentence}" names ${hit.claimedDate}, but this page's transclusions render from ` +
        `${snapshotDate} — the snapshot has moved on since this was written. Update the date and ` +
        "the count together, or mark the claim as one you are letting age with the corpus's " +
        'established hedge — this check clears a claim whose own paragraph carries the exact ' +
        `wording "as observed on ${hit.claimedDate ? isoToLongDate(hit.claimedDate) : 'DATE'}", ` +
        'with the date immediately after it, in prose rather than inside a code span. Scoping ' +
        'alone ("as of the DATE snapshot", "in the snapshot of DATE") is NOT the hedge and does ' +
        'not clear this: it says which fetch the claim is about without saying the claim is one ' +
        'you accept will age. Put the sentence in the past tense to match ("carried", not ' +
        '"carry") — the check does not read tense, but a hedged claim that still reads as a ' +
        'statement about now is the thing the hedge was supposed to stop you writing.';
    }
    if (known.has(key)) {
      forgiven += 1;
      keys.push(key);
      diags.warn({
        file: doc.file,
        field: `line ${hit.line}`,
        message: `known snapshot-census debt (data/snapshot-census-debt.json) — ${advice}`,
        rule: 'snapshot-census-debt',
      });
      continue;
    }
    errors += 1;
    diags.error({
      file: doc.file,
      field: `line ${hit.line}`,
      message: `snapshot-anchored census — ${advice}`,
      rule: 'snapshot-census',
    });
  }
  return { scanned, hedged, errors, known: forgiven, keys };
}
