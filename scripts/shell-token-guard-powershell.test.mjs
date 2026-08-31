/**
 * The forbidden-shell-token guard's PowerShell arm (beads addictedtoai-pxj,
 * parent addictedtoai-4tk).
 *
 * This is the sibling of shell-token-guard.test.mjs, covering
 * findForbiddenTokenPowerShell / refusalMessagePowerShell instead of the
 * Bash-parsing pair. The Bash arm and its test file are UNCHANGED by this
 * work — see shell-token-guard.test.mjs for that suite, still green.
 *
 * The same two-sided principle applies, and the second side is still the
 * larger one: every legitimate command below is real text — mined from
 * .claude/settings.local.json's verbatim PowerShell allow rules (the
 * Get-CimInstance pipelines), this repository's own beads memories
 * (junction-removal-must-be-verified, worktree-node-modules-junction), and
 * the PowerShell tool's own documented syntax (Get-Content -TotalCount,
 * (Get-Command x).Source, New-Item -ItemType Directory -Force, try/catch
 * -ErrorAction Stop, the & call operator, here-strings). A matcher that
 * refuses the token is easy; one that refuses the token and nothing else,
 * on a SECOND shell grammar, is the only kind worth wiring to a
 * PreToolUse hook next to the Bash one.
 *
 * Forbidden strings are ASSEMBLED from the module's TOKEN export, exactly
 * as the Bash suite does, for the same two reasons: it proves the export
 * is what is actually compared, and it keeps this file quotable into a
 * brief without seeding the next violation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TOKEN,
  findForbiddenTokenPowerShell,
  refusalMessagePowerShell,
} from './shell-token-guard.mjs';

const T = TOKEN;
const GUARD = join(dirname(fileURLToPath(import.meta.url)), 'shell-token-guard.mjs');

/**
 * Every shape the token can take at a command position IN POWERSHELL,
 * grouped by the grammar rule it exercises.
 */
