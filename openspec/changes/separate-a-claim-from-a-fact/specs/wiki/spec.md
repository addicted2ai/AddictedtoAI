# wiki — delta for separate-a-claim-from-a-fact

Three requirements added. Nothing here changes what an entry is, how it is
identified, how its facts are sourced, classed for volatility, or reviewed.
`facts` is untouched: a `cited` fact stays exactly what it is, and this delta
adds no key to `entrySchema` except the optional `publishes_from` in the second
requirement.

The shape is transcribed from `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md`
§4 and its K44 amendment (keeper-signed 2026-09-05); the vendor test and the
display contract are the round-4 and round-5 addenda to `loops/ui-loop/RULES.md`
R13, enforced there as invariant `S22` clause (e). The round-by-round reason for
each clause is `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` §4, the
rubric this draft was written against. None of it is re-decided here.

## ADDED Requirements

### Requirement: A vendor claim is its own record, filed beside the entry

A **vendor claim** is a thing a party said about itself or its product. A
**fact** is a value the site records with a source. The corpus has had only the
second shape, and the cost of that was paid twice: both finalist builds of
`/frontier` rendered organisation founding dates and founders under
"claimed · unverified", independently, because the only structure available for
"what this vendor says" was "any cited fact"
(`loops/ui-loop/graph/knowledge/implementer-ledger.md` rows 2 and 4). A founding
date is not a vendor claim and SHALL never render as one — and measured on
2026-09-05, all thirteen of the `founded` facts that a first-cited-fact rule
selects are cited from `en.wikipedia.org`, so what shipped was an
encyclopaedia's account of an incorporation presented as a company's own words.

RD-004 states the confusion exactly, and the requirement exists to make the
sentence mechanically true: *`source: cited` records that a value carries a
citation, never that the citation is the vendor's own assertion.*

**The record is a content record of its own, and it is NOT a field on the
entry.** Two mechanisms, not a preference:

- A review record binds a piece's **reviewed surface** — its body plus its front
  matter minus the mechanically-maintained keys, matched by key **name** across
  every content kind. A claim carried in an entry's front matter would either sit
  on that mechanical list, publishing a model-transcribed quotation unreviewed
  and exempting the same key name on every other kind that ever declares it; or
  sit off it, so that a claim arriving — or a verification landing months later
  on a claim already filed — marks the entry mismatched and demands a fresh
  verdict on prose nobody touched.
- A claim ages on **its source's** clock. An entry's cited facts are re-checked
  on the entry's volatility cadence, and the Pulse computes overdue facts every
  run. "Anthropic said this on 2026-08-27" is true forever and re-checking it
  means nothing; what moves is whether anyone has verified it, on the verifier's
  clock. One file cannot answer to two freshness regimes.

Therefore:

- A claim SHALL be a single file under `content/claims/`, validated by its own
  schema, loaded by the same corpus loader as every other content type, and
  classified field-by-field as author prose or not — the exhaustiveness rule in
  "Author-written front matter is prose for the volatile-literal check" applies
  to it in full, and a new string field on it that is classified in neither list
  SHALL fail the build.
- Each record SHALL declare, and the build SHALL fail naming the file and the
  field when any is missing or malformed:
  - **`subject`** — the entry id the claim is about, in the `<kind>/<slug>` form,
    resolved against the corpus exactly as `mentions` is. A subject naming no
    entry SHALL fail the build. The join is **declared, never inferred**: no
    name match, no host match, no title match, for the reason `feeds` binds on a
    declared row id.
  - **`field`** — a snake_case name for the ability or field the claim is about.
    It names what the claim is *about* and SHALL NOT be resolved against the
    subject's `facts`: a claim record and a cited fact sharing a name is exactly
    the collapse this requirement exists to prevent, and a build that joined them
    would rebuild the defect out of the repair.
  - **`quote`** — the claim in the source's own words, verbatim. Classified
    **not author prose**, for the reason `facts[].value` already is: it is the
    data layer, transcribed, and a verbatim record cannot be wrong.
  - **`source_url`** — the document the quote was read from.
  - **`source_host`** — the host component of `source_url`, lowercased. The build
    SHALL fail when it does not equal the host parsed from `source_url`. It is
    redundant on purpose: it is the input to the vendor test below, so carrying
    it puts that input in the file a reviewer reads instead of behind a URL parse
    at render time.
  - **`accessed`** — the local date the source was read, as every dated record in
    this repository uses local dates.
  - **`verified`** — optional, and **three-valued** (below).
