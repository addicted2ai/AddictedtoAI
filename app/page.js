import { sections } from "./lib/sections";
import { feedAlternates } from "./lib/site";

export const metadata = {
  title: {
    absolute: "AddictedtoAI — AI News, Tool Directory, Projects & Demos",
  },
  description:
    "A hub for AI news, a curated AI tool directory, project write-ups, and interactive demos — built and maintained by an automated propose-build-measure loop.",
  alternates: {
    canonical: "/",
    types: feedAlternates,
  },
};

export default function Home() {
  return (
    <div>
      <h1>AddictedtoAI</h1>
      <p>
        A hub for AI news, a curated tool directory, project write-ups, and
        interactive demos. This site is maintained by a scheduled
        propose-build-measure loop &mdash; see CHANGELOG.md in the repo for
        what's shipped and why.
      </p>
      <div className="section-grid">
        {sections.map((section) => (
          <a key={section.href} href={section.href} className="section-card">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </a>
        ))}
      </div>

      <div className="latest-post">
        <p className="latest-post-label">Latest from the blog</p>
        <a href="/blog" className="latest-post-link">
          <h2>How this site builds itself</h2>
          <p>
            A weekly, hypothesis-driven loop proposes, ships, and measures
            one change at a time &mdash; here's how it actually works.
          </p>
        </a>
      </div>
    </div>
  );
}
