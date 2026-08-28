# lib/fixtures/

Fixture corpora for the content build core (tasks 2.1–2.10). Each directory
here is shaped exactly like `content/` and is loaded by exactly the same
`loadCorpus()` / `buildSite()` code the real build uses — a fixture that went
through a simplified imitation of the loader would prove nothing about the
build.

| Directory | What it proves |
|---|---|
| `corpus/` | a valid corpus of every content type builds clean |
| `linker/` | the five linker rules from specs/wiki, end to end (task 2.6) |
| `facts/` | cited / overdue / feed / vanished fact rendering (task 2.3) |
| `wants/` | two pages wanting one name give a count of 2 (task 2.8) |
| `bad/<case>/` | one violation each, and the exact error it must produce |

The `bad/` cases are the load-bearing ones. A guardrail is what it does when
measured, not what it was built to do: each `bad/` corpus exists so a test can
observe the build refusing, and so that breaking the rule in the
implementation makes a test fail rather than making a wrong page.
