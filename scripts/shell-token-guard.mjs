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

/* =====================================================================
 * THE POWERSHELL ARM (beads addictedtoai-pxj).
 *
 * The Bash arm above parses POSIX shell. This harness also exposes a
 * PowerShell tool — Windows PowerShell 5.1 on this machine — as a second,
 * unguarded route to the same approval-prompt stall, and PowerShell's
 * grammar differs from POSIX in ways that would make the Bash matcher
 * either miss real cases or refuse real work if reused unchanged. This arm
 * is a separate matcher, dispatched by `tool_name` in `main()`, and the
 * Bash arm above is untouched: same `TOKEN`, same `findForbiddenToken`,
 * same `refusalMessage`, same tests, same behaviour.
 *
 * WHERE POWERSHELL'S GRAMMAR ACTUALLY DIFFERS, and what this arm does
 * about each:
 *   - The backtick is the ESCAPE character, not command substitution.
 *     `` `c`d `` de-escapes to the literal word "cd" (exactly as Bash's
 *     `\c\d` does) and is refused; a backtick is never treated as opening
 *     a command position.
 *   - Statement separators are `;` `|` newline `&` `(` `$(` `{` (and, on
 *     PowerShell 7 only — a parse error on this machine's 5.1 — `&&` and
 *     `||`, which a lone `&` already covers character-by-character and so
 *     costs nothing to also treat as safe here).
 *   - Command-position keywords: `if` `else` `elseif` `foreach` `while`
 *     `do` `switch` `try` `catch` `finally` `begin` `process` `end`, and
 *     the `&` call operator. `function` is ADDED beyond that list: it is
 *     PowerShell's own analogue of the shell-function-definition hazard
 *     that was 5 of the Bash arm's 8 recorded violations, and skipping it
 *     would leave the single closest PowerShell shape to that pattern
 *     unguarded. `function cd { ... }` is reported with the same
 *     `form: 'function'` explanation as a pasted `cd() { }`.
 *   - PowerShell is CASE-INSENSITIVE for command names and keywords. `CD`,
 *     `Cd`, `cD` all invoke the same alias `cd` does, so the token
 *     comparison here lower-cases before comparing. The Bash arm does not
 *     do this, correctly — Bash is case-sensitive and `CD` is a different,
 *     unrelated (and almost certainly nonexistent) command there.
 *   - `powershell.exe -Command "..."` / `pwsh -c "..."` arguments are
 *     shell code and are re-scanned as PowerShell, exactly as the Bash arm
 *     re-scans `bash -c`. As a bonus this arm also recognises a *POSIX*
 *     shell invoked from PowerShell (`bash -c "..."`, `sh -c "..."`) and
 *     re-scans that argument with the Bash arm's own `findForbiddenToken`
 *     instead — it is POSIX code once handed to `bash`, not PowerShell
 *     code, regardless of which shell launched it.
 *   - Here-string BODIES (`@'...'@` and `@"..."@`) are never scanned. THIS
 *     IS THE SINGLE MOST IMPORTANT CASE: this repository's own ground
 *     rules push multi-line prose into here-strings, and its commit
 *     messages and beads notes discuss this very rule by name, so a naive
 *     guard would refuse the commit that documents the rule it is part
 *     of. The opener `@'` / `@"` is detected, its closer (`'@` / `"@`)
 *     recorded as pending, and the body is skipped at the next newline by
 *     scanning forward for a line whose content — after stripping only
 *     leading whitespace — starts with that closer; scanning resumes
 *     right after the two-character closer rather than discarding the
 *     rest of that line, so a real command chained after the closing
 *     marker on the same line (`@'...'@ | Set-Content x.txt`) is still
 *     checked.
 *   - `<# ... #>` block comments and `#` line comments are skipped whole,
 *     the same permissive trade the Bash arm makes for a `#` comment —
 *     a false positive on prose costs more than the (unmeasured) risk that
 *     the classifier also trips inside a comment. See addictedtoai-6m3.
 *
 * THE ALIAS DECISION, made deliberately rather than left implicit: this
 * arm refuses only the literal two-letter token `cd`, not `chdir` and not
 * `sl` — even though both are real PowerShell aliases for `Set-Location`.
 * The guard's entire purpose is preventing the approval classifier's
 * stall, and that classifier — on all available evidence, including the
 * Bash arm this one mirrors — matches the TOKEN, not the semantic action
 * of changing directory. `chdir` and `sl` do not contain the substring
 * "cd" at all, so refusing them buys no protection against the actual
 * failure mode and only adds false-positive surface (e.g. `sl` is short
 * enough to collide with an unrelated flag or variable name). This is the
 * same choice the Bash arm already made by never refusing `pushd`/`popd`.
 * `Set-Location` itself — the full cmdlet name, not an alias — is likewise
 * never refused, and is offered below as the substitute PowerShell users
 * actually want when they truly need to change location.
 *
 * A DELIBERATE, DOCUMENTED GAP shared with the Bash arm: a `$(...)`
 * subexpression embedded INSIDE a double-quoted string (`"result: $(cd
 * C:\x)"`) is not recursively re-scanned — the whole double-quoted string
 * is read as one opaque value, exactly as the Bash arm reads `"$(cd /x)"`
 * as one opaque word today. Fixing this is out of scope for pxj; it is a
 * pre-existing property of the design this arm mirrors, not a regression.
 * ===================================================================== */

