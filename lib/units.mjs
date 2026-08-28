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
 * the entry-side half, in the site's own vocabulary rather than the catalog's
 * display vocabulary: the catalog converts because its columns exist to be
 * compared down, and an entry does not convert because it shows what the
 * source published.
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
