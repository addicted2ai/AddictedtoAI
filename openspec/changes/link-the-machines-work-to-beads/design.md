# Design: link-the-machines-work-to-beads

`addictedtoai-occ0` left three questions open and asked that they be settled
rather than assumed. All three are settled here, with the reasoning, because two
of the answers differ from what the issue expected.

---

## D1. Does a `DIRECTIVES.md` line get an id syntax?

**No. Ids are harvested from the line's prose, and no syntax is added.**

The issue framed this as a choice between *"an id syntax"* and *"exempt because
the maintainer types it and can name an issue in the prose."* The framing hides
a third option, which is the one taken: **make the prose mention mechanical.**

`parseDirectives` scans the line for the id pattern wherever it occurs. So:

```
- post: write up the retry ledger (addictedtoai-occ0)
```

joins mechanically, with nothing new to learn, and:

```
- post: write up the retry ledger
```

remains a perfectly ordinary directive that joins to nothing.

Three reasons this beats a syntax.

1. **The `[done …]` marker.** `markDirectiveDone` appends
   `[done <date> <job-id>]` to the line, and `parseDirectives` strips it with a
   regex. Any bracketed or delimited id syntax has to be designed not to collide
   with that, and the collision would be silent. A bare-id scan has no delimiter
   to collide with. Measured: case 4b asserts the id is still readable from a
   line carrying the exact marker the loop writes.
2. **A job id is not an issue id by shape.** `j-20260831-04` cannot match
   `addictedtoai-<id>`, so the done marker can never contribute a false
   positive. The two namespaces are disjoint by construction, not by care.
3. **Every line already in the file stays valid.** A new syntax makes existing
   lines legacy; a scan makes them simply lines that mention no issue.

The cost, stated: an id mentioned incidentally in a directive's prose — *"unlike
addictedtoai-3zf, this one is about X"* — is harvested as though the job served
it. This is accepted. The ledger's `issues` is a record of what a job was
dispatched against, it is advisory rather than load-bearing (nothing gates on
it), and a false positive costs a reader one lookup. A false *negative* — the
maintainer names an issue and the machine does not notice — is the failure this
change exists to end, and the scan has none.

---

## D2. Is the ledger field a single id or a list?

**A list.** The issue anticipated the answer and it survives examination.

- A job can genuinely serve more than one issue. A directive line can name two;
  a proposal can be filed against a pair.
- A scalar that later has to become a list is a migration **across an
  append-only file**. `data/ledger.jsonl` is never rewritten, so the migration
  would not be a conversion but a permanent bimodality: readers would have to
  handle both shapes forever, and the first reader to forget would be a silent
  bug.
- The list costs nothing today. It is **omitted entirely when empty**, so no
  line grows without cause, and `LEDGER_FIELDS` is not extended, so every one of
  the 18 lines written before this key existed stays exactly as valid.

The precedent is already in the file: `signal` and `phases` are both optional
and additive for the same reasons, and `ledger.mjs` documents `phases` as having
been added precisely because *"counting free text is how a check comes to mean
whatever the last note happened to say."* The same argument applies here — the
64 review records that mention an id in prose are exactly that free text, and
this key is the structured alternative.

**Why `LEDGER_FIELDS` is not extended, stated as its own decision.** Requiring
an id per job would manufacture backlog noise. A `verify` job triggered by an
overdue fact is routine upkeep with nothing behind it; filing an issue so that
it has something to reference would be inventing a record to satisfy a check.
The requirement belongs where work would otherwise be **lost**, not everywhere —
`addictedtoai-occ0`'s own first constraint, and the one part of its proposed
shape that survives measurement intact.

---

## D3. Do review records want an id too?

**No — but not for the reason the issue gave.**

`addictedtoai-occ0` warned that adding a key to a review record would invalidate
every existing binding, because `lib/review-hash.mjs` hashes front matter minus
`MECHANICAL_FRONT_MATTER_KEYS`. **That hazard does not exist.** Traced through
`loop/lib/review.mjs`:

```js
const h = reviewedHashOfFile(join(repoRoot, s));   // s is a SUBJECT path
```

`writeRecordSubjects` hashes each **subject content file** — the entry, post or
tutorial that was reviewed — and stores the digests in the record's `reviewed:`
map. The record's own front matter is never hashed by anything. A key added to a
review record invalidates nothing, and all 167 records are unaffected. The
warning was precautionary; it is withdrawn, and it is recorded here because it
was the stated reason not to touch reviews and a later reader would otherwise
inherit a false constraint.

The actual reason is **normalisation**. A review record already carries
`job: j-20260829-01`, and that job's ledger line now carries the issues. So:

```
review record  --job-->  ledger line  --issues-->  beads
```

The join already exists, in one hop, through a key every record already has.
Adding `issue:` to a review record would denormalise it: two places asserting
the same fact, free to disagree, with nothing to adjudicate. This repository's
own experience with exactly that shape is recorded in `review.mjs` — the
`subject:` value shape was deliberately left unchanged when the hash was added,
because *"carrying the hash inside it would break the join for every record that
already exists."* One join, one place.

The 64 records (of 167) that mention an id in prose are not evidence for
mechanising it. They are context a reviewer wrote for a human reader, and they
remain exactly as useful as they were. Nothing is asked of them and nothing is
taken away.

---

## D4. Where the guardrail is NOT placed, and why that is the main finding

`addictedtoai-occ0` proposed making the sweep to `data/proposals/dropped/` the
mechanical trigger and called it **"the load-bearing half."** Measurement says it
carries no load: the expiry sweep **has never fired**, and neither has the
over-cap drop, the duplicate discard, or the self-amplification discard. Of the
five retirement paths, only consumption has ever executed, twice.

All ten files that motivated the issue arrived through a door none of those
mechanisms watch: a scout executor writing decline records straight into
`dropped/` as ordinary job output. And those ten are not losses at all — they
are what `make-the-blog-worth-sending` **requires**, and all ten comply, naming
their failed test and a refile condition.

So a requirement hung on the sweep would have been inert twice over: guarding a
path with no traffic, against a loss that is not occurring. That is precisely
the *reads-as-present-and-does-nothing* shape this repository keeps catching,
and it would have been introduced by a change whose stated purpose was to
prevent exactly that.

The lesson generalises and is filed as `addictedtoai-fvoo`: **before attaching a
requirement to an existing mechanism, measure whether that mechanism has ever
run.**

What is genuinely missing at that door is different, and is filed as
`addictedtoai-fyd3`: the drop-record requirement has **no check at all**. Ten of
ten complied voluntarily, which is a well-behaved executor rather than a
guardrail. It is not fixed here because it is a different requirement — the
record's own declared content, needing no beads id — and because an outage fix
should not carry a redesign.
