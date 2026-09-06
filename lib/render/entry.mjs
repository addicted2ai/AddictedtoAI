/**
 * render/entry.mjs — the wiki entry page (task 4.1, specs/wiki).
 *
 * Six regions, and the order is the argument the page makes: **what this is**
 * (identity), **what is true about it and who says so** (facts), **what
 * happened to it** (timeline), **what we have to say about it** (prose),
 * **what it references**, **where it appears**. A reader who stops after the
 * first two regions has still had the sourced record, which is the thing the
 * site is for.
 *
 * Everything perishable on this page is injected by the build and never
 * authored: the overdue marker on a stale cited fact, the as-of date on a
 * vanished feed row, and the dormant stamp all come from `renderFact` and
 * `dormantAsOf` in `facts.mjs`. There is no front-matter field an author can
 * set to suppress any of them.
 *
 * A stub — an entry with no prose body — renders every region it has data
 * for and no apology. specs/wiki: stubs "render a page from their data
 * (identity, facts, timeline, backlinks)", carry `noindex`, and stay out of
 * browse listings. The page does not tell the reader it is thin; it shows
 * what it knows.
 */

import { renderReferencedHere, renderAppearsIn } from '../mentions.mjs';
import { dormantAsOf } from '../facts.mjs';
// The registrable-domain rule, stated once (specs/wiki, `lib/vendor-domain.mjs`).
// This page is the one surface this change ships that renders claims, so it is
// the one that has to run the source test rather than assume it.
import { isSubjectOwned, registrableDomain } from '../vendor-domain.mjs';
import { el, join, link, extLink, date, badge, statusTone, eyebrow, escapeHtml, notice } from './common.mjs';

const KIND_LABELS = {
  model: 'model',
  org: 'organisation',
  tool: 'tool',
  concept: 'concept',
  technique: 'technique',
  benchmark: 'benchmark',
  dataset: 'dataset',
  hardware: 'hardware',
  paper: 'paper',
  event: 'event',
};

/** Field names are snake_case in the data; readers are not. */
export function fieldLabel(field) {
  return field.replace(/_/g, ' ');
}

/** Identity: name, kind, status, maintenance, aliases. */
export function renderIdentity(doc) {
  const d = doc.data;
  // `doc.currentStatus` (addictedtoai-ij4h): a stub's resolved feed status
  // when one binds, else the authored (reviewed) front-matter value — see
  // `build-content.mjs` where it is computed, and its header for why a stub
  // and a prose entry are answered differently. Falls back to raw front
  // matter for a doc built outside that pipeline (fixtures).
  const status = doc.currentStatus ?? d.status;
  const aliases = d.aliases.filter((a) => a.name !== d.display_name);
  return el(
    'header',
    { class: 'entry-head' },
    eyebrow(`${KIND_LABELS[d.kind] ?? d.kind} · ${d.id}`),
    el('h1', { class: 'entry-name' }, escapeHtml(d.display_name)),
    el(
      'p',
      { class: 'entry-meta' },
      badge(status, statusTone(status)),
      badge(d.maintenance, d.maintenance === 'dormant' ? 'ended' : null),
      (d.themes ?? []).map((t) => badge(t, 'theme')).join(''),
    ),
    aliases.length
      ? el(
          'p',
          { class: 'entry-aliases' },
          el('span', { class: 'label' }, 'Also called '),
          aliases
            .map((a) => el('span', { class: 'alias', 'data-class': a.class }, escapeHtml(a.name)))
            .join('<span class="sep">, </span>'),
        )
      : '',
  );
}

/**
 * Facts. `factsHtml` was rendered in the content build by `renderFact`, which
 * guarantees each one carries its source — so this function only lays them
 * out and must never construct a fact fragment of its own.
 */
export function renderFacts(doc) {
  const facts = doc.factsHtml ?? [];
  if (facts.length === 0) return '';
  return el(
    'section',
    { class: 'section entry-facts board-fragment', 'aria-labelledby': 'facts' },
    el('h2', { class: 'section-title', id: 'facts' }, 'Facts'),
    el(
      'dl',
      { class: 'facts' },
      facts
        .map((f) =>
          join(
            el('dt', { 'data-field': f.field }, escapeHtml(fieldLabel(f.field))),
            el('dd', { 'data-state': f.state }, f.html),
          ),
        )
        .join(''),
    ),
  );
}

