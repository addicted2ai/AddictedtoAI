/**
 * schema.test.mjs — tasks 2.1 and 2.2.
 *
 * Every assertion here is about what the build *does* when handed a bad file,
 * observed by running the real build over a real fixture corpus. None of it
 * is about what the schema was meant to reject.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { z } from 'zod';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';
import { DOMAINS, FRONTIER_REASONS } from './domains.mjs';
import {
  KINDS,
  NON_PROSE_FIELDS,
  PROSE_FIELDS,
  SCHEMAS,
  TOOL_CATEGORIES,
  assertFieldsClassified,
  classificationProblems,
  stringFieldPaths,
  validateFrontMatter,
} from './schema.mjs';

test('2.1 a valid corpus of all five content types builds clean', async () => {
  const site = await buildFixture('corpus');
  assert.equal(site.diags.errors.length, 0);
  assert.equal(site.corpus.entry.length, 3);
  assert.equal(site.corpus.learn.length, 2);
  assert.equal(site.corpus.tutorial.length, 1);
  assert.equal(site.corpus.post.length, 1);
  assert.equal(site.corpus.tool.length, 1);
});

test('2.1 a cited fact with no source_url or accessed date fails, naming file and field', async () => {
  const err = await buildFixtureExpectingFailure('bad/schema-missing-source');
  assert.match(err.message, /wiki[/\\]model[/\\]no-source\.md/);
  assert.match(err.message, /facts\[0\]\.source_url/);
  assert.match(err.message, /facts\[0\]\.accessed/);
});

test('2.2 a kind outside the closed list fails, naming the file and the invalid kind', async () => {
  const err = await buildFixtureExpectingFailure('bad/unknown-kind');
  assert.match(err.message, /wiki[/\\]person[/\\]somebody\.md/);
  assert.match(err.message, /kind/);
  assert.match(err.message, /invalid kind "person"/);
  // The message must show the reader what IS allowed, not only what is not.
  for (const kind of KINDS) assert.ok(err.message.includes(kind), `names ${kind}`);
});

test('2.2 a duplicated id fails, naming both file paths and the colliding id', async () => {
  const err = await buildFixtureExpectingFailure('bad/duplicate-id');
  assert.match(err.message, /duplicate entry id "model\/alpha"/);
  assert.match(err.message, /alpha-copy\.md/);
  assert.match(err.message, /alpha\.md/);
});

test('2.2 a non-kebab-case id fails, naming the file and the id', async () => {
  const err = await buildFixtureExpectingFailure('bad/bad-id-format');
  assert.match(err.message, /wiki[/\\]model[/\\]bad-id\.md/);
  assert.match(err.message, /id:/);
  assert.match(err.message, /kebab-case/);
});

test('2.1 an unknown front-matter key is an error, not a silent drop', () => {
  const res = validateFrontMatter('post', {
    title: 'x',
    date: '2026-01-01',
    mention: ['model/x'], // typo for `mentions`
  });
  assert.equal(res.ok, false);
  const msg = res.issues.map((i) => i.message).join('\n');
  assert.match(msg, /unknown front-matter key\(s\): mention/);
});

test('2.1 tutorial perishables: every subject needs a verified_against version', async () => {
  const res = validateFrontMatter('tutorial', {
    title: 'x',
    subjects: ['tool/a'],
    verified_on: '2026-08-01',
  });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.field === 'verified_against'));
});

test('2.1 a learn page must declare level, outcome and prerequisites', () => {
  const res = validateFrontMatter('learn', { title: 'x' });
  assert.equal(res.ok, false);
  const fields = res.issues.map((i) => i.field);
  assert.ok(fields.includes('level'));
  assert.ok(fields.includes('outcome'));
});

test('2.1 a learn outcome that cannot stand alone as a sentence is rejected', () => {
  // The two shapes that collided with the page's label in the live tree.
  const base = { title: 'x', level: 'orientation', prerequisites: [], mentions: [] };

  const stem = validateFrontMatter('learn', {
    ...base,
    outcome: 'be able to follow the arithmetic of one attention head',
  });
  assert.equal(stem.ok, false, 'a bare verb phrase is not a sentence');
  assert.match(
    stem.issues.find((i) => i.field === 'outcome').message,
    /complete sentence on its own/,
  );

  const restated = validateFrontMatter('learn', {
    ...base,
    outcome: 'After this you will be able to trace a token from input to output.',
  });
  assert.equal(restated.ok, false, 'and it must not restate the label');
  assert.match(
    restated.issues.find((i) => i.field === 'outcome').message,
    /must not restate the "After this page:" label/,
  );

  const good = validateFrontMatter('learn', {
    ...base,
    outcome: 'You can trace a token from input to output.',
  });
  assert.equal(good.ok, true, 'a self-contained sentence passes');
});

test('2.1 a tool listing must declare url, pricing, last_verified, its entry link and a category', () => {
  const res = validateFrontMatter('tool', { title: 'x' });
  assert.equal(res.ok, false);
  const fields = res.issues.map((i) => i.field);
  for (const f of ['url', 'pricing', 'last_verified', 'entry', 'category']) {
    assert.ok(fields.includes(f), `reports missing ${f}`);
  }
});

// ── 0eg the closed tool-category list (specs/directory) ──────────────────

/** A listing that is valid apart from whatever the caller overrides. */
const listing = (overrides = {}) => ({
  title: 'Some Tool',
  url: 'https://example.org/some-tool',
  pricing: 'free, open source',
  last_verified: '2026-08-28',
  entry: 'tool/some-tool',
  category: 'coding',
  mentions: [],
  ...overrides,
});

