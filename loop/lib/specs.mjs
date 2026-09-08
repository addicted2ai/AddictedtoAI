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
 * A section too large for the remaining total budget, cut — and SAYING SO, in
 * the text.
 *
 * A requirement that stops mid-sentence with no marker is worse than one left
 * out: an executor reading a truncated SHALL has no way to know it is holding a
 * fragment, and the fragment looks complete. The marker names the file the rest
 * is in, which is in the worktree, so the brief stays self-contained.
 */
function cutNote(section, path) {
  return (
    `\n\n[... CUT: this requirement is ${section.text.length} characters and only the ` +
    `remaining total excerpt budget was available. What you are reading is the opening ` +
    `of it, not the whole rule. Read \`${path.replace(/\\/g, '/')}\` in this worktree ` +
    `before acting on it. ...]`
  );
}

function cutTo(section, budget, path) {
  if (budget >= section.text.length) return section.text;
  if (budget <= 0) return '';
  const note = cutNote(section, path);
  if (budget <= note.length) return note.slice(0, budget);
  return section.text.slice(0, budget - note.length) + note;
}

function cutTail(section, budget, path) {
  if (budget <= 0) return '';
  const note =
    `\n\n[... CUT: the ordered excerpt ends before requirement ${JSON.stringify(section.heading)} ` +
    `from \`${path.replace(/\\/g, '/')}\`. Read that file for the omitted text. ...]`;
  return note.slice(0, budget);
}

/**
 * One source's sections, most relevant first.
 *
 * Ties break toward a `### Requirement:` section and away from the preamble.
 * The preamble is never a named requirement, so it is excluded before the
 * ordered list is built even when it scores against a keyword.
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

const KNOWN_CAPABILITIES = new Set(Object.values(SPECS_FOR_TYPE).flat());

function capabilityFromSubject(subject) {
  const raw = typeof subject === 'string'
    ? subject
    : subject?.capability ?? subject?.cap ?? subject?.path ?? subject?.subject;
  if (typeof raw !== 'string') return null;
  const normalized = raw.replace(/\\/g, '/').replace(/^\.?\//, '');
  if (KNOWN_CAPABILITIES.has(normalized)) return normalized;
  const match = /(?:^|\/)specs\/([^/]+)(?:\/|$)/.exec(normalized);
  return match && KNOWN_CAPABILITIES.has(match[1]) ? match[1] : null;
}

function excerptOptions(subjectsOrOptions, maybeOptions) {
  if (Array.isArray(subjectsOrOptions)) {
    return { subjects: subjectsOrOptions, ...(maybeOptions ?? {}) };
  }
  return subjectsOrOptions && typeof subjectsOrOptions === 'object'
    ? subjectsOrOptions
    : {};
}

function floorMinimum(section, path) {
  return Math.min(section.text.length, cutNote(section, path).length);
}

/**
 * Targeted excerpts for one job type, capped by one total budget.
 *
 * The governing type's capabilities come first, followed by declared subject
 * capabilities. Each source contributes its named requirement, with a pending
 * amendment for that requirement immediately after its constitution.
 * Constitution floors are reserved before amendments are admitted. There is
 * no per-source allocation: the ordered list is cut at the tail by one cap.
 *
 * `subjects` accepts capability names or specification paths. Stage 0 callers
 * may pass an empty list; the later structured work-order field can pass its
 * declared subject capabilities without changing this contract.
 *
 * @returns {{text: string, files: string[], truncated: boolean, chars: number}}
 */
