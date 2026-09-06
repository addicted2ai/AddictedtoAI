---
id: concept/covered-models
kind: concept
display_name: "Covered Models"
status: active
maintenance: living
aliases:
  - name: "Covered Models"
    class: exclusive
  - name: "Covered Model"
    class: exclusive
facts:
  - field: definition
    source: cited
    value: "a Claude model whose capabilities—for example in software engineering, agentic workflows, scientific reasoning, or cybersecurity — represent a substantial step up from prior generations and create elevated risk if misused"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: designated_models
    source: cited
    value: "Claude Mythos 5.1 and Claude Fable 5.1 (August 31, 2026); Claude Mythos 5 and Claude Fable 5 (June 9, 2026)"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: fast
  - field: policy_effective_date
    source: cited
    value: "2026-06-09"
    source_url: "https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models"
    accessed: "2026-09-06"
    volatility: dated
  - field: scope
    source: cited
    value: "wherever Covered Models are offered, including third-party cloud platforms"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: retention_minimum
    source: cited
    value: "Prompts and model completions are retained for at least 30 days and then automatically deleted, unless they are subject to a safety investigation or we are legally required to maintain them."
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: zero_data_retention
    source: cited
    value: "not available in workspaces, Claude Enterprise organizations, or third-party platforms (e.g., Azure Subscriptions) where Covered Models can be accessed"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: affected_organizations
    source: cited
    value: "organizations that have set up workspaces with zero data retention (ZDR) in Claude Console, use Claude Code with ZDR in Claude Enterprise, or access Claude through AWS Bedrock, Google Cloud Agent Platform, or Microsoft Foundry with ZDR"
    source_url: "https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: unaffected_plans
    source: cited
    value: "Consumer plans (Claude Free, Pro, and Max) across our web, desktop, and mobile apps—including Claude.ai and Claude Code—are unaffected by this update, since we already retain inputs and outputs on these surfaces."
    source_url: "https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: fallback_for_zdr_customers
    source: cited
    value: "Customers who are eligible for zero data retention can continue to use prior Claude models under their existing settings and agreements."
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: interim_zdr_option
    source: cited
    value: "eligible customers will receive the option to use ZDR with Fable 5 and Fable 5.1 for their own internal business applications. This arrangement is available for a limited time, and intended to be a transition to EFS."
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: efs_rollout
    source: cited
    value: "EFS will roll out in phases beginning in fall 2026"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: fast
  - field: fable_mythos_relationship
    source: cited
    value: "Claude Fable 5 and Claude Fable 5.1 share the same underlying model as Claude Mythos 5 and Claude Mythos 5.1, but with additional safeguards, particularly in the cyber and bio domains."
    source_url: "https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models"
    accessed: "2026-09-06"
    volatility: slow
timeline:
  - date: "2026-06-09"
    event: "data retention policy for Covered Models goes into effect"
    source_url: "https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models"
  - date: "2026-06-09"
    event: "Claude Mythos 5 and Claude Fable 5 designated Covered Models"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
  - date: "2026-08-31"
    event: "Claude Mythos 5.1 and Claude Fable 5.1 designated Covered Models"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
  - date: "2026-09-01"
    event: "Enterprise Frontier Safeguards announced as the route back to customer-held retention data"
    source_url: "https://www.anthropic.com/news/enterprise-frontier-safeguards"
mentions:
  - org/anthropic
  - model/anthropic-claude-fable-5
  - model/anthropic-claude-fable-5-1
---

"Covered Model" is a designation Anthropic applies to a model, and what it
changes is the customer's contract rather than the model. Anthropic's stated
reason for it is that the misuse it wants to catch is invisible one request at a
time: "Some attacks only become visible across multiple requests." The retention
article names one — best-of-N jailbreaking, which "sends hundreds of slight
variations of a prompt in the hope that one will work" — and puts campaigns in
the same category, saying state-sponsored espionage and data extortion "only
surface when our safeguards classifiers can zoom out across many requests." So
the designation is not a warning label. It is the switch that turns on the
window the classifiers need, and everything else on the page follows from
needing that window to exist.

The reason this reaches ordinary API customers rather than a handful of approved
partners is the pairing in the table:
{{fact:concept/covered-models#fable_mythos_relationship}} Anthropic frames the
extra safeguards as what makes the wider release possible — "these safeguards
allow us to share this intelligence more broadly" — but the retention terms
attach to the underlying model rather than to the safeguards wrapped around it.
Mythos 5 and 5.1 are listed "Limited availability", reachable only by "approved
partners"; Fable 5 and 5.1 are generally available on
{{fact:model/anthropic-claude-fable-5-1#covered_model_availability}}, under
identical data handling. A customer who could never have called a Mythos model
took on its retention posture the day they called Fable.

Almost nobody notices, and the exception is exact. Consumer plans were already
retaining. The population this lands on is the one that had specifically bought
its way out of retention:
{{fact:concept/covered-models#affected_organizations}}. The fallback offered is
to stay behind on prior models. Azure gets the most concrete version of the
bill: "If you have zero data retention configured, then you will need to create
and use a separate Azure Subscription to access these models."

Anthropic has announced a way out — Enterprise Frontier Safeguards, which moves
the retained window into storage the customer controls, and which
{{fact:concept/covered-models#efs_rollout}}. Two Anthropic documents describe
the interim arrangement differently and this entry follows the narrower one. The
1 September news page says eligible customers "will receive ZDR on Fable 5 and
Fable 5.1 until EFS is ready." The Covered Models page carries three qualifiers
the announcement drops: it is an *option* rather than a grant, it is scoped to
customers' "own internal business applications", and it arrives either because
Anthropic or a cloud provider makes contact or because the customer applies.
Anyone building a product on Fable for their own customers is governed by a
different sentence again — "Certain products built on Claude may extend the
option to use ZDR with these models to their own eligible business customers
under terms agreed with Anthropic."

Retention is not unsupervised access. By default "no Anthropic personnel can
read your retained conversations"; human review runs through "a controlled
access path" open to "a small set of approved reviewers", and "every instance of
access is recorded in a tamper-proof log that reviewers cannot suppress or
modify." What no version of the arrangement moves is authority, and the Covered
Models page says so about EFS itself: "This arrangement affects only the
retention and review of stored data. The Usage Policy, real-time safety
classifiers, and Anthropic's enforcement systems continue to apply to all
traffic, and Anthropic may modify or withdraw the arrangement, including in
response to misuse."
