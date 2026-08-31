/**
 * tool-categories.mjs — the closed category list for directory tool listings
 * (specs/directory, beads addictedtoai-0eg), split out of `schema.mjs` so a
 * page component can read the vocabulary without importing the whole
 * zod-based schema module into its bundle (addictedtoai-bju: `SearchBox.tsx`
 * needs this array — see its own header for why — and `schema.mjs` drags in
 * `zod` plus every other content schema, which has no business in a client
 * bundle). `schema.mjs` re-exports this array; nothing else should declare a
 * second copy.
 *
 * Closed for the same reason `KINDS` (`schema.mjs`) is closed: an open field
 * drifts into `coding` / `code` / `Coding` and the grouping stops being a
 * partition. A value outside this list fails the build naming the file and
 * the value.
 *
 * **Declared, never inferred.** A tool's category is written in its front
 * matter. It is not guessed from the title, the URL or the blurb, for the
 * reason `lib/units.mjs` states about units and `aliases[].class` states
 * about alias classes: a heuristic that is right 90% of the time is a
 * heuristic that is silently wrong 10% of the time, and nothing downstream
 * can tell which.
 *
 * **The array's order carries no authority.** It is kept alphabetical for
 * reading, but `lib/listings.mjs` sorts by name at render time, so shuffling
 * this array cannot move a category up the page.
 *
 * `video` is deliberately absent. No listing in the corpus has video as its
 * primary job — ComfyUI does image and video and is categorised `image` —
 * and a category with no members is a promise the directory does not keep.
 */
export const TOOL_CATEGORIES = [
  'agents',
  'audio',
  'coding',
  'data',
  'evaluation',
  'frameworks',
  'image',
  'inference',
  'local',
  'observability',
  'retrieval',
  'training',
];
