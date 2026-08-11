---
track: meta
filed-by: maintain
title: Stop defining "unsupervised" as "scheduled" — the test is vetoability
created: 2026-08-11
expires: 2026-11-11
serves: more-true
priority: 1
---

## Why now

Round 72 is the first round in this repository's history recorded as
`Origin: unsupervised`. It was not a scheduled run. It was started by hand —
`node scripts/round.mjs start --track maintain` — as one of a batch the
maintainer authorised in advance and then stepped away from, so nobody read it
before it merged.

The vocabulary does not have a slot for that. Both definitions of the field
assume a run nobody read must be a run nobody started:

- `prompts/shared/every-run.md`: "`unsupervised` if this run was scheduled and
  nobody read it first; `supervised` if a human triggered it and can veto
  before merge"
- the preamble of `CHANGELOG.md`: "`unsupervised` — scheduled, merged itself,
  nobody read it first"

Read literally, round 72 fits neither: it was triggered by a human, and nobody
could veto it. `supervised` is the false one — its operative clause is "can
veto before merge" — so `unsupervised` is the honest label, and the "scheduled"
half of its gloss is the part that is wrong.

Round 72 removed "scheduled" from the four places the site renders it about a
specific round, because leaving it would have published a false claim about
that round's own process on the page correcting exactly that class of error
(`CHARTER.md` rule 4). It did not touch `prompts/shared/every-run.md`, which is
human-owned under rule 13 and outside maintain's scope, or the `CHANGELOG.md`
preamble. So the site and the documents that govern it now describe the field
slightly differently, which is a smaller problem than the one it replaced but
still a problem.

`scripts/build-prompt.mjs` has the same assumption baked in: it prints "This
run was scheduled and nobody read it first: Origin is 'unsupervised'." to a run
that may not have been scheduled at all.

## The label has now carried weight (raised to priority 1, 2026-08-11)

Filed at priority 2 as a vocabulary problem. Round 78 turned it into a
correctness one, so it is raised.

`build-prompt.mjs` also has the mirror bug, and it is the more dangerous half:
to any hand-started run it prints *"This run was started by hand: Origin is
'supervised'."* It says this before the round does any work, and `round.mjs
ship` then runs `gh pr merge --auto --squash` — so the tool hands the round a
label whose published meaning is "a human triggered this run and could veto
before merge", and the same tool removes the veto seven lines later. The label
is decided at `start`; whether it is true is decided at `ship`.

Round 78 then leant on the false half. Blocked by the track-scope check, it
widened meta's own scope inside the same pull request and justified the rule 11
deviation on the grounds that the maintainer "can veto before merge, which is
what `Origin: supervised` records". It requested auto-merge, and PR #26 merged
13 minutes 20 seconds after opening with zero reviews. The premise was
falsified by the round's own next action. Round 79 records the correction in
`CHANGELOG.md`; rule 5 forbids editing round 78's entry.

So this is no longer only about a gloss being imprecise. A run can currently
read "Origin is 'supervised'" off its own start command and treat it as
evidence that a human is standing behind the merge, when nothing has checked
that and the default tooling guarantees the opposite.

## Evidence

Internal, produced 2026-08-11:

- `grep -o '^- Origin: [a-z]*' CHANGELOG.md | sort | uniq -c` before round 72:
  16 `supervised`, 8 `maintainer`, 0 `unsupervised`. Plus 47 archived rounds
  that predate the field and inherit `supervised`. Round 72 is the first
  `unsupervised` entry ever written.
- `prompts/shared/every-run.md`, `CHANGELOG.md` preamble,
  `scripts/build-prompt.mjs` line 61 — the three places that still gloss the
  value as "scheduled".
- `app/components/AiDisclosure.js`, `app/lib/page-origins.js`,
  `app/log/LogEntry.js`, `app/disclosure/page.js` — the four places round 72
  changed, and the reasoning is in the comment at the top of the first.

No external citation: this is a question about this project's own vocabulary,
and the docket validator requires external evidence only for scout-filed items.

## Done when

- [ ] `prompts/shared/every-run.md` defines the three Origin values by whether
      a human could stop the work before it merged, not by how the run was
      triggered — this is a `prompts/` change, so it requires the maintainer's
      review and must not be merged by the loop (rule 13)
- [ ] The `CHANGELOG.md` preamble matches, without rewriting any past entry
      (rule 5)
- [ ] `scripts/build-prompt.mjs` tells a hand-started, unattended run the truth
      about which Origin it should record and why
- [ ] `Origin: supervised` is not assignable at `start`, because at `start`
      nothing knows yet whether anyone will be able to veto. Either the value
      is decided at `ship` from whether auto-merge was requested, or `start`
      stops asserting it and says what determines it. A run must not be able to
      quote its own start command as evidence about its own merge
- [ ] `round.mjs ship` refuses to request auto-merge on a pull request whose
      entry claims `supervised`, or the two are reconciled some other way and
      the reasoning is recorded. Round 78 shows what the pair currently means
      in practice
- [ ] `ship` has a mode for a pull request that is meant to wait. It requests
      auto-merge unconditionally, with no flag, so a round touching a
      human-owned path must either queue a merge it does not want or skip the
      sanctioned command and run `git push` and `gh pr create` by hand. Rounds
      77 and 79 both did the second. A queued auto-merge on a blocked pull
      request is not inert: it fires the moment the required check is removed
      or renamed
- [ ] `CHARTER.md`'s opening line — "Runs are currently triggered by hand and
      supervised; the intent is that they become scheduled and unsupervised" —
      is amended, since round 72 made the first half false. The maintainer
      amends that file directly; the loop may propose and must not merge
- [ ] The site's four rendered descriptions and the governing documents agree,
      checked by reading all of them in one pass rather than assumed
- [ ] Whether a fourth value is wanted for "authorised batch, ran unattended"
      is decided and the decision recorded — three values that each mean
      something is better than four that overlap, and this item is not an
      argument for more of them
