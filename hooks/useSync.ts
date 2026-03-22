import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncLinkedIn, syncGoogleFit, shouldSync } from '../utils/syncEngine';

export function useSync(userId: string | undefined) {
  const queryClient                   = useQueryClient();
  const [syncing, setSyncing]         = useState(false);
  const [lastSyncResult, setLastSync] = useState<string | null>(null);

  // Auto sync on mount if needed
  useEffect(() => {
    if (!userId) return;
    autoSync(userId);
  }, [userId]);

  async function autoSync(uid: string) {
    try {
      const needsLinkedIn  = await shouldSync(uid, 'linkedin');
      const needsGoogleFit = await shouldSync(uid, 'googlefit');

      if (needsLinkedIn) {
        console.log('Auto-syncing LinkedIn...');
        await syncLinkedIn(uid);
        queryClient.invalidateQueries({ queryKey: ['character', uid] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
      }

      if (needsGoogleFit) {
        console.log('Auto-syncing Google Fit...');
        await syncGoogleFit(uid);
        queryClient.invalidateQueries({ queryKey: ['character', uid] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
      }
    } catch (e) {
      console.log('Auto sync error:', e);
    }
  }

  async function manualSyncLinkedIn(): Promise<{
    success: boolean;
    xpGained: number;
    error?: string;
  }> {
    if (!userId) return { success: false, xpGained: 0 };
    setSyncing(true);
    try {
      const result = await syncLinkedIn(userId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['character', userId] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        setLastSync(`LinkedIn synced — +${result.xpGained} XP`);
      }
      return result;
    } finally {
      setSyncing(false);
    }
  }

  async function manualSyncGoogleFit(): Promise<{
    success: boolean;
    xpGained: number;
    error?: string;
  }> {
    if (!userId) return { success: false, xpGained: 0 };
    setSyncing(true);
    try {
      const result = await syncGoogleFit(userId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['character', userId] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        setLastSync(`Google Fit synced — +${result.xpGained} XP`);
      }
      return result;
    } finally {
      setSyncing(false);
    }
  }

  return {
    syncing,
    lastSyncResult,
    manualSyncLinkedIn,
    manualSyncGoogleFit,
    autoSync,
  };
}