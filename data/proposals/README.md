# data/proposals/

The only model-originated source of work (`specs/loop`). One markdown file
per proposal, front matter declaring a date, a kebab-case `slug`, the job
type it proposes (from the closed list), a one-paragraph summary, and the
evidence that prompted it.

A proposal cools for at least 3 days (file age) before it is selectable,
unless it declares an `expires:` date, which buys it selection without cooling
and a sweep at expiry.

**Only the files directly in this directory are candidates.** `readProposals`
lists top-level `.md` files, so moving one into a subdirectory is what retires
it. There are three, and only one of them blocks anything:

| Subdirectory | What lands there | Blocks a later filing of the same slug? |
|---|---|---|
| `rejected/` | a reviewer's rejection, an exact-slug duplicate, a job proposing its own type | **yes** — this is the rejection index |
| `dropped/` | a candidate past its `expires:`, and anything over a job's candidate cap | no |
| `consumed/` | the proposal a job was selected from, once that job merged | no |

`consumed/` carries a note naming the job and the piece it produced. It is a
record and never a block: being written about once is not a reason a subject
may never be written about again. Only a merged, `done` job consumes its
proposal — if the reviewer discarded the work, the idea stays here and stays
selectable.
