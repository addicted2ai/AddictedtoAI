---
date: 2026-09-01
slug: stale-status-divergence-example-in-build-comment
type: machinery
summary: >
  lib/build-content.mjs names model/moonshotai-kimi-k2-5 as its worked example
  of "an entry WITH a reviewed prose body keeps its authored `status:` even
  when it disagrees with the feed" — the body "argues, sourced, that
  Moonshot's own retirement notice outweighs a feed row whose expiry OpenRouter
  has since cleared". Job j-20260901-14 just removed that very disagreement:
  the entry's `status:` now reads `active`, matching the derived catalog, and
  its body no longer argues the vendor outweighs the router. The mechanism the
  comment documents is unchanged and still needed (a prose entry MAY keep an
  authored status that diverges from its feed — the capability is real), but
  its one concrete illustration is now false on the only page it names. The
  job: update or drop the worked example so the comment's illustration matches
  a divergence that still exists, rather than one this repair retired.
evidence: >
  lib/build-content.mjs:141-147 (read 2026-09-01) names
  model/moonshotai-kimi-k2-5 as the divergence example; the same day's repair
  (branch job/j-20260901-14) changed content/wiki/model/moonshotai-kimi-k2-5.md
  `status:` from deprecated to active and rewrote the paragraph that argued the
  vendor's "Deprecated Models" filing outweighed the router's cleared expiry.
  data/derived/catalog.json still carries {"entry_id":"model/moonshotai-kimi-k2-5",
  "expiration_date":null,"status":"active"} for the row the comment's example
  describes. The stale comment is cosmetic, but this corpus treats its
  machinery headers as specification (the comment is the design record for the
  presented-status resolution, addictedtoai-ij4h), so an illustration naming a
  page that no longer exhibits the behavior is a finding, not a nit.
---

The presented-status resolution in `lib/build-content.mjs` (addictedtoai-ij4h)
keeps a reviewed prose entry's authored `status:` even when it disagrees with
a bound feed — deliberately, because that disagreement can be the entry's own
argued point rather than a stale hand-typed value. The comment needs a live
example to justify that asymmetry, and `moonshotai-kimi-k2-5` was it.

This job (j-20260901-14) was that disagreement. The entry's front matter
declared `status: deprecated` while the catalog — derived from the same
OpenRouter row the entry is bound to — read `active`, and the body argued the
vendor's retirement notice should win. The repair reconciled them the other
way: the status now follows the router's row. Which means the only page the
comment names as the divergence case no longer diverges, and a reader of the
comment going to look at the example will find it agreeing with the feed.

The rule itself should not change — nothing here argues the machinery is
wrong, and the capability to hold a reviewed divergence is what let this
entry make its (temporary) point. The comment's example is the stale half.
The proposed machinery job: pick an entry that still exercises the divergence
today, or drop the concrete name and keep the abstract rationale. It is a
comment-only edit in `lib/` (not a reserved path), small, and verifiable by
`npm test` and a build.
