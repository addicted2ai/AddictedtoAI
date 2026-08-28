/**
 * queue.mjs — work source 2, the Pulse's derived queue.
 *
 * `data/derived/queue.json` is written by the Pulse and only read here. It is
 * a ranked snapshot, recomputed every run, capped at 50, with no identity and
 * no history — it cannot backlog (specs/pulse). The loop therefore never
 * writes to it, never marks an item done, and never remembers one.
 *
 * ---------------------------------------------------------------------------
 * THE CONTRACT THE LOOP READS (documented here because two waves meet at this
 * file). The reader is deliberately tolerant about shape and strict about
 * meaning:
 *
 *   { "generated_at": "<iso>", "items": [ ... ] }         // or a bare array
 *
 * Each item:
 *   type      REQUIRED, from the closed job-type list in specs/loop. An item
 *             with an unknown type is skipped with a warning rather than
 *             guessed at.
 *   id        optional stable-ish handle for logging
 *   title     one line, what needs doing
 *   detail    free text for the brief
 *   rank      optional number, carried through as data and NOT used for
 *             ordering. **File order is the ranking.** specs/pulse calls the
 *             queue "a ranked snapshot" and the Pulse writes it already
 *             sorted by its own total order — in which `rank` is DESCENDING
 *             (higher is more important: `refusing-source` 100, then
 *             `broken-link` 90, down to `want-eligible-mint` 30). Re-sorting
 *             here by ascending rank, which an earlier version of this reader
 *             did, inverted the Pulse's priorities exactly: the least urgent
 *             item would have been selected first, every run, silently.
 *   target    optional repository path the work concerns
 *   field     optional changed field name — `price`/`licence`/`status` make an
 *             `interpret` item MATERIAL, which is what keeps it selectable at
 *             shed level 3 (specs/loop)
 *   subject   optional; `subject_kind: "tutorial"` marks a `verify` item as
 *             tutorial re-verification, which outranks new `tutorial` work
 *             (specs/education-dynamic)
 * ---------------------------------------------------------------------------
 */

import { readFileSync, existsSync } from 'node:fs';
import { JOB_TYPES, MATERIAL_FIELDS } from './config.mjs';

export function readQueue(ctx) {
  if (!existsSync(ctx.queuePath)) {
    return { items: [], warnings: [`${ctx.queuePath} does not exist — the Pulse has not run yet`] };
  }
  let doc;
  try {
    doc = JSON.parse(readFileSync(ctx.queuePath, 'utf8'));
  } catch (e) {
    return { items: [], warnings: [`${ctx.queuePath} is not valid JSON: ${e.message}`] };
  }
  const raw = Array.isArray(doc) ? doc : (doc.items ?? doc.queue ?? []);
  const warnings = [];
  const items = [];
  raw.forEach((it, i) => {
    if (!it || typeof it !== 'object') return;
    const type = it.type ?? it.job_type;
    if (!JOB_TYPES.includes(type)) {
      warnings.push(
        `queue item ${i} has type ${JSON.stringify(type)}, which is not in the closed job-type ` +
          `list — skipped rather than guessed at`,
      );
      return;
    }
    const field = (it.field ?? it.changed_field ?? '').toString().toLowerCase();
    items.push({
      source: 'queue',
      type,
      queueIndex: i,
      rank: typeof it.rank === 'number' ? it.rank : null,
      id: it.id ?? it.subject ?? null,
      title: it.title ?? it.detail ?? it.reason ?? `${type} item ${i}`,
      detail: it.detail ?? it.reason ?? '',
      target: it.target ?? it.path ?? null,
      field: field || null,
      material: MATERIAL_FIELDS.includes(field),
      subjectKind: it.subject_kind ?? it.subjectKind ?? null,
      raw: it,
    });
  });
  // No sort. The file's order is the ranking.
  return { items, warnings, generated_at: doc.generated_at ?? null };
}

/**
 * Tutorial upkeep priority (specs/education-dynamic): "Re-verifying existing
 * tutorials ... SHALL take priority over writing new tutorials whenever both
 * compete for the same budget."
 *
 * Applied as an ordering rule inside the queue source, so the refusal names
 * the rule when a `tutorial` item is passed over.
 */
export function isTutorialVerify(item) {
  if (item.type !== 'verify') return false;
  if (item.subjectKind === 'tutorial') return true;
  const t = `${item.target ?? ''}`.replace(/\\/g, '/');
  return t.includes('content/tutorials/');
}

/**
 * The demotion gate (specs/education-dynamic): "A new tutorial SHALL NOT be
 * started while any existing tutorial stands demoted for staleness, unless the
 * demoted tutorial's subject is dead (archival is the correct end state, not
 * re-verification)."
 *
 * Reads `data/derived/freshness.json`. Contract, tolerant about shape:
 * a tutorial record blocks when it is demoted and NOT archived / subject-dead.
 */
export function demotedTutorials(ctx) {
  if (!existsSync(ctx.freshnessPath)) return [];
  let doc;
  try {
    doc = JSON.parse(readFileSync(ctx.freshnessPath, 'utf8'));
  } catch {
    return [];
  }
  const pools = [doc.tutorials, doc.records, doc.items, Array.isArray(doc) ? doc : null];
  const records = pools.find(Array.isArray) ?? [];
  return records.filter((r) => {
    if (!r || typeof r !== 'object') return false;
    const state = String(r.state ?? r.status ?? '').toLowerCase();
    const isDemoted = r.demoted === true || state === 'demoted';
    if (!isDemoted) return false;
    const archived = r.archived === true || state === 'archived';
    const subjectStatus = String(r.subject_status ?? r.subjectStatus ?? '').toLowerCase();
    const dead = r.subject_dead === true || subjectStatus === 'dead' || subjectStatus === 'retired';
    return !archived && !dead;
  });
}
