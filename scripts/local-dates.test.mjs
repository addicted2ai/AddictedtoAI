/**
 * local-dates.test.mjs — the repository-wide SOURCE check for UTC calendar
 * dates (beads addictedtoai-t9h).
 *
 * ---------------------------------------------------------------------------
 * WHY A SOURCE CHECK, WHEN THERE ARE ALREADY TWO TZ-FORCING BEHAVIOURAL TESTS
 *
 * `CLAUDE.md` and `AGENTS.md` state one rule for the whole repository: *"Every
 * date in this repository is the LOCAL date of the machine that wrote it."*
 * Between 2026-08-29 and 2026-08-31 that rule was broken in **seven** places
 * across four files, producing four separate P1/P2 bugs. Two of the seven were
 * helpers written wrongly; **five were bare `toISOString().slice(0, 10)` typed
 * inline** by an author who never looked for a helper at all.
 *
 * That five-of-seven is why this file exists and why consolidating the helpers
 * was not, on its own, the fix. A shared module corrects an implementation
 * once; it does nothing about not reaching for it. See `loop/lib/dates.mjs`'s
 * header for the full decision, including the measured import-edge counts
 * behind it.
 *
 * And the behavioural tests cannot reach everywhere. `pulse/tests/dates.test
 * .mjs` and the closing section of `lib/facts.test.mjs` force `TZ` in a child
 * process, which is the only honest way to test a date function — but:
 *
 *  - **They cannot run on the verify scripts at all.** `scripts/verify-design
 *    .mjs` and `scripts/verify-analytics.mjs` end in `await main()`, which
 *    starts a server and drives Playwright, so no unit test can import them. A
 *    source check is the ONLY mechanism that reaches that code.
 *  - **They fail six hours a day, in one direction, on one machine.** A UTC-6
 *    box catches the defect from 18:00; a UTC CI box never does. This check
 *    needs no clock and no zone: it fires on the broken FORM, on any machine,
 *    at the moment the line is written rather than at 18:00 local six weeks
 *    later.
 *
 * ---------------------------------------------------------------------------
 * THE ALLOWLIST IS THE DESIGN WORK, NOT AN AFTERTHOUGHT
 *
 * "No `toISOString` anywhere" would break every correct site in the tree, and
 * there are four distinct kinds of them. Every entry below therefore carries a
 * `category` naming which kind it is, so the next person adding one has to make
 * the distinction explicitly rather than by default. The categories, measured
 * from what this repository actually contains rather than assumed:
 *
 *  `wall-clock-instant`      A moment in time with an explicit `Z`, not a
 *                            calendar day: `built_at`, a ledger `ts`, a breaker
 *                            stamp. UTC is the HONEST frame for these and
 *                            "fixing" them would be the bug.
 *  `yaml-round-trip`         A value read back OUT of js-yaml, which parses a
 *                            bare `YYYY-MM-DD` to UTC MIDNIGHT. Formatting it
 *                            locally shifts it a day BACKWARDS and would break
 *                            every review record. Measured during
 *                            addictedtoai-aw6.
 *  `utc-anchored-arithmetic` Both ends pinned to explicit `T00:00:00Z`, so the
 *                            round trip is exact by construction and the local
 *                            zone never enters the computation.
 *  `third-party-timestamp`   An upstream publisher's own instant, not a date
 *                            this machine minted. Local would give one
 *                            immutable historical event a different date per
 *                            machine. See `pulse/lib/diff.mjs`'s own long note.
 *  `deliberate-contrast`     A TEST computing the UTC form on purpose, to
 *                            assert it differs from the local one. Removing
 *                            these would delete the fixtures that prove the
 *                            bug is still being exercised.
 *
 * The list has the same ratchet discipline as the debt files elsewhere in this
 * tree: a stale entry — one that no longer matches anything — FAILS, so the
 * list cannot quietly accumulate permissions for code that is gone.
 * ---------------------------------------------------------------------------
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEARCH = ['app', 'lib', 'loop', 'pulse', 'scripts'];

/**
 * `toISOString()` immediately sliced to ten characters: a calendar day taken
 * from the UTC frame. This is the exact five-character mistake that produced
 * every one of the seven defects.
 */
