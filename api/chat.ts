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
          console.log(`[provider:groq] Chat response generated with model: ${model}`);
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

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.error('[api/chat] Error: GROQ_API_KEY is not configured in process.env');
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on this server.', reason: 'missing_api_key' });
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

  const groqReply = await callGroqChat(
    groqApiKey,
    systemInstruction,
    cleanHistory,
    message
  );

  if (groqReply) {
    return res.status(200).json({ reply: groqReply });
  }

  return res.status(502).json({
    error: 'AI chat provider failed or timed out',
    reason: 'provider_error',
  });
}
