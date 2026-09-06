/**
 * render/frontier.mjs — the players board (CP-UI-001-2, K11/K19).
 *
 * NEW module. REUSES: `lib/render/catalog.mjs`'s cell/table vocabulary (`el`,
 * `link`, `extLink`, `badge`, `notice`) via `render/common.mjs`, and
 * `lib/catalog.mjs`'s `formatPrice`/`formatContext` — the same formatting a
 * catalog row already uses, so a price on the board and a price on
 * `/catalog` are never independently derived. What is new here is the JOIN:
 * one row per organisation (`content/wiki/org/*.md`), matched to the catalog
 * providers it stands behind by alias, never invented.
 *
 * Every cell that has no source renders as an honest, LABELLED absence —
 * muted text, a thin diagonal only on a fully-empty column (none currently
 * shipped; the index-position column is omitted whole instead, per the
 * packet) — never a bare dash and never a colour fill. F-hier-1 (JV-hier):
 * an empty cell must never carry MORE visual weight than a filled one, so
 * the hatch here is a light `--rule`-toned stripe behind muted text, not a
 * dominant mark. F-hier-4: the organisation/current-model pair is the one
 * column set rendered at a heavier weight than the rest of the board — the
 * page's first-read entry point.
 */

import {
  el,
  join,
  link,
  extLink,
  date,
  escapeHtml,
  notice,
} from './common.mjs';
import { formatPrice, formatContext } from '../catalog.mjs';

/** Lowercase, strip a leading '~' (free-tier duplicate ids) and non-alnum. */
function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/^~/, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Which catalog `provider` ids belong to an org entry, by alias — never a
 * hand-authored mapping. A provider id matches an org alias when either
 * contains the other, aliases shorter than 3 normalised characters excluded
 * (too noisy at this length: "AI", "Le"). Reported honestly in the
 * implementer report as the risk it is (CP-UI-001-2 known_risks[2]) rather
 * than assumed correct.
 *
 * THIS IS THE WHOLE ORG JOIN, AND IT IS NOT `feeds` (ruled 2026-09-06, job
 * `j-20260906-11`, from the proposal
 * `org-directives-demand-a-feeds-map-that-cannot-exist`; the reasoning and the
 * measurements are `content/wiki/README.md`, "What an `org` entry declares").
 * Eight `entry` directives for uncovered catalog providers each told their
 * author that the entry "MUST CARRY OR THE ROW IS BLANK: its `feeds` map,
 * which is the join the board relies on". It is not, in either half:
 *
 *   - Nothing on this path reads `feeds`. The string occurs in this file only
 *     in the board's table caption and in comments, never as a data read, and
 *     a row's cells come from the provider set this function returns.
 *   - No org entry could carry one honestly. Both registered sources are keyed
 *     on a row that is not an organisation — `data/sources/registry.json` gives
 *     `openrouter-models` the `row_id_field` `id` (a model slug) and
 *     `llm-releases` the `row_id_field` `guid` (one release) — so the only
 *     value an org could write is a model's row id, and the three places that
 *     read `feeds` ask no kind question before acting on it:
 *     `pulse/lib/corpus.mjs:219-235` scans `corpus.entries` whole, so
 *     `pulse/lib/mint.mjs:139-142` would mint no `model/` stub for a row an
 *     org had declared; `pulse/lib/mint.mjs:258-263` would append that model's
 *     mechanical status events to the organisation's timeline; and
 *     `lib/changes.mjs:60-67` keys one Map on `${source}|${rowId}`, so of two
 *     entries claiming one row the last one loaded silently wins.
 *
 * Measured 2026-09-06: none of the 24 files in `content/wiki/org/` contains the
 * string `feeds`, and every one of them is a board row regardless (K21, and the
 * `!row` branch noted at `renderPlayersBoard` below). A different org join is a
 * new mechanism to design, never a use of this one.
 */
function matchProviders(org, catalogRawRows) {
  const names = [org.data.display_name, ...(org.data.aliases ?? []).map((a) => a.name)]
    .map(norm)
    .filter((n) => n.length >= 3);
  const providers = new Set();
  for (const row of catalogRawRows) {
    const p = norm(row.provider);
    if (!p) continue;
    if (names.some((n) => n === p || n.includes(p) || p.includes(n))) providers.add(row.provider);
  }
  return providers;
}

/** The org's own newest catalog row, by the feed's own `created` timestamp. */
function newestRow(providers, catalogRawRows) {
  let best = null;
  for (const row of catalogRawRows) {
    if (!providers.has(row.provider)) continue;
    if (!best || (row.created ?? 0) > (best.created ?? 0)) best = row;
  }
  return best;
}

