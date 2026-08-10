"use client";

import { useEffect, useRef, useState } from "react";

// Preset queries rather than an editorial classification. The homepage
// promises that the record includes the rounds that went wrong; these
// are shortcuts to finding them. Deliberately *searches* rather than
// tagging entries "this one was a mistake" — a keyword heuristic over
// prose would mislabel rounds, and a site whose whole argument is
// "don't take our word for it" shouldn't be inventing labels.
const PRESETS = ["wrong", "dropped", "failed", "measured", "accessibility"];

function countLabel(count) {
  if (count === 0) return "No rounds mention";
  if (count === 1) return "1 round mentions";
  return `${count} rounds mention`;
}

export default function LogFilter({ total }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(total);
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef(null);

  // The 31 entries are server-rendered. Filtering them by toggling
  // `hidden` on the existing markup — rather than passing all of that
  // prose into a client component and re-rendering it — keeps the
  // parsed log out of the JavaScript payload entirely. Measured: the
  // alternative would have roughly doubled the page's transfer size.
  useEffect(() => {
    const normalised = query.trim().toLowerCase();
    let shown = 0;
    for (const el of document.querySelectorAll("[data-log-entry]")) {
      const match =
        !normalised || el.textContent.toLowerCase().includes(normalised);
      el.hidden = !match;
      if (match) shown += 1;
    }
    setMatches(shown);
  }, [query]);

  const summary = query.trim()
    ? `${countLabel(matches)} “${query.trim()}”.`
    : "";

  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(summary), 500);
    return () => clearTimeout(timer);
  }, [summary]);

  return (
    <div className="log-filter">
      <input
        ref={inputRef}
        type="search"
        className="directory-search"
        placeholder="Search all rounds — try “wrong”…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search the build log"
      />

      <div className="log-presets">
        <span className="log-presets-label">Jump to:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="log-preset"
            aria-pressed={query === preset}
            onClick={() => setQuery(query === preset ? "" : preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      <p className="directory-result-count" aria-hidden="true">
        {summary}
      </p>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>

      {matches === 0 ? (
        <div className="directory-no-results">
          <button
            type="button"
            className="finder-restart"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            Clear search
          </button>
        </div>
      ) : null}
    </div>
  );
}
