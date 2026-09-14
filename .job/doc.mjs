const u = 'https://openrouter.ai/docs/guides/routing/routers/latest-resolution';
const r = await fetch(u);
const t = (await r.text()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
console.log(u, r.status, 'chars', t.length);
for (const k of ['openai/gpt', 'never resolves', 'hidden', 'family', 'Sol', 'Astra']) {
  let i = -1, n = 0;
  while ((i = t.indexOf(k, i + 1)) !== -1 && n < 4) { console.log('[' + k + ']', t.slice(Math.max(0, i - 200), i + 200)); n++; }
}
