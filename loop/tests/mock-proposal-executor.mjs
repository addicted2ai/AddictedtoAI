#!/usr/bin/env node
/**
 * mock-proposal-executor.mjs — executors that really file proposals.
 *
 *     node mock-proposal-executor.mjs <mode> <prompt-file>
 *
 * A second mock beside `mock-executor.mjs`, not an extension of it: the
 * proposal mechanics need author modes that write four candidate files and
 * reviewer modes that note a proposal in their verdict record, and neither
 * belongs in the shared mock the outcome and breaker tests read.
 *
 * Same contract as every runner (specs/loop): one written prompt in, files out,
 * exit. No memory across invocations, no tool-calling API, no structured
 * output. Every mode below REALLY writes the files on disk — the tests observe
 * the filesystem and the git history, never a status this process hands back.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , mode, promptPath] = process.argv;
const cwd = process.cwd();
const brief = promptPath && existsSync(promptPath) ? readFileSync(promptPath, 'utf8') : '';
const result = (text) => writeFileSync(join(cwd, 'RESULT.md'), text, 'utf8');

function write(rel, text) {
  const abs = join(cwd, rel);
  mkdirSync(join(abs, '..'), { recursive: true });
  writeFileSync(abs, text, 'utf8');
}

/**
 * One candidate file, in the docket shape the scout brief asks for.
 * `rank` is the job's own stated ranking; omitted, the loop falls back to the
 * filename, which is why the fixtures below can order the two against each
 * other.
 */
function candidate(name, { slug, type = 'post', rank = null, expires = null, extra = {} }) {
  const fm = [
    `slug: ${slug}`,
    `type: ${type}`,
    'date: 2026-09-10',
    ...(rank === null ? [] : [`rank: ${rank}`]),
    ...(expires === null ? [] : [`expires: ${expires}`]),
    ...Object.entries(extra).map(([k, v]) => `${k}: ${v}`),
    `summary: candidate ${slug}`,
  ].join('\n');
  write(
    `data/proposals/${name}`,
    `---\n${fm}\n---\n\nWhy now: a thing happened outside this repository.\n\n` +
      `Evidence: https://example.invalid/${slug} (retrieved 2026-09-10)\n\n` +
      `Done when: the entry names the change and dates it.\n`,
  );
}

function dropRecord(slug, test_, refile) {
  write(
    `data/proposals/dropped/${slug}.md`,
    `---\nslug: ${slug}\ndate: 2026-09-10\n---\n\n## Dropped\n\n` +
      `- failed test: ${test_}\n- refile when: ${refile}\n`,
  );
}

/** The verdict path the reviewer brief names, on its own line in backticks. */
function verdictPathFromBrief() {
  const m = /^`(.+\.md)`$/m.exec(brief);
  return m ? m[1] : null;
}

/**
 * `reads-human` is written on every verdict, not only on `post` ones. The merge
 * gate requires it on `post` verdicts and ignores it elsewhere, and a mock that
 * only wrote it "when it mattered" would encode this file's guess about which
 * types those are — which is the reviewer brief's business, not a fixture's.
 */
function writeVerdict({
  verdict,
  reasons = [],
  wouldCite,
  readsHuman = 'It reads like a person wrote it: the sentences vary and nothing is announced.',
  notes = 'mock reviewer notes',
  proposalBlock = '',
  carryBlock = '',
}) {
  const p = verdictPathFromBrief();
  if (!p) return false;
  writeFileSync(
    p,
    `---\njob: mock\nverdict: ${verdict}\nreasons: [${reasons.join(', ')}]\n` +
      `would-cite: ${JSON.stringify(wouldCite)}\n` +
      `reads-human: ${JSON.stringify(readsHuman)}\n${proposalBlock}${carryBlock}---\n\n${notes}\n`,
    'utf8',
  );
  return true;
}

