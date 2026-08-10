"use client";

import { useEffect, useRef, useState } from "react";

// Preset queries rather than an editorial classification. The homepage
// promises that the record includes the rounds that went wrong; these
// are shortcuts to finding them. Deliberately *searches* rather than
// tagging entries "this one was a mistake" — a keyword heuristic over
// prose would mislabel rounds, and a site whose whole argument is
// "don't take our word for it" shouldn't be inventing labels.
const PRESETS = ["wrong", "dropped", "failed", "measured", "accessibility"];

// Search should match the prose a visitor can read, not the text-only
// affordances supplied to assistive technology (for example, "copy link to
// this round" on every heading). Cache the cleaned text because the DOM is
// static while only the hidden attribute changes during filtering.
const visibleTextCache = new WeakMap();

function searchableText(element) {
  if (visibleTextCache.has(element)) return visibleTextCache.get(element);

  const copy = element.cloneNode(true);
  copy.querySelectorAll(".visually-hidden").forEach((node) => node.remove());
  const text = copy.textContent.toLowerCase();
  visibleTextCache.set(element, text);
  return text;
}

function countLabel(count) {
  if (count === 0) return "No rounds mention";
  if (count === 1) return "1 round mentions";
  return `${count} rounds mention`;
}

// The entries are server-rendered. Filtering them by toggling `hidden`
// on the existing markup — rather than passing all of that prose into a
// client component and re-rendering it — keeps the parsed log out of the
// JavaScript payload entirely. Measured: the alternative would have
// roughly doubled the page's transfer size.
function applyFilter(query) {
  const normalised = query.trim().toLowerCase();
  let shown = 0;
  for (const el of document.querySelectorAll("[data-log-entry]")) {
    const match = !normalised || searchableText(el).includes(normalised);
    el.hidden = !match;
    if (match) shown += 1;
  }
  return shown;
}

// `replaceState`, not `pushState`: the search is a view control, not a
// navigation. Pushing would put one history entry per keystroke between
// the visitor and wherever they came from. The trade-off is that Back
// leaves the page rather than clearing the search, which is the lesser
// of the two.
function writeUrl(query) {
  const params = new URLSearchParams(window.location.search);
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);
  else params.delete("q");
  const search = params.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${
    window.location.hash
  }`;
  window.history.replaceState(null, "", url);
}

export default function LogFilter({ total }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(total);
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef(null);
  const firstRun = useRef(true);
  // Mirrors `query` for the hashchange listener, which is registered
  // once and would otherwise only ever see the mount-time value.
  const queryRef = useRef("");

  // Adopt `?q=` from the URL on mount, filter immediately, then honour
  // any `#round-N`. This runs the first filter pass itself rather than
  // leaving it to the effect below, because the browser has already
  // scrolled to the hash by now — against the *unfiltered* page — and
  // hiding entries afterwards would leave that scroll pointing at the
  // wrong round.
  //
  // Not read during render: the page is statically generated, so the
  // server has no query string, and initialising state from the URL
  // would be a hydration mismatch on the input's value.
  useEffect(() => {
    // A permalink outranks a search. If the URL points at a round the
    // active search would hide, the link is broken from the visitor's
    // side — so drop the search, not the round.
    const honourHash = () => {
      const id = window.location.hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      const current = queryRef.current;
      if (
        current &&
        !searchableText(target).includes(current.toLowerCase())
      ) {
        queryRef.current = "";
        setQuery("");
        setMatches(applyFilter(""));
        writeUrl("");
      }
      target.scrollIntoView();
    };

    const adoptUrl = () => {
      const initial = (
        new URLSearchParams(window.location.search).get("q") || ""
      ).trim();
      queryRef.current = initial;
      setQuery(initial);
      setMatches(applyFilter(initial));
      honourHash();
    };

    adoptUrl();

    // Changing only the hash is a same-document navigation: nothing
    // re-mounts, so without this a pasted `#round-N` on an already
    // filtered page silently scrolls to a hidden element.
    window.addEventListener("hashchange", honourHash);
    window.addEventListener("popstate", adoptUrl);
    return () => {
      window.removeEventListener("hashchange", honourHash);
      window.removeEventListener("popstate", adoptUrl);
    };
  }, []);

  useEffect(() => {
    queryRef.current = query;
    // The mount effect above already ran the first pass, and `query` is
    // still "" in this closure on that render — writing the URL here
    // would strip the `?q=` it just adopted.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setMatches(applyFilter(query));
    writeUrl(query);
  }, [query]);

  const summary = query.trim()
    ? `${countLabel(matches)} “${query.trim()}”.`
    : "";

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(summary), 500);
    return () => clearTimeout(timer);
  }, [summary]);

  return (
    <form
      className="log-filter"
      role="search"
      aria-label="Search the build log"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="search-control">
        <input
          ref={inputRef}
          type="search"
          className="directory-search"
          placeholder="Search all rounds — try “wrong”…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search the build log"
          aria-controls="build-log-results"
          aria-describedby="log-search-status"
        />
        {query ? (
          <button type="button" className="search-clear" onClick={clearSearch}>
            Clear
          </button>
        ) : null}
      </div>

      <div className="log-presets">
        <span className="log-presets-label">Jump to:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="log-preset"
            aria-pressed={query.trim().toLowerCase() === preset}
            onClick={() =>
              setQuery(query.trim().toLowerCase() === preset ? "" : preset)
            }
          >
            {preset}
          </button>
        ))}
      </div>

      <p className="directory-result-count" aria-hidden="true">
        {summary}
      </p>
      <p
        id="log-search-status"
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
    </form>
  );
}
