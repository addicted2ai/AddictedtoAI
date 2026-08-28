/**
 * diff.mjs — snapshot diffing, the changed feed, and launch-feed seeding.
 *
 * specs/pulse: "Each material change entry SHALL embed the relevant source
 * row (or a minimal excerpt of it) alongside the source URL and date — this
 * embedded excerpt is the **archived source reference**: it is what lets a
 * lifecycle record keep its evidence after the vendor deletes the page."
 *
 * The diff-to-feed filter starts strict on purpose (design, Risks): price,
 * context, status, arrivals, retirements only.
 *
 * ## Why change lines carry a `key`, and what is in it
 *
 * `data/changes.jsonl` is append-only history, and the Pulse is required to
 * be idempotent between world changes. Every emitted line therefore carries
 * a deterministic `key`, and appending skips any key already present:
 *
 *     <source>|<hash of previous rows>|<hash of latest rows>|<row id>|<field>
 *
 * The two hashes are computed from the snapshot files at diff time, so the
 * key is a function of state alone — no clock, no counter. Consequences:
 *
 *   - Running the Pulse twice with an unchanged world recomputes the same
 *     standing diff, every key is already present, and zero lines are added.
 *   - Editing `previous.json` changes the first hash, so the recomputed diff
 *     is genuinely new work and is appended exactly once.
 *   - A value that changes, reverts, and changes back is three distinct
 *     lines, because each pair of snapshots differs.
 *
 * Seeded lines key off the row id alone (`seed|<source>|<row id>`), which is
 * what makes seeding idempotent forever.
 *
 * ## Annotation lines (written by the loop, read here)
 *
 * An `interpret` job appends an annotation to this same file rather than
 * editing history (specs/loop). Its shape, so the queue can tell an
 * interpreted change from an uninterpreted one:
 *
 *     { "kind": "annotation", "annotates": "<the change line's key>",
 *       "date": "<yyyy-mm-dd>", "job": "<job id>", "text": "..." }
 */

import { appendJsonl, daysSince, getPath, readJsonl, today } from './core.mjs';
import { rowsHash } from './sources.mjs';

/** Material fields whose change is worth a human interpretation (specs/pulse). */
export const INTERPRET_FIELDS = new Set(['price_input', 'price_output', 'price', 'license', 'licence', 'status']);

/**
 * Derive a row's lifecycle status when the source serves none of its own.
 * Deterministic, and documented in the registry entry's `status_rule.note`.
 */
export function deriveStatus(source, row) {
  const rule = source.status_rule;
  if (!rule) return null;
  if (rule.kind === 'expiration_date') {
    const expires = getPath(row, rule.path);
    if (!expires) return 'active';
    const daysUntil = -(daysSince(expires) ?? 0);
    if (daysUntil < 0) return 'retired';
    if (daysUntil <= (rule.deprecated_within_days ?? 365)) return 'deprecated';
    return 'active';
  }
  if (rule.kind === 'field') {
    const v = getPath(row, rule.path);
    return v == null ? null : String(v);
  }
  return null;
}

/** The value of one declared material field on one row, normalized for comparison. */
export function materialValue(source, row, spec) {
  const raw = spec.path === '$status' ? deriveStatus(source, row) : getPath(row, spec.path);
  if (raw == null) return null;
  if (typeof raw === 'object') return JSON.stringify(raw);
  return String(raw);
}

export function displayName(source, row) {
  const field = source.display_name_field;
  const v = field ? row?.[field] : null;
  return typeof v === 'string' && v !== '' ? v : null;
}

/** A minimal excerpt of a row: the archived source reference. */
export function excerptRow(source, row) {
  if (!row) return null;
  if (source.format === 'rss') return { ...row };
  const out = {};
  const keep = new Set([source.row_id_field, source.display_name_field, 'created', 'expiration_date', 'canonical_slug']);
  for (const k of keep) if (k && row[k] !== undefined) out[k] = row[k];
  for (const spec of source.material_fields ?? []) {
    if (spec.path === '$status') {
      out.$status = deriveStatus(source, row);
      continue;
    }
    const v = getPath(row, spec.path);
    if (v !== undefined) out[spec.path] = v;
  }
  return out;
}

/**
 * Diff two snapshots into change objects. Pure: takes snapshots, returns
 * objects, touches no files.
 */
