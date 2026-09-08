import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import {
  measureRoute,
  recordedKilobytes,
  stableRecordedKilobytes,
  RECORDED_NOISE_FLOOR_BYTES,
} from './measure-payload.mjs';

async function measureHtml(html) {
  const dir = await mkdtemp(join(tmpdir(), 'addictedtoai-91s-'));
  try {
    await writeFile(join(dir, 'index.html'), html);
    return await measureRoute(dir, '/');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function fixture(stamp) {
  const payload = `self.__next_f.push([1,${JSON.stringify(`build:${stamp}|${'serialized-row,'.repeat(5000)}`)}])`;
  return `<html><body><script>${payload}</script></body></html>`;
}

test('gzip is deterministic for identical input', () => {
  const input = Buffer.from(fixture('AAAAAA'));
  assert.deepEqual(gzipSync(input, { level: 9 }), gzipSync(input, { level: 9 }));
});

test('same-shaped inline build stamps make raw measurements vary, then hysteresis stabilizes every recorded field', async () => {
  const stamps = ['A1b2C3d4E5f6G7h8', 'z9Y8x7W6v5U4t3S2', 'mN0pQ1rS2tU3vW4x', 'K5l6M7n8O9p0Q1r2'];
  const measurements = [];
  for (const stamp of stamps) measurements.push(await measureHtml(fixture(stamp)));

  const raw = {
    chunks: measurements.map((m) => m.chunks.gzip),
    inline: measurements.map((m) => m.inline.gzip),
    total: measurements.map((m) => m.total.gzip),
    html: measurements.map((m) => m.html_gzip),
  };
  assert.ok(new Set(raw.inline).size > 1, `inline raw gzip did not vary: ${raw.inline}`);
  assert.ok(new Set(raw.total).size > 1, `total raw gzip did not vary: ${raw.total}`);
  assert.ok(new Set(raw.html).size > 1, `html raw gzip did not vary: ${raw.html}`);
  assert.deepEqual(new Set(raw.chunks).size, 1, 'chunks are correctly unaffected by an inline-only stamp');

  const first = measurements[0];
  for (const field of ['chunks', 'inline', 'total', 'html']) {
    const previous = recordedKilobytes(first[field === 'html' ? 'html_gzip' : `${field}`].gzip);
    const recorded = measurements.map((m) => stableRecordedKilobytes(
      m[field === 'html' ? 'html_gzip' : field].gzip,
      previous,
    ));
    assert.equal(new Set(recorded).size, 1, `${field} recorded value moved: ${recorded}`);
  }
});

test('hysteresis boundary is explicit and real growth remains recorded', async () => {
  const previous = 100;
  assert.equal(stableRecordedKilobytes(previous * 1024 + RECORDED_NOISE_FLOOR_BYTES, previous), previous);
  assert.notEqual(stableRecordedKilobytes(previous * 1024 + RECORDED_NOISE_FLOOR_BYTES + 1, previous), previous);

  let seed = 0x91;
  const growth = Array.from({ length: 100_000 }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return String.fromCharCode(32 + (seed % 95));
  }).join('');
  const before = await measureHtml('<script>self.__next_f.push([1,"base"])</script>');
  const after = await measureHtml(`<script>self.__next_f.push([1,${JSON.stringify(growth)}])</script>`);
  const prior = recordedKilobytes(before.inline.gzip);
  assert.ok(stableRecordedKilobytes(after.inline.gzip, prior) > prior);
});
