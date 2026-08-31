# lib/fixtures/

Fixture corpora for the content build core (tasks 2.1–2.10) and the page
templates (tasks 4.1–4.14). Each directory here is shaped exactly like
`content/` and is loaded by exactly the same `loadCorpus()` / `buildSite()`
code the real build uses — a fixture that went through a simplified imitation
of the loader would prove nothing about the build.

| Directory | What it proves |
|---|---|
| `corpus/` | a valid corpus of every content type builds clean |
| `linker/` | the five linker rules from specs/wiki, end to end (task 2.6) |
| `facts/` | cited / overdue / feed / vanished fact rendering (task 2.3) |
| `currency/` | the currency-literal warning names the file and line (task 2.10) |
| `wants/` | two pages wanting one name give a count of 2 (task 2.8) |
| `surfaces/` | every page template's shapes at once (tasks 4.1–4.7, 4.14): a full entry, a stub, a dormant/retired entry, a two-rung learn ladder whose within-level order is a dependency order and not an alphabetical one, the five tutorial states, a corrected post, three listing states, two dated deltas |
| `origin/` | a stray CDN script fails the build naming page and origin (task 4.10) |
| `delta-unsourced/` | a delta whose second end has a date but no source cannot publish (task 4.14) |
| `blog-anchors/` | a note's `covers:` and `anchor:` render as dated, linked primary evidence; a synthesis renders none (task 3.6) |
| `blog-voice-negative/` | the twelve predecessor posts' extracted prose, pinned (task 3.7) — see below |
| `blog-voice-cases/` | one post per lint behaviour: trips every marker, trips none, the `&sect;` artifact, the three uncounted regions |
| `blog-voice-human/` | the human sample's measurements, transcribed — see below |
| `bad/<case>/` | one violation each, and the exact error it must produce |

The clock every fixture is written against is pinned in `test-helpers.mjs`
(`TODAY`). "Stale", "demoted" and "overdue" are relative words; a fixture
whose result changed with the calendar would not be a test.

The `bad/` cases are the load-bearing ones. A guardrail is what it does when
measured, not what it was built to do: each `bad/` corpus exists so a test can
observe the build refusing, and so that breaking the rule in the
implementation makes a test fail rather than making a wrong page.

## The two voice-calibration corpora

`openspec/style/blog-voice-calibration.md` is the record of record for both.
These directories exist so the voice lint's behaviour on them is asserted every
`npm test`, and so that a lint edit which silently moves a firing count fails a
test instead of passing quietly.

**`blog-voice-negative/`** — the twelve predecessor blog posts at commit
`d34040b` (`app/blog/<slug>/page.js`), labeled by the maintainer as "obviously
AI generated" on this exact surface and subject. What is pinned is the
**extracted prose**, not the JSX: the lint reads Markdown in `content/blog/`,
the calibration instrument is a JSX extractor, and pinning the extractor's
output is what lets the fixture outlive `d34040b`'s eventual garbage
collection. The extraction re-ran that documented instrument on 2026-08-30 and
reproduces the calibration record's per-document table exactly — all twelve
word counts, semicolon counts, em-dash counts, self-narration counts and
What/Why/How header counts, and every per-marker and union firing count.
Headers are `##`-prefixed; the `post-meta` chrome line at the top of each file
is part of what the record measured and is kept for that reason.

**`blog-voice-human/`** — measurements, not prose, and the difference is the
honest part. The nine-piece human sample was fetched during the original
derivation and **never committed**; the calibration record states that the
derivation did not keep the URLs, and that its one union fire is a **chrome
artifact** of one particular fetch (the MIT Technology Review page's nav rail
and "Deep Dive" section label). Re-fetching would therefore produce a
different corpus with different numbers and, by the record's own account, would
not reproduce the 1-of-9 count. So what is pinned is the record's transcribed
statistics, and the test they support is a threshold regression: the per-piece
maxima the record states sit below every coded threshold, so a lint edit that
lowered one — dropping the semicolon line from 2.5 to 2.0, say, past the
sample's 2.15 maximum — fails. That is weaker than an instrument test on the
prose, and it is labeled as weaker rather than dressed up as one.