/** Characters that end a PowerShell command and open the next one. */
const PS_OPENS_COMMAND = new Set([';', '&', '|', '(', '{', '\n', '\r']);

/** Characters that end a word without opening a new command position. */
const PS_CLOSES_WORD = new Set([')', '}', '<', '>']);

/**
 * Words that leave the next word still at a command position: the
 * PowerShell keywords that syntactically precede a command or block, plus
 * `function` (see the header — added beyond the minimum list on purpose).
 */
const PS_KEEPS_COMMAND_POSITION = new Set([
  'if', 'else', 'elseif', 'foreach', 'while', 'do', 'switch',
  'try', 'catch', 'finally', 'begin', 'process', 'end', 'function',
]);

/** Interpreters whose `-c`/`-Command` argument is PowerShell code. */
const PS_INTERPRETERS = new Set(['powershell', 'powershell.exe', 'pwsh', 'pwsh.exe']);

/** Interpreters whose `-c` argument is POSIX shell code even from PowerShell. */
const PS_POSIX_INTERPRETERS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'ash', 'bash.exe', 'sh.exe']);

/** `-c` or `-Command`, the two real forms this repo's own examples use. */
const PS_TAKES_CODE = /^-(c|command)$/i;

/**
 * Read one PowerShell "word" starting at `start`.
 *
 * The backtick escapes the NEXT character and is stripped, so `` `c`d ``
 * and `cd` compare equal — the PowerShell equivalent of the Bash reader
 * unescaping `\c\d`. A single quote doubles (`''`) to escape a literal
 * quote inside a single-quoted string. A double-quoted string keeps
 * backtick escapes and is otherwise copied verbatim (see the header note
 * on `$(...)` inside double quotes — deliberately not specially handled,
 * matching the Bash arm's identical treatment of `"$(...)"`).
 */
function readPsWord(src, start) {
  let i = start;
  let value = '';
  while (i < src.length) {
    const c = src[i];
    if (c === '`') {
      if (i + 1 >= src.length) { i += 1; continue; }
      if (src[i + 1] === '\n') { i += 2; continue; } // backtick line continuation
      if (src[i + 1] === '\r' && src[i + 2] === '\n') { i += 3; continue; }
      value += src[i + 1];
      i += 2;
      continue;
    }
    if (c === "'") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "'" && src[j + 1] === "'") { value += "'"; j += 2; continue; }
        if (src[j] === "'") { j += 1; break; }
        value += src[j];
        j += 1;
      }
      i = j;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') {
        if (src[j] === '`' && j + 1 < src.length) { value += src[j + 1]; j += 2; continue; }
        value += src[j];
        j += 1;
      }
      i = j < src.length ? j + 1 : j;
      continue;
    }
    if (isSpace(c) || isNewline(c) || PS_OPENS_COMMAND.has(c) || PS_CLOSES_WORD.has(c)) break;
    value += c;
    i += 1;
  }
  return { value, end: i };
}

