/**
 * Fetch Design Arena's own documents and record what they say about reuse of
 * their leaderboard numbers. Writes a transcript to
 * data/reviews/evidence/verify-design-arena-republication-terms.raw.txt.
 *
 * Node fetch only — no credentials, no headers beyond a plain User-Agent.
 * WebFetch's extractor is not evidence in either direction (CLAUDE.md), so the
 * bytes are captured here and searched here.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const OUT = 'D:/addictedtoai-worktrees/j-20260905-24/data/reviews/evidence/verify-design-arena-republication-terms.raw.txt';
// Fetched bodies are a working cache, not repository content: they are third
// party HTML and they belong outside the tree, like every other test fixture
// this repo builds under the OS temp directory.
const BODIES = `${tmpdir()}/design-arena-bodies`;

const URLS = process.argv.slice(2);

/** URLs whose text is transcribed in full — the documents the finding quotes. */
const FULL_TEXT = [
  '/terms-and-conditions',
  '/introduction.md',
  '/api-reference/overview.md',
  '/developers/apply',
];

const KEYWORDS = [
  'terms', 'Terms of', 'privacy', 'licen', 'copyright', 'republish', 'redistribut',
  'reproduce', 'attribution', 'attribute', 'creative commons', 'CC BY', 'commercial',
  'scrape', 'crawl', 'API', 'all rights reserved', 'permission', 'cite', 'citation',
];

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

say(`# Design Arena republication-terms fetch transcript`);
say(`# run at ${new Date().toISOString()} (local date ${new Date().toLocaleDateString('en-CA')})`);
say('');

mkdirSync(BODIES, { recursive: true });

for (const url of URLS) {
  say(`==== GET ${url}`);
  let res;
  try {
    res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'addictedtoai-verify/1.0' } });
  } catch (err) {
    say(`  FETCH FAILED: ${err.message}`);
    say('');
    continue;
  }
  const body = await res.text();
  say(`  status ${res.status} ${res.statusText}`);
  say(`  final url ${res.url}`);
  say(`  content-type ${res.headers.get('content-type')}`);
  say(`  bytes ${Buffer.byteLength(body)}`);
  const safe = url.replace(/[^a-z0-9]+/gi, '-');
  writeFileSync(`${BODIES}/${safe}.txt`, body);
  const text = /html/i.test(res.headers.get('content-type') ?? '') ? strip(body) : body;
  say(`  stripped text length ${text.length}`);
  for (const kw of KEYWORDS) {
    const n = (text.toLowerCase().match(new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
    if (n > 0) say(`  keyword "${kw}": ${n}`);
  }
  // The documents the finding rests on are transcribed WHOLE, however long:
  // a transcript that elides the clause a record quotes proves nothing. The
  // rest are sampled, and say so.
  const inFull = FULL_TEXT.some((frag) => url.includes(frag));
  const shown =
    inFull || text.length <= 4000
      ? text
      : `${text.slice(0, 2000)}\n  …[middle elided, ${text.length} chars total]…\n${text.slice(-2000)}`;
  say('  ---- text ----');
  say(shown.split('\n').map((l) => `  ${l}`).join('\n'));
  say('  ---- end ----');
  say('');
}

writeFileSync(OUT, `${lines.join('\n')}\n`);
console.log(`\nwrote ${OUT}`);
