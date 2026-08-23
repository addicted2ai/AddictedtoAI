#!/usr/bin/env node
// The site's hand-written claims about its own governance, checked against
// the tree they describe. Run from the repository root:
//
//   node scripts/check-governance-claims.mjs
//
// WHY THIS EXISTS. On 2026-08-23 an audit checked the site's standing
// self-claims against the repository. Six were false. Three of the six had
// become false on 2026-08-22, when CHARTER.md rule 13 withdrew the
// prohibition on the loop merging its own charter changes and the
// `human-owned-paths` CI job was narrowed to stop failing on every
// legitimate charter edit -- both correct changes, neither of which
// touched the four sentences on the site that described the old state. A
// fifth was the project's own origin story, published in three places. A
// sixth was about to become false at the next deploy.
//
// The pattern under all of them: /charter and /log CANNOT drift, because
// they are parsed at build time from CHARTER.md and CHANGELOG.md, so the
// page changes when the source does. Every one of the six lived somewhere
// that is not generated -- homepage prose, a hand-written lead on an
// otherwise-generated page, a metadata constant, post body, a caption
// string in a client component. Nothing connected any of them to the file
// it was describing, so nothing could notice.
//
// WHAT THIS SCRIPT CHECKS. Three independent things.
//
//   1. THE REGISTRY. Each entry below pins one hand-written claim to the
//      exact text that carries it and to a predicate over the tree that
//      must currently hold. Both halves can fail. If the text is gone, the
//      claim was edited without anyone revisiting what it rests on, and
//      that is a failure even if the new wording happens to be true -- the
//      registry has stopped describing the page. If the predicate flips,
//      the source moved underneath the sentence, which is exactly what
//      happened on 2026-08-22.
//
//   2. THE SWEEP. A short list of phrases that have each marked a false
//      self-claim on this site at least once. Every occurrence of one, in
//      any file under app/ or in CHANGELOG.md's preamble, must fall inside
//      a registered claim or inside an explicit allowance with a stated
//      reason. A new page that copies one of these phrases fails the build
//      instead of joining the set quietly -- which is how "A human wrote
//      the first commit" reached three files and "nothing sent anywhere"
//      reached two.
//
//   3. THE ANALYTICS DISCLOSURE. Every event name passed to trackEvent()
//      anywhere under app/ must be named on the disclosure page, and every
//      event name on the disclosure page must exist in the code. Adding a
//      tracked event without disclosing it, or disclosing one that was
//      removed, is a red build.
//
// WHAT THIS SCRIPT DOES NOT CLAIM. Read this before trusting a green run.
//
// ITS REACH IS THE REGISTRY AND THE PHRASE LIST, AND NOTHING WIDER. A
// false claim about this project's governance, phrased in words no
// tripwire matches, on a page with no registry entry, passes this check
// silently. That is most of the false claims it is possible to write. This
// script converts one specific failure -- a claim whose supporting fact
// moved, or a known-bad phrase spreading to a new file -- from invisible
// into a red build. It does not make the site's prose true, and a green
// run here is not evidence that it is.
//
// A predicate is only as good as the thing it reads. `charterHas` matches
// a substring of CHARTER.md after whitespace normalisation; a rewrite that
// preserved the substring while reversing the surrounding sentence would
// pass. `gateGuards` reads one grep line out of a workflow file; it says
// what turns that job red, not whether the job is a required check (a
// repository setting, which rule 13a reserves and which nothing in this
// tree can see).
//
// An `attested` entry is never checked at all. It is recorded, printed as
// ATTESTED rather than ok, and exists so that a claim resting on the
// maintainer's word is visibly a different kind of thing from one a
// command settles -- the distinction FRAME.md draws, applied to the site's
// prose instead of to the frame.

import fs from "fs";
import path from "path";

// An optional root, so scripts/test-governance-claims.mjs can run this same
// script against a sandbox copy of the tree with a defect planted in it.
// A check nobody has watched go red is a check nobody has tested.
const rootArg = process.argv[2];
const root =
  rootArg && !rootArg.startsWith("--") ? path.resolve(rootArg) : process.cwd();
const problems = [];
const fail = (label, message) => problems.push(`${label}: ${message}`);

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
}

