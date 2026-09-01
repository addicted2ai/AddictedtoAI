/**
 * jsonld.test.mjs — the schema.org graph builders (beads `addictedtoai-k1j`).
 *
 * The claim these tests are here to hold is the one in `lib/jsonld.mjs`'s
 * header: **a graph never asserts what the page does not.** That is not a
 * property of any single output; it is a property of what happens when an
 * input is MISSING, so most of what follows feeds the builders half-answers
 * and measures that the key disappears rather than acquiring a plausible
 * value.
 *
 * `scripts/verify-surfaces.mjs` proves the other half — that the graphs
 * actually reach the exported HTML, that every `dateModified` matches that
 * page's `<lastmod>` in `sitemap.xml`, and that every quoted `description`
 * appears in its page's own text. Neither file can do the other's job: these
 * run in milliseconds against hand-built docs, that one needs a real export.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SCHEMA_CONTEXT,
  TERM_KINDS,
  DEFINED_TERM_SET_URL,
  DATASET_DESCRIPTION,
  serializeJsonLd,
  compact,
  firstParagraphText,
  publisherNode,
  definedTermGraph,
  definedTermSetGraph,
  softwareApplicationGraph,
  postGraph,
  deltaGraph,
  datasetGraph,
} from './jsonld.mjs';
import { SITE_URL, SITE_NAME } from './site-config.mjs';
import { DATASET_CSV_ROUTES, DATASET_JSON_ROUTE, DATASET_LICENSE_URL } from './asset-routes.mjs';

/** A built entry doc, in the shape `build-content.mjs` produces. */
function entryDoc(over = {}) {
  return {
    url: '/wiki/concept/ai-winter',
    html: '<p>"AI winter" names a mechanism, not a capability level.</p><p>Second paragraph.</p>',
    index: { indexed: true },
    ...over,
    data: {
      id: 'concept/ai-winter',
      kind: 'concept',
      display_name: 'AI winter',
      aliases: [
        { name: 'AI winter', class: 'exclusive' },
        { name: 'AI Winter', class: 'shared' },
      ],
      status: 'active',
      ...(over.data ?? {}),
    },
  };
}

// ── the serialiser: nothing in a graph may close the script element ────────

test('serializeJsonLd escapes every character that could break out of a <script>', () => {
  const out = serializeJsonLd({ description: '</script><img src=x onerror=alert(1)> & more' });
  assert.ok(!out.includes('<'), 'no raw < survives');
  assert.ok(!out.includes('>'), 'no raw > survives');
  assert.ok(!out.includes('&'), 'no raw & survives');
  assert.ok(out.includes('\\u003c/script\\u003e'), 'the closing tag is escaped, not removed');
  // Still valid JSON, and still the same string once parsed: escaping is a
  // transport concern, not a content change.
  assert.equal(JSON.parse(out).description, '</script><img src=x onerror=alert(1)> & more');
});

test('serializeJsonLd escapes U+2028/U+2029, which are legal JSON and illegal JavaScript', () => {
  const out = serializeJsonLd({ a: 'one\u2028two\u2029three' });
  assert.ok(!/[\u2028\u2029]/.test(out), 'no raw line separator survives');
  assert.equal(JSON.parse(out).a, 'one\u2028two\u2029three');
});

// ── compact: the mechanism behind "never assert what the page does not" ────

test('compact drops absent values and keeps false and zero, which are answers', () => {
  assert.deepEqual(
    compact({ a: 1, b: undefined, c: null, d: '', e: '   ', f: [], g: {}, h: false, i: 0 }),
    { a: 1, h: false, i: 0 },
  );
});

test('compact recurses, so a nested node is held to the same rule', () => {
  assert.deepEqual(
    compact({ outer: { name: 'x', url: undefined }, list: [{ a: undefined }, { b: 2 }] }),
    { outer: { name: 'x' }, list: [{ b: 2 }] },
  );
});

test('compact returns undefined for an object with nothing left, so an empty node never ships', () => {
  assert.equal(compact({ a: undefined, b: null }), undefined);
  assert.equal(compact([]), undefined);
});

// ── firstParagraphText: a quotation, not a summary ────────────────────────

