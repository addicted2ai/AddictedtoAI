---
title: "Watch the OpenRouter model catalog change, with no key and no dependencies"
subjects:
  - tool/openrouter
verified_against:
  tool/openrouter: "/api/v1/models as served 2026-08-28, total_count 398"
verified_on: "2026-08-28"
reverify_days: 30
mentions:
  - tool/openrouter
---

`https://openrouter.ai/api/v1/models` returns every model the router sells,
unauthenticated, in one page, with `links.next` null. On the day this was
written that was 398 rows in 657,669 bytes. Four short files — no packages,
no key, no account — turn it into a change log for the part of the market you
care about, and the rest of this page is about the four fields in it that will
mislead you if you read them the obvious way.

## 1. Take a snapshot

```js
// snapshot.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://openrouter.ai/api/v1/models';

const res = await fetch(ENDPOINT, { headers: { accept: 'application/json' } });
if (!res.ok) throw new Error(`${ENDPOINT} -> HTTP ${res.status}`);
const body = await res.json();

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
await mkdir('snapshots', { recursive: true });
const file = `snapshots/${stamp}.json`;
await writeFile(file, JSON.stringify(body));

console.log(`HTTP ${res.status} ${res.headers.get('content-type')}`);
console.log(`${body.data.length} rows -> ${file}`);
```

```text
$ node snapshot.mjs
HTTP 200 application/json
398 rows -> snapshots/2026-08-28T20-26-39-358Z.json
```

Keep the raw body, not a tidied version of it. Every field you throw away now
is a change you cannot detect later, and the whole file is under a megabyte.

## 2. Read it once, carefully

```js
// report.mjs
import { readdir, readFile } from 'node:fs/promises';

const perM = (s) => (s == null ? null : Number(s) * 1e6);

const files = (await readdir('snapshots')).filter((f) => f.endsWith('.json')).sort();
const latest = files.at(-1);
const rows = JSON.parse(await readFile(`snapshots/${latest}`, 'utf8')).data;

const priced = rows.filter((r) => perM(r.pricing?.prompt) > 0);
const free = rows.filter((r) => Number(r.pricing?.prompt) === 0);
const expiring = rows.filter((r) => r.expiration_date);
const cached = rows.filter((r) => Number(r.pricing?.input_cache_read) > 0);
const disagree = rows.filter(
  (r) => r.top_provider?.context_length != null
      && r.top_provider.context_length !== r.context_length,
);

console.log(`snapshot ${latest}`);
console.log(`rows                       ${rows.length}`);
console.log(`priced input               ${priced.length}`);
console.log(`zero-priced input          ${free.length}`);
console.log(`carry expiration_date      ${expiring.length}`);
console.log(`price cached input reads   ${cached.length}`);
console.log(`context_length disagrees   ${disagree.length}`);

const bar = 200_000;
const wide = priced
  .filter((r) => r.context_length >= bar)
  .sort((a, b) => perM(a.pricing.prompt) - perM(b.pricing.prompt));

console.log(`\ncheapest input at >= ${bar / 1000}k context (${wide.length} rows qualify)`);
console.log('    in/Mtok  out/Mtok    context  id');
for (const r of wide.slice(0, 8)) {
  console.log([
    perM(r.pricing.prompt).toFixed(3).padStart(11),
    perM(r.pricing.completion).toFixed(3).padStart(9),
    String(r.context_length).padStart(10),
    r.id,
  ].join('  '));
}
```

```text
$ node report.mjs
snapshot 2026-08-28T20-40-24-918Z.json
rows                       398
priced input               372
zero-priced input          21
carry expiration_date      8
price cached input reads   236
context_length disagrees   40

cheapest input at >= 200k context (248 rows qualify)
    in/Mtok  out/Mtok    context  id
      0.021      0.063      262144  inclusionai/ling-3.0-flash
      0.025      0.100      262144  nex-agi/nex-n2-mini
      0.030      0.120      524288  upstage/solar-pro4
      0.030      0.100     1310720  ~deepseek/deepseek-v4-flash-latest
      0.030      0.130     1000000  qwen/qwen3.7-flash
      0.048      0.193      262144  qwen/qwen3-30b-a3b-instruct-2507
      0.050      0.100     1310720  deepseek/deepseek-v4-flash-0731
      0.050      0.200      262144  nvidia/nemotron-3-nano-30b-a3b
```

