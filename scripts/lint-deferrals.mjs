#!/usr/bin/env node
/**
 * lint-deferrals.mjs — report open tracker issues that name no routable subject.
 *
 * Usage:
 *   node scripts/lint-deferrals.mjs <beads-export.json> [--strict]
 *
 * The operator produces the input with `bd list --json > <file>` and passes the
 * file. The input shape is the one `evidence/scripts/machinery-share.mjs` and
 * `open-by-day.mjs` already read: a top-level ARRAY of issues, optionally
 * carrying a byte-order mark (stripped before parsing), with `status` compared
 * lower-cased against `closed` and the report naming each issue by `id`.
 *
 * THE EXPORT MUST BE FRESH, TAKEN FOR THIS RUN. An absence verdict ("no
 * unroutable issues") is only as live as its input: a checked-in or cached
 * export is a claim with an expiry date, and the checked-in
 * `.beads/issues.jsonl` is a one-record legacy export that can prove
 * nothing about the current tracker — an absence search against it measured
 * against nothing (audit finding, 2026-09-10). Produce the export in the
 * same session as the run; never cite a stored file as current.
 *
 * Exit code: 0 when there is nothing to report, 0 with rows printed when rows
 * are reported, and 1 with the SAME rows printed under `--strict`. The flag
 * changes the exit code and nothing else. Any refusal (missing/unreadable
 * file, unparseable JSON, top-level not an array) exits 1 with one line on
 * stderr naming the path — an unparseable export is never reported as "no
 * issues", which would be a silent green over a broken instrument.
 *
 * It SHALL NOT spawn the tracker: no subprocess import of any kind, no
 * invocation of the tracker binary by name, no tracker-package entrypoint.
 * The delta reserves tracker invocation to exactly one module, and that
 * module does not exist yet — so this script reads the file it is given and
 * nothing else. The tests SHALL NOT spawn it either; a fixture export is a
 * file the test writes.
 *
 * WHAT COUNTS AS "NAMES A SUBJECT PATH OR A SPECIFICATION REQUIREMENT".
 * A regular expression over prose is a classifier, and this comment is where
 * the classifier says what it is, following the convention `brief-lint.mjs`
 * sets in its own header (including the limit it cannot catch).
 *
 * A SUBJECT PATH is a slash-bearing path under one of these roots:
 *   loop/ pulse/ scripts/ lib/ app/ tools/ content/ data/ openspec/
 *   public/ wisdom/ loops/
 * followed by at least one name character. Exclusions, each with its reason:
 * - A BARE FILE NAME with no slash does NOT count. Prose is full of bare
 *   words that collide with file names ("status", "report", "index"), and a
 *   match on one would route a vague deferral as named. A subject must locate
 *   the repair target; a bare word locates nothing.
 * - A path inside a FENCED BLOCK or a QUOTED (`>`) line COUNTS. Subject-hood
 *   is about naming a repair target, not about prose style: a path in an
 *   example or a quotation still names a location, and asking a reporter to
 *   tell "mentioned as an example" from "mentioned as the subject" is asking
 *   it to read intent, which it cannot do. Excluding quoted text would let a
 *   real subject hide behind one `>` character.
 * - A path naming a DIRECTORY rather than a file COUNTS (trailing slash or
 *   not, e.g. `content/wiki/` or `content/wiki`). Repair work is routinely
 *   scoped to a directory, and demanding a file extension would refuse
 *   legitimate directory-scoped subjects while catching nothing vague.
 * - The roots are NOT an allow-list of exact directories: any
 *   `<root>/<something>` counts rather than only paths that exist in the
 *   tree. An issue may name a path that does not exist yet (that can be the
 *   defect), and refusing it here would report a well-specified deferral as
 *   vague. Existence is intake's question, not this reporter's.
 *
 * A SPECIFICATION REQUIREMENT reference is a `specs/<capability>` path, in
 * either the `specs/<capability>` or the `openspec/specs/<capability>` form,
 * with an optional `/spec.md` tail and an optional `:line` pin
 * (e.g. `specs/loop`, `specs/loop/spec.md`, `specs/loop/spec.md:1688`,
 * `openspec/specs/review/spec.md`). Exclusions, each with its reason:
 * - A CAPABILITY NAME ALONE (e.g. the bare word "loop" or "pulse") does NOT
 *   count. Bare capability words are topic language — nearly every machinery
 *   deferral says "loop" somewhere — and accepting one as a requirement
 *   pointer would route vague deferrals as named. A requirement reference
 *   must point at the constitution, not at a topic.
 * - The capability slot is NOT validated against the eleven known names, on
 *   purpose: an allow-list goes stale the day a capability is added and then
 *   silently reports routable issues as unroutable. A `specs/<name>` shape is
 *   a deliberate pointer no matter which capability it names.
 *
 * FIELDS SEARCHED: the six text fields `machinery-share.mjs` reads — `title`,
 * `description`, `notes`, `design`, `acceptance`, `context` — joined as text,
 * PLUS a declared `metadata.subject`. None of the six is dropped: each has
 * been observed carrying a subject in real issues (design and acceptance
 * especially on carried findings), and searching fewer would miss subjects
 * the author stated plainly. `open-by-day.mjs` reads no text field at all, so
 * there is no narrower convention to inherit — only the six-field precedent.
 * An ABSENT `metadata` object means NO DECLARED SUBJECT, not an error: the
 * subject convention is not a guarantee, and erroring on its absence would
 * refuse well-formed exports. A `metadata.subject` that is present and a
 * non-empty string counts as naming a subject path without further shape
 * checks, because it is a declared routing field rather than prose.
 *
 * OPEN means `String(status ?? '').toLowerCase() !== 'closed'`, matching both
 * existing consumers. A MISSING status counts as open: only an explicit
 * `closed` is finished work, and treating an unmarked issue as finished would
 * hide it from the report. Entries with no string `id` cannot be reported by
 * id and are skipped on stdout, but they still count toward `--strict` and
 * are announced on stderr — otherwise an export whose only unroutable issue
 * lacks an id would fail with zero rows printed, a count and a printed list
 * disagreeing silently.
 *
 * LIMIT, stated so nobody trusts this for more than it does: the check cannot
 * tell a subject NAMED as the repair target from a path mentioned in passing
 * ("see also `lib/stamp.mjs` for the pattern"), so a vague deferral that
 * drops a passing path reference reads as routable. That over-counts
 * routable, never under-counts vague — the safe direction for a report whose
 * job is to surface the vague ones.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Directory roots whose `<root>/<name>` paths count as subject paths. */
