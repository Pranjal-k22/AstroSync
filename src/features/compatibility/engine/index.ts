import type { UserProfile } from '../../../types';
import type { CompatibilityResult } from './types';
import { getZodiacSignFromDate } from './zodiac';
import { calculateCategoryScores, calculateOverallScore } from './scoring';
import {
  generateSignals,
  generateStrengths,
  generateChallenges,
  generateSummary,
} from './insights';

export * from './types';
export * from './zodiac';
export * from './scoring';
export * from './insights';

/**
 * Pure, deterministic function to compute AstroSync compatibility between Person A and Person B.
 * No backend, no Math.random(). Identical inputs will ALWAYS produce identical outputs.
 */
export function computeCompatibility(
  personA: UserProfile,
  personB: UserProfile
): CompatibilityResult {
  const personAZodiac = getZodiacSignFromDate(personA.birthDate);
  const personBZodiac = getZodiacSignFromDate(personB.birthDate);

  const categories = calculateCategoryScores(personA, personB, personAZodiac, personBZodiac);
  const overallScore = calculateOverallScore(categories);

  const signals = generateSignals(personAZodiac, personBZodiac);
  const strengths = generateStrengths(personAZodiac, personBZodiac);
  const challenges = generateChallenges(personAZodiac, personBZodiac);
  const summary = generateSummary(personAZodiac, personBZodiac, overallScore);

  return {
    overallScore,
    categories,
    signals,
    strengths,
    challenges,
    summary,
    personAZodiac,
    personBZodiac,
  };
}

export default computeCompatibility;