test('0eg a listing carrying a category from the closed list validates', () => {
  const res = validateFrontMatter('tool', listing());
  assert.equal(res.ok, true, JSON.stringify(res.issues ?? []));

  // And every declared category really is accepted — a closed list whose own
  // members are rejected would pass a single-value spot check.
  for (const category of TOOL_CATEGORIES) {
    assert.equal(
      validateFrontMatter('tool', listing({ category })).ok,
      true,
      `${category} is accepted`,
    );
  }
});

test('0eg a category outside the closed list is rejected, naming the value and the alternatives', () => {
  const res = validateFrontMatter('tool', listing({ category: 'seo' }));
  assert.equal(res.ok, false, 'an unknown category must not parse cleanly');
  const issue = res.issues.find((i) => i.field === 'category');
  assert.ok(issue, 'the issue names the offending field');
  assert.match(issue.message, /invalid tool category "seo"/, 'and echoes the value');
  // The reader of this message is a weak model at 2am: it must say what IS
  // allowed, not only what is not.
  for (const category of TOOL_CATEGORIES) {
    assert.ok(issue.message.includes(category), `names ${category}`);
  }
});

test('0eg a missing category is rejected — there is no default and no catch-all', () => {
  const bare = listing();
  delete bare.category;
  const res = validateFrontMatter('tool', bare);
  assert.equal(res.ok, false, 'a listing with no category must not build');
  const issue = res.issues.find((i) => i.field === 'category');
  assert.ok(issue, 'and the failure names the field');
  assert.match(issue.message, /required field is missing/);
});

test('0eg an unknown category stops the REAL build, naming the file and the value', async () => {
  const err = await buildFixtureExpectingFailure('bad/unknown-tool-category');
  assert.match(err.message, /directory[/\\]tools[/\\]miscategorised\.md/, 'names the file');
  assert.match(err.message, /category/, 'names the field');
  assert.match(err.message, /invalid tool category "seo"/, 'names the invalid value');
});

