/**
 * The forbidden-shell-token guard (beads addictedtoai-4tk).
 *
 * The guard replaces an instruction that failed eight times in two days. Its
 * worth is entirely in where its boundary sits, so the suite is deliberately
 * two-sided and the second side is the larger one: every legitimate command
 * below is real text taken from this repository's history, its documented
 * command table, its `package.json` scripts, or a session transcript. A
 * matcher that refuses the token is easy; a matcher that refuses the token and
 * nothing else is the only kind worth wiring to a `PreToolUse` hook, because a
 * false positive blocks the maintainer's own work, not just an agent's.
 *
 * The forbidden strings are ASSEMBLED from the module's own `TOKEN` export
 * rather than typed. Two reasons, both practical: the test then proves the
 * export is what the guard actually compares against, and this file stays
 * quotable into a brief without seeding the next violation — which is exactly
 * how the eighth one happened.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOKEN, findForbiddenToken, refusalMessage } from './shell-token-guard.mjs';

const T = TOKEN;
const GUARD = join(dirname(fileURLToPath(import.meta.url)), 'shell-token-guard.mjs');

/**
 * Every shape the token can take at a command position.
 *
 * The first two groups are the two that actually happened: five of the eight
 * recorded violations were the function form and three were the plain prefix.
 * The rest are the separators a naive prefix check would sail past.
 */
const MUST_REFUSE = [
  // the plain prefix — 3 of 8 recorded violations
  `${T} /some/where`,
  `${T}`,
  `${T} D:/AddictedtoAI && npm test`,
  // the function form — 5 of 8, and the one no instruction could stop
  `${T}() { :; }`,
  `${T} () { :; }`,
  `${T}(){ :; }; git -C D:/AddictedtoAI status`,
  // after each separator
  `ls; ${T} /x`,
  `git -C D:/AddictedtoAI status && ${T} /x`,
  `false || ${T} /x`,
  `echo x | ${T}`,
  `sleep 1 & ${T} /x`,
  `${T}&&ls`,
  // inside a subshell, a command substitution, a backtick, a brace group
  `(${T} /x && ls)`,
  `echo $(${T} /x)`,
  'echo `' + T + ' /x`',
  `{ ${T} /x; }`,
  // after a newline
  `git -C D:/AddictedtoAI status\n${T} /x`,
  `set -e\n\n${T} /x\nls`,
  `x=$(${T} /x)`,
  `ls | { ${T} /x; }`,
  `( ( ${T} /x ) )`,
  // after a shell keyword, where the position is open by grammar
  `if ${T} /x; then ls; fi`,
  `if true; then ${T} /x; fi`,
  `for d in a b; do ${T} $d; done`,
  `while ${T} /x; do ls; done`,
  `until ${T} /x; do ls; done`,
  `if false; then ls; elif ${T} /x; then ls; fi`,
  `if false; then ls; else ${T} /x; fi`,
  `! ${T} /x`,
  // after a command wrapper
  `sudo ${T} /x`,
  `env ${T} /x`,
  `exec ${T} /x`,
  `time ${T} /x`,
  `nohup ${T} /x`,
  `builtin ${T} /x`,
  `command ${T} /x`,
  // after a leading assignment
  `FOO=bar ${T} /x`,
  `A=1 B=2 ${T} /x`,
  `NODE_ENV=production ${T} D:/AddictedtoAI && npm run build`,
  // leading whitespace, CRLF, and no whitespace at all
  `  ${T} /x`,
  `\t${T} /x`,
  `ls\r\n${T} /x`,
  `${T};ls`,
  // quoting and escaping do not launder it
  `"${T}" /x`,
  `'${T}' /x`,
  `\\${T} /x`,
  // shell code handed to a shell is still shell code, however deep
  `bash -c '${T} /x && ls'`,
  `sh -lc "${T} /x"`,
  `zsh -c '${T} /x'`,
  `dash -c "${T} /x"`,
  `bash -c "git -C D:/AddictedtoAI status; ${T} /x"`,
  `bash -c 'bash -c "${T} /x"'`,
];

