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

import { getPath, paths, readJson, sourcePaths } from './core.mjs';

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
 * `schedule_rule`/`substitution_rule` only mean anything to a snapshot this
 * engine fetched. A
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
  'substitution_rule',
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

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * THE COMPANION FETCH (specs/pulse, "Sources live in a registry and refusals
 * are data"; change `bind-a-price-to-the-vendor-that-posts-it`, tasks 1-3).
 *
 * A source MAY declare a second URL, templated from a row of its own snapshot
 * and fetched once per covered KEY rather than once per covered row. It exists
 * for the case where the row-level feed carries a value whose referent is only
 * recoverable one level down: the models feed's headline price is "pricing from
 * the top provider for this model", and the rate a named vendor actually posts
 * lives on that model's per-provider endpoint listing.
 *
 * The declaration multiplies a source's request rate by the number of distinct
 * keys its own coverage rule yields — 335 on this repository's committed
 * snapshot, against one request a day today. So the bar in front of it is a
 * BUILD REFUSAL and not a sentence asking a reader to be careful: the source's
 * robots record must have been re-checked on or after the declaration's
 * `declared_on`, and must carry `robots.requests_per_day` — an INTEGER, at
 * least as large as the measured distinct-key count. A build can compare an
 * integer to a count; it cannot tell a true prose sentence from a stale one,
 * and the sentence that was true at one request a day ("fetched once per day")
 * stays true-looking at three hundred. Nothing here reads `robots.detail`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * The eight fields a companion declaration must carry, AS ONE LIST.
 *
 * One list on purpose: the check below iterates this array, so a field added
 * here is validated by the same code that validates the other seven and cannot
 * be "validated by accident on seven of eight". Shortening this list is the
 * mutation `pulse/tests/registry.test.mjs` uses to prove the eight omission
 * cases are eight independent refusals rather than one condition described
 * eight times.
 */
export const COMPANION_REQUIRED = Object.freeze([
  'url_template',
  'fetch_every_days',
  'covers',
  'snapshot',
  'declared_on',
  'canonical_tier',
  'provider_field',
  'provider_identities',
]);

/**
 * The tier a `provider_field` value with no `/` denotes.
 *
 * Not a guess: this repository's own measured tier spread
 * (`data/price-attribution-debt.json`'s `residual_hazard`) prices `openai` bare
 * at 1x, `openai/flex` at 0.5x and `openai/fast` at 2x — so the bare slug is
 * already the word for that provider's own standard tier in the data the site
 * has measured.
 */
export const STANDARD_TIER = 'standard';

/** The two field tests a coverage rule may apply. Closed, so it stays readable. */
const COVERAGE_TESTS = new Set(['present', 'nonzero']);

/**
 * A machine key: a provider slug or an author segment. Lower-case, no spaces.
 *
 * This is what makes "both sides of every map entry SHALL be machine keys"
 * enforceable rather than advisory. `OpenAI` is a DISPLAY NAME — a label whoever
 * writes the listing may set to anything, which several providers may share, and
 * which a rename or a lookalike can make match. It fails here on the capital.
 */
const SLUG = /^[a-z0-9]+(?:[._~-][a-z0-9]+)*$/;

/**
 * Read the provider slug and the service tier out of one `provider_field` value.
 *
 * ONE FUNCTION, because the registry's own validation and `derive.mjs`'s
 * resolution must read a value the same way and cannot be allowed to drift
 * apart. Split on the FIRST `/`: the text before it is the provider slug, the
 * text after it is the tier; a value with no `/` names the provider slug alone
 * and denotes that provider's own standard tier.
 *
 * WHY A SPLIT AT ALL, rather than reading a slug field: measured on this
 * source's own `/endpoints` response (`data/reviews/j-20260902-01.md:93`), an
 * endpoint is `{"provider_name":"Anthropic","tag":"anthropic/fast", ...}` —
 * there is no field naming a slug alone. `provider_slug`/`service_tier` exist
 * only in a DIFFERENT fetch (the model page's embedded payload) and disagree
 * with the tag's own suffix there, so neither is read.
 *
 * Trimming and case-folding happen here, so the two sides of the identity
 * comparison in `derive.mjs` are normalised by one rule rather than two.
 */
export function splitProviderField(row, providerField) {
  if (!row || typeof row !== 'object') return null;
  if (typeof providerField !== 'string' || providerField === '') return null;
  const raw = row[providerField];
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (value === '') return null;
  const slash = value.indexOf('/');
  if (slash < 0) return { provider_slug: value.toLowerCase(), tier: STANDARD_TIER };
  const slug = value.slice(0, slash).trim().toLowerCase();
  const tier = value.slice(slash + 1).trim().toLowerCase();
  if (slug === '' || tier === '') return null;
  return { provider_slug: slug, tier };
}

/**
 * The companion key one row of the source's own snapshot is covered by, or null
 * when the coverage rule does not cover it.
 *
 * A rule, never a list: a field test (`covers.field` + `covers.test`) and a key
 * (`covers.key`). A hand-maintained list of row ids silently stops covering
 * rows the feed adds, and a coverage gap nothing can detect is how an absent
 * value becomes indistinguishable from an unasked question.
 */
export function companionKeyForRow(companion, row) {
  const covers = companion?.covers;
  if (!covers || typeof covers !== 'object' || Array.isArray(covers) || !row) return null;
  const value = getPath(row, covers.field);
  if (covers.test === 'nonzero') {
    const n = Number(value);
    if (value === undefined || value === null || value === '' || Number.isNaN(n) || n === 0) return null;
  } else if (value === undefined || value === null || value === '') return null;
  const key = row[covers.key];
  return typeof key === 'string' && key !== '' ? key : null;
}

/**
 * The DISTINCT keys the coverage rule yields over a snapshot, sorted.
 *
 * This count — not the larger count of rows those keys cover — is what the site
 * will actually spend, and it is what the robots bar is compared against.
 * Measured 2026-09-06 on the committed models snapshot: 404 priced rows spanning
 * 335 distinct `canonical_slug` values, because 69 ids are `:free`/`:batch`
 * variants of a slug already counted.
 */
export function companionKeys(companion, snapshot) {
  const rows = snapshot?.rows ?? {};
  const keys = new Set();
  for (const rowId of Object.keys(rows)) {
    const key = companionKeyForRow(companion, rows[rowId]);
    if (key !== null) keys.add(key);
  }
  return [...keys].sort();
}

/** Where a companion listing's rows live in its response body, or null for a bare array. */
export function companionRowsPath(companion) {
  const path = companion?.rows_path;
  return typeof path === 'string' && path !== '' ? path : null;
}

/**
 * Reduce one companion-listing row to the fields the site binds.
 *
 * The reduction is deliberate and D4 states the two reasons: the models snapshot
 * is already 1.1 MB per rotation for 431 rows and a full per-provider payload
 * for 335 slugs would dwarf it in a repository that commits its data in full;
 * and the diff that matters is over the fields the site binds, so storing more
 * would add bytes no comparison reads.
 *
 * The provider identity is stored AS THE SOURCE PUBLISHES IT — unsplit — so the
 * split that decides an attribution is `splitProviderField`'s at resolution
 * time and never a shape a snapshot writer chose. This function lives here, and
 * not in `sources.mjs`, so that the declaration's field names are read in the
 * two places the map is allowed to be read and nowhere else.
 */
export function reduceCompanionRow(companion, row) {
  if (!row || typeof row !== 'object') return null;
  const field = companion?.provider_field;
  if (typeof field !== 'string' || field === '') return null;
  const out = {};
  out[field] = typeof row[field] === 'string' ? row[field] : null;
  for (const [name, path] of Object.entries(companion?.rates ?? {})) {
    const v = getPath(row, path);
    out[name] = v === undefined || v === null ? null : String(v);
  }
  return out;
}

/**
 * Validate a source's optional `companion` block, and the courtesy bar in front
 * of it.
 *
 * `root` is needed because the third robots condition is a comparison against a
 * MEASUREMENT — the distinct-key count the block's own coverage rule yields when
 * run over the source's latest snapshot — not against a number somebody typed.
 * With no snapshot on disk the rule yields no keys and the count is zero, which
 * is the honest answer: a companion fetch templated from a snapshot that does
 * not exist makes no requests.
 */
function validateCompanion(root, source, where) {
  const companion = source.companion;
  if (companion === undefined || companion === null) return;
  const at = `${where}: "companion"`;
  if (typeof companion !== 'object' || Array.isArray(companion)) throw new Error(`${at} must be an object`);

  for (const field of COMPANION_REQUIRED) {
    const value = companion[field];
    const missing =
      value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    if (missing) {
      throw new Error(
        `${at} is missing "${field}" — a companion declares all of ${COMPANION_REQUIRED.join(', ')}, and a ` +
          `declaration missing any of them is refused: it multiplies this source's request rate and every one of ` +
          `those fields is load-bearing for what the fetched value may then be bound to`,
      );
    }
  }

  if (typeof companion.url_template !== 'string' || !companion.url_template.includes('{key}')) {
    throw new Error(`${at}: "url_template" must be a string carrying the "{key}" placeholder the covered key fills`);
  }
  if (!Number.isFinite(companion.fetch_every_days)) throw new Error(`${at}: "fetch_every_days" must be numeric`);
  if (typeof companion.snapshot !== 'string') throw new Error(`${at}: "snapshot" must name the snapshot it writes`);
  if (!DATE.test(companion.declared_on ?? '')) {
    throw new Error(`${at}: "declared_on" must be the LOCAL date this companion was declared on (yyyy-mm-dd)`);
  }
  if (typeof companion.canonical_tier !== 'string') throw new Error(`${at}: "canonical_tier" must be a string`);
  if (typeof companion.provider_field !== 'string') throw new Error(`${at}: "provider_field" must be a string`);

  validateCompanionCoverage(companion, at);
  validateCompanionIdentities(companion, at);

  // Not one of the eight, and separately named. A companion that cannot say
  // where the listing's rows are, or which of their paths carry the rates, can
  // bind nothing — which would be a fetch costing the source hundreds of
  // requests a day for no value, the same argument D3 makes for canonical_tier.
  if (companion.rows_path !== undefined && typeof companion.rows_path !== 'string') {
    throw new Error(`${at}: "rows_path" must be a string when present (absent means the response body IS the array)`);
  }
  const rates = companion.rates;
  if (!rates || typeof rates !== 'object' || Array.isArray(rates) || Object.keys(rates).length === 0) {
    throw new Error(
      `${at}: "rates" must be a non-empty object mapping the field name a bound rate is carried under to the ` +
        `path it is read from in a companion-listing row — a companion that binds no rate makes hundreds of ` +
        `requests a day and produces nothing`,
    );
  }
  for (const [name, path] of Object.entries(rates)) {
    if (typeof path !== 'string' || path.trim() === '') {
      throw new Error(`${at}: "rates" entry "${name}" is not a path into a companion-listing row`);
    }
  }

  validateCompanionRobots(root, source, companion, at);
}

/** A rule over the snapshot — a field test and a key — never a list of ids. */
function validateCompanionCoverage(companion, at) {
  const covers = companion.covers;
  if (Array.isArray(covers) || covers?.row_ids !== undefined || covers?.ids !== undefined) {
    throw new Error(
      `${at}: "covers" enumerates row ids — the covered set must be a RULE over the source's own snapshot (a ` +
        `field test and a key) so it is computable from the snapshot alone. A hand-maintained list silently ` +
        `stops covering rows the feed adds, and a coverage gap that nothing can detect is how an absent value ` +
        `becomes indistinguishable from an unasked question`,
    );
  }
  if (typeof covers !== 'object') throw new Error(`${at}: "covers" must be an object`);
  if (typeof covers.field !== 'string' || covers.field === '') {
    throw new Error(`${at}: "covers" needs a string "field" — the path the coverage test reads`);
  }
  if (!COVERAGE_TESTS.has(covers.test)) {
    throw new Error(`${at}: "covers.test" must be one of ${[...COVERAGE_TESTS].join(', ')}`);
  }
  if (typeof covers.key !== 'string' || covers.key === '') {
    throw new Error(`${at}: "covers" needs a string "key" — the row field the companion fetch is keyed on`);
  }
}

/**
 * The author-identity map: author segment -> the provider slug that author posts
 * under, each entry dated.
 *
 * WHY IT IS DECLARED AND NOT INFERRED. An author segment and a provider slug are
 * two namespaces. Measured 2026-09-06 over the 431 committed rows (58 distinct
 * author segments): `openai` (93 rows) and `anthropic` (27) coincide with the
 * provider slug, and `google` (43), `mistralai` (20), `x-ai` (7) and `amazon`
 * (5) do not — this repository's own `data/price-attribution-debt.json` names
 * Google's listing `google-ai-studio`. Raw string equality would therefore
 * resolve a rate for the majors whose spellings agree, resolve nothing for a
 * third of the rest, and look identical either way.
 *
 * Both sides are machine keys. A display name is not an identity, and the
 * slug-shape check below is the only thing that stops one being written here.
 */
function validateCompanionIdentities(companion, at) {
  const map = companion.provider_identities;
  if (typeof map !== 'object' || Array.isArray(map)) {
    throw new Error(`${at}: "provider_identities" must be an object mapping an author segment to a provider slug`);
  }
  for (const [author, entry] of Object.entries(map)) {
    const ent = `${at}: "provider_identities" entry "${author}"`;
    if (!SLUG.test(author)) {
      throw new Error(`${ent}: the author segment is not a machine key — it must be a slug, never a display name`);
    }
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`${ent}: must be an object carrying "provider_slug" and "declared_on"`);
    }
    if (typeof entry.provider_slug !== 'string' || !SLUG.test(entry.provider_slug)) {
      throw new Error(
        `${ent}: "provider_slug" is ${JSON.stringify(entry.provider_slug)}, which is not a machine key. Both ` +
          `sides of a map entry are slugs as the split rule reads them — a display name is a label whoever ` +
          `writes the listing may set to anything, and matching on one makes an attribution a rename or a ` +
          `lookalike can forge`,
      );
    }
    if (!DATE.test(entry.declared_on ?? '')) {
      throw new Error(`${ent}: needs a "declared_on" date (yyyy-mm-dd) — an undeclared author is a dated absence`);
    }
  }
}

