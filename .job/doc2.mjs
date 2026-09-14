console.log('gpt-latest created', new Date(1777318334e3).toISOString());
console.log('gpt-sol-latest created', new Date(1789130928e3).toISOString());
const r = await fetch('https://openrouter.ai/docs/guides/routing/routers/latest-resolution');
const t = await r.text();
const hits = t.match(/~[a-z0-9-]+\/[a-z0-9.-]+-latest/g) ?? [];
console.log('alias slugs named in doc:', [...new Set(hits)].join(' '));
