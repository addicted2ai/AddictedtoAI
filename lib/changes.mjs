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
import { DATA_DIR } from './paths.mjs';

export const CHANGES_FILE = join(DATA_DIR, 'changes.jsonl');

/** Material change kinds, in the order specs/pulse names them. */
export const MATERIAL_KINDS = ['price', 'context', 'status', 'release', 'retirement'];

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
 * The entry page is deliberately **not** changed to match. Its per-token
 * rendering is a documented decision with a stated rationale, and the result
 * of fixing only this surface is a uniform rule rather than a third
 * convention: comparison surfaces convert and name the scale; entry pages show
 * what the source published and name the unit.
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
  if (line.kind === 'release') return 'released';
  if (line.kind === 'retirement') return 'retired';
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
    if (l?.kind !== 'annotation' || !l.annotates) continue;
    if (!annotations.has(l.annotates)) annotations.set(l.annotates, []);
    annotations.get(l.annotates).push({ date: l.date ?? null, text: l.text ?? '', job: l.job ?? null });
  }

  const feed = lines
    .filter((l) => l && l.kind !== 'annotation')
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
