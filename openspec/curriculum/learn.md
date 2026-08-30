# Curriculum: teach-the-whole-subject

This is the operative document. If you are the model executing a page task,
this file plus your page's entry is your brief. The reasoning behind the
structure is in `design.md`; you do not need it to write a page, but you do
need it before you *change* the structure.

## §0 — How to use this file

1. Find your page's entry in §4. It gives you the slug, title, level, the
   exact `outcome` string, the prerequisites, what to cover, and what to
   refuse to cover.
2. **Read your page's prerequisite pages in full before writing** — every
   page in the transitive closure if you can afford it, the direct
   prerequisites at minimum. Your page may assume exactly what they teach and
   nothing else from this surface. Read two or three existing pages
   (`what-a-model-is`, `why-context-is-not-memory`,
   `why-models-are-confidently-wrong`) regardless, to absorb the voice.
3. Write the page. Apply §3 to your own draft before anyone else does.
4. Check §5's wave order: your page's task must not land before its
   prerequisites exist in `content/learn/`, because a prerequisite naming an
   unwritten page **fails the build** (`lib/corpus.mjs`,
   `unresolved-reference`).
5. If you believe an entry is wrong, do not silently deviate. Amend this file
   in the same commit as the page, visibly, with a sentence of reasoning —
   the map must keep describing the territory.

## §1 — The map

Six areas. Every page serves one primarily (marked in its entry). The point
of the map is that an empty area is visible; when all spine tasks are done,
no area is empty.

- **A. The thing itself** — models, networks, language models, other model
  families, meaning-as-geometry, internals.
- **B. Where it came from** — the seventy-year story that makes the present
  legible.
- **C. How it is made** — data, training, safety training, scaling, hardware,
  costs.
- **D. How it runs and is used** — inference, context, prompting, retrieval,
  reasoning, agents, image generation, local running, applications.
- **E. How to judge it** — confident wrongness, benchmarks, nondeterminism,
  attacks, generated media and evidence.
- **F. The world around it** — who builds it, open vs closed, privacy, work,
  law, harms, safety debates, what comes next.

## §2 — The rungs (operative definitions)

The rung is set by **what the page assumes, never by how hard the topic
sounds**. A page belongs on the lowest rung whose admission test it passes.

**orientation** — *for someone who has used a chatbot and reads no tech
press.*
Purpose: after this rung the reader can look at any AI headline or product
and know what kind of thing is being talked about.
Admission test: assumes nothing but everyday experience and earlier
orientation pages. No code, no maths, no API vocabulary. Mechanism appears
only as honest metaphor ("nudging millions of dials"), never as notation.

**foundations** — *for someone who uses these tools weekly and wants them to
stop being magic.*
Purpose: after this rung the reader reasons causally — predicts the failure,
explains the quirk, stops asking "why did it do that?"
Admission test: teaches one mechanism in plain prose to the depth where
behaviour becomes predictable. Numbers in sentences are fine; equations and
notation are not. May assume orientation and earlier foundations pages.

**mechanics** — *for someone comfortable reading an engineering blog post.*
Purpose: after this rung the reader can read the field's own writing — a
model card, a paper abstract, a serving-stack post — and know what the named
parts do.
Admission test: names the actual parts and processes, defining each term of
art at first use. May assume anything on foundations.

**advanced** — *for someone who has the mechanics rung and wants the
load-bearing details and the live arguments.*
Purpose: after this rung the reader can weigh claims that experts dispute,
and knows which quantities are measured versus inferred.
Admission test: treats details that only matter once the basics are
automatic, or disputes where the honest report is disagreement.

## §3 — How to write a page

### The voice you are joining

Flat declarative sentences. Mechanisms stated plainly and confidently.
Uncertainty stated as a fact about the world, not as a hedge. No
exclamation, no "let's dive in", no summary-of-what-we-learned closers (the
existing pages end on a working takeaway, not a recap). The subject carries
the awe; the voice stays plain (`specs/editorial`).

### How long a page is

**A page is as long as its content requires. There is no ceiling.**

This is the maintainer's instruction, given 2026-08-30 after watching writers
discard real work to hit a number: *"I don't want to lose quality to be
concise."* If a page needs eighteen hundred words to do its job properly, it
is an eighteen-hundred-word page. Write it and say so.

Most pages here land somewhere around a thousand to fifteen hundred words,
which is a fact about what these entries ask for rather than a target. Treat
it as an order of magnitude and nothing more.

**The numbers here are descriptive, and they describe two different
populations.** Measured 2026-08-30: the seed-wave pages run 627 to 1,046
words, median about 900. The pages written against this curriculum run 979 to
1,321, median about 1,170. The second group is longer because these entries
mandate more — a must-cover list with four or six beats produces a longer page
than one driving a single mechanism, and that is the curriculum's doing, not
the writer's.

So do not trim to hit a number measured on pages with different instructions.
Nine consecutive writers flagged going over a band derived from the older
population, and every one of them was right to flag it and wrong to spend
passes on it.

**The remaining test is a diagnosis, not a threshold, and length is not
evidence for it.** Two real failure modes exist: two ideas sharing a file, and
survey prose that lists rather than argues. Both are identifiable directly, by
reading the draft and asking whether it has one argument and whether its
examples are evidence or content. A long page can be free of both, and a short
page can have either.

So do not reason from word count to a defect. If a page is long, ask whether
either failure is actually present; if neither is, it is finished, and the
length is the answer rather than the problem. **Never cut something that is
doing work in order to reach a number** — that is the failure this section
exists to prevent, and it is the one that has actually happened here.

A draft that comes in very short is worth a second look for the opposite
reason: a paragraph mistaken for a page. The sendable-sentence test below will
usually say so before the word count does.

One warning about re-measuring this section. If a later reader recalculates the
band from the pages written under this guidance and writes that number down as
the standard, the number will only be describing itself. That already happened
once on this surface with a punctuation figure, which was derived from pages
written under the guidance quoting it and then cited back to later writers as
a fact about the exemplars. Measure against something the guidance did not
shape, or record the number as descriptive and leave it descriptive.

### Six failure modes, by name

1. **The lecture** — defining terms before the reader has a reason to want
   them. Fix: problem before vocabulary. Every term earns entry by being
   needed in the sentence where it lands.
2. **Jargon by osmosis** — using a term of art the rung has not earned.
   On orientation and foundations pages, a term of art may appear only after
   a plain-language sentence has already carried the idea — then the term is
   introduced as *the name for the thing the reader now holds*.
   - Before: "Utilizing tokenization, the model decomposes the input string
     into subword units."
   - After: "The model never sees your words. Before anything else happens,
     the text is cut into pieces from a fixed list — common words survive
     whole, rare ones are split into fragments. The pieces are called
     tokens."