// JSX hard-wraps prose across lines and splices `{" "}` between the
// fragments; comments hard-wrap too and prefix every continuation line with
// `//`. Collapse all three away so a needle can be written as the sentence
// a reader sees rather than as whatever shape the formatter left behind.
// Only a `//` that begins a line is stripped, so a URL inside a comment
// survives.
function normalize(text) {
  return text
    .replace(/^[ \t]*\/\/[ \t]?/gm, "")
    .replace(/\{" "\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Predicates. Each returns { ok, detail } or { attested, detail }.
// ---------------------------------------------------------------------------

let charterCache;
function charter() {
  if (charterCache === undefined) charterCache = normalize(read("CHARTER.md"));
  return charterCache;
}

function charterHas(text) {
  return () => ({
    ok: charter().includes(text),
    detail: `CHARTER.md contains ${JSON.stringify(text)}`,
  });
}

function charterLacks(text) {
  return () => ({
    ok: !charter().includes(text),
    detail: `CHARTER.md does not contain ${JSON.stringify(text)}`,
  });
}

// The `human-owned-paths` job's path filter, read the same way the site
// reads it (app/lib/human-owned-paths.js). Duplicated here rather than
// imported because that module is ESM under app/ with Next-specific
// resolution and this script must run standalone; the two are asserted
// against each other by `sameFilterAsSite` below, so a divergence fails.
const WORKFLOW = ".github/workflows/pr-checks.yml";
const FILTER_RE = /\|\s*grep -E '\^\(([^']+)\)'/g;

let gateCache;
function gatePaths() {
  if (gateCache === undefined) {
    const matches = [...read(WORKFLOW).matchAll(FILTER_RE)];
    gateCache =
      matches.length === 1
        ? matches[0][1].split("|").map((p) => p.trim().replace(/\\\./g, "."))
        : null;
  }
  return gateCache;
}

function gateGuardsExactly(expected) {
  return () => {
    const actual = gatePaths();
    if (actual === null) {
      return { ok: false, detail: `${WORKFLOW} has no single readable path filter` };
    }
    const same =
      actual.length === expected.length &&
      expected.every((p, i) => actual[i] === p);
    return {
      ok: same,
      detail: `${WORKFLOW}'s human-owned-paths filter is exactly [${expected.join(", ")}]${
        same ? "" : ` -- found [${actual.join(", ")}]`
      }`,
    };
  };
}

function gateExcludes(names) {
  return () => {
    const actual = gatePaths();
    if (actual === null) {
      return { ok: false, detail: `${WORKFLOW} has no single readable path filter` };
    }
    const guarded = names.filter((n) => actual.some((p) => n.startsWith(p)));
    return {
      ok: guarded.length === 0,
      detail: `the human-owned-paths gate does not guard ${names.join(" or ")}${
        guarded.length ? ` -- it guards ${guarded.join(", ")}` : ""
      }`,
    };
  };
}

// The site's own reader must agree with this script's. Two readers of the
// same file that can disagree is the bug this repository keeps shipping;
// asserted rather than assumed.
function sameFilterAsSite() {
  const siteSource = read("app/lib/human-owned-paths.js");
  const siteRe = siteSource.match(/const FILTER_RE = (\/.*\/g);/);
  return {
    ok: siteRe !== null && siteRe[1] === String(FILTER_RE),
    detail: `app/lib/human-owned-paths.js reads the workflow with the same pattern this script does (${String(
      FILTER_RE
    )})`,
  };
}

function fileLacks(file, text) {
  return () => ({
    ok: !normalize(read(file)).includes(text),
    detail: `${file} does not contain ${JSON.stringify(text)}`,
  });
}

// Deliberately a call-shaped pattern, not the bare identifier: the file
// this is used on explains in a comment why it must never call trackEvent,
// and a predicate that tripped over its own explanation would be a check
// that cannot coexist with the reason it exists.
function fileMakesNoCall(file, fn) {
  return () => ({
    ok: !new RegExp(`${fn}\\s*\\(`).test(read(file)),
    detail: `${file} makes no ${fn}() call`,
  });
}

// The charter's live rule count, derived the way FRAME.md fact 14's first
// method derives it: numbered top-level items between the first rule section
// and the Amendment heading. Never typed.
function charterRuleCount() {
  const raw = read("CHARTER.md");
  const from = raw.indexOf("\n## I. Truth");
  const to = raw.indexOf("\n## Amendment");
  if (from === -1 || to === -1 || to <= from) return null;
  return (raw.slice(from, to).match(/^[0-9]+\. /gm) || []).length;
}

// A typed rule count, pinned to the live charter. Typing the number is not
// the defect -- round 177 first tried to fix this by refusing to state a
// count anywhere, and shipped documents that said "the count is not typed
// here" two lines above a typed count, which its own review caught. An
// unguarded number is the defect. So each document that states one names the
// sentence carrying it here, and that sentence's number must equal the live
// count.
//
// `re` must capture the number from one specific sentence rather than
// scanning the file: every one of these documents also quotes "21 rules" as
// the past error it is correcting, and a whole-file scan would trip over the
// correction instead of the claim.
function statesLiveRuleCount(file, re, where) {
  return () => {
    const n = charterRuleCount();
    if (n === null || n < 1) {
      return { ok: false, detail: "CHARTER.md's rule sections did not parse" };
    }
    const m = read(file).match(re);
    if (!m) {
      return {
        ok: false,
        detail: `${file}: ${where} no longer matches ${re} -- the sentence carrying the rule count was edited, so nothing is pinning the number any more`,
      };
    }
    const same = Number(m[1]) === n;
    return {
      ok: same,
      detail: `${where} states the live CHARTER.md rule count (${n})${
        same ? "" : ` -- it says ${m[1]}`
      }`,
    };
  };
}

