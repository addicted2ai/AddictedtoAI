/**
 * review-hash.mjs — the REVIEWED SURFACE of a piece of content, and its hash.
 *
 * `lib/reviews.mjs` joins a piece to a record by NAME. That answers "which
 * record is this piece's?" and says nothing about "did this record judge this
 * text?" — so an approved page could be edited afterwards and the approval
 * stood, unchanged, describing bytes that no longer existed (beads
 * addictedtoai-zlq). This module is the missing half: a value the merge step
 * can write into the record and the join can recompute, so the two can be
 * compared.
 *
 * ---------------------------------------------------------------------------
 * WHAT THE SURFACE IS, AND WHY IT IS NOT THE FILE.
 *
 * specs/review (harden-seed-wave-guardrails): *"A piece's reviewed surface
 * SHALL be its prose body together with its front matter with every
 * mechanically-maintained key removed, and the list of mechanically-maintained
 * keys SHALL live in exactly one declared place in `lib/`."* That list is
 * `MECHANICAL_FRONT_MATTER_KEYS` below, and this is the one declared place.
 *
 * Hashing whole file bytes was considered and rejected in design D1: `pulse`
 * appends dated lifecycle events to an entry's `timeline` mechanically, under
 * the review exemption, so the first status change in the world would mark
 * every affected approved entry mismatched. A guardrail that fires on its own
 * machinery is noise, and noise is how a guardrail gets switched off. Hashing
 * the body alone was rejected for the opposite reason: a reviewer of a wiki
 * entry checks facts, aliases and sources, all of which live in front matter,
 * and a swapped `source_url` would read as unchanged.
 *
 * ---------------------------------------------------------------------------
 * WHY THE INPUT IS RAW FILE TEXT AND NEVER A LOADED CORPUS DOC.
 *
 * There are two callers and they must agree byte for byte, or every record the
 * loop writes reads as mismatched the moment the build looks at it. The loop's
 * merge step has no corpus — it has a path on the merged tree. The build has a
 * corpus, whose `doc.data` is the **zod-validated** front matter, not the
 * parsed one: `mentions: []`, `facts: []`, `timeline: []` and
 * `reverify_days: 60` are all defaults zod supplies for keys the file never
 * wrote. Hashing `doc.data` on one side and the file's own YAML on the other
 * would produce two different answers for one unchanged file.
 *
 * So the one input is the file's text, on both sides, and there is deliberately
 * no `reviewedHash(doc)` overload to reach for by mistake. The join reads
 * `doc.abs`; the merge reads the merged tree.
 *
 * Line endings are normalised to LF before anything else. `.gitattributes`
 * declares `* text=auto eol=lf`, so LF is the committed form — but a working
 * tree that ever came back CRLF would otherwise hash differently on one clone
 * than another, which is exactly the per-clone instability design D4 refuses
 * when it forbids reading the filesystem's mtime. Nothing else is normalised:
 * a whitespace edit IS an edit to the reviewed text, and the mechanism's job is
 * to say so (it reports; specs/review forbids it changing indexability).
 * ---------------------------------------------------------------------------
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { parseContentFile } from './frontmatter.mjs';

/**
 * Front-matter keys the machinery is licensed to write into an approved file
 * without that being an edit to what was reviewed.
 *
 * TWO keys. `pulse/lib/mint.mjs` appends dated events to an entry's `timeline`,
 * and `pulse/lib/domain-seeds.mjs` appends domain ids to an entry's
 * `domains_seeded`, both under specs/review's exemption for deterministic
 * machinery output. If a future Pulse behaviour writes another key and this
 * list is not updated, mismatches appear on pieces nobody touched — a loud
 * failure traceable to this line, which is the trade this project takes over a
 * silent gap.
 *
 * WHY `domains_seeded` IS LICENSED, since a new entrant has to say (change
 * `tag-the-corpus-by-domain`, specs/wiki "A seeded domain and an editorial
 * domain are separate fields"). It is written by the Pulse and only by the
 * Pulse, from named feed fields, with no model invocation and no judgment in
 * it: it is a deterministic output of already-reviewed machinery, exactly as a
 * mechanical timeline append is. Off this list, every re-seed would mark the
 * entry's review record `mismatched` and demand a fresh verdict on prose nobody
 * touched — 544 wiki entries on 2026-09-05, so not a corner case.
 *
 * WHY THE KEY IS `domains_seeded` AND NOT `domains`, which is the whole reason
 * the facet is carried in three fields instead of one. THIS LIST IS MATCHED BY
 * KEY **NAME**, ACROSS EVERY CONTENT KIND, WITH NO PER-KIND SCOPING — see
 * `reviewedSurface` below. Adding the bare key `domains` here would therefore
 * also exempt a **post's** editorially-assigned `domains` from review, deleting
 * the review requirement the change `flag-what-moved-the-frontier` writes into
 * specs/blog, with no change to that spec and no error anywhere. A key-name
 * filter is not a per-kind rule. The editorial keys `domains` and
 * `domains_excluded` stay OFF this list on purpose: tagging an entry with what
 * it is for is a judgment, and a judgment that publishes unreviewed is what
 * specs/review exists to stop.
 */
export const MECHANICAL_FRONT_MATTER_KEYS = Object.freeze(['timeline', 'domains_seeded']);

/**
 * Deterministic serialisation: object keys sorted, array order preserved.
 *
 * Sorting keys is what makes reordering front matter a non-edit — a reviewer
 * judged the values, not the order YAML happened to write them in. Array order
 * is NOT sorted, because it is meaningful everywhere it appears (`aliases`,
 * `facts`, `mentions`, `corrections`) and reordering it changes what renders.
 */
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

/**
 * The canonical bytes a reviewed-surface hash is taken over.
 *
 * @param {string} raw the content file's text, exactly as it is on disk
 * @returns {string}
 */
export function reviewedSurface(raw) {
  const text = String(raw ?? '').replace(/\r\n/g, '\n');
  const { data, body } = parseContentFile(text);
  const kept = {};
  for (const [k, v] of Object.entries(data ?? {})) {
    if (MECHANICAL_FRONT_MATTER_KEYS.includes(k)) continue;
    kept[k] = v;
  }
  return `${canonical(kept)}\n${body}`;
}

/** SHA-256, hex, of the reviewed surface of one content file's text. */
export function reviewedHash(raw) {
  return createHash('sha256').update(reviewedSurface(raw), 'utf8').digest('hex');
}

/**
 * The same hash, read from a path. `null` when the file cannot be read — the
 * caller decides what an unreadable file means, because the two callers mean
 * different things by it (the merge writes no binding at all; the join reports
 * the piece unbound rather than inventing a mismatch).
 */
export function reviewedHashOfFile(path) {
  try {
    return reviewedHash(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}
