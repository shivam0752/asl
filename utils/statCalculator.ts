import { StatName } from '../types';

export interface LinkedInRawData {
  yearsExperience:   number;
  seniorityLevel:    'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  connectionsCount:  number;
  certificateCount:  number;
  endorsedSkillCount: number;
  positionsCount:    number;
}

export interface GoogleFitRawData {
  avgDailySteps:   number;
  weeklyWorkouts:  number;
  avgSleepHours:   number;
  avgHeartRate:    number;
  avgActiveMinutes: number;
}

// Seniority weights
const SENIORITY_WEIGHTS = {
  entry:     1,
  mid:       2,
  senior:    3,
  lead:      4,
  executive: 5,
};

/**
 * Calculate all 6 stats from real data
 * Each stat is scored 0-100
 */
export function calculateStatsFromRealData(
  linkedin: Partial<LinkedInRawData>,
  googlefit: Partial<GoogleFitRawData>
): Record<StatName, number> {
  const cap = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  // ── WIS — wisdom from experience ──────────────────────────────
  // Driven by: years experience + positions held + seniority
  const wisYears     = (linkedin.yearsExperience ?? 0) * 3;
  const wisPositions = (linkedin.positionsCount ?? 0) * 4;
  const wisSeniority = (SENIORITY_WEIGHTS[linkedin.seniorityLevel ?? 'entry']) * 6;
  const WIS = cap(wisYears + wisPositions + wisSeniority);

  // ── INT — intellect from learning ─────────────────────────────
  // Driven by: certifications + endorsed skills
  const intCerts  = (linkedin.certificateCount ?? 0) * 8;
  const intSkills = Math.min(40, (linkedin.endorsedSkillCount ?? 0) * 0.8);
  const INT = cap(intCerts + intSkills + 10); // +10 base

  // ── CHA — charisma from network ───────────────────────────────
  // Driven by: connections (logarithmic so it doesn't just reward spammers)
  const chaConnections = Math.log10((linkedin.connectionsCount ?? 1) + 1) * 22;
  const chaPositions   = (linkedin.positionsCount ?? 0) * 3;
  const CHA = cap(chaConnections + chaPositions);

  // ── STR — strength from workouts ──────────────────────────────
  // Driven by: weekly workouts + active minutes
  const strWorkouts = (googlefit.weeklyWorkouts ?? 0) * 10;
  const strMinutes  = Math.min(30, (googlefit.avgActiveMinutes ?? 0) / 3);
  const STR = cap(strWorkouts + strMinutes);

  // ── VIT — vitality from health ────────────────────────────────
  // Driven by: daily steps + sleep + heart rate
  const vitSteps = Math.min(40, (googlefit.avgDailySteps ?? 0) / 250);
  const vitSleep = Math.min(30, (googlefit.avgSleepHours ?? 0) * 3.5);
  const vitHR    = Math.min(30, Math.max(0, (100 - (googlefit.avgHeartRate ?? 70)) * 0.5));
  const VIT = cap(vitSteps + vitSleep + vitHR);

  // ── AGI — agility from cardio + career speed ──────────────────
  // Driven by: active minutes + positions (career pivots)
  const agiCardio    = Math.min(50, (googlefit.avgActiveMinutes ?? 0) * 0.5);
  const agiPositions = Math.min(30, (linkedin.positionsCount ?? 0) * 6);
  const agiSteps     = Math.min(20, (googlefit.avgDailySteps ?? 0) / 500);
  const AGI = cap(agiCardio + agiPositions + agiSteps);

  return { WIS, INT, CHA, STR, VIT, AGI };
}

/**
 * Calculate XP gained from LinkedIn data
 */
export function calculateLinkedInXP(linkedin: Partial<LinkedInRawData>): number {
  let xp = 50; // base for connecting
  xp += (linkedin.yearsExperience ?? 0) * 10;
  xp += (linkedin.certificateCount ?? 0) * 30;
  xp += (linkedin.positionsCount ?? 0) * 20;
  xp += Math.min(100, (linkedin.connectionsCount ?? 0) / 10);
  xp += (linkedin.endorsedSkillCount ?? 0) * 2;
  return Math.round(Math.min(1000, xp));
}

/**
 * Calculate XP gained from Google Fit data
 */
export function calculateGoogleFitXP(googlefit: Partial<GoogleFitRawData>): number {
  let xp = 50; // base for connecting
  xp += Math.min(100, (googlefit.avgDailySteps ?? 0) / 100);
  xp += (googlefit.weeklyWorkouts ?? 0) * 20;
  xp += Math.min(50, (googlefit.avgActiveMinutes ?? 0) * 0.5);
  return Math.round(Math.min(500, xp));
}