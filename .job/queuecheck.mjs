import { vanishedRowItems } from '../pulse/lib/queue.mjs';

const root = 'D:/addictedtoai-worktrees/j-20260905-04';
const items = vanishedRowItems(root);
console.log('vanished-feed-row items now:', items.length);
for (const i of items) console.log(JSON.stringify(i));
const hit = items.filter((i) => JSON.stringify(i).includes('qwen3.8-max'));
console.log('items still naming qwen3.8-max:', hit.length);
