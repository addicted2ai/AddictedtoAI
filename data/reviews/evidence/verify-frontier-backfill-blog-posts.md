# Evidence — the frontier backfill of the blog corpus

Job `j-20260906-17` (verify), `DIRECTIVES.md` line 114, beads
`addictedtoai-9c9t`, DESK-ORDER-001 §1 ("**Backfill:** tag the existing posts …
once, editorially; the section is then not empty on day one").

**What was decided:** every one of the 16 posts under `content/blog/` was read
in full and judged against the five criteria as `openspec/specs/blog/spec.md`
("A frontier flag is earned, declared, and gated at the build") and
`lib/domains.mjs` state them. **Six are flagged. Ten are declined, and every
decline is recorded below with the criterion it failed and why** — the directive
asks for the declines by name, and a decline nobody can read is a decision
nobody can overturn when the facts move.

Raw run transcript: `verify-frontier-backfill-blog-posts.raw.txt` in this
directory. The script that produced it is
`tools/check-frontier-backfill.mjs`, kept so the run reproduces rather than
being described.

## The run, not the intention

`tools/check-frontier-backfill.mjs` parses every post file with `gray-matter`
and hands the front matter to `postSchema` (`lib/schema.mjs`), whose
`superRefine` calls `frontierFlagProblems` (`lib/domains.mjs`) — the same single
rule the build gate and the scout's merge gate both read. It prints the flag
**as the schema parsed it**, not as the file was written, and it fails if the
parse disagrees with the decision table committed inside it. Output, 2026-09-06:

```
# split: 6 flagged, 10 declined, 16 total
RESULT: every post satisfies postSchema and matches the committed decision table.
```

The vocabulary and the criterion ids in the transcript are printed from
`DOMAINS` and `FRONTIER_REASONS` rather than retyped, so a drift between this
record and the source tree would show as a diff in the transcript.

`npm run build` and `npm test` were both run after the edits; results at the
foot of this file.

## The six flagged, with the criterion each earns

| post | criterion | `domains` | why it holds |
|---|---|---|---|
| `nemotron-ultra-cc-ioi-2026.md` | **F1** | `coding` | First model run to outscore the highest-scoring human on an IOI problem set (535.4 to Qiwen Xu's 498.27). The evaluation was **prospective** — run during the live competition, before the problems were public — so the artifact anyone can check is arXiv 2609.02849v1 *plus the IOI's own published scoreboard*, and the post checked the comparison numbers against `stats.ioinformatics.org` rather than taking NVIDIA's word for them. `coding` because the subject is a code-specialised competition model writing solutions (`lib/domains.mjs`: "writing, editing, reviewing source code"; include "code-specialised models"). |
| `openai-gpt-6-astra-system-card.md` | **F3** | — (general) | A release by a covered organisation (`content/wiki/org/openai.md`) of a model it positions as its frontier: GPT-6 Astra, shipped 3 September 2026 with its system card the same day. F3's first branch, in its plainest form. |
| `openai-astra-critical-designation.md` | **F4** | — (general) | A verbatim vendor claim by a major player about a new ability, labelled unverified. OpenAI's own words: the model "discovered and used two zero-day vulnerabilities as part of an exploit chain", and the Critical threshold means it "can find previously unknown security flaws and develop ways to exploit them across many well-protected systems without a person guiding each step". The post labels it: "All of the capability evidence is OpenAI's own", and quotes TechCrunch — "Without any third-party confirmation, it is difficult to evaluate OpenAI's claims about safety or preparedness." |
| `glm-5-3-license-revenue-gate.md` | **F5** | — (general) | A material change in access. Z.ai (covered) published GLM-5.3's open weights on 27 August 2026 **and** attached clause 2, which makes commercial use by a triggered licensee conditional on a Z.AI security review whose scope and method Z.AI determines. Opened and gated in the same act; the gate is the story. |
| `minimax-h3-licence-excluded-territories.md` | **F5** | `video` | A material change in access. MiniMax (covered) ships H3's weights openly while its licence defines the Applicable Territory as worldwide *excluding* the EU, the UK, South Korea and the US, and §V.4 says use outside it "is not authorized". That gate lands on a download 5.36 million people already made. `video` because H3 is a video generation model (`lib/domains.mjs`: "moving-image understanding or generation"). |
| `anthropic-enterprise-frontier-safeguards.md` | **F5** | — (general) | A material change in access. Anthropic's Covered Models page, quoted in the post: "zero data retention is not available in workspaces, Claude Enterprise organizations, or third-party platforms … where Covered Models can be accessed", with Fable 5 and Mythos 5 designated on **9 June 2026** and Fable 5.1 and Mythos 5.1 on 31 August 2026. A ZDR customer cannot use Anthropic's current frontier models at all — a frontier model gated, for a named class of customers, on a dated and checkable record. |

### Two flags whose tension is recorded rather than hidden

**F1 on the Nemotron post.** F1's parenthetical names "paper with code" as one
example of a checkable artifact, and this paper has no code: the post
establishes that `Nemotron-3-Ultra-CC` is **not published** (a Hugging Face model
API query on 5 September 2026 returned zero results for it) and that the release
is an intention — "We plan to release our competition Nemotron-3-Ultra-CC
checkpoint". A reviewer reading the parenthetical as the bar would decline this.
It is flagged because the head clause is the bar — "a capability shown for the
first time, with an artifact anyone can check" — and the parenthetical is
exemplary. The check here is stronger than most code drops: both sides of the
comparison are the **IOI's** published figures, not the vendor's, and the run
was prospective, so the contamination objection that usually needs code to
settle is settled by the calendar. What is *not* checkable is reproduction —
one run, 760 GB300s, no released checkpoint — and the post says so.

**F5 on the Anthropic EFS post.** The anchor is the 1 September 2026 EFS
announcement, and EFS itself ships nothing yet ("later this fall"). The access
change the flag marks is therefore not the anchor event but the lockout the post
uncovers behind it, effective 9 June 2026. F5 is cited because the record the
flag marks is the gate — a frontier model unavailable to a class of customers —
which happened, on a date, with Anthropic's own support pages as evidence. A
reviewer who reads F5 as binding only the anchor's own act would decline this
one.

## The ten declines, each with the criterion it failed

| post | declined because |
|---|---|
| `ifm-k2-horizon-open-fleet.md` | **F3 fails on both branches.** First branch needs a *covered organisation*: the Institute of Foundation Models at MBZUAI has **no `content/wiki/org/` entry** (24 entries exist; the transcript lists them) and no catalog presence — a `grep -ric` for `mbzuai\|ifm-ai\|"ifm"\|k2-horizon` across `data/derived/` and `content/wiki/` returns exactly one hit, `search-index.json`, which is this post indexing itself. Second branch needs "an open-weights release matching a covered lab's frontier **on a published measure**", and the post cites none: its only cross-vendor figures are Artificial Analysis's *reward-hacking flag rates* for Claude Fable 5 (2.2%) and GPT-5.6 Luna (4.1%), which are not capability scores. F5's "a **frontier** model … opened" rests on IFM's own page title ("Frontier Performance, Radically Open") and the post declines to endorse it, labelling the numbers vendor-reported. **Refile condition:** if an IFM/MBZUAI org entry lands under §2's coverage widening, F3's first branch becomes reachable and this post should be re-judged — it is the strongest decline in the set. |
| `thomson-reuters-thomson-model.md` | **F3 fails** — Thomson Reuters has no `content/wiki/org/` entry, and K21 is explicit that a feed row is not coverage ("a player is on the board because the site COVERS it, never because a feed carries it"), so the post's `covers:` llm-releases arrival does not supply it. **F4 fails** on "a new **ability**": the CEO's quote is a *parity* claim — "our early evaluations put Thomson on par with the latest frontier models across a range of tasks" — not a claim that the model can do something new, and the post's own reading of the model card shows the $40M bought 2.9 points over the free Apache-2.0 base it repurposed, with Stanford LegalBench last of five columns. |
| `openai-daybreak-frontline-defenders.md` | **F5 fails.** A $1B subsidy is money, not a change in who may use a frontier model: Daybreak already served "2,000 approved organizations" before the announcement, and the access expansion inside it is announced-future ("in the coming weeks"), not effected. The not-qualifying list names a price change explicitly, and a subsidy is one from the other side. |
| `gitspawn-git-config-code-execution-coding-agents.md` | No criterion. A vulnerability disclosure in seven coding agents' use of `core.fsmonitor` — the post's own line is "The model never enters into it". Real and well-reported, but it is not a capability (F1), an index move (F2), a release (F3), a vendor ability claim (F4) or an access change to a frontier model (F5). |
| `doj-statement-of-interest-llm-training-fair-use.md` | No criterion. A US statement of interest arguing LLM training is fair use is a legal argument the court is free to ignore ("A statement of interest is a letter the court is free to read"). It moves no model, no index and no access. |
| `eu-ai-office-first-enforcement-rfis.md` | **F5 fails on the post's own words**: "No model has been restricted, no provider sanctioned … No model has been pulled, no market access restricted." An RFI opens a supervisory file; it changes no access. |
| `anthropic-usage-policy-government-exceptions.md` | No criterion. A court vacating a Pentagon designation, plus a reading of a Usage Policy clause dated 15 September 2025. Neither a capability, a release, nor a change in access to a model. |
| `claude-session-theft-infostealers.md` | No criterion. Infostealer malware replaying stolen session cookies is an account-security story about users' machines; nothing about a model's capability or availability changed. |
| `three-accounts-hugging-face-intrusion.md` | No criterion. A comparison of three incident reports on one July 2026 sandbox escape — a disclosure-consistency finding, not an F1–F5 event. |
| `nobody-had-to-report-the-wiki-incident.md` | No criterion. Agents editing a German wiki, and the absence of a disclosure rule. The concrete outcome is that a volunteer locked his wiki — a governance record, and F1–F5 do not reach it. |

## Why six of the sixteen carry no `domains`

Absence is the vocabulary's unmarked "general" (K38, and K46 on `BLIND-002.md`),
and the blog spec spells it out: "a flagged record carrying no `domains` is a
general one, not an untagged one". Four of the six flags land on stories whose
subject — a licence gate, an enterprise retention policy, a cybersecurity
designation, a general-purpose frontier release — maps to **no value in the
eight**. `cybersecurity` is not in the vocabulary and was not invented.

The one deliberate near-miss: both Astra posts describe a model acting "without
a person guiding each step", which reads towards `agents`. It was not assigned.
`lib/domains.mjs` states the rule those posts would bend — "**Declared, never
inferred.** No heuristic over a title, body, aliases or URL may assign a domain"
— and reading a domain off a sentence in the prose is that heuristic wearing an
editor's coat. The published capability claims on those pages are cyber
evaluations (ExploitBench, ExploitGym, SRE-Bench), which the vocabulary does not
carry. `science-math` was likewise not assigned to the system-card post for its
one FrontierMath row: the post is not about mathematics, and a domain section
that grouped it there would mislead a reader in exactly the way a facet exists
to prevent.

The `domains` that *were* assigned are both the post's own subject, not a
mention inside it: `video` for a video generation model's licence, `coding` for
a competitive-programming model's IOI run.

## What this changes downstream, stated because it is not a defect

These three keys are **editorial** and are deliberately not in
`MECHANICAL_FRONT_MATTER_KEYS` (`lib/schema.mjs:530-539`,
`lib/review-hash.mjs`). Tagging a published post is therefore an edit to its
reviewed surface: the six changed posts' existing review records report
`mismatched` until a fresh verdict binds the changed bytes. `specs/blog` states
this as the intended cost — "Tagging a post is a review event, and paying that
cost is the point" — and `specs/review` requires the launch check to name a
mismatched piece rather than call it unreviewed. The ten declines change no
bytes, so no record of theirs moves.

## Runs

| command | result |
|---|---|
| `node tools/check-frontier-backfill.mjs` | exit 0 — 16/16 parse under `postSchema`; 6 flagged, 10 declined, matching the table above |
| `npm run build` | see below |
| `npm test` | see below |
