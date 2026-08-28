/**
 * linker.mjs — the wrap-only alias linker (task 2.6, specs/wiki).
 *
 * The five rules from specs/wiki, and how each is made structural here
 * rather than merely intended:
 *
 *  1. **Only wraps existing text.** The only mutation performed is splitting
 *     one text node into `[text, <a>, text]` where the `<a>`'s sole child is
 *     the *same* substring. No branch of this file constructs a text value;
 *     it slices. `concatText()` is exported so tests can assert the tree's
 *     full text is byte-identical before and after — that assertion, not
 *     this comment, is what makes rule 1 true.
 *  2. **Exact, case-sensitive match** of an alias the registry marked
 *     `linkable` (exactly one entry declares it, as `exclusive`).
 *  3. **Any ambiguity refuses.** Overlapping candidates are all dropped —
 *     no tie-break, not even when they point at the same entry. A tie-break
 *     is a place for a subtle bug to live, and the cost of refusing is a
 *     missing link, which is a non-event.
 *  4. **At most the first occurrence per page**, per alias. If that first
 *     occurrence is refused for ambiguity, the alias goes unlinked on the
 *     page; the second occurrence does not inherit the budget. Occurrences
 *     inside code, headings and existing links are not occurrences at all —
 *     rule 6 puts that text outside the linker's world, so a mention in a
 *     code block does not spend the page's one link.
 *  5. **Deterministic, no model.** Pure function of (tree, registry).
 *  6. **Never inside** `code`, `pre`, `a`, `h1`–`h6`, or any element marked
 *     `data-nolink` (which is how build-injected fact markup opts out).
 *
 * Under these rules a wrong link is structurally impossible: every path that
 * cannot prove a match is unambiguous takes the "leave it plain" branch.
 *
 * Word boundaries are stricter than `\b` on purpose. `\b` would let the
 * alias `GPT-4` match inside `GPT-4-turbo` (the character after is `-`,
 * which `\b` treats as a boundary) and that is precisely the wrong-link
 * family this component exists to prevent.
 */

