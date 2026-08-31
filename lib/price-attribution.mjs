/**
 * price-attribution.mjs — the vendor-price attribution build check
 * (beads addictedtoai-l6j, from the defect addictedtoai-sdh measured).
 *
 * THE DEFECT, precisely. OpenRouter's `pricing.prompt` is documented as
 * *"pricing from the top provider for this model"*, and the top provider is
 * re-chosen on a rolling 30-second window. So the number a `price_*` fact
 * carries is **a rate on a listing**, not **a rate a company charges**. The
 * fact is faithful and must never be edited; the PROSE that reads it as
 * "vendor X charges Y" is what is false. Measured on this corpus: a headline
 * of 0.000000045 was Relace's while DeepSeek's own endpoint posted
 * 0.00000022 — 4.9x — and one row showed a 7.05x spread across 33 endpoints.
 * One snapshot headline matched no live endpoint at all: the top provider had
 * already moved between the snapshot and the same day's check.
 *
 * WHY THIS IS A BUILD CHECK AND NOT A RENDER-SIDE CAVEAT. The other candidate
 * in the issue was to attach the caveat to every rendered price, the way the
 * as-of date already is. Three things rule it out:
 *
 *  1. The renderer does not have the data. Deciding whether a caveat is
 *     warranted needs the per-row *endpoint list* — which provider serves
 *     which row — and that is not in the data layer at all. It is also the
 *     most volatile thing OpenRouter publishes, so binding it would mean a new
 *     feed of 396 rows x N endpoints, re-fetched every Pulse run, whose only
 *     job is to decide whether to print a sentence.
 *  2. **A caveat cannot repair an inverted conclusion.** The severest hits sdh
 *     found were not under-qualified, they were *wrong*: "glm-5.2 sits below
 *     what this row charges" is an artifact of two resellers topping two rows —
 *     at Z.ai's own rate both rows are 0.0000014, identical. Printing "(top
 *     provider's rate)" beside both numbers leaves that sentence asserting a
 *     false comparison. Only an author can withdraw a claim.
 *  3. It is noise on the rows where the vendor IS the sole endpoint
 *     (z-ai/glm-5-turbo, tencent/hy4-preview, cohere/command-a), and it would
 *     print on all 87 price transclusions to qualify a handful.
 *
 * So the hedge belongs where the claim is: in the prose, checked at build.
 *
 * WHAT IT ENFORCES, and why exactly this and not more. The repair sdh merged
 * did not delete the comparisons — it added a clause naming the provider layer
 * beside them:
 *
 *   tencent.md    "Both are the top listed provider's rate for their row
 *                  rather than necessarily Tencent's own"
 *   nvidia.md     "top listed provider's rate for its row, and two rows are
 *                  not obliged to be..."
 *   z-ai-glm-5-1  "the two rows are headed by different top providers"
 *   tencent.md    "whichever provider currently heads a row several other
 *                  companies also serve"
 *
 * That is a real convention, arrived at by review, and nothing enforced it —
 * which is the entire reason this module exists. It enforces that and nothing
 * beyond it: **a price transclusion in a sentence that makes some party the
 * setter or receiver of the rate must sit in a section that mentions the
 * provider layer.** The exemption is not a suppression comment — it is the
 * remedy itself, so the only way to silence the check is to write the clause
 * that makes the sentence true.
 *
 * THE MASKING IS LOAD-BEARING. A row id is written in this corpus as inline
 * code — `tencent/hy3` — and inline code is blanked before scanning. Offsets
 * are preserved by blanking so reported line numbers stay exact.
 *
 * MEASURED, not asserted, and stated as measured rather than rounded up:
 *   - against the six files as they stood at `ba1a577~1`, this catches **13
 *     price transclusions covering 5 of the 7 hits sdh found by hand**;
 *   - against the same six files at `ba1a577` it fires **0** times, so the
 *     merged repair clears it and the check cannot be satisfied by reverting;
 *   - against the corpus today it fires **15 times in 4 files sdh never
 *     swept**, recorded in `data/price-attribution-debt.json`.
 *
 * WHAT IT DOES NOT CATCH, named because a guardrail's blind spot is part of
 * its specification. The two sdh hits it misses are **verbless cross-row
 * comparisons** — z-ai.md's "the closed price is exactly double the open one"
 * and nvidia.md's "this one is a surcharge". Neither makes a party the payee
 * of anything, so no verb pattern reaches them, and both are false for the
 * *other* half of the hazard: two rows may be headed by two different
 * providers, so any comparison between two headlines is uninterpretable
 * regardless of how it is worded. Catching that class means flagging every
 * sentence carrying two price transclusions from different entries, which
 * measured at 20+ hits across the corpus — most of them the comparisons the
 * sdh review deliberately KEPT after hedging them. It is a real and separate
 * gate with its own severity argument, filed as **addictedtoai-58o** rather
 * than smuggled in here.
 *
 * The rest of what this session found and did not fix, so none of it lives
 * only inside a finished thing:
 *   addictedtoai-sng  repay the 15 recorded debts (the corpus half)
 *   addictedtoai-58o  the verbless cross-row comparison class
 *   addictedtoai-2yb  currency.mjs cascades its masks the way this module
 *                     used to, and its test suite has no leading-code-span case
 *   addictedtoai-t2g  the openspec/specs/wiki delta for this requirement
 */

