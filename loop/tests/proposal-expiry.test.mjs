/**
 * proposal-expiry.test.mjs — task 2.5, the expiry semantics of work source 3.
 *
 * Three claims, each measured rather than reasoned about:
 *
 *  1. A proposal declaring `expires:` is selectable WITHOUT the 3-day cooling,
 *     and stops being selectable AT its expiry.
 *  2. At expiry it is swept to `data/proposals/dropped/` with a note naming the
 *     expiry — and nothing else is swept with it. A sweep that moved every
 *     expiring candidate would pass a "was it swept?" test and be useless, so
 *     every sweep assertion below carries a candidate that must survive it.
 *  3. `data/proposals/dropped/` is a RECORD, NEVER A BLOCK: a slug present only
 *     there does not auto-discard a new filing, while the same slug in
 *     `rejected/` does. The second half is the positive control for the first —
 *     without it, a rejection index that had simply stopped working would pass.
 *
 * ## Why half of this file runs in child processes
 *
 * An expiry is a LOCAL date compared against the local date of the machine
 * reading it (CLAUDE.md), and on a machine already running in UTC the two are
 * the same string — so a UTC implementation passes every assertion that can be
 * written in-process. Four UTC-vs-local bugs in this repository each survived
 * their own suite that way. The assertions that matter therefore run in a child
 * with `TZ` set, which Node's ICU reads at startup; `pulse/tests/dates.test.mjs`
 * is the pattern.
 *
 * There is a second trap here that the Pulse's does not have. A bare
 * `expires: 2026-09-10` is a YAML 1.1 timestamp: js-yaml hands back a `Date` at
 * UTC midnight, and formatting that with local getters west of Greenwich yields
 * 2026-09-09. The reader takes the literal digits from the file's own bytes for
 * exactly this reason, and the child-process cases below are what prove it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, utimesSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { readProposals, sweepExpiredProposals, readExpiry, localDate } from '../lib/proposals.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const MODULE = pathToFileURL(join(HERE, '..', 'lib', 'proposals.mjs')).href;

const NOW = new Date(2026, 8, 10, 12, 0, 0); // 2026-09-10, local by construction

/** A bare proposals tree — no git, because nothing in this file needs one. */
function tree() {
  const root = mkdtempSync(join(tmpdir(), 'atai-expiry-'));
  const proposalsDir = join(root, 'data', 'proposals');
  const rejectedDir = join(proposalsDir, 'rejected');
  const droppedDirPath = join(proposalsDir, 'dropped');
  mkdirSync(proposalsDir, { recursive: true });
  return { root, proposalsDir, rejectedDir, droppedDir: droppedDirPath };
}

function ctxFor(t, now = () => NOW) {
  return { proposalsDir: t.proposalsDir, rejectedDir: t.rejectedDir, now };
}

/**
 * Plant a proposal. `expires` is written BARE — unquoted — because that is the
 * shape a model writes and the shape YAML turns into a UTC `Date`.
 */
function plant(dir, slug, { type = 'entry', expires = null, ageDays = 0, extra = '' } = {}) {
  mkdirSync(dir, { recursive: true });
  const p = join(dir, `${slug}.md`);
  const fm = [
    `slug: ${slug}`,
    `type: ${type}`,
    'date: 2026-09-01',
    ...(expires === null ? [] : [`expires: ${expires}`]),
    ...(extra ? [extra] : []),
  ].join('\n');
  writeFileSync(p, `---\n${fm}\n---\n\nA candidate body.\n`, 'utf8');
  const t = new Date(NOW.getTime() - ageDays * 24 * 3600 * 1000);
  utimesSync(p, t, t);
  return p;
}

// ---------------------------------------------------------------------------
// 1. Ripe without cooling
// ---------------------------------------------------------------------------

