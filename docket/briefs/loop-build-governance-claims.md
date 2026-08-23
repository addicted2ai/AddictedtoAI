Branch: loop/build/governance-claims
Track: build

# Round 176 — the site is wrong about its own governance

Branch: `loop/build/governance-claims`, created for you at `origin/main`.
Track: **build**. Do not create or switch branches. Work in `D:/AddictedtoAI`.

## Why this round exists

An audit today checked the site's standing claims against the tree. Twenty-one
held. **Four were false and live on production, and three of those became
false on 2026-08-22 when the delegation changed the code underneath them.**
Nothing on the site was positioned to notice. Two more were found afterwards,
by the maintainer and by a consequence of today's own changes — six in total,
listed below.

This is not a cosmetic problem. This site's entire proposition is that its
public record is honest. It is currently telling visitors something untrue
about how much autonomy the loop has — and telling them two contradictory
things on two different pages.

I verified findings 1–4 and 6 myself; the commands are in the Premises.
Finding 5 rests on the maintainer's attestation and cannot be verified by
command, which is the point of it.

### 1. The homepage states the withdrawn version of rule 13

`app/page.js`, the hero lead — the first paragraph a visitor reads:

> a charter the loop works inside and **can propose changes to but may not
> merge**

`CHARTER.md:265-270` says of that exact prohibition: *"The prohibition is
withdrawn here, not reinterpreted."* `/charter` leads with "The loop may now
amend this document itself." **The homepage and the charter page contradict
each other**, and the homepage has the false half.

### 2. `/charter` promises two corrections and renders one

`app/charter/page.js:240`: "**Two claims** in this document were found false by
round 81 (audit)… marks each falsified claim with the correction beside it."
One of the two claims was rewritten out of `CHARTER.md` on 2026-08-11, so its
aside no longer renders. The page renders one correction while promising two.

**Read this part carefully:** PR #135, titled *"make the charter page true
again"*, edited this very paragraph on 2026-08-22 and left the count standing.
A round aimed precisely at this defect walked past it. Assume you can too.

### 3. `/blog`'s metadata and RSS say the charter cannot be amended

`app/lib/posts.js:34` — this is not post body. It is `metadata.description`
for `/blog`, the JSON-LD `BlogPosting.description`, and the RSS
`<description>`: *"inside a charter it cannot amend."* This is what search
engines and feed readers display. `posts.js:38` carries the same defect in
`excerpt` ("inside rules it can't change"), currently unrendered because the
homepage teaser picks a newer post — latent, not live, but the same error.

### 4. `/blog` overstates what `human-owned-paths` guards

`app/blog/page.js:189-193`, under the heading "What is true now, and only
this": the check "does nothing else but fail, deliberately, on any pull request
that changes the charter, the workflow definitions, or the loop's own prompt."

`CHARTER.md` and `prompts/` came off that gate in PR #134. Only `.github/` and
four named scripts match it now. A charter-only pull request is green and
auto-mergeable with no human step.

### 5. The origin story is false, in three places

`CHANGELOG.md:12`, `app/page.js:58` and `app/blog/page.js:65` all say **"A
human wrote the first commit"**. The maintainer states plainly that he has
never written a character of this project — he is not a programmer — and that
the initial scaffold came out of a conversation with Claude exactly as
everything since has.

Note the direction of the error: the site is **understating** the AI's
contribution. Nobody fabricates modesty, which is itself a small point in the
record's favour.

**This one cannot be settled by a command**, and you must not pretend
otherwise. Git shows 262 of 92,125 current lines tracing to the first two
commits (0.28%), and shows nothing whatever about who typed them — every
commit in this repository is authored by one account. So handle it the way
`FRAME.md` already handles facts of this class: **`attested`**, sourced to the
maintainer, marked as resting on his word rather than on a check. State what
git can show and what it cannot.

`CHANGELOG.md:12` sits in the file's **preamble**, not in a dated entry. Rule 5
protects past *entries*. Decide whether the preamble is inside or outside that,
say which you concluded and why, and if you judge it protected, leave it and
say so — `docket/open/2026-08-23-rule-5-docket-scope-ambiguity.md` is the open
question here and you should not resolve it silently.

