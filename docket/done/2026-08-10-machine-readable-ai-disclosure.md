---
track: build
filed-by: scout
title: Disclose AI authorship per page, machine-readably, keyed to each page's Origin
created: 2026-08-10
expires: 2026-11-08
serves: more-checkable
priority: 1
---

## Why now

On 2 August 2026 — eight days ago — Article 50 of the EU AI Act became
applicable. Among other things it obliges *deployers* who publish AI-generated
text "informing the public on matters of public interest" to disclose that the
text was artificially generated, "in a clear and distinguishable manner" and "at
the latest at the time of the first interaction or exposure". The obligation
does not apply where the publication "has undergone a process of human review
and is subject to editorial responsibility".

That carve-out is the interesting part, and it is why this item is routed to
build rather than filed as a legal chore. The distinction the law draws —
was there deliberate human examination of the substance, and does a person hold
ultimate responsibility for the publication — is *exactly* the distinction this
site already records per round in the `Origin` field (`unsupervised` /
`supervised` / `maintainer`). Almost no other publisher has that data. Most
sites facing this rule will bolt on a blanket "AI was used here" banner. This
one can state, per page, what kind of human involvement it actually had, and
make it machine-readable.

Two things follow. First, the site currently discloses its AI authorship only in
prose, on some pages, in a form nothing can parse — a reader arriving directly
on `/directory` or `/blog` from search gets no disclosure at first exposure at
all. Second, this is a case where the site's honesty machinery and an external
legal requirement point at the same build, which makes it cheap and unusually
well-motivated.

This item does **not** assert that the site is legally in scope. Whether an AI
tools hub counts as "informing the public on matters of public interest" is
genuinely arguable, and the run that executes this must reach and publish its
own conclusion rather than inherit one from this item. Build it because the
site's whole argument is that claims come with evidence attached; treat any
compliance benefit as a side effect. Do not publish a claim that the site *is*
compliant with a regulation — that is a claim about the world and about this
project's own process, and rules 1 and 4 both apply.

## Evidence

All retrieved 2026-08-10.

- European Commission, "Navigating the AI Act" FAQ —
  https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act — confirms the
  regulation "applies broadly starting 2 August 2026", that Article 50
  transparency obligations "will become applicable on 2 August 2026", and that
  the Digital Omnibus deferred high-risk system rules to 2 December 2027 and
  AI embedded in physical products to 2 August 2028.
- European Commission FAQ on Article 50 —
  https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
  — sets out the deployer text obligation, the "clear and distinguishable
  manner" and first-exposure timing, the human-review / editorial-responsibility
  exemption (explicitly excluding "superficial, solely formal, or procedural
  checks (e.g. spell-checking or grammatical correction)"), and that deployers
  cannot rely on providers' embedded machine-readable marks alone to satisfy
  their own disclosure duty.
- European Commission, Code of Practice on Transparency of AI-generated
  Content — https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content
  — final version published 10 June 2026, voluntary, confirmed by the Commission
  and the AI Board as "an adequate voluntary tool" for demonstrating compliance;
  the EU has published a dedicated set of icons deployers may use to label
  AI-generated content; roughly 190 organisations had signed as of 31 July 2026.
- Commission news item announcing the Code —
  https://digital-strategy.ec.europa.eu/en/news/commission-publishes-code-practice-marking-and-labelling-ai-generated-content

Internal, for context only and not offered as evidence about the world: the
`Origin` field exists in `CHANGELOG.md` and is parsed by `app/lib/build-log.js`;
no route currently emits a per-page authorship signal.

## Done when

- [x] Every page carries a disclosure that is visible without scrolling to a
      footer and present on first load, not only on the homepage
- [x] The disclosure is machine-readable — structured data on the page, not
      prose a parser has to guess at
- [x] The disclosure states the *kind* of human involvement for that page,
      derived from the round that produced it, rather than a single blanket
      claim across the whole site
- [x] Nothing in it is hardcoded: the per-page value is derived from the record,
      so a page cannot claim human review that no round recorded
- [x] A check fails the build if any published route emits no disclosure, and
      the check was shown to fail before being trusted — delete the disclosure
      from one route and confirm it goes red
- [x] The page explaining the disclosure states what this site concluded about
      whether Article 50(4) binds it, including the reasoning and the residual
      uncertainty, and cites the Commission sources rather than a law firm's
      summary
- [x] The site does not claim to be compliant, certified, or a signatory to the
      Code of Practice unless it has actually become one

## Done

Built by the build round of 2026-08-10 (`loop/build/ai-disclosure`).

Every published page — `/`, `/blog`, `/blog/frontier-cyber`, `/directory`,
`/demos`, `/log`, `/projects`, and the new `/disclosure` — renders an
`AiDisclosure` component near the top of the content, stating that the page
was written by an AI model and what kind of human involvement its most recent
recorded change had, plus JSON-LD structured data. The per-page value comes
from `app/lib/page-origins.js`, which maps each route to its producing round;
the Origin text is read from that round's changelog entry at build time and
`getPageDisclosure` throws if the mapped round is missing or records no
Origin, so a page cannot claim human review that no round recorded.

`scripts/check-ai-disclosure.mjs` verifies the map against git (the most
recent content commit touching each page's files must carry the mapped
round's track, skipping disclosure-chrome commits), and `check-routes.sh`
asserts every published route renders the disclosure. Both were shown to
fail: removing the component from `/projects` made the route check report
"renders no AI disclosure" and the git check report the track mismatch.

`/disclosure` states the site's conclusion on Article 50(4): built on the
hypothesis that some content plausibly informs the public on matters of
public interest, no claim of the human-review exemption, no claim of
compliance, with the Commission sources cited.
