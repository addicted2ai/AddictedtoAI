/**
 * vendor-domain.test.mjs — the registrable-domain rule, and the two rejected
 * rules asserted WRONG.
 *
 * The worked cases below are the round-5 addendum's own, because they are the
 * ones two previous implementations got wrong on the shipped surface. Two of
 * the tests do not check this module at all: they re-implement the rules this
 * module replaced and assert that each gets a case wrong that
 * `registrableDomain` gets right. A rejected rule with no test is a rule the
 * next implementer re-derives as a simplification.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  registrableDomain,
  registrableDomainOfUrl,
  hostOf,
  nameTokens,
  declaredDomains,
  recordedDomains,
  isSubjectOwned,
  checkPublishesFromValue,
  GENERIC_NAME_TOKENS,
} from './vendor-domain.mjs';

/* ------------------------------------------------------------------ *
 * registrableDomain — the worked cases from the round-5 addendum
 * ------------------------------------------------------------------ */

test('www.tencent.com reduces to tencent.com', () => {
  assert.deepEqual(registrableDomain('www.tencent.com'), {
    domain: 'tencent.com',
    label: 'tencent',
  });
});

test('deepmind.google is its own registrable domain — .google is a single-label brand TLD', () => {
  assert.deepEqual(registrableDomain('deepmind.google'), {
    domain: 'deepmind.google',
    label: 'deepmind',
  });
});

test('blog.google is a DIFFERENT registrable domain from deepmind.google, and is not google.com', () => {
  const blog = registrableDomain('blog.google');
  assert.deepEqual(blog, { domain: 'blog.google', label: 'blog' });
  assert.notEqual(blog.domain, registrableDomain('deepmind.google').domain);
  assert.notEqual(blog.domain, 'google.com');
});

test('google.attacker.example belongs to attacker.example — the leftmost label owns nothing', () => {
  assert.deepEqual(registrableDomain('google.attacker.example'), {
    domain: 'attacker.example',
    label: 'attacker',
  });
});

test('the FM-N5 spoof host tencent.com.attacker.example is attacker.example', () => {
  assert.equal(registrableDomain('tencent.com.attacker.example').domain, 'attacker.example');
});

test('a multi-label suffix keeps two labels: vendor.co.uk, not co.uk', () => {
  assert.deepEqual(registrableDomain('news.vendor.co.uk'), {
    domain: 'vendor.co.uk',
    label: 'vendor',
  });
  // Two tenants of one private suffix are two registrants, never one party.
  assert.notEqual(
    registrableDomain('vendor.github.io').domain,
    registrableDomain('attacker.github.io').domain,
  );
});

test('a bare public suffix has no registrable domain', () => {
  assert.equal(registrableDomain('com'), null);
  assert.equal(registrableDomain('co.uk'), null);
  assert.equal(registrableDomain(''), null);
  assert.equal(registrableDomain(undefined), null);
});

/* ------------------------------------------------------------------ *
 * THE TWO REJECTED RULES, ASSERTED WRONG (specs/wiki; red-team FM-N5)
 * ------------------------------------------------------------------ */

test('REJECTED RULE 1 — label identity clears google.<anyone-else>; the registrable rule refuses it', () => {
  // The round-4 form: "is any dot-separated label of the host one of the
  // subject's name tokens", with no notion of position or ownership.
  const labelIdentity = (host, token) => String(host).split('.').includes(token);

  assert.equal(
    labelIdentity('google.attacker.example', 'google'),
    true,
    'the rejected rule admits the spoof — this is the defect, asserted so it cannot be re-derived as a simplification',
  );
  assert.equal(
    registrableDomain('google.attacker.example').label,
    'attacker',
    'the correct rule reads ownership off the one label the registrant bought',
  );
  assert.equal(
    isSubjectOwned('google.attacker.example', {
      display_name: 'Google DeepMind',
      aliases: [{ name: 'DeepMind', class: 'exclusive' }],
    }),
    false,
  );
});

