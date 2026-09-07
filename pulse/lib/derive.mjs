/**
 * derive.mjs — the data layer: model catalog rows, status tables, and the
 * per-source public state the surfaces render (task 3.3).
 *
 * Everything written here lives under `data/derived/` and is strictly
 * recomputable: deleting the directory costs one Pulse run and nothing else.
 * Missing values stay `null` — a value the source did not give is rendered
 * absent, never guessed (specs/directory).
 *
 * Which sources contribute catalog rows: those that declare
 * `material_fields`, i.e. sources whose rows describe *things* with
 * comparable fields. A source with no material fields (a release feed, whose
 * rows are dated *events*) contributes to the changed feed and the seeded
 * history only, never to the model catalog.
 */

import { daysSince, paths, readJsonl, today, writeJson } from './core.mjs';
import { deriveStatus, materialValue, displayName } from './diff.mjs';
import { loadCompanionSnapshot, loadSnapshot, loadState } from './sources.mjs';
import { feedBindings } from './corpus.mjs';
import { companionKeyForRow, sortedSources, splitProviderField } from './registry.mjs';
// The closed kind list has one home (`separate-a-claim-from-a-fact` task 19):
// every consumer reads the declaration instead of restating a literal, so a
// misspelled kind is a missing property here rather than a branch that silently
// never matches. `pulse/lib/` already imports from `../../lib/`
// (`pulse/lib/indexnow.mjs`), so one home is reachable from both sides.
import { KIND } from '../../lib/change-kinds.mjs';

/** `anthropic/claude-opus-5` -> `anthropic`. Null when the id carries no prefix. */
export function providerOf(rowId) {
  const i = String(rowId).indexOf('/');
  return i > 0 ? String(rowId).slice(0, i) : null;
}

/**
 * The four reasons a vendor-posted rate can be absent. CLOSED, and every absent
 * value carries one.
 *
 * Four different conditions render as the same empty cell, and the one that is a
 * gap in THIS SITE'S declarations (`author_identity_not_declared`) is
 * indistinguishable from the three that are facts about the vendor unless the
 * row says which it is.
 */
export const VENDOR_ABSENT = Object.freeze({
  AUTHOR_NOT_IN_LISTING: 'author_not_in_listing',
  AUTHOR_IDENTITY_NOT_DECLARED: 'author_identity_not_declared',
  LISTING_DID_NOT_FETCH: 'listing_did_not_fetch',
  AUTHOR_POSTS_ONLY_OTHER_TIERS: 'author_posts_only_other_tiers',
});

/**
 * The rate the row's own author posts, on that row's provider listing, at the
 * tier the registry declares canonical — or a dated absence carrying its reason.
 *
 * ## The identity comparison, and the two edits that would weaken it
 *
 * These are written here rather than only in the design because they are the two
 * edits a later change will make by accident, and each turns an attribution into
 * something weaker than an attribution.
 *
 *  1. **NOTHING ON THIS PATH READS `provider_name`, OR ANY FIELD BUT THE
 *     DECLARED `provider_field`.** A display name is a label whoever writes the
 *     listing may set to anything; several providers may carry one; a rename
 *     silently makes or breaks an attribution. The comparison is between machine
 *     keys — the provider slug `splitProviderField` reads out of the declared
 *     field, against the slug the source's own identity map gives for the
 *     author segment of the row's id — and nothing else. The same split supplies
 *     the tier, so a listing that also carries `provider_slug`/`service_tier`
 *     fields (a different fetch's shape, measured to DISAGREE with the tag's own
 *     suffix) is not consulted.
 *
 *  2. **THERE IS NO BRANCH THAT COMPARES THE AUTHOR SEGMENT TO A PROVIDER SLUG
 *     DIRECTLY.** Raw equality is a coincidence test: measured 2026-09-06 over
 *     431 rows, it agrees on `openai` (93 rows) and `anthropic` (27) and
 *     measures absent on `google` (43), `mistralai` (20), `x-ai` (7) and
 *     `amazon` (5) — resolving for the majors whose spellings happen to agree,
 *     resolving nothing for a third of the rest, and looking identical either
 *     way. An author the map does not name resolves ABSENT, with that reason.
 *
 * And there is no fallback anywhere below: an absent vendor rate never borrows
 * the headline. A fallback is how a listing rate becomes a vendor attribution
 * with nobody deciding to attribute anything.
 */