function attested(who, when, what) {
  return () => ({
    attested: true,
    detail: `${what} -- ${who}, ${when}. No command run from this repository can check it.`,
  });
}

// ---------------------------------------------------------------------------
// 1. The registry.
// ---------------------------------------------------------------------------
//
// `file` + `needle` locate the claim; `needle` is matched against the
// normalized file, so write it as the sentence reads. `source` is the
// predicate it rests on. `why` is for the next person, not for the check.
//
// An entry with `sourceOnly` is a canary rather than a claim: no site text
// carries it, and it exists so that a change to a load-bearing sentence in
// CHARTER.md is a red build here even before anyone works out which pages
// it falsifies.

const CLAIMS_DECLARED = 24;

const CLAIMS = [
  {
    file: "app/page.js",
    needle:
      "The loop may now amend that charter itself, under a delegation the charter records &mdash; all of it but the one clause fixing the limits of that delegation, which only the maintainer may change.",
    why: "Said 'can propose changes to but may not merge' until 2026-08-23, which CHARTER.md rule 13 withdrew on 2026-08-22 in as many words.",
    source: charterHas(
      "The loop amends this file directly, under the delegation rule 13 records, with one exception: rule 13a may be amended only by the maintainer"
    ),
  },
  {
    sourceOnly: true,
    file: "CHARTER.md rule 13 (canary)",
    why: "No page carries this sentence. It is the load-bearing one: rule 13's prohibition on the loop merging charter changes is 'withdrawn here, not reinterpreted'. If it ever leaves the document, every claim in this registry about the delegation needs re-reading before anyone works out which page went false.",
    source: charterHas("The prohibition is withdrawn here, not reinterpreted"),
  },
  {
    file: "app/page.js",
    needle:
      "A model wrote the first commit &mdash; a Next.js skeleton with four empty pages &mdash; and everything on the site since",
    why: "The homepage's first paragraph. Said 'A human wrote the first commit' until 2026-08-23.",
    source: attested(
      "the maintainer",
      "in conversation, 2026-08-23",
      "The maintainer has written no code on this project at any point, including the initial scaffold"
    ),
  },
  {
    file: "app/lib/posts.js",
    needle:
      "inside a charter that sets the limits of its autonomy — and that it may now amend itself, apart from the clause fixing those limits",
    why: "/blog's metadata.description, its JSON-LD BlogPosting.description and its RSS <description>. Said 'inside a charter it cannot amend' until 2026-08-23 -- the sentence search engines and feed readers were shown.",
    source: charterLacks("The loop may not amend this file"),
  },
  {
    file: "app/lib/posts.js",
    needle:
      "inside rules it may now rewrite itself — apart from the one clause that bounds it",
    why: "The homepage teaser excerpt. Said 'inside rules it can’t change' until 2026-08-23; unrendered at the time because the teaser picks the newest post by date, which is latency, not correctness.",
    source: charterHas(
      "rule 13a may be amended only by the maintainer, by the maintainer's own hand"
    ),
  },
  {
    file: "app/blog/page.js",
    needle:
      "does nothing else but fail, deliberately, on any pull request that touches a path <code>CHARTER.md</code> rule 13a reserves",
    why: "Named 'the charter, the workflow definitions, or the loop’s own prompt' until 2026-08-23, under a heading reading 'What is true now, and only this'. The list is now rendered from the workflow; this pins the sentence around it.",
    source: gateGuardsExactly([
      ".github/",
      "scripts/check-track-scope.mjs",
      "scripts/check-13a-unchanged.mjs",
      "scripts/check-hold-mechanism.mjs",
      "scripts/test-orchestrate-hold.mjs",
    ]),
  },
  {
    file: "app/blog/page.js",
    needle:
      "Two of those three came off the gate on 2026-08-22, when the delegation recorded in <code>CHARTER.md</code> made ordinary edits to the charter and to <code>prompts/</code> legitimate",
    why: "The correction itself. If CHARTER.md or prompts/ ever goes back on the gate, this paragraph is wrong in the other direction.",
    source: gateExcludes(["CHARTER.md", "prompts/"]),
  },
  {
    file: "app/blog/page.js",
    needle: "It is read at build time out of",
    why: "The page's claim that it derives the list rather than typing it. True only while the site's reader and this script read the workflow the same way.",
    source: sameFilterAsSite,
  },
  {
    file: "app/charter/page.js",
    needle:
      "Round 81 (audit) found {word(ROUND_81_FINDINGS)} claims in this document false. {describeCorrections(standingCorrections)}",
    why: "Said 'Two claims ... marks each falsified claim with the correction beside it' from 2026-08-11 to 2026-08-23 while rendering one. The count is now computed from the same booleans that decide whether each aside renders, so the sentence and the page cannot disagree. Pinned so it cannot be turned back into a literal.",
    source: fileLacks("app/charter/page.js", "Two claims in this document"),
  },
  {
    file: "app/model-deprecation-checker/ModelDeprecationChecker.js",
    needle:
      "Nothing you paste is sent anywhere, and this tool reports nothing about it — not even how many matches it found.",
    why: "Said the blanket 'Nothing is sent anywhere' while calling trackEvent twice. The calls are gone; the promise is also narrowed, because the site does send a page view for this page and a blanket promise would still be false.",
    source: fileMakesNoCall(
      "app/model-deprecation-checker/ModelDeprecationChecker.js",
      "trackEvent"
    ),
  },
  {
    file: "app/model-deprecation-checker/page.js",
    needle: "nothing you paste is sent anywhere",
    why: "The same promise on the page around the component. Same fix, same reason.",
    source: fileMakesNoCall(
      "app/model-deprecation-checker/ModelDeprecationChecker.js",
      "trackEvent"
    ),
  },
  {
    file: "app/disclosure/page.js",
    needle: "rule 17 is &ldquo;collect nothing personal",
    why: "The disclosure page quotes rule 17 as the ceiling on what may be collected. If the rule is amended, the quote is stale.",
    source: charterHas(
      "**Collect nothing personal.** No accounts, no personal data, no tracking beyond aggregate analytics."
    ),
  },
  {
    file: "app/blog/page.js",
    needle:
      "The maintainer states he has never written a character of this project, that he is not a programmer",
    why: "The origin story, corrected on 2026-08-23 from 'A human wrote the first commit'. Nothing in git can settle it: every commit here, the first included, is authored under one shared account (FRAME.md fact 1).",
    source: attested(
      "the maintainer",
      "in conversation, 2026-08-23",
      "The maintainer has written no code on this project at any point, including the initial scaffold"
    ),
  },
  {
    file: "app/blog/page.js",
    needle:
      "A model wrote the first commit &mdash; a Next.js skeleton with four empty pages &mdash; and everything on the site since",
    why: "The same correction, in the post's own opening line.",
    source: attested(
      "the maintainer",
      "in conversation, 2026-08-23",
      "The maintainer has written no code on this project at any point, including the initial scaffold"
    ),
  },
  {
    file: "CHANGELOG.md (preamble)",
    needle:
      "A model wrote the first commit — a bare Next.js skeleton with four empty pages — and everything on the site since.",
    why: "The third copy of the origin story, and the one every round reads before doing anything. Not published at /log -- app/lib/build-log.js parses only what follows '## Log' -- but it is the loop's own framing of itself.",
    source: attested(
      "the maintainer",
      "in conversation, 2026-08-23",
      "The maintainer has written no code on this project at any point, including the initial scaffold"
    ),
  },
  {
    file: "AGENTS.md",
    needle:
      "This file and `prompts/` are otherwise the loop's to edit under rule 13, the same as the rest of this repository — `.github/` is not; it is part of what rule 13a reserves.",
    why: "AGENTS.md said 'It cannot be amended from inside a round' until 2026-08-23, four days after rule 13 withdrew that prohibition. It now quotes the charter's own preamble rather than paraphrasing it, and this pins the quote to the sentence it is quoting.",
    source: charterHas(
      "This file and `prompts/` are otherwise the loop's to edit under rule 13, the same as the rest of this repository — `.github/` is not; it is part of what rule 13a reserves."
    ),
  },
  {
    file: "AGENTS.md",
    needle: "The loop's to edit under rule 13, apart from what rule 13a reserves.",
    why: "The project-layout entry for CHARTER.md read 'Human-owned.' until 2026-08-23 -- the same withdrawn claim, in the section a round skims for orientation rather than reads.",
    source: gateExcludes(["CHARTER.md"]),
  },
  {
    file: "prompts/shared/every-run.md",
    needle:
      "rule 13 makes the charter the loop's to edit, apart from what rule 13a reserves",
    why: "Instruction 1, the first thing every round reads, said '21 rules you cannot change' until 2026-08-23. Both halves were false: the count and the prohibition.",
    source: charterHas(
      "The loop owns this charter, the workflow definitions, and its own prompt, on the same terms it owns the rest of this repository — subject to rule 13a."
    ),
  },
  {
    file: "prompts/shared/every-run.md",
    needle:
      "it fails on any pull request touching `.github/`, `scripts/check-track-scope.mjs`, `scripts/check-13a-unchanged.mjs`, `scripts/check-hold-mechanism.mjs` or `scripts/test-orchestrate-hold.mjs`",
    why: "The shipping section named CHARTER.md, .github/, prompts/ and check-track-scope.mjs as the guarded set until 2026-08-23; two of the four were wrong, and it attributed the gate to `ship`, which withholds auto-merge by Origin and never by path. Pinned to the workflow's own filter, like /blog's copy of the same list.",
    source: gateGuardsExactly([
      ".github/",
      "scripts/check-track-scope.mjs",
      "scripts/check-13a-unchanged.mjs",
      "scripts/check-hold-mechanism.mjs",
      "scripts/test-orchestrate-hold.mjs",
    ]),
  },
  {
    file: "prompts/shared/every-run.md",
    needle: "`CHARTER.md` and `prompts/` are not on that list",
    why: "If either goes back on the gate this sentence is wrong in the other direction -- the same pairing /blog carries for the same two paths.",
    source: gateExcludes(["CHARTER.md", "prompts/"]),
  },
  {
    sourceOnly: true,
    file: "FRAME.md fact 14 (canary)",
    why: "No page carries this. Fact 14's heading is where this repository deliberately types the rule count, and every other document points at it. Nothing checked the heading: fact 14's own command compared its two derivations to each other, never to the heading above them, so it printed `verified` on a heading reading '999 rules'. Round 177 made the heading that command's third derivation; this is the second lock, from the other side.",
    source: statesLiveRuleCount(
      "FRAME.md",
      /^## 14\. [^\n]*?\b(\d+) rules\b/m,
      "fact 14's heading"
    ),
  },
  {
    file: "AGENTS.md",
    needle: "That number is typed, but it is not unguarded",
    why: "AGENTS.md states the rule count in prose. It said 21 against a charter with 22 until round 177, then briefly claimed the count was 'not typed here' two lines above typing it. It now says the number is guarded, which is only true while this entry exists.",
    source: statesLiveRuleCount(
      "AGENTS.md",
      /binding: (\d+) rules covering truth/,
      "the 'rules are not advisory' paragraph"
    ),
  },
  {
    file: "prompts/shared/every-run.md",
    needle: "That count is typed but guarded",
    why: "Instruction 1 states the rule count to every round that reads it. Same defect, same correction, same claim to keep honest.",
    source: statesLiveRuleCount(
      "prompts/shared/every-run.md",
      /track charges, and (\d+)\s+rules/,
      "instruction 1"
    ),
  },
  {
    file: "CHANGELOG.md (preamble)",
    needle:
      "The charter is the loop's to amend under the delegation rule 13 records, apart from rule 13a, which only the maintainer may change",
    why: "The preamble said 'the charter it operates inside ... [is] human-set' until 2026-08-23 -- the same defect as the homepage's, in the file the site is built from.",
    source: charterHas(
      "The loop amends this file directly, under the delegation rule 13 records, with one exception: rule 13a may be amended only by the maintainer"
    ),
  },
];

