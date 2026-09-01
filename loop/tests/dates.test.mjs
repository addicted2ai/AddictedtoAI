/**
 * dates.test.mjs — the Desk stamps LOCAL calendar dates (beads
 * addictedtoai-nmr, addictedtoai-t9h).
 *
 * ## What broke, and why nothing here caught it
 *
 * Three sites in `loop/` minted a calendar date in UTC while `CLAUDE.md` and
 * `AGENTS.md` set the opposite rule for the whole repository: *"Every date in
 * this repository is the LOCAL date of the machine that wrote it."*
 *
 *   loop/run.mjs         the `[done DATE jobId]` marker in `DIRECTIVES.md`
 *   loop/lib/review.mjs  `date:` in a review record's front matter
 *   loop/lib/ledger.mjs  the day part of a job id, via `getUTC*`
 *
 * The Desk runs unattended, so at UTC-6 every run after 18:00 local wrote
 * tomorrow — six hours out of every twenty-four, into files a person reads.
 * The ledger one was found live: a job started at 20:31 on 2026-08-29 was
 * named `j-20260830-01` and then wrote a review record dated `2026-08-29`, so
 * one job disagreed with itself by a day.
 *
 * ## Why this file forces a timezone
 *
 * This is the shape of `pulse/tests/dates.test.mjs`, copied deliberately and
 * for the reason its own header gives: **a date test that does not force `TZ`
 * in a child process cannot fail on a UTC box and proves nothing.** On a
 * machine already in UTC, local and UTC are the same string and the broken
 * implementation satisfies every assertion that can be written about it. Four
 * separate UTC-vs-local defects in this repository each survived their own
 * suite for exactly that reason: every fixture pinned the clock to a bare date
 * that the buggy path round-tripped exactly, so the bug cancelled itself.
 *
 * `TZ` is read by Node's ICU at process startup, hence a child process rather
 * than an assignment.
 *
 * Each test below was watched failing against the pre-fix code before it was
 * kept — see the per-test notes naming what the old value was.
 *
 * ## What this file cannot reach, measured
 *
 * Mutation-tested on 2026-08-31, one fix at a time, restoring between each:
 *
 *   loop/lib/ledger.mjs   reverted -> this file RED, source check RED
 *   loop/lib/review.mjs   reverted -> this file RED, source check RED
 *   loop/run.mjs          reverted -> this file GREEN, source check RED
 *
 * The third row is the important one. `markDirectiveDone` is tested here
 * directly and correctly, but `run.mjs`'s CALL SITE — which is where the date
 * is actually chosen — sits inside the loop's main job path, behind a real
 * executor, a real reviewer, a real merge and a real publish. No unit test
 * reaches it. `scripts/local-dates.test.mjs` is the only mechanism in this
 * repository that can, which is the concrete case for that file existing
 * alongside this one rather than instead of it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const LIB = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib');
const url = (f) => pathToFileURL(join(LIB, f)).href;

const pad = (n) => String(n).padStart(2, '0');
/** The local calendar date of a Date, computed independently of the subject. */
const localOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// A fixed-offset zone with no DST, so the arithmetic is stated once and does
// not depend on the month. UTC-6 is the maintainer's measured offset.
const WEST = 'Etc/GMT+6';
// East of Greenwich the failure is the mirror image: a UTC stamp writes
// YESTERDAY through the early morning.
const EAST = 'Asia/Tokyo';
// A real DST zone, so nothing here quietly assumes a fixed offset.
const DST = 'America/Chicago';
const ZONES = [WEST, EAST, DST];

/**
 * Run a probe against the REAL exported functions in a child process pinned to
 * `tz`. The probe returns JSON; anything it throws fails the test.
 */