3. **The hedge** — "it's complicated", "results may vary", "many believe".
   The cut list already bans these. State the mechanism; state the
   uncertainty as a finding.
   - Before: "It is important to note that LLMs may sometimes produce
     inaccurate outputs, a phenomenon known as hallucination."
   - After (live on the surface): "Nothing in the process that produces an
     answer checks the answer."
4. **The condescension** — the opposite failure. Cute analogies that lie
   ("it's basically a parrot"), reassurance ("don't worry!"), talking down.
   The reader is a stranger, not a child. An honest metaphor names its own
   limit: "What looks like memory is re-reading" is a metaphor that is also
   simply true.
5. **The pile** — enumeration without judgment; three examples where the
   mechanism needs one; survey prose. One idea per page, driven to the point
   where the reader can use it.
6. **The forgetting** — writing for the person who has read the whole
   corpus instead of the person on the rung. Your reader has read your
   prerequisites and nothing else here. If a sentence needs a page outside
   your transitive prerequisites, add the prerequisite (and justify it — see
   the rule below) or cut the sentence.

### Three tests to run on your own draft

- **The named-reader pass.** Reread the draft as the rung's named reader
  (§2, italics). At every paragraph ask: does this tell that person
  something, in words they already have plus words this page has already
  given them? A paragraph that fails is rewritten or cut.
- **The term-of-art audit.** List every term of art in the draft. Each one
  must be (a) taught by a prerequisite page, (b) given its meaning in the
  sentence that introduces it or the sentence before, or (c) on a
  mechanics/advanced page, a wiki-linked term whose sentence still stands if
  the reader never follows the link.
