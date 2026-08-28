/**
 * mint.mjs — mechanical stub minting and lifecycle timeline appends.
 *
 * specs/pulse, "Registry ingest mints stubs and appends lifecycle events,
 * mechanically". Two deterministic behaviours, both part of the data-layer
 * update step, and the two are strictly separated:
 *
 *   - **Minting creates a new record. It never modifies an existing entry.**
 *     Every alias on a minted stub is classed `manual`, so an automatic
 *     process never claims `exclusive` and mechanical minting can never
 *     create a wrong link. Upgrading an alias class is entry-editing work
 *     for the Desk.
 *   - **A lifecycle append touches an existing entry, and only its
 *     `timeline`.** Status changes only: prices and other field changes live
 *     in the diff history, never the timeline.
 *
 * A row whose id is already declared by any entry — stub or hand-authored —
 * never mints again, and a source with no `mints` mapping never creates a
 * file at all.
 *
 * Front matter is edited through `yaml`'s Document API, which preserves key
 * order and comments: a mechanical append must not reformat prose an author
 * wrote.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { paths, readJson, relPosix, sourcePaths, today, writeJson } from './core.mjs';
import { deriveStatus, displayName } from './diff.mjs';
import { declaredRowIds } from './corpus.mjs';
import { loadSnapshot } from './sources.mjs';

/** Deterministic slug from a row id: lowercase kebab-case, nothing else. */
export function slugFromRowId(rowId) {
  return String(rowId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Split a Markdown file into its raw front-matter text and its body. */
export function splitFrontMatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { frontMatter: null, body: normalized };
  const end = normalized.indexOf('\n---', 3);
  if (end === -1) return { frontMatter: null, body: normalized };
  const frontMatter = normalized.slice(4, end + 1);
  let rest = normalized.slice(end + 4);
  if (rest.startsWith('\n')) rest = rest.slice(1);
  return { frontMatter, body: rest };
}

function composeFile(frontMatterText, body) {
  const fm = frontMatterText.endsWith('\n') ? frontMatterText : frontMatterText + '\n';
  return `---\n${fm}---\n${body ? '\n' + body.replace(/^\n+/, '') : ''}`;
}

/**
 * The front matter of a minted stub. Ordered as specs/wiki's worked example
 * orders it, so a minted file and a hand-authored one read the same.
 */
export function stubFrontMatter(source, rowId, row, { date = today() } = {}) {
  const kind = source.mints.kind;
  const slug = slugFromRowId(rowId);
  const name = displayName(source, row) ?? rowId;
  const facts = [];
  for (const spec of source.material_fields ?? []) {
    facts.push({
      field: spec.field,
      source: 'feed',
      feed: source.id,
      path: spec.path,
      volatility: 'fast',
    });
  }
  // Field order and field set both matter: `lib/schema.mjs` validates entries
  // with a **strict** schema, so an extra key here fails the build. Minting
  // provenance therefore lives in `data/sources/<id>/minted.json` rather than
  // in the entry — see `recordMinted` below.
  return {
    id: `${kind}/${slug}`,
    kind,
    display_name: name,
    status: deriveStatus(source, row) ?? 'active',
    // "living — has feed-bound or `fast` facts; the Pulse re-checks on
    // cadence" (specs/wiki). Every minted stub is feed-bound by definition.
    maintenance: 'living',
    aliases: [{ name, class: 'manual' }],
    feeds: { [source.id]: rowId },
    facts,
    timeline: [],
    mentions: [],
  };
}

function writeStub(root, source, rowId, row, date) {
  const kind = source.mints.kind;
  const slug = slugFromRowId(rowId);
  const dir = join(paths(root).wiki, kind);
  const file = join(dir, `${slug}.md`);
  const rel = relPosix(root, file);

  if (existsSync(file)) {
    // A slug collision between two different row ids. Never overwrite: an
    // existing record is another entry's, and minting only ever creates.
    const existing = splitFrontMatter(readFileSync(file, 'utf8'));
    let declared = null;
    try {
      declared = YAML.parse(existing.frontMatter ?? '')?.feeds?.[source.id] ?? null;
    } catch {
      declared = null;
    }
    return { outcome: declared === rowId ? 'already-declared' : 'slug-collision', path: rel, row_id: rowId };
  }

  const fm = stubFrontMatter(source, rowId, row, { date });
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, composeFile(YAML.stringify(fm, { lineWidth: 0 }), ''), 'utf8');
  return { outcome: 'minted', path: rel, row_id: rowId, id: fm.id };
}

