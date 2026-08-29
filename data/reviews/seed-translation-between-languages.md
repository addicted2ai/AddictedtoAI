---
job: seed-translation-between-languages
verdict: approve
reasons: []
would-cite: "Whoever needs the milestone-to-commodity pattern outside English cites this: a single-pair human-parity lab result in 2018, and one open-sourced model covering 200 languages four years later, with each end stating its own scope."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched the Microsoft Translator post; publication date March 14,
  2018 matches. Observed: human parity reported on Chinese-to-English news
  translation using newstest2017, judged by hired "bilingual human
  evaluators who compared the results against a different set of
  human-produced translations." The source limits its claim to that one
  pair and test set — and the delta's front matter carries the limitation
  in its own words ("for one language pair on one test set"), which is
  exactly the honesty this surface trades on.
- End B: fetched https://arxiv.org/abs/2207.04672. Submission history shows
  "[v1] Mon, 11 Jul 2022" — front-matter date exact. Abstract, verbatim:
  "Our model achieves an improvement of 44% BLEU relative to the previous
  state-of-the-art" and "we open source all contributions described in this
  work" — supporting the 200-language model, the 44% metric, and the
  open-sourcing claim including benchmark and training code.

Quality: the delta's shape is "milestone under narrow conditions" to "open
at 200-language scale," which reads as breadth rather than a reversal — a
solid but not electric member of the set. The scrupulous scope-carrying on
end A earns it its place. Approve, lower-middle.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

Both ends re-fetched to disk and matched literally.

- End A, Microsoft Translator blog (175,586 bytes): the post's own title is
  "Neural Machine Translation reaches historic milestone: human parity for
  Chinese to English translations", "Posted on March 14, 2018". The scope
  the delta preserves is on the page: "the researchers used an industry
  standard test set of news stories (newstest2017) to compare human and
  machine translation results. To further ensure accuracy of the evaluation,
  the team also hired bilingual human evaluators who compared the results
  against a different set of human-produced translations." One pair, one
  test set — the front matter's "for one language pair on one test set" is
  the source's own limitation, carried rather than dropped.
- End B, arxiv.org/abs/2207.04672 (49,362 bytes): "[Submitted on 11 Jul
  2022"; "Our model achieves an improvement of 44% BLEU relative to the
  previous state-of-the-art"; "we open source all contributions described in
  this work" (supporting "with its benchmark and training code" — the
  contributions include the Flores-200 benchmark it names).
- False-absence note for later passes: the literal string "200 languages"
  is **not** on the abstract page. The 200-language claim is carried as
  "What does it take to break the 200 language barrier", the benchmark name
  "Flores-200", and "the performance of over 40,000 different translation
  directions". The delta's "one model translating 200 languages" is
  supported; a naive search for "200 languages" would have produced a wrong
  "unsupported" verdict.

No claim in this delta required correction.