const MUST_REFUSE_PS = [
  // the plain prefix
  `${T} C:/AddictedtoAI`,
  `${T}`,
  `${T} D:/AddictedtoAI; npm --prefix D:/AddictedtoAI test`,

  // PowerShell is CASE-INSENSITIVE for command names — Bash is not, and
  // this is the one comparison rule that must differ from the Bash arm.
  `CD C:/AddictedtoAI`,
  `Cd C:/AddictedtoAI`,
  `cD C:/AddictedtoAI`,

  // the function-definition form: PowerShell's OWN syntax...
  `function ${T} { }`,
  `function ${T} { Write-Output 1 }`,
  `function ${T} ($path) { Set-Location $path }`,
  // ...and a pasted Bash-style shape, which PowerShell would choke on if
  // actually run but which must still be REFUSED rather than let through
  // on a technicality — nobody typing it is trying to change directory.
  `${T}() { }`,
  `${T} () { }`,
  `${T}(){ Write-Output 1 }; git -C D:/AddictedtoAI status`,

  // after each PowerShell statement separator
  `Get-ChildItem; ${T} C:/x`,
  `Get-ChildItem | ${T}`,
  `Get-ChildItem & ${T} C:/x`,
  `${T}&C:/x`,
  `(${T} C:/x)`,
  `(${T} C:/x; Get-ChildItem)`,
  `{ ${T} C:/x }`,
  `$(${T} C:/x)`,
  `Get-ChildItem\n${T} C:/x`,
  `Get-ChildItem\r\n${T} C:/x`,
  `Write-Output 1\n\n${T} C:/x\nGet-ChildItem`,

  // after each PowerShell command-position keyword. Real PowerShell
  // control keywords are almost always followed by `(` or `{` (which
  // already open a command position as punctuation on their own), so
  // these belt-and-suspenders cases exist to test the keyword table
  // itself, directly, the way the Bash suite's `if`/`while`/`until` cases
  // test valid Bash — even where the PowerShell shape is not fully
  // idiomatic without an intervening paren.
  `if ${T} C:/x`,
  `else ${T} C:/x`,
  `elseif ${T} C:/x`,
  `foreach ${T} C:/x`,
  `while ${T} C:/x`,
  `do ${T} C:/x`,
  `switch ${T} C:/x`,
  `try ${T} C:/x`,
  `catch ${T} C:/x`,
  `finally ${T} C:/x`,
  `begin ${T} C:/x`,
  `process ${T} C:/x`,
  `end ${T} C:/x`,

  // the & call operator, PowerShell's own way to invoke something by name
  `& ${T} C:/x`,
  `&${T} C:/x`,

  // backtick is the ESCAPE character here, not command substitution —
  // `c`d de-escapes to the literal word "cd", exactly as Bash's \c\d does
  '`c`d C:/x',
  "`c`d",
  // a continuation that does NOT clear an already-open command position
  `Get-ChildItem; \`\n${T} C:/x`,

  // quoting does not launder it
  `"${T}" C:/x`,
  `'${T}' C:/x`,

  // shell code handed to an interpreter is still shell code, however deep
  `powershell.exe -Command "${T} C:/x"`,
  `powershell -Command "Get-ChildItem; ${T} C:/x"`,
  `pwsh -c '${T} C:/x'`,
  `pwsh -Command "${T} C:/x"`,
  `powershell -Command "powershell -Command '${T} C:/x'"`,
  // a POSIX shell invoked FROM PowerShell is POSIX code, re-scanned by the
  // Bash arm's own findForbiddenToken rather than the PowerShell one
  `bash -c '${T} C:/x && ls'`,
  `sh -c "git -C D:/AddictedtoAI status; ${T} /x"`,

  // the here-string CLOSER can be followed by a real command on the same
  // line — this is the case that proves the guard resumes scanning right
  // after the closer instead of discarding the rest of that line
  `@'\nharmless prose about the rule\n'@; ${T} C:/x`,
  `Set-Content -Path D:/AddictedtoAI/x.txt -Value @"\nprose\n"@; ${T} C:/x`,

  // cmd.exe wrapped shell code, typed from a PowerShell command line — the
  // mirror case addictedtoai-1ho4 asked to check: the same real hole as the
  // Bash arm's `cmd //c "..."`, just via the PowerShell tool instead. `&`
  // is already a command-position opener, so it needs no separate handling.
  `cmd /c "${T} C:/x"`,
  `cmd.exe /c "${T} C:/x"`,
  `cmd /k "${T} C:/x"`,
  `& cmd /c "${T} C:/x"`,
  // a benign flag (disable AutoRun) between the wrapper and its /c switch
  `cmd /d /c "${T} C:/x"`,
];

/**
 * Commands that must pass untouched.
 *
 * `chdir` and `sl` are deliberately here, not in MUST_REFUSE_PS — see the
 * alias-decision note in shell-token-guard.mjs. `cdk deploy` and `s3cmd`
 * are the same sharp near-misses the Bash corpus carries.
 */
