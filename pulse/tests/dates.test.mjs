/**
 * dates.test.mjs — the Pulse stamps LOCAL calendar dates (addictedtoai-4ih).
 *
 * ## What broke, and why nothing here caught it
 *
 * `today()` was `d.toISOString().slice(0, 10)` — UTC. CLAUDE.md and AGENTS.md
 * both state the opposite rule for the whole repository: *"Every date in this
 * repository is the LOCAL date of the machine that wrote it — `accessed:` on a
 * fact, `date:` on a review record, `verified_on:` on a tutorial, a delta
 * end's `date:`. Not UTC."* The Pulse is scheduled at 06:00, 12:00, 18:00 and
 * 00:00 local, so on a UTC-6 machine **the 18:00 run stamped tomorrow onto
 * everything it wrote, every day, unattended.**
 *
 * Every other test in `pulse/tests` pins the clock with `PULSE_NOW`, which is
 * exactly why none of them noticed: a pinned bare date used to be parsed as
 * UTC midnight and formatted back out as UTC, so the bug cancelled itself in
 * every fixture and only ever appeared against a real wall clock.
 *
 * ## Why this file forces a timezone
 *
 * On a machine already running in UTC, local and UTC are the same string and
 * the broken implementation passes every assertion that can be written about
 * it. So the assertions that matter run in a **child process with `TZ` set**,
 * which is the only way this file can fail on a UTC CI box the way it would
 * fail on the maintainer's UTC-6 desk. `TZ` is read by Node's ICU at startup,
 * hence a child rather than an assignment.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { today, daysSince, now } from '../lib/core.mjs';

const CORE = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'core.mjs')).href;

const pad = (n) => String(n).padStart(2, '0');
/** The local calendar date of a Date, computed independently of `today()`. */
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Run a probe against the REAL exported functions inside a child process
 * pinned to `tz`. The probe returns JSON; anything it throws fails the test.
 */
function inZone(tz, probeBody) {
  const src = `
    import { today, daysSince, now } from ${JSON.stringify(CORE)};
    const pad = (n) => String(n).padStart(2, '0');
    const localDate = (d) => \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}\`;
    const out = await (async () => { ${probeBody} })();
    process.stdout.write(JSON.stringify(out));
  `;
  const raw = execFileSync(process.execPath, ['--input-type=module', '-e', src], {
    encoding: 'utf8',
    env: { ...process.env, TZ: tz, PULSE_NOW: '' },
  });
  return JSON.parse(raw);
}

// A fixed-offset zone with no DST, so the arithmetic in these assertions is
// stated once and does not depend on the month. UTC-6 is the maintainer's
// measured offset in addictedtoai-4ih.
const WEST = 'Etc/GMT+6';
// A zone east of Greenwich, where the failure mode is the mirror image: UTC
// lags local, so a UTC stamp writes YESTERDAY in the early morning.
const EAST = 'Asia/Tokyo';
// A real DST zone, for the day-counting assertions.
const DST = 'America/Chicago';

// ---------------------------------------------------------------------------

test('today() stamps the local date at all four scheduled trigger times, west of Greenwich', () => {
  const rows = inZone(
    WEST,
    `
    const out = [];
    for (const h of [6, 12, 18, 0]) {
      const d = new Date(2026, 7, 29, h, 0, 0, 0);
      out.push({ hour: h, local: localDate(d), stamped: today(d), utc: d.toISOString().slice(0, 10) });
    }
    return out;
  `,
  );

  for (const r of rows) {
    assert.equal(r.stamped, r.local, `the ${pad(r.hour)}:00 local run must stamp ${r.local}, not ${r.stamped}`);
  }
  // The 18:00 run is the one that was wrong, and this asserts the fixture is
  // still exercising the failure: if UTC and local agreed at 18:00 the test
  // above would prove nothing.
  const evening = rows.find((r) => r.hour === 18);
  assert.notEqual(evening.utc, evening.local, 'the 18:00 local run must still straddle UTC midnight for this test to mean anything');
  assert.equal(evening.stamped, '2026-08-29');
  assert.equal(evening.utc, '2026-08-30', 'UTC is a day ahead here — which is exactly what today() must not return');
});

