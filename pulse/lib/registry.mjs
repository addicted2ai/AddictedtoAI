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
 *
 * THE FILE HOLDS TWO ARRAYS AND THEY ARE NOT THE SAME KIND OF THING.
 * `sources` is what the Pulse fetches, snapshots, diffs and derives from —
 * every row of it can reach a rendered page. `radar` is the scout's inputs
 * (DESK-ORDER-001 §5, keeper ruling K30): feeds a model job reads to decide
 * where to look, which this engine never fetches and which never render. The
 * separation is structural rather than a flag, for the reasons set out on
 * `validateRadar` below — the short version is that `sortedSources` and
 * `findSource` cannot see a radar row at all, so no ingest or derive path can
 * arrive at one by iterating what it already iterates.
 */

import { paths, readJson } from './core.mjs';

const FORMATS = new Set(['json', 'rss']);

/**
 * A radar feed may also be an Atom document; a Pulse source may not, because
 * nothing in `sources.mjs` parses one. The wider set is safe here precisely
 * because nothing in this engine ever fetches a radar row.
 */
const RADAR_FORMATS = new Set(['json', 'rss', 'atom']);

/**
 * The fields that mean "the data layer carries this", refused on a radar row.
 *
 * Each one is a live switch somewhere: `material_fields` builds the catalog
 * column, the entry-page fact and the changed-feed line (`derive.mjs`,
 * `mint.mjs`, `diff.mjs`); `mints` writes `content/wiki/**`; `seeds` writes
 * `data/changes.jsonl`; `rows_path`/`row_id_field`/`status_rule`/
 * `schedule_rule` only mean anything to a snapshot this engine fetched. A
 * radar row carrying one is not a radar row — it is a source pasted into the
 * wrong array, and the paste is exactly how this separation would be lost.
 */
const INGEST_ONLY_FIELDS = [
  'material_fields',
  'declined_fields',
  'mints',
  'seeds',
  'rows_path',
  'row_id_field',
  'status_rule',
  'schedule_rule',
  'fetch_every_days',
  'expected_change_days',
  'emit_on_remove',
  'rolling_window',
];

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
 *
 * ## The material-fields cross-check
 *
 * A registered metric's path must ALSO be a `material_fields` path on its own
 * source, and not one marked `event: false`. That is not tidiness: it is the
 * only thing that gives "a value moved under an unchanged leader" a recorder at
 * all, and the reason is written out in full at the check itself.
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
    /*
     * THE OTHER EVENT MUST HAVE A RECORDER, and this is what declares it.
     *
     * specs/pulse: "A change in the leader's VALUE with no change in the
     * leader's IDENTITY is a different event and SHALL be recorded as such,
     * distinguishable by kind or by a declared field." `pulse/lib/frontier.mjs`
     * deliberately emits nothing for that case — recording it under a kind that
     * says the lead changed is the conflation the requirement forbids — so the
     * only thing that records it is `diffSnapshots`' `field_change` line, which
     * fires ONLY for a path declared in the same source's `material_fields` and
     * NOT marked `event: false` (`pulse/lib/diff.mjs`). Nothing coupled the two
     * lists, so a metric could be registered on a path no material field covers
     * and the value move under an unchanged leader would be recorded NOWHERE,
     * with every gate green: the derived file is recomputed from scratch each
     * run and carries only the current value, so it records no movement at all.
     * Measured on the real registry before this check existed: neither
     * `benchmarks.artificial_analysis.*` nor `benchmarks.design_arena[]` is a
     * material field on `openrouter-models`, so BOTH real candidate metrics
     * would have landed in exactly that hole.
     */
    const material = (source.material_fields ?? []).find((f) => f?.path === m.path);
    if (!material) {
      throw new Error(
        `${at}: path "${m.path}" is declared a frontier metric but is not a "material_fields" path on source ` +
          `"${source.id}" — so a change in the leader's VALUE with no change in its IDENTITY would be recorded ` +
          `nowhere (specs/pulse requires that event to be distinguishable by kind or by a declared field, and ` +
          `the only recorder is diffSnapshots' field_change line). Declare the path in "material_fields" on ` +
          `source "${source.id}", or withdraw the metric`,
      );
    }
    if (material.event === false) {
      throw new Error(
        `${at}: path "${m.path}" is a "material_fields" entry on source "${source.id}" marked "event": false, ` +
          `so no field_change line is ever written for it and a value move under an unchanged leader would be ` +
          `recorded nowhere. A frontier metric's movement IS an event; drop the "event": false on field ` +
          `"${material.field}", or withdraw the metric`,
      );
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
    // The excerpt is required of every ANSWERED outcome, not only of a cleared
    // one. The delta says a decision carries "the URL of the terms that were
    // read, the local date they were read, the outcome, and a verbatim excerpt
    // of the terms the outcome rests on" — and a REFUSAL rests on words just as
    // a clearance does: somebody read a sentence that refused, and that sentence
    // is the evidence. `unresolved` is the one exemption, and it is a measured
    // one rather than a convenience: Artificial Analysis's terms URL 404'd on
    // 2026-09-05 (addictedtoai-ego8), so there is nothing to quote and demanding
    // a quotation would force an invented one.
    if (rights.outcome !== 'unresolved' && (typeof rights.excerpt !== 'string' || rights.excerpt.trim() === '')) {
      throw new Error(
        `${at}: "rights.outcome" is "${rights.outcome}" with no verbatim "excerpt" — an answered right must rest ` +
          `on the words that decided it, or it is an opinion about a document nobody can re-read. Only ` +
          `"unresolved" is excused, because a question nobody could read has nothing to quote`,
      );
    }
  }
}

