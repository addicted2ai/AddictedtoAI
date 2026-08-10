import fs from "fs";
import path from "path";

// The blog describes the guardrail thresholds every pull request has to
// clear. It used to state them as prose — "accessibility and SEO at or
// above 0.85, performance at or above 0.80, each scored against the
// median of three runs" — which is a hand-maintained copy of
// lighthouserc.json sitting one directory away from the real thing.
// Nothing would have caught the two drifting apart except a reader
// checking, and the standing rule here is that a stated fact is either
// derived at build time or can't drift.
//
// So the numbers come from the config the CI job actually runs.

const LABELS = {
  performance: "performance",
  accessibility: "accessibility",
  seo: "SEO",
  "best-practices": "best practices",
};

let cached;

export function getGuardrails() {
  if (cached) return cached;

  const file = path.join(process.cwd(), "lighthouserc.json");
  const config = JSON.parse(fs.readFileSync(file, "utf8"));
  const assertions = config.ci.assert.assertions || {};

  const categories = [];
  for (const [key, value] of Object.entries(assertions)) {
    const match = key.match(/^categories:(.+)$/);
    if (!match) continue;
    const [level, options = {}] = Array.isArray(value) ? value : [value, {}];
    categories.push({
      id: match[1],
      label: LABELS[match[1]] || match[1],
      level, // "error" blocks the merge; "warn" is advisory
      minScore: options.minScore,
      aggregationMethod: options.aggregationMethod,
    });
  }

  // Page-weight budgets, if any are configured. Same reasoning: the
  // number a visitor reads should be the number CI enforces.
  const budgets = [];
  for (const [key, value] of Object.entries(assertions)) {
    const match = key.match(/^resource-summary:(.+):size$/);
    if (!match) continue;
    const [level, options = {}] = Array.isArray(value) ? value : [value, {}];
    budgets.push({
      id: match[1],
      level,
      maxBytes: options.maxNumericValue,
    });
  }

  const blocking = categories.filter((c) => c.level === "error");
  // Every blocking category currently aggregates the same way. If one
  // ever doesn't, say so rather than quietly reporting the first.
  const methods = [...new Set(blocking.map((c) => c.aggregationMethod))];

  cached = {
    runs: config.ci.collect?.numberOfRuns ?? 1,
    aggregation: methods.length === 1 ? methods[0] : "aggregate",
    blocking,
    advisory: categories.filter((c) => c.level !== "error"),
    budgets,
  };
  return cached;
}

// "performance 0.80, accessibility 0.85 and SEO 0.85" — built from the
// config rather than written out, so adding or retuning a category
// changes the sentence.
export function describeThresholds(categories) {
  const parts = categories.map((c) => `${c.label} ${c.minScore.toFixed(2)}`);
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
