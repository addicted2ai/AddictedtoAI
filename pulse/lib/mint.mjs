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
import { KIND } from '../../lib/change-kinds.mjs';

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
 * Rows in a minting source's latest snapshot that would land on a path an
 * existing entry already occupies, where that entry does not declare them —
 * the same condition `writeStub` above reports as `outcome: 'slug-collision'`
 * at mint time, recomputed here as a pure read so the condition can become a
 * derived-queue finding instead of only a warning line nobody reads
 * (addictedtoai-2wa: a retired entry — `feeds:` binding removed after its row
 * vanished from a feed — leaves `writeStub` permanently refusing to mint that
 * row if the source ever lists it again, with no trace but a per-run log
 * line).
 *
 * Pure with respect to the filesystem beyond what is already loaded: every
 * input is the source's own latest snapshot (`loadSnapshot`, already read
 * elsewhere in a run) and `corpus` (already read by the caller, and — when
 * called after `mintStubs` in the same run — already reflecting anything that
 * run itself minted). No clock, and no `minted.json` read: the corpus's
 * declared feed bindings are the single source of truth for "does anything
 * already claim this row", exactly as `declaredRowIds` is for minting itself.
 * A row that has never been minted before and happens to collide with a
 * hand-authored entry is exactly as real a finding as a re-listed row
 * colliding with the entry retired for it — both are "a live row cannot
 * mint because its slug is taken by an entry that does not declare it".
 *
 * Three things must all hold for one row to be reported, and each is a
 * separate, independently falsifiable gate:
 *
 *   1. the row is a key of the LATEST snapshot's `rows` — not merely
 *      remembered from a previous snapshot or from minting provenance. A row
 *      genuinely still absent from the feed is `vanished-feed-row`'s
 *      condition, not this one, and must never also fire this one.
 *   2. `declaredRowIds` does not contain it — nothing already declares it, so
 *      minting would otherwise be attempted.
 *   3. the path a stub would be written to (`<kind>/<slug>.md` under
 *      `content/wiki/`) is occupied by an entry in the corpus.
 *
 * Gate 2 alone already proves the entry found in gate 3, if any, does not
 * declare the row: `declaredRowIds` scans every entry's `feeds`, so an entry
 * occupying the expected path that DID declare this row under this source
 * would have put the row in that set, contradicting gate 2. No second
 * per-entry check is needed or performed.
 */
export function findSlugCollisions(root, registry, corpus) {
  const byPath = new Map(corpus.entries.filter((e) => e.path).map((e) => [e.path, e]));
  const out = [];
  for (const source of registry.sources) {
    if (!source.mints) continue;
    const latest = loadSnapshot(root, source.id, 'latest');
    if (!latest) continue;
    const kind = source.mints.kind;
    const declared = declaredRowIds(corpus, source.id);
    for (const rowId of Object.keys(latest.rows ?? {}).sort()) {
      if (declared.has(rowId)) continue; // gate 2: already declared — the ordinary case
      const slug = slugFromRowId(rowId);
      const expectedPath = relPosix(root, join(paths(root).wiki, kind, `${slug}.md`));
      const entry = byPath.get(expectedPath); // gate 3
      if (!entry) continue; // no file at that path: mints normally
      out.push({
        source: source.id,
        row_id: rowId,
        entry_id: entry.id ?? null,
        path: entry.path,
        entry_status: entry.status ?? null,
      });
    }
  }
  out.sort((a, b) => (a.source + '\0' + a.row_id < b.source + '\0' + b.row_id ? -1 : 1));
  return out;
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
    if (change.kind !== KIND.FIELD_CHANGE || change.field !== 'status') continue;
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

    // `date` MUST serialise as a QUOTED string. Written bare, `2026-08-29` is a
    // YAML timestamp: it round-trips back as a Date, the entry schema's isoDate
    // rejects it as "expected string, received Date", and the Pulse's own site
    // rebuild then fails on content the Pulse itself just wrote. Measured
    // 2026-08-29 — the engine could not complete a run, and because the failing
    // entry no longer loaded, an org page mentioning it failed too, so one bad
    // scalar produced two content errors in unrelated files.
    const seq = doc.get('timeline');
    if (seq && typeof seq.add === 'function') seq.add(doc.createNode(event));
    else doc.set('timeline', doc.createNode([...(Array.isArray(existing) ? existing : []), event]));

    // Quote every date in the sequence, not just the one just added: the `else`
    // branch above rebuilds the whole timeline, and a bare date anywhere in it
    // breaks the file just as surely as a bare date in the new event.
    const written = doc.get('timeline');
    if (written && Array.isArray(written.items)) {
      for (const item of written.items) {
        const d = typeof item?.get === 'function' ? item.get('date', true) : null;
        if (d && typeof d === 'object' && 'value' in d) d.type = 'QUOTE_DOUBLE';
      }
    }

    writeFileSync(file, composeFile(doc.toString({ lineWidth: 0 }), body), 'utf8');
    result.appended.push({ entry: entry.id, path: entry.path, date: event.date, event: event.event });
  }

  return result;
}
