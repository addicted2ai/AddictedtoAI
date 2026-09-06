/**
 * changes.mjs — the changed feed (task 4.7, specs/site).
 *
 * *"The home page SHALL lead with what changed: a dated feed of verified
 * changes ... each line linking into the owning wiki entry and carrying its
 * source. ... in a week where no inference runs at all, the home page still
 * changes every day the world does."*
 *
 * Every line here comes out of `data/changes.jsonl`, which the Pulse appends
 * to mechanically. Nothing on this path invokes a model, which is what makes
 * the sentence above true rather than aspirational.
 *
 * Two line kinds share the file (`pulse/lib/diff.mjs`):
 *   - a **change**, written by the Pulse's diff, carrying a `key`, a date, a
 *     source URL and the source-row excerpt it was read from;
 *   - an **annotation**, written by the loop's `interpret` job, keyed to a
 *     change by `annotates`. specs/loop: the changed feed "renders [it]
 *     alongside the mechanical line". It is attached here, never merged: the
 *     mechanical line stays exactly what the machine observed and the
 *     judgment is visibly separate.
 *
 * The join to a wiki entry is by **declared row id**, never by name
 * (specs/wiki). A change whose row no entry declares still renders — it just
 * links its source instead of an entry.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatPrice, perMillion } from './catalog.mjs';
import { KIND, unrecognisedKinds } from './change-kinds.mjs';
import { DATA_DIR } from './paths.mjs';

export const CHANGES_FILE = join(DATA_DIR, 'changes.jsonl');

/*
 * `MATERIAL_KINDS` used to sit here — five values, commented "Material change
 * kinds, in the order specs/pulse names them", imported nowhere, and wrong:
 * three of them (`price`, `context`, `status`) are material FIELD names carried
 * on a line's `field` and appear as a `kind` on zero of the 182 committed
 * lines. It was deleted rather than updated (`separate-a-claim-from-a-fact`
 * task 18), because updating it would have left two lists, one of which is
 * unread. The one home for the kinds is `lib/change-kinds.mjs`.
 */

export async function readChanges(file = CHANGES_FILE) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  const out = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed));
    } catch {
      // A malformed line is the Pulse's problem to report, not a reason for
      // the site to stop rendering the other 59.
    }
  }
  return out;
}

/**
 * The build's change-kind report (`scripts/prebuild.mjs`).
 *
 * **REPORTS, NEVER FAILS**, and the asymmetry with the writer's refusal is the
 * decision rather than an oversight (specs/pulse, `separate-a-claim-from-a-fact`
 * task 20). `appendChanges` refuses an undeclared kind at the point the mistake
 * is made; this end reads history that is already committed and cannot be
 * removed, and `readChanges` above already holds that a malformed line is the
 * Pulse's problem to report rather than a reason to stop rendering the others. A
 * build that failed here would let one bad historical line take the whole site
 * down.
 *
 * It lives here rather than in `lib/change-kinds.mjs` so that module stays a
 * pure declaration with no imports (a page component reads the list too), and
 * because the reader it needs is the one directly above it.
 *
 * It prints a line either way: "every kind declared" is a stated measurement,
 * where silence would only be the absence of an alarm.
 *
 * **Both seams are arguments so the step is measurable.** It took its input and
 * its writer from module scope until a review mutated it into `throw` — the
 * exact inversion of the SHALL above — and every test in the change still
 * passed, because the real corpus carries zero unrecognised kinds and the
 * mutated branch never fired. A report whose "does not fail" half no test can
 * reach is a guardrail measured by nothing. The sibling report in this same
 * change, `frontierMetricsReport(registry, write)`, was argument-taking from the
 * start; this one now matches it. `scripts/prebuild.mjs` calls it bare.
 */