const UTC_CALENDAR_SLICE = /\.toISOString\(\)\s*\.\s*slice\(\s*0\s*,\s*10\s*\)/;

/**
 * The same mistake spelled out: a year, month and day taken from the UTC
 * accessors. This is the form `loop/lib/ledger.mjs`'s `nextJobId` used, and it
 * is invisible to the pattern above — which is why both are checked.
 */
const UTC_CALENDAR_PARTS = /getUTCFullYear\s*\(\s*\)/;

/**
 * Blank comments so a doc comment ABOUT the broken form is not itself a
 * violation — several of the files fixed by this class explain what they used
 * to say, and they must be allowed to.
 *
 * Block comments are removed wholesale. A line comment is removed only when
 * `//` is the first non-whitespace on its line: a trailing `//` on a line of
 * code is left in place, because stripping from the first `//` anywhere would
 * also eat the tail of any line containing a `https://` literal — and that is a
 * false NEGATIVE, the one direction this check must never err in. An
 * over-report is fixed by rewording or by an allowlist entry; a miss is a bug
 * shipped.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

/**
 * This file is excluded from its own scan, and the exclusion is deliberate
 * rather than convenient: the allowlist below and the fires-on-the-broken-form
 * probes above both contain the offending strings as DATA, and a checker that
 * flags its own test vectors cannot be maintained. It is a narrow blind spot —
 * this file mints no date and writes nothing — but it is a blind spot, so it is
 * named here rather than left for someone to discover.
 */
const SELF = 'scripts/local-dates.test.mjs';

function sourceFiles() {
  return fg
    .sync(
      SEARCH.map((d) => `${d}/**/*.mjs`),
      { cwd: ROOT, absolute: true, ignore: ['**/node_modules/**', '**/.next/**', '**/out/**'] },
    )
    .filter((abs) => relative(ROOT, abs).replace(/\\/g, '/') !== SELF)
    .sort();
}

/** Every offending line in the tree, as `{ file, line, text, rule }`. */
function violations() {
  const out = [];
  for (const abs of sourceFiles()) {
    const file = relative(ROOT, abs).replace(/\\/g, '/');
    const lines = stripComments(readFileSync(abs, 'utf8')).split(/\r?\n/);
    lines.forEach((text, i) => {
      const rule = UTC_CALENDAR_SLICE.test(text)
        ? 'utc-calendar-slice'
        : UTC_CALENDAR_PARTS.test(text)
          ? 'utc-calendar-parts'
          : null;
      if (rule) out.push({ file, line: i + 1, text: text.trim(), rule });
    });
  }
  return out;
}

/**
 * ---------------------------------------------------------------------------
 * THE ALLOWLIST. One entry per SITE, keyed `file::substring`, each naming its
 * category and why.
 *
 * `match` is a substring of the offending line, not a line number: line numbers
 * move on every edit above them and would make this list a maintenance tax that
 * teaches nothing. A substring changes only when the code does.
 *
 * Adding an entry here is a claim that the site is one of the four categories
 * described in the header. If it is not — if it mints a calendar day for the
 * corpus — it is a bug, and the repair is a local-date helper, not a line here.
 * ---------------------------------------------------------------------------
 */