/**
 * RD-002 fix 1 (F-sys-2-7 + F-sys-2-3 + RT FM1/FM2; BRIEF R-B).
 *
 * The VENDOR CLAIM column previously took `firstCitedFact(modelDoc) ??
 * firstCitedFact(org)` — the first cited fact of ANY kind, on the model or,
 * failing that, on the ORGANISATION. Live that rendered NVIDIA's company
 * founding date ("5 April 1993, by Jensen Huang…") under "claimed ·
 * unverified" in a MODEL's own row: a fact about a company, stamped as a
 * claim about a model. The org fallback is GONE — no org document is read
 * for this column at all, so no founding date, founder or company fact can
 * reach /frontier by any path.
 *
 * What remains is TYPED at the source rather than positional: a cited fact
 * ON THE MODEL ENTRY whose `field` names a performance or capability claim.
 * `release_date`, `license`, `parameters`, `listed_date`, `api_sunset`,
 * `knowledge_cutoff`, price and provenance fields are record metadata, not
 * claims a vendor makes about what its model DOES, and are excluded. What is
 * left over renders as the labelled blank — which is the page's point
 * (F-sys-2-3: the hatch was correct in CSS and unreachable in data).
 */
/* RD-003 fix 1 (RT FM-N1 + FM-N2; BRIEF anti-requirements — no hype lexicon,
 * vendor language only verbatim, attributed, labelled).
 *
 * `CLAIM_FIELD` above was a regex over the field NAME, and a name is not a
 * claim: `description`, `role` and `claim` are substrings of
 * `vendor_description`, `vendor_role`, `tier_role` and `generation_claim` —
 * positioning copy, admitted on exactly the same terms as a benchmark score.
 * Live on the shipped board that put SpaceXAI's "smartest model with frontier
 * performance…" in the VENDOR CLAIM cell of x-ai's row, a superlative
 * sentence with no number in it, framed identically to "359 tok/s".
 *
 * The regex is replaced by an EXPLICIT ALLOW-LIST in two ranked tiers (tier 2
 * and the ranking are SUPERSEDED by RD-004 below), taken
 * from the field names that actually occur as `source: cited` facts across
 * `content/wiki/model/*.md`:
 *
 *   tier 1 BENCHMARK — the field names a named benchmark or scored eval
 *   tier 2 QUANTIFIED — the field names a measured capability quantity
 *
 * and a value that carries no digit at all is not a quantified claim whatever
 * its field is called, so it is excluded too (`deepswe_v1_1`'s "outperforms
 * most larger frontier models…" is a tagline wearing a benchmark's name).
 * Everything absent from both sets — every positioning/description field
 * (`vendor_description`, `vendor_role`, `tier_role`, `generation_claim`,
 * `distilled_from`, `structure`, `architecture`, `quantization`,
 * `contributor_tier_terms`, `local_hardware`, `open_weights`, the free-access
 * windows) and every record-metadata field (`release_date`, `license`,
 * `parameters`, `listed_date`, `api_sunset`, `knowledge_cutoff`, prices) — is
 * excluded BY DEFAULT rather than by a pattern that has to anticipate it: a
 * marketing field invented tomorrow is blank on this board on the day it
 * lands, not the day someone widens the regex.
 *
 * FM-N2 (first-match order): `find()` took whichever matching fact came first
 * in document order, so `openai-gpt-5-6-terra.md`'s `vendor_role` preempted
 * its own `capture_the_flag_score` by position alone. Selection is now RANKED
 * — a tier-1 benchmark outranks a tier-2 quantity, document order breaks ties
 * inside a tier — so a row with both shows the number.
 *
 * Asserted by S22 clause (d), which re-derives the excluded values from the
 * MODEL CORPUS independently (it keeps its own denied-field list, so widening
 * the sets below does not widen the gate) and fails if one reaches a claim
 * cell, and fails from the other end if the sets are narrowed until no claim
 * renders at all.
 */
const CLAIM_FIELDS_BENCHMARK = new Set([
  'agentic_index',
  'capture_the_flag_score',
  'coding_index',
  'cybergym_score',
  'deepswe_score',
  'deepswe_v1_1',
  'frontiercode_score',
  'harveys_legal_agent_benchmark',
  'hle_verified',
  'intelligence_index',
  'intelligence_index_by_effort',
  'internal_blind_eval',
  'preview_cybergym_score',
  'preview_terminal_bench_score',
  'terminal_bench_score',
  'terminalbench_comparison',
  'terminalbench_score',
  'vals_finance_agent_v2',
]);

