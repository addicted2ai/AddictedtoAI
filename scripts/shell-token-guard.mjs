#!/usr/bin/env node
/**
 * shell-token-guard.mjs — the no-`c`+`d` rule as a MECHANISM (beads addictedtoai-4tk).
 *
 * THE RULE, from CLAUDE.md: the directory-changing shell builtin must never
 * appear as a token in a Bash command run in this repository. Not at the start,
 * not mid-command, not as a shell function name. The reason is not stylistic —
 * the harness's approval classifier matches the TOKEN, not the intent, so the
 * command stalls waiting for an approval that, in an unattended overnight run,
 * is an alert waking the maintainer at night.
 *
 * WHY THIS FILE EXISTS. The instruction failed at every strength available to
 * it: eight violations in two days, in briefs where the rule appeared verbatim
 * and first, and where the substitute was supplied. Five of the eight were the
 * shell-FUNCTION form — an agent DEFENSIVELY DISARMING a builtin it believed
 * might be lurking in a generated command. A rule that reads "do not change
 * directory" does not feel like it applies to someone who is not changing
 * directory. The last violation was written in a brief that quoted the exact
 * forbidden string and explained the mechanism by which six agents had already
 * come to write it. There is no wording left to try, and this repository's own
 * principle is that guardrails are mechanisms, not instructions.
 *
 * WHY THE FILENAME AVOIDS THE TOKEN. Running `node .../shell-token-guard.mjs`
 * must not itself be the thing that trips the classifier. A guard whose own
 * test suite cannot be run without an approval prompt would be self-defeating,
 * so neither this file nor its test names the token in their paths.
 *
 * THE ANCHORING RULE, in one sentence: the token is refused only when it is a
 * whole word standing at a COMMAND POSITION — the start of the string, or
 * immediately after `;`  `&`  `&&`  `|`  `||`  `(`  `$(`  a backtick, a
 * newline, a `{` word, a shell keyword (`if`/`then`/`else`/`elif`/`do`/
 * `while`/`until`/`!`), a command wrapper (`sudo`/`env`/`nohup`/`time`/`exec`/
 * `command`/`builtin`), or a leading VAR=value assignment — which also covers
 * the function-definition form, since `x() { … }` puts the name at a command
 * position by construction.
 *
 * WHAT IT DELIBERATELY DOES NOT REFUSE, because a false positive blocks real
 * work and is worse than the problem it solves:
 *   - the letters inside another word: `abcd`, `s3cmd`, `cdk deploy`
 *   - a path segment: `content/docs/`, `--cwd`, `./x-cd-y.sh`
 *   - anything inside quotes that is not shell code: `git commit -m "… cd …"`
 *   - a heredoc BODY: prose written to a file or a CLI is skipped whole
 *   - a `#` comment
 *   - a flag between a wrapper and the token: `sudo -u alice <token> /x`. A
 *     flag closes the command position so that `command -v <token>` — asking
 *     whether the builtin exists — is not refused. The trade was taken in the
 *     direction of no false positives; neither shape has ever been written here.
 * The last two are measured decisions, not oversights. The written rule also
 * forbids the token in a comment; whether the approval classifier actually
 * trips on one could not be measured without issuing the very approval prompt
 * this guard exists to prevent, so the permissive reading was taken and is
 * recorded here rather than guessed at silently.
 *
 * WHAT IT DOES REFUSE BEYOND THE PLAIN CASES: shell code passed to a shell,
 * i.e. the argument of `bash -c` / `sh -c` / `zsh -lc`, is re-scanned as shell
 * rather than treated as an opaque string. Otherwise the guard would teach the
 * one-line workaround as it refused.
 *
 * It never rewrites a command. A hook that "fixes" the command hides the
 * failure and teaches nothing; this one refuses, names the token, quotes the
 * fragment, and names the substitutes.
 *
 * Entry point: a PreToolUse hook on Bash (.claude/settings.json). Reads the
 * hook payload on stdin, writes a deny decision on stdout AND the reason on
 * stderr, and exits 2 — belt and braces, so it blocks under either of the two
 * refusal protocols the harness supports.
 */

import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The token itself, assembled rather than written.
 *
 * Not superstition: this module's own source is read by agents and quoted into
 * briefs, and a bare occurrence has repeatedly been the seed of the next
 * violation. Assembling it costs nothing and the comparison below is the only
 * place the whole string ever exists.
 */
export const TOKEN = 'c' + 'd';

/** Characters that end a command and open the next one. */
const OPENS_COMMAND = new Set([';', '&', '|', '(', '`', '\n', '\r']);

/** Characters that end a word without opening a command. */
const CLOSES_WORD = new Set([')', '<', '>']);

/**
 * Words that leave the next word still at a command position.
 *
 * Two groups with one behaviour: shell keywords that syntactically precede a
 * command (`if x; then cmd`), and wrappers that run one (`sudo cmd`). A flag
 * after a wrapper deliberately closes the position — `command -v <token>` asks
 * whether the builtin exists and is not an attempt to run it.
 */
