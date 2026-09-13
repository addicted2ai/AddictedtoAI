/**
 * result.mjs — the executor result protocol (specs/loop).
 *
 * "Leaves its output as files" needs a signal channel, or the loop cannot
 * distinguish blocked from guessing from interrupted. The channel is one
 * file, `RESULT.md`, at the worktree root, whose FIRST LINE is exactly one of:
 *
 *     done
 *     blocked: <one-line reason>
 *     capacity
 *     reviewed: <path>[, <path>…]
 *
 * Everything else in the file is free-form notes the loop does not parse,
 * except for the sibling `graph-ack:` block parsed below.
 *
 * Two rules matter more than they look:
 *
 *  1. Absent or malformed after the process exited or was killed is
 *     `interrupted` — NOT `failed`. Nothing was rejected; we simply do not
 *     know. The branch is kept and no retry is consumed.
 *  2. A well-formed `blocked:` with a clean tree is a SUCCESSFUL honest
 *     outcome. This is the whole mechanism by which "reports blocked rather
 *     than guessing" is observed rather than hoped for: it is a file on disk,
 *     read from the filesystem, never a status value the loop was handed.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const RESULT_FILENAME = 'RESULT.md';

/** The exact instruction every brief carries. Kept here so brief and parser cannot drift. */
export const RESULT_PROTOCOL_INSTRUCTION = `## How to end (required)

End by writing a file named \`RESULT.md\` at the root of this worktree. Its
**first line** must be exactly one of:

- \`done\` — you attempted the outcome; the diff is your claim.
- \`blocked: <one-line reason>\` — the task could not be done honestly
  (missing information, an acceptance check that cannot be met, a forbidden
  action). This is a **successful** outcome, recorded as such. Reporting
  blocked is always better than producing something plausible.
- \`capacity\` — you observed your own provider's limit.
- \`reviewed: <path>[, <path>…]\` — the declared pages were read, judged sound,
  and correctly left unchanged. Name every page, comma-separated. This is the
  read-and-unchanged outcome: the branch diff stays empty, and the merge
  ratifies the pages against the work order's committed declared subjects and
  their review state — it never takes your word for which pages count.

Everything after the first line is free-form notes; nothing reads them
mechanically except the sibling \`graph-ack:\` block a later section names.
Write no other status anywhere: this file is the only channel.
If \`RESULT.md\` is absent or its first line is not one of the four forms, the
run is recorded as interrupted — the work is kept on the branch and resumed
later, and no retry is consumed.`;

const BLOCKED_RE = /^blocked:\s*(\S.*)$/;

// ---------------------------------------------------------------------------
// `reviewed:` — the read-and-unchanged outcome (Stage 2, task 62).
//
// Fourth first-line form: `reviewed: <path>[, <path>…]`. The parser below is
// SYNTACTIC only — it splits the line into paths and normalises slashes. It
// authorises nothing: the merge decides acceptance from the work order's
// committed declared subjects and the task-61b review-state join, never from
// this list alone, so an executor cannot widen its own authorisation.
//
// A `reviewed:` line with no path at all is malformed (an interrupted run,
// like a `blocked:` with no reason), never an acceptance of nothing.
// ---------------------------------------------------------------------------

const REVIEWED_RE = /^reviewed:\s*(\S.*)$/;

/** Normalise one reviewed path for set joins: POSIX slashes, trimmed. */
export function normalizeReviewedPath(p) {
  return String(p ?? '').replace(/\\/g, '/').trim();
}

/**
 * Parse a `reviewed:` first line into its declared page paths.
 *
 * @param {string} firstLine  the trimmed first line of RESULT.md
 * @returns {{ok: true, paths: string[]}|{ok: false, why: string}|null}
 *   `null` where the line is not a `reviewed:` line at all; `ok: false`
 *   where it starts like one but carries no path.
 */
