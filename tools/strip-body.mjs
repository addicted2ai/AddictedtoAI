/** Strip a saved HTML body to text and write it beside the original as .text.txt. */
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<\/(p|div|li|h[1-6]|section|tr)>/gi, '\n')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/[ \t]+/g, ' ')
  .replace(/\n\s*\n+/g, '\n')
  .trim();
writeFileSync(`${file}.text.txt`, text);
console.log(`${text.length} chars -> ${file}.text.txt`);