- A claim SHALL be treated as `dated` by construction. No re-check work SHALL
  ever be generated for a claim record, and no overdue marker SHALL render on
  one. What can go stale is its verification state, not the claim.
- Several claims MAY name the same `subject` and `field` — a vendor repeating
  itself, or two sources for one assertion — and a surface orders them by
  `accessed`, newest first. Two records sharing all of `subject`, `field`,
  `source_url` and `accessed` are a duplicate and SHALL fail the build naming
  both files.
- A claim record SHALL NOT mint a route of its own. Its rendered home is its
  subject's entry page, at a stable fragment, and it SHALL NOT appear in the
  sitemap or the search index as a document in its own right.
- **No surface SHALL construct a claim from an entry's `facts`**, whatever those
  facts are named and whatever their `source_url` says. A claim surface with no
  claim records renders empty. That empty state is the honest one, and it is the
  state the corpus is in on the day this lands.

**`verified` is three states and they are not two.** The distinction is the
whole point, and the defect it prevents is the one this requirement opens with —
a default that reads as a finding:

- **absent** — nobody has looked. A surface SHALL render **no statement about
  verification at all**. It SHALL NOT say "unverified", "not verified",
  "unconfirmed" or anything else that asserts a check which never happened.
- **`false`** — someone looked and did not confirm it. A surface renders
  "not verified" (or the equivalent it has chosen) for this case and **only**
  this case.
- **`{ by, url, date }`** — someone looked and confirmed it, naming who, the
  document that supports the confirmation, and the local date.

`verified: true` SHALL fail the build, naming the file: a confirmation with no
verifier, no document and no date is a claim about a check rather than a record
of one, which is the `intent-not-measurement` defect written into the schema.

**The worked example** — a complete claim record, normative for field names and
shapes:

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

#### Scenario: A founding date cannot render as a vendor claim

- **WHEN** a surface renders what an organisation says about itself, and the
  organisation's entry carries a cited `founded` fact — sourced, as all thirteen
  in this corpus are, from an encyclopaedia — and no claim record
- **THEN** the surface renders its empty state, because a claim is read from a
  claim record and from nowhere else — and the founding date renders where it
  always did, as a sourced fact on the entry

#### Scenario: An unlooked-at claim says nothing about verification

- **WHEN** a claim record carries no `verified` key
- **THEN** every surface rendering it renders no verification statement of any
  kind — not "unverified", not "unconfirmed", not an empty verification slot
  that reads as a negative finding

#### Scenario: A negative finding is recorded, not implied

- **WHEN** a verifier fetched the source and could not confirm the claim, and
  records `verified: false`
- **THEN** the surface renders "not verified", and the record shows that a check
  happened and failed rather than that no check happened

#### Scenario: A confirmation must name its evidence

- **WHEN** a claim record declares `verified: true`
- **THEN** the build fails naming the file, because a confirmation carries
  `by`, `url` and `date` or it is not a confirmation

#### Scenario: A claim's subject is a declared entry

- **WHEN** a claim record names a `subject` that no entry declares
- **THEN** the build fails naming the file and the id, exactly as an unresolved
  `mentions` id does

#### Scenario: A verification does not re-review the entry

- **WHEN** a `verified` block is added to an existing claim record whose subject
  entry carries an approved review record
- **THEN** the entry's review record still reports the entry as matching, and the
  claim record itself reports mismatched until a fresh verdict is recorded
  against its changed bytes

#### Scenario: A claim never goes overdue

- **WHEN** a claim record's `accessed` date is a year old
- **THEN** no overdue marker renders on it and no re-check work enters the
  derived queue, because a claim is a dated statement about the day it was made

### Requirement: A claim is the subject's own only when the source is

