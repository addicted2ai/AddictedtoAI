const urls = [
  'https://openrouter.ai/api/v1/models/~openai/gpt-latest/endpoints',
  'https://openrouter.ai/api/v1/models/~openai/gpt-sol-latest/endpoints',
  'https://openrouter.ai/~openai/gpt-latest',
  'https://openrouter.ai/~openai/gpt-sol-latest',
];
for (const u of urls) {
  const r = await fetch(u, { redirect: 'manual' });
  const t = await r.text();
  console.log('==', u, r.status, 'location:', r.headers.get('location'));
  if (u.includes('/api/')) console.log(t.slice(0, 700));
}
console.log('at', new Date().toString());