export function parseReviewedLine(firstLine) {
  const line = String(firstLine ?? '').trim();
  if (!line.startsWith('reviewed:')) return null;
  const m = REVIEWED_RE.exec(line);
  if (!m) return { ok: false, why: '`reviewed:` names no page path' };
  const paths = [
    ...new Set(
      m[1]
        .split(',')
        .map(normalizeReviewedPath)
        .filter(Boolean),
    ),
  ];
  if (!paths.length) return { ok: false, why: '`reviewed:` names no page path' };
  return { ok: true, paths };
}

/**
 * Read and classify RESULT.md from the filesystem. Never accepts a status
 * from anywhere else.
 *
 * @param {string} worktree
 * @returns {{status: 'done'|'blocked'|'capacity'|'reviewed'|'interrupted',
 *            reason: string|null, malformed: boolean, present: boolean,
 *            firstLine: string|null, text: string|null, why: string,
 *            paths?: string[]}}
 *   `paths` is present only on a `reviewed` status: the executor-declared
+ *   page paths, normalised and de-duplicated, in the order named.
 */
export function readResult(worktree) {
  const path = join(worktree, RESULT_FILENAME);
  if (!existsSync(path)) {
    return {
      status: 'interrupted',
      reason: null,
      malformed: false,
      present: false,
      firstLine: null,
      text: null,
      why: `${RESULT_FILENAME} is absent`,
    };
  }
  const text = readFileSync(path, 'utf8');
  const firstLine = text.split(/\r?\n/, 1)[0].trim();
  if (firstLine === 'done') {
    return { status: 'done', reason: null, malformed: false, present: true, firstLine, text, why: 'first line is `done`' };
  }
  if (firstLine === 'capacity') {
    return { status: 'capacity', reason: null, malformed: false, present: true, firstLine, text, why: 'first line is `capacity`' };
  }
  const m = BLOCKED_RE.exec(firstLine);
  if (m) {
    return {
      status: 'blocked',
      reason: m[1].trim(),
      malformed: false,
      present: true,
      firstLine,
      text,
      why: 'first line is a well-formed `blocked:` line',
    };
  }
  const reviewed = parseReviewedLine(firstLine);
  if (reviewed) {
    if (!reviewed.ok) {
      return {
        status: 'interrupted',
        reason: null,
        malformed: true,
        present: true,
        firstLine,
        text,
        why: `${RESULT_FILENAME} first line is malformed: ${reviewed.why}`,
      };
    }
    return {
      status: 'reviewed',
      reason: null,
      malformed: false,
      present: true,
      firstLine,
      text,
      why: `first line is a well-formed \`reviewed:\` line naming ${reviewed.paths.length} page(s)`,
      paths: reviewed.paths,
    };
  }
  return {
    status: 'interrupted',
    reason: null,
    malformed: true,
    present: true,
    firstLine,
    text,
    why: `${RESULT_FILENAME} first line is malformed: ${JSON.stringify(firstLine.slice(0, 120))}`,
  };
}

/** The first stderr line matching a pattern, for the evidence string. */
function matchingLine(text, pattern) {
  const re = new RegExp(pattern, 'i');
  for (const line of String(text ?? '').split(/\r?\n/)) {
    if (re.test(line)) return line.trim().slice(0, 200);
  }
  return null;
}

/**
 * Combine the file's verdict with what the process did.
 *
 * Precedence, and why:
 *  - A runner's declared `capacity_stderr_pattern` wins over an absent file:
 *    the provider said so in its own words, which is better evidence than
  *    silence. It does NOT override an explicit `done`/`blocked`/`reviewed` — if the
  *    executor finished and said something, that is what happened.
 *  - Killed at the cap with a well-formed file still honours the file: work
 *    that reported itself before the axe fell reported itself.
 *
 * `interrupted` is also returned for a run that never started — an expired
 * credential, a mis-assembled command, a harness that never received the
 * prompt. specs/loop is explicit that an absent `RESULT.md` after the process
 * "has exited or been killed at its cap" IS `interrupted`, so the
 * classification does not change here. What is added is the DISTINCTION the
 * classification loses (beads addictedtoai-h5k). `producedNothing` separates
 * two cases the single word `interrupted` cannot: an executor that ran and was
 * cut off mid-work, and an executor that produced nothing whatsoever.
 * `startupFailure` records a runner's own declared message for a failure to
 * start. Neither relaxes anything; both exist so that a permanently dead
 * credential stops being invisible. What the loop DOES with them is in
 * health.mjs and select.mjs — a stated refusal, not a halt.
 *
 * @param {object} run   result of runExecutor(): { killed, code, stderr, stdout }
 * @param {object} runner  the runners.yml entry
 */