/**
 * Commands that must pass untouched.
 *
 * `cdk deploy` and `s3cmd` are the sharp near-misses: real tools whose names
 * carry the letters at a command position, where a token-unaware substring
 * check would block a whole toolchain. The quoted-prose and heredoc cases are
 * the ones this repository would hit hourly — its own ground rules push
 * multi-line prose into heredocs, and its commit messages discuss this very
 * rule by name.
 */
const MUST_ALLOW = [
  // the documented command table and package.json scripts
  'npm --prefix D:/AddictedtoAI test',
  'npm --prefix D:/AddictedtoAI run build',
  'npm --prefix D:/AddictedtoAI run verify:launch',
  'node scripts/prebuild.mjs && next build',
  'node scripts/serve-static.mjs out 3000',
  'node scripts/run-tests.mjs',
  'node pulse/run.mjs',
  'node loop/run.mjs',
  // The runner id is deliberately a placeholder, not a real one. `scripts/` is
  // a machinery path, and `runners.yml` is the only file in the machinery that
  // may name a model, provider or harness — `loop/tests/portability.test.mjs`
  // enforces it and caught the real id that first stood here. What this case
  // actually tests is the SHAPE, `--runner <word>`, which a placeholder gives
  // just as well.
  'node loop/conformance.mjs --runner a-runner-id',
  'node pulse/verify-zero-model.mjs',
  'node D:/AddictedtoAI/scripts/verify-launch.mjs --no-build',
  'openspec validate --change build-initial-site --strict',
  // real git and gh invocations from this repository's sessions
  'git -C D:/AddictedtoAI log --oneline -200',
  'git -C D:/AddictedtoAI status',
  'git -C D:/AddictedtoAI diff --stat HEAD~1',
  'git -C D:/AddictedtoAI show HEAD:data/config.json',
  'git -C D:/AddictedtoAI log --format=%s -400 | grep -ci addictedtoai',
  'git -C D:/AddictedtoAI pull --rebase && git -C D:/AddictedtoAI push',
  'gh pr create --title "loop/build" --body-file D:/AddictedtoAI/body.md',
  'bd show addictedtoai-4tk',
  'bd update addictedtoai-4tk --claim',
  'bd remember no-token-in-shell',
  // the letters inside another word, at a command position and elsewhere
  'cdk bootstrap && cdk deploy --all',
  's3cmd sync . s3://bucket',
  'abcd --version',
  'echo abcd',
  'grep -rn "abcd" D:/AddictedtoAI/lib',
  'npm run build --workspace=abcd',
  'tar -cdf x.tar .',
  'gcc -DCD=1 x.c',
  // the letters as a path segment or a flag value
  'ls content/docs/',
  'ls src/cdn/',
  './cd.sh',
  'bash cd.sh',
  'next build --cwd D:/AddictedtoAI',
  'node --cpu-prof D:/AddictedtoAI/scripts/x.mjs',
  'docker run -w /app -v .:/app node:20 npm test',
  'node --test D:/AddictedtoAI/scripts/shell-token-guard.test.mjs',
  'ls -la D:/AddictedtoAI/.claude/',
  'mkdir -p D:/AddictedtoAI/data/derived',
  // the letters as an ARGUMENT rather than a command
  `echo ${T}`,
  `grep -rn ${T} D:/AddictedtoAI/loop`,
  `git -C D:/AddictedtoAI log --grep=${T} --oneline`,
  `rg --files-with-matches ${T}`,
  `grep ${T} <<< "ab${T}"`,
  // prose in a quoted argument — the commit message for this very change
  `git -C D:/AddictedtoAI commit -m "make the no-${T} rule a mechanism"`,
  `git -C D:/AddictedtoAI commit -m "${T} is forbidden; ${T} is still forbidden"`,
  `gh pr create --title "the no-${T} rule" --body "why ${T} keeps happening"`,
  // prose in a heredoc body, which the ground rules actively recommend
  `git -C D:/AddictedtoAI commit -F- <<'EOF'\n${T} is forbidden here, and this line proves prose survives.\n${T}() { :; } is the form that keeps happening.\nEOF`,
  `cat > D:/AddictedtoAI/note.md <<-EOT\n${T} at the start of a line of prose\nEOT`,
  // a comment
  `# ${T} is forbidden — see CLAUDE.md`,
  `ls D:/AddictedtoAI  # never ${T} here`,
  `# ${T}() { :; }`,
  // a script BODY being written to a file: still prose as far as this shell is
  // concerned, and both the quoted and unquoted heredoc forms behave alike
  `cat <<'SH' > D:/AddictedtoAI/x.sh\n${T} /x\nexec node y.mjs\nSH`,
  `cat <<SH > D:/AddictedtoAI/x.sh\n${T} /x\nSH\nls`,
  // a non-shell -c, which must not be re-scanned as shell
  `psql -c "select '${T}'"`,
  `node -e "console.log('${T}')"`,
  // shell code handed to a shell that is itself clean
  'bash -c \'git -C D:/AddictedtoAI status\'',
  `bash -c 'echo "the no-${T} rule"'`,
  // the builtin-existence check, which a wrapper-transparent matcher would trip
  'command -v node',
  // ordinary shell syntax with braces, escapes, redirection and substitution
  'awk \'{print $1}\' D:/AddictedtoAI/data/x.txt',
  'jq -r \'.tool_input.command\' D:/AddictedtoAI/payload.json',
  'find D:/AddictedtoAI -name "*.mjs" -exec node --check {} \\;',
  'for f in a b; do echo $f; done',
  'printf \'%s\\n\' "$(git -C D:/AddictedtoAI rev-parse HEAD)"',
  'node D:/AddictedtoAI/x.mjs > D:/AddictedtoAI/out.log 2>&1',
  'curl -s "https://example.com/x?a=1&b=2#frag"',
  'PATH=/usr/bin:$PATH node --version',
  'sed -n \'1,20p\' D:/AddictedtoAI/AGENTS.md',
  // the empty and trivial cases
  '',
  'true',
  'node -v',
];