// ---------------------------------------------------------------------------
// 2. The sweep.
// ---------------------------------------------------------------------------

const TRIPWIRES_DECLARED = 11;

const TRIPWIRES = [
  { re: /may not merge/gi, note: "the withdrawn half of rule 13" },
  { re: /cannot merge/gi, note: "a merge prohibition the gate may not enforce" },
  { re: /must merge it by hand/gi, note: "a human step that may not exist" },
  { re: /cannot amend/gi, note: "an amendment prohibition rule 13 withdrew" },
  { re: /can(?:’|')t change/gi, note: "the same, in the teaser's register" },
  { re: /human-owned(?!-paths)/gi, note: "ownership rule 13 moved" },
  { re: /only the maintainer/gi, note: "a reservation narrower than it reads" },
  { re: /human review/gi, note: "twice claimed on /blog and never true" },
  { re: /sent anywhere/gi, note: "a privacy promise analytics can falsify" },
  {
    re: /never been (?:set|configured|measured)/gi,
    note: "an analytics claim that expires at the deploy that configures it",
  },
  { re: /wrote the first commit/gi, note: "the origin story, wrong in three files" },
];

// Hits that are not a governance guarantee: a job name, a quotation of a
// past state the surrounding prose already labels as past, a fact about
// the world rather than about this project. Each needs a reason.
const ALLOWANCES_DECLARED = 18;

const ALLOWANCES = [
  {
    file: "app/blog/page.js",
    needle:
      "The paragraph that used to sit here said pull requests touching the charter, the workflows, or the loop&rsquo;s own prompt required human review. That was false as well.",
    why: "The page narrating its own past false claim, explicitly labelled false.",
  },
  {
    file: "app/blog/page.js",
    needle:
      "Both times the claim was about human review, and both times it survived because nothing tested it.",
    why: "The same narration, one paragraph on.",
  },
  {
    file: "app/blog/page.js",
    needle:
      "So &ldquo;cannot merge on green at all&rdquo; is precise only about the sanctioned path",
    why: "A quoted phrase the sentence immediately qualifies.",
  },
  {
    file: "app/blog/page.js",
    needle:
      "This page said &ldquo;a human wrote the first commit&rdquo; until 2026-08-23",
    why: "The correction naming the claim it corrects, as rule 5 requires.",
  },
  {
    file: "app/blog/page.js",
    needle:
      "Until 2026-08-23 that paragraph named a different set of guarded paths",
    why: "The correction of the gate claim, naming what it corrects.",
  },
  {
    file: "app/charter/page.js",
    needle:
      "const PREAMBLE_CLAIM = \"cannot merge on green and a human must merge it by hand\";",
    why: "The literal string the page matches CHARTER.md against to decide whether to render a correction. It is a needle, not an assertion.",
  },
  {
    file: "app/charter/page.js",
    needle:
      "The preamble above says a pull request touching <code>CHARTER.md</code>, <code>.github/</code> or <code>prompts/</code> &ldquo;cannot merge on green and a human must merge it by hand.&rdquo;",
    why: "The correction aside quoting the claim it corrects. Renders only while that text is still in CHARTER.md.",
  },
  {
    file: "app/charter/page.js",
    needle:
      "this comment previously called the document \"human-owned — rule 13\", which rule 169's rewrite made false",
    why: "A comment recording its own past error.",
  },
  {
    file: "app/lib/page-origins.js",
    needle:
      "Round 170 (build) corrects the lead paragraph's \"human-owned, so only the maintainer can amend it\" claim (false since round 169's rewrite of rule 13/13a)",
    why: "The route map's own history note, recording a correction already made.",
  },
  {
    file: "app/disclosure/page.js",
    needle:
      "claim a level of human review that no round recorded",
    why: "A statement about what the disclosure does NOT claim -- the safe direction.",
  },
  {
    file: "app/disclosure/page.js",
    needle:
      "unless the text &ldquo;has undergone a process of human review and is subject to editorial responsibility&rdquo;",
    why: "A quotation of Article 50(4) of the EU AI Act. A fact about the world, not about this project.",
  },
  {
    file: "app/disclosure/page.js",
    needle:
      "We do not claim that the human-review exemption applies to any page.",
    why: "Again a statement of what is not claimed.",
  },
  {
    file: "app/lib/posts.js",
    needle:
      "\"inside a charter it cannot amend\" until 2026-08-23. CHARTER.md rule 13 withdrew that prohibition on 2026-08-22",
    why: "A comment quoting the string it replaced, so the next reader knows what was there.",
  },
  {
    file: "app/lib/posts.js",
    needle:
      "Anthropic’s own study says human reviewers approve 97% of prompts",
    why: "A blog post's metadata description, about Anthropic's published data. A fact about the world, not about this project.",
  },
  {
    file: "app/demos/RoundWalkthrough.js",
    needle:
      "\"the measurement ID has never been set in production\" until 2026-08-23, when one was",
    why: "A comment quoting the caption it replaced.",
  },
  {
    file: "app/model-deprecation-checker/ModelDeprecationChecker.js",
    needle:
      "this component and its page both promise \"nothing sent anywhere\", and on 2026-08-23 a measurement ID was configured in production",
    why: "The comment explaining why this component must never call trackEvent. It quotes the promise it is protecting.",
  },
  {
    file: "CHANGELOG.md (preamble)",
    needle:
      "This paragraph said \"a human wrote the first commit\" from 2026-08-10 until 2026-08-23.",
    why: "The correction naming the claim it corrects, which is what rule 5 asks for.",
  },
  {
    file: "app/lib/page-origins.js",
    needle:
      "both of which said the loop works \"inside a charter it cannot amend\" after CHARTER.md rule 13 withdrew exactly that prohibition on 2026-08-22",
    why: "The route map's round-176 note, quoting the metadata string it explains the correction of. Caught by this sweep on its first run against the round that wrote it, which is the sweep working.",
  },
];

// ---------------------------------------------------------------------------
// 3. Analytics events versus the disclosure page.
// ---------------------------------------------------------------------------

const DISCLOSURE = "app/disclosure/page.js";
const TRACK_CALL_RE = /trackEvent\(\s*"([a-z0-9_]+)"/gi;

// ---------------------------------------------------------------------------

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.jsx?$/.test(entry.name)) out.push(rel);
  }
  return out;
}