/* RD-004 fix (RT FM-N3 + JV-sys F-sys-4-1; BRIEF R-B and its anti-requirements
 * — vendor language only VERBATIM, ATTRIBUTED, LABELLED; K10's sourced-and-
 * honest fence).
 *
 * Tier 2 is GONE. `observed_throughput_p50`, `observed_latency_p50`,
 * `cost_per_task`, `output_tokens_per_task` and `fast_mode_speed` are
 * MEASUREMENTS — someone's reading of the model, not the vendor's assertion
 * about it — and the shipped board put one of them under a lede that says the
 * column is "quoted verbatim from the vendor": inception-mercury-2-5-preview's
 * `observed_throughput_p50` "359 tok/s" is OpenRouter's rolling-window median
 * over live traffic, which the source document's own prose separates from
 * Inception's own (different) vendor number. A measurement is not a claim,
 * whatever its field is called, so the tier is dropped whole rather than
 * filtered.
 *
 * And the deeper root cause, which dropping a tier does not reach: `source:
 * cited` means "carries a citation", never "is the vendor's own assertion".
 * `claimRank` read the field name and the presence of a digit, never WHO was
 * cited — so google-gemini-3-8-flash's `intelligence_index_by_effort` (an
 * llm-releases.com analyst's arithmetic, tier 1 by field name) was one
 * rebuild away from the same cell.
 *
 * A fact now renders in the VENDOR CLAIM cell only if BOTH hold:
 *   (1) its field is in the tier-1 BENCHMARK allow-list above, and
 *   (2) its cited `source_url` host is the ROW ORGANISATION'S OWN domain.
 *
 * (2) is derived from data that exists, never a hand-written host list: the
 * org entry's own `facts[].source_url` and `timeline[].source_url` are the
 * domains an organisation is recorded citing itself from.
 *
 * RD-005 fix 2 (RT FM-N5). Matching is on the REGISTRABLE DOMAIN (eTLD+1),
 * never on a host's labels. The rule, stated once:
 *
 *   registrable(host) = the public suffix plus the one label to its left.
 *   The suffix is the host's LAST label, except for the two-label suffixes
 *   listed in `MULTI_LABEL_SUFFIXES` below (`co.uk`, `com.cn`, `github.io`,
 *   …), where it is the last two. A leading `www.` is stripped first.
 *   So `www.tencent.com` → `tencent.com` and `deepmind.google` →
 *   `deepmind.google` — `.google` is a single-label brand TLD, so its
 *   eTLD+1 keeps `deepmind`, and `blog.google` → `blog.google` is a
 *   DIFFERENT registrable domain from both `deepmind.google` and
 *   `google.com`. Under a brand TLD each sub-label is separately
 *   registrable, so the board treats them as separate parties and the ALIAS
 *   half below is what re-admits the vendor's own.
 *
 *   registrableLabel(host) = the one label left of the suffix — `tencent`,
 *   `deepmind`, `blog`, `attacker`. It is the only label ownership can be
 *   read off, because it is the string the registrant actually bought.
 *
 * A source is the row vendor's when EITHER its registrable domain equals the
 * registrable domain of a host the org entry records citing itself from, OR
 * its registrable LABEL is one of the org's own name tokens (display name and
 * explicit `aliases`, generic corporate words removed). So `www.anthropic.com`
 * and `www.inceptionlabs.ai` pass as recorded, `deepmind.google` and
 * `www.tencent.com` pass on the alias half, and `openrouter.ai`,
 * `llm-releases.com`, `huggingface.co`, `venturebeat.com` and
 * `en.wikipedia.org` do not — whoever republishes a vendor's number, the
 * number they publish is theirs, not the vendor's.
 *
 * WHY THE LABEL SCAN IS GONE (RT FM-N5): the previous test asked whether ANY
 * dot-separated label of the host was an org name token — label identity
 * with no notion of position or ownership. `google.attacker.example` cleared
 * it for Google DeepMind exactly as `deepmind.google` did, and an
 * `endsWith('.' + recorded)` test has the same shape from the other side. A
 * subdomain belongs to whoever owns the registrable domain, never to whoever
 * the leftmost label is named after. Only the registrable label is consulted
 * now, so an attacker-shaped host is a third party and renders the blank.
 * A third party's measurement renders as the labelled blank, which is what
 * this board is for.
 *
 * Generic corporate words are not name tokens (`ai`, `labs`, `cloud`, `inc`,
 * `group`, …): "Inception Labs" is `inceptionlabs.ai`, never anything ending
 * `labs.<anything>`.
 *
 * Attribution, JV-sys F-sys-4-1 and F-sys-5-1: the cell names the VENDOR as
 * the claim's source, FIRST — "Google DeepMind — 54.9%, accessed <date>",
 * the name ahead of the clamp's ellipsis rather than behind it — so the READ
 * cell beside it (the feed the price and context columns came from, the same
 * value on 16 of 16 rows) can no longer be misread as the claim's provenance.
 * The vendor name is the link to the cited source, so nothing is lost; the
 * name is DATA (`org.data.display_name`), not authored copy. The one-line
 * ellipsised clamp is unchanged (S22 clause (c)).
 *
 * Asserted by S22 clause (e), which re-derives vendor-ness from the ORG and
 * MODEL corpora with its own mapping (org `mentions`) and never imports
 * anything below.
 */

