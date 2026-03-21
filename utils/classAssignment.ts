import type { StatName, ClassArchetype } from '../types'

function getCombinedScore(stats: Record<StatName, number>, a: StatName, b: StatName): number {
  return stats[a] + stats[b]
}

function getHighestStat(stats: Record<StatName, number>): StatName {
  return (Object.keys(stats) as StatName[]).reduce((a, b) => (stats[a] >= stats[b] ? a : b))
}

function getSecondHighestStat(stats: Record<StatName, number>): StatName {
  const sorted = (Object.keys(stats) as StatName[]).sort((a, b) => stats[b] - stats[a])
  return sorted[1]
}

function allWithinRange(stats: Record<StatName, number>, range: number): boolean {
  const values = Object.values(stats)
  const max = Math.max(...values)
  const min = Math.min(...values)
  return max - min <= range
}

/**
 * Assigns a character class based on dominant stat combinations.
 * Order of checks matters — Ascendant is rarest, checked first.
 */
export function assignClass(stats: Record<StatName, number>): ClassArchetype {
  // Ascendant: all stats balanced within 15 points
  if (allWithinRange(stats, 15)) return 'Ascendant'

  const highest = getHighestStat(stats)
  const second = getSecondHighestStat(stats)

  // Sage: WIS highest and INT second
  if (highest === 'WIS' && second === 'INT') return 'Sage'

  // Drifter: AGI is the single highest stat
  if (highest === 'AGI') return 'Drifter'

  // Compare combined pairs
  const pairs: { archetype: ClassArchetype; score: number }[] = [
    { archetype: 'Grinder', score: getCombinedScore(stats, 'WIS', 'INT') },
    { archetype: 'Ironclad', score: getCombinedScore(stats, 'STR', 'VIT') },
    { archetype: 'Tactician', score: getCombinedScore(stats, 'INT', 'CHA') },
  ]

  const best = pairs.reduce((a, b) => (a.score >= b.score ? a : b))
  return best.archetype
}