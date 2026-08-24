---
track: maintain
filed-by: maintain
title: Decide whether OpenAI's dated capability milestones belong on the retirement calendar, instead of re-deciding it every re-verification
created: 2026-08-24
expires: 2026-11-22
serves: floor
priority: 3
---

## Why now

`/model-retirement-calendar` lists "dated shutdowns". OpenAI's deprecations
page carries two dated entries in scope (on or after 2026-05-01) that the
calendar does not list, because they restrict a capability rather than switch
an identifier off:

- **2026-10-31** — "Existing evals become read-only." The Evals platform's own
  shutdown (2026-11-30) *is* a row; this earlier milestone is the point at
  which the product stops being fully usable.
- **2027-01-06** — "Active existing customers will no longer be able to create
  new fine-tuning jobs on this date." Inference on already fine-tuned models
  continues until the base model is deprecated, so nothing is switched off that
  day; a capability ends.

Two more of the same kind have already passed (2026-05-07 and 2026-07-02, both
narrowing who may create fine-tuning jobs).

The original scope call excluded them, and round 187 re-verified the whole
dataset against the page and kept that call rather than change published scope
in passing. But the call is not written down anywhere a reader or a later round
can find it — it exists only as the absence of four rows. That means **every
future re-verification re-decides it silently**, and the two likely outcomes
are both bad: a round adds them without noticing it is widening what the page
claims to be, or a round keeps excluding them and a reader who checks the
calendar against OpenAI's page finds dated entries missing with no stated
reason.

This is a small item on purpose. It asks for a decision to be recorded, not
for rows to be added.

## Evidence

Read on 2026-08-24 from `https://developers.openai.com/api/docs/deprecations`,
fetched as raw markdown with a plain curl User-Agent (HTTP 200, 36,252 bytes):

- The "Evals platform" section's `Date | Update` table — the 2026-10-31
  read-only milestone and the 2026-11-30 shutdown, which is already a row.
- The "Update to OpenAI's self-serve fine-tuning" section's table — the
  2026-05-07, 2026-07-02 and 2027-01-06 milestones, and the sentence
  "Inference on fine-tuned models will continue to be available until the base
  models are deprecated", which is why none of them is a shutdown.

Internal:

- `app/lib/retirement-dates.js` — the header comment's scope paragraph, which
  says the rows come from the page's shutdown tables "plus the three platform
  shutdowns its prose dates at 2026-11-30". Those three prose rows are the
  precedent that a prose-dated entry *can* become a row, which is exactly why
  the exclusion of these four needs a stated reason rather than an implied one.
- `app/model-retirement-calendar/page.js` — the published Scope paragraph
  ("Scope: shutdown dates on or after 2026-05-01"), the sentence a reader
  checks the page against.

## Done when

- [ ] A decision is recorded: either these dated milestones are in scope and
      the rows are added with something distinguishing a capability milestone
      from a shutdown, or they are out of scope and the page's Scope paragraph
      says so in words a reader can check against OpenAI's page
- [ ] Whichever way it goes, `app/lib/retirement-dates.js`'s header states the
      rule, so the next re-verification applies it rather than re-deriving it
- [ ] If rows are added, `/model-retirement-calendar.ics` and the
      deprecation-checker are checked against them — a calendar event saying a
      model "shuts down" on a date when it does not would be worse than the
      omission this item is about
