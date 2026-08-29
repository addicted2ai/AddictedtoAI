/**
 * reviews.mjs — the ONE join from a piece of content to its review record.
 *
 * Two things ask the same question about a piece of content: `scripts/
 * verify-launch.mjs` ("does every seed prose piece carry an approved record?")
 * and the build's indexability rule ("does this entry's prose body have a
 * record, and does it say approve?"). Before this module they could only have
 * asked it twice, and `lib/indexability.mjs`'s header recorded the consequence:
 * with no declared entry-id → verdict-file mapping, the build could not join
 * them at all and specs/wiki's "a prose body that passed review" went
 * unenforced.
 *
 * Task 6.6 settled the naming de facto, inside verify-launch. This module is
 * that resolution moved out where both callers reach it, not a second one
 * written to match — two mappings for one question is how this defect class
 * recurs, and the first sign of the drift would be a page whose robots tag and
 * whose launch verdict disagree.
 *
 * ---------------------------------------------------------------------------
 * WHAT THE JOIN CAN AND CANNOT DECIDE, stated rather than assumed.
 *
 * A record is found for a piece by, in order: the canonical URL-derived name,
 * three accepted alternates, then a front-matter field naming the file. When
 * one is found, the verdict it carries is a measurement and the build acts on
 * it — `approve` indexes, anything else does not.
 *
 * When NO record is found, the build learns nothing. "Unreviewed" and "the
 * record is named something this join does not recognise" are the same
 * observation from here, and they call for opposite responses: the first
 * should suppress the page, the second must not, because suppressing it would
 * silently de-index approved work over a naming mismatch. So absence leaves
 * the pre-existing body-presence behaviour standing and is *reported* instead
 * — by `verify-launch`, which fails the launch and names every piece with no
 * record, and by the prebuild's own summary line, which counts them every
 * build.
 *
 * That is not the whole SHALL, and the residual gap USED to be specific: a
 * record written by the loop is named `<job-id>.md` and carries
 * `job: j-2026...`, which names the JOB and not the files it changed, so
 * nothing could join it and every loop-written record was an orphan (beads
 * addictedtoai-15c, addictedtoai-sge). The loop's merge step now writes
 * `subject:` into the record it merged on, listing the content files that
 * actually landed — the declaration that was missing, made by the only step
 * that knows it. `subject` was already in SUBJECT_KEYS, so the join itself did
 * not have to change.
 *
 * Absence is STILL not enforced, for the records that pre-date that and for
 * jobs whose reviewed files are not content at all (a machinery job's record
 * names no piece, and correctly joins to none). The two reporting paths above
 * remain the enforcement, and the prebuild's count is the thing to watch: it
 * should now stop growing with every loop-written entry.
 * ---------------------------------------------------------------------------
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { REVIEWS_DIR } from './paths.mjs';
import { parseVerdict } from '../loop/lib/verdict.mjs';

/** Front-matter keys a review record may use to name the piece it reviewed. */
export const SUBJECT_KEYS = Object.freeze([
  'subject',
  'piece',
  'file',
  'path',
  'target',
  'slug',
  'entry',
  'id',
  'job',
]);

/**
 * Filenames that may hold the verdict for a piece, most-canonical first.
 *
 * `data/reviews/README.md` fixes the convention as `seed-<slug>.md` without
 * saying what `<slug>` is for a piece whose slug is not unique across
 * surfaces, so the canonical form here is derived from the piece's URL — the
 * one identifier that is unique by construction. The alternates are accepted
 * and reported, so a record written under a reasonable other name is matched
 * rather than reported missing.
 */
