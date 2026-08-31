/**
 * surfaces.mjs — the selector rules the surface specs assert.
 *
 * These are not editorial advice living in a brief somewhere; they are
 * refusals with names, enforced before a model is invoked.
 *
 *  - The tutorial demotion gate (specs/education-dynamic): no new tutorial
 *    while one stands demoted for staleness — unless its subject is dead,
 *    where archival, not re-verification, is the correct end state.
 *
 * **The blog ceiling used to be the first rule in this list and is gone**
 * (make-the-blog-worth-sending, task 1.3), along with `recentPosts`, which
 * existed only to feed it. specs/blog now says publishing is quality-gated,
 * never quota-driven: no selector rule counts published posts, because a count
 * cannot tell a week that had nothing worth sending from a week that did.
 */

import { statSync } from 'node:fs';
import { demotedTutorials } from './queue.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

export function tutorialDemotionGate(ctx, candidate) {
  if (candidate.type !== 'tutorial') return { ok: true };
  const demoted = demotedTutorials(ctx);
  if (demoted.length === 0) return { ok: true };
  const names = demoted.map((d) => d.id ?? d.slug ?? d.path ?? d.file ?? '(unnamed)');
  return {
    ok: false,
    rule: 'education-dynamic:demotion-gate',
    reason:
      `${demoted.length} tutorial(s) stand demoted for staleness (${names.join(', ')}); no new ` +
      `tutorial is started while one does. Archived tutorials with dead subjects do not block — ` +
      `these are not archived`,
  };
}

/**
 * Tutorial upkeep priority (specs/education-dynamic): re-verification wins
 * whenever both compete in the same tier.
 */
export function tutorialPriorityGate(candidate, allCandidates) {
  if (candidate.type !== 'tutorial') return { ok: true };
  const competing = allCandidates.filter((c) => c.tutorialVerify);
  if (competing.length === 0) return { ok: true };
  return {
    ok: false,
    rule: 'education-dynamic:verify-outranks-tutorial',
    reason:
      `a tutorial re-verification is competing in this tier ` +
      `(${competing.map((c) => c.title).join('; ')}); re-verifying existing tutorials takes ` +
      `priority over writing new ones`,
  };
}

/** Only used for reporting; keeps mtime out of the surface rules themselves. */
export function fileAgeDays(path, now) {
  return (now.getTime() - statSync(path).mtimeMs) / DAY_MS;
}
