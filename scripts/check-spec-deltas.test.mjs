/**
 * check-spec-deltas.test.mjs — the pre-archive delta check (beads
 * `addictedtoai-vl9`).
 *
 * Every check has a case that TRIPS it and a control that must PASS. A
 * guardrail that only ever fires is a guardrail nobody can author around, and
 * this one sits in front of the constitution, so a false refusal is as
 * expensive as a missed defect.
 *
 * Three of the fixtures are transcriptions of real 2026-08-31 defects rather
 * than invented prose, because the markers were fitted to them:
 *
 *  - `"Amended in one clause only… the sentence repealed below…"` — the
 *    `record-state-before-anything-reads-it` MODIFIED block that reached
 *    `openspec/specs/pulse/spec.md` and was undone (commit `146b34a`).
 *  - `"curriculum.md in this change"` — the `teach-the-whole-subject` anchor
 *    fixed in `a2a6e00`.
 *  - `card_parameters` — the field renamed to `repository_tensor_total` on
 *    2026-08-29 (`addictedtoai-dyz`) whose stale mentions archived into two
 *    live specs.
 *
 * And one control is a transcription too, for the opposite reason: specs/blog
 * really says a claim may be *"struck through or amended inline"*, which is a
 * rule about corrections and not narration about an edit. The narration markers
 * must not fire on it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ROOT } from '../lib/paths.mjs';
import {
  buildFenceMask,
  parseDeltaSpec,
  parseSpecRequirements,
  narrationHits,
  codeTokens,
  checkDeltas,
  severityOf,
  readLiveChanges,
  readLiveSpecs,
  checkSpecDeltasStep,
} from './check-spec-deltas.mjs';

/* ── fixture builders ────────────────────────────────────────────────────── */

const req = (name, body = 'The gate SHALL refuse an unsourced claim.') =>
  `### Requirement: ${name}\n\n${body}\n\n#### Scenario: It happens\n\n- **WHEN** a claim arrives\n- **THEN** it is refused`;

const liveSpec = (...reqs) =>
  `# demo Specification\n\n## Purpose\nA capability.\n\n## Requirements\n\n${reqs.join('\n\n')}\n`;

/** A delta file. `preamble` is the text ABOVE the first `## …` section. */
function deltaFile({ preamble = '', added = [], modified = [], removed = [], renamed = [] } = {}) {
  const parts = [preamble.trim()].filter(Boolean);
  if (added.length) parts.push(`## ADDED Requirements\n\n${added.join('\n\n')}`);
  if (modified.length) parts.push(`## MODIFIED Requirements\n\n${modified.join('\n\n')}`);
  if (removed.length)
    parts.push(`## REMOVED Requirements\n\n${removed.map((n) => `### Requirement: ${n}`).join('\n\n')}`);
  if (renamed.length)
    parts.push(
      `## RENAMED Requirements\n\n${renamed
        .map(([f, t]) => `- FROM: \`### Requirement: ${f}\`\n- TO: \`### Requirement: ${t}\``)
        .join('\n\n')}`,
    );
  return `${parts.join('\n\n')}\n`;
}

const change = (name, caps) => ({
  name,
  capabilities: Object.entries(caps).map(([id, text]) => ({
    id,
    file: `openspec/changes/${name}/specs/${id}/spec.md`,
    delta: parseDeltaSpec(text),
  })),
});

const specsOf = (caps) =>
  new Map(Object.entries(caps).map(([id, text]) => [id, parseSpecRequirements(text)]));

const rulesOf = (findings) => findings.map((f) => f.rule).sort();

const run = (changes, specs, haystack = null) =>
  checkDeltas({ changes, specs, haystack }).findings;

const GATE = 'The gate refuses an unsourced claim';
const RECORD = 'The gate records what it refused';
const LIVE = specsOf({ demo: liveSpec(req(GATE)) });

/* ── the parser ──────────────────────────────────────────────────────────── */

test('parseDeltaSpec reads all four operations', () => {
  const d = parseDeltaSpec(
    deltaFile({
      added: [req('Added one')],
      modified: [req('Modified one')],
      removed: ['Removed one'],
      renamed: [['Old name', 'New name']],
    }),
  );
  assert.deepEqual(d.added.map((b) => b.name), ['Added one']);
  assert.deepEqual(d.modified.map((b) => b.name), ['Modified one']);
  assert.deepEqual(d.removed.map((r) => r.name), ['Removed one']);
  assert.deepEqual(d.renamed, [{ from: 'Old name', to: 'New name', line: d.renamed[0].line }]);
});

test('a requirement header inside a code fence is not a heading, and outside one it is', () => {
  const fenced = parseDeltaSpec(
    '## ADDED Requirements\n\n```\n### Requirement: Not real\n```\n\n' + req('Real'),
  );
  assert.deepEqual(fenced.added.map((b) => b.name), ['Real'], 'the fenced header must be ignored');

  const unfenced = parseDeltaSpec('## ADDED Requirements\n\n' + req('Not real') + '\n\n' + req('Real'));
  assert.deepEqual(
    unfenced.added.map((b) => b.name),
    ['Not real', 'Real'],
    'the control: identical text outside a fence IS two headings',
  );
});

