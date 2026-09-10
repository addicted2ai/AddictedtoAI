/**
 * figure-provenance.test.mjs — every figure a later decision reads carries its source.
 *
 * PROVENANCE — why this check exists and why it is shaped this way.
 *
 * A figure a later decision reads carries its source. The measured cost of the
 * opposite is a confident computation built on a stale copy: AGENTS.md restated
 * the machinery ceiling as 10% while data/config.json read 30, and the
 * orchestrator computed a correct threefold warm-up widening from the wrong
 * denominator, because loop/lib/budget.mjs reads those bounds by pattern
 * (addictedtoai-mrld, since repaired to key-names-only in AGENTS.md).
 *
 * What counts as a source pointer, and why a bare number is never one: a
 * transclusion ({{fact:<kind>/<slug>#<field>}}), an explicit reference to the
 * canonical file (data/config.json) or the figure's full key path
 * (budget.bounds.machinery_ceiling_pct), or — for constructed counts — a named
 * producer command whose output IS the figure. A bare number beside a vague
 * noun ("the ceiling is 10%") is never a pointer because it resolves to nothing
 * a later reader can check: no file, no command, no transclusion — agreement
 * with it is coincidence and disagreement with it is undetectable. A pointer
 * that resolves to the wrong source is likewise no pointer for a
 * config-resident value: specs/loop still tables the ceiling at 10%, so a
 * citation "from specs/loop" confirms the stale copy instead of checking it.
 *
 * Why the declared set is enumerated by the sweep rather than fixed in advance:
 * the tree's gating figures are found, not assumed. A fixed list would go stale
 * exactly like the restatements it polices — a second source that reads like a
 * measurement. The declaration lives in this test beside the patterns and reads
 * the live config at run time, so a bound edited in data/config.json moves the
 * expectation with it instead of silently disagreeing with it.
 *
 * Why this check cannot false-fire on legitimate prose the way a
 * number-blocklist would: candidacy is a match against a DECLARED figure's
 * patterns — a named figure beside a value — never a bare number. 10, 30, 55
 * and 56 appear all over the tree and mean nothing until a pattern says which
 * figure they restate. Dated past-tense records are exempt by the tense test
 * (they make no claim about a current value, and forcing pointers onto them
 * would get true records deleted to earn a green — Luna's bound, which is why
 * this round exists in narrowed form). Hypotheticals ("at a 10% ceiling")
 * state scenarios, not values. Fixture worlds in test files construct their
 * numbers in-file and are declared where used. The arms below prove each
 * exemption with a fixture that must stay green.
 *
 * Why a sourced re-statement passes rather than being deleted: the operating
 * documents legitimately cite live figures — citing was never the defect. The
 * defect was citing without a pointer a later reader could check. Deleting
 * every citation would trade stale copies for missing context and teach authors
 * to hide figures instead of sourcing them. The passing shape is
 * value-plus-pointer; data/README.md's own "Read the file for the live
 * numbers: as of ..." is the in-tree model of it.
 *
 * SCOPE OF THE LIVE SWEEP (stated, not silent). Swept: top-level operating
 * documents, data/README.md (it documents the canonical file), content/**,
 * code and comments under loop/ pulse/ scripts/ lib/ app/ tools/ loops/, and
 * the dated logs (FULL-MEM-LOG.md, wisdom/timeline-notes/**, wisdom/README.md
 * — swept precisely so the tense test is executed, not described). Not swept:
 * openspec/** (legislation and dated history on a reserved path — the live
 * spec tables 10% while the drain holds config at 30, a law-vs-config
 * divergence owned by the revert bead, not a restatement); wisdom/briefs/**
 * (deliberation work-papers governed by the brief linter, which quote defects
 * in order to describe them); data/** except data/README.md (the canonical
 * source cannot restate itself; the rest is machine state, not prose);
 * *.test.mjs, *.log, and everything under a tests/ directory (constructed
 * fixture worlds and their output — the loop/tests/helpers.mjs fixture config
 * sets window_days beside its own hand-built bounds, declared where used; a
 * later decision reads test outcomes, not fixture literals, as authority;
 * policing them would forbid fixtures from resembling the config they test);
 * this test file itself and RESULT1.md (fixtures and the report quote defects in order
 * to name them; policing them would forbid reporting); dot-directories and
 * build output. Patterns match within one line: a value wrapped to the next
 * line escapes, and that blind spot is recorded here rather than hidden.
 * One dated decision narrative is carried as a documented exact-text
 * exemption (EXEMPTIONS below, live-verified by its own arm): the sweep
 * skips that file+line+figure ONLY while the line's text still equals the
 * recorded exactLineText, so drifted text re-fires — the exemption cannot
 * go stale silently.
 *
 * MUTATIONS (procedure, recorded in RESULT1.md): Mutation A drops one figure's
 * patterns; Mutation B counts any noun phrase as a pointer. Both were
 * one-time author procedures on this file, observed and restored before
 * merge — no arm in this file writes the tracked tree. Copy-based
 * mutation (P0-1 repair) applies to the test files that mutate, not here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SELF_REL = 'scripts/figure-provenance.test.mjs';
const CANONICAL = 'data/config.json';

const LIVE = (() => {
  const cfg = JSON.parse(readFileSync(join(ROOT, CANONICAL), 'utf8'));
  return {
    machinery: String(cfg.budget.bounds.machinery_ceiling_pct),
    newWriting: String(cfg.budget.bounds.new_writing_ceiling_pct),
    upkeep: String(cfg.budget.bounds.upkeep_floor_pct),
    windowDays: String(cfg.budget.window_days),
  };
})();

/* The declared set: gating bounds a later decision reads, with the canonical
 * source and the restatement patterns beside them. Live values are read from
 * data/config.json above, never pinned here. */