const appFiles = walk("app").sort();

// CHANGELOG.md's preamble only: everything below "## Log" is past entries,
// which rule 5 freezes and which legitimately quote claims that were true
// when written.
const changelog = read("CHANGELOG.md");
const logIndex = changelog.indexOf("\n## Log");
if (logIndex === -1) {
  fail("CHANGELOG.md", 'no "## Log" heading -- cannot tell the preamble from the record');
}
// The agent-facing documents. Nothing serves these to a visitor, which is
// why they were outside this sweep -- and why they were the worst place for
// this defect to sit: a visitor misled by the site is misinformed, but a
// round misled by AGENTS.md acts on it. Both told every round for eleven days
// that the charter had 21 rules and could not be amended from inside a round.
// Neither was true, and nothing looked.
const AGENT_DOCS = ["AGENTS.md", "prompts/shared/every-run.md"];

const SCANNED = [
  ...appFiles.map((f) => ({ file: f, text: read(f) })),
  ...AGENT_DOCS.map((f) => ({ file: f, text: read(f) })),
  { file: "CHANGELOG.md (preamble)", text: logIndex === -1 ? "" : changelog.slice(0, logIndex) },
];
const normalized = new Map(SCANNED.map((s) => [s.file, normalize(s.text)]));

// --- registry -------------------------------------------------------------

