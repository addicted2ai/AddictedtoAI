"use client";

import { useEffect, useRef, useState } from "react";
import { toolCategories } from "../lib/tool-categories";
import { trackEvent } from "../lib/analytics";

export default function ToolFinder() {
  const [selected, setSelected] = useState(null);
  const resultRef = useRef(null);
  const questionRef = useRef(null);
  // Only move focus in response to a choice the visitor actually made,
  // never on first paint.
  const hasChosen = useRef(false);

  useEffect(() => {
    if (!hasChosen.current) return;
    const target = selected ? resultRef.current : questionRef.current;
    target?.focus();
  }, [selected]);

  function choose(name) {
    hasChosen.current = true;
    if (name) {
      trackEvent("tool_finder_complete", { category: name });
    } else {
      trackEvent("tool_finder_restart");
    }
    setSelected(name);
  }

  if (selected) {
    const category = toolCategories.find((c) => c.name === selected);
    return (
      <div className="finder-result">
        <p className="finder-result-label" ref={resultRef} tabIndex={-1}>
          For {category.name.toLowerCase()}, try:
        </p>
        <div className="tool-grid">
          {category.tools.slice(0, 2).map((tool) => (
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
        <p className="finder-more-link">
          <a href="/directory">See all {category.name} tools in the Directory &rarr;</a>
        </p>
        <button
          type="button"
          className="finder-restart"
          onClick={() => choose(null)}
        >
          Try another category
        </button>
      </div>
    );
  }

  return (
    <div className="finder-questions">
      <p ref={questionRef} tabIndex={-1}>
        What are you trying to do?
      </p>
      <div className="finder-options">
        {toolCategories.map((category) => (
          <button
            key={category.name}
            type="button"
            className="finder-option"
            onClick={() => choose(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
