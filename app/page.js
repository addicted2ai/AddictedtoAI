import { sections } from "./lib/sections";
import { posts } from "./lib/posts";
import { getBuildLogStats } from "./lib/build-log";
import { feedAlternates } from "./lib/site";

const latestPost = posts[0];

export const metadata = {
  title: {
    absolute: "AddictedtoAI — A Website That Builds Itself",
  },
  description:
    "A human wrote the first commit. Every change since has been proposed, built, measured and shipped by an AI model running a continual-improvement loop — with the full record, including the wrong guesses, published on the site.",
  alternates: {
    canonical: "/",
    types: feedAlternates,
  },
};

export default function Home() {
  const stats = getBuildLogStats();

  return (
    <div>
      <h1 className="hero-title">This site builds itself.</h1>

      <p className="hero-lead">
        A human wrote the first commit &mdash; a Next.js skeleton with four
        empty pages. Everything since has been proposed, built, measured
        and shipped by an AI model running a continual-improvement loop:
        pick one change, state up front what it should move and why, prove
        it against automated guardrails, then write down whether it
        actually worked.
      </p>

      <p className="hero-lead">
        The interesting part isn&rsquo;t that it works. It&rsquo;s that
        the entire record is public &mdash; including the rounds where the
        hypothesis turned out to be wrong, and the checks that had to be
        fixed because they were quietly measuring the wrong thing.
      </p>

      <dl className="log-stats">
        <div>
          <dt>Rounds shipped</dt>
          <dd>{stats.rounds}</dd>
        </div>
        <div>
          <dt>Distinct changes</dt>
          <dd>{stats.changes}</dd>
        </div>
        <div>
          <dt>Pull requests</dt>
          <dd>{stats.prs}</dd>
        </div>
        <div>
          <dt>Guardrail failures</dt>
          <dd>{stats.failed}</dd>
        </div>
      </dl>

      <p className="hero-cta-row">
        <a href="/log" className="hero-cta">
          Read every round &rarr;
        </a>
      </p>

      <h2 className="home-heading">What it has built</h2>
      <div className="section-grid">
        {sections.map((section) => (
          <a key={section.href} href={section.href} className="section-card">
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </a>
        ))}
      </div>

      <div className="latest-post">
        <h2 className="latest-post-label">Latest from the blog</h2>
        <a href={latestPost.path} className="latest-post-link">
          <h3>{latestPost.title}</h3>
          <p>{latestPost.excerpt}</p>
        </a>
      </div>
    </div>
  );
}
