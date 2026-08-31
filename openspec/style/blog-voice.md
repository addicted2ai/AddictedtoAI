# The blog's voice

This is the house voice of record for blog posts, required by `specs/blog`
("Posts read as human writing, and the disclosure of AI authorship stands").
It lives at `openspec/style/blog-voice.md` for the same reason the learn
curriculum lives at `openspec/curriculum/learn.md`: archiving moves a
change's own files, `openspec/specs/` is reserved, and this document must
outlive the change that wrote it *and* stay amendable — amending it is
ordinary editorial work, recorded in git, not an OpenSpec change.

**Method, stated because the method is unusual.** This document was derived
2026-08-30 from the predecessor site's blog (twelve posts at commit
`d34040b`), which is two corpora in one:

- For **editorial judgment** — what to cover, why now, how to source, how to
  attribute, who is affected, when to stop — the twelve posts are the
  standard, and §4 collects what they teach.
- For **prose voice** they are the **negative corpus**. The maintainer's own
  verdict: *"The quality was very good, but obviously AI generated."* Their
  measured tells are §3's labeled examples, and the voice lint's tests
  assert it warns on them.

There is therefore **no positive exemplar of the target voice in this
repository**. §2 defines the voice on its own terms, with fresh
before/after pairs, because "write like X" is not available and pretending
otherwise would launder the negative corpus back in.

One ordering rule governs everything below, per the maintainer's own
priority: **quality outranks sounding human.** A post is judged first on
whether it is worth a stranger's attention — feeling human is a stylistic
preference that can only be measured so accurately, which is why §3's
mechanical half advises rather than gates. Never trade a specific,
well-evidenced sentence for one that merely scores better against the
tells; and nothing here is a reason to conceal AI authorship, which the
site discloses on every page.

## §1 — The reader, and the one boundary

Write for the stranger of the charter test: someone who does not know or
care that an AI made this site, judging only whether the piece is worth
their attention. A reader who knows the site's premise should still find
prose worth reading — that is stricter than concealment, not weaker.

**This document governs craft, never disclosure.** The site openly says an
AI writes it, and nothing here may be read as a reason to hide, soften, or
qualify that. The writing must not *read* machine-made; the site must not
*pretend* human-made. Both at once, always.

## §2 — The voice, on its own terms

1. **The lede is a fact.** First sentence: who did what, when, with the
   number that matters. No scene-setting, no "in a significant move".
   - *Not:* "The AI pricing landscape shifted significantly this week when
     OpenAI announced changes to its API."
   - *But:* "OpenAI cut Luna's API price 80% on 30 July and made it the
     free default a week later."
2. **Show the discipline; never narrate it.** Attribution lives in the
   sentence, not in commentary about the sentence. The moment prose starts
   describing its own rigor, it has stopped being read.
   - *Not:* "Every number in this post is the vendor's own, and it is
     labelled as such here."
   - *But:* "OpenAI's launch page — the company's own figures, checked
     against no one else's — prices the three tiers at…"
3. **Vary the rhythm on purpose.** Long evidence sentences earn short blunt
   ones. A one-sentence paragraph is legal. A fragment is legal. Six
   paragraphs of the same length and shape is the loudest tell there is,
   and no wordlist catches it — only reading it aloud does.
4. **Emphasis is a scarce resource.** Bold the one number the reader must
   carry away, or bold nothing. Bolding every figure emphasises none.
5. **Headers state findings, not functions.** A header is a claim the
   section then proves.
   - *Not:* "What the prices were, and what they are now" / "The claims,
     labelled as claims" / "Conclusion".
   - *But:* "The answer that reversed" / "Half price until 31 December,
     then double".
6. **A point of view, where the evidence supports one — said once,
   plainly.** "A model whose price doubles on a stated date is a decision
   you make before New Year" is analysis. "It remains to be seen" is not.
7. **Length is set by what there is to say.** If the honest version is four
   paragraphs, it is four paragraphs, and it does not wear headers.
8. **Lists only when the content is a list** — a timeline, a table of
   figures. Never to give prose the *appearance* of structure, and never
   with a bolded label bolted to every item.
9. **No symmetry for its own sake.** Balanced antithesis in matched clause
   pairs ("X is one thing. Y is another.") reads as generated because it
   is; when the contrast is real, state it once and unevenly.

## §3 — The tells

Every number below was measured, 2026-08-30, against the twelve-post
negative corpus and a nine-piece human sample on the same beat. The
corpora, the instrument, the per-document values, and the honest limits —
fitted thresholds, single-punctuation-mark margins, a sample that is
neither era- nor length-matched — are recorded in
`openspec/style/blog-voice-calibration.md`, beside this file;
recalibrating means re-running that derivation on a new corpus and
rewriting that record, never re-deciding a number by hand. (The
`make-the-blog-worth-sending` change's `design.md` is the history of the
first derivation, not its record of record — archiving moves it.)