test('no hour of the day stamps a different date than the one being lived, in either direction', () => {
  for (const tz of [WEST, EAST, DST]) {
    const disagreements = inZone(
      tz,
      `
      const out = [];
      for (let h = 0; h < 24; h++) {
        const d = new Date(2026, 7, 29, h, 30, 0, 0);
        if (today(d) !== localDate(d)) out.push({ hour: h, stamped: today(d), local: localDate(d) });
      }
      return out;
    `,
    );
    assert.deepEqual(disagreements, [], `${tz}: today() disagreed with the local calendar`);
  }
});

test('daysSince() counts local calendar days: a fact accessed today is zero days old all day', () => {
  for (const tz of [WEST, EAST, DST]) {
    const wrong = inZone(
      tz,
      `
      const out = [];
      for (let h = 0; h < 24; h++) {
        const d = new Date(2026, 7, 29, h, 30, 0, 0);
        const age = daysSince(localDate(d), d);
        if (age !== 0) out.push({ hour: h, age });
      }
      return out;
    `,
    );
    // Before the fix this returned 1 from 18:00 local onward in a UTC-6 zone —
    // a same-day fact reading as a day stale every evening, which is precisely
    // the interval error CLAUDE.md's convention paragraph is about.
    assert.deepEqual(wrong, [], `${tz}: a fact accessed today did not read as 0 days old at every hour`);
  }
});

test('daysSince() is exact across a DST boundary, where 24-hour arithmetic is not', () => {
  // 2026-03-08 is the US spring-forward: that local day is 23 hours long.
  // Dividing elapsed milliseconds by 86400000 loses the hour and can round a
  // whole day off a longer span.
  const res = inZone(
    DST,
    `
    return {
      acrossSpringForward: daysSince('2026-03-07', new Date(2026, 2, 9, 12, 0, 0)),
      acrossFallBack: daysSince('2026-10-31', new Date(2026, 10, 2, 12, 0, 0)),
      sameDay: daysSince('2026-03-08', new Date(2026, 2, 8, 23, 0, 0)),
      yearSpan: daysSince('2025-08-29', new Date(2026, 7, 29, 3, 0, 0)),
    };
  `,
  );
  assert.equal(res.acrossSpringForward, 2, 'Mar 7 to Mar 9 is two calendar days even though one of them is 23 hours long');
  assert.equal(res.acrossFallBack, 2, 'Oct 31 to Nov 2 is two calendar days even though one of them is 25 hours long');
  assert.equal(res.sameDay, 0);
  assert.equal(res.yearSpan, 365, '2025-08-29 to 2026-08-29 is 365 days');
});

test('a bare PULSE_NOW pins that local day, so a pinned fixture stamps the day it named', () => {
  for (const tz of [WEST, EAST]) {
    const res = inZone(
      tz,
      `
      process.env.PULSE_NOW = '2026-08-28';
      return { today: today(), daysSince: daysSince('2026-08-20'), iso: now().toISOString() };
    `,
    );
    assert.equal(res.today, '2026-08-28', `${tz}: PULSE_NOW=2026-08-28 must make today() return 2026-08-28`);
    // The interval every clock-pinning fixture in pulse/tests depends on. It
    // is unchanged by the move to local dates, which is why those fixtures
    // encoded no part of the bug and needed no edit.
    assert.equal(res.daysSince, 8, `${tz}: 2026-08-20 is 8 days before the pinned day`);
  }
});

test('a PULSE_NOW datetime is an instant and keeps the zone it carries', () => {
  const res = inZone(
    WEST,
    `
    process.env.PULSE_NOW = '2026-08-30T02:00:00Z';
    return { iso: now().toISOString(), today: today() };
  `,
  );
  assert.equal(res.iso, '2026-08-30T02:00:00.000Z', 'the instant is preserved exactly');
  // 02:00 UTC on the 30th is 20:00 on the 29th at UTC-6, and the local day is
  // what the corpus records.
  assert.equal(res.today, '2026-08-29');
});

test('today() and daysSince() agree with each other, whatever the machine', () => {
  // Zone-independent, and therefore the one assertion that also runs in this
  // process against whatever clock the machine really has.
  const d = now();
  assert.equal(today(d), localDate(d));
  assert.equal(daysSince(today(d), d), 0, 'the day this run stamps is zero days old to this run');
  assert.match(today(d), /^\d{4}-\d{2}-\d{2}$/);
});
