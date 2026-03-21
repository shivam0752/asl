export type StatName = 'STR' | 'INT' | 'WIS' | 'VIT' | 'CHA' | 'AGI'

export type Tier = 'Basic' | 'Intermediate'

export type ClassArchetype =
  | 'Grinder'
  | 'Ironclad'
  | 'Ascendant'
  | 'Tactician'
  | 'Drifter'
  | 'Sage'

export type EventType = 'career' | 'fitness'

export interface UserProfile {
  id: string
  username: string | null
  createdAt: string
}

export interface Stat {
  id: string
  characterId: string
  statName: StatName
  baseScore: number
  activeScore: number
  lastUpdated: string
}

export interface Character {
  id: string
  userId: string
  class: ClassArchetype
  tier: Tier
  level: number
  totalXp: number
  careerXp: number
  fitnessXp: number
  createdAt: string
  updatedAt: string
}

export interface XPEvent {
  id: string
  userId: string
  eventType: EventType
  eventName: string
  xpGained: number
  statAffected: StatName | null
  statDelta: number | null
  createdAt: string
}

export interface ConnectedAccount {
  id: string
  userId: string
  provider: 'linkedin' | 'googlefit'
  accessToken: string | null
  refreshToken: string | null
  expiresAt: string | null
  createdAt: string
}

export interface ManualEntryData {
  avgDailySteps: number
  workoutDaysPerWeek: number
  avgSleepHours: number
  yearsExperience: number
  educationLevel: 'highschool' | 'bachelors' | 'masters' | 'phd'
  industryCount: number
  certCount: number
  endorsedSkills: number
  connections: number
  recommendations: number
  careerSwitches: number
}