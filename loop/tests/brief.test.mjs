/**
 * Task 12 — revision briefs carry the cited requirements and no padding.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';

import { assembleBrief, assembleRevisionBrief } from '../lib/brief.mjs';
import { excerptsFor, SPECS_FOR_TYPE } from '../lib/specs.mjs';
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

function requirement(heading, chars) {
  let body = `repair evidence for ${heading}. `;
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
      `# pending pulse\n\n${requirement(CITED_GOVERNING, 2200)}`,
  };
}

function headingSet(text) {
  return new Set([...text.matchAll(/^### Requirement:\s*(.+)$/gm)].map((match) => match[1].trim()));
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
