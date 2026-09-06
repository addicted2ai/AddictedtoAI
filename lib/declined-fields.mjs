/**
 * declined-fields.mjs — the missing half of the `declined_fields` refusal.
 *
 * THE GAP, precisely. `data/sources/registry.json` gained a `declined_fields`
 * list on 2026-09-05: a source may record, with a date and a measurement, that
 * a field it serves is deliberately **not carried**. `pulse/lib/registry.mjs`'s
 * `validateDeclinedFields` enforces that against `material_fields` — the list
 * that builds the catalog column and the changed-feed line — and refuses a path
 * that is both declined and material, in either direction of prefix overlap.
 *
 * But "carried" in this corpus has a second spelling, and that function cannot
 * see it. An entry binds a feed value as a fact:
 *
 *     facts:
 *       - field: intelligence_index
 *         source: feed
 *         feed: openrouter-models
 *         path: benchmarks.artificial_analysis.intelligence_index
 *
 * That is a value rendered on a published page, resolved from the same snapshot
 * row `material_fields` reads. `validateDeclinedFields` never opens
 * `content/wiki/**`, so on the day this module was written the registry formally
 * declined `benchmarks.artificial_analysis` — "not a column, not a fact, not an
 * event" — while **48 fact bindings across 29 model entries** pointed at exactly
 * that path, the build was green, and the contradiction was visible only to
 * whoever happened to look at both files in the same afternoon.
 *
 * This repository's own rule is that guardrails are mechanisms rather than
 * instructions. A refusal that nothing enforces is an instruction. This module
 * is the mechanism: **a path in `declined_fields` that any content file binds as
 * a fact FAILS the build, naming the registry entry and every binding file.**
 *
 * WHY IT LIVES IN `lib/` AND NOT IN `pulse/lib/registry.mjs`. The registry
 * loader is the Pulse's, and the Pulse's engine must stay able to fetch, diff
 * and derive without the content corpus loaded — `pulse/lib/corpus.mjs` states
 * that boundary in its own words. This check needs both trees at once, and the
 * one place that already holds both is the prebuild. It is registered in
 * `scripts/prebuild.mjs`'s STEPS, which that file's header names as the
 * registration point for a new build step; `package.json` is never edited for
 * one.
 *
 * WHAT IT DELIBERATELY DOES NOT DO, because a guardrail's blind spot is part of
 * its specification:
 *
 *  - It does not decide the contradiction it found. Removing the declaration
 *    would discard a measured refusal; unbinding the 48 facts is a content
 *    decision with its own consequences for 29 published pages. Both are
 *    somebody else's job. This module reports.
 *  - It does not require that every path a snapshot serves be accounted for.
 *    That is the same check `validateDeclinedFields` declined to make and for
 *    the same reason, filed as addictedtoai-eexr.
 *  - It reads `facts[].path` and nothing else. A `{{fact:…}}` transclusion binds
 *    a fact FIELD, not a feed path, so it is caught transitively through the
 *    fact it names; a catalog column is `material_fields`, which the registry's
 *    own validator already covers.
 *
 * ---------------------------------------------------------------------------
 * THE RECORDED DEBT — the same ratchet `snapshot-census.mjs`,
 * `price-attribution.mjs` and `arxiv-pin.mjs` use, and for the same reason.
 * `data/declined-binding-debt.json` names the 48 bindings that already existed
 * when this check was written. An entry there is a dated record that a
 * contradiction was live on that date, **not a licence granted to it**: it warns
 * on every build, it fails the moment a NEW binding of a declined path appears,
 * and it has exactly one legal direction, down. An entry that has stopped firing
 * is reported as removable, so the list cannot outlive the debt.
 * ---------------------------------------------------------------------------
 */

import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

import { ROOT, DATA_DIR } from './paths.mjs';
import { pathsOverlap } from '../pulse/lib/registry.mjs';

export const DECLINED_DEBT_FILE = join(DATA_DIR, 'declined-binding-debt.json');

/** Where the registry lives, as a repo-relative path — the string diagnostics name. */
export const REGISTRY_PATH = 'data/sources/registry.json';

/**
 * Re-exported, not redefined. This is literally the predicate
 * `pulse/lib/registry.mjs` applies to `material_fields`, so the two enforcement
 * points of one refusal cannot drift into disagreeing about what "the same
 * field" means.
 *
 * The ANCESTOR direction is the one that matters here and it is why an equality
 * test would have been useless: the real declaration is of a BLOCK
 * (`benchmarks.artificial_analysis`) and every one of the 48 real bindings is of
 * a leaf inside it (`...intelligence_index`). It is segment-aware in both
 * directions — `benchmarks.demo` does not match `benchmarks.demo_index.x`,
 * because the test is for a `.` boundary and not for a string prefix.
 */
export { pathsOverlap };