test('buildFenceMask covers the fence lines and nothing else', () => {
  const mask = buildFenceMask(['a', '```', 'b', '```', 'c']);
  assert.deepEqual(mask, [false, true, true, true, false]);
});

test('parseSpecRequirements reads only what is under ## Requirements', () => {
  const spec =
    '# demo Specification\n\n## Purpose\n\n### Requirement: In the purpose\n\nno.\n\n' +
    '## Requirements\n\n' + req('Real one') + '\n\n## Notes\n\n### Requirement: After the section\n\nno.\n';
  assert.deepEqual([...parseSpecRequirements(spec).keys()], ['Real one']);
});

/* ── check 1: a MODIFIED heading that resolves to nothing ────────────────── */

test('TRIPS: a MODIFIED heading absent from the live spec', () => {
  const f = run([change('c', { demo: deltaFile({ modified: [req('The gate refuses an unsorced claim')] }) })], LIVE);
  assert.deepEqual(rulesOf(f), ['dangling-modified']);
  assert.match(f[0].field, /unsorced/);
  assert.match(f[0].message, /in no live spec/);
});

test('PASSES: a MODIFIED heading the live spec has', () => {
  const f = run([change('c', { demo: deltaFile({ modified: [req(GATE)] }) })], LIVE);
  assert.deepEqual(f, []);
});

test('a near-miss heading is named in the message, so the fix is one edit', () => {
  const f = run([change('c', { demo: deltaFile({ modified: [req(GATE.toUpperCase())] }) })], LIVE);
  assert.deepEqual(rulesOf(f), ['dangling-modified']);
  assert.match(f[0].message, /The live spec spells it "The gate refuses an unsourced claim"/);
});

test('PASSES: a capability with no live spec at all, adding everything', () => {
  const f = run([change('c', { brandnew: deltaFile({ added: [req('First requirement')] }) })], LIVE);
  assert.deepEqual(f, [], 'a new capability is all ADDED and must not be refused');
});

/* ── check 1b: REMOVED and RENAMED, which resolve the same way ───────────── */

test('TRIPS: a REMOVED heading absent from the live spec — the case openspec lets through', () => {
  const f = run([change('c', { demo: deltaFile({ removed: ['Something never written'] }) })], LIVE);
  assert.deepEqual(rulesOf(f), ['dangling-removed']);
  assert.match(
    f[0].message,
    /report success, leaving the requirement standing/,
    'the message must say why this one matters more than the MODIFIED case',
  );
});

test('PASSES: a REMOVED heading the live spec has', () => {
  const f = run([change('c', { demo: deltaFile({ removed: [GATE] }) })], LIVE);
  assert.deepEqual(f, []);
});

test('TRIPS: a RENAMED FROM heading absent from the live spec', () => {
  const f = run([change('c', { demo: deltaFile({ renamed: [['No such requirement', 'New name']] }) })], LIVE);
  assert.deepEqual(rulesOf(f), ['dangling-renamed']);
});

test('PASSES: a RENAMED FROM heading the live spec has', () => {
  const f = run([change('c', { demo: deltaFile({ renamed: [[GATE, 'A clearer name']] }) })], LIVE);
  assert.deepEqual(f, []);
});

/* ── check 2: the cross-change collision ─────────────────────────────────── */