export function classifyRun(run, fileResult, runner) {
  const pattern = runner?.capacity_stderr_pattern;
  const stderrSaysCapacity =
    Boolean(pattern) && new RegExp(pattern, 'i').test(run.stderr ?? '');

  if (fileResult.status === 'done' || fileResult.status === 'blocked') {
    return {
      status: fileResult.status,
      reason: fileResult.reason,
      evidence: fileResult.why,
      producedNothing: false,
      startupFailure: null,
    };
  }
  if (fileResult.status === 'reviewed') {
    // An explicit read-and-unchanged declaration wins over stderr exactly as
    // `done`/`blocked` do: the executor finished and said something. The
    // declared paths ride along so the merge can authorise them against the
    // committed declaration — `classifyRun` never invents them.
    return {
      status: 'reviewed',
      reason: null,
      paths: Array.isArray(fileResult.paths) ? [...fileResult.paths] : [],
      evidence: fileResult.why,
      producedNothing: false,
      startupFailure: null,
    };
  }
  if (fileResult.status === 'capacity') {
    return {
      status: 'capacity',
      reason: null,
      evidence: fileResult.why,
      producedNothing: false,
      startupFailure: null,
    };
  }
  if (stderrSaysCapacity) {
    return {
      status: 'capacity',
      reason: null,
      evidence:
        `${fileResult.why}; the runner's declared capacity_stderr_pattern matched its stderr`,
      producedNothing: false,
      startupFailure: null,
    };
  }

  // No RESULT.md at all, not killed at the cap, and nothing said on stdout: the
  // executor did not run, as distinct from ran and was cut off. Note the
  // conditions are all about the PROCESS; whether the branch gained a diff is
  // known only to the caller, which is why run.mjs requires that too before
  // recording the signal.
  const silent = String(run.stdout ?? '').trim() === '';
  const producedNothing = !fileResult.present && !run.killed && silent;

  const startPattern = runner?.startup_failure_stderr_pattern;
  const startLine = startPattern ? matchingLine(run.stderr, startPattern) : null;
  const startupFailure = startLine
    ? { pattern: startPattern, line: startLine }
    : null;
  // A startup-failure pattern is evidence a runner never STARTED, so it may
  // only speak where there is no positive evidence that it ran. See
  // `reviewProducedNothing` below for the measurement that forced this.
  const startupFailureMeansNothingRan = Boolean(startupFailure) && !fileResult.present && silent;

  return {
    status: 'interrupted',
    reason: null,
    evidence:
      fileResult.why +
      (run.killed
        ? ' and the executor was killed at its wall-clock cap'
        : ` and the executor exited with code ${run.code}`) +
      (startupFailure
        ? `; the runner's declared startup_failure_stderr_pattern matched its stderr: ${JSON.stringify(startupFailure.line)}`
        : producedNothing
          ? ', having written no RESULT.md and printed nothing on stdout — it produced nothing at all'
          : ''),
    producedNothing: producedNothing || startupFailureMeansNothingRan,
    startupFailure,
  };
}