const KEEPS_COMMAND_POSITION = new Set([
  '{', '!', 'if', 'then', 'else', 'elif', 'do', 'while', 'until',
  'time', 'sudo', 'env', 'nohup', 'exec', 'command', 'builtin',
]);

/** `FOO=bar cmd` — the assignment prefixes a command, so the position stays open. */
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

/** Interpreters whose `-c` argument is shell code, not an opaque string. */
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'ash', 'bash.exe', 'sh.exe']);

/** `-c`, `-lc`, `-lec`, … — a flag cluster ending in c takes the code. */
const TAKES_CODE = /^-[A-Za-z]*c$/;

const isSpace = (c) => c === ' ' || c === '\t';
const isNewline = (c) => c === '\n' || c === '\r';

/**
 * Read one shell word starting at `start`, honouring quotes and backslashes.
 *
 * Returns the word's VALUE with quoting removed, so `"<token>"` and `\<token>`
 * are recognised for what they are, and the raw span so a caller can look at
 * what followed it.
 */
function readWord(src, start) {
  let i = start;
  let value = '';
  let quoted = false;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\') {
      if (i + 1 >= src.length) { i += 1; continue; }
      if (src[i + 1] === '\n') { i += 2; continue; } // line continuation
      value += src[i + 1];
      i += 2;
      continue;
    }
    if (c === "'") {
      quoted = true;
      let j = i + 1;
      while (j < src.length && src[j] !== "'") { value += src[j]; j += 1; }
      i = j < src.length ? j + 1 : j;
      continue;
    }
    if (c === '"') {
      quoted = true;
      let j = i + 1;
      while (j < src.length && src[j] !== '"') {
        if (src[j] === '\\' && j + 1 < src.length) { value += src[j + 1]; j += 2; continue; }
        value += src[j];
        j += 1;
      }
      i = j < src.length ? j + 1 : j;
      continue;
    }
    if (isSpace(c) || isNewline(c) || OPENS_COMMAND.has(c) || CLOSES_WORD.has(c)) break;
    value += c;
    i += 1;
  }
  return { value, end: i, quoted, raw: src.slice(start, i) };
}

/**
 * Skip the bodies of the heredocs whose operators were seen on the line that
 * just ended. `i` is the index just past that newline.
 *
 * This is why `git commit -F- <<'EOF'` followed by prose is safe: a line of
 * English beginning with the token is a line of English, not a command. The
 * ground rules of this repository actively push multi-line prose into
 * heredocs, so the guard would otherwise refuse the very shape it recommends.
 */
function skipHeredocBodies(src, i, delimiters) {
  for (const delimiter of delimiters) {
    let cursor = i;
    let done = false;
    while (cursor < src.length) {
      let lineEnd = src.indexOf('\n', cursor);
      if (lineEnd === -1) lineEnd = src.length;
      const line = src.slice(cursor, lineEnd).replace(/\r$/, '').trim();
      cursor = lineEnd + 1;
      if (line === delimiter) { done = true; break; }
    }
    i = done ? cursor : src.length;
  }
  return i;
}

/** A short, readable quote of the offending fragment, with an arrow-free window. */
function fragmentAround(src, index) {
  const from = Math.max(0, index - 28);
  const to = Math.min(src.length, index + 40);
  const head = from > 0 ? '…' : '';
  const tail = to < src.length ? '…' : '';
  return head + src.slice(from, to).replace(/\r?\n/g, '⏎') + tail;
}

/**
 * Find the first command-position occurrence of the token.
 *
 * Returns `null` when the command is clean, or
 * `{ index, fragment, form, nested }` when it is not. `form` is `'function'`
 * for the `x()` definition shape and `'command'` otherwise — they get
 * different explanations, because they come from different mistakes.
 */
