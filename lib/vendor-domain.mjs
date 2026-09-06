/**
 * vendor-domain.mjs — the registrable-domain rule, and the one place that
 * decides whether a source belongs to the party a surface is about.
 *
 * `separate-a-claim-from-a-fact`, specs/wiki: *"This rule SHALL be stated once
 * in the source tree and duplicated nowhere, with the multi-label suffix table
 * beside it."* Precedent for the shape is `lib/tool-categories.mjs` (beads
 * `addictedtoai-bju`): a closed list split out so a second consumer could read
 * it without a second copy. Nothing else in `lib/`, `pulse/` or `scripts/` may
 * declare a public-suffix table or a name-token rule; import from here.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS: A NAME TEST IS NOT A SOURCE TEST.
 *
 * The same defect has been built four times on this surface. A column labelled
 * "what the vendor says about itself" was wired to whatever the corpus offered:
 *
 *   - the entry's FIRST CITED FACT — founding dates and founders rendered as
 *     "claimed · unverified", twice, independently (implementer ledger rows 2
 *     and 4). All thirteen `founded` facts in this corpus cite
 *     `en.wikipedia.org`, so what shipped was an encyclopaedia's account of an
 *     incorporation presented as a company's own words;
 *   - a TIER-2 FIELD-NAME ALLOW-LIST — OpenRouter's rolling median of live
 *     traffic (`observed_throughput_p50`) and an llm-releases.com analysis
 *     admitted as vendor claims (ledger row 10, red-team FM-N3). A field-name
 *     test standing in for a source test;
 *   - a LABEL-IDENTITY test — "is any dot-separated label of the host one of
 *     the subject's names" — which clears `google.attacker.example` for Google
 *     DeepMind exactly as it clears `deepmind.google` (FM-N5);
 *   - an `endsWith('.' + recorded)` test, the same hole from the other side:
 *     `tencent.com.attacker.example` ends with nothing the rule refuses.
 *
 * Ownership can be read from ONE label only — the one the registrant actually
 * bought, immediately left of the public suffix. Every function below consults
 * that label and no other.
 * ---------------------------------------------------------------------------
 */

/**
 * Public suffixes that are TWO labels long. Everything else is treated as a
 * single-label suffix, which is right for `.com`, `.ai`, `.dev` and for the
 * brand TLDs this corpus actually cites (`.google`, `.blog`).
 *
 * Kept short and explicit on purpose, and the error direction is safe in one
 * direction only: a MISSING entry can only make the test STRICTER for the
 * party it concerns — a shorter suffix means a registrable domain that
 * includes one more owned label — and a WRONG entry only ever splits one party
 * into several, never merges two into one. So no addition to this list can
 * admit a host that would otherwise have been refused.
 */
export const MULTI_LABEL_SUFFIXES = Object.freeze(
  new Set([
    'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'co.jp', 'co.kr', 'co.in', 'co.za',
    'co.nz', 'com.au', 'com.br', 'com.cn', 'net.cn', 'org.cn', 'gov.cn',
    'edu.cn', 'com.hk', 'com.tw', 'com.sg', 'com.mx', 'com.tr',
    // Private-section suffixes: every sub-label is a different registrant, so
    // `vendor.github.io` and `attacker.github.io` must not read as one party.
    'github.io', 'pages.dev', 'vercel.app', 'netlify.app', 'workers.dev',
    'blogspot.com', 'substack.com', 'notion.site', 'medium.com',
  ]),
);

/**
 * Generic company words that are not an organisation's identifying name.
 *
 * Not optional and not decoration (delta D3). Without the exclusion
 * "Inception Labs" tokenises to `labs` and the test admits `labs.com`; "Ai2"
 * and every `… Research` name admit `research.example`. That is not a corner
 * case — it is a large fraction of this corpus admitting a stranger's domain,
 * FM-N5's lookalike hole re-opened one label over.
 */