export function diffSnapshots(source, previous, latest, { date = today() } = {}) {
  const changes = [];
  if (!previous || !latest) return changes;
  const from = rowsHash(previous);
  const to = rowsHash(latest);
  if (from === to) return changes;

  const prevRows = previous.rows ?? {};
  const nextRows = latest.rows ?? {};
  const key = (rowId, field) => `${source.id}|${from}|${to}|${rowId}|${field}`;
  const base = { date, source: source.id, source_url: source.url };

  for (const rowId of Object.keys(nextRows).sort()) {
    const row = nextRows[rowId];
    if (!(rowId in prevRows)) {
      changes.push({
        ...base,
        key: key(rowId, '$arrival'),
        kind: 'arrival',
        row_id: rowId,
        display_name: displayName(source, row),
        field: null,
        old: null,
        new: null,
        excerpt: excerptRow(source, row),
      });
      continue;
    }
    for (const spec of source.material_fields ?? []) {
      const before = materialValue(source, prevRows[rowId], spec);
      const after = materialValue(source, row, spec);
      if (before === after) continue;
      changes.push({
        ...base,
        key: key(rowId, spec.field),
        kind: 'field_change',
        row_id: rowId,
        display_name: displayName(source, row),
        field: spec.field,
        old: before,
        new: after,
        excerpt: excerptRow(source, row),
      });
    }
  }

  if (source.emit_on_remove) {
    for (const rowId of Object.keys(prevRows).sort()) {
      if (rowId in nextRows) continue;
      const row = prevRows[rowId];
      changes.push({
        ...base,
        key: key(rowId, '$retirement'),
        kind: 'retirement',
        row_id: rowId,
        display_name: displayName(source, row),
        field: null,
        old: null,
        new: null,
        excerpt: excerptRow(source, row),
      });
    }
  }

  return changes;
}

/**
 * Historical records a source carries in its own rows, as dated, sourced,
 * `seeded: true` change lines (specs/pulse: "Launch day shows real history").
 * These are real sourced history, not synthesis; the marker only keeps them
 * distinguishable in the data.
 */
export function seedChanges(source, latest) {
  if (!source.seeds || !latest) return [];
  const cfg = source.seeds;
  const out = [];
  for (const rowId of Object.keys(latest.rows ?? {}).sort()) {
    const row = latest.rows[rowId];
    const rawDate = cfg.date_field ? row[cfg.date_field] : null;
    const parsed = rawDate ? new Date(rawDate) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) continue; // undated history is not history
    out.push({
      key: `seed|${source.id}|${rowId}`,
      date: parsed.toISOString().slice(0, 10),
      kind: 'release',
      seeded: true,
      source: source.id,
      source_url: (cfg.source_url_field ? row[cfg.source_url_field] : null) ?? source.url,
      item_url: row.link ?? null,
      row_id: rowId,
      display_name: (cfg.title_field ? row[cfg.title_field] : null) ?? null,
      field: null,
      old: null,
      new: null,
      excerpt: excerptRow(source, row),
    });
  }
  return out;
}

/** Every key already in the changed feed — the dedupe set. */
export function existingKeys(changesFile) {
  const set = new Set();
  for (const line of readJsonl(changesFile)) if (line && line.key) set.add(line.key);
  return set;
}

/**
 * Append only lines whose key is new. Returns the lines actually written.
 *
 * Callers must act on the returned lines, not on the candidates. The standing
 * diff between `previous` and `latest` is recomputed every run and only
 * rotates when the source actually changes, so a change detected today is
 * recomputed again tomorrow with tomorrow's date. Anything that reacts to a
 * change — the lifecycle timeline append in particular — must therefore be
 * driven by what was newly recorded, or it fires once a day forever.
 */
export function appendChanges(changesFile, candidates) {
  const known = existingKeys(changesFile);
  const fresh = [];
  for (const c of candidates) {
    if (known.has(c.key)) continue;
    known.add(c.key);
    fresh.push(c);
  }
  fresh.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  appendJsonl(changesFile, fresh);
  return fresh;
}

/**
 * Material changes on price/licence/status from the trailing 14 days that no
 * annotation line refers to — the source of the loop's `interpret` jobs.
 */
export function uninterpretedChanges(changesFile, { windowDays = 14, from = undefined } = {}) {
  const lines = readJsonl(changesFile);
  const annotated = new Set();
  for (const l of lines) if (l?.kind === 'annotation' && l.annotates) annotated.add(l.annotates);
  return lines.filter((l) => {
    if (!l || l.kind !== 'field_change' || l.seeded) return false;
    if (!INTERPRET_FIELDS.has(l.field)) return false;
    if (annotated.has(l.key)) return false;
    const age = daysSince(l.date, from);
    return age !== null && age >= 0 && age <= windowDays;
  });
}
