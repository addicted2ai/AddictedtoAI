/**
 * specs.mjs — pulling the relevant spec text into a brief.
 *
 * Briefs are self-contained plain markdown (specs/loop rule 4): the executor
 * gets the task, the acceptance checks and the relevant spec excerpts, and
 * never a reference to a prior conversation or a session.
 *
 * "Self-contained" is in tension with "no minimum context window" (rule 3):
 * pasting three whole capability specs into every brief would quietly make a
 * large window a requirement, which is exactly the kind of dependency that
 * makes a swap fail. So excerpts are targeted at the job type and capped, and
 * the brief names the full files — which are present in the worktree, so
 * naming them keeps the brief self-contained without making it enormous.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The constitution: one capability's whole spec, `openspec/specs/<cap>/spec.md`.
 *
 * This used to be the FIRST of two candidates, the second being a hardcoded
 * `openspec/changes/build-initial-site/specs/<cap>/spec.md`, with the comment
 * "the change's delta specs today, `openspec/specs/` after archive". Both
 * halves failed. The order was backwards for that intent — the moment
 * `openspec/specs/` was populated, the first candidate always won and no change
 * branch was ever reachable — and `build-initial-site` was archived on
 * 2026-08-30 to `openspec/changes/archive/2026-08-30-build-initial-site/`, so
 * the second path stopped existing at all.
 *
 * Measured before the repair: a `scout` brief assembled from the live repo
 * quoted the old `openspec/specs/loop/spec.md`, and `grep -c "The scout looks
 * outward"` over the whole brief returned 0 — the scout's entire normative
 * requirement was invisible to the executor meant to follow it, because that
 * requirement is `## ADDED` in an in-flight delta and had never been archived.
 */
export function specPath(repoRoot, capability) {
  const p = join(repoRoot, 'openspec', 'specs', capability, 'spec.md');
  return existsSync(p) ? p : null;
}

/**
 * Every change currently in flight: the directories under `openspec/changes/`,
 * minus `archive/`.
 *
 * DISCOVERED, never named. Hardcoding one change name is the defect this
 * repairs, and it is a defect with a delay fuse: the name is correct on the day
 * it is typed and silently wrong from the day that change is archived, with
 * nothing failing in between — briefs just get quieter. Sorted so a brief
 * assembled twice from one tree is byte-identical.
 */
export function inFlightChanges(repoRoot) {
  const dir = join(repoRoot, 'openspec', 'changes');
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory() && e.name !== 'archive' && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort();
}

/**
 * The pending amendments to one capability, one per in-flight change that
 * carries a delta for it.
 *
 * @returns {{change: string, path: string}[]}
 */
export function deltaPaths(repoRoot, capability) {
  const out = [];
  for (const change of inFlightChanges(repoRoot)) {
    const p = join(repoRoot, 'openspec', 'changes', change, 'specs', capability, 'spec.md');
    if (existsSync(p)) out.push({ change, path: p });
  }
  return out;
}

/**
 * Everything a brief should quote for one capability: the constitution, then
 * each pending amendment.
 *
 * BOTH, never one instead of the other, and that is the whole care in this
 * function. A change delta is a PARTIAL spec — `## ADDED Requirements` and
 * `## MODIFIED Requirements` blocks, restating only the requirements it
 * touches. Preferring it would hand the executor a fragment where it needed the
 * capability; ignoring it hands the executor a capability with the new rule
 * missing. Only the pair is the truth, and only if the second is LABELLED as
 * pending, which `excerptsFor` does.
 *
 * A capability that exists only in a delta — a brand-new one an in-flight
 * change introduces — has no constitution yet and returns just the delta. That
 * is correct rather than a gap: the fragment is genuinely all there is.
 *
 * @returns {{kind: 'spec'|'delta', change: string|null, path: string}[]}
 */
export function specSources(repoRoot, capability) {
  const sources = [];
  const spec = specPath(repoRoot, capability);
  if (spec) sources.push({ kind: 'spec', change: null, path: spec });
  for (const d of deltaPaths(repoRoot, capability)) {
    sources.push({ kind: 'delta', change: d.change, path: d.path });
  }
  return sources;
}

/** Which capabilities a job type's brief should carry. */
export const SPECS_FOR_TYPE = Object.freeze({
  interpret: ['pulse', 'wiki', 'review'],
  verify: ['education-dynamic', 'wiki', 'review'],
  entry: ['wiki', 'editorial', 'review'],
  tutorial: ['education-dynamic', 'editorial', 'review'],
  post: ['blog', 'editorial', 'review'],
  education: ['education-static', 'editorial', 'review'],
  repair: ['pulse', 'site', 'review'],
  prune: ['editorial', 'review'],
  machinery: ['loop', 'review'],
  // The scout's normative requirement — the outward charge, the cap of three,
  // the drop records, the expiry windows — lives in specs/loop, so a scout
  // brief that fell through to the `?? ['review']` default below would carry
  // review's spec and not one line of its own.
  scout: ['loop', 'editorial', 'review'],
});

