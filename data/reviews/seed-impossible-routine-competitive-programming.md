---
job: seed-impossible-routine-competitive-programming
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that specialised systems beat general ones at narrow tasks:
  DeepMind built AlphaCode for competitive programming alone and landed
  mid-pack at top 54.3%, while a general reasoning model that was not built
  for contests reached the 99.8th percentile and IOI gold three years later.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, both ends peer-reviewed preprints.
Sources fetched 2026-08-28.

- https://arxiv.org/abs/2203.07814: abstract carries the figure verbatim —
  "AlphaCode achieved on average a ranking of top 54.3% in competitions with
  more than 5,000 participants". The delta's "more than 5,000 entrants" and
  "top 54.3%" are the paper's own words and threshold. Submission history
  confirms v1 Tue, 8 Feb 2022, matching the front-matter date exactly.
- https://arxiv.org/html/2502.06807v2: observed verbatim "the transition from
  the o1-ioi model to o3 resulted in a rating increase from 2214 (98th
  percentile) to 2724 (99.8th percentile)", and in the abstract "o3 achieves a
  gold medal at the 2024 IOI and obtains a CodeForces rating on par with elite
  human competitors". Both halves of the routine end are supported.
- Date check worth recording: the cited URL is the v2 HTML, but the
  front-matter date is 2025-02-03. Fetched the abstract page's submission
  history to resolve this rather than assuming a mismatch — "[v1] Mon, 3 Feb
  2025 23:00:15 UTC", "[v2] Tue, 18 Feb 2025". The date is the paper's first
  appearance and is correct; a later pass should not "fix" it to the v2 date.
- Noted and acceptable: the two ends use different Codeforces metrics —
  simulated contest ranking at end A, Elo rating percentile at end B. The gap
  is mid-pack to 99.8th percentile, far larger than any distortion the metric
  change could introduce, and the delta describes each in the source's own
  terms rather than presenting one number minus the other.
- Not independently verified: o3's 2724 rating is OpenAI's self-report in its
  own paper, not an independently administered Codeforces account. The delta
  attributes it to the paper rather than stating it as an audited fact, which
  is the honest form; the IOI 2024 gold is a scored external competition.

Clears the bar. The payload an enthusiast likely does not hold: AlphaCode — a
purpose-built system, the whole point of which was this task — was merely
average against humans, and the thing that beat it was a general model with no
contest-specific engineering. That inversion is the story, and both ends quote
verbatim. Approve.