/**
 * Every refusal the registry records, flattened across sources.
 *
 * @returns {{source: string, path: string, decided_on: string|null}[]}
 */
export function declinedPaths(registry) {
  const out = [];
  for (const source of registry?.sources ?? []) {
    for (const entry of source?.declined_fields ?? []) {
      if (typeof entry?.path !== 'string' || entry.path === '') continue;
      out.push({ source: source.id, path: entry.path, decided_on: entry.decided_on ?? null });
    }
  }
  return out;
}

/**
 * Every feed-bound fact in a document, as the pair the check joins on.
 *
 * `source: 'feed'` is the discriminator `lib/schema.mjs` already validated, so a
 * fact reaching here has both `feed` and `path`. Cited facts carry neither and
 * are not bindings of anything a registry serves.
 *
 * @returns {{field: string, feed: string, path: string}[]}
 */
export function feedBindings(data) {
  const out = [];
  for (const f of data?.facts ?? []) {
    if (f?.source !== 'feed') continue;
    if (typeof f.feed !== 'string' || typeof f.path !== 'string') continue;
    out.push({ field: f.field, feed: f.feed, path: f.path });
  }
  return out;
}

/**
 * The debt key: file, source, declined path, and the fact's own `field`.
 *
 * Keyed by the FACT and never by a line number, following
 * `price-attribution.mjs`'s debt file, which records "by file and fact rather
 * than by line number" because a line number is the one part of a hit that
 * changes when somebody edits the front matter above it. `field` rather than the
 * binding path so that two facts in one entry binding the same declined path get
 * one entry each — unbinding one of them must retire exactly one line of debt.
 */
export function bindingKey({ file, source, declinedPath, field }) {
  return `${file}::${source}::${declinedPath}::${field}`;
}

/** `data/declined-binding-debt.json` -> the set of keys it forgives. */
export function debtKeys(debt) {
  const out = new Set();
  for (const e of debt?.known ?? []) {
    out.add(bindingKey({ file: e.file, source: e.source, declinedPath: e.declined_path, field: e.field }));
  }
  return out;
}

/**
 * Join one corpus against the registry's refusals.
 *
 * `scanned` counts every feed-bound fact examined, bound to a declined path or
 * not — the coverage denominator. Returning only the hits would make a corpus of
 * 437 correctly-bound facts report the same `0` as a corpus that was never
 * loaded, and that indistinguishability has already hidden one vacuum in this
 * repository for a whole seed wave (see `arxiv-pin.mjs`).
 *
 * @param {{file: string, data: object}[]} docs
 * @param {{source: string, path: string, decided_on: string|null}[]} declined
 * @param {Set<string>} known  debt keys, forgiven with a warning rather than an error
 * @returns {{scanned: number, hits: object[], forgiven: object[], keys: string[]}}
 */
export function findDeclinedBindings(docs, declined, known = new Set()) {
  const hits = [];
  const forgiven = [];
  const keys = [];
  let scanned = 0;
  for (const doc of docs ?? []) {
    const file = doc?.file ?? '<unknown file>';
    for (const b of feedBindings(doc?.data)) {
      scanned += 1;
      for (const d of declined) {
        if (b.feed !== d.source) continue;
        if (!pathsOverlap(b.path, d.path)) continue;
        const hit = {
          file,
          field: b.field,
          boundPath: b.path,
          source: d.source,
          declinedPath: d.path,
          decidedOn: d.decided_on,
        };
        const key = bindingKey({ file, source: d.source, declinedPath: d.path, field: b.field });
        if (known.has(key)) {
          forgiven.push(hit);
          keys.push(key);
        } else {
          hits.push(hit);
        }
      }
    }
  }
  const order = (a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.field < b.field ? -1 : a.field > b.field ? 1 : 0);
  return { scanned, hits: hits.sort(order), forgiven: forgiven.sort(order), keys };
}

/** `content/wiki/model/x.md:facts.intelligence_index` — one binding, named as the build names things. */
function nameBinding(h) {
  return `${h.file}:facts.${h.field} (${h.boundPath})`;
}

/**
 * Group hits by the refusal they contradict, so one declined path produces ONE
 * diagnostic naming every binding rather than 48 diagnostics each naming the
 * same registry entry. The requirement is that the failure name both ends; 48
 * repetitions of one end is how a reader stops reading.
 */
function byDeclaration(hits) {
  const groups = new Map();
  for (const h of hits) {
    const key = `${h.source}::${h.declinedPath}`;
    if (!groups.has(key)) groups.set(key, { source: h.source, declinedPath: h.declinedPath, decidedOn: h.decidedOn, members: [] });
    groups.get(key).members.push(h);
  }
  return [...groups.values()].sort((a, b) => (a.source + a.declinedPath < b.source + b.declinedPath ? -1 : 1));
}