/** Prose job types — the ones whose review record needs a non-empty `would-cite`. */
export const PROSE_TYPES = Object.freeze([
  'entry',
  'tutorial',
  'post',
  'education',
  'interpret',
  'prune',
]);

/** Split a spec file into its `### Requirement:` sections, with the preamble. */
export function requirementSections(text) {
  const parts = text.split(/\n(?=### Requirement:)/);
  return parts.map((p) => {
    const m = /^### Requirement:\s*(.+)$/m.exec(p);
    return { heading: m ? m[1].trim() : '(preamble)', text: p.trim() };
  });
}

const TYPE_KEYWORDS = {
  interpret: ['interpret', 'change', 'annotation', 'material', 'diff history'],
  verify: ['verif', 'stale', 'demot', 'freshness', 're-verif'],
  entry: ['entry', 'fact', 'alias', 'transclusion', 'stub', 'source'],
  tutorial: ['tutorial', 'verif', 'perishable', 'demot'],
  post: ['post', 'ceiling', 'correction', 'claim'],
  education: ['education', 'ladder', 'prerequisite', 'perishable'],
  repair: ['link', 'broken', 'repair', 'refus', 'freshness'],
  prune: ['prune', 'worth reading', 'bar'],
  machinery: ['machinery', 'reserved', 'breaker', 'budget', 'portab', 'result protocol'],
  scout: ['scout', 'outward', 'proposal', 'expires', 'candidate', 'worth reading'],
};

/** The label above a chunk, and — for a delta — what a delta IS. */
function chunkHeading(cap, src, superseded = 0) {
  const path = src.path.replace(/\\/g, '/');
  if (src.kind === 'spec') {
    return (
      `### From \`specs/${cap}\` (full text: \`${path}\`)` +
      (superseded
        ? `\n\n${superseded} requirement${superseded === 1 ? '' : 's'} omitted here: the pending ` +
          `amendment below restates ${superseded === 1 ? 'it' : 'them'} in full. Quoting both ` +
          'would spend the excerpt budget on superseded text and hand you two versions of one rule.'
        : '')
    );
  }
  return (
    `### PENDING AMENDMENT to \`specs/${cap}\` — in-flight change \`${src.change}\`\n` +
    `(full text: \`${path}\`)\n\n` +
    'This is a **delta**, not a capability spec: `## ADDED Requirements` and ' +
    '`## MODIFIED Requirements` blocks, restating only the requirements the change touches. It ' +
    'is not archived into the constitution above and does not replace it. Treat it as the ' +
    'pending intent for the requirements it names — where it MODIFIES one that also appears ' +
    'above, the amendment is the newer text.'
  );
}

/**
 * A section too large for its share, cut — and SAYING SO, in the text.
 *
 * A requirement that stops mid-sentence with no marker is worse than one left
 * out: an executor reading a truncated SHALL has no way to know it is holding a
 * fragment, and the fragment looks complete. The marker names the file the rest
 * is in, which is in the worktree, so the brief stays self-contained.
 */
function cutTo(section, share, path) {
  const note =
    `\n\n[... CUT: this requirement is ${section.text.length} characters and the brief's ` +
    `share for this file is ${share}. What you are reading is the opening of it, not the ` +
    `whole rule. Read \`${path.replace(/\\/g, '/')}\` in this worktree before acting on it. ...]`;
  const room = Math.max(0, share - note.length);
  return section.text.slice(0, room) + note;
}

/**
 * One source's sections, most relevant first.
 *
 * Ties break toward a `### Requirement:` section and away from the preamble.
 * That is not tidiness — it is the difference between quoting a rule and quoting
 * a note about the rule. Measured on the live tree: the `loop` delta's preamble
 * and its scout requirement both score 5 on the scout keywords, the preamble
 * comes first in the file, and under a document-order tie-break the preamble was
 * quoted while the requirement it describes was dropped for want of budget.
 */
function scoredSections(path, keywords) {
  return requirementSections(readFileSync(path, 'utf8'))
    .map((s) => {
      const hay = s.text.toLowerCase();
      return { ...s, score: keywords.reduce((n, k) => n + (hay.includes(k) ? 1 : 0), 0) };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(a.heading === '(preamble)') - Number(b.heading === '(preamble)'),
    );
}

/**
 * Targeted excerpts for one job type, capped in total size.
 *
 * `maxChars` is a TOTAL, and the two passes below exist so it behaves like one.
 *
 * Pass 1 gives every source — every capability's constitution and every pending
 * amendment to it — an equal guaranteed share, and always quotes that source's
 * most relevant section even when that one section is larger than the share, in
 * which case it is cut to fit. Nothing is ever represented by silence.
 *
 * Pass 2 hands the unspent remainder back out, round-robin, and a source's first
 * claim on it is to UN-CUT the section pass 1 had to shorten. Without pass 2 the
 * shares are wasted wherever a spec has few relevant sections — measured on the
 * live tree before it existed, a scout brief spent 7,631 of its 14,000 characters
 * and still cut the scout requirement, which is 5,799 characters, down to 2,333.
 * A normative requirement quoted at 40% of its length is the failure this file
 * was repaired for, in a milder form.
 *
 * @returns {{text: string, files: string[], truncated: boolean, chars: number}}
 */
export function excerptsFor(repoRoot, type, { maxChars = 14000 } = {}) {
  const caps = SPECS_FOR_TYPE[type] ?? ['review'];
  const keywords = TYPE_KEYWORDS[type] ?? [];

  /** @type {{cap: string, src: object, scored: object[], picked: object[], used: number, cut: object|null, superseded: number}[]} */
  const plan = [];
  for (const cap of caps) {
    const sources = specSources(repoRoot, cap).map((src) => ({
      src,
      scored: scoredSections(src.path, keywords),
    }));
    // A `## MODIFIED Requirements` block restates the whole requirement, so the
    // constitution's copy of an amended requirement is SUPERSEDED TEXT. Quoting
    // both spends budget twice on one rule and — worse — hands the executor two
    // versions of it with nothing but a heading to say which governs. The
    // amendment's copy is the one kept; the omission is stated in the heading
    // rather than done silently.
    const amended = new Set();
    for (const { src, scored } of sources) {
      if (src.kind !== 'delta') continue;
      for (const s of scored) if (s.heading !== '(preamble)') amended.add(s.heading);
    }
    for (const { src, scored } of sources) {
      const kept = src.kind === 'spec' ? scored.filter((s) => !amended.has(s.heading)) : scored;
      plan.push({
        cap,
        src,
        scored: kept,
        superseded: scored.length - kept.length,
        picked: [],
        used: 0,
        cut: null,
      });
    }
  }
  if (plan.length === 0) return { text: '', files: [], truncated: false, chars: 0 };

  // Pass 1 — the guaranteed share.
  const share = Math.floor(maxChars / plan.length);
  for (const item of plan) {
    for (const s of item.scored) {
      if (s.score === 0 && item.picked.length > 0) continue;
      if (item.picked.length === 0 && s.text.length > share) {
        item.cut = s;
        item.picked.push({ ...s, text: cutTo(s, share, item.src.path) });
        item.used = share;
        continue;
      }
      if (item.used + s.text.length > share) continue;
      item.picked.push(s);
      item.used += s.text.length;
    }
  }

  let spare = maxChars - plan.reduce((n, i) => n + i.used, 0);

  // Pass 2a — RESTORES, every one of them, before any source takes a second
  // section. Finishing a requirement the executor will be judged against
  // outranks quoting one more requirement it will not be. Deltas are restored
  // first: an amendment is the text nothing else in the worktree points the
  // executor at, and it is the half that was invisible before this repair.
  const restoreOrder = [...plan].sort(
    (a, b) => Number(a.src.kind !== 'delta') - Number(b.src.kind !== 'delta'),
  );
  for (const item of restoreOrder) {
    if (!item.cut) continue;
    const cost = item.cut.text.length - item.picked[0].text.length;
    if (cost > spare) continue;
    item.picked[0] = item.cut;
    item.used += cost;
    spare -= cost;
    item.cut = null;
  }

  // Pass 2b — whatever is still unspent, round-robin, one section at a time so
  // no single long spec takes the lot.
  for (let progress = true; spare > 0 && progress; ) {
    progress = false;
    for (const item of plan) {
      if (item.cut) continue;
      const next = item.scored.find((s) => s.score > 0 && !item.picked.includes(s));
      if (!next || next.text.length > spare) continue;
      item.picked.push(next);
      item.used += next.text.length;
      spare -= next.text.length;
      progress = true;
    }
  }

  // "Truncated" means RELEVANT MATERIAL WAS LEFT OUT — a section still cut, or a
  // keyword-matching section never quoted. It drives the brief's "read the full
  // files" line, so it must not be set by a spec merely being long.
  const truncated = plan.some(
    (i) => i.cut !== null || i.scored.some((s) => s.score > 0 && !i.picked.includes(s)),
  );

  return {
    text: plan
      .map(
        (i) =>
          `${chunkHeading(i.cap, i.src, i.superseded)}\n\n${i.picked.map((s) => s.text).join('\n\n')}`,
      )
      .join('\n\n---\n\n'),
    files: plan.map((i) => i.src.path),
    truncated,
    chars: plan.reduce((n, i) => n + i.used, 0),
  };
}