test('0eg the closed list itself is well formed, and the new field is classified', () => {
  assert.ok(TOOL_CATEGORIES.length > 0);
  assert.equal(new Set(TOOL_CATEGORIES).size, TOOL_CATEGORIES.length, 'no duplicates');
  for (const category of TOOL_CATEGORIES) {
    assert.match(category, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${category} is kebab-case`);
  }
  // The classification walk must actually SEE the new string field — otherwise
  // `assertFieldsClassified()` returning clean says nothing about it.
  assert.ok(
    stringFieldPaths(SCHEMAS.tool).includes('category'),
    'tool.category is walked as a string-valued field',
  );
  assert.equal(NON_PROSE_FIELDS.tool.category, 'a closed-list value');
  assert.deepEqual(classificationProblems(), [], 'and the whole classification stays exhaustive');
});

test('2.1 a post must carry a date', () => {
  const res = validateFrontMatter('post', { title: 'x' });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.field === 'date'));
});

// ── corroborates: the declared join (specs/wiki, addictedtoai-473) ────────

/** An entry with one feed-bound and one cited fact, both measuring parameters. */
function pairEntry(overrides = {}) {
  return {
    id: 'model/pair',
    kind: 'model',
    display_name: 'Pair',
    status: 'active',
    maintenance: 'stable',
    aliases: [{ name: 'Pair', class: 'exclusive' }],
    feeds: { openrouter: 'vendor/pair' },
    facts: [
      { field: 'parameters', source: 'feed', feed: 'openrouter', path: 'parameters', volatility: 'slow' },
      {
        field: 'card_parameters',
        source: 'cited',
        value: '304B params',
        source_url: 'https://example.com/card',
        accessed: '2026-08-28',
        volatility: 'static',
        corroborates: 'parameters',
      },
    ],
    timeline: [],
    mentions: [],
    ...overrides,
  };
}

test('corroborates: a declared pair binds on both fact variants', () => {
  const cited = validateFrontMatter('entry', pairEntry());
  assert.equal(cited.ok, true, JSON.stringify(cited.issues));

  // The declaration is legal from either side — the feed-bound fact may name
  // the cited one just as well.
  const fromFeed = pairEntry();
  delete fromFeed.facts[1].corroborates;
  fromFeed.facts[0].corroborates = 'card_parameters';
  assert.equal(validateFrontMatter('entry', fromFeed).ok, true);
});

test('corroborates: a value that is not a snake_case field name is rejected', () => {
  const bad = pairEntry();
  bad.facts[1].corroborates = 'Parameters Total';
  const res = validateFrontMatter('entry', bad);
  assert.equal(res.ok, false);
  assert.equal(res.issues[0].field, 'facts[1].corroborates');
});

test('corroborates: naming a field the entry does not declare fails, naming entry and field', () => {
  const bad = pairEntry();
  bad.facts[1].corroborates = 'params_total';
  const res = validateFrontMatter('entry', bad);
  assert.equal(res.ok, false);
  const issue = res.issues.find((i) => i.field === 'facts[1].corroborates');
  assert.ok(issue, 'the issue names the offending fact');
  assert.match(issue.message, /model\/pair/, 'names the entry');
  assert.match(issue.message, /card_parameters/, 'names the declaring fact');
  assert.match(issue.message, /params_total/, 'names the field it could not find');
  // A weak model at 2am needs to be told what IS on the entry.
  assert.match(issue.message, /"parameters"/, 'lists the facts the entry does declare');
});

test('corroborates: a fact naming itself fails', () => {
  const bad = pairEntry();
  bad.facts[1].corroborates = 'card_parameters';
  const res = validateFrontMatter('entry', bad);
  assert.equal(res.ok, false);
  const issue = res.issues.find((i) => i.field === 'facts[1].corroborates');
  assert.match(issue.message, /which is itself/);
  assert.match(issue.message, /model\/pair/);
});

test('corroborates: a dangling declaration stops the real build, naming the file', async () => {
  const err = await buildFixtureExpectingFailure('bad/corroborates-names-nothing');
  assert.match(err.message, /wiki[/\\]model[/\\]dangling\.md/);
  assert.match(err.message, /facts\[0\]\.corroborates/);
  assert.match(err.message, /model\/dangling/);
  assert.match(err.message, /parameters/);
});

test('corroborates: a self-referencing declaration stops the real build', async () => {
  const err = await buildFixtureExpectingFailure('bad/corroborates-itself');
  assert.match(err.message, /wiki[/\\]model[/\\]self\.md/);
  assert.match(err.message, /which is itself/);
});

// ---------------------------------------------------------------------------
// beads addictedtoai-48r — the exhaustiveness rule. The scan reaching front
// matter is the consequence; THIS is the mechanism: a string-valued field
// cannot arrive in a schema unclassified, which is the vector by which the
// blind spot re-opens.
// ---------------------------------------------------------------------------

/** Everything the classification cares about, injectable for the failure cases. */
const classify = (schemas, prose = {}, nonProse = {}) => ({ schemas, prose, nonProse });

/** Run and return the throw. "The guardrail did not fire" is never a pass. */
function thrown(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('expected a throw, and nothing was thrown');
}

test('48r every string-valued field of every real schema is classified, in one place', () => {
  assert.deepEqual(classificationProblems(), [], 'today\u2019s six schemas are exhaustively classified');
  assert.equal(assertFieldsClassified(), true);

  // And the walk is really finding fields, so an empty problem list is not the
  // result of an empty inventory.
  const entryFields = stringFieldPaths(SCHEMAS.entry);
  assert.ok(entryFields.length >= 20, `${entryFields.length} string fields on entry`);
  assert.ok(entryFields.includes('facts[].value'), 'a union branch counts once, at its own path');
  assert.ok(entryFields.includes('aliases[].name'), 'nested array objects are walked');
  assert.ok(entryFields.includes('feeds.*'), 'record values are walked');
  assert.ok(!entryFields.includes('facts[].value|0'), 'a union does not fork the path');
});

test('48r a new string field that is classified nowhere fails, naming the field', () => {
  const one = z.object({ title: z.string(), tagline: z.string() }).strict();
  const err = thrown(() =>
    assertFieldsClassified(classify({ learn: one }, { learn: [] }, { learn: { title: 'a name' } })),
  );
  assert.match(err.message, /learn\.tagline/, 'the offending field is named');
  assert.match(err.message, /PROSE_FIELDS/);
  assert.match(err.message, /NON_PROSE_FIELDS/);

  // Every offender is named, never only the first — the same discipline as the
  // rest of the build's diagnostics.
  const two = z.object({ title: z.string(), tagline: z.string(), blurb: z.string() }).strict();
  const both = thrown(() =>
    assertFieldsClassified(classify({ learn: two }, { learn: [] }, { learn: { title: 'a name' } })),
  );
  assert.match(both.message, /learn\.tagline/);
  assert.match(both.message, /learn\.blurb/);
  assert.match(both.message, /^2 unclassified/);
});

test('48r a field in BOTH lists fails — a classification that says nothing', () => {
  const s = { learn: z.object({ outcome: z.string() }).strict() };
  const clash = classificationProblems(
    classify(s, { learn: ['outcome'] }, { learn: { outcome: 'a name' } }),
  );
  assert.equal(clash.length, 1);
  assert.match(clash[0], /learn\.outcome is in BOTH/);
  // The same schema classified once is clean, so the failure is about the
  // double listing and not about the fixture.
  assert.deepEqual(classificationProblems(classify(s, { learn: ['outcome'] })), []);
});

test('48r a classification that has stopped describing its schema fails too', () => {
  // Not required by the spec clause, and reported for the same reason: a stale
  // entry is a classification that has quietly stopped covering the schema,
  // which is indistinguishable from covering it until someone looks.
  const stale = classificationProblems(
    classify({ delta: z.object({ title: z.string() }).strict() }, {}, { delta: { title: 'a name', capability: 'x' } }),
  );
  assert.equal(stale.length, 1);
  assert.match(stale[0], /delta\.capability/);
  assert.match(stale[0], /not a string-valued field of that schema any more/);
});

test('48r the classification gate stops the REAL build, not only the unit', async () => {
  // A corpus that is otherwise perfectly valid still fails, because the claim
  // is about the schemas rather than about any document.
  const err = await buildFixtureExpectingFailure('corpus', {
    classification: classify(
      { learn: z.object({ title: z.string(), tagline: z.string() }).strict() },
      { learn: [] },
      { learn: { title: 'a name' } },
    ),
  });
  assert.match(err.message, /learn\.tagline/);
});

test('48r the two lists are frozen and every non-prose field states a reason', () => {
  assert.ok(Object.isFrozen(PROSE_FIELDS) && Object.isFrozen(NON_PROSE_FIELDS));
  for (const type of Object.keys(SCHEMAS)) {
    for (const [path, why] of Object.entries(NON_PROSE_FIELDS[type] ?? {})) {
      assert.equal(typeof why, 'string', `${type}.${path}`);
      assert.ok(why.trim().length > 3, `${type}.${path} states why it is not prose`);
    }
  }
});

// ── the frontier flag (flag-what-moved-the-frontier, tasks 3-5) ────────────
//
// The gate is: `frontier: true` with no `frontier_reason`, a `frontier_reason`
// outside F1-F5, or any `domains` value outside the closed vocabulary. Each
// refusal below is paired with the control that makes it mean something — a
// gate that refused everything would pass every refusal test in this block and
// be worse than no gate, because it would make the flag unusable while looking
// enforced. The K46 control is the load-bearing one: an ABSENT or EMPTY
// `domains` is not a defect, flagged or not, because absence IS the
// vocabulary's unmarked "general", and a gate that fails a record for carrying
// the vocabulary's own default contradicts the vocabulary it is enforcing.

/** A minimal valid post, with whatever the case under test overrides. */
const post = (overrides = {}) => ({ title: 'A post', date: '2026-08-20', ...overrides });

const fieldsOf = (res) => (res.ok ? [] : res.issues.map((i) => i.field));
const messageFor = (res, field) =>
  (res.ok ? [] : res.issues).filter((i) => i.field === field).map((i) => i.message).join(' | ');

test('K46/F1-F5 a flag with no criterion is refused, naming `frontier_reason`', () => {
  const res = validateFrontMatter('post', post({ frontier: true }));
  assert.equal(res.ok, false, 'an exemption without a bar is a loophole');
  assert.deepEqual(fieldsOf(res), ['frontier_reason']);
  // The message shows the reader what IS allowed, not only that something is
  // wrong — the reader of it is a weak model with no context.
  for (const id of FRONTIER_REASONS) {
    assert.ok(messageFor(res, 'frontier_reason').includes(id), `names ${id}`);
  }
});

test('F1-F5 a criterion outside the closed five is refused, naming the value', () => {
  const res = validateFrontMatter('post', post({ frontier: true, frontier_reason: 'F6' }));
  assert.equal(res.ok, false);
  assert.deepEqual(fieldsOf(res), ['frontier_reason']);
  assert.match(messageFor(res, 'frontier_reason'), /invalid frontier_reason "F6"/);
});

test('the domain vocabulary is closed: `legal` is refused, naming the element', () => {
  const res = validateFrontMatter(
    'post',
    post({ frontier: true, frontier_reason: 'F4', domains: ['legal'] }),
  );
  assert.equal(res.ok, false);
  // The PATH names the offending ELEMENT, not the field: `domains[0]` is what
  // an author edits, and "domains is invalid" would send them to the wrong line
  // on a post carrying four of them.
  assert.deepEqual(fieldsOf(res), ['domains[0]']);
  assert.match(messageFor(res, 'domains[0]'), /invalid domain "legal"/);
  for (const d of DOMAINS) assert.ok(messageFor(res, 'domains[0]').includes(d), `names ${d}`);
});

test('K38 `text` is refused too — the value the vocabulary removed, not one it forgot', () => {
  const res = validateFrontMatter(
    'post',
    post({ frontier: true, frontier_reason: 'F2', domains: ['coding', 'text'] }),
  );
  assert.equal(res.ok, false);
  assert.deepEqual(fieldsOf(res), ['domains[1]'], 'the valid sibling is not what failed');
  assert.match(messageFor(res, 'domains[1]'), /invalid domain "text"/);
  assert.match(
    messageFor(res, 'domains[1]'),
    /"general" is the UNMARKED default/,
    'and the message says what to do instead, since an author reaching for `text` wants general',
  );
});

test('CONTROL a post with no frontier key validates exactly as it did before', () => {
  const res = validateFrontMatter('post', post({ mentions: ['model/x'] }));
  assert.equal(res.ok, true, JSON.stringify(res.issues));
  assert.equal(res.value.title, 'A post');
  assert.deepEqual(res.value.mentions, ['model/x']);
  // The two new defaults, and nothing else: an unflagged post is not flagged
  // and carries no domain.
  assert.equal(res.value.frontier, false);
  assert.deepEqual(res.value.domains, []);
  assert.equal(res.value.frontier_reason, undefined);
});

test('CONTROL `frontier: false` alone validates — the flag is optional and defaults false', () => {
  const res = validateFrontMatter('post', post({ frontier: false }));
  assert.equal(res.ok, true, JSON.stringify(res.issues));
  assert.equal(res.value.frontier, false);
});

test('CONTROL a fully valid flagged post validates and round-trips all three values', () => {
  const res = validateFrontMatter(
    'post',
    post({ frontier: true, frontier_reason: 'F1', domains: ['coding', 'agents'] }),
  );
  assert.equal(res.ok, true, JSON.stringify(res.issues));
  assert.equal(res.value.frontier, true);
  assert.equal(res.value.frontier_reason, 'F1');
  assert.deepEqual(res.value.domains, ['coding', 'agents'], 'declared order is preserved');
});

test('CONTROL K46 a flagged post with no `domains` validates, and so does `domains: []`', () => {
  // The four posts this ruling was made for — a court filing, a regulator's
  // enforcement action, a licence revenue gate, a system card — are F4/F5-shaped
  // events that map to no value in the vocabulary. Under the withdrawn "at
  // least one domain" bar not one of them could be flagged at all, which would
  // make the criteria unreachable on the one surface the flag exists to
  // populate.
  const absent = validateFrontMatter('post', post({ frontier: true, frontier_reason: 'F5' }));
  assert.equal(absent.ok, true, JSON.stringify(absent.issues));
  assert.equal(absent.value.frontier, true);
  assert.deepEqual(absent.value.domains, []);

  const empty = validateFrontMatter(
    'post',
    post({ frontier: true, frontier_reason: 'F5', domains: [] }),
  );
  assert.equal(empty.ok, true, JSON.stringify(empty.issues));

  // "An empty list means what an absent key means" is a reading the delta had
  // to make, and this is where it is made TRUE rather than asserted: the two
  // spellings parse to the same value, so nothing downstream can be written
  // that distinguishes them.
  assert.deepEqual(empty.value, absent.value);
});

test('CONTROL `domains` is optional on an UNFLAGGED post, and still closed', () => {
  const ok = validateFrontMatter('post', post({ domains: ['robotics'] }));
  assert.equal(ok.ok, true, JSON.stringify(ok.issues));
  assert.equal(ok.value.frontier, false, 'a domain is not a flag');
  const bad = validateFrontMatter('post', post({ domains: ['legal'] }));
  assert.equal(bad.ok, false, 'the vocabulary is closed whether or not the post is flagged');
});

test('the flag gate stops the REAL build, naming the file and the missing criterion', async () => {
  const err = await buildFixtureExpectingFailure('bad/frontier-flag-without-criterion');
  assert.match(err.message, /blog[/\\]unearned-flag\.md/);
  assert.match(err.message, /frontier_reason/);
});

test('the domain gate stops the REAL build, naming the file and the invalid value', async () => {
  const err = await buildFixtureExpectingFailure('bad/frontier-domain-outside-vocabulary');
  assert.match(err.message, /blog[/\\]tagged-text\.md/);
  assert.match(err.message, /domains\[0\]/);
  assert.match(err.message, /invalid domain "text"/);
});

test('CONTROL the flagged corpus BUILDS — the gate refuses bad flags, not flags', async () => {
  // Without this the two failure tests above are also passed by a schema that
  // rejects every post carrying the key at all.
  const site = await buildFixture('frontier-flag');
  assert.equal(site.diags.errors.length, 0, JSON.stringify(site.diags.errors));
  assert.equal(site.corpus.post.length, 3);
  const byTitle = Object.fromEntries(site.corpus.post.map((p) => [p.data.title, p.data]));
  const filing = byTitle['A court filing nobody can tag with a modality'];
  assert.equal(filing.frontier, true);
  assert.equal(filing.frontier_reason, 'F5');
  assert.deepEqual(filing.domains, [], 'absent means general, and the built corpus says so');
  assert.deepEqual(
    byTitle['A flagged record that lands in two domains'].domains,
    ['coding', 'agents'],
  );
  assert.equal(byTitle['An ordinary post that still says where it lands'].frontier, false);
});

test('the two new post keys are classified, and the classification stays exhaustive', () => {
  // The same guard `tool.category` needed: a string field the walker sees but
  // neither list classifies is scanned by nobody, and the failure is silent.
  const paths = stringFieldPaths(SCHEMAS.post);
  assert.ok(paths.includes('frontier_reason'), 'frontier_reason is walked');
  assert.ok(paths.includes('domains[]'), 'domains[] is walked');
  assert.ok(!paths.includes('frontier'), 'the flag is a boolean and is not a prose candidate');
  assert.match(NON_PROSE_FIELDS.post.frontier_reason, /closed-list value/);
  assert.match(NON_PROSE_FIELDS.post['domains[]'], /closed-list value/);
  assert.deepEqual(classificationProblems(), []);
});
