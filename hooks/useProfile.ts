import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProfile(userId: string | undefined) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: row, error: qError } = await supabase
        .from('profiles')
        .select('id, username, created_at')
        .eq('id', userId as string)
        .maybeSingle()
      if (qError) throw qError
      return row as { id: string; username: string | null; created_at: string } | null
    },
  })

  const updateUsername = useMutation({
    mutationFn: async ({ userId: uid, username }: { userId: string; username: string }) => {
      const trimmed = username.trim()
      if (!trimmed) throw new Error('Name cannot be empty.')

      // Update-first: some RLS setups may allow UPDATE but deny INSERT.
      const { error: updateError, data: updateData } = await supabase
        .from('profiles')
        .update({ username: trimmed })
        .eq('id', uid)
        .select('id')
        .maybeSingle()

      if (updateError) {
        // If update is denied, fall back to insert attempt so we still work
        // when the opposite policy is configured.
        const { error: insertError } = await supabase.from('profiles').insert({
          id: uid,
          username: trimmed,
          created_at: new Date().toISOString(),
        })
        if (insertError) throw insertError
        return
      }

      // If UPDATE succeeded but no row existed, INSERT.
      if (!updateData?.id) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: uid,
          username: trimmed,
          created_at: new Date().toISOString(),
        })
        if (insertError) throw insertError
      }
    },
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['profile', v.userId] })
    },
  })

  return {
    profile: data ?? null,
    loading: isLoading,
    error: error ? String(error) : null,
    refetch,
    updateUsername: updateUsername.mutateAsync,
    updating: updateUsername.isPending,
  }
}
