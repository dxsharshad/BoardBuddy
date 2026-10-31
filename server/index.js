// BoardBuddy Gemini doubt-solver backend. Keep GEMINI_API_KEY on the server only.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = Number(process.env.PORT || 8787);
const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));
app.use(cors({ origin: ORIGIN === '*' ? true : ORIGIN.split(',').map((s) => s.trim()) }));

// In-memory abuse guard: 20 questions per IP per 10 minutes. For multi-instance production,
// replace with a shared rate limiter (for example Redis) and add authenticated per-user quotas.
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

app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: Boolean(KEY), provider: 'Google Gemini' }));

const SYSTEM = `You are BoardBuddy's doubt solver for Class 10 students of the Bihar School Examination Board (BSEB), India.
Answer in the language the student used (Hindi or English). Use simple words suitable for Class 10.
Give a short final answer first, then numbered step-by-step working. Show relevant formulas.
For maths/science numericals, include units and check the result.
Stay within the Class 10 school syllabus. If the question is unrelated to studies, politely say so.
If you are not sure, say so instead of guessing. Never claim to quote an official textbook or paper unless supplied in the conversation.`;

app.post('/api/doubt', rateLimit, async (req, res) => {
  if (!KEY) return res.status(503).json({ error: 'AI is not configured on the server (GEMINI_API_KEY is missing).' });
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  const lang = req.body?.lang === 'hi' ? 'Hindi' : 'English';
  if (question.length < 3 || question.length > 1000) {
    return res.status(400).json({ error: 'Question must be between 3 and 1000 characters.' });
  }
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM}\nThe app language preference is ${lang}; primarily answer in the language of the student's question.` }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.3 },
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      // Do not log request URLs or API keys.
      console.error('Gemini API error', r.status, data?.error?.message || 'unknown error');
      return res.status(502).json({ error: 'The Gemini service returned an error. Check server configuration and try again.' });
    }
    const answer = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('\n').trim();
    if (!answer) return res.status(502).json({ error: 'Gemini returned no text. Please try again.' });
    return res.json({ answer });
  } catch (error) {
    console.error('Gemini request failed:', error?.message || 'network error');
    return res.status(500).json({ error: 'Could not reach the AI service.' });
  }
});

app.listen(PORT, () => console.log(`BoardBuddy API listening on :${PORT} · Gemini ${KEY ? 'configured' : 'NOT configured'}`));
