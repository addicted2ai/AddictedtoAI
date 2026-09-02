/**
 * helpers.mjs — fixture plumbing shared by the Pulse's tests.
 *
 * Every test runs the real `pulse/run.mjs` against a throwaway root via
 * `PULSE_ROOT`, so what is measured is the shipped program end to end, not a
 * re-implementation of it inside a test. `PULSE_NOW` fixes the clock where a
 * fixture needs a date to be a specific number of days old.
 *
 * Sources are served by a local HTTP server, so a test can make a source
 * change, vanish a row, or refuse with a 403 without touching the network or
 * anyone else's endpoint.
 */

import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const RUN = join(REPO, 'pulse', 'run.mjs');

/** A throwaway repository root containing only what the Pulse needs. */
export function makeRoot(sources = [], config = {}) {
  const root = mkdtempSync(join(tmpdir(), 'pulse-fixture-'));
  mkdirSync(join(root, 'data', 'sources'), { recursive: true });
  mkdirSync(join(root, 'data', 'derived'), { recursive: true });
  mkdirSync(join(root, 'content', 'wiki'), { recursive: true });
  writeJson(join(root, 'data', 'config.json'), { publish: false, ...config });
  writeJson(join(root, 'data', 'sources', 'registry.json'), { version: 1, verified_on: '2026-08-28', sources });
  return root;
}

export function cleanup(root) {
  try {
    rmSync(root, { recursive: true, force: true });
  } catch {
    /* a locked temp dir on Windows is not a test failure */
  }
}

export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

export function readJson(file, fallback = null) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
}