const DECLARED = [
  {
    id: 'machinery-ceiling',
    kind: 'gating bound',
    canonical: CANONICAL,
    keyPath: 'budget\\.bounds\\.machinery_ceiling_pct',
    live: () => LIVE.machinery,
    patterns: [
      /machinery[\s\S]{0,30}?ceiling[\s\S]{0,30}?(\d+)\s*%/i,
      /(\d+)\s*%\s+machinery[\s\S]{0,10}?ceiling/i,
    ],
    incident: 'AGENTS.md "machinery ceiling 10%" against live 30 (addictedtoai-mrld)',
  },
  {
    id: 'new-writing-ceiling',
    kind: 'gating bound',
    canonical: CANONICAL,
    keyPath: 'budget\\.bounds\\.new_writing_ceiling_pct',
    live: () => LIVE.newWriting,
    patterns: [/new.?writing[\s\S]{0,30}?ceiling[\s\S]{0,30}?(\d+)\s*%/i],
    incident: 'same paragraph, same repair (addictedtoai-mrld)',
  },
  {
    id: 'upkeep-floor',
    kind: 'gating bound',
    canonical: CANONICAL,
    keyPath: 'budget\\.bounds\\.upkeep_floor_pct',
    live: () => LIVE.upkeep,
    patterns: [/upkeep[\s\S]{0,30}?floor[\s\S]{0,30}?(\d+)\s*%/i],
    incident: 'same paragraph, same repair (addictedtoai-mrld)',
  },
  {
    id: 'budget-window',
    kind: 'gating bound',
    canonical: CANONICAL,
    keyPath: 'budget\\.window_days',
    live: () => LIVE.windowDays,
    patterns: [
      /window_days\D{0,5}(\d+)/,
      // Budget-tied only: a bare "window ... N days" is the anchor/expiry
      // shape (lib/anchors.mjs, lib/schema.mjs hold a 7-day anchor window)
      // until the sentence says budget — the same name-the-figure principle
      // as the bounds. Measured false positive, kept as the control.
      /budget[\s\S]{0,40}?window[\s\S]{0,20}?(\d+)\s*-?days?/i,
      /(\d+)\s*-day\s+budget/i,
    ],
    incident: 'no wild incident — bound with the same restatement surface; the live sweep found it restated',
  },
];

/* Constructed-and-declared fixture figures. Each models one wild prose
 * incident (named in `wild`); no runnable wild fixture exists for any of them
 * — the wild halves are prose history whose bytes are gone — so the arms use
 * these declared stand-ins. Never swept (live:false). */