const NOTED = [
  'proposal:',
  '  slug: dated-licence-churn',
  '  type: interpret',
  '  summary: three weeks of licence changes want one interpretation line each.',
  '  evidence: data/changes.jsonl lines 41-63, read while reviewing this diff.',
  '',
].join('\n');

// beads addictedtoai-2bo — a reviewer carrying two findings it did not block
// on. Deliberately includes one malformed entry (no title) so the loop's
// warning path is exercised by a real run, not only by a unit test.
const CARRIED = [
  'carry:',
  '  - title: fix the date arithmetic',
  '    detail: 30 July to 28 August is 29 days, not six weeks.',
  '    subject: content/wiki/model/fixture.md',
  '  - detail: no title on this one, so it must be dropped rather than guessed at',
  '',
].join('\n');

switch (mode) {
  // ---- author modes -------------------------------------------------------

  // Four candidates, ranked, with filenames in the OPPOSITE order to the ranks,
  // so a run that kept three by filename and a run that kept three by rank
  // cannot produce the same answer. Two drop records beside them, in the
  // subdirectory the cap must not touch.
  case 'scout-4-ranked':
    candidate('d-best.md', { slug: 'best-story', rank: 1 });
    candidate('c-second.md', { slug: 'second-story', rank: 2 });
    candidate('b-third.md', { slug: 'third-story', rank: 3 });
    candidate('a-weakest.md', { slug: 'weakest-story', rank: 4 });
    dropRecord('considered-and-declined', 'not worth a stranger’s attention', 'the vendor confirms the figure');
    dropRecord('also-declined', 'not checkable: no primary source', 'a primary source appears');
    result('done\n\nFiled four candidates, ranked, and two drop records.\n');
    break;

  // The positive control for the cap: exactly three, ranked. Nothing may be
  // dropped. A cap that drops on this input is dropping unconditionally.
  case 'scout-3-ranked':
    candidate('d-best.md', { slug: 'best-story', rank: 1 });
    candidate('c-second.md', { slug: 'second-story', rank: 2 });
    candidate('b-third.md', { slug: 'third-story', rank: 3 });
    result('done\n\nFiled three candidates.\n');
    break;

  // Four with no stated ranking at all — the filename fallback.
  case 'scout-4-unranked':
    candidate('a-one.md', { slug: 'story-one' });
    candidate('b-two.md', { slug: 'story-two' });
    candidate('c-three.md', { slug: 'story-three' });
    candidate('d-four.md', { slug: 'story-four' });
    result('done\n\nFiled four candidates without ranking them.\n');
    break;

  // ---- the frontier exemption (flag-what-moved-the-frontier) --------------

  // Four candidates where the flagged one is ranked LAST — the one the cap
  // would have dropped. A run that kept it by accident (because it ranked well)
  // would prove nothing about the exemption.
  case 'scout-4-one-flagged':
    candidate('a-one.md', { slug: 'story-one', rank: 1 });
    candidate('b-two.md', { slug: 'story-two', rank: 2 });
    candidate('c-three.md', { slug: 'story-three', rank: 3 });
    candidate('d-flagged.md', {
      slug: 'frontier-story',
      rank: 4,
      extra: { frontier: 'true', frontier_reason: 'F3', domains: '[agents]' },
    });
    result('done\n\nFiled three ordinary candidates and one frontier-flagged fourth.\n');
    break;

  // The flag that does not hold, ranked FIRST — so that a merge which let it
  // rejoin the counted group would displace a real candidate, which is the
  // exact move the drop exists to prevent.
  case 'scout-4-flag-no-criterion':
    candidate('a-flagged-no-criterion.md', {
      slug: 'unearned-flag',
      rank: 1,
      extra: { frontier: 'true' },
    });
    candidate('b-two.md', { slug: 'story-two', rank: 2 });
    candidate('c-three.md', { slug: 'story-three', rank: 3 });
    candidate('d-four.md', { slug: 'story-four', rank: 4 });
    result('done\n\nFiled four candidates, one of them flagged without a criterion.\n');
    break;

  // A NON-SCOUT job filing two, the flagged one ranked second. The exemption is
  // the scout's cap and no other, so the flag must buy this candidate nothing.
  case 'entry-two-one-flagged':
    candidate('a-first.md', { slug: 'first-idea', type: 'interpret', rank: 1 });
    candidate('b-flagged.md', {
      slug: 'flagged-idea',
      type: 'interpret',
      rank: 2,
      extra: { frontier: 'true', frontier_reason: 'F1', domains: '[coding]' },
    });
    write('site-note.md', '# the job’s actual work\n');
    result('done\n\nDid the work and filed two proposals, one flagged.\n');
    break;

  // A job proposing more of its own type, with a FORGED origin stamp: the
  // executor claims the proposal came from a scout. The loop must overwrite it.
  case 'proposes-post':
    candidate('more-of-the-same.md', {
      slug: 'more-of-the-same',
      type: 'post',
      extra: { proposed_by_type: 'scout', proposed_by_job: 'j-forged-01' },
    });
    write('site-note.md', '# the job’s actual work\n');
    result('done\n\nDid the work and filed one proposal.\n');
    break;

  // The designed cross-type path: a job noticing work of a different type.
  case 'proposes-interpret':
    candidate('licence-churn.md', { slug: 'licence-churn', type: 'interpret' });
    write('site-note.md', '# the job’s actual work\n');
    result('done\n\nDid the work and filed one proposal.\n');
    break;

  // Two proposals from a job whose cap is one.
  case 'proposes-two':
    candidate('a-first.md', { slug: 'first-idea', type: 'interpret' });
    candidate('b-second.md', { slug: 'second-idea', type: 'interpret' });
    write('site-note.md', '# the job’s actual work\n');
    result('done\n\nDid the work and filed two proposals.\n');
    break;

  // An ordinary mergeable edit that touches no proposal at all — the author for
  // the sweep tests, where anything filed would be a second explanation for a
  // file appearing in `data/proposals/`.
  case 'plain-edit':
    write('site-note.md', '# an ordinary edit\n');
    result('done\n\nDid the work.\n');
    break;

  // ---- reviewer modes -----------------------------------------------------
  case 'review-approve-noting':
    writeVerdict({
      verdict: 'approve',
      wouldCite: 'Someone arguing that caps must be mechanical would link this diff.',
      proposalBlock: NOTED,
      notes: 'While reading this I noticed the licence churn wants interpreting.',
    });
    result('done\n');
    break;

  case 'review-approve-plain':
    writeVerdict({
      verdict: 'approve',
      wouldCite: 'Someone arguing that caps must be mechanical would link this diff.',
      notes: 'Nothing else surfaced.',
    });
    result('done\n');
    break;

  case 'review-approve-carrying':
    writeVerdict({
      verdict: 'approve',
      wouldCite: 'Someone arguing that caps must be mechanical would link this diff.',
      carryBlock: CARRIED,
      notes: 'Sound overall. Two small things I am not blocking on, noted below.',
    });
    result('done\n');
    break;

  // Rejects and notes NOTHING — the reviewer for the discarded-branch case,
  // where a noted proposal would be a second source of proposal files and the
  // test could not tell the two apart.
  case 'review-reject-plain':
    writeVerdict({
      verdict: 'reject',
      reasons: ['not-worth-reading'],
      wouldCite: 'Nobody, as written: the candidates have no external evidence.',
      notes: 'Rejected. Nothing else surfaced.',
    });
    result('done\n');
    break;

  case 'review-reject-noting':
    writeVerdict({
      verdict: 'reject',
      reasons: ['not-worth-reading'],
      wouldCite: 'Nobody, as written: the candidate has no external evidence.',
      proposalBlock: NOTED,
      notes: 'Rejected, but the licence churn underneath it is real work.',
    });
    result('done\n');
    break;

  default:
    result(`blocked: unknown mock mode ${JSON.stringify(mode)}\n`);
    break;
}