/**
 * The REVIEWER-role analogue of `classifyRun`'s `producedNothing` (beads
 * addictedtoai-g8a). A reviewer has no `RESULT.md` and no branch diff to read
 * — its worktree is thrown away unconditionally (`runReview`, "no edit
 * rights, as a mechanism") — so its only durable output is the verdict record
 * at `outPath`, and its only other channel is what it said on stdout before
 * exiting. Silence on both is the same shape `classifyRun` treats as "did not
 * run at all": no file, not killed, nothing said.
 *
 * `recordWritten` is the caller's own `existsSync(outPath)` measurement
 * (`runReview` already returns it), not re-derived here, for the same reason
 * `classifyRun` takes `fileResult` rather than reading the filesystem itself:
 * one measurement, used by both the merge gate and this.
 *
 * DELIBERATELY NOT the same as "the merge gate refused with `no-record`".
 * `no-record` also fires for a reviewer that talked at length on stdout and
 * simply forgot to write the file — that reviewer plainly ran, so it is a
 * protocol/quality problem for the review gate to keep failing honestly, not
 * evidence the runner cannot run. Requiring BOTH an absent record AND silence
 * is what keeps that case out.
 *
 * A MALFORMED verdict record (the file exists but does not parse into
 * `approve`/`revise`/`reject`) is further still — it is not "produced
 * nothing" at all: a file was written. `recordWritten` is `existsSync`, not
 * "parses", precisely
 * so a malformed record scores as output here — a bad verdict is a quality
 * problem the review gate already handles (`mergeGate`'s `malformed-verdict`
 * code), and conflating "wrote something bad" with "never ran" would let one
 * poorly-formed verdict start disabling a runner that plainly works.
 *
 * @param {object} run   result of runExecutor(): { killed, code, stderr, stdout }
 * @param {boolean} recordWritten  whether a verdict file exists at the path the review brief named
 * @param {object} runner  the runners.yml entry for the REVIEWER role
 */
export function reviewProducedNothing(run, recordWritten, runner) {
  const silent = String(run.stdout ?? '').trim() === '';
  const producedNothing = !recordWritten && !run.killed && silent;
  const startPattern = runner?.startup_failure_stderr_pattern;
  const startLine = startPattern ? matchingLine(run.stderr, startPattern) : null;
  // THE PATTERN MAY ONLY SPEAK WHERE THERE IS NO POSITIVE EVIDENCE, and this
  // clause is the whole reason the function takes `recordWritten` rather than
  // trusting stderr. A startup-failure pattern describes a runner that never
  // started — a dead credential, an uninstalled harness. It is matched against
  // the ENTIRE stderr stream, and a harness that narrates its work there (the
  // common case: a run's whole transcript arrives on stderr while stdout stays
  // empty) quotes file contents, commit ids, hash keys and test line numbers
  // back into that stream. Any of those can contain the digits a login-failure
  // pattern looks for.
  //
  // MEASURED, 2026-09-07, on the two review passes of job j-20260907-16: both
  // wrote full verdict records that the merge gate then read and acted on —
  // one `revise` carrying five findings, one `approve` carrying a would-cite —
  // and both were nevertheless recorded `no-output`, because the transcript on
  // stderr contained a commit id (`ca7401e5`), a hash key and test line numbers
  // (`diff.test.mjs:403`) matching that runner's declared pattern. Two false
  // signals in one job, against a streak limit of three, is a runner disabled
  // for both roles within two jobs on nothing but its own correct output.
  //
  // So the same rule the doc comment above states for a MALFORMED record — a
  // file was written, therefore the runner ran — is applied to the pattern:
  // it can only mean "nothing ran" when nothing else says otherwise.
  const startupFailureMeansNothingRan = Boolean(startLine) && !recordWritten && silent;
  return producedNothing || startupFailureMeansNothingRan;
}

// ---------------------------------------------------------------------------
// `graph-ack:` — the work order's acknowledgement of graph corroboration
// (Stage 2, task 56). The ONE result-file shape change that task allows: a
// sibling block in RESULT.md, one entry per `graph:<declared-subject-path>`,
// each carrying the identifier, exactly one of the closed states below, and
// one sentence of evidence. Presence and well-formedness are mechanised at
// the merge gate; truth stays the reviewer's.
//
// Shape (hand-parsed, no YAML dependency — RESULT.md is free-form notes
// below its first line, not front matter):
//
//     graph-ack:
//       - subject: graph:content/wiki/model/x.md
//         state: path-checked
//         evidence: The stub analysis reported callers=2 processes=1 risk=LOW.
//
// `state` is exactly one of `GRAPH_ACK_STATES`. `evidence` is one non-empty
// line. Unknown keys are ignored (forward-tolerant); missing or closed-list-
// violating keys make the entry malformed, and a malformed entry excuses
// nothing — the merge treats its subject as unacknowledged.
// ---------------------------------------------------------------------------

