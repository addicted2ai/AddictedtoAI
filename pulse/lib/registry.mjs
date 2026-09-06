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

/** The three states a republication decision may record. Closed on purpose. */
export const RIGHTS_OUTCOMES = Object.freeze(['cleared', 'refused', 'unresolved']);

/** Which end of a metric's values counts as leading. */
const DIRECTIONS = new Set(['higher', 'lower']);

/**
 * Validate the registry's `frontier` block — the declared index metrics and the
 * declared row-eligibility exclusions (specs/pulse, "An index is registered with
 * its publisher and its rights"; `separate-a-claim-from-a-fact` task 22).
 *
 * ## What a declared metric must carry, and why each field is here
 *
 * The site runs no benchmarks. Every index it could show is somebody else's
 * aggregate, reaching this repository through a republisher, read on one day —
 * so a metric declares the field name the corpus uses, the path into the source
 * row, the source it is read from, the **publisher**, the publisher's URL, the
 * **republisher** where the site does not read the publisher directly, the
 * direction that counts as leading, and a display label. Without the publisher
 * and the republisher a surface cannot make the only claim the data supports:
 * *the publisher's page says this, as republished by that party, in the snapshot
 * of that date*.
 *
 * ## Rights: absent is a state, and it is not "permitted"
 *
 * `rights` is OPTIONAL and its absence is meaningful. A metric with no
 * republication decision at all is treated as **unregistered for rendering** and
 * is REPORTED by the build (`lib/frontier-metrics.mjs`), never defaulted to
 * permitted — specs/pulse's own scenario, "An unanswered question does not read
 * as a cleared one". It is not fatal here because the registry is data a person
 * edits in steps: declaring the metric first and answering the rights question
 * second is a real sequence, and failing the load would make the honest
 * intermediate state unrepresentable. What IS fatal is a decision that is
 * malformed — an outcome outside the closed set, a `cleared` outcome resting on
 * no verbatim excerpt — because that is a claim about permission with nothing
 * behind it.
 *
 * ## The declined-fields cross-check
 *
 * `declined_fields` records that a path is **not carried** — not a column, not a
 * fact, not an event, after a measurement. Declaring that same path as a
 * frontier metric is carrying it in a fourth sense, so the two lists would be
 * two decisions silently disagreeing. This is the same shape as
 * `validateDeclinedFields`' own carried/refused check, applied to the third
 * list, and it fails loudly naming both ends and the remedy.
 */