export function excerptsFor(repoRoot, type, subjectsOrOptions = {}, maybeOptions = {}) {
  const options = excerptOptions(subjectsOrOptions, maybeOptions);
  const requestedMax = Number(options.maxChars ?? 14000);
  const maxChars = Number.isFinite(requestedMax) ? Math.max(0, Math.floor(requestedMax)) : 14000;
  const subjects = Array.isArray(options.subjects) ? options.subjects : [];
  const governing = SPECS_FOR_TYPE[type] ?? ['review'];
  const subjectCaps = subjects.map(capabilityFromSubject).filter(Boolean);
  const caps = [...new Set([...governing, ...subjectCaps])];
  const keywords = TYPE_KEYWORDS[type] ?? [];

  /** @type {{cap: string, src: object, sections: object[], candidates: object[], superseded: number}[]} */
  const plan = [];
  const allFiles = [];
  for (const cap of caps) {
    const sources = specSources(repoRoot, cap).map((src) => ({
      src,
      sections: scoredSections(src.path, keywords),
    }));
    for (const { src } of sources) allFiles.push(src.path);

    const constitution = sources.find(({ src }) => src.kind === 'spec');
    const constitutionSections = constitution ? constitution.sections : [];
    const named = constitutionSections.find((s) => s.score > 0 && s.heading !== '(preamble)') ?? null;
    const namedHeadings = new Set(named ? [named.heading] : []);

    if (constitution) {
      plan.push({
        cap,
        src: constitution.src,
        sections: constitution.sections,
        candidates: named ? [named] : [],
        superseded: 0,
      });
    }

    for (const { src, sections } of sources) {
      if (src.kind !== 'delta') continue;
      const candidates = namedHeadings.size
        ? sections.filter((s) => namedHeadings.has(s.heading)).slice(0, 1)
        : sections.filter((s) => s.heading !== '(preamble)' && s.score > 0).slice(0, 1);
      plan.push({ cap, src, sections, candidates, superseded: 0 });
    }
  }
  if (plan.length === 0 || maxChars === 0) {
    return { text: '', files: allFiles, truncated: plan.some((i) => i.candidates.length > 0), chars: 0 };
  }

  const floors = plan.flatMap((item) =>
    item.src.kind === 'spec'
      ? item.candidates.map((candidate) => ({ item, candidate }))
      : [],
  );
  const floorMinimums = floors.map(({ item, candidate }) => floorMinimum(candidate, item.src.path));
  let used = 0;
  let floorIndex = 0;
  let stopped = false;
  const rendered = new Map();
  const cutCandidates = new Set();

  // Reserve every constitution floor before admitting any amendment. The
  // final text is restored to capability order below, so allocation order and
  // presentation order remain separate without weakening the floor.
  for (const { item, candidate } of floors) {
    const reserve = floorMinimums.slice(floorIndex + 1).reduce((n, value) => n + value, 0);
    const budget = Math.min(candidate.text.length, Math.max(0, maxChars - used - reserve));
    floorIndex += 1;
    if (budget <= 0) continue;
    const text = cutTo(candidate, budget, item.src.path);
    rendered.set(candidate, text);
    used += text.length;
    if (text.length < candidate.text.length) cutCandidates.add(candidate);
  }

  // Amendments follow their own constitution in the presentation order, but
  // are admitted only after every constitution floor has been reserved.
  for (const item of plan) {
    if (item.src.kind !== 'delta' || stopped) continue;
    for (const candidate of item.candidates) {
      const budget = maxChars - used;
      if (budget <= 0) {
        stopped = true;
        break;
      }
      if (candidate.text.length > budget) {
        const marker = cutTail(candidate, budget, item.src.path);
        if (marker) {
          rendered.set(candidate, marker);
          used += marker.length;
        }
        stopped = true;
        break;
      }
      const text = candidate.text;
      rendered.set(candidate, text);
      used += text.length;
    }
  }

  // "Truncated" means named material was cut or another matching section was
  // left out. It drives the brief's instruction to read the full files; a
  // zero-score section is not relevant material and is deliberately ignored.
  const truncated =
    stopped ||
    cutCandidates.size > 0 ||
    plan.some(
      (item) =>
        item.candidates.some((candidate) => !rendered.has(candidate)) ||
        item.sections.some(
          (section) =>
            section.heading !== '(preamble)' &&
            section.score > 0 &&
            !item.candidates.includes(section),
        ),
    );

  return {
    text: plan
      .map((item) => {
        const picked = item.candidates.filter((candidate) => rendered.has(candidate));
        return picked.length
          ? `${chunkHeading(item.cap, item.src, item.superseded)}\n\n${picked.map((candidate) => rendered.get(candidate)).join('\n\n')}`
          : null;
      })
      .filter(Boolean)
      .join('\n\n---\n\n'),
    files: allFiles,
    truncated,
    chars: used,
  };
}
