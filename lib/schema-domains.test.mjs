/**
 * schema-domains.test.mjs — the domain facet's build gates (change
 * `tag-the-corpus-by-domain`, tasks 8, 9 and 10).
 *
 * A separate file beside `schema.mjs` rather than more cases inside
 * `schema.test.mjs`: the facet arrives with three keys, two refusal families
 * and a set of controls, and its gates are worth reading in one place.
 *
 * EVERY REFUSAL BELOW IS PAIRED WITH THE THING IT MUST STILL ACCEPT (task 9).
 * Without the controls a refusal proves nothing — a schema that rejected the
 * key outright would pass every test in the first half of this file and be
 * completely wrong, which is the vacuous-gate shape this repository keeps
 * catching. So the stale-exclusion refusal is stated beside the legal exclusion
 * it must not touch, and the closed-list refusal beside all eight values in all
 * three fields.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { DOMAINS } from './domains.mjs';
import { SCHEMAS, validateFrontMatter } from './schema.mjs';
import { buildFixtureExpectingFailure } from './test-helpers.mjs';

/** The smallest entry the schema accepts, plus whatever a case declares. */
const entry = (extra = {}) => ({
  id: 'model/x',
  kind: 'model',
  display_name: 'X',
  status: 'active',
  maintenance: 'stable',
  aliases: [{ name: 'X', class: 'manual' }],
  ...extra,
});

/** The smallest tool listing the schema accepts, plus whatever a case declares. */
const listing = (extra = {}) => ({
  title: 'A tool',
  url: 'https://example.org/tool',
  pricing: 'Free tier, then $20/month',
  last_verified: '2026-09-05',
  entry: 'tool/a-tool',
  category: 'inference',
  ...extra,
});

/** The issues of a refusal, or a failure saying the gate did not fire. */
function refusal(type, data) {
  const res = validateFrontMatter(type, data);
  assert.equal(res.ok, false, `${type} front matter was accepted, but this case must be refused`);
  return res.issues;
}

const messageOf = (issues) => issues.map((i) => `${i.field}: ${i.message}`).join('\n');

// ---------------------------------------------------------------------------
// Task 8 — one test per refusal, each naming the field it expects in the error.
// ---------------------------------------------------------------------------

test('8 an entry domain outside the vocabulary is refused, naming field, value and the allowed values', () => {
  const issues = refusal('entry', entry({ domains: ['legal'] }));
  assert.equal(issues[0].field, 'domains[0]');
  assert.match(issues[0].message, /invalid domain "legal"/);
  // The message must show the reader what IS allowed, not only what is not.
  for (const d of DOMAINS) assert.ok(issues[0].message.includes(d), `names ${d}`);
});

test('8 `text` is refused like any other non-value — general is the unmarked default', () => {
  // K38, and the reason is a measurement rather than a taste: every one of the
  // 431 rows in the 2026-09-05 OpenRouter snapshot takes text in, out, or both,
  // so a `text` tag would divide nothing. Absence carries the same meaning at
  // no cost.
  const issues = refusal('entry', entry({ domains: ['text'] }));
  assert.equal(issues[0].field, 'domains[0]');
  assert.match(issues[0].message, /invalid domain "text"/);
});

test('8 `general` is refused — there is no such value to declare', () => {
  // An entry carrying no domain IS general. A `general` value would be a second
  // spelling of the empty set, and two spellings of one state is how a filter
  // starts disagreeing with the page it filters.
  const issues = refusal('entry', entry({ domains: ['general'] }));
  assert.equal(issues[0].field, 'domains[0]');
  assert.match(issues[0].message, /invalid domain "general"/);
});

test('8 a bad value in `domains_seeded` is refused, naming that field', () => {
  const issues = refusal('entry', entry({ domains_seeded: ['legal'] }));
  assert.equal(issues[0].field, 'domains_seeded[0]');
  assert.match(issues[0].message, /invalid domain "legal"/);
});

test('8 a bad value in `domains_excluded` is refused, naming that field', () => {
  const issues = refusal('entry', entry({ domains_excluded: ['legal'] }));
  assert.equal(issues[0].field, 'domains_excluded[0]');
  assert.match(issues[0].message, /invalid domain "legal"/);
});

