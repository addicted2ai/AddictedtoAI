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
      className="icon-btn"
      onClick={next}
      aria-label={`Theme: ${LABEL[mode]}. Activate to change.`}
      title="Cycle theme: auto, light, dark"
      data-theme-toggle={mode}
    >
      {LABEL[mode]}
    </button>
  );
}
