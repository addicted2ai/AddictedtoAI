/**
 * Confirm every quotation this job records is present verbatim in the bytes
 * that were fetched — not in a stripped rendering of them. HTML bodies are
 * checked after entity-decoding only (&amp; / &#x27; / &quot;), because the
 * bytes carry entities where the document carries characters.
 */
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

// Written by tools/fetch-design-arena-terms.mjs; re-run it if this is empty.
const DIR = `${tmpdir()}/design-arena-bodies`;

const CASES = [
  ['https-designarena-ai-terms-and-conditions.txt', 'Last Updated: June 7, 2026'],
  ['https-designarena-ai-terms-and-conditions.txt', 'offered by Arcada Labs Incorporated'],
  [
    'https-designarena-ai-terms-and-conditions.txt',
    'Arcada Labs and its licensors exclusively own all right, title, and interest in and to the Services, the underlying technology used to develop and provide the Services, Service Information, and all Output, including all associated intellectual property rights',
  ],
  [
    'https-designarena-ai-terms-and-conditions.txt',
    'Use, display, mirror or frame the Services or any individual element within the Services',
  ],
  [
    'https-designarena-ai-terms-and-conditions.txt',
    "without Arcada Labs' express written consent",
  ],
  [
    'https-designarena-ai-terms-and-conditions.txt',
    'Use the Services, or any portion thereof, for any commercial purpose or for the benefit of any third party or in any manner not permitted by these Terms',
  ],
  [
    'https-designarena-ai-terms-and-conditions.txt',
    'to generate data, derived or aggregated in deidentified form, from such User Content or from your use of the Services',
  ],
  ['https-docs-designarena-ai-introduction-md.txt', '## License & Attribution'],
  [
    'https-docs-designarena-ai-introduction-md.txt',
    'Data from the Design Arena API is free to use for personal and commercial projects.',
  ],
  [
    'https-docs-designarena-ai-introduction-md.txt',
    '**Attribution is required.** If you display this data publicly (dashboard, article, application, etc.), you must:',
  ],
  ['https-docs-designarena-ai-introduction-md.txt', 'Credit **Design Arena** as the source'],
  [
    'https-docs-designarena-ai-introduction-md.txt',
    'Provide a visible link to [designarena.ai](https://designarena.ai)',
  ],
  [
    'https-docs-designarena-ai-introduction-md.txt',
    'By applying for API access, you agree to these attribution requirements.',
  ],
  ['https-docs-designarena-ai-introduction-md.txt', 'API access requires an API key'],
  [
    'https-docs-designarena-ai-api-reference-overview-md.txt',
    'Describe your use case and agree to the attribution requirements',
  ],
  [
    'https-docs-designarena-ai-api-reference-overview-md.txt',
    'All API requests require authentication using a Bearer token.',
  ],
  // The apply form's checkbox sentence is broken by <strong> and an <a>, so the
  // whole sentence never appears as one run of bytes. Two fragments that
  // straddle no markup carry it instead — the instrument, not the document, is
  // what made the first attempt read as absent.
  [
    'https-designarena-ai-developers-apply.txt',
    'API publicly (in dashboards, articles, applications, or any other format), I will credit',
  ],
  [
    'https-designarena-ai-developers-apply.txt',
    'as the source and include a visible link to',
  ],
  ['https-www-designarena-ai-robots-txt.txt', 'Disallow: /api/'],
];

let bad = 0;
for (const [file, quote] of CASES) {
  const raw = readFileSync(`${DIR}/${file}`, 'utf8');
  const decoded = raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, '\u2019');
  const hitRaw = raw.includes(quote);
  const hitDecoded = decoded.includes(quote);
  // The apostrophe in the ToS body is a typographic one in some spots.
  const hitCurly = decoded.replace(/\u2019/g, "'").includes(quote);
  const ok = hitRaw || hitDecoded || hitCurly;
  if (!ok) bad += 1;
  console.log(`${ok ? 'PRESENT' : 'ABSENT '} [${file}] ${JSON.stringify(quote.slice(0, 80))}`);
}
console.log(bad === 0 ? '\nALL QUOTES PRESENT IN FETCHED BYTES' : `\n${bad} QUOTE(S) NOT FOUND`);