test('TRIPS: two unarchived changes MODIFY the same requirement', () => {
  const f = run(
    [
      change('alpha', { demo: deltaFile({ modified: [req(GATE, 'Alpha body.')] }) }),
      change('beta', { demo: deltaFile({ modified: [req(GATE, 'Beta body.')] }) }),
    ],
    LIVE,
  );
  assert.deepEqual(rulesOf(f), ['collision']);
  assert.match(f[0].message, /'alpha' MODIFIED/);
  assert.match(f[0].message, /'beta' MODIFIED/);
  assert.match(f[0].message, /last-writer-wins/);
});

test('TRIPS: one change MODIFIES what another REMOVES', () => {
  const f = run(
    [
      change('alpha', { demo: deltaFile({ modified: [req(GATE, 'Alpha body.')] }) }),
      change('beta', { demo: deltaFile({ removed: [GATE] }) }),
    ],
    LIVE,
  );
  assert.deepEqual(rulesOf(f), ['collision']);
});

test('PASSES: two changes touching DIFFERENT requirements in the same capability', () => {
  const two = specsOf({ demo: liveSpec(req(GATE), req(RECORD)) });
  const f = run(
    [
      change('alpha', { demo: deltaFile({ modified: [req(GATE, 'Alpha.')] }) }),
      change('beta', { demo: deltaFile({ modified: [req(RECORD, 'Beta.')] }) }),
    ],
    two,
  );
  assert.deepEqual(f, []);
});

test('PASSES: the same requirement NAME in two different capabilities is two requirements', () => {
  const specs = specsOf({ demo: liveSpec(req(GATE)), other: liveSpec(req(GATE)) });
  const f = run(
    [
      change('alpha', { demo: deltaFile({ modified: [req(GATE, 'Alpha.')] }) }),
      change('beta', { other: deltaFile({ modified: [req(GATE, 'Beta.')] }) }),
    ],
    specs,
  );
  assert.deepEqual(f, []);
});

test('PASSES: one change touching the same requirement twice is not two changes', () => {
  const f = run([change('alpha', { demo: deltaFile({ modified: [req(GATE, 'Once.')] }) })], LIVE);
  assert.deepEqual(f, []);
});

/* ── check 2b: the ordering case, which is legitimate ────────────────────── */

test('an ADDED elsewhere makes a dangling MODIFIED an ORDERING fact, not a refusal', () => {
  const f = run(
    [
      change('alpha', { demo: deltaFile({ added: [req(RECORD, 'Alpha adds it.')] }) }),
      change('beta', { demo: deltaFile({ modified: [req(RECORD, 'Beta amends it.')] }) }),
    ],
    LIVE,
  );
  assert.deepEqual(rulesOf(f), ['archive-order']);
  assert.match(f[0].message, /Archive 'alpha' first/);
});

test('an ADDED in the SAME change does not rescue its own dangling MODIFIED', () => {
  const f = run(
    [change('alpha', { demo: deltaFile({ added: [req(RECORD)], modified: [req(RECORD, 'Also amended.')] }) })],
    LIVE,
  );
  assert.deepEqual(rulesOf(f), ['dangling-modified'], 'openspec rejects ADDED+MODIFIED in one delta anyway');
});

test('ADDING what the live spec already has, while another change MODIFIES it, is a collision', () => {
  // The ordering exemption applies only when the requirement is genuinely new.
  // Here it already exists, so `alpha` would abort at archive with "already
  // exists" — the shape must not be waved through as an ordering fact.
  const f = run(
    [
      change('alpha', { demo: deltaFile({ added: [req(GATE, 'Alpha re-adds it.')] }) }),
      change('beta', { demo: deltaFile({ modified: [req(GATE, 'Beta amends it.')] }) }),
    ],
    LIVE,
  );
  assert.deepEqual(rulesOf(f), ['collision']);
  assert.match(f[0].message, /^demo: 2 unarchived changes/, 'the message names the capability');
});

test('two changes ADDING the same new requirement is a collision, not an ordering fact', () => {
  const f = run(
    [
      change('alpha', { demo: deltaFile({ added: [req(RECORD, 'Alpha.')] }) }),
      change('beta', { demo: deltaFile({ added: [req(RECORD, 'Beta.')] }) }),
    ],
    LIVE,
  );
  assert.deepEqual(rulesOf(f), ['collision']);
});

/* ── check 3: change-relative narration ──────────────────────────────────── */

