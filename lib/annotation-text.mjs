import { escapeHtml } from './facts.mjs';

/** Render only non-empty backtick code spans after escaping all input. */
export function annotationText(text) {
  return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}