A column labelled as carrying what a party **said** SHALL admit a claim only
where that party is the claim's own cited source. This is the round-4 addendum
to `loops/ui-loop/RULES.md` R13, and it was written because an implementation
that looked correct was not: a "vendor claim" column, under a lede reading
"quoted verbatim from the vendor", rendered OpenRouter's rolling median of live
traffic (`observed_throughput_p50`) and an llm-releases.com analysis
(`output_tokens_per_task`, `cost_per_task`) as vendor claims
(`implementer-ledger.md` row 10; red-team finding FM-N3). A field-name test
standing in for a source test.

- **A measurement is not a claim, whatever field name carries it.** A third
  party's measurement of a vendor's product is that third party's statement. It
  is admissible as a third party's, never as the vendor's, and a rule that
  admits it by field name admits every future field with a similar name.
- **Ownership is read off the registrable domain, never off a host's labels.**
  The public suffix is a host's last label, except for an explicit table of
  multi-label suffixes (`co.uk`, `com.cn`, `github.io`, …) where it is the last
  two; the **registrable domain** is that suffix plus the one label to its left,
  and that label — the string a registrant actually bought — is the only one
  ownership can be read from. `www.tencent.com` is `tencent.com`;
  `deepmind.google` is `deepmind.google`, and because `.google` is a
  single-label brand TLD, `blog.google` is a **different** registrable domain
  from it and neither is `google.com`; `google.attacker.example` is
  `attacker.example`.
- **This rule SHALL be stated once in the source tree and duplicated nowhere**,
  with the multi-label suffix table beside it. The round-4 form of the test asked
  whether any dot-separated label of a cited host was one of the subject's name
  tokens — label identity with no notion of position, which cleared
  `google.<anyone-else>` for Google DeepMind exactly as `deepmind.google` did.
  An `endsWith('.' + recorded)` test has the same hole from the other side
  (red-team finding FM-N5). Both are what a second copy of this logic drifts
  back into.
