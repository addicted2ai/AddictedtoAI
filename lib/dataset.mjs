/**
 * dataset.mjs — the open dataset (task 4.9, specs/site).
 *
 * *"the entire structured layer (entries, facts, timelines, model catalog,
 * deprecations) downloadable as JSON and CSV at a stable URL, under the CC BY
 * 4.0 license, with the license stated on the page and in the files."*
 *
 * **How a CSV states a license.** JSON has an obvious place for it; CSV does
 * not, and the two usual answers are both wrong. A leading `#` comment line
 * breaks strict parsers, and a licence stated only on the download page
 * travels nowhere — the file is the thing that gets copied into someone's
 * notebook. So every row carries a `license` column. It costs a constant per
 * row and it is the only version that survives the file being separated from
 * its page, which is the entire point of publishing a dataset.
 *
 * Facts are exported **resolved**: the value a reader saw on the page, with
 * its state (`cited`, `feed`, `vanished`, `absent`) beside it. Exporting the
 * front-matter binding instead would hand out `pricing.prompt` — a path into
 * a snapshot the downloader does not have.
 */

import { stringify } from 'csv-stringify/sync';
import {
  DATASET_LICENSE,
  DATASET_LICENSE_URL,
  DATASET_SCHEMA_VERSION,
  CONTRACT_ANCHOR,
} from './asset-routes.mjs';
import { absoluteUrl } from './site-config.mjs';
import { resolveFact } from './facts.mjs';

const LICENSE = {
  license: DATASET_LICENSE,
  license_url: DATASET_LICENSE_URL,
  attribution: 'AddictedtoAI — https://www.addictedtoai.net',
};

/** One row per entry: identity, lifecycle, indexability. */
export function entryRows(corpus) {
  return corpus.entry.map((doc) => ({
    id: doc.data.id,
    kind: doc.data.kind,
    display_name: doc.data.display_name,
    // `doc.currentStatus` (addictedtoai-ij4h): the resolved feed value for a
    // stub, else the authored front-matter value — see build-content.mjs.
    // Exported resolved for the same reason every fact row below is: "the
    // value a reader saw on the page", never a stale front-matter binding.
    status: doc.currentStatus ?? doc.data.status,
    maintenance: doc.data.maintenance,
    aliases: doc.data.aliases.map((a) => `${a.name} (${a.class})`).join('; '),
    themes: (doc.data.themes ?? []).join('; '),
    has_prose_body: doc.hasBody,
    indexed: Boolean(doc.index?.indexed),
    url: doc.url,
    license: DATASET_LICENSE,
  }));
}

/** One row per fact, resolved to the value the page rendered. */
export function factRows(corpus, ctx) {
  const rows = [];
  for (const doc of corpus.entry) {
    for (const fact of doc.data.facts ?? []) {
      const r = resolveFact(fact, {
        dataLayer: ctx.dataLayer,
        feeds: doc.data.feeds ?? {},
        today: ctx.today,
        entryId: doc.data.id,
      });
      rows.push({
        entry_id: doc.data.id,
        field: fact.field,
        value: r.value === undefined || r.value === null ? '' : String(r.value),
        state: r.state,
        binding: fact.source,
        volatility: fact.volatility,
        source_url: fact.source === 'cited' ? fact.source_url : (ctx.sourceUrl?.(fact.feed) ?? ''),
        accessed: fact.source === 'cited' ? fact.accessed : (r.asOf ?? ctx.fetchedOn?.(fact.feed) ?? ''),
        license: DATASET_LICENSE,
      });
    }
  }
  return rows;
}

/** One row per dated, sourced timeline event. */
export function timelineRows(corpus) {
  const rows = [];
  for (const doc of corpus.entry) {
    for (const ev of doc.data.timeline ?? []) {
      rows.push({
        entry_id: doc.data.id,
        date: ev.date,
        event: ev.event,
        source_url: ev.source_url,
        license: DATASET_LICENSE,
      });
    }
  }
  return rows;
}

/** The model catalog, raw values — not the per-million display figures. */
export function catalogExportRows(catalog) {
  return (catalog.rows ?? []).map((r) => ({
    row_id: r.row_id,
    display_name: r.display_name ?? '',
    provider: r.provider ?? '',
    entry_id: r.entry_id ?? '',
    price_input_per_token: r.price_input ?? '',
    price_output_per_token: r.price_output ?? '',
    context_window: r.context_window ?? '',
    status: r.status ?? '',
    source: r.source ?? '',
    source_url: r.source_url ?? '',
    license: DATASET_LICENSE,
  }));
}

export function deprecationExportRows(tables) {
  return (tables.deprecations ?? []).map((r) => ({
    row_id: r.row_id,
    display_name: r.display_name ?? '',
    provider: r.provider ?? '',
    entry_id: r.entry_id ?? '',
    status: r.status ?? '',
    expiration_date: r.expiration_date ?? '',
    source: r.source ?? '',
    source_url: r.source_url ?? '',
    license: DATASET_LICENSE,
  }));
}

/** The dated pairs, so the showpiece's receipts are downloadable too. */
export function deltaExportRows(views) {
  return views.map((v) => ({
    slug: v.slug,
    title: v.title,
    capability: v.capability,
    impossible_date: v.impossible.date,
    impossible_what: v.impossible.what,
    impossible_metric: v.impossible.metric ?? '',
    impossible_source_url: v.impossible.source_url,
    routine_date: v.routine.date,
    routine_what: v.routine.what,
    routine_metric: v.routine.metric ?? '',
    routine_source_url: v.routine.source_url,
    span: v.span.text,
    url: v.url,
    license: DATASET_LICENSE,
  }));
}

/**
 * The whole structured layer as one object.
 * @returns {{license, generated_on, counts, entries, facts, timelines, catalog, deprecations, deltas}}
 */
export function buildDataset({ corpus, catalog, tables, deltas, dataLayer, today, sourceUrl, fetchedOn }) {
  const entries = entryRows(corpus);
  const facts = factRows(corpus, { dataLayer, today, sourceUrl, fetchedOn });
  const timelines = timelineRows(corpus);
  const catalogOut = catalogExportRows(catalog);
  const deprecations = deprecationExportRows(tables);
  const deltaOut = deltaExportRows(deltas);
  return {
    // The same published-contract treatment the standing tables get, with its
    // own version number: the dataset and the tables are different shapes, and
    // one number for both would report a change in either as a change in both
    // (lib/asset-routes.mjs, beads addictedtoai-k1j).
    schema_version: DATASET_SCHEMA_VERSION,
    contract: absoluteUrl(CONTRACT_ANCHOR),
    ...LICENSE,
    generated_on: today,
    counts: {
      entries: entries.length,
      facts: facts.length,
      timelines: timelines.length,
      catalog: catalogOut.length,
      deprecations: deprecations.length,
      deltas: deltaOut.length,
    },
    entries,
    facts,
    timelines,
    catalog: catalogOut,
    deprecations,
    deltas: deltaOut,
  };
}

/** RFC 4180 CSV with a header row. Empty input still emits its header. */
export function toCsv(rows, columns) {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]) : []);
  return stringify(rows, { header: true, columns: cols, bom: false });
}
