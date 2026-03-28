import type { ClassArchetype, Tier } from '../types'

// Supporting the new Tier logic for the Evolution Tree
export type ALSTier = Tier | 'Elite';

export const CLASS_NAMES: Record<ClassArchetype, Record<ALSTier, string>> = {
  Grinder: { 
    Basic: 'The Professional', 
    Intermediate: 'The High-Roller', 
    Elite: 'The Power-User' 
  },
  Ironclad: { 
    Basic: 'The Disciplined', 
    Intermediate: 'The Tank', 
    Elite: 'The Absolute' 
  },
  Ascendant: { 
    Basic: 'The Polymath', 
    Intermediate: 'The Zenith', 
    Elite: 'The Omniscient' 
  },
  Tactician: { 
    Basic: 'The Analyst', 
    Intermediate: 'The Strategist', 
    Elite: 'The Mastermind' 
  },
  Drifter: { 
    Basic: 'The Agile', 
    Intermediate: 'The Nomad', 
    Elite: 'The Ghost Protocol' 
  },
  Sage: { 
    Basic: 'The Specialist', 
    Intermediate: 'The Director', 
    Elite: 'The Authority' 
  },
}

export const CLASS_DESCRIPTIONS: Record<ClassArchetype, string> = {
  Grinder: 'Optimized for career trajectory and high-stakes industry dominance.',
  Ironclad: 'Engineered for physical resilience and unwavering consistency.',
  Ascendant: 'A rare hybrid build balancing cognitive depth with physical peak.',
  Tactician: 'Specialized in social engineering, strategic networking, and influence.',
  Drifter: 'High-mobility unit focused on rapid adaptation and project fluidity.',
  Sage: 'The ultimate knowledge repository; focuses on deep-work and systemic mastery.',
}

export const CLASS_COLORS: Record<ClassArchetype, string> = {
  Grinder: '#F5C542',
  Ironclad: '#FF5E5E',
  Ascendant: '#A78BFA',
  Tactician: '#5EA8FF',
  Drifter: '#FB923C',
  Sage: '#4ADE80',
}

/**
 * Enhanced helper to handle the 3-Tier branching logic
 */
export function getClassName(archetype: ClassArchetype, tier: ALSTier): string {
  // Fallback to Basic if tier is undefined
  const selectedTier = tier || 'Basic';
  return CLASS_NAMES[archetype][selectedTier];
}

export function getClassDescription(archetype: ClassArchetype): string {
  return CLASS_DESCRIPTIONS[archetype]
}

export function getClassColor(archetype: ClassArchetype): string {
  return CLASS_COLORS[archetype]
}