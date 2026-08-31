---
date: 2026-08-31
slug: anthropic-usage-policy-pentagon-ruling
type: post
rank: 1
summary: >
  On 2026-08-28 a federal judge struck down the Pentagon's designation of
  Anthropic as a national-security supply-chain risk, finding it was retaliation
  for Anthropic's public refusal to drop two usage-policy restrictions. Every
  outlet reported the ruling; none of the coverage retrieved in this sweep quoted
  the policy itself. Write the piece that puts the actual documents side by side:
  the Usage Policy clauses on surveillance, weapons and law enforcement, and
  Anthropic's own published "Exceptions to our Usage Policy" page — which already
  grants government entities one named carve-out, "foreign intelligence analysis
  in accordance with applicable law", under five published criteria, and only for
  ASL-2 models. The non-obvious finding is that the fight was never over whether
  Anthropic grants governments exceptions. It grants them, in public, with a
  documented test. The fight was over which ones, and a court has now said that
  punishing the refusal was unconstitutional.
evidence: >
  All URLs below were retrieved during this scout run on 2026-08-31 (local date).
  Anthropic Usage Policy, https://www.anthropic.com/legal/aup — fetched
  2026-08-31, effective date on the document 2025-09-15; the surveillance,
  weapons and law-enforcement clauses quoted in the body come from this fetch.
  Anthropic Help Center, "Exceptions to our Usage Policy",
  https://support.claude.com/en/articles/9528712-exceptions-to-our-usage-policy —
  fetched 2026-08-31, page states last updated 2026-03-16; the named exception,
  the five eligibility criteria and the ASL-2 scope limit come from this fetch.
  NOTUS, "Judge Says Pentagon Illegally Blacklisted Anthropic",
  https://www.notus.org/courts/judge-says-pentagon-illegally-blacklisted-anthropic
  published 2026-08-28 10:19 a.m., fetched 2026-08-31 — the judge's name, the
  ruling date and the quoted line from the opinion. Search results retrieved
  2026-08-31 additionally surfaced NBC News
  (https://www.nbcnews.com/business/business-news/anthropic-pentagon-blacklist-claude-judge-rcna594825),
  Axios (https://www.axios.com/2026/08/28/judge-blocks-pentagon-anthropic-blacklist),
  CNBC (https://www.cnbc.com/2026/08/28/judge-blocks-pentagon-blacklist--anthropic-.html),
  Gizmodo and Quartz on the same ruling, and Mayer Brown, Goodwin and Taft Law
  client alerts on the original designation; CRS product IN12669
  (https://www.congress.gov/crs-product/IN12669) returned HTTP 403 to direct fetch
  on 2026-08-31 and is recorded here as an unfetched pointer only.
expires: 2026-09-07
proposed_by_job: j-20260831-03
proposed_by_type: scout
---

## Why now

The ruling is three days old (2026-08-28) and the government is expected to
appeal, which means the documents are current and the story has a next move. The
window is short for the reason every news note's window is short: within a week
this is either superseded by an appeal filing or it is old. That is why this
carries an `expires:` rather than cooling.

## The angle, stated so a reviewer can check it

Not "a judge ruled against the Pentagon" — that ran everywhere on the day.

The claim is narrower and document-based: **the coverage retrieved in this sweep
describes Anthropic's restrictions in paraphrase, and the paraphrase understates
what is actually published.** Anthropic's Usage Policy is public, dated, and
quotable; so is a separate Help Center page that documents how a government
entity gets an exception to it. Reading the two together changes the shape of
the dispute from "AI company refuses to work with the military" to "AI company
publishes a test for government exceptions, applies it, and is punished for the
answer."

## The documents, as retrieved

From `https://www.anthropic.com/legal/aup` (fetched 2026-08-31; the document
carries an effective date of 2025-09-15), verbatim:

> Target or track a person's physical location, emotional state, or
> communication without their consent, including using our products for facial
> recognition

> Design or develop weaponization and delivery processes for the deployment of
> weapons

> Utilize models as part of any law enforcement application that violates or
> impairs the liberty, civil liberties, or human rights of natural persons

From `https://support.claude.com/en/articles/9528712-exceptions-to-our-usage-policy`
(fetched 2026-08-31; page states last updated 2026-03-16): the page names **one**
exception — *"foreign intelligence analysis in accordance with applicable law"* —
available to "carefully selected government entities" that meet five stated
criteria: model suitability for the proposed uses, the agency's legal
authorities, willingness to engage in ongoing dialogue with Anthropic,
safeguards preventing misuse, and independent democratic oversight including
legislative or regulatory constraints. The page further states the exceptions
policy **currently applies only to ASL-2 models** under the Responsible Scaling
Policy — a scope limit that appears in none of the coverage retrieved in this
sweep, and that is the sort of detail a reader who follows this cannot get
anywhere else without opening the page themselves.

From NOTUS (published 2026-08-28, fetched 2026-08-31): U.S. District Judge Rita
F. Lin found that Defense Secretary Pete Hegseth's supply-chain-risk designation
violated Anthropic's First Amendment and Fifth Amendment due-process rights,
writing:

> The empty invocation of national security is not a blank check to punish and
> retaliate against government critics.

## What is NOT established and must not be published unchecked

- The **59-page** length of the opinion, the finding that officials sought to
  "make a public example out of Anthropic", and the attribution of statements to
  President Trump appear in search-result summaries of NBC News and Quartz
  retrieved 2026-08-31. They were not confirmed against a fetched article and
  must be either fetched or dropped.
- The background — a **July 2025** Pentagon contract making Claude the first
  frontier model approved for classified networks with the Pentagon agreeing to
  abide by the AUP; the Pentagon's demand for use "for all lawful purposes"; a
  **2026-03-26** preliminary injunction in the Northern District of California —
  comes from search summaries of a CRS product and law-firm alerts, retrieved
  2026-08-31. The CRS page 403'd. Every date in that chain needs a fetched source
  or it does not appear.
- The AUP text retrieved does not contain the phrase "fully autonomous weapons"
  or "mass domestic surveillance"; those are the *coverage's* words for the
  dispute. The post must not put them in quotation marks as policy text. If the
  distinction between the published clauses and the demanded changes cannot be
  pinned to a source, say so — that gap is itself worth a sentence.

## Done when

- The post quotes the Usage Policy and the exceptions page from fetches
  performed during the authoring job, with those retrieval dates and both
  document dates (2025-09-15 effective, 2026-03-16 last updated) stated in the
  body — not copied from this proposal.
- The ASL-2 scope limit and the five eligibility criteria appear in the body. A
  version of this post that reports the ruling without the exceptions page is
  the summary that already exists and should be rejected.
- The distinction between what the AUP says and what the parties are reported to
  have argued about is explicit. No paraphrase is set in quotation marks.
- At least one account of the ruling is fetched directly and the quoted line is
  confirmed against it; anything carried only by a search summary is either
  fetched or omitted, not hedged.
- The piece states plainly that Anthropic is a party with an interest and that
  the ruling is subject to appeal, and it does not characterise the merits of
  the underlying policy dispute — the story is what the documents say and what
  the court held, not who is right about autonomous weapons.
- The would-send answer is articulable: anyone who drafts or relies on an AI
  acceptable-use policy sends this to whoever negotiates their enterprise terms,
  and anyone selling AI into government sends it to their counsel.

---

RETIRED 2026-08-31 by the orchestrator, by hand, because the loop has no
mechanism to do it. Selected, written, reviewed and merged as job j-20260831-06.
The post is `content/blog/anthropic-usage-policy-government-exceptions.md`.

Left in place it stays selectable until its `expires:` date, and the loop
rewrites the same post on every run until then. `readProposals` reads
top-level `.md` only, so this subdirectory removes it from selection;
`consumed/` because `dropped/` (the scout declined it) and `rejected/`
(same-type discard) would both misdescribe what happened.
