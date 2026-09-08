/**
 * Derive the OpenRouter synchronous-versus-batch price view from the complete
 * current catalog snapshot. The change feed is append-only history and cannot
 * contain every current row, so it is not a complete input for this view.
 */

import { paths, readJson, sourcePaths, today, writeJson } from './core.mjs';

const SOURCE = 'openrouter-models';
const BATCH_SUFFIX = ':batch';

function numeric(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rounded(value) {
  return value === null ? null : Number(value.toPrecision(15));
}

function compare(a, b) {
  return a === b ? 0 : a < b ? -1 : 1;
}

function currentRows(snapshot) {
  const rows = new Map();
  for (const [rowId, row] of Object.entries(snapshot?.rows ?? {})) {
    if (!row || row.id !== rowId || typeof rowId !== 'string') continue;
    rows.set(rowId, {
      row_id: rowId,
      display_name: row.name ?? rowId,
      prompt: row.pricing?.prompt ?? null,
      completion: row.pricing?.completion ?? null,
      date: snapshot.date ?? null,
    });
  }
  return rows;
}

function price(row) {
  return {
    row_id: row.row_id,
    display_name: row.display_name,
    prompt: row.prompt,
    completion: row.completion,
    as_of: row.date,
  };
}

function comparison(base, batch) {
  const prompt = numeric(base.prompt) !== null && numeric(batch.prompt) !== null
    ? rounded(numeric(batch.prompt) / numeric(base.prompt))
    : null;
  const completion = numeric(base.completion) !== null && numeric(batch.completion) !== null
    ? rounded(numeric(batch.completion) / numeric(base.completion))
    : null;
  return {
    model_id: base.row_id,
    provider: base.row_id.split('/')[0] ?? null,
    synchronous: price(base),
    batch: price(batch),
    ratios: { prompt, completion },
    savings: {
      prompt: prompt === null ? null : rounded(1 - prompt),
      completion: completion === null ? null : rounded(1 - completion),
    },
  };
}

/** Write and return the recomputed batch pricing view. */
export function deriveBatchPricing(root) {
  const rows = currentRows(readJson(sourcePaths(root, SOURCE).latest));
  const comparisons = [];
  for (const [rowId, batch] of rows) {
    if (!rowId.endsWith(BATCH_SUFFIX)) continue;
    const base = rows.get(rowId.slice(0, -BATCH_SUFFIX.length));
    if (base) comparisons.push(comparison(base, batch));
  }
  comparisons.sort((a, b) => compare(`${a.provider}\0${a.model_id}`, `${b.provider}\0${b.model_id}`));

  const providers = new Map();
  for (const item of comparisons) {
    if (!providers.has(item.provider)) providers.set(item.provider, []);
    providers.get(item.provider).push(item);
  }
  const view = {
    source: SOURCE,
    generated_on: today(),
    row_count: comparisons.length,
    provider_count: providers.size,
    providers: [...providers].sort(([a], [b]) => compare(a, b)).map(([provider, models]) => ({
      provider,
      model_count: models.length,
      models,
    })),
  };
  writeJson(`${paths(root).derived}/batch-pricing.json`, view);
  return view;
}
