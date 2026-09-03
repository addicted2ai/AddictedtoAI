/**
 * units.mjs — what a feed value is measured in.
 *
 * `facts.mjs` renders feed values **verbatim**, deliberately: reformatting a
 * raw value is a claim about what it means, and that layer does not make
 * claims. That rule was right and it stays. It was also, on its own, producing
 * pages a reader could not use: a stub entry rendered
 *
 *     price input   0.0000008
 *
 * while `/catalog` rendered the same underlying value as `$0.80` under a
 * column headed `In / Mtok`. 388 catalog rows link through to stubs shaped
 * like that, so a visitor following a row landed on a number with no way to
 * read it — and no way to tell it was the same number.
 *
 * **A unit is not a claim about the value; it is part of identifying the field
 * that was read.** "0.0000008" and "0.0000008 USD per token" assert exactly
 * the same thing about the world. What differs is whether the reader can tell
 * which thing was asserted. Withholding the unit is not neutrality — the
 * reader still forms a reading, just an unguided one, and every unguided
 * reading of `0.0000008` beside the words "price input" is wrong. So the unit
 * renders, and the three things the old rule actually forbids still never
 * happen: the value is not rescaled, no currency mark is attached to the
 * number, and no digit is reformatted. The unit is a separate element beside
 * a byte-for-byte verbatim value.
 *
 * **The site already made this claim, in one place only.** `render/catalog.mjs`
 * heads its price columns `In / Mtok` and `Out / Mtok` and multiplies by 1e6
 * to get there. So the choice was never "state the unit or stay silent" — it
 * was "state it on one surface and withhold it on the other". This file is
 * the entry-side half.
 *
 * **The half of that decision about SCALE was reversed on 2026-09-03** — see
 * `displayQuantity` at the foot of this file. The sentence that stood here
 * ("the catalog converts because its columns exist to be compared down, and an
 * entry does not convert because it shows what the source published") is why
 * an entry page rendered `0.00000006` for two months. Declaring the unit was
 * the right half and it stays; withholding the scale was the wrong half.
 *
 * **Why these units and not others.** Only paths whose unit is checkable from
 * the snapshot are listed; everything else is absent and renders exactly as it
 * did before. For `openrouter-models` the per-token reading is the only one
 * that yields sane figures — across the 362 priced rows of the 2026-08-28
 * snapshot, `pricing.prompt * 1e6` spans $0.017/Mtok (granite-4.0-h-micro) to
 * $150.00/Mtok (o1-pro), with gpt-4 at $30.00/Mtok; read as per-million the
 * same rows would price gpt-4 at $0.00003 per million tokens. `context_length`
 * spans 4,095 to 2,000,000 in that snapshot, which is tokens and nothing else.
 *
 * Deliberately unlisted: `$status`, `expiration_date` and the `reasoning.*`
 * flags (not quantities), and the `benchmarks.artificial_analysis.*` indices —
 * a named index has no unit, and inventing a scale for one would be the kind
 * of claim this layer refuses.
 */

import { formatPrice } from './catalog.mjs';

/** `<source-id>|<dotted path>` -> the unit the source publishes that path in. */
export const FEED_UNITS = {
  'openrouter-models|pricing.prompt': 'USD per token',
  'openrouter-models|pricing.completion': 'USD per token',
  'openrouter-models|pricing.internal_reasoning': 'USD per token',
  'openrouter-models|pricing.input_cache_read': 'USD per token',
  'openrouter-models|pricing.input_cache_write': 'USD per token',
  'openrouter-models|context_length': 'tokens',
  'openrouter-models|top_provider.context_length': 'tokens',
  'openrouter-models|top_provider.max_completion_tokens': 'tokens',
};

/**
 * The unit for one feed fact, or null when none is declared.
 *
 * Only `feed`-sourced facts have a source and a path to look up; a `cited`
 * fact's value is authored text and carries whatever the author wrote.
 */
export function unitFor(fact) {
  if (!fact || fact.source !== 'feed') return null;
  return FEED_UNITS[`${fact.feed}|${fact.path}`] ?? null;
}

