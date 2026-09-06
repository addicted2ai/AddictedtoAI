/**
 * change-kinds.mjs — the closed list of kinds a `data/changes.jsonl` line may
 * carry, declared once (specs/pulse, `separate-a-claim-from-a-fact`).
 *
 * ## Why this file exists
 *
 * `data/changes.jsonl` is the append-only history everything downstream reads:
 * the home changed feed, `/catalog/changed`, the RSS feed, the sitemap's
 * `lastModified` join, a blog note's `covers:` anchor, the scout's assembled
 * context, and the `interpret` job's work source. What a line *is* travels in
 * its `kind` — and until this file existed that field was unchecked in both
 * directions. The kinds were string literals at their emission sites in
 * `pulse/lib/diff.mjs`, and every consumer tested equality against a literal of
 * its own, so a misspelled kind would be written, committed, rendered through
 * the changed feed's catch-all, and caught by nothing.
 *
 * Measured on 2026-09-05: 182 committed lines in five kinds — `arrival` 77,
 * `release` 60, `field_change` 23, `retirement` 14, `annotation` 8. Those five
 * are the kinds the system means to have; `lead-change` is the sixth, added by
 * this change.
 *
 * ## The decoy this replaces
 *
 * `lib/changes.mjs` used to export `MATERIAL_KINDS`, commented "Material change
 * kinds, in the order specs/pulse names them", imported **nowhere** — and three
 * of its five values (`price`, `context`, `status`) were material FIELD names
 * carried on a line's `field`, appearing as a `kind` on zero of the 182 lines.
 * A list that reads as authoritative, is consulted by nobody, and disagrees with
 * the data is worse than no list, because the obvious way to add a new kind is
 * to add it there — which changes nothing anywhere. It was deleted rather than
 * updated, so there is one home and not two
 * (`data/carried/j-20260905-04-carry-1.md` records the grep independently).
 *
 * ## The order below is real
 *
 * It is the order `specs/pulse` names them, with `lead-change` last as the kind
 * this change adds. Nothing sorts or ranks by it — it is a reading order, and
 * `unrecognisedKinds` below is the only consumer that iterates the array at all.
 *
 * ## The two enforcement points are deliberately asymmetric
 *
 * `pulse/lib/diff.mjs`'s `appendChanges` REFUSES a candidate whose kind is not a
 * member: that is the point the mistake is made, and a refusal there costs a
 * failing test rather than a corrupt history. The BUILD only REPORTS committed
 * lines carrying an unrecognised kind (`changeKindsReportStep`, which lives in
 * `lib/changes.mjs` beside the reader it needs) and never fails on one: the file
 * is append-only history, a corrupt line already committed cannot be removed,
 * and `readChanges`'s existing stance is that "a malformed line is the Pulse's
 * problem to report, not a reason for the site to stop rendering the other 59".
 * A build that failed here would let one bad historical line take the whole site
 * down.
 *
 * This module declares and computes; it imports nothing, so every producer and
 * consumer — `pulse/lib/`, `lib/`, a page component — can read the list without
 * dragging a reader, a path or a corpus in behind it.
 */

/**
 * Every kind a change line may carry. Closed: the writer refuses anything else.
 *
 * `annotation` is a member because it is a *line* kind in this file — the
 * `interpret` job's commentary, keyed to a change by `annotates` — and the
 * refusal in `appendChanges` is asked of every line, not only of the diff's.
 */
export const CHANGE_KINDS = Object.freeze([
  'arrival',
  'release',
  'field_change',
  'retirement',
  'annotation',
  'lead-change',
]);

/**
 * The kinds by name, so a producer or a consumer reads the declaration instead
 * of restating a literal. Every `kind === '…'` test in this repository goes
 * through here; a typo is then a missing property rather than a live branch
 * that silently never matches.
 */
export const KIND = Object.freeze({
  ARRIVAL: 'arrival',
  RELEASE: 'release',
  FIELD_CHANGE: 'field_change',
  RETIREMENT: 'retirement',
  ANNOTATION: 'annotation',
  LEAD_CHANGE: 'lead-change',
});

const KIND_SET = new Set(CHANGE_KINDS);

/** Is this a declared change-line kind? */
export function isChangeKind(kind) {
  return KIND_SET.has(kind);
}

/**
 * `{ kind: count }` for every line whose kind the list does not contain, in the
 * order encountered. A line with no `kind` at all counts under `(missing)`,
 * because "nobody wrote a kind" and "somebody wrote the wrong kind" are both
 * things the report should say out loud rather than silently pass.
 */
export function unrecognisedKinds(lines) {
  const counts = new Map();
  for (const line of lines ?? []) {
    if (!line || typeof line !== 'object') continue;
    const kind = line.kind === undefined || line.kind === null ? '(missing)' : String(line.kind);
    if (kind !== '(missing)' && KIND_SET.has(kind)) continue;
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return counts;
}
