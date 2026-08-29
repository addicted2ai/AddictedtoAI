---
job: seed-context-window
verdict: approve
reasons: []
would-cite: "For arguments about whether model capability curves are hype, input capacity is the rare spec with a primary-sourced hard number at each end: 2,048 tokens in the GPT-3 paper to 2,000,000 on a public API four years later."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched https://ar5iv.labs.arxiv.org/html/2005.14165. Observed
  verbatim: "All models use a context window of n_ctx = 2048 tokens" — the
  claim that the window was fixed for every model size is supported exactly.
  Confirmed the date against the arXiv abstract page: "[v1] Thu, 28 May 2020"
  — the front-matter date is exact.
- End B: fetched the Google developers blog post; publication date June 27,
  2024 matches. Observed verbatim: "Today, we're opening up access to the
  2 million token context window on Gemini 1.5 Pro for all developers" — the
  post also confirms this lifted a previous waitlist, supporting "opens ...
  to every developer on its public API."

Quality: no one is quoted calling 2M tokens impossible, and the delta does
not pretend otherwise — this is the other strong form the spec names, a
capacity that moved three orders of magnitude with both ends measurable and
primary. A daily AI-follower still feels the 1,000x when the two numbers sit
next to each other.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

Both ends re-fetched to disk and matched literally.

- ar5iv.labs.arxiv.org/html/2005.14165 (1,199,026 bytes): "All models use a
  context window of" and "2048 tokens" both matched, on the same line. Note
  for later passes: ar5iv renders the subscript as MathML, so the plain
  string `n_ctx` is *absent* from the page and a naive search for it will
  return a false negative — the rendered text reads "n ctx = 2048
  n_{\mathrm{ctx}}=2048 tokens". The claim that the window was fixed across
  every model size is the sentence's own "All models".
- developers.googleblog.com Gemini API post (42,250 bytes): "JUNE 27, 2024"
  in the byline block, and "Today, we're opening up access to the 2 million
  token context window on Gemini 1.5 Pro for all developers" verbatim, with
  the preceding sentence confirming the waitlist it replaced ("the longest
  ever context window of 2 million tokens in Gemini 1.5 Pro behind a
  waitlist"). "Opens ... to every developer on its public API" is supported.

No claim in this delta required correction.
