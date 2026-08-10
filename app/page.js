import { sections } from "./lib/sections";
import { posts } from "./lib/posts";
import { feedAlternates } from "./lib/site";

const latestPost = posts[0];

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
        what&rsquo;s shipped and why.
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
        <a href={latestPost.path} className="latest-post-link">
          <h2>{latestPost.title}</h2>
          <p>{latestPost.excerpt}</p>
        </a>
      </div>
    </div>
  );
}
