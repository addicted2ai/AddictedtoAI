#!/usr/bin/env node
/**
 * run-tests.mjs — what `npm test` runs.
 *
 * Finds every `*.test.mjs` (or `.test.js` / `.test.cjs`) under the source
 * directories below and hands them to Node's built-in test runner. No test
 * framework is installed: `node --test` is the whole toolchain.
 *
 * Why a script rather than `node --test` directly: the runner's default
 * discovery would walk `.next/`, `out/` and `node_modules/`, and it errors
 * when a glob matches nothing — which is the normal state until the first
 * fixtures land (task 2.6). This finds files itself and reports honestly
 * when there are none.
 *
 * Test files live beside what they test, e.g. `pulse/tests/linker.test.mjs`
 * (design D6).
 */

import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SEARCH = ['app', 'lib', 'loop', 'pulse', 'scripts', 'tests'];
const SKIP = new Set(['node_modules', '.next', '.git', 'out', 'fixtures-out']);
const IS_TEST = /\.test\.(mjs|cjs|js)$/;

async function walk(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found; // directory does not exist yet — fine
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) await walk(full, found);
    else if (IS_TEST.test(e.name)) found.push(full);
  }
  return found;
}

const files = [];
for (const d of SEARCH) await walk(join(ROOT, d), files);
files.sort();

if (files.length === 0) {
  process.stdout.write(
    'npm test: no *.test.mjs files found yet under ' + SEARCH.join(', ') + '\n',
  );
  process.exit(0);
}

process.stdout.write(`npm test: ${files.length} test file(s)\n`);
for (const f of files) process.stdout.write(`  ${relative(ROOT, f)}\n`);

const res = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
});
process.exit(res.status ?? 1);
