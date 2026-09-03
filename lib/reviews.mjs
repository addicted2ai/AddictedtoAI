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
 *
 * ---------------------------------------------------------------------------
 * THE THIRD MEMBER OF THAT FAMILY: REVIEWED, THEN CHANGED (beads
 * addictedtoai-zlq).
 *
 * Everything above is about WHICH record belongs to a piece. None of it says
 * anything about WHAT the record judged. The join matched by name, the merge
 * gate checked the verdict and the `would-cite`, and every one of those checks
 * passed unchanged after the reviewed text was edited — so an approval survived
 * the thing it approved. `org/moonshot-ai` surfaced it: edited under an
 * approval from a different round, inheriting a judgment it never earned.
 *
 * The merge step writes `reviewed:` — content path -> SHA-256 of that file's
 * reviewed surface (`lib/review-hash.mjs`) — beside the `subject:` it already
 * writes, from the same measurement. This join then recomputes the piece's
 * current hash and reports FOUR states where it reported one:
 *
 *   recorded    a record joins and its recorded hash equals the current one
 *   mismatched  a record joins, carries a hash for that path, and they differ
 *   unbound     a record joins and carries no hash for that path
 *   missing     no record joins
 *
 * `missing` and `mismatched` are opposite findings — unreviewed versus
 * reviewed-and-then-changed — and only the second names both a specific record
 * and the specific bytes that moved. Collapsing them is the defect.
 *
 * Two limits are deliberate and both follow the same argument as the absence
 * case above. A mismatch is reported by `verify-launch` and by the prebuild
 * line, and it NEVER changes a page's indexability: `entryReviewGate()` below
 * reads the verdict alone, because de-indexing approved work over a whitespace
 * edit or a mechanical write not yet on the excluded list would punish the
 * reader for a bookkeeping problem, with nobody watching. And `unbound` fails
 * nothing at all: every record written before this existed is unbound, and an
 * unbound record is exactly as informative as it was before — no worse. The
 * number to watch is that it only ever falls.
 * ---------------------------------------------------------------------------
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { REVIEWS_DIR } from './paths.mjs';
import { reviewedHashOfFile } from './review-hash.mjs';
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
 * The path -> reviewed-surface-hash mapping a record carries, or `{}`.
 *
 * `reviewed` is deliberately NOT in `SUBJECT_KEYS`: `subject:` keeps its shape
 * exactly (design D2), because it is read by nine accepted key names and by
 * hand-written records, and carrying the hash inside it would unbind every
 * record that already exists — the opposite of what this mechanism is for.
 */
export function reviewedOf(rec) {
  const v = rec?.data?.reviewed;
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out = {};
  for (const [k, hash] of Object.entries(v)) {
    if (typeof hash === 'string' && hash.trim()) out[String(k).replace(/\\/g, '/')] = hash.trim();
  }
  return out;
}

/**
 * Recency, read from INSIDE the record: its own `date`, else its `job` id.
 *
 * Never the filesystem's mtime. mtime is not committed, differs on every clone
 * and after every checkout, and a join that depends on it answers differently
 * on the maintainer's machine and in a job worktree (design D4) — the same
 * reasoning that makes lane pause state computed from the ledger rather than
 * stored.
 *
 * A job id has the form `j-<yyyymmdd>-<seq>`, so it carries a day and an
 * ordinal within that day. The day comes from `date` when the record has one
 * and from the job id otherwise; the ordinal only ever refines a tie on the
 * same day, so using it can never contradict "its own date, else its job id".
 *
 * @returns {{day: string, seq: number} | null} null when the record records
 *   nothing to order by — the case specs/review says to report rather than guess.
 */
export function recencyOf(rec) {
  const raw = rec?.data?.date;
  const dateStr =
    raw instanceof Date ? raw.toISOString().slice(0, 10) : typeof raw === 'string' ? raw.trim() : '';
  const jobId = typeof rec?.data?.job === 'string' ? rec.data.job.trim() : '';
  const jobM = /^j-(\d{8})-(\d+)/.exec(jobId);
  let day = '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) day = dateStr.replace(/-/g, '');
  else if (jobM) day = jobM[1];
  if (!day) return null;
  return { day, seq: jobM ? Number(jobM[2]) : -1 };
}

/** Most recent first. `null` when the set cannot be ordered — see `recencyOf`. */
function orderByRecency(found) {
  const keyed = found.map((f) => ({ ...f, key: recencyOf(f.rec) }));
  if (keyed.some((k) => k.key === null)) return null;
  const sorted = keyed.sort((a, b) =>
    a.key.day === b.key.day ? b.key.seq - a.key.seq : (a.key.day < b.key.day ? 1 : -1),
  );
  const [first, second] = sorted;
  if (second && first.key.day === second.key.day && first.key.seq === second.key.seq) return null;
  return sorted;
}

