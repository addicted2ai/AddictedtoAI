/**
 * Derive the OpenRouter synchronous-versus-batch price view from the committed
 * change feed.  The feed rows carry the source's pricing fields verbatim; this
 * module only joins siblings and performs the comparison.
 */

import { paths, readJsonl, today, writeJson } from './core.mjs';

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

function newestRows(lines) {
  const rows = new Map();
  for (const line of lines) {
    if (line?.source !== SOURCE || typeof line.row_id !== 'string') continue;
    const excerpt = line.excerpt;
    if (!excerpt || excerpt.id !== line.row_id) continue;
    const previous = rows.get(line.row_id);
    if (!previous || compare(previous.date ?? '', line.date ?? '') < 0 ||
        (previous.date === line.date && compare(previous.key ?? '', line.key ?? '') < 0)) {
      rows.set(line.row_id, {
        row_id: line.row_id,
        display_name: excerpt.name ?? line.display_name ?? line.row_id,
        prompt: excerpt['pricing.prompt'] ?? null,
        completion: excerpt['pricing.completion'] ?? null,
        date: line.date ?? null,
      });
    }
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
  const rows = newestRows(readJsonl(paths(root).changes));
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
