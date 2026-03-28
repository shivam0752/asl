// utils/xpEngine.ts

export const XP_WEIGHTS = {
  promotion: 500,
  certification: 150,
  new_skill: 30,
  workout_session: 100, // INCREASED per discussion
  streak_7day: 250,      // INCREASED for high-tier consistency
  steps_goal: 100,      // INCREASED to match high-value fitness
  new_connection: 15,
  career_switch: 300,
} as const;

export type XPEventKey = keyof typeof XP_WEIGHTS;

/**
 * Calculates the specific amount of XP needed to go from (level) to (level + 1).
 */
function xpRequiredForNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  const previousLevels = safeLevel - 1;

  // Base XP for the first level transition (1 -> 2)
  const baseXP = 250; 
  
  let required: number;

  if (safeLevel <= 50) {
    // Linear growth for the main journey
    required = baseXP + (previousLevels * 100);
  } else {
    // Hypothetical scaling for internal calculations beyond 50
    const highLevelOffset = safeLevel - 50;
    const level50Cap = baseXP + (49 * 100); // 5150
    required = level50Cap + (highLevelOffset * 150) + (5 * Math.pow(highLevelOffset, 1.5));
  }

  return Math.round(required);
}

/**
 * Calculates the cumulative XP required to reach a specific level.
 */
export function calculateLevelThreshold(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  let total = 0;
  for (let l = 1; l < safeLevel; l++) {
    total += xpRequiredForNextLevel(l);
  }
  return total;
}

/**
 * Calculates the current Level, Hard-Capped at 50 for the ALS Evolution.
 */
export function calculateLevel(totalXp: number): number {
  let level = 1;
  while (totalXp >= calculateLevelThreshold(level + 1)) {
    level++;
    // HARD CAP AT 50
    if (level >= 50) return 50;
  }
  return level;
}

/**
 * Returns the amount of XP earned beyond the Level 50 cap.
 */
export function calculatePrestigeXP(totalXp: number): number {
  const capThreshold = calculateLevelThreshold(50);
  return Math.max(0, totalXp - capThreshold);
}

export function xpToNextLevel(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  
  // If at cap, there is no "next level" threshold to hit
  if (currentLevel >= 50) return 0;

  const nextThreshold = calculateLevelThreshold(currentLevel + 1);
  return Math.max(0, nextThreshold - totalXp);
}

export function xpProgressPercent(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  
  // If maxed, bar is always full
  if (currentLevel >= 50) return 100;

  const currentThreshold = calculateLevelThreshold(currentLevel);
  const nextThreshold = calculateLevelThreshold(currentLevel + 1);
  
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;

  const progress = ((totalXp - currentThreshold) / range) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function getXPForEvent(eventKey: XPEventKey): number {
  return XP_WEIGHTS[eventKey];
}