/**
 * declined-fields.test.mjs — the declined-field cross-check, proved by mutation.
 *
 * The check joins two trees that had never been joined: the refusals in
 * `data/sources/registry.json` and the `facts[].path` bindings in
 * `content/wiki/**`. So the fixture is a corpus held still while the REGISTRY is
 * mutated around it, which is the only way to show the join is a join and not a
 * constant:
 *
 *   CATCHING   a fixture registry declining `benchmarks.demo_index`, a block two
 *              fixture facts bind leaves of, must FAIL — and the failure must
 *              name the registry entry and every binding file, because a
 *              diagnostic naming one end sends the reader to look for the other.
 *   PASSING    the same corpus under a registry declining `architecture.demo`,
 *              which nothing binds, must come through clean. A check that fired
 *              on both would pass the catching half by accident.
 *
 * Everything else here exists because it is a way the join could be wrong while
 * both of those still passed: the wrong overlap direction, a prefix that is not
 * a path segment, a refusal leaking across sources, a cited fact treated as a
 * binding, and the debt ratchet forgiving in one direction only.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { fixtureRoot } from './test-helpers.mjs';
import {
  declinedFieldsStep,
  declinedPaths,
  feedBindings,
  findDeclinedBindings,
  bindingKey,
  debtKeys,
  pathsOverlap,
} from './declined-fields.mjs';

const FIX = 'lib/fixtures/declined-fields';
const BOUND = `${FIX}/wiki/model/bound-model.md`;

/** A registry declaring exactly the refusals a case is about. */
function registry(declined, id = 'demo-source') {
  return { sources: [{ id, declined_fields: declined.map((path) => ({ path, decision: 'not carried', decided_on: '2026-09-05', note: 'fixture' })) }] };
}

const run = (opts = {}) =>
  declinedFieldsStep({
    contentRoot: fixtureRoot('declined-fields'),
    debt: { known: [] },
    out: { write: () => {} },
    ...opts,
  });

// ---------------------------------------------------------------------------
// THE MUTATION — one corpus, two registries, opposite outcomes
// ---------------------------------------------------------------------------

test('a registry declining a path the corpus binds FAILS the build', async () => {
  await assert.rejects(
    () => run({ registry: registry(['benchmarks.demo_index']) }),
    (err) => {
      assert.match(err.message, /declined-field error/);
      // Both ends named: the registry entry that declared the refusal...
      assert.match(err.message, /data\/sources\/registry\.json/);
      assert.match(err.message, /sources\[demo-source\]\.declined_fields\[benchmarks\.demo_index\]/);
      assert.match(err.message, /decided_on 2026-09-05/);
      // ...and every file that binds it, with the fact field and bound path.
      assert.match(err.message, /bound-model\.md:facts\.intelligence_index \(benchmarks\.demo_index\.intelligence\)/);
      assert.match(err.message, /bound-model\.md:facts\.coding_index \(benchmarks\.demo_index\.coding\)/);
      assert.match(err.message, /declined-field-bound/);
      return true;
    },
  );
});

test('a registry declining a path nothing binds PASSES', async () => {
  const r = await run({ registry: registry(['architecture.demo']) });
  assert.equal(r.errors, 0);
  assert.equal(r.known, 0);
  assert.equal(r.declined, 1, 'the refusal was read — a zero here would pass for the wrong reason');
  assert.ok(r.scanned > 0, 'feed-bound facts were scanned — coverage, not an empty corpus');
});

test('a registry with no refusals at all PASSES, and says it looked', async () => {
  const r = await run({ registry: { sources: [{ id: 'demo-source' }] } });
  assert.equal(r.declined, 0);
  assert.equal(r.errors, 0);
  assert.ok(r.scanned > 0);
});

// ---------------------------------------------------------------------------
// THE JOIN — the ways it could be wrong while the mutation still passed
// ---------------------------------------------------------------------------

