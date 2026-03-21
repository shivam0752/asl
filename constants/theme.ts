import type { StatName } from '../types'

export const COLORS = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  gold: '#F5C542',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  border: '#2A2A2A',
  error: '#FF5E5E',
  success: '#4ADE80',
} as const

export const STAT_COLORS: Record<StatName, string> = {
  STR: '#FF5E5E',
  INT: '#5EA8FF',
  WIS: '#A78BFA',
  VIT: '#4ADE80',
  CHA: '#F472B6',
  AGI: '#FB923C',
}

export const FONTS = {
  heading: 'Bangers_400Regular',
  body: 'Inter_400Regular',
  bodyBold: 'Inter_700Bold',
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
} as const