/**
 * Validate the `radar` array — the scout's inputs, which this engine never
 * fetches (DESK-ORDER-001 §5, keeper ruling K30).
 *
 * ## Why radar rows are a SEPARATE ARRAY and not a flag on a source
 *
 * The question this answers is not "how do we mark a row as scout-only" but
 * "what stops a scout-only row from reaching the data layer". Those have
 * different answers, and only one of them survives the next person who edits
 * `derive.mjs`.
 *
 * A flag on a `sources[]` row would have to be honoured, separately and
 * correctly, by every consumer that iterates the array: `run.mjs`'s ingest
 * loop, `derive.mjs`, `mint.mjs`, `diff.mjs` and `freshness.mjs` today, plus
 * whatever is written next year. A consumer that forgets the flag does not
 * fail — it quietly fetches, snapshots and publishes a radar feed, which is
 * precisely the failure the pending `loop` delta names: *"Rendered directly
 * they would saturate the surface immediately, which is the failure that made
 * this a curated surface rather than a feed."*
 *
 * MEASURED, because "it would render" is a claim and not an inference:
 * `derive.mjs` writes every `sources[]` row's `id`, `title`, `url`, `format`
 * and snapshot dates into `data/derived/sources.json` **before** the
 * `material_fields` check that skips catalog rows (`derive.mjs` line 90 — the
 * `continue` is after the `sourceStates.push`). `lib/data-layer.mjs` loads
 * that file and `lib/site.mjs` exposes it to every page as `sourceUrl(id)`.
 * So `material_fields: []` — the nearest existing field, and what the
 * non-catalog `llm-releases` row already uses — does NOT keep a row out of the
 * rendered site. It only keeps it out of the catalog table. There is no
 * existing field that means "do not ingest this".
 *
 * A separate array needs nobody to remember anything. `registry.sources` is
 * the same array it was; every consumer of it gets exactly what it got before;
 * and a radar row is unreachable from the ingest path because it is not in the
 * path's input. Exclusion by construction, not exclusion by filter.
 *
 * The guards below close the one door that construction leaves open — a source
 * pasted into `radar` (or the reverse) by someone copying the shape:
 *
 *   - a radar id may not collide with a source id, in either direction, so
 *     `findSource` and a scout's lookup can never disagree about what a name
 *     means;
 *   - a radar row may not carry any `INGEST_ONLY_FIELDS` key, so a row that
 *     wants a catalog column fails the registry loudly instead of sitting in
 *     `radar` looking settled and doing nothing;
 *   - every row and every feed under it carries a dated robots finding, a
 *     dated terms finding and a `verified_on` — §5's "Each row records
 *     robots/terms and a last-verified date as the registry requires";
 *   - a feed marked `registered: false` must say why in
 *     `not_registered_because`. A refusal is the deliverable when a site
 *     forbids the read, and a refusal with no reason is an omission wearing a
 *     label — the same rule `declined_fields` above enforces for a field.
 *   - a row may not declare its own `url` as a `registered: false` feed. Three
 *     of the four launch rows repeat their row url as a `feeds` entry, so that
 *     shape is the one a future refusal will actually be written in: someone
 *     flips the feed to `registered: false` when a publisher's terms turn.
 *     Refusing the contradiction here is what keeps that edit from reading as
 *     settled while the row url still offers the same URL.
 */
