/**
 * domain-seeds.mjs — the Pulse's domain seeding, part of the data-layer update
 * step (change `tag-the-corpus-by-domain`, task 11; specs/wiki, "A seeded
 * domain and an editorial domain are separate fields").
 *
 * It writes ONE front-matter key, `domains_seeded`, on entries that declare a
 * joined feed row, from named feed fields, and it only ever ADDS. No model is
 * invoked on any path, nothing here reads prose, and no index VALUE is read:
 * the two benchmark rules below ask whether a row carries a number, which is
 * not what the number says, so K24's unresolved republication rights are
 * untouched by this file.
 *
 * ---------------------------------------------------------------------------
 * APPEND-ONLY, AND THE REASON IS A MEASUREMENT (K47).
 *
 * A signal that has DISAPPEARED from the current snapshot removes nothing. The
 * obvious alternative — recompute the seeded set from today's rows on every run
 * — was rejected on evidence: between the two committed OpenRouter snapshots
 * (`previous.json`, fetched 2026-09-04, 427 rows; `latest.json`, fetched
 * 2026-09-05, 431 rows) the count of rows carrying a numeric
 * `benchmarks.artificial_analysis.agentic_index` fell from 166 to 99 across the
 * publisher's own v4.2 index rebase. Under a recomputing rule that one night
 * would have silently deleted an `agents` tag from 67 entries, with no
 * editorial decision anywhere and nothing on any page saying so.
 *
 * So removal is an editorial act, spelled `domains_excluded`, and it goes
 * through review like any other judgment. The consequence is stated rather than
 * discovered: `domains_seeded` is a record of every signal ever observed and
 * NOT a snapshot of the current feed. `timeline` accumulates for the same
 * reason and is accepted on the same terms.
 *
 * ---------------------------------------------------------------------------
 * A DISAPPEARANCE WRITES NO CHANGE LINE EITHER, and that is a decision rather
 * than an omission.
 *
 * The review that ratified append-only seeding recommended that the Pulse write
 * a `field_change` line when a seeding signal vanishes, so the disappearance is
 * visible. The change decided against it (`proposal.md`, with the three
 * measurements). The short form: `data/sources/registry.json` already records
 * `benchmarks.artificial_analysis` under `declined_fields` — "Not a column, not
 * a fact, not an event", decided 2026-09-05 — and an emitter here would re-admit
 * that one publisher act to the changed feed through a path that never reads the
 * decision. `pulse/lib/diff.mjs:377-378` states what it would break: a field
 * "is an event in one place or in neither". The volume is not hypothetical
 * either: 71 number->absent transitions on the two index fields across those two
 * snapshots, against the 182 lines `data/changes.jsonl` held on 2026-09-05.
 *
 * This module therefore emits nothing anywhere except the entry files it
 * appends to. `pulse/tests/domain-seeds.test.mjs` asserts that, because a
 * decision nothing enforces is a sentence.
 *
 * ---------------------------------------------------------------------------
 * WHY THE MAPPING IS SPELLED OUT IN BOTH DIRECTIONS.
 *
 * `image`, `video` and `audio` are spelled identically in OpenRouter's modality
 * vocabulary and in this site's domain vocabulary. That is a coincidence of
 * naming, not a mapping, and writing the rule as "if the modality token is in
 * `DOMAINS`, tag it" would make the feed's spelling the decision — the same
 * shape as the directory spec's refusal to derive a listing's domain from its
 * `category`, and the same shape as the field-name-instead-of-source test that
 * cost this surface an iteration (implementer ledger #10). So `MODALITY_DOMAIN`
 * below states the tokens that map to nothing as explicitly as the ones that
 * map to something, and a token this table has never seen maps to nothing and
 * is REPORTED rather than guessed at: an unaccounted upstream value is a
 * question nobody has answered, and it should not look like an answered one.
 * ---------------------------------------------------------------------------
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';

import { DOMAINS } from '../../lib/domains.mjs';
import { loadSnapshot } from './sources.mjs';
import { splitFrontMatter } from './mint.mjs';

/**
 * OpenRouter's modality tokens, every one of them, and the domain each seeds.
 *
 * `null` is a decision and is written down as one. `text` maps to nothing
 * because it is not a domain at all (K38): read from `latest.json` on
 * 2026-09-05, every one of the 431 rows takes text in, out, or both, and a facet
 * value carried by every member of the set it divides discriminates nothing.
 * `file` maps to nothing because a document upload is a transport, not a field
 * of AI.
 */
export const MODALITY_DOMAIN = Object.freeze({
  text: null,
  file: null,
  image: 'image',
  video: 'video',
  audio: 'audio',
});

/**
 * The seeding rules, per source id, and the ONLY place a feed field becomes a
 * domain.
 *
 * `research`, `science-math` and `robotics` are deliberately absent: no feed
 * this repository carries has a signal for them, so they are editorial only. An
 * entry is `research` because somebody decided it is, and there is no field to
 * point at instead.
 *
 * Two rule kinds, and both name a path rather than a shape:
 *
 *   - `modalities` — the domain is read from the CONTENTS of a named array
 *     field, through `MODALITY_DOMAIN` above.
 *   - `present`    — the domain is seeded by the PRESENCE of a number at a named
 *     path. Presence is `Number.isFinite`, not `'x' in row`: OpenRouter writes
 *     the benchmark keys with `null` on rows it has not scored, so key-presence
 *     would tag the 243 rows carrying the block rather than the 181 carrying a
 *     score, and the measurements this change rests on counted rows carrying a
 *     NUMBER. Nothing reads the number itself, and nothing renders it.
 */
