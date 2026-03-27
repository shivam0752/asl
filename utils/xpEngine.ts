// utils/xpEngine.ts

export const XP_WEIGHTS = {
  promotion: 500,
  certification: 150,
  new_skill: 30,
  workout_session: 50,
  streak_7day: 200,
  steps_goal: 20,
  new_connection: 15,
  career_switch: 300,
} as const;

export type XPEventKey = keyof typeof XP_WEIGHTS;

/**
 * Calculates the specific amount of XP needed to go from (level) to (level + 1).
 * Modified to start at 250 and scale easier for the first 50 levels.
 */
function xpRequiredForNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  const previousLevels = safeLevel - 1;

  // Base XP for the first level transition (1 -> 2)
  const baseXP = 250; 
  
  let required: number;

  if (safeLevel <= 50) {
    // Easier progression for first 50 levels: Linear growth
    // Level 1: 250, Level 2: 350, Level 3: 450... Level 50: 5150
    required = baseXP + (previousLevels * 100);
  } else {
    // Standard RPG scaling for high levels (Level 51+)
    // Continues from the Level 50 cap with added polynomial complexity
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
  // Sum up all XP requirements for every level transition up to the target level
  for (let l = 1; l < safeLevel; l++) {
    total += xpRequiredForNextLevel(l);
  }
  return total;
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  // Keep increasing level until the total XP is less than the threshold for the next level
  while (totalXp >= calculateLevelThreshold(level + 1)) {
    level++;
    if (level >= 999) break;
  }
  return level;
}

export function xpToNextLevel(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  const nextThreshold = calculateLevelThreshold(currentLevel + 1);
  return Math.max(0, nextThreshold - totalXp);
}

export function xpProgressPercent(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
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