/**
 * verify-design.test.mjs — the two coverage fixes (addictedtoai-t6d,
 * addictedtoai-0qs).
 *
 * `verify-design.mjs`'s other checks (`checkAxe`, `checkReflow`,
 * `checkKeyboard`, `checkFocusIndicators`'s DOM walk, `checkAboveFold`) drive
 * a real Playwright page against a real server and were never unit-testable —
 * that has not changed here, and no test file in this repository launches a
 * browser (checked: `git grep "from 'playwright'" -- '*.test.mjs'` is empty).
 * What changed is that the SCOPE-DECIDING logic — how far a focus sweep walks
 * before it stops, and which routes a control's element type must appear on —
 * was pulled out into pure functions plus one file-I/O function, all
 * exported, specifically so they could be tested here without a browser.
 *
 * `verify-design.mjs`'s bottom `await main()` is now guarded behind an
 * `import.meta.url` check (the same pattern `check-spec-deltas.mjs` uses) so
 * importing it for these exports does not spawn a server, launch a browser
 * and call `process.exit()`.
 *
 * ## The reproductions
 *
 * addictedtoai-t6d's gap and addictedtoai-0qs's gap are each reproduced with
 * the REAL numbers from the two issues, not invented ones:
 *
 *  - t6d: `/catalog` has 817 focusable elements; the removed cap was 150.
 *    MEASURED 2026-08-31 against the real build: walking all 817 with the
 *    exact per-stop `page.evaluate` `checkFocusIndicators` runs took 3.9-6.4s
 *    (`vd-measure-exhaustive2.mjs`, not committed — a throwaway timing probe).
 *  - 0qs: `/tools` gained a `<details>`/`<summary>` disclosure
 *    (addictedtoai-0eg) before `/tools` was added to `A11Y_EXTRA_ROUTES`
 *    (addictedtoai-9jj). The fixture below reconstructs exactly that
 *    sequence — same routes, same missing tag, same fix — and asserts the
 *    check fires on the "before" state and clears on the "after" state.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  focusSweepBound,
  describeFocusSweep,
  scanFocusableTagsByRoute,
  findUnsampledFocusableTags,
} from './verify-design.mjs';

/* ── focusSweepBound / describeFocusSweep (addictedtoai-t6d) ─────────────── */

test('focusSweepBound adds the safety margin, not a hard cap', () => {
  assert.equal(focusSweepBound(0), 25);
  assert.equal(focusSweepBound(817), 842);
  assert.equal(focusSweepBound(133), 158);
});

test('describeFocusSweep: a fully-tabbable page reports the complete order with no caveat', () => {
  const { ok, scope } = describeFocusSweep({ stops: 83, total: 83, safetyBoundHit: false });
  assert.equal(ok, true);
  assert.equal(scope, 'the complete tab order, 83 stop(s)');
});

test('describeFocusSweep: a page with hidden elements (closed <details>) still reports complete, with the count', () => {
  // The real /tools numbers from the baseline run: 133 in the DOM, 98 reachable.
  const { ok, scope } = describeFocusSweep({ stops: 98, total: 133, safetyBoundHit: false });
  assert.equal(ok, true);
  assert.match(scope, /the complete tab order, 98 stop\(s\)/);
  assert.match(scope, /133 focusable element\(s\) in the DOM, 35 of them not currently/);
});

test('describeFocusSweep: hitting the safety bound is a FAILURE, reported as an anomaly, never a quiet cap', () => {
  const { ok, scope } = describeFocusSweep({ stops: 842, total: 817, safetyBoundHit: true });
  assert.equal(ok, false, 'a safety-bound hit must not read as a pass');
  assert.match(scope, /STILL GOING/);
  assert.match(scope, /focus trap/);
});

test('t6d reproduction: a violation past the old 150-stop cap was structurally unreachable, and the new bound reaches it', () => {
  // The real numbers from addictedtoai-t6d: /catalog has 817 focusable
  // elements; the removed FOCUS_SWEEP_CAP constant was 150.
  const OLD_FIXED_CAP = 150;
  const total = 817;
  const violationAtStop = 400; // past the old cap, well within total

  // Old behavior: `for (let i = 0; i < FOCUS_SWEEP_CAP; i += 1)` never
  // reaches index 400, so an unindicated element sitting there would never
  // be visited — the old code could not have found it, regardless of what
  // it was.
  assert.ok(violationAtStop >= OLD_FIXED_CAP, 'the planted violation sits past what the old cap ever walked');

  // New behavior: the loop bound is derived from the page's own counted
  // total, so it walks straight past stop 400 to the real end.
  const newBound = focusSweepBound(total);
  assert.ok(violationAtStop < newBound, 'the new bound reaches the once-invisible stop');
  assert.ok(total < newBound, 'and reaches every one of the 817 real stops, not just stop 400');

  // And the old evidence line, MEASURED on 2026-08-31 against the real site
  // (scripts/verify-design.mjs, pre-fix): "150 of 817 focusable element(s) —
  // STOPPED AT THE 150-STOP CAP, the rest unswept" — printed as PASS. The new
  // describeFocusSweep for the same total walked to completion says so
  // instead of silently capping:
  const { ok, scope } = describeFocusSweep({ stops: total, total, safetyBoundHit: false });
  assert.equal(ok, true);
  assert.match(scope, /the complete tab order, 817 stop\(s\)/);
});

/* ── findUnsampledFocusableTags (addictedtoai-0qs, pure half) ────────────── */

