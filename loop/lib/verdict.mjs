/**
 * verdict.mjs — reading a review verdict record.
 *
 * Split out of `review.mjs` so that the *site build* can read a verdict
 * without importing the Desk. `lib/indexability.mjs` enforces specs/wiki's
 * "a prose body that passed review", which means the build has to know what a
 * verdict record says — and `review.mjs` reaches `exec.mjs`, `git.mjs` and
 * `brief.mjs` behind it, none of which has any business inside `next build`.
 *
 * The split is a move, not a copy. There is exactly one parser for a verdict
 * record in this repository, and every reader of one — the merge gate,
 * `scripts/verify-launch.mjs`, and the build's indexability join — goes
 * through it. Two parsers that agree today are how the merge gate and the
 * launch check drift apart later.
 *
 * `review.mjs` re-exports everything here, so nothing that imported it before
 * has to change.
 */

import matter from 'gray-matter';

/** The closed reason list (specs/review). Verdicts are categorical, never numeric. */
export const REASONS = Object.freeze([
  'false-or-unsupported-claim',
  'intent-not-measurement',
  'not-worth-reading',
  // The voice bar's one gate. `scripts/check-post-voice.mjs` is advisory by
  // decision — it warns and never fails the build, because the house model
  // trips the punctuation-rate markers in every register it writes, so a
  // fail-closed lint would have silently stopped all `post` work while every
  // component reported success. That makes THIS verdict the only thing between
  // machine-made prose and the live site (specs/blog, specs/review).
  'reads-as-generated',
  'overclaiming-summary',
  'spec-violation',
  'broken-reference',
  'scope-violation',
]);

export const VERDICTS = Object.freeze(['approve', 'revise', 'reject']);

/** Parse a verdict record. Front matter first; a plain-text fallback keeps weaker runners usable. */
export function parseVerdict(text) {
  let data = {};
  let body = text;
  try {
    const p = matter(text);
    data = p.data ?? {};
    body = p.content ?? '';
  } catch {
    data = {};
  }
  let verdict = String(data.verdict ?? '').trim().toLowerCase();
  let wouldCite = data['would-cite'] ?? data.would_cite ?? data.wouldCite ?? '';
  // The voice question, on post verdicts. Read by exactly the same three key
  // spellings as `would-cite`, because a reviewer that writes `reads_human`
  // answered the question and a parser that cannot see it would refuse the
  // merge for a field the record contains.
  let readsHuman = data['reads-human'] ?? data.reads_human ?? data.readsHuman ?? '';
  let reasons = data.reasons ?? [];

  // The fallback scans the BODY only. Scanning the whole file would re-read the
  // front matter it just parsed and turn a deliberately empty `would-cite: ""`
  // into the two-character string `""` — a blank field passing the non-empty
  // check, which is precisely the failure this field exists to prevent.
  const hasFrontMatter = Object.keys(data).length > 0;
  const fallbackText = hasFrontMatter ? body : text;
  if (!verdict) {
    const m = /^\s*(?:\*\*)?verdict(?:\*\*)?\s*:\s*`?([a-z]+)`?/im.exec(fallbackText);
    if (m) verdict = m[1].toLowerCase();
  }
  if (!wouldCite && !hasFrontMatter) {
    const m = /^\s*(?:\*\*)?would[-_ ]cite(?:\*\*)?\s*:\s*(.+)$/im.exec(fallbackText);
    if (m) wouldCite = m[1];
  }
  // Same fallback, same restriction, and for the same reason: scanning the whole
  // file when front matter exists would turn a deliberate `reads-human: ""` into
  // the two-character string `""`, which passes the non-empty check this field
  // exists to fail.
  if (!readsHuman && !hasFrontMatter) {
    const m = /^\s*(?:\*\*)?reads[-_ ]human(?:\*\*)?\s*:\s*(.+)$/im.exec(fallbackText);
    if (m) readsHuman = m[1];
  }
  if (!Array.isArray(reasons)) reasons = String(reasons).split(/[,\n]/);
  if (reasons.length === 0) {
    const m = /^\s*(?:\*\*)?reasons?(?:\*\*)?\s*:\s*(.+)$/im.exec(fallbackText);
    if (m) reasons = m[1].split(',');
  }
  reasons = reasons.map((r) => String(r).trim().replace(/^[`'"]|[`'"]$/g, '')).filter(Boolean);

  return {
    verdict,
    reasons,
    wouldCite: String(wouldCite ?? '').trim(),
    readsHuman: String(readsHuman ?? '').trim(),
    notes: body.trim(),
    // The record's front matter as parsed, so a caller that needs a key this
    // parser does not interpret — `subject:`, `reviewed:`, `job:`, `date:` —
    // reads it from the one parse rather than opening the file again. A second
    // `matter()` call on the same bytes is a second parser by another name.
    data,
    raw: text,
  };
}

/**
 * Normalisation for the duplicate check: "exactly identical (after whitespace
 * trimming)". Used for BOTH forced-judgment fields — `would-cite` and, on post
 * verdicts, `reads-human` — because specs/review words the two rules
 * identically and one normaliser is the only way they stay identical.
 */
export function normalizeField(s) {
  return String(s ?? '').replace(/\r\n/g, '\n').trim();
}

/**
 * The name every existing caller imports (`scripts/verify-launch.mjs`,
 * `loop/lib/review.mjs`, their tests). Kept as an alias rather than a second
 * implementation: two normalisers that agree today are how the merge gate and
 * the launch check drift apart later.
 */
export const normalizeWouldCite = normalizeField;
