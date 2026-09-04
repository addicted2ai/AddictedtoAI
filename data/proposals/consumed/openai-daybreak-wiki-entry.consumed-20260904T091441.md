---
date: 2026-09-04
slug: openai-daybreak-wiki-entry
type: entry
summary: >
  A wiki entry for OpenAI Daybreak, the access program that gates frontier
  cyber-model capability: Daybreak Blue for common defensive work with
  mainline models, Daybreak Red for approved organizations using specialized
  cyber models, the $1 billion Daybreak for Frontline Defenders commitment of
  3 September 2026, the MS-ISAC pilot, the Daybreak Defense Network's partner
  products, and the 2,000 approved organizations already using it. The corpus
  has no identity record for the program: the 2026-09-03 Critical-designation
  post names Daybreak Blue, the Astra release page names Daybreak as the
  channel for less restrictive safeguards, and the Daybreak for Frontline
  Defenders post reports the $1B commitment, each restating the standing facts
  with nowhere to put them.
evidence: >
  OpenAI, "Daybreak for Frontline Defenders: $1B to protect essential
  services", fetched 2026-09-04 —
  https://openai.com/index/daybreak-for-frontline-defenders/ (dated 3
  September 2026; "Daybreak Blue supports common defensive work with our
  mainline models; Daybreak Red gives approved organizations access to
  specialized cyber models for more sensitive and technically demanding
  work"; "Thousands of defenders across 2,000 approved organizations and
  workspaces already use Daybreak"). `grep -rl "Daybreak" content/` on this
  branch returns exactly the two blog posts
  (content/blog/openai-astra-critical-designation.md and
  content/blog/openai-daybreak-frontline-defenders.md) and no wiki file.
expires: 2026-09-11
proposed_by_job: j-20260904-03
proposed_by_type: post
---

The Daybreak program is where OpenAI deploys its frontier cyber capability, and
the corpus keeps touching it without a record for it. The Critical-designation
post quotes Daybreak Blue as the defensive-access channel; the Astra release
page says less restrictive safeguards roll out "through OpenAI Daybreak"; the
Daybreak for Frontline Defenders post reports the $1B commitment, the MS-ISAC
pilot and the Defense Network. Each of those posts would benefit from an
identity layer to reference rather than restate. A `concept` or `org` entry
for the program, with the Blue/Red split, the front-line-defenders commitment
and the 2,000-organization base as feed-bound or cited facts, is the natural
home. The sibling proposal `astra-wiki-entry-and-critical-threshold` covers the
model; this one covers the program that gates it.

---

## Consumed: this candidate produced merged work

- date: 2026-09-04
- job: j-20260904-06 (entry)
- merged as: `1fd5c7ce6e2b63700f66108a19c9e9fcd18ed7ed`
- produced: `content/wiki/concept/openai-daybreak.md`
- was: `openai-daybreak-wiki-entry.md` (slug `openai-daybreak-wiki-entry`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