/**
 * Skip the bodies of the here-strings whose openers (`@'` / `@"`) were seen
 * on the line that just ended. `i` is the index just past that newline.
 *
 * Unlike the Bash arm's heredoc skip, this resumes scanning right after the
 * two-character closer rather than discarding the rest of its line — a
 * here-string's closer can be followed by real command on the same line
 * (`@'...'@ | Set-Content x.txt`), and swallowing that would be a hole in
 * the guard, not just an imprecision.
 */
function skipPsHereStringBodies(src, i, delimiters) {
  for (const delimiter of delimiters) {
    let cursor = i;
    let resumeAt = null;
    while (cursor < src.length) {
      let lineEnd = src.indexOf('\n', cursor);
      if (lineEnd === -1) lineEnd = src.length;
      const line = src.slice(cursor, lineEnd).replace(/\r$/, '');
      const trimmed = line.replace(/^[ \t]+/, '');
      if (trimmed.startsWith(delimiter)) {
        resumeAt = cursor + (line.length - trimmed.length) + delimiter.length;
        break;
      }
      cursor = lineEnd + 1;
    }
    i = resumeAt !== null ? resumeAt : src.length;
  }
  return i;
}

/**
 * Find the first command-position occurrence of the token in a PowerShell
 * command. Same shape and return value as `findForbiddenToken` above.
 */
export function findForbiddenTokenPowerShell(command, depth = 0) {
  if (typeof command !== 'string' || command.length === 0) return null;
  if (depth > 3) return null;

  const src = command;
  let i = 0;
  let atCommandPosition = true;
  let wordIndex = 0;
  let inShellInvocation = false;
  let shellKind = null; // 'powershell' | 'posix'
  let nextWordIsShellCode = false;
  let pendingHereStrings = [];
  let prevWordLower = null;

  while (i < src.length) {
    const c = src[i];

    if (isSpace(c)) { i += 1; continue; }

    if (isNewline(c)) {
      i += 1;
      if (pendingHereStrings.length > 0) {
        i = skipPsHereStringBodies(src, i, pendingHereStrings);
        pendingHereStrings = [];
      }
      atCommandPosition = true;
      wordIndex = 0;
      inShellInvocation = false;
      shellKind = null;
      nextWordIsShellCode = false;
      prevWordLower = null;
      continue;
    }

    // `<# ... #>` block comment — skipped whole, never scanned.
    if (c === '<' && src[i + 1] === '#') {
      const end = src.indexOf('#>', i + 2);
      i = end === -1 ? src.length : end + 2;
      continue;
    }

    // `#` line comment — skipped to end of line, same trade as the Bash arm.
    if (c === '#') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }

    // `@'` / `@"` — here-string opener. Its body is never scanned; see header.
    if (c === '@' && (src[i + 1] === "'" || src[i + 1] === '"')) {
      pendingHereStrings.push(src[i + 1] === "'" ? "'@" : '"@');
      i += 2;
      atCommandPosition = false;
      wordIndex += 1;
      continue;
    }

    if (PS_OPENS_COMMAND.has(c)) {
      atCommandPosition = true;
      wordIndex = 0;
      inShellInvocation = false;
      shellKind = null;
      nextWordIsShellCode = false;
      prevWordLower = null;
      i += 1;
      continue;
    }

    if (PS_CLOSES_WORD.has(c)) { i += 1; continue; }

    // A backtick at line end, outside a word, is a line continuation: the
    // logical line keeps going, so command position must NOT reset.
    if (c === '`' && (src[i + 1] === '\n' || (src[i + 1] === '\r' && src[i + 2] === '\n'))) {
      i += src[i + 1] === '\r' ? 3 : 2;
      continue;
    }

    const word = readPsWord(src, i);
    if (word.end === i) { i += 1; continue; } // never fail to advance
    const start = i;
    i = word.end;

    if (nextWordIsShellCode) {
      nextWordIsShellCode = false;
      const nested = shellKind === 'posix'
        ? findForbiddenToken(word.value, depth + 1)
        : findForbiddenTokenPowerShell(word.value, depth + 1);
      if (nested) return { ...nested, nested: true };
      atCommandPosition = false;
      wordIndex += 1;
      prevWordLower = word.value.toLowerCase();
      continue;
    }

    const lower = word.value.toLowerCase();

    if (atCommandPosition && lower === TOKEN) {
      let j = i;
      while (j < src.length && isSpace(src[j])) j += 1;
      const form = (prevWordLower === 'function' || src[j] === '(') ? 'function' : 'command';
      return { index: start, fragment: fragmentAround(src, start), form, nested: false };
    }

    if (atCommandPosition) {
      const base = basename(word.value).toLowerCase();
      if (wordIndex === 0 && PS_INTERPRETERS.has(base)) {
        inShellInvocation = true;
        shellKind = 'powershell';
      } else if (wordIndex === 0 && PS_POSIX_INTERPRETERS.has(base)) {
        inShellInvocation = true;
        shellKind = 'posix';
      }
      if (!PS_KEEPS_COMMAND_POSITION.has(lower)) atCommandPosition = false;
    } else if (inShellInvocation && PS_TAKES_CODE.test(word.value)) {
      nextWordIsShellCode = true;
    }

    wordIndex += 1;
    prevWordLower = lower;
  }

  return null;
}