function validateFrontier(raw) {
  const frontier = raw.frontier;
  if (frontier === undefined || frontier === null) return;
  const where = 'registry "frontier"';
  if (typeof frontier !== 'object' || Array.isArray(frontier)) throw new Error(`${where}: must be an object`);

  const exclusions = frontier.row_exclusions ?? [];
  if (!Array.isArray(exclusions)) throw new Error(`${where}: "row_exclusions" must be an array`);
  for (const ex of exclusions) {
    const matchers = ['id_prefix', 'id_contains'].filter((k) => ex?.[k] !== undefined);
    if (matchers.length !== 1) {
      throw new Error(
        `${where}: a "row_exclusions" entry must carry exactly one of "id_prefix" or "id_contains" — ` +
          `these are PATTERNS OVER ROW IDS, not facts about the models, and the two forms are all there are ` +
          `so the list cannot grow into an unreviewable expression language`,
      );
    }
    if (typeof ex[matchers[0]] !== 'string' || ex[matchers[0]] === '') {
      throw new Error(`${where}: "row_exclusions" entry has an empty "${matchers[0]}"`);
    }
    if (!DATE.test(ex.decided_on ?? '')) {
      throw new Error(`${where}: "row_exclusions" entry "${ex[matchers[0]]}" needs a "decided_on" date (yyyy-mm-dd)`);
    }
    if (typeof ex.note !== 'string' || ex.note.trim() === '') {
      throw new Error(
        `${where}: "row_exclusions" entry "${ex[matchers[0]]}" needs a "note" carrying the measurement behind it — ` +
          `an exclusion with no measurement is a rule compiled into the data instead of into the code, which is ` +
          `no more reviewable`,
      );
    }
  }

  const metrics = frontier.metrics;
  if (!Array.isArray(metrics)) {
    throw new Error(
      `${where}: "metrics" must be an array — an EMPTY one when no index is registered, never absent. ` +
        `Zero declared metrics is the day-one state and must be stated, not implied`,
    );
  }
  const seenIds = new Set();
  for (const m of metrics) {
    const id = m?.id;
    if (typeof id !== 'string' || id === '') throw new Error(`${where}: a metric is missing a string "id"`);
    const at = `${where} metric "${id}"`;
    if (seenIds.has(id)) throw new Error(`${at}: duplicate metric id`);
    seenIds.add(id);
    for (const key of ['field', 'path', 'source', 'publisher', 'publisher_url', 'label']) {
      if (typeof m[key] !== 'string' || m[key] === '') throw new Error(`${at}: missing string "${key}"`);
    }
    if (!DIRECTIONS.has(m.direction)) {
      throw new Error(`${at}: "direction" must be one of ${[...DIRECTIONS].join(', ')} — which end of the values leads`);
    }
    if (m.republisher !== null && m.republisher !== undefined && typeof m.republisher !== 'string') {
      throw new Error(
        `${at}: "republisher" must be a string or null — null says the site reads the publisher directly, and ` +
          `absent would leave a surface unable to tell the two apart`,
      );
    }
    const source = raw.sources.find((s) => s?.id === m.source);
    if (!source) throw new Error(`${at}: "source" ${JSON.stringify(m.source)} is not a declared source id`);
    for (const declined of source.declined_fields ?? []) {
      if (typeof declined?.path === 'string' && pathsOverlap(declined.path, m.path)) {
        throw new Error(
          `${at}: path "${m.path}" is declared a frontier metric and also declined on source "${source.id}" as ` +
            `"${declined.path}" (${declined.decided_on}) — a field is carried or refused, never both. Withdraw the ` +
            `refusal if the metric is the newer decision, or remove the metric if the refusal still stands`,
        );
      }
    }
    const rights = m.rights;
    if (rights === undefined || rights === null) continue; // unanswered; reported by the build, never permitted
    if (typeof rights !== 'object' || Array.isArray(rights)) throw new Error(`${at}: "rights" must be an object`);
    if (!RIGHTS_OUTCOMES.includes(rights.outcome)) {
      throw new Error(
        `${at}: "rights.outcome" is ${JSON.stringify(rights.outcome)} — the only legal values are ` +
          `${RIGHTS_OUTCOMES.join(', ')}. An unanswered question is recorded as "unresolved"; a missing field and a ` +
          `cleared right must never look the same`,
      );
    }
    if (typeof rights.terms_url !== 'string' || rights.terms_url === '') {
      throw new Error(`${at}: "rights.terms_url" must name the terms that were read`);
    }
    if (!DATE.test(rights.checked_on ?? '')) {
      throw new Error(`${at}: "rights.checked_on" must be the LOCAL date the terms were read (yyyy-mm-dd)`);
    }
    if (rights.outcome === 'cleared' && (typeof rights.excerpt !== 'string' || rights.excerpt.trim() === '')) {
      throw new Error(
        `${at}: "rights.outcome" is "cleared" with no verbatim "excerpt" — a cleared right must rest on the words ` +
          `that grant it, or it is an opinion about a document nobody can re-read`,
      );
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
  validateFrontier(raw);
  return raw;
}

/** Sources in a stable order, so every derived file is order-independent. */
export function sortedSources(registry) {
  return [...registry.sources].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function findSource(registry, id) {
  return registry.sources.find((s) => s.id === id) ?? null;
}
