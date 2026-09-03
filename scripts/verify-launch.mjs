#!/usr/bin/env node
/**
 * verify-launch.mjs — the launch minimums (task 6.6).
 *
 * This script exists to stop a launch that *looks* complete and is not. Its
 * own failure mode is therefore the thing that matters most: a checker that
 * passes because it counted the wrong thing is worse than no checker, because
 * it converts an unexamined tree into a green line of output. Three decisions
 * below are made specifically against that failure, and each is stated in the
 * printed output so a reader can see what was measured rather than trusting
 * that something was:
 *
 *  1. **The entry count is not a measure of curation.** 388 of the entries are
 *     mechanically minted stubs from the OpenRouter registry — the `>= 40`
 *     floor is cleared by the minting alone, before a single sentence is
 *     written. The script computes that (from `data/sources/*\/minted.json`,
 *     the mint ledger, not from a guess) and labels the floor TRIVIAL when the
 *     mechanical share alone satisfies it. The floors that actually bite are
 *     the prose-body and themed-body ones, and they are labelled as such.
 *
 *  2. **A prose body is not a non-empty file.** `hasProse()` in the build is
 *     `body.trim().length > 0`, which is the right test for *indexability*
 *     (does this page have anything under the data?) and the wrong test for
 *     "twelve entries carry prose". A single heading, a `{{fact:...}}`
 *     transclusion line, or a `TODO` passes it. Here a body must carry
 *     `MIN_PROSE_WORDS` words of *running prose* — measured after stripping
 *     fenced code, headings, HTML comments, transclusions, list and quote
 *     markers, and link targets. The looser build count is printed alongside,
 *     and any file where the two disagree is named.
 *
 *  3. **A count is not a resolution.** "20 curated tool listings" is checked
 *     as 20 listings whose `entry:` id resolves to an entry that exists — and
 *     the number of *distinct* entries linked is printed too, because twenty
 *     listings pointing at one entry would satisfy any count-only check.
 *
 * The review check is deliberately strict about the same thing: it does not
 * count files in `data/reviews/`, it matches every seed prose piece to a
 * record, requires the verdict to be `approve`, requires `would-cite` to be
 * non-empty, re-applies the loop's duplicate-`would-cite` rule, and — on the
 * job types the merge gate scopes the voice question to — requires the same of
 * `reads-human`. So this check and `loop/lib/review.mjs`'s merge gate agree on
 * what a valid record is. A record nothing claims is reported as an orphan,
 * because an orphan beside a missing piece is a naming mismatch, not an
 * absence.
 *
 * That sentence was FALSE by one rule between the `reads-human` gate landing
 * and this being written, and the way it was false is the thing to keep in
 * view: nothing was measurably wrong, because `content/blog/` held no posts, so
 * the launch check had no post record to be lenient about. A drift with no
 * present symptom is still a drift, and the symptom arrives with the first
 * post. The scope (`READS_HUMAN_TYPES`) and the predicate (`needsReadsHuman`)
 * are IMPORTED from the gate rather than restated here, so the next time the
 * two rules differ it will be because someone changed one file, not because two
 * copies quietly stopped matching.
 *
 * The naming this script settled — the canonical URL-derived form, three
 * accepted alternates, a front-matter subject field — now lives in
 * `lib/reviews.mjs`, because the build needs the same join to enforce
 * specs/wiki's "a prose body that passed review" and two resolutions of one
 * question would drift. This script keeps every judgement it made about what a
 * valid record IS; only the lookup moved.
 *
 * Usage:
 *   node scripts/verify-launch.mjs              run every check, build included
 *   node scripts/verify-launch.mjs --no-build   skip `npm run build` (loudly)
 *   node scripts/verify-launch.mjs --content-root <dir> --data-dir <dir>
 *                                               point at a fixture tree
 *
 * Exits 0 only when every check passed.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

import { ROOT, CONTENT_DIR, DATA_DIR, CONTENT_TYPES } from '../lib/paths.mjs';
import { Diagnostics } from '../lib/errors.mjs';
import { loadCorpus } from '../lib/corpus.mjs';
import { normalizeField, normalizeWouldCite, VERDICTS } from '../loop/lib/verdict.mjs';
// The voice bar's SCOPE, from the merge gate that enforces it. Importing the
// predicate rather than testing `doc.type === 'post'` here is the whole point:
// if the gate ever widens the rule, this check widens with it in the same edit.
import { READS_HUMAN_TYPES, needsReadsHuman } from '../loop/lib/review.mjs';
import {
  SUBJECT_KEYS,
  mismatchProblems,
  reviewCandidates,
  reviewJoin,
  reviewStateLine,
  reviewStateReport,
} from '../lib/reviews.mjs';

// ---------------------------------------------------------------------------
// The floors. One place, so the printed output and the exit code cannot drift.
// ---------------------------------------------------------------------------

const FLOORS = {
  entries: 40,
  proseBodies: 12,
  themedBodies: 3,
  learn: 4,
  tutorials: 2,
  // 0, not 2 (make-the-blog-worth-sending, task 1.2). The five seed posts were
  // deleted with that change and the blog restarts empty by decision: the scout
  // finds the stories and the review gate decides whether one is worth
  // publishing, so a week with nothing worth sending publishes nothing. A floor
  // that fails the gates on an intended state is a false alarm, not a check.
  posts: 0,
  deltas: 12,
  tools: 20,
  catalogRows: 1,
  changedFeed: 1,
  searchIndex: 1,
};

/** specs/editorial, design D9: the themes the seed corpus must actually carry. */
const REQUIRED_THEMES = ['history', 'culture', 'argument'];

