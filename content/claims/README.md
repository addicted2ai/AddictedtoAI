# content/claims/

Vendor claim records (`specs/wiki`, change `separate-a-claim-from-a-fact`).
One file per claim: the entry it is about (`subject`), the ability or field it
is about (`field`), the claim **in the source's own words** (`quote`), the
document it was read from (`source_url`), that URL's host (`source_host`), the
local date it was read (`accessed`), and an optional three-state `verified`.

**A claim is not a fact, and a fact is not a claim.** A fact is a value the
site records with a source; a claim is a thing a party said about itself or its
product. `source: cited` records that a value carries a citation, never that
the citation is the vendor's own assertion — and both finalist builds of the
Frontier rendered organisation founding dates under "claimed · unverified"
because the corpus offered no other structure. Every one of those thirteen
`founded` facts cites `en.wikipedia.org`.

**The record sits beside the entry, never on it.** A claim ages on its
source's clock, not the entry's: *"Anthropic said this on 2026-08-27"* is true
forever and re-checking it means nothing. And a verification landing next month
on a claim already filed would otherwise mark the subject entry's reviewed
surface mismatched, demanding a fresh verdict on prose nobody touched.

**A claim mints no page.** Its rendered home is its subject's entry page, at
`#claim-<slug>`. It is in no sitemap, no search index and no `llms.txt`.

`verified` is three states and they are not two:

- **absent** — nobody has looked. Nothing renders. Not "unverified".
- **`false`** — someone looked and did not confirm it. "Not verified" renders.
- **`{ by, url, date }`** — someone looked and confirmed it, naming who, the
  document that supports it, and the local date.

`verified: true` fails the build: a confirmation with no verifier, no document
and no date is a claim about a check rather than a record of one.

```yaml
---
subject: org/moonshot-ai
field: agentic_task_completion
quote: "Kimi K2 completes multi-step engineering tasks end to end, without a human in the loop."
source_url: "https://platform.kimi.ai/blog/k2-launch"
source_host: platform.kimi.ai
accessed: "2026-09-05"
verified: false
---
```

This directory is empty of records on the day it lands, and that is the
instruction, not an omission: which of the corpus's cited facts are claims is
an editorial judgment that goes through the review gate. A claim surface with
no claim records renders empty, and that empty state is the honest one.
