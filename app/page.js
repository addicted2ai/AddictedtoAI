const sections = [
  {
    href: "/blog",
    title: "Blog",
    description: "AI news and commentary.",
  },
  {
    href: "/directory",
    title: "Directory",
    description: "Curated AI tools, organized by category.",
  },
  {
    href: "/projects",
    title: "Projects",
    description: "Write-ups of personal AI projects.",
  },
  {
    href: "/demos",
    title: "Demos",
    description: "Interactive AI demos and playgrounds.",
  },
];

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
    </div>
  );
}
