// Brief linter — run before EVERY dispatch. A brief that fails does not go out.
//
//   node arch-brief-lint.mjs <brief.md> <authority-sha> [--revision] [--review] [--packet]
//
// --packet lints a SEALED REVIEW PACKET (architect header + the author's
// verbatim report + the verbatim diff) rather than a brief. See the PACKET MODE
// note below the setup for why the brief checks cannot be applied to one.
//
// Checks (each prints PASS/WARN/FAIL with the evidence; exit 1 on any FAIL):
//  1. AUTHORITY: `authority: two-desks-work-orders-and-trains@<sha>`, reachable,
//     equal to the argument.
//  2. QUOTES: every `>` block (joined, whitespace-normalised) is a substring of
//     tasks.md at the authority sha — a paraphrase is where a clause leaves.
//  3. INSTRUMENTS: every line containing "enforced by" or "enforces" names a
//     path that exists in the tree, or contains "find" (delegating the search to
//     the reader). Zero such lines is a WARN, and with --review a FAIL: a review
//     brief must name at least one property and delegate its enforcement.
//     LIMIT, stated so nobody trusts this for more than it does: the linter sees
//     one line at a time, so "both are enforced by `portability.test.mjs`" —
//     one instrument for two properties, the defect that sat in seven briefs —
//     PASSES here. Property-to-instrument completeness is the reviewer's
//     "find and run it" duty and the full suite's backstop, not this check.
//  4. FILES: a "## Files" section or a "Work only in:" block exists; every
//     bullet in it is `- <path> — <reason>` (a brief that scopes a diff owes the
//     reason a file is in it) and each path exists or is marked (new).
//  4b. SCOPE IS TWO-DIRECTIONAL (added 2026-09-09): no sentence carrying an
//     edit verb names a slash-bearing path outside the Files list. Prohibitions
//     ("do not edit X", "read-only") are exempt — that is the brief working.
//     ADDED BECAUSE THE AUDIT OF THIS FILE NAMED IT THE MOST VALUABLE ABSENT
//     CHECK: check 4 is one-directional, so "a brief can pass FILES while
//     directing edits anywhere", including the paths reserved to the
//     orchestrator (`runners.yml`, `data/`). Tested against a fixture that
//     directs edits at both; it fires on both and spares the prohibition line.
//  5. ONCE: any line with the word "once" also says "iteration" or "attempt".
//  6. CD: the token `cd` appears nowhere except inside a prohibition line
//     (one containing "never" or "token"), which is how the ground rules name it.
//     CASE-INSENSITIVE since 2026-09-09 — the audit found it "half
//     case-sensitive", so a brief spelling it `CD` passed the guard.
//  7. REVISION (--revision): a CLASS statement and the word "sweep".
//  8. RESULT NAME: a numbered `RESULT<n>.md` is named, never bare RESULT.md.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const [briefPath, authority] = args.filter((a) => !a.startsWith('--'));
if (!briefPath || !authority) {
  console.log('usage: node arch-brief-lint.mjs <brief.md> <authority-sha> [--revision] [--review]');
  process.exit(2);
}
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brief = readFileSync(briefPath, 'utf8');
const _changeName = (brief.match(/authority:\s*([A-Za-z0-9_.\-]+)@([0-9a-f]{7,40})/) || [])[1];
const TASKS = _changeName ? `openspec/changes/${_changeName}/tasks.md` : 'openspec/changes/<unknown-change>/tasks.md';
const lines = brief.split(/\r?\n/);
const norm = (s) => s.replace(/\s+/g, ' ').trim();
let fails = 0;
const report = (state, name, detail) => {
  console.log(`${state}  ${name}${detail ? ' — ' + detail : ''}`);
  if (state === 'FAIL') fails += 1;
};
const pf = (ok) => (ok ? 'PASS' : 'FAIL');