/** Generic company words that are not an organisation's identifying name. */
const GENERIC_NAME_TOKENS = new Set([
  'ai', 'labs', 'lab', 'cloud', 'inc', 'corp', 'corporation', 'company',
  'group', 'foundation', 'pbc', 'ltd', 'llc', 'technologies', 'technology',
  'research', 'the', 'and', 'for', 'com', 'net', 'org', 'www',
]);

/** The org's identifying name tokens: whole names and their words. */
function orgNameTokens(org) {
  const names = [org?.data?.display_name, ...(org?.data?.aliases ?? []).map((a) => a.name)];
  const tokens = new Set();
  for (const name of names) {
    const whole = norm(name);
    if (whole.length >= 3) tokens.add(whole);
    for (const word of String(name ?? '').toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length >= 3 && !GENERIC_NAME_TOKENS.has(word)) tokens.add(word);
    }
  }
  return tokens;
}

/** Lowercased host of a URL, `www.` stripped, or null. */
function urlHost(url) {
  try {
    return new URL(String(url)).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Public suffixes that are TWO labels long. Everything else is treated as a
 * single-label suffix, which is right for `.com`, `.ai`, `.dev` and for the
 * brand TLDs this corpus actually cites (`.google`, `.blog`). Kept short and
 * explicit on purpose: a missing entry here can only make the test STRICTER
 * for the party it concerns — a shorter suffix means a registrable domain
 * that includes one more owned label — and a WRONG entry only ever splits
 * one party into several, never merges two into one, so no addition to this
 * list can admit a host that would otherwise have been refused.
 */
const MULTI_LABEL_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'co.jp', 'co.kr', 'co.in', 'co.za',
  'co.nz', 'com.au', 'com.br', 'com.cn', 'net.cn', 'org.cn', 'gov.cn',
  'edu.cn', 'com.hk', 'com.tw', 'com.sg', 'com.mx', 'com.tr',
  // Private-section suffixes: every sub-label is a different registrant, so
  // `vendor.github.io` and `attacker.github.io` must not read as one party.
  'github.io', 'pages.dev', 'vercel.app', 'netlify.app', 'workers.dev',
  'blogspot.com', 'substack.com', 'notion.site', 'medium.com',
]);

/**
 * The registrable domain (eTLD+1) of a host and the one label left of its
 * public suffix, per the rule stated in the block comment above. `null` when
 * the host is a bare suffix with nothing registered under it.
 */
function registrable(host) {
  const labels = String(host ?? '').split('.').filter(Boolean);
  const suffixLabels = MULTI_LABEL_SUFFIXES.has(labels.slice(-2).join('.')) ? 2 : 1;
  if (labels.length <= suffixLabels) return null;
  const label = labels[labels.length - suffixLabels - 1];
  return { domain: labels.slice(-(suffixLabels + 1)).join('.'), label };
}

/**
 * The REGISTRABLE DOMAINS an ORG ENTRY records as its OWN — the hosts it
 * cites itself from, kept only where the registrable LABEL is the org's own
 * name, so a wikipedia or feed citation in the same list is not mistaken for
 * the vendor's site. `blog.google` drops out here (its registrable label is
 * `blog`, which names nobody); Google DeepMind's own sources reach the column
 * through the alias half of `isVendorSourced` instead.
 */
function orgOwnDomains(org) {
  const tokens = orgNameTokens(org);
  const domains = new Set();
  const cited = [...(org?.data?.facts ?? []), ...(org?.data?.timeline ?? [])];
  for (const item of cited) {
    const reg = registrable(urlHost(item?.source_url));
    if (reg && reg.label.length >= 3 && tokens.has(reg.label)) domains.add(reg.domain);
  }
  return domains;
}

/** Is this cited fact's source the ROW ORGANISATION itself? */
function isVendorSourced(fact, org) {
  const reg = registrable(urlHost(fact?.source_url));
  if (!reg || !org) return false;
  // Recorded: the SAME registrable domain the org cites itself from. A
  // subdomain is covered by construction — `www.anthropic.com` and
  // `docs.anthropic.com` share one registrable domain — with no `endsWith`
  // test, which had FM-N5's shape from the other side.
  if (orgOwnDomains(org).has(reg.domain)) return true;
  // Named: the REGISTRABLE label, and only that label, is one of the org's
  // own name tokens. `deepmind.google` passes; `google.attacker.example`
  // does not, because `attacker` is who bought it (RT FM-N5).
  return reg.label.length >= 3 && orgNameTokens(org).has(reg.label);
}

/** 1 = a vendor claim this column may carry; 0 = it may not. */
function claimRank(fact, org) {
  if (fact?.source !== 'cited') return 0;
  // No digit, no quantity: a sentence is not a claim this column can compare.
  if (!/\d/.test(String(fact.value ?? ''))) return 0;
  if (!CLAIM_FIELDS_BENCHMARK.has(String(fact.field ?? ''))) return 0;
  // RD-004: allow-listed field, cited — but cited to WHOM.
  if (!isVendorSourced(fact, org)) return 0;
  return 1;
}

