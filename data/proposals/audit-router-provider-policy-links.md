---
date: 2026-09-06
slug: audit-router-provider-policy-links
type: verify
summary: >
  Fetch every row of OpenRouter's public provider registry
  (`https://openrouter.ai/api/v1/providers`, 106 rows on 2026-09-06) and record,
  per provider, whether the `privacy_policy_url` and `terms_of_service_url` it
  publishes actually resolve, and what country its `headquarters` field claims.
  The output is a dated table of which inference providers a router will send
  your prompts to have a working data-retention policy behind the link the
  router shows you, and which do not. Nothing in this corpus reads that endpoint
  today; the catalog joins on the models endpoint only. The job would file the
  result as data plus one short prose surface, and would NOT chase down why any
  individual link is broken — it records status codes and final URLs, nothing
  more.
evidence: >
  Measured on 2026-09-06 while writing `org/aion-labs`.
  (1) `https://openrouter.ai/api/v1/providers` returned 24,609 bytes and 106
  provider records, each carrying `name`, `slug`, `privacy_policy_url`,
  `terms_of_service_url`, `status_page_url`, `headquarters` and `datacenters`.
  (2) The `aion-labs` record publishes
  `privacy_policy_url: "https://www.aionlabs.ai/privacy-policy/"`, which returned
  HTTP 404 (179 bytes) when requested the same day; the policy the vendor's own
  footer links, `https://www.aionlabs.ai/privacy/`, returned 200 (21,580 bytes).
  A reader following the router's link to find out what happens to their prompts
  reaches a dead page and gets no signal that a live one exists.
  (3) The same record gives `headquarters: "IL"`, while that vendor's terms of
  service name Deep Forge sp. z o.o. (NIP: 1231533694) and are governed by the
  laws of the Republic of Poland
  (`https://www.aionlabs.ai/terms/`, fetched 2026-09-06).
  One provider out of 106 is one sample; the point of the job is that nobody has
  taken the other 105.
---

This is a live derived view of a thing that is published, machine-readable, and
checked by nobody — the third clause of `specs/editorial`'s "gives an enthusiast
something", and the one this site is structurally best placed to serve. The
router already tells you which provider serves a model. It does not tell you
whether the policy link it prints for that provider goes anywhere, and the one
case measured here says the answer is sometimes no.

Scoped deliberately narrow, because the broad version is a different and much
worse job. **Not** in scope: reading the policies and summarising what they say
(that is 106 legal documents and a defamation-adjacent judgment per row);
deciding whether a `headquarters` code is "wrong" (a company can be headquartered
somewhere other than where its terms choose a forum, and the two disagreeing is a
finding to record, not a contradiction to adjudicate); or contacting anyone.
In scope: request each URL, record the status code and final URL after redirects,
record the declared country, and publish the table with the date it was taken.

The reason it is `verify` and not `machinery`: the value here is the measurement,
not a new source binding. If the table turns out to be worth keeping current, the
follow-on — registering the providers endpoint as a tracked Pulse source so the
policy links join the changed feed — is its own `machinery` job with its own
argument, and should not be smuggled into this one.
