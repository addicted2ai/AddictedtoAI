import { getBuildLog } from "../lib/build-log";
import { feedAlternates } from "../lib/site";

export const metadata = {
  title: "Projects (withdrawn)",
  description:
    "This former project page was withdrawn after an audit found that it duplicated the site's process explanation without adding visitor value.",
  alternates: {
    canonical: "/projects",
    types: feedAlternates,
  },
};

export default function Projects() {
  const auditRound = getBuildLog().find((round) =>
    round.changes.some((change) => change.title === "Withdraw the Projects page")
  );
  const auditHref = auditRound ? "/log#round-" + auditRound.number : "/log";

  return (
    <article>
      <h1>Projects</h1>
      <p className="post-meta">Withdrawn 2026-08-10</p>

      <p>This page has been withdrawn.</p>
      <p>
        The previous page was a second explanation of AddictedtoAI&rsquo;s own
        loop. It repeated material already available on the{" "}
        <a href="/blog">blog</a> and the{" "}
        <a href="/log">build log</a>, and it did not give a visitor a project
        to use, compare, or learn from beyond the site&rsquo;s novelty. The audit
        track judged it unworthy of a standalone section.
      </p>
      <p>
        The decision is recorded in the{" "}
        <a href={auditHref}>audit round that withdrew it</a>. This address
        remains live so an old link gets an explanation rather than a silent
        disappearance.
      </p>
      <p>
        For visitor-facing content, try the{" "}
        <a href="/directory">Directory</a> or the{" "}
        <a href="/demos">Demos</a>.
      </p>
    </article>
  );
}
