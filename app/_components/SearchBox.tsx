'use client';

/**
 * SearchBox — client-side name search over the whole corpus (task 4.12,
 * specs/site).
 *
 * *"Search runs entirely in the visitor's browser (no server, no external
 * service, no inference) ... Stubs are discoverable through it even though
 * they are `noindex` for crawlers."*
 *
 * The index is fetched **on first interaction**, not on load. It is a few
 * hundred kilobytes of names for a 400-page corpus, and a visitor who never
 * searches should never pay for it — which is also what keeps the home page
 * inside task 4.11's first-load budget.
 *
 * The matching is `matchIndex` from `lib/search-match.mjs`, the same function
 * the build's test calls. Re-implementing it here would mean the test proved
 * something about a function no visitor runs.
 *
 * Keyboard: Tab reaches the field, typing filters, Up/Down move the
 * selection, Enter opens the selected result, Escape closes. The listbox is
 * an ARIA combobox so a screen reader is told how many results there are.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { matchIndex, TYPE_LABELS } from '../../lib/search-match.mjs';

type Doc = {
  u: string;
  t: string;
  k: string;
  d: string | null;
  s: string | null;
  i: string | null;
  a: string[];
  b: boolean;
};

type Hit = Doc & { why: string };

export default function SearchBox({ indexUrl = '/search-index.json' }: { indexUrl?: string }) {
  const [index, setIndex] = useState<{ docs: Doc[] } | null>(null);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const load = () => {
    if (index) return;
    fetch(indexUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setIndex(data))
      .catch(() => {
        // A failed fetch leaves the box inert rather than throwing into the
        // page. Search is an accelerator here; every page is reachable
        // without it.
      });
  };

  useEffect(() => {
    setHits(index ? (matchIndex(index, query) as Hit[]) : []);
    setActive(-1);
  }, [index, query]);

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter') {
      // Enter with nothing selected opens the top result — the behaviour of
      // every search box a visitor has already used.
      const hit = hits[active] ?? hits[0];
      if (hit) {
        e.preventDefault();
        window.location.href = hit.u;
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showing = open && query.trim().length > 0;

  return (
    <div className="searchbox" ref={boxRef}>
      <input
        id="site-search"
        type="search"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        placeholder="search names…"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-expanded={showing}
        aria-label="Search entry names, aliases and page titles"
        value={query}
        onFocus={() => {
          load();
          setOpen(true);
        }}
        onChange={(e) => {
          load();
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {/* Always rendered, hidden when idle: `aria-controls` must point at an
          element that exists, and a listbox that appears and vanishes from the
          accessibility tree is announced as a page change. */}
      <ul className="search-results" id={listId} role="listbox" aria-label="Search results" hidden={!showing}>
        {hits.length === 0 && (
          <li className="r-empty" role="option" aria-selected={false} aria-disabled="true">
            <span className="r-why">
              {index ? `No name matches “${query}”.` : 'Loading the name index…'}
            </span>
          </li>
        )}
        {hits.map((hit, i) => (
          <li key={hit.u} role="option" aria-selected={i === active}>
            <a href={hit.u} onMouseEnter={() => setActive(i)}>
              <span className="r-title">{hit.t}</span>
              <span className="r-meta">
                {hit.d ?? TYPE_LABELS[hit.k as keyof typeof TYPE_LABELS] ?? hit.k}
                {hit.b ? ' · stub' : ''}
                {hit.s ? ` · ${hit.s}` : ''}
              </span>
              {hit.why !== hit.t && <span className="r-why">matched “{hit.why}”</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