test('a proposal filed today is ripe immediately WITH an expiry and cooling WITHOUT one', () => {
  const t = tree();
  plant(t.proposalsDir, 'expiring-today-file', { expires: '2026-09-14', ageDays: 0 });
  plant(t.proposalsDir, 'ordinary-today-file', { ageDays: 0 });

  const read = readProposals(ctxFor(t));

  // The claim.
  assert.deepEqual(read.ripe.map((r) => r.slug), ['expiring-today-file']);
  // The control that makes it mean something: the SAME age, the SAME tree, and
  // the only difference is the `expires:` line. Without this, a reader that had
  // simply stopped cooling anything would pass the line above.
  assert.deepEqual(read.cooling.map((r) => r.slug), ['ordinary-today-file']);
  assert.match(read.cooling[0].why, /cools for 3 days \(file age\)/);
  assert.equal(read.ripe[0].expires, '2026-09-14');
});

test('an expiring candidate outranks a long-cooled proposal, or the sweep is all expiry ever does', () => {
  const t = tree();
  plant(t.proposalsDir, 'cooled-for-a-month', { ageDays: 30 });
  plant(t.proposalsDir, 'expires-later', { expires: '2026-09-20', ageDays: 0 });
  plant(t.proposalsDir, 'expires-sooner', { expires: '2026-09-12', ageDays: 0 });

  const read = readProposals(ctxFor(t));
  assert.deepEqual(read.ripe.map((r) => r.slug), [
    'expires-sooner',
    'expires-later',
    'cooled-for-a-month',
  ]);
});

// ---------------------------------------------------------------------------
// 2. Not selectable at or past expiry, and swept
// ---------------------------------------------------------------------------