/** The closed acknowledgement states (task 56): exactly one per entry. */
export const GRAPH_ACK_STATES = Object.freeze(['noted', 'path-checked', 'deferred']);

const GRAPH_ACK_SUBJECT_RE = /^graph:(.+)$/;

function stripQuotes(s) {
  const t = String(s ?? '').trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return t;
}

/**
 * Parse the sibling `graph-ack:` block out of a result file's text.
 *
 * @param {string} text  the whole RESULT.md text (or '' when absent)
 * @returns {{present: boolean, entries: Array<{subject: string, path: string, state: string, evidence: string}>,
 *            malformed: Array<{index: number, why: string}>, bySubject: Map<string, object>}}
 *   `subject` keeps the `graph:` namespace; `path` is the declared subject
 *   inside it. `bySubject` holds the first well-formed entry per path.
 *   `present` is true when any entry-shaped content was found, well-formed
 *   or not.
 */
export function parseGraphAck(text) {
  const empty = { present: false, entries: [], malformed: [], bySubject: new Map() };
  const lines = String(text ?? '').split(/\r?\n/);
  const head = lines.findIndex((l) => l.trim() === 'graph-ack:');
  if (head === -1) return empty;
  const entries = [];
  const malformed = [];
  let current = null;
  let index = 0;
  const flush = () => {
    if (!current) return;
    index += 1;
    const entry = current;
    current = null;
    const subject = stripQuotes(entry.subject ?? '');
    const m = GRAPH_ACK_SUBJECT_RE.exec(subject);
    if (!m || !m[1].trim()) {
      malformed.push({ index, why: `subject ${JSON.stringify(entry.subject ?? '')} is not graph:<declared-subject-path>` });
      return;
    }
    const state = stripQuotes(entry.state ?? '');
    if (!GRAPH_ACK_STATES.includes(state)) {
      malformed.push({ index, why: `state ${JSON.stringify(entry.state ?? '')} is not one of ${GRAPH_ACK_STATES.join(' / ')}` });
      return;
    }
    const evidence = stripQuotes(entry.evidence ?? '');
    if (!evidence) {
      malformed.push({ index, why: 'evidence is empty — one sentence of evidence is required' });
      return;
    }
    entries.push({ subject, path: m[1].replace(/\\/g, '/').trim(), state, evidence });
  };
  for (const line of lines.slice(head + 1)) {
    const dash = /^\s*-\s+(.*)$/.exec(line);
    if (dash) {
      flush();
      current = {};
      const kv = /^\s*([A-Za-z-]+)\s*:\s*(.*)$/.exec(dash[1]);
      if (kv) current[kv[1].trim()] = kv[2];
      continue;
    }
    if (!current) {
      // A non-entry line ends the block, except blanks. A second `graph-ack:`
      // header is not a continuation of the first.
      if (line.trim() === '' || /^\s*#/.test(line)) continue;
      break;
    }
    const kv = /^\s+([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (kv) {
      current[kv[1].trim()] = kv[2];
    } else if (line.trim() !== '') {
      // A non-indented, non-entry line ends the block.
      if (!/^\s/.test(line)) break;
    }
  }
  flush();
  const bySubject = new Map();
  const dups = [];
  for (const e of entries) {
    if (bySubject.has(e.path)) {
      dups.push(e.path);
      continue;
    }
    bySubject.set(e.path, e);
  }
  for (const path of dups) {
    malformed.push({ index: 0, why: `duplicate entry for graph:${path} — the first stands` });
  }
  return { present: entries.length > 0 || malformed.length > 0, entries, malformed, bySubject };
}

/**
 * The well-formed acknowledgement for a declared subject path, if any.
 *
 * @param {{bySubject: Map}|null} parsed  `parseGraphAck` output
 * @param {string} path  the declared subject (without the `graph:` prefix)
 */
export function graphAckForSubject(parsed, path) {
  if (!parsed || !parsed.bySubject) return null;
  const key = String(path ?? '').replace(/\\/g, '/').trim();
  return parsed.bySubject.get(key) ?? null;
}