/** Elements the linker never descends into (rule 6). */
const BLOCKED_TAGS = new Set([
  'a', 'code', 'pre', 'kbd', 'samp', 'script', 'style',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

/** Characters that, immediately before a match, mean it is not a whole token. */
const BEFORE_BLOCK = /[A-Za-z0-9_\-/+#@.]/;
/** Characters that, immediately after a match, mean the same. */
const AFTER_BLOCK = /[A-Za-z0-9_\-/+#@]/;

function isBlockedElement(node) {
  if (node.type !== 'element') return false;
  if (BLOCKED_TAGS.has(node.tagName)) return true;
  const props = node.properties ?? {};
  return 'dataNolink' in props || 'data-nolink' in props;
}

/** Every text value in the tree, concatenated in document order. */
export function concatText(tree) {
  let out = '';
  const walk = (node) => {
    if (node.type === 'text') out += node.value;
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
  return out;
}

/** Eligible text nodes, in document order, with their parent and index. */
function collectEligible(tree) {
  const found = [];
  const walk = (node) => {
    const children = node.children;
    if (!children) return;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (child.type === 'text') {
        found.push({ node: child, parent: node, index: i });
      } else if (child.type === 'element' || child.type === 'root') {
        if (!isBlockedElement(child)) walk(child);
      }
    }
  };
  walk(tree);
  return found;
}

/**
 * Boundary check. A match touching the edge of a text node whose neighbour is
 * an *element* has an unknowable boundary (`**Comfy**UI`), so it is refused —
 * ambiguity degrades to silence.
 */
function boundariesOk(slot, start, end) {
  const { node, parent, index } = slot;
  const text = node.value;

  if (start > 0) {
    if (BEFORE_BLOCK.test(text[start - 1])) return false;
  } else {
    const prev = parent.children[index - 1];
    if (prev) {
      if (prev.type === 'text') {
        if (prev.value.length && BEFORE_BLOCK.test(prev.value[prev.value.length - 1])) return false;
      } else {
        return false; // adjacent element: boundary unknowable
      }
    }
  }

  const afterChar = end < text.length ? text[end] : null;
  if (afterChar !== null) {
    if (AFTER_BLOCK.test(afterChar)) return false;
    // `ComfyUI.js` must not match while `ComfyUI.` (end of sentence) may.
    if (afterChar === '.' && end + 1 < text.length && /[A-Za-z0-9]/.test(text[end + 1])) return false;
  } else {
    const next = parent.children[index + 1];
    if (next) {
      if (next.type === 'text') {
        if (next.value.length && AFTER_BLOCK.test(next.value[0])) return false;
      } else {
        return false;
      }
    }
  }
  return true;
}

/** First eligible occurrence of `name`, or null. Case-sensitive (rule 2). */
function firstOccurrence(slots, name) {
  for (let s = 0; s < slots.length; s += 1) {
    const text = slots[s].node.value;
    let from = 0;
    for (;;) {
      const at = text.indexOf(name, from);
      if (at === -1) break;
      if (boundariesOk(slots[s], at, at + name.length)) {
        return { slot: s, start: at, end: at + name.length };
      }
      from = at + 1;
    }
  }
  return null;
}

/**
 * Wrap first occurrences of linkable aliases in links, in place.
 *
 * @param {object} tree hast tree
 * @param {{name: string, id: string}[]} aliases from `linkableAliases()`
 * @param {object} [opts]
 * @param {string} [opts.selfId] entry id of the page itself; never self-linked
 * @param {(id: string) => string} [opts.href] URL for an entry id
 * @returns {{name: string, id: string}[]} the links actually made
 */
export function linkAliases(tree, aliases, opts = {}) {
  const href = opts.href ?? ((id) => `/wiki/${id}`);
  const slots = collectEligible(tree);
  if (slots.length === 0 || aliases.length === 0) return [];

  // Rule 4: exactly one candidate per alias — its first eligible occurrence.
  const candidates = [];
  for (const alias of aliases) {
    if (opts.selfId && alias.id === opts.selfId) continue;
    const hit = firstOccurrence(slots, alias.name);
    if (hit) candidates.push({ ...hit, name: alias.name, id: alias.id });
  }

  // Rule 3: overlapping candidates are all refused. No tie-break.
  const refused = new Set();
  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const a = candidates[i];
      const b = candidates[j];
      if (a.slot !== b.slot) continue;
      if (a.start < b.end && b.start < a.end) {
        refused.add(i);
        refused.add(j);
      }
    }
  }
  const kept = candidates.filter((_, i) => !refused.has(i));
  if (kept.length === 0) return [];

  // Apply per text node, right to left, so earlier offsets stay valid.
  const bySlot = new Map();
  for (const c of kept) {
    if (!bySlot.has(c.slot)) bySlot.set(c.slot, []);
    bySlot.get(c.slot).push(c);
  }

  // Later slots first: replacing a node changes its parent's child indices,
  // and every other slot in that parent must keep pointing at the right node.
  const slotOrder = [...bySlot.keys()].sort((a, b) => b - a);
  for (const s of slotOrder) {
    const slot = slots[s];
    const list = bySlot.get(s).sort((a, b) => b.start - a.start);
    const text = slot.node.value;
    // Rebuild the node's content by slicing the original string — never by
    // constructing one. This is rule 1, expressed as code.
    /** @type {object[]} */
    const pieces = [];
    let cursor = text.length;
    for (const c of list) {
      const tail = text.slice(c.end, cursor);
      if (tail) pieces.unshift({ type: 'text', value: tail });
      pieces.unshift({
        type: 'element',
        tagName: 'a',
        properties: { href: href(c.id), className: ['wiki-link'], 'data-entry': c.id },
        children: [{ type: 'text', value: text.slice(c.start, c.end) }],
      });
      cursor = c.start;
    }
    const head = text.slice(0, cursor);
    if (head) pieces.unshift({ type: 'text', value: head });

    const at = slot.parent.children.indexOf(slot.node);
    slot.parent.children.splice(at, 1, ...pieces);
  }

  return kept
    .map((c) => ({ name: c.name, id: c.id }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** unified plugin form, for use in the rehype stage of the pipeline. */
export function rehypeAliasLinker(options = {}) {
  return (tree) => {
    const made = linkAliases(tree, options.aliases ?? [], options);
    if (typeof options.onLinked === 'function') options.onLinked(made);
  };
}