test('TRIPS: the block that actually reached the constitution on 2026-08-31', () => {
  const body =
    'Amended in one clause only, and the rest of the requirement stands: the\n' +
    'sentence repealed below is the one that said the step is skipped entirely.\n\n' +
    'The Pulse SHALL run every step on every run.';
  const hits = narrationHits(body);
  assert.ok(hits.length >= 2, `expected the amendment and the moved-text markers, got ${JSON.stringify(hits)}`);
  assert.ok(hits.some((h) => h.id === 'amendment-narration'));
  assert.ok(hits.some((h) => h.id === 'text-that-moved'));
});

test('TRIPS: the teach-the-whole-subject anchor, "in this change"', () => {
  const hits = narrationHits('The curriculum SHALL be `curriculum.md` in this change.');
  assert.deepEqual([...new Set(hits.map((h) => h.id))].sort(), ['this-change']);
});

test('TRIPS: a bare design.md reference, which archiving moves', () => {
  const hits = narrationHits('The ordering is D8 in `design.md`.');
  assert.deepEqual([...new Set(hits.map((h) => h.id))], ['bare-change-artifact']);
});

test('PASSES: a design.md reference written as a path that survives archiving', () => {
  assert.deepEqual(
    narrationHits('See `openspec/changes/archive/2026-08-30-x/design.md` for the alternatives.'),
    [],
  );
});

test("PASSES: specs/blog's real wording, which uses \"amended\" timelessly", () => {
  assert.deepEqual(
    narrationHits(
      'A correction SHALL be appended and dated (the claim struck through or amended\ninline with the correction referenced), never folded into the body.',
    ),
    [],
  );
});

test('PASSES: design.md inside a fenced example', () => {
  assert.deepEqual(narrationHits('Run this:\n\n```\nopenspec show design.md\n```\n'), []);
});

test("narration in the delta's PREAMBLE is not reported — the preamble is never archived", () => {
  const withPreamble = deltaFile({
    preamble:
      '# demo — delta\n\nThis change amends one clause only: the sentence repealed below is\nthe one that said the step is skipped. See `design.md`.',
    modified: [req(GATE, 'The gate SHALL refuse an unsourced claim, naming the field.')],
  });
  assert.deepEqual(run([change('c', { demo: withPreamble })], LIVE), []);

  const inBody = deltaFile({
    modified: [req(GATE, 'This change amends one clause only. See `design.md`.')],
  });
  assert.deepEqual(
    [...new Set(rulesOf(run([change('c', { demo: inBody })], LIVE)))],
    ['narration'],
    'the control: the identical sentence inside the requirement body IS reported',
  );
});

/* ── check 4: identifiers the tree no longer has ─────────────────────────── */

test('TRIPS: a field renamed out of the tree since the delta was written', () => {
  const d = deltaFile({ modified: [req(GATE, 'The queue SHALL read `card_parameters` from the entry.')] });
  const f = run([change('c', { demo: d })], LIVE, 'const repository_tensor_total = 0;\n');
  assert.deepEqual(rulesOf(f), ['stale-id']);
  assert.match(f[0].message, /`card_parameters` appears nowhere/);
});

test('PASSES: the field under its current name', () => {
  const d = deltaFile({ modified: [req(GATE, 'The queue SHALL read `repository_tensor_total`.')] });
  assert.deepEqual(run([change('c', { demo: d })], LIVE, 'const repository_tensor_total = 0;\n'), []);
});

test('PASSES: backticked prose and flags are not treated as identifiers', () => {
  assert.deepEqual(codeTokens('It SHALL accept `--strict` and `yes` and `a phrase`.'), []);
});

test('codeTokens finds the four shapes it claims to, and skips fenced text', () => {
  assert.deepEqual(
    codeTokens('`snake_case_field` `SCREAMING_CONST` `camelCaseFn()` `lib/units.mjs`').sort(),
    ['SCREAMING_CONST', 'camelCaseFn', 'lib/units.mjs', 'snake_case_field'],
  );
  assert.deepEqual(codeTokens('```\n`fenced_token`\n```\n'), []);
});

test('the stale-identifier scan is skipped entirely when no haystack is supplied', () => {
  const d = deltaFile({ modified: [req(GATE, 'The queue SHALL read `card_parameters`.')] });
  assert.deepEqual(run([change('c', { demo: d })], LIVE, null), []);
});

/* ── severity: the two modes ─────────────────────────────────────────────── */

