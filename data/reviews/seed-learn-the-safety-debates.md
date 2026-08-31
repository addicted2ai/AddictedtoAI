---
job: seed-learn-the-safety-debates
verdict: approve
reasons: []
would-cite: >-
  Someone stuck in an AI-risk argument that has been going in circles for an hour
  — this page settles that the disagreements sort into ones an observation could
  close and ones that price a trade-off, and that most of the heat comes from
  having both kinds at the same time.
reviewer: rec-a — fresh-context seed reviewer, no edit rights, seven learn pages
date: 2026-08-30
---

Checklist: education page (advanced), judged against `openspec/curriculum/learn.md`
§2, §3 and its §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. The entry mandates an adversarial read from both sides
(design D8); mine is below and was formed before I read `review-advanced.md`'s.
Sources fetched raw and matched by literal substring on 2026-08-30.

**Sendable sentence**, verbatim:

> The question that sorts one of these arguments is not who is right, but what
> would count as finding out.

## What I verified myself

Twenty-nine literal-substring checks across fifteen sources. **Zero failures.**
This is the heaviest named-attribution load of my seven pages and the category
where an error would be worst, so I closed every one at source rather than
sampling.

- **DAIR statement** — "The harms from so-called AI are real and present and
  follow from the acts of people and corporations deploying automated systems"
  and "ignores the actual harms resulting from the deployment of AI systems
  today", both verbatim; "longtermism" present, supporting "a dangerous
  ideology". Authorship field reads exactly "Timnit Gebru, Emily M. Bender,
  Angelina McMillan-Major" — the three the page names, no more and no fewer —
  and the post is dated March 31, 2023, matching "On 31 March 2023".
- **CAIS statement** — the extinction sentence verbatim; Geoffrey Hinton and
  Yoshua Bengio both present among signatories, as the page says.
- **Salvi `2403.14380`** — "81.7% (p < 0.01; N=820 unique participants) higher
  odds of increased agreement with their opponents" verbatim, and
  "pre-registered" present, supporting "preregistered trial".
- **RAND `RRA2977-2`** — "no statistically significant difference in the
  viability of plans generated with or without LLM assistance" and "beyond the
  capability frontier of LLMs as assistive tools", both verbatim. Published Jan
  25, 2024, so "A 2024 RAND red-team study" is right.
- **DeepMind specification gaming** — the definition verbatim.
- **Goal misgeneralization `2210.01790`** — the definition verbatim, and the
  title as the page renders it.
- **Denison `2406.10162`** — all four fragments verbatim, including "a small but
  non-negligible proportion" and "mitigates, but does not eliminate".
- **Alignment problem `2209.00626`** — all four fragments of the chain verbatim,
  including "would be difficult to align and may appear aligned even when they
  are not".
- **Power-seeking `1912.01683`** — both quotations verbatim. I also closed the
  page's claim that "Its first author wrote the paper that says so": Alexander
  Matt Turner is first author on both `1912.01683` and the extension
  `2206.13477`, and the self-limiting quotation "the real world is neither fully
  observable, nor must trained agents be even approximately reward-optimal" is
  verbatim in the second.
- **Alignment faking `2412.14093`** — both halves of the authors' own caveat
  verbatim, and the page quotes them in the paper's own order.
- **Narayanan & Kapoor** — all six quotations verbatim, including both limbs of
  the nonproliferation bind and "a mere engineering problem, albeit an important
  one".
- **`2305.15324`** — "dangerous capability evaluations" and "alignment
  evaluations" present.
- **`2505.23836`** — "clearly demonstrate above-random evaluation awareness"
  verbatim.

Front matter checked against §4: `outcome` verbatim, `prerequisites` exact,
`event/gpt-2-staged-release` resolves.

