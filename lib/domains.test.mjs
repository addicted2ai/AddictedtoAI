import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  DOMAINS,
  FRONTIER_CRITERIA,
  FRONTIER_REASONS,
  frontierFlagProblems,
} from './domains.mjs';

test('the domain vocabulary is the eight values, in the order the specs state them', () => {
  assert.deepEqual([...DOMAINS], [
    'coding',
    'agents',
    'image',
    'video',
    'audio',
    'research',
    'science-math',
    'robotics',
  ]);
});

test('"general", "text" and "multimodal" are not values (K38)', () => {
  for (const absent of ['general', 'text', 'multimodal']) {
    assert.equal(
      DOMAINS.includes(absent),
      false,
      `${absent} must not be a domain value — general is unmarked, text was removed by K38`,
    );
  }
});

test('DOMAINS is frozen', () => {
  assert.equal(Object.isFrozen(DOMAINS), true);
  assert.throws(() => { DOMAINS.push('legal'); });
  assert.equal(DOMAINS.length, 8);
});

test('the frontier criteria are exactly the five ids F1-F5', () => {
  assert.deepEqual(FRONTIER_CRITERIA.map((c) => c.id), ['F1', 'F2', 'F3', 'F4', 'F5']);
  assert.equal(FRONTIER_CRITERIA.length, 5);
  assert.deepEqual([...FRONTIER_REASONS], ['F1', 'F2', 'F3', 'F4', 'F5']);
});

test('FRONTIER_CRITERIA is frozen, criterion objects included', () => {
  assert.equal(Object.isFrozen(FRONTIER_CRITERIA), true);
  assert.equal(Object.isFrozen(FRONTIER_REASONS), true);
  assert.throws(() => { FRONTIER_CRITERIA.push({ id: 'F6', text: 'x' }); });
  for (const criterion of FRONTIER_CRITERIA) {
    assert.equal(Object.isFrozen(criterion), true);
    assert.equal(typeof criterion.text, 'string');
    assert.ok(criterion.text.length > 0);
  }
});

