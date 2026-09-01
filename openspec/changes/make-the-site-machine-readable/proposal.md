# Proposal: make-the-site-machine-readable

## Why

The maintainer asked, on 2026-08-29, what could attract visitors **without
social media** and **could be run autonomously by an agent**. The answer was
written up as `addictedtoai-k1j` for him to choose from; on 2026-08-31 he
authorised the machine-readable items specifically.

Three measurements shaped the work, each taken before anything was designed:

1. **Zero JSON-LD.** Measured twice on 2026-08-29 and again before a line was
   written: there was no structured data anywhere in `lib/` or `app/`. This is
   the largest single gap, and this corpus is unusually well shaped for closing
   it — facts here are typed, dated and sourced rather than buried in prose, so
   a graph is a re-projection of data the build already validates rather than a
   second description that drifts.

2. **`robots.txt` said `allow *`.** The right behaviour, arrived at by default:
   nothing recorded that anyone had considered who was being let in, and a
   crawler operator reading the served file saw a bare `Allow` with no argument
   behind it.

3. **`/catalog.json` was fetchable but not dependable.** No version, no CORS
   header, and nothing written down about what a consumer may rely on. Somebody
   else's project reading it is the most durable inbound a site like this gets,
   and none of them will build on a file that could change shape without notice.

Two prerequisites were already done and were verified before building on them,
not assumed: `addictedtoai-dwo` (wiki entries carry an honest `lastmod`) and
`addictedtoai-1r7` (the index routes derive theirs from what they index).

## What Changes

**Structured data, derived and gated.** `DefinedTerm` for the `concept` and
`technique` entries, `DefinedTermSet` for the wiki index, `Article` for posts
and deltas, `SoftwareApplication` for the curated tool listings, and `Dataset`
for the open dataset — 101 blocks in the export. `Dataset` is the one with the
most head-room: it is the entry ticket to Google Dataset Search, a discovery
surface with almost no competition in this subject.

The rule the implementation is built around is that **a graph never asserts
what the page does not**, and it is enforced by a mechanism rather than a
convention: every property is derived from something the page renders, and a
property that cannot be sourced is dropped from the output. Four things that
costs, each of which was a live temptation — no `author` (naming which AI would
put a model name outside the one file allowed to name one; naming a person
would be false), no `offers` on a tool listing (pricing is an author sentence,
not a currency amount), no `datePublished` on a delta (its dates are facts
about the subject), and no invented description.

**`dateModified` reuses the material-change definition rather than making a
second one.** The value is the one `app/sitemap.ts` sends as `lastmod`, and the
verifier measures the agreement across the whole export rather than trusting
it. That single assertion is what stops a later edit reaching for a build
clock, an mtime or a commit date — a daily tick across 400 pages is precisely
the dishonesty crawlers already discount `lastmod` for.

**IndexNow, gated behind five guards and the deploy itself.** One POST per
publish, of the URLs whose sitemap `lastmod` is today. It needs no account and
no credential from anybody, which is what makes it the one acquisition
mechanism an agent can operate end to end. **Google does not participate** —
Bing, Yandex, Seznam and Naver do — and the code says so where a reader will
hit it, because the assumption runs the other way.

A submission is an outward-facing action, so it is armed by a pure function
with five independent guards, and the call site adds a sixth by sitting inside
the branch where the deploy has already been confirmed live. That matters here
more than it would elsewhere: two entry points in this repository whose *names*
promised inspection have reached the live remote.

**A commented crawler stance, and `llms.txt`.** GPTBot, ClaudeBot,
PerplexityBot and Google-Extended are allowed explicitly, one named block each
with a note saying what each token governs. The behaviour does not change —
`User-agent: *` already permitted them — but the file now records that the
question was asked, and reversing it is one word per crawler. `robots.txt`
moves out of the framework's generator because that generator cannot emit
comments, and a stance whose reasoning is not in the served file is not a
recorded stance. `llms.txt` points at the structured layer, the pages behind
it, and the licence.

**`catalog.json` as a published contract.** Schema versions in every payload,
CORS derived from the set of assets the build writes, and a written statement
of what is stable and what is not — in that order, because the second half is
what makes the first believable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site`: one modified requirement — *Citable assets are first-class* now names
  structured data and `llms.txt` among what the site publishes, and restates
  the no-outward-action rule with the distinction it was always drawing made
  explicit. Its current text says the system *"takes no outward action (no
  posting, no email, no accounts anywhere)"*, and an IndexNow submission is an
  outward action: it is none of the three the parenthetical names and it is the
  opposite of what the rule exists to prevent, but reading the sentence as not
  reaching it would be reading a constitution for convenience. The carve-out is
  written to authorise exactly one mechanism and nothing adjacent — no content,
  no credential, only already-live URLs, derived from the site's own published
  freshness signal, gated on the publish flag, and never a deploy failure.
  Two added requirements: structured data is derived and never asserted, and
  the crawler stance is a recorded decision.
- `directory`: one added requirement — the machine-readable payloads are a
  published contract. Nothing modified: *Standing tables answer recurring
  questions* already requires the JSON siblings and is correct as it stands, and
  restating a working requirement in order to append to it puts it at risk for
  no gain.

No other capability is touched. `pulse` in particular is not: the submission
adds no source, no snapshot, no diff and no queue item, and the engine's
defining property — that it invokes no model on any path — is unchanged and
still verified by its own import allowlist.

## Impact

- **Machinery**: `lib/jsonld.mjs`, `lib/crawlers.mjs` and `pulse/lib/indexnow.mjs`
  are new; `lib/asset-routes.mjs` gains the two crawler routes, the IndexNow key
  and the contract constants; `lib/site-assets.mjs` writes three more files;
  `lib/redirects.mjs` gains the derived CORS block; `lib/site.mjs` exposes the
  shared page-date resolution; `pulse/lib/publish.mjs` gains a third phase that
  runs only after the deploy is confirmed. `app/robots.ts` is deleted and its
  route is served from `public/`. Six page components gain one element each.
- **Content**: none. Not one file under `content/` changes, and no front-matter
  field is added — everything published here is derived from fields that
  already exist.
- **Tests**: `lib/jsonld.test.mjs`, `lib/crawlers.test.mjs`,
  `lib/redirects.test.mjs` and `pulse/tests/indexnow.test.mjs` are new.
  `lib/build-gates.test.mjs`'s preserve-other-keys case moves to a key the
  generator does not own, because `headers` is now generated.
- **Verification**: `scripts/verify-surfaces.mjs` gains three sections and
  twenty assertions. Every one was mutation-tested — broken in the exported
  tree, re-run, confirmed to fail the *right* check and nothing else, restored
  byte-identical.
- **Data**: no shape under `data/` changes. `vercel.json`, which is generated
  and committed, gains a `headers` array.
- **Deferred, and filed rather than buried**: `addictedtoai-nq36` (share the
  index-route date computation so the two index-level graphs can carry a
  `dateModified`) and `addictedtoai-en3s` (IndexNow never announces a change
  whose deploy lands after local midnight).
- **Deployment**: the IndexNow submission is the first outward request this
  repository has ever made on its own behalf. It was proved inert under test
  conditions by measurement rather than by argument: a real publish with
  `publish: true`, a real push, and a confirmed deploy made zero requests to the
  endpoint, refused by the host guard; changing only the site URL made the same
  code path attempt it.
