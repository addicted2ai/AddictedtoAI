---
job: seed-org-meta-superintelligence-labs
verdict: approve
reasons: []
would-cite: >-
  Someone arguing Meta abandoned open weights at the frontier gets the
  receipts here — the last open frontier Llama dated, Muse Spark closed with
  the "hope[s] to open-source" hedge quoted; and the contributor-tier
  paragraph is the citable number for anyone arguing about what user prompts
  are worth to a lab: a 12.5x discount with the data-use condition quoted
  from the listing itself.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- about.fb.com 2026/04 Muse Spark announcement — confirms 8 April 2026,
  "the first in a new series of large language models built by Meta
  Superintelligence Labs", and the exact wording "we hope to open-source
  future versions of the model". Weights closed is supported by the page
  offering API preview access plus that hedge (no weights release
  mentioned).
- huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct — full
  Llama 4 Community License confirmed: the 700M-MAU separate-license
  clause, "prominently display 'Built with Llama'", and "include 'Llama' at
  the beginning of any such AI model name". Release date April 5, 2025 on
  the model card.
- huggingface.co/meta-models/Muse-Glimmer-30B — "License: apache-2.0";
  "distilled from Muse Spark and purpose-built for autonomous agentic tasks
  on consumer hardware" (under 20 GB, 24-32 GB envelope) — supports "sized
  to run on one consumer GPU". The card gives only "August 2026"; the
  10 August day is carried by the Wikipedia Muse Spark article, also
  fetched, which states it directly.
- en.wikipedia.org/wiki/Muse_Spark — confirms 1.1 launched 9 July 2026,
  1.2 released 5 August 2026, Glimmer released 10 August 2026.
- openrouter.ai/meta/muse-spark-1.2-contributor — the condition is on the
  listing verbatim: "Your prompts and outputs may be used to improve
  Meta's products", price $0.10/1M.

**Verified by measurement:**
- `meta-llama/` rows end 2025-04-30; `meta/` rows begin 2026-07-16 — the
  prefix change is in the data as described.
- `meta/muse-spark-1.2` input 0.00000125; contributor row 0.0000001; both
  ctx 1048576 ("same model, same million-token window") — the 12.5x gap is
  the "public number for what a prompt is worth".
- Transclusions resolve (including the org's own contributor_tier_terms
  fact); aliases sane (Meta and MSL as manual is right).

The licence-direction paragraph (weights got freer and smaller in the same
move) is a real assembled finding, not a restatement of the announcement.
Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — one absence claim corrected

**Corrected: "no user threshold, no naming clause, no acceptable-use annex"
→ "no user threshold, no naming clause, and a licence text left unmodified.
A usage policy still ships in the repository, but the Apache grant never
references it, so it binds nothing — where the Llama agreement made
adherence to its acceptable-use policy a condition of the licence."**

Round one verified the model card's "License: apache-2.0" tag and stopped
there. An absence claim needs the repository, not the card. Fetched the HF
API listing for `meta-models/Muse-Glimmer-30B` (12,821 bytes) and read the
`siblings` array: alongside `LICENSE` and `README.md` the repo ships
**`USAGE_POLICY.md`**. Fetched it (5,230 bytes). It is titled "Muse Glimmer
Usage Policy" and opens:

> This Usage Policy ("Policy") applies to your access or use of Muse
> Glimmer.

followed by five numbered classes of Prohibited Uses — illegal activity,
CSAM, weapons and ITAR, deception, undisclosed dangers — structurally the
same document as Meta's Llama acceptable-use policy. "No acceptable-use
annex" was simply false: the annex is in the repository, and the README
links it ("Our Usage Policy can be found here").

What *is* true, and is what the corrected sentence now says, took reading
both licences side by side:

- `Muse-Glimmer-30B/raw/main/LICENSE` (11,358 bytes) is **unmodified Apache
  License 2.0** — opens "Apache License / Version 2.0, January 2004", ends
  with the standard "APPENDIX: How to apply the Apache License to your
  work." The strings "Usage Policy", "acceptable use" and "monthly active
  users" are **all absent from the full 11,358 bytes**. The grant does not
  incorporate the policy by reference.
- The Llama 4 Community License Agreement, by contrast, makes it binding, in
  the licence text itself: "Your use of the Llama Materials must comply with
  applicable laws and regulations ... and adhere to the Acceptable Use
  Policy for the Llama Materials".

So the direction the paragraph is arguing survives and is now stated
accurately: Meta moved from a licence whose use policy was a condition of
the grant to a standard Apache grant with a use policy sitting beside it.
The old wording overstated by claiming the policy did not exist; the new one
makes the sharper and checkable claim about where it sits.

**Everything else in the entry holds, re-matched literally:**
- huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct (441,227
  bytes): "greater than 700 million monthly active users in the preceding
  calendar month, you must request a license from Meta"; "prominently
  display \"Built with Llama\""; "include \"Llama\" at the beginning of any
  such AI model name"; and "Llama 4 Version Effective Date: April 5, 2025".
  All three clauses the entry names are in the licence, verbatim.
- about.fb.com Muse Spark announcement (658,198 bytes): "Published on
  April 8, 2026"; "the first in a new series of large language models built
  by Meta Superintelligence Labs"; and the hedge exactly as quoted — "It
  will be available in private preview via API to select partners, and we
  hope to open-source future versions of the model." Closed weights
  supported.
- Closed weights double-checked against a source that could have refuted it:
  en.wikipedia.org/wiki/Muse_Spark (150,086 bytes) says "Mark Zuckerberg has
  stated that Meta **will** release Muse Spark 1.2 as an open-weight model"
  — a future intention, not a past release — and its infobox reads "License
  Proprietary - Spark / Apache 2.0 - Glimmer". Also confirms 1.1 on July 9,
  2026, 1.2 on August 5, 2026, and Glimmer on August 10, 2026.
- Muse Glimmer README (16,892 bytes): "distilled from Muse Spark and
  purpose-built for autonomous agentic tasks on consumer hardware", weights
  compressed to "under 20 GB" to fit "within a 24 GB or 32 GB envelope" —
  "sized to run on one consumer GPU" is supported (the literal strings
  "consumer GPU" and "single GPU" are absent; the support is "consumer
  hardware" plus the stated envelope).
- openrouter.ai/meta/muse-spark-1.2-contributor (417,149 bytes): "Your
  prompts and outputs may be used to improve Meta's products" verbatim, with
  "$0.10 / $0.20 per 1M", "Context 1M", "Released Aug 21, 2026".
- Re-measured from the current 396-row snapshot (rolled from 388 since round
  one): `meta/muse-spark-1.2` prompt 0.00000125 and
  `meta/muse-spark-1.2-contributor` prompt 0.0000001 — a 12.5x gap — with
  `context_length` 1048576 on both, so "the same model, the same
  million-token window" holds. `meta-llama/` rows run 2024-07-23 to
  2025-04-30 and `meta/` rows begin 2026-07-16, so the prefix-change
  sentence is still true of the data.