/** The four states a reviewable piece can be in. Exactly one applies to each. */
export const REVIEW_STATES = Object.freeze(['recorded', 'mismatched', 'unbound', 'missing']);

/**
 * Classify one piece against the record that bound to it.
 *
 * `hashOf` is an injection point rather than an assumption (the same shape as
 * `entryReviewGate`'s predicate): the default reads the piece's own file, which
 * is the only input that can agree byte-for-byte with what the merge step
 * hashed on the merged tree — see `lib/review-hash.mjs` on why a loaded corpus
 * doc's zod-defaulted `data` is not that input.
 *
 * A piece whose file cannot be read reports `unbound`, not `mismatched`. An
 * unreadable file is not evidence that the text moved, and a guardrail that
 * invented a mismatch out of an I/O failure is the noise this design refuses.
 */
function classifyPiece(doc, rec, hashOf) {
  const recorded = reviewedOf(rec)[String(doc.file).replace(/\\/g, '/')];
  if (!recorded) return { state: 'unbound', recordedHash: null, currentHash: null };
  const current = hashOf(doc);
  if (!current) return { state: 'unbound', recordedHash: recorded, currentHash: null };
  return {
    state: current === recorded ? 'recorded' : 'mismatched',
    recordedHash: recorded,
    currentHash: current,
  };
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
 * WHERE SEVERAL RECORDS NAME ONE PIECE, the most recent binds and the rest are
 * SUPERSEDED. That is not a nicety — without it a mismatch has no way to clear,
 * and a gate with no clearing path is a wall. Measured from the code this
 * replaces: `reviewCandidates()` was tried before front-matter subjects, so a
 * seed record claimed its piece before any loop-written record was consulted,
 * and among front-matter subjects `bySubject` kept the first record in
 * `readdirSync` order. A genuinely re-reviewed piece would have stayed
 * mismatched forever.
 *
 * A superseded record is reported as neither an orphan nor a contention: it is
 * the expected residue of a re-review, and reporting it as a defect would train
 * the reader to ignore the report. An UNORDERABLE set is different — it keeps
 * the old behaviour of reporting the contention and binding nothing, because a
 * tie-break invented at that point is a guess about which review is current.
 *
 * @returns {{byFile: Map<string, object>, claimed: Map<string, string>,
 *            superseded: Map<string, string>, orphans: string[],
 *            contended: string[], states: Map<string, string>}}
 */
export function resolveReviews(pieces, records, { hashOf } = {}) {
  const hash = hashOf ?? ((doc) => (doc.abs ? reviewedHashOfFile(doc.abs) : null));
  const byFile = new Map();
  const claimed = new Map();
  const superseded = new Map();
  /** Records in an unorderable set: bound to nothing, already reported once. */
  const unorderable = new Set();
  const contended = [];
  const states = new Map();
  const bySubject = new Map();
  for (const rec of records.values()) {
    for (const s of subjectsOf(rec)) {
      if (!bySubject.has(s)) bySubject.set(s, []);
      if (!bySubject.get(s).includes(rec)) bySubject.get(s).push(rec);
    }
  }
  const taken = (name) => claimed.has(name) || superseded.has(name) || unorderable.has(name);

  for (const doc of pieces) {
    const candidates = reviewCandidates(doc);
    /** @type {{rec: object, matchedBy: string}[]} */
    const found = [];
    const add = (rec, matchedBy) => {
      if (taken(rec.name) || found.some((f) => f.rec.name === rec.name)) return;
      found.push({ rec, matchedBy });
    };
    /**
     * A record that DECLARES this piece in its own `subject:` may bind it even
     * if it has already bound a different piece. One job merges several files
     * and writes ONE record naming all of them — `subject:` is a list for
     * exactly that reason (beads addictedtoai-sge) — so the one-record-one-piece
     * rule that `add` enforces is right for filename-derived candidates and
     * wrong here.
     *
     * MEASURED 2026-09-02, which is how this was found: job j-20260902-01
     * repaired three Anthropic "(Fast)" pages in one batch. Its record named
     * all three in `subject:`, bound the first, and was `taken` for the other
     * two; a later record covering two of them bound one more. The third page
     * reported `missing` — unreviewed — and `verify-launch` failed, though
     * every page had in fact been reviewed and approved. The more work a job
     * batches, the more of its own output the join reports as unreviewed.
     *
     * `superseded` and `unorderable` are still respected: those mean a
     * different record won this piece, or that no record could be ordered for
     * it, and neither is affected by how many pieces a record names.
     */
    const addDeclared = (rec, matchedBy) => {
      if (superseded.has(rec.name) || unorderable.has(rec.name)) return;
      if (found.some((f) => f.rec.name === rec.name)) return;
      found.push({ rec, matchedBy });
    };
    for (const name of candidates) {
      if (!records.has(name)) continue;
      if (claimed.has(name)) {
        // Two pieces naming one record. It cannot be both of theirs, and
        // silently giving it to whichever came first is the drift this module
        // exists to prevent — so it is carried out as a finding.
        contended.push(`${name}: claimed by ${claimed.get(name)}, also named by ${doc.file}`);
        continue;
      }
      add(records.get(name), name === candidates[0] ? '' : name);
    }
    for (const key of [doc.file, doc.url, doc.data?.id, doc.slug, doc.rel].filter(Boolean)) {
      for (const hit of bySubject.get(String(key).replace(/\\/g, '/')) ?? []) {
        addDeclared(hit, `${hit.name} (matched by front matter, not by name)`);
      }
    }

    let chosen = null;
    if (found.length === 1) {
      chosen = found[0];
    } else if (found.length > 1) {
      const ordered = orderByRecency(found);
      if (ordered) {
        chosen = ordered[0];
        for (const f of ordered.slice(1)) superseded.set(f.rec.name, doc.file);
      } else {
        const names = found.map((f) => f.rec.name).sort();
        for (const n of names) unorderable.add(n);
        contended.push(
          `${names.join(' / ')}: ${names.length} records name ${doc.file} and none can be ` +
            'ordered by a date or a job id recorded inside it — the join binds neither rather ' +
            'than guessing which review is current',
        );
      }
    }
    if (!chosen) {
      states.set(doc.file, 'missing');
      continue;
    }
    claimed.set(chosen.rec.name, doc.file);
    const cls = classifyPiece(doc, chosen.rec, hash);
    // `declaredBy` is EVERY record that named this piece, newest-first, not
    // only the one that won. The winner is the right authority for the bytes —
    // it is the most recent — but not for every question asked of a piece.
    //
    // Measured 2026-09-02: a `repair` job edited a published post, and its
    // record (correctly carrying no `reads-human`, because the merge gate asks
    // the voice question of post JOBS and a repair reviewer sees a diff, not a
    // post) superseded the post review that did carry one. The piece then read
    // as a post with no voice verdict, though a complete one sat one record
    // away in `j-20260902-20.pass2.md`. A reader that needs "did ANY reviewer
    // ever answer this for this piece" has to be able to see past the winner.
    byFile.set(doc.file, {
      doc,
      record: chosen.rec,
      matchedBy: chosen.matchedBy,
      declaredBy: (orderByRecency(found) ?? found).map((f) => f.rec),
      ...cls,
    });
    states.set(doc.file, cls.state);
  }

  const orphans = [...records.keys()].filter((n) => !taken(n));
  return { byFile, claimed, superseded, orphans, contended, states };
}

/** The join, from a loaded corpus. */
export function reviewJoin(corpus, { reviewsDir = REVIEWS_DIR, records, hashOf } = {}) {
  const recs = records ?? readReviewRecords(reviewsDir);
  const pieces = reviewablePieces(corpus);
  return { records: recs, pieces, reviewsDir, ...resolveReviews(pieces, recs, { hashOf }) };
}

/**
 * The four-state report, as a PURE function of a resolved join.
 *
 * Pure and separate so both readers — `scripts/verify-launch.mjs` and the
 * prebuild's summary line — print the same four numbers from the same
 * computation, and so the numbers are testable without running a build. A
 * report assembled twice is how the launch check and the build drift apart,
 * which is the defect this whole module exists to prevent.
 */
export function reviewStateReport(join) {
  const out = { recorded: [], mismatched: [], unbound: [], missing: [] };
  for (const doc of join.pieces) {
    const state = join.states.get(doc.file) ?? 'missing';
    const hit = join.byFile.get(doc.file);
    out[state].push({ file: doc.file, record: hit?.record?.name ?? null });
  }
  return {
    ...out,
    counts: Object.fromEntries(REVIEW_STATES.map((s) => [s, out[s].length])),
    total: join.pieces.length,
  };
}

/** One line per state, in a fixed order — the form both readers print. */
export function reviewStateLine(report) {
  return REVIEW_STATES.map((s) => `${s} ${report.counts[s]}`).join(', ');
}

/**
 * The launch-blocking half of the report, as strings.
 *
 * MISMATCHED ONLY. `unbound` is counted and never fails: every record from the
 * seed wave is unbound, and a mechanism that failed on every pre-existing
 * record could not land at all. `missing` has its own existing report, which
 * this must not absorb — missing means unreviewed and mismatched means reviewed
 * and then changed, and a check that printed one number for both would be the
 * check this replaces.
 */
export function mismatchProblems(report) {
  return report.mismatched.map(
    (m) =>
      `${m.file}: REVIEWED THEN CHANGED — ${m.record} records a verdict on a different ` +
      'reviewed surface than this file now has. The approval describes text that no longer ' +
      'exists; re-review the piece so a record binds to what it says.',
  );
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
