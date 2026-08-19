import type { VercelRequest, VercelResponse } from '@vercel/node';

// Full zodiac sign metadata passed from the frontend (matches ZodiacSignInfo from engine)
interface ZodiacMeta {
  name: string;
  symbol: string;
  element: string;
  modality: string;
  rulingPlanet: string;
  traits: {
    communication: string;
    emotional: string;
    relationship: string;
  };
}

export interface AIInterpretationPayload {
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
}

export interface AIInterpretationResponse {
  headline: string;
  shortSummary: string;
  strongestConnection: string;
  potentialChallenge: string;
  communicationAdvice: string;
  funObservation: string;
}

function validateResponse(obj: unknown): obj is AIInterpretationResponse {
  if (!obj || typeof obj !== 'object') return false;
  const required = ['headline', 'shortSummary', 'strongestConnection', 'potentialChallenge', 'communicationAdvice', 'funObservation'];
  return required.every((k) => typeof (obj as Record<string, unknown>)[k] === 'string');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on this server.' });
  }

  const payload = req.body as AIInterpretationPayload;
  if (
    !payload ||
    !payload.personAName ||
    !payload.personBName ||
    !payload.personAZodiac ||
    !payload.personBZodiac ||
    !payload.categories
  ) {
    return res.status(400).json({ error: 'Invalid payload. personAZodiac and personBZodiac required.' });
  }

  const { personAName, personBName, personAZodiac: zA, personBZodiac: zB, overallScore, categories, signals, strengths, challenges } = payload;

  const systemInstruction = `You are AstroSync AI — a sharp, warm, and modern astrology synastry guide.
You receive structured astrological data for two people and you REASON about WHY their signs interact the way they do, grounded in actual elemental, modal, and planetary dynamics.

ABSOLUTE RULES — violations cause the response to be discarded:
1. NEVER output numeric scores. The scores are already shown in the UI. Reference them conceptually only if helpful (e.g. "high chemistry", "moderate tension").
2. NEVER make claims about real future events, health, finances, or safety.
3. NEVER write absolute statements: "you will marry", "this will fail", "you are destined". Use possibility language: "this pairing tends to", "you might find", "there's potential for".
4. Do NOT diagnose personality disorders or psychological conditions.
5. Keep total response under 350 words across all 6 fields combined.
6. Respond with ONLY a valid raw JSON object matching this exact schema — no markdown, no preamble, no explanation:
{
  "headline": "string — punchy, max 12 words",
  "shortSummary": "string — 2–3 sentences on the vibe of this pairing",
  "strongestConnection": "string — 1–2 sentences, reference the actual element/modality dynamics driving it",
  "potentialChallenge": "string — 1–2 sentences on the most interesting friction, framed constructively and tied to sign traits",
  "communicationAdvice": "string — 1 specific, actionable tip grounded in how these two signs naturally communicate",
  "funObservation": "string — one witty, light-hearted observation about this element/modality pairing"
}`;

  // Rich astrological reasoning prompt — includes full trait data so Gemini can reason, not just restate
  const prompt = `Analyse the synastry between ${personAName} (${zA.name} ${zA.symbol}) and ${personBName} (${zB.name} ${zB.symbol}).

=== ASTROLOGICAL PROFILES ===

${personAName} — ${zA.name} (${zA.element} / ${zA.modality}, ruled by ${zA.rulingPlanet})
• Communication style: ${zA.traits.communication}
• Emotional nature: ${zA.traits.emotional}
• Relationship approach: ${zA.traits.relationship}

${personBName} — ${zB.name} (${zB.element} / ${zB.modality}, ruled by ${zB.rulingPlanet})
• Communication style: ${zB.traits.communication}
• Emotional nature: ${zB.traits.emotional}
• Relationship approach: ${zB.traits.relationship}

=== ELEMENT & MODALITY DYNAMICS ===
Element pairing: ${zA.element} × ${zB.element}
Modality pairing: ${zA.modality} × ${zB.modality}
Ruling planets in interaction: ${zA.rulingPlanet} & ${zB.rulingPlanet}

=== DETERMINISTIC SCORES (for context — do NOT restate these as numbers) ===
Overall Match: ${overallScore}%
Communication: ${categories.communication}% | Emotional: ${categories.emotional}% | Romance: ${categories.romance}% | Conflict resolution: ${categories.conflict}% | Growth: ${categories.growth}%

=== COMPUTED SIGNALS & INSIGHTS ===
Signals: ${signals.join(', ')}
Strengths: ${strengths.join('; ')}
Constructive friction: ${challenges.join('; ')}

Reason about WHY these two signs interact this way based on the elemental and modality dynamics above. Ground each response field in the actual trait data, not just the scores.`;

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
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.65,
          responseMimeType: 'application/json',
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[api/interpret] Gemini API error:', geminiRes.status, errText);
      return res.status(502).json({ error: 'Gemini API returned an error' });
    }

    const data = await geminiRes.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty response from Gemini API' });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error('[api/interpret] JSON parse error. Raw text:', text.slice(0, 300));
      return res.status(502).json({ error: 'Failed to parse Gemini response as JSON' });
    }

    if (!validateResponse(parsed)) {
      console.error('[api/interpret] Response shape invalid:', JSON.stringify(parsed).slice(0, 300));
      return res.status(502).json({ error: 'Gemini response did not match expected schema' });
    }

    return res.status(200).json(parsed);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Gemini API request timed out (>8s)' });
    }
    console.error('[api/interpret] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