/**
 * The prose bar. Twelve entries "carrying prose bodies" means twelve entries a
 * reader gets something from; sixty words is about three sentences, which is
 * the smallest thing that can be one. The number is a floor on the *test*, not
 * a target for authors — every real body in the corpus is 250+ words.
 */
const MIN_PROSE_WORDS = 60;

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

const results = [];
let out = (s) => process.stdout.write(s);

function section(title) {
  out(`\n${title}\n${'-'.repeat(title.length)}\n`);
}

/**
 * Record and print one check.
 *
 * @param {object} r
 * @param {string} r.id       stable key, used in the failure summary
 * @param {boolean} r.ok
 * @param {string} r.label
 * @param {string} r.actual   what was measured, as printed
 * @param {string} [r.floor]  the requirement, as printed
 * @param {string} [r.weight] TRIVIAL / LOAD-BEARING / '' — see the header note
 * @param {string[]} [r.notes]  always printed, pass or fail
 * @param {string} [r.shortfall]  the actionable one-liner, printed on failure
 *                                and repeated in the summary
 */
function record(r) {
  results.push(r);
  const status = r.ok ? 'PASS' : 'FAIL';
  const req = r.floor ? `  (${r.floor})` : '';
  out(`  ${status}  ${r.label.padEnd(34)} ${r.actual}${req}\n`);
  if (r.weight) out(`        ${r.weight}\n`);
  for (const n of r.notes ?? []) out(`        ${n}\n`);
  if (!r.ok && r.shortfall) out(`        SHORTFALL: ${r.shortfall}\n`);
  return r.ok;
}

function skipped(id, label, why) {
  results.push({ id, ok: true, skipped: true, label, actual: 'SKIPPED' });
  out(`  SKIP  ${label.padEnd(34)} not measured this run\n        ${why}\n`);
}

// ---------------------------------------------------------------------------
// The prose test (decision 2 in the header)
// ---------------------------------------------------------------------------

/**
 * Words of running prose in a markdown body, ignoring everything that is not
 * a reader-facing sentence. A body that is only a heading, only a fenced
 * transcript, or only a transclusion line scores 0.
 */
