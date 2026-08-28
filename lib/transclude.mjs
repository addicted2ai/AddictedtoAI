/**
 * transclude.mjs — `{{fact:<kind>/<slug>#<field>}}` (task 2.4) and
 * `{{want:Name}}` (task 2.8).
 *
 * Both run as an **mdast** transform over text nodes only. That is not an
 * implementation detail: `code` and `inlineCode` are their own mdast node
 * types, so visiting text nodes automatically leaves markers inside code
 * fences alone — a tutorial can document the syntax without the build trying
 * to resolve `model/foo`.
 *
 * The build does **not** scan prose for mentions of things. Fuzzy matching was
 * deliberately cut (design D6: "computed at build by scanning prose ... is
 * deliberately NOT attempted (fuzzy matching = guessing)"). Demand is recorded
 * only where an author wrote `{{want:Name}}`, and nowhere else.
 *
 * A `{{...}}` that parses as neither marker is a build error rather than
 * literal output. A mistyped marker would otherwise ship to a published page
 * as visible braces, and the failure mode of a silent typo here is a page
 * that states a volatile fact as `{{fact:model/gpt-5#pricee}}`.
 */

import { FIELD_NAME_RE } from './schema.mjs';

export const FACT_RE = /\{\{fact:([a-z]+\/[a-z0-9-]+)#([A-Za-z0-9_]+)\}\}/;
export const WANT_RE = /\{\{want:([^{}\n]+)\}\}/;
const ANY_MARKER_RE = /\{\{[\s\S]*?\}\}/g;

/** All text nodes in an mdast tree, with their parents, in document order. */
function collectTextNodes(tree) {
  const out = [];
  const walk = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'text') out.push({ node: child, parent: node });
      else walk(child);
    }
  };
  walk(tree);
  return out;
}

/**
 * @param {object} tree mdast
 * @param {object} ctx
 * @param {string} ctx.file           repo-relative path, for diagnostics
 * @param {Map<string, object>} ctx.byId  entry id -> entry doc
 * @param {(entry: object, fact: object) => string} ctx.renderFact
 * @param {import('./errors.mjs').Diagnostics} ctx.diags
 * @param {Map<string, Set<string>>} [ctx.wants]  name -> referring page paths
 * @returns {{ facts: string[], wants: string[] }} what this page transcluded
 */
export function transclude(tree, ctx) {
  const usedFacts = [];
  const usedWants = [];

  for (const { node, parent } of collectTextNodes(tree)) {
    const text = node.value;
    if (!text.includes('{{')) continue;

    const pieces = [];
    let cursor = 0;
    ANY_MARKER_RE.lastIndex = 0;
    let m;
    while ((m = ANY_MARKER_RE.exec(text)) !== null) {
      const marker = m[0];
      const start = m.index;
      if (start > cursor) pieces.push({ type: 'text', value: text.slice(cursor, start) });
      cursor = start + marker.length;

      const fact = FACT_RE.exec(marker);
      const want = WANT_RE.exec(marker);

      if (fact && fact[0] === marker) {
        const [, id, field] = fact;
        const entry = ctx.byId.get(id);
        if (!entry) {
          ctx.diags.error({
            file: ctx.file,
            field: marker,
            message: `transclusion references entry "${id}", which does not exist`,
            rule: 'unresolved-transclusion',
          });
          pieces.push({ type: 'text', value: marker });
          continue;
        }
        const target = (entry.data.facts ?? []).find((f) => f.field === field);
        if (!target) {
          const available = (entry.data.facts ?? []).map((f) => f.field).join(', ') || 'none';
          ctx.diags.error({
            file: ctx.file,
            field: marker,
            message: `entry "${id}" has no fact "${field}" (declared facts: ${available})`,
            rule: 'unresolved-transclusion',
          });
          pieces.push({ type: 'text', value: marker });
          continue;
        }
        usedFacts.push(`${id}#${field}`);
        pieces.push({ type: 'html', value: ctx.renderFact(entry, target) });
        continue;
      }

      if (want && want[0] === marker) {
        const name = want[1].trim();
        if (!name) {
          ctx.diags.error({
            file: ctx.file,
            field: marker,
            message: 'want marker has an empty name',
            rule: 'bad-marker',
          });
          continue;
        }
        usedWants.push(name);
        if (ctx.wants) {
          if (!ctx.wants.has(name)) ctx.wants.set(name, new Set());
          ctx.wants.get(name).add(ctx.file);
        }
        // Renders as the plain text `Name` — nothing else (specs/wiki).
        pieces.push({ type: 'text', value: name });
        continue;
      }

      const hint = marker.startsWith('{{fact:')
        ? `expected {{fact:<kind>/<slug>#<field>}} — field names are ${FIELD_NAME_RE.source}`
        : 'expected {{fact:<kind>/<slug>#<field>}} or {{want:Name}}; put template syntax in a code span';
      ctx.diags.error({
        file: ctx.file,
        field: marker,
        message: `unrecognized marker — ${hint}`,
        rule: 'bad-marker',
      });
      pieces.push({ type: 'text', value: marker });
    }

    if (pieces.length === 0) continue;
    if (cursor < text.length) pieces.push({ type: 'text', value: text.slice(cursor) });

    const at = parent.children.indexOf(node);
    parent.children.splice(at, 1, ...pieces);
  }

  return { facts: usedFacts, wants: usedWants };
}

/** `data/derived/wants.json` — count of *distinct referring pages* per name. */
export function wantsRegistry(wants) {
  const list = [...wants.entries()]
    .map(([name, pages]) => ({
      name,
      count: pages.size,
      pages: [...pages].sort(),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { wants: list };
}