function inZone(tz, probeBody) {
  const src = `
    import { localDate, localDayStamp } from ${JSON.stringify(url('dates.mjs'))};
    import { nextJobId } from ${JSON.stringify(url('ledger.mjs'))};
    import { writeVerdictRecord } from ${JSON.stringify(url('review.mjs'))};
    import { markDirectiveDone } from ${JSON.stringify(url('directives.mjs'))};
    const pad = (n) => String(n).padStart(2, '0');
    const localOf = (d) => \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}\`;
    const out = await (async () => { ${probeBody} })();
    process.stdout.write(JSON.stringify(out));
  `;
  const raw = execFileSync(process.execPath, ['--input-type=module', '-e', src], {
    encoding: 'utf8',
    env: { ...process.env, TZ: tz },
  });
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------

test('localDate stamps the local day at every hour, in every zone, in both directions', () => {
  for (const tz of ZONES) {
    const disagreements = inZone(
      tz,
      `
      const out = [];
      for (let h = 0; h < 24; h++) {
        const d = new Date(2026, 7, 29, h, 30, 0, 0);
        if (localDate(d) !== localOf(d)) out.push({ hour: h, stamped: localDate(d), local: localOf(d) });
      }
      return out;
    `,
    );
    assert.deepEqual(disagreements, [], `${tz}: localDate disagreed with the local calendar`);
  }
});

test('the 20:31 evening run — the hour the Desk was measured getting wrong — stamps today', () => {
  // The literal incident: a job started at 20:31 local on 2026-08-29 at UTC-6.
  const r = inZone(
    WEST,
    `
    const d = new Date(2026, 7, 29, 20, 31, 0, 0);
    return {
      local: localOf(d),
      utc: d.toISOString().slice(0, 10),
      localDate: localDate(d),
      dayStamp: localDayStamp(d),
      jobId: nextJobId([], d, []),
    };
  `,
  );
  // The fixture has to straddle UTC midnight or it proves nothing.
  assert.equal(r.local, '2026-08-29');
  assert.equal(r.utc, '2026-08-30', 'UTC is a day ahead here — that is the whole point of this fixture');
  assert.equal(r.localDate, '2026-08-29');
  assert.equal(r.dayStamp, '20260829');
  // Was `j-20260830-01` before the fix, which is how this was found in the wild.
  assert.equal(r.jobId, 'j-20260829-01', 'a job id is a calendar-day label and must match the records that job writes');
});

test('nextJobId numbers the sequence within the LOCAL day, so an evening job does not restart at 01', () => {
  // The subtler half of the ledger bug: with a UTC day part, the 18:00 local
  // run jumped to a fresh `j-<tomorrow>-01` while `j-<today>-NN` was still the
  // day's real sequence, so two jobs on one local day got unrelated ids.
  const r = inZone(
    WEST,
    `
    const morning = new Date(2026, 7, 29, 9, 0, 0, 0);
    const evening = new Date(2026, 7, 29, 20, 31, 0, 0);
    const first = nextJobId([], morning, []);
    const second = nextJobId([{ id: first }], evening, []);
    return { first, second };
  `,
  );
  assert.equal(r.first, 'j-20260829-01');
  assert.equal(r.second, 'j-20260829-02', 'the evening job is the second job of the same local day');
});

test('a review record written in the evening carries the local date', () => {
  for (const tz of [WEST, EAST]) {
    const dir = mkdtempSync(join(tmpdir(), 'atai-loop-dates-'));
    try {
      const r = inZone(
        tz,
        `
        const d = new Date(2026, 7, 29, 20, 31, 0, 0);
        const ctx = { reviewsDir: ${JSON.stringify(dir.replace(/\\/g, '/'))}, now: () => d };
        const p = writeVerdictRecord(ctx, 'j-20260829-01', { verdict: 'approve', wouldCite: 'a line' });
        const { readFileSync } = await import('node:fs');
        return { text: readFileSync(p, 'utf8'), local: localOf(d), utc: d.toISOString().slice(0, 10) };
      `,
      );
      // Before the fix the record read `date: 2026-08-30` at UTC-6 — a review
      // record dated a day into the future, which `lib/reviews.mjs` then
      // compares against the corpus's local dates.
      assert.match(r.text, new RegExp(`^date: ${r.local}$`, 'm'), `${tz}: the record must carry the local date`);
      if (r.local !== r.utc) {
        assert.doesNotMatch(r.text, new RegExp(`^date: ${r.utc}$`, 'm'), `${tz}: the record must not carry the UTC date`);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

test('a DIRECTIVES.md completion marker carries the local date', () => {
  for (const tz of [WEST, EAST]) {
    const dir = mkdtempSync(join(tmpdir(), 'atai-loop-dates-'));
    const path = join(dir, 'DIRECTIVES.md');
    try {
      writeFileSync(path, '# Directives\n\n- do the thing\n', 'utf8');
      const r = inZone(
        tz,
        `
        const d = new Date(2026, 7, 29, 20, 31, 0, 0);
        const ctx = { directivesPath: ${JSON.stringify(path.replace(/\\/g, '/'))} };
        const m = markDirectiveDone(ctx, 3, 'j-20260829-01', localDate(d));
        return { line: m.line, local: localOf(d), utc: d.toISOString().slice(0, 10) };
      `,
      );
      assert.equal(r.line, `- do the thing [done ${r.local} j-20260829-01]`);
      assert.match(readFileSync(path, 'utf8'), new RegExp(`\\[done ${r.local} j-20260829-01\\]`));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

test('localDate and localDayStamp agree with the real clock, whatever this machine is', async () => {
  // Zone-independent, and therefore the one assertion that runs in THIS
  // process, against the real exports and whatever clock the machine has.
  const { localDate, localDayStamp } = await import('../lib/dates.mjs');
  const d = new Date();
  assert.equal(localDate(d), localOf(d));
  assert.equal(localDayStamp(d), localOf(d).replace(/-/g, ''));
  assert.match(localDate(), /^\d{4}-\d{2}-\d{2}$/);
  assert.match(localDayStamp(), /^\d{8}$/);
});

test('proposals.mjs still exports localDate, and it is the same function', async () => {
  // The move out of `proposals.mjs` kept that import path working on purpose —
  // `loop/tests/proposal-expiry.test.mjs` imports it from there, and so may
  // anything else that learned it there. This asserts it is a re-export rather
  // than a fourth copy, which is the thing this whole change is about.
  const fromDates = (await import('../lib/dates.mjs')).localDate;
  const fromProposals = (await import('../lib/proposals.mjs')).localDate;
  assert.equal(fromProposals, fromDates, 'proposals.localDate must BE dates.localDate, not a copy of it');
});
