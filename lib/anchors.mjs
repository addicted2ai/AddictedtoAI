/**
 * anchors.mjs — the anchor build check (specs/blog, change
 * `make-the-blog-worth-sending` task 3.5).
 *
 * specs/blog, "A news note is anchored in evidence its author cannot create":
 *
 *   *"The build SHALL fail a post whose `covers:` reference resolves to no line
 *   in `data/changes.jsonl`, naming the post file and the unresolved
 *   reference."*
 *
 *   *"The build SHALL fail a post any of whose declared anchor dates falls
 *   outside the 7 days ending on the post's own `date` — **every** declared
 *   anchor, in **both** directions: an anchor after the post's date is as
 *   mislabeled as one more than 7 days before it. An older event a note refers
 *   to in passing is a link in prose, never a declared anchor, so freshness
 *   cannot be laundered by adding one fresh line beside a stale one."*
 *
 * Both fail the build rather than warning, which is this repository's default
 * and the strict reading design D3 committed to. The one advisory check in this
 * change is the voice lint next door, and it is advisory for a measured reason
 * that does not apply here: an unresolved `covers:` key is a fact about the data
 * layer, not a judgment about prose.
 *
 * ## Three decisions this file makes, because the spec text admits two readings
 *
 * **1. The window is seven days inclusive: `[date - 6, date]`.** "The 7 days
 * ending on the post's date" is literally seven calendar days, the last of
 * which is the post's own. The looser reading (`date - 7`, an eight-day span)
 * also fits the English, and design D3 is explicit that where a permissive and
 * a strict reading both fit, the strict one is taken. The consequence worth
 * stating: a note published a full week after its event fails, and that is the
 * intent — the scout's `expires:` windows are at most 7 days for exactly this
 * reason, so a candidate that has aged out of this window has aged out of the
 * docket too. Every failure message names both bounds, so nobody has to
 * reconstruct the arithmetic from the rule.
 *
 * **2. A `covers:` reference resolves on the pair, not on the key alone.** The
 * requirement calls a reference "the `key` and `date` of lines in
 * `data/changes.jsonl`", so a right key with a wrong date resolves to nothing —
 * and it gets its own message naming the date the line actually carries, rather
 * than the useless "no such line". Resolving on the key alone would let a post
 * declare a fresh date over a stale change line, which is precisely the
 * laundering the two-sided window exists to stop.
 *
 * **3. Annotation lines are not anchors.** `data/changes.jsonl` carries two
 * line kinds (`lib/changes.mjs`): mechanical change lines written by the diff,
 * and `kind: 'annotation'` lines written by the loop's `interpret` job, keyed
 * to a change by `annotates`. An annotation is a model's commentary; the whole
 * point of the anchor is evidence *its author cannot create*, so only change
 * lines resolve.
 *
 * The check is a pure function over documents plus feed lines. Nothing here
 * reads the clock: the window is anchored to the post's own declared `date`,
 * which the author writes. specs/blog states that limit plainly — this
 * guarantees internal consistency, not absolute recency, and absolute recency
 * is held by the scout's expiry windows and review's dates check.
 */

import { loadCorpus } from './corpus.mjs';
import { Diagnostics } from './errors.mjs';
import { readChanges } from './changes.mjs';

/** Seven calendar days, the last of which is the post's own `date`. */
export const ANCHOR_WINDOW_DAYS = 7;

const DAY_MS = 86400000;

/** The inclusive window `[from, to]` an anchor date must fall in. */
export function anchorWindow(postDate) {
  const to = String(postDate);
  const t = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  const from = new Date(t - (ANCHOR_WINDOW_DAYS - 1) * DAY_MS).toISOString().slice(0, 10);
  return { from, to };
}

/**
 * `key` -> change line, annotations excluded.
 *
 * A duplicate key keeps the first line, which is also what `changedFeed` sees
 * first; `data/changes.jsonl` is append-only and its keys are the source row's
 * guid, so a duplicate would be a Pulse defect rather than an anchor one.
 */
export function changeLineIndex(lines) {
  const index = new Map();
  for (const l of lines ?? []) {
    if (!l || l.kind === 'annotation') continue;
    if (l.key === null || l.key === undefined) continue;
    const key = String(l.key);
    if (!index.has(key)) index.set(key, l);
  }
  return index;
}

/**
 * Every anchor problem in one corpus, as diagnostics.
 *
 * Returned rather than thrown, and collected rather than short-circuited, for
 * the reason `lib/errors.mjs` states: failing on the first hides the rest and
 * turns one fix into five builds.
 *
 * @param {object[]} posts   `corpus.post` documents
 * @param {object[]} changes `data/changes.jsonl` lines
 * @returns {{file: string, field: string, message: string, rule: string}[]}
 */
