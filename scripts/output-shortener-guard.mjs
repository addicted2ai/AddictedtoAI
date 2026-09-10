#!/usr/bin/env node
/**
 * output-shortener-guard.mjs — "truncated output is indistinguishable from
 * complete output" as a MECHANISM, not an instruction.
 *
 * THE RULE, from CLAUDE.md's verification rules:
 *
 *   "Truncated output is indistinguishable from complete output. Never pipe a
 *    counting or enumerating command through `head`/`tail` and treat the result
 *    as exhaustive. Count first (`grep -c`, `wc -l`) or read the whole result."
 *
 * WHY THIS FILE EXISTS, and it is measured rather than argued. Four briefs in
 * two days were written from `bd show <id> | head -N`, and the ACCEPTANCE
 * section of a beads issue sits at the BOTTOM. The shortener deleted it, the
 * reader could not tell, and the briefs shipped missing requirements their
 * source issues carried: an inverted acceptance in one, two of three x2jl
 * requirements dropped in another, a bead's own proposed solution foreclosed in
 * a third. The cost was revision rounds, a rewrite, and a five-round gates
 * packet. The instruction was already written down when all four happened.
 *
 * The wild shape is recorded verbatim in this project's own timeline note:
 * "ACCEPTANCE at bottom, `bd show | head -N` deletes done."
 *
 * WHAT IT REFUSES: an ENUMERATING command whose output is piped into an OUTPUT
 * SHORTENER, when the reader has not said the read is deliberately partial.
 *
 * WHAT IT DELIBERATELY DOES NOT REFUSE, because a guard that blocks real work
 * is disabled within a week and then the property is unguarded while everyone
 * believes it is guarded:
 *
 *   - A DECLARED partial read. `# non-exhaustive` (or `# preview`, `# sample`,
 *     `# first N only`) anywhere in the command marks the read as a peek, and
 *     the guard allows it. This is the entire escape hatch and it is
 *     deliberately cheap: the cost of being right is one comment, and the
 *     comment is exactly the disclosure the rule wants. A reader who writes it
 *     falsely has made a claim in their own words that a later reader can find,
 *     which the silent version never was.
 *   - A shortener with no enumerator on its left: `echo hi | head -1`,
 *     `printf ... | head`. Nothing was enumerated, so nothing was truncated.
 *   - An enumerator whose output is COUNTED rather than shortened:
 *     `git ls-files | wc -l`, `grep -c`. Counting is the remedy the rule names,
 *     so refusing it would refuse the fix.
 *   - `head`/`tail` reading a file directly with no pipe (`head -5 x.log`).
 *     That is a partial read of a file, not a truncated enumeration, and the
 *     four measured instances were all pipelines.
 *   - A shortener inside a heredoc BODY or a quoted string that is not shell
 *     code — prose about this rule must not trip it. This file's own
 *     documentation, and the commit message that lands it, contain the shape.
 *
 * THE ENUMERATOR LIST IS AN ENUMERATION WITH REASONS, not a regex over
 * everything, because the failure mode of the loose version is the blanket ban
 * above. Each entry earned its place by being a command whose output a reader
 * treats as the complete answer to a question:
 *
 *   bd show / list / ready / memories   the measured case: an issue's ACCEPTANCE is at the bottom
 *   git log / show / status / ls-files / ls-tree / branch / diff
 *                                       history, working state and file sets — all read as "all of them"
 *   cat / type                          reading a document whole is the point; a shortened one is a different document
 *   grep / rg / findstr                 matches read as "every match"; the rule names this shape by example
 *   ls / dir / find                     directory contents read as "what is there"
 *   npm ls / node --test                inventories and result lists
 *
 * NOT included, each for a reason: `echo`/`printf` (produce what you gave
 * them), `curl` (a response body is not an enumeration this project reads as a
 * set), `ps`/`tasklist` (a process table is a sample of a moving thing and is
 * read that way already — §7v), and anything not on the list, because the
 * conservative direction here is to miss a case rather than to block real work.
 *
 * Entry point: a PreToolUse hook on Bash and PowerShell, registered in
 * .claude/settings.json beside the shell-token guard, whose payload contract,
 * deny shape, exit code and fail-open behaviour this file mirrors exactly.
 */

import { fileURLToPath } from 'node:url';

/**
 * Commands whose output a reader treats as the complete answer.
 * Matched on the first word, and for `bd`/`git`/`npm` on the subcommand too,
 * so `git config --get x | head` is not swept up by `git`.
 */
export const ENUMERATORS = Object.freeze({
  bare: new Set(['cat', 'type', 'grep', 'rg', 'findstr', 'ls', 'dir', 'find', 'egrep', 'fgrep']),
  sub: new Map([
    ['bd', new Set(['show', 'list', 'ready', 'memories', 'blocked'])],
    ['git', new Set(['log', 'show', 'status', 'ls-files', 'ls-tree', 'branch', 'diff', 'shortlog'])],
    ['npm', new Set(['ls'])],
  ]),
});

