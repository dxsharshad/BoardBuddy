// BoardBuddy doubt-solver backend.
// The API key lives ONLY here (server/.env or your host's environment variables), never in the app.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 8787;
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(express.json({ limit: '8kb' }));
app.use(cors({ origin: ORIGIN === '*' ? true : ORIGIN.split(',').map((s) => s.trim()) }));

// Tiny in-memory rate limiter: 20 questions per IP per 10 minutes.
const hits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 20) return res.status(429).json({ error: 'Too many questions. Please wait a few minutes.' });
  recent.push(now);
  hits.set(ip, recent);
  next();
}

app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: Boolean(KEY) }));

const SYSTEM = `You are BoardBuddy's doubt solver for Class 10 students of the Bihar School Examination Board (BSEB), India.
- Answer in the language the student used (Hindi or English). Use simple words suitable for Class 10.
- Give a short final answer first, then numbered step-by-step working. Show relevant formulas.
- For maths/science numericals, include units and check the result.
- Stay within the Class 10 school syllabus. If the question is unrelated to studies, politely say so.
- If you are not sure, say so instead of guessing. Never claim to quote the official BSEB textbook or papers.`;

app.post('/api/doubt', rateLimit, async (req, res) => {
  if (!KEY) return res.status(503).json({ error: 'AI is not configured on the server (ANTHROPIC_API_KEY is missing).' });

  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  const lang = req.body?.lang === 'hi' ? 'Hindi' : 'English';
  if (question.length < 3 || question.length > 1000) {
    return res.status(400).json({ error: 'Question must be between 3 and 1000 characters.' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: `${SYSTEM}\nThe student's app language is ${lang}.`,
        messages: [{ role: 'user', content: question }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('Anthropic API error', r.status, data?.error?.message);
      return res.status(502).json({ error: 'The AI service returned an error. Please try again later.' });
    }
    const answer = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    res.json({ answer: answer || 'No answer was returned.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not reach the AI service.' });
  }
});

app.listen(PORT, () => console.log(`BoardBuddy API on :${PORT} · AI ${KEY ? 'configured' : 'NOT configured'}`));