// PACKET MODE (--packet). ADDED 2026-09-09 after this linter REFUSED a sealed
// review packet with five FAILs, and every one of them was structural rather
// than about the packet's content.
//
// A sealed packet is three parts: the architect's header, the author's report
// VERBATIM, and the diff VERBATIM. Only the header is prose written to direct
// anyone; the other two are EVIDENCE being shown to a reviewer. Running the
// brief checks across the whole document flagged the AUTHOR's own compliance
// line ("Command (exactly as prescribed, no `cd`)") and the SPEC TEXT's
// `RESULT.md` (the Desk's job protocol, quoted inside a requirement), and
// demanded a Files closure from a document that directs no edits at all.
//
// THIS IS THE SESSION'S OWN DEFECT CLASS AIMED AT THIS FILE. A packet that
// embeds a diff fails checks 4, 6 and 8 IDENTICALLY whether it is excellent or
// worthless, so the check's false answer and its true answer are the same
// observation. Sampling harder cannot fix that; only changing what is observed.
//
// So, three changes and no fourth: the prose checks read the HEADER ONLY; the
// work-directing checks are SKIPPED OUT LOUD, never silently, because a skipped
// check that prints nothing is the guardrail-that-reads-as-present defect this
// whole day was spent cataloguing; and one packet-specific check is added that
// CAN fail in the bad direction — the packet must actually carry both embedded
// sections and a substantive diff, since a reviewer handed a claim with no
// artifact reviews the claim rather than the work.
const isPacket = flags.has('--packet');
const REPORT_MARK = /^##\s+THE AUTHOR'S REPORT\s*$/i;
const DIFF_MARK = /^##\s+THE FULL DIFF FROM THE BASE\s*$/i;
const skip = (name, why) => console.log(`SKIP  ${name} — ${why}`);

const reportIdx = lines.findIndex((l) => REPORT_MARK.test(l));
const diffIdx = lines.findIndex((l) => DIFF_MARK.test(l));
// The header is everything before the author's report. If the marker is absent
// the packet is malformed, and the structural check below says so — but prose
// checks then fall back to the whole document rather than silently checking
// nothing, which would be the same defect again in the opposite direction.
const proseLines = isPacket && reportIdx > 0 ? lines.slice(0, reportIdx) : lines;

// The same prose as SENTENCES, with the hard wrapping normalised away. Every
// check that asks "does this claim also say X?" runs on these rather than on
// physical lines, because where a line ends is a wrapping decision and nothing
// else — a claim and its qualifier land on the same line or different ones for
// no reason the author intended. Fixed 2026-09-09 after checks 3 and 5 both
// refused C1's brief on wrapping: check 3 lost a delegation to a line break,
// and check 5 read "Do\n  not edit" as prose that was not a prohibition,
// because `\bdo not\b` does not match "do   not".
const prose = proseLines.join('\n').replace(/\s+/g, ' ').split(/(?<=[.;])\s+/);

// 0. PACKET STRUCTURE — the one packet check that CAN fail in the bad
//    direction, which is the entire justification for this mode existing.
//    A packet missing its diff still reads like a packet: it has a header, it
//    has the author's confident report, it is thousands of words long. What it
//    no longer has is the artifact, and a reviewer given a claim without the
//    artifact reviews the claim. That is the failure worth catching here, and
//    the only one this document class can commit structurally.
if (isPacket) {
  const changed = diffIdx > 0
    ? lines.slice(diffIdx + 1).filter((l) => /^[+-][^+-]/.test(l)).length
    : 0;
  report(pf(reportIdx > 0 && diffIdx > reportIdx && changed >= 5),
    'packet carries the author report AND a substantive diff, in that order',
    `report@${reportIdx >= 0 ? reportIdx + 1 : 'MISSING'} diff@${diffIdx >= 0 ? diffIdx + 1 : 'MISSING'} changed-lines=${changed}`);
  report(pf(proseLines.length >= 20),
    'packet header is substantive (the architect states what was independently verified)',
    `${proseLines.length} header lines`);
}

// 1. authority
const auth = brief.match(/authority:\s*([A-Za-z0-9_.\-]+)@([0-9a-f]{7,40})/);
let reachable = false;
if (auth) {
  try { execFileSync('git', ['-C', REPO, 'cat-file', '-e', `${auth[2]}^{commit}`]); reachable = true; } catch { reachable = false; }
}
const sameSha = !!auth && (auth[2].startsWith(authority.slice(0, 7)) || authority.startsWith(auth[2].slice(0, 7)));
report(pf(!!auth && reachable && sameSha), 'authority line present, reachable, equals argument', auth ? `${auth[2]} vs ${authority}` : 'no authority line');

