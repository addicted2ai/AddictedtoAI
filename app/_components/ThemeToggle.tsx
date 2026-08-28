'use client';

/**
 * ThemeToggle — dark/light, remembered, keyboard-reachable (task 4.11).
 *
 * Three states, not two: `system` is the default and is not the same as
 * "light". A visitor who has expressed no preference should follow their OS,
 * and a toggle that silently pins them to light the first time they click is
 * a worse experience than one extra state.
 *
 * The stored choice is applied before paint by the inline script in the root
 * layout; this component only reads back what that script decided and writes
 * the next one. It renders a stable label on the server (`system`) and
 * corrects it after mount, so hydration has nothing to disagree about.
 *
 * **Discoverability.** It used to render the bare word "auto" in muted type
 * inside a hairline box, last in a row after seven nav items and a search
 * field — and the site's owner opened the site and could not find it. "auto"
 * names the *state*, and a reader looking for a theme control has no reason to
 * read a state word as one; muted-on-panel with a transparent fill made it
 * read as an inert tag rather than something to press. So it now carries a
 * sun / moon / split-disc glyph, which is the one convention a reader scans
 * for, and it sits on the page ground with full-contrast ink so it reads as
 * raised. What it does not do is drop a state: the cycle is still
 * auto -> light -> dark.
 *
 * The visible word stays, and stays inside the `aria-label`, so the accessible
 * name still contains the visible text (axe's label-content-name-mismatch).
 */

import { useEffect, useState } from 'react';

type Mode = 'system' | 'light' | 'dark';

const ORDER: Mode[] = ['system', 'light', 'dark'];
const LABEL: Record<Mode, string> = { system: 'auto', light: 'light', dark: 'dark' };
const KEY = 'atai-theme';

function apply(mode: Mode) {
  const root = document.documentElement;
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
  try {
    if (mode === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    // Private windows and blocked site data are normal; the toggle still works
    // for this page view, it just does not survive a reload.
  }
}

/**
 * The glyph for each state, drawn in `currentColor` so it inherits the
 * button's contrast rather than needing a colour of its own. `system` is the
 * split disc — half light, half dark — which is what "follow the OS" looks
 * like when it is not a word.
 */
function Glyph({ mode }: { mode: Mode }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };

  if (mode === 'dark') {
    return (
      <svg {...common}>
        <path d="M13.1 10.3A5.6 5.6 0 0 1 5.7 2.9a5.75 5.75 0 1 0 7.4 7.4Z" />
      </svg>
    );
  }

  if (mode === 'light') {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="3.1" />
        <path d="M8 1.2v1.5M8 13.3v1.5M1.2 8h1.5M13.3 8h1.5M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="5.6" />
      <path d="M8 2.4a5.6 5.6 0 0 1 0 11.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');

  useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    setMode(attr === 'dark' || attr === 'light' ? attr : 'system');
  }, []);

  const next = () => {
    const m = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(m);
    apply(m);
  };

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={next}
      aria-label={`Theme: ${LABEL[mode]}. Activate to change.`}
      title="Cycle theme: auto, light, dark"
      data-theme-toggle={mode}
    >
      <Glyph mode={mode} />
      <span className="theme-toggle-label">{LABEL[mode]}</span>
    </button>
  );
}
