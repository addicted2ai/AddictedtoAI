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
//  3. INSTRUMENTS: every SENTENCE containing "enforced by" or "enforces"
//     names a path that exists in the tree, or contains "find" (delegating the
//     search to the reader, which keeps passing). Headings, block quotes,
//     fenced code and table rows are not claims and never weld to one; list
//     bullets stay claims. A claim carrying distinctive content (a backticked
//     identifier, a double-quoted string, a path) must share at least one of
//     it with EACH existing instrument it names — addressed is not
//     substantiated, and a shared token is evidence somebody opened the file,
//     not proof the property holds there. Zero such sentences is a WARN, and
//     with --review a FAIL: a review brief must name at least one property
//     and delegate its enforcement.
//     LIMIT, stated so nobody trusts this for more than it does: the linter
//     cannot read English, so "both are enforced by `portability.test.mjs`" —
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
//  9. RECONCILE: every imperative in the quoted source (check 2's quotes)
//     is carried in the brief's own prose — quotes and fences excluded,
//     send-to-remote supplement active. WARN when the quotes carry no
//     imperatives; skipped out loud in --packet mode.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { briefCarries, extractImperatives } from '../loop/lib/brief.mjs';

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
// THE CHANGE ROOT IS NAMED HERE; NO CHANGE INSIDE IT IS.
// `scripts/no-change-dir-refs.test.mjs` refuses a source reference to an
// unarchived change directory, because archiving moves it and the reference
// becomes a delayed failure. This file was refusing that guard at the gate on
// 2026-09-10 and the guard was right: the linter had entered `scripts/` and
// brought a change path with it.
//
// The repair names the ROOT and derives everything below it from the brief's
// own authority line, which is where the change identity belongs. The guard's
// own control records that a bare root "designates no change, so archiving
// never moves it".
//
// THE COST, SAID OUT LOUD RATHER THAN LEFT FOR SOMEONE TO FIND: a path built
// this way is invisible to that detector, so a change NAMED as
// `${CHANGE_ROOT}/some-change/` in this file would not be caught. A change
// named the ordinary way still would be.
const CHANGE_ROOT = 'openspec/changes';
const TASKS = _changeName ? `${CHANGE_ROOT}/${_changeName}/tasks.md` : null;
// With no authority line there is no change to resolve, and the message says
// exactly that rather than naming a placeholder path that reads like one.
const TASKS_NAME = TASKS || '(no authority line, so no change to resolve)';
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
// One spelling of the sentence split, shared by `prose` (every check) and
// `ownProse` (check 5's Authority-source hatch below): the split pattern is
// written exactly once, so the Nsplit anchor keeps resolving exactly once.
const toSentences = (ls) => ls.join('\n').replace(/\s+/g, ' ').split(/(?<=[.;])\s+/);
const prose = toSentences(proseLines);

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
if (!TASKS) tasksMissing = true;
else {
  try { blob = norm(execFileSync('git', ['-C', REPO, 'show', `${authority}:${TASKS}`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })); } catch { blob = ''; tasksMissing = true; }
}
const quotes = [];
let cur = [];
for (const l of lines) {
  if (/^\s*>/.test(l)) cur.push(l.replace(/^\s*>\s?/, ''));
  else if (cur.length) { quotes.push(norm(cur.join(' '))); cur = []; }
}
if (cur.length) quotes.push(norm(cur.join(' ')));
if (tasksMissing) report('FAIL', `quotes verbatim against ${TASKS_NAME}@${authority}`, `task file does not resolve: ${TASKS_NAME}@${authority}`);
else if (!quotes.length) report('WARN', 'quotes', 'no > blocks — the brief quotes no frozen standard');
else {
  let bad = 0;
  for (const q of quotes) {
    const core = q.replace(/^(\.\.\.|…)\s*/, '').replace(/\s*(\.\.\.|…)$/, '');
    if (!blob.includes(core)) { bad += 1; console.log(`      NOT VERBATIM: "${core.slice(0, 90)}…"`); }
  }
  report(pf(bad === 0 && blob.length > 0), `quotes verbatim against ${TASKS_NAME}@${authority}`, `${quotes.length - bad}/${quotes.length}`);
}

