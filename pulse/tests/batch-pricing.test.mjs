import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, makeRoot, readJson, writeJson } from './helpers.mjs';
import { deriveBatchPricing } from '../lib/batch-pricing.mjs';

function line(id, date, prompt, completion, key = id) {
  return JSON.stringify({
    date,
    display_name: id,
    excerpt: { id, name: id, 'pricing.prompt': prompt, 'pricing.completion': completion },
    key,
    row_id: id,
    source: 'openrouter-models',
  }) + '\n';
}

test('batch pricing pairs current catalog siblings and groups every provider', (t) => {
  const root = makeRoot();
  t.after(() => cleanup(root));
  const changes = join(root, 'data', 'changes.jsonl');
  appendFileSync(changes, line('acme/alpha', '2026-09-01', '0.000010', '0.000020', 'a'));
  appendFileSync(changes, line('acme/alpha:batch', '2026-09-01', '0.000005', '0.000010', 'b'));
  appendFileSync(changes, line('acme/alpha', '2026-09-02', '0.000008', '0.000016', 'c'));
  appendFileSync(changes, line('other/beta', '2026-09-02', '0.000003', null, 'd'));
  appendFileSync(changes, line('other/beta:batch', '2026-09-02', '0.000001', null, 'e'));
  appendFileSync(changes, line('orphan/gamma:batch', '2026-09-02', '1', '1', 'f'));
  writeJson(join(root, 'data', 'sources', 'openrouter-models', 'latest.json'), {
    date: '2026-09-03',
    rows: {
      'acme/alpha': { id: 'acme/alpha', name: 'Alpha', pricing: { prompt: '0.000008', completion: '0.000016' } },
      'acme/alpha:batch': { id: 'acme/alpha:batch', name: 'Alpha (batch)', pricing: { prompt: '0.000004', completion: '0.000008' } },
      'other/beta': { id: 'other/beta', name: 'Beta', pricing: { prompt: '0.000003', completion: null } },
      'other/beta:batch': { id: 'other/beta:batch', name: 'Beta (batch)', pricing: { prompt: '0.000001', completion: null } },
      'orphan/gamma:batch': { id: 'orphan/gamma:batch', name: 'Gamma (batch)', pricing: { prompt: '1', completion: '1' } },
      'new/current': { id: 'new/current', name: 'Current', pricing: { prompt: '0.000010', completion: '0.000020' } },
      'new/current:batch': { id: 'new/current:batch', name: 'Current (batch)', pricing: { prompt: '0.000005', completion: '0.000010' } },
    },
  });

  const view = deriveBatchPricing(root);
  assert.equal(view.row_count, 3);
  assert.deepEqual(view.providers.map((p) => p.provider), ['acme', 'new', 'other']);
  const alpha = view.providers[0].models[0];
  assert.equal(alpha.synchronous.prompt, '0.000008', 'current catalog row wins');
  assert.equal(alpha.ratios.prompt, 0.5);
  assert.equal(alpha.ratios.completion, 0.5);
  assert.equal(alpha.savings.prompt, 0.5);
  assert.equal(view.providers[1].models[0].model_id, 'new/current', 'current row without history is included');
  assert.equal(view.providers[2].models[0].ratios.completion, null, 'missing meter stays unknown');
  assert.deepEqual(readJson(join(root, 'data', 'derived', 'batch-pricing.json')), view);
});

test('unpaired batch rows do not enter the view', (t) => {
  const root = makeRoot();
  t.after(() => cleanup(root));
  writeJson(join(root, 'data', 'sources', 'openrouter-models', 'latest.json'), {
    date: '2026-09-01',
    rows: {
      'acme/a': { id: 'acme/a', name: 'A', pricing: { prompt: '1', completion: '1' } },
      'acme/a:batch': { id: 'acme/a:batch', name: 'A (batch)', pricing: { prompt: '0.5', completion: '0.5' } },
      'orphan/b': { id: 'orphan/b', name: 'B (batch)', pricing: { prompt: '1', completion: '1' } },
    },
  });
  const view = deriveBatchPricing(root);
  assert.equal(view.row_count, 1);
  assert.equal(view.providers[0].models[0].model_id, 'acme/a');
});
