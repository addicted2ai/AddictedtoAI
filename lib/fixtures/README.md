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
| `bad/<case>/` | one violation each, and the exact error it must produce |

The clock every fixture is written against is pinned in `test-helpers.mjs`
(`TODAY`). "Stale", "demoted" and "overdue" are relative words; a fixture
whose result changed with the calendar would not be a test.

The `bad/` cases are the load-bearing ones. A guardrail is what it does when
measured, not what it was built to do: each `bad/` corpus exists so a test can
observe the build refusing, and so that breaking the rule in the
implementation makes a test fail rather than making a wrong page.