/**
 * The model's own cited, quantified, VENDOR-SOURCED benchmark claim, or null.
 * Never reads an org's FACTS for the column (RD-002 fix 1 stands — the org is
 * read here only for its identity and its own domains, never for a value).
 * Document order breaks ties inside the single surviving tier.
 */
function vendorClaimFact(modelDoc, org) {
  for (const f of modelDoc?.data?.facts ?? []) {
    if (claimRank(f, org) > 0) return f;
  }
  return null;
}

function hatch(text, opts = {}) {
  return el(
    'td',
    {
      class: `board-cell board-hatch${opts.class ? ` ${opts.class}` : ''}`,
      'data-derived': 'frontier-board',
    },
    el('span', { class: 'hatch-text' }, escapeHtml(text)),
  );
}

/* RD-002 fix 2 (F-hier-5 + F-struct-4 + F-hier-6 + F-struct-5 + F-sys-2-1b;
 * RULES R8's badge clause, R13). The two strings the VENDOR CLAIM cell has
 * always used, now named once: whichever of them more than 90% of the
 * board's rows would repeat is printed ONCE above the board as unboxed
 * `--muted` text (`renderPlayersBoard` below), and the per-row bordered chip
 * is gone from the table entirely — R8 boxes a badge only where its tone
 * differs from the collection default, and a mark on 16 of 16 rows IS the
 * default. No copy is authored here: both strings are the ones the cell
 * already rendered (CHARTER slot 1). */
const CLAIM_PRESENT = 'claimed · unverified';
const CLAIM_ABSENT = 'no vendor claim on file';

/* K22 (keeper, delegated): a future `domain` facet (text/coding/image/...)
 * on models/orgs/tools/indices is a DATA addition, not a template one, on
 * this board — BOARD_COLUMNS is a plain array the head row and every cell
 * function are driven from; a domain column (or a players-by-domain group)
 * is one more entry here plus one more per-row cell reading `row.domain` (or
 * `modelDoc.data.domain`), same shape as every column below. No content is
 * invented or tagged now. */
const BOARD_COLUMNS = [
  { label: 'Organisation', numeric: false },
  { label: 'Current model', numeric: false },
  { label: 'In / Mtok', numeric: true },
  { label: 'Out / Mtok', numeric: true },
  { label: 'Context', numeric: true },
  { label: 'Vendor claim', numeric: false },
  { label: 'Read', numeric: false },
];

function boardHeadRow() {
  return el(
    'tr',
    {},
    BOARD_COLUMNS.map((c) => el('th', { scope: 'col', 'data-numeric': c.numeric ? '' : null }, escapeHtml(c.label))).join(''),
  );
}

/**
 * One board row. `site.fetchedOn` and `byId` are the same joins every other
 * page uses — nothing here re-derives them.
 */
function resolveBoardRow(org, site, catalogRawRows) {
  const providers = matchProviders(org, catalogRawRows);
  const row = newestRow(providers, catalogRawRows);
  const modelDoc = row?.entry_id ? site.corpus.byId.get(row.entry_id) : null;
  return { org, row, modelDoc, claimFact: vendorClaimFact(modelDoc, org) };
}