const MODELED = [
  {
    id: 'modeled-test-count',
    live: () => '55',
    patterns: [/counts?\b[\s\S]{0,20}?(\d+)\s+tests?/i],
    wild: 'F round-2 report said 56 tests; actual 55 (20+16+15+4), caught by a sealed reviewer',
  },
  {
    id: 'modeled-token-total',
    live: () => '182,873,547',
    liveForms: ['182,873,547', '182873547'],
    patterns: [/([\d.,]+M?)\s+tokens?/i],
    requiresRounding: /round/i,
    wild: '182.4M read while three counters incremented, corrected to 182,873,547',
  },
  {
    id: 'modeled-trim-removals',
    live: () => '219',
    patterns: [/\bremov(?:e|es|ed|ing)\b[\s\S]{0,60}?(\d+)\s+entries/i],
    requiresDisclosure: /tilde|miss/i,
    wild: '205 vs 219 removed, 14 tilde entries missed by the repair regex',
  },
  {
    id: 'modeled-push-label',
    live: () => null,
    patterns: [/(\d+)\s+commits?\s+behind/i],
    requiresReadTime: /\b(read|as of)\b/i,
    wild: 'push message "as of 10:31" for a reading taken at 10:28:37, making the site look staler',
  },
];

/* Tense test (Luna's bound): dated past-tense records make no claim about a
 * current value and are never candidates. Past markers are the unambiguous
 * narrative ones — present-passive rule language ("are computed", "is
 * measured", "is refused") deliberately does NOT exempt, or every rule
 * restating a value would pass by its own grammar. */
const DATE_RE = /\b(19|20)\d\d-[01]\d-[0-3]\d\b|\b[012]?\d:[0-5]\d:[0-5]\d(Z)?\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}\b/;
const PAST_RE = /\b(was|were|been|had|said|reported|removed|landed|merged|pushed|built|ran|raised|moved|committed|wrote|written|gave|taken|caught|stood|corrected|repaired|retracted|asserted|observed|used to)\b/i;
/* A hypothetical announces itself as not-the-value. */
const HYPOTHETICAL_RE = /\bat\s+an?\b|\bif\b|\be\.g\.\b|\bfor example\b|\bsuppose\b|\bscenario\b|\bwhether\b/i;
const TRANSCLUSION_RE = /\{\{fact:[^}]+\}\}/;

function tenseExempt(windowText) {
  return DATE_RE.test(windowText) || PAST_RE.test(windowText);
}

/* A pointer must resolve to the live value: the canonical file, the figure's
 * full key path, or a transclusion. Exported (as `pointerFor`) so Mutation B
 * has one named place to neuter. */
export function pointerFor(figure, windowText) {
  const re = new RegExp(`${TRANSCLUSION_RE.source}|data\\/config\\.json|${figure.keyPath}`);
  return re.test(windowText);
}

/* Loose pointer used only by constructed fixtures: any backticked span (a
 * named command or path — the producer form the arms demonstrate). */