const MUST_ALLOW_PS = [
  // mined verbatim from .claude/settings.local.json
  `Get-CimInstance Win32_Process -Filter "Name='opencode.exe' OR Name='sh.exe'" | Where-Object { $_.CommandLine -notmatch 'serve' } | Select-Object ProcessId,CreationDate,@{n='CL';e={$_.CommandLine.Substring(0,[Math]::Min(90,$_.CommandLine.Length))}} | Format-Table -AutoSize -Wrap`,
  `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'orchestrate|supervis' } | Select-Object ProcessId, Name, @{n='CL';e={$_.CommandLine}} | Format-List; Write-Output "---end---"`,
  `Get-CimInstance Win32_Process -Filter "Name='node.exe'"`,

  // mined from beads memories junction-removal-must-be-verified /
  // worktree-node-modules-junction
  `(Get-Item C:/worktree/node_modules).Delete()`,
  `Test-Path C:/worktree/node_modules`,
  `New-Item -ItemType Junction -Path C:/worktree/node_modules -Target D:/AddictedtoAI/node_modules`,

  // mined from the PowerShell tool's own documented syntax
  `Get-Content D:/AddictedtoAI/AGENTS.md -TotalCount 20`,
  `Get-Content D:/AddictedtoAI/AGENTS.md -Tail 5`,
  `(Get-Command node).Source`,
  `if (-not (Test-Path D:/AddictedtoAI/data/derived)) { New-Item -ItemType File D:/AddictedtoAI/data/derived }`,
  `(Get-Content D:/AddictedtoAI/data/x.txt | Measure-Object -Line).Lines`,
  `New-Item -ItemType Directory -Force D:/AddictedtoAI/data/derived`,
  `Remove-Item -Recurse -Force D:/AddictedtoAI/tmp -Confirm:$false`,
  `New-Item -ItemType SymbolicLink -Path D:/AddictedtoAI/link -Target D:/AddictedtoAI/target`,
  `icacls D:/AddictedtoAI /grant Users:R`,
  `try { Get-ChildItem -ErrorAction Stop } catch {}`,
  `git -C D:/AddictedtoAI status; if ($?) { npm --prefix D:/AddictedtoAI test }`,
  `$env:DEBUG = 'true'; node D:/AddictedtoAI/scripts/x.mjs`,
  `& "C:/Program Files/App/app.exe" arg1 arg2`,
  `Set-Content D:/AddictedtoAI/note.md -Encoding utf8 -Value "hello"`,

  // the documented command table, PowerShell-flavoured
  `npm --prefix D:/AddictedtoAI test`,
  `npm --prefix D:/AddictedtoAI run build`,
  `npm --prefix D:/AddictedtoAI run verify:launch`,
  `node D:/AddictedtoAI/scripts/verify-launch.mjs --no-build`,
  `git -C D:/AddictedtoAI status`,
  `git -C D:/AddictedtoAI log --oneline -200`,
  `bd show addictedtoai-pxj`,
  `bd update addictedtoai-pxj --claim`,

  // the letters inside another word, at a command position and elsewhere
  `cdk bootstrap; cdk deploy --all`,
  `s3cmd sync . s3://bucket`,
  `Write-Output abcd`,
  `Select-String -Pattern "abcd" D:/AddictedtoAI/lib`,
  `next build --cwd D:/AddictedtoAI`,

  // the letters as a path segment or filename, never as the whole word
  `Get-ChildItem D:/AddictedtoAI/content/docs/`,
  `Get-ChildItem D:/AddictedtoAI/src/cdn/`,
  `& D:/AddictedtoAI/cd.ps1`,
  `Test-Path D:/AddictedtoAI/src/cdn`,
  `Get-ChildItem D:/AddictedtoAI/cd-notes.md`,

  // a variable whose name merely CONTAINS the token
  `$cwd = Get-Location; Write-Output $cwd`,
  `$myCdVar = 1`,
  `Write-Output $cd`,

  // the aliases this arm deliberately does NOT refuse — see the
  // alias-decision note in shell-token-guard.mjs
  `chdir C:/AddictedtoAI`,
  `Set-Location C:/AddictedtoAI`,
  `sl C:/AddictedtoAI`,
  `Push-Location C:/AddictedtoAI`,
  // the existence-check analogue of Bash's `command -v cd`
  `Get-Command cd`,
  `Get-Alias cd`,

  // prose in a quoted argument — the commit message for this very change
  `git -C D:/AddictedtoAI commit -m "make the no-${T} rule a mechanism"`,
  `Write-Output "the guard checks for the ${T} token, spelled out in prose"`,
  `bd update addictedtoai-pxj --notes "${T} is forbidden; ${T} is still forbidden"`,

  // prose in a here-string body, which the ground rules actively recommend
  `git -C D:/AddictedtoAI commit -F- <<'EOF'\n@'\n${T} at the start of a line, still just prose\n'@\nEOF`,
  `@'\n${T} is forbidden here, and this line proves prose survives.\n${T}() { } is the shape that keeps happening.\n'@`,
  `Set-Content -Path D:/AddictedtoAI/note.md -Value @"\n${T} at the start of a line of prose\n"@`,
  // the closer followed by a harmless pipeline on the SAME line — proves
  // the guard resumes scanning after the closer rather than blinding
  // itself to the rest of that line (contrast with the MUST_REFUSE case
  // where a real ${T} follows the closer instead)
  `@'\n${T} prose line, never a command\n'@ | Set-Content -Path D:/AddictedtoAI/note.txt`,

  // a comment, line and block
  `# ${T} is forbidden — see CLAUDE.md`,
  `Get-ChildItem D:/AddictedtoAI  # never ${T} here`,
  `<# ${T} is forbidden — see CLAUDE.md #>`,
  `<# ${T}() { } is the shape that keeps happening #>`,
  `# function ${T} { }`,

  // a non-shell -c / -e, which must not be re-scanned as code
  `node -e "console.log('${T}')"`,
  `psql -c "select '${T}'"`,

  // shell code handed to an interpreter that is itself clean
  `powershell -Command "git -C D:/AddictedtoAI status"`,
  `pwsh -c "Write-Output 'the no-${T} rule'"`,
  `bash -c 'git -C D:/AddictedtoAI status'`,

  // ordinary PowerShell syntax: pipelines, loops, redirection, splatting
  `Get-Content D:/AddictedtoAI/data/x.txt | Select-Object -First 5`,
  `for ($i = 0; $i -lt 3; $i++) { Write-Output $i }`,
  `foreach ($f in Get-ChildItem D:/AddictedtoAI) { Write-Output $f.Name }`,
  `Copy-Item D:/AddictedtoAI/a.txt D:/AddictedtoAI/b.txt`,
  `Move-Item D:/AddictedtoAI/a.txt D:/AddictedtoAI/c.txt`,
  `node D:/AddictedtoAI/x.mjs > D:/AddictedtoAI/out.log 2>&1`,
  `Get-ChildItem -Recurse D:/AddictedtoAI`,
  `Import-Csv D:/AddictedtoAI/data/x.csv`,
  `Add-Content -Path D:/AddictedtoAI/note.txt -Value "more"`,
  `$x = @(1, 2, 3); Write-Output $x.Count`,

  // a backtick line-continuation that keeps the SAME statement going — the
  // token here is an argument to Get-ChildItem, not a new command, and
  // treating the continuation as "always resets position" (wrong) or as
  // "always opens a new one" (also wrong) would both mis-handle this
  `Get-ChildItem \`\n${T} C:/x`,

  // a cmd.exe wrapper whose content is itself clean — the wrapper alone
  // must not be blocked (addictedtoai-1ho4's mirror case)
  `cmd /c "npm --prefix D:/AddictedtoAI test"`,
  `& cmd /c "git -C D:/AddictedtoAI status"`,
  `cmd.exe /c "Write-Output hello"`,
  `cmd /d /c "npm --prefix D:/AddictedtoAI test"`,
  // `Start-Process cmd`, bare, opens an interactive shell with no code
  // argument — nothing here to rescan, so it is correctly left alone.
  // `Start-Process cmd -ArgumentList ...` is a documented gap, not this.
  `Start-Process cmd`,
  // "cmd" as a bare word, or followed by a flag that is not /c or /k, opens
  // no shell code to rescan and refuses nothing on its own
  `cmd`,
  `cmd /?`,
  // the letters as a path segment under a cmd-look-alike directory
  `Get-ChildItem D:/AddictedtoAI/src/cmd/`,
  `& D:/AddictedtoAI/cmd-helpers.ps1`,

  // the empty and trivial cases
  '',
  `'Get-ChildItem'`,
  `'node -v'`,
];

