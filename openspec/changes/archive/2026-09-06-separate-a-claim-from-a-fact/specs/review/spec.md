# review — delta for separate-a-claim-from-a-fact

One requirement added. Nothing here changes the verdict list, the closed reason
list, the `would-cite` and `reads-human` fields, the revision mechanics, the
hash binding, or the four-state join. The existing checklist requirement, "What
is checked depends on what the work is", is left untouched: this adds a
checklist for a record type that did not exist when it was written, rather than
restating it.

## ADDED Requirements

### Requirement: A claim record is judged against the bytes of the source it quotes

A claim record is a verbatim quotation, a host, a date and a verification state,
transcribed by a model from a page the reviewer can fetch. Every one of those is
checkable, and each has a failure mode that a reader of the diff alone would
miss. Where a diff contains claim records, the reviewer SHALL additionally:

**The build can check every field of this record except the one that matters.**
`source_host` is a string comparison, `subject` is a corpus lookup, `accessed` is
a date, `verified: true` is a shape — all of them gates. `quote` is none of them:
verbatim-ness is a comparison against a document the build never fetches, and a
build that did fetch it would make every rebuild depend on a third party's
uptime and on the page not having changed since. So this one clause belongs to
the reviewer and to nobody else, and there is no gate to fall back on if the
reviewer skips it.

- **Fetch `source_url` and confirm `quote` is present in the fetched bytes,
  verbatim.** Plausibility is not verification. The instrument SHALL be ruled out
  before absence is concluded — inflate compressed streams and read
  parenthesised text literals, expect ligatures and escaping, and search
  fragments that straddle neither. A quote that is genuinely absent from the
  document is `false-or-unsupported-claim`; a quote absent from one representation
  of a document is a misattribution to be traced before it is called anything
  worse.
- **Confirm `source_host` equals the host of `source_url`,** and judge the vendor
  test's *input* rather than its output: is this host really a place the subject
  publishes from? The check itself is mechanical, but what it compares against is
  a declaration somebody made, and a wrong `publishes_from` value attributes a
  stranger's words to a named company. Where the diff adds a `publishes_from`
  value, the reviewer SHALL confirm the domain independently and say how.
- **Read `verified` for what it asserts.** A record claiming more than was done
  is `intent-not-measurement`: `verified: {by, url, date}` requires that the named
  document actually supports the confirmation, fetched and confirmed, not
  described. A `verified: false` requires that a check happened and failed, and
  the reviewer SHALL reject a `false` written as a placeholder for "nobody
  looked" — absence is how that is spelled, and the difference is the whole point
  of the three states.
- **Check that nothing in the diff turns a fact into a claim.** A cited fact
  moved into a claim record, or a claim record filed for a value that is a
  measurement by a third party rather than an assertion by the subject, is
  `spec-violation` against the requirements in `wiki` — and it is the specific
  defect this record type was created to end, found twice in shipped work by two
  independent builders.

The standing instruction is unchanged and applies here in its sharpest form: for
every claim about what something does, run the cheap direct check; for every
sourced claim, confirm the source supports it. A claim record is the one content
shape in this corpus whose entire content is a sourced claim.

#### Scenario: The quote is confirmed against the document, not the diff

- **WHEN** a diff files a claim record quoting a vendor's launch post
- **THEN** the reviewer fetches that post and the verdict cites the fetch and
  what was found in it, not the record's own description of the source

#### Scenario: A verification state that outruns the work is rejected

- **WHEN** a record declares `verified: {by, url, date}` and the named URL does
  not support the claim
- **THEN** the reviewer returns a non-approval citing `intent-not-measurement`,
  naming the record and the URL

#### Scenario: A placeholder negative is not a finding

- **WHEN** a record declares `verified: false` and nothing in the diff or the
  job's evidence shows that a check was attempted
- **THEN** the reviewer requires the key removed rather than left, because absent
  means nobody looked and `false` means somebody looked and failed

#### Scenario: A measurement filed as a claim is a spec violation

- **WHEN** a diff files a claim record whose source is a third party's
  measurement of the subject's product rather than the subject's own statement
- **THEN** the reviewer returns a non-approval citing `spec-violation`, naming
  the requirement in `wiki` that a claim is the subject's own only when the
  source is
