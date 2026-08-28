/**
 * directives.mjs — work source 1, the maintainer's directives.
 *
 * Always selectable first (specs/loop). Completion semantics are mechanical:
 * on completing a directive's job the loop appends `[done <date> <job-id>]`
 * to that directive's line and skips any line carrying one. A directive is
 * never silently re-run; removing finished lines is the maintainer's, at
 * leisure.
 *
 * SPEC GAP, handled explicitly rather than guessed: specs/loop describes a
 * directive as free text, but every selector rule (budget category, wall-clock
 * cap, capacity shedding, the blog ceiling) is keyed by job type. So the file's
 * documented form is `- <job-type>: <instruction>`, and a line whose type is
 * not from the closed list is SKIPPED WITH A LOUD WARNING naming the line,
 * never guessed at. Guessing would spend the wrong budget under the wrong cap
 * and misreport the work in the ledger. The warning prints on every run until
 * the maintainer fixes the line.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { JOB_TYPES } from './config.mjs';

const DONE_MARKER_RE = /\[done\s+[^\]]+\]/;
const ITEM_RE = /^\s*[-*]\s+(.*)$/;

export function parseDirectives(text) {
  const out = [];
  const lines = text.split(/\r?\n/);
  let inFence = false;
  lines.forEach((raw, i) => {
    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const m = ITEM_RE.exec(raw);
    if (!m) return;
    const body = m[1].trim();
    if (!body) return;
    const done = DONE_MARKER_RE.test(body);
    const typeMatch = /^([a-z]+)\s*:\s*(\S.*)$/.exec(body);
    const type = typeMatch && JOB_TYPES.includes(typeMatch[1]) ? typeMatch[1] : null;
    out.push({
      lineNumber: i + 1,
      raw,
      text: body,
      type,
      task: type ? typeMatch[2].replace(DONE_MARKER_RE, '').trim() : body,
      done,
    });
  });
  return out;
}

/**
 * Selectable directives, oldest (topmost) first, with warnings for lines the
 * loop refuses to guess about.
 */
export function readDirectives(ctx) {
  if (!existsSync(ctx.directivesPath)) return { directives: [], warnings: [] };
  const all = parseDirectives(readFileSync(ctx.directivesPath, 'utf8'));
  const warnings = [];
  const directives = [];
  for (const d of all) {
    if (d.done) continue;
    if (!d.type) {
      warnings.push(
        `DIRECTIVES.md:${d.lineNumber}: skipped — no job type. Write ` +
          `"- <job-type>: <instruction>" with a type from ${JOB_TYPES.join('/')}. ` +
          `The loop will not guess a type: the budget category, the wall-clock cap ` +
          `and the shed rules all key off it. Line was: ${JSON.stringify(d.text.slice(0, 90))}`,
      );
      continue;
    }
    directives.push({
      source: 'directive',
      type: d.type,
      title: d.task,
      detail: d.task,
      lineNumber: d.lineNumber,
      raw: d.raw,
    });
  }
  return { directives, warnings };
}

/**
 * Append `[done <date> <job-id>]` to the directive's line. Idempotent: a line
 * already carrying a marker is left alone.
 */
export function markDirectiveDone(ctx, lineNumber, jobId, date) {
  const text = readFileSync(ctx.directivesPath, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const idx = lineNumber - 1;
  if (idx < 0 || idx >= lines.length) {
    throw new Error(`DIRECTIVES.md has no line ${lineNumber}`);
  }
  if (DONE_MARKER_RE.test(lines[idx])) return { changed: false, line: lines[idx] };
  lines[idx] = `${lines[idx].replace(/\s+$/, '')} [done ${date} ${jobId}]`;
  writeFileSync(ctx.directivesPath, lines.join(eol), 'utf8');
  return { changed: true, line: lines[idx] };
}
