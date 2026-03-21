import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { calculateLevel } from '../utils/xpEngine'
import type { XPEvent, StatName, EventType } from '../types'

export function useXPEvents(userId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['xp_events', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data.map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        eventType: e.event_type as EventType,
        eventName: e.event_name,
        xpGained: e.xp_gained,
        statAffected: e.stat_affected as StatName | null,
        statDelta: e.stat_delta,
        createdAt: e.created_at,
      })) as XPEvent[]
    },
  })

  return {
    events: data ?? [],
    loading: isLoading,
    error: error ? String(error) : null,
  }
}

export function useLogXPEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      eventType,
      eventName,
      xpGained,
      statAffected,
      statDelta,
    }: {
      userId: string
      eventType: EventType
      eventName: string
      xpGained: number
      statAffected: StatName | null
      statDelta: number | null
    }) => {
      const { error: eventError } = await supabase.from('xp_events').insert({
        user_id: userId,
        event_type: eventType,
        event_name: eventName,
        xp_gained: xpGained,
        stat_affected: statAffected,
        stat_delta: statDelta,
      })
      if (eventError) throw eventError

      const { data: character, error: charError } = await supabase
        .from('characters')
        .select('total_xp, career_xp, fitness_xp')
        .eq('user_id', userId)
        .single()
      if (charError) throw charError

      const newTotalXp = character.total_xp + xpGained
      const newLevel = calculateLevel(newTotalXp)

      const { error: updateError } = await supabase
        .from('characters')
        .update({
          total_xp: newTotalXp,
          career_xp: eventType === 'career' ? character.career_xp + xpGained : character.career_xp,
          fitness_xp: eventType === 'fitness' ? character.fitness_xp + xpGained : character.fitness_xp,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      if (updateError) throw updateError
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['xp_events', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['character', variables.userId] })
    },
  })
}