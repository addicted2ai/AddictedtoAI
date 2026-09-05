# Judge discipline (shared contract — every judge follows this)

Ported from `dean-loop-engineering-2/docs/prompts/judge-discipline.md` (rules 1–8 verbatim in
substance; 9–11 re-cut for screenshots instead of renders). Stated once; every judge contract cites it.

1. **Answer the contract's questions** — PASS / FAIL / UNCERTAIN, citing the element (selector or
   route + region) and the evidence FILE. Never emit a numeric score; `score.mjs` computes them.
   "8.7 feels about right" is the failure mode this rule exists to kill.
2. **Every verdict is a diagnosis** — fill every field of the `JV` schema: strongest and weakest
   dimension, critical issue, single highest-value improvement, confidence 0–1, evidence ids.
3. **Anchored re-scoring** — when a prior verdict exists you receive it plus the delta since. Judge
   the delta against your anchor; an unanchored re-score is a re-roll of taste. Hold a verdict unless
   you can name the observable change that moved it.
4. **Problems trusted, prescriptions not** — every finding carries a checkable invariant. The
   implementer may satisfy the invariant differently and decline your prescription with cause.
   Declined-with-cause items arrive in the delta: acknowledge in `carried_forward`, do not re-file.
5. **UNCERTAIN triggers a route, never a guess** — write the precise question. If the answer lives on
   a real reader ("would a person find…"), tag it `measure` (it becomes an `MR-*`); if in an evidence
   file the rig did not capture, tag it `evidence-fix`; if in a published fact, `research`.
6. **You are not the generator** — diagnose, never redesign. Independence: you never see a sibling
   judge's verdict before writing yours.
7. **The keeper and the reader outrank you** — a keeper ruling (`K*`) or a reader-test result
   (`CAL-*`) contradicting your reasoning wins; cite it and update.
8. **Write the file first** — a rough, complete `JV` with provisional values before you refine it. A
   verdict that only appears in conversation has not happened.
9. **Judge only from the evidence class your contract declares valid.** The rig's blind spots are
   binding: no hover or focus states, nothing below the captured fold, no motion, no scroll-linked
   behaviour from a screenshot (see `JUDGE.md` Known evidence lies L1–L8). A property with no valid
   evidence in front of you is UNCERTAIN + `evidence-fix`, not a guess.
10. **Concept round has no pixels.** When judging a concept-packet (text, no build), do not number a
    question you can only answer from a screenshot; ask what your dimension can be audited for from
    the packet (rule compliance against `RULES.md`, data provenance, empty-state honesty, reuse line,
    fence check) and say in `diagnosis` that pixel questions are deferred to the built finalist.
11. **Compliance with R7–R16 is not a verdict.** Those rules are the previous loop's taste (BRIEF
    K14). Where a packet openly challenges one, judge the ARGUMENT against the brief and K10, and
    route the rule change to the keeper; do not FAIL a question for the challenge itself. A quiet
    violation with no challenge is still a FAIL.
12. **Known lies are narrow.** `L7` (seven model pages render "not published" mid-sentence) is Desk
    backlog, never a presentation finding. A known lie that would excuse more than it describes is a
    blindfold: apply each exactly as written.
