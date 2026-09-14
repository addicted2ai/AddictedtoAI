const r = await fetch('https://openrouter.ai/api/v1/models');
const j = await r.json();
console.log('status', r.status, 'rows', j.data.length, 'at', new Date().toString());
for (const m of j.data) {
  if (m.id.startsWith('~openai/') || m.id.startsWith('openai/gpt-5.6')) {
    console.log(m.id, '|', m.name, '|', JSON.stringify(m.alias_target ?? null), '|', m.description);
  }
}
