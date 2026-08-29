---
job: seed-wiki-model-openai-gpt-5-6-sol
verdict: revise
reasons:
  - overclaiming-summary
  - broken-reference
would-cite: >-
  Someone citing Sol's 91.91% on TerminalBench 2.1 as its headline score needs
  to know VentureBeat records that as the ultra-mode figure against 88.76% in
  max mode — this page hands over the number without the mode, which is the
  part that decides whether the comparison is fair.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. Sources fetched 2026-08-28; catalog claims
measured against `data/sources/openrouter-models/latest.json` (2026-08-28,
388 rows).

**Verified by fetching:**

- github.blog changelog, 2026-07-09 — publication date matches
  `release_date`. Sol is described verbatim as "The highest reasoning ceiling
  in the family. Best for complex reasoning over large codebases and
  demanding, long-running agentic work." The `tier_role` fact is exact.
- venturebeat.com — the preview is dated 26 June 2026, "approximately 20 total
  organizations", and the government framing is quoted directly: "At [the U.S.
  government's] request, we are starting with a limited preview for a small
  group of trusted partners." The capture-the-flag figure is verbatim: "all
  three GPT-5.6 models crossed its 'High' cyber threshold on internal
  capture-the-flag testing, with Sol reaching **96.7%**".

**Defect 1 — the TerminalBench figure drops its qualifier.** VentureBeat
reports Sol at "91.91%" on TerminalBench 2.1 **in ultra mode**, and at
"88.76%" in max mode. The `terminalbench_score` fact records "91.91% on
TerminalBench (2.1)" with no mode, and the body then presents it as what "this
row measured". Quoting the higher of two published mode results as the score
overstates the source. Add the mode, or record both.

Minor, same category: the CTF fact drops "internal" — the source is explicit
that this is OpenAI's own internal testing against its own "High" threshold,
not a third-party evaluation.

**Defect 2 — a citation that does not support its claim.** The body states
"General availability across ChatGPT, Codex, the API and GitHub Copilot
followed on {{release_date}}", and the timeline repeats it, both sourced to
the github.blog changelog. I re-fetched that changelog and asked specifically:
it does not mention ChatGPT, Codex or the OpenAI API anywhere. It says the
models are "now rolling out in GitHub Copilot" and lists only GitHub surfaces
(VS Code, Visual Studio, Copilot CLI, JetBrains, Xcode, Eclipse, github.com,
GitHub Mobile). The underlying claim is *true* — a web search confirms GA on
9 July 2026 across ChatGPT, Codex, the API and Copilot, and OpenAI's own
announcement page is the natural citation — but I could not fetch
openai.com/index/gpt-5-6/ directly (HTTP 403), so I am reporting the claim as
corroborated by secondary coverage, not by the primary source. The fix is to
cite the OpenAI announcement for the GA claim and keep github.blog for the
Copilot half. This same mis-citation appears on the Terra and Luna entries.

**Verified by measurement:**

- 2026-06-26 → 2026-07-09 is exactly 13 days.
- `gpt-5.6-sol-pro` 2e-6 = `gpt-5.6-sol` 2e-6, identical. `gpt-5.5-pro` 3e-5 /
  `gpt-5.5` 5e-6 = 6.000. Both exact.
- Coding 77.4 / 76.7 / 71.4 and agentic 57.8 / 50.2 / 46.9 for Sol / Terra /
  Luna — the two indices do run "the same order", and Sol leads both. True.
- All fourteen transclusions resolve.

**Restating.** Two of three paragraphs cover ground adjacent pages already
hold. The preview story (20 organisations, government request, 26 June) is on
`org/openai` and repeated on the Terra and Luna entries — four pages for one
event. The Pro-premium paragraph is on `org/openai` and is
`model/openai-gpt-5-5`'s entire thesis; 5.5 owns it better, since that is
where the ratio broke. What is genuinely this page's own is the TerminalBench
and CTF pair and the three-way index ordering that tests the vendor's "highest
reasoning ceiling" label against measurement — a good move, and worth keeping.

Fix the mode qualifier, re-point the GA citation, and cut the Pro-premium
paragraph in favour of the sibling that owns it. Revise.