/**
 * Mint one stub per undeclared row of every minting source.
 *
 * `corpus` is re-read by the caller after minting, because the minted files
 * become declared rows for everything downstream in the same run.
 */
export function mintStubs(root, registry, corpus, { date = today(), limit = Infinity } = {}) {
  const result = { minted: [], collisions: [], skipped_sources: [], considered: 0 };
  for (const source of registry.sources) {
    if (!source.mints) {
      result.skipped_sources.push(source.id);
      continue;
    }
    const latest = loadSnapshot(root, source.id, 'latest');
    if (!latest) continue;
    const declared = declaredRowIds(corpus, source.id);
    const minted = [];
    for (const rowId of Object.keys(latest.rows ?? {}).sort()) {
      if (declared.has(rowId)) continue;
      result.considered++;
      if (result.minted.length >= limit) break;
      const res = writeStub(root, source, rowId, latest.rows[rowId], date);
      if (res.outcome === 'minted') {
        result.minted.push(res);
        minted.push(res);
      } else if (res.outcome === 'slug-collision') result.collisions.push(res);
    }
    if (minted.length) recordMinted(root, source.id, minted, date);
  }
  return result;
}

/**
 * Provenance for mechanically minted stubs, kept beside the source's own
 * state rather than inside the entry.
 *
 * The entry schema is strict, and correctly so — but that leaves nowhere in
 * the front matter to say "a machine made this record, on this date, from
 * this row". That fact matters to the Desk (a stub is not authored work) and
 * to anyone auditing how the corpus grew, so it is recorded here. Idempotency
 * does **not** depend on this file: a row never mints twice because some
 * entry already declares it, which survives this file being deleted.
 */
export function recordMinted(root, sourceId, minted, date) {
  const file = join(sourcePaths(root, sourceId).dir, 'minted.json');
  const existing = readJson(file, {});
  for (const m of minted) existing[m.row_id] = { entry_id: m.id, path: m.path, date };
  writeJson(file, existing);
  return file;
}

/**
 * Append dated, sourced timeline events for status changes on declared rows.
 *
 * The event carries exactly `date`, `event` and `source_url`: the entry
 * schema's timeline shape is strict, so a richer event (from/to, the change
 * key, an author marker) would fail the build. Idempotency comes from two
 * places instead:
 *
 *   1. the caller passes only **newly recorded** change lines, so a standing
 *      diff cannot re-fire the same event on later days; and
 *   2. an entry that already carries an event with the same date, event text
 *      and source is left untouched.
 */
export function appendTimelineEvents(root, corpus, changes) {
  const result = { appended: [], unjoined: [] };
  const byRow = new Map();
  for (const e of corpus.entries) {
    for (const [source, rowId] of Object.entries(e.feeds)) {
      if (typeof rowId === 'string' && rowId !== '') byRow.set(`${source} ${rowId}`, e);
    }
  }

  for (const change of changes) {
    if (change.kind !== 'field_change' || change.field !== 'status') continue;
    const entry = byRow.get(`${change.source} ${change.row_id}`);
    if (!entry) {
      // An undeclared row never touches an entry (specs/wiki).
      result.unjoined.push({ row_id: change.row_id, source: change.source });
      continue;
    }
    const file = join(root, entry.path.split('/').join('/'));
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, 'utf8');
    const { frontMatter, body } = splitFrontMatter(raw);
    if (frontMatter == null) continue;

    let doc;
    try {
      doc = YAML.parseDocument(frontMatter);
    } catch {
      continue; // unparseable front matter is the build's problem, not the engine's
    }

    const event = {
      date: change.date,
      event: String(change.new ?? 'unknown'),
      source_url: change.source_url,
    };

    const existing = doc.toJS()?.timeline;
    if (
      Array.isArray(existing) &&
      existing.some((t) => t && t.date === event.date && t.event === event.event && t.source_url === event.source_url)
    ) {
      continue;
    }

    const seq = doc.get('timeline');
    if (seq && typeof seq.add === 'function') seq.add(doc.createNode(event));
    else doc.set('timeline', doc.createNode([...(Array.isArray(existing) ? existing : []), event]));

    writeFileSync(file, composeFile(doc.toString({ lineWidth: 0 }), body), 'utf8');
    result.appended.push({ entry: entry.id, path: entry.path, date: event.date, event: event.event });
  }

  return result;
}