`372 + 21 = 393`, not `398`. Five rows are neither priced nor free. Two rows
in the table have a tilde in front of their id. And 248 of 398 rows clear a
200k-token bar that was the frontier two years ago. Each of those is a field
worth pulling apart before you trust a sort.

## 3. Pull the misleading fields apart

```js
// fields.mjs
import { readdir, readFile } from 'node:fs/promises';

const files = (await readdir('snapshots')).filter((f) => f.endsWith('.json')).sort();
const rows = JSON.parse(await readFile(`snapshots/${files.at(-1)}`, 'utf8')).data;

const price = (r) => Number(r.pricing?.prompt);

console.log('-- rows whose pricing.prompt is neither > 0 nor exactly 0');
for (const r of rows.filter((r) => !(price(r) > 0) && price(r) !== 0)) {
  console.log(`   ${r.id.padEnd(24)} ${JSON.stringify(r.pricing.prompt)}  ctx ${r.context_length}`);
}

console.log('\n-- rows with an expiration_date');
for (const r of rows.filter((r) => r.expiration_date)
                    .sort((a, b) => a.expiration_date.localeCompare(b.expiration_date))) {
  console.log(`   ${r.expiration_date}  ${r.id}`);
}

console.log('\n-- id suffix census');
const suffix = new Map();
for (const r of rows) {
  const s = r.id.includes(':') ? ':' + r.id.split(':')[1] : '(none)';
  suffix.set(s, (suffix.get(s) ?? 0) + 1);
}
console.log('   ' + [...suffix].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  '));

console.log('\n-- zero-priced rows without a :free suffix');
for (const r of rows.filter((r) => price(r) === 0 && !r.id.endsWith(':free'))) console.log(`   ${r.id}`);

console.log('\n-- biggest context_length / top_provider.context_length gaps');
const gap = (r) => r.context_length - r.top_provider.context_length;
for (const r of rows
  .filter((r) => r.top_provider?.context_length != null && gap(r) > 0)
  .sort((a, b) => gap(b) - gap(a))
  .slice(0, 5)) {
  console.log(`   ${r.id.padEnd(34)} listed ${String(r.context_length).padStart(8)}   top provider ${String(r.top_provider.context_length).padStart(7)}`);
}

console.log('\n-- ids beginning with ~');
console.log('   ' + rows.filter((r) => r.id.startsWith('~')).map((r) => r.id).sort().join('\n   '));

console.log('\n-- biggest prompt : input_cache_read price ratios');
for (const x of rows
  .filter((r) => Number(r.pricing?.input_cache_read) > 0)
  .map((r) => ({ id: r.id, ratio: Number(r.pricing.prompt) / Number(r.pricing.input_cache_read) }))
  .filter((x) => Number.isFinite(x.ratio))
  .sort((a, b) => b.ratio - a.ratio)
  .slice(0, 4)) {
  console.log(`   ${x.id.padEnd(38)} ${x.ratio.toFixed(1)}x`);
}
```