**Advisory — the voice lint warns on these, for posts, and never fails the
build.** The closed list lives in the lint script; this is its
documentation. Counted outside code fences, blockquotes, and dated
correction blocks. The thresholds separate the house model's measured
default register from edited technology writing on the corpora measured —
they are not a validated AI detector, and the same model trips the
punctuation rates in every register it writes, which is exactly why they
advise instead of gate. The build-failing voice gate is the review verdict
(`reads-as-generated`), a model's judgment with a named reason; the
warnings are the writer's checklist and a signal the reviewer may cite:

- **Semicolons above 2.5 per 1,000 words** (the negative corpus runs
  1.85–5.98 per piece, ten of twelve above the line; the human sample tops
  out at 2.15). The habit to replace: clauses glued with semicolons where
  a full stop would be blunter. An earlier version of this file reported
  2.7–11.1 firing twelve of twelve; the maximum was a statute-citation
  entity miscount, corrected in the calibration record.
- **Em-dashes above 10 per 1,000 words** (negative corpus median 15.0,
  nine of twelve above the line; human maximum 9.9 — a dash-loving human
  stays under this, by one dash). Density, not presence: the dash itself is
  not banned, the habit is. It is also the most widely meme-recognized tell
  there is, so readers now run this check whether or not it is
  statistically sound — perceived tells are tells.
- **Self-narration, any occurrence**: "this post", "this piece",
  "labelled/labeled as such", "as claims here", "measured here",
  "attributed here". Ten of the twelve carried these (one carried 26);
  zero human pieces did, on every sample measured — the cleanest marker in
  the list, and the most directly fixable. Show the discipline (§2.2);
  never narrate it.
- **Two or more headers beginning "What", "Why" or "How"** — 22 of the
  negative corpus's 76 headers caption their own function this way; 0 of
  the human sample's 24 do.
- **Register guards, presence-level**: a "Conclusion" / "Key takeaways" /
  "In summary" / "Final thoughts" header; the phrases "let's dive",
  "deep dive", "only time will tell", "in today's rapidly evolving",
  "stands as a testament", "navigate the complexities", "it's worth noting
  that"; the focal-word family (delve, tapestry, showcase, underscore,
  boast, pivotal, crucial, robust, seamless, landscape, realm, testament,
  vibrant, foster, garner, leverage, intricate, comprehensive, notably,
  moreover, furthermore, additionally) above **3 per 1,000 words**. None
  fire on the negative corpus — the house model does not delve. They exist
  because the author model is swappable by design (`runners.yml`), and the
  next model may. Two false-positive modes are measured and recorded in
  the calibration file: quoted material (a spokesperson's "robustly" is
  their word, not the writer's) and short pieces, where a single word can
  clear a rate threshold — a note has no minimum length, so a rate warning
  on a short note is a prompt to read, not a verdict.
- **A list of three or more items, every one opening bold** — validated
  against the negative corpus and the literature only; human news HTML
  does not use markdown lists, so the two-direction test does not apply
  and this marker stays deliberately narrow.

The list is deliberately short, and it is written to be followable by a
weaker model than the one that derived it: every marker is a literal count
with a stated substitute habit, never a quality judgment in disguise. A
lint that bans ordinary connectives produces stilted prose, which is its
own tell — and two famous markers are **excluded because they failed
validation**: the "delve"-family at presence level fires on good human
journalism more than on the negative corpus, and "not just X, but Y"
occurs at *twice* the rate in the human sample. Do not re-add a marker
without re-running the two-direction check.

**Judgment — the review job rejects as `reads-as-generated`.** What no
string or rate check settles, the reviewer settles, in its own words, in
the verdict record's `reads-human` field: uniform sentence rhythm and
paragraph shape (measured sentence-length variance did *not* mechanically
separate the corpora — edited journalism is itself smooth — so rhythm is
judged, not counted); meta-commentary about the piece's own method beyond
the closed phrases; balanced antithesis in matched clause pairs; hedge
stacks; emphasis spread evenly across every figure; structure signposted
rather than felt; the sense that every sentence came from the same
template.

## §4 — What the predecessor's twelve posts still teach

Everything below is the standard to keep, measured from the same corpus
whose prose voice is rejected above:

- **Subject selection**: an event that happened to somebody, with a stated
  "why now". The best opener in the corpus is *"If you use Manus, read this
  paragraph first"* — the affected reader addressed in the first clause.
- **Sourcing**: every claim traces to something fetched during the writing,
  cited where a reader can follow it. "Reportedly" and memory are not
  sources.
- **Attribution of vendor claims as claims** — done in the sentence, per
  §2.2, not in commentary.
- **The gap left honest**: when the source does not say why, the post does
  not guess ("Manus does not name the requirement or the jurisdiction, and
  this post does not fill that gap" — right instinct, wrong words; write
  "Manus names neither the requirement nor the jurisdiction" and stop).
- **Dated in-post correction notes** — a visible "Update, <date>:" block at
  the point of the superseded claim, never a silent rewrite. `specs/blog`
  already requires this; the predecessor shows how it reads.
- **When to stop**: publishing something you would not send to a friend is
  worse than publishing nothing.
