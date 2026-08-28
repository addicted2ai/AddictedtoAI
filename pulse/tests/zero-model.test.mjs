/**
 * zero-model.test.mjs — task 3.7: the Pulse's defining property.
 *
 * "It SHALL contain no model invocation on any path and SHALL run to
 * completion on a machine with no model credentials of any kind."
 *
 * This is what keeps the site alive when no inference exists, so it is
 * checked structurally rather than trusted. The import check is an
 * **allowlist**, not a denylist of known SDK names: a denylist only catches
 * the SDKs someone thought of, while an allowlist fails the moment any
 * unvetted package enters the Pulse's dependency graph at all.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const PULSE = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Every bare specifier the shipped Pulse is allowed to import. */
const ALLOWED = new Set(['cheerio', 'fast-glob', 'gray-matter', 'yaml']);

/** Environment variables no file in `pulse/` may read. */
const MODEL_ENV = /\bprocess\.env\.(ANTHROPIC|OPENAI|OPENROUTER|GOOGLE|GEMINI|DEEPSEEK|MISTRAL|COHERE|GROQ|AZURE|HUGGINGFACE|HF|XAI|TOGETHER|FIREWORKS|REPLICATE|OLLAMA)\w*/i;

function shippedFiles() {
  return fg
    .sync('**/*.mjs', { cwd: PULSE, absolute: true, ignore: ['tests/**'] })
    .sort();
}

function specifiersIn(text) {
  const out = [];
  for (const m of text.matchAll(/(?:^|\s)(?:import|export)[\s\S]{0,200}?from\s+['"]([^'"]+)['"]/g)) out.push(m[1]);
  for (const m of text.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push(m[1]);
  for (const m of text.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push(m[1]);
  return out;
}

test('the shipped Pulse imports nothing but node builtins, relative files, and four vetted packages', () => {
  const files = shippedFiles();
  assert.ok(files.length >= 10, `expected the Pulse's source files, found ${files.length}`);
  const offenders = [];
  for (const file of files) {
    for (const spec of specifiersIn(readFileSync(file, 'utf8'))) {
      if (spec.startsWith('node:') || spec.startsWith('.') || spec.startsWith('/')) continue;
      if (ALLOWED.has(spec)) continue;
      offenders.push(`${file}: ${spec}`);
    }
  }
  assert.deepEqual(offenders, [], 'an unvetted package entered the Pulse dependency graph');
});

test('no file in the Pulse reads a model-provider environment variable', () => {
  const offenders = [];
  for (const file of shippedFiles()) {
    const text = readFileSync(file, 'utf8');
    const m = text.match(MODEL_ENV);
    if (m) offenders.push(`${file}: ${m[0]}`);
  }
  assert.deepEqual(offenders, []);
});

test('no file in the Pulse names a model-provider inference endpoint', () => {
  // The OpenRouter *models catalog* is a public, unauthenticated JSON
  // document and is a legitimate data source; its host may therefore appear
  // in `data/sources/registry.json`. What must never appear anywhere in
  // `pulse/` is an inference endpoint.
  const INFERENCE = /api\.(anthropic|openai|deepseek|mistral|cohere|groq|x)\.\w+|\/v1\/(chat\/)?completions|\/v1\/messages|generativelanguage\.googleapis/i;
  const offenders = [];
  for (const file of shippedFiles()) {
    const m = readFileSync(file, 'utf8').match(INFERENCE);
    if (m) offenders.push(`${file}: ${m[0]}`);
  }
  assert.deepEqual(offenders, []);
});

test('the four vetted packages are themselves inference-free by nature', () => {
  // Recorded as an explicit statement rather than an assumption: cheerio is
  // an HTML/XML parser, fast-glob a file matcher, gray-matter a front-matter
  // parser, yaml a YAML parser. None makes a network request of its own.
  const roles = {
    cheerio: 'HTML/XML parser',
    'fast-glob': 'file path matcher',
    'gray-matter': 'front-matter parser',
    yaml: 'YAML parser',
  };
  assert.deepEqual(Object.keys(roles).sort(), [...ALLOWED].sort());
  for (const pkg of ALLOWED) {
    const manifest = JSON.parse(readFileSync(join(PULSE, '..', 'node_modules', pkg, 'package.json'), 'utf8'));
    assert.ok(manifest.name === pkg, `${pkg} is installed`);
  }
});