function modeledPointer(windowText) {
  return TRANSCLUSION_RE.test(windowText) || /`[^`]+`/.test(windowText);
}

/* Key-path spans never supply captured values: a backticked span holding an
 * identifier-dot-identifier shape (budget.bounds.upkeep_floor_pct,
 * budget.window_days, data/config.json) is a pointer, not prose, so the
 * prose patterns match against the line with those spans blanked while
 * pointers themselves are still read from the unmasked window; prose numbers
 * outside backticks are still captured. Residual: a restatement written
 * ENTIRELY in backticks with no prose number escapes capture (accepted
 * because pointers themselves are backticked and the value rule needs a
 * prose number; the reviewer judges). */
const KEYPATH_SPAN_RE = /`[^`]*[A-Za-z0-9_]+\.[A-Za-z0-9_]+[^`]*`/g;
const BACKTICK_SPAN_RE = /`[^`]*`/g;

function backtickedRanges(s) {
  const ranges = [];
  BACKTICK_SPAN_RE.lastIndex = 0;
  let m;
  while ((m = BACKTICK_SPAN_RE.exec(s)) !== null) ranges.push([m.index, m.index + m[0].length]);
  return ranges;
}

function capturesOf(figure, line) {
  const masked = line.replace(KEYPATH_SPAN_RE, (m) => ' '.repeat(m.length));
  const ranges = backtickedRanges(masked);
  const insideBackticks = (pos) => ranges.some(([a, b]) => pos >= a && pos < b);
  const out = [];
  for (const re of figure.patterns) {
    const once = masked.match(re);
    // First group only: non-value groups (e.g. a noun alternation) must never
    // read as captured values.
    if (once && once[1] !== undefined) {
      const start = once.index + once[0].lastIndexOf(once[1]);
      if (insideBackticks(start)) continue;
      out.push(once[1]);
    }
  }
  return out;
}

/**
 * refused(text, figure, windowText): the refusal. False means the text may
 * stand: not a restatement, exempt, or sourced-and-live. True means a later
 * decision must not read the figure from here.
 */
export function refused(text, figure, windowText = text, pointerFn = pointerFor) {
  const captures = capturesOf(figure, text);
  if (captures.length === 0) return false;
  if (tenseExempt(windowText)) return false;
  if (HYPOTHETICAL_RE.test(text)) return false;
  const live = figure.live();
  if (live !== null) {
    const liveForms = figure.liveForms ?? [live];
    if (!captures.every((c) => liveForms.includes(c))) return true;
  }
  if (figure.requiresRounding && !figure.requiresRounding.test(text)) return true;
  if (figure.requiresDisclosure && !figure.requiresDisclosure.test(text)) return true;
  if (figure.requiresReadTime && !figure.requiresReadTime.test(text)) return true;
  const hasPointer = figure.keyPath ? pointerFn(figure, windowText) : modeledPointer(windowText);
  if (!hasPointer) return true;
  return false;
}

const byId = (id) => DECLARED.find((f) => f.id === id) ?? MODELED.find((f) => f.id === id);
const STALE_BOUND = LIVE.machinery === '30' ? '10' : '30';

/* ---- arms 1–5: the five wild-modeled controls, both directions ---- */

test('restated bound: stale value without pointer is refused (10-vs-30 shape)', () => {
  const text = `The machinery ceiling is ${STALE_BOUND}%.`;
  assert.equal(refused(text, byId('machinery-ceiling')), true, 'unsourced stale copy must fail');
});

test('restated bound: live value with pointer passes', () => {
  const text = `The machinery ceiling is ${LIVE.machinery}% (${CANONICAL}).`;
  assert.equal(refused(text, byId('machinery-ceiling')), false, 'sourced live citation must pass');
});

test('restated bound: live value without pointer is still refused', () => {
  const text = `The machinery ceiling is ${LIVE.machinery}%.`;
  assert.equal(refused(text, byId('machinery-ceiling')), true, 'correctness is not sourcing');
});

test('count over a moving population: without producer refused (56-vs-55 shape)', () => {
  const text = 'The suite counts 55 tests.';
  assert.equal(refused(text, byId('modeled-test-count')), true, 'count with no producer must fail');
});

test('count over a moving population: with producer passes', () => {
  const text = 'The suite counts 55 tests — producer `node scripts/count-tests.mjs`.';
  assert.equal(refused(text, byId('modeled-test-count')), false, 'count carrying its producer must pass');
});

test('total read mid-change: rounded total stated exact without source refused (182.4M shape)', () => {
  const text = 'The run uses exactly 182.4M tokens.';
  assert.equal(refused(text, byId('modeled-token-total')), true, 'exact rounded total with no source must fail');
});

test('total read mid-change: with producer and rounding passes', () => {
  const text = 'The run totals 182,873,547 tokens — producer `node scripts/sum-tokens.mjs` over the session rollout files (182.4M rounded).';
  assert.equal(refused(text, byId('modeled-token-total')), false, 'producer plus stated rounding must pass');
});

test('removal count with a blind spot: undisclosed miss refused (205-vs-219 shape)', () => {
  const text = 'The repair pass removes 219 entries — producer `node scripts/trim-log.mjs` output.';
  assert.equal(refused(text, byId('modeled-trim-removals')), true, 'method with an undisclosed blind spot must fail');
});

test('removal count with a blind spot: disclosed miss with producer passes', () => {
  const text = 'The repair pass removes 219 entries — producer `node scripts/trim-log.mjs` drop-list output, including 14 tilde entries the first pass misses.';
  assert.equal(refused(text, byId('modeled-trim-removals')), false, 'disclosed miss with producer must pass');
});

test('sourceless label: state with no read refused (invented-push-label shape)', () => {
  const text = 'The site is 12 commits behind origin.';
  assert.equal(refused(text, byId('modeled-push-label')), true, 'label with no read behind it must fail');
});

test('sourceless label: with read time and source passes', () => {
  const text = 'The site is 2 commits behind origin (read 10:28 local via `git rev-parse origin/main`).';
  assert.equal(refused(text, byId('modeled-push-label')), false, 'label carrying read time and source must pass');
});

/* ---- arm 6: the stamped-record escape (Luna's bound, pinned) ---- */

test('stamped-record escape: dated past-tense records never fail, whatever patterns exist', () => {
  assert.equal(
    refused('On 2026-09-08 the trim removed 219 entries.', byId('modeled-trim-removals')),
    false,
    'dated past-tense count record must never fail',
  );
  assert.equal(
    refused('On 2026-09-09 the page said the machinery ceiling was 10%.', byId('machinery-ceiling')),
    false,
    'dated past-tense bound record must never fail even with a stale value and no pointer',
  );
});

/* ---- anti-blocklist: bare numbers are never candidates ---- */

test('bare numbers never match: 10, 30, 55 and 56 mean nothing until a pattern names the figure', () => {
  const text = 'Timers show 10, 30, 55 and 56 on the bench.';
  for (const figure of [...DECLARED, ...MODELED]) {
    assert.equal(refused(text, figure), false, `${figure.id}: bare numbers must never fail`);
  }
});

/* ---- arm 9: liveness — the sweep runs and its result is asserted ---- */

/* DOCUMENTED EXEMPTIONS (S5 disposition). Each entry names one live match the
 * sweep would otherwise report, with the exact line text at exemption time
 * and the reason it must not be rewritten. The sweep skips a match ONLY
 * while the matched line's text still equals exactLineText: edited text
 * re-fires the finding, so a stale exemption fails loudly instead of
 * silently blessing a changed passage (the same staleness discipline as
 * scripts/no-change-dir-refs.test.mjs's allow-list liveness arm). The
 * exemption is per-line: the identical line under altered surrounding text
 * stays exempt, while line-number shift and line-text drift re-fire. */
const EXEMPTIONS = [
  {
    file: 'FULL-MEM-LOG.md',
    line: 3440,
    figure: 'new-writing-ceiling',
    exactLineText: 'stays 40% and the new-writing ceiling stays 45%; because the bounds share one',
    reason:
      'dated decision narrative under the dated section two-desks-work-orders-and-trains-2026-09-08 ' +
      '(the bd84b4b drain record): both values checkable via the bead refs and the in-situ arithmetic ' +
      'in the passage (40 + 30 leaves at most 30 for new writing); rewriting the passage to satisfy ' +
      "the pattern would edit a historical record to earn a green — refused per Luna's bound",
  },
];

function exempted(rel, lineNo, figureId, lineText) {
  return EXEMPTIONS.some(
    (e) => e.file === rel && e.line === lineNo && e.figure === figureId && e.exactLineText === lineText,
  );
}

// Transient mutant-copy marker (P0-1 repair). Exported so the exclusion
// below carries an arm; the call site itself is one line the reviewer reads.
export function isMutantCopy(basename) {
  return String(basename ?? '').includes('.mut-');
}

const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'out', 'fixtures-out', '.beads', '.agents', '.claude', '.opencode', '.job']);
const SKIP_BASENAMES = new Set(['package-lock.json', 'RESULT1.md', 'figure-provenance.test.mjs']);
const SWEPT_EXTS = new Set(['.md', '.mdx', '.mjs', '.js', '.ts', '.tsx', '.json']);
// Transient mutant copies (P0-1 repair: tests observe mutants through
// same-directory `*.mut-*.mjs` copies, never the tracked file) are never
// sweep candidates: they are deleted after each block and carry no live
// claim. A real restatement hiding behind a `.mut-` name would escape —
// that dodge is visible by name, unlike a missed figure.

function sweepFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      sweepFiles(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      const rel = relative(ROOT, join(dir, entry.name)).replace(/\\/g, '/');
      if (rel.startsWith('openspec/')) continue;
      if (rel.startsWith('wisdom/briefs/')) continue;
      if (rel.startsWith('data/') && rel !== 'data/README.md') continue;
      if (rel.split('/').includes('tests')) continue;
      if (isMutantCopy(entry.name)) continue;
      if (SKIP_BASENAMES.has(entry.name)) continue;
      if (![...SWEPT_EXTS].some((ext) => entry.name.endsWith(ext))) continue;
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

export function sweepLiveRestatements() {
  const violations = [];
  for (const abs of sweepFiles(ROOT).sort()) {
    const rel = relative(ROOT, abs).replace(/\\/g, '/');
    const lines = readFileSync(abs, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const figure of DECLARED) {
        const captures = capturesOf(figure, line);
        if (captures.length === 0) continue;
        // Documented exact-text exemption (S5): skips ONLY while the line
        // still reads exactly as recorded — drifted text falls through and
        // re-fires below.
        if (exempted(rel, index + 1, figure.id, line)) continue;
        // One line each side: a wider window once laundered data/README.md:43
        // through a neighbouring sentence's "was". Exemptions that need more
        // than a line of context are stating too much.
        const windowText = lines.slice(Math.max(0, index - 1), index + 2).join('\n');
        if (refused(line, figure, windowText)) {
          const liveForms = [figure.live()];
          violations.push({
            file: rel,
            line: index + 1,
            figure: figure.id,
            captured: captures.join(','),
            live: liveForms.join(','),
            reason: captures.every((c) => liveForms.includes(c))
              ? 'unsourced restatement of the live value (no pointer to the canonical file)'
              : `stale value against ${figure.canonical} (live ${liveForms.join(',')})`,
          });
        }
      }
    });
  }
  return violations;
}