/**
 * The three refusals, independent and separately named.
 *
 * A stale check, an unstated volume and an understated volume are three
 * different failures, and a reader fixing one needs to be told which.
 */
function validateCompanionRobots(root, source, companion, at) {
  const robots = source.robots ?? {};
  if (!DATE.test(robots.checked_on ?? '') || robots.checked_on < companion.declared_on) {
    throw new Error(
      `${at}: the source's robots record was checked on ${JSON.stringify(robots.checked_on ?? null)}, earlier ` +
        `than this companion's "declared_on" ${companion.declared_on} — a companion fetch is not enabled until ` +
        `the robots/terms record has been re-checked AT THE NEW VOLUME. Re-fetch it, re-date it, and state the ` +
        `rate as "robots.requests_per_day"`,
    );
  }
  if (!Number.isInteger(robots.requests_per_day)) {
    throw new Error(
      `${at}: the source's robots record carries no integer "robots.requests_per_day". The volume claim is the ` +
        `integer and nothing else: a build can compare an integer to a measured count, and no test can tell a ` +
        `true sentence in "robots.detail" from a stale one`,
    );
  }
  const keys = companionKeys(companion, readJson(sourcePaths(root, source.id).latest, null));
  if (robots.requests_per_day < keys.length) {
    throw new Error(
      `${at}: "robots.requests_per_day" is ${robots.requests_per_day}, fewer than the ${keys.length} distinct ` +
        `key(s) this companion's own coverage rule yields from the latest snapshot — one request per key is what ` +
        `the site will actually spend. Re-check the robots record at that rate and state it, or narrow the ` +
        `coverage rule`,
    );
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
 *   - AND THE SAME CONTRADICTION ACROSS ROWS, which is the one the per-row
 *     check above cannot see. A refusal is a fact about a URL, not a fact
 *     about the row that happens to record it: `blogs.nvidia.com/feed/` is
 *     refused because NVIDIA's Terms of Service prohibit crawlers, and that
 *     sentence does not stop being true because a second row lists the same
 *     URL. Before this check, refusing a URL in `covered-org-releases` and
 *     listing it as a registered feed under some later row handed it straight
 *     to the scout — the refusal filter was scoped per row, so row B never
 *     consulted row A's refusals, and the registry loaded the contradiction
 *     without complaint. Both halves are closed together: `validateRadar`
 *     refuses a registry in which one URL is `registered: false` somewhere and
 *     offered anywhere else, NAMING BOTH ROWS so the edit that resolves it is
 *     obvious; and `radarReadableUrls` filters every candidate against ONE
 *     refused set built from all rows and all feeds, so the helper is safe
 *     even when it is handed a registry that never went through `loadRegistry`.
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
  validateRadarRefusalsAgree(radar, where);
}

/**
 * One URL, one answer, across the whole array.
 *
 * The per-row check above sees only the row it is in, and a refusal is not a
 * property of a row — it is a property of a URL. So a URL refused in one row
 * and offered in another is the same contradiction written across two lines
 * instead of one, and it used to load without complaint (and then be handed to
 * the scout, because the readable-url filter was scoped per row too).
 *
 * Both rows are named, because either one may be the one that is wrong: the
 * refusal may be stale, or the offer may have been pasted from a row that
 * never checked. The error refuses to guess which.
 */
function validateRadarRefusalsAgree(radar, where) {
  const offered = new Map(); // trimmed url -> [row ids offering it]
  const refused = new Map(); // trimmed url -> [{ id, why }]
  const note = (map, url, value) => {
    if (typeof url !== 'string') return;
    const key = url.trim();
    map.set(key, [...(map.get(key) ?? []), value]);
  };

  for (const row of radar) {
    if (row.registered === false) note(refused, row.url, { id: row.id, why: row.not_registered_because });
    else note(offered, row.url, row.id);
    for (const feed of row.feeds ?? []) {
      if (feed?.registered === false) note(refused, feed.url, { id: row.id, why: feed.not_registered_because });
      else if (feed?.registered === true) note(offered, feed.url, row.id);
    }
  }

  for (const [url, refusals] of refused) {
    const offers = offered.get(url);
    if (!offers || offers.length === 0) continue;
    const by = (ids) => [...new Set(ids)].map((id) => `"${id}"`).join(', ');
    throw new Error(
      `${where}: ${url} is declared "registered": false by radar row ${by(refusals.map((r) => r.id))} ` +
        `(${refusals[0].why}) and offered as readable by radar row ${by(offers)} — one URL cannot be both ` +
        `forbidden and permitted. A refusal is a fact about the URL, not about the row that records it: ` +
        `withdraw the offer, or withdraw the refusal if the reading that produced it has been redone`,
    );
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
    validateCompanion(p.root, s, where);
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
 *
 * THE REFUSED SET IS BUILT ONCE, FROM THE WHOLE ARRAY, and that is the whole
 * point of `refusedRadarUrls` existing at all. The first version of this
 * helper read each row's refusals off that row alone, which made a refusal a
 * property of the row rather than of the URL: refuse `blogs.nvidia.com/feed/`
 * in `covered-org-releases`, list it as a registered feed under any other row,
 * and it came straight back out of here. `loadRegistry` now refuses that
 * registry outright — but this helper is also called on registries that never
 * went through `loadRegistry` (every fixture in `radar.test.mjs` does exactly
 * that), so the filter must hold on its own rather than lean on the validator.
 * Two mechanisms for one rule, deliberately, because the rule is "a forbidden
 * URL never reaches the scout" and that must not depend on which door it came
 * in through.
 */
export function radarReadableUrls(registry) {
  const refused = refusedRadarUrls(registry);
  const urls = new Map(); // trimmed url -> url as declared, so a repeat is one entry
  for (const row of radarFeeds(registry)) {
    const offer = (url) => {
      if (typeof url !== 'string') return;
      const key = url.trim();
      if (refused.has(key)) return;
      if (!urls.has(key)) urls.set(key, url);
    };
    // A row's own url is very often ALSO declared as one of its own `feeds`
    // entries — three of the four launch rows do exactly that. So the refusal
    // has to be read off the feeds before the row url is emitted, or marking
    // that feed `registered: false` would be silently ineffective and the
    // refused URL would still reach the scout through the row.
    if (row.registered !== false) offer(row.url);
    for (const feed of row.feeds ?? []) {
      if (feed?.registered === true) offer(feed.url);
    }
  }
  return [...urls.values()];
}

/**
 * Every URL any radar row refuses, across the whole array — the one set the
 * readable-url filter consults.
 *
 * Normalisation is `trim()` and nothing else, on purpose. A host normaliser
 * (case, trailing slash, default port, query order) would start deciding that
 * two URLs a human wrote differently are the same URL, and a refusal that
 * silently widens is as wrong as one that silently narrows. Two spellings of
 * the same feed are two entries and both must be refused explicitly.
 */
function refusedRadarUrls(registry) {
  const refused = new Set();
  const add = (url) => {
    if (typeof url === 'string') refused.add(url.trim());
  };
  for (const row of registry?.radar ?? []) {
    if (row?.registered === false) add(row.url);
    for (const feed of row?.feeds ?? []) {
      if (feed?.registered === false) add(feed.url);
    }
  }
  return refused;
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