/**
 * Commands that shorten their input. `more` is included because it truncates
 * interactively and returns the first page in a captured run.
 */
export const SHORTENERS = new Set(['head', 'tail', 'more']);

/**
 * PowerShell's shorteners are parameters rather than commands, so they are
 * matched on the pair. `Select-Object -First N` / `-Last N` and the `select`
 * alias; `-Skip` alone is not a shortener (it drops a prefix and keeps the
 * rest).
 */
export const PS_SHORTENER_CMDLETS = new Set(['select-object', 'select']);
export const PS_SHORTENER_PARAMS = /^-(first|last)$/i;

/** `sed -n '1,20p'` and `awk 'NR<=20'` are shorteners wearing other clothes. */
const SED_RANGE = /^-n$/;
const SED_PRINT_RANGE = /^['"]?\d+(,\d+)?p['"]?$/;
const AWK_HEAD = /NR\s*<=?\s*\d+/;

/**
 * The declared-partial marker. Any of these anywhere in the command allows the
 * pipeline through. Deliberately several spellings: a guard whose escape hatch
 * has to be remembered exactly is a guard people route around instead of using.
 */
export const NON_EXHAUSTIVE_MARKER = /#\s*(non-exhaustive|not exhaustive|preview|sample|peek|first \d+ only|spot check)/i;

/** Split a command string into pipeline segments, ignoring quoted pipes. */
function pipelineSegments(command) {
  const segments = [];
  let current = '';
  let quote = null;
  let i = 0;
  while (i < command.length) {
    const c = command[i];
    if (quote) {
      if (c === '\\' && quote === '"' && i + 1 < command.length) { current += c + command[i + 1]; i += 2; continue; }
      if (c === quote) quote = null;
      current += c;
      i += 1;
      continue;
    }
    if (c === "'" || c === '"') { quote = c; current += c; i += 1; continue; }
    // `||` is a control operator, not a pipe. Consume both characters so the
    // second one does not open a spurious segment.
    if (c === '|' && command[i + 1] === '|') { segments.length = 0; current = ''; i += 2; continue; }
    if (c === '|') { segments.push(current); current = ''; i += 1; continue; }
    if (c === ';' || c === '\n') { segments.push(current); current = ''; i += 1; continue; }
    current += c;
    i += 1;
  }
  segments.push(current);
  return segments;
}

/** The words of one segment, with surrounding quotes stripped from each. */
function words(segment) {
  const out = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < segment.length; i += 1) {
    const c = segment[i];
    if (quote) {
      if (c === quote) { quote = null; continue; }
      current += c;
      continue;
    }
    if (c === "'" || c === '"') { quote = c; continue; }
    if (c === ' ' || c === '\t') { if (current) { out.push(current); current = ''; } continue; }
    current += c;
  }
  if (current) out.push(current);
  return out;
}

/** Strip a leading path and a `.exe`, so `/usr/bin/head` and `head.exe` match. */
function baseName(word) {
  const cut = word.replace(/\\/g, '/');
  const last = cut.slice(cut.lastIndexOf('/') + 1);
  return last.replace(/\.exe$/i, '').toLowerCase();
}

/** Is this segment an enumerating command? */
export function isEnumerator(segment) {
  const w = words(segment).filter((x) => x !== '');
  if (w.length === 0) return null;
  // Skip a leading VAR=value assignment and common wrappers so
  // `sudo git log | head` is still seen.
  let idx = 0;
  while (idx < w.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w[idx]) || ['sudo', 'env', 'time', 'nohup'].includes(baseName(w[idx])))) idx += 1;
  if (idx >= w.length) return null;
  const head = baseName(w[idx]);
  if (ENUMERATORS.bare.has(head)) return head;
  const subs = ENUMERATORS.sub.get(head);
  if (subs) {
    // The first following word that is not a flag is the subcommand.
    for (let j = idx + 1; j < w.length; j += 1) {
      if (w[j].startsWith('-')) continue;
      // `git -C <dir> log` — the value of a flag that takes one is not the
      // subcommand. Only `-C` and `--git-dir` take a value in the shapes this
      // repository actually writes, and both are followed by a path.
      if (w[j - 1] === '-C' || w[j - 1] === '--git-dir' || w[j - 1] === '--prefix') continue;
      return subs.has(w[j].toLowerCase()) ? `${head} ${w[j].toLowerCase()}` : null;
    }
    return null;
  }
  return null;
}