test('the exact bound path fires, and only the fact that binds it', () => {
  const docs = [
    { file: BOUND, data: { facts: [
      { field: 'coding_index', source: 'feed', feed: 'demo-source', path: 'benchmarks.demo_index.coding' },
      { field: 'intelligence_index', source: 'feed', feed: 'demo-source', path: 'benchmarks.demo_index.intelligence' },
    ] } },
  ];
  const { hits } = findDeclinedBindings(docs, declinedPaths(registry(['benchmarks.demo_index.coding'])));
  assert.equal(hits.length, 1);
  assert.equal(hits[0].field, 'coding_index');
});

test('a refusal DEEPER than the binding fires too — the other overlap direction', () => {
  // The entry binds the block; the registry refuses one leaf of it. Carrying the
  // block carries the leaf, so this is the same contradiction seen from the
  // other side, and a one-directional test would miss it.
  const docs = [{ file: BOUND, data: { facts: [{ field: 'benchmarks', source: 'feed', feed: 'demo-source', path: 'benchmarks.demo_index' }] } }];
  const { hits } = findDeclinedBindings(docs, declinedPaths(registry(['benchmarks.demo_index.coding'])));
  assert.equal(hits.length, 1);
  assert.equal(hits[0].declinedPath, 'benchmarks.demo_index.coding');
});

test('a string prefix that is not a path segment does NOT fire', () => {
  // `benchmarks.demo` is a prefix of the string `benchmarks.demo_index...` and
  // names a different field. A `startsWith` without the dot would report it.
  assert.equal(pathsOverlap('benchmarks.demo_index.intelligence', 'benchmarks.demo'), false);
  const docs = [{ file: BOUND, data: { facts: [{ field: 'intelligence_index', source: 'feed', feed: 'demo-source', path: 'benchmarks.demo_index.intelligence' }] } }];
  const { hits } = findDeclinedBindings(docs, declinedPaths(registry(['benchmarks.demo'])));
  assert.equal(hits.length, 0);
});

test("a refusal does not leak to another source's identical path", async () => {
  // Two fixture entries bind the SAME dotted path from two different sources.
  // A refusal belongs to the source that recorded it, so declining it on
  // `demo-source` must reach `bound-model.md` and must not touch
  // `other-feed.md`. A join on the path alone would report both.
  await assert.rejects(
    () => run({ registry: registry(['benchmarks.demo_index'], 'demo-source') }),
    (err) => {
      assert.match(err.message, /bound-model\.md/);
      assert.doesNotMatch(err.message, /other-feed\.md/);
      return true;
    },
  );
  // ...and the mirror image, so the test cannot pass by the refusal simply
  // never matching anything.
  await assert.rejects(
    () => run({ registry: registry(['benchmarks.demo_index'], 'other-source') }),
    (err) => {
      assert.match(err.message, /other-feed\.md/);
      assert.doesNotMatch(err.message, /bound-model\.md/);
      return true;
    },
  );
});

test('a cited fact is not a binding of anything a registry serves', () => {
  const docs = [{ file: BOUND, data: { facts: [
    { field: 'license', source: 'cited', value: 'Apache-2.0', source_url: 'https://example.org/benchmarks.demo_index' },
  ] } }];
  assert.deepEqual(feedBindings(docs[0].data), []);
  const { hits, scanned } = findDeclinedBindings(docs, declinedPaths(registry(['benchmarks.demo_index'])));
  assert.equal(hits.length, 0);
  assert.equal(scanned, 0);
});

// ---------------------------------------------------------------------------
// THE DEBT RATCHET — forgives what is recorded, fails what is new, shrinks only
// ---------------------------------------------------------------------------

const DEBT_ONE = {
  known: [
    { file: BOUND, source: 'demo-source', declined_path: 'benchmarks.demo_index', field: 'intelligence_index' },
  ],
};

test('a recorded binding is forgiven with a warning; an unrecorded one still fails', async () => {
  await assert.rejects(
    () => run({ registry: registry(['benchmarks.demo_index']), debt: DEBT_ONE }),
    (err) => {
      // `coding_index` is not in the debt, so it is still an error...
      assert.match(err.message, /facts\.coding_index/);
      // ...and the forgiven one must NOT be reported as one.
      assert.doesNotMatch(err.message, /facts\.intelligence_index/);
      return true;
    },
  );
});