export const DOMAIN_SEEDS = Object.freeze({
  'openrouter-models': Object.freeze([
    Object.freeze({ kind: 'modalities', path: 'architecture.input_modalities' }),
    Object.freeze({ kind: 'modalities', path: 'architecture.output_modalities' }),
    Object.freeze({
      kind: 'present',
      path: 'benchmarks.artificial_analysis.coding_index',
      domain: 'coding',
    }),
    Object.freeze({
      kind: 'present',
      path: 'benchmarks.artificial_analysis.agentic_index',
      domain: 'agents',
    }),
  ]),
});

/** Read a dotted path out of a row. Never throws; a missing branch is absent. */
function at(row, path) {
  let cur = row;
  for (const seg of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[seg];
  }
  return cur;
}

/**
 * The domains one snapshot row signals, plus any modality token the table does
 * not account for.
 *
 * Exported so the rule can be measured directly against a real snapshot row,
 * without a fixture repository around it.
 */
export function signalsForRow(row, rules) {
  const domains = new Set();
  const unmapped = new Set();
  for (const rule of rules ?? []) {
    if (rule.kind === 'modalities') {
      const list = at(row, rule.path);
      if (!Array.isArray(list)) continue;
      for (const token of list) {
        if (typeof token !== 'string') continue;
        if (!(token in MODALITY_DOMAIN)) {
          unmapped.add(token);
          continue;
        }
        const domain = MODALITY_DOMAIN[token];
        if (domain) domains.add(domain);
      }
      continue;
    }
    if (rule.kind === 'present') {
      if (Number.isFinite(at(row, rule.path))) domains.add(rule.domain);
      continue;
    }
  }
  // A rule that produced a value outside the vocabulary is a defect in this
  // table, not in the feed, and it must stop the engine rather than write a
  // front matter the build will reject afterwards.
  for (const d of domains) {
    if (!DOMAINS.includes(d)) {
      throw new Error(
        `domain seeding rule produced ${JSON.stringify(d)}, which is not in the closed vocabulary ` +
          `(${DOMAINS.join(', ')}) — fix pulse/lib/domain-seeds.mjs, not the entry`,
      );
    }
  }
  return { domains, unmapped };
}

/**
 * Append seeded domains to every entry that declares a joined row.
 *
 * Idempotent by construction: a value already in `domains_seeded` is never
 * written twice, and an entry with nothing to add is not rewritten at all — so
 * a second run over an unchanged snapshot touches no file and appends nothing
 * anywhere.
 *
 * @returns {{appended: {entry: string|null, path: string, added: string[]}[],
 *            unmapped: {source: string, token: string}[]}}
 */
export function seedDomains(root, registry, corpus, { seeds = DOMAIN_SEEDS } = {}) {
  const result = { appended: [], unmapped: [] };
  const unmappedSeen = new Set();

  for (const source of registry?.sources ?? []) {
    const rules = seeds[source.id];
    if (!rules) continue;
    const latest = loadSnapshot(root, source.id, 'latest');
    if (!latest || !latest.rows) continue;

    for (const entry of corpus.entries) {
      const rowId = entry.feeds?.[source.id];
      if (typeof rowId !== 'string' || rowId === '') continue;
      const row = latest.rows[rowId];
      // A row that has vanished from the snapshot signals nothing. It also
      // removes nothing — that is the append-only rule, and it is why this is a
      // `continue` and not a branch that computes an empty set and writes it.
      if (!row) continue;

      const { domains, unmapped } = signalsForRow(row, rules);
      for (const token of unmapped) {
        const key = `${source.id} ${token}`;
        if (unmappedSeen.has(key)) continue;
        unmappedSeen.add(key);
        result.unmapped.push({ source: source.id, token });
      }
      if (domains.size === 0) continue;

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

      const existing = doc.toJS()?.domains_seeded;
      const already = new Set(Array.isArray(existing) ? existing.filter((d) => typeof d === 'string') : []);
      // Sorted by domain id, which is the ordering rule the whole facet uses
      // (`directory`, "No placement is ever sold", extended to domain
      // groupings): a pure function of the ids, never the order the vocabulary
      // happens to be written in and never the order a feed listed them.
      // Existing values are left exactly where they are — this appends.
      const additions = [...domains].filter((d) => !already.has(d)).sort();
      if (additions.length === 0) continue;

      const seq = doc.get('domains_seeded');
      if (seq && typeof seq.add === 'function') {
        for (const d of additions) seq.add(doc.createNode(d));
      } else {
        doc.set(
          'domains_seeded',
          doc.createNode([...(Array.isArray(existing) ? existing : []), ...additions]),
        );
      }

      writeFileSync(file, composeFile(doc.toString({ lineWidth: 0 }), body), 'utf8');
      result.appended.push({ entry: entry.id ?? null, path: entry.path, added: additions });
    }
  }

  result.appended.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  result.unmapped.sort((a, b) =>
    `${a.source} ${a.token}` < `${b.source} ${b.token}` ? -1 : 1,
  );
  return result;
}

/**
 * Front matter and body back into one file.
 *
 * A local copy of `mint.mjs`'s three-line composer rather than an import,
 * because that one is not exported and widening its visibility to serve this
 * file would make a private detail of stub minting part of two modules' API.
 */
function composeFile(frontMatterText, body) {
  const fm = frontMatterText.endsWith('\n') ? frontMatterText : frontMatterText + '\n';
  return `---\n${fm}---\n${body ? '\n' + body.replace(/^\n+/, '') : ''}`;
}
