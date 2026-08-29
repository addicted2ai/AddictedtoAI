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

## Recheck 2026-08-29 (addictedtoai-flh) — one real defect found and fixed

**The twelve-URL table reproduces, hop for hop, a day later.** I re-ran it
with my own script (manual redirect following, meta-refresh detection) at
2026-08-29T16:26:12Z. Every status code and every redirect destination is
identical to the published table: the three paperswithcode apex/sota/task
paths all 302 to `huggingface.co/papers/trending`; `/dataset/imagenet` 302s
to `zh-plus/tiny-imagenet`; `/paper/attention-is-all-you-need` 302s to
`huggingface.co/papers/1706.03762`; `www.paperswithcode.com` still fails with
`ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE`; `datasets/imagenet-1k` 302s to
`huggingface.co/imagenet-1k/datasets` which 404s; `chat.lmsys.org` is still
`ENOTFOUND`; both HF spaces 307 to the same renamed destinations; and
`helm/latest` still returns 200 at **232 bytes** whose only content is
`<meta http-equiv="refresh" content="0; URL=https://crfm.stanford.edu/helm/classic/latest">`,
matched verbatim. The post's key detectable signal also survives: the three
paperswithcode destinations still return the identical byte length to each
other (1,501,787 x 3 today, where the post recorded 1,508,226 x 3).

Supporting specifics all re-confirmed: `last-modified: Sat, 25 Apr 2026
16:45:23 GMT` on aider.chat, unchanged; the byline "By Paul Gauthier, last
updated November 20, 2025." verbatim; the cog block quoted in the post is
verbatim in the page HTML, including `mod_dates = [get_last_modified_date(file)
for file in files]` and `latest_mod_date = max(mod_dates)`; `3.169.202.99` is
in the A-record set for **both** `paperswithcode.com` and
`www.paperswithcode.com` (a four-address round-robin, identical for both
hosts — "the same address as the apex" is true, if singular); tiny-imagenet
tags `source_datasets:extended|imagenet-1k` and `size_categories:100K<n<1M`
against `ILSVRC/imagenet-1k`'s `source_datasets:original` and
`size_categories:1M<n<10M`. All four date arithmetics recompute: 281, 329,
48, 125.

**The defect. The run-identifier count was one short, and the third-newest
run named was the wrong one.** Filed as addictedtoai-wug.

Enumerating every `<date>-<time>--<run name>` in the fetched page
(569,855 B) gives **69** distinct identifiers, each occurring exactly once as
a `Dirname :` field — not 68. The missed one is
`2025-08-25-14-16-37--gpt-5-low`, and because 14:16:37 is later in the day
than `2025-08-25-13-23-27--gpt-5-medium`, it is also the true third-newest
run. So the two errors are one error: a single identifier was skipped, which
both lowered the count and displaced the third row of the list.

**I checked whether this was merely staleness, and it is not.** Each run's
enclosing `<tr>` is about 6,500 bytes (`gpt-5-low`'s measures 6,497). The
page grew from 569,700 B at the post's check to 569,855 B at mine — a delta
of **155 bytes**. A 6.5 KB row cannot arrive inside a 155-byte change, so
`gpt-5-low` was already on the page on 2026-08-28. This is also the post's
own thesis working against the alternative explanation: a board whose newest
data is 2025-10-03 did not acquire a 2025-08-25 run overnight.

Corrected in place, two tokens: `68` -> `69`, and `2025-08-25 gpt-5-medium`
-> `2025-08-25 gpt-5-low`. **No conclusion of the post changes** — the newest
identifier is still 2025-10-03, still 329 days before the check, still 48
days after nothing and 48 days before the banner's own date, and the
five-eighths comparison is untouched.

Worth recording for the process rather than the post: this number passed the
author and the round-one reviewer, whose record states "68 distinct run ids"
as an independent confirmation. Two people read the same page and got the
same wrong count. A count like this should be the pasted output of an
enumerating script, never a reading.
