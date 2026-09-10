/**
 * lineage.mjs — measurement lineage for wisdom item 5 (machine half) and the
 * corroboration question for the reader half.
 *
 * The class this round exists for is one thing with two forms: an independence
 * claim with no lineage behind it. In the machine form a measurement carries no
 * producer, input digest or method, so a second computation over the same bytes
 * under a new method name reads as corroboration. In the reader form two
 * findings sharing one instrument are called corroboration instead of
 * agreement.
 *
 * What makes a digest valid, with the reason named per digest. A digest is
 * valid when it has the form of bytes (short or full hex, 4-40 chars) AND a
 * resolver is stated AND that resolver resolves it. Form without bytes refuses:
 * `03e2207` is well-formed hex that resolves to nothing (banked: `git
 * cat-file -t 03e2207` answers `fatal: Not a valid object name 03e2207`), so a
 * claim carrying it is refused with code `digest-unresolvable`. Bytes without a
 * stated resolver refuse for the different reason: a digest nobody says how to
 * resolve is a path masquerading as a digest, refused with code
 * `lineage-resolver-missing` even if the bytes exist somewhere. Never one rule
 * with two compliant readings: the codes and the reasons differ because the
 * defects differ. The brief words the two valid shapes as an OR (a resolvable
 * object id, short or full, via the stated resolver, OR a 40-hex content hash
 * with a resolver check); the two wordings overlap, since every full object id
 * IS 40-hex, so this module implements the single check both wordings end at —
 * form plus stated resolver plus resolution — and keeps the per-digest refusal
 * reasons the brief requires.
 *
 * Why the downgrade records instead of deleting. `classifyClaim` never throws
 * away the earlier record: a second claim over the same (producer, digest)
 * pair returns `{ independent: false, consistencyOf }` AND is itself appended
 * to the store, so both records stay present. Consistency is information — the
 * second run reproduced the first — and deleting it destroys the reproduction
 * record. Refused-as-independent plus recorded-as-consistency is the honest
 * form; silent acceptance invents corroboration and silent deletion invents a
 * single clean run, and those are the two defects.
 *
 * Why the reader half cannot live in the linter. Whether two derivations share
 * an instrument — same helper, same fixture, same derivation path — is a
 * judgment about derivation paths, and the one measured attempt at mechanising
 * it false-fired on legitimate shared fixtures: the 3/112-vs-10/111
 * agreement-on-zero pair (timeline-note-07) shares fields and patterns yet
 * agrees only on zero for different reasons. A regex cannot see that, so this
 * half is a reader question plus a disposition rule, committed below as prompt
 * text and wired into `assembleReviewBrief`, not a pattern.
 *
 * Why strictness here cannot false-fire on reworded methods the way a
 * name-blocklist would. The check compares (producer, digest) pairs and never
 * method-name strings: renaming a method changes nothing (same pair, still
 * consistency) and copying a pipeline under a fresh producer changes everything
 * (different pair, independent). The constructed two-method-names arm proves
 * the first half; the Luna-47 mirror proves the check judges lineage, never
 * value.
 *
 * Source snapshot (the README's fourth field) is narrowed out here with the
 * reason stated: lineage answers which computation ran over which bytes, which
 * is enough to judge independence and to re-check the bytes; which source the
 * bytes came from is provenance, and that half belongs to item 6.
 */

import { spawnSync } from 'node:child_process';

/** The resolver name production claims state: git object resolution. */
export const LINEAGE_RESOLVER_GIT = 'git-cat-file';

/**
 * The reader question (item 5b), quoted from the brief. Wired into
 * `assembleReviewBrief` in `loop/lib/review.mjs` via `corroborationSection()`,
 * so every sealed review carries it verbatim.
 */
export const CORROBORATION_QUESTION =
  'do these two findings share an instrument — same helper, same fixture, same derivation path — and if so, what besides agreement do they add?';

/**
 * The disposition rule answering the question. Shared instrument is recorded
 * as agreement, never as corroboration; only different instruments
 * corroborate.
 */
export const CORROBORATION_DISPOSITION =
  'shared instrument is recorded as agreement, never as corroboration; only different instruments corroborate.';

/**
 * The review-brief section carrying both sentences. One function, so the
 * prompt text has one definition: the brief template and the tests read it
 * from here rather than retyping it, for the reason every shared prompt
 * fragment in this repository is read rather than retyped.
 */
export function corroborationSection() {
  return (
    '## Corroboration or agreement — ask this of every pair of findings\n' +
    '\n' +
    `${CORROBORATION_QUESTION}\n` +
    '\n' +
    `${CORROBORATION_DISPOSITION}\n`
  );
}