test('a debt covering every binding leaves the build green and warns', async () => {
  const warnings = [];
  const debt = {
    known: [
      ...DEBT_ONE.known,
      { file: BOUND, source: 'demo-source', declined_path: 'benchmarks.demo_index', field: 'coding_index' },
    ],
  };
  const r = await run({
    registry: registry(['benchmarks.demo_index']),
    debt,
    out: { write: (s) => warnings.push(s) },
  });
  assert.equal(r.errors, 0);
  assert.equal(r.known, 2);
  assert.equal(r.stale.length, 0);
  const warned = warnings.filter((s) => s.startsWith('warning:'));
  assert.equal(warned.length, 1, 'one warning per refusal, not one per binding — a per-build warning printed 48 times is scenery');
  assert.match(warned[0], /known declined-binding debt/);
  assert.match(warned[0], /2 time\(s\) across 1 file\(s\)/);
  assert.match(warned[0], /may only shrink/);
});

test('a debt entry that has stopped firing is reported as removable', async () => {
  const warnings = [];
  const debt = { known: [{ file: `${FIX}/wiki/model/gone.md`, source: 'demo-source', declined_path: 'benchmarks.demo_index', field: 'intelligence_index' }] };
  const r = await run({ registry: registry(['architecture.demo']), debt, out: { write: (s) => warnings.push(s) } });
  assert.equal(r.errors, 0);
  assert.equal(r.stale.length, 1);
  assert.match(warnings.join(''), /recorded debt no longer fires/);
});

test('the debt key is the file, the source, the refusal and the fact field', () => {
  const key = bindingKey({ file: BOUND, source: 'demo-source', declinedPath: 'benchmarks.demo_index', field: 'coding_index' });
  assert.equal(key, `${BOUND}::demo-source::benchmarks.demo_index::coding_index`);
  // Two facts binding one declined path in one file are two entries of debt, so
  // unbinding one of them retires exactly one line and the list keeps shrinking.
  assert.equal(debtKeys(DEBT_ONE).size, 1);
  assert.ok(!debtKeys(DEBT_ONE).has(key));
});

// ---------------------------------------------------------------------------
// THE SHIPPED STATE — measured, not assumed
// ---------------------------------------------------------------------------

/**
 * The debt as it stood the day the check was written, measured by running the
 * check against the committed registry and the committed corpus. It is a
 * CEILING and not an expected value: the assertion below is `<=`, so paying the
 * debt down keeps the suite green and only growing it fails. Asserting equality
 * would make the one legal direction of the list a test failure, which is
 * exactly backwards.
 */
const DEBT_CEILING_2026_09_06 = 48;

test('the shipped debt may shrink but may not grow', async () => {
  // The state this check was written for: 48 bindings across 29 model entries
  // point at `benchmarks.artificial_analysis`, which the registry declines. The
  // build is green ONLY because every one of them is in the debt file. A 49th
  // binding fails the build; adding it to the debt file to silence that is the
  // route around the ratchet, and this is what closes it.
  const green = await declinedFieldsStep({ out: { write: () => {} } });
  assert.equal(green.errors, 0);
  assert.ok(
    green.known <= DEBT_CEILING_2026_09_06,
    `data/declined-binding-debt.json forgives ${green.known} binding(s); it forgave ` +
      `${DEBT_CEILING_2026_09_06} on 2026-09-06 and may only shrink`,
  );
  assert.equal(green.stale.length, 0, 'a debt line that no longer fires must be deleted, not kept');

  // ...and the debt is the ONLY reason it is green. Emptying it must reproduce
  // the contradiction, or the ratchet is forgiving something that is not there.
  if (green.known > 0) {
    await assert.rejects(
      () => declinedFieldsStep({ debt: { known: [] }, out: { write: () => {} } }),
      (err) => {
        assert.match(err.message, /declined-field error/);
        assert.match(err.message, /benchmarks\.artificial_analysis/);
        assert.match(err.message, new RegExp(`${green.known} content file binding\\(s\\)`));
        return true;
      },
    );
  }
});
