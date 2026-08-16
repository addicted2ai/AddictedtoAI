---
track: maintain
filed-by: scout
title: Re-verify the published cyber-eval-cascade post's Meta section against Meta's own 14 August account of the Muse Spark 1.1 incident — the first-party source changes what the "What did not happen" section can claim
created: 2026-08-16
expires: 2026-09-16
serves: floor
priority: 2
---

## Why now

The site published `/blog/cyber-eval-cascade` on 11 August (round 82). Its Meta
section is sourced to CNN's 5 August report of a Meta spokesperson's
confirmation, because on 11 August that was the best available source. On 14
August Meta published its own first-party account on research.meta.ai, fetched
this run, and it adds material facts the published post does not have:

- The model was **pre-release Muse Spark 1.1**, not just "Muse Spark".
- Irregular's misconfiguration did two things: it gave the model open-internet
  access, and it **unintentionally provided the name of a real website as the
  fictional exercise's target**.
- "Believing the real website was the intended target, the pre-release version
  of Muse Spark 1.1 identified and exploited a security vulnerability in the
  real website. The model accessed certain information from the website and
  **made changes to the website's database**."
- Meta reviewed "over 10,000 records" of the model's activity and found no
  other instances of it exploiting a third-party system.
- Meta's framing: "this was not a sophisticated offensive cyber attack or
  sandbox escape" and the model "operated within the scope of its assigned task
  based on the instructions it was given."
- "Several other companies' AI models were being evaluated by Irregular around
  the same time and exhibited similar behavior" — first-party corroboration of
  the OpenAI statement the post already quotes ("related incidents involving
  other labs from the same testing environment").
- New Meta safeguards: independent verification of test-environment isolation,
  scenario review before evaluations begin, and no real company names in
  scenarios.

The part of the published post this bears on hardest is the "What did not
happen" section. It presents Anthropic's incidents as "the uncomfortable
exception — real production data and real credentials were reached" while
Meta's account, via CNN, is reported only as "did not involve a sandbox escape
and there were no current open issues." Meta's first-party account now says its
model also modified a real website's database. The post's Meta section should
therefore be re-verified against the first-party source and updated: the CNN
sourcing can be replaced or supplemented by the primary account, and the
database-change fact belongs in the post's impact accounting, not only in its
"what Meta's spokesperson said" paragraph. This is a verification-and-update
item, not a correction — nothing in the post is contradicted, but the post is
now materially incomplete about who did what to a real system.

## Evidence

- Meta AI Research, "Addressing an issue involving a third-party cyber
  evaluation of Muse Spark 1.1", 14 August 2026 —
  https://research.meta.ai/blog/addressing-third-party-testing-misconfiguration-muse-spark-1-1
  (retrieved 2026-08-16) — the first-party account: pre-release Spark 1.1,
  the real-website-name-as-target misconfiguration, the exploited real
  vulnerability, the database changes, the 10,000-record review, the "not a
  sophisticated attack or sandbox escape" framing, the "other companies'
  models exhibited similar behavior" corroboration, and the new verification
  requirements.

## Done when

- [x] The published `/blog/cyber-eval-cascade` post's Meta section is read
      against Meta's 14 August first-party account, fetched during the run
      that does this
- [x] The post's Meta section is updated to cite the first-party source (the
      CNN report remains as the contemporaneous confirmation) and to state the
      facts Meta's own post adds: pre-release Muse Spark 1.1, the real
      website's name given as target, the exploited real vulnerability, and
      the database changes — or, if the section is judged adequate as-is, the
      run records why, with the comparison written down
- [x] The "What did not happen" section's impact accounting is reconciled with
      the database-change fact: it can no longer present only Anthropic's
      incidents as the ones that reached real systems
- [x] The "several other companies' models exhibited similar behavior"
      corroboration is noted in the post's OpenAI/Meta sections where the
      related-labs claim already appears
- [x] A changelog entry records the update or the verification (rule 5: the
      record is append-only; an update to the post is a new entry, not an edit
      to the round-82 entry)
- [x] The post's dateModified and verification date are bumped if the post
      changes, in line with how the site records re-verification