- **The sendable sentence.** Name the one sentence a reader would quote to
  someone else. Every existing page has one ("Attention is the only operation
  in the stack that moves information between positions"; "appending is
  cheap; editing the beginning is not"). If you cannot name yours, the page
  is a summary, not a page — find the structural surprise or do not publish.
  Review is entitled to reject `not-worth-reading` on exactly this ground.

### Traps in this corpus (each one is a build failure or a review rejection)

- **Facts are bound, never typed.** No model names, prices, context windows,
  version numbers, vendor rankings or benchmark scores as literal prose
  (`specs/education-static`). A genuinely needed current example is a
  `{{fact:<entry>#<field>}}` transclusion or an explicitly dated aside
  ("as of 2026-08, …"). Historical facts framed as dated events ("in 2019,
  the staged release of GPT-2 —") are dated asides by construction and do
  not rot. The build *warns* on currency-shaped literals; review rejects
  them.
- **The wiki is the substrate.** Link `/wiki/<kind>/<slug>` instead of
  restating an entry's facts; a learn page that duplicates an entry is cut.
  List every concept and technique the page teaches in `mentions` — and
  every mention must resolve to a real entry or the build fails. The
  suggested mentions in §4 all resolved on 2026-08-29; re-verify, and drop
  any that has no entry when your page lands (filing the stub separately is
  wiki work, not yours).
- **Unknown front-matter keys fail the build.** A learn page's front matter
  is exactly `title`, `level`, `outcome`, `prerequisites`, `mentions`.
  There is no `area`, no `author`, no `date`. Do not invent one.
- **The `outcome` sentence is rendered twice** — after the label "After this
  page:" and bare on the ladder index. It must start with a capital letter,
  must not begin "After this/reading", and by house style begins "You can".
  Copy your entry's outcome verbatim; it was written to the schema.
- **Prerequisites are learn slugs only** (no `kind/slug`), must exist, must
  not form a cycle, and — new with this change — must sit on the same or an
  earlier rung. Prerequisites are **true assumptions, not recommended
  reading**: declare a page only if your prose leans on what it teaches.
  Useful-but-not-load-bearing connections are inline links.
- **Dates are the local date of this machine, never UTC.**

### Done means

- [ ] Front matter: the five keys, outcome verbatim from §4, prerequisites
      exactly as declared in §4 (or §4 amended in the same commit).
- [ ] The three tests above pass, and none of the six failure modes survives
      a reread.
- [ ] No currency-shaped literal outside a transclusion or dated aside; no
      restated wiki facts; every mention resolves.
- [ ] Every "must cover" item in the entry is present; nothing from "must
      not" crept in.
- [ ] Internal links resolve (the build's link check will verify; do not
      link learn pages that do not exist yet).
- [ ] The corpus loads: the page validates against `learnSchema`, and the
      ladder builds with no new diagnostics.

## §4 — The catalog

Entries are grouped by rung, in dependency order (the order `tasks.md`
lands them). **Status** marks what exists: `new`, `existing` (untouched), or
`edit` (front matter only). Suggested mentions were verified to resolve on
2026-08-29.

---

### Orientation

#### `what-ai-actually-is` — "What people mean when they say AI"
- **Status**: new · **Area**: A · **Prerequisites**: none
- **Outcome**: You can say what makes a piece of software count as AI, place
  chatbots, feeds and image generators on one map, and tell when a product's
  AI label is doing real work.
- **Must cover**: the two ways to make software — rules written by hand
  versus behaviour learned from examples — as the live distinction under the
  label; AI as an umbrella over learned systems; the map of AI the reader
  already touches daily without naming it (spam filter, feed ranking,
  speech-to-text, photo search, chatbot, image generator); the moving label
  — yesterday's AI becomes today's ordinary software (chess, directions,
  autocomplete), so "AI" tracks novelty as much as technology.
- **Must not**: history (its own page); any mechanism beyond
  "learned from examples" (next page's job); model families (foundations).
- **Mentions**: `event/eliza`, `event/deep-blue-kasparov`.
- **Beats the alternative by**: being written for the person who arrived
  from a chatbot, not for a category page; the daily-life map is the angle
  encyclopedias do not take.

#### `learning-from-examples` — "How software learns from examples"
- **Status**: new · **Area**: A · **Prerequisites**: `what-ai-actually-is`
- **Outcome**: You can explain how a program can be trained rather than
  written, why more and better examples usually help, and why a trained
  system can fail on anything it never saw.
- **Must cover**: the training loop in prose — show examples, measure
  wrongness, nudge, repeat, millions of times; generalisation versus
  memorisation (the whole point is behaviour on things not in the examples);
  the examples set the ceiling — a system learns the pattern in its data,
  including the pattern nobody meant to teach; training time versus using
  time (training happened once, in a lab; using happens constantly,
  everywhere — seeds `what-a-model-is`).
- **Must not**: neural networks (foundations); gradients by name; anything
  language-model-specific.
- **Mentions**: `event/imagenet-2012`.
- **Beats the alternative by**: carrying the one distinction (train vs
  write) every later page stands on, in a thousand words with no notation.

#### `what-a-model-is` — "What a model is, and what it is not"
- **Status**: **edit** — front matter only: `prerequisites` becomes
  `[what-ai-actually-is]`. Body untouched. · **Area**: A
- Already published (orientation). Records its place in the map: the
  model / stack / product distinction, "a model does not remember your
  conversation", training happened once.

#### `where-ai-came-from` — "Where AI came from"
- **Status**: new · **Area**: B · **Prerequisites**: `what-ai-actually-is`
- **Outcome**: You can tell the story of AI from 1956 to now in five turns,
  say what an AI winter was and why two happened, and place today's systems
  on that timeline.
- **Must cover**: the five turns as the spine — (1) the naming and the
  rule-writing era (Dartmouth; ELIZA and what its users read into it);
  (2) the winters as funding collapses with stated reasons (ALPAC,
  Lighthill) and what "AI winter" means as a standing worry; (3) the
  learning turn (ImageNet 2012 — the moment learned systems beat
  hand-written ones in public); (4) games as public milestones (Deep Blue,
  AlphaGo — and what each did and did not prove); (5) the transformer and
  the chatbot moment, dated. The through-line: hand-written rules losing to
  learned behaviour, twice, which is why the field keeps betting on scale.
- **Must not**: mechanism; a complete timeline (the wiki's event entries are
  the record — this page strings them, links them, and stops); forecasting.
- **Mentions**: `event/dartmouth-workshop`, `event/eliza`,
  `event/alpac-report`, `event/lighthill-report`, `concept/ai-winter`,
  `event/imagenet-2012`, `event/deep-blue-kasparov`,
  `event/alphago-lee-sedol`, `event/attention-is-all-you-need`,
  `concept/the-bitter-lesson`.
- **Beats the alternative by**: a five-turn spine a stranger can retell,
  with every event linking a dated, sourced entry — connectedness no
  standalone history has.

#### `what-ai-is-used-for` — "Where AI already does real work"
- **Status**: new · **Area**: D · **Prerequisites**: `what-ai-actually-is`
- **Outcome**: You can name the places AI already does real work, say which
  kind of system sits under each, and tell a demo from a deployment.
- **Must cover**: the invisible deployments the reader already relies on
  (ranking, recommendation, fraud detection, translation, transcription,
  computational photography) versus the visible new ones (chat, code,
  images, voice); science as a deployment with receipts (AlphaFold, dated);
  the demo–deployment gap — what a launch video does not show (error rates,
  human escalation, narrow conditions), and why "can do X in a demo" and
  "does X in production" are different claims.
- **Must not**: product recommendations or tool lists (the directory's
  job); mechanism; vendor praise.
- **Mentions**: `event/alphafold-casp14`, `event/stable-diffusion-release`.
- **Beats the alternative by**: the demo/deployment lens — the one
  distinction that makes every "AI can now…" headline readable.

#### `who-builds-ai` — "Who builds AI"
- **Status**: new · **Area**: F · **Prerequisites**: `what-ai-actually-is`
- **Outcome**: You can name the kinds of organisations that make modern AI,
  what each contributes, and why a handful of companies sit at every
  chokepoint.
- **Must cover**: the roles, never the rankings — frontier labs (train the
  largest models), platform companies (distribution, clouds, and their own
  labs), the chip layer (accelerator design concentrated in one company,
  fabrication in one region — stated as structure, linked to entries, no
  market-share numbers in prose), open-weight releasers, academia's changed
  role (the frontier moved behind compute costs universities do not have),
  and startups building on other people's models; why chokepoints exist at
  all (training cost — one sentence, previewing the costs page without its
  numbers).
- **Must not**: rankings, "leading lab" claims, funding figures (dated
  aside only if truly needed), predictions about who wins. Role-first prose
  is the rot defence: a sentence naming a role survives a lab renaming.
- **Mentions**: `org/nvidia`, `org/openai`, `org/anthropic`,
  `org/google-deepmind`, `org/deepseek`, `org/mistral-ai`.
- **Beats the alternative by**: the role map; press coverage names
  companies, never the structure that makes them matter.

#### `where-ai-fails-people` — "Where AI fails people"
- **Status**: new · **Area**: F · **Prerequisites**:
  `learning-from-examples`, `what-ai-is-used-for`
- **Outcome**: You can name the ways a working AI system still hurts people,
  explain why its errors land unevenly, and ask the one question that
  matters about any consequential deployment.
- **Must cover**: bias as mechanism, not scandal — a system learns the
  pattern in its examples, including the discriminatory one, so the failure
  is inherited, statistical, and invisible in any single decision (canonical
  cases — hiring, credit, face recognition — as dated asides with sources);
  automation bias (people defer to the machine, so error rates compound with
  deference); the difference between a chatbot being wrong *for* you and a
  system being wrong *about* you — stakes, consent, and the ability to
  argue back; the accountability gap; the one question: *what happens when
  it is wrong about someone, and who checks?*
- **Must not**: the existential-risk debate (advanced); hallucination
  mechanics (`why-models-are-confidently-wrong` owns it); policy advocacy.
- **Mentions**: `concept/hallucination`.
- **Beats the alternative by**: mechanism-first treatment of harms — most
  coverage is case-first and mechanism-free, so it neither predicts nor
  transfers.

#### `why-models-are-confidently-wrong` — existing, untouched
- **Status**: existing (orientation) · **Area**: E ·
  **Prerequisites**: `what-a-model-is` (unchanged).

---

### Foundations

#### `what-a-neural-network-is` — "What a neural network actually is"
- **Status**: new · **Area**: A · **Prerequisites**:
  `learning-from-examples`, `what-a-model-is`
- **Outcome**: You can say what a neural network computes, what a weight is,
  and how nudging millions of numbers against examples produces behaviour
  nobody programmed.
- **Must cover**: from "a model is a fixed array of numbers"
  (`what-a-model-is`) to what the numbers *do*: weighted sums and
  thresholds, stacked in layers; layers as re-description (early layers find
  edges, later layers find things made of edges — the honest prose version);
  training as blame assignment — for each wrong answer, work out which
  weights pushed it wrong and nudge them the other way (gradient descent
  named, never derived); why nobody can read the numbers afterwards (the
  behaviour is smeared across millions of weights — seeds
  `looking-inside-a-model`); why scale changed kind and not just degree.
- **Must not**: calculus; backpropagation mechanics; transformer specifics
  (`how-a-language-model-works` owns them).
- **Mentions**: `concept/emergence`.
- **Beats the alternative by**: bridging orientation to every mechanism page
  with zero notation — the textbook version starts with the math, the pop
  version skips the substance.

#### `how-a-language-model-works` — existing, one-line edit
- **Status**: **edit** — front matter only: `prerequisites` becomes
  `[what-a-model-is, what-a-neural-network-is]`. Body untouched. ·
  **Area**: A.

#### `the-kinds-of-models` — "The kinds of models, beyond chat"
- **Status**: new · **Area**: A · **Prerequisites**:
  `what-a-neural-network-is`
- **Outcome**: You can name the major families of model beyond language
  models, say what each takes in and puts out, and work out which family
  sits under a product you are looking at.
- **Must cover**: the input→output frame that organises everything —
  classifiers and recognisers (image in, label out); transcribers and
  translators (sequence in, sequence out); recommenders (history in,
  ranking out — the most consequential family nobody calls AI); embedders
  (anything in, coordinates out — one sentence, deferring to
  `how-machines-represent-meaning`); generators (text, image, audio, video
  — prompt in, artifact out); multimodal models (several kinds of input,
  one model); and the reminder from `what-a-model-is` that a product is
  usually several of these plus plumbing.
- **Must not**: any single family's internals — image generation and
  language models have their own pages; recommender internals stay at the
  input/output level.
- **Mentions**: `event/stable-diffusion-release`, `concept/embeddings`.
- **Beats the alternative by**: one organising frame instead of a zoo;
  the reader leaves able to classify products they have never seen.

#### `how-machines-represent-meaning` — "How machines represent meaning"
- **Status**: new · **Area**: A · **Prerequisites**:
  `what-a-neural-network-is`
- **Outcome**: You can say what an embedding is, why nearby points mean
  similar things, and name the single trick under search, recommendation
  and image prompts alike.
- **Must cover**: meaning as position — a thing becomes a long list of
  coordinates, and similar things land near each other; how that placement
  is learned (things appearing in similar company end up nearby); similarity
  as distance, and what a vector database stores; the same trick under
  semantic search, recommendation, clustering, and the text-to-image bridge;
  the limits — similar is not same, opposites embed close together, and the
  arithmetic folklore (king − man + woman) is a party trick with a real
  point and real exceptions.
- **Must not**: retrieval pipelines (`how-a-model-uses-your-documents`
  owns the plumbing); tokeniser detail; training objectives.
- **Mentions**: `concept/embeddings`.
- **Beats the alternative by**: teaching the one idea that makes four
  different product categories legible at once — and it is one of the ideas
  in this field that genuinely carries wonder without needing adjectives.
- **Note**: the sendable sentence wants to be about meaning becoming
  geometry; find the version of it that is true.

#### `what-models-are-trained-on` — "What models are trained on"
- **Status**: new · **Area**: C · **Prerequisites**:
  `learning-from-examples`, `why-models-are-confidently-wrong`
- **Outcome**: You can say where training data actually comes from, what
  gets filtered out and by whom, and why the data sets the ceiling on what
  any model can learn.
- **Must cover**: what a web scrape actually contains — and what the
  internet over- and under-represents (languages, registers, viewpoints,
  eras); curation as the real work (filtering, deduplication, mixing —
  decisions with fingerprints on the model); the human labour in the
  pipeline (annotators, preference raters — who they are and what they are
  asked, as dated asides); licensed and proprietary data as the newer
  layer; synthetic data and its known hazard (`concept/model-collapse`);
  the ceiling argument — the supply-side explanation of the obscure-fact
  failures `why-models-are-confidently-wrong` describes from the demand
  side.
- **Must not**: the legal fight (`ai-and-the-law` owns it — one sentence
  may acknowledge the dispute exists); training mechanics; dataset
  shopping lists.
- **Mentions**: `concept/model-collapse`.
- **Beats the alternative by**: connecting data composition to observed
  model behaviour — the two are almost never in the same article.

#### `why-context-is-not-memory` — existing, untouched
- **Status**: existing (foundations) · **Area**: D ·
  **Prerequisites**: `how-a-language-model-works` (unchanged).

#### `getting-good-answers` — "Getting better answers out of a model"
- **Status**: new · **Area**: D · **Prerequisites**:
  `how-a-language-model-works`, `why-context-is-not-memory`
- **Outcome**: You can explain why showing examples beats describing what
  you want, what a system prompt does, and which popular prompt tricks have
  a mechanism behind them.
- **Must cover**: the input is the only lever you hold, and everything on
  this page is one lever pulled different ways; examples set a pattern to
  continue (in-context learning — why two good examples outperform a
  paragraph of instructions); specificity narrows the distribution (vague
  in, average out); asking for intermediate steps changes what the model
  computes, not just what it shows (chain-of-thought, mechanically); when
  to stop arguing and start over (imported from the context page, applied);
  what has no mechanism — "be accurate", politeness rituals, threats and
  tips — stated fairly: measured register effects exist, reliability
  effects do not; what prompting cannot fix (knowledge absent from weights
  and input stays absent).
- **Must not**: a prompt cookbook, tool-specific UI advice, or anything
  phrased as steps to follow (the tutorials surface owns steps; this page
  owns *why* — hold this line or cut the page, per design D8).
- **Mentions**: `concept/in-context-learning`, `concept/chain-of-thought`,
  `technique/chain-of-thought-prompting`.
- **Beats the alternative by**: mechanism per tip — the ocean of prompt
  advice states rules without reasons, so readers cannot tell folklore
  from physics.

#### `open-weights-and-closed-models` — "Open weights, closed weights"
- **Status**: new · **Area**: F · **Prerequisites**: `what-a-model-is`
- **Outcome**: You can say what is actually released when a model is called
  open, what a licence can and cannot control afterwards, and why open and
  closed releases fail differently.
- **Must cover**: the release spectrum — paper only, API access, weights,
  weights-plus-data-plus-recipe — and where "open source" honestly applies
  on it (source is the recipe; weights are a compiled artifact); what
  possessing weights enables (run anywhere forever, fine-tune, remove
  refusal behaviour — one sentence, deferring mechanism to
  `what-safety-training-changes`); licence reality (restrictions ride on
  terms nobody can watch being broken); the arguments for each posture,
  stated fairly (control and safety versus scrutiny, access and
  permanence), anchored in the first public fight about staged release.
- **Must not**: lists of currently open models (the catalog's job); safety
  training internals; licence-by-licence comparisons.
- **Mentions**: `event/gpt-2-staged-release`, `org/deepseek`,
  `org/mistral-ai`.
- **Beats the alternative by**: the spectrum frame — most coverage treats
  open/closed as binary and misses that the argument is about which layer
  is released.

#### `where-your-words-go` — "Where your words go"
- **Status**: new · **Area**: F · **Prerequisites**: `what-a-model-is`
- **Outcome**: You can trace what happens to a message you send an AI
  product, name the places it can end up, and say which questions a privacy
  policy actually answers.
- **Must cover**: the journey of one message (your device, the provider's
  servers, the model, and everything that happens around that call); the
  four destinations — the reply, the logs (retention as a dated-aside
  reality), human review queues (that they exist and why), and training
  sets (opt-in/opt-out as structure, not as any provider's current policy);
  the load-bearing distinction from `what-a-model-is`, applied: "the model
  remembers me" is false, "the company stores my chats" is separately
  true or false and is the question that matters; enterprise versus
  consumer defaults as structure; the local alternative in one sentence.
- **Must not**: provider-by-provider policy tables (instant rot; the wiki
  and directory own current facts); legal or purchasing advice; alarm or
  reassurance — mechanism only. Fallback if the durable core proves too
  thin in execution: merge into `open-weights-and-closed-models`
  (design D8).
- **Mentions**: none required; add resolvable ones if the prose earns them.
- **Beats the alternative by**: answering the single most-asked privacy
  question mechanically, when everything else on the topic is either a
  vendor's policy page or a scare piece.

#### `when-you-cannot-trust-your-eyes` — "When you cannot trust your eyes"
- **Status**: new · **Area**: E · **Prerequisites**: `the-kinds-of-models`
- **Outcome**: You can explain why spotting generated media by eye stopped
  working, what watermarks and provenance labels can and cannot promise,
  and where the trust problem actually has to move.
- **Must cover**: why the tells died — the giveaways were artifacts of
  early systems, not essences of generated media, and each public tell
  becomes a training target (state this structurally; specific tells as
  dated asides); the asymmetry — one convincing fake versus the cost of
  doubting all media, and the liar's dividend (real evidence dismissed as
  fake); watermarking (what it can promise, what strips it); provenance
  and signing (a promise about origin, never about truth); the honest
  destination: trust moves from the artifact to its chain of custody.
- **Must not**: a spot-the-fake tutorial (it would rot and then mislead —
  the page's whole point); current-events examples except as dated asides;
  detection-tool recommendations.
- **Mentions**: `event/stable-diffusion-release`.
- **Beats the alternative by**: telling the reader the uncomfortable
  structural truth every detection listicle avoids: the eye lost, and the
  fix is not a better eye.

#### `ai-and-work` — "What AI does to work"
- **Status**: new · **Area**: F · **Prerequisites**: `what-ai-is-used-for`
- **Outcome**: You can say why AI lands on tasks rather than jobs, what has
  measurably changed for working people so far, and why confident
  predictions about employment keep missing.
- **Must cover**: the task frame — jobs are bundles of tasks, automation
  takes tasks, and the job recomposes around what is left (the frame that
  makes every headline parseable); the track record of automation
  predictions (the canonical teller/ATM story told honestly); what is
  measured so far — productivity effects, adoption patterns — as dated
  asides with sources, not as claims of this page; who bears transition
  costs and why averages hide it; the new work inside AI (annotation,
  rating — connect to `what-models-are-trained-on`); why prediction keeps
  failing (diffusion lag, task recomposition, and demand effects pointing
  opposite directions).
- **Must not**: employment forecasts as this page's claims; policy
  advocacy; both species of evidence-free tone (`specs/editorial` names
  them as one defect).
- **Mentions**: none required.
- **Beats the alternative by**: giving the reader the task-recomposition
  frame, which converts an anxiety topic into an analysis topic.

---

### Mechanics

#### `how-models-are-trained` — existing, untouched
- **Status**: existing (mechanics) · **Area**: C ·
  **Prerequisites**: `how-a-language-model-works` (unchanged).

#### `what-a-benchmark-measures` — existing, untouched
- **Status**: existing (mechanics) · **Area**: E ·
  **Prerequisites**: `how-models-are-trained` (unchanged).

#### `what-an-agent-is` — existing, untouched
- **Status**: existing (mechanics) · **Area**: D · **Prerequisites**:
  `how-a-language-model-works`, `why-context-is-not-memory` (unchanged).

#### `why-bigger-got-better` — "Why bigger kept getting better"
- **Status**: new · **Area**: C · **Prerequisites**:
  `how-models-are-trained`, `what-a-benchmark-measures`,
  `why-models-are-confidently-wrong`
- **Outcome**: You can state what a scaling law actually predicts, what the
  bitter lesson claims, and why buying more compute was the winning move for
  a decade without ever being the whole story.
- **Must cover**: scaling laws as measured regularities — loss falls
  predictably with compute, data and parameters, which made nine-figure
  training runs a calculable bet rather than a gamble (that is the
  historical point of them); the compute-optimal rebalance (more data per
  parameter than the first laws assumed — named, not derived); the bitter
  lesson as a claim with a text (general methods that ride compute beat
  crafted knowledge) and its serious critics; the emergence dispute — real
  jumps versus metric thresholds, connected to the benchmark page's
  smooth-loss/jagged-metric section; what scaling never bought (the failure
  modes of `why-models-are-confidently-wrong` persist at every size); the
  walls (data, power, money) as dated asides pointing at the costs page;
  and the epistemic state the rest of the page rests on — scaling laws are
  **measured regularities, not derived results**. The field can predict
  that loss falls with compute and cannot say why the capabilities that
  accompany it appear at all: the training objective is next-token
  prediction, and no accepted theory explains why optimising it yields what
  it yields. Say this plainly and cite it — the emergence claim and its
  metric-artifact rebuttal both named and sourced, so the reader sees a
  live scientific dispute rather than a settled story or a mystery. This is
  prediction without explanation, which is a real and unusual position for
  a mature engineering field to be in, and it is the honest reason forecasts
  built on extrapolation deserve the scepticism the capstone gives them.
- **Must not**: equations; forecasting (the capstone's job); benchmark
  score citations.
- **Mentions**: `concept/scaling-laws`, `concept/the-bitter-lesson`,
  `concept/emergence`, `concept/grokking`.
- **Beats the alternative by**: separating the measured regularity from the
  ideology built on it — most writing conflates scaling laws, the bitter
  lesson and emergence into one vibe.

#### `what-a-reasoning-model-does` — "What a reasoning model actually does"
- **Status**: new · **Area**: D · **Prerequisites**:
  `how-models-are-trained`, `getting-good-answers`,
  `why-models-are-confidently-wrong`
- **Outcome**: You can say what changed between a chat model and a
  reasoning model, why buying thinking time helps on some tasks and not
  others, and read a hidden-work answer with the right suspicion.
- **Must cover**: chain-of-thought grown from prompt trick
  (`getting-good-answers`) into trained behaviour; test-time compute as the
  third dial (after parameters and data — spend at answer time instead of
  training time); how the behaviour is trained (verifiable rewards — and
  therefore why the gains concentrate exactly where checkers exist, math
  and code, connecting the asymmetry `why-models-are-confidently-wrong`
  ends on); the honest caveats — the visible chain is not a faithful log
  of the computation, and summarised or hidden reasoning is a product
  choice layered on top; the price — latency and cost scale with thinking,
  which is why the dial is exposed to users at all.
- **Must not**: vendor comparisons; benchmark scores; "the model really
  thinks/doesn't really think" metaphysics — describe the computation and
  let the reader keep their own word for it.
- **Mentions**: `concept/chain-of-thought`, `technique/test-time-scaling`,
  `technique/reinforcement-learning-with-verifiable-rewards`.
- **Beats the alternative by**: the third-dial frame plus the faithfulness
  caveat — coverage of reasoning models is either marketing or
  metaphysics, rarely mechanism.

#### `how-image-generation-works` — "How image generation works"
- **Status**: new · **Area**: A · **Prerequisites**: `the-kinds-of-models`,
  `how-machines-represent-meaning`
- **Outcome**: You can trace a prompt through a diffusion model — noise,
  denoising and the text that steers it — and say why the classic failures
  looked the way they did.
- **Must cover**: the training trick — learn to remove a little noise from
  a real image, at every noise level; generation as that skill run from
  pure noise, a step at a time; the text's role — the prompt is embedded
  (`how-machines-represent-meaning` pays off) and steers each denoising
  step toward images whose descriptions sit near it; why the classic
  failures were classic — local texture is easy, global constraints are
  hard (hands, text-in-images, object counts), with their fixes as dated
  asides; editing as the same machinery started from an image instead of
  noise (img2img, inpainting); one paragraph on video as diffusion with a
  time axis and consistency as the new hard constraint.
- **Must not**: sampler taxonomy, architecture nomenclature, tool guides,
  prompt tips.
- **Mentions**: `event/stable-diffusion-release`.
- **Beats the alternative by**: the reader leaves able to *predict* which
  images will come out wrong, which no "how diffusion works" explainer
  bothers to deliver.

#### `how-a-model-uses-your-documents` — "How a model reads your documents"
- **Status**: new · **Area**: D · **Prerequisites**:
  `how-machines-represent-meaning`, `why-context-is-not-memory`,
  `how-models-are-trained`
- **Outcome**: You can trace a question through retrieval — chunking,
  embedding, search and pasting — and say which stage failed when a
  document-grounded answer is wrong.
- **Must cover**: why not train on your files instead (facts belong where
  they can be corrected and cited — the argument
  `how-models-are-trained` makes, applied); the pipeline stage by stage —
  chunk, embed, index, search, paste, answer — with each stage's
  characteristic failure (chunk boundaries that cut the answer in half;
  semantic near-misses; similar-but-wrong passages; and after the paste,
  everything the context page taught about long inputs applies); real
  citations versus fabricated ones — retrieval is what makes a citation
  checkable, connecting `why-models-are-confidently-wrong`; when plain
  keyword search wins.
- **Must not**: vector-database comparisons; agent loops
  (`what-an-agent-is` owns them); chunking recipes.
- **Mentions**: `technique/retrieval-augmented-generation`,
  `concept/embeddings`, `concept/effective-context-length`.
- **Beats the alternative by**: the which-stage-failed diagnostic — RAG
  explainers describe the happy path; this page is organised around the
  failures.

#### `how-ai-systems-get-attacked` — "How AI systems get attacked"
- **Status**: new · **Area**: E · **Prerequisites**:
  `why-context-is-not-memory`, `what-an-agent-is`
- **Outcome**: You can explain a prompt injection to someone who has never
  seen one, say why it resists the fix that worked for SQL injection, and
  name the places a defence can actually live.
- **Must cover**: injection as the one-channel problem — the context page's
  "there is only one field" becomes the attack surface; direct versus
  indirect injection (the poisoned web page, the booby-trapped document);
  why there is no parameterised-query fix (the separation SQL got is
  exactly what the architecture lacks); exfiltration through tool use —
  the agent page's harness permissions become the blast radius; jailbreaks
  versus injections, kept distinct (one attacks the model's training, the
  other attacks the system's assembly of untrusted text — publicly
  conflated, mechanically different); poisoning at training time, one
  paragraph; defences stated honestly — classifiers, privilege separation,
  human gates — all outside the model, all probabilistic, none a wall.
- **Must not**: working attack strings or recipes; refusal-training
  internals (`what-safety-training-changes` owns the advanced treatment);
  vendor security claims.
- **Mentions**: `concept/model-context-protocol`.
- **Beats the alternative by**: the SQL-injection contrast — one paragraph
  that tells a technical reader exactly why this problem is different, and
  a lay reader why it is not yet solved.

#### `running-a-model-yourself` — "Running a model on your own computer"
- **Status**: new · **Area**: D · **Prerequisites**: `what-a-model-is`,
  `open-weights-and-closed-models`, `where-your-words-go`
- **Outcome**: You can say what it takes to run a model on hardware you
  own, what quantisation trades away, and when local genuinely beats an
  API.
- **Must cover**: what "running" means physically — the weights must fit
  in memory, and the memory number gates everything else; quantisation in
  prose — store each weight in fewer bytes, fit a bigger model in the same
  machine, pay in accuracy that depends on how far you push; the size
  ladder as structure (what a phone, a laptop, a workstation can hold —
  bands, not current model names); why local — privacy
  (`where-your-words-go` pays off), cost shape (hardware once versus
  per-token forever), and permanence (an API model can be retired out from
  under you; a file on your disk cannot); what you give up — frontier
  quality and speed, stated plainly.
- **Must not**: installation steps (tutorials own steps — say so and point
  at the tutorials surface); tool comparisons (the directory's job);
  hardware shopping advice.
- **Mentions**: `technique/quantization`, `tool/llama-cpp`, `tool/ollama`,
  `tool/lm-studio`.
- **Beats the alternative by**: the permanence argument and the memory-gate
  frame; local-LLM content is tool-first and rots monthly, this page is
  physics-first and does not.

#### `the-hardware-that-runs-ai` — "The hardware AI runs on"
- **Status**: new · **Area**: C · **Prerequisites**:
  `how-a-language-model-works`, `how-models-are-trained`
- **Outcome**: You can say why AI runs on graphics chips, which two numbers
  on an accelerator's spec sheet matter, and what a training cluster
  physically is.
- **Must cover**: why graphics chips — the model's arithmetic is millions
  of small identical operations, which is the shape graphics hardware was
  already built for; the two numbers — arithmetic throughput and memory
  bandwidth — and the fact that different workloads exhaust different ones
  (this deliberately pre-seeds the prefill/decode asymmetry that
  `how-inference-is-served` builds its whole page on); memory capacity as
  the third wall (what fits decides what runs); a training cluster as a
  distributed system — thousands of accelerators, an interconnect that
  matters as much as the chips, and failure as a constant companion at
  that scale; the supply chokepoint as structure (design concentrated in
  one company, leading-edge fabrication in one region — no market numbers
  in prose).
- **Must not**: serving economics (`how-inference-is-served` owns them);
  chip model numbers and spec-sheet figures as literals (transclusion or
  dated aside); buying advice.
- **Mentions**: `org/nvidia`.
- **Beats the alternative by**: the two-numbers frame — it is the
  spec-sheet literacy nothing consumer-facing teaches, and it makes the
  advanced serving page land.

#### `ai-and-the-law` — "The legal questions AI actually raises"
- **Status**: new · **Area**: F · **Prerequisites**:
  `what-models-are-trained-on`, `the-kinds-of-models`,
  `where-ai-fails-people`
- **Outcome**: You can name the legal questions AI genuinely raises, say
  why training-data copyright is the load-bearing fight, and tell a
  settled rule from an open one.
- **Must cover**: the durable questions, as questions — (1) may you train
  on copyrighted work without permission? (the actual arguments both sides
  make — market substitution versus transformative use — with case status
  strictly as dated asides); (2) who owns output, and can output infringe?
  (3) who is liable when a system harms — the accountability gap from
  `where-ai-fails-people`, now in legal clothes; (4) how regulation is
  being shaped (risk tiers versus sector rules as the two approaches;
  any named act is a dated aside); (5) where privacy law collides with
  scraped training data; the meta-point that carries the page: law moves
  by analogy, and the fight is over which analogy applies (photography,
  sampling, the search-engine cache).
- **Must not**: jurisdiction-by-jurisdiction current status; outcome
  predictions; legal advice; naming a "likely winner".
- **Mentions**: none required.
- **Beats the alternative by**: questions-first structure that stays true
  as rulings land — news coverage inverts it and expires weekly.

---

### Advanced

#### `how-inference-is-served` — existing, untouched
- **Status**: existing (advanced) · **Area**: D · **Prerequisites**:
  `how-a-language-model-works`, `how-models-are-trained` (unchanged).

#### `what-safety-training-changes` — existing, untouched
- **Status**: existing (advanced) · **Area**: C ·
  **Prerequisites**: `how-models-are-trained` (unchanged).

#### `why-the-same-request-gives-different-answers` — existing, untouched
- **Status**: existing (advanced) · **Area**: E · **Prerequisites**:
  `how-a-language-model-works`, `how-inference-is-served` (unchanged).

#### `what-it-costs-to-build-and-run-ai` — "What it costs to build and run AI"
- **Status**: new · **Area**: C · **Prerequisites**:
  `the-hardware-that-runs-ai`, `why-bigger-got-better`,
  `how-inference-is-served`, `who-builds-ai`
- **Outcome**: You can separate the one-time cost of training from the
  forever cost of serving, say where the electricity actually goes, and
  read an AI business story with the unit economics in view.
- **Must cover**: training cost anatomy — chips times time times power,
  budgeted in advance because scaling laws made the bet calculable
  (`why-bigger-got-better` pays off); why pretraining concentrated into a
  handful of organisations (the chokepoint `who-builds-ai` gestured at,
  now with its mechanism); serving as the cost that never ends — the
  per-token economics of `how-inference-is-served` meeting flat-rate
  subscription pricing, and what that tension does to products; energy
  and water as measured quantities with dates and sources — training's
  spike versus inference's steady draw, compared honestly against other
  infrastructure rather than in isolation; the subsidy question, stated
  structurally (prices below cost as a strategy has a long history; whose
  money, for how long — dated asides only); the counter-current —
  distillation and small models make yesterday's capability cheap on a
  schedule (`concept/distillation`).
- **Must not**: specific dollar figures or valuations as undated literals;
  company-by-company financials; boom or doom framing.
- **Mentions**: `concept/scaling-laws`, `concept/distillation`.
- **Beats the alternative by**: putting training, serving and energy in one
  causal frame — coverage treats them as three separate stories and gets
  all three out of proportion.

#### `looking-inside-a-model` — "Looking inside a model"
- **Status**: new · **Area**: A · **Prerequisites**:
  `how-a-language-model-works`, `what-safety-training-changes`
- **Outcome**: You can say what interpretability researchers actually do,
  name results where a behaviour was genuinely located in the weights, and
  state why "we don't know how it works" is both true and shrinking.
- **Must cover**: why inspection is hard — the behaviour is smeared across
  the numbers rather than written anywhere a person can read, a premise the
  page establishes for itself from `what-a-model-is` (writer's note:
  `what-a-neural-network-is` covers this on the foundations rung, but it is
  not a prerequisite here, so this page may not lean on it); this page is
  the research program that refuses to accept that; probing (asking whether a concept is decodable
  from activations); superposition in prose — more concepts than neurons,
  so single neurons disappoint by necessity; features and circuits as the
  units that are working better; the worked example the reader already
  owns — the refusal direction from `what-safety-training-changes`, reread
  as interpretability's proof that a behaviour can have an address; what
  the field can and cannot promise yet (auditing dreams versus current
  reach — honest, dated); why it matters beyond curiosity (the debates
  page will lean on whether inspection can ever certify behaviour); and
  the "true" half of the outcome's "true and shrinking", given its full
  weight and cited. Interpretability has genuinely shrunk *we cannot say
  what this neuron does*. It has not touched *why training a next-token
  predictor on text produces something that generalises like this*, and the
  page must not let progress on the first imply progress on the second.
  Name honestly which parts of the opacity are yielding to research and
  which are not yet well-posed as questions — that distinction is more
  interesting than either "black box, nobody knows" or "we are steadily
  solving it", and drawing it is this page's hardest work.
- **Must not**: equations; overclaiming in either direction — this page
  must model the site's calibration or it teaches the wrong lesson twice.
- **Mentions**: `concept/grokking`.
- **Beats the alternative by**: using a result the reader has already met
  as the worked example — the surface's connectedness doing real work.

#### `the-safety-debates` — "The safety arguments, steelmanned"
- **Status**: new · **Area**: F · **Prerequisites**:
  `what-safety-training-changes`, `why-bigger-got-better`,
  `where-ai-fails-people`
- **Outcome**: You can state the strongest version of each side of the
  AI-risk argument, say what alignment names and why it is hard to even
  specify, and tell which disagreements are about facts and which about
  values.
- **Must cover**: the near-term ledger, taken seriously on its own terms
  (the harms of `where-ai-fails-people` plus misuse at scale — fraud,
  persuasion, the uplift question stated carefully and without recipes);
  alignment as a specification problem — `how-models-are-trained` said
  every objective is a proxy; this page makes that the thesis (you get
  what you measured, at increasing capability); the existential argument's
  actual steps, steelmanned, and its strongest criticisms, steelmanned —
  neither side gets a straw opponent; why credentialed people genuinely
  disagree (different priors on capability trajectory, different weights
  on tail risk — separable disagreements the reader can now separate);
  what labs actually do before release (evaluations, red-teaming — as
  practice, not as endorsement of sufficiency); the reader's tool: sort
  each disagreement into fact-shaped (evidence could settle it) or
  value-shaped (it prices a trade-off), and notice how much argument
  evaporates.
- **Must not**: advocacy for any position; probability-of-doom numbers;
  dismissiveness in either direction — `specs/editorial`: enthusiasm
  without evidence and cynicism without evidence are the same defect.
  Review should read this page adversarially from both sides (design D8).
- **Mentions**: `event/gpt-2-staged-release`.
- **Beats the alternative by**: steelmanning both directions in one place —
  nearly everything written on this topic is a brief for one side.

#### `how-to-think-about-what-comes-next` — "How to think about what comes next"
- **Status**: new · **Area**: F · **Prerequisites**:
  `why-bigger-got-better`, `what-a-benchmark-measures`, `the-safety-debates`,
  `ai-and-work`
- **Outcome**: You can weigh a confident AI forecast, name the walls
  scaling has hit before and what happened to each, and watch the few
  indicators that actually move before the headlines do.
- **Must cover**: the track record, both directions — the field
  overpromised into two winters and then underpromised the 2020s, so
  neither hype nor dismissal has the better record; extrapolation versus
  wall arguments (data, power, economics — each wall with its serious
  version and its historical counter); capability versus diffusion — what
  a model can do and what the world has absorbed are different curves
  years apart (`ai-and-work`'s lesson, generalised); what a reader can
  actually watch — compute trends, benchmark saturation-and-replacement
  cycles (with every caveat `what-a-benchmark-measures` installed), the
  open-versus-frontier gap, prices — indicators, not predictions; the
  discipline as the takeaway: dated claims, named indicators, revisable
  beliefs — which is this site's own method, handed to the reader as the
  last thing the surface teaches.
- **Must not**: a forecast of its own; timelines; the word "inevitable".
  This page is the capstone — by prerequisite depth it lands last in the
  generated reading order, and its entry records that as intent (design
  D5).
- **Mentions**: `concept/scaling-laws`, `concept/ai-winter`.
- **Beats the alternative by**: refusing to predict, and teaching the
  reader to evaluate everyone who does.

## §5 — The dependency graph and the wave order

**The rule the build now enforces**: prerequisites point down or sideways on
the ladder, never up (task 1.1). **The rule the task order enforces**: a page
lands only after its prerequisites exist, because a missing prerequisite
fails the build.

The graph is a DAG: each entry above declares prerequisites only among pages
listed before it or already published. The build's cycle check
(`lib/learn.mjs`) verifies acyclicity on every run; no separate proof is
needed here.

Edges (page ← prerequisites), new pages and edits only:

```
learning-from-examples        ← what-ai-actually-is
what-a-model-is (edit)        ← what-ai-actually-is
where-ai-came-from            ← what-ai-actually-is
what-ai-is-used-for           ← what-ai-actually-is
who-builds-ai                 ← what-ai-actually-is
where-ai-fails-people         ← learning-from-examples, what-ai-is-used-for
what-a-neural-network-is      ← learning-from-examples, what-a-model-is
how-a-language-model-works (edit) ← what-a-model-is, what-a-neural-network-is
the-kinds-of-models           ← what-a-neural-network-is
how-machines-represent-meaning ← what-a-neural-network-is
what-models-are-trained-on    ← learning-from-examples, why-models-are-confidently-wrong
getting-good-answers          ← how-a-language-model-works, why-context-is-not-memory
open-weights-and-closed-models ← what-a-model-is
where-your-words-go           ← what-a-model-is
when-you-cannot-trust-your-eyes ← the-kinds-of-models
ai-and-work                   ← what-ai-is-used-for
why-bigger-got-better         ← how-models-are-trained, what-a-benchmark-measures, why-models-are-confidently-wrong
what-a-reasoning-model-does   ← how-models-are-trained, getting-good-answers, why-models-are-confidently-wrong
how-image-generation-works    ← the-kinds-of-models, how-machines-represent-meaning
how-a-model-uses-your-documents ← how-machines-represent-meaning, why-context-is-not-memory, how-models-are-trained
how-ai-systems-get-attacked   ← why-context-is-not-memory, what-an-agent-is
running-a-model-yourself      ← what-a-model-is, open-weights-and-closed-models, where-your-words-go
the-hardware-that-runs-ai     ← how-a-language-model-works, how-models-are-trained
ai-and-the-law                ← what-models-are-trained-on, the-kinds-of-models, where-ai-fails-people
what-it-costs-to-build-and-run-ai ← the-hardware-that-runs-ai, why-bigger-got-better, how-inference-is-served, who-builds-ai
looking-inside-a-model        ← how-a-language-model-works, what-safety-training-changes
the-safety-debates            ← what-safety-training-changes, why-bigger-got-better, where-ai-fails-people
how-to-think-about-what-comes-next ← why-bigger-got-better, what-a-benchmark-measures, the-safety-debates, ai-and-work
```

**Nine of these edges exist because a "must cover" item leans on the page.**
When an entry tells you to apply, generalise or pay off another page's
argument — "the argument `how-models-are-trained` makes, applied", "privacy
(`where-your-words-go` pays off)", "`ai-and-work`'s lesson, generalised" —
that page is a true assumption and is declared, because the spec says a page
may assume, among learn pages, only its transitive prerequisites, and leaning
on an undeclared one is rejected as `spec-violation`. Cross-references that a
reader would merely find useful are *not* declared and stay inline links; the
entries that only defer to another page ("one sentence, deferring to …") or
that seed a later one are those, not prerequisites.

The wave order in `tasks.md` is a valid topological order of this graph with
the two front-matter edits sequenced after the pages they point to. Any
executor picking tasks out of order must re-check this property; the cheap
way is to confirm every slug in your page's `prerequisites` already exists
under `content/learn/`.
