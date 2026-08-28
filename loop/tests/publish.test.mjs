/**
 * Task 7.2 — the merge's publish step.
 *
 * specs/loop requires the loop to publish "through the same publish step the
 * Pulse uses". Same, not equivalent: a second implementation would drift, and
 * the drifted one would be the one that pushed. So this file checks the
 * handoff itself, against the real shared step in this repository — the cheap
 * direct check, rather than a fixture that would have passed even if the two
 * had never been wired together.
 *
 * `publish` is false throughout this change, so exercising the real step here
 * cannot push anything: the flag is the shared step's to read, and it prints
 * one skip line and returns.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

import { DEFAULT_REPO_ROOT, makeContext } from '../lib/paths.mjs';
import { findSharedStep, publishStep, FALLBACK_SKIP_LINE } from '../lib/publish.mjs';
import { makeRepo } from './helpers.mjs';

test('the loop finds the Pulse\'s shared publish step where it actually lives', () => {
  const found = findSharedStep(DEFAULT_REPO_ROOT);
  assert.ok(found, 'no shared publish step found — the loop would refuse to publish rather than improvise');
  assert.ok(existsSync(found));
  assert.match(found.replace(/\\/g, '/'), /pulse\/(lib\/)?publish\.mjs$/);
});

test('the loop hands off to the real shared step, which prints its own skip line', async () => {
  const lines = [];
  const ctx = makeContext({ log: (s) => lines.push(s) });
  const res = await publishStep(ctx, {});
  assert.equal(res.published, false);
  const text = lines.join('\n');
  assert.match(text, /publish/);
  assert.match(text, /disabled|publish: false/i, text);
  // and it is the shared step's line, not the loop's own fallback
  assert.ok(!text.includes(FALLBACK_SKIP_LINE), 'the loop must not print its own skip line when the shared step exists');
});

test('with no shared step present, the loop prints the skip line and never improvises a push', async () => {
  const ctx = makeRepo({});
  assert.equal(findSharedStep(ctx.repoRoot), null);
  const skipped = await publishStep(ctx, { cfg: { publish: false } });
  assert.equal(skipped.skipped, true);
  assert.match(ctx.output(), /publishing is disabled/);

  const refused = await publishStep(ctx, { cfg: { publish: true } });
  assert.equal(refused.published, false);
  assert.match(ctx.output(), /publish: REFUSED/);
  assert.match(ctx.output(), /Refusing to improvise one/);
  ctx.cleanup();
});
