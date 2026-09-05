import { readFileSync } from 'node:fs';

const out = 'D:/addictedtoai-worktrees/j-20260905-04/out/';
const html = readFileSync(out + 'wiki/model/qwen-qwen3-8-max.html', 'utf8');
console.log('bytes', html.length);
console.log('unresolved {{ markers:', (html.match(/\{\{/g) || []).length);
console.log('links to the 0902 entry:', (html.match(/qwen-qwen3-8-max-0902/g) || []).length);

const strip = (h) =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/g, '/')
    .replace(/\s+/g, ' ');

const text = strip(html);
const at = text.indexOf('Nothing about the substitution');
console.log('\n--- rendered paragraph ---\n' + text.slice(at, at + 620));

const home = strip(readFileSync(out + 'index.html', 'utf8'));
const i = home.indexOf('Qwen3.8 Max');
console.log('\n--- home page around first "Qwen3.8 Max" ---\n' + home.slice(Math.max(0, i - 300), i + 300));
