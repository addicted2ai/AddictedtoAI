/**
 * changes.test.mjs — what the changed feed *says* (addictedtoai-8ho).
 *
 * The front page's most common line read `input price 0.00000006 →
 * 0.000000045`: no unit, no scale, and the only one of the site's three price
 * surfaces that gave the reader nothing at all. These tests fix the fixed
 * string, because the failure this guards against is a silent regression in
 * wording rather than a thrown error.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { changedFeed, describeChange, readChanges } from './changes.mjs';
import { DATA_DIR } from './paths.mjs';

/** A real line out of `data/changes.jsonl`, trimmed to what the feed reads. */
function priceLine(over = {}) {
  return {
    date: '2026-08-29',
    key: 'k',
    kind: 'field_change',
    source: 'openrouter-models',
    field: 'price_input',
    old: '0.00000006',
    new: '0.000000045',
    display_name: 'DeepSeek: DeepSeek V4 Flash 0731',
    row_id: 'deepseek/deepseek-v4-flash-0731',
    source_url: 'https://openrouter.ai/api/v1/models',
    ...over,
  };
}

test('a price line names its scale instead of quoting a bare per-token decimal', () => {
  assert.equal(describeChange(priceLine()), 'input price $0.06 → $0.04 per Mtok');
  assert.equal(
    describeChange(priceLine({ field: 'price_output', old: '0.00000012', new: '0.00000009' })),
    'output price $0.12 → $0.09 per Mtok',
  );
  // The same number the catalog shows for the same price, on purpose.
  assert.equal(
    describeChange(priceLine({ old: '0.0000008', new: '0.0000009' })),
    'input price $0.80 → $0.90 per Mtok',
  );
});

test('a change line never renders as no change', () => {
  // Measured against data/changes.jsonl: 1 of the 16 real price lines collides
  // under the catalog's two-decimal rule. Decimals widen only when they must.
  const collided = priceLine({ field: 'price_output', old: '0.0000001736', new: '0.00000016912' });
  assert.equal(describeChange(collided), 'output price $0.174 → $0.169 per Mtok');

  const distinct = describeChange(priceLine());
  const [, left, right] = distinct.match(/(\$[\d.]+) → (\$[\d.]+)/);
  assert.notEqual(left, right);
});

test('only a source known to publish per-token prices is converted', () => {
  // Fail-safe: an unregistered source keeps today's verbatim rendering rather
  // than acquiring a wrong one. A source already quoting per-million would be
  // multiplied into nonsense by a field-name-only rule.
  assert.equal(
    describeChange({ source: 'some-other-feed', field: 'price_input', old: '0.80', new: '0.90' }),
    'input price 0.80 → 0.90',
  );
  assert.equal(
    describeChange({ source: 'openrouter-models', field: 'context_window', old: '128000', new: '256000' }),
    'context window 128000 → 256000',
  );
  assert.equal(
    describeChange({ source: 'openrouter-models', field: 'status', old: 'deprecated', new: 'active' }),
    'status deprecated → active',
  );
});

test('a free model, a one-sided line and a non-numeric value each stay readable', () => {
  assert.equal(describeChange(priceLine({ old: '0', new: '0.000001' })), 'input price free → $1.00 per Mtok');
  assert.equal(describeChange(priceLine({ old: null })), 'input price now $0.04 per Mtok');
  assert.equal(
    describeChange(priceLine({ old: 'unavailable', new: '0.000001' })),
    'input price unavailable → 0.000001',
    'a value that is not a number is shown as written, unconverted and unscaled',
  );
  assert.equal(describeChange({ kind: 'release' }), 'released');
  assert.equal(describeChange({ kind: 'retirement' }), 'retired');
});