test('REJECTED RULE 2 — endsWith("." + recorded) clears the FM-N5 spoof; the registrable rule refuses it', () => {
  const endsWithRule = (host, recorded) =>
    String(host) === recorded || String(host).endsWith(`.${recorded}`);

  // The spoof is built the other way round: the recorded domain becomes a
  // PREFIX of the attacker's host, so `endsWith` is the wrong test for
  // `vendor.com.attacker.example` and the right-looking test for
  // `x.vendor.com`. One formula cannot tell them apart; eTLD+1 always can.
  assert.equal(endsWithRule('evil.tencent.com.co', 'tencent.com.co'), true);
  assert.equal(
    registrableDomain('evil.tencent.com.co').domain,
    'com.co',
    'the correct rule stops at the registrable domain, whoever bought it',
  );
  assert.equal(endsWithRule('tencent.com.attacker.example', 'tencent.com'), false);
  assert.equal(
    isSubjectOwned('tencent.com.attacker.example', {
      display_name: 'Tencent',
      aliases: [{ name: 'Tencent', class: 'exclusive' }],
    }),
    false,
    'the shipped spoof case (S22 clause (e), break e-vi) refuses on the registrable domain alone',
  );
});

/* ------------------------------------------------------------------ *
 * hosts are parsed, never pattern-matched (FM-N7)
 * ------------------------------------------------------------------ */

test('userinfo and ports do not move the host — new URL().hostname, never a regex', () => {
  assert.equal(hostOf('https://vendor.com@attacker.example/post'), 'attacker.example');
  assert.equal(hostOf('https://vendor.com:8443/post'), 'vendor.com');
  assert.equal(hostOf('https://WWW.Vendor.COM/post'), 'vendor.com');
  assert.equal(hostOf('not a url'), null);
  assert.equal(registrableDomainOfUrl('https://deepmind.google/discover/x').domain, 'deepmind.google');
});

/* ------------------------------------------------------------------ *
 * name tokens, and the generic-corporate exclusion (delta D3)
 * ------------------------------------------------------------------ */

test('generic corporate words are not name tokens — labs.com is not Inception Labs', () => {
  const org = {
    display_name: 'Inception Labs',
    aliases: [{ name: 'Inception Labs', class: 'exclusive' }],
  };
  const tokens = nameTokens(org);
  assert.ok(tokens.has('inception'));
  assert.ok(tokens.has('inceptionlabs'));
  assert.ok(!tokens.has('labs'), 'labs is a generic corporate word, not an identity');
  assert.equal(isSubjectOwned('labs.com', org), false);
  assert.equal(isSubjectOwned('www.inceptionlabs.ai', org), true);
});

test('every word of the generic family is excluded, "research" and "ai" included', () => {
  for (const word of ['ai', 'labs', 'lab', 'cloud', 'inc', 'corp', 'research', 'group', 'technologies']) {
    assert.ok(GENERIC_NAME_TOKENS.has(word), `${word} must be excluded from name tokens`);
  }
  const org = { display_name: 'Example Research', aliases: [{ name: 'Example Research', class: 'exclusive' }] };
  assert.equal(isSubjectOwned('research.example', org), false);
});

test('a token matches the ONE ownership label, never any other label of the host', () => {
  const org = { display_name: 'Tencent', aliases: [{ name: 'Tencent', class: 'exclusive' }] };
  assert.equal(isSubjectOwned('www.tencent.com', org), true);
  assert.equal(isSubjectOwned('tencent.attacker.example', org), false);
  assert.equal(isSubjectOwned('cdn.assets.tencent.com', org), true);
});

/* ------------------------------------------------------------------ *
 * the three admission paths (task 16: a test per branch, and a third party)
 * ------------------------------------------------------------------ */

const moonshot = {
  display_name: 'Moonshot AI',
  aliases: [{ name: 'Moonshot AI', class: 'exclusive' }],
  publishes_from: ['kimi.ai'],
  facts: [
    {
      field: 'founded',
      source: 'cited',
      value: '2023',
      source_url: 'https://en.wikipedia.org/wiki/Moonshot_AI',
      accessed: '2026-09-05',
      volatility: 'static',
    },
    {
      field: 'flagship',
      source: 'cited',
      value: 'Kimi K2',
      source_url: 'https://blog.moonshot.cn/k2',
      accessed: '2026-09-05',
      volatility: 'slow',
    },
  ],
  timeline: [],
};

