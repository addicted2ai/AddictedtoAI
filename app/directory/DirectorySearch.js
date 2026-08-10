"use client";

import { useEffect, useRef, useState } from "react";
import { toolCategories } from "../lib/tool-categories";
import { trackEvent } from "../lib/analytics";

function matches(tool, categoryName, query) {
  const haystack =
    `${tool.name} ${tool.description} ${categoryName}`.toLowerCase();
  return haystack.includes(query);
}

function queryFromUrl() {
  return (
    new URLSearchParams(window.location.search).get("q") || ""
  ).trim();
}

function countLabel(count) {
  if (count === 0) return "No tools match";
  if (count === 1) return "1 tool matches";
  return `${count} tools match`;
}

export default function DirectorySearch() {
  // Null means the client has not adopted the URL yet. Rendering an empty
  // value first keeps the server HTML and the first client render identical;
  // the mount effect then adopts ?q= without a hydration mismatch.
  const [query, setQuery] = useState(null);
  const inputRef = useRef(null);
  const currentQuery = query ?? "";
  const normalizedQuery = currentQuery.trim().toLowerCase();

  useEffect(() => {
    const adoptQuery = () => setQuery(queryFromUrl());
    adoptQuery();
    window.addEventListener("popstate", adoptQuery);
    return () => window.removeEventListener("popstate", adoptQuery);
  }, []);

  // A directory search is a view control, so replace the current URL rather
  // than adding a browser-history entry for every keystroke. This makes a
  // useful filtered directory shareable, just like the build-log search.
  useEffect(() => {
    if (query === null) return;
    const params = new URLSearchParams(window.location.search);
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}${
        window.location.hash
      }`
    );
  }, [query]);

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

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  // The visible count updates on every keystroke, but announcing on
  // every keystroke means a screen reader talking over someone who is
  // still typing. Announce once they've paused instead.
  const [announcement, setAnnouncement] = useState("");
  const lastTrackedQuery = useRef("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncement(summary);
      if (
        normalizedQuery !== lastTrackedQuery.current &&
        normalizedQuery
      ) {
        trackEvent("directory_search", {
          search_term: normalizedQuery,
          result_count: matchCount,
        });
      }
      lastTrackedQuery.current = normalizedQuery;
    }, 500);
    return () => clearTimeout(timer);
  }, [matchCount, normalizedQuery, summary]);

  return (
    <>
      <form
        className="search-control"
        role="search"
        aria-label="Search the tool directory"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          ref={inputRef}
          type="search"
          className="directory-search"
          placeholder="Search tools by name or category..."
          value={currentQuery}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search tools"
          aria-controls="directory-results"
          aria-describedby="directory-search-status"
        />
        {currentQuery ? (
          <button
            type="button"
            className="search-clear"
            onClick={clearSearch}
          >
            Clear
          </button>
        ) : null}
      </form>

      {/* Sighted readers get the count immediately. aria-hidden so it
          isn't announced twice -- the live region below owns that. */}
      <p className="directory-result-count" aria-hidden="true">
        {summary}
      </p>

      {/* Always rendered, even when empty: a live region has to be in the
          DOM before its text changes for assistive tech to announce it. */}
      <p
        id="directory-search-status"
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>

      <section
        id="directory-results"
        aria-labelledby="directory-results-label"
      >
        <h2 id="directory-results-label" className="visually-hidden">
          Directory results
        </h2>
        {filteredCategories.map((category) => (
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
                  onClick={() =>
                    trackEvent("directory_tool_click", {
                      tool_name: tool.name,
                      category: category.name,
                    })
                  }
                >
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </section>
    </>
  );
}