export const SUBJECT_ROOTS = [
  'loop',
  'pulse',
  'scripts',
  'lib',
  'app',
  'tools',
  'content',
  'data',
  'openspec',
  'public',
  'wisdom',
  'loops',
];

/** A slash-bearing path under a known root. Bare file names never match. */
export const SUBJECT_RE = new RegExp(
  `\\b(?:${SUBJECT_ROOTS.join('|')})/[A-Za-z0-9_.\\-][A-Za-z0-9_.\\-/]*`,
  'i',
);

/**
 * A pointer at the constitution: `specs/<cap>` or `openspec/specs/<cap>`,
 * optional `/spec.md`, optional `:line`. A bare capability word never matches.
 */
export const REQUIREMENT_RE =
  /\b(?:openspec\/specs\/[a-z][a-z0-9-]*(?:\/spec\.md)?(?::\d+)?|specs\/[a-z][a-z0-9-]*(?:\/spec\.md)?(?::\d+)?)\b/i;

/** The six text fields searched, the `machinery-share.mjs` precedent. */
export const TEXT_FIELDS = [
  'title',
  'description',
  'notes',
  'design',
  'acceptance',
  'context',
];

/** Open means anything but an explicit `closed`; a missing status is open. */
export function isOpen(issue) {
  return String(issue?.status ?? '').toLowerCase() !== 'closed';
}

/** Declared routing field: a non-empty `metadata.subject` names a subject. */
export function hasDeclaredSubject(issue) {
  let metadata = issue?.metadata;
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata);
    } catch {
      return false;
    }
  }
  return (
    !!metadata &&
    typeof metadata === 'object' &&
    typeof metadata.subject === 'string' &&
    metadata.subject.trim().length > 0
  );
}

/** Prose text searched for path and requirement pointers. */
export function searchText(issue) {
  return TEXT_FIELDS.map((f) =>
    typeof issue?.[f] === 'string' ? issue[f] : '',
  ).join('\n');
}

/** True when the issue names a subject path by pointer or by declaration. */
export function namesSubject(issue) {
  return hasDeclaredSubject(issue) || SUBJECT_RE.test(searchText(issue));
}

/** True when the issue points at a specification requirement. */
export function namesRequirement(issue) {
  return REQUIREMENT_RE.test(searchText(issue));
}

/** True when an open issue names neither and must therefore be reported. */
export function isUnroutable(issue) {
  return isOpen(issue) && !namesSubject(issue) && !namesRequirement(issue);
}

/** The reported rows for a parsed export: open, unroutable issues, by id. */
export function findUnroutable(issues) {
  return issues.filter((issue) => isUnroutable(issue));
}

function refuse(path, why) {
  process.stderr.write(`lint-deferrals: ${why}: ${path}\n`);
  process.exitCode = 1;
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const input = args.find((a) => !a.startsWith('--'));
  if (!input) {
    process.stderr.write(
      'lint-deferrals: missing input file path (usage: node scripts/lint-deferrals.mjs <beads-export.json> [--strict])\n',
    );
    process.exitCode = 2;
    return;
  }
  let raw;
  try {
    raw = readFileSync(input, 'utf8');
  } catch (err) {
    refuse(input, `cannot read file (${(err?.message ?? String(err)).split('\n')[0]})`);
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw.replace(/^﻿/, ''));
  } catch (err) {
    refuse(input, `cannot parse file as JSON (${(err?.message ?? String(err)).split('\n')[0]})`);
    return;
  }
  if (!Array.isArray(parsed)) {
    refuse(input, 'expected a top-level JSON array of issues');
    return;
  }
  const unroutable = findUnroutable(parsed);
  let skippedNoId = 0;
  for (const issue of unroutable) {
    if (typeof issue?.id === 'string' && issue.id.length > 0) {
      process.stdout.write(`${issue.id}\n`);
    } else {
      skippedNoId += 1;
    }
  }
  if (skippedNoId > 0) {
    process.stderr.write(`lint-deferrals: ${skippedNoId} unroutable issue(s) with missing id skipped: ${input}\n`);
  }
  if (strict && unroutable.length > 0) process.exitCode = 1;
}

const invokedAsScript =
  !!process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) main();