function boardRowHtml({ org, row, modelDoc, claimFact }, site, opts = {}) {
  const orgCell = el(
    'th',
    { scope: 'row', class: 'board-cell board-lead' },
    link(org.url, org.data.display_name),
  );

  if (!row) {
    return join(
      '<tr class="board-row" data-derived="frontier-board">',
      orgCell,
      hatch('no listing in feed'),
      hatch('not published by source'),
      hatch('not published by source'),
      hatch('not published by source'),
      hatch(CLAIM_ABSENT, { class: 'board-claim' }),
      hatch('—', { class: 'board-read' }),
      '</tr>',
    );
  }

  const modelCell = el(
    'td',
    { class: 'board-cell board-lead' },
    modelDoc ? link(modelDoc.url, row.display_name ?? row.row_id) : escapeHtml(row.display_name ?? row.row_id),
  );

  const priceIn = formatPrice(row.price_input);
  const priceOut = formatPrice(row.price_output);
  const ctx = formatContext(row.context_window);

  const fetched = site.fetchedOn?.(row.source) ?? null;

  return join(
    '<tr class="board-row" data-derived="frontier-board">',
    orgCell,
    modelCell,
    priceIn ? el('td', { class: 'board-cell', 'data-numeric': '' }, escapeHtml(priceIn)) : hatch('not published by source'),
    priceOut ? el('td', { class: 'board-cell', 'data-numeric': '' }, escapeHtml(priceOut)) : hatch('not published by source'),
    ctx ? el('td', { class: 'board-cell', 'data-numeric': '' }, escapeHtml(ctx)) : hatch('not published by source'),
    claimFact
      ? el(
          'td',
          { class: 'board-cell board-claim' },
          // RD-002 fix 2: no chip. One ellipsised line (see .board-claim in
          // globals.css) carrying the claim VERBATIM, its source and the date
          // it was accessed — the whole cell is the claim's provenance, and
          // the state the rest of the column repeats is stated once above the
          // board instead of sixteen times inside it.
          el(
            'span',
            { class: 'claim-line', title: String(claimFact.value ?? '') },
            // RD-005 fix 1 / JV-sys F-sys-5-1: the ATTRIBUTION IS FIRST.
            // RD-004 put the vendor's name after the fragment and inside the
            // one-line clamp, so the ellipsis ate the attribution before it
            // ate the claim: Google DeepMind's cell broke mid-name and lost
            // its date, Tencent's was cut before the em dash and named no
            // source at all — the fix defeated at render by the form it was
            // placed in. The clamp is unchanged (do_not_touch as a FORM);
            // only the ORDER moves. `text-overflow: ellipsis` elides at the
            // END of the line box, so whatever renders first is the last
            // thing to be lost: putting the vendor ahead of the fragment
            // makes the name structurally unelidable while the quoted words
            // — which the `title` and the model record both still carry in
            // full — take the truncation instead. The name is still the link
            // to the cited page and still DATA (`org.data.display_name`), not
            // authored copy. Asserted by S22 clause (e), which measures the
            // `.src` rect against the clamp's own visible box.
            extLink(claimFact.source_url, org.data.display_name, { class: 'src' }),
            ' — ',
            escapeHtml(claimFact.value),
            claimFact.accessed ? join(', accessed ', date(claimFact.accessed)) : '',
          ),
        )
      : hatch(CLAIM_ABSENT, { class: 'board-claim' }),
    fetched
      ? el(
          'td',
          {
            class: 'board-cell board-read',
            // RD-002 fix 2 / RULES R8 (S17's 90% clause). Every row on the
            // board is read from the same feed on the same day, so READ was
            // one value repeated on 16 of 16 rows at the full ink weight of
            // the price and context columns a reader actually compares
            // across. `/catalog` solved this exact shape already
            // (`catalogRowHtml`'s `defaultFetched`): state the collection
            // constant ONCE above the table — `renderFetchLine`, reused
            // verbatim on this route — and render the unexceptional row at
            // --muted, keeping full weight for a row whose provenance
            // genuinely differs. Same mechanism, same rule, no second
            // implementation of it.
            'data-default': `${row.source ?? 'feed'}|${fetched}` === opts.defaultRead ? '' : null,
          },
          escapeHtml(row.source ?? 'feed'),
          ' · ',
          date(fetched),
        )
      : hatch('—', { class: 'board-read' }),
    '</tr>',
  );
}

/**
 * The board. `orgs` is `site.corpus.entry` filtered to `kind === 'org'`;
 * `catalogRawRows` is `site.catalogFile.rows` (the raw feed rows, which
 * carry `created` — the timestamp `catalogRow()` in lib/catalog.mjs does not
 * expose, and the one thing "newest listing" needs that a pre-formatted
 * catalog row cannot give it).
 */
/*
 * K21 (keeper, delegated): board membership is EDITORIAL, never feed-gated.
 * Every `orgs` entry becomes a row below regardless of whether any catalog
 * row matches it (`boardRowHtml`'s `!row` branch) — nothing here filters
 * `orgs` by feed presence. Column labels ("Current model", "In / Mtok",
 * "Read") are generic, not tied to a named source; the "Read" cell states
 * whichever feed id the matched row's own `source` field carries
 * (`data/sources/registry.json`'s own ids), never a hard-coded "OpenRouter".
 * A second feed populating MORE providers needs no template change (it is
 * data `newestRow` already scans across). A genuinely NEW rail — a second,
 * independently-published INDEX position, or a second vendor-claim source —
 * is one new `BOARD_COLUMNS` entry plus one new per-row cell function; nothing
 * about a row's identity or an org's presence on the board depends on which
 * columns currently exist. See the implementer report for the count of
 * organisations shown with an all-blank row.
 */