export function resolveVendorRate(source, rowId, row, companionSnapshot) {
  const companion = source?.companion;
  if (!companion) return null;
  const asOf = companionSnapshot?.date ?? null;
  const absent = (code, tiersFound = null) => ({
    absent: true,
    as_of: asOf,
    provider_slug: null,
    tier: null,
    rates: null,
    reason: { code, tiers_found: tiersFound },
  });

  const author = providerOf(rowId);
  const declared = author === null ? null : companion.provider_identities?.[author];
  const slug = typeof declared?.provider_slug === 'string' ? declared.provider_slug.trim().toLowerCase() : null;
  if (slug === null || slug === '') return absent(VENDOR_ABSENT.AUTHOR_IDENTITY_NOT_DECLARED);

  const key = companionKeyForRow(companion, row);
  const entry = key === null ? null : companionSnapshot?.keys?.[key];
  if (!entry || entry.status !== 'ok' || !Array.isArray(entry.endpoints)) {
    return absent(VENDOR_ABSENT.LISTING_DID_NOT_FETCH);
  }

  const identified = entry.endpoints
    .map((endpoint) => ({ endpoint, id: splitProviderField(endpoint, companion.provider_field) }))
    .filter((x) => x.id !== null);
  const mine = identified.filter((x) => x.id.provider_slug === slug);
  if (mine.length === 0) return absent(VENDOR_ABSENT.AUTHOR_NOT_IN_LISTING);

  const canonical = String(companion.canonical_tier).trim().toLowerCase();
  const match = mine.find((x) => x.id.tier === canonical);
  if (!match) {
    // The tiers named here are always tiers the split rule actually produced,
    // never strings read off some other field: guessing another of a vendor's
    // tiers is how a site prints a fast-tier rate under a sentence about
    // standard pricing.
    return absent(VENDOR_ABSENT.AUTHOR_POSTS_ONLY_OTHER_TIERS, [...new Set(mine.map((x) => x.id.tier))].sort());
  }

  const rates = {};
  for (const name of Object.keys(companion.rates ?? {})) {
    const v = match.endpoint[name];
    rates[name] = v === undefined ? null : v;
  }
  return { absent: false, as_of: asOf, provider_slug: match.id.provider_slug, tier: match.id.tier, rates, reason: null };
}

function catalogRow(source, rowId, row, entryIdByRow, companionSnapshot = null) {
  const out = {
    source: source.id,
    source_url: source.url,
    row_id: rowId,
    display_name: displayName(source, row),
    provider: providerOf(rowId),
    entry_id: entryIdByRow.get(`${source.id}\0${rowId}`) ?? null,
    status: deriveStatus(source, row),
    created: row?.created ?? null,
    expiration_date: row?.expiration_date ?? null,
  };
  for (const spec of source.material_fields ?? []) {
    if (spec.path === '$status') continue;
    const v = materialValue(source, row, spec);
    out[spec.field] = v === null ? null : v;
  }
  // BESIDE, NOT INSTEAD (design D2). The listing rate above is untouched: every
  // row has one, an unknown fraction of rows have a vendor rate, and replacing
  // the column would trade a number that is true about a listing for a hole on
  // every uncovered row. Two named fields is also the only arrangement in which
  // the no-fallback rule is enforceable — with one field there is nowhere for an
  // absent vendor rate to go except back to the headline, which is the defect.
  if (source.companion) out.vendor_posted_rate = resolveVendorRate(source, rowId, row, companionSnapshot);
  return out;
}

/**
 * Build every derived data-layer file. Returns a summary for the run log.
 */
