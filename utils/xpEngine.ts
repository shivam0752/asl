export const XP_WEIGHTS = {
    promotion: 500,
    certification: 150,
    new_skill: 30,
    workout_session: 50,
    streak_7day: 200,
    steps_goal: 20,
    new_connection: 15,
    career_switch: 300,
  } as const
  
  export type XPEventKey = keyof typeof XP_WEIGHTS
  
  export function calculateLevelThreshold(level: number): number {
    return Math.round(1000 * Math.pow(level, 1.5))
  }
  
  export function calculateLevel(totalXp: number): number {
    let level = 1
    while (totalXp >= calculateLevelThreshold(level)) {
      level++
      if (level >= 999) break
    }
    return level
  }
  
  export function xpToNextLevel(totalXp: number): number {
    const currentLevel = calculateLevel(totalXp)
    return calculateLevelThreshold(currentLevel) - totalXp
  }
  
  export function xpProgressPercent(totalXp: number): number {
    const currentLevel = calculateLevel(totalXp)
    const currentThreshold = currentLevel > 1 ? calculateLevelThreshold(currentLevel - 1) : 0
    const nextThreshold = calculateLevelThreshold(currentLevel)
    const progress = ((totalXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    return Math.min(100, Math.max(0, Math.round(progress)))
  }
  
  export function getXPForEvent(eventKey: XPEventKey): number {
    return XP_WEIGHTS[eventKey]
  }