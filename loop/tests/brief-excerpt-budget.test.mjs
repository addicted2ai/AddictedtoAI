/**
 * The excerpt budget is a bound on a brief's named requirements, not a
 * per-source allowance and not a reason to quote unrelated sections.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { assembleBrief } from '../lib/brief.mjs';
import { excerptsFor, SPECS_FOR_TYPE } from '../lib/specs.mjs';
import { BRIEF_EXCERPT_MAX_CHARS, JOB_TYPES } from '../lib/config.mjs';
import { DEFAULT_REPO_ROOT } from '../lib/paths.mjs';
import { makeRepo } from './helpers.mjs';
import { join } from 'node:path';

const CUT_MARKER = /\[\.\.\. CUT:/g;
const countCuts = (text) => (text.match(CUT_MARKER) || []).length;
const PENDING_ROOT = 'fixture-amendments';
const ALL_CAPABILITIES = [...new Set(JOB_TYPES.flatMap((type) => SPECS_FOR_TYPE[type] ?? []))];
const KEYWORD_RICH = [
  'interpret change annotation material diff history',
  'verify stale demotion freshness re-verification',
  'entry fact alias transclusion stub source',
  'tutorial perishable post ceiling correction claim',
  'education ladder prerequisite link broken refusal repair',
  'machinery reserved breaker budget portability result protocol',
  'scout outward proposal expires candidate worth reading prune bar',
].join(' ');

function bigRequirement(heading, chars, marker = '', prefix = '') {
  const filler = 'ordinary requirement text that carries no extra selection signal. ';
  let body = prefix + KEYWORD_RICH;
  while (body.length < chars) body += filler;
  if (marker) {
    const tail = `\n${marker}`;
    body = `${body.slice(0, Math.max(0, chars - tail.length))}${tail}`;
  } else {
    body = body.slice(0, chars);
  }
  return `### Requirement: ${heading}\n\n${body}\n`;
}

function unrelatedRequirement(heading) {
  return `### Requirement: ${heading}\n\nThis section is outside the named set.\n`;
}

function specText(cap, { mainChars = 1200, extras = 0 } = {}) {
  const extraText = Array.from({ length: extras }, (_, i) =>
    bigRequirement(`${cap} surplus matching rule ${i + 1}`, 2300),
  ).join('\n');
  return [
    `# ${cap}`,
    bigRequirement(`${cap} governing rule`, mainChars, `END-${cap}`),
    extraText,
    unrelatedRequirement('unrelated constitution section'),
  ].filter(Boolean).join('\n\n') + '\n';
}

function fixtureRepo(files) {
  const ctx = makeRepo({ files });
  ctx.pendingRoot = join(ctx.repoRoot, PENDING_ROOT);
  return ctx;
}

function pinnedCorpus() {
  const files = {};
  for (const cap of ALL_CAPABILITIES) {
    files[`openspec/specs/${cap}/spec.md`] = specText(cap, {
      mainChars: cap === 'pulse' ? 7000 : 1200,
      extras: cap === 'pulse' ? 3 : 0,
    });
  }
  for (const change of ['one', 'two', 'three']) {
    for (const cap of ALL_CAPABILITIES) {
      files[`${PENDING_ROOT}/${change}/specs/${cap}/spec.md`] =
        `# pending amendment\n\n${unrelatedRequirement('unrelated pending section')}`;
    }
  }
  return fixtureRepo(files);
}

function allocationCorpus() {
  const files = {};
  for (const cap of ['pulse', 'site', 'review']) {
    files[`openspec/specs/${cap}/spec.md`] = specText(cap, { mainChars: 6500 });
  }
  for (const change of ['one', 'two', 'three']) {
    for (const cap of ['pulse', 'site', 'review']) {
      files[`${PENDING_ROOT}/${change}/specs/${cap}/spec.md`] =
        `# pending ${cap}\n\n${bigRequirement(`${cap} governing rule`, 1800)}`;
    }
  }
  return fixtureRepo(files);
}

function ceilingCorpus() {
  const files = {
    'openspec/specs/pulse/spec.md': specText('pulse', { mainChars: 15900 }),
  };
  for (const change of ['one', 'two', 'three']) {
    files[`${PENDING_ROOT}/${change}/specs/pulse/spec.md`] =
      `# pending pulse\n\n${bigRequirement('pulse governing rule', 10000)}`;
  }
  return fixtureRepo(files);
}

function surplusCorpus() {
  const files = {
    'openspec/specs/pulse/spec.md': specText('pulse', { mainChars: 5000 }),
    'openspec/specs/site/spec.md': specText('site', { mainChars: 900 }),
    'openspec/specs/review/spec.md': specText('review', { mainChars: 900 }),
  };
  for (const change of ['one', 'two', 'three']) {
    files[`${PENDING_ROOT}/${change}/specs/pulse/spec.md`] =
      `# pending pulse\n\n${bigRequirement('pulse surplus pending rule', 6000)}`;
  }
  return fixtureRepo(files);
}

function tightCapCorpus() {
  return makeRepo({
    files: {
      'openspec/specs/pulse/spec.md': `# pulse\n\n${bigRequirement('pulse governing rule', 9000, '', 'PULSE_FIRST_CONTENT\n')}`,
      'openspec/specs/site/spec.md': `# site\n\n${bigRequirement('site governing rule', 9000, '', 'SITE_LATER_CONTENT\n')}`,
      'openspec/specs/review/spec.md': `# review\n\n${bigRequirement('review governing rule', 9000, '', 'REVIEW_LATER_CONTENT\n')}`,
    },
  });
}

function assembled(ctx, type, extraJob = {}) {
  return assembleBrief(ctx, {
    jobId: 'j-20260908-99',
    job: { type, source: 'queue', title: `a ${type} job`, detail: 'the stated outcome', ...extraJob },
    branch: 'job/j-20260908-99',
    capMinutes: 60,
  });
}

test('a small source set still cuts a named requirement at the old default', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/editorial/spec.md': `# editorial\n\n${bigRequirement('prune first rule', 7500)}`,
      'openspec/specs/review/spec.md': `# review\n\n${bigRequirement('prune review rule', 7500)}`,
    },
  });
  const ex = excerptsFor(ctx.repoRoot, 'prune', { maxChars: 14000 });
  assert.ok(countCuts(ex.text) >= 1, 'the old ceiling must exercise a cut');
  ctx.cleanup();
});

test('assembleBrief passes the configured total budget', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/editorial/spec.md': `# editorial\n\n${bigRequirement('prune first rule', 7500)}`,
      'openspec/specs/review/spec.md': `# review\n\n${bigRequirement('prune review rule', 7500)}`,
    },
  });
  assert.equal(countCuts(assembled(ctx, 'prune')), 0);
  ctx.cleanup();
});

test('assembleBrief does not fall back to excerptsFor default', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/editorial/spec.md': `# editorial\n\n${bigRequirement('prune first rule', 7500)}`,
      'openspec/specs/review/spec.md': `# review\n\n${bigRequirement('prune review rule', 7500)}`,
    },
  });
  assert.ok(countCuts(excerptsFor(ctx.repoRoot, 'prune').text) >= 1);
  assert.equal(countCuts(assembled(ctx, 'prune')), 0);
  ctx.cleanup();
});

test('the excerpt ceiling is the measured 24,000-character value', () => {
  assert.equal(BRIEF_EXCERPT_MAX_CHARS, 24000);
});

test('declared subject capabilities follow the governing capabilities', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/editorial/spec.md': specText('editorial'),
      'openspec/specs/review/spec.md': specText('review'),
      'openspec/specs/site/spec.md': specText('site'),
    },
  });
  const without = excerptsFor(ctx.repoRoot, 'prune');
  const withSubject = excerptsFor(ctx.repoRoot, 'prune', { subjects: ['site'] });
  const withPathOverload = excerptsFor(
    ctx.repoRoot,
    'prune',
    ['.\\openspec\\specs\\site\\spec.md'],
    { maxChars: 24000 },
  );
  assert.doesNotMatch(without.text, /specs\/site/);
  assert.match(withSubject.text, /specs\/site/);
  assert.match(withPathOverload.text, /specs\/site/);
  assert.ok(withSubject.text.indexOf('specs/editorial') < withSubject.text.indexOf('specs/site'));
  ctx.cleanup();
});

test('Stage 0 passes no job-field fallback as a subject list', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/editorial/spec.md': specText('editorial'),
      'openspec/specs/review/spec.md': specText('review'),
      'openspec/specs/site/spec.md': specText('site'),
    },
  });
  const brief = assembled(ctx, 'prune', {
    subjects: ['site'],
    declared_subjects: ['site'],
    raw: { subjects: ['site'], declared_subjects: ['site'], subject: 'site' },
    target: 'site',
    id: 'site',
  });
  assert.doesNotMatch(brief, /### From `specs\/site`/);
  ctx.cleanup();
});

test('a zero-score pending section is not admitted as a named requirement', () => {
  const ctx = fixtureRepo({
    'openspec/specs/review/spec.md': '# review\n\n' + unrelatedRequirement('unrelated constitution'),
    [`${PENDING_ROOT}/one/specs/review/spec.md`]:
      '# pending review\n\n' + unrelatedRequirement('unrelated pending'),
  });
  const ex = excerptsFor(ctx.repoRoot, 'repair', { maxChars: 24000, pendingRoot: ctx.pendingRoot });
  assert.doesNotMatch(ex.text, /unrelated/);
  ctx.cleanup();
});

test('a positive pending section without a constitutional heading is not emitted', () => {
  const ctx = fixtureRepo({
    'openspec/specs/review/spec.md': '# review\n\n' + unrelatedRequirement('unrelated constitution'),
    [`${PENDING_ROOT}/one/specs/review/spec.md`]:
      '# pending review\n\n' + bigRequirement('repair-only pending rule', 500),
  });
  const ex = excerptsFor(ctx.repoRoot, 'repair', { maxChars: 24000, pendingRoot: ctx.pendingRoot });
  assert.equal(ex.text, '');
  assert.equal(ex.truncated, true);
  assert.doesNotMatch(ex.text, /PENDING AMENDMENT/);
  ctx.cleanup();
});

test('three pending changes do not change the whole named heading set', () => {
  const withChanges = pinnedCorpus();
  const zeroChanges = makeRepo({
    files: Object.fromEntries(
      ALL_CAPABILITIES.map((cap) => [`openspec/specs/${cap}/spec.md`, specText(cap, {
        mainChars: cap === 'pulse' ? 7000 : 1200,
        extras: cap === 'pulse' ? 3 : 0,
      })]),
    ),
  });
  const headings = (text) => [...text.matchAll(/^### Requirement: (.+)$/gm)].map((m) => m[1]);
  const changed = excerptsFor(withChanges.repoRoot, 'repair', {
    maxChars: 24000,
    pendingRoot: withChanges.pendingRoot,
  });
  const zero = excerptsFor(zeroChanges.repoRoot, 'repair', { maxChars: 24000 });
  assert.deepEqual(headings(changed.text), headings(zero.text));
  assert.doesNotMatch(changed.text, /unrelated/);
  assert.match(changed.text, /pulse governing rule/);
  assert.match(changed.text, /END-pulse/);
  withChanges.cleanup();
  zeroChanges.cleanup();
});

test('the pinned repair brief stays under the 30,000-character artifact bound', () => {
  const ctx = pinnedCorpus();
  const brief = assembled(ctx, 'repair');
  assert.ok(brief.length <= 30000, `fixture brief is ${brief.length} characters`);
  ctx.cleanup();
});

test('the binding fixture is the artifact bound, not a live-tree assertion', () => {
  const ctx = ceilingCorpus();
  const brief = assembled(ctx, 'repair');
  assert.match(brief, /PENDING AMENDMENT/);
  assert.match(brief, /CUT: requirement "pulse governing rule"/);
  assert.ok(brief.length <= 30000, `fixture brief is ${brief.length} characters`);
  ctx.cleanup();
});

test('surplus pending requirements do not change the whole excerpt set', () => {
  const withChanges = surplusCorpus();
  const zeroChanges = makeRepo({
    files: {
      'openspec/specs/pulse/spec.md': specText('pulse', { mainChars: 5000 }),
      'openspec/specs/site/spec.md': specText('site', { mainChars: 900 }),
      'openspec/specs/review/spec.md': specText('review', { mainChars: 900 }),
    },
  });
  const headings = (text) => [...text.matchAll(/^### Requirement: (.+)$/gm)].map((m) => m[1]);
  const changed = excerptsFor(withChanges.repoRoot, 'repair', {
    maxChars: 24000,
    pendingRoot: withChanges.pendingRoot,
  });
  const zero = excerptsFor(zeroChanges.repoRoot, 'repair', { maxChars: 24000 });
  assert.deepEqual(headings(changed.text), headings(zero.text));
  assert.doesNotMatch(changed.text, /surplus pending/);
  withChanges.cleanup();
  zeroChanges.cleanup();
});

test('the surplus fixture remains within the assembled-brief bound', () => {
  const ctx = surplusCorpus();
  const brief = assembled(ctx, 'repair');
  assert.ok(brief.length <= 30000, `fixture brief is ${brief.length} characters`);
  ctx.cleanup();
});

test('the excerpt result returns every constitution and pending source in files', () => {
  const ctx = pinnedCorpus();
  const ex = excerptsFor(ctx.repoRoot, 'repair', { maxChars: 24000, pendingRoot: ctx.pendingRoot });
  assert.equal(ex.files.length, 12);
  assert.equal(new Set(ex.files).size, 12);
  assert.ok(ex.files.some((file) => file.replace(/\\/g, '/').endsWith(`${PENDING_ROOT}/one/specs/pulse/spec.md`)));
  assert.ok(ex.files.some((file) => file.replace(/\\/g, '/').endsWith('openspec/specs/review/spec.md')));
  ctx.cleanup();
});

test('the pinned corpus has a constitution source for every job type capability', () => {
  const ctx = pinnedCorpus();
  for (const type of JOB_TYPES) {
    const ex = excerptsFor(ctx.repoRoot, type, { maxChars: 24000, pendingRoot: ctx.pendingRoot });
    for (const cap of SPECS_FOR_TYPE[type]) {
      assert.match(ex.text, new RegExp(`specs/${cap}`), `${type} is missing ${cap}`);
    }
    assert.equal(countCuts(assembled(ctx, type)), 0, `${type} contains a cut`);
  }
  ctx.cleanup();
});

test('the constitution floor survives three pending amendments', () => {
  const ctx = allocationCorpus();
  const ex = excerptsFor(ctx.repoRoot, 'repair', { maxChars: 24000, pendingRoot: ctx.pendingRoot });
  assert.ok(ex.chars <= 24000);
  for (const cap of ['pulse', 'site', 'review']) {
    assert.match(ex.text, new RegExp(`END-${cap}`));
  }
  ctx.cleanup();
});

test('a tight cap keeps every constitution marker in priority order', () => {
  const ctx = tightCapCorpus();
  const ex = excerptsFor(ctx.repoRoot, 'repair', { maxChars: 600 });
  assert.equal(countCuts(ex.text), 3, ex.text);
  const markers = ['pulse governing rule', 'site governing rule', 'review governing rule'];
  const positions = markers.map((heading) => ex.text.indexOf(`CUT: requirement "${heading}"`));
  assert.ok(positions.every((position) => position >= 0), ex.text);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(ex.text.slice(0, positions[0]), /PULSE_FIRST_CONTENT/);
  assert.ok(ex.text.indexOf('### From `specs/pulse`') < ex.text.indexOf('### From `specs/site`'));
  assert.ok(ex.text.indexOf('### From `specs/site`') < ex.text.indexOf('### From `specs/review`'));
  assert.ok(ex.chars <= 600);
  ctx.cleanup();
});

test('a cap below the constitution marker minimum fails with its shortfall', () => {
  const ctx = tightCapCorpus();
  assert.throws(
    () => excerptsFor(ctx.repoRoot, 'repair', { maxChars: 1 }),
    /excerpt configuration error: marker shortfall=\d+.*pulse governing rule.*site governing rule.*review governing rule/,
  );
  ctx.cleanup();
});

test('a bounded excerpt tells the executor that relevant material was omitted or cut', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/editorial/spec.md': `# editorial\n\n${bigRequirement('prune first rule', 16000)}`,
      'openspec/specs/review/spec.md': `# review\n\n${bigRequirement('prune review rule', 12000)}`,
    },
  });
  const text = assembled(ctx, 'prune');
  assert.match(text, /relevant material was omitted or cut/);
  assert.doesNotMatch(text, /targeted and truncated/);
  ctx.cleanup();
});

test('truncation is reported while empty source chunks are filtered from output', () => {
  const ctx = fixtureRepo({
    'openspec/specs/review/spec.md': '# review\n\n' + unrelatedRequirement('unrelated constitution'),
    [`${PENDING_ROOT}/one/specs/review/spec.md`]:
      '# pending review\n\n' + bigRequirement('repair-only pending rule', 500),
  });
  const ex = excerptsFor(ctx.repoRoot, 'repair', { maxChars: 24000, pendingRoot: ctx.pendingRoot });
  assert.equal(ex.truncated, true);
  assert.equal(ex.text, '');
  ctx.cleanup();
});

test('the live tree measurement prints size and cuts for every job type', () => {
  const ctx = { repoRoot: DEFAULT_REPO_ROOT };
  const measurements = [];
  const cutTypes = [];
  for (const type of JOB_TYPES) {
    const text = assembled(ctx, type);
    measurements.push(`${type}: brief_chars=${text.length}`);
    if (countCuts(text) > 0) cutTypes.push(type);
  }
  const largest = Math.max(...measurements.map((line) => Number(line.match(/=(\d+)$/)[1])));
  console.log(`live brief measurements; largest=${largest}; cut_types=${cutTypes.join(',') || 'none'}`);
  console.log(measurements.join('\n'));
});
