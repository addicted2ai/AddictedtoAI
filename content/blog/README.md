# content/blog/

Blog posts (`specs/blog`). One file per post, front matter declaring `date`.
Posts are dated and never silently rewritten: a correction is appended as a
dated block.

**A post takes one of two forms.**

- A **note** — something happened, and somebody is affected by it. It leads
  with the event and who it lands on, declares its anchor in front matter
  (`covers:` for a `data/changes.jsonl` line, `anchor:` for an external URL,
  either dated within seven days of the post's own date), and references the
  wiki for the standing facts rather than restating them. There is no minimum
  length: brevity is never a defect in a note.
- A **synthesis** — several things add up to something none of them said
  alone. It states its method and its evidence is enumerable and dated. It
  declares no anchor, because the point is the pattern, not one event.

**There is no cadence and no ceiling.** No count controls this directory in
either direction: nothing requires a post this week, and nothing refuses one
because last week already had three. The count machinery that used to sit on
both sides of that — a build warning in `lib/posts.mjs` and a selector gate in
`loop/lib/surfaces.mjs` — was removed. Volume is limited where volume is
created (the scout files at most three candidates a day) and quality is
decided at review, which is the only place it can be.

**The scout is the producer.** Once a day the Pulse queues a `scout` job that
looks outward — at the world's AI, not at this site — and files the few
stories worth writing, each with externally retrieved evidence and an expiry.
A post job picks one up. A week in which nothing clears the bar publishes
nothing, and that is a success, not a gap.

**The subject is AI, never this site.** The data layer is usable as evidence;
it is not the story.

The prose bar is `openspec/style/blog-voice.md`, and it is enforced: a post
that reads as machine-made is rejected at review, and the voice lint fails the
build on the markers listed there.
