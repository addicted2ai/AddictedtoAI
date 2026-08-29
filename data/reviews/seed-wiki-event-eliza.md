---
job: seed-wiki-event-eliza
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone who has just seen "a 1966 chatbot beat GPT-3.5 on a Turing test"
  posted without a citation — this entry is where you check which figures
  Jones and Bergen actually reported and, once fixed, which version of the
  paper reported them.
reviewer: r3-opus
date: 2026-08-28
---

Checklist: wiki entry (event). Sources fetched 2026-08-28.

- courses.cs.umbc.edu/331/papers/eliza.html: resolves to Weizenbaum, CACM
  vol. 9 no. 1, January 1966, as claimed. Every quoted string verified
  verbatim: "the MAC time-sharing system at MIT"; "Input sentences are
  analyzed on the basis of decomposition rules which are triggered by key
  words appearing in the input text."; "The psychiatric interview is one of
  the few examples of categorized dyadic natural language communication in
  which one of the participating pair is free to assume the pose of knowing
  almost nothing of the real world."; "respond roughly as would certain
  psychotherapists (Rogerians)"; "Like the Eliza of Pygmalion fame, it can be
  made to appear even more civilized, the relation of appearance to reality,
  however, remaining in the domain of the playwright."; "once a particular
  program is unmasked, once its inner workings are explained in language
  sufficiently plain to induce understanding, its magic crumbles away". The
  opening "Men are all alike" exchange is the paper's own opening sample.
- arxiv.org/abs/2501.06707 (ELIZA Reanimated): resolves; the five named
  authors, the MAD-SLIP printout found in Weizenbaum's MIT archives, the
  restored CTSS on an emulated IBM 7094 and "The entire stack is open source"
  all check out, and 12 January 2025 is the submission date.
- arxiv.org/abs/2310.20216 (Jones and Bergen): **this is the defect.** The
  entry quotes "the best-performing GPT-4 prompt passed in 49.7% of games,
  outperforming ELIZA (22%) and GPT-3.5 (20%), but falling short of the
  baseline set by human participants (66%)" and dates it to the 31 October
  2023 posting, in the prose and again in the timeline entry
  (`2023-10-31 ... ELIZA passes as human in 22% of games ... GPT-3.5 at 20%`).
  I fetched both versions. v1, submitted 31 Oct 2023, reports different
  numbers: "The best-performing GPT-4 prompt passed in 41% of games,
  outperforming baselines set by ELIZA (27%) and GPT-3.5 (14%), but falling
  short of chance and the baseline set by human participants (63%)." The
  quoted sentence is v2's, submitted 20 April 2024. So the quotation does not
  appear in the document on the date the entry assigns to it, and the fact
  block's `turing_test_2023_success_rate` is a 2024 figure carrying a 2023
  label.
- Knock-on: the prose payload says ELIZA was judged human "slightly more
  often than GPT-3.5". "Slightly" describes v2's two-point gap; in the
  version actually posted in 2023 the gap was thirteen points (27 vs 14).
  The entry's headline claim survives in both versions — ELIZA outscores
  GPT-3.5 either way — so this is a dating and margin error, not a collapse.

The fix is small and specific: either date the quoted figures to the revised
version (v2, 20 April 2024) in both the prose and the timeline, or keep the
31 October 2023 date and quote v1's figures (41% / 27% / 14% / 63%), adjusting
"slightly" accordingly. Rename the fact field so it does not assert 2023.

Everything else here is first-rate and verified to the word — the paper's own
framing of the therapy setting as an excuse for having no world model, and
the rediscovered MAD-SLIP source, are a real payload. It fails only because a
direct quotation is attributed to a document that did not contain it on the
stated date, which is precisely the check this wave exists to run. Revise.