test('8 asserting and excluding the same domain is refused as a contradiction', () => {
  const issues = refusal('entry', entry({ domains: ['audio'], domains_excluded: ['audio'] }));
  assert.equal(issues.length, 1, 'one issue: the contradiction, not also a staleness complaint');
  assert.equal(issues[0].field, 'domains_excluded[0]');
  assert.match(issues[0].message, /"model\/x"/, 'names the entry');
  assert.match(issues[0].message, /"audio"/, 'names the value');
  assert.match(issues[0].message, /BOTH `domains` and `domains_excluded`/);
  // A precedence rule in either direction would hide the editing mistake, so
  // the refusal must not read as a resolvable ambiguity.
  assert.match(issues[0].message, /contradiction, not a precedence question/);
});

test('8 an exclusion that suppresses nothing is refused as a stale edit', () => {
  const issues = refusal('entry', entry({ domains_seeded: ['image'], domains_excluded: ['video'] }));
  assert.equal(issues[0].field, 'domains_excluded[0]');
  assert.match(issues[0].message, /"video"/, 'names the value');
  assert.match(issues[0].message, /neither `domains_seeded` nor `domains`/);
  assert.match(issues[0].message, /stale edit/);
  // The remedy is stated, because the ordering it imposes is not obvious: an
  // exclusion follows the value it suppresses and never precedes it.
  assert.match(issues[0].message, /after the seeding run/);
});

test('8 a tool listing domain outside the vocabulary is refused, naming field and value', () => {
  const issues = refusal('tool', listing({ domains: ['legal'] }));
  assert.equal(issues[0].field, 'domains[0]');
  assert.match(issues[0].message, /invalid domain "legal"/);
  for (const d of DOMAINS) assert.ok(issues[0].message.includes(d), `names ${d}`);
});

test('8 a tool listing may not carry `domains_seeded` at all', () => {
  // No feed seeds a tool listing, so the machine key would be a key that can
  // never do anything — and, being on MECHANICAL_FRONT_MATTER_KEYS, a key that
  // exempts whatever it holds from review whether or not a machine wrote it.
  const issues = refusal('tool', listing({ domains_seeded: [] }));
  assert.match(messageOf(issues), /unknown front-matter key\(s\): domains_seeded/);
});

test('8 a tool listing may not carry `domains_excluded` either', () => {
  const issues = refusal('tool', listing({ domains_excluded: ['coding'] }));
  assert.match(messageOf(issues), /unknown front-matter key\(s\): domains_excluded/);
});

test('8 the build names the FILE as well as the field and the value', async () => {
  // The schema names the field, the value and the vocabulary; only the build
  // knows which file it was reading. specs/wiki requires all four, so the gate
  // is measured where a person meets it.
  const err = await buildFixtureExpectingFailure('bad/unknown-domain');
  assert.match(err.message, /wiki[/\\]model[/\\]mistagged\.md/);
  assert.match(err.message, /domains\[0\]/);
  assert.match(err.message, /invalid domain "legal"/);
  for (const d of DOMAINS) assert.ok(err.message.includes(d), `names ${d}`);
});

// ---------------------------------------------------------------------------
// Task 9 — the controls, without which the refusals above prove nothing.
// ---------------------------------------------------------------------------

test('9 an entry with none of the three keys validates, and gains none of them', () => {
  const res = validateFrontMatter('entry', entry());
  assert.equal(res.ok, true);
  // `.optional()` and not `.default([])`: an absent key stays absent. A zod
  // default would put an empty `domains_seeded` on every entry the moment
  // anything serialised the validated value.
  assert.ok(!('domains' in res.value), 'no `domains` invented');
  assert.ok(!('domains_seeded' in res.value), 'no `domains_seeded` invented');
  assert.ok(!('domains_excluded' in res.value), 'no `domains_excluded` invented');
});

test('9 an entry with `domains: []` validates — the empty set is legal and common', () => {
  const res = validateFrontMatter('entry', entry({ domains: [] }));
  assert.equal(res.ok, true);
  assert.deepEqual(res.value.domains, []);
});

test('9 excluding a value the entry\'s own `domains_seeded` carries validates', () => {
  // The legal exclusion, and the reason task 8's refusal is a check on
  // STALENESS rather than on the key existing at all.
  const res = validateFrontMatter('entry', entry({ domains_seeded: ['image'], domains_excluded: ['image'] }));
  assert.equal(res.ok, true);
  assert.deepEqual(res.value.domains_seeded, ['image'], 'domains_seeded is left as the machine wrote it');
  assert.deepEqual(res.value.domains_excluded, ['image']);
});