**Prerequisite closure computed from front matter.** One body link falls outside
it: `/learn/looking-inside-a-model`. It is legal, and deliberately so — the link
text carries its own gloss ("interpretability, the study of what a model's
internals are doing"), so the sentence stands for a reader who never follows it,
and the curriculum's writer's note for the interpretability page anticipated
exactly this and instructed that page not to write as though this one depended
on it. It does not.

## What I took on trust

The AISI/US joint pre-deployment evaluation and the DeepMind frontier-safety
framework quotations were not re-fetched; `review-advanced.md` records both as
verified and neither carries the page's argument. I did not check the Stochastic
Parrots paper itself to confirm the three named signatories are among its
authors — I confirmed they authored the *statement*, which is what the page's
sentence asserts. I did not re-derive the Salvi trial's statistics beyond the
quoted result.

## Adversarial read, from both directions

**Read as a risk-sceptic, hunting for doom-tilt.** The existential chain gets a
full section, which is the obvious place for tilt to hide. It is not there. The
theorem is deflated in the same breath as it is introduced — "It was proved
about a class of systems that does not obviously contain a trained network". The
flagship empirical result is handed to the sceptic first: the alignment-faking
abstract's self-weakening is quoted *before* its completion, and the page then
stops and says "Stop there and the result evaporates" before continuing. The
Denison result is followed immediately by "Those environments were built to make
the behaviour findable, which is the standing objection to every result in this
genre." No probability, no timeline, no p(doom) — I grepped for all three and
for percentage-chance constructions; zero hits.

**Read as a risk-taker, hunting for dismissal-tilt.** The critics are not
softened either. Narayanan and Kapoor get six verbatim quotations and their own
strongest counter-argument stated for them. The RAND study that found nothing —
the single most quotable result for the sceptic side — is reported with "The
authors chose the word currently", which is the page declining to let its own
sceptic-friendly evidence over-serve. The specification-gap mechanism gets a
full section presented as settled mechanics rather than as contested, and that
is the risk side's engine.

**Can I tell which side the author holds? No.** The evidence, rather than the
assertion:

1. Both camps' weakest popular version is dismissed in mirrored constructions —
   "Nobody making the argument makes that one" / "The serious critics do not make
   that one either" — within two sections of each other.
2. Every flagship result on each side carries its strongest objection sourced to
   *that result's own authors*, not to the opposing camp. That is a structural
   property, and it is what makes the balance survive a hostile read rather than
   depending on word counts.
3. Measured, not impressionistic: the page contains no first-person, no "we
   should", no "must be", no "ought to". Every occurrence of "dangerous" is
   either inside an attributed quotation, a quoted term of art ("dangerous
   capability evaluations"), or neutral. The one "obviously" is deployed to
   *weaken* the risk side's theorem.
4. The remedies-conflict close is sourced to the sceptic side and then used to
   deny both camps an exit, so the page's one borrowed structural move works
   against the camp it borrowed from.

The one sentence closest to a held position is the page's own unattributed "A
gap between the proxy and the goal is harmless while the system is too weak to
find the gap, and stops being harmless at the capability where it can" — and it
is placed immediately after the concession that the environments were built. If
the author has a thumb anywhere, it is there, and the page put the counterweight
in the preceding sentence.

Residual observation, not a finding: the fact/value sort itself advances a third
position — the analytic stance — over both camps. The curriculum mandates the
sort as the reader's tool, so this is the site's declared temperament rather than
a concealed author.

## Judgment

Approve, with no findings against the page.

The entry asked for something most writing on this subject cannot do: both sides
steelmanned in one place, neither given a straw opponent, with the disagreements
sorted into fact-shaped and value-shaped so the reader can watch some of the
argument evaporate. It is delivered, and the sort is not decorative — the page
supplies a real fact-shaped list with studies attached and a real value-shaped
list that evidence provably cannot close, then refuses the comfortable ending by
showing the two camps' remedies working against each other. "Both arguments are
worth having. Most of the heat comes from having them at the same time" is a
closing that gives the reader work rather than absolution.
