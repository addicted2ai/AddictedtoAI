---
job: seed-org-moonshot-ai
verdict: revise
reasons:
  - false-or-unsupported-claim
  - spec-violation
would-cite: >-
  The Kimi K3 licence reading here is correct and rare — the file sets no fee and
  never says "revenue share", so the widely-repeated 30% belongs to the separate
  commercial agreement, not the licence — but the very next sentence repeats that
  same error against Alibaba, so the page cannot yet be handed to someone
  arguing about Chinese-lab licence terms.
reviewer: rr4b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against raw bytes on disk.

**Verified — and the central claim holds. This is the good part.**

- huggingface.co/moonshotai/Kimi-K3 `LICENSE` (3,065 b, read in full): it has
  **exactly five numbered sections**, so "its five sections" is right. §2 requires
  a MaaS operator above "20 million US dollars … over any consecutive 12 months"
  to "enter into a separate agreement with Moonshot AI"; §3 requires "Kimi K3" to
  be "prominently displayed" above 100M MAU or US$20M monthly revenue. Both
  transcluded facts are accurate.
- **"It sets no fee and takes no percentage, and the words 'revenue share' appear
  nowhere in its five sections" — verified at byte level.** No "revenue share", no
  percentage figure, and the `%` character does not occur anywhere in the file.
- en.wikipedia.org/wiki/Moonshot_AI carries the contradiction described in the
  brief, and I found both halves: the lead says "K3's custom license requires
  revenue sharing of up to 30%" (**false** against the file), while the body says
  "must enter a commercial agreement with Moonshot with revenue sharing of up to
  30%" (**true**). The entry's fact tracks the **body**, and the prose says so
  explicitly — "a claim about the commercial agreement, not a term of the
  licence". That is the correct half, correctly labelled, and it is the reason
  this page would be worth having.
- Kimi K2.5 `LICENSE`: titled "Modified MIT License", display clause only —
  `predecessor_license_condition` exact. Seven `moonshotai/` rows, `kimi-k2`
  2025-07-11 → `kimi-k3` 2026-07-16. K2.5 listed 2026-01-27, `expiration_date`
  2026-08-31 (transcluded) — "seven months" is arithmetic. Opus 5 at 63.1 is the
  top intelligence index in the snapshot. Founded March 2023, Haidian district,
  US$35 billion (July 2026) all confirmed.

**DEFECT 1 — `false-or-unsupported-claim`, and it is the same error the piece was
edited to remove, one sentence later.** "Alibaba Cloud attaches a comparable
condition to its larger Qwen releases — {{fact:org/alibaba-cloud#license_revenue_share}}
— so metered commerce on published weights is a pattern across at least two
Chinese labs rather than one lab's experiment." That fact renders as "revenue
sharing required from providers generating more than US$50 million annually". I
fetched the actual Qwen3.8-Max License (3,390 b, read in full): §2 requires the
licensee to "obtain a separate license from Qwen" above US$50,000,000 of
twelve-month revenue. It requires **no revenue sharing**, names no percentage, and
the `%` character does not appear in it. The fact is faithful to Wikipedia's Qwen
article — "Larger versions often a revenue sharing agreement from providers
generating more than US$50 million annually" — and false against the licence.
*Faithful and false are not exclusive.* The dependent inference fails with it:
neither licence meters anything, so "metered commerce … across at least two
Chinese labs" is unsupported. Both documents withhold permission pending a
separate agreement — which is exactly the distinction this entry draws so well one
paragraph earlier, and then drops. The corpus's own blog post gets it right ("a
separate agreement at twenty million dollars a year, a separate licence at fifty
million").

**DEFECT 2 — `spec-violation`, a volatile value typed rather than bound.** "with a
million-token context window" for `moonshotai/kimi-k3`, whose feed
`context_length` is 1,048,576 at `volatility: fast`. `model/moonshotai-kimi-k3`
**does** declare a `context_window` fact, so the transclusion was available and was
not used. This is one of the two rules the brief asked me to re-check.

Round 1 (the task-6.5 seed reviewer) approved, with one required change — the
2026-01-27 timeline row citing SiliconANGLE for a licence the article never
mentions. That is **fixed**: the row now cites the Hugging Face page, whose card
carries the Modified MIT statement.

**A round-one finding I now believe was wrong, in the permissive direction.**
Round 1 wrote: "en.wikipedia.org/wiki/Qwen — confirms the transcluded Alibaba
fact … **The two-lab pattern claim is therefore supported on both legs.**" It
verified faithfulness to Wikipedia and stopped, without opening the licence.
Round 1's own `would-cite` embeds the error twice over ("a 30%-above-US$20M
revenue-share **clause** mirrored by Qwen's above-US$50M"). The root cause is not
in this entry at all: `org/alibaba-cloud#license_revenue_share` is a bad fact,
sourced to Wikipedia, and it will keep publishing wherever it is transcluded until
that entry is corrected. **That is the fix worth making site-wide, and it should
be filed against `org/alibaba-cloud` regardless of what happens to this body.**

I want to be plain about the call, because it is the closest in my slice and the
body does not get another round. This is **one false sentence on an otherwise
excellent page**, not a rotten core — three and a half of four paragraphs are
verified correct, and the licence disentangling is work I would want published. I
withhold approval anyway: it is a false statement about what a licence requires,
on a page whose entire authority is having read a licence properly, and approving
it would repeat round one's mistake of accepting a Wikipedia-faithful,
licence-false claim. The stub keeps every verified fact, including the correctly
attributed 30%. Revise.