/**
 * The PowerShell refusal text. Same shape and rules as `refusalMessage`:
 * names the token and fragment, never proposes a rewritten command, and
 * offers `Set-Location` (the full cmdlet, not the `cd`/`chdir`/`sl` alias)
 * as the substitute for a genuine need to change location — see the
 * header's alias decision.
 */
export function refusalMessagePowerShell(finding) {
  const lines = [];
  lines.push(`BLOCKED: this PowerShell command contains the forbidden \`${TOKEN}\` token at a command position.`);
  lines.push('');
  lines.push(`  ${finding.fragment}`);
  lines.push('');
  if (finding.nested) {
    lines.push('It is inside code passed to an interpreter (-Command / -c), which is still executable code.');
    lines.push('');
  }
  if (finding.form === 'function') {
    lines.push('This is the function-definition form — PowerShell `function cd { ... }`, or a pasted');
    lines.push('Bash-style `cd() { }` — and it is the shape that kept happening in the Bash arm too.');
    lines.push('You are almost certainly not trying to change directory — you are defensively');
    lines.push('disarming a builtin you think might be lurking in a command. That does not help:');
    lines.push('the approval classifier matches the TOKEN, not the intent, so defining it IS the');
    lines.push('violation. Delete it. If the command you were guarding against really contains the');
    lines.push('token, that command is the thing to rewrite.');
  } else {
    lines.push('The approval classifier matches the TOKEN, not the intent, in PowerShell exactly as');
    lines.push('in Bash. In an unattended run this does not stall a turn — it raises an approval');
    lines.push('prompt that wakes the maintainer at night. That is the whole reason for the rule.');
  }
  lines.push('');
  lines.push('Substitutes, in order of how often they are the answer here:');
  lines.push('  - git:   git -C D:/AddictedtoAI <subcommand>');
  lines.push('  - npm:   npm --prefix D:/AddictedtoAI run <script>');
  lines.push('  - node:  node D:/AddictedtoAI/<path>.mjs   (absolute path, no working directory needed)');
  lines.push('  - files: use Read / Write / Edit / Grep / Glob, which take absolute paths');
  lines.push('  - genuinely need to change location: the full cmdlet name Set-Location does the same');
  lines.push('    thing as the cd/chdir/sl alias without spelling the token the classifier matches.');
  lines.push('  - anything that genuinely needs a working directory or an exit code:');
  lines.push('    write a .mjs and spawn the command from it with `{ cwd }`.');
  lines.push('');
  lines.push('Rewrite the command yourself and run it again. This guard will not rewrite');
  lines.push('it for you, deliberately: a silent fix teaches nothing.');
  lines.push('(beads addictedtoai-pxj, addictedtoai-4tk · D:/AddictedtoAI/scripts/shell-token-guard.mjs)');
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

  // The settings.json matcher this hook is wired under determines which
  // tool invocations reach it at all ("Bash" today; "Bash|PowerShell" once
  // widened). Dispatch on tool_name rather than guessing from the command
  // text, and default to the Bash arm so its existing behaviour — and
  // every test that predates this dispatch — is untouched.
  const isPowerShell = payload?.tool_name === 'PowerShell';
  const finding = isPowerShell ? findForbiddenTokenPowerShell(command) : findForbiddenToken(command);
  if (!finding) process.exit(0);

  const message = isPowerShell ? refusalMessagePowerShell(finding) : refusalMessage(finding);
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
