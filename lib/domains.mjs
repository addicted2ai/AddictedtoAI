/**
 * domains.mjs — the ONLY declared home of the domain vocabulary and of the
 * frontier criteria `F1`–`F5`.
 *
 * **Nothing else in the source tree may restate the eight values.** The wiki
 * facet (`tag-the-corpus-by-domain`, specs/wiki, "A domain says what a thing
 * is for"), the post-level frontier gate (`flag-what-moved-the-frontier`,
 * specs/blog), the directory's tool listings, and every surface that groups by
 * domain read `DOMAINS` from here. A specification may *name* the eight values
 * so a reviewer can check the requirement — that is prose, not a second
 * definition — but a second constant is a defect: two closed lists of the same
 * eight strings drift, and the moment they do the entry gate and the post gate
 * are two different checks wearing one name. That is the
 * reads-as-present-and-does-nothing shape this repository keeps catching.
 *
 * Split out of `schema.mjs` for the reason `lib/tool-categories.mjs` states
 * about tool categories: a page component and a non-schema consumer can read
 * the vocabulary without dragging `zod` and every content schema into their
 * bundle. `schema.mjs` reads this file; it does not copy it.
 *
 * Closed for the same reason `KINDS` (`schema.mjs`) and `TOOL_CATEGORIES` are
 * closed: an open field drifts into `coding` / `code` / `Coding` and the
 * grouping stops being a partition. A value outside `DOMAINS` fails the build
 * naming the file, the field, the offending value and the allowed values.
 *
 * **"general" is unmarked, and `text` is deliberately not a value — keeper
 * ruling K38.** There is no `general` string to declare: an entry, listing or
 * post carrying no domain *is* general, and that is a complete answer rather
 * than an unfilled field. `text` was removed because it is a measurement, not
 * a taste: read from `data/sources/openrouter-models/latest.json` on
 * 2026-09-05 (`fetched_at` `2026-09-05T06:00:04.599Z`, `row_count` 431), every
 * one of the 431 rows takes text in, out, or both. A facet value carried by
 * every member of the set it is meant to divide discriminates nothing, and a
 * filter that selects everything is a filter a reader learns to distrust.
 * There is no `multimodal` value either: that is the union of several domains,
 * not a member of the list — the facet is set-valued, so the union is spelled
 * by declaring both.
 *
 * **Declared, never inferred.** No heuristic over a title, body, aliases or URL
 * may assign a domain, for the reason `lib/tool-categories.mjs` gives: a
 * heuristic that is right 90% of the time is silently wrong 10% of the time and
 * nothing downstream can tell which. A domain that arrives mechanically arrives
 * from a named feed field, into the separate `domains_seeded` key, and from
 * nowhere else.
 *
 * **The array's order carries no display authority.** It is the order the
 * specifications state the vocabulary in, kept so a reader can diff the two by
 * eye. Domain ordering on any surface is a pure function of the domain id (the
 * `directory` guarantee "No placement is ever sold", as a superset), so
 * shuffling this array cannot move a domain up a page.
 */
export const DOMAINS = Object.freeze([
  'coding',
  'agents',
  'image',
  'video',
  'audio',
  'research',
  'science-math',
  'robotics',
]);

/**
 * The frontier criteria. Exactly one is cited by a post declaring
 * `frontier: true`, in its `frontier_reason` key; a flag with no criterion, or
 * with a criterion outside these five ids, fails the build and — in the scout's
 * merge — is not filed at all.
 *
 * The `text` of each is transcribed VERBATIM from
 * `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §1 (keeper-signed
 * 2026-09-05) and reproduced identically in the `blog` delta of
 * `flag-what-moved-the-frontier`. It is not re-decided or paraphrased here: if
 * this text and the order disagree, this file has the defect.
 *
 * The complement is normative too and lives with the requirement rather than
 * here, because it is a test and not a list to be extended: a new checkpoint, a
 * price change, a benchmark post with no new artifact and a tool release do not
 * qualify — *what every other AI news site already shows does not qualify on
 * its own*.
 */
export const FRONTIER_CRITERIA = Object.freeze([
  Object.freeze({
    id: 'F1',
    text:
      'a capability shown for the first time, with an artifact anyone can '
      + 'check (executed transcript, paper with code, public demo).',
  }),
  Object.freeze({
    id: 'F2',
    text: 'a lead change on a published index, or a rescoring that moved a leader.',
  }),
  Object.freeze({
    id: 'F3',
    text:
      'a release by a covered organisation of a model it positions as its '
      + "frontier, or an open-weights release matching a covered lab's frontier "
      + 'on a published measure.',
  }),
  Object.freeze({
    id: 'F4',
    text:
      'a verbatim vendor claim by a major player about a new ability, '
      + 'labelled unverified.',
  }),
  Object.freeze({
    id: 'F5',
    text: 'a material change in access: a frontier model withdrawn, gated, or opened.',
  }),
]);

/** The five criterion ids, for the schema's closed list. */
export const FRONTIER_REASONS = Object.freeze(FRONTIER_CRITERIA.map((c) => c.id));