test('PASSES: no route outside the sample uses a tag the sample has never seen', () => {
  const routeTags = new Map([
    ['/', new Set(['a', 'button', 'input'])],
    ['/catalog', new Set(['a', 'button', 'select'])],
    ['/blog', new Set(['a', 'button'])], // unsampled, but nothing new
  ]);
  const gaps = findUnsampledFocusableTags(routeTags, ['/', '/catalog']);
  assert.deepEqual(gaps, []);
});

test('TRIPS: an unsampled route renders a tag no sampled route renders', () => {
  const routeTags = new Map([
    ['/', new Set(['a', 'button'])],
    ['/catalog', new Set(['a', 'button', 'select'])],
    ['/tools', new Set(['a', 'button', 'summary'])], // <details>/<summary>, unsampled
  ]);
  const gaps = findUnsampledFocusableTags(routeTags, ['/', '/catalog']);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].tag, 'summary');
  assert.equal(gaps[0].firstRoute, '/tools');
  assert.equal(gaps[0].count, 1);
});

test('PASSES (control): the same data, once the route is added to the sample', () => {
  const routeTags = new Map([
    ['/', new Set(['a', 'button'])],
    ['/catalog', new Set(['a', 'button', 'select'])],
    ['/tools', new Set(['a', 'button', 'summary'])],
  ]);
  const gaps = findUnsampledFocusableTags(routeTags, ['/', '/catalog', '/tools']);
  assert.deepEqual(gaps, [], "adding /tools to the sample is exactly what addictedtoai-9jj did, and it's still the fix");
});

test('a new tag shared by many unsampled routes is ONE finding, not one per route', () => {
  const routeTags = new Map([
    ['/', new Set(['a'])],
    ['/tools/aider', new Set(['a', 'dialog'])],
    ['/tools/argilla', new Set(['a', 'dialog'])],
    ['/tools/axolotl', new Set(['a', 'dialog'])],
  ]);
  const gaps = findUnsampledFocusableTags(routeTags, ['/']);
  assert.equal(gaps.length, 1, 'grouped by tag, not by route');
  assert.equal(gaps[0].tag, 'dialog');
  assert.equal(gaps[0].count, 3);
  assert.equal(gaps[0].firstRoute, '/tools/aider', 'the first route in iteration order is cited as the example');
});

test('a tag covered by ANY sampled route is not flagged, even if it also appears on an unsampled route', () => {
  const routeTags = new Map([
    ['/', new Set(['a'])],
    ['/catalog', new Set(['a', 'select'])], // sampled: covers "select"
    ['/directory/tools', new Set(['a', 'select'])], // unsampled, same tag
  ]);
  const gaps = findUnsampledFocusableTags(routeTags, ['/', '/catalog']);
  assert.deepEqual(gaps, []);
});

/* ── scanFocusableTagsByRoute (addictedtoai-0qs, the I/O half) ───────────── */

async function tempOut(files) {
  const root = await mkdtemp(join(tmpdir(), 'vd-0qs-'));
  for (const [rel, html] of Object.entries(files)) {
    const full = join(root, ...rel.split('/'));
    await mkdir(join(full, '..'), { recursive: true });
    await writeFile(full, html, 'utf8');
  }
  return root;
}

const page = (body) => `<!doctype html><html><body>${body}</body></html>`;

test('file paths map to routes the way the export does: index.html is /, nested files keep their path', async () => {
  const out = await tempOut({
    'index.html': page('<a href="/x">home link</a>'),
    'catalog.html': page('<a href="/y">catalog link</a>'),
    'tools/aider.html': page('<a href="/z">tool link</a>'),
  });
  const routeTags = await scanFocusableTagsByRoute(out);
  assert.deepEqual([...routeTags.keys()].sort(), ['/', '/catalog', '/tools/aider']);
});

test('the static scan agrees with the browser selector: no href means not focusable, tabindex="-1" is excluded', async () => {
  const out = await tempOut({
    'index.html': page(
      '<a href="/x">real link</a><a>no href</a><div tabindex="0">custom</div><div tabindex="-1">not tabbable</div>',
    ),
  });
  const routeTags = await scanFocusableTagsByRoute(out);
  assert.deepEqual([...routeTags.get('/')].sort(), ['a', 'div']);
});

test('0qs reproduction: the exact /tools sequence — flagged before the route was sampled, clean after', async () => {
  // Reconstructs the real history: addictedtoai-0eg gave /tools a
  // <details>/<summary> disclosure; addictedtoai-9jj later added /tools to
  // A11Y_EXTRA_ROUTES. This fixture is the "before 9jj" state.
  const out = await tempOut({
    'index.html': page('<nav><a href="/catalog">catalog</a></nav><button>theme</button>'),
    'catalog.html': page('<a href="/x">row</a><select><option>sort</option></select>'),
    'tools.html': page(
      '<nav>jump links</nav><h2>Category</h2><p class="category-note">note</p>' +
        '<details><summary>More tools</summary><a href="/tools/aider">aider</a></details>',
    ),
  });
  const routeTags = await scanFocusableTagsByRoute(out);

  // BEFORE: /tools not yet in the sample — the gap addictedtoai-0qs is about.
  const before = findUnsampledFocusableTags(routeTags, ['/', '/catalog']);
  assert.equal(before.length, 1);
  assert.equal(before[0].tag, 'summary');
  assert.equal(before[0].firstRoute, '/tools');

  // AFTER: /tools added to the sample (what addictedtoai-9jj actually did) —
  // the same fixture now reports clean.
  const after = findUnsampledFocusableTags(routeTags, ['/', '/catalog', '/tools']);
  assert.deepEqual(after, []);
});
