# Proposal: make-the-blog-worth-sending

## Why

The maintainer asked, on 2026-08-30, for the blog to be overhauled into an
award-winning blog, and then directed the shape of the answer in his own
words: *"one pulse per day spawns a scout that looks for content that
clears the bar, and then if it finds worthwhile material to cover or
synthesize from, creates job in the desk queue"* — with a cap of three per
day chosen by ranking ("have it make a judgment on the 3 most worthy and
discard the others"), a high bar ("0 posts is acceptable if there really
is nothing to write about"), a quiet day as "an opportunity to synthesize",
a blog that is never about this site, prose with no tell-tale signs of
machine writing (craft, not concealment — the AI-authorship disclosure
stands), full autonomy ("NO HUMAN judgment"), and the five existing posts
used "as examples of what not to do" — deleted.

The measured state this lands on, every claim re-verified at HEAD:

1. **The blog has no producer.** `post` appears nowhere in
   `pulse/lib/queue.mjs`; the proposals channel's consuming side is built
   and tested while its producing side does not exist
   (`loop/lib/proposals.mjs` exports three readers and one mover — none
   creates a proposal; `data/proposals/` holds a README and a `rejected/`
   holding another; `addictedtoai-6ov`). Every published sentence on the
   site came from the human-directed seed wave (`addictedtoai-3zf`).
2. **The five posts are one genre, human-directed** — derived-view surveys
   of catalog data, several well-crafted, none about something that
   happened to somebody, none naming an affected party.
3. **The bar cannot name the thing the maintainer wants.** The live
   editorial spec carries would-cite (the predecessor charter's test 2)
   and nothing for test 1 — *"Would this be worth a stranger's attention
   if they never learned an AI made it?"* The predecessor's own amendment
   log records what that asymmetry does: a vocabulary that cannot name
   test 1 files only test-2 work, silently, for its entire life.
4. **The predecessor is the standard for judgment and the anti-standard
   for prose.** Its docket discipline (44 candidates over 9 active days,
   57% killed with recorded reasons, `expires:` on every item) and its
   author charge ("publish something a stranger would send"; "correct,
   sourced, and forgettable" a real failure) are worth adopting outright.
   Its prose is the maintainer's own negative example — "obviously AI
   generated" — measured in this change at 13.3 em-dashes per 1,000 words
   against a human sample's 4.5, with the full six-family inventory in
   `design.md` D6 and the per-document record in
   `openspec/style/blog-voice-calibration.md`.

A sealed adversarial review of this change's first draft (its `review.md`)
defeated that draft's load-bearing rate-control claim and gutted its
mechanical candidate deriver on measurement; this revision disposes of
every finding (design D8), mostly by removing the machinery the findings
were about.

## What Changes

**A daily scout, triggered by the Pulse, run by the Desk** (`specs/pulse`,
`specs/loop`). The Pulse — still model-free — derives one scout item per
local day, deterministically from the ledger and the clock, carrying the
trailing week's uncovered feed events as assembled context. The scout job
sweeps **outward** — its charge, verbatim from the predecessor's track:
bring back work the site could not have thought of by looking at itself —
judges everything against the two-test bar, files at most **three**
candidates per day as expiring proposals with docket discipline (slug,
type, `expires:`, why-now, retrieval-dated evidence, done-when), and
records every declined story in `data/proposals/dropped/` with the failed
test and a refile condition. A quiet day opens the synthesis branch; a day
where nothing clears either branch ends `blocked: nothing cleared the bar`
— a recorded success, with the consecutive-blocked count surfaced in the
published `/status.json` so a long quiet spell is visible without
obligating anything. The cap is a mechanism at the merge; the drop
records make each decline auditable in form (nothing measures how many
stories were considered, and the spec says so); the bar itself is a model
instruction checked by model-run review — the same honest split as
`would-cite`.

**The proposals channel gains its producing side and an expiry rule**
(`specs/loop`, resolving `addictedtoai-6ov`). Briefs state each job's
filing rule; reviewers can note proposals and the loop transcribes them;
proposals declaring `expires:` skip the 3-day cooling and die at expiry,
swept to `dropped/`; same-type proposals are auto-discarded (one-hop
guard, named as one-hop). `scout` joins the closed job-type list, the
new-writing budget category, and the first shed level.

**Two forms with finish lines, and four blog requirements**
(`specs/blog`). News notes lead with the event and who it lands on, carry
an anchor the author cannot forge (feed keys resolved against
`data/changes.jsonl`, or a fetched external primary source; every anchor
inside a two-sided 7-day window; the anchor rendered on the page).
Syntheses state their derivation method. Posts with an affected party name
them. The blog is about AI, never about this site. And no count ceiling
survives anywhere: the scout's filing cap, the bar, and the untouched
model-minute budget bound volume; the 3-in-7 machinery (both constants,
the gate, the warning) is removed.

**The stranger test enters the editorial bar** (`specs/editorial`). Clause
3 becomes "worth a stranger's attention" — judged by someone who never
learns an AI made it — with would-cite and would-send as its operational
forms and "correct, sourced, and forgettable" a named failure. The blog
requires the send form.

**Posts must be worth reading first, and read human as craft — with an
advisory lint and a judging review** (`specs/blog`, `specs/review`,
`openspec/style/blog-voice.md`). Quality outranks sounding human, per the
maintainer's own priority. A house-voice document — written on its own
terms, because no positive exemplar exists in this repository, and
followable by a weaker model — plus a voice lint whose closed marker list
was researched, graded for reliability, and calibrated against a labeled
negative corpus and a human sample (per-document measurements, fitted
thresholds and honest limits in
`openspec/style/blog-voice-calibration.md`). **The lint warns and never
fails the build** — the measured fact that decided this is that the house
model trips the punctuation-rate markers in every register it writes, so
a fail-closed gate's stable outcome was an empty blog with every
component reporting success. The gate is the model-run review: a new
closed reason `reads-as-generated` and a forced own-words `reads-human`
field on post verdicts, with `would-cite`'s exact mechanics. The
disclosure of AI authorship is explicitly out of this requirement's
reach.

**The five posts are deleted** with their dependencies handled:
`FLOORS.posts` drops to 0 in `scripts/verify-launch.mjs`, their five seed
review records go with them, inbound links are fixed where the build names
them, and the blog index gets an honest empty state.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `blog`: five added requirements (two forms; the anchor; the affected
  party; never about this site; reads human with disclosure standing), one
  modified (quality-gated, never quota-driven — now with no count ceiling).
- `pulse`: one added (the daily scout item), one modified (the queue
  enumeration).
- `loop`: one added (the scout's charge and mechanics), four modified (the
  closed job-type list; work sources with the producing side and expiry;
  the budget table; the degradation order).
- `editorial`: one modified (the stranger test).
- `review`: two modified (the reason list and `reads-human` field; the
  checklist with post-form and scout entries).

## Impact

- **Machinery**: `pulse/lib/queue.mjs` (the daily scout item),
  `loop/lib/config.mjs` (`scout` in `JOB_TYPES`; ceiling constants
  removed), `loop/lib/surfaces.mjs` (`blogCeilingGate` removed),
  `lib/posts.mjs` (ceiling warning removed), `lib/render/blog.mjs` (anchor
  rendering, index copy, empty state), `lib/schema.mjs` (`covers:` and
  `anchor:` post keys), a new anchor build check and a new voice lint in
  the prebuild `STEPS`, `loop/lib/brief.mjs` (scout acceptance checks,
  per-job proposal rule), `loop/lib/review.mjs` (checklists, proposal
  noting), `loop/lib/verdict.mjs` (`reads-as-generated`; `reads-human`),
  the merge step (candidate caps, stamping, transcription, expiry sweep,
  `reads-human` gate), the blocked-streak field in `/status.json`
  (derived from the ledger by the build; `lib/stamp.mjs` writes that
  file), and tests beside each — including the lint's pinned two-corpus
  calibration tests and its warn-not-fail assertion. No `package.json`
  edit.
- **Content**: five files deleted from `content/blog/`, five records
  deleted from `data/reviews/`, `content/blog/README.md` rewritten. No
  content is written by this change.
- **Data**: `data/proposals/dropped/` comes into existence as the drop
  record. `data/changes.jsonl` is read, never written, by everything here.
- **Config**: `data/config.json` already carries `scout` in all three
  `degradation.shed_levels[].exclude_types` arrays (applied by the
  orchestrator 2026-08-30 — the arrays are what the selector actually
  sheds on); at execution it additionally gains
  `job_caps_minutes.scout: 60` (reason for 60 in design D9.2) and `scout`
  in the new-writing category — a reserved path, applied by the
  orchestrator executing this approved change, never by a Desk job
  (design D9).
- **Specs**: deltas against five capabilities; the voice document lands at
  `openspec/style/blog-voice.md` with its measurement record beside it at
  `openspec/style/blog-voice-calibration.md`, outside both the
  archive-moved and the reserved paths, for the same reasons the learn
  curriculum lives beside them — and so the voice document's own
  recalibration rule keeps pointing at evidence that exists after this
  change is archived.
- **Deployment**: nothing here pushes. The gate condition in `CLAUDE.md`
  stands for whoever executes this change.