// 2. quotes
let blob = '';
let tasksMissing = false;
try { blob = norm(execFileSync('git', ['-C', REPO, 'show', `${authority}:${TASKS}`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })); } catch { blob = ''; tasksMissing = true; }
const quotes = [];
let cur = [];
for (const l of lines) {
  if (/^\s*>/.test(l)) cur.push(l.replace(/^\s*>\s?/, ''));
  else if (cur.length) { quotes.push(norm(cur.join(' '))); cur = []; }
}
if (cur.length) quotes.push(norm(cur.join(' ')));
if (tasksMissing) report('FAIL', `quotes verbatim against ${TASKS}@${authority}`, `task file does not resolve: ${TASKS}@${authority}`);
else if (!quotes.length) report('WARN', 'quotes', 'no > blocks — the brief quotes no frozen standard');
else {
  let bad = 0;
  for (const q of quotes) {
    const core = q.replace(/^(\.\.\.|…)\s*/, '').replace(/\s*(\.\.\.|…)$/, '');
    if (!blob.includes(core)) { bad += 1; console.log(`      NOT VERBATIM: "${core.slice(0, 90)}…"`); }
  }
  report(pf(bad === 0 && blob.length > 0), `quotes verbatim against ${TASKS}@${authority}`, `${quotes.length - bad}/${quotes.length}`);
}

