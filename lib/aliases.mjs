/**
 * aliases.mjs — the derived alias registry (task 2.5).
 *
 * Derived from entry front matter on every build and written to
 * `data/derived/aliases.json`; never hand-maintained (specs/wiki). Two
 * entries claiming the same alias as `exclusive` fails the build, naming
 * both.
 *
 * `linkable` is the field the linker reads, and it is deliberately stricter
 * than "class is exclusive": a name is linkable only when **exactly one**
 * entry declares it at all and that one declaration is `exclusive`. If a
 * second entry also declares the name — even as `shared` or `manual`, which
 * is not a collision and does not fail the build — the name is ambiguous and
 * the linker must stay silent. Rule 3 in specs/wiki says refuse on any
 * ambiguity; a missing link is a non-event, a wrong one is a false claim on
 * a published page.
 */

import { join } from 'node:path';
import { DERIVED_DIR, writeJsonDeterministic } from './paths.mjs';

export const ALIASES_FILE = join(DERIVED_DIR, 'aliases.json');

/**
 * @param {{file: string, data: object}[]} entries
 * @param {import('./errors.mjs').Diagnostics} diags
 * @returns {{ registry: object, byName: Map<string, object> }}
 */
export function buildAliasRegistry(entries, diags) {
  /** @type {Map<string, {name: string, claims: {id: string, file: string, class: string}[]}>} */
  const claims = new Map();

  for (const doc of entries) {
    const seenHere = new Set();
    for (const a of doc.data.aliases) {
      if (seenHere.has(a.name)) {
        diags.error({
          file: doc.file,
          field: 'aliases',
          message: `declares the alias "${a.name}" more than once`,
          rule: 'duplicate-alias',
        });
        continue;
      }
      seenHere.add(a.name);
      if (!claims.has(a.name)) claims.set(a.name, { name: a.name, claims: [] });
      claims.get(a.name).claims.push({ id: doc.data.id, file: doc.file, class: a.class });
    }
  }

  const names = [...claims.keys()].sort();
  const aliases = [];
  const byName = new Map();

  for (const name of names) {
    const record = claims.get(name);
    const exclusives = record.claims.filter((c) => c.class === 'exclusive');

    if (exclusives.length > 1) {
      const who = exclusives.map((c) => `${c.id} (${c.file})`).join(' and ');
      diags.error({
        file: exclusives[0].file,
        field: 'aliases',
        message: `alias "${name}" is claimed as exclusive by more than one entry: ${who} — demote it to shared or manual on both`,
        rule: 'alias-collision',
      });
    }

    const linkable = record.claims.length === 1 && record.claims[0].class === 'exclusive';
    const entry = {
      name,
      linkable,
      claimed_by: record.claims
        .map((c) => ({ id: c.id, class: c.class }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    };
    aliases.push(entry);
    byName.set(name, entry);
  }

  return { registry: { aliases }, byName };
}

/** Only the linkable names, longest first — the order the linker scans in. */
export function linkableAliases(byName) {
  return [...byName.values()]
    .filter((a) => a.linkable)
    .map((a) => ({ name: a.name, id: a.claimed_by[0].id }))
    .sort((a, b) => b.name.length - a.name.length || a.name.localeCompare(b.name));
}

export async function writeAliasRegistry(registry, file = ALIASES_FILE) {
  return writeJsonDeterministic(file, registry);
}
