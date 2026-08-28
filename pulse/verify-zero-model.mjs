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

process.stdout.write(`verify-zero-model: stripped ${stripped.length} model-related variable(s) from the environment\n`);
for (const name of stripped.sort()) process.stdout.write(`verify-zero-model:   unset ${name}\n`);
process.stdout.write(`verify-zero-model: running ${RUN}\n\n`);

const child = spawn(process.execPath, [RUN, ...process.argv.slice(2)], { cwd: ROOT, env, stdio: 'inherit' });
child.on('close', (code) => {
  process.stdout.write(`\nverify-zero-model: node pulse/run.mjs exited ${code}\n`);
  process.exit(code === 0 ? 0 : 1);
});
