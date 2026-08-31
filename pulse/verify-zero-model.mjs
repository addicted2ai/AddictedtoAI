#!/usr/bin/env node
/**
 * verify-zero-model.mjs — task 3.7's verification, as a runnable command.
 *
 * Strips every model-related environment variable from the environment and
 * runs the real `pulse/run.mjs` in it, reporting the exit code. This is the
 * measurement behind the Pulse's defining property; it is kept as a script so
 * the check can be repeated by anyone, on any machine, at any time, rather
 * than existing only as a claim in a report.
 *
 * Variable *names* are printed. Values are never read and never printed.
 *
 *   node pulse/verify-zero-model.mjs [extra pulse args...]
 *
 * THIS SCRIPT NEVER PUBLISHES, and that is enforced rather than intended
 * (addictedtoai-r8k). It used to. On 2026-08-30 a sealed reviewer, told to test
 * the model-free invariant by RUNNING it — which is this repository's own
 * verification rule — ran this script with `data/config.json` `publish: true`.
 * The spawned run reached its publish step and pushed origin/main. The agent had
 * been told twice never to push; the trap was the name. A script called
 * `verify-zero-model` reads as a read-only assertion about the codebase, and it
 * carried a deploy.
 *
 * The guard is two flags appended to the child's argv, below:
 *
 *   --dry-run        the publish step prints its commands and returns before
 *                    any `git add`, `commit` or `push` (pulse/lib/publish.mjs).
 *   --assume-publish exercise the publish path even when config says false.
 *
 * Appending rather than defaulting is the mechanism: `run.mjs` parses argv into
 * a Set, so a caller can add flags but cannot remove these two. Publishing is
 * not disabled by convention here; it is unreachable.
 *
 * `--assume-publish` makes this verifier INDEPENDENT OF THE CONFIG FLAG, which
 * is the deeper repair. Both incidents in this class — this one and `npm test`
 * (addictedtoai-wxq / -64y) — happened because code assumed `publish` was false
 * and nothing re-checked when it changed. This script now behaves identically
 * whichever way the flag is set, and covers MORE than it did before: the publish
 * path is now always walked, model-free, instead of being skipped whenever the
 * flag happened to be off.
 */

import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = join(HERE, 'run.mjs');
const ROOT = resolve(HERE, '..');

const MODEL_VAR = /(ANTHROPIC|OPENAI|OPENROUTER|GOOGLE|GEMINI|VERTEX|DEEPSEEK|MISTRAL|COHERE|GROQ|AZURE_OPENAI|HUGGINGFACE|HUGGING_FACE|^HF_|XAI|TOGETHER|FIREWORKS|REPLICATE|OLLAMA|PERPLEXITY|CLAUDE|LLM|MODEL|AI_GATEWAY|BEDROCK)/i;

const env = { ...process.env };
const stripped = [];
for (const name of Object.keys(env)) {
  if (MODEL_VAR.test(name)) {
    delete env[name];
    stripped.push(name);
  }
}

// Appended last so no caller argument can displace them; `run.mjs` reads argv
// into a Set, so these are additive and cannot be unset. See the docblock.
const NEVER_PUBLISH = ['--dry-run', '--assume-publish'];
const childArgs = [RUN, ...process.argv.slice(2), ...NEVER_PUBLISH];

process.stdout.write(`verify-zero-model: stripped ${stripped.length} model-related variable(s) from the environment\n`);
for (const name of stripped.sort()) process.stdout.write(`verify-zero-model:   unset ${name}\n`);
process.stdout.write(`verify-zero-model: publishing disarmed — forcing ${NEVER_PUBLISH.join(' ')} (addictedtoai-r8k)\n`);
process.stdout.write(`verify-zero-model: running ${RUN}\n\n`);

const child = spawn(process.execPath, childArgs, { cwd: ROOT, env, stdio: 'inherit' });
child.on('close', (code) => {
  process.stdout.write(`\nverify-zero-model: node pulse/run.mjs exited ${code}\n`);
  process.exit(code === 0 ? 0 : 1);
});