const ALLOWED = [
  {
    file: 'lib/anchors.mjs',
    match: 'new Date(t - (ANCHOR_WINDOW_DAYS - 1) * DAY_MS)',
    category: 'utc-anchored-arithmetic',
    why: 'both ends are explicit UTC midnight — `t` comes from Date.parse(`${to}T00:00:00Z`) — so the window arithmetic never touches the local zone',
  },
  {
    file: 'lib/reviews.mjs',
    match: 'raw instanceof Date',
    category: 'yaml-round-trip',
    why: 'a bare `date:` parsed by js-yaml to UTC midnight, formatted back to the same bare date; local would shift every review record a day backwards',
  },
  {
    file: 'lib/schema.mjs',
    match: 'new Date(t).toISOString().slice(0, 10) === s',
    category: 'utc-anchored-arithmetic',
    why: 'the real-calendar-day refinement: parses `${s}T00:00:00Z` and formats back in the same frame, so the comparison is a round trip by construction',
  },
  {
    file: 'lib/deltas.mjs',
    match: 'b.getUTCFullYear() - a.getUTCFullYear()',
    category: 'utc-anchored-arithmetic',
    why: 'a duration between two already-UTC-anchored dates; both operands are in one frame and no calendar day is minted',
  },
  {
    file: 'lib/deltas.mjs',
    match: 'new Date(Date.UTC(b.getUTCFullYear()',
    category: 'utc-anchored-arithmetic',
    why: 'the days-in-the-previous-month borrow of that same duration computation, in the same frame as both its operands',
  },
  {
    file: 'lib/day-gap-attribution.mjs',
    match: 'const ua = Date.UTC(a.getUTCFullYear()',
    category: 'utc-anchored-arithmetic',
    why: 'the DST-proof day-number idiom — Date.UTC of the UTC parts — used to COUNT days between two feed timestamps, never to stamp one',
  },
  {
    file: 'lib/day-gap-attribution.mjs',
    match: 'const ub = Date.UTC(b.getUTCFullYear()',
    category: 'utc-anchored-arithmetic',
    why: 'the other end of the same day-number subtraction',
  },
  {
    file: 'loop/lib/proposals.mjs',
    match: 'v.getUTCFullYear()',
    category: 'yaml-round-trip',
    why: '`expires:` handed back by gray-matter as a Date parsed at UTC midnight; reading it with local accessors would move the expiry a day earlier',
  },
  {
    file: 'pulse/lib/diff.mjs',
    match: 'date: parsed.toISOString().slice(0, 10)',
    category: 'third-party-timestamp',
    why: "a feed row's own publication instant, deliberately UTC so one historical event does not carry a different date per machine (addictedtoai-3t8); the file carries the full reasoning",
  },
  {
    file: 'lib/facts.test.mjs',
    match: 'utc: d.toISOString().slice(0, 10)',
    category: 'deliberate-contrast',
    why: 'the TZ-forcing fixture computes the UTC form to assert todayIso() does NOT return it',
  },
  {
    file: 'pulse/tests/dates.test.mjs',
    match: 'utc: d.toISOString().slice(0, 10)',
    category: 'deliberate-contrast',
    why: "the same fixture shape for the Pulse's today()",
  },
  {
    file: 'loop/tests/dates.test.mjs',
    match: 'utc: d.toISOString().slice(0, 10)',
    category: 'deliberate-contrast',
    why: "the same fixture shape for the Desk's localDate()",
  },
  {
    file: 'loop/tests/dates.test.mjs',
    match: 'utc: d.toISOString().slice(0, 10) };',
    category: 'deliberate-contrast',
    why: 'the review-record and directive-marker probes return the UTC form so the assertion can prove the written file does not carry it',
  },
  {
    file: 'loop/tests/proposal-expiry.test.mjs',
    match: 'utc: now.toISOString().slice(0, 10)',
    category: 'deliberate-contrast',
    why: "the expiry sweep's own TZ-forcing fixture, asserting the swept date is local",
  },
];

const CATEGORIES = new Set([
  'wall-clock-instant',
  'yaml-round-trip',
  'utc-anchored-arithmetic',
  'third-party-timestamp',
  'deliberate-contrast',
]);

const isAllowed = (v) => ALLOWED.some((a) => a.file === v.file && v.text.includes(a.match));

// ---------------------------------------------------------------------------

test('no file mints a calendar date in the UTC frame', () => {
  const offenders = violations()
    .filter((v) => !isAllowed(v))
    .map((v) => `${v.file}:${v.line} [${v.rule}] ${v.text}`);
  assert.deepEqual(
    offenders,
    [],
    'Every date in this repository is the LOCAL date of the machine that wrote it (CLAUDE.md). ' +
      'Use pulse/lib/core.mjs today(), lib/facts.mjs todayIso() or loop/lib/dates.mjs localDate() ' +
      'for the directory you are in. If the site is genuinely a wall-clock instant, a js-yaml ' +
      'round trip, UTC-anchored arithmetic or a third-party timestamp, add it to ALLOWED in this ' +
      'file with its category and a reason.',
  );
});