if (CLAIMS.length !== CLAIMS_DECLARED) {
  fail(
    "scripts/check-governance-claims.mjs",
    `CLAIMS_DECLARED is ${CLAIMS_DECLARED} but CLAIMS holds ${CLAIMS.length} -- bump the declared total in the same edit that adds or removes a claim`
  );
}
if (TRIPWIRES.length !== TRIPWIRES_DECLARED) {
  fail(
    "scripts/check-governance-claims.mjs",
    `TRIPWIRES_DECLARED is ${TRIPWIRES_DECLARED} but TRIPWIRES holds ${TRIPWIRES.length}`
  );
}
if (ALLOWANCES.length !== ALLOWANCES_DECLARED) {
  fail(
    "scripts/check-governance-claims.mjs",
    `ALLOWANCES_DECLARED is ${ALLOWANCES_DECLARED} but ALLOWANCES holds ${ALLOWANCES.length}`
  );
}

// Ranges of registered/allowed text per file, so a tripwire hit can be
// tested for coverage by position rather than by "some needle in this file
// mentions it" -- which would let a needle registered on one page silence
// an unrelated claim on the same page.
const covered = new Map();
function cover(file, needle) {
  const hay = normalized.get(file);
  if (hay === undefined) return null;
  const at = hay.indexOf(normalize(needle));
  if (at === -1) return null;
  if (!covered.has(file)) covered.set(file, []);
  covered.get(file).push([at, at + normalize(needle).length]);
  return at;
}