export const GENERIC_NAME_TOKENS = Object.freeze(
  new Set([
    'ai', 'labs', 'lab', 'cloud', 'inc', 'corp', 'corporation', 'company',
    'group', 'foundation', 'pbc', 'ltd', 'llc', 'technologies', 'technology',
    'research', 'the', 'and', 'for', 'com', 'net', 'org', 'www',
  ]),
);

/** Shortest token that can identify anybody. Two letters name too much. */
const MIN_TOKEN = 3;

/** Lowercase and strip everything that is not a letter or a digit. */
function normName(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/^~/, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * The lowercased hostname of a URL, `www.` stripped, or `null`.
 *
 * `new URL().hostname`, never a regex over the authority: userinfo and ports
 * diverge otherwise, and `https://vendor.com@attacker.example/` is the shape
 * that exploits the difference (red-team FM-N7).
 */
export function hostOf(url) {
  try {
    return new URL(String(url)).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * The registrable domain (eTLD+1) of a host, and the ONE ownership label —
 * the string a registrant bought, immediately left of the public suffix.
 *
 * `null` when the host is a bare suffix with nothing registered under it.
 *
 *   `www.tencent.com`          -> { domain: 'tencent.com',    label: 'tencent' }
 *   `deepmind.google`          -> { domain: 'deepmind.google', label: 'deepmind' }
 *   `blog.google`              -> { domain: 'blog.google',     label: 'blog' }
 *   `google.attacker.example`  -> { domain: 'attacker.example', label: 'attacker' }
 *
 * @param {string} host
 * @returns {{domain: string, label: string} | null}
 */
export function registrableDomain(host) {
  const labels = String(host ?? '')
    .toLowerCase()
    .split('.')
    .filter(Boolean);
  const suffixLabels = MULTI_LABEL_SUFFIXES.has(labels.slice(-2).join('.')) ? 2 : 1;
  if (labels.length <= suffixLabels) return null;
  const label = labels[labels.length - suffixLabels - 1];
  return { domain: labels.slice(-(suffixLabels + 1)).join('.'), label };
}

/** The registrable domain of a URL, or `null`. */
export function registrableDomainOfUrl(url) {
  return registrableDomain(hostOf(url));
}

/**
 * An entry's identifying name tokens: the normalised whole names — its
 * `display_name` and its declared `aliases` — and their individual words,
 * minus the generic corporate family.
 *
 * @param {object} entryData an entry's validated front matter
 * @returns {Set<string>}
 */
export function nameTokens(entryData) {
  const names = [entryData?.display_name, ...(entryData?.aliases ?? []).map((a) => a?.name)];
  const tokens = new Set();
  for (const name of names) {
    // The WHOLE name is filtered too, which `lib/render/frontier.mjs` did not
    // do before this rule moved here. Measured 2026-09-06 over all 553 entries:
    // zero display names and zero aliases normalise to a generic token, so the
    // board's output is unchanged — but an org literally called "Labs" would
    // otherwise have admitted `labs.com` through the whole-name branch while
    // the word branch refused it, which is one rule disagreeing with itself.
    const whole = normName(name);
    if (whole.length >= MIN_TOKEN && !GENERIC_NAME_TOKENS.has(whole)) tokens.add(whole);
    for (const word of String(name ?? '').toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length >= MIN_TOKEN && !GENERIC_NAME_TOKENS.has(word)) tokens.add(word);
    }
  }
  return tokens;
}

/**
 * The registrable domains an entry DECLARES publishing from (`publishes_from`).
 *
 * Editorial and declared, never inferred: a product-brand domain — Moonshot's
 * `kimi.ai` — is not one of the org's name tokens and need not appear in any
 * source it is cited from, so nothing but a declaration can find it. Left
 * undeclared, a real vendor claim renders as an honest-looking blank (FM-N6),
 * and **no gate can detect the absence** — the blank is byte-identical to the
 * one a subject with no claims correctly produces.
 *
 * @returns {Set<string>}
 */
export function declaredDomains(entryData) {
  return new Set(
    (entryData?.publishes_from ?? [])
      .map((v) => String(v ?? '').toLowerCase())
      .filter(Boolean),
  );
}

/**
 * The registrable domains an entry RECORDS CITING ITSELF FROM — the domains of
 * its own `facts[].source_url` and `timeline[].source_url`, kept only where
 * the domain's own ownership label is one of the entry's name tokens.
 *
 * THE FILTER IS THE POINT, not a tightening of it. All thirteen `founded`
 * facts in this corpus cite `en.wikipedia.org`, so an UNFILTERED "records
 * citing itself from" admits an encyclopaedia as a vendor-owned domain — the
 * exact defect the claim record exists to end, re-entering through the test
 * written to catch it.
 *
 * INERT BY CONSTRUCTION, AND KEPT ANYWAY. Because the filter tests the same
 * predicate the third admission path tests (`label ∈ nameTokens`), this set can
 * never admit a domain that `isSubjectOwned`'s name-token branch would not
 * admit on its own — measured, and asserted in `vendor-domain.test.mjs`. It is
 * written out because R13 (v), `S22` clause (e) and the wiki delta all carry
 * both halves: a copy carrying one half reads as a correction of the others
 * rather than as an omission, and the next implementer "fixes" the gate back to
 * match it (finding `j-20260905-22-carry-3`). If the name-token branch is ever
 * narrowed, this half stops being a subset and starts doing work.
 *
 * @returns {Set<string>}
 */
export function recordedDomains(entryData) {
  const tokens = nameTokens(entryData);
  const domains = new Set();
  const cited = [...(entryData?.facts ?? []), ...(entryData?.timeline ?? [])];
  for (const item of cited) {
    const reg = registrableDomainOfUrl(item?.source_url);
    if (reg && reg.label.length >= MIN_TOKEN && tokens.has(reg.label)) domains.add(reg.domain);
  }
  return domains;
}

/**
 * THE ATTRIBUTION FUNCTION. Is this host the subject's own?
 *
 * Three admission paths and **nothing else** (specs/wiki, delta D2/D3):
 *
 *   1. the host's registrable domain is one the subject DECLARES publishing
 *      from (`publishes_from`);
 *   2. it is one the subject's own entry RECORDS CITING ITSELF FROM;
 *   3. its ownership LABEL is one of the subject's NAME TOKENS.
 *
 * Never `endsWith`, never a scan over the host's other labels, never a match
 * against a field's name. A claim failing this test is still a claim; it
 * renders attributed to whoever does own the domain, never to the subject.
 *
 * @param {string} host       a hostname, e.g. a claim record's `source_host`
 * @param {object} entryData  the subject entry's validated front matter
 * @returns {boolean}
 */
export function isSubjectOwned(host, entryData) {
  const reg = registrableDomain(host);
  if (!reg || !entryData) return false;
  if (declaredDomains(entryData).has(reg.domain)) return true;
  // A subdomain is covered by construction — `www.anthropic.com` and
  // `docs.anthropic.com` share one registrable domain — with no `endsWith`
  // test, which had FM-N5's shape from the other side.
  if (recordedDomains(entryData).has(reg.domain)) return true;
  return reg.label.length >= MIN_TOKEN && nameTokens(entryData).has(reg.label);
}

/** The same question asked of a URL rather than a host. */
export function isSubjectOwnedUrl(url, entryData) {
  return isSubjectOwned(hostOf(url), entryData);
}

/**
 * The build gate for a declared `publishes_from` value (specs/wiki): each value
 * must equal its own registrable-domain reduction, so the field is a statement
 * about a REGISTRANT rather than a list of URLs to keep current.
 *
 * @param {string} value
 * @returns {{ok: true} | {ok: false, reduction: string | null}}
 */
export function checkPublishesFromValue(value) {
  const raw = String(value ?? '').toLowerCase();
  const reg = registrableDomain(raw);
  if (!reg) return { ok: false, reduction: null };
  return reg.domain === raw ? { ok: true } : { ok: false, reduction: reg.domain };
}
