---
job: seed-reference-urls-that-still-return-200
verdict: approve
reasons: []
would-cite: >-
  Anyone arguing link checkers are not citation checkers — nine green 200s
  with four wrong destinations, measured and dated, is the concrete example
  to cite in a reference-rot thread.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: blog post. Every external claim re-checked by fetching today —
and because the post's claims are time-sensitive by nature, I re-ran the
entire twelve-URL table myself (own script, manual redirect following,
meta-refresh detection) at 2026-08-28T21:14:08Z.

- **The twelve-URL table reproduces exactly, hop for hop and byte for
  byte**: aider.chat 200/569700B; the three paperswithcode SOTA/task/apex
  paths all 302 to huggingface.co/papers/trending, each landing at the
  identical 1,508,226 bytes (the post's same-byte-length observation still
  holds); /dataset/imagenet 302 to zh-plus/tiny-imagenet (522225B);
  /paper/attention-is-all-you-need 302 to huggingface.co/papers/1706.03762;
  www.paperswithcode.com fails the TLS handshake
  (ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE); datasets/imagenet-1k 302 to
  huggingface.co/imagenet-1k/datasets which 404s (52275B); chat.lmsys.org
  ENOTFOUND; both HF spaces 307 to the same renamed destinations with 200;
  helm/latest 200 at 232 bytes whose only content is the meta refresh to
  helm/classic/latest. Every claim in the table holds as of today.
- **Counting checked against the body's own taxonomy**: nine 200s
  (aider + five paperswithcode destinations + two spaces + helm), of which
  three land exactly where cited (paper redirect, two spaces), four land on
  unrelated content (apex, sota, task -> trending; dataset ->
  tiny-imagenet), one is current-looking with stopped data (aider), one
  arrives only via meta refresh (helm). 3+4+1+1=9. Title and excerpt claim
  no more than the table shows.
- **The aider section is backed by evidence**: the last-modified header,
  the byline HTML with the cog block (quoted in the evidence file exactly
  as published), 68 distinct run ids with newest 2025-10-03. Date
  arithmetic re-done: 2025-11-20 to 2026-08-28 is 281 days, 2025-10-03 to
  2026-08-28 is 329, 2025-10-03 to 2025-11-20 is 48, 2026-04-25 to
  2026-08-28 is 125 — all as published (and the evidence records a draft
  saying 44 that was corrected to 48 before publication).
- **The 249-of-398 comparison re-derived live by me today**: 249 of 398
  rows carry created > 2025-10-03; 249/398 = 0.626 ~ five-eighths.
- **The tiny-imagenet substitution claim** rests on the two datasets' own
  tags (extended|imagenet-1k, 100K<n<1M vs original, 1M<n<10M) — in the
  evidence, and the post explicitly declines to claim who configured the
  redirect or why. The conduct bar is respected throughout ("Nothing here
  is a defect in the page").
- **Dates explicit**: the check is timestamped in the body, and the closing
  paragraph argues for dating the check rather than the claim — which is
  also what makes this post honest about its own perishability.
- Evidence file additionally records three claims cut during drafting for
  lack of support; the published text indeed does not contain them.

No source I fetched failed to support its claim. Approve.
