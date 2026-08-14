# Prompts

One prompt per track, plus a shared preamble every run reads first and a shared
contract every review session reads.

```
prompts/
  shared/every-run.md      read first, by every track
  shared/review.md         read by every session dispatched to review a round
  tracks/scout.md
  tracks/author.md
  tracks/build.md
  tracks/maintain.md
  tracks/audit.md
  tracks/meta.md
```

## Why per-track

A single prompt covering every kind of run collapses toward the safest reading
of "improve the site" — which is meta-work, and which is how rounds 38–48
became successively finer refinements of the site's own scaffolding.

The tracks have incompatible success conditions. A scout run that writes code
has failed. An author run that files backlog items instead of publishing has
failed. Six short prompts state those conditions plainly; one long prompt
cannot, because the conditions contradict each other.

The charter is referenced, never restated. Six inlined copies would drift, and
drift in the charter is the one thing that cannot be allowed to happen quietly.

## The track is not the model's to choose

Track selection is made before the run starts, from the docket and the quotas
in the policy file. A run is told which track it is and reads only that prompt.

This matters more than it sounds. "What kind of work should I do?" is precisely
the lever that produced the spiral: given the choice, a model picks the work it
can see, and what it can see is its own repository. A run may argue in its write
up that the wrong track was chosen. It may not switch.

## Tool scope

Two mechanisms, because neither is sufficient alone.

**`allowedTools`** removes capabilities. A scout run has no `Edit`, so it
cannot modify existing code — not "should not", cannot.

**Path scope**, enforced by `scripts/check-track-scope.mjs` in CI, restricts
which files a run may change. This is the stronger of the two, because
`allowedTools` cannot scope `Write` to a directory: scout needs `Write` to file
docket items, and without a path check that permission would extend to every
file in the repository.

The track is read from the branch name, which must be `loop/<track>/<slug>`.

| Track | Tools withheld | May modify |
| --- | --- | --- |
| scout | `Edit` | `docket/`, `CHANGELOG.md` |
| author | — | `app/`, `public/`, `docket/`, `CHANGELOG.md` |
| build | — | `app/`, `public/`, `scripts/`, `package*.json`, `docket/`, `CHANGELOG.md` |
| maintain | — | as build |
| audit | — | as build |
| meta | `WebSearch`, `WebFetch` | `scripts/`, `.github/`, `prompts/`, `CHARTER.md`, `lighthouserc*.json`, `docket/`, `CHANGELOG.md` |

Meta has no web access on purpose. Its charge is to fix what is stopping the
other tracks from working, and that answer is always inside the repository.
Given a search tool it could justify almost any machinery change by finding an
article recommending it.

Meta may write to `.github/`, `prompts/` and `CHARTER.md` — those are the files
it exists to propose changes to. It cannot merge them: `CODEOWNERS` requires
human review there, and auto-merge waits on required reviews. Rule 13 stands,
and is enforced at the merge rather than at the edit.

## Every run

Reads `prompts/shared/every-run.md` first, then its own track prompt. That file
carries what does not vary: the charter, the docket, the preflight, how to write
the record entry, and when to stop without producing anything.
