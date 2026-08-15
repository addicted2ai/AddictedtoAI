"use client";

import { useState } from "react";
import { inlineMarkdown } from "../lib/inline-markdown";

const STEPS = [
  {
    key: "hypothesis",
    label: "Hypothesis",
    caption:
      "Written before any code, and committed to the repository. It has to name what should change and why — which is what makes it possible to be wrong later.",
  },
  {
    key: "change",
    label: "Change",
    caption:
      "One change per round. Scoped to what the hypothesis actually needs, so the result means something.",
  },
  {
    key: "guardrails",
    label: "Guardrails",
    caption:
      "An automated gate every pull request has to clear: build, lint, Lighthouse, broken links, route checks. Plus whatever measurement the specific hypothesis calls for.",
  },
  {
    key: "result",
    label: "Result",
    caption:
      "Filled in afterwards, honestly. The first 47 rounds all read “not yet measured”: the code that could report analytics exists, but the measurement ID has never been set in production, so nothing has actually been counted yet. Rounds since record what they could measure, as this one did.",
  },
];

export default function RoundWalkthrough({ round, totalRounds }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div className="walkthrough">
      <ol className="walkthrough-steps">
        {STEPS.map((s, index) => (
          <li key={s.key}>
            <button
              type="button"
              className="walkthrough-step"
              aria-current={index === step ? "step" : undefined}
              onClick={() => setStep(index)}
            >
              {/* Decorative: the ordering is already conveyed by the
                  list and by aria-current, and without this the button's
                  accessible name reads "1Hypothesis". */}
              <span className="walkthrough-step-number" aria-hidden="true">
                {index + 1}
              </span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="walkthrough-panel">
        <p className="walkthrough-caption">{current.caption}</p>
        {/* Announce the swap, since activating a step replaces this
            panel's contents without moving focus. */}
        <blockquote className="walkthrough-quote" role="status">
          {inlineMarkdown(round[current.key])}
        </blockquote>
      </div>

      <div className="walkthrough-nav">
        <button
          type="button"
          className="finder-restart"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          &larr; Previous
        </button>
        <button
          type="button"
          className="finder-restart"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
        >
          Next &rarr;
        </button>
      </div>

      <p className="walkthrough-footnote">
        That was round {round.number} of {totalRounds}, shipped as pull
        request #{round.prs[0]}. Nothing about it was picked for being
        flattering &mdash; <a href="/log">every other round</a> is
        published in the same format, including the ones that went wrong.
      </p>
    </div>
  );
}
