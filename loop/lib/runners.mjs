/**
 * runners.mjs — reading the runner registry.
 *
 * The registry is the ONLY place a model, provider or harness is named. Every
 * consumer here takes ids and roles; nothing branches on who a runner is.
 */

import { readFileSync, existsSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

export const ROLES = Object.freeze(['author', 'reviewer']);
export const TIERS = Object.freeze(['frontier', 'cheap']);

export function loadRunners(ctx) {
  let raw;
  try {
    raw = readFileSync(ctx.runnersPath, 'utf8');
  } catch (e) {
    throw new Error(`cannot read runner registry at ${ctx.runnersPath}: ${e.message}`);
  }
  let doc;
  try {
    doc = parseYaml(raw);
  } catch (e) {
    throw new Error(`${ctx.runnersPath} is not valid YAML: ${e.message}`);
  }
  if (!doc || !Array.isArray(doc.runners) || doc.runners.length === 0) {
    throw new Error(`${ctx.runnersPath}: expected a non-empty "runners:" list`);
  }

  const seen = new Set();
  for (const r of doc.runners) {
    const where = `${ctx.runnersPath} runner "${r?.id ?? '(no id)'}"`;
    if (!r.id || typeof r.id !== 'string') throw new Error(`${where}: missing "id"`);
    if (seen.has(r.id)) throw new Error(`${where}: duplicate id`);
    seen.add(r.id);
    if (!r.provider) throw new Error(`${where}: missing "provider" (the lane key)`);
    if (!TIERS.includes(r.tier)) {
      throw new Error(`${where}: "tier" must be one of ${TIERS.join(', ')}`);
    }
    if (!Array.isArray(r.roles) || r.roles.length === 0) {
      throw new Error(`${where}: missing "roles"`);
    }
    for (const role of r.roles) {
      if (!ROLES.includes(role)) {
        throw new Error(`${where}: unknown role "${role}" (expected ${ROLES.join('/')})`);
      }
    }
    if (!r.command || typeof r.command !== 'string') {
      throw new Error(`${where}: missing "command" template`);
    }
    if (r.capacity_stderr_pattern) {
      try {
        new RegExp(r.capacity_stderr_pattern, 'i');
      } catch (e) {
        throw new Error(`${where}: capacity_stderr_pattern is not a valid regex: ${e.message}`);
      }
    }
  }

  const byId = new Map(doc.runners.map((r) => [r.id, r]));
  const defaultId = doc.default ?? doc.runners[0].id;
  if (!byId.has(defaultId)) {
    throw new Error(`${ctx.runnersPath}: default "${defaultId}" is not a registered runner id`);
  }
  return { runners: doc.runners, byId, defaultId };
}

/** Resolve the runner for a role: an explicit id, else the default, else the first cleared one. */
export function pickRunner(registry, { id, role }) {
  if (id) {
    const r = registry.byId.get(id);
    if (!r) {
      throw new Error(
        `unknown runner "${id}". Registered: ${[...registry.byId.keys()].join(', ')}`,
      );
    }
    if (role && !r.roles.includes(role)) {
      throw new Error(`runner "${id}" is not cleared for role "${role}"`);
    }
    return r;
  }
  const def = registry.byId.get(registry.defaultId);
  if (!role || def.roles.includes(role)) return def;
  const alt = registry.runners.find((r) => r.roles.includes(role));
  if (!alt) throw new Error(`no registered runner is cleared for role "${role}"`);
  return alt;
}

/**
 * The recorded conformance result (`data/conformance.json`, written by
 * loop/conformance.mjs).
 *
 * Kept out of `loop/` on purpose: the file is keyed by runner id, and runner
 * ids name harnesses. `loop/` must stay free of harness names or the swap is
 * not real (specs/loop, task 7.1's grep).
 */
export function loadConformance(ctx) {
  if (!existsSync(ctx.conformancePath)) return {};
  try {
    return JSON.parse(readFileSync(ctx.conformancePath, 'utf8'));
  } catch (e) {
    throw new Error(`${ctx.conformancePath} is not valid JSON: ${e.message}`);
  }
}

/**
 * The conformance gate (specs/loop): "A combination with any FAIL SHALL NOT be
 * used for `author` or `reviewer` roles."
 *
 * Note the exact predicate: a *recorded* FAIL blocks. No record at all does not
 * block — it warns. That is the spec's wording, and it is deliberate: a fresh
 * clone has no records, and refusing to run at all would make the first run
 * after a clone impossible.
 *
 * @returns {{ok: true} | {ok: false, reason: string, failed: string[]}}
 */
export function conformanceGate(records, runnerId) {
  const rec = records?.[runnerId];
  if (!rec) return { ok: true, unrecorded: true };
  const failed = (rec.checks ?? [])
    .filter((c) => String(c.result).toUpperCase() === 'FAIL')
    .map((c) => c.name);
  if (failed.length === 0) return { ok: true };
  return {
    ok: false,
    failed,
    reason:
      `runner "${runnerId}" has recorded conformance FAIL(s): ${failed.join(', ')} ` +
      `(recorded ${rec.date ?? 'undated'} in the conformance record). ` +
      `It may not be used for author or reviewer roles until it passes.`,
  };
}
