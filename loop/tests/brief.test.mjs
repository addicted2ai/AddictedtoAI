/**
 * Task 12 — revision briefs carry the cited requirements and no padding.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { assembleBrief, assembleRevisionBrief } from '../lib/brief.mjs';
import { excerptsFor, SPECS_FOR_TYPE } from '../lib/specs.mjs';
import { BRIEF_EXCERPT_MAX_CHARS } from '../lib/config.mjs';
import { DEFAULT_REPO_ROOT } from '../lib/paths.mjs';
import { makeRepo } from './helpers.mjs';

const TYPE = 'repair';
const PENDING_ROOT = 'fixture-amendments';
const CITED_GOVERNING = 'Pulse cited requirement';
const CITED_OUTSIDE = 'Editorial cited requirement';
const UNCITED_GOVERNING = 'Site uncited requirement';
const OTHER_GOVERNING = 'Review other requirement';
const ALL_HEADINGS = new Set([
  CITED_GOVERNING,
  'Pulse other requirement',
  UNCITED_GOVERNING,
  'Site other requirement',
  OTHER_GOVERNING,
  'Review second requirement',
  CITED_OUTSIDE,
  'Editorial other requirement',
]);
const CITES = [CITED_GOVERNING, CITED_OUTSIDE];
const PENDING_SENTINEL = 'PENDING AMENDMENT SENTINEL: this body is not the constitution text.';
const OVER_BUDGET_CITED = 'Over-budget cited requirement';

function requirement(heading, chars, prefix = `repair evidence for ${heading}. `) {
  let body = prefix;
  while (body.length < chars) body += 'This is pinned fixture requirement material. ';
  return `### Requirement: ${heading}\n\n${body.slice(0, chars)}\n`;
}

function constitution(capability, sections) {
  return `# ${capability}\n\n${sections.map((heading) => requirement(heading, 6000)).join('\n')}`;
}

function fixtureFiles() {
  return {
    'openspec/specs/pulse/spec.md': constitution('pulse', [CITED_GOVERNING, 'Pulse other requirement']),
    'openspec/specs/site/spec.md': constitution('site', [UNCITED_GOVERNING, 'Site other requirement']),
    'openspec/specs/review/spec.md': constitution('review', [OTHER_GOVERNING, 'Review second requirement']),
    'openspec/specs/editorial/spec.md': constitution('editorial', [CITED_OUTSIDE, 'Editorial other requirement']),
    [`${PENDING_ROOT}/one/specs/pulse/spec.md`]:
      `# pending pulse\n\n${requirement(CITED_GOVERNING, 2200, `${PENDING_SENTINEL} `)}`,
  };
}

function headingSet(text) {
  return new Set([...text.matchAll(/^### Requirement:\s*(.+)$/gm)].map((match) => match[1].trim()));
}

function cutHeadings(text) {
  return [...text.matchAll(/\[\.\.\. CUT: requirement ("(?:[^"\\]|\\.)*") from /g)]
    .map((match) => JSON.parse(match[1]));
}

function excerptRecorder(calls, label) {
  return (repoRoot, type, options) => {
    calls.push({
      label,
      repoRoot,
      type,
      options: {
        ...options,
        ...(Array.isArray(options.headings) ? { headings: [...options.headings] } : {}),
        ...(Array.isArray(options.subjects) ? { subjects: [...options.subjects] } : {}),
      },
    });
    return excerptsFor(repoRoot, type, options);
  };
}

function buildPair() {
  const ctx = makeRepo({ files: fixtureFiles() });
  ctx.pendingRoot = join(ctx.repoRoot, PENDING_ROOT);
  const job = { type: TYPE, source: 'queue', title: 'repair the pinned fixture', detail: 'fix the stated fixture issue' };
  const excerptCalls = [];
  const common = {
    jobId: 'j-20260910-brief',
    job,
    branch: 'job/j-20260910-brief',
    capMinutes: 30,
  };
  const author = assembleBrief(ctx, common, excerptRecorder(excerptCalls, 'author'));
  const verdict = {
    verdict: 'revise',
    reasons: ['not-worth-reading'],
    notes: 'Address the two requirements the reviewer cited.',
    cites: CITES,
  };
  const findings = [verdict.reasons.join(', '), verdict.notes].join('\n\n');
  const revision = assembleRevisionBrief(ctx, {
    ...common,
    verdict,
    findings,
    diffText: 'diff without a requirement heading',
  }, excerptRecorder(excerptCalls, 'cited-revision'));
  return { ctx, author, revision, allHeadings: ALL_HEADINGS, excerptCalls };
}

function excerptHeadings(text) {
  const start = text.indexOf('## Relevant spec excerpts');
  return headingSet(start >= 0 ? text.slice(start) : '');
}

test('a cited revision is smaller and its excerpt heading set is exact', () => {
  const { ctx, author, revision, allHeadings } = buildPair();
  assert.ok(SPECS_FOR_TYPE[TYPE].length >= 2, 'the fixture type governs multiple capabilities');
  const authorSize = author.length;
  const revisionSize = revision.length;
  console.log(`fixture brief sizes; author_chars=${authorSize}; revision_chars=${revisionSize}; difference=${authorSize - revisionSize}`);
  assert.ok(revisionSize < authorSize, `observed author ${authorSize}, revision ${revisionSize}, expected revision to be smaller`);

  const actual = excerptHeadings(revision);
  assert.match(revision, /\*\*Value\*\*: `revise`/);
  assert.match(revision, /\*\*Reasons\*\*: `not-worth-reading`/);
  assert.match(revision, /Address the two requirements the reviewer cited\./);
  assert.match(revision, /diff without a requirement heading/);
  assert.deepEqual([...actual].sort(), [...new Set(CITES)].sort());
  for (const heading of CITES) assert.ok(actual.has(heading), `missing cited heading ${heading}`);
  for (const heading of allHeadings) {
    if (!CITES.includes(heading)) assert.ok(!actual.has(heading), `uncited heading was included: ${heading}`);
  }
  ctx.cleanup();
});

test('a cited heading outside the governing capabilities is carried', () => {
  const { ctx, revision } = buildPair();
  assert.ok(excerptHeadings(revision).has(CITED_OUTSIDE));
  ctx.cleanup();
});

test('a cited pending amendment follows its constitution text and keeps its own body', () => {
  const { ctx, revision } = buildPair();
  const constitutionHeading = revision.indexOf(`### Requirement: ${CITED_GOVERNING}`);
  const pendingMarker = revision.indexOf('### PENDING AMENDMENT to `specs/pulse`');
  const pendingSentinel = revision.indexOf(PENDING_SENTINEL);
  assert.ok(constitutionHeading >= 0, 'the cited constitution heading is present');
  assert.ok(pendingMarker > constitutionHeading, 'the pending marker follows the constitution heading');
  assert.ok(pendingSentinel > pendingMarker, 'the pending amendment carries its distinct sentinel body');
  ctx.cleanup();
});

test('an uncited governing heading is not carried into the revision', () => {
  const { ctx, revision } = buildPair();
  assert.ok(!excerptHeadings(revision).has(UNCITED_GOVERNING));
  assert.ok(!excerptHeadings(revision).has(OTHER_GOVERNING));
  ctx.cleanup();
});

test('a cited heading that cannot be found is named in a marker', () => {
  const { ctx } = buildPair();
  const revision = assembleRevisionBrief(ctx, {
    jobId: 'j-20260910-missing-cite',
    job: { type: TYPE, source: 'queue', title: 'repair the pinned fixture', detail: 'fix the stated fixture issue' },
    branch: 'job/j-20260910-missing-cite',
    capMinutes: 30,
    verdict: { verdict: 'revise', reasons: ['not-worth-reading'], notes: 'Name the missing heading.', cites: ['Missing fixture heading'] },
    findings: 'not-worth-reading\n\nName the missing heading.',
    diffText: 'diff without a requirement heading',
  });
  assert.match(revision, /CITED REQUIREMENT HEADINGS NOT FOUND: "Missing fixture heading"/);
  ctx.cleanup();
});

test('an unresolved cited heading with no live sources reports missing and truncated', () => {
  const ctx = makeRepo();
  const heading = 'Missing heading with no live source';
  const excerpt = excerptsFor(ctx.repoRoot, TYPE, {
    headings: [heading],
    maxChars: BRIEF_EXCERPT_MAX_CHARS,
  });
  assert.equal(excerpt.text, '');
  assert.equal(excerpt.chars, 0);
  assert.equal(excerpt.truncated, true, 'an unresolved heading is reported as truncated');
  assert.deepEqual(excerpt.missingHeadings, [heading]);
  const revision = assembleRevisionBrief(ctx, {
    jobId: 'j-20260910-no-live-source',
    job: { type: TYPE, source: 'queue', title: 'repair the missing fixture', detail: 'name the absent requirement' },
    branch: 'job/j-20260910-no-live-source',
    capMinutes: 30,
    verdict: { verdict: 'revise', reasons: ['not-worth-reading'], notes: 'Name the absent requirement.', cites: [heading] },
    findings: 'not-worth-reading\n\nName the absent requirement.',
    diffText: 'diff without a requirement heading',
  });
  assert.match(revision, /CITED REQUIREMENT HEADINGS NOT FOUND: "Missing heading with no live source"/);
  ctx.cleanup();
});

test('heading-mode zero budget returns its empty truncated result for a delta-only source', () => {
  const heading = 'Delta-only zero-budget heading';
  const ctx = makeRepo({ files: { 'openspec/specs/loop/.keep': '' } });
  ctx.pendingRoot = join(ctx.repoRoot, PENDING_ROOT);
  const pendingPath = join(ctx.pendingRoot, 'one', 'specs', 'loop', 'spec.md');
  mkdirSync(join(ctx.pendingRoot, 'one', 'specs', 'loop'), { recursive: true });
  writeFileSync(pendingPath, `# pending loop\n\n${requirement(heading, 100)}`, 'utf8');
  const excerpt = excerptsFor(ctx.repoRoot, TYPE, {
    headings: [heading],
    maxChars: 0,
    pendingRoot: ctx.pendingRoot,
  });
  assert.equal(excerpt.text, '');
  assert.equal(excerpt.chars, 0);
  assert.equal(excerpt.truncated, true, 'a zero-budget cited plan still reports truncation');
  assert.deepEqual(excerpt.missingHeadings, []);
  ctx.cleanup();
});

test('an empty cites list uses the author brief requirement selection', () => {
  const { ctx, author, excerptCalls } = buildPair();
  const emptyRevisionCalls = [];
  const revision = assembleRevisionBrief(ctx, {
    jobId: 'j-20260910-empty-cites',
    job: { type: TYPE, source: 'queue', title: 'repair the pinned fixture', detail: 'fix the stated fixture issue' },
    branch: 'job/j-20260910-empty-cites',
    capMinutes: 30,
    verdict: { verdict: 'revise', reasons: ['not-worth-reading'], notes: 'No structural citations were recorded.', cites: [] },
    findings: 'not-worth-reading\n\nNo structural citations were recorded.',
    diffText: 'diff without a requirement heading',
  }, excerptRecorder(emptyRevisionCalls, 'empty-cites-revision'));
  const authorCall = excerptCalls.find((call) => call.label === 'author');
  assert.ok(authorCall, 'the author assembler must call the injected excerpt function');
  assert.equal(emptyRevisionCalls.length, 1, 'the empty-cites revision must call the excerpt function once');
  assert.deepEqual(emptyRevisionCalls[0].options, authorCall.options);
  assert.deepEqual(emptyRevisionCalls[0].options.subjects, []);
  assert.equal(emptyRevisionCalls[0].options.maxChars, authorCall.options.maxChars);
  assert.equal(emptyRevisionCalls[0].options.pendingRoot, authorCall.options.pendingRoot);
  assert.deepEqual([...excerptHeadings(revision)].sort(), [...excerptHeadings(author)].sort());
  ctx.cleanup();
});

test('heading excerpts charge the separator between cited sections in one constitution', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/pulse/spec.md': constitution('pulse', [CITED_GOVERNING, 'Pulse other requirement']),
    },
  });
  const headings = [CITED_GOVERNING, 'Pulse other requirement'];
  const sourcePath = join(ctx.repoRoot, 'openspec', 'specs', 'pulse', 'spec.md').replace(/\\/g, '/');
  const chunkHeading = `### From \`specs/pulse\` (full text: \`${sourcePath}\`)`;
  const cutMarkerLength = (heading) =>
    `\n\n[... CUT: requirement ${JSON.stringify(heading)} from \`${sourcePath}\` ...]`.length;
  const separatorLength = '\n\n'.length;
  const maxChars =
    chunkHeading.length +
    separatorLength +
    headings.reduce((total, heading) => total + cutMarkerLength(heading), 0) +
    separatorLength;
  const excerpt = excerptsFor(ctx.repoRoot, TYPE, { headings, maxChars });
  assert.deepEqual(cutHeadings(excerpt.text), headings, 'the cited cut-marker headings are complete and ordered');
  assert.ok(
    excerpt.text.length <= maxChars && excerpt.chars <= maxChars && excerpt.chars === excerpt.text.length,
    `cap=${maxChars}; text.length=${excerpt.text.length}; chars=${excerpt.chars}`,
  );
  ctx.cleanup();
});

test('heading-mode carries all cited constitution sections at an ample cap', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/pulse/spec.md': constitution('pulse', [CITED_GOVERNING, 'Pulse other requirement']),
    },
  });
  const headings = [CITED_GOVERNING, 'Pulse other requirement'];
  const excerpt = excerptsFor(ctx.repoRoot, TYPE, { headings, maxChars: 20000 });
  assert.deepEqual([...headingSet(excerpt.text)], headings, 'the cited requirement sections are complete and ordered');
  ctx.cleanup();
});

test('heading-mode truncation tells the revision reader to open the full files', () => {
  const source = requirement(OVER_BUDGET_CITED, BRIEF_EXCERPT_MAX_CHARS * 2);
  const ctx = makeRepo({
    files: {
      'openspec/specs/loop/spec.md': source,
    },
  });
  const options = {
    headings: [OVER_BUDGET_CITED],
    maxChars: BRIEF_EXCERPT_MAX_CHARS,
  };
  const excerpt = excerptsFor(ctx.repoRoot, TYPE, options);
  assert.ok(
    source.length > options.maxChars,
    `full fixture length ${source.length} must exceed maxChars ${options.maxChars}`,
  );
  assert.equal(
    excerpt.text.length,
    excerpt.chars,
    `excerpt text.length ${excerpt.text.length} must equal chars ${excerpt.chars}`,
  );
  assert.ok(
    excerpt.chars <= options.maxChars,
    `excerpt chars ${excerpt.chars} must be <= maxChars ${options.maxChars}`,
  );
  assert.equal(excerpt.truncated, true, 'the cited heading is cut at the excerpt budget');
  const revision = assembleRevisionBrief(ctx, {
    jobId: 'j-20260910-truncated-cite',
    job: { type: TYPE, source: 'queue', title: 'repair the long fixture', detail: 'read the complete requirement' },
    branch: 'job/j-20260910-truncated-cite',
    capMinutes: 30,
    verdict: {
      verdict: 'revise',
      reasons: ['not-worth-reading'],
      notes: 'Read the complete cited requirement.',
      cites: [OVER_BUDGET_CITED],
    },
    findings: 'not-worth-reading\n\nRead the complete cited requirement.',
    diffText: 'diff without a requirement heading',
  });
  assert.match(revision, /relevant material was cut; the full files are in this worktree/);
  ctx.cleanup();
});

test('revision verdict separates ordinary notes from diff-measured refusal findings', () => {
  const { ctx, revision } = buildPair();
  assert.match(
    revision,
    /\*\*Free-form notes\*\*\n\nAddress the two requirements the reviewer cited\./,
  );
  assert.doesNotMatch(revision, /\*\*Diff-measured refusal reason\*\*/);

  const diffReason = 'DIFF_REFUSAL_SENTINEL: the measured refusal is separate from the note.';
  const control = assembleRevisionBrief(ctx, {
    jobId: 'j-20260910-diff-refusal',
    job: { type: TYPE, source: 'queue', title: 'repair the pinned fixture', detail: 'fix the stated fixture issue' },
    branch: 'job/j-20260910-diff-refusal',
    capMinutes: 30,
    verdict: {
      verdict: 'revise',
      reasons: ['not-worth-reading'],
      notes: 'Address the two requirements the reviewer cited.',
      cites: CITES,
    },
    findings: `not-worth-reading\n\nAddress the two requirements the reviewer cited.\n\n${diffReason}`,
    diffText: 'diff without a requirement heading',
  });
  assert.match(control, new RegExp(`\\*\\*Diff-measured refusal reason\\*\\*\\n\\n${diffReason.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`));
  ctx.cleanup();
});

test('live author and revision brief sizes are measured for one job type', () => {
  const ctx = { repoRoot: DEFAULT_REPO_ROOT };
  const job = { type: TYPE, source: 'queue', title: 'live size measurement', detail: 'measure one live job type' };
  const author = assembleBrief(ctx, {
    jobId: 'j-live-brief-size',
    job,
    branch: 'job/j-live-brief-size',
    capMinutes: 30,
  });
  const revision = assembleRevisionBrief(ctx, {
    jobId: 'j-live-brief-size',
    job,
    branch: 'job/j-live-brief-size',
    capMinutes: 30,
    verdict: { verdict: 'revise', reasons: ['not-worth-reading'], notes: 'Live measurement.', cites: [] },
    findings: 'not-worth-reading\n\nLive measurement.',
    diffText: 'live measurement diff',
  });
  console.log(`live brief measurement; type=${TYPE}; author_chars=${author.length}; revision_chars=${revision.length}; difference=${author.length - revision.length}`);
});
