# Design: make-the-site-machine-readable

Four decisions that were not obvious, and the two things that were deliberately
left undone.

## D1 — One definition of "changed", three surfaces reading it

`addictedtoai-8ho` settled what counts as a material change; `lib/sitemap-dates.mjs`
implements it; `app/sitemap.ts` sends it as `lastmod`. Two new consumers wanted
the same answer: the structured `dateModified` on every page, and the URL set
IndexNow submits.

Both **read the existing answer rather than recomputing it**, and the two do it
differently for a reason worth recording:

- **JSON-LD** takes it from the same function, exposed once on the site model
  as `contentChangedOn` so a page does not rebuild the changed-feed map.
- **IndexNow** takes it from the **built `sitemap.xml`**, by parsing the file
  the build just wrote. That is a stronger form of the same discipline: it
  cannot disagree with the sitemap even in principle, and a page the sitemap
  deliberately omits — a stub, a demoted tutorial — can never be submitted
  without a second exclusion rule existing anywhere.

The verifier then measures the agreement rather than trusting it: every
`dateModified` in the export must equal that URL's `<lastmod>`, to the day.
That assertion is the load-bearing one. It is what makes it impossible for a
later edit to quietly substitute a build clock, an mtime or a commit date,
because any of those moves the value off the sitemap's on the first build.

**What was not done, and why.** The two index-level graphs — the wiki's
`DefinedTermSet` and the `Dataset` — carry no `dateModified` at all. Their only
honest value is the member-maximum that `app/sitemap.ts` computes inline
(`addictedtoai-1r7`), and `app/sitemap.test.mjs` pins those expressions at the
level of that file's source text, so sharing them means rewriting another
agent's just-landed guard tests. Copying the expressions here instead would
create exactly the second definition this whole section exists to prevent. So
absence — the repository's standing honest answer — stands, and the extraction
is filed as `addictedtoai-nq36`, with the move and the two test assertions it
has to update written out, rather than left as a comment inside a finished piece
of work.

## D2 — "Never assert what the page does not" is a mechanism, not a rule

A JSON-LD graph is read by machines only. Nobody proof-reads it, which makes it
the easiest place in the repository for a false claim to survive indefinitely.
A guideline saying "only emit sourced properties" would be obeyed by whoever
read it and by nobody else.

So the mechanism is `compact()`: a recursive drop of every absent, empty or
null value on the way out. Emitting a property you cannot source requires
inventing a value, not merely forgetting a rule — and the verifier adds the
second half by asserting that every `description` in the export is text the
page itself contains.

That check needed one correction to be worth anything, and it is the kind that
is easy to miss: `<body>.text()` includes the JSON-LD block itself, so before
scripts were stripped, a description was "found in the page" *by virtue of
being in the graph*. The assertion would have passed on every input, including
a fabricated summary, while printing exactly like a real check.

Four properties the corpus cannot source, and are therefore absent:

| Property | Why not |
|---|---|
| `author` | Naming which AI would put a model name outside the one file allowed to name one; naming a person would be false |
| `offers` | `pricing:` is an author sentence ("free, open source (Apache-2.0); you supply your own model API key"), not a currency amount. Parsing one out is the heuristic this project refuses everywhere else |
| `datePublished` on a delta | Both its dates are facts about the *subject* — the settled distinction from `addictedtoai-3u1` |
| a definition for a data-only entry | One browsable entry is indexed on facts-and-timeline rather than prose. It gets a term with no description |

Only two of the ten wiki kinds become `DefinedTerm`s. The other eight name
particular things in the world rather than vocabulary, and a type chosen
because it was the nearest available is an assertion nobody checked.

## D3 — IndexNow is armed by a pure function, and fires after the deploy

The precedent here is uncomfortable and specific. Two entry points in this
repository whose **names** promised inspection have reached the live remote:
`npm test` (`addictedtoai-wxq` / `-64y`) and `pulse/verify-zero-model.mjs`
(`addictedtoai-r8k`). Both happened because code assumed a flag was false and
nothing re-checked when it changed.

So the arming decision is a pure function, `armed()`, with five guards, and
each is unit-tested **alone with the other four satisfied** — a guard tested
only in combination is a guard that can be deleted without a test going red.

The third guard is the interesting one: **the host must be one of the site's
own**. Every fixture and every test in this repository points `SITE_URL` at
loopback, so all of them are inert *structurally* rather than by anyone
remembering to disable something. It is also simply true as a statement about
the protocol — a key file only authorises the host that serves it — which is
what makes it a guard rather than a trick.

The call site adds a sixth guard by construction. The submission sits **inside
the branch where the live build stamp has already confirmed the deploy landed**,
which is both the safety property and the correctness one: pinging a URL before
its bytes are served is worse than not pinging it, because the crawler arrives
promptly and re-reads the old page. Putting it in the shared publish step also
means the Desk gets it free — reviewed prose is announced the moment it is
live, rather than waiting for the next scheduled run.

**Proved by measurement rather than by argument**, which is the house rule. A
real `publishStep` with `publish: true`, a real push to a real bare remote, a
confirmed deploy, a key file present and one URL changed today, with `fetch`
instrumented: zero requests to the endpoint, refused by the host guard.
Changing only the site URL made the same code path attempt the request. So the
first run is the guard working, not an accident of the fixture.

A failed submission is reported and nothing else. It writes no halt file, it
does not throw, it does not retry, and it does not change the publish result. A
third party's outage must not be able to stop this site publishing.

## D4 — The key, and the one cross-boundary import it forces

The IndexNow key is **not a secret and must not be handled as one**. The whole
protocol is that the key is served publicly at a URL on the host it authorises;
a search engine fetches it there and concludes that whoever sent it controls
the host. It authorises one thing — "please re-crawl these URLs on this host" —
and nothing on any other host.

It has to be byte-identical in two very distant places: the file the site build
writes, and the payload the engine sends. A second copy is the worst failure
available here — every submission rejected for a key mismatch, silently,
forever, with nothing on this side looking wrong.

That forces the first import from `lib/` into `pulse/` in the repository. The
direction was chosen deliberately: `pulse/` already depends on the site build
in fact (it runs it), whereas `lib/` depending on `pulse/` would make the site
build need the engine. Both targets are import-free constants files, so neither
can pull anything into the Pulse's dependency graph — the property its own
allowlist test exists to protect — and a test pins the list to exactly those
two files so the precedent cannot widen without an argument.

## D5 — What is deliberately not built

- **The Hugging Face dataset push.** Needs a token. A credential decision is
  the maintainer's, and routing around it is not available.
- **Search Console and Bing Webmaster verification.** One DNS TXT record, and
  the highest-leverage single item on the list. Not delegable. Until it exists,
  every judgment about demand on this site is a guess rather than a
  measurement — which is the error this project keeps writing rules about.
- **Anything that speaks for the site.** No agent-posted links or comments
  anywhere, no mass directory submission, no bought links. The line is that
  agents make the site findable and citable; they do not go out and represent
  it where a human is expected to be the one speaking. The restated requirement
  now names that line explicitly instead of implying it through a list of three
  examples.
- **Google's Indexing API.** Officially limited to `JobPosting` and
  `BroadcastEvent`. Planning around it would be building on a documented
  non-feature, and the code says so where a reader will hit the assumption.