export function findForbiddenToken(command, depth = 0) {
  if (typeof command !== 'string' || command.length === 0) return null;
  if (depth > 3) return null;

  const src = command;
  let i = 0;
  let atCommandPosition = true;
  let wordIndex = 0;
  let inShellInvocation = false;
  let nextWordIsShellCode = false;
  let pendingHeredocs = [];

  while (i < src.length) {
    const c = src[i];

    if (isSpace(c)) { i += 1; continue; }

    if (isNewline(c)) {
      i += 1;
      if (pendingHeredocs.length > 0) {
        i = skipHeredocBodies(src, i, pendingHeredocs);
        pendingHeredocs = [];
      }
      atCommandPosition = true;
      wordIndex = 0;
      inShellInvocation = false;
      nextWordIsShellCode = false;
      continue;
    }

    if (OPENS_COMMAND.has(c)) {
      atCommandPosition = true;
      wordIndex = 0;
      inShellInvocation = false;
      nextWordIsShellCode = false;
      i += 1;
      continue;
    }

    if (CLOSES_WORD.has(c)) {
      // `<<<` is a here-string: its operand is data on the same line, with no
      // body to skip. Consume the whole operator so the `<<` branch below is
      // not fooled into treating that data as a heredoc delimiter.
      if (c === '<' && src[i + 1] === '<' && src[i + 2] === '<') { i += 3; continue; }
      // `<<delim` opens a heredoc; anything else is a plain redirection whose
      // operand is a filename.
      if (c === '<' && src[i + 1] === '<') {
        let j = i + 2;
        if (src[j] === '-') j += 1;
        while (j < src.length && isSpace(src[j])) j += 1;
        const delimiter = readWord(src, j);
        if (delimiter.value) {
          pendingHeredocs.push(delimiter.value);
          i = delimiter.end;
          continue;
        }
      }
      i += 1;
      continue;
    }

    if (c === '#') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }

    const word = readWord(src, i);
    if (word.end === i) { i += 1; continue; } // never fail to advance
    const start = i;
    i = word.end;

    if (nextWordIsShellCode) {
      nextWordIsShellCode = false;
      const nested = findForbiddenToken(word.value, depth + 1);
      if (nested) return { ...nested, nested: true };
      atCommandPosition = false;
      wordIndex += 1;
      continue;
    }

    if (atCommandPosition && word.value === TOKEN) {
      let j = i;
      while (j < src.length && isSpace(src[j])) j += 1;
      return {
        index: start,
        fragment: fragmentAround(src, start),
        form: src[j] === '(' ? 'function' : 'command',
        nested: false,
      };
    }

    if (atCommandPosition) {
      if (wordIndex === 0 && SHELLS.has(basename(word.value))) inShellInvocation = true;
      if (!KEEPS_COMMAND_POSITION.has(word.value) && !ASSIGNMENT.test(word.value)) {
        atCommandPosition = false;
      }
    } else if (inShellInvocation && TAKES_CODE.test(word.value)) {
      nextWordIsShellCode = true;
    }

    wordIndex += 1;
  }

  return null;
}

/**
 * The refusal text. It never proposes a rewritten command — naming the
 * substitutes is the point, applying one silently is the failure mode this
 * guard was built to avoid.
 */
export function refusalMessage(finding) {
  const lines = [];
  lines.push(`BLOCKED: this command contains the forbidden \`${TOKEN}\` token at a command position.`);
  lines.push('');
  lines.push(`  ${finding.fragment}`);
  lines.push('');
  if (finding.nested) {
    lines.push('It is inside shell code passed to a shell (`-c`), which is still shell code.');
    lines.push('');
  }
  if (finding.form === 'function') {
    lines.push('This is the shell-FUNCTION form, and it is the one that keeps happening.');
    lines.push('You are almost certainly not trying to change directory — you are');
    lines.push('defensively disarming a builtin you think might be lurking in a command.');
    lines.push('That does not help: the approval classifier matches the TOKEN, not the');
    lines.push('intent, so writing the definition IS the violation. Delete it. If the');
    lines.push('command you were guarding against really contains the token, that command');
    lines.push('is the thing to rewrite.');
  } else {
    lines.push('The approval classifier matches the TOKEN, not the intent. In an');
    lines.push('unattended run this does not stall a turn — it raises an approval prompt');
    lines.push('that wakes the maintainer at night. That is the whole reason for the rule.');
  }
  lines.push('');
  lines.push('Substitutes, in order of how often they are the answer here:');
  lines.push('  - git:   git -C D:/AddictedtoAI <subcommand>');
  lines.push('  - npm:   npm --prefix D:/AddictedtoAI run <script>');
  lines.push('  - node:  node D:/AddictedtoAI/<path>.mjs   (absolute path, no working directory needed)');
  lines.push('  - files: use Read / Write / Edit / Grep / Glob, which take absolute paths');
  lines.push('  - anything that genuinely needs a working directory or an exit code:');
  lines.push('    write a .mjs and spawn the command from it with `{ cwd }`.');
  lines.push('');
  lines.push('Rewrite the command yourself and run it again. This guard will not rewrite');
  lines.push('it for you, deliberately: a silent fix teaches nothing.');
  lines.push('(beads addictedtoai-4tk · D:/AddictedtoAI/scripts/shell-token-guard.mjs)');
  return lines.join('\n');
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
    // Fail OPEN, but loudly. A guard that cannot read its input must not block
    // every command in the repository; a guard that fails silently is worse
    // than no guard, because it is believed.
    process.stderr.write(
      `shell-token-guard: could not parse the hook payload, allowing the command unchecked (${err.message})\n`,
    );
    process.exit(0);
  }

  const command = payload?.tool_input?.command;
  if (typeof command !== 'string') process.exit(0);

  const finding = findForbiddenToken(command);
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

// Only run as a hook when invoked directly; importing it for tests must not
// consume stdin.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