/** Timeline: dated, sourced events, newest first. */
export function renderTimeline(doc) {
  const events = [...(doc.data.timeline ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  if (events.length === 0) return '';
  return el(
    'section',
    { class: 'section entry-timeline', 'aria-labelledby': 'timeline' },
    el('h2', { class: 'section-title', id: 'timeline' }, 'Timeline'),
    el(
      'ol',
      { class: 'rail' },
      events
        .map((ev) =>
          el(
            'li',
            { class: 'rail-item' },
            date(ev.date, { class: 'rail-date' }),
            el(
              'div',
              { class: 'rail-body' },
              el('span', { class: 'rail-text' }, escapeHtml(ev.event)),
              extLink(ev.source_url, 'source', { class: 'src' }),
            ),
          ),
        )
        .join(''),
    ),
  );
}

/**
 * WHAT THIS PARTY SAID ABOUT ITSELF — the claim records filed against this
 * entry (specs/wiki, `separate-a-claim-from-a-fact`).
 *
 * ATTRIBUTION RUNS THE VENDOR TEST, RECORD BY RECORD. A claim filed *against*
 * an entry is not thereby a claim *by* it: the record declares its subject, and
 * `subject` says who the claim is ABOUT, never who said it. Who said it is read
 * off the source — `isSubjectOwned(source_host, subject entry)` in
 * `lib/vendor-domain.mjs`, the one implementation of the registrable-domain
 * rule. Attributing every filed record to the subject's `display_name` would be
 * a SUBJECT test standing in for a source test, which is the same substitution
 * as the field-name test that admitted OpenRouter's rolling median of live
 * traffic as a vendor claim (implementer ledger row 10, red-team FM-N3) — the
 * defect this whole change exists to end, rebuilt inside the repair.
 *
 * So the records split into two lists with two headings. A claim that passes
 * the test is the subject's own words and renders under a heading that says so.
 * A claim that fails still validates and is still a claim (specs/wiki: *"it
 * renders attributed to whoever does own the domain, never to the subject"*):
 * it renders in the second list, attributed to the registrable domain of its
 * own source, under a heading that asserts nothing about the subject having
 * said it.
 *
 * READ FROM CLAIM RECORDS AND FROM NOWHERE ELSE. Never built out of the
 * entry's `facts`, whatever those facts are named and whatever their
 * `source_url` says: that substitution is the defect this section exists to
 * end, shipped twice by two builders who each wired "what this vendor says" to
 * the entry's first cited fact and printed thirteen founding dates —
 * every one of them cited from an encyclopaedia — under "claimed · unverified"
 * (implementer ledger rows 2 and 4).
 *
 * A subject with cited facts and no claim records renders NOTHING here. That
 * empty state is the honest one, it is computed (this function looks the
 * records up and finds none), and it is the state the corpus is in the day this
 * lands. It is not a hard-wired string: a fixture with one claim record makes
 * this same function render it, which is the test that separates an empty state
 * from a picture of one (ledger row 6).
 *
 * THE LABEL RIDES ON THE CLAIM, not on the heading (judge finding F-sys-3-1): a
 * heading scrolls away, is not read with the row, and does not travel when the
 * value is quoted, linked, or announced by a screen reader one item at a time.
 *
 * THE ATTRIBUTING PARTY RENDERS FIRST, before the fragment it attributes
 * (F-sys-5-1). Truncation happens at the end of a line box, so an attribution
 * appended after a quotation is elided before the words are. Here the party is
 * the first thing in the item and the quotation follows it, so a clamp eats the
 * quotation and never the name.
 *
 * THREE VERIFICATION STATES, THREE RENDERINGS, and absent renders none.
 * Collapsing absent into "not verified" asserts a check nobody did; collapsing
 * `false` into silence hides one that was done and failed.
 */
export function renderClaims(doc, site) {
  const id = doc?.data?.id;
  const claims = (site?.corpus?.claim ?? [])
    .filter((c) => c.data.subject === id)
    // Several claims may name one subject and field — a vendor repeating
    // itself, or two sources for one assertion. Newest first, by `accessed`;
    // the file path breaks a same-day tie so the order is stable across runs.
    .sort((a, b) => b.data.accessed.localeCompare(a.data.accessed) || a.file.localeCompare(b.file));
  if (claims.length === 0) return '';

  const own = [];
  const others = [];
  for (const c of claims) {
    (isSubjectOwned(c.data.source_host, doc.data) ? own : others).push(c);
  }

  return join(
    own.length
      ? renderClaimList(
          own,
          'claims',
          'What this party says about itself',
          () => doc.data.display_name,
        )
      : '',
    others.length
      ? renderClaimList(
          others,
          'claims-elsewhere',
          'What other parties say about it',
          claimAttribution,
        )
      : '',
  );
}

/**
 * The party a claim is attributed to when it is NOT the subject's own: the
 * registrable domain of the source it was read from — the string a registrant
 * actually bought, which is the only label ownership can be read off.
 *
 * Falls back to the raw `source_host` if the host has no registrable domain
 * (a bare public suffix). Never the subject's name, on any path.
 */
export function claimAttribution(claim) {
  const host = claim.data.source_host;
  return registrableDomain(host)?.domain ?? host;
}

/**
 * One `<ol>` of claim items under one heading. The heading id doubles as the
 * section's `aria-labelledby`, so the two lists need two ids — and they need
 * two headings, because the heading is what says whose words these are.
 *
 * `attributionOf` is passed in rather than read here so that neither list can
 * silently acquire the other's rule.
 */
function renderClaimList(claims, headingId, heading, attributionOf) {
  return el(
    'section',
    { class: `section entry-claims entry-${headingId}`, 'aria-labelledby': headingId },
    el('h2', { class: 'section-title', id: headingId }, heading),
    el(
      'ol',
      { class: 'claims' },
      claims
        .map((c) => {
          const d = c.data;
          return el(
            'li',
            { class: 'claim', id: `claim-${c.slug}`, 'data-field': d.field },
            el(
              'p',
              { class: 'claim-line' },
              // 1. the attributing party, first and whole
              el('span', { class: 'claim-src' }, escapeHtml(attributionOf(c))),
              // 2. the label, on the claim itself
              badge('claim', 'warn'),
              // 3. the fragment, which is what a clamp is allowed to eat
              el('q', { class: 'claim-quote' }, escapeHtml(d.quote)),
            ),
            el(
              'p',
              { class: 'claim-meta' },
              el('span', { class: 'claim-field' }, escapeHtml(fieldLabel(d.field))),
              extLink(d.source_url, d.source_host, { class: 'src' }),
              date(d.accessed, { class: 'claim-date' }),
              renderVerification(d.verified),
            ),
          );
        })
        .join(''),
    ),
  );
}

/**
 * The three states of `verified`, as three renderings.
 *
 * `undefined` is not `false` and neither is a confirmation. The absent case
 * returns the empty string deliberately — no element, no empty slot, nothing
 * that could be read as a negative finding about a claim nobody has checked.
 */
export function renderVerification(verified) {
  if (verified === undefined) return '';
  if (verified === false) return el('span', { class: 'claim-unverified' }, 'not verified');
  return el(
    'span',
    { class: 'claim-verified' },
    escapeHtml(`verified by ${verified.by}`),
    extLink(verified.url, 'evidence', { class: 'src' }),
    date(verified.date, { class: 'claim-verified-date' }),
  );
}

/** The dormant stamp — derived from the entry's own latest recorded date. */
export function renderDormantStamp(doc) {
  if (doc.data.maintenance !== 'dormant') return '';
  const asOf = dormantAsOf(doc.data);
  return notice(
    asOf
      ? `A record as of ${asOf}. No longer actively maintained.`
      : 'A record. No longer actively maintained.',
    'ended',
    { name: 'dormant' },
  );
}

/** The prose body, already rendered and alias-linked by the content build. */
export function renderBody(doc) {
  if (!doc.html) return '';
  return el('div', { class: 'prose' }, doc.html);
}

/**
 * The whole page body.
 *
 * CP-UI-001-2 (F-K12, RULES.md R13's round-2 addendum): FACTS no longer sits
 * inside a two-column `.entry-side` track beside prose. That grid existed
 * (I40, iter-09) to give FACTS somewhere to fill beside a much taller prose
 * column, and it never reached the 60% dead-track floor (R13/S18) on either
 * sampled entry (23-40%) — the lever available (relocate TIMELINE and RAILS
 * into the same column) was already spent. Retiring the second column
 * removes the question rather than continuing to under-answer it: FACTS
 * renders as a full-measure "board fragment" (still bound to --measure, so
 * it shares prose's own right edge — R10) directly after the prose body,
 * with TIMELINE and RAILS following in ordinary single-column flow. DOM
 * order is unchanged from before this round (identity, prose, facts,
 * timeline, rails) and is now also the PAINT order at every width — the old
 * `order`-based mobile reflow that moved FACTS ahead of PROSE is removed
 * with it, which is also what F-K12 requires ("the reader must meet the
 * subject ... BEFORE any facts table") and what the pre-existing CSS did not
 * yet honour below the 60rem breakpoint. See globals.css for the retired
 * grid rules and RULES.md R13's addendum for the invariant change.
 *
 * @param {object} doc   an entry doc from the site model
 * @param {object} site  { corpus, backlinks }
 */
export function renderEntryPage(doc, site) {
  return join(
    renderIdentity(doc),
    renderDormantStamp(doc),
    renderBody(doc),
    renderFacts(doc),
    // AFTER facts, deliberately. A claim is a thing somebody said; a fact is a
    // value the site records with a source. Putting the said-thing after the
    // recorded ones keeps the page's argument in order and keeps the two from
    // reading as one list — the adjacency that let a neighbouring provenance
    // column be misread as a claim's own attribution (F-sys-5-1).
    renderClaims(doc, site),
    renderTimeline(doc),
    el(
      'div',
      { class: 'rails' },
      renderReferencedHere(doc, site.corpus.byId),
      renderAppearsIn(doc.data.id, site.backlinks),
    ),
  );
}

/** The browse listing's row for one entry. Stubs never reach this. */
export function renderEntryRow(doc) {
  const d = doc.data;
  const status = doc.currentStatus ?? d.status; // see renderIdentity() above
  return el(
    'li',
    { class: 'browse-row', 'data-kind': d.kind, 'data-status': status },
    link(doc.url, d.display_name, { class: 'browse-name' }),
    el('span', { class: 'browse-kind' }, escapeHtml(d.kind)),
    badge(status, statusTone(status)),
  );
}
