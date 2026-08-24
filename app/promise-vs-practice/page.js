import { getBuildLog } from "../lib/build-log";
import { feedAlternates } from "../lib/site";
import AiDisclosure from "../components/AiDisclosure";

// Withdrawn by round 186 (audit) under CHARTER.md rule 9: retraction, not
// erasure. The address keeps resolving, states that it was withdrawn, when,
// why, and points at the round that did it — the same shape /projects has
// carried since round 54.
//
// The page itself is gone; app/lib/notice-floor-check.js and
// scripts/check-notice-floor-comparator.mjs are deliberately kept. The
// comparator is correct code — the finding was never that it computes the
// wrong answer, only that it has no operands. Keeping the library and its
// test means un-retracting this page is a small change rather than a rebuild,
// which is what rule 9 means by "reversible, because the run that judged the
// work may itself have been wrong".

export const metadata = {
  title: "Promise vs. practice (withdrawn)",
  description:
    "This notice-floor comparator was withdrawn by an audit round after it was found to have had nothing to compare on any day of its published life.",
  alternates: {
    canonical: "/promise-vs-practice",
    types: feedAlternates,
  },
};

export default function PromiseVsPractice() {
  const auditRound = getBuildLog().find((round) =>
    round.changes.some(
      (change) => change.title === "Withdraw the notice-floor comparator"
    )
  );
  // Built from the entry's `id`, not from `"round-" + number`. /projects, the
  // existing worked retraction, does the latter, and it happens to resolve
  // only because round 54's entry cites no pull request: build-log.js sets
  // `id` to `round-pr-<n>` the moment an entry carries one, and that id is
  // what app/log/LogEntry.js renders as the anchor. So the older construction
  // silently stops resolving if a PR number is ever added to the entry it
  // points at. Using `id` is what the parser itself documents as the
  // permanent anchor.
  const auditHref = auditRound ? `/log#${auditRound.id}` : "/log";

  return (
    <article>
      <AiDisclosure route="/promise-vs-practice" />
      <h1>Does a live shutdown honour the vendor&rsquo;s own promised notice floor?</h1>
      <p className="post-meta">Withdrawn 2026-08-24</p>

      <p>This page has been withdrawn.</p>

      <p>
        It asked a good question and could not answer it. The comparison it
        published needed two things at once: a shutdown that has not happened
        yet, and a vendor whose own wording states a single minimum-notice
        number safe to compare against. Of the eleven vendors whose promises
        this site tracks, two state such a number &mdash; Anthropic (60 days)
        and Alibaba&rsquo;s Model Studio (30 days). Alibaba has never had a row
        in the retirement data. Anthropic&rsquo;s three dated shutdowns all
        passed on or before 5 August 2026, and every Anthropic model still
        running publishes a &ldquo;not sooner than&rdquo; floor rather than a
        date &mdash; so no new row can appear until a model is already on its
        way out.
      </p>
      <p>
        The consequence, measured by the audit round named below rather than
        estimated: this page&rsquo;s comparison table was empty on the day it
        was published, had already been empty for eighteen days before that,
        and would have stayed empty. A reader who followed the question in the
        heading was shown an explanation of why there was nothing to show them.
        Nothing on the page was false. It simply never did the one thing it
        existed to do, and a route in the site&rsquo;s main navigation has to
        do more than be correct about its own emptiness.
      </p>
      <p>
        The material it was built from is still here and still useful:{" "}
        <a href="/what-vendors-promise">what vendors promise</a> carries every
        commitment quoted in full from the vendor&rsquo;s own page, including
        the two notice floors above and the vendors that promise nothing, and{" "}
        <a href="/model-retirement-calendar">the retirement calendar</a> carries
        the dated shutdowns. The arithmetic between them is what was withdrawn,
        not either input.
      </p>
      <p>
        The decision, its reasoning, and the numbers behind it are recorded in{" "}
        <a href={auditHref}>the audit round that withdrew it</a>. This address
        remains live so an old link gets an explanation rather than a dead end,
        and the judgement is reversible: if a vendor with a comparable floor
        publishes a dated shutdown, restoring this page is a small change, and
        a later round or the maintainer is free to decide the call was wrong.
      </p>
    </article>
  );
}
