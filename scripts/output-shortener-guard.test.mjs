/**
 * output-shortener-guard.test.mjs — the negative-control contract for the
 * truncation guard.
 *
 * THE TWO DIRECTIONS ARE BOTH THE POINT, and the second one is the one that
 * decides whether this guard survives its first week. A detector that refuses a
 * declared partial read as readily as a silent one is a blanket ban, and a
 * blanket ban gets disabled by the first person it inconveniences — after which
 * the property is unguarded and everyone believes it is guarded.
 *
 * PROVENANCE OF THE CONTROLS, stated rather than left to be assumed:
 *
 *   WILD — `bd show <id> | head -N`. Not invented for this test. It is recorded
 *   verbatim in this project's own timeline note as the shape that wrote four
 *   briefs: "ACCEPTANCE at bottom, `bd show | head -N` deletes done." The
 *   consequences are recorded beside it (an inverted acceptance, two of three
 *   x2jl requirements dropped, a bead's own solution foreclosed).
 *
 *   CONSTRUCTED — every green-direction case below. No archive of "commands
 *   that were correctly allowed" exists, so the allowed shapes are written from
 *   the rule's own text and are labelled as constructed here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findTruncatedEnumeration,
  isEnumerator,
  isShortener,
  refusalMessage,
  NON_EXHAUSTIVE_MARKER,
} from './output-shortener-guard.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GUARD = join(HERE, 'output-shortener-guard.mjs');

// ---------------------------------------------------------------- refuses

test('WILD CONTROL: `bd show <id> | head -N` is refused — the shape that wrote four briefs', () => {
  const finding = findTruncatedEnumeration('bd show addictedtoai-x2jl | head -60');
  assert.ok(finding, 'the measured shape must be refused');
  assert.equal(finding.enumerator, 'bd show');
  assert.equal(finding.shortener, 'head');
});

test('the refusal names the rule, the pipeline, and both remedies', () => {
  const message = refusalMessage(findTruncatedEnumeration('bd show x | head -60'));
  assert.match(message, /INDISTINGUISHABLE FROM COMPLETE OUTPUT/);
  assert.match(message, /bd show x \| head -60/);
  assert.match(message, /wc -l/, 'the count-first remedy');
  assert.match(message, /non-exhaustive/, 'the declaration that allows a deliberate peek');
  assert.ok(!/^\s*(run|use) this instead/im.test(message), 'it must not rewrite the command for the caller');
});

test('the other measured enumerators are refused through head and through tail', () => {
  for (const command of [
    'git log --oneline | head -20',
    'git ls-files | head -50',
    'git -C D:/AddictedtoAI status --porcelain | head -10',
    'cat D:/AddictedtoAI/CLAUDE.md | head -40',
    'grep -rn "pattern" D:/AddictedtoAI/lib | head -20',
    'ls D:/addictedtoai-worktrees | tail -5',
    'bd list --json | head -100',
  ]) {
    assert.ok(findTruncatedEnumeration(command), `must refuse: ${command}`);
  }
});

test('a shortener wearing other clothes is still a shortener', () => {
  assert.ok(findTruncatedEnumeration("git log | sed -n '1,20p'"), 'sed range');
  assert.ok(findTruncatedEnumeration("git log | awk 'NR<=20'"), 'awk NR limit');
});

test('PowerShell: Select-Object -First after an enumerator is refused', () => {
  const finding = findTruncatedEnumeration('bd list --json | Select-Object -First 20', { powershell: true });
  assert.ok(finding);
  assert.match(finding.shortener, /select-object -first/i);
});

// ------------------------------------------------------------ deliberately allows

test('CONSTRUCTED: a DECLARED partial read is allowed — the arm that keeps this from being a blanket ban', () => {
  for (const command of [
    'bd show addictedtoai-x2jl | head -20  # non-exhaustive',
    'git log --oneline | head -5  # preview',
    'grep -rn "x" lib | head -3  # sample',
    'ls | head -10  # spot check',
  ]) {
    assert.equal(findTruncatedEnumeration(command), null, `must allow: ${command}`);
  }
});

test('CONSTRUCTED: counting is the remedy the rule names, so counting is never refused', () => {
  for (const command of [
    'git ls-files | wc -l',
    'grep -c "pattern" D:/AddictedtoAI/CLAUDE.md',
    'bd list --json | node D:/AddictedtoAI/scripts/count.mjs',
  ]) {
    assert.equal(findTruncatedEnumeration(command), null, `must allow: ${command}`);
  }
});

test('CONSTRUCTED: a shortener with nothing enumerated on its left is not a truncation', () => {
  for (const command of [
    'echo hello | head -1',
    'printf "a\\nb\\n" | head -1',
    'curl -s http://127.0.0.1:4096/ | head -5',
  ]) {
    assert.equal(findTruncatedEnumeration(command), null, `must allow: ${command}`);
  }
});

test('CONSTRUCTED: a bare head/tail on a file is a partial file read, not a truncated enumeration', () => {
  assert.equal(findTruncatedEnumeration('head -5 D:/AddictedtoAI/CLAUDE.md'), null);
  assert.equal(findTruncatedEnumeration('tail -20 D:/AddictedtoAI/package.json'), null);
});

test('CONSTRUCTED: `tail -f` follows a stream and shortens nothing', () => {
  assert.equal(findTruncatedEnumeration('git log | tail -f'), null);
});

test('CONSTRUCTED: a git subcommand that is not an enumeration is not swept up', () => {
  assert.equal(findTruncatedEnumeration('git config --get user.name | head -1'), null);
  assert.equal(findTruncatedEnumeration('git rev-parse HEAD | head -1'), null);
});

test('CONSTRUCTED: `git -C <dir>` does not hide the subcommand from the matcher', () => {
  assert.ok(findTruncatedEnumeration('git -C D:/AddictedtoAI log --oneline | head -3'));
  assert.equal(findTruncatedEnumeration('git -C D:/AddictedtoAI rev-parse HEAD | head -1'), null);
});

test('CONSTRUCTED: prose in a heredoc body is prose — this rule can be written about', () => {
  const command = [
    "git commit -F - <<'EOF'",
    'guard: refuse bd show | head -N',
    '',
    'The measured shape was `bd show <id> | head -60`, which deletes ACCEPTANCE.',
    'EOF',
  ].join('\n');
  assert.equal(findTruncatedEnumeration(command), null, 'a commit message about the rule must not trip it');
});

test('CONSTRUCTED: `||` is a control operator, not a pipe', () => {
  assert.equal(findTruncatedEnumeration('git log --oneline || head -5'), null);
});

// ------------------------------------------------------------------- units

test('isEnumerator and isShortener are separately testable, and say what they matched', () => {
  assert.equal(isEnumerator('bd show x'), 'bd show');
  assert.equal(isEnumerator('git log --oneline'), 'git log');
  assert.equal(isEnumerator('git config --get x'), null);
  assert.equal(isEnumerator('echo hi'), null);
  assert.equal(isShortener('head -20'), 'head');
  assert.equal(isShortener('wc -l'), null);
  assert.equal(isShortener('tail -f'), null);
});

test('the marker matches every spelling the refusal offers, and nothing else', () => {
  for (const good of ['# non-exhaustive', '# preview', '# sample', '# spot check', '#non-exhaustive']) {
    assert.ok(NON_EXHAUSTIVE_MARKER.test(`git log | head -3 ${good}`), good);
  }
  assert.ok(!NON_EXHAUSTIVE_MARKER.test('git log | head -3 # because'), 'a bare comment is not a declaration');
});

// ------------------------------------------------------- the hook contract

/** Run the guard as the harness runs it: payload on stdin, decision on stdout. */
function runHook(payload) {
  try {
    const stdout = execFileSync('node', [GUARD], { input: JSON.stringify(payload), encoding: 'utf8' });
    return { status: 0, stdout };
  } catch (err) {
    return { status: err.status, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

test('HOOK CONTRACT: the wild shape denies with exit 2 and a deny decision on stdout', () => {
  const result = runHook({ tool_name: 'Bash', tool_input: { command: 'bd show addictedtoai-x2jl | head -60' } });
  assert.equal(result.status, 2, 'exit 2 is how the harness is told to block');
  const decision = JSON.parse(result.stdout);
  assert.equal(decision.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(decision.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(decision.hookSpecificOutput.permissionDecisionReason, /INDISTINGUISHABLE/);
});

test('HOOK CONTRACT: a declared partial read exits 0 and writes no decision', () => {
  const result = runHook({ tool_name: 'Bash', tool_input: { command: 'bd show x | head -20 # non-exhaustive' } });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), '');
});

test('HOOK CONTRACT: it FAILS OPEN on an unreadable payload rather than blocking every command', () => {
  // A guard that cannot read its input must not block the repository. This is
  // the shell-token guard's decision and the reason is the same: a guard that
  // fails silently is worse than none, because it is believed.
  let status;
  try {
    execFileSync('node', [GUARD], { input: 'not json at all', encoding: 'utf8' });
    status = 0;
  } catch (err) { status = err.status; }
  assert.equal(status, 0, 'an unparseable payload must allow, not block');
});

test('HOOK CONTRACT: a payload with no command string is allowed', () => {
  assert.equal(runHook({ tool_name: 'Bash', tool_input: {} }).status, 0);
});