export function renderPlayersBoard(orgs, site, catalogRawRows) {
  if (orgs.length === 0) {
    return notice('No organisation records exist yet.', 'info', { name: 'empty-frontier-board' });
  }
  const resolved = orgs.map((org) => resolveBoardRow(org, site, catalogRawRows));

  /* RD-002 fix 2 / RULES R8 (S17's 90% clause, now scoped to /frontier).
   * The vendor-claim state the MAJORITY of rows carry is stated once, here,
   * as unboxed --muted text; the per-row chip is gone. Which string that is
   * is computed from the rendered rows, not assumed — if the balance ever
   * tips the other way the line follows it, and if no state clears 90% no
   * line is printed at all and every row states its own. */
  const withClaim = resolved.filter((r) => r.claimFact).length;
  const share = withClaim / resolved.length;
  const dominant = share > 0.9 ? CLAIM_PRESENT : (1 - share) > 0.9 ? CLAIM_ABSENT : null;

  /* The same clause, applied to READ: the provenance value more than 90% of
   * rows repeat is the collection's default, stated once above the board by
   * `renderFetchLine` (app/frontier/page.tsx) exactly as /catalog states it
   * above its own table, and rendered at --muted per row here. Computed, not
   * assumed: a row read from a second feed, or on a different day, keeps its
   * full weight because it is then the value worth a reader's attention. */
  const readCounts = new Map();
  for (const r of resolved) {
    const fetched = r.row ? site.fetchedOn?.(r.row.source) ?? null : null;
    if (!fetched) continue;
    const key = `${r.row.source ?? 'feed'}|${fetched}`;
    readCounts.set(key, (readCounts.get(key) ?? 0) + 1);
  }
  let defaultRead = null;
  for (const [key, n] of readCounts) if (n / resolved.length > 0.9) defaultRead = key;

  /* RD-003 fix 2 (JV-sys F-sys-3-1 + F-sys-3-3; BRIEF R-B — a claim must be
   * unmistakably labelled unverified). With the per-row chip correctly gone
   * (R8), the word "unverified" survived only inside the column header, so a
   * reader met vendor sentences at the ink weight of the fed price columns
   * with nothing in words saying who said them or that nobody checked. ONE
   * sentence states it once, directly above the board, for the whole column —
   * the same "state the collection constant once above the table" mechanism
   * R8's own addendum already applies to READ, in words rather than as a
   * mark. It is the ONLY copy this round authors (CHARTER slot 1). Its fixed
   * copy carries NO digit: the two counts are rendered from the resolved rows
   * inside this element, which is itself inside the `frontier-board`
   * data-derived fence, per the route's own no-digits-in-fixed-copy rule.
   * Asserted by S25 at 1440 and 390. */
  const withoutClaim = resolved.length - withClaim;

  return join(
    el(
      'p',
      { class: 'board-lede', 'data-derived': 'frontier-board' },
      'Vendor claims are quoted verbatim from the vendor and are not verified by this site; a blank means no claim on file — today ',
      escapeHtml(String(withoutClaim)),
      ' of ',
      escapeHtml(String(resolved.length)),
      ' organisations have none.',
    ),
    dominant ? el('p', { class: 'board-note', 'data-derived': 'frontier-board' }, escapeHtml(dominant)) : '',
    el(
      'div',
      { class: 'table-wrap board-wrap', 'data-derived': 'frontier-board' },
      el(
        'table',
        { class: 'data-table board-table', id: 'frontier-board' },
        el('caption', {}, 'Organisations tracked by this site and their newest listed model, as the tracked feeds state it today'),
        el('thead', {}, boardHeadRow()),
        el('tbody', {}, resolved.map((r) => boardRowHtml(r, site, { defaultRead })).join('')),
      ),
    ),
  );
}

/**
 * The board's first N rows, resolved but NOT rendered — the home Frontier
 * door (F-hier-2 decline: a fixed two-column excerpt, not a board fragment;
 * see the implementer report) reads this rather than re-deriving the join.
 */
/**
 * RD-002 fix 3 (F-hier-10 + F-sys-2-4 + RT FM3; K26). Newest dated change per
 * ENTRY id, from the same resolved changed feed the home page's own lead
 * renders (`site.changes`) — not re-derived, and not a second read of
 * `changes.jsonl`.
 */
function changeRecencyByEntryId(site) {
  const byId = new Map();
  for (const line of site.changes ?? []) {
    // `changedFeed()` resolves each line to a lightweight `{ id, url, name }`
    // reference, not to the whole entry doc — `id` here is the declared entry
    // id (`model/…`, `org/…`), the same key `site.corpus.byId` and a catalog
    // row's own `entry_id` use.
    const id = line.entry?.id;
    if (!id) continue;
    const d = String(line.date ?? '');
    if (!byId.has(id) || d > byId.get(id)) byId.set(id, d);
  }
  return byId;
}

/** The newest dated change touching an org's own entry or any model it stands behind. */
function orgRecency(org, providers, catalogRawRows, recencyById) {
  let newest = recencyById.get(org.data.id) ?? '';
  for (const row of catalogRawRows) {
    if (!providers.has(row.provider) || !row.entry_id) continue;
    const d = recencyById.get(row.entry_id);
    if (d && d > newest) newest = d;
  }
  return newest;
}

