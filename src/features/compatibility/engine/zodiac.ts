import type { ZodiacSignInfo } from './types';

export const ZODIAC_SIGNS_DATA: Record<string, ZodiacSignInfo> = {
  Aries: {
    name: 'Aries',
    symbol: '♈',
    element: 'fire',
    modality: 'cardinal',
    rulingPlanet: 'Mars',
    traits: {
      communication: 'Direct, expressive, and passionately decisive',
      emotional: 'Spontaneous, intense, and deeply authentic',
      relationship: 'Initiating, courageous, and fiercely protective',
    },
  },
  Taurus: {
    name: 'Taurus',
    symbol: '♉',
    element: 'earth',
    modality: 'fixed',
    rulingPlanet: 'Venus',
    traits: {
      communication: 'Measured, pragmatic, and grounded in practical truth',
      emotional: 'Steady, loyal, and quietly devoted',
      relationship: 'Nurturing, patient, and deeply sensual',
    },
  },
  Gemini: {
    name: 'Gemini',
    symbol: '♊',
    element: 'air',
    modality: 'mutable',
    rulingPlanet: 'Mercury',
    traits: {
      communication: 'Witty, versatile, and intellectually curious',
      emotional: 'Adaptable, reflective, and verbally expressive',
      relationship: 'Stimulating, playful, and value-driven',
    },
  },
  Cancer: {
    name: 'Cancer',
    symbol: '♋',
    element: 'water',
    modality: 'cardinal',
    rulingPlanet: 'Moon',
    traits: {
      communication: 'Intuitive, empathetic, and protective',
      emotional: 'Deeply feeling, receptive, and sentimentally attached',
      relationship: 'Nurturing, devoted, and sanctuary-building',
    },
  },
  Leo: {
    name: 'Leo',
    symbol: '♌',
    element: 'fire',
    modality: 'fixed',
    rulingPlanet: 'Sun',
    traits: {
      communication: 'Warm, charismatic, and encouraging',
      emotional: 'Generous, passionate, and open-hearted',
      relationship: 'Loyal, romantic, and proudly supportive',
    },
  },
  Virgo: {
    name: 'Virgo',
    symbol: '♍',
    element: 'earth',
    modality: 'mutable',
    rulingPlanet: 'Mercury',
    traits: {
      communication: 'Analytical, precise, and practical',
      emotional: 'Thoughtful, conscientious, and steady',
      relationship: 'Devoted through service, attentive, and reliable',
    },
  },
  Libra: {
    name: 'Libra',
    symbol: '♎',
    element: 'air',
    modality: 'cardinal',
    rulingPlanet: 'Venus',
    traits: {
      communication: 'Harmonious, diplomatic, and perspective-seeking',
      emotional: 'Balanced, empathetic, and peace-loving',
      relationship: 'Partnership-focused, romantic, and equitable',
    },
  },
  Scorpio: {
    name: 'Scorpio',
    symbol: '♏',
    element: 'water',
    modality: 'fixed',
    rulingPlanet: 'Pluto',
    traits: {
      communication: 'Perceptive, candid, and deeply focused',
      emotional: 'Profound, transformational, and unshakeably loyal',
      relationship: 'Intense, soulful, and protective',
    },
  },
  Sagittarius: {
    name: 'Sagittarius',
    symbol: '♐',
    element: 'fire',
    modality: 'mutable',
    rulingPlanet: 'Jupiter',
    traits: {
      communication: 'Philosophical, optimistic, and candid',
      emotional: 'Free-spirited, resilient, and growth-oriented',
      relationship: 'Adventurous, inspiring, and expansive',
    },
  },
  Capricorn: {
    name: 'Capricorn',
    symbol: '♑',
    element: 'earth',
    modality: 'cardinal',
    rulingPlanet: 'Saturn',
    traits: {
      communication: 'Strategic, reserved, and purposeful',
      emotional: 'Disciplined, committed, and quietly profound',
      relationship: 'Stable, builder-minded, and enduring',
    },
  },
  Aquarius: {
    name: 'Aquarius',
    symbol: '♒',
    element: 'air',
    modality: 'fixed',
    rulingPlanet: 'Uranus',
    traits: {
      communication: 'Innovative, objective, and visionary',
      emotional: 'Independent, humanitarian, and intellectually deep',
      relationship: 'Unique, friendship-first, and progressive',
    },
  },
  Pisces: {
    name: 'Pisces',
    symbol: '♓',
    element: 'water',
    modality: 'mutable',
    rulingPlanet: 'Neptune',
    traits: {
      communication: 'Poetic, gentle, and abstractly intuitive',
      emotional: 'Empathetic, soulful, and boundary-transcending',
      relationship: 'Compassionate, romantic, and transcendent',
    },
  },
};

/**
 * Determine Sun Sign from a birth date string (YYYY-MM-DD or MM-DD)
 */
export function getZodiacSignFromDate(dateString: string): ZodiacSignInfo {
  if (!dateString) return ZODIAC_SIGNS_DATA.Aries;

  const parts = dateString.split('-');
  let month = 1;
  let day = 1;

  if (parts.length === 3) {
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
  }

  if (isNaN(month) || isNaN(day)) return ZODIAC_SIGNS_DATA.Aries;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS_DATA.Aries;
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS_DATA.Taurus;
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS_DATA.Gemini;
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS_DATA.Cancer;
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS_DATA.Leo;
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS_DATA.Virgo;
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS_DATA.Libra;
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS_DATA.Scorpio;
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS_DATA.Sagittarius;
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS_DATA.Capricorn;
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS_DATA.Aquarius;
  return ZODIAC_SIGNS_DATA.Pisces;
}
