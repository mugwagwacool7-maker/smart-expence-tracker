// Run: npm i express cors && ANTHROPIC_API_KEY=your_key node server/index.js
// Then set EXPO_PUBLIC_AI_URL=http://YOUR_PC_IP:3000 in the app's .env
const express = require('express'), cors = require('cors');
const app = express(); app.use(cors(), express.json({ limit: '10mb' }));
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const ask = async content => {
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 500, messages: [{ role: 'user', content }] }) });
  if (!r.ok) throw new Error(`Claude API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json(); return (j.content && j.content[0] && j.content[0].text) || '';
};
app.post('/chat', async (q, s) => {
  const { question, transactions, budget } = q.body;
  const data = JSON.stringify(transactions);
  const prompt = `You are a friendly personal finance assistant. Monthly budget: ${budget}. Transactions (JSON): ${data}\nAnswer briefly: ${question}`;
  try {
    s.json({ reply: await ask(prompt) });
  } catch (e) {
    console.error('chat failed:', e.message);
    s.status(502).json({ error: e.message }); // the app falls back to its built-in answers
  }
});
app.post('/receipt', async (q, s) => {
  try {
    const t = await ask([{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: q.body.image } },
      { type: 'text', text: 'Read this receipt. Reply with JSON only: {"title":"store name","amount":total as a number,"category":"one of Food, Transport, Shopping, Rent, Entertainment, Education, Bills, Other"}' }]);
    try { s.json(JSON.parse(t.replace(/```json|```/g, '').trim())); } catch { s.status(422).json({}); }
  } catch (e) {
    console.error('receipt failed:', e.message);
    s.status(502).json({ error: e.message });
  }
});
app.listen(3000, () => console.log(`AI server on :3000 (model: ${MODEL})`));
