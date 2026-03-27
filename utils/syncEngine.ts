import { supabase } from '../lib/supabase';
import { fetchLinkedInProfile } from '../lib/linkedin';
import { fetchGoogleFitData } from '../lib/googlefit';
import {
  calculateStatsFromRealData,
  calculateLinkedInXP,
  calculateGoogleFitXP,
  LinkedInRawData,
} from './statCalculator';
import { calculateLevel } from './xpEngine';
import { StatName } from '../types';

function parseSeniority(title: string): LinkedInRawData['seniorityLevel'] {
  const t = title.toLowerCase();
  if (t.includes('ceo') || t.includes('cto') || t.includes('vp') ||
      t.includes('president') || t.includes('chief')) return 'executive';
  if (t.includes('director') || t.includes('head of'))  return 'lead';
  if (t.includes('senior') || t.includes('sr.') ||
      t.includes('lead') || t.includes('principal'))     return 'senior';
  if (t.includes('manager') || t.includes('engineer'))  return 'mid';
  return 'entry';
}

export function parseLinkedInData(profileData: any): Partial<LinkedInRawData> {
  const yearsExp    = profileData?.yearsExperience    ?? 0;
  const connections = profileData?.connectionsCount   ?? profileData?.connections ?? 0;
  const certs       = profileData?.certificateCount   ?? profileData?.certifications ?? 0;
  const skills      = profileData?.endorsedSkillCount ?? profileData?.endorsedSkills ?? 0;
  const positions   = profileData?.positionsCount     ?? 1;
  const jobTitle    = profileData?.jobTitle           ?? '';

  return {
    yearsExperience:    yearsExp,
    seniorityLevel:     parseSeniority(jobTitle),
    connectionsCount:   connections,
    certificateCount:   certs,
    endorsedSkillCount: skills,
    positionsCount:     positions,
  };
}

async function updateStatsInDB(
  characterId: string,
  stats: Record<StatName, number>
): Promise<void> {
  const statNames: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];
  for (const statName of statNames) {
    const score = stats[statName];
    const { data, error } = await supabase
      .from('stats')
      .update({
        base_score:   score,
        active_score: score,
        last_updated: new Date().toISOString(),
      })
      .eq('character_id', characterId)
      .eq('stat_name', statName)
      .select();

    console.log(`=== ${statName}:`, score, 'rows updated:', data?.length, 'error:', error?.message);
  }
}

