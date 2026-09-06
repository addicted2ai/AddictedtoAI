---
title: "Anthropic will put Claude misuse logs in your own bucket. Its support pages say what it keeps."
date: "2026-09-06"
anchor:
  url: "https://www.anthropic.com/news/enterprise-frontier-safeguards"
  date: "2026-09-01"
mentions:
  - org/anthropic
  - model/anthropic-claude-fable-5
  - model/anthropic-claude-fable-5-1
---

On 1 September 2026 Anthropic announced Enterprise Frontier Safeguards, which it
describes on its own news page as "a solution that combines the privacy of zero
data retention (ZDR) with state-of-the-art safeguards for detecting misuse."
The mechanism is one sentence: "EFS works by storing data in cloud
infrastructure controlled by the customer, not Anthropic." Automated systems
"analyze a rolling window of traffic for signals of serious misuse, including
attempts to develop offensive cyber or biological capabilities and signs of
stolen or leaked credentials." When something fires, "those flags go directly to
the customer and their people take it from there." Nothing ships yet. The page
says EFS "will be rolling out to customers in phases, starting later this fall."

That page is the announcement. Two Anthropic support pages, both updated in the
same week, are the terms — and they are where the interesting sentences are.

## If you run a ZDR workspace, you have already been locked out for three months

The affected party is not "enterprises" in general. Anthropic's support article
on retention names it exactly: the policy applies to "organizations that have set
up workspaces with zero data retention (ZDR) in Claude Console, use Claude Code
with ZDR in Claude Enterprise, or access Claude through AWS Bedrock, Google Cloud
Agent Platform, or Microsoft Foundry with ZDR." Consumer plans are untouched.
Everyone else already had retention on.

For that group the Covered Models page is blunt: "Accordingly, zero data
retention is not available in workspaces, Claude Enterprise organizations, or
third-party platforms (e.g., Azure Subscriptions) where Covered Models can be
accessed." The fallback it offers is to stay behind — "Customers who are eligible
for zero data retention can continue to use prior Claude models under their
existing settings and agreements."

That page dates the lockout. Claude Fable 5 and Mythos 5 were designated Covered
Models on **9 June 2026**; Fable 5.1 and Mythos 5.1 on 31 August 2026. The
retention article states the same effective date in its own words: "This policy,
described below, goes into effect on June 9, 2026." So a bank with a ZDR
workspace has had a choice between Anthropic's current top model and its
retention posture for coming up on three months, and EFS does not end that this
week. It ends it whenever "later this fall" turns out to mean.

## What moves is custody. What stays is the judgment.

The news page is precise about the relocation and worth reading closely for what
it attaches to which verb. Activity data "can be stored in the customer's own
cloud account (such as Amazon S3, Azure Blob Storage, or Google Cloud Storage)."
Customers get data "in infrastructure they control, under their own encryption
keys, access policies, and audit logging." And "EFS has automated safety
monitoring, no Anthropic human review required."

None of that is the whole system, and Anthropic says so somewhere else. The
Covered Models page carries a sentence the news page does not:

> This arrangement affects only the retention and review of stored data. The
> Usage Policy, real-time safety classifiers, and Anthropic's enforcement
> systems continue to apply to all traffic, and Anthropic may modify or withdraw
> the arrangement, including in response to misuse.

Read against the news page, that draws the line cleanly. The bucket, the keys,
the access policy, the audit log and the human reviewer move to the customer.
The Usage Policy, the classifiers, the definition of serious misuse and the
enforcement stay with Anthropic — as does the right to end the arrangement. Wells
Fargo's CISO Munish Kumar Sharma puts it in the vendor's own press quote, and it
is the most accurate sentence on the page: "We keep custody of our data while
Anthropic operates the detection."

Note also that this is not one product but three switches. "Customer-owned
storage, Customer-Managed Encryption Keys, and fully automated review are each
opt-in, so you enable the ones your organization needs." A customer who enables
one and not the others gets a materially different arrangement, and the page does
not say which combinations are permitted.

## The gap between the announcement's ZDR promise and the support page's

The news page gives the interim commitment one clause: "eligible customers will
receive ZDR on Fable 5 and Fable 5.1 until EFS is ready." The Covered Models page
gives the same commitment three qualifiers the announcement omits.

> To make the transition smooth, eligible customers will receive the option to
> use ZDR with Fable 5 and Fable 5.1 for their own internal business
> applications. This arrangement is available for a limited time, and intended to
> be a transition to EFS. Anthropic or your cloud provider will contact eligible
> organizations directly; you can also request consideration using this form.

It is an option rather than a grant. It is scoped to "their own internal business
applications." And it arrives by someone contacting you, or by you applying. If
you are building a product on Fable 5 for your own customers, the next sentence
is the one that governs you, and it points somewhere else entirely: "Certain
products built on Claude may extend the option to use ZDR with these models to
their own eligible business customers under terms agreed with Anthropic."
Separate terms, negotiated separately.

## The question three documents do not answer between them

Anthropic's stated reason for retaining data at all is that per-request analysis
is insufficient. From the news page: "it is not sufficient to run automated
analysis on each interaction separately and then instantaneously discard the
data. Effective detection requires storing data for a meaningful period of time
so that it can be correlated across time and accounts." The retention article
gives the worked example, best-of-N jailbreaking, where hundreds of prompt
variants only look like an attack in aggregate.

Under EFS the correlated window sits in the customer's account and the flags go
to the customer. The Usage Policy and the real-time classifiers still apply to
all traffic — but real-time per-request classification is the exact layer
Anthropic just called insufficient for sophisticated misuse. So what reaches
Anthropic when the misuse is the kind only the stored window reveals, and the
stored window belongs to the party doing it? None of the three pages says.
The Covered Models page reserves the right to withdraw the arrangement "in
response to misuse" without saying how such misuse would come to Anthropic's
attention. Help Net Security, covering the launch on 2 September, noticed an
adjacent hole: Anthropic never states how long the rolling window runs.

For a compliance team this is not a reason to walk away. It is the question to
put to the account team before signing, alongside the one about which of the
three opt-ins your regulator will actually accept.

## The documents

The news page and both support pages were fetched on 6 September 2026 and every
sentence quoted above was confirmed present in the fetched bytes. Where the
vendor page and secondary coverage differ on the date, the vendor page is what is
quoted here: it carries "Sep 1, 2026", while Help Net Security's report is dated
2 September 2026.

- Anthropic, *Developing Enterprise Frontier Safeguards with our customers*,
  page dated 1 September 2026 —
  [anthropic.com](https://www.anthropic.com/news/enterprise-frontier-safeguards)
- Anthropic Help Center, *Covered Models*, page metadata gives a last-modified
  timestamp of 1 September 2026 —
  [support.claude.com](https://support.claude.com/en/articles/15425695-covered-models)
- Anthropic Help Center, *Data retention practices for Covered Models*, page
  metadata gives a last-modified timestamp of 5 September 2026 —
  [support.claude.com](https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models)
- Help Net Security, *Anthropic's Enterprise Frontier Safeguards lets your Claude
  logs stay in your cloud*, published 2 September 2026 —
  [helpnetsecurity.com](https://www.helpnetsecurity.com/2026/09/02/anthropic-enterprise-frontier-safeguards/)

Both support pages show a relative freshness label rather than a date ("Updated
this week", "Updated yesterday"); the timestamps above are from each page's
embedded `dateModified` metadata.
