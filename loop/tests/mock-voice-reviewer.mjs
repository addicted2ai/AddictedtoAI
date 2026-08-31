#!/usr/bin/env node
/**
 * mock-voice-reviewer.mjs — a reviewer stand-in for the `reads-human` gate.
 *
 *     node mock-voice-reviewer.mjs <blank|filled> <prompt-file>
 *
 * `mock-executor.mjs`'s reviewer modes obey the brief: a `post` brief asks for
 * `reads-human` and they supply one, which is what a real reviewer does and is
 * what the positive controls need. This script exists for the other half — the
 * refusal case — because a guard rail is only measured by attempting what it
 * forbids, and no mode there deliberately leaves the field blank.
 *
 * It is the same executor contract as every other mock: one written prompt in,
 * files out, exit. No memory, no tools, no structured output.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const [, , mode, promptPath] = process.argv;
const brief = promptPath && existsSync(promptPath) ? readFileSync(promptPath, 'utf8') : '';

/** The verdict path the reviewer brief names, on its own line in backticks. */
const m = /^`(.+\.md)`$/m.exec(brief);
if (!m) process.exit(0);

// `reads-human: ""` written DELIBERATELY, not omitted: an empty front-matter
// value is the case a plain-text fallback scanning the whole file would turn
// into the two-character string `""` and wave through the non-empty check.
const field =
  mode === 'blank'
    ? 'reads-human: ""'
    : 'reads-human: "Short sentences next to long ones, and it calls the vendor\'s note evasive. A person wrote this."';

writeFileSync(
  m[1],
  `---\njob: mock\nverdict: approve\nreasons: []\n` +
    `would-cite: "Anyone arguing that the retirement window was too short."\n${field}\n---\n\n` +
    `Mock voice reviewer, mode ${mode}.\n`,
  'utf8',
);
