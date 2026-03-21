import type { StatName, ManualEntryData } from '../types'

const cap = (value: number): number => Math.min(100, Math.max(0, Math.round(value)))

/**
 * Combines base and active scores into a total visible stat.
 * Base is weighted more heavily (70%) to reward long-term effort.
 */
export function calculateTotalStat(base: number, active: number): number {
  return cap(base * 0.7 + active * 0.3)
}

/**
 * INT — driven by education level, certifications, and endorsed skills.
 */
export function calculateINT(
  educationLevel: ManualEntryData['educationLevel'],
  certCount: number,
  endorsedSkills: number
): number {
  const educationWeights = { highschool: 0, bachelors: 2, masters: 3, phd: 4 }
  const eduScore = educationWeights[educationLevel] * 20
  const certScore = certCount * 5
  const skillScore = endorsedSkills / 2
  return cap(eduScore + certScore + skillScore)
}

/**
 * WIS — driven by years of experience and industry diversity.
 */
export function calculateWIS(yearsExperience: number, industryCount: number): number {
  return cap(yearsExperience * 3 + industryCount * 5)
}

/**
 * VIT — driven by daily steps, sleep quality, and resting heart rate.
 */
export function calculateVIT(
  avgDailySteps: number,
  avgSleepHours: number,
  restingHR: number = 70
): number {
  const stepsScore = avgDailySteps / 100
  const sleepScore = avgSleepHours * 5
  const hrScore = (30 - restingHR) / 2
  return cap(stepsScore + sleepScore + hrScore)
}

/**
 * STR — driven by workout frequency and total active minutes.
 */
export function calculateSTR(workoutDaysPerWeek: number, activeMinutes: number): number {
  return cap(workoutDaysPerWeek * 8 + activeMinutes / 10)
}

/**
 * CHA — driven by network size (logarithmic) and recommendations.
 */
export function calculateCHA(connections: number, recommendations: number): number {
  return cap(Math.log10(connections + 1) * 25 + recommendations * 3)
}

/**
 * AGI — driven by cardio consistency and career adaptability.
 */
export function calculateAGI(cardioSessions: number, careerSwitches: number): number {
  return cap(cardioSessions * 6 + careerSwitches * 10)
}

/**
 * Calculates all 6 stats from manual entry data.
 * Returns base scores — active scores start equal to base at creation.
 */
export function calculateAllStats(data: ManualEntryData): Record<StatName, number> {
  return {
    INT: calculateINT(data.educationLevel, data.certCount, data.endorsedSkills),
    WIS: calculateWIS(data.yearsExperience, data.industryCount),
    VIT: calculateVIT(data.avgDailySteps, data.avgSleepHours),
    STR: calculateSTR(data.workoutDaysPerWeek, data.avgDailySteps / 100),
    CHA: calculateCHA(data.connections, data.recommendations),
    AGI: calculateAGI(data.workoutDaysPerWeek * 4, data.careerSwitches),
  }
}