export async function changeKindsReportStep(file = CHANGES_FILE, write = (s) => process.stdout.write(s)) {
  const lines = await readChanges(file);
  const counts = unrecognisedKinds(lines);
  if (counts.size === 0) {
    write(`prebuild: change-kinds — ${lines.length} committed line(s), every kind declared\n`);
    return;
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const detail = [...counts.entries()].map(([kind, n]) => `${kind} ${n}`).join(', ');
  write(
    `prebuild: change-kinds — ${total} of ${lines.length} committed line(s) carry an unrecognised kind ` +
      `(${detail}); reported, not fatal: changes.jsonl is append-only history and one bad line must not ` +
      'stop the site rendering the rest\n',
  );
}

/** `${source}|${rowId}` -> entry doc, from every declared `feeds` binding. */
export function feedRowIndex(entries) {
  const index = new Map();
  for (const doc of entries) {
    for (const [source, rowId] of Object.entries(doc.data.feeds ?? {})) {
      index.set(`${source}|${rowId}`, doc);
    }
  }
  return index;
}

const FIELD_LABELS = {
  price_input: 'input price',
  price_output: 'output price',
  context_window: 'context window',
  status: 'status',
};

/**
 * `<source>|<field>` -> a price this source publishes **per single token**.
 *
 * Keyed on the source as well as the field, deliberately and fail-safely: a
 * second price source that already publishes per million tokens would be
 * multiplied into nonsense by a field-name-only rule, and an unlisted source
 * keeps today's verbatim rendering rather than acquiring a wrong one. The unit
 * itself is not asserted here — `lib/units.mjs` declares
 * `openrouter-models|pricing.prompt` and `|pricing.completion` as "USD per
 * token", and these are the change-line field names for those two paths.
 */
const PER_TOKEN_PRICE_FIELDS = new Set([
  'openrouter-models|price_input',
  'openrouter-models|price_output',
]);

const PRICE_SCALE_LABEL = 'per Mtok';

/**
 * ## Why this surface converts when the entry page does not
 *
 * A feed fact is rendered **verbatim** — "a unit names what the source
 * measured; it does not reformat the value" (`lib/units.mjs`). That rule is
 * not being weakened here, because the codebase already drew this exact line
 * and drew it at the same place: `lib/units.mjs` says an entry "does not
 * convert because it shows what the source published" while "the catalog
 * converts because its columns exist to be compared". The changed feed is a
 * comparison surface — a line whose entire content is old-versus-new — and it
 * was the only one of the three giving the reader nothing at all: the catalog
 * renders `$0.80` under a header reading `In / Mtok`, the entry page renders
 * `0.0000008` beside the words "USD per token", and this rendered
 * `input price 0.00000006 → 0.000000045` with no unit and no scale.
 *
 * Two conditions make conversion legitimate rather than a rewrite, and both
 * hold. **The scale is named in the string**, so nothing is silently rescaled.
 * **The raw value survives in the data layer**, verified rather than assumed:
 * `data/changes.jsonl` stores `"old":"0.00000006","new":"0.000000045"`
 * byte for byte, `data/sources/<id>/latest.json` stores `pricing.prompt`
 * unmodified, and `lib/dataset.mjs` exports the column as
 * `price_input_per_token` straight off the catalog row.
 *
 * SUPERSEDED 2026-09-03, and the paragraph that stood here is kept in
 * substance because it was wrong in an instructive way. It read: "The entry
 * page is deliberately **not** changed to match. Its per-token rendering is a
 * documented decision with a stated rationale, and the result of fixing only
 * this surface is a uniform rule rather than a third convention: comparison
 * surfaces convert and name the scale; entry pages show what the source
 * published and name the unit."
 *
 * The maintainer then read a live entry page and said what a reader sees: "it
 * is still displaying the price per single token ... no human wants to know
 * that a token costs $0.000001!" The rule was uniform and the page was
 * unusable. `lib/units.mjs`'s `displayQuantity` now converts on the entry too,
 * under the same two conditions this comment set out — the scale is named in
 * the string, and the raw value survives in the data layer — so all three
 * surfaces print the same string for the same price.
 *
 * ## Precision, and the one case where the catalog's rule is not enough
 *
 * `formatPrice()` is reused, so a feed line and a catalog row show the same
 * number for the same price. Its two-decimals-above-a-cent rule exists to make
 * a 400-row column scannable, and on a feed line it can make a real change
 * render as no change: measured against the 16 price lines in
 * `data/changes.jsonl`, `0.0000001736 → 0.00000016912` collided at
 * `$0.17 → $0.17` (1 of 16). Decimals are therefore widened, but **only** when
 * the two sides would otherwise render identically — a crisp trigger ("a
 * change line must not say nothing changed"), not a threshold. Widening
 * whenever rounding merely blurs the delta was considered and rejected: it
 * needs a magnitude cutoff, and this issue is precisely a lesson in what
 * arbitrary cutoffs do.
 *
 * Returns `[old, new]` already formatted, or null when this line is not a
 * per-token price or carries a value that is not a number — in which case the
 * caller falls back to the verbatim strings.
 */
function perMillionPair(line) {
  if (!PER_TOKEN_PRICE_FIELDS.has(`${line.source}|${line.field}`)) return null;
  const before = line.old == null ? null : formatPrice(line.old);
  const after = line.new == null ? null : formatPrice(line.new);
  if (line.old != null && before === null) return null;
  if (line.new != null && after === null) return null;
  if (before !== null && after !== null && before === after && String(line.old) !== String(line.new)) {
    for (const decimals of [3, 4, 5, 6, 7, 8]) {
      const a = perMillion(line.old), b = perMillion(line.new);
      if (a === null || b === null) return null;
      const wa = `$${a.toFixed(decimals)}`, wb = `$${b.toFixed(decimals)}`;
      if (wa !== wb) return [wa, wb];
    }
    return null; // two distinct strings agreeing to 8 decimals: show them as written
  }
  return [before, after];
}

/** What one line says, in plain words, without an adjective anywhere. */
export function describeChange(line) {
  if (line.kind === KIND.RELEASE) return 'released';
  if (line.kind === KIND.RETIREMENT) return 'retired';
  /*
   * The one branch `lead-change` adds, and it states the EVENT and nothing
   * else. No value, no ratio, no rank, no per-model score — K24 gates an index
   * VALUE on cleared republication rights, and the same rule
   * `flag-what-moved-the-frontier` states for an F2 post's copy ("the
   * publisher's act, never the publisher's numbers") is what this sentence
   * obeys for a history line. The metric's own display label is registry data,
   * carried on the line, so naming which index moved costs no value; it falls
   * back to the metric id and then to the bare event when neither is present.
   * No adjective: the line says the lead changed, never that anything improved
   * — a leader can lose the lead without anything shipping (specs/pulse).
   */
  if (line.kind === KIND.LEAD_CHANGE) {
    const on = line.metric_label ?? line.metric ?? null;
    return on ? `lead changed on ${on}` : 'lead changed';
  }
  const field = FIELD_LABELS[line.field] ?? line.field ?? line.kind;
  const pair = perMillionPair(line);
  const before = pair ? pair[0] : line.old;
  const after = pair ? pair[1] : line.new;
  const scale = pair ? ` ${PRICE_SCALE_LABEL}` : '';
  if (line.old != null && line.new != null) return `${field} ${before} → ${after}${scale}`;
  if (line.new != null) return `${field} now ${after}${scale}`;
  return String(line.kind ?? 'changed');
}

/**
 * The feed, newest first, annotations attached to their changes.
 *
 * @param {object[]} lines    every line of changes.jsonl
 * @param {object} opts       { entries, limit }
 * @returns {{date, key, kind, title, detail, entry, source_url, item_url,
 *            seeded, annotations}[]}
 */
export function changedFeed(lines, opts = {}) {
  const index = feedRowIndex(opts.entries ?? []);
  const annotations = new Map();
  for (const l of lines) {
    if (l?.kind !== KIND.ANNOTATION || !l.annotates) continue;
    if (!annotations.has(l.annotates)) annotations.set(l.annotates, []);
    annotations.get(l.annotates).push({ date: l.date ?? null, text: l.text ?? '', job: l.job ?? null });
  }

  const feed = lines
    .filter((l) => l && l.kind !== KIND.ANNOTATION)
    .map((l) => {
      const entry = index.get(`${l.source}|${l.row_id}`) ?? null;
      return {
        date: l.date ?? null,
        key: l.key ?? null,
        kind: l.kind ?? 'change',
        title: l.display_name ?? l.excerpt?.title ?? l.row_id ?? '(unnamed row)',
        detail: describeChange(l),
        entry: entry ? { id: entry.data.id, url: entry.url, name: entry.data.display_name } : null,
        source: l.source ?? null,
        source_url: l.source_url ?? l.item_url ?? null,
        item_url: l.item_url ?? null,
        seeded: Boolean(l.seeded),
        annotations: (annotations.get(l.key) ?? []).sort((a, b) =>
          String(a.date).localeCompare(String(b.date)),
        ),
      };
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.key).localeCompare(String(b.key)));

  return opts.limit ? feed.slice(0, opts.limit) : feed;
}

/** Feed lines grouped by date — the shape the date rail renders. */
export function groupByDate(feed) {
  const groups = [];
  for (const line of feed) {
    const last = groups[groups.length - 1];
    if (last && last.date === line.date) last.lines.push(line);
    else groups.push({ date: line.date, lines: [line] });
  }
  return groups;
}