function validateRadar(raw, where) {
  const radar = raw.radar;
  if (radar === undefined || radar === null) return;
  if (!Array.isArray(radar)) throw new Error(`${where}: "radar" must be an array`);

  const sourceIds = new Set((raw.sources ?? []).map((s) => s?.id));
  const seen = new Set();
  for (const row of radar) {
    const id = row?.id;
    if (!id || typeof id !== 'string') throw new Error(`${where}: a "radar" row is missing a string "id"`);
    const at = `${where}: radar feed "${id}"`;
    if (seen.has(id)) throw new Error(`${at}: duplicate radar id`);
    seen.add(id);
    if (sourceIds.has(id)) {
      throw new Error(
        `${at}: also declared in "sources" — a feed is the Pulse's to ingest or the scout's to read, never both`,
      );
    }
    if (!row.url || typeof row.url !== 'string') throw new Error(`${at}: missing "url"`);
    if (!RADAR_FORMATS.has(row.format)) {
      throw new Error(`${at}: "format" must be one of ${[...RADAR_FORMATS].join(', ')}`);
    }
    for (const field of INGEST_ONLY_FIELDS) {
      if (row[field] !== undefined) {
        throw new Error(
          `${at}: carries "${field}", which only means something for a source the Pulse ingests — ` +
            `a radar feed is an input to the scout and is never fetched, snapshotted, diffed or rendered`,
        );
      }
    }
    if (row.registered !== undefined && typeof row.registered !== 'boolean') {
      throw new Error(`${at}: "registered" must be a boolean when present (absent means the row's own url is readable)`);
    }
    if (row.registered === false && (typeof row.not_registered_because !== 'string' || row.not_registered_because.trim() === '')) {
      throw new Error(
        `${at}: is not registered and says nothing in "not_registered_because" — an honest refusal names what forbade the read`,
      );
    }
    validateRadarChecks(row, at);
    if (row.feeds !== undefined) {
      if (!Array.isArray(row.feeds)) throw new Error(`${at}: "feeds" must be an array`);
      const feedUrls = new Set();
      for (const feed of row.feeds) {
        const url = feed?.url;
        if (!url || typeof url !== 'string') throw new Error(`${at}: a "feeds" entry is missing a string "url"`);
        if (feedUrls.has(url)) throw new Error(`${at}: "feeds" declares ${url} twice`);
        feedUrls.add(url);
        const fat = `${at}, feed ${url}`;
        if (!RADAR_FORMATS.has(feed.format)) {
          throw new Error(`${fat}: "format" must be one of ${[...RADAR_FORMATS].join(', ')}`);
        }
        if (typeof feed.registered !== 'boolean') {
          throw new Error(`${fat}: needs a boolean "registered" — whether the scout may read this URL`);
        }
        if (feed.registered === false && (typeof feed.not_registered_because !== 'string' || feed.not_registered_because.trim() === '')) {
          throw new Error(
            `${fat}: is not registered and says nothing in "not_registered_because" — ` +
              `an honest refusal names what forbade the read`,
          );
        }
        validateRadarChecks(feed, fat);
      }
      // A row whose OWN url is one of its refused feeds is a contradiction, and
      // the registry names it rather than resolving it in favour of reading.
      // `radarReadableUrls` also filters this case, but a filter alone would
      // leave the row saying two things and silently honouring one of them.
      if (refusedFeedUrls(row).has(row.url)) {
        throw new Error(
          `${at}: its own url ${row.url} is declared as a "registered": false feed — ` +
            `a row cannot both refuse a URL and offer it; refuse the row itself, or register the feed`,
        );
      }
    }
  }
}

/** The dated robots finding, the dated terms finding and the verified date. */
function validateRadarChecks(row, at) {
  if (!row.robots || !DATE.test(row.robots.checked_on ?? '') || !row.robots.result) {
    throw new Error(`${at}: missing "robots" with a "checked_on" date (yyyy-mm-dd) and a "result"`);
  }
  if (!row.terms || !DATE.test(row.terms.read_on ?? '') || !row.terms.result) {
    throw new Error(`${at}: missing "terms" with a "read_on" date (yyyy-mm-dd) and a "result"`);
  }
  if (!DATE.test(row.verified_on ?? '')) {
    throw new Error(`${at}: needs a "verified_on" date (yyyy-mm-dd) — the last-verified date §5 requires`);
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
  validateRadar(raw, `source registry ${p.registry}`);
  return raw;
}

/**
 * The scout's radar feeds, in a stable order (DESK-ORDER-001 §5).
 *
 * This is the helper the scout calls. It is deliberately the ONLY way to reach
 * these rows from code: they are absent from `sortedSources` and from
 * `findSource`, so no ingest, derive, mint, diff or freshness path can arrive
 * at one by iterating what it already iterates.
 */
export function radarFeeds(registry) {
  return [...(registry?.radar ?? [])].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * Every URL the scout is actually cleared to read, row order then feed order.
 *
 * A row's own `url` counts only when the row is not itself refused, and a
 * `feeds` entry counts only when `registered` is true. A URL a site forbids is
 * recorded in the registry as a dated refusal and never handed to a caller —
 * which is the difference between recording a refusal and routing around it.
 */
export function radarReadableUrls(registry) {
  const urls = [];
  for (const row of radarFeeds(registry)) {
    // A row's own url is very often ALSO declared as one of its own `feeds`
    // entries — three of the four launch rows do exactly that. So the refusal
    // has to be read off the feeds before the row url is emitted, or marking
    // that feed `registered: false` would be silently ineffective and the
    // refused URL would still reach the scout through the row.
    const refused = refusedFeedUrls(row);
    if (row.registered !== false && !refused.has(row.url)) urls.push(row.url);
    for (const feed of row.feeds ?? []) {
      if (feed.registered === true) urls.push(feed.url);
    }
  }
  return [...new Set(urls)];
}

/** The urls this row's own `feeds` entries record as refused. */
function refusedFeedUrls(row) {
  return new Set(
    (row?.feeds ?? []).filter((f) => f?.registered === false).map((f) => f?.url).filter((u) => typeof u === 'string'),
  );
}

/** Sources in a stable order, so every derived file is order-independent. */
export function sortedSources(registry) {
  return [...registry.sources].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function findSource(registry, id) {
  return registry.sources.find((s) => s.id === id) ?? null;
}
