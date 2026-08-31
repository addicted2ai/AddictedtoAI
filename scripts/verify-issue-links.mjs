#!/usr/bin/env node
/**
 * verify-issue-links.mjs — the EXISTENCE half of the beads join
 * (`addictedtoai-occ0`).
 *
 * WHY THIS IS A SCRIPT AND NOT A BUILD STEP, stated plainly because getting it
 * wrong makes the site unbuildable: `next build` runs on Vercel, where the `bd`
 * binary does not exist and the Dolt store is unreachable. So validation splits.
 *
 *   FORMAT    — `loop/lib/issues.mjs`. Pure, portable, no I/O. It runs in the
 *               loop, and it would run in a build if a build ever needed it.
 *   EXISTENCE — here. Shells out to `bd`, so it runs only on a machine that has
 *               one. It is NOT in `scripts/prebuild.mjs`'s STEPS array and must
 *               never be added to it.
 *
 * Verified before relying on it: the prebuild reads neither `data/proposals/`
 * nor `data/ledger.jsonl`, so no build path reaches the join at all today.
 *
 * WHAT IT DOES NOT DO: create an issue, close one, or sync anything. It reads.
 * `bd dolt push` is the maintainer's alone and nothing here writes to the store,
 * because a gate that filed an issue to satisfy itself would be manufacturing
 * the backlog it exists to keep honest.
 *
 * Exit 0 when every referenced id exists; exit 1 naming each that does not.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { harvestIssueIds, declaredIssueIds, isIssueId } from '../loop/lib/issues.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Every id the repository references, with where each reference lives. */
function collectReferences() {
  const refs = [];
  const add = (id, where) => refs.push({ id, where });

  // 1. The ledger — the durable record of what the machine actually did.
  const ledgerPath = join(ROOT, 'data', 'ledger.jsonl');
  if (existsSync(ledgerPath)) {
    readFileSync(ledgerPath, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const t = line.trim();
        if (!t) return;
        let o;
        try {
          o = JSON.parse(t);
        } catch {
          return; // readLedger throws on this; that is its job, not this one's
        }
        for (const id of o.issues ?? []) add(id, `data/ledger.jsonl:${i + 1} (job ${o.id})`);
      });
  }

  // 2. Proposals, in every state — active, dropped, consumed, rejected.
  for (const sub of ['', 'dropped', 'consumed', 'rejected']) {
    const dir = join(ROOT, 'data', 'proposals', sub);
    if (!existsSync(dir)) continue;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isFile() || !e.name.endsWith('.md') || e.name === 'README.md') continue;
      const rel = `data/proposals/${sub ? `${sub}/` : ''}${e.name}`;
      const raw = readFileSync(join(dir, e.name), 'utf8');
      const block = /^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(raw);
      if (!block) continue;
      const m = /^[ \t]*issues?[ \t]*:[ \t]*(.*)$/m.exec(block[1]);
      if (!m) continue;
      const { ids, malformed } = declaredIssueIds(m[1]);
      for (const id of ids) add(id, rel);
      for (const bad of malformed) refs.push({ id: bad, where: rel, malformed: true });
    }
  }

  // 3. DIRECTIVES.md — prose, harvested, never required.
  const dPath = join(ROOT, 'DIRECTIVES.md');
  if (existsSync(dPath)) {
    readFileSync(dPath, 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        for (const id of harvestIssueIds(line)) add(id, `DIRECTIVES.md:${i + 1}`);
      });
  }
  return refs;
}

/**
 * How to invoke beads without a shell, as a list of `[command, ...args]` to try
 * in order.
 *
 * MEASURED ON THIS MACHINE, because two plausible spellings both fail on
 * Windows and the failures are unalike:
 *
 *   execFileSync('bd', …)      -> ENOENT.  `bd` is an npm shim; the bare name
 *                                 resolves in a shell and not to CreateProcess.
 *   execFileSync('bd.cmd', …)  -> EINVAL.  Node refuses to spawn `.cmd`/`.bat`
 *                                 without `shell: true` (CVE-2024-27980).
 *
 * The shim's own contents give the way out: it is a two-line wrapper around
 * `node <prefix>/node_modules/@beads/bd/bin/bd.js`. Spawning that entrypoint
 * with `process.execPath` needs no shell, no extension guessing and no
 * command-line parser — the same reasoning CLAUDE.md records for git plumbing
 * on Windows. `BD_BIN` overrides everything for a machine that installs beads
 * some other way.
 */
function bdCandidates() {
  const out = [];
  if (process.env.BD_BIN) out.push([process.env.BD_BIN]);
  const prefixes = [
    process.env.APPDATA ? join(process.env.APPDATA, 'npm') : null,
    process.env.npm_config_prefix ?? null,
  ].filter(Boolean);
  for (const p of prefixes) {
    const js = join(p, 'node_modules', '@beads', 'bd', 'bin', 'bd.js');
    if (existsSync(js)) out.push([process.execPath, js]);
  }
  out.push(['bd']); // POSIX, where the bare name is a real executable
  return out;
}

/** Every issue id beads knows, or `{error}` when `bd` cannot be reached. */
function knownIssueIds() {
  let lastError = 'no candidate was tried';
  for (const [bin, ...pre] of bdCandidates()) {
    try {
      const out = execFileSync(bin, [...pre, 'list', '--status', 'all', '--json'], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const parsed = JSON.parse(out);
      return new Set(parsed.map((o) => o.id).filter(Boolean));
    } catch (e) {
      lastError = (e.message ?? String(e)).split('\n')[0];
    }
  }
  return { error: lastError };
}

function main() {
  const refs = collectReferences();
  const malformed = refs.filter((r) => r.malformed);
  const wellFormed = refs.filter((r) => !r.malformed);
  const unique = [...new Set(wellFormed.map((r) => r.id))].sort();

  console.log(`verify-issue-links: ${refs.length} reference(s) to ${unique.length} distinct issue id(s).`);

  let failed = false;

  if (malformed.length) {
    failed = true;
    console.error(`\nFAIL — ${malformed.length} malformed id(s):`);
    for (const r of malformed) console.error(`  ${r.where}: ${JSON.stringify(r.id)} is not a well-formed beads id`);
  }

  const known = knownIssueIds();
  if (known && known.error !== undefined) {
    // Not a failure. This script is the LOCAL half by design, and a machine
    // without `bd` is exactly the case the split exists for. It says so and
    // exits on the format result alone rather than pretending it checked.
    console.log(`\nSKIP existence: \`bd\` could not be reached (${known.error.split('\n')[0]}).`);
    console.log('The format check above still ran. Existence is only checkable where beads is.');
    process.exit(failed ? 1 : 0);
  }

  const missing = unique.filter((id) => !known.has(id));
  if (missing.length) {
    failed = true;
    console.error(`\nFAIL — ${missing.length} id(s) referenced but not in beads:`);
    for (const id of missing) {
      const where = wellFormed.filter((r) => r.id === id).map((r) => r.where);
      console.error(`  ${id} — referenced by ${where.join(', ')}`);
    }
    console.error('\nAn id that names no issue is a link to nothing. File the issue, or fix the reference.');
  } else if (failed) {
    // Existence held, but the format check above did not. Saying PASS here — on
    // a run whose exit code is 1 — would be a line that reads like a result and
    // describes only half of one.
    console.log(`Existence held for all ${unique.length} well-formed id(s); the malformed ones above are the failure.`);
  } else if (unique.length) {
    console.log(`PASS — every referenced id exists in beads (${known.size} issues known).`);
  } else {
    console.log('PASS — nothing references an issue id yet.');
  }
  process.exit(failed ? 1 : 0);
}

main();