export async function syncLinkedIn(userId: string): Promise<{
  success: boolean;
  xpGained: number;
  stats?: Record<StatName, number>;
  error?: string;
}> {
  try {
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('access_token')
      .eq('user_id', userId)
      .in('provider', ['linkedin', 'linkedin_oidc'])
      .limit(1)
      .maybeSingle();

    console.log('=== LinkedIn token exists:', !!account?.access_token);

    if (!account?.access_token) {
      return { success: false, xpGained: 0, error: 'No LinkedIn token found' };
    }

    // Fetch what we can from LinkedIn API
    const apiProfile = await fetchLinkedInProfile(account.access_token);
    console.log('=== LinkedIn API profile:', JSON.stringify(apiProfile));

    // Get existing sync_data (has manual entry as base)
    const { data: syncRecord } = await supabase
      .from('sync_data')
      .select('linkedin_raw, googlefit_raw')
      .eq('user_id', userId)
      .single();

    const existingLinkedIn = syncRecord?.linkedin_raw ?? {};
    const googleFitData    = syncRecord?.googlefit_raw ?? {};

    // Merge: manual entry is base, LinkedIn API enhances it
    const linkedInMerged: Partial<LinkedInRawData> = {
      yearsExperience:    existingLinkedIn.yearsExperience    ?? 2,
      connectionsCount:   existingLinkedIn.connectionsCount   ?? 200,
      certificateCount:   existingLinkedIn.certificateCount   ?? 0,
      endorsedSkillCount: existingLinkedIn.endorsedSkillCount ?? 10,
      positionsCount:     existingLinkedIn.positionsCount     ?? 1,
      seniorityLevel:     parseSeniority(apiProfile.jobTitle ?? ''),
    };

    console.log('=== Merged LinkedIn data:', JSON.stringify(linkedInMerged));

    const newStats = calculateStatsFromRealData(linkedInMerged, googleFitData);
    const xpGained = calculateLinkedInXP(linkedInMerged);

    console.log('=== New stats:', JSON.stringify(newStats));
    console.log('=== XP gained:', xpGained);

    const { data: character } = await supabase
      .from('characters')
      .select('id, total_xp, career_xp')
      .eq('user_id', userId)
      .single();

    console.log('=== Character:', character?.id);

    if (!character) return { success: false, xpGained: 0, error: 'No character found' };

    await updateStatsInDB(character.id, newStats);

    const { error: syncDataError } = await supabase.from('sync_data').upsert({
      user_id:            userId,
      linkedin_raw:       linkedInMerged,
      last_linkedin_sync: new Date().toISOString(),
      updated_at:         new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (syncDataError) throw syncDataError;

    await supabase.from('xp_events').insert({
      user_id:       userId,
      event_type:    'career',
      event_name:    'LinkedIn profile synced',
      xp_gained:     xpGained,
      stat_affected: 'WIS',
      stat_delta:    newStats.WIS,
    });

    const newTotalXp = (character.total_xp ?? 0) + xpGained;
    const newLevel = calculateLevel(newTotalXp);

    await supabase
      .from('characters')
      .update({
        level:      newLevel,
        total_xp:   newTotalXp,
        career_xp:  (character.career_xp ?? 0) + xpGained,
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id);

    return { success: true, xpGained, stats: newStats };

  } catch (e: any) {
    console.log('=== syncLinkedIn error:', e);
    return { success: false, xpGained: 0, error: e?.message };
  }
}

export async function syncGoogleFit(userId: string): Promise<{
  success: boolean;
  xpGained: number;
  stats?: Record<StatName, number>;
  error?: string;
}> {
  try {
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('access_token')
      .eq('user_id', userId)
      .in('provider', ['googlefit', 'google'])
      .limit(1)
      .maybeSingle();

    console.log('=== Google Fit token exists:', !!account?.access_token);

    if (!account?.access_token) {
      return { success: false, xpGained: 0, error: 'No Google Fit token found' };
    }

    const fitData = await fetchGoogleFitData(account.access_token);
    console.log('=== Google Fit data:', JSON.stringify(fitData));

    const { data: syncRecord } = await supabase
      .from('sync_data')
      .select('linkedin_raw')
      .eq('user_id', userId)
      .single();

    const linkedInData = syncRecord?.linkedin_raw ?? {};

    const newStats = calculateStatsFromRealData(linkedInData, fitData);
    const xpGained = calculateGoogleFitXP(fitData);

    console.log('=== New stats from Google Fit:', JSON.stringify(newStats));
    console.log('=== XP gained:', xpGained);

    const { data: character } = await supabase
      .from('characters')
      .select('id, total_xp, fitness_xp')
      .eq('user_id', userId)
      .single();

    if (!character) return { success: false, xpGained: 0, error: 'No character found' };

    await updateStatsInDB(character.id, newStats);

    const { error: syncDataError } = await supabase.from('sync_data').upsert({
      user_id:             userId,
      googlefit_raw:       fitData,
      last_googlefit_sync: new Date().toISOString(),
      updated_at:          new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (syncDataError) throw syncDataError;

    await supabase.from('xp_events').insert({
      user_id:       userId,
      event_type:    'fitness',
      event_name:    `Google Fit synced — ${fitData.avgDailySteps} avg steps/day`,
      xp_gained:     xpGained,
      stat_affected: 'VIT',
      stat_delta:    newStats.VIT,
    });

    const newTotalXp = (character.total_xp ?? 0) + xpGained;
    const newLevel = calculateLevel(newTotalXp);

    await supabase
      .from('characters')
      .update({
        level:      newLevel,
        total_xp:   newTotalXp,
        fitness_xp: (character.fitness_xp ?? 0) + xpGained,
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id);

    return { success: true, xpGained, stats: newStats };

  } catch (e: any) {
    console.log('=== syncGoogleFit error:', e);
    return { success: false, xpGained: 0, error: e?.message };
  }
}

export async function shouldSync(
  userId: string,
  provider: 'linkedin' | 'googlefit'
): Promise<boolean> {
  const { data } = await supabase
    .from('sync_data')
    .select('last_linkedin_sync, last_googlefit_sync')
    .eq('user_id', userId)
    .single();

  if (!data) return true;

  const lastSync = provider === 'linkedin'
    ? data.last_linkedin_sync
    : data.last_googlefit_sync;

  if (!lastSync) return true;

  const hoursSinceSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
  return hoursSinceSync >= 24;
}