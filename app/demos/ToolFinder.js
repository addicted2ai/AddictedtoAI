"use client";

import { useState } from "react";
import { toolCategories } from "../lib/tool-categories";

export default function ToolFinder() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const category = toolCategories.find((c) => c.name === selected);
    return (
      <div className="finder-result">
        <p className="finder-result-label">
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
          onClick={() => setSelected(null)}
        >
          Try another category
        </button>
      </div>
    );
  }

  return (
    <div className="finder-questions">
      <p>What are you trying to do?</p>
      <div className="finder-options">
        {toolCategories.map((category) => (
          <button
            key={category.name}
            type="button"
            className="finder-option"
            onClick={() => setSelected(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