test('every command-position form of the token is refused (PowerShell)', () => {
  const missed = MUST_REFUSE_PS.filter((c) => findForbiddenTokenPowerShell(c) === null);
  assert.deepEqual(missed, [], `these forbidden PowerShell commands were allowed through:\n${missed.join('\n')}`);
  assert.ok(MUST_REFUSE_PS.length >= 45, 'the forbidden PowerShell corpus should stay broad');
});

test('every legitimate PowerShell command passes untouched', () => {
  const blocked = MUST_ALLOW_PS.filter((c) => findForbiddenTokenPowerShell(c) !== null).map(
    (c) => `${c}\n      -> ${findForbiddenTokenPowerShell(c).fragment}`,
  );
  assert.deepEqual(blocked, [], `these legitimate PowerShell commands were refused:\n${blocked.join('\n')}`);
  assert.ok(MUST_ALLOW_PS.length >= 65, 'the legitimate PowerShell corpus should stay broad');
});

/**
 * Same discriminating-corpus proof as the Bash suite: a naive
 * case-insensitive substring check would fail a good fraction of the
 * allow corpus, so passing this suite is not free.
 */
test('the legitimate PowerShell corpus is one a substring matcher would fail — by a wide margin', () => {
  const naiveFalsePositives = MUST_ALLOW_PS.filter((c) => c.toLowerCase().includes(T));
  assert.ok(
    naiveFalsePositives.length >= 20,
    `only ${naiveFalsePositives.length} allowed PowerShell commands even contain the letters; ` +
      'this corpus would pass against a substring matcher and proves nothing',
  );
  assert.deepEqual(naiveFalsePositives.filter((c) => findForbiddenTokenPowerShell(c) !== null), []);
});

