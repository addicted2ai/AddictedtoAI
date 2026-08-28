/**
 * exec.mjs — invoking an executor.
 *
 * The executor contract (specs/loop) in code. An executor is anything that
 * can (a) run to completion from one written prompt with no human input,
 * (b) read and write files in a given directory, (c) run shell commands
 * there, (d) stop on its own or be killed on a timeout, (e) leave its output
 * as files.
 *
 * What this module therefore does NOT do, and must never start doing:
 * require memory across invocations, subagents, MCP, hooks, a tool-calling
 * API, structured output, a minimum context window, or any vendor's file
 * layout. It writes a markdown file, runs one shell command with that file's
 * path substituted in, waits, and reads files back. Anything a harness offers
 * beyond that is an optimisation layered over this path, never a requirement
 * of it.
 *
 * It also never touches a credential. The command names an executable; where
 * that executable finds its login is between it and the maintainer.
 */

import { spawn } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, createWriteStream } from 'node:fs';
import { dirname, join } from 'node:path';

/** Substitute the documented placeholders into a command template. */
export function renderCommand(template, vars) {
  return template.replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole,
  );
}

function killTree(pid) {
  if (process.platform === 'win32') {
    // A harness typically spawns children; killing only the shell would leave
    // the model running past its cap, and the cap is what makes `interrupted`
    // mean anything.
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        /* already gone */
      }
    }
  }
}

/**
 * Run one executor invocation under a wall-clock cap.
 *
 * Model-minutes (design D5) are measured HERE — invocation to return, by the
 * loop's own clock — because tokens are unobservable across consumer
 * subscriptions and an executor's own account of its cost is not evidence.
 *
 * @returns {Promise<{code:number|null, killed:boolean, stdout:string,
 *                    stderr:string, mm:number, ms:number, command:string,
 *                    promptPath:string, logPath:string|null}>}
 */
export async function runExecutor({
  command,
  cwd,
  promptText,
  promptPath,
  timeoutMs,
  role = 'author',
  jobId = 'job',
  logPath = null,
  env = process.env,
}) {
  mkdirSync(dirname(promptPath), { recursive: true });
  writeFileSync(promptPath, promptText, 'utf8');

  const rendered = renderCommand(command, {
    prompt_file: promptPath,
    worktree: cwd,
    job_id: jobId,
    role,
  });
  // If the template never names the prompt file, the brief goes in on stdin.
  // Between the two, every harness that can be driven at all can be driven.
  const usesFile = /\{prompt_file\}/.test(command);

  const started = Date.now();
  const child = spawn(rendered, {
    cwd,
    shell: true,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  });

  let stdout = '';
  let stderr = '';
  const logStream = logPath ? createWriteStream(logPath, { flags: 'a' }) : null;
  const cap = (chunk, which) => {
    const s = chunk.toString();
    if (which === 'out') stdout += s;
    else stderr += s;
    if (logStream) logStream.write(s);
    // Bound memory: a chatty harness can emit megabytes and none of it is read
    // mechanically except the stderr capacity pattern.
    if (stdout.length > 4_000_000) stdout = stdout.slice(-2_000_000);
    if (stderr.length > 4_000_000) stderr = stderr.slice(-2_000_000);
  };
  child.stdout.on('data', (c) => cap(c, 'out'));
  child.stderr.on('data', (c) => cap(c, 'err'));

  if (!usesFile) {
    child.stdin.on('error', () => {}); // an executor that ignores stdin is fine
    child.stdin.write(promptText);
  }
  child.stdin.end(() => {});

  let killed = false;
  const timer = setTimeout(() => {
    killed = true;
    killTree(child.pid);
  }, timeoutMs);

  const code = await new Promise((resolve) => {
    child.on('error', () => resolve(null));
    child.on('close', (c) => resolve(c));
  });
  clearTimeout(timer);
  if (logStream) logStream.end();

  const ms = Date.now() - started;
  return {
    code,
    killed,
    stdout,
    stderr,
    ms,
    mm: ms / 60000,
    command: rendered,
    promptPath,
    logPath,
  };
}

export function jobLogPath(worktreeRoot, jobId, role) {
  // `*.log` is gitignored everywhere in this repository, and worktrees live
  // outside it anyway.
  return join(worktreeRoot, `${jobId}-${role}.log`);
}