export function deriveDataLayer(root, registry, corpus) {
  const p = paths(root);
  const entryIdByRow = new Map();
  for (const b of feedBindings(corpus)) entryIdByRow.set(`${b.source}\0${b.row_id}`, b.entry_id);

  const rows = [];
  const sourceStates = [];

  for (const source of sortedSources(registry)) {
    const state = loadState(root, source.id);
    const latest = loadSnapshot(root, source.id, 'latest');
    const noChangeDays = daysSince(state.last_change_date);
    const suspectAfter = source.expected_change_days * 3;
    const suspect = noChangeDays !== null && noChangeDays > suspectAfter;

    sourceStates.push({
      id: source.id,
      title: source.title ?? source.id,
      url: source.url,
      format: source.format,
      row_id_field: source.row_id_field,
      fetch_every_days: source.fetch_every_days,
      expected_change_days: source.expected_change_days,
      mints: source.mints ? source.mints.kind : null,
      snapshot_date: latest?.date ?? null,
      row_count: latest?.row_count ?? 0,
      last_fetch_date: state.last_fetch_date ?? null,
      last_change_date: state.last_change_date ?? null,
      refusing: state.refusing ?? null,
      last_error: state.last_error ?? null,
      // "last checked" flips to "last changed" on the surfaces when suspect
      // is true, so a silently broken fetcher cannot make the site look
      // fresher than it is (specs/pulse).
      suspect,
      suspect_after_days: suspectAfter,
      days_since_change: noChangeDays,
    });

    if (!latest || (source.material_fields ?? []).length === 0) continue;
    const companionSnapshot = loadCompanionSnapshot(root, source, 'latest');
    for (const rowId of Object.keys(latest.rows ?? {}).sort()) {
      rows.push(catalogRow(source, rowId, latest.rows[rowId], entryIdByRow, companionSnapshot));
    }
  }

  rows.sort((a, b) => (a.source + '\0' + a.row_id < b.source + '\0' + b.row_id ? -1 : 1));

  const catalog = { row_count: rows.length, rows };
  writeJson(`${p.derived}/catalog.json`, catalog);
  writeJson(`${p.derived}/sources.json`, { sources: sourceStates });

  // Joined rows for every row id an entry declares — what a `feed` fact
  // renders from (task 2.3), including the vanished case. `$status` is the
  // registry-derived status; `$as_of` is the date of the snapshot the values
  // come from; `$vanished` marks a declared row id the latest snapshot no
  // longer contains, whose last-known values must render with a visible
  // as-of date and never as current (specs/wiki).
  const feedRows = {};
  const vanished = [];
  for (const b of feedBindings(corpus)) {
    const source = registry.sources.find((s) => s.id === b.source);
    if (!source) continue;
    const latest = loadSnapshot(root, source.id, 'latest');
    const previous = loadSnapshot(root, source.id, 'previous');
    const inLatest = latest?.rows?.[b.row_id];
    const inPrevious = previous?.rows?.[b.row_id];
    const row = inLatest ?? inPrevious ?? null;
    if (!feedRows[b.source]) feedRows[b.source] = {};
    feedRows[b.source][b.row_id] = row
      ? {
          ...row,
          $status: deriveStatus(source, row),
          $as_of: (inLatest ? latest?.date : previous?.date) ?? null,
          $vanished: !inLatest,
        }
      : { $status: null, $as_of: null, $vanished: true };
    if (!inLatest) {
      vanished.push({
        source: b.source,
        row_id: b.row_id,
        entry_id: b.entry_id,
        path: b.path,
        last_seen_date: (inPrevious ? previous?.date : null) ?? null,
        has_last_known: Boolean(inPrevious),
      });
    }
  }
  vanished.sort((a, b) => (a.source + a.row_id < b.source + b.row_id ? -1 : 1));
  writeJson(`${p.derived}/feed-rows.json`, feedRows);

  // Standing tables (specs/directory, task 4.2): the full catalog above, the
  // deprecations/retirements table, and what changed in the last 30 days.
  const deprecations = rows
    .filter((r) => r.status === 'deprecated' || r.status === 'retired')
    .sort((a, b) => (a.row_id < b.row_id ? -1 : 1));

  const changed30 = readJsonl(p.changes)
    .filter((l) => l && l.kind !== KIND.ANNOTATION)
    .filter((l) => {
      const age = daysSince(l.date);
      return age !== null && age >= 0 && age <= 30;
    })
    .sort((a, b) => (a.date === b.date ? (a.key < b.key ? 1 : -1) : a.date < b.date ? 1 : -1));

  writeJson(`${p.derived}/status-tables.json`, {
    sort_criterion: {
      catalog: 'source then row id, ascending',
      deprecations: 'row id, ascending',
      changed_30d: 'date, newest first',
    },
    deprecations,
    changed_30d: changed30,
    generated_on: today(),
  });

  return {
    catalog_rows: rows.length,
    deprecations: deprecations.length,
    changed_30d: changed30.length,
    vanished,
    suspect_sources: sourceStates.filter((s) => s.suspect).map((s) => s.id),
    refusing_sources: sourceStates.filter((s) => s.refusing).map((s) => s.id),
    sourceStates,
  };
}