/** Is this segment an output shortener? Returns its name, or null. */
export function isShortener(segment, { powershell = false } = {}) {
  const w = words(segment).filter((x) => x !== '');
  if (w.length === 0) return null;
  const head = baseName(w[0]);

  if (SHORTENERS.has(head)) {
    // `tail -f` follows a stream rather than shortening a finished one.
    if (head === 'tail' && w.some((x) => x === '-f' || x === '--follow')) return null;
    return head;
  }
  if (head === 'sed' && w.some((x) => SED_RANGE.test(x)) && w.some((x) => SED_PRINT_RANGE.test(x))) return 'sed range';
  if (head === 'awk' && w.some((x) => AWK_HEAD.test(x))) return 'awk NR limit';

  if (powershell || PS_SHORTENER_CMDLETS.has(head)) {
    if (PS_SHORTENER_CMDLETS.has(head) && w.some((x) => PS_SHORTENER_PARAMS.test(x))) {
      return `${head} ${w.find((x) => PS_SHORTENER_PARAMS.test(x))}`;
    }
  }
  return null;
}

/**
 * Find an enumerating command shortened without a declaration.
 *
 * Returns null when the command is clean, or `{ enumerator, shortener,
 * fragment }` when it is not.
 */
export function findTruncatedEnumeration(command, { powershell = false } = {}) {
  if (typeof command !== 'string' || command.length === 0) return null;
  if (NON_EXHAUSTIVE_MARKER.test(command)) return null;

  // A heredoc body is prose, not shell code — the same decision the shell-token
  // guard makes, and for the same reason: this repository's ground rules push
  // multi-line prose into heredocs, so a naive scan would refuse the commit
  // message that documents this very rule.
  const withoutHeredocs = command.replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?^\s*\1\s*$/gm, '<<HEREDOC');

  const segments = pipelineSegments(withoutHeredocs);
  for (let i = 0; i + 1 < segments.length; i += 1) {
    const enumerator = isEnumerator(segments[i]);
    if (!enumerator) continue;
    const shortener = isShortener(segments[i + 1], { powershell });
    if (!shortener) continue;
    return {
      enumerator,
      shortener,
      fragment: `${segments[i].trim()} | ${segments[i + 1].trim()}`.slice(0, 160),
    };
  }
  return null;
}

/**
 * The refusal. It names the rule, quotes the pipeline, names the two remedies
 * the rule itself names, and names the declaration that allows a deliberate
 * peek. It never rewrites the command — a silent fix teaches nothing, and here
 * it would also silently decide for the reader whether the read was exhaustive.
 */
export function refusalMessage(finding) {
  return [
    'BLOCKED: this pipes an enumerating command into an output shortener.',
    '',
    `  ${finding.fragment}`,
    '',
    `\`${finding.enumerator}\` enumerates; \`${finding.shortener}\` shortens. TRUNCATED OUTPUT IS`,
    'INDISTINGUISHABLE FROM COMPLETE OUTPUT — the result looks exactly like the',
    'whole answer, and nothing downstream can tell that it is not.',
    '',
    'This is measured, not hypothetical. Four briefs were written from',
    '`bd show <id> | head -N`, and a beads issue keeps its ACCEPTANCE section at',
    'the BOTTOM. The shortener deleted it every time. Those briefs shipped',
    'missing requirements their own source issues carried, and cost revision',
    'rounds, a rewrite and a five-round packet.',
    '',
    'What to do instead:',
    '  - COUNT first, then decide:  ... | wc -l    grep -c ...    --json | node -e',
    '  - read the WHOLE result, and if it is large, write it to a file and read',
    '    that file with the Read tool, which pages without discarding.',
    '  - if you want the LAST part, ask for it directly rather than dropping the',
    '    first part silently.',
    '',
    'If the read really is meant to be partial, SAY SO IN THE COMMAND and it is',
    'allowed: add `# non-exhaustive` (or `# preview`, `# sample`, `# spot check`).',
    'The comment is the disclosure the rule wants — a later reader can find it,',
    'which a silent truncation never was.',
    '(CLAUDE.md verification rules · D:/AddictedtoAI/scripts/output-shortener-guard.mjs)',
  ].join('\n');
}

/** Read all of stdin as UTF-8. */
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch (err) {
    // Fail OPEN, but loudly — the shell-token guard's decision, for its reason:
    // a guard that cannot read its input must not block every command in the
    // repository, and one that fails silently is worse than none because it is
    // believed.
    process.stderr.write(
      `output-shortener-guard: could not parse the hook payload, allowing the command unchecked (${err.message})\n`,
    );
    process.exit(0);
  }

  const command = payload?.tool_input?.command;
  if (typeof command !== 'string') process.exit(0);

  const powershell = payload?.tool_name === 'PowerShell';
  const finding = findTruncatedEnumeration(command, { powershell });
  if (!finding) process.exit(0);

  const message = refusalMessage(finding);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: message,
      },
    }),
  );
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