export function proseWordCount(body) {
  let t = String(body ?? '').replace(/\r\n/g, '\n');
  t = t.replace(/^[ \t]*```[\s\S]*?^[ \t]*```[ \t]*$/gm, ' '); // fenced code
  t = t.replace(/^[ \t]*~~~[\s\S]*?^[ \t]*~~~[ \t]*$/gm, ' ');
  t = t.replace(/<!--[\s\S]*?-->/g, ' '); // HTML comments
  t = t.replace(/\{\{[^}]*\}\}/g, ' '); // {{fact:...}} / {{want:...}}
  t = t.replace(/^[ \t]{0,3}#{1,6}[ \t].*$/gm, ' '); // ATX headings
  t = t.replace(/^[ \t]{0,3}(?:[-*_][ \t]*){3,}$/gm, ' '); // thematic breaks
  t = t.replace(/^[ \t]{0,3}(?:[-*+]|\d+[.)])[ \t]+/gm, ' '); // list markers
  t = t.replace(/^[ \t]{0,3}>+[ \t]?/gm, ' '); // block quotes
  t = t.replace(/!?\[([^\]]*)\]\([^)]*\)/g, ' $1 '); // links/images -> their text
  t = t.replace(/`[^`\n]*`/g, ' '); // inline code
  t = t.replace(/[*_~|<>]/g, ' ');
  return (t.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) ?? []).length;
}

export function hasProseBody(doc) {
  return proseWordCount(doc.body) >= MIN_PROSE_WORDS;
}

export function themesOf(doc) {
  return (doc.data?.themes ?? [])
    .map((t) => String(t).toLowerCase())
    .filter((t) => REQUIRED_THEMES.includes(t));
}

// ---------------------------------------------------------------------------
// Review records
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function checkCorpusFloors(corpus, mint) {
  section('CONTENT FLOORS (task 6.6)');

  const entries = corpus.entry;
  const minted = entries.filter((d) => mint.ids.has(d.data.id));
  const authored = entries.length - minted.length;
  const trivial = minted.length >= FLOORS.entries;

  record({
    id: 'entries',
    ok: entries.length >= FLOORS.entries,
    label: 'wiki entries',
    actual: String(entries.length),
    floor: `floor ${FLOORS.entries}`,
    weight: trivial
      ? `TRIVIALLY MET — ${minted.length} of these are mechanically minted stubs ` +
        `(${mint.sources.join(', ')}); the floor clears on minting alone.`
      : 'LOAD-BEARING — the mechanical share does not clear this floor on its own.',
    notes: [
      `${authored} entr${authored === 1 ? 'y is' : 'ies are'} hand-authored (not in any mint ledger).`,
      'This count measures corpus size, not curation. The prose floors below do that.',
    ],
    shortfall: `only ${entries.length} entries in content/wiki/**, need ${FLOORS.entries}`,
  });

  // Prose bodies — the load-bearing floor, and the one with the trap in it.
  const looseBodies = entries.filter((d) => d.hasBody);
  const bodies = entries.filter(hasProseBody);
  const disagree = looseBodies.filter((d) => !hasProseBody(d));
  record({
    id: 'prose-bodies',
    ok: bodies.length >= FLOORS.proseBodies,
    label: 'entries with a prose body',
    actual: String(bodies.length),
    floor: `floor ${FLOORS.proseBodies}`,
    weight:
      'LOAD-BEARING — every one is hand-authored; no mechanical process produces a body. ' +
      `Margin over the floor: ${bodies.length - FLOORS.proseBodies}.`,
    notes: [
      `Measured as >= ${MIN_PROSE_WORDS} words of running prose (code fences, headings, ` +
        `transclusions, list markers and link targets removed).`,
      `The build's looser test (any non-whitespace body) counts ${looseBodies.length}.` +
        (disagree.length
          ? ` ${disagree.length} file(s) pass that and fail this one: ${disagree
              .map((d) => `${d.file} (${proseWordCount(d.body)}w)`)
              .join(', ')}`
          : ' The two agree on every file.'),
    ],
    shortfall:
      `only ${bodies.length} entries carry >= ${MIN_PROSE_WORDS} words of prose, need ` +
      `${FLOORS.proseBodies}` +
      (disagree.length
        ? `; ${disagree.length} file(s) have a body the build accepts but this test does not: ` +
          disagree.map((d) => d.file).join(', ')
        : ''),
  });

  const themed = bodies.filter((d) => themesOf(d).length > 0);
  const byTheme = REQUIRED_THEMES.map(
    (t) => `${t}: ${themed.filter((d) => themesOf(d).includes(t)).length}`,
  ).join(', ');
  record({
    id: 'themed-bodies',
    ok: themed.length >= FLOORS.themedBodies,
    label: 'themed prose bodies',
    actual: String(themed.length),
    floor: `floor ${FLOORS.themedBodies}`,
    weight:
      'LOAD-BEARING — this is the floor that keeps the site from being a price sheet. ' +
      `Margin over the floor: ${themed.length - FLOORS.themedBodies}.`,
    notes: [
      `themes: must contain one of ${REQUIRED_THEMES.join(' / ')} — ${byTheme}.`,
      'Counted only among entries that passed the prose bar above, never among stubs.',
      themed.length ? `e.g. ${themed.slice(0, 3).map((d) => d.data.id).join(', ')}` : '',
    ].filter(Boolean),
    shortfall:
      `only ${themed.length} prose entr${themed.length === 1 ? 'y' : 'ies'} declare a ` +
      `${REQUIRED_THEMES.join('/')} theme, need ${FLOORS.themedBodies}`,
  });

  for (const [id, type, label, floor] of [
    ['learn', 'learn', 'learn pages', FLOORS.learn],
    ['tutorials', 'tutorial', 'tutorials', FLOORS.tutorials],
    ['posts', 'post', 'blog posts', FLOORS.posts],
    ['deltas', 'delta', 'Impossible -> Routine deltas', FLOORS.deltas],
  ]) {
    const n = corpus[type].length;
    record({
      id,
      ok: n >= floor,
      label,
      actual: String(n),
      floor: `floor ${floor}`,
      // A floor of 0 is a deliberate absence of a floor, not a bar this surface
      // is scraping past — say so rather than printing "LOAD-BEARING" over a
      // count nothing requires (make-the-blog-worth-sending, task 1.2).
      weight:
        floor === 0
          ? `NO FLOOR — this surface is quality-gated, not quota-driven; ${n} is a valid count.`
          : `LOAD-BEARING — all hand-authored. Margin over the floor: ${n - floor}.`,
      shortfall: `only ${n} ${label} in content/${CONTENT_TYPES[type].dir}/, need ${floor}`,
    });
  }
}

function checkToolLinks(corpus) {
  section('CURATED TOOLS — count AND resolution (task 6.6, 6.7)');
  const tools = corpus.tool;
  const unresolved = tools.filter((d) => !corpus.byId.has(d.data.entry));
  const targets = new Set(tools.filter((d) => corpus.byId.has(d.data.entry)).map((d) => d.data.entry));

  record({
    id: 'tools',
    ok: tools.length >= FLOORS.tools,
    label: 'curated tool listings',
    actual: String(tools.length),
    floor: `floor ${FLOORS.tools}`,
    weight: 'LOAD-BEARING — all hand-curated.',
    shortfall: `only ${tools.length} listings in content/directory/tools/, need ${FLOORS.tools}`,
  });

  record({
    id: 'tool-links',
    ok: unresolved.length === 0 && targets.size >= FLOORS.tools,
    label: 'each links a resolvable entry',
    actual: `${tools.length - unresolved.length}/${tools.length} resolve, ${targets.size} distinct`,
    floor: `all resolve, >= ${FLOORS.tools} distinct`,
    weight:
      'LOAD-BEARING — a count of listing files is not a check that the links work. ' +
      'Every `entry:` id is resolved against the loaded entry corpus, and the distinct-target ' +
      'count is required too, because 20 listings pointing at one entry would pass a count.',
    notes: [
      unresolved.length === 0
        ? 'Every listing resolves to an entry that exists.'
        : `Unresolved: ${unresolved.map((d) => `${d.file} -> ${d.data.entry}`).join('; ')}`,
    ],
    shortfall:
      unresolved.length > 0
        ? `${unresolved.length} listing(s) name an entry id that does not exist: ` +
          unresolved.map((d) => `${d.file} -> "${d.data.entry}"`).join('; ')
        : `${tools.length} listings resolve to only ${targets.size} distinct entries, need >= ${FLOORS.tools}`,
  });
}

function checkDerived(corpus, dataDir) {
  section('DERIVED DATA (the Pulse and the build must have run)');
  const derived = join(dataDir, 'derived');

  // Catalog rows.
  const catalogPath = join(derived, 'catalog.json');
  let rows = null;
  let catalogErr = '';
  try {
    const j = JSON.parse(readFileSync(catalogPath, 'utf8'));
    rows = Array.isArray(j.rows) ? j.rows.length : null;
  } catch (err) {
    catalogErr = err.message;
  }
  record({
    id: 'catalog',
    ok: rows !== null && rows >= FLOORS.catalogRows,
    label: 'model catalog rows',
    actual: rows === null ? `unreadable (${catalogErr})` : String(rows),
    floor: `> 0`,
    notes: ['data/derived/catalog.json — written by the Pulse from the source snapshots.'],
    shortfall:
      rows === null
        ? `data/derived/catalog.json is missing or unparseable (${catalogErr}) — run node pulse/run.mjs`
        : `data/derived/catalog.json has ${rows} rows — run node pulse/run.mjs`,
  });

  // Changed feed, and specifically the seeded history (task 3.8 / 4.7).
  const changesPath = join(dataDir, 'changes.jsonl');
  let total = 0;
  let seeded = 0;
  const malformed = [];
  let feedErr = '';
  try {
    const text = readFileSync(changesPath, 'utf8');
    text
      .split('\n')
      .map((l) => l.trim())
      .forEach((line, i) => {
        if (!line) return;
        total += 1;
        try {
          const o = JSON.parse(line);
          if (o.seeded === true) seeded += 1;
        } catch {
          malformed.push(i + 1);
        }
      });
  } catch (err) {
    feedErr = err.message;
  }
  record({
    id: 'changed-feed',
    ok: feedErr === '' && malformed.length === 0 && total >= FLOORS.changedFeed && seeded >= 1,
    label: 'changed feed (seeded)',
    actual: feedErr ? `unreadable (${feedErr})` : `${total} line(s), ${seeded} seeded`,
    floor: 'non-empty, >= 1 seeded',
    notes: [
      'The home page renders this feed. An empty feed at launch is the failure task 3.8 seeding ' +
        'exists to prevent, so the seeded count is checked separately from the total.',
      malformed.length ? `Malformed JSON on line(s): ${malformed.join(', ')}` : '',
    ].filter(Boolean),
    shortfall: feedErr
      ? `data/changes.jsonl is missing or unreadable (${feedErr})`
      : malformed.length
        ? `data/changes.jsonl has malformed JSON on line(s) ${malformed.join(', ')}`
        : total === 0
          ? 'data/changes.jsonl is empty — the home page would render an empty feed'
          : `data/changes.jsonl has ${total} line(s) but none marked seeded:true — the launch ` +
            'history from task 3.8 is missing',
  });

  // Search index — present, parseable, and covering every page.
  const indexPath = join(derived, 'search-index.json');
  let count = null;
  let docsLen = null;
  let indexErr = '';
  try {
    const j = JSON.parse(readFileSync(indexPath, 'utf8'));
    count = typeof j.count === 'number' ? j.count : null;
    docsLen = Array.isArray(j.docs) ? j.docs.length : null;
  } catch (err) {
    indexErr = err.message;
  }
  const pages = corpus.all.length;
  const covers = count !== null && count === docsLen && docsLen === pages;
  record({
    id: 'search-index',
    ok: indexErr === '' && count >= FLOORS.searchIndex && covers,
    label: 'search index',
    actual: indexErr ? `unreadable (${indexErr})` : `${docsLen} doc(s) for ${pages} page(s)`,
    floor: 'present and covering every page',
    notes: [
      'specs/site: the index covers every page including stubs. "Present" is not enough — an ' +
        'index that is stale by 400 pages exists and finds nothing, so the row count is ' +
        'required to equal the loaded corpus.',
    ],
    shortfall: indexErr
      ? `data/derived/search-index.json is missing or unparseable (${indexErr}) — run npm run build`
      : !covers
        ? `data/derived/search-index.json holds ${docsLen} doc(s) for a corpus of ${pages} ` +
          'page(s) — it is stale; run npm run build'
        : 'data/derived/search-index.json is empty',
  });
}

function checkReviews(corpus, dataDir) {
  section('REVIEW RECORDS (specs/review — every seed prose piece, approved)');
  const reviewsDir = join(dataDir, 'reviews');

  // specs/editorial + task 6.5: "every seed prose piece (entry bodies,
  // education pages, tutorials, posts, deltas)". Tool listings are data rows,
  // not prose, and are not in that set.
  const pieces = [
    ...corpus.entry.filter(hasProseBody),
    ...corpus.learn,
    ...corpus.tutorial,
    ...corpus.post,
    ...corpus.delta,
  ];

  // The join is `lib/reviews.mjs`'s, run over its whole fixed piece list —
  // the build's list, which is a superset of the one checked below. Resolving
  // the superset is what makes the orphan report mean what it says: a record
  // attached to a short-bodied entry is claimed, so it is not reported as an
  // orphan beside it.
  const resolved = reviewJoin(corpus, { reviewsDir });
  const records = resolved.records;

  const problems = [];
  const nonCanonical = [];
  let approved = 0;
  const seenCite = new Map(); // normalized would-cite -> record name

  // The voice bar's duplicate sweep. Built from EVERY record rather than
  // accumulated across the loop the way `seenCite` is, because that is what the
  // gate does: `existingFieldValues(ctx, jobId, 'readsHuman')` reads every file
  // in `data/reviews/` and excludes only the record under judgment, so a post
  // whose `reads-human` repeats the sentence in an entry's review is refused at
  // merge. A sweep scoped to the posts alone would miss exactly that case and
  // pass a record the gate rejects — which is the drift, in the other direction.
  const voiceByValue = new Map(); // normalized reads-human -> record names
  for (const rec of records.values()) {
    const val = normalizeField(rec.verdict.readsHuman);
    if (!val) continue;
    if (!voiceByValue.has(val)) voiceByValue.set(val, []);
    voiceByValue.get(val).push(rec.name);
  }
  const voiceHeld = pieces.filter((d) => needsReadsHuman(d.type)).length;

  for (const c of resolved.contended) {
    problems.push(`data/reviews/${c} — one record cannot be the review of two pieces.`);
  }

  // `corrections:` shape (specs/review, beads addictedtoai-4fo): front matter
  // is append-only history, and this is the mechanically-checked correction
  // path — reusing the `[{date, text}]` shape `lib/schema.mjs` already uses
  // for `post.corrections`. Checked over EVERY record in data/reviews/, not
  // just the ones joined to a reviewable piece: the shape can be wrong on a
  // record for a machinery job or an unjoined subject too, and the same rule
  // the merge gate refuses at (`corrections-malformed`) applies here so a
  // malformed correction cannot become valid merely by predating this check.
  let withCorrections = 0;
  for (const rec of records.values()) {
    if (rec.verdict.corrections?.length) withCorrections += 1;
    for (const w of rec.verdict.correctionWarnings ?? []) {
      problems.push(`data/reviews/${rec.name}: malformed \`corrections:\` entry — ${w}`);
    }
  }

  // The four states, from the one join (specs/review, beads addictedtoai-zlq).
  // MISMATCHED fails: a record exists, it carries a hash for this piece, and
  // the piece's reviewed surface has moved since — the approval describes text
  // that no longer exists. UNBOUND fails NOTHING: every record from the seed
  // wave carries no hash, and a mechanism that failed on every pre-existing
  // record could not land. The two are never collapsed into `missing`, which
  // means unreviewed and is the opposite finding.
  const states = reviewStateReport(resolved);
  problems.push(...mismatchProblems(states));

  for (const doc of pieces) {
    const candidates = reviewCandidates(doc);
    const hit = resolved.byFile.get(doc.file);
    const rec = hit?.record ?? null;
    const how = hit?.matchedBy ?? '';
    if (!rec) {
      // Both forms are named: the canonical one is collision-free across
      // surfaces, the short one is what data/reviews/README.md documents.
      const short = candidates[candidates.length - 1];
      problems.push(
        `${doc.file}: NO RECORD — expected data/reviews/${candidates[0]}` +
          (short === candidates[0] ? '' : ` (or ${short})`),
      );
      continue;
    }
    if (how) nonCanonical.push(how);

    const v = rec.verdict;
    if (!VERDICTS.includes(v.verdict)) {
      problems.push(
        `${doc.file}: ${rec.name} carries no verdict from ${VERDICTS.join(' / ')} ` +
          `(found ${JSON.stringify(v.verdict)}).`,
      );
      continue;
    }
    if (v.verdict !== 'approve') {
      problems.push(
        `${doc.file}: ${rec.name} records \`${v.verdict}\`${v.reasons.length ? ` (${v.reasons.join(', ')})` : ''}, ` +
          'not `approve` — an unapproved piece may not launch.',
      );
      continue;
    }
    if (!v.wouldCite) {
      problems.push(
        `${doc.file}: ${rec.name} approves with an EMPTY \`would-cite\`. specs/review: an ` +
          '`approve` with the field blank is not a valid verdict and the merge refuses it.',
      );
      continue;
    }
    const norm = normalizeWouldCite(v.wouldCite);
    const dup = seenCite.get(norm);
    // A record that covers several pieces is ONE review with ONE `would-cite`,
    // not several recycled ones. The rule specs/review states is that a
    // REVIEWER must not reuse a sentence across reviews; comparing a record
    // against itself is not that. This mattered the moment a job batched a
    // cohort: j-20260902-05 reviewed two Anthropic "(Fast)" pages in one
    // record, and the check reported "j-20260902-05.md's `would-cite` is
    // identical to j-20260902-05.md's" — a sentence being identical to itself.
    if (dup && dup !== rec.name) {
      problems.push(
        `${doc.file}: ${rec.name}'s \`would-cite\` is identical (after trimming) to ${dup}'s. ` +
          'specs/review refuses a recycled sentence at merge; it does not become valid at launch.',
      );
      continue;
    }
    // Recorded here, before the voice checks below, rather than after them: a
    // sentence a record actually carries is taken by that record whether or not
    // the record clears the rest of the gate, and the merge gate's sweep reads
    // it the same way. Registering it only on a fully clean piece would let a
    // later piece recycle a sentence the gate would have refused.
    seenCite.set(norm, rec.name);

    // The voice question — `post` only, on the gate's own scope. specs/review
    // holds a post's verdict to a non-empty, non-duplicate `reads-human` on the
    // same terms and at the same point as `would-cite`, and the two rules are
    // applied in that order here for the same reason the gate applies them in
    // that order: a record missing both should say so once.
    //
    // This is the only place in the launch check where a rule bites a surface
    // that is currently empty. That is not a reason to soften it — the check
    // exists to be right on the day the surface fills, and the prebuild voice
    // lint is advisory, so this field is the entire mechanical bar between
    // machine-made prose and the live site.
    if (needsReadsHuman(doc.type)) {
      // The bar belongs to the PIECE, not to whichever record happens to be
      // current for it. The merge gate asks the voice question of post JOBS;
      // this check asks it of post PIECES; the two agree on the predicate and
      // used to differ on its subject, which is a divergence this file's own
      // header has twice claimed cannot happen.
      //
      // Measured 2026-09-02: `j-20260902-23`, a REPAIR job, corrected three
      // licence sentences in a published post. Its reviewer saw a diff and
      // correctly wrote no `reads-human` — it said so in the record — and that
      // record superseded `j-20260902-20.pass2.md`, which approved the post
      // with a full voice verdict. The post had been reviewed for voice and
      // read as though it never had.
      //
      // So the question is whether ANY approving reviewer ever answered it for
      // this piece, not whether the newest one did. Whether a repair that
      // rewrites a post's prose should re-take the voice verdict is a real and
      // separate question — the `reviewed:` hash already tracks moved bytes —
      // and it is carried by its own issue rather than decided here.
      const voiceRec =
        normalizeField(v.readsHuman) && v.verdict === 'approve'
          ? rec
          : (hit.declaredBy ?? []).find(
              (r) => r.verdict?.verdict === 'approve' && normalizeField(r.verdict.readsHuman),
            ) ?? null;
      if (!voiceRec) {
        const also = (hit.declaredBy ?? []).map((r) => r.name).filter((n) => n !== rec.name);
        problems.push(
          `${doc.file}: no approving record carries a \`reads-human\`. The current record is ` +
            `${rec.name}` +
            (also.length ? `, and the others naming this piece are ${also.join(', ')}` : '') +
            '. specs/review: the voice question is asked, not merely available, and the merge ' +
            'gate refuses such a record (`reads-human-empty`). The prebuild voice lint only ' +
            'warns, so this field is the bar.',
        );
        continue;
      }
      const twins = (voiceByValue.get(normalizeField(voiceRec.verdict.readsHuman)) ?? []).filter(
        (n) => n !== voiceRec.name,
      );
      if (twins.length) {
        problems.push(
          `${doc.file}: ${voiceRec.name}'s \`reads-human\` is identical (after trimming) to the ` +
            `field in ${twins.join(', ')}. specs/review refuses a recycled sentence at merge ` +
            '(`reads-human-duplicate`); it does not become valid at launch.',
        );
        continue;
      }
    }
    approved += 1;
  }

  const orphans = resolved.orphans;

  record({
    id: 'reviews',
    ok: problems.length === 0 && pieces.length > 0,
    label: 'seed prose pieces reviewed',
    actual: `${approved}/${pieces.length} approved with a non-empty would-cite`,
    floor: 'all, none blank, none duplicated',
    weight:
      'LOAD-BEARING — matched piece by piece, never counted. A file count in data/reviews/ ' +
      'would pass with every record attached to the same piece.',
    notes: [
      `Pieces: ${corpus.entry.filter(hasProseBody).length} entry bodies, ${corpus.learn.length} learn, ` +
        `${corpus.tutorial.length} tutorial, ${corpus.post.length} post, ${corpus.delta.length} delta.`,
      `${records.size} record(s) in data/reviews/.` +
        (orphans.length
          ? ` ${orphans.length} claimed by no piece: ${orphans.join(', ')} — an orphan beside a ` +
            'missing piece means the naming does not match, not that a review is absent.'
          : ''),
      `Binding, over all ${states.total} reviewable piece(s): ${reviewStateLine(states)}. ` +
        'A record names the bytes it judged (`reviewed:`), so `mismatched` — reviewed and then ' +
        'changed — is a different finding from `missing`, which is unreviewed. `mismatched` ' +
        'fails this check and never changes a page\'s indexability. `unbound` is a record ' +
        'written before that key existed: it is counted, it fails nothing, and the only thing ' +
        'to watch is that the number falls.',
      'Verdict parsing and the duplicate rule come from loop/lib/verdict.mjs, so this check and ' +
        "the loop's merge gate agree on what a valid record is. The piece -> record lookup comes " +
        'from lib/reviews.mjs, so this check and the build\'s indexability rule agree on which ' +
        'record belongs to which piece.',
      `The voice bar — a non-empty, non-duplicated \`reads-human\` — is applied to ${voiceHeld} ` +
        `piece(s): the ${READS_HUMAN_TYPES.join(' / ')} type(s) loop/lib/review.mjs scopes it to, ` +
        'imported rather than restated. Its duplicate sweep reads all ' +
        `${voiceByValue.size} distinct \`reads-human\` value(s) across every record, not just the ` +
        'post ones, because the merge gate does.' +
        (voiceHeld === 0
          ? ' NOTHING IS HELD TO IT THIS RUN — the surface is empty, so this rule is verified by ' +
            'its tests and not by this corpus.'
          : ''),
      nonCanonical.length
        ? `${nonCanonical.length} record(s) matched by an accepted alternate name rather than the ` +
          `canonical one: ${nonCanonical.slice(0, 6).join(', ')}` +
          (nonCanonical.length > 6 ? `, +${nonCanonical.length - 6} more` : '')
        : '',
      `${withCorrections} record(s) in data/reviews/ carry a well-formed \`corrections:\` entry — ` +
        'front matter is append-only history (addictedtoai-4fo): a stale `would-cite` is corrected ' +
        'by appending a dated `{date, text}` entry, never by editing the field, and a malformed ' +
        'entry fails this check by name.',
    ].filter(Boolean),
    shortfall:
      problems.length === 0
        ? 'no seed prose pieces were found to review — the corpus is empty'
        : `${problems.length} of ${pieces.length} piece(s) are not cleared to launch`,
  });

  if (problems.length) {
    out('\n        Every uncleared piece is listed — none is elided, because a review check that\n');
    out('        shows the first ten is a review check nobody can act on. A record is looked up\n');
    out('        by the canonical name shown, then by these alternates, then by a front-matter\n');
    out(`        field naming the file (${SUBJECT_KEYS.join(' / ')}):\n`);
    out('          seed-<kind>-<slug>.md, seed-<type>-<slug>.md, seed-<slug>.md\n\n');
    for (const p of problems) out(`          - ${p}\n`);
  }
  return problems;
}

function checkBuild(runBuild) {
  section('BUILD');
  if (!runBuild) {
    skipped(
      'build',
      'npm run build',
      '--no-build was passed. THE BUILD WAS NOT VERIFIED BY THIS RUN. A launch decision ' +
        'needs it; run without the flag.',
    );
    return;
  }
  out('  running `npm run build` ...\n');
  const started = Date.now();
  const res = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const secs = ((Date.now() - started) / 1000).toFixed(0);
  const ok = res.status === 0;
  const text = `${res.stdout ?? ''}\n${res.stderr ?? ''}`;
  const tail = text.trim().split('\n').slice(-14).join('\n          ');
  record({
    id: 'build',
    ok,
    label: 'npm run build',
    actual: ok ? `exit 0 in ${secs}s` : `exit ${res.status} after ${secs}s`,
    floor: 'exit 0',
    notes: ok
      ? ['Every content gate in lib/build-content.mjs ran, and the static export succeeded.']
      : [`Last lines:\n          ${tail}`],
    shortfall: `npm run build exited ${res.status} — the site does not build`,
  });
}

// ---------------------------------------------------------------------------

function mintLedger(dataDir) {
  const ids = new Set();
  const sources = [];
  const sourcesDir = join(dataDir, 'sources');
  if (!existsSync(sourcesDir)) return { ids, sources };
  for (const name of readdirSync(sourcesDir)) {
    const file = join(sourcesDir, name, 'minted.json');
    if (!existsSync(file)) continue;
    try {
      const j = JSON.parse(readFileSync(file, 'utf8'));
      let n = 0;
      for (const v of Object.values(j)) {
        if (v && typeof v.entry_id === 'string') {
          ids.add(v.entry_id);
          n += 1;
        }
      }
      if (n) sources.push(`${name}: ${n}`);
    } catch {
      /* an unreadable mint ledger means "nothing known to be minted" — which
         makes the entry floor look load-bearing rather than trivial, i.e. it
         errs toward claiming less. */
    }
  }
  return { ids, sources };
}