test('firstParagraphText quotes the first paragraph verbatim, tags stripped', () => {
  const html = '<p>A <em>terminal</em> pair programmer that <a href="/x">edits files</a>.</p><p>Next.</p>';
  assert.equal(firstParagraphText(html), 'A terminal pair programmer that edits files.');
});

test('firstParagraphText decodes entities so the quotation matches the page a reader sees', () => {
  assert.equal(firstParagraphText('<p>Salt &amp; pepper &#8212; &quot;quoted&quot;</p>'), 'Salt & pepper — "quoted"');
});

test('firstParagraphText returns undefined for a body with no paragraph — the data-only entry case', () => {
  assert.equal(firstParagraphText(''), undefined);
  assert.equal(firstParagraphText(undefined), undefined);
  assert.equal(firstParagraphText('<ul><li>not a paragraph</li></ul>'), undefined);
  assert.equal(firstParagraphText('<p>   </p>'), undefined, 'an empty paragraph is not a description');
});

// ── DefinedTerm ───────────────────────────────────────────────────────────

test('TERM_KINDS is concept and technique, and definedTermGraph refuses every other kind', () => {
  assert.deepEqual([...TERM_KINDS], ['concept', 'technique']);
  for (const kind of ['model', 'org', 'tool', 'benchmark', 'dataset', 'hardware', 'paper', 'event']) {
    assert.equal(
      definedTermGraph(entryDoc({ data: { kind } })),
      undefined,
      `${kind} is not a defined term and must get no graph rather than a plausible one`,
    );
  }
});

test('definedTermGraph derives every field from the doc, and nothing else', () => {
  const g = definedTermGraph(entryDoc(), { dateModified: '2026-08-30' });
  assert.equal(g['@context'], SCHEMA_CONTEXT);
  assert.equal(g['@type'], 'DefinedTerm');
  assert.equal(g.name, 'AI winter');
  assert.equal(g.identifier, 'concept/ai-winter');
  assert.equal(g.url, `${SITE_URL}/wiki/concept/ai-winter`);
  assert.equal(g['@id'], `${SITE_URL}/wiki/concept/ai-winter#term`);
  assert.equal(g.dateModified, '2026-08-30');
  assert.equal(g.inDefinedTermSet['@id'], DEFINED_TERM_SET_URL);
  assert.equal(g.description, '"AI winter" names a mechanism, not a capability level.');
  // The alias equal to the display name adds nothing and is dropped; the one
  // that differs is kept, in declared order.
  assert.deepEqual(g.alternateName, ['AI Winter']);
});

test('definedTermGraph omits description entirely when the entry has no prose body', () => {
  const g = definedTermGraph(entryDoc({ html: '' }), { dateModified: '2026-08-30' });
  assert.ok(!('description' in g), 'a data-only entry states no definition rather than a filler one');
  assert.equal(g.name, 'AI winter', 'the rest of the term still ships');
});

test('definedTermGraph omits dateModified when the caller has none — never a build clock', () => {
  const g = definedTermGraph(entryDoc());
  assert.ok(!('dateModified' in g));
});

test('definedTermGraph omits alternateName when every alias repeats the display name', () => {
  const doc = entryDoc({ data: { aliases: [{ name: 'AI winter', class: 'exclusive' }] } });
  assert.ok(!('alternateName' in definedTermGraph(doc)));
});

// ── DefinedTermSet ────────────────────────────────────────────────────────

test('definedTermSetGraph lists its members by the same URL their own pages claim', () => {
  const g = definedTermSetGraph([entryDoc()], { description: 'One record per thing.' });
  assert.equal(g['@type'], 'DefinedTermSet');
  assert.equal(g['@id'], DEFINED_TERM_SET_URL);
  assert.equal(g.hasDefinedTerm.length, 1);
  assert.equal(g.hasDefinedTerm[0]['@id'], definedTermGraph(entryDoc())['@id']);
});

test('definedTermSetGraph carries no dateModified — see lib/jsonld.mjs on the index routes', () => {
  assert.ok(!('dateModified' in definedTermSetGraph([entryDoc()])));
  assert.ok(!('dateModified' in datasetGraph()));
});

// ── SoftwareApplication ───────────────────────────────────────────────────

