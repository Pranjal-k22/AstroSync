import type { ZodiacSignInfo } from './types';

export function generateSignals(signA: ZodiacSignInfo, signB: ZodiacSignInfo): string[] {
  const signals: string[] = [];

  // Element relationship
  if (signA.element === signB.element) {
    signals.push('Elemental Synergy');
  } else if (
    (signA.element === 'fire' && signB.element === 'air') ||
    (signA.element === 'air' && signB.element === 'fire')
  ) {
    signals.push('Dynamic Spark');
  } else if (
    (signA.element === 'water' && signB.element === 'earth') ||
    (signA.element === 'earth' && signB.element === 'water')
  ) {
    signals.push('Grounded Resonance');
  } else {
    signals.push('Complementary Dual');
  }

  // Modality relationship
  if (signA.modality === signB.modality) {
    signals.push('Shared Tempo');
  } else {
    signals.push('Modality Balance');
  }

  // Ruler dynamic
  if (signA.rulingPlanet === signB.rulingPlanet) {
    signals.push('Planetary Twin');
  } else {
    signals.push('Cosmic Polar');
  }

  return signals;
}

export function generateStrengths(signA: ZodiacSignInfo, signB: ZodiacSignInfo): string[] {
  const strengths: string[] = [];

  // Element combination strengths
  if (signA.element === signB.element) {
    strengths.push(
      `Shared ${signA.element} temperament creates effortless mutual understanding and instinctive alignment.`
    );
  } else if (
    (signA.element === 'fire' && signB.element === 'air') ||
    (signA.element === 'air' && signB.element === 'fire')
  ) {
    strengths.push(
      'Your air-fire combination creates fast-moving conversations, creative momentum, and high mutual curiosity.'
    );
  } else if (
    (signA.element === 'water' && signB.element === 'earth') ||
    (signA.element === 'earth' && signB.element === 'water')
  ) {
    strengths.push(
      'Your water-earth pair balances emotional depth with practical stability, forming a protective sanctuary.'
    );
  } else {
    strengths.push(
      `Combining ${signA.element} and ${signB.element} energies brings fresh perspective and well-rounded problem solving.`
    );
  }

  // Communication & emotional strengths
  strengths.push(
    `${signA.name}'s ${signA.traits.communication.toLowerCase()} pairs powerfully with ${signB.name}'s ${signB.traits.communication.toLowerCase()}.`
  );

  strengths.push(
    `Strong core synergy between ${signA.rulingPlanet} and ${signB.rulingPlanet} drives steady relationship resilience.`
  );

  return strengths;
}

export function generateChallenges(signA: ZodiacSignInfo, signB: ZodiacSignInfo): string[] {
  const challenges: string[] = [];

  if (signA.modality === 'fixed' && signB.modality === 'fixed') {
    challenges.push(
      'Both of you possess strong convictions; practice flexibility during stubborn deadlocks to maintain warmth.'
    );
  } else if (signA.modality === 'cardinal' && signB.modality === 'cardinal') {
    challenges.push(
      'Two natural leaders can occasionally compete for momentum; clear boundary sharing keeps joint projects smooth.'
    );
  } else if (signA.element !== signB.element) {
    challenges.push(
      `When processing stress, ${signA.name} tends to lean into ${signA.traits.emotional.toLowerCase()}, whereas ${signB.name} responds through ${signB.traits.emotional.toLowerCase()}.`
    );
  } else {
    challenges.push(
      'Because your core patterns are so mirrored, ensure you give each other intentional space for personal growth.'
    );
  }

  challenges.push(
    'Pacing differences can arise under fatigue; conscious check-ins help bridge fast impulses with deliberate timing.'
  );

  return challenges;
}

export function generateSummary(
  signA: ZodiacSignInfo,
  signB: ZodiacSignInfo,
  overallScore: number
): string {
  if (overallScore >= 85) {
    return `${signA.name} and ${signB.name} share an exceptional cosmic alignment (${overallScore}%). Your ${signA.element} and ${signB.element} qualities create a natural flow of mutual respect, high chemistry, and deep emotional trust.`;
  } else if (overallScore >= 70) {
    return `${signA.name} and ${signB.name} form a dynamic, growth-oriented bond (${overallScore}%). Your individual communication styles complement each other well, offering both excitement and steady stability.`;
  } else {
    return `${signA.name} and ${signB.name} possess a fascinating, multi-layered connection (${overallScore}%). While your processing paces differ, your unique dynamic inspires intentional understanding and personal expansion.`;
  }
}