/**
 * The board's N rows for the home Frontier door (F-hier-2 decline: a fixed
 * two-column excerpt, not a board fragment), resolved but NOT rendered.
 *
 * RD-002 fix 3 / K26 (keeper, CONFIRMED): ordered by MOST RECENT CHANGE, not
 * by `display_name`. RT FM3 measured the defect this replaces: the door read
 * `orgs.slice(0, 3)` off a list sorted `display_name.localeCompare`, so it
 * showed Alibaba Cloud / Anthropic / Cohere today and would show the same
 * three every day the org list was unchanged, whatever the tracked feeds
 * actually moved on. Orgs with no dated change at all sort last, in their
 * existing A–Z order (`Array.prototype.sort` is stable) — an absence of
 * recency is not a claim of recency.
 */
export function boardExcerpt(orgs, catalogRawRows, site, limit = 3) {
  const recencyById = changeRecencyByEntryId(site);
  const ranked = orgs
    .map((org) => {
      const providers = matchProviders(org, catalogRawRows);
      return { org, providers, when: orgRecency(org, providers, catalogRawRows, recencyById) };
    })
    .sort((a, b) => (a.when === b.when ? 0 : a.when > b.when ? -1 : 1));

  return ranked.slice(0, limit).map(({ org, providers, when }) => {
    const row = newestRow(providers, catalogRawRows);
    const modelDoc = row?.entry_id ? site.corpus.byId.get(row.entry_id) : null;
    return { org, row, modelDoc, when };
  });
}

/** How many organisations matched at least one provider — for the report, not the page. */
export function boardCoverage(orgs, catalogRawRows) {
  const matchedProviders = new Set();
  let orgsWithRow = 0;
  for (const org of orgs) {
    const providers = matchProviders(org, catalogRawRows);
    if (providers.size > 0) orgsWithRow += 1;
    for (const p of providers) matchedProviders.add(p);
  }
  const allProviders = new Set(catalogRawRows.map((r) => r.provider).filter(Boolean));
  const unmatchedProviders = [...allProviders].filter((p) => !matchedProviders.has(p));
  return {
    orgsTotal: orgs.length,
    orgsWithRow,
    orgsWithoutRow: orgs.length - orgsWithRow,
    providersTotal: allProviders.size,
    providersMatched: matchedProviders.size,
    unmatchedProviders,
  };
}

/** The lead-change strip. `data/changes.jsonl` carries no `lead-change` kind yet (RT-CP-UI-001-2-1 ground truth). */
export function renderLeadChangeStrip(changeLines) {
  const leadChanges = (changeLines ?? []).filter((l) => l.kind === 'lead-change');
  return el(
    'section',
    { class: 'section frontier-strip', 'aria-labelledby': 'lead-changes' },
    el('h2', { class: 'section-title', id: 'lead-changes' }, 'Last recorded lead change'),
    leadChanges.length === 0
      ? notice('No lead change recorded yet.', 'info', { name: 'empty-lead-change' })
      : el(
          'ul',
          { class: 'strip', 'data-derived': 'frontier-leadchange' },
          leadChanges
            .slice(0, 5)
            .map((l) => el('li', { class: 'strip-item' }, date(l.date), ' ', escapeHtml(l.detail ?? l.title ?? '')))
            .join(''),
        ),
  );
}

const PROOF_KIND = { delta: 'became routine', tutorial: 'proven by execution', post: 'reported' };

/** The capabilities rail: every delta, every listed tutorial, every post — newest first (frontier-plan §11.3). */
export function renderCapabilities(site, opts = {}) {
  const limit = opts.limit ?? 8;
  const items = [];
  for (const d of site.deltas ?? []) {
    items.push({ kind: 'delta', date: d.routine.date, title: d.title, url: d.url });
  }
  for (const t of site.tutorials ?? []) {
    if (t.state.listed) items.push({ kind: 'tutorial', date: t.state.verified_on, title: t.doc.data.title, url: t.doc.url });
  }
  for (const p of site.posts ?? []) {
    items.push({ kind: 'post', date: p.data.date, title: p.data.title, url: p.url });
  }
  items.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
  const shown = items.slice(0, limit);
  return el(
    'section',
    { class: 'section frontier-capabilities', 'aria-labelledby': 'capabilities' },
    el('h2', { class: 'section-title', id: 'capabilities' }, 'Newest proofs'),
    shown.length === 0
      ? notice('Nothing dated in this window.', 'info', { name: 'empty-capabilities' })
      : el(
          'ol',
          { class: 'rail', 'data-derived': 'frontier-capabilities' },
          shown
            .map((it) =>
              el(
                'li',
                { class: 'rail-item', 'data-kind': it.kind },
                date(it.date, { class: 'rail-date' }),
                el(
                  'div',
                  { class: 'rail-body' },
                  el('span', { class: 'badge', 'data-tone': null }, PROOF_KIND[it.kind]),
                  ' ',
                  link(it.url, it.title, { class: 'change-name' }),
                ),
              ),
            )
            .join(''),
        ),
  );
}