export function reviewCandidates(doc) {
  const names = [];
  const push = (s) => {
    const n = `seed-${s}.md`;
    if (!names.includes(n)) names.push(n);
  };
  push(doc.url.replace(/^\//, '').replace(/\//g, '-'));
  if (doc.type === 'entry') push(doc.data.id.replace(/\//g, '-'));
  push(`${doc.type}-${doc.slug}`);
  push(doc.slug);
  return names;
}

/** Every verdict record on disk, keyed by filename. */
export function readReviewRecords(reviewsDir = REVIEWS_DIR) {
  const records = new Map();
  if (!reviewsDir || !existsSync(reviewsDir)) return records;
  for (const name of readdirSync(reviewsDir)) {
    if (!name.endsWith('.md') || name === 'README.md') continue;
    let text;
    try {
      text = readFileSync(join(reviewsDir, name), 'utf8');
    } catch {
      continue;
    }
    let data = {};
    try {
      data = matter(text).data ?? {};
    } catch {
      data = {};
    }
    records.set(name, { name, path: join(reviewsDir, name), verdict: parseVerdict(text), data });
  }
  return records;
}

/**
 * Values a record's front matter offers as "the piece I reviewed".
 *
 * A list is read as well as a string. One review covers one job, and a job may
 * merge several prose files; writing them as separate keys would mean inventing
 * `subject2:`, and YAML cannot repeat a key. The loop's merge step writes
 * `subject:` as a list for exactly this reason (beads addictedtoai-sge).
 */
export function subjectsOf(rec) {
  const out = [];
  const push = (v) => {
    if (typeof v === 'string' && v.trim()) out.push(v.trim().replace(/\\/g, '/'));
  };
  for (const k of SUBJECT_KEYS) {
    const v = rec.data?.[k];
    if (Array.isArray(v)) v.forEach(push);
    else push(v);
  }
  return out;
}

/**
 * Every piece of content a review record can belong to, in a FIXED order.
 *
 * The order is part of the join, not a detail of it: a record is claimed by
 * the first piece that names it, so two callers walking different orders could
 * hand the same record to different pieces. One list, defined here, means the
 * build and the launch check cannot disagree about who owns what.
 *
 * Tool listings are data rows, not prose, and are not in the set (specs/
 * editorial, task 6.5). Entries qualify on `hasBody` — the build's own test —
 * so the map covers exactly the entries whose indexability the review clause
 * can touch; verify-launch then applies its stricter prose bar when deciding
 * which of them it *requires* a record for.
 */
export function reviewablePieces(corpus) {
  return [
    ...corpus.entry.filter((d) => d.hasBody),
    ...corpus.learn,
    ...corpus.tutorial,
    ...corpus.post,
    ...corpus.delta,
  ];
}

/**
 * Resolve pieces to records. Greedy in the fixed order above: a record is
 * claimed once, so an orphan beside a piece with no record is a naming
 * mismatch rather than a missing review.
 *
 * @returns {{byFile: Map<string, {doc: object, record: object, matchedBy: string}>,
 *            claimed: Map<string, string>, orphans: string[], contended: string[]}}
 */
export function resolveReviews(pieces, records) {
  const byFile = new Map();
  const claimed = new Map();
  const contended = [];
  const bySubject = new Map();
  for (const rec of records.values()) {
    for (const s of subjectsOf(rec)) if (!bySubject.has(s)) bySubject.set(s, rec);
  }

  for (const doc of pieces) {
    const candidates = reviewCandidates(doc);
    let rec = null;
    let matchedBy = '';
    for (const name of candidates) {
      if (!records.has(name)) continue;
      if (claimed.has(name)) {
        // Two pieces naming one record. It cannot be both of theirs, and
        // silently giving it to whichever came first is the drift this module
        // exists to prevent — so it is carried out as a finding.
        contended.push(`${name}: claimed by ${claimed.get(name)}, also named by ${doc.file}`);
        continue;
      }
      rec = records.get(name);
      matchedBy = name === candidates[0] ? '' : name;
      break;
    }
    if (!rec) {
      for (const key of [doc.file, doc.url, doc.data?.id, doc.slug, doc.rel].filter(Boolean)) {
        const hit = bySubject.get(String(key).replace(/\\/g, '/'));
        if (hit && !claimed.has(hit.name)) {
          rec = hit;
          matchedBy = `${hit.name} (matched by front matter, not by name)`;
          break;
        }
      }
    }
    if (!rec) continue;
    claimed.set(rec.name, doc.file);
    byFile.set(doc.file, { doc, record: rec, matchedBy });
  }

  const orphans = [...records.keys()].filter((n) => !claimed.has(n));
  return { byFile, claimed, orphans, contended };
}

/** The join, from a loaded corpus. */
export function reviewJoin(corpus, { reviewsDir = REVIEWS_DIR, records } = {}) {
  const recs = records ?? readReviewRecords(reviewsDir);
  const pieces = reviewablePieces(corpus);
  return { records: recs, pieces, reviewsDir, ...resolveReviews(pieces, recs) };
}

/**
 * The predicate `lib/indexability.mjs` takes, plus the counts a build wants to
 * print. See the header: a record that exists must say `approve`; a record
 * that does not exist is not evidence either way and is counted, not acted on.
 *
 * `unapproved` entries are OBJECTS, and the reason is a defect avoided rather
 * than one found: the blocked set used to be built by splitting each entry's
 * display string on its first space. That works for every id shape in use
 * today — `concept/reviewed-body` has no space in it — and would fail silently,
 * de-indexing nothing, the first time an id ever contained one. An identifier
 * a machine acts on is carried as data; the sentence a human reads is derived
 * from it, never parsed back out of it.
 */
export function entryReviewGate(corpus, join) {
  const approved = new Set();
  const unapproved = [];
  const unrecorded = [];
  const blocked = new Set();

  for (const doc of corpus.entry) {
    if (!doc.hasBody) continue;
    const hit = join.byFile.get(doc.file);
    if (!hit) {
      unrecorded.push(doc.data.id);
      continue;
    }
    const verdict = hit.record.verdict.verdict;
    if (verdict === 'approve') {
      approved.add(doc.data.id);
      continue;
    }
    blocked.add(doc.data.id);
    unapproved.push({
      id: doc.data.id,
      file: doc.file,
      record: hit.record.name,
      verdict: verdict || '',
      /** What the build prints. Derived from the fields above, never reparsed. */
      message: `${doc.data.id} (${hit.record.name}: ${verdict || 'no parseable verdict'})`,
    });
  }

  return {
    approved,
    unapproved,
    unrecorded,
    hasApprovedReview: (id) => !blocked.has(id),
  };
}