test('the check actually fires — it is not a regex that matches nothing', () => {
  // A guardrail is not what it was built to do; it is what it does when
  // measured. Both rules are exercised against the literal broken forms.
  const probe = (text) => ({
    slice: UTC_CALENDAR_SLICE.test(text),
    parts: UTC_CALENDAR_PARTS.test(text),
  });
  assert.deepEqual(probe('const d = new Date().toISOString().slice(0, 10);'), { slice: true, parts: false });
  assert.deepEqual(probe('const d = now.toISOString().slice(0,10);'), { slice: true, parts: false });
  assert.deepEqual(probe('  date: `${ctx.now().toISOString().slice(0, 10)}`,'), { slice: true, parts: false });
  assert.deepEqual(probe('const y = now.getUTCFullYear();'), { slice: false, parts: true });
  // And does NOT fire on the correct forms.
  assert.deepEqual(probe('return localDate(ctx.now());'), { slice: false, parts: false });
  assert.deepEqual(probe("const built_at = now.toISOString().replace(/\\.\\d{3}Z$/, 'Z');"), {
    slice: false,
    parts: false,
  });
  assert.deepEqual(probe('ts: now.toISOString(),'), { slice: false, parts: false });
});

test('comment stripping hides a doc comment about the broken form, and nothing else', () => {
  // The false-negative direction is the dangerous one, so the rule is asserted
  // rather than trusted: a trailing comment does NOT hide the code before it.
  assert.equal(stripComments('  // it was `new Date().toISOString().slice(0, 10)`').trim(), '');
  assert.equal(stripComments('/** was toISOString().slice(0, 10) */').trim(), '');
  const trailing = 'const d = new Date().toISOString().slice(0, 10); // no escape here';
  assert.ok(UTC_CALENDAR_SLICE.test(stripComments(trailing)), 'a trailing comment must not hide the code before it');
  // A URL literal must survive, because eating it would eat real code with it.
  const withUrl = "const u = 'https://x/y'; const d = t.toISOString().slice(0, 10);";
  assert.ok(UTC_CALENDAR_SLICE.test(stripComments(withUrl)));
});

test('every allowlist entry names one of the five categories and a reason', () => {
  for (const a of ALLOWED) {
    assert.ok(CATEGORIES.has(a.category), `${a.file}: unknown category ${a.category}`);
    assert.ok(a.why && a.why.length > 30, `${a.file}::${a.match} needs a real reason, not a label`);
  }
});

test('no allowlist entry is stale — an entry that matches nothing must be deleted', () => {
  // Same ratchet as the price-attribution and snapshot-census debt files: a
  // permission that outlives the code it was granted for is how an allowlist
  // silently becomes a denylist of one.
  const found = violations();
  const stale = ALLOWED.filter((a) => !found.some((v) => v.file === a.file && v.text.includes(a.match))).map(
    (a) => `${a.file}::${a.match}`,
  );
  assert.deepEqual(stale, [], 'these allowlist entries no longer match any line and should be removed');
});

test('the three local-date helpers exist and agree with each other', () => {
  // One helper per bounded directory is the decision (loop/lib/dates.mjs's
  // header). That is only defensible while they genuinely agree, so it is
  // measured rather than assumed.
  const d = new Date(2026, 7, 29, 20, 31, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  const expected = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return Promise.all([
    import(`${join(ROOT, 'pulse', 'lib', 'core.mjs').replace(/\\/g, '/')}`.replace(/^/, 'file:///')),
    import(`${join(ROOT, 'lib', 'facts.mjs').replace(/\\/g, '/')}`.replace(/^/, 'file:///')),
    import(`${join(ROOT, 'loop', 'lib', 'dates.mjs').replace(/\\/g, '/')}`.replace(/^/, 'file:///')),
  ]).then(([core, facts, dates]) => {
    assert.equal(core.today(d), expected, 'pulse/lib/core.mjs today()');
    assert.equal(facts.todayIso(d), expected, 'lib/facts.mjs todayIso()');
    assert.equal(dates.localDate(d), expected, 'loop/lib/dates.mjs localDate()');
  });
});
