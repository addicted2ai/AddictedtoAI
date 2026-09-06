/**
 * registry.mjs — load and validate `data/sources/registry.json` (specs/pulse).
 *
 * The registry is the only place a source may be declared. It records, per
 * source: URL, the fields it yields, which field is the row id (the join key
 * entries declare in their `feeds` map — see specs/wiki), `fetch_every_days`,
 * `expected_change_days`, the optional `mints` mapping, the optional
 * `declined_fields` refusals (see `validateDeclinedFields`), and the
 * robots/terms check with its date.
 *
 * Validation is strict and fails loudly: a malformed registry is a broken
 * engine, not something to work around. Adding or removing a source is an
 * ordinary data change, not an OpenSpec change.
 */

import { paths, readJson } from './core.mjs';

const FORMATS = new Set(['json', 'rss']);

/**
 * The only verdict a `declined_fields` entry may record.
 *
 * Carrying a field is expressed by `material_fields` — which is what builds the
 * catalog column, the entry-page fact and (unless `event: false`) the changed-feed
 * line. So a `declined_fields` entry saying "column" or "fact" would be a decision
 * written in the one place that cannot enact it: it would read as settled and do
 * nothing, which is the exact failure `declined_fields` exists to end.
 */
const DECLINED_DECISION = 'not carried';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Do two dotted paths name the same field, or one an ancestor of the other?
 *
 * Exported because the refusal has a second enforcement point that this module
 * cannot host: `lib/declined-fields.mjs` runs the same test against every
 * `facts[].path` in `content/wiki/**`, which the Pulse's engine must not load.
 * The two halves share this predicate rather than each carrying a copy, so they
 * cannot drift into disagreeing about what "the same field" means.
 */
export function pathsOverlap(a, b) {
  return a === b || a.startsWith(`${b}.`) || b.startsWith(`${a}.`);
}

/**
 * Validate a source's `declined_fields` — the fields it serves that this repo
 * has looked at and deliberately does not carry.
 *
 * ## Why this list exists at all (2026-09-05)
 *
 * `material_fields_note` distinguishes a field that is a column and a fact from
 * one that is also an event (`event: false`), because deleting a field and
 * marking it non-event look identical from the outside and are not the same
 * thing. There is a third state it does not cover, and it is the one a growing
 * upstream API produces by default: a field in NEITHER list. Nobody looked. From
 * the outside that is indistinguishable from a considered refusal, so the next
 * reader cannot tell an answered question from an unasked one — and re-answering
 * it costs a measurement every time.
 *
 * `openrouter-models` had one. OpenRouter added a `benchmarks.artificial_analysis`
 * block after the registry entry was written; between the 2026-09-04 and
 * 2026-09-05 snapshots 165 of the 179 rows carrying it moved, every directional
 * move downward, and the site recorded nothing anywhere. The decision — not a
 * column, not a fact, not an event — and the measurement behind it are in the
 * registry entry. This function is what makes that decision hold:
 *
 *   - a path is CARRIED or REFUSED, never both, in either direction of prefix
 *     overlap. Adding the declined path back to `material_fields` without
 *     removing the refusal fails the registry loudly instead of quietly shipping
 *     a column that is blank on seven-eighths of rows;
 *   - a refusal carries a `decided_on` date and a `note`, because a refusal with
 *     no measurement behind it is the undecided state wearing a label.
 *
 * WHAT THIS FUNCTION CANNOT SEE, and where the other half lives. "Carried" has
 * a second spelling: an entry may bind a feed path as a `source: feed` fact, and
 * that value renders on a published page exactly as a material field does. This
 * module never opens `content/wiki/**` — the Pulse's engine must stay able to
 * fetch, diff and derive without the corpus loaded — so for the first day of the
 * refusal's life, 48 fact bindings across 29 model entries pointed at
 * `benchmarks.artificial_analysis` while this function passed. The corpus half
 * is `lib/declined-fields.mjs`, a prebuild step, sharing `pathsOverlap` with
 * this one so the two cannot disagree about what "the same field" means.
 *
 * What this deliberately does NOT do: require that every path a snapshot serves
 * be accounted for by one of the three lists. That check is what would make the
 * undecided state unreachable rather than merely nameable, and it cannot pass
 * until the 23 other unaccounted `openrouter-models` paths are each decided —
 * which is a different job's outcome, not this one's. Filed as addictedtoai-eexr
 * so it does not die with the job that found it.
 */