test('PowerShell command names are matched case-insensitively', () => {
  assert.ok(findForbiddenTokenPowerShell(`CD C:/x`));
  assert.ok(findForbiddenTokenPowerShell(`Cd C:/x`));
  assert.ok(findForbiddenTokenPowerShell(`cD C:/x`));
  assert.equal(findForbiddenTokenPowerShell(`Set-Location C:/x`), null);
});

test('the function form covers both native PowerShell and a pasted Bash shape', () => {
  assert.equal(findForbiddenTokenPowerShell(`function ${T} { }`).form, 'function');
  assert.equal(findForbiddenTokenPowerShell(`${T}() { }`).form, 'function');
  assert.equal(findForbiddenTokenPowerShell(`${T} C:/x`).form, 'command');
  assert.equal(findForbiddenTokenPowerShell(`Get-ChildItem; ${T} C:/x`).form, 'command');
});

test('a backtick de-escapes the token instead of splitting it', () => {
  const finding = findForbiddenTokenPowerShell('`c`d C:/x');
  assert.ok(finding);
  assert.equal(finding.form, 'command');
});

test('shell code inside an interpreter invocation is reported as nested, and routed to the right grammar', () => {
  assert.equal(findForbiddenTokenPowerShell(`pwsh -c '${T} C:/x'`).nested, true);
  assert.equal(findForbiddenTokenPowerShell(`bash -c '${T} C:/x'`).nested, true);
  assert.equal(findForbiddenTokenPowerShell(`${T} C:/x`).nested, false);
});

test('the here-string closer is not a blind spot: a real command after it on the same line is still caught', () => {
  const finding = findForbiddenTokenPowerShell(`@'\nharmless prose\n'@; ${T} C:/x`);
  assert.ok(finding, 'a command chained after the here-string closer must still be scanned');
});

/**
 * addictedtoai-1ho4's mirror case: `cmd /c "..."` typed inside the
 * PowerShell tool, and the routing decision that its content — like a POSIX
 * shell's — goes to the Bash-grammar scanner, not this PowerShell one.
 */
test('a cmd.exe wrapper is recognised as shell code, from PowerShell', () => {
  assert.equal(findForbiddenTokenPowerShell(`cmd /c "${T} C:/x"`).nested, true);
  assert.equal(findForbiddenTokenPowerShell(`& cmd /c "${T} C:/x"`).nested, true);
  assert.equal(findForbiddenTokenPowerShell(`cmd.exe /k "${T} C:/x"`).nested, true);
  assert.equal(findForbiddenTokenPowerShell(`cmd /c "npm --prefix D:/AddictedtoAI test"`), null);
  assert.equal(findForbiddenTokenPowerShell(`Start-Process cmd`), null);
});