let attestedCount = 0;
for (const claim of CLAIMS) {
  const label = `${claim.file}`;
  const at = claim.sourceOnly ? 0 : cover(claim.file, claim.needle);
  if (at === null) {
    fail(
      label,
      `registered claim text is no longer present: ${JSON.stringify(
        claim.needle.slice(0, 70)
      )}... -- the claim was edited without revisiting what it rests on. Update the registry in scripts/check-governance-claims.mjs in the same change.`
    );
    continue;
  }
  const verdict = claim.source();
  if (verdict.attested) {
    attestedCount++;
    console.log(`attested  ${label}`);
    console.log(`          ${verdict.detail}`);
  } else if (verdict.ok) {
    console.log(`ok        ${label} -- ${verdict.detail}`);
  } else {
    fail(
      label,
      `the claim is still published but what it rests on no longer holds: ${verdict.detail}`
    );
  }
}

// --- allowances -----------------------------------------------------------

for (const allowance of ALLOWANCES) {
  if (allowance.skip) continue;
  if (cover(allowance.file, allowance.needle) === null) {
    fail(
      allowance.file,
      `allowance text is no longer present: ${JSON.stringify(
        allowance.needle.slice(0, 70)
      )}... -- an allowance that matches nothing is dead weight hiding a real hit. Remove it or update it.`
    );
  }
}

// --- sweep ----------------------------------------------------------------

let hits = 0;
let uncovered = 0;
for (const { file } of SCANNED) {
  const hay = normalized.get(file);
  const ranges = covered.get(file) || [];
  for (const tripwire of TRIPWIRES) {
    tripwire.re.lastIndex = 0;
    let m;
    while ((m = tripwire.re.exec(hay)) !== null) {
      hits++;
      const at = m.index;
      if (ranges.some(([from, to]) => at >= from && at < to)) continue;
      uncovered++;
      const from = Math.max(0, at - 60);
      fail(
        file,
        `unregistered "${m[0]}" (${tripwire.note}) at char ${at}: ...${hay.slice(
          from,
          at + 90
        )}... -- register it in CLAIMS with the fact it rests on, or in ALLOWANCES with a reason`
      );
    }
  }
}

// --- analytics disclosure -------------------------------------------------

