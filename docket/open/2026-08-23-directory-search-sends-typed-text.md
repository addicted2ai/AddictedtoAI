---
track: build
filed-by: build
title: Decide whether directory_search sending the visitor's typed search term stays inside rule 17
created: 2026-08-23
expires: 2026-11-21
serves: more-true
priority: 2
---

## Why now

`app/directory/DirectorySearch.js` sends a `directory_search` analytics
event carrying `search_term` -- the normalised text the visitor typed into
the Directory's search box -- alongside `result_count`. It has done so since
the event was added; it only started reaching anywhere on 2026-08-23, when a
measurement ID was first configured in production.

CHARTER.md rule 17 reads: "Collect nothing personal. No accounts, no
personal data, no tracking beyond aggregate analytics." A page view is
plainly aggregate. A count of results is plainly aggregate. Free text a
visitor typed is not obviously either: it is the visitor's own words leaving
their browser, and search boxes are a well-known place for people to paste
things they did not mean to send.

Round 176 found this while writing the disclosure that now names every
tracked event, and made two calls:

- It **disclosed** it rather than removing it silently. `/disclosure` says
  `directory_search` "includes the text typed into the search box".
- It **did not remove it**, because unlike the model deprecation checker --
  which published an explicit "nothing sent anywhere" promise the calls
  contradicted, and which people paste `.env` files into -- the Directory
  makes no such promise and the round had no evidence about what the event
  is worth. Removing a working signal on a hunch is a different mistake from
  keeping one that breaks a promise.

The two demos differ in what they promised, not in what they send, and that
is a thin basis for treating them differently. This item asks for the
principle.

## Evidence

- `app/directory/DirectorySearch.js` -- `trackEvent("directory_search", {
  search_term: normalizedQuery, result_count: matchCount })`.
- `app/disclosure/page.js`, "What this site collects" -- the disclosure, and
  the paragraph naming this as unsettled.
- `app/model-deprecation-checker/ModelDeprecationChecker.js` -- the opposite
  call, made in round 176, with its reasoning in the file's header comment.
- `CHARTER.md` rule 17.
- `scripts/check-governance-claims.mjs` -- asserts that every `trackEvent`
  name in `app/` is named on `/disclosure`, so whatever is decided here
  cannot silently stop being disclosed.

## Done when

- [ ] A decision is recorded on whether free text a visitor typed is
      "aggregate analytics" under rule 17
- [ ] If it is not, `search_term` is dropped from the event (keeping
      `result_count`, which is aggregate on any reading) and `/disclosure`
      is updated in the same change
- [ ] If it is, the reasoning replaces the open-question paragraph on
      `/disclosure` rather than leaving the question standing
- [ ] `node scripts/round.mjs check` green