function listing(over = {}) {
  return {
    state: { alive: true },
    doc: {
      url: '/tools/aider',
      html: '<p>A terminal pair programmer that edits files in a git repository.</p>',
      data: {
        title: 'Aider',
        url: 'https://aider.chat/',
        pricing: 'free, open source (Apache-2.0); you supply your own model API key',
        last_verified: '2026-08-28',
        category: 'coding',
        ...(over.data ?? {}),
      },
    },
  };
}

test('softwareApplicationGraph points url at the tool and mainEntityOfPage at our listing', () => {
  const g = softwareApplicationGraph(listing(), { dateModified: '2026-08-28' });
  assert.equal(g['@type'], 'SoftwareApplication');
  assert.equal(g.name, 'Aider');
  assert.equal(g.url, 'https://aider.chat/', 'the thing described is the application');
  assert.equal(g.mainEntityOfPage, `${SITE_URL}/tools/aider`, 'our page is a page ABOUT it');
  assert.equal(g.applicationCategory, 'coding');
  assert.equal(g.dateModified, '2026-08-28');
});

test('softwareApplicationGraph never turns the pricing sentence into an offer', () => {
  const g = softwareApplicationGraph(listing(), { dateModified: '2026-08-28' });
  assert.ok(!('offers' in g), '`pricing:` is an author sentence, not a currency amount');
  assert.ok(!JSON.stringify(g).includes('Apache-2.0'), 'and it is not smuggled in under another key');
});

// ── Article, for posts and for deltas ─────────────────────────────────────

test('postGraph states datePublished from the post date and dateModified from the caller', () => {
  const doc = {
    url: '/blog/a-post',
    html: '<p>The opening paragraph.</p>',
    data: { title: 'A post', date: '2026-08-20' },
  };
  const g = postGraph(doc, { dateModified: '2026-08-29' });
  assert.equal(g['@type'], 'Article');
  assert.equal(g.headline, 'A post');
  assert.equal(g.datePublished, '2026-08-20');
  assert.equal(g.dateModified, '2026-08-29');
  assert.equal(g.description, 'The opening paragraph.');
  assert.equal(g.publisher.name, SITE_NAME);
  assert.ok(!('author' in g), 'no author is claimed — see lib/jsonld.mjs');
});

test('deltaGraph uses `capability` as the description and states no datePublished', () => {
  const view = {
    url: '/impossible-routine/speech-to-text',
    title: 'Speech to text',
    capability: 'Transcribing an hour of audio accurately.',
    impossible: { date: '2009-08-27' },
    routine: { date: '2023-09-21' },
  };
  const g = deltaGraph(view, { dateModified: '2026-08-28' });
  assert.equal(g.headline, 'Speech to text');
  assert.equal(g.description, 'Transcribing an hour of audio accurately.');
  assert.ok(!('datePublished' in g), "a delta's dates are facts about the subject (addictedtoai-3u1)");
  const serialized = JSON.stringify(g);
  assert.ok(!serialized.includes('2009-08-27') && !serialized.includes('2023-09-21'),
    'neither end date may leak into a date field about the PAGE');
});

// ── Dataset ───────────────────────────────────────────────────────────────

test('datasetGraph advertises exactly the files lib/asset-routes.mjs says the build writes', () => {
  const g = datasetGraph();
  assert.equal(g['@type'], 'Dataset');
  assert.equal(g.license, DATASET_LICENSE_URL);
  assert.equal(g.description, DATASET_DESCRIPTION);
  assert.equal(g.isAccessibleForFree, true);

  const urls = g.distribution.map((d) => d.contentUrl).sort();
  const expected = [DATASET_JSON_ROUTE, ...Object.values(DATASET_CSV_ROUTES)]
    .map((r) => `${SITE_URL}${r}`)
    .sort();
  assert.deepEqual(urls, expected, 'a file that stops being written stops being advertised');
  for (const d of g.distribution) {
    assert.ok(d.name, 'every download is named');
    assert.ok(d.encodingFormat, 'every download states its format');
  }
});

test('publisherNode is the site, as an Organization, and names no model or person', () => {
  assert.deepEqual(publisherNode(), { '@type': 'Organization', name: SITE_NAME, url: SITE_URL });
});
