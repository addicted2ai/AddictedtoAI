"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RETIREMENT_DATES } from "../lib/retirement-dates";
import { findMatches, classifyMatches } from "../lib/model-deprecation-checker";

// NO ANALYTICS IN THIS COMPONENT, DELIBERATELY. It used to call trackEvent
// twice -- once with match_count / retired_count / retiring_count when a
// paste resolved, once when the example button was used. Neither ever sent
// the pasted text, so "matching happens in your browser" was true; but this
// component and its page both promise "nothing sent anywhere", and on
// 2026-08-23 a measurement ID was configured in production, which would
// have made those two calls the first thing this tool ever sent about a
// visitor's paste. Three integers are not worth breaking the one promise
// that makes this tool safe to paste an .env into. Site-wide pageview
// analytics is unaffected and is disclosed at /disclosure; the other two
// interactive demos (app/directory/DirectorySearch.js,
// app/demos/ToolFinder.js) still send interaction events and make no such
// promise. Do not re-add trackEvent here without first removing the
// promise from BOTH this file and app/model-deprecation-checker/page.js --
// scripts/check-governance-claims.mjs fails the build if the promise is
// still standing when this import comes back.

// A sample paste with one already-retired identifier (gpt-5-chat-latest,
// shutdown 2026-07-23), one retiring identifier matched via its
// parenthetical alias rather than its dated primary form — gpt-3.5-turbo is
// the alias of gpt-3.5-turbo-0125, and the alias is the form people
// actually paste — and one string that is nowhere in the data, so a
// first-time visitor sees all three outcomes without hunting for their own
// config first.
const EXAMPLE = `{
  "chat_model": "gpt-5-chat-latest",
  "legacy_model": "gpt-3.5-turbo",
  "embeddings_model": "text-embedding-3-large"
}`;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function resultRow(match) {
  const { row, matchedAs } = match;
  const past = row.shutdown < today();
  return (
    <tr key={`${row.vendor}-${row.what}`}>
      <td>
        <code>{matchedAs}</code>
        {matchedAs !== row.what ? (
          <span className="commitment-more"> (alias of {row.what})</span>
        ) : null}
      </td>
      <td>{row.vendor}</td>
      <td>
        <time dateTime={row.shutdown}>{row.shutdown}</time>
        {past ? <span className="retirement-past"> past</span> : null}
      </td>
      <td>
        {row.replacement ? (
          <code>{row.replacement}</code>
        ) : (
          <span className="commitment-more">none named</span>
        )}
      </td>
      <td>
        <a href={row.href}>vendor source</a>
      </td>
    </tr>
  );
}

export default function ModelDeprecationChecker() {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const [announcement, setAnnouncement] = useState("");

  const matches = useMemo(() => findMatches(text, RETIREMENT_DATES), [text]);
  const { retired, retiring } = useMemo(
    () => classifyMatches(matches, today()),
    [matches]
  );
  const hasText = text.trim().length > 0;

  // Announce once typing pauses, not on every keystroke — the same pattern
  // as the Directory search, so a screen reader is not talked over while
  // someone is still pasting.
  useEffect(() => {
    const timer = setTimeout(() => {
      const summary = !hasText
        ? ""
        : matches.length === 0
        ? "No identifiers in the retirement data found in what you pasted."
        : `Found ${matches.length} identifier${matches.length === 1 ? "" : "s"} in the retirement data: ${retired.length} retired, ${retiring.length} retiring.`;
      setAnnouncement(summary);
    }, 500);
    return () => clearTimeout(timer);
  }, [text, hasText, matches.length, retired.length, retiring.length]);

  function useExample() {
    setText(EXAMPLE);
    textareaRef.current?.focus();
  }

  function clear() {
    setText("");
    textareaRef.current?.focus();
  }

  return (
    <div className="checker">
      <label htmlFor="checker-input" className="checker-label">
        Paste a config, a <code>package.json</code>, an <code>.env</code>,
        code, or a plain list of model IDs
      </label>
      <textarea
        id="checker-input"
        ref={textareaRef}
        className="checker-input"
        rows={10}
        spellCheck="false"
        placeholder={EXAMPLE}
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-describedby="checker-status"
      />
      <div className="checker-controls">
        <button type="button" className="finder-restart" onClick={useExample}>
          Paste an example
        </button>
        {hasText ? (
          <button type="button" className="finder-restart" onClick={clear}>
            Clear
          </button>
        ) : null}
      </div>

      {/* Always rendered, even when empty, so assistive tech has the node in
          the DOM before its text changes. */}
      <p
        id="checker-status"
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>

      {!hasText ? (
        <p className="checker-hint">
          Nothing you paste is sent anywhere, and this tool reports nothing
          about it — not even how many matches it found. Matching happens in
          your browser against the {RETIREMENT_DATES.length} rows behind{" "}
          <a href="/model-retirement-calendar">the retirement calendar</a>.
          The site does count page views; that and everything else it
          collects is on <a href="/disclosure">the disclosure page</a>.
          Paste something above, or try the example.
        </p>
      ) : matches.length === 0 ? (
        <p className="checker-hint" role="status">
          No identifiers from the retirement data found in what you pasted.
          That means either everything you referenced is fine, or it is not
          one of the {RETIREMENT_DATES.length} OpenAI and Anthropic
          identifiers this checker knows about — see{" "}
          <a href="/model-retirement-calendar">the full calendar</a>.
        </p>
      ) : (
        <div className="checker-results">
          {retired.length > 0 ? (
            <section aria-labelledby="checker-retired-label">
              <h2 id="checker-retired-label" className="checker-section-label">
                Retired — already shut down ({retired.length})
              </h2>
              <table className="charter-table">
                <thead>
                  <tr>
                    <th scope="col">Found in your paste</th>
                    <th scope="col">Vendor</th>
                    <th scope="col">Shutdown</th>
                    <th scope="col">Replacement</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>{retired.map(resultRow)}</tbody>
              </table>
            </section>
          ) : null}
          {retiring.length > 0 ? (
            <section aria-labelledby="checker-retiring-label">
              <h2 id="checker-retiring-label" className="checker-section-label">
                Retiring — not yet shut down ({retiring.length})
              </h2>
              <table className="charter-table">
                <thead>
                  <tr>
                    <th scope="col">Found in your paste</th>
                    <th scope="col">Vendor</th>
                    <th scope="col">Shutdown</th>
                    <th scope="col">Replacement</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>{retiring.map(resultRow)}</tbody>
              </table>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