// 3. instruments
//
// SENTENCES, NOT PHYSICAL LINES (fixed 2026-09-09 on C1's brief). The check
// used to filter `lines`, so a claim that wrapped — "…`scripts/` the second.\n
// Find them and run them." — lost its delegation to the line break and failed
// a brief that was doing exactly what the check asks. A brief is hard-wrapped
// prose; a check that reads one physical line at a time is reading an artifact
// of the wrapping, not the sentence. Same defect as check 5's, below.
const instLines = prose.filter((l) => /enforced by|enforces/i.test(l));
let instBad = 0;
for (const l of instLines) {
  const paths = [...l.matchAll(/`([^`]+\.(?:mjs|js|ps1|sh))`/g)].map((m) => m[1]);
  const delegates = /\bfind\b/i.test(l);
  const exist = paths.filter((p) => existsSync(`${REPO}/${p}`) || existsSync(p));
  if (!delegates && exist.length === 0) { instBad += 1; console.log(`      NO INSTRUMENT: ${l.trim().slice(0, 100)}`); }
}
if (isPacket) skip('enforcement claims', 'a packet asserts no enforcement — the reviewer\'s instructions come from the prompt file, not from this document');
else if (instLines.length === 0) report(flags.has('--review') ? 'FAIL' : 'WARN', 'enforcement claims', flags.has('--review') ? 'a review brief must name a property and delegate finding its enforcement' : 'none present (nothing asserted as enforced)');
else report(pf(instBad === 0), 'every enforcement claim names an existing instrument or delegates the finding', `${instLines.length} lines (per-line only; one instrument for two properties passes here — the reviewer finds and runs)`);

// 4. files
let fi = isPacket ? -1 : lines.findIndex((l) => /^##\s+Files/i.test(l));
if (!isPacket && fi < 0) fi = lines.findIndex((l) => /work only in:?\s*$/i.test(l.trim()));
if (isPacket) skip('Files closure + two-directional scope', 'a packet SHOWS a diff rather than scoping one; the closure was enforced on the brief that produced this round, and re-verified against `git status` before sealing');
else if (fi < 0) report('FAIL', 'a "## Files" section or "Work only in:" block is present');
else {
  let n = 0, bad = 0;
  for (let i = fi + 1; i < lines.length && !/^##\s/.test(lines[i]); i += 1) {
    const l = lines[i];
    if (!/^\s*-\s/.test(l)) { if (n > 0 && l.trim() === '') break; continue; }
    n += 1;
    const m = l.match(/^\s*-\s+`?([^`\s—]+)`?\s*(?:—|-)\s+(.+)$/);
    if (!m) { bad += 1; console.log(`      NO REASON: ${l.trim().slice(0, 100)}`); continue; }
    const p = m[1];
    const ok = existsSync(`${REPO}/${p}`) || /\(new\)/i.test(m[2]);
    if (!ok) { bad += 1; console.log(`      PATH MISSING (mark "(new)" if intended): ${p}`); }
  }
  report(pf(n > 0 && bad === 0), 'every permitted file carries "— reason" and exists or is (new)', `${n} files`);

  // 4b. THE FILES SCOPE IS TWO-DIRECTIONAL.
  //
  // ADDED 2026-09-09 after the instrument audit of THIS FILE returned DEFECTIVE
  // and named this the most valuable absent check:
  //
  //   "a brief can pass FILES while directing edits anywhere"
  //
  // The old check was one-directional: it made every bullet in the list carry a
  // reason and exist, and never looked at what the PROSE told the worker to do.
  // So a brief could scope one file and then instruct edits to another —
  // including the paths tasks.md reserves to the orchestrator (`runners.yml`,
  // `data/`, `CLAUDE.md`, `AGENTS.md`) — and every check would report PASS.
  //
  // Here a sentence is an EDIT INSTRUCTION if it carries an edit verb and a
  // slash-bearing path. Prohibitions are exempt, because "do not edit X" is the
  // brief doing its job; so are read-only directions, for the same reason.
  const permitted = new Set();
  for (let i = fi + 1; i < lines.length && !/^##\s/.test(lines[i]); i += 1) {
    const m = lines[i].match(/^\s*-\s+`?([^`\s—]+)`?\s*(?:—|-)\s+/);
    if (m) permitted.add(m[1].replace(/^.*?(openspec\/|loop\/|lib\/|scripts\/|data\/|app\/|pulse\/|tools\/)/, '$1'));
  }
  const EDIT_VERB = /\b(edit|edits|editing|change|changes|modify|rewrite|add to|append to|delete from|write to|replace in|re-?pin)\b/i;
  const PROHIBIT = /\b(do not|don'?t|never|must not|may not|forbidden|out of scope|read-only|READ|reserved|leave|without editing)\b/i;
  const CITE = /`([A-Za-z0-9_.\-]+(?:\/[A-Za-z0-9_.\-]+)+\.[A-Za-z0-9]+)`/g;
  const strayEdits = [];
  for (const s of prose) {
    // The verb test runs on the sentence with its CITED PATHS REMOVED. A path
    // is not a verb: `openspec/changes/two-desks-…/tasks.md` made every
    // sentence citing the change directory read as an edit instruction,
    // because "changes" is in EDIT_VERB and the path carries it. The paths are
    // still matched below — they are removed from the VERB test only.
    const verbText = s.replace(CITE, ' ');
    if (!EDIT_VERB.test(verbText) || PROHIBIT.test(s)) continue;
    for (const c of s.matchAll(CITE)) {
      const p = c[1];
      if (permitted.has(p)) continue;
      if ([...permitted].some((q) => q.endsWith(p) || p.endsWith(q))) continue;
      strayEdits.push(`${p} — "${s.trim().slice(0, 72)}…"`);
    }
  }
  report(pf(strayEdits.length === 0),
    'no instruction directs an edit at a file outside the Files scope',
    strayEdits.length ? strayEdits.slice(0, 3).join(' | ') : `${permitted.size} permitted paths, no stray edit instruction`);
}

// 5. once — on SENTENCES, for the reason given at `prose`. "run twice: once as
//    an\n  iteration before you start" satisfies this rule and failed it,
//    because the wrap fell between "once" and the word that disambiguates it.
const onceBad = prose.filter((l) => /\bonce\b/i.test(l) && !/iteration|attempt/i.test(l));
report(pf(onceBad.length === 0), '"once" always says iteration or attempt', onceBad.length ? onceBad[0].trim().slice(0, 100) : '');

// 6. cd token (prohibition lines exempt)
// CASE-INSENSITIVE since 2026-09-09: the instrument audit of this file found
// the check "half case-sensitive", so a brief spelling the token `CD` passed
// while instructing exactly the thing the guard exists to prevent. The approval
// classifier matches the token; a linter that matches only one casing of it is
// a guardrail that reads as present and does nothing.
const cdBad = proseLines.filter((l) => /(^|[^A-Za-z0-9_-])cd([^A-Za-z0-9_-]|$)/i.test(l) && !/never|token/i.test(l));
report(pf(cdBad.length === 0), 'no `cd` token outside a prohibition line', cdBad.length ? cdBad[0].trim().slice(0, 100) : '');

// 7. revision
if (flags.has('--revision')) {
  const hasClass = /\bclass\b/i.test(brief) || /every [^\n]{0,60} in this file/i.test(brief);
  const hasSweep = /\bsweep/i.test(brief);
  report(pf(hasClass && hasSweep), 'revision brief names a CLASS and requires a SWEEP', `class=${hasClass} sweep=${hasSweep}`);
}

// 8. numbered RESULT — checked on the brief's OWN lines, not on `>` quotes:
//    the quoted standard may name the Desk's RESULT.md (its job protocol), and
//    that is not an instruction to this worker about its report's name.
//    With --review the report is REVIEW<n>.md (numbered, never bare), and a
//    bare RESULT.md is still refused (the reviewer reads a numbered one).
const own = proseLines.filter((l) => !/^\s*>/.test(l)).join('\n');
const bareResult = /\bRESULT\.md\b/.test(own);
const numbered = /\bRESULT\d+\.md\b/.test(own);
if (isPacket) {
  // The packet names no output file — the reviewer's output name is set by the
  // prompt file and the -Out argument. But a BARE `RESULT.md` in the ARCHITECT'S
  // HEADER would still be wrong (it would mean the header talks about the
  // author's report by the wrong name), so that half of the check survives.
  report(pf(!bareResult), 'packet header names no bare RESULT.md', `bare RESULT in header=${bareResult}`);
} else if (flags.has('--review')) {
  const bareReview = /\bREVIEW\.md\b/.test(own);
  // WIDENED 2026-09-09 22:52, and the widening is narrow on purpose. The
  // property is "the round number is IN the name, so two rounds' reviews can
  // never be confused"; the pattern was `REVIEW\d+\.md`, which refuses
  // `REVIEW1-muse.md` — a name that satisfies the property AND additionally
  // names its reviewer, needed the moment one round has two reviewers. A
  // suffix after the digits is now allowed; a name with no digits, and the
  // bare name, still refuse. Negative control run and recorded: with this
  // pattern in place, the same brief saying `REVIEW.md` still FAILS and the
  // same brief with no review name at all still FAILS.
  const numberedReview = /\bREVIEW\d+[\w-]*\.md\b/.test(own);
  report(pf(numberedReview && !bareReview && !bareResult), 'review output is a numbered REVIEW<n>.md, never bare REVIEW.md, and no bare RESULT.md', `review numbered=${numberedReview} bare=${bareReview}; bare RESULT=${bareResult}`);
} else {
  report(pf(numbered && !bareResult), 'report file is a numbered RESULT<n>.md, never bare RESULT.md', `numbered=${numbered} bare=${bareResult}`);
}

// N. EVERY `git show <sha>:<path>` RESOLVES, AND HOLDS WHAT THE SENTENCE SAYS
// IS THERE.
//
// Added 2026-09-09 22:50 because the C1 sealed-review brief pointed its
// reviewer at `specs/loop/spec.md` for a requirement that lives in
// `specs/review/spec.md`. The blob existed, the command ran, and it printed
// seventeen requirements — none of them the one the sentence named. Every
// earlier check passed. The instrument that caught it was a second model
// RUNNING the command; nothing here ran anything.
//
// The general defect: A POINTER IS NOT CHECKED BY THE THING IT POINTS AT
// EXISTING. The loop delta is where this change puts most of its requirements,
// so "the loop delta" was the plausible default, and a plausible default is
// exactly what nothing verifies.
//
// So: for each `git show <sha>:<path>`, the blob must exist at that sha, AND
// every *italicised* or `backticked` phrase of 20+ characters in the six lines
// before it must actually occur in that blob. Twenty characters and a space is
// the filter that keeps this to real titles and quoted names rather than every
// inline code span.
const SHOW = /git\s+-C\s+\S+\s+show\s+([0-9a-f]{7,40}):(\S+)/g;
const shows = [...brief.matchAll(SHOW)];
if (!shows.length) {
  report('WARN', 'every `git show sha:path` resolves and holds what the sentence names', 'the brief points at no blob');
} else {
  const problems = [];
  for (const m of shows) {
    const [full, sha, path] = m;
    let text = '';
    try {
      text = execFileSync('git', ['-C', REPO, 'show', `${sha}:${path}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    } catch {
      problems.push(`${path}@${sha} does not resolve`);
      continue;
    }
    // The six lines before the command line, which is where the sentence that
    // introduces it lives.
    const at = lines.findIndex((l) => l.includes(full));
    const lead = at < 0 ? '' : lines.slice(Math.max(0, at - 6), at).join(' ');
    const phrases = [
      ...lead.matchAll(/\*([^*\n]{20,})\*/g),
      ...lead.matchAll(/`([^`\n]{20,})`/g),
    ].map((p) => norm(p[1])).filter((p) => p.includes(' ') && !p.startsWith('git '));
    for (const p of phrases) {
      if (!norm(text).includes(p)) problems.push(`${path}@${sha} does not contain "${p.slice(0, 60)}"`);
    }
  }
  report(pf(problems.length === 0),
    'every `git show sha:path` resolves and holds what the sentence names',
    problems.length ? problems.join('; ') : `${shows.length} pointer(s) resolved, named phrases found in each`);
}

console.log(fails ? `\nBRIEF REFUSED: ${fails} check(s) failed` : '\nBRIEF OK');
process.exit(fails ? 1 : 0);