test('every command-position form of the token is refused', () => {
  const missed = MUST_REFUSE.filter((c) => findForbiddenToken(c) === null);
  assert.deepEqual(missed, [], `these forbidden commands were allowed through:\n${missed.join('\n')}`);
  assert.ok(MUST_REFUSE.length >= 45, 'the forbidden corpus should stay broad');
});

test('every legitimate command passes untouched', () => {
  const blocked = MUST_ALLOW.filter((c) => findForbiddenToken(c) !== null).map(
    (c) => `${c}\n      -> ${findForbiddenToken(c).fragment}`,
  );
  assert.deepEqual(blocked, [], `these legitimate commands were refused:\n${blocked.join('\n')}`);
  assert.ok(MUST_ALLOW.length >= 65, 'the legitimate corpus should stay broad');
});

/**
 * The allow corpus has to be DISCRIMINATING, not merely long.
 *
 * A suite of commands that happen not to contain the letters would pass
 * against any matcher at all, including the naive substring check this guard
 * exists to be better than. So: assert that the obvious wrong implementation
 * fails loudly here. If someone later "simplifies" the matcher to
 * `command.includes(TOKEN)`, this is the test that says how much real work
 * that would break.
 */
test('the legitimate corpus is one a substring matcher would fail — by a wide margin', () => {
  const naiveFalsePositives = MUST_ALLOW.filter((c) => c.includes(TOKEN));
  assert.ok(
    naiveFalsePositives.length >= 20,
    `only ${naiveFalsePositives.length} allowed commands even contain the letters; ` +
      'this corpus would pass against a substring matcher and proves nothing',
  );
  // And every one of them is allowed, which is the actual claim.
  assert.deepEqual(naiveFalsePositives.filter((c) => findForbiddenToken(c) !== null), []);
});

/**
 * The distinction the refusal message turns on.
 *
 * The function form gets a different explanation because it comes from a
 * different mistake: nobody writing it is trying to change directory, they are
 * defensively disarming a builtin they think might be lurking. Telling that
 * person "do not change directory" is what failed five times.
 */
test('the function-definition form is recognised as such, with or without a space', () => {
  assert.equal(findForbiddenToken(`${T}() { :; }`).form, 'function');
  assert.equal(findForbiddenToken(`${T} () { :; }`).form, 'function');
  assert.equal(findForbiddenToken(`${T} /x`).form, 'command');
  assert.equal(findForbiddenToken(`ls && ${T} /x`).form, 'command');
});

