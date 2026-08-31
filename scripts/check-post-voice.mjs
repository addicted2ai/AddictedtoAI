#!/usr/bin/env node
/**
 * check-post-voice.mjs — the voice lint (specs/blog, change
 * `make-the-blog-worth-sending` task 3.7).
 *
 * ## THIS CHECK WARNS. IT NEVER FAILS THE BUILD.
 *
 * specs/blog is explicit, and the emphasis is the spec's own: *"The lint is
 * advisory: it SHALL warn, naming for every tripped marker the post, the
 * marker, the measured value and the threshold, and it SHALL NOT fail the
 * build."*
 *
 * That is not timidity, it is a measurement. `openspec/style/blog-voice-
 * calibration.md`: the thresholds are fitted to two corpora with
 * single-punctuation-mark margins, and **the house model trips the
 * punctuation-rate markers in every register it writes** — the second sealed
 * review measured 15 of 15 of this repository's long-form documents firing,
 * `openspec/style/blog-voice.md` itself among them at six times its own
 * semicolon limit. A fail-closed gate here would silently stop all `post` work
 * while every component truthfully reported success. So this joins the
 * currency-literal warning as a deliberate warn-not-fail check, and the
 * publishable gate on voice is the review verdict (`reads-as-generated`), a
 * model's judgment with a named reason — not a threshold.
 *
 * Anyone editing this file: the step returns success. If you find yourself
 * adding a `throw` or a non-zero exit for a tripped marker, read the paragraph
 * above and `specs/blog` before you do, and change the spec first.
 *
 * ## The instrument, and the two artifacts it exists to avoid
 *
 * Both prior reports of the semicolon distribution were instrument artifacts,
 * recorded in the calibration file so nobody repeats them:
 *
 *  - **Legal-citation entities count as semicolons.** `&sect;` (§) ends in a
 *    semicolon. One predecessor post cites a California statute by section
 *    twelve times; undecoded, those citations inflated its measured rate from
 *    a real 3.28/1k to a reported 11.1/1k. **Entities are decoded before
 *    anything is counted**, and that is not optional.
 *  - **The JSX closer leaked.** An extractor that kept text past the last
 *    closing tag counted the component's own `); }` as one semicolon per post.
 *    That one belongs to the JSX extractor, which is not this file — this lint
 *    reads Markdown — but the pinned fixtures are the output of that extractor,
 *    so the artifact is pinned out of them rather than out of here.
 *
 * A third, found while implementing this and worth the same treatment:
 * **phrases split over a line break are the same phrase.** Joining multi-word
 * markers with a literal space missed six occurrences across the twelve pinned
 * documents — `this post` five times and `labelled as such` once — and put four
 * of their per-document self-narration counts below the calibration record's.
 * Every multi-word marker matches across any whitespace, newlines included, and
 * that means EVERY one: sparing `labelled as such`, which a coder is likely to
 * spell with `\s+` by habit, gives five and three instead of six and four, and
 * a smaller number here reads as a smaller problem than it is.
 * It is now the third artifact recorded in the calibration file, alongside the
 * headline it made possible: this lint reproduces that file's per-document
 * table with 0 mismatches of 12.
 *
 * ## Scope
 *
 * `openspec/style/blog-voice.md` §3: *"Counted outside code fences,
 * blockquotes, and dated correction blocks."* Exactly those three regions are
 * masked, and deliberately not a fourth: the marker list and its counting
 * scope are closed and documented, and a lint that quietly widens its own
 * scope stops being the thing the calibration measured. Masked regions are
 * replaced by spaces, so they leave the word denominator as well as the
 * numerator — a semicolon inside a code fence is not a semicolon the author
 * wrote, and neither are the words around it.
 */

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { loadCorpus } from '../lib/corpus.mjs';
import { Diagnostics } from '../lib/errors.mjs';

/* ── entity decoding, mandatory before any count ────────────────────────── */

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  mdash: '—', ndash: '–', hellip: '…', sect: '§',
  deg: '°', times: '×', middot: '·', bull: '•',
  copy: '©', reg: '®', trade: '™', euro: '€',
  pound: '£', yen: '¥', cent: '¢', dagger: '†',
  para: '¶', laquo: '«', raquo: '»', frac12: '½',
  minus: '−', prime: '′', Prime: '″', thinsp: ' ',
  ensp: ' ', emsp: ' ', shy: '­',
};

