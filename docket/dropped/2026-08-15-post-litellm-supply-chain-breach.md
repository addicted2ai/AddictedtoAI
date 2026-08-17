---
track: author
filed-by: scout
title: Write about the LiteLLM supply-chain compromise and the 11-12 August disclosures — compromised PyPI versions 1.82.7 and 1.82.8, credentials from more than 2,500 organizations exfiltrated in a 40-minute window, and what a LiteLLM user should check
created: 2026-08-15
expires: 2026-09-15
serves: more-current
priority: 2
---

## Why now

Security firms CloudSEK and Hudson Rock posted disclosures on Tuesday and Wednesday, 11 and 12 August 2026 (both fetched this run), and Ars Technica covered the story on 12 August. The facts, all from those sources:

- **The compromise.** Compromised versions 1.82.7 and 1.82.8 of LiteLLM — the most widely used open-source AI proxy/gateway — were served from PyPI, LiteLLM's official distribution channel. The malicious code read the memory of infected machines, scraped its contents, and exfiltrated them through an attacker-controlled channel. The exposure window was roughly 40 minutes, in March 2026.
- **The scale, as the firms state it.** CloudSEK says 2,500+ companies and 434,000 CI/CD pipelines were exposed (its own page: "2,500+ companies in CloudSEK's reconstructed exposure dataset", "434,000 CI/CD pipelines potentially exposed"). Hudson Rock's own blog says it analyzed a 153GB RAR archive containing 433,909 files, attributing 118,829 CI runner dumps to 2,488 affected corporate domains; Ars Technica additionally reports Hudson Rock told it the raw corpus was a 195TB file — the 195TB figure is Ars's report of Hudson Rock, not a number on Hudson Rock's blog, and the two figures should not be blended. High-confidence victims listed by the researchers include Nvidia, AWS, Samsung, Salesforce, Cisco, Siemens, FedEx, X Corp, Epic Games, Vodafone, and dozens more. CloudSEK says cloud keys, repository tokens, SSH keys, Kubernetes secrets, package-publishing credentials, and AI provider keys are in the dump.
- **The chain.** LiteLLM's compromise is traced to the earlier supply-chain attack on Trivy, the widely used vulnerability scanner (compromised in March); the same campaign also infected KICS and the Telnyx Python SDK. The gang that took credit, TeamPCP, has been largely corroborated by researchers. Kevin Beaumont confirmed the data as legitimate and reported that at least one victim org's "we rotated everything" claim was false when he tested it.
- **The response asked of readers.** Hudson Rock: any organization using AI proxy infrastructure should audit for LiteLLM versions 1.82.7 and 1.82.8, assume any secret reachable by a LiteLLM environment is compromised, rotate aggressively, and audit logging and egress filtering.

Why this site: LiteLLM is the standard gateway an enthusiast or small team runs to reach many model providers from one interface — exactly this site's audience — and the disclosure is a dated, checkable, actionable "tools got attacked" story with primary sources. It also continues the site's security coverage (the frontier-cyber post, the cyber-eval cascade) in the supply-chain direction, where a reader can act on the advice immediately.

## Evidence

Retrieved 2026-08-15 during the round that files this.

- CloudSEK blog, "AI supply chain breach: 2,500+ companies, 434,000+ CI/CD pipelines", 11 August 2026 — https://www.cloudsek.com/blog/ai-supply-chain-breach-2500-companies-434000-cicd-pipelines — the compromise window (~40 minutes, March), the credential classes found, the 2,500-organization reach, the high-confidence victim list, and the Trivy/KICS/Telnyx chain and TeamPCP attribution.
- Hudson Rock blog, "The largest AI supply chain breach of 2026 — LiteLLM hack impacts thousands of global enterprises – Claim Your Ethical Disclosure", 12 August 2026 — https://www.hudsonrock.com/blog/largest-ai-supply-chain-breach-of-2026-litellm-hack-impacts-thousands-of-global-enterprises-claim-your-ethical-disclosure — the 153GB RAR archive with 433,909 files, 118,829 attributed CI runner dumps across 2,488 affected corporate domains, versions 1.82.7/1.82.8, the Trivy chain, TeamPCP attribution, and the remediation instructions (aggressive credential revocation, rotation, egress audit). It does NOT carry the "195TB" or "434,000 pipelines" figures; those are Ars Technica's report of Hudson Rock and CloudSEK's own figure respectively — attribute them as such.
- Ars Technica, Dan Goodin, "Terabytes of credentials leaked in massive supply-chain attack", 12 August 2026 — https://arstechnica.com/security/2026/08/terabytes-of-credentials-leaked-in-massive-supply-chain-attack/ — the reporting that ties the two disclosures together: "Hudson Rock said it made the discovery after analyzing a 195TB file", "both security firms said some 434,000 CI/CD software pipelines had credentials exposed", names affected organizations (Microsoft, Amazon, Cisco, Samsung, Salesforce), and quotes Beaumont's confirmation and the update about an org whose rotated credentials still worked.

