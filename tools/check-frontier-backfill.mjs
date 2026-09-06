/**
 * check-frontier-backfill.mjs — the direct check behind job j-20260906-17's
 * backfill of `frontier` / `frontier_reason` / `domains` on the blog corpus.
 *
 * It runs the REAL gate rather than describing it: every post file is parsed
 * with `gray-matter` and handed to `postSchema` (`lib/schema.mjs`), whose
 * `superRefine` calls `frontierFlagProblems` (`lib/domains.mjs`) — the same one
 * rule the build and the scout's merge both read. It then prints, per file, the
 * flag as the schema parsed it, so the record in
 * `data/reviews/evidence/verify-frontier-backfill-blog-posts.md` is a
 * transcription of a run and not of an intention.
 *
 * It also answers the two membership questions the decline records rest on,
 * from the tree rather than from memory: which `content/wiki/org/` entries
 * exist (F3's "covered organisation"), and whether the orgs named in the
 * declines have one.
 *
 * Run: node D:/AddictedtoAI/tools/check-frontier-backfill.mjs
 * Exit 1 if any post fails the schema, or if the flagged/declined split does
 * not match the table this job committed.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { postSchema } from '../lib/schema.mjs';
import { DOMAINS, FRONTIER_REASONS } from '../lib/domains.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = path.join(root, 'content/blog');
const orgDir = path.join(root, 'content/wiki/org');

/** The table this job committed. Divergence between it and the parse is a failure. */
const EXPECTED = {
  'anthropic-enterprise-frontier-safeguards.md': { reason: 'F5', domains: [] },
  'anthropic-usage-policy-government-exceptions.md': null,
  'claude-session-theft-infostealers.md': null,
  'doj-statement-of-interest-llm-training-fair-use.md': null,
  'eu-ai-office-first-enforcement-rfis.md': null,
  'gitspawn-git-config-code-execution-coding-agents.md': null,
  'glm-5-3-license-revenue-gate.md': { reason: 'F5', domains: [] },
  'ifm-k2-horizon-open-fleet.md': null,
  'minimax-h3-licence-excluded-territories.md': { reason: 'F5', domains: ['video'] },
  'nemotron-ultra-cc-ioi-2026.md': { reason: 'F1', domains: ['coding'] },
  'nobody-had-to-report-the-wiki-incident.md': null,
  'openai-astra-critical-designation.md': { reason: 'F4', domains: [] },
  'openai-daybreak-frontline-defenders.md': null,
  'openai-gpt-6-astra-system-card.md': { reason: 'F3', domains: [] },
  'thomson-reuters-thomson-model.md': null,
  'three-accounts-hugging-face-intrusion.md': null,
};

let failures = 0;
const fail = (m) => {
  failures += 1;
  console.log(`FAIL  ${m}`);
};

console.log('# The vocabulary, read from lib/domains.mjs (not restated)');
console.log(`DOMAINS           = ${DOMAINS.join(', ')}`);
console.log(`FRONTIER_REASONS  = ${FRONTIER_REASONS.join(', ')}`);
console.log('');

const files = readdirSync(blogDir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();
console.log(`# ${files.length} post files under content/blog/ (README.md excluded)`);
console.log('');
console.log('| file | frontier | frontier_reason | domains (as parsed) | schema |');
console.log('|---|---|---|---|---|');

let flagged = 0;
for (const f of files) {
  const fm = matter(readFileSync(path.join(blogDir, f), 'utf8')).data;
  const parsed = postSchema.safeParse(fm);
  const ok = parsed.success
    ? 'ok'
    : parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ');
  const v = parsed.success ? parsed.data : fm;
  const reason = v.frontier_reason ?? '';
  const domains = Array.isArray(v.domains) ? v.domains : [];
  console.log(
    `| ${f} | ${v.frontier === true} | ${reason || '—'} | ${domains.length ? domains.join(', ') : '(absent = general)'} | ${ok} |`,
  );
  if (!parsed.success) fail(`${f} does not satisfy postSchema`);

  const want = EXPECTED[f];
  if (want === undefined) fail(`${f} is not in this job's decision table`);
  else if (want === null) {
    if (v.frontier === true) fail(`${f} is declared a decline but parses flagged`);
    if (reason) fail(`${f} is a decline but carries frontier_reason ${reason}`);
    if (domains.length) fail(`${f} is a decline but carries domains ${domains.join(', ')}`);
  } else {
    flagged += 1;
    if (v.frontier !== true) fail(`${f} should be flagged and is not`);
    if (reason !== want.reason) fail(`${f} cites ${reason || '(none)'}, table says ${want.reason}`);
    if (domains.join(',') !== want.domains.join(',')) {
      fail(`${f} domains ${domains.join(',') || '(none)'} != table ${want.domains.join(',') || '(none)'}`);
    }
  }
}

const declines = files.length - flagged;
console.log('');
console.log(`# split: ${flagged} flagged, ${declines} declined, ${files.length} total`);

// F3's first branch and the decline records rest on which organisations the
// site COVERS (K21). Read the directory rather than remember it.
const orgs = readdirSync(orgDir)
  .filter((f) => f.endsWith('.md') && f !== 'README.md')
  .map((f) => f.replace(/\.md$/, ''))
  .sort();
console.log('');
console.log(`# content/wiki/org/ — ${orgs.length} entries`);
console.log(orgs.join(', '));

const asked = {
  'openai (F3, F4 flags)': 'openai',
  'anthropic (F5 flag)': 'anthropic',
  'z-ai (F5 flag)': 'z-ai',
  'minimax (F5 flag)': 'minimax',
  'nvidia (F1 flag)': 'nvidia',
  'IFM / MBZUAI (decline)': 'ifm',
  'MBZUAI (decline, alternate slug)': 'mbzuai',
  'Thomson Reuters (decline)': 'thomson-reuters',
};
console.log('');
console.log('| organisation | has content/wiki/org/ entry |');
console.log('|---|---|');
for (const [label, slug] of Object.entries(asked)) {
  console.log(`| ${label} | ${orgs.includes(slug) ? 'yes' : 'NO'} |`);
}

console.log('');
if (failures) {
  console.log(`RESULT: ${failures} failure(s).`);
  process.exit(1);
}
console.log('RESULT: every post satisfies postSchema and matches the committed decision table.');
