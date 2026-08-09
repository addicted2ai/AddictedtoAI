"use client";

import { useState } from "react";
import { toolCategories } from "../lib/tool-categories";

function matches(tool, query) {
  const haystack = `${tool.name} ${tool.description}`.toLowerCase();
  return haystack.includes(query);
}

export default function DirectorySearch() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = normalizedQuery
    ? toolCategories
        .map((category) => ({
          ...category,
          tools: category.tools.filter((tool) => matches(tool, normalizedQuery)),
        }))
        .filter((category) => category.tools.length > 0)
    : toolCategories;

  return (
    <>
      <input
        type="search"
        className="directory-search"
        placeholder="Search tools by name or category..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search tools"
      />

      {filteredCategories.length === 0 ? (
        <p className="directory-no-results">
          No tools match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        filteredCategories.map((category) => (
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
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