test('the danglers refuse in both modes; the judgment calls refuse only in strict', () => {
  for (const rule of ['dangling-modified', 'dangling-removed', 'dangling-renamed']) {
    assert.equal(severityOf(rule, false), 'error', rule);
    assert.equal(severityOf(rule, true), 'error', rule);
  }
  for (const rule of ['collision', 'archive-order', 'narration']) {
    assert.equal(severityOf(rule, false), 'warning', rule);
    assert.equal(severityOf(rule, true), 'error', rule);
  }
});

test('stale-id stays advisory in strict mode too — the issue says report, do not block', () => {
  assert.equal(severityOf('stale-id', false), 'warning');
  assert.equal(severityOf('stale-id', true), 'warning');
});

test('an unclassified rule is an error, so a new check cannot be added silently mute', () => {
  assert.equal(severityOf('a-rule-nobody-classified', false), 'error');
});

/* ── the step: measured by calling it, not by reading it ─────────────────── */

function sink() {
  const lines = [];
  return { lines, write: (s) => lines.push(s) };
}

const stepOpts = (changes, specs, extra = {}) => ({
  out: sink(),
  changes,
  specs,
  haystack: null,
  ...extra,
});

test('the step THROWS on a dangling MODIFIED', async () => {
  const opts = stepOpts(
    [change('c', { demo: deltaFile({ modified: [req('No such requirement')] }) })],
    LIVE,
  );
  await assert.rejects(() => checkSpecDeltasStep(opts), /spec-delta error/);
});

test('the step RETURNS on narration alone, and says so in its warnings', async () => {
  const out = sink();
  const res = await checkSpecDeltasStep(
    stepOpts([change('c', { demo: deltaFile({ modified: [req(GATE, 'This change amends it.')] }) })], LIVE, { out }),
  );
  assert.equal(res.errors, 0);
  assert.equal(res.warnings, 1);
  assert.ok(out.lines.some((l) => l.startsWith('warning:') && l.includes('[narration]')));
});

test('the step THROWS on the same narration under --strict', async () => {
  const opts = stepOpts(
    [change('c', { demo: deltaFile({ modified: [req(GATE, 'This change amends it.')] }) })],
    LIVE,
    { strict: true },
  );
  await assert.rejects(() => checkSpecDeltasStep(opts), /spec-delta error/);
});

test('the step RETURNS on a clean tree and reports what it read', async () => {
  const out = sink();
  const res = await checkSpecDeltasStep(
    stepOpts([change('c', { demo: deltaFile({ modified: [req(GATE)] }) })], LIVE, { out }),
  );
  assert.equal(res.errors, 0);
  assert.equal(res.warnings, 0);
  assert.ok(out.lines.some((l) => l.includes('prebuild: spec-deltas — 1 unarchived change(s)')));
});

/* ── reading a tree from disk ────────────────────────────────────────────── */

async function tempTree() {
  const root = await mkdtemp(join(tmpdir(), 'vl9-'));
  const write = async (rel, text) => {
    const full = join(root, ...rel.split('/'));
    await mkdir(join(full, '..'), { recursive: true });
    await writeFile(full, text);
  };
  await write('openspec/specs/demo/spec.md', liveSpec(req(GATE)));
  await write('openspec/changes/live-one/specs/demo/spec.md', deltaFile({ modified: [req(GATE)] }));
  await write(
    'openspec/changes/archive/2026-08-30-old/specs/demo/spec.md',
    deltaFile({ modified: [req('A requirement that no longer exists')] }),
  );
  return root;
}

test('readLiveChanges skips archive/ — the archived copies are a record, not a claim', async () => {
  const root = await tempTree();
  const changes = await readLiveChanges(join(root, 'openspec'));
  assert.deepEqual(changes.map((c) => c.name), ['live-one']);
  assert.deepEqual(changes[0].capabilities.map((c) => c.id), ['demo']);
});

test('readLiveSpecs reads the constitution', async () => {
  const root = await tempTree();
  const specs = await readLiveSpecs(join(root, 'openspec'));
  assert.deepEqual([...specs.keys()], ['demo']);
  assert.deepEqual([...specs.get('demo').keys()], [GATE]);
});

test('the step run end-to-end over a temp tree passes, and would have failed on the archived copy', async () => {
  const root = await tempTree();
  const res = await checkSpecDeltasStep({ out: sink(), root, staleIds: false });
  assert.equal(res.errors, 0);
  assert.equal(res.changes, 1);

  // The control's other half: that same archived delta, read as if it were
  // live, is exactly the defect this check refuses.
  const asLive = await readLiveChanges(join(root, 'openspec'));
  const archived = change('old', {
    demo: deltaFile({ modified: [req('A requirement that no longer exists')] }),
  });
  const f = run([...asLive, archived], await readLiveSpecs(join(root, 'openspec')));
  assert.deepEqual(rulesOf(f), ['dangling-modified']);
});

