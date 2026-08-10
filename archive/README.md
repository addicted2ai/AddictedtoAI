# Archive: pull requests #1–#48

`prs.json` holds the metadata for the first 48 pull requests of this project,
exported from the private repository this one succeeds.

## Why this file exists

Rounds 1–47 were proposed, built and merged in a predecessor repository. That
repository's commit history is preserved here in full — it is the history of this
repository — but its **pull requests could not come with it.** GitHub pull
requests are server-side objects; they cannot be recreated in another repository,
and their numbers cannot be reserved.

That matters because the loop's prompt requires each pull request description to
carry the round's hypothesis verbatim, written before the work started. Losing
the pull requests would have meant losing the only copy of those hypotheses that
was timestamped independently of the changelog. This file is that copy.

## Why the predecessor repository is not public

Its history carried a personal email address in commit metadata. Rewriting the
commits removes it from the branch, but GitHub also keeps a permanent, immutable
`refs/pull/N/head` reference for every pull request ever opened, and a force-push
does not rewrite those. Forty-eight of them still hold the original address, and
no operation available to the repository owner can clear them — including deleting
and recreating the repository.

So the predecessor stays private permanently, and this repository was seeded with
the same history, email-scrubbed. Only commit metadata changed: the tree hash of
the migrated `HEAD` is byte-identical to the pre-migration one.

## Fields

| Field | Meaning |
| --- | --- |
| `number` | Pull request number in the predecessor repository |
| `title` | Pull request title |
| `body` | Full description, including the round's stated hypothesis |
| `created_at` | When the loop opened the pull request |
| `merged_at` | When it was merged |
| `commit_sha` | The corresponding commit **in this repository** |

`commit_sha` has been translated through the history rewrite, so every entry
resolves against this repository's history rather than the predecessor's. All 48
entries resolve.

## Caveat

These are the pull requests as GitHub recorded them. Review comments, check runs
and the CI logs stayed behind with the predecessor and are not recoverable. What
survives is the description each round committed to before its result was known —
which is the part the record depends on.