### 6. Analytics is about to go live, and will falsify a live promise

The maintainer set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel today. It is
dormant until the next deploy — **which this round's own merge will trigger.**

`app/model-deprecation-checker/ModelDeprecationChecker.js:145` and
`app/model-deprecation-checker/page.js:30` both promise **"nothing sent
anywhere"**. That component calls `trackEvent` at lines 80 and 93, sending
`match_count`, `retired_count` and `retiring_count`. It never sends the user's
pasted text — "matching happens in your browser" stays true — but "nothing
sent anywhere" does not.

**Remove the two `trackEvent` calls from that component** and keep the promise
true. It is a real privacy feature of the tool and three integers are not worth
breaking it. Site-wide pageview analytics is unaffected and is the only signal
that matters here.

Then **add analytics to `/disclosure`**: the site now collects visitor data via
Google Analytics, and a site this scrupulous about disclosure should say so
before it starts. Flag anything you think needs a legal opinion — consent
banners, GDPR — as a filed item rather than deciding it.

## What matters more than the six fixes

**The pattern.** `/charter` and `/log` *cannot* drift — they are parsed from
`CHARTER.md` and `CHANGELOG.md`, so when the source changes the page changes.
All four defects live in the places that are **not** generated: hand-written
homepage prose, a hand-written lead on an otherwise-generated page, a metadata
constant, and post body.

So the property this round should leave behind is: **a claim of this class
should not be able to become false silently.** Not "these four sentences are
now correct" — that is true of the site today only until the next amendment.

**How to achieve that is your call, and I am deliberately not prescribing it.**
Deriving a claim from its source file, a check that fails when a page's
governance prose contradicts `CHARTER.md`, narrowing what the prose asserts so
it stops being a hostage to the code, or an explicit decision that some of it
is inherently prose and must be re-read by a human on amendment — all are
defensible. Two defects in recent rounds came from mechanisms the orchestrator
prescribed, so this one is yours to design and defend.

Be honest about reach. A check that catches these four specific sentences and
nothing else is worth little; say so if that is what you build. `check-frame.mjs`
and `check-briefs.mjs` are the house style — they print their own limits.

## Scope

`build`: `app/`, `public/`, `docket/`, `scripts/`, `package.json`,
`CHANGELOG.md`. **`CHARTER.md` is not in `build`'s scope** — do not edit it.
Every fix here is to the *site's description* of the charter, not the charter.

If you find that the honest fix requires changing `CHARTER.md`, stop and say
so rather than reaching outside your track.

## What you may not do

- **Do not touch `.github/`.** The loop's push credential holds `public_repo`
  only; GitHub refuses server-side any push touching `.github/workflows/`.
  Wire checks into `scripts/check-routes.sh`.
- Do not edit past changelog entries. Historical entries that were accurate
  when written are not defects — rule 5 governs them.
- Do not widen a track's scope map to fit your work.

## Operational notes

- `scripts/round.mjs` verifies port 3000 is free and then **starts its own
  server on it**. A `next start` listening there during a check is a
  correctly-running check, not an orphan. Use another port for your own.
- **Never pipe a command that backs a count or an enumeration through `head`.**
  A brief two rounds ago carried "five ch-capped rules" from a `grep | head -6`;
  the real number was twelve, and three rationales were built on the phantom
  before the round caught it by re-running the count.
- Every CHANGELOG item needs its `- Change:` bullet, or the build fails.
- If you touch a route's source files, check `PRODUCING_ROUNDS` in
  `app/lib/page-origins.js` — its check compares track, not recency.

## Done when

- [ ] All six false claims are true, or narrowed until they are
- [ ] The origin-story correction is marked `attested`, not asserted as
      verified, and says what git can and cannot show
- [ ] The two `trackEvent` calls are gone, so "nothing sent anywhere" is still
      true the moment this round's merge deploys analytics
- [ ] `/disclosure` states that the site uses Google Analytics
- [ ] The latent `excerpt` defect at `posts.js:38` is handled, not left because
      it is currently unrendered
