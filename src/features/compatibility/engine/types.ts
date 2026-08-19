import type { UserProfile } from '../../../types';

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';
export type ZodiacModality = 'cardinal' | 'fixed' | 'mutable';

export interface ZodiacSignInfo {
  name: string;
  symbol: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  rulingPlanet: string;
  traits: {
    communication: string;
    emotional: string;
    relationship: string;
  };
}

export interface CategoryScores {
  communication: number;
  emotional: number;
  romance: number;
  conflict: number;
  growth: number;
}

export interface CompatibilityResult {
  overallScore: number;
  categories: CategoryScores;
  signals: string[];
  strengths: string[];
  challenges: string[];
  summary: string;
  personAZodiac: ZodiacSignInfo;
  personBZodiac: ZodiacSignInfo;
}

export type ComputeCompatibilityFn = (
  personA: UserProfile,
  personB: UserProfile
) => CompatibilityResult;