test('a substitution names what arrived and never says "retired"', () => {
  // The 2026-09-05 line this exists for: qwen/qwen3.8-max left the catalog
  // while the model line continued, and the home feed said "retired" about a
  // name that resolved, that day, to a live and currently served model.
  const line = {
    kind: 'substitution',
    row_id: 'qwen/qwen3.8-max',
    display_name: 'Qwen: Qwen3.8 Max',
    successors: [{ row_id: 'qwen/qwen3.8-max-0902', display_name: 'Qwen: Qwen3.8 Max (0902)' }],
  };
  const detail = describeChange(line);
  assert.equal(detail, 'replaced by Qwen: Qwen3.8 Max (0902)');
  assert.equal(detail.includes('retired'), false, 'the word the evidence contradicts is not in the sentence');

  assert.equal(
    describeChange({ kind: 'substitution', successors: [{ row_id: 'acme/two-0902' }] }),
    'replaced by acme/two-0902',
    'the row id is the fallback, because it is what the data guarantees',
  );
  assert.equal(
    describeChange({
      kind: 'substitution',
      successors: [{ row_id: 'a/late' }, { row_id: 'a/early', display_name: 'A Early' }],
    }),
    'replaced by a/late, A Early',
    'more than one same-stem arrival names them all rather than picking one',
  );
  assert.equal(
    describeChange({ kind: 'substitution' }),
    'replaced',
    'a line carrying no successors still says something true, not the bare kind',
  );
  for (const malformed of [{}, 'bad']) {
    assert.doesNotThrow(
      () => describeChange({ kind: 'substitution', successors: malformed }),
      `malformed successors ${JSON.stringify(malformed)} do not crash the reader`,
    );
    assert.equal(
      describeChange({ kind: 'substitution', successors: malformed }),
      'replaced',
      `malformed successors ${JSON.stringify(malformed)} fall back to a readable detail`,
    );
  }
});

test('the committed Qwen correction is consumed while Granite remains a retirement', async () => {
  const qwenKey = 'openrouter-models|554be452279cdebe|380c23a4c00dcada|qwen/qwen3.8-max|$retirement';
  const lines = await readChanges(join(DATA_DIR, 'changes.jsonl'));
  const rawQwen = lines.find((line) => line.key === qwenKey);
  assert.equal(rawQwen?.kind, 'retirement', 'the original historical line remains append-only history');

  const correction = lines.find((line) => line.kind === 'annotation' && line.annotates === qwenKey && line.correction);
  assert.deepEqual(correction?.correction, {
    kind: 'substitution',
    successors: [{ row_id: 'qwen/qwen3.8-max-0902', display_name: 'Qwen: Qwen3.8 Max (0902)' }],
  });

  const feed = changedFeed(lines, { entries: [] });
  const qwen = feed.find((line) => line.key === qwenKey);
  assert.equal(qwen?.kind, 'substitution', 'the reader applies the append-only correction');
  assert.equal(qwen?.detail, 'replaced by Qwen: Qwen3.8 Max (0902)');
  assert.equal(qwen?.detail.includes('retired'), false, 'the corrected line no longer calls Qwen retired');
  assert.equal(qwen?.annotations.length, 1, 'the correction remains visible as the line annotation');

  const graniteKey = 'openrouter-models|554be452279cdebe|380c23a4c00dcada|ibm-granite/granite-4.1-8b|$retirement';
  const granite = feed.find((line) => line.key === graniteKey);
  assert.equal(granite?.kind, 'retirement', 'the unrelated departure is still a retirement');
  assert.equal(granite?.detail, 'retired');

  const previous = JSON.parse(readFileSync(join(DATA_DIR, 'sources', 'openrouter-models', 'previous.json'), 'utf8'));
  const latest = JSON.parse(readFileSync(join(DATA_DIR, 'sources', 'openrouter-models', 'latest.json'), 'utf8'));
  assert.equal(previous.rows['qwen/qwen3.8-max'], undefined, 'the old row is absent from the committed previous snapshot');
  assert.equal(latest.rows['qwen/qwen3.8-max'], undefined, 'the old row is absent from the committed latest snapshot');
  assert.equal(previous.rows['qwen/qwen3.8-max-0902']?.canonical_slug, 'qwen/qwen3.8-max-20260902');
  assert.equal(latest.rows['qwen/qwen3.8-max-0902']?.canonical_slug, 'qwen/qwen3.8-max-20260902');
});

test('the raw per-token strings are what the feed still carries underneath', () => {
  // The conversion is a rendering. Nothing rewrites the line.
  const line = priceLine();
  const [rendered] = changedFeed([line], { entries: [] });
  assert.equal(rendered.detail, 'input price $0.06 → $0.04 per Mtok');
  assert.equal(line.old, '0.00000006', 'the input line is not mutated');
  assert.equal(line.new, '0.000000045');
});