- A claim SHALL be attributed to its subject when `source_host`'s registrable
  domain is one of three things and **nothing else**: **one the subject declares
  publishing from**; **one the subject's own entry records citing itself from**
  (the registrable domain of a `facts[].source_url` or a `timeline[].source_url`
  on that entry, kept only where that domain's own registrable label is one of
  the subject's name tokens); or one whose registrable label is one of the
  subject's name tokens. A claim failing the test still validates and is still a
  claim; it renders attributed to whoever does own the domain, never to the
  subject.

  The recorded half is half the live rule and is written here because dropping it
  is invisible: R13 (v) carries both halves, `lib/vendor-domain.mjs`'s
  `recordedDomains` implements it (extracted from `lib/render/frontier.mjs`'s
  `orgOwnDomains`, which the board now reads rather than copies), and invariant
  `S22` clause (e) re-derives both —
  so a spec carrying one half reads as a correction of the other two rather than
  as an omission, and the next implementer "fixes" the gate back to match it. Its
  own name-token filter is not decoration: **all thirteen** `founded` facts in
  this corpus cite `en.wikipedia.org` (measured 2026-09-05; re-measured
  2026-09-06 as fifteen of sixteen across a widened `content/wiki/org/`, one
  entry citing `github.com` instead), so an unfiltered "records citing itself
  from" admits an encyclopaedia as a vendor-owned domain — the exact defect the
  first requirement exists to end, re-entering through the test meant to catch it.

  **And because of that filter the recorded half admits nothing the name-token
  half does not.** It keeps a cited domain only where the domain's own
  registrable label is a name token, which is the same predicate the third path
  tests, so it is a strict subset of the third and can never fire alone. That is
  stated so an implementer told to build three admission paths is not left
  hunting for the case that exercises the second. It is written out anyway, and
  the reason is the paragraph above: a rule carrying one half of what R13 (v),
  `lib/vendor-domain.mjs` and `S22` clause (e) all carry reads as a correction
  of them. If the name-token path is ever narrowed, this half stops being a
  subset and starts doing work. *(Finding `j-20260905-22-carry-3`, verified
  against the implementation and applied 2026-09-06; asserted in
  `lib/vendor-domain.test.mjs` so the subset relation cannot rot silently.)*

- **Name tokens are identifying words, and a generic corporate word is not one.**
  The tokens of a subject are the normalised whole names — its `display_name` and
  its declared `aliases` — **and** their individual words, **excluding** the
  generic corporate family: `ai`, `labs`, `lab`, `cloud`, `inc`, `corp`,
  `corporation`, `company`, `group`, `foundation`, `pbc`, `ltd`, `llc`,
  `technologies`, `technology`, `research`, and the rest of that family. Without
  the exclusion "Inception Labs" tokenises to `labs` and the test admits
  `labs.com`; "Ai2" and every `… Research` name admit `research.example`. That is
  not a corner case — it is a large fraction of this corpus admitting a stranger's
  domain, and it is red-team finding FM-N5's lookalike hole re-opened one label
  over. A token SHALL be matched against the **one** ownership label of the
  registrable domain — the label the registrant bought — and never against any
  other label of the host, which is the same rule the bullet above states and the
  reason it is stated once.

**An entry MAY declare `publishes_from`.** A vendor's product-brand domain is
not one of its name tokens and need not appear in any source it is cited from:
Moonshot AI publishes from `kimi.ai`, and the round-5 addendum records that the
test cannot recognise that domain unless the record carries it. Left undeclared,
a real vendor claim renders as an honest-looking blank (red-team finding
FM-N6) — which is the failure mode hardest to notice, because a blank looks like
the correct handling of an absent claim. **And no build check can detect an
absent declaration**: nothing compares a `publishes_from` set against the entry's
own cited domains for completeness, and nothing could — the entry validates, the
claim validates, the render is well-formed, and the only signal that a real claim
was dropped is a blank that is byte-identical to the blank a subject with no
claims correctly produces. That undetectability is why the burden sits on the org
entry's editorial completeness rather than on a gate: a gate can catch a wrong
declaration and can never catch a missing one.

**This diverges from DESK-ORDER-001 §2 and `SPEC-REVIEW-GUIDE.md` row 51, which
record product-brand domains as `aliases`, and the divergence is deliberate**: a
host is not a name, §2 said "as aliases" when no host field existed to say
otherwise, and the mechanical reasons are the last bullet of this requirement.

- `publishes_from` SHALL be optional, set-valued, and the empty set SHALL be the
  common case. Nothing is required to declare one.
- Each value SHALL be a **registrable domain**, and the build SHALL fail naming
  the entry, the value and the reduction when a value is not equal to its own
  registrable-domain reduction — `platform.kimi.ai` is rejected with `kimi.ai`
  named as the value to declare. Declaring the registrable domain covers every
  host under it, which is what makes the field a statement about a registrant
  rather than a list of URLs to keep current.
- It SHALL be **editorial and declared**, never inferred from the entry's own
  cited source URLs, its title or its aliases, and it SHALL NOT be exempted from
  the reviewed surface. Asserting that a domain belongs to an organisation is a
  judgment about who owns what, and a wrong one attributes a stranger's words to
  a named company.
- It SHALL NOT be carried in `aliases`. An alias is a **name** — the classified
  reason for `aliases[].name` is that this site is about things called
  "Claude 4.5" — and the alias registry is what decides linking, so a hostname
  there is a name the linker may one day wrap in prose. It would also force any
  consumer to guess which aliases are domains by their shape, which is the
  field-name-for-source-test substitution this requirement exists to end.

#### Scenario: A third party's measurement is not the vendor's claim

- **WHEN** a value comes from a router's own measurement of live traffic, or from
  an independent analysis site, and a surface renders what the vendor said
- **THEN** the value does not appear there, whatever its field is called, and the
  surface renders the labelled empty state for that vendor

#### Scenario: A lookalike host is not the vendor's

- **WHEN** a claim cites `https://google.attacker.example/post` and the subject is
  Google DeepMind
- **THEN** the test fails, because the registrable domain is `attacker.example`
  and neither `attacker` nor `attacker.example` is one of the subject's name
  tokens or declared domains

#### Scenario: A brand TLD is not a subdomain

- **WHEN** the subject declares `publishes_from: [deepmind.google]` and a claim
  cites `https://blog.google/...`
- **THEN** the test fails, because `.google` is a single-label public suffix, so
  `blog.google` is a different registrable domain from `deepmind.google` — and a
  claim cited from `https://deepmind.google/discover/...` passes

#### Scenario: A declared brand domain makes a real claim visible

- **WHEN** an org entry declares `publishes_from: [kimi.ai]` and a claim cites
  `https://platform.kimi.ai/blog/...`
- **THEN** the claim is attributed to that organisation, where before the same
  record rendered as a blank indistinguishable from having no claim at all

#### Scenario: A host is declared at the registrable level

- **WHEN** an entry declares `publishes_from: [platform.kimi.ai]`
- **THEN** the build fails, naming the entry, the value and `kimi.ai` as the
  value to declare instead

#### Scenario: Declaring a domain is a reviewed judgment

- **WHEN** `publishes_from` is added to an entry that carries an approved review
  record
- **THEN** that record reports `mismatched` and the entry is not cleared until a
  new verdict is recorded, because who owns a domain is a judgment and a
  judgment publishes through review

### Requirement: A claim renders labelled, attributed first, and truncated last

Where the previous two requirements make the data honest, this one keeps it
honest through a layout. Both halves below are corrections of shipped renders
that satisfied the rule as written and failed it as displayed, which is why they
are requirements rather than guidance.

- **The label rides on the claim, not on its container.** A claim SHALL be marked
  as a claim at the claim itself. A column header, a section heading or a lede
  sentence saying "these are unverified claims" SHALL NOT be the only place the
  label appears: a header scrolls away, is not read with the row, and does not
  travel when the value is quoted, linked or read by a screen reader row by row.
  Removing a per-claim marker and leaving the word in a column header was a
  shipped regression (judge finding F-sys-3-1).
- **The attributing party renders first, before the fragment it attributes.**
  Naming the party is not showing it. An attribution appended after a quoted
  fragment inside a clamped or ellipsised cell is elided before the words are,
  because truncation happens at the end of the line box — and both shipped claims
  lost their attribution that way, one breaking mid-name and dropping its
  accessed date, the other cut before the em dash and naming no source at all,
  beside a neighbouring cell that *did* name a feed (judge finding F-sys-5-1).
  So: the party first, the fragment second, and **the fragment takes the
  truncation**. The unelided quote SHALL remain reachable — from the record, and
  on any clamped surface from the rendered element itself. The rule is two-sided
  and both sides are normative: an attribution that **overruns** the clamp fails,
  and so does one that **consumes** it — R13 (v) sets that second bound at 85% of
  the clamp's visible width — since a cell showing its party and none of its
  claim satisfies "the name is visible" perfectly and fails the reader entirely.
- **The three verification states render as three different things**, and absent
  renders nothing, per the first requirement. A surface SHALL NOT collapse
  absent and `false` into one rendering, in either direction: collapsing toward
  "not verified" asserts a check nobody did, and collapsing toward silence hides
  one that was done and failed.
- **A claim SHALL render its source reachable from the page it renders on** — a
  link to `source_url` and its `accessed` date — on the same terms every cited
  fact already renders its source.
- A surface rendering claims beside values from a feed SHALL make the two
  visually distinct and SHALL NOT let a neighbouring provenance column be read as
  the claim's own attribution. The failure this prevents was measured: a "read
  from" column naming the feed sat beside a claim cell naming nothing, and the
  feed read as the claim's source.

#### Scenario: The label survives the column header

- **WHEN** a claim renders in a table whose header says the column carries
  unverified claims
- **THEN** the claim itself also carries the label, so a row read on its own —
  quoted, linked to, or announced by a screen reader — still says what it is

#### Scenario: The clamp eats the quote, never the attribution

- **WHEN** a claim renders in a cell too narrow for the whole quote
- **THEN** the vendor's name renders in full and the quoted fragment is the part
  truncated, and the untruncated quote stays reachable from the rendered element

#### Scenario: Two silences are not the same silence

- **WHEN** one claim carries no `verified` key and another carries
  `verified: false`
- **THEN** the two render differently — the first with no verification statement
  and the second with an explicit negative one