```text
$ node fields.mjs
-- rows whose pricing.prompt is neither > 0 nor exactly 0
   openrouter/auto-beta     "-1"  ctx 2000000
   openrouter/fusion        "-1"  ctx 1000000
   openrouter/pareto-code   "-1"  ctx 2000000
   openrouter/bodybuilder   "-1"  ctx 128000
   openrouter/auto          "-1"  ctx 2000000

-- rows with an expiration_date
   2026-08-31  moonshotai/kimi-k2.5
   2026-09-30  dots-studio/dots-3-note-preview:free
   2026-12-31  z-ai/glm-4.5v
   2026-12-31  z-ai/glm-4.5
   2098-12-31  z-ai/glm-5.3-flash
   2098-12-31  z-ai/glm-5.3
   2098-12-31  z-ai/glm-5v-turbo
   2098-12-31  z-ai/glm-5-turbo

-- id suffix census
   (none)=339  :batch=41  :free=18

-- zero-priced rows without a :free suffix
   google/lyria-3-pro-preview
   google/lyria-3-clip-preview
   openrouter/free

-- biggest context_length / top_provider.context_length gaps
   meta-llama/llama-4-scout           listed  1310720   top provider  131072
   ~z-ai/glm-latest                   listed  1310720   top provider  262144
   thedrummer/unslopnemo-12b          listed  1024000   top provider   32768
   anthropic/claude-sonnet-4          listed  1000000   top provider  200000
   qwen/qwen3.8-2.4t-a95b             listed  1048576   top provider  262144

-- ids beginning with ~
   ~anthropic/claude-fable-latest
   ~anthropic/claude-haiku-latest
   ~anthropic/claude-opus-latest
   ~anthropic/claude-sonnet-latest
   ~deepseek/deepseek-v4-flash-latest
   ~google/gemini-flash-latest
   ~google/gemini-pro-latest
   ~moonshotai/kimi-latest
   ~openai/gpt-latest
   ~openai/gpt-mini-latest
   ~x-ai/grok-latest
   ~z-ai/glm-latest

-- biggest prompt : input_cache_read price ratios
   xiaomi/mimo-v2.5-pro                   120.8x
   xiaomi/mimo-v2.5                       50.0x
   meituan/longcat-2.0                    50.0x
   meta/muse-spark-1.2-contributor        50.0x
```

**`-1` is a sentinel, and it is contagious.** The five unpriced rows are
routers — rows that mean "pick a model for me", whose price is not knowable
in advance. `-1` says that clearly and is a catastrophic number to compute
with. Sort ascending on `Number(pricing.prompt)` and your five cheapest
models each cost minus a million per million tokens; take a minimum and it is
`-1`; average anything and the average is wrong. Three of the five also claim
the two largest advertised windows on the whole list, so "widest context"
returns routers too. The fix is a filter, not a special case:
`Number(r.pricing.prompt) >= 0` drops exactly the rows whose price is
undefined by construction.

**`expiration_date` is a retirement notice almost nobody reads.** The first
line of that list is a model three days from being switched off. Its own page
on the site was rendered in a browser the same day and searched: none of
`2026-08-31`, `expir`, `retir`, `deprecat` or `sunset` appears anywhere in
the 14,936 characters of visible text, and the date does not appear in the
`/models` listing page at all. It is in the page's data payload and in this
endpoint, and nowhere a reader will meet it.

Note the second half of that list: four rows use `2098-12-31` as a "never"
sentinel. An alert built on "has an expiration date" fires on those forever;
the useful predicate is a date inside the next year or two, not the presence
of the field.

**`:free` is a naming convention, not a price.** The suffix census counts 18
ids ending `:free`, but 21 rows are priced at zero — `google/lyria-3-pro-preview`,
`google/lyria-3-clip-preview` and `openrouter/free` carry no such suffix.
Filter on `pricing.prompt`, never on the id.

**`context_length` is a ceiling; `top_provider.context_length` is what you
get.** They disagree on 40 rows, sometimes by an order of magnitude — a
"million-token model" whose serving provider stops at `131072` is not a
million-token model for your request.

**A tilde means the id is a moving target.** Twelve ids begin with `~`, all
of them floating aliases. They are genuinely useful, and they break the
meaning of a diff: on the day the model behind `~openai/gpt-latest` is
swapped, the row's identity does not change, so a differ reports an ordinary
price or context edit rather than a substitution. Resolve a floating id to a
concrete one before you record any benchmark result against it.

One field is worth reading for the opposite reason.
`pricing.input_cache_read` is priced on 236 of the 398 rows and the discount
is not uniform: `xiaomi/mimo-v2.5-pro` reads cached input at `120.8x` less
than fresh input, `meituan/longcat-2.0` at `50.0x`. If your workload has a
long stable prefix, that ratio moves your bill more than the headline price
does, and it is on no comparison chart.

## 4. Diff two snapshots

