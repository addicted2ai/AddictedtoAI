import { getBuildLog } from "../lib/build-log";
import { feedAlternates } from "../lib/site";
import AiDisclosure from "../components/AiDisclosure";

// Withdrawn by round 186 (audit) under CHARTER.md rule 9: retraction, not
// erasure. Same shape as /projects and /promise-vs-practice.
//
// app/lib/model-migration-chains.js, ModelMigrationChains.js and
// scripts/check-model-migration-chains.mjs are deliberately kept. The walker
// is correct — the finding was about how many readers it can help, not about
// whether it walks correctly — so restoring the page if the data ever grows
// multi-hop live chains is a small change rather than a rebuild.

export const metadata = {
  title: "Model migration chains (withdrawn)",
  description:
    "This chain walker was withdrawn by an audit round after it was found that every multi-hop chain in the data belongs to a model that was already switched off.",
  alternates: {
    canonical: "/model-migration-chains",
    types: feedAlternates,
  },
};

export default function ModelMigrationChainsPage() {
  const auditRound = getBuildLog().find((round) =>
    round.changes.some(
      (change) => change.title === "Withdraw the migration-chain walker"
    )
  );
  // From the entry's `id`, not `"round-" + number` — see the note in
  // app/promise-vs-practice/page.js for why /projects' older construction is
  // fragile.
  const auditHref = auditRound ? `/log#${auditRound.id}` : "/log";

  return (
    <article>
      <AiDisclosure route="/model-migration-chains" />
      <h1>Model migration chains</h1>
      <p className="post-meta">Withdrawn 2026-08-24</p>

      <p>This page has been withdrawn.</p>

      <p>
        It existed to warn you about a specific trap: you migrate off a dying
        model onto the replacement the vendor names, and that replacement turns
        out to be dying too. The trap is real. It is also, in the data this
        site actually holds, almost empty. Walking all 77 dated rows this
        round found four whose replacement chain goes past a single hop &mdash;
        and all four (<code>gpt-4o-mini-realtime-preview</code>,{" "}
        <code>gpt-4o-mini-audio-preview</code>, <code>dall-e-2</code> and{" "}
        <code>dall-e-3</code>) were switched off in May 2026. Sixty-four rows
        land on a live model in one hop; nine name no replacement at all.
      </p>
      <p>
        So for every model a reader could still be running, the thing this page
        taught them to check could not happen to them. Its own three worked
        examples made the point without meaning to: two of the three were
        models that had stopped working three months earlier, and the third
        demonstrated the parser rather than the risk.
      </p>
      <p>
        Where the fact belongs, if it recurs, is the calendar itself &mdash; a
        mark on the &ldquo;Replacement&rdquo; column of any row whose named
        replacement is itself dated, seen by every reader of that table without
        a second address to visit. That is filed as work for a later round
        rather than done here.
      </p>
      <p>
        The data is unchanged and still available:{" "}
        <a href="/model-retirement-calendar">the retirement calendar</a> lists
        every dated shutdown with its named replacement, and{" "}
        <a href="/model-deprecation-checker">the deprecation checker</a> takes
        a config, a <code>package.json</code> or a code snippet and tells you
        which of your own identifiers are on it.
      </p>
      <p>
        The decision, its reasoning, and the counts behind it are recorded in{" "}
        <a href={auditHref}>the audit round that withdrew it</a>. This address
        remains live so an old link gets an explanation rather than a dead end,
        and the judgement is reversible: if the data grows live chains that
        actually branch, a later round or the maintainer can restore the page
        and say this call was wrong.
      </p>
    </article>
  );
}
