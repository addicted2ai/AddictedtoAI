/**
 * corpus.mjs — the Pulse's own tolerant reader of `content/`.
 *
 * The build owns schema validation (specs/wiki, task 2.1) and fails loudly on
 * a malformed file. The Pulse deliberately does **not** share that code and
 * deliberately does not throw: it must keep the site alive on a day when one
 * content file is broken, and the whole point of the engine is that it runs
 * on arithmetic alone. A file it cannot parse is counted and skipped.
 *
 * It reads only what freshness and the queue need — front matter, and the
 * links in the body — never rendering anything.
 */

import { existsSync, readFileSync } from 'node:fs';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { paths, relPosix } from './core.mjs';

const VOLATILITY_DAYS = { fast: 14, slow: 120, static: null, dated: null };

/** Days after which a `cited` fact of this volatility class is overdue. */
export function volatilityInterval(volatility) {
  return VOLATILITY_DAYS[volatility] ?? null;
}

function readOne(root, file) {
  try {
    const raw = readFileSync(file, 'utf8');
    const parsed = matter(raw);
    return {
      path: relPosix(root, file),
      data: parsed.data ?? {},
      body: parsed.content ?? '',
      hasBody: (parsed.content ?? '').trim().length > 0,
    };
  } catch (err) {
    return { path: relPosix(root, file), error: `${err.name}: ${err.message}` };
  }
}

function globMd(dir) {
  if (!existsSync(dir)) return [];
  return fg
    .sync('**/*.md', { cwd: dir, absolute: true, dot: false, ignore: ['**/README.md'] })
    .sort();
}

/** Every external http(s) URL a file references, from front matter and body. */
export function extractLinks(file) {
  const found = new Set();
  const scan = (text) => {
    if (typeof text !== 'string') return;
    for (const m of text.matchAll(/https?:\/\/[^\s"'<>)\]}]+/g)) {
      found.add(m[0].replace(/[.,;:]+$/, ''));
    }
  };
  const walk = (v) => {
    if (typeof v === 'string') scan(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(file.data);
  scan(file.body);
  return [...found].sort();
}

/**
 * Read the whole corpus. Returns plain data; never throws for content
 * reasons. An absent `content/` tree yields empty collections, which is the
 * correct state before the seed content lands.
 */
export function readCorpus(root) {
  const p = paths(root);
  const unreadable = [];
  const load = (dir) =>
    globMd(dir)
      .map((f) => readOne(root, f))
      .filter((f) => {
        if (f.error) {
          unreadable.push({ path: f.path, error: f.error });
          return false;
        }
        return true;
      });

  const entryFiles = load(p.wiki);
  const entries = entryFiles.map((f) => ({
    file: f,
    path: f.path,
    id: typeof f.data.id === 'string' ? f.data.id : null,
    kind: f.data.kind ?? null,
    display_name: f.data.display_name ?? null,
    status: f.data.status ?? null,
    maintenance: f.data.maintenance ?? null,
    aliases: Array.isArray(f.data.aliases) ? f.data.aliases : [],
    feeds: f.data.feeds && typeof f.data.feeds === 'object' ? f.data.feeds : {},
    facts: Array.isArray(f.data.facts) ? f.data.facts : [],
    timeline: Array.isArray(f.data.timeline) ? f.data.timeline : [],
    mentions: Array.isArray(f.data.mentions) ? f.data.mentions : [],
    themes: Array.isArray(f.data.themes) ? f.data.themes : [],
    hasBody: f.hasBody,
  }));

  const tutorials = load(p.content + '/tutorials').map((f) => ({
    file: f,
    path: f.path,
    slug: f.path.split('/').pop().replace(/\.md$/, ''),
    subjects: Array.isArray(f.data.subjects) ? f.data.subjects : [],
    verified_against: f.data.verified_against ?? null,
    verified_on: f.data.verified_on ?? null,
    reverify_days: Number.isFinite(f.data.reverify_days) ? f.data.reverify_days : null,
    archived: Boolean(f.data.archived),
  }));

  const listings = load(p.content + '/directory/tools').map((f) => ({
    file: f,
    path: f.path,
    slug: f.path.split('/').pop().replace(/\.md$/, ''),
    url: typeof f.data.url === 'string' ? f.data.url : null,
    pricing: f.data.pricing ?? null,
    last_verified: f.data.last_verified ?? null,
    entry: f.data.entry ?? null,
    discontinued: f.data.discontinued ?? null,
  }));

  const prose = [
    ...entryFiles.filter((f) => f.hasBody),
    ...load(p.content + '/learn'),
    ...load(p.content + '/blog'),
    ...load(p.content + '/deltas'),
    ...tutorials.map((t) => t.file),
    ...listings.map((l) => l.file),
  ];

  return { entries, tutorials, listings, prose, unreadable };
}

/**
 * Every declared feed binding in the corpus, as
 * `{ source, row_id, entry_id, path }` — the join keys, never names.
 */
export function feedBindings(corpus) {
  const out = [];
  for (const e of corpus.entries) {
    for (const [source, rowId] of Object.entries(e.feeds)) {
      if (typeof rowId !== 'string' || rowId === '') continue;
      out.push({ source, row_id: rowId, entry_id: e.id, path: e.path });
    }
  }
  out.sort((a, b) => (a.source + a.row_id < b.source + b.row_id ? -1 : 1));
  return out;
}

/** Row ids declared for one source, as a Set — what minting checks against. */
export function declaredRowIds(corpus, sourceId) {
  const set = new Set();
  for (const b of feedBindings(corpus)) if (b.source === sourceId) set.add(b.row_id);
  return set;
}

/** Every distinct external URL in the corpus, with the files that cite it. */
export function corpusLinks(corpus) {
  const map = new Map();
  const files = [...corpus.prose, ...corpus.entries.map((e) => e.file)];
  const seenPaths = new Set();
  for (const f of files) {
    if (seenPaths.has(f.path)) continue;
    seenPaths.add(f.path);
    for (const url of extractLinks(f)) {
      if (!map.has(url)) map.set(url, []);
      const list = map.get(url);
      if (!list.includes(f.path)) list.push(f.path);
    }
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([url, cited_by]) => ({ url, cited_by }));
}