/**
 * Feed paths this source publishes as a price **per single token**.
 *
 * Keyed the same way `FEED_UNITS` is, and deliberately a separate list rather
 * than a test on the unit string: a second price source that already published
 * per million tokens would carry a different unit and must not be rescaled.
 */
export const PER_TOKEN_PRICE_PATHS = new Set(
  Object.keys(FEED_UNITS).filter((k) => FEED_UNITS[k] === 'USD per token'),
);

/** What a per-token price is called once it has been scaled. */
export const PER_MILLION_UNIT = 'per million tokens';

/**
 * The value and unit to DISPLAY for one feed fact.
 *
 * ## Why the entry page now converts, having deliberately not converted
 *
 * The header above argued that an entry "does not convert because it shows
 * what the source published", and `lib/changes.mjs` recorded the same split in
 * so many words: "The entry page is deliberately **not** changed to match."
 * That reasoning produced a real page, and on 2026-09-03 the maintainer read
 * one and said what a reader sees:
 *
 *   > it is still displaying the price per single token ... no human wants to
 *   > know that a token costs $0.000001!
 *
 * He is right, and the argument that lost is worth stating so it is not
 * re-made. "Show what the source published" sounds like fidelity, but the
 * source publishes a NUMBER and the page publishes a READING. `0.00000006`
 * beside the words "price input" is not more faithful than `$0.06 per million
 * tokens` — it is the same assertion, rendered so that almost nobody can
 * evaluate it. Fidelity that the reader cannot use is not fidelity; it is the
 * unguided reading this file's own header already warned about, one layer up.
 *
 * The three surfaces now agree, which is the second reason. `/catalog` heads
 * its columns `In / Mtok`, the changed feed renders `$0.06`, and the entry a
 * reader reaches FROM either of those rendered a different-looking number for
 * the same price. `formatPrice` is reused here precisely so the same price
 * produces the same string on all three.
 *
 * ## What is still not being done, because it is what the old rule protected
 *
 * The conditions `lib/changes.mjs` set out for a legitimate conversion are
 * kept, and they are the whole of it:
 *
 *  - **The scale is named in the string.** Nothing is silently rescaled; the
 *    unit says `per million tokens` beside every converted value.
 *  - **The raw value survives in the data layer**, unmodified and verifiable:
 *    `data/sources/<id>/latest.json` holds `pricing.prompt` byte for byte,
 *    `data/changes.jsonl` holds the raw old and new, and `lib/dataset.mjs`
 *    exports the column as `price_input_per_token`.
 *  - **Only declared per-token paths are touched.** Everything else — a
 *    context window, a named index, a status — renders exactly as before.
 *
 * And the spec is unaffected: its "verbatim" language (specs/pulse's "the
 * feed-bound fact still renders its source's value verbatim", specs/wiki's "a
 * feed-bound fact remains what its source says, verbatim") sits inside the
 * `corroborates` requirement and governs ADJUDICATION — that the Pulse does
 * not pick a winner between two disagreeing sources. Naming a scale does not
 * change which value is asserted, so no requirement moves.
 *
 * @returns {{value: string, unit: string|null}}
 */
export function displayQuantity(fact, value) {
  const unit = unitFor(fact);
  if (!fact || fact.source !== 'feed' || !PER_TOKEN_PRICE_PATHS.has(`${fact.feed}|${fact.path}`)) {
    return { value, unit };
  }
  const formatted = formatPrice(value);
  // A value this source did not publish as a number — absent, empty, or
  // something unexpected — is left exactly as it arrived. Guessing at a scale
  // for a value that is not a quantity is the one thing this layer refuses.
  if (formatted === null) return { value, unit };
  // `free` is a word, not a quantity, so it takes no unit: "free per million
  // tokens" would be furniture that says something false.
  if (formatted === 'free') return { value: formatted, unit: null };
  return { value: formatted, unit: PER_MILLION_UNIT };
}
