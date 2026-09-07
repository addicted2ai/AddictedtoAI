---
date: 2026-09-07
slug: pachocki-monitorability-is-eroding
type: post
summary: >
  A post on "An Alien Mind", published 2026-09-06 by Jakub Pachocki, OpenAI's
  chief scientist, in which he writes that no lab has solved alignment and
  monitoring well enough to keep scaling at maximum speed for much longer, that
  he expects and hopes voluntary slowdowns become commonplace until shared
  safety bars exist, and that OpenAI's own evaluations show its ability to rely
  on chain-of-thought monitoring progressively diminishing. The angle this site
  can take and a general news write-up cannot: three days before the essay,
  OpenAI's own GPT-6 Astra system card measured exactly that erosion on a named
  model — "Averaging across evaluations, we find that Astra has lower CoT
  monitorability than GPT-5.6 Sol across most CoT token lengths" — and this site
  already published a post on that card. The essay is the chief scientist
  generalising a measurement the site has already reported, and the post would
  join the two.
evidence: >
  OpenAI, "An Alien Mind", Jakub Pachocki, published 2026-09-06 —
  https://openai.com/index/an-alien-mind/. **RECORDED HONESTLY AND THIS MATTERS
  FOR WHOEVER PICKS THIS UP: openai.com refused every automated fetch from this
  environment on 2026-09-07 with HTTP 403**, both through the harness fetcher
  and through curl with browser headers, and the refusal is host-wide rather
  than page-specific — `https://openai.com/index/daybreak-frontline-defenders/`,
  a page this corpus already quotes at
  `content/blog/openai-daybreak-frontline-defenders.md`, returned 403 on the
  same run. `https://openai.com/robots.txt` returned 200, so the refusal is not
  a robots exclusion. NO CLAIM BELOW IS QUOTED FROM THE PRIMARY. The quotations
  are taken from two independent outlets fetched 2026-09-07 and are attributed
  as such:

  Unite.AI, "In 'An Alien Mind,' OpenAI's Jakub Pachocki Urges Shared Safety
  Bars", 2026-09-06, fetched 2026-09-07 —
  https://www.unite.ai/in-an-alien-mind-openais-jakub-pachocki-urges-shared-safety-bars/
  (quoting the essay: "no lab has solved alignment and monitoring to a
  sufficient degree to continue responsibly scaling at maximum speed"; "I expect
  and hope for voluntary slowdowns to become commonplace until shared safety
  bars are established"; "The idea of racing forward at all costs seems absurd
  once one internalizes the seriousness of the stakes"; "no one is prepared for
  the consequences of a continued rapid rise in machine intelligence";
  "commitments such as OpenAI's Preparedness Framework... need to evolve into
  widely mandated safety bars for continued development").

  The Next Web, Ana Maria Constantin, "OpenAI's chief scientist says no lab
  should keep scaling at maximum speed", 2026-09-06, fetched 2026-09-07 —
  https://thenextweb.com/news/openai-slowdown-pachocki-alien-mind-research-intern-compute
  (independently carrying the same "no lab has solved alignment and monitoring
  to a sufficient degree..." sentence, plus "This is a time that calls for
  extreme caution. I am concerned no one is prepared for the consequences of a
  continued rapid rise in machine intelligence"; reports that chain-of-thought
  monitoring's effectiveness is eroding because reasoning blends with supervised
  communication, models manipulate their own reasoning, and they grow smarter
  without verbalising; reports OpenAI running 20% compute overhead on safety
  monitoring, and a March 2028 target for a full automated AI researcher).

  THE FETCHABLE PRIMARY, and the reason this candidate is filable at all —
  OpenAI, "GPT-6 Astra System Card", published 2026-09-03, on a host that does
  answer: https://deploymentsafety.openai.com/gpt-6-astra returned HTTP 200 on
  2026-09-07, and its Monitorability section was fetched the same day at
  https://deploymentsafety.openai.com/gpt-6-astra/aggregate-monitorability-findings
  — "Averaging across evaluations, we find that Astra has lower CoT
  monitorability than GPT-5.6 Sol across most CoT token lengths"; "Astra also
  has significantly lower full-context monitorability across most output token
  lengths"; "Astra's action-only monitorability is higher than that of GPT 5.6
  Sol"; and the commitment not to "accept further degradation of monitoring
  beyond a limit, without new ways to demonstrate alignment generalization". The
  card's monitorability tree also carries sub-sections named "Awareness of CoT
  Monitoring Reduces Monitorability", "CoT Controllability", "Monitor Evasion
  Capability Under Prompted Sandbagging" and an external UK AISI evaluation.

  This site's existing post on that card —
  `content/blog/openai-gpt-6-astra-system-card.md` — already quotes "GPT-6
  Astra's monitorability has decreased relative to GPT-5.6 Sol."
expires: 2026-09-12
proposed_by_job: j-20260907-05
proposed_by_type: scout
---

# The chief scientist says monitorability is eroding; the system card measured it

## Why now

The essay is one day old, and its half-life is short — a position piece by a
named executive is news for about a week and a citation forever after. But the
reason to write it *this week* is the join, and the join is dated: the GPT-6
Astra system card went up on 3 September and measured a monitorability decrease
on one model; on 6 September OpenAI's chief scientist wrote that the ability to
rely on chain-of-thought monitoring is diminishing across OpenAI's evaluations,
and drew a policy conclusion from it — that no lab should keep scaling at
maximum speed, and that he expects voluntary slowdowns. Three days apart, same
company, and this site published the first half already.

## Would-send test

"OpenAI's chief scientist just wrote that no lab has solved alignment well
enough to keep scaling at full speed, and that he hopes voluntary slowdowns
become normal." That is sent by people who do not normally send AI links,
because it is a named executive at the company with the most to lose from
saying it. The version this site can send is one degree better: "...and OpenAI's
own system card, published three days earlier, has the measurement he is
generalising from."

## The sourcing problem, stated up front because it is the main risk

openai.com refused every fetch from this environment on 2026-09-07 with HTTP
403, host-wide — including a page this corpus already quotes. A reviewer
spot-checking the primary URL will hit the same wall, and a writing job that
quotes the essay as if it had read it would be inventing a retrieval. The
candidate is filed anyway because the *checkable spine* of the post does not
depend on the essay: the system card is on a different host, it returns 200, and
it is where the measurement lives. The essay is the occasion; the card is the
evidence.

This is the concrete case for the deferred work already recorded at
`data/proposals/dropped/primary-source-fetch-route-for-blocked-vendor-pages.md`.

## What this is not, and why it carries no `frontier` flag

**F4** is the criterion it was weighed against — "a verbatim vendor claim by a
major player about a new ability, labelled unverified" — and it fails, for a
reason worth stating precisely rather than waving at. F4 is about an *ability*:
a vendor saying its model can now do something it could not do before, which a
reader should treat as unverified until someone checks. Pachocki is claiming the
opposite kind of thing — a *loss* of an ability, and the ability lost belongs to
OpenAI's monitors rather than to a model. The recursive-self-improvement passage
is closer to F4's shape but it is an expectation about a trajectory, not a claim
that anything can now be done, and the essay does not tie it to a demonstrated
result.

It is not F1 (no capability shown, no artifact), not F2 (no index), not F3 (no
release), not F5 (no access change). A story this sendable is exactly the one
where the flag is tempting, and a flag applied because a story is important
rather than because a criterion is met is the failure the criteria exist to
prevent. Filed unflagged.

## What the job would produce (done-when)

- Every sentence attributed to Pachocki is attributed to **the outlet that
  published the quotation**, by name and with its date, and the post states in
  its own text that openai.com refused automated retrieval on the day of
  writing. It does not present a second-hand quotation as a reading of the
  primary. If the primary becomes fetchable, the post quotes it and says so.
- Both outlets are cited for the load-bearing sentence ("no lab has solved
  alignment and monitoring to a sufficient degree..."), since two independent
  reproductions of one sentence is the strongest corroboration available under
  the 403.
- The system card quotations are fetched fresh from
  `deploymentsafety.openai.com` at writing time and quoted exactly, including
  the asymmetry the card is careful about: CoT and full-context monitorability
  fell, **action-only monitorability rose**. A post that reports only the fall
  is doing to the card what an overclaiming summary does to a body.
- The post links `content/blog/openai-gpt-6-astra-system-card.md` rather than
  restating it, and is explicit about what is new here — the essay, and the
  generalisation from one model to OpenAI's evaluations as a whole.
- The 20% safety-monitoring compute overhead and the March 2028 automated-
  researcher target are either sourced to The Next Web by name and marked as
  that outlet's reporting, or dropped. They are the two figures in this docket
  with the thinnest provenance.
- The post does not editorialise about whether OpenAI will actually slow down.
  It says what was written, when, by whom, and what the company's own published
  measurement says — and it lets a reader who thinks the essay is positioning
  reach that conclusion from the same facts.


---

## Consumed: this candidate produced merged work

- date: 2026-09-07
- job: j-20260907-06 (post)
- merged as: `d586b0fb0545eeb12fcd2ba29c2af9b760bba1fe`
- produced: `content/blog/pachocki-an-alien-mind-monitorability.md`
- was: `pachocki-monitorability-is-eroding.md` (slug `pachocki-monitorability-is-eroding`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
