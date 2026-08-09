import { toolCategories } from "../lib/tool-categories";

export default function Directory() {
  return (
    <div>
      <h1>Directory</h1>
      <p>Curated AI tools, organized by category.</p>
      {toolCategories.map((category) => (
        <section key={category.name} className="tool-category">
          <h2>{category.name}</h2>
          <div className="tool-grid">
            {category.tools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="tool-card"
              >
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
