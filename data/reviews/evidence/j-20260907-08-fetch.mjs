// Fetch the two cited pages raw and search their bytes for the exact strings
// the two carried findings turn on. No extractor in the path. Raw bodies go to
// the OS temp dir, not into the repository.
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const targets = [
  ['techcrunch', 'https://techcrunch.com/2026/09/05/openai-confirms-wiki-incident-says-its-working-on-a-framework-for-more-disclosure/'],
  ['winbuzzer', 'https://winbuzzer.com/2026/09/05/openai-linked-agents-dsewiki-shared-task-data-xcxwbn/'],
];

const needles = [
  'We and the larger AI community',
  'the larger AI community do not yet have a clear standard',
  'stating that both OpenAI and',
  'both OpenAI and',
  'five weeks after the main burst',
  'continued removing agent-created pages',
  'five weeks',
  'main burst',
];

for (const [name, url] of targets) {
  let body = '';
  let status = 0;
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36' },
    });
    status = res.status;
    body = await res.text();
  } catch (err) {
    console.log(`${name}: FETCH ERROR ${err.message}`);
    continue;
  }
  const out = join(tmpdir(), `j-20260907-08-${name}.raw.html`);
  writeFileSync(out, body);
  console.log(`\n=== ${name} status=${status} bytes=${body.length} -> ${out}`);
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  for (const n of needles) {
    const iTxt = text.indexOf(n);
    console.log(`  [${iTxt >= 0 ? 'PRESENT' : 'MISSING'}] ${JSON.stringify(n)}`);
    if (iTxt >= 0) console.log(`      ...${text.slice(Math.max(0, iTxt - 260), iTxt + 380)}...`);
  }
}