test('9 a fully populated entry round-trips all three arrays unchanged', () => {
  const data = entry({
    domains_seeded: ['image', 'video'],
    domains: ['research', 'science-math'],
    domains_excluded: ['video'],
  });
  const res = validateFrontMatter('entry', data);
  assert.equal(res.ok, true);
  assert.deepEqual(res.value.domains_seeded, ['image', 'video']);
  assert.deepEqual(res.value.domains, ['research', 'science-math']);
  assert.deepEqual(res.value.domains_excluded, ['video']);
});

test('9 every one of the eight values validates in each of the three entry fields', () => {
  // Exhaustive over the vocabulary rather than a sample: a closed list whose
  // members are only spot-checked is a list one typo away from a value nobody
  // can use, and nothing would say so.
  assert.equal(DOMAINS.length, 8, 'the vocabulary is eight tagged values');
  for (const d of DOMAINS) {
    assert.equal(validateFrontMatter('entry', entry({ domains: [d] })).ok, true, `domains: [${d}]`);
    assert.equal(
      validateFrontMatter('entry', entry({ domains_seeded: [d] })).ok,
      true,
      `domains_seeded: [${d}]`,
    );
    // In `domains_excluded` the value must be paired with the same value in
    // `domains_seeded`, since a bare exclusion is now the stale edit above.
    assert.equal(
      validateFrontMatter('entry', entry({ domains_seeded: [d], domains_excluded: [d] })).ok,
      true,
      `domains_excluded: [${d}] against a seed of the same value`,
    );
  }
});

test('9 every one of the eight values validates on a tool listing', () => {
  for (const d of DOMAINS) {
    assert.equal(validateFrontMatter('tool', listing({ domains: [d] })).ok, true, `tool domains: [${d}]`);
  }
  assert.equal(validateFrontMatter('tool', listing()).ok, true, 'and a listing with no domains at all');
  assert.equal(validateFrontMatter('tool', listing({ domains: [] })).ok, true, 'and the empty set');
});

test('9 a listing keeps its category untouched — the two axes are read independently', () => {
  const res = validateFrontMatter('tool', listing({ category: 'retrieval', domains: ['research'] }));
  assert.equal(res.ok, true);
  assert.equal(res.value.category, 'retrieval');
  assert.deepEqual(res.value.domains, ['research']);
  // And a listing with no category still fails, exactly as before.
  const { category, ...noCategory } = listing({ domains: ['research'] });
  assert.equal(validateFrontMatter('tool', noCategory).ok, false);
});

// ---------------------------------------------------------------------------
// Task 10 — the one crossing that would silently undo a review requirement.
// ---------------------------------------------------------------------------

test('10 a blog post is refused `domains_seeded`', () => {
  // NOT a tautology about `.strict()`. `MECHANICAL_FRONT_MATTER_KEYS` is
  // matched by key NAME across every content kind, so a post that could carry
  // the machine key would have that key exempted from review whether or not a
  // machine wrote it — deleting the review requirement
  // `flag-what-moved-the-frontier` writes into specs/blog, with no change to
  // that spec and no error anywhere. This must fail loudly if someone later
  // relaxes the post schema or renames the machine key to `domains`.
  const issues = refusal('post', { title: 'A post', date: '2026-09-05', domains_seeded: ['coding'] });
  assert.match(messageOf(issues), /unknown front-matter key\(s\): domains_seeded/);
});

test('10 no schema that accepts an editorial `domains` also accepts `domains_seeded`', () => {
  // Stated over the schemas rather than over the two kinds that have the field
  // today, so a kind that gains `domains` tomorrow cannot gain the machine key
  // with it unnoticed. `entry` is the one licensed exception: it is the record
  // the Pulse seeds, and its editorial keys stay inside the reviewed surface.
  const shapeOf = (schema) => Object.keys(schema._zod?.def?.shape ?? {});
  for (const [type, schema] of Object.entries(SCHEMAS)) {
    if (type === 'entry') continue;
    const keys = shapeOf(schema);
    if (!keys.includes('domains')) continue;
    assert.ok(
      !keys.includes('domains_seeded'),
      `${type} accepts an editorial \`domains\` and must not also accept \`domains_seeded\``,
    );
  }
  // The guard above is only worth anything if it is looking at real shapes.
  assert.ok(shapeOf(SCHEMAS.tool).includes('domains'), 'the tool schema does carry `domains`');
  assert.ok(shapeOf(SCHEMAS.entry).includes('domains_seeded'), 'and the entry schema does carry the machine key');
});