export function readText(file) {
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

export function readLines(file) {
  const t = readText(file);
  if (!t) return [];
  return t
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

/** Write a wiki entry file with YAML-ish front matter built from an object. */
export function writeEntry(root, relPath, frontMatter, body = '') {
  const file = join(root, relPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `---\n${toYaml(frontMatter)}---\n${body ? '\n' + body : ''}`, 'utf8');
  return file;
}

/** A deliberately small YAML emitter — fixtures only, no exotic shapes. */
export function toYaml(value, indent = 0) {
  const pad = ' '.repeat(indent);
  let out = '';
  for (const [k, v] of Object.entries(value)) {
    if (v === null || v === undefined) out += `${pad}${k}: null\n`;
    else if (Array.isArray(v)) {
      if (v.length === 0) out += `${pad}${k}: []\n`;
      else {
        out += `${pad}${k}:\n`;
        for (const el of v) {
          if (el && typeof el === 'object') {
            const inner = toYaml(el, indent + 4);
            out += `${pad}  - ${inner.slice(indent + 4)}`;
          } else out += `${pad}  - ${scalar(el)}\n`;
        }
      }
    } else if (typeof v === 'object') {
      out += `${pad}${k}:\n${toYaml(v, indent + 2)}`;
    } else out += `${pad}${k}: ${scalar(v)}\n`;
  }
  return out;
}

function scalar(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

/**
 * Run the real Pulse against a fixture root.
 *
 * Asynchronous on purpose: several tests serve the fixture's source from an
 * HTTP server inside the test process, and `spawnSync` would block this
 * process's event loop so that server could never answer the child. That
 * deadlock is silent — the run just hangs — so the sync variant is not used
 * anywhere here.
 */
export function runPulse(root, args = [], env = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [RUN, ...args], {
      env: { ...process.env, PULSE_ROOT: root, ...env },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (status) => resolvePromise({ status, stdout, stderr, out: stdout + stderr }));
  });
}

/**
 * A local source server. `handler(pathname)` returns
 * `{ status, body, type }`; the returned object exposes `url` and `close()`.
 */
export async function serve(handler) {
  const server = createServer((req, res) => {
    const r = handler(new URL(req.url, 'http://localhost').pathname) ?? { status: 404, body: '' };
    res.writeHead(r.status ?? 200, { 'content-type': r.type ?? 'application/json' });
    res.end(r.body ?? '');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}

/** A registry entry for a JSON source served by `serve()`. */
export function jsonSource(id, url, extra = {}) {
  return {
    id,
    url,
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    display_name_field: 'name',
    yields: ['id', 'name', 'pricing.prompt', 'context_length', 'expiration_date'],
    fetch_every_days: 1,
    expected_change_days: 3,
    emit_on_remove: true,
    material_fields: [
      { field: 'price_input', path: 'pricing.prompt' },
      { field: 'context_window', path: 'context_length' },
      { field: 'status', path: '$status' },
    ],
    status_rule: { kind: 'expiration_date', path: 'expiration_date', deprecated_within_days: 365 },
    mints: null,
    robots: { checked_on: '2026-08-28', result: 'allowed', url: `${url}/robots.txt` },
    verification: { date: '2026-08-28', result: 'live' },
    ...extra,
  };
}

export const paths = {
  changes: (root) => join(root, 'data', 'changes.jsonl'),
  queue: (root) => join(root, 'data', 'derived', 'queue.json'),
  freshness: (root) => join(root, 'data', 'derived', 'freshness.json'),
  catalog: (root) => join(root, 'data', 'derived', 'catalog.json'),
  sources: (root) => join(root, 'data', 'derived', 'sources.json'),
  state: (root, id) => join(root, 'data', 'sources', id, 'state.json'),
  latest: (root, id) => join(root, 'data', 'sources', id, 'latest.json'),
  previous: (root, id) => join(root, 'data', 'sources', id, 'previous.json'),
  linkcheck: (root) => join(root, 'data', 'linkcheck.json'),
};

/**
 * Assert the named sources actually ingested on the run that just finished.
 *
 * A source whose fetch fails is not a crash: `readSource` records
 * `outcome: 'error'` and the Pulse exits 0, because one dead source is
 * degradation and the engine is built to degrade rather than stop. That is
 * correct in production and ruinous in a test, because every downstream
 * assertion then fails for a reason it cannot see — a snapshot that was never
 * written reads as `null.rows`, and a status flip that never happened reads as
 * "a status change appends a timeline event".
 *
 * Measured 2026-09-02 (addictedtoai-fpud): three Desk jobs were failed at the
 * merge gate by exactly those two messages, across two test files, and ~19
 * model-minutes of sound work was discarded. Each was a fixture fetch that
 * never landed. The errno was captured the whole time — `describeFetchError`
 * writes it to the source's `state.json` — and no test ever read it, so a
 * connection-level flake presented as a logic failure. This reads it.
 *
 * It does NOT tolerate the failure. A gate that passes on a lost fetch would
 * hide the regressions these tests exist to catch; the point is to name the
 * cause, not to forgive it. Whether the Desk should distinguish an
 * environmental gate failure from a real one is a separate question, filed
 * separately.
 */
export function assertIngested(root, ids, context = '') {
  const where = context ? ` (${context})` : '';
  for (const id of [ids].flat()) {
    const file = sourcePaths(root, id).state;
    if (!existsSync(file)) {
      throw new Error(`source \`${id}\` wrote no state.json${where} — the Pulse never reached it at all`);
    }
    const state = JSON.parse(readFileSync(file, 'utf8'));
    if (state.last_error) {
      throw new Error(
        `source \`${id}\` never ingested${where}: ${state.last_error.detail} (recorded ${state.last_error.date}). ` +
          'This is a CONNECTION failure, not a logic failure — the assertion below it would have been ' +
          'measuring a snapshot that was never written. `connect EADDRINUSE` means the machine had no ' +
          'ephemeral port to spare: something else on it was making connections (see addictedtoai-ar0), ' +
          'and the test is sound.',
      );
    }
    if (state.refusing) {
      throw new Error(
        `source \`${id}\` is being refused${where}: ${state.refusing.reason} since ${state.refusing.since}`,
      );
    }
  }
}

/** The Pulse's own per-source paths, so a test reads state where the engine wrote it. */
function sourcePaths(root, id) {
  const dir = join(root, 'data', 'sources', id);
  return { dir, latest: join(dir, 'latest.json'), previous: join(dir, 'previous.json'), state: join(dir, 'state.json') };
}
