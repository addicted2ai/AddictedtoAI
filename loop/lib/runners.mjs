/**
 * runners.mjs — reading the runner registry.
 *
 * The registry is the ONLY place a model, provider or harness is named. Every
 * consumer here takes ids and roles; nothing branches on who a runner is.
 */

import { readFileSync, existsSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

import { JOB_TYPES } from './config.mjs';

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
    // OPTIONAL clearance: the complete set of job types this runner may author.
    // ABSENT MEANS EVERY TYPE, so every entry written before this existed keeps
    // its behaviour exactly. Validated against JOB_TYPES rather than accepted as
    // free text, because the failure mode of a typo here is silent and wrong in
    // the DANGEROUS direction: an unknown string can never equal a candidate's
    // type, so `job_types: [pots]` would refuse every job forever, and
    // `job_types: [post]` misspelt in the other direction would quietly clear
    // nothing. A load-time error is the only honest reading of a name that is
    // not a job type.
    if (r.job_types !== undefined) {
      if (!Array.isArray(r.job_types) || r.job_types.length === 0) {
        throw new Error(
          `${where}: "job_types" must be a non-empty list when present; omit it entirely to clear every type`,
        );
      }
      for (const t of r.job_types) {
        if (!JOB_TYPES.includes(t)) {
          throw new Error(
            `${where}: unknown job type "${t}" in "job_types" (expected one of ${JOB_TYPES.join(', ')})`,
          );
        }
      }
    }
    // OPTIONAL enablement: absent means enabled, so entries written before
    // this field existed continue to be selectable. A present value is a
    // policy declaration and therefore must not be accepted in a looser shape.
    if (r.enabled !== undefined && typeof r.enabled !== 'boolean') {
      throw new Error(`${where}: "enabled" must be a boolean when present`);
    }
    // OPTIONAL effort rung: absent means this entry declares no rung. Keep the
    // value registry-owned and validate only its shape, so newly exposed
    // harness rungs do not require a machinery edit.
    if (r.effort !== undefined && (typeof r.effort !== 'string' || !r.effort.trim())) {
      throw new Error(`${where}: "effort" must be a non-empty string when present`);
    }
    // OPTIONAL escalation: the destination is checked after every entry has
    // been indexed, because it must name another registered author-capable
    // entry. Absent means this entry has no escalation step.
    if (r.escalates_to !== undefined && (typeof r.escalates_to !== 'string' || !r.escalates_to.trim())) {
      throw new Error(`${where}: "escalates_to" must be a non-empty string when present`);
    }
    for (const key of ['capacity_stderr_pattern', 'startup_failure_stderr_pattern']) {
      if (!r[key]) continue;
      try {
        new RegExp(r[key], 'i');
      } catch (e) {
        throw new Error(`${where}: ${key} is not a valid regex: ${e.message}`);
      }
    }
  }

  const byId = new Map(doc.runners.map((r) => [r.id, r]));
  const defaultId = doc.default ?? doc.runners[0].id;
  if (!byId.has(defaultId)) {
    throw new Error(`${ctx.runnersPath}: default "${defaultId}" is not a registered runner id`);
  }
  for (const r of doc.runners) {
    if (r.escalates_to === undefined) continue;
    const where = `${ctx.runnersPath} runner "${r.id}"`;
    const target = byId.get(r.escalates_to);
    if (!target) {
      throw new Error(`${where}: "escalates_to" names unknown runner "${r.escalates_to}"`);
    }
    if (target.id === r.id) {
      throw new Error(`${where}: "escalates_to" must name a different runner than itself`);
    }
    if (!target.roles.includes('author')) {
      throw new Error(
        `${where}: "escalates_to" target "${target.id}" is not cleared for the author role`,
      );
    }
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
  if (def.enabled !== false && (!role || def.roles.includes(role))) return def;
  const alt = registry.runners.find(
    (r) => r.enabled !== false && (!role || r.roles.includes(role)),
  );
  if (!alt) {
    throw new Error(
      role
        ? `no registered runner is cleared for role "${role}"`
        : 'no registered enabled runner',
    );
  }
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

/** Normalize the legacy single record and the append-only history to one read shape. */
export function conformanceHistory(records, runnerId) {
  const record = records?.[runnerId];
  if (!record) return [];
  if (Array.isArray(record)) return record;
  if (typeof record === 'object' && record.checks !== undefined) return [record];
  return [];
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
 * @returns {{ok: true, entries: number, unrecorded?: boolean} | {ok: false, reason: string, failed: string[], entries: number}}
 */
export function conformanceGate(records, runnerId, { passesToSupersede = 3 } = {}) {
  const history = conformanceHistory(records, runnerId);
  const entries = history.length;
  if (entries === 0) return { ok: true, unrecorded: true, entries };

  const names = [];
  const seen = new Set();
  for (const entry of history) {
    for (const check of entry?.checks ?? []) {
      if (String(check?.result).toUpperCase() !== 'FAIL' || !check.name || seen.has(check.name)) {
        continue;
      }
      seen.add(check.name);
      names.push(check.name);
    }
  }

  const standing = [];
  for (const name of names) {
    let failure = null;
    let passes = 0;
    for (const entry of history) {
      const check = (entry?.checks ?? []).find((candidate) => candidate?.name === name);
      const result = String(check?.result).toUpperCase();
      if (result === 'FAIL') {
        failure = { date: entry?.date || 'undated' };
        passes = 0;
      } else if (failure) {
        if (result === 'PASS') passes += 1;
        else passes = 0;
        if (passes >= passesToSupersede) failure = null;
      }
    }
    if (failure) standing.push({ name, date: failure.date, passes });
  }

  if (standing.length === 0) return { ok: true, entries };
  const failed = standing.map((item) => item.name);
  const details = standing.map(
    (item) =>
      `${item.name} (standing FAIL ${item.date}; ${item.passes} consecutive PASSes since; ` +
      `requires ${passesToSupersede})`,
  );
  return {
    ok: false,
    failed,
    reason:
      `runner "${runnerId}" has unsuperseded conformance FAIL(s): ${details.join(', ')}. ` +
      `It may not be used for author or reviewer roles until it passes ` +
      `(read ${entries} conformance entr${entries === 1 ? 'y' : 'ies'}).`,
    entries,
  };
}
