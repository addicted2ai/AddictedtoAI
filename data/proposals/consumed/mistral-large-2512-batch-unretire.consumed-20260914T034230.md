---
title: Restore the mistral-large-2512-batch entry to live form
slug: mistral-large-2512-batch-unretire
type: repair
expires: 2026-09-17
summary: >
  The entry is retired and dormant with no feeds binding while its OpenRouter
  row is live again: present in the committed snapshot, removed once on
  2026-09-01 and relisted on 2026-09-10. Restore it to the site's live-entry
  form.
verified_on: 2026-09-13
subjects:
  - content/wiki/model/mistralai-codestral-2508-batch.md
  - content/wiki/model/mistralai-mistral-large-2512-batch.md
---

The entry `content/wiki/model/mistralai-mistral-large-2512-batch.md`
(id `model/mistralai-mistral-large-2512-batch`) is `status: retired` on a
dormant stub with no feeds binding, while its OpenRouter row
`mistralai/mistral-large-2512:batch` is live again:

- Row present: `data/sources/openrouter-models/latest.json:16896` (row id at
  `:16986`).
- Removal: `data/changes.jsonl` line 110, dated
  2026-09-01.
- Relist: `data/changes.jsonl` line 208, dated
  2026-09-10.

The 2026-09-10 relist means the row is live now and the entry should read as
a relisting, not a retirement. The prescribed repair — the same one the site
ran on the codestral-2508 and ministral-8b-2512 batch stubs — is: restore the
`feeds:` binding to the openrouter-models source, restore the canonical
feed-backed facts (request price, response price, context window, tokenizer,
status fields) against the committed snapshot rows, flip `retired`/`dormant`
status to `active`/`living`, and record BOTH dated timeline rows — the
2026-09-01 removal and the 2026-09-10 relist — rather than either alone.

**Verification scope (read-only):**
`content/wiki/model/mistralai-codestral-2508-batch.md` is the landed
precedent of exactly this record shape — restored feeds binding, canonical
feed-backed facts, the 2026-09-01 removal and 2026-09-10 relist timeline
pair, active status — already applied and merged that way. Read it to match
the form. Do not modify it: its bytes are already record-bound.

Every value transcribed into the entry is to be verified field-by-field
against the committed snapshots (`data/sources/openrouter-models/latest.json`
and `data/changes.jsonl`) before it is written.


---

## Consumed: this candidate produced merged work

- date: 2026-09-13
- job: j-20260913-05 (repair)
- merged as: `87d3b9214cd255f308364edf9871e691d649207b`
- produced: `content/wiki/model/mistralai-codestral-2508-batch.md`, `content/wiki/model/mistralai-mistral-large-2512-batch.md`, `content/wiki/model/mistralai-mistral-medium-3-1-batch.md`
- was: `mistral-large-2512-batch-unretire.md` (slug `mistral-large-2512-batch-unretire`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