// The point of a verbatim transcription is that it stays verbatim. This reads
// the criteria back out of the reviewed delta rather than trusting that the
// strings above were copied correctly once — a paraphrase that drifts from the
// keeper-signed order is exactly the silent-drift failure this file exists to
// prevent.
const normalise = (s) => s
  .replace(/[‘’]/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

// ── whether a declared flag holds (flag-what-moved-the-frontier) ───────────
//
// One rule, two enforcement points: the build gate in `postSchema` and the
// scout's merge in `loop/lib/proposals.mjs`. The cases below are the ones the
// SCHEMA never reaches — a non-boolean `frontier`, a `domains` that is not a
// list — because zod has already typed those keys by the time it calls this.
// The merge reads model-written YAML that nothing has validated, so those
// branches are live there, and a branch that is live in one caller and dead in
// the other has to be tested where it is live.

const paths = (fm) => frontierFlagProblems(fm).map((p) => p.path.join('.'));

test('a piece with no flag at all has nothing to hold', () => {
  assert.deepEqual(frontierFlagProblems({}), []);
  assert.deepEqual(frontierFlagProblems({ title: 'A post', frontier: false }), []);
  assert.deepEqual(frontierFlagProblems(), [], 'and no argument is not a crash');
});

test('a flag holds with a criterion, with or without domains (K46)', () => {
  assert.deepEqual(paths({ frontier: true, frontier_reason: 'F5' }), []);
  assert.deepEqual(paths({ frontier: true, frontier_reason: 'F5', domains: [] }), []);
  assert.deepEqual(paths({ frontier: true, frontier_reason: 'F1', domains: ['coding', 'agents'] }), []);
});

test('a flag without a criterion, or with one outside F1-F5, does not hold', () => {
  assert.deepEqual(paths({ frontier: true }), ['frontier_reason']);
  assert.deepEqual(paths({ frontier: true, frontier_reason: '' }), ['frontier_reason']);
  assert.deepEqual(paths({ frontier: true, frontier_reason: 'F6' }), ['frontier_reason']);
  // Declared but unflagged: `F6` is not a criterion whatever the flag says.
  assert.deepEqual(paths({ frontier_reason: 'F6' }), ['frontier_reason']);
  assert.deepEqual(paths({ frontier_reason: 'F2' }), [], 'a valid one is not a problem');
});

test('every domain is checked, by element, and a valid sibling is not blamed', () => {
  assert.deepEqual(paths({ domains: ['coding', 'text', 'legal'] }), ['domains.1', 'domains.2']);
  for (const d of DOMAINS) assert.deepEqual(paths({ domains: [d] }), [], d);
});

test('membership is EXACT — a near miss of a real value is still outside the vocabulary', () => {
  // `text` and `legal` above are far misses: they share no prefix, suffix or
  // case with any value, so a membership test loosened to `startsWith`,
  // `endsWith`, `includes` or a case fold would keep refusing them and every
  // assertion in this file would stay green. That is the gap this closes.
  //
  // It is the lesson this surface keeps teaching, in its smallest form: a check
  // that matches on the SHAPE of a name rather than on membership of the closed
  // list reads as present and admits what it was written to refuse — and an open
  // facet drifts into `coding` / `code` / `Coding` until the grouping stops
  // being a partition, which is the whole reason the list is closed.
  const nearMisses = [
    'cod',          // a prefix of `coding` — refused by a `startsWith` loosening
    'ing',          // a suffix of `coding` — refused by an `endsWith` loosening
    'math',         // a suffix of `science-math`, and a substring of it
    'science',      // a prefix of `science-math`
    'agent',        // a prefix of `agents`, and the singular a writer reaches for
    'codings',      // the value with one character too many
    'coding-agents', // two values run together
    'Coding',       // the same value, wrong case — a case fold would admit it
    ' coding',      // leading whitespace, which YAML preserves inside a quoted scalar
    'coding ',      // trailing whitespace
    'audio/video',  // a pair spelled as one value rather than as two entries
  ];
  for (const miss of nearMisses) {
    assert.deepEqual(
      paths({ domains: [miss] }),
      ['domains.0'],
      `${JSON.stringify(miss)} is not a domain — membership must be exact, never a shape match`,
    );
  }
  // The positive control on the same assertion: exactness refuses near misses
  // WITHOUT refusing the values themselves. A membership test that refused
  // everything would pass the loop above and be useless.
  for (const d of DOMAINS) assert.deepEqual(paths({ domains: [d] }), [], `${d} must still be accepted`);
});

test('the CRITERION is exact too — a near miss of F1-F5 is still outside the closed list', () => {
  // The same defence as the domains battery above, for the other closed list in
  // this file, and it was missing while that one existed. Every refusal asserted
  // elsewhere uses `F6` or `F9`: far misses that share no prefix, suffix,
  // substring or case with any real id, so a membership test loosened to
  // `startsWith`, `endsWith`, `includes`, a trim or a case fold would keep
  // refusing them and every other assertion here would stay green.
  //
  // The one that matters most is the last: `F2 — a rescoring that moved a
  // leader` is what an author actually types, because the criterion is a phrase
  // in their head and the brief prints the id beside its text. A substring
  // loosening admits it, and the field then carries the prose form
  // `NON_PROSE_FIELDS.post.frontier_reason` was written to forbid — "not a
  // sentence saying why; the post cites it by id". The same rule is the scout's
  // FILING gate (`applyProposalMergeRules`), so a criterion the closed list does
  // not contain would also buy the cap exemption at merge.
  const nearMisses = [
    'F1x',      // a real id with one character too many — a `startsWith` loosening admits it
    'F55',      // ditto, and the digit an author reaches for when there are five criteria
    'F',        // the bare prefix — a `some(r => r.startsWith(reason))` loosening admits it
    'f2',       // the same id, wrong case — a case fold admits it
    ' F2',      // leading whitespace, which YAML preserves inside a quoted scalar
    'F2 ',      // trailing whitespace — a `trim()` before the test admits it
    'F2 — a rescoring that moved a leader', // the id followed by its own text
    'F6',       // the far miss the other cases use, kept here as the baseline
  ];
  for (const miss of nearMisses) {
    assert.deepEqual(
      paths({ frontier: true, frontier_reason: miss }),
      ['frontier_reason'],
      `${JSON.stringify(miss)} is not a criterion — membership must be exact, never a shape match`,
    );
    // And unflagged, where the check is the `else if` branch rather than the
    // missing-criterion one: a record carrying a criterion it never claimed is
    // still a mistake worth stopping on.
    assert.deepEqual(
      paths({ frontier_reason: miss }),
      ['frontier_reason'],
      `${JSON.stringify(miss)} is not a criterion whatever the flag says`,
    );
  }
  // The positive control on the same assertion: exactness refuses the near
  // misses WITHOUT refusing the ids themselves. A test that refused everything
  // would pass the loop above and measure nothing.
  for (const id of FRONTIER_REASONS) {
    assert.deepEqual(paths({ frontier: true, frontier_reason: id }), [], `${id} must still be accepted`);
    assert.deepEqual(paths({ frontier_reason: id }), [], `${id} declared without the flag is not a problem`);
  }
});

test('a `frontier` that is not a boolean is refused, not read as absent', () => {
  // The two silent readings this refusal exists to prevent: `frontier: yes` is
  // a STRING under YAML 1.2, and reading it as unflagged loses a real
  // declaration while reading it as flagged lets an unparsable value buy the
  // scout's cap exemption.
  assert.deepEqual(paths({ frontier: 'yes' }), ['frontier']);
  assert.deepEqual(paths({ frontier: 'true', frontier_reason: 'F1' }), ['frontier']);
  assert.deepEqual(paths({ frontier: 1 }), ['frontier']);
  assert.match(frontierFlagProblems({ frontier: 'yes' })[0].message, /boolean true or false/);
});

test('a `domains` that is not a list is refused once, naming the field', () => {
  assert.deepEqual(paths({ domains: 'coding' }), ['domains']);
  assert.match(frontierFlagProblems({ domains: 'coding' })[0].message, /is a LIST of values/);
});

test('every problem names the offending value and the allowed ones', () => {
  // The reader of these messages is a weak model with no context, and a message
  // that says only "invalid" sends it looking in the wrong place.
  const reason = frontierFlagProblems({ frontier: true, frontier_reason: 'F9' })[0].message;
  assert.match(reason, /"F9"/);
  for (const id of FRONTIER_REASONS) assert.ok(reason.includes(id), `names ${id}`);
  const domain = frontierFlagProblems({ domains: ['legal'] })[0].message;
  assert.match(domain, /"legal"/);
  for (const d of DOMAINS) assert.ok(domain.includes(d), `names ${d}`);
});

test('each criterion text matches the blog delta verbatim', () => {
  const deltaPath = fileURLToPath(new URL(
    '../openspec/changes/flag-what-moved-the-frontier/specs/blog/spec.md',
    import.meta.url,
  ));
  const delta = readFileSync(deltaPath, 'utf8');
  const found = new Map();
  const pattern = /^- \*\*(F[1-5])\*\*\s+[—-]\s+([\s\S]*?)(?=\n- \*\*F[1-5]\*\*|\n\n)/gm;
  for (const m of delta.matchAll(pattern)) found.set(m[1], normalise(m[2]));
  assert.equal(found.size, 5, 'the delta should define five criteria');
  for (const criterion of FRONTIER_CRITERIA) {
    assert.equal(
      normalise(criterion.text),
      found.get(criterion.id),
      `${criterion.id} has drifted from the delta`,
    );
  }
});