/**
 * Digest form: short-or-full hex, 4 to 40 chars. Four is git's minimum short
 * id; forty is a full sha. Anything else is not the form of bytes at all.
 */
export function validateDigestForm(digest) {
  if (typeof digest !== 'string' || !/^[0-9a-fA-F]{4,40}$/.test(digest)) {
    return {
      ok: false,
      reason:
        `refused: input digest ${JSON.stringify(digest)} is not short-or-full ` +
        'hex (4-40 chars) — form without bytes refuses',
    };
  }
  return { ok: true };
}

/**
 * Resolve a digest through git in the given tree. Returns the object kind and
 * the full id the short form aliases, so no caller depends on alias length.
 */
export function gitResolveDigest(digest, { repoRoot } = {}) {
  const typeRun = spawnSync('git', ['cat-file', '-t', String(digest)], {
    cwd: repoRoot ?? process.cwd(),
    encoding: 'utf8',
  });
  if (typeRun.status !== 0) {
    return { ok: false, output: String(typeRun.stderr ?? '').trim() };
  }
  const fullRun = spawnSync('git', ['rev-parse', '--verify', String(digest)], {
    cwd: repoRoot ?? process.cwd(),
    encoding: 'utf8',
  });
  return {
    ok: true,
    kind: String(typeRun.stdout ?? '').trim(),
    full:
      fullRun.status === 0 ? String(fullRun.stdout ?? '').trim() : String(digest),
  };
}

/**
 * A measurement store: the earlier records later claims are judged against.
 * `resolve(digest, resolverName)` answers `{ ok, kind?, full?, output? }` and
 * is injected so tests observe the banked resolver behaviour without depending
 * on live tree state; production passes `gitResolveDigest` bound to its tree.
 */
export function createLineageStore({ resolve, resolver = LINEAGE_RESOLVER_GIT } = {}) {
  return {
    records: [],
    seq: 0,
    resolver,
    resolve:
      resolve ??
      ((digest, name) => gitResolveDigest(digest, { repoRoot: process.cwd(), resolverName: name })),
  };
}

function tripleOf(claim) {
  if (claim && typeof claim === 'object' && claim.lineage && typeof claim.lineage === 'object') {
    return claim.lineage;
  }
  return claim ?? {};
}

/**
 * Check one lineage triple: required fields, stated resolver, form, then
 * resolution. Returns `{ ok, producer, digest, method, resolver, full? }`
 * where a refusal names its reason and its code.
 */
function checkTriple(store, triple) {
  if (!triple || typeof triple !== 'object') {
    return {
      ok: false,
      code: 'lineage-missing',
      reason:
        'refused: measurement recorded without lineage — no producer, input ' +
        'digest or method to judge independence against',
    };
  }
  const { producer, digest, method, resolver } = triple;
  if (typeof producer !== 'string' || !producer.trim()) {
    return {
      ok: false,
      code: 'lineage-producer-missing',
      reason:
        'refused: no producer named — lineage is producer, input digest and ' +
        'method, all required, none defaulted',
    };
  }
  if (typeof method !== 'string' || !method.trim()) {
    return {
      ok: false,
      code: 'lineage-method-missing',
      reason:
        'refused: no method named — lineage is producer, input digest and ' +
        'method, all required, none defaulted',
    };
  }
  if (digest === undefined || digest === null || digest === '') {
    return {
      ok: false,
      code: 'lineage-digest-missing',
      reason:
        'refused: no input digest carried — form without bytes refuses, and ' +
        'there is no form here at all',
    };
  }
  if (typeof resolver !== 'string' || !resolver.trim()) {
    return {
      ok: false,
      code: 'lineage-resolver-missing',
      reason:
        `refused: bytes without a stated resolver — ${JSON.stringify(digest)} ` +
        'may name bytes somewhere, but with no resolver named the resolver is ' +
        'assumed, and an assumed resolver is a path masquerading as a digest',
    };
  }
  const form = validateDigestForm(digest);
  if (!form.ok) {
    return { ok: false, code: 'digest-malformed', reason: form.reason };
  }
  let verdict;
  try {
    verdict = store.resolve(String(digest), String(resolver));
  } catch (err) {
    return {
      ok: false,
      code: 'digest-unresolvable',
      reason:
        `refused: input digest ${digest} cannot be resolved via ${resolver} ` +
        `(the resolver itself failed: ${err?.message ?? err}) — form without bytes`,
    };
  }
  if (!verdict || verdict.ok !== true) {
    const output = verdict?.output ? ` (${verdict.output})` : '';
    return {
      ok: false,
      code: 'digest-unresolvable',
      reason:
        `refused: input digest ${digest} resolves to nothing via ${resolver}` +
        `${output} — form without bytes, cf. banked 03e2207`,
    };
  }
  return {
    ok: true,
    producer: String(producer),
    digest: String(verdict.full ?? digest).toLowerCase(),
    digestAsStated: String(digest),
    method: String(method),
    resolver: String(resolver),
    kind: verdict.kind,
  };
}

