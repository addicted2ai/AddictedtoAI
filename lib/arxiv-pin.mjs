/**
 * arxiv-pin.mjs — the versioned-citation build check for quoted arXiv abstracts
 * (beads addictedtoai-2xh, from the sweep addictedtoai-dd5 measured).
 *
 * THE DEFECT, precisely. `arxiv.org/abs/<id>` serves the LATEST version of a
 * preprint, and the submission history printed beneath it opens with v1's
 * date. So an unversioned `/abs/` URL beside a verbatim quotation names a
 * MOVING document: the sentence the corpus quotes is the sentence that
 * happened to be served on the day the page was written, and nothing holds it
 * there. Abstracts are revised materially, not cosmetically — measured on the
 * papers this corpus already cites: `2211.00241`'s headline win rate went
 * 50% -> 77% -> 97% across v1-v4, and every headline number in `2310.20216`
 * changed between v1 and v2.
 *
 * The decisive instance is in this corpus and it was already understood by the
 * author who wrote it. `content/learn/how-to-think-about-what-comes-next.md`
 * cites Epoch's data-wall paper TWICE in one paragraph: the 2022 estimate is
 * pinned to `/abs/2211.04325v1`, and the 2024 re-measurement is unversioned.
 * Fetched 2026-08-31 from `export.arxiv.org/api/query`, which honours the
 * version suffix (verified by checking the returned `<id>` ends in the
 * requested `vN`): the quoted sentence *"the stock of high-quality language
 * data will be exhausted soon; likely before 2026"* is a literal substring of
 * v1's abstract and is ABSENT from v2's. One author, one paragraph, both
 * conventions — and only the pinned half still says what it meant.
 *
 * THE RULE, and its boundary. **Quoting pins; referring does not.**
 *  - A verbatim quotation must cite the version it was taken from, because a
 *    quotation asserts that a specific document contains a specific string,
 *    and only a version identifies a specific document.
 *  - A citation that does NOT quote — a reference, a "see also", a paraphrase
 *    — must stay unversioned, because there the citation's job is to send a
 *    reader to the live paper and freezing it defeats that job. This half of
 *    the rule is why the check triggers on quotation marks rather than on
 *    arXiv URLs: 100 `/abs/` links live in body prose today and only 51 sit
 *    beside a quotation. Pinning all 100 would be the wrong repair.
 *
 * WHY PINNING COSTS A READER ALMOST NOTHING, which is the fact that settles
 * the trade-off the issue named. `/abs/<id>vN` is a full landing page: it
 * renders vN's abstract, lists every version with its date, and links the
 * latest. A reader who wants the current paper is one click away, while a
 * reader checking the quotation lands on the document that contains it.
 *
 * WHAT IT ENFORCES. Two shapes, both structural rather than lexical:
 *   (1) BODY PROSE — a markdown link whose destination is an unversioned
 *       `arxiv.org/abs/<id>`, in a sentence that also carries a double-quoted
 *       run of at least five words.
 *   (2) FRONT MATTER — a `facts[]` entry whose `value` is ENTIRELY one quoted
 *       run of at least five words and whose `source_url` is an unversioned
 *       `/abs/` URL. "Entirely" is the whole signal: this corpus writes a
 *       quoted fact as `value: "\"...\""` (see `concept/emergence.md`'s
 *       `original_definition`) and a paraphrased one bare, so the author has
 *       already declared which it is.
 *
 * `timeline[].event` is EXCLUDED ON PURPOSE. A timeline quotes a paper's
 * TITLE — `"Emergent Abilities of Large Language Models" posted, ...` — and a
 * title in quotes is not a quotation from the document. Measured: including
 * timeline events fired on exactly this shape and on nothing that was a real
 * quotation.
 *
 * THE FIVE-WORD FLOOR is measured, not chosen for roundness. Below it the
 * corpus's quotation marks are doing a different job — naming a term of art
 * (`the "scaling hypothesis"`), a slug, a field name — and flagging those
 * would demand a version on citations that quote nothing.
 *
 * THE SENTENCE BOUNDARY MUST BE QUOTE-AWARE, and this cost a real measurement
 * before it was noticed. A sentence in this corpus ends `...before 2026."` —
 * the full stop sits INSIDE the closing quote mark, so a `[.!?](?=\s|$)`
 * boundary (which is what `price-attribution.mjs` and `snapshot-census.mjs`
 * both use, correctly, for prose that does not quote) does not split there.
 * Run with that boundary, the Epoch paragraph above reported ONE citation
 * carrying BOTH quotations, which attributed v1's sentence to the unversioned
 * v2 link and would have recorded a defect that is not there. Filed for the
 * two sibling modules as **addictedtoai-q3n** rather than changed under them
 * here — latent for them today, because neither prices nor row censuses are
 * written inside quotation marks in this corpus, but latent is what the
 * cascading-mask bug was too.
 *
 * MASKING follows the two lessons those modules learned the hard way: every
 * mask is matched against the ORIGINAL text and applied by blanking (never
 * cascaded, which ate whole lines when a sentence opened with an inline code
 * span), and a `{{...}}` marker is blanked entirely because its text is a
 * value and not something an author asserted. Fenced code is masked because a
 * code sample may contain both a URL and a quoted string.
 *
 * MEASURED, and stated as measured:
 *   - 51 quotation sites across 20 files carried an unversioned `/abs/` URL
 *     when this check was written; 1 was already pinned;
 *   - the 75 quoted runs on them were checked by LITERAL substring match
 *     against bytes fetched from `export.arxiv.org` — 62 are present in the
 *     cited paper's current abstract and 13 are not;
 *   - four of the first-pass misses were artifacts of the COMPARISON and not
 *     of the corpus (case at a sentence start; arXiv writing an em dash as
 *     `--`; a quotation ending in a comma where the source has a full stop;
 *     single vs double quote marks inside the quotation). They are counted as
 *     present, because ruling out the instrument is the difference between
 *     measuring an absence and inventing one.
 *
 * WHAT IT DOES NOT CATCH, named because a guardrail's blind spot is part of
 * its specification. The 13 remaining quotations are from the papers' BODIES,
 * not their abstracts — the IOI prompt from `2211.00593`, BLOOM's 433,195 kWh
 * from `2211.02001`, LLaMA's inference-cost argument from `2302.13971`. The
 * abstract API cannot verify those, and pinning them to the current version
 * would assert a provenance nobody checked, which is the exact error this
 * repository forbids. They are recorded in `data/arxiv-pin-debt.json` as debt
 * — warned on every build, one legal direction, down — and the work of
 * verifying them against full text is filed as its own issue.
 */