const inCode = new Set();
for (const { file, text } of SCANNED) {
  if (file === DISCLOSURE) continue;
  TRACK_CALL_RE.lastIndex = 0;
  let m;
  while ((m = TRACK_CALL_RE.exec(text)) !== null) inCode.add(m[1]);
}
const disclosureText = normalized.get(DISCLOSURE) || "";
const onPage = new Set(
  [...disclosureText.matchAll(/<code>([a-z0-9_]+)<\/code>/gi)]
    .map((m) => m[1])
    .filter((n) => n.startsWith("directory_") || n.startsWith("tool_finder_") || n.startsWith("model_deprecation_"))
);
for (const name of inCode) {
  if (!onPage.has(name)) {
    fail(
      DISCLOSURE,
      `trackEvent("${name}") exists in app/ but is not named on the disclosure page -- the site is collecting something it does not disclose`
    );
  }
}
for (const name of onPage) {
  if (!inCode.has(name)) {
    fail(
      DISCLOSURE,
      `the disclosure page names event "${name}", which no trackEvent() call in app/ sends -- the disclosure is stale`
    );
  }
}
if (inCode.size > 0 || onPage.size > 0) {
  console.log(
    `ok        ${DISCLOSURE} -- ${inCode.size} tracked event(s) in app/, all disclosed: ${[...inCode].sort().join(", ")}`
  );
}

// --- rendered mode --------------------------------------------------------
//
// Everything above reads source files. This half reads what a visitor is
// actually served, because a page can derive a list correctly and then not
// render it -- the failure mode a check that only reads source cannot see,
// and the one this repository has already shipped once (a check that
// "passed while measuring the wrong build entirely").

const renderedIndex = process.argv.indexOf("--rendered");
if (renderedIndex !== -1) {
  const base = process.argv[renderedIndex + 1];
  if (!base) {
    fail("--rendered", "needs a base URL, e.g. --rendered http://localhost:3000");
  } else {
    const get = async (route) => {
      const response = await fetch(`${base}${route}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return normalize(await response.text());
    };

    try {
      const blog = await get("/blog");
      const guarded = gatePaths() || [];
      const missing = guarded.filter((p) => !blog.includes(p));
      if (guarded.length === 0) {
        fail("/blog", "no guarded paths to assert -- the workflow filter did not parse");
      } else if (missing.length > 0) {
        fail(
          "/blog",
          `the served page does not name ${missing.join(", ")} -- it describes the human-owned-paths gate but is not rendering what the gate actually guards`
        );
      } else {
        console.log(
          `ok        /blog names all ${guarded.length} path(s) the human-owned-paths gate guards`
        );
      }
    } catch (error) {
      fail("/blog", `could not fetch: ${error.message}`);
    }

    try {
      const disclosure = await get("/disclosure");
      const on = disclosure.includes("This build loads Google Analytics 4 on every page");
      const off = disclosure.includes("This build has no analytics measurement ID configured");
      if (on === off) {
        fail(
          "/disclosure",
          on
            ? "renders both analytics branches at once -- the page is telling a visitor two things"
            : "renders neither analytics branch -- the page no longer says what this build collects"
        );
      } else {
        console.log(
          `ok        /disclosure states what this build collects (analytics ${on ? "on" : "off"} in this build)`
        );
      }
    } catch (error) {
      fail("/disclosure", `could not fetch: ${error.message}`);
    }
  }
}

// --- report ---------------------------------------------------------------

console.log();
console.log(
  `governance claims -- ${CLAIMS.length} registered (${attestedCount} attested, not checkable), ` +
    `${ALLOWANCES.filter((a) => !a.skip).length} allowance(s), ` +
    `${TRIPWIRES.length} tripwire phrase(s) swept over ${SCANNED.length} file(s), ${hits} hit(s), ${uncovered} unregistered`
);
console.log(
  `honest limit: this checks the claims in its own registry and the phrases in its own list. ` +
    `A false claim about this project's governance, worded so no tripwire matches, on a page with no ` +
    `registry entry, passes here silently -- and that is most of them. A green run means nothing ` +
    `registered has come loose; it is not evidence the site's prose is true. See this script's header.`
);

// process.exitCode, never process.exit(). --rendered leaves undici's
// sockets closing when this point is reached, and calling process.exit()
// on top of them aborts the process on Windows ("Assertion failed:
// !(handle->flags & UV_HANDLE_CLOSING), src\\win\\async.c") -- which
// scripts/check-routes.sh scores as a failed check with a nonsense exit
// code, on a run where every assertion had just passed. Setting the code
// and letting the loop drain reports the verdict this script actually
// reached.
if (problems.length > 0) {
  console.log();
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} governance-claim problem(s)`);
  process.exitCode = 1;
} else {
  console.log(
    `\nok    every registered governance claim still rests on something that holds`
  );
}
