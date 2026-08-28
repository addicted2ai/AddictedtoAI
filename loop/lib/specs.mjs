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

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Both homes: the change's delta specs today, `openspec/specs/` after archive. */
export function specPath(repoRoot, capability) {
  const candidates = [
    join(repoRoot, 'openspec', 'specs', capability, 'spec.md'),
    join(repoRoot, 'openspec', 'changes', 'build-initial-site', 'specs', capability, 'spec.md'),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
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
};

/**
 * Targeted excerpts for one job type, capped in total size.
 *
 * @returns {{text: string, files: string[], truncated: boolean}}
 */
export function excerptsFor(repoRoot, type, { maxChars = 14000 } = {}) {
  const caps = SPECS_FOR_TYPE[type] ?? ['review'];
  const keywords = TYPE_KEYWORDS[type] ?? [];
  const chunks = [];
  const files = [];
  let used = 0;
  let truncated = false;

  for (const cap of caps) {
    const p = specPath(repoRoot, cap);
    if (!p) continue;
    files.push(p);
    const sections = requirementSections(readFileSync(p, 'utf8'));
    const scored = sections
      .map((s) => {
        const hay = s.text.toLowerCase();
        const score = keywords.reduce((n, k) => n + (hay.includes(k) ? 1 : 0), 0);
        return { ...s, score };
      })
      .sort((a, b) => b.score - a.score);
    const budget = Math.floor(maxChars / caps.length);
    let capUsed = 0;
    const picked = [];
    for (const s of scored) {
      if (s.score === 0 && picked.length > 0) continue;
      if (capUsed + s.text.length > budget) {
        truncated = true;
        continue;
      }
      picked.push(s);
      capUsed += s.text.length;
    }
    if (picked.length === 0 && scored.length > 0) {
      picked.push({ ...scored[0], text: scored[0].text.slice(0, budget) });
      truncated = true;
    }
    used += capUsed;
    chunks.push(
      `### From \`specs/${cap}\` (full text: \`${p.replace(/\\/g, '/')}\`)\n\n` +
        picked.map((s) => s.text).join('\n\n'),
    );
  }
  return {
    text: chunks.join('\n\n---\n\n'),
    files,
    truncated,
    chars: used,
  };
}
