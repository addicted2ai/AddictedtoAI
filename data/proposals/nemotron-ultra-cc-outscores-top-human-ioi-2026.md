---
date: 2026-09-05
slug: nemotron-ultra-cc-outscores-top-human-ioi-2026
type: post
summary: >
  A post on arXiv:2609.02849v1 (submitted 2026-09-02), "Post-Training Language
  Models for Gold-Medal Performance in Coding Competitions" — the NVIDIA paper
  reporting that Nemotron-3-Ultra-CC (550B-A55B) scored 535.4 out of 600 on the
  IOI 2026 problem set, above the 361.12 gold threshold and above the top human
  contestant's 498.27, which the authors call "the first AI system to outscore
  the highest-scoring human contestant on an IOI problem set". The reason this
  is worth a post rather than a headline is that the paper is unusually careful
  about what it is not: the run was prospective but unofficial and unsupervised
  by the IOI, the score is excluded from official rankings, it is a single run,
  and the authors explicitly frame it as "a system-level comparison under the
  same time and submission limits, rather than an equal-resource comparison with
  human contestants". The post carries the result and its own authors' caveats
  together, which is exactly what the secondary coverage is stripping out.
evidence: >
  arXiv:2609.02849v1, "Post-Training Language Models for Gold-Medal Performance
  in Coding Competitions", Aleksander Ficek, Sean Narenthiran, Mehrzad Samadi,
  Somshubra Majumdar, Boris Ginsburg (NVIDIA); v1 submitted 2026-09-02, single
  version at retrieval. Abstract page https://arxiv.org/abs/2609.02849v1 and
  full text https://arxiv.org/html/2609.02849 both fetched 2026-09-05.

  Quoted from the fetched text: "it scored 535.4 out of 600, exceeding both the
  gold threshold of 361.12 and the top human score of 498.27"; "Under the same
  time, internet-access, and submission constraints as human contestants";
  "internet access was prohibited, local code execution was permitted, and each
  problem allowed up to 50 submissions with one submission allowed per minute";
  "We evaluate our system prospectively on the IOI 2026 problem set during the
  official competition and before the problems were publicly available"; "Our
  system was not an official IOI contestant and the run was not supervised by
  IOI. Therefore, its score was not included in the official rankings and the
  evaluation is reported as an unofficial, unsupervised benchmark"; and the
  framing as "a system-level comparison under the same time and submission
  limits, rather than an equal-resource comparison with human contestants".
  IOI 2025 figures also reported: Nano-CC 130 -> 291 after post-training -> 468
  with GenCorrect against a 438.3 gold threshold; Ultra-CC 502. Models named
  Nemotron-3-Nano-CC (30B-A3B) and Nemotron-3-Ultra-CC (550B-A55B), trained on
  22,000 curated problems with synthetic reasoning traces, SFT and RL.

  Secondary confirmation that the claim is circulating without its caveats:
  startuphub.ai "Major AI developments: 4 September 2026" surfaced 2026-09-05 —
  https://www.startuphub.ai/ai-news/artificial-intelligence/2026/major-developments-2026-09-04
  — reports the 535.4 and 498.27 figures with no mention that the run was
  unofficial and unsupervised.

  RETRIEVAL CAVEAT: the quotes above came through WebFetch's extractor. This
  repository has recorded that extractor as unreliable in both directions, so
  every quote the post uses must be re-confirmed against the arXiv HTML or the
  PDF before publication.
expires: 2026-09-12
proposed_by_job: j-20260905-05
proposed_by_type: scout
---

# An AI outscored the best human at IOI 2026, and its own authors say what that does not mean

## Why now

The paper went up three days ago and the number is already travelling without
its qualifiers. That is the whole opportunity: by the time this claim settles
into general knowledge it will have settled as "AI beat the best human
programmer", and the four sentences in the paper that constrain it will be gone.
Writing it now, from v1, with the authors' own caveats attached, is worth more
than writing it in a month.

It is also a genuinely large result. IOI gold thresholds and top-contestant
scores are published numbers; 535.4 against 498.27 is not a benchmark the vendor
designed, and the run was done prospectively, during the competition, on
problems that were not yet public. That last detail rules out the failure mode a
skeptical reader reaches for first — contamination — and it deserves to be said
as clearly as the caveats are.

## Would-send test

"NVIDIA ran a model on the IOI 2026 problems live, during the contest, before
they were public — it scored 535.4 out of 600 against the top human's 498.27,
and the paper says plainly it wasn't an official or supervised run." Sent to
anyone who did competitive programming, anyone who argues about benchmark
contamination, anyone tracking whether the frontier is real. The second clause
is what makes it sendable rather than noise, and it is the site's whole value
add here.

## True, checkable, current

A single primary document with a pinned version, a named author list, public
comparison figures, and — unusually — the caveats coming from the authors
themselves rather than from a critic. Three days old.

## What the job would produce (done-when)

- The post cites **arXiv:2609.02849v1 specifically**, with the version pinned,
  because the claim is tied to a date and this repository's rules require the
  pin. The submission date (2026-09-02) and the retrieval date are both stated.
- Every quoted sentence is re-confirmed against the arXiv HTML or the PDF, not
  carried over from this docket's extractor output. Where the HTML and the PDF
  differ, the PDF is quoted and the post says so.
- The headline numbers are exact and attributed: 535.4/600, gold threshold
  361.12, top human 498.27.
- **The authors' own limits are given the same prominence as the result**, in
  their words: not an official contestant, not supervised by IOI, excluded from
  official rankings, reported as "an unofficial, unsupervised benchmark", a
  single prospective run, and explicitly "not an equal-resource comparison with
  human contestants".
- The competition conditions are stated concretely — internet access prohibited,
  local code execution permitted, up to 50 submissions per problem at one per
  minute — because "same constraints as humans" means those specific things and
  a reader cannot evaluate the claim without them.
- The prospective-evaluation detail is stated as the contamination answer it is:
  evaluated during the official competition, before the problems were public.
- The IOI 2025 results are included as the trend line, with the GenCorrect
  contribution distinguished from post-training so the post does not attribute
  the whole gain to one intervention.
- The model is identified precisely as Nemotron-3-Ultra-CC (550B-A55B), a
  competition-specialised system, and **distinguished from the shipped
  Nemotron 3 Ultra** — this site's own change feed records the retirement of
  `nvidia/nemotron-3-ultra-550b-a55b:batch` on 2026-09-03, and a reader must not
  conclude the IOI system is a model they can call.
