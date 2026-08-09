"use client";

import { useState } from "react";
import { toolCategories } from "../lib/tool-categories";

function ToolFinder() {
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

export default function Demos() {
  return (
    <div>
      <h1>Demos</h1>
      <p>Interactive AI demos and playgrounds.</p>
      <div className="finder">
        <h2>Tool Finder</h2>
        <p className="finder-intro">
          Answer one question, get a couple of AI tools worth trying.
        </p>
        <ToolFinder />
      </div>
    </div>
  );
}