test('branch 1 — a DECLARED brand domain makes a real claim visible (publishes_from)', () => {
  assert.deepEqual([...declaredDomains(moonshot)], ['kimi.ai']);
  assert.equal(isSubjectOwned('platform.kimi.ai', moonshot), true);
  // Without the declaration the same record is a blank indistinguishable from
  // having no claim at all — FM-N6, and no gate can detect it.
  const undeclared = { ...moonshot, publishes_from: [] };
  assert.equal(isSubjectOwned('platform.kimi.ai', undeclared), false);
});

test('branch 2 — a domain the entry RECORDS CITING ITSELF FROM, wikipedia excluded by the filter', () => {
  const recorded = recordedDomains(moonshot);
  assert.ok(recorded.has('moonshot.cn'), 'its own blog is a domain it records citing itself from');
  assert.ok(
    !recorded.has('wikipedia.org'),
    'all thirteen founded facts in this corpus cite en.wikipedia.org; the name-token filter is what keeps an encyclopaedia out of the vendor half',
  );
  assert.equal(isSubjectOwned('blog.moonshot.cn', moonshot), true);
  assert.equal(isSubjectOwned('en.wikipedia.org', moonshot), false);
});

test('branch 2 is a strict SUBSET of branch 3, and is kept for fidelity with R13 (v) and S22(e)', () => {
  // Recorded domains are kept only where `label ∈ nameTokens`, which is the
  // same predicate branch 3 tests — so branch 2 can never admit a host branch 3
  // would refuse. Asserted rather than assumed: if branch 3 is ever narrowed,
  // this test fails and branch 2 starts doing work, which is exactly when a
  // reader needs to be told it exists (finding j-20260905-22-carry-3).
  const tokens = nameTokens(moonshot);
  for (const domain of recordedDomains(moonshot)) {
    const label = registrableDomain(domain).label;
    assert.ok(
      tokens.has(label),
      `${domain} is admitted by the recorded half only because its label is already a name token`,
    );
  }
});

test('branch 3 — the registrable LABEL is one of the subject name tokens', () => {
  const google = {
    display_name: 'Google DeepMind',
    aliases: [{ name: 'DeepMind', class: 'exclusive' }],
    facts: [],
    timeline: [],
  };
  assert.equal(isSubjectOwned('deepmind.google', google), true);
  // A brand TLD is not a subdomain: `blog.google`'s ownership label is `blog`,
  // which names nobody, so it is a different registrant from `deepmind.google`
  // even though both end in `.google` — the case an `endsWith` rule cannot see.
  assert.equal(isSubjectOwned('blog.google', google), false);
  // MEASURED, not assumed: `google.com` DOES pass, on the name-token branch —
  // its ownership label is `google`, a name token of "Google DeepMind", and
  // Google is who bought it. The delta's "neither is `google.com`" is about the
  // eTLD+1 reduction of `blog.google`, not about who owns `google.com`.
  assert.equal(isSubjectOwned('www.google.com', google), true);
  // The spoof from the same family still fails: `attacker` bought it.
  assert.equal(isSubjectOwned('google.attacker.example', google), false);
});

test('a third party matches no branch, whatever the field is called', () => {
  for (const host of ['openrouter.ai', 'llm-releases.com', 'huggingface.co', 'venturebeat.com', 'en.wikipedia.org']) {
    assert.equal(
      isSubjectOwned(host, moonshot),
      false,
      `${host} is a third party: whoever republishes a vendor's number, the number they publish is theirs`,
    );
  }
});

/* ------------------------------------------------------------------ *
 * the publishes_from build gate (task 15)
 * ------------------------------------------------------------------ */

test('publishes_from must be declared at the registrable level', () => {
  assert.deepEqual(checkPublishesFromValue('kimi.ai'), { ok: true });
  assert.deepEqual(checkPublishesFromValue('deepmind.google'), { ok: true });
  assert.deepEqual(checkPublishesFromValue('vendor.co.uk'), { ok: true });
  assert.deepEqual(checkPublishesFromValue('platform.kimi.ai'), { ok: false, reduction: 'kimi.ai' });
  assert.deepEqual(checkPublishesFromValue('com'), { ok: false, reduction: null });
});
