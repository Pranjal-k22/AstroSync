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
  history: ChatMessage[];
}

interface CleanTurn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

async function callGroqChat(
  groqApiKey: string,
  systemInstruction: string,
  cleanHistory: CleanTurn[],
  currentMessage: string
): Promise<string | null> {
  const candidateModels = ['openai/gpt-oss-120b', 'llama3-8b-8192', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'];

  // OpenAI chat completion message format: [{ role: 'system' | 'user' | 'assistant', content: string }]
  const messages = [
    { role: 'system' as const, content: systemInstruction },
    ...cleanHistory.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.parts[0]?.text || '',
    })),
    { role: 'user' as const, content: currentMessage.trim() },
  ];

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.75,
          max_tokens: 300,
        }),
      });

      clearTimeout(timeoutId);

      if (groqRes.ok) {
        const data = (await groqRes.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const reply = data?.choices?.[0]?.message?.content?.trim();
        if (reply) {
          console.log(`[provider:groq] Success using model: ${model}`);
          return reply;
        }
      } else {
        const errText = await groqRes.text();
        console.error(`[provider:groq] Model ${model} failed with HTTP ${groqRes.status}: ${errText}`);
      }
    } catch (err: unknown) {
      console.error(`[provider:groq] Exception connecting to model ${model}:`, err);
    }
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.', reason: 'invalid_request' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!geminiApiKey && !groqApiKey) {
    console.error('[api/chat] Error: Neither GEMINI_API_KEY nor GROQ_API_KEY is configured');
    return res.status(500).json({ error: 'API keys are not configured.', reason: 'missing_api_key' });
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

  // Aggressive sanitization mapping for multi-turn history
  const incomingHistory = (Array.isArray(history) ? history : []).slice(-6);
  const cleanHistory: CleanTurn[] = incomingHistory
    .map((msg: any) => ({
      role: (msg.role === 'user' || msg.sender === 'user') ? ('user' as const) : ('model' as const),
      parts: [{ text: String(msg.text || msg.content || msg.message || '') }],
    }))
    .filter((msg) => msg.parts[0].text.trim() !== '');

  // TEMPORARY TEST HOOK - REMOVE BEFORE FINAL SUBMISSION
  const forceFallbackHeader = req.headers['x-force-fallback'] === 'true';
  const forceFallbackQuery = req.query?.testFallback === 'true';
  const shouldForceFallback = forceFallbackHeader || forceFallbackQuery;

  if (shouldForceFallback) {
    console.log('[test] Forcing fallback to Groq for testing');
  }

  // 1. Try Gemini first if key exists (unless force-fallback is triggered for testing)
  if (geminiApiKey && !shouldForceFallback) {
    const contents = [
      ...cleanHistory,
      { role: 'user' as const, parts: [{ text: message.trim() }] },
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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

      if (geminiRes.ok) {
        const data = (await geminiRes.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) {
          console.log('[provider:gemini] Success');
          return res.status(200).json({ reply });
        }
      } else {
        const errText = await geminiRes.text();
        console.error(`[provider:gemini] Request failed with HTTP ${geminiRes.status}: ${errText}. Attempting Groq fallback...`);
      }
    } catch (err: unknown) {
      console.error('[provider:gemini] Exception during Gemini call. Attempting Groq fallback...', err);
    }
  }

  // 2. Fallback to Groq if available
  if (groqApiKey) {
    console.log('[provider:groq] Attempting Groq fallback...');
    const groqReply = await callGroqChat(
      groqApiKey,
      systemInstruction,
      cleanHistory,
      message
    );
    if (groqReply) {
      return res.status(200).json({ reply: groqReply });
    }
  } else {
    console.error('[api/chat] GROQ_API_KEY is not set in process.env (required for fallback when Gemini quota is exhausted)');
  }

  return res.status(502).json({
    error: 'All AI chat providers failed or timed out',
    reason: 'gemini_error',
  });
}