function validateDeclinedFields(source, where) {
  const declined = source.declined_fields;
  if (declined === undefined || declined === null) return;
  if (!Array.isArray(declined)) throw new Error(`${where}: "declined_fields" must be an array`);

  const carried = (source.material_fields ?? []).map((spec) => spec?.path).filter((p) => typeof p === 'string');
  const seen = new Set();
  for (const entry of declined) {
    const path = entry?.path;
    if (typeof path !== 'string' || path === '') {
      throw new Error(`${where}: a "declined_fields" entry is missing a string "path"`);
    }
    if (seen.has(path)) throw new Error(`${where}: "declined_fields" declares "${path}" twice`);
    seen.add(path);
    if (entry.decision !== DECLINED_DECISION) {
      throw new Error(
        `${where}: "declined_fields" entry "${path}" records decision ${JSON.stringify(entry.decision)} — ` +
          `the only legal value is "${DECLINED_DECISION}", because carrying a field is expressed by "material_fields"`,
      );
    }
    if (!DATE.test(entry.decided_on ?? '')) {
      throw new Error(`${where}: "declined_fields" entry "${path}" needs a "decided_on" date (yyyy-mm-dd)`);
    }
    if (typeof entry.note !== 'string' || entry.note.trim() === '') {
      throw new Error(
        `${where}: "declined_fields" entry "${path}" needs a "note" — ` +
          `a refusal with no measurement behind it is the undecided state wearing a label`,
      );
    }
    for (const carriedPath of carried) {
      if (pathsOverlap(carriedPath, path)) {
        throw new Error(
          `${where}: "${path}" is declined and also carried as material field path "${carriedPath}" — ` +
            `a field is carried or refused, never both`,
        );
      }
    }
  }
}

export function loadRegistry(root) {
  const p = paths(root);
  const raw = readJson(p.registry);
  if (!raw) throw new Error(`source registry missing: ${p.registry}`);
  if (!Array.isArray(raw.sources)) throw new Error(`source registry has no "sources" array: ${p.registry}`);

  const seen = new Set();
  for (const s of raw.sources) {
    const where = `registry source "${s?.id ?? '(no id)'}"`;
    if (!s.id || typeof s.id !== 'string') throw new Error(`${where}: missing string "id"`);
    if (seen.has(s.id)) throw new Error(`${where}: duplicate source id`);
    seen.add(s.id);
    if (!s.url) throw new Error(`${where}: missing "url"`);
    if (!FORMATS.has(s.format)) throw new Error(`${where}: "format" must be one of ${[...FORMATS].join(', ')}`);
    if (!s.row_id_field) throw new Error(`${where}: missing "row_id_field" (the join key entries declare)`);
    if (!Number.isFinite(s.fetch_every_days)) throw new Error(`${where}: missing numeric "fetch_every_days"`);
    if (!Number.isFinite(s.expected_change_days)) {
      throw new Error(`${where}: missing numeric "expected_change_days" (the suspect-source input — not the fetch cadence)`);
    }
    if (!s.robots || !s.robots.checked_on || !s.robots.result) {
      throw new Error(`${where}: missing "robots" check with "checked_on" and "result"`);
    }
    if (!s.verification || !s.verification.date || !s.verification.result) {
      throw new Error(`${where}: missing "verification" with "date" and "result"`);
    }
    if (s.mints) {
      if (!s.mints.kind) throw new Error(`${where}: "mints" declared without a "kind"`);
      if (s.mints.slug_from !== 'row_id') {
        throw new Error(`${where}: "mints.slug_from" must be "row_id" — the slug is derived deterministically from the row id`);
      }
    }
    if (s.format === 'json' && !s.rows_path) throw new Error(`${where}: json format needs "rows_path"`);
    validateDeclinedFields(s, where);
  }
  return raw;
}

/** Sources in a stable order, so every derived file is order-independent. */
export function sortedSources(registry) {
  return [...registry.sources].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function findSource(registry, id) {
  return registry.sources.find((s) => s.id === id) ?? null;
}
