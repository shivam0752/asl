import type { ClassArchetype, Tier } from '../types'

export const CLASS_NAMES: Record<ClassArchetype, Record<Tier, string>> = {
  Grinder: { Basic: 'The Striver', Intermediate: 'The Relentless' },
  Ironclad: { Basic: 'The Enduring', Intermediate: 'The Unbroken' },
  Ascendant: { Basic: 'The Balanced', Intermediate: 'The Aligned' },
  Tactician: { Basic: 'The Shrewd', Intermediate: 'The Architect' },
  Drifter: { Basic: 'The Wanderer', Intermediate: 'The Untethered' },
  Sage: { Basic: 'The Knowing', Intermediate: 'The Deepened' },
}

export const CLASS_DESCRIPTIONS: Record<ClassArchetype, string> = {
  Grinder: 'Driven by ambition and knowledge, you climb faster than anyone around you.',
  Ironclad: 'Your body is your foundation — consistency and discipline define your path.',
  Ascendant: 'Rare and balanced, you grow in every dimension at once.',
  Tactician: 'Sharp mind, strong network — you win through strategy and influence.',
  Drifter: 'Adaptable and fast-moving, you thrive on change and momentum.',
  Sage: 'Years of deep experience have made you a quiet force others look to for guidance.',
}

export const CLASS_COLORS: Record<ClassArchetype, string> = {
  Grinder: '#F5C542',
  Ironclad: '#FF5E5E',
  Ascendant: '#A78BFA',
  Tactician: '#5EA8FF',
  Drifter: '#FB923C',
  Sage: '#4ADE80',
}

export function getClassName(archetype: ClassArchetype, tier: Tier): string {
  return CLASS_NAMES[archetype][tier]
}

export function getClassDescription(archetype: ClassArchetype): string {
  return CLASS_DESCRIPTIONS[archetype]
}

export function getClassColor(archetype: ClassArchetype): string {
  return CLASS_COLORS[archetype]
}