/** An arXiv id: the modern `YYMM.NNNNN` form and the pre-2007 `archive/YYMMNNN`. */
const ARXIV_ID = String.raw`(?:[0-9]{4}\.[0-9]{4,5}|[a-z-]+\/[0-9]{7})`;

/** A markdown link destination pointing at an `/abs/` page. */
export const ABS_LINK_RE = new RegExp(
  String.raw`\]\((https?://(?:www\.)?arxiv\.org/abs/(${ARXIV_ID})(v\d+)?)[^)]*\)`,
  'gi',
);

/** A bare `/abs/` URL, for front-matter `source_url` values. */
export const ABS_URL_RE = new RegExp(
  String.raw`^https?://(?:www\.)?arxiv\.org/abs/(${ARXIV_ID})(v\d+)?/?$`,
  'i',
);

/** A double-quoted run. Straight and curly, never spanning a blank line. */
const QUOTED_RUN_RE = /[“"]([^“”"]{5,600})[”"]/g;

/** The floor below which quotation marks are naming a term, not quoting a text. */
export const MIN_QUOTE_WORDS = 5;

const MASKS = [
  /```[\s\S]*?```/g, // fenced code
  /~~~[\s\S]*?~~~/g,
  /^ {4,}\S.*$/gm, // indented code
  /<!--[\s\S]*?-->/g, // html comments
];

/**
 * Blank everything that is not author prose, preserving offsets. Inline code
 * is deliberately NOT masked here (unlike the two sibling modules): a paper
 * title or a quoted phrase is never written as inline code in this corpus,
 * while a masked span could hide a quotation mark and split a quoted run in
 * two. Link destinations are NOT masked either — this check is looking for
 * them.
 */
export function maskForArxiv(text) {
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
  return chars.join('').replace(/\{\{[\s\S]*?\}\}/g, (m) => m.replace(/[^\n]/g, ' '));
}

function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i += 1) {
    if (text[i] === '\n') line += 1;
  }
  return line;
}