test('a missing openspec/ directory is zero changes, not a crash', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vl9-'));
  const res = await checkSpecDeltasStep({ out: sink(), root, staleIds: false });
  assert.equal(res.changes, 0);
  assert.equal(res.errors, 0);
});

/* ── the real corpus, lightly ────────────────────────────────────────────── */

// ZERO LIVE CHANGES IS A LEGITIMATE STATE, and this test used to deny it.
//
// It asserted `changes.length > 0` — "expected at least one unarchived change"
// — which is an assertion that the repository always has work in flight. That
// held for as long as it happened to hold, and on 2026-09-01 a batch archive
// emptied `openspec/changes/` and turned a green suite red. Nothing was wrong:
// an empty in-flight set is the DESIRABLE state, the one where the constitution
// and the code have finished disagreeing.
//
// The guard was not pointless — without something, a `readLiveChanges` that
// silently returned [] would make the loop below vacuous and this test would
// pass while measuring nothing. But that is a claim about the LOADER, and the
// loader already has its own positive control: `readLiveChanges skips
// archive/` builds a fixture tree and asserts the exact change names come back.
// Proving it twice, once against a corpus whose contents are supposed to change,
// bought nothing and cost a false failure.
test("this repository's own live deltas parse, and every one carries an operation", async () => {
  const changes = await readLiveChanges(join(ROOT, 'openspec'));
  assert.ok(Array.isArray(changes), 'readLiveChanges must resolve to an array');
  for (const c of changes) {
    for (const cap of c.capabilities) {
      const n =
        cap.delta.added.length + cap.delta.modified.length + cap.delta.removed.length + cap.delta.renamed.length;
      assert.ok(n > 0, `${cap.file} parsed to zero operations`);
    }
  }
});

/* ── check 4b: a token that IS a real path is not stale ───────────────────── */
//
// Measured on the first real run: all three stale-id warnings were FALSE.
// `openspec/curriculum/learn.md`, `loop/lib/health.mjs` and
// `content/wiki/org/moonshot-ai.md` all exist on disk. The haystack answers
// "is this string written down anywhere in the source", which is a different
// question from "does this thing exist" — and a module that nothing references
// BY NAME is the normal case, not the suspicious one. A warning that fires on
// things that plainly exist teaches its reader to skip the whole category.

test('PASSES: a path that exists on disk is not stale, even when nothing names it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'spec-deltas-exists-'));
  await mkdir(join(root, 'lib'), { recursive: true });
  await writeFile(join(root, 'lib', 'health.mjs'), 'export const ok = true;\n', 'utf8');

  const d = deltaFile({ modified: [req(GATE, 'The runner SHALL use `lib/health.mjs`.')] });
  // Haystack deliberately does NOT mention the file: nothing imports it by name.
  const findings = checkDeltas({
    changes: [change('c', { demo: d })],
    specs: LIVE,
    haystack: 'const unrelated = 1;\n',
    root,
  }).findings;
  assert.deepEqual(findings, [], 'the file exists, so the identifier is not stale');
});

test('TRIPS: the control — the same token when the file does NOT exist', async () => {
  const root = await mkdtemp(join(tmpdir(), 'spec-deltas-absent-'));

  const d = deltaFile({ modified: [req(GATE, 'The runner SHALL use `lib/health.mjs`.')] });
  const findings = checkDeltas({
    changes: [change('c', { demo: d })],
    specs: LIVE,
    haystack: 'const unrelated = 1;\n',
    root,
  }).findings;
  assert.deepEqual(rulesOf(findings), ['stale-id'], 'no file and no mention: still stale');
});

test('the existence escape hatch needs a root — without one the scan is unchanged', () => {
  const d = deltaFile({ modified: [req(GATE, 'The runner SHALL use `lib/health.mjs`.')] });
  const findings = checkDeltas({
    changes: [change('c', { demo: d })],
    specs: LIVE,
    haystack: 'const unrelated = 1;\n',
  }).findings;
  assert.deepEqual(rulesOf(findings), ['stale-id'], 'root defaults to null and nothing resolves');
});
