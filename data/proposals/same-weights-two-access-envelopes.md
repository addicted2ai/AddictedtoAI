---
date: 2026-09-06
slug: same-weights-two-access-envelopes
type: post
frontier: true
frontier_reason: F5
summary: >
  Write a synthesis post on the release shape that three frontier labs
  adopted inside four days: ship one model twice, under two different
  permission envelopes, and put the more permissive envelope behind a
  vendor-run vetting programme. Anthropic released Claude Fable 5.1 and
  Claude Mythos 5.1 on 1 September 2026 and says on its own announcement
  page that they "are the same model, but with different levels of
  safeguards", with Mythos "available only through our trusted access
  programs" and "currently ... only available to a set of US organizations"
  — the Cyber Verification Program and a Life Sciences Verification Program
  Anthropic describes as developed in partnership with the US government.
  Google released Gemini 3.8 Flash and Gemini 3.8 Flash Cyber on 2 September
  2026, writing that "both of today's releases are powered by the same
  foundational intelligence" while 3.8 Flash Cyber "is only available to
  trusted defenders", gated case by case through a new Fairwind Program for
  trusted government authorities, critical infrastructure operators and
  software maintainers. OpenAI's GPT-6 Astra, which this site has already
  covered, restricts its most advanced cyber capabilities within an
  otherwise general release. The post's claim is narrow and checkable: what
  is being gated is no longer the weights but the permission to use them,
  the gate is a programme the vendor admits people to, and in two of three
  cases a government is named in the admission criteria.
evidence: >
  Externally retrieved, all on 2026-09-06 from this worktree.
  https://www.anthropic.com/claude-fable-and-mythos-5-1 (retrieved
  2026-09-06) — "Claude Fable 5.1 and Claude Mythos 5.1 are the same model,
  but with different levels of safeguards"; Mythos is "available only
  through our trusted access programs" and "currently, it is only available
  to a set of US organizations"; names the Cyber Verification Program (CVP)
  and the Life Sciences Verification Program (LSVP), the latter described as
  developed in partnership with the US government.
  https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/
  (retrieved 2026-09-06, page dated 2 September 2026) — "While tailored for
  different deployment environments, both of today's releases are powered by
  the same foundational intelligence"; "3.8 Flash Cyber is only available to
  trusted defenders who require a more comprehensive set of cyber
  capabilities"; the Fairwind Program gives "prioritized access to Gemini
  3.8 Flash Cyber" to "trusted government authorities, as well as critical
  infrastructure operators and software maintainers".
  https://www.anthropic.com/claude/mythos and
  https://www.anthropic.com/news/enterprise-frontier-safeguards (both
  retrieved 2026-09-06) — the trusted-access programme pages and the
  enterprise-monitoring announcement that sits beside them.
  The site's own record of the third leg is
  content/blog/openai-astra-critical-designation.md and
  content/blog/openai-gpt-6-astra-system-card.md; the OpenAI vendor pages
  those posts anchor on are re-fetched at writing time rather than restated
  from the corpus.
expires: 2026-09-20
---

# Same weights, two access envelopes

## Why now, and why the expiry is fourteen days rather than seven

The three events are dated 1, 2 and 3 September 2026. The pattern is only a
pattern while all three are recent enough that a reader remembers them as
one week; by late September each will read as its own release and the shape
will have to be argued rather than shown. Fourteen days is the synthesis
allowance and this uses all of it deliberately — the derivation needs the
three vendor pages side by side, which takes longer than a note.

## The frontier flag, and the criterion it is claimed under

`frontier_reason: F5` — "a material change in access: a frontier model
withdrawn, gated, or opened." Claude Mythos 5.1 is, by Anthropic's own
sentence, the same model as its flagship Fable 5.1, released only behind
CVP/LSVP admission. Gemini 3.8 Flash Cyber is, by Google's own sentence,
the same foundational intelligence as the generally available 3.8 Flash,
released only to Fairwind admittees. Both are dated records with vendor
primary sources, and both are gatings of frontier capability rather than
price moves or new checkpoints — which is the line the not-qualifying list
draws.

No `domains` is declared, and that is the vocabulary's unmarked "general"
rather than an unfilled field. The closed vocabulary is `coding`, `agents`,
`image`, `video`, `audio`, `research`, `science-math`, `robotics`; offensive
and defensive security is not a value in it, and inventing one would be the
drift the single-definition rule exists to prevent.

## The send test, in its would-send form

"Three labs shipped the same model twice in four days — once for everyone,
once for people the vendor has vetted — and two of the three name a
government in who gets vetted." That goes to anyone who has ever argued
about open weights, because it relocates the argument: the contested
boundary has moved off the weights and onto an admissions list.

## What makes this outward rather than inward

Nothing in this repository states it. The change feed records the arrivals
(`Gemini 3.8 Flash Cyber`, `Claude Fable 5.1`, `Claude Mythos 5.1`) as rows
with no access semantics at all — a gateway catalog cannot tell you that two
model ids share weights or that one is admissions-gated. Every load-bearing
sentence above comes from a vendor page fetched today.

## Done when

- Each of the three legs anchors on the vendor's own page, fetched at
  writing time, quoted verbatim, and dated. A leg whose page cannot be
  fetched is dropped from the post rather than carried from a summary.
- The claim is the *shape*, not a ranking and not a security assessment. The
  post does not assert that any of these models is more capable than
  another, does not compare cyber benchmark figures, and does not evaluate
  whether the gating is adequate — all three would be claims this site
  cannot check.
- Where a vendor's admission criteria name a government or a government
  partnership, that is quoted from the vendor rather than characterised.
- The post states explicitly that it does not know, and cannot check, how
  many organisations have actually been admitted to any of the three
  programmes — the vendors publish the gate, not the roll.
- The relationship to the site's existing Astra coverage is stated, so the
  synthesis reads as a frame over published work rather than a re-run of it.
- If the writing job concludes the F5 flag does not hold on the evidence it
  can fetch, it drops the flag and says so in its record rather than
  publishing a flag it cannot defend.