test('a flag between the cmd wrapper and its /c switch does not defeat detection, from PowerShell', () => {
  assert.ok(findForbiddenTokenPowerShell(`cmd /d /c "${T} C:/x"`), '/d must not close shell-invocation tracking');
});

test('cmd.exe content, from PowerShell, is re-scanned with the Bash grammar, not the PowerShell one', () => {
  // Backslash means something different in each grammar: Bash's escape
  // character versus an ordinary literal character in PowerShell (which
  // escapes with a backtick instead). Inside a SINGLE-quoted argument
  // neither grammar's own quote-reader touches a backslash, so what happens
  // next depends entirely on which scanner re-reads the unescaped content:
  // the Bash reader un-escapes \c\d into the literal token and refuses it;
  // the PowerShell reader would leave the backslashes in place and allow
  // it. Refusing here proves cmd's content was handed to the Bash reader.
  const command = `cmd /c '\\${T[0]}\\${T[1]} C:/x'`;
  const finding = findForbiddenTokenPowerShell(command);
  assert.ok(finding, 'cmd content must be scanned with Bash rules, where a backslash escapes');
  assert.equal(finding.nested, true);
});

test('the refusal names the token, the substitutes, and no rewritten command', () => {
  const message = refusalMessagePowerShell(findForbiddenTokenPowerShell(`${T} D:/AddictedtoAI`));
  assert.ok(message.includes(T), 'the refusal must name the token it found');
  assert.ok(message.includes('git -C'), 'the refusal must point at git -C');
  assert.ok(message.includes('npm --prefix'), 'the refusal must point at npm --prefix');
  assert.ok(message.includes('.mjs'), 'the refusal must point at writing a .mjs that spawns it');
  assert.ok(message.includes('addictedtoai-pxj'), 'the refusal must name the issue that explains it');
  assert.ok(message.includes('Set-Location'), 'the refusal must offer the real cmdlet name as a substitute');
  assert.ok(
    /will not rewrite/i.test(message),
    'the refusal must say out loud that it is not fixing the command',
  );
});

/**
 * The hook entry point, exercised as a real process with tool_name:
 * 'PowerShell' — proving the dispatch in main() actually reaches this arm,
 * not just that the exported function works when called directly.
 */
function runGuard(payload) {
  return spawnSync(process.execPath, [GUARD], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8',
  });
}

test('the hook denies a forbidden PowerShell command with exit 2 and a deny decision', () => {
  const res = runGuard({ tool_name: 'PowerShell', tool_input: { command: `${T} D:/AddictedtoAI` } });
  assert.equal(res.status, 2, 'exit 2 is the blocking exit code a PreToolUse hook must use');
  const out = JSON.parse(res.stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
  assert.ok(out.hookSpecificOutput.permissionDecisionReason.includes('Set-Location'));
  assert.ok(res.stderr.includes('BLOCKED'), 'the reason must also reach stderr');
});

test('the hook stays out of the way of a legitimate PowerShell command', () => {
  const res = runGuard({
    tool_name: 'PowerShell',
    tool_input: { command: 'Get-ChildItem D:/AddictedtoAI' },
  });
  assert.equal(res.status, 0);
  assert.equal(res.stdout, '', 'an allowed command must produce no decision at all');
  assert.equal(res.stderr, '');
});

test('a PowerShell command routed with tool_name Bash still runs the Bash grammar, not the PowerShell one', () => {
  // Get-ChildItem is not valid Bash, but that is not the point: the point
  // is that dispatch is keyed on tool_name, so a command claiming to be
  // Bash gets the Bash matcher's rules (e.g. backtick = substitution)
  // rather than silently upgrading to PowerShell's.
  const res = runGuard({ tool_name: 'Bash', tool_input: { command: 'Get-ChildItem D:/AddictedtoAI' } });
  assert.equal(res.status, 0);
});