/**
 * Attach lineage to a measurement. Validates and resolves the digest, appends
 * the record, and returns its id. A claim whose digest is malformed or
 * unresolvable is refused outright with the reason named.
 */
export function recordMeasurement(store, { producer, digest, method, resolver, value } = {}) {
  const checked = checkTriple(store, {
    producer,
    digest,
    method,
    resolver: resolver ?? store.resolver,
  });
  if (!checked.ok) return checked;
  const id = `m-${store.seq + 1}`;
  store.seq += 1;
  store.records.push({
    id,
    producer: checked.producer,
    digest: checked.digest,
    digestAsStated: checked.digestAsStated,
    method: checked.method,
    resolver: checked.resolver,
    kind: checked.kind,
    value,
  });
  return {
    ok: true,
    id,
    lineage: {
      producer: checked.producer,
      digest: checked.digest,
      method: checked.method,
      resolver: checked.resolver,
    },
  };
}

/**
 * Judge an independence claim against the store. Independence is a relation
 * between two lineages, never a property of one claim: a different producer
 * OR a different input digest means independent; the same producer AND the
 * same input digest means consistency, whatever the method names say, and a
 * claim marked independent over a matching pair is refused as independent and
 * recorded as consistency. The new claim is always appended on success — both
 * records stay present, nothing is deleted. A claim whose lineage is absent,
 * malformed or unresolvable is refused outright with the reason named.
 */
export function classifyClaim(store, claim = {}) {
  const triple = tripleOf(claim);
  if (
    !triple ||
    typeof triple !== 'object' ||
    !triple.producer ||
    !triple.digest ||
    !triple.method
  ) {
    return {
      ok: false,
      code: 'lineage-missing',
      reason:
        'refused: measurement recorded without lineage, then claimed ' +
        'independent — there is no producer, input digest or method to judge ' +
        'the claim against, so the wire from writer to check ends here',
    };
  }
  const checked = checkTriple(store, {
    producer: triple.producer,
    digest: triple.digest,
    method: triple.method,
    resolver: triple.resolver ?? store.resolver,
  });
  if (!checked.ok) return checked;
  const earlier = store.records.find(
    (r) => r.producer === checked.producer && r.digest === checked.digest,
  );
  const id = `m-${store.seq + 1}`;
  store.seq += 1;
  store.records.push({
    id,
    producer: checked.producer,
    digest: checked.digest,
    digestAsStated: checked.digestAsStated,
    method: checked.method,
    resolver: checked.resolver,
    kind: checked.kind,
    value: claim?.value,
    claimedIndependent: Boolean(claim?.claimedIndependent),
  });
  if (earlier) {
    return {
      ok: true,
      independent: false,
      consistencyOf: earlier.id,
      id,
      reason:
        `refused as independent: same producer (${checked.producer}) AND same ` +
        `input digest (${checked.digest}) as ${earlier.id} — recorded as ` +
        `consistency instead; method names (${earlier.method} vs ` +
        `${checked.method}) never confer independence`,
    };
  }
  return { ok: true, independent: true, id };
}

/**
 * The reader-half disposition (item 5b) as a value, for the twin arm and for
 * any future prompt seam that must answer the same question. Shared instrument
 * is recorded as agreement, never as corroboration; only different instruments
 * corroborate. A non-boolean `sharedInstrument` throws: an unanswered question
 * must not default its way to corroboration.
 */
export function recordCorroboration({ sharedInstrument, detail = '' } = {}) {
  if (typeof sharedInstrument !== 'boolean') {
    throw new Error(
      'recordCorroboration: sharedInstrument must be a boolean — an unjudged ' +
        'pair defaults to nothing, never to corroboration',
    );
  }
  const suffix = detail ? ` (${detail})` : '';
  if (sharedInstrument) {
    return {
      record: 'agreement',
      reason: `shared instrument${suffix} — recorded as agreement, never as corroboration`,
    };
  }
  return {
    record: 'corroboration',
    reason: `different instruments${suffix} — corroboration`,
  };
}