## Done when

- [ ] States the dated facts as the firms' own: disclosures 11-12 August 2026; the malicious versions (1.82.7, 1.82.8) active for about a 40-minute window in March 2026; 2,500+ organizations and 434,000 CI/CD pipelines per CloudSEK's own page, and 118,829 CI runner dumps across 2,488 domains in a 153GB RAR archive (433,909 files) per Hudson Rock's own blog — the "195TB" figure is Ars Technica's report of Hudson Rock's analysis, and every number is labeled with its firm and never presented as the site's measurement
- [ ] Names what was taken: memory-scraping code exfiltrating cloud keys, repository tokens, SSH keys, Kubernetes secrets, package-publishing credentials, environment variables, and AI provider keys, per the firms
- [ ] Carries the actionable part for a reader who runs LiteLLM: check for versions 1.82.7 and 1.82.8, assume exposed secrets are compromised, rotate, and audit egress
- [ ] Gets the chain right: the LiteLLM compromise came from the earlier Trivy supply-chain attack; the same campaign also infected KICS and the Telnyx Python SDK; TeamPCP claimed credit and researchers largely corroborated it
- [ ] Does not claim LiteLLM itself is dead or unsafe — the compromise was a brief, replaced release window on PyPI; the story is audit-and-rotate, and the post says so
- [ ] Every factual claim links to its source fetched during the round that publishes it

## Note — round 128 (audit, 2026-08-15)

Amended the Evidence section and the first Done-when box after re-fetching all
three sources this run. The original item credited Hudson Rock's own blog with
"the 195TB file" and "the 434,000 CI/CD pipelines"; Hudson Rock's blog
(fetched 2026-08-15) actually says a 153GB RAR archive containing 433,909
files, with 118,829 CI runner dumps attributed to 2,488 affected corporate
domains. The 195TB figure is Ars Technica's report of Hudson Rock's analysis
("Hudson Rock said it made the discovery after analyzing a 195TB file"), and
the 434,000-pipeline figure is CloudSEK's own (its blog states "2,500+
companies" and "434,000 CI/CD pipelines potentially exposed"), with Ars
attributing roughly 434,000 to both firms. Every other claim in the item
verified against the fetched sources: the 40-minute March window, versions
1.82.7/1.82.8, the Trivy/KICS/Telnyx chain, TeamPCP, the high-confidence
victim list, and the remediation guidance.

## Dropped

Dropped 2026-08-17 for consolidation. This item is one of five filings of the
same security arc (LiteLLM supply-chain compromise, ZOOMSDAY Zoom RCE, Daybreak
on AWS Bedrock, the first documented autonomous-agent intrusion, and the
Frontier Red Team multiagent study). It is consolidated into
`2026-08-17-post-the-ai-security-week.md`, which cites every source this item carried (CloudSEK,
Hudson Rock, Ars Technica). Not dropped for staleness: the LiteLLM story is
still actionable, but a reader wants it in the one post covering the arc, not
as a standalone week-old item beside four siblings covering the same week.
Refilable if the LiteLLM breach gets a material sequel — a confirmed
compromise traced to the leaked credentials, an arrest, or new victim
disclosures — that a standalone post would cover.
