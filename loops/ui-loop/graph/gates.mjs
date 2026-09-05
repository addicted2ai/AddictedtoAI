#!/usr/bin/env node
/**
 * gates.mjs — deterministic gates for the ui-loop graph. Code, not LLM. Never spend a judge on
 * what code can check. Ported in shape from dean-loop-engineering-2/gates/run.py (size_gate,
 * declared_budget, dangling_citation_check, jv-meta-abuse, --sweep, --selftest).
 *
 *   node loops/ui-loop/graph/gates.mjs --sweep [--round N]      every artifact + state.md; exit 1 on FAIL
 *   node loops/ui-loop/graph/gates.mjs --packet <CP file>       one concept packet
 *   node loops/ui-loop/graph/gates.mjs --coverage <evidence set dir>   rig coverage vs every judge contract
 *   node loops/ui-loop/graph/gates.mjs --jv <JV json> --contract <judge contract md>
 *   node loops/ui-loop/graph/gates.mjs --keeper --round N       keeper-item ageing in state.md
 *   node loops/ui-loop/graph/gates.mjs --selftest
 *
 * Only --report writes anything (a GR-*.json); everything else prints. A run that writes an artifact
 * nobody commissioned is the failure the source graph recorded on 2026-08-28.
 */
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));           // loops/ui-loop/graph
const LOOP = resolve(HERE, '..');                                 // loops/ui-loop
const REPO = resolve(LOOP, '..', '..');                           // repo root
const ARTIFACTS = join(HERE, 'artifacts');
const HYPE = ['revolutionary', 'game-changing', 'game changing', 'unprecedented', 'best-in-class', 'best in class',
  'blazing', 'insane', 'mind-blowing', 'mind blowing', 'groundbreaking', 'cutting-edge', 'next-level', 'world-class'];
const AGE_LIMIT = 3;

const out = { fail: [], warn: [], pass: [] };
const FAIL = (m) => out.fail.push(m);
const WARN = (m) => out.warn.push(m);
const PASS = (m) => out.pass.push(m);
const bytes = (s) => Buffer.byteLength(s, 'utf8');

