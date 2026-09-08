import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, makeRoot, readJson } from './helpers.mjs';
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

test('batch pricing pairs siblings, groups every provider, and uses the newest row', (t) => {
  const root = makeRoot();
  t.after(() => cleanup(root));
  const changes = join(root, 'data', 'changes.jsonl');
  appendFileSync(changes, line('acme/alpha', '2026-09-01', '0.000010', '0.000020', 'a'));
  appendFileSync(changes, line('acme/alpha:batch', '2026-09-01', '0.000005', '0.000010', 'b'));
  appendFileSync(changes, line('acme/alpha', '2026-09-02', '0.000008', '0.000016', 'c'));
  appendFileSync(changes, line('other/beta', '2026-09-02', '0.000003', null, 'd'));
  appendFileSync(changes, line('other/beta:batch', '2026-09-02', '0.000001', null, 'e'));
  appendFileSync(changes, line('orphan/gamma:batch', '2026-09-02', '1', '1', 'f'));

  const view = deriveBatchPricing(root);
  assert.equal(view.row_count, 2);
  assert.deepEqual(view.providers.map((p) => p.provider), ['acme', 'other']);
  const alpha = view.providers[0].models[0];
  assert.equal(alpha.synchronous.prompt, '0.000008', 'latest feed row wins');
  assert.equal(alpha.ratios.prompt, 0.625);
  assert.equal(alpha.ratios.completion, 0.625);
  assert.equal(alpha.savings.prompt, 0.375);
  assert.equal(view.providers[1].models[0].ratios.completion, null, 'missing meter stays unknown');
  assert.deepEqual(readJson(join(root, 'data', 'derived', 'batch-pricing.json')), view);
});

test('non-OpenRouter rows and unpaired batch rows do not enter the view', (t) => {
  const root = makeRoot();
  t.after(() => cleanup(root));
  appendFileSync(join(root, 'data', 'changes.jsonl'), line('acme/a', '2026-09-01', '1', '1'));
  appendFileSync(join(root, 'data', 'changes.jsonl'), JSON.stringify({ ...JSON.parse(line('acme/a:batch', '2026-09-01', '0.5', '0.5')), source: 'other' }) + '\n');
  const view = deriveBatchPricing(root);
  assert.equal(view.row_count, 0);
  assert.deepEqual(view.providers, []);
});

