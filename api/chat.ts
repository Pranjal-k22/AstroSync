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

interface NormalizedMessage {
  role: 'user' | 'model';
  text: string;
}

function normalizeHistory(rawHistory: unknown): NormalizedMessage[] {
  if (!Array.isArray(rawHistory)) {
    if (rawHistory !== undefined && rawHistory !== null) {
      console.warn('[api/chat] History was not an array, falling back to empty list:', typeof rawHistory);
    }
    return [];
  }

  const normalized: NormalizedMessage[] = [];
  let droppedCount = 0;
  let normalizedRoleCount = 0;

  for (const raw of rawHistory) {
    if (!raw || typeof raw !== 'object') {
      droppedCount++;
      continue;
    }

    const item = raw as Record<string, unknown>;

    // 1. Extract and map role (only 'user' and 'model' allowed in Gemini API)
    const rawRole = String(item.role ?? item.sender ?? item.author ?? '').toLowerCase().trim();
    let role: 'user' | 'model';
    if (rawRole === 'user') {
      role = 'user';
    } else if (['assistant', 'ai', 'bot', 'model'].includes(rawRole)) {
      if (rawRole !== 'model') normalizedRoleCount++;
      role = 'model';
    } else {
      normalizedRoleCount++;
      role = 'model';
    }

    // 2. Fall back to .text -> .content -> .message
    const rawText = item.text ?? item.content ?? item.message;
    const text = typeof rawText === 'string' ? rawText.trim() : '';

    if (!text) {
      droppedCount++;
      continue;
    }

    normalized.push({ role, text });
  }

  if (droppedCount > 0 || normalizedRoleCount > 0) {
    console.warn(
      `[api/chat] History normalized: ${normalized.length} valid entries retained (${droppedCount} dropped/empty, ${normalizedRoleCount} roles mapped to 'model').`
    );
  }

  return normalized;
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

  const normalizedHistory = normalizeHistory(history).slice(-6);

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

  // Build Gemini multi-turn contents array with strict alternating roles
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
    {
      role: 'user',
      parts: [{ text: `I'm asking about ${personAName} and ${personBName}'s compatibility. Start ready to answer questions.` }],
    },
    {
      role: 'model',
      parts: [{ text: `Of course! I've got ${personAName} and ${personBName}'s cosmic profile right in front of me. What would you like to explore? ✨` }],
    },
  ];

  // Append history ensuring alternating turns
  for (const item of normalizedHistory) {
    const lastTurn = contents[contents.length - 1];
    if (lastTurn && lastTurn.role === item.role) {
      lastTurn.parts[0].text += `\n\n${item.text}`;
    } else {
      contents.push({ role: item.role, parts: [{ text: item.text }] });
    }
  }

  // Append current user message
  const lastTurn = contents[contents.length - 1];
  if (lastTurn && lastTurn.role === 'user') {
    lastTurn.parts[0].text += `\n\n${message.trim()}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
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

      // Retry once on rate limit (429) or transient backend error (503)
      if ((geminiRes.status === 429 || geminiRes.status === 503) && attempt < maxAttempts) {
        console.warn(`[api/chat] Gemini returned ${geminiRes.status} on attempt ${attempt}. Retrying after 1000ms...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error(`[api/chat] Gemini API error (attempt ${attempt}):`, geminiRes.status, errText);
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
        console.error(`[api/chat] Gemini request timed out (>8s) on attempt ${attempt}`);
        if (attempt < maxAttempts) {
          console.warn('[api/chat] Retrying once after timeout...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return res.status(504).json({ error: 'Request timed out (>8s)', reason: 'timeout' });
      }

      console.error(`[api/chat] Unexpected error on attempt ${attempt}:`, err);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      return res.status(500).json({
        error: 'Internal server error',
        reason: 'gemini_error',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
