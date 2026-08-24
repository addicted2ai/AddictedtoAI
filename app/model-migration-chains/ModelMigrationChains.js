"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RETIREMENT_DATES } from "../lib/retirement-dates";
import { buildIndex } from "../lib/model-deprecation-checker";
import { walkChain, flattenChain } from "../lib/model-migration-chains";

// NO ANALYTICS IN THIS COMPONENT, for the same reason
// app/model-deprecation-checker/ModelDeprecationChecker.js gives in its own
// header: this tool's whole pitch is "type an identifier and nothing about
// it leaves your browser." Site-wide pageview analytics still applies to
// this page like any other — see /disclosure.

// Three quick picks, chosen to show the three shapes a chain actually takes
// in the live data (docket/open/2026-08-22-model-migration-chains.md's own
// Evidence section): a two-hop chain that lands clean, a multi-option
// replacement whose branches land differently, and a replacement carrying a
// parenthetical qualifier rather than a bare identifier.
const EXAMPLES = [
  { id: "gpt-4o-mini-realtime-preview", label: "Two-hop chain" },
  { id: "dall-e-2", label: "Three-option branch" },
  { id: "o1-pro-2025-03-19", label: "Qualifier in the replacement" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function shutdownLabel(row) {
  const past = row.shutdown < today();
  return (
    <>
      <time dateTime={row.shutdown}>{row.shutdown}</time>
      {past ? <span className="retirement-past"> past</span> : null}
    </>
  );
}

// One hop in one branch's rendered list. `node` is what walkChain() produced
// for this step; `isTerminal` says whether this is the branch's final
// landing point (requirement 1) or an interior hop that itself dead-ends
// into another retirement (requirement 2 — shown with that row's own
// shutdown date and replacement, not collapsed to just the first hop).
// `qualifier` is only ever set on the first hop of a branch, the one a
// parsed replacement option can carry ("gpt-5.6-sol (reasoning.mode: pro)").
function HopItem({ node, isTerminal, qualifier }) {
  const qualifierNote = qualifier ? (
    <span className="commitment-more"> ({qualifier})</span>
  ) : null;

  if (!isTerminal) {
    return (
      <li className="chain-hop chain-hop-deadend">
        <code>{node.identifier}</code>
        {qualifierNote}
        {" — retiring "}
        {shutdownLabel(node.row)}, itself dead-ends in another retirement:
        replaces to <code>{node.row.replacement}</code>.
      </li>
    );
  }

  if (node.status === "live") {
    return (
      <li className="chain-hop chain-hop-landing">
        <code>{node.identifier}</code>
        {qualifierNote}
        {" — "}
        <strong>not in the retirement data.</strong> Absent, by construction
        of this data, means a live model or API. The chain ends here.
      </li>
    );
  }

  if (node.status === "no-replacement-named") {
    return (
      <li className="chain-hop chain-hop-landing">
        <code>{node.identifier}</code>
        {qualifierNote}
        {" — retiring "}
        {shutdownLabel(node.row)}, and the vendor names{" "}
        <strong>no replacement</strong>. The chain ends here with nothing
        further to follow.
      </li>
    );
  }

  // status === "cycle": the chain loops back on itself rather than landing
  // anywhere. Requirement 1's explicit "does not resolve" state.
  return (
    <li className="chain-hop chain-hop-landing chain-hop-cycle">
      <code>{node.identifier}</code> —{" "}
      <strong>this chain does not resolve.</strong> It loops back to an
      identifier already seen earlier on this path.
    </li>
  );
}

function Branch({ branch, showHeading }) {
  const { path, terminal, option } = branch;
  const firstHop = path[0];

  return (
    <div className="chain-branch">
      {showHeading ? (
        <h3 className="checker-section-label">
          Option: <code>{firstHop.identifier}</code>
          {option?.qualifier ? (
            <span className="commitment-more"> ({option.qualifier})</span>
          ) : null}
        </h3>
      ) : null}
      <ol className="chain-hops">
        {path.map((node, i) => (
          <HopItem
            key={`${node.identifier}-${i}`}
            node={node}
            isTerminal={node === terminal}
            qualifier={i === 0 ? option?.qualifier : null}
          />
        ))}
      </ol>
    </div>
  );
}

export default function ModelMigrationChains() {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const [announcement, setAnnouncement] = useState("");

  const suggestions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const entry of buildIndex(RETIREMENT_DATES)) {
      if (seen.has(entry.identifier)) continue;
      seen.add(entry.identifier);
      list.push(entry.identifier);
    }
    return list.sort((a, b) => a.localeCompare(b));
  }, []);

  const trimmed = text.trim();
  const hasText = trimmed.length > 0;

  const root = useMemo(
    () => (hasText ? walkChain(trimmed, RETIREMENT_DATES) : null),
    [trimmed, hasText]
  );

  // Each of root.hops is one parsed replacement option; flattenChain(hop.target)
  // walks everything that option leads to, branching further only if THAT
  // option is itself a multi-option row (not currently true anywhere in the
  // data, but the walker does not assume it never will be). The option
  // itself (identifier + qualifier) is attached to every branch it produced,
  // so the first hop can show the qualifier the row's own `replacement`
  // string carried.
  const branches = useMemo(() => {
    if (!root || root.status !== "retiring") return [];
    return root.hops.flatMap((hop) =>
      flattenChain(hop.target).map((b) => ({ ...b, option: hop.option }))
    );
  }, [root]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasText) {
        setAnnouncement("");
      } else if (root.status === "live") {
        setAnnouncement(`"${trimmed}" is not in the retirement data.`);
      } else if (root.status === "no-replacement-named") {
        setAnnouncement(`"${trimmed}" is retiring with no replacement named.`);
      } else {
        const deadEnds = branches.filter((b) => b.path.length > 1).length;
        setAnnouncement(
          `"${trimmed}" resolves to ${branches.length} branch${branches.length === 1 ? "" : "es"}, ${deadEnds} dead-ending into another retirement before landing.`
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [trimmed, hasText, root, branches]);

  function pickExample(id) {
    setText(id);
    inputRef.current?.focus();
  }

  function clear() {
    setText("");
    inputRef.current?.focus();
  }

  return (
    <div className="checker">
      <label htmlFor="chains-input" className="checker-label">
        Enter a model or API identifier
      </label>
      <input
        id="chains-input"
        ref={inputRef}
        className="checker-input"
        type="text"
        list="chains-suggestions"
        spellCheck="false"
        autoComplete="off"
        placeholder="e.g. dall-e-2"
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-describedby="chains-status"
      />
      <datalist id="chains-suggestions">
        {suggestions.map((id) => (
          <option key={id} value={id} />
        ))}
      </datalist>
      <div className="checker-controls">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            type="button"
            className="finder-restart"
            onClick={() => pickExample(example.id)}
          >
            {example.label}: <code>{example.id}</code>
          </button>
        ))}
        {hasText ? (
          <button type="button" className="finder-restart" onClick={clear}>
            Clear
          </button>
        ) : null}
      </div>

      <p
        id="chains-status"
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>

      {!hasText ? (
        <p className="checker-hint">
          Every field this needs — the identifier, its shutdown date, and its
          named replacement — is already in the {RETIREMENT_DATES.length}{" "}
          rows behind{" "}
          <a href="/model-retirement-calendar">the retirement calendar</a>.
          Resolution happens in your browser; nothing you type is sent
          anywhere. Type an identifier above, pick one from the list, or try
          an example.
        </p>
      ) : root.status === "live" ? (
        <p className="checker-hint" role="status">
          <code>{trimmed}</code> is not one of the {RETIREMENT_DATES.length}{" "}
          dated identifiers behind{" "}
          <a href="/model-retirement-calendar">the retirement calendar</a> —
          nothing to trace. That means either it is not retiring, or it is
          simply not one this site has verified yet.
        </p>
      ) : root.status === "no-replacement-named" ? (
        <p className="checker-hint" role="status">
          <code>{trimmed}</code> is retiring {shutdownLabel(root.row)}, and{" "}
          {root.row.vendor} names no replacement for it —{" "}
          <a href={root.row.href}>source</a>. There is no chain to follow;
          you would need to pick your own next step.
        </p>
      ) : (
        <div className="checker-results">
          <p className="checker-hint">
            <code>{trimmed}</code> is retiring {shutdownLabel(root.row)} (
            {root.row.vendor}, <a href={root.row.href}>source</a>) and names{" "}
            {branches.length === 1
              ? "one replacement"
              : `${branches.length} replacement options`}
            : <code>{root.row.replacement}</code>
          </p>
          {branches.map((branch, i) => (
            <Branch
              key={branch.path[0]?.identifier ?? i}
              branch={branch}
              showHeading={branches.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
