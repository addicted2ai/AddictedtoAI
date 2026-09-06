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

/**
 * WHETHER A DECLARED FRONTIER FLAG HOLDS — the one rule, read by both places
 * that enforce it.
 *
 * There are exactly two enforcement points and they judge the same three keys
 * at two different moments in a candidate's life:
 *
 *  - `postSchema`'s `superRefine` (`lib/schema.mjs`), at the BUILD, over a
 *    post's front matter — a flag that does not hold fails the build naming the
 *    file and the field, before any page renders;
 *  - `applyProposalMergeRules` (`loop/lib/proposals.mjs`), at the scout's
 *    MERGE, over a candidate's front matter — a flag that does not hold is
 *    dropped rather than filed, because the flag's whole effect (the exemption
 *    from the three-candidates-per-day cap) happens before any post exists.
 *
 * They are the same rule and are therefore written once. The alternative was
 * two copies with the vocabulary in common, and this repository has already
 * paid for what two copies of one closed list do: they drift, and the drift is
 * silent, so the filing gate and the build gate become two different checks
 * wearing one name. (They are NOT the vendor-claim invariant, whose second
 * implementation is deliberately independent so it can falsify the first; there
 * is no falsification relationship here — the merge gate cannot check a post
 * that does not exist yet, and the build gate cannot check a candidate that is
 * never going to become one.)
 *
 * Input is raw parsed front matter, from YAML that nothing has validated: the
 * merge reads a model-written file with `gray-matter` and no schema at all. So
 * the shapes are checked here rather than assumed. `postSchema` types the keys
 * before this runs and its type errors fire first, which makes those branches
 * dead on the build side and load-bearing on the merge side.
 *
 * A non-boolean `frontier` is a PROBLEM rather than an absent flag, on purpose.
 * Treating `frontier: yes` (a string under YAML 1.2) as unflagged would lose a
 * real declaration silently; treating it as flagged would let a value the
 * machinery cannot read buy an exemption. Refusing it does neither, and it
 * matches what the schema does with the same bytes.
 *
 * NOT A VERDICT ON THE CANDIDATE — read the returned list, never its length as
 * a boolean. A piece that declares NO flag can still return problems: a stray
 * `frontier_reason: F6`, or a `domains` value outside the vocabulary, is a
 * problem whatever the flag says, because a record carrying a criterion or a
 * domain it never claimed is a mistake worth stopping on. That is exactly right
 * at the BUILD, where those same bytes must fail; it is exactly wrong at the
 * MERGE, where the loop delta's SHALL binds a candidate *declaring* the flag and
 * `applyProposalMergeRules` drops only on `e.flagged` for that reason. So
 * `frontierFlagProblems(fm).length > 0` does not mean "this candidate is bad",
 * and the next caller that reads it that way will refuse work no requirement
 * refuses. Ask what the caller is judging before you ask what this returns.
 *
 * @param {object} fm parsed front matter
 * @returns {{path: (string|number)[], message: string}[]} empty when the flag
 *   holds — which is also the answer for a piece that declares no flag at all.
 */
export function frontierFlagProblems(fm = {}) {
  const problems = [];
  const declared = fm?.frontier;
  const present = declared !== undefined && declared !== null;
  if (present && typeof declared !== 'boolean') {
    problems.push({
      path: ['frontier'],
      message:
        `invalid frontier ${JSON.stringify(declared)} — \`frontier\` is the boolean `
        + 'true or false; a flag the machinery cannot read is one that buys an '
        + 'exemption by accident or loses a real declaration in silence',
    });
  }
  const flagged = declared === true;

  const reason = fm?.frontier_reason;
  const hasReason = reason !== undefined && reason !== null && String(reason).trim() !== '';
  if (flagged && !hasReason) {
    problems.push({
      path: ['frontier_reason'],
      message:
        'a record declaring `frontier: true` must cite exactly one criterion in '
        + `\`frontier_reason\`: ${FRONTIER_REASONS.join(', ')} — the flag buys an `
        + "exemption from the scout's candidate cap, and an exemption without a "
        + 'bar is a loophole',
    });
  } else if (hasReason && !FRONTIER_REASONS.includes(reason)) {
    // Checked whenever a criterion is DECLARED, flagged or not: `F6` is not a
    // criterion whatever the flag says, and a record carrying a criterion it
    // never claimed is a mistake worth stopping on rather than ignoring.
    problems.push({
      path: ['frontier_reason'],
      message:
        `invalid frontier_reason ${JSON.stringify(reason)} — the criterion must come `
        + `from the closed list: ${FRONTIER_REASONS.join(', ')}`,
    });
  }

  const domains = fm?.domains;
  if (domains === undefined || domains === null) return problems;
  if (!Array.isArray(domains)) {
    problems.push({
      path: ['domains'],
      message:
        `invalid domains ${JSON.stringify(domains)} — \`domains\` is a LIST of values `
        + `from the closed vocabulary: ${DOMAINS.join(', ')}`,
    });
    return problems;
  }
  for (const [i, d] of domains.entries()) {
    if (DOMAINS.includes(d)) continue;
    problems.push({
      path: ['domains', i],
      message:
        `invalid domain ${JSON.stringify(d)} — domains must come from the closed `
        + `vocabulary: ${DOMAINS.join(', ')}. "general" is the UNMARKED default `
        + '(declare no domain at all) and `text` is not a value',
    });
  }
  return problems;
}
