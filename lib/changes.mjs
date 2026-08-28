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

/** What one line says, in plain words, without an adjective anywhere. */
export function describeChange(line) {
  if (line.kind === 'release') return 'released';
  if (line.kind === 'retirement') return 'retired';
  const field = FIELD_LABELS[line.field] ?? line.field ?? line.kind;
  if (line.old != null && line.new != null) return `${field} ${line.old} → ${line.new}`;
  if (line.new != null) return `${field} now ${line.new}`;
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
