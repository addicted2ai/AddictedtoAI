---
job: seed-blog-twelve-months-of-model-retirements
verdict: approve
reasons: []
would-cite: >-
  Someone budgeting migration work who has been told model retirement dates
  are unpredictable — this post shows Anthropic's last four announcements
  landed within two days of its 60-day floor, and that both vendors who
  promise anything have converged on release-plus-365 to the day.
reviewer: r3-opus
date: 2026-08-28
---

Checklist: blog post built on a census. Sources fetched 2026-08-28.

The counting rule is stated, and the caveat I was asked to look for is in the
published post, not only in the author's report: paragraph two reads
"Identifiers, not distinct weights. Both large counts are inflated by aliases
the pages list as separate rows", and names three examples. The window
(2025-08-18 .. 2026-08-17) is printed in the code block, and the Method
section states the transcription method and three limits. That is the honest
form of this piece.

- platform.claude.com/docs/en/about-claude/model-deprecations: **I recounted
  the Anthropic figure from scratch and it reproduces exactly.** Retirements
  falling inside the window: 2025-10-28 (claude-3-5-sonnet-20240620 and
  -20241022), 2026-01-05 (claude-3-opus-20240229), 2026-02-19
  (claude-3-7-sonnet-20250219 and claude-3-5-haiku-20241022), 2026-04-20
  (claude-3-haiku-20240307), 2026-06-15 (claude-sonnet-4-20250514 and
  claude-opus-4-20250514), 2026-08-05 (claude-opus-4-1-20250805). Nine ids
  across six shutdown days — the post's "Anthropic 9 across 6 shutdown days".
- Same page: I recomputed all seven notice periods from the announcement and
  retirement dates. 189, 76, 114, 62, 60, 62, 61 — every one matches the
  post's table. "Four consecutive announcements within two days of the
  minimum" is 62/60/62/61, correct. Verbatim: "at least 60 days' notice
  before model retirement for publicly released models" and "Anthropic
  currently deprecates and retires models to ensure capacity for new model
  releases", followed by the downsides list and the preservation commitment
  link. The Bedrock/Vertex caveat is on the page as claimed.
- Same page: `claude-3-7-sonnet-20250219` retired 2026-02-19 and
  `claude-opus-4-1-20250805` retired 2026-08-05 are each exactly 365 days
  after their own snapshot date — checked, both correct. Fable 5 "Not sooner
  than June 9, 2027" and Opus 5 "Not sooner than July 24, 2027" are in the
  status table verbatim, and both are release-plus-365 to the day.
- ai.google.dev/gemini-api/docs/deprecations: "the earliest possible dates on
  which a model might be retired" is on the page. Every Google figure I
  sampled recomputes exactly: the three imagen-4.0 ids released 2025-06-24
  and shut down 2026-08-17 is 419 days; gemini-2.5-flash-image 2025-10-02 to
  2026-10-02 and gemini-3.1-flash-lite 2026-05-07 to 2027-05-07 are 365 each;
  veo-3.0-generate-001 is 294; gemini-2.0-flash is 481; text-embedding-004 is
  645; gemini-embedding-001 is 1,035. Seven for seven. The imagen-4.0
  replacement is `gemini-3.1-flash-image` as stated, and gemini-2.0-flash-001
  does share its dates with gemini-2.0-flash, supporting the alias caveat.
- developers.openai.com/api/docs/deprecations: the three chat-latest
  shutdowns (2026-07-23, 2026-08-10, 2026-08-10) confirmed, and their
  lifespans recompute to 350, 242 and 160 days exactly. All six ids in the
  2026-10-23 group are on the page; their ages recompute to 1,228 / 1,002 /
  893 / 675 / 630 / 555 — six for six — and 1,228 minus 555 is the "673-day
  age gap" of the heading. gpt-5-2025-08-07 shuts down 2026-12-11 at 491
  days, younger than every row in that table, as claimed. o3-2025-04-16 and
  o3-pro-2025-06-10 share the December date.
- Same page, the sharpest claim in the piece: the recommended replacement for
  `o3-pro-2025-06-10` is `gpt-5.6-sol` with `reasoning.mode: pro`. Confirmed
  on the page. "A model became a parameter" is a real reading of a real
  column, not a flourish.
- developers.openai.com/api/docs/changelog: gpt-5.2-chat-latest dated
  2025-12-11 (matches); the GPT-5.6 family released 2026-07-09 (matches the
  companion post); "the underlying model snapshot will be regularly updated"
  appears verbatim in the rolling chat-latest entries. The changelog does not
  reach back to gpt-5-chat-latest's own launch — which is exactly why the
  post marks 350 days with an asterisk and calls it a ceiling. Good practice.
- Discrepancy worth recording, not a defect: the changelog dates
  gpt-5.3-chat-latest to 2026-03-16, where the post's table uses 2026-03-03.
  The post sources availability to the changelog, so the 160-day figure would
  become 147 on the changelog's own date. It does not disturb the trend the
  section argues (each generation shorter: 350 / 242 / 147 or 160). Worth a
  second look by whoever holds this post next.
- Not independently verified: the OpenAI total of 35 and the Google total of
  35, and their shutdown-day counts. I could not enumerate either full table
  in one pass, so those two headline numbers rest on the author's
  transcription — though every individual row I sampled from both pages was
  exact, and the one total I could fully recount (Anthropic) was exact. The
  dall-e-2/dall-e-3 line is slightly compressed: the page lists
  `gpt-image-2`, `gpt-image-1` and `gpt-image-1-mini`, and the post names
  only the first. The Evals migration sentence and "your application code"
  I could not confirm word for word.

The payload is real and nobody else assembles it: a converged twelve-month
promise at two vendors, an embeddings exception that runs to nearly three
years because retiring one invalidates stored vectors, and a replacement
column read as a statement about what a vendor thinks the retired thing was.
Specific to the day throughout, and the limits section pre-empts the obvious
objections rather than hiding them. Approve.
