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
 * ## Which material fields are events (`event: false`), and why the two differ
 *
 * `material_fields` does **double duty**, and that is the whole reason this
 * section exists. `pulse/lib/derive.mjs` builds every catalog row *from* it
 * (`catalogRow`), and skips a source that declares none (`derive.mjs`, the
 * `material_fields.length === 0` guard); `pulse/lib/mint.mjs` builds a minted
 * stub's feed facts from it, which is what puts a price on an entry page. This
 * file reads the same list to decide what is worth a **line in the changed
 * feed**. Those are not the same question, and conflating them is a trap: the
 * cheap way to stop a noisy feed line is to delete the field, and deleting the
 * field blanks the catalog column and the entry-page fact along with it.
 *
 * So a field spec may carry `"event": false`. It stays a column and stays a
 * bound fact; it stops producing change lines. One condition below, in the
 * field loop, is the entire mechanism.
 *
 * It is set on `openrouter-models`' two price fields (addictedtoai-8ho).
 * Measured, not assumed: OpenRouter's `models` endpoint documents its pricing
 * as *"Pricing from the top provider for this model"* — one provider's posted
 * rate, not a blend, with the top provider re-chosen on a rolling 30-second
 * outage window. Across 56 priced models 55 headline prices exactly equalled
 * one endpoint's posted rate and 4 equalled the arithmetic mean, so the value
 * is verbatim but **the referent rotates**, by up to 14.7x between providers
 * on one model. The repo's own committed snapshots show the tell: the same row
 * moving down 10.81% and then down another 10.56% in 20 hours, and another
 * moving down and back up. No vendor cuts a posted price twice in a day and
 * none un-cuts one. A price line here is a routing artifact wearing an event's
 * clothes, and the changed feed is the front page.
 *
 * Not a percentage threshold, deliberately: it fails exactly here, because the
 * artifacts are large (a 60% clock flip, a 14.7x routing flip) and a genuine
 * 2% repricing is small. A threshold suppresses the news and passes the noise.
 *
 * ## Clock-scheduled values (`schedule_rule`)
 *
 * A source may republish a figure on a **timetable**, so two fetches at
 * different times of day read two different numbers off one unchanged price
 * sheet. `openrouter-models` does: rows carry a `pricing.overrides` array, and
 * on some of them the entries are UTC windows. `tencent/hy3` posts
 * 0.000000132 for 00:00-16:00 and 0.0000000825 for 16:00-00:00; this repo
 * recorded a "+60%" change for that row whose previous fetch was 18:19 UTC and
 * whose latest was 07:27 UTC. That is the same price sheet read twice, and any
 * fetch-time drift across 16:00 UTC regenerates it forever.
 *
 * `schedule_rule` declares where those windows live, and `isScheduled` below
 * suppresses the diff for a governed field on a row carrying them — on
 * **either** side, since a row that gains or loses a schedule is equally
 * unreadable. Measured on the 2026-08-29 snapshot: 3 of the 396 rows carry UTC
 * windows. The other 48 rows with a `pricing.overrides` array carry
 * `min_prompt_tokens` long-context tiering instead, which does not move with
 * the clock and is therefore not suppressed — suppressing on the mere presence
 * of the array would have silenced 48 rows for a reason that is not true of
 * them.
 *
 * Why skip rather than compare like-for-like windows. Reconstructing the
 * window a value was read in means recomputing a figure from the schedule and
 * comparing that — a value the source never published, invented by this layer,
 * which is exactly the kind of claim the data layer refuses. A snapshot does
 * carry `fetched_at`, so the *arithmetic* is possible; what is not possible is
 * doing it without asserting a price the vendor did not post. Skipping asserts
 * nothing. The raw values survive in the snapshot and in the catalog row
 * either way.
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

/**
 * Whether one row's value for one field is **clock-scheduled** — republished
 * on a timetable, so the number depends on when it was fetched rather than on
 * anything the vendor changed. See the `schedule_rule` section of this file's
 * header for the measurement behind it.
 *
 * Generic on purpose: the vendor-specific facts (which array holds the
 * windows, which keys mark one, which fields are governed) live in the
 * registry beside `status_rule`, not in this file.
 */
export function isScheduled(source, row, spec) {
  const rule = source?.schedule_rule;
  if (!rule || rule.kind !== 'utc_windows' || !row || !spec) return false;
  const governs = rule.governs ?? [];
  if (governs.length > 0 && !governs.includes(spec.field)) return false;
  const windows = getPath(row, rule.path);
  if (!Array.isArray(windows)) return false;
  const keys = rule.window_keys ?? [];
  return windows.some((w) => w && typeof w === 'object' && keys.some((k) => w[k] !== undefined));
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
      // The two suppressions, and the whole of them. A field the registry
      // marks `event: false` is a catalog column and a bound fact but not an
      // event; a clock-scheduled value differs between fetches without anyone
      // repricing anything. Both are documented at the head of this file.
      if (spec.event === false) continue;
      if (isScheduled(source, row, spec) || isScheduled(source, prevRows[rowId], spec)) continue;
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
