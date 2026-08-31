---
date: 2026-08-31
slug: kimi-k2-5-entry-contradicts-its-own-feed
type: entry
summary: >
  Revise content/wiki/model/moonshotai-kimi-k2-5.md, whose prose is built on an
  expiration date the feed no longer carries. The entry opens "This row has a
  death date on it, which almost none do" and then transcludes
  {{fact:model/moonshotai-kimi-k2-5#expiration_date}}, which is feed-bound to
  openrouter-models `expiration_date` — a field that went from "2026-08-31" to
  null between the 2026-08-30 and 2026-08-31 snapshots. The built page now
  reads "this one reads not published". The same entry still declares
  status: deprecated in its front matter while the derived catalog row for the
  same model reads active, so the two surfaces disagree. The job re-anchors the
  opening on the entry's own cited api_sunset fact (Moonshot's platform sunset,
  sourced to platform.kimi.ai) rather than on the feed field that vanished, and
  decides — from sources, not from the feed alone — whether the front-matter
  status should still read deprecated.
evidence: >
  All of the following is committed state in this repository, measured on
  2026-08-31 (local date); I performed no network fetch, and the OpenRouter
  values below are the Pulse's own snapshots, not a fetch of mine.
  data/sources/openrouter-models/previous.json (its own "date" field:
  2026-08-30) carries row moonshotai/kimi-k2.5 with expiration_date
  "2026-08-31"; data/sources/openrouter-models/latest.json (date 2026-08-31,
  fetched_at 2026-08-31T06:00:03.897Z, url https://openrouter.ai/api/v1/models)
  carries the same row with expiration_date null. That transition is recorded
  in data/changes.jsonl under the key
  openrouter-models|7ddcd368c2b6d52e|13514954c61b0211|moonshotai/kimi-k2.5|status
  as status deprecated -> active, and this job's annotation line sits beside it.
  data/derived/catalog.json gives that row "status": "active";
  content/wiki/model/moonshotai-kimi-k2-5.md line 5 gives the entry
  "status: deprecated" and line 81 opens the body with the death-date sentence.
  Built locally with npm run build on 2026-08-31 (exit 0), the page
  out/wiki/model/moonshotai-kimi-k2-5.html renders
  data-field="expiration_date" data-state="absent" with the literal text "not
  published", beside a badge reading "deprecated".
expires: 2026-09-07
---

## What is wrong on the live page

The entry's first sentence and its first transclusion contradict each other:

> This row has a death date on it, which almost none do. Of the 388 rows in the
> OpenRouter snapshot of 28 August 2026, eight carry a non-null
> `expiration_date`; this one reads **not published**.

The bolded words are what `{{fact:model/moonshotai-kimi-k2-5#expiration_date}}`
now renders, because the bound row's `expiration_date` is `null`. Nothing is
broken mechanically — `lib/facts.mjs` resolves the fact to `absent` and prints
`not published`, exactly as the design says a missing value must — and the build
passes. The defect is editorial: the paragraph's whole point was the date, and
the date is gone.

## What is *not* wrong, and must survive the revision

Most of this entry is still true and is the reason it is worth revising rather
than rewriting:

- The `api_sunset` fact is **cited**, not feed-bound: `"2026-08-31 — full
  platform sunset; closed to newly registered users beforehand"`, sourced to
  `https://platform.kimi.ai/docs/models`, accessed 2026-08-28. OpenRouter
  clearing its own field says nothing about Moonshot's platform, and the entry
  already knows the difference.
- The body's central argument — that an open-weight retirement withdraws one
  company's hosting and not the artefact, because the weights are published
  under a Modified MIT License — is unaffected. It is arguably now better
  supported: the row is still listed and priced on a third-party router on the
  day the vendor's own platform closes.
- The count sentence ("Of the 388 rows in the OpenRouter snapshot of 28 August
  2026, eight carry a non-null `expiration_date`") is a dated historical claim
  about a specific snapshot and stays true. It should keep its date, not be
  silently refreshed.

## The status question the job has to answer

`content/wiki/model/moonshotai-kimi-k2-5.md` declares `status: deprecated`.
`data/derived/catalog.json` derives `status: "active"` for the same row. Both
render: `lib/render/entry.mjs` badges the front-matter value on the entry page
and in browse rows, while the catalog uses the derived one. So the site
currently says both things about one model, on different pages.

This is not automatically a bug in the machinery. The Pulse deliberately does
not rewrite an authored `status:` — `appendTimelineEvents` in
`pulse/lib/mint.mjs` appends a dated, sourced timeline event and stops there,
and the entry already carries the one it wrote (`date: "2026-08-31", event:
active`). Reconciling the authored field is exactly the judgment an `entry` job
exists to make, and it needs a source: a router dropping an expiry field is
weaker evidence about a model's lifecycle than Moonshot's own documentation,
which says the platform sunsets today.

## Done when

- The opening paragraph no longer depends on a feed value that is now absent,
  and does not silently drop the fact that the row *had* an expiry — the
  withdrawal on the due date is the more interesting fact than the expiry was.
- Any date or count in the revised prose is either a cited fact with its own
  `accessed` date or a transclusion, per the entry's existing pattern. No bare
  literal replaces the transclusion.
- The front-matter `status:` is either changed with a named source justifying
  it, or deliberately left at `deprecated` with the body saying why the
  catalog and the entry differ. Silently leaving the two to disagree is the
  one outcome that fails.
- The two `2026-08-31` timeline events (Moonshot's sunset, and the Pulse's
  `active`) are both still present and legible as the two different things
  they are.

## Why this carries an expiry rather than cooling

The framing above is read off one snapshot pair. `previous.json` rotates on the
next Pulse run, and the row can move again — the expiry could return, the price
could move, the row could vanish and take the facts to last-known-value
rendering. If nobody picks this up within a week, the honest move is to
re-derive it from whatever state exists then, not to run it from a description
of 2026-08-31.