/**
 * Decode named and numeric HTML entities.
 *
 * `&sect;` is in the table above for one reason and the calibration record
 * names it: a statute citation is not a semicolon.
 */
export function decodeEntities(text) {
  return String(text)
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => codePoint(parseInt(h, 16), m))
    .replace(/&#(\d+);/g, (m, d) => codePoint(Number(d), m))
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, n) => (n in NAMED_ENTITIES ? NAMED_ENTITIES[n] : m));
}

function codePoint(n, fallback) {
  try {
    return String.fromCodePoint(n);
  } catch {
    return fallback; // a malformed entity stays as written rather than throwing
  }
}

/* ── the counting scope ─────────────────────────────────────────────────── */

/** The three regions §3 puts outside the count, each replaced by spaces. */
const UNCOUNTED = [
  /```[\s\S]*?```/g, // fenced code
  /~~~[\s\S]*?~~~/g,
  /^[ \t]{0,3}>.*$/gm, // blockquotes
  // A dated correction block: the PARAGRAPH opening "Update, <date>:" or
  // "Correction, <date>:", bold or plain. specs/blog requires corrections to
  // be appended and dated rather than folded into the body, and the writer of
  // the original prose is not the author of the correction's punctuation.
  //
  // Deliberately not `m`-flagged, and the line-start anchor is a lookbehind
  // instead: under `m`, `$` means end of LINE, so the lazy body matched the
  // first line of the block and left the rest of the paragraph counted. That
  // was measured, not reasoned about — the fixture whose marks are all inside
  // uncounted regions still reported four semicolons and thirteen em-dashes.
  /(?:^|(?<=\n))[ \t]{0,3}(?:\*\*|__)?(?:Update|Correction)\b[^\n]*?:[\s\S]*?(?=\n[ \t]*\n|$)/gi,
];

export function maskUncounted(text) {
  let out = String(text);
  for (const re of UNCOUNTED) out = out.replace(re, (m) => m.replace(/[^\n]/g, ' '));
  return out;
}

/**
 * One post's countable prose: masked, then decoded, with its headers.
 *
 * Order is load-bearing. Masking runs on the raw text so a fence's own
 * backticks still delimit it; decoding runs after, so `&sect;` in prose has
 * become `§` before a single mark is counted.
 */
export function proseFor(body) {
  const text = decodeEntities(maskUncounted(body ?? ''));
  const headers = [...text.matchAll(/^[ \t]{0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm)].map((m) =>
    m[1].trim(),
  );
  const words = text.split(/\s+/).filter((t) => /[A-Za-z0-9]/.test(t)).length;
  return { text, headers, words };
}

/* ── the closed marker list (openspec/style/blog-voice.md §3) ───────────── */

/** Multi-word markers match across any whitespace — a line break is not a word. */
function phrase(...words) {
  return words.join('\\s+');
}

const SELF_NARRATION = new RegExp(
  `\\b(?:${[
    phrase('this', 'post'),
    phrase('this', 'piece'),
    'labell?ed\\s+as\\s+such',
    phrase('as', 'claims', 'here'),
    phrase('measured', 'here'),
    phrase('attributed', 'here'),
  ].join('|')})\\b`,
  'gi',
);

/** A header that captions its own function rather than stating a finding. */
const WWH_HEADER = /^(?:what|why|how)\b/i;

/** Register guards, presence level: the headers and the phrases. */
const GUARD_HEADER = /^(?:conclusion|key\s+takeaways?|in\s+summary|final\s+thoughts?)\b/i;
const GUARD_PHRASES = new RegExp(
  [
    phrase("let'?s", 'dive'),
    phrase('deep', 'dive'),
    phrase('only', 'time', 'will', 'tell'),
    phrase('in', "today'?s", 'rapidly', 'evolving'),
    phrase('stands', 'as', 'a', 'testament'),
    phrase('navigate', 'the', 'complexities'),
    phrase("it'?s", 'worth', 'noting', 'that'),
  ].join('|'),
  'gi',
);

/**
 * The focal-word family. Deliberately at RATE, never at presence: the voice
 * document records that the family at presence level fires on good human
 * journalism and passes the labeled AI corpus, which is the wrong way round,
 * and says so under "two famous markers are excluded because they failed
 * validation". Re-adding it at presence needs a two-direction re-measurement,
 * not an edit here.
 */
export const FOCAL_STEMS = [
  'delve', 'tapestry', 'showcase', 'underscore', 'boast', 'pivotal', 'crucial',
  'robust', 'seamless', 'landscape', 'realm', 'testament', 'vibrant', 'foster',
  'garner', 'leverage', 'intricate', 'comprehensive', 'notably', 'moreover',
  'furthermore', 'additionally',
];

function familyAlternatives(stem) {
  const noE = stem.endsWith('e') ? stem.slice(0, -1) : stem;
  return [...new Set([stem, `${stem}s`, `${stem}es`, `${stem}d`, `${stem}ed`, `${noE}ing`, `${stem}ly`, `${stem}ness`])];
}

const FOCAL_FAMILY = new RegExp(
  `\\b(?:${FOCAL_STEMS.flatMap(familyAlternatives).join('|')})\\b`,
  'gi',
);

/**
 * A list of three or more consecutive items, every one opening bold.
 *
 * The narrowest marker in the list, deliberately: the voice document records
 * that it was validated against the negative corpus and the literature only,
 * because human news HTML does not use Markdown lists and the two-direction
 * test therefore does not apply to it.
 */
function boldLeadRuns(text) {
  const runs = [];
  let run = 0;
  let allBold = true;
  const flush = () => {
    if (run >= 3 && allBold) runs.push(run);
    run = 0;
    allBold = true;
  };
  for (const line of text.split('\n')) {
    const item = /^[ \t]{0,3}(?:[-*+]|\d+[.)])[ \t]+(.*)$/.exec(line);
    if (!item) {
      if (line.trim() === '' && run > 0) continue; // a blank line inside a loose list
      flush();
      continue;
    }
    run += 1;
    if (!/^(?:\*\*|__)\S/.test(item[1].trim())) allBold = false;
  }
  flush();
  return runs;
}