export function anchorProblems(posts = [], changes = []) {
  const index = changeLineIndex(changes);
  const problems = [];

  for (const doc of posts) {
    const postDate = doc?.data?.date;
    const window = anchorWindow(postDate);
    const covers = doc?.data?.covers ?? [];
    const anchor = doc?.data?.anchor ?? null;

    // Every DECLARED anchor, both kinds, one list — the requirement says
    // "every declared anchor", and checking only the first would be exactly
    // the laundering it names.
    const declared = [
      ...covers.map((ref, i) => ({ field: `covers[${i}]`, date: ref?.date, what: `covers reference ${JSON.stringify(ref?.key)}` })),
      ...(anchor ? [{ field: 'anchor', date: anchor.date, what: `external anchor ${JSON.stringify(anchor.url)}` }] : []),
    ];

    for (const a of declared) {
      if (!window || !a.date) continue; // the schema already reported a missing/bad date
      if (a.date >= window.from && a.date <= window.to) continue;
      const direction =
        a.date > window.to
          ? 'after the post\'s own date — an anchor cannot postdate the post that declares it'
          : `more than ${ANCHOR_WINDOW_DAYS} days before the post's date`;
      problems.push({
        file: doc.file,
        field: `${a.field}.date`,
        message:
          `${a.what} is dated ${a.date}, which is ${direction}. A post dated ${window.to} may ` +
          `declare anchors dated ${window.from} to ${window.to} inclusive (the ${ANCHOR_WINDOW_DAYS} ` +
          'days ending on the post\'s date), and EVERY declared anchor must fall inside it — a ' +
          'fresh anchor beside this one launders nothing. An older event referred to in passing ' +
          'is a link in prose, never a declared anchor.',
        rule: 'anchor-window',
      });
    }

    covers.forEach((ref, i) => {
      const key = ref?.key;
      if (key === null || key === undefined) return; // schema reported it
      const line = index.get(String(key));
      if (!line) {
        problems.push({
          file: doc.file,
          field: `covers[${i}].key`,
          message:
            `covers reference ${JSON.stringify(String(key))} resolves to no line in ` +
            'data/changes.jsonl — a change-feed anchor must name a ' +
            'line the Pulse actually wrote, copied verbatim from its `key` field. If the event is ' +
            'outside the tracked feeds, declare it as an external `anchor:` with its primary-source ' +
            'URL instead.',
          rule: 'anchor-unresolved',
        });
        return;
      }
      if (ref.date && String(line.date) !== String(ref.date)) {
        problems.push({
          file: doc.file,
          field: `covers[${i}].date`,
          message:
            `covers reference ${JSON.stringify(String(key))} is declared with date ${ref.date}, but ` +
            `that line in data/changes.jsonl is dated ${line.date} — a reference is the key AND the ` +
            'date of one line, so the pair resolves to nothing. Copy the line\'s own date; a note ' +
            'cannot re-date the event it cites.',
          rule: 'anchor-unresolved',
        });
      }
    });
  }

  return problems;
}

/**
 * The prebuild step. Throws, naming every offending post and reference.
 *
 * A corpus with zero posts is trivially clean and says so — the blog restarts
 * empty by decision (task 1.1), and a check that printed nothing at all would
 * be indistinguishable from a check that did not run.
 */
export async function anchorCheckStep(opts = {}) {
  const out = opts.out ?? process.stdout;
  const diags = new Diagnostics();
  // Reference resolution is off: the content step ahead of this one already
  // ran it, and re-reporting `mentions` failures here would double every
  // message a reader has to wade through.
  const corpus = opts.corpus ?? (await loadCorpus({ contentRoot: opts.contentRoot, diags: new Diagnostics(), checkReferences: false }));
  const changes = opts.changes ?? (await readChanges(opts.changesFile));

  for (const p of anchorProblems(corpus.post, changes)) diags.error(p);
  diags.throwIfErrors('anchor');

  const declared = corpus.post.filter(
    (d) => (d.data.covers ?? []).length > 0 || d.data.anchor,
  ).length;
  const refs = corpus.post.reduce(
    (n, d) => n + (d.data.covers ?? []).length + (d.data.anchor ? 1 : 0),
    0,
  );
  const line =
    `prebuild: anchors — ${corpus.post.length} post(s), ${declared} declaring an anchor, ` +
    `${refs} declared anchor(s) checked against ${changes.length} change line(s)\n`;
  out.write(line);
  return { posts: corpus.post.length, declared, refs, line };
}