```js
// changes.mjs
import { readdir, readFile } from 'node:fs/promises';

const DIR = process.argv[2] ?? 'snapshots';

const WATCH = {
  'price in': (r) => r.pricing?.prompt,
  'price out': (r) => r.pricing?.completion,
  context: (r) => r.context_length,
  expires: (r) => r.expiration_date ?? '-',
};

const load = async (f) =>
  new Map(JSON.parse(await readFile(`${DIR}/${f}`, 'utf8')).data.map((r) => [r.id, r]));

const files = (await readdir(DIR)).filter((f) => f.endsWith('.json')).sort();
if (files.length < 2) {
  console.log(`${DIR}: need two snapshots; run snapshot.mjs again later`);
  process.exit(0);
}
const [oldFile, newFile] = [files.at(-2), files.at(-1)];
const [was, now] = [await load(oldFile), await load(newFile)];

const lines = [];
for (const id of now.keys()) if (!was.has(id)) lines.push(`arrived   ${id}`);
for (const id of was.keys()) if (!now.has(id)) lines.push(`gone      ${id}`);
for (const [id, row] of now) {
  const before = was.get(id);
  if (!before) continue;
  for (const [label, read] of Object.entries(WATCH)) {
    const a = String(read(before));
    const b = String(read(row));
    if (a !== b) lines.push(`changed   ${id}  ${label}: ${a} -> ${b}`);
  }
}

console.log(`${oldFile}\n${newFile}`);
for (const l of lines.sort()) console.log(l);
console.log(`${lines.length} change${lines.length === 1 ? '' : 's'}`);
```

Comparing by `id` — not by name, not by array position — is the only part of
this that is load-bearing. `name` is a display string, and the array order is
not stable.

Two snapshots fourteen minutes apart:

```text
$ node changes.mjs
2026-08-28T20-26-39-358Z.json
2026-08-28T20-40-24-918Z.json
0 changes
```

Zero is the correct and usual answer. Run it on a schedule and most runs will
print exactly this.

## 5. Which is why you have to poison it on purpose

A watcher whose normal output is "nothing happened" is indistinguishable from
a watcher that has quietly stopped working. Make a doctored copy of a real
snapshot and check that the differ still sees the three kinds of change.

```js
// canary.mjs
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

const files = (await readdir('snapshots')).filter((f) => f.endsWith('.json')).sort();
const body = JSON.parse(await readFile(`snapshots/${files.at(-1)}`, 'utf8'));

await mkdir('canary', { recursive: true });
await writeFile('canary/1-real.json', JSON.stringify(body));

let rows = body.data.map((r) => ({ ...r }));
const target = rows.find((r) => r.id === 'openai/gpt-4');
target.pricing = { ...target.pricing, prompt: '0.000015' };
rows.find((r) => r.id === 'openai/gpt-3.5-turbo').context_length = 4096;
const dropped = rows.find((r) => r.id === 'openai/gpt-4-turbo');
rows = rows.filter((r) => r !== dropped);
rows.push({ ...rows[0], id: 'fictional/never-shipped-1' });

await writeFile('canary/2-doctored.json', JSON.stringify({ ...body, data: rows }));
console.log(`doctored copy written; dropped ${dropped.id}`);
```

```text
$ node canary.mjs && node changes.mjs canary
doctored copy written; dropped openai/gpt-4-turbo
1-real.json
2-doctored.json
arrived   fictional/never-shipped-1
changed   openai/gpt-3.5-turbo  context: 16385 -> 4096
changed   openai/gpt-4  price in: 0.00003 -> 0.000015
gone      openai/gpt-4-turbo
4 changes
```

Four for four. Now "0 changes" means something.

## What was executed

Every command and every output above was run on 2026-08-28 against the live
endpoint, on Windows 10 with Node `v24.13.0`. Nothing is mocked and no output
is reconstructed: the two snapshots are real fetches fourteen minutes apart,
and the canary diff is the real differ run against a doctored copy of a real
snapshot. The model-page check was a real page load in headless Chromium
`151.0.7922.34`.

Not executed: any run spanning more than one day, so no output here shows a
real arrival, departure or price move. That is what the canary is for.

## What will break this first

- **Row counts and prices** move daily; every number above is dated
  2026-08-28 and is meant to be re-derived, not quoted.
- **`-1` is undocumented behavior** as far as the response itself goes. It
  could become `null`, and the `>= 0` filter would then need `!= null` beside
  it.
- **`links.next` is null today.** If the catalog is ever paginated, a script
  that reads `data` once will silently watch a prefix of the market.
- **The `~` prefix and the `:free` / `:batch` suffixes are conventions**, not
  guarantees, and conventions are exactly what changes without a changelog.
