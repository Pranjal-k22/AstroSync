import type { CategoryScores, ZodiacSignInfo } from './types';
import type { UserProfile } from '../../../types';

/**
 * Deterministic string hash (FNV-1a variant) for generating reproducible seeds
 */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number = 48, max: number = 96): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Calculate deterministic compatibility scores for 5 categories
 */
export function calculateCategoryScores(
  personA: UserProfile,
  personB: UserProfile,
  signA: ZodiacSignInfo,
  signB: ZodiacSignInfo
): CategoryScores {
  // Normalize string for deterministic seeding (sort names alphabetically so order A/B gives same base seed)
  const sortedNames = [personA.name.toLowerCase(), personB.name.toLowerCase()].sort().join('|');
  const sortedDates = [personA.birthDate, personB.birthDate].sort().join('|');
  const seedString = `${sortedNames}:${sortedDates}:${personA.intent || ''}`;
  const seed = hashString(seedString);

  // Base score from element compatibility
  let elementBase = 70;
  if (signA.element === signB.element) {
    elementBase = 86; // Same element
  } else if (
    (signA.element === 'fire' && signB.element === 'air') ||
    (signA.element === 'air' && signB.element === 'fire') ||
    (signA.element === 'water' && signB.element === 'earth') ||
    (signA.element === 'earth' && signB.element === 'water')
  ) {
    elementBase = 82; // Harmonious complementary elements
  } else {
    elementBase = 68; // Opposing/neutral elements
  }

  // Modality adjustment
  let modalityBase = 72;
  if (signA.modality !== signB.modality) {
    modalityBase = 80;
  } else {
    modalityBase = 74;
  }

  // Generate category specific pseudo-random offsets derived from seed bits
  const commOffset = (seed % 17) - 8;
  const emoOffset = ((seed >> 4) % 19) - 9;
  const romOffset = ((seed >> 8) % 21) - 10;
  const confOffset = ((seed >> 12) % 15) - 7;
  const growOffset = ((seed >> 16) % 17) - 8;

  const communication = clamp(elementBase + commOffset + (signA.rulingPlanet === signB.rulingPlanet ? 6 : 0));
  const emotional = clamp(elementBase + emoOffset + (signA.element === signB.element ? 8 : 2));
  const romance = clamp(elementBase + romOffset + (personA.intent === 'Partner' || personA.intent === 'Crush' ? 4 : 0));
  const conflict = clamp(modalityBase + confOffset);
  const growth = clamp(elementBase + growOffset + 5);

  return {
    communication,
    emotional,
    romance,
    conflict,
    growth,
  };
}

/**
 * Compute weighted overall score from categories
 */
export function calculateOverallScore(categories: CategoryScores): number {
  const weighted =
    categories.communication * 0.25 +
    categories.emotional * 0.25 +
    categories.romance * 0.20 +
    categories.conflict * 0.15 +
    categories.growth * 0.15;

  return clamp(weighted, 48, 96);
}
