import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { measureRoute, recordedKilobytes } from './measure-payload.mjs';

async function measureHtml(html) {
  const dir = await mkdtemp(join(tmpdir(), 'addictedtoai-91s-'));
  try {
    await writeFile(join(dir, 'index.html'), html);
    return await measureRoute(dir, '/');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('gzip is deterministic, while a build stamp can change compressed length', () => {
  const content = '<script>self.__next_f.push([1,"same content"])</script>';
  const first = Buffer.from(`${content}<!-- build-stamp:abc123 -->`);
  const second = Buffer.from(`${content}<!-- build-stamp:xyz987-with-a-different-shape -->`);

  assert.equal(gzipSync(first, { level: 9 }).length, gzipSync(first, { level: 9 }).length);
  assert.notEqual(gzipSync(first, { level: 9 }).length, gzipSync(second, { level: 9 }).length);
});

test('recorded figures stay stable when only the build stamp changes', async () => {
  const content = '<script>self.__next_f.push([1,"same content"])</script>';
  const first = await measureHtml(`${content}<!-- build-stamp:abc123 -->`);
  const second = await measureHtml(`${content}<!-- build-stamp:xyz987-with-a-different-shape -->`);

  assert.equal(recordedKilobytes(first.html_gzip), recordedKilobytes(second.html_gzip));
  assert.equal(recordedKilobytes(first.total.gzip), recordedKilobytes(second.total.gzip));
});

test('meaningful content growth remains recorded', async () => {
  let seed = 0x91;
  const growth = Array.from({ length: 100_000 }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return String.fromCharCode(32 + (seed % 95));
  }).join('');
  const before = await measureHtml('<script>self.__next_f.push([1,"base"])</script>');
  const after = await measureHtml(`<script>self.__next_f.push([1,${JSON.stringify(growth)}])</script>`);

  assert.ok(recordedKilobytes(after.inline.gzip) > recordedKilobytes(before.inline.gzip));
});
