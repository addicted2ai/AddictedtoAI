import { recordVanishedRows } from '../pulse/lib/vanished.mjs';
const root = 'D:/addictedtoai-worktrees/j-20260914-24';
const r = recordVanishedRows(root, [{
  source: 'openrouter-models', row_id: '~openai/gpt-latest', entry_id: 'model/openai-gpt-latest',
  path: 'content/wiki/model/openai-gpt-latest.md', last_seen_date: '2026-09-10',
}], {}, '2026-09-14');
console.log(JSON.stringify(r));