- [ ] Something exists that makes this class of drift visible next time, and
      its actual reach is stated plainly — including if that reach is narrow
- [ ] Any check you ship is **proved able to fail** against the tree you ship
- [ ] `CHARTER.md` is unmodified; nothing under `.github/` is modified
- [ ] `node scripts/round.mjs check` green, observed by you

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**` heading
  opens and closes on one line.
- Commit this brief to `docket/briefs/loop-build-governance-claims.md`
  including its `## Premises`; confirm `node scripts/check-briefs.mjs` passes.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- **If you find an error in this brief, say so explicitly.** Note that a
  factual claim in this brief's prose is validated by nothing —
  `check-briefs.mjs` only examines numbered premises — so treat the paragraphs
  above with the same suspicion as an unsourced number.

## Premises

This brief declares 9 premises below.

1. `app/page.js`'s hero lead says the loop "can propose changes to but may not merge" the charter. [command: grep -n "may not merge" app/page.js]
2. `CHARTER.md` states that prohibition is withdrawn, not reinterpreted. [command: grep -n "withdrawn here, not reinterpreted" CHARTER.md]
3. `app/lib/posts.js` line 34 carries "inside a charter it cannot amend" in the `/blog` metadata description, and line 38 carries "inside rules it can't change" in the excerpt. [command: grep -n "cannot amend\|can't change" app/lib/posts.js]
4. `app/charter/page.js` claims two falsified claims are marked with corrections beside them. [command: grep -n "Two claims" app/charter/page.js]
5. The `human-owned-paths` gate matches only `.github/` and four named scripts — not `CHARTER.md`, not `prompts/`. [command: grep -n "human-owned-paths" -A 12 .github/workflows/pr-checks.yml]
6. A branch touching `.github/workflows/` cannot be pushed by the loop's credential. [frame:4]
7. "A human wrote the first commit" is published in three places: `CHANGELOG.md`, the homepage, and `/blog`. [command: grep -rn "human wrote the first commit" CHANGELOG.md app/]
8. The maintainer has written no code on this project at any point, including the initial scaffold, which came from a conversation with Claude. He is not a programmer. [attested: maintainer, in conversation on 2026-08-23]
9. `app/model-deprecation-checker/ModelDeprecationChecker.js` promises "Nothing is sent anywhere" and also calls `trackEvent` with three count fields; Google Analytics is configured in Vercel but not yet present in the served HTML. [command: grep -n "trackEvent\|Nothing is sent anywhere" app/model-deprecation-checker/ModelDeprecationChecker.js]

## Round 176's findings against this brief

Appended by the round the brief instructed, per its own Rules section ("If
you find an error in this brief, say so explicitly"). The nine numbered
premises above all held on re-verification. Three claims in the unnumbered
prose did not, and `scripts/check-briefs.mjs` reads only the numbered list,
which is exactly the limit that script's own header states:

1. **"the hero lead — the first paragraph a visitor reads"** (finding 1).
   It is the second paragraph. The first carries the origin story, which is
   finding 5. Two separate defects, one paragraph apart.
2. **"`app/charter/page.js:240`"** (finding 2) locates one of two copies.
   The same count is in that file's `metadata.description` at line 9 — the
   copy search engines display, which is the same shape as finding 3 and
   which the brief noticed there but not here.
3. **"`docket/open/2026-08-23-rule-5-docket-scope-ambiguity.md` is the open
   question here"** (finding 5). That item asks whether rule 5 reaches
   `docket/` items and does not mention `CHANGELOG.md`'s preamble at all.
   The preamble question is a neighbouring one, answered in changelog item
   5 and appended to that docket item for the maintainer.

Not errors, recorded so a later reader does not re-derive them:

- The brief's "262 of 92,125 current lines ... (0.28%)" was not used. Rule 3
  forbids stating a number this round did not produce, and the correction
  does not need one.
- "PR #134" (finding 4) was not checked; the gate's current filter was read
  directly from the workflow instead, which is what the fix rests on.