test('live sweep: every declared figure is sourced where the tree restates it', () => {
  const violations = sweepLiveRestatements();
  assert.deepEqual(violations, [], 'live unsourced restatements — file, line and reason above — are scope decisions, reported not edited here');
});

test('mutant-copy marker: .mut- names are never sweep candidates', () => {
  assert.equal(isMutantCopy('brief.mut-12345-1.mjs'), true);
  assert.equal(isMutantCopy('lint-deferrals.mut-12345-2.mjs'), true);
  assert.equal(isMutantCopy('brief.mjs'), false);
  assert.equal(isMutantCopy('mutants.md'), false);
});

test('exemption is exact-text and live: restored text exempt, tampered text fires', () => {
  const entry = EXEMPTIONS.find((e) => e.file === 'FULL-MEM-LOG.md' && e.line === 3440);
  assert.ok(entry.reason, 'every exemption carries its reason');
  const figure = byId(entry.figure);
  // Live-verified: the recorded line still matches the figure's patterns, and
  // would still fire on its own text absent the exemption.
  assert.ok(capturesOf(figure, entry.exactLineText).length > 0, 'exemption entry still matches a live pattern');
  assert.equal(refused(entry.exactLineText, figure, entry.exactLineText), true, 'recorded text would fire without the exemption');
  assert.equal(exempted(entry.file, entry.line, entry.figure, entry.exactLineText), true, 'restored text is exempt');
  // Mechanism proof: the same line with a changed value fires despite the entry.
  const tampered = entry.exactLineText.replace('45%', '46%');
  assert.notEqual(tampered, entry.exactLineText);
  assert.equal(exempted(entry.file, entry.line, entry.figure, tampered), false, 'drifted text is not exempt');
  assert.equal(refused(tampered, figure, tampered), true, 'tampered text fires despite the entry');
});