// 3. instruments — SUBSTANTIATION, not mere address (extended 2026-09-10).
//
// A claim is SUBSTANTIATED when a named, existing instrument can be shown to
// contain something the claim is about. A claim that names an existing
// instrument and nothing else is ADDRESSED, not substantiated.
//
// LIMITS, stated so nobody trusts this for more than it does: a check that
// overstates itself in its own comment is this defect wearing the uniform of
// the fix, and this whole extension exists to prevent that.
// (a) The linter cannot read English, so it cannot know whether an
// instrument implements the property credited to it; the most it establishes
// is that the instrument and the claim share something — a backticked
// identifier, a double-quoted string, or a path — beyond the file name. A
// shared token is evidence somebody opened the file, not proof the property
// holds there. A shared bare directory token (such as `scripts/` credited
// to any file under `scripts/`) satisfies this check and proves almost
// nothing; it passes here and is said to.
// (b) One instrument for two properties still PASSES here: the defect that
// sat in seven briefs, named in the header comment, is still the reviewer's
// "find and run it" duty and the full suite's backstop, not this check.
// (c) Bare English words are never tokens. There is no boundary between
// property language and ordinary prose, so binding on bare words would share
// something with nearly every file and substantiate nearly every claim —
// the check wider than the property, which is the defect.
// (d) The whole instrument file is read, comments and strings included: a
// property may be credited in a test name or a comment, and reading code
// only would miss the bindings authors actually write. The cost is the
// mirror of (a): a mention is not an implementation.
// (e) The token match is verbatim and case-sensitive, like the pointer
// check's: an identifier renamed by case alone does not count as shared.
// Single-quoted spans are never tokens: an apostrophe (`reader's`) is
// indistinguishable from an opening quote without reading English, and
// collecting the text between two apostrophes manufactures tokens from
// ordinary prose. Bare numerals are never tokens, for the same reason a
// bare word is not: a small number occurs incidentally in nearly every
// file. A numeral the author backticks (`3000`) counts like any backticked
// span — the backticks are a deliberateness signal the linter can read
// without English. Backticked spans under 3 characters do not count either:
// a one-letter token shares something with every file worth the name.
//
// DELEGATION KEEPS PASSING. A sentence carrying "find" hands the mapping to
// the reader and says so; refusing it would push briefs toward naming a
// file confidently instead — the exact defect, made worse by the remedy.
//
// A CLAIM CARRYING NO DISTINCTIVE CONTENT passes as ADDRESSED. "The
// property is enforced by `scripts/run-tests.mjs`" carries nothing to look
// for, and there is nothing to refuse it FOR without refusing brevity
// itself. Demanding content would push authors to invent some, which
// manufactures the domain that satisfies the claim; inventing the domain
// proves the domain, not the property. The detail line reports how many
// claims were substantiated and how many merely addressed, so a reader sees
// how much of a PASS was which.
//
// NON-CLAIM TEXT neither welds to a claim nor counts as one. On 2026-09-10
// this check refused a brief whose HEADING carried the trigger word: the
// sentence model had welded the heading to the paragraph beneath it, the
// pair read as one claim, and the delegation sitting in the NEXT sentence
// did not count — the check shaping the artifact (a worse heading, written
// to satisfy it) rather than guarding it. A heading is a label for the
// section that makes claims. Block quotes are the frozen standard, not the
// brief's assertion (check 8 reads the brief's OWN lines for the same
// reason). Fenced code is commands, not assertions. A table row is
// structured data, not a sentence. The authority line is routing metadata,
// fixed by the change it names: the author cannot repair trigger words in
// its fixed part, and the rest welds (the line carries no terminal
// punctuation, so without this it joins whatever claim follows it and its
// words vote on that claim's delegation). List bullets STAY claims: a bullet is
// author prose, and no Files bullet carries trigger words, so keeping them
// binds real directives without moving the scope check. The physical-line
// model is NOT the remedy: it would re-open the wrapped-claim hole the
// sentence model was built to close (a claim on one line, its delegation on
// the next, split by wrapping alone), trading today's false refusal for its
// opposite — a round trip, not a repair.
//
// SENTENCES, NOT PHYSICAL LINES (kept from the 2026-09-09 repair on C1's
// brief, which this extension preserves: paragraph lines still join before
// splitting, so a claim that wraps keeps its delegation). What changes is
// only which lines are allowed into a sentence.
const NONCLAIM_LINE = /^\s*(#{1,6}(\s|$)|>|\||```|authority:\s*\S+@[0-9a-f]{7,40})/;
const claimBody = [];
let inClaimFence = false;
for (const l of proseLines) {
  if (/^\s*```/.test(l)) { inClaimFence = !inClaimFence; continue; }
  if (inClaimFence) continue;
  if (NONCLAIM_LINE.test(l)) continue;
  claimBody.push(l);
}
// Same terminal set the shared sentence model splits on (period and
// semicolon, each closing a sentence only before whitespace, so dotted
// paths and identifiers never split a claim), split rather than matched so
// interior periods survive; the shared split is not restated here.
const claimSents = claimBody.join('\n').replace(/\s+/g, ' ').split(/[.;]\s+/)
  .map((s) => s.trim()).filter((s) => s.length > 0);
const instClaims = claimSents.filter((l) => /enforced by|enforces/i.test(l));
let instBad = 0;
let instSubstantiated = 0;
let instAddressed = 0;
for (const l of instClaims) {
  const paths = [...l.matchAll(/`([^`]+\.(?:mjs|js|ps1|sh))`/g)].map((m) => m[1]);
  const delegates = /\bfind\b/i.test(l);
  const exist = paths.filter((p) => existsSync(`${REPO}/${p}`) || existsSync(p));
  if (!delegates && exist.length === 0) { instBad += 1; console.log(`      NO INSTRUMENT: ${l.trim().slice(0, 100)}`); continue; }
  if (delegates) continue;
  const allTicked = [...l.matchAll(/`([^`\n]+)`/g)].map((m) => m[1].trim());
  const debackticked = l.replace(/`[^`]*`/g, ' ');
  const quoted = [...debackticked.matchAll(/"([^"\n]{3,})"/g)].map((m) => m[1].trim()).filter((t) => t.length >= 3);
  // A sentence-final period after an unbackticked path ("see wisdom/.") is
  // the sentence's, not the path's; without the strip the token carries it
  // and misses the file it names.
  const barePaths = [...debackticked.matchAll(/[A-Za-z0-9_.\-]+(?:\/[A-Za-z0-9_.\-]+)+\/?/g)].map((m) => m[0].replace(/[.;]+$/, ''));
  const tokens = [...new Set([...allTicked.filter((t) => !paths.includes(t) && t.length >= 3), ...quoted, ...barePaths])];
  if (tokens.length === 0) { instAddressed += 1; continue; }
  let claimOk = true;
  for (const p of exist) {
    let text = null;
    try { text = readFileSync(`${REPO}/${p}`, 'utf8'); } catch { text = null; }
    if (text === null) { try { text = readFileSync(p, 'utf8'); } catch { text = null; } }
    if (text === null || !tokens.some((t) => text.includes(t))) {
      claimOk = false;
      console.log(`      UNSUBSTANTIATED: ${p} shares nothing with the claim — ${l.trim().slice(0, 100)}`);
    }
  }
  if (claimOk) instSubstantiated += 1;
  else instBad += 1;
}
if (isPacket) skip('enforcement claims', 'a packet asserts no enforcement — the reviewer\'s instructions come from the prompt file, not from this document');
else if (instClaims.length === 0) report(flags.has('--review') ? 'FAIL' : 'WARN', 'enforcement claims', flags.has('--review') ? 'a review brief must name a property and delegate finding its enforcement' : 'none present (nothing asserted as enforced)');
else report(pf(instBad === 0), 'every enforcement claim names an existing instrument or delegates the finding', `${instClaims.length} claim(s): ${instSubstantiated} substantiated, ${instAddressed} addressed (no distinctive content); per-claim only; one instrument for two properties passes here — the reviewer finds and runs`);

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
    // is not a verb: a cited path under the openspec change tree carries the
    // word "changes" as a directory segment, and "changes" is in EDIT_VERB, so
    // every sentence citing one read as an edit instruction. The paths are
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
//
// HATCH (Stage-1 U1, reason beside it): lines inside a blockquote (`> ...`)
// within the "Authority source" section are task rows quoted VERBATIM — the
// architect forbids rewording the authority, so a "once" there is the ROW's
// word, never the author's. The skip is narrow by construction: quoted lines
// only, inside that one section. A bare "once" in author prose still fires
// (arm below), and so does a bare "once" quoted anywhere else. Skipped lines
// drop out before sentence-splitting; a sentence broken across the drop
// rejoins at the boundary, and a rejoined bare "once" still fires — the skip
// hides nothing the author wrote.
let inAuthority = false;
const ownLines = [];
for (const l of proseLines) {
  const hm = /^##\s+(.*)\s*$/.exec(l);
  if (hm) { inAuthority = /^authority\b/i.test(hm[1].trim()); continue; }
  if (inAuthority && /^\s*>/.test(l)) continue;
  ownLines.push(l);
}
const ownProse = toSentences(ownLines);
const onceBad = ownProse.filter((l) => /\bonce\b/i.test(l) && !/iteration|attempt/i.test(l));
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

// 9. RECONCILE (added 2026-09-10, wisdom 2b re-scope): every imperative in
// the quoted source is carried in the brief's own prose.
//
// WHY HERE AND NOT ONLY AT DISPATCH. The dispatch reconciler runs over
// generated briefs that embed their source verbatim, so every
// imperative's tokens are present by construction and it can only fire
// on a dropped embed. The x2jl failure was a HAND-written brief whose
// operative prose dropped an imperative the quoted issue still
// contained — that shape passes dispatch by construction, so the
// working enforcement lives here, over the quotes check 2 already
// verified verbatim. The body excludes the quotes (reconciling the
// quote against itself would be the same vacuity wearing work clothes)
// and fenced blocks (commands and diffs, not assertions — check 8's
// doctrine for the same exclusion).
//
// THE SEND-TO-REMOTE SUPPLEMENT. COMMAND_VERBS excludes that verb
// because `loop/` code may not quote the token at all; this file is
// outside that guard's scope (`loop/` only), and a dropped remote-write
// instruction is exactly the loss shape, so the classifier is
// supplemented here. The token is assembled at run time — the guard's
// own test's convention — and the supplement is named, never silent.
const SEND_TO_REMOTE = new Set(['pu' + 'sh']);
if (isPacket) {
  skip('reconcile quoted source imperatives with brief prose', 'packets carry no work source');
} else {
  const bodyLines = [];
  let inFence = false;
  for (const l of proseLines) {
    if (/^\s*```/.test(l)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^\s*>/.test(l)) continue;
    bodyLines.push(l);
  }
  const imps = extractImperatives(quotes.join('\n'), SEND_TO_REMOTE);
  if (!imps.length) {
    report('WARN', 'reconcile quoted source imperatives with brief prose', 'no RECOGNIZED imperatives in the quotes — absence unproven, see the classifier limits in loop/lib/brief.mjs (suggestion modals, hedged negations)');
  } else {
    const missing = imps.filter((imp) => !briefCarries(bodyLines.join('\n'), imp));
    report(
      pf(missing.length === 0),
      'reconcile quoted source imperatives with brief prose',
      missing.length ? `dropped: ${missing[0].slice(0, 160)}` : `${imps.length}/${imps.length} carried (send-to-remote supplement active)`,
    );
  }
}

console.log(fails ? `\nBRIEF REFUSED: ${fails} check(s) failed` : '\nBRIEF OK');
process.exit(fails ? 1 : 0);