const ADVICE =
  'A field is carried or refused, never both. Either the refusal is right and the binding must go, ' +
  'or the binding is right and the refusal must be withdrawn from data/sources/registry.json with a ' +
  'dated note saying why the measurement behind it no longer holds. Recording the contradiction in ' +
  'data/declined-binding-debt.json is the third option and the only one that is not a decision: it ' +
  'warns on every build and may only shrink.';

/**
 * The prebuild step.
 *
 * Reference resolution is off when it loads the corpus itself, for the reason
 * `arxivPinStep` and `anchorCheckStep` turn it off: the `content` step ahead of
 * this one already ran it, and re-reporting the same `mentions` failures would
 * double every message a reader wades through.
 *
 * `registry`, `corpus` and `debt` are all injectable so a fixture can prove the
 * check by mutation — a registry declining a path a fixture entry binds must
 * fail, and one declining a path nothing binds must pass.
 */
export async function declinedFieldsStep(opts = {}) {
  const { loadCorpus } = await import('./corpus.mjs');
  const { Diagnostics } = await import('./errors.mjs');
  const out = opts.out ?? process.stdout;
  const diags = new Diagnostics();

  let registry = opts.registry;
  if (registry === undefined) {
    const { loadRegistry } = await import('../pulse/lib/registry.mjs');
    registry = loadRegistry(opts.root ?? ROOT);
  }
  const declined = declinedPaths(registry);

  const corpus =
    opts.corpus ??
    (await loadCorpus({
      contentRoot: opts.contentRoot,
      diags: new Diagnostics(),
      checkReferences: false,
    }));

  let debt = opts.debt;
  if (debt === undefined) {
    try {
      debt = JSON.parse(await readFile(DECLINED_DEBT_FILE, 'utf8'));
    } catch (err) {
      // An absent file means an empty list, which is the correct reading:
      // nothing is forgiven, so every contradiction fails. It is the safe
      // direction, and it is the state the file is supposed to reach.
      if (err?.code !== 'ENOENT') throw err;
      debt = { known: [] };
    }
  }
  const known = debtKeys(debt);

  const { scanned, hits, forgiven, keys } = findDeclinedBindings(corpus.all, declined, known);

  for (const g of byDeclaration(hits)) {
    diags.error({
      file: REGISTRY_PATH,
      field: `sources[${g.source}].declined_fields[${g.declinedPath}]`,
      message:
        `"${g.declinedPath}" is declined by source "${g.source}"` +
        `${g.decidedOn ? ` (decided_on ${g.decidedOn})` : ''} and is bound as a fact by ` +
        `${g.members.length} content file binding(s): ${g.members.map(nameBinding).join(', ')}. ${ADVICE}`,
      rule: 'declined-field-bound',
    });
  }

  // The forgiven side is deliberately a COUNT and not a list. The error below
  // names every binding, because a failure has to be actionable without opening
  // another file; the warning fires on every build for as long as the debt
  // stands, and 48 file names printed on every build is how a warning becomes
  // scenery. The names are in `data/declined-binding-debt.json`, which the
  // warning points at, and which is where somebody paying the debt works anyway.
  for (const g of byDeclaration(forgiven)) {
    const files = new Set(g.members.map((h) => h.file));
    diags.warn({
      file: 'data/declined-binding-debt.json',
      field: `sources[${g.source}].declined_fields[${g.declinedPath}]`,
      message:
        `known declined-binding debt — "${g.declinedPath}" is declined by source "${g.source}" and ` +
        `is still bound as a fact ${g.members.length} time(s) across ${files.size} file(s), listed in ` +
        'data/declined-binding-debt.json. This list may only shrink.',
      rule: 'declined-field-bound-debt',
    });
  }

  // A debt entry that has stopped firing is reported as removable rather than
  // silently kept, so the file cannot outlive the debt.
  const seen = new Set(keys);
  const stale = [...known].filter((k) => !seen.has(k)).sort();
  for (const k of stale) {
    diags.warn({
      file: 'data/declined-binding-debt.json',
      field: k,
      message: 'recorded debt no longer fires — delete this entry, the list may only shrink',
      rule: 'declined-field-bound-debt-stale',
    });
  }

  diags.printWarnings(out);
  diags.throwIfErrors('declined-field');
  const line =
    `prebuild: declined fields — ${declined.length} refusal(s) in ${REGISTRY_PATH} against ` +
    `${scanned} feed-bound fact(s); ${hits.length} contradiction(s) (build error), ` +
    `${forgiven.length} recorded as debt (warning; this number may only fall)` +
    `${stale.length ? `, ${stale.length} stale debt entry/entries to delete` : ''}\n`;
  out.write(line);
  return { declined: declined.length, scanned, errors: hits.length, known: forgiven.length, stale, line };
}
