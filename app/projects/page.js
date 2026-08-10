import { feedAlternates } from "../lib/site";

export const metadata = {
  title: "Projects",
  description:
    "Write-ups of personal AI projects, starting with AddictedtoAI.net itself — a hub site maintained by an automated propose-build-measure loop.",
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
          This site is the project. Instead of redesigning it by hand,
          it&rsquo;s maintained by a scheduled, hypothesis-driven loop: pick
          one small change, ship it behind automated guardrails, and
          check the following week whether it actually moved the
          metric it was supposed to.
        </p>

        <h3>The idea</h3>
        <p>
          Most small sites either get redesigned in occasional bursts
          or slowly rot as a placeholder. This one is a test of a
          third option: can a site improve itself continuously, in
          small, measured steps, with a human only in the loop for
          review rather than every decision? This write-up is itself a
          product of that loop &mdash; the Projects section was a
          placeholder until this pass replaced it.
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