function parseArgs(argv) {
  const opts = { build: true, contentRoot: CONTENT_DIR, dataDir: DATA_DIR };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const need = () => {
      const v = argv[++i];
      if (!v) throw new Error(`${a} needs a directory`);
      return resolve(v);
    };
    if (a === '--no-build') opts.build = false;
    else if (a === '--content-root') opts.contentRoot = need();
    else if (a === '--data-dir') opts.dataDir = need();
    else if (a === '--help' || a === '-h') opts.help = true;
    else throw new Error(`unknown argument "${a}"`);
  }
  return opts;
}

export async function verifyLaunch(opts = {}) {
  const contentRoot = opts.contentRoot ?? CONTENT_DIR;
  const dataDir = opts.dataDir ?? DATA_DIR;

  out(`verify-launch — the launch minimums for build-initial-site (task 6.6)\n`);
  out(`  content ${contentRoot}\n  data    ${dataDir}\n`);

  // The corpus is loaded with a Diagnostics that is never thrown, so one bad
  // file reports as one bad file instead of aborting every count below it.
  const diags = new Diagnostics();
  const corpus = await loadCorpus({ contentRoot, diags });
  const mint = mintLedger(dataDir);

  section('CORPUS');
  out(
    `  ${corpus.entry.length} entry, ${corpus.learn.length} learn, ${corpus.tutorial.length} tutorial, ` +
      `${corpus.post.length} post, ${corpus.tool.length} tool, ${corpus.delta.length} delta ` +
      `= ${corpus.all.length} page(s)\n`,
  );
  record({
    id: 'corpus-loads',
    ok: diags.errors.length === 0,
    label: 'every content file is valid',
    actual: diags.errors.length === 0 ? 'no errors' : `${diags.errors.length} error(s)`,
    floor: 'no errors',
    notes:
      diags.errors.length === 0
        ? ['Schema, ids, kinds, duplicates and cross-file references all resolve.']
        : diags.errors.slice(0, 10).map((e) => `${e.file}: ${e.field}: ${e.message}`),
    shortfall:
      `${diags.errors.length} content file(s) failed validation and were DROPPED from every ` +
      'count below — fix these first, the counts under them are not trustworthy',
  });

  checkCorpusFloors(corpus, mint);
  checkToolLinks(corpus);
  checkDerived(corpus, dataDir);
  checkReviews(corpus, dataDir);
  checkBuild(opts.build !== false);

  const failed = results.filter((r) => !r.ok);
  const skips = results.filter((r) => r.skipped);
  section('RESULT');
  if (failed.length === 0) {
    out(`  ${results.length - skips.length} check(s) passed`);
    out(skips.length ? `, ${skips.length} SKIPPED and therefore unverified\n` : '\n');
    out('  The launch minimums are met.\n');
  } else {
    out(`  ${failed.length} of ${results.length} check(s) FAILED:\n`);
    for (const r of failed) out(`    - ${r.label}: ${r.shortfall ?? r.actual}\n`);
    out('  The launch minimums are NOT met.\n');
  }
  return { results, failed, ok: failed.length === 0 };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stdout.write(`verify-launch: ${err.message}\n`);
    process.exit(2);
  }
  if (opts.help) {
    process.stdout.write(
      'usage: node scripts/verify-launch.mjs [--no-build] [--content-root DIR] [--data-dir DIR]\n',
    );
    process.exit(0);
  }
  const { ok } = await verifyLaunch(opts);
  process.exit(ok ? 0 : 1);
}
