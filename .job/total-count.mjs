import { readFileSync, appendFileSync } from 'node:fs';
const j = JSON.parse(readFileSync(new URL('./openrouter-body.json', import.meta.url), 'utf8'));
const line = `\n--- read back from the same saved body ---\ntotal_count: ${JSON.stringify(j.total_count)}\n`;
appendFileSync(process.argv[2], line);
console.log(line);
