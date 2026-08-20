import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ZodiacMeta {
  name: string;
  symbol: string;
  element: string;
  modality: string;
}

interface ChatPayload {
  message: string;
  personAName: string;
  personBName: string;
  personAZodiac: ZodiacMeta;
  personBZodiac: ZodiacMeta;
  overallScore: number;
  categories: {
    communication: number;
    emotional: number;
    romance: number;
    conflict: number;
    growth: number;
  };
  signals: string[];
  strengths: string[];
  challenges: string[];
  history: ChatMessage[]; // last 4–6 messages, sent from frontend state
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.', reason: 'invalid_request' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[api/chat] Error: GEMINI_API_KEY is not configured in process.env');
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.', reason: 'missing_api_key' });
  }

  const body = req.body as ChatPayload;
  if (!body || !body.message || !body.personAName || !body.personBName) {
    console.error('[api/chat] Error: Invalid request body received:', JSON.stringify(body));
    return res.status(400).json({
      error: 'message, personAName, and personBName are required.',
      reason: 'invalid_request',
    });
  }

  const {
    message,
    personAName,
    personBName,
    personAZodiac: zA,
    personBZodiac: zB,
    overallScore = 0,
    categories = { communication: 0, emotional: 0, romance: 0, conflict: 0, growth: 0 },
    signals = [],
    strengths = [],
    challenges = [],
    history = [],
  } = body;

  // Trim history to last 6 exchanges to keep context tight
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];

  const systemInstruction = `You are a warm, playful astrology companion for AstroSync, discussing the compatibility between ${personAName} (${zA?.name ?? 'Unknown'} ${zA?.symbol ?? ''}) and ${personBName} (${zB?.name ?? 'Unknown'} ${zB?.symbol ?? ''}).

Here is their compatibility context (do NOT repeat these numbers verbatim — weave them into natural conversation):
• Overall Match: ${overallScore}%
• Communication: ${categories?.communication ?? 0}%, Emotional: ${categories?.emotional ?? 0}%, Romance: ${categories?.romance ?? 0}%, Conflict: ${categories?.conflict ?? 0}%, Growth: ${categories?.growth ?? 0}%
• Element pairing: ${zA?.element ?? '?'} × ${zB?.element ?? '?'} | Modality: ${zA?.modality ?? '?'} × ${zB?.modality ?? '?'}
• Signals: ${(signals ?? []).join(', ')}
• Strengths: ${(strengths ?? []).join('; ')}
• Friction: ${(challenges ?? []).join('; ')}

ABSOLUTE RULES:
1. Frame all "future" answers as playful astrological perspective — use hedged, exploratory language: "the stars suggest", "one way to read this is", "this pairing tends to".
2. NEVER give real medical, legal, financial, or safety advice. If asked, warmly redirect: "That's a bit outside my stardust expertise! What I *can* tell you is…"
3. NEVER claim certainty about real-world outcomes (marriage, death, accidents, exact dates, exact events). Keep it fun and open-ended.
4. Keep each reply under 120 words — this is a chat, not an essay.
5. Stay on topic: this pair's compatibility, their signs, and relationship dynamics. If asked something unrelated, redirect warmly back to the stars.
6. Never repeat the same sentence structure twice in a row. Keep the conversation feeling alive.`;

  // Build Gemini multi-turn contents array from rolling history
  const contents = [
    // Inject the compatibility context as a priming user turn
    {
      role: 'user',
      parts: [{ text: `I'm asking about ${personAName} and ${personBName}'s compatibility. Start ready to answer questions.` }],
    },
    {
      role: 'model',
      parts: [{ text: `Of course! I've got ${personAName} and ${personBName}'s cosmic profile right in front of me. What would you like to explore? ✨` }],
    },
    // Rolling history
    ...recentHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    // Current user message
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 800,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[api/chat] Gemini API error response:', geminiRes.status, errText);
      return res.status(502).json({
        error: 'Gemini API returned an error',
        reason: 'gemini_error',
        status: geminiRes.status,
        details: errText,
      });
    }

    const data = (await geminiRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      console.error('[api/chat] Empty reply candidate from Gemini:', JSON.stringify(data));
      return res.status(502).json({ error: 'Empty response from Gemini', reason: 'gemini_error' });
    }

    return res.status(200).json({ reply });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[api/chat] Gemini request timed out (>8s)');
      return res.status(504).json({ error: 'Request timed out (>8s)', reason: 'timeout' });
    }
    console.error('[api/chat] Unexpected server exception:', err);
    return res.status(500).json({
      error: 'Internal server error',
      reason: 'gemini_error',
      details: err instanceof Error ? err.message : String(err),
    });
  }
}
