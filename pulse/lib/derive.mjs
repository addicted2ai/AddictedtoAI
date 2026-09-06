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
import { loadSnapshot, loadState } from './sources.mjs';
import { feedBindings } from './corpus.mjs';
import { sortedSources } from './registry.mjs';
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

function catalogRow(source, rowId, row, entryIdByRow) {
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
    for (const rowId of Object.keys(latest.rows ?? {}).sort()) {
      rows.push(catalogRow(source, rowId, latest.rows[rowId], entryIdByRow));
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