test('the finding names where it is, and quotes the fragment it found', () => {
  const command = `git -C D:/AddictedtoAI status && ${T} /x && ls`;
  const finding = findForbiddenToken(command);
  assert.equal(command.slice(finding.index, finding.index + T.length), T);
  assert.ok(finding.fragment.includes(T), 'the fragment must show the offending text');
  assert.ok(finding.fragment.length < 90, 'the fragment is a quote, not the whole command');
});

test('shell code inside a shell invocation is reported as nested', () => {
  assert.equal(findForbiddenToken(`bash -c '${T} /x'`).nested, true);
  assert.equal(findForbiddenToken(`${T} /x`).nested, false);
});

test('the first occurrence is reported, not the last', () => {
  const command = `ls && ${T} /a && ${T} /b`;
  assert.equal(findForbiddenToken(command).index, command.indexOf(T));
});

/**
 * The MUST NOT from the issue, asserted rather than promised: the guard
 * refuses and explains, and never hands back a repaired command.
 */
test('the refusal names the token, the substitutes, and no rewritten command', () => {
  const message = refusalMessage(findForbiddenToken(`${T} D:/AddictedtoAI`));
  assert.ok(message.includes(T), 'the refusal must name the token it found');
  assert.ok(message.includes('git -C'), 'the refusal must point at git -C');
  assert.ok(message.includes('npm --prefix'), 'the refusal must point at npm --prefix');
  assert.ok(message.includes('.mjs'), 'the refusal must point at writing a .mjs that spawns it');
  assert.ok(message.includes('addictedtoai-4tk'), 'the refusal must name the issue that explains it');
  assert.ok(
    /will not rewrite/i.test(message),
    'the refusal must say out loud that it is not fixing the command',
  );
});

test('the function form is told why disarming a builtin is itself the violation', () => {
  const message = refusalMessage(findForbiddenToken(`${T}() { :; }`));
  assert.match(message, /defensively disarming/);
  assert.match(message, /matches the TOKEN, not the/);
});

/**
 * The hook entry point, exercised the way the harness exercises it: a
 * `PreToolUse` payload on stdin, a decision on stdout, a reason on stderr.
 *
 * A matcher that is correct but not reachable is worth nothing, so this runs
 * the real file as a real process rather than calling the exported function
 * again.
 */
function runGuard(payload) {
  return spawnSync(process.execPath, [GUARD], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8',
  });
}

test('the hook denies a forbidden command with exit 2 and a deny decision', () => {
  const res = runGuard({ tool_name: 'Bash', tool_input: { command: `${T} D:/AddictedtoAI` } });
  assert.equal(res.status, 2, 'exit 2 is the blocking exit code a PreToolUse hook must use');
  const out = JSON.parse(res.stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
  assert.ok(out.hookSpecificOutput.permissionDecisionReason.includes('git -C'));
  assert.ok(res.stderr.includes('BLOCKED'), 'the reason must also reach stderr');
  // Both refusal protocols are emitted deliberately: whichever one the harness
  // honours, the command is blocked rather than silently allowed.
  assert.equal(
    out.hookSpecificOutput.permissionDecisionReason,
    res.stderr.trim(),
    'the two protocols must carry the same reason',
  );
});

test('the hook stays out of the way of a legitimate command', () => {
  const res = runGuard({
    tool_name: 'Bash',
    tool_input: { command: 'git -C D:/AddictedtoAI log --oneline -200' },
  });
  assert.equal(res.status, 0);
  assert.equal(res.stdout, '', 'an allowed command must produce no decision at all');
  assert.equal(res.stderr, '');
});

test('the hook fails OPEN and says so when it cannot read its input', () => {
  const res = runGuard('this is not json');
  assert.equal(res.status, 0, 'an unreadable payload must not block every command in the repository');
  assert.match(res.stderr, /could not parse/, 'a guard that fails silently is worse than none');
});

test('a payload with no command is not a decision', () => {
  const res = runGuard({ tool_name: 'Read', tool_input: { file_path: 'D:/AddictedtoAI/AGENTS.md' } });
  assert.equal(res.status, 0);
  assert.equal(res.stdout, '');
});