function countMatches(re, text) {
  re.lastIndex = 0;
  return [...text.matchAll(re)].map((m) => m[0]);
}

const per1k = (n, words) => (words > 0 ? (n / words) * 1000 : 0);

/**
 * The closed list. Each marker states its own threshold and how it is read, so
 * a warning can print the measured value against the line it crossed.
 *
 * `compare` is `>` for the rate markers and `>=` for the count markers,
 * matching the voice document's wording exactly ("above 2.5 per 1,000 words";
 * "any occurrence"; "two or more headers"). The two readings are
 * indistinguishable on both calibration corpora — no document sits ON a rate
 * line — so this follows the document rather than the data.
 */
export const MARKERS = [
  {
    id: 'semicolons',
    label: 'semicolons',
    unit: 'per 1,000 words',
    threshold: 2.5,
    compare: '>',
    measure: (p) => {
      const hits = countMatches(/;/g, p.text);
      return { count: hits.length, value: per1k(hits.length, p.words), examples: [] };
    },
  },
  {
    id: 'em-dashes',
    label: 'em-dashes',
    unit: 'per 1,000 words',
    threshold: 10,
    compare: '>',
    measure: (p) => {
      const hits = countMatches(/—/g, p.text);
      return { count: hits.length, value: per1k(hits.length, p.words), examples: [] };
    },
  },
  {
    id: 'self-narration',
    label: 'self-narration ("this post", "labelled as such", …)',
    unit: 'occurrence(s)',
    threshold: 1,
    compare: '>=',
    measure: (p) => {
      const hits = countMatches(SELF_NARRATION, p.text);
      return { count: hits.length, value: hits.length, examples: hits };
    },
  },
  {
    id: 'what-why-how-headers',
    label: 'headers beginning "What", "Why" or "How"',
    unit: 'header(s)',
    threshold: 2,
    compare: '>=',
    measure: (p) => {
      const hits = p.headers.filter((h) => WWH_HEADER.test(h.trim()));
      return { count: hits.length, value: hits.length, examples: hits };
    },
  },
  {
    id: 'register-guards',
    label: 'register guards (a "Conclusion" header, "deep dive", "only time will tell", …)',
    unit: 'occurrence(s)',
    threshold: 1,
    compare: '>=',
    measure: (p) => {
      const hits = [
        ...p.headers.filter((h) => GUARD_HEADER.test(h.trim())),
        ...countMatches(GUARD_PHRASES, p.text),
      ];
      return { count: hits.length, value: hits.length, examples: hits };
    },
  },
  {
    id: 'focal-family',
    label: 'focal-word family (delve, pivotal, robust, seamless, moreover, …)',
    unit: 'per 1,000 words',
    threshold: 3,
    compare: '>',
    measure: (p) => {
      const hits = countMatches(FOCAL_FAMILY, p.text);
      return { count: hits.length, value: per1k(hits.length, p.words), examples: hits.slice(0, 6) };
    },
  },
  {
    id: 'bold-lead-lists',
    label: 'a list of three or more items, every one opening bold',
    unit: 'list(s)',
    threshold: 1,
    compare: '>=',
    measure: (p) => {
      const runs = boldLeadRuns(p.text);
      return { count: runs.length, value: runs.length, examples: runs.map((n) => `${n} items`) };
    },
  },
];

