
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const PORT = process.env.PORT || 8787;
const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(express.json({ limit: '8kb' }));
app.use(
  cors({
    origin:
      ORIGIN === '*'
        ? true
        : ORIGIN.split(',').map((s) => s.trim()),
  })
);

const ai = KEY ? new GoogleGenAI({ apiKey: KEY }) : null;

// Rate limit: 20 questions per IP per 10 minutes.
const hits = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  const recent = (hits.get(ip) || []).filter(
    (t) => now - t < 10 * 60 * 1000
  );

  if (recent.length >= 20) {
    return res.status(429).json({
      error: 'Too many questions. Please wait a few minutes.',
    });
  }

  recent.push(now);
  hits.set(ip, recent);
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(ai) });
});

const SYSTEM = `You are BoardBuddy's doubt solver for Class 10 students of the Bihar School Examination Board (BSEB), India.
- Answer in the language the student used (Hindi or English).
- Use simple words suitable for Class 10.
- Give a short final answer first, then numbered step-by-step working.
- Show relevant formulas.
- For maths and science numericals, include units and check the result.
- Stay within the Class 10 school syllabus.
- If the question is unrelated to studies, politely say so.
- If you are unsure, say so instead of guessing.
- Never claim to quote an official BSEB textbook or paper.`;

app.post('/api/doubt', rateLimit, async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini is not configured. Check GEMINI_API_KEY on the server.',
    });
  }

  const question =
    typeof req.body?.question === 'string'
      ? req.body.question.trim()
      : '';

  const lang = req.body?.lang === 'hi' ? 'Hindi' : 'English';

  if (question.length < 3 || question.length > 1000) {
    return res.status(400).json({
      error: 'Question must be between 3 and 1000 characters.',
    });
  }

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: `Student's app language: ${lang}.

${SYSTEM}

Student's question:
${question}`,
      config: {
        maxOutputTokens: 1200,
      },
    });

    const answer = result.text?.trim();

    return res.json({
      answer: answer || 'No answer was returned.',
    });
  } catch (error) {
    console.error('Gemini API error:', error.message);

    return res.status(502).json({
      error: 'Gemini could not answer right now. Please try again later.',
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `BoardBuddy API on :${PORT} · Gemini ${
      ai ? 'configured' : 'NOT configured'
    }`
  );
});