/** Budgets are owned by schemas.md's table; this reads them, never restates them. */
export function readBudgets(schemasText) {
  const budgets = {};
  for (const line of schemasText.split('\n')) {
    const m = line.match(/^\|\s*`([^`]+)`\s*\|[^|]*\|\s*(\d+)\s*\|/);
    if (m) budgets[m[1]] = Number(m[2]);
  }
  return budgets;
}

/** Longest budget key that prefixes the file name (CP-UI before CP, MR before nothing). */
export function budgetFor(name, budgets) {
  const keys = Object.keys(budgets).filter((k) => name === k || name.startsWith(k + '-') || name.startsWith(k + '.'))
    .sort((a, b) => b.length - a.length);
  return keys.length ? { key: keys[0], budget: budgets[keys[0]] } : null;
}

export function sizeGate(name, text, budgets) {
  const b = budgetFor(name, budgets);
  if (!b) return { status: 'FAIL', msg: `${name}: no budget row in schemas.md — unbudgeted files grow unbounded` };
  const n = bytes(text);
  if (n > b.budget) return { status: 'FAIL', msg: `${name}: ${n} B > ${b.key} budget ${b.budget} B — the artifact is wrong, not the budget` };
  if (n > b.budget * 0.8) return { status: 'WARN', msg: `${name}: ${n} B is over 80% of ${b.budget} B` };
  return { status: 'PASS', msg: `${name}: ${n}/${b.budget} B` };
}

/** First ```yaml fence, or a leading --- front matter, as raw lines. */
export function yamlBlock(text) {
  let m = text.match(/```ya?ml\n([\s\S]*?)```/);
  if (m) return m[1];
  m = text.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : '';
}

export function yamlScalar(block, key) {
  const m = block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

/** depends_on: [a, b, c] possibly spanning lines; returns tokens. */
export function dependsOn(block) {
  const m = block.match(/depends_on:\s*\[([\s\S]*?)\]/);
  if (!m) return null;
  return m[1].split(',').map((t) => t.trim()).filter(Boolean);
}

const ID_RE = /^(CP-UI|JV|RT|SCORE|DR|AR|RD|MR-UI|CAL-UI|GR|BRIEF-UI)-/;

export function danglingCitations(deps, existsFn) {
  const missing = [];
  for (const raw of deps) {
    const tok = raw.replace(/\s*\(.*$/, '').trim();      // drop "(section refs)"
    if (!tok || /\s/.test(tok)) continue;                 // prose refs are not checkable
    const id = tok.replace(/\.v[\d.]+$/, '').replace(/\.md$/, '');
    if (ID_RE.test(id)) {
      if (!existsFn(join(ARTIFACTS, id + '.md')) && !existsFn(join(ARTIFACTS, id + '.json')) && !existsFn(join(HERE, id + '.md'))) missing.push(tok);
    } else if (tok.includes('/') || tok.endsWith('.md')) {
      const p1 = join(LOOP, tok.replace(/\s.*$/, '')), p2 = join(REPO, tok), p3 = join(HERE, tok);
      if (!existsFn(p1) && !existsFn(p2) && !existsFn(p3)) missing.push(tok);
    }
  }
  return missing;
}

export function hypeScan(text) {
  const low = text.toLowerCase();
  return HYPE.filter((w) => low.includes(w));
}

const PACKET_KEYS = ['name', 'core_idea', 'reader_walks_away_with', 'surfaces', 'elements', 'design_moves', 'reuses', 'fence', 'known_risks', 'open_questions', 'build_estimate'];

export function packetChecks(text, existsFn) {
  const block = yamlBlock(text);
  const problems = [];
  for (const k of PACKET_KEYS) if (!new RegExp(`^${k}:`, 'm').test(block)) problems.push(`missing key ${k}`);
  // every data_source path must exist today (globs checked at their directory)
  for (const m of block.matchAll(/data_source:\s*(.+)/g)) {
    for (const tok of m[1].split(/[,\s]+/)) {
      const t = tok.replace(/^[`'"<]+|[`'">,]+$/g, '');
      if (!t.includes('/')) continue;
      const dir = t.includes('*') ? t.slice(0, t.indexOf('*')).replace(/\/$/, '') : t;
      if (!existsFn(join(REPO, dir))) problems.push(`data_source does not exist in the repo: ${t}`);
    }
  }
  if (!/^reuses:\s*$/m.test(block) && !/^reuses:\s*\[/m.test(block)) problems.push('no reuses: block (Reuse before you draw)');
  const hype = hypeScan(text);
  return { problems, hype };
}

/** coverage: labels=all|a,b; themes=light,dark; viewports=1440,390; files=x.png,y.png */
export function parseCoverage(contractText) {
  const m = contractText.match(/^coverage:\s*(.+)$/m);
  if (!m) return null;
  const spec = { labels: 'all', themes: [], viewports: [], files: [] };
  for (const part of m[1].split(';')) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (!k || v === undefined) continue;
    if (k === 'labels') spec.labels = v === 'all' ? 'all' : v.split(',').map((s) => s.trim()).filter(Boolean);
    else if (k === 'files') spec.files = v.split(',').map((s) => s.trim()).filter(Boolean);
    else spec[k] = v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return spec;
}

export function coverageGaps(spec, manifest, existsFile) {
  const have = new Set(manifest.entries.map((e) => `${e.label}--${e.theme}--${e.viewport}`));
  const labels = spec.labels === 'all' ? [...new Set(manifest.entries.map((e) => e.label))] : spec.labels;
  const missing = [];
  for (const l of labels) for (const t of spec.themes) for (const v of spec.viewports) {
    if (!have.has(`${l}--${t}--${v}`)) missing.push(`${l}--${t}--${v}.png`);
  }
  for (const f of spec.files) if (!existsFile(f)) missing.push(f);
  return missing;
}

/** Keeper items: numbered lines under "## Next (keeper decisions)"; [rN] = round opened; ~~x~~ = struck. */
export function keeperItems(stateText) {
  const sec = stateText.split(/^## Next \(keeper decisions\)\s*$/m)[1];
  if (sec === undefined) return null;
  const body = sec.split(/^## /m)[0];
  const items = [];
  // an item runs to the next numbered line or the end of the section (continuation lines belong to it)
  for (const m of body.matchAll(/^\s*(\d+)\.\s+([\s\S]*?)(?=^\s*\d+\.\s|(?![\s\S]))/gm)) {
    const text = m[2].trim();
    const struck = /^~~/.test(text) && !/[^~\s.]/.test(text.replace(/~~[^~]*~~/g, '').replace(/\b(K\d+|yes|done)\b/g, ''));
    const r = text.match(/\[r(\d+)\]/);
    items.push({ n: Number(m[1]), text: text.slice(0, 90), struck, opened: r ? Number(r[1]) : null });
  }
  return items;
}

export function ageingGate(items, round) {
  const res = [];
  for (const it of items) {
    if (it.struck) continue;
    if (it.opened === null) { res.push({ status: 'WARN', msg: `keeper item ${it.n} carries no [rN] opened marker: "${it.text}"` }); continue; }
    const age = round - it.opened;
    if (age >= AGE_LIMIT) res.push({ status: 'FAIL', msg: `keeper item ${it.n} open ${age} rounds (limit ${AGE_LIMIT}) — a process failure, not a queue entry (F17): "${it.text}"` });
  }
  return res;
}

export function jvChecks(jvText, contractText) {
  const problems = [];
  let jv;
  try { jv = JSON.parse(jvText); } catch (e) { return [`JSON does not parse: ${e.message}`]; }
  const metaQs = [...contractText.matchAll(/^\s*(\d+)\.\s+`\(meta\)`/gm)].map((m) => Number(m[1]));
  const tags = new Set([...contractText.matchAll(/`\[([A-Z]+)\]`/g)].map((m) => m[1]));
  for (const q of jv.questions || []) {
    if (!['PASS', 'FAIL', 'UNCERTAIN'].includes(q.verdict)) problems.push(`q${q.q}: verdict ${q.verdict}`);
    if (q.meta && !metaQs.includes(q.q)) problems.push(`q${q.q}: meta invented — the contract marks (meta) only on ${metaQs.join(',') || 'nothing'}`);
    if (q.tag && tags.size && !tags.has(q.tag)) problems.push(`q${q.q}: tag ${q.tag} not in this contract`);
  }
  const numeric = JSON.stringify(jv).match(/"(score|overall|rating)"\s*:\s*[\d.]+/);
  if (numeric) problems.push(`numeric score in a verdict (${numeric[0]}) — score.mjs computes scores`);
  if (!jv.diagnosis || !jv.downstream) problems.push('diagnosis/downstream missing — every verdict is a diagnosis');
  return problems;
}

// ---------------------------------------------------------------- runners
function listArtifacts() {
  const files = [];
  if (existsSync(ARTIFACTS)) for (const f of readdirSync(ARTIFACTS)) if (/\.(md|json)$/.test(f)) files.push(join(ARTIFACTS, f));
  for (const f of readdirSync(HERE)) if (/^BRIEF-UI-.*\.md$/.test(f)) files.push(join(HERE, f));
  return files;
}

function sweep(round) {
  const budgets = readBudgets(readFileSync(join(HERE, 'schemas.md'), 'utf8'));
  const state = readFileSync(join(LOOP, 'state.md'), 'utf8');
  const s = sizeGate('state.md', state, budgets); out[s.status.toLowerCase()].push(s.msg);
  for (const f of listArtifacts()) {
    const text = readFileSync(f, 'utf8'); const name = basename(f);
    const r = sizeGate(name, text, budgets); out[r.status.toLowerCase()].push(r.msg);
    if (name.endsWith('.md')) {
      const block = yamlBlock(text);
      const deps = dependsOn(block);
      if (!yamlScalar(block, 'id')) FAIL(`${name}: no id: in its header`);
      if (deps === null) FAIL(`${name}: no depends_on`);
      else { const miss = danglingCitations(deps, existsSync); if (miss.length) FAIL(`${name}: depends_on names nothing on disk: ${miss.join(', ')}`); }
      if (/^CP-UI-/.test(name)) { const { problems, hype } = packetChecks(text, existsSync); problems.forEach((p) => FAIL(`${name}: ${p}`)); if (hype.length) WARN(`${name}: hype lexicon present (${hype.join(', ')}) — allowed only verbatim, attributed, labelled`); }
    }
  }
  const items = keeperItems(state);
  if (items === null) FAIL('state.md: no "## Next (keeper decisions)" section — the keeper exit is required');
  else if (round === null) WARN(`keeper ageing not evaluated (pass --round N); ${items.filter((i) => !i.struck).length} open item(s)`);
  else ageingGate(items, round).forEach((r) => out[r.status.toLowerCase()].push(r.msg));
}

function coverage(setDir) {
  const manifest = JSON.parse(readFileSync(join(setDir, 'manifest.json'), 'utf8'));
  const cdir = join(HERE, 'contracts');
  for (const f of readdirSync(cdir).filter((f) => /^judge-.*\.md$/.test(f))) {
    const spec = parseCoverage(readFileSync(join(cdir, f), 'utf8'));
    if (!spec) { FAIL(`${f}: no coverage: line — a gate that can see nothing fails`); continue; }
    const gaps = coverageGaps(spec, manifest, (name) => existsSync(join(setDir, name)));
    if (gaps.length) FAIL(`${f}: rig did not capture ${gaps.length} required item(s): ${gaps.slice(0, 8).join(', ')}${gaps.length > 8 ? ' …' : ''}`);
    else PASS(`${f}: coverage complete`);
  }
}

function selftest() {
  const budgets = readBudgets('| `CP-UI` | concept packet | 6500 |\n| `JV` | judge verdict | 9000 |\n| `state.md` | resume | 8000 |\n');
  const t = (name, ok) => { if (!ok) { console.error('SELFTEST FAIL', name); process.exitCode = 1; } else console.log('ok  ', name); };
  t('budgets parse', budgets['CP-UI'] === 6500 && budgets['state.md'] === 8000);
  t('longest prefix wins', budgetFor('CP-UI-001-2.md', budgets).key === 'CP-UI');
  t('unbudgeted fails', sizeGate('ZZ-1.md', 'x', budgets).status === 'FAIL');
  t('over budget fails', sizeGate('JV-hier-CP-UI-001-2-1.json', 'x'.repeat(9001), budgets).status === 'FAIL');
  t('multibyte counted as bytes', bytes('—') === 3);
  const blk = yamlBlock('# T\n```yaml\nid: CP-UI-001-1\ndepends_on: [BRIEF-UI-001.v1,\n  RULES.md, K10 (state.md)]\n```\n');
  t('depends_on multiline', dependsOn(blk).length === 3);
  const miss = danglingCitations(dependsOn(blk), (p) => /RULES\.md$/.test(p));
  t('dangling detected', miss.includes('BRIEF-UI-001.v1') && !miss.includes('RULES.md'));
  t('hype scan', hypeScan('a revolutionary Game-Changing page').length === 2 && hypeScan('a dated record').length === 0);
  const spec = parseCoverage('coverage: labels=home,data; themes=light,dark; viewports=1440,390; files=contact-sheet--light--1440.png');
  const man = { entries: [{ label: 'home', theme: 'light', viewport: '1440' }] };
  const gaps = coverageGaps(spec, man, () => false);
  t('coverage gaps counted', gaps.length === 8 && gaps.includes('contact-sheet--light--1440.png'));
  const st = '# s\n\n## Next (keeper decisions)\n\n1. ~~KP1~~ K12.\n2. Choose from the frontier. [r1]\n3. Old item with no marker.\n\n## Next (loop work)\n\n1. x\n';
  const items = keeperItems(st);
  t('keeper items parsed', items.length === 3 && items[0].struck && items[1].opened === 1);
  const aged = ageingGate(items, 4);
  t('ageing fails at 3 rounds', aged.some((r) => r.status === 'FAIL') && aged.some((r) => r.status === 'WARN'));
  const contract = '## Questions\n\n1. `[HIER]` a?\n8. `(meta)` self-check\n';
  t('jv meta abuse', jvChecks(JSON.stringify({ questions: [{ q: 1, tag: 'HIER', verdict: 'PASS', meta: true }], diagnosis: {}, downstream: {} }), contract).some((p) => /meta invented/.test(p)));
  t('jv numeric score', jvChecks(JSON.stringify({ questions: [], score: 8.7, diagnosis: {}, downstream: {} }), contract).some((p) => /numeric/.test(p)));
  t('jv clean', jvChecks(JSON.stringify({ questions: [{ q: 8, tag: 'HIER', verdict: 'PASS', meta: true }], diagnosis: {}, downstream: {} }), contract).length === 0);
  if (!process.exitCode) console.log('gates.mjs selftest: all pass');
}

function report() {
  const lines = [...out.fail.map((m) => `FAIL  ${m}`), ...out.warn.map((m) => `WARN  ${m}`), ...out.pass.map((m) => `ok    ${m}`)];
  console.log(lines.join('\n'));
  console.log(`\n${out.fail.length} FAIL · ${out.warn.length} WARN · ${out.pass.length} ok`);
  if (out.fail.length) process.exitCode = 1;
}

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
if (args.includes('--selftest')) selftest();
else if (args.includes('--sweep')) { sweep(opt('--round') ? Number(opt('--round')) : null); report(); }
else if (opt('--packet')) { const f = opt('--packet'); const { problems, hype } = packetChecks(readFileSync(f, 'utf8'), existsSync); problems.forEach((p) => FAIL(`${basename(f)}: ${p}`)); if (hype.length) WARN(`${basename(f)}: hype lexicon (${hype.join(', ')})`); if (!problems.length) PASS(`${basename(f)}: packet fields and data sources check`); report(); }
else if (opt('--coverage')) { coverage(resolve(opt('--coverage'))); if (args.includes('--report')) { mkdirSync(ARTIFACTS, { recursive: true }); const gr = { id: `GR-coverage-${basename(opt('--coverage'))}`, at: new Date().toISOString(), pass: !out.fail.length, fail: out.fail, warn: out.warn }; writeFileSync(join(ARTIFACTS, gr.id + '.json'), JSON.stringify(gr, null, 2)); } report(); }
else if (opt('--jv')) { const p = jvChecks(readFileSync(opt('--jv'), 'utf8'), readFileSync(opt('--contract'), 'utf8')); p.forEach((m) => FAIL(`${basename(opt('--jv'))}: ${m}`)); if (!p.length) PASS(`${basename(opt('--jv'))}: verdict well-formed`); report(); }
else if (args.includes('--keeper')) { const items = keeperItems(readFileSync(join(LOOP, 'state.md'), 'utf8')); ageingGate(items || [], Number(opt('--round') || 0)).forEach((r) => out[r.status.toLowerCase()].push(r.msg)); report(); }
else { console.log('usage: see header comment'); }