/** The six markers the calibration record's firing table covers. */
export const CALIBRATED_MARKERS = MARKERS.filter((m) => m.id !== 'bold-lead-lists').map((m) => m.id);

function fired(marker, value) {
  return marker.compare === '>' ? value > marker.threshold : value >= marker.threshold;
}

/** Measure one body against every marker. Pure; no I/O, no clock, no throw. */
export function measurePost(body) {
  const prose = proseFor(body);
  const results = MARKERS.map((m) => {
    const r = m.measure(prose);
    return {
      id: m.id,
      label: m.label,
      unit: m.unit,
      threshold: m.threshold,
      compare: m.compare,
      count: r.count,
      value: r.value,
      examples: r.examples ?? [],
      fired: fired(m, r.value),
    };
  });
  return { words: prose.words, headers: prose.headers.length, results };
}

/** The one line a tripped marker prints: post, marker, measured value, threshold. */
export function warningLine(file, words, r) {
  const measured =
    r.unit === 'per 1,000 words'
      ? `${r.value.toFixed(2)} ${r.unit} (${r.count} in ${words} words)`
      : `${r.count} ${r.unit}`;
  const line = `${r.compare === '>' ? 'above' : 'at or above'} ${r.threshold}${
    r.unit === 'per 1,000 words' ? ` ${r.unit}` : ''
  }`;
  const eg = r.examples.length ? ` — e.g. ${[...new Set(r.examples)].slice(0, 3).map((e) => JSON.stringify(e)).join(', ')}` : '';
  return `warning: ${file}: voice — ${r.label}: measured ${measured}, threshold ${line}${eg} [blog-voice]`;
}

/**
 * The prebuild step. **Returns; never throws on a tripped marker.**
 *
 * It does not throw on its own failures either, and that is deliberate rather
 * than sloppy: an advisory check that crashed the build would produce exactly
 * the outcome specs/blog forbids — all `post` work stopped by the voice lint —
 * with the added insult of doing it for a reason unrelated to any post's voice.
 * The failure is printed, loudly and named, and the build continues.
 */
export async function checkPostVoiceStep(opts = {}) {
  const out = opts.out ?? process.stdout;
  let posts = opts.posts ?? null;
  try {
    if (!posts) {
      const corpus = await loadCorpus({
        contentRoot: opts.contentRoot,
        diags: new Diagnostics(),
        checkReferences: false,
      });
      posts = corpus.post;
    }
  } catch (err) {
    out.write(
      `prebuild: post-voice — COULD NOT RUN (${err?.message ?? err}); the build is not failed by ` +
        'this, but the voice lint measured nothing this run\n',
    );
    return { ok: true, ran: false, posts: 0, tripped: 0, warnings: [] };
  }

  const warnings = [];
  let tripped = 0;
  for (const doc of posts) {
    const m = measurePost(doc.body ?? '');
    const hits = m.results.filter((r) => r.fired);
    if (hits.length > 0) tripped += 1;
    for (const r of hits) warnings.push(warningLine(doc.file, m.words, r));
  }
  for (const w of warnings) out.write(`${w}\n`);
  out.write(
    `prebuild: post-voice — ${posts.length} post(s), ${tripped} tripping at least one marker, ` +
      `${warnings.length} warning(s). ADVISORY: the reviewer is the gate (reads-as-generated), ` +
      'not this count\n',
  );
  return { ok: true, ran: true, posts: posts.length, tripped, warnings };
}

/**
 * Runnable on its own, for an author who wants the warnings without a build:
 * `node scripts/check-post-voice.mjs`.
 *
 * It sets no exit code, which is the same guarantee as the step's: this check
 * cannot fail anything, from the prebuild or from a shell.
 */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkPostVoiceStep();
}
