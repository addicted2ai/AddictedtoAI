---
date: 2026-09-03
slug: gemini-3-8-flash
type: entry
summary: >
  An entry job updating the google-deepmind wiki entry and writing prose on the
  Pulse-minted google-gemini-3-8-flash stub: Gemini 3.8 Flash, released 2
  September 2026 (OpenRouter and llm-releases both date it Sep 2; the feed
  rows landed 2026-09-03) — Google DeepMind's fourth Flash model in under four
  months and the successor to 3.7 Flash. The docket facts: Artificial Analysis
  Intelligence Index 59 at high reasoning (up 3 from 3.7 Flash, level with
  sub-maximum efforts of GPT-5.6 Sol and Grok 4.6), 57 at medium, 52 at low;
  unchanged $0.75/$3.75 per Mtok introductory pricing through 2026-12-31 with
  standard $1.50/$7.50 after; a ~30% rise in average output tokens per task
  (~48k) lifting cost per task to ~$0.58 at high reasoning despite the
  unchanged per-token price; Google's own "3.8 Flash works harder" design
  note; HLE-Verified 54.9%; DeepSWE v1.1, Vals Finance Agent v2, Harvey's
  Legal Agent Benchmark; 1M-token context, multimodal input (text, audio,
  image, video), 64K output, tool use; and the same-day sibling Gemini 3.8
  Flash Cyber (trusted-defenders-only via the new Fairwind Program, CyberGym
  frontier-level claim, 47.2% pass@1 CWE-Bench, 2.6x Chrome patches).
evidence: >
  Official model page, fetched 2026-09-03 —
  https://deepmind.google/models/gemini/flash/ ("Gemini 3.8 Flash — Best for
  tackling complex agentic tasks at scale"; "Our most intelligent workhorse
  model yet for coding and agents"; DeepSWE v1.1; Vals Finance Agent v2;
  Harvey's Legal Agent Benchmark; "3.8 Flash also achieves a 54.9% on
  HLE-Verified"; "Status: General availability"; 1M input / 64K output tokens;
  availability in Gemini app, Gemini Enterprise, Agent Platform, AI Studio,
  Gemini API, AI Mode, Antigravity; Glean quote: "completing more than three
  times as many tasks as Gemini 3.7 Flash in our evaluations"). OpenRouter
  listing, fetched 2026-09-03 — https://openrouter.ai/google/gemini-3.8-flash
  ("Released Sep 2, 2026"; "50% off $0.75 / $3.75 per 1M"; "Context 1M";
  "Gemini 3.8 Flash is Google's most intelligent Flash model with significant
  gains from 3.7 Flash across software engineering, agentic tasks, and
  multi-step reasoning"). llm-releases catalog page, fetched 2026-09-03 —
  https://llm-releases.com/models/gemini-3-8-flash ("released Sep 2, 2026 —
  its fourth Flash model in under four months"; AA Index 59 high / 57 medium /
  52 low with the model comparisons quoted; "Pricing matches Gemini 3.7
  Flash's current discounted rate of $0.75/$3.75 per Mtok input/output through
  the end of 2026 ($1.50/$7.50 at standard pricing), with cached input keeping
  a 90% discount; a ~30% rise in average output tokens per task (to ~48k)
  lifts cost per task to ~$0.58 at high reasoning"). 9to5Google, fetched
  2026-09-03 — https://9to5google.com/2026/09/02/gemini-3-8-flash-launch/
  ("Gemini 3.8 Flash rolling out three weeks after last release", Sep 2 2026,
  8:18 am PT; "This marks the third Flash update in three months"; Google's
  "performance gains stem from a core design choice: 3.8 Flash works harder…
  At times, the model might use more tokens to maximize performance,
  especially at higher effort levels"; knowledge cutoff March 2026 for some
  domains / January 2025 for others; introductory $0.75/$3.75 "until December
  31"; Gemini 3.8 Flash Cyber "replacing 3.5" for trusted testers "via a new
  Fairwind Program", Chrome Security's 2.6x correct patches, Wiz's +7.5-9.7%
  recall at 2.3-5.2x lower cost, Cloud Vulnerability Research finding a
  critical foundational vulnerability in less than 2 hours). llm-releases
  catalog page for the Cyber sibling, fetched 2026-09-03 —
  https://llm-releases.com/models/gemini-3-8-flash-cyber ("introduced by
  Google DeepMind on Sep 2, 2026 in the same launch"; trusted defenders only
  via Fairwind Program; CyberGym; "success rate exceeding 70% on an internal
  real-world vulnerability benchmark spanning 20 programming languages";
  "47.2% pass@1 on the external CWE-Bench patching benchmark";
  "Not publicly token-billed (trusted-access only)"). llm-releases feed
  pubDates (feed fetched 2026-09-03): "Google DeepMind releases Gemini 3.8
  Flash" and "Google DeepMind introduces Gemini 3.8 Flash Cyber" both
  Wed, 02 Sep 2026. The site's change feed carries the OpenRouter arrival
  rows for google/gemini-3.8-flash and its :batch twin, dated 2026-09-03.