/**
 * Regions blanked before scanning. Deliberately NOT the same list as
 * currency.mjs: that one masks `{{...}}` markers because a marker is the
 * opposite of a literal, while this check exists to find them.
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

/** A `price_*` fact transclusion. Mirrors transclude.mjs's FACT_RE, narrowed. */
export const PRICE_FACT_RE = /\{\{fact:([a-z]+\/[a-z0-9-]+)#(price_[A-Za-z0-9_]*)\}\}/g;

/**
 * Something that looks like a rate. A `$` or a digit is enough — a price
 * transclusion has already been rewritten to digits by the masking below, so
 * one pattern covers both a literal and a bound value.
 */
const PRICEISH = String.raw`(?:\$|\d)`;

/**
 * Verbs that make some party the setter or receiver of the rate.
 *
 * The safe forms the corpus settled on — "lists at", "heads at", "carries",
 * "sits at" — are deliberately absent: they attribute the number to the
 * listing, which is what it is, and flagging them would contradict the repair
 * review approved. A row cannot charge; a provider can. That asymmetry is the
 * whole signal, and it is why naming a company is *not* additionally required:
 * "`z-ai/glm-5` charges X" is false for the same reason "Z.ai charges X" is,
 * and requiring the company name was measured to drop recall from 7/7 to 1/7.
 *
 * The verbs that double as ordinary nouns are narrowed to their verb use.
 * "the cost per task" and "a promise about cost" are not attributions, and a
 * bare /costs?/ was measured to produce exactly those two false positives.
 */
const ATTRIBUTING_VERBS = [
  /\bcharg(?:e|es|ed|ing)\b/i,
  /\bbill(?:s|ed|ing)\b/i,
  /\bpric(?:ed|es)\b/i,
  new RegExp(String.raw`\basks?\s+(?:for\s+)?${PRICEISH}`, 'i'),
  new RegExp(String.raw`\bcosts?\s+(?:more|less|about|around|roughly|${PRICEISH})`, 'i'),
  /\bsells?\s+(?:it\s+)?(?:at|for)\b/i,
  new RegExp(String.raw`\bpays?\s+(?:for\s+)?${PRICEISH}`, 'i'),
];

/**
 * The hedge. Not one fixed phrase — the corpus writes it four different ways —
 * so what is recognised is the *concept*: the section talks about the provider
 * layer. A passage that has reckoned with the hazard says "provider"; one that
 * has not, does not. It cannot be satisfied by accident, and satisfying it
 * means the hedge got written. Matching a fixed sentence instead would make
 * the check a spell-check on one phrasing.
 */
const HEDGE_RE = /\bproviders?\b/i;

/**
 * Blank everything that is not author prose, preserving offsets.
 *
 * THE MARKER IS A VALUE, NOT PROSE, and forgetting that was a real bug caught
 * by this module's own passing control: the fixture entry `model/priced-model`
 * made every sentence containing `{{fact:model/priced-model#price_input}}`
 * match /\bpric(?:ed|es)\b/ on the id, so four correctly-written sentences
 * were flagged. An id or field name is not something an author asserted.
 *
 * A price marker is replaced with digits rather than spaces because a price
 * renders as a number, and the verb patterns that need to see a rate after
 * them ("asks 0.0000012") should see what the reader will.
 */
export function maskForAttribution(text) {
  // EVERY mask is matched against the ORIGINAL text, then applied. Cascading
  // them — masking into a buffer and matching the next pattern on the result —
  // is what currency.mjs does, and it silently swallows whole lines here: once
  // a leading inline code span like `z-ai/glm-5` is blanked, the line begins
  // with twelve spaces and the indented-code pattern reads the rest of it as a
  // code block. That blanked the single most common sentence shape in this
  // corpus, and the check found nothing in it. (Filed for currency.mjs, which
  // has the same ordering, as its own issue.)
  const chars = [...text];
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
  // A price marker becomes digits; any other marker becomes space. Order
  // matters, and both run after masking so a marker inside code stays blank.
  out = out.replace(/\{\{fact:[a-z]+\/[a-z0-9-]+#price_[A-Za-z0-9_]*\}\}/g, (m) =>
    '0'.repeat(m.length),
  );
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
 * The section containing an offset: from the nearest preceding ATX heading to
 * the next one. Section-wide rather than sentence-wide because the corpus
 * writes the hedge in a *following* sentence — nvidia.md states the comparison
 * and hedges it five lines later — and a sentence-local exemption would reject
 * the repair that is already merged.
 */
export function sectionAround(body, index) {
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
  return body.slice(start, end);
}

/**
 * The sentence containing an offset. Two things this must get right, both
 * learned by measuring rather than by reasoning:
 *
 *  - The corpus is HARD-WRAPPED, so a single newline is not a sentence break.
 *    A first cut that treated it as one found 2 hits where there were 26.
 *  - A blank line IS a break: a claim does not run across paragraphs.
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
 * @param {string} body           the prose body, as written
 * @param {number} bodyStartLine  1-based line of the body within its file
 * @returns {{line: number, id: string, field: string, sentence: string}[]}
 */
export function findPriceAttribution(body, bodyStartLine = 1) {
  const masked = maskForAttribution(body);
  const hits = [];
  const seen = new Set();
  PRICE_FACT_RE.lastIndex = 0;
  let m;
  while ((m = PRICE_FACT_RE.exec(body)) !== null) {
    const [, id, field] = m;
    const sentence = sentenceAround(masked, m.index);
    if (!ATTRIBUTING_VERBS.some((re) => re.test(sentence.text))) continue;
    // The remedy is the exemption: a section that names the provider layer has
    // said the thing that makes the sentence true.
    if (HEDGE_RE.test(maskForAttribution(sectionAround(body, m.index)))) continue;
    const line = bodyStartLine - 1 + lineOf(body, m.index);
    const key = `${id}#${field}@${line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({
      line,
      id,
      field,
      // Quoted from the RAW body, not the masked one: the author has to
      // recognise the sentence they wrote, markers and all.
      sentence: body
        .slice(sentence.start, sentence.start + sentence.text.length)
        .trim()
        .replace(/\s+/g, ' '),
    });
  }
  return hits.sort((a, b) => a.line - b.line);
}

/**
 * ---------------------------------------------------------------------------
 * THE RECORDED DEBT, and why a build ERROR ships with one.
 *
 * Severity is a failure, not a warning, and the argument is specific rather
 * than deferential to the house default. The two checks that warn here warn
 * for one stated reason each: a currency literal can be legitimate in a quoted
 * historical sentence, and the blog's post rate is a rate, not a defect. This
 * one has no legitimate form — there is no sentence in which making a party
 * the payee of a top-provider rate, with no mention that a provider is
 * involved, is true. And unlike a warning it is escapable in ten seconds by
 * writing the clause that makes it true, which is the change you wanted.
 *
 * But the corpus is not clean today. sdh swept by hand and fixed six files;
 * this check, run over the corpus, finds **9 more transclusions in 4 files it
 * never looked at**. Failing on those would turn every build red, and a red
 * build is a stop — so the honest shape is neither "weaken the check to fit
 * the corpus" (that is repairing the detector, which this repository forbids
 * everywhere) nor "break the build on nine pre-existing sentences".
 *
 * So the known instances are recorded, by file and fact rather than by line
 * number, and they WARN while anything new FAILS. The list has exactly one
 * legal direction — down — which is the same property the review-binding
 * report already relies on for `unbound`, "the one to watch: it can only
 * fall". Its length is printed on every build so it cannot rot quietly, and an
 * entry that has stopped firing is reported as removable rather than silently
 * kept, so the file cannot outlive the debt.
 *
 * An entry here is NOT an exemption granted to a sentence. It is a dated
 * record that the sentence was already wrong when the check was written.
 * ---------------------------------------------------------------------------
 */

/** `data/price-attribution-debt.json` -> the set of keys it forgives. */
export function debtKeys(debt) {
  const out = new Set();
  for (const e of debt?.known ?? []) out.add(`${e.file}::${e.id}#${e.field}`);
  return out;
}

/**
 * Check one document.
 *
 * `scanned` is returned for the same reason currency.mjs returns it: a check
 * that runs on nothing prints the same clean result as one that runs on
 * everything, and that indistinguishability has already hidden one vacuum in
 * this repository for a whole seed wave.
 *
 * @returns {{scanned: number, errors: number, known: number, keys: string[]}}
 */
export function checkPriceAttribution(doc, diags, known = new Set()) {
  if (!doc?.hasBody || !doc.body) return { scanned: 0, errors: 0, known: 0, keys: [] };
  PRICE_FACT_RE.lastIndex = 0;
  const scanned = (doc.body.match(PRICE_FACT_RE) ?? []).length;
  if (scanned === 0) return { scanned: 0, errors: 0, known: 0, keys: [] };

  let errors = 0;
  let forgiven = 0;
  const keys = [];
  for (const hit of findPriceAttribution(doc.body, doc.bodyStartLine ?? 1)) {
    const key = `${doc.file}::${hit.id}#${hit.field}`;
    const advice =
      `{{fact:${hit.id}#${hit.field}}} is OpenRouter's headline for that row, which is the ` +
      'TOP PROVIDER\'s rate and rotates on a 30-second window — it is not necessarily what ' +
      'the party named here charges. Either say what the listing does ("the row lists at", ' +
      '"heads at"), or keep the attribution and add the clause the corpus uses: that it is ' +
      "the top listed provider's rate for that row rather than necessarily that company's " +
      'own. Never name the provider — it changes.';
    if (known.has(key)) {
      forgiven += 1;
      keys.push(key);
      diags.warn({
        file: doc.file,
        field: `line ${hit.line}`,
        message:
          `known price-attribution debt (data/price-attribution-debt.json) — "${hit.sentence}". ${advice}`,
        rule: 'price-attribution-debt',
      });
      continue;
    }
    errors += 1;
    diags.error({
      file: doc.file,
      field: `line ${hit.line}`,
      message: `prose attributes a listed price to a party — "${hit.sentence}". ${advice}`,
      rule: 'price-attribution',
    });
  }
  return { scanned, errors, known: forgiven, keys };
}
