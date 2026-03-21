import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { assignClass } from '../utils/classAssignment'
import { calculateLevel } from '../utils/xpEngine'
import type { Character, Stat, StatName, ManualEntryData } from '../types'

export function useCharacter(userId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['character', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: character, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (charError) throw charError

      const { data: stats, error: statsError } = await supabase
        .from('stats')
        .select('*')
        .eq('character_id', character.id)
      if (statsError) throw statsError

      return {
        character: {
          id: character.id,
          userId: character.user_id,
          class: character.class,
          tier: character.tier,
          level: character.level,
          totalXp: character.total_xp,
          careerXp: character.career_xp,
          fitnessXp: character.fitness_xp,
          createdAt: character.created_at,
          updatedAt: character.updated_at,
        } as Character,
        stats: stats.map((s: any) => ({
          id: s.id,
          characterId: s.character_id,
          statName: s.stat_name,
          baseScore: s.base_score,
          activeScore: s.active_score,
          lastUpdated: s.last_updated,
        })) as Stat[],
      }
    },
  })

  return {
    character: data?.character ?? null,
    stats: data?.stats ?? [],
    loading: isLoading,
    error: error ? String(error) : null,
    refetch,
  }
}

export function useCreateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      statsData,
    }: {
      userId: string
      statsData: Record<StatName, number>
    }) => {
      const archetype = assignClass(statsData)

      const { data: character, error: charError } = await supabase
        .from('characters')
        .insert({
          user_id: userId,
          class: archetype,
          tier: 'Basic',
          level: 1,
          total_xp: 0,
          career_xp: 0,
          fitness_xp: 0,
        })
        .select()
        .single()
      if (charError) throw charError

      const statRows = (Object.keys(statsData) as StatName[]).map((statName) => ({
        character_id: character.id,
        stat_name: statName,
        base_score: statsData[statName],
        active_score: statsData[statName],
      }))

      const { error: statsError } = await supabase.from('stats').insert(statRows)
      if (statsError) throw statsError

      return character
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.userId] })
    },
  })
}

export function useUpdateStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      characterId,
      userId,
      stats,
    }: {
      characterId: string
      userId: string
      stats: Record<StatName, number>
    }) => {
      const updates = (Object.keys(stats) as StatName[]).map((statName) =>
        supabase
          .from('stats')
          .update({ active_score: stats[statName], last_updated: new Date().toISOString() })
          .eq('character_id', characterId)
          .eq('stat_name', statName)
      )
      await Promise.all(updates)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.userId] })
    },
  })
}