test('at its expiry a candidate stops being selectable and is swept, and its neighbour is not', () => {
  const t = tree();
  plant(t.proposalsDir, 'expired-yesterday', { expires: '2026-09-09' });
  plant(t.proposalsDir, 'expires-today', { expires: '2026-09-10' }); // AT expiry
  plant(t.proposalsDir, 'expires-tomorrow', { expires: '2026-09-11' }); // the survivor

  const ctx = ctxFor(t);
  const read = readProposals(ctx);
  assert.deepEqual(read.expired.map((r) => r.slug).sort(), ['expired-yesterday', 'expires-today']);
  assert.deepEqual(read.ripe.map((r) => r.slug), ['expires-tomorrow']);

  const swept = sweepExpiredProposals(ctx);
  assert.equal(swept.swept.length, 2);
  assert.ok(swept.swept.every((s) => s.moved));

  // The two expired files left the active pool; the third did not. This pair of
  // assertions is the whole point: a sweep that moved all three would satisfy
  // "was it swept?" and destroy the mechanism.
  assert.ok(!existsSync(join(t.proposalsDir, 'expired-yesterday.md')));
  assert.ok(!existsSync(join(t.proposalsDir, 'expires-today.md')));
  assert.ok(existsSync(join(t.proposalsDir, 'expires-tomorrow.md')), 'a live candidate must survive the sweep');

  const files = readdirSync(t.droppedDir);
  assert.equal(files.length, 2, files.join(', '));
  const text = readFileSync(join(t.droppedDir, files.find((f) => f.startsWith('expires-today'))), 'utf8');
  assert.match(text, /## Swept: the expiry it declared has arrived/);
  assert.match(text, /- expires: 2026-09-10/, 'the note names the expiry');
  assert.match(text, /record, never a block/);
  assert.match(text, new RegExp(`- date: ${localDate(NOW)}`));

  // And the reader agrees afterwards: nothing expired is left to sweep.
  assert.equal(readProposals(ctx).expired.length, 0);
  assert.deepEqual(readProposals(ctx).ripe.map((r) => r.slug), ['expires-tomorrow']);
});

test('a dry run reports the sweep and moves nothing', () => {
  const t = tree();
  plant(t.proposalsDir, 'expired-long-ago', { expires: '2026-01-01' });
  const ctx = ctxFor(t);

  const swept = sweepExpiredProposals(ctx, { dryRun: true });
  assert.equal(swept.swept.length, 1);
  assert.equal(swept.swept[0].moved, false);
  assert.match(swept.notes[0], /dry run: not moved/);
  assert.ok(existsSync(join(t.proposalsDir, 'expired-long-ago.md')));
  assert.ok(!existsSync(t.droppedDir));
});

test('an unreadable `expires:` is malformed and skipped, not silently treated as no expiry', () => {
  const t = tree();
  plant(t.proposalsDir, 'expires-soon-ish', { expires: 'soon', ageDays: 0 });

  const read = readProposals(ctxFor(t));
  assert.equal(read.ripe.length, 0, 'an unreadable expiry must not buy the cooling exemption');
  assert.equal(read.cooling.length, 0);
  assert.equal(read.malformed.length, 1);
  assert.match(read.malformed[0].why, /`expires` "soon" is not a YYYY-MM-DD local date/);
});

// ---------------------------------------------------------------------------
// 3. `dropped/` records, `rejected/` blocks
// ---------------------------------------------------------------------------

test('a slug present only in dropped/ does not auto-discard a new filing; the same slug in rejected/ does', () => {
  const t = tree();
  // The story was declined and its refile condition has now arrived.
  plant(t.droppedDir, 'licence-churn', { expires: '2026-09-01' });
  plant(t.proposalsDir, 'licence-churn', { ageDays: 10 });

  const read = readProposals(ctxFor(t));
  assert.equal(read.duplicates.length, 0, 'dropped/ must not feed slug suppression');
  assert.deepEqual(read.ripe.map((r) => r.slug), ['licence-churn']);
  assert.equal(read.rejected.length, 0, 'the rejection index reads rejected/ and nothing else');

  // The positive control. Same tree, same filing; the only change is WHICH
  // directory the earlier copy sits in. Without this, a rejection index that
  // had stopped reading anything at all would pass the assertions above.
  const t2 = tree();
  plant(t2.rejectedDir, 'licence-churn', { extra: 'rejection_reason: a re-tread of an idea already declined' });
  plant(t2.proposalsDir, 'licence-churn', { ageDays: 10 });
  const read2 = readProposals(ctxFor(t2));
  assert.equal(read2.ripe.length, 0);
  assert.equal(read2.duplicates.length, 1);
  assert.match(read2.duplicates[0].why, /a re-tread of an idea already declined/);
});

test('the dropped/ subdirectory is never read as an active proposal', () => {
  const t = tree();
  plant(t.droppedDir, 'a-declined-story', { ageDays: 30 });
  const read = readProposals(ctxFor(t));
  assert.deepEqual(read.ripe, []);
  assert.deepEqual(read.cooling, []);
  assert.deepEqual(read.malformed, []);
});

// ---------------------------------------------------------------------------
// The timezone half. Everything above passes on a UTC-only implementation.
// ---------------------------------------------------------------------------

/** A fixed-offset zone with no DST, west of Greenwich — the maintainer's side. */
const WEST = 'Etc/GMT+6';
/** East of Greenwich, where the failure is the mirror image. */
const EAST = 'Asia/Tokyo';

/**
 * Read a real proposals tree through the REAL exported reader, inside a child
 * process pinned to `tz`. `now` is given as local calendar components so the
 * child constructs the same wall-clock instant its own zone would.
 */
function readInZone(tz, dir, [y, mo, d, h, mi]) {
  const src = `
    import { readProposals, readExpiry } from ${JSON.stringify(MODULE)};
    const now = new Date(${y}, ${mo - 1}, ${d}, ${h}, ${mi}, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    const ctx = {
      proposalsDir: ${JSON.stringify(join(dir, 'data', 'proposals'))},
      rejectedDir: ${JSON.stringify(join(dir, 'data', 'proposals', 'rejected'))},
      now: () => now,
    };
    const read = readProposals(ctx);
    process.stdout.write(JSON.stringify({
      local: \`\${now.getFullYear()}-\${pad(now.getMonth() + 1)}-\${pad(now.getDate())}\`,
      utc: now.toISOString().slice(0, 10),
      ripe: read.ripe.map((r) => r.slug).sort(),
      expired: read.expired.map((r) => r.slug).sort(),
      malformed: read.malformed.length,
      // The YAML-timestamp trap, read through the same export: a BARE date in a
      // file must come back as its own digits whatever zone reads it.
      bare: readExpiry('---\\nexpires: 2026-09-10\\n---\\n', {}),
      parsedOnly: readExpiry('', { expires: new Date(Date.UTC(2026, 8, 10)) }),
    }));
  `;
  const raw = execFileSync(process.execPath, ['--input-type=module', '-e', src], {
    encoding: 'utf8',
    env: { ...process.env, TZ: tz },
  });
  return JSON.parse(raw);
}

/** One tree used by both zone cases, so the only variable is the zone. */
function zoneTree() {
  const t = tree();
  plant(t.proposalsDir, 'expires-09-09', { expires: '2026-09-09' });
  plant(t.proposalsDir, 'expires-09-10', { expires: '2026-09-10' });
  plant(t.proposalsDir, 'expires-09-11', { expires: '2026-09-11' });
  return t;
}

test('west of Greenwich, an evening run does not retire a candidate a day early', () => {
  const t = zoneTree();
  // 20:00 on the 9th at UTC-6 is 02:00 on the 10th in UTC.
  const r = readInZone(WEST, t.root, [2026, 9, 9, 20, 0]);

  // The fixture must actually straddle UTC midnight, or nothing below is a test.
  assert.equal(r.local, '2026-09-09');
  assert.equal(r.utc, '2026-09-10', 'UTC is a day ahead here — which is the whole point');

  // The candidate expiring on the 10th is still live on the evening of the 9th.
  // A UTC implementation reports today as 2026-09-10 and sweeps it tonight.
  assert.deepEqual(r.ripe, ['expires-09-10', 'expires-09-11']);
  assert.deepEqual(r.expired, ['expires-09-09']);
  assert.equal(r.malformed, 0);
});

test('east of Greenwich, a morning run does not keep a candidate a day too long', () => {
  const t = zoneTree();
  // 08:00 on the 10th in Tokyo is 23:00 on the 9th in UTC.
  const r = readInZone(EAST, t.root, [2026, 9, 10, 8, 0]);

  assert.equal(r.local, '2026-09-10');
  assert.equal(r.utc, '2026-09-09', 'UTC lags local here — the mirror of the case above');

  // AT the expiry, so the 10th is gone. A UTC implementation reports today as
  // 2026-09-09 and leaves it selectable all morning.
  assert.deepEqual(r.ripe, ['expires-09-11']);
  assert.deepEqual(r.expired, ['expires-09-09', 'expires-09-10']);
});

test('a bare YAML expiry keeps its own digits in every zone, parsed value or not', () => {
  for (const tz of [WEST, EAST]) {
    const r = readInZone(tz, zoneTree().root, [2026, 9, 10, 8, 0]);
    // The literal read from the file's bytes.
    assert.deepEqual(r.bare, { present: true, date: '2026-09-10', literal: '2026-09-10' }, tz);
    // And the fallback, for a caller that only has js-yaml's `Date`. UTC
    // midnight is how js-yaml builds one, so UTC getters recover the digits;
    // local getters would return 2026-09-09 in the WEST case.
    assert.deepEqual(r.parsedOnly, { present: true, date: '2026-09-10' }, tz);
  }
});

test('readExpiry accepts what a model actually writes, and refuses what it cannot read', () => {
  assert.deepEqual(readExpiry('---\nexpires: "2026-09-10"\n---\n', {}), {
    present: true, date: '2026-09-10', literal: '2026-09-10',
  });
  assert.deepEqual(readExpiry('---\nexpires: 2026-09-10 # news decays\n---\n', {}), {
    present: true, date: '2026-09-10', literal: '2026-09-10',
  });
  assert.equal(readExpiry('---\nslug: x\n---\n', {}).present, false);
  assert.equal(readExpiry('---\nexpires:\n---\n', {}).present, false);
  assert.equal(readExpiry('---\nexpires: next week\n---\n', {}).invalid, true);
  // A `Date` from a full YAML timestamp still yields its UTC calendar day.
  assert.equal(readExpiry('', { expires: new Date(Date.UTC(2026, 8, 10, 6, 0)) }).date, '2026-09-10');
});

test('localDate is the local calendar day, not the UTC one', () => {
  const d = new Date(2026, 8, 10, 23, 30, 0);
  assert.equal(localDate(d), '2026-09-10');
  assert.match(localDate(new Date()), /^\d{4}-\d{2}-\d{2}$/);
});
