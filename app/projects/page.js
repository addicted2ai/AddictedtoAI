import { feedAlternates } from "../lib/site";

export const metadata = {
  title: "Projects",
  description:
    "The flagship project is this website: a live demonstration of what a current AI model does when handed a continual-improvement loop, a set of guardrails, and a charter it cannot amend.",
  alternates: {
    canonical: "/projects",
    types: feedAlternates,
  },
};

export default function Projects() {
  return (
    <div>
      <h1>Projects</h1>
      <p>Write-ups of personal AI projects.</p>

      <article>
        <h2>AddictedtoAI.net</h2>
        <p className="post-meta">
          A hub site that maintains itself &mdash; blog, directory,
          projects, demos
        </p>

        <p>
          This site is the project, and the project is an experiment:
          hand a current AI model a live website, a set of automated
          guardrails, a charter it cannot amend, and a direction
          &mdash; build something worth visiting, one change at a time,
          and write down what you expected to happen &mdash; then see
          what it actually does over dozens of rounds.
        </p>
        <p>
          The experiment is not that a human is absent. A human set the
          direction, wrote the charter, and still starts most runs. It
          is that everything on the site was made by a model inside
          those constraints, and that the record says, round by round,
          how much a person saw before it landed.
        </p>

        <h3>The idea</h3>
        <p>
          The usual demonstration of an AI model is a transcript: a
          clever answer to a question someone chose. This is the
          harder version. The work is continuous rather than one-shot,
          nobody curates which attempts get shown, the output has to
          survive an automated quality gate before it ships, and every
          hypothesis is committed to in writing <em>before</em> the
          result is known. You can read all of it on the{" "}
          <a href="/log">build log</a>, including the rounds that were
          wrong.
        </p>
        <p>
          That last part is the point. Anyone can publish the wins. A
          record that includes a check which passed while silently
          measuring the wrong build, two changes dropped after
          measurement showed there was nothing to fix, and a
          prediction about performance that turned out to be plain
          wrong, is a record you can actually judge.
        </p>

        <h3>How it works</h3>
        <p>
          The short version: a scheduled job reads the site&rsquo;s
          changelog for its north-star metric and guardrails, proposes
          one small testable change with a stated hypothesis,
          implements it, and opens a pull request for review. The
          full mechanics &mdash; the guardrails, what&rsquo;s shipped so
          far, why it&rsquo;s built this way &mdash; are written up on the{" "}
          <a href="/blog">blog</a>.
        </p>

        <h3>Stack</h3>
        <p>
          Next.js (App Router), plain CSS with no framework, deployed
          on Vercel. GitHub Actions runs the weekly loop and the
          per-PR guardrail checks &mdash; Lighthouse CI for
          performance/accessibility/SEO and a broken-link check
          against the live build. Claude Code drives the propose,
          implement, and pull-request step each round.
        </p>

        <div className="project-actions">
          <a href="mailto:AddictedtoAI@proton.me" className="project-action">
            Get in touch
          </a>
          <a
            href="https://github.com/addicted2ai"
            target="_blank"
            rel="noopener noreferrer"
            className="project-action"
          >
            GitHub profile
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      </article>
    </div>
  );
}
