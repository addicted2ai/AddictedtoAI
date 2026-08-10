"use client";

import { useEffect, useState } from "react";
import { toolCategories } from "../lib/tool-categories";

function matches(tool, categoryName, query) {
  const haystack =
    `${tool.name} ${tool.description} ${categoryName}`.toLowerCase();
  return haystack.includes(query);
}

function countLabel(count) {
  if (count === 0) return "No tools match";
  if (count === 1) return "1 tool matches";
  return `${count} tools match`;
}

export default function DirectorySearch() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = normalizedQuery
    ? toolCategories
        .map((category) => ({
          ...category,
          tools: category.tools.filter((tool) =>
            matches(tool, category.name, normalizedQuery)
          ),
        }))
        .filter((category) => category.tools.length > 0)
    : toolCategories;

  const matchCount = filteredCategories.reduce(
    (total, category) => total + category.tools.length,
    0
  );

  const summary = normalizedQuery
    ? `${countLabel(matchCount)} “${query.trim()}”.`
    : "";

  // The visible count updates on every keystroke, but announcing on
  // every keystroke means a screen reader talking over someone who is
  // still typing. Announce once they've paused instead.
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(summary), 500);
    return () => clearTimeout(timer);
  }, [summary]);

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

      {/* Sighted readers get the count immediately. aria-hidden so it
          isn't announced twice -- the live region below owns that. */}
      <p className="directory-result-count" aria-hidden="true">
        {summary}
      </p>

      {/* Always rendered, even when empty: a live region has to be in the
          DOM before its text changes for assistive tech to announce it. */}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>

      {filteredCategories.length === 0 ? (
        <div className="directory-no-results">
          <button
            type="button"
            className="finder-restart"
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </div>
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
