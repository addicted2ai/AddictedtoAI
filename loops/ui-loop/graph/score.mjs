#!/usr/bin/env node
/**
 * score.mjs — the scoring engine. No model totals anything. Ported in shape from
 * dean-loop-engineering-2/gates/score.py: PASS/total per dimension, (critical) caps, anchored
 * fallback for judges not re-run, red-team risk products, ANDed stop conditions emitted in the
 * artifact and never asserted in prose. Weights are read from README.md's Rubric v2 table (one owner).
 *
 *   node loops/ui-loop/graph/score.mjs <packet> <v> [--round N] [--prev SCORE.json] [--write]
 *   node loops/ui-loop/graph/score.mjs --selftest
 *
 * Without --write it prints and writes nothing (the --dry-run default the source graph learned to need).
 */
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOOP = resolve(HERE, '..');
const ARTIFACTS = join(HERE, 'artifacts');
export const RT_CRITICAL = 50;           // owner of this number
export const DIM_FLOOR = 8;              // stop condition: every dimension >= 8
export const REVISION_CAP = 3;

export function readRubric(readmeText) {
  const rubric = {};
  const sec = readmeText.split(/^## Rubric v2/m)[1] || '';
  for (const line of sec.split('\n')) {
    const m = line.match(/^\|\s*([A-Z]{3,5})\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|/);
    if (m) rubric[m[1]] = { name: m[2], weight: Number(m[3]), judge: m[4] };
  }
  const total = Object.values(rubric).reduce((a, d) => a + d.weight, 0);
  if (total !== 100) throw new Error(`rubric weights sum to ${total}, not 100`);
  return rubric;
}

/** verdicts: array of parsed JV objects (one per judge). */
export function dimensionScores(verdicts, rubric) {
  const acc = {};
  for (const tag of Object.keys(rubric)) acc[tag] = { pass: 0, total: 0, uncertain: 0, criticalFail: false, blocked: [] };
  for (const jv of verdicts) for (const q of jv.questions || []) {
    if (q.meta) continue;
    const d = acc[q.tag]; if (!d) continue;
    if (q.blocked_on) { d.blocked.push(q.blocked_on); continue; }   // scores the knowledge base, not the design
    d.total += 1;
    if (q.verdict === 'PASS') d.pass += 1;
    if (q.verdict === 'UNCERTAIN') d.uncertain += 1;
    if (q.verdict === 'FAIL' && q.critical) d.criticalFail = true;
  }
  const scores = {};
  for (const [tag, d] of Object.entries(acc)) {
    let s = d.total ? (10 * d.pass) / d.total : null;
    if (s !== null && d.criticalFail) s = Math.min(s, 2);
    scores[tag] = { score: s === null ? null : Number(s.toFixed(2)), pass: d.pass, total: d.total, uncertain: d.uncertain, critical_fail: d.criticalFail, blocked_on: d.blocked };
  }
  return scores;
}

export function overall(scores, rubric) {
  let sum = 0, wsum = 0;
  for (const [tag, r] of Object.entries(rubric)) {
    const s = scores[tag]?.score; if (s === null || s === undefined) continue;
    sum += (r.weight * s) / 10; wsum += r.weight;
  }
  if (!wsum) return null;
  return Number(((sum * 100) / wsum).toFixed(1));   // renormalised over scored dimensions
}

export function rtCriticals(rt) {
  const crit = [];
  for (const fm of rt?.failure_modes || []) {
    const risk = (fm.probability || 0) * (fm.severity || 0) * (fm.detectability || 0);
    if (risk >= RT_CRITICAL) crit.push({ id: fm.id, risk, mode: fm.mode });
  }
  return crit;
}

/** Anchored fallback: JV at v, else the newest JV below v for that judge. */
export function pickVerdicts(files, packet, v) {
  const byJudge = {};
  for (const f of files) {
    const m = basename(f).match(/^JV-([a-z]+)-(.+)-(\d+)\.json$/);
    if (!m || m[2] !== packet) continue;
    const ver = Number(m[3]); if (ver > v) continue;
    const cur = byJudge[m[1]];
    if (!cur || ver > cur.ver) byJudge[m[1]] = { file: f, ver };
  }
  return Object.entries(byJudge).map(([judge, x]) => ({ judge, file: x.file, ver: x.ver, anchored: x.ver !== v }));
}

export function stopConditions({ gates, scores, criticals, keeperOpen, round, prevOverall, thisOverall, openMR, coverage }) {
  const dims = Object.values(scores).filter((s) => s.score !== null);
  const c = {
    hard_gates_pass: gates === null ? { met: false, why: 'no GR for this version' } : { met: !!gates.pass },
    all_dimensions_ge_8: { met: dims.length > 0 && dims.every((s) => s.score >= DIM_FLOOR) },
    rt_criticals_zero: { met: criticals !== null && criticals.length === 0, ...(criticals === null ? { why: 'no RT for this version' } : {}) },
    keeper_section_empty: { met: keeperOpen === 0, open_items: keeperOpen },
    revisions_le_cap: { met: round !== null && round <= REVISION_CAP, ...(round === null ? { why: 'pass --round' } : {}) },
    plateau_under_1pct: prevOverall === null || thisOverall === null ? { met: false, why: 'needs a prior scored version' } : { met: Math.abs(thisOverall - prevOverall) < 1 },
    no_open_measurement_request: { met: openMR.length === 0, open: openMR },
    rig_coverage_complete: coverage === null ? { met: false, why: 'no coverage GR' } : { met: !!coverage.pass },
    knowledge_debt_clear: { met: dims.every((s) => s.blocked_on.length === 0) },
  };
  return { conditions: c, all_met: Object.values(c).every((x) => x.met) };
}

function keeperOpenCount(stateText) {
  const sec = (stateText.split(/^## Next \(keeper decisions\)\s*$/m)[1] || '').split(/^## /m)[0];
  let n = 0;
  for (const m of sec.matchAll(/^\s*\d+\.\s+(.*)$/gm)) { const t = m[1].trim(); if (!/^~~/.test(t)) n += 1; }
  return n;
}

function openMRs() {
  if (!existsSync(ARTIFACTS)) return [];
  return readdirSync(ARTIFACTS).filter((f) => /^MR-UI-.*\.md$/.test(f))
    .filter((f) => /^status:\s*(open|scheduled)/m.test(readFileSync(join(ARTIFACTS, f), 'utf8'))).map((f) => f.replace(/\.md$/, ''));
}

function jsonFence(text) { const m = text.match(/```json\n([\s\S]*?)```/); return m ? JSON.parse(m[1]) : null; }

function run(packet, v, opts) {
  const rubric = readRubric(readFileSync(join(HERE, 'README.md'), 'utf8'));
  const files = existsSync(ARTIFACTS) ? readdirSync(ARTIFACTS).map((f) => join(ARTIFACTS, f)) : [];
  const picked = pickVerdicts(files, packet, v);
  if (!picked.length) { console.error(`no JV-*-${packet}-<=${v}.json in ${ARTIFACTS}`); process.exit(2); }
  const verdicts = picked.map((p) => JSON.parse(readFileSync(p.file, 'utf8')));
  const scores = dimensionScores(verdicts, rubric);
  const ov = overall(scores, rubric);
  const rtFile = join(ARTIFACTS, `RT-${packet}-${v}.md`);
  const rt = existsSync(rtFile) ? jsonFence(readFileSync(rtFile, 'utf8')) : null;
  const criticals = rt ? rtCriticals(rt) : null;
  const grFile = join(ARTIFACTS, `GR-${packet}-${v}.json`);
  const gates = existsSync(grFile) ? JSON.parse(readFileSync(grFile, 'utf8')) : null;
  const covFiles = files.filter((f) => /GR-coverage-/.test(f)).sort();
  const coverage = covFiles.length ? JSON.parse(readFileSync(covFiles[covFiles.length - 1], 'utf8')) : null;
  const prev = opts.prev ? JSON.parse(readFileSync(opts.prev, 'utf8')).overall_100 : null;
  const keeperOpen = keeperOpenCount(readFileSync(join(LOOP, 'state.md'), 'utf8'));
  const stop = stopConditions({ gates, scores, criticals, keeperOpen, round: opts.round, prevOverall: prev, thisOverall: ov, openMR: openMRs(), coverage });
  const art = {
    id: `SCORE-${packet}-${v}`, version: 1, schema: 'loops/ui-loop/graph/schemas.md#score',
    depends_on: picked.map((p) => basename(p.file, '.json')).concat(rt ? [`RT-${packet}-${v}`] : []),
    packet, packet_version: v, computed_at: new Date().toISOString(),
    anchored_verdicts: picked.filter((p) => p.anchored).map((p) => ({ judge: p.judge, carried_from: p.ver })),
    dimensions: scores, overall_100: ov, rt_criticals: criticals, stop_conditions: stop,
    note: 'overall is REPORTED, never a target (K7). A carried verdict is a score with no reader.',
  };
  console.log(JSON.stringify(art, null, 2));
  if (opts.write) { writeFileSync(join(ARTIFACTS, art.id + '.json'), JSON.stringify(art, null, 2)); console.error(`wrote ${art.id}.json`); }
  else console.error('(dry run — pass --write to record this score)');
}

function selftest() {
  const t = (name, ok) => { if (!ok) { console.error('SELFTEST FAIL', name); process.exitCode = 1; } else console.log('ok  ', name); };
  const rubric = readRubric('## Rubric v2\n\n| Tag | Dimension | Weight | Judge |\n|---|---|---|---|\n| HIER | h | 60 | 05a |\n| ALLR | a | 40 | 05c |\n');
  t('rubric parses to 100', rubric.HIER.weight === 60 && rubric.ALLR.weight === 40);
  let threw = false; try { readRubric('## Rubric v2\n| HIER | h | 50 | x |\n'); } catch { threw = true; } t('weights must sum to 100', threw);
  const jv = { questions: [
    { q: 1, tag: 'HIER', verdict: 'PASS' }, { q: 2, tag: 'HIER', verdict: 'FAIL' }, { q: 3, tag: 'HIER', verdict: 'UNCERTAIN' },
    { q: 4, tag: 'ALLR', verdict: 'PASS' }, { q: 5, tag: 'ALLR', verdict: 'FAIL', critical: true }, { q: 9, tag: 'ALLR', verdict: 'PASS', meta: true } ] };
  const s = dimensionScores([jv], rubric);
  t('pass/total with uncertain not pass', s.HIER.score === 3.33 && s.HIER.total === 3);
  t('critical fail caps at 2, meta excluded', s.ALLR.score === 2 && s.ALLR.total === 2);
  t('overall weighted', overall(s, rubric) === Number(((60 * 3.33 / 10 + 40 * 2 / 10)).toFixed(1)));
  t('rt critical at 50', rtCriticals({ failure_modes: [{ id: 'a', probability: 5, severity: 5, detectability: 2 }, { id: 'b', probability: 2, severity: 2, detectability: 2 }] }).map((c) => c.id).join() === 'a');
  const picked = pickVerdicts(['/x/JV-hier-CP-UI-001-2-1.json', '/x/JV-sys-CP-UI-001-2-1.json', '/x/JV-sys-CP-UI-001-2-2.json', '/x/JV-hier-CP-UI-001-3-2.json'], 'CP-UI-001-2', 2);
  t('anchored fallback picks newest <= v and flags the carry', picked.length === 2 && picked.find((p) => p.judge === 'hier').anchored && !picked.find((p) => p.judge === 'sys').anchored);
  const stop = stopConditions({ gates: { pass: true }, scores: { HIER: { score: 9, blocked_on: [] } }, criticals: [], keeperOpen: 0, round: 1, prevOverall: 80, thisOverall: 80.5, openMR: [], coverage: { pass: true } });
  t('all stop conditions met', stop.all_met);
  const stop2 = stopConditions({ gates: { pass: true }, scores: { HIER: { score: 9, blocked_on: [] } }, criticals: [], keeperOpen: 1, round: 1, prevOverall: 80, thisOverall: 80.5, openMR: ['MR-UI-001'], coverage: { pass: true } });
  t('an open keeper item or MR blocks', !stop2.all_met && !stop2.conditions.keeper_section_empty.met && !stop2.conditions.no_open_measurement_request.met);
  if (!process.exitCode) console.log('score.mjs selftest: all pass');
}

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
if (args.includes('--selftest')) selftest();
else if (args.length >= 2) run(args[0], Number(args[1]), { round: opt('--round') ? Number(opt('--round')) : null, prev: opt('--prev'), write: args.includes('--write') });
else console.log('usage: score.mjs <packet> <v> [--round N] [--prev SCORE.json] [--write] | --selftest');
