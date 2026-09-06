---
date: 2026-09-05
slug: registry-field-rights-need-a-validator
type: machinery
summary: >
  Teach `pulse/lib/registry.mjs` to validate the `field_rights` list that job
  j-20260905-24 had to write into `data/sources/registry.json` by hand — path,
  publisher, `checked_on` date, `result`, at least one document with a URL, a
  fetch date and a quote — and refuse two things the prose of that file already
  forbids but no code enforces: a `field_rights` entry that also appears in
  `declined_fields` for the same path (a publisher permits and this repo
  refuses is coherent; the reverse pairing is not), and a `result` that asserts
  clearance while the same path sits in `material_fields` with no attribution
  mechanism named. Add the test beside `pulse/tests/registry.test.mjs`, which
  already covers `declined_fields` the same way.
evidence: >
  Written from doing the work. j-20260905-24 checked Design Arena's terms
  (https://docs.designarena.ai/introduction.md and
  https://www.designarena.ai/terms-and-conditions, both fetched 2026-09-05) and
  had nowhere in the registry schema to put the answer: `material_fields` means
  carried, `declined_fields` means refused after a measurement, and neither one
  means "the publisher permits this, on a condition we do not yet meet". The
  job added a `field_rights` array because that state had to be recordable, and
  `loadRegistry` accepts it only because it ignores keys it does not know —
  the same silence `lib/schema.mjs` refuses to give content front matter, where
  `alias:` written for `aliases:` is a build error by design. The file's own
  `declined_fields_note` argues the general case at length: a field in no list
  is indistinguishable from a considered decision, "which is what a field looks
  like when the vendor added it after this entry was written". An unvalidated
  rights record is the same defect one level up — a decision in a shape nothing
  checks, which will read as settled and enforce nothing.
proposed_by_job: j-20260905-24
proposed_by_type: verify
---

`validateDeclinedFields` exists because a refusal with no dated measurement
behind it is "the undecided state wearing a label". A rights record with no
document, no quote and no date is the same thing about a different question,
and it is now in the file.

What the validator should require, all of it already present in the one entry
written by hand so nothing has to be invented:

- `path`, non-empty string, unique within the list;
- `publisher` and `publisher_url`;
- `checked_on`, an ISO date, matched by the same `DATE` regexp
  `validateDeclinedFields` uses;
- `result`, a non-empty string;
- `documents`, a non-empty array, each carrying `url`, `fetched_on` (ISO date)
  and `quote` — because the whole value of the record is that a later reader
  can go back to the words, and a rights note with no quotation is an opinion;
- `note`, non-empty, on the same reasoning as the refusal note.

And the two cross-list checks, which are the part a schema alone would miss:

1. **A path may be in `field_rights` and `declined_fields` at once, and must
   not be in `field_rights` twice.** The first pairing is real — the publisher
   permits, this repo declines on materiality — and the validator should
   permit it explicitly rather than by omission, so the next reader knows it
   was considered.
2. **A path whose `result` asserts clearance and that also appears in
   `material_fields` should have to name its attribution mechanism**, in a
   field, when the recorded conditions include one. Design Arena's grant is
   conditioned on a visible credit and link; the failure mode is not a missing
   column, it is a rendered value in breach of the terms that allowed it, and
   that is exactly the kind of thing this repository fails the build over
   elsewhere.

Scope is one file plus its test. It does not decide any rights question and it
does not make anything render.