expires: 2026-09-09
---

# Gemini 3.8 Flash — the fourth Flash in four months, and a Cyber sibling

## Why now

The release is one day old, it is the largest model announcement in this
window (the feed's only same-day vendor story beyond it is the Cyber twin
it belongs to), and the site's own google-deepmind wiki entry is already
stale: it opens "In the OpenRouter catalog on 31 August 2026…" and its
Flash-vs-Pro scoreboard ends at 3.7 Flash. Every fact in this docket is
missing from the corpus except the stub the Pulse minted. The entry job is
the site's established treatment of Flash releases (3.5, 3.6 and 3.7 all
live as wiki entries with prose; none got a blog post).

## Would-send test

"Google shipped Gemini 3.8 Flash — fourth Flash in four months, AA index 59
at high reasoning, same $0.75/$3.75 intro price as 3.7 but it emits ~30%
more output tokens per task, so cost per task went UP anyway. And there's a
Cyber variant for trusted defenders via a new Fairwind Program." Someone who
pays for Gemini tokens or follows model economics or watches cyberdefense
models forwards that. The cost-per-task inversion (unchanged per-token
price, higher per-task cost) is exactly the kind of non-obvious, checkable
number this site exists to record, and the Cyber sibling is a policy story
with a named access regime.

## What the job would produce (done-when)

- The google-deepmind org entry gains a 3.8 Flash timeline row dated
  2026-09-02 (sources: OpenRouter and llm-releases, both quoted in this
  docket) and its prose is revised off the "on 31 August 2026" snapshot:
  the Flash cadence count (fourth in under four months per llm-releases;
  three updates in three months per 9to5Google), the new AA Index numbers
  (59/57/52) against the entries' existing comparisons, and the
  "works harder" design note with its output-token consequence.
- The google-gemini-3-8-flash model entry gains prose carrying: the
  unchanged $0.75/$3.75 introductory pricing through 2026-12-31 with the
  $1.50/$7.50 standard rate after (matching the org entry's existing
  flash_introductory_pricing fact pattern), the ~48k average output tokens
  per task and ~$0.58 cost per task at high reasoning, HLE-Verified 54.9%,
  DeepSWE v1.1, Vals Finance Agent v2, Harvey's Legal Agent Benchmark,
  1M/64K context, and the knowledge-cutoff dates (March 2026 some domains,
  January 2025 others).
- The Gemini 3.8 Flash Cyber sibling is carried as the same-day launch it
  is: trusted-defenders-only access through the Fairwind Program (naming
  the three admitted classes as llm-releases states them), not publicly
  token-billed, CyberGym claim, CWE-Bench 47.2% pass@1, Chrome Security's
  2.6x correct patches, Wiz's +7.5-9.7% recall at 2.3-5.2x lower cost,
  Cloud Vulnerability Research's sub-2-hour critical finding — each with
  its stated source and vendor-reported framing.
- Every number above is attributed to the page it came from; vendor-reported
  benchmark claims are labeled as such.

---