/**
 * The sentence containing an offset, with a QUOTE-AWARE boundary: terminal
 * punctuation may be followed by any number of closing quotes or brackets
 * before the space that ends the sentence. See the module header — without
 * this, `...before 2026."` is not a boundary and two citations merge into one.
 * Paragraph breaks still bound it, and a single newline does not: the corpus
 * is hard-wrapped.
 */
export function sentenceAround(body, index) {
  let ps = body.lastIndexOf('\n\n', index);
  ps = ps === -1 ? 0 : ps + 2;
  let pe = body.indexOf('\n\n', index);
  pe = pe === -1 ? body.length : pe;
  const para = body.slice(ps, pe);
  const rel = index - ps;
  const BOUND = /[.!?]["”'’)\]]*(?=\s|$)/g;
  let s = 0;
  let e = para.length;
  BOUND.lastIndex = 0;
  let m;
  while ((m = BOUND.exec(para)) !== null) {
    const end = m.index + m[0].length;
    if (end <= rel) s = end;
    else {
      e = end;
      break;
    }
  }
  return { text: para.slice(s, e), start: ps + s };
}

/** Every quoted run of at least MIN_QUOTE_WORDS words in `text`. */
export function quotedRuns(text) {
  const out = [];
  QUOTED_RUN_RE.lastIndex = 0;
  let m;
  while ((m = QUOTED_RUN_RE.exec(text)) !== null) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t.split(/\s+/).filter(Boolean).length >= MIN_QUOTE_WORDS) out.push(t);
  }
  return out;
}

/**
 * Shape (1): unversioned `/abs/` links in body prose sharing a sentence with a
 * quotation.
 *
 * Every quotation in the sentence is returned, not just the first: a sentence
 * may quote a paper twice, and pinning a version that carries one of the two
 * would leave the other unattributed while the check went quiet.
 *
 * @param {string} body           the prose body, as written
 * @param {number} bodyStartLine  1-based line of the body within its file
 * @returns {{line: number, id: string, url: string, quotes: string[]}[]}
 */
export function findUnpinnedQuotedCitations(body, bodyStartLine = 1) {
  const masked = maskForArxiv(body);
  const hits = [];
  const seen = new Set();
  ABS_LINK_RE.lastIndex = 0;
  let m;
  while ((m = ABS_LINK_RE.exec(masked)) !== null) {
    const [, url, id, version] = m;
    if (version) continue; // already pinned — the remedy, so nothing to report
    const sentence = sentenceAround(masked, m.index);
    const quotes = quotedRuns(sentence.text);
    if (quotes.length === 0) continue; // a reference, not a quotation: correct unversioned
    const line = bodyStartLine - 1 + lineOf(body, m.index);
    const key = `${id}@${line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({ line, id, url, quotes });
  }
  return hits.sort((a, b) => a.line - b.line);
}

/**
 * Shape (2): a `facts[]` entry whose value carries a quotation and whose
 * `source_url` is an unversioned `/abs/` page.
 *
 * ANY quoted run of at least `MIN_QUOTE_WORDS` words counts, exactly as in
 * body prose — NOT only a value that is entirely one quotation. An earlier
 * draft used the stricter "entirely quoted" test on the theory that the corpus
 * writes a quoted fact as `value: "\"...\""` and a paraphrased one bare. That
 * theory was measured against the corpus and is wrong in a way that matters:
 * of the twelve arXiv-sourced fact values carrying a quoted run, **seven are
 * wholly quoted and five embed a verbatim quotation inside a paraphrase** —
 * `concept/grokking.md`'s three-phase fact quotes a full sentence of its
 * paper's abstract inside a summary, and `concept/model-collapse.md`,
 * `concept/in-context-learning.md` and `concept/embeddings.md` all do the same.
 * The stricter test would have left four real verbatim quotations attached to a
 * moving document, which is the exact defect this check exists for. The rule
 * is about the quotation, not about how much of the field it fills.
 *
 * A quoted TERM stays out of scope by the word floor, which is what keeps
 * `concept/reversal-curse.md`'s embedded `"A is B"` from demanding a version.
 *
 * @returns {{field: string, id: string, url: string, quote: string}[]}
 */
export function findUnpinnedQuotedFacts(data) {
  const hits = [];
  for (const f of data?.facts ?? []) {
    if (typeof f?.source_url !== 'string' || typeof f?.value !== 'string') continue;
    const u = ABS_URL_RE.exec(f.source_url.trim());
    if (!u || u[2]) continue; // not arXiv, or already pinned
    for (const quote of quotedRuns(f.value)) {
      hits.push({ field: f.field, id: u[1], url: f.source_url.trim(), quote });
    }
  }
  return hits;
}

/**
 * ---------------------------------------------------------------------------
 * THE RECORDED DEBT — the same ratchet `price-attribution.mjs` and
 * `snapshot-census.mjs` use, and for the same reason. An entry here is a dated
 * record that a citation could not be verified when the check was written, not
 * a licence granted to it. It warns on every build, fails the moment a NEW one
 * appears, and has exactly one legal direction: down.
 *
 * Severity is an ERROR rather than a warning, and the argument is specific.
 * There is no legitimate unversioned form of a quoting citation: the quotation
 * either is in the document the URL serves or is not, and only a version makes
 * that answerable. The remedy is four characters, it is verifiable in one
 * fetch, and — unlike a warning — the check cannot be satisfied by ignoring it.
 * ---------------------------------------------------------------------------
 */

/**
 * `data/arxiv-pin-debt.json` -> the set of keys it forgives.
 *
 * Keyed by file, arXiv id and the QUOTATION — never by line number, following
 * `price-attribution.mjs`'s debt file, which records "by file and fact rather
 * than by line number" for the reason a line number is the one part of a hit
 * that changes when somebody edits the paragraph above it.
 */
export function debtKeys(debt) {
  const out = new Set();
  for (const e of debt?.known ?? []) out.add(`${e.file}::${e.id}::${normQuote(e.quote)}`);
  return out;
}

/** The debt key's quote component: whitespace-collapsed, nothing else. */
export function normQuote(q) {
  return String(q ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Check one document.
 *
 * `scanned` counts every `/abs/` citation examined, pinned or not — the
 * coverage denominator. Returning only the hits would make a document with
 * twelve correctly-pinned citations report the same `0` as a document that was
 * never looked at, and that indistinguishability has already hidden one vacuum
 * in this repository for a whole seed wave.
 *
 * @returns {{scanned: number, errors: number, known: number, keys: string[]}}
 */
export function checkArxivPins(doc, diags, known = new Set()) {
  let scanned = 0;
  if (doc?.body) {
    ABS_LINK_RE.lastIndex = 0;
    scanned += (maskForArxiv(doc.body).match(ABS_LINK_RE) ?? []).length;
  }
  for (const f of doc?.data?.facts ?? []) {
    if (typeof f?.source_url === 'string' && ABS_URL_RE.test(f.source_url.trim())) scanned += 1;
  }
  if (scanned === 0) return { scanned: 0, errors: 0, known: 0, keys: [] };

  const advice =
    'arxiv.org/abs/<id> serves the LATEST version, so an unversioned URL beside a verbatim ' +
    'quotation names a document that moves — this corpus already carries a sentence that is in ' +
    "v1's abstract and gone from v2's (2211.04325). Pin the version the quotation was taken " +
    'from (/abs/<id>v3), which is what content/learn/how-to-think-about-what-comes-next.md ' +
    'already does. If the citation does not quote the paper, leave it unversioned and drop the ' +
    'quotation marks or move them off this sentence: referring should track the live paper.';

  let errors = 0;
  let forgiven = 0;
  const keys = [];
  const report = (id, quote, field) => {
    const key = `${doc.file}::${id}::${normQuote(quote)}`;
    if (known.has(key)) {
      forgiven += 1;
      keys.push(key);
      diags.warn({
        file: doc.file,
        field,
        message: `known arxiv-pin debt (data/arxiv-pin-debt.json) — "${quote}" is quoted against unversioned arxiv.org/abs/${id}. ${advice}`,
        rule: 'arxiv-pin-debt',
      });
      return;
    }
    errors += 1;
    diags.error({
      file: doc.file,
      field,
      message: `verbatim quotation cited to an unversioned arXiv abstract — "${quote}" against arxiv.org/abs/${id}. ${advice}`,
      rule: 'arxiv-pin',
    });
  };

  if (doc.hasBody && doc.body) {
    for (const hit of findUnpinnedQuotedCitations(doc.body, doc.bodyStartLine ?? 1)) {
      for (const q of hit.quotes) report(hit.id, q, `line ${hit.line}`);
    }
  }
  for (const hit of findUnpinnedQuotedFacts(doc.data)) {
    report(hit.id, hit.quote, `facts.${hit.field}`);
  }
  return { scanned, errors, known: forgiven, keys };
}

/**
 * The prebuild step. A separate step rather than a call inside
 * `contentBuildStep` because this check reads the corpus and nothing else, and
 * because `scripts/prebuild.mjs`'s header names STEPS as the registration
 * point for a new build step (CLAUDE.md repeats it: `package.json` has a
 * single owner and is never edited to add one).
 *
 * Reference resolution is off for the same reason `anchorCheckStep` turns it
 * off: the `content` step ahead of this one already ran it, and re-reporting
 * the same `mentions` failures would double every message a reader wades
 * through.
 */
export async function arxivPinStep(opts = {}) {
  const { loadCorpus } = await import('./corpus.mjs');
  const { Diagnostics } = await import('./errors.mjs');
  const { readFile } = await import('node:fs/promises');
  const out = opts.out ?? process.stdout;
  const diags = new Diagnostics();
  const corpus =
    opts.corpus ??
    (await loadCorpus({
      contentRoot: opts.contentRoot,
      diags: new Diagnostics(),
      checkReferences: false,
    }));
  let debt = opts.debt;
  if (debt === undefined) {
    try {
      debt = JSON.parse(
        await readFile(new URL('../data/arxiv-pin-debt.json', import.meta.url), 'utf8'),
      );
    } catch {
      debt = { known: [] };
    }
  }
  const known = debtKeys(debt);

  const total = { scanned: 0, docs: 0, errors: 0, known: 0 };
  const seen = new Set();
  for (const doc of corpus.all) {
    const r = checkArxivPins(doc, diags, known);
    if (r.scanned === 0) continue;
    total.scanned += r.scanned;
    total.docs += 1;
    total.errors += r.errors;
    total.known += r.known;
    for (const k of r.keys) seen.add(k);
  }
  // A debt entry that has stopped firing is reported as removable rather than
  // silently kept, so the file cannot outlive the debt — the same property
  // price-attribution.mjs's list relies on.
  const stale = [...known].filter((k) => !seen.has(k)).sort();
  for (const k of stale) {
    diags.warn({
      file: 'data/arxiv-pin-debt.json',
      field: k,
      message: 'recorded debt no longer fires — delete this entry, the list may only shrink',
      rule: 'arxiv-pin-debt-stale',
    });
  }
  diags.printWarnings(out);
  diags.throwIfErrors('arxiv-pin');
  const line =
    `prebuild: arXiv pins — ${total.scanned} /abs/ citation(s) in ${total.docs} document(s); ` +
    `${total.errors} verbatim quotation(s) against an unversioned abstract (build error), ` +
    `${total.known} recorded as debt (warning; this number may only fall)` +
    `${stale.length ? `, ${stale.length} stale debt entry/entries to delete` : ''}\n`;
  out.write(line);
  return { ...total, stale, line };
}
