export type RelationshipIntent = 'Partner' | 'Crush' | 'Friend' | "It's Complicated";

export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  intent?: RelationshipIntent;
  birthLocation?: string;
  zodiacSign?: string;
}

export interface CompatibilityData {
  personA: UserProfile;
  personB: UserProfile;
  score?: number;
  summary?: